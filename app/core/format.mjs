// Định dạng dùng chung. Thuần (không đụng DOM) để domain và test Node dùng được.
// Ngày trong store luôn là ISO 'YYYY-MM-DD'; hiển thị DD/MM/YYYY theo Common Rule 10.
export { vnd, pct, mask, esc } from '../ui/shell.mjs';

export const pad = (n) => String(n).padStart(2, '0');

export function dateVN(iso) {
  if (!iso) return '—';
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}
/** '2026-09-24T09:05' → '24/09/2026 09:05' */
export function dtVN(iso) {
  if (!iso) return '—';
  const t = String(iso).slice(11, 16);
  return t ? `${dateVN(iso)} ${t}` : dateVN(iso);
}
/** 'DD/MM/YYYY' → ISO, sai định dạng → null */
export function parseVN(s) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
  if (!m) return null;
  const iso = `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  return isValidISO(iso) ? iso : null;
}
export function isValidISO(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ''))) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}
const toUTC = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const fromUTC = (ms) => { const dt = new Date(ms); return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`; };

/** Cộng tháng, kẹp ngày cuối tháng: 2026-01-31 + 1 → 2026-02-28 */
export function addMonths(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const idx = m - 1 + n;
  const yy = y + Math.floor(idx / 12);
  const mm = ((idx % 12) + 12) % 12;
  const last = new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate();
  return `${yy}-${pad(mm + 1)}-${pad(Math.min(d, last))}`;
}
export const addDays = (iso, n) => fromUTC(toUTC(iso) + n * 86400000);
/** Số ngày từ a tới b (b − a) */
export const daysBetween = (a, b) => Math.round((toUTC(b) - toUTC(a)) / 86400000);
/** Kỳ 'MM/YYYY' */
export const monthVN = (iso) => (iso ? `${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—');

export const digits = (s) => String(s ?? '').replace(/\D/g, '');
/** Chuẩn hóa SĐT VN: bỏ ký tự thừa, +84/84 → 0. */
export function normalizePhone(s) {
  let d = digits(s);
  if (d.startsWith('84') && d.length === 11) d = `0${d.slice(2)}`;
  return d;
}
/** So khớp không dấu, không phân biệt hoa thường (tìm kiếm tương đối). */
export function fold(s) {
  return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
/** Số tiền nhập tay '114.000.000' → 114000000; rỗng → null */
export function parseMoney(s) {
  const t = String(s ?? '').trim();
  if (!t) return null;
  const n = Number(t.replace(/[.\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}
