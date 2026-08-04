/**
 * Turn a relative asset path or absolute URL into an absolute URL.
 * Absolute http(s) URLs keep their origin; path segments are always percent-encoded
 * so values with spaces or `&` stay intact when shared to Facebook.
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
    return encodeAbsoluteHttpUrl(trimmed);
  }

  const base = blankToUndefined(baseUrl);
  if (!base) {
    return null;
  }

  try {
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    return new URL(encodePathForUrl(trimmed), normalizedBase).toString();
  } catch {
    return null;
  }
}

/**
 * Absolute, path-encoded asset URL safe to pass to Facebook sharer.
 * Never returns a URL containing raw spaces.
 */
export function toShareableAssetUrl(
  pathOrUrl: string | null | undefined,
  baseUrl: string = getPublicAppBaseUrl(),
): string | null {
  const absolute = toAbsoluteUrl(pathOrUrl, baseUrl);
  if (!absolute) {
    return null;
  }

  // Belt-and-suspenders: reject any value that still contains raw spaces.
  if (/\s/.test(absolute)) {
    return encodeAbsoluteHttpUrl(absolute);
  }

  return absolute;
}

/**
 * Build facebook.com/sharer URL for a target that may contain `%20` in the path.
 *
 * Facebook's sharer appears to decode `u=` more than once. A normal
 * `encodeURIComponent` of `...%20...` yields `...%2520...` in the query, which
 * still gets truncated. Pre-escaping `%20` → `%2520` before the final
 * encodeURIComponent produces `...%252520...` in `u=`, which is the form that
 * survives (e.g. Macro%252520Lens).
 */
export function toFacebookSharerUrl(
  targetUrl: string | null | undefined,
): string | null {
  const trimmed = blankToUndefined(targetUrl ?? undefined);
  if (!trimmed) {
    return null;
  }

  if (/\s/.test(trimmed)) {
    return null;
  }

  // `%20` → `%2520` here; encodeURIComponent then yields `%252520` in `u=`.
  const facebookSafeTarget = trimmed.replace(/%20/gi, "%2520");
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookSafeTarget)}`;
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * Encode path segments on an absolute URL without relying on URL() to parse
 * unencoded spaces (which can throw or truncate in some runtimes).
 */
function encodeAbsoluteHttpUrl(value: string): string {
  const match = value.match(/^(https?:\/\/[^/?#]+)([^?#]*)(.*)$/i);
  if (!match) {
    return value;
  }

  const [, origin, pathname = "", searchAndHash = ""] = match;
  try {
    return `${origin}${encodePathname(pathname || "/")}${searchAndHash}`;
  } catch {
    return value;
  }
}

function encodePathForUrl(path: string): string {
  if (path.startsWith("//")) {
    return path;
  }

  const [pathname, searchAndHash = ""] = splitPathAndQuery(path);
  return `${encodePathname(pathname)}${searchAndHash}`;
}

function splitPathAndQuery(path: string): [string, string] {
  const queryIndex = path.search(/[?#]/);
  if (queryIndex === -1) {
    return [path, ""];
  }
  return [path.slice(0, queryIndex), path.slice(queryIndex)];
}

function encodePathname(pathname: string): string {
  return pathname
    .split("/")
    .map((segment) => {
      if (!segment) {
        return segment;
      }
      try {
        return encodeURIComponent(decodeURIComponent(segment.replace(/\+/g, "%20")));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");
}

/**
 * Public origin used for Facebook share links and OG URLs.
 * Prefers NEXT_PUBLIC_APP_BASE_URL so client + server stay aligned.
 */
export function getPublicAppBaseUrl(): string {
  const configured =
    blankToUndefined(process.env.NEXT_PUBLIC_APP_BASE_URL) ??
    blankToUndefined(process.env.APP_BASE_URL);

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

export function getClientOrigin(): string {
  return getPublicAppBaseUrl();
}

function blankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
