// FR02 — Chủ nhà. Logic thuần trên state/draft, không đụng DOM.
import { nextCode, logAudit, DomainError } from '../audit.mjs';
import { normalizePhone, digits, fold, addDays } from '../format.mjs';

export const ACTIVE = 'Hoạt động';
export const STOPPED = 'Ngừng hoạt động';

export const leasesOf = (state, landlordId) => state.headLeases.filter((h) => h.landlordId === landlordId);
export const hasEffectiveLease = (state, landlordId) => leasesOf(state, landlordId).some((h) => h.status === 'Hiệu lực');

/**
 * Nhãn hiển thị suy ra (SRS FR02 Management Rule), không lưu:
 * stopped · missing (Thiếu HĐ đầu vào) · draft (Nháp · từ trích xuất) · active
 */
export function landlordLabel(state, l) {
  if (l.status === STOPPED) return 'stopped';
  const leases = leasesOf(state, l.id);
  if (!leases.length) return 'missing';
  if (l.source?.kind === 'extraction' && leases.some((h) => h.status === 'Nháp')) return 'draft';
  return 'active';
}

/** Tòa của chủ nhà, suy ra từ phân bổ của HĐ đầu vào (BR-2.01.4). Seed §12 có `hintBuildings` khi chưa có HĐ. */
export function landlordBuildings(state, l) {
  const ids = new Set(leasesOf(state, l.id).flatMap((h) => h.allocations.map((a) => a.buildingId)));
  (l.hintBuildings || []).forEach((id) => ids.add(id));
  return [...ids].map((id) => state.buildings.find((b) => b.id === id)).filter(Boolean);
}

/** Tài khoản nhận tiền đang hiệu lực (effectiveTo trống). */
export const currentBank = (l) => (l.bankAccounts || []).find((a) => !a.effectiveTo) || null;

/**
 * Dò trùng theo thứ tự khóa CCCD/MST → SĐT → Tên (BR-2.01.2). Trả về lần trùng đầu tiên hoặc null.
 * keys: giới hạn khóa cần dò (ví dụ chỉ ['id'] khi rời ô CCCD).
 */
export function findDuplicate(state, { idNo, taxCode, phone, name }, { excludeId = null, keys = ['id', 'phone', 'name'] } = {}) {
  const others = state.landlords.filter((l) => l.id !== excludeId);
  if (keys.includes('id')) {
    const id = digits(idNo || taxCode);
    if (id) {
      const hit = others.find((l) => id && (digits(l.idNo) === id || digits(l.taxCode) === id));
      if (hit) return { key: idNo ? 'CCCD' : 'MST', match: hit };
    }
  }
  if (keys.includes('phone')) {
    const p = normalizePhone(phone);
    if (p) {
      const hit = others.find((l) => l.phone && normalizePhone(l.phone) === p);
      if (hit) return { key: 'SĐT', match: hit };
    }
  }
  if (keys.includes('name') && name) {
    const hit = others.find((l) => fold(l.name) === fold(name));
    if (hit) return { key: 'Tên', match: hit };
  }
  return null;
}

/** Validate dữ liệu Bước 1 wizard / tạo tay. Trả về { field: message }. */
export function validateLandlord(d) {
  const e = {};
  if (!String(d.name || '').trim()) e.name = 'Bắt buộc nhập họ tên / tên pháp nhân';
  if (d.type === 'Tổ chức') {
    if (!digits(d.taxCode)) e.taxCode = 'Bắt buộc nhập MST';
    else if (![10, 13].includes(digits(d.taxCode).length)) e.taxCode = 'MST gồm 10 hoặc 13 chữ số';
    if (!String(d.representative || '').trim()) e.representative = 'Tổ chức bắt buộc có người đại diện';
  } else {
    if (!digits(d.idNo)) e.idNo = 'Bắt buộc nhập CCCD';
    else if (digits(d.idNo).length !== 12) e.idNo = 'CCCD gồm 12 chữ số';
    if (!d.idIssued) e.idIssued = 'Bắt buộc nhập ngày cấp';
    if (!String(d.idPlace || '').trim()) e.idPlace = 'Bắt buộc nhập nơi cấp';
  }
  const p = normalizePhone(d.phone);
  if (!p) e.phone = 'Bắt buộc nhập SĐT';
  else if (!/^0\d{9}$/.test(p)) e.phone = 'SĐT gồm 10 chữ số, bắt đầu bằng 0';
  if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) e.email = 'Email sai định dạng';
  return e;
}

