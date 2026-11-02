// SVG dual-line chart: weekly active users and hosts with license threshold.
"use client";

import type { ZoomWeeklyPoint } from "@/types/adoption";
import { full } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";
import { LineChart } from "@/components/charts";

interface Props {
  weeklyData: ZoomWeeklyPoint[];
  licenseThreshold: number;
}

export default function ZoomWeeklyChart({ weeklyData, licenseThreshold }: Props) {
  const n = weeklyData.length;

  return (
    <article className="sa-panel sa-trend-panel">
      <div className="sa-panel-head">
        <div>
          <h2>Weekly Active Users/Active Hosts</h2>
          <p>Weekly activity · Last {n} weeks</p>
        </div>
        <span className="sa-pill">{n} WEEK VIEW</span>
      </div>
      <div className="sa-legend">
        <span><span className="sa-legend-dot" style={{ background: CHART_COLORS[2] }} />{" "}Active Users</span>
        <span><span className="sa-legend-dot" style={{ background: CHART_COLORS[3] }} />{" "}Active Hosts</span>
      </div>
      <LineChart
        labels={weeklyData.map((d) => d.weekEnding)}
        series={[
          { name: "Active Users", values: weeklyData.map((d) => d.activeUsers), color: CHART_COLORS[2] },
          { name: "Active Hosts", values: weeklyData.map((d) => d.activeHosts), color: CHART_COLORS[3] },
        ]}
        threshold={{
          value: licenseThreshold,
          label: `License threshold · ${full(licenseThreshold)}`,
          color: "var(--color-brand-primary)",
        }}
      />
    </article>
  );
}
