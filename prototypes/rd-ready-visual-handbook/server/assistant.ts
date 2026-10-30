import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {GoogleGenAI} from '@google/genai';
import {rankSearch} from '../src/search';
import {loadContent} from '../../../src/lib/content/load';
import {ruleAnswer} from '../../../src/lib/chat/rule-answer';
import {emptyContext} from '../../../src/lib/schemas/context';
import {retrieveKnowledge,type KnowledgeRecord} from './knowledge';
import {ASSISTANT_SYSTEM} from './assistant-prompt';
import {answerResearch,type generateResearch} from './research-answer';

export const requestSchema=z.strictObject({question:z.string().trim().min(1).max(1200),context:z.enum(['center','field','unsure']),centerId:z.string().regex(/^[a-zA-Z0-9._-]+$/).max(100).nullable().optional(),locationId:z.string().regex(/^[a-zA-Z0-9._-]+$/).max(100).nullable().optional(),studyYear:z.union([z.literal(1),z.literal(2),z.literal(3)]).nullable().optional(),academicYearBE:z.number().int().min(2400).max(3000).nullable().optional(),uniformGroup:z.enum(['male_uniform','female_uniform','unspecified']).optional()});
export type AskRequest=z.infer<typeof requestSchema>;
export const intentSchema=z.strictObject({intents:z.array(z.enum(['dressing','packing','permission','camp_life','unknown'])).min(1).max(4),candidateIds:z.array(z.string().max(100)).max(5),evidenceIds:z.array(z.string().max(100)).max(8).optional(),terms:z.array(z.string().max(40)).max(8),needsClarification:z.boolean()});
export type Selection=z.infer<typeof intentSchema>;
export type Route={id:string;title:string;kind:'guides'|'packing'|'life';context:'center'|'field'|'any';reviewOnly:true};
export type Candidate=Route&{text:string;aliases:string[]};
const project=new URL('../',import.meta.url);
const repository=fileURLToPath(new URL('../../../',import.meta.url));
export async function catalogue():Promise<Candidate[]>{
  const json=async(p:string)=>JSON.parse(await readFile(new URL(p,project),'utf8'));
  const [guides,life,names]=await Promise.all([json('src/data/guides.json'),json('src/data/camp-life.json'),json('src/data/item-names.json')]);
  return [
    ...guides.map((g:{id:string;title:string;summary:string})=>({id:g.id,title:g.title,text:g.summary,aliases:[],kind:'guides',context:'any',reviewOnly:true})),
    ...life.map((g:{id:string;title:string})=>({id:g.id,title:g.title,text:g.title,aliases:[],kind:'life',context:'field',reviewOnly:true})),
    {id:'packing-center',title:'รายการเตรียมไปศูนย์ฝึก',text:'วันฝึกปกติ เตรียมของ จัดกระเป๋า',aliases:['ไปศูนย์ฝึกเตรียมอะไร'],kind:'packing',context:'center',reviewOnly:true},
    {id:'packing-field',title:'รายการภาคสนามจากภาพปี 2566',text:'เตรียมของ เขาชนไก่ จัดกระเป๋า',aliases:names.flatMap((v:{aliases:string[]})=>v.aliases).slice(0,100),kind:'packing',context:'field',reviewOnly:true},
  ] as Candidate[];
}
export function localSelection(question:string):Selection{
  const intents:Selection['intents']=[];
  if(/ร้อย|ผูก|พับแขน|แต่งตัว|สวม|เครื่องแบบ/.test(question))intents.push('dressing');
  if(/เตรียม|กี่|จัดกระเป๋า|เอาอะไร/.test(question))intents.push('packing');
  if(/เอา.*ได้|ห้าม|อนุญาต|บุหรี่|พัดลม|พาวเวอร์/.test(question))intents.push('permission');
  if(/ห้องน้ำ|อาบน้ำ|นอน|อาหาร|ฝน|ร้อน|ชีวิต|ป่วย/.test(question))intents.push('camp_life');
  return {intents:intents.length?intents:['unknown'],candidateIds:[],terms:[],needsClarification:/ที่นั่น|อันนี้|ชิ้นนี้/.test(question)};
}
export async function geminiSelection(question:string,context:string,candidates:Candidate[],env:NodeJS.ProcessEnv,approvedEvidence:KnowledgeRecord[]=[]):Promise<Selection>{
  const model=env.GEMINI_MODEL;
  if(!model||!/^gemini-[a-z0-9.-]+$/.test(model)||!env.GEMINI_API_KEY)throw new Error('provider_config');
  const client=new GoogleGenAI({apiKey:env.GEMINI_API_KEY});
  const result=await client.interactions.create({model,store:false,system_instruction:ASSISTANT_SYSTEM,input:JSON.stringify({question,context,approvedEvidence,reviewNavigation:candidates.map(({id,title,kind,context})=>({id,title,kind,context}))}),response_format:{type:'text',mime_type:'application/json',schema:z.toJSONSchema(intentSchema)},generation_config:{max_output_tokens:700}},{timeout:12000,maxRetries:0});
  if(!result.output_text||result.output_text.length>12000)throw new Error('invalid_model_output');
  return intentSchema.parse(JSON.parse(result.output_text));
}
export function selectedRoutes(selection:Selection,candidates:Candidate[],question:string):Route[]{
  if(selection.candidateIds.some(id=>!candidates.some(c=>c.id===id)))throw new Error('invalid_candidate_ids');
  const matches=selection.candidateIds.length?[...new Set(selection.candidateIds)].map(id=>candidates.find(c=>c.id===id)!):rankSearch(candidates,[question,...selection.terms].join(' '));
  return matches.slice(0,4).map(({id,title,kind,context,reviewOnly})=>({id,title,kind,context,reviewOnly}));
}
export function providerFailure(error:unknown):string{
  const status=error&&typeof error==='object'&&'status' in error?Number(error.status):0;
  // Return an allowlisted reason only; raw SDK errors may contain credentials.
  if(status===402)return 'provider_payment_required';
  if(status===401||status===403)return 'provider_access_denied';
  if(status===404)return 'provider_model_unavailable';
  if(status===429)return 'provider_quota';
  return 'provider_unavailable';
}
export async function answerQuestion(input:AskRequest,options:{env?:NodeJS.ProcessEnv;reserve?:()=>Promise<boolean>;provider?:typeof geminiSelection;researchProvider?:typeof generateResearch;content?:Awaited<ReturnType<typeof loadContent>>['content']}={}){
  const env=options.env??process.env;
  const all=await catalogue();
  const candidates=all.filter(c=>input.context==='unsure'||c.context==='any'||c.context===input.context);
  // Explicit owner-authorized local experiment; original strict mode remains intact.
  const content=options.content??(await loadContent(repository)).content;
  const trainingContext={...emptyContext,centerId:input.centerId??null,locationId:input.locationId??null,trainingType:input.context==='field'?'field' as const:input.context==='center'?'regular' as const:null,studyYear:input.studyYear??null,academicYearBE:input.academicYearBE??null,uniformGroup:input.uniformGroup??'unspecified' as const};
  const knowledge=retrieveKnowledge(content,input.question,trainingContext);
  if(env.RD_READY_RESEARCH_MODE==='true'&&!/(?:วิธี(?:ทำ|สร้าง|ใช้)ระเบิด|ทำร้ายคน|หลบเลี่ยงการตรวจ|สูตรอาหาร|พยากรณ์อากาศ|ราคาหุ้น)/u.test(input.question))return {...await answerResearch(input,{env,reserve:options.reserve,provider:options.researchProvider,routes:candidates,intents:localSelection(input.question).intents,failure:providerFailure}),knowledge:{verifiedTotal:knowledge.verifiedTotal,eligibleCount:knowledge.eligibleCount,providedCount:knowledge.records.length,selectedCount:0,reviewDocumentCount:all.length}};
  let selection=localSelection(input.question),mode='local',reason=env.GEMINI_ENABLED==='true'?'no_key':'disabled';
  if(env.GEMINI_ENABLED==='true'&&env.GEMINI_API_KEY){
    reason='usage_limit';
    if(options.reserve&&await options.reserve()){
      try{const proposed=await(options.provider??geminiSelection)(input.question,input.context,candidates,env,knowledge.records);selection=intentSchema.parse(proposed);selectedRoutes(selection,candidates,input.question);if(selection.evidenceIds?.some(id=>!knowledge.records.some(r=>r.id===id)))throw new Error('invalid_evidence_ids');mode='gemini';reason='ok';}catch(error){selection=localSelection(input.question);reason=providerFailure(error);}
    }
  }
  let routes=selectedRoutes(selection,candidates,input.question);
  // Stable lexical tie-breaker for distinct techniques; no permission conclusions.
  const guide=/ร้อย/.test(input.question)?'guide-lacing':/ผูก.*เชือก|ผูก.*รองเท้า/.test(input.question)?'guide-knot':/พับแขน/.test(input.question)?'guide-sleeves':null;
  if(guide){const row=candidates.find(c=>c.id===guide);if(row)routes=[row,...routes.filter(r=>r.id!==guide)].slice(0,4).map(({id,title,kind,context,reviewOnly})=>({id,title,kind,context,reviewOnly}));}
  // Only the existing verified-only resolver can emit factual blocks/citations.
  const request={requestId:randomUUID(),message:input.question,context:trainingContext,consent:{version:'v1' as const,analytics:false,saveQuestionText:false,demographics:null},previousUserMessages:[],confirmedItemIds:[] as string[]};
  let answer=ruleAnswer(content,request);
  const selected=knowledge.records.filter(r=>selection.evidenceIds?.includes(r.id));
  // Model IDs may resolve a paraphrase, but never suppress a conflict or safety decision.
  if(mode==='gemini'&&selected.length&&answer.mode!=='out_of_scope'&&answer.reason!=='conflict'){
    const labels=selected.flatMap(r=>[r.title,...r.keywords,...r.lookupLabels]).join(' ');
    const augmented=[...(input.question+' '+labels)].slice(0,1500).join('');
    const grounded=ruleAnswer(content,{...request,message:augmented,confirmedItemIds:[...new Set(selected.flatMap(r=>r.itemIds))].slice(0,10)});
    if(grounded.sections.length||grounded.mode==='clarification')answer=grounded;
  }
  const clarification=selection.needsClarification?'หมายถึงสิ่งของหรือสถานที่ใด? ระบุเพิ่มได้เพื่อให้ค้นตรงเรื่อง':input.context==='unsure'&&selection.intents.some(i=>i==='packing'||i==='permission')?'ต้องการข้อมูลวันฝึกปกติหรือภาคสนามที่เขาชนไก่?':answer.clarification?.question??null;
  return {mode,reason,intents:selection.intents,routes,clarification,answer,knowledge:{verifiedTotal:knowledge.verifiedTotal,eligibleCount:knowledge.eligibleCount,providedCount:knowledge.records.length,selectedCount:selected.length,reviewDocumentCount:all.length}};
}
