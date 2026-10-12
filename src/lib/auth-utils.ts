import { auth } from "@/auth";

export type UserRole = "ADMIN" | "EDITOR" | "VIEWER";

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

export async function getAuthSession() {
  return auth();
}
