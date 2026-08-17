import fs from "node:fs";

const filePath = process.argv[2] ?? ".env.production";
const env = parseEnvFile(fs.readFileSync(filePath, "utf8"));

const requiredKeys = [
  "DATABASE_URL",
  "DATABASE_SSL",
  "APP_ENV",
  "APP_BASE_URL",
  "NEXT_PUBLIC_APP_BASE_URL",
  "ALLOWED_ORIGINS",
  "ALLOWED_REFERRERS",
  "NEXT_PUBLIC_LIFF_ID",
  "LINE_CHANNEL_ID",
  "LINE_VERIFY_ID_TOKEN_URL",
  "APP_SESSION_SECRET",
  "LOG_HASH_SECRET",
  "NEXT_PUBLIC_DEBUG_MOCK_JSON",
  "SONY_PRODUCT_API_MODE",
  "SONY_PRODUCT_API_BASE_URL",
  "SONY_PRODUCT_API_COUNTRY_CODE",
  "SONY_DEMO_LINE_UUID",
  "NEXT_PUBLIC_ACCOUNT_URL",
  "NEXT_PUBLIC_REGISTER_PRODUCT_URL",
];

const missingKeys = requiredKeys.filter((key) => !env[key]?.trim());
if (missingKeys.length > 0) {
  throw new Error(`Missing deployment environment keys: ${missingKeys.join(", ")}`);
}

if (!new Set(["staging", "production"]).has(env.APP_ENV)) {
  throw new Error("APP_ENV must be staging or production for deployment.");
}

for (const key of [
  "APP_BASE_URL",
  "NEXT_PUBLIC_APP_BASE_URL",
  "SONY_PRODUCT_API_BASE_URL",
  "LINE_VERIFY_ID_TOKEN_URL",
  "NEXT_PUBLIC_ACCOUNT_URL",
  "NEXT_PUBLIC_REGISTER_PRODUCT_URL",
]) {
  assertHttpsUrl(key, env[key]);
}

for (const key of ["ALLOWED_ORIGINS", "ALLOWED_REFERRERS"]) {
  for (const value of env[key].split(",")) {
    assertHttpsUrl(key, value.trim());
  }
}

const databaseUrl = new URL(env.DATABASE_URL);
if (databaseUrl.protocol !== "mysql:") {
  throw new Error("DATABASE_URL must use the mysql protocol.");
}

const databaseName = decodeURIComponent(
  databaseUrl.pathname.replace(/^\/+/, ""),
);
if (!databaseName) {
  throw new Error("DATABASE_URL must include a database name.");
}

const sslValue = (
  env.DATABASE_SSL ||
  databaseUrl.searchParams.get("ssl") ||
  databaseUrl.searchParams.get("ssl-mode") ||
  ""
).toLowerCase();
if (!new Set(["1", "true", "required", "verify_ca", "verify_identity"]).has(sslValue)) {
  throw new Error("TLS must be enabled for the deployment database.");
}

if (!env.NEXT_PUBLIC_LIFF_ID.startsWith(`${env.LINE_CHANNEL_ID}-`)) {
  throw new Error("NEXT_PUBLIC_LIFF_ID must belong to LINE_CHANNEL_ID.");
}

if (!/^\d+$/.test(env.LINE_CHANNEL_ID)) {
  throw new Error("LINE_CHANNEL_ID must contain digits only.");
}

if (env.APP_BASE_URL !== env.NEXT_PUBLIC_APP_BASE_URL) {
  throw new Error("APP_BASE_URL and NEXT_PUBLIC_APP_BASE_URL must match.");
}

for (const key of ["ALLOWED_ORIGINS", "ALLOWED_REFERRERS"]) {
  const entries = env[key].split(",").map((value) => value.trim());
  if (!entries.includes(env.APP_BASE_URL)) {
    throw new Error(`${key} must include APP_BASE_URL.`);
  }
}

if (env.APP_SESSION_SECRET.length < 32 || env.LOG_HASH_SECRET.length < 32) {
  throw new Error("APP_SESSION_SECRET and LOG_HASH_SECRET must be at least 32 characters.");
}

if (!/^[a-z]{2}$/.test(env.SONY_PRODUCT_API_COUNTRY_CODE)) {
  throw new Error("SONY_PRODUCT_API_COUNTRY_CODE must be a lowercase ISO country code.");
}

if (env.NEXT_PUBLIC_DEBUG_MOCK_JSON !== "false") {
  throw new Error("NEXT_PUBLIC_DEBUG_MOCK_JSON must be false for deployment.");
}

if (!new Set(["mock", "live"]).has(env.SONY_PRODUCT_API_MODE)) {
  throw new Error("SONY_PRODUCT_API_MODE must be mock or live.");
}

if (
  env.SONY_PRODUCT_API_MODE === "live" &&
  !env.SONY_PRODUCT_API_SUBSCRIPTION_KEY?.trim()
) {
  throw new Error(
    "SONY_PRODUCT_API_SUBSCRIPTION_KEY is required when Sony API mode is live.",
  );
}

if (env.SONY_PRODUCT_API_MODE === "mock") {
  console.log("::warning::UAT is configured to use Sony mock product data.");
}

for (const [key, expectedEnvironmentKey] of [
  ["APP_ENV", "EXPECTED_APP_ENV"],
  ["APP_BASE_URL", "EXPECTED_APP_BASE_URL"],
  ["NEXT_PUBLIC_APP_BASE_URL", "EXPECTED_NEXT_PUBLIC_APP_BASE_URL"],
  ["NEXT_PUBLIC_LIFF_ID", "EXPECTED_NEXT_PUBLIC_LIFF_ID"],
  ["LINE_CHANNEL_ID", "EXPECTED_LINE_CHANNEL_ID"],
  ["SONY_PRODUCT_API_MODE", "EXPECTED_SONY_PRODUCT_API_MODE"],
  ["SONY_PRODUCT_API_BASE_URL", "EXPECTED_SONY_PRODUCT_API_BASE_URL"],
  ["NEXT_PUBLIC_ACCOUNT_URL", "EXPECTED_NEXT_PUBLIC_ACCOUNT_URL"],
  [
    "NEXT_PUBLIC_REGISTER_PRODUCT_URL",
    "EXPECTED_NEXT_PUBLIC_REGISTER_PRODUCT_URL",
  ],
]) {
  const expectedValue = process.env[expectedEnvironmentKey];
  if (expectedValue && env[key] !== expectedValue) {
    throw new Error(`${key} does not match the deployment target.`);
  }
}

if (
  process.env.EXPECTED_DATABASE_HOST &&
  databaseUrl.hostname !== process.env.EXPECTED_DATABASE_HOST
) {
  throw new Error("DATABASE_URL host does not match the deployment target.");
}

if (
  process.env.EXPECTED_DATABASE_NAME &&
  databaseName !== process.env.EXPECTED_DATABASE_NAME
) {
  throw new Error(
    "DATABASE_URL database name does not match the deployment target.",
  );
}

console.log(
  `Validated deployment environment (${env.APP_ENV}, Sony API: ${env.SONY_PRODUCT_API_MODE}).`,
);

function parseEnvFile(contents) {
  const parsed = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      throw new Error("Invalid deployment environment file format.");
    }

    const key = line.slice(0, separatorIndex);
    if (Object.hasOwn(parsed, key)) {
      throw new Error(`Duplicate deployment environment key: ${key}`);
    }

    parsed[key] = line.slice(separatorIndex + 1);
  }

  return parsed;
}

function assertHttpsUrl(name, value) {
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS for deployment.`);
  }
}
