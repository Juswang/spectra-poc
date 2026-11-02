// IAdoptionRepository interface — the contract both Postgres and Databricks implementations satisfy.
import type {
  MonthKey,
  PeriodMode,
  AdoptionOverviewData,
  ZoomTabData,
  AdoptionMonth,
  AgencyOption,
} from "@/types/adoption";

export interface IAdoptionRepository {
  getAdoptionOverview(
    month: MonthKey,
    agencyCodes: string[]
  ): Promise<AdoptionOverviewData>;

  getZoomTabData(
    month: MonthKey,
    agencyCodes: string[],
    periodMode: PeriodMode
  ): Promise<ZoomTabData>;

  getAvailableMonths(): Promise<AdoptionMonth[]>;

  getAgencies(allowedCodes?: string[]): Promise<AgencyOption[]>;
}
