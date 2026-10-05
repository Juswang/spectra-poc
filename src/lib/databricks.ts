// =================================================================
// src/lib/databricks.ts
// =================================================================
// This module handles all communication with Databricks.
// It provides a function to execute SQL queries against
// Databricks using the SQL Statement Execution API.
//
// IMPORTANT: This file runs on the Next.js SERVER only.
// It is never sent to the browser.
// The Databricks token is only accessible here.
// =================================================================

// --- Configuration ---
// Read connection details from environment variables.
// These are set in .env.local and are only available on the server.

const DATABRICKS_HOST = process.env.DATABRICKS_HOST;
const DATABRICKS_TOKEN = process.env.DATABRICKS_TOKEN;
const DATABRICKS_HTTP_PATH = process.env.DATABRICKS_HTTP_PATH;

// --- Type Definitions ---
// TypeScript types describe the shape of data.
// They help catch errors before the code runs.

/** Represents a single row of data returned from Databricks */
interface DatabricksRow {
  [key: string]: string | number | boolean | null;
}

/** The structure of a successful query result */
interface DatabricksQueryResult {
  columns: string[];
  data: DatabricksRow[];
  rowCount: number;
}

/** The structure returned by the Databricks SQL Statement API */
interface DatabricksStatementResponse {
  statement_id: string;
  status: {
    state: "SUCCEEDED" | "FAILED" | "RUNNING" | "PENDING" | "CANCELED" | "CLOSED";
    error?: {
      message: string;
      error_code: string;
    };
  };
  manifest?: {
    schema: {
      columns: Array<{ name: string; type_name: string }>;
    };
    total_row_count: number;
  };
  result?: {
    data_array?: Array<Array<string | null>>;
  };
}

// --- Validation ---
// Check that all required environment variables are set.
// If any are missing, the application cannot connect to Databricks.

function validateConfig(): void {
  if (!DATABRICKS_HOST) {
    throw new Error(
      "DATABRICKS_HOST environment variable is not set. " +
      "Add it to your .env.local file. " +
      "Example: https://adb-1234567890.12.azuredatabricks.net"
    );
  }
  if (!DATABRICKS_TOKEN) {
    throw new Error(
      "DATABRICKS_TOKEN environment variable is not set. " +
      "Add your Databricks Personal Access Token to .env.local."
    );
  }
  if (!DATABRICKS_HTTP_PATH) {
    throw new Error(
      "DATABRICKS_HTTP_PATH environment variable is not set. " +
      "Add your SQL Warehouse HTTP path to .env.local. " +
      "Find it at: SQL Warehouses → your warehouse → Connection details."
    );
  }
}

// --- Main Function: Execute a SQL Query ---

/**
 * Executes a SQL query on Databricks and returns the results.
 *
 * How this works:
 * 1. We send an HTTP POST request to the Databricks SQL Statement API
 * 2. The request includes our SQL query and the SQL Warehouse to use
 * 3. For small queries like ours, results come back immediately
 * 4. We parse the results into a clean format
 *
 * This uses the Databricks SQL Statement Execution API (/api/2.0/sql/statements).
 *
 * @param sql - The SQL query to execute (e.g., "SELECT * FROM main.default.my_table")
 * @returns An object containing columns, data rows, and row count
 */
export async function executeQuery(sql: string): Promise<DatabricksQueryResult> {
  validateConfig();

  // Remove trailing slash from host if present
  const host = DATABRICKS_HOST!.replace(/\/$/, "");

  // Extract the warehouse ID from the HTTP path
  // HTTP path looks like: /sql/1.0/warehouses/abcdef1234567890
  // We need just the last part: abcdef1234567890
  const warehouseId = DATABRICKS_HTTP_PATH!.split("/").pop();

  // --- Send the SQL query to Databricks ---
  // This is a single HTTP POST request. For small queries (like ours),
  // Databricks returns the results immediately in the response.

  const response = await fetch(
    `${host}/api/2.0/sql/statements`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DATABRICKS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        warehouse_id: warehouseId,
        statement: sql,
        wait_timeout: "30s",   // Wait up to 30 seconds for results
        disposition: "INLINE", // Return results directly in the response
        format: "JSON_ARRAY",  // Return data as arrays (easier to parse)
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Databricks API request failed. ` +
      `Status: ${response.status}. ` +
      `Response: ${errorText}. ` +
      `Make sure your SQL Warehouse is running and your token is valid.`
    );
  }

  const result: DatabricksStatementResponse = await response.json();

  // --- Check if the query succeeded ---

  if (result.status.state === "FAILED") {
    throw new Error(
      `Databricks query failed: ${result.status.error?.message || "Unknown error"}. ` +
      `Error code: ${result.status.error?.error_code || "N/A"}.`
    );
  }

  if (result.status.state !== "SUCCEEDED") {
    throw new Error(
      `Databricks query did not complete. State: ${result.status.state}. ` +
      `The query may have timed out. Try running it directly in the Databricks SQL editor.`
    );
  }

  // --- Parse the results ---
  // Convert the raw Databricks response into a clean format.

  if (!result.manifest || !result.result?.data_array) {
    return { columns: [], data: [], rowCount: 0 };
  }

  // Extract column names from the manifest
  const columns = result.manifest.schema.columns.map((col) => col.name);

  // Convert the array-of-arrays format into an array of objects
  // Databricks returns: [["value1", "value2"], ["value3", "value4"]]
  // We convert to: [{col1: "value1", col2: "value2"}, {col1: "value3", col2: "value4"}]
  const data: DatabricksRow[] = result.result.data_array.map((row) => {
    const obj: DatabricksRow = {};
    columns.forEach((col, index) => {
      const value = row[index];
      // Try to convert numeric strings to numbers
      if (value !== null && !isNaN(Number(value)) && value !== "") {
        obj[col] = Number(value);
      } else {
        obj[col] = value;
      }
    });
    return obj;
  });

  return {
    columns,
    data,
    rowCount: data.length,
  };
}