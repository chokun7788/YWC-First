import type {IncomingMessage,ServerResponse} from 'node:http';
export default function handler(_req:IncomingMessage,res:ServerResponse){res.writeHead(404,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify({error:'not_found'}));}
