import 'server-only';
import { getPool } from '@/lib/db';
import type { PortalContent, PortalDataset, PortalProduct } from '@/lib/cs-portal/types';
import { readDataset, readState } from '../../../scripts/db/cs-portal/repository.mjs';

export async function loadActiveDataset() {
  const pool = getPool();
  const { active } = await readState(pool);
  if (!/^[a-f0-9]{64}$/.test(active)) throw new Error('Active Portal dataset is unavailable.');
  // Capture once. A concurrent activation cannot mix records from different versions.
  // Reuse snapshot validation/hash verification; no fallback to draft or mock data.
  const dataset = await readDataset(pool, active);
  return { version: active, dataset };
}

export async function loadActiveProductCatalog(): Promise<PortalProduct[]> {
  const pool = getPool();
  const { active } = await readState(pool);
  if (!/^[a-f0-9]{64}$/.test(active)) throw new Error('Active Portal dataset is unavailable.');
  const [rows] = await pool.query(
    'SELECT external_key, model_name, model_key, category_code, image_url, sort_order FROM cs_portal_products WHERE dataset_version = ?',
    [active],
  );
  return (rows as PortalProduct[]).map((row) => ({
    external_key: row.external_key,
    model_name: row.model_name,
    model_key: row.model_key,
    category_code: row.category_code,
    image_url: row.image_url,
    sort_order: Number(row.sort_order),
  }));
}

function mapContentRow(row: Record<string, unknown>): PortalContent {
  let payload = row.payload;
  if (typeof payload === 'string') payload = JSON.parse(payload);
  let publishedAt = row.published_at;
  if (publishedAt !== null && typeof publishedAt === 'string') {
    publishedAt = publishedAt.includes('.') ? publishedAt.padEnd(23, '0') : `${publishedAt}.000`;
  }
  return {
    external_key: String(row.external_key),
    locale: row.locale as PortalContent['locale'],
    content_type: row.content_type as PortalContent['content_type'],
    target_type: row.target_type as PortalContent['target_type'],
    target_key: String(row.target_key),
    action_key: row.action_key === null || row.action_key === undefined ? null : String(row.action_key),
    sort_order: Number(row.sort_order),
    published_at: publishedAt === null || publishedAt === undefined ? null : String(publishedAt),
    payload: payload as Record<string, unknown>,
  };
}

/** Loads CTA/article rows for owned models without reading the full contents table. */
export async function loadPortalContentDataset(modelKeys: string[]): Promise<PortalDataset> {
  const keys = [...new Set(modelKeys.map((key) => key.trim()).filter(Boolean))];
  if (!keys.length) {
    return { products: [], contents: [] };
  }

  const pool = getPool();
  const { active } = await readState(pool);
  if (!/^[a-f0-9]{64}$/.test(active)) throw new Error('Active Portal dataset is unavailable.');

  const modelPlaceholders = keys.map(() => '?').join(', ');
  const [catalogRows] = await pool.query(
    `SELECT external_key, model_name, model_key, category_code, image_url, sort_order
     FROM cs_portal_products
     WHERE dataset_version = ? AND model_key IN (${modelPlaceholders})`,
    [active, ...keys],
  );
  const products = (catalogRows as PortalProduct[]).map((row) => ({
    external_key: row.external_key,
    model_name: row.model_name,
    model_key: row.model_key,
    category_code: row.category_code,
    image_url: row.image_url,
    sort_order: Number(row.sort_order),
  }));
  const categoryCodes = [...new Set(products.map((product) => product.category_code).filter((code): code is string => Boolean(code)))];
  const categoryClause = categoryCodes.length
    ? ` OR (target_type = 'category' AND target_key IN (${categoryCodes.map(() => '?').join(', ')}))`
    : '';
  const [rows] = await pool.query(
    `SELECT external_key, locale, content_type, target_type, target_key, action_key, sort_order, published_at, payload
     FROM cs_portal_contents
     WHERE dataset_version = ?
       AND content_type IN ('cta', 'article', 'carousel')
       AND (
         (target_type = 'model' AND target_key IN (${modelPlaceholders}))
         ${categoryClause}
         OR (target_type = 'global' AND target_key = 'global')
       )`,
    [active, ...keys, ...categoryCodes],
  );

  const known = new Set(products.map((product) => product.model_key));
  for (const key of keys) {
    if (known.has(key)) continue;
    products.push({
      external_key: null,
      model_name: key,
      model_key: key,
      category_code: null,
      image_url: null,
      sort_order: 0,
    });
  }

  return {
    products,
    contents: (rows as Record<string, unknown>[]).map(mapContentRow),
  };
}

/** Loads only the register-product CMS page for one locale from the active dataset. */
export async function loadRegisterProductPage(
  locale: 'th' | 'en',
): Promise<PortalContent | null> {
  const pool = getPool();
  const { active } = await readState(pool);
  if (!/^[a-f0-9]{64}$/.test(active)) throw new Error('Active Portal dataset is unavailable.');

  const [rows] = await pool.query(
    `SELECT external_key, locale, content_type, target_type, target_key, action_key, sort_order, published_at, payload
     FROM cs_portal_contents
     WHERE dataset_version = ?
       AND content_type = 'page'
       AND external_key = 'register-product'
       AND locale = ?
       AND target_type = 'global'
       AND target_key = 'global'
     LIMIT 2`,
    [active, locale],
  );

  const contents = (rows as Record<string, unknown>[]).map(mapContentRow);
  if (!contents.length) return null;
  if (contents.length > 1) throw new Error('Ambiguous Register Product page.');
  return contents[0];
}
