import asyncio
import httpx
from tenacity import retry, wait_exponential, stop_after_attempt
from config import settings
from db import upsert

BASE = settings.lda_api_base

@retry(wait=wait_exponential(min=2, max=30), stop=stop_after_attempt(5))
async def get_json(client: httpx.AsyncClient, path: str, params: dict):
    headers = {}
    if settings.lda_api_key:
        headers["Authorization"] = f"Token {settings.lda_api_key}"
    response = await client.get(f"{BASE}{path}", params=params, headers=headers, timeout=40)
    response.raise_for_status()
    return response.json()

async def ingest_filings(year: int, max_pages: int = 40):
    async with httpx.AsyncClient() as client:
        page = 1
        while page <= max_pages:
            data = await get_json(client, "/filings/", {
                "filing_year": year,
                "page": page,
                "page_size": 100,
                "format": "json",
                "ordering": "-dt_posted",
            })
            results = data.get("results", [])
            if not results:
                break

            rows = []
            for filing in results:
                activities = filing.get("lobbying_activities", []) or []
                issue_codes = [a.get("general_issue_code") for a in activities if a.get("general_issue_code")]
                descriptions = [a.get("description") for a in activities if a.get("description")]
                rows.append({
                    "filing_uuid": filing.get("filing_uuid"),
                    "registrant_name": (filing.get("registrant") or {}).get("name"),
                    "client_name": (filing.get("client") or {}).get("name"),
                    "filing_year": filing.get("filing_year"),
                    "filing_period": filing.get("filing_period"),
                    "income": filing.get("income"),
                    "expenses": filing.get("expenses"),
                    "issue_codes": list(set(issue_codes)),
                    "issue_descriptions": descriptions,
                    "raw": filing,
                })
            upsert("lobbying_filings", rows, on_conflict="filing_uuid")

            if len(results) < 100:
                break
            page += 1
            await asyncio.sleep(4.0)  # anonymous rate limit is 15/minute
