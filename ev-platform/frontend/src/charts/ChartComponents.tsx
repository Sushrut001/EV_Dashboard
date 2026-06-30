import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, RadialBarChart, RadialBar,
} from "recharts";
import type { ChartPoint } from "../types";

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #E5E5EA",
  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  fontSize: 13,
  fontFamily: "Inter, sans-serif",
};

export function AreaTrend({ data, color = "#007AFF", unit = "" }: { data: ChartPoint[]; color?: string; unit?: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6E6E73" }} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tick={{ fontSize: 11, fill: "#6E6E73" }} tickLine={false} axisLine={false} width={36} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v.toLocaleString()}${unit}`, ""]} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#grad-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SimpleBar({ data, color = "#007AFF", unit = "" }: { data: ChartPoint[]; color?: string; unit?: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6E6E73" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#6E6E73" }} tickLine={false} axisLine={false} width={36} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v.toLocaleString()}${unit}`, ""]} cursor={{ fill: "rgba(0,122,255,0.06)" }} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBar({ data, color = "#007AFF", unit = "%" }: { data: ChartPoint[]; color?: string; unit?: string }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ top: 6, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5EA" />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#6E6E73" }} tickLine={false} axisLine={false} />
        <YAxis dataKey="label" type="category" tick={{ fontSize: 12, fill: "#1D1D1F" }} tickLine={false} axisLine={false} width={150} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}${unit}`, "Utilization"]} cursor={{ fill: "rgba(0,122,255,0.06)" }} />
        <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MultiLine({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6E6E73" }} tickLine={false} axisLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#6E6E73" }} tickLine={false} axisLine={false} width={40} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#6E6E73" }} tickLine={false} axisLine={false} width={40} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line yAxisId="left" type="monotone" dataKey="value" name="Sessions" stroke="#007AFF" strokeWidth={2.5} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="secondary" name="Energy (kWh)" stroke="#34C759" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RadialGauge({ value, color = "#007AFF" }: { value: number; color?: string }) {
  const data = [{ name: "util", value, fill: color }];
  return (
    <ResponsiveContainer width="100%" height={180}>
      <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
        <RadialBar background dataKey="value" cornerRadius={20} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
