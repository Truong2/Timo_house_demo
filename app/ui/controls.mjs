// Control dùng chung cho SPA, dựng trên helper của shell để giữ đúng giao diện ảnh mockup.
import { btn, chip, icon, esc } from './shell.mjs';
import { openModal } from './modal.mjs';
import { question } from '../core/decisions.mjs';

/**
 * Nút có action. perm = kết quả can(); disabled + tip = điều kiện nghiệp vụ.
 * Nút luôn hiển thị; không đủ quyền/điều kiện → aria-disabled + tooltip (Common Rule 7).
 */
export function abtn({ text, kind = 'outline', ic, act, perm, disabled = false, tip = '', data = {} }) {
  const denied = perm && !perm.ok;
  const dis = denied || disabled;
  const reason = denied ? perm.reason : (disabled ? tip : tip);
  const attrs = [
    act ? `data-action="${act}"` : '',
    ...Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`),
    dis ? 'aria-disabled="true"' : '',
    reason ? `data-tip="${esc(reason)}"` : '',
  ].filter(Boolean).join(' ');
  return btn(text, `${kind}${dis ? ' dis' : ''}`, ic, attrs);
}

/** Chip "Cần xác nhận" — chỉ hiện khi bật công tắc (body.show-pending). */
export const pend = (text) => `<span class="pending-mark">${chip(`Cần xác nhận · ${text}`, 'assumed', 'alert')}</span>`;
export const pchip = (id) => {
  const q = question(id);
  return `<span class="pending-mark" title="${esc(`${id}: ${q?.title || 'Chưa có mô tả'} · ${q?.current || ''}`)}">${chip(`Cần xác nhận · ${id}`, 'assumed', 'alert')}</span>`;
};
/** Chip giả định / dự kiến. */
export const assumed = (text) => `<span class="pending-mark">${chip(text, 'assumed', 'alert')}</span>`;
/** Khối ghi chú dài cho điểm SRS đỏ (ẩn khi tắt công tắc). */
export const pendBlock = (title, text) => `<div class="alert warn pending-block banner-assumed">${icon('alert', 18)}<div><b>${title}</b>${text ? `<p>${text}</p>` : ''}</div></div>`;

/** Control có trên capture nhưng SRS chưa đặc tả hành vi → modal giải thích, không bịa hành vi. */
export function notSpecified(ref, detail = '') {
  return openModal({
    title: `${icon('alert', 18)} Chưa có đặc tả`,
    body: `<p>Hành vi của control này đang để <b style="color:#CC0000">đỏ</b> trong SRS nên mockup chưa thực hiện.</p>
      <p style="margin-top:8px">${chip(`Cần xác nhận · ${ref}`, 'assumed', 'alert')}</p>${detail ? `<p class="muted" style="margin-top:8px">${detail}</p>` : ''}`,
    buttons: [{ label: 'Đã hiểu', act: 'ok', kind: 'primary' }], width: 460,
  });
}

// ---------- Ô nhập trong khung .field/.in của shell ----------
export const inp = ({ name, value = '', type = 'text', placeholder = '', attrs = '' }) =>
  `<input class="bare" name="${name}" type="${type}" value="${esc(value ?? '')}" placeholder="${esc(placeholder)}" ${attrs}/>`;

export const sel = ({ name, value = '', options, placeholder = '', attrs = '' }) =>
  `<select class="bare" name="${name}" ${attrs}>${placeholder ? `<option value="">${placeholder}</option>` : ''}${options.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(value ?? '') ? ' selected' : ''}>${l}</option>`).join('')}</select>`;

export const area = ({ name, value = '', placeholder = '', rows = 3 }) =>
  `<textarea class="bare" name="${name}" rows="${rows}" maxlength="255" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`;

/** Khung field giống shell: label + .in (+ extra chip bên phải) + lỗi/hint. */
export function fieldBox(label, inner, { req = false, hint = '', err = '', cls = '', extra = '', id = '' } = {}) {
  return `<div class="field"${id ? ` id="${id}"` : ''}><label>${label}${req ? ' <span class="req">*</span>' : ''}</label><div class="in ${cls}${err ? ' err' : ''}">${inner}${extra}</div>${err ? `<div class="errt">${err}</div>` : ''}${hint ? `<div class="hint">${hint}</div>` : ''}</div>`;
}

/** Bộ lọc dạng .fsel của shell nhưng là <select> thật. */
export function fsel(label, name, value, options, act = 'filter') {
  return `<label class="fsel"><small>${label}</small><select class="bare b" name="${name}" data-change="${act}" aria-label="${esc(label)}">${options.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(value ?? '') ? ' selected' : ''}>${l}</option>`).join('')}</select>${icon('chevronDown', 14)}</label>`;
}
/** Ô tìm kiếm dạng .fsel. */
export function fsearch(name, value, placeholder, act = 'search') {
  return `<label class="fsel">${icon('search', 14)}<input class="bare" name="${name}" type="search" value="${esc(value || '')}" placeholder="${esc(placeholder)}" maxlength="255" data-input="${act}" aria-label="${esc(placeholder)}" style="width:170px"/></label>`;
}

export const blank = (t = 'Trống trên HĐ') => `<span class="wtx">${icon('alert', 12)} ${t}</span>`;
export const muted = (t) => `<span class="muted">${t}</span>`;
export const mono = (t) => `<span class="mono">${esc(t)}</span>`;

/** Empty state có mã lỗi chưa chốt (E##). */
export const emptyState = (title, text = '', code = 'E##') => `<div class="empty"><b>${title}</b>${text ? `<span>${text}</span>` : ''} ${pend(`mã lỗi ${code}`)}</div>`;

/** Phân trang > pageSize dòng (Common Rule 6). */
export function paginate(rows, page = 1, size = 50) {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(Math.max(1, Number(page) || 1), pages);
  return { rows: rows.slice((p - 1) * size, p * size), page: p, pages };
}
export function pager({ page, pages }, act = 'page') {
  if (pages <= 1) return '';
  return `<span class="pager">${Array.from({ length: pages }, (_, i) => i + 1).map((n) => `<button type="button" class="btn sm ${n === page ? 'sel' : ''}" data-action="${act}" data-page="${n}">${n}</button>`).join('')}</span>`;
}

// ---------- Chip trạng thái (Common Rule 4: icon + chữ) ----------
const CHIP = {
  // chủ nhà
  draft: ['Nháp · từ trích xuất', 'info', 'scan'], missing: ['Thiếu HĐ đầu vào', 'warn', 'alert'],
  active: ['Hoạt động', 'ok', 'check'], stopped: ['Ngừng hoạt động', 'neutral', 'lock'],
  // HĐ đầu vào
  'Nháp': ['Nháp', 'neutral', 'edit'], 'Hiệu lực': ['Hiệu lực', 'ok', 'check'], 'Sắp hết': ['Sắp hết', 'warn', 'clock'], 'Kết thúc': ['Kết thúc', 'neutral', 'lock'],
  // tòa
  'Chuẩn bị': ['Chuẩn bị', 'neutral', 'clock'], 'Đang khai thác': ['Đang khai thác', 'ok', 'check'], 'Ngừng khai thác': ['Ngừng khai thác', 'neutral', 'lock'],
  // phòng
  'Sẵn sàng': ['Sẵn sàng', 'info', 'check'], 'Giữ chỗ': ['Giữ chỗ', 'primary', 'clock'], 'Đang thuê': ['Đang thuê', 'ok', 'user'],
  'Trống hết tháng': ['Trống hết tháng', 'warn', 'calendar'], 'Chờ dọn': ['Chờ dọn', 'warn', 'refresh'], 'Bảo trì': ['Bảo trì', 'danger', 'settings'],
  // kỳ trả
  'Chưa đến hạn': ['Chưa đến hạn', 'neutral', 'clock'], 'Sắp đến hạn': ['Sắp đến hạn', 'warn', 'alert'], 'Đã trả': ['Đã trả', 'ok', 'check'],
  'Trả một phần': ['Trả một phần', 'warn', 'coins'], 'Quá hạn': ['Quá hạn', 'danger', 'x'],
  // tài liệu
  'Chờ xác minh': ['Chờ xác minh', 'neutral', 'clock'], 'Chờ bản chụp': ['Chờ bản chụp', 'warn', 'alert'], 'Đã xác minh': ['Đã xác minh', 'ok', 'check'], 'Không áp dụng': ['Không áp dụng', 'neutral', 'info'],
};
export function registerChips(map) {
  for (const [key, value] of Object.entries(map)) {
    if (CHIP[key]) throw new Error(`Chip trùng: ${key}`);
    CHIP[key] = value;
  }
}
export function stChip(key) {
  const c = CHIP[key];
  return c ? chip(c[0], c[1], c[2]) : chip(String(key ?? '—'), 'neutral');
}
