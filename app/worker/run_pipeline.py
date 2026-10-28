import os
import httpx
import asyncio
import spacy
from supabase import create_client
from tenacity import retry, wait_exponential, stop_after_attempt

# --- CONFIGURATION ---
CONGRESS_API_KEY = os.environ.get("CONGRESS_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
BASE = "https://api.congress.gov/v3"

@retry(wait=wait_exponential(min=1, max=20), stop=stop_after_attempt(4))
async def get_json(client, path, params=None):
    payload = {"api_key": CONGRESS_API_KEY, "format": "json"}
    if params:
        payload.update(params)
    res = await client.get(f"{BASE}{path}", params=payload, timeout=30)
    res.raise_for_status()
    return res.json()

async def ingest_members(client):
    print("Fetching Members...")
    data = await get_json(client, "/member", {"limit": 250, "offset": 0})
    members = data.get("members", [])
    rows = [{"bioguide_id": m["bioguideId"], "full_name": m.get("name", ""), "party": m.get("partyName"), "state": m.get("state")} for m in members]
    if rows:
        supabase.table("members").upsert(rows, on_conflict="bioguide_id").execute()

async def ingest_bills(client, congress, bill_type):
    print(f"Fetching Bills ({bill_type})...")
    offset = 0
    while offset < 500: # Limit to 500 for speed
        data = await get_json(client, f"/bill/{congress}/{bill_type}", {"limit": 250, "offset": offset})
        bills = data.get("bills", [])
        if not bills:
            break
        rows = [{
            "congress": b["congress"],
            "bill_type": b["type"].lower(),
            "number": int(b["number"]),
            "title": b.get("title", ""),
            "introduced_date": b.get("introducedDate"),
            "latest_action": (b.get("latestAction") or {}).get("text")
        } for b in bills]
        supabase.table("bills").upsert(rows, on_conflict="congress,bill_type,number").execute()
        offset += 250
        await asyncio.sleep(0.5)

async def main():
    print("Starting pipeline...")
    
    # 1. Get Data
    async with httpx.AsyncClient() as client:
        await ingest_members(client)
        await ingest_bills(client, 119, "hr")
        await ingest_bills(client, 119, "s")

    print("Data ingestion complete!")
    # Note: Skipping NLP and Correlation for this first successful run to ensure it works.

if __name__ == "__main__":
    asyncio.run(main())
