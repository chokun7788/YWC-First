import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import {gatewayConfigured,callGateway} from './cloud-gateway.js';
export function sharedBudgetConfigured(env:NodeJS.ProcessEnv){return !!((gatewayConfigured(env)||(env.SUPABASE_URL&&env.SUPABASE_SERVICE_ROLE_KEY))&&env.RD_READY_SESSION_SECRET&&env.RD_READY_SESSION_SECRET.length>=32);}
export function sessionIdentity(cookie:string,ip:string,secret:string){
 const mac=(value:string)=>createHmac('sha256',secret).update(value).digest('hex');
 const supplied=cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith('rd_ready_session='))?.slice(17)??'';
 const [candidate,signature]=supplied.split('.');let session=randomUUID();
 if(/^[0-9a-f-]{36}$/.test(candidate??'')&&/^[0-9a-f]{64}$/.test(signature??'')){
  const expected=mac(candidate);if(timingSafeEqual(Buffer.from(expected),Buffer.from(signature)))session=candidate as `${string}-${string}-${string}-${string}-${string}`;
 }
 return {sessionHash:mac('session:'+session),ipHash:mac('ip:'+ip),cookie:`rd_ready_session=${session}.${mac(session)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`};
}
export async function reserveCloudUsage(env:NodeJS.ProcessEnv,identity:{sessionHash:string;ipHash:string}):Promise<boolean>{
 if(!sharedBudgetConfigured(env))return false;
 const daily=Math.min(1000,Math.max(0,Number(env.GEMINI_CLOUD_DAILY_CALLS??20)||0));if(!daily)return false;
 try{
  if(gatewayConfigured(env)){const response=await callGateway(env,{action:'reserve',...identity,dailyLimit:daily});return response.ok&&(await response.json())===true;}
  const url=new URL('/rest/v1/rpc/rd_ready_reserve_usage',env.SUPABASE_URL);
  const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json',apikey:env.SUPABASE_SERVICE_ROLE_KEY!,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY},body:JSON.stringify({p_session_hash:identity.sessionHash,p_ip_hash:identity.ipHash,p_daily_limit:daily,p_session_limit:8,p_minute_limit:5}),signal:AbortSignal.timeout(3000)});
  return response.ok&&(await response.json())===true;
 }catch{return false;}
}
