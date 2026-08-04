/**
 * LINE Mini App deep link back to a mission detail screen.
 * https://miniapp.line.me/{liffId}/my-mission/{missionId}
 */
export function buildLineMiniAppMissionCallbackUrl(
  missionId: string,
  liffId: string | undefined = process.env.NEXT_PUBLIC_LIFF_ID,
): string | undefined {
  const id = liffId?.trim();
  if (!id || !missionId.trim()) {
    return undefined;
  }

  return `https://miniapp.line.me/${id}/th/my-missions/${encodeURIComponent(missionId)}`;
}

/**
 * Build the external Sony product-register URL with a return callback.
 */

export function buildRegisterProductUrl(
  callbackUrl: string,
  baseUrl: string | undefined = process.env.NEXT_PUBLIC_REGISTER_PRODUCT_URL,
): string | undefined {
  const base = baseUrl?.trim();
  if (!base) {
    return undefined;
  }

  try {
    const url = new URL(base);
    url.searchParams.set("callback", callbackUrl);
    return url.toString();
  } catch {
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}callback=${encodeURIComponent(callbackUrl)}`;
  }
}
