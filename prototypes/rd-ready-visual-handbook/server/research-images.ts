import review from '../src/data/review-content.json' with {type:'json'};
import type {ResearchRecord} from './research-data.js';
export type ResearchImage={src:string;alt:string;caption:string;sourceUrl:string};
type DocumentImage={path:string;alt:string;caption:string;sourceUrl:string};
// Reuse the document associations already shown in the handbook. The model
// cannot supply URLs or decide that an illustrative product photo is evidence.
export function researchImages(records:Pick<ResearchRecord,'id'|'topicId'>[]):ResearchImage[]{
 const images:ResearchImage[]=[];
 const documents=review.guideImages as Record<string,DocumentImage[]>;
 const relatedTopics:Record<string,string>={'answer-dress':'guide-full','answer-hair':'guide-hair'};
 for(const record of records){
  if(record.id==='packing-field')images.push({src:'/assets/packing-poster-2566.png',alt:'ภาพรายการเตรียมไปภาคสนาม ปีการศึกษา2566',caption:'ภาพรายการเตรียมไปภาคสนาม ปีการศึกษา2566 · ข้อมูลย้อนหลัง ไม่ใช่ประกาศผลัดปัจจุบัน',sourceUrl:'https://www.facebook.com/photo/?fbid=668885802086250&set=a.246542974320537'});
  for(const document of documents[relatedTopics[record.topicId]??record.topicId]??[])images.push({src:document.path,alt:document.alt,caption:document.caption,sourceUrl:document.sourceUrl});
 }
 return [...new Map(images.map(image=>[image.src,image])).values()];
}
