from fastapi import FastAPI, Header, HTTPException
from config import settings
from analyze.correlate import compute_scores

app = FastAPI(title="Legislative Intelligence Worker")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/recompute")
def recompute(x_worker_secret: str = Header(default="")):
    if x_worker_secret != settings.worker_shared_secret:
        raise HTTPException(status_code=401, detail="unauthorized")
    compute_scores()
    return {"status": "computed"}
