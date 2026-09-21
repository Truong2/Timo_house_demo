/* Actions – Spec v1.8 Wave 2: OCR Data Onboarding (§12.8: job UPLOADED→PROCESSING→READY_FOR_REVIEW→REVIEWING→VALIDATED→COMMITTED, FAILED/COMMIT_FAILED),
   commit 1 transaction có rollback (§12.8.9), giá dịch vụ 2 lớp (§12.9), Deposit Ledger (§10.11), người thuê theo HĐ (§4.8), chỉ số OPENING (§12.8.11).
   Ném Error khi vi phạm; UI bắt và toast. Thay thế X.ocr* của Phase 2 cũ. */
(function (TH) {
  const F = TH.f, Q = TH.q, St = TH.store, Au = TH.auth, X = TH.actions, P = TH.ocrParser, O = TH.ocrOnb;
  const err = (m) => { throw new Error(m); };
  const req = (v, m) => { if (v === undefined || v === null || v === '' || (typeof v === 'number' && isNaN(v))) err(m); return v; };
  const me = () => (St.state.session || {}).userId || null;
  const meName = () => (St.state.session || {}).name || 'Hệ thống';
  const done = () => { St.save(); St.emit('change'); };
  const yearCode = (date = F.today()) => String(date || F.today()).slice(0, 4);
  const digits = s => String(s || '').replace(/\D/g, '');
  const job = (id) => { const j = St.rawGet('ocrJobs', id); if (!j) err('Không tìm thấy OCR job'); return j; };
  const trace = (j, extra = {}) => Object.assign({ sourceOcr: { jobId: j.id, jobCode: j.code, file: j.fileName, hash: j.fileHash } }, extra);
  const wrap = (name, after) => { const orig = X[name]; if (!orig) return; X[name] = function () { const res = orig.apply(this, arguments); try { after(res, arguments); } catch (e) { console.warn('hook', name, e); } return res; }; };

  /* ================= Giá dịch vụ 2 lớp (§12.9) ================= */
  X.saveServicePrice = ({ serviceId, scope = 'GLOBAL', buildingId = null, price, effectiveFrom, reason = '', silent = false, sourceOcr = null }) => {
    if (!silent) Au.need('manageCatalog');
    req(serviceId, 'Chọn dịch vụ'); req(effectiveFrom, 'Ngày hiệu lực là bắt buộc'); if (!(Number(price) >= 0)) err('Giá không hợp lệ');
    if (scope === 'BUILDING') req(buildingId, 'Chọn tòa áp dụng');
    const same = St.rawAll('servicePrices').filter(p => p && p.serviceId === serviceId && p.scope === scope && (scope === 'GLOBAL' || p.buildingId === buildingId) && p.status !== 'inactive');
    if (same.some(p => p.effectiveFrom === effectiveFrom)) err('Đã có bảng giá cùng phạm vi hiệu lực từ ' + F.date(effectiveFrom) + ' – chọn ngày khác hoặc ngừng hiệu lực dòng cũ');
    // Không ghi đè lịch sử: dòng đang hiệu lực được đóng vào ngày hiệu lực − 1
    same.filter(p => (!p.effectiveTo || p.effectiveTo >= effectiveFrom) && p.effectiveFrom < effectiveFrom).forEach(p => { p.effectiveTo = F.addDays(effectiveFrom, -1); p.closedBy = me(); });
    const rec = St.add('servicePrices', { serviceId, scope, buildingId: scope === 'BUILDING' ? buildingId : null, price: Number(price), effectiveFrom, effectiveTo: '', status: 'active', approvedBy: me(), reason, sourceOcr: sourceOcr || null });
    const s = St.rawGet('services', serviceId) || {}; const b = buildingId ? Q.building(buildingId) : null;
    St.add('priceHistory', { serviceId, date: effectiveFrom, price: Number(price), scope: scope === 'GLOBAL' ? 'Tất cả tòa nhà' : (b ? b.name : ''), userId: me(), userName: meName() });
    if (scope === 'GLOBAL' && s.id) { s.price = Number(price); }
    St.audit('price', 'service', serviceId, 'Đổi giá ' + (s.name || '') + (scope === 'BUILDING' ? ' riêng ' + (b ? b.name : '') : ' mặc định') + ' → ' + F.vnd(Number(price)) + ' từ ' + F.date(effectiveFrom), { before: same.length ? { price: same[0].price, effectiveFrom: same[0].effectiveFrom } : null, after: { price: Number(price), effectiveFrom }, reason, sourceOcr: sourceOcr || undefined });
    done(); return rec;
  };
  X.endServicePrice = (id, effectiveTo = F.today(), reason = '') => { Au.need('manageCatalog'); const p = St.rawGet('servicePrices', id); if (!p) err('Không tìm thấy bảng giá'); if (p.scope === 'GLOBAL') err('Không ngừng giá mặc định – hãy đổi giá mặc định thay vì ngừng'); Object.assign(p, { effectiveTo, status: 'inactive', closedBy: me(), closeReason: reason }); const s = St.rawGet('services', p.serviceId) || {}; St.audit('price_end', 'service', p.serviceId, 'Ngừng giá riêng ' + (s.name || '') + ' của ' + Q.building(p.buildingId).name + ' từ ' + F.date(effectiveTo), { reason }); done(); return p; };

  /* ================= Deposit Ledger (§10.11) ================= */
  X.depositEntry = ({ contractId, type, amount, date, refType = null, refId = null, note = '', sourceOcr = null }) => {
    const c = St.rawGet('contracts', contractId); if (!c) err('Không tìm thấy hợp đồng'); req(type, 'Loại bút toán cọc'); if (!(Number(amount) !== 0)) err('Số tiền cọc không hợp lệ');
    const sign = ['RECEIVABLE', 'RECEIVED', 'TRANSFERRED'].includes(type) ? 1 : -1;
    const e = St.add('depositLedger', { contractId, tenantId: c.tenantId, buildingId: c.buildingId, roomId: c.roomId, type, amount: sign * Math.abs(Number(amount)), date: date || F.today(), refType, refId, note, createdBy: me(), sourceOcr: sourceOcr || null });
    St.audit('deposit_ledger', 'contract', contractId, 'Cọc ' + Q.label('depositLedger', type) + ' ' + F.vnd(Math.abs(Number(amount))) + ' – ' + c.code, { after: { type, amount: e.amount, date: e.date }, sourceOcr: sourceOcr || undefined });
    return e;
  };
  /* Hook các action hiện có để ledger luôn khớp: kích hoạt (RECEIVABLE/RECEIVED), gia hạn (TRANSFERRED), duyệt/hoàn cọc (DEDUCTED/OFFSET/REFUNDED) */
  wrap('activateContract', (c) => { if (!c || c.duplicate) return; const L = Q.depositLedger(c.id); if (!(Number(c.deposit) > 0)) return; if (c.depositCarriedFrom) { if (!L.some(x => x.type === 'TRANSFERRED')) { X.depositEntry({ contractId: c.id, type: 'TRANSFERRED', amount: c.deposit, date: c.start, refType: 'contract', refId: c.renewedFromId, note: 'Chuyển tiếp cọc từ ' + c.depositCarriedFrom }); const prev = St.rawGet('contracts', c.renewedFromId); if (prev && !Q.depositLedger(prev.id).some(x => x.type === 'TRANSFERRED_OUT')) X.depositEntry({ contractId: prev.id, type: 'TRANSFERRED_OUT', amount: c.deposit, date: c.start, refType: 'contract', refId: c.id, note: 'Chuyển cọc sang ' + c.code }); } return; } if (!L.some(x => x.type === 'RECEIVABLE')) X.depositEntry({ contractId: c.id, type: 'RECEIVABLE', amount: c.deposit, date: c.signedDate || c.start, refType: 'contract', refId: c.id, note: 'Cọc theo hợp đồng' }); if (c.depositPaymentId && !L.some(x => x.type === 'RECEIVED')) X.depositEntry({ contractId: c.id, type: 'RECEIVED', amount: c.deposit, date: c.depositPaidAt || F.today(), refType: 'payment', refId: c.depositPaymentId, note: 'Phiếu thu cọc' }); });
  wrap('approveRefund', (rf) => { if (!rf) return; const ded = F.sum(Q.refundDeductions(rf.id), d => d.amount); const debt = rf.offsetDebt ? (rf.debt || 0) : 0; const L = Q.depositLedger(rf.contractId); if (ded > 0 && !L.some(x => x.type === 'DEDUCTED' && x.refId === rf.id)) X.depositEntry({ contractId: rf.contractId, type: 'DEDUCTED', amount: ded, date: F.today(), refType: 'refund', refId: rf.id, note: 'Khấu trừ theo hồ sơ ' + rf.code }); if (debt > 0 && !L.some(x => x.type === 'OFFSET' && x.refId === rf.id)) X.depositEntry({ contractId: rf.contractId, type: 'OFFSET', amount: debt, date: F.today(), refType: 'refund', refId: rf.id, note: 'Bù trừ công nợ ' + rf.code }); });
  wrap('recordRefundPaid', (rf) => { if (!rf) return; if (!Q.depositLedger(rf.contractId).some(x => x.type === 'REFUNDED' && x.refId === rf.id)) X.depositEntry({ contractId: rf.contractId, type: 'REFUNDED', amount: rf.refundAmount || 0, date: rf.paidDate || F.today(), refType: 'refund', refId: rf.id, note: 'Hoàn cọc ' + rf.code + (rf.paidRef ? ' · ' + rf.paidRef : '') }); });
  X.recordDepositReceived = ({ contractId, amount, date, method = 'Chuyển khoản', ref = '' }) => { Au.need('recordPayment'); const c = St.rawGet('contracts', contractId); if (!c) err('Không tìm thấy hợp đồng'); const bal = Q.depositBalance(contractId); const amt = Number(amount) || 0; if (amt <= 0) err('Số tiền phải > 0'); if (amt > bal.unpaid + 0.5) err('Vượt số cọc còn phải thu (' + F.vnd(bal.unpaid) + ')'); const e = X.depositEntry({ contractId, type: 'RECEIVED', amount: amt, date, refType: 'manual', refId: ref || null, note: 'Thu cọc ' + method + (ref ? ' · ' + ref : '') }); if (!c.depositPaidAt && Q.depositBalance(contractId).unpaid <= 0) c.depositPaidAt = date; done(); return e; };

  /* ================= Người thuê theo HĐ (§4.8) ================= */
  const syncContractTenants = (c, members) => {
    const cur = St.rawAll('contractTenants').filter(x => x && x.contractId === c.id);
    if (!cur.some(x => x.role === 'primary')) St.add('contractTenants', { contractId: c.id, tenantId: c.tenantId, role: 'primary', name: Q.tenant(c.tenantId).name || '', from: c.start, to: '', note: '' });
    else cur.filter(x => x.role === 'primary').forEach(x => { x.tenantId = c.tenantId; x.name = Q.tenant(c.tenantId).name || x.name; });
    (members || []).filter(m => m && m.name && !/chính/i.test(m.relation || '')).forEach(m => {
      if (cur.some(x => x.role === 'cohabitant' && F.norm(x.name) === F.norm(m.name))) return;
      const r = Q.tenantMatch({ name: m.name, phone: m.phone, idNumber: m.idNumber, dob: m.dob });
      St.add('contractTenants', { contractId: c.id, tenantId: r.match ? r.match.id : (m.tenantId || null), role: 'cohabitant', name: m.name, dob: m.dob || '', idNumber: m.idNumber || '', phone: m.phone || '', relation: m.relation || '', from: c.start, to: '', note: r.match || m.tenantId ? '' : 'Chưa liên kết hồ sơ khách' });
    });
  };
  wrap('saveContractDraft', (c, args) => { if (c) syncContractTenants(c, (args[0] || {}).members); });
  X.addContractTenant = ({ contractId, tenantId, newTenant, relation = 'Người ở cùng', from }) => {
    Au.need('contracts.manage', { type: 'contract', record: St.get('contracts', contractId) }); const c = St.rawGet('contracts', contractId); if (!c) err('Không tìm thấy hợp đồng');
    let t = tenantId ? St.rawGet('tenants', tenantId) : null;
    if (!t && newTenant) { const r = Q.tenantMatch(newTenant); if (r.match) t = r.match; else t = X.saveTenant(Object.assign({ note: 'Người ở cùng HĐ ' + c.code }, newTenant)); }
    if (!t) err('Chọn khách có sẵn hoặc nhập hồ sơ mới');
    if (t.id === c.tenantId) err('Khách đứng tên đã là thành viên chính');
    if (St.rawAll('contractTenants').some(x => x && x.contractId === contractId && x.tenantId === t.id)) err(t.name + ' đã có trong hợp đồng');
    const ct = St.add('contractTenants', { contractId, tenantId: t.id, role: 'cohabitant', name: t.name, dob: t.dob || '', idNumber: t.idNumber || '', phone: t.phone || '', relation, from: from || F.today(), to: '', note: '' });
    St.audit('add_tenant', 'contract', contractId, 'Thêm người ở cùng ' + t.name + ' vào ' + c.code); done(); return ct;
  };
  X.removeContractTenant = (id, to = F.today()) => { const ct = St.rawGet('contractTenants', id); if (!ct) err('Không tìm thấy'); if (ct.role === 'primary') err('Không gỡ khách đứng tên'); const c = St.rawGet('contracts', ct.contractId); Au.need('contracts.manage', { type: 'contract', record: c }); ct.to = to; ct.note = (ct.note ? ct.note + ' · ' : '') + 'Rời đi ' + F.date(to); St.audit('remove_tenant', 'contract', ct.contractId, 'Người ở cùng ' + ct.name + ' rời HĐ ' + (c || {}).code); done(); return ct; };
  X.linkContractTenant = (id, tenantId) => { const ct = St.rawGet('contractTenants', id); if (!ct) err('Không tìm thấy'); const t = St.rawGet('tenants', tenantId); if (!t) err('Không tìm thấy khách'); ct.tenantId = t.id; ct.name = t.name; ct.note = ''; St.audit('link_tenant', 'contract', ct.contractId, 'Liên kết người ở cùng ' + t.name + ' với hồ sơ ' + t.code); done(); return ct; };

  /* ================= OCR Job (§12.8.3) ================= */
  const ENGINE = 'mock-1';
  X.ocrUpload = ({ fileName, size, sample, text, pages, docType = 'contract', simulated = false }) => {
    Au.need('ocr.use'); req(fileName, 'Chọn file'); if (size && size > 20 * 1024 * 1024) err('File tối đa 20MB (FR-DOC-01)');
    if (!/\.(pdf|txt|jpe?g|png)$/i.test(fileName)) err('Chỉ nhận PDF, JPG/PNG hoặc .txt');
    const body = sample ? (TH.ocr ? TH.ocr.sampleText() : '') : String(text || ''); if (!body.trim()) err('Không đọc được nội dung văn bản của file');
    const fileHash = P.hashText((sample ? 'sample:' : '') + body);
    const dup = Q.ocrJobByHash(fileHash);
    if (dup) return Object.assign({ duplicate: true }, dup);
    const j = St.add('ocrJobs', { code: St.nextCode('ocrJobs', 'OCR-' + yearCode() + '-', 3), fileName, size: size ? (size / 1024 / 1024).toFixed(1) + ' MB' : '0.3 MB', pages: pages || 4, sample: !!sample, simulated: !!simulated, text: sample ? '' : body, docType, engine: ENGINE, fileHash, idempotencyKey: 'ocr:' + fileHash, status: 'UPLOADED', error: '', fields: [], assets: [], decisions: {}, result: null, uploadedBy: me(), uploadedAt: F.nowISO(), processedAt: null, processingMs: null, reviewedBy: null, validatedAt: null, committedAt: null });
    St.audit('upload', 'ocr', j.id, 'Tải file ' + fileName + ' (' + Q.label('docType', docType) + ', hash ' + fileHash.slice(0, 8) + ')'); done(); return j;
  };
  X.ocrExtract = (id) => { Au.need('ocr.use'); const j = job(id); if (!['UPLOADED', 'FAILED'].includes(j.status)) return j; j.status = 'PROCESSING'; j.error = ''; j.processingStartedAt = Date.now(); St.save(); St.emit('change', { source: 'timer' }); return j; };
  X.ocrFinish = (id, opts = {}) => {
    const j = job(id); if (!P) err('Thiếu module trích xuất');
    try {
      if (opts.simulateFail) err('Engine mock-1 timeout khi đọc trang 2 (mô phỏng lỗi PROCESSING → FAILED)');
      const r = P.parse(j.sample || j.simulated ? TH.ocr.sampleText() : (j.text || ''));
      j.fields = r.fields; j.assets = r.assets; j.buildingHint = r.buildingHint || ''; j.decisions = {}; O.initDecisions(j);
      j.status = 'READY_FOR_REVIEW'; j.processedAt = F.nowISO(); j.processingMs = j.processingStartedAt ? Date.now() - j.processingStartedAt : 1800; j.error = '';
      St.audit('extract', 'ocr', id, 'Trích xuất ' + r.meta.found + '/' + r.meta.total + ' trường (' + r.meta.pending + ' cần kiểm tra, ' + r.assets.length + ' tài sản) – engine ' + ENGINE);
    } catch (e) { j.status = 'FAILED'; j.error = e.message; St.audit('extract_failed', 'ocr', id, 'Trích xuất lỗi: ' + e.message); }
    done(); return j;
  };
  X.ocrRetry = (id) => { Au.need('ocr.use'); const j = job(id); if (!['FAILED', 'COMMIT_FAILED'].includes(j.status)) err('Chỉ xử lý lại job Lỗi'); if (j.status === 'COMMIT_FAILED') { j.status = 'VALIDATED'; j.error = ''; St.audit('retry', 'ocr', id, 'Thử lại commit'); done(); return j; } j.status = 'UPLOADED'; j.error = ''; St.audit('retry', 'ocr', id, 'Xử lý lại trích xuất'); done(); return X.ocrExtract(id); };
  X.ocrRerun = (id) => { Au.need('ocr.use'); const j = job(id); if (j.status === 'COMMITTED') err('Job đã ghi dữ liệu'); j.status = 'UPLOADED'; j.decisions = {}; j.rerunAt = F.nowISO(); St.audit('rerun', 'ocr', id, 'Chạy lại trích xuất'); done(); return X.ocrExtract(id); };
  const reviewing = (j) => { if (['READY_FOR_REVIEW', 'VALIDATED', 'COMMIT_FAILED'].includes(j.status)) j.status = 'REVIEWING'; if (j.status === 'COMMITTED') err('Job đã ghi dữ liệu – không sửa được'); j.reviewedBy = me(); j.validatedAt = null; };
  /* Field: accept / edit / reject (§12.8.4 quyết định review + người review) */
  X.ocrSetField = (id, key, value, decision = 'edit') => { Au.need('ocr.use'); const j = job(id); const f = Q.ocrField(j, key); if (!f) err('Trường không tồn tại'); reviewing(j); if (decision === 'reject') { f.decision = 'reject'; f.confirmed = true; } else { f.value = value == null ? '' : String(value); f.normalized = f.value; f.decision = f.value === f.raw ? 'accept' : 'edit'; f.confirmed = true; } f.reviewedBy = me(); f.reviewedAt = F.nowISO(); St.save(); return f; };
  X.ocrConfirmField = (id, key) => { Au.need('ocr.use'); const j = job(id); const f = Q.ocrField(j, key); if (!f) err('Trường không tồn tại'); reviewing(j); f.decision = f.value === f.raw ? 'accept' : 'edit'; f.confirmed = true; f.reviewedBy = me(); f.reviewedAt = F.nowISO(); St.save(); return f; };
  X.ocrRejectField = (id, key) => X.ocrSetField(id, key, null, 'reject');
  X.ocrAcceptGroup = (id, group) => { Au.need('ocr.use'); const j = job(id); reviewing(j); (j.fields || []).filter(f => f.entityGroup === group && f.decision === 'pending').forEach(f => { f.decision = 'accept'; f.confirmed = true; f.reviewedBy = me(); f.reviewedAt = F.nowISO(); }); St.save(); return j; };
  /* Entity: Create / Link / Update / Ignore (§12.8.5) + dữ liệu bổ sung của section (xe, người ở cùng, dịch vụ) */
  X.ocrDecide = (id, group, patch = {}) => {
    Au.need('ocr.use'); const j = job(id); reviewing(j); j.decisions = j.decisions || {}; const s = O.section(j, group); if (!s) err('Nhóm không hợp lệ');
    const d = j.decisions[group] = Object.assign({}, j.decisions[group] || {}, patch, { resolved: true, decidedBy: me(), decidedAt: F.nowISO() });
    if (d.decision && !s.allowed.includes(d.decision)) err('Nhóm ' + s.label + ' không hỗ trợ quyết định ' + d.decision + (s.createBlocked && d.decision === 'create' ? ' – ' + s.createBlocked : ''));
    if (['link', 'update'].includes(d.decision) && !d.candidateId) err('Chọn bản ghi hệ thống để ' + d.decision);
    if (group === 'CUSTOMER' && d.candidateId) j.tenantId = d.candidateId;
    if (group === 'BUILDING' && patch.candidateId) { const rd = j.decisions.ROOM; if (rd && rd.candidateId) { const rm = St.rawGet('rooms', rd.candidateId); if (rm && rm.buildingId !== patch.candidateId) { rd.candidateId = null; } } }
    St.audit('decide', 'ocr', id, s.label + ': ' + (O.DECISION_LABEL[d.decision] || d.decision) + (d.candidateId ? ' → ' + d.candidateId : ''), { after: d });
    St.save(); return d;
  };
  X.ocrServiceMode = (id, key, { mode, effectiveFrom, qty }) => { Au.need('ocr.use'); const j = job(id); reviewing(j); j.decisions = j.decisions || {}; const d = j.decisions.CONTRACT_SERVICE = j.decisions.CONTRACT_SERVICE || { decision: 'create', items: {} }; d.items = d.items || {}; const it = d.items[key] = Object.assign({}, d.items[key] || {}, { resolved: true }); if (mode) it.mode = mode; if (effectiveFrom !== undefined) it.effectiveFrom = effectiveFrom; if (qty !== undefined) it.qty = Number(qty) || 0; St.save(); return it; };
  X.ocrSetRows = (id, group, rows) => { Au.need('ocr.use'); const j = job(id); reviewing(j); j.decisions = j.decisions || {}; const d = j.decisions[group] = j.decisions[group] || { decision: 'create' }; if (group === 'HANDOVER_ASSET') d.lines = rows; else d.rows = rows; if (rows.length && d.decision === 'ignore') d.decision = 'create'; St.save(); return d; };
  X.ocrValidate = (id) => { Au.need('ocr.use'); const j = job(id); if (j.status === 'COMMITTED') err('Job đã ghi dữ liệu'); const v = O.validate(j); if (v.ok) { j.status = 'VALIDATED'; j.validatedAt = F.nowISO(); j.validatedBy = me(); St.audit('validate', 'ocr', id, 'Validate đạt (' + v.warnings.length + ' cảnh báo)'); } else { j.status = 'REVIEWING'; St.audit('validate_failed', 'ocr', id, 'Validate ' + v.errors.length + ' lỗi: ' + v.errors.slice(0, 3).map(e => e.msg).join('; ')); } done(); return v; };
  X.ocrPayload = (id) => O.payload(job(id));

  /* ================= Commit Transaction (§12.8.9) – rollback toàn bộ khi lỗi ================= */
  const SNAP = ['tenants', 'contracts', 'contractTenants', 'contractMembers', 'contractServices', 'servicePrices', 'priceHistory', 'services', 'depositLedger', 'meters', 'meterReadings', 'contractHandoverAssets', 'contractPaymentTerms', 'contractRenewalClauses', 'documents', 'auditLog', 'rooms', 'holds', 'ocrJobs'];
  X.ocrCommit = (id, opts = {}) => {
    Au.need('ocr.use'); Au.need('contracts.manage'); const j = job(id);
    if (j.status === 'COMMITTED') err('Job đã ghi dữ liệu (idempotency ' + j.idempotencyKey + ')');
    const v = O.validate(j); if (!v.ok) { j.status = 'REVIEWING'; done(); err('Validate chưa đạt: ' + v.errors[0].msg); }
    const snapshot = {}; SNAP.forEach(k => snapshot[k] = JSON.parse(JSON.stringify(St.state[k] || [])));
    const S = v.sections; const g = (k) => S.find(s => s.key === k); const result = { entities: [], contractId: null };
    const ent = (group, action, type, rec, label, href) => result.entities.push({ group, action, type, id: rec && rec.id, code: rec && rec.code, label, href });
    try {
      const C = g('CUSTOMER'), B = g('BUILDING'), R = g('ROOM'), CT = g('CONTRACT'), OC = g('OCCUPANT'), SV = g('CONTRACT_SERVICE'), DP = g('DEPOSIT'), VE = g('VEHICLE'), MT = g('METER_READING'), AS = g('HANDOVER_ASSET'), PT = g('PAYMENT_TERM'), RN = g('RENEWAL_CLAUSE'), DOC = g('DOCUMENT');
      /* 1. Customer */
      let tenant;
      if (C.decision === 'create') { tenant = X.saveTenant({ name: C.data.name, phone: digits(C.data.phone), idNumber: digits(C.data.idNumber), idPlace: C.data.idPlace, dob: F.fromVN(C.data.dob) || '', address: C.data.address, status: 'active', note: 'Tạo từ OCR ' + j.code }); St.audit('ocr_create', 'tenant', tenant.id, 'OCR tạo khách ' + tenant.name, trace(j, { page: (Q.ocrField(j, 'tenantName') || {}).page })); ent('CUSTOMER', 'CREATE', 'tenant', tenant, tenant.name + ' (' + tenant.code + ')', '#/tenants/' + tenant.id); }
      else { tenant = St.rawGet('tenants', C.candidateId); if (!tenant) err('Khách liên kết không tồn tại'); if (C.decision === 'update') { const before = {}; const patch = {}; C.diffs.forEach(x => { before[x.field] = tenant[x.field]; patch[x.field] = x.field === 'dob' ? (F.fromVN(x.ocr) || x.ocr) : (x.field === 'phone' || x.field === 'idNumber' ? digits(x.ocr) : x.ocr); }); C.missing.forEach(k => { before[k] = tenant[k]; patch[k] = k === 'dob' ? (F.fromVN(C.data[k]) || C.data[k]) : (k === 'phone' || k === 'idNumber' ? digits(C.data[k]) : C.data[k]); }); if (Object.keys(patch).length) { Object.assign(tenant, patch); St.audit('ocr_update', 'tenant', tenant.id, 'OCR cập nhật khách ' + tenant.name + ': ' + Object.keys(patch).join(', '), trace(j, { before, after: patch })); } ent('CUSTOMER', 'UPDATE', 'tenant', tenant, tenant.name + ' (' + tenant.code + ')', '#/tenants/' + tenant.id); }
        else { St.audit('ocr_link', 'tenant', tenant.id, 'OCR liên kết khách ' + tenant.name + ' (' + C.matchBy + ')', trace(j)); ent('CUSTOMER', 'LINK', 'tenant', tenant, tenant.name + ' (' + tenant.code + ')', '#/tenants/' + tenant.id); } }
      /* 2. Building → Room (chỉ LINK) */
      const bld = St.rawGet('buildings', B.candidateId); if (!bld) err('Tòa liên kết không tồn tại'); St.audit('ocr_link', 'building', bld.id, 'OCR liên kết tòa ' + bld.name, trace(j)); ent('BUILDING', 'LINK', 'building', bld, bld.name, '#/buildings/' + bld.id);
      const room = St.rawGet('rooms', R.candidateId); if (!room) err('Phòng liên kết không tồn tại'); St.audit('ocr_link', 'room', room.id, 'OCR liên kết phòng ' + room.code, trace(j)); ent('ROOM', 'LINK', 'room', room, room.code + ' – ' + bld.name, '#/rooms/' + room.id);
      /* 3. Người ở cùng: hồ sơ khách riêng (§4.8) */
      const members = [{ name: tenant.name, dob: tenant.dob, idNumber: tenant.idNumber, relation: 'Người thuê (chính)', phone: tenant.phone }];
      if (OC.decision === 'create') OC.rows.forEach(x => { let t = x.match; if (!t && digits(x.phone).length === 10) { t = X.saveTenant({ name: x.name, phone: digits(x.phone), idNumber: digits(x.idNumber), dob: F.fromVN(x.dob) || x.dob || '', status: 'active', note: 'Người ở cùng – tạo từ OCR ' + j.code }); St.audit('ocr_create', 'tenant', t.id, 'OCR tạo hồ sơ người ở cùng ' + t.name, trace(j)); ent('OCCUPANT', 'CREATE', 'tenant', t, t.name, '#/tenants/' + t.id); } else if (t) ent('OCCUPANT', 'LINK', 'tenant', t, t.name, '#/tenants/' + t.id); members.push({ name: x.name, dob: x.dob || '', idNumber: x.idNumber || '', relation: x.relation || 'Người ở cùng', phone: x.phone || '', tenantId: t ? t.id : null }); });
      /* 4. Contract services: snapshot giá theo HĐ (§12.8.10); cập nhật giá tòa chỉ khi người dùng chọn */
      const services = []; const priceUpdates = [];
      if (SV.decision === 'create') SV.items.filter(i => i.mode !== 'ignore').forEach(i => { const svc = i.serviceId ? St.rawGet('services', i.serviceId) : null; services.push({ serviceId: i.serviceId, name: svc ? svc.name : i.label, unit: svc ? svc.unit : 'Tháng', price: i.ocrPrice, qty: svc && svc.method === 'meter' ? 0 : (i.isVehicle ? i.qty : 1), note: 'Đơn giá theo HĐ (OCR ' + j.code + (i.conflict ? ', giá tòa ' + F.vnd(i.buildingPrice) : '') + ')', priceMode: i.mode, sourceOcr: { jobId: j.id, fieldKey: i.key, page: i.page, confidence: i.confidence } }); if (i.mode === 'updateBuilding' && i.serviceId) priceUpdates.push(i); });
      /* 5. Contract (draft – OCR không tự kích hoạt, AC-11) */
      const vehicles = VE.decision === 'create' ? VE.rows.map(v => ({ type: v.type || 'Xe máy', plate: v.plate || '' })) : [];
      const c = X.saveContractDraft({ tenantId: tenant.id, roomId: room.id, start: CT.data.start, end: CT.data.end, payDay: PT.data.notifyDay && PT.data.notifyDay <= 28 ? PT.data.notifyDay : 25, listPrice: room.price, price: CT.data.price, deposit: DP.decision === 'create' ? DP.amount : 0, services, members, vehicles, note: CT.data.note || '', contractNo: CT.data.contractNo, signedDate: CT.data.signDate || null, handoverDate: CT.data.handoverDate || CT.data.start, billingStart: CT.data.billingStart || CT.data.start, purpose: CT.data.purpose || 'Để ở', occupants: CT.data.occupants || 1, maxOccupants: CT.data.maxOccupants || 0, paidBefore: CT.data.paidBefore, paidAtSign: CT.data.paidAtSign, source: 'ocr', ocrJobId: j.id, sourceOcr: trace(j).sourceOcr, contractType: 'new', termNo: 1 });
      Q.contractServices(c.id).forEach(cs => { const src = services.find(x => (x.serviceId && x.serviceId === cs.serviceId) || (!x.serviceId && x.name === cs.name)); if (src) Object.assign(cs, { priceMode: src.priceMode, sourceOcr: src.sourceOcr }); });
      result.contractId = c.id; St.audit('ocr_commit', 'contract', c.id, 'OCR tạo hợp đồng ' + c.code + ' (Dự thảo) từ ' + j.fileName, trace(j)); ent('CONTRACT', 'CREATE', 'contract', c, c.code + ' – Dự thảo', '#/contracts/' + c.id);
      Q.contractTenants(c.id).forEach(ct => ent('CONTRACT_TENANT', ct.role === 'primary' ? 'LINK' : (ct.tenantId ? 'LINK' : 'CREATE'), 'contractTenant', ct, (ct.role === 'primary' ? 'Khách đứng tên ' : 'Người ở cùng ') + ct.name, '#/contracts/' + c.id + '?tab=members'));
      if (services.length) ent('CONTRACT_SERVICE', 'CREATE', 'contractService', { id: c.id }, services.length + ' dòng dịch vụ snapshot giá HĐ', '#/contracts/' + c.id + '?tab=services');
      priceUpdates.forEach(i => { const rec = X.saveServicePrice({ serviceId: i.serviceId, scope: 'BUILDING', buildingId: bld.id, price: i.ocrPrice, effectiveFrom: i.effectiveFrom, reason: 'Cập nhật giá tòa theo HĐ OCR ' + j.code, silent: true, sourceOcr: trace(j).sourceOcr }); ent('CONTRACT_SERVICE', 'UPDATE', 'servicePrice', rec, 'Giá tòa ' + i.serviceName + ' → ' + F.vnd(i.ocrPrice) + ' từ ' + F.date(i.effectiveFrom), '#/buildings/' + bld.id + '?tab=services'); });
      /* 6. Deposit ledger */
      if (DP.decision === 'create' && DP.amount > 0) { const e = X.depositEntry({ contractId: c.id, type: 'RECEIVABLE', amount: DP.amount, date: CT.data.signDate || CT.data.start, refType: 'contract', refId: c.id, note: 'Cọc theo HĐ (OCR ' + j.code + ')', sourceOcr: trace(j).sourceOcr }); ent('DEPOSIT', 'CREATE', 'depositLedger', e, 'Phải thu cọc ' + F.vnd(DP.amount), '#/contracts/' + c.id + '?tab=deposit'); }
      /* 7. Vehicles */
      if (vehicles.length) ent('VEHICLE', 'CREATE', 'vehicle', { id: c.id }, vehicles.length + ' xe', '#/contracts/' + c.id + '?tab=services');
      /* 8. Opening meter readings (§12.8.11) */
      if (MT.decision === 'create') MT.rows.forEach(x => { let meter = x.meter; if (!meter) { meter = St.add('meters', { roomId: room.id, buildingId: bld.id, type: x.type, code: (x.type === 'electric' ? 'CTD-' : 'DHN-') + String(room.code).replace(/[^A-Za-z0-9]/g, ''), unit: x.unit, installedAt: MT.date, status: 'active', note: 'Tạo từ OCR ' + j.code }); ent('METER_READING', 'CREATE', 'meter', meter, 'Công tơ ' + meter.code, '#/rooms/' + room.id); } const r = St.add('meterReadings', { roomId: room.id, meterId: meter.id, contractId: c.id, type: x.type, readingType: 'OPENING', readingDate: MT.date, period: MT.date.slice(0, 7), prev: x.value, curr: x.value, unit: x.unit, status: 'confirmed', enteredBy: me(), sourceDoc: j.fileName, sourcePage: x.page, confidence: x.confidence, sourceOcr: trace(j).sourceOcr }); St.audit('ocr_create', 'meterReadings', r.id, 'OCR chỉ số đầu kỳ ' + x.label + ' = ' + x.value + ' ' + x.unit + ' (' + room.code + ')', trace(j, { page: x.page })); ent('METER_READING', 'CREATE', 'meterReading', r, x.label + ' đầu kỳ ' + x.value + ' ' + x.unit, '#/rooms/' + room.id + '?tab=meters'); });
      /* 9. Handover asset lines (§12.8.12) */
      if (AS.decision === 'create') { AS.lines.forEach(a => St.add('contractHandoverAssets', { contractId: c.id, roomId: room.id, name: a.name, group: a.kind, qty: a.qty || '1', unit: a.unit || 'cái', condition: a.condition || '', note: a.note || a.desc || '', sourcePage: a.page || 2, confidence: 0.9, sourceOcr: trace(j).sourceOcr })); St.audit('ocr_create', 'contract', c.id, 'OCR tạo ' + AS.lines.length + ' dòng tài sản bàn giao', trace(j)); ent('HANDOVER_ASSET', 'CREATE', 'contractHandoverAssets', { id: c.id }, AS.lines.length + ' dòng tài sản bàn giao', '#/contracts/' + c.id + '?tab=terms'); }
      /* 10. Payment terms & renewal clause (§12.8.13–14) */
      if (PT.decision === 'create') { const t = St.add('contractPaymentTerms', Object.assign({ contractId: c.id, dueDay: c.payDay, source: 'ocr', sourceOcr: trace(j).sourceOcr }, PT.data)); ent('PAYMENT_TERM', 'CREATE', 'contractPaymentTerms', t, 'Thông báo ngày ' + (PT.data.notifyDay || '-') + ', thanh toán ' + (PT.data.payFrom || '-') + '–' + (PT.data.payTo || '-') + ', ' + (PT.data.bankName || ''), '#/contracts/' + c.id + '?tab=terms'); }
      if (RN.decision === 'create') { const t = St.add('contractRenewalClauses', Object.assign({ contractId: c.id, source: 'ocr', sourceOcr: trace(j).sourceOcr }, RN.data)); ent('RENEWAL_CLAUSE', 'CREATE', 'contractRenewalClauses', t, 'Tự gia hạn ' + (RN.data.renewalMonths || '-') + ' tháng, báo trước ' + (RN.data.noticeDays || '-') + ' ngày (chỉ tạo cảnh báo, không tự gia hạn – AC-12)', '#/contracts/' + c.id + '?tab=terms'); }
      /* 11. Document */
      if (DOC.decision === 'create') { const d = St.add('documents', { entityType: 'contract', entityId: c.id, name: 'Hợp đồng thuê (OCR)', fileName: j.fileName, size: j.size, date: F.today(), expiry: '', kind: /pdf/i.test(j.fileName) ? 'pdf' : /png|jpe?g/i.test(j.fileName) ? 'img' : 'doc', docType: DOC.docType, version: 1, source: 'ocr', ocrJobId: j.id, fileHash: j.fileHash, uploadedBy: me() }); ent('DOCUMENT', 'CREATE', 'document', d, j.fileName, '#/contracts/' + c.id + '?tab=docs'); }
      if (opts.simulateFail) err('Mô phỏng lỗi kỹ thuật khi ghi tài liệu (AC-9: rollback toàn bộ transaction)');
      /* Done */
      j.status = 'COMMITTED'; j.committedAt = F.nowISO(); j.committedBy = me(); j.result = result; j.contractId = c.id; j.error = '';
      St.audit('commit', 'ocr', j.id, 'Commit OCR ' + j.code + ' → HĐ ' + c.code + ' (' + result.entities.length + ' entity)', { after: { contractId: c.id, entities: result.entities.length } });
      done(); return result;
    } catch (e) {
      Object.keys(snapshot).forEach(k => { St.state[k] = snapshot[k]; });
      const j2 = St.rawGet('ocrJobs', id); if (j2) { j2.status = 'COMMIT_FAILED'; j2.error = e.message; j2.failedAt = F.nowISO(); }
      St.audit('commit_failed', 'ocr', id, 'Commit lỗi – đã rollback toàn bộ: ' + e.message);
      done(); throw new Error('Commit lỗi, đã rollback toàn bộ: ' + e.message);
    }
  };
})(window.TH);
