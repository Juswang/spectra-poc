// GET /api/services — queries Databricks for service dashboard summary.
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { withErrorHandling } from "@/lib/api-utils";
import { executeQuery } from "@/lib/databricks";

export const GET = withErrorHandling(async () => {
  await requireRole("ADMIN", "EDITOR", "VIEWER");

  const result = await executeQuery(
    "SELECT * FROM default.service_dashboard_summary ORDER BY service_name"
  );

  return NextResponse.json({
    success: true,
    data: result.data,
    columns: result.columns,
    rowCount: result.rowCount,
    queriedAt: new Date().toISOString(),
  });
});
