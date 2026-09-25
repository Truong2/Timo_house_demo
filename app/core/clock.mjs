// Ngày "hôm nay" của demo cố định để số liệu khớp Seed (kỳ 09/2026). Ghi đè bằng ?today=YYYY-MM-DD.
import { isValidISO, pad } from './format.mjs';

export const DEMO_TODAY = '2026-09-24';

const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const override = q.get('today');

export function today() {
  return override && isValidISO(override) ? override : DEMO_TODAY;
}
/** Thời điểm hiện tại theo ngày demo + giờ thật, dạng 'YYYY-MM-DDTHH:MM'. */
export function now() {
  const d = new Date();
  return `${today()}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
