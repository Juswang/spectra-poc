// =================================================================
// src/app/dashboard/page.tsx
// =================================================================
// The main dashboard page.
// Fetches service data from the API and displays it using
// the components we created.
//
// "use client" is required because this component uses React hooks
// (useServiceData, useSession) which only work in client components.
// =================================================================

"use client";

import { useSession } from "next-auth/react";
import { useServiceData } from "@/hooks/useServiceData";
import SummaryStats from "@/components/SummaryStats";
import ServiceCard from "@/components/ServiceCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { summary, latestStatus, loading, error, lastUpdated, refresh } =
    useServiceData();

  // Show loading spinner while data is being fetched
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show error display if something went wrong
  if (error) {
    return <ErrorDisplay message={error} onRetry={refresh} />;
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Service Monitor Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome, {session?.user?.name || "User"}. Here is the current status
          of your services.
        </p>
      </div>

      {/* Summary statistics row */}
      <SummaryStats summary={summary} latestStatus={latestStatus} />

      {/* Service cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {summary.map((service) => {
          // Find the matching latest status for this service
          const latest = latestStatus.find(
            (ls) => ls.service_name === service.service_name
          );
          return (
            <ServiceCard
              key={service.service_name}
              summary={service}
              latestStatus={latest}
            />
          );
        })}
      </div>

      {/* Footer: refresh button and last updated time */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <button
          onClick={refresh}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
        {lastUpdated && (
          <p className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}