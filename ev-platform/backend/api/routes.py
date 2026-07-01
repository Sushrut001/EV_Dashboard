"""All REST API routes for the EV Charging Intelligence Platform."""
from fastapi import APIRouter, UploadFile, File, HTTPException
import io
import pandas as pd

from backend.analytics import engine
from backend.database.db import get_connection, clean_dataframe

router = APIRouter()


@router.get("/kpis")
def kpis():
    df = engine.load_sessions_df()
    return engine.get_kpis(df)


@router.get("/stations")
def stations():
    df = engine.load_sessions_df()
    return engine.get_station_stats(df)


@router.get("/map")
def map_data():
    df = engine.load_sessions_df()
    stats = engine.get_station_stats(df)
    return [
        {
            "station_id": s["station_id"],
            "station_name": s["station_name"],
            "latitude": s["latitude"],
            "longitude": s["longitude"],
            "total_chargers": s["total_chargers"],
            "utilization_pct": s["utilization_pct"],
            "total_sessions": s["total_sessions"],
            "avg_duration_minutes": s["avg_duration_minutes"],
            "status": s["status"],
        }
        for s in stats
    ]


@router.get("/charts/daily-sessions")
def chart_daily_sessions():
    df = engine.load_sessions_df()
    return engine.get_daily_sessions(df)


@router.get("/charts/monthly-trends")
def chart_monthly_trends():
    df = engine.load_sessions_df()
    return engine.get_monthly_trends(df)


@router.get("/charts/peak-hours")
def chart_peak_hours():
    df = engine.load_sessions_df()
    return engine.get_peak_hours(df)


@router.get("/charts/day-of-week")
def chart_day_of_week():
    df = engine.load_sessions_df()
    return engine.get_day_of_week_usage(df)


@router.get("/charts/energy-consumption")
def chart_energy_consumption():
    df = engine.load_sessions_df()
    return engine.get_energy_consumption(df)


@router.get("/charts/station-utilization")
def chart_station_utilization():
    df = engine.load_sessions_df()
    return engine.get_station_utilization_chart(df)


@router.get("/insights")
def insights():
    df = engine.load_sessions_df()
    return engine.generate_insights(df)


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    raw = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(raw))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {e}")

    rows_before = len(df)
    try:
        df = clean_dataframe(df)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    rows_after = len(df)

    conn = get_connection()
    conn.execute("DELETE FROM charging_sessions")
    df.to_sql("charging_sessions", conn, if_exists="append", index=False)
    conn.commit()
    conn.close()
    
    engine.load_sessions_df(force_reload=True)
 