/* OCR Data Onboarding – Spec v1.8 §12.8: tách field OCR theo 13 nhóm entity (§12.8.7), match dữ liệu hiện có (§12.8.6), đề xuất quyết định
   Create / Link / Update / Ignore (§12.8.5), validate toàn bộ và dựng payload commit (§12.8.9). Không ghi store – chỉ đọc job + store để tính toán. */
(function (TH) {
  const F = TH.f, St = TH.store, Q = TH.q, P = TH.ocrParser;
  const O = {};
  const digits = s => String(s || '').replace(/\D/g, '');
  const SVC_MAP = { svc_internet: 'INTERNET', svc_electric: 'DIEN', svc_water: 'NUOC', svc_common: 'QUANLY', svc_ebike: 'GUIXE', svc_evcar: 'SACXE' };
  O.SVC_MAP = SVC_MAP;
  O.DECISION_LABEL = { create: 'Create', link: 'Link', update: 'Update', ignore: 'Ignore' };
  const fieldsOf = (job, g) => (job.fields || []).filter(f => f && f.entityGroup === g);
  const val = (job, k) => { const f = Q.ocrField(job, k); if (!f || f.decision === 'reject') return ''; return f.value == null ? '' : String(f.value); };
  const num = (job, k) => Number(String(val(job, k)).replace(/[^\d]/g, '')) || 0;
  const iso = (job, k) => F.fromVN(val(job, k)) || '';
  O.val = val; O.num = num; O.iso = iso;
  const dec = (job, g) => Object.assign({}, (job.decisions || {})[g] || {});

  /* ---------- Ứng viên & đề xuất từng nhóm ---------- */
  O.customer = (job) => {
    const data = { name: val(job, 'tenantName'), phone: val(job, 'phone'), idNumber: val(job, 'idNumber'), idPlace: val(job, 'idPlace'), dob: val(job, 'dob'), address: val(job, 'address') };
    const r = Q.tenantMatch(data); const d = dec(job, 'CUSTOMER');
    const chosen = d.candidateId ? St.rawGet('tenants', d.candidateId) : null;
    const candidates = [].concat(r.match ? [r.match] : [], r.weak ? [r.weak] : [], r.candidates || []).filter((t, i, a) => t && a.findIndex(x => x.id === t.id) === i);
    if (chosen && !candidates.some(t => t.id === chosen.id)) candidates.unshift(chosen);
    const diffs = (chosen && chosen.id !== (r.match || {}).id ? Q.tenantMatch(data, null).diffs : r.diffs) || [];
    const suggested = r.match ? ((r.conflicts || []).length ? 'link' : (diffs.length || (r.missing || []).length ? 'update' : 'link')) : 'create';
    const needsResolve = (r.conflicts || []).length > 0;
    return { data, match: r.match, matchBy: r.matchBy, score: r.score, conflicts: r.conflicts || [], diffs, missing: r.missing || [], weak: r.weak || null, candidates, suggested, needsResolve, decision: d.decision || suggested, candidateId: d.candidateId || (r.match ? r.match.id : null), resolved: !!d.resolved || !needsResolve, allowed: ['create', 'link', 'update'] };
  };
  O.building = (job) => {
    const d = dec(job, 'BUILDING'); const name = val(job, 'buildingName');
    const r = Q.buildingMatch({ name, address: val(job, 'signPlace'), hint: [job.buildingHint, val(job, 'transferNote'), val(job, 'roomCode')].filter(Boolean).join(' ') });
    const chosen = d.candidateId ? St.rawGet('buildings', d.candidateId) : null; const match = chosen || r.match;
    return { name, address: val(job, 'signPlace'), landlord: val(job, 'landlordName'), match, matchBy: chosen ? 'chọn' : r.matchBy, score: chosen ? 1 : r.score, candidates: St.rawAll('buildings').filter(b => b && !b.stub), suggested: match ? 'link' : 'create', decision: d.decision || (match ? 'link' : 'create'), candidateId: match ? match.id : null, allowed: ['link'], createBlocked: 'Tạo tòa mới đi qua Tòa nhà → Onboarding (HĐ đầu vào, phân công) – OCR chỉ liên kết tòa có sẵn' };
  };
  O.room = (job, b) => {
    const d = dec(job, 'ROOM'); const code = val(job, 'roomCode'); const bid = b && b.match ? b.match.id : null;
    const chosen = d.candidateId ? St.rawGet('rooms', d.candidateId) : null;
    const rm = !chosen && code ? P.matchRoom(code, bid) : null; const exact = rm && F.norm(rm.code).replace(/[^a-z0-9]/g, '') === F.norm(code).replace(/[^a-z0-9]/g, '');
    const match = chosen || rm;
    const candidates = St.rawAll('rooms').filter(r => r && (!bid || r.buildingId === bid)).sort((x, y) => F.cmp(x.code, y.code));
    const warnings = []; if (match && !chosen && !exact) warnings.push('HĐ ghi "' + code + '" – hệ thống gợi ý phòng ' + match.code + ' (khớp theo số)'); if (match && !['ready', 'held'].includes(match.status)) warnings.push('Phòng đang ' + Q.label('room', match.status) + ' – không thể kích hoạt HĐ cho đến khi Sẵn sàng'); if (match && bid && match.buildingId !== bid) warnings.push('Phòng thuộc tòa khác với tòa đã liên kết');
    return { code, match, matchBy: chosen ? 'chọn' : (exact ? 'Building + Room code' : rm ? 'Theo số phòng' : null), score: chosen ? 1 : exact ? 0.95 : rm ? 0.7 : 0, candidates, suggested: match ? 'link' : 'create', decision: d.decision || (match ? 'link' : 'create'), candidateId: match ? match.id : null, allowed: ['link'], createBlocked: 'Tạo phòng mới tại Tòa nhà → Phòng; OCR chỉ liên kết phòng có sẵn', warnings };
  };
  O.contract = (job, cust, bld, room) => {
    const d = dec(job, 'CONTRACT');
    const data = { contractNo: val(job, 'contractNo'), signDate: iso(job, 'signDate'), start: iso(job, 'start'), end: iso(job, 'end'), months: num(job, 'months'), handoverDate: iso(job, 'handoverDate'), billingStart: iso(job, 'billingStart'), purpose: val(job, 'purpose'), occupants: num(job, 'occupants'), maxOccupants: num(job, 'maxOccupants'), price: num(job, 'price'), paidBefore: num(job, 'paidBefore'), paidAtSign: num(job, 'paidAtSign'), note: val(job, 'note') };
    const tenantId = cust.decision !== 'create' ? cust.candidateId : null;
    const dups = Q.contractDuplicates({ contractNo: data.contractNo, fileHash: job.fileHash, tenantId, roomId: room.candidateId, start: data.start, excludeJobId: job.id });
    return { data, duplicates: dups, suggested: 'create', decision: d.decision || 'create', allowed: ['create'], listPrice: room.match ? room.match.price : 0 };
  };
  O.occupants = (job, contract) => {
    const d = dec(job, 'OCCUPANT'); const rows = (d.rows || []).map(r => Object.assign({}, r));
    rows.forEach(r => { const m = Q.tenantMatch({ name: r.name, phone: r.phone, idNumber: r.idNumber, dob: r.dob }); r.match = m.match; r.matchBy = m.matchBy; });
    const n = contract.data.occupants; const need = Math.max(0, n - 1);
    return { count: n, max: contract.data.maxOccupants, need, rows, suggested: rows.length ? 'create' : 'ignore', decision: d.decision || (rows.length ? 'create' : 'ignore'), allowed: ['create', 'ignore'], note: n > 1 && !rows.length ? 'HĐ ghi ' + n + ' người ở nhưng không có danh sách tên – thêm người ở cùng (hồ sơ khách riêng, §4.8) hoặc bỏ qua và bổ sung sau tại chi tiết HĐ' : '' };
  };
  O.services = (job, bld, contract) => {
    const d = dec(job, 'CONTRACT_SERVICE'); const items0 = d.items || {}; const bid = bld.candidateId; const date = contract.data.start || F.today();
    const vehicles = num(job, 'vehicleCount');
    const items = Object.keys(SVC_MAP).map(k => {
      const ocrPrice = num(job, k); if (!ocrPrice) return null;
      const svc = St.rawAll('services').find(s => s && s.code === SVC_MAP[k]) || null; const f = Q.ocrField(job, k) || {};
      const rec = svc ? Q.servicePriceRecord(svc.id, bid, date) : null; const buildingPrice = rec ? Number(rec.price) || 0 : 0;
      const conflict = !!svc && buildingPrice !== ocrPrice; const isVehicle = ['svc_ebike', 'svc_evcar'].includes(k);
      const saved = items0[k] || {};
      const mode = saved.mode || (isVehicle && !vehicles ? 'ignore' : 'snapshot');
      return { key: k, label: f.label || k, serviceId: svc ? svc.id : null, serviceName: svc ? svc.name : f.label, unit: svc ? svc.unit : '', method: svc ? svc.method : 'fixed', ocrPrice, buildingPrice, priceScope: rec ? rec.scope : null, conflict, isVehicle, qty: isVehicle ? (saved.qty != null ? saved.qty : vehicles) : (svc && svc.method === 'meter' ? 0 : 1), mode, effectiveFrom: saved.effectiveFrom || date, resolved: !conflict || !!saved.resolved, confidence: f.confidence || 0, page: f.page };
    }).filter(Boolean);
    const conflicts = items.filter(i => i.conflict);
    return { items, conflicts, unresolved: conflicts.filter(i => !i.resolved), suggested: items.length ? 'create' : 'ignore', decision: d.decision || (items.length ? 'create' : 'ignore'), allowed: ['create', 'ignore'] };
  };
  O.deposit = (job, contract) => { const d = dec(job, 'DEPOSIT'); const amount = num(job, 'deposit'); const warnings = []; if (amount && contract.data.price && amount !== contract.data.price) warnings.push('Template: cọc = 01 tháng tiền nhà (' + F.vnd(contract.data.price) + ') – HĐ ghi ' + F.vnd(amount)); return { amount, words: val(job, 'depositWords'), suggested: amount ? 'create' : 'ignore', decision: d.decision || (amount ? 'create' : 'ignore'), allowed: ['create', 'ignore'], warnings, entry: 'RECEIVABLE' }; };
  O.vehicles = (job) => { const d = dec(job, 'VEHICLE'); const n = num(job, 'vehicleCount'); const rows = d.rows ? d.rows.map(r => Object.assign({}, r)) : Array.from({ length: Math.min(10, n) }, () => ({ type: 'Xe máy', plate: '' })); return { count: n, rows, suggested: n ? 'create' : 'ignore', decision: d.decision || (n ? 'create' : 'ignore'), allowed: ['create', 'ignore'] }; };
  O.meters = (job, room, contract) => {
    const d = dec(job, 'METER_READING'); const rid = room.candidateId; const date = contract.data.handoverDate || contract.data.start || F.today();
    const mk = (type, key) => { const f = Q.ocrField(job, key) || {}; const v = num(job, key); const meter = rid ? Q.meter(rid, type) : null; const exists = rid ? St.rawAll('meterReadings').find(m => m && m.roomId === rid && m.readingType === 'OPENING' && m.type === type && m.readingDate === date) : null; const last = rid ? St.rawAll('meterReadings').filter(m => m && m.roomId === rid && m.type === type).sort((a, b) => F.cmp(b.period || b.readingDate || '', a.period || a.readingDate || ''))[0] : null; return { type, key, label: type === 'electric' ? 'Điện' : 'Nước', value: v, unit: type === 'electric' ? 'kWh' : 'm³', meter, meterCandidates: rid ? Q.roomMeters(rid) : [], meterDecision: meter ? 'link' : 'create', exists, last, confidence: f.confidence || 0, page: f.page, warn: last && v && v < Number(last.curr || 0) ? 'Nhỏ hơn chỉ số gần nhất của phòng (' + last.curr + ')' : '' }; };
    const rows = [mk('electric', 'elecIndex'), mk('water', 'waterIndex')].filter(r => r.value || Q.ocrValue(job, r.key));
    return { rows, date, suggested: rows.length ? 'create' : 'ignore', decision: d.decision || (rows.length ? 'create' : 'ignore'), allowed: ['create', 'ignore'] };
  };
  O.assets = (job) => { const d = dec(job, 'HANDOVER_ASSET'); const lines = (d.lines || job.assets || []).map(a => Object.assign({ unit: 'cái', note: '', page: 2 }, a)); return { lines, suggested: lines.length ? 'create' : 'ignore', decision: d.decision || (lines.length ? 'create' : 'ignore'), allowed: ['create', 'ignore'] }; };
  O.paymentTerms = (job) => { const d = dec(job, 'PAYMENT_TERM'); const data = { notifyDay: num(job, 'payDay'), payFrom: num(job, 'payFrom'), payTo: num(job, 'payTo'), method: 'Chuyển khoản', bankName: val(job, 'bankName'), bankAccountName: val(job, 'bankAccountName'), bankAccountNo: val(job, 'bankAccountNo'), transferTemplate: val(job, 'transferNote'), lateFeePerDay: num(job, 'lateFee'), graceDays: 3 }; const any = Object.values(data).some(v => v); return { data, suggested: any ? 'create' : 'ignore', decision: d.decision || (any ? 'create' : 'ignore'), allowed: ['create', 'ignore'] }; };
  O.renewal = (job) => { const d = dec(job, 'RENEWAL_CLAUSE'); const data = { renewalType: num(job, 'renewalMonths') ? 'AUTO_RENEW_CLAUSE' : 'NONE', renewalMonths: num(job, 'renewalMonths'), noticeDays: num(job, 'noticeDays'), noticeDate: iso(job, 'noticeDate'), rawClause: (Q.ocrField(job, 'renewalMonths') || {}).rawClause || 'Trước ' + (num(job, 'noticeDays') || 30) + ' ngày hết hạn, nếu hai bên không có ý kiến thì hợp đồng mặc nhiên kéo dài thêm ' + (num(job, 'renewalMonths') || 12) + ' tháng.' }; const any = data.renewalMonths || data.noticeDays; return { data, suggested: any ? 'create' : 'ignore', decision: d.decision || (any ? 'create' : 'ignore'), allowed: ['create', 'ignore'] }; };
  O.document = (job) => { const d = dec(job, 'DOCUMENT'); return { fileName: job.fileName, size: job.size, pages: job.pages, hash: job.fileHash, docType: job.docType || 'contract', engine: job.engine, suggested: 'create', decision: d.decision || 'create', allowed: ['create', 'ignore'] }; };

  /* ---------- 13 section cho màn Review ---------- */
  O.sections = (job) => {
    const cust = O.customer(job), bld = O.building(job), room = O.room(job, bld), contract = O.contract(job, cust, bld, room);
    const occ = O.occupants(job, contract), svc = O.services(job, bld, contract), dep = O.deposit(job, contract), veh = O.vehicles(job), met = O.meters(job, room, contract), ast = O.assets(job), pt = O.paymentTerms(job), rn = O.renewal(job), doc = O.document(job);
    const map = { CUSTOMER: cust, BUILDING: bld, ROOM: room, CONTRACT: contract, OCCUPANT: occ, CONTRACT_SERVICE: svc, DEPOSIT: dep, VEHICLE: veh, METER_READING: met, HANDOVER_ASSET: ast, PAYMENT_TERM: pt, RENEWAL_CLAUSE: rn, DOCUMENT: doc };
    return P.ENTITY_GROUPS.map(([key, label, icon]) => Object.assign({ key, label, icon, fields: fieldsOf(job, key), pending: fieldsOf(job, key).filter(f => f.decision === 'pending').length }, map[key]));
  };
  O.section = (job, key) => O.sections(job).find(s => s.key === key);
  /* Khởi tạo quyết định đề xuất sau khi trích xuất (không tự CREATE mọi thứ – chỉ ghi đề xuất, người dùng xác nhận) */
  O.initDecisions = (job) => {
    job.decisions = job.decisions || {};
    O.sections(job).forEach(s => { if (job.decisions[s.key]) return; const d = { decision: s.suggested, candidateId: s.candidateId || null, resolved: s.needsResolve ? false : true, suggested: s.suggested }; if (s.key === 'VEHICLE') d.rows = s.rows; if (s.key === 'HANDOVER_ASSET') d.lines = s.lines; if (s.key === 'OCCUPANT') d.rows = []; if (s.key === 'CONTRACT_SERVICE') d.items = {}; job.decisions[s.key] = d; });
    return job.decisions;
  };

  /* ---------- Validate toàn bộ (§12.8.8 V) ---------- */
  O.validate = (job) => {
    const S = O.sections(job); const g = (k) => S.find(s => s.key === k); const errors = [], warnings = [];
    const E = (group, msg) => errors.push({ group, msg }), W = (group, msg) => warnings.push({ group, msg });
    (job.fields || []).filter(f => f && f.decision === 'pending' && f.value !== '' && (f.money || P.field(f.key).req)).forEach(f => E(f.entityGroup, 'Trường "' + f.label + '" cần kiểm tra (độ tin cậy ' + Math.round(f.confidence * 100) + '%) – xác nhận hoặc sửa'));
    const c = g('CUSTOMER'); if (c.decision === 'create') { if (!c.data.name) E('CUSTOMER', 'Thiếu họ tên khách'); if (!/^0\d{9}$/.test(digits(c.data.phone))) E('CUSTOMER', 'SĐT phải đủ 10 số (HĐ ghi "' + (c.data.phone || '') + '")'); if (c.data.idNumber && digits(c.data.idNumber).length !== 12) E('CUSTOMER', 'CCCD phải đúng 12 số'); const dupPh = St.rawAll('tenants').find(t => t && digits(t.phone) === digits(c.data.phone)); if (dupPh) E('CUSTOMER', 'SĐT đã thuộc khách ' + dupPh.name + ' – chọn Link thay vì Create'); } else if (!c.candidateId) E('CUSTOMER', 'Chọn khách để liên kết'); if (c.needsResolve && !c.resolved) E('CUSTOMER', 'Có xung đột dữ liệu (' + c.conflicts.map(x => x.msg).join('; ') + ') – bắt buộc xử lý trước khi commit');
    const b = g('BUILDING'); if (!b.candidateId) E('BUILDING', 'Chưa liên kết tòa nhà có sẵn');
    const r = g('ROOM'); if (!r.candidateId) E('ROOM', 'Chưa liên kết phòng'); else { if (b.candidateId && r.match.buildingId !== b.candidateId) E('ROOM', 'Phòng không thuộc tòa đã liên kết'); if (!['ready', 'held'].includes(r.match.status)) W('ROOM', 'Phòng đang ' + Q.label('room', r.match.status) + ' – HĐ sẽ ở trạng thái Dự thảo cho đến khi phòng Sẵn sàng'); }
    const ct = g('CONTRACT'); if (!ct.data.start) E('CONTRACT', 'Thiếu ngày bắt đầu'); if (!ct.data.end) E('CONTRACT', 'Thiếu ngày kết thúc'); if (ct.data.start && ct.data.end && ct.data.end <= ct.data.start) E('CONTRACT', 'Ngày kết thúc phải sau ngày bắt đầu'); if (!(ct.data.price > 0)) E('CONTRACT', 'Giá thuê phải > 0'); ct.duplicates.forEach(d => E('CONTRACT', 'Trùng hợp đồng ' + d.contract.code + ' (' + d.by + ') – không tạo HĐ trùng (AC-1)'));
    const sv = g('CONTRACT_SERVICE'); if (sv.decision === 'create') { sv.unresolved.forEach(i => E('CONTRACT_SERVICE', i.serviceName + ': giá HĐ ' + F.vnd(i.ocrPrice) + ' ≠ giá tòa ' + F.vnd(i.buildingPrice) + ' – chọn cách xử lý')); sv.items.filter(i => i.mode === 'updateBuilding' && !i.effectiveFrom).forEach(i => E('CONTRACT_SERVICE', i.serviceName + ': nhập ngày hiệu lực giá tòa')); sv.items.filter(i => !i.serviceId && i.mode !== 'ignore').forEach(i => W('CONTRACT_SERVICE', i.label + ': không có trong danh mục dịch vụ – sẽ lưu là dịch vụ khác')); }
    const dp = g('DEPOSIT'); if (dp.decision === 'create' && !(dp.amount > 0)) E('DEPOSIT', 'Tiền cọc phải > 0 hoặc chọn Ignore'); dp.warnings.forEach(w => W('DEPOSIT', w));
    const oc = g('OCCUPANT'); if (oc.decision === 'create') { if (!oc.rows.length) E('OCCUPANT', 'Chưa có người ở cùng nào – thêm dòng hoặc chọn Ignore'); oc.rows.forEach(x => { if (!x.name) E('OCCUPANT', 'Người ở cùng thiếu họ tên'); }); } else if (oc.count > 1) W('OCCUPANT', 'HĐ ghi ' + oc.count + ' người ở – chưa có hồ sơ người ở cùng');
    const ve = g('VEHICLE'); if (ve.decision === 'create' && !ve.rows.length) E('VEHICLE', 'Chưa có dòng xe nào');
    const mt = g('METER_READING'); if (mt.decision === 'create') { mt.rows.forEach(x => { if (!(x.value >= 0) || !Q.ocrValue(job, x.key)) E('METER_READING', 'Chỉ số ' + x.label + ' không hợp lệ'); if (x.exists) E('METER_READING', 'Đã có chỉ số OPENING ' + x.label + ' cùng ngày cho phòng này'); if (x.warn) W('METER_READING', x.label + ': ' + x.warn); }); if (!r.candidateId) E('METER_READING', 'Cần liên kết phòng để tạo chỉ số đầu kỳ'); }
    const pt = g('PAYMENT_TERM'); if (pt.decision === 'create' && pt.data.bankAccountNo && !/^\d{6,}$/.test(pt.data.bankAccountNo)) W('PAYMENT_TERM', 'Số tài khoản có vẻ không hợp lệ');
    const rn = g('RENEWAL_CLAUSE'); if (rn.decision === 'create' && rn.data.noticeDays > 90) W('RENEWAL_CLAUSE', 'Số ngày báo trước bất thường (' + rn.data.noticeDays + ')');
    return { errors, warnings, ok: !errors.length, sections: S };
  };

  /* ---------- Payload xem trước (§12.8.16 Preview final payload) ---------- */
  O.payload = (job) => {
    const S = O.sections(job); const g = (k) => S.find(s => s.key === k); const c = g('CUSTOMER'), b = g('BUILDING'), r = g('ROOM'), ct = g('CONTRACT'), sv = g('CONTRACT_SERVICE'), dp = g('DEPOSIT'), ve = g('VEHICLE'), mt = g('METER_READING'), ast = g('HANDOVER_ASSET'), pt = g('PAYMENT_TERM'), rn = g('RENEWAL_CLAUSE'), oc = g('OCCUPANT'), doc = g('DOCUMENT');
    const t = c.candidateId ? St.rawGet('tenants', c.candidateId) : null;
    return {
      job: { id: job.id, code: job.code, file: job.fileName, hash: job.fileHash, engine: job.engine, idempotencyKey: job.idempotencyKey },
      customer: { action: c.decision.toUpperCase(), id: c.decision === 'create' ? null : c.candidateId, code: t ? t.code : null, data: c.decision === 'create' ? c.data : (c.decision === 'update' ? Object.fromEntries(c.diffs.concat(c.missing.map(k => ({ field: k, ocr: c.data[k] }))).map(x => [x.field, x.ocr])) : undefined) },
      building: { action: 'LINK', id: b.candidateId, code: b.match ? b.match.code : null, name: b.match ? b.match.name : b.name },
      room: { action: 'LINK', id: r.candidateId, code: r.match ? r.match.code : r.code },
      contract: Object.assign({ action: 'CREATE', status: 'draft', source: 'ocr' }, ct.data, { listPrice: ct.listPrice }),
      contractTenants: [{ role: 'primary', tenantId: c.candidateId || '(mới)' }].concat(oc.decision === 'create' ? oc.rows.map(x => ({ role: 'cohabitant', name: x.name, tenantId: x.match ? x.match.id : '(mới)' })) : []),
      contractServices: sv.decision === 'create' ? sv.items.filter(i => i.mode !== 'ignore').map(i => ({ service: i.serviceName, priceSnapshot: i.ocrPrice, qty: i.qty, unit: i.unit, buildingPrice: i.buildingPrice, priceMode: i.mode, effectiveFrom: i.mode === 'updateBuilding' ? i.effectiveFrom : undefined })) : [],
      servicePriceUpdates: sv.decision === 'create' ? sv.items.filter(i => i.mode === 'updateBuilding').map(i => ({ service: i.serviceName, scope: 'BUILDING', building: b.match ? b.match.name : null, price: i.ocrPrice, effectiveFrom: i.effectiveFrom })) : [],
      depositLedger: dp.decision === 'create' ? [{ type: 'RECEIVABLE', amount: dp.amount, date: ct.data.signDate || ct.data.start }] : [],
      vehicles: ve.decision === 'create' ? ve.rows : [],
      openingMeterReadings: mt.decision === 'create' ? mt.rows.map(x => ({ type: x.type, value: x.value, unit: x.unit, readingType: 'OPENING', readingDate: mt.date, meter: x.meter ? x.meter.code : '(tạo mới)', sourcePage: x.page, confidence: x.confidence })) : [],
      handoverAssets: ast.decision === 'create' ? ast.lines.map(a => ({ name: a.name, group: a.kind, qty: a.qty, unit: a.unit, condition: a.condition, note: a.note })) : [],
      paymentTerms: pt.decision === 'create' ? pt.data : null,
      renewalClause: rn.decision === 'create' ? rn.data : null,
      document: doc.decision === 'create' ? { docType: doc.docType, fileName: doc.fileName, hash: doc.hash } : null,
    };
  };
  TH.ocrOnb = O;
})(window.TH);
