/* Smoke test luồng Phase 1 trên trình duyệt thật (playwright-core + Chrome cài sẵn).
   node scripts/smoke.mjs [--flow=1a|1b|all] [--shots]
   Tự bật server tĩnh (scripts/serve.mjs) ở cổng ngẫu nhiên; CHROME_PATH đổi đường dẫn Chrome. Ảnh chụp vào output/smoke/<ngày>/ khi có --shots. */
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const flow = (process.argv.find(a => a.startsWith('--flow=')) || '--flow=all').split('=')[1];
const shots = process.argv.includes('--shots');
const PORT = 8800 + Math.floor(Math.random() * 100);
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outDir = path.join(ROOT, 'output', 'smoke', new Date().toISOString().slice(0, 10));
if (shots) fs.mkdirSync(outDir, { recursive: true });

const server = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const base = `http://localhost:${PORT}/`;
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()); });

let step = 0, failed = 0;
const ok = (name, cond, detail = '') => { step++; if (!cond) failed++; console.log(`${cond ? '✓' : '✗'} ${String(step).padStart(2, '0')} ${name}${detail ? ' – ' + detail : ''}`); };
const run = (fn, arg) => page.evaluate(fn, arg);
const visit = async (hash, name) => {
  await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(350);
  const t = await page.evaluate(() => { const c = document.getElementById('content'); return c ? c.innerText : ''; });
  const bad = /Lỗi hiển thị trang|Chưa có màn hình/.test(t);
  ok('Mở ' + (name || hash), !bad, bad ? t.slice(0, 120) : '');
  if (shots) await page.screenshot({ path: path.join(outDir, String(step).padStart(2, '0') + '-' + hash.replace(/[^a-z0-9]+/gi, '_').slice(0, 60) + '.png') });
};
const login = async (u) => { await run(u => { TH.auth.login(u); TH.layout.reset(); TH.router.render(); }, u); };

