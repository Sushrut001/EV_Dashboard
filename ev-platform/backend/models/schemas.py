"""Pydantic schemas defining the shape of API responses."""
from pydantic import BaseModel
from typing import Optional


class KPISummary(BaseModel):
    total_sessions: int
    total_energy_kwh: float
    active_stations: int
    avg_duration_minutes: float
    avg_utilization_pct: float
    peak_hour: int
    sessions_trend_pct: float
    energy_trend_pct: float


class StationStat(BaseModel):
    station_id: str
    station_name: str
    latitude: float
    longitude: float
    total_chargers: int
    total_sessions: int
    total_energy_kwh: float
    avg_duration_minutes: float
    utilization_pct: float
    avg_sessions_per_day: float
    rank: int
    status: str  # "high" | "medium" | "low"


class MapStation(BaseModel):
    station_id: str
    station_name: str
    latitude: float
    longitude: float
    total_chargers: int
    utilization_pct: float
    total_sessions: int
    avg_duration_minutes: float
    status: str


class ChartPoint(BaseModel):
    label: str
    value: float
    secondary: Optional[float] = None


class Insight(BaseModel):
    type: str  # "positive" | "warning" | "neutral"
    title: str
    description: str
