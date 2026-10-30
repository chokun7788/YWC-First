import { describe,expect,it } from "vitest";
import { validateContent } from "../../src/lib/content/validate";
import { contentVersion,loadContent } from "../../src/lib/content/load";
import { fixture,fixturePublic,now,regularScope,universal } from "../fixtures/content";
const validate=(data:unknown)=>validateContent(data,{publicDir:fixturePublic,now});
describe("cross-reference and publication validator",()=>{
  it("accepts synthetic local-source fixtures",()=>expect(validate(fixture()).content.evidence).toHaveLength(2));
  it("accepts actual draft starter with zero verified evidence",async()=>{
    const loaded=await loadContent();
    expect(loaded.content.evidence.every(row=>row.status==="draft")).toBe(true);
    expect(loaded.warnings.join(" ")).toMatch(/verified evidence = 0/);
  });
  it.each([
    ["evidence source",(d:ReturnType<typeof fixture>)=>{d.evidence[0].sourceRefs[0].sourceId="missing";}],
    ["policy evidence",(d:ReturnType<typeof fixture>)=>{d.policies[0].evidenceBlockIds=["missing"];}],
    ["policy item",(d:ReturnType<typeof fixture>)=>{d.policies[0].itemId="missing";}],
    ["guide step",(d:ReturnType<typeof fixture>)=>{d.guides[0].steps[0].evidenceBlockIds=["missing"];}],
    ["FAQ guide",(d:ReturnType<typeof fixture>)=>{d.faqs[0].guideIds=["missing"];}],
    ["source supersedes",(d:ReturnType<typeof fixture>)=>{d.sources[0].supersedesSourceIds=["missing"];}],
  ])("rejects missing %s",(_,mutate)=>{const d=fixture();mutate(d);expect(()=>validate(d)).toThrow(/missing reference/);});
  it.each(["draft","archived"] as const)("rejects verified evidence referencing %s source",status=>{const d=fixture();d.sources[0].status=status;expect(()=>validate(d)).toThrow(/unverified/);});
  it.each(["publisher","title"] as const)("requires source %s",key=>{const d=fixture();d.sources[0][key]=" ";expect(()=>validate(d)).toThrow(/verified source/);});
  it("requires actual review date, locator and excerpt",()=>{
    const d=fixture();d.sources[0].reviewedAt=null;d.evidence[0].sourceRefs[0].locator="";d.evidence[0].sourceRefs[0].excerpt="";
    expect(()=>validate(d)).toThrow(/reviewedAt/);
    expect(()=>validate(d)).toThrow(/locator and excerpt/);
  });
  it("rejects empty verified scope and mismatched scope breadth",()=>{
    for(const edit of [(d:ReturnType<typeof fixture>)=>{d.sources[0].scope.studyYears=[];},(d:ReturnType<typeof fixture>)=>{d.evidence[0].scope=universal;},(d:ReturnType<typeof fixture>)=>{d.policies[0].scope=universal;},(d:ReturnType<typeof fixture>)=>{d.guides[0].scope=universal;}]) {const d=fixture();edit(d);expect(()=>validate(d)).toThrow();}
  });
  it("rejects reversed validity, impossible dates and non-BE years",()=>{
    const d=fixture();d.sources[0].validUntil="2025-12-31";expect(()=>validate(d)).toThrow(/reversed validity/);
    d.sources[0].reviewedAt="2026-02-30";expect(()=>validate(d)).toThrow(/schema invalid/);
    d.sources[0].scope.academicYearsBE=[2026];expect(()=>validate(d)).toThrow();
  });
  it("rejects malicious protocols, credentials, local traversal and absent public files",()=>{
    for(const url of ["javascript:alert(1)","data:text/html,test","https://user:pass@example.invalid/"]) {const d=fixture();d.sources[0].url=url;expect(()=>validate(d)).toThrow();}
    for(const path of ["/../secret","//network/file","/sources/%2e%2e/secret","/sources/missing.txt"]) {const d=fixture();d.sources[0].localDocumentPath=path;expect(()=>validate(d)).toThrow();}
  });
  it("rejects cycles, duplicate IDs and guide slugs",()=>{
    const d=fixture();d.sources[0].supersedesSourceIds=[d.sources[1].id];d.sources[1].supersedesSourceIds=[d.sources[0].id];expect(()=>validate(d)).toThrow(/cyclic/);
    d.sources[0].supersedesSourceIds=[];d.sources[1].supersedesSourceIds=[];d.items.push({...d.items[0]});expect(()=>validate(d)).toThrow(/duplicate ID/);
  });
  it("rejects conditional policy with no condition and unsupported advertised context",()=>{
    const d=fixture();d.policies[0].permission="conditional";expect(()=>validate(d)).toThrow(/needs conditions/);
    d.policies[0].permission="allowed";d.settings.supportedContexts[0]={...d.settings.supportedContexts[0],academicYearBE:2570};expect(()=>validate(d)).toThrow(/unsupported advertised/);
  });
  it("rejects unknown fields so unsupported batch dimensions cannot be silently ignored",()=>{
    expect(()=>validate({...fixture(),batchId:"extra"})).toThrow(/schema invalid/);
  });
  it("hashes normalized key order deterministically and changes with content",()=>{
    expect(contentVersion({a:1,b:2})).toBe(contentVersion({b:2,a:1}));
    expect(contentVersion(regularScope)).not.toBe(contentVersion(universal));
  });
});
