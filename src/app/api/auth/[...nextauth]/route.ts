import { handlers } from "@/auth";
import { NextRequest } from "next/server";

export const POST = handlers.POST;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  if (
    url.pathname === "/api/auth/callback/govauth" &&
    !url.searchParams.has("iss")
  ) {
    url.searchParams.set("iss", "https://govauth.sandbox.gov.sg/api/auth");
    const modifiedRequest = new NextRequest(url.toString(), {
      method: request.method,
      headers: request.headers,
    });
    return handlers.GET(modifiedRequest);
  }

  return handlers.GET(request);
}
