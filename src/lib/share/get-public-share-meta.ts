import "server-only";

import { getBadgeImageBaseUrl, toShareableAssetUrl } from "@/lib/absolute-url";

import {
  getActiveBadgeRules,
  getBadgeRuntimeConfig,
} from "@/lib/badge-repository";

export type PublicShareMeta = {
  title: string;
  description: string;
  imageUrl: string | null;
  pagePath: string;
};

export async function getPublicProductShareMeta(
  locale: string,
  productId: string,
): Promise<PublicShareMeta | null> {
  const rules = await loadActiveRules();
  const rule = rules.find(
    (candidate) =>
      candidate.code === productId && candidate.badgeType === "product",
  );

  if (!rule) {
    return null;
  }

  const threshold = rule.thresholds[0];
  const imagePath =
    threshold?.shareImageUrl ?? threshold?.achievedImageUrl ?? null;

  return {
    title: rule.name,
    description: rule.description ?? rule.name,
    imageUrl: toShareableAssetUrl(imagePath, getBadgeImageBaseUrl()),
    pagePath: `/${locale}/share/product/${encodeURIComponent(productId)}`,
  };
}

export async function getPublicMissionShareMeta(
  locale: string,
  missionId: string,
): Promise<PublicShareMeta | null> {
  const rules = await loadActiveRules();

  for (const rule of rules) {
    if (rule.badgeType !== "quest") {
      continue;
    }

    const threshold = rule.thresholds.find(
      (candidate) => `${rule.code}-${candidate.level}` === missionId,
    );

    if (!threshold) {
      continue;
    }

    const imagePath =
      threshold.shareImageUrl ?? threshold.achievedImageUrl ?? null;

    return {
      title: threshold.displayName || rule.name,
      description: rule.description ?? rule.name,
      imageUrl: toShareableAssetUrl(imagePath, getBadgeImageBaseUrl()),
      pagePath: `/${locale}/share/mission/${encodeURIComponent(missionId)}`,
    };
  }

  return null;
}

async function loadActiveRules() {
  const runtimeConfig = await getBadgeRuntimeConfig();
  return getActiveBadgeRules({ version: runtimeConfig.badgeRulesVersion });
}
