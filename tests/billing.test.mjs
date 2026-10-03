/* Hóa đơn: 13 dòng, tháng lẻ, Thu khác, phá HĐ, mốc công nợ – đối chiếu hóa đơn tháng 9/2026 (SRC-08). */
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, fixture } from './_load.mjs';

const TH = load();
const B = TH.calc.billing, D = TH.calc.dates, P = TH.calc.payments;
const plain = (o) => JSON.parse(JSON.stringify(o)); // object từ vm khác realm
const invoices = fixture('invoices-2026-09.json');
/* Lỗi nguồn Excel đã ghi nhận: ô "Tổng cần đóng" gõ số cứng (103T25) hoặc công thức bỏ sót khoản (101S8 thiếu điện chung…) */
const EXCEL_ERRORS = new Set(['102T20A002', '103T25A001', '101S8A001', '103S22A001', '201S38A002', '101G4A001', '302G6A001', '301G7A002', '601G16A001']);

test('tổng 13 dòng = "Tổng cần đóng" Excel cho mọi hóa đơn tháng 9 (trừ lỗi nguồn đã ghi nhận)', () => {
  const bad = invoices.filter(i => Math.abs(B.total(B.expand(i.lines)) - i.excelTotal) > 1).map(i => i.stay);
  assert.equal(invoices.length, 1471);
  assert.deepEqual(bad.filter(c => !EXCEL_ERRORS.has(c)), []);
  assert.equal(bad.length, EXCEL_ERRORS.size);
});

test('403T20: dòng 13 Thu khác = 6 ngày tháng 8, tổng 6.069.892, đã đóng 6.069.000 → Thiếu', () => {
  const i = invoices.find(x => x.stay === '403T20A001');
  const L = B.expand(i.lines);
  assert.equal(Math.round(L[12].amount), 503226);
  assert.equal(Math.round(B.total(L)), 6069892);
  assert.equal(P.payStatus(B.total(L), 6069000), 'THIEU');
  const c = B.carryOther({ monthly: 2600000, startISO: '2026-08-26', period: '2026-09' });
  assert.equal(c.days, 6); assert.equal(c.denom, 31); assert.equal(Math.round(c.amount), 503226);
});

test('tháng lẻ: số ngày = ngày của tháng − ngày vào + 1, mẫu số = số ngày thực của tháng', () => {
  assert.deepEqual(plain(D.proRataDays('2026-09-06', '2026-09')), { days: 25, denom: 30 });
  assert.deepEqual(plain(D.proRataDays('2026-07-10', '2026-07')), { days: 22, denom: 31 });
  assert.deepEqual(plain(D.proRataDays('2026-08-26', '2026-08')), { days: 6, denom: 31 });
  assert.equal(Math.round(D.proRata(3500000, '2026-09-06', '2026-09').amount), 2916667);
  // 22 hóa đơn PHÒNG MỚI THÁNG 9: hệ số tiền phòng = số ngày / 30
  const pm = invoices.filter(i => i.isNewStay);
  assert.equal(pm.length, 22);
  // 404S4A001 là khách "ở nhờ" giá riêng (ghi chú SRC-08), không theo công thức tháng lẻ
  pm.filter(i => i.stay !== '404S4A001').forEach(i => { const l = B.expand(i.lines)[0]; const days = Math.round(l.factor * 30); assert.ok(days >= 1 && days <= 30, i.stay); assert.ok(Math.abs(l.amount - l.unit * days / 30) < 1, i.stay); });
});

test('phòng mới tháng 9: tổng đã thu = 126.912.000', () => {
  const s = invoices.filter(i => i.isNewStay).reduce((t, i) => t + i.excelPaid, 0);
  assert.equal(s, 126912000);
});

test('phá HĐ: 20 phòng, phải thu (chỉ tiền điện) 16.048.000, đã thu 3.662.000', () => {
  const br = invoices.filter(i => i.isBreach);
  assert.equal(br.length, 20);
  assert.equal(br.reduce((t, i) => t + i.breachDue, 0), 16048000);
  assert.equal(br.reduce((t, i) => t + i.breachPaid, 0), 3662000);
  br.forEach(i => { const L = B.breachLines(i.lines); assert.equal(Math.round(B.total(L)), Math.round(B.expand(i.lines)[2].amount), i.stay); });
});

