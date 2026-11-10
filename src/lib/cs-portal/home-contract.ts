import type { ProductGroup } from './product-groups';
import type { PortalProductsResponse } from './products';
import type { PortalContentResponse } from './types';

export type ProductsApiResponse = PortalProductsResponse & { productGroups: ProductGroup[] };
export class HomeContentMismatchError extends Error {}

/** URLSearchParams preserves model keys containing slash, +, space or &. */
export function buildHomeContentRequests(products: ProductsApiResponse, locale: 'th' | 'en'): string[] {
  if (products.accountStatus === 'not_linked') return [];
  const keys = [...new Set(products.productGroups.map(group => group.modelKey))];
  const requests: string[] = [];
  for (let offset = 0; offset < Math.max(keys.length, 1); offset += 50) {
    const query = new URLSearchParams({ locale });
    for (const key of keys.slice(offset, offset + 50)) query.append('modelKey', key);
    requests.push(`/api/cs-portal/content?${query}`);
  }
  return requests;
}

/** Pure composition helper: no session, network, React, or server-only dependencies. */
export function composeProductCenter(products: ProductsApiResponse, locale: 'th' | 'en', batches: PortalContentResponse[]) {
  if (products.accountStatus === 'not_linked') {
    return { locale, state: 'not_linked' as const, isMock: products.isMock, cards: [], footerItems: [], placeholder: products.placeholder };
  }
  const expectedCount = buildHomeContentRequests(products, locale).length;
  if (batches.length !== expectedCount || batches.some(batch => batch.locale !== locale)) {
    throw new HomeContentMismatchError('Missing content batch or wrong locale.');
  }
  const footerItems = batches[0].footerItems;
  // Different requests can cross an activation. Fail visibly if observable contracts disagree.
  if (batches.some(batch => JSON.stringify(batch.footerItems) !== JSON.stringify(footerItems))) {
    throw new HomeContentMismatchError('Footer changed between batches; reload content.');
  }
  const byModel = new Map<string, PortalContentResponse['models'][number]>();
  for (const batch of batches) for (const model of batch.models) {
    if (byModel.has(model.requestedModelKey)) throw new HomeContentMismatchError('Duplicate model response.');
    byModel.set(model.requestedModelKey, model);
  }
  if (byModel.size !== products.productGroups.length) throw new HomeContentMismatchError('Unexpected model count.');
  const cards = products.productGroups.map(group => {
    const content = byModel.get(group.modelKey);
    if (!content || content.modelKey !== group.modelKey || content.matchedCatalog !== group.matchedCatalog || content.categoryCode !== group.categoryCode) {
      throw new HomeContentMismatchError('Catalog changed or content is missing; reload products and content.');
    }
    const imageUrl = content.fallbackImageUrl ?? group.imageUrl;
    return {
      ...group,
      imageUrl,
      // FE renders a local empty-image state rather than a broken image when null.
      imageState: imageUrl === null ? 'missing' as const : 'available' as const,
      ctaItems: content.ctaItems,
      carouselItems: content.carouselItems,
    };
  });
  return { locale, state: products.productState, isMock: products.isMock, cards, footerItems, emptyState: products.emptyState };
}
