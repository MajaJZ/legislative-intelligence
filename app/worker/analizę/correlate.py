import math
from collections import defaultdict
from datetime import date
from scipy.stats import fisher_exact
from db import supabase, upsert

METHOD_VERSION = "2026.1"

def percentile_rank(values: list[float], value: float) -> float:
    if not values:
        return 0.0
    below = sum(1 for v in values if v < value)
    equal = sum(1 for v in values if v == value)
    return (below + 0.5 * equal) / len(values)

def compute_scores():
    bills = supabase.table("bills").select("id,title,sponsor_bioguide_id,status,latest_action,subjects,topic_terms").execute().data
    sectors = supabase.table("sectors").select("code,name,lda_issue_codes").execute().data
    filings = supabase.table("lobbying_filings").select("issue_codes,income,expenses,bill_id").execute().data
    contributions = supabase.table("contributions").select("candidate_id,sector_code,amount").execute().data

    # Sponsor candidate ids
    members = supabase.table("members").select("bioguide_id,fec_candidate_id").execute().data
    candidate_by_member = {m["bioguide_id"]: m["fec_candidate_id"] for m in members if m.get("fec_candidate_id")}

    # Sum contributions by candidate and sector
    contrib_by_candidate_sector = defaultdict(float)
    for c in contributions:
        if c.get("sector_code"):
            contrib_by_candidate_sector[(c["candidate_id"], c["sector_code"])] += float(c.get("amount") or 0)

    # Lobby spend by sector, from issue codes
    sector_issue_codes = {s["code"]: set(s["lda_issue_codes"]) for s in sectors}
    lobby_by_sector = defaultdict(float)
    for f in filings:
        codes = set(f.get("issue_codes") or [])
        spend = float(f.get("income") or 0) + float(f.get("expenses") or 0)
        for sector_code, issue_codes in sector_issue_codes.items():
            if codes & issue_codes:
                lobby_by_sector[sector_code] += spend

    # Build per-bill sector rows
    rows = []
    for bill in bills:
        sponsor = bill.get("sponsor_bioguide_id")
        candidate = candidate_by_member.get(sponsor) if sponsor else None
        text = " ".join([bill.get("title") or ""] + (bill.get("subjects") or []) + (bill.get("topic_terms") or [])).lower()

        for sector in sectors:
            code = sector["code"]
            keyword_hits = sum(1 for keyword in sector.get("employer_keywords", []) if keyword in text) if sector.get("employer_keywords") else 0
            issue_hit = any(issue.lower() in text for issue in sector["lda_issue_codes"])
            if not issue_hit and keyword_hits == 0:
                continue

            contribution_total = contrib_by_candidate_sector.get((candidate, code), 0.0) if candidate else 0.0
            lobby_spend = lobby_by_sector.get(code, 0.0)

            rows.append({
                "bill_id": bill["id"],
                "sector_code": code,
                "contribution_total": contribution_total,
                "lobby_spend": lobby_spend,
                "relevance": 1.0 if issue_hit else 0.5,
            })

    # Normalize by sector
    by_sector = defaultdict(list)
    for row in rows:
        by_sector[row["sector_code"]].append(row)

    out = []
    for sector_code, sector_rows in by_sector.items():
        contrib_values = [r["contribution_total"] for r in sector_rows]
        lobby_values = [r["lobby_spend"] for r in sector_rows]
        for row in sector_rows:
            contrib_pct = percentile_rank(contrib_values, row["contribution_total"])
            lobby_pct = percentile_rank(lobby_values, row["lobby_spend"])
            score = 100 * (0.6 * contrib_pct + 0.4 * lobby_pct)
            sample_size = sum(1 for r in sector_rows if r["contribution_total"] > 0)
            confidence = min(1.0, sample_size / 30.0) * (1.0 if row["relevance"] == 1.0 else 0.6)
            out.append({
                "bill_id": row["bill_id"],
                "sector_code": sector_code,
                "alignment_score": round(score, 2),
                "confidence": round(confidence, 2),
                "lobby_spend": round(row["lobby_spend"], 2),
                "contribution_total": round(row["contribution_total"], 2),
                "sample_size": sample_size,
                "method_version": METHOD_VERSION,
            })

    upsert("bill_influence_scores", out, on_conflict="bill_id,sector_code,method_version")

def outcome_association(sector_code: str, high_cutoff: float = 70.0):
    scores = (
        supabase.table("bill_influence_scores")
        .select("bill_id,alignment_score")
        .eq("sector_code", sector_code)
        .eq("method_version", METHOD_VERSION)
        .execute()
        .data
    )
    bill_ids = [s["bill_id"] for s in scores]
    if not bill_ids:
        return None

    bills = supabase.table("bills").select("id,status,latest_action").in_("id", bill_ids).execute().data
    status_by_id = {b["id"]: b for b in bills}

    high_pass = high_total = low_pass = low_total = 0
    for score in scores:
        bill = status_by_id.get(score["bill_id"])
        if not bill:
            continue
        action = (bill.get("latest_action") or "").lower()
        became_law = "became public law" in action or "signed by president" in action
        if score["alignment_score"] >= high_cutoff:
            high_total += 1
            high_pass += int(became_law)
        else:
            low_total += 1
            low_pass += int(became_law)

    if high_total < 30 or low_total < 30:
        return {"suppressed": True, "reason": "Sample below 30 per group", "high_total": high_total, "low_total": low_total}

    table = [[high_pass, high_total - high_pass], [low_pass, low_total - low_pass]]
    odds_ratio, p_value = fisher_exact(table)
    return {
        "sector_code": sector_code,
        "high_group_pass_rate": high_pass / high_total,
        "low_group_pass_rate": low_pass / low_total,
        "odds_ratio": odds_ratio,
        "p_value": p_value,
        "high_n": high_total,
        "low_n": low_total,
        "note": "Association only. Not evidence of causation.",
    }
