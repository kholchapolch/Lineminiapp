import {
  CTA_ACTION_ORDER,
  type PortalCtaActionKey,
} from "@/lib/cs-portal/portal-cta-labels";

/** Canonical category codes from the CTA visibility matrix. */
export type PortalCtaCategoryCode = "DI" | "HE" | "PE" | "MC" | "PS";

const CATEGORY_ALIASES: Record<string, PortalCtaCategoryCode> = {
  DI: "DI",
  HE: "HE",
  PE: "PE",
  "PERSONAL ENTERTAINMENT": "PE",
  MC: "MC",
  MOBILE: "MC",
  PS: "PS",
  GAME: "PS",
};

const SHARED_FIVE: readonly PortalCtaActionKey[] = [
  "firmware",
  "user-manual",
  "recommended-apps",
  "pro-tips",
  "compatible-gear",
];

/**
 * CTA buttons enabled per product.category_code.
 * Source: client CTA checkbox matrix (DI / HE / PE / MC / PS).
 */
export const CATEGORY_CTA_ACTIONS: Record<
  PortalCtaCategoryCode,
  readonly PortalCtaActionKey[]
> = {
  DI: CTA_ACTION_ORDER,
  HE: SHARED_FIVE,
  PE: SHARED_FIVE,
  MC: SHARED_FIVE,
  PS: ["firmware", "user-manual", "compatible-gear"],
};

export function normalizePortalCtaCategoryCode(
  categoryCode: string | null | undefined,
): PortalCtaCategoryCode | null {
  if (!categoryCode) {
    return null;
  }

  return CATEGORY_ALIASES[categoryCode.trim().toUpperCase()] ?? null;
}

export function ctaActionsForCategory(
  categoryCode: string | null | undefined,
): readonly PortalCtaActionKey[] {
  const code = normalizePortalCtaCategoryCode(categoryCode);
  if (!code) {
    return [];
  }

  return CATEGORY_CTA_ACTIONS[code];
}
