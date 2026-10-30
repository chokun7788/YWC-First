import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createGatewayHandler} from '../supabase/functions/rd-ready-gateway/gateway';
test('gateway authenticates scoped key, bounds quotas and exposes no arbitrary database action',async()=>{
 const key='TEST_ONLY_KEY_'.repeat(4),serviceKey='TEST_ONLY_SERVICE_KEY';let calls=0;
 const handler=createGatewayHandler({keyHash:createHash('sha256').update(key).digest('hex'),supabaseUrl:'https://test.invalid',serviceKey,fetchImpl:async(input,options)=>{
  calls++;assert.equal(new URL(String(input)).pathname,'/rest/v1/rpc/rd_ready_reserve_usage');const body=JSON.parse(String(options?.body));assert.equal(body.p_daily_limit,20);assert.equal(body.p_session_limit,8);assert.equal(body.p_minute_limit,5);return new Response('true');
 }});
 const request=(body:unknown,secret=key)=>new Request('https://test.invalid',{method:'POST',headers:{'x-rd-ready-key':secret},body:JSON.stringify(body)});
 assert.equal((await handler(request({},'WRONG_KEY_'.repeat(5)))).status,401);
 assert.equal((await handler(request({action:'sql',query:'select secret'}))).status,400);
 assert.equal((await handler(request({action:'knowledge',version:'bad'}))).status,400);
 assert.equal((await handler(request({padding:'x'.repeat(5000)}))).status,413);
 const response=await handler(request({action:'reserve',sessionHash:'a'.repeat(64),ipHash:'b'.repeat(64),dailyLimit:99999}));assert.equal(await response.text(),'true');assert.equal(calls,1);
});
test('gateway only serves pinned release and hides upstream errors',async()=>{
 const key='TEST_ONLY_KEY_'.repeat(4);const base={keyHash:createHash('sha256').update(key).digest('hex'),supabaseUrl:'https://test.invalid',serviceKey:'TEST_ONLY_SERVICE_KEY'};
 const request=()=>new Request('https://test.invalid',{method:'POST',headers:{'x-rd-ready-key':key},body:JSON.stringify({action:'knowledge',version:'a'.repeat(64)})});
 const handler=createGatewayHandler({...base,fetchImpl:async(input)=>{const url=new URL(String(input));assert.equal(url.searchParams.get('version'),'eq.'+'a'.repeat(64));return new Response(JSON.stringify([{bundle:{schemaVersion:1}}]));}});
 assert.deepEqual(await(await handler(request())).json(),{schemaVersion:1});
 const failed=createGatewayHandler({...base,fetchImpl:async()=>new Response('TEST_ONLY_SERVICE_KEY',{status:500})});assert.ok(!(await(await failed(request())).text()).includes(base.serviceKey));
});
