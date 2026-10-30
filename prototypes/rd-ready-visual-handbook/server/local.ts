import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadEnvFile} from 'node:process';
import {answerQuestion,requestSchema} from './assistant';
const root=fileURLToPath(new URL('../',import.meta.url));
try{loadEnvFile(resolve(root,'.env.local'));}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw new Error('Cannot load local environment');}
const port=Number(process.env.PORT??4175);
const hosts=new Set([`127.0.0.1:${port}`,`localhost:${port}`]);
const origins=new Set([...hosts].map(h=>`http://${h}`).concat(['http://127.0.0.1:4174','http://localhost:4174']));
let queue:Promise<unknown>=Promise.resolve();let active=0;let minute=0,hits=0;
async function reserve(){
  const job=queue.then(async()=>{
    const limit=Math.min(1000,Math.max(0,Number(process.env.GEMINI_LOCAL_DAILY_CALLS??20)||0));
    const day=new Date().toISOString().slice(0,10),dir=resolve(root,'.local');await mkdir(dir,{recursive:true});
    const path=resolve(dir,`usage-${day}.json`);let count=0;
    try{const value=JSON.parse(await readFile(path,'utf8'));if(!Number.isSafeInteger(value.calls)||value.calls<0)return false;count=value.calls;}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')return false;}
    if(count>=limit)return false;
    await writeFile(path,JSON.stringify({calls:count+1}));return true;
  }).catch(()=>false);queue=job;return job;
}
const mime:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf','.svg':'image/svg+xml','.txt':'text/plain'};
const server=createServer(async(req,res)=>{
  const json=(status:number,value:unknown)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value));};
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  if(!hosts.has(req.headers.host??'')){json(403,{error:'invalid_host'});return;}
  const pathname=new URL(req.url??'/',`http://127.0.0.1:${port}`).pathname;
  try{
    if(pathname==='/api/health'&&req.method==='GET'){json(200,{ok:true,assistantMode:process.env.GEMINI_ENABLED==='true'&&!!process.env.GEMINI_API_KEY?'gemini_configured':'local',researchMode:process.env.RD_READY_RESEARCH_MODE==='true',publicAiEnabled:false});return;}
    if(pathname==='/api/assistant'){
      if(req.method!=='POST'){json(405,{error:'method_not_allowed'});return;}
      if(!origins.has(req.headers.origin??'')){json(403,{error:'invalid_origin'});return;}
      if(!req.headers['content-type']?.startsWith('application/json')){json(415,{error:'json_required'});return;}
      const current=Math.floor(Date.now()/60000);if(current!==minute){minute=current;hits=0;}
      if(++hits>30||active>=2){json(429,{error:'usage_limit'});return;}
      let body='',size=0;for await(const chunk of req){size+=Buffer.byteLength(chunk);if(size>8192){json(413,{error:'request_too_large'});return;}body+=chunk;}
      let value:unknown;try{value=JSON.parse(body);}catch{json(400,{error:'invalid_json'});return;}
      const parsed=requestSchema.safeParse(value);if(!parsed.success){json(400,{error:'invalid_request'});return;}
      active++;try{json(200,await answerQuestion(parsed.data,{reserve}));}finally{active--;}
      return;
    }
    if(pathname.startsWith('/api/')){json(404,{error:'not_found'});return;}
    if(req.method!=='GET'&&req.method!=='HEAD'){json(405,{error:'method_not_allowed'});return;}
    const base=resolve(root,'dist/client');let path=resolve(base,'.'+decodeURIComponent(pathname));
    if(path!==base&&!path.startsWith(base+sep)){json(404,{error:'not_found'});return;}
    if(path===base)path=resolve(base,'index.html');
    try{if(!(await stat(path)).isFile())throw new Error('missing');}catch{if(extname(path)){json(404,{error:'not_found'});return;}path=resolve(base,'index.html');}
    const data=await readFile(path);res.writeHead(200,{'content-type':mime[extname(path)]??'application/octet-stream','cache-control':'no-store'});res.end(req.method==='HEAD'?undefined:data);
  }catch{if(!res.headersSent)json(503,{error:'temporarily_unavailable'});else res.end();}
});
server.requestTimeout=30000;
server.headersTimeout=15000;
server.listen(port,'127.0.0.1',()=>console.log(`RD Ready local server: http://127.0.0.1:${port}/ (public AI disabled)`));
