// Shared delta badge: shows positive/negative % change with arrow and suffix.
"use client";

export function DeltaBadge({
  value,
  suffix,
}: {
  value: number;
  suffix?: string;
}) {
  if (value === 0) {
    return (
      <span className="sa-delta sa-neutral">No previous-period baseline</span>
    );
  }
  const isDown = value < 0;
  return (
    <span className={`sa-delta${isDown ? " sa-down" : ""}`}>
      {isDown ? "↓" : "↑"} {Math.abs(value).toFixed(1)}%{" "}
      <span className="sa-delta-context">{suffix || "vs previous period"}</span>
    </span>
  );
}
