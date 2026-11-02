// Repository factory: returns Postgres or Databricks implementation based on DATA_SOURCE env var.
import type { IAdoptionRepository } from "./adoption-repository";
import { PostgresAdoptionRepository } from "./postgres-adoption-repository";
import { DatabricksAdoptionRepository } from "./databricks-adoption-repository";

const DATA_SOURCE = process.env.DATA_SOURCE || "postgres";

let _instance: IAdoptionRepository | null = null;

export function getAdoptionRepository(): IAdoptionRepository {
  if (!_instance) {
    _instance =
      DATA_SOURCE === "databricks"
        ? new DatabricksAdoptionRepository()
        : new PostgresAdoptionRepository();
  }
  return _instance;
}
