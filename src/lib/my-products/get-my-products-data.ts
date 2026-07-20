import { getBadgeExperienceForLineUuid } from "@/lib/badge-experience-server";
import type { MyProductsData } from "@/lib/my-products/types";
import { PRODUCT_FILTER_IDS, type ProductCategoryId } from "@/lib/my-products/types";

export async function getMyProductsData(lineuuid: string): Promise<MyProductsData> {
  const experience = await getBadgeExperienceForLineUuid(lineuuid);
  const categoryIds = PRODUCT_FILTER_IDS.filter(
    (id): id is ProductCategoryId => id !== "all",
  );

  return {
    categories: categoryIds.map((id) => ({
      id,
      items: experience.productBadges
        .filter((badge) => badge.groupCode === id)
        .map((badge) => ({
          id: badge.id,
          title: badge.title,
          imageUrl: badge.imageUrl,
          categoryId: id,
          status: badge.status,
        })),
    })),
    fetchedAt: experience.fetchedAt,
  };
}
