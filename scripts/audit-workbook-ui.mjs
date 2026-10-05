/* Read-only audit of app source; browser edits are isolated demo acceptance data. */
import { chromium } from './_dataset.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const local = process.argv.includes('--local'), port = 9820 + Math.floor(Math.random() * 100);
const baseURL = local ? `http://localhost:${port}` : process.env.AUDIT_BASE_URL || 'https://timohousev2.netlify.app';
const out = process.env.AUDIT_OUTPUT_DIR ? path.resolve(ROOT,process.env.AUDIT_OUTPUT_DIR) : path.join(ROOT, 'output/audit-gap-completion-2026-10-04', local ? 'local' : 'live');
await fs.mkdir(out, { recursive: true });
const server = local ? spawn(process.execPath, [path.join(ROOT, 'scripts/serve.mjs')], { cwd: ROOT, env: { ...process.env, PORT: String(port) }, stdio: 'ignore' }) : null;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
page.setDefaultTimeout(12000);
const errors = [], routes = [], findings = [], requests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('request', r => { if (!['GET', 'HEAD'].includes(r.method())) requests.push({ method: r.method(), url: r.url() }); });
const shot = async name => page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
const go = async hash => {
  const valid = await page.evaluate(h => TH.routes.ROUTES.some(r => new RegExp('^' + r.path.replace(/:\w+/g, '[^/]+') + '$').test(h.slice(1).split('?')[0])), hash);
  if (!valid) throw new Error('Audit requested an unknown route: ' + hash);
  await page.evaluate(h => { TH.go(h); TH.router.render(); }, hash);
  await page.waitForTimeout(130);
  const ui = await page.evaluate(() => ({ hash: location.hash, text: document.querySelector('#content')?.innerText || '',
    headings: [...document.querySelectorAll('#content h1,#content h2,#content h3')].map(e => e.textContent.trim()),
    headers: [...document.querySelectorAll('#content th')].map(e => e.textContent.trim()),
    fields: [...document.querySelectorAll('#content input,#content select,#content textarea')].map(e => ({ name: e.name, value: e.value, label: e.labels?.[0]?.textContent?.trim() || '', options: e.tagName === 'SELECT' ? [...e.options].map(o => ({ value: o.value, text: o.textContent.trim() })) : undefined })),
    links: [...document.querySelectorAll('#content a')].map(e => ({ text: e.textContent.trim(), href: e.getAttribute('href') })),
    overflow: document.documentElement.scrollWidth > innerWidth + 2 }));
  routes.push({ requested: hash, ...ui }); return ui;
};
const finding = (id, source, expected, actual, status, evidence) => findings.push({ id, source, expected, actual, status, evidence });
try {
  for (let n = 0; n < 25; n++) { try { await page.goto(baseURL + '/#/login'); break; } catch (e) { if (n === 24) throw e; await new Promise(r => setTimeout(r, 150)); } }
  await page.waitForFunction(() => !!window.TH?.store?.state);
  await page.evaluate(() => { localStorage.clear(); }); await page.reload();
  await page.evaluate(() => { TH.auth.login('admin'); TH.layout.reset(); TH.router.render(); });
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const build = !local ? await (await fetch(baseURL + '/build.json?audit=' + Date.now())).json() : { sha, target: 'mockup source' };
  const sources = [];
  if (!local) {
    const paths = await page.evaluate(() => [...document.scripts].map(s => new URL(s.src || location.href).pathname).filter(p => p.startsWith('/js/')));
    for (let i = 0; i < paths.length; i += 8) {
      sources.push(...await Promise.all(paths.slice(i, i + 8).map(async rel => {
        const remote = await fetch(baseURL + rel + '?audit=' + Date.now());
        const normalize = s => s.replace(/\r\n/g, '\n'), digest = s => createHash('sha256').update(normalize(s)).digest('hex');
        const localText = await fs.readFile(path.join(ROOT, 'mockup', rel.slice(1)), 'utf8'), remoteText = await remote.text();
        return { path: rel, status: remote.status, matchesSource: remote.ok && digest(localText) === digest(remoteText) };
      })));
    }
  }
  const ids = await page.evaluate(() => {
    const S = TH.store, active = S.all('stays').find(s => s.status === 'active'), oc = S.get('ownerContracts', 'oc_G1') || S.all('ownerContracts')[0];
    return { stay: active.id, owner: oc.id, profile: oc.ownerId, building: oc.buildingId,
      refund: S.all('refunds')[0]?.id, employee: S.all('employees')[0].id, invoice: S.all('invoices').find(i => i.lifecycle !== 'draft').id, deal: S.all('deals')[0]?.id };
  });
  const gallery = [
    '#/dashboard', '#/buildings', `#/buildings/${ids.building}`, `#/buildings/${ids.building}?tab=nhan-su`, `#/buildings/${ids.building}?tab=phap-ly`,
    `#/buildings/${ids.building}?tab=tai-san`, '#/owners', `#/owners/${ids.owner}`, `#/owner-profiles/${ids.profile}`, '#/owner-payments',
    '#/tenants', '#/tenants?view=expiring', '#/tenants?view=refund_pending', `#/stays/${ids.stay}?tab=tong-quan`, `#/stays/${ids.stay}?tab=nguoi-thue`,
    `#/stays/${ids.stay}?tab=dich-vu-gia`, `#/stays/${ids.stay}?tab=gia-han`, `#/stays/${ids.stay}?tab=tai-lieu`,
    '#/billing/invoices?period=2026-09', `#/billing/invoices/${ids.invoice}`, '#/billing/debts', '#/expenses', '#/refunds', ...(ids.refund ? [`#/refunds/${ids.refund}`] : []),
    '#/sales', '#/sales/leads', '#/sales/deals', ...(ids.deal ? [`#/sales/deals/${ids.deal}`] : []), '#/sales/commission', '#/sales/commission?tab=nhan-su',
    '#/hr', `#/hr/staff/${ids.employee}`, '#/hr/assignments', '#/hr/payroll?period=2026-09&tab=chinh-sach', '#/hr/payroll?period=2026-09&tab=phien',
    '#/documents', '#/reports/total?period=2026-09', '#/reports/business?period=2026-09', '#/reports/costs', '#/reports/forecast', '#/reports/efficiency',
    '#/reports/rooms', '#/reports/amduong?tab=dich-vu&mode=web&period=2026-09', '#/reports/repairs', '#/reports/rooms?view=seg', '#/reports/sales',
    '#/shares', `#/shares/${ids.building}`, `#/shares/capital?building=${ids.building}&tab=tai-san-coc`,
    '#/assets/maintenance?type=elevator', '#/assets/maintenance?type=pump', '#/assets/maintenance?type=washer', '#/assets/maintenance?type=water_filter', '#/assets/inventory?type=decor'
  ];
  for (let i = 0; i < gallery.length; i++) {
    const r = await go(gallery[i]);
    if (/Lỗi hiển thị trang|Chưa có màn hình|Không tìm thấy trang/.test(r.text)) finding('ROUTE-' + i, 'Menu/routes', gallery[i], r.text.slice(0, 200), 'FAIL', 'routes.json');
    if ([0, 2, 3, 4, 7, 8, 14, 15, 18, 22, 25, 28, 29, 33, 37, 44, 46, 47, 48, 53].includes(i)) await shot('route-' + String(i + 1).padStart(2, '0'));
  }
  const exp = routes.find(r => r.requested === '#/expenses');
  const missingExpenseFilters = ['area', 'manager', 'leader'].filter(name => !exp.fields.some(f => f.name === name));
  finding('EXP-FILTER', 'Tài chính chung!I22', 'Danh sách chi phí lọc được khu vực, NV vận hành, trưởng khu vực', { filters: exp.fields.map(f => f.name), missing: missingExpenseFilters }, missingExpenseFilters.length ? 'FAIL' : 'PASS', 'routes.json: #/expenses');
  const salesStaff = routes.find(r => r.requested === '#/sales/commission?tab=nhan-su');
  finding('SALE-STT', 'KINH DOANH!C37', 'Nhân sự sale có STT', { headers: salesStaff.headers }, salesStaff.headers.includes('STT') ? 'PASS' : 'FAIL', 'route-30.png');
  const salesReport = routes.find(r => r.requested === '#/reports/sales');
  finding('SALE-REPORT-LEADER', 'BÁO CÁO!E22', 'Báo cáo khách hàng/doanh số có lọc trưởng khu vực vận hành', { fields: salesReport.fields.map(f => f.name) }, salesReport.fields.some(f => f.name === 'leader') ? 'PASS' : 'FAIL', 'routes.json: #/reports/sales');
  const fees = await page.evaluate(() => TH.data.catalog.feeTypes.map(f => ({ key: f.key, label: f.label, line: f.line })));
  assert.ok(fees.some(f=>f.key==='parking') && fees.some(f=>f.key==='charging'));

  const assetDates = await page.evaluate(bid=>{
    const S=TH.store,Q=TH.q,X=TH.actions,oc=S.one('ownerContracts',c=>c.buildingId===bid);
    const before=Q.capitalAssetsAt(bid,'2026-09-30');
    X.updateOwnerContractMeta(oc.id,{deposit:before.deposit+1000000,effectiveFrom:'2026-10-01'});
    const a=X.addAsset({name:'Máy audit ngày xem',type:'washer',ownership:'company',buildingId:bid,cost:1200000,depMonths:12,receivedDate:'2026-10-01',depStart:'2026-10-01',docName:'Ca audit',depreciationPolicyStatus:'confirmed',depreciationSource:'Ca audit'});
    const sep=Q.capitalAssetsAt(bid,'2026-09-30'),oct=Q.capitalAssetsAt(bid,'2026-10-31');
    return {beforeDeposit:before.deposit,sepDeposit:sep.deposit,octDeposit:oct.deposit,sepHasAsset:sep.assets.some(x=>x.id===a.id),octRemaining:oct.assets.find(x=>x.id===a.id)?.remaining,expectedRemaining:TH.calc.depreciation.nbv(a,'2026-10')};
  },ids.building);
  for(const date of ['2026-09-30','2026-10-31']){await go(`#/shares/capital?building=${ids.building}&tab=tai-san-coc&to=${date}`);await shot('share-assets-'+date);}
  finding('SHARE-ASOF','TT CỔ ĐÔNG!E2:F2,C5','Cọc lịch sử và tài sản tháng 10 thay đổi theo ngày xem',assetDates,
    assetDates.sepDeposit===assetDates.beforeDeposit && assetDates.octDeposit===assetDates.beforeDeposit+1000000 && !assetDates.sepHasAsset && assetDates.octRemaining===assetDates.expectedRemaining ? 'PASS':'FAIL','share-assets-2026-09-30.png; share-assets-2026-10-31.png');

  const reportPolicy = await page.evaluate(() => {
    const S=TH.store; S.add('refunds',{id:'rf_audit_policy',buildingId:'b_G1',stayId:S.all('stays')[0].id,status:'paid',paidAt:'2026-10-05',paidAmount:50000,deductions:[]});
    const total = TH.qr.build('2026-10', 'total').cols.TOTAL, business = TH.qr.build('2026-10', 'business');
    return { mode: business.bizMode, status: business.policyStatus, params: { addBackRefund: TH.q.param('bizAddBackRefund'), useDepreciation: TH.q.param('bizDepreciation') },
      total: { revenue: total.rev_total, newDeposit: total.dep_new, refund: total.refund, equipment: total.cost_equip, profit: total.lnr },
      business: { revenue: business.cols.TOTAL.rev_total, refund: business.cols.TOTAL.refund, equipment: business.cols.TOTAL.cost_equip, profit: business.cols.TOTAL.lnr } };
  });

  // Edit actual vehicle UI, then generate a native invoice through the billing action.
  const candidate = await page.evaluate(() => {
    const X = TH.actions, S = TH.store, manager = S.all('employees').find(e => e.title === 'NVVH' && e.status === 'active');
    const b = X.addBuilding({ code: 'G990', address: 'Tòa kiểm tra trong phiên browser audit', areaId: S.all('areas')[0].id, managerId: manager.id, operatedFrom: '2026-09-01', rooms: 1 });
    const room = S.one('rooms', r => r.buildingId === b.id);
    S.update('rooms', room.id, { price: 3000000, listPrice: 3000000, mgmtPrice: 3000000 });
    const stay = X.createStay({ roomId: room.id, name: 'Khách kiểm tra xe', phone: '0909909900', rent: 3000000, deposit: 3000000, dealDate: '2026-09-20', rentStart: '2026-10-01', endDate: '2027-09-30', status: 'active', people: 1, vehicles: 0, items: { ev: { unit: 100000, method: 'vehicle' } } });
    const row = X.previewPeriod('2026-10', [b.id]).find(r => r.stay.id === stay.id);
    if (!row) return { unavailable: true };
    const c = TH.q.customer(row.stay.customerId);
    return { stayId: row.stay.id, customerId: c.id, buildingId: row.stay.buildingId, originalBillableVehicles: row.stay.vehicles || 0, originalList: c.vehicles || [] };
  });
  let split;
  if (candidate.unavailable) finding('VEHICLE-BILLING', 'Thông tin khách hàng!G7:G9', 'Khai báo xe được nối sang lượng tính phí', candidate, 'UNVERIFIED', 'No eligible invoice candidate');
  else {
    const count = candidate.originalBillableVehicles + 2;
    await go(`#/stays/${candidate.stayId}?tab=nguoi-thue`);
    await page.click('[data-act=vehicles]');
    while (await page.locator('[data-act=remove-vehicle]').count()) await page.locator('[data-act=remove-vehicle]').first().click();
    for (let n = 0; n < count; n++) {
      await page.click('[data-act=add-vehicle]');
      const row = page.locator('[data-vehicle-row]').last(); await row.locator('input[name^=plate_]').fill('29A-' + (70000 + n)); await row.locator('input[name^=type_]').fill('Xe điện');
      await row.locator('input[name^=parking_]').check(); if(n===0) await row.locator('input[name^=charging_]').check();
    }
    await page.click('[data-act=submit-d]'); await page.waitForSelector('#overlay-root [role=dialog]', { state: 'hidden' }); await shot('vehicle-list');
    const bill = await page.evaluate(({ candidate, count }) => {
      const S = TH.store, X = TH.actions, s = S.get('stays', candidate.stayId);
      const result = X.createInvoiceDrafts('2026-10', [s.buildingId], { allowMissingReading: true });
      const inv = result.created.find(i => i.stayId === s.id), line = inv && TH.calc.billing.expand(inv.lines).find(l => l.no === 8);
      return { customerVehicles: S.get('customers', s.customerId).vehicles.length, stayVehicles: s.vehicles, readingVehicles: inv?.readingId ? S.get('meterReadings', inv.readingId).vehicles : null,
        invoiceId: inv?.id, actualQty: line?.qty, actualAmount: line?.amount, expectedQty: count, unit: 100000, skipped: result.skipped.filter(r => r.stay.id === s.id).map(r => r.issues) };
    }, { candidate, count });
    finding('VEHICLE-BILLING', 'Thông tin khách hàng!G7:G9; yêu cầu liên kết hóa đơn CH-12', 'Xe điện vừa khai báo cập nhật lượng tính phí cho hóa đơn nháp mới', bill, bill.actualQty === count ? 'PASS' : bill.invoiceId ? 'FAIL' : 'UNVERIFIED', 'vehicle-list.png; vehicle-invoice.png');
    if (bill.invoiceId) { await go('#/billing/invoices/' + bill.invoiceId); await shot('vehicle-invoice'); }
    await go(`#/stays/${candidate.stayId}?tab=dich-vu-gia`);
    await page.click('[data-act=newrate]');
    await page.fill('[name=from]','2026-11-01'); await page.fill('[name=u_ev]',''); await page.fill('[name=u_parking]','100000'); await page.fill('[name=u_charging]','50000'); await page.fill('[name=reason]','Tách gửi và sạc theo xác nhận');
    await page.click('[data-act=submit-d]'); await page.waitForSelector('#overlay-root [role=dialog]',{state:'hidden'});
    const displayedCounts=await page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#tb table:first-of-type tbody tr')].filter(r=>['Gửi xe','Sạc xe điện'].includes(r.cells[0]?.textContent)).map(r=>[r.cells[0].textContent,r.cells[3].textContent])));
    assert.equal(displayedCounts['Gửi xe'],'2'); assert.equal(displayedCounts['Sạc xe điện'],'1'); await shot('split-fee-preview');
    split=await page.evaluate(stayId=>{
      const s=TH.q.stay(stayId), inv=TH.actions.createInvoiceDrafts('2026-11',[s.buildingId],{allowMissingReading:true}).created.find(i=>i.stayId===stayId),line=inv.lines[7];
      return {invoiceId:inv.id,amount:line.amount,components:line.components};
    },candidate.stayId);
    finding('FEE-SPLIT','Thông tin khách hàng!G9','Hai xe gửi 200.000đ + một xe sạc 50.000đ = 250.000đ',split,
      split.amount===250000 && split.components[0].qty===2 && split.components[1].qty===1 ? 'PASS':'FAIL','split-vehicle-invoice.png');
    await go('#/billing/invoices/'+split.invoiceId); await shot('split-vehicle-invoice');
    await go('#/print/invoice/'+split.invoiceId); await page.pdf({path:path.join(out,'split-vehicle-invoice.pdf'),format:'A4',printBackground:true});
  }

  const salaryModes = await page.evaluate(() => {
    const X = TH.actions, Q = TH.q, S = TH.store, period = '2026-10';
    const e = S.all('employees').find(e => Q.payrollDepartmentKey(e) === 'finance' && e.status === 'active');
    if (!e) return null;
    X.updateEmployee(e.id, { baseSalary: 7000000 });
    const before = X.previewPayroll(period).lines.find(l => l.employeeId === e.id);
    X.saveSalaryPolicy({ department: 'finance', mode: 'manual', formulaVersion: 'AUDIT-MANUAL', effectiveFrom: '2026-10-01', status: 'confirmed', requiredInputs: 'manual_pay', sourceRef: 'Ca audit policy mode', reason: 'Kiểm tra áp cách tính' });
    const after = X.previewPayroll(period).lines.find(l => l.employeeId === e.id);
    X.addPayrollManual({period,kind:'manual_total',employeeId:e.id,amount:0,note:'Tổng 0 đã xác nhận'});
    const zero=X.previewPayroll(period).lines.find(l=>l.employeeId===e.id);
    X.addPayrollManual({period,kind:'manual_total',employeeId:e.id,amount:8000000,note:'Tổng gồm phụ cấp'});
    const final=X.previewPayroll(period).lines.find(l=>l.employeeId===e.id);
    return { employee: e.id, beforeMode: before.salaryPolicy?.mode, afterMode: after.salaryPolicy?.mode, before: { base: before.base, total: before.X }, after: { base: after.base, total: after.X,missing:after.missingInputs },zero:{total:zero.X,missing:zero.missingInputs}, final:{total:final.X,lunch:final.lunch} };
  });
  finding('SALARY-MODE', 'NHÂN SỰ!A5:A9', 'Kiểm chứng mode nhập tay thực sự điều khiển tính lương; công thức 3 bộ phận còn cần xác nhận nghiệp vụ', salaryModes,
    salaryModes && salaryModes.after.base===0 && salaryModes.after.missing.length && salaryModes.zero.total===0 && !salaryModes.zero.missing.length && salaryModes.final.total===8000000 && salaryModes.final.lunch===0 ? 'PASS':'FAIL', 'salary-mode.png; salary policy + preview calculation');
  await go('#/hr/payroll?period=2026-10&tab=nhap-tay'); await shot('salary-mode');
  for(const amount of [0,8000000]){
    await page.click('[data-act=addtotal]'); await page.selectOption('[name=employeeId]',salaryModes.employee); await page.fill('[name=amount]',String(amount)); await page.fill('[name=note]','Tổng lương xác nhận bằng UI, gồm phụ cấp');
    await page.click('[data-act=submit-d]'); await page.waitForSelector('#overlay-root [role=dialog]',{state:'hidden'});
    const actual=await page.evaluate(id=>TH.actions.previewPayroll('2026-10').lines.find(l=>l.employeeId===id).X,salaryModes.employee);
    assert.equal(actual,amount,'Manual salary UI keeps explicit zero and total');
  }
  finding('BUSINESS-REFUND', 'BÁO CÁO!D6', 'Báo cáo kinh doanh không gồm cọc mới, hoàn cọc, mua sắm thiết bị', reportPolicy,
    reportPolicy.mode==='web' && reportPolicy.status==='confirmed' && reportPolicy.business.refund===0 && reportPolicy.business.revenue===reportPolicy.total.revenue-reportPolicy.total.newDeposit+reportPolicy.total.refund ? 'PASS':'FAIL', 'business-policy.png');
  await go('#/reports/business?period=2026-10'); await shot('business-policy');
  const roleChecks=await page.evaluate(()=>{
    const results=[];
    for(const role of ['ketoan','codong','vanhanh']){
      TH.auth.login(role); const rep=TH.qr.build('2026-10','business');
      const expenses=TH.q.expensesFiltered({period:'2026-09'});
      results.push({role,mode:rep.bizMode,expensesInScope:expenses.every(e=>e.scope==='fund'||TH.auth.inScope(e.buildingId))});
    }
    TH.auth.login('admin'); return results;
  });
  assert.ok(roleChecks.every(r=>r.mode==='web'&&r.expensesInScope),'Official web report and expense scope for roles');
  const responsive = [];
  for (const width of [375, 768,1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const hash of ['#/dashboard', '#/expenses', '#/sales/commission?tab=nhan-su', '#/reports/sales', '#/assets/inventory?type=decor','#/hr/payroll?period=2026-10&tab=nhap-tay','#/reports/business?period=2026-10',`#/stays/${candidate.stayId}?tab=dich-vu-gia`,'#/billing/invoices/'+split.invoiceId]) {
      const ui = await go(hash); responsive.push({ width, hash, overflow: ui.overflow });
      if (ui.overflow) finding('RESP-' + width + '-' + responsive.length, 'Responsive', 'Không tràn ngang trang', ui.hash, 'FAIL', 'routes.json');
    }
    await shot('responsive-' + width);
    for (const [name,hash,act] of [['vehicles',`#/stays/${candidate.stayId}?tab=nguoi-thue`,'vehicles'],['fees',`#/stays/${candidate.stayId}?tab=dich-vu-gia`,'newrate'],['salary','#/hr/payroll?period=2026-10&tab=nhap-tay','addtotal']]) {
      await go(hash); await page.click(`[data-act=${act}]`); await page.waitForTimeout(250);
      const dialog=page.locator('#overlay-root [role=dialog]');
      const bounds=await dialog.evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,viewport:innerWidth};});
      assert.ok(bounds.left>=-1 && bounds.right<=bounds.viewport+1,`${name} form fits ${width}px`);
      await dialog.locator('[data-act=submit-d]').scrollIntoViewIfNeeded(); await shot(`form-${name}-${width}`);
      await dialog.locator('[data-act=close-d]').click();
    }
  }
  await go(`#/stays/${candidate.stayId}?tab=nguoi-thue`); await page.click('[data-act=vehicles]');
  while(await page.locator('[data-act=remove-vehicle]').count()) await page.locator('[data-act=remove-vehicle]').first().click();
  await page.click('[data-act=submit-d]'); await page.waitForSelector('#overlay-root [role=dialog]',{state:'hidden'});
  assert.ok((await page.locator('#tb').innerText()).includes('Đã xác nhận 0 xe'),'Confirmed empty vehicle list is explicit on profile');
  assert.equal(await page.evaluate(id=>TH.q.vehicleCounts(id,'2026-11').parking,candidate.stayId),0); await shot('vehicle-list-empty');
  await fs.writeFile(path.join(out, 'routes.json'), JSON.stringify(routes, null, 2));
  await fs.writeFile(path.join(out, 'audit.json'), JSON.stringify({ checkedAt: new Date().toISOString(), baseURL, sourceSha: sha, build, scripts: sources,
    initialRouteCount: gallery.length, visitedCount: routes.length, roles: ['admin'], roleServiceChecks:roleChecks, findings, responsive, errors, mutatingRequests: requests }, null, 2));
  console.log(JSON.stringify({ baseURL, build, sources: sources.length, mismatches: sources.filter(s => !s.matchesSource), routes: gallery.length, findings, errors, mutatingRequests: requests }, null, 2));
  assert.equal(findings.filter(f=>f.status!=='PASS').length,0,'Audit gaps must all pass'); assert.equal(errors.length,0,'No browser errors');
  if(!local) assert.equal(sources.filter(s=>!s.matchesSource).length,0,'Live JavaScript matches source');
} finally { await browser.close(); server?.kill(); }
