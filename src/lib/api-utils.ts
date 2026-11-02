// Shared API route wrapper: withErrorHandling catches AuthError and returns proper HTTP status.
import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth-utils";

type ApiHandler = (request: Request) => Promise<NextResponse>;

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
      }
      console.error("API error:", error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json(
        { error: "Internal server error", details: message },
        { status: 500 }
      );
    }
  };
}
