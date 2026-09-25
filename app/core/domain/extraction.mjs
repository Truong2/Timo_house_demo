// FR03 — Job trích xuất HĐ chủ nhà: Upload → Trích xuất → Review → Validate → Commit.
// Trích xuất là MÔ PHỎNG: mọi file đều trả về trường của mẫu tùng sói (UI gắn chip).
import { nextCode, logAudit, DomainError } from '../audit.mjs';
import { createLandlord, findDuplicate } from './landlords.mjs';
import { addMonths, addDays } from '../format.mjs';
import { LANDLORD, PARTY_B, BUILDING, LEASE, FIELDS, HANDOVER, CONFLICTS, RAW, SRC } from '../../data/landlord-tungsoi.mjs';

export const STEPS = ['Upload', 'Trích xuất', 'Review', 'Validate', 'Commit'];
/** Tên trạng thái job chưa có trong SRS (đỏ) — dùng tạm, UI gắn chip. */
export const JOB_STATUS = ['Chờ upload', 'Đang trích xuất', 'Đang review', 'Đã validate', 'Đã commit'];

export const fieldRows = () => FIELDS.flatMap((g) => g.rows);
export function counters(job) {
  const rows = fieldRows();
  return {
    ok: rows.filter((r) => r[3] === 'ok').length,
    warn: rows.filter((r) => r[3] === 'warn').length,
    conflicts: remainingConflicts(job).length,
    annex: HANDOVER.length,
    fields: rows.length, groups: FIELDS.length,
  };
}

/** Xung đột còn chặn commit: chưa chọn, hoặc chọn phương án `blocking`. */
export function remainingConflicts(job) {
  return CONFLICTS.filter((c) => {
    const v = job.choices?.[c.id];
    if (!v) return true;
    return !!c.options.find((o) => o.v === v)?.blocking;
  });
}

const jobOf = (draft, id) => {
  const j = draft.extractionJobs.find((x) => x.id === id);
  if (!j) throw new DomainError(`Không tìm thấy job ${id}`);
  return j;
};

/** Upload: trùng hash → mở lại job cũ (trả về { job, reopened: true }). */
export function uploadFile(draft, env, file) {
  const same = draft.extractionJobs.find((j) => j.file?.hash && j.file.hash === file.hash);
  if (same) return { job: same, reopened: true };
  const id = nextCode(draft, 'LLX', 'LLX-', 3);
  const job = {
    id, file: { name: file.name, sizeKb: file.sizeKb, pages: file.pages || null, hash: file.hash },
    uploadedBy: env.actor.name, uploadedAt: env.now, step: 1, status: JOB_STATUS[1],
    choices: {}, enteredDates: null, dup: null, committed: null, createdBy: env.actor.id,
  };
  draft.extractionJobs.push(job);
  logAudit(draft, env, { action: 'Upload HĐ chủ nhà', entity: 'EXTRACTION_JOB', id, after: { file: file.name, hash: file.hash } });
  return { job, reopened: false };
}

export function runExtraction(draft, env, jobId) {
  const job = jobOf(draft, jobId);
  if (job.step !== 1) return job;
  job.step = 2; job.status = JOB_STATUS[2];
  job.file.pages = job.file.pages || SRC.pages;
  logAudit(draft, env, { action: 'Trích xuất (mô phỏng)', entity: 'EXTRACTION_JOB', id: jobId, after: { fields: fieldRows().length } });
  return job;
}

export function choose(draft, env, jobId, conflictId, value, extra = {}) {
  const job = jobOf(draft, jobId);
  if (job.committed) throw new DomainError('Job đã commit');
  job.choices[conflictId] = value;
  if (conflictId === 'dates') job.enteredDates = value === 'enter' ? extra.dates : null;
  return job;
}

export function validateJob(draft, env, jobId) {
  const job = jobOf(draft, jobId);
  const left = remainingConflicts(job);
  if (left.length) throw new DomainError(`Còn ${left.length} xung đột chưa chọn hướng xử lý`);
  job.step = 3; job.status = JOB_STATUS[3];
  return job;
}

/** Dò trùng Bên A trước commit (CCCD → SĐT → Tên). */
export const commitDuplicate = (state) => findDuplicate(state, { idNo: RAW.landlordIdNo, phone: RAW.landlordPhone, name: LANDLORD.name });

/**
 * Commit = một transaction (store.transaction bọc ngoài; throw ở đâu thì rollback toàn bộ).
 * opts.dup = { decision: 'use'|'create', existingId, reason } khi Bên A trùng. opts.failAt: hook kiểm thử rollback.
 */
