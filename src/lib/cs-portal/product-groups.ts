import { normalizeSku, resolveCanonicalModelKey } from '@/lib/sku';
import type { PortalOwnedProduct } from './products';
import type { PortalDataset } from './types';

export type ProductRegistration = PortalOwnedProduct & { warrantyStatus: 'active' | 'expired' | 'unknown' };
export type ProductGroup = {
  modelKey: string; matchedCatalog: boolean; modelName: string;
  categoryCode: string | null; imageUrl: string | null;
  registrations: ProductRegistration[];
};

function validDay(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
function registrationTime(value: string | null): number | null {
  if (!value) return null;
  if (validDay(value)) return Date.parse(value);

  // Sony ownership API uses Bangkok wall-clock timestamps without a timezone.
  const sonyLocal = /^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);
  if (sonyLocal && validDay(sonyLocal[1])) {
    const time = Date.parse(
      `${sonyLocal[1]}T${sonyLocal[2]}:${sonyLocal[3]}:${sonyLocal[4]}+07:00`,
    );
    return Number.isFinite(time) ? time : null;
  }

  // Only explicit ISO timestamps with a timezone; do not guess other local formats.
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) ||
    !validDay(value.slice(0, 10))
  ) {
    return null;
  }
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}
const compareText = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
/** Newest valid date first; missing/invalid dates last. */
function compareDateDesc(a: string | null, b: string | null): number {
  const left = registrationTime(a), right = registrationTime(b);
  if (left === right) return 0;
  return left === null ? 1 : right === null ? -1 : right - left;
}
function compareRegistration(a: PortalOwnedProduct, b: PortalOwnedProduct): number {
  return (
    compareDateDesc(a.registeredAt, b.registeredAt) ||
    compareDateDesc(a.warrantyExpiryDate, b.warrantyExpiryDate) ||
    compareText(a.serialNumber ?? '', b.serialNumber ?? '') ||
    compareText(a.sku, b.sku)
  );
}
export function getWarrantyStatus(expiry: string | null, now = new Date()): ProductRegistration['warrantyStatus'] {
  if (!expiry) return 'unknown';
  if (validDay(expiry)) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const part = (type: string) => parts.find(p => p.type === type)!.value;
    const today = `${part('year')}-${part('month')}-${part('day')}`;
    return expiry < today ? 'expired' : 'active';
  }
  const time = registrationTime(expiry);
  return time === null ? 'unknown' : time < now.getTime() ? 'expired' : 'active';
}

export function groupPortalProducts(products: PortalOwnedProduct[], dataset: PortalDataset, now = new Date()): ProductGroup[] {
  const catalog = new Map(dataset.products.map(p => [p.model_key, p]));
  const groups = new Map<string, ProductGroup>();
  for (const product of products) {
    // Prefer raw Sony modelName (Column B / full kataban+color) so slash variants
    // resolve exactly; fall back to canonical sku used by badges ingest.
    const resolveInput = product.modelName?.trim() || product.sku;
    const canonical = resolveCanonicalModelKey(resolveInput, catalog.keys());
    const modelKey = canonical ?? normalizeSku(resolveInput);
    const entry = canonical ? catalog.get(canonical) : undefined;
    let group = groups.get(modelKey);
    if (!group) {
      group = { modelKey, matchedCatalog: Boolean(entry), modelName: entry?.model_name ?? modelKey,
        categoryCode: entry?.category_code ?? null, imageUrl: entry?.image_url ?? null, registrations: [] };
      groups.set(modelKey, group);
    }
    // Retain every ownership row, including duplicate/missing serials; never merge warranties.
    group.registrations.push({ ...product, warrantyStatus: getWarrantyStatus(product.warrantyExpiryDate, now) });
  }
  for (const group of groups.values()) group.registrations.sort(compareRegistration);
  return [...groups.values()].sort((a, b) => {
    const left = a.registrations[0];
    const right = b.registrations[0];
    return (
      compareDateDesc(left.registeredAt, right.registeredAt) ||
      compareDateDesc(left.warrantyExpiryDate, right.warrantyExpiryDate) ||
      compareText(a.modelKey, b.modelKey)
    );
  });
}
