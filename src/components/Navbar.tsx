"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side — App name and navigation links */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Spectra POC
            </Link>

            {/* Only show the Dashboard link if the user is logged in */}
            {session && (
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side — User info and auth button */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              /* While NextAuth checks the session, show a placeholder */
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : session ? (
              /* User IS logged in */
              <div className="flex items-center space-x-4">
                {/* Show the user's name or email */}
                <span className="text-sm text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>

                {/* Sign Out button */}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm
                             hover:bg-gray-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              /* User is NOT logged in */
              <button
                onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm
                           hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}