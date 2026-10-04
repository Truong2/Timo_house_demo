import test from 'node:test';
import assert from 'node:assert/strict';
import {boot,attempt,completePayroll} from './_app.mjs';
const clean = x => JSON.parse(JSON.stringify(x));
function rental(TH,items={ev:{unit:100000,method:'vehicle'}}) {
  const {store:S,actions:X}=TH;
  const manager=S.all('employees').find(e=>e.title==='NVVH'&&e.status==='active');
  const b=X.addBuilding({code:'G990',address:'Ca kiểm thử',areaId:S.all('areas')[0].id,managerId:manager.id,operatedFrom:'2026-09-01',rooms:1});
  const room=S.one('rooms',r=>r.buildingId===b.id); S.update('rooms',room.id,{price:3000000,listPrice:3000000,mgmtPrice:3000000});
  return X.createStay({roomId:room.id,name:'Khách thử xe',phone:'0909909900',rent:3000000,deposit:0,rentStart:'2026-10-01',endDate:'2027-09-30',status:'active',people:1,vehicles:0,items});
}
const cars = [{plate:'29A-11111',type:'Xe điện',parking:true,charging:true},{plate:'29B-22222',type:'Xe máy',parking:true,charging:false}];
test('vehicle list drives 200,000 legacy charge; effective history, empty list, reading 0 and stay isolation',()=>{
  const TH=boot(),{actions:X,q:Q,store:S}=TH,s=rental(TH);
  X.saveStayVehicles(s.id,{effectiveFrom:'2026-10-01',vehicles:cars});
  const inv=X.createInvoiceDrafts('2026-10',[s.buildingId],{allowMissingReading:true}).created[0];
  assert.equal(inv.lines[7].qty,2); assert.equal(inv.lines[7].amount,200000);
  assert.equal(Q.vehicleCounts(s.id,'2026-10',{vehicles:0}).legacy,0);
  X.saveStayVehicles(s.id,{effectiveFrom:'2026-11-01',vehicles:[]});
  assert.equal(Q.vehicleCounts(s.id,'2026-10').legacy,2); assert.equal(Q.vehicleCounts(s.id,'2026-11').legacy,0);
  const other=S.all('stays').find(t=>t.id!==s.id); assert.equal(Q.vehicleVersionAt(other.id,'2026-12-31'),null);
  assert.equal(attempt(()=>X.saveStayVehicles(s.id,{effectiveFrom:'2026-10-01',vehicles:cars})).ok,false);
  S.saveNow(); S.load(); assert.equal(Q.vehicleCounts(s.id,'2026-11').legacy,0);
});
test('separate parking/charging amounts, stale drafts, recompute and immutable issued snapshots',()=>{
  const TH=boot(),{actions:X,q:Q}=TH,s=rental(TH,{parking:{unit:100000,method:'vehicle'},charging:{unit:50000,method:'vehicle'}});
  X.saveStayVehicles(s.id,{effectiveFrom:'2026-10-01',vehicles:cars});
  let inv=X.createInvoiceDrafts('2026-10',[s.buildingId],{allowMissingReading:true}).created[0];
  assert.equal(inv.lines[7].amount,250000); assert.deepEqual(clean(inv.lines[7].components.map(c=>[c.qty,c.amount])),[[2,200000],[1,50000]]);
  X.saveStayVehicles(s.id,{effectiveFrom:'2026-10-15',vehicles:[cars[0]]});
  assert.equal(X.invoiceDraftStale(inv),true); assert.equal(X.issueInvoices([inv.id]).issued,0);
  inv=X.recomputeInvoiceDraft(inv.id); assert.equal(inv.lines[7].amount,150000); assert.equal(X.invoiceDraftStale(inv),false);
  assert.equal(X.issueInvoices([inv.id]).issued,1); const frozen=JSON.stringify(inv.snapshot);
  X.saveStayVehicles(s.id,{effectiveFrom:'2026-10-16',vehicles:[]}); assert.equal(JSON.stringify(inv.snapshot),frozen);
  assert.equal(Q.vehicleCounts(s.id,'2026-10',{parkingVehicles:0,chargingVehicles:0}).parking,0);
  assert.equal(attempt(()=>X.addRateVersion(s.id,{from:'2026-11-01',reason:'bad',items:{ev:{unit:1},parking:{unit:1}}})).ok,false);
  assert.equal(attempt(()=>X.saveStayVehicles(s.id,{effectiveFrom:'2026-10-20',vehicles:[cars[0],cars[0]]})).ok,false);
});
test('expenses and sales filters intersect effective building scope and exclude unallocated funds',()=>{
  const TH=boot(),{store:S,q:Q}=TH,period='2026-09';
  TH.actions.addExpense({scope:'building',buildingId:'b_G1',category:'repair',reportLine:'repair',date:'2026-09-29',period,amount:100000,note:'Ca lọc chi phí'});
  const expense=S.all('expenses').find(e=>e.scope==='building'&&e.period===period&&e.status!=='void'),b=Q.building(expense.buildingId);
  const rows=Q.expensesFiltered({period,area:b.areaId}); assert.ok(rows.length); assert.ok(rows.every(e=>e.scope!=='fund'&&Q.building(e.buildingId).areaId===b.areaId));
  const leader=Q.teamLeaders('2026-09-30').find(e=>['TNVH','TPVH'].includes(e.title));
  if(leader){const scope=Q.scopeBuildingIds({leader:leader.id},'2026-09-30'); assert.ok(Q.expensesFiltered({period,leader:leader.id}).every(e=>scope.has(e.buildingId)));
    const report=TH.qo.sales(period,'building',{leader:leader.id}); assert.ok(report.conv.every(r=>scope.has(r.key)));}
  TH.auth.login('vanhanh'); assert.ok(Q.expensesFiltered({period}).every(e=>e.scope!=='building'||TH.auth.inScope(e.buildingId)));
});
test('capital statistics select historical owner deposit, asset opening, moves and disposal dates',()=>{
  const TH=boot(),{store:S,actions:X,q:Q}=TH,oc=S.one('ownerContracts',c=>c.buildingId==='b_G1');
  const before=Q.capitalAssetsAt('b_G1','2026-09-30').deposit;
  X.updateOwnerContractMeta(oc.id,{deposit:before+1000000,effectiveFrom:'2026-10-01'});
  assert.equal(Q.capitalAssetsAt('b_G1','2026-09-30').deposit,before); assert.equal(Q.capitalAssetsAt('b_G1','2026-10-31').deposit,before+1000000);
  const a=X.addAsset({name:'Máy thử',type:'washer',ownership:'company',buildingId:'b_G1',cost:1200000,depMonths:12,depStart:'2026-10-01',receivedDate:'2026-10-01',docName:'Hóa đơn',depreciationPolicyStatus:'confirmed',depreciationSource:'Ca thử'});
  assert.ok(!Q.capitalAssetsAt('b_G1','2026-09-30').assets.some(x=>x.id===a.id)); assert.ok(Q.capitalAssetsAt('b_G1','2026-10-31').assets.find(x=>x.id===a.id).remaining<1200000);
  S.update('assets',a.id,{buildingId:'b_G2',history:[{kind:'move',date:'2026-11-01',before:{buildingId:'b_G1'},after:{buildingId:'b_G2'}}]});
  assert.ok(Q.capitalAssetsAt('b_G1','2026-10-31').assets.some(x=>x.id===a.id)); assert.ok(!Q.capitalAssetsAt('b_G1','2026-11-30').assets.some(x=>x.id===a.id));
  S.update('assets',a.id,{status:'disposed',disposal:{date:'2026-12-15',period:'2026-12'}});
  assert.ok(Q.capitalAssetsAt('b_G2','2026-12-01').assets.some(x=>x.id===a.id)); assert.ok(!Q.capitalAssetsAt('b_G2','2026-12-31').assets.some(x=>x.id===a.id));
});
test('salary mode controls formula; manual total can be 0, requires evidence, and invalidates approval',()=>{
  const TH=boot(),{store:S,actions:X,q:Q}=TH,period='2026-10',e=S.all('employees').find(e=>Q.payrollDepartmentKey(e)==='finance'&&e.status==='active');
  X.updateEmployee(e.id,{baseSalary:7000000}); const old=X.previewPayroll(period).lines.find(l=>l.employeeId===e.id); assert.equal(old.base,7000000);
  X.saveSalaryPolicy({department:'finance',mode:'manual',formulaVersion:'FIN-MANUAL-v1',effectiveFrom:'2026-10-01',status:'confirmed',sourceRef:'Quyết định',reason:'Tổng nhập tay'});
  let l=X.previewPayroll(period).lines.find(l=>l.employeeId===e.id); assert.equal(l.base,0); assert.equal(l.X,0); assert.ok(l.missingInputs.length);
  assert.equal(attempt(()=>X.addPayrollManual({period,kind:'manual_total',employeeId:e.id,amount:0,note:''})).ok,false);
  X.addPayrollManual({period,kind:'manual_total',employeeId:e.id,amount:0,note:'Không phát sinh lương kỳ này'});
  l=X.previewPayroll(period).lines.find(l=>l.employeeId===e.id); assert.equal(l.X,0); assert.equal(l.missingInputs.length,0);
  X.addPayrollManual({period,kind:'manual_total',employeeId:e.id,amount:8000000,note:'Tổng gồm phụ cấp'});
  X.addPayrollManual({period,kind:'manual_pay',employeeId:e.id,amount:100000,note:'Điều chỉnh ngoài tổng'});
  l=X.previewPayroll(period).lines.find(l=>l.employeeId===e.id); assert.equal(l.X,8100000); assert.equal(l.lunch,0);
  const run=completePayroll(TH,period); const frozen=JSON.stringify(run.lines);
  X.addPayrollManual({period,kind:'manual_total',employeeId:e.id,amount:9000000,note:'Tổng mới'});
  assert.ok(X.payrollStale(run)); assert.equal(attempt(()=>X.closePayroll(run.id)).ok,false); assert.equal(JSON.stringify(run.lines),frozen);
  assert.equal(attempt(()=>X.saveSalaryPolicy({department:'finance',mode:'operations_hs',formulaVersion:'bad',effectiveFrom:'2026-11-01',status:'confirmed',sourceRef:'test'})).ok,false);
});
test('workday requires explicit days and uses policy across departments',()=>{
  const TH=boot(),{actions:X,store:S,q:Q}=TH,e=S.all('employees').find(e=>Q.payrollDepartmentKey(e)==='finance'&&e.status==='active');
  X.updateEmployee(e.id,{baseSalary:2600000}); X.saveSalaryPolicy({department:'finance',mode:'workday',formulaVersion:'FIN-DAYS',effectiveFrom:'2026-10-01',status:'confirmed',sourceRef:'Test',reason:'Công'});
  let l=X.previewPayroll('2026-10').lines.find(l=>l.employeeId===e.id); assert.ok(l.missingInputs.length);
  X.setWorkdays('2026-10',e.id,13); l=X.previewPayroll('2026-10').lines.find(l=>l.employeeId===e.id); assert.equal(l.base,1300000); assert.equal(l.missingInputs.length,0);
});
test('operations and repair modes preserve formulas; fixed drops HS, leader and repair labor components',()=>{
  const TH=boot(),{store:S,q:Q,actions:X}=TH,period='2026-10';
  const e=S.all('employees').find(e=>e.title==='TPVH'&&e.status==='active');
  const ops=X.previewPayroll(period).lines.find(l=>l.employeeId===e.id); assert.equal(ops.salaryPolicy.mode,'operations_hs'); assert.ok(ops.lead>0);
  X.saveSalaryPolicy({department:'operations',mode:'fixed',formulaVersion:'OPS-FIXED',effectiveFrom:'2026-10-01',status:'confirmed',sourceRef:'Quyết định',reason:'Cố định'});
  const fixed=X.previewPayroll(period).lines.find(l=>l.employeeId===e.id); assert.equal(fixed.W,0); assert.equal(fixed.lead,0); assert.equal(fixed.X,(e.baseSalary||0)+Object.values(e.allowances||{}).reduce((n,v)=>n+v,0));
  const t=S.all('employees').find(e=>e.title==='KỸ THUẬT'&&e.status==='active');
  S.update('employees',t.id,{repairPay:{base:5000000,seniority:100000,lunch:300000},allowances:{fuel:200000,support:50000}});
  X.addPayrollManual({period,kind:'repair_labor',employeeId:t.id,buildingId:'b_G1',amount:400000,note:'Tiền công xác nhận'});
  const repair=X.previewPayroll(period).lines.find(l=>l.employeeId===t.id); assert.equal(repair.X,6050000); assert.equal(repair.labor,400000);
});
test('intake extracts two fees independently and does not duplicate the combined legacy source',()=>{
  const I=boot().intake;
  const split=I.extract('tenant',[{page:1,text:'Gửi xe 100.000 đồng/xe/tháng; Sạc xe điện 50.000 đồng/xe/tháng'}],'fees.pdf');
  assert.equal(split.items.parking.unit,100000); assert.equal(split.items.charging.unit,50000); assert.equal(split.items.ev,undefined);
  const old=I.extract('tenant',[{page:1,text:'Xe điện / gửi xe 100.000 đồng/xe/tháng'}],'old.pdf');
  assert.equal(old.items.ev.unit,100000); assert.equal(old.items.parking,undefined);
  const sheets=I.fromRows('tenant',[['name','phone','parkingUnit','chargingUnit'],['Khách','0909909900',100000,50000]],{file:'fees.xlsx',sheet:'DATA'});
  assert.equal(sheets.length,1); assert.equal(sheets[0].items.parking.unit,100000); assert.equal(sheets[0].items.charging.unit,50000);
});
test('existing-stay OCR preserves both vehicle fees and their file/session/version source',()=>{
  const TH=boot(),{actions:X,q:Q}=TH,s=rental(TH,{});
  const file=X.registerContractFile(s.id,{name:'vehicle-fees.pdf',size:100,blobId:'unit-test-source',signed:false});
  const o=X.createRealOcr(s.id,file.id);
  X.realOcrSource(o.id,file.id,{data:{name:Q.customer(s.customerId).name,phone:'0909909900',buildingCode:'G990',roomCode:Q.room(s.roomId).code,signDate:'2026-10-01',moveInDate:'2026-10-01',startDate:'2026-10-01',svcStart:'2026-10-01',endDate:'2027-09-30',rent:3000000,deposit:0,payMonths:1,dueDay:5,people:1,vehicles:2,elOpen:0},items:{parking:{unit:100000,method:'vehicle'},charging:{unit:50000,method:'vehicle'}},sources:{}},1);
  Q.OCR_GROUPS.forEach(([g])=>X.ocrConfirmGroup(o.id,g,true));
  const rate=X.ocrApply(o.id,{from:'2026-11-01',confirmed:true,signed:false}).version;
  assert.equal(rate.items.parking.unit,100000); assert.equal(rate.items.charging.unit,50000); assert.equal(rate.items.ev,undefined);
  assert.equal(rate.contractFileId,file.id); assert.equal(rate.ocrSessionId,o.id); assert.ok(rate.contractVersionId);
});
test('business web policy removes deposits/refunds/purchases and frozen October retains official mode',()=>{
  const TH=boot(),{store:S,actions:X,qr:QR}=TH,p='2026-10';
  const base={rev_total:1000000,dep_new:200000,refund:50000,cost_equip:100000};
  const b=TH.calc.report.business(base,{mode:'web',depreciation:10000}); assert.equal(b.rev_total,850000); assert.equal(b.refund,0); assert.equal(b.dep_new,0); assert.equal(b.cost_equip,10000);
  assert.equal(QR.build('2026-08','business').bizMode,'excel'); assert.equal(QR.build(p,'business').bizMode,'web');
  S.add('refunds',{id:'rf_test',buildingId:'b_G1',stayId:S.all('stays')[0].id,status:'paid',paidAt:'2026-10-05',paidAmount:50000,deductions:[]});
  const total=QR.build(p,'total').cols.TOTAL, business=QR.build(p,'business'); assert.equal(business.cols.TOTAL.rev_total,total.rev_total-total.dep_new+total.refund); assert.equal(business.cols.TOTAL.refund,0);
  completePayroll(TH,p); X.closePayroll(TH.q.payrollRun(p).id); const alloc=X.saveAllocation(p); X.closeAllocation(alloc.id); X.closePeriod(p);
  const snapshot=S.get('reportSnapshots','rs_'+p); assert.equal(snapshot.officialMode,'web'); const frozen=JSON.stringify(QR.build(p,'business').cols);
  S.update('refunds','rf_test',{paidAmount:999999}); assert.equal(JSON.stringify(QR.build(p,'business').cols),frozen);
  S.saveNow(); S.load(); assert.equal(S.all('params').filter(x=>x.id==='param_business_web_v1').length,1); assert.equal(S.get('refunds','rf_test').paidAmount,999999);
});
