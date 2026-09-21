/* Seed / migration – Spec v1.8 Wave 2: OCR Data Onboarding (§12.8), giá dịch vụ 2 lớp GLOBAL/BUILDING (§12.9), công tơ & chỉ số OPENING/PERIOD/CLOSING (§12.10),
   Deposit Ledger (§10.11, §4.18), Người thuê theo hợp đồng liên kết hồ sơ khách (§4.8), điều khoản thanh toán / gia hạn (§12.8.13–14).
   Chạy sau migrateV5, additive & idempotent (meta.w2Migrated). Không xóa contractMembers cũ – chỉ chuyển sang collection mới; ocrExtractions → ocrJobs. */
(function (TH) {
  const F = TH.f, seed = TH.seed = TH.seed || {};
  const mk = (st, col, obj) => { obj.id = obj.id || F.uid(col.slice(0, 3)); obj.source = obj.source || 'seed'; obj.createdAt = obj.createdAt || '2026-01-01T08:00'; st[col].push(obj); return obj; };
  const digits = s => String(s || '').replace(/\D/g, '');
  const userBy = (st, username) => st.users.find(u => u && u.username === username) || null;
  const bByName = (st, name) => st.buildings.find(b => b && b.name === name) || null;
  const svcBy = (st, code) => st.services.find(s => s && s.code === code) || null;

  /* ---------- Danh mục dịch vụ §4.12 + bảng giá 2 lớp §12.9 ---------- */
  seed.catalogServicesW2 = (st) => {
    st.servicePrices = st.servicePrices || [];
    const add = (code, name, group, unit, method, price, icon, note) => { if (svcBy(st, code)) return; const o = mk(st, 'services', { code, name, group, unit, method, price, icon, scope: 'all', buildingIds: [], effectiveFrom: '2026-01-01', effectiveTo: '', status: 'active', note }); mk(st, 'priceHistory', { serviceId: o.id, date: '2026-01-01', price, scope: 'Tất cả tòa nhà', userId: null, userName: 'Nguyễn Văn Minh' }); };
    add('VESINH', 'Vệ sinh', 'Dịch vụ chung', 'Tháng', 'per_room', 80000, 'brush', 'Vệ sinh phòng định kỳ (metric CLEANING_REVENUE).');
    add('MAYGIAT', 'Máy giặt', 'Dịch vụ tiện ích', 'Tháng', 'fixed', 100000, 'refresh', 'Máy giặt chung theo tháng (metric WASHING_REVENUE).');
    add('DIENCHUNG', 'Điện chung', 'Dịch vụ chung', 'Tháng', 'per_room', 30000, 'zap', 'Điện khu vực chung chia theo phòng.');
    const q = svcBy(st, 'QUANLY'); if (q && q.name === 'Phí quản lý') { q.name = 'Dịch vụ chung'; q.note = 'Dịch vụ chung theo HĐ mẫu (máy giặt, điện chung, thu rác, vệ sinh chung) – tính theo người.'; }
    // Giá GLOBAL từ services.price; scope theo tòa cũ (services.scope='buildings') → mỗi tòa 1 dòng BUILDING cùng giá
    st.services.forEach(s => {
      if (!s) return;
      if (!st.servicePrices.some(p => p && p.serviceId === s.id && p.scope === 'GLOBAL')) mk(st, 'servicePrices', { serviceId: s.id, scope: 'GLOBAL', buildingId: null, price: Number(s.price) || 0, effectiveFrom: s.effectiveFrom || '2026-01-01', effectiveTo: '', status: 'active', approvedBy: null, reason: 'Giá mặc định toàn hệ thống' });
      if (s.scope === 'buildings') (s.buildingIds || []).forEach(bid => { if (!st.servicePrices.some(p => p && p.serviceId === s.id && p.scope === 'BUILDING' && p.buildingId === bid)) mk(st, 'servicePrices', { serviceId: s.id, scope: 'BUILDING', buildingId: bid, price: Number(s.price) || 0, effectiveFrom: s.effectiveFrom || '2026-01-01', effectiveTo: '', status: 'active', approvedBy: null, reason: 'Chuyển từ phạm vi theo tòa (schema cũ)' }); });
    });
    // Kịch bản §12.8.10: Tòa Sunrise có giá điện riêng 3.800 (mặc định 3.500) để demo xung đột giá OCR (HĐ mẫu ghi 4.000)
    const dien = svcBy(st, 'DIEN'), sun = bByName(st, 'Tòa Sunrise'); const admin = userBy(st, 'admin');
    if (dien && sun && !st.servicePrices.some(p => p && p.serviceId === dien.id && p.scope === 'BUILDING' && p.buildingId === sun.id)) { mk(st, 'servicePrices', { serviceId: dien.id, scope: 'BUILDING', buildingId: sun.id, price: 3800, effectiveFrom: '2026-07-01', effectiveTo: '', status: 'active', approvedBy: admin ? admin.id : null, reason: 'Giá điện riêng tòa Sunrise theo HĐ đầu vào mới' }); mk(st, 'priceHistory', { serviceId: dien.id, date: '2026-07-01', price: 3800, scope: 'Tòa Sunrise', userId: admin ? admin.id : null, userName: 'Nguyễn Văn Minh' }); }
    const nuoc = svcBy(st, 'NUOC'), ocean = bByName(st, 'Tòa Ocean');
    if (nuoc && ocean && !st.servicePrices.some(p => p && p.serviceId === nuoc.id && p.scope === 'BUILDING' && p.buildingId === ocean.id)) mk(st, 'servicePrices', { serviceId: nuoc.id, scope: 'BUILDING', buildingId: ocean.id, price: 25000, effectiveFrom: '2026-09-01', effectiveTo: '', status: 'active', approvedBy: admin ? admin.id : null, reason: 'Giá nước riêng tòa Ocean' });
  };

  /* ---------- Công tơ (§12.10 ERD ROOM ||--o{ METER) & chuẩn hóa chỉ số ---------- */
  const seedMeters = (st) => {
    st.meters = st.meters || [];
    st.rooms.forEach(r => { if (!r) return; ['electric', 'water'].forEach(type => { if (st.meters.some(m => m && m.roomId === r.id && m.type === type && m.status !== 'replaced')) return; mk(st, 'meters', { roomId: r.id, buildingId: r.buildingId, type, code: (type === 'electric' ? 'CTD-' : 'DHN-') + String(r.code || '').replace(/[^A-Za-z0-9]/g, ''), unit: type === 'electric' ? 'kWh' : 'm³', installedAt: '2026-01-01', status: 'active', note: '' }); }); });
    st.meterReadings.forEach(m => { if (!m) return; if (!m.meterId) { const mt = st.meters.find(x => x && x.roomId === m.roomId && x.type === m.type && x.status !== 'replaced'); if (mt) m.meterId = mt.id; } if (!m.readingType) m.readingType = 'PERIOD'; if (!m.readingDate && m.period) m.readingDate = F.toISO(new Date(Number(m.period.slice(0, 4)), Number(m.period.slice(5, 7)), 0)); if (!m.unit) m.unit = m.type === 'electric' ? 'kWh' : 'm³'; });
  };

  /* ---------- Người thuê theo HĐ (§4.8: người ở cùng là hồ sơ khách riêng) ---------- */
  const seedContractTenants = (st) => {
    st.contractTenants = st.contractTenants || [];
    const findTenant = (m) => { const id = digits(m.idNumber), ph = digits(m.phone); return st.tenants.find(t => t && ((id && digits(t.idNumber) === id) || (ph && digits(t.phone) === ph))) || null; };
    st.contracts.forEach(c => {
      if (!c) return;
      if (!st.contractTenants.some(x => x && x.contractId === c.id && x.role === 'primary')) mk(st, 'contractTenants', { contractId: c.id, tenantId: c.tenantId, role: 'primary', name: (st.tenants.find(t => t && t.id === c.tenantId) || {}).name || '', from: c.start, to: '', note: '' });
      st.contractMembers.filter(m => m && m.contractId === c.id && !/chính/i.test(m.relation || '')).forEach(m => {
        if (st.contractTenants.some(x => x && x.contractId === c.id && x.role === 'cohabitant' && x.name === m.name)) return;
        let t = findTenant(m);
        if (!t && digits(m.idNumber).length === 12 && ['active', 'draft'].includes(c.status)) t = mk(st, 'tenants', { code: 'KH' + F.pad(st.tenants.length + 1, 5), name: m.name, phone: m.phone || '', zalo: m.phone || '', email: '', idNumber: digits(m.idNumber), idPlace: '', dob: m.dob || '', job: '', segment: '', address: '', verified: false, managerId: c.managerId || null, status: 'active', note: 'Người ở cùng HĐ ' + c.code + ' (tách hồ sơ theo §4.8)', createdAt: c.createdAt || '2026-01-01T08:00' });
        mk(st, 'contractTenants', { contractId: c.id, tenantId: t ? t.id : null, role: 'cohabitant', name: m.name, dob: m.dob || '', idNumber: m.idNumber || '', phone: m.phone || '', relation: m.relation || '', from: c.start, to: '', note: t ? '' : 'Chưa liên kết hồ sơ khách (thiếu CCCD/SĐT)' });
      });
    });
  };

  /* ---------- Deposit Ledger (§10.11): RECEIVABLE/RECEIVED/TRANSFERRED/DEDUCTED/OFFSET/REFUNDED/FORFEITED ---------- */
  const seedDepositLedger = (st) => {
    st.depositLedger = st.depositLedger || [];
    const has = (cid, type, refId) => st.depositLedger.some(x => x && x.contractId === cid && x.type === type && (!refId || x.refId === refId));
    st.contracts.forEach(c => {
      if (!c || !(Number(c.deposit) > 0)) return;
      const amount = Number(c.deposit);
      if (c.depositCarriedFrom) { if (!has(c.id, 'TRANSFERRED')) mk(st, 'depositLedger', { contractId: c.id, tenantId: c.tenantId, buildingId: c.buildingId, roomId: c.roomId, type: 'TRANSFERRED', amount, date: c.start, refType: 'contract', refId: c.renewedFromId || null, note: 'Chuyển tiếp cọc từ ' + c.depositCarriedFrom, createdAt: c.createdAt }); }
      else {
        if (!has(c.id, 'RECEIVABLE')) mk(st, 'depositLedger', { contractId: c.id, tenantId: c.tenantId, buildingId: c.buildingId, roomId: c.roomId, type: 'RECEIVABLE', amount, date: c.signedDate || c.start, refType: 'contract', refId: c.id, note: 'Cọc theo hợp đồng', createdAt: c.createdAt });
        if ((c.depositPaymentId || c.status === 'active' || c.status === 'ended') && !has(c.id, 'RECEIVED')) mk(st, 'depositLedger', { contractId: c.id, tenantId: c.tenantId, buildingId: c.buildingId, roomId: c.roomId, type: 'RECEIVED', amount, date: c.depositPaidAt || c.start, refType: c.depositPaymentId ? 'payment' : 'contract', refId: c.depositPaymentId || c.id, note: c.depositPaymentId ? 'Phiếu thu cọc' : 'Đã thu cọc (dữ liệu chuyển đổi)', createdAt: c.createdAt });
      }
      if (c.renewedToId && !has(c.id, 'TRANSFERRED_OUT')) { const n = st.contracts.find(x => x && x.id === c.renewedToId); if (n && n.depositCarriedFrom) mk(st, 'depositLedger', { contractId: c.id, tenantId: c.tenantId, buildingId: c.buildingId, roomId: c.roomId, type: 'TRANSFERRED_OUT', amount: -amount, date: n.start, refType: 'contract', refId: n.id, note: 'Chuyển cọc sang ' + n.code, createdAt: n.createdAt }); }
    });
    st.refunds.forEach(rf => {
      if (!rf) return;
      const ded = Number(rf.deductionsTotal) || 0, debt = rf.offsetDebt ? (Number(rf.debt) || 0) : 0;
      if (['approved', 'refunded'].includes(rf.status)) {
        if (ded > 0 && !has(rf.contractId, 'DEDUCTED', rf.id)) mk(st, 'depositLedger', { contractId: rf.contractId, tenantId: rf.tenantId, buildingId: rf.buildingId, roomId: rf.roomId, type: 'DEDUCTED', amount: -ded, date: rf.approvedAt ? rf.approvedAt.slice(0, 10) : rf.requestDate, refType: 'refund', refId: rf.id, note: 'Khấu trừ theo hồ sơ ' + rf.code, createdAt: rf.createdAt });
        if (debt > 0 && !has(rf.contractId, 'OFFSET', rf.id)) mk(st, 'depositLedger', { contractId: rf.contractId, tenantId: rf.tenantId, buildingId: rf.buildingId, roomId: rf.roomId, type: 'OFFSET', amount: -debt, date: rf.approvedAt ? rf.approvedAt.slice(0, 10) : rf.requestDate, refType: 'refund', refId: rf.id, note: 'Bù trừ công nợ ' + rf.code, createdAt: rf.createdAt });
      }
      if (rf.status === 'refunded' && !has(rf.contractId, 'REFUNDED', rf.id)) mk(st, 'depositLedger', { contractId: rf.contractId, tenantId: rf.tenantId, buildingId: rf.buildingId, roomId: rf.roomId, type: 'REFUNDED', amount: -(Number(rf.refundAmount) || 0), date: rf.paidDate || rf.requestDate, refType: 'refund', refId: rf.id, note: 'Hoàn cọc ' + rf.code + (rf.paidRef ? ' · ' + rf.paidRef : ''), createdAt: rf.createdAt });
    });
    // HĐ đã kết thúc do vi phạm, không có hồ sơ hoàn cọc → cọc bị giữ lại (FORFEITED)
    st.contracts.filter(c => c && c.status === 'ended' && !c.renewedToId && Number(c.deposit) > 0 && /vi phạm|phá/i.test(c.endReason || '') && !st.refunds.some(r => r && r.contractId === c.id)).forEach(c => { if (!has(c.id, 'FORFEITED')) mk(st, 'depositLedger', { contractId: c.id, tenantId: c.tenantId, buildingId: c.buildingId, roomId: c.roomId, type: 'FORFEITED', amount: -Number(c.deposit), date: c.actualEnd || c.end, refType: 'contract', refId: c.id, note: 'Giữ lại cọc: ' + c.endReason, createdAt: c.createdAt }); });
  };

  /* ---------- Điều khoản thanh toán / gia hạn mặc định cho HĐ hiện có ---------- */
  const seedTerms = (st) => {
    st.contractPaymentTerms = st.contractPaymentTerms || []; st.contractRenewalClauses = st.contractRenewalClauses || []; st.contractHandoverAssets = st.contractHandoverAssets || [];
    st.contracts.filter(c => c && ['active', 'draft'].includes(c.status)).forEach(c => {
      if (!st.contractPaymentTerms.some(x => x && x.contractId === c.id)) mk(st, 'contractPaymentTerms', { contractId: c.id, notifyDay: 25, payFrom: 25, payTo: 30, dueDay: c.payDay || 5, method: 'Chuyển khoản', bankName: 'BIDV', bankAccountName: 'CÔNG TY TIMOHOUSE', bankAccountNo: '2120368058', transferTemplate: '{room} - {building} - {customer_name}', lateFeePerDay: 200000, graceDays: 3, source: 'migration', note: 'Điều khoản mặc định (dữ liệu chuyển đổi)' });
      if (!st.contractRenewalClauses.some(x => x && x.contractId === c.id)) mk(st, 'contractRenewalClauses', { contractId: c.id, renewalType: 'AUTO_RENEW_CLAUSE', renewalMonths: 12, noticeDays: 30, rawClause: 'Trước 30 ngày hết hạn, nếu hai bên không có ý kiến thì hợp đồng mặc nhiên kéo dài thêm 12 tháng.', source: 'migration' });
    });
  };

  /* ---------- OCR Job (§12.8.3) từ ocrExtractions cũ ---------- */
  const STATUS_MAP = { uploaded: 'UPLOADED', extracting: 'PROCESSING', review: 'READY_FOR_REVIEW', created: 'COMMITTED' };
  const seedOcrJobs = (st) => {
    st.ocrJobs = st.ocrJobs || [];
    (st.ocrExtractions || []).forEach(o => {
      if (!o || st.ocrJobs.some(j => j && j.id === o.id)) return;
      const j = Object.assign({}, o, { status: STATUS_MAP[o.status] || 'READY_FOR_REVIEW', legacyStatus: o.status, docType: 'contract', engine: 'mock-1', fileHash: o.fileHash || ('legacy-' + o.id), idempotencyKey: o.idempotencyKey || ('ocr:' + o.id), uploadedBy: o.createdBy || null, uploadedAt: o.createdAt, processedAt: o.extractedAt || null, processingMs: null, error: '', decisions: o.decisions || {}, result: o.contractId ? { contractId: o.contractId, entities: [] } : null });
      (j.fields || []).forEach(f => { if (!f) return; if (f.raw == null) f.raw = f.value; if (f.normalized == null) f.normalized = f.value; if (!f.decision) f.decision = f.confirmed ? 'accept' : 'pending'; if (f.page == null) f.page = 1; });
      st.ocrJobs.push(j);
    });
    st.ocrExtractions = [];
  };

  /* ---------- Kịch bản demo §12.8.6: khách có CCCD trùng với HĐ mẫu nhưng SĐT khác → cảnh báo bắt buộc review ---------- */
  const seedTenantScenario = (st) => {
    const t = st.tenants.find(x => x && x.name === 'Nguyễn Thị Hương' && !x.idNumber);
    if (t) { t.idNumber = '023456789012'; t.dob = t.dob || '1996-05-12'; t.idPlace = t.idPlace || 'Cục Cảnh Sát'; t.note = (t.note ? t.note + ' · ' : '') + 'Đang giữ chỗ – hồ sơ có CCCD, SĐT khác với HĐ giấy (demo match OCR §12.8.6)'; }
  };

  seed.migrateW2 = (st) => {
    ['servicePrices', 'meters', 'depositLedger', 'contractTenants', 'contractHandoverAssets', 'contractPaymentTerms', 'contractRenewalClauses', 'ocrJobs'].forEach(c => { if (!Array.isArray(st[c])) st[c] = []; });
    if (st.meta.w2Migrated) return st;
    seed.catalogServicesW2(st);
    seedMeters(st); seedContractTenants(st); seedDepositLedger(st); seedTerms(st); seedOcrJobs(st); seedTenantScenario(st);
    st.meta.w2Migrated = true; st.meta.w2MigratedAt = F.nowISO();
    return st;
  };
})(window.TH);
