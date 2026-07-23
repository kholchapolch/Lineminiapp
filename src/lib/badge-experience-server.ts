import "server-only";

import { loadAppConfig } from "@/lib/app-config";
import {
  buildBadgeExperience,
  type BadgeExperience,
} from "@/lib/badge-experience";
import {
  getActiveBadgeRules,
  getBadgeRuntimeConfig,
} from "@/lib/badge-repository";
import { createSonyProductsClient } from "@/lib/sony-products-client";

export async function getBadgeExperienceForLineUuid(
  lineuuid: string,
): Promise<BadgeExperience> {
  const config = loadAppConfig();
  const [customerProducts, runtimeConfig] = await Promise.all([
    createSonyProductsClient(config).getCustomerProducts(lineuuid),
    getBadgeRuntimeConfig(),
  ]);

  const rules = await getActiveBadgeRules({
    version: runtimeConfig.badgeRulesVersion,
  });

  return buildBadgeExperience({ customerProducts, rules });
}

/** All badges/quests as locked — no Sony customer lookup. */
export async function getLockedBadgeExperience(): Promise<BadgeExperience> {
  const runtimeConfig = await getBadgeRuntimeConfig();
  const rules = await getActiveBadgeRules({
    version: runtimeConfig.badgeRulesVersion,
  });

  return buildBadgeExperience({
    customerProducts: {
      customer: {
        lineuuid: "",
        customerId: "",
        displayName: "",
        lineDisplayName: null,
        linePictureUrl: null,
      },
      products: [],
    },
    rules,
  });
}
