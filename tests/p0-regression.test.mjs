/* Hồi quy 10 lỗi P0 (đợt audit Phase 1) ở mức action/service – bản node của scripts/verify-p0.mjs.
   Mỗi nhóm kịch bản boot một app sạch từ seed (tests/_app.mjs, ~0,3 s). Kịch bản cần DOM thật (P0-5a ô KPI, P0-9a/9b render trang, P0-10 bấm nút xuất)
   được kiểm ở mức hàm tương đương: TH.calc.report.bridge, TH.kit.pickTab, TH.kit.maskCols, scope trong actions. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

const IN = ['opening', 'receive', 'transfer_in'];
const sum = (a, f = (x) => x) => a.reduce((t, x) => t + f(x), 0);
/* Mảng/đối tượng tạo trong vm context khác realm → so sánh sau khi chuyển về JSON thuần */
const host = (x) => JSON.parse(JSON.stringify(x));
const eq = (a, b, msg) => assert.deepEqual(host(a), host(b), msg);

/* ---------- P0-1 / P0-2: nháp kỳ 2026-10 trên toàn bộ tòa ---------- */
let _drafts = null;
const drafts10 = () => {
  if (_drafts) return _drafts;
  const TH = boot({ user: 'ketoan' });
  const bids = TH.store.all('buildings').map(b => b.id);
  TH.actions.createInvoiceDrafts('2026-10', bids, { allowMissingReading: true });
  const drafts = TH.store.all('invoices').filter(i => i.period === '2026-10' && i.lifecycle === 'draft');
  return (_drafts = { TH, drafts });
};

test('P0-1 không thu tiền điện hai lần cho cùng một phòng trong kỳ 2026-10', () => {
  const { TH, drafts } = drafts10(); const B = TH.calc.billing;
  assert.ok(drafts.length > 0, 'phải có hóa đơn nháp kỳ 10');
  const byRoom = {}; drafts.forEach(i => { (byRoom[i.roomId] = byRoom[i.roomId] || []).push(i); });
  const dbl = Object.entries(byRoom).filter(([, a]) => a.filter(i => B.expand(i.lines)[2].amount > 0).length > 1)
    .map(([room, a]) => TH.q.roomCode(room) + ': ' + a.map(i => i.customerCode + ' điện ' + B.expand(i.lines)[2].amount).join(' / '));
  eq(dbl, [], 'phòng có ≥2 hóa đơn cùng thu điện');
  const g6 = drafts.find(i => i.customerCode === '206G6A003');
  assert.ok(g6, 'có hóa đơn nháp 206G6A003');
  assert.equal(B.expand(g6.lines)[2].amount, 0, '206G6A003 (khách chờ vào) không thu điện');
});

test('P0-2 khách đã nộp phiếu cọc không bị tính cọc lần nữa trên hóa đơn đầu', () => {
  const { TH, drafts } = drafts10(); const S = TH.store, B = TH.calc.billing;
  const got = (sid) => sum(S.where('depositLedger', l => l.stayId === sid && IN.includes(l.kind)), l => l.amount);
  const withDep = drafts.filter(i => got(i.stayId) > 0);
  assert.ok(withDep.length > 0, 'có hóa đơn nháp của khách đã có cọc trong sổ');
  const over = withDep.filter(i => B.expand(i.lines)[1].amount > Math.max(0, TH.q.stay(i.stayId).depositAmount - got(i.stayId)) + 0.5)
    .map(i => `${i.customerCode}: đã nộp ${got(i.stayId)}, dòng 2 = ${B.expand(i.lines)[1].amount}`);
  eq(over, []);
});

