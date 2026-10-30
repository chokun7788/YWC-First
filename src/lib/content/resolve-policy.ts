import type { Content, ItemPolicy } from "../schemas/content";
import type { ContextField, TrainingContext } from "../schemas/context";
import { evaluateEvidence } from "./eligibility";
import { matchScope, scopeWithin } from "./scope";
import { withoutSuperseded } from "./supersedes";
export type PolicyResult = {
  state: "resolved" | "unknown" | "needs_context" | "conflict" | "expired";
  permission: ItemPolicy["permission"] | "unknown" | "conflict";
  preparation: ItemPolicy["preparation"];
  conditions: string[]; evidenceBlockIds: string[]; policyIds: string[]; missing: ContextField[];
};
export function evaluatePolicy(content: Content, policy: ItemPolicy, context: TrainingContext, now = new Date()) {
  const own = matchScope(policy.scope, context);
  if (policy.status !== "verified" || own.state === "mismatch" || !policy.evidenceBlockIds.length) return { state: "unavailable" as const, missing: [] };
  const blocks = policy.evidenceBlockIds.map(id => content.evidence.find(block => block.id === id));
  if (blocks.some(block => !block || !scopeWithin(policy.scope, block.scope))) return { state: "unavailable" as const, missing: [] };
  const results = blocks.map(block => evaluateEvidence(content, block!, context, now));
  if (results.some(result => result.state === "unavailable")) return { state: "unavailable" as const, missing: [] };
  if (results.some(result => result.state === "expired")) return { state: "expired" as const, missing: [] };
  const missing = [...new Set<ContextField>([...own.missing, ...results.flatMap(result => result.missing)])];
  return { state: missing.length ? "needs_context" as const : "match" as const, missing };
}
export function resolvePolicy(content: Content, itemId: string, context: TrainingContext, now = new Date()): PolicyResult {
  const base: PolicyResult = { state: "unknown", permission: "unknown", preparation: "not_specified", conditions: [], evidenceBlockIds: [], policyIds: [], missing: [] };
  const rows = content.policies.filter(policy => policy.itemId === itemId).map(policy => ({ policy, result: evaluatePolicy(content, policy, context, now) }));
  const missing = [...new Set(rows.flatMap(row => row.result.missing))];
  if (missing.length) return { ...base, state: "needs_context", missing };
  const active = withoutSuperseded(rows.filter(row => row.result.state === "match").map(row => row.policy), content.policies, policy => policy.supersedesPolicyIds);
  if (!active.length) return { ...base, state: rows.some(row => row.result.state === "expired") ? "expired" : "unknown" };
  const signature = (policy: ItemPolicy) => JSON.stringify([policy.permission, policy.preparation, [...new Set(policy.conditions)].sort()]);
  const conflict = new Set(active.map(signature)).size > 1;
  const evidenceBlockIds = [...new Set(active.flatMap(policy => policy.evidenceBlockIds))];
  return {
    ...base, state: conflict ? "conflict" : "resolved", permission: conflict ? "conflict" : active[0].permission,
    preparation: conflict ? "not_specified" : active[0].preparation,
    conditions: conflict ? [] : active[0].conditions, evidenceBlockIds, policyIds: active.map(policy => policy.id),
  };
}
