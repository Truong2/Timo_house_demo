/* Browser acceptance v4: route/output, keyboard semantics, responsive overflow and print evidence. */
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 9100 + Math.floor(Math.random() * 200); const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const out = path.join(ROOT, 'output', 'ui-audit', 'latest'); fs.mkdirSync(out, { recursive: true });
const server = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.mjs')], { env:{...process.env,PORT:String(PORT)}, stdio:'ignore' });
await new Promise(r => setTimeout(r, 700));
const browser = await chromium.launch({ executablePath:CHROME, headless:true }); const page = await browser.newPage({ viewport:{width:1440,height:1000} });
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
let checks=0; const ok=(cond,msg)=>{checks++;if(!cond)throw new Error(msg);};
const visit=async hash=>{await page.evaluate(h=>{location.hash=h;},hash);await page.waitForTimeout(300);ok(!/Lỗi hiển thị trang|Chưa có màn hình/.test(await page.locator('#content').innerText()),'Route lỗi: '+hash);};
const a11y=async route=>{const issues=await page.evaluate(()=>{
  const ids=[...document.querySelectorAll('[id]')].map(e=>e.id),duplicates=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
  const visible=e=>e.getAttribute('type')!=='hidden'&&!e.hidden;
  const named=e=>!!(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.getAttribute('title')||(e.labels&&e.labels.length));
  const controls=[...document.querySelectorAll('input,select,textarea')].filter(visible).filter(e=>!named(e)).map(e=>e.id||e.name||e.outerHTML.slice(0,80));
  const buttons=[...document.querySelectorAll('button,[role=button]')].filter(e=>visible(e)&&!(e.textContent||'').trim()&&!e.getAttribute('aria-label')&&!e.getAttribute('title')&&!e.getAttribute('data-tip')).map(e=>e.outerHTML.slice(0,100));
  const images=[...document.querySelectorAll('img')].filter(e=>!e.hasAttribute('alt')).map(e=>e.src);
  const positiveTab=[...document.querySelectorAll('[tabindex]')].filter(e=>Number(e.getAttribute('tabindex'))>0).map(e=>e.outerHTML.slice(0,100));
  return {duplicates,controls,buttons,images,positiveTab};
});ok(Object.values(issues).every(x=>x.length===0),`A11y ${route}: ${JSON.stringify(issues)}`);};
try {
  await page.goto(`http://127.0.0.1:${PORT}/#/login`); await page.evaluate(()=>localStorage.clear()); await page.reload(); await page.click('[data-u=admin]'); await page.waitForTimeout(300);
  await visit('#/contracts'); await a11y('/contracts'); ok(await page.locator('[data-nav=contracts]').count()===1,'Thiếu sidebar Hợp đồng'); ok(await page.locator('[role=tab][aria-selected=true]').count()===1,'Tab registry thiếu ARIA'); ok(await page.locator('.tbl-sort').count()>0,'Sort header chưa là button');
  const stayId=await page.evaluate(()=>TH.store.all('stays')[0].id); await visit('#/stays/'+stayId+'?tab=lich-su'); await a11y('/stays/:id'); ok(await page.locator('.tabs [role=tab]').count()===11,'Chi tiết HĐ chưa đủ 11 tab'); ok((await page.locator('#content').getAttribute('tabindex'))==='-1','Main chưa focusable'); ok(await page.evaluate(()=>document.activeElement?.id==='content'),'Route chưa đưa focus vào nội dung chính');
  await visit('#/billing/debts'); await a11y('/billing/debts'); ok(await page.locator('text=181+ ngày').count()>0,'Thiếu aging bucket');
  await visit('#/hr/payroll?period=2026-09'); await a11y('/hr/payroll'); ok((await page.locator('#content').innerText()).includes('M5 / M10 / M15'),'Thiếu payroll milestones');
  await visit('#/reports/business?period=2026-08'); await a11y('/reports/business'); ok(!(await page.locator('#content').innerText()).includes('1,6%/tháng'),'Còn copy khấu hao cũ');
  const routes=['#/dashboard','#/contracts','#/billing/debts','#/hr/payroll?period=2026-09','#/reports/business?period=2026-08'];
  for(const width of [375,768,1024,1440]){await page.setViewportSize({width,height:900});for(const route of routes){await visit(route);const overflow=await page.evaluate(()=>({bad:document.documentElement.scrollWidth>window.innerWidth+2,doc:document.documentElement.scrollWidth,items:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:e.className&&String(e.className).slice(0,80),parent:e.parentElement?.className&&String(e.parentElement.className).slice(0,80),text:(e.textContent||'').trim().slice(0,30),right:Math.round(e.getBoundingClientRect().right),width:Math.round(e.getBoundingClientRect().width)})).filter(x=>x.right>window.innerWidth+2||x.width>window.innerWidth+2).slice(0,8)}));ok(!overflow.bad,`Tràn ngang ${width}px tại ${route}: ${JSON.stringify(overflow)}`);}await page.screenshot({path:path.join(out,`responsive-${width}.png`),fullPage:true});}
  await page.setViewportSize({width:1440,height:1000}); const inv=await page.evaluate(()=>TH.store.all('invoices')[0].id); await visit('#/print/invoice/'+inv); ok(await page.locator('.inv-print').count()===1,'Thiếu invoice print'); await page.pdf({path:path.join(out,'invoice-a4.pdf'),format:'A4',printBackground:true,margin:{top:'10mm',right:'10mm',bottom:'10mm',left:'10mm'}});
  const rf=await page.evaluate(()=>TH.store.all('refunds').find(r=>r.bd>0)?.id); if(rf){await visit('#/print/refund/'+rf);await page.pdf({path:path.join(out,'refund-a4.pdf'),format:'A4',printBackground:true,margin:{top:'10mm',right:'10mm',bottom:'10mm',left:'10mm'}});}
  ok(errors.length===0,'JS/console errors: '+errors.join('; ')); console.log(`✓ UI audit v4: ${checks} checks · evidence ${path.relative(ROOT,out)}`);
} finally { await browser.close(); server.kill(); }
