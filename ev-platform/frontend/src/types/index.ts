export interface KPISummary {
  total_sessions: number;
  total_energy_kwh: number;
  active_stations: number;
  avg_duration_minutes: number;
  avg_utilization_pct: number;
  peak_hour: number;
  sessions_trend_pct: number;
  energy_trend_pct: number;
}

export interface StationStat {
  station_id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  total_chargers: number;
  total_sessions: number;
  total_energy_kwh: number;
  avg_duration_minutes: number;
  utilization_pct: number;
  avg_sessions_per_day: number;
  rank: number;
  status: "high" | "medium" | "low";
}

export interface MapStation {
  station_id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  total_chargers: number;
  utilization_pct: number;
  total_sessions: number;
  avg_duration_minutes: number;
  status: "high" | "medium" | "low";
}

export interface ChartPoint {
  label: string;
  value: number;
  secondary?: number;
}

export interface Insight {
  type: "positive" | "warning" | "neutral";
  title: string;
  description: string;
}

export interface UploadResult {
  filename: string;
  rows_received: number;
  rows_stored: number;
  rows_removed: number;
  message: string;
}
