import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import {
  isDigitalBadgeHomePath,
  sonyDataLayerScript,
  tealiumAsyncLoader,
  tealiumAsyncSrc,
  tealiumEnvironment,
  tealiumSyncSrc,
} from "@/lib/tealium";

describe("tealiumEnvironment", () => {
  it("uses prod only for the production link", () => {
    expect(tealiumEnvironment("https://lineminiapp.sony.co.th")).toBe("prod");
    expect(tealiumEnvironment("lineminiapp.sony.co.th")).toBe("prod");
    expect(tealiumEnvironment("https://stglineminiapp.sony.co.th")).toBe("qa");
    expect(tealiumEnvironment("stglineminiapp.sony.co.th")).toBe("qa");
    expect(tealiumEnvironment("localhost")).toBe("qa");
    expect(tealiumEnvironment("localhost:3000")).toBe("qa");
    expect(tealiumEnvironment(undefined)).toBe("qa");
  });
});

describe("tealium script urls", () => {
  it("builds the Sony SEA sync and async tag urls", () => {
    expect(tealiumSyncSrc("qa")).toBe(
      "https://tags.tiqcdn.com/utag/sony-marketing/sea/qa/utag.sync.js",
    );
    expect(tealiumAsyncSrc("prod")).toBe(
      "https://tags.tiqcdn.com/utag/sony-marketing/sea/prod/utag.js",
    );
  });

  it("uses the production tag urls without placeholders", () => {
    expect(tealiumSyncSrc("prod")).toBe(
      "https://tags.tiqcdn.com/utag/sony-marketing/sea/prod/utag.sync.js",
    );
    expect(tealiumAsyncLoader("prod")).toContain(
      "https://tags.tiqcdn.com/utag/sony-marketing/sea/prod/utag.js",
    );
    expect(tealiumAsyncLoader("prod")).not.toContain("[environment]");
    expect(tealiumAsyncLoader("prod")).not.toContain("urldefense");
    expect(sonyDataLayerScript()).not.toContain("[environment]");
    expect(sonyDataLayerScript()).not.toContain("urldefense");
  });

  it("loads the async tag from the selected environment", () => {
    expect(tealiumAsyncLoader("qa")).toContain(
      "https://tags.tiqcdn.com/utag/sony-marketing/sea/qa/utag.js",
    );
    expect(tealiumAsyncLoader("prod")).not.toContain("/qa/utag.js");
  });
});

type SonyDataLayer = {
  digitalData: {
    page: {
      name: string;
      country: string;
      language: string;
      pageTemplate: string;
      section: string;
      currency: string;
    };
    user: { id: string };
  };
};

function buildDataLayer(pathname: string, memberId?: string): SonyDataLayer {
  const context = {
    window: {
      location: { pathname },
      __sonyMemberId: memberId,
      sessionStorage: {
        getItem: () => null,
      },
    },
  };

  runInNewContext(sonyDataLayerScript(), context);
  return (context.window as unknown as { buildSonyDataLayer: () => SonyDataLayer }).buildSonyDataLayer();
}

describe("isDigitalBadgeHomePath", () => {
  it("matches only the Digital Badge home page", () => {
    expect(isDigitalBadgeHomePath("/th/my-badges")).toBe(true);
    expect(isDigitalBadgeHomePath("/en/my-badges")).toBe(true);
    expect(isDigitalBadgeHomePath("/th/my-missions")).toBe(false);
    expect(isDigitalBadgeHomePath("/th/my-products")).toBe(false);
    expect(isDigitalBadgeHomePath("/th/my-badges/extra")).toBe(false);
  });
});

describe("sony data layer", () => {
  it("names pages from the mini app route", () => {
    expect(buildDataLayer("/th/my-badges").digitalData.page.name).toBe("home");
    expect(buildDataLayer("/en/my-missions").digitalData.page.name).toBe("quest-list");
    expect(buildDataLayer("/th/my-missions/portrait").digitalData.page.name).toBe("badge-detail");
    expect(buildDataLayer("/th/my-product/lens-1").digitalData.page.name).toBe("badge-detail");
    expect(buildDataLayer("/th/my-products").digitalData.page.name).toBe("product-list");
    expect(buildDataLayer("/en/my-badges").digitalData.page.language).toBe("en");
    expect(buildDataLayer("/th/my-badges").digitalData.page.language).toBe("th");
  });

  it("builds the Sony object from the current page and LINE user id", () => {
    expect(buildDataLayer("/en/my-missions", "U-line-user").digitalData).toEqual({
      page: {
        name: "quest-list",
        country: "TH",
        language: "en",
        pageTemplate: "digital-badge",
        section: "line",
        currency: "THB",
      },
      user: { id: "U-line-user" },
    });
  });

  it("uses the stored LINE user id before the page sets it", () => {
    const context = {
      window: {
        location: { pathname: "/th/my-badges" },
        sessionStorage: {
          getItem: (key: string) => (key === "sony_line_uuid" ? "U-stored" : null),
        },
      },
    };

    runInNewContext(sonyDataLayerScript(), context);

    expect(
      (context.window as unknown as { buildSonyDataLayer: () => SonyDataLayer }).buildSonyDataLayer()
        .digitalData.user.id,
    ).toBe("U-stored");
  });

  it("leaves the member id empty when nobody is logged in", () => {
    expect(buildDataLayer("/th/my-badges").digitalData.user.id).toBe("");
  });
});
