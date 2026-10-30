import type { Content, EvidenceBlock, Source } from "../schemas/content";
import type { ContextField, TrainingContext } from "../schemas/context";
import { matchScope, scopeWithin } from "./scope";
import { supersedes } from "./supersedes";
export type Eligibility = { state: "match" | "needs_context" | "expired" | "unavailable"; missing: ContextField[]; refs: EvidenceBlock["sourceRefs"] };
export function sourceInDate(source: Source, now = new Date()): boolean {
  const timestamp = now.getTime();
  const from = source.validFrom ? Date.parse(source.validFrom) : -Infinity;
  const until = source.validUntil ? Date.parse(source.validUntil) + (source.validUntil.length === 10 ? 86400000 - 1 : 0) : Infinity;
  return Number.isFinite(timestamp) && from <= timestamp && until >= timestamp;
}
function sourceUsable(source: Source) {
  return source.status === "verified" && !!source.title.trim() && !!source.publisher.trim() && !!source.reviewedAt && !!(source.url || source.localDocumentPath);
}
export function evaluateEvidence(content: Content, block: EvidenceBlock, context: TrainingContext, now = new Date()): Eligibility {
  const result = (state: Eligibility["state"], missing: ContextField[] = [], refs: EvidenceBlock["sourceRefs"] = []): Eligibility => ({ state, missing, refs });
  if (block.status !== "verified" || !block.text.trim()) return result("unavailable");
  const own = matchScope(block.scope, context);
  if (own.state === "mismatch") return result("unavailable");
  const refs: EvidenceBlock["sourceRefs"] = [], missing = new Set<ContextField>(own.missing);
  let expired = false;
  for (const ref of block.sourceRefs) {
    const source = content.sources.find(s => s.id === ref.sourceId);
    if (!source || !sourceUsable(source) || !ref.locator.trim() || !ref.excerpt.trim() || !scopeWithin(block.scope, source.scope)) continue;
    const scope = matchScope(source.scope, context);
    if (scope.state === "mismatch") continue;
    if (!sourceInDate(source, now)) { expired = true; continue; }
    const overrides = content.sources.filter(other => other.id !== source.id && sourceUsable(other) && sourceInDate(other, now) && supersedes(other, source.id, content.sources, s => s.supersedesSourceIds));
    if (overrides.some(other => matchScope(other.scope, context).state === "match")) continue;
    const pending = overrides.flatMap(other => matchScope(other.scope, context).missing);
    for (const field of [...scope.missing, ...pending]) missing.add(field);
    if (!pending.length && scope.state === "match") refs.push(ref);
  }
  if (missing.size && (refs.length || block.sourceRefs.some(ref => {
    const source = content.sources.find(s => s.id === ref.sourceId);
    return source && sourceUsable(source) && sourceInDate(source, now) && scopeWithin(block.scope, source.scope);
  }))) return result("needs_context", [...missing]);
  if (refs.length) return result("match", [], refs);
  return result(expired ? "expired" : "unavailable");
}
