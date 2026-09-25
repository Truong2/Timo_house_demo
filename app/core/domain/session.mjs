import { DomainError, logAudit, nextCode } from '../audit.mjs';
import { USERS } from '../auth.mjs';

const DEMO_PASSWORD = 'demo123';
const DEMO_OTP = '000000';
const MFA_ROLES = new Set(['accountant']);

export function signIn(draft, env, { username, password, otp, role, remember = false }) {
  const selected = USERS[role];
  const name = String(username || '').trim().toLowerCase();
  const validName = name === role || name === `${role}@timohouse.demo`;
  if (!validName || password !== DEMO_PASSWORD || !selected) {
    throw new DomainError('Tên đăng nhập hoặc mật khẩu không đúng');
  }
  if (MFA_ROLES.has(role) && otp !== DEMO_OTP) {
    throw new DomainError('Cần nhập mã OTP demo hợp lệ', 'E##-OTP');
  }
  const token = nextCode(draft, 'SES', 'DEMO-', 5);
  draft.meta.role = role;
  draft.meta.session = { token, userId: selected.id, role, remember: !!remember };
  draft.meta.lastLogin = { ...(draft.meta.lastLogin || {}), [selected.id]: env.now };
  logAudit(draft, env, { action: 'Đăng nhập demo', entity: 'SESSION', id: selected.id, after: { role, remember }, source: 'FR00 · Q-06' });
  return draft.meta.session;
}

export function signOut(draft, env) {
  const old = draft.meta.session;
  if (!old) return;
  logAudit(draft, env, { action: 'Đăng xuất demo', entity: 'SESSION', id: old.userId, before: { role: old.role }, source: 'FR00 · Q-06' });
  draft.meta.session = null;
}
