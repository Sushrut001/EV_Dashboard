import { Zap, Battery, Activity, Clock, Gauge, TrendingUp } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { KPICard } from "../components/KPICard";
import { Card } from "../components/Card";
import { LoadingState, ErrorState, EmptyState } from "../components/States";
import { AreaTrend, SimpleBar } from "../charts/ChartComponents";

export function Dashboard() {
  const kpis = useFetch(api.getKPIs, []);
  const daily = useFetch(api.getDailySessions, []);
  const peakHours = useFetch(api.getPeakHours, []);

  if (kpis.loading) return <LoadingState label="Crunching the numbers" />;
  if (kpis.error) return <ErrorState message={kpis.error} />;
  if (!kpis.data || kpis.data.total_sessions === 0) {
    return <EmptyState title="No charging data yet" description="Upload a CSV dataset from the Upload Data page to populate your dashboard." />;
  }

  const k = kpis.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard label="Charging Sessions" value={k.total_sessions.toLocaleString()} icon={<Activity size={18} />} trend={k.sessions_trend_pct} />
        <KPICard label="Energy Delivered" value={(k.total_energy_kwh / 1000).toFixed(1)} suffix="MWh" icon={<Battery size={18} />} trend={k.energy_trend_pct} />
        <KPICard label="Active Stations" value={k.active_stations.toString()} icon={<Zap size={18} />} />
        <KPICard label="Avg. Duration" value={k.avg_duration_minutes.toFixed(0)} suffix="min" icon={<Clock size={18} />} />
        <KPICard label="Avg. Utilization" value={k.avg_utilization_pct.toFixed(1)} suffix="%" icon={<Gauge size={18} />} />
        <KPICard label="Peak Hour" value={`${k.peak_hour.toString().padStart(2, "0")}:00`} icon={<TrendingUp size={18} />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink dark:text-ink-dark">Daily Charging Sessions</h3>
            <span className="text-xs text-muted dark:text-muted-dark">Last 30 days</span>
          </div>
          <p className="mb-4 text-sm text-muted dark:text-muted-dark">
            Session volume across the network, day by day.
          </p>
          {daily.data && <AreaTrend data={daily.data} color="#007AFF" />}
        </Card>

        <Card>
          <div className="mb-1">
            <h3 className="text-base font-semibold text-ink dark:text-ink-dark">Peak Charging Hours</h3>
          </div>
          <p className="mb-4 text-sm text-muted dark:text-muted-dark">Sessions by hour of day.</p>
          {peakHours.data && <SimpleBar data={peakHours.data} color="#FF9500" />}
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/0">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-ink dark:text-ink-dark">Network is performing well</h3>
            <p className="mt-1 max-w-xl text-sm text-muted dark:text-muted-dark">
              Average utilization stands at {k.avg_utilization_pct.toFixed(1)}% with peak demand around {k.peak_hour.toString().padStart(2, "0")}:00.
              Visit Business Insights for a full breakdown of trends and recommendations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
