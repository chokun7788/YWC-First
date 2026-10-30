import {z} from 'zod';
import {GoogleGenAI} from '@google/genai';
import {randomUUID} from 'node:crypto';
import {researchCatalogue,retrieveResearch,type ResearchRecord} from './research-data.js';
import {RESEARCH_SYSTEM} from './research-prompt.js';
import type {AskRequest} from './request.js';
import {researchImages} from './research-images.js';
type Candidate={id:string;title:string;kind:'guides'|'packing'|'life';context:'center'|'field'|'any';reviewOnly:true};
export const researchOutputSchema=z.strictObject({intro:z.string().max(1200),sections:z.array(z.strictObject({heading:z.string().min(1).max(180),points:z.array(z.strictObject({text:z.string().min(1).max(1400),recordIds:z.array(z.string().max(100)).min(1).max(5)})).min(1).max(30)})).max(6),clarification:z.string().max(500).nullable()});
export type ResearchOutput=z.infer<typeof researchOutputSchema>;
function servingSchema(value:unknown):unknown{
 // Nested length bounds exceed Gemini's schema-state budget. Keep all bounds
 // enforced by Zod after generation; wire schema retains types/required fields.
 if(Array.isArray(value))return value.map(servingSchema);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([key])=>!['$schema','maxItems','minItems','maxLength','minLength'].includes(key)).map(([key,v])=>[key,servingSchema(v)]));
 return value;
}
export async function generateResearch(question:string,context:string,records:ResearchRecord[],env:NodeJS.ProcessEnv):Promise<ResearchOutput>{
 if(!env.GEMINI_API_KEY||!env.GEMINI_MODEL||!/^gemini-[a-z0-9.-]+$/.test(env.GEMINI_MODEL))throw new Error('provider_config');
 const client=new GoogleGenAI({apiKey:env.GEMINI_API_KEY});
 const response=await client.interactions.create({model:env.GEMINI_MODEL,store:false,system_instruction:RESEARCH_SYSTEM,input:JSON.stringify({question,context,records}),response_format:{type:'text',mime_type:'application/json',schema:servingSchema(z.toJSONSchema(researchOutputSchema)) as Record<string,unknown>},generation_config:{max_output_tokens:3500}},{timeout:20000,maxRetries:0});
 if(!response.output_text||response.output_text.length>45000)throw new Error('invalid_output');
 return researchOutputSchema.parse(JSON.parse(response.output_text));
}
export function validateResearch(output:unknown,records:ResearchRecord[]):ResearchOutput{
 const value=researchOutputSchema.parse(output);
 if(value.sections.flatMap(s=>s.points).length>45)throw new Error('too_many_points');
 if(value.sections.flatMap(s=>s.points).some(point=>point.recordIds.some(id=>!records.some(record=>record.id===id))))throw new Error('invented_research_id');
 if([value.intro,...value.sections.flatMap(s=>[s.heading,...s.points.map(p=>p.text)])].some(t=>/https?:\/\/|javascript:/i.test(t)))throw new Error('model_url_not_allowed');
 return value;
}
export async function answerResearch(input:AskRequest,options:{env:NodeJS.ProcessEnv;reserve?:()=>Promise<boolean>;provider?:typeof generateResearch;routes:Candidate[];intents:string[];failure:(error:unknown)=>string;records?:ResearchRecord[]}){
 const all=options.records??await researchCatalogue();const found=retrieveResearch(all,input.question,input.context);
 let mode='local',reason=options.env.GEMINI_ENABLED==='true'?'no_key':'disabled',generated=false;
 let output:ResearchOutput={intro:found.clarification?'ขอข้อมูลเพิ่มเพื่อแยกรายการให้ตรงการฝึก':found.records.length?'ข้อมูลจากชุดร่างที่รวบรวมไว้สำหรับทดลองใช้งาน':'ยังไม่พบข้อมูลเรื่องนี้ในชุดที่รวบรวมไว้ ลองระบุสิ่งของหรือหัวข้อให้ชัดขึ้น',sections:found.records.slice(0,3).map(r=>({heading:r.title,points:[{text:r.text.slice(0,1350),recordIds:[r.id]}]})),clarification:found.clarification};
 if(found.records.length&&options.env.GEMINI_ENABLED==='true'&&options.env.GEMINI_API_KEY){
  reason='usage_limit';if(options.reserve&&await options.reserve())try{
   output=validateResearch(await(options.provider??generateResearch)(input.question,found.context,found.records,options.env),found.records);mode='gemini';reason='ok';generated=true;
  }catch(error){reason=options.failure(error);}
 }else if(!found.records.length)reason=found.clarification?'missing_context':'no_research_match';
 const citations:{id:string;title:string;url:string;locator:string}[]=[];
 const citationPrefix=`research-${randomUUID()}`;
 const cite=(ids:string[])=>[...new Set(ids.flatMap(id=>{
  const record=found.records.find(r=>r.id===id)!;
  return record.references.map(ref=>{let citation=citations.find(c=>c.url===ref.url&&c.locator===ref.locator);if(!citation){citation={id:`${citationPrefix}-${citations.length+1}`,title:ref.attribution,url:ref.url,locator:ref.locator};citations.push(citation);}return citation.id;});
 }))];
 const used=[...new Set(output.sections.flatMap(s=>s.points.flatMap(p=>p.recordIds)))];
 const records=found.records.filter(r=>used.includes(r.id));
 const sections=output.sections.map((s,i)=>({heading:s.heading,blocks:s.points.map((p,j)=>({id:`research-block-${i}-${j}`,text:p.text,citationIds:cite(p.recordIds)}))}));
 const topicIds=new Set(records.map(r=>r.topicId));
 const routes=options.routes.filter(r=>topicIds.has(r.id)).slice(0,4).map(({id,title,kind,context,reviewOnly})=>({id,title,kind,context,reviewOnly}));
 const videos=[...new Map(records.flatMap(r=>r.videos).map(v=>[v.url,v])).values()].slice(0,6);
 const images=researchImages(records);
 return {mode,reason,intents:options.intents,routes,clarification:output.clarification,answer:{mode:'research',reason:sections.length?'ok':'no_evidence',intro:output.intro,sections,citations},research:{enabled:true as const,status:'draft' as const,generated,retrievedCount:found.records.length,usedCount:records.length,videos,images}};
}
