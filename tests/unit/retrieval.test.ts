import { describe,expect,it } from "vitest";
import { retrieve,normalize } from "../../src/lib/content/retrieve";
import { fixture,addPolicy,regularContext,fieldContext,now } from "../fixtures/content";
describe("bounded keyword retrieval",()=>{
  it("filters scope before returning candidates and preserves exact aliases",()=>{
    const result=retrieve(fixture(),"  TEST   ALPHA  ",fieldContext,[],now);
    expect(result.evidence.map(e=>e.id)).toEqual(["ev-test-field"]);expect(result.itemIds).toEqual(["item-test-alpha"]);
  });
  it("normalizes Unicode and whitespace without dropping punctuation",()=>expect(normalize("  E\u0301  รด. ")).toBe("é รด."));
  it.each(["ปี","ของ","ไป"])("does not retrieve from short token %s",message=>expect(retrieve(fixture(),message,regularContext,[],now).evidence).toEqual([]));
  it("excludes unpublished catalog placeholders",()=>{
    const d=fixture();d.policies.forEach(p=>p.status="draft");expect(retrieve(d,"เทสต์อัลฟา",regularContext,[],now).itemIds).toEqual([]);
  });
  it("caps blocks at 8 and complete evidence payload at 12000 characters",()=>{
    const d=fixture();for(let i=0;i<20;i++)addPolicy(d,`payload-${i}`).block.text="TEST ONLY "+"x".repeat(1800);
    const result=retrieve(d,"เทสต์อัลฟา",regularContext,[],now);
    expect(result.evidence.length).toBeLessThanOrEqual(8);
    expect(result.evidence.reduce((n,b)=>n+b.title.length+b.text.length+b.sourceRefs.reduce((m,r)=>m+r.locator.length+r.excerpt.length,0),0)).toBeLessThanOrEqual(12000);
  });
});
