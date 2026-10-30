import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {z} from 'zod';
import type {ResearchRecord} from './research-data.js';
import {gatewayConfigured,callGateway} from './cloud-gateway.js';
const ref=z.object({sourceId:z.string(),attribution:z.string(),locator:z.string()});
export const bundleSchema=z.object({schemaVersion:z.literal(1),releaseChannel:z.literal('experimental'),topics:z.array(z.object({id:z.string(),chunkIds:z.array(z.string())})),sources:z.array(z.object({id:z.string(),url:z.url().regex(/^https?:\/\//),reviewStatus:z.string()})),chunks:z.array(z.object({id:z.string(),topicId:z.string(),title:z.string(),text:z.string(),kind:z.enum(['guide','packing','experience','policy']),context:z.enum(['center','field','any']),aliases:z.array(z.string()),citations:z.array(ref).min(1),mediaIds:z.array(z.string()),status:z.literal('draft'),releaseChannel:z.literal('experimental')})),media:z.array(z.object({id:z.string(),url:z.url().regex(/^https?:\/\//),title:z.string(),type:z.string(),rightsStatus:z.string()}))});
export type KnowledgeBundle=z.infer<typeof bundleSchema>;
export function decodeBundle(value:unknown):ResearchRecord[]{
 const bundle=bundleSchema.parse(value);
 const sources=new Map(bundle.sources.map(s=>[s.id,s]));const media=new Map(bundle.media.map(m=>[m.id,m]));const ids=new Set<string>();
 return bundle.chunks.map(c=>{
  if(ids.has(c.id))throw new Error('Duplicate chunk');ids.add(c.id);
  if(c.citations.some(ref=>!sources.has(ref.sourceId))||c.mediaIds.some(id=>!media.has(id)))throw new Error('Broken reference');
  return {id:c.id,topicId:c.topicId,title:c.title,text:c.text,context:c.context,kind:c.kind,aliases:c.aliases,references:c.citations.map(ref=>({url:sources.get(ref.sourceId)!.url,attribution:ref.attribution,locator:ref.locator})),videos:c.mediaIds.map(id=>({url:media.get(id)!.url,title:media.get(id)!.title}))};
 });
}
let cached:Promise<{records:ResearchRecord[];version:string;source:'snapshot'|'supabase'}>|undefined;
export async function loadCloudData(env:NodeJS.ProcessEnv=process.env){
 if(!cached)cached=(async()=>{
  const mode=env.RD_READY_DATA_MODE??'snapshot';let raw:string;
  if(mode==='supabase'){
   if(gatewayConfigured(env)){
    if(!env.RD_READY_DATA_VERSION)throw new Error('Data version missing');
    const response=await callGateway(env,{action:'knowledge',version:env.RD_READY_DATA_VERSION});if(!response.ok)throw new Error('Database unavailable');raw=JSON.stringify(await response.json());
   }else{
   const origin=env.SUPABASE_URL;if(!origin||!env.SUPABASE_SERVICE_ROLE_KEY||!env.RD_READY_DATA_VERSION)throw new Error('Database configuration missing');
   const url=new URL('/rest/v1/rd_ready_releases',origin);url.searchParams.set('version','eq.'+env.RD_READY_DATA_VERSION);url.searchParams.set('select','bundle');url.searchParams.set('limit','1');
   const response=await fetch(url,{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY},signal:AbortSignal.timeout(5000)});
   if(!response.ok)throw new Error('Database unavailable');const rows=await response.json();if(!rows[0]?.bundle)throw new Error('Data version missing');raw=JSON.stringify(rows[0].bundle);
   }
  }else if(mode==='snapshot')raw=await readFile(resolve(process.cwd(),'data/deploy/knowledge-v1.json'),'utf8');else throw new Error('Unsupported data mode');
  return {records:decodeBundle(JSON.parse(raw)),version:env.RD_READY_DATA_VERSION??createHash('sha256').update(raw).digest('hex'),source:mode as 'snapshot'|'supabase'};
 })().catch(error=>{cached=undefined;throw error;});
 return cached;
}
