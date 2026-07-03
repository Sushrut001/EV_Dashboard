import type {
  KPISummary, StationStat, MapStation, ChartPoint, Insight, UploadResult,
} from "../types";

const BASE_URL = import.meta.env.DEV
  ? "http://localhost:8000/api"
  : "https://YOUR-NEW-BACKEND-URL.onrender.com/api";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getKPIs: () => getJSON<KPISummary>("/kpis"),
  getStations: () => getJSON<StationStat[]>("/stations"),
  getMapData: () => getJSON<MapStation[]>("/map"),
  getDailySessions: () => getJSON<ChartPoint[]>("/charts/daily-sessions"),
  getMonthlyTrends: () => getJSON<ChartPoint[]>("/charts/monthly-trends"),
  getPeakHours: () => getJSON<ChartPoint[]>("/charts/peak-hours"),
  getDayOfWeek: () => getJSON<ChartPoint[]>("/charts/day-of-week"),
  getEnergyConsumption: () => getJSON<ChartPoint[]>("/charts/energy-consumption"),
  getStationUtilization: () => getJSON<ChartPoint[]>("/charts/station-utilization"),
  getInsights: () => getJSON<Insight[]>("/insights"),

  uploadCSV: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/upload`, { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },
};