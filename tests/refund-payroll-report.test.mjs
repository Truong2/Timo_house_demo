/* Hoàn cọc, bảng lương, phân bổ, khấu hao, báo cáo – đối chiếu SRC-08 HOÀN CỌC, SRC-03, SRC-07 G1, SRC-04 tháng 8. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, fixture } from './_load.mjs';

const TH = load();
const C = TH.calc;
const plain = (o) => JSON.parse(JSON.stringify(o));

test('hoàn cọc 301T41: BC 1.270.000, BD 2.530.000; tiền 9 ngày ở thêm hiện riêng, không trừ', () => {
  const r = fixture('refunds-2026-09.json').find(x => x.room === '301T41');
  const c = C.refund.calc({ deposit: r.deposit, deductions: r.deductions });
  assert.equal(c.bc, 1270000); assert.equal(c.bd, 2530000);
  assert.equal(Math.round(r.extraRent), 1103226);
});

test('hoàn cọc: BD = I − BC khớp 154 dòng sheet HOÀN CỌC; khấu hao đơn giá 200.000đ/phòng', () => {
  const rs = fixture('refunds-2026-09.json');
  assert.equal(rs.length, 154);
  rs.forEach(r => { const c = C.refund.calc({ deposit: r.deposit, deductions: r.deductions }); assert.ok(Math.abs(c.bd - r.excelBD) < 1, r.room); });
  assert.equal(rs.filter(r => r.deductions.some(d => d.kind === 'depreciation' && d.unit === 200000)).length, 144);
  assert.deepEqual(plain(C.refund.calc({ deposit: 5000000, deductions: [{ amount: 5300000 }] })), { bc: 5300000, bd: -300000, payable: 0, excess: 300000 });
});

test('lương T8: T, HS khớp 100%; V/W khớp trừ 3 ngoại lệ nguồn (S39 V51, S28, S36)', () => {
  const pay = fixture('payroll-2026-08.json');
  const tiersOver = (vf) => { const m = String(vf).match(/\*(\d+)\/(\d+)/); if (!m) return null; const r = +m[1], b = +m[2]; for (const [a, u, o] of C.payroll.TIERS) { if ((b === a && o[0] === r) || (b === a + 5 && o[1] === r)) return true; if ((b === a && u[0] === r) || (b === a + 5 && u[1] === r)) return false; } return null; };
  let rows = 0; const bad = [];
  pay.forEach(p => {
    const over = p.buildings.map(b => tiersOver(b.Vf)).find(x => x != null);
    p.buildings.forEach(b => {
      rows++;
      if (!String(b.Vf).startsWith('=')) return; // tòa lương cố định 100.000đ/phòng
      const r = C.payroll.buildingPay({ J: b.J, K: b.K, L: b.L, A: b.M + b.N + b.O, Q: b.Q, C: b.S, over1y: over });
      assert.ok(Math.abs(r.T - b.T) < 1e-6, 'T ' + b.b); assert.ok(Math.abs(r.HS - b.U) < 1e-9, 'HS ' + b.b);
      if (Math.abs(r.W - b.W) > 0.5) bad.push(b.b);
    });
  });
  assert.equal(rows, 101);
  assert.deepEqual(plain(bad.sort()), ['S28', 'S36', 'S39']);
});

test('quy tắc cận gần nhất + ca đặc biệt', () => {
  const P = C.payroll;
  assert.equal(Math.round(P.tierRate(92.14, true).perRoom), Math.round(92.14 * 110000 / 90));
  assert.equal(P.tierRate(94.27, true).rule, 'HS × 119000/95 (cận trên)');
  assert.equal(Math.round(P.tierRate(97.26276034401698, true).perRoom), 122858);
  assert.equal(P.tierRate(103.21, true).flag, 'HS>100');
  assert.equal(P.tierRate(65, false).perRoom, 6000);
  assert.equal(P.tierRate(65, true).perRoom, 6500);
  assert.equal(P.over1y('2025-08-31', '2026-08-31'), true);
  assert.equal(P.over1y('2025-09-01', '2026-08-31'), false);
  assert.equal(P.leadPay(774), 7740000);
  assert.equal(Math.round(P.salePay(2500000, 25)), 2403846);
});

test('phân bổ G1 khớp SRC-07 C36–C46 (15 phòng, mẫu số 1.382)', () => {
  const r = C.allocation.allocate({ denominator: 1382, roomsByBuilding: { G1: 15, X: 1367 }, funds: [
    { lineCode: 'sal_gm', amount: 13000000 }, { lineCode: 'sal_head', amount: 20000000, surchargePerRoom: 10000 }, { lineCode: 'sal_acct', amount: 2000000, surchargePerRoom: 10000, fixedPerBuilding: 10000 },
    { lineCode: 'office', amount: 53851231 }, { lineCode: 'sal_sales', amount: 57300001 }] });
  const g = (c) => r.lines.find(l => l.lineCode === c).results.G1;
  assert.ok(Math.abs(g('sal_gm') - 141099.85528219971) < 1e-6);
  assert.ok(Math.abs(g('sal_head') - 367076.70043415343) < 1e-6);
  assert.ok(Math.abs(g('sal_acct') - 181707.67004341533) < 1e-6);
  assert.ok(Math.abs(g('office') - 584492.3769898699) < 1e-3);
  assert.ok(Math.abs(g('sal_sales') - 621924.7575976845) < 1e-6);
  assert.equal(r.gap, 0);
  assert.ok(Math.abs(r.lines[0].total - 13000000) < 1e-6);
});

test('khấu hao 1,6%/tháng cộng dồn đến đủ nguyên giá', () => {
  const items = [{ buildingId: 'b', purchaseDate: '2026-08-10', cost: 35380000, depRate: 0.016 }];
  assert.equal(Math.round(C.depreciation.forPeriod(items, '2026-08').total), 566080);
  assert.equal(C.depreciation.forPeriod(items, '2026-07').total, 0);
  const last = C.depreciation.forPeriod(items, '2031-10'); // tháng thứ 63: còn 0,8%
  assert.equal(Math.round(last.total), Math.round(35380000 * 0.008));
  assert.equal(C.depreciation.forPeriod(items, '2031-11').total, 0);
});

test('báo cáo tổng T8: công thức dòng 18–61 tái hiện sheet; cột T+S+G = TỔNG', () => {
  const rep = fixture('report-2026-08.json');
  const lines = load(['core/format.js', 'data/catalog.js']).data.catalog.reportLines;
  const base = {}; const cols = { T: {}, S: {}, G: {} };
  lines.forEach(l => { const r = rep.total[l.row]; if (!r) return; base[l.code] = r[0]; cols.T[l.code] = r[1]; cols.S[l.code] = r[2]; cols.G[l.code] = r[3]; });
  const d = C.report.derive(base);
  assert.equal(Math.round(d.rev_total), 7036256236);
  assert.equal(Math.round(d.tcp), 6013857267);
  assert.equal(Math.round(d.lnr), 1022398969);
  lines.filter(l => rep.total[l.row]).forEach(l => { const x = rep.total[l.row][0]; const v = d[l.code]; if (x != null && v != null) assert.ok(Math.abs(v - x) < 1e-6 * Math.max(1, Math.abs(x)), l.code); });
  const agg = C.report.aggregate({ T: cols.T, S: cols.S, G: cols.G }, (b) => b);
  assert.ok(Math.abs(agg.TOTAL.lnr - d.lnr) < 1e-3);
});

test('báo cáo kinh doanh T8: GĐ OQ-10 = 790.331.663; như sheet Excel = 685.928.969', () => {
  const rep = fixture('report-2026-08.json');
  const lines = load(['core/format.js', 'data/catalog.js']).data.catalog.reportLines;
  const base = {}; lines.forEach(l => { if (rep.total[l.row]) base[l.code] = rep.total[l.row][0]; });
  const gd = C.report.business(base, { depreciation: 566080 });
  assert.equal(Math.round(gd.rev_total), 6769375010); assert.equal(Math.round(gd.tcp), 5979043347); assert.equal(Math.round(gd.lnr), 790331663);
  const ex = C.report.business(base, { mode: 'excel' });
  assert.equal(Math.round(ex.lnr), 685928969);
  assert.equal(Math.round(ex.rev_total), Math.round(rep.business[3][0]));
});
