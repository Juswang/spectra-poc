// Shared hover card for line charts — shows all series values at a data point.
"use client";

export interface TooltipEntry {
  label: string;
  value: string;
  color: string;
}

interface Props {
  visible: boolean;
  x: number;
  y: number;
  containerWidth: number;
  heading: string;
  entries: TooltipEntry[];
}

export default function ChartTooltip({
  visible,
  x,
  y,
  containerWidth,
  heading,
  entries,
}: Props) {
  if (!visible) return null;

  const flipSide = x > containerWidth * 0.65;

  return (
    <div
      className="sa-chart-tooltip"
      style={{
        left: x,
        top: y,
        transform: flipSide
          ? "translate(calc(-100% - 12px), -50%)"
          : "translate(12px, -50%)",
      }}
    >
      <div className="sa-chart-tooltip-heading">{heading}</div>
      {entries.map((entry) => (
        <div key={entry.label} className="sa-chart-tooltip-row">
          <span
            className="sa-chart-tooltip-dot"
            style={{ background: entry.color }}
          />
          <span className="sa-chart-tooltip-label">{entry.label}</span>
          <span className="sa-chart-tooltip-value">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
