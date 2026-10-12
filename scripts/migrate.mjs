import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = new pg.Client({ connectionString: DATABASE_URL });

async function migrate() {
  await client.connect();

  // Create migrations tracking table if it doesn't exist
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
    // Check if already applied
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

  // Seed roles and agencies if they don't exist
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
    { name: "Ministry of Health", code: "MOH" },
    { name: "Ministry of Education", code: "MOE" },
    { name: "Ministry of Finance", code: "MOF" },
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
}

migrate();
