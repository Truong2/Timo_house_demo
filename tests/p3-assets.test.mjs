/* Phase 3 – P3-1: tài sản & khấu hao theo số tháng từng tài sản, thanh lý (UI-34, tab Tài sản UI-03; GĐ OQ-11). Kịch bản docs/uat/Phase3_Kich_ban_kiem_thu.md F31. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));
const near = (a, b, eps = 0.5) => Math.abs(a - b) <= eps;
const closePeriod = (TH, id) => TH.store.update('periods', id, { status: 'closed', closedAt: '2026-10-05T10:00:00' }); // chỉ đổi trạng thái để kiểm chặn kỳ khóa

test('NT-11 – 17 thiết bị T8 (63 tháng ≈ 1,6%) khấu hao 566.080/tháng; tháng 63 = 0,8% = 283.040; tổng vòng đời = nguyên giá', () => {
  const TH = boot({ user: 'admin' }); const Q = TH.q, S = TH.store;
  const items = Q.depItems('2026-08');
  assert.equal(items.length, 17);
  assert.ok(items.every(a => a.depMonths === 63 && a.expenseId && S.get('expenses', a.expenseId)), 'mỗi thiết bị gắn chứng từ UI-15');
  assert.equal(TH.calc.depreciation.rateOf(items[0]), 0.016, 'n = 63 → đúng 1,6%');
  assert.equal(Q.depOfPeriod('2026-08').total, 566080);
  assert.equal(Q.depOfPeriod('2026-09').total, 566080);
  assert.ok(near(Q.depOfPeriod('2031-10').total, 283040), 'tháng 63: nửa mức');
  assert.equal(Q.depOfPeriod('2031-11').total, 0);
  let sum = 0; const D = TH.calc.dates; for (let p = '2026-08'; p <= '2031-11'; p = D.nextPeriod(p)) sum += Q.depOfPeriod(p).total;
  assert.ok(near(sum, 35380000, 1));
  assert.equal(TH.qr.build('2026-08', 'business').cols.TOTAL.cost_equip, 566080, 'Báo cáo KD T8 dòng 21 không đổi');
});

test('NT-11 – thanh lý as_08_S4 (3.440.000) kỳ 10: KD S4 ghi một lần 3.329.920 (= 96,8% nguyên giá), kỳ 11 = 0; Báo cáo tổng không đổi; ⛔ kỳ đã khóa', () => {
  const TH = boot({ user: 'ketoan' }); const Q = TH.q, X = TH.actions;
  const totalBefore = TH.qr.build('2026-10', 'total').byBuilding.b_S4;
  const r0 = attempt(() => X.disposeAsset('as_08_S4', { date: '2026-10-15' }));
  assert.ok(!r0.ok && r0.fields.reason, 'bắt buộc lý do');
  X.disposeAsset('as_08_S4', { date: '2026-10-15', reason: 'Hỏng không sửa được', proceeds: 200000 });
  const a = Q.asset('as_08_S4');
  assert.equal(a.cost, 3440000);
  assert.equal(a.status, 'disposed'); assert.equal(a.disposal.remaining, 3329920); assert.equal(a.disposal.proceeds, 200000);
  assert.equal(Q.depOfPeriod('2026-10').byBuilding.b_S4, 3329920, 'còn lại sau 2 tháng khấu hao (T8, T9 × 55.040)');
  assert.equal(Q.depOfPeriod('2026-11').byBuilding.b_S4, undefined);
  assert.equal(Q.depOfPeriod('2026-09').byBuilding.b_S4, 55040, 'kỳ trước thanh lý không đổi');
  assert.deepEqual(plain(TH.qr.build('2026-10', 'total').byBuilding.b_S4), plain(totalBefore), 'Báo cáo tổng không đổi (tiền thu thanh lý chưa vào doanh thu – GĐ-P3 O4)');
  closePeriod(TH, '2026-09');
  const r = attempt(() => X.disposeAsset('as_08_T5', { date: '2026-09-20', reason: 'thử' }));
  assert.ok(!r.ok && /đã khóa/.test(r.msg));
  const r2 = attempt(() => X.disposeAsset('as_TS_G1_001', { date: '2026-10-20', reason: 'thử' }));
  assert.ok(!r2.ok && /tài sản công ty/.test(r2.fields.reason), 'tài sản chủ nhà không thanh lý');
});

test('P3-1 – sửa lỗi hủy chứng từ mua: tài sản bị gỡ khỏi khấu hao; ⛔ hủy khi đã khấu hao trong kỳ khóa', () => {
  const TH = boot({ user: 'ketoan' }); const Q = TH.q, X = TH.actions, S = TH.store;
  const e = X.addExpense({ category: 'equipment', scope: 'building', buildingId: 'b_T2', amount: 12500000, date: '2026-10-03', period: '2026-10', note: 'Máy giặt chung 10kg', depMonths: 36 });
  const a = S.one('assets', x => x.expenseId === e.id);
  assert.ok(a && a.ownership === 'company' && a.type === 'washer' && a.depMonths === 36);
  assert.ok(near(Q.depOfPeriod('2026-10').byBuilding.b_T2, 12500000 * 2 / 71));
  X.voidExpense(e.id, 'Nhập trùng');
  assert.equal(Q.asset(a.id).status, 'void');
  assert.equal(Q.depOfPeriod('2026-10').byBuilding.b_T2, undefined, 'trước đây thiết bị vẫn khấu hao sau khi hủy chứng từ');
  closePeriod(TH, '2026-09');
  const t5 = Q.asset('as_08_T5');
  const r = attempt(() => X.voidExpense(t5.expenseId, 'thử'));
  assert.ok(!r.ok && /Thanh lý/.test(r.msg));
  assert.equal(S.get('expenses', t5.expenseId).status, 'posted');
});

test('P3-1 – import số dư thiết bị (UI-37): tài sản công ty, chỉ ghi khấu hao từ kỳ bắt đầu ghi sổ; giá trị còn lại tính từ ngày mua', () => {
  const TH = boot({ user: 'admin' }); const Q = TH.q, X = TH.actions, S = TH.store;
  const v = X.validateImport('equipment', [{ building: 'G1', name: 'Máy giặt tầng 2', purchaseDate: '2026-06-10', cost: '6500000', room: '', qty: '1', depMonths: '', openingPeriod: '2026-10' }]);
  assert.equal(v.filter(r => r.status === 'error').length, 0);
  assert.ok(!attempt(() => 0).value && X.validateImport('equipment', [{ building: 'G1', name: 'x', purchaseDate: '2026-06-10', cost: '1', ownership: 'Khách thuê' }])[0].status === 'error', 'nguồn sở hữu sai');
  X.commitImport('equipment', 'so-du-thiet-bi.csv', v);
  const a = S.one('assets', x => x.source === 'opening' && x.name === 'Máy giặt tầng 2');
  assert.ok(a && a.type === 'washer' && a.depMonths === 63 && a.openingPeriod === '2026-10');
  assert.equal(Q.depOfPeriod('2026-09').byBuilding.b_G1, undefined, 'kỳ trước ghi sổ: không ghi khấu hao');
  assert.equal(Q.depOfPeriod('2026-10').byBuilding.b_G1, 104000);
  assert.equal(TH.calc.depreciation.nbv(a, '2026-10'), 6500000 - 5 * 104000);
  assert.equal(Q.assetNbv('b_G1', '2026-09'), 0, 'UI-41: chưa ghi sổ thì chưa tính vào mẫu số LN/tài sản');
});

test('P3-1 – thêm / chuyển vị trí: giá trị chỉ khi có chứng từ, tài sản chủ nhà không giá trị, chuyển ghi lịch sử; ⛔ kỹ thuật, mốc 2', () => {
  const TH = boot({ user: 'admin' }); const Q = TH.q, X = TH.actions;
  const bad = attempt(() => X.addAsset({ name: 'Tủ lạnh', type: 'other', ownership: 'company', buildingId: 'b_T2', qty: 1, cost: 5000000, receivedDate: '2026-10-01' }));
  assert.ok(!bad.ok && /chứng từ/.test(bad.fields.cost));
  const own = attempt(() => X.addAsset({ name: 'Bình nóng lạnh', type: 'other', ownership: 'owner', buildingId: 'b_T2', qty: 1, cost: 3000000, receivedDate: '2026-10-01', docName: 'pl.pdf' }));
  assert.ok(!own.ok && /chủ nhà/.test(own.fields.cost));
  const a = X.addAsset({ name: 'Tủ lạnh P301', type: 'other', ownership: 'company', buildingId: 'b_T2', roomId: 'r_301T2', qty: 1, cost: 5000000, receivedDate: '2026-10-01', docName: 'hoa-don-tu-lanh.pdf' });
  assert.equal(a.code.startsWith('TS-T2-'), true); assert.equal(a.depMonths, 63);
  const r = attempt(() => X.moveAsset(a.id, { roomId: 'r_201T2' }));
  assert.ok(!r.ok && r.fields.reason);
  X.moveAsset(a.id, { buildingId: 'b_T2', roomId: 'r_201T2', reason: 'Đổi phòng cho khách mới', date: '2026-10-05' });
  const m = Q.asset(a.id); assert.equal(m.roomId, 'r_201T2'); assert.equal(m.history.filter(h => h.kind === 'move').length, 1);
  const ow = Q.assets({ building: 'b_G1', ownership: 'owner' })[0];
  const r2 = attempt(() => X.moveAsset(ow.id, { buildingId: 'b_T2', reason: 'thử' }));
  assert.ok(!r2.ok && /chủ nhà/.test(r2.fields.buildingId));
  TH.auth.login('kythuat'); assert.ok(!attempt(() => X.addAsset({ name: 'x', type: 'other', ownership: 'owner', buildingId: 'b_T2', qty: 1 })).ok);
  assert.ok(Q.assets().length > 0 && !TH.auth.can('assets.value'), 'kỹ thuật xem danh sách, không thấy giá trị');
  TH.auth.login('admin'); TH.ms.set('2');
  const r3 = attempt(() => X.addAsset({ name: 'x', type: 'other', ownership: 'owner', buildingId: 'b_T2', qty: 1 }));
  assert.ok(!r3.ok && /Phase 3/.test(r3.msg));
});

test('P3-1 – seed: 13 hạng mục bàn giao SRC-10 (chủ nhà, không giá trị) ở tòa demo; phạm vi vận hành chỉ thấy tòa được giao', () => {
  const TH = boot({ user: 'admin' }); const Q = TH.q;
  const g1 = Q.assets({ building: 'b_G1', ownership: 'owner' });
  assert.equal(g1.filter(a => a.source === 'handover').length, 13);
  assert.ok(g1.every(a => !a.cost));
  TH.auth.login('vanhanh'); const sc = TH.auth.buildingScope();
  assert.ok(Q.assets().every(a => sc.has(a.buildingId)));
});

test('NT-0 – Phase 1 không đổi sau P3-1 (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name)), []);
});
