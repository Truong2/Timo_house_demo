/* Selectors – Spec v1.8 Wave 4: mốc thu M1/M2/M3 (§4.26.2), hiệu suất thu tiền theo NV × tòa (§4.26.1/§12.20), Payroll Rule Version (§4.26.4),
   bảng lương cấu phần §4.26.5, chi lương (§4.26.8), danh mục chi phí §4.27.3 + phân bổ (§4.27.7/§12.21.4), KPI tài chính dashboard (§4.1). */
(function (TH) {
  const F = TH.f, Q = TH.q, St = TH.store;
  const raw = (c) => St.rawAll(c).filter(Boolean);

  /* ---------- Nhãn ---------- */
  Q.L.milestone = { M1: ['Mốc 1', 'green'], M2: ['Mốc 2', 'blue'], M3: ['Mốc 3', 'amber'], LATE: ['Sau mốc 3', 'red'] };
  Q.L.payroll = Object.assign({}, Q.L.payroll || {}, { draft: ['Nháp', 'gray'], review: ['Chờ duyệt', 'amber'], approved: ['Đã duyệt', 'blue'], locked: ['Đã khóa', 'green'], paid: ['Đã chi (cũ)', 'green'] });
  Q.L.salaryPay = { unpaid: ['Chưa chi', 'gray'], partial: ['Chi một phần', 'amber'], paid: ['Đã chi', 'green'], failed: ['Chi lỗi', 'red'], cancelled: ['Đã hủy', 'gray'], adjusted: ['Đã điều chỉnh', 'purple'] };
  Q.L.expenseSource = { manual: ['Nhập tay', 'gray'], import: ['Import', 'blue'], system: ['Sinh từ hệ thống', 'purple'] };
  Q.L.allocMethod = { DIRECT: ['Trực tiếp 1 tòa', 'gray'], ROOM_COUNT: ['Theo số phòng', 'blue'], REVENUE: ['Theo doanh thu', 'green'], BUILDING_COUNT: ['Theo số tòa', 'amber'], MANUAL_RATIO: ['Tỷ lệ nhập tay', 'purple'] };
  Q.L.expensePayMethod = { cash: ['Tiền mặt', 'gray'], bank: ['Chuyển khoản', 'blue'], card: ['Thẻ', 'purple'], other: ['Khác', 'gray'] };
  Q.L.expenseStatus = { draft: ['Nháp', 'gray'], recorded: ['Đã ghi nhận', 'green'], pending_alloc: ['Chờ phân bổ', 'amber'], allocated: ['Đã phân bổ', 'blue'], reversed: ['Đã hủy', 'red'] };
  Q.L.payrollRole = { manager: ['Phụ trách chính', 'blue'], support: ['Hỗ trợ', 'gray'], lead: ['Trưởng nhóm', 'purple'], tech: ['Kỹ thuật', 'amber'], cleaning: ['Vệ sinh', 'teal'] };
  Q.L.expGroup = Object.assign({}, Q.L.expGroup || {}, { 'Hoa hồng': 'purple', 'Giá gốc điện': 'blue', 'Giá gốc nước': 'blue', 'Giá gốc mạng / Internet': 'blue', 'Phí rác': 'blue', 'Phí môi trường': 'blue', 'Bảo trì thang máy': 'blue', 'Tiền thuê nhà': 'blue', 'Mua thêm thiết bị': 'green', 'Thay thế': 'amber', 'Văn phòng': 'gray', 'Chi phí khác': 'gray' });

  /* ---------- Mốc thu M1/M2/M3 (§4.26.2) – ngày thu so với mốc trong tháng của kỳ hóa đơn ---------- */
  Q.milestoneOf = (date, period) => {
    if (!date || !period) return 'LATE';
    const ms = Q.milestones(); const d = String(date).slice(0, 10); const p = F.period(d);
    if (p < period) return ms[0] ? ms[0].code : 'M1'; // thu trước kỳ (tạm ứng) → tính vào mốc 1
    if (p > period) return 'LATE';
    const day = Number(d.slice(8, 10)); const hit = ms.find(m => day <= m.day); return hit ? hit.code : 'LATE';
  };
  Q.allocMilestone = (a) => { if (a.milestone) return a.milestone; const p = St.rawGet('payments', a.paymentId), inv = St.rawGet('invoices', a.invoiceId); return p && inv ? Q.milestoneOf(p.date, inv.period) : 'LATE'; };
  const recordedAllocs = () => { const pays = F.idx(raw('payments')); return raw('paymentAllocations').filter(a => pays[a.paymentId] && pays[a.paymentId].status === 'recorded').map(a => Object.assign({ payment: pays[a.paymentId] }, a)); };
  Q.invMilestones = (inv) => { const r = { M1: 0, M2: 0, M3: 0, LATE: 0, total: 0 }; recordedAllocs().filter(a => a.invoiceId === inv.id).forEach(a => { const m = Q.allocMilestone(a); r[m] = (r[m] || 0) + a.amount; r.total += a.amount; }); return r; };
  Q.invoiceAllocs = (inv) => recordedAllocs().filter(a => a.invoiceId === inv.id).map(a => Object.assign({ milestone: Q.allocMilestone(a) }, a));
  Q.collectionByMilestone = (period, scope) => {
    const ids = scope && scope.buildingIds ? new Set(scope.buildingIds) : null;
    const invs = raw('invoices').filter(i => i.docStatus !== 'draft' && i.docStatus !== 'cancelled' && (!period || period === 'all' || i.period === period) && (!ids || ids.has(i.buildingId)));
    const invIdx = F.idx(invs); const r = { M1: 0, M2: 0, M3: 0, LATE: 0, receivable: F.sum(invs, i => i.total), collected: 0, count: invs.length };
    recordedAllocs().forEach(a => { if (!invIdx[a.invoiceId]) return; const m = Q.allocMilestone(a); r[m] = (r[m] || 0) + a.amount; r.collected += a.amount; });
    r.remaining = Math.max(0, r.receivable - r.collected); r.after3 = r.M1 + r.M2 + r.M3; return r;
  };

  /* ---------- Hiệu suất thu tiền theo tòa/kỳ (§4.26.1, §12.20.1) ---------- */
  const isService = (l) => (l.lineType || '').toUpperCase() === 'SERVICE' || ['service', 'electric', 'water'].includes(l.kind);
  Q.buildingCollection = (buildingId, period) => {
    const endDate = Q.periodEndDate(period);
    const rooms = raw('rooms').filter(r => r.buildingId === buildingId && r.status !== 'inactive');
    // DT niêm yết = Σ giá niêm yết của phòng có HĐ trong kỳ (rent-roll) – giả định chờ chốt §4.26.3; số phòng = toàn bộ phòng khai thác
    const startDate = period + '-01'; const LIVE = ['active', 'pending_renewal', 'pending_end', 'pending_settlement', 'ended'];
    const rented = new Set(raw('contracts').filter(c => c.buildingId === buildingId && LIVE.includes(c.status) && c.start <= endDate && (c.actualEnd || c.end || '9999') >= startDate).map(c => c.roomId));
    const listed = F.sum(rooms.filter(r => rented.has(r.id)), r => Q.roomPriceAt ? Q.roomPriceAt(r.id, endDate) : (r.listPrice || r.price || 0));
    const invs = raw('invoices').filter(i => i.buildingId === buildingId && i.period === period && i.docStatus !== 'draft' && i.docStatus !== 'cancelled');
    const invIdx = F.idx(invs); const receivable = F.sum(invs, i => i.total);
    const service = F.sum(raw('invoiceLines').filter(l => invIdx[l.invoiceId] && isService(l)), l => l.amount);
    const r = { buildingId, period, rooms: rooms.length, listed, receivable, invoices: invs.length, M1: 0, M2: 0, M3: 0, LATE: 0, service, allocs: [] };
    recordedAllocs().forEach(a => { if (!invIdx[a.invoiceId]) return; const m = Q.allocMilestone(a); r[m] += a.amount; r.allocs.push(Object.assign({ milestone: m }, a)); });
    r.after3 = r.M1 + r.M2 + r.M3; r.extra = r.LATE; r.collectedAll = r.after3 + r.LATE; r.serviceRatio = receivable ? r.service / receivable : 0;
    return r;
  };
  // Tổng DT thu được dùng tính hiệu suất – công thức cấu hình trong Payroll Rule (§4.26.3: sheet không lưu công thức gốc → chờ chốt)
  Q.perfCollected = (c, rule) => { const f = (rule && rule.collectedFormula) || 'M123_MINUS_SERVICE_PLUS_EXTRA'; if (f === 'M123') return c.after3; if (f === 'M123_PLUS_EXTRA') return c.after3 + c.extra; if (f === 'M123_MINUS_SERVICE') return Math.max(0, c.after3 - c.service); return Math.max(0, c.after3 - c.service + c.extra); };
  Q.perfEfficiency = (collected, listed) => listed ? Math.round(collected / listed * 1000) / 10 : 0;

  /* ---------- Payroll Rule Version (§4.26.4) ---------- */
  Q.payrollRules = () => raw('payrollRuleVersions').sort((a, b) => F.cmp(b.effectiveFrom, a.effectiveFrom));
  Q.payrollRule = (date, { role } = {}) => Q.payrollRules().find(r => r.status !== 'inactive' && r.effectiveFrom <= date && (!r.effectiveTo || r.effectiveTo >= date) && (!r.roles || !r.roles.length || r.roles.includes(role || 'manager'))) || Q.payrollRules().find(r => r.status !== 'inactive') || null;
  Q.perfRate = (rule, efficiency) => { if (!rule || !rule.tiers) return 0; const t = rule.tiers.slice().sort((a, b) => b.from - a.from).find(x => efficiency >= x.from && (x.to == null || efficiency < x.to)); return t ? Number(t.rate) || 0 : 0; };
  Q.ruleTierLabel = (rule, efficiency) => { if (!rule) return '-'; const t = (rule.tiers || []).find(x => efficiency >= x.from && (x.to == null || efficiency < x.to)); return t ? (t.label || (t.from + '–' + (t.to == null ? '∞' : t.to) + '%')) : '-'; };
  const PERF_ROLES = ['manager', 'support'];
  Q.perfRoles = PERF_ROLES;
  // Dòng NV × tòa "sống" theo assignment hiệu lực tại ngày cuối kỳ (Phụ trách chính + Hỗ trợ) – nguồn để snapshot khi mở kỳ lương
  Q.perfRows = (period, f = {}) => {
    const endDate = Q.periodEndDate(period); const scope = Q.scope({ period, buildingId: f.buildingId, areaId: f.areaId });
    const unitEmp = f.orgUnitId ? new Set(Q.employeesOfUnits(Q.orgDescendants(f.orgUnitId, endDate), endDate).map(e => e.id)) : null;
    const rows = []; const cache = {};
    scope.buildingIds.forEach(bid => { Q.assignmentsAt(bid, endDate).filter(a => PERF_ROLES.includes(a.role)).forEach(a => {
      if (f.employeeId && a.employeeId !== f.employeeId) return; if (unitEmp && !unitEmp.has(a.employeeId)) return; const e = St.rawGet('employees', a.employeeId); if (!e) return;
      const c = cache[bid] = cache[bid] || Q.buildingCollection(bid, period); const rule = Q.payrollRule(endDate, { role: a.role }); const collected = Q.perfCollected(c, rule); const eff = Q.perfEfficiency(collected, c.listed); const rate = Q.perfRate(rule, eff);
      rows.push({ key: a.employeeId + ':' + bid, employeeId: a.employeeId, employee: e, buildingId: bid, building: St.rawGet('buildings', bid) || {}, role: a.role, assignmentId: a.id, period, rooms: c.rooms, listed: c.listed, receivable: c.receivable, M1: c.M1, M2: c.M2, M3: c.M3, after3: c.after3, service: c.service, serviceRatio: c.serviceRatio, extra: c.extra, collected, efficiency: eff, ruleVersionId: rule ? rule.id : null, ruleCode: rule ? rule.code : '-', tier: Q.ruleTierLabel(rule, eff), ratePerRoom: rate, roomSalary: c.rooms * rate });
    }); });
    return rows.sort((a, b) => F.cmp(a.employee.name, b.employee.name) || F.cmp(a.building.name || '', b.building.name || ''));
  };
  Q.perfTotals = (rows) => { const t = { rows: rows.length, rooms: F.sum(rows, r => r.rooms), listed: F.sum(rows, r => r.listed), receivable: F.sum(rows, r => r.receivable), M1: F.sum(rows, r => r.M1), M2: F.sum(rows, r => r.M2), M3: F.sum(rows, r => r.M3), after3: F.sum(rows, r => r.after3), service: F.sum(rows, r => r.service), extra: F.sum(rows, r => r.extra), collected: F.sum(rows, r => r.collected), roomSalary: F.sum(rows, r => r.roomSalary) }; t.efficiency = Q.perfEfficiency(t.collected, t.listed); t.serviceRatio = t.receivable ? t.service / t.receivable : 0; return t; };

  /* ---------- Bảng lương (§4.26.5) ---------- */
  Q.employeePayroll = (e) => { const p = (e && e.payroll) || {}; return { base: Number(p.base != null ? p.base : (e && e.salaryBase) || 0), lunch: Number(p.lunch || 0), fuel: Number(p.fuel || 0), leadAllowance: Number(p.leadAllowance || 0), support: Number(p.support || 0), bankAccount: p.bankAccount || null }; };
  Q.payrollSnapshots = (payrollId, employeeId) => raw('payrollAssignmentSnapshots').filter(s => s.payrollId === payrollId && (!employeeId || s.employeeId === employeeId));
  Q.payrollResults = (payrollId) => raw('payrollResults').filter(r => r.payrollId === payrollId).sort((a, b) => F.cmp(Q.employeeName(a.employeeId), Q.employeeName(b.employeeId)));
  Q.payrollResult = (payrollId, employeeId) => raw('payrollResults').find(r => r.payrollId === payrollId && r.employeeId === employeeId) || null;
  Q.payrollStats = (p) => { const rs = p ? Q.payrollResults(p.id) : []; return { total: F.sum(rs, r => r.net), base: F.sum(rs, r => r.base), allow: F.sum(rs, r => r.lunch + r.fuel + r.leadAllowance + r.support), perf: F.sum(rs, r => r.perfTotal), adjust: F.sum(rs, r => r.adjustmentTotal), deductions: F.sum(rs, r => r.deductions), count: rs.length, commission: 0 }; };
  Q.payrollByBuilding = (p) => { if (!p) return []; const allocs = raw('payrollCostAllocations').filter(a => a.payrollId === p.id); const by = {}; (allocs.length ? allocs : Q.payrollSnapshots(p.id).map(s => ({ buildingId: s.buildingId, amount: s.roomSalary }))).forEach(a => { by[a.buildingId || ''] = (by[a.buildingId || ''] || 0) + a.amount; }); return Object.entries(by).map(([id, v]) => ({ id, label: id ? (Q.building(id).name || '').replace('Tòa ', '') : 'Chung', value: v })).sort((a, b) => b.value - a.value); };
  Q.payrollCostAllocations = (f = {}) => raw('payrollCostAllocations').filter(a => (!f.period || a.period === f.period) && (!f.buildingId || a.buildingId === f.buildingId));
  Q.payrollPeriods = () => [...new Set(raw('payrolls').map(p => p.period).concat(raw('invoices').map(i => i.period)).concat([St.state.meta.period]))].sort().reverse().slice(0, 8);
  Q.payrollHistory = (p) => (p && p.history) || [];

  /* ---------- Chi lương (§4.26.8) ---------- */
  Q.salaryPayments = (f = {}) => raw('salaryPayments').filter(s => (!f.period || s.period === f.period) && (!f.employeeId || s.employeeId === f.employeeId) && (!f.status || s.status === f.status) && (!f.orgUnitId || (() => { const ids = new Set(Q.employeesOfUnits(Q.orgDescendants(f.orgUnitId, Q.periodEndDate(s.period)), Q.periodEndDate(s.period)).map(e => e.id)); return ids.has(s.employeeId); })())).sort((a, b) => F.cmp(Q.employeeName(a.employeeId), Q.employeeName(b.employeeId)));
  Q.salaryTotals = (rows) => ({ count: rows.length, due: F.sum(rows, s => s.amountDue), paid: F.sum(rows, s => s.amountPaid), remaining: F.sum(rows, s => Math.max(0, s.amountDue - s.amountPaid)), unpaid: rows.filter(s => s.status === 'unpaid').length, partial: rows.filter(s => s.status === 'partial').length, done: rows.filter(s => s.status === 'paid').length, failed: rows.filter(s => s.status === 'failed').length });
  Q.salaryStatus = (s) => s.status === 'cancelled' || s.status === 'failed' || s.status === 'adjusted' ? s.status : s.amountPaid <= 0 ? 'unpaid' : s.amountPaid + 0.5 >= s.amountDue ? 'paid' : 'partial';

  /* ---------- Danh mục chi phí §4.27.3 (GV / BH / VH) + alias mã cũ ---------- */
  const ALIAS = { 'DV-DIEN': 'GV-DIEN', 'DV-NUOC': 'GV-NUOC', 'DV-MANG': 'GV-MANG', 'DV-RAC': 'GV-RAC', 'DV-MT': 'GV-MT', 'DV-TM': 'GV-TM', 'BH-SC': 'VH-SC', 'BH-KHAC': 'VH-KHAC', 'VH-VP': 'VH-VP' };
  Q.expenseAlias = (code) => { let c = code; let g = 0; while (g++ < 5) { const x = raw('expenseGroups').find(e => e.code === c); if (x && x.aliasOf) c = x.aliasOf; else if (ALIAS[c] && !(x && x.status === 'active' && !x.aliasOf)) c = ALIAS[c]; else break; } return c; };
  Q.expenseCategory = (code) => { const c = Q.expenseAlias(code); return raw('expenseGroups').find(g => g.code === c) || raw('expenseGroups').find(g => g.code === code) || {}; };
  Q.expenseParents = ['GV', 'BH', 'VH'];
  Q.expenseTree = () => Q.expenseParents.map(pc => raw('expenseGroups').find(g => g.code === pc)).filter(Boolean).map(p => ({ ...p, children: raw('expenseGroups').filter(g => g.parentCode === p.code && !g.aliasOf && (g.status || 'active') === 'active').sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) }));
  Q.expenseSystemCategories = () => raw('expenseGroups').filter(g => g.status === 'system');
  Q.expenseSource = (e) => e.dataSource || (e.source === 'import' || /import/i.test(e.note || '') ? 'import' : e.note && /tự tạo/i.test(e.note) ? 'system' : 'manual');
  Q.expenseAllocations = (expenseId) => raw('expenseAllocations').filter(a => a.expenseId === expenseId);
  Q.allocationRules = () => raw('allocationRules').sort((a, b) => F.cmp(b.effectiveFrom, a.effectiveFrom));
  Q.allocationRule = (date = F.today()) => Q.allocationRules().find(r => r.status !== 'inactive' && r.effectiveFrom <= date && (!r.effectiveTo || r.effectiveTo >= date)) || Q.allocationRules()[0] || null;
  Q.defaultAllocMethod = (categoryCode) => { const r = Q.allocationRule(); const m = r && r.defaults ? r.defaults[Q.expenseAlias(categoryCode)] : null; return m || (r && r.fallback) || 'ROOM_COUNT'; };
  // Preview phân bổ: amount theo method cho tập tòa (tòa chọn / nhóm T-S-G); REVENUE = doanh thu hóa đơn phát hành kỳ
  Q.allocationPreview = ({ amount, method, buildingIds, buildingType, period, ratios }) => {
    const refDate = Q.periodEndDate(period || St.state.meta.period);
    let bs = raw('buildings').filter(b => !b.stub && b.status !== 'inactive');
    if (buildingType) bs = bs.filter(b => (Q.buildingTypeAt ? Q.buildingTypeAt(b.id, refDate) : b.buildingType) === buildingType);
    if (buildingIds && buildingIds.length) { const set = new Set(buildingIds); bs = bs.filter(b => set.has(b.id)); }
    const amt = Number(amount) || 0; if (!bs.length) return { rows: [], total: 0, basis: '' };
    const weight = (b) => method === 'ROOM_COUNT' ? raw('rooms').filter(r => r.buildingId === b.id && r.status !== 'inactive').length : method === 'REVENUE' ? F.sum(raw('invoices').filter(i => i.buildingId === b.id && i.period === (period || St.state.meta.period) && i.docStatus !== 'draft' && i.docStatus !== 'cancelled'), i => i.total) : method === 'MANUAL_RATIO' ? Number((ratios || {})[b.id] || 0) : 1;
    const ws = bs.map(b => ({ b, w: weight(b) })); const tw = F.sum(ws, x => x.w) || 0;
    const rows = ws.map(x => ({ buildingId: x.b.id, name: x.b.name, basis: x.w, pct: tw ? Math.round(x.w / tw * 10000) / 100 : 0, amount: 0 }));
    let acc = 0; rows.forEach((r, i) => { r.amount = i === rows.length - 1 ? amt - acc : Math.round(amt * (tw ? r.basis / tw : 0)); acc += r.amount; });
    return { rows, total: amt, basis: method === 'ROOM_COUNT' ? 'phòng' : method === 'REVENUE' ? 'doanh thu' : method === 'MANUAL_RATIO' ? '%' : 'tòa', method, refDate };
  };
  Q.expenseFilter = (f = {}) => raw('expenses').filter(e => (!f.period || f.period === 'all' || (e.accountingPeriod || F.period(e.date)) === f.period) && (!f.dataSource || Q.expenseSource(e) === f.dataSource) && (!f.categoryCode || Q.expenseAlias(e.categoryCode) === f.categoryCode) && (!f.parentCode || (Q.expenseCategory(e.categoryCode).parentCode || '') === f.parentCode));
  Q.expenseImportJobs = () => raw('importJobs').filter(j => j.type === 'expense').sort((a, b) => F.cmp(b.createdAt || '', a.createdAt || ''));

  /* ---------- KPI tài chính dashboard (§4.1: 10 chỉ tiêu) ---------- */
  Q.financeKpis = (period, scope) => {
    const c = Q.collectionByMilestone(period, scope); const ids = scope && scope.buildingIds ? new Set(scope.buildingIds) : null;
    const invs = raw('invoices').filter(i => i.docStatus !== 'draft' && i.docStatus !== 'cancelled' && (!period || period === 'all' || i.period === period) && (!ids || ids.has(i.buildingId)));
    const overdueInv = invs.filter(i => Q.invOverdue(i)); const overdue = F.sum(overdueInv, i => Q.invRemaining(i));
    const overpaid = F.sum(raw('payments').filter(p => p.status === 'recorded' && !p.unidentified && (!ids || !p.buildingId || ids.has(p.buildingId)) && (!period || period === 'all' || F.period(p.date) === period)), p => Math.max(0, Q.paymentUnallocated ? Q.paymentUnallocated(p) : 0));
    const dep = Q.depositTotals ? Q.depositTotals({ buildingIds: ids ? [...ids] : undefined }) : { holding: 0, pendingRefund: 0 };
    return Object.assign(c, { overdue, overdueCount: overdueInv.length, overpaid, depositHolding: dep.holding, depositPendingRefund: dep.pendingRefund, pct: F.pct(c.collected, c.receivable) });
  };

  const todoPrev = Q.todo; Q.todo = () => { const t = todoPrev(); t.salaryUnpaid = raw('salaryPayments').filter(s => ['unpaid', 'partial', 'failed'].includes(s.status)).length; t.payrollOpen = raw('payrolls').filter(p => ['draft', 'review', 'approved'].includes(p.status)).length; t.expensePendingAlloc = raw('expenses').filter(e => e.status === 'pending_alloc').length; return t; };
})(window.TH);
(function (TH) {
  const F = TH.f, Q = TH.q, St = TH.store; const raw = (c) => St.rawAll(c).filter(Boolean);
  // Rollup chi phí theo nhóm GV/BH/VH: bỏ phiếu đã hủy, theo kỳ hạch toán, mã cũ resolve qua alias
  const inP = (e, period) => !period || period === 'all' || (e.accountingPeriod || F.period(e.date)) === period;
  const amtB = (e, bid) => { if (e.buildingId) return e.buildingId === bid ? Number(e.amount || 0) : 0; const a = raw('expenseAllocations').find(x => x.expenseId === e.id && x.buildingId === bid); return a ? Number(a.amount != null ? a.amount : Number(e.amount || 0) * Number(a.pct || 0) / 100) : 0; };
  Q.expenseRollup = (scope) => Q.expenseTree().map(parent => { const children = parent.children.map(cat => ({ ...cat, total: F.sum(raw('expenses').filter(e => e.status !== 'reversed' && inP(e, scope.period) && Q.expenseAlias(e.categoryCode) === cat.code), e => F.sum(scope.buildingIds, id => amtB(e, id))) })); return { ...parent, children, total: F.sum(children, x => x.total) }; });
})(window.TH);
(function (TH) {
  const F = TH.f, Q = TH.q;
  // Tổng hợp công nợ theo chiều (§12.13.1) + thu theo mốc M1/M2/M3 (§4.16)
  Q.receivableSummary = (rows, dim) => { const map = {}; rows.forEach(x => { const inv = x.inv; const key = dim === 'building' ? inv.buildingId : dim === 'manager' ? (Q.buildingManager(inv.buildingId) || {}).id || 'none' : dim === 'room' ? inv.roomId : inv.tenantId; const g = map[key] = map[key] || { key, label: dim === 'building' ? Q.building(inv.buildingId).name : dim === 'manager' ? Q.buildingManagerName(inv.buildingId) : dim === 'room' ? Q.room(inv.roomId).code + ' · ' + Q.building(inv.buildingId).name : Q.tenant(inv.tenantId).name, total: 0, paid: 0, remaining: 0, overdue: 0, count: 0, M1: 0, M2: 0, M3: 0, LATE: 0 }; const m = Q.invMilestones(inv); g.M1 += m.M1; g.M2 += m.M2; g.M3 += m.M3; g.LATE += m.LATE; g.total += inv.total; g.paid += x.paid; g.remaining += x.remaining; if (x.overdueDays > 0) g.overdue += x.remaining; g.count++; }); return Object.values(map).sort((a, b) => b.remaining - a.remaining); };
})(window.TH);
