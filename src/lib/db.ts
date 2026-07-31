import "server-only";

import mysql, { type Pool } from "mysql2/promise";

import { isDatabaseSslEnabled } from "@/lib/database-ssl";

let pool: Pool | null = null;

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!pool) {
    const url = new URL(connectionString);

    pool = mysql.createPool({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: isDatabaseSslEnabled(url)
        ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
        : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: true,
    });
  }

  return pool;
}
