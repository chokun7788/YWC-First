// Only explicitly declared relations have precedence. Dates never imply overrides.
export function supersedes<T extends { id: string }>(newer: T, olderId: string, records: T[], refs: (record: T) => string[], visited = new Set<string>()): boolean {
  if (visited.has(newer.id)) return false;
  visited.add(newer.id);
  return refs(newer).some(id => id === olderId || records.some(record => record.id === id && supersedes(record, olderId, records, refs, visited)));
}
export function withoutSuperseded<T extends { id: string }>(eligible: T[], all: T[], refs: (record: T) => string[]): T[] {
  return eligible.filter(older => !eligible.some(newer => newer.id !== older.id && supersedes(newer, older.id, all, refs)));
}