test('buildLines: chia ngày một lần; cọc, nợ cũ, điện theo chỉ số không chia ngày', () => {
  const L = B.buildLines({ stay: { rentStart: '2026-10-06', svcStart: '2026-10-06', payMonths: 1 }, period: '2026-10',
    rate: { rent: 3100000, items: { electric: { unit: 4000, method: 'meter' }, water: { unit: 120000, method: 'person' }, internet: { unit: 100000, method: 'room', qty: 1 } } },
    reading: { elPrev: 100, elCurr: 150 }, people: 2, depositDue: 3100000, oldDebt: 50000 });
  assert.equal(L.length, 13);
  assert.equal(L[0].amount, Math.round(3100000 * 26 / 31));
  assert.equal(L[1].amount, 3100000);
  assert.equal(L[2].amount, 200000);
  assert.equal(L[3].amount, Math.round(2 * 120000 * 26 / 31));
  assert.equal(L[10].amount, 50000);
});

test('trạng thái thu theo cột AY Excel (Chưa TT / Thiếu / Đủ / Thừa) khớp mọi hóa đơn', () => {
  const bad = invoices.filter(i => !i.isBreach && i.excelStatus !== '30.0').filter(i => P.excelStatus(i.excelTotal, i.excelPaid) !== i.excelStatus);
  assert.deepEqual(bad.map(i => i.stay), []);
  // web làm tròn đến đồng (dung sai 0,5đ): số lẻ thập phân của Excel không tạo "Thiếu" giả
  assert.equal(P.payStatus(3512903.23, 3512903), 'DU');
  assert.equal(P.payStatus(0, 500000), 'DONG_COC');
});

test('công nợ mặc định sau 5 ngày lịch từ ngày phát hành; dueDate là chế độ tương thích', () => {
  const inv = { period: '2026-09', issuedAt: '2026-08-26T09:00:00' };
  const w = D.billingWindow('2026-09', { cutoffDay: 22, dueFromDay: 25, debtAfterDueDays: 5, debtBasis: 'issuedAt' }, inv);
  assert.deepEqual(plain(w), { cutoff: '2026-08-22', issueDate: '2026-08-26', dueFrom: '2026-08-25', dueTo: '2026-08-31', debtFrom: '2026-08-31', debtBase: '2026-08-26', debtBasis: 'issuedAt' });
  assert.equal(P.debtState(inv, 100, '2026-08-30', { debtBasis: 'issuedAt' }).state, 'in_term');
  assert.equal(P.debtState(inv, 100, '2026-08-31', { debtBasis: 'issuedAt' }).state, 'debt');
  assert.equal(D.isOnTime('2026-08-30', '2026-09', { debtBasis: 'issuedAt' }, inv), true);
  assert.equal(D.isOnTime('2026-08-31', '2026-09', { debtBasis: 'issuedAt' }, inv), false);

  const compat = D.billingWindow('2026-09', { cutoffDay: 22, dueFromDay: 25, debtAfterDueDays: 5, debtBasis: 'dueDate' }, inv);
  assert.equal(compat.debtFrom, '2026-09-06');
  assert.equal(P.debtState(inv, 100, '2026-09-05', { debtBasis: 'dueDate' }).state, 'overdue');
  assert.equal(P.debtState(inv, 100, '2026-09-06', { debtBasis: 'dueDate' }).state, 'debt');

  const historical = D.billingWindow('2026-09', { cutoffDay: 22, debtBasis: 'issuedAt' }, { period: '2026-09' });
  assert.equal(historical.issueDate, '2026-08-22', 'thiếu issuedAt thì dùng ngày phát hành nguồn/cutoff');
});

test('phân bổ phiếu thu: không vượt số tiền phiếu, không vượt số còn phải thu', () => {
  assert.equal(P.validateAllocation(1000, [{ amount: 1200 }]).ok, false);
  assert.equal(P.validateAllocation(1000, [{ amount: 600, max: 500 }]).ok, false);
  assert.deepEqual(plain(P.validateAllocation(1000, [{ amount: 700, max: 900 }])), { ok: true, errs: [], allocated: 700, unallocated: 300 });
  assert.deepEqual(plain(P.prepaySplit(17000000, 5552000, 3).parts.map(x => x.amount)), [5552000, 5552000, 5552000]);
});
