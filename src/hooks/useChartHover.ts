// Shared hook for tracking which data point the mouse is nearest to in a chart.
"use client";

import { useState, useCallback, useRef, type MouseEvent } from "react";

interface ChartHoverState {
  hoverIndex: number | null;
  mouseX: number;
  mouseY: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMouseMove: (e: MouseEvent) => void;
  onMouseLeave: () => void;
}

export function useChartHover(
  dataCount: number,
  svgWidth: number,
  plotLeft: number,
  plotRight: number
): ChartHoverState {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el || dataCount < 2) return;
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      const scaleX = rect.width / svgWidth;
      const svgX = relX / scaleX;
      const plotWidth = svgWidth - plotLeft - plotRight;
      const fraction = (svgX - plotLeft) / plotWidth;
      const idx = Math.round(fraction * (dataCount - 1));
      const clamped = Math.max(0, Math.min(dataCount - 1, idx));

      setHoverIndex(clamped);
      setMouseX(relX);
      setMouseY(relY);
    },
    [dataCount, svgWidth, plotLeft, plotRight]
  );

  const onMouseLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);

  return { hoverIndex, mouseX, mouseY, containerRef, onMouseMove, onMouseLeave };
}
