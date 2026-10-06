import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateDataset,safeUrl} from './dataset.mjs';
import {importDraft,activateDataset,readDataset} from './repository.mjs';
import {withProductPlaceholders,MOCK_PRODUCT_IMAGE_URL} from './product-placeholder.mjs';
const fixture=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/workbook-uat.json',import.meta.url)));
test('mock fills missing product images only, preserves actual images and content, and cannot be used as a link destination',()=>{
 const original=fixture();
 original.products[0].image_url='https://www.sony.co.th/real-product.png';
 const filled=withProductPlaceholders(original);
 assert.equal(filled.products[0].image_url,original.products[0].image_url);
 assert.equal(filled.products.filter(p=>p.image_url===MOCK_PRODUCT_IMAGE_URL).length,648);
 assert.deepEqual(filled.contents,original.contents);
 assert.equal(original.products[1].image_url,null);
 validateDataset(filled);
 assert.throws(()=>safeUrl(MOCK_PRODUCT_IMAGE_URL));
 filled.products[1].image_url='https://sony.scene7.com/is/image/sonyglobalsolutions/Primary_image_1200?fmt=png-alpha';
 validateDataset(filled);
 filled.products[1].image_url='http://sony.scene7.com/image.png';
 assert.throws(()=>validateDataset(filled));
});
test('canonical hash ignores array/object order but includes changed content',()=>{
 const a=fixture(),b=fixture();b.products.reverse();b.contents.reverse();
 b.products=b.products.map(p=>Object.fromEntries(Object.entries(p).reverse()));
 assert.equal(validateDataset(a).version,validateDataset(b).version);
 b.contents[0].payload.label='Changed';assert.notEqual(validateDataset(a).version,validateDataset(b).version);
});
test('duplicate model, broken reference, locale, raw HTML, unknown blocks and unsafe URLs reject',()=>{
 for(const mutate of [d=>d.products.push(d.products[0]),d=>{d.contents[0].target_type='model';d.contents[0].target_key='UNKNOWN';},d=>{d.contents[0].locale='fr';},d=>{d.contents[0].payload.title='<script>alert(1)</script>';},d=>{d.contents[0].payload.blocks.push({type:'html',text:'bad'});}]){
  const d=fixture();mutate(d);assert.throws(()=>validateDataset(d));
 }
 for(const u of ['javascript:alert(1)','http://www.sony.co.th/a','https://www.sony.co.th.evil.test/a','https://user:password@www.sony.co.th/a'])assert.throws(()=>safeUrl(u));
});
test('workbook subset preserves null images and missing English register page',()=>{
 const {dataset}=validateDataset(fixture());assert.equal(dataset.products.length,649);assert.ok(dataset.products.every(p=>p.image_url===null));assert.equal(dataset.contents.length,5);assert.deepEqual(dataset.contents.filter(c=>c.content_type==='page').map(c=>c.locale),['th']);
});
function fake({revision='0',failInsert=false,missing=false}={}){
 const events=[];
 const c={beginTransaction:async()=>events.push('begin'),commit:async()=>events.push('commit'),rollback:async()=>events.push('rollback'),release:()=>events.push('release'),query:async(sql)=>{
  events.push(sql);
  if(sql.includes('ORDER BY `key`'))return [[{key:'cs_portal_active_dataset_version',value:''},{key:'cs_portal_draft_dataset_version',value:''},{key:'cs_portal_revision',value:revision}]];
  if(sql.startsWith('SELECT (SELECT COUNT'))return [[{n:0}]];
  if(sql.startsWith('INSERT INTO cs_portal_products')&&failInsert)throw Error('simulated write failure');
  if(missing&&sql.includes('FROM cs_portal_'))return [[]];
  return [[]];
 }};
 return {events,c,pool:{getConnection:async()=>c}};
}
test('invalid input never opens DB connection',async()=>{
 let called=false;await assert.rejects(importDraft({getConnection:async()=>{called=true;}},{products:null,contents:[]},'0'));assert.equal(called,false);
});
test('stale revision returns 409 and never inserts',async()=>{
 const f=fake({revision:'2'});await assert.rejects(importDraft(f.pool,fixture(),'1'),e=>e.status===409);assert.ok(f.events.includes('rollback'));assert.ok(!f.events.some(e=>e.startsWith('INSERT')));assert.ok(!f.events.includes('commit'));
});
test('failed import rolls back without changing pointers',async()=>{
 const f=fake({failInsert:true});await assert.rejects(importDraft(f.pool,fixture(),'0'),/simulated/);assert.ok(f.events.includes('rollback'));assert.ok(!f.events.some(e=>e.startsWith('UPDATE')));assert.ok(!f.events.includes('commit'));
});
test('activation rejects absent dataset without changing active pointer',async()=>{
 const f=fake({missing:true});await assert.rejects(activateDataset(f.pool,'a'.repeat(64),'0'));assert.ok(f.events.includes('rollback'));assert.ok(!f.events.some(e=>e.startsWith('UPDATE')));
});
test('stored content tampering fails hash check',async()=>{
 const d=fixture(),version=validateDataset(d).version;d.products[0].model_name='Changed';
 await assert.rejects(readDataset({query:async sql=>[sql.includes('FROM cs_portal_products')?d.products:d.contents]},version),/hash mismatch/);
});

