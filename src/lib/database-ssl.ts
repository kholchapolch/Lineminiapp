const ENABLED_SSL_VALUES = new Set([
  "1",
  "true",
  "required",
  "verify_ca",
  "verify_identity",
]);

export function isDatabaseSslEnabled(
  url: URL,
  explicitValue: string | undefined = process.env.DATABASE_SSL,
): boolean {
  const value =
    explicitValue ??
    url.searchParams.get("ssl") ??
    url.searchParams.get("ssl-mode") ??
    "";

  return ENABLED_SSL_VALUES.has(value.trim().toLowerCase());
}
