import { describe, expect, it } from 'vitest';
import { parseArticlesQuery, resolveArticles } from './articles';
import { validateDataset } from '../../../scripts/db/cs-portal/dataset.mjs';
import fixture from '../../../scripts/db/cs-portal/fixtures/carousel-e2e-mock.json';
function sample() {
  const d=validateDataset(structuredClone(fixture)).dataset;
  d.contents=d.contents.map((r,i)=>({...r,content_type:'article' as const,action_key:'firmware',payload:{...r.payload,url:`https://www.sony.co.th/th/mock-${i}`}}));
  return d;
}
const resolve=(d=sample(),model='ILME-FX2',locale:'th'|'en'='th',action='firmware')=>resolveArticles(d,locale,model,action);
describe('article selection',()=>{
 it('sorts all articles, with null dates last and stable ties, without carousel limit',()=>{
  expect(resolve().items.map(i=>i.key)).toEqual(['mock:latest','mock:same-first','mock:same-a','mock:same-b','mock:old','mock:undated-a','mock:undated-b']);
 });
 it('merges explicit category and global mappings, and deduplicates destinations after sorting',()=>{
  const d=sample();const latest=d.contents.find(r=>r.external_key==='mock:latest')!;
  d.contents.push({...latest,external_key:'mock:duplicate',target_type:'category',target_key:'DI',published_at:null});
  d.contents.push({...latest,external_key:'mock:global',target_type:'global',target_key:'global',payload:{...latest.payload,url:'https://www.sony.co.th/th/global'}});
  const result=resolve(d);expect(result.items).toHaveLength(8);expect(result.items.some(i=>i.key==='mock:duplicate')).toBe(false);
  d.contents.reverse();expect(resolve(d)).toEqual(result);
 });
 it('keeps distinct query parameters and fragments',()=>{
  const d=sample();d.contents=d.contents.slice(0,3);d.contents.forEach((r,i)=>{r.locale='th';r.payload.url=`https://www.sony.co.th/th/a${['','?v=2','#section'][i]}`;});
  expect(resolve(d).items).toHaveLength(3);
 });
 it('filters model/action/locale without leaking another set',()=>{
  expect(resolve(sample(),'WH-1000XM6').items).toEqual([]);
  expect(resolve(sample(),'ILME-FX2','th','other').items).toEqual([]);
  expect(resolve(sample(),'ILME-FX2','en').items.map(i=>i.key)).toEqual(['mock:english']);
 });
 it('matches suffixes and gives unknown models only global articles',()=>{
  expect(resolve(sample(),'ilme-fx2/QSYX').modelKey).toBe('ILME-FX2');
  const d=sample();d.contents[0].target_type='global';d.contents[0].target_key='global';d.contents[0].locale='th';
  expect(resolve(d,'UNKNOWN').matchedCatalog).toBe(false);expect(resolve(d,'UNKNOWN').items).toHaveLength(1);
 });
 it('does not invent category aliases or dates and marks mock content',()=>{
  const d=sample();d.contents.forEach(r=>{r.target_type='category';r.target_key='PE';});
  expect(resolve(d).items).toEqual([]);
  expect(resolve().items.every(i=>i.isMock)).toBe(true);expect(resolve().items.at(-1)?.publishedAt).toBeNull();
 });
 it('rejects unsafe payload even on a duplicate destination',()=>{
  const d=sample();const r=d.contents.find(r=>r.locale==='th')!;d.contents.push({...r,external_key:'mock:bad',published_at:null,payload:{...r.payload,imageUrl:'javascript:alert(1)'}});
  expect(()=>resolve(d)).toThrow();
 });
 it('parses one model and the exact action returned by CTA',()=>expect(parseArticlesQuery(new URLSearchParams('locale=th&modelKey=ILME-FX2&actionKey=firmware'))).toEqual({locale:'th',modelKey:'ILME-FX2',actionKey:'firmware'}));
 it.each(['','locale=ja&modelKey=A&actionKey=a','locale=th&actionKey=a','locale=th&modelKey=A','locale=th&modelKey=A&modelKey=B&actionKey=a','locale=th&modelKey=A&actionKey=a&actionKey=b','locale=th&modelKey=A&actionKey=%00','locale=th&modelKey=A&actionKey=a&version=draft'])('rejects invalid query %s',q=>expect(()=>parseArticlesQuery(new URLSearchParams(q))).toThrow());
});