export function createLandlord(draft, env, d, { source = { kind: 'manual' }, dupReason = '' } = {}) {
  const id = nextCode(draft, 'LL', 'LL-', 4);
  const l = {
    id, type: d.type || 'Cá nhân', name: String(d.name).trim(),
    idNo: digits(d.idNo) || null, idIssued: d.idIssued || null, idPlace: d.idPlace || null,
    taxCode: digits(d.taxCode) || null, legalName: d.legalName || null, representative: d.representative || null,
    phone: normalizePhone(d.phone) || null, email: d.email || null,
    address: d.address || null, contactAddress: d.contactAddress || null,
    defaultCycle: d.defaultCycle || null, method: d.method || null,
    bankAccounts: [], status: ACTIVE, source, hintBuildings: [],
    createdBy: env.actor.id, createdAt: env.now,
  };
  if (d.bank?.no) l.bankAccounts.push({ bank: d.bank.bank, no: digits(d.bank.no), holder: d.bank.holder, effectiveFrom: d.bank.effectiveFrom || env.today, effectiveTo: null });
  draft.landlords.push(l);
  logAudit(draft, env, { action: 'Tạo chủ nhà', entity: 'LANDLORD', id, after: { name: l.name, source: source.kind }, reason: dupReason, source: source.jobId || '' });
  return l;
}

/** BR-2.01.3: đổi STK → bản ghi mới có ngày hiệu lực, đóng bản ghi cũ, không sửa đè. */
export function addBankAccount(draft, env, landlordId, acc) {
  const l = draft.landlords.find((x) => x.id === landlordId);
  if (!l) throw new DomainError('Không tìm thấy chủ nhà');
  if (!String(acc.bank || '').trim() || !digits(acc.no) || !String(acc.holder || '').trim()) throw new DomainError('Nhập đủ ngân hàng, số TK và chủ TK');
  const from = acc.effectiveFrom || env.today;
  const prev = currentBank(l);
  if (prev) {
    if (prev.effectiveFrom >= from) throw new DomainError('Ngày hiệu lực phải sau ngày hiệu lực của tài khoản hiện tại');
    prev.effectiveTo = addDays(from, -1);
  }
  const next = { bank: acc.bank.trim(), no: digits(acc.no), holder: acc.holder.trim().toUpperCase(), effectiveFrom: from, effectiveTo: null };
  l.bankAccounts.push(next);
  logAudit(draft, env, { action: prev ? 'Đổi tài khoản nhận' : 'Bổ sung tài khoản nhận', entity: 'LANDLORD', id: l.id, before: prev ? { no: prev.no } : null, after: { no: next.no, from } });
  return next;
}

export function deactivateLandlord(draft, env, landlordId, reason) {
  const l = draft.landlords.find((x) => x.id === landlordId);
  if (!String(reason || '').trim()) throw new DomainError('Bắt buộc nhập lý do');
  if (hasEffectiveLease(draft, landlordId)) throw new DomainError('Chủ nhà còn HĐ đầu vào hiệu lực (BR-2.01.6)');
  const before = l.status;
  l.status = STOPPED;
  logAudit(draft, env, { action: 'Ngừng hoạt động', entity: 'LANDLORD', id: l.id, before: { status: before }, after: { status: STOPPED }, reason });
}

export function reopenLandlord(draft, env, landlordId, reason) {
  const l = draft.landlords.find((x) => x.id === landlordId);
  if (!String(reason || '').trim()) throw new DomainError('Bắt buộc nhập lý do');
  l.status = ACTIVE;
  logAudit(draft, env, { action: 'Mở lại chủ nhà', entity: 'LANDLORD', id: l.id, before: { status: STOPPED }, after: { status: ACTIVE }, reason });
}

/** Tìm kiếm 02.1: tên chứa (tương đối), SĐT = , CCCD/MST = (tuyệt đối). */
export function matchesKeyword(l, kw) {
  const k = String(kw || '').trim();
  if (!k) return true;
  const d = digits(k);
  return fold(l.name).includes(fold(k))
    || (d && normalizePhone(l.phone) === normalizePhone(k))
    || (d && (digits(l.idNo) === d || digits(l.taxCode) === d));
}
