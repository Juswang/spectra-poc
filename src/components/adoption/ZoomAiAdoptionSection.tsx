// Zoom AI adoption: trend chart, feature usage pie/bar, KPI cards with deltas.
"use client";

import type { PeriodMode, ZoomAiData } from "@/types/adoption";
import { compact, full } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";
import { DeltaBadge } from "./DeltaBadge";
import { LineChart, PieChart, StackedBarChart } from "@/components/charts";

function AiTrendChart({ data, weekCount }: { data: ZoomAiData; weekCount: number }) {
  return (
    <article className="sa-panel sa-trend-panel">
      <div className="sa-panel-head">
        <div>
          <h2>AI Adoption Trend</h2>
          <p>Weekly AI Companion adoption · Last {weekCount} weeks</p>
        </div>
        <span className="sa-pill">{weekCount} WEEK VIEW</span>
      </div>
      <div className="sa-legend">
        <span><span className="sa-legend-dot" style={{ background: CHART_COLORS[0] }} />Active Users</span>
        <span><span className="sa-legend-dot" style={{ background: CHART_COLORS[1] }} />AI-Active Users</span>
        <span><span className="sa-legend-dot" style={{ background: CHART_COLORS[3] }} />AI Adoption Rate</span>
      </div>
      <LineChart
        labels={data.trend.map((d) => d.period)}
        series={[
          { name: "Active Users", values: data.trend.map((d) => d.activeUsers), color: CHART_COLORS[0] },
          { name: "AI-Active Users", values: data.trend.map((d) => d.aiActiveUsers), color: CHART_COLORS[1] },
          { name: "AI Adoption Rate", values: data.trend.map((d) => d.aiAdoptionRate), color: CHART_COLORS[3], yAxis: "right", format: (v) => `${(v * 100).toFixed(1)}%` },
        ]}
        rightAxisMax={1}
        rightAxisFormat={(v) => `${Math.round(v * 100)}%`}
      />
    </article>
  );
}

function AiFeaturesPieChart({ slices }: { slices: ZoomAiData["featuresPie"] }) {
  return (
    <PieChart
      segments={slices.map((s, i) => ({ name: s.name, value: s.value, color: CHART_COLORS[i] }))}
      width={330}
      height={220}
    />
  );
}

function AiFeaturesBarChart({ bars }: { bars: ZoomAiData["featuresBar"] }) {
  return (
    <StackedBarChart
      bars={bars.map((b) => ({
        label: b.period,
        segments: b.features.map((f, i) => ({ name: f.name, value: f.value, color: CHART_COLORS[i] })),
      }))}
      width={330}
      height={220}
    />
  );
}

interface Props {
  data: ZoomAiData;
  periodMode: PeriodMode;
}

export default function ZoomAiAdoptionSection({ data, periodMode }: Props) {
  const weekCount = periodMode === "quarter" ? 12 : 4;
  const periodName = periodMode === "quarter" ? "Quarter" : "Month";

  return (
    <section className="sa-zoom-ai-section">
      <div className="sa-zoom-ai-heading">
        <h2>AI Adoption</h2>
        <p>Whether active SG-Zoom users are adopting AI Companion capabilities and whether penetration is increasing.</p>
      </div>

      <div className="sa-zoom-ai-kpis">
        <article className="sa-kpi" style={{ "--accent": CHART_COLORS[0] } as React.CSSProperties}>
          <div className="sa-kpi-label">AI-Active Users</div>
          <div className="sa-kpi-value">{compact(data.aiActiveUsers)}</div>
          <DeltaBadge value={data.aiActiveUsersDelta} suffix={`as of last 3 ${periodMode === "quarter" ? "quarters" : "months"}`} />
          <div className="sa-kpi-note">Active users adopting AI Companion capabilities</div>
        </article>
        <article className="sa-kpi" style={{ "--accent": CHART_COLORS[1] } as React.CSSProperties}>
          <div className="sa-kpi-label">AI Adoption Rate</div>
          <div className="sa-kpi-value">{data.aiAdoptionRate.toFixed(1)}<small>%</small></div>
          <DeltaBadge value={data.aiAdoptionRateDelta} suffix={`as of last 3 ${periodMode === "quarter" ? "quarters" : "months"}`} />
          <div className="sa-kpi-note">AI-active users as a share of active SG-Zoom users</div>
        </article>
      </div>

      <div className="sa-zoom-ai-visuals">
        <AiTrendChart data={data} weekCount={weekCount} />
        <article className="sa-panel">
          <div className="sa-panel-head">
            <div>
              <h2>SG-Zoom AI Features used per {periodName}</h2>
              <p>{periodMode === "month" ? `AI Companion feature usage breakdown` : `${periodName}ly AI Companion feature usage · Last 6 ${periodName.toLowerCase()}s`}</p>
            </div>
          </div>
          <div className="sa-legend sa-zoom-ai-features-legend">
            <span><span className="sa-legend-dot" style={{ background: CHART_COLORS[0] }} />Transcribing</span>
            <span><span className="sa-legend-dot" style={{ background: CHART_COLORS[1] }} />Taking Minutes</span>
            <span><span className="sa-legend-dot" style={{ background: CHART_COLORS[2] }} />Scheduling Meetings</span>
            <span><span className="sa-legend-dot" style={{ background: CHART_COLORS[3] }} />Others</span>
          </div>
          <div className="sa-zoom-chart">
            {periodMode === "month" ? (
              <AiFeaturesPieChart slices={data.featuresPie} />
            ) : (
              <AiFeaturesBarChart bars={data.featuresBar} />
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
