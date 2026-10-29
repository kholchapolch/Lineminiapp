import "server-only";

import type { RowDataPacket } from "mysql2/promise";

import {
  channelIdFromLiffId,
  type AppConfig,
} from "@/lib/app-config";
import { getPool } from "@/lib/db";

export const PORTAL_LIFF_ID_CONFIG_KEY = "cs_portal_liff_id";
export const PORTAL_LIFF_ID_ENV_KEY = "NEXT_PUBLIC_CSR_PORTAL_LIFF_ID";

const CACHE_TTL_MS = 60_000;

type PortalLiffIdCache = {
  databaseUrl: string | undefined;
  expiresAt: number;
  value: string | undefined;
};

let cache: PortalLiffIdCache | null = null;

function blankToUndefined(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function envPortalLiffId(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  return blankToUndefined(env[PORTAL_LIFF_ID_ENV_KEY]);
}

async function readPortalLiffIdFromDb(): Promise<string | undefined> {
  if (!process.env.DATABASE_URL?.trim()) {
    return undefined;
  }

  try {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT `value` FROM app_config WHERE `key` = ? LIMIT 1",
      [PORTAL_LIFF_ID_CONFIG_KEY],
    );
    const value = rows[0]?.value;
    return typeof value === "string" ? blankToUndefined(value) : undefined;
  } catch {
    // Fall back to env when MySQL is unreachable (local without tunnel, etc.).
    return undefined;
  }
}

/** Clears the in-process portal LIFF ID cache (tests / after admin edits). */
export function clearPortalLiffIdCache(): void {
  cache = null;
}

/**
 * Resolves the CSR Portal LIFF ID: app_config.cs_portal_liff_id first, then
 * NEXT_PUBLIC_CSR_PORTAL_LIFF_ID. DB read failures fall through to env.
 */
export async function resolvePortalLiffId(options?: {
  env?: Record<string, string | undefined>;
  bypassCache?: boolean;
}): Promise<string | undefined> {
  const env = options?.env ?? process.env;
  const databaseUrl = blankToUndefined(env.DATABASE_URL);
  const now = Date.now();

  if (
    !options?.bypassCache &&
    cache &&
    cache.databaseUrl === databaseUrl &&
    cache.expiresAt > now
  ) {
    return cache.value ?? envPortalLiffId(env);
  }

  const fromDb = await readPortalLiffIdFromDb();
  const value = fromDb ?? envPortalLiffId(env);

  cache = {
    databaseUrl,
    expiresAt: now + CACHE_TTL_MS,
    value: fromDb,
  };

  return value;
}

/** Merges the portal LIFF channel into AppConfig.lineChannelIds for id-token verify. */
export function withPortalLiffChannel(
  config: AppConfig,
  portalLiffId: string | undefined,
): AppConfig {
  const portalChannelId = channelIdFromLiffId(portalLiffId);
  if (!portalChannelId) {
    return config;
  }

  return {
    ...config,
    lineChannelIds: [
      ...new Set([...config.lineChannelIds, portalChannelId]),
    ],
  };
}
