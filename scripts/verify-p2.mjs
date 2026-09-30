/* Ảnh minh chứng Phase 2 theo kịch bản docs/uat/Phase2_Kich_ban_kiem_thu.md → output/verify-p2/shots/ (tên ảnh = mã kịch bản).
   node scripts/verify-p2.mjs – tự bật server tĩnh ở cổng ngẫu nhiên; mỗi nhóm chạy trong browser context mới (dữ liệu seed sạch). */
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8980 + Math.floor(Math.random() * 9);
const server = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const dir = path.join(ROOT, 'output', 'verify-p2', 'shots') + path.sep;
fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const errs = [];

/* Một nhóm ảnh: context mới, đăng nhập, chạy setup trong trang, rồi chụp các bước */
const group = async (user, setup, steps) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://localhost:${PORT}/#/login`); await p.waitForTimeout(600);
  const data = await p.evaluate(`(() => { TH.auth.login('${user}'); TH.layout.reset(); TH.router.render(); return (${setup})(); })()`);
  const api = {
    p, data,
    login: async (u) => { await p.evaluate(u => { document.querySelectorAll('.overlay').forEach(x => x.remove()); document.body.classList.remove('modal-open'); TH.ui.openCount = 0; TH.auth.login(u); TH.layout.reset(); TH.router.render(); }, u); await p.waitForTimeout(300); },
    go: async (h, f, opt = {}) => { await p.evaluate(h => { document.querySelectorAll('.overlay').forEach(x => x.remove()); document.body.classList.remove('modal-open'); TH.ui.openCount = 0; location.hash = h; }, h); await p.waitForTimeout(700); if (f) await p.screenshot({ path: dir + f, fullPage: !!opt.full }); },
    click: async (sel, f) => { await p.click(sel); await p.waitForTimeout(600); if (f) await p.screenshot({ path: dir + f }); },
    shot: async (f, opt = {}) => { await p.screenshot({ path: dir + f, fullPage: !!opt.full }); },
  };
  await steps(api); await ctx.close();
};

/* ---------------- Đợt 1: kinh doanh & hoa hồng (F21–F24) ---------------- */
await group('sale', `() => {
  const S = TH.store, X = TH.actions, Q = TH.q;
  const l = X.addLead({ phone: '0911222333', name: 'Khách minh họa', source: 'Đăng tin' });
  const r = Q.forSale().find(x => x.kind === 'now').room;
  X.addViewing(l.id, { roomId: r.id, date: '2026-09-28' });
  const d = X.closeDeal({ leadId: l.id, roomId: r.id, price: r.price, deposit: r.price, closeDate: '2026-09-29', moveInDate: '2026-10-01', billingStart: '2026-10-01', term: 12 });
  return { lead: l.id, deal: d.id, stay: d.stayId, phone: S.all('customers')[5].phone };
}`, async ({ go, click, shot, p, data, login }) => {
  await go('#/sales/leads', 'f21-1-khach-xem-cua-sale.png');
  await p.click('[data-act=add]'); await p.waitForTimeout(400);
  await p.fill('.overlay [name=phone]', data.phone); await p.selectOption('.overlay [name=source]', 'Facebook');
  await p.click('.overlay [data-act=submit-d]'); await p.waitForTimeout(500);
  await shot('f21-3-trung-lien-he-E08.png');
  await go('#/sales/deals/' + data.deal, 'f22-1-chot-deal-cho-nhan.png');
  await login('ketoan');
  await p.evaluate((s) => TH.actions.recordPayment({ stayId: s, type: 'deposit', amount: TH.q.stay(s).depositAmount, receivedAt: '2026-09-29', method: 'bank', allocations: [] }), data.stay);
  await login('admin');
  await p.evaluate((d) => TH.actions.receiveDeal(d, '2026-10-01'), data.deal);
  await go('#/sales/deals/' + data.deal, 'f22-4-deal-da-nhan.png');
  await go('#/sales?period=2026-09', 'f22-5-tong-quan-hang.png', { full: true });
});
await group('truongkd', `() => { const S = TH.store, Q = TH.q; const d = S.all('deals').find(x => x.status === 'closed' && Q.dealDeposit(x).held > 0 && TH.auth.inSales(x.saleIds)); TH.actions.forfeitDeal(d.id, { date: '2026-09-29', reason: 'Khách chuyển công tác' }); return { deal: d.id }; }`, async ({ go, data }) => {
  await go('#/sales/deals', 'f23-giao-dich-cua-team.png');
  await go('#/sales/deals/' + data.deal, 'f23-3-khach-bo-coc.png');
});
await group('ketoan', `() => ({})`, async ({ go, p, shot }) => {
  await go('#/sales/commission?tab=doi-chieu', 'f24-1-doi-chieu-hoa-hong-T8.png');
  await go('#/sales/commission?tab=hoa-hong', 'f24-2-hoa-hong-theo-giao-dich.png');
  await p.evaluate(() => { const b = [...document.querySelectorAll('[data-act=ap]')][0]; b && b.click(); }); await p.waitForTimeout(400);
  await p.fill('.overlay [name=H]', '35'); await p.click('.overlay [data-act=submit-d]'); await p.waitForTimeout(400);
  await shot('f24-3-duyet-khac-goi-y-can-ly-do.png');
  await go('#/sales/commission?tab=nhan-su', 'f24-7-nhan-su-sale.png');
  await go('#/sales/commission?tab=chinh-sach', 'f24-chinh-sach-ty-le.png');
});

