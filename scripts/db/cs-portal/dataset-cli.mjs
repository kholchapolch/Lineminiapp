import fs from 'node:fs';
import {parseArgs} from 'node:util';
import {createConnectionPool} from '../mysql-connection.mjs';
import {validateDataset} from './dataset.mjs';
import {readState,readDataset,importDraft,activateDataset} from './repository.mjs';
const {values,positionals}=parseArgs({allowPositionals:true,options:{file:{type:'string'},version:{type:'string'},'expected-revision':{type:'string'},'tunnel-port':{type:'string'},'expected-host':{type:'string'},'expected-database':{type:'string'}}});
const command=positionals[0];
if(!['preview','status','apply','activate','verify'].includes(command)||positionals.length!==1)throw Error('Use preview/status/apply/activate/verify');
let checked;
if(['preview','apply'].includes(command)){
  if(!values.file)throw Error('--file required');
  checked=validateDataset(JSON.parse(fs.readFileSync(values.file,'utf8')));
}
if(command==='preview'){
 console.log(JSON.stringify({version:checked.version,products:checked.dataset.products.length,contents:checked.dataset.contents.length},null,2));
}else{
 const u=new URL(process.env.DATABASE_URL);
 if(!values['expected-host']||!values['expected-database']||u.hostname!==values['expected-host']||decodeURIComponent(u.pathname.slice(1))!==values['expected-database'])throw Error('Explicit expected host/database must match DATABASE_URL');
 const localHost=['127.0.0.1','localhost'].includes(u.hostname.toLowerCase());
 const sslValue=(process.env.DATABASE_SSL??u.searchParams.get('ssl')??'').toLowerCase();
 if(!localHost&&!['true','1','required','verify_ca','verify_identity'].includes(sslValue))throw Error('TLS required');
 const pool=createConnectionPool({tunnelPort:values['tunnel-port']===undefined?undefined:Number(values['tunnel-port'])});
 try{
  const [rows]=await pool.query('SELECT DATABASE() AS db');
  if(rows[0].db!==values['expected-database'])throw Error('Server database mismatch');
  let result;
  if(command==='status')result=await readState(pool);
  if(command==='apply')result=await importDraft(pool,checked.dataset,values['expected-revision']??'');
  if(command==='activate')result=await activateDataset(pool,values.version,values['expected-revision']??'');
  if(command==='verify'){const state=await readState(pool);const version=values.version??state.active;const d=await readDataset(pool,version);result={...state,verifiedVersion:version,products:d.products.length,contents:d.contents.length};}
  console.log(JSON.stringify(result,null,2));
 }finally{await pool.end();}
}
