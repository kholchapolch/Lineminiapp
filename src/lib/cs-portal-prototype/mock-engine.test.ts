import { describe, expect, it } from "vitest";
import {
  MOCK_SCENARIOS,
  resolvePortalScenario,
} from "@/lib/cs-portal-prototype/mock-engine";

describe("resolvePortalScenario", () => {
  it("supports every UUID exposed by the demo selector", () => {
    for (const item of MOCK_SCENARIOS) {
      expect(resolvePortalScenario(item.uuid).resolvedUuid).toBe(item.uuid);
    }
  });

  it("renders all typed block kinds in the dynamic-content case", () => {
    const scenario = resolvePortalScenario("test-dynamic-content");

    expect(scenario.initialView).toBe("register");
    expect(scenario.registerPage.blocks.map((block) => block.type)).toEqual([
      "heading",
      "paragraph",
      "image",
      "check_list",
      "link_button",
    ]);
  });

  it("creates ten CTA actions for the CTA stress case", () => {
    const scenario = resolvePortalScenario("test-10-cta");

    expect(scenario.products[0]?.ctas).toHaveLength(10);
  });

  it.each([
    ["test-no-product", "linked_without_products"],
    ["test-no-line-uuid", "unlinked"],
    ["test-api-error", "upstream_error"],
  ] as const)("maps %s to %s", (uuid, state) => {
    expect(resolvePortalScenario(uuid).state).toBe(state);
  });

  it("falls back safely for an unknown UUID and exposes the mismatch", () => {
    const scenario = resolvePortalScenario("not-in-catalog");

    expect(scenario.resolvedUuid).toBe("test-default");
    expect(scenario.requestedUuid).toBe("not-in-catalog");
    expect(scenario.fallbackNotice).toContain("not-in-catalog");
  });
});
