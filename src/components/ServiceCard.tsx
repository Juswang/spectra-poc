// =================================================================
// src/components/ServiceCard.tsx
// =================================================================
// A card displaying details about a single service.
// Shows the service name, status badge, uptime %, and response time.
// =================================================================

import StatusBadge from "./StatusBadge";
import type { ServiceSummary, ServiceLatestStatus } from "@/types/services";

interface ServiceCardProps {
  summary: ServiceSummary;
  latestStatus?: ServiceLatestStatus;
}

export default function ServiceCard({ summary, latestStatus }: ServiceCardProps) {
  const status = latestStatus?.status || "UNKNOWN";
  const responseTime = latestStatus?.response_time_ms ?? 0;

  // Determine uptime color
  let uptimeColor = "text-green-600";
  if (summary.uptime_percentage < 80) {
    uptimeColor = "text-red-600";
  } else if (summary.uptime_percentage < 95) {
    uptimeColor = "text-yellow-600";
  }

  // Determine response time color
  let responseColor = "text-gray-600";
  if (responseTime > 300) {
    responseColor = "text-yellow-600";
  }
  if (responseTime > 500) {
    responseColor = "text-red-600";
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow">
      {/* Header: Service name and status badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {summary.service_name}
        </h3>
        <StatusBadge status={status} />
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {/* Uptime percentage */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Uptime</span>
          <span className={`text-lg font-bold ${uptimeColor}`}>
            {summary.uptime_percentage}%
          </span>
        </div>

        {/* Uptime bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              summary.uptime_percentage >= 95
                ? "bg-green-500"
                : summary.uptime_percentage >= 80
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${summary.uptime_percentage}%` }}
          />
        </div>

        {/* Average response time */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Avg Response</span>
          <span className={`text-sm font-medium ${responseColor}`}>
            {summary.avg_response_time_ms.toFixed(0)} ms
          </span>
        </div>

        {/* Total checks */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Checks</span>
          <span className="text-sm font-medium text-gray-700">
            {summary.up_count}/{summary.total_checks}
          </span>
        </div>

        {/* Last checked time */}
        {latestStatus && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">Last checked</span>
            <span className="text-xs text-gray-400">
              {new Date(latestStatus.checked_at).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}