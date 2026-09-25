// FR04 — Tòa nhà: mã bất biến, phân loại có lịch sử, điều kiện chuyển trạng thái, hồ sơ pháp lý. Thuần.
import { nextCode, logAudit, DomainError } from '../audit.mjs';

export const GROUPS = [['T', 'T'], ['S', 'S'], ['G', 'G']];
export const GRADES = [['L1', 'L1 – cũ'], ['L2', 'L2 – trung bình'], ['L3', 'L3 – mới']];
export const AMENITIES = [['elevator', 'Thang máy'], ['washer', 'Máy giặt chung'], ['evCharger', 'Sạc xe điện'], ['camera', 'Camera'], ['guard', 'Bảo vệ']];

/** 10 loại tài liệu (04.3). dates: loại có ngày cấp / hạn — danh sách này là giả định (SRS đỏ). */
export const DOC_TYPES = [
  { v: 'Giấy chứng nhận nhà đất/sổ đỏ', short: 'Giấy CN nhà đất (GCN)', issued: true, expiry: false, scope: 'building' },
  { v: 'Hồ sơ PCCC', short: 'Hồ sơ PCCC', issued: true, expiry: true, scope: 'building' },
  { v: 'Giấy đăng ký hộ kinh doanh', short: 'Giấy ĐK hộ kinh doanh', issued: true, expiry: false, scope: 'building' },
  { v: 'Hợp đồng thuê nhà đầu vào đã ký', short: 'HĐ thuê nhà đã ký', issued: false, expiry: false, scope: 'both' },
  { v: 'Phụ lục hợp đồng', short: 'Phụ lục hợp đồng', issued: false, expiry: false, scope: 'both' },
  { v: 'Biên bản bàn giao/kiểm kê tài sản', short: 'Phụ lục bàn giao tài sản', issued: false, expiry: false, scope: 'both' },
  { v: 'CCCD/ủy quyền bên cho thuê', short: 'CCCD/ủy quyền', issued: true, expiry: false, scope: 'landlord' },
  { v: 'Phụ lục góp vốn 3 bên', short: 'Phụ lục góp vốn 3 bên', issued: false, expiry: false, scope: 'both', later: true },
  { v: 'Chứng từ thuế/phí', short: 'Chứng từ thuế/phí', issued: true, expiry: false, scope: 'building' },
  { v: 'Minh chứng khác', short: 'Minh chứng khác', issued: false, expiry: false, scope: 'both' },
];
export const docType = (v) => DOC_TYPES.find((t) => t.v === v);

const find = (draft, id) => {
  const b = draft.buildings.find((x) => x.id === id);
  if (!b) throw new DomainError(`Không tìm thấy tòa ${id}`);
  return b;
};

export const buildingLabel = (b) => b.code || b.name;
export const roomsOf = (state, buildingId) => state.rooms.filter((r) => r.buildingId === buildingId);
export const roomCount = (state, b) => roomsOf(state, b.id).length || b.seedRoomCount || 0;
export const leasesOfBuilding = (state, buildingId) => state.headLeases.filter((h) => h.allocations.some((a) => a.buildingId === buildingId));

/** Quản lý phụ trách chính hiệu lực tại ngày xem (BR-2.03.1). upcoming = phân công tương lai (nhãn "sắp tới"). */
export function managerOf(state, buildingId, today) {
  const rows = state.buildingAssignments.filter((a) => a.buildingId === buildingId && a.role === 'Phụ trách chính');
  const cur = rows.find((a) => a.from <= today && (!a.to || a.to >= today));
  const upcoming = rows.filter((a) => a.from > today).sort((a, b) => a.from.localeCompare(b.from))[0];
  const emp = (a) => a && state.employees.find((e) => e.id === a.employeeId);
  return { current: cur ? { ...cur, employee: emp(cur) } : null, upcoming: upcoming ? { ...upcoming, employee: emp(upcoming) } : null };
}

/** Giá trị phân loại hiệu lực tại ngày (BUILDING_TYPE_HISTORY). */
export function classificationAt(state, buildingId, attr, date) {
  return state.buildingTypeHistory
    .filter((h) => h.buildingId === buildingId && h.attr === attr && h.effectiveFrom <= date)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]?.value || null;
}

/** Mã tòa: lưu một lần rồi khóa (BR-2.03.3). Ký tự cho phép là giả định (SRS đỏ). */
export function saveCode(draft, env, id, raw) {
  const b = find(draft, id);
  if (b.codeLocked) throw new DomainError('Mã tòa đã lưu, không đổi được');
  const code = String(raw || '').trim().toUpperCase();
  if (!code) throw new DomainError('Bắt buộc nhập mã tòa');
  if (!/^[A-Z0-9]{1,10}$/.test(code)) throw new DomainError('Mã tòa chỉ gồm chữ không dấu và số, tối đa 10 ký tự');
  if (draft.buildings.some((x) => x.id !== id && x.code === code)) throw new DomainError(`Mã ${code} đã được dùng cho tòa khác`);
  b.code = code; b.codeLocked = true;
  logAudit(draft, env, { action: 'Lưu mã tòa (bất biến)', entity: 'BUILDING', id, after: { code } });
}

