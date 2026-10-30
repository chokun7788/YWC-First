import { describe,expect,it } from "vitest";
import { matchScope,scopeWithin } from "../../src/lib/content/scope";
import { emptyContext } from "../../src/lib/schemas/context";
import { regularScope,regularContext,fieldContext,universal } from "../fixtures/content";
describe("six hard scope filters",()=>{
  it("matches the exact declared context",()=>expect(matchScope(regularScope,regularContext).state).toBe("match"));
  it.each([
    {centerId:"other-center"},{locationId:"test-field"},{trainingType:"field" as const},
    {studyYear:1 as const},{academicYearBE:2568},
  ])("rejects mismatched dimensions %j",difference=>expect(matchScope(regularScope,{...regularContext,...difference}).state).toBe("mismatch"));
  it("never merges regular and field because the center matches",()=>expect(matchScope(regularScope,fieldContext).state).toBe("mismatch"));
  it("handles uniform group independently from any demographic",()=>{
    const scope={...regularScope,uniformGroups:["male_uniform" as const]};
    expect(matchScope(scope,{...regularContext,uniformGroup:"female_uniform"}).state).toBe("mismatch");
    expect(matchScope(scope,{...regularContext,uniformGroup:"unspecified"})).toEqual({state:"needs_context",missing:["uniformGroup"]});
  });
  it("does not guess missing context; mismatch wins over missing",()=>{
    expect(matchScope(regularScope,{...regularContext,academicYearBE:null})).toEqual({state:"needs_context",missing:["academicYearBE"]});
    expect(matchScope(regularScope,{...emptyContext,centerId:"other-center"}).state).toBe("mismatch");
  });
  it("only an explicit wildcard supports incomplete context",()=>{
    expect(matchScope(universal,emptyContext).state).toBe("match");
    expect(matchScope({...universal,studyYears:[]},emptyContext).state).toBe("mismatch");
  });
  it("prevents broader facts than their supporting scope",()=>{
    expect(scopeWithin(regularScope,universal)).toBe(true);
    expect(scopeWithin(universal,regularScope)).toBe(false);
    expect(scopeWithin({...regularScope,academicYearsBE:[2568,2569]},regularScope)).toBe(false);
  });
});
