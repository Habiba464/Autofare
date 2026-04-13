import React from "react";
import "./MonthlyLineChart.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * @param {{ title: string, data: Array<{ month: string, value: number }>, valueLabel?: string, color?: string, formatTooltipValue?: (n: number) => string, formatYAxis?: (n: number) => string }} props
 */
function MonthlyLineChart({
  title,
  data,
  valueLabel = "Amount",
  color = "#007fff",
  formatTooltipValue,
  formatYAxis,
}) {
  const fmtTip = formatTooltipValue ?? ((v) => Number(v).toLocaleString());
  const fmtAxis = formatYAxis ?? ((v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v))));
  return (
    <section className="monthly-line-chart glass-panel">
      <h3 className="monthly-line-chart__title">{title}</h3>
      <div className="monthly-line-chart__plot">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.5)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.5)" }}
              tickFormatter={(v) => fmtAxis(Number(v))}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(148, 163, 184, 0.35)",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              }}
              formatter={(value) => [fmtTip(Number(value)), valueLabel]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, strokeWidth: 2, r: 4, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default React.memo(MonthlyLineChart);
