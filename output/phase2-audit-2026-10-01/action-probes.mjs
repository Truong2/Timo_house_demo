import fs from 'node:fs';
import {boot,attempt} from '../../tests/_app.mjs';
const out={at:new Date().toISOString(),head:'fe94bc5',cases:{}};
{
 const t=boot(),S=t.store,Q=t.q,I=t.intake;
 const deal=S.all('deals').find(d=>Q.dealEligibility(d).ok);
 const s=Q.stay(deal.stayId),c=Q.customer(s.customerId),b=Q.building(s.buildingId),r=Q.room(s.roomId);
 const draft=I.blank('tenant');Object.assign(draft,{id:'audit-attach-existing',reviewed:true,targetStayId:s.id});
 draft.data={name:c.name,phone:c.phone,idNo:c.idNo,buildingCode:b.code,buildingAddress:b.address,roomCode:r.code,contractCode:'AUDIT-CONTRACT',signDate:s.dealDate||s.rentStart,startDate:s.rentStart,moveInDate:s.moveInDate,svcStart:s.svcStart,endDate:s.endDate,rent:s.rent,deposit:s.depositAmount,payMonths:s.payMonths,people:s.people,status:s.status};
 draft.items=JSON.parse(JSON.stringify(Q.rateOf(s.id,s.rentStart)?.items||{}));draft.files=[{id:'audit-original',name:'audit-signed.pdf'}];
 const base=I.validate(draft);out.cases.baseIntake={deal:deal.id,errors:base.errors};
 if(!base.errors.length){S.where('contractFiles',f=>f.stayId===s.id).forEach(f=>S.remove('contractFiles',f.id));
 const res=I.commit(draft);out.cases.contractVsCommission={target:res.targetId,attachment:Q.documentsAll().filter(d=>d.objectId===s.id).map(d=>({type:d.type,source:d.source})),eligibility:Q.dealEligibility(deal)};
 const changed=JSON.parse(JSON.stringify(draft));changed.id='audit-ocr-change';changed.data.deposit+=100000;const fee=Object.keys(changed.items)[0];if(fee)changed.items[fee].unit+=500;
 out.cases.realOcrChangedTerms={fieldErrors:I.validate(changed).fieldErrors};}
}
{
 const t=boot({user:'sale'}),S=t.store,Q=t.q,X=t.actions;
 const l=X.addLead({phone:'0912345691',source:'Zalo',name:'Audit sale'}),rm=Q.forSale().find(x=>x.kind==='now').room;
 const foreign=Q.salesStaff().find(e=>e.id!==S.session.employeeId);
 const a=attempt(()=>X.closeDeal({leadId:l.id,roomId:rm.id,price:rm.price,deposit:rm.price,closeDate:t.f.today(),billingStart:'2026-10-01',term:12,saleIds:[foreign.id]}));
 out.cases.foreignSale={accepted:a.ok,error:a.msg,ownScope:[...t.auth.salesScope()],assigned:foreign.id,canSeeOwnNewDeal:a.ok?t.auth.inSales(a.value.saleIds):null};
}
{
 const t=boot(),S=t.store,Q=t.q,X=t.actions;
 const l=X.addLead({phone:'0912345692',source:'Zalo',name:'Audit transfer',saleId:Q.salesStaff()[0].id}),rm=Q.forSale().find(x=>x.kind==='now').room;
 const d=X.closeDeal({leadId:l.id,roomId:rm.id,price:rm.price,deposit:rm.price,closeDate:t.f.today(),billingStart:'2026-10-01',term:12});
 const to=Q.forSale().find(x=>x.kind==='now'&&x.room.id!==rm.id).room;S.update('rooms',to.id,{status:'inactive'});const beforeRentable=Q.rentable(Q.room(to.id));
 const a=attempt(()=>X.transferDeal(d.id,{toRoomId:to.id,price:to.price,reason:'Audit inactive room'}));out.cases.inactiveTransfer={accepted:a.ok,error:a.msg,beforeRentable,afterRoom:Q.deal(d.id).roomId,target:to.id};
}
{
 const t=boot(),X=t.actions;
 const d=X.uploadDocument({type:'pccc',buildingId:'b_T21',objectType:'building',objectId:'b_T21',name:'audit-pccc.pdf',size:100});
 const a=attempt(()=>X.downloadDocument(d.id));out.cases.newDocumentBinary={created:!!d.id,downloadActionAccepted:a.ok,blobId:d.blobId??null};
}
fs.mkdirSync('output/phase2-audit-2026-10-01',{recursive:true});fs.writeFileSync('output/phase2-audit-2026-10-01/action-probes.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));
