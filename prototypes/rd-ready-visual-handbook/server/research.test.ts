import {test} from 'node:test';
import assert from 'node:assert/strict';
import {answerQuestion} from './assistant';
import {researchCatalogue,retrieveResearch} from './research-data';
import {validateResearch,generateResearch} from './research-answer';
import {researchImages} from './research-images';
import {access} from 'node:fs/promises';
const env={GEMINI_ENABLED:'true',GEMINI_API_KEY:'TEST_ONLY_NOT_A_KEY',GEMINI_MODEL:'gemini-3.5-flash-lite',RD_READY_RESEARCH_MODE:'true'};

test('AI answers attach existing topic images with source captions, never unrelated or duplicate images',async()=>{
 for(const [question,id,count] of [['แต่งชุดเต็มยศยังไง','guide-full',2],['ทรงผมต้องตัดยังไง','faq-answer-hair',1]] as const){
  const result=await answerQuestion({question,context:'center'},{env,reserve:async()=>true,researchProvider:async(_q,_context,records)=>{
   const record=records.find(r=>r.id===id)!;assert.ok(record);return {intro:'ข้อมูลทดลอง',sections:[{heading:record.title,points:[{text:record.text.slice(0,200),recordIds:[id]}]}],clarification:null};
  }});
  assert.equal(result.mode,'gemini');assert.ok('research' in result);if(!('research' in result))return;
  assert.equal(result.research.images.length,count);
  for(const image of result.research.images){assert.ok(image.caption);assert.ok(image.sourceUrl.startsWith('https://'));await access(new URL('../public'+image.src,import.meta.url));}
 }
 assert.equal(researchImages([{id:'guide-full',topicId:'guide-full'},{id:'guide-hat',topicId:'guide-hat'}]).length,2);
 assert.deepEqual(researchImages([{id:'policy-vape-public',topicId:'policy-vape-public'}]),[]);
});

test('unrelated Thai words do not match records through a single consonant prefix',async()=>{
 const all=await researchCatalogue();assert.equal(retrieveResearch(all,'ควอนตัมกีตาร์','center').records.length,0);
 let reserved=false;const result=await answerQuestion({question:'ควอนตัมกีตาร์',context:'center'},{env,reserve:async()=>{reserved=true;return true;}});
 assert.equal(result.mode,'local');assert.equal(result.reason,'no_research_match');assert.equal(reserved,false);
});
test('draft catalogue contains sourced guide steps, experience attribution and full historical packing list',async()=>{
 const records=await researchCatalogue();assert.ok(records.length>40);assert.ok(records.every(r=>r.references.length&&r.references.every(ref=>/^https?:\/\//.test(ref.url))));
 const field=records.find(r=>r.id==='packing-field')!;assert.ok(field.text.includes('2566'));assert.equal(field.text.split('\n').filter(s=>s.startsWith('• ')).length,17);
 assert.ok(records.find(r=>r.id==='guide-knot')?.videos.some(v=>v.url.includes('t=')));
});
test('retrieval scopes center/field and asks for missing packing destination',async()=>{
 const all=await researchCatalogue();const center=retrieveResearch(all,'เตรียมอะไรไปศูนย์ฝึก','center');assert.equal(center.records[0]?.id,'packing-center');assert.ok(center.records.every(r=>r.context!=='field'));
 const field=retrieveResearch(all,'ไปเขาชนไก่ควรเตรียมอะไร','unsure');assert.equal(field.records[0]?.id,'packing-field');assert.ok(field.records.every(r=>r.context!=='center'));
 assert.ok(retrieveResearch(all,'ต้องเตรียมอะไร','unsure').clarification);
 assert.ok(retrieveResearch(all,'ไปเขาชนไก่เตรียมอะไร','center').clarification);
});
test('experimental generation receives draft text and creates cited answer/image without altering approval',async()=>{
 const result=await answerQuestion({question:'ไปเขาชนไก่เตรียมอะไร',context:'field'},{env,reserve:async()=>true,researchProvider:async(_q,_context,records)=>{
  const record=records.find(r=>r.id==='packing-field')!;assert.ok(record.text.includes('ชุดฝึก'));return {intro:'อ้างอิงภาพปี2566',sections:[{heading:'รายการจากภาพ',points:[{text:'ภาพปี2566ระบุชุดฝึกอย่างน้อย2ชุด',recordIds:[record.id]}]}],clarification:null};
 }});
 assert.equal(result.mode,'gemini');assert.equal(result.answer.mode,'research');assert.ok(result.answer.sections.length);assert.ok(result.answer.citations.length);assert.equal(result.knowledge.verifiedTotal,0);
 if('research' in result){assert.equal(result.research.status,'draft');assert.equal(result.research.images[0]?.src,'/assets/packing-poster-2566.png');assert.equal(result.research.generated,true);}else assert.fail('research metadata missing');
});
test('invented IDs/URLs reject model output; API failure falls back to cited draft text',async()=>{
 const records=retrieveResearch(await researchCatalogue(),'ร้อยเชือกรองเท้า','center').records;
 assert.throws(()=>validateResearch({intro:'x',sections:[{heading:'x',points:[{text:'x',recordIds:['invented']}]}],clarification:null},records));
 assert.throws(()=>validateResearch({intro:'https://invented.invalid',sections:[],clarification:null},records));
 const result=await answerQuestion({question:'ร้อยเชือกรองเท้า',context:'center'},{env,reserve:async()=>true,researchProvider:async()=>{throw new Error('TEST_ONLY_SECRET');}});
 assert.equal(result.mode,'local');assert.ok(result.answer.sections.length);assert.ok(result.answer.citations.length);assert.ok(!JSON.stringify(result).includes('TEST_ONLY_SECRET'));
});
test('ambiguous or no-match question never spends a provider call; strict mode still blocks drafts',async()=>{
 let calls=0;const provider=async()=>{calls++;return {intro:'x',sections:[],clarification:null};};
 for(const question of ['เตรียมอะไร','xylophonicgalaxy991']){const r=await answerQuestion({question,context:'unsure'},{env,reserve:async()=>true,researchProvider:provider});assert.equal(r.answer.sections.length,0);}
 assert.equal(calls,0);
 const strict=await answerQuestion({question:'ผูกเชือกรองเท้า',context:'center'},{env:{GEMINI_ENABLED:'false',RD_READY_RESEARCH_MODE:'false'}});assert.equal(strict.answer.sections.length,0);assert.ok(!('research' in strict));
});
test('experimental official SDK request is grounded and no-store, output parsed',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async(input,init)=>{
  const req=input instanceof Request?input:new Request(input,init);const payload=await req.json();const data=JSON.parse(payload.input);assert.ok(data.records[0].text);assert.equal(payload.store,false);assert.ok(payload.system_instruction.includes('โหมดทดลอง'));assert.ok(!payload.tools);assert.ok(!JSON.stringify(payload.response_format.schema).includes('maxItems'));
  return new Response(JSON.stringify({id:'TEST_ONLY',steps:[{type:'model_output',content:[{type:'text',text:JSON.stringify({intro:'ข้อมูลทดลอง',sections:[{heading:'วิธี',points:[{text:'ข้อความทดสอบ',recordIds:[data.records[0].id]}]}],clarification:null})}]}]}),{headers:{'content-type':'application/json'}});
 };
 try{const records=retrieveResearch(await researchCatalogue(),'ผูกเชือกรองเท้า','center').records;const output=await generateResearch('ผูกเชือกรองเท้า','center',records,env);assert.ok(validateResearch(output,records).sections.length);}finally{globalThis.fetch=original;}
});
