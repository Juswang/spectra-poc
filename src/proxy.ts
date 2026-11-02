// Next.js middleware — protects /dashboard and /admin routes, requires authentication.
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
