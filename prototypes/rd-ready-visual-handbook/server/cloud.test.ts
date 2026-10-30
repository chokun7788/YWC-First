import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {PGlite} from '@electric-sql/pglite';
import {decodeBundle} from './cloud-data';
import {reserveCloudUsage,sessionIdentity} from './cloud-budget';
import {cloudAssistant,cloudHealth} from './cloud-handler';
const raw=await readFile(new URL('../data/deploy/knowledge-v1.json',import.meta.url),'utf8');
const bundle=JSON.parse(raw),version=createHash('sha256').update(raw).digest('hex');
test('deploy snapshot decodes exactly251 cited records and rejects broken references',()=>{
 const records=decodeBundle(bundle);assert.equal(records.length,251);assert.ok(records.every(r=>r.references.length));
 const broken=structuredClone(bundle);broken.chunks[0].citations[0].sourceId='invented';assert.throws(()=>decodeBundle(broken));
});
test('signed session survives, tampering produces a new identity, no raw IP retained',()=>{
 const secret='TEST_ONLY_SESSION_SECRET_'.repeat(3);const first=sessionIdentity('','127.0.0.1',secret);const cookie=first.cookie.split(';')[0];
 assert.equal(sessionIdentity(cookie,'127.0.0.1',secret).sessionHash,first.sessionHash);
 assert.notEqual(sessionIdentity(cookie.replace(/.$/,'x'),'127.0.0.1',secret).sessionHash,first.sessionHash);
 assert.ok(!first.ipHash.includes('127.0.0.1'));assert.ok(first.cookie.includes('HttpOnly'));assert.ok(first.cookie.includes('Secure'));
});
test('shared reservation fails closed without config, on timeout and non-boolean response',async()=>{
 const identity={sessionHash:'a'.repeat(64),ipHash:'b'.repeat(64)};
 assert.equal(await reserveCloudUsage({},identity),false);
 const env={SUPABASE_URL:'https://TEST_ONLY.invalid',SUPABASE_SERVICE_ROLE_KEY:'TEST_ONLY',RD_READY_SESSION_SECRET:'c'.repeat(40)};
 const original=globalThis.fetch;try{
  globalThis.fetch=async()=>{throw new Error('timeout');};assert.equal(await reserveCloudUsage(env,identity),false);
  globalThis.fetch=async()=>new Response('true',{headers:{'content-type':'application/json'}});assert.equal(await reserveCloudUsage(env,identity),true);
  globalThis.fetch=async()=>new Response('"true"');assert.equal(await reserveCloudUsage(env,identity),false);
 }finally{globalThis.fetch=original;}
});
test('Postgres migration imports idempotently, enforces immutable versions and blocks anon',async()=>{
 const db=new PGlite();try{
  await db.exec('create role anon;create role authenticated;create role service_role bypassrls;');
  await db.exec(await readFile(new URL('../supabase/migrations/20261029230858_rd_ready_initial_schema.sql',import.meta.url),'utf8'));
  await db.exec('set role service_role;');
  const query='select public.rd_ready_import_release($1,$2::jsonb) as result';
  await db.query(query,[version,raw]);await db.query(query,[version,raw]);
  const count=await db.query<{count:number}>('select count(*)::int as count from public.rd_ready_chunks');assert.equal(count.rows[0].count,251);
  const altered=structuredClone(bundle);altered.chunks[0].text+=' changed';await assert.rejects(()=>db.query(query,[version,JSON.stringify(altered)]));
  await db.exec('reset role;set role anon;');await assert.rejects(()=>db.query('select * from public.rd_ready_releases'));await assert.rejects(()=>db.query(query,[version,raw]));
 }finally{await db.close();}
});
test('Postgres atomic reservation respects shared daily/session/IP limits',async()=>{
 const db=new PGlite();try{
  await db.exec('create role anon;create role authenticated;create role service_role bypassrls;');await db.exec(await readFile(new URL('../supabase/migrations/20261029230858_rd_ready_initial_schema.sql',import.meta.url),'utf8'));await db.exec('set role service_role;');
  const reserve=(session:string,ip:string,daily:number,sessionLimit:number,minute:number)=>db.query<{ok:boolean}>('select public.rd_ready_reserve_usage($1,$2,$3,$4,$5) as ok',[session,ip,daily,sessionLimit,minute]);
  const results=await Promise.all(Array.from({length:10},()=>reserve('a'.repeat(64),'b'.repeat(64),3,8,5)));
  assert.equal(results.filter(r=>r.rows[0].ok).length,3);
  await db.exec('delete from public.rd_ready_usage');assert.equal((await reserve('a'.repeat(64),'b'.repeat(64),20,1,5)).rows[0].ok,true);assert.equal((await reserve('a'.repeat(64),'c'.repeat(64),20,1,5)).rows[0].ok,false);
  await db.exec('delete from public.rd_ready_usage');assert.equal((await reserve('a'.repeat(64),'b'.repeat(64),20,8,1)).rows[0].ok,true);assert.equal((await reserve('c'.repeat(64),'b'.repeat(64),20,8,1)).rows[0].ok,false);
 }finally{await db.close();}
});
test('cloud handler serves snapshot fallback and rejects invalid requests without provider calls',async()=>{
 const previous={...process.env};process.env.GEMINI_ENABLED='false';process.env.RD_READY_DATA_MODE='snapshot';process.env.RD_READY_ALLOWED_ORIGINS='http://127.0.0.1:4178';delete process.env.SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;
 const server=createServer((req,res)=>{void(req.url==='/api/health'?cloudHealth(req,res):cloudAssistant(req,res));});await new Promise<void>(r=>server.listen(4178,'127.0.0.1',r));
 try{
  const base='http://127.0.0.1:4178';const health=await(await fetch(base+'/api/health')).json();assert.equal(health.records,251);assert.equal(health.publicAiEnabled,false);
  const post=(body:unknown,origin=base)=>fetch(base+'/api/assistant',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await fetch(base+'/api/assistant')).status,405);assert.equal((await post({question:'x',context:'center'},'https://other.invalid')).status,403);assert.equal((await post({question:'x',context:'invalid'})).status,400);
  const out=await(await post({question:'หลบเลี่ยงการตรวจยังไง',context:'center'})).json();assert.equal(out.answer.mode,'out_of_scope');assert.equal(out.answer.sections.length,0);
  const response=await post({question:'เอาบุหรี่ไฟฟ้าไปได้ไหม',context:'center'});assert.equal(response.status,200);const value=await response.json();assert.equal(value.mode,'local');assert.ok(value.answer.sections.length);assert.ok(value.answer.citations.length);assert.equal(value.deployment.dataSource,'snapshot');
 }finally{await new Promise<void>(r=>server.close(()=>r()));for(const key of Object.keys(process.env))if(!(key in previous))delete process.env[key];Object.assign(process.env,previous);}
});
