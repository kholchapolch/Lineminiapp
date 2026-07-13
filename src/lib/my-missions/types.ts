export type MissionSectionId = "portrait-master" | "wide-architect";

export type MissionTierStatus = "achieved" | "in-progress" | "locked";

export type MissionTier = {
  id: string;
  imageUrl: string;
  progress: number;
  target: number;
  status: MissionTierStatus;
};

export type MissionSection = {
  id: MissionSectionId;
  tiers: MissionTier[];
};

export type MyMissionsData = {
  sections: MissionSection[];
  fetchedAt: string;
};
