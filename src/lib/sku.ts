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
 * Remaining suffix after the base model code, once slash-catalog suffixes are
 * stripped. Covers glued or spaced lens catalog codes (`QSYX`, ` SYX`) — not
 * another model-code continuation such as `M` or `2` (`SEL70200GM` must not
 * match `SEL70200G`; `ILCE-7CM2` must not match `ILCE-7C`).
 */
const SONY_MODEL_NAME_SUFFIX = /^(?:\s+|(?:QSYX|CSYX|SYX)\b).*$/;

/** Returns true when the product SKU equals or is a suffixed form of an eligible rule SKU. */
export function matchesEligibleSku(
  productSku: string,
  eligibleSkus: Iterable<string>,
): boolean {
  const normalizedProductSku = canonicalSku(productSku);

  for (const eligibleSku of eligibleSkus) {
    const normalizedEligibleSku = canonicalSku(eligibleSku);

    if (normalizedProductSku === normalizedEligibleSku) {
      return true;
    }

    if (!normalizedProductSku.startsWith(normalizedEligibleSku)) {
      continue;
    }

    const remainder = normalizedProductSku.slice(normalizedEligibleSku.length);
    if (remainder === "" || SONY_MODEL_NAME_SUFFIX.test(remainder)) {
      return true;
    }
  }

  return false;
}
