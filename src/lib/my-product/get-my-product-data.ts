import { getBadgeExperienceForLineUuid } from "@/lib/badge-experience-server";
import type { MyProductDetailData } from "@/lib/my-product/types";

export async function getMyProductData(
  productId: string,
  lineuuid: string,
): Promise<MyProductDetailData | null> {
  const experience = await getBadgeExperienceForLineUuid(lineuuid);
  const product = experience.productBadges.find((badge) => badge.id === productId);

  if (!product || product.status !== "unlocked" || !product.earnedAt || !product.imageUrl) {
    return null;
  }

  return {
    product: {
      id: product.id,
      title: product.title,
      badgeImageUrl: product.imageUrl,
      unlockedAt: product.earnedAt,
      quantity: product.quantity,
      registrations: product.registrations,
    },
    fetchedAt: experience.fetchedAt,
  };
}
