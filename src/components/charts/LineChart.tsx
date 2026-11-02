// Generic line chart with hover tooltips, optional threshold line, and dual-axis support.
"use client";

import { compact, full } from "@/lib/format";
import { useChartHover } from "@/hooks/useChartHover";
import ChartTooltip from "./ChartTooltip";

export interface LineChartSeries {
  name: string;
  values: number[];
  color: string;
  yAxis?: "left" | "right";
  format?: (v: number) => string;
}

export interface LineChartProps {
  labels: string[];
  series: LineChartSeries[];
  threshold?: { value: number; label: string; color: string };
  rightAxisMax?: number;
  rightAxisFormat?: (v: number) => string;
}

export default function LineChart({
  labels,
  series,
  threshold,
  rightAxisMax,
  rightAxisFormat,
}: LineChartProps) {
  const W = 650, H = 220;
  const left = 52, right = rightAxisMax != null ? 48 : 20, top = 14, bottom = 35;
  const plotW = W - left - right;
  const plotH = H - top - bottom;
  const n = labels.length;

  const leftSeries = series.filter((s) => s.yAxis !== "right");
  const leftMax = Math.max(
    1,
    threshold?.value ?? 0,
    ...leftSeries.flatMap((s) => s.values)
  ) * 1.15;

  const rMax = rightAxisMax ?? 5;

  const x = (i: number) => left + (i * plotW) / (n - 1);
  const yLeft = (v: number) => top + (1 - v / leftMax) * plotH;
  const yRight = (v: number) => top + (1 - v / rMax) * plotH;
  const getY = (s: LineChartSeries, v: number) =>
    s.yAxis === "right" ? yRight(v) : yLeft(v);

  const labelInterval = Math.max(1, Math.ceil(n / 6));
  const hover = useChartHover(n, W, left, right);
  const hi = hover.hoverIndex;

  const defaultFormat = (v: number) => full(v);

  return (
    <div
      className="sa-zoom-chart sa-chart-hover-wrap"
      ref={hover.containerRef}
      onMouseMove={hover.onMouseMove}
      onMouseLeave={hover.onMouseLeave}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img">
        {[0, 1, 2, 3, 4].map((i) => {
          const gy = top + (plotH * i) / 4;
          return (
            <g key={i}>
              <line x1={left} y1={gy} x2={W - right} y2={gy} stroke="var(--color-border-chart-grid)" strokeDasharray="3 4" />
              <text x={left - 9} y={gy + 4} fontSize="10" textAnchor="end" fill="var(--color-text-tertiary)">
                {compact(leftMax * (1 - i / 4))}
              </text>
              {rightAxisFormat && (
                <text x={W - right + 9} y={gy + 4} fontSize="10" textAnchor="start" fill="var(--color-text-tertiary)">
                  {rightAxisFormat(rMax * (1 - i / 4))}
                </text>
              )}
            </g>
          );
        })}
        {threshold && (() => {
          const ty = yLeft(threshold.value);
          return (
            <>
              <line x1={left} y1={ty} x2={W - right} y2={ty} stroke={threshold.color} strokeWidth="1.5" strokeDasharray="6 4" />
              <text x={W - right - 4} y={ty - 6} fontSize="9" fontWeight="700" textAnchor="end" fill={threshold.color}>
                {threshold.label}
              </text>
            </>
          );
        })()}
        {labels.map((label, i) => {
          if (i % labelInterval !== 0 && i !== n - 1) return null;
          return (
            <text key={i} x={x(i)} y={H - 9} textAnchor="middle" fontSize="10" fill="var(--color-text-tertiary)">
              {label}
            </text>
          );
        })}
        {series.map((s) => {
          const pts = s.values.map((v, i) => `${x(i)},${getY(s, v)}`).join(" ");
          return (
            <g key={s.name}>
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2.5" />
              {s.values.map((v, i) => (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={getY(s, v)}
                  r={hi === i ? 5 : n > 8 ? 2.5 : 4}
                  fill={hi === i ? s.color : "var(--color-bg-surface)"}
                  stroke={s.color}
                  strokeWidth={n > 8 ? 1.5 : 2}
                />
              ))}
            </g>
          );
        })}
        {hi !== null && (
          <line x1={x(hi)} y1={top} x2={x(hi)} y2={top + plotH} stroke="var(--color-border-input)" strokeWidth="1" strokeDasharray="4 3" />
        )}
      </svg>
      {hi !== null && (
        <ChartTooltip
          visible
          x={hover.mouseX}
          y={hover.mouseY}
          containerWidth={hover.containerRef.current?.offsetWidth ?? W}
          heading={labels[hi]}
          entries={series.map((s) => ({
            label: s.name,
            value: (s.format ?? defaultFormat)(s.values[hi]),
            color: s.color,
          }))}
        />
      )}
    </div>
  );
}
