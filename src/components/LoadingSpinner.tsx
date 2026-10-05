// =================================================================
// src/components/LoadingSpinner.tsx
// =================================================================
// Displayed while data is being fetched from Databricks.
// =================================================================

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Animated spinning circle */}
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-gray-500 text-lg">Loading service data...</p>
      <p className="text-gray-400 text-sm mt-1">
        Fetching from Databricks
      </p>
    </div>
  );
}