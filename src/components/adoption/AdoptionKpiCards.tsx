// KPI card grid: renders metric cards with values, deltas, and accent colors.
"use client";

import type { KpiCardConfig } from "@/types/adoption";
import { CHART_COLORS } from "@/lib/chart-colors";
import { KpiCard } from "@/components/charts";

interface AdoptionKpiCardsProps {
  cards: KpiCardConfig[];
}

export default function AdoptionKpiCards({ cards }: AdoptionKpiCardsProps) {
  return (
    <section className="sa-kpis">
      {cards.map((card) => (
        <KpiCard
          key={card.title}
          label={card.title}
          value={card.value}
          unit={card.unit}
          delta={card.deltaPercent}
          deltaSuffix="vs previous month"
          note={card.note}
          accentColor={CHART_COLORS[card.colorIndex]}
        />
      ))}
    </section>
  );
}
