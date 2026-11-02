// Client-side useRole hook — reads role and agency info from the NextAuth session.
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
