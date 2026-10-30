import { existsSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { contentSchema, type Content } from "../schemas/content";
import { scopeResolved, scopeWithin } from "./scope";
import { evaluateEvidence } from "./eligibility";

export function validateContent(input: unknown, options: { publicDir: string; now?: Date }): { content: Content; warnings: string[] } {
  const parsed = contentSchema.safeParse(input);
  if (!parsed.success) throw new Error(`Content schema invalid:\n${parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("\n")}`);
  const content = parsed.data, errors: string[] = [], warnings: string[] = [];
  const fail = (id: string, message: string) => errors.push(`${id}: ${message}`);
  const collections = [content.sources, content.evidence, content.items, content.policies, content.guides, content.faqs];
  const allIds = new Set<string>();
  for (const rows of collections) for (const row of rows) {
    if (allIds.has(row.id)) fail(row.id, "duplicate ID");
    allIds.add(row.id);
  }
  for (const rows of [content.settings.centers, content.settings.locations]) {
    const seen = new Set<string>();
    for (const row of rows) { if (seen.has(row.id)) fail(row.id, "duplicate settings ID"); seen.add(row.id); }
  }
  const byId = <T extends { id: string }>(rows: T[], id: string, owner: string): T | undefined => {
    const found = rows.find(row => row.id === id);
    if (!found) fail(owner, `missing reference ${id}`);
    return found;
  };
  const asset = (path: string | null, owner: string) => {
    if (!path) return;
    const base = resolve(options.publicDir), target = resolve(base, path.slice(1));
    try {
      const rel = relative(realpathSync(base), realpathSync(target));
      if (rel.startsWith("..") || isAbsolute(rel) || !statSync(target).isFile()) fail(owner, `asset outside public or not a file: ${path}`);
    } catch { fail(owner, `missing public asset ${path}`); }
  };
  const checkScope = (record: { id: string; scope: Content["sources"][number]["scope"]; status: string }) => {
    if (record.status === "verified" && !scopeResolved(record.scope)) fail(record.id, "verified scope contains unresolved empty arrays");
    for (const [key, rows] of [["centerIds", content.settings.centers], ["locationIds", content.settings.locations]] as const) {
      const values = record.scope[key];
      if (values === "*") continue;
      for (const id of values) {
        const row = byId(rows, id, record.id);
        if (record.status === "verified" && row && !row.verified) fail(record.id, `${key} ${id} is not verified`);
      }
    }
  };
  for (const center of content.settings.centers) if (center.verified && !center.officialName?.trim()) fail(center.id, "verified center needs officialName");
  const graph = <T extends { id: string }>(rows: T[], refs: (row: T) => string[]) => {
    const walk = (row: T, path: Set<string>) => {
      if (path.has(row.id)) { fail(row.id, "cyclic supersedes relation"); return; }
      const nextPath = new Set(path).add(row.id);
      for (const id of refs(row)) { const target = byId(rows, id, row.id); if (target) walk(target, nextPath); }
    };
    for (const row of rows) walk(row, new Set());
  };
  for (const source of content.sources) {
    checkScope(source); asset(source.localDocumentPath, source.id);
    if (source.validFrom && source.validUntil && Date.parse(source.validFrom) > Date.parse(source.validUntil) + (source.validUntil.length === 10 ? 86400000 - 1 : 0)) fail(source.id, "reversed validity range");
    if (source.status === "verified") {
      if (!source.title.trim() || !source.publisher.trim() || !source.reviewedAt) fail(source.id, "verified source needs title, publisher and reviewedAt");
      if (!source.url && !source.localDocumentPath) fail(source.id, "verified source needs public URL or document");
      if (source.url?.startsWith("http:")) warnings.push(`${source.id}: prefer HTTPS; owner must check actual public access`);
    }
  }
  graph(content.sources, row => row.supersedesSourceIds);
  for (const block of content.evidence) {
    checkScope(block);
    if (block.status === "verified" && (!block.title.trim() || !block.text.trim() || !block.sourceRefs.length)) fail(block.id, "verified evidence needs title, text and sources");
    for (const ref of block.sourceRefs) {
      const source = byId(content.sources, ref.sourceId, block.id);
      if (block.status !== "verified") continue;
      if (!ref.locator.trim() || !ref.excerpt.trim()) fail(block.id, "verified reference needs locator and excerpt");
      if (source && (source.status !== "verified" || !scopeWithin(block.scope, source.scope))) fail(block.id, `source ${source.id} is unverified or narrower than evidence`);
    }
  }
  const evidenceRefs = (owner: { id: string; scope: Content["sources"][number]["scope"]; status: string }, ids: string[]) => {
    if (owner.status === "verified" && !ids.length) fail(owner.id, "verified record needs evidence");
    for (const id of ids) {
      const block = byId(content.evidence, id, owner.id);
      if (owner.status === "verified" && block && (block.status !== "verified" || !scopeWithin(owner.scope, block.scope))) fail(owner.id, `evidence ${id} is unverified or narrower than record`);
    }
  };
  for (const item of content.items) asset(item.imagePath, item.id);
  for (const policy of content.policies) {
    checkScope(policy); byId(content.items, policy.itemId, policy.id); evidenceRefs(policy, policy.evidenceBlockIds);
    if (policy.status === "verified" && policy.permission === "conditional" && !policy.conditions.some(v => v.trim())) fail(policy.id, "conditional permission needs conditions");
    for (const id of policy.supersedesPolicyIds) {
      const previous = byId(content.policies, id, policy.id);
      if (previous && previous.itemId !== policy.itemId) fail(policy.id, "cannot supersede policy for another item");
    }
  }
  graph(content.policies, row => row.supersedesPolicyIds);
  const slugs = new Set<string>();
  for (const guide of content.guides) {
    checkScope(guide); evidenceRefs(guide, guide.evidenceBlockIds);
    if (slugs.has(guide.slug)) fail(guide.id, "duplicate guide slug"); slugs.add(guide.slug);
    if (guide.status === "verified" && (!guide.title.trim() || !guide.summary.trim() || !guide.steps.length)) fail(guide.id, "verified guide needs title, summary and steps");
    for (const step of guide.steps) {
      evidenceRefs(guide, step.evidenceBlockIds); asset(step.imagePath, guide.id);
      if (guide.status === "verified" && (!step.title.trim() || (step.imagePath && !step.alt?.trim()))) fail(guide.id, "verified step needs title and image alt");
    }
    for (const id of guide.relatedItemIds) byId(content.items, id, guide.id);
    for (const video of guide.videoLinks) {
      const source = byId(content.sources, video.sourceId, guide.id);
      if (guide.status === "verified" && source && (source.status !== "verified" || !scopeWithin(guide.scope, source.scope))) fail(guide.id, "video source not verified or scope too narrow");
    }
  }
  for (const faq of content.faqs) {
    for (const id of faq.evidenceBlockIds) { const block = byId(content.evidence, id, faq.id); if (faq.status === "verified" && block?.status !== "verified") fail(faq.id, "unverified FAQ evidence"); }
    for (const id of faq.guideIds) { const guide = byId(content.guides, id, faq.id); if (faq.status === "verified" && guide?.status !== "verified") fail(faq.id, "unverified FAQ guide"); }
    for (const id of faq.itemIds) byId(content.items, id, faq.id);
    if (faq.status === "verified" && (!faq.questions.some(q => q.trim()) || !(faq.evidenceBlockIds.length + faq.guideIds.length + faq.itemIds.length))) fail(faq.id, "verified FAQ needs questions and targets");
  }
  for (const context of content.settings.supportedContexts) {
    if (!content.evidence.some(block => evaluateEvidence(content, block, context, options.now).state === "match")) fail("settings.supportedContexts", "unsupported advertised context");
    if (context.centerId && !content.settings.centers.some(row => row.id === context.centerId && row.verified)) fail("settings.supportedContexts", "unverified center");
    if (context.locationId && !content.settings.locations.some(row => row.id === context.locationId && row.verified)) fail("settings.supportedContexts", "unverified location");
  }
  if (!existsSync(options.publicDir)) fail("public", "public directory missing");
  const verified = content.evidence.filter(block => block.status === "verified").length;
  if (!verified) warnings.push("verified evidence = 0; factual answers unavailable; draft records are excluded");
  if (errors.length) throw new Error(`Content validation failed:\n${[...new Set(errors)].join("\n")}`);
  return { content, warnings };
}
