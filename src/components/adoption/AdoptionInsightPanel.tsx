// At-a-glance panel: total active users, adoption %, top agency.
"use client";

import { compact } from "@/lib/format";

interface AdoptionInsightPanelProps {
  totalActive: number;
  adoptionPercent: number;
  topAgencyName: string | null;
}

export default function AdoptionInsightPanel({
  totalActive,
  adoptionPercent,
  topAgencyName,
}: AdoptionInsightPanelProps) {
  return (
    <article className="sa-panel sa-insight-panel">
      <div className="sa-eyebrow">AT A GLANCE</div>
      <h2 className="sa-insight-title">Connected government.</h2>
      <div>
        <div className="sa-insight">
          <strong>{compact(totalActive)}</strong>
          <p>active product accounts across the portfolio. People may use multiple products.</p>
        </div>
        <div className="sa-insight">
          <strong>{adoptionPercent.toFixed(1)}%</strong>
          <p>of provisioned product accounts were active.</p>
        </div>
        <div className="sa-insight">
          <strong className="sa-insight-agency">
            {topAgencyName || "No agencies selected"}
          </strong>
          <p>
            {topAgencyName
              ? "has the most active accounts in this selection."
              : "Select at least one agency to view analytics."}
          </p>
        </div>
      </div>
      <div className="sa-insight-foot">SAMPLE INSIGHT · FOR DEMONSTRATION</div>
    </article>
  );
}
