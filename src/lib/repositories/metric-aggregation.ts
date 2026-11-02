// Metric aggregation: sum product records, compute adoption totals across products.
import type { ProductId, ProductRecord, AdoptionTotals } from "@/types/adoption";

export const PRODUCTS: ProductId[] = ["exchange", "teams", "zoom"];

export type MetricRow = {
  agencyCode: string;
  month: string;
  product: string;
  provisioned: number;
  active: number;
  daily: number;
  emails: number;
  spam: number;
  sessions: number;
  duration: number;
  hosts: number;
  minutes: number;
};

export function toProductRecord(row: MetricRow): ProductRecord {
  return {
    provisioned: row.provisioned,
    active: row.active,
    daily: row.daily,
    emails: row.emails,
    spam: row.spam,
    sessions: row.sessions,
    duration: row.duration,
    hosts: row.hosts,
    minutes: row.minutes,
  };
}

export function sumProductRecords(
  records: ProductRecord[]
): ProductRecord & { adoption: number } {
  const out = {
    provisioned: 0,
    active: 0,
    daily: 0,
    emails: 0,
    spam: 0,
    sessions: 0,
    duration: 0,
    hosts: 0,
    minutes: 0,
  };
  for (const r of records) {
    out.provisioned += r.provisioned;
    out.active += r.active;
    out.daily += r.daily;
    out.emails += r.emails;
    out.spam += r.spam;
    out.sessions += r.sessions;
    out.hosts += r.hosts;
    out.minutes += r.minutes;
  }
  out.duration = out.sessions ? out.minutes / out.sessions : 0;
  const adoption = out.provisioned
    ? (out.active / out.provisioned) * 100
    : 0;
  return { ...out, adoption };
}

export function computeTotals(
  productSums: Map<ProductId, ProductRecord & { adoption: number }>
): AdoptionTotals {
  let totalActive = 0;
  let totalProvisioned = 0;
  for (const p of PRODUCTS) {
    const s = productSums.get(p);
    if (s) {
      totalActive += s.active;
      totalProvisioned += s.provisioned;
    }
  }
  const teams = productSums.get("teams");
  const zoom = productSums.get("zoom");
  const exchange = productSums.get("exchange");
  return {
    active: totalActive,
    sessions: (teams?.sessions ?? 0) + (zoom?.sessions ?? 0),
    spam: exchange?.spam ?? 0,
    adoption: totalProvisioned
      ? (totalActive / totalProvisioned) * 100
      : 0,
    provisioned: totalProvisioned,
  };
}
