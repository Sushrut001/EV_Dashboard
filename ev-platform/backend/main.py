"""
EV Charging Station Intelligence Platform — FastAPI backend entry point.
On startup, initializes the SQLite schema and loads the sample dataset
if the database is empty.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from backend.database.db import init_db, load_csv_into_db, get_connection
from backend.api.routes import router

app = FastAPI(title="EV Charging Station Intelligence Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.on_event("startup")
def startup():
    init_db()
    conn = get_connection()
    count = conn.execute("SELECT COUNT(*) FROM charging_sessions").fetchone()[0]
    conn.close()
    if count == 0:
        sample_csv = Path(__file__).parent / "data" / "charging_sessions.csv"
        if sample_csv.exists():
            n = load_csv_into_db(str(sample_csv))
            print(f"Loaded {n} sample sessions into database.")


@app.get("/")
def root():
    return {"status": "ok", "service": "EV Charging Station Intelligence Platform API"}
