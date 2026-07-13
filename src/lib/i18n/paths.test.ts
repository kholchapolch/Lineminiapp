import { describe, expect, it } from "vitest";
import { defaultLocale } from "@/lib/i18n/locales";
import { defaultBadgesPath, localizedPath, localizedProductPath, swapLocaleInPath } from "@/lib/i18n/paths";

describe("i18n paths", () => {
  it("builds localized badge and entry paths", () => {
    expect(localizedPath("th", "badges")).toBe("/th/badges");
    expect(localizedPath("en", "entry")).toBe("/en/entry");
    expect(localizedPath("en", "badges", { debug: "1", lineuuid: "demo" })).toBe(
      "/en/badges?debug=1&lineuuid=demo",
    );
  });

  it("builds localized product detail paths", () => {
    expect(localizedProductPath("th", "fe-24-70-gm2")).toBe("/th/my-product/fe-24-70-gm2");
  });

  it("uses the default locale for the home redirect", () => {
    expect(defaultBadgesPath()).toBe(`/${defaultLocale}/badges`);
  });

  it("swaps locale while keeping the rest of the path", () => {
    expect(swapLocaleInPath("/th/badges", "en")).toBe("/en/badges");
    expect(swapLocaleInPath("/en/entry", "th")).toBe("/th/entry");
    expect(swapLocaleInPath("/th/my-product/fe-24-70-gm2", "en")).toBe(
      "/en/my-product/fe-24-70-gm2",
    );
  });
});
