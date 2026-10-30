import {z} from 'zod';
const researchSchema=z.object({enabled:z.literal(true),status:z.literal('draft'),generated:z.boolean(),retrievedCount:z.number().int().nonnegative(),usedCount:z.number().int().nonnegative(),videos:z.array(z.object({url:z.url().regex(/^https?:\/\//),title:z.string()})),images:z.array(z.object({src:z.string().regex(/^\/assets\/[a-z0-9.-]+$/),alt:z.string(),caption:z.string().optional(),sourceUrl:z.url().regex(/^https?:\/\//)}))});
const knowledgeSchema=z.object({verifiedTotal:z.number().int().nonnegative(),eligibleCount:z.number().int().nonnegative(),providedCount:z.number().int().nonnegative(),selectedCount:z.number().int().nonnegative(),reviewDocumentCount:z.number().int().nonnegative()});
const replySchema=z.object({research:researchSchema.optional(),knowledge:knowledgeSchema.optional(),mode:z.enum(['local','gemini']),reason:z.string(),intents:z.array(z.string()),clarification:z.string().nullable(),routes:z.array(z.object({id:z.string(),title:z.string(),kind:z.enum(['guides','packing','life']),context:z.enum(['center','field','any']),reviewOnly:z.literal(true)})).max(4),answer:z.object({mode:z.string(),intro:z.string(),sections:z.array(z.object({heading:z.string(),blocks:z.array(z.object({id:z.string(),text:z.string(),citationIds:z.array(z.string())}))})),citations:z.array(z.object({id:z.string(),title:z.string(),url:z.string(),locator:z.string()}))})});
export type AssistantReply=z.infer<typeof replySchema>;
export async function askAssistant(question:string,context:string,signal:AbortSignal){
  const response=await fetch('/api/assistant',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question,context}),signal:AbortSignal.any([signal,AbortSignal.timeout(25000)])});
  if(!response.ok)throw new Error('assistant_unavailable');
  return replySchema.parse(await response.json());
}
