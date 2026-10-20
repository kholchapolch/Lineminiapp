import { loadActiveDataset } from '@/lib/cs-portal/content-repository';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { loadAppConfig } from '@/lib/app-config';
import { createLineSessionCookie } from '@/lib/auth-session';
import { createSonyProductsClient } from '@/lib/sony-products-client';
vi.mock('server-only',()=>({}));
vi.mock('@/lib/cs-portal/content-repository',()=>({loadActiveDataset:vi.fn()}));
beforeEach(()=>{
 vi.mocked(loadActiveDataset).mockResolvedValue({version:'test',dataset:{products:[],contents:[]}});
 vi.stubEnv('APP_ENV','local');vi.stubEnv('APP_SESSION_SECRET','mock-products-test');vi.stubEnv('SONY_PRODUCT_API_MODE','live');
 vi.stubEnv('SONY_PRODUCT_API_BASE_URL','https://sony.example.test/warranty');vi.stubEnv('SONY_PRODUCT_API_SUBSCRIPTION_KEY','MOCK-KEY');
 vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({prodDetails:[]})));
});
afterEach(()=>{vi.restoreAllMocks();vi.clearAllMocks();vi.unstubAllEnvs();});
function request(query='',auth='valid') {
 const headers=new Headers();if(auth!=='missing')headers.set('cookie',createLineSessionCookie({config:loadAppConfig(),lineuuid:'MOCK-OWNER',...(auth==='expired'?{now:0}:{})}).split(';')[0]);
 return new Request(`https://local.test/api/cs-portal/products${query}`,{headers});
}
function upstream(payload: unknown,status=200){vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload),{status}));}
describe('Portal products through real Sony client with MOCK upstream transport',()=>{
 it('maps ownership and warranty verbatim, takes identity only from signed session',async()=>{
  upstream({prodDetails:[{lineId:'MOCK-OWNER',modelName:'ILME-FX2/QSYX',serialNumber:'MOCK-SERIAL',registrationDate:'2026-03-25',warrantyExpiryDate:'2027-06-23'}]});
  const r=await GET(request());expect(r.status).toBe(200);expect(r.headers.get('cache-control')).toBe('private, no-store');
  expect(await r.json()).toMatchObject({accountStatus:'linked',productState:'has_products',isMock:false,products:[{sku:'ILME-FX2',modelName:'ILME-FX2/QSYX',serialNumber:'MOCK-SERIAL',registeredAt:'2026-03-25',warrantyExpiryDate:'2027-06-23'}]});
  expect(fetch).toHaveBeenCalledWith('https://sony.example.test/warranty',expect.objectContaining({method:'POST',body:JSON.stringify({countryCode:'th',lineId:'MOCK-OWNER'}),cache:'no-store',signal:expect.any(AbortSignal)}));
 });
 it('loads one active catalog and groups two suffix registrations into one card',async()=>{
  vi.mocked(loadActiveDataset).mockResolvedValue({version:'test',dataset:{products:[{external_key:null,model_key:'ILME-FX2',model_name:'FX2',category_code:'DI',image_url:null,sort_order:0}],contents:[]}});
  upstream({prodDetails:[{modelName:'ILME-FX2/QSYX',serialNumber:'MOCK-1',registrationDate:'2026-01-01'},{modelName:'ILME-FX2',serialNumber:'MOCK-2',registrationDate:'2026-02-01'}]});
  const r=await GET(request());const b=await r.json();expect(r.status).toBe(200);expect(b.products).toHaveLength(2);expect(b.productGroups).toHaveLength(1);expect(b.productGroups[0].registrations.map((p:{serialNumber:string})=>p.serialNumber)).toEqual(['MOCK-2','MOCK-1']);expect(loadActiveDataset).toHaveBeenCalledTimes(1);
 });
 it('does not read catalog for empty or not-linked accounts',async()=>{
  expect((await (await GET(request())).json()).productGroups).toEqual([]);upstream({},404);await GET(request());expect(loadActiveDataset).not.toHaveBeenCalled();
 });
 it('returns safe 500 when catalog is unavailable instead of misclassifying Sony',async()=>{
  upstream({prodDetails:[{modelName:'A',registrationDate:'2026-01-01'}]});vi.mocked(loadActiveDataset).mockRejectedValue(new Error('SECRET DB'));
  const r=await GET(request());expect(r.status).toBe(500);expect(await r.text()).not.toContain('SECRET');
 });
 it('preserves missing dates as null without calculating warranty or adding a time',async()=>{
  upstream({prodDetails:[{modelName:'A',registrationDate:null},{modelName:'A',registrationDate:'2026-01-01',serialNumber:'MOCK-2',warrantyExpiryDate:''}]});
  const body=await (await GET(request())).json();expect(body.products).toHaveLength(2);expect(body.products[0].registeredAt).toBeNull();expect(body.products.every((p:{warrantyExpiryDate:unknown})=>p.warrantyExpiryDate===null)).toBe(true);
 });
 it('keeps the legacy Badge client strict about missing registration dates',async()=>{
  upstream({prodDetails:[{modelName:'A',registrationDate:null}]});
  await expect(createSonyProductsClient(loadAppConfig()).getCustomerProducts('MOCK-OWNER')).rejects.toThrow();
 });
 it('supports existing customer/products response without exposing customer identity',async()=>{
  upstream({customer:{lineuuid:'MOCK-OWNER',customerId:'PRIVATE',displayName:'PRIVATE'},products:[{sku:'A',registeredAt:'2026-01-01',warrantyExpiryDate:'2027-01-01'}]});
  const body=await (await GET(request())).json();expect(body.products[0].warrantyExpiryDate).toBe('2027-01-01');expect(body.customer).toBeUndefined();
 });
 it('distinguishes linked no-products from customer not found',async()=>{
  expect(await (await GET(request())).json()).toMatchObject({accountStatus:'linked',productState:'no_products',products:[]});
  upstream({},404);const r=await GET(request());expect(r.status).toBe(200);expect(await r.json()).toMatchObject({accountStatus:'not_linked',productState:'not_applicable',products:[]});
 });
 it('handles observed UAT HTTP 200 customer-not-found business response',async()=>{
  upstream({errorCode:'100',errorMessage:'Line Id MOCK-OWNER is not found in our database'});
  const r=await GET(request());expect(r.status).toBe(200);expect(await r.json()).toMatchObject({accountStatus:'not_linked',productState:'not_applicable',products:[]});
  upstream({errorCode:'100',errorMessage:'Different business error'});expect((await GET(request())).status).toBe(502);
 });
 it('maps HTTP 200 business errorCode other than 100 to linked empty products',async()=>{
  upstream({errorCode:'200',errorMessage:'Business failure without product list'});
  const r=await GET(request());expect(r.status).toBe(200);
  expect(await r.json()).toMatchObject({
    accountStatus:'linked',
    productState:'no_products',
    products:[],
    productGroups:[],
    emptyState:{code:'REGISTER_PRODUCT',showFooter:true},
  });
 });
 it.each(['missing','expired'])('rejects %s session without contacting Sony',async auth=>{const r=await GET(request('',auth));expect(r.status).toBe(401);expect(fetch).not.toHaveBeenCalled();});
 it.each(['?lineuuid=other','?modelKey=A','?debug=true'])('rejects query %s before contacting Sony',async query=>{expect((await GET(request(query))).status).toBe(400);expect(fetch).not.toHaveBeenCalled();});
 it.each([401,403,429,500,503])('maps upstream %s to safe 502, not unlinked',async status=>{upstream({secret:'PRIVATE'},status);const r=await GET(request());expect(r.status).toBe(502);expect(r.headers.get('cache-control')).toBe('private, no-store');expect(await r.text()).not.toContain('PRIVATE');});
 it.each([null,{}, {prodDetails:[null]}, {prodDetails:[{modelName:42}]}, {prodDetails:[{modelName:'A',registrationDate:123}]}, {prodDetails:[{lineId:'OTHER',modelName:'A',registrationDate:'2026-01-01'}]}, {customer:{lineuuid:'OTHER',customerId:'X',displayName:'X'},products:[]}])('rejects malformed or different-owner data %j',async payload=>{upstream(payload);expect((await GET(request())).status).toBe(502);});
 it('maps network/timeout and invalid JSON failures to 502',async()=>{
  vi.mocked(fetch).mockRejectedValue(new DOMException('PRIVATE','TimeoutError'));expect((await GET(request())).status).toBe(502);
  vi.mocked(fetch).mockResolvedValue(new Response('invalid'));expect((await GET(request())).status).toBe(502);
 });
 it('labels configured mock mode and makes no upstream call',async()=>{
  vi.stubEnv('SONY_PRODUCT_API_MODE','mock');const r=await GET(request());expect((await r.json()).isMock).toBe(true);expect(fetch).not.toHaveBeenCalled();
 });
});
