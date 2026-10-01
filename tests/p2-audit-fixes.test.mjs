import {test} from 'node:test';
import assert from 'node:assert/strict';
import {boot} from './_app.mjs';
const snapshot=T=>JSON.stringify(T.store.state);
function real(T){
 const {store:S,q:Q,actions:X}=T,st=S.all('stays').find(s=>s.status==='active'&&Q.rateOf(s.id));
 const file=X.registerContractFile(st.id,{name:'real.pdf',size:2000,blobId:'real-original',hash:'sha',signed:false},true);
 const o=X.createRealOcr(st.id,file.id),parsed={data:{name:Q.customer(st.customerId).name,phone:'0912345678',idNo:'012345678901',buildingCode:Q.building(st.buildingId).code,roomCode:Q.room(st.roomId).code,signDate:'2026-09-01',moveInDate:'2026-09-02',startDate:'2026-09-02',svcStart:'2026-09-02',endDate:'2027-09-01',rent:5000000,deposit:7000000,payMonths:2,dueDay:5,people:2,vehicles:0,elOpen:100},items:{electric:{unit:0,method:'meter'}},sources:{}};
 X.realOcrSource(o.id,file.id,parsed,1);
 Q.OCR_GROUPS.forEach(([g])=>X.ocrConfirmGroup(o.id,g,true));
 return {st,file,o:Q.ocrSession(o.id)};
}
test('P2-AUD-01: real review applies zero/remove/keep fees, terms and one rate version; preserves issued invoices and deposit ledger',()=>{
 const T=boot(),{st,file,o}=real(T),{store:S,q:Q,actions:X}=T;
 const inv=JSON.stringify(S.all('invoices')),ledger=JSON.stringify(S.all('depositLedger')),before=S.where('rateVersions',v=>v.stayId===st.id).length;
 const base=Q.rateOf(st.id);S.update('rateVersions',base.id,{items:{...base.items,electric:{...base.items.electric,qty:2}}});
 const prev=JSON.stringify(Q.rateOf(st.id).items.water);
 X.realOcrFee(o.id,'fee_internet','remove','room'); X.ocrConfirmGroup(o.id,'fees',true);
 const res=X.ocrApply(o.id,{from:'2026-11-01',confirmed:true,signed:true});
 assert.equal(res.version.items.electric.unit,0);assert.equal(res.version.items.electric.qty,2);assert.equal(res.version.items.internet,undefined);assert.equal(JSON.stringify(res.version.items.water),prev);
 assert.equal(Q.stay(st.id).depositAmount,7000000);assert.equal(Q.stay(st.id).payMonths,2);
 assert.equal(JSON.stringify(S.all('invoices')),inv);assert.equal(JSON.stringify(S.all('depositLedger')),ledger);
 assert.equal(S.where('rateVersions',v=>v.stayId===st.id).length,before+1);assert.equal(S.get('contractFiles',file.id).signed,true);
 const after=snapshot(T);assert.throws(()=>X.ocrApply(o.id,{from:'2026-12-01',confirmed:true}));assert.equal(snapshot(T),after);
});
test('P2-AUD-01: field edits, missing values, wrong room, stale file and locked period block apply',()=>{
 const T=boot(),{o,st}=real(T),{q:Q,actions:X,store:S}=T;
 X.ocrSetField(o.id,'rent','');assert.equal(Q.ocrReady(Q.ocrSession(o.id)).ok,false);assert.ok(!Q.ocrSession(o.id).confirmed.money);
 X.ocrSetField(o.id,'rent','5000000');X.ocrConfirmGroup(o.id,'money',true);
 X.ocrSetField(o.id,'room','WRONG');assert.ok(Q.ocrReady(Q.ocrSession(o.id)).fieldErrors.room);
 X.ocrSetField(o.id,'room',Q.room(st.roomId).code);X.ocrConfirmGroup(o.id,'place',true);
 const snap=snapshot(T);assert.throws(()=>X.ocrApply(o.id,{from:'2026-11-01'}));assert.equal(snapshot(T),snap);
 S.update('periods','2026-09',{status:'closed'});const locked=snapshot(T);assert.throws(()=>X.ocrApply(o.id,{from:'2026-09-01',confirmed:true}));assert.equal(snapshot(T),locked);
 X.registerContractFile(st.id,{name:'replacement.pdf',size:2100,blobId:'other'},true);assert.equal(Q.ocrSession(o.id).status,'superseded');assert.throws(()=>X.ocrApply(o.id,{from:'2026-11-01',confirmed:true}));
});
test('P2-AUD-01: failure after rate creation rolls back the complete apply transaction',()=>{
 const T=boot(),{o}=real(T),X=T.actions,before=snapshot(T),original=X._.applyStayTerms;
 X._.applyStayTerms=()=>{throw Error('simulated write failure');};
 assert.throws(()=>X.ocrApply(o.id,{from:'2026-11-01',confirmed:true}),/simulated/);X._.applyStayTerms=original;assert.equal(snapshot(T),before);
});
test('P2-AUD-03: OPS/leader/department review in scope; cannot apply or review out of scope',()=>{
 for(const user of ['vanhanh','leader','truongphong']){
  const T=boot({user}),S=T.store,Q=T.q,X=T.actions,st=S.all('stays').find(s=>T.auth.inScope(s.buildingId));
  const f=X.registerContractFile(st.id,{name:'scope.pdf',size:10,blobId:user},true),o=X.createRealOcr(st.id,f.id);
  assert.equal(o.real,true);assert.throws(()=>X.ocrApply(o.id,{from:'2026-11-01',confirmed:true}));
  const other=S.all('stays').find(s=>!T.auth.inScope(s.buildingId));if(other)assert.throws(()=>X.createRealOcr(other.id));
 }
});
test('P2-AUD-02: signed selector deduplicates canonical/intake sources, excludes spreadsheets and unsigned photos',()=>{
 const T=boot(),S=T.store,X=T.actions,Q=T.q,st=S.all('stays')[0];
 S.where('contractFiles',f=>f.stayId===st.id).forEach(f=>S.remove('contractFiles',f.id));
 X.registerContractFile(st.id,{name:'support.xlsx',size:10,blobId:'excel',signed:true});assert.equal(Q.signedContract(st.id),null);
 X.registerContractFile(st.id,{name:'reference.jpg',size:10,blobId:'photo',signed:false});assert.equal(Q.signedContract(st.id),null);
 const f=X.registerContractFile(st.id,{name:'signed.pdf',size:10,blobId:'signed',hash:'signed-sha',signed:true});
 S.add('intakeAttachments',{targetId:st.id,kind:'tenant',fileId:'signed',name:'signed.pdf',contractSigned:true});
 assert.equal(Q.signedContract(st.id).id,f.id);assert.equal(Q.documentsAll().filter(d=>d.blobId==='signed').length,1);
 assert.equal(X.registerContractFile(st.id,{name:'signed.pdf',size:10,blobId:'signed',signed:true}).id,f.id);
 assert.equal(X.registerContractFile(st.id,{name:'copy.pdf',size:10,blobId:'different-actor-id',hash:'signed-sha',signed:true}).id,f.id);
 S.remove('contractFiles',f.id);assert.equal(Q.signedContract(st.id).legacyAttachment,true);
});
test('P2-AUD-04: document write failure preserves previous version and all metadata',()=>{
 const T=boot(),S=T.store,X=T.actions,doc=X.uploadDocument({type:'pccc',buildingId:'b_T21',name:'v1.pdf',size:20,blobId:'v1'}),snap=snapshot(T),add=S.add;
 S.add=(c,d)=>{if(c==='documents')throw Error('write failure');return add(c,d);};
 assert.throws(()=>X.uploadDocument({replaceId:doc.id,name:'v2.pdf',blobId:'v2'}),/write failure/);S.add=add;assert.equal(snapshot(T),snap);assert.equal(S.get('documents',doc.id).status,'current');
});
test('P2-AUD-05: invalid, inactive or out-of-scope sale IDs cause no partial writes',()=>{
 const T=boot({user:'sale'}),{store:S,q:Q,actions:X}=T,me=S.session.employeeId,lead=X.addLead({phone:'0966778811',source:'Zalo'}),r=Q.forSale().find(x=>x.kind==='now').room;
 const d={leadId:lead.id,roomId:r.id,price:r.price,deposit:r.price,closeDate:'2026-09-29',billingStart:'2026-10-01',term:12};
 const other=Q.salesStaff().find(x=>x.id!==me).id;
 for(const saleIds of [[],['missing'],[other],[me,'missing'],'invalid']){const snap=snapshot(T);assert.throws(()=>X.closeDeal({...d,saleIds}));assert.equal(snapshot(T),snap);}
 S.update('employees',me,{status:'inactive'});const snap=snapshot(T);assert.throws(()=>X.closeDeal({...d,saleIds:[me]}));assert.equal(snapshot(T),snap);
 S.update('employees',me,{status:'active'});const deal=X.closeDeal({...d,saleIds:[me,me]});assert.equal(deal.saleIds.length,1);
});
test('P2-AUD-06: inactive or newly reserved destination blocks transfer and preserves stay/rates/deposit/commission/history',()=>{
 const T=boot({user:'sale'}),{store:S,q:Q,actions:X}=T,l=X.addLead({phone:'0977889911',source:'Zalo'}),r=Q.forSale().find(x=>x.kind==='now').room;
 const d=X.closeDeal({leadId:l.id,roomId:r.id,price:r.price,deposit:r.price,closeDate:'2026-09-29',billingStart:'2026-10-01',term:12});
 T.auth.login('truongkd');const to=Q.forSale().find(x=>x.kind==='now').room;
 S.update('rooms',to.id,{status:'inactive'});const snap=snapshot(T);assert.throws(()=>X.transferDeal(d.id,{toRoomId:to.id,reason:'test'}));assert.equal(snapshot(T),snap);
 S.update('rooms',to.id,{status:'vacant_ready'});S.add('stays',{roomId:to.id,status:'pending'});const reserved=snapshot(T);assert.throws(()=>X.transferDeal(d.id,{toRoomId:to.id,reason:'test'}));assert.equal(snapshot(T),reserved);
});

