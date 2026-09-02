"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const BAR_COLORS = [
  "#2F6F5E",
  "#B08A2E",
  "#B4472C",
  "#5B7A8C",
  "#8C6B9C",
  "#6B8C4E",
  "#9C6B4E",
  "#4E7A9C",
];

export default function StatsCharts({ growth, categoryBreakdown }) {
  if (!growth?.length) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 mb-10">
      <div className="rounded-card border border-line bg-panel p-5">
        <h2 className="font-display font-semibold text-sm text-ink/70 mb-4">
          Growth over time
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={growth} margin={{ left: -20 }}>
            <CartesianGrid stroke="#D9DED7" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#1E2A24AA" }}
              tickLine={false}
              axisLine={{ stroke: "#D9DED7" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#1E2A24AA" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #D9DED7",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="reports"
              name="Reports"
              stroke="#2F6F5E"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="vendors"
              name="Vendors covered"
              stroke="#B08A2E"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-ink/50 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-works" /> Reports
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-mixed" /> Vendors
            covered
          </span>
        </div>
      </div>

      <div className="rounded-card border border-line bg-panel p-5">
        <h2 className="font-display font-semibold text-sm text-ink/70 mb-4">
          Reports by category
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryBreakdown} margin={{ left: -20 }}>
            <CartesianGrid stroke="#D9DED7" vertical={false} />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 10, fill: "#1E2A24AA" }}
              tickLine={false}
              axisLine={{ stroke: "#D9DED7" }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#1E2A24AA" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #D9DED7",
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" name="Reports" radius={[6, 6, 0, 0]}>
              {categoryBreakdown.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
