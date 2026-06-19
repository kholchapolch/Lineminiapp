export type AppEnv = "local" | "staging" | "production";
export type SonyProductApiMode = "mock" | "live";

export type AppConfig = {
  appEnv: AppEnv;
  appBaseUrl: string;
  databaseUrl?: string;
  allowedOrigins: string[];
  allowedReferrers: string[];
  liffId?: string;
  lineChannelId?: string;
  lineVerifyIdTokenUrl: string;
  appSessionSecret?: string;
  logHashSecret?: string;
  sonyProductApiMode: SonyProductApiMode;
  sonyProductApiBaseUrl: string;
  sonyDemoLineUuid: string;
};

type EnvInput = Record<string, string | undefined>;

const DEFAULT_LOCAL_BASE_URL = "http://localhost:3000";
const DEFAULT_DEMO_LINE_UUID = "demo-line-earned";
const DEFAULT_LINE_VERIFY_ID_TOKEN_URL = "https://api.line.me/oauth2/v2.1/verify";

export function loadAppConfig(env: EnvInput = process.env): AppConfig {
  const appEnv = parseAppEnv(env.APP_ENV);
  const appBaseUrl = normalizeRequiredUrl(
    env.APP_BASE_URL ?? (appEnv === "local" ? DEFAULT_LOCAL_BASE_URL : undefined),
    "APP_BASE_URL",
    "origin",
  );
  const databaseUrl = blankToUndefined(env.DATABASE_URL);
  const sonyProductApiMode = parseSonyProductApiMode(env.SONY_PRODUCT_API_MODE);
  const sonyProductApiBaseUrl = normalizeOptionalUrl(
    env.SONY_PRODUCT_API_BASE_URL,
    "full-url",
  );
  const liffId = blankToUndefined(env.NEXT_PUBLIC_LIFF_ID);
  const lineChannelId = blankToUndefined(env.LINE_CHANNEL_ID);
  const appSessionSecret = blankToUndefined(env.APP_SESSION_SECRET);
  const logHashSecret = blankToUndefined(env.LOG_HASH_SECRET);
  const lineVerifyIdTokenUrl =
    normalizeOptionalUrl(env.LINE_VERIFY_ID_TOKEN_URL, "full-url") ??
    DEFAULT_LINE_VERIFY_ID_TOKEN_URL;

  if (appEnv !== "local" && !liffId) {
    throw new Error("NEXT_PUBLIC_LIFF_ID is required outside local mode.");
  }

  if (appEnv !== "local" && !databaseUrl) {
    throw new Error("DATABASE_URL is required outside local mode.");
  }

  if (appEnv !== "local" && !lineChannelId) {
    throw new Error("LINE_CHANNEL_ID is required outside local mode.");
  }

  if (appEnv !== "local" && !appSessionSecret) {
    throw new Error("APP_SESSION_SECRET is required outside local mode.");
  }

  if (sonyProductApiMode === "live" && !sonyProductApiBaseUrl) {
    throw new Error("SONY_PRODUCT_API_BASE_URL is required when SONY_PRODUCT_API_MODE=live.");
  }

  return {
    appEnv,
    appBaseUrl,
    databaseUrl,
    allowedOrigins: parseUrlList(env.ALLOWED_ORIGINS, [appBaseUrl]),
    allowedReferrers: parseUrlList(env.ALLOWED_REFERRERS, [appBaseUrl]),
    liffId,
    lineChannelId,
    lineVerifyIdTokenUrl,
    appSessionSecret,
    logHashSecret,
    sonyProductApiMode,
    sonyProductApiBaseUrl: sonyProductApiBaseUrl ?? `${appBaseUrl}/api/mock/sony`,
    sonyDemoLineUuid: blankToUndefined(env.SONY_DEMO_LINE_UUID) ?? DEFAULT_DEMO_LINE_UUID,
  };
}

function parseAppEnv(value: string | undefined): AppEnv {
  const env = blankToUndefined(value) ?? "local";

  if (env === "local" || env === "staging" || env === "production") {
    return env;
  }

  throw new Error("APP_ENV must be one of local, staging, or production.");
}

function parseSonyProductApiMode(value: string | undefined): SonyProductApiMode {
  const mode = blankToUndefined(value) ?? "mock";

  if (mode === "mock" || mode === "live") {
    return mode;
  }

  throw new Error("SONY_PRODUCT_API_MODE must be mock or live.");
}

function parseUrlList(value: string | undefined, fallback: string[]): string[] {
  const parsed = (value ?? "")
    .split(",")
    .map((entry) => normalizeOptionalUrl(entry, "origin"))
    .filter((entry): entry is string => Boolean(entry));

  return parsed.length > 0 ? parsed : fallback;
}

function normalizeRequiredUrl(
  value: string | undefined,
  name: string,
  mode: "origin" | "full-url",
): string {
  const normalized = normalizeOptionalUrl(value, mode);

  if (!normalized) {
    throw new Error(`${name} is required.`);
  }

  return normalized;
}

function normalizeOptionalUrl(
  value: string | undefined,
  mode: "origin" | "full-url",
): string | undefined {
  const trimmed = blankToUndefined(value);

  if (!trimmed) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);
    if (mode === "origin") {
      return url.origin;
    }

    url.hash = "";
    return url.toString();
  } catch {
    throw new Error(`Invalid URL: ${trimmed}`);
  }
}

function blankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