/* ---------------- Đợt 2: sổ sửa chữa (F25) ---------------- */
await group('ketoan', `() => ({})`, async ({ go }) => {
  await go('#/repairs?period=2026-08&worker=emp_NV94361688&mode=excel', 'f25-1-so-sua-chua-tho-1-nhu-excel.png');
  await go('#/repairs?period=2026-08&worker=emp_NV01060895&mode=web', 'f25-2-tho-2-dong-ngoai-ky.png');
  await go('#/repairs?tab=ung-chi&period=2026-08&mode=excel', 'f25-1b-luong-tho-quyet-toan-ung-chi.png');
  await go('#/repairs?tab=son&period=2026-08', 'f25-8-son.png');
});
await group('kythuat', `() => { TH.actions.addRepair({ date: '2026-09-10', buildingId: 'b_T21', desc: 'Thay vòi sen phòng 203', jobType: 'water', labor: 100000, material: 150000 }); return {}; }`, async ({ go, p, shot }) => {
  await go('#/repairs?period=2026-09', 'f25-3-ky-thuat-so-cua-minh.png');
  await p.click('[data-act=add]'); await p.waitForTimeout(400);
  await p.fill('.overlay [name=date]', '2026-09-27'); await p.selectOption('.overlay [name=period]', '2026-09'); await p.selectOption('.overlay [name=buildingId]', 'b_T21');
  await p.fill('.overlay [name=desc]', 'Sơn lại tường'); await p.selectOption('.overlay [name=jobType]', 'paint'); await p.fill('.overlay [name=labor]', '200000');
  await p.click('.overlay [data-act=submit-d]'); await p.waitForTimeout(400);
  await shot('f25-4-ngay-ngoai-ky-can-ly-do.png');
});
await group('ketoan', `() => {
  const S = TH.store, X = TH.actions;
  const st = S.all('stays').find(s => s.status === 'active' && s.buildingId === 'b_T21' && X.depositBalance(s.id) > 500000);
  X.endStay(st.id, { endType: 'expired', date: '2026-09-28' });
  const w = 'emp_NV94361688';
  const a = X.addRepair({ workerId: w, date: '2026-09-10', buildingId: 'b_T21', roomId: st.roomId, desc: 'Thay khóa cửa – khách làm hỏng', jobType: 'replace', labor: 50000, material: 250000, bearer: 'tenant', note: 'Khách chi' });
  const b = X.addRepair({ workerId: w, date: '2026-09-11', buildingId: 'b_T21', desc: 'Thay bơm tầng thượng', jobType: 'water', labor: 100000, material: 900000, bearer: 'owner' });
  X.addRepair({ workerId: w, date: '2026-09-12', buildingId: 'b_T21', desc: 'Sửa ổ cắm hành lang', jobType: 'electric', labor: 120000, material: 30000 });
  X.confirmRepairs([a.id, b.id]);
  return { rf: S.one('refunds', r => r.stayId === st.id).id };
}`, async ({ go, p, data }) => {
  await go('#/repairs?period=2026-09', 'f25-5-xac-nhan-de-xuat-tru-coc.png', { full: true });
  await p.evaluate(() => { const b = document.querySelector('[data-act=apply]'); b && b.click(); }); await p.waitForTimeout(500);
  await go('#/refunds/' + data.rf, 'f25-6-phieu-hoan-them-dong-sua-chua.png');
  await go('#/buildings/b_T21?tab=lich-tra', 'f25-5b-bu-tru-chu-nha-chiu.png');
  await go('#/hr/payroll?period=2026-09&tab=nhap-tay', 'f25-7-luong-lay-tien-cong-tu-so.png');
});

