// Databricks stub implementation of IAdoptionRepository — throws until Databricks tables exist.
import type { IAdoptionRepository } from "./adoption-repository";
import type {
  MonthKey,
  PeriodMode,
  AdoptionOverviewData,
  ZoomTabData,
  AdoptionMonth,
  AgencyOption,
} from "@/types/adoption";

// Expected Databricks table schema (for reference when building the tables):
//
// CREATE TABLE adoption_metrics (
//   agency_code    STRING,
//   month          STRING,        -- "YYYY-MM"
//   product        STRING,        -- "exchange" | "teams" | "zoom"
//   provisioned    INT,
//   active         INT,
//   daily          INT,
//   emails         INT,
//   spam           INT,
//   sessions       INT,
//   duration       DOUBLE,
//   hosts          INT,
//   minutes        INT
// );
//
// CREATE TABLE agencies (
//   code  STRING,
//   name  STRING
// );

export class DatabricksAdoptionRepository implements IAdoptionRepository {
  async getAdoptionOverview(
    _month: MonthKey,
    _agencyCodes: string[]
  ): Promise<AdoptionOverviewData> {
    throw new Error(
      "Databricks adoption tables are not yet available. Set DATA_SOURCE=postgres to use PostgreSQL mock data."
    );
  }

  async getZoomTabData(
    _month: MonthKey,
    _agencyCodes: string[],
    _periodMode: PeriodMode
  ): Promise<ZoomTabData> {
    throw new Error(
      "Databricks adoption tables are not yet available. Set DATA_SOURCE=postgres to use PostgreSQL mock data."
    );
  }

  async getAvailableMonths(): Promise<AdoptionMonth[]> {
    throw new Error(
      "Databricks adoption tables are not yet available. Set DATA_SOURCE=postgres to use PostgreSQL mock data."
    );
  }

  async getAgencies(_allowedCodes?: string[]): Promise<AgencyOption[]> {
    throw new Error(
      "Databricks adoption tables are not yet available. Set DATA_SOURCE=postgres to use PostgreSQL mock data."
    );
  }
}
