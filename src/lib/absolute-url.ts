/**
 * Turn a relative asset path or absolute URL into an absolute URL.
 * Absolute http(s) URLs are returned as-is (APP_BASE_URL is not applied).
 * Relative paths like `/badges/foo.png` resolve against `baseUrl`.
 */
export function toAbsoluteUrl(
  pathOrUrl: string | null | undefined,
  baseUrl: string,
): string | null {
  if (!pathOrUrl) {
    return null;
  }

  const trimmed = pathOrUrl.trim();

  if (!trimmed) {
    return null;
  }

  if (isAbsoluteHttpUrl(trimmed)) {
    return trimmed;
  }

  try {
    return new URL(trimmed, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
  } catch {
    return null;
  }
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function getClientOrigin(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
}
