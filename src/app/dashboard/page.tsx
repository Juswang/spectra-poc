"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useServiceData } from "@/hooks/useServiceData";
import { useRole } from "@/lib/client-auth-utils";
import SummaryStats from "@/components/SummaryStats";
import ServiceCard from "@/components/ServiceCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { role, isAdmin, agencyNames } = useRole();
  const { summary, latestStatus, loading, error, lastUpdated, refresh } =
    useServiceData();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refresh} />;
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Service Monitor Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome, {session?.user?.name || "User"}.
            {agencyNames.length > 0 && (
              <span>
                {" "}Viewing services for:{" "}
                <span className="font-medium text-gray-700">
                  {agencyNames.join(", ")}
                </span>
              </span>
            )}
            {isAdmin && agencyNames.length === 0 && (
              <span> Viewing all services across all agencies.</span>
            )}
            {!isAdmin && agencyNames.length === 0 && (
              <span> No agencies assigned — contact an admin.</span>
            )}
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
          >
            Admin Panel
          </Link>
        )}
      </div>

      <SummaryStats summary={summary} latestStatus={latestStatus} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {summary.map((service) => {
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