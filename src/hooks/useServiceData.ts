// =================================================================
// src/hooks/useServiceData.ts
// =================================================================
// Custom React hook for fetching service monitoring data.
// This hook handles loading states, errors, and data caching.
//
// Usage in a component:
//   const { summary, latestStatus, loading, error, refresh } = useServiceData();
// =================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  ServiceSummary,
  ServiceLatestStatus,
  ApiResponse,
} from "@/types/services";

/**
 * The shape of data returned by this hook.
 */
interface UseServiceDataReturn {
  summary: ServiceSummary[];
  latestStatus: ServiceLatestStatus[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

/**
 * Custom hook that fetches service data from our API endpoints.
 *
 * How it works:
 * 1. When the component mounts, it fetches data from both API endpoints
 * 2. While fetching, `loading` is true
 * 3. When done, either `data` is populated or `error` has a message
 * 4. Call `refresh()` to re-fetch the data
 */
export function useServiceData(): UseServiceDataReturn {
  // --- State ---
  // useState creates a value that React "remembers" between renders.
  // When the value changes, React re-renders the component.

  const [summary, setSummary] = useState<ServiceSummary[]>([]);
  const [latestStatus, setLatestStatus] = useState<ServiceLatestStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // --- Fetch function ---
  // useCallback memoizes the function so it does not get recreated on every render.
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch both endpoints in parallel using Promise.all
      // This is faster than fetching one after the other
      const [summaryResponse, latestResponse] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/services/latest"),
      ]);

      // Check if the summary endpoint returned an error
      if (!summaryResponse.ok) {
        if (summaryResponse.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(
          `Failed to fetch service summary (HTTP ${summaryResponse.status})`
        );
      }

      // Check if the latest status endpoint returned an error
      if (!latestResponse.ok) {
        if (latestResponse.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(
          `Failed to fetch latest status (HTTP ${latestResponse.status})`
        );
      }

      // Parse the JSON responses
      const summaryData: ApiResponse<ServiceSummary> =
        await summaryResponse.json();
      const latestData: ApiResponse<ServiceLatestStatus> =
        await latestResponse.json();

      // Check if the API reported success
      if (!summaryData.success) {
        throw new Error(summaryData.error || "Failed to load service summary");
      }
      if (!latestData.success) {
        throw new Error(
          latestData.error || "Failed to load latest status"
        );
      }

      // Update state with the fetched data
      setSummary(summaryData.data);
      setLatestStatus(latestData.data);
      setLastUpdated(new Date());
    } catch (err) {
      // If anything goes wrong, store the error message
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
    } finally {
      // Whether success or failure, we are no longer loading
      setLoading(false);
    }
  }, []);

  // --- Effect ---
  // useEffect runs code when the component mounts (appears on screen).
  // The empty array [] means "run this once when the component first loads."
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    summary,
    latestStatus,
    loading,
    error,
    lastUpdated,
    refresh: fetchData,
  };
}