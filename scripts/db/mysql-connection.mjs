import mysql from "mysql2/promise";

const ENABLED_SSL_VALUES = new Set([
  "1",
  "true",
  "required",
  "verify_ca",
  "verify_identity",
]);

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  return databaseUrl;
}

export function createConnectionPool({ omitDatabase = false } = {}) {
  const url = new URL(getDatabaseUrl());
  const sslValue =
    process.env.DATABASE_SSL ??
    url.searchParams.get("ssl") ??
    url.searchParams.get("ssl-mode") ??
    "";
  const sslEnabled = ENABLED_SSL_VALUES.has(sslValue.trim().toLowerCase());

  return mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: omitDatabase ? undefined : url.pathname.replace(/^\//, ""),
    ssl: sslEnabled
      ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
      : undefined,
    waitForConnections: true,
    connectionLimit: 5,
    dateStrings: true,
    namedPlaceholders: false,
  });
}

export async function withConnection(callback, options) {
  const pool = createConnectionPool(options);

  try {
    return await callback(pool);
  } finally {
    await pool.end();
  }
}
