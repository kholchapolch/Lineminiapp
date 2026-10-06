import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as productsGET } from '@/app/api/cs-portal/products/route';
import { GET as contentGET } from '@/app/api/cs-portal/content/route';
import { loadActiveDataset } from './content-repository';
import { buildHomeContentRequests, composeProductCenter, type ProductsApiResponse } from './home-contract';
import { loadAppConfig } from '@/lib/app-config';
import { createLineSessionCookie } from '@/lib/auth-session';
import { validateDataset } from '../../../scripts/db/cs-portal/dataset.mjs';
import fixture from '../../../scripts/db/cs-portal/fixtures/carousel-e2e-mock.json';
import workbook from '../../../scripts/db/cs-portal/fixtures/workbook-uat.json';
import type { PortalContentResponse } from './types';
vi.mock('server-only',()=>({}));
vi.mock('./content-repository',()=>({loadActiveDataset:vi.fn()}));
beforeEach(()=>{
 vi.stubEnv('APP_ENV','local');vi.stubEnv('APP_SESSION_SECRET','MOCK-home-test');vi.stubEnv('SONY_PRODUCT_API_MODE','live');
 vi.stubEnv('SONY_PRODUCT_API_BASE_URL','https://sony.example.test/api');vi.stubEnv('SONY_PRODUCT_API_SUBSCRIPTION_KEY','MOCK');
 const data=structuredClone(fixture);
 const checked=validateDataset(data);
 checked.dataset.contents.push(...validateDataset(workbook).dataset.contents.filter(r=>r.content_type==='footer_link'));
 checked.dataset.contents.push({external_key:'mock:home-cta',content_type:'cta',locale:'th',target_type:'category',target_key:'DI',action_key:'support',sort_order:0,published_at:null,payload:{label:'[MOCK] Support',action:{type:'articles'}}});
 vi.mocked(loadActiveDataset).mockResolvedValue(checked);
 vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({prodDetails:[{modelName:'ILME-FX2/QSYX',serialNumber:'MOCK-A',registrationDate:'2026-01-01'},{modelName:'UNKNOWN',serialNumber:'MOCK-B',registrationDate:'2026-02-01'}]})));
});
afterEach(()=>{vi.restoreAllMocks();vi.clearAllMocks();vi.unstubAllEnvs();});
function req(path:string){return new Request(`https://example.test${path}`,{headers:{cookie:createLineSessionCookie({config:loadAppConfig(),lineuuid:'MOCK-HOME'})}});}
async function flow(locale:'th'|'en'='th'){
 const r=await productsGET(req('/api/cs-portal/products'));expect(r.status).toBe(200);const products:ProductsApiResponse=await r.json();
 const batches:PortalContentResponse[]=[];
 for(const path of buildHomeContentRequests(products,locale)){const r=await contentGET(req(path));expect(r.status).toBe(200);expect(r.headers.get('cache-control')).toBe('private, no-store');batches.push(await r.json());}
 return {products,batches,home:composeProductCenter(products,locale,batches)};
}
describe('Home API contract integration with MOCK Sony and repository',()=>{
 it('combines ownership, unknown models, category CTA, carousel and one global footer without losing order',async()=>{
  const {home}=await flow();expect(home.cards.map(c=>c.modelKey)).toEqual(['UNKNOWN','ILME-FX2']);
  expect(home.cards[1].ctaItems[0].key).toBe('mock:home-cta');expect(home.cards[1].carouselItems).toHaveLength(5);
  expect(home.cards[0].imageState).toBe('missing');expect(home.footerItems).toHaveLength(2);expect(loadActiveDataset).toHaveBeenCalledTimes(2);
 });
 it('serves English independently without Thai CTA fallback',async()=>{const {home}=await flow('en');expect(home.cards[1].ctaItems).toEqual([]);expect(home.cards[1].carouselItems).toHaveLength(1);expect(home.footerItems[0].label).toBe('Service Center Locator');});
 it('loads footer without models for no-products',async()=>{
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({prodDetails:[]})));const {products,home}=await flow();expect(buildHomeContentRequests(products,'th')).toEqual(['/api/cs-portal/content?locale=th']);expect(home.state).toBe('no_products');expect(home.cards).toEqual([]);expect(home.footerItems).toHaveLength(2);
 });
 it('does not fetch content or display footer for unlinked accounts',async()=>{
  vi.mocked(fetch).mockResolvedValue(new Response('{}',{status:404}));const {home}=await flow();expect(home.state).toBe('not_linked');expect(home.footerItems).toEqual([]);expect(loadActiveDataset).not.toHaveBeenCalled();
 });
 it('supports exactly 50 content models; rejects 51 before reading the repository',async()=>{
  const q=new URLSearchParams({locale:'th'});for(let i=0;i<50;i++)q.append('modelKey',`MOCK-${i}`);
  const r=await contentGET(req(`/api/cs-portal/content?${q}`));expect(r.status).toBe(200);expect((await r.json()).models).toHaveLength(50);
  vi.mocked(loadActiveDataset).mockClear();q.append('modelKey','MOCK-50');expect((await contentGET(req(`/api/cs-portal/content?${q}`))).status).toBe(400);expect(loadActiveDataset).not.toHaveBeenCalled();
 });
 it('splits 51 owned models into 50+1 without dropping any card',async()=>{
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({prodDetails:Array.from({length:51},(_,i)=>({modelName:`MOCK-${i}`,registrationDate:'2026-01-01'}))})));
  const {products,home,batches}=await flow();expect(buildHomeContentRequests(products,'th')).toHaveLength(2);expect(batches.map(b=>b.models.length)).toEqual([50,1]);expect(home.cards).toHaveLength(51);expect(home.footerItems).toHaveLength(2);
 });
 it('encodes model keys safely',()=>{
  const p={accountStatus:'linked',productGroups:[{modelKey:'A/B +&'}]} as ProductsApiResponse;
  expect(new URL(buildHomeContentRequests(p,'th')[0],'https://local').searchParams.get('modelKey')).toBe('A/B +&');
 });
 it('refuses incomplete, wrong-language or changed catalog responses',async()=>{
  const {products,batches}=await flow();expect(()=>composeProductCenter(products,'th',[])).toThrow();
  expect(()=>composeProductCenter(products,'en',batches)).toThrow();batches[0].models[0].categoryCode='CHANGED';expect(()=>composeProductCenter(products,'th',batches)).toThrow();
 });
 it('uses the supplied content image when present',async()=>{
  const {products,batches}=await flow();batches[0].models[0].fallbackImageUrl='https://www.sony.co.th/mock-image';const home=composeProductCenter(products,'th',batches);expect(home.cards[0].imageState).toBe('available');expect(home.cards[0].imageUrl).toBe('https://www.sony.co.th/mock-image');
 });
});
