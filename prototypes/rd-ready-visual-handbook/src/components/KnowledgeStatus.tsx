import type {AssistantReply} from '../assistant-client';
export function KnowledgeStatus({reply}:{reply:AssistantReply}){
  const knowledge=reply.knowledge;
  if(!knowledge)return null;
  if(!knowledge.verifiedTotal)return <div className="review-note knowledge-status" role="note"><strong>{reply.mode==='gemini'?'Gemini เชื่อมต่อแล้ว แต่ข้อมูลยังไม่พร้อมตอบ':'คลังคำตอบยังไม่มีข้อมูลที่ผ่านการตรวจสอบ'}</strong><p>มีเอกสารประกอบรอตรวจ {knowledge.reviewDocumentCount} หัวข้อ แต่ยังไม่มีเนื้อหาที่อนุมัติให้ใช้ตอบ ระบบจึงแนะนำเอกสารให้อ่านแทนการยืนยันข้อกำหนด</p></div>;
  if(!knowledge.eligibleCount)return <p className="review-note knowledge-status" role="note">มีเนื้อหาที่ตรวจแล้ว {knowledge.verifiedTotal} ชิ้น แต่ยังไม่มีที่ใช้ได้กับบริบทนี้ โปรดระบุหน่วย สถานที่ ชั้นปี ปีการศึกษา หรือกลุ่มเครื่องแบบตามที่ระบบถาม</p>;
  if(reply.mode==='local')return <p className="muted knowledge-status">ค้นในเครื่องจากหลักฐานที่ใช้ได้กับบริบทนี้ {knowledge.eligibleCount} ชิ้น</p>;
  return <p className="muted knowledge-status">ค้นจากหลักฐานที่ใช้ได้กับบริบทนี้ {knowledge.eligibleCount} ชิ้น · ส่งให้ช่วยเลือก {knowledge.providedCount} ชิ้น · เลือก {knowledge.selectedCount} ชิ้น</p>;
}
