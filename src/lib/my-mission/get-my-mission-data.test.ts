import { describe, expect, it, vi } from "vitest";
import type { BadgeExperience } from "@/lib/badge-experience";
import { mapExperienceToMyMission } from "@/lib/my-mission/get-my-mission-data";

vi.mock("server-only", () => ({}));

const portraitProducts = [
  ["SEL35F14GM", "FE 35mm F1.4 GM"],
  ["SEL50F14GM", "FE 50mm F1.4 GM"],
  ["SEL50F12GM", "FE 50mm F1.2 GM"],
  ["SEL85F14GM", "FE 85mm F1.4 GM"],
  ["SEL85F14GM2", "FE 85mm F1.4 GM II"],
  ["SEL100M28GM", "FE 100 mm.F2.8 Macro GM OSS"],
  ["SEL135F18GM", "FE 135mm F1.8 GM"],
] as const;

const experience: BadgeExperience = {
  customer: {
    lineuuid: "line-1",
    customerId: "customer-1",
    displayName: "Customer",
    lineDisplayName: null,
    linePictureUrl: null,
  },
  productBadges: portraitProducts.map(([sku, title], index) => ({
    id: `product-${sku.toLowerCase()}`,
    modelCode: sku,
    title,
    groupCode: "prime-lens",
    status: sku === "SEL35F14GM" ? "unlocked" : "locked",
    imageUrl: `/product-badge/${sku}.png`,
    shareImageUrl: `/product-badge/${sku}.png`,
    productUrl: `https://www.sony.co.th/th/lenses/${sku.toLowerCase()}`,
    earnedAt: sku === "SEL35F14GM" ? "2026-01-01" : null,
    quantity: sku === "SEL35F14GM" ? 1 : 0,
    registrations: [],
    sortOrder: index,
  })),
  questBadges: [
    {
      id: "portrait-master",
      title: "Portrait Master",
      description: null,
      tiers: [
        {
          id: "portrait-master-gold",
          level: "gold",
          title: "Portrait Master Gold",
          status: "in-progress",
          imageUrl: "/quest-badge/portrait-gold.png",
          shareImageUrl: "/quest-badge/portrait-gold.png",
          matchedCount: 1,
          requiredCount: 4,
          remainingCount: 3,
          earnedAt: null,
          sortOrder: 3,
        },
      ],
      highestEarnedTier: null,
      matchedProducts: [
        {
          sku: "SEL35F14GM/QSYX",
          modelName: "FE 35mm F1.4 GM",
          serialNumber: "SN-1",
          registeredAt: "2026-01-01",
        },
      ],
      eligibleSkus: portraitProducts.map(([sku]) => sku),
      sortOrder: 1000,
    },
  ],
  recentProductBadges: [],
  recentQuestBadges: [],
  fetchedAt: "2026-08-11T00:00:00.000Z",
};

describe("mapExperienceToMyMission", () => {
  it("lists every sony_skus product with badge names and detail URLs", () => {
    const result = mapExperienceToMyMission(experience, "portrait-master-gold");

    expect(result?.mission.tickets.map((ticket) => ticket.title)).toEqual(
      portraitProducts.map(([, title]) => title),
    );
    expect(result?.mission.tickets).toHaveLength(7);
    expect(result?.mission.tickets[0]).toMatchObject({
      productCode: "SEL35F14GM",
      title: "FE 35mm F1.4 GM",
      status: "completed",
      productUrl: "https://www.sony.co.th/th/lenses/sel35f14gm",
      imageUrl: "/product-badge/SEL35F14GM.png",
    });
    expect(result?.mission.tickets[5]).toMatchObject({
      productCode: "SEL100M28GM",
      title: "FE 100 mm.F2.8 Macro GM OSS",
      status: "pending",
      productUrl: "https://www.sony.co.th/th/lenses/sel100m28gm",
    });
  });
});
