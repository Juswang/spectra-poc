import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const url = new URL(DATABASE_URL);
const schema = url.searchParams.get("schema") || "public";

const client = new pg.Client({ connectionString: DATABASE_URL });

async function migrate() {
  await client.connect();

  if (schema !== "public") {
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await client.query(`SET search_path TO "${schema}"`);
  }

  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT PRIMARY KEY,
      "migration_name" TEXT NOT NULL UNIQUE,
      "finished_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )
  `);

  const migrationsDir = join(process.cwd(), "prisma", "migrations");
  const dirs = readdirSync(migrationsDir)
    .filter((d) => d !== "migration_lock.toml")
    .sort();

  for (const dir of dirs) {
    const { rows } = await client.query(
      `SELECT id FROM "_prisma_migrations" WHERE "migration_name" = $1`,
      [dir]
    );
    if (rows.length > 0) {
      console.log(`Already applied: ${dir}`);
      continue;
    }

    const sqlPath = join(migrationsDir, dir, "migration.sql");
    if (!existsSync(sqlPath)) continue;

    const sql = readFileSync(sqlPath, "utf-8");
    console.log(`Applying: ${dir}`);

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        `INSERT INTO "_prisma_migrations" (id, migration_name, finished_at, applied_steps_count)
         VALUES (gen_random_uuid()::text, $1, now(), 1)`,
        [dir]
      );
      await client.query("COMMIT");
      console.log(`Applied: ${dir}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`Failed: ${dir}`, err.message);
      process.exit(1);
    }
  }

  console.log("All migrations applied");

  await seed();
  await client.end();
}

async function seed() {
  const roles = [
    { name: "ADMIN", description: "Full access — manage users, roles, agencies, see all data" },
    { name: "EDITOR", description: "Can modify dashboard configurations" },
    { name: "VIEWER", description: "Read-only access to dashboards scoped to their agency" },
  ];

  for (const role of roles) {
    const { rows } = await client.query(
      `SELECT id FROM "Role" WHERE name = $1`,
      [role.name]
    );
    if (rows.length === 0) {
      await client.query(
        `INSERT INTO "Role" (id, name, description, "createdAt") VALUES (gen_random_uuid()::text, $1, $2, now())`,
        [role.name, role.description]
      );
      console.log(`Seeded role: ${role.name}`);
    }
  }

  const agencies = [
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

  for (const agency of agencies) {
    const { rows } = await client.query(
      `SELECT id FROM "Agency" WHERE code = $1`,
      [agency.code]
    );
    if (rows.length === 0) {
      await client.query(
        `INSERT INTO "Agency" (id, name, code, "createdAt") VALUES (gen_random_uuid()::text, $1, $2, now())`,
        [agency.name, agency.code]
      );
      console.log(`Seeded agency: ${agency.name}`);
    }
  }

  console.log("Seed check complete");

  await seedAdoptionMetrics(agencies);
}

const PRODUCTS = ["exchange", "teams", "zoom"];

function monthIndexToKey(m) {
  const d = new Date(2025, 9 + m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function generateRecord(id, m, p) {
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
    22 + ((id * 3 + k * 7) % 22) + Math.sin(m + id) * 2
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

async function seedAdoptionMetrics(agencies) {
  const { rows: existing } = await client.query(
    `SELECT COUNT(*)::int AS count FROM "AdoptionMetric"`
  );
  if (existing[0].count > 0) {
    console.log(`Adoption metrics already seeded (${existing[0].count} rows)`);
    return;
  }

  const MONTH_COUNT = 15;
  let inserted = 0;

  for (let agencyIdx = 0; agencyIdx < agencies.length; agencyIdx++) {
    const agency = agencies[agencyIdx];
    for (let m = 0; m < MONTH_COUNT; m++) {
      for (const product of PRODUCTS) {
        const r = generateRecord(agencyIdx, m, product);
        await client.query(
          `INSERT INTO "AdoptionMetric"
            (id, "agencyCode", month, product, provisioned, active, daily, emails, spam, sessions, duration, hosts, minutes, "createdAt")
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now())
           ON CONFLICT ("agencyCode", month, product) DO NOTHING`,
          [agency.code, monthIndexToKey(m), product,
           r.provisioned, r.active, r.daily, r.emails, r.spam,
           r.sessions, r.duration, r.hosts, r.minutes]
        );
        inserted++;
      }
    }
  }

  console.log(`Seeded ${inserted} adoption metric rows`);
}

migrate();
