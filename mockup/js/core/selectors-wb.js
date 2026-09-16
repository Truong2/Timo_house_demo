/* Workbook alignment v2.3 – shared dimensions, ledgers and reconciliation selectors. */
(function (TH) {
  const F = TH.f, St = TH.store, Q = TH.q;
  const raw = c => St.all(c).filter(Boolean);
  const inPeriod = (date, period) => !period || period === 'all' || F.period(date) === period;
  const periodEnd = p => { const [y, m] = String(p || St.state.meta.period).split('-').map(Number); return y && m ? F.toISO(new Date(y, m, 0)) : F.today(); };
  const amountByBuilding = (e, buildingId) => {
    if (e.buildingId) return e.buildingId === buildingId ? Number(e.amount || 0) : 0;
    const a = raw('expenseAllocations').find(x => x.expenseId === e.id && x.buildingId === buildingId);
    return a ? Number(a.amount != null ? a.amount : Number(e.amount || 0) * Number(a.pct || 0) / 100) : 0;
  };

  Q.L.buildingType = { T: ['T · Thuê lại chủ nhà', 'blue'], S: ['S · Sở hữu công ty', 'green'], G: ['G · Góp vốn cổ đông', 'purple'] };
  Q.L.vacancy = { immediate: ['Ở luôn trong tháng', 'green'], endOfMonth: ['Trống cuối tháng', 'blue'], waiting: ['Đang chờ', 'amber'] };
  Q.L.deductionGroup = { KH: ['Khấu hao / hao mòn', 'gray'], SC: ['Sửa chữa', 'orange'], VS: ['Vệ sinh / dọn dẹp', 'teal'], KHAC: ['Chi khác', 'purple'], CN: ['Công nợ', 'red'] };
  Q.area = id => St.get('areas', id) || {};
  Q.areas = () => raw('areas').filter(a => a.status !== 'inactive');
  Q.buildingTypeLabel = t => (Q.L.buildingType[t] || [t || '-', 'gray'])[0];
  Q.expenseCategory = code => raw('expenseGroups').find(g => g.code === code) || {};
  Q.expenseTree = () => raw('expenseGroups').filter(g => !g.parentCode && ['GV', 'DV', 'VH', 'BH'].includes(g.code)).map(p => ({ ...p, children: raw('expenseGroups').filter(g => g.parentCode === p.code) }));
  Q.salesTeam = id => St.get('salesTeams', id) || {};
  Q.staffOf = (buildingId, role, atDate = F.today()) => raw('buildingAssignments').filter(a => a.buildingId === buildingId && (!role || a.role === role) && a.start <= atDate && (!a.end || a.end >= atDate)).map(a => ({ ...a, employee: St.get('employees', a.employeeId) || {} }));
  Q.areaLead = areaId => { const a = Q.area(areaId); return St.get('employees', a.leadEmployeeId) || {}; };
  Q.buildingLead = buildingId => { const b = Q.building(buildingId), lead = Q.areaLead(b.areaId); return lead.id ? lead : ((Q.staffOf(buildingId, 'lead')[0] || {}).employee || {}); };

  Q.scope = (f = {}) => {
    const period = f.period === undefined ? St.state.meta.period : f.period;
    let buildings = raw('buildings').filter(b => !b.stub);
    if (f.areaId) buildings = buildings.filter(b => b.areaId === f.areaId);
    if (f.buildingId) buildings = buildings.filter(b => b.id === f.buildingId);
    if (f.buildingType) buildings = buildings.filter(b => b.buildingType === f.buildingType);
    if (f.managerId) buildings = buildings.filter(b => b.managerId === f.managerId);
    if (f.leadId) buildings = buildings.filter(b => Q.buildingLead(b.id).id === f.leadId);
    if (f.opsId) buildings = buildings.filter(b => Q.staffOf(b.id, 'ops').some(x => x.employeeId === f.opsId));
    if (f.shareholderId) {
      const pids = new Set(raw('capitalCommitments').filter(c => c.shareholderId === f.shareholderId).map(c => c.projectId));
      const bids = new Set(raw('projects').filter(p => pids.has(p.id)).map(p => p.buildingId)); buildings = buildings.filter(b => bids.has(b.id));
    }
    let sales = raw('users').filter(u => u.role === 'sale' && u.status === 'active');
    if (f.teamId) sales = sales.filter(u => u.teamId === f.teamId);
    if (f.saleId) sales = sales.filter(u => u.id === f.saleId);
    return { period, buildingIds: buildings.map(b => b.id), saleIds: sales.map(u => u.id), filters: { ...f } };
  };
  const inScope = (id, scope) => !scope || !scope.buildingIds || scope.buildingIds.includes(id);

  Q.roomVacancy = (room, period = St.state.meta.period) => {
    if (!room) return '';
    if (room.status === 'ready') return 'immediate';
    if (room.status === 'held' || room.status === 'cleaning') return 'waiting';
    if (room.status === 'occupied') {
      const end = periodEnd(period); const c = Q.activeContractOfRoom(room.id);
      if (c && c.end <= end && !c.renewedToId) return 'endOfMonth';
    }
    return '';
  };
  Q.vacancy = scope => {
    const out = { immediate: [], endOfMonth: [], waiting: [] };
    raw('rooms').filter(r => inScope(r.buildingId, scope)).forEach(r => { const k = Q.roomVacancy(r, scope && scope.period); if (k) out[k].push(r); });
    return out;
  };
  Q.revenueSplit = scope => {
    const period = scope && scope.period;
    const invs = raw('invoices').filter(i => inScope(i.buildingId || Q.contract(i.contractId).buildingId, scope) && inPeriod(i.issueDate || (i.period + '-01'), period) && !['draft', 'cancelled'].includes(i.docStatus));
    const rent = F.sum(invs, i => F.sum(Q.invLines(i.id).filter(l => l.kind === 'rent' || /tiền phòng|thuê/i.test(l.item || l.desc || '')), l => Number(l.amount || 0)));
    const newDeposit = F.sum(raw('deals').filter(d => inScope(d.buildingId, scope) && inPeriod(d.closedAt, period)), d => Number(d.depositPaid || 0));
    const penalty = F.sum(raw('refundDeductions').filter(d => d.groupCode === 'KHAC').filter(d => { const rf = St.get('refunds', d.refundId); return rf && inScope(rf.buildingId, scope) && inPeriod(rf.requestDate, period) && /phá|phat|hủy|huy/i.test(F.norm(d.desc || '')); }), d => Number(d.amount || 0));
    return { rent, newDeposit, penalty };
  };
  Q.expenseRollup = scope => Q.expenseTree().map(parent => {
    const children = parent.children.map(cat => ({ ...cat, total: F.sum(raw('expenses').filter(e => inPeriod(e.date, scope.period)), e => e.categoryCode === cat.code ? F.sum(scope.buildingIds, id => amountByBuilding(e, id)) : 0) }));
    return { ...parent, children, total: F.sum(children, x => x.total) };
  });
  Q.utilityLedger = scope => scope.buildingIds.map(buildingId => {
    const b = Q.building(buildingId), rooms = Q.roomsOf(buildingId), ids = new Set(rooms.map(r => r.id));
    const readings = raw('meterReadings').filter(m => ids.has(m.roomId) && inPeriod(m.period + '-01', scope.period));
    const usage = F.sum(readings, m => Math.max(0, Number(m.curr || 0) - Number(m.prev || 0)));
    const invIds = new Set(raw('invoices').filter(i => i.buildingId === buildingId && (!scope.period || i.period === scope.period)).map(i => i.id));
    const revenue = F.sum(raw('invoiceLines').filter(l => { const type = (Q.service(l.serviceId) || {}).wbType || ({ dien: 'electric', nuoc: 'water', electric: 'electric', water: 'water' })[String(l.kind || '').toLowerCase()]; return invIds.has(l.invoiceId) && ['electric', 'water'].includes(type); }), l => Number(l.amount || l.total || 0));
    const cost = F.sum(raw('expenses').filter(e => inPeriod(e.date, scope.period) && ['DV-DIEN', 'DV-NUOC'].includes(e.categoryCode)), e => amountByBuilding(e, buildingId));
    return { buildingId, building: b, usage, revenue, cost, diff: revenue - cost };
  });
  Q.paidMonths = contract => raw('invoices').filter(i => i.contractId === contract.id && !['draft', 'cancelled'].includes(i.docStatus) && Q.invPayStatus(i) === 'paid' && Q.invLines(i.id).some(l => l.kind === 'rent' || /tiền phòng|thuê/i.test(l.item || l.desc || ''))).length;
  Q.lastPaymentDate = invoice => Q.paymentsOfInvoice(invoice.id).filter(x => x.payment.status === 'recorded').map(x => x.payment.date).sort().pop() || '';
  Q.onTimeRate = scope => {
    const invs = raw('invoices').filter(i => inScope(i.buildingId || Q.contract(i.contractId).buildingId, scope) && inPeriod(i.dueDate, scope.period) && i.dueDate <= F.today() && !['draft', 'cancelled'].includes(i.docStatus));
    const onTime = invs.filter(i => Q.invPayStatus(i) === 'paid' && Q.paymentsOfInvoice(i.id).some(x => x.payment.status === 'recorded' && x.payment.date <= i.dueDate)).length;
    return { onTime, total: invs.length, rate: invs.length ? Math.round(onTime / invs.length * 1000) / 10 : 0 };
  };
  Q.contractTermNo = c => { let n = 1, cur = c, guard = 0; while (cur && cur.renewedFromId && guard++ < 20) { n++; cur = St.get('contracts', cur.renewedFromId); } return n; };
  Q.contractTermLabel = c => Q.contractTermNo(c) === 1 ? 'HĐ lần đầu' : 'Gia hạn lần ' + (Q.contractTermNo(c) - 1);

  Q.salesLedger = scope => raw('deals').filter(d => inScope(d.buildingId, scope) && inPeriod(d.closedAt, scope.period) && (!scope.saleIds.length || scope.saleIds.includes(d.saleId))).map(d => {
    const c = Q.contract(d.contractId), r = Q.room(d.roomId), b = Q.building(d.buildingId), t = Q.tenant(d.tenantId), lead = St.get('leads', d.leadId) || {}, com = Q.commissionOf ? Q.commissionOf(d) : {};
    const invoiceIds = new Set(raw('invoices').filter(i => i.contractId === c.id && !['draft', 'cancelled'].includes(i.docStatus)).map(i => i.id));
    const received = c.id ? F.sum(raw('paymentAllocations').filter(a => invoiceIds.has(a.invoiceId) && (!St.get('payments', a.paymentId) || St.get('payments', a.paymentId).status === 'recorded')), a => Number(a.amount || 0)) + Number(d.depositPaid || 0) : Number(d.depositPaid || 0);
    return { id: d.id, date: d.closedAt, ref: F.roomRef(b, r), buildingId: b.id, manager: Q.userName(b.managerId), phone: t.phone || lead.phone || '', deposit: d.deposit, price: d.price, chargeDate: c.start || d.moveIn, months: d.months || (c.id ? F.monthsDiff(c.start, c.end) : 0), source: (Q.leadSource && Q.leadSource(lead.sourceId).name) || '-', paymentStatus: received >= Number(d.deposit || 0) ? 'Đủ' : 'Thiếu', sale: Q.userName(d.saleId), saleId: d.saleId, team: Q.salesTeam((Q.user(d.saleId) || {}).teamId).name || '-', commission: Number(com.amount || 0), received, vacancy: Q.roomVacancy(r, scope.period), note: d.note || '' };
  });
  Q.customerLedger = scope => raw('leads').filter(l => (!scope.saleIds.length || scope.saleIds.includes(l.saleId)) && inPeriod(l.handoverDate || l.createdAt, scope.period)).flatMap(l => {
    const deal = raw('deals').find(d => d.leadId === l.id), viewing = raw('viewings').find(v => v.leadId === l.id), bId = deal ? deal.buildingId : (l.buildingIds || [])[0]; if (bId && !inScope(bId, scope)) return [];
    const room = deal ? Q.room(deal.roomId) : viewing ? Q.room(viewing.roomId) : {}, b = Q.building(bId || room.buildingId), src = Q.leadSource ? Q.leadSource(l.sourceId) : {};
    return [{ id: l.id, sale: Q.userName(l.saleId), ref: room.id ? F.roomRef(b, room) : (b.code || '-'), source: src.name || '-', sourceKind: src.kind === 'partner' ? 'Đối tác' : 'Nội bộ', status: deal ? 'Đã chốt' : viewing ? 'Đã xem' : 'Chưa xem', area: (Q.area(b.areaId) || {}).name || b.district || '-', phone: l.phone, handoverDate: l.handoverDate || (l.createdAt || '').slice(0, 10) }];
  });
  Q.commissionLedger = scope => Q.salesLedger(scope).map(r => { const d = St.get('deals', r.id), c = Q.commissionOf ? Q.commissionOf(d) : {}; return { ...r, rate: Number(c.rate || 0), amount: Number(c.amount || 0), status: c.status === 'paid' ? 'Đã trả' : 'Chưa trả' }; });
  Q.shareholderAssetSummary = scope => scope.buildingIds.map(buildingId => {
    const b = Q.building(buildingId), project = raw('projects').find(p => p.buildingId === buildingId), activeContracts = raw('contracts').filter(c => c.buildingId === buildingId && c.status === 'active');
    const distributions = project ? raw('distributions').filter(d => d.projectId === project.id && inPeriod(d.paidDate || d.date || d.createdAt, scope.period)) : [];
    return { buildingId, building: b, assetValue: F.sum(raw('assets').filter(a => a.buildingId === buildingId && a.status === 'active' && a.ownership === 'company'), a => Number(a.cost || a.originalCost || 0)), deposits: F.sum(activeContracts, c => Number(c.deposit || 0)), distribution: F.sum(distributions, d => Number(d.profit || d.amount || d.paidAmount || 0)) };
  });
  Q.staffWorkload = employeeId => { const bids = [...new Set(Q.staffOf ? raw('buildingAssignments').filter(a => a.employeeId === employeeId && a.start <= F.today() && (!a.end || a.end >= F.today())).map(a => a.buildingId) : [])]; return { buildings: bids.length, rooms: raw('rooms').filter(r => bids.includes(r.buildingId)).length, buildingIds: bids }; };
})(window.TH);