export function commitJob(draft, env, jobId, { dup = null, failAt = null } = {}) {
  const job = jobOf(draft, jobId);
  if (job.committed) throw new DomainError('Job đã commit');
  const left = remainingConflicts(job);
  if (left.length) throw new DomainError(`Còn ${left.length} xung đột chưa chọn hướng xử lý`);
  const hit = commitDuplicate(draft);
  if (hit && !dup) throw new DomainError('Chủ nhà có thể bị trùng — chọn Dùng bản ghi có sẵn hoặc Vẫn tạo', 'DUP');
  const fail = (stage) => { if (failAt === stage) throw new DomainError(`Lỗi mô phỏng khi tạo ${stage} → rollback toàn bộ`, 'ROLLBACK'); };

  // 1. Chủ nhà
  let landlord;
  if (dup?.decision === 'use') {
    landlord = draft.landlords.find((l) => l.id === dup.existingId);
  } else {
    landlord = createLandlord(draft, env, {
      type: 'Cá nhân', name: LANDLORD.name, idNo: RAW.landlordIdNo, idIssued: '2021-04-19', idPlace: LANDLORD.idPlace,
      phone: RAW.landlordPhone, address: LANDLORD.address, defaultCycle: LEASE.cycle, method: LEASE.method,
    }, { source: { kind: 'extraction', jobId }, dupReason: dup?.reason || '' });
    landlord.dupCheck = hit ? `trùng ${hit.key} với ${hit.match.id} · vẫn tạo` : 'CCCD → SĐT → tên · không trùng';
  }
  fail('landlord');

  // 2. Tòa ứng viên (Chuẩn bị) — chỉ có những gì HĐ ghi
  const bId = nextCode(draft, 'BLD', 'bld-', 4);
  const building = {
    id: bId, code: null, codeSuggestion: BUILDING.codeExample, codeLocked: false, name: '25A Phú Diễn',
    address: BUILDING.address, addressSource: 'Đ.1', area: null, floors: null, floorArea: null,
    structure: BUILDING.structure, purpose: BUILDING.purpose, scope: BUILDING.scope,
    origin: 'extraction', jobId, status: 'Chuẩn bị', amenities: {}, customerAccountId: null,
    invoiceTemplate: null, meterReadingDay: 22, opsStartDate: null, hkdRegistration: null,
    group: null, grade: null, createdAt: env.now,
  };
  draft.buildings.push(building);
  fail('building');

  // 3. HĐ đầu vào Nháp
  const hlId = nextCode(draft, 'HL', 'HL-', 4);
  const dates = job.choices.dates === 'enter' ? job.enteredDates : null;
  const hl = {
    id: hlId, landlordId: landlord.id, allocations: [{ buildingId: bId, pct: 100, from: null }],
    partyB: { name: PARTY_B.name, idNo: RAW.partyBIdNo, phone: RAW.partyBPhone, isPerson: true },
    signer: job.choices.partyB === 'keep' ? { name: PARTY_B.name, mode: 'person' } : null,
    signerMode: job.choices.partyB, signedDate: null,
    handoverDate: dates?.handoverDate || null, startDate: null, endDate: null, billingStartMerged: true,
    months: LEASE.months, rent: LEASE.rent, cycleMonths: 3, dueWindow: { from: 1, to: 10 }, method: LEASE.method,
    deposit: { amount: LEASE.deposit, raw: LEASE.depositRaw, normalized: job.choices.deposit === 'once' ? 'once' : null },
    holdPriceMonths: null, priceSteps: [], freeMonths: [], renewNote: LEASE.renewNotice,
    status: 'Nháp', jobId, prevLeaseId: null, createdBy: env.actor.id, createdAt: env.now,
  };
  if (dates?.startDate) {
    hl.startDate = dates.startDate;
    hl.endDate = addDays(addMonths(dates.startDate, hl.months), -1);
  }
  draft.headLeases.push(hl);
  fail('headLease');

  // 4. Tài liệu
  const doc = (type, extra) => {
    const id = nextCode(draft, 'DOC', 'DOC-', 4);
    draft.documents.push({
      id, type, links: { landlordId: landlord.id, buildingId: bId, headLeaseId: hlId }, version: 1, prevId: null,
      uploadedBy: job.uploadedBy, uploadedAt: job.uploadedAt, issuedDate: null, expiryDate: null, note: '', ...extra,
    });
  };
  doc('Hợp đồng thuê nhà đầu vào đã ký', { fileName: job.file.name, sizeKb: job.file.sizeKb, pages: job.file.pages, hash: job.file.hash, verifyStatus: 'Chờ xác minh', source: jobId });
  doc('Biên bản bàn giao/kiểm kê tài sản', { fileName: 'Trong file HĐ · 13 hạng mục', verifyStatus: 'Chờ xác minh', source: jobId });
  doc('CCCD/ủy quyền bên cho thuê', { fileName: 'Trích từ HĐ (mở đầu)', verifyStatus: 'Chờ bản chụp', subtype: 'CCCD', source: jobId });
  fail('document');

  // 5. Tài sản bàn giao của chủ nhà + công tơ cấp tòa
  let aN = 0;
  for (const [stt, name, group, kind] of HANDOVER) {
    if (kind === 'meter') {
      const id = nextCode(draft, 'MT', 'MT-', 4);
      draft.meters.push({ id, buildingId: bId, roomId: null, kind: 'MAIN', utility: name === 'Công tơ điện' ? 'điện' : 'nước', code: null, unitPrice: null, handoverReading: null, sourceRef: `Nhóm 2 · STT ${stt}`, readings: [] });
      continue;
    }
    draft.assets.push({ id: nextCode(draft, 'AS', 'AS-', 4), buildingId: bId, headLeaseId: hlId, ownership: 'Chủ nhà', group, stt, name, qty: null, status: 'Chờ xác nhận', source: 'Phụ lục I' });
    aN++;
    if (aN === 1) fail('asset');
  }

  job.step = 4; job.status = JOB_STATUS[4];
  job.committed = { landlordId: landlord.id, headLeaseId: hlId, buildingId: bId, at: env.now };
  job.dup = dup;
  logAudit(draft, env, {
    action: 'Commit trích xuất HĐ chủ nhà', entity: 'EXTRACTION_JOB', id: jobId,
    after: { landlord: landlord.id, headLease: hlId, building: bId, documents: 3, assets: aN, meters: 2, rooms: 0 },
    reason: dup?.reason || '',
  });
  return job.committed;
}
