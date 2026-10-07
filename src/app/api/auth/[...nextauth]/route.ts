import { handlers } from "@/auth";

export const POST = handlers.POST;

export async function GET(request: Request) {
  const url = new URL(request.url);

  // GovAuth doesn't include the "iss" parameter in its callback response,
  // which NextAuth's oauth4webapi library requires. Inject it for GovAuth callbacks.
  if (
    url.pathname === "/api/auth/callback/govauth" &&
    !url.searchParams.has("iss")
  ) {
    url.searchParams.set("iss", "https://govauth.sandbox.gov.sg/api/auth");
    return handlers.GET(new Request(url, request));
  }

  return handlers.GET(request);
}