/* ---------------- Đợt 3: trung tâm báo cáo & báo cáo vận hành (F26–F27) ---------------- */
await group('ketoan', `() => ({})`, async ({ go, p, shot }) => {
  await go('#/reports/amduong?mode=excel&period=2026-07', 'f26-1-am-duong-dien-T7-nhu-excel.png');
  await go('#/reports/amduong?tab=nuoc&mode=excel&period=2026-06', 'f26-2-am-duong-nuoc-T6-nhu-excel.png');
  await go('#/reports/amduong?mode=web&period=2026-09', 'f26-3-am-duong-web-ky-9.png');
  await p.evaluate(() => { const tr = document.querySelector('tr[data-row-open]'); tr && tr.click(); }); await p.waitForTimeout(500);
  await shot('f26-4-am-duong-bam-so-ra-hoa-don.png');
  await go('#/reports/amduong?tab=san-luong', 'f26-san-luong-bien-dong-chi.png');
  await go('#/reports/costs?period=2026-08', 'f27-2-chi-phi-gia-von.png');
  await go('#/reports/costs?period=2026-08&tab=var', 'f27-2b-chi-phi-phat-sinh.png');
  await go('#/reports/repairs?period=2026-08&by=reason', 'f27-3-sua-chua-theo-ly-do.png');
  await go('#/reports/sales?period=2026-09', 'f27-5-ty-le-chuyen-doi.png');
  await go('#/reports/sales?period=2026-09&tab=doanh-so', 'f27-5b-doanh-so-sale.png');
});
await group('truongphong', `() => ({})`, async ({ go }) => {
  await go('#/reports', 'f27-1-trung-tam-bao-cao-4-nhom.png', { full: true });
  await go('#/reports/rooms?period=2026-09', 'f27-4-phong-van-hanh-hs.png');
  await go('#/reports/rooms?period=2026-09&view=pay', 'f27-4b-dong-dung-han.png');
});

