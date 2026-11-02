// Admin dashboard: user management, service monitoring (client component).
"use client";

import { useSession } from "next-auth/react";
import ErrorDisplay from "@/components/ErrorDisplay";

export default function AdminPage() {
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";
  if (!isAdmin) {
    return (
      <ErrorDisplay
        message="You do not have permission to access this page."
        onRetry={() => window.location.reload()}
      />
    );
  }


  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 mt-1">
          Welcome, {session?.user?.name || "Admin"}.
        </p>
      </div>

      {/* Clean sections with no data binding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-500 mt-2">
            Add controls for creating, editing, and disabling users.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-800">Roles & Permissions</h2>
          <p className="text-sm text-gray-500 mt-2">
            Configure role-based access settings for your app.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-800">System Settings</h2>
          <p className="text-sm text-gray-500 mt-2">
            Manage global settings, notifications, and preferences.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-800">Audit Logs</h2>
          <p className="text-sm text-gray-500 mt-2">
            View important admin actions and change history.
          </p>
        </section>
      </div>
    </div>
  );
}
