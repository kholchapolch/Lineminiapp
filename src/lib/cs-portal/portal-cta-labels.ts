import type { Messages } from "@/lib/i18n/messages/types";

export const CTA_ACTION_ORDER = [
  "firmware",
  "user-manual",
  "recommended-apps",
  "pro-tips",
  "compatible-gear",
  "view-my-badge",
  "workshop",
  "contest",
] as const;

export type PortalCtaActionKey = (typeof CTA_ACTION_ORDER)[number];

export type PortalCtaLabel = {
  title: string;
  subtitle: string;
};

export function getPortalCtaLabels(
  messages: Messages["portal"],
): Record<PortalCtaActionKey, PortalCtaLabel> {
  return messages.ctas;
}

export function isPortalCtaActionKey(value: string): value is PortalCtaActionKey {
  return (CTA_ACTION_ORDER as readonly string[]).includes(value);
}
