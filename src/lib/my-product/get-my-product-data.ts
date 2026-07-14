import { mockMyProductDetails } from "@/lib/my-product/mock-data";
import type { MyProductDetailData } from "@/lib/my-product/types";

export const MY_PRODUCT_REVALIDATE_SECONDS = 300;

export async function getMyProductData(productId: string): Promise<MyProductDetailData | null> {
  const product = mockMyProductDetails.get(productId);

  if (!product) {
    return null;
  }

  return {
    product,
    fetchedAt: new Date().toISOString(),
  };
}
