import { validateCtaPayload } from '../../../scripts/db/cs-portal/dataset.mjs';
import { resolveFooter } from './footer-content';
import { resolveCarouselContent } from './carousel-content';
import type { CtaItem, PortalContent, PortalContentResponse, PortalDataset } from './types';

function compareRows(a: PortalContent, b: PortalContent): number {
  return a.sort_order - b.sort_order || (a.external_key < b.external_key ? -1 : a.external_key > b.external_key ? 1 : 0);
}

export function resolvePortalContent(dataset: PortalDataset, locale: 'th' | 'en', models: string[]): PortalContentResponse {
  const carousel = resolveCarouselContent(dataset, locale, models);
  const ctas = dataset.contents.filter(row => row.content_type === 'cta' && row.locale === locale);
  return {
    ...carousel,
    footerItems: resolveFooter(dataset, locale),
    models: carousel.models.map(model => {
      // Category rows are explicit mappings in the active dataset. Never infer aliases
      // such as PE -> Personal Entertainment or PS -> Game from requirement counts.
      const scopes = [
        ctas.filter(row => model.matchedCatalog && row.target_type === 'model' && row.target_key === model.modelKey),
        ctas.filter(row => model.matchedCatalog && model.categoryCode !== null && row.target_type === 'category' && row.target_key === model.categoryCode),
        ctas.filter(row => row.target_type === 'global' && row.target_key === 'global'),
      ];
      const selected = new Map<string, PortalContent>();
      for (const rows of scopes) {
        for (const row of [...rows].sort(compareRows)) {
          if (!row.action_key) throw new Error('Missing CTA action key');
          // Precedence applies per action, so a model override does not hide unrelated buttons.
          if (!selected.has(row.action_key)) selected.set(row.action_key, row);
        }
      }
      const ctaItems: CtaItem[] = [...selected.values()].sort(compareRows).map(row => {
        validateCtaPayload(row.payload);
        return {
          key: row.external_key,
          actionKey: row.action_key!,
          label: row.payload.label,
          action: row.payload.action,
          source: row.target_type,
          isMock: row.external_key.startsWith('mock:'),
        };
      });
      return { ...model, ctaItems };
    }),
  };
}
