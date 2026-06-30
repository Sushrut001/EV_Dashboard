import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import { X, Zap, Clock, Activity, Plug } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "../components/States";
import type { MapStation } from "../types";

const STATUS_COLOR: Record<string, string> = {
  high: "#34C759",
  medium: "#FF9500",
  low: "#FF3B30",
};

function FitBounds({ stations }: { stations: MapStation[] }) {
  const map = useMap();
  if (stations.length > 0) {
    const bounds = stations.map((s) => [s.latitude, s.longitude] as [number, number]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }
  return null;
}

export function MapPage() {
  const stationsQuery = useFetch(api.getMapData, []);
  const [selected, setSelected] = useState<MapStation | null>(null);

  if (stationsQuery.loading) return <LoadingState label="Plotting stations" />;
  if (stationsQuery.error) return <ErrorState message={stationsQuery.error} />;
  if (!stationsQuery.data || stationsQuery.data.length === 0) {
    return <EmptyState title="No stations to map" description="Upload a dataset with station coordinates." />;
  }

  const stations = stationsQuery.data;

  return (
    <div className="relative h-[calc(100vh-160px)] min-h-[480px] overflow-hidden rounded-xl2 shadow-soft">
      <MapContainer center={[19.07, 72.87]} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        <FitBounds stations={stations} />
        {stations.map((s) => (
          <CircleMarker
            key={s.station_id}
            center={[s.latitude, s.longitude]}
            radius={selected?.station_id === s.station_id ? 14 : 10}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: STATUS_COLOR[s.status],
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => setSelected(s) }}
          />
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="glass absolute bottom-4 left-4 z-[400] rounded-xl px-4 py-3 shadow-soft-lg">
        <p className="mb-2 text-xs font-semibold text-ink dark:text-ink-dark">Utilization</p>
        <div className="flex flex-col gap-1 text-xs text-muted dark:text-muted-dark">
          {(["high", "medium", "low"] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[s] }} />
              {s === "high" ? "High (65%+)" : s === "medium" ? "Medium (35–65%)" : "Low (<35%)"}
            </div>
          ))}
        </div>
      </div>

      {/* Station info panel */}
      {selected && (
        <div className="absolute right-4 top-4 z-[400] w-[300px] animate-slide-up">
          <Card className="relative shadow-soft-lg">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted hover:bg-bg dark:text-muted-dark dark:hover:bg-white/10"
            >
              <X size={16} />
            </button>
            <div className="mb-1 flex items-center gap-2 pr-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap size={16} />
              </div>
              <h3 className="text-sm font-bold leading-tight text-ink dark:text-ink-dark">{selected.station_name}</h3>
            </div>
            <p className="mb-4 text-xs text-muted dark:text-muted-dark">
              {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
            </p>

            <div className="mb-4"><StatusBadge status={selected.status} /></div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted dark:text-muted-dark"><Plug size={14} /> Available Chargers</span>
                <span className="font-semibold text-ink dark:text-ink-dark">{selected.total_chargers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted dark:text-muted-dark"><Activity size={14} /> Utilization</span>
                <span className="font-semibold text-ink dark:text-ink-dark">{selected.utilization_pct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted dark:text-muted-dark"><Zap size={14} /> Charging Sessions</span>
                <span className="font-semibold text-ink dark:text-ink-dark">{selected.total_sessions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted dark:text-muted-dark"><Clock size={14} /> Avg. Charging Time</span>
                <span className="font-semibold text-ink dark:text-ink-dark">{selected.avg_duration_minutes} min</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
