export const PRODUCT_FILTER_IDS = [
  "all",
  "full-frame-camera",
  "prime-lens",
  "wide-normal-zoom-lens",
  "telephoto-super-telephoto-lens",
  "macro-lens",
] as const;

export type ProductFilterId = (typeof PRODUCT_FILTER_IDS)[number];

export type ProductCategoryId = Exclude<ProductFilterId, "all">;

export type MyProductBadgeItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  categoryId: ProductCategoryId;
};

export type MyProductCategory = {
  id: ProductCategoryId;
  columns: 2 | 3;
  items: MyProductBadgeItem[];
};

export type MyProductsData = {
  categories: MyProductCategory[];
  fetchedAt: string;
};
