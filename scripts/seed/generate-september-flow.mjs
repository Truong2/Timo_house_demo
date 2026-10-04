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
  const rate=Q.rateOf(deal.stayId);
  const reading=X.saveReading({period,roomId:room.id,buildingId:room.buildingId,stayId:deal.stayId,elPrev:1000,elCurr:1000,waPrev:100,waCurr:100,people:1,vehicles:'',parkingVehicles:'',chargingVehicles:'',readAt:date});
  const created=X.createInvoiceDrafts(period,[room.buildingId],{allowMissingReading:true}).created;
  const invoice=created.find(i=>i.stayId===deal.stayId); assert.ok(invoice);
  created.filter(i=>i.id!==invoice.id).forEach(i=>X.deleteDraft(i.id));
  assert.equal(X.issueInvoices([invoice.id]).issued,1);
  date='2026-09-08';
  const payment=X.recordPayment({stayId:deal.stayId,type:'invoice',amount:invoice.totalDue,receivedAt:date,method:'bank',allocations:[{invoiceId:invoice.id,amount:invoice.totalDue}],note:'Thu đủ hóa đơn ca mẫu tháng 9'});
  S.update('stays',deal.stayId,{provenance:sample('SRC-08 · phòng '+room.code)});
  S.update('invoices',invoice.id,{provenance:sample('SRC-08 · giá/biểu phí phòng '+room.code)});
  journey={leadId:lead.id,dealId:deal.id,stayId:deal.stayId,roomId:room.id,roomCode:room.code,buildingId:room.buildingId,contractId:contract.id,rateId:rate.id,readingId:reading?.id||invoice.readingId,invoiceId:invoice.id,depositId:deposit.id,paymentId:payment.id,rent:price,deposit:price,invoiceTotal:invoice.totalDue,rate:clone(rate)};
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

step('05. Sale → hoa hồng → chứng từ chi',()=>{
  date='2026-09-29';let paid=0,waiting=0,matched=0;
  for(const c of S.all('commissions')){
    const deal=Q.deal(c.dealId);if(!deal||deal.closeDate>'2026-09-30'||deal.status!=='received')continue;
    const row=source.commissions.rows.find(r=>r.room===Q.room(c.roomId)?.code&&r.price===c.F&&typeof r.rate==='number'&&r.rate>0&&r.rate<=1);
    X.approveCommission(c.id,{H:row?.rate||c.H,reason:row?'Theo SRC-09 '+source.commissions.sheet+'!H'+row.row:'Mẫu T9 theo chính sách hoa hồng hiện hành'});
    S.update('commissions',c.id,{provenance:row?evidence('workbook','SRC-09 '+source.commissions.sheet+'!H'+row.row+':I'+row.row):sample('SRC-09 · chính sách hoa hồng / lượt thuê từ SRC-08')});
    if(row)matched++;
    const el=Q.dealEligibility(deal);
    if(el.ok&&el.date<='2026-09-30'){X.payCommission(c.id,{amount:c.approvedAmount,date:el.date>date?el.date:date,method:'bank'});paid++;}
    else {waiting++;issues.push({kind:'commission_waiting',id:c.id,reason:el.missing.join('; ')});}
  }
  return {paid,waiting,matchedSeptemberSource:matched,sourceRows:source.commissions.rows.length,sourceTotal:source.commissions.total};
});

step('06. Tài sản mua mới → khấu hao và kiểm kê',()=>{
  date='2026-09-15';
  const original=base.assets.find(a=>a.buildingId==='b_G1'&&a.cost>0)||base.assets.find(a=>a.cost>0);
  const cost=original.cost;
  const e=X.addExpense({date,period,category:'equipment',scope:'building',buildingId:'b_G1',amount:cost,qty:1,note:'Máy giặt mẫu tháng 9',depMonths:60,depreciationPolicyStatus:'confirmed',depreciationSource:'Giả định của bộ dữ liệu mẫu: 60 tháng; không thay chính sách tài sản lịch sử',evidence:'Nguyên giá tham khảo '+original.code,source:'demo_september'});
  S.update('expenses',e.id,{provenance:sample(original.id)});
  const asset=S.one('assets',a=>a.expenseId===e.id);assert.ok(asset);
  return {assetId:asset.id,cost,months:60};
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
const dataset={id,label:'Tháng 9/2026 · luồng đầy đủ',version:1,period,today:'2026-10-05',ops,summary:{steps,issues,sources:source.files,assumptions:['Lương cơ bản, chi phí thường xuyên tham khảo tháng 8; ngày công mẫu 26.','Tiền công sửa chữa chọn từ sổ tháng 8, dịch ngày sang tháng 9.','Tài sản mới dùng nguyên giá nguồn, khấu hao mẫu 60 tháng.','Phần chi hoa hồng chỉ chạy khi đủ điều kiện; các dòng thiếu căn cứ giữ chờ.','Tháng 9 dùng policy lịch sử Excel đã thống nhất; policy Web chính thức bắt đầu tháng 10.']}};
dataset.summary.journey=journey;
dataset.files={'builtin:september:contract-flow':{url:'demo/september/contract-flow.pdf',name:'Hop-dong-mau-luong-thang-9.pdf'}};
fs.mkdirSync(path.join(ROOT,'docs/data'),{recursive:true});
fs.mkdirSync(path.join(ROOT,'tmp/september-flow'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'mockup/js/data/seed-september-flow.js'),'/* Generated by scripts/seed/generate-september-flow.mjs; isolated sample dataset. */\nwindow.TH=window.TH||{};TH.data=TH.data||{};TH.data.septemberFlow='+JSON.stringify(dataset)+';\n');
fs.writeFileSync(path.join(ROOT,'docs/data/September_2026_Flow_Manifest.json'),JSON.stringify({...dataset,ops:undefined},null,2)+'\n');
fs.writeFileSync(path.join(ROOT,'tmp/september-flow/state.json'),JSON.stringify(S.state));
console.log(JSON.stringify({collections:Object.keys(ops).length,steps:steps.length,issues:issues.length,bytes:JSON.stringify(dataset).length}));
