// FR05 — Phòng: sinh theo tầng, import CSV, vòng đời trạng thái, ba lớp giá, ba loại phòng trống. Thuần.
import { logAudit, DomainError } from '../audit.mjs';
import { fold } from '../format.mjs';

export const STATUSES = ['Sẵn sàng', 'Giữ chỗ', 'Đang thuê', 'Trống hết tháng', 'Chờ dọn', 'Bảo trì', 'Ngừng khai thác'];
export const ROOM_TYPES = ['Phòng thường', 'Phòng ban công', 'Studio', 'Phòng gác xép'];

/**
 * Chuyển trạng thái được phép làm tay. KHÔNG có chuyển nào tới "Đang thuê" — trạng thái đó chỉ do kích hoạt HĐ đặt (BR-2.04.5).
 * blocked: hiển thị disabled kèm lý do.
 */
export const TRANSITIONS = [
  { from: 'Sẵn sàng', to: 'Giữ chỗ', label: 'Giữ chỗ (đã cọc)', blocked: 'Giữ chỗ chỉ tạo khi có bút toán cọc của HĐ Nháp/Chờ ký (BR-2.04.7) — thuộc FR07' },
  { from: 'Sẵn sàng', to: 'Bảo trì', label: 'Chuyển bảo trì', impact: 'Phòng tính vào loại “Trống ở luôn”; cảnh báo TPVH nếu bảo trì > 15 ngày.' },
  { from: 'Sẵn sàng', to: 'Ngừng khai thác', label: 'Ngừng khai thác', impact: 'Phòng không tính vào mẫu số N phân bổ và không tính trống (BR-2.04.12 → P-05).' },
  { from: 'Giữ chỗ', to: 'Sẵn sàng', label: 'Hủy giữ chỗ', impact: 'Xử lý bỏ cọc, hoặc hoàn cọc nếu lỗi công ty (BR-2.04.7).', pending: 'Luồng xử lý cọc thuộc FR16' },
  { from: 'Trống hết tháng', to: 'Chờ dọn', label: 'Xác nhận ngày ra', impact: 'Phòng chuyển Chờ dọn; cảnh báo nếu Chờ dọn > 3 ngày.' },
  { from: 'Chờ dọn', to: 'Bảo trì', label: 'Cần sửa → Bảo trì', impact: 'Cảnh báo TPVH nếu bảo trì > 15 ngày.' },
  { from: 'Chờ dọn', to: 'Sẵn sàng', label: 'Xác nhận dọn xong', impact: 'Phòng Sẵn sàng nhận HĐ mới.' },
  { from: 'Bảo trì', to: 'Sẵn sàng', label: 'Nghiệm thu → Sẵn sàng', impact: 'Phòng Sẵn sàng nhận HĐ mới.' },
  { from: 'Ngừng khai thác', to: 'Sẵn sàng', label: 'Mở lại khai thác', impact: 'Phòng được tính lại vào N phân bổ và thống kê trống.' },
];
export const transitionsFrom = (status) => TRANSITIONS.filter((t) => t.from === status);

/** Ba loại phòng trống (D-24). Ngừng khai thác và Đang thuê không tính trống. */
export function vacancyType(status) {
  if (['Sẵn sàng', 'Chờ dọn', 'Bảo trì'].includes(status)) return 'Trống ở luôn';
  if (status === 'Trống hết tháng') return 'Trống hết tháng';
  if (status === 'Giữ chỗ') return 'Đang chờ';
  return null;
}

/** Mã phòng = số phòng + mã tòa (2 trường riêng, BR-2.04.1). */
export const roomCode = (number, buildingCode) => `${number}${buildingCode}`;

/**
 * Sinh theo tầng. pattern hỗ trợ {tầng} và {stt}. Trả về { rows, warnings }.
 * `{tầng}0{stt}` với ≥ 10 phòng/tầng sinh ra số 4 chữ số → cảnh báo (SRS chưa chốt).
 */
export function genByFloor({ buildingCode, floors, perFloor, pattern = '{tầng}0{stt}', type = 'Phòng thường', capacity = 2, listPrice = null, mgmtPrice = null }) {
  const warnings = [];
  if (!Number.isInteger(floors) || floors < 1 || floors > 99) throw new DomainError('Số tầng từ 1 đến 99');
  if (!Number.isInteger(perFloor) || perFloor < 1 || perFloor > 50) throw new DomainError('Số phòng mỗi tầng từ 1 đến 50');
  if (!pattern.includes('{stt}')) throw new DomainError('Mẫu số phòng phải có {stt}');
  if (perFloor >= 10 && pattern.includes('0{stt}')) warnings.push('Từ 10 phòng/tầng, mẫu {tầng}0{stt} sinh số 4 chữ số (ví dụ 1010) — cần xác nhận quy tắc');
  const rows = [];
  for (let f = 1; f <= floors; f++) {
    for (let s = 1; s <= perFloor; s++) {
      const number = pattern.replaceAll('{tầng}', String(f)).replaceAll('{stt}', String(s));
      rows.push({ number, floor: f, code: roomCode(number, buildingCode), type, capacity, listPrice, mgmtPrice, isNew: true });
    }
  }
  return { rows, warnings };
}

/** Kiểm tra các dòng preview trước khi tạo. existing = Set số phòng đã có trong tòa. */
export function checkPreview(rows, existing = new Set()) {
  const seen = new Map();
  return rows.map((r, i) => {
    const errs = [];
    const n = String(r.number || '').trim();
    if (!n) errs.push('Thiếu số phòng');
    if (!Number.isInteger(Number(r.capacity)) || Number(r.capacity) <= 0) errs.push('Sức chứa phải lớn hơn 0');
    if (n && existing.has(n)) errs.push('Trùng mã với phòng đã có');
    if (n && seen.has(n)) errs.push(`Trùng với dòng ${seen.get(n) + 1}`);
    if (n) seen.set(n, seen.has(n) ? seen.get(n) : i);
    const warn = r.listPrice && r.mgmtPrice && r.mgmtPrice > r.listPrice ? 'Giá QL > giá niêm yết' : '';
    return { ...r, errors: errs, warn };
  });
}

// ---------- Import CSV ----------
/** CSV UTF-8: bỏ BOM, tự nhận dấu phân cách , hoặc ;, hỗ trợ ô trong ngoặc kép. */
export function parseCSV(text) {
  const t = String(text).replace(/^﻿/, '');
  const first = t.split(/\r?\n/)[0] || '';
  const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"' && t[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
}

export const IMPORT_FIELDS = [
  ['code', 'Mã phòng'], ['building', 'Tòa'], ['number', 'Số phòng'], ['floor', 'Tầng'],
  ['listPrice', 'Giá niêm yết'], ['mgmtPrice', 'Giá QL'], ['capacity', 'Sức chứa'],
];
const ALIASES = {
  code: ['ma phong', 'ma'], building: ['toa', 'ma toa'], number: ['so phong', 'phong'], floor: ['tang'],
  listPrice: ['gia niem yet', 'niem yet'], mgmtPrice: ['gia ql', 'gia quan ly'], capacity: ['suc chua'],
};
/** Tự map cột theo tên header. Trả về { field: columnIndex | -1 }. */
export function mapColumns(headers) {
  const h = headers.map(fold);
  return Object.fromEntries(Object.entries(ALIASES).map(([k, names]) => [k, h.findIndex((x) => names.includes(x))]));
}

