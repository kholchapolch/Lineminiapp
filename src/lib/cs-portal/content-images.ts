/** Same local placeholder used when a registered product has no image. */
export const FALLBACK_CONTENT_IMAGE_URL =
  "/cs-portal-prototype/headphones.svg";

export function resolveContentImageUrl(
  imageUrl: string | null | undefined,
): string {
  const trimmed = imageUrl?.trim();
  return trimmed || FALLBACK_CONTENT_IMAGE_URL;
}
