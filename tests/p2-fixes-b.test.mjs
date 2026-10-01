/* Phase 2 – sửa lỗi audit 30/09, Đợt B (lỗi mức trung bình). Kịch bản docs/uat/Phase2_Kich_ban_kiem_thu.md mục "Audit 30/09 – lỗi đã sửa". */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));
const lock = (TH, period) => { const S = TH.store; const ms = S.meta.milestone; S.meta.milestone = '1A'; TH.actions.closePeriod(period); S.meta.milestone = ms; };
const reopen = (TH, period) => { const X = TH.actions; const u = TH.store.session.username; TH.auth.login('ketoan'); X.requestReopen(period, 'kiểm thử'); X.approveReopen(period); TH.auth.login('admin'); X.approveReopen(period); TH.auth.login(u); };
const worker = (TH) => TH.store.all('employees').filter(e => e.title === 'KỸ THUẬT' && e.repairPay)[0];

test('B1 – đổi phòng trước khi nhận: giá mới + biểu dịch vụ tòa mới vào phiên biểu phí (hóa đơn tính đúng)', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const fs = Q.forSale().filter(x => x.kind === 'now').map(x => x.room);
  const a = fs[0], b = fs.find(r => r.buildingId !== a.buildingId);
  const l = X.addLead({ phone: '0977000222', source: 'Zalo', saleId: Q.salesStaff()[0].id });
  const d = X.closeDeal({ leadId: l.id, roomId: a.id, price: a.price, deposit: a.price, closeDate: '2026-09-28', billingStart: '2026-10-01', term: 12 });
  X.transferDeal(d.id, { toRoomId: b.id, price: 3500000, reason: 'Khách đổi ý' });
  const rv = Q.rateOf(d.stayId);
  assert.equal(rv.rent, 3500000); assert.equal(Q.stay(d.stayId).rent, 3500000);
  const ref = Q.rateOf((S.where('stays', x => x.buildingId === b.buildingId && x.status === 'active')[0] || {}).id);
  assert.deepEqual(plain(Object.keys(rv.items).sort()), plain(Object.keys(ref.items).sort()), 'biểu dịch vụ của tòa mới');
});

test('B2 – hủy chứng từ chi hoa hồng ở UI-15 → gỡ đợt chi, dòng hoa hồng chi lại được', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const c = S.all('commissions').find(x => x.status === 'approved' && Q.dealEligibility(Q.deal(x.dealId)).ok);
  const e = X.payCommission(c.id, { amount: c.approvedAmount, date: '2026-09-30' });
  assert.equal(S.get('commissions', c.id).status, 'paid');
  X.voidExpense(e.id, 'Chi nhầm người nhận');
  const c2 = S.get('commissions', c.id); assert.equal(c2.status, 'approved'); assert.equal(Q.commissionPaid(c2), 0);
  assert.ok(attempt(() => X.payCommission(c.id, { amount: c.approvedAmount, date: '2026-09-30' })).ok);
});

test('B3 – import hoa hồng ở mốc 2: chỉ lịch sử ≤ 08/2026 (không cộng hai lần với hoa hồng tính trên web)', () => {
  const TH = boot({ user: 'ketoan' }); const X = TH.actions, S = TH.store;
  const room = S.all('rooms').find(r => r.price > 0);
  const v = X.validateImport('commissions', [{ code: 'HH-X1', period: '2026-09', room: room.code, sale: 'A', F: '2000000', H: '50%', amount: '1000000' }, { code: 'HH-X2', period: '2026-08', room: room.code, sale: 'A', F: '2000000', H: '50%', amount: '1000000' }]);
  assert.equal(v[0].status, 'error'); assert.match(v[0].errs.join(), /lịch sử/);
  assert.equal(v[1].status, 'ok');
});

test('B4 – ⛔ sale gắn liên hệ trùng vào khách của sale khác', () => {
  const TH = boot({ user: 'sale' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const other = S.all('leads').find(l => !TH.auth.inSales(l.saleIds));
  const r = attempt(() => X.addLead({ phone: other.phone, source: 'Zalo', attachTo: other.id, note: 'gọi lại' }));
  assert.ok(!r.ok && /ngoài phạm vi/.test(r.msg));
  assert.equal(Q.lead(other.id).note, other.note);
});

test('B5 – bỏ cọc làm số hoa hồng nhỏ hơn số đã chi → "đã chi đủ" + khoản cần thu hồi (không kẹt chờ duyệt)', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const d = S.all('deals').find(x => x.status === 'closed' && (Q.stay(x.stayId) || {}).status === 'pending' && Q.dealDeposit(x).held > 0);
  const c = Q.commissionsOf(d.id)[0];
  S.update('commissions', c.id, { status: 'approved', approvedAmount: c.amount, installments: [{ amount: c.amount, date: '2026-09-20', period: '2026-09', expenseId: null, by: 'test' }] });
  X.forfeitDeal(d.id, { date: d.billingStart, reason: 'Khách bỏ' });
  const c2 = S.get('commissions', c.id);
  assert.equal(c2.status, 'paid'); assert.ok(c2.recover > 0); assert.equal(c2.term, 'forfeit'); assert.match(c2.note, /thu hồi/);
});

test('B7 – đối chiếu NT-1 báo cả tổng theo tỷ lệ gợi ý (không chỉ tự khớp F × H của Excel)', () => {
  const TH = boot({ user: 'ketoan' }); const B = TH.q.commissionBench();
  assert.ok(Math.abs(B.webTotal - 227476935.5) < 0.05);
  assert.ok(B.suggestedTotal > B.excelTotal, 'engine chưa có mức 35% riêng → cao hơn Excel');
  assert.equal(Math.round(B.suggestedDiff * 100), Math.round((B.suggestedTotal - B.excelTotal) * 100));
});

test('B8 – xác nhận nhiều dòng: một dòng lỗi → không dòng nào bị áp (hai pha)', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions;
  const w = worker(TH);
  const noOwner = S.all('buildings').find(b => !S.one('ownerContracts', c => c.buildingId === b.id && c.status === 'active'));
  const rC = X.addRepair({ workerId: w.id, date: '2026-09-10', buildingId: 'b_T21', desc: 'Sửa ổ cắm', jobType: 'electric', labor: 100000, material: 0 });
  const rO = X.addRepair({ workerId: w.id, date: '2026-09-10', buildingId: noOwner.id, desc: 'Thay bơm', jobType: 'water', labor: 100000, material: 500000, bearer: 'owner' });
  assert.ok(!attempt(() => X.confirmRepairs([rC.id, rO.id])).ok);
  assert.equal(S.get('repairLogs', rC.id).status, 'draft', 'dòng hợp lệ không bị xác nhận dở dang');
});

test('B9 – điều chỉnh dòng sổ đã xác nhận: lương thợ, bù trừ chủ nhà đi theo số mới; có lịch sử', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions;
  const w = worker(TH);
  const r = X.addRepair({ workerId: w.id, date: '2026-09-11', buildingId: 'b_T21', desc: 'Thay bơm', jobType: 'water', labor: 100000, material: 900000, bearer: 'owner' });
  X.confirmRepairs([r.id]);
  const op0 = S.get('ownerPayments', S.get('repairLogs', r.id).ownerOffset.opId).paid;
  assert.ok(!attempt(() => X.adjustRepair(r.id, { labor: 150000 })).ok, 'phải có lý do');
  X.adjustRepair(r.id, { labor: 150000, material: 700000, reason: 'Thợ báo nhầm' });
  const r2 = S.get('repairLogs', r.id);
  assert.equal(r2.history.length, 1); assert.equal(r2.labor, 150000);
  assert.equal(S.get('ownerPayments', r2.ownerOffset.opId).paid, op0 - 1000000 + 850000);
  assert.equal(X.previewPayroll('2026-09').lines.find(l => l.employeeId === w.id).labor, 150000);
});

test('B10 – dòng ghi vào kỳ khác ngày (có lý do) được tính giống nhau ở UI-47, UI-44 và bảng lương', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const w = worker(TH);
  const r = X.addRepair({ workerId: w.id, date: '2026-09-27', period: '2026-09', periodReason: 'Việc làm tiếp của kỳ 09', buildingId: 'b_T21', desc: 'Sơn lại', jobType: 'paint', labor: 500000, material: 0 });
  X.confirmRepairs([r.id]);
  assert.ok(S.get('repairLogs', r.id).periodOverride);
  assert.equal(Q.repairLedger('2026-09', { workerId: w.id }).totals.labor, 500000, 'UI-47 web');
  assert.equal(Q.repairSettlement(w.id, '2026-09', 'web').labor, 500000);
  assert.equal(TH.qo.repairs('2026-09').totals.labor, 500000, 'UI-44');
  assert.equal(X.previewPayroll('2026-09').lines.find(l => l.employeeId === w.id).labor, 500000, 'bảng lương');
  // sổ T8 của Excel không đổi (không có periodOverride)
  assert.deepEqual([Q.repairLedger('2026-08', { workerId: S.all('employees').filter(e => e.title === 'KỸ THUẬT' && e.repairPay)[1].id }).totals.labor], [5550000]);
});

test('B11 – âm dương web: máy giặt/sấy 100% điện (OQ-21); điện trừ cọc chỉ lấy phiếu hoàn đã chi', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, Q = TH.q, F = TH.f;
  const A = TH.qo.amDuong('2026-09', 'electric', 'web');
  const invs = Q.invoicesOf('2026-09').filter(i => i.lifecycle !== 'draft');
  const exp = invs.reduce((t, i) => { const L = TH.calc.billing.expand(i.lines); return t + L[6].amount + L[7].amount + L[8].amount; }, 0);
  assert.ok(Math.abs(A.total.F - exp) < 1, 'phải thu E = thang máy + xe điện + máy giặt/sấy');
  const dep = S.all('refunds').filter(r => r.status === 'paid' && F.period(r.paidAt || '') === '2026-09').reduce((t, r) => t + r.deductions.filter(d => d.kind === 'electric').reduce((s, d) => s + (d.amount || 0), 0), 0);
  assert.equal(Math.round(A.total.dep), Math.round(dep));
  const Ax = TH.qo.amDuong('2026-07', 'electric', 'excel'); assert.equal(Math.round(Ax.total.M), 321808087, 'số Excel không đổi');
});

test('B12 – UI-44 theo phạm vi tòa của người xem', () => {
  const TH = boot({ user: 'vanhanh' }); const sc = TH.auth.buildingScope();
  const R = TH.qo.repairs('2026-08', 'excel');
  assert.ok(R.rows.every(x => !x.buildingId || sc.has(x.buildingId)));
});

test('B13 – bảng kê cổ đông: ⛔ khóa nguồn "như Excel"; kỳ mở lại → khóa phiên 2', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q;
  assert.ok(!attempt(() => X.lockShareRun('b_G1', '2026-08', 'excel')).ok);
  X.lockShareRun('b_G1', '2026-08', 'web');
  assert.ok(!attempt(() => X.lockShareRun('b_G1', '2026-08', 'web')).ok, 'đã khóa');
  lock(TH, '2026-08'); reopen(TH, '2026-08');
  const v2 = X.lockShareRun('b_G1', '2026-08', 'web');
  assert.equal(v2.version, 2); assert.equal(Q.shareRun('b_G1', '2026-08').version, 2);
  assert.equal(S.where('shareRuns', r => r.buildingId === 'b_G1' && r.period === '2026-08' && r.status === 'superseded').length, 1);
});

test('B14 – ⛔ tỷ lệ góp có ngày hiệu lực trước bộ tỷ lệ đang dùng', () => {
  const TH = boot({ user: 'admin' }); const X = TH.actions, Q = TH.q;
  const cur = Q.shareRatios('b_G1', '2026-08-31');
  const r = attempt(() => X.setShareRatios('b_G1', cur.map(x => ({ shareholderId: x.shareholderId, pct: x.pct })), '2025-12-01', 'lùi ngày'));
  assert.ok(!r.ok && /sau bộ tỷ lệ/.test((r.fields || {}).from || ''));
});

test('B15 / B16 – OCR: chạy lại thì phiên cũ không áp dụng được; ⛔ áp biểu phí vào kỳ đã khóa', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const cf = S.all('contractFiles')[0];
  const o1 = X.runOcr(cf.id); const o2 = X.runOcr(cf.id);
  assert.equal(Q.ocrSession(o1.id).status, 'superseded');
  assert.ok(!attempt(() => X.ocrApply(o1.id, { from: '2026-12-01' })).ok);
  Q.OCR_GROUPS.forEach(([g]) => X.ocrConfirmGroup(o2.id, g, true));
  lock(TH, '2026-10');
  const r = attempt(() => X.ocrApply(o2.id, { from: '2026-10-15', reason: 'x' }));
  assert.ok(!r.ok && /khóa/.test(r.msg), r.msg);
  assert.ok(!attempt(() => X.addRateVersion(o2.stayId, { from: '2026-10-15', rent: 1, reason: 'x' })).ok, 'biểu phí thủ công cũng chặn');
});

test('B17 – tài liệu gắn phòng lưu đúng phòng; ⛔ phòng khác tòa', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions;
  const room = S.all('rooms').find(r => r.buildingId === 'b_G3'); const other = S.all('rooms').find(r => r.buildingId !== 'b_G3');
  assert.ok(!attempt(() => X.uploadDocument({ type: Object.keys(Object.fromEntries(TH.q.DOC_TYPES))[0], buildingId: 'b_G3', objectType: 'room', roomId: other.id, name: 'a.pdf' })).ok);
  const d = X.uploadDocument({ type: TH.q.DOC_TYPES[0][0], buildingId: 'b_G3', objectType: 'room', roomId: room.id, name: 'bien-ban.pdf' });
  assert.equal(d.objectId, room.id); assert.equal(d.roomId, room.id);
});

test('B18 / B19 / B21 – hộp thư trưởng phòng; gating theo mốc; trưởng nhóm KD là vai trò riêng', async (t) => {
  const TH = boot({ user: 'truongphong' }); const S = TH.store, X = TH.actions, Q = TH.q;
  await t.test('trưởng phòng mở được /zalo/inbox; tin chỉ gán cho TPVH hoặc để trống', () => {
    const r = TH.routes.ROUTES.find(x => x.path === '/zalo/inbox');
    assert.ok(r && TH.auth.can(r.perm) && !TH.auth.can('zalo.view'));
    S.all('buildings').slice(0, 40).forEach(b => { const a = Q.inboxAssignee(b.id); assert.ok(!a || a.title === 'TPVH'); });
  });
  await t.test('mốc 1A/1B: ⛔ đăng nhập tài khoản Phase 2, quy tắc Zalo Phase 2, yêu cầu mở lại kỳ', () => {
    S.meta.milestone = '1B';
    assert.ok(!attempt(() => TH.auth.login('sale')).ok);
    TH.auth.login('ketoan');
    assert.ok(!attempt(() => X.createZaloBatch({ ruleId: 'zr_expiring', buildingIds: [] })).ok);
    S.meta.milestone = '2';
    assert.ok(attempt(() => TH.auth.login('sale')).ok);
  });
  await t.test('truongkd: vai trò riêng có quyền kinh doanh; leader vận hành không có', () => {
    TH.auth.login('truongkd'); assert.equal(TH.auth.role(), 'truongkd'); assert.ok(TH.auth.can('deals.close'));
    TH.auth.login('leader'); assert.ok(!TH.auth.can('sales.view'));
  });
});

test('NT-0 – Phase 1 không đổi sau Đợt B (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name + ' → ' + a.detail)), []);
});
