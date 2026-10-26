import asyncio
import httpx
from tenacity import retry, wait_exponential, stop_after_attempt
from config import settings
from db import upsert

BASE = settings.congress_api_base

@retry(wait=wait_exponential(min=1, max=20), stop=stop_after_attempt(4))
async def get_json(client: httpx.AsyncClient, path: str, params: dict | None = None):
    payload = {"api_key": settings.congress_api_key, "format": "json"}
    if params:
        payload.update(params)
    response = await client.get(f"{BASE}{path}", params=payload, timeout=30)
    response.raise_for_status()
    return response.json()

async def ingest_members(client: httpx.AsyncClient):
    offset = 0
    while True:
        data = await get_json(client, "/member", {"limit": 250, "offset": offset})
        members = data.get("members", [])
        if not members:
            break
        rows = []
        for member in members:
            rows.append({
                "bioguide_id": member["bioguideId"],
                "full_name": member.get("name", ""),
                "party": member.get("partyName"),
                "state": member.get("state"),
                "chamber": "senate" if member.get("terms", {}).get("item", [{}])[-1].get("chamber") == "Senate" else "house",
            })
        upsert("members", rows, on_conflict="bioguide_id")
        if len(members) < 250:
            break
        offset += 250
        await asyncio.sleep(0.2)

async def ingest_bills(client: httpx.AsyncClient, congress: int, bill_type: str = "hr"):
    offset = 0
    while True:
        data = await get_json(
            client,
            f"/bill/{congress}/{bill_type}",
            {"limit": 250, "offset": offset, "sort": "updateDate+desc"},
        )
        bills = data.get("bills", [])
        if not bills:
            break

        bill_rows = []
        for bill in bills:
            bill_rows.append({
                "congress": bill["congress"],
                "bill_type": bill["type"].lower(),
                "number": int(bill["number"]),
                "title": bill.get("title", ""),
                "introduced_date": bill.get("introducedDate"),
                "sponsor_bioguide_id": (bill.get("sponsors") or [{}])[0].get("bioguideId"),
                "latest_action": (bill.get("latestAction") or {}).get("text"),
                "latest_action_date": (bill.get("latestAction") or {}).get("actionDate"),
            })
        upsert("bills", bill_rows, on_conflict="congress,bill_type,number")

        for bill in bills:
            await ingest_bill_detail(client, bill)

        if len(bills) < 250:
            break
        offset += 250
        await asyncio.sleep(0.2)

async def ingest_bill_detail(client: httpx.AsyncClient, bill: dict):
    congress = bill["congress"]
    bill_type = bill["type"].lower()
    number = int(bill["number"])
    path = f"/bill/{congress}/{bill_type}/{number}"

    detail = await get_json(client, path)
    record = detail.get("bill", {})
    summary = ""
    try:
        summaries = await get_json(client, f"{path}/summaries")
        items = summaries.get("summaries", [])
        if items:
            summary = items[0].get("text", "")[:20000]
    except Exception:
        pass

    subjects = []
    try:
        subjects_data = await get_json(client, f"{path}/subjects")
        subjects = [item["name"] for item in subjects_data.get("subjects", [])]
    except Exception:
        pass

    text_url = None
    try:
        text_data = await get_json(client, f"{path}/text")
        versions = text_data.get("textVersions", [])
        if versions:
            formats = versions[0].get("formats", [])
            for fmt in formats:
                if fmt.get("type") == "Formatted Text":
                    text_url = fmt.get("url")
                    break
    except Exception:
        pass

    upsert("bills", [{
        "congress": congress,
        "bill_type": bill_type,
        "number": number,
        "title": record.get("title", bill.get("title", "")),
        "introduced_date": record.get("introducedDate"),
        "sponsor_bioguide_id": (record.get("sponsors") or [{}])[0].get("bioguideId"),
        "status": record.get("policyArea", {}).get("name") if record.get("policyArea") else None,
        "latest_action": (record.get("latestAction") or {}).get("text"),
        "latest_action_date": (record.get("latestAction") or {}).get("actionDate"),
        "summary": summary or record.get("summary", ""),
        "subjects": subjects,
        "text_url": text_url,
    }], on_conflict="congress,bill_type,number")

    actions = []
    try:
        actions_data = await get_json(client, f"{path}/actions")
        for action in actions_data.get("actions", [])[:200]:
            actions.append({
                "bill_id": None,
                "action_date": action.get("actionDate"),
                "action_code": action.get("actionCode"),
                "action_text": action.get("text"),
                "source_system": action.get("sourceSystem", {}).get("name") if action.get("sourceSystem") else None,
            })
    except Exception:
        pass

    cosponsors = []
    try:
        cosponsor_data = await get_json(client, f"{path}/cosponsors")
        for person in cosponsor_data.get("cosponsors", []):
            cosponsors.append({
                "bioguide_id": person["bioguideId"],
                "sponsored_at": person.get("sponsorshipDate"),
                "withdrawn_at": person.get("sponsorshipWithdrawnDate"),
            })
    except Exception:
        pass

    # Resolve bill_id for child rows in a separate update pass.
    rows = upsert("bills", [], on_conflict=None)  # no-op keeps types clear
    bill_lookup = (
        __import__("db").supabase.table("bills")
        .select("id")
        .eq("congress", congress)
        .eq("bill_type", bill_type)
        .eq("number", number)
        .single()
        .execute()
    )
    bill_id = bill_lookup.data["id"]

    if actions:
        for row in actions:
            row["bill_id"] = bill_id
        upsert("bill_actions", actions)

    if cosponsors:
        for row in cosponsors:
            row["bill_id"] = bill_id
        upsert("bill_cosponsors", cosponsors, on_conflict="bill_id,bioguide_id")
