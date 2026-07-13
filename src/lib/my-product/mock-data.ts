import type { MyProductDetail } from "@/lib/my-product/types";

const BADGE_HERO_IMAGE = "/mock/my-product/badge-hero.svg";

const productDetails: MyProductDetail[] = [
  {
    id: "fe-24-70-gm2",
    title: "FE 24-70mm F2.8 GM II",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2025-12-20T00:00:00.000Z",
    quantity: 3,
  },
  {
    id: "fe-100-stf",
    title: "FE 100mm F2.8 STF GM OSS",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2025-11-08T00:00:00.000Z",
    quantity: 1,
  },
  {
    id: "fe-90-macro",
    title: "FE 90mm F2.8 Macro G OSS",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2025-10-15T00:00:00.000Z",
    quantity: 1,
  },
  {
    id: "fe-14-gm",
    title: "FE 14mm F1.8 GM",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2025-09-02T00:00:00.000Z",
    quantity: 2,
  },
  {
    id: "fe-16-g",
    title: "FE 16mm F1.8 G",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2025-08-21T00:00:00.000Z",
    quantity: 1,
  },
  {
    id: "fe-20-g",
    title: "FE 20mm F1.8 G",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2025-07-30T00:00:00.000Z",
    quantity: 1,
  },
  {
    id: "fe-35-gm",
    title: "FE 35mm F1.4 GM",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2025-06-12T00:00:00.000Z",
    quantity: 1,
  },
  {
    id: "fe-35-18",
    title: "FE 35mm F1.8",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2025-05-04T00:00:00.000Z",
    quantity: 1,
  },
  {
    id: "fe-50-gm",
    title: "FE 50mm F1.4 GM",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2025-04-18T00:00:00.000Z",
    quantity: 2,
  },
  {
    id: "fe-16-35-gm2",
    title: "FE 16-35mm F2.8 GM II",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2025-03-09T00:00:00.000Z",
    quantity: 1,
  },
  {
    id: "fe-70-200-gm2",
    title: "FE 70-200mm F2.8 GM OSS II",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2025-02-14T00:00:00.000Z",
    quantity: 1,
  },
  {
    id: "fe-200-600-g",
    title: "FE 200-600mm F5.6-6.3 G OSS",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2025-01-25T00:00:00.000Z",
    quantity: 1,
  },
  {
    id: "ilce-7m4",
    title: "ILCE-7M4",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2024-12-01T00:00:00.000Z",
    quantity: 1,
  },
  {
    id: "ilce-7rm5",
    title: "ILCE-7RM5",
    badgeImageUrl: BADGE_HERO_IMAGE,
    unlockedAt: "2024-11-20T00:00:00.000Z",
    quantity: 1,
  },
];

export const mockMyProductDetails = new Map(
  productDetails.map((product) => [product.id, product] as const),
);

export function getMockMyProductIds(): string[] {
  return productDetails.map((product) => product.id);
}
