import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {resolve} from 'node:path';
import {handleApi} from '../src/index.js';
const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys=ON');
db.exec(readFileSync(resolve('migrations/0001_schema.sql'),'utf8'));
const DB={
 prepare(sql){return {bind(...params){const item={sql,params};return {...item,
   first:async()=>db.prepare(sql).get(...params)??null,
   all:async()=>({results:db.prepare(sql).all(...params)}),
   run:async()=>db.prepare(sql).run(...params)
 };}};},
 batch:async statements=>{db.exec('BEGIN');try{for(const s of statements)db.prepare(s.sql).run(...s.params);db.exec('COMMIT');return [];}catch(e){db.exec('ROLLBACK');throw e;}}
};
const env={DB};
async function request(method,path,body,cookie){const req=new Request('https://service.example'+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});const response=await handleApi(req,env);const data=await response.json();return {response,data,cookie:(response.headers.get('set-cookie')||'').split(';')[0]};}
async function ok(method,path,body,cookie,status=200){const x=await request(method,path,body,cookie);assert.equal(x.response.status,status,`${method} ${path}: ${JSON.stringify(x.data)}`);return x;}
test('registration, tickets, isolation, approvals, updates, reports and audit',async()=>{
 try{
 const admin=await ok('POST','/api/auth/register',{organization:'Test Agency',name:'Owner A',email:'owner@test.example',password:'correct horse battery staple'},'',200);
 assert.match(admin.cookie,/os_session=/);
 const a=admin.cookie;
 const me=(await ok('GET','/api/auth/me',undefined,a)).data;
 assert.equal(me.user.role,'admin');
 const ws=(await ok('GET','/api/workspaces',undefined,a)).data.items;
 assert.equal(ws.length,5);
 const users=(await ok('POST','/api/users',{name:'Team Agent',email:'agent@test.example',role:'agent',password:'correct horse battery staple'},a,201)).data;
 assert.ok(users.id);
 const agent=await ok('POST','/api/auth/login',{organization:me.tenant.slug,email:'agent@test.example',password:'correct horse battery staple'},'',200);
 const created=await ok('POST','/api/tickets',{workspaceId:ws.find(x=>x.name==='IT').id,subject:'Internet is down',description:'Staff cannot connect',priority:'urgent',type:'incident'},agent.cookie,201);
 const id=created.data.id;
 const detail=await ok('GET',`/api/tickets/${id}`,undefined,a);
 assert.equal(detail.data.ticket.priority,'urgent');
 await ok('POST',`/api/tickets/${id}/comments`,{body:'We are investigating'},a,201);
 const listing=(await ok('GET','/api/tickets',undefined,a)).data;
 assert.equal(listing.items.length,1);
 await ok('PATCH',`/api/tickets/${id}`,{status:'in_progress',assigneeId:users.id},a);
 const catalog=(await ok('GET','/api/catalog',undefined,a)).data.items;
 assert.equal(catalog.length,6);
 const requestItem=catalog.find(x=>x.requires_approval===1);
 const req=await ok('POST','/api/tickets',{catalogItemId:requestItem.id,description:'Need a device',fields:{}},agent.cookie,201);
 const approvals=(await ok('GET','/api/approvals',undefined,a)).data.items;
 const pending=approvals.find(x=>x.ticket_id===req.data.id);
 assert.ok(pending);
 await ok('POST',`/api/approvals/${pending.id}/decision`,{decision:'approved'},a);
 const detail2=(await ok('GET',`/api/tickets/${req.data.id}`,undefined,agent.cookie)).data;
 assert.equal(detail2.ticket.status,'open');
 const report=(await ok('GET','/api/reports',undefined,a)).data;
 assert.equal(report.totals.reduce((n,w)=>n+w.total,0),2);
 assert.ok((await ok('GET','/api/audit',undefined,a)).data.items.length>=4);
 assert.equal((await request('GET','/api/assist',undefined,a)).response.status,404); // assist is POST only
 assert.equal((await ok('POST','/api/assist',{message:'Payroll reimbursement'},a)).data.suggestion.workspace,'Finance');
 const t2=await ok('POST','/api/auth/register',{organization:'Other Tenant',name:'Other Owner',email:'other@test.example',password:'correct horse battery staple'});
 const forbidden=await request('GET',`/api/tickets/${id}`,undefined,t2.cookie);
 assert.equal(forbidden.response.status,404,'Cross-tenant ticket access must fail');
 assert.equal((await ok('GET','/api/tickets',undefined,t2.cookie)).data.items.length,0);
 }finally{db.close();}
});
