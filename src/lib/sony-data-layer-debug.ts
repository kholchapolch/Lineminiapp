export const SONY_DATALAYER_DEBUG_KEY = "sony_datalayer_debug";

export function isDataLayerDebugEnabled(
  search: string,
  storedFlag: string | null,
): boolean {
  const query = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(query).get("debug") === "1" || storedFlag === "1";
}
