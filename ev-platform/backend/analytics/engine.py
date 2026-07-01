"""
Analytics engine: all business-intelligence computations live here.
Pure functions that take a DataFrame of charging sessions and return
aggregated, business-ready results. Keeping this separate from the API
layer makes the logic easy to test and reuse.
"""
import pandas as pd
import numpy as np
from backend.database.db import get_connection

CALENDAR_DAYS_ASSUMED = 30

_cached_df = None


def load_sessions_df(force_reload=False):
    global _cached_df
    if _cached_df is not None and not force_reload:
        return _cached_df

    conn = get_connection()
    df = pd.read_sql_query("SELECT * FROM charging_sessions", conn)
    conn.close()

    if df.empty:
        _cached_df = df
        return df

    df["start_time"] = pd.to_datetime(df["start_time"])
    df["hour"] = df["start_time"].dt.hour
    df["date"] = df["start_time"].dt.date
    df["weekday"] = df["start_time"].dt.day_name()
    df["weekday_num"] = df["start_time"].dt.weekday
    df["month"] = df["start_time"].dt.to_period("M").astype(str)
    df["is_weekend"] = df["weekday_num"] >= 5

    _cached_df = df
    return df