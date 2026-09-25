import { DomainError, logAudit } from './audit.mjs';

// Registry dùng chung: giá trị minh họa giữ nguồn và ngày hiệu lực để domain có thể tái tính lịch sử.
const KNOWN = {
  'P-02': { value: { smallAssetMonths: 12, largeAssetMonths: 36 }, source: 'Spec §18' },
  'P-03': { value: 30, source: 'Spec §18; Seed có ca chia 31' },
  'P-05': { value: { allocationIncludesVacant: true, performanceUsesBilled: true }, source: 'Spec §18' },
  'P-09': { value: { dailyPenalty: 200000, startsAfterDays: 5 }, source: 'Spec §18' },
  'P-11': { value: 2000000, source: 'Spec §18' },
  'P-12': { value: 10000, source: 'Plan Đợt 3' },
  'P-14': { value: ['oldDebt', 'services', 'other', 'rent', 'deposit'], source: 'Spec §18' },
  'P-16': { value: { wear: 200000, cleaning: 100000, paintingMin: 300000, paintingMax: 500000 }, source: 'Spec §18' },
  'P-17': { value: 5, source: 'Spec §18' },
  'P-19': { value: { milestones: [5, 10, 15], time: '23:59' }, source: 'Spec §18' },
  'P-20': { value: { debtWarningDays: 5, debtCriticalDays: 15, contractWarningDays: 7 }, source: 'Spec §18' },
  'P-22': { value: { mergeHrInto: 'admin', mergeGeneralManagementInto: 'accountant' }, source: 'Spec §18' },
  'P-24': { value: { issueAt: 'Chờ ký', suffixWidth: 3 }, source: 'Spec §18' },
  'P-26': { value: { countCashOnlyWhenConfirmed: true }, source: 'Spec §18' },
  'P-32': { value: 35, source: 'Plan Đợt 2; HĐ mẫu ghi 30' },
  'P-36': { value: 10, source: 'Spec §18' },
};

export const PARAM_IDS = Array.from({ length: 36 }, (_, i) => `P-${String(i + 1).padStart(2, '0')}`);
export const initialParams = () => Object.fromEntries(PARAM_IDS.map((id) => [id, [{
  effectiveFrom: '2026-01-01', status: 'Cần xác nhận', value: KNOWN[id]?.value ?? null,
  source: KNOWN[id]?.source ?? 'SRS v1.0 §18 — chưa cấu hình giá trị',
}]]));

export function paramRecord(state, id, date) {
  const rows = state.params?.[id];
  if (!rows) throw new DomainError(`Tham số chưa khai báo: ${id}`);
  const row = [...rows].filter((x) => x.effectiveFrom <= date).sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
  if (!row) throw new DomainError(`Chưa có giá trị ${id} tại ${date}`);
  return row;
}
export const param = (state, id, date) => paramRecord(state, id, date).value;

export function setParam(draft, env, id, value, effectiveFrom) {
  if (!draft.params?.[id]) throw new DomainError(`Tham số chưa khai báo: ${id}`);
  if (!effectiveFrom || value == null) throw new DomainError('Thiếu giá trị hoặc ngày hiệu lực');
  if (draft.params[id].some((x) => x.effectiveFrom === effectiveFrom)) throw new DomainError('Ngày hiệu lực đã có');
  draft.params[id].push({ effectiveFrom, value, status: 'Cần xác nhận', source: `Admin demo ${env.actor.name}` });
  logAudit(draft, env, { action: 'Thay đổi tham số', entity: 'PARAM', id,
    after: { value, effectiveFrom }, source: 'FR33' });
}
