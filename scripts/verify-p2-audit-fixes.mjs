/* Regression proof for P2-AUD-01..06: actual UI uploads, local originals and review/apply. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const out=path.resolve('output/phase2-fixes-2026-10-01');fs.mkdirSync(out+'/shots',{recursive:true});
const port=9120+Math.floor(Math.random()*50),server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
const pdf=path.resolve('docs/contracts_demo/Hop_dong_khach_thue_P302_TH01_demo_dong_bo.pdf'),owner=path.resolve('docs/contracts_demo/Hop_dong_chu_nha_TH01_demo_dong_bo.pdf');
const errors=[],proof={};let browser;
const waitRead=p=>p.waitForFunction(()=>document.querySelector('#intake-progress')?.textContent.includes('Đã đọc'),{},{timeout:60000});
try{
 await new Promise(r=>setTimeout(r,700));browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:'+port);await p.evaluate(()=>{TH.auth.login('admin');TH.go('#/owners/new');});
 await p.locator('#intake-file').setInputFiles(owner);await waitRead(p);
 await p.locator('[data-step="2"]').click();await p.locator('#intake-areaId').selectOption('A2');await p.locator('#intake-managerId').selectOption(await p.evaluate(()=>TH.store.all('employees')[0].id));
 await p.locator('[data-step="3"]').click();await p.locator('#intake-confirm').check();await p.locator('[data-intake=commit]').click();await p.waitForURL(/owner-profiles/);
 await p.evaluate(()=>TH.go('#/tenants/intake'));await p.locator('#intake-file').setInputFiles(pdf);await waitRead(p);await p.locator('[data-step="3"]').click();await p.locator('#intake-contract-signed').check();await p.locator('#intake-confirm').check();await p.locator('[data-intake=commit]').click();await p.waitForURL(/stays/);
 const stay=await p.evaluate(()=>TH.store.one('stays',s=>s.roomId==='r_302TH01').id);
 const original=await p.evaluate(st=>({invoices:JSON.stringify(TH.store.all('invoices')),ledger:JSON.stringify(TH.store.all('depositLedger')),payments:TH.store.all('payments').length,files:TH.store.where('contractFiles',f=>f.stayId===st).length,signed:!!TH.q.signedContract(st)}),stay);assert.equal(original.files,1);assert.equal(original.signed,true);
 await p.evaluate(st=>TH.go('#/stays/'+st+'?tab=hop-dong'),stay);await p.locator('[data-act=ocr]').first().click();await p.waitForURL(/ocr/);await p.waitForFunction(()=>document.querySelector('#real-ocr-progress')?.textContent.includes('Đã đọc'),{},{timeout:60000});
 const sid=await p.evaluate(()=>TH.store.all('ocrSessions').at(-1).id);
 assert.equal(await p.evaluate(id=>TH.q.ocrSession(id).real,sid),true);assert.equal(await p.locator('#ocr-room').inputValue(),'302TH01');
 await p.locator('[data-ocr-group=party]').check();await p.locator('[data-ocr-group=place]').check();await p.locator('[data-act=next]').click();await p.locator('#ocr-deposit').fill('7000000');await p.locator('#ocr-deposit').press('Tab');await p.locator('#ocr-fee_electric').fill('0');await p.locator('#ocr-fee_electric').press('Tab');await p.locator('[data-fee-action=fee_internet]').selectOption('remove');
 for(const g of ['dates','money','fees','meter'])await p.locator('[data-ocr-group='+g+']').check();
 await p.locator('#ocr-deposit').fill('-1');await p.locator('#ocr-deposit').press('Tab');assert.equal(await p.locator('[data-ocr-group=money]').isChecked(),false);
 await p.locator('#ocr-deposit').fill('7100000');await p.locator('#ocr-deposit').press('Tab');assert.equal(await p.locator('[data-ocr-group=money]').isChecked(),false);await p.locator('[data-ocr-group=money]').check();await p.locator('[data-act=next]').click();assert.equal(await p.locator('[data-act=apply]').isDisabled(),true);
 await p.locator('#real-ocr-from').fill('2026-11-01');await p.locator('#real-ocr-from').press('Tab');await p.locator('#real-ocr-confirm').check();assert.equal(await p.locator('[data-act=apply]').isDisabled(),false);
 await p.evaluate(()=>document.querySelectorAll('#toast-root > *').forEach(x=>x.remove()));
 proof.viewports=[];
 for(const [width,height] of [[1600,1000],[1440,1000],[1024,768],[390,844]]){
  await p.setViewportSize({width,height});await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(350);
  const layout=await p.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(layout.scroll<=layout.w+1,'OCR page overflow '+JSON.stringify(layout));
  await p.screenshot({path:out+'/shots/ocr-review-'+width+'.png',fullPage:true});proof.viewports.push({width,height,overflow:false});
 }
 await p.setViewportSize({width:1440,height:1000});await p.locator('[data-act=apply]').click();await p.waitForURL(/stays.*tab=bieu-phi/);
 const result=await p.evaluate(st=>({rate:TH.q.rateOf(st,'2026-11-01'),stay:TH.q.stay(st),status:TH.store.all('ocrSessions').at(-1).status,invoices:JSON.stringify(TH.store.all('invoices')),ledger:JSON.stringify(TH.store.all('depositLedger')),payments:TH.store.all('payments').length}),stay);
 assert.equal(result.rate.items.electric.unit,0);assert.equal(result.rate.items.internet,undefined);assert.equal(result.stay.depositAmount,7100000);assert.equal(result.invoices,original.invoices);assert.equal(result.ledger,original.ledger);assert.equal(result.payments,original.payments);assert.equal(result.status,'applied');proof.realApply={stay,session:sid,rateVersion:result.rate.id,zeroFee:true,removedFee:true,invoicesUnchanged:true,ledgerUnchanged:true};
 // New file + new version from real drawer controls; hashes and byte-for-byte downloads survive reload.
 await p.evaluate(()=>TH.go('#/documents'));await p.locator('[data-act=up]').click();await p.locator('.overlay [name=type]').selectOption('pccc');await p.locator('.overlay [name=buildingId]').selectOption('b_TH01');await p.locator('.overlay [name=original]').setInputFiles(pdf);await p.locator('.overlay [data-act=submit-d]').click();await p.waitForSelector('.overlay',{state:'detached'});
 const v1=await p.evaluate(()=>TH.store.all('documents').at(-1));assert.equal(v1.size,fs.statSync(pdf).size);assert.ok(v1.blobId);
 await p.locator('[data-act=newv][data-id="'+v1.id+'"]').click();await p.locator('.overlay [name=original]').setInputFiles(owner);await p.locator('.overlay [data-act=submit-d]').click();await p.waitForSelector('.overlay',{state:'detached'});
 const v2=await p.evaluate(()=>TH.store.all('documents').at(-1));assert.equal(v2.version,2);assert.equal(v2.prevId,v1.id);assert.notEqual(v2.blobId,v1.blobId);await p.waitForTimeout(250);await p.reload();await p.waitForFunction(()=>window.TH?.store?.session);
 await p.locator('[data-act=ver][data-id="'+v2.id+'"]').click();
 for(const [v,file] of [[v1,pdf],[v2,owner]]){const pending=p.waitForEvent('download');await p.locator('.overlay [data-act=version-download][data-id="'+v.id+'"]').click();const download=await pending;assert.deepEqual(fs.readFileSync(await download.path()),fs.readFileSync(file));}
 await p.locator('.overlay [data-act=close]').first().click();
 proof.documents={v1:v1.id,v2:v2.id,byteExact:true,reload:true};await p.evaluate(()=>document.querySelectorAll('#toast-root > *').forEach(x=>x.remove()));
 for(const [width,height] of [[1600,1000],[1440,1000],[1024,768],[390,844]]){
  await p.setViewportSize({width,height});await p.evaluate(()=>window.scrollTo(0,0));await p.locator('[data-act=up]').click();
  const layout=await p.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(layout.scroll<=layout.w+1,'Document drawer overflow');
  await p.screenshot({path:out+'/shots/doc-upload-'+width+'.png',animations:'disabled'});await p.locator('.overlay [data-act=close]').click();
 }
 await p.setViewportSize({width:1440,height:1000});
 const links=await p.evaluate(data=>{
  const S=TH.store,A=TH.auth,X=TH.actions;A.login('sale');const mine=S.one('deals',d=>d.stayId&&A.inSales(d.saleIds));A.login('kythuat');const rb=S.one('repairLogs',r=>r.workerId===S.session.employeeId).buildingId;A.login('admin');
  const cf=X.addContractFile(mine.stayId,{name:'sale-original.pdf',size:108580,blobId:data.v1.blobId,hash:data.v1.hash,signed:true});
  const hand=X.uploadDocument({type:'handover',buildingId:rb,name:'technical-original.pdf',size:data.v2.size,blobId:data.v2.blobId,hash:data.v2.hash});
  return {deal:mine.id,contract:'cf:'+cf.id,handover:hand.id};
 },{v1,v2});
 for(const [user,route,id,file] of [['sale','#/sales/deals/'+links.deal,links.contract,pdf],['kythuat','#/repairs?tab=tai-lieu',links.handover,owner]]){
  await p.evaluate(({user,route})=>{TH.auth.login(user);TH.go(route);},{user,route});const pending=p.waitForEvent('download');await p.locator('[data-act=docdl][data-id="'+id+'"]').click();const dl=await pending;assert.deepEqual(fs.readFileSync(await dl.path()),fs.readFileSync(file));
 }
 proof.documents.scopedDownloads=['sale','kythuat'];
 // Current reviewer capabilities and scope apply to entry buttons, source reads and direct routes.
 for(const user of ['vanhanh','leader','truongphong']){
  await p.evaluate(user=>{TH.auth.login('admin');const u=TH.store.one('users',u=>u.username===user);TH.store.add('assignments',{employeeId:u.employeeId,buildingId:'b_TH01',from:'2026-01-01'});TH.auth.login(user);TH.go('#/stays/'+TH.store.one('stays',s=>s.roomId==='r_302TH01').id+'?tab=hop-dong');},user);
  await p.locator('[data-act=ocr]').first().click();await p.waitForURL(/ocr/);await p.waitForFunction(()=>document.querySelector('#real-ocr-progress')?.textContent.includes('Đã đọc'),{},{timeout:60000});
  assert.equal(await p.locator('[data-act=apply]').count(),0);assert.equal(await p.evaluate(()=>TH.auth.can('rates.manage')),false);
 }
 proof.reviewRoles=['vanhanh','leader','truongphong'];
 // Recover the exact same missing original without discarding reviewed edits.
 await p.evaluate(()=>{TH.auth.login('admin');TH.router.render();});await p.locator('[data-act=next]').click();await p.locator('#ocr-deposit').fill('8800000');await p.locator('#ocr-deposit').press('Tab');
 const recovery=await p.evaluate(async()=>{
  const o=TH.store.all('ocrSessions').at(-1),file=TH.store.get('contractFiles',o.fileId),fields=JSON.stringify(o.fields);
  await new Promise((resolve,reject)=>{const r=indexedDB.open('timohouse-intake-v1',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('files','readwrite');tx.objectStore('files').delete(file.blobId);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};});
  TH.router.render();return {id:o.id,fields};
 });
 await p.waitForFunction(()=>document.querySelector('#real-ocr-progress')?.textContent.includes('không còn'));await p.locator('#real-ocr-upload').setInputFiles(pdf);
 await p.waitForFunction(()=>document.querySelector('#real-ocr-progress')?.textContent.includes('giữ nguyên'));
 assert.equal(await p.evaluate(id=>JSON.stringify(TH.q.ocrSession(id).fields),recovery.id),recovery.fields);assert.ok((await p.url()).endsWith(recovery.id));proof.recoveredOriginalKeepsEdits=true;
 const forbidden=await p.evaluate(async()=>{const S=TH.store,A=TH.auth;A.login('vanhanh');const outside=S.all('stays').find(s=>!A.inScope(s.buildingId));A.login('admin');const f=TH.actions.registerContractFile(outside.id,{name:'outside.pdf',size:1,blobId:'outside-blob'},true),o=TH.actions.createRealOcr(outside.id,f.id);A.login('vanhanh');const scoped=!A.inScope(outside.buildingId);let blobDenied=false,writeDenied=false;try{await TH.intakeFiles.file(f.blobId);}catch(e){blobDenied=/phạm vi/.test(e.message);}try{TH.actions.ocrSetField(o.id,'rent','1');}catch(e){writeDenied=true;}TH.go('#/ocr/'+o.id);return{scoped,blobDenied,writeDenied};});assert.equal(forbidden.scoped,true);assert.equal(forbidden.blobDenied,true);assert.equal(forbidden.writeDenied,true);await p.waitForFunction(()=>document.querySelector('#content')?.textContent.includes('phạm vi'));proof.scope=forbidden;
 // Cancel an in-flight read, then complete it late: the canceled result must not merge.
 await p.evaluate(st=>{
  TH.auth.login('admin');TH.__contractReader=TH.intakeFiles.contract;TH.intakeFiles.contract=()=>new Promise(resolve=>{TH.__lateRead=resolve;});
  const current=TH.store.where('contractFiles',f=>f.stayId===st).at(-1),o=TH.actions.createRealOcr(st,current.id);TH.go('#/ocr/'+o.id);
 },stay);
 await p.waitForFunction(()=>typeof TH.__lateRead==='function');await p.locator('[data-act=cancel]').click();
 const canceled=await p.evaluate(()=>JSON.stringify(TH.store.all('ocrSessions').at(-1)));
 await p.evaluate(()=>{TH.__lateRead([{page:1,text:'HỢP ĐỒNG CHO THUÊ PHÒNG fake late result',method:'pdf-text'}]);TH.intakeFiles.contract=TH.__contractReader;});await p.waitForTimeout(250);
 assert.equal(await p.evaluate(()=>JSON.stringify(TH.store.all('ocrSessions').at(-1))),canceled);proof.canceledReadIgnored=true;
 // Missing original preserves session data and provides file selection.
 await p.evaluate(st=>{TH.auth.login('admin');const f=TH.actions.registerContractFile(st,{name:'missing.pdf',size:100,blobId:'missing-original'},true),o=TH.actions.createRealOcr(st,f.id);TH.go('#/ocr/'+o.id);},stay);
 await p.waitForFunction(()=>document.querySelector('#real-ocr-progress')?.textContent.includes('không còn'));assert.equal(await p.locator('#real-ocr-upload').count(),1);proof.missingOriginal=true;
 assert.deepEqual(errors,[]);proof.pageErrors=errors;proof.status='PASS';fs.writeFileSync(out+'/verification.json',JSON.stringify(proof,null,2));console.log(JSON.stringify(proof,null,2));
}catch(e){proof.status='FAIL';proof.error=e.stack;proof.pageErrors=errors;fs.writeFileSync(out+'/verification.json',JSON.stringify(proof,null,2));throw e;}finally{await browser?.close();server.kill();}
