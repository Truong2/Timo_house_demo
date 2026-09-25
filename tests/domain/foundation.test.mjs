import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, env, tx } from './helpers.mjs';
import { signIn, signOut } from '../../app/core/domain/session.mjs';
import { registerWorkflow, transition } from '../../app/core/domain/workflow.mjs';
import { param, setParam } from '../../app/core/params.mjs';
import { assertPeriodOpen } from '../../app/core/period.mjs';

test('FR00: login demo, MFA và logout giữ audit, không lưu mật khẩu', () => {
  const seed = fresh();
  assert.throws(() => tx(seed, (d) => signIn(d, env(), { username: 'admin', password: 'wrong', role: 'admin' })), /không đúng/);
  assert.throws(() => tx(seed, (d) => signIn(d, env(), { username: 'accountant', password: 'demo123', role: 'accountant' })), /OTP/);
  const { state } = tx(seed, (d) => signIn(d, env(), { username: 'accountant', password: 'demo123', otp: '000000', role: 'accountant', remember: true }));
  assert.equal(state.meta.session.role, 'accountant');
  assert.equal(state.meta.session.remember, true);
  assert.equal(JSON.stringify(state).includes('demo123'), false);
  assert.equal(state.audit[0].action, 'Đăng nhập demo');
  const done = tx(state, (d) => signOut(d, env('accountant'))).state;
  assert.equal(done.meta.session, null);
  assert.equal(done.audit[0].action, 'Đăng xuất demo');
});

test('Đợt 0: tham số theo ngày hiệu lực và kỳ khóa', () => {
  const seed = fresh();
  assert.equal(param(seed, 'P-03', '2026-09-01'), 30);
  const { state } = tx(seed, (d) => setParam(d, env(), 'P-03', 31, '2026-10-01'));
  assert.equal(param(state, 'P-03', '2026-09-30'), 30);
  assert.equal(param(state, 'P-03', '2026-10-01'), 31);
  assert.equal(state.audit[0].entity, 'PARAM');
  state.periods.push({ id: '2026-09', status: 'Locked' });
  assert.throws(() => assertPeriodOpen(state, '2026-09'), /đã khóa/);
});

test('Đợt 0: workflow chặn bước sai, bắt lý do và ghi audit', () => {
  registerWorkflow('TEST_APPROVAL', { collection: 'importJobs', transitions: {
    'Nháp': [{ to: 'Chờ duyệt', label: 'Gửi duyệt' }],
    'Chờ duyệt': [{ to: 'Trả sửa', label: 'Trả sửa', reasonRequired: true }],
  } });
  const seed = fresh();
  seed.importJobs.push({ id: 'IMP-1', status: 'Nháp' });
  assert.throws(() => tx(seed, (d) => transition(d, env(), { entity: 'TEST_APPROVAL', id: 'IMP-1', to: 'Trả sửa' })), /Không được/);
  const sent = tx(seed, (d) => transition(d, env(), { entity: 'TEST_APPROVAL', id: 'IMP-1', to: 'Chờ duyệt' })).state;
  assert.throws(() => tx(sent, (d) => transition(d, env(), { entity: 'TEST_APPROVAL', id: 'IMP-1', to: 'Trả sửa' })), /lý do/);
  const returned = tx(sent, (d) => transition(d, env(), { entity: 'TEST_APPROVAL', id: 'IMP-1', to: 'Trả sửa', reason: 'Thiếu chứng từ' })).state;
  assert.equal(returned.importJobs[0].status, 'Trả sửa');
  assert.equal(returned.audit[0].reason, 'Thiếu chứng từ');
});
