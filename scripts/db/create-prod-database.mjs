import { getDatabaseUrl, withConnection } from "./mysql-connection.mjs";

const EXPECTED_HOST = "mysonybadgesqlprd.mysql.database.azure.com";
const EXPECTED_DATABASE = "lineminidb";
const databaseUrl = new URL(getDatabaseUrl());
const databaseName = databaseUrl.pathname.replace(/^\//, "");

if (databaseUrl.hostname.toLowerCase() !== EXPECTED_HOST) {
  throw new Error(
    `Refusing to create DB on unexpected host: ${databaseUrl.hostname}`,
  );
}

if (databaseName !== EXPECTED_DATABASE) {
  throw new Error(`Refusing to create unexpected DB: ${databaseName}`);
}

await withConnection(async (pool) => {
  await pool.query(
    "CREATE DATABASE IF NOT EXISTS `lineminidb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
  );
}, { omitDatabase: true });

console.log(`Created or confirmed PROD database ${EXPECTED_DATABASE}.`);
