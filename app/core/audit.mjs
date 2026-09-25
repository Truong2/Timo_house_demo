// Audit tối thiểu theo Common Rule 5: actor, thời điểm, trước/sau, lý do. Ghi vào draft trong transaction.
// env = { today, now, actor: { id, name, role } } do UI truyền vào mọi hàm domain.

/** Sinh mã tuần tự: nextCode(draft, 'LL', 'LL-', 4) → 'LL-0008'. Cách sinh LL/HL là giả định (SRS đỏ). */
export function nextCode(draft, key, prefix, width = 4) {
  draft.meta.seq[key] = (draft.meta.seq[key] || 0) + 1;
  return `${prefix}${String(draft.meta.seq[key]).padStart(width, '0')}`;
}

export function logAudit(draft, env, { action, entity, id, before = null, after = null, reason = '', source = '' }) {
  const n = nextCode(draft, 'AUD', 'AUD-', 5);
  draft.audit.unshift({
    id: n, at: env.now, actorId: env.actor?.id, actor: env.actor?.name, role: env.actor?.role,
    action, entity, entityId: id, before, after, reason, source,
  });
}

/** Lỗi nghiệp vụ có mã (E## khi SRS chưa có mã). UI hiển thị message + chip Cần xác nhận cho code. */
export class DomainError extends Error {
  constructor(message, code = 'E##') { super(message); this.code = code; }
}
