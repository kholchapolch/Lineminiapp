import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as productsGET } from '@/app/api/cs-portal/products/route';
import { GET as contentGET } from '@/app/api/cs-portal/content/route';
import { loadActiveDataset } from './content-repository';
import { resolveFooter } from './footer-content';
import { resolvePortalContent } from './cta-content';
import { createLineSessionCookie } from '@/lib/auth-session';
import { loadAppConfig } from '@/lib/app-config';
import { validateDataset } from '../../../scripts/db/cs-portal/dataset.mjs';
vi.mock('server-only',()=>({}));
vi.mock('./content-repository',()=>({loadActiveDataset:vi.fn()}));

const FOOTER_LINKS = [
  {external_key:'service-center',locale:'en',content_type:'footer_link',target_type:'global',target_key:'global',action_key:null,sort_order:0,published_at:null,payload:{label:'Service Center Locator',url:'https://www.sony.co.th/microsite/find-sony-authorize-service/'}},
  {external_key:'service-center',locale:'th',content_type:'footer_link',target_type:'global',target_key:'global',action_key:null,sort_order:0,published_at:null,payload:{label:'เช็คศูนย์ซ่อม',url:'https://www.sony.co.th/microsite/find-sony-authorize-service/'}},
  {external_key:'repair-status',locale:'en',content_type:'footer_link',target_type:'global',target_key:'global',action_key:null,sort_order:1,published_at:null,payload:{label:'Repair Status',url:'https://web.sony-asia.com/th/track-repair/'}},
  {external_key:'repair-status',locale:'th',content_type:'footer_link',target_type:'global',target_key:'global',action_key:null,sort_order:1,published_at:null,payload:{label:'เช็คสถานะการซ่อม',url:'https://web.sony-asia.com/th/track-repair/'}},
] as const;

const sample=()=>validateDataset({products:[],contents:structuredClone(FOOTER_LINKS)});
beforeEach(()=>{
 vi.stubEnv('APP_ENV','local');vi.stubEnv('APP_SESSION_SECRET','MOCK-empty-test');vi.stubEnv('SONY_PRODUCT_API_MODE','mock');
 vi.mocked(loadActiveDataset).mockResolvedValue(sample());
});
afterEach(()=>{vi.clearAllMocks();vi.unstubAllEnvs();});
function request(path:string,owner='demo-line-empty') {
 const cookie=createLineSessionCookie({config:loadAppConfig(),lineuuid:owner});
 return new Request(`https://example.test${path}`,{headers:{cookie}});
}
describe('linked no-product state and global footer',()=>{
 it('loads footer without any model for an empty linked account',async()=>{
  const p=await (await productsGET(request('/api/cs-portal/products'))).json();
  expect(p).toMatchObject({accountStatus:'linked',productState:'no_products',products:[],isMock:true,emptyState:{code:'REGISTER_PRODUCT',showFooter:true,action:{type:'internal',route:'/register-product'}}});
  expect(p.placeholder).toBeUndefined();
  const r=await contentGET(request('/api/cs-portal/content?locale=th'));const body=await r.json();
  expect(r.status).toBe(200);expect(body.models).toEqual([]);expect(body.footerItems.map((i:{key:string})=>i.key)).toEqual(['service-center','repair-status']);
  expect(r.headers.get('cache-control')).toBe('private, no-store');expect(loadActiveDataset).toHaveBeenCalledTimes(1);
 });
 it('keeps not-linked separate, without a register-product emptyState',async()=>{
  const p=await (await productsGET(request('/api/cs-portal/products','MOCK-UNKNOWN'))).json();
  expect(p.accountStatus).toBe('not_linked');expect(p.placeholder.showFooter).toBe(false);expect(p.emptyState).toBeUndefined();
 });
 it('does not add the empty state when there are products',async()=>{
  const p=await (await productsGET(request('/api/cs-portal/products','demo-line-earned'))).json();expect(p.productState).toBe('has_products');expect(p.emptyState).toBeUndefined();
 });
 it('serves each language independently and returns no cross-language fallback',()=>{
  const d=sample().dataset;expect(resolveFooter(d,'en').map(i=>i.label)).toEqual(['Service Center Locator','Repair Status']);
  d.contents=d.contents.filter(r=>r.locale==='th');expect(resolveFooter(d,'en')).toEqual([]);
 });
 it('keeps global footer independent of known or unknown model',()=>{
  const d=sample().dataset;expect(resolvePortalContent(d,'th',['ILME-FX2','UNKNOWN']).footerItems).toEqual(resolvePortalContent(d,'th',[]).footerItems);
 });
 it('uses deterministic order for tied indexes and ignores non-global links',()=>{
  const d=sample().dataset;d.contents=d.contents.filter(r=>r.content_type==='footer_link'&&r.locale==='th');
  d.contents.forEach(r=>{r.sort_order=0;});d.contents.reverse();
  expect(resolveFooter(d,'th').map(i=>i.key)).toEqual(['repair-status','service-center']);
  d.contents.forEach(r=>{r.target_type='model';r.target_key='ILME-FX2';});expect(resolveFooter(d,'th')).toEqual([]);
 });
 it('returns safe 500 for unsafe stored footer URLs',async()=>{
  const checked=sample();checked.dataset.contents.find(r=>r.content_type==='footer_link'&&r.locale==='th')!.payload.url='javascript:alert(1)';vi.mocked(loadActiveDataset).mockResolvedValue(checked);
  const r=await contentGET(request('/api/cs-portal/content?locale=th'));expect(r.status).toBe(500);expect(await r.text()).not.toContain('javascript');
 });
 it('requires a session even when fetching only footer',async()=>{
  const r=await contentGET(new Request('https://example.test/api/cs-portal/content?locale=th'));expect(r.status).toBe(401);expect(loadActiveDataset).not.toHaveBeenCalled();
 });
});
