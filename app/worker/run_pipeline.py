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
    await ingest_filings(year=2025, max_pages=3) # Limit pages to keep it fast for testing

    # 3. Fetch Campaign Contributions (FEC)
    print("Fetching FEC Contributions...")
    # We skip this for the first test to avoid rate limits, 
    # but you can uncomment it later.
    # await ingest_all(candidate_ids=["H0NY01234"], cycle=2024) 

    # 4. Run NLP Analysis
    print("Processing Bill Text (NLP)...")
    process_bills(limit=50)

    # 5. Compute Correlation Scores
    print("Calculating Influence Scores...")
    compute_scores()

    print("Pipeline complete!")

if __name__ == "__main__":
    asyncio.run(main())
