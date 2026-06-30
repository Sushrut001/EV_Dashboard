# EV Charging Station Intelligence Platform

A full-stack data analytics platform for EV charging network operators — executive dashboards, station-level analytics, an interactive map, business charts, automated insights, and CSV ingestion. Built with a premium, Apple-inspired interface.

## Tech Stack

**Frontend:** React + TypeScript + Tailwind CSS + Recharts + React Leaflet
**Backend:** Python + FastAPI
**Database:** SQLite
**Analytics:** Pandas + NumPy

## Project Structure

```
ev-platform/
├── backend/
│   ├── api/            # FastAPI route handlers
│   ├── analytics/       # Pandas-based analytics engine (all business logic)
│   ├── database/        # SQLite connection + schema + CSV cleaning
│   ├── models/           # Pydantic response schemas
│   ├── data/              # Sample dataset + SQLite file (generated)
│   ├── generate_data.py  # Synthetic dataset generator
│   ├── main.py            # FastAPI app entry point
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/   # Card, KPICard, StatusBadge, loading/empty states
    │   ├── charts/        # Recharts chart components
    │   ├── layouts/        # Sidebar, TopBar, MobileNav, AppLayout
    │   ├── pages/           # Dashboard, Stations, Map, Analytics, Insights, Upload
    │   ├── services/        # API client
    │   ├── hooks/             # useFetch, useTheme
    │   └── types/              # Shared TypeScript types
    └── package.json
```

## Getting Started

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 generate_data.py        # generates data/charging_sessions.csv (skip if already present)
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. On first run it automatically creates the SQLite database and loads the sample dataset. Interactive API docs are available at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be live at `http://localhost:5173`.

> The frontend expects the backend at `http://localhost:8000` (see `frontend/src/services/api.ts`).

## Features

- **Dashboard** — KPI cards (sessions, energy, active stations, avg. duration, utilization, peak hour) with trend indicators, plus daily session and peak-hour charts.
- **Station Analytics** — full ranked table of every station's sessions, energy delivered, utilization, and status.
- **Interactive Map** — all stations plotted with React Leaflet; click a marker to open a detail panel.
- **Analytics** — six business charts: daily sessions, monthly trends, peak hours, day-of-week usage, energy consumption, station utilization.
- **Business Insights** — automatically generated, plain-language observations (top/underperforming stations, peak demand windows, weekend vs. weekday behavior, energy trend, popular charger type).
- **CSV Upload** — drag-and-drop a new dataset; the backend validates columns, fills/drops missing values, removes duplicates, and reloads the database.

## Sample Dataset

`backend/generate_data.py` synthesizes roughly a year of realistic charging activity across 8 stations in Mumbai, with built-in patterns (evening peak demand, weekend uplift, per-station quality differences) so the analytics and insights have something meaningful to surface out of the box. Re-run it any time to regenerate `data/charging_sessions.csv`.

## CSV Format for Upload

```
session_id, station_id, station_name, latitude, longitude, total_chargers,
start_time, duration_minutes, energy_kwh, charger_type, vehicle_model, cost_inr
```

`charger_type`, `vehicle_model`, and `cost_inr` are optional — sensible defaults are filled in if missing.

## Notes

- All analytics (KPIs, utilization, insights) are computed live from SQLite via Pandas on each request — there's no caching layer, by design, to keep the codebase simple and easy to follow.
- Utilization is calculated over a rolling 30-day window: `(total charging hours used) / (chargers × 24h × days) × 100`.
- Light/dark mode is persisted in `localStorage` and respects the OS preference on first load.
