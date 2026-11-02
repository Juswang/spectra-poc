// Meeting/webinar insights: pie chart (month) or stacked bar (quarter) by type.
"use client";

import type { PeriodMode, ZoomMeetingData } from "@/types/adoption";
import { CHART_COLORS } from "@/lib/chart-colors";
import { PieChart, StackedBarChart } from "@/components/charts";

const COLORS = [CHART_COLORS[2], CHART_COLORS[3]];

interface Props {
  data: ZoomMeetingData;
  activityType: "meetings" | "webinars";
  onActivityTypeChange: (type: "meetings" | "webinars") => void;
  periodMode: PeriodMode;
}

export default function ZoomMeetingInsightPanel({ data, activityType, onActivityTypeChange, periodMode }: Props) {
  const activityLabel = activityType === "meetings" ? "Meetings" : "Webinars";
  const source = data[activityType];

  return (
    <article className="sa-panel sa-insight-panel">
      <div className="sa-insight-header">
        <div>
          <h2>{activityLabel} per {periodMode === "quarter" ? "Quarter" : "Month"}</h2>
        </div>
        <div className="sa-zoom-activity-toggle" aria-label="Monthly activity type">
          {(["meetings", "webinars"] as const).map((type) => (
            <button
              key={type}
              className={activityType === type ? "active" : ""}
              aria-pressed={activityType === type}
              onClick={() => onActivityTypeChange(type)}
            >
              {type === "meetings" ? "Meetings" : "Webinars"}
            </button>
          ))}
        </div>
      </div>
      <div className="sa-zoom-meeting-legend">
        <span><span className="sa-legend-dot" style={{ background: COLORS[0] }} />Up to C(CE)</span>
        <span><span className="sa-legend-dot" style={{ background: COLORS[1] }} />Confidential</span>
      </div>
      <div className="sa-zoom-monthly-chart">
        {periodMode === "month" ? (
          <PieChart
            segments={[
              { name: "Up to C(CE)", value: source.monthPie.upToCCE, color: COLORS[0] },
              { name: "Confidential", value: source.monthPie.confidential, color: COLORS[1] },
            ]}
          />
        ) : (
          <StackedBarChart
            bars={source.quarterBars.map((b) => ({
              label: b.period,
              segments: [
                { name: "Up to C(CE)", value: b.upToCCE, color: COLORS[0] },
                { name: "Confidential", value: b.confidential, color: COLORS[1] },
              ],
            }))}
          />
        )}
      </div>
      <div className="sa-insight-foot">SAMPLE INSIGHT · FOR DEMONSTRATION</div>
    </article>
  );
}
