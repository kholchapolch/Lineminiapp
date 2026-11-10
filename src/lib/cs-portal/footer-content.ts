import { validateFooterPayload } from '../../../scripts/db/cs-portal/dataset.mjs';
import type { FooterItem, PortalDataset } from './types';

export function resolveFooter(dataset: PortalDataset, locale: 'th' | 'en'): FooterItem[] {
  return dataset.contents
    .filter(row => row.content_type === 'footer_link' && row.locale === locale && row.target_type === 'global' && row.target_key === 'global')
    .sort((a, b) => a.sort_order - b.sort_order || (a.external_key < b.external_key ? -1 : a.external_key > b.external_key ? 1 : 0))
    .map(row => {
      validateFooterPayload(row.payload);
      return { key: row.external_key, label: row.payload.label, url: row.payload.url, isMock: row.external_key.startsWith('mock:') };
    });
}
