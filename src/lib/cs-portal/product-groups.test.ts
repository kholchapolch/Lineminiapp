import { describe, expect, it } from 'vitest';
import { getWarrantyStatus, groupPortalProducts } from './product-groups';
import type { PortalOwnedProduct } from './products';
import type { PortalDataset } from './types';
const d:PortalDataset={products:[{external_key:null,model_key:'ILME-FX2',model_name:'FX2',category_code:'DI',image_url:null,sort_order:0}],contents:[]};
const row=(sku:string,serial:string|null,date:string|null,expiry:string|null=null):PortalOwnedProduct=>({sku,serialNumber:serial,registeredAt:date,warrantyExpiryDate:expiry,modelName:sku});
const now=new Date('2026-09-18T10:00:00Z');
describe('Product Card grouping',()=>{
 it('groups exact/suffix models, orders registrations newest first and retains per-serial warranty',()=>{
  const input=[row('ILME-FX2/QSYX','MOCK-A','2026-01-01','2025-01-01'),row('ilme-fx2','MOCK-B','2026-03-01','2027-01-01')];
  const g=groupPortalProducts(input,d,now);expect(g).toHaveLength(1);expect(g[0]).toMatchObject({modelKey:'ILME-FX2',matchedCatalog:true,categoryCode:'DI',modelName:'FX2'});
  expect(g[0].registrations.map(r=>[r.serialNumber,r.warrantyStatus])).toEqual([['MOCK-B','active'],['MOCK-A','expired']]);expect(input[0].serialNumber).toBe('MOCK-A');
 });
 it('maps longer kit names with the longest catalog prefix',()=>{
  const catalog=structuredClone(d);catalog.products.push({...d.products[0],model_key:'ILME-FX2 KIT',model_name:'FX2 KIT'});
  const g=groupPortalProducts([row('ILME-FX2 KIT /QSYX','M',null),row('UNKNOWN-A',null,null),row('UNKNOWN-B',null,null)],catalog,now);
  expect(g).toHaveLength(3);
  expect(g.find(x=>x.modelKey==='ILME-FX2 KIT')).toMatchObject({matchedCatalog:true,modelName:'FX2 KIT'});
  expect(g.filter(x=>!x.matchedCatalog).map(x=>x.modelKey).sort()).toEqual(['UNKNOWN-A','UNKNOWN-B']);
 });
 it('sorts missing/invalid dates last and ties by model then serial',()=>{
  const g=groupPortalProducts([row('Z','M',null),row('A','B','2026-01-01'),row('A','A','2026-01-01'),row('A',null,'bad-date'),row('B','M','2026-02-01')],d,now);
  expect(g.map(x=>x.modelKey)).toEqual(['B','A','Z']);expect(g[1].registrations.map(r=>r.serialNumber)).toEqual(['A','B',null]);
 });
 it('preserves repeated or missing serial rows without losing ownership data',()=>{
  expect(groupPortalProducts([row('A',null,null),row('A',null,null),row('A','S',null),row('A','S',null)],d,now)[0].registrations).toHaveLength(4);
 });
 it('keeps date-only warranty active through expiry day in Bangkok',()=>{
  expect(getWarrantyStatus('2026-09-18',new Date('2026-09-18T16:59:59Z'))).toBe('active');
  expect(getWarrantyStatus('2026-09-18',new Date('2026-09-18T17:00:00Z'))).toBe('expired');
 });
 it.each([null,'bad','2026-02-30','18/09/2026','2026-09-18T12:00:00'])('treats missing/unsupported expiry %s as unknown',date=>expect(getWarrantyStatus(date,now)).toBe('unknown'));
 it('respects explicit timestamp zones and preserves raw source dates',()=>{
  expect(getWarrantyStatus('2026-09-18T16:00:00+07:00',now)).toBe('expired');
  const raw=row('A','M','2026-09-18','2026-09-18');const g=groupPortalProducts([raw],d,now);expect(g[0].registrations[0].registeredAt).toBe(raw.registeredAt);expect(g[0].registrations[0].warrantyExpiryDate).toBe(raw.warrantyExpiryDate);
 });
});
