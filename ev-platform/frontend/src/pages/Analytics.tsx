import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { Card } from "../components/Card";
import { LoadingState, ErrorState } from "../components/States";
import { AreaTrend, SimpleBar, HorizontalBar, MultiLine } from "../charts/ChartComponents";

export function Analytics() {
  const daily = useFetch(api.getDailySessions, []);
  const monthly = useFetch(api.getMonthlyTrends, []);
  const peakHours = useFetch(api.getPeakHours, []);
  const dayOfWeek = useFetch(api.getDayOfWeek, []);
  const energy = useFetch(api.getEnergyConsumption, []);
  const utilization = useFetch(api.getStationUtilization, []);

  const anyLoading = [daily, monthly, peakHours, dayOfWeek, energy, utilization].some((q) => q.loading);
  const anyError = [daily, monthly, peakHours, dayOfWeek, energy, utilization].find((q) => q.error);

  if (anyLoading) return <LoadingState label="Building charts" />;
  if (anyError) return <ErrorState message={anyError.error!} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold text-ink dark:text-ink-dark">Daily Charging Sessions</h3>
          <p className="mb-4 text-sm text-muted dark:text-muted-dark">Day-by-day session volume over the last 30 days.</p>
          {daily.data && <AreaTrend data={daily.data} color="#007AFF" />}
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-ink dark:text-ink-dark">Monthly Trends</h3>
          <p className="mb-4 text-sm text-muted dark:text-muted-dark">Sessions (blue) vs. energy delivered in kWh (green) by month.</p>
          {monthly.data && <MultiLine data={monthly.data} />}
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-ink dark:text-ink-dark">Peak Charging Hours</h3>
          <p className="mb-4 text-sm text-muted dark:text-muted-dark">Total sessions by hour of day across the network.</p>
          {peakHours.data && <SimpleBar data={peakHours.data} color="#FF9500" />}
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-ink dark:text-ink-dark">Day-of-Week Usage</h3>
          <p className="mb-4 text-sm text-muted dark:text-muted-dark">Where demand concentrates across the week.</p>
          {dayOfWeek.data && <SimpleBar data={dayOfWeek.data} color="#5856D6" />}
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-ink dark:text-ink-dark">Energy Consumption</h3>
          <p className="mb-4 text-sm text-muted dark:text-muted-dark">Daily energy delivered, in kWh.</p>
          {energy.data && <AreaTrend data={energy.data} color="#34C759" unit=" kWh" />}
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-ink dark:text-ink-dark">Station Utilization</h3>
          <p className="mb-4 text-sm text-muted dark:text-muted-dark">Utilization rate by station, ranked highest to lowest.</p>
          {utilization.data && <HorizontalBar data={utilization.data} color="#007AFF" />}
        </Card>
      </div>
    </div>
  );
}
