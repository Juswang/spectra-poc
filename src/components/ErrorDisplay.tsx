// =================================================================
// src/components/ErrorDisplay.tsx
// =================================================================
// Displayed when data fetching fails.
// Shows the error message and a retry button.
// =================================================================

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-lg text-center">
        {/* Error icon */}
        <div className="text-red-500 text-5xl mb-4">!</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Failed to Load Data
        </h3>
        <p className="text-red-600 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Try Again
        </button>
        <p className="text-xs text-gray-400 mt-4">
          Make sure your Databricks cluster is running and your credentials are
          configured.
        </p>
      </div>
    </div>
  );
}