/* Ảnh minh chứng các mục P1 còn lại (4 đợt) → output/verify-p1-remaining/shots/.
   node scripts/verify-p1-remaining.mjs – tự bật server tĩnh ở cổng ngẫu nhiên; mỗi nhóm chạy trong một browser context mới (dữ liệu seed sạch). */
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8990 + Math.floor(Math.random() * 9);
const server = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const dir = path.join(ROOT, 'output', 'verify-p1-remaining', 'shots') + path.sep;
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
    go: async (h, f, opt = {}) => { await p.evaluate(h => { document.querySelectorAll('.overlay').forEach(x => x.remove()); document.body.classList.remove('modal-open'); TH.ui.openCount = 0; location.hash = h; }, h); await p.waitForTimeout(700); if (f) await p.screenshot({ path: dir + f, fullPage: !!opt.full }); },
    click: async (sel, f) => { await p.click(sel); await p.waitForTimeout(600); if (f) await p.screenshot({ path: dir + f }); },
    shot: async (f, opt = {}) => { await p.screenshot({ path: dir + f, fullPage: !!opt.full }); },
  };
  await steps(api); await ctx.close();
};

/* ---------------- Đợt 1 ---------------- */
await group('ketoan', `() => {
  const S = TH.store, X = TH.actions, Q = TH.q;
  const { created } = X.createInvoiceDrafts('2026-10', ['b_G1']);
  const draft = created[0]; X.issueInvoices(created.slice(1).map(i => i.id));
  const inv = created.slice(1).map(i => Q.invoice(i.id)).find(i => Q.lineState(i)[2].amount > 0);
  const s = S.all('stays').find(x => x.status === 'active' && x.buildingId === 'b_G1' && x.rent > 0 && !S.one('payments', p => p.stayId === x.id && p.type === 'prepay'));
  const pp = X.recordPayment({ stayId: s.id, type: 'prepay', amount: s.rent * 3, receivedAt: '2026-09-25', allocations: [], months: 3, fromPeriod: '2026-11' });
  const st = S.all('stays').find(x => x.status === 'active' && x.buildingId === 'b_G1' && X.depositBalance(x.id) > 0 && x.id !== s.id);
  X.endStay(st.id, { endType: 'expired', date: '2026-09-27' });
  const rf = S.one('refunds', r => r.stayId === st.id);
  X.updateRefund(rf.id, { deductions: [{ kind: 'other', qty: 1, unit: X.depositBalance(st.id) + 1200000, note: 'Hư hỏng nội thất' }] });
  TH.auth.login('admin'); X.approveRefund(rf.id); TH.auth.login('ketoan'); X.approveRefund(rf.id); X.payRefund(rf.id, { date: '2026-09-28' });
  return { draft: draft.id, inv: inv.id, stay: inv.stayId, pp: pp.id, rf: rf.id, g17: 'inv_INV-2026-09-501G17A001' };
}`, async ({ go, click, shot, data }) => {
  await go('#/billing/invoices/' + data.draft);
  await click('[data-act=edit]', 'r1-1a-sua-hoa-don-nhap.png');
  await go('#/billing/receipts/new?stay=' + data.stay + '&invoice=' + data.inv, 'r1-2a-ghi-thu-phan-bo-theo-dong.png', { full: true });
  await go('#/billing/invoices/' + data.inv, 'r1-2b-hoa-don-thu-theo-dong.png', { full: true });
  await go('#/billing/receipts/' + data.pp, 'r1-3-tra-truoc-3-thang-ke-hoach.png');
  await go('#/refunds/' + data.rf, 'r1-4a-hoan-coc-vuot-coc.png', { full: true });
  await go('#/billing/debts?state=debt&building=b_G1', 'r1-4b-cong-no-hoa-don-vuot-coc.png');
  await go('#/billing/invoices/' + data.g17, 'r1-5a-g17-chu-nha-da-thu.png', { full: true });
  await go('#/buildings/b_G17?tab=lich-tra', 'r1-5b-g17-lich-tra-bu-tru.png');
  await go('#/billing/invoices?period=2026-09&building=b_G17', 'r1-5c-g17-danh-sach-hoa-don.png');
});

/* ---------------- Đợt 2 ---------------- */
await group('admin', `() => {
  const S = TH.store, X = TH.actions;
  const bt = X.createZaloBatch({ ruleId: 'zr_overdue', period: '2026-09', buildingIds: [] }); X.sendZaloBatch(bt.id);
  try { X.retryZalo(bt.id); } catch (e) {}
  return { batch: bt.id };
}`, async ({ go, click, shot, data, p }) => {
  await go('#/dashboard', 'r2-3-dashboard-phong-trong-moc-thu.png');
  await go('#/settings?tab=tham-so', 'r2-1a-tham-so-co-kieu.png');
  await p.evaluate(() => { const b = [...document.querySelectorAll('[data-act=prm]')].find(x => x.dataset.key === 'milestones'); b && b.click(); }); await p.waitForTimeout(500);
  await p.fill('.overlay [name=value]', '5:100% · 10:90%'); await p.fill('.overlay [name=reason]', 'Thử tham số'); await p.click('.overlay [data-act=submit-d]'); await p.waitForTimeout(500);
  await shot('r2-1b-tham-so-moc-thu-bi-chan.png');
  await go('#/zalo/batches/' + data.batch, 'r2-4a-zalo-dot-gui-sms-du-phong.png');
  await go('#/zalo?tab=du-phong', 'r2-4b-zalo-tab-du-phong-sms.png');
  await go('#/zalo?tab=quy-tac', 'r2-4c-zalo-quy-tac-theo-tham-so.png');
});

