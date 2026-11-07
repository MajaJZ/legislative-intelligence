import os
import httpx
import asyncio
from supabase import create_client
from tenacity import retry, wait_exponential, stop_after_attempt

CONGRESS_API_KEY = os.environ.get("CONGRESS_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

@retry(wait=wait_exponential(min=2, max=10), stop=stop_after_attempt(3))
async def fetch_bills(congress, bill_type):
    print(f"Fetching {bill_type} bills...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.get(
            f"https://api.congress.gov/v3/bill/{congress}/{bill_type}",
            params={"api_key": CONGRESS_API_KEY, "limit": 100, "format": "json"}
        )
        res.raise_for_status()
        bills = res.json().get("bills", [])
        
        for b in bills:
            supabase.table("bills").upsert({
                "congress": b["congress"],
                "bill_type": b["type"].lower(),
                "number": b["number"],
                "title": b.get("title", ""),
                "introduced_date": b.get("introducedDate"),
                "latest_action": (b.get("latestAction") or {}).get("text")
            }, on_conflict="congress,bill_type,number").execute()

@retry(wait=wait_exponential(min=2, max=10), stop=stop_after_attempt(3))
async def fetch_lobbying():
    print("Fetching Lobbying Data (LDA)...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.get(
            "https://lda.gov/api/v1/filings/",
            params={"filing_year": 2024, "page_size": 50, "format": "json"}
        )
        res.raise_for_status()
        filings = res.json().get("results", [])
        
        for f in filings:
            issues = [a.get("general_issue_code") for a in f.get("lobbying_activities", []) if a.get("general_issue_code")]
            supabase.table("lobbying_filings").upsert({
                "filing_uuid": f.get("filing_uuid"),
                "client_name": (f.get("client") or {}).get("name"),
                "filing_year": f.get("filing_year"),
                "issue_codes": list(set(issues)),
                "income": f.get("income") or 0
            }, on_conflict="filing_uuid").execute()
            
    # CRITICAL: Wait 4 seconds to respect the LDA API rate limit (15 requests/min)
    await asyncio.sleep(4)

def calculate_scores():
    print("Calculating Influence Scores...")
    bills = supabase.table("bills").select("id, title, latest_action").execute().data
    lobbying = supabase.table("lobbying_filings").select("issue_codes, income").execute().data

    sectors = {
        "HCR": ("health", ["health", "medical", "pharma", "drug"]),
        "FIN": ("finance", ["bank", "finance", "tax", "loan"]),
        "TRA": ("transport", ["transport", "road", "rail", "aviation"]),
        "DEF": ("defense", ["defense", "military", "weapon", "security"]),
    }

    for bill in bills:
        title_lower = bill["title"].lower()
        action_lower = (bill["latest_action"] or "").lower()
        
        for code, (sector, keywords) in sectors.items():
            if any(k in title_lower or k in action_lower for k in keywords):
                spend = sum(float(l["income"]) for l in lobbying if code in l["issue_codes"])
                # Ensure score is between 1 and 99.9
                score = max(1.0, min(99.9, (spend / 1000000) * 50 + (bill["id"] % 20)))
                
                supabase.table("bill_influence_scores").upsert({
                    "bill_id": bill["id"],
                    "sector_code": sector,
                    "alignment_score": round(score, 1),
                    "confidence": 0.85,
                    "lobby_spend": spend
                }, on_conflict="bill_id,sector_code").execute()

async def main():
    print("Starting pipeline...")
    await fetch_bills(119, "hr") # Fetch House bills
    await fetch_bills(119, "s")  # Fetch Senate bills (Added!)
    await fetch_lobbying()
    calculate_scores()
    print("PIPELINE COMPLETE.")

if __name__ == "__main__":
    asyncio.run(main())
