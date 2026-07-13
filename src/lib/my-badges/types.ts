export type MyBadgeItem = {
  id: string;
  title: string;
  imageUrl: string | null;
};

export type MyBadgesProfile = {
  channelName: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
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
