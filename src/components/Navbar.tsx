// Top navigation bar: sign-in/out, role badge, admin link for ADMIN users.
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRole } from "@/lib/client-auth-utils";

const roleBadgeColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  EDITOR: "bg-amber-100 text-amber-700",
  VIEWER: "bg-blue-100 text-blue-700",
};

export default function Navbar() {
  const { data: session, status } = useSession();
  const { role, isAdmin } = useRole();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Spectra POC
            </Link>

            {session && (
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
            )}


            {isAdmin && (
              <Link
                href="/admin"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    roleBadgeColors[role] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {role}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm
                             hover:bg-gray-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              null
          /*    <button
                onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm
                           hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>*/
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}