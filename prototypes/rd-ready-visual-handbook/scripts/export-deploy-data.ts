import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {researchCatalogue} from '../server/research-data';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
const records=await researchCatalogue();
const ids=new Set<string>();const sources=new Map<string,{id:string;url:string;reviewStatus:string}>();
const media=new Map<string,{id:string;url:string;title:string;type:string;rightsStatus:string}>();
const chunks=records.map(record=>{
 if(ids.has(record.id))throw new Error('Duplicate chunk ID: '+record.id);ids.add(record.id);
 const citations=record.references.map(ref=>{
  const url=new URL(ref.url);if(!['http:','https:'].includes(url.protocol))throw new Error('Invalid source protocol');
  const id='source-'+hash(ref.url).slice(0,16);sources.set(id,{id,url:ref.url,reviewStatus:'draft'});
  return {sourceId:id,attribution:ref.attribution,locator:ref.locator};
 });
 if(!citations.length)throw new Error('Chunk has no citation');
 const mediaIds=record.videos.map(video=>{const id='media-'+hash(video.url).slice(0,16);media.set(id,{id,url:video.url,title:video.title,type:'video_link',rightsStatus:'link_only_not_republication_approved'});return id;});
 return {id:record.id,topicId:record.topicId,title:record.title,text:record.text,kind:record.kind,context:record.context,aliases:record.aliases??[],citations,mediaIds,status:'draft',releaseChannel:'experimental',academicYearBE:record.id==='packing-field'?2566:null,studyYears:null,uniformGroups:null,requiresScopeReview:true};
});
const topicIds=[...new Set(chunks.map(c=>c.topicId))];
const bundle={schemaVersion:1,releaseChannel:'experimental',topics:topicIds.map(id=>({id,chunkIds:chunks.filter(c=>c.topicId===id).map(c=>c.id)})),sources:[...sources.values()],chunks,media:[...media.values()]};
const serialized=JSON.stringify(bundle,null,2)+'\n';
const target=new URL('../data/deploy/',import.meta.url);await mkdir(target,{recursive:true});
await writeFile(new URL('knowledge-v1.json',target),serialized);
const manifest={schemaVersion:1,file:'knowledge-v1.json',sha256:hash(serialized),bytes:Buffer.byteLength(serialized),counts:{topics:bundle.topics.length,sources:bundle.sources.length,chunks:chunks.length,media:bundle.media.length},status:'experimental_data_preparation_not_public_deployment',allChunksCited:true,allChunksStillDraft:true,remaining:['Human source/scope/current-applicability review','Media rights check','Database migration and backend adapter','Public distributed usage limiter and deployment smoke tests']};
await writeFile(new URL('manifest.json',target),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest));
