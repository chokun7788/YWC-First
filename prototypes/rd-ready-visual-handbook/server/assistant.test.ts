import {test} from 'node:test';
import assert from 'node:assert/strict';
import {answerQuestion,catalogue,geminiSelection,intentSchema,requestSchema,selectedRoutes,providerFailure} from './assistant';
import {fallbackNotice} from '../src/assistant-status';
import {retrieveKnowledge} from './knowledge';
import {regularContext,makeBlock,makeSource,universal} from '../../../tests/fixtures/content';
import {rankSearch} from '../src/search';
import {fixture} from '../../../tests/fixtures/content';
const enabled={GEMINI_ENABLED:'true',GEMINI_API_KEY:'TEST_ONLY_NOT_A_KEY',GEMINI_MODEL:'gemini-3.5-flash-lite'};
const selection={intents:['dressing'] as const,candidateIds:['guide-lacing'],terms:[],needsClarification:false};
test('Gemini receives approved text and sources; evidence IDs resolve a paraphrase into a cited answer',async()=>{
 const data=fixture();const input={question:'ขอรายละเอียดอุปกรณ์ทดสอบนี้',context:'center' as const,...regularContext,studyYear:2 as const};
 const baseline=await answerQuestion(input,{env:{},content:data});assert.equal(baseline.answer.sections.length,0);
 const result=await answerQuestion(input,{env:enabled,content:data,reserve:async()=>true,provider:async(_q,_context,_routes,_env,records)=>{
  assert.deepEqual(records?.map(r=>r.id),['ev-test-regular']);assert.equal(records?.[0].text,data.evidence[0].text);assert.equal(records?.[0].sources[0].locator,'TEST ONLY line 3');
  return {...selection,intents:['packing'],candidateIds:[],evidenceIds:['ev-test-regular']};
 }});
 assert.equal(result.mode,'gemini');assert.ok(result.answer.sections.length);assert.ok(result.answer.citations.length);assert.equal(result.knowledge.selectedCount,1);
});
test('draft, expired and wrong-scope evidence never enter model context',()=>{
 const data=fixture();const source=makeSource('draft-source',universal);source.status='draft';data.sources.push(source);const block=makeBlock('draft-source-block',source.id,universal);data.evidence.push(block);
 const draft=makeBlock('draft-block','src-test-regular');draft.status='draft';data.evidence.push(draft);
 const expiredSource=makeSource('expired-source');expiredSource.validUntil='2020-01-01';data.sources.push(expiredSource);data.evidence.push(makeBlock('expired-block',expiredSource.id));
 const result=retrieveKnowledge(data,'เทสต์อัลฟา',regularContext);assert.deepEqual(result.records.map(r=>r.id),['ev-test-regular']);
});
test('invented evidence ID rejects model output; conflict cannot be hidden by selecting one side',async()=>{
 const data=fixture();const input={question:'เทสต์อัลฟา',context:'center' as const,...regularContext,studyYear:2 as const};
 const invalid=await answerQuestion(input,{env:enabled,content:data,reserve:async()=>true,provider:async()=>({...selection,intents:['packing'],evidenceIds:['draft-or-invented']})});
 assert.equal(invalid.mode,'local');assert.equal(invalid.reason,'provider_unavailable');
 const {addPolicy}=await import('../../../tests/fixtures/content');addPolicy(data,'conflict',{permission:'prohibited'});
 const conflict=await answerQuestion(input,{env:enabled,content:data,reserve:async()=>true,provider:async()=>({...selection,intents:['packing'],evidenceIds:['ev-test-regular']})});
 assert.equal(conflict.answer.reason,'conflict');assert.ok(conflict.answer.sections.flatMap(s=>s.blocks).some(b=>b.id==='ev-test-conflict'));
});
test('provider errors expose only safe reasons and an actionable fallback notice',async()=>{
 for(const [status,reason] of [[402,'provider_payment_required'],[403,'provider_access_denied'],[404,'provider_model_unavailable'],[429,'provider_quota']] as const){
  assert.equal(providerFailure({status,message:'TEST_ONLY_SECRET'}),reason);
  const result=await answerQuestion({question:'เตรียมอะไร',context:'center'},{env:enabled,reserve:async()=>true,provider:async()=>{throw {status,message:'TEST_ONLY_SECRET'};}});
  assert.equal(result.mode,'local');assert.equal(result.reason,reason);assert.ok(fallbackNotice(result.mode,result.reason));assert.ok(!JSON.stringify(result).includes('TEST_ONLY_SECRET'));
 }
 assert.ok(fallbackNotice('local','provider_payment_required')?.includes('402'));
 assert.equal(fallbackNotice('gemini','ok'),null);
});
test('Thai natural phrasing, typo and aliases retrieve without exact keyword',()=>{
 const rows=[{id:'lace',title:'ร้อยเชือกรองเท้า',text:'วิธีการร้อยเชือก',aliases:['คอมแบท']},{id:'tent',title:'เต็นท์นอน',text:'พักในค่าย'}];
 assert.equal(rankSearch(rows,'ช่วยสอนร้อยเชือกรองเท้าหน่อยครับ')[0]?.id,'lace');
 assert.equal(rankSearch(rows,'รองเทา')[0]?.id,'lace');
 assert.equal(rankSearch(rows,'คอมแบท')[0]?.id,'lace');
 assert.equal(rankSearch(rows,'ดาราศาสตร์').length,0);
});
test('request and model schemas reject unknown/free-form facts and oversized questions',()=>{
 assert.equal(requestSchema.safeParse({question:'x'.repeat(1201),context:'center'}).success,false);
 assert.equal(requestSchema.safeParse({question:'อะไร',context:'center',apiKey:'x'}).success,false);
 assert.equal(intentSchema.safeParse({...selection,answer:'allowed'}).success,false);
});
test('disabled, absent key and exhausted budget never call provider',async()=>{
 let calls=0;const provider=async()=>{calls++;return {...selection,intents:['dressing'] as ['dressing']};};
 for(const env of [{...enabled,GEMINI_ENABLED:'false'},{GEMINI_ENABLED:'true'},enabled]){
  const result=await answerQuestion({question:'ร้อยเชือกรองเท้า',context:'center'},{env,reserve:async()=>false,provider});
  assert.equal(result.mode,'local');assert.equal(result.answer.sections.length,0);
 }
 assert.equal(calls,0);
});
test('valid model IDs navigate to review documents; draft never emits factual blocks',async()=>{
 const result=await answerQuestion({question:'ร้อยเชือกรองเท้า',context:'center'},{env:enabled,reserve:async()=>true,provider:async()=>({...selection,intents:['dressing']})});
 assert.equal(result.mode,'gemini');assert.equal(result.routes[0]?.id,'guide-lacing');
 assert.ok(result.routes.every(r=>r.reviewOnly));assert.equal(result.answer.sections.length,0);assert.equal(result.answer.citations.length,0);
});
test('hallucinated or out-of-scope IDs and provider failures fall back locally',async()=>{
 for(const id of ['invented-rule','packing-field']){
  const result=await answerQuestion({question:'เตรียมอะไร',context:'center'},{env:enabled,reserve:async()=>true,provider:async()=>({...selection,intents:['packing'],candidateIds:[id]})});
  assert.equal(result.mode,'local');assert.equal(result.reason,'provider_unavailable');assert.ok(result.routes.every(r=>r.context!=='field'));
 }
 for(const error of ['timeout','401','invalid JSON']){
  const result=await answerQuestion({question:'เตรียมอะไร',context:'center'},{env:enabled,reserve:async()=>true,provider:async()=>{throw new Error(error);}});
  assert.equal(result.mode,'local');assert.equal(result.answer.sections.length,0);
 }
 assert.throws(()=>selectedRoutes({...selection,intents:['dressing'],candidateIds:['unknown']},[],'x'));
});
test('multi-intent and ambiguity retained without guessing a training context',async()=>{
 const result=await answerQuestion({question:'อันนี้เอาไปได้ไหม ต้องเตรียมกี่ชุด',context:'unsure'},{env:{}});
 assert.ok(result.intents.includes('packing'));assert.ok(result.intents.includes('permission'));assert.ok(result.clarification);
});
test('original resolver returns scoped verified synthetic evidence and rejects drafts',async()=>{
 const data=fixture();
 const input={question:'เทสต์อัลฟา',context:'center' as const,centerId:'test-center',locationId:'test-regular',studyYear:2 as const,academicYearBE:2569,uniformGroup:'male_uniform' as const};
 const result=await answerQuestion(input,{env:{},content:data});
 assert.ok(result.answer.sections.length>0);assert.ok(result.answer.citations.length>0);
 for(const block of data.evidence)block.status='draft';
 const rejected=await answerQuestion(input,{env:{},content:data});assert.equal(rejected.answer.sections.length,0);
});
test('official SDK sends structured no-store request, bounded timeout/no retries; malformed JSON rejected',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(input,init)=>{
  calls++;const request=input instanceof Request?input:new Request(input,init);const payload=await request.json();
  assert.equal(payload.store,false);assert.equal(payload.model,enabled.GEMINI_MODEL);assert.equal(payload.response_format.mime_type,'application/json');assert.ok(!payload.tools);
  const inputData=JSON.parse(payload.input);assert.ok(Array.isArray(inputData.approvedEvidence));assert.ok(Array.isArray(inputData.reviewNavigation));assert.ok(payload.system_instruction.includes('คุณเป็นผู้ช่วยค้นข้อมูล'));
  return new Response(JSON.stringify({id:'TEST_ONLY',object:'interaction',status:'completed',steps:[{type:'model_output',content:[{type:'text',text:JSON.stringify(selection)}]}]}),{headers:{'content-type':'application/json'}});
 };
 try{const result=await geminiSelection('ร้อยเชือก','center',await catalogue(),enabled);assert.deepEqual(result.candidateIds,['guide-lacing']);assert.equal(calls,1);
 globalThis.fetch=async()=>new Response(JSON.stringify({id:'TEST_ONLY',status:'completed',steps:[{type:'model_output',content:[{type:'text',text:'{broken'}]}]}),{headers:{'content-type':'application/json'}});
 await assert.rejects(()=>geminiSelection('x','center',[],enabled));
 }finally{globalThis.fetch=original;}
});
