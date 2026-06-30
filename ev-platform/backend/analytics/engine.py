"""
Analytics engine: all business-intelligence computations live here.
Pure functions that take a DataFrame of charging sessions and return
aggregated, business-ready results. Keeping this separate from the API
layer makes the logic easy to test and reuse.
"""
import pandas as pd
import numpy as np
from database.db import get_connection

CALENDAR_DAYS_ASSUMED = 30  # window used for utilization & "per day" denominators


def load_sessions_df() -> pd.DataFrame:
    """Load all charging sessions from SQLite into a DataFrame with derived columns."""
    conn = get_connection()
    df = pd.read_sql_query("SELECT * FROM charging_sessions", conn)
    conn.close()

    if df.empty:
        return df

    df["start_time"] = pd.to_datetime(df["start_time"])
    df["hour"] = df["start_time"].dt.hour
    df["date"] = df["start_time"].dt.date
    df["weekday"] = df["start_time"].dt.day_name()
    df["weekday_num"] = df["start_time"].dt.weekday
    df["month"] = df["start_time"].dt.to_period("M").astype(str)
    df["is_weekend"] = df["weekday_num"] >= 5
    return df


def _utilization_for_group(group: pd.DataFrame, chargers: int, days_span: int) -> float:
    """
    Utilization % = (total charging hours used) / (total available charger-hours) * 100
    over the observed date span for that station.
    """
    if chargers <= 0 or days_span <= 0:
        return 0.0
    used_hours = group["duration_minutes"].sum() / 60
    available_hours = chargers * 24 * days_span
    return round(min(100.0, (used_hours / available_hours) * 100), 1)


def _recent_window(df: pd.DataFrame, days: int = 30) -> pd.DataFrame:
    """Return only sessions from the most recent `days` window — used so that
    KPIs/utilization reflect 'current' performance rather than a full-year average."""
    if df.empty:
        return df
    max_date = df["start_time"].max()
    cutoff = max_date - pd.Timedelta(days=days)
    return df[df["start_time"] > cutoff]


def get_kpis(df: pd.DataFrame) -> dict:
    if df.empty:
        return {
            "total_sessions": 0, "total_energy_kwh": 0, "active_stations": 0,
            "avg_duration_minutes": 0, "avg_utilization_pct": 0, "peak_hour": 0,
            "sessions_trend_pct": 0, "energy_trend_pct": 0,
        }

    recent = _recent_window(df, 30)
    total_sessions = len(recent)
    total_energy = round(recent["energy_kwh"].sum(), 1)
    active_stations = recent["station_id"].nunique()
    avg_duration = round(recent["duration_minutes"].mean(), 1)
    peak_hour = int(recent.groupby("hour").size().idxmax())

    days_span = max(1, (recent["start_time"].max() - recent["start_time"].min()).days + 1)
    station_chargers = recent.groupby("station_id")["total_chargers"].first()
    utilizations = []
    for sid, group in recent.groupby("station_id"):
        utilizations.append(_utilization_for_group(group, int(station_chargers[sid]), days_span))
    avg_utilization = round(float(np.mean(utilizations)), 1) if utilizations else 0.0

    # trend: compare last 30 days vs prior 30 days
    max_date = df["start_time"].max()
    recent_cut = max_date - pd.Timedelta(days=30)
    prior_cut = max_date - pd.Timedelta(days=60)
    prior = df[(df["start_time"] <= recent_cut) & (df["start_time"] > prior_cut)]

    def pct_change(new, old):
        if old == 0:
            return 0.0
        return round(((new - old) / old) * 100, 1)

    sessions_trend = pct_change(len(recent), len(prior))
    energy_trend = pct_change(recent["energy_kwh"].sum(), prior["energy_kwh"].sum())

    return {
        "total_sessions": total_sessions,
        "total_energy_kwh": total_energy,
        "active_stations": active_stations,
        "avg_duration_minutes": avg_duration,
        "avg_utilization_pct": avg_utilization,
        "peak_hour": peak_hour,
        "sessions_trend_pct": sessions_trend,
        "energy_trend_pct": energy_trend,
    }


def get_station_stats(df: pd.DataFrame) -> list:
    if df.empty:
        return []

    df = _recent_window(df, 30)
    days_span = max(1, (df["start_time"].max() - df["start_time"].min()).days + 1)
    rows = []
    for sid, group in df.groupby("station_id"):
        chargers = int(group["total_chargers"].iloc[0])
        sessions = len(group)
        energy = round(group["energy_kwh"].sum(), 1)
        avg_duration = round(group["duration_minutes"].mean(), 1)
        utilization = _utilization_for_group(group, chargers, days_span)
        avg_per_day = round(sessions / days_span, 1)

        rows.append({
            "station_id": sid,
            "station_name": group["station_name"].iloc[0],
            "latitude": float(group["latitude"].iloc[0]),
            "longitude": float(group["longitude"].iloc[0]),
            "total_chargers": chargers,
            "total_sessions": sessions,
            "total_energy_kwh": energy,
            "avg_duration_minutes": avg_duration,
            "utilization_pct": utilization,
            "avg_sessions_per_day": avg_per_day,
        })

    # rank by utilization desc
    rows.sort(key=lambda r: r["utilization_pct"], reverse=True)
    for i, r in enumerate(rows):
        r["rank"] = i + 1
        if r["utilization_pct"] >= 65:
            r["status"] = "high"
        elif r["utilization_pct"] >= 35:
            r["status"] = "medium"
        else:
            r["status"] = "low"
    return rows


