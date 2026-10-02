import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './_app.mjs';

test('NT-10 efficiency ratios; LN/tài sản only for buildings with an asset baseline (GĐ OQ-24)', () => {
  const t = boot(), kd = t.qe.build('2026-08', { basis: 'business', source: 'excel' }), total = t.qe.build('2026-08', { basis: 'total', source: 'excel' });
  assert.ok(Math.abs(kd.totals.TOTAL.profitOnCapital - 0.12987) < 0.00001); assert.ok(Math.abs(total.totals.TOTAL.profitOnCapital - 0.19229) < 0.00001); assert.ok(Math.abs(total.totals.TOTAL.rentMargin - 1.22881) < 0.00001);
  // G1: 8 khoản đầu tư ban đầu mua 11/2025 → T8 là tháng KH thứ 10, còn 84% nguyên giá 38.862.000 (dù chỉ ghi sổ web từ 10/2026)
  const g1 = kd.rows.find(r => r.code === 'G1'); assert.ok(Math.abs(g1.nbv - 38862000 * 0.84) < 1); assert.ok(Math.abs(g1.profitOnAssets - g1.lnrBiz / g1.nbv) < 1e-12);
  // 17 tòa chỉ có thiết bị mua lẻ T8 (không có số dư nền) → chờ dữ liệu, không ra tỷ lệ hàng nghìn %
  const partial = kd.rows.filter(r => r.code !== 'G1' && r.nbv > 0); assert.equal(partial.length, 17); assert.ok(partial.every(r => r.profitOnAssets == null && /số dư/.test(r.assetsPending)));
  assert.equal(kd.totals.TOTAL.covered, 1);
  // Báo cáo cơ sở Tổng: LN/vốn đổi theo Báo cáo tổng, LN/tài sản vẫn dùng LNR kinh doanh
  const g1t = total.rows.find(r => r.code === 'G1'); assert.equal(g1t.lnrBiz, g1.lnrBiz); assert.equal(g1t.profitOnAssets, g1.profitOnAssets); assert.notEqual(g1t.lnr, g1t.lnrBiz);
  // Khấu hao ghi sổ không đổi: G1 chưa có khấu hao web trước 10/2026
  assert.equal(t.q.depOfPeriod('2026-08').byBuilding.b_G1 || 0, 0); assert.ok(Math.abs(t.q.depOfPeriod('2026-10').byBuilding.b_G1 - 38862000 * 0.016) < 1);
  const v = t.qe.build('2026-08', { source: 'web', basis: 'total' }).rows.find(r => r.code === 'G1'); assert.ok(Math.abs(v.profitOnCapital - 0.23977) < 0.00001);
});

test('P3-6 efficiency filters and shareholder scope preserve ratio denominators; group totals reconcile', () => {
  const t = boot(), q = t.qe.build('2026-08', { group: 'T' }); assert.ok(q.rows.every(r => r.group === 'T'));
  assert.equal(q.totals.TOTAL.lnr, q.totals.T.lnr); assert.equal(q.totals.G.total, 0);
  const head = t.q.teamLeaders('2026-08-31').find(e => e.title === 'TPVH'), team = t.qe.build('2026-08', { manager: head.id });
  assert.ok(team.rows.length > 0); assert.ok(team.rows.every(r => r.managerId === head.id));
  t.auth.login('codong'); const r = t.qe.build('2026-08', { source: 'excel' }); assert.equal(r.source, 'web'); assert.equal(r.rows.length, 1); assert.equal(r.rows[0].code, 'G1');
});

test('NT-0 after P3-6 and NT-7…NT-11 acceptance', () => { const t = boot({ pages: true }); assert.deepEqual(Array.from(t.pages.acceptance().filter(r => !r.ok), r => r.name), []); assert.deepEqual(Array.from(t.pages.acceptance3().filter(r => !r.ok), r => r.name), []); });
