-- Extra databases for automated tests (unit/integration and end-to-end).
CREATE DATABASE IF NOT EXISTS cora_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS cora_e2e CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Local dev only: `prisma migrate dev` creates and drops a temporary "shadow" database,
-- and the tests use the databases above, so the dev user gets full rights on this server.
GRANT ALL PRIVILEGES ON *.* TO 'cora'@'%';
FLUSH PRIVILEGES;
