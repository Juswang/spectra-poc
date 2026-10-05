"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If the user is already logged in, send them to the dashboard
  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  // While checking session status, show a brief loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Service Monitoring Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Monitor the health and performance of your organization&apos;s services
          in real time. Powered by Databricks analytics.
        </p>
        <button
          onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium
                     hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Sign In with Microsoft
        </button>
      </div>

      {/* How It Works Section */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center
                            justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Sign In Securely</h3>
            <p className="text-gray-600 text-sm">
              Authenticate using your Microsoft account through Entra ID.
              Your credentials never touch this application.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center
                            justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Data Pipeline</h3>
            <p className="text-gray-600 text-sm">
              Service health data is collected, processed, and analyzed
              by a Databricks pipeline running in the cloud.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center
                            justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Live Dashboard</h3>
            <p className="text-gray-600 text-sm">
              View real-time service status, uptime percentages, and
              response time metrics on a clean, interactive dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}