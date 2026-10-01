/* Phase 2 – Đợt 3: trung tâm báo cáo & báo cáo vận hành (UI-27, UI-42…UI-46). Kịch bản F26–F27, NT-3, NT-4. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './_app.mjs';
import { fixture } from './_load.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));
const near = (a, b, eps = 0.5) => Math.abs(a - b) <= eps;

test('F26.1 / NT-3 – âm dương điện T7 "như Excel": K 1.234.987.000, L 913.178.913, M +321.808.087; T2 chi 8.135.381; cờ tòa thiếu', () => {
  const TH = boot({ user: 'ketoan' });
  const A = TH.qo.amDuong('2026-07', 'electric', 'excel');
  assert.equal(A.status, 'ready'); assert.equal(A.rows.length, 97);
  assert.deepEqual([A.total.K, A.total.L, A.total.M], [1234987000, 913178913, 321808087]);
  assert.equal(A.rows.find(r => r.b === 'T2').L, 8135381);
  assert.ok(A.rows.find(r => r.b === 'S25').flags.includes('Mã tòa Excel không có trên web'));
  assert.ok(A.rows.filter(r => r.flags.includes('Chưa có hóa đơn chi')).map(r => r.b).includes('G8'));
  // công thức K = H + B/2 + E đúng trên từng dòng file
  A.rows.filter(r => r.K != null && r.H != null).forEach(r => assert.ok(near(r.K, r.H + (r.B || 0) / 2 + (r.E || 0), 1), r.b));
  assert.equal(fixture('amduong-2026-06-07-p2.json')['2026-07'].electric.total.M, 321808087);
});

test('F26.2 / NT-4 – âm dương nước T6 "như Excel": 292.728.500 − 207.782.352 = +84.946.148; T2 chi 977.500', () => {
  const TH = boot({ user: 'ketoan' });
  const A = TH.qo.amDuong('2026-06', 'water', 'excel');
  assert.deepEqual([A.total.K, A.total.L, A.total.M], [292728500, 207782352, 84946148]);
  assert.equal(A.rows.find(r => r.b === 'T2').L, 977500);
  A.rows.filter(r => r.K != null && r.H != null).forEach(r => assert.ok(near(r.K, r.H + (r.B || 0) / 2, 1), r.b));
});

test('F26.3 – âm dương web kỳ 09: phải thu = dòng điện hóa đơn đã phát hành + trừ cọc + phòng trống (OQ-20 tách dòng); K = H + B/2 + E; thu − chi thực', () => {
  const TH = boot({ user: 'ketoan' }); const Q = TH.q, B = TH.calc.billing;
  const A = TH.qo.amDuong('2026-09', 'electric', 'web');
  const invs = Q.invoicesOf('2026-09').filter(i => i.lifecycle !== 'draft');
  const lines = invs.reduce((t, i) => { const L = B.expand(i.lines); return t + L[2].amount + L[11].amount; }, 0);
  assert.ok(near(A.total.I, lines + A.total.dep + A.total.vac, 1), 'I = dòng 3 + 12 + trừ cọc + phòng trống');
  assert.ok(A.total.vac > 0 && A.total.dep > 0);
  A.rows.forEach(r => { assert.ok(near(r.K, r.H + r.B / 2 + r.E, 0.02), r.b); if (r.M != null) assert.ok(near(r.realM, r.M - r.vac, 0.02)); });
  assert.ok(['ready', 'no_cost'].includes(A.status));
  // tham số OQ-20 tắt → phòng trống không vào tổng thu
  const prm = TH.store.one('params', p => p.key === 'amduongVacantInIncome'); prm.value = false; TH.store.version++;
  const B2 = TH.qo.amDuong('2026-09', 'electric', 'web');
  assert.ok(near(B2.total.I, A.total.I - A.total.vac, 1));
  const W = TH.qo.amDuong('2026-09', 'water', 'web');
  const wl = invs.reduce((t, i) => t + B.expand(i.lines)[3].amount, 0);
  assert.ok(near(W.total.I, wl + W.total.dep, 1));
});

test('F27.2 – UI-42 chi phí T8: giá vốn + cố định + phát sinh = TCP Báo cáo tổng (6.024.500.037); giá vốn 5.316.928.772', () => {
  const TH = boot({ user: 'ketoan' });
  const C = TH.qo.costs('2026-08');
  assert.equal(Math.round(C.total), 6024500037);
  assert.equal(Math.round(C.groups.find(g => g.key === 'gv').total), 5316928772);
  assert.equal(Math.round(C.total), Math.round(C.rep.cols.TOTAL.tcp));
  assert.deepEqual(plain(C.groups.map(g => g.lines.length)), [8, 11, 3]);
});

test('F27.3 – UI-44 sửa chữa T8 (như Excel): 233 việc, công 23.350.000 + vật tư 21.981.000; lương vệ sinh 43.200.000', () => {
  const TH = boot({ user: 'ketoan' });
  const R = TH.qo.repairs('2026-08', 'excel', 'building');
  assert.deepEqual([R.totals.jobs, R.totals.labor, R.totals.material], [233, 23350000, 21981000]);
  assert.equal(R.cleaning.salary, 43200000);
  assert.ok(R.cleaning.jobs > 30);
  assert.equal(R.rows.reduce((t, x) => t + x.total, 0), 23350000 + 21981000);
  const W = TH.qo.repairs('2026-08', 'web', 'worker');
  assert.equal(W.totals.outside, 53); assert.equal(W.totals.labor, 13300000 + 5550000);
  const byR = TH.qo.repairs('2026-08', 'excel', 'reason'); assert.ok(byR.rows.some(x => x.key === 'Khách phá HĐ'));
});

test('F27.4 – UI-45 phòng vận hành kỳ 09: HS thực tế (công thức lương), lấp đầy, thời gian trống, đúng hạn, phân khúc', () => {
  const TH = boot({ user: 'truongphong' });
  const O = TH.qo.rooms('2026-09');
  assert.ok(O.rows.length > 0);
  const T = O.totals;
  assert.ok(T.hs > 50 && T.hs < 130, 'HS ' + T.hs); assert.ok(T.occ > 0.5 && T.occ <= 1);
  const b = T.bucket; assert.equal(b.ontime + b.d10 + b.d15 + b.late + b.open, T.invoices);
  assert.ok(T.students > 0 && T.students < T.active);
  // HS tòa = HS bảng lương cùng kỳ (OQ-18) cho tòa có phân công vận hành
  TH.auth.login('admin');
  const pv = TH.actions.previewPayroll('2026-09'); const pb = pv.lines.flatMap(l => l.buildings).find(x => x.HS != null);
  const r = TH.qo.rooms('2026-09').rows.find(x => x.buildingId === pb.buildingId);
  assert.ok(Math.abs(r.hs - pb.HS) < 1e-6);
  // kỳ song song 08: HS lấy từ đầu vào bảng lương Excel
  assert.ok(TH.qo.rooms('2026-08').rows.filter(x => x.hs != null).length > 50);
});

test('F27.5 – UI-46 khách & doanh số kỳ 09: % chốt / xem, doanh số theo ngày chốt, hủy tách riêng', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store;
  const R = TH.qo.sales('2026-09', 'sale');
  assert.ok(R.totals.viewed >= R.totals.closed && R.totals.closed > 0);
  const sept = S.all('deals').filter(d => d.closeDate.startsWith('2026-09') && !['cancelled', 'forfeited'].includes(d.status));
  assert.ok(near(R.totals.volume, sept.reduce((t, d) => t + d.price, 0), 1));
  ['team', 'source', 'area', 'building'].forEach(by => assert.ok(TH.qo.sales('2026-09', by).conv.length > 0, by));
});

test('F27.1 – UI-27 trung tâm 4 nhóm: có trạng thái; UI-40/41 là Phase 3', () => {
  const TH = boot({ user: 'truongphong' });
  TH.ms.set('2'); // ở mốc 2, UI-40/41 là Phase 3
  const C = TH.qo.catalog();
  assert.deepEqual(plain(C.map(g => g.key)), ['kq', 'vh', 'kd', 'toa']);
  const all = C.flatMap(g => g.items);
  assert.ok(all.filter(x => ['UI-40', 'UI-41'].includes(x.ui)).every(x => x.status === 'phase3'));
  TH.ms.set('3'); // mốc 3: có link màn hình
  assert.ok(TH.qo.catalog().flatMap(g => g.items).filter(x => ['UI-40', 'UI-41'].includes(x.ui)).every(x => x.href && x.status !== 'phase3'));
  assert.ok(all.filter(x => x.status === 'ready').every(x => x.href));
  assert.ok(!TH.auth.can('reports.export'), 'trưởng phòng xem, không xuất');
});

test('NT-0 – Phase 1 không đổi sau Đợt 3 (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name)), []);
});
