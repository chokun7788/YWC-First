// Authorized owner-account deployment. Never print credentials or raw provider errors.
import fs from 'node:fs/promises';
import path from 'node:path';
import {parseEnv} from 'node:util';
import {createHash} from 'node:crypto';
const root=process.cwd(),teamId='team_Ejvf6g4RFBBKRyhIgUU39Nb2',name='rd-ready-preview';
const auth=JSON.parse(await fs.readFile('.local/vercel-cli/auth.json','utf8'));
async function api(route,options={}){
 const url=new URL(route,'https://api.vercel.com');if(url.pathname!=='/v2/user')url.searchParams.set('teamId',teamId);
 const response=await fetch(url,{...options,headers:{Authorization:'Bearer '+auth.token,...options.headers},signal:AbortSignal.timeout(60000)});
 const text=await response.text();let body;try{body=JSON.parse(text);}catch{body={};}
 if(!response.ok)throw new Error(`Vercel ${url.pathname}: HTTP${response.status} ${body.error?.code??''}`);
 return body;
}
const user=await api('/v2/user');if(user.user?.username!=='chokun7788')throw new Error('Owner account mismatch');
const project=await api('/v9/projects/'+name);if(project.accountId!==teamId)throw new Error('Project owner mismatch');
const command=process.argv[2];
if(command==='setup'){
 const previous=await fs.readFile('.vercel/project.json','utf8');await fs.writeFile('.local/previous-vercel-project.json',previous);
 await fs.writeFile('.vercel/project.json',JSON.stringify({projectId:project.id,orgId:teamId,projectName:name}));
 const local=parseEnv(await fs.readFile('.env.local','utf8')),secret=JSON.parse(await fs.readFile('.local/cloud-secrets.json','utf8')),manifest=JSON.parse(await fs.readFile('data/deploy/manifest.json','utf8'));
 if(!local.GEMINI_API_KEY||!secret.gatewaySecret||!secret.sessionSecret)throw new Error('Required server secret missing');
 const values={GEMINI_ENABLED:'true',GEMINI_MODEL:local.GEMINI_MODEL,GEMINI_API_KEY:local.GEMINI_API_KEY,GEMINI_CLOUD_DAILY_CALLS:'20',RD_READY_RESEARCH_MODE:'true',RD_READY_DATA_MODE:'supabase',RD_READY_DATA_VERSION:manifest.sha256,RD_READY_GATEWAY_URL:'https://socwfxnmblepifjshpfn.supabase.co/functions/v1/rd-ready-gateway',RD_READY_GATEWAY_SECRET:secret.gatewaySecret,RD_READY_SESSION_SECRET:secret.sessionSecret};
 await api(`/v10/projects/${project.id}/env?upsert=true`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.entries(values).map(([key,value])=>({key,value,type:'encrypted',target:['preview','production']})))});
 console.log(JSON.stringify({account:user.user.username,project:project.id,team:teamId,configuredKeys:Object.keys(values),protection:project.ssoProtection}));
}else if(command==='pin-data'){
 const manifest=JSON.parse(await fs.readFile('data/deploy/manifest.json','utf8'));
 await api(`/v10/projects/${project.id}/env?upsert=true`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:'RD_READY_DATA_VERSION',value:manifest.sha256,type:'encrypted',target:['preview','production']})});
 console.log(JSON.stringify({project:project.id,dataVersion:manifest.sha256}));
}else if(command==='deploy'){
 const info=JSON.parse(await fs.readFile('data/deploy/upload-info.json','utf8'));const files=JSON.parse(await fs.readFile(info.manifest,'utf8'));
 for(let i=0;i<files.length;i+=5)await Promise.all(files.slice(i,i+5).map(async file=>{
  const absolute=path.resolve(info.target,file.file);if(!absolute.startsWith(path.resolve(info.target)+path.sep))throw new Error('Invalid upload path');
  const data=await fs.readFile(absolute);if(createHash('sha1').update(data).digest('hex')!==file.sha)throw new Error('Upload changed');
  await api('/v2/files',{method:'POST',headers:{'content-type':'application/octet-stream','x-vercel-digest':file.sha,'content-length':String(data.length)},body:data});
 }));
 const deployment=await api('/v13/deployments?skipAutoDetectionConfirmation=1',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,project:project.id,target:'production',files,projectSettings:{framework:'vite',buildCommand:'npm run build:cloud',installCommand:'npm ci',outputDirectory:'dist/client',nodeVersion:'24.x'}})});
 const result={id:deployment.id,url:'https://'+deployment.url,projectId:project.id,teamId,state:deployment.readyState};await fs.writeFile('.local/owner-deployment.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}else if(command==='status'){
 const current=JSON.parse(await fs.readFile('.local/owner-deployment.json','utf8'));const d=await api('/v13/deployments/'+current.id);console.log(JSON.stringify({id:d.id,url:'https://'+d.url,state:d.readyState,errorCode:d.errorCode,aliases:d.alias}));
}else throw new Error('Expected setup, pin-data, deploy or status');
