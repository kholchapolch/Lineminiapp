import type { PortalContent, PortalDataset, PortalProduct } from './types';

export class AdminError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

export type Collection = 'products' | 'contents';
export type Mutation = 'create' | 'replace' | 'delete';

export function productIdentity(product: PortalProduct): string { return product.model_key; }
export function contentIdentity(content: PortalContent): string {
  return JSON.stringify([content.locale, content.content_type, content.external_key]);
}

// The caller validates the resulting complete snapshot before writing either table.
export function editDataset(dataset: PortalDataset, collection: Collection, operation: Mutation, identity: string | null, item?: unknown): PortalDataset {
  const identityOf = (row: PortalProduct | PortalContent) => collection === 'products'
    ? productIdentity(row as PortalProduct) : contentIdentity(row as PortalContent);
  const rows: (PortalProduct | PortalContent)[] = [...dataset[collection]];
  const index = rows.findIndex(row => identityOf(row) === identity);
  if (operation !== 'delete' && (!item || typeof item !== 'object' || Array.isArray(item))) {
    throw new AdminError(400, 'INVALID_ITEM', 'A complete item object is required.');
  }
  const replacement = item as PortalProduct | PortalContent;
  if (operation === 'create') {
    if (rows.some(row => identityOf(row) === identityOf(replacement))) throw new AdminError(409, 'ALREADY_EXISTS', 'Item already exists.');
    rows.push(replacement);
  } else {
    if (index < 0) throw new AdminError(404, 'NOT_FOUND', 'Item not found.');
    if (operation === 'delete') rows.splice(index, 1);
    else {
      if (identityOf(replacement) !== identity) throw new AdminError(400, 'IDENTITY_CHANGED', 'Identity cannot change in a replacement.');
      rows[index] = replacement;
    }
  }
  return { ...dataset, [collection]: rows };
}