export function setBasics(draft, env, id, patch) {
  const b = find(draft, id);
  const before = {}; const after = {};
  for (const k of ['floors', 'floorArea']) {
    if (!(k in patch)) continue;
    const v = patch[k];
    if (v !== null && (!Number.isFinite(v) || v <= 0)) throw new DomainError(k === 'floors' ? 'Số tầng phải lớn hơn 0' : 'Diện tích sàn phải lớn hơn 0');
    if (k === 'floors' && v !== null && !Number.isInteger(v)) throw new DomainError('Số tầng phải là số nguyên');
  }
  for (const [k, v] of Object.entries(patch)) { before[k] = b[k]; b[k] = v; after[k] = v; }
  logAudit(draft, env, { action: 'Sửa hồ sơ tòa', entity: 'BUILDING', id, before, after, source: 'Người dùng tự điền (Common Rule 3)' });
}

/** Điều kiện Chuẩn bị → Đang khai thác (ASSUMED 1.9). T/S/G + L1–L3 chọn trong popup chuyển trạng thái. */
export function transitionBlockers(state, b, today) {
  const hard = []; const soft = [];
  if (!leasesOfBuilding(state, b.id).some((h) => h.status === 'Hiệu lực')) hard.push('HĐ đầu vào chưa Hiệu lực');
  if (!roomsOf(state, b.id).length) hard.push('chưa có phòng nào');
  if (!managerOf(state, b.id, today).current) hard.push('chưa có quản lý phụ trách chính (FR20)');
  if (!b.customerAccountId) hard.push('chưa chọn TK nhận tiền khách');
  if (!b.floors || !b.floorArea) soft.push('Số tầng / diện tích sàn còn trống');
  return { hard, soft };
}

export function transition(draft, env, id, { group, grade, from }) {
  const b = find(draft, id);
  if (b.status !== 'Chuẩn bị') throw new DomainError('Chỉ chuyển từ Chuẩn bị');
  const { hard } = transitionBlockers(draft, b, env.today);
  if (hard.length) throw new DomainError(`Chưa đủ điều kiện: ${hard.join(' · ')}`);
  if (!group || !grade) throw new DomainError('Bắt buộc xác nhận Nhóm T/S/G và Hạng L1–L3');
  const eff = from || env.today;
  setClassification(draft, env, id, 'group', group, eff);
  setClassification(draft, env, id, 'grade', grade, eff);
  b.status = 'Đang khai thác'; b.opsStartDate = eff;
  logAudit(draft, env, { action: 'Chuyển Đang khai thác', entity: 'BUILDING', id, before: { status: 'Chuẩn bị' }, after: { status: b.status, group, grade } });
}

/** Ghi lịch sử phân loại, không ghi đè (BR-2.02.7, BR-2.03.2). */
export function setClassification(draft, env, id, attr, value, effectiveFrom) {
  const b = find(draft, id);
  if (!effectiveFrom) throw new DomainError('Bắt buộc nhập ngày hiệu lực');
  const before = classificationAt(draft, id, attr, effectiveFrom);
  draft.buildingTypeHistory.push({ buildingId: id, attr, value, effectiveFrom, by: env.actor.name, at: env.now });
  if (effectiveFrom <= env.today) b[attr] = classificationAt(draft, id, attr, env.today);
  logAudit(draft, env, { action: `Đổi ${attr === 'group' ? 'Nhóm T/S/G' : 'Hạng L1–L3'}`, entity: 'BUILDING', id, before: { [attr]: before }, after: { [attr]: value, effectiveFrom } });
}

export function setAccount(draft, env, id, accountId, from) {
  const b = find(draft, id);
  const before = b.customerAccountId;
  b.accountHistory = b.accountHistory || [];
  if (before) b.accountHistory.push({ accountId: before, to: from });
  b.customerAccountId = accountId; b.accountFrom = from || env.today;
  logAudit(draft, env, { action: 'Đổi TK nhận tiền khách', entity: 'BUILDING', id, before: { accountId: before }, after: { accountId, from: b.accountFrom } });
}

export function setAmenity(draft, env, id, key, on) {
  const b = find(draft, id);
  b.amenities = { ...b.amenities, [key]: on };
  logAudit(draft, env, { action: `${on ? 'Bật' : 'Tắt'} tiện ích ${AMENITIES.find((a) => a[0] === key)?.[1]}`, entity: 'BUILDING', id, after: { [key]: on } });
}

export function setReadingDay(draft, env, id, day) {
  const b = find(draft, id);
  if (!Number.isInteger(day) || day < 1 || day > 31) throw new DomainError('Ngày chốt từ 1 đến 31');
  const before = b.meterReadingDay; b.meterReadingDay = day;
  logAudit(draft, env, { action: 'Đổi ngày chốt chỉ số (áp kỳ chưa chốt)', entity: 'BUILDING', id, before: { day: before }, after: { day } });
}

