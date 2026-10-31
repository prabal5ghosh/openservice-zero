/**
 * Dependency-free local development server using Node 22.13+ (built-in node:sqlite).
 * Cloudflare Workers and D1 remain the zero-cost cloud deployment target.
 * Not production-hardened; bind to localhost by default.
 */
import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,existsSync} from 'node:fs';
import {resolve,extname,join} from 'node:path';
import {handleApi} from '../src/index.js';
const root=resolve(import.meta.dirname,'..');
const state=join(root,'.local');mkdirSync(state,{recursive:true});
const database=join(state,'openservice.sqlite');
const db=new DatabaseSync(database);
db.exec('PRAGMA foreign_keys=ON');
db.exec(readFileSync(join(root,'migrations/0001_schema.sql'),'utf8'));
const env={DB:{
 prepare(sql){return {bind(...params){return {
 first:async()=>db.prepare(sql).get(...params)??null,
 all:async()=>({results:db.prepare(sql).all(...params)}),
 run:async()=>db.prepare(sql).run(...params),
 _sql:sql,_params:params
 };}};},
 batch:async prepared=>{db.exec('BEGIN');try{for(const item of prepared)db.prepare(item._sql).run(...item._params);db.exec('COMMIT');return [];}catch(e){db.exec('ROLLBACK');throw e;}}
}};
const port=Number(process.env.PORT||8787);
const files={'/':'index.html','/index.html':'index.html','/styles.css':'styles.css','/app.js':'app.js'};
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const server=createServer(async(req,res)=>{
 try{
 const url=new URL(req.url,`http://localhost:${port}`);
 if(url.pathname.startsWith('/api/')){
   const parts=[];for await(const part of req){parts.push(part);if(parts.reduce((n,x)=>n+x.length,0)>128000){res.writeHead(413);res.end('Body too large');return;}}
   const body=Buffer.concat(parts);
   const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(', '):value);
   const request=new Request(url.toString(),{method:req.method,headers,body:body.length?body:undefined,duplex:'half'});
   const response=await handleApi(request,env);
   res.statusCode=response.status;response.headers.forEach((value,key)=>res.setHeader(key,value));
   res.setHeader('X-Frame-Options','DENY');
   res.end(Buffer.from(await response.arrayBuffer()));return;
 }
 const name=files[url.pathname];if(!name){res.writeHead(404);res.end('Not found');return;}
 const file=join(root,'public',name);if(!existsSync(file)){res.writeHead(404);res.end('Not found');return;}
 res.writeHead(200,{'Content-Type':mime[extname(name)],'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','X-Frame-Options':'DENY'});
 res.end(readFileSync(file));
 }catch(error){console.error(error);res.writeHead(500);res.end('Internal server error');}
});
server.listen(port,'127.0.0.1',()=>console.log(`OpenService Zero ready: http://localhost:${port}\nDatabase: ${database}\nStop with Ctrl+C`));
const shutdown=()=>{server.close();db.close();};
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
