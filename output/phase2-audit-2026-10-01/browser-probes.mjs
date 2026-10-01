import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright-core';
const dir='output/phase2-audit-2026-10-01',port=9061;
fs.mkdirSync(dir,{recursive:true});
const srv=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
let browser;const out={cases:{},pageErrors:[]};
try {
 await new Promise(r=>setTimeout(r,900));
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),p=await ctx.newPage();
 p.on('pageerror',e=>out.pageErrors.push(e.message));
 await p.goto('http://localhost:'+port+'/#/login');await p.waitForTimeout(600);
 await p.evaluate(()=>{TH.auth.login('vanhanh');TH.layout.reset();location.hash='#/documents';TH.router.render();});await p.waitForTimeout(500);
 out.cases.opsOcr=await p.evaluate(async()=>{
 const st=TH.store.all('stays').find(s=>TH.auth.inScope(s.buildingId));
 const permissions={review:TH.auth.can('ocr.review'),manage:TH.auth.can('tenants.manage')};
 try{await TH.intakeFiles.startStay(st.id);return {permissions,accepted:true};}catch(e){return {permissions,accepted:false,message:e.message};}
 });
 const review=p.locator('[data-act=ocr]').first();if(await review.count()){await review.click();await p.waitForTimeout(350);out.cases.opsOcr.visibleToast=await p.locator('#toast-root').innerText();await p.screenshot({path:dir+'/ops-ocr-blocked.png',fullPage:true});}
 await p.evaluate(()=>{document.querySelectorAll('.overlay').forEach(x=>x.remove());TH.auth.login('admin');TH.layout.reset();location.hash='#/documents';TH.router.render();});await p.waitForTimeout(400);
 await p.locator('[data-act=up]').click();await p.waitForTimeout(250);
 out.cases.docsUpload={fileInputs:await p.locator('.overlay input[type=file]').count()};
 await p.screenshot({path:dir+'/documents-name-only.png',fullPage:true});
 await p.locator('.overlay [name=type]').selectOption('pccc');
 await p.locator('.overlay [name=buildingId]').selectOption('b_T21');
 await p.locator('.overlay [name=name]').fill('Audit-new-PCCC.pdf');
 await p.locator('.overlay [data-act=submit-d]').click();await p.waitForTimeout(400);
 out.cases.docsUpload.newDoc=await p.evaluate(()=>{const d=TH.store.all('documents').find(x=>x.name==='Audit-new-PCCC.pdf');return {id:d?.id,blobId:d?.blobId??null};});
 await p.evaluate(async()=>{const d=TH.store.all('documents').find(x=>x.name==='Audit-new-PCCC.pdf');await TH.pages.docDownload(d.id);});await p.waitForTimeout(250);
 out.cases.docsUpload.downloadMessage=await p.locator('#toast-root').innerText();await p.screenshot({path:dir+'/documents-new-download-missing.png',fullPage:true});
 console.log(JSON.stringify(out,null,2));fs.writeFileSync(dir+'/browser-probes.json',JSON.stringify(out,null,2));
}finally {await browser?.close();srv.kill();}
