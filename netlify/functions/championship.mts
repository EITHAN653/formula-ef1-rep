import type { Context } from '@netlify/functions';
import { drizzle } from 'drizzle-orm/netlify-db';
import { eq, and, gt, desc } from 'drizzle-orm';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import * as schema from '../../db/schema.js';
import { teams, rounds } from '../../public/data.js';
export default async (req: Request, context: Context) => {
 const db = drizzle({schema});
 const reply = (data: unknown, status=200) => Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
 const hash = (s:string) => createHash('sha256').update(s).digest('hex');
 const cookie = context.cookies.get('ef1_session');
 const authorized = async () => cookie && (await db.select().from(schema.sessions).where(and(eq(schema.sessions.tokenHash,hash(cookie)),gt(schema.sessions.expiresAt,new Date())))).length>0;
 try {
 if(req.method==='GET') return reply({results:await db.select().from(schema.results),adjustments:await db.select().from(schema.adjustments),news:await db.select().from(schema.news).orderBy(desc(schema.news.createdAt)),authenticated:!!await authorized()});
 if(req.method!=='POST') return reply({error:'Method not allowed'},405);
 if(req.headers.get('origin')!==new URL(req.url).origin) return reply({error:'Invalid request origin'},403);
 const b = await req.json();
 if(b.action==='login') {
 const secret=Netlify.env.get('FIA_ADMIN_PASSCODE');
 if(!secret) return reply({error:'Administrator access is not configured yet.'},503);
 if(typeof b.passcode!=='string' || !timingSafeEqual(Buffer.from(hash(b.passcode)),Buffer.from(hash(secret)))) return reply({error:'Invalid credentials. Access denied.'},401);
 const token=randomBytes(32).toString('hex');
 await db.insert(schema.sessions).values({tokenHash:hash(token),expiresAt:new Date(Date.now()+3600000)});
 context.cookies.set({name:'ef1_session',value:token,httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:3600});
 return reply({ok:true});
 }
 if(!await authorized()) return reply({error:'Please authenticate to continue.'},401);
 if(b.action==='logout') {await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash,hash(cookie!)));context.cookies.delete('ef1_session');return reply({ok:true});}
 const driverValid = teams.some(t=>t.drivers.includes(b.driver));
 if(b.action==='result') {
 if(!driverValid || !rounds.includes(b.round) || !Number.isInteger(b.pos) || b.pos<1 || b.pos>20 || typeof b.status!=='string' || !b.status.trim() || b.status.length>100) return reply({error:'Enter a valid round, driver, position and status.'},400);
 const pts=['DNF','DSQ','DNS'].includes(b.status.trim().toUpperCase())?0:([25,18,15,12,10,8,6,4,2,1][b.pos-1]||0);
 await db.insert(schema.results).values({round:b.round,driver:b.driver,pos:b.pos,status:b.status.trim(),pts}).onConflictDoUpdate({target:[schema.results.round,schema.results.driver],set:{pos:b.pos,status:b.status.trim(),pts}});
 } else if(b.action==='adjust') {
 if(!driverValid || !Number.isInteger(b.points) || Math.abs(b.points)>10000) return reply({error:'Enter a whole number between -10000 and 10000.'},400);
 await db.insert(schema.adjustments).values({driver:b.driver,points:b.points});
 } else if(b.action==='news') {
 if(typeof b.title!=='string'||typeof b.content!=='string'||!b.title.trim()||!b.content.trim()||b.title.length>180||b.content.length>10000) return reply({error:'Enter a headline and bulletin within the allowed lengths.'},400);
 await db.insert(schema.news).values({title:b.title.trim(),content:b.content.trim()});
 } else return reply({error:'Unknown action'},400);
 return reply({ok:true});
 } catch(e) {if((e as any)?.cause?.code==='23505'||(e as any)?.code==='23505') return reply({error:'This finishing position is already assigned in this round.'},409);return reply({error:'Unable to complete the request. Please try again.'},500);}
};
export const config={path:'/api/championship'};