test('P2-AUD-02: intake contract commit enables commission eligibility without creating cash flows; signature date does not backdate eligibility',()=>{
 const T=boot(),{store:S,q:Q,intake:I}=T,deal=S.all('deals').find(d=>Q.dealEligibility(d).ok),st=Q.stay(deal.stayId),c=Q.customer(st.customerId),b=Q.building(st.buildingId),r=Q.room(st.roomId);
 const d=I.blank('tenant');Object.assign(d,{id:'regression-intake-signed',reviewed:true,targetStayId:st.id,contractSigned:true});
 d.data={name:c.name,phone:c.phone,idNo:c.idNo,buildingCode:b.code,buildingAddress:b.address,roomCode:r.code,contractCode:'REGRESSION',signDate:st.dealDate||st.rentStart,startDate:st.rentStart,moveInDate:st.moveInDate,svcStart:st.svcStart,endDate:st.endDate,rent:st.rent,deposit:st.depositAmount,payMonths:st.payMonths,people:st.people,status:st.status};
 d.items=JSON.parse(JSON.stringify(Q.rateOf(st.id,st.rentStart).items));d.files=[{id:'intake-signed-original',name:'signed.pdf',size:2000,hash:'regression'}];
 assert.deepEqual(JSON.parse(JSON.stringify(I.validate(d).errors)),[]);
 S.where('contractFiles',f=>f.stayId===st.id).forEach(f=>S.remove('contractFiles',f.id));assert.equal(Q.dealEligibility(deal).ok,false);
 const flows=JSON.stringify([S.all('payments'),S.all('expenses'),S.all('depositLedger')]);I.commit(d);
 assert.equal(Q.dealEligibility(deal).ok,true);assert.ok(Q.dealEligibility(deal).date>=T.f.today());assert.equal(Q.signedContract(st.id).source,'intake');
 assert.equal(JSON.stringify([S.all('payments'),S.all('expenses'),S.all('depositLedger')]),flows);
 const count=S.where('contractFiles',f=>f.stayId===st.id).length;I.commit(d);assert.equal(S.where('contractFiles',f=>f.stayId===st.id).length,count);
});
