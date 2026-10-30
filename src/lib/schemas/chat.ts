import { z } from "zod";
import { trainingContextSchema, idSchema } from "./context";
import { dateSchema, externalUrlSchema, permissionSchema, preparationSchema, publicPathSchema } from "./content";
export const consentSchema = z.strictObject({
  version: z.literal("v1"), analytics: z.boolean(), saveQuestionText: z.boolean(),
  demographics: z.strictObject({ ageBand: z.enum(["under18","18to20","21plus","not_stated"]), gender: z.enum(["male","female","self_described","not_stated"]) }).nullable(),
});
const codePoints = (max: number, min = 0) => z.string().transform(v => v.normalize("NFC").trim().replace(/\s+/gu," ")).refine(v => [...v].length >= min && [...v].length <= max, `Expected ${min}–${max} Unicode code points`);
export const chatRequestSchema = z.strictObject({
  requestId: z.uuid(), message: codePoints(1500,1), context: trainingContextSchema, consent: consentSchema,
  previousUserMessages: z.array(codePoints(2000,1)).max(3).refine(messages => messages.reduce((n,v) => n + [...v].length,0) <= 2000),
  confirmedItemIds: z.array(idSchema).max(10),
});
export const chatResponseSchema = z.strictObject({
  requestId: z.uuid(), mode: z.enum(["ai_grounded","rule_based","clarification","unknown","out_of_scope"]),
  reason: z.enum(["ok","no_evidence","missing_context","unsupported_context","conflict","expired","provider_unavailable","usage_limit","invalid_model_output","out_of_scope","logging_unavailable"]),
  intro: z.string(),
  sections: z.array(z.strictObject({ heading: z.string(), blocks: z.array(z.strictObject({ id: idSchema, text: z.string(), citationIds: z.array(idSchema) })) })),
  items: z.array(z.strictObject({ itemId: idSchema, label: z.string(), permission: z.union([permissionSchema,z.enum(["unknown","conflict"])]), preparation: preparationSchema, conditions: z.array(z.string()), citationIds: z.array(idSchema) })),
  guides: z.array(z.strictObject({ id: idSchema, title: z.string(), href: z.string().regex(/^\/guides\/[a-z0-9-]+$/) })),
  citations: z.array(z.strictObject({ id: idSchema, sourceId: idSchema, title: z.string(), publisher: z.string(), url: z.union([externalUrlSchema, publicPathSchema]), locator: z.string().min(1), reviewedAt: dateSchema })),
  clarification: z.strictObject({ field: z.string(), question: z.string(), options: z.array(z.strictObject({ value: z.string(), label: z.string() })) }).nullable(),
  warningCodes: z.array(z.string()),
}).superRefine((response,ctx) => {
  const citations = new Set(response.citations.map(c => c.id));
  for (const block of response.sections.flatMap(section => section.blocks)) {
    if (!block.citationIds.length || block.citationIds.some(id => !citations.has(id))) ctx.addIssue({code:"custom",message:"Unsupported factual block"});
  }
  for (const item of response.items) {
    if (item.citationIds.some(id => !citations.has(id)) || ((["allowed","prohibited","conditional"].includes(item.permission) || item.preparation !== "not_specified") && !item.citationIds.length)) ctx.addIssue({code:"custom",message:"Unsupported item conclusion"});
  }
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
