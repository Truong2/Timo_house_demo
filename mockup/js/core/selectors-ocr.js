/* Selectors – Spec v1.8 Wave 2: OCR job (§12.8), giá dịch vụ 2 lớp (§12.9), công tơ/chỉ số (§12.10), Deposit Ledger (§10.11), người thuê & điều khoản theo HĐ, matching khách (§12.8.6). */
(function (TH) {
  const F = TH.f, St = TH.store, Q = TH.q;
  const raw = c => St.rawAll(c).filter(Boolean);
  const digits = s => String(s || '').replace(/\D/g, '');
  Q.L.ocrJob = { UPLOADED: ['Đã tải', 'gray'], PROCESSING: ['Đang xử lý', 'blue'], READY_FOR_REVIEW: ['Cần rà soát', 'amber'], REVIEWING: ['Đang rà soát', 'amber'], VALIDATED: ['Đã xác nhận', 'teal'], COMMITTED: ['Đã ghi dữ liệu', 'green'], FAILED: ['Lỗi xử lý', 'red'], COMMIT_FAILED: ['Lỗi ghi dữ liệu', 'red'] };
  Q.L.ocrDecision = { create: ['Create – tạo mới', 'green'], link: ['Link – liên kết', 'blue'], update: ['Update – cập nhật', 'amber'], ignore: ['Ignore – bỏ qua', 'gray'] };
  Q.L.ocrField = { accept: ['Đã xác nhận', 'green'], edit: ['Đã sửa', 'blue'], reject: ['Bỏ qua', 'gray'], pending: ['Cần kiểm tra', 'amber'] };
  Q.L.depositLedger = { RECEIVABLE: ['Phải thu cọc', 'amber'], RECEIVED: ['Đã thu cọc', 'green'], TRANSFERRED: ['Chuyển tiếp cọc (nhận)', 'blue'], TRANSFERRED_OUT: ['Chuyển tiếp cọc (đi)', 'blue'], DEDUCTED: ['Khấu trừ', 'red'], OFFSET: ['Bù trừ công nợ', 'red'], REFUNDED: ['Đã hoàn', 'gray'], FORFEITED: ['Giữ lại', 'purple'] };
  Q.L.readingType = { OPENING: ['Đầu kỳ (bàn giao)', 'blue'], PERIOD: ['Kỳ', 'gray'], CLOSING: ['Cuối (trả phòng)', 'purple'] };
  Q.L.contractTenantRole = { primary: ['Khách đứng tên', 'blue'], cohabitant: ['Người ở cùng', 'teal'] };
  Q.L.docType = { contract: ['Hợp đồng thuê', 'blue'], landlordContract: ['HĐ đầu vào', 'purple'], hkd: ['Đăng ký HKD', 'teal'], id: ['CCCD', 'gray'], handover: ['Biên bản bàn giao', 'amber'], other: ['Khác', 'gray'] };

  /* ---------- Giá dịch vụ 2 lớp (§12.9.2): BUILDING hiệu lực → GLOBAL ---------- */
  const effective = (p, date) => p.status !== 'inactive' && (!p.effectiveFrom || p.effectiveFrom <= date) && (!p.effectiveTo || p.effectiveTo >= date);
  Q.servicePriceRecord = (serviceId, buildingId, date = F.today()) => {
    const list = raw('servicePrices').filter(p => p.serviceId === serviceId && effective(p, date));
    const b = buildingId ? list.filter(p => p.scope === 'BUILDING' && p.buildingId === buildingId).sort((a, c) => F.cmp(c.effectiveFrom, a.effectiveFrom))[0] : null;
    if (b) return b;
    const g = list.filter(p => p.scope === 'GLOBAL').sort((a, c) => F.cmp(c.effectiveFrom, a.effectiveFrom))[0];
    if (g) return g;
    const s = St.rawGet('services', serviceId); return s ? { serviceId, scope: 'GLOBAL', buildingId: null, price: Number(s.price) || 0, effectiveFrom: s.effectiveFrom, virtual: true } : null;
  };
  Q.servicePrice = (serviceId, buildingId, date) => { const r = Q.servicePriceRecord(serviceId, buildingId, date); return r ? Number(r.price) || 0 : 0; };
  Q.servicePriceByCode = (code, buildingId, date) => { const s = raw('services').find(x => x.code === code); return s ? Q.servicePrice(s.id, buildingId, date) : 0; };
  Q.servicePrices = (serviceId) => raw('servicePrices').filter(p => p.serviceId === serviceId).sort((a, b) => F.cmp(a.scope === 'GLOBAL' ? '0' : '1', b.scope === 'GLOBAL' ? '0' : '1') || F.cmp(b.effectiveFrom, a.effectiveFrom));
  Q.buildingPriceTable = (buildingId, date = F.today()) => raw('services').filter(s => s.status === 'active').map(s => { const r = Q.servicePriceRecord(s.id, buildingId, date) || {}; return { service: s, price: Number(r.price) || 0, scope: r.scope || 'GLOBAL', record: r, globalPrice: Q.servicePrice(s.id, null, date) }; });
  Q.servicePriceUsage = (serviceId, date = F.today()) => raw('buildings').filter(b => !b.stub).map(b => { const r = Q.servicePriceRecord(serviceId, b.id, date) || {}; return { building: b, price: Number(r.price) || 0, scope: r.scope || 'GLOBAL', record: r }; });

  /* ---------- Công tơ & chỉ số (§12.10) ---------- */
  Q.meter = (roomId, type) => raw('meters').find(m => m.roomId === roomId && m.type === type && m.status !== 'replaced') || null;
  Q.roomMeters = (roomId) => raw('meters').filter(m => m.roomId === roomId);
  Q.openingReadings = (contractId) => raw('meterReadings').filter(m => m.contractId === contractId && m.readingType === 'OPENING');
  Q.readingsOfContract = (contractId) => raw('meterReadings').filter(m => m.contractId === contractId).sort((a, b) => F.cmp(a.readingDate || a.period || '', b.readingDate || b.period || ''));

  /* ---------- Deposit Ledger (§10.11) ---------- */
  Q.depositLedger = (contractId) => raw('depositLedger').filter(x => x.contractId === contractId).sort((a, b) => F.cmp(a.date, b.date) || F.cmp(a.createdAt || '', b.createdAt || ''));
  Q.depositBalance = (contractId) => {
    const L = Q.depositLedger(contractId); const sum = (t) => F.sum(L.filter(x => x.type === t), x => Math.abs(Number(x.amount) || 0));
    const receivable = sum('RECEIVABLE'), received = sum('RECEIVED') + sum('TRANSFERRED'), deducted = sum('DEDUCTED'), offset = sum('OFFSET'), refunded = sum('REFUNDED'), forfeited = sum('FORFEITED'), out = sum('TRANSFERRED_OUT');
    return { receivable, received, deducted, offset, refunded, forfeited, transferredOut: out, holding: Math.max(0, received - deducted - offset - refunded - forfeited - out), unpaid: Math.max(0, receivable - received) };
  };
  Q.depositTotals = (f = {}) => { const cs = raw('contracts').filter(c => (!f.buildingId || c.buildingId === f.buildingId) && (!f.buildingIds || f.buildingIds.includes(c.buildingId))); let holding = 0, pendingRefund = 0; cs.forEach(c => { const b = Q.depositBalance(c.id); holding += b.holding; if (c.status === 'ended' && b.holding > 0) pendingRefund += b.holding; }); return { holding, pendingRefund }; };

  /* ---------- Người thuê / điều khoản / bàn giao theo HĐ ---------- */
  Q.contractTenants = (contractId) => raw('contractTenants').filter(x => x.contractId === contractId).sort((a, b) => F.cmp(a.role === 'primary' ? '0' : '1', b.role === 'primary' ? '0' : '1'));
  Q.contractCohabitants = (contractId) => Q.contractTenants(contractId).filter(x => x.role === 'cohabitant');
  Q.tenantContractsAsCohabitant = (tenantId) => raw('contractTenants').filter(x => x.tenantId === tenantId && x.role === 'cohabitant').map(x => St.rawGet('contracts', x.contractId)).filter(Boolean);
  Q.contractPaymentTerms = (contractId) => raw('contractPaymentTerms').find(x => x.contractId === contractId) || null;
  Q.contractRenewal = (contractId) => raw('contractRenewalClauses').find(x => x.contractId === contractId) || null;
  Q.contractHandoverAssets = (contractId) => raw('contractHandoverAssets').filter(x => x.contractId === contractId);
  Q.contractNoticeDays = (c) => { const r = c ? Q.contractRenewal(c.id) : null; return r && Number(r.noticeDays) > 0 ? Number(r.noticeDays) : 30; };

  /* ---------- OCR job (§12.8.3) ---------- */
  Q.ocrJob = (id) => St.rawGet('ocrJobs', id);
  Q.ocrJobs = () => raw('ocrJobs').sort((a, b) => F.cmp(b.createdAt || '', a.createdAt || ''));
  Q.ocrJobByHash = (hash) => hash ? raw('ocrJobs').find(j => j.fileHash === hash && !['FAILED'].includes(j.status)) || null : null;
  Q.ocrPending = () => raw('ocrJobs').filter(j => ['READY_FOR_REVIEW', 'REVIEWING', 'VALIDATED', 'COMMIT_FAILED'].includes(j.status));
  Q.ocrField = (job, key) => ((job && job.fields) || []).find(f => f && f.key === key) || null;
  Q.ocrValue = (job, key) => { const f = Q.ocrField(job, key); return f ? (f.value == null ? '' : String(f.value)) : ''; };

  /* ---------- Matching khách hàng §12.8.6: CCCD → SĐT → Họ tên + Ngày sinh; xung đột CCCD trùng nhưng tên/SĐT khác ---------- */
  Q.tenantMatch = (d = {}, excludeId) => {
    const id = digits(d.idNumber), ph = digits(d.phone), name = F.norm(d.name || ''), dob = F.fromVN(d.dob || '') || d.dob || '';
    const ts = raw('tenants').filter(t => t.id !== excludeId);
    const conflicts = []; let match = null, matchBy = null, score = 0;
    if (id.length >= 9) { match = ts.find(t => digits(t.idNumber) === id) || null; if (match) { matchBy = 'CCCD'; score = 0.95; if (ph && digits(match.phone) !== ph) conflicts.push({ field: 'phone', system: match.phone, ocr: d.phone, msg: 'CCCD trùng nhưng SĐT khác' }); if (name && F.norm(match.name) !== name) conflicts.push({ field: 'name', system: match.name, ocr: d.name, msg: 'CCCD trùng nhưng họ tên khác' }); } }
    if (!match && ph.length >= 9) { match = ts.find(t => digits(t.phone) === ph) || null; if (match) { matchBy = 'SĐT'; score = 0.85; if (id && digits(match.idNumber) && digits(match.idNumber) !== id) conflicts.push({ field: 'idNumber', system: match.idNumber, ocr: d.idNumber, msg: 'SĐT trùng nhưng CCCD khác' }); if (name && F.norm(match.name) !== name) conflicts.push({ field: 'name', system: match.name, ocr: d.name, msg: 'SĐT trùng nhưng họ tên khác' }); } }
    if (!match && name) { const byName = ts.filter(t => F.norm(t.name) === name); const withDob = dob ? byName.find(t => t.dob === dob) : null; if (withDob) { match = withDob; matchBy = 'Họ tên + Ngày sinh'; score = 0.75; } else if (byName.length) { return { match: null, matchBy: null, score: 0.4, conflicts, weak: byName[0], candidates: byName }; } }
    // Ứng viên khác cùng CCCD/SĐT ở hồ sơ khác → cảnh báo trùng
    const others = ts.filter(t => t !== match && ((id && digits(t.idNumber) === id) || (ph && digits(t.phone) === ph)));
    others.forEach(t => conflicts.push({ field: 'duplicate', system: t.name + ' (' + t.code + ')', ocr: '', msg: 'Hồ sơ khác trùng CCCD/SĐT: ' + t.name }));
    const missing = match ? ['idNumber', 'idPlace', 'dob', 'address', 'phone'].filter(k => !match[k] && d[k]) : [];
    const diffs = match ? ['name', 'phone', 'idNumber', 'dob', 'address'].filter(k => d[k] && match[k] && (k === 'phone' || k === 'idNumber' ? digits(match[k]) !== digits(d[k]) : k === 'dob' ? match[k] !== (F.fromVN(d[k]) || d[k]) : F.norm(match[k]) !== F.norm(d[k]))).map(k => ({ field: k, system: match[k], ocr: d[k] })) : [];
    return { match, matchBy, score, conflicts, missing, diffs, candidates: match ? [match] : [] };
  };
  Q.buildingMatch = ({ code, name, address, hint } = {}) => {
    const bs = raw('buildings').filter(b => !b.stub); const n = (s) => F.norm(s || '');
    if (code) { const b = bs.find(x => n(x.code) === n(code)); if (b) return { match: b, matchBy: 'Mã tòa', score: 0.95 }; }
    if (name) { const b = bs.find(x => n(x.name) === n(name) || n(x.name).replace(/^toa\s+/, '') === n(name).replace(/^toa\s+/, '')); if (b) return { match: b, matchBy: 'Tên', score: 0.9 }; }
    if (address) { const a = n(address).replace(/[^a-z0-9]/g, ''); const b = bs.find(x => a && n(x.address).replace(/[^a-z0-9]/g, '') && (a.includes(n(x.address).replace(/[^a-z0-9]/g, '').slice(0, 18)) || n(x.address).replace(/[^a-z0-9]/g, '').includes(a.slice(0, 18)))); if (b) return { match: b, matchBy: 'Địa chỉ', score: 0.8 }; }
    if (hint && TH.ocrParser) { const b = TH.ocrParser.guessBuilding(hint); if (b) return { match: b, matchBy: 'Gợi ý từ nội dung', score: 0.7 }; }
    return { match: null, matchBy: null, score: 0 };
  };
  Q.contractDuplicates = ({ contractNo, fileHash, tenantId, roomId, start, excludeJobId } = {}) => {
    const out = [];
    if (contractNo) raw('contracts').filter(c => c.contractNo && F.norm(c.contractNo) === F.norm(contractNo)).forEach(c => out.push({ by: 'Số hợp đồng', contract: c }));
    if (fileHash) raw('ocrJobs').filter(j => j.id !== excludeJobId && j.fileHash === fileHash && j.status === 'COMMITTED' && j.result && j.result.contractId).forEach(j => { const c = St.rawGet('contracts', j.result.contractId); if (c) out.push({ by: 'File hash (job ' + j.code + ')', contract: c }); });
    if (tenantId && roomId && start) raw('contracts').filter(c => c.tenantId === tenantId && c.roomId === roomId && c.start === start).forEach(c => out.push({ by: 'Khách + phòng + ngày bắt đầu', contract: c }));
    const seen = new Set(); return out.filter(x => { if (seen.has(x.contract.id + x.by)) return false; seen.add(x.contract.id + x.by); return true; });
  };

  /* Work queue: OCR chờ review */
  const todo0 = Q.todo; Q.todo = () => { const t = todo0(); t.ocrReview = Q.ocrPending().length; t.total += t.ocrReview; return t; };
})(window.TH);
