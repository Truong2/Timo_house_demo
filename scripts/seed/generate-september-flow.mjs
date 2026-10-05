/* Build an isolated, reproducible September demo through the application's business actions. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { boot, completePayroll } from '../../tests/_app.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const TH=boot(), {store:S,actions:X,q:Q,f:F}=TH;
const clone=x=>JSON.parse(JSON.stringify(x)), sum=(xs,key)=>xs.reduce((n,x)=>n+Number(x[key]||0),0);
const base=clone(S.state), period='2026-09', id='september-flow-v1';
const source=JSON.parse(fs.readFileSync(path.join(ROOT,'scripts/seed/september-source.json'),'utf8'));
let seq=0, date='2026-09-01';
F.uid=p=>`${p}_sep26_${String(++seq).padStart(6,'0')}`;
F.nowISO=()=>date+'T12:00:00.000Z';
S.setMeta({today:'2026-10-05',period});
const issues=[], steps=[];
const evidence=(kind,ref,assumption=null)=>({dataset:id,kind,sourceRef:ref,assumption});
const sample=ref=>evidence('derived_sample',ref,'Dữ liệu mẫu tháng 9; không phải chứng từ thực tế tháng 9.');
const step=(name,fn)=>{console.log(name);const value=fn();steps.push({name,...value});};

step('01. Liên kết hợp đồng → biểu phí → chỉ số → hóa đơn Excel',()=>{
  const invoices=S.where('invoices',i=>i.period===period), before=sum(invoices,'totalDue');
  for(const i of invoices){
    const rate=S.one('rateVersions',r=>r.stayId===i.stayId), reading=S.one('meterReadings',r=>r.stayId===i.stayId&&r.period===period);
    assert.ok(rate,`Missing rate ${i.code}`);
    date=i.issueDate;
    S.update('invoices',i.id,{lifecycle:'draft',rateVersionId:rate.id,readingId:reading?.id||null,provenance:evidence('workbook','SRC-08 '+i.excel.src),billingInputSig:null});
    const result=X.issueInvoices([i.id]);
    if(result.errs.length)throw Error(result.errs.join('; '));
    assert.equal(result.issued,1);
  }
  assert.equal(sum(invoices,'totalDue'),before);
  for(const p of S.all('payments')) S.update('payments',p.id,{provenance:evidence('workbook','SRC-08 · phiếu thu '+p.code),reference:p.reference||'Đối chiếu Excel tháng 9: '+p.code});
  return {count:invoices.length,total:before,payments:S.all('payments').length};
});

step('02. Sổ cọc: số đầu kỳ + phát sinh − khấu trừ − hoàn',()=>{
  // The old demonstration creates opening deposits as well as source receipts for the same stays.
  // Normalize only this separate dataset, retaining the original workbook demo unchanged.
  let fixedOpening=0,linked=0,deductions=0;
  for(const s of S.all('stays')){
    const incoming=S.where('depositLedger',l=>l.stayId===s.id&&l.kind==='receive');
    const depositPayments=S.where('payments',p=>p.stayId===s.id&&p.type==='deposit');
    if(depositPayments.length){
      for(const l of incoming)S.remove('depositLedger',l.id);
      for(const p of depositPayments){S.add('depositLedger',{id:'dl_sep_receive_'+p.id,stayId:s.id,buildingId:s.buildingId,kind:'receive',amount:p.amount,date:p.receivedAt,period:F.period(p.receivedAt),paymentId:p.id,note:'Nhận cọc theo '+p.code,provenance:evidence('workbook','SRC-08 · '+p.code)});linked++;}
      continue;
    }
    const opening=S.one('depositLedger',l=>l.stayId===s.id&&l.kind==='opening');
    if(opening&&incoming.length){const amount=Math.max(0,opening.amount-sum(incoming,'amount'));S.update('depositLedger',opening.id,{amount,provenance:sample('SRC-08 · loại phần cọc phát sinh đã ghi trùng số đầu kỳ')});fixedOpening++;}
    for(const l of incoming){
      const pay=S.one('payments',p=>p.stayId===s.id&&p.type==='deposit'&&p.amount===l.amount);
      const inv=S.one('invoices',i=>i.stayId===s.id&&TH.calc.billing.expand(i.lines)[1].amount>0);
      if(pay){S.update('depositLedger',l.id,{paymentId:pay.id,date:pay.receivedAt,period:F.period(pay.receivedAt)});linked++;}
      else if(inv) S.update('depositLedger',l.id,{invoiceId:inv.id,provenance:evidence('workbook','SRC-08 '+inv.excel.src+' · dòng cọc')});
    }
  }
  for(const r of S.where('refunds',r=>r.status==='paid')){
    const remaining=Math.max(0,X.depositBalance(r.stayId));
    if(remaining>0.5&&r.bc>0){S.add('depositLedger',{id:'dl_sep_deduct_'+r.id,stayId:r.stayId,buildingId:r.buildingId,kind:'deduct',amount:Math.min(remaining,r.bc),date:r.paidAt,period:F.period(r.paidAt),refundId:r.id,note:'Khấu trừ theo phiếu hoàn '+r.code,provenance:evidence('workbook','SRC-08 '+r.excel.src)});deductions++;}
  }
  return {fixedOpening,linkedDepositReceipts:linked,refundDeductions:deductions};
});

let journey;
step('02b. Ca khách mới: xem phòng → chốt → cọc → hợp đồng → hóa đơn → thu đủ',()=>{
  const room=Q.forSale('2026-09-06').map(x=>x.room).find(r=>!Q.currentStay(r.id)&&!Q.pendingStay(r.id)&&!S.where('stays',s=>s.roomId===r.id).some(s=>s.endDate>='2026-09-06'));
  assert.ok(room,'Need a genuinely vacant source room for the sample journey');
  const sale=Q.salesStaff()[0], price=room.price;
  date='2026-09-06';
  const lead=X.addLead({name:'Khách mẫu luồng tháng 9',phone:'0990000926',saleId:sale.id,source:'Facebook',sentAt:date,areaId:Q.building(room.buildingId).areaId,note:'Ca mẫu bổ sung; giá thuê lấy từ danh mục Excel SRC-08'});
  X.addViewing(lead.id,{roomId:room.id,date});
  const deal=X.closeDeal({leadId:lead.id,roomId:room.id,price,deposit:price,closeDate:date,billingStart:date,moveInDate:date,term:12});
  const deposit=X.recordPayment({stayId:deal.stayId,type:'deposit',amount:price,receivedAt:date,method:'bank',allocations:[],note:'Cọc ca mẫu tháng 9'});
  X.receiveDeal(deal.id,date);
  const contract=X.addContractFile(deal.stayId,{name:'Hop-dong-mau-luong-thang-9.pdf',size:12000,blobId:'builtin:september:contract-flow',signed:true,source:'demo_september'});
  // Fee schedule: same template as a contracted stay in the building (SRC-08), not an empty schedule.
  const sibling=S.where('stays',s=>s.buildingId===room.buildingId&&s.status==='active'&&s.id!==deal.stayId).map(s=>({s,r:Q.rateOf(s.id)})).find(x=>x.r&&x.r.source==='SRC-08'&&Object.keys(x.r.items||{}).length);
  assert.ok(sibling,'Need a contracted fee schedule in the same building');
  let rate=Q.rateOf(deal.stayId);
  // Per-person quantities follow this tenant (1 person), not the sibling room's occupancy.
  const items=Object.fromEntries(Object.entries(clone(sibling.r.items)).map(([k,it])=>[k,it.method==='person'&&it.qty!=null?{...it,qty:1}:it]));
  S.update('rateVersions',rate.id,{items,reason:'Biểu phí theo hợp đồng mẫu cùng tòa',sourceRef:'SRC-08 · đơn giá lượt thuê '+sibling.s.code,provenance:sample('SRC-08 · biểu phí '+sibling.s.code)});
  rate=Q.rateOf(deal.stayId);
  // Move-in reading continues the room's last workbook reading; consumption starts from here.
  const last=S.where('meterReadings',m=>m.roomId===room.id&&m.elCurr!=null).sort((a,b)=>a.period.localeCompare(b.period)||String(a.readAt).localeCompare(String(b.readAt))).pop();
  assert.ok(last,'Need the room last meter reading');
  const reading=X.saveReading({period,roomId:room.id,buildingId:room.buildingId,stayId:deal.stayId,elPrev:last.elCurr,elCurr:last.elCurr,waPrev:last.waCurr,waCurr:last.waCurr,people:1,vehicles:'',parkingVehicles:'',chargingVehicles:'',readAt:date,reason:'Chỉ số bàn giao khi nhận phòng'});
  const created=X.createInvoiceDrafts(period,[room.buildingId]).created;
  const invoice=created.find(i=>i.stayId===deal.stayId); assert.ok(invoice);
  created.filter(i=>i.id!==invoice.id).forEach(i=>X.deleteDraft(i.id));
  assert.equal(X.issueInvoices([invoice.id]).issued,1);
  date='2026-09-08';
  const payment=X.recordPayment({stayId:deal.stayId,type:'invoice',amount:invoice.totalDue,receivedAt:date,method:'bank',allocations:[{invoiceId:invoice.id,amount:invoice.totalDue}],note:'Thu đủ hóa đơn ca mẫu tháng 9'});
  S.update('stays',deal.stayId,{provenance:sample('SRC-08 · phòng '+room.code)});
  S.update('invoices',invoice.id,{provenance:sample('SRC-08 · giá/biểu phí phòng '+room.code)});
  const lines=TH.calc.billing.expand(invoice.lines).filter(l=>l.amount).map(l=>({label:l.label||l.name||String(l.code??''),amount:l.amount}));
  assert.ok(lines.length>1,'First invoice must contain services, not rent only');
  journey={leadId:lead.id,dealId:deal.id,stayId:deal.stayId,roomId:room.id,roomCode:room.code,buildingId:room.buildingId,contractId:contract.id,rateId:rate.id,readingId:reading?.id||invoice.readingId,invoiceId:invoice.id,depositId:deposit.id,paymentId:payment.id,rent:price,deposit:price,invoiceTotal:invoice.totalDue,rate:clone(rate),rateFrom:sibling.s.code,meterStart:{el:last.elCurr,wa:last.waCurr,from:last.id},invoiceLines:lines};
  return journey;
});

step('03. Chi phí tòa và quỹ chung tháng 9',()=>{
  date='2026-09-25';
  const eligible=base.expenses.filter(e=>e.period==='2026-08'&&['util_electric','util_water','util_internet','util_garbage','util_env','util_elevator','other','office','marketing'].includes(e.category)&&e.source==='bench');
  for(const e of eligible){
    const n=X.addExpense({...e,id:undefined,code:undefined,date,period,source:'demo_september',note:'Mẫu T9 theo chi phí T8: '+e.note,refId:e.id,evidence:'SRC-04 · '+e.code},true);
    S.update('expenses',n.id,{provenance:sample('SRC-04 tháng 8 · '+e.id)});
  }
  // Monthly service costs are accrual data; cash rent installments retain their real source schedule.
  const paid=base.ownerPayments.filter(p=>p.from.startsWith(period)&&p.paid>0);
  for(const op of paid){
    const offset=sum(op.offsets||[],'amount'), amount=Math.max(0,op.paid-offset);
    S.update('ownerPayments',op.id,{paid:offset,payments:[],expenseIds:[]});
    if(amount){const e=X.recordOwnerPayment(op.id,{date:op.paidAt||'2026-09-05',amount,method:'bank',reference:'Lịch trả chủ nhà mẫu T9',evidence:'Lịch hợp đồng từ giá thuê SRC-04 T8; ngày chi là giả định mẫu'});S.update('expenses',e.id,{provenance:sample('Hợp đồng '+op.contractId)});}
  }
  return {sourceBasedExpenses:eligible.length,ownerInstallments:paid.length};
});

step('04. Sửa chữa → vật tư → tiền công trong bảng lương',()=>{
  date='2026-09-24';
  const originals=base.repairLogs.filter(r=>r.buildingId&&r.bearer==='company'&&r.material>=0&&r.labor>=0);
  const chosen=originals.filter((r,i)=>i%5===0).slice(0,32), ids=[];
  for(const [i,r] of chosen.entries()){
    const day=String(2+i%22).padStart(2,'0');
    const row=X.addRepair({workerId:r.workerId,buildingId:r.buildingId,roomId:r.roomId,date:'2026-09-'+day,period,desc:r.desc,jobType:r.jobType,labor:r.labor,material:r.material,bearer:'company',reason:'other',note:'Mẫu T9 theo sổ T8 '+r.code});
    S.update('repairLogs',row.id,{provenance:sample('SRC-16 '+r.excel.sheet+'!'+r.excel.row)});ids.push(row.id);
  }
  X.confirmRepairs(ids);X.postRepairPeriod(period);
  return {jobs:ids.length,labor:sum(S.where('repairLogs',r=>r.period===period),'labor'),material:sum(S.where('repairLogs',r=>r.period===period),'material')};
});

let commissionSheet;
step('05. Sale → hoa hồng → chứng từ chi (SRC-09 HOA HỒNG THÁNG 9.26)',()=>{
  // From 09/2026 commissions live on UI-22 (deal → line → approve → pay), never as a historical import.
  date='2026-09-30';
  const C=source.commissions, CM=TH.calc.commission, r2=n=>Math.round(n*100)/100;
  const cell=row=>`SRC-09 ${C.sheet}!D${row}:M${row}`;
  const roomBy=new Map(S.all('rooms').map(r=>[r.code,r]));
  const lines=[], unmatched=[], dealsCreated=[], dealsReused=new Set(), voided=[];
  const match=r=>{
    const room=roomBy.get(r.room);
    if(!room)return {why:'Không có phòng '+r.room+' trong danh mục web'};
    // A forfeited deposit is a customer who never moved in; SRC-08 has no such stay to attach the deal to.
    if(r.term==='forfeit')return {why:'Bỏ cọc: SRC-08 không có lượt thuê/khách bỏ cọc tương ứng ở '+r.room};
    const stays=S.where('stays',s=>s.roomId===room.id&&s.rent===r.F).sort((a,b)=>String(b.rentStart||'').localeCompare(String(a.rentStart||'')));
    return stays.length?{room,stay:stays[0]}:{why:'Không có lượt thuê giá '+F.vnd(r.F)+' ở '+r.room};
  };
  const dealOf=(stay,r)=>{
    const existing=stay.dealId&&Q.deal(stay.dealId);
    if(existing){dealsReused.add(existing.id);return existing;}
    const closeDate=stay.dealDate||stay.rentStart||'2026-09-01', kind=r.recipientKind;
    const deal=S.add('deals',{code:S.nextCode('deals','GD-'+closeDate.slice(2,4)+closeDate.slice(5,7)+'-',3),leadId:null,customerId:stay.customerId,roomId:stay.roomId,buildingId:stay.buildingId,stayId:stay.id,saleIds:[],
      partner:kind==='partner'?r.recipient:null,source:kind==='partner'?'Đối tác':'CTV',group:'LEAD - CTV',closeDate,moveInDate:stay.moveInDate||stay.rentStart||closeDate,billingStart:stay.rentStart||closeDate,
      term:typeof r.term==='number'?r.term:12,price:stay.rent,deposit:stay.depositAmount||stay.rent,status:stay.status==='pending'?'closed':'received',note:'Giao dịch dựng từ dòng hoa hồng Excel',
      events:[{type:'close',at:closeDate,by:'Đối chiếu SRC-09',note:'Dựng từ '+cell(r.row)}],provenance:evidence('workbook',cell(r.row))});
    S.update('stays',stay.id,{dealId:deal.id});dealsCreated.push(deal.id);return deal;
  };
  for(const r of C.rows){
    const inTotal=r.row>=C.totalFromRow, m=match(r);
    if(!m.stay){unmatched.push({row:r.row,room:r.room,amount:r.I,inTotal,why:m.why});issues.push({kind:'commission_unmatched',ref:cell(r.row),amount:r.I,inTotal,reason:m.why});continue;}
    const deal=dealOf(m.stay,r);
    // The sample deal lines on rooms named in the workbook give way to the workbook recipients.
    for(const c of S.where('commissions',c=>c.dealId===deal.id&&!c.excel&&c.status!=='void'&&!(c.installments||[]).length)){S.update('commissions',c.id,{status:'void',note:'Thay bằng dòng hoa hồng Excel '+C.sheet});voided.push(c.id);}
    const pol=Q.commissionPolicy(deal.closeDate), share=r.share||1;
    const sg=CM.suggest({term:r.term,partner:r.recipientKind==='partner'?r.recipient:null,share},pol);
    const recipient={kind:r.recipientKind==='partner'?'partner':'ctv',name:r.recipient||'CTV chưa ghi tên'};
    const c=S.add('commissions',{dealId:deal.id,buildingId:deal.buildingId,roomId:deal.roomId,recipient,F:r.F,term:r.term??deal.term,share,suggestedH:sg.rate,reasons:sg.reasons,H:sg.rate,deduction:0,amount:CM.amount(r.F,sg.rate),
      status:'pending',approvedAmount:null,approvedBy:null,installments:[],excel:{sheet:C.sheet,row:r.row,H:r.H,I:r.I,inTotal},provenance:evidence('workbook',cell(r.row))});
    // Rate = I/F keeps the approved amount equal to the workbook amount even when the sheet rounds H.
    X.approveCommission(c.id,{H:r.I/r.F,reason:`Theo ${C.sheet}!H${r.row}:I${r.row} (H Excel ${(r.H*100).toFixed(2)}%)`});
    const line={id:c.id,row:r.row,amount:S.get('commissions',c.id).approvedAmount,inTotal,how:null,missing:[]};
    if(!inTotal){line.how='approved_outside_total';issues.push({kind:'commission_outside_excel_total',ref:cell(r.row),amount:r.I,reason:`Ngoài vùng tổng I3 ${C.excelTotalFormula}; đã duyệt, chờ khách xác nhận kỳ chi`});lines.push(line);continue;}
    const el=Q.dealEligibility(deal);
    if(el.ok&&el.date&&el.date<=date){X.payCommission(c.id,{amount:line.amount,date,method:'bank'});line.how='web_pay';}
    else{
      // The workbook marks the line paid; record that payment as it happened, keeping the missing CH-19 evidence visible.
      const e=X.addExpense({category:'commission',reportLine:'marketing',scope:'building',buildingId:deal.buildingId,roomId:deal.roomId,amount:line.amount,date,period,method:'bank',vendor:recipient.name,
        note:`Hoa hồng ${deal.code} – ${recipient.name} theo ${C.sheet}!I${r.row} (Excel ghi Đã tt)`,source:'commission',refId:c.id},true);
      S.update('expenses',e.id,{provenance:evidence('workbook',cell(r.row))});
      S.update('commissions',c.id,{installments:[{amount:line.amount,date,period,expenseId:e.id,by:'Đối chiếu SRC-09'}],status:'paid',paidPerWorkbook:true,eligibilityMissing:el.missing});
      X._.audit('pay','commission',c.id,`Ghi nhận chi theo ${cell(r.row)}: ${F.vnd(line.amount)} (web còn thiếu: ${el.missing.join(', ')||'ngày đủ điều kiện sau kỳ'})`);X._.done();
      line.how='workbook_paid';line.missing=el.missing;
    }
    lines.push(line);
  }
  const sum=xs=>r2(xs.reduce((n,x)=>n+Number(x.amount||0),0));
  const paid=lines.filter(l=>l.how==='web_pay'||l.how==='workbook_paid'), unmatchedIn=unmatched.filter(u=>u.inTotal);
  // Every workbook amount inside the I3 range is either paid on the web or listed as unmatched.
  assert.ok(Math.abs(sum(paid)+sum(unmatchedIn)-C.excelTotal)<2,`Commission reconciliation ${sum(paid)}+${sum(unmatchedIn)}≠${C.excelTotal}`);
  const expenses=S.where('expenses',e=>e.period===period&&e.category==='commission');
  assert.ok(Math.abs(sum(expenses)-sum(paid))<0.5,'Commission expenses must equal paid workbook lines');
  const untouched=S.where('commissions',c=>!c.excel&&c.status!=='void');
  commissionSheet={sheet:C.sheet,excelTotal:C.excelTotal,excelTotalFormula:C.excelTotalFormula,sumAll:C.sumAll,rows:C.rows.length};
  return {sourceRows:C.rows.length,excelTotal:C.excelTotal,excelTotalFormula:C.excelTotalFormula,sumAllRows:C.sumAll,matchedRows:lines.length,dealsCreated:dealsCreated.length,dealsReused:dealsReused.size,sampleLinesVoided:voided.length,
    paidRows:paid.length,paid:sum(paid),paidViaWeb:paid.filter(l=>l.how==='web_pay').length,paidPerWorkbook:paid.filter(l=>l.how==='workbook_paid').length,
    approvedOutsideTotal:lines.filter(l=>l.how==='approved_outside_total').length,approvedOutsideTotalAmount:sum(lines.filter(l=>l.how==='approved_outside_total')),
    unmatchedRows:unmatched.length,unmatchedInTotal:sum(unmatchedIn),unmatchedOutsideTotal:sum(unmatched.filter(u=>!u.inTotal)),
    sampleDealLinesNotInSheet:untouched.length,expenseTotal:sum(expenses)};
});

step('06. Tài sản mua mới → khấu hao, bảo dưỡng và kiểm kê',()=>{
  date='2026-09-15';
  const original=base.assets.find(a=>a.buildingId==='b_G1'&&a.cost>0)||base.assets.find(a=>a.cost>0);
  const cost=original.cost;
  const e=X.addExpense({date,period,category:'equipment',scope:'building',buildingId:'b_G1',amount:cost,qty:1,note:'Máy giặt mẫu tháng 9',depMonths:60,depreciationPolicyStatus:'confirmed',depreciationSource:'Giả định của bộ dữ liệu mẫu: 60 tháng; không thay chính sách tài sản lịch sử',evidence:'Nguyên giá tham khảo '+original.code,source:'demo_september'});
  S.update('expenses',e.id,{provenance:sample(original.id)});
  const asset=S.one('assets',a=>a.expenseId===e.id);assert.ok(asset);
  // Maintenance: planned for the new machine, done by the in-house technician, next cycle generated.
  const tech=Q.emp(S.get('users','u_kythuat')?.employeeId);
  assert.ok(tech,'Need the technician account employee');
  date='2026-09-20';
  const plan=X.planMaintenance({assetId:asset.id,dueDate:'2026-09-25',cycleMonths:6,assigneeId:tech.id,note:'Bảo dưỡng lần đầu sau lắp đặt (mẫu T9)'});
  date='2026-09-25';
  const done=X.completeMaintenance(plan.id,{doneDate:'2026-09-25',performerId:tech.id,result:'Vệ sinh lồng giặt, kiểm tra cấp/xả nước – hoạt động bình thường',cost:0});
  // Inventory: the seeded G1 session was entered before this purchase, so re-open it from the live catalog.
  date='2026-09-28';
  const sid='ivs_'+period+'_b_G1', old=S.get('inventorySessions',sid);
  if(old&&old.status!=='approved')S.remove('inventorySessions',sid);
  const session=Q.inventorySession(period,'b_G1');
  assert.ok(session.lines.some(l=>l.assetId===asset.id),'New asset must be in the September count');
  const prior=new Map((old?.lines||[]).map(l=>[l.assetId,l]));
  const entered=X.enterInventory(period,'b_G1',session.lines.map(l=>{const p=prior.get(l.assetId);return {assetId:l.assetId,actualQty:p?p.actualQty:l.bookQty,condition:p?p.condition:l.condition,note:p?.note||(l.assetId===asset.id?'Tài sản mua 15/09/2026':'')};}));
  const broken=entered.lines.find(l=>l.condition!==l.bookCondition);
  if(broken)X.proposeAssetChange(sid,{assetId:broken.assetId,kind:'condition',to:broken.condition,reason:'Kiểm kê T9 ghi nhận tình trạng: '+((TH.calc.assets.CONDITIONS.find(c=>c[0]===broken.condition)||[])[1]||broken.condition).toLowerCase()});
  X.approveInventory(sid,'admin');
  TH.auth.login('ketoan');X.approveInventory(sid,'ketoan');TH.auth.login('admin');
  const s=S.get('inventorySessions',sid);assert.equal(s.status,'approved');
  S.update('inventorySessions',sid,{provenance:sample('Phiên kiểm kê mẫu G1; kết quả tài sản sẵn có giữ từ phiên demo trước')});
  const mismatch=s.lines.filter(l=>l.actualQty!==l.bookQty).map(l=>({assetId:l.assetId,book:l.bookQty,actual:l.actualQty}));
  mismatch.forEach(x=>issues.push({kind:'inventory_qty_difference',id:x.assetId,reason:`Kiểm kê G1 T9: sổ ${x.book}, thực ${x.actual} – chưa đề xuất sửa danh mục`}));
  return {assetId:asset.id,cost,months:60,maintenanceId:plan.id,maintenanceNextId:done.next?.id||null,inventorySessionId:sid,inventoryLines:s.lines.length,proposals:s.proposals.length,qtyDifferences:mismatch.length};
});

step('06b. Quản lý cập nhật mốc thu 5/10/15 → admin duyệt (SRC-08 cập nhật thu tiền)',()=>{
  // Số đã thu cộng dồn từng tòa tại mốc lấy đúng cột T/U/V của sheet; QL được phân công (tài khoản vanhanh) tự nhập tòa mình,
  // các tòa khác do trưởng phòng nhập thay; admin đối chiếu phiếu thu rồi duyệt. Lương kỳ 9 dùng số đã duyệt.
  const C=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/collection-2026-09.json'),'utf8'));
  const own=new Set(S.where('assignments',a=>a.employeeId===S.get('users','u_vanhanh').employeeId&&a.responsibility==='operate'&&!a.roomId&&(!a.from||a.from<='2026-09-15')&&(!a.to||a.to>='2026-09-15')).map(a=>a.buildingId));
  let reported=0,approved=0,rejected=0,kept=0,mismatch=0,decrease=0;const toApprove=[];
  for(const r of C.buildings){
    const bid='b_'+r.building;
    if(!S.get('buildings',bid)){issues.push({kind:'collection_building_missing',ref:'SRC-08 cập nhật thu tiền!L'+r.row,reason:'Không có tòa '+r.building+' trên web'});continue;}
    const mgr=Q.managerOf(bid,'2026-09-15');
    if(!mgr||mgr.id!=='emp_'+r.managerKey){mismatch++;issues.push({kind:'collection_manager_mismatch',ref:'SRC-08 cập nhật thu tiền!M'+r.row,reason:`Quản lý trên sheet khác phân công web tại 15/09 (${r.building})`});}
    [[1,5,r.T],[2,10,r.U],[3,15,r.V]].forEach(([k,day,amount])=>{
      const st=Q.milestoneState(period,bid,k);
      if(st.approved&&Math.abs(st.approved.amount-amount)<0.5&&!st.pending){kept++;return;}
      date=`2026-09-${String(day+1).padStart(2,'0')}`;
      if(st.pending&&Math.abs(st.pending.amount-amount)<0.5){toApprove.push(st.pending.id);return;}
      if(st.pending){TH.auth.login('admin');X.rejectMilestone(st.pending.id,'Lệch sheet cập nhật thu tiền và phiếu thu – đề nghị nhập lại');rejected++;}
      TH.auth.login(own.has(bid)?'vanhanh':'truongphong');
      const prev=k>1?[r.T,r.U][k-2]:null, down=prev!=null&&amount<prev;
      if(down)decrease++;
      const rec=X.reportMilestone({period,buildingId:bid,milestone:k,amount,evidence:`SRC-08 · cập nhật thu tiền!${'TUV'[k-1]}${r.row}`,note:down?'Số cộng dồn trên sheet giảm so với mốc trước – giữ nguyên số nguồn':''});
      S.update('collectionMilestones',rec.id,{provenance:evidence('workbook',`SRC-08 cập nhật thu tiền!${'TUV'[k-1]}${r.row}`)});
      toApprove.push(rec.id);reported++;
    });
  }
  TH.auth.login('admin');
  for(const id of toApprove){const r=S.get('collectionMilestones',id);date=`2026-09-${String(r.day+2).padStart(2,'0')}`;X.approveMilestone(id,'Đối chiếu sheet cập nhật thu tiền');approved++;}
  date='2026-09-30';
  assert.equal(S.where('collectionMilestones',r=>r.period===period&&r.status==='pending').length,0,'Không còn mốc chờ duyệt trước khi tính lương');
  const cp=Q.collectionProgress(period), inSheet=new Set(C.buildings.map(b=>'b_'+b.building));
  const notInSheet=cp.rows.filter(r=>!inSheet.has(r.buildingId));
  notInSheet.forEach(r=>issues.push({kind:'collection_building_not_in_sheet',id:r.buildingId,reason:`Tòa ${r.code} có hóa đơn kỳ 9 nhưng không có dòng trong sheet cập nhật thu tiền – mốc dùng số phiếu thu, lương gắn cờ chờ duyệt`}));
  return {buildings:C.buildings.length,buildingsNotInSheet:notInSheet.map(r=>r.code),reported,approved,rejected,keptFromSeed:kept,managerMismatch:mismatch,sheetDecreases:decrease,
    cumulative:cp.total.ms.map(Math.round),sheetTotal:[C.total.T,C.total.U,C.total.V],A:Math.round(cp.total.A)};
});

step('07. Chấm công → tính → duyệt → chốt bảng lương',()=>{
  date='2026-09-30';
  // Rates and basic salaries follow August Excel; attendance and low-HS overrides are explicit sample inputs.
  for(const e of S.all('employees')){
    if(Q.salaryPolicyFor(e,'2026-09-30')?.mode==='workday')X.setWorkdays(period,e.id,26);
  }
  const salaries=base.expenses.filter(e=>e.period==='2026-08'&&e.scope==='building'&&['sal_clean','sal_guard'].includes(e.reportLine));
  for(const e of salaries)X.addPayrollManual({period,kind:'building_salary',buildingId:e.buildingId,line:e.reportLine,amount:e.amount,note:'Mẫu T9 theo '+e.note+' · '+e.code});
  const run=completePayroll(TH,period,6000);
  X.closePayroll(run.id);
  S.update('payrollRuns',run.id,{provenance:sample('SRC-03 / SRC-16 tháng 8; ngày công mẫu 26, HS thấp dùng mức mẫu 6.000đ/phòng')});
  return {runId:run.id,employees:run.lines.length,total:sum(run.lines,'X'),obligations:run.obligations.length};
});

step('08. Phân bổ → khóa báo cáo tháng 9',()=>{
  date='2026-09-30';
  // The policy is confirmed only inside this named sample dataset, with an explicit simulation source.
  X.setParam('shareRoundingMode','explicitDelta','2026-09-01','Giả định nghiệm thu bộ dữ liệu mẫu tháng 9',{status:'confirmed',sourceRef:'DEMO-SEPTEMBER: hiện dòng chênh riêng; không tự dồn vào quỹ chung'});
  const allocation=X.saveAllocation(period);X.closeAllocation(allocation.id);
  X.closePeriod(period,{});
  const total=TH.qr.build(period,'total'),business=TH.qr.build(period,'business');
  return {allocationId:allocation.id,rooms:allocation.sumRooms,total:clone(total.cols.TOTAL),business:clone(business.cols.TOTAL),officialMode:business.bizMode};
});

step('09. Bảng kê G1 → chi lương và cổ đông đầu tháng sau',()=>{
  date='2026-10-05';
  const run=S.one('payrollRuns',r=>r.period===period&&r.status==='closed');
  for(const o of run.obligations)X.recordPayrollDisbursement(o.id,{amount:o.amount,date,method:'bank',reference:'Mẫu chi lương tháng 9',evidence:'DEMO-SEPTEMBER · bảng lương '+run.code});
  const share=X.lockShareRun('b_G1',period);
  for(const h of share.rows.filter(h=>h.M>0&&!Q.shareholder(h.id)?.common))X.recordPayout({shareRunId:share.id,shareholderId:h.id,amount:h.M,date,method:'bank',reason:'Chi theo bảng kê mẫu tháng 9 đã khóa'});
  return {shareRunId:share.id,shareTotal:share.totals.M,payrollPaid:Q.payrollDisbursementSummary(run.id).paid,sharePaid:sum(S.where('shareTxns',t=>t.shareRunId===share.id),'amount')};
});

const ops={};
for(const c of new Set([...Object.keys(base),...Object.keys(S.state)])){
  const old=new Map((base[c]||[]).map(r=>[r.id,r])), now=new Map(S.all(c).map(r=>[r.id,r]));
  const diff={};for(const [key,r] of now)if(JSON.stringify(old.get(key))!==JSON.stringify(r))diff[key]=r;
  for(const key of old.keys())if(!now.has(key))diff[key]=0;
  if(Object.keys(diff).length)ops[c]=diff;
}
const assumptions=[
  'Hóa đơn, phiếu thu, cọc, hoàn cọc tháng 9 lấy nguyên từ SRC-08; không sửa số tiền.',
  'Lương cơ bản, chi phí thường xuyên tham khảo tháng 8; ngày công mẫu 26.',
  'Tiền công sửa chữa chọn từ sổ tháng 8, dịch ngày sang tháng 9.',
  'Hoa hồng tháng 9 theo SRC-09 sheet HOA HỒNG THÁNG 9.26: dòng khớp phòng và giá thuê được dựng giao dịch, duyệt đúng thành tiền Excel; ngày chi giả định 30/09/2026 vì Excel chỉ ghi "Đã tt".',
  'Ô tổng I3 = SUBTOTAL(109,I14:I2003) bỏ qua dòng 4–13: các dòng này chỉ duyệt, chưa ghi chi, chờ khách xác nhận kỳ chi.',
  'Dòng Excel đã chi nhưng web còn thiếu điều kiện CH-19 (HĐ ký, thu đủ tháng đầu) được ghi chi theo Excel và gắn cờ paidPerWorkbook; không tự bổ sung hồ sơ.',
  'Dòng bỏ cọc hoặc không khớp phòng/giá không tạo dữ liệu; liệt kê trong danh sách vấn đề.',
  'Ca khách mới dùng biểu phí của một lượt thuê cùng tòa trong SRC-08 và chỉ số bàn giao nối tiếp chỉ số cuối của phòng.',
  'Tài sản mới dùng nguyên giá nguồn, khấu hao mẫu 60 tháng; phiên kiểm kê G1 tháng 9 dựng lại sau ngày mua, giữ kết quả mẫu cũ của tài sản sẵn có.',
  'Mốc thu 5/10/15 từng tòa lấy cột T/U/V sheet "cập nhật thu tiền": QL được phân công (hoặc trưởng phòng nhập thay) cập nhật, admin duyệt; lương vận hành kỳ 9 dùng số đã duyệt thay số tính từ phiếu thu.',
  'Tháng 9 dùng policy lịch sử Excel đã thống nhất; policy Web chính thức bắt đầu tháng 10.'];
const dataset={id,label:'Tháng 9/2026 · luồng đầy đủ',version:2,period,today:'2026-10-05',ops,summary:{steps,issues,sources:source.files,assumptions,commissionSheet}};
dataset.summary.journey=journey;
dataset.files={'builtin:september:contract-flow':{url:'demo/september/contract-flow.pdf',name:'Hop-dong-mau-luong-thang-9.pdf'}};
fs.mkdirSync(path.join(ROOT,'docs/data'),{recursive:true});
fs.mkdirSync(path.join(ROOT,'tmp/september-flow'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'mockup/js/data/seed-september-flow.js'),'/* Generated by scripts/seed/generate-september-flow.mjs; isolated sample dataset. */\nwindow.TH=window.TH||{};TH.data=TH.data||{};TH.data.septemberFlow='+JSON.stringify(dataset)+';\n');
fs.writeFileSync(path.join(ROOT,'docs/data/September_2026_Flow_Manifest.json'),JSON.stringify({...dataset,ops:undefined},null,2)+'\n');
fs.writeFileSync(path.join(ROOT,'tmp/september-flow/state.json'),JSON.stringify(S.state));
console.log(JSON.stringify({collections:Object.keys(ops).length,steps:steps.length,issues:issues.length,bytes:JSON.stringify(dataset).length}));
