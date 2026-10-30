import type { Content, EvidenceBlock, Guide } from "../schemas/content";
import type { ContextField, TrainingContext } from "../schemas/context";
import { evaluateEvidence, sourceInDate } from "./eligibility";
import { matchScope, scopeWithin } from "./scope";
import { resolvePolicy } from "./resolve-policy";
export const normalize = (text: string) => text.normalize("NFC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("th");
const stop = new Set(["ปี", "ของ", "ไป", "ได้", "ไหม", "ต้อง", "อะไร", "รด", "รด.", "และ", "ที่", "เอา", "การ", "the", "a"]);
function tokens(text: string): string[] {
  if (typeof Intl.Segmenter !== "undefined") return [...new Intl.Segmenter("th", { granularity: "word" }).segment(text)].filter(part => part.isWordLike).map(part => part.segment).filter(part => [...part].length >= 3 && !stop.has(part));
  return text.split(/\s+/u).filter(part => [...part].length >= 3 && !stop.has(part));
}
const phrase = (message: string, text: string) => [...normalize(text)].length >= 3 && !stop.has(normalize(text)) && message.includes(normalize(text));
export function catalogHasVerifiedReferences(content: Content, itemId: string): boolean {
  return content.policies.some(policy => policy.itemId === itemId && policy.status === "verified" && policy.evidenceBlockIds.length > 0 && policy.evidenceBlockIds.every(id => {
    const block = content.evidence.find(block => block.id === id);
    return block?.status === "verified" && scopeWithin(policy.scope, block.scope) && block.sourceRefs.some(ref => content.sources.some(source => source.id === ref.sourceId && source.status === "verified" && scopeWithin(block.scope, source.scope)));
  }));
}
export function guideUsable(content: Content, guide: Guide, context: TrainingContext, now = new Date()): boolean {
  const ids = [...guide.evidenceBlockIds, ...guide.steps.flatMap(step => step.evidenceBlockIds)];
  return guide.status === "verified" && matchScope(guide.scope, context).state === "match" && guide.steps.length > 0 && guide.steps.every(step => step.evidenceBlockIds.length > 0) && ids.length > 0 && ids.every(id => {
    const block = content.evidence.find(block => block.id === id);
    return block && scopeWithin(guide.scope, block.scope) && evaluateEvidence(content, block, context, now).state === "match";
  }) && guide.videoLinks.every(video => content.sources.some(source => source.id === video.sourceId && source.status === "verified" && sourceInDate(source, now) && matchScope(source.scope, context).state === "match"));
}
export function retrieve(content: Content, message: string, context: TrainingContext, confirmedItemIds: string[] = [], now = new Date()) {
  const query = normalize(message), words = tokens(query);
  const packing = /(?:ต้องเตรียมอะไร|เตรียมของ|รายการสิ่งของ|จัดกระเป๋า|packing)/u.test(query);
  const visibleCatalog = content.items.filter(item => catalogHasVerifiedReferences(content, item.id));
  const faqs = content.faqs.filter(faq => faq.status === "verified" && faq.questions.some(question => phrase(query, question)));
  const faqItemIds = new Set(faqs.flatMap(faq => faq.itemIds));
  const namedItemIds = visibleCatalog.filter(item => confirmedItemIds.includes(item.id) || [item.label, ...item.aliases].some(alias => phrase(query, alias)) || faqItemIds.has(item.id) || (packing && resolvePolicy(content, item.id, context, now).state !== "unknown")).slice(0,10).map(item => item.id);
  const policyEvidence = new Set(content.policies.filter(policy => namedItemIds.includes(policy.itemId) && policy.status === "verified" && matchScope(policy.scope, context).state !== "mismatch").flatMap(policy => policy.evidenceBlockIds));
  const faqEvidence = new Set(faqs.flatMap(faq => faq.evidenceBlockIds));
  const faqGuides = new Set(faqs.flatMap(faq => faq.guideIds));
  const relevantGuides = content.guides.filter(guide => guide.status === "verified" && (faqGuides.has(guide.id) || phrase(query, guide.title) || guide.relatedItemIds.some(id => namedItemIds.includes(id)) || words.some(word => normalize(guide.title).includes(word))));
  const guideEvidence = new Set(relevantGuides.flatMap(guide => [...guide.evidenceBlockIds, ...guide.steps.flatMap(step => step.evidenceBlockIds)]));
  const ranked = content.evidence.map(block => {
    const eligibility = evaluateEvidence(content, block, context, now);
    let score = policyEvidence.has(block.id) ? 1000 : faqEvidence.has(block.id) ? 500 : guideEvidence.has(block.id) ? 400 : 0;
    if (phrase(query, block.title)) score += 100;
    score += block.keywords.filter(keyword => phrase(query, keyword)).length * 40;
    score += words.filter(word => normalize(block.title).includes(word)).length * 15;
    score += words.filter(word => normalize(block.text).includes(word)).length * 3;
    return { block, eligibility, score };
  }).filter(row => row.score > 0).sort((a,b) => b.score-a.score || a.block.id.localeCompare(b.block.id));
  // A keyword hit on one policy must not hide another conflicting policy for that item.
  const relevantEvidence = new Set(ranked.filter(row=>row.eligibility.state!=="unavailable").map(row=>row.block.id));
  const impliedItemIds = visibleCatalog.filter(item=>content.policies.some(policy=>policy.itemId===item.id && policy.status==="verified" && matchScope(policy.scope,context).state!=="mismatch" && policy.evidenceBlockIds.some(id=>relevantEvidence.has(id)))).map(item=>item.id);
  const itemIds = [...new Set([...namedItemIds,...impliedItemIds])].slice(0,10);
  const evidence: EvidenceBlock[] = []; let characters = 0;
  for (const row of ranked) {
    if (row.eligibility.state !== "match" || evidence.length >= 8) continue;
    const size = row.block.text.length + row.block.title.length + row.block.sourceRefs.reduce((n,ref) => n + ref.excerpt.length + ref.locator.length,0);
    if (characters + size > 12000) continue;
    evidence.push(row.block); characters += size;
  }
  const missing = [...new Set<ContextField>(ranked.flatMap(row => row.eligibility.state === "needs_context" ? row.eligibility.missing : []))];
  return {
    evidence, itemIds, guides: relevantGuides.filter(guide => guideUsable(content, guide, context, now)).slice(0,3),
    guideQuestion: /(?:วิธี|คู่มือ|guide|how to)/u.test(query) || faqs.some(faq=>faq.intent==="dress"),
    missing, expired: ranked.some(row => row.eligibility.state === "expired"), packing,
  };
}
