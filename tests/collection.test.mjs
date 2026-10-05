/* Thu tiền theo tòa (sheet "cập nhật thu tiền"): QL nhập số đã thu cộng dồn mốc 5/10/15 → admin duyệt → lương vận hành dùng số duyệt; kế toán xem báo cáo. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';
import { fixture } from './_load.mjs';

const P = '2026-09';
const SRC = fixture('collection-2026-09.json');
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.51, `${msg}: ${a} ≠ ${b}`);
const vanhanhLine = (TH) => TH.actions.previewPayroll(P).lines.find(l => l.employeeId === TH.store.get('users', 'u_vanhanh').employeeId);

test('mốc thu – ma trận quyền 9 vai trò', () => {
  const R = boot().calc.rbac;
  const exp = { view: ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong'], report: ['vanhanh', 'leader', 'truongphong'], approve: ['admin'], export: ['admin', 'ketoan'] };
  Object.keys(R.ROLES).forEach(role => Object.entries(exp).forEach(([k, roles]) => assert.equal(R.can(role, 'collection.' + k), roles.includes(role), `${role} collection.${k}`)));
});

test('mốc thu – quản lý chỉ thấy tòa mình, có số tiền; dòng quản lý cộng đúng dòng tòa', () => {
  const TH = boot({ user: 'vanhanh' }), Q = TH.q;
  const cp = Q.collectionProgress(P);
  assert.deepEqual([...cp.rows.map(r => r.code)].sort(), ['G3', 'T20', 'T22', 'T24', 'T3', 'T41']);
  assert.ok(TH.auth.can('debts.viewAmounts'));
  const due = cp.rows.reduce((s, r) => s + r.due, 0);
  near(cp.total.due, due, 'tổng phải thu');
  assert.equal(cp.managers.length, 1);
  near(cp.managers[0].due, due, 'dòng quản lý');
  cp.rows.forEach(r => {
    near(r.remaining, r.due - r.collected - (r.breachDue - r.breachCollected), 'D = B − C − (F − G) ' + r.code);
    const invs = Q.invoicesOf(P).filter(i => i.buildingId === r.buildingId && i.lifecycle !== 'draft');
    near(r.due, invs.reduce((s, i) => s + (i.isBreach && i.excel ? i.excel.total : i.totalDue), 0), 'phải thu = tổng hóa đơn (phá HĐ theo hóa đơn gốc) ' + r.code);
  });
  // seed demo: mốc 5/10 đã duyệt đúng cột T/U của sheet, mốc 15 chờ duyệt
  const g3 = cp.rows.find(r => r.code === 'G3'), src = SRC.buildings.find(b => b.building === 'G3');
  assert.equal(g3.ms[0].source, 'approved'); near(g3.ms[0].value, src.T, 'G3 M5'); near(g3.ms[1].value, src.U, 'G3 M10');
  assert.equal(g3.ms[2].source, 'receipts'); assert.ok(g3.ms[2].pending);
});

test('mốc thu – kiểm tra khi nhập', () => {
  const TH = boot({ user: 'vanhanh' }), S = TH.store, X = TH.actions;
  const msg = (d) => { const r = attempt(() => X.reportMilestone(Object.assign({ period: P, buildingId: 'b_G3', milestone: 3, amount: 1000 }, d))); assert.equal(r.ok, false, JSON.stringify(d)); return r.msg + ' ' + JSON.stringify(r.fields || {}); };
  assert.match(msg({ buildingId: 'b_T5' }), /ngoài phạm vi/);
  assert.match(msg({ period: '2026-10', milestone: 1 }), /Chưa tới mốc/);
  assert.match(msg({ amount: -5 }), /≥ 0/);
  const g3 = TH.q.milestoneState(P, 'b_G3', 2).approved.amount;
  assert.match(msg({ milestone: 3, amount: g3 - 1000 }), /giảm giữa hai mốc/);
  assert.equal(attempt(() => X.reportMilestone({ period: P, buildingId: 'b_G3', milestone: 3, amount: g3 - 1000, note: 'Hoàn tiền khách 1 nghìn' })).ok, true, 'có lý do thì cho nhập số giảm');
  // bản đang chờ được sửa đè, không tạo bản thứ hai
  const pend = S.where('collectionMilestones', r => r.buildingId === 'b_G3' && r.milestone === 3 && r.status === 'pending');
  assert.equal(pend.length, 1); assert.equal(pend[0].amount, g3 - 1000); assert.ok(pend[0].revisions.length >= 1);
  S.add('payrollRuns', { id: 'pr_test_closed', period: P, status: 'closed', lines: [], obligations: [] });
  assert.match(msg({ amount: g3 }), /Lương kỳ .* đã chốt/);
  S.remove('payrollRuns', 'pr_test_closed');
  S.update('periods', P, { status: 'closed' });
  assert.match(msg({ amount: g3 }), /đã khóa/);
});

test('mốc thu – chỉ admin duyệt; duyệt thay số cũ; từ chối cần lý do; hủy chỉ người nhập', () => {
  const TH = boot({ user: 'vanhanh' }), S = TH.store, X = TH.actions, Q = TH.q, A = TH.auth;
  const pend = Q.milestoneState(P, 'b_G3', 3).pending;
  A.login('ketoan');
  assert.equal(attempt(() => X.approveMilestone(pend.id)).ok, false, 'kế toán không duyệt');
  assert.equal(Q.collectionProgress(P).rows.length > 6, true, 'kế toán xem toàn bộ tòa');
  assert.ok(Q.milestoneRecords({ period: P }).length >= 18, 'kế toán xem lịch sử');
  A.login('vanhanh');
  assert.equal(attempt(() => X.approveMilestone(pend.id)).ok, false, 'QL không tự duyệt');
  assert.equal(A.can('collection.export'), false, 'QL không xuất báo cáo');
  A.login('admin');
  assert.match(attempt(() => X.rejectMilestone(pend.id, 'x')).msg, /Dữ liệu chưa hợp lệ/);
  const old = Q.milestoneState(P, 'b_G3', 1).approved;
  A.login('vanhanh');
  const nr = X.reportMilestone({ period: P, buildingId: 'b_G3', milestone: 1, amount: old.amount - 1000000 });
  assert.equal(nr.version, 2); assert.equal(nr.previousAmount, old.amount);
  A.login('truongphong');
  assert.match(attempt(() => X.cancelMilestone(nr.id)).msg, /Chỉ người nhập/);
  A.login('admin');
  X.approveMilestone(nr.id, 'Đã đối chiếu sao kê');
  assert.equal(S.get('collectionMilestones', old.id).status, 'superseded');
  assert.equal(Q.milestoneApproved(P, 'b_G3', 1).id, nr.id);
  S.update('collectionMilestones', pend.id, { reportedBy: 'u_admin' });
  assert.match(attempt(() => X.approveMilestone(pend.id)).msg, /Không tự duyệt/);
});

test('mốc thu – số duyệt đi vào lương vận hành; mốc chưa duyệt gắn cờ', () => {
  const TH = boot({ user: 'admin' }), X = TH.actions, Q = TH.q, P_ = TH.calc.payroll;
  const before = X.payrollBuildingInputs(P, 'b_G3');
  assert.deepEqual([...before.msSource], ['approved', 'approved', 'receipts']);
  const src = SRC.buildings.find(b => b.building === 'G3');
  near(before.R5, src.T, 'R5 = số duyệt'); near(before.R10, src.U, 'R10 = số duyệt');
  const l0 = vanhanhLine(TH), b0 = l0.buildings.find(b => b.buildingId === 'b_G3');
  assert.equal(b0.msPending, true);
  assert.ok(l0.flags.some(f => f.buildingId === 'b_G3' && /Mốc thu chưa duyệt/.test(f.flag)));
  // QL nhập mốc 15, admin duyệt → R15 đổi, cờ mất, M3/A/HS tính lại theo công thức
  const pend = Q.milestoneState(P, 'b_G3', 3).pending;
  TH.auth.login('admin'); X.rejectMilestone(pend.id, 'Lệch sheet – nhập lại');
  TH.auth.login('vanhanh'); const r = X.reportMilestone({ period: P, buildingId: 'b_G3', milestone: 3, amount: src.V });
  TH.auth.login('admin'); X.approveMilestone(r.id);
  const after = X.payrollBuildingInputs(P, 'b_G3');
  assert.deepEqual([...after.msSource], ['approved', 'approved', 'approved']);
  near(after.R15, src.V, 'R15 = số duyệt');
  const l1 = vanhanhLine(TH), b1 = l1.buildings.find(b => b.buildingId === 'b_G3');
  const w = Q.milestoneCfg(P).w;
  near(b1.M1, (src.T - after.deduct) * w[0], 'M1'); near(b1.M2, (src.U - src.T) * w[1], 'M2'); near(b1.M3, (src.V - src.U) * w[2], 'M3');
  const exp = P_.buildingPay({ J: after.J, K: after.K, L: after.L, A: b1.M1 + b1.M2 + b1.M3, Q: after.Q, C: after.C, over1y: l1.over1y });
  near(b1.HS, exp.HS, 'HS'); assert.equal(b1.msPending, false);
  assert.ok(!l1.flags.some(f => f.buildingId === 'b_G3' && /Mốc thu chưa duyệt/.test(f.flag)));
  // bảng tiến độ dùng cùng số với lương
  const row = Q.collectionProgress(P).rows.find(x => x.code === 'G3');
  near(row.HS, b1.HS, 'HS bảng tiến độ = HS lương');
});

test('mốc thu – công thức theo sheet: tỷ lệ và còn lại tái tạo từ số đầu vào của Excel', () => {
  const PM = boot().calc.payments;
  SRC.buildings.filter(b => b.N).forEach(b => { const r = PM.collectionRow({ due: b.N, collected: b.O, breachDue: b.P || 0, breachCollected: b.Q || 0 }); near(r.rate * 100, b.R * 100, 'R ' + b.building); });
  SRC.managers.forEach(m => {
    const r = PM.collectionRow({ due: m.B, collected: m.C, breachDue: m.F, breachCollected: m.G });
    near(r.rate * 100, m.E * 100, 'E'); near(r.breachShare * 100, m.I * 100, 'I');
    if (m.H != null) near(r.breachRate * 100, m.H * 100, 'H');
  });
  assert.deepEqual([...PM.milestoneSteps([100, 160, 200], [1, 0.9, 0.7], 10)].map(x => Math.round(x * 100) / 100), [90, 54, 28]);
});

test('mốc thu – bộ tháng 9: mọi tòa trên sheet đã duyệt đúng T/U/V, lương kỳ 9 dùng số duyệt', () => {
  const TH = boot({ dataset: 'september' }), Q = TH.q, S = TH.store;
  assert.equal(S.where('collectionMilestones', r => r.period === P && r.status === 'pending').length, 0);
  const cp = Q.collectionProgress(P);
  SRC.buildings.forEach(b => {
    const row = cp.rows.find(r => r.code === b.building); assert.ok(row, b.building);
    [b.T, b.U, b.V].forEach((v, k) => { assert.equal(row.ms[k].source, 'approved', b.building + ' mốc ' + (k + 1)); near(row.ms[k].value, v, b.building + ' mốc ' + (k + 1)); });
    if (!row.deduct) { near(row.M1, b.T, 'W ' + b.building); near(row.M2, (b.U - b.T) * 0.9, 'X ' + b.building); near(row.M3, (b.V - b.U) * 0.7, 'Y ' + b.building); }
  });
  [0, 1, 2].forEach(k => near(cp.rows.filter(r => SRC.buildings.some(b => b.building === r.code)).reduce((s, r) => s + r.ms[k].value, 0), [SRC.total.T, SRC.total.U, SRC.total.V][k], 'tổng sheet mốc ' + (k + 1)));
  assert.ok(SRC.buildings.filter(b => { const r = cp.rows.find(x => x.code === b.building); return Math.abs(r.due - b.N) < 1; }).length >= 77, 'phải thu khớp N');
  assert.ok(SRC.buildings.filter(b => { const r = cp.rows.find(x => x.code === b.building); return Math.abs(r.collected - b.O) < 1; }).length >= 85, 'thực thu khớp O');
  const run = S.one('payrollRuns', r => r.period === P && r.status === 'closed');
  const sheet = new Set(SRC.buildings.map(b => 'b_' + b.building));
  const blds = run.lines.flatMap(l => l.buildings).filter(b => sheet.has(b.buildingId) && b.msSource);
  assert.ok(blds.length > 50);
  assert.ok(blds.every(b => b.msSource.every(x => x === 'approved')), 'lương kỳ 9 dùng số mốc đã duyệt');
  assert.ok(S.where('collectionMilestones', r => r.status === 'rejected').length >= 1, 'có lịch sử từ chối');
});
