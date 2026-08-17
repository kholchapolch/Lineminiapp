export function resolveArgPath(flag, fallback, importMetaUrl) {
  const flagIndex = process.argv.indexOf(flag);
  const relative =
    flagIndex >= 0 && process.argv[flagIndex + 1]
      ? process.argv[flagIndex + 1]
      : fallback;

  return new URL(relative, importMetaUrl);
}

export function resolveSeedDataUrl(importMetaUrl) {
  return resolveArgPath("--seed", "./seed-data.mjs", importMetaUrl);
}

export async function loadSeedData(importMetaUrl) {
  return import(resolveSeedDataUrl(importMetaUrl).href);
}
