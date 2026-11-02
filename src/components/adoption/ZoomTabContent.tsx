// Zoom tab layout: composes KPIs, weekly chart, meetings, AI adoption, experience.
"use client";

import type { PeriodMode, ZoomTabData } from "@/types/adoption";
import ZoomKpiCards from "./ZoomKpiCards";
import ZoomWeeklyChart from "./ZoomWeeklyChart";
import ZoomMeetingInsightPanel from "./ZoomMeetingInsightPanel";
import ZoomAiAdoptionSection from "./ZoomAiAdoptionSection";
import ZoomParticipantExperience from "./ZoomParticipantExperience";

interface Props {
  data: ZoomTabData;
  periodMode: PeriodMode;
  activityType: "meetings" | "webinars";
  onActivityTypeChange: (type: "meetings" | "webinars") => void;
}

export default function ZoomTabContent({ data, periodMode, activityType, onActivityTypeChange }: Props) {
  return (
    <>
      <ZoomKpiCards kpis={data.kpis} />

      <section className="sa-charts">
        <ZoomWeeklyChart weeklyData={data.weeklyTrend} licenseThreshold={data.licenseThreshold} />
        <ZoomMeetingInsightPanel
          data={data.meetingData}
          activityType={activityType}
          onActivityTypeChange={onActivityTypeChange}
          periodMode={periodMode}
        />
      </section>

      <ZoomAiAdoptionSection data={data.aiAdoption} periodMode={periodMode} />
      <ZoomParticipantExperience data={data.participantExperience} />
    </>
  );
}
