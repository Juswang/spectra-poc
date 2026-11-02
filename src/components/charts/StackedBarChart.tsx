// Generic stacked bar chart with hover tooltip.
"use client";

import { useState, useRef, type MouseEvent } from "react";
import { compact, full } from "@/lib/format";
import ChartTooltip from "./ChartTooltip";

export interface BarSegment {
  name: string;
  value: number;
  color: string;
}

export interface StackedBar {
  label: string;
  segments: BarSegment[];
}

export interface StackedBarChartProps {
  bars: StackedBar[];
  width?: number;
  height?: number;
}

export default function StackedBarChart({ bars, width = 300, height = 190 }: StackedBarChartProps) {
  const left = 39, right = 5, top = 19, bottom = 29;
  const plotW = width - left - right;
  const plotH = height - top - bottom;

  const totals = bars.map((b) => b.segments.reduce((s, seg) => s + seg.value, 0));
  const max = Math.max(1, ...totals) * 1.12;
  const slotW = plotW / bars.length;
  const barW = slotW * 0.65;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<{ barIdx: number; x: number; y: number } | null>(null);

  const onMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setHover((prev) => prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : prev);
  };

  return (
    <div className="sa-chart-hover-wrap" ref={containerRef} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        {[0, 1, 2, 3].map((i) => {
          const gy = top + (plotH * i) / 3;
          return (
            <g key={i}>
              <line x1={left} y1={gy} x2={width - right} y2={gy} stroke="var(--color-border-chart-grid)" strokeDasharray="2 3" />
              <text x={left - 7} y={gy + 3} fontSize="11" textAnchor="end" fill="var(--color-text-tertiary)">{compact(max * (1 - i / 3))}</text>
            </g>
          );
        })}
        {bars.map((b, i) => {
          const bx = left + i * slotW + (slotW - barW) / 2;
          let stackH = 0;
          const isHovered = hover?.barIdx === i;
          return (
            <g
              key={i}
              opacity={hover !== null && !isHovered ? 0.5 : 1}
              onMouseEnter={(e) => {
                const rect = containerRef.current!.getBoundingClientRect();
                setHover({ barIdx: i, x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
            >
              {b.segments.map(({ name, value, color }) => {
                const segH = (value / max) * plotH;
                const sy = top + plotH - stackH - segH;
                stackH += segH;
                return <rect key={name} x={bx} y={sy} width={barW} height={segH} rx="1.5" fill={color} />;
              })}
              <text x={bx + barW / 2} y={height - 9} fontSize="11" textAnchor="middle" fill="var(--color-text-tertiary)">{b.label}</text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <ChartTooltip
          visible
          x={hover.x}
          y={hover.y}
          containerWidth={containerRef.current?.offsetWidth ?? width}
          heading={bars[hover.barIdx].label}
          entries={bars[hover.barIdx].segments.map((seg) => ({
            label: seg.name,
            value: full(seg.value),
            color: seg.color,
          }))}
        />
      )}
    </div>
  );
}
