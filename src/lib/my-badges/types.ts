export type MyBadgeItem = {
  id: string;
  title: string;
  imageUrl: string | null;
};

export type MyBadgesProfile = {
  channelName: string;
  lineDisplayName: string;
  linePictureUrl: string | null;
  handle: string;
  isVerified: boolean;
  isOnline: boolean;
  productBadgeCount: number;
  productBadgeTotal: number;
  missionBadgeCount: number;
  missionBadgeTotal: number;
};

export type MyBadgesData = {
  profile: MyBadgesProfile;
  productBadges: MyBadgeItem[];
  missionBadges: MyBadgeItem[];
  fetchedAt: string;
};

export type MyBadgesNoProductsResponse = {
  accountStatus: "linked";
  productState: "no_products";
  emptyState: {
    title: { th: string; en: string };
    action: { label: { th: string; en: string } };
  };
};

export type MyBadgesNotLinkedResponse = {
  accountStatus: "not_linked";
  placeholder: {
    title: { th: string; en: string };
    message: { th: string; en: string };
    action: { label: { th: string; en: string } };
  };
};
