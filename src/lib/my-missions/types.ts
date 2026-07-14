export type MissionSectionId =
  | "portrait-master"
  | "wide-architect"
  | "the-visionary"
  | "trinity-master"
  | "trinity-junior"
  | "all-rounder"
  | "f2-master"
  | "the-magnifier";

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
