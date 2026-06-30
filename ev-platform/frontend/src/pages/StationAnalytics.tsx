import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "../components/States";
import { Trophy } from "lucide-react";

export function StationAnalytics() {
  const stations = useFetch(api.getStations, []);

  if (stations.loading) return <LoadingState label="Ranking stations" />;
  if (stations.error) return <ErrorState message={stations.error} />;
  if (!stations.data || stations.data.length === 0) {
    return <EmptyState title="No station data" description="Upload a dataset to see station-by-station performance." />;
  }

  const data = stations.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {data.slice(0, 3).map((s, i) => (
          <Card key={s.station_id} className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink dark:text-ink-dark">#{i + 1} {s.station_name}</p>
              <p className="text-xs text-muted dark:text-muted-dark">{s.utilization_pct}% utilization · {s.total_sessions.toLocaleString()} sessions</p>
            </div>
          </Card>
        ))}
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="border-b border-border/60 px-6 py-5 dark:border-border-dark/60">
          <h3 className="text-base font-semibold text-ink dark:text-ink-dark">All Stations</h3>
          <p className="text-sm text-muted dark:text-muted-dark">Ranked by utilization over the last 30 days.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted dark:border-border-dark/60 dark:text-muted-dark">
                <th className="px-6 py-3 font-semibold">Rank</th>
                <th className="px-6 py-3 font-semibold">Station</th>
                <th className="px-6 py-3 font-semibold">Chargers</th>
                <th className="px-6 py-3 font-semibold">Sessions</th>
                <th className="px-6 py-3 font-semibold">Energy (kWh)</th>
                <th className="px-6 py-3 font-semibold">Avg. Duration</th>
                <th className="px-6 py-3 font-semibold">Utilization</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.station_id} className="border-b border-border/40 last:border-0 hover:bg-bg/60 dark:border-border-dark/40 dark:hover:bg-white/5">
                  <td className="px-6 py-4 font-semibold text-ink dark:text-ink-dark">{s.rank}</td>
                  <td className="px-6 py-4 font-medium text-ink dark:text-ink-dark">{s.station_name}</td>
                  <td className="px-6 py-4 text-muted dark:text-muted-dark">{s.total_chargers}</td>
                  <td className="px-6 py-4 text-muted dark:text-muted-dark">{s.total_sessions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-muted dark:text-muted-dark">{s.total_energy_kwh.toLocaleString()}</td>
                  <td className="px-6 py-4 text-muted dark:text-muted-dark">{s.avg_duration_minutes} min</td>
                  <td className="px-6 py-4 font-semibold text-ink dark:text-ink-dark">{s.utilization_pct}%</td>
                  <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
