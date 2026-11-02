// Seeds roles, agencies, and deterministic adoption metric data into PostgreSQL.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

// Same deterministic generation as src/lib/adoption-data.ts
const PRODUCTS = ["exchange", "teams", "zoom"] as const;

const MONTHS: Date[] = Array.from(
  { length: 15 },
  (_, i) => new Date(2025, 9 + i, 1)
);

function monthIndexToKey(m: number): string {
  const d = MONTHS[m];
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function generateRecord(
  id: number,
  m: number,
  p: (typeof PRODUCTS)[number]
) {
  const k = PRODUCTS.indexOf(p);
  const base = 650 + ((id * 7919) % 6800);
  const provisioned = Math.round(base * [1, 0.91, 0.16][k]);
  const wave = Math.sin(id * 2.1 + m * 0.7 + k) * 0.025;
  const adoption = Math.min(
    0.96,
    0.53 + (((id * 13 + k * 9) % 28) / 100) + m * 0.009 + wave
  );
  const active = Math.round(provisioned * adoption);
  const sessions = Math.round(
    active * (k === 1 ? 8.5 : 3.2) * (1 + Math.cos(id + m) * 0.08)
  );
  const duration = +(
    22 +
    ((id * 3 + k * 7) % 22) +
    Math.sin(m + id) * 2
  ).toFixed(2);

  return {
    provisioned,
    active,
    daily: Math.round(active * 0.64),
    emails: Math.round(active * (155 + m * 2)),
    spam: Math.round(active * (42 + m * 0.8)),
    sessions,
    duration,
    hosts: Math.round(active * (k === 2 ? 0.08816 : 0.27)),
    minutes: Math.round(sessions * duration),
  };
}

const ALL_AGENCIES = [
  { name: "Government Technology Agency", code: "GOVTECH" },
  { name: "Ministry of Education", code: "MOE" },
  { name: "National Environment Agency", code: "NEA" },
  { name: "Enterprise Singapore", code: "ESG" },
  { name: "Economic Development Board", code: "EDB" },
  { name: "Infocomm Media Development Authority", code: "IMDA" },
  { name: "Centre for Strategic Infocomm Technologies", code: "CSIT" },
  { name: "Ministry of Health", code: "MOH" },
  { name: "Ministry of Finance", code: "MOF" },
  { name: "Ministry of Manpower", code: "MOM" },
];

async function main() {
  // Seed roles
  const roles = [
    { name: "ADMIN", description: "Full access — manage users, roles, agencies, see all data" },
    { name: "EDITOR", description: "Can modify dashboard configurations" },
    { name: "VIEWER", description: "Read-only access to dashboards scoped to their agency" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  // Seed agencies
  for (const agency of ALL_AGENCIES) {
    await prisma.agency.upsert({
      where: { code: agency.code },
      update: { name: agency.name },
      create: agency,
    });
  }

  console.log(`Seeded ${roles.length} roles and ${ALL_AGENCIES.length} agencies`);

  // Seed adoption metrics
  const metrics: {
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
  }[] = [];

  for (let agencyIdx = 0; agencyIdx < ALL_AGENCIES.length; agencyIdx++) {
    const agency = ALL_AGENCIES[agencyIdx];
    for (let m = 0; m < MONTHS.length; m++) {
      for (const product of PRODUCTS) {
        const rec = generateRecord(agencyIdx, m, product);
        metrics.push({
          agencyCode: agency.code,
          month: monthIndexToKey(m),
          product,
          ...rec,
        });
      }
    }
  }

  // Bulk insert in batches
  const BATCH_SIZE = 500;
  let inserted = 0;
  for (let i = 0; i < metrics.length; i += BATCH_SIZE) {
    const batch = metrics.slice(i, i + BATCH_SIZE);
    await prisma.adoptionMetric.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += batch.length;
  }

  console.log(`Seeded ${inserted} adoption metric rows`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
