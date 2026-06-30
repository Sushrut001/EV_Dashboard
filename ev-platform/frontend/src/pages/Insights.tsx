import { TrendingUp, AlertTriangle, Info } from "lucide-react";
import clsx from "clsx";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { Card } from "../components/Card";
import { LoadingState, ErrorState, EmptyState } from "../components/States";

const ICONS = { positive: TrendingUp, warning: AlertTriangle, neutral: Info };
const STYLES = {
  positive: { bg: "bg-success/10", text: "text-success" },
  warning: { bg: "bg-warning/10", text: "text-warning" },
  neutral: { bg: "bg-primary/10", text: "text-primary" },
};

export function Insights() {
  const insights = useFetch(api.getInsights, []);

  if (insights.loading) return <LoadingState label="Generating insights" />;
  if (insights.error) return <ErrorState message={insights.error} />;
  if (!insights.data || insights.data.length === 0) {
    return <EmptyState title="No insights yet" description="Upload a dataset to generate automated business insights." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {insights.data.map((insight, i) => {
        const Icon = ICONS[insight.type];
        const style = STYLES[insight.type];
        return (
          <Card key={i} className="animate-slide-up">
            <div className="flex items-start gap-4">
              <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", style.bg, style.text)}>
                <Icon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink dark:text-ink-dark">{insight.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted dark:text-muted-dark">{insight.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
