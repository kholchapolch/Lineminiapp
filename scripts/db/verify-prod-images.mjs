import { loadSeedData } from "./seed-module.mjs";

const EXPECTED_ORIGIN =
  "https://mysonybadgestorageprd.blob.core.windows.net";
const ALLOWED_CONTAINERS = new Set(["product-badge", "quest-badge"]);
const CONCURRENCY = 8;
const MAX_ATTEMPTS = 3;

const { badgeThresholds } = await loadSeedData(import.meta.url);
const imageUrls = [
  ...new Set(
    badgeThresholds.flatMap((threshold) =>
      [
        threshold.achievedImageUrl,
        threshold.lockedImageUrl,
        threshold.shareImageUrl,
      ].filter(Boolean),
    ),
  ),
];

if (imageUrls.length === 0) {
  throw new Error("Production seed contains no badge image URLs.");
}

for (const imageUrl of imageUrls) {
  const url = new URL(imageUrl);
  const container = url.pathname.split("/").filter(Boolean)[0];

  if (url.origin !== EXPECTED_ORIGIN) {
    throw new Error(`Unexpected production image origin: ${url.origin}`);
  }

  if (!ALLOWED_CONTAINERS.has(container)) {
    throw new Error(`Unexpected production image container: ${url.pathname}`);
  }
}

async function checkImage(imageUrl) {
  let lastFailure = "unknown error";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(imageUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(20_000),
      });
      const contentType = response.headers.get("content-type") ?? "";

      if (response.ok && contentType.toLowerCase().startsWith("image/")) {
        return;
      }

      lastFailure = `HTTP ${response.status}, content-type=${contentType || "missing"}`;
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
  }

  throw new Error(`${imageUrl}: ${lastFailure}`);
}

const failures = [];
let nextIndex = 0;

async function worker() {
  while (nextIndex < imageUrls.length) {
    const imageUrl = imageUrls[nextIndex];
    nextIndex += 1;

    try {
      await checkImage(imageUrl);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
}

await Promise.all(
  Array.from(
    { length: Math.min(CONCURRENCY, imageUrls.length) },
    () => worker(),
  ),
);

if (failures.length > 0) {
  throw new Error(
    `Production image verification failed (${failures.length}/${imageUrls.length}):\n${failures.join("\n")}`,
  );
}

console.log(
  `Verified ${imageUrls.length} production badge images at ${EXPECTED_ORIGIN}.`,
);
