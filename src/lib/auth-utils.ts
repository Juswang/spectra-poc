// Server-side auth: getEffectiveRole, requireRole, authenticateAndScope, scopeAgencies.
import { auth } from "@/auth";
import type { Session } from "next-auth";

export type UserRole = "ADMIN" | "EDITOR" | "VIEWER";

const ROLE_PRIORITY: Record<string, number> = { ADMIN: 3, EDITOR: 2, VIEWER: 1 };

export function getEffectiveRole(roleNames: string[]): string {
  return roleNames.reduce(
    (best, name) =>
      (ROLE_PRIORITY[name] ?? 0) > (ROLE_PRIORITY[best] ?? 0) ? name : best,
    "VIEWER"
  );
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function requireRole(...allowedRoles: UserRole[]) {
  const session = await auth();
  if (!session) {
    throw new AuthError("Not authenticated", 401);
  }
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    throw new AuthError("Insufficient permissions", 403);
  }
  return session;
}

export async function authenticateAndScope(): Promise<{
  session: Session;
  allowedAgencyCodes: string[] | null;
}> {
  const session = await auth();
  if (!session) {
    throw new AuthError("Not authenticated", 401);
  }

  const role = session.user.role;
  if (role === "ADMIN") {
    return { session, allowedAgencyCodes: null };
  }

  const codes = session.user.agencyCodes;
  if (!codes || codes.length === 0) {
    throw new AuthError(
      "No agencies assigned. Contact your administrator.",
      403
    );
  }

  return { session, allowedAgencyCodes: codes };
}

export function scopeAgencies(
  requestedCodes: string[],
  allowedCodes: string[] | null
): string[] {
  if (allowedCodes === null) {
    return requestedCodes;
  }
  if (requestedCodes.length === 0) {
    return allowedCodes;
  }
  return requestedCodes.filter((code) => allowedCodes.includes(code));
}
