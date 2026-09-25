import { DomainError } from './audit.mjs';
import { pendBlock } from '../ui/controls.mjs';

export const periodStatus = (state, period) => state.periods?.find((x) => x.id === period)?.status || 'Open';
export function assertPeriodOpen(state, period) {
  if (periodStatus(state, period) === 'Locked') throw new DomainError(`Kỳ ${period} đã khóa`);
}
export function periodBanner(state, period) {
  return periodStatus(state, period) === 'Locked'
    ? pendBlock(`Kỳ ${period} đã khóa`, 'Dữ liệu kỳ này chỉ đọc. Mọi điều chỉnh cần mở khóa theo quy trình duyệt.') : '';
}
