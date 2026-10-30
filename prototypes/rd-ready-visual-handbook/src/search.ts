import MiniSearch from 'minisearch';
export type SearchRow={id:string;title:string;text:string;aliases?:string[]};
const segmenter=new Intl.Segmenter('th',{granularity:'word'});
const stop=new Set(['ครับ','ค่ะ','คะ','หน่อย','ขอ','อยาก','ทราบ','ว่า','ต้อง','ทำ','ยังไง','อย่างไร','อะไร','ได้','ไหม','หรือ','ไป','ที่','ใน','มี','ช่วย','การ','เอา','นำ','พก','พกพา','สามารถ','มั้ย','มั๊ย','ปะ','ป่ะ','ควร','บ้าง','ยัง','ไง']);
export function tokens(text:string){return [...segmenter.segment(text.normalize('NFKC').toLowerCase())].filter(s=>s.isWordLike&&(s.segment.length>1||/^\d$/.test(s.segment))&&!stop.has(s.segment)).map(s=>s.segment);}
const norm=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[\s\u200b–—.-]/gu,'');
export function rankSearch<T extends SearchRow>(rows:T[],query:string):T[]{
  if(!query.trim())return rows;
  const direct=rows.filter(r=>norm([r.title,r.text,...r.aliases??[]].join(' ')).includes(norm(query)));
  if(direct.length)return direct;
  const terms=tokens(query);if(!terms.length)return [];
  const index=new MiniSearch({fields:['title','text','aliases'],storeFields:[],tokenize:tokens,processTerm:term=>term.toLowerCase(),extractField:(doc,field)=>Array.isArray(doc[field])?doc[field].join(' '):doc[field]});
  index.addAll(rows);
  const results=index.search(terms.join(' '),{prefix:true,fuzzy:term=>term.length>=4?.2:false,boost:{title:4,aliases:4,text:1},combineWith:'OR'});
  return results.filter(r=>r.score>=(results[0]?.score??0)*.4).slice(0,20).flatMap(r=>{const row=rows.find(v=>v.id===r.id);return row?[row]:[];});
}
