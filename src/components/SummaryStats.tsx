// =================================================================
// src/components/SummaryStats.tsx
// =================================================================
// Displays summary statistics at the top of the dashboard.
// Shows: total services, services up, services down, average uptime.
// =================================================================

import type { ServiceSummary, ServiceLatestStatus } from "@/types/services";

interface SummaryStatsProps {
  summary: ServiceSummary[];
  latestStatus: ServiceLatestStatus[];
}

export default function SummaryStats({ summary, latestStatus }: SummaryStatsProps) {
  const totalServices = summary.length;
  const servicesUp = latestStatus.filter(
    (s) => s.status.toUpperCase() === "UP"
  ).length;
  const servicesDown = totalServices - servicesUp;
  const averageUptime =
    totalServices > 0
      ? summary.reduce((sum, s) => sum + s.uptime_percentage, 0) / totalServices
      : 0;

  const stats = [
    {
      label: "Total Services",
      value: totalServices.toString(),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Services Up",
      value: servicesUp.toString(),
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      label: "Services Down",
      value: servicesDown.toString(),
      color: servicesDown > 0 ? "text-red-600" : "text-green-600",
      bgColor: servicesDown > 0 ? "bg-red-50" : "bg-green-50",
      borderColor: servicesDown > 0 ? "border-red-200" : "border-green-200",
    },
    {
      label: "Avg Uptime",
      value: `${averageUptime.toFixed(1)}%`,
      color:
        averageUptime >= 95
          ? "text-green-600"
          : averageUptime >= 80
          ? "text-yellow-600"
          : "text-red-600",
      bgColor:
        averageUptime >= 95
          ? "bg-green-50"
          : averageUptime >= 80
          ? "bg-yellow-50"
          : "bg-red-50",
      borderColor:
        averageUptime >= 95
          ? "border-green-200"
          : averageUptime >= 80
          ? "border-yellow-200"
          : "border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-4 text-center`}
        >
          <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
          <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}