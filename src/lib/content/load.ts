import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { validateContent } from "./validate";
const collections = ["settings", "sources", "evidence", "items", "policies", "guides", "faqs"] as const;
export function contentVersion(value: unknown): string {
  const canonical = (input: unknown): string => {
    if (Array.isArray(input)) return `[${input.map(canonical).join(",")}]`;
    if (input && typeof input === "object") return "{" + Object.entries(input).sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0).map(([key,v]) => `${JSON.stringify(key)}:${canonical(v)}`).join(",") + "}";
    return JSON.stringify(input);
  };
  return createHash("sha256").update(canonical(value)).digest("hex");
}
export async function loadContent(root = process.cwd(), now?: Date) {
  const entries = await Promise.all(collections.map(async key => [key, JSON.parse(await readFile(resolve(root, "content", `${key}.json`), "utf8"))]));
  const result = validateContent(Object.fromEntries(entries), { publicDir: resolve(root, "public"), now });
  return { ...result, version: contentVersion(result.content) };
}
