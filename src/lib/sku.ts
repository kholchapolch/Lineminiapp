export function normalizeSku(sku: string): string {
  return sku.trim().toUpperCase();
}

/** Returns true when the product SKU equals or contains an eligible rule SKU. */
export function matchesEligibleSku(
  productSku: string,
  eligibleSkus: Iterable<string>,
): boolean {
  const normalizedProductSku = normalizeSku(productSku);

  for (const eligibleSku of eligibleSkus) {
    const normalizedEligibleSku = normalizeSku(eligibleSku);

    if (
      normalizedProductSku === normalizedEligibleSku ||
      normalizedProductSku.includes(normalizedEligibleSku)
    ) {
      return true;
    }
  }

  return false;
}
