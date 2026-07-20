export type MyProductDetail = {
  id: string;
  title: string;
  badgeImageUrl: string;
  unlockedAt: string;
  quantity: number;
  registrations?: Array<{
    serialNumber: string | null;
    registeredAt: string;
  }>;
};

export type MyProductDetailData = {
  product: MyProductDetail;
  fetchedAt: string;
};
