import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadEnvFile} from 'node:process';
import {decodeBundle} from '../server/cloud-data';
try{loadEnvFile('.env.local');}catch{}
const raw=await readFile(new URL('../data/deploy/knowledge-v1.json',import.meta.url),'utf8');
const bundle=JSON.parse(raw);decodeBundle(bundle);
const version=createHash('sha256').update(raw).digest('hex');
if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Configure server-only SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
const response=await fetch(new URL('/rest/v1/rpc/rd_ready_import_release',process.env.SUPABASE_URL),{method:'POST',headers:{'content-type':'application/json',apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY},body:JSON.stringify({p_version:version,p_bundle:bundle}),signal:AbortSignal.timeout(20000)});
if(!response.ok)throw new Error('Import rejected: HTTP '+response.status);
console.log(JSON.stringify(await response.json()));
