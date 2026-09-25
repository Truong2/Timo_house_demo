import { DomainError, logAudit } from '../audit.mjs';

const machines = new Map();
export function registerWorkflow(entity, { collection, transitions }) {
  if (machines.has(entity)) throw new Error(`Workflow trùng: ${entity}`);
  machines.set(entity, { collection, transitions });
}
export function workflowActions(entity, status) {
  const machine = machines.get(entity);
  return machine?.transitions[status] || [];
}
export function transition(draft, env, { entity, id, to, reason = '' }) {
  const machine = machines.get(entity);
  if (!machine) throw new DomainError(`Workflow chưa khai báo: ${entity}`);
  const row = draft[machine.collection]?.find((x) => x.id === id);
  if (!row) throw new DomainError(`Không tìm thấy ${entity} ${id}`);
  const rule = workflowActions(entity, row.status).find((x) => x.to === to);
  if (!rule) throw new DomainError(`Không được chuyển ${row.status} → ${to}`);
  if (rule.adminOnly && env.actor.role !== 'admin') throw new DomainError('Chỉ Admin được mở khóa');
  if (rule.reasonRequired && !String(reason).trim()) throw new DomainError('Bắt buộc nhập lý do');
  const before = row.status;
  row.status = to;
  logAudit(draft, env, { action: `${entity}: ${before} → ${to}`, entity, id,
    before: { status: before }, after: { status: to }, reason: String(reason).trim() });
  return row;
}
