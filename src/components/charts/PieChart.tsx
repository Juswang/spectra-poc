// Generic pie chart with hover tooltip showing all segments.
"use client";

import { useState, useRef, type MouseEvent } from "react";
import { full } from "@/lib/format";
import ChartTooltip from "./ChartTooltip";

export interface PieSegment {
  name: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  segments: PieSegment[];
  width?: number;
  height?: number;
}

export default function PieChart({ segments, width = 300, height = 190 }: PieChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<{ idx: number; x: number; y: number } | null>(null);

  if (!total) return null;

  const cx = width / 2, cy = (height - 20) / 2;
  const r = Math.min(width, height - 30) * 0.36;
  let angle = -Math.PI / 2;

  const onMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setHover((prev) => prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : prev);
  };

  return (
    <div className="sa-chart-hover-wrap" ref={containerRef} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        {segments.map(({ name, value, color }, idx) => {
          if (!value) return null;
          const sa = (value / total) * Math.PI * 2;
          const endAngle = angle + sa;
          const sx = cx + r * Math.cos(angle);
          const sy = cy + r * Math.sin(angle);
          const ex = cx + r * Math.cos(endAngle);
          const ey = cy + r * Math.sin(endAngle);
          const largeArc = sa > Math.PI ? 1 : 0;
          const path = (
            <path
              key={name}
              d={`M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey} Z`}
              fill={color}
              stroke="var(--color-bg-surface)"
              strokeWidth="2"
              opacity={hover !== null && hover.idx !== idx ? 0.5 : 1}
              onMouseEnter={(e) => {
                const rect = containerRef.current!.getBoundingClientRect();
                setHover({ idx, x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
            />
          );
          angle = endAngle;
          return path;
        })}
        <text x={cx} y={height - 5} fontSize="9" fontWeight="700" textAnchor="middle" fill="var(--color-text-label)">
          Total · {full(total)}
        </text>
      </svg>
      {hover !== null && (
        <ChartTooltip
          visible
          x={hover.x}
          y={hover.y}
          containerWidth={containerRef.current?.offsetWidth ?? width}
          heading={`Total: ${full(total)}`}
          entries={segments.map((s) => ({
            label: s.name,
            value: `${full(s.value)} (${((s.value / total) * 100).toFixed(1)}%)`,
            color: s.color,
          }))}
        />
      )}
    </div>
  );
}
