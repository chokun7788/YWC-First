import { loadContent } from "../src/lib/content/load";
try {
  const { content, version, warnings } = await loadContent();
  const counts = Object.fromEntries(["sources", "evidence", "policies", "guides", "faqs"].map(key => {
    const rows = content[key as "sources"];
    return [key, { total: rows.length, verified: rows.filter(row => row.status === "verified").length }];
  }));
  console.log(JSON.stringify({ status: "ok", version, counts, warnings }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Content validation failed");
  process.exitCode = 1;
}
