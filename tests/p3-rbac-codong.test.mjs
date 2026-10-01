/* Phase 3 – P3-0: mốc 3, route Phase 3, vai trò Cổ đông (chỉ xem tòa mình góp vốn – đặc tả dòng 69-71, CH-23). Kịch bản docs/uat/Phase3_Kich_ban_kiem_thu.md F37. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));

test('P3-0 – mốc 3 là mốc mặc định; 6 màn Phase 3 có route mốc 3', () => {
  const TH = boot({ user: 'admin' });
  assert.equal(TH.ms.current(), '3');
  assert.deepEqual(plain(TH.ms.ORDER), ['1A', '1B', '2', '3']);
  const R = TH.routes.ROUTES.filter(r => TH.routes.PHASE3_UI.includes(r.ui));
  assert.deepEqual(plain(R.map(r => r.path).sort()), ['/assets', '/assets/inventory', '/assets/maintenance', '/reports/efficiency', '/reports/forecast', '/shares/capital']);
  assert.ok(R.every(r => r.ms === '3'));
});

test('P3-0 – cổ đông: đăng nhập ở mốc 3, phạm vi = tòa có tỷ lệ góp (G1); ⛔ đăng nhập ở mốc 2', () => {
  const TH = boot({ user: null });
  TH.ms.set('2');
  const r = attempt(() => TH.auth.login('codong'));
  assert.ok(!r.ok && /Phase 3/.test(r.msg));
  TH.ms.set('3');
  TH.auth.login('codong');
  assert.equal(TH.store.session.shareholderId, 'sh_CD-01');
  assert.equal(TH.auth.shareholderId(), 'sh_CD-01');
  assert.deepEqual(plain([...TH.auth.buildingScope()]), ['b_G1']);
  assert.ok(TH.auth.inScope('b_G1') && !TH.auth.inScope('b_T2'));
  assert.deepEqual(plain(TH.auth.roomScope()), {});
});

test('P3-0 – cổ đông chỉ xem: ⛔ khách thuê, tòa nhà, drill chứng từ, báo cáo vận hành, dự kiến LN; ⛔ thao tác ghi', () => {
  const TH = boot({ user: 'codong' }); const A = TH.auth;
  ['dashboard.view', 'reports.view', 'shares.view', 'capital.view', 'efficiency.view'].forEach(p => assert.ok(A.can(p), p));
  ['tenants.view', 'buildings.view', 'reports.drill', 'reports.ops', 'forecast.view', 'shares.manage', 'payments.view', 'hr.view', 'assets.view'].forEach(p => assert.ok(!A.can(p), p));
  const r = attempt(() => TH.actions.setShareRatios('b_G1', [], '2026-10-01', 'thử'));
  assert.ok(!r.ok);
});

test('P3-0 – tài khoản cổ đông mới phải gắn hồ sơ cổ đông', () => {
  const TH = boot({ user: 'admin' }); const X = TH.actions;
  const r = attempt(() => X.addUser({ username: 'cd02', role: 'codong', display: 'Cổ đông 2' }));
  assert.ok(!r.ok && r.fields.shareholderId);
  const u = X.addUser({ username: 'cd02', role: 'codong', shareholderId: 'sh_CD-02' });
  assert.equal(u.shareholderId, 'sh_CD-02'); assert.equal(u.employeeId, null); assert.equal(u.phase, '3');
});

test('NT-0 – Phase 1 không đổi sau P3-0 (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name)), []);
});
