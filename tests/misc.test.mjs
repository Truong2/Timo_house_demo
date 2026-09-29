/* Tham số hiệu lực, import, Zalo, RBAC. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './_load.mjs';

const TH = load();
const C = TH.calc;
const plain = (o) => JSON.parse(JSON.stringify(o));

test('tham số có ngày hiệu lực: lấy phiên mới nhất hiệu lực tại ngày', () => {
  const rows = [{ key: 'x', value: 5, effectiveFrom: '2026-01-01', effectiveTo: '2026-09-30' }, { key: 'x', value: 7, effectiveFrom: '2026-10-01', effectiveTo: null }];
  assert.equal(C.params.at(rows, 'x', '2026-09-15'), 5);
  assert.equal(C.params.at(rows, 'x', '2026-10-01'), 7);
  assert.equal(C.params.overlaps(rows, 'x', '2026-09-20', null), true);
});

test('import: chặn #REF!, thiếu bắt buộc, tiền/ngày sai; đánh dấu trùng mã nguồn', () => {
  const rows = [{ room: '101T17', period: '2026-10', elPrev: '6041', elCurr: '6230' }, { room: '101T17', period: '2026-10', elPrev: '6041', elCurr: '6230' }, { room: '', period: '2026-10', elPrev: '1', elCurr: '2' }, { room: 'A', period: '2026-10', elPrev: '#REF!', elCurr: '2' }];
  const r = C.importv.validate('readings', rows, new Set(), (x) => x.room + ':' + x.period);
  assert.deepEqual(plain(r.map(x => x.status)), ['ok', 'duplicate', 'error', 'error']);
  const e = C.importv.validate('expenses', [{ code: 'A', date: '24/09/2026', period: '2026-09', category: 'other', scope: 'T17', amount: '1.450.000' }]);
  assert.equal(e[0].data.date, '2026-09-24'); assert.equal(e[0].data.amount, 1450000);
});

test('Zalo: kiểm tra lại số nợ trước khi gửi', () => {
  assert.equal(C.zalo.recheck({ event: 'overdue' }, 0).action, 'skip');
  assert.deepEqual(plain(C.zalo.recheck({ event: 'overdue' }, 250000)), { action: 'send', amount: 250000 });
  assert.equal(C.zalo.retryable('NOT_LINKED'), false);
  const items = [{ issued: true, remaining: 100, dueTo: '2026-08-31' }, { issued: true, remaining: 0, dueTo: '2026-08-31' }];
  assert.equal(C.zalo.dueMessages({ event: 'overdue' }, items, '2026-09-06').length, 1);
  assert.equal(C.zalo.dueMessages({ event: 'before_due', daysBefore: 2 }, items, '2026-08-29').length, 1);
});

test('RBAC: chỉ admin/kế toán ghi thu (OQ-09); duyệt hoàn cọc tách vai trò; leader chỉ xem trạng thái nợ', () => {
  const R = C.rbac;
  assert.equal(R.can('ketoan', 'payments.record'), true);
  assert.equal(R.can('vanhanh', 'payments.record'), false);
  assert.equal(R.can('leader', 'payments.record'), false);
  assert.equal(R.can('leader', 'debts.viewStatus'), true);
  assert.equal(R.can('leader', 'debts.viewAmounts'), false);
  assert.equal(R.can('admin', 'refunds.approve.admin'), true);
  assert.equal(R.can('admin', 'refunds.approve.ketoan'), false);
  assert.equal(R.can('truongphong', 'reports.view'), true);
  assert.equal(R.can('vanhanh', 'customers.pii'), false);
  assert.equal(R.can('vanhanh', 'hr.salary'), false);
});
