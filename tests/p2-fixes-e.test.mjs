/* Phase 2 – Đợt E: lỗi kiểm tra 01/10 + backlog "Chưa làm – chờ khách chọn". Kịch bản docs/uat/Phase2_Kich_ban_kiem_thu.md mục 8. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));

/* ---------------- E0 – lỗi kiểm tra 01/10 ---------------- */
test('E0.1 – seed: khách cũ của phòng có lượt chờ nhận đã báo trả, bàn giao trước ngày khách mới tính tiền', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store;
  const pending = S.where('stays', s => s.status === 'pending');
  assert.ok(pending.length > 0);
  const bad = pending.map(p => [p, S.one('stays', a => a.status === 'active' && a.roomId === p.roomId)]).filter(([p, a]) => a && p.rentStart <= (a.plannedLeaveDate || a.endDate));
  assert.deepEqual(plain(bad.map(([p, a]) => p.code + ' / ' + a.code)), [], 'không lượt chờ nhận nào chồng lên thời gian ở của khách cũ');
  const a = S.one('stays', x => x.status === 'active' && x.roomId === 'r_404S4');
  assert.equal(a.plannedLeaveDate, '2026-09-30'); assert.equal(a.noticeDate, '2026-09-01'); assert.equal(a.stopBillingDate, null, 'chỉ báo trả, chưa kết thúc');
});

test('E0.1 – nhận phòng deal seed: kết thúc lượt cũ ngày 30/09 rồi nhận 01/10; ⛔ nhận khi còn khách cũ', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const d = S.one('deals', x => x.code === 'GD-2609-036'); const old = Q.currentStay(d.roomId);
  const r = attempt(() => X.receiveDeal(d.id, '2026-10-01'));
  assert.ok(!r.ok && /khách cũ/.test(r.msg));
  X.endStay(old.id, { endType: 'expired', date: old.plannedLeaveDate });
  X.receiveDeal(d.id, '2026-10-01');
  assert.equal(S.get('deals', d.id).status, 'received');
  assert.equal(Q.stay(d.stayId).status, 'active');
  assert.equal(S.where('stays', s => s.roomId === d.roomId && s.status === 'active').length, 1);
});

test('E0.1 – số liệu không đổi: phòng có lượt chờ nhận vẫn ở nhóm "đang chờ", không vào "trống cuối tháng"', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, Q = TH.q;
  const v = Q.vacancy('2026-09-29'); const waiting = new Set(v.waiting.map(r => r.id));
  S.where('stays', s => s.status === 'pending').forEach(p => assert.ok(waiting.has(p.roomId) || !(Q.room(p.roomId) || {}).price, p.code));
  assert.ok(!v.endOfMonth.some(r => waiting.has(r.id)));
});

test('NT-0 – Phase 1 không đổi sau Đợt E (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name + ' → ' + a.detail)), []);
});
