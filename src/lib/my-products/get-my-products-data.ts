import {
  getBadgeExperienceForLineUuid,
  getLockedBadgeExperience,
} from "@/lib/badge-experience-server";
import type { BadgeExperience } from "@/lib/badge-experience";
import type { MyProductsData } from "@/lib/my-products/types";
import { PRODUCT_FILTER_IDS, type ProductCategoryId } from "@/lib/my-products/types";

export async function getMyProductsData(lineuuid: string): Promise<MyProductsData> {
  return mapExperienceToMyProducts(await getBadgeExperienceForLineUuid(lineuuid));
}

export async function getMyProductsLockedData(): Promise<MyProductsData> {
  return mapExperienceToMyProducts(await getLockedBadgeExperience());
}

function mapExperienceToMyProducts(experience: BadgeExperience): MyProductsData {
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
