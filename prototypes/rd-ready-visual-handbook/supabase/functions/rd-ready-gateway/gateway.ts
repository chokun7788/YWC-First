type Config={keyHash:string;supabaseUrl:string;serviceKey:string;fetchImpl?:typeof fetch};
const hex=(bytes:ArrayBuffer)=>Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('');
export function createGatewayHandler(config:Config){
 return async(req:Request):Promise<Response>=>{
  const json=(status:number,value:unknown)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
  if(req.method!=='POST')return json(405,{error:'method_not_allowed'});
  const key=req.headers.get('x-rd-ready-key')??'';
  if(key.length<32||key.length>128||!config.keyHash||!config.serviceKey)return json(401,{error:'unauthorized'});
  const actual=hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key)));
  let difference=actual.length^config.keyHash.length;for(let i=0;i<actual.length;i++)difference|=actual.charCodeAt(i)^config.keyHash.charCodeAt(i);
  if(difference!==0)return json(401,{error:'unauthorized'});
  try{
   const reader=req.body?.getReader();if(!reader)return json(400,{error:'invalid_request'});
   const chunks:Uint8Array[]=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();return json(413,{error:'request_too_large'});}chunks.push(value);}
   const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
   const body=JSON.parse(new TextDecoder().decode(bytes));
   const headers={'content-type':'application/json',apikey:config.serviceKey,Authorization:'Bearer '+config.serviceKey};
   const send=config.fetchImpl??fetch;let url:URL;let options:RequestInit;
   if(body.action==='knowledge'&&/^[a-f0-9]{64}$/.test(body.version??'')){
    url=new URL('/rest/v1/rd_ready_releases',config.supabaseUrl);url.searchParams.set('version','eq.'+body.version);url.searchParams.set('select','bundle');url.searchParams.set('limit','1');options={headers};
   }else if(body.action==='reserve'&&/^[a-f0-9]{64}$/.test(body.sessionHash??'')&&/^[a-f0-9]{64}$/.test(body.ipHash??'')&&Number.isInteger(body.dailyLimit)&&body.dailyLimit>0){
    url=new URL('/rest/v1/rpc/rd_ready_reserve_usage',config.supabaseUrl);options={method:'POST',headers,body:JSON.stringify({p_session_hash:body.sessionHash,p_ip_hash:body.ipHash,p_daily_limit:Math.min(20,body.dailyLimit),p_session_limit:8,p_minute_limit:5})};
   }else return json(400,{error:'invalid_request'});
   const response=await send(url,{...options,signal:AbortSignal.timeout(5000)});if(!response.ok)return json(503,{error:'database_unavailable'});
   const result=await response.json();
   if(body.action==='reserve')return typeof result==='boolean'?json(200,result):json(503,{error:'invalid_database_response'});
   return result[0]?.bundle?json(200,result[0].bundle):json(404,{error:'version_not_found'});
  }catch{return json(503,{error:'gateway_unavailable'});}
 };
}
