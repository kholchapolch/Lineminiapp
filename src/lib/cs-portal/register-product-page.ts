import { validatePagePayload } from '../../../scripts/db/cs-portal/dataset.mjs';
import type { PortalContent, PortalDataset, RegisterProductPage } from './types';

export class PageNotFoundError extends Error {}

const DEFAULT_REGISTER_PRODUCT_URL =
  'https://www.sony.co.th/microsite/msr-line-menu/product-register';

/**
 * Register CTA href: CMS link_button → NEXT_PUBLIC_REGISTER_PRODUCT_URL → default.
 */
export function resolveRegisterProductHref(
  page: RegisterProductPage | null | undefined,
): string {
  const linkButton = page?.blocks.find((block) => block.type === 'link_button');
  const linkUrl =
    linkButton && 'url' in linkButton ? linkButton.url.trim() : '';
  return (
    linkUrl ||
    process.env.NEXT_PUBLIC_REGISTER_PRODUCT_URL?.trim() ||
    DEFAULT_REGISTER_PRODUCT_URL
  );
}

function toRegisterProductPage(
  content: PortalContent,
  locale: 'th' | 'en',
): RegisterProductPage {
  const payload = content.payload;
  validatePagePayload(payload);
  return {
    key: 'register-product',
    locale,
    title: String((payload as { title: string }).title),
    lead: String((payload as { lead: string }).lead),
    blocks: (payload as { blocks: RegisterProductPage['blocks'] }).blocks,
  };
}

export function resolveRegisterProductPage(dataset: PortalDataset, locale: 'th' | 'en'): RegisterProductPage {
  const matches = dataset.contents.filter(content =>
    content.content_type === 'page' && content.external_key === 'register-product' &&
    content.locale === locale && content.target_type === 'global' && content.target_key === 'global',
  );
  if (!matches.length) throw new PageNotFoundError('Register Product page not found.');
  if (matches.length !== 1) throw new Error('Ambiguous Register Product page.');
  return toRegisterProductPage(matches[0], locale);
}

export function resolveRegisterProductContent(
  content: PortalContent | null,
  locale: 'th' | 'en',
): RegisterProductPage {
  if (
    !content ||
    content.content_type !== 'page' ||
    content.external_key !== 'register-product' ||
    content.locale !== locale ||
    content.target_type !== 'global' ||
    content.target_key !== 'global'
  ) {
    throw new PageNotFoundError('Register Product page not found.');
  }
  return toRegisterProductPage(content, locale);
}
