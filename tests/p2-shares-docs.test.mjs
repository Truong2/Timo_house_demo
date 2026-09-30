/* Phase 2 – Đợt 4: cổ đông & chia lãi G1 (UI-31, UI-32), kho tài liệu (UI-26), OCR hợp đồng (UI-08). Kịch bản F28–F29, NT-2, E05, E06, E24. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';
import { load, fixture } from './_load.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));

test('F28 – domain chia: làm tròn từng dòng, chênh dồn CHUNG (OQ-08); Σ = số chia', () => {
  const SH = load().calc.share;
  const r = SH.split([{ id: 'c', pct: 10, common: true }, { id: 'a', pct: 45 }, { id: 'b', pct: 45 }], { rent: 1000, lng: 101, lnr: 33.3 });
  assert.equal(r.totals.H, 1000); assert.equal(r.totals.I, 101); assert.equal(r.totals.J, 33);
  assert.equal(r.rows.find(x => x.id === 'c').I, 10 + r.rounding.I);
  assert.ok(!SH.valid([{ pct: 60 }, { pct: 39 }]).ok);
});

test('F28.3 / NT-2 – bảng kê G1 T8 như Excel: Σ Vốn 48.000.000 · LNG 22.990.932 · LNR 14.664.969 · Tổng nhận 62.664.969; từng dòng lệch ≤ 1đ', () => {
  const TH = boot({ user: 'ketoan' }); const Q = TH.q;
  const ratios = Q.shareRatios('b_G1', '2026-08-31');
  assert.equal(ratios.length, 9); assert.equal(TH.calc.share.sumPct(ratios), 100);
  assert.deepEqual(plain(ratios.map(r => r.pct)), [10, 20, 15, 5, 15, 10, 5, 10, 10]);
  const run = Q.shareRun('b_G1', '2026-08', 'excel');
  assert.deepEqual([run.totals.H, run.totals.I, run.totals.J, run.totals.M], [48000000, 22990932, 14664969, 62664969]);
  assert.equal(run.rounding.to, 'sh_CHUNG');
  const fx = fixture('shares-g1-2026-08-p2.json');
  // dòng thường lệch ≤ 1đ (làm tròn); CHUNG nhận thêm phần chênh làm tròn của cả cột (OQ-08)
  run.rows.forEach((r, i) => { const e = fx.holders[i].excel; const tol = r.common ? 1 + 9 : 1; assert.ok(Math.abs(r.H - e.H) <= tol && Math.abs(r.I - e.I) <= tol && Math.abs(r.J - e.J) <= tol && Math.abs(r.M - e.M) <= tol, fx.holders[i].code); });
  assert.ok(Math.abs(run.rounding.I) <= 5 && Math.abs(run.rounding.J) <= 5);
  assert.ok(Math.abs(run.K - fx.excel.C78 * 100) < 1e-6 && Math.abs(run.L - fx.excel.C80) < 1e-6, 'K = LNR/GV×100, L = CP/LNG');
});

test('F28.3 – bảng kê G1 T8 theo Báo cáo tổng web: vốn, LNG khớp; LNR lệch đúng bằng ô C43 Excel dùng mẫu số 1.343 (OQ-04 / K-9)', () => {
  const TH = boot({ user: 'ketoan' }); const Q = TH.q;
  const w = Q.shareRun('b_G1', '2026-08', 'web');
  assert.equal(w.totals.H, 48000000); assert.equal(w.totals.I, 22990932);
  const v = Q.shareVariance('b_G1', '2026-08');
  assert.ok(Math.abs(v.lnr - v.oq04) < 1, 'chênh LNR ' + v.lnr + ' ≈ ' + v.oq04);
  assert.equal(w.totals.J, Math.round(w.base.lnr));
});

test('F28.2 / F28.4 – khóa bảng kê: ảnh chụp số; ⛔ tỷ lệ 99% (E24); ⛔ khóa hai lần; ⛔ vận hành không xem', async (t) => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  await t.test('khóa kỳ 08 (đủ 100%)', () => {
    const rec = X.lockShareRun('b_G1', '2026-08', 'web');
    assert.equal(rec.status, 'locked'); assert.equal(rec.totals.H, 48000000);
    assert.ok(!attempt(() => X.lockShareRun('b_G1', '2026-08', 'web')).ok);
  });
  await t.test('sửa tỷ lệ còn 99% từ 01/09: lưu được (cảnh báo), bảng kê 08 đã khóa không đổi; ⛔ khóa kỳ 09', () => {
    const rows = Q.shareRatios('b_G1', '2026-08-31').map(r => ({ shareholderId: r.shareholderId, pct: r.shareholderId === 'sh_CHUNG' ? 9 : r.pct }));
    assert.ok(!attempt(() => X.setShareRatios('b_G1', rows, '2026-09-01', '')).ok, 'phải có lý do');
    const v = X.setShareRatios('b_G1', rows, '2026-09-01', 'Điều chỉnh demo');
    assert.equal(v.ok, false); assert.equal(v.sum, 99);
    assert.equal(Q.shareRun('b_G1', '2026-08', 'web').totals.H, 48000000, 'kỳ đã khóa giữ ảnh chụp');
    assert.equal(TH.calc.share.sumPct(Q.shareRatios('b_G1', '2026-08-31')), 100, 'tỷ lệ cũ vẫn hiệu lực đến 31/08');
    const r = attempt(() => X.lockShareRun('b_G1', '2026-09', 'web'));
    assert.ok(!r.ok && /99%/.test(r.msg) && /E24/.test(r.msg));
  });
  await t.test('⛔ vận hành / sale không có quyền cổ đông', () => { TH.auth.login('vanhanh'); assert.ok(!TH.auth.can('shares.view')); assert.ok(!attempt(() => X.lockShareRun('b_G1', '2026-09')).ok); });
});

test('F29.1–F29.3 – kho tài liệu: HĐ khách từ lượt thuê, phạm vi tòa, phiên bản mới, ⛔ xóa tài liệu gắn giao dịch', async (t) => {
  const TH = boot({ user: 'vanhanh' }); const S = TH.store, X = TH.actions, Q = TH.q;
  await t.test('vận hành chỉ thấy tài liệu của tòa được giao; gồm HĐ khách', () => {
    const all = Q.documentsAll(); const mine = Q.documentsScoped();
    assert.ok(all.some(d => d.source === 'contractFile') && all.some(d => d.type === 'owner_contract'));
    assert.ok(mine.length > 0 && mine.length < all.length);
    assert.ok(mine.every(d => TH.auth.inScope(d.buildingId)));
  });
  await t.test('tải lên + phiên bản 2; bản cũ thành "bản cũ"', () => {
    const b = [...TH.auth.buildingScope()][0];
    const d1 = X.uploadDocument({ type: 'handover', buildingId: b, name: 'Bien-ban-ban-giao.pdf', size: 1000 });
    const d2 = X.uploadDocument({ replaceId: d1.id, name: 'Bien-ban-ban-giao-v2.pdf' });
    assert.equal(d2.version, 2); assert.equal(S.get('documents', d1.id).status, 'superseded'); assert.equal(Q.docVersions(d2.id).length, 2);
    assert.ok(!attempt(() => X.uploadDocument({ type: 'handover', buildingId: S.all('buildings').find(x => !TH.auth.inScope(x.id)).id, name: 'x.pdf' })).ok, 'ngoài phạm vi');
    X.deleteDocument(d2.id, 'Tải nhầm tòa'); assert.equal(S.get('documents', d2.id).status, 'deleted');
  });
  await t.test('⛔ xóa HĐ chủ nhà / HĐ khách (gắn giao dịch)', () => {
    const oc = Q.documentsScoped().find(d => d.type === 'owner_contract');
    const r = attempt(() => X.deleteDocument(oc.id, 'x')); assert.ok(!r.ok && /không xóa/.test(r.msg));
    const cf = Q.documentsAll().find(d => d.source === 'contractFile');
    assert.ok(!attempt(() => X.deleteDocument(cf.id, 'x')).ok);
  });
});

test('F29.4–F29.7 – OCR: rà soát, ⛔ E05 thiếu / độ tin cậy thấp, E06 áp dụng biểu phí mới, hóa đơn không đổi, chạy lại = phiên mới', async (t) => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  // file có phiên đầu đọc nhiễu (thiếu cọc, sai đơn giá điện)
  let o, f;
  for (const cf of S.all('contractFiles')) { const x = X.runOcr(cf.id); if (x.fields.find(z => z.key === 'deposit').value === '') { o = x; f = cf; break; } }
  assert.ok(o, 'có phiên OCR nhiễu để minh họa E05');
  const stay = Q.stay(o.stayId); const invBefore = S.where('invoices', i => i.stayId === stay.id).map(i => i.totalDue);
  await t.test('trạng thái chờ rà soát; trường có trang/vùng, độ tin cậy', () => {
    assert.equal(o.status, 'review'); assert.ok(o.fields.every(z => z.page && z.region != null && z.confidence >= 0));
    assert.ok(!Q.ocrReady(o).ok);
  });
  await t.test('⛔ E05: áp dụng khi thiếu cọc / chưa rà nhóm; ⛔ xác nhận nhóm còn thiếu hoặc độ tin cậy thấp chưa kiểm', () => {
    const r = attempt(() => X.ocrApply(o.id, { from: '2026-11-01' })); assert.ok(!r.ok && /E05/.test(r.msg) && /Tiền cọc/.test(r.msg));
    assert.ok(!attempt(() => X.ocrConfirmGroup(o.id, 'money')).ok);
    assert.ok(!attempt(() => X.ocrConfirmGroup(o.id, 'fees')).ok, 'đơn giá điện độ tin cậy 61%');
  });
  await t.test('E06: sửa cọc + đơn giá điện, rà đủ 6 nhóm → áp dụng: phiên biểu phí mới, hóa đơn đã phát hành không đổi', () => {
    X.ocrSetField(o.id, 'deposit', String(stay.depositAmount));
    const el = Q.ocrSession(o.id).fields.find(z => z.key === 'fee_electric');
    X.ocrSetField(o.id, 'fee_electric', String(Number(el.raw) - 500));
    Q.OCR_GROUPS.forEach(([g]) => X.ocrConfirmGroup(o.id, g, true));
    const before = S.where('rateVersions', v => v.stayId === stay.id).length;
    const res = X.ocrApply(o.id, { from: '2026-11-01', reason: 'Đã đối chiếu bản gốc' });
    const after = S.where('rateVersions', v => v.stayId === stay.id);
    assert.equal(after.length, before + 1); assert.equal(res.version.from, '2026-11-01'); assert.equal(res.version.rent, stay.rent);
    const s2 = Q.ocrSession(o.id); assert.equal(s2.status, 'applied'); assert.equal(s2.edited.length, 2);
    assert.deepEqual(plain(S.where('invoices', i => i.stayId === stay.id).map(i => i.totalDue)), plain(invBefore), 'OCR không ghi vào hóa đơn');
    assert.ok(!attempt(() => X.ocrSetField(o.id, 'rent', '1')).ok, 'phiên đã áp dụng không sửa');
  });
  await t.test('chạy lại OCR → phiên 2, không ghi đè phiên 1; file mờ → lỗi / thiếu trang; ⛔ vận hành không chạy OCR', () => {
    const o2 = X.runOcr(f.id); assert.equal(o2.run, 2); assert.equal(Q.ocrSession(o.id).status, 'applied');
    const bad = X.addContractFile(stay.id, { name: 'HĐ mờ thiếu trang.jpg', size: 1000 });
    const ob = X.runOcr(bad.id); assert.equal(ob.status, 'error');
    assert.ok(!attempt(() => X.ocrSetField(ob.id, 'rent', '1')).ok);
    TH.auth.login('vanhanh'); assert.ok(TH.auth.buildingScope().has(stay.buildingId) ? !attempt(() => X.ocrApply(o2.id, { from: '2026-12-01' })).ok : !attempt(() => X.runOcr(f.id)).ok, 'vận hành: ngoài phạm vi không chạy OCR; trong phạm vi không áp vào biểu phí');
  });
});

test('NT-0 – Phase 1 không đổi sau Đợt 4 (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name)), []);
});
