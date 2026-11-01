// Prepares the disposable e2e database: applies migrations, empties all tables and seeds sample data.
// DATABASE_URL must point to a database whose name contains "e2e" or "test".
import { execSync } from "node:child_process";
import pg from "pg";

const url = process.env.DATABASE_URL ?? "";
const dbName = new URL(url).pathname.slice(1);
if (!/e2e|test/i.test(dbName)) {
  console.error(`Refusing to wipe database "${dbName}": name must contain "e2e" or "test".`);
  process.exit(1);
}

execSync("npx prisma migrate deploy", { stdio: "inherit" });

const client = new pg.Client({ connectionString: url.replace(/\?schema=public$/, "") });
await client.connect();
const { rows } = await client.query(
  `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`,
);
if (rows.length) {
  await client.query(`TRUNCATE ${rows.map((r) => `"${r.tablename}"`).join(", ")} CASCADE`);
}
await client.end();

execSync("npx prisma db seed", { stdio: "inherit" });
