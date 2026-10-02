import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

test('P3-3 virtual sessions do not write; future period rejected; quantity and condition independent', () => {
  const t = boot(), s = t.store, v = s.version, dirty = s.dirtyCount();
  const session = t.q.inventorySession('2026-09', 'b_T2');
  assert.equal(session.virtual, true); assert.equal(s.version, v); assert.equal(s.dirtyCount(), dirty);
  assert.ok(!attempt(() => t.q.inventorySession('2026-10', 'b_T2')).ok);
  const lines = session.lines.map((l, i) => ({ ...l, actualQty: l.bookQty - (i === 0 ? 1 : 0), condition: i === 1 ? 'broken' : 'good' }));
  const entered = t.actions.enterInventory('2026-09', 'b_T2', lines);
  assert.equal(entered.lines[0].actualQty, entered.lines[0].bookQty - 1);
  assert.equal(entered.lines[1].actualQty, entered.lines[1].bookQty); assert.equal(entered.lines[1].condition, 'broken');
});

test('P3-3 dual approval applies proposals only after both roles; no expense; same person cannot approve twice', () => {
  const t = boot(), s = t.store, x = t.actions, session = t.q.inventorySession('2026-09', 'b_G1'), a = t.q.asset(session.lines[1].assetId), before = a.condition, n = s.all('expenses').length;
  assert.ok(!attempt(() => x.proposeAssetChange(session.id, { kind: 'condition', assetId: a.id, to: 'broken' })).ok);
  x.proposeAssetChange(session.id, { kind: 'condition', assetId: a.id, to: 'broken', reason: 'Biên bản kiểm kê xác nhận hỏng' });
  assert.equal(x.approveInventory(session.id), false); assert.equal(t.q.asset(a.id).condition, before);
  assert.ok(!attempt(() => x.approveInventory(session.id)).ok);
  assert.ok(!attempt(() => x.approveInventory(session.id, 'ketoan')).ok);
  const adminUser = s.session.userId; t.auth.login('ketoan'); const acctUser = s.session.userId;
  s.setSession({ ...s.session, userId: adminUser }); assert.ok(!attempt(() => x.approveInventory(session.id)).ok);
  s.setSession({ ...s.session, userId: acctUser }); assert.equal(x.approveInventory(session.id), true);
  assert.equal(t.q.asset(a.id).condition, 'broken'); assert.equal(s.all('expenses').length, n); assert.equal(t.q.asset(a.id).history.at(-1).kind, 'inventory');
  assert.ok(!attempt(() => x.enterInventory('2026-09', 'b_G1', session.lines)).ok);
});

test('P3-3 stale proposals block approvals and financial assets cannot be removed through inventory', () => {
  const t = boot(), x = t.actions, s = t.q.inventorySession('2026-09', 'b_G1'), id = s.lines[0].assetId;
  x.proposeAssetChange(s.id, { kind: 'qty', assetId: id, to: 2, reason: 'Đếm lại' });
  t.store.update('assets', id, { qty: 3 }); assert.ok(!attempt(() => x.approveInventory(s.id)).ok);
  const a = t.q.assets({ building: 'b_S4', ownership: 'company' }).find(a => a.cost > 0), iv = t.q.inventorySession('2026-09', 'b_S4');
  x.enterInventory(iv.period, iv.buildingId, iv.lines.map(l => ({ ...l, actualQty: l.bookQty })));
  assert.ok(!attempt(() => x.proposeAssetChange(iv.id, { kind: 'remove', assetId: a.id, to: 'void', reason: 'Mất' })).ok);
  t.ms.set('2'); assert.ok(!attempt(() => x.approveInventory(s.id)).ok);
});

test('NT-0 after P3-3', () => { const t = boot({ pages: true }); assert.deepEqual(Array.from(t.pages.acceptance().filter(r => !r.ok), r => r.name), []); });

test('P3-3 đề xuất loại bỏ (tài sản không giá trị) sau đủ hai duyệt → trạng thái "Đã loại khỏi danh mục", không phải "hủy chứng từ"', () => {
  const t = boot(), s = t.store, x = t.actions, session = t.q.inventorySession('2026-09', 'b_G1');
  const a = session.lines.map(l => t.q.asset(l.assetId)).find(a => !(a.cost > 0)); assert.ok(a);
  x.proposeAssetChange(session.id, { kind: 'remove', assetId: a.id, reason: 'Không còn tại tòa, biên bản kiểm kê' });
  assert.equal(x.approveInventory(session.id), false); t.auth.login('ketoan'); assert.equal(x.approveInventory(session.id), true);
  assert.equal(t.q.asset(a.id).status, 'removed'); assert.match(t.calc.assets.STATUS.removed, /kiểm kê/);
  assert.ok(!t.q.depItems('2026-09').some(d => d.id === a.id));
});
