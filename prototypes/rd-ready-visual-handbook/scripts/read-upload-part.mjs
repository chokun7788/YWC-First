import fs from 'node:fs';
import path from 'node:path';
const info=JSON.parse(fs.readFileSync('data/deploy/upload-info.json','utf8'));
const manifest=JSON.parse(fs.readFileSync(info.manifest,'utf8'));
if(process.argv[2]==='manifest'){console.log(JSON.stringify(manifest));}else{
 const index=Number(process.argv[2]),offset=Number(process.argv[3]);
 if(!Number.isInteger(index)||!Number.isInteger(offset)||offset<0||!manifest[index])throw new Error('Invalid index');
 const entry=manifest[index];const resolved=path.resolve(info.target,entry.file);
 if(!resolved.startsWith(path.resolve(info.target)+path.sep))throw new Error('Invalid path');
 const data=fs.readFileSync(resolved);console.log(JSON.stringify({data:data.subarray(offset,offset+32766).toString('base64')}));
}
