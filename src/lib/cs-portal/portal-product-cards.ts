import type { PortalBottomSheetArticle } from "@/components/portal/PortalBottomSheet";
import type {
  PortalProductCardProps,
  PortalProductCta,
  PortalRecommendedArticle,
} from "@/components/portal/PortalProductCard";
import { resolveArticles } from "@/lib/cs-portal/articles";
import { resolveCarouselContent } from "@/lib/cs-portal/carousel-content";
import { resolvePortalContent } from "@/lib/cs-portal/cta-content";
import {
  CTA_ACTION_ORDER,
  getPortalCtaLabels,
} from "@/lib/cs-portal/portal-cta-labels";
import type { ProductGroup } from "@/lib/cs-portal/product-groups";
import type { CtaAction, PortalDataset } from "@/lib/cs-portal/types";
import type { Messages } from "@/lib/i18n/messages/types";

const FALLBACK_PRODUCT_IMAGE = "/cs-portal-prototype/headphones.svg";

function formatPortalDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value.length === 10 ? `${value}T00:00:00+07:00` : value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function formatArticlePublishedAt(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function fillTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}

function actionForKey(actionKey: string, fallback?: CtaAction): CtaAction {
  if (fallback) {
    return fallback;
  }
  if (actionKey === "view-my-badge") {
    return { type: "internal", route: "/my-badges" };
  }
  return { type: "articles" };
}

function articlesForAction(
  dataset: PortalDataset,
  locale: "th" | "en",
  modelKey: string,
  actionKey: string,
): PortalBottomSheetArticle[] {
  return resolveArticles(dataset, locale, modelKey, actionKey).items.map((item) => ({
    id: item.key,
    title: item.title,
    description: item.summary,
    publishedAt: formatArticlePublishedAt(item.publishedAt),
    imageSrc: item.imageUrl,
    href: item.url,
  }));
}

function ctasFromResolved(
  dataset: PortalDataset,
  locale: "th" | "en",
  modelKey: string,
  copy: Messages["portal"],
): PortalProductCta[] {
  const resolved = resolvePortalContent(dataset, locale, [modelKey]).models[0];
  const byActionKey = new Map(
    (resolved?.ctaItems ?? []).map((item) => [item.actionKey, item]),
  );
  const labels = getPortalCtaLabels(copy);

  return CTA_ACTION_ORDER.map((actionKey) => {
    const mapped = byActionKey.get(actionKey);
    const action = actionForKey(actionKey, mapped?.action);
    const label = labels[actionKey];
    return {
      id: actionKey,
      actionKey,
      title: mapped?.label || label.title,
      subtitle: label.subtitle,
      action,
      articles:
        action.type === "articles"
          ? articlesForAction(dataset, locale, modelKey, actionKey)
          : [],
    };
  });
}

function carouselForModel(
  dataset: PortalDataset,
  locale: "th" | "en",
  modelKey: string,
): PortalRecommendedArticle[] {
  const items =
    resolveCarouselContent(dataset, locale, [modelKey]).models[0]?.carouselItems ??
    [];

  return items.map((item) => ({
    id: item.key,
    title: item.title,
    description: item.description,
    imageSrc: item.imageUrl,
    href: item.href,
  }));
}

export function toProductCards(
  groups: ProductGroup[],
  dataset: PortalDataset,
  locale: "th" | "en" = "th",
  copy: Messages["portal"],
): PortalProductCardProps[] {
  return groups.flatMap((group) => {
    const ctas = ctasFromResolved(dataset, locale, group.modelKey, copy);
    const articles = carouselForModel(dataset, locale, group.modelKey);

    return group.registrations.map((registration, index) => {
      const registeredAt = formatPortalDate(registration.registeredAt);
      const warrantyExpiry = formatPortalDate(registration.warrantyExpiryDate);
      const serialNumber = registration.serialNumber ?? "—";
      const warrantyStatus = registration.warrantyStatus;

      return {
        id: `${group.modelKey}:${serialNumber}:${index}`,
        modelKey: group.modelKey,
        targetKey: group.modelKey,
        modelName: group.modelName,
        modelDescription:
          registration.modelName ?? group.categoryCode ?? group.modelKey,
        imageSrc: group.imageUrl || FALLBACK_PRODUCT_IMAGE,
        imageAlt: group.modelName,
        serialNumber,
        registeredAt: registeredAt
          ? fillTemplate(copy.registered, { date: registeredAt })
          : copy.registeredUnknown,
        warrantyLabel: copy.warrantyLabel,
        warrantyExpiry: warrantyExpiry
          ? fillTemplate(copy.warrantyExpiry, { date: warrantyExpiry })
          : copy.warrantyExpiryUnknown,
        warrantyStatus,
        warrantyStatusLabel: copy.warrantyStatus[warrantyStatus],
        ctas,
        recommendedTitle: copy.recommendedTitle,
        articles,
      };
    });
  });
}
