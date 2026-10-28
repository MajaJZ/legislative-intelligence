import sys
import os

# This line forces Python to look in the current folder for 'ingest' and 'analyze'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
import httpx
from ingest.congress import ingest_members, ingest_bills
from ingest.lda import ingest_filings
from ingest.fec import ingest_all
from analyze.nlp import process_bills
from analyze.correlate import compute_scores

async def main():
    print("Starting data ingestion pipeline...")
    
    # 1. Fetch Members and Bills
    async with httpx.AsyncClient() as client:
        print("Fetching Members...")
        await ingest_members(client)
        print("Fetching Bills (HR)...")
        await ingest_bills(client, congress=119, bill_type="hr")
        print("Fetching Bills (S)...")
        await ingest_bills(client, congress=119, bill_type="s")

    # 2. Fetch Lobbying Data (Senate LDA)
    print("Fetching Lobbying Filings...")
    await ingest_filings(year=2025, max_pages=3)

    # 3. Run NLP Analysis
    print("Processing Bill Text (NLP)...")
    process_bills(limit=50)

    # 4. Compute Correlation Scores
    print("Calculating Influence Scores...")
    compute_scores()

    print("Pipeline complete!")

if __name__ == "__main__":
    asyncio.run(main())
