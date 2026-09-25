import { workflowActions, transition } from '../core/domain/workflow.mjs';
import { confirmModal } from './modal.mjs';
import { abtn } from './controls.mjs';

export const approvalActions = (entity, id, status) => workflowActions(entity, status).map((rule) =>
  abtn({ text: rule.label, act: 'approval-transition', data: { entity, id, status, to: rule.to } })).join('');

export async function handleApproval(el, ctx) {
  const { entity, id, to, status } = el.dataset;
  const rule = workflowActions(entity, status).find((x) => x.to === to);
  const answer = await confirmModal({ title: `${rule?.label || 'Chuyển trạng thái'}?`,
    reason: rule?.reasonRequired ? { required: true, label: 'Lý do' } : null });
  if (!answer) return;
  ctx.tx((draft, env) => transition(draft, env, { entity, id, to, reason: answer.reason }));
}
