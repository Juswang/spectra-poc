import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { executeQuery } from "@/lib/databricks";

export async function GET() {
  try {
    // --- Step 1: Check authentication ---
    // auth() checks if the user is logged in.
    // If not, session will be null.
    const session = await auth();

    if (!session) {
      // User is not logged in — reject the request
      return NextResponse.json(
        { error: "Unauthorized. Please log in to access this data." },
        { status: 401 }
      );
    }

    // --- Step 2: Query Databricks ---
    // Execute a SQL query against the service_dashboard_summary table.
    // This runs on the Databricks cluster, not on our server.
    const result = await executeQuery(
      "SELECT * FROM default.service_dashboard_summary ORDER BY service_name"
    );

    // --- Step 3: Return the data ---
    // NextResponse.json() converts our data to JSON and sets the
    // correct Content-Type header automatically.
    return NextResponse.json({
      success: true,
      data: result.data,
      columns: result.columns,
      rowCount: result.rowCount,
      queriedAt: new Date().toISOString(),
    });

  } catch (error) {
    // --- Error handling ---
    // If anything goes wrong (Databricks connection, query error, etc.),
    // return a 500 error with a helpful message.
    console.error("Error fetching service data:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch service data from Databricks.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
