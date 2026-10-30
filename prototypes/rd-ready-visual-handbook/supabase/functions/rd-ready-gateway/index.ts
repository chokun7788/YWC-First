import {createGatewayHandler} from './gateway.ts';
// Deployment substitutes a SHA-256 digest only. The raw application key stays in encrypted Vercel env.
const keyHash='DEPLOYMENT_KEY_HASH';
Deno.serve(createGatewayHandler({keyHash,supabaseUrl:Deno.env.get('SUPABASE_URL')??'',serviceKey:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??''}));
