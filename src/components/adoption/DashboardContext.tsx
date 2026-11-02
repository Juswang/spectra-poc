// React context: shared dashboard state (month, agencies, period mode, activity type).
"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useAdoptionFilters } from "@/hooks/useAdoptionData";
import type { AdoptionMonth, AgencyOption, PeriodMode } from "@/types/adoption";

interface DashboardContextValue {
  months: AdoptionMonth[];
  allAgencies: AgencyOption[];
  filtersLoading: boolean;
  month: string;
  setMonth: (m: string) => void;
  selectedAgencies: string[];
  toggleAgency: (code: string) => void;
  selectAllAgencies: () => void;
  clearAllAgencies: () => void;
  resetFilters: () => void;
  periodMode: PeriodMode;
  setPeriodMode: (m: PeriodMode) => void;
  activityType: "meetings" | "webinars";
  setActivityType: (t: "meetings" | "webinars") => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { months, agencies: allAgencies, loading: filtersLoading } = useAdoptionFilters();
  const [month, setMonth] = useState("2026-10");
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [periodMode, setPeriodMode] = useState<PeriodMode>("month");
  const [activityType, setActivityType] = useState<"meetings" | "webinars">("meetings");

  if (!initialized && !filtersLoading && allAgencies.length > 0) {
    setSelectedAgencies(allAgencies.map((a) => a.code));
    setInitialized(true);
  }

  const toggleAgency = useCallback((code: string) => {
    setSelectedAgencies((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }, []);

  const selectAllAgencies = useCallback(() => {
    setSelectedAgencies(allAgencies.map((a) => a.code));
  }, [allAgencies]);

  const clearAllAgencies = useCallback(() => {
    setSelectedAgencies([]);
  }, []);

  const resetFilters = useCallback(() => {
    setMonth("2026-10");
    setPeriodMode("month");
    setActivityType("meetings");
    setSelectedAgencies(allAgencies.map((a) => a.code));
  }, [allAgencies]);

  return (
    <DashboardContext.Provider
      value={{
        months,
        allAgencies,
        filtersLoading,
        month,
        setMonth,
        selectedAgencies,
        toggleAgency,
        selectAllAgencies,
        clearAllAgencies,
        resetFilters,
        periodMode,
        setPeriodMode,
        activityType,
        setActivityType,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
