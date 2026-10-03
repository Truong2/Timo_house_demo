/* Các mục P1 làm theo thứ tự SRS §2.3 (sau đợt sửa P0): nhập tay bảng lương, điều chỉnh sau khóa, bấm số ra giao dịch gốc,
   tháng lẻ gắn cờ, lượt thuê chờ nhận có cọc, điện chung dòng 12, HĐ chủ nhà & lịch trả, import hóa đơn nhà cung cấp, xuất Excel báo cáo. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt, completePayroll } from './_app.mjs';

const host = (x) => JSON.parse(JSON.stringify(x));
const sum = (a, f = (x) => x) => a.reduce((t, x) => t + f(x), 0);
const approveAll = (X, run) => run.lines.forEach(l => l.flags.forEach(f => X.approvePayFlag(run.id, l.employeeId + ':' + f.buildingId, 'test')));

test('§2.3 mục 6 – dữ liệu nhập tay bảng lương: ngày công sale, lương vệ sinh/bảo vệ theo tòa, tiền công thợ, hỗ trợ', async (t) => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions;
  const P = '2026-09';
  const sale = S.all('employees').find(e => X.SALE_TITLES.includes(e.title) && e.status === 'active');
  const tech = S.all('employees').find(e => e.title === 'KỸ THUẬT' && e.status === 'active');
  const g1 = (k) => Math.round((TH.qr.build(P, 'total').base.b_G1 || {})[k] || 0);
  const repair0 = g1('repair');
  await t.test('ngày công sale → lương = lương cứng × ngày công / 26', () => {
    X.setWorkdays(P, sale.id, 20);
    const l = X.previewPayroll(P).lines.find(x => x.employeeId === sale.id);
    assert.equal(l.workdays, 20);
    assert.equal(Math.round(l.base), Math.round(sale.baseSalary * 20 / 26));
    assert.ok(!attempt(() => X.setWorkdays(P, sale.id, 40)).ok, 'ngày công > số ngày tháng bị chặn');
    assert.ok(!attempt(() => X.setWorkdays(P, tech.id, 20)).ok, 'ngày công chỉ cho NV kinh doanh');
  });
  await t.test('lương vệ sinh/bảo vệ và tiền công thợ vào báo cáo tòa trước khi chốt', () => {
    X.addPayrollManual({ period: P, kind: 'building_salary', buildingId: 'b_G1', line: 'sal_clean', amount: 1500000, note: 'Vệ sinh G1' });
    X.addPayrollManual({ period: P, kind: 'building_salary', buildingId: 'b_G1', line: 'sal_guard', amount: 2000000 });
    X.addPayrollManual({ period: P, kind: 'repair_labor', employeeId: tech.id, buildingId: 'b_G1', amount: 700000, note: 'Thay vòi' });
    X.addPayrollManual({ period: P, kind: 'manual_pay', employeeId: tech.id, amount: 300000, note: 'Hỗ trợ xăng' });
    assert.equal(g1('sal_clean'), 1500000); assert.equal(g1('sal_guard'), 2000000); assert.equal(g1('repair') - repair0, 700000);
    const l = X.previewPayroll(P).lines.find(x => x.employeeId === tech.id);
    assert.equal(l.labor, 700000); assert.equal(l.manualPay, 300000);
    assert.ok(!attempt(() => X.addPayrollManual({ period: '2026-08', kind: 'building_salary', buildingId: 'b_G1', line: 'sal_clean', amount: 1 })).ok, 'kỳ song song lấy từ Excel');
    assert.ok(!attempt(() => X.addPayrollManual({ period: P, kind: 'manual_pay', employeeId: tech.id, amount: 1, note: '' })).ok, 'hỗ trợ phải có nội dung');
  });
  await t.test('đổi nhập tay sau khi tính → chặn chốt; chốt ghi chi phí đúng dòng báo cáo, phần cố định thợ vào quỹ sửa chữa', () => {
    const run = X.computePayroll(P);
    X.addPayrollManual({ period: P, kind: 'manual_pay', employeeId: sale.id, amount: 100000, note: 'x' });
    assert.match(attempt(() => approveAll(X, run)).msg || '', /nhập lương\/phòng|tính lại/i);
    assert.match(attempt(() => X.closePayroll(run.id)).msg || '', /Tính lại/);
    const run2 = completePayroll(TH, P); X.closePayroll(run2.id);
    const exp = S.all('expenses').filter(e => e.refId === run2.id && e.buildingId === 'b_G1').map(e => e.reportLine).sort();
    assert.deepEqual(host(exp), ['repair', 'sal_clean', 'sal_guard', 'sal_mgr']);
    // quỹ "Lương sửa chữa" = phần cố định của mọi thợ (không gồm tiền công đã ghi thẳng vào tòa – OQ-22)
    const fixedAll = sum(run2.lines.filter(l => l.title === 'KỸ THUẬT'), l => l.X - l.W - (l.labor || 0));
    const fundRepair = sum(S.all('expenses').filter(e => e.refId === run2.id && e.fundCode === 'F_REPAIR'), e => e.amount);
    assert.equal(fundRepair, Math.round(fixedAll));
    assert.ok(!S.all('expenses').some(e => e.refId === run2.id && e.fundCode === 'F_REPAIR' && e.amount >= fixedAll + 700000), 'tiền công không vào quỹ');
    assert.equal(g1('sal_clean'), 1500000, 'sau chốt đọc từ chi phí, không cộng trùng');
    assert.ok(!attempt(() => X.addPayrollManual({ period: P, kind: 'manual_pay', employeeId: sale.id, amount: 1, note: 'x' })).ok, 'sau chốt không nhập thêm');
  });
});

test('UI-27/UI-28 – bấm số ra giao dịch gốc (TH.qr.sources)', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store;
  const base = TH.qr.build('2026-09', 'total').base.b_G1;
  const rev = TH.qr.sources('2026-09', 'rev_total', ['b_G1']);
  assert.ok(rev.items.some(i => i.type === 'Phiếu thu' && /^#\/billing\/receipts\//.test(i.href)));
  assert.ok(Math.abs(sum(rev.items, i => i.amount) - base.rev_total) < 1, 'tổng giao dịch = số trên báo cáo (dòng 3)');
  const rent = TH.qr.sources('2026-09', 'rev_rent', ['b_G1']);
  assert.ok(rent.items.every(i => /^#\/billing\/invoices\//.test(i.href)));
  assert.ok(Math.abs(sum(rent.items, i => i.amount) - base.rev_rent) < 1, 'dòng 10 = Σ dòng 1 hóa đơn');
  const own = TH.qr.sources('2026-09', 'cost_rent', ['b_G1']);
  assert.equal(own.items[0].href, '#/owners/oc_G1');
  const gm = TH.qr.sources('2026-08', 'sal_gm', ['b_G1']);
  assert.equal(Math.round(gm.items.find(i => i.type === 'Phân bổ quỹ chung').amount), 141100);
  assert.ok(gm.items.some(i => i.type === 'Chứng từ quỹ (cả hệ thống)' && i.amount === 13000000));
  const tcp = TH.qr.sources('2026-09', 'tcp', ['b_G1']);
  assert.ok(tcp.parts && tcp.parts.includes('sal_mgr'), 'dòng tổng trả về dòng thành phần');
  const rev08 = TH.qr.sources('2026-08', 'rev_total', ['b_G1']);
  assert.ok(rev08.items.every(i => i.type === 'Excel SRC-04') && /song song/.test(rev08.note));
});

test('UI-38 – điều chỉnh sau khóa hiện trong giao dịch nguồn của ô', () => {
  const TH = boot({ user: 'admin' }); const X = TH.actions;
  const run = completePayroll(TH, '2026-08'); X.closePayroll(run.id);
  const al = X.saveAllocation('2026-08'); X.closeAllocation(al.id); X.closePeriod('2026-08');
  X.addPeriodAdjustment({ period: '2026-08', buildingId: 'b_G1', reportLine: 'cost_el', amount: 250000, reason: 'Hóa đơn điện T8 về muộn' });
  const src = TH.qr.sources('2026-08', 'cost_el', ['b_G1']);
  assert.ok(src.items.some(i => i.type === 'Điều chỉnh sau khóa' && i.amount === 250000));
  assert.match(src.note, /đã khóa/);
});

test('§3.12b – tháng lẻ lệch quy tắc số ngày thực được gắn cờ: đúng 3 hóa đơn', () => {
  const TH = boot({ user: 'ketoan' });
  const flagged = TH.store.all('invoices').filter(i => TH.q.prorataFlag(i)).map(i => i.customerCode).sort();
  assert.deepEqual(host(flagged), ['101G18A001', '304T35A002', '404S4A001']);
  assert.equal(TH.calc.billing.prorataFlag({ factor: 1, unit: 4900000 * 16 / 30 }, { days: 16, denom: 30 }), null, 'đơn giá lẻ nhưng đúng mẫu số 30 → không gắn cờ');
});

test('§2.3 mục 3 – lượt thuê chờ nhận có cọc, ba loại ngày, không chồng lượt thuê; import cọc đang giữ', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const free = S.all('rooms').filter(r => r.exploitation === 'timehouse' && r.price > 0 && !Q.currentStay(r.id) && !Q.pendingStay(r.id));
  const base = (room, extra) => Object.assign({ roomId: room.id, name: 'Khách test', phone: '0901234567', rentStart: '2026-10-01', endDate: '2027-09-30', rent: room.price, deposit: 3000000, status: 'pending' }, extra);
  const e1 = attempt(() => X.createStay(base(free[0])));
  assert.ok(!e1.ok, 'chờ nhận không cọc bị chặn');
  assert.ok(!attempt(() => X.createStay(base(free[0], { dealDate: '2026-10-05', depositReceived: { amount: 3000000, date: '2026-09-25' } }))).ok, 'ngày chốt sau ngày tính tiền bị chặn');
  const s = X.createStay(base(free[0], { dealDate: '2026-09-25', depositReceived: { amount: 3000000, date: '2026-09-25' } }));
  assert.equal(Q.stay(s.id).depositStatus, 'held'); assert.equal(Q.stay(s.id).dealDate, '2026-09-25');
  const occ = S.all('stays').find(x => x.status === 'active' && x.endDate > '2027-01-01' && !Q.pendingStay(x.roomId));
  const room = Q.room(occ.roomId);
  assert.ok(!attempt(() => X.createStay(base(room, { depositReceived: { amount: 1000000, date: '2026-09-25' } }))).ok, 'chồng với khách cũ còn hạn bị chặn');
  X.setNotice(occ.id, { noticeDate: '2026-09-20', plannedLeaveDate: '2026-10-20' });
  assert.ok(attempt(() => X.createStay(base(room, { rentStart: '2026-10-21', depositReceived: { amount: 1000000, date: '2026-09-25' } }))).ok, 'sau ngày bàn giao đã báo → cho phép');
  // import lượt thuê kèm cọc đang giữ → số dư đầu kỳ trong sổ cọc
  const r2 = free[1];
  const v = X.validateImport('stays', [{ room: r2.code, name: 'Khách import', phone: '0911111111', moveIn: '2026-09-01', endDate: '2027-08-31', rent: String(r2.price), deposit: '3500000' }]);
  X.commitImport('stays', 'x.csv', v);
  const st = S.all('stays').find(x => x.roomId === r2.id && x.status === 'active');
  assert.equal(st.depositStatus, 'held');
  assert.equal(sum(S.where('depositLedger', l => l.stayId === st.id && l.kind === 'opening'), l => l.amount), 3500000);
  const again = X.validateImport('stays', [{ room: r2.code, name: 'Khách import', phone: '0911111111', moveIn: '2026-09-01', endDate: '2027-08-31', rent: String(r2.price), deposit: '3500000' }]);
  assert.equal(again[0].status, 'duplicate', 'import lại trùng dữ liệu hiện có');
});

test('§2.3 dòng 11–12 – điện chung chia vào dòng 12 hóa đơn', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, B = TH.calc.billing;
  const r = X.createInvoiceDrafts('2026-10', ['b_G1']);
  const withCommon = r.created.filter(i => B.expand(i.lines)[11].amount > 0);
  assert.equal(withCommon.length, 7);
  assert.equal(sum(withCommon, i => B.expand(i.lines)[11].amount), (12400 - 12040) * 3500, 'tổng dòng 12 = tiền đồng hồ chung');
  X.issueInvoices(withCommon.map(i => i.id));
  assert.equal(S.get('meterReadings', 'rdc_G1_1_2026-10').locked, true, 'phát hành → khóa chỉ số điện chung');
  const g1 = S.all('rooms').filter(x => x.buildingId === 'b_G1' && x.floor === 5).map(x => x.id);
  assert.ok(!attempt(() => X.addSharedGroup({ buildingId: 'b_G1', name: 'x', roomIds: [g1[0]], method: 'rooms', unit: 3500 })).ok, 'nhóm cần ≥ 2 phòng');
  const busy = S.get('sharedMeterGroups', 'smg_G1_1').roomIds.slice(0, 2);
  assert.ok(!attempt(() => X.addSharedGroup({ buildingId: 'b_G1', name: 'x', roomIds: busy, method: 'rooms', unit: 3500 })).ok, 'phòng đã thuộc nhóm khác');
});

test('§2.3 dòng 20 – HĐ chủ nhà: phụ lục trong thời hạn, tính lại lịch trả, không chi vượt, hủy chi hoàn lại', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions;
  assert.ok(!attempt(() => X.addOwnerRate('oc_G1', { from: '2040-01-01', rent: 1, reason: 'x' })).ok);
  X.addOwnerRate('oc_G1', { from: '2026-11-01', rent: 50000000, reason: 'Phụ lục tăng giá' });
  const open = S.where('ownerPayments', o => o.contractId === 'oc_G1' && o.paid < o.amountDue).map(o => [o.from, o.amountDue]);
  assert.deepEqual(host(open), [['2026-10-01', 48000000], ['2026-11-01', 50000000], ['2026-12-01', 50000000]]);
  const op = S.one('ownerPayments', o => o.contractId === 'oc_G1' && o.paid < o.amountDue);
  assert.ok(!attempt(() => X.recordOwnerPayment(op.id, { amount: op.amountDue * 2, date: '2026-09-28' })).ok, 'chi vượt bị chặn');
  const e = X.recordOwnerPayment(op.id, { amount: 1000000, date: '2026-09-28' }); X.voidExpense(e.id, 'nhập sai');
  assert.equal(S.get('ownerPayments', op.id).paid, 0);
  const b = X.addBuilding({ code: 'G99', address: 'x', areaId: S.all('areas')[0].id, managerId: S.all('employees')[0].id, rooms: 0 });
  const oc = X.addOwnerContract({ buildingId: b.id, ownerName: 'Chủ nhà mới', startDate: '2026-10-01', endDate: '2031-09-30', monthlyRent: 30000000, deposit: 60000000, payCycleMonths: 3, payDay: 5 });
  assert.deepEqual(host(S.where('ownerPayments', o => o.contractId === oc.id).map(o => o.amountDue)), [90000000, 90000000, 90000000, 90000000]);
  assert.equal(X.ownerRentAt(oc.id, '2026-10-15'), 30000000);
});

test('§2.3 dòng 22–27 – import hóa đơn nhà cung cấp theo mã KH; chi phí "CHUNG" không tự vào quỹ', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions;
  const rows = [{ service: 'Điện', customerCode: 'PD30•••097', period: '2026-09', date: '2026-09-12', amount: '15102000', invoiceNo: 'EVN-G1' },
    { service: 'Điện', customerCode: 'PD99•••000', period: '2026-09', date: '2026-09-12', amount: '1', invoiceNo: 'X' },
    { service: 'Rác', building: 'G1', period: '2026-09', date: '2026-09-15', amount: '300000', invoiceNo: 'RAC-1' }];
  const v = X.validateImport('vendorBills', rows);
  assert.deepEqual(host(v.map(r => r.status)), ['ok', 'error', 'ok']);
  X.commitImport('vendorBills', 'ncc.csv', v);
  assert.deepEqual(host(S.all('expenses').filter(e => /^NCC-/.test(e.code)).map(e => [e.reportLine, e.buildingId, e.amount])), [['cost_el', 'b_G1', 15102000], ['cost_garbage', 'b_G1', 300000]]);
  assert.equal(X.validateImport('vendorBills', rows.slice(0, 1))[0].status, 'duplicate');
  assert.equal(X.validateImport('expenses', [{ code: 'CPX', date: '2026-09-10', period: '2026-09', category: 'Chi phí khác', scope: 'CHUNG', amount: '1000' }])[0].status, 'error');
});

test('UI-27 – xuất Excel theo mẫu có tên báo cáo, kỳ, bộ lọc, phiên bản số liệu', () => {
  const TH = boot({ user: 'admin', kit: true });
  const xml = TH.kit.xlsXml('BÁO CÁO TỔNG', ['BÁO CÁO TỔNG – Tháng 8/2026', ['Bộ lọc', 'Toàn hệ thống'], ['Phiên bản số liệu', 'Số web tạm tính']], ['Dòng', 'Chỉ tiêu', 'TỔNG'], [[3, 'Tổng doanh thu', 7036256236], [4, 'A & B <x>', 1]]);
  assert.match(xml, /<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"/);
  assert.match(xml, /Phiên bản số liệu/);
  assert.match(xml, /<Data ss:Type="Number">7036256236<\/Data>/);
  assert.match(xml, /A &amp; B &lt;x&gt;/);
});

test('Lọc quản lý theo phân công tại cuối kỳ (không theo hôm nay)', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const a = S.all('assignments').find(x => x.buildingId === 'b_G1' && x.responsibility === 'operate' && !x.to);
  const other = S.all('employees').find(e => e.id !== a.employeeId && e.title === 'NVVH' && e.status === 'active');
  X.assignBuilding({ employeeId: other.id, buildingId: 'b_G1', from: '2026-10-15', reason: 'Chuyển quản lý' });
  assert.equal(Q.managerMap('2026-09-30').b_G1.id, a.employeeId);
  assert.equal(Q.managerMap('2026-10-31').b_G1.id, other.id);
});
