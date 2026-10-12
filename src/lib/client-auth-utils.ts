"use client";

import { useSession } from "next-auth/react";

export function useRole() {
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "VIEWER") as string;
  return {
    role,
    isAdmin: role === "ADMIN",
    isEditor: role === "EDITOR" || role === "ADMIN",
    isViewer: true,
    agencyCodes: session?.user?.agencyCodes ?? [],
    agencyNames: session?.user?.agencyNames ?? [],
  };
}

export function RoleGate({
  allowedRoles,
  children,
  fallback = null,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { role } = useRole();
  if (!allowedRoles.includes(role)) return fallback;
  return children;
}