def get_daily_sessions(df: pd.DataFrame, last_n_days: int = 30) -> list:
    if df.empty:
        return []
    daily = df.groupby("date").size().reset_index(name="value")
    daily = daily.sort_values("date").tail(last_n_days)
    return [{"label": str(d), "value": int(v)} for d, v in zip(daily["date"], daily["value"])]


def get_monthly_trends(df: pd.DataFrame) -> list:
    if df.empty:
        return []
    monthly = df.groupby("month").agg(sessions=("session_id", "count"), energy=("energy_kwh", "sum")).reset_index()
    monthly = monthly.sort_values("month")
    return [
        {"label": m, "value": int(s), "secondary": round(float(e), 1)}
        for m, s, e in zip(monthly["month"], monthly["sessions"], monthly["energy"])
    ]


def get_peak_hours(df: pd.DataFrame) -> list:
    if df.empty:
        return []
    hourly = df.groupby("hour").size().reindex(range(24), fill_value=0).reset_index(name="value")
    hourly.columns = ["hour", "value"]
    return [{"label": f"{int(h):02d}:00", "value": int(v)} for h, v in zip(hourly["hour"], hourly["value"])]


def get_day_of_week_usage(df: pd.DataFrame) -> list:
    if df.empty:
        return []
    order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    grouped = df.groupby("weekday").size().reindex(order, fill_value=0).reset_index(name="value")
    grouped.columns = ["weekday", "value"]
    return [{"label": w[:3], "value": int(v)} for w, v in zip(grouped["weekday"], grouped["value"])]


def get_energy_consumption(df: pd.DataFrame, last_n_days: int = 30) -> list:
    if df.empty:
        return []
    daily = df.groupby("date")["energy_kwh"].sum().reset_index(name="value")
    daily = daily.sort_values("date").tail(last_n_days)
    return [{"label": str(d), "value": round(float(v), 1)} for d, v in zip(daily["date"], daily["value"])]


def get_station_utilization_chart(df: pd.DataFrame) -> list:
    stats = get_station_stats(df)
    return [{"label": s["station_name"], "value": s["utilization_pct"]} for s in stats]


def generate_insights(df: pd.DataFrame) -> list:
    """Generate plain-language, data-driven business insights."""
    if df.empty:
        return []

    insights = []
    full_df = df
    df = _recent_window(df, 30)
    stats = get_station_stats(full_df)

    if stats:
        top = stats[0]
        insights.append({
            "type": "positive",
            "title": f"{top['station_name']} leads utilization",
            "description": f"Operating at {top['utilization_pct']}% utilization with {top['total_sessions']:,} sessions, the highest of any station in the network.",
        })

        low_stations = [s for s in stats if s["status"] == "low"]
        if low_stations:
            worst = min(low_stations, key=lambda s: s["utilization_pct"])
            insights.append({
                "type": "warning",
                "title": f"{worst['station_name']} is underperforming",
                "description": f"Utilization sits at just {worst['utilization_pct']}%, well below the network average. Consider promotions or relocation review.",
            })

    # peak hour insight
    hourly = df.groupby("hour").size()
    if not hourly.empty:
        peak_hour = int(hourly.idxmax())
        period = "evening" if 17 <= peak_hour <= 21 else ("morning" if 6 <= peak_hour <= 10 else "off-peak")
        share = round(hourly.max() / hourly.sum() * 100, 1)
        insights.append({
            "type": "neutral",
            "title": f"Demand peaks at {peak_hour:02d}:00",
            "description": f"The {period} hour of {peak_hour:02d}:00 accounts for {share}% of single-hour session share, the highest of the day.",
        })

    # weekend vs weekday
    weekend_avg = df[df["is_weekend"]].groupby("date").size().mean() if df["is_weekend"].any() else 0
    weekday_avg = df[~df["is_weekend"]].groupby("date").size().mean() if (~df["is_weekend"]).any() else 0
    if weekday_avg and weekend_avg:
        diff_pct = round(((weekend_avg - weekday_avg) / weekday_avg) * 100, 1)
        if abs(diff_pct) >= 10:
            direction = "higher" if diff_pct > 0 else "lower"
            insights.append({
                "type": "positive" if diff_pct > 0 else "neutral",
                "title": f"Weekend demand is {abs(diff_pct)}% {direction}",
                "description": f"Average daily sessions on weekends are {abs(diff_pct)}% {direction} than weekdays, suggesting {'leisure-driven' if diff_pct > 0 else 'commute-driven'} charging behavior.",
            })

    # energy growth trend
    kpis = get_kpis(full_df)
    if kpis["energy_trend_pct"] != 0:
        direction = "increased" if kpis["energy_trend_pct"] > 0 else "decreased"
        insights.append({
            "type": "positive" if kpis["energy_trend_pct"] > 0 else "warning",
            "title": f"Energy delivery {direction} {abs(kpis['energy_trend_pct'])}%",
            "description": f"Total energy delivered over the last 30 days {direction} by {abs(kpis['energy_trend_pct'])}% compared to the prior 30-day period.",
        })

    # charger type popularity (if column exists)
    if "charger_type" in df.columns and df["charger_type"].notna().any():
        top_type = df["charger_type"].value_counts().idxmax()
        share = round(df["charger_type"].value_counts(normalize=True).max() * 100, 1)
        insights.append({
            "type": "neutral",
            "title": f"{top_type} is the most-used charger type",
            "description": f"{share}% of all sessions used {top_type}, indicating where future hardware investment may have the most impact.",
        })

    return insights
