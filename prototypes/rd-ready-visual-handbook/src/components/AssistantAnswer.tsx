import type {AssistantReply} from '../assistant-client';
import {ExternalLink} from './Shared';
import {fallbackNotice} from '../assistant-status';
import {KnowledgeStatus} from './KnowledgeStatus';
import {ResearchAnswer} from './ResearchAnswer';
export function AssistantAnswer({reply,pending,error,onRoute}:{reply?:AssistantReply;pending?:boolean;error?:boolean;onRoute:(route:AssistantReply['routes'][number])=>void}){
  const factual=!!reply?.answer.sections.length;
  const notice=reply?fallbackNotice(reply.mode,reply.reason):null;
  if(reply?.research&&!pending&&!error)return <ResearchAnswer reply={reply} onRoute={onRoute}/>;
  return <article className="unavailable-answer"><span className="eyebrow">{pending?'กำลังค้นข้อมูล':reply?.mode==='gemini'?'Gemini ช่วยเลือกหมวด':'ค้นหาในเครื่อง'}</span><h2>{pending?'กำลังหาเรื่องที่เกี่ยวข้อง...':error?'ติดต่อระบบค้นหาไม่ได้':factual?'ข้อมูลจากหลักฐานที่ตรวจแล้ว':'ยังไม่มีคำตอบที่ผ่านการตรวจสอบ'}</h2>{error?<p role="alert">ข้อความยังอยู่ในช่องถาม ลองส่งใหม่ได้ ไม่มีการเรียกซ้ำอัตโนมัติ</p>:pending?<p role="status">ตรวจบริบทและแหล่งข้อมูลก่อนแสดงผล</p>:<>{notice&&<p className="review-note" role="status">{notice}</p>}{reply&&<KnowledgeStatus reply={reply}/>}<p>{reply?.answer.intro??'ข้อมูลรอตรวจไม่ใช้ยืนยันข้อกำหนด'}</p>{reply?.clarification&&<p className="review-note">{reply.clarification}</p>}{reply?.answer.sections.map((section,i)=><section key={i}><h3>{section.heading}</h3>{section.blocks.map(block=><p key={block.id}>{block.text}</p>)}</section>)}{reply?.answer.citations.map(c=><div key={c.id}>{/^https?:\/\//.test(c.url)?<ExternalLink href={c.url}>{c.title} · {c.locator}</ExternalLink>:c.url.startsWith('/sources/')?<a href={c.url}>{c.title}</a>:null}</div>)}{reply?.routes.length? <><p className="muted">เอกสารประกอบรอตรวจที่เกี่ยวข้อง — เปิดอ่านได้ แต่ไม่ใช้ยืนยันกฎ</p><div className="quick-links">{reply.routes.map(route=><button key={route.id} onClick={()=>onRoute(route)}>{route.title}</button>)}</div></>:null}<div className="quick-links"><ExternalLink href="https://www.tdc.mi.th/index.html">ตรวจประกาศจากหน่วย</ExternalLink></div></>}</article>;
}
