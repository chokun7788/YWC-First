import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd();
const target=path.resolve(root,'../../.rd-ready-build/cloud-upload-'+new Date().toISOString().replace(/[:.]/g,'-'));
await fs.mkdir(target,{recursive:true});
const fixed=['package.json','package-lock.json','index.html','vite.config.mjs','tsconfig.json','vercel.json','server/cloud-handler.ts','server/cloud-data.ts','server/cloud-budget.ts','server/request.ts','server/provider-status.ts','server/research-data.ts','server/research-answer.ts','server/research-prompt.ts','data/deploy/knowledge-v1.json','data/deploy/manifest.json'];
const walk=async(dir)=>{const result=[];for(const entry of await fs.readdir(path.join(root,dir),{withFileTypes:true})){const relative=dir+'/'+entry.name;if(entry.isDirectory())result.push(...await walk(relative));else result.push(relative);}return result;};
const files=[...fixed,'server/cloud-gateway.ts','server/research-images.ts',...await walk('api'),...await walk('src'),...await walk('public')];
const manifest=[];
for(const file of files){
 if(/(?:^|\/)\.env|node_modules|\.local|\.vercel\//.test(file))throw new Error('Excluded file');
 const data=await fs.readFile(path.join(root,file));const dest=path.join(target,file);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,data);
 manifest.push({file,sha:createHash('sha1').update(data).digest('hex'),size:data.length});
}
await fs.writeFile(path.join(target,'upload-manifest.json'),JSON.stringify(manifest,null,2));
const info={target,files:files.length,bytes:manifest.reduce((sum,f)=>sum+f.size,0),manifest:path.join(target,'upload-manifest.json')};
await fs.writeFile('data/deploy/upload-info.json',JSON.stringify(info,null,2));
console.log(JSON.stringify(info));
