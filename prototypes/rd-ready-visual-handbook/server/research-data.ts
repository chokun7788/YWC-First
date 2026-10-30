import {readFile} from 'node:fs/promises';
import {rankSearch} from '../src/search.js';
import {dailyChecklistRows} from '../src/packing-structure.js';
export type Reference={url:string;attribution:string;locator:string};
export type ResearchRecord={id:string;topicId:string;title:string;text:string;context:'center'|'field'|'any';kind:'guide'|'packing'|'experience'|'policy';aliases?:string[];references:Reference[];videos:{url:string;title:string}[]};
const root=new URL('../src/data/',import.meta.url);
const isUrl=(url:string)=>{try{return ['http:','https:'].includes(new URL(url).protocol);}catch{return false;}};
export function cleanRefs(values:unknown[]):Reference[]{
 const refs=values.flat().flatMap((v:any)=>v&&typeof v.url==='string'&&isUrl(v.url)?[{url:v.url,attribution:String(v.attribution??v.title??'แหล่งประกอบในชุดข้อมูล'),locator:String(v.locator??'เอกสารประกอบในชุดข้อมูลร่าง')}]:[]);
 return [...new Map(refs.map(r=>[r.url+'#'+r.locator,r])).values()];
}
export async function researchCatalogue():Promise<ResearchRecord[]>{
 const json=async(name:string)=>JSON.parse(await readFile(new URL(name+'.json',root),'utf8'));
 const [guides,life,review,poster,policies,supplement]=await Promise.all(['guides','camp-life','review-content','poster','research-policies','research-supplement'].map(json));
 const records:ResearchRecord[]=[];
 for(const guide of guides){
  const refs=cleanRefs([...guide.steps.flatMap((s:any)=>s.references??[]),...(guide.sourceRefs??[]),...guide.steps.flatMap((s:any)=>(s.videos??[]).map((v:any)=>({url:v.url,attribution:'คลิปสาธิต: '+v.title,locator:v.note??'คลิปประกอบตามลิงก์ในชุดข้อมูล'})))]);
  const videos=guide.steps.flatMap((s:any)=>s.videos??[]).filter((v:any)=>isUrl(v.url)).map((v:any)=>({url:v.url,title:v.title+' · '+(v.note??'คลิปประกอบ')}));
  if(refs.length)records.push({id:guide.id,topicId:guide.id,title:guide.title,text:[guide.summary,...guide.steps.map((s:any)=>`${s.order}. ${s.text}`),'ข้อจำกัด: เป็นสื่อสาธิต ไม่ยืนยันเครื่องหมายหรือข้อกำหนดของทุกหน่วย; วิดีโอบางช่วงตรวจจากภาพและเวลาโดยประมาณ ไม่ได้ตรวจเสียงเต็มคลิป'].join('\n'),context:'any',kind:'guide',references:refs,videos});
 }
 for(const card of life){
  // Keep each attributed entry separate so a comment cannot inherit official authority.
  for(const [i,block] of card.blocks.entries())for(const [j,entry] of block.entries.entries()){
   const refs=cleanRefs(entry.references??[]);if(!refs.length)continue;
   records.push({id:`${card.id}-${i}-${j}`,topicId:card.id,title:card.title+' · '+block.title,text:[entry.text,'ข้อจำกัดของหัวข้อนี้:',...(card.limits??[])].join('\n'),context:'field',kind:'experience',references:refs,videos:(card.videos??[]).filter((v:any)=>isUrl(v.url)).map((v:any)=>({url:v.url,title:v.title+' · '+(v.note??'')}))});
  }
 }
 records.push({id:'packing-center',topicId:'packing-center',title:'ไปศูนย์ฝึกวิภาวดีวันฝึกปกติ ต้องเตรียมอะไร จัดกระเป๋า เอกสาร เครื่องแต่งกาย',text:'แยกเครื่องแต่งกายที่สวมไป เอกสาร ของใช้แนะนำ ของตามความจำเป็น และของที่ต้องตรวจสิทธินำเข้า/ช่วงใช้ ไม่มีรายการบังคับปัจจุบันของศูนย์ที่ยืนยันครบในชุดข้อมูลนี้; ไม่นับหัวข้อรวมชุดฝึกซ้ำกับชิ้นส่วน\n'+dailyChecklistRows(review.daily).map((r:any)=>'• '+r.text).join('\n'),context:'center',kind:'packing',references:cleanRefs(review.daily.flatMap((r:any)=>r.references??[])),videos:[]});
 records.push({id:'packing-field',topicId:'packing-field',title:'ไปเขาชนไก่ภาคสนาม เตรียมของอะไร จัดกระเป๋า รายการอุปกรณ์ จำนวน',text:'ภาพรายการสิ่งของภาคสนาม ปีการศึกษา พ.ศ.2566 เป็นข้อมูลย้อนหลัง ไม่ใช่ประกาศปีปัจจุบัน และไม่ระบุผลัดหรือชั้นปีครบ\n'+poster.map((r:any)=>'• '+r.text).join('\n'),context:'field',kind:'packing',references:[{url:'https://www.facebook.com/photo/?fbid=668885802086250&set=a.246542974320537',attribution:'ศูนย์ประชาสัมพันธ์ ศศท. — ภาพที่ผู้ใช้ให้มา ปีการศึกษา2566',locator:'ภาพรายการสิ่งอุปกรณ์ที่ต้องเตรียมไปภาคสนาม พ.ศ.2566'}],videos:[]});
 records.push(...policies.records,...supplement.records);
 return records.filter(r=>r.references.length);
}
export function normalizeQuestion(question:string){
 return question.normalize('NFKC').toLowerCase()
  .replace(/\b(?:vapes?|pods?|e-cig(?:arette)?s?)\b|พ็อด|พอด|พอต|บุหรี่ไฟฟา|บุหรีไฟฟ้า/gu,'บุหรี่ไฟฟ้า')
  .replace(/\bpower\s?banks?\b|พาวเวอร์แบงค์|เพาเวอร์แบงค์|เพาวเวอร์แบงค์|เพาเวอร์แบงก์|แบตสำรอง/gu,'พาวเวอร์แบงก์')
  .replace(/\b(?:phones?|mobiles?)\b|มือถือ|โทสับ|โทรสับ/gu,'โทรศัพท์')
  .replace(/คอมแบต|คอมแบ็ท/gu,'คอมแบท')
  .replace(/เหล้า|เบียร์/gu,'เครื่องดื่มแอลกอฮอล์')
  .replace(/แต่งตัว/gu,'แต่งชุด')
  .replace(/ทิชชูเปียก|ทิชชู่เปียก|ทิชชู่เปียค/gu,'ทิชชู่เปียก')
  .replace(/กันเเดด/gu,'กันแดด');
}
export function retrieveResearch(records:ResearchRecord[],question:string,context:'center'|'field'|'unsure'){
 question=normalizeQuestion(question);
 if(/^(?:แล้ว)?(?:อันนั้น|อันนี้|ชิ้นนี้|ของชิ้นนี้|มัน)(?:ล่ะ|ละ|เอา|ได้|ต้อง|ทำ|ใช้|เป็น|ไป)|^เอาไปได้(?:ไหม|มั้ย|ป่ะ)/u.test(question.replace(/\s+/g,'')))return {records:[],clarification:'หมายถึงสิ่งของหรือเรื่องไหนครับ? พิมพ์ชื่อเพิ่ม เช่น บุหรี่ไฟฟ้า โทรศัพท์ หรือรองเท้า',context};
 // An explicitly named training destination in the question may supply scope when none is selected.
 const named=/เขาชนไก่|ภาคสนาม/.test(question)?'field':/ศูนย์ฝึก|วิภาวดี|ฝึกปกติ/.test(question)?'center':null;
 if(context!=='unsure'&&named&&named!==context)return {records:[],clarification:'คำถามกล่าวถึงคนละสถานที่กับบริบทที่เลือกอยู่ กรุณาเปลี่ยนบริบทด้านบนให้ตรงก่อน เพื่อไม่ปนรายการศูนย์ฝึกกับภาคสนาม',context};
 const inferred=context==='unsure'?(named??'unsure'):context;
 const scoped=records.filter(r=>inferred==='unsure'||r.context==='any'||r.context===inferred);
 const ambiguous=inferred==='unsure'&&/เตรียม|จัดกระเป๋า|เอาอะไร/.test(question);
 if(ambiguous)return {records:[],clarification:'ต้องการเตรียมไปศูนย์ฝึกวันปกติ หรือเข้าภาคสนามที่เขาชนไก่ครับ?',context:inferred};
 const aliasScore=(r:ResearchRecord)=>Math.max(0,...(r.aliases??[]).map(alias=>{const normalized=normalizeQuestion(alias).replace(/\s/g,'');return normalized.length>=3&&question.replace(/\s/g,'').includes(normalized)?normalized.length:0;}));
 const mentioned=scoped.filter(r=>aliasScore(r)>0).sort((a,b)=>aliasScore(b)-aliasScore(a));
 const objectQuery=question.replace(/^(?:ขอถามว่า|อยากรู้ว่า)?(?:เอา|พก|นำ)/u,'').replace(/(?:เอาไป|ไป|เข้า)?ได้(?:ไหม|มั้ย|มั๊ย|ป่ะ|ปะ|หรือเปล่า|รึเปล่า).*$/u,'').trim();
 const specific=/พัดลม/.test(question)?'พัดลม':/ทิชชู่เปียก/.test(question)?'ทิชชู่เปียก':null;
 const focused=specific?rankSearch(scoped,specific):[];
 const ordered=focused.length?[...focused,...mentioned]:[...mentioned,...rankSearch(scoped,objectQuery||question),...rankSearch(scoped,question)];
 const priority=/บุหรี่ไฟฟ้า/.test(question)?'policy-vape-public':/ร้อย/.test(question)?'guide-lacing':/ผูก.*เชือก|ผูก.*รองเท้า|ผูกโบว์/.test(question)?'guide-knot':/พับแขน/.test(question)?'guide-sleeves':/ใส่.*รองเท้า|คอมแบท/.test(question)?'guide-boots':/แต่ง.*(?:ชุด|เต็ม)|เต็มยศ/.test(question)?'guide-full':/เตรียม|จัดกระเป๋า|เอาอะไร/.test(question)&&inferred!=='unsure'&&!mentioned.length?`packing-${inferred}`:null;
 if(priority){const row=scoped.find(r=>r.id===priority);if(row)ordered.unshift(row);}
 const unique=[...new Map(ordered.map(r=>[r.id,r])).values()];
 // Diversify across topics, then add additional entries in the top topics.
 const topics=new Set<string>(),first:ResearchRecord[]=[],rest:ResearchRecord[]=[];
 for(const row of unique){if(!topics.has(row.topicId)){first.push(row);topics.add(row.topicId);}else rest.push(row);}
 const picked:ResearchRecord[]=[];let chars=0;
 for(const row of [...first,...rest]){const len=JSON.stringify(row).length;if(picked.length>=10)break;if(chars+len>26000)continue;picked.push(row);chars+=len;}
 return {records:picked,clarification:null,context:inferred};
}
