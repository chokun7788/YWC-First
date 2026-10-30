// TEST ONLY: synthetic data. No actual RD rules, publishers, review dates or public URLs.
import type { Content, EvidenceBlock, ItemPolicy, Source } from "../../src/lib/schemas/content";
import type { Scope, TrainingContext } from "../../src/lib/schemas/context";
export const now = new Date("2026-06-15T12:00:00Z"); // Fixed test clock, never an actual review date.
export const fixturePublic = new URL("./public", import.meta.url).pathname.replace(/^\/([A-Z]:)/,"$1");
export const universal: Scope = {centerIds:"*",locationIds:"*",trainingTypes:"*",studyYears:"*",academicYearsBE:"*",uniformGroups:"*"};
export const regularContext: TrainingContext = {centerId:"test-center",locationId:"test-regular",trainingType:"regular",studyYear:2,academicYearBE:2569,uniformGroup:"male_uniform"};
export const regularScope: Scope = {centerIds:["test-center"],locationIds:["test-regular"],trainingTypes:["regular"],studyYears:[2],academicYearsBE:[2569],uniformGroups:"*"};
export const fieldContext: TrainingContext = {...regularContext,locationId:"test-field",trainingType:"field"};
export const fieldScope: Scope = {...regularScope,locationIds:["test-field"],trainingTypes:["field"]};
export function makeSource(id:string, scope:Scope=regularScope): Source {
  return {id,title:`TEST ONLY ${id}`,publisher:"TEST ONLY synthetic publisher",url:null,localDocumentPath:"/sources/test-only.txt",publishedAt:"2026-01-01",reviewedAt:"2026-01-02",validFrom:"2026-01-01",validUntil:"2026-12-31",scope:structuredClone(scope),kind:"official",status:"verified",supersedesSourceIds:[],rightsNote:"TEST ONLY"};
}
export function makeBlock(id:string, sourceId:string, scope:Scope=regularScope): EvidenceBlock {
  return {id,title:`TEST ONLY ${id}`,topic:"test-policy",text:`TEST ONLY synthetic evidence ${id}; not an RD rule.`,keywords:["เทสต์อัลฟา"],scope:structuredClone(scope),sourceRefs:[{sourceId,locator:"TEST ONLY line 3",excerpt:`TEST ONLY excerpt ${id}`}],status:"verified",kind:"requirement"};
}
export function makePolicy(id:string,itemId:string,blockId:string,scope:Scope=regularScope,permission:ItemPolicy["permission"]="allowed"): ItemPolicy {
  return {id,itemId,scope:structuredClone(scope),permission,preparation:"not_specified",conditions:[],evidenceBlockIds:[blockId],status:"verified",supersedesPolicyIds:[]};
}
export function fixture(): Content {
  return {
    settings:{projectName:"TEST ONLY",contentMode:"verified_only",centers:[{id:"test-center",label:"TEST ONLY center",officialName:"TEST ONLY center",verified:true},{id:"other-center",label:"TEST ONLY other center",officialName:"TEST ONLY other center",verified:true}],locations:[{id:"test-regular",label:"TEST ONLY regular",verified:true},{id:"test-field",label:"TEST ONLY field",verified:true}],supportedContexts:[regularContext,fieldContext],contactUrl:null},
    sources:[makeSource("src-test-regular"),makeSource("src-test-field",fieldScope)],
    evidence:[makeBlock("ev-test-regular","src-test-regular"),makeBlock("ev-test-field","src-test-field",fieldScope)],
    items:[{id:"item-test-alpha",label:"TEST ONLY alpha",aliases:["เทสต์อัลฟา","test alpha"],categoryId:"test-items",imagePath:null}],
    policies:[makePolicy("policy-test-regular","item-test-alpha","ev-test-regular"),makePolicy("policy-test-field","item-test-alpha","ev-test-field",fieldScope,"prohibited")],
    guides:[{id:"guide-test-alpha",slug:"test-only-guide",title:"TEST ONLY guide alpha",summary:"TEST ONLY synthetic summary",scope:regularScope,status:"verified",steps:[{title:"TEST ONLY synthetic step",evidenceBlockIds:["ev-test-regular"],imagePath:null,alt:null}],relatedItemIds:["item-test-alpha"],videoLinks:[],evidenceBlockIds:["ev-test-regular"]}],
    faqs:[{id:"faq-test-alpha",questions:["เทสต์คำถามอัลฟา"],intent:"item_policy",evidenceBlockIds:["ev-test-regular"],guideIds:["guide-test-alpha"],itemIds:["item-test-alpha"],status:"verified"}],
  };
}
export function addPolicy(data:Content, suffix:string, options:{scope?:Scope;permission?:ItemPolicy["permission"];preparation?:ItemPolicy["preparation"]}={}) {
  const scope=options.scope||regularScope, source=makeSource(`src-test-${suffix}`,scope), block=makeBlock(`ev-test-${suffix}`,source.id,scope), policy=makePolicy(`policy-test-${suffix}`,"item-test-alpha",block.id,scope,options.permission);
  policy.preparation=options.preparation||"not_specified";
  data.sources.push(source);data.evidence.push(block);data.policies.push(policy);
  return {source,block,policy};
}
