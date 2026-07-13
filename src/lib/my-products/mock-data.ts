import type { MyProductsData } from "@/lib/my-products/types";

const macroItems = [
  { id: "fe-100-stf", title: "FE 100mm F2.8 STF GM OSS", imageUrl: null },
  { id: "fe-90-macro", title: "FE 90mm F2.8 Macro G OSS", imageUrl: null },
] as const;

const primeItems = [
  { id: "fe-14-gm", title: "FE 14mm F1.8 GM", imageUrl: null },
  { id: "fe-16-g", title: "FE 16mm F1.8 G", imageUrl: null },
  { id: "fe-20-g", title: "FE 20mm F1.8 G", imageUrl: null },
  { id: "fe-35-gm", title: "FE 35mm F1.4 GM", imageUrl: null },
  { id: "fe-35-18", title: "FE 35mm F1.8", imageUrl: null },
  { id: "fe-50-gm", title: "FE 50mm F1.4 GM", imageUrl: null },
] as const;

const fullFrameItems = [
  { id: "ilce-7m4", title: "ILCE-7M4", imageUrl: null },
  { id: "ilce-7rm5", title: "ILCE-7RM5", imageUrl: null },
] as const;

const wideZoomItems = [
  { id: "fe-24-70-gm2", title: "FE 24-70mm F2.8 GM II", imageUrl: null },
  { id: "fe-16-35-gm2", title: "FE 16-35mm F2.8 GM II", imageUrl: null },
] as const;

const telephotoItems = [
  { id: "fe-70-200-gm2", title: "FE 70-200mm F2.8 GM OSS II", imageUrl: null },
  { id: "fe-200-600-g", title: "FE 200-600mm F5.6-6.3 G OSS", imageUrl: null },
] as const;

function withCategory<T extends { id: string; title: string; imageUrl: null }>(
  items: readonly T[],
  categoryId: MyProductsData["categories"][number]["id"],
): MyProductsData["categories"][number]["items"] {
  return items.map((item) => ({
    ...item,
    categoryId,
  }));
}

export const mockMyProductsCatalog: Omit<MyProductsData, "fetchedAt"> = {
  categories: [
    {
      id: "macro-lens",
      items: withCategory(macroItems, "macro-lens"),
    },
    {
      id: "prime-lens",
      items: withCategory(primeItems, "prime-lens"),
    },
    {
      id: "full-frame-camera",
      items: withCategory(fullFrameItems, "full-frame-camera"),
    },
    {
      id: "wide-normal-zoom-lens",
      items: withCategory(wideZoomItems, "wide-normal-zoom-lens"),
    },
    {
      id: "telephoto-super-telephoto-lens",
      items: withCategory(telephotoItems, "telephoto-super-telephoto-lens"),
    },
  ],
};
