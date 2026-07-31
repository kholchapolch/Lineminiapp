type RedirectGuardConfig = {
  allowedOrigins: string[];
  allowedReferrers: string[];
};

type RedirectGuardResult =
  | { allowed: true }
  | { allowed: false; reason: "missing-source" | "blocked-source" };

export function evaluateRedirectGuard(
  headers: Headers,
  config: RedirectGuardConfig,
): RedirectGuardResult {
  const originHeader = headers.get("origin");
  const referrerHeader = headers.get("referer");
  const origin = normalizeHeaderUrl(originHeader);
  const referrer = normalizeHeaderUrl(referrerHeader);

  if (!originHeader && !referrerHeader) {
    return { allowed: false, reason: "missing-source" };
  }

  const originAllowed = originHeader ? origin && config.allowedOrigins.includes(origin) : true;
  const referrerAllowed = referrerHeader
    ? referrer && config.allowedReferrers.includes(referrer)
    : true;

  if (!originAllowed || !referrerAllowed) {
    return { allowed: false, reason: "blocked-source" };
  }

  return { allowed: true };
}

function normalizeHeaderUrl(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}
