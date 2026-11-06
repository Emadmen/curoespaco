// Prepares the disposable e2e database: applies migrations, empties all tables and seeds sample data.
// DATABASE_URL must point to a database whose name contains "e2e" or "test".
import { execSync } from "node:child_process";
import mariadb from "mariadb";

const url = process.env.DATABASE_URL ?? "";
const dbName = new URL(url).pathname.slice(1);
if (!/e2e|test/i.test(dbName)) {
  console.error(`Refusing to wipe database "${dbName}": name must contain "e2e" or "test".`);
  process.exit(1);
}

execSync("npx prisma migrate deploy", { stdio: "inherit" });

const client = await mariadb.createConnection(url.replace(/^mysql:/, "mariadb:"));
const rows = await client.query(
  `SELECT table_name AS name FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name <> '_prisma_migrations'`,
);
// MySQL can't truncate tables that foreign keys point at, so switch the checks off meanwhile.
await client.query("SET FOREIGN_KEY_CHECKS = 0");
for (const { name } of rows) await client.query(`TRUNCATE TABLE \`${name}\``);
await client.query("SET FOREIGN_KEY_CHECKS = 1");
await client.end();

execSync("npx prisma db seed", { stdio: "inherit" });
