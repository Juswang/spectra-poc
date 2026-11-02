// Type definitions for all adoption dashboard data structures and API responses.
export type ProductId = "exchange" | "teams" | "zoom";
export type MonthKey = string;

export interface ProductRecord {
  provisioned: number;
  active: number;
  daily: number;
  emails: number;
  spam: number;
  sessions: number;
  duration: number;
  hosts: number;
  minutes: number;
}

export interface AdoptionTotals {
  active: number;
  sessions: number;
  spam: number;
  adoption: number;
  provisioned: number;
}

export interface AgencyAdoptionRow {
  agencyId: number;
  agencyName: string;
  agencyCode: string;
  active: number;
  sessions: number;
  adoption: number;
  activeDelta: number;
}

export interface TrendDataPoint {
  month: MonthKey;
  monthLabel: string;
  exchange: number;
  teams: number;
  zoom: number;
}

export interface KpiCardConfig {
  title: string;
  value: string;
  unit?: string;
  deltaPercent: number;
  note: string;
  colorIndex: number;
}

export interface AdoptionOverviewData {
  currentTotals: AdoptionTotals;
  previousTotals: AdoptionTotals;
  trend: TrendDataPoint[];
  agencies: AgencyAdoptionRow[];
  topAgency: { name: string; active: number } | null;
}

export interface AdoptionMonth {
  value: MonthKey;
  label: string;
}

export interface AgencyOption {
  id: number;
  name: string;
  code: string;
}

// --- Zoom tab types ---

export type PeriodMode = "month" | "quarter";

export interface ZoomMonthTag {
  label: string;
  value: number;
  growth: number;
}

export interface ZoomKpiMetric {
  value: number;
  delta: number;
  monthTags: ZoomMonthTag[];
  progressPercent: number;
  progressLabel: string;
}

export interface ZoomKpiHostMetric extends ZoomKpiMetric {
  utilizationPercent: number;
  utilizationColor: "green" | "orange" | "red";
  thresholdNote: string;
}

export interface ZoomKpiData {
  usersOnboarded: number;
  totalWogUsers: number;
  activeUsers: ZoomKpiMetric;
  activeHosts: ZoomKpiHostMetric;
}

export interface ZoomWeeklyPoint {
  weekEnding: string;
  activeUsers: number;
  activeHosts: number;
}

export interface ZoomMeetingSlice {
  upToCCE: number;
  confidential: number;
}

export interface ZoomMeetingPeriod {
  period: string;
  upToCCE: number;
  confidential: number;
}

export interface ZoomMeetingData {
  meetings: { monthPie: ZoomMeetingSlice; quarterBars: ZoomMeetingPeriod[] };
  webinars: { monthPie: ZoomMeetingSlice; quarterBars: ZoomMeetingPeriod[] };
}

export interface ZoomAiTrendPoint {
  period: string;
  activeUsers: number;
  aiActiveUsers: number;
  aiAdoptionRate: number;
}

export interface ZoomAiFeatureSlice {
  name: string;
  value: number;
}

export interface ZoomAiFeaturesPeriod {
  period: string;
  features: ZoomAiFeatureSlice[];
}

export interface ZoomAiData {
  aiActiveUsers: number;
  aiActiveUsersDelta: number;
  aiAdoptionRate: number;
  aiAdoptionRateDelta: number;
  trend: ZoomAiTrendPoint[];
  featuresPie: ZoomAiFeatureSlice[];
  featuresBar: ZoomAiFeaturesPeriod[];
}

export interface ZoomExperiencePoint {
  weekEnding: string;
  usersResponded: number;
  overallRating: number;
}

export interface ZoomTabData {
  kpis: ZoomKpiData;
  weeklyTrend: ZoomWeeklyPoint[];
  meetingData: ZoomMeetingData;
  aiAdoption: ZoomAiData;
  participantExperience: ZoomExperiencePoint[];
  licenseThreshold: number;
}
