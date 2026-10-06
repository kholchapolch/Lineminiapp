export function normalizeSku(sku: string): string {
  return sku.trim().toUpperCase();
}

/**
 * Sony warranty `modelName` values append a catalog/color suffix after `/`
 * (cameras: `/BQ AP2`, `/SQ AP2`; lenses: `/QSYX`, `//Z SYX`).
 */
export function canonicalSku(sku: string): string {
  const normalized = normalizeSku(sku);
  const slashIndex = normalized.search(/\/+/);

  return slashIndex === -1 ? normalized : normalized.slice(0, slashIndex).trimEnd();
}

/**
 * Picks the longest catalog SKU that appears in full at the start of the Sony
 * model name. `ILCE-7CM2LSQAP2` resolves to `ILCE-7CM2`, not `ILCE-7C`.
 */
export function resolveCatalogSku(
  productSku: string,
  catalogSkus: Iterable<string>,
): string | null {
  const haystack = normalizeSku(productSku);
  let best: string | null = null;

  for (const catalogSku of catalogSkus) {
    const needle = normalizeSku(catalogSku);

    if (!needle || !haystack.startsWith(needle)) {
      continue;
    }

    if (best === null || needle.length > best.length) {
      best = needle;
    }
  }

  return best;
}

export function collectCatalogSkus(
  sources: Iterable<{
    productModelCode?: string | null;
    skus?: Iterable<string>;
    conditions?: Array<{ sonySkus: Iterable<string> }> | null;
  }>,
): string[] {
  const skus = new Set<string>();

  for (const source of sources) {
    if (source.productModelCode) {
      skus.add(normalizeSku(source.productModelCode));
    }

    for (const sku of source.skus ?? []) {
      skus.add(normalizeSku(sku));
    }

    for (const condition of source.conditions ?? []) {
      for (const sku of condition.sonySkus) {
        skus.add(normalizeSku(sku));
      }
    }
  }

  return [...skus].filter(Boolean);
}

export function resolvedSku(
  productSku: string,
  catalogSkus?: Iterable<string>,
): string {
  if (catalogSkus) {
    return resolveCatalogSku(productSku, catalogSkus) ?? canonicalSku(productSku);
  }

  return canonicalSku(productSku);
}

/**
 * Remaining suffix after the base model code, once slash-catalog suffixes are
 * stripped. Covers glued or spaced lens catalog codes (`QSYX`, ` SYX`) — not
 * another model-code continuation such as `M` or `2` (`SEL70200GM` must not
 * match `SEL70200G`; `ILCE-7CM2` must not match `ILCE-7C`).
 */
const SONY_MODEL_NAME_SUFFIX = /^(?:\s+|(?:QSYX|CSYX|SYX)\b).*$/;

function matchesSkuOrSonySuffix(
  normalizedModelName: string,
  normalizedCanonicalKey: string,
): boolean {
  if (normalizedModelName === normalizedCanonicalKey) {
    return true;
  }

  if (!normalizedModelName.startsWith(normalizedCanonicalKey)) {
    return false;
  }

  const remainder = normalizedModelName.slice(normalizedCanonicalKey.length);
  return remainder === "" || SONY_MODEL_NAME_SUFFIX.test(remainder);
}

/**
 * Resolves a Sony model name to one canonical model key from the portal catalog.
 *
 * Uses the same longest-prefix rule as My Badges (`resolveCatalogSku`):
 * `ILCE-7CM2LSQAP2` maps to `ILCE-7CM2`, not `ILCE-7C`.
 */
export function resolveCanonicalModelKey(
  modelName: string,
  canonicalModelKeys: Iterable<string>,
): string | null {
  if (!normalizeSku(modelName)) {
    return null;
  }

  return resolveCatalogSku(modelName, canonicalModelKeys);
}

/** Returns true when the product SKU equals or is a suffixed form of an eligible rule SKU. */
export function matchesEligibleSku(
  productSku: string,
  eligibleSkus: Iterable<string>,
  catalogSkus?: Iterable<string>,
): boolean {
  if (catalogSkus) {
    const resolved = resolvedSku(productSku, catalogSkus);
    const eligible = new Set([...eligibleSkus].map((sku) => normalizeSku(sku)));

    return eligible.has(resolved);
  }

  const normalizedProductSku = canonicalSku(productSku);

  for (const eligibleSku of eligibleSkus) {
    const normalizedEligibleSku = canonicalSku(eligibleSku);

    if (matchesSkuOrSonySuffix(normalizedProductSku, normalizedEligibleSku)) {
      return true;
    }
  }

  return false;
}
