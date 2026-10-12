// =================================================================
// src/app/admin/page.tsx
// =================================================================
// The admin page.
// Reads from postgres northflank db.
//
// "use client" is required because this component uses React hooks
// (useServiceData, useSession) which only work in client components.
// =================================================================

"use client";

import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";
//import AdminUsersTable from "@/components/admin/AdminUsersTable";
//import AdminServiceTable from "@/components/admin/AdminServiceTable";
//import { useAdminData } from "@/hooks/useAdminData";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const {
    users,
    services,
    loading,
    error,
    lastUpdated,
    refresh,
    updateUserRole,
    toggleService,
  }// = useAdminData();

  // Session loading
  if (status === "loading") return <LoadingSpinner />;

  // Basic guard (replace with real role check)
  /*
  const isAdmin = session?.user?.role === "admin";
  if (!isAdmin) {
    return (
      <ErrorDisplay
        message="You do not have permission to access this page."
        onRetry={() => window.location.reload()}
      />
    );
  }
  */

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={refresh} />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
        <p className="text-gray-500 mt-1">
          Manage users, services, and operational settings.
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-8">
        <button
          onClick={refresh}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Refreshing..." : "Refresh Admin Data"}
        </button>
        {lastUpdated && (
          <p className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
