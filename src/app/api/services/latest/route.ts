import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { executeQuery } from "@/lib/databricks";

export async function GET() {
  try {
    // --- Step 1: Check authentication ---
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to access this data." },
        { status: 401 }
      );
    }

    // --- Step 2: Query Databricks ---
    const result = await executeQuery(
      "SELECT * FROM default.service_latest_status ORDER BY service_name"
    );

    // --- Step 3: Return the data ---
    return NextResponse.json({
      success: true,
      data: result.data,
      columns: result.columns,
      rowCount: result.rowCount,
      queriedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error fetching latest service status:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch latest service status from Databricks.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}