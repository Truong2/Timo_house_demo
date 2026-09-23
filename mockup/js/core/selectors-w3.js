/* Selectors – Spec v1.8 Wave 3: state machine phòng (§12.5.3) & hợp đồng (§12.7.3), lịch sử trạng thái/giá phòng, sự kiện HĐ, trạng thái khách + cờ suy diễn (§4.8),
   Work Queue HĐ sắp hết (§12.15), kỳ hóa đơn (§12.11.1), chỉ số điện nước theo kỳ (§12.10), thu tiền thừa/tạm ứng/chưa xác định (§4.15), KPI Dashboard (§4.1). */
(function (TH) {
  const F = TH.f, St = TH.store, Q = TH.q;
  const raw = c => St.rawAll(c).filter(Boolean);
  /* ---- Nhãn ---- */
  Object.assign(Q.L.room, { vacating: ['Sắp trống', 'purple'], inactive: ['Ngừng khai thác', 'gray'] });
  Object.assign(Q.L.contract, { pending_approval: ['Chờ duyệt', 'amber'], pending_renewal: ['Chờ gia hạn', 'purple'], pending_end: ['Chờ kết thúc', 'orange'], pending_settlement: ['Chờ quyết toán', 'red'] });
  Object.assign(Q.L.invPay, { overpaid: ['Thu thừa', 'purple'] });
  Q.L.endType = { on_time: ['Trả đúng hạn', 'green'], early_tenant: ['Khách chấm dứt sớm', 'amber'], early_company: ['Bên cho thuê chấm dứt', 'orange'], breach: ['Phá hợp đồng', 'red'], renew: ['Kết thúc để gia hạn', 'blue'], other: ['Khác', 'gray'] };
  Q.L.followUp = { renew: ['Gia hạn', 'green'], on_time: ['Trả phòng đúng hạn', 'blue'], early: ['Chấm dứt sớm', 'red'], no_response: ['Chưa phản hồi', 'gray'], contacted: ['Đã liên hệ', 'teal'] };
  Q.L.paymentKind = { normal: ['Thu tiền', 'green'], overpaid: ['Thu thừa', 'purple'], advance: ['Tạm ứng', 'blue'], unidentified: ['Chưa xác định', 'amber'], deposit: ['Thu cọc', 'teal'] };
  Q.L.billingPeriod = { OPEN: ['Đang mở', 'green'], REVIEWING: ['Đang rà soát', 'amber'], LOCKED: ['Đã khóa', 'gray'] };
  Q.L.readingStatus = { draft: ['Nháp', 'gray'], confirmed: ['Đã xác nhận', 'green'], used: ['Đã dùng hóa đơn', 'blue'], reopened: ['Mở lại', 'amber'] };
  Q.L.lcontract = { draft: ['Dự thảo', 'gray'], active: ['Đang hiệu lực', 'green'], expiring: ['Sắp hết hạn', 'amber'], ended: ['Đã kết thúc', 'gray'] };
  Q.L.hkd = { unregistered: ['Chưa đăng ký HKD', 'amber'], registered: ['Đã đăng ký HKD', 'green'] };
  Q.L.pccc = { none: ['Chưa có', 'red'], valid: ['Còn hiệu lực', 'green'], expired: ['Hết hạn', 'red'] };
  Q.L.contractType = { new: ['HĐ mới', 'blue'], renewal: ['Gia hạn', 'purple'], transfer: ['Chuyển phòng', 'teal'] };
  Q.L.lineType = { RENT: ['Tiền phòng', 'blue'], SERVICE: ['Dịch vụ', 'teal'], PENALTY: ['Phạt', 'red'], ADJUSTMENT: ['Điều chỉnh', 'amber'], OTHER: ['Khoản khác', 'gray'] };
  Object.assign(Q.L.docType, { annex: ['Phụ lục HĐ', 'blue'], pccc: ['PCCC', 'red'], deed: ['Sổ đỏ', 'purple'], receipt: ['Chứng từ', 'gray'], photo: ['Ảnh', 'gray'], ocr: ['File OCR', 'purple'] });
  Q.DOC_TYPES = () => Object.entries(Q.L.docType).map(([k, v]) => [k, v[0]]);
  Q.ROOM_TRANSITIONS = { ready: ['held', 'maintenance', 'inactive'], held: ['ready'], occupied: ['vacating'], vacating: ['cleaning'], cleaning: ['ready', 'maintenance'], maintenance: ['ready'], inactive: ['ready'] };
  Q.contractStatus = (c) => { if (!c) return 'ended'; if (c.status === 'active' && F.daysUntil(c.end) <= 35) return 'expiring'; return c.status; };
  Q.contractLive = (c) => !!c && ['active', 'pending_renewal', 'pending_end'].includes(c.status); // HĐ còn ràng buộc phòng
  Q.endReasonOptions = () => { const md = Q.md('contractEndReason'); return md.length ? md.map(m => [m.code, m.name]) : Object.entries(Q.L.endType).map(([k, v]) => [k, v[0]]); };
  Q.customerStatusOptions = () => { const md = Q.md('customerStatus'); return md.length ? md.map(m => [m.code, m.name]) : [['active', 'Đang hoạt động'], ['inactive', 'Ngừng hợp tác'], ['blocked', 'Hạn chế']]; };
  Q.customerStatusChip = (t) => { const m = Q.mdItem('customerStatus', t.status || 'active'); return TH.ui.chip(m ? m.name : (t.status || 'active'), m ? (m.color || 'gray') : 'gray'); };

  /* ---- Phòng: lịch sử trạng thái / giá (§12.5) ---- */
  Q.roomStatusHistory = (roomId) => raw('roomStatusHistory').filter(x => x.roomId === roomId).sort((a, b) => F.cmp(b.at || '', a.at || ''));
  Q.roomPriceHistory = (roomId) => raw('roomPriceHistory').filter(x => x.roomId === roomId).sort((a, b) => F.cmp(b.effectiveFrom, a.effectiveFrom));
  Q.roomPriceAt = (roomId, date = F.today()) => { const h = raw('roomPriceHistory').filter(x => x.roomId === roomId && x.effectiveFrom <= date).sort((a, b) => F.cmp(b.effectiveFrom, a.effectiveFrom))[0]; return h ? Number(h.price) : Number((St.rawGet('rooms', roomId) || {}).price) || 0; };
  Q.roomStatusAt = (roomId, date) => { const h = raw('roomStatusHistory').filter(x => x.roomId === roomId && (x.at || '').slice(0, 10) <= date).sort((a, b) => F.cmp(b.at, a.at))[0]; return h ? h.to : (St.rawGet('rooms', roomId) || {}).status; };
  Q.roomStats = (rooms) => { const s = { total: rooms.length, ready: 0, held: 0, occupied: 0, vacating: 0, cleaning: 0, maintenance: 0, inactive: 0 }; rooms.forEach(r => s[r.status] = (s[r.status] || 0) + 1); s.occupancy = s.total ? Math.round(((s.occupied + s.vacating) / Math.max(1, s.total - s.inactive)) * 100) : 0; return s; };
  Q.roomKpis = (rooms) => { const s = Q.roomStats(rooms); const bIds = new Set(rooms.map(r => r.buildingId)); return Object.assign(s, { buildings: bIds.size }); };

  /* ---- Hợp đồng: sự kiện, chuỗi gia hạn, KPI ---- */
  Q.contractEvents = (contractId) => raw('contractEvents').filter(x => x.contractId === contractId).sort((a, b) => F.cmp(a.date || a.at, b.date || b.at));
  Q.contractChain = (c) => { const out = []; let x = c; let g = 0; while (x && x.renewedFromId && g++ < 20) { x = St.rawGet('contracts', x.renewedFromId); if (x) out.unshift(x); } out.push(c); x = c; g = 0; while (x && x.renewedToId && g++ < 20) { x = St.rawGet('contracts', x.renewedToId); if (x) out.push(x); } return out; };
  Q.contractPayments = (contractId) => { const invIds = new Set(raw('invoices').filter(i => i.contractId === contractId).map(i => i.id)); const payIds = new Set(raw('paymentAllocations').filter(a => invIds.has(a.invoiceId)).map(a => a.paymentId)); return raw('payments').filter(p => payIds.has(p.id) || (p.contractId === contractId)).sort((a, b) => F.cmp(b.date, a.date)); };
  Q.contractKpis = (contracts) => { const cs = contracts.filter(c => c && c.status !== 'cancelled'); const k = { active: 0, expiring: 0, within35: 0, pending_renewal: 0, pending_end: 0, pending_settlement: 0, pending_approval: 0, breach: 0, draft: 0 }; const period = St.state.meta.period; cs.forEach(c => { const s = Q.contractStatus(c); if (s === 'active' || s === 'expiring') k.active++; if (s === 'expiring') { k.expiring++; k.within35++; } if (k[c.status] !== undefined && !['active'].includes(c.status)) k[c.status]++; if (c.status === 'ended' && c.endType === 'breach' && String(c.actualEnd || '').slice(0, 7) === period) k.breach++; }); return k; };

  /* ---- Khách: trạng thái (field) + cờ suy diễn (§4.8) ---- */
  Q.tenantFlags = (t) => {
    const cs = Q.contractsOfTenant(t.id); const act = cs.find(c => Q.contractLive(c)); const co = raw('contractTenants').filter(x => x.tenantId === t.id && x.role === 'cohabitant' && !x.to).map(x => St.rawGet('contracts', x.contractId)).filter(c => c && Q.contractLive(c));
    const debt = Q.tenantDebt(t.id);
    return { activeContract: act || null, cohabitantOf: co, expiring: !!act && Q.contractStatus(act) === 'expiring', pendingEnd: !!act && ['pending_end', 'pending_settlement'].includes(act.status), debt, hasDebt: debt > 0, awaitingRefund: !!St.one('refunds', r => r.tenantId === t.id && ['draft', 'pending', 'approved', 'needs_edit'].includes(r.status)), held: !!St.one('holds', h => h.tenantId === t.id && (!Q.holdActive || Q.holdActive(h))), zalo: !!(t.zaloLinked || t.zaloId), movedOut: !act && cs.some(c => c.status === 'ended') };
  };
  Q.tenantFlagChips = (t, fl = Q.tenantFlags(t)) => { const U = TH.ui; const out = []; if (fl.activeContract) out.push(U.chip(fl.pendingEnd ? 'Chờ kết thúc' : 'Có HĐ hiệu lực', fl.pendingEnd ? 'orange' : 'green')); if (fl.expiring) out.push(U.chip('Sắp hết HĐ', 'amber')); if (fl.cohabitantOf.length) out.push(U.chip('Người ở cùng', 'teal')); if (fl.hasDebt) out.push(U.chip('Còn công nợ', 'red')); if (fl.awaitingRefund) out.push(U.chip('Chờ hoàn cọc', 'amber')); if (fl.held) out.push(U.chip('Đang giữ chỗ', 'amber')); if (fl.zalo) out.push(U.chip('Zalo', 'blue')); if (!fl.activeContract && fl.movedOut) out.push(U.chip('Đã trả phòng', 'gray')); return out.join(' '); };
  Q.tenantRoomNow = (t) => { const fl = Q.tenantFlags(t); const c = fl.activeContract || fl.cohabitantOf[0]; return c ? Q.room(c.roomId) : null; };
  Q.tenantVehicles = (t) => Q.contractsOfTenant(t.id).filter(c => Q.contractLive(c)).flatMap(c => (c.vehicles || []).map(v => Object.assign({ contract: c }, v)));
  Q.tenantPayments = (tenantId) => raw('payments').filter(p => p.tenantId === tenantId).sort((a, b) => F.cmp(b.date, a.date));

  /* ---- Work Queue HĐ sắp hết (§12.15) ---- */
  Q.followUps = (contractId) => raw('contractFollowUps').filter(x => x.contractId === contractId).sort((a, b) => F.cmp(b.at, a.at));
  Q.expiringQueue = (f = {}) => {
    const days = Number(f.days || 35); const scope = Q.scope(f);
    return raw('contracts').filter(c => Q.contractLive(c) && (!c.renewedToId || c.status === 'pending_renewal') && F.daysUntil(c.end) <= days && scope.buildingIds.includes(c.buildingId)).map(c => { const fu = Q.followUps(c.id); const last = fu[0] || null; const decided = fu.find(x => x.result && x.result !== 'contacted' && x.result !== 'no_response') || null; return { c, tenant: Q.tenant(c.tenantId), room: Q.room(c.roomId), building: Q.building(c.buildingId), cohabitants: Q.contractCohabitants(c.id).filter(x => !x.to), manager: Q.buildingManager(c.buildingId), daysLeft: F.daysUntil(c.end), debt: Q.contractDebt(c.id), last, result: decided ? decided.result : (last ? last.result : ''), deadline: last && last.nextDeadline ? last.nextDeadline : F.addDays(c.end, -(Q.contractNoticeDays(c) || 30)), assigneeId: c.followUpAssigneeId || null, followUps: fu }; }).sort((a, b) => a.daysLeft - b.daysLeft);
  };

  /* ---- Kỳ hóa đơn (§12.11.1) ---- */
  Q.billingPeriod = (period) => raw('billingPeriods').find(p => p.code === period) || null;
  Q.billingPeriods = () => raw('billingPeriods').sort((a, b) => F.cmp(b.code, a.code));
  Q.periodLockedW3 = (period) => { const bp = Q.billingPeriod(period); return !!bp && bp.status === 'LOCKED'; };
  const lock0 = Q.periodLocked; Q.periodLocked = (period) => Q.periodLockedW3(period) || (lock0 ? lock0(period) : false);
  Q.periodStats = (period) => { const invs = raw('invoices').filter(i => i.period === period && i.docStatus !== 'cancelled'); const issued = invs.filter(i => i.docStatus !== 'draft'); return { invoices: invs.length, drafts: invs.length - issued.length, issued: issued.length, total: F.sum(issued, i => i.total), collected: F.sum(issued, i => Q.invPaid(i)), readings: raw('meterReadings').filter(m => m.period === period && m.readingType !== 'OPENING').length, readingsPending: raw('meterReadings').filter(m => m.period === period && m.status === 'draft').length, payments: raw('payments').filter(p => F.period(p.date) === period).length, expenses: raw('expenses').filter(e => F.period(e.date) === period).length }; };

  /* ---- Điện nước theo kỳ (§12.10) ---- */
  Q.meterRows = (period, f = {}) => {
    const scope = Q.scope(f); const rooms = raw('rooms').filter(r => scope.buildingIds.includes(r.buildingId) && (!f.buildingId || r.buildingId === f.buildingId) && (!f.roomId || r.id === f.roomId));
    return rooms.map(r => { const c = raw('contracts').find(x => x.roomId === r.id && Q.contractLive(x) && x.start <= period + '-31'); const mk = (type) => { const isP = (m) => !m.readingType || m.readingType === 'PERIOD'; const meter = Q.meter(r.id, type); if (type === 'water' && r.source === 'workbook' && Q.building(r.buildingId).code === 'G1' && !meter && !raw('meterReadings').some(m => m.roomId === r.id && m.type === 'water')) return { type, meter: null, cur: null, prev: null, prevValue: null, use: null, prevUse: null, issues: [], notApplicable: true, people: r.people }; const cur = raw('meterReadings').filter(m => m.roomId === r.id && m.type === type && m.period === period && isP(m)).sort((a, b) => F.cmp(b.createdAt || '', a.createdAt || ''))[0] || null; const prevList = raw('meterReadings').filter(m => m.roomId === r.id && m.type === type && ((m.period && m.period < period) || m.readingType === 'OPENING') && m.status !== 'reopened' && m.readingType !== 'CLOSING').sort((a, b) => F.cmp(b.period || b.readingDate || '', a.period || a.readingDate || '')); const prev = prevList[0] || null; const prevUse = prevList[0] && prevList[1] ? Number(prevList[0].curr) - Number(prevList[1].curr) : null; const use = cur ? Number(cur.curr) - Number(cur.prev) : null; const issues = []; if (cur && Number(cur.curr) < Number(cur.prev)) issues.push('new<old'); if (!cur && c) issues.push('missing'); const dupes = raw('meterReadings').filter(m => m.roomId === r.id && m.type === type && m.period === period && isP(m) && m.status !== 'reopened').length; if (dupes > 1) issues.push('duplicate'); if (cur && prevUse != null && prevUse > 0 && use != null && Math.abs(use - prevUse) / prevUse > 0.5) issues.push('abnormal'); return { type, meter, cur, prev, prevValue: cur ? Number(cur.prev) : (prev ? Number(prev.curr) : 0), use, prevUse, issues }; }; return { room: r, building: Q.building(r.buildingId), contract: c || null, tenant: c ? Q.tenant(c.tenantId) : null, electric: mk('electric'), water: mk('water') }; }).sort((a, b) => F.cmp(a.building.name, b.building.name) || F.cmp(a.room.code, b.room.code));
  };
  Q.METER_ISSUE = { 'new<old': ['Mới < cũ', 'red'], missing: ['Thiếu chỉ số', 'amber'], duplicate: ['Trùng kỳ', 'red'], abnormal: ['Bất thường ±50%', 'orange'] };
  Q.meterPeriods = () => [...new Set(raw('meterReadings').filter(m => m.period).map(m => m.period))].sort().reverse();

  /* ---- Thu tiền: thu thừa / tạm ứng / chưa xác định (§4.15) ---- */
  Q.paymentKind = (p) => { if (p.kind === 'deposit') return 'deposit'; if (!p.tenantId || p.unidentified) return 'unidentified'; const alloc = F.sum(raw('paymentAllocations').filter(a => a.paymentId === p.id), a => a.amount); const un = Number(p.amount) - alloc; if (un > 0.5) return p.advance ? 'advance' : 'overpaid'; return 'normal'; };
  Q.paymentUnallocated = (p) => Number(p.amount) - F.sum(raw('paymentAllocations').filter(a => a.paymentId === p.id), a => a.amount);
  Q.invPayStatusW3 = (inv) => { const paid = Q.invPaid(inv); if (paid > inv.total + 0.5) return 'overpaid'; return Q.invPayStatus(inv); };
  Q.receivableSummary = (rows, dim) => { const map = {}; rows.forEach(x => { const inv = x.inv; const key = dim === 'building' ? inv.buildingId : dim === 'manager' ? (Q.buildingManager(inv.buildingId) || {}).id || 'none' : dim === 'room' ? inv.roomId : inv.tenantId; const g = map[key] = map[key] || { key, label: dim === 'building' ? Q.building(inv.buildingId).name : dim === 'manager' ? Q.buildingManagerName(inv.buildingId) : dim === 'room' ? Q.room(inv.roomId).code + ' · ' + Q.building(inv.buildingId).name : Q.tenant(inv.tenantId).name, total: 0, paid: 0, remaining: 0, overdue: 0, count: 0 }; g.total += inv.total; g.paid += x.paid; g.remaining += x.remaining; if (x.overdueDays > 0) g.overdue += x.remaining; g.count++; }); return Object.values(map).sort((a, b) => b.remaining - a.remaining); };

  /* ---- HĐ đầu vào (§12.3) ---- */
  Q.lcStatus = (c) => !c ? 'ended' : c.status === 'draft' ? 'draft' : (c.status === 'ended' || c.end < F.today()) ? 'ended' : F.daysUntil(c.end) <= 90 ? 'expiring' : 'active';
  Q.landlordContractOf = (bId, date = F.today()) => Q.buildingContracts(bId).filter(c => c.status !== 'ended' && c.status !== 'draft' && c.start <= date && c.end >= date)[0] || null;
  Q.lcPriceAt = (lc, date = F.today()) => { const sch = (lc.priceSchedule || []).filter(x => x.from <= date).sort((a, b) => F.cmp(b.from, a.from))[0]; return sch ? Number(sch.price) : Number(lc.rent) || 0; };
  Q.pcccStatus = (lc) => !lc || !lc.pccc || !lc.pccc.status || lc.pccc.status === 'none' ? 'none' : (lc.pccc.expiry && lc.pccc.expiry < F.today() ? 'expired' : 'valid');
  Q.documentsOf = (entityType, entityId, opts = {}) => raw('documents').filter(d => d.entityType === entityType && d.entityId === entityId && (opts.all || !d.supersededById)).sort((a, b) => F.cmp(b.date || '', a.date || ''));
  Q.documentVersions = (doc) => { const out = [doc]; let d = doc; let g = 0; while (d && d.supersedesId && g++ < 20) { d = St.rawGet('documents', d.supersedesId); if (d) out.push(d); } return out; };

  /* ---- Work queue mở rộng ---- */
  const todo1 = Q.todo; Q.todo = () => { const t = todo1(); t.draftInvoices = raw('invoices').filter(i => i.docStatus === 'draft').length; t.settlementPending = raw('contracts').filter(c => ['pending_end', 'pending_settlement'].includes(c.status)).length; t.refundsApproval = raw('refunds').filter(r => r.status === 'pending').length; t.cleaningRooms = raw('rooms').filter(r => r.status === 'cleaning').length; t.expenseImportErrors = raw('importJobs').filter(j => j.type === 'expense' && (j.error || 0) > 0).length; t.debtors = new Set(raw('invoices').filter(i => i.docStatus !== 'draft' && i.docStatus !== 'cancelled' && Q.invRemaining(i) > 0).map(i => i.tenantId)).size; t.pendingApproval = raw('contracts').filter(c => c.status === 'pending_approval').length; t.total += t.settlementPending; return t; };
})(window.TH);

