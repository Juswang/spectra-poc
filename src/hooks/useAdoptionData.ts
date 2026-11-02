// Data hooks: useAdoptionData, useZoomData, useAdoptionFilters — fetch from /api/adoption.
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  MonthKey,
  PeriodMode,
  AdoptionOverviewData,
  AdoptionMonth,
  AgencyOption,
  ZoomTabData,
} from "@/types/adoption";

interface UseAdoptionDataReturn {
  data: AdoptionOverviewData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

interface UseAdoptionFiltersReturn {
  months: AdoptionMonth[];
  agencies: AgencyOption[];
  loading: boolean;
}

export function useAdoptionData(
  month: MonthKey,
  agencyCodes: string[]
): UseAdoptionDataReturn {
  const [data, setData] = useState<AdoptionOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const agenciesParam = agencyCodes.join(",");
      const res = await fetch(
        `/api/adoption?month=${month}&agencies=${agenciesParam}`
      );
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(`Failed to fetch adoption data (HTTP ${res.status})`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to load adoption data");
      }
      setData(json.data);
      setLastUpdated(new Date());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [month, agencyCodes]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchData, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refresh: fetchData };
}

interface UseZoomDataReturn {
  data: ZoomTabData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useZoomData(
  month: MonthKey,
  agencyCodes: string[],
  periodMode: PeriodMode
): UseZoomDataReturn {
  const [data, setData] = useState<ZoomTabData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const agenciesParam = agencyCodes.join(",");
      const res = await fetch(
        `/api/adoption?tab=zoom&month=${month}&agencies=${agenciesParam}&periodMode=${periodMode}`
      );
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(`Failed to fetch zoom data (HTTP ${res.status})`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to load zoom data");
      }
      setData(json.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [month, agencyCodes, periodMode]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchData, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

export function useAdoptionFilters(): UseAdoptionFiltersReturn {
  const [months, setMonths] = useState<AdoptionMonth[]>([]);
  const [agencies, setAgencies] = useState<AgencyOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/adoption/filters");
        const json = await res.json();
        if (json.success) {
          setMonths(json.data.months);
          setAgencies(json.data.agencies);
        }
      } catch {
        // Filter options are non-critical
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { months, agencies, loading };
}