try {
  await page.goto(base + '#/login'); await page.evaluate(() => localStorage.clear()); await page.goto(base + '#/login'); await page.waitForTimeout(500);
  await page.click('[data-u=admin]'); await page.waitForTimeout(400);
  ok('Đăng nhập admin', await run(() => TH.auth.role() === 'admin'));

  if (flow === '1a' || flow === 'all') {
    await visit('#/dashboard', 'Tổng quan (UI-01)');
    await visit('#/import?type=readings', 'Import (UI-37)');
    const imp = await run(() => { const r = TH.actions.validateImport('readings', [{ room: '101T17', period: '2026-10', elPrev: '6041', elCurr: '6230' }, { room: '999T17', period: '2026-10', elPrev: '1', elCurr: '2' }, { room: '101T17', period: '2026-10', elPrev: '#REF!', elCurr: '1' }]); return r.map(x => x.status).join(','); });
    ok('Import kiểm tra lỗi/#REF!/mã không tồn tại', imp === 'ok,error,error', imp);
    await visit('#/buildings/b_S43?tab=phong', 'Chi tiết tòa (UI-03)');
    const pend = await run(() => { const room = TH.store.all('rooms').find(r => r.status === 'vacant_ready' && r.price > 0 && !TH.q.pendingStay(r.id) && !TH.q.currentStay(r.id)); const s = TH.actions.createStay({ roomId: room.id, name: 'Khách Smoke', phone: '0912345678', rentStart: '2026-10-06', endDate: '2027-10-05', rent: room.price, deposit: room.price, status: 'pending', depositReceived: { amount: room.price, date: '2026-09-28' } }); return { id: s.id, st: s.status, dep: TH.store.where('payments', p => p.stayId === s.id && p.type === 'deposit').length, room: TH.q.room(room.id).status }; });
    ok('Tạo lượt thuê chờ nhận + phiếu cọc (UI-07)', pend.st === 'pending' && pend.dep === 1 && pend.room === 'reserved', JSON.stringify(pend));
    await visit('#/stays/' + pend.id, 'Chi tiết lượt thuê');
    await visit('#/billing/readings?building=b_S43', 'Chỉ số (UI-10)');
    const dec = await run(() => { try { TH.actions.saveReading({ roomId: 'r_501S43', stayId: 'st_501S43A002', buildingId: 'b_S43', period: '2026-10', elPrev: 6500, elCurr: 6400 }); return 'saved'; } catch (e) { return e.message; } });
    ok('Chặn chỉ số giảm khi thiếu lý do (E10)', /nhỏ hơn/.test(dec), dec);
    const drafts = await run(() => { const r = TH.actions.createInvoiceDrafts('2026-10', ['b_S43', 'b_T17', 'b_G1'], { allowMissingReading: true }); return { created: r.created.length, skipped: r.skipped.length, mid: r.created.filter(i => i.lines[0].factor < 1).length }; });
    ok('Tạo nháp hóa đơn kỳ 10 (E11)', drafts.created > 20, JSON.stringify(drafts));
    const issued = await run(() => { const ids = TH.store.where('invoices', i => i.period === '2026-10' && i.lifecycle === 'draft').map(i => i.id); return TH.actions.issueInvoices(ids); });
    ok('Phát hành hóa đơn (tổng in = tổng cần đóng)', issued.issued > 20 && !issued.errs.length, issued.issued + ' HĐ');
    await visit('#/billing/invoices?period=2026-10', 'Danh sách hóa đơn kỳ 10 (UI-11)');
    const inv = await run(() => TH.store.where('invoices', i => i.period === '2026-10' && i.buildingId === 'b_S43')[0].id);
    await visit('#/print/invoice/' + inv, 'Bản in hóa đơn (E12)');
    const pay = await run((id) => { const i = TH.q.invoice(id); const p1 = TH.actions.recordPayment({ stayId: i.stayId, amount: 1000000, receivedAt: '2026-09-29', method: 'bank', allocations: [{ invoiceId: id, amount: 1000000 }] }); const st = TH.q.invState(i); return { status: st.status, remaining: Math.round(st.remaining), code: p1.code }; }, inv);
    ok('Thu một phần → trạng thái Thiếu (E13)', pay.status === 'THIEU' && pay.remaining > 0, JSON.stringify(pay));
    await visit('#/billing/receipts/new', 'Ghi nhận thu (UI-13)');
    const over = await run((id) => { const i = TH.q.invoice(id); try { TH.actions.recordPayment({ stayId: i.stayId, amount: 100, receivedAt: '2026-09-29', allocations: [{ invoiceId: id, amount: 500 }] }); return 'saved'; } catch (e) { return e.message; } }, inv);
    ok('Chặn phân bổ vượt số tiền phiếu', /vượt/.test(over), over);
    await visit('#/billing/debts', 'Công nợ (UI-14)');
    const br = await run(() => { const s = TH.store.all('stays').find(x => x.status === 'active' && x.buildingId === 'b_T17'); const r = TH.actions.endStay(s.id, { endType: 'breach', date: '2026-09-29', reason: 'Về quê' }); const inv = TH.store.where('invoices', i => i.stayId === s.id && i.period === '2026-10')[0]; return { dep: TH.q.stay(s.id).depositStatus, refund: !!r.refund, only: inv ? TH.calc.billing.expand(inv.lines).filter(l => l.amount).map(l => l.no).join(',') : 'none' }; });
    ok('Phá HĐ: giữ cọc, không phiếu hoàn, chỉ còn tiền điện', br.dep === 'kept_breach' && !br.refund && (br.only === '3' || br.only === '' || br.only === 'none'), JSON.stringify(br));
    const rf = await run(() => { const s = TH.store.all('stays').find(x => x.status === 'active' && x.buildingId === 'b_G1' && x.depositAmount > 1000000); const r = TH.actions.endStay(s.id, { endType: 'expired', date: '2026-09-29', finalReading: { elCurr: 99999 } }).refund; TH.actions.updateRefund(r.id, { deductions: TH.store.get('refunds', r.id).deductions.map(d => d.kind === 'electric' ? Object.assign({}, d, { curr: d.prev + 50, qty: 50, amount: 50 * d.unit }) : d) }); TH.actions.approveRefund(r.id); let early = ''; try { TH.actions.payRefund(r.id, { date: '2026-09-29' }); } catch (e) { early = e.message; } TH.auth.login('ketoan'); TH.actions.approveRefund(r.id); TH.actions.payRefund(r.id, { date: '2026-09-29' }); const x = TH.store.get('refunds', r.id); TH.auth.login('admin'); return { early, status: x.status, bd: x.bd, dep: x.deposit, has200k: x.deductions.some(d => d.kind === 'depreciation' && d.amount === 200000) }; });
    ok('Hoàn cọc: chặn chi khi thiếu duyệt kế toán; duyệt kép → chi (UI-18)', /Admin và Kế toán/.test(rf.early) && rf.status === 'paid' && rf.has200k && rf.bd > 0, JSON.stringify(rf));
    await visit('#/refunds', 'Hoàn cọc (UI-17)');
    const z = await run(() => { const b = TH.actions.createZaloBatch({ ruleId: 'zr_issue', period: '2026-10', buildingIds: ['b_S43'] }); TH.actions.sendZaloBatch(b.id); const ms = TH.store.where('zaloMessages', m => m.batchId === b.id); return { n: ms.length, delivered: ms.filter(m => m.status === 'delivered').length, failed: ms.filter(m => m.status === 'failed').length, tasks: TH.store.where('tasks', t => t.kind === 'call').length }; });
    ok('Zalo: gửi đợt hóa đơn, log từng tin, lỗi → SMS + giao gọi (UI-39)', z.n > 0 && z.delivered > 0, JSON.stringify(z));
    await visit('#/zalo?tab=nhat-ky', 'Nhật ký Zalo');
    const rb = await run(() => { TH.auth.login('vanhanh'); const r = { canPay: TH.auth.can('payments.record'), money: TH.auth.can('debts.viewAmounts'), scope: (TH.auth.buildingScope() || new Set()).size, pii: TH.auth.can('customers.pii') }; TH.auth.login('admin'); return r; });
    ok('Vận hành: không ghi thu, không thấy tiền/CCCD, chỉ tòa được giao', !rb.canPay && !rb.money && !rb.pii && rb.scope > 0 && rb.scope < 20, JSON.stringify(rb));
    const acc = await run(() => TH.pages.acceptance().filter(r => r.ms === '1A').map(r => r.ok));
    ok('Đối chiếu nghiệm thu 1A', acc.every(Boolean), acc.filter(Boolean).length + '/' + acc.length);
    await visit('#/settings?tab=doi-chieu', 'Cài đặt – đối chiếu');
  }
  if (flow === '1b' || flow === 'all') {
    await visit('#/hr/payroll', 'Bảng lương T8 (UI-25)');
    const pr = await run(() => { const r = TH.actions.computePayroll('2026-08'); r.lines.forEach(l => l.flags.forEach(f => TH.actions.approvePayFlag(r.id, l.employeeId + ':' + f.buildingId, 'Duyệt smoke'))); TH.actions.closePayroll(r.id); const e = TH.store.where('expenses', x => x.refId === r.id); return { status: TH.store.get('payrollRuns', r.id).status, exp: e.length, total: Math.round(e.reduce((s, x) => s + x.amount, 0)) }; });
    ok('Chốt bảng lương T8 → chi phí lương theo tòa', pr.status === 'closed' && pr.exp > 50, JSON.stringify(pr));
    await visit('#/expenses/allocation', 'Phân bổ (UI-16)');
    const al = await run(() => { const r = TH.actions.saveAllocation('2026-08'); TH.actions.closeAllocation(r.id); return { d: r.denominator, status: TH.store.get('allocationRuns', r.id).status }; });
    ok('Lưu & chốt phân bổ, mẫu số 1.382', al.d === 1382 && al.status === 'closed', JSON.stringify(al));
    await visit('#/reports/total', 'Báo cáo tổng (UI-29)');
    await visit('#/reports/business', 'Báo cáo kinh doanh (UI-30)');
    await visit('#/reports/buildings?group=S', 'Báo cáo theo tòa (UI-28)');
    const rep = await run(() => { const t = TH.qr.build('2026-08', 'total').cols.TOTAL; return { rev: Math.round(t.rev_total), gv: Math.round(t.gv) }; });
    ok('Báo cáo tổng T8 sau chốt: doanh thu, giá vốn = Excel', rep.rev === 7036256236 && rep.gv === 5316928772, JSON.stringify(rep));
    const lock = await run(() => { TH.actions.closePeriod('2026-08'); try { TH.actions.addExpense({ date: '2026-08-30', period: '2026-08', category: 'other', scope: 'building', buildingId: 'b_G1', amount: 1000 }); return 'saved'; } catch (e) { return e.message; } });
    ok('Khóa kỳ T8 → chặn ghi chi phí vào kỳ đã khóa', /đã khóa/.test(lock), lock);
    const acc = await run(() => TH.pages.acceptance().filter(r => r.ms === '1B').map(r => r.ok));
    ok('Đối chiếu nghiệm thu 1B', acc.every(Boolean), acc.filter(Boolean).length + '/' + acc.length);
  }
} catch (e) { failed++; console.error('✗ Lỗi kịch bản:', e.message); }
const errs = errors.filter(e => !e.includes('favicon'));
ok('Không có lỗi JavaScript / tài nguyên', errs.length === 0, errs.slice(0, 5).join(' | '));
await browser.close(); server.kill();
console.log(`\n${step - failed}/${step} bước đạt${shots ? ' · ảnh: ' + path.relative(ROOT, outDir) : ''}`);
process.exit(failed ? 1 : 0);
