export function normalizeSku(sku: string): string {
  return sku.trim().toUpperCase();
}

/**
 * Sony warranty `modelName` values often append a regional/catalog suffix
 * (e.g. `/QSYX`, `//Z SYX`, `QSYX`). A product matches an eligible rule SKU
 * when the model name starts with that SKU and the remainder is either empty
 * or a known suffix — not another model-code continuation such as `M` or `2`
 * (`SEL70200GM` must not match `SEL70200G`).
 */
const SONY_MODEL_NAME_SUFFIX = /^(?:\/+|\s+|(?:QSYX|CSYX|SYX)\b).*$/;

/** Returns true when the product SKU equals or is a suffixed form of an eligible rule SKU. */
export function matchesEligibleSku(
  productSku: string,
  eligibleSkus: Iterable<string>,
): boolean {
  const normalizedProductSku = normalizeSku(productSku);

  for (const eligibleSku of eligibleSkus) {
    const normalizedEligibleSku = normalizeSku(eligibleSku);

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
