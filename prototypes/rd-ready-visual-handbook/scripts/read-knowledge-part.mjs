import fs from 'node:fs';
import {createHash} from 'node:crypto';
const text=fs.readFileSync('data/deploy/knowledge-v1.json','utf8');
const offset=Number(process.argv[2]??0);if(!Number.isInteger(offset)||offset<0)throw new Error('Invalid offset');
console.log(JSON.stringify({characters:text.length,sha256:createHash('sha256').update(text).digest('hex'),text:text.slice(offset,offset+6000)}));
