import { normalizeSku, resolveCanonicalModelKey } from '@/lib/sku';
import { validateArticlePayload } from '../../../scripts/db/cs-portal/dataset.mjs';
import { compareCarousel, ContentQueryError, parseContentQuery } from './carousel-content';
import type { ArticlesResponse, PortalDataset } from './types';

export function parseArticlesQuery(query: URLSearchParams) {
  if ([...query.keys()].some(key => !['locale', 'modelKey', 'actionKey'].includes(key)) ||
      query.getAll('modelKey').length !== 1 || query.getAll('actionKey').length !== 1) {
    throw new ContentQueryError('Use one locale, modelKey and actionKey.');
  }
  const actionKey = query.get('actionKey')!.trim();
  if (!actionKey || actionKey.length > 100 || /[<>\x00-\x1F\x7F]/.test(actionKey)) {
    throw new ContentQueryError('Invalid actionKey.');
  }
  const contentQuery = new URLSearchParams(query);
  contentQuery.delete('actionKey');
  const { locale, models } = parseContentQuery(contentQuery);
  return { locale, modelKey: models[0], actionKey };
}

export function resolveArticles(dataset: PortalDataset, locale: 'th' | 'en', requestedModel: string, actionKey: string): ArticlesResponse {
  const canonical = resolveCanonicalModelKey(requestedModel, dataset.products.map(product => product.model_key));
  const product = dataset.products.find(p => p.model_key === canonical);
  const rows = dataset.contents.filter(row => row.content_type === 'article' && row.locale === locale && row.action_key === actionKey && (
    (row.target_type === 'global' && row.target_key === 'global') ||
    (product && row.target_type === 'model' && row.target_key === product.model_key) ||
    (product?.category_code && row.target_type === 'category' && row.target_key === product.category_code)
  )).sort(compareCarousel);
  const seen = new Set<string>();
  const items: ArticlesResponse['items'] = [];
  for (const row of rows) {
    validateArticlePayload(row.payload);
    // Retain the first (newest) row for an identical destination. Query parameters
    // and fragments remain significant; do not merge distinct article destinations.
    const destination = new URL(row.payload.url).href;
    if (seen.has(destination)) continue;
    seen.add(destination);
    items.push({
      key: row.external_key, title: row.payload.title, summary: row.payload.description,
      imageUrl: row.payload.imageUrl, imageAlt: row.payload.title, url: row.payload.url,
      publishedAt: row.published_at, isMock: row.external_key.startsWith('mock:'),
    });
  }
  return { locale, modelKey: canonical ?? normalizeSku(requestedModel), matchedCatalog: Boolean(product), actionKey, items };
}
