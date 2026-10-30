import type {IncomingMessage,ServerResponse} from 'node:http';
import {requestSchema} from './request.js';
import {loadCloudData} from './cloud-data.js';
import {answerResearch} from './research-answer.js';
import {localIntents,providerFailure} from './provider-status.js';
import {reserveCloudUsage,sessionIdentity,sharedBudgetConfigured} from './cloud-budget.js';
export async function cloudHealth(_req:IncomingMessage,res:ServerResponse){
 const json=(code:number,value:unknown)=>{res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value));};
 try{const data=await loadCloudData();const enabled=process.env.GEMINI_ENABLED==='true'&&!!process.env.GEMINI_API_KEY&&sharedBudgetConfigured(process.env);json(200,{ok:true,assistantMode:enabled?'gemini_configured':'local',researchMode:true,publicAiEnabled:enabled,dataSource:data.source,dataVersion:data.version.slice(0,16),records:data.records.length});}catch{json(503,{ok:false,error:'knowledge_unavailable'});}
}
export async function cloudAssistant(req:IncomingMessage&{body?:unknown},res:ServerResponse){
 const json=(code:number,value:unknown)=>{res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(JSON.stringify(value));};
 if(req.method!=='POST'){json(405,{error:'method_not_allowed'});return;}
 const host=req.headers.host??'';const origin=req.headers.origin;
 const allowed=new Set((process.env.RD_READY_ALLOWED_ORIGINS??'').split(',').filter(Boolean));
 if(typeof origin!=='string'||(!allowed.has(origin)&&origin!==`https://${host}`)){json(403,{error:'invalid_origin'});return;}
 if(!req.headers['content-type']?.startsWith('application/json')){json(415,{error:'json_required'});return;}
 try{
  let body=req.body;
  if(body===undefined){let raw='',bytes=0;for await(const chunk of req){bytes+=Buffer.byteLength(chunk);if(bytes>8192){json(413,{error:'request_too_large'});return;}raw+=chunk;}body=JSON.parse(raw);}
  else if(typeof body==='string')body=JSON.parse(body);
  if(Buffer.byteLength(JSON.stringify(body))>8192){json(413,{error:'request_too_large'});return;}
  const parsed=requestSchema.safeParse(body);if(!parsed.success){json(400,{error:'invalid_request'});return;}
  if(/(?:วิธี(?:ทำ|สร้าง|ใช้)ระเบิด|ทำร้ายคน|หลบเลี่ยงการตรวจ|สูตรอาหาร|พยากรณ์อากาศ|ราคาหุ้น)/u.test(parsed.data.question)){
   json(200,{mode:'local',reason:'out_of_scope',intents:['unknown'],routes:[],clarification:null,answer:{mode:'out_of_scope',reason:'out_of_scope',intro:'ระบบช่วยค้นคู่มือเตรียมตัว รด. และข้อควรรู้จากแหล่งข้อมูล ไม่แนะนำการทำร้ายหรือหลบเลี่ยงการตรวจ',sections:[],citations:[]},research:{enabled:true,status:'draft',generated:false,retrievedCount:0,usedCount:0,videos:[],images:[]}});return;
  }
  const data=await loadCloudData();
  const configured=sharedBudgetConfigured(process.env);
  const secret=process.env.RD_READY_SESSION_SECRET;
  const identity=secret&&configured?sessionIdentity(req.headers.cookie??'',String(req.headers['x-forwarded-for']??'unknown').split(',')[0].trim(),secret):null;
  if(identity)res.setHeader('Set-Cookie',identity.cookie);
  const env={...process.env,GEMINI_ENABLED:configured?process.env.GEMINI_ENABLED:'false'};
  const routes=[...new Map(data.records.filter(r=>r.id.startsWith('guide-')||r.id==='packing-field'||r.id==='packing-center'||r.id.startsWith('life-')).map(r=>[r.topicId,{id:r.topicId,title:r.title.split(' · ')[0],context:r.context,kind:(r.kind==='guide'?'guides':r.kind==='packing'?'packing':'life') as 'guides'|'packing'|'life',reviewOnly:true as const}])).values()];
  const result=await answerResearch(parsed.data,{env,records:data.records,routes,intents:localIntents(parsed.data.question),failure:providerFailure,reserve:identity?()=>reserveCloudUsage(process.env,identity):async()=>false});
  if(!configured&&result.mode==='local'&&!['missing_context','no_research_match'].includes(result.reason))result.reason='cloud_ai_pending';
  json(200,{...result,deployment:{dataSource:data.source,dataVersion:data.version.slice(0,16)}});
 }catch(error){json(error instanceof SyntaxError?400:503,{error:error instanceof SyntaxError?'invalid_json':'temporarily_unavailable'});}
}
