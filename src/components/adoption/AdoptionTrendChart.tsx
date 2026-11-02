// SVG line chart: multi-product adoption trends over 6 months.
"use client";

import type { TrendDataPoint } from "@/types/adoption";
import { CHART_COLORS } from "@/lib/chart-colors";
import { LineChart } from "@/components/charts";

const PRODUCT_LABELS = ["Microsoft Exchange", "Microsoft Teams", "Zoom"];

interface AdoptionTrendChartProps {
  trend: TrendDataPoint[];
}

export default function AdoptionTrendChart({ trend }: AdoptionTrendChartProps) {
  if (trend.length === 0) return null;

  return (
    <article className="sa-panel">
      <div className="sa-panel-head">
        <div>
          <h2 className="sa-panel-title">Workplace activity</h2>
          <p className="sa-panel-desc">Monthly active product accounts · Last 6 months</p>
        </div>
        <span className="sa-pill">6 MONTH VIEW</span>
      </div>
      <div className="sa-legend">
        {PRODUCT_LABELS.map((label, i) => (
          <span key={label}>
            <span className="sa-legend-dot" style={{ background: CHART_COLORS[i] }} />
            {label}
          </span>
        ))}
      </div>
      <LineChart
        labels={trend.map((d) => d.monthLabel)}
        series={[
          { name: "Microsoft Exchange", values: trend.map((d) => d.exchange), color: CHART_COLORS[0] },
          { name: "Microsoft Teams", values: trend.map((d) => d.teams), color: CHART_COLORS[1] },
          { name: "Zoom", values: trend.map((d) => d.zoom), color: CHART_COLORS[2] },
        ]}
      />
    </article>
  );
}
