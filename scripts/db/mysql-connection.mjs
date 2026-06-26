import mysql from "mysql2/promise";

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  return databaseUrl;
}

export function createConnectionPool() {
  const url = new URL(getDatabaseUrl());

  return mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    waitForConnections: true,
    connectionLimit: 5,
    dateStrings: true,
    namedPlaceholders: false,
  });
}

export async function withConnection(callback) {
  const pool = createConnectionPool();

  try {
    return await callback(pool);
  } finally {
    await pool.end();
  }
}
