import asyncio
import re
import httpx
from tenacity import retry, wait_exponential, stop_after_attempt
from config import settings
from db import supabase, upsert

BASE = settings.fec_api_base

@retry(wait=wait_exponential(min=1, max=20), stop=stop_after_attempt(4))
async def get_json(client: httpx.AsyncClient, path: str, params: dict):
    payload = {"api_key": settings.fec_api_key, "per_page": 100}
    payload.update(params)
    response = await client.get(f"{BASE}{path}", params=payload, timeout=40)
    response.raise_for_status()
    return response.json()

def sector_for_employer(employer: str | None) -> str | None:
    if not employer:
        return None
    text = employer.lower()
    sectors = supabase.table("sectors").select("code, employer_keywords").execute().data
    best = None
    best_hits = 0
    for sector in sectors:
        hits = sum(1 for keyword in sector["employer_keywords"] if keyword in text)
        if hits > best_hits:
            best = sector["code"]
            best_hits = hits
    return best

async def ingest_candidate_contributions(
    client: httpx.AsyncClient,
    candidate_id: str,
    cycle: int,
    max_pages: int = 20,
):
    page = 1
    while page <= max_pages:
        data = await get_json(client, "/schedules/schedule_a/", {
            "candidate_id": candidate_id,
            "two_year_transaction_period": cycle,
            "sort": "-contribution_receipt_date",
            "page": page,
        })
        results = data.get("results", [])
        if not results:
            break

        rows = []
        for item in results:
            employer = item.get("contributor_employer")
            rows.append({
                "candidate_id": candidate_id,
                "committee_id": item.get("committee_id"),
                "contributor_name": item.get("contributor_name"),
                "contributor_employer": employer,
                "sector_code": sector_for_employer(employer),
                "amount": item.get("contribution_receipt_amount", 0),
                "contribution_date": item.get("contribution_receipt_date"),
                "cycle": cycle,
                "source_sub_id": item.get("sub_id"),
            })
        upsert("contributions", rows, on_conflict="source_sub_id")

        if len(results) < 100:
            break
        page += 1
        await asyncio.sleep(0.5)

async def ingest_all(candidate_ids: list[str], cycle: int):
    async with httpx.AsyncClient() as client:
        for candidate_id in candidate_ids:
            await ingest_candidate_contributions(client, candidate_id, cycle)