const num = (s) => {
  const t = String(s ?? '').trim();
  if (!t) return null;
  const n = Number(t.replace(/[.\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};

/**
 * Validate từng dòng import. Giá trị bắt buộc: số phòng (hoặc mã), tầng, sức chứa.
 * Cột giá phải có trong file nhưng ô giá được để trống (nhập sau) — theo capture, cần xác nhận.
 */
export function validateImport(rows, mapping, { buildingCode, existing = new Set(), generated = new Set() }) {
  const seen = new Set();
  return rows.map((cells, i) => {
    const get = (k) => (mapping[k] >= 0 ? String(cells[mapping[k]] ?? '').trim() : '');
    let number = get('number');
    const code = get('code');
    if (!number && code && buildingCode && code.endsWith(buildingCode)) number = code.slice(0, -buildingCode.length);
    const rec = {
      line: i + 2, code: code || (number ? roomCode(number, buildingCode) : ''), number, building: get('building'),
      floor: num(get('floor')), listPrice: num(get('listPrice')), mgmtPrice: num(get('mgmtPrice')), capacity: num(get('capacity')),
    };
    const missing = [];
    if (!number) missing.push('số phòng');
    if (rec.floor === null) missing.push('tầng');
    if (rec.capacity === null) missing.push('sức chứa');
    let status = 'ok'; let label = 'Hợp lệ';
    if (missing.length) { status = 'missing'; label = `Thiếu ${missing.join(', ')}`; }
    else if ([rec.floor, rec.capacity, rec.listPrice, rec.mgmtPrice].some((v) => Number.isNaN(v))) { status = 'error'; label = 'Giá trị số không hợp lệ'; }
    else if (rec.building && rec.building.toUpperCase() !== buildingCode) { status = 'error'; label = `Sai mã tòa (${rec.building})`; }
    else if (code && code !== roomCode(number, buildingCode)) { status = 'error'; label = 'Mã phòng ≠ số phòng + mã tòa'; }
    else if (generated.has(number)) { status = 'dup'; label = 'Trùng mã với dòng sinh theo tầng'; }
    else if (existing.has(number)) { status = 'dup'; label = 'Trùng mã với phòng đã có'; }
    else if (seen.has(number)) { status = 'dup'; label = 'Trùng trong file'; }
    if (number) seen.add(number);
    return { ...rec, status, label };
  });
}

// ---------- Ghi dữ liệu ----------
export function createRooms(draft, env, buildingId, rows, source) {
  const b = draft.buildings.find((x) => x.id === buildingId);
  if (!b?.codeLocked) throw new DomainError('Tòa chưa lưu mã — lưu mã tòa trước khi tạo phòng (BR-2.03.3)');
  if (!rows.length) throw new DomainError('Không có dòng hợp lệ để tạo');
  const existing = new Set(draft.rooms.filter((r) => r.buildingId === buildingId).map((r) => r.number));
  const created = [];
  for (const r of rows) {
    const number = String(r.number).trim();
    if (existing.has(number)) throw new DomainError(`Trùng mã phòng ${roomCode(number, b.code)}`);
    existing.add(number);
    const id = roomCode(number, b.code);
    draft.rooms.push({
      id, buildingId, number, floor: Number(r.floor), type: r.type || 'Phòng thường', area: null, capacity: Number(r.capacity),
      listPrice: r.listPrice ?? null, mgmtPrice: r.mgmtPrice ?? null, lease: null, debt: 0,
      status: 'Sẵn sàng', statusFrom: env.today, readyDate: env.today, vacantFrom: env.today,
      source, furniture: [], hasWaterMeter: false, createdAt: env.now,
    });
    draft.roomStatusHistory.push({ roomId: id, status: 'Sẵn sàng', from: env.today, to: null, reason: `Tạo phòng · ${source}`, by: env.actor.name });
    for (const kind of ['listPrice', 'mgmtPrice']) {
      if (r[kind] != null) draft.roomPriceHistory.push({ roomId: id, kind, value: r[kind], effectiveFrom: env.today, by: env.actor.name });
    }
    created.push(id);
  }
  logAudit(draft, env, { action: `Tạo ${created.length} phòng`, entity: 'ROOM', id: buildingId, after: { rooms: created, source } });
  return created;
}

export function applyTransition(draft, env, roomId, to, reason) {
  const r = draft.rooms.find((x) => x.id === roomId);
  if (!r) throw new DomainError('Không tìm thấy phòng');
  const t = TRANSITIONS.find((x) => x.from === r.status && x.to === to);
  if (!t) throw new DomainError(`Không được chuyển ${r.status} → ${to}`);
  if (t.blocked) throw new DomainError(t.blocked);
  if (!String(reason || '').trim()) throw new DomainError('Bắt buộc nhập lý do');
  const open = draft.roomStatusHistory.find((h) => h.roomId === roomId && !h.to);
  if (open) open.to = env.today;
  draft.roomStatusHistory.push({ roomId, status: to, from: env.today, to: null, reason, by: env.actor.name });
  const before = r.status;
  r.status = to; r.statusFrom = env.today;
  if (to === 'Sẵn sàng') r.readyDate = env.today;
  logAudit(draft, env, { action: `Đổi trạng thái phòng ${before} → ${to}`, entity: 'ROOM', id: roomId, before: { status: before }, after: { status: to }, reason });
}

/** Đổi giá niêm yết / giá QL có ngày hiệu lực, giữ lịch sử (BR-2.04.4). */
export function setPrice(draft, env, roomId, kind, value, effectiveFrom) {
  const r = draft.rooms.find((x) => x.id === roomId);
  if (!['listPrice', 'mgmtPrice'].includes(kind)) throw new DomainError('Loại giá không hợp lệ');
  if (!Number.isFinite(value) || value <= 0) throw new DomainError('Giá phải lớn hơn 0');
  if (!effectiveFrom) throw new DomainError('Bắt buộc nhập ngày hiệu lực');
  draft.roomPriceHistory.push({ roomId, kind, value, effectiveFrom, by: env.actor.name, at: env.now });
  const before = r[kind];
  if (effectiveFrom <= env.today) r[kind] = value;
  logAudit(draft, env, { action: `Đổi ${kind === 'listPrice' ? 'giá niêm yết' : 'giá QL'}`, entity: 'ROOM', id: roomId, before: { [kind]: before }, after: { [kind]: value, effectiveFrom } });
}

export function setCapacity(draft, env, roomId, capacity) {
  const r = draft.rooms.find((x) => x.id === roomId);
  if (!Number.isInteger(capacity) || capacity <= 0) throw new DomainError('Sức chứa phải là số nguyên lớn hơn 0');
  const before = r.capacity; r.capacity = capacity;
  logAudit(draft, env, { action: 'Đổi sức chứa', entity: 'ROOM', id: roomId, before: { capacity: before }, after: { capacity } });
}
