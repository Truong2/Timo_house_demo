/* Phase 2 – Đợt 5: mở rộng UI-01 (HS, leader), UI-38 quản lý kỳ nâng cao [GĐ K-7], UI-39 hộp thư phản hồi + sự kiện mới. Kịch bản F30. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt, completePayroll } from './_app.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));

test('F30.1 – Dashboard: HS thực tế / tạm tính theo phạm vi; lọc leader không đếm trùng tòa', () => {
  const TH = boot({ user: 'truongphong' }); const S = TH.store, Q = TH.q;
  const sc = TH.auth.buildingScope();
  const O = TH.qo.rooms('2026-09', (b) => sc.has(b));
  assert.ok(O.rows.every(r => sc.has(r.buildingId)));
  assert.equal(new Set(O.rows.map(r => r.buildingId)).size, O.rows.length, 'mỗi tòa một dòng');
  assert.ok(O.totals.hs > 0 && O.totals.hsTemp > 0);
  // lọc leader (tổ chức tại cuối kỳ): nhánh nhiều nhân viên → mỗi tòa một dòng, số phòng không đếm hai lần
  const pe = TH.calc.dates.periodEnd('2026-09');
  const lead = Q.teamLeaders().find(e => e.title === 'TNVH'); const br = TH.auth.branchOf(lead.id, pe); const mgr = Q.managerMap(pe);
  const set = new Set(S.all('buildings').filter(b => br.has((mgr[b.id] || {}).id)).map(b => b.id)); assert.ok(set.size > 1);
  const OL = TH.qo.rooms('2026-09', (b) => set.has(b));
  assert.equal(OL.rows.length, new Set(OL.rows.map(r => r.buildingId)).size);
  const rooms = [...set].reduce((t, bid) => t + (Q.roomsByBuilding()[bid] || []).filter(r => Q.rentable(r, pe) && r.price > 0).length, 0);
  assert.equal(OL.totals.rooms, rooms);
});

test('F30.3 / F30.4 / F30.5 – mở lại kỳ đã khóa cần duyệt admin + kế toán; lịch sử; so sánh 2 phiên bản chốt', async (t) => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  // khóa kỳ 10 đúng điều kiện mốc 1B: chốt lương + chốt phân bổ trước
  const run = completePayroll(TH, '2026-10');
  X.closePayroll(run.id); const al = X.saveAllocation('2026-10'); X.closeAllocation(al.id);
  X.closePeriod('2026-10');
  assert.equal(Q.snapshotVersions('2026-10').length, 1);
  await t.test('⛔ mở khóa trực tiếp ở Phase 2; yêu cầu phải có lý do', () => {
    TH.auth.login('admin'); assert.ok(!attempt(() => X.unlockPeriod('2026-10', 'x')).ok); TH.auth.login('ketoan');
    assert.ok(!attempt(() => X.requestReopen('2026-10', '')).ok);
  });
  await t.test('kế toán yêu cầu + duyệt; ⛔ kế toán tự duyệt lần 2; admin duyệt → mở', () => {
    X.requestReopen('2026-10', 'Nhập thiếu chi phí sửa chữa tòa T21');
    assert.equal(X.approveReopen('2026-10'), false);
    const r = attempt(() => X.approveReopen('2026-10')); assert.ok(!r.ok && /đã duyệt/.test(r.msg));
    assert.equal(S.get('periods', '2026-10').status, 'closed');
    TH.auth.login('vanhanh'); assert.ok(!attempt(() => X.approveReopen('2026-10')).ok); TH.auth.login('admin');
    assert.equal(X.approveReopen('2026-10'), true);
    const p = S.get('periods', '2026-10'); assert.equal(p.status, 'open'); assert.equal(p.reopenRequest, null);
    assert.deepEqual(plain(p.history.map(h => h.type)), ['close', 'reopen']);
  });
  await t.test('sửa dữ liệu, khóa lại → phiên 2; so sánh chỉ ra chênh tòa × dòng', () => {
    TH.auth.login('ketoan');
    X.addExpense({ category: 'repair', scope: 'building', buildingId: 'b_T21', amount: 1234000, date: '2026-10-05', period: '2026-10', note: 'Bổ sung' });
    X.closePeriod('2026-10');
    assert.equal(Q.snapshotVersions('2026-10').length, 2);
    const diff = Q.compareSnapshots('2026-10', 1, 2);
    assert.ok(diff.some(d => d.buildingId === 'b_T21' && d.code === 'repair' && Math.round(d.diff) === 1234000));
  });
});

test('F30.6 / F30.8 – hộp thư phản hồi: gán trưởng phòng theo cơ cấu; trạng thái + ghi chú; không thay phiếu thu', () => {
  const TH = boot({ user: 'truongphong' }); const S = TH.store, X = TH.actions, Q = TH.q;
  // trưởng phòng mở được trang hộp thư /zalo/inbox (không cần quyền xem đợt gửi)
  const rt = TH.routes.ROUTES.find(r => r.path === '/zalo/inbox'); assert.ok(rt && TH.auth.canRoute(rt) && !TH.auth.canRoute(TH.routes.ROUTES.find(r => r.path === '/zalo')));
  const me = S.session.employeeId;
  const x = S.all('zaloInbox').find(i => i.status === 'open');
  assert.equal((Q.inboxAssignee(x.buildingId) || {}).title, 'TPVH'); assert.equal((Q.emp(x.assigneeId) || {}).title, 'TPVH');
  const mine = Q.inboxScoped(); assert.ok(mine.length > 0 && mine.every(i => TH.auth.branchOf(me, TH.f.today()).has(i.assigneeId)));
  const pays = S.all('payments').length;
  X.updateInbox(mine[0].id, { status: 'processing', note: 'Đã gọi lại khách' });
  assert.ok(!attempt(() => X.updateInbox(mine[0].id, { status: 'done', note: '' })).ok, 'xử lý xong phải có ghi chú');
  X.updateInbox(mine[0].id, { status: 'done', note: 'Khách hẹn chuyển khoản – chờ kế toán ghi phiếu thu' });
  assert.equal(S.get('zaloInbox', mine[0].id).notes.length, 2);
  assert.equal(S.all('payments').length, pays, 'tin trả lời không tạo phiếu thu');
  TH.auth.login('vanhanh'); assert.ok(!attempt(() => X.updateInbox(mine[0].id, { status: 'open' })).ok);
});

test('F30.7 – sự kiện Zalo mới: sắp hết HĐ (35 ngày), đã chi hoàn cọc; gắn lượt thuê, không gửi lặp', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  assert.ok(TH.calc.zalo.EVENTS.contract_expiring && TH.calc.zalo.EVENTS.refund_paid);
  const c = X.zaloCandidates('zr_expiring');
  assert.equal(c.length, Q.expiring().length); assert.ok(c.length > 0);
  const b = X.createZaloBatch({ ruleId: 'zr_expiring', buildingIds: [] }); X.sendZaloBatch(b.id);
  const ms = S.where('zaloMessages', m => m.batchId === b.id);
  assert.ok(ms.every(m => m.invoiceId === null && m.stayId && m.status !== 'queued'));
  assert.ok(ms.some(m => m.status === 'delivered' && /hết hạn ngày/.test(m.text)));
  assert.equal(X.zaloCandidates('zr_expiring').length, 0, 'không gửi lặp');
  // đã chi hoàn cọc
  const st = S.all('stays').find(s => s.status === 'active' && X.depositBalance(s.id) > 1000000);
  X.endStay(st.id, { endType: 'expired', date: '2026-09-28' });
  const rf = S.one('refunds', r => r.stayId === st.id);
  X.updateRefund(rf.id, { deductions: [] }); TH.auth.login('admin'); X.approveRefund(rf.id); TH.auth.login('ketoan'); X.approveRefund(rf.id); X.payRefund(rf.id, { date: '2026-09-29' });
  assert.ok(X.zaloCandidates('zr_refund').some(x => x.stay.id === st.id));
});

test('NT-0 – Phase 1 không đổi sau Đợt 5 (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name)), []);
});
