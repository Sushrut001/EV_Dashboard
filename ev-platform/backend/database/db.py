"""
Database layer: SQLite connection management and schema creation.
Uses plain sqlite3 + pandas for simplicity (no heavy ORM needed for this scope).
"""
import sqlite3
from pathlib import Path
import pandas as pd

DB_PATH = Path(__file__).parent.parent / "data" / "ev_platform.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS charging_sessions (
    session_id TEXT PRIMARY KEY,
    station_id TEXT NOT NULL,
    station_name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    total_chargers INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    duration_minutes REAL NOT NULL,
    energy_kwh REAL NOT NULL,
    charger_type TEXT,
    vehicle_model TEXT,
    cost_inr REAL
);
CREATE INDEX IF NOT EXISTS idx_station ON charging_sessions(station_id);
CREATE INDEX IF NOT EXISTS idx_start_time ON charging_sessions(start_time);
"""


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = get_connection()
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()


def load_csv_into_db(csv_path: str, replace: bool = True):
    """Load a CSV file of charging sessions into the database, after cleaning."""
    df = pd.read_csv(csv_path)
    df = clean_dataframe(df)

    conn = get_connection()
    if replace:
        conn.execute("DELETE FROM charging_sessions")
    df.to_sql("charging_sessions", conn, if_exists="append", index=False)
    conn.commit()
    conn.close()
    return len(df)


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Validate, handle missing values, and remove duplicates from raw session data."""
    required_cols = [
        "session_id", "station_id", "station_name", "latitude", "longitude",
        "total_chargers", "start_time", "duration_minutes", "energy_kwh",
    ]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")

    # Drop exact duplicate rows and duplicate session_ids
    df = df.drop_duplicates()
    df = df.drop_duplicates(subset=["session_id"], keep="first")

    # Drop rows with missing critical fields
    df = df.dropna(subset=["session_id", "station_id", "start_time", "energy_kwh", "duration_minutes"])

    # Fill optional fields
    if "charger_type" not in df.columns:
        df["charger_type"] = "Unknown"
    if "vehicle_model" not in df.columns:
        df["vehicle_model"] = "Unknown"
    if "cost_inr" not in df.columns:
        df["cost_inr"] = (df["energy_kwh"] * 9.5).round(2)
    df["charger_type"] = df["charger_type"].fillna("Unknown")
    df["vehicle_model"] = df["vehicle_model"].fillna("Unknown")
    df["cost_inr"] = df["cost_inr"].fillna(df["energy_kwh"] * 9.5)

    # Type coercion and sanity filtering
    df["duration_minutes"] = pd.to_numeric(df["duration_minutes"], errors="coerce")
    df["energy_kwh"] = pd.to_numeric(df["energy_kwh"], errors="coerce")
    df["total_chargers"] = pd.to_numeric(df["total_chargers"], errors="coerce").fillna(1).astype(int)
    df = df.dropna(subset=["duration_minutes", "energy_kwh"])
    df = df[(df["duration_minutes"] > 0) & (df["energy_kwh"] > 0)]

    return df.reset_index(drop=True)