/* ---------- P0-3 / P0-4: đọc dữ liệu seed ---------- */
test('P0-3 mọi hóa đơn: tổng in 13 dòng = tổng cần đóng; lệch Excel được gắn cờ', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, B = TH.calc.billing;
  const inv = S.all('invoices').filter(i => i.lifecycle !== 'draft');
  const bad = inv.filter(i => Math.abs(B.total(B.expand(i.lines)) - i.totalDue) > 0.5).map(i => i.customerCode);
  eq(bad, [], 'tổng in ≠ tổng cần đóng');
  const x = inv.find(i => i.customerCode === '103T25A001');
  assert.ok(x); assert.equal(TH.q.invState(x).status, 'THIEU');
  const srcErr = inv.filter(i => i.excel && !i.isBreach && Math.abs(i.excel.total - i.totalDue) > 1).map(i => i.customerCode).sort();
  eq(srcErr, ['101G4A001', '101S8A001', '102T20A002', '103S22A001', '103T25A001', '201S38A002', '301G7A002', '302G6A001', '601G16A001']);
});

test('P0-4 phòng có giá/hóa đơn không bị xếp "đồng hồ chung"; HS kỳ 9 hợp lý', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, B = TH.calc.billing;
  const billedRooms = new Set(S.all('invoices').filter(i => B.expand(i.lines)[0].unit > 0).map(i => i.roomId));
  const wrong = S.all('rooms').filter(x => x.exploitation === 'meter_common' && (x.price > 0 || billedRooms.has(x.id))).map(x => x.code + ' giá ' + x.price);
  eq(wrong, []);
  const pv = TH.actions.previewPayroll('2026-09');
  const hs = pv.lines.flatMap(l => l.buildings.map(b => ({ b: TH.q.building(b.buildingId).code, HS: b.HS, J: b.J, L: b.L }))).filter(b => b.J > 0 || b.L > 0);
  assert.ok(hs.length > 0);
  const worst = Math.max(...hs.map(b => b.HS || 0));
  assert.ok(worst < 200, 'HS cao nhất kỳ 9 = ' + worst);
  eq(hs.filter(b => !b.J && b.L > 0).map(b => b.b), [], 'tòa có tiền thu nhưng J = 0');
});

/* ---------- P0-5 Báo cáo tổng/KD T8 trên số web ---------- */
test('P0-5 đối chiếu Báo cáo tổng T8 trên số web; cầu nối = LNR báo cáo KD', () => {
  const TH = boot({ user: 'admin' });
  const rc = TH.qr.reconcile('2026-08');
  assert.ok(rc, 'có đối chiếu T8');
  assert.ok(Math.abs(rc.residual) < 1, 'còn dư chưa giải thích ' + rc.residual);
  const other = rc.items.find(i => i.key === 'other');
  assert.ok(other && Math.abs(other.amount) < 1, 'khoản "khác" phải = 0, đang ' + (other && other.amount));
  assert.ok(Math.abs(sum(rc.items, i => i.amount) - (rc.web - rc.excel)) < 1, 'tổng các khoản = web − Excel');
  const t = TH.qr.build('2026-08', 'total').cols.TOTAL;
  const bz = TH.qr.build('2026-08', 'business');
  const br = TH.calc.report.bridge(t, bz.cols.TOTAL);
  assert.ok(Math.abs(br[br.length - 1].value - bz.cols.TOTAL.lnr) < 1, `cầu nối ${br[br.length - 1].value} ≠ LNR KD ${bz.cols.TOTAL.lnr}`);
  assert.ok(Math.abs(bz.cols.TOTAL.lnr - (bz.excelBiz.gd.lnr - rc.diff)) < 1, 'LNR KD web = LNR Excel theo GĐ − chênh chi phí');
});

