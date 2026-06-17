import "server-only";

import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  pool ??= new Pool({
    connectionString,
  });

  return pool;
}
