from supabase import create_client, Client
from config import settings

supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key,
)

def upsert(table: str, rows: list[dict], on_conflict: str | None = None):
    if not rows:
        return
    query = supabase.table(table).upsert(rows)
    if on_conflict:
        query = supabase.table(table).upsert(rows, on_conflict=on_conflict)
    return query.execute()
