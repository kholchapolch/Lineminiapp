import { describe, expect, it } from "vitest";
import {
  CATEGORY_CTA_ACTIONS,
  ctaActionsForCategory,
  normalizePortalCtaCategoryCode,
} from "@/lib/cs-portal/portal-cta-visibility";

describe("portal CTA visibility by category_code", () => {
  it("maps catalog aliases to canonical codes", () => {
    expect(normalizePortalCtaCategoryCode("DI")).toBe("DI");
    expect(normalizePortalCtaCategoryCode("he")).toBe("HE");
    expect(normalizePortalCtaCategoryCode("Personal Entertainment")).toBe("PE");
    expect(normalizePortalCtaCategoryCode("Mobile")).toBe("MC");
    expect(normalizePortalCtaCategoryCode("Game")).toBe("PS");
    expect(normalizePortalCtaCategoryCode("Game Business")).toBe("PS");
    expect(normalizePortalCtaCategoryCode("unknown")).toBeNull();
    expect(normalizePortalCtaCategoryCode(null)).toBeNull();
  });

  it("exposes the client CTA matrix", () => {
    expect(CATEGORY_CTA_ACTIONS.DI).toEqual([
      "firmware",
      "user-manual",
      "recommended-apps",
      "pro-tips",
      "compatible-gear",
      "view-my-badge",
      "workshop",
      "contest",
    ]);
    expect(ctaActionsForCategory("HE")).toEqual([
      "firmware",
      "user-manual",
      "recommended-apps",
      "pro-tips",
      "compatible-gear",
    ]);
    expect(ctaActionsForCategory("PE")).toEqual(ctaActionsForCategory("HE"));
    expect(ctaActionsForCategory("MC")).toEqual(ctaActionsForCategory("HE"));
    expect(ctaActionsForCategory("PS")).toEqual([
      "firmware",
      "user-manual",
      "compatible-gear",
    ]);
  });

  it("uses aliases when reading product.category_code from catalog names", () => {
    expect(ctaActionsForCategory("Personal Entertainment")).toEqual(
      ctaActionsForCategory("PE"),
    );
    expect(ctaActionsForCategory("Mobile")).toEqual(ctaActionsForCategory("MC"));
    expect(ctaActionsForCategory("Game")).toEqual(ctaActionsForCategory("PS"));
  });

  it("hides CTAs when category is missing or unknown", () => {
    expect(ctaActionsForCategory(null)).toEqual([]);
    expect(ctaActionsForCategory("UNCONFIRMED")).toEqual([]);
  });
});