/* ---------------- Đợt 4: cổ đông G1, tài liệu, OCR (F28–F29) ---------------- */
await group('ketoan', `() => ({})`, async ({ go, p, shot }) => {
  await go('#/shares?building=b_G1', 'f28-1-co-dong-G1.png');
  await go('#/shares/b_G1?period=2026-08&source=excel', 'f28-3-bang-ke-G1-nhu-excel.png');
  await go('#/shares/b_G1?period=2026-08&source=web', 'f28-3b-bang-ke-G1-web-chenh-OQ04.png');
  await p.evaluate(() => TH.actions.lockShareRun('b_G1', '2026-08', 'web'));
  await go('#/shares/b_G1?period=2026-08', 'f28-4-bang-ke-da-khoa.png');
  await p.evaluate(() => { const Q = TH.q; const rows = Q.shareRatios('b_G1', '2026-08-31').map(r => ({ shareholderId: r.shareholderId, pct: r.shareholderId === 'sh_CHUNG' ? 9 : r.pct })); TH.actions.setShareRatios('b_G1', rows, '2026-09-01', 'Demo E24'); });
  await go('#/shares/b_G1?period=2026-09', null);
  await p.evaluate(() => { const b = document.querySelector('[data-act=lock]'); b && b.click(); }); await p.waitForTimeout(500);
  await shot('f28-2-ty-le-99-chan-khoa-E24.png');
});
await group('ketoan', `() => { const S = TH.store, X = TH.actions; let o; for (const cf of S.all('contractFiles')) { const x = X.runOcr(cf.id); if (x.fields.find(z => z.key === 'deposit').value === '') { o = x; break; } } return { ocr: o.id, stay: o.stayId }; }`, async ({ go, p, shot, data }) => {
  await go('#/stays/' + data.stay + '?tab=hop-dong', 'f29-4a-tab-hop-dong-doc-ocr.png');
  await go('#/ocr/' + data.ocr, 'f29-4-ra-soat-ocr.png', { full: true });
  await p.evaluate(() => { const b = document.querySelector('[data-act=apply]'); b && b.click(); }); await p.waitForTimeout(400);
  await p.click('.overlay [data-act=submit-d]'); await p.waitForTimeout(400);
  await shot('f29-5-E05-chua-ap-dung-duoc.png');
  await p.evaluate((id) => { const X = TH.actions, Q = TH.q; const o = Q.ocrSession(id); const s = Q.stay(o.stayId); X.ocrSetField(id, 'deposit', String(s.depositAmount)); const el = o.fields.find(z => z.key === 'fee_electric'); X.ocrSetField(id, 'fee_electric', String(Number(el.raw) - 500)); Q.OCR_GROUPS.forEach(([g]) => X.ocrConfirmGroup(id, g, true)); X.ocrApply(id, { from: '2026-11-01', reason: 'Đã đối chiếu bản gốc' }); }, data.ocr);
  await go('#/ocr/' + data.ocr, 'f29-6-E06-da-ap-dung.png');
  await go('#/stays/' + data.stay + '?tab=bieu-phi', 'f29-6b-phien-bieu-phi-moi.png');
});
await group('vanhanh', `() => { const b = [...TH.auth.buildingScope()][0]; const d = TH.actions.uploadDocument({ type: 'handover', buildingId: b, name: 'Bien-ban-ban-giao.pdf', size: 250000 }); TH.actions.uploadDocument({ replaceId: d.id, name: 'Bien-ban-ban-giao-v2.pdf' }); return {}; }`, async ({ go, p, shot }) => {
  await go('#/documents', 'f29-1-kho-tai-lieu-pham-vi.png');
  await p.evaluate(() => { const b = document.querySelector('[data-act=ver]'); b && b.click(); }); await p.waitForTimeout(400);
  await shot('f29-2-phien-ban-tai-lieu.png');
});

