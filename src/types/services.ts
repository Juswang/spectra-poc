// =================================================================
// src/types/services.ts
// =================================================================
// TypeScript type definitions for the service monitoring data.
// These interfaces describe the shape of data returned by our API.
//
// Think of interfaces like templates or blueprints — they define
// what fields an object must have and what type each field is.
// =================================================================

/**
 * Represents the summary metrics for a single service.
 * Returned by the GET /api/services endpoint.
 *
 * Example:
 * {
 *   service_name: "Outlook",
 *   total_checks: 3,
 *   up_count: 3,
 *   avg_response_time_ms: 132.3,
 *   max_response_time_ms: 142,
 *   uptime_percentage: 100.0
 * }
 */
export interface ServiceSummary {
  service_name: string;
  total_checks: number;
  up_count: number;
  avg_response_time_ms: number;
  max_response_time_ms: number;
  first_checked: string;
  last_checked: string;
  uptime_percentage: number;
}

/**
 * Represents the latest status check for a single service.
 * Returned by the GET /api/services/latest endpoint.
 *
 * Example:
 * {
 *   service_name: "Teams",
 *   status: "DOWN",
 *   response_time_ms: 0,
 *   checked_at: "2026-09-30T10:10:00.000Z"
 * }
 */
export interface ServiceLatestStatus {
  service_name: string;
  status: string;
  response_time_ms: number;
  checked_at: string;
}

/**
 * The standard shape of API responses from our backend.
 * The generic type T is replaced with the actual data type
 * (ServiceSummary or ServiceLatestStatus).
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T[];
  columns: string[];
  rowCount: number;
  queriedAt: string;
  error?: string;
  details?: string;
}