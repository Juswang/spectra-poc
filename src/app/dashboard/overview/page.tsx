// Overview tab: KPI cards, trend chart, insight panel, agency table.
"use client";

import { useDashboard } from "@/components/adoption/DashboardContext";
import { useAdoptionData } from "@/hooks/useAdoptionData";
import AdoptionKpiCards from "@/components/adoption/AdoptionKpiCards";
import AdoptionTrendChart from "@/components/adoption/AdoptionTrendChart";
import AdoptionInsightPanel from "@/components/adoption/AdoptionInsightPanel";
import AdoptionAgencyTable from "@/components/adoption/AdoptionAgencyTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import type { KpiCardConfig } from "@/types/adoption";
import { compact } from "@/lib/format";

function calcDelta(current: number, previous: number): number {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

export default function OverviewPage() {
  const { month, selectedAgencies } = useDashboard();
  const { data, loading, error, refresh } = useAdoptionData(month, selectedAgencies);

  if (loading && !data) return <LoadingSpinner />;
  if (error && !data) return <ErrorDisplay message={error} onRetry={refresh} />;
  if (!data) return null;

  const cards: KpiCardConfig[] = [
    { title: "Active product accounts", value: compact(data.currentTotals.active), deltaPercent: calcDelta(data.currentTotals.active, data.previousTotals.active), note: "Across Exchange, Teams & Zoom", colorIndex: 0 },
    { title: "Meetings & calls", value: compact(data.currentTotals.sessions), deltaPercent: calcDelta(data.currentTotals.sessions, data.previousTotals.sessions), note: "Teams & Zoom sessions", colorIndex: 1 },
    { title: "Spam emails blocked", value: compact(data.currentTotals.spam), deltaPercent: calcDelta(data.currentTotals.spam, data.previousTotals.spam), note: "Microsoft Exchange", colorIndex: 2 },
    { title: "Account adoption", value: data.currentTotals.adoption.toFixed(1), unit: "%", deltaPercent: calcDelta(data.currentTotals.adoption, data.previousTotals.adoption), note: "Active / provisioned accounts", colorIndex: 3 },
  ];

  return (
    <>
      <AdoptionKpiCards cards={cards} />
      <section className="sa-charts">
        <AdoptionTrendChart trend={data.trend} />
        <AdoptionInsightPanel
          totalActive={data.currentTotals.active}
          adoptionPercent={data.currentTotals.adoption}
          topAgencyName={data.topAgency?.name || null}
        />
      </section>
      <AdoptionAgencyTable agencies={data.agencies} />
    </>
  );
}