/* ---------------- Đợt 3 ---------------- */
await group('admin', `() => {
  const S = TH.store, X = TH.actions, Q = TH.q;
  const emp = S.one('users', u => u.username === 'vanhanh').employeeId;
  const b = S.all('buildings').find(x => x.code === 'S43') || S.all('buildings')[3];
  const rooms = Q.roomsByBuilding()[b.id].filter(r => r.price > 0 && Q.currentStay(r.id));
  X.assign({ employeeId: emp, buildingId: b.id, roomId: rooms[0].id, responsibility: 'operate', from: '2026-09-01', reason: 'Giao riêng một phòng (demo phân công theo phòng)' });
  X.updateBuilding('b_G1', { level: 'Trung bình' });
  return { b: b.id, room: rooms[0].id };
}`, async ({ go, click, shot, data, p }) => {
  await go('#/buildings', 'r3-1a-danh-sach-toa-cot-moi.png', { full: true });
  await go('#/buildings/b_G1'); await click('[data-act=editb]', 'r3-1b-sua-ho-so-toa.png');
  await go('#/buildings/b_G1?tab=phong', 'r3-1c-tab-phong-cot-moi.png');
  await go('#/buildings/b_G1?tab=phong&room=r_304G1'); await click('.overlay [data-act=editroom]', 'r3-1d-sua-phong.png');
  await go('#/hr/assignments?building=' + data.b, 'r3-2a-phan-cong-theo-phong.png');
  await click('[data-act=move]'); await p.selectOption('.overlay [name=buildingId]', data.b); await p.waitForTimeout(300); await p.selectOption('.overlay [name=responsibility]', 'tech'); await p.selectOption('.overlay [name=roomId]', data.room); await p.waitForTimeout(300);
  await shot('r3-2b-form-phan-cong-phong-trach-nhiem.png');
  await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.remove()); document.body.classList.remove('modal-open'); TH.ui.openCount = 0; TH.auth.login('vanhanh'); TH.layout.reset(); TH.router.render(); });
  await go('#/billing/invoices?period=2026-09&building=' + data.b, 'r3-2c-van-hanh-chi-thay-phong-duoc-giao.png');
});

/* ---------------- Đợt 4 ---------------- */
await group('admin', `() => {
  const S = TH.store, X = TH.actions;
  const emp = S.all('employees').find(e => e.title === 'NVVH' && !S.one('users', u => u.employeeId === e.id));
  const u = X.addUser({ username: 'vh.moi', role: 'vanhanh', employeeId: emp.id }); X.setUserStatus(u.id, 'locked', 'Nghỉ phép dài hạn');
  X.addCatalogItem({ kind: 'expenseCategories', key: 'security', label: 'Dịch vụ bảo vệ thuê ngoài', reportLine: 'other', group: 'Chi phí vận hành' });
  X.addCatalogItem({ kind: 'titles', key: 'LE TAN', label: 'Lễ tân' });
  X.setCatalogItemActive('breachReasons', 'Hết công trình', false, 'Gộp vào "Lý do khác"');
  return {};
}`, async ({ go, click, shot, p }) => {
  await go('#/settings?tab=tai-khoan', 'r4-1a-tai-khoan-them-sua-khoa.png');
  await go('#/settings?tab=danh-muc', 'r4-1b-danh-muc-mo-rong.png', { full: true });
  await go('#/settings?tab=tk-nhan'); await click('[data-act=acadd]', 'r4-1c-them-tk-nhan-tien.png');
  for (const [type, f] of [['buildings', 'r4-2a-import-toa-kiem-tra.png'], ['staff', 'r4-2b-import-nhan-vien-kiem-tra.png']]) {
    await go('#/import?type=' + type); await p.click('[data-act=sample]'); await p.waitForTimeout(700);
    const nx = await p.$('[data-act=validate], [data-act=check], [data-act=next]'); if (nx) { await nx.click(); await p.waitForTimeout(700); }
    await shot(f, { full: true });
  }
});

await b.close(); server.kill();
console.log('Ảnh minh chứng P1 còn lại: ' + fs.readdirSync(dir).length + ' file trong output/verify-p1-remaining/shots/' + (errs.length ? ' · lỗi trang: ' + errs.join(' | ') : ' · không có lỗi trang'));
if (errs.length) process.exit(1);
