import { describe, expect, it, vi } from 'vitest';
import { SonyCustomerNotFoundError, isSonyCustomerNotFound, createSonyAccountPlaceholder } from './sony-account';
import { SonyCustomerNotFoundError as LegacyError } from './sony-products';
import { GET as portalGET } from '@/app/api/cs-portal/products/route';
import { GET as badgeGET } from '@/app/api/customer-products/route';
import { loadAppConfig } from './app-config';
import { createLineSessionCookie } from './auth-session';
import { afterEach } from 'vitest';
vi.mock('server-only',()=>({}));
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllEnvs();});
function setup() {
 vi.stubEnv('APP_ENV','local');vi.stubEnv('DATABASE_URL','');vi.stubEnv('APP_SESSION_SECRET','MOCK-account-test');vi.stubEnv('SONY_PRODUCT_API_MODE','live');
 vi.stubEnv('SONY_PRODUCT_API_BASE_URL','https://sony.example.test/api');vi.stubEnv('SONY_PRODUCT_API_SUBSCRIPTION_KEY','MOCK');
 return {cookie:createLineSessionCookie({config:loadAppConfig(),lineuuid:'MOCK-NOT-LINKED'})};
}
describe('shared Sony account placeholder',()=>{
 it('preserves the legacy error class and does not classify arbitrary errors as missing accounts',()=>{
  expect(LegacyError).toBe(SonyCustomerNotFoundError);expect(isSonyCustomerNotFound(new LegacyError())).toBe(true);
  for(const e of [null,{},new Error('network'),{code:'CUSTOMER_NOT_FOUND'}])expect(isSonyCustomerNotFound(e)).toBe(false);
 });
 it.each([404,200])('shares placeholder across Portal and Badge for Sony HTTP %s not-found',async status=>{
  const headers=setup();vi.spyOn(globalThis,'fetch').mockImplementation(async()=>new Response(JSON.stringify({errorCode:'100',errorMessage:'Line Id MOCK-NOT-LINKED is not found in our database'}),{status}));
  const portal=await portalGET(new Request('http://local/api/cs-portal/products',{headers}));
  const badge=await badgeGET(new Request('http://local/api/customer-products',{headers}));
  const p=await portal.json();const b=await badge.json();
  expect(portal.status).toBe(200);expect(badge.status).toBe(404);
  expect(b).toMatchObject({code:'CUSTOMER_NOT_FOUND',message:'Customer profile was not found.',accountStatus:'not_linked'});
  expect(p.placeholder).toEqual(b.placeholder);expect(p.placeholder).toEqual(createSonyAccountPlaceholder());
  expect(p.placeholder).toMatchObject({showFooter:false,profileSource:'liff',action:{type:'link_account'}});
  expect(JSON.stringify(b)).not.toContain('MOCK-NOT-LINKED');
 });
 it('keeps session failure distinct and never includes placeholder',async()=>{
  setup();const fetch=vi.spyOn(globalThis,'fetch');
  for(const get of [portalGET,badgeGET]){const r=await get(new Request('http://local/api'));expect(r.status).toBe(401);expect((await r.json()).placeholder).toBeUndefined();}
  expect(fetch).not.toHaveBeenCalled();
 });
 it('keeps upstream errors distinct in both APIs',async()=>{
  const headers=setup();vi.spyOn(globalThis,'fetch').mockImplementation(async()=>new Response('{}',{status:503}));
  const p=await portalGET(new Request('http://local/api',{headers}));const b=await badgeGET(new Request('http://local/api',{headers}));
  expect(p.status).toBe(502);expect(b.status).toBe(500);
  expect((await p.json()).placeholder).toBeUndefined();expect((await b.json()).placeholder).toBeUndefined();
 });
 it('does not show an unlinked placeholder for a linked empty account',async()=>{
  const headers=setup();vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({prodDetails:[]})));
  const body=await (await portalGET(new Request('http://local/api',{headers}))).json();
  expect(body.accountStatus).toBe('linked');expect(body.productState).toBe('no_products');expect(body.placeholder).toBeUndefined();
 });
});
