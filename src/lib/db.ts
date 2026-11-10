import "server-only";

import mysql, { type Pool } from "mysql2/promise";

import { isDatabaseSslEnabled } from "@/lib/database-ssl";

let pool: Pool | null = null;

function readTunnelPort(
  value: string | undefined = process.env.DATABASE_TUNNEL_PORT,
): number | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }
  const port = Number(value);
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error("DATABASE_TUNNEL_PORT must be a valid TCP port.");
  }
  return port;
}

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!pool) {
    const url = new URL(connectionString);
    const tunnelPort = readTunnelPort();
    const useTunnel = tunnelPort !== undefined;
    const sslEnabled = isDatabaseSslEnabled(url);

    pool = mysql.createPool({
      host: useTunnel ? "127.0.0.1" : url.hostname,
      port: useTunnel ? tunnelPort : Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: sslEnabled
        ? {
            minVersion: "TLSv1.2",
            rejectUnauthorized: true,
            // Keep original hostname for certificate verification when tunneling.
            ...(useTunnel ? { servername: url.hostname } : {}),
          }
        : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: true,
    });
  }

  return pool;
}
