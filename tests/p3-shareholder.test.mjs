import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

test('P3-7 shareholder queries enforce own buildings and hide contact/bank data, source comparison and other cash transactions', () => {
  const t = boot({ user: 'codong' }), q = t.q;
  assert.deepEqual(Array.from(q.shareBuildings(), b => b.code), ['G1']);
  assert.equal(q.shareRun('b_T2', '2026-08'), null); assert.equal(q.shareBase('b_T2', '2026-08'), null);
  assert.equal(q.shareRun('b_G1', '2026-08', 'excel').source, 'web'); assert.equal(q.shareVariance('b_G1', '2026-08'), null);
  assert.equal(q.shareholder('sh_CD-02').phone, undefined); assert.equal(q.shareholder('sh_CD-02').bank, undefined);
  assert.ok(q.capitalTxns().every(r => r.shareholderId === 'sh_CD-01' && r.buildingId === 'b_G1'));
  assert.equal(q.capitalInitial('b_T2'), null); assert.equal(q.capitalInitial('b_G1').holders.length, 1);
  assert.ok(!attempt(() => t.actions.recordWithdrawal({ amount: 1 })).ok);
  assert.ok(!attempt(() => t.actions.enterInventory('2026-09', 'b_G1', [])).ok);
  // GĐ-P3-01: cổ đông xem bản dự kiến UI-40, không lấy gợi ý / tạo phiên bản, không so sánh số thực tế toàn hệ thống
  assert.ok(q.forecasts('2026-09').length > 0); assert.equal(q.forecastVsActual('fc_2026-08_v1').available, false);
  assert.ok(!attempt(() => q.forecastAuto('2026-09', '2026-09-22')).ok); assert.ok(!attempt(() => t.actions.createForecast({ period: '2026-09', draftDate: '2026-09-22' })).ok);
});

test('P3-7 shareholder can download only own capital evidence; linked cash or inventory evidence cannot be deleted', () => {
  const t = boot(), x = t.actions, s = t.store;
  const own = x.uploadDocument({ name: 'gop-CD01.pdf', type: 'capital', buildingId: 'b_G1', objectType: 'shareholder', objectId: 'sh_CD-01' });
  const other = x.uploadDocument({ name: 'gop-CD02.pdf', type: 'capital', buildingId: 'b_G1', objectType: 'shareholder', objectId: 'sh_CD-02' });
  const image = x.uploadDocument({ name: 'kiem-ke.png', type: 'asset', buildingId: 'b_G1', objectType: 'building', objectId: 'b_G1' });
  const session = t.q.inventorySession('2026-09', 'b_G1');
  x.enterInventory(session.period, session.buildingId, session.lines.map((l, i) => ({ ...l, actualQty: l.bookQty, docIds: i === 0 ? [image.id] : [] })));
  assert.ok(!attempt(() => x.deleteDocument(image.id, 'Thử xóa ảnh đã kiểm kê')).ok);
  t.auth.login('codong');
  assert.equal(t.q.canDownloadDoc(own), true); assert.equal(t.q.canDownloadDoc(other), false); assert.equal(t.q.canDownloadDoc(image), false);
  assert.ok(t.q.documentsScoped().every(d => d.type === 'capital' && d.objectId === 'sh_CD-01'));
  assert.equal(x.downloadDocument(own.id).id, own.id); assert.ok(!attempt(() => x.downloadDocument(other.id)).ok);
  assert.equal(s.get('documents', image.id).status, 'current');
});

test('NT-0 after P3-7', () => { const t = boot({ pages: true }); assert.deepEqual(Array.from(t.pages.acceptance().filter(r => !r.ok), r => r.name), []); });
