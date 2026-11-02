// GET /api/services/latest — queries Databricks for latest service status.
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { withErrorHandling } from "@/lib/api-utils";
import { executeQuery } from "@/lib/databricks";

export const GET = withErrorHandling(async () => {
  await requireRole("ADMIN", "EDITOR", "VIEWER");

  const result = await executeQuery(
    "SELECT * FROM default.service_latest_status ORDER BY service_name"
  );

  return NextResponse.json({
    success: true,
    data: result.data,
    columns: result.columns,
    rowCount: result.rowCount,
    queriedAt: new Date().toISOString(),
  });
});
