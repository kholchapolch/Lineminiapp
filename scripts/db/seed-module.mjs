import { isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";

export function resolveArgPath(flag, fallback, importMetaUrl) {
  const flagIndex = process.argv.indexOf(flag);
  const value =
    flagIndex >= 0 && process.argv[flagIndex + 1]
      ? process.argv[flagIndex + 1]
      : fallback;

  return isAbsolute(value) ? pathToFileURL(value) : new URL(value, importMetaUrl);
}

export function resolveSeedDataUrl(importMetaUrl) {
  return resolveArgPath("--seed", "./seed-data.mjs", importMetaUrl);
}

export async function loadSeedData(importMetaUrl) {
  return import(resolveSeedDataUrl(importMetaUrl).href);
}
