import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { loadActiveDataset } from '@/lib/cs-portal/content-repository';
import { loadAppConfig } from '@/lib/app-config';
import { createLineSessionCookie } from '@/lib/auth-session';
import { validateDataset } from '../../../../../scripts/db/cs-portal/dataset.mjs';
import fixture from '../../../../../scripts/db/cs-portal/fixtures/carousel-e2e-mock.json';
vi.mock('server-only',()=>({}));
vi.mock('@/lib/cs-portal/content-repository',()=>({loadActiveDataset:vi.fn()}));
beforeEach(()=>{
 vi.stubEnv('APP_ENV','local');vi.stubEnv('APP_SESSION_SECRET','test-only-carousel-session');vi.stubEnv('SONY_PRODUCT_API_MODE','mock');
 const checked=validateDataset(fixture);vi.mocked(loadActiveDataset).mockResolvedValue({version:checked.version,dataset:checked.dataset});
});
afterEach(()=>{vi.clearAllMocks();vi.unstubAllEnvs();});
function request(query='locale=th&modelKey=ILME-FX2',auth:'valid'|'missing'|'expired'='valid'){
 const headers=new Headers();if(auth!=='missing')headers.set('cookie',createLineSessionCookie({config:loadAppConfig(),lineuuid:'MOCK-TEST-SESSION',...(auth==='expired'?{now:0}:{})}).split(';')[0]);
 return new Request(`https://example.test/api/cs-portal/content?${query}`,{headers});
}
describe('GET /api/cs-portal/content carousel',()=>{
 it('composes CTA and carousel from the same active snapshot',async()=>{
  const checked=validateDataset(fixture);
  checked.dataset.contents.push({external_key:'mock:cta',locale:'th',content_type:'cta',target_type:'category',target_key:'DI',action_key:'support',sort_order:0,published_at:null,payload:{label:'[MOCK] Support',action:{type:'articles'}}});
  vi.mocked(loadActiveDataset).mockResolvedValue({version:checked.version,dataset:checked.dataset});
  const r=await GET(request());const body=await r.json();
  expect(r.status).toBe(200);expect(body.models[0].carouselItems).toHaveLength(5);
  expect(body.models[0].ctaItems).toEqual([{key:'mock:cta',actionKey:'support',label:'[MOCK] Support',action:{type:'articles'},source:'category',isMock:true}]);
  expect(loadActiveDataset).toHaveBeenCalledTimes(1);
 });
 it('fails closed on malformed CTA payload without leaking internals',async()=>{
  const checked=validateDataset(fixture);
  checked.dataset.contents.push({external_key:'mock:unsafe',locale:'th',content_type:'cta',target_type:'global',target_key:'global',action_key:'unsafe',sort_order:0,published_at:null,payload:{label:'[MOCK]',action:{type:'external',url:'javascript:alert(1)'}}});
  vi.mocked(loadActiveDataset).mockResolvedValue({version:checked.version,dataset:checked.dataset});
  const r=await GET(request());expect(r.status).toBe(500);expect(await r.json()).toEqual({code:'CONTENT_UNAVAILABLE',message:'Unable to load Portal content.'});
 });
 it('returns up to five sorted items, model metadata and no-store',async()=>{
  const response=await GET(request());expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('private, no-store');
  const body=await response.json();expect(body.models[0].carouselItems).toHaveLength(5);expect(body.models[0].carouselItems[0].key).toBe('mock:latest');expect(loadActiveDataset).toHaveBeenCalledTimes(1);
 });
 it.each(['missing','expired'] as const)('rejects %s session before DB reads',async auth=>{const response=await GET(request('locale=th&lineuuid=someone',auth));expect(response.status).toBe(401);expect(loadActiveDataset).not.toHaveBeenCalled();expect(response.headers.get('cache-control')).toBe('private, no-store');});
 it.each(['locale=ja','locale=th&locale=en','locale=th&modelKey=','locale=th&lineuuid=someone','locale=th&version=draft'])('rejects invalid query %s',async query=>{expect((await GET(request(query))).status).toBe(400);expect(loadActiveDataset).not.toHaveBeenCalled();});
 it('returns 200 empty lists for unknown model and no models',async()=>{
  expect((await (await GET(request('locale=th&modelKey=UNKNOWN'))).json()).models[0].carouselItems).toEqual([]);
  expect(await (await GET(request('locale=th'))).json()).toEqual({locale:'th',models:[],footerItems:[]});
 });
 it('serves the requested language only',async()=>{const body=await (await GET(request('locale=en&modelKey=ILME-FX2'))).json();expect(body.models[0].carouselItems.map((i:{key:string})=>i.key)).toEqual(['mock:english']);});
 it('returns safe 500 without leaking database errors',async()=>{vi.mocked(loadActiveDataset).mockRejectedValue(new Error('mysql://secret@host'));const r=await GET(request());expect(r.status).toBe(500);expect(await r.text()).not.toContain('secret');});
});
