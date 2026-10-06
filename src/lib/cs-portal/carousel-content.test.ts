import { describe, expect, it } from 'vitest';
import { parseContentQuery, resolveCarouselContent } from './carousel-content';
import { validateDataset } from '../../../scripts/db/cs-portal/dataset.mjs';
import fixture from '../../../scripts/db/cs-portal/fixtures/carousel-e2e-mock.json';
const sample = () => validateDataset(structuredClone(fixture)).dataset;

describe('carousel query and resolver', () => {
  it('sorts newest first, then sort_order, then stable key; caps at five', () => {
    const d = sample(); d.contents.reverse();
    const items = resolveCarouselContent(d, 'th', ['ILME-FX2']).models[0].carouselItems;
    expect(items.map(i => i.key)).toEqual(['mock:latest','mock:same-first','mock:same-a','mock:same-b','mock:old']);
    expect(items.every(i => i.isMock && i.title.startsWith('[MOCK]'))).toBe(true);
    expect(items[0].publishedAt).toBe('2026-09-18 09:00:00.000');
  });
  it('places null dates last and does not invent missing dates or empty slots', () => {
    const d = sample(); d.contents = d.contents.filter(c => ['mock:old','mock:undated-a','mock:undated-b'].includes(c.external_key));
    const items = resolveCarouselContent(d, 'th', ['ILME-FX2']).models[0].carouselItems;
    expect(items.map(i => i.key)).toEqual(['mock:old','mock:undated-a','mock:undated-b']);
    expect(items[1].publishedAt).toBeNull();
  });
  it('returns empty arrays for missing model/content and never fills three slots', () => {
    const result = resolveCarouselContent(sample(), 'th', ['WH-1000XM6','UNKNOWN']);
    expect(result.models[0].matchedCatalog).toBe(true);
    expect(result.models[1].matchedCatalog).toBe(false);
    expect(result.models.every(m => m.carouselItems.length === 0)).toBe(true);
    expect(resolveCarouselContent(sample(), 'en', ['ILME-FX2']).models[0].carouselItems).toHaveLength(1);
  });
  it('matches Sony suffixes with the longest catalog prefix', () => {
    const d = sample();
    expect(resolveCarouselContent(d, 'th', ['ilme-fx2/QSYX']).models[0].modelKey).toBe('ILME-FX2');
    d.products.push({ ...d.products[0], model_key: 'ILME-FX2 KIT', model_name: 'ILME-FX2 KIT' });
    const kit = resolveCarouselContent(d, 'th', ['ILME-FX2 KIT /QSYX']).models[0];
    expect(kit.matchedCatalog).toBe(true); expect(kit.modelKey).toBe('ILME-FX2 KIT');
  });
  it('does not leak another locale or category/global carousel into a model', () => {
    const d = sample(); d.contents = d.contents.filter(c => c.locale === 'th').map(c => ({ ...c, target_type: 'category', target_key: 'DI' }));
    expect(resolveCarouselContent(d, 'th', ['ILME-FX2']).models[0].carouselItems).toEqual([]);
    expect(resolveCarouselContent(d, 'en', ['ILME-FX2']).models[0].carouselItems).toEqual([]);
  });
  it('rejects unsafe payload rather than silently serving or filling it', () => {
    const d = sample(); d.contents.find(c => c.external_key === 'mock:latest')!.payload.url = 'javascript:alert(1)';
    expect(() => resolveCarouselContent(d, 'th', ['ILME-FX2'])).toThrow();
  });
  it('normalizes deduplication while preserving first requested spelling/order', () => {
    const parsed = parseContentQuery(new URLSearchParams('locale=th&modelKey=wh-1000xm6&modelKey=WH-1000XM6&modelKey=ILME-FX2'));
    expect(parsed.models).toEqual(['wh-1000xm6','ILME-FX2']);
    expect(parseContentQuery(new URLSearchParams('locale=en')).models).toEqual([]);
  });
  it('accepts 50 distinct models and rejects 51, blanks and invalid query keys', () => {
    const q = new URLSearchParams({locale:'th'});for(let i=0;i<50;i++)q.append('modelKey',`MODEL-${i}`);
    expect(parseContentQuery(q).models).toHaveLength(50);q.append('modelKey','MODEL-50');expect(()=>parseContentQuery(q)).toThrow();
    for(const query of ['', 'locale=ja','locale=th&locale=en','locale=th&modelKey=','locale=th&modelKey=%3Cscript%3E','locale=th&version=draft'])expect(()=>parseContentQuery(new URLSearchParams(query))).toThrow();
  });
});
