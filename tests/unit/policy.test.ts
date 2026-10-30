import { describe,expect,it } from "vitest";
import { resolvePolicy } from "../../src/lib/content/resolve-policy";
import { fixture,addPolicy,regularContext,fieldContext,universal,now } from "../fixtures/content";
const run=(d=fixture(),context=regularContext)=>resolvePolicy(d,"item-test-alpha",context,now);
describe("deterministic policy resolver",()=>{
  it("keeps regular allowed distinct from field prohibited",()=>{
    expect(run().permission).toBe("allowed");expect(run(fixture(),fieldContext).permission).toBe("prohibited");
  });
  it.each([{academicYearBE:2568},{centerId:"other-center"},{locationId:"test-field"},{studyYear:1 as const}])("does not borrow a rule across context %j",diff=>expect(run(fixture(),{...regularContext,...diff}).state).toBe("unknown"));
  it("asks for missing context instead of applying a matching universal rule alone",()=>{
    const d=fixture();addPolicy(d,"general",{scope:universal,permission:"prohibited"});
    expect(run(d,{...regularContext,academicYearBE:null}).state).toBe("needs_context");
  });
  it.each(["draft","archived"] as const)("excludes %s policies, evidence and sources",status=>{
    const a=fixture();a.policies[0].status=status;expect(run(a).state).toBe("unknown");
    const b=fixture();b.evidence[0].status=status;expect(run(b).state).toBe("unknown");
    const c=fixture();c.sources[0].status=status;expect(run(c).state).toBe("unknown");
  });
  it("excludes expired and not-yet-valid evidence and honors inclusive date boundaries",()=>{
    const d=fixture();d.sources[0].validUntil="2026-06-14";expect(run(d).state).toBe("expired");
    d.sources[0].validUntil="2026-06-15";expect(run(d).state).toBe("resolved");
    d.sources[0].validFrom="2026-06-16";expect(run(d).state).toBe("expired");
  });
  it("honors exact ISO timestamp validity within the same day",()=>{
    const d=fixture();d.sources[0].validUntil="2026-06-15T11:59:59Z";expect(run(d).state).toBe("expired");
    d.sources[0].validUntil="2026-06-15T12:00:00Z";expect(run(d).state).toBe("resolved");
    d.sources[0].validFrom="2026-06-15T12:00:01Z";expect(run(d).state).toBe("expired");
  });
  it("does not silently infer permission from preparation",()=>{
    for(const preparation of ["required","recommended"] as const) {const d=fixture();d.policies[0].permission="not_specified";d.policies[0].preparation=preparation;expect(run(d)).toMatchObject({permission:"not_specified",preparation});}
  });
  it("returns unknown for missing evidence and empty policies",()=>{
    const d=fixture();d.policies[0].evidenceBlockIds=["missing"];expect(run(d).state).toBe("unknown");
    expect(resolvePolicy(fixture(),"nonexistent",regularContext,now).permission).toBe("unknown");
  });
  it("requires verified support covering the policy's full scope",()=>{
    const d=fixture();d.policies[0].scope=universal;expect(run(d).state).toBe("unknown");
  });
  it("preserves conflicts even when a source has a newer publication date",()=>{
    const d=fixture();const other=addPolicy(d,"conflicting",{permission:"prohibited"});other.source.publishedAt="2026-06-01";
    expect(run(d)).toMatchObject({state:"conflict",permission:"conflict",preparation:"not_specified"});expect(run(d).evidenceBlockIds).toHaveLength(2);
  });
  it("treats general/specific disagreement and changed conditions as conflict",()=>{
    const d=fixture();addPolicy(d,"general",{scope:universal,permission:"prohibited"});expect(run(d).state).toBe("conflict");
    const c=fixture();addPolicy(c,"condition").policy.conditions=["TEST ONLY condition"];expect(run(c).state).toBe("conflict");
  });
  it("only explicit active supersedes resolves a conflict, including transitive relations",()=>{
    const d=fixture();const b=addPolicy(d,"replacement",{permission:"prohibited"});b.policy.supersedesPolicyIds=[d.policies[0].id];expect(run(d).permission).toBe("prohibited");
    const c=addPolicy(d,"third",{permission:"conditional"});c.policy.conditions=["TEST ONLY condition"];c.policy.supersedesPolicyIds=[b.policy.id];expect(run(d).permission).toBe("conditional");
    c.source.validUntil="2025-12-31";expect(run(d).permission).toBe("prohibited");
  });
  it("source supersedes invalidates old evidence only within the replacement context",()=>{
    const d=fixture();const other=addPolicy(d,"source-replacement",{permission:"prohibited"});other.source.supersedesSourceIds=[d.sources[0].id];expect(run(d).permission).toBe("prohibited");
    const f=fixture();f.sources[1].supersedesSourceIds=[f.sources[0].id];expect(run(f).permission).toBe("allowed");
  });
  it("universal verified evidence is usable with no context",()=>{
    const d=fixture();const p=addPolicy(d,"universal",{scope:universal});
    d.policies=[p.policy];d.evidence=[p.block];d.sources=[p.source];
    expect(run(d,{centerId:null,locationId:null,trainingType:null,studyYear:null,academicYearBE:null,uniformGroup:"unspecified"}).state).toBe("resolved");
  });
});
