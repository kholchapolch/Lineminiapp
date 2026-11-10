import { describe, expect, it } from 'vitest';
import { resolvePortalContent } from './cta-content';
import { validateDataset } from '../../../scripts/db/cs-portal/dataset.mjs';
import type { PortalContent, PortalDataset } from './types';

// Synthetic mappings only; these are not Sony-approved category/button assignments.
function mockCtaDataset(): PortalDataset {
  const row = (key: string, scope: PortalContent['target_type'], target: string, action: string, order: number): PortalContent => ({
    external_key: `mock:${key}`, locale: 'th', content_type: 'cta', target_type: scope, target_key: target,
    action_key: action, sort_order: order, published_at: null,
    payload: { label: `[MOCK] ${key}`, action: { type: 'articles' } },
  });
  return validateDataset({
    products: [{ external_key: null, model_name: 'Mock camera', model_key: 'ILME-FX2', category_code: 'DI', image_url: null, sort_order: 0 }],
    contents: [row('global-support','global','global','support',1), row('category-support','category','DI','support',2),
      row('model-support','model','ILME-FX2','support',3), row('global-badges','global','global','badges',0),
      row('category-tips','category','DI','tips',2)],
  }).dataset;
}
const items = (d = mockCtaDataset(), model = 'ILME-FX2', locale: 'th' | 'en' = 'th') => resolvePortalContent(d, locale, [model]).models[0].ctaItems;

describe('CTA resolution using explicit active dataset mappings', () => {
  it('overrides per action model > category > global and sorts selected rows by CTA index', () => {
    expect(items().map(i => [i.actionKey,i.source])).toEqual([['badges','global'],['tips','category'],['support','model']]);
    expect(items().every(i => i.isMock && i.label.startsWith('[MOCK]'))).toBe(true);
  });
  it('falls back to category then global when higher scope is missing', () => {
    const d=mockCtaDataset();d.contents=d.contents.filter(r=>r.target_type!=='model');
    expect(items(d).find(i=>i.actionKey==='support')?.source).toBe('category');
    d.contents=d.contents.filter(r=>r.target_type!=='category');
    expect(items(d).find(i=>i.actionKey==='support')?.source).toBe('global');
  });
  it('does not infer category aliases and exposes only global for unknown models', () => {
    const d=mockCtaDataset();d.products[0].category_code='UNCONFIRMED';
    expect(items(d).some(i=>i.source==='category')).toBe(false);
    expect(items(d,'UNKNOWN').every(i=>i.source==='global')).toBe(true);
  });
  it('reuses canonical suffix matching',()=>expect(items(mockCtaDataset(),'ILME-FX2/QSYX')).toEqual(items()));
  it('uses deterministic key ordering for duplicate action rows in the same scope',()=>{
    const d=mockCtaDataset();const row=d.contents.find(r=>r.external_key==='mock:model-support')!;
    d.contents.push({...row,external_key:'mock:aaa',payload:{label:'[MOCK] winner',action:{type:'articles'}}});
    expect(items(d).find(i=>i.actionKey==='support')?.key).toBe('mock:aaa');
    d.contents.reverse();expect(items(d).find(i=>i.actionKey==='support')?.key).toBe('mock:aaa');
  });
  it('uses English labels only when explicitly provided and ignores footer links',()=>{
    const d=mockCtaDataset();d.contents.push({...d.contents[0],external_key:'mock:english',locale:'en',payload:{label:'[MOCK] English',action:{type:'articles'}}});
    d.contents.push({external_key:'mock:footer',locale:'en',content_type:'footer_link',target_type:'global',target_key:'global',action_key:null,sort_order:0,published_at:null,payload:{label:'[MOCK] Service center',url:'https://www.sony.co.th/th'}});
    expect(items(d,'ILME-FX2','en').map(i=>i.label)).toEqual(['[MOCK] English']);
  });
  it('never falls back to a different language',()=>expect(items(mockCtaDataset(),'ILME-FX2','en')).toEqual([]));
  it('returns empty CTA arrays when mappings are absent',()=>{const d=mockCtaDataset();d.contents=[];expect(items(d)).toEqual([]);});
  it('preserves typed external, internal and article actions',()=>{
    const d=mockCtaDataset();d.contents.find(r=>r.action_key==='badges')!.payload.action={type:'internal',route:'/my-badges'};
    d.contents.find(r=>r.action_key==='tips')!.payload.action={type:'external',url:'https://www.sony.co.th/th'};
    expect(items(d).map(i=>i.action.type)).toEqual(['internal','external','articles']);
  });
  it.each([{type:'external',url:'javascript:alert(1)'},{type:'internal',route:'//evil.test'},{type:'articles',url:'https://evil.test'}])('rejects unsafe or malformed actions %j',action=>{
    const d=mockCtaDataset();d.contents.find(r=>r.action_key==='badges')!.payload.action=action;
    expect(()=>items(d)).toThrow();
  });
});
