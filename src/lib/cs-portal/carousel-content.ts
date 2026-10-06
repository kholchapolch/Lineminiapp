import { normalizeSku, resolveCanonicalModelKey } from '@/lib/sku';
import { validateCarouselPayload } from '../../../scripts/db/cs-portal/dataset.mjs';
import type { CarouselContentResponse, PortalContent, PortalDataset } from './types';

export class ContentQueryError extends Error {}

export function parseContentQuery(query: URLSearchParams): { locale: 'th' | 'en'; models: string[] } {
  const locale = query.get('locale');
  if ((locale !== 'th' && locale !== 'en') || query.getAll('locale').length !== 1 || [...query.keys()].some(key => !['locale', 'modelKey'].includes(key))) {
    throw new ContentQueryError('Use locale=th|en and optional repeated modelKey.');
  }
  const seen = new Set<string>();
  const models: string[] = [];
  for (const value of query.getAll('modelKey')) {
    const model = value.trim();
    if (!model || model.length > 191 || /[<>\x00-\x1F\x7F]/.test(model)) throw new ContentQueryError('Invalid modelKey.');
    const normalized = normalizeSku(model);
    if (!seen.has(normalized)) { seen.add(normalized); models.push(model); }
    if (models.length > 50) throw new ContentQueryError('At most 50 unique model keys are supported.');
  }
  return { locale, models };
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function compareCarousel(left: PortalContent, right: PortalContent): number {
  // Canonical YYYY-MM-DD HH:mm:ss.SSS values can be ordered without timezone conversion.
  if (left.published_at !== right.published_at) {
    if (left.published_at === null) return 1;
    if (right.published_at === null) return -1;
    return compareText(right.published_at, left.published_at);
  }
  return left.sort_order - right.sort_order || compareText(left.external_key, right.external_key);
}

export function resolveCarouselContent(dataset: PortalDataset, locale: 'th' | 'en', models: string[]): CarouselContentResponse {
  const catalog = new Map(dataset.products.map(product => [product.model_key, product]));
  const rowsByModel = new Map<string, PortalContent[]>();
  for (const row of dataset.contents) {
    if (row.content_type !== 'carousel' || row.locale !== locale || row.target_type !== 'model') continue;
    const rows = rowsByModel.get(row.target_key) ?? [];
    rows.push(row); rowsByModel.set(row.target_key, rows);
  }
  return {
    locale,
    models: models.map(requestedModelKey => {
      const resolvedKey = resolveCanonicalModelKey(requestedModelKey, catalog.keys());
      const product = resolvedKey ? catalog.get(resolvedKey) : undefined;
      const rows = resolvedKey ? rowsByModel.get(resolvedKey) ?? [] : [];
      return {
        requestedModelKey,
        modelKey: resolvedKey ?? normalizeSku(requestedModelKey),
        matchedCatalog: Boolean(product),
        categoryCode: product?.category_code ?? null,
        fallbackImageUrl: product?.image_url ?? null,
        carouselItems: [...rows].sort(compareCarousel).slice(0, 5).map(row => {
          validateCarouselPayload(row.payload);
          return {
            key: row.external_key,
            title: row.payload.title,
            description: row.payload.description,
            imageUrl: row.payload.imageUrl,
            imageAlt: row.payload.title,
            href: row.payload.url,
            publishedAt: row.published_at,
            isMock: row.external_key.startsWith('mock:'),
          };
        }),
      };
    }),
  };
}
