// Zoom tab: fetches Zoom data via useZoomData, renders ZoomTabContent.
"use client";

import { useDashboard } from "@/components/adoption/DashboardContext";
import { useZoomData } from "@/hooks/useAdoptionData";
import ZoomTabContent from "@/components/adoption/ZoomTabContent";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";

export default function ZoomPage() {
  const { month, selectedAgencies, periodMode, activityType, setActivityType } = useDashboard();
  const { data, loading, error, refresh } = useZoomData(month, selectedAgencies, periodMode);

  if (loading && !data) return <LoadingSpinner />;
  if (error && !data) return <ErrorDisplay message={error} onRetry={refresh} />;
  if (!data) return null;

  return (
    <ZoomTabContent
      data={data}
      periodMode={periodMode}
      activityType={activityType}
      onActivityTypeChange={setActivityType}
    />
  );
}