/** Mô phỏng FR20: gán phụ trách chính. */
export function assignManager(draft, env, id, employeeId, from) {
  find(draft, id);
  for (const a of draft.buildingAssignments.filter((x) => x.buildingId === id && x.role === 'Phụ trách chính' && !x.to && x.from < from)) {
    const d = new Date(`${from}T00:00:00Z`); d.setUTCDate(d.getUTCDate() - 1); a.to = d.toISOString().slice(0, 10);
  }
  draft.buildingAssignments.push({ buildingId: id, employeeId, role: 'Phụ trách chính', from, to: null, simulated: true });
  logAudit(draft, env, { action: 'Phân công phụ trách chính (mô phỏng FR20)', entity: 'BUILDING', id, after: { employeeId, from } });
}

/** Tài liệu hiện hành (bản mới nhất, chưa bị thay) theo loại và liên kết. */
export function currentDocs(state, { buildingId, landlordId, headLeaseId }) {
  return state.documents.filter((d) => !d.superseded
    && ((buildingId && d.links.buildingId === buildingId) || (landlordId && d.links.landlordId === landlordId) || (headLeaseId && d.links.headLeaseId === headLeaseId)));
}

const BASIS = {
  'Giấy chứng nhận nhà đất/sổ đỏ': 'Đ.1 · số, nơi cấp, ngày trống',
  'Hồ sơ PCCC': 'Đ.6.1 · bên A lo PCCC',
  'Giấy đăng ký hộ kinh doanh': 'Đ.6.1 · bên A đăng ký KD, nộp thuế',
  'Phụ lục góp vốn 3 bên': 'Đ.7.2 · module Cổ đông',
};
const CHECKLIST = ['Giấy chứng nhận nhà đất/sổ đỏ', 'Hồ sơ PCCC', 'Giấy đăng ký hộ kinh doanh', 'Hợp đồng thuê nhà đầu vào đã ký', 'Biên bản bàn giao/kiểm kê tài sản', 'Phụ lục góp vốn 3 bên'];

/** Checklist pháp lý: trạng thái đăng ký và trạng thái xác minh là hai cột khác nhau. */
export function legalChecklist(state, b) {
  const docs = currentDocs(state, { buildingId: b.id });
  return CHECKLIST.map((type) => {
    const d = docs.filter((x) => x.type === type).sort((x, y) => y.version - x.version)[0];
    const t = docType(type);
    let reg;
    if (t.later && !d) reg = 'Làm sau';
    else if (!d) reg = 'Chưa có';
    else if (type === 'Giấy đăng ký hộ kinh doanh') reg = 'Đã đăng ký (theo tài liệu)';
    else reg = 'Có file';
    const basis = d?.source ? (type === 'Biên bản bàn giao/kiểm kê tài sản' ? '13 hạng mục' : `Job ${d.source}`) : (d?.basis || BASIS[type] || '—');
    return { type, short: t.short, doc: d || null, reg, verify: d ? d.verifyStatus : null, basis };
  });
}

/** 04.3 — lưu tài liệu: Chờ xác minh; thay thế giữ version; HKD cập nhật trạng thái đăng ký của tòa. */
export function addDocument(draft, env, d) {
  if (!d.type) throw new DomainError('Bắt buộc chọn loại tài liệu');
  if (!d.fileName) throw new DomainError('Bắt buộc chọn file');
  let version = 1; let prevId = null;
  if (d.replaceId) {
    const prev = draft.documents.find((x) => x.id === d.replaceId);
    if (prev.verifyStatus === 'Đã xác minh' && !String(d.replaceReason || '').trim()) throw new DomainError('Thay tài liệu đã xác minh phải có lý do');
    prev.superseded = true; version = prev.version + 1; prevId = prev.id;
  }
  const id = nextCode(draft, 'DOC', 'DOC-', 4);
  const doc = {
    id, type: d.type, links: { buildingId: d.buildingId || null, landlordId: d.landlordId || null, headLeaseId: d.headLeaseId || null },
    fileName: d.fileName, sizeKb: d.sizeKb, version, prevId, verifyStatus: 'Chờ xác minh',
    issuedDate: d.issuedDate || null, expiryDate: d.expiryDate || null, note: d.note || '', replaceReason: d.replaceReason || '',
    uploadedBy: env.actor.name, uploadedAt: env.now,
  };
  draft.documents.push(doc);
  if (d.type === 'Giấy đăng ký hộ kinh doanh' && d.buildingId) {
    const b = find(draft, d.buildingId);
    b.hkdRegistration = 'Đã đăng ký (theo tài liệu)';
  }
  logAudit(draft, env, { action: d.replaceId ? `Thay tài liệu (v${version})` : 'Tải tài liệu', entity: 'DOCUMENT', id, after: { type: d.type, file: d.fileName }, reason: d.replaceReason || '' });
  return doc;
}

export function verifyDocument(draft, env, docId) {
  const d = draft.documents.find((x) => x.id === docId);
  if (!d) throw new DomainError('Không tìm thấy tài liệu');
  const before = d.verifyStatus; d.verifyStatus = 'Đã xác minh';
  logAudit(draft, env, { action: 'Xác minh tài liệu', entity: 'DOCUMENT', id: docId, before: { verifyStatus: before }, after: { verifyStatus: d.verifyStatus } });
}
