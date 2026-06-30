"""
Generates a realistic synthetic EV charging dataset and writes it to data/charging_sessions.csv.
This simulates a year of charging activity across multiple stations in a city,
with realistic patterns: peak evening hours, higher weekend demand, station-level
quality differences, and seasonal energy variation.
"""
import csv
import random
from datetime import datetime, timedelta

random.seed(42)

STATIONS = [
    {"id": "STN-001", "name": "Bandra Kurla Complex Hub",     "lat": 19.0660, "lng": 72.8697, "chargers": 8,  "quality": 1.15},
    {"id": "STN-002", "name": "Powai Tech Park",               "lat": 19.1176, "lng": 72.9060, "chargers": 6,  "quality": 1.05},
    {"id": "STN-003", "name": "Andheri Metro Station",         "lat": 19.1197, "lng": 72.8468, "chargers": 10, "quality": 1.20},
    {"id": "STN-004", "name": "Worli Sea Face Plaza",          "lat": 19.0176, "lng": 72.8170, "chargers": 4,  "quality": 0.70},
    {"id": "STN-005", "name": "Navi Mumbai Mall",               "lat": 19.0330, "lng": 73.0297, "chargers": 6,  "quality": 0.95},
    {"id": "STN-006", "name": "Thane Highway Junction",         "lat": 19.2183, "lng": 72.9781, "chargers": 5,  "quality": 0.60},
    {"id": "STN-007", "name": "Lower Parel Business District",  "lat": 18.9967, "lng": 72.8302, "chargers": 7,  "quality": 1.10},
    {"id": "STN-008", "name": "Goregaon Film City Road",        "lat": 19.1663, "lng": 72.8526, "chargers": 4,  "quality": 0.80},
]

VEHICLE_MODELS = ["Tata Nexon EV", "MG ZS EV", "Hyundai Kona", "Tata Tiago EV",
                   "Mahindra XUV400", "BYD Atto 3", "Tata Punch EV", "Citroen eC3"]
CHARGER_TYPES = ["DC Fast (50kW)", "DC Fast (60kW)", "AC Type 2 (22kW)", "DC Ultra (120kW)"]


def hour_weight(hour: int) -> float:
    """Realistic demand curve: low overnight, morning bump, big evening peak."""
    if 0 <= hour < 6:
        return 0.15
    if 6 <= hour < 9:
        return 0.9
    if 9 <= hour < 16:
        return 0.55
    if 16 <= hour < 21:
        return 1.6  # evening peak
    return 0.6


def day_weight(weekday: int) -> float:
    # weekday: 0=Mon ... 6=Sun. Weekends busier (more leisure/errand charging)
    return 1.35 if weekday >= 5 else 1.0


def season_weight(month: int) -> float:
    # slightly higher energy use in hot months (AC load) and monsoon-adjacent caution charging
    if month in (4, 5, 6):
        return 1.1
    if month in (7, 8, 9):
        return 1.0
    return 0.95


rows = []
session_id = 1
start_date = datetime(2025, 7, 1)
end_date = datetime(2026, 6, 28)

current = start_date
while current <= end_date:
    weekday = current.weekday()
    dweight = day_weight(weekday)
    sweight = season_weight(current.month)

    for station in STATIONS:
        base_sessions = station["chargers"] * station["quality"] * 13.5 * dweight * sweight
        num_sessions_today = max(0, int(random.gauss(base_sessions, base_sessions * 0.25)))

        for _ in range(num_sessions_today):
            # pick hour weighted toward peaks
            weights = [hour_weight(h) for h in range(24)]
            hour = random.choices(range(24), weights=weights, k=1)[0]
            minute = random.randint(0, 59)
            start_dt = current.replace(hour=hour, minute=minute)

            duration_min = max(8, int(random.gauss(38, 14)))
            energy_kwh = round(max(2.0, random.gauss(22 * station["quality"], 7)), 2)
            charger_type = random.choice(CHARGER_TYPES)
            vehicle = random.choice(VEHICLE_MODELS)
            cost = round(energy_kwh * 9.5, 2)  # INR per kWh approx

            rows.append({
                "session_id": f"SES-{session_id:06d}",
                "station_id": station["id"],
                "station_name": station["name"],
                "latitude": station["lat"],
                "longitude": station["lng"],
                "total_chargers": station["chargers"],
                "start_time": start_dt.strftime("%Y-%m-%d %H:%M:%S"),
                "duration_minutes": duration_min,
                "energy_kwh": energy_kwh,
                "charger_type": charger_type,
                "vehicle_model": vehicle,
                "cost_inr": cost,
            })
            session_id += 1
    current += timedelta(days=1)

print(f"Generated {len(rows)} sessions")

with open("data/charging_sessions.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)

print("Saved to data/charging_sessions.csv")
