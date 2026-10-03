/* Kiểm chứng 10 lỗi P0 của đợt audit Phase 1 trên trình duyệt thật (playwright-core + Chrome cài sẵn).
   node scripts/verify-p0.mjs [--label=after] → in bảng PASS/FAIL, ghi output/verify-p0/<label>.{txt,json}.
   Mỗi kịch bản chạy trên dữ liệu seed sạch (xóa localStorage, nạp lại trang). PASS = lỗi không còn tái hiện. */
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const label = (process.argv.find(a => a.startsWith('--label=')) || '--label=run').split('=')[1];
const PORT = 8900 + Math.floor(Math.random() * 90);
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const server = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const base = `http://localhost:${PORT}/`;
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const pageErrors = [];
let ctx = null, page = null;

const fresh = async (user) => {
  // Mỗi kịch bản một browser context mới (localStorage riêng) → dữ liệu dựng lại từ seed sạch
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } }); page = await ctx.newPage();
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto(base + '#/login'); await page.waitForTimeout(600);
  const dirty = await page.evaluate(() => TH.store.dirtyCount()); if (dirty) throw new Error('Dữ liệu chưa sạch: ' + dirty + ' bản ghi thay đổi');
  await page.evaluate(u => { TH.auth.login(u); TH.layout.reset(); TH.router.render(); }, user); await page.waitForTimeout(200);
};
const visit = async (hash) => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(450); return page.evaluate(() => (document.getElementById('content') || document.body).innerText); };
const ev = (fn, arg) => page.evaluate(fn, arg);
const results = [];
const check = (id, name, ok, detail) => { results.push({ id, name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${name}\n      ${detail}`); };

try {
  /* ---------- P0-1 Điện tính hai lần khi phòng có khách cũ + khách chờ vào cùng kỳ ---------- */
  await fresh('ketoan');
  let r = await ev(() => {
    const X = TH.actions, S = TH.store, B = TH.calc.billing;
    const bids = S.all('buildings').map(b => b.id);
    X.createInvoiceDrafts('2026-10', bids, { allowMissingReading: true });
    const drafts = S.all('invoices').filter(i => i.period === '2026-10' && i.lifecycle === 'draft');
    const byRoom = {}; drafts.forEach(i => { (byRoom[i.roomId] = byRoom[i.roomId] || []).push(i); });
    const dbl = Object.entries(byRoom).filter(([, a]) => a.filter(i => B.expand(i.lines)[2].amount > 0).length > 1);
    const ex = dbl.slice(0, 2).map(([room, a]) => TH.q.roomCode(room) + ': ' + a.map(i => i.customerCode + ' điện ' + B.expand(i.lines)[2].amount).join(' / '));
    const g6 = (byRoom.r_206G6 || []).map(i => i.customerCode + ' điện ' + B.expand(i.lines)[2].amount);
    return { drafts: drafts.length, dbl: dbl.length, ex, g6 };
  });
  check('P0-1', 'Không thu tiền điện hai lần cho cùng một phòng trong kỳ 10', r.dbl === 0, `${r.drafts} hóa đơn nháp kỳ 10; ${r.dbl} phòng có ≥2 hóa đơn cùng thu điện. 206G6: ${r.g6.join(' / ') || '–'}${r.ex.length ? ' · ví dụ ' + r.ex.join(' · ') : ''}`);

  /* ---------- P0-2 Thu lại cọc trên hóa đơn đầu của khách đã nộp phiếu cọc ---------- */
  r = await ev(() => {
    const S = TH.store, B = TH.calc.billing;
    const got = (sid) => S.where('depositLedger', l => l.stayId === sid && ['opening', 'receive', 'transfer_in'].includes(l.kind)).reduce((t, l) => t + l.amount, 0);
    const drafts = S.all('invoices').filter(i => i.period === '2026-10' && i.lifecycle === 'draft');
    const withDep = drafts.filter(i => got(i.stayId) > 0);
    const over = withDep.filter(i => B.expand(i.lines)[1].amount > Math.max(0, TH.q.stay(i.stayId).depositAmount - got(i.stayId)) + 0.5);
    const ex = over.slice(0, 3).map(i => `${i.customerCode}: đã nộp cọc ${got(i.stayId)}, dòng 2 = ${B.expand(i.lines)[1].amount}`);
    return { withDep: withDep.length, over: over.length, ex };
  });
  check('P0-2', 'Khách đã nộp phiếu cọc không bị tính cọc lần nữa trên hóa đơn đầu', r.over === 0 && r.withDep > 0, `${r.withDep} hóa đơn nháp của khách đã có cọc trong sổ; ${r.over} hóa đơn vẫn thu lại cọc${r.ex.length ? ' · ' + r.ex.join(' · ') : ''}`);

  /* ---------- P0-3 Tổng in (13 dòng) = tổng cần đóng trên mọi hóa đơn ---------- */
  await fresh('ketoan');
  r = await ev(() => {
    const S = TH.store, B = TH.calc.billing, Q = TH.q;
    const inv = S.all('invoices').filter(i => i.lifecycle !== 'draft');
    const bad = inv.filter(i => Math.abs(B.total(B.expand(i.lines)) - i.totalDue) > 0.5);
    const x = inv.find(i => i.customerCode === '103T25A001'); const st = Q.invState(x);
    const srcErr = inv.filter(i => i.excel && !i.isBreach && Math.abs(i.excel.total - i.totalDue) > 1).length;
    return { n: inv.length, bad: bad.length, ex: bad.slice(0, 3).map(i => i.customerCode), x: { print: B.total(B.expand(x.lines)), due: x.totalDue, paid: st.paid, status: st.status }, srcErr };
  });
  check('P0-3', 'Mọi hóa đơn: tổng in 13 dòng = tổng cần đóng; lệch Excel được gắn cờ', r.bad === 0 && r.x.status !== 'DU', `${r.n} hóa đơn, ${r.bad} hóa đơn tổng in ≠ tổng cần đóng${r.ex.length ? ' (' + r.ex.join(', ') + '…)' : ''}. 103T25: in ${r.x.print}, cần đóng ${r.x.due}, đã thu ${r.x.paid} → ${r.x.status}. Hóa đơn gắn cờ lệch Excel nguồn: ${r.srcErr}`);

  /* ---------- P0-4 Phòng có giá/hóa đơn bị xếp "đồng hồ chung" → HS và mẫu số kỳ live sai ---------- */
  r = await ev(() => {
    const S = TH.store;
    const wrong = S.all('rooms').filter(x => x.exploitation === 'meter_common' && (x.price > 0 || S.all('invoices').some(i => i.roomId === x.id && TH.calc.billing.expand(i.lines)[0].unit > 0)));
    const pv = TH.actions.previewPayroll('2026-09');
    const hs = pv.lines.flatMap(l => l.buildings.map(b => ({ b: TH.q.building(b.buildingId).code, HS: b.HS, J: b.J, L: b.L }))).filter(b => b.J > 0 || b.L > 0);
    const worst = hs.slice().sort((a, b) => (b.HS || 0) - (a.HS || 0))[0];
    const zeroJ = hs.filter(b => !b.J && b.L > 0).map(b => b.b);
    const al = TH.actions.previewAllocation('2026-09');
    return { wrong: wrong.length, ex: wrong.slice(0, 4).map(x => x.code + ' giá ' + x.price), worst, zeroJ, denom: al.denominator };
  });
  check('P0-4', 'Phòng có giá thuê/hóa đơn không bị xếp loại "đồng hồ chung"', r.wrong === 0 && !r.zeroJ.length && r.worst.HS < 200, `${r.wrong} phòng xếp sai${r.ex.length ? ' (' + r.ex.join(', ') + '…)' : ''}; HS cao nhất kỳ 9: ${r.worst.b} = ${r.worst.HS}; tòa có tiền thu nhưng J=0: ${r.zeroJ.join(', ') || 'không'}; mẫu số phân bổ kỳ 9 = ${r.denom}`);

  /* ---------- P0-5 Báo cáo tổng/KD: nghiệm thu trên số web; KPI và cầu nối cùng một số ---------- */
  await fresh('admin');
  const txt = await visit('#/reports/business?period=2026-08');
  r = await ev(() => {
    const num = (s) => Number(String(s).replace(/[^\d-]/g, ''));
    const kpi = [...document.querySelectorAll('.kpi')].find(k => /Lợi nhuận ròng/.test(k.innerText));
    const kpiV = kpi ? num(kpi.querySelector('.vl')?.innerText || '') : null;
    const row = [...document.querySelectorAll('table.bridge tr')].find(t => /= LNR Báo cáo kinh doanh/.test(t.innerText));
    const brV = row ? num(row.querySelector('td.num').innerText) : null;
    const rec = TH.qr.reconcile ? TH.qr.reconcile('2026-08') : null;
    const acc = TH.pages.acceptance1B().find(a => /Báo cáo tổng/.test(a.name));
    return { kpiV, brV, rec: rec && { web: Math.round(rec.web), excel: Math.round(rec.excel), items: rec.items.map(i => i.label + ' ' + Math.round(i.amount)), residual: rec.residual }, acc: acc && (acc.name + ' → ' + (acc.ok ? 'PASS' : 'FAIL')) };
  });
  check('P0-5a', 'Báo cáo KD T8: ô KPI LNR = dòng cuối cầu nối', r.kpiV != null && r.brV != null && Math.abs(r.kpiV - r.brV) <= 1, `KPI LNR ${r.kpiV} · cầu nối ${r.brV}`);
  check('P0-5b', 'Nghiệm thu Báo cáo tổng T8 tính trên số web, chênh Excel giải thích hết từng khoản', !!r.rec && Math.abs(r.rec.residual) < 1, r.rec ? `TCP web ${r.rec.web} − Excel ${r.rec.excel} = ${r.rec.web - r.rec.excel}: ${r.rec.items.join(' | ')} · còn dư ${r.rec.residual.toFixed(2)} · ${r.acc}` : `chưa có đối chiếu trên số web · ${r.acc}`);

  /* ---------- P0-6 Sổ cọc ---------- */
  await fresh('ketoan');
  r = await ev(() => {
    const S = TH.store, X = TH.actions, Q = TH.q, F = TH.f;
    const out = {};
    const free = S.all('rooms').filter(x => x.exploitation === 'timehouse' && x.price > 0 && !Q.currentStay(x.id) && !Q.pendingStay(x.id));
    const bal = (sid) => S.where('depositLedger', l => l.stayId === sid).reduce((t, l) => t + (['opening', 'receive', 'transfer_in'].includes(l.kind) ? l.amount : 0), 0);
    const mk = (room, dep) => X.createStay({ roomId: room.id, name: 'Khách kiểm thử', phone: '0901234567', rentStart: '2026-10-01', endDate: '2027-09-30', rent: room.price, deposit: 3000000, status: 'pending', depositReceived: dep ? { amount: dep, date: '2026-09-25' } : null });
    const rep0 = TH.qr.build('2026-09', 'total').cols.TOTAL; // mốc so sánh trước mọi thao tác
    // a) nhận cọc → trạng thái "đang giữ"; đảo phiếu cọc → sổ cọc về 0
    const s1 = mk(free[0], 3000000);
    out.statusAfterReceive = Q.stay(s1.id).depositStatus;
    out.depAfterReceive = Math.round(TH.qr.build('2026-09', 'total').cols.TOTAL.dep_new - rep0.dep_new);
    const pay = S.one('payments', p => p.stayId === s1.id && p.type === 'deposit');
    X.reversePayment(pay.id, 'Kiểm thử đảo phiếu cọc');
    out.balAfterReverse = bal(s1.id); out.statusAfterReverse = Q.stay(s1.id).depositStatus;
    out.depAfterReverse = Math.round(TH.qr.build('2026-09', 'total').cols.TOTAL.dep_new - rep0.dep_new);
    // b) phiếu cọc không được phân bổ vào hóa đơn
    const inv = S.all('invoices').find(i => i.period === '2026-09' && Q.invState(i).remaining > 1000);
    try { X.recordPayment({ stayId: inv.stayId, type: 'deposit', amount: 1000, receivedAt: '2026-09-28', allocations: [{ invoiceId: inv.id, amount: 1000 }] }); out.depAlloc = 'cho phép'; } catch (e) { out.depAlloc = 'chặn: ' + e.message; }
    // c) chờ nhận phải có cọc; bỏ cọc khi cọc thực nhận = 0 (phiếu đã đảo) → không ghi doanh thu
    try { mk(free[1], 0); out.pendingNoDep = 'cho phép'; } catch (e) { out.pendingNoDep = 'chặn'; }
    X.endStay(s1.id, { endType: 'forfeit', date: '2026-09-28', reason: 'Kiểm thử bỏ cọc sau khi đảo phiếu cọc' });
    out.forfeitNoDeposit = S.where('depositLedger', l => l.stayId === s1.id && l.kind === 'forfeit_revenue').reduce((t, l) => t + l.amount, 0);
    // d) phiếu cọc giữ phòng vào dòng 4 (cọc phòng mới) và dòng 3 của kỳ nhận
    const s3 = mk(free[2], 4000000);
    const rep1 = TH.qr.build('2026-09', 'total').cols.TOTAL;
    out.depNewDelta = Math.round(rep1.dep_new - rep0.dep_new); out.revDelta = Math.round(rep1.rev_total - rep0.rev_total);
    // e) chuyển phòng: bắt buộc phương án cọc khách xác nhận; không chuyển lượt thuê chờ nhận; cọc thiếu được theo dõi
    try { X.transferStay(s3.id, { toRoomId: free[3].id, date: '2026-10-01', newDeposit: 4000000 }); out.transferPending = 'cho phép'; } catch (e) { out.transferPending = 'chặn: ' + e.message; }
    const act = S.all('stays').find(s => s.status === 'active' && bal(s.id) > 0 && S.where('depositLedger', l => l.stayId === s.id).length);
    try { X.transferStay(act.id, { toRoomId: free[4].id, date: '2026-10-01', newDeposit: bal(act.id) + 1400000 }); out.transferNoConfirm = 'cho phép'; } catch (e) { out.transferNoConfirm = 'chặn: ' + e.message; }
    let ns = null;
    try { ns = X.transferStay(act.id, { toRoomId: free[4].id, date: '2026-10-01', newDeposit: bal(act.id) + 1400000, depositPlan: 'carry', depositConfirmed: true }); } catch (e) { out.transferErr = e.message; }
    if (ns) { out.tIn = bal(ns.id); out.tReq = ns.depositAmount; out.tStatus = Q.stay(ns.id).depositStatus; }
    return out;
  });
  check('P0-6a', 'Nhận cọc → "đang giữ"; đảo phiếu cọc → sổ cọc về 0', r.statusAfterReceive === 'held' && r.balAfterReverse === 0 && r.statusAfterReverse !== 'held', `sau nhận: ${r.statusAfterReceive}; sau đảo: số dư sổ cọc ${r.balAfterReverse}, trạng thái ${r.statusAfterReverse}`);
  check('P0-6b', 'Phiếu cọc không phân bổ được vào hóa đơn (tránh đếm hai lần)', /^chặn/.test(r.depAlloc), r.depAlloc);
  check('P0-6c', 'Chờ nhận phải có cọc; bỏ cọc khi cọc thực nhận = 0 không ghi doanh thu', r.pendingNoDep === 'chặn' && r.forfeitNoDeposit === 0, `tạo chờ nhận không cọc: ${r.pendingNoDep}; bỏ cọc sau khi đảo phiếu cọc → doanh thu ${r.forfeitNoDeposit}`);
  check('P0-6d', 'Phiếu cọc giữ phòng vào dòng 4 "Cọc phòng mới" và dòng 3 doanh thu; đảo phiếu thì trừ lại', r.depAfterReceive === 3000000 && r.depAfterReverse === 0 && r.depNewDelta === 4000000 && r.revDelta === 4000000, `dòng 4 so với trước thao tác: nhận cọc 3tr → +${r.depAfterReceive}; đảo phiếu → +${r.depAfterReverse}; thu phiếu cọc 4tr → +${r.depNewDelta} (dòng 3 +${r.revDelta})`);
  check('P0-6e', 'Chuyển phòng: chặn lượt chờ nhận, bắt buộc khách xác nhận phương án cọc, theo dõi phần cọc thiếu', /^chặn/.test(r.transferPending) && /^chặn/.test(r.transferNoConfirm) && r.tStatus === 'partial' && r.tIn < r.tReq, `lượt chờ nhận: ${r.transferPending} · chưa xác nhận: ${r.transferNoConfirm} · sau chuyển: đã có ${r.tIn}/${r.tReq}, trạng thái ${r.tStatus}${r.transferErr ? ' · lỗi ' + r.transferErr : ''}`);

  /* ---------- P0-7 Khóa kỳ giữ cố định số liệu ---------- */
  await fresh('admin');
  r = await ev(() => {
    const S = TH.store, X = TH.actions, out = {};
    const lnr = () => Math.round(TH.qr.build('2026-09', 'total').cols.TOTAL.lnr);
    try { X.closePeriod('2026-09', { force: true }); out.force = 'khóa được khi chưa chốt lương/phân bổ'; X.unlockPeriod('2026-09', 'kiểm thử'); } catch (e) { out.force = 'chặn: ' + e.message; }
    let run = X.computePayroll('2026-09');
    run.lines.forEach(l => l.buildings.filter(b => b.HS != null && b.HS < 70 && !b.manualApplied).forEach(b => X.addPayrollManual({ period: '2026-09', kind: 'ops_below70', employeeId: l.employeeId, buildingId: b.buildingId, amount: 6000, note: 'Mức kiểm thử có lý do' })));
    run = X.computePayroll('2026-09');
    run.lines.forEach(l => l.flags.forEach(f => X.approvePayFlag(run.id, l.employeeId + ':' + f.buildingId, 'kiểm thử')));
    X.closePayroll(run.id); const al = X.saveAllocation('2026-09'); X.closeAllocation(al.id);
    X.closePeriod('2026-09');
    out.before = lnr();
    const tryIt = (k, fn) => { try { fn(); out[k] = 'cho phép'; } catch (e) { out[k] = 'chặn'; } };
    tryIt('computePayroll', () => X.computePayroll('2026-09'));
    tryIt('approveFlag', () => X.approvePayFlag(run.id, 'x:y', 'sau khóa'));
    tryIt('setParam', () => X.setParam('noRentRoomsExcluded', false, '2026-09-15', 'sau khóa'));
    const e0 = S.all('assignments').find(a => !a.to && a.responsibility === 'operate');
    tryIt('assign', () => X.assignBuilding({ employeeId: e0.employeeId, buildingId: e0.buildingId, from: '2026-09-10', reason: 'sau khóa' }));
    const oc = S.all('ownerContracts')[0];
    tryIt('ownerRate', () => X.addOwnerRate(oc.id, { from: '2026-09-01', rent: 99000000, reason: 'sau khóa' }));
    // dữ liệu nguồn đổi (hồ sơ NV, tham số ghi thẳng vào store) → số kỳ đã khóa không đổi
    S.all('employees').forEach(e => S.update('employees', e.id, { hireDate: '2026-09-01' }));
    S.all('rooms').slice(0, 200).forEach(x => S.update('rooms', x.id, { price: 0 }));
    out.after = lnr();
    try { X.addPeriodAdjustment({ period: '2026-09', buildingId: 'b_G1', reportLine: 'other', amount: 1000000, reason: '' }); out.adjNoReason = 'cho phép'; } catch (e) { out.adjNoReason = 'chặn'; }
    try { X.addPeriodAdjustment({ period: '2026-09', buildingId: 'b_G1', reportLine: 'other', amount: 1000000, reason: 'Hóa đơn sửa chữa về muộn' }); out.afterAdj = lnr(); } catch (e) { out.adjErr = e.message; }
    return out;
  });
  const blocked = ['computePayroll', 'approveFlag', 'setParam', 'assign', 'ownerRate'].filter(k => r[k] === 'chặn');
  check('P0-7a', 'Không khóa kỳ khi chưa chốt lương/phân bổ (bỏ "force")', /^chặn/.test(r.force), r.force);
  check('P0-7b', 'Sau khóa: chặn tính lại lương, duyệt cờ, tham số/phân công/giá chủ nhà hiệu lực trong kỳ', blocked.length === 5, `bị chặn ${blocked.length}/5: ${['computePayroll', 'approveFlag', 'setParam', 'assign', 'ownerRate'].map(k => k + '=' + r[k]).join(', ')}`);
  check('P0-7c', 'Sau khóa: đổi dữ liệu nguồn không làm đổi LNR kỳ đã khóa', r.before === r.after, `LNR T9 lúc khóa ${r.before} → sau khi đổi hồ sơ NV + giá 200 phòng ${r.after}`);
  check('P0-7d', 'Điều chỉnh sau khóa: bắt buộc lý do, số điều chỉnh vào báo cáo kỳ gốc', r.adjNoReason === 'chặn' && r.afterAdj === r.after - 1000000, `không lý do: ${r.adjNoReason}; +1.000.000 chi phí khác G1 → LNR ${r.afterAdj ?? '(lỗi: ' + r.adjErr + ')'}`);

  /* ---------- P0-8 Phụ phí phân bổ khi quỹ chưa có chứng từ ---------- */
  await fresh('ketoan');
  r = await ev(() => {
    const S = TH.store, X = TH.actions;
    const al0 = X.previewAllocation('2026-09'); const alloc0 = Math.round(al0.lines.reduce((t, l) => t + l.total, 0));
    // chốt bảng lương kỳ 9 → sinh chứng từ quỹ lương chung, rồi phân bổ
    let run = X.computePayroll('2026-09');
    run.lines.forEach(l => l.buildings.filter(b => b.HS != null && b.HS < 70 && !b.manualApplied).forEach(b => X.addPayrollManual({ period: '2026-09', kind: 'ops_below70', employeeId: l.employeeId, buildingId: b.buildingId, amount: 6000, note: 'Mức kiểm thử có lý do' })));
    run = X.computePayroll('2026-09'); run.lines.forEach(l => l.flags.forEach(f => X.approvePayFlag(run.id, l.employeeId + ':' + f.buildingId, 'kiểm thử'))); X.closePayroll(run.id);
    const al = X.previewAllocation('2026-09');
    const exp = S.all('expenses').filter(e => e.period === '2026-09' && e.scope === 'fund' && e.status !== 'void').reduce((t, e) => t + e.amount, 0);
    const alloc = al.lines.reduce((t, l) => t + l.total, 0);
    const al8 = X.previewAllocation('2026-08'); const g1acct = al8.lines.find(l => l.lineCode === 'sal_acct').results.b_G1;
    const lines = al.lines.map(l => `${l.lineCode}: quỹ ${Math.round(l.fund || 0)} → phân bổ ${Math.round(l.total)}`);
    return { alloc0, exp: Math.round(exp), alloc: Math.round(alloc), g1acct: Math.round(g1acct), lines };
  });
  check('P0-8', 'Kỳ live: tổng phân bổ = tổng chứng từ quỹ (không phụ phí "ảo"); kỳ 08 vẫn tái hiện công thức G1', r.alloc0 === 0 && Math.abs(r.alloc - r.exp) <= 1 && r.g1acct === 181708, `trước khi có chứng từ: phân bổ ${r.alloc0}; sau chốt lương: chứng từ quỹ ${r.exp} → phân bổ ${r.alloc} · kỳ 08 G1 kế toán ${r.g1acct} (Excel 181.708) · ${r.lines.join(' · ')}`);

  /* ---------- P0-9 Lộ dữ liệu theo quyền ---------- */
  await fresh('leader');
  const tLeader = await visit('#/buildings/b_G1?tab=chu-nha-hd');
  const stayId = await ev(() => { const s = TH.store.all('stays').find(x => x.status === 'active' && TH.auth.inScope(x.buildingId)); return s.id; });
  const tRate = await visit('#/stays/' + stayId + '?tab=bieu-phi');
  const tFin = await visit('#/buildings/b_G1?tab=tai-chinh');
  check('P0-9a', 'Leader không xem được HĐ chủ nhà / biểu phí / tài chính tòa qua ?tab=', !/Cọc chủ nhà|48\.000\.000/.test(tLeader) && !/Lịch sử phiên giá/.test(tRate) && !/Chi phí gắn tòa/.test(tFin), `chu-nha-hd: ${/Cọc chủ nhà/.test(tLeader) ? 'LỘ cọc/giá chủ nhà' : 'không lộ'} · bieu-phi: ${/Lịch sử phiên giá/.test(tRate) ? 'LỘ đơn giá' : 'không lộ'} · tai-chinh: ${/Chi phí gắn tòa/.test(tFin) ? 'LỘ chi phí' : 'không lộ'}`);
  await fresh('vanhanh');
  const ids = await ev(() => { const sc = TH.auth.buildingScope(); const inv = TH.store.all('invoices').find(i => !sc.has(i.buildingId)); const rf = TH.store.all('refunds').find(x => !sc.has(x.buildingId) && x.status !== 'paid'); return { inv: inv.id, rf: rf.id, rfCode: rf.code }; });
  const tPrint = await visit('#/print/invoice/' + ids.inv);
  const tRf = await visit('#/refunds/' + ids.rf);
  const tRfp = await visit('#/print/refund/' + ids.rf);
  const upd = await ev((id) => { try { TH.actions.updateRefund(id, {}); return 'cho phép'; } catch (e) { return 'chặn: ' + e.message; } }, ids.rf);
  const leak = (t) => /Tổng cộng|TỔNG CỘNG|Tiền cọc \(I\)|HOÀN CỌC/.test(t) && !/ngoài phạm vi/i.test(t);
  check('P0-9b', 'Vận hành không mở được hóa đơn/phiếu hoàn của tòa ngoài phạm vi (in, chi tiết, sửa)', !leak(tPrint) && !leak(tRf) && !leak(tRfp) && /^chặn/.test(upd), `in hóa đơn: ${leak(tPrint) ? 'LỘ' : 'chặn'} · chi tiết phiếu hoàn ${ids.rfCode}: ${leak(tRf) ? 'LỘ' : 'chặn'} · in phiếu hoàn: ${leak(tRfp) ? 'LỘ' : 'chặn'} · sửa phiếu hoàn: ${upd}`);

  /* ---------- P0-10 CSV lộ số tiền đang bị che ---------- */
  await visit('#/billing/invoices?period=2026-09');
  const csv = await ev(async () => {
    let got = null; const orig = TH.f.download; TH.f.download = (n, c) => { got = c; };
    document.querySelector('[data-act=exp]').click(); await new Promise(r => setTimeout(r, 100)); TH.f.download = orig;
    const lines = String(got || '').trim().split(/\r?\n/); const head = lines[0]; const row = lines[1] || '';
    return { head, row };
  });
  const cells = csv.row.split(',');
  const moneyIdx = csv.head.split(',').map((h, i) => /Tổng cần đóng|Đã đóng|Còn nợ/.test(h) ? i : -1).filter(i => i >= 0);
  const exposed = moneyIdx.filter(i => /\d/.test(cells[i] || ''));
  check('P0-10', 'Vận hành xuất CSV hóa đơn: số tiền bị che như trên màn hình', moneyIdx.length > 0 && exposed.length === 0, `dòng đầu CSV: ${csv.row}`);
} catch (e) {
  console.error('LỖI KỊCH BẢN:', e.message); results.push({ id: 'script', name: 'Kịch bản chạy hết', ok: false, detail: e.message });
} finally {
  await browser.close(); server.kill();
}
const pass = results.filter(x => x.ok).length;
const summary = `\n${pass}/${results.length} kiểm tra PASS${pageErrors.length ? ` · lỗi trang: ${pageErrors.slice(0, 3).join(' | ')}` : ' · không có lỗi trang'}`;
console.log(summary);
const outDir = path.join(ROOT, 'output', 'verify-p0'); fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, label + '.json'), JSON.stringify({ label, at: new Date().toISOString(), results, pageErrors }, null, 2));
fs.writeFileSync(path.join(outDir, label + '.txt'), results.map(x => `${x.ok ? 'PASS' : 'FAIL'}  ${x.id}  ${x.name}\n      ${x.detail}`).join('\n') + summary + '\n');
process.exit(pass === results.length ? 0 : 1);
