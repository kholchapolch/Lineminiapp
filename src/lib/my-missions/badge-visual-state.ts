export type MissionBadgeVisualState = "unlocked" | "partial" | "empty";

export function getMissionBadgeVisualState(
  progress: number,
  target: number,
): MissionBadgeVisualState {
  if (progress <= 0) {
    return "empty";
  }
  if (progress >= target) {
    return "unlocked";
  }
  return "partial";
}