/* ---------- P0-6 Sổ cọc ---------- */
test('P0-6 sổ cọc: nhận/đảo phiếu, không phân bổ vào hóa đơn, bỏ cọc, báo cáo, chuyển phòng', async (t) => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const free = S.all('rooms').filter(x => x.exploitation === 'timehouse' && x.price > 0 && !Q.currentStay(x.id) && !Q.pendingStay(x.id));
  assert.ok(free.length >= 5, 'cần ≥5 phòng trống');
  const bal = (sid) => sum(S.where('depositLedger', l => l.stayId === sid && IN.includes(l.kind)), l => l.amount);
  const mk = (room, dep) => X.createStay({ roomId: room.id, name: 'Khách kiểm thử', phone: '0901234567', rentStart: '2026-10-01', endDate: '2027-09-30', rent: room.price, deposit: 3000000, status: 'pending', depositReceived: dep ? { amount: dep, date: '2026-09-25' } : null });
  const tot = () => TH.qr.build('2026-09', 'total').cols.TOTAL;
  const rep0 = tot();

  let s1;
  await t.test('a) nhận cọc → "đang giữ"; đảo phiếu cọc → sổ cọc về 0', () => {
    s1 = mk(free[0], 3000000);
    assert.equal(Q.stay(s1.id).depositStatus, 'held');
    assert.equal(Math.round(tot().dep_new - rep0.dep_new), 3000000, 'dòng 4 +3tr sau nhận cọc');
    const pay = S.one('payments', p => p.stayId === s1.id && p.type === 'deposit');
    assert.ok(pay);
    X.reversePayment(pay.id, 'Kiểm thử đảo phiếu cọc');
    assert.equal(bal(s1.id), 0);
    assert.notEqual(Q.stay(s1.id).depositStatus, 'held');
    assert.equal(Math.round(tot().dep_new - rep0.dep_new), 0, 'đảo phiếu → dòng 4 trừ lại');
  });
  await t.test('b) phiếu cọc không phân bổ được vào hóa đơn', () => {
    const inv = S.all('invoices').find(i => i.period === '2026-09' && Q.invState(i).remaining > 1000);
    assert.throws(() => X.recordPayment({ stayId: inv.stayId, type: 'deposit', amount: 1000, receivedAt: '2026-09-28', allocations: [{ invoiceId: inv.id, amount: 1000 }] }), /không phân bổ vào hóa đơn/);
  });
  await t.test('c) chờ nhận phải có cọc; bỏ cọc khi cọc thực nhận = 0 (phiếu đã đảo) không ghi doanh thu', () => {
    assert.throws(() => mk(free[1], 0), /Dữ liệu chưa hợp lệ/, 'tạo lượt chờ nhận không cọc bị chặn (SRS §2.3 mục 3)');
    X.endStay(s1.id, { endType: 'forfeit', date: '2026-09-28', reason: 'Kiểm thử bỏ cọc sau khi đảo phiếu cọc' });
    assert.equal(sum(S.where('depositLedger', l => l.stayId === s1.id && l.kind === 'forfeit_revenue'), l => l.amount), 0);
    assert.equal(Q.stay(s1.id).depositStatus, 'none');
  });
  let s3;
  await t.test('d) phiếu cọc giữ phòng vào dòng 4 "Cọc phòng mới" và dòng 3 doanh thu', () => {
    s3 = mk(free[2], 4000000);
    const rep1 = tot();
    assert.equal(Math.round(rep1.dep_new - rep0.dep_new), 4000000);
    assert.equal(Math.round(rep1.rev_total - rep0.rev_total), 4000000);
  });
  await t.test('e) chuyển phòng: chặn lượt chờ nhận, bắt buộc xác nhận phương án cọc, theo dõi cọc thiếu', () => {
    assert.throws(() => X.transferStay(s3.id, { toRoomId: free[3].id, date: '2026-10-01', newDeposit: 4000000 }), /đang ở/, 'lượt chờ nhận không được chuyển');
    const act = S.all('stays').find(s => s.status === 'active' && bal(s.id) > 0);
    assert.ok(act);
    const newDeposit = bal(act.id) + 1400000;
    assert.throws(() => X.transferStay(act.id, { toRoomId: free[4].id, date: '2026-10-01', newDeposit }), /phương án cọc/, 'thiếu phương án cọc');
    assert.throws(() => X.transferStay(act.id, { toRoomId: free[4].id, date: '2026-10-01', newDeposit, depositPlan: 'carry' }), /[Xx]ác nhận/, 'thiếu xác nhận của khách');
    const held = bal(act.id);
    const ns = X.transferStay(act.id, { toRoomId: free[4].id, date: '2026-10-01', newDeposit, depositPlan: 'carry', depositConfirmed: true });
    assert.ok(ns && ns.id);
    assert.equal(Q.stay(ns.id).depositStatus, 'partial');
    assert.equal(bal(ns.id), held, 'transfer_in = cọc đang giữ');
    assert.ok(bal(ns.id) < ns.depositAmount);
  });
});

/* ---------- P0-7 Khóa kỳ ---------- */
test('P0-7 khóa kỳ giữ cố định số liệu', async (t) => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions;
  const lnr = () => Math.round(TH.qr.build('2026-09', 'total').cols.TOTAL.lnr);
  let run, before;
  await t.test('a) không khóa kỳ khi chưa chốt lương/phân bổ, kể cả truyền force', () => {
    assert.throws(() => X.closePeriod('2026-09', { force: true }), /bảng lương chưa chốt.*phân bổ chưa chốt/);
    assert.notEqual(S.get('periods', '2026-09').status, 'closed');
  });
  await t.test('b) sau khóa: chặn tính lại lương, duyệt cờ, tham số/phân công/giá chủ nhà hiệu lực trong kỳ', () => {
    run = X.computePayroll('2026-09');
    run.lines.forEach(l => l.flags.forEach(f => X.approvePayFlag(run.id, l.employeeId + ':' + f.buildingId, 'kiểm thử')));
    X.closePayroll(run.id); const al = X.saveAllocation('2026-09'); X.closeAllocation(al.id);
    X.closePeriod('2026-09');
    assert.equal(S.get('periods', '2026-09').status, 'closed');
    before = lnr();
    const e0 = S.all('assignments').find(a => !a.to && a.responsibility === 'operate');
    const oc = S.all('ownerContracts')[0];
    const res = {
      computePayroll: attempt(() => X.computePayroll('2026-09')),
      approveFlag: attempt(() => X.approvePayFlag(run.id, 'x:y', 'sau khóa')),
      setParam: attempt(() => X.setParam('noRentRoomsExcluded', false, '2026-09-15', 'sau khóa')),
      assign: attempt(() => X.assignBuilding({ employeeId: e0.employeeId, buildingId: e0.buildingId, from: '2026-09-10', reason: 'sau khóa' })),
      ownerRate: attempt(() => X.addOwnerRate(oc.id, { from: '2026-09-01', rent: 99000000, reason: 'sau khóa' })),
    };
    eq(Object.entries(res).filter(([, r]) => r.ok || !/đã khóa/.test(r.msg)).map(([k, r]) => k + ': ' + (r.ok ? 'cho phép' : r.msg)), [], 'thao tác phải bị chặn vì kỳ đã khóa');
  });
  await t.test('c) đổi dữ liệu nguồn không làm đổi LNR kỳ đã khóa', () => {
    S.all('employees').forEach(e => S.update('employees', e.id, { hireDate: '2026-09-01' }));
    S.all('rooms').slice(0, 200).forEach(x => S.update('rooms', x.id, { price: 0 }));
    assert.equal(lnr(), before);
  });
  await t.test('d) điều chỉnh sau khóa: bắt buộc lý do, số điều chỉnh vào báo cáo kỳ gốc', () => {
    assert.throws(() => X.addPeriodAdjustment({ period: '2026-09', buildingId: 'b_G1', reportLine: 'other', amount: 1000000, reason: '' }), /lý do/);
    X.addPeriodAdjustment({ period: '2026-09', buildingId: 'b_G1', reportLine: 'other', amount: 1000000, reason: 'Hóa đơn sửa chữa về muộn' });
    assert.equal(lnr(), before - 1000000);
  });
});

/* ---------- P0-8 Phân bổ kỳ live chỉ từ chứng từ quỹ ---------- */
test('P0-8 kỳ live: tổng phân bổ = tổng chứng từ quỹ; kỳ 08 tái hiện công thức G1', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions;
  const total = (al) => sum(al.lines, l => l.total);
  assert.equal(Math.round(total(X.previewAllocation('2026-09'))), 0, 'chưa có chứng từ quỹ → không phân bổ');
  const run = X.computePayroll('2026-09');
  run.lines.forEach(l => l.flags.forEach(f => X.approvePayFlag(run.id, l.employeeId + ':' + f.buildingId, 'kiểm thử')));
  X.closePayroll(run.id);
  const exp = sum(S.all('expenses').filter(e => e.period === '2026-09' && e.scope === 'fund' && e.status !== 'void'), e => e.amount);
  assert.ok(exp > 0, 'chốt lương sinh chứng từ quỹ');
  const alloc = total(X.previewAllocation('2026-09'));
  assert.ok(Math.abs(alloc - exp) <= 1, `phân bổ ${alloc} ≠ chứng từ quỹ ${exp}`);
  const g1 = X.previewAllocation('2026-08').lines.find(l => l.lineCode === 'sal_acct').results.b_G1;
  assert.equal(Math.round(g1), 181708);
});

/* ---------- P0-9 Phạm vi dữ liệu theo quyền (mức action + chọn tab) ---------- */
test('P0-9 vận hành không sửa/duyệt phiếu hoàn ngoài phạm vi; ?tab= không mở tab thiếu quyền', () => {
  const TH = boot({ user: 'vanhanh', kit: true }); const S = TH.store, X = TH.actions;
  const sc = TH.auth.buildingScope();
  assert.ok(sc && sc.size > 0, 'vận hành có phạm vi tòa giới hạn');
  const rf = S.all('refunds').find(x => !sc.has(x.buildingId) && x.status !== 'paid');
  assert.ok(rf, 'có phiếu hoàn ngoài phạm vi');
  assert.throws(() => X.updateRefund(rf.id, {}), /ngoài phạm vi/);
  // vai trò vận hành không có quyền duyệt → bị chặn ngay ở kiểm quyền (không có vai trò nào vừa được duyệt vừa giới hạn phạm vi)
  assert.throws(() => X.approveRefund(rf.id), /quyền|phạm vi/);
  eq(S.get('refunds', rf.id).approvals || [], rf.approvals || [], 'không ghi nhận duyệt');

  const K = TH.kit;
  const tabs = [{ key: 'tong-quan' }, { key: 'chu-nha-hd', perm: 'owners.view' }, { key: 'tai-chinh', perm: 'owners.view' }];
  TH.auth.login('leader');
  assert.equal(K.pickTab(tabs, 'chu-nha-hd', 'tong-quan'), 'tong-quan', 'leader không mở được tab HĐ chủ nhà qua URL');
  assert.equal(K.pickTab(tabs, 'khong-co', 'tong-quan'), 'tong-quan');
  TH.auth.login('admin');
  assert.equal(K.pickTab(tabs, 'chu-nha-hd', 'tong-quan'), 'chu-nha-hd', 'admin mở được');
});

/* ---------- P0-10 CSV che số tiền theo quyền ---------- */
test('P0-10 xuất CSV: vận hành bị che cột số tiền như trên màn; kế toán thì không', () => {
  const TH = boot({ user: 'vanhanh', kit: true }); const K = TH.kit;
  const headers = ['Mã HĐ', 'Phòng', 'Tổng cần đóng', 'Đã đóng', 'Còn nợ', 'Trạng thái'];
  const rows = [['HD-1', '101T17', 3500000, 1000000, 2500000, 'THIEU'], ['HD-2', '102T17', 0, 0, 0, 'DU']];
  const cols = ['Tổng cần đóng', 'Đã đóng', 'Còn nợ'];
  const masked = K.maskCols(headers, rows, cols);
  masked.forEach((r, i) => {
    eq([r[2], r[3], r[4]], ['•••', '•••', '•••']);
    eq([r[0], r[1], r[5]], [rows[i][0], rows[i][1], rows[i][5]], 'cột khác giữ nguyên');
  });
  TH.auth.login('ketoan');
  eq(K.maskCols(headers, rows, cols), rows);
});

/* ---------- Bộ nghiệm thu trong app (Cài đặt → Đối chiếu nghiệm thu) ---------- */
test('Nghiệm thu trong app (TH.pages.acceptance + acceptance1B) đều đạt trên seed sạch', () => {
  const TH = boot({ user: 'admin', pages: true });
  const acc = TH.pages.acceptance();
  assert.ok(acc.length >= 12, 'đủ tiêu chí 1A + 1B');
  eq(acc.filter(a => !a.ok).map(a => a.name + ' → ' + a.detail), []);
});
