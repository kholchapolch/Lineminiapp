export type MissionBadgeVisualState = "unlocked" | "partial" | "empty";

export function getMissionBadgeVisualState(
  progress: number,
  target: number,
): MissionBadgeVisualState {
  if (progress >= target && target > 0) {
    return "unlocked";
  }
  return "partial";
}
