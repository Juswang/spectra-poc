// Dual-axis SVG chart: users responded (count) vs overall experience rating.
"use client";

import type { ZoomExperiencePoint } from "@/types/adoption";
import { full } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";
import { LineChart } from "@/components/charts";

interface Props {
  data: ZoomExperiencePoint[];
}

export default function ZoomParticipantExperience({ data }: Props) {
  const n = data.length;

  return (
    <section className="sa-zoom-experience-section">
      <div className="sa-zoom-experience-heading">
        <h2>Participant-reported Meeting Experience</h2>
      </div>
      <article className="sa-panel sa-trend-panel sa-zoom-experience-panel">
        <div className="sa-panel-head">
          <div>
            <h2>Meeting experience trend</h2>
            <p>Weekly participant feedback · Last {n} weeks</p>
          </div>
          <span className="sa-pill">{n} WEEK VIEW</span>
        </div>
        <div className="sa-legend">
          <span><span className="sa-legend-dot" style={{ background: CHART_COLORS[0] }} />Number of Users Responded</span>
          <span><span className="sa-legend-dot" style={{ background: CHART_COLORS[1] }} />Overall Experience Rating</span>
        </div>
        <LineChart
          labels={data.map((d) => d.weekEnding)}
          series={[
            { name: "Users Responded", values: data.map((d) => d.usersResponded), color: CHART_COLORS[0], format: full },
            { name: "Experience Rating", values: data.map((d) => d.overallRating), color: CHART_COLORS[1], yAxis: "right", format: (v) => `${v.toFixed(2)} / 5` },
          ]}
          rightAxisMax={5}
          rightAxisFormat={(v) => v.toFixed(1)}
        />
      </article>
    </section>
  );
}
