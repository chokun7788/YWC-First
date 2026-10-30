import type { Content, EvidenceBlock } from "../schemas/content";
import { chatRequestSchema, chatResponseSchema, type ChatRequest, type ChatResponse } from "../schemas/chat";
import type { ContextField } from "../schemas/context";
import { evaluateEvidence } from "../content/eligibility";
import { retrieve, guideUsable } from "../content/retrieve";
import { resolvePolicy } from "../content/resolve-policy";

const questions: Record<ContextField,string> = {
  centerId:"คุณฝึกกับหน่วยใด?", locationId:"คุณฝึกที่สถานที่ใด?", trainingType:"เป็นการฝึกปกติหรือภาคสนาม?",
  studyYear:"คุณเรียน รด. ชั้นปีใด?", academicYearBE:"ประกาศที่ต้องการใช้เป็นปีการศึกษา พ.ศ. ใด?", uniformGroup:"ต้องการข้อมูลสำหรับเครื่องแบบกลุ่มใด?",
};
export function ruleAnswer(content: Content, input: ChatRequest, now = new Date()): ChatResponse {
  const request = chatRequestSchema.parse(input);
  const response: ChatResponse = { requestId:request.requestId, mode:"unknown", reason:"no_evidence", intro:"ยังไม่มีข้อมูลที่ตรวจแล้วเรื่องนี้ในระบบ กรุณาตรวจประกาศของหน่วยฝึก", sections:[], items:[], guides:[], citations:[], clarification:null, warningCodes:[] };
  const finish = () => chatResponseSchema.parse(response);
  if (/(?:วิธี(?:ทำ|สร้าง|ใช้)ระเบิด|ทำร้ายคน|หลบเลี่ยงการตรวจ|สูตรอาหาร|พยากรณ์อากาศ|ราคาหุ้น)/u.test(request.message)) {
    response.mode="out_of_scope"; response.reason="out_of_scope"; response.intro="ระบบช่วยค้นข้อมูลการเตรียมตัวและการเรียน รด. จากหลักฐานที่ตรวจแล้ว"; return finish();
  }
  const found = retrieve(content, request.message, request.context, request.confirmedItemIds, now);
  const results = found.itemIds.map(id => ({ id, result:resolvePolicy(content,id,request.context,now) }));
  const missing = [...new Set<ContextField>([...found.missing, ...results.flatMap(row => row.result.missing)])];
  if (missing.length) {
    const field=missing[0]; response.mode="clarification"; response.reason="missing_context"; response.intro="ขอข้อมูลเพิ่มเพื่อค้นให้ตรงกับบริบทของคุณ";
    let options: {value:string;label:string}[]=[];
    if (field==="centerId") options=content.settings.centers.filter(v=>v.verified).map(v=>({value:v.id,label:v.label}));
    if (field==="locationId") options=content.settings.locations.filter(v=>v.verified).map(v=>({value:v.id,label:v.label}));
    if (field==="trainingType") options=[{value:"regular",label:"ฝึกปกติ"},{value:"field",label:"ภาคสนาม"}];
    if (field==="studyYear") options=[1,2,3].map(v=>({value:String(v),label:`ปี ${v}`}));
    if (field==="uniformGroup") options=[{value:"male_uniform",label:"เครื่องแบบกลุ่มชาย"},{value:"female_uniform",label:"เครื่องแบบกลุ่มหญิง"}];
    if (field==="academicYearBE") options=[...new Set(content.evidence.filter(v=>v.status==="verified").flatMap(v=>v.scope.academicYearsBE==="*"?[]:v.scope.academicYearsBE))].map(v=>({value:String(v),label:`พ.ศ. ${v}`}));
    response.clarification={field,question:questions[field],options}; return finish();
  }
  const conflict = results.some(row=>row.result.state==="conflict");
  const used = new Map<string,EvidenceBlock>();
  // For item questions use only resolver-approved evidence, including both sides of conflicts.
  const evidenceIds = results.length ? results.flatMap(row=>row.result.evidenceBlockIds) : found.evidence.map(block=>block.id);
  if (found.guideQuestion && !conflict) for (const guide of found.guides) evidenceIds.push(...guide.evidenceBlockIds,...guide.steps.slice(0,4).flatMap(step=>step.evidenceBlockIds));
  for (const id of evidenceIds) { const block=content.evidence.find(v=>v.id===id); if (block && evaluateEvidence(content,block,request.context,now).state==="match") used.set(id,block); }
  const guideSize = found.guideQuestion && !conflict ? found.guides.reduce((n,g)=>n+g.title.length+g.summary.length+g.steps.slice(0,4).reduce((m,s)=>m+s.title.length,0),0) : 0;
  const payloadSize = guideSize + [...used.values()].reduce((total,block) => total + block.title.length + block.text.length + block.sourceRefs.reduce((n,ref) => n + ref.locator.length + ref.excerpt.length,0),0);
  if (used.size > 12 || payloadSize > 12000) {
    response.intro="ข้อมูลที่เกี่ยวข้องมีมากเกินขอบเขตคำตอบ กรุณาระบุชื่อสิ่งของหรือหัวข้อให้เฉพาะเจาะจงขึ้น";
    response.warningCodes.push("evidence_payload_limit");
    return finish();
  }
  if (results.some(row=>["unknown","expired"].includes(row.result.state))) response.warningCodes.push("partial_item_results");
  const citationsFor = (block: EvidenceBlock): string[] => evaluateEvidence(content,block,request.context,now).refs.map((ref,refIndex)=>{
    const source=content.sources.find(v=>v.id===ref.sourceId)!;
    const id=`cite-${block.id}-${source.id}-${refIndex}`;
    if (!response.citations.some(c=>c.id===id)) response.citations.push({id,sourceId:source.id,title:source.title,publisher:source.publisher,url:(source.url||source.localDocumentPath)!,locator:ref.locator,reviewedAt:source.reviewedAt!});
    return id;
  });
  const blockCitations = new Map([...used.values()].map(block=>[block.id,citationsFor(block)]));
  for (const {id,result} of results) {
    const item=content.items.find(v=>v.id===id)!;
    response.items.push({itemId:id,label:item.label,permission:result.permission,preparation:result.preparation,conditions:result.conditions,citationIds:[...new Set(result.evidenceBlockIds.flatMap(blockId=>blockCitations.get(blockId)||[]))]});
  }
  const groupHeading = (block: EvidenceBlock) => {
    if (conflict) return "ข้อมูลขัดแย้ง — กรุณาตรวจสอบกับหน่วยฝึก";
    const policy=results.find(row=>row.result.evidenceBlockIds.includes(block.id))?.result;
    if (!found.packing) return block.kind==="recommendation" ? "คำแนะนำจากแหล่งข้อมูล" : "ข้อมูลที่ตรวจแล้ว";
    if (policy?.permission==="prohibited") return "ห้ามตามหลักฐาน";
    if (policy?.permission==="conditional") return "มีเงื่อนไข";
    if (policy?.preparation==="required") return "เอกสารระบุให้เตรียม";
    if (policy?.preparation==="recommended" || block.kind==="recommendation") return "คำแนะนำ";
    return "ยังไม่มีข้อสรุปเรื่องการเตรียม";
  };
  for (const block of used.values()) {
    const heading=groupHeading(block);
    let section=response.sections.find(v=>v.heading===heading);
    if (!section) {section={heading,blocks:[]};response.sections.push(section);}
    section.blocks.push({id:block.id,text:block.text,citationIds:blockCitations.get(block.id)!});
  }
  if (found.guideQuestion && !conflict) for (const guide of found.guides) {
    const sourceIds = (ids: string[]) => [...new Set(ids.flatMap(id=>blockCitations.get(id)||[]))];
    response.sections.push({heading:guide.title,blocks:[
      {id:guide.id,text:guide.summary,citationIds:sourceIds(guide.evidenceBlockIds)},
      ...guide.steps.slice(0,4).map((step,index)=>({id:`${guide.id}-step-${index+1}`,text:step.title,citationIds:sourceIds(step.evidenceBlockIds)})),
    ]});
  }
  response.guides=(conflict ? [] : found.guides).filter(guide=>guideUsable(content,guide,request.context,now)).map(guide=>({id:guide.id,title:guide.title,href:`/guides/${guide.slug}`}));
  if (conflict) { response.mode="rule_based";response.reason="conflict";response.intro="พบข้อกำหนดที่ขัดแย้งกัน ยังสรุปไม่ได้ โปรดตรวจสอบทั้งสองแหล่งกับหน่วยฝึก";response.warningCodes.push("conflicting_policies"); }
  else if (used.size || response.items.some(item=>item.citationIds.length)) {response.mode="rule_based";response.reason="ok";response.intro=found.packing?"รายการที่มีข้อมูลตรวจแล้วในระบบ ไม่ใช่รายการครบทั้งหมด":"ข้อมูลที่ตรวจแล้วสำหรับบริบทนี้";}
  else if (found.expired || results.some(row=>row.result.state==="expired")) {response.reason="expired";response.intro="หลักฐานที่พบยังไม่อยู่ในช่วงใช้งานหรือหมดอายุแล้ว กรุณาตรวจประกาศล่าสุด";}
  else if (Object.values(request.context).some(v=>v!==null && v!=="unspecified") && !content.evidence.some(block=>evaluateEvidence(content,block,request.context,now).state==="match")) {response.reason="unsupported_context";response.intro="ยังไม่มีข้อมูลที่ตรวจแล้วสำหรับบริบทนี้";}
  return finish();
}
