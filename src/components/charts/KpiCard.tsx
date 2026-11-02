// Generic KPI card with optional delta badge and custom children.
"use client";

import { DeltaBadge } from "@/components/adoption/DeltaBadge";

export interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  delta?: number;
  deltaSuffix?: string;
  note: string;
  accentColor: string;
  children?: React.ReactNode;
}

export default function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaSuffix,
  note,
  accentColor,
  children,
}: KpiCardProps) {
  return (
    <article
      className="sa-kpi"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      <div className="sa-kpi-label">{label}</div>
      <div className="sa-kpi-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>
      {delta !== undefined && (
        <DeltaBadge value={delta} suffix={deltaSuffix} />
      )}
      <div className="sa-kpi-note">{note}</div>
      {children}
    </article>
  );
}
