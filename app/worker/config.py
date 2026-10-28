from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    congress_api_key: str
    fec_api_key: str
    lda_api_key: str | None = None
    supabase_url: str
    supabase_service_role_key: str
    worker_shared_secret: str
    congress_api_base: str = "https://api.congress.gov/v3"
    fec_api_base: str = "https://api.open.fec.gov/v1"
    lda_api_base: str = "https://lda.gov/api/v1"

    class Config:
        env_file = ".env"

settings = Settings()
