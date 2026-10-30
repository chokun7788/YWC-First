import type {Content} from '../../../src/lib/schemas/content';
import type {TrainingContext} from '../../../src/lib/schemas/context';
import {evaluateEvidence} from '../../../src/lib/content/eligibility';
import {retrieve} from '../../../src/lib/content/retrieve';
import {matchScope} from '../../../src/lib/content/scope';
import {rankSearch} from '../src/search';

export type KnowledgeRecord={id:string;title:string;text:string;keywords:string[];itemIds:string[];lookupLabels:string[];sources:{id:string;title:string;publisher:string;url:string;locator:string;excerpt:string}[]};
export function retrieveKnowledge(content:Content,question:string,context:TrainingContext){
  const eligible=content.evidence.flatMap(block=>{
    const result=evaluateEvidence(content,block,context);
    if(result.state!=='match')return [];
    const itemIds=content.policies.filter(p=>p.status==='verified'&&p.evidenceBlockIds.includes(block.id)&&matchScope(p.scope,context).state==='match').map(p=>p.itemId);
    const labels=content.items.filter(item=>itemIds.includes(item.id)).flatMap(item=>[item.label,...item.aliases]);
    return [{id:block.id,title:block.title,text:block.text,keywords:block.keywords,itemIds,lookupLabels:labels,sources:result.refs.map(ref=>{
      const source=content.sources.find(s=>s.id===ref.sourceId)!;
      return {id:source.id,title:source.title,publisher:source.publisher,url:(source.url||source.localDocumentPath)!,locator:ref.locator,excerpt:ref.excerpt};
    })}];
  });
  const exact=retrieve(content,question,context).evidence.map(b=>b.id);
  const ranked=rankSearch(eligible.map(row=>({...row,aliases:[...row.keywords,...row.lookupLabels]})),question);
  // Small approved corpus: include other eligible records for semantic selection
  // when lexical matching misses a paraphrase. Scope/date/approval filtering is first.
  const order=[...new Set([...exact,...ranked.map(r=>r.id),...eligible.map(r=>r.id)])];
  const records:KnowledgeRecord[]=[];let size=0;
  for(const id of order){const record=eligible.find(row=>row.id===id)!;const bytes=JSON.stringify(record).length;if(records.length>=20)break;if(size+bytes>12000)continue;records.push(record);size+=bytes;}
  return {records,verifiedTotal:content.evidence.filter(b=>b.status==='verified').length,eligibleCount:eligible.length};
}
