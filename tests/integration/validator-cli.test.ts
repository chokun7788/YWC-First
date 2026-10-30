import { expect,it } from "vitest";
import { copyFileSync,mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { isAbsolute,join,relative,resolve } from "node:path";
import { fixture,fixturePublic } from "../fixtures/content";
it("real content validator CLI exits nonzero for a broken verified reference",()=>{
  const buildRoot=resolve(".rd-ready-build");mkdirSync(buildRoot,{recursive:true});
  const probe=mkdtempSync(join(buildRoot,"validator-probe-"));
  try {
    const data=fixture();data.evidence[0].sourceRefs[0].sourceId="src-missing-test-only";
    mkdirSync(join(probe,"content"));mkdirSync(join(probe,"public","sources"),{recursive:true});
    for(const [key,value] of Object.entries(data)) writeFileSync(join(probe,"content",`${key}.json`),JSON.stringify(value));
    copyFileSync(join(fixturePublic,"sources","test-only.txt"),join(probe,"public","sources","test-only.txt"));
    const result=spawnSync(process.execPath,[resolve("node_modules/tsx/dist/cli.mjs"),resolve("scripts/validate-content.ts")],{cwd:probe,encoding:"utf8"});
    expect(result.error).toBeUndefined();expect(result.status).toBe(1);expect(result.stderr).toContain("missing reference src-missing-test-only");
    expect(result.stdout).not.toContain('"status": "ok"');
  } finally {
    const rel=relative(buildRoot,probe);
    if(!rel || rel.startsWith("..") || isAbsolute(rel)) throw new Error("Refusing cleanup outside isolated probe folder");
    rmSync(probe,{recursive:true,force:true});
  }
});
it("the four original requirement documents remain byte-for-byte unchanged",()=>{
  const hashes=JSON.parse(readFileSync("docs/original-document-hashes.json","utf8")) as Record<string,string>;
  expect(Object.keys(hashes)).toHaveLength(4);
  for(const [name,expected] of Object.entries(hashes)) expect(createHash("sha256").update(readFileSync(name)).digest("hex")).toBe(expected);
});
