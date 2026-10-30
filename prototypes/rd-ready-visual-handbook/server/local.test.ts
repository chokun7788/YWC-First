import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
test('real HTTP server validates requests, serves UI, hides secrets and keeps drafts out of answers',async()=>{
 const cwd=fileURLToPath(new URL('../',import.meta.url)),base='http://127.0.0.1:4176';
 const child=spawn(process.execPath,['../../node_modules/tsx/dist/cli.mjs','server/local.ts'],{cwd,env:{...process.env,PORT:'4176',GEMINI_ENABLED:'false',GEMINI_API_KEY:'',RD_READY_RESEARCH_MODE:'false'},stdio:'ignore'});
 try{
  let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,50));}
  assert.ok(ready,'isolated test server started');
  const post=(body:unknown,origin=base)=>fetch(base+'/api/assistant',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
  const health=await(await fetch(base+'/api/health')).json();assert.equal(health.assistantMode,'local');assert.equal(health.publicAiEnabled,false);
  assert.equal((await fetch(base+'/')).status,200);
  assert.equal((await fetch(base+'/.env.local')).status,404);
  assert.equal((await fetch(base+'/server/assistant.ts')).status,404);
  assert.equal((await fetch(base+'/api/assistant')).status,405);
  assert.equal((await post({question:'เตรียมอะไร',context:'center'},'https://other.invalid')).status,403);
  assert.equal((await post({question:'x',context:'other'})).status,400);
  assert.equal((await post({question:'x'.repeat(9000),context:'center'})).status,413);
  const response=await post({question:'ร้อยเชือกรองเท้ายังไง',context:'center'});assert.equal(response.status,200);
  const result=await response.json();assert.equal(result.mode,'local');assert.equal(result.answer.sections.length,0);assert.equal(result.routes[0]?.id,'guide-lacing');
  assert.ok(result.routes.every((r:{context:string})=>r.context!=='field'));
 }finally{child.kill();}
});
