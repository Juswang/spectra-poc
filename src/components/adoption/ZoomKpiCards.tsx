// Zoom KPI cards: active users, active hosts with month tags and utilization gauge.
"use client";

import type { ZoomKpiData } from "@/types/adoption";
import { compact, full } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";
import { DeltaBadge } from "./DeltaBadge";

function MonthTags({ tags }: { tags: ZoomKpiData["activeUsers"]["monthTags"] }) {
  return (
    <div className="sa-zoom-kpi-tags">
      {tags.map((tag) => (
        <span key={tag.label} className="sa-zoom-tag">
          <strong>{tag.label} · {compact(tag.value)}</strong>
          <span className={`sa-zoom-tag-growth${tag.growth < 0 ? " sa-zoom-tag-down" : ""}`}>
            {tag.growth < 0 ? "↓" : "↑"} {Math.abs(tag.growth).toFixed(1)}%
          </span>
        </span>
      ))}
    </div>
  );
}

export default function ZoomKpiCards({ kpis }: { kpis: ZoomKpiData }) {
  return (
    <section className="sa-kpis">
      {/* User Onboarded — fixed */}
      <article className="sa-kpi" style={{ "--accent": CHART_COLORS[0] } as React.CSSProperties}>
        <div className="sa-kpi-label">User Onboarded</div>
        <div className="sa-kpi-value">{full(kpis.usersOnboarded)}</div>
        <span className="sa-zoom-ref-note">Current reference value</span>
        <div className="sa-kpi-note">SG-Zoom users onboarded</div>
      </article>

      {/* Total WOG users — fixed */}
      <article className="sa-kpi" style={{ "--accent": CHART_COLORS[1] } as React.CSSProperties}>
        <div className="sa-kpi-label">Total number of WOG users</div>
        <div className="sa-kpi-value">{full(kpis.totalWogUsers)}</div>
        <span className="sa-zoom-ref-note">Current reference value</span>
        <div className="sa-kpi-note">Whole-of-government users</div>
      </article>

      {/* Active Users — computed */}
      <article className="sa-kpi" style={{ "--accent": CHART_COLORS[2] } as React.CSSProperties}>
        <div className="sa-kpi-label">Active Users</div>
        <div className="sa-kpi-value">{compact(kpis.activeUsers.value)}</div>
        <DeltaBadge value={kpis.activeUsers.delta} />
        <div className="sa-kpi-note">Latest reporting month</div>
        <MonthTags tags={kpis.activeUsers.monthTags} />
        <div className="sa-zoom-progress">
          <div className="sa-zoom-progress-label">{kpis.activeUsers.progressLabel}</div>
          <span
            className="sa-zoom-progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={kpis.activeUsers.progressPercent}
          >
            <i style={{ width: `${kpis.activeUsers.progressPercent}%` }} />
          </span>
        </div>
      </article>

      {/* Active Hosts — computed with license utilization */}
      <article className="sa-kpi" style={{ "--accent": CHART_COLORS[3] } as React.CSSProperties}>
        <div className="sa-kpi-label">Active Hosts</div>
        <div className="sa-kpi-value">{full(kpis.activeHosts.value)}</div>
        <DeltaBadge value={kpis.activeHosts.delta} />
        <div className="sa-kpi-note">Users who hosted at least one meeting in the latest month</div>
        <MonthTags tags={kpis.activeHosts.monthTags} />
        <div className="sa-zoom-progress">
          <div className="sa-zoom-progress-label">{kpis.activeHosts.progressLabel}</div>
          <span
            className="sa-zoom-progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={kpis.activeHosts.utilizationPercent}
          >
            <i
              className={`sa-util-${kpis.activeHosts.utilizationColor}`}
              style={{ width: `${kpis.activeHosts.utilizationPercent}%` }}
            />
          </span>
          <div className="sa-zoom-threshold-note">{kpis.activeHosts.thresholdNote}</div>
          <div className="sa-zoom-util-legend" aria-label="License utilization thresholds">
            <span><i className="sa-dot-green" />{" "}Green &lt;70%</span>
            <span><i className="sa-dot-orange" />{" "}Orange 70–&lt;91%</span>
            <span><i className="sa-dot-red" />{" "}Red ≥91%</span>
          </div>
        </div>
      </article>
    </section>
  );
}
