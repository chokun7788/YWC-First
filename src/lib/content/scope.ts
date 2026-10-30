import type { ContextField, Scope, TrainingContext } from "../schemas/context";
export const dimensions = [
  ["centerIds", "centerId"], ["locationIds", "locationId"], ["trainingTypes", "trainingType"],
  ["studyYears", "studyYear"], ["academicYearsBE", "academicYearBE"], ["uniformGroups", "uniformGroup"],
] as const;
export type ScopeMatch = { state: "match" | "needs_context" | "mismatch"; missing: ContextField[] };
export function matchScope(scope: Scope, context: TrainingContext): ScopeMatch {
  const missing: ContextField[] = [];
  let mismatch = false;
  for (const [scopeKey, contextKey] of dimensions) {
    const values = scope[scopeKey];
    if (values === "*") continue;
    if (!values.length) { mismatch = true; continue; }
    const value = context[contextKey];
    if (value === null || value === "unspecified") missing.push(contextKey);
    else if (!(values as readonly unknown[]).includes(value)) mismatch = true;
  }
  return { state: mismatch ? "mismatch" : missing.length ? "needs_context" : "match", missing: mismatch ? [] : missing };
}
export function scopeWithin(child: Scope, parent: Scope): boolean {
  return dimensions.every(([key]) => {
    const a = child[key], b = parent[key];
    if (b === "*") return a === "*" || a.length > 0;
    if (a === "*" || !a.length || !b.length) return false;
    return a.every(value => (b as readonly unknown[]).includes(value));
  });
}
export function scopeResolved(scope: Scope): boolean {
  return dimensions.every(([key]) => scope[key] === "*" || scope[key].length > 0);
}
