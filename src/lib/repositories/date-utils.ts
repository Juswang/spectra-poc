// Date/period utilities: month-key offsets, formatting, reporting step/label computation.
import type { MonthKey, PeriodMode } from "@/types/adoption";

export function monthOffset(monthKey: MonthKey): number {
  const [year, month] = monthKey.split("-").map(Number);
  return (year - 2025) * 12 + (month - 10);
}

export function offsetToKey(offset: number): MonthKey {
  const totalMonth = 9 + offset;
  const year = 2025 + Math.floor(totalMonth / 12);
  const month = (totalMonth % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function formatMonthLabel(key: MonthKey): string {
  const [year] = key.split("-").map(Number);
  const [, month] = key.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return (
    d.toLocaleDateString("en", { month: "short" }) +
    " " +
    String(year).slice(2)
  );
}

export function reportingStep(periodMode: PeriodMode): number {
  return periodMode === "quarter" ? 3 : 1;
}

export function reportingShortLabel(
  monthKey: MonthKey,
  periodMode: PeriodMode
): string {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  if (periodMode === "quarter") {
    return `Q${Math.floor(d.getMonth() / 3) + 1} ${String(year).slice(2)}`;
  }
  return d.toLocaleDateString("en", { month: "short" });
}
