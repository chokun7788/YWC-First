import { z } from "zod";
import { idSchema, scopeSchema, trainingContextSchema } from "./context";

export const statusSchema = z.enum(["draft", "verified", "archived"]);
export const externalUrlSchema = z.url().refine(value => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
}, "Only public HTTP(S) links without credentials are supported");
export const publicPathSchema = z.string().refine(value =>
  /^\/(?!\/)[a-zA-Z0-9_./-]+$/.test(value) && !value.split("/").some(p => p === "." || p === ".."),
  "Expected an absolute public path without traversal");
export const dateSchema = z.union([z.iso.date(), z.iso.datetime({ offset: true })]);
const ids = z.array(idSchema);
export const sourceSchema = z.strictObject({
  id: idSchema, title: z.string(), publisher: z.string(),
  url: externalUrlSchema.nullable(), localDocumentPath: publicPathSchema.nullable(),
  publishedAt: dateSchema.nullable(), reviewedAt: dateSchema.nullable(),
  validFrom: dateSchema.nullable(), validUntil: dateSchema.nullable(), scope: scopeSchema,
  kind: z.enum(["official", "school_notice", "creator_advice"]), status: statusSchema,
  supersedesSourceIds: ids, rightsNote: z.string().nullable(),
});
export const evidenceSchema = z.strictObject({
  id: idSchema, title: z.string(), topic: z.string(), text: z.string(), keywords: z.array(z.string()),
  scope: scopeSchema, sourceRefs: z.array(z.strictObject({ sourceId: idSchema, locator: z.string(), excerpt: z.string() })),
  status: statusSchema, kind: z.enum(["requirement", "how_to", "recommendation"]),
});
export const permissionSchema = z.enum(["allowed", "prohibited", "conditional", "not_specified"]);
export const preparationSchema = z.enum(["required", "recommended", "not_specified"]);
export const policySchema = z.strictObject({
  id: idSchema, itemId: idSchema, scope: scopeSchema, permission: permissionSchema,
  preparation: preparationSchema, conditions: z.array(z.string()), evidenceBlockIds: ids,
  status: statusSchema, supersedesPolicyIds: ids,
});
export const itemSchema = z.strictObject({
  id: idSchema, label: z.string().trim().min(1), aliases: z.array(z.string().trim().min(1)),
  categoryId: idSchema, imagePath: publicPathSchema.nullable(),
});
export const guideSchema = z.strictObject({
  id: idSchema, slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), title: z.string(), summary: z.string(),
  scope: scopeSchema, status: statusSchema,
  steps: z.array(z.strictObject({ title: z.string(), evidenceBlockIds: ids, imagePath: publicPathSchema.nullable(), alt: z.string().nullable() })),
  relatedItemIds: ids, videoLinks: z.array(z.strictObject({ title: z.string(), url: externalUrlSchema, sourceId: idSchema })),
  evidenceBlockIds: ids,
});
export const intentSchema = z.enum(["dress", "item_policy", "packing", "rules", "recommendation", "general_rd", "out_of_scope"]);
export const faqSchema = z.strictObject({
  id: idSchema, questions: z.array(z.string()), intent: intentSchema,
  evidenceBlockIds: ids, guideIds: ids, itemIds: ids, status: statusSchema,
});
export const settingsSchema = z.strictObject({
  projectName: z.string().min(1), contentMode: z.literal("verified_only"),
  centers: z.array(z.strictObject({ id: idSchema, label: z.string().min(1), officialName: z.string().nullable(), verified: z.boolean() })),
  locations: z.array(z.strictObject({ id: idSchema, label: z.string().min(1), verified: z.boolean() })),
  supportedContexts: z.array(trainingContextSchema), contactUrl: externalUrlSchema.nullable(),
});
export const contentSchema = z.strictObject({
  settings: settingsSchema, sources: z.array(sourceSchema), evidence: z.array(evidenceSchema),
  items: z.array(itemSchema), policies: z.array(policySchema), guides: z.array(guideSchema), faqs: z.array(faqSchema),
});
export type Content = z.infer<typeof contentSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type EvidenceBlock = z.infer<typeof evidenceSchema>;
export type ItemPolicy = z.infer<typeof policySchema>;
export type Guide = z.infer<typeof guideSchema>;
