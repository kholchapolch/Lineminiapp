export type MyProductDetail = {
  id: string;
  title: string;
  badgeImageUrl: string;
  unlockedAt: string;
  quantity: number;
};

export type MyProductDetailData = {
  product: MyProductDetail;
  fetchedAt: string;
};
