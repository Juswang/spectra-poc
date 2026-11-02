// Filter bar: month picker, agency multi-select dropdown, period mode toggle.
"use client";

import { useState, useRef, useEffect } from "react";
import type { AdoptionMonth, AgencyOption, PeriodMode } from "@/types/adoption";

interface AdoptionFiltersProps {
  month: string;
  onMonthChange: (month: string) => void;
  availableMonths: AdoptionMonth[];
  selectedAgencies: string[];
  allAgencies: AgencyOption[];
  onToggleAgency: (code: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onReset: () => void;
  contextLabel: string;
  periodMode?: PeriodMode;
  onPeriodModeChange?: (mode: PeriodMode) => void;
}

export default function AdoptionFilters({
  month,
  onMonthChange,
  availableMonths,
  selectedAgencies,
  allAgencies,
  onToggleAgency,
  onSelectAll,
  onClearAll,
  onReset,
  contextLabel,
  periodMode,
  onPeriodModeChange,
}: AdoptionFiltersProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const filtered = allAgencies.filter((a) =>
    `${a.name} ${a.code}`.toLowerCase().includes(search.toLowerCase())
  );

  const summaryText =
    selectedAgencies.length === allAgencies.length
      ? `All ${allAgencies.length} agencies`
      : `${selectedAgencies.length} agencies selected`;

  const isQuarter = periodMode === "quarter";

  function toQuarterLabel(monthValue: string): string {
    const m = parseInt(monthValue.split("-")[1], 10);
    const y = monthValue.split("-")[0];
    const q = Math.ceil(m / 3);
    return `Q${q} ${y}`;
  }

  const quarterEndMonths = new Set([3, 6, 9, 12]);
  const displayMonths = isQuarter
    ? availableMonths.filter((m) => quarterEndMonths.has(parseInt(m.value.split("-")[1], 10)))
    : availableMonths;

  return (
    <>
      <section className="sa-filters">
        <div>
          <label>{periodMode ? "Reporting period" : "Reporting month"}</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {periodMode && onPeriodModeChange && (
              <select
                className="sa-period-mode-select"
                value={periodMode}
                onChange={(e) => {
                  const newMode = e.target.value as PeriodMode;
                  onPeriodModeChange(newMode);
                  if (newMode === "quarter") {
                    const m = parseInt(month.split("-")[1], 10);
                    if (!quarterEndMonths.has(m)) {
                      const qEnd = Math.ceil(m / 3) * 3;
                      const y = month.split("-")[0];
                      const snapped = `${y}-${String(qEnd).padStart(2, "0")}`;
                      const valid = availableMonths.find((am) => am.value === snapped);
                      if (valid) onMonthChange(snapped);
                    }
                  }
                }}
              >
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
              </select>
            )}
            <select
              className="sa-month-select"
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
            >
              {displayMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {isQuarter ? toQuarterLabel(m.value) : m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sa-agency-wrap" ref={wrapRef}>
          <label>Agencies</label>
          <button
            className="sa-agency-toggle"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <span>{summaryText}</span>
            <span>⌄</span>
          </button>

          {dropdownOpen && (
            <div className="sa-agency-menu">
              <input
                className="sa-agency-search"
                type="text"
                placeholder="Search agency name or code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <div className="sa-selection-actions">
                <button onClick={onSelectAll}>Select all</button>
                <button onClick={onClearAll}>Clear all</button>
              </div>
              <div className="sa-agency-list">
                {filtered.length === 0 ? (
                  <p style={{ textAlign: "center", padding: "8px", fontSize: "12px" }}>
                    No matching agencies.
                  </p>
                ) : (
                  filtered.map((agency) => (
                    <label key={agency.code}>
                      <input
                        type="checkbox"
                        checked={selectedAgencies.includes(agency.code)}
                        onChange={() => onToggleAgency(agency.code)}
                      />
                      {agency.name}
                      <span className="sa-agency-code-label">{agency.code}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button className="sa-reset" onClick={onReset}>Reset filters</button>
        <div className="sa-scope">● Synthetic dataset</div>
      </section>

      <div className="sa-context">
        <span>{contextLabel}</span>
        {!periodMode && <span>↗ Compared with previous month</span>}
      </div>
    </>
  );
}
