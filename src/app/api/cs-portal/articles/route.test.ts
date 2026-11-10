import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { GET as contentGET } from '../content/route';
import { loadActiveDataset, loadPortalContentDataset } from '@/lib/cs-portal/content-repository';
import { loadAppConfig } from '@/lib/app-config';
import { createLineSessionCookie } from '@/lib/auth-session';
import { validateDataset } from '../../../../../scripts/db/cs-portal/dataset.mjs';
import fixture from '../../../../../scripts/db/cs-portal/fixtures/carousel-e2e-mock.json';
vi.mock('server-only',()=>({}));
vi.mock('@/lib/cs-portal/content-repository',()=>({
  loadActiveDataset: vi.fn(),
  loadPortalContentDataset: vi.fn(),
}));
beforeEach(()=>{
 vi.stubEnv('APP_ENV','local');vi.stubEnv('APP_SESSION_SECRET','test-articles-only');vi.stubEnv('SONY_PRODUCT_API_MODE','mock');
 const checked=validateDataset(fixture);
 checked.dataset.contents=checked.dataset.contents.map(r=>({...r,content_type:'article',action_key:'firmware'}));
 checked.dataset.contents.push({external_key:'mock:cta',content_type:'cta',locale:'th',target_type:'model',target_key:'ILME-FX2',action_key:'firmware',sort_order:0,published_at:null,payload:{label:'[MOCK] Firmware',action:{type:'articles'}}});
 vi.mocked(loadActiveDataset).mockResolvedValue(checked);
 vi.mocked(loadPortalContentDataset).mockResolvedValue(checked.dataset);
});
afterEach(()=>{vi.clearAllMocks();vi.unstubAllEnvs();});
function request(query='locale=th&modelKey=ILME-FX2&actionKey=firmware',auth='valid') {
 const headers=new Headers();if(auth!=='missing')headers.set('cookie',createLineSessionCookie({config:loadAppConfig(),lineuuid:'MOCK-LOCAL-TEST',...(auth==='expired'?{now:0}:{})}).split(';')[0]);
 return new Request(`https://example.test/api/cs-portal/articles?${query}`,{headers});
}
describe('articles API',()=>{
 it('connects the content CTA action to the matching article set',async()=>{
  const content=await (await contentGET(request('locale=th&modelKey=ILME-FX2'))).json();
  vi.mocked(loadPortalContentDataset).mockClear();
  const response=await GET(request(`locale=th&modelKey=${content.models[0].modelKey}&actionKey=${content.models[0].ctaItems[0].actionKey}`));
  expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('private, no-store');
  const body=await response.json();expect(body.items).toHaveLength(1);expect(body.items[0].key).toBe('mock:latest');expect(body.items[0].isMock).toBe(true);
  expect(loadPortalContentDataset).toHaveBeenCalledTimes(1);
  expect(loadPortalContentDataset).toHaveBeenCalledWith([content.models[0].modelKey]);
 });
 it.each(['missing','expired'])('rejects %s sessions before reading DB',async auth=>{
  const r=await GET(request(undefined,auth));expect(r.status).toBe(401);expect(r.headers.get('cache-control')).toBe('private, no-store');expect(loadPortalContentDataset).not.toHaveBeenCalled();
 });
 it.each(['locale=th','locale=th&modelKey=A&actionKey=x&lineuuid=other','locale=th&modelKey=A&actionKey=x&version=draft'])('rejects invalid query %s',async query=>{const r=await GET(request(query));expect(r.status).toBe(400);expect(loadPortalContentDataset).not.toHaveBeenCalled();});
 it('returns 200 empty for absent action',async()=>{const r=await GET(request('locale=th&modelKey=ILME-FX2&actionKey=missing'));expect(r.status).toBe(200);expect((await r.json()).items).toEqual([]);});
 it('serves English independently',async()=>{const r=await GET(request('locale=en&modelKey=ILME-FX2&actionKey=firmware'));expect((await r.json()).items[0].key).toBe('mock:english');});
 it('returns safe no-store errors',async()=>{vi.mocked(loadPortalContentDataset).mockRejectedValue(new Error('mysql://secret'));const r=await GET(request());expect(r.status).toBe(500);expect(r.headers.get('cache-control')).toBe('private, no-store');expect(await r.text()).not.toContain('secret');});
});
