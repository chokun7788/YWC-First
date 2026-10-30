export function gatewayConfigured(env:NodeJS.ProcessEnv){return !!(env.RD_READY_GATEWAY_URL&&env.RD_READY_GATEWAY_SECRET);}
export async function callGateway(env:NodeJS.ProcessEnv,body:unknown){
 const url=new URL(env.RD_READY_GATEWAY_URL!);if(url.protocol!=='https:')throw new Error('Secure gateway required');
 return fetch(url,{method:'POST',headers:{'content-type':'application/json','x-rd-ready-key':env.RD_READY_GATEWAY_SECRET!},body:JSON.stringify(body),signal:AbortSignal.timeout(8000)});
}