// Transactional adapter double: exercises the actual repository orchestration,
// while deliberately not claiming to validate MySQL syntax/isolation behavior.
function memoryPool() {
 let state = {config: {'cs_portal_active_dataset_version':'','cs_portal_draft_dataset_version':'','cs_portal_revision':'0'},products:[],contents:[]};
 let backup;
 const c = {
  beginTransaction: async()=>{backup=structuredClone(state);},
  commit: async()=>{backup=undefined;},
  rollback: async()=>{state=backup;}, release:()=>{},
  query: async(sql,args=[])=>{
   if(sql.includes('ORDER BY `key`'))return [Object.entries(state.config).filter(([k])=>args.includes(k)).map(([key,value])=>({key,value}))];
   if(sql.startsWith('SELECT (SELECT COUNT'))return [[{n:state.products.filter(r=>r.dataset_version===args[0]).length+state.contents.filter(r=>r.dataset_version===args[0]).length}]];
   if(sql.startsWith('SELECT external_key')){const rows=sql.includes('FROM cs_portal_products')?state.products:state.contents;return [rows.filter(r=>r.dataset_version===args[0]).map(({dataset_version,...row})=>structuredClone(row))];}
   if(sql.startsWith('SELECT `value`'))return [state.config[args[0]]===undefined?[]:[{value:state.config[args[0]]}]];
   if(sql.startsWith('INSERT INTO cs_portal_products')){state.products.push(Object.fromEntries(['dataset_version','external_key','model_name','model_key','category_code','image_url','sort_order'].map((k,i)=>[k,args[i]])));return [[]];}
   if(sql.startsWith('INSERT INTO cs_portal_contents')){state.contents.push(Object.fromEntries(['dataset_version','external_key','locale','content_type','target_type','target_key','action_key','sort_order','published_at','payload'].map((k,i)=>[k,args[i]])));return [[]];}
   if(sql.startsWith('INSERT IGNORE INTO app_config')){state.config[args[0]]??=args[1];return [[]];}
   if(sql.startsWith('INSERT INTO app_config')){state.config.cs_portal_revision=args[0];return [[]];}
   if(sql.startsWith('UPDATE app_config')){state.config[sql.includes("'cs_portal_draft_dataset_version'")?'cs_portal_draft_dataset_version':'cs_portal_active_dataset_version']=args[0];return [[]];}
   throw Error('Unhandled SQL in adapter double');
  },
 };
 return {...c,getConnection:async()=>c,inspect:()=>structuredClone(state)};
}

test('full snapshot import, idempotent reimport, edit, activate and rollback preserve old versions',async()=>{
 const {mutateDraft,readState}=await import('./repository.mjs');
 const p=memoryPool();const d=fixture();d.products=d.products.slice(0,2);
 const first=await importDraft(p,d,'0');assert.equal(first.active,'');
 const second=await importDraft(p,d,'1');assert.equal(first.draft,second.draft);assert.equal(p.inspect().products.length,2);
 await activateDataset(p,first.draft,'2');
 const edited=await mutateDraft(p,'3',data=>({...data,products:data.products.map((r,i)=>i? r:{...r,model_name:'Edited'})}));
 assert.equal(edited.active,first.draft);assert.notEqual(edited.draft,first.draft);
 assert.equal((await readDataset(p,first.draft)).products.some(r=>r.model_name==='Edited'),false);
 await activateDataset(p,edited.draft,'4');await activateDataset(p,first.draft,'5');
 assert.deepEqual(await readState(p),{active:first.draft,draft:edited.draft,revision:'6'});
 await assert.rejects(mutateDraft(p,'5',data=>data),e=>e.status===409);
 assert.equal((await readState(p)).revision,'6');
});
test('empty snapshot has a manifest and remains verifiable/activatable',async()=>{
 const p=memoryPool();const imported=await importDraft(p,{products:[],contents:[]},'0');
 assert.deepEqual(await readDataset(p,imported.draft),{products:[],contents:[]});
 assert.equal((await activateDataset(p,imported.draft,'1')).active,imported.draft);
});
