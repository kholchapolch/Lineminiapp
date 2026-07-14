import { mockMyProductsCatalog } from "@/lib/my-products/mock-data";
import type { MyProductsData } from "@/lib/my-products/types";

export const MY_PRODUCTS_REVALIDATE_SECONDS = 300;

export async function getMyProductsData(): Promise<MyProductsData> {
  return {
    ...mockMyProductsCatalog,
    fetchedAt: new Date().toISOString(),
  };
}
