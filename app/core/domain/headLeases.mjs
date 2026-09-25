// FR03 — HĐ đầu vào: điều kiện kích hoạt, lịch đóng tiền, điều chỉnh kỳ, thanh lý. Thuần.
import { logAudit, DomainError } from '../audit.mjs';
import { addMonths, addDays, daysBetween, pad } from '../format.mjs';
import { currentBank } from './landlords.mjs';

/** Trạng thái hiển thị: Hiệu lực còn ≤ 6 tháng tới ngày kết thúc → Sắp hết (P-23, ngưỡng chờ chốt). */
export function displayStatus(hl, today) {
  if (hl.status === 'Hiệu lực' && hl.endDate && addMonths(today, 6) >= hl.endDate) return 'Sắp hết';
  return hl.status;
}

const overlaps = (a1, a2, b1, b2) => a1 && a2 && b1 && b2 && a1 <= b2 && b1 <= a2;

/** Liệt kê MỌI điều kiện kích hoạt còn thiếu (SRS FR03 Creation Rule). */
export function activationBlockers(state, hl) {
  const out = [];
  if (!hl.startDate || !hl.endDate) {
    out.push({ code: 'dates', text: hl.handoverDate ? 'Thiếu ngày bắt đầu/kết thúc (Đ.2)' : 'Thiếu ngày giao nhà và ngày bắt đầu/kết thúc (Đ.2)' });
  }
  const l = state.landlords.find((x) => x.id === hl.landlordId);
  if (!l || !currentBank(l)) out.push({ code: 'bank', text: 'thiếu tài khoản nhận của chủ nhà' });
  if (!hl.signer?.name) {
    out.push({ code: 'signer', text: hl.partyB?.isPerson ? 'Bên B là cá nhân, chờ xác nhận người ký thay Timehouse' : 'thiếu người ký phía Timehouse' });
  }
  for (const a of hl.allocations) {
    const clash = state.headLeases.find((o) => o.id !== hl.id && o.status === 'Hiệu lực'
      && o.allocations.some((x) => x.buildingId === a.buildingId)
      && overlaps(hl.startDate, hl.endDate, o.startDate, o.endDate));
    if (clash) out.push({ code: 'overlap', text: `tòa đang thuộc HĐ ${clash.id} hiệu lực trùng thời gian (BR-2.02.1)` });
  }
  const sum = hl.allocations.reduce((s, a) => s + Number(a.pct || 0), 0);
  if (Math.round(sum * 100) !== 10000) out.push({ code: 'alloc', text: `phân bổ tiền thuê cho các tòa = ${sum} %, cần đủ 100 % (BR-2.02.2 → P-15)` });
  return out;
}

/**
 * Lịch đóng tiền (HEAD_LEASE_PAYMENT_SCHEDULE).
 * Số kỳ = thời hạn ÷ kỳ trả · ngày đến hạn = ngày `dueWindow.to` của tháng đầu kỳ ·
 * số tiền = tiền thuê × số tháng trong kỳ − tiền thuê × số tháng miễn nằm trong kỳ.
 * freeMonths là số thứ tự tháng tính từ ngày bắt đầu (1 = tháng đầu tiên).
 */
export function buildSchedule(hl) {
  if (!hl.startDate) return [];
  const cycle = hl.cycleMonths;
  const n = Math.ceil(hl.months / cycle);
  const rows = [];
  for (let i = 0; i < n; i++) {
    const first = i * cycle;
    const len = Math.min(cycle, hl.months - first);
    const from = addMonths(hl.startDate, first);
    const to = addDays(addMonths(hl.startDate, first + len), -1);
    const free = (hl.freeMonths || []).filter((m) => m > first && m <= first + len).length;
    rows.push({
      id: `${hl.id}-K${pad(i + 1)}`, headLeaseId: hl.id, no: i + 1, from, to,
      dueDate: `${from.slice(0, 7)}-${pad(hl.dueWindow.to)}`,
      months: len, freeMonths: free, amount: hl.rent * (len - free), paid: 0, docs: [], adjustments: [],
    });
  }
  return rows;
}

/** Trạng thái kỳ trả: Chưa đến hạn → Sắp đến hạn (≤ 15 ngày) → Đã trả / Trả một phần / Quá hạn. */
export function periodStatus(p, today) {
  if (p.amount <= 0 || p.paid >= p.amount) return 'Đã trả';
  if (p.paid > 0) return 'Trả một phần';
  if (today > p.dueDate) return 'Quá hạn';
  if (daysBetween(today, p.dueDate) <= 15) return 'Sắp đến hạn';
  return 'Chưa đến hạn';
}

const find = (draft, id) => {
  const hl = draft.headLeases.find((h) => h.id === id);
  if (!hl) throw new DomainError(`Không tìm thấy HĐ ${id}`);
  return hl;
};
const requireDraft = (hl) => { if (hl.status !== 'Nháp') throw new DomainError('Chỉ sửa được HĐ ở trạng thái Nháp'); };

/** Nhập ngày: ngày kết thúc = ngày bắt đầu + thời hạn − 1 ngày (dự kiến). HĐ gộp ngày tính tiền = ngày bắt đầu. */
export function setDates(draft, env, id, { startDate, handoverDate, signedDate }) {
  const hl = find(draft, id); requireDraft(hl);
  if (!startDate) throw new DomainError('Bắt buộc nhập ngày bắt đầu');
  const before = { startDate: hl.startDate, endDate: hl.endDate, handoverDate: hl.handoverDate, signedDate: hl.signedDate };
  hl.startDate = startDate;
  hl.endDate = addDays(addMonths(startDate, hl.months), -1);
  hl.handoverDate = handoverDate || startDate;
  if (signedDate) hl.signedDate = signedDate;
  logAudit(draft, env, { action: 'Nhập ngày HĐ đầu vào', entity: 'HEAD_LEASE', id, before, after: { startDate, endDate: hl.endDate, handoverDate: hl.handoverDate, signedDate: hl.signedDate }, source: 'Người dùng tự điền (Common Rule 3)' });
}

export function setSigner(draft, env, id, { name, mode = 'proxy' }) {
  const hl = find(draft, id); requireDraft(hl);
  if (!String(name || '').trim()) throw new DomainError('Bắt buộc nhập người ký phía Timehouse');
  const before = hl.signer ? { ...hl.signer } : null;
  hl.signer = { name: name.trim(), mode };
  logAudit(draft, env, { action: 'Xác nhận người ký', entity: 'HEAD_LEASE', id, before, after: hl.signer });
}

export function setTerms(draft, env, id, { freeMonths, holdPriceMonths }) {
  const hl = find(draft, id); requireDraft(hl);
  const before = { freeMonths: hl.freeMonths, holdPriceMonths: hl.holdPriceMonths };
  if (freeMonths) hl.freeMonths = freeMonths.filter((m) => m >= 1 && m <= hl.months);
  if (holdPriceMonths !== undefined) hl.holdPriceMonths = holdPriceMonths;
  logAudit(draft, env, { action: 'Sửa điều khoản giá', entity: 'HEAD_LEASE', id, before, after: { freeMonths: hl.freeMonths, holdPriceMonths: hl.holdPriceMonths }, source: 'Người dùng tự điền (Common Rule 3)' });
}

/** Kích hoạt: Nháp → Hiệu lực và sinh lịch đóng tiền. */
export function activate(draft, env, id) {
  const hl = find(draft, id); requireDraft(hl);
  const blockers = activationBlockers(draft, hl);
  if (blockers.length) throw new DomainError(`Chưa kích hoạt được: ${blockers.map((b) => b.text).join(' · ')}`);
  hl.status = 'Hiệu lực';
  hl.activatedAt = env.now;
  draft.headLeasePaymentSchedule = draft.headLeasePaymentSchedule.filter((p) => p.headLeaseId !== id).concat(buildSchedule(hl));
  logAudit(draft, env, { action: 'Kích hoạt HĐ đầu vào', entity: 'HEAD_LEASE', id, before: { status: 'Nháp' }, after: { status: 'Hiệu lực', periods: Math.ceil(hl.months / hl.cycleMonths) } });
}

/** BR-2.02.3: kế toán sửa từng kỳ có lý do, không sửa kỳ đã trả. */
export function adjustPeriod(draft, env, periodId, amount, reason) {
  const p = draft.headLeasePaymentSchedule.find((x) => x.id === periodId);
  if (!p) throw new DomainError('Không tìm thấy kỳ');
  if (p.paid > 0) throw new DomainError('Không sửa kỳ đã trả (BR-2.02.3)');
  if (!String(reason || '').trim()) throw new DomainError('Bắt buộc nhập lý do');
  if (!Number.isFinite(amount) || amount < 0) throw new DomainError('Số tiền không hợp lệ');
  p.adjustments.push({ old: p.amount, new: amount, reason, by: env.actor.name, at: env.now });
  logAudit(draft, env, { action: `Điều chỉnh kỳ ${p.no}`, entity: 'HEAD_LEASE_PAYMENT_SCHEDULE', id: p.id, before: { amount: p.amount }, after: { amount }, reason });
  p.amount = amount;
}

const OCCUPIED = ['Đang thuê', 'Giữ chỗ', 'Trống hết tháng'];
/** Thanh lý sớm: mọi phòng phải hết HĐ thuê → HĐ Kết thúc, tòa Ngừng khai thác (BR-2.02.11). */
export function liquidate(draft, env, id, reason) {
  const hl = find(draft, id);
  if (hl.status !== 'Hiệu lực') throw new DomainError('Chỉ thanh lý HĐ đang hiệu lực');
  if (!String(reason || '').trim()) throw new DomainError('Bắt buộc nhập lý do');
  const bIds = hl.allocations.map((a) => a.buildingId);
  const busy = draft.rooms.filter((r) => bIds.includes(r.buildingId) && OCCUPIED.includes(r.status));
  if (busy.length) throw new DomainError(`Còn ${busy.length} phòng chưa hết HĐ thuê (${busy.slice(0, 3).map((r) => r.id).join(', ')}…)`);
  hl.status = 'Kết thúc';
  hl.endedEarly = { at: env.today, reason };
  for (const b of draft.buildings.filter((x) => bIds.includes(x.id))) {
    b.status = 'Ngừng khai thác';
    logAudit(draft, env, { action: 'Tòa ngừng khai thác do thanh lý HĐ', entity: 'BUILDING', id: b.id, after: { status: b.status }, reason });
  }
  logAudit(draft, env, { action: 'Thanh lý sớm HĐ đầu vào', entity: 'HEAD_LEASE', id, before: { status: 'Hiệu lực' }, after: { status: 'Kết thúc' }, reason });
}