/* ---------------- Đợt 5: Dashboard, kỳ nâng cao, Zalo (F30) ---------------- */
await group('truongphong', `() => ({ stay: TH.store.all('zaloInbox').find(x => x.status === 'open').stayId })`, async ({ go, data }) => {
  await go('#/dashboard', 'f30-1-dashboard-hs-truong-phong.png');
  await go('#/stays/' + data.stay + '?tab=zalo', 'f30-6-hop-thu-tu-tab-khach.png');
  await go('#/zalo/inbox', 'f30-6b-hop-thu-zalo-truong-phong.png'); // trưởng phòng mở hộp thư riêng (audit B18)
});
await group('sale', `() => ({})`, async ({ go }) => { await go('#/dashboard', 'f30-2-dashboard-sale-deal-cua-toi.png'); });
await group('kythuat', `() => ({})`, async ({ go }) => { await go('#/dashboard', 'f30-dashboard-ky-thuat.png'); });
await group('ketoan', `() => {
  const S = TH.store, X = TH.actions;
  const run = X.computePayroll('2026-10'); run.lines.forEach(l => l.flags.forEach(f => X.approvePayFlag(run.id, l.employeeId + ':' + f.buildingId, 'minh chứng')));
  X.closePayroll(run.id); const al = X.saveAllocation('2026-10'); X.closeAllocation(al.id); X.closePeriod('2026-10');
  X.requestReopen('2026-10', 'Nhập thiếu chi phí sửa chữa tòa T21'); X.approveReopen('2026-10');
  TH.auth.login('admin'); X.approveReopen('2026-10'); TH.auth.login('ketoan');
  X.addExpense({ category: 'repair', scope: 'building', buildingId: 'b_T21', amount: 1234000, date: '2026-10-05', period: '2026-10', note: 'Bổ sung' });
  X.closePeriod('2026-10');
  X.requestReopen('2026-10', 'Kiểm tra lại số phân bổ');
  return {};
}`, async ({ go, p, shot }) => {
  await go('#/settings?tab=ky', 'f30-3-yeu-cau-mo-lai-cho-duyet.png');
  await p.evaluate(() => { const b = document.querySelector('[data-act=cmp]'); b && b.click(); }); await p.waitForTimeout(500);
  await shot('f30-5-so-sanh-phien-ban-chot.png');
  await go('#/zalo?tab=hop-thu', 'f30-6c-hop-thu-toan-he-thong-ke-toan.png');
  await go('#/zalo?tab=quy-tac', 'f30-7-quy-tac-su-kien-moi.png');
});

/* ---------------- Sửa lỗi audit 30/09 (Đợt A–C) ---------------- */
await group('admin', `() => { const S = TH.store, X = TH.actions, Q = TH.q;
  const w = S.all('employees').find(e => e.title === 'KỸ THUẬT' && e.repairPay);
  const r = X.addRepair({ workerId: w.id, date: '2026-09-11', buildingId: 'b_T21', desc: 'Thay bơm', jobType: 'water', labor: 100000, material: 900000, bearer: 'owner' }); X.confirmRepairs([r.id]);
  X.adjustRepair(r.id, { labor: 150000, material: 700000, reason: 'Thợ báo nhầm' });
  return { sh: S.all('shareholders').find(x => !x.common).id, deal: S.all('deals').find(d => d.status === 'closed').id }; }`, async ({ go, data }) => {
  await go('#/hr/payroll?period=2026-09', 'fx-a1-bang-luong-tho-du-luong-co-dinh.png');
  await go('#/repairs?period=2026-09&mode=web', 'fx-b9-so-sua-chua-dieu-chinh.png');
  await go('#/sales/commission', 'fx-c-ui22-hoa-hong-cot-moi-tong-nguoi-nhan.png');
  await go('#/sales/commission?tab=doi-chieu', 'fx-b7-doi-chieu-tong-theo-goi-y.png');
  await go('#/sales/deals/' + data.deal, 'fx-c-ui21-sua-ngay-nhan.png');
  await go('#/reports', 'fx-c-ui27-trung-tam-4-nhom.png');
  await go('#/reports/rooms?period=2026-10', 'fx-c-ui45-hs-tam-tinh-chua-qua-moc.png');
  await go('#/shares?building=b_G1&sh=' + data.sh, 'fx-c-ui31-xem-theo-co-dong.png');
  await go('#/documents', 'fx-c-ui26-tai-xuong-quyen-ocr.png');
});

await b.close(); server.kill();
console.log('Ảnh minh chứng Phase 2: ' + fs.readdirSync(dir).length + ' file trong output/verify-p2/shots/' + (errs.length ? ' · lỗi trang: ' + errs.join(' | ') : ' · không có lỗi trang'));
if (errs.length) process.exit(1);
