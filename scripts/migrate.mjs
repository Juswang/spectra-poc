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
  await client.end();
}

migrate();
