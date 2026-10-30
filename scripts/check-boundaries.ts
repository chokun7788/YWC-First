import { existsSync,readdirSync,readFileSync } from "node:fs";
import { join,resolve } from "node:path";
function files(root:string):string[] {
  if(!existsSync(root)) return [];
  return readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(join(root,entry.name)):[join(root,entry.name)]);
}
const source=files("src").filter(path=>/\.[cm]?[jt]sx?$/.test(path));
const violations:string[]=[];
for(const file of source) {
  const text=readFileSync(file,"utf8");
  if(/(?:from\s*|import\s*\(|require\s*\()["'][^"']*(?:tests|fixtures)[/\\]/u.test(text) || /TEST ONLY|src-test-|ev-test-/u.test(text)) violations.push(`${file}: test data in production source`);
  if(/NEXT_PUBLIC_(?:OPENAI|SUPABASE|SESSION_SECRET|LOG_HASH_SECRET)/u.test(text)) violations.push(`${file}: public credential variable`);
}
for(const file of [...files("content"),...files("public")].filter(path=>/\.(?:json|txt|md|html|svg)$/.test(path))) {
  if(/TEST ONLY|src-test-|ev-test-/.test(readFileSync(file,"utf8"))) violations.push(`${file}: fixture in production content/assets`);
}
const env=readFileSync("src/lib/server/env.ts","utf8");
if(!/import\s+["']server-only["']/.test(env)) violations.push("privileged environment module lacks server-only boundary");
const assets=files(".next/static").filter(path=>/\.(?:js|json|html)$/.test(path));
for(const file of assets) {
  const text=readFileSync(file,"utf8");
  if(/OPENAI_API_KEY|SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|SESSION_SECRET|LOG_HASH_SECRET|TEST_ONLY_BOUNDARY_CANARY|src-test-|ev-test-|TEST ONLY/.test(text)) violations.push(`${file}: server configuration or fixture leaked into browser output`);
}
for(const path of [".next/server/app/index.html",".next/server/app/index.rsc"]) if(existsSync(path) && /TEST_ONLY_BOUNDARY_CANARY|src-test-|ev-test-|TEST ONLY/.test(readFileSync(path,"utf8"))) violations.push(`${path}: fixture or canary in rendered page`);
if(violations.length) {console.error(violations.join("\n"));process.exitCode=1;}
else console.log(JSON.stringify({status:"ok",sourceFiles:source.length,browserAssets:assets.length,browserBuildChecked:assets.length>0,root:resolve(".")},null,2));
