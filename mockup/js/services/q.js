/* Selectors dùng chung (memo theo store.version). Áp phạm vi dữ liệu theo vai trò khi gọi *Scoped(). */
(function (TH) {
  const S = TH.store, F = TH.f, Cc = TH.calc;
  const Q = {};
  const memo = {};
  const cached = (key, fn) => { const m = memo[key]; if (m && m.v === S.version) return m.val; const val = fn(); memo[key] = { v: S.version, val }; return val; };

  Q.param = (key, date) => Cc.params.at(S.all('params'), key, date || F.today());
  Q.params = (date) => Cc.params.snapshot(S.all('params'), date || F.today());
  Q.policy = (key, date) => Cc.params.recordAt(S.all('params'), key, date || F.today());
  Q.policySnapshot = (date) => Cc.params.policySnapshot(S.all('params'), date || F.today());
  Q.building = (id) => S.get('buildings', id);
  Q.room = (id) => S.get('rooms', id);
  Q.stay = (id) => S.get('stays', id);
  Q.customer = (id) => S.get('customers', id);
  Q.emp = (id) => S.get('employees', id);
  Q.invoice = (id) => S.get('invoices', id);
  Q.account = (id) => S.get('accounts', id);
  Q.accountForTemplate = (template, at) => {
    const day = at || F.today();
    return S.where('accounts', a => a.template === template && (!a.effectiveFrom || a.effectiveFrom <= day) && (!a.effectiveTo || a.effectiveTo >= day))
      .sort((a, b) => String(b.effectiveFrom || '').localeCompare(String(a.effectiveFrom || '')) || Number(b.version || 1) - Number(a.version || 1))[0] || null;
  };
  Q.roomCode = (roomId) => { const r = S.get('rooms', roomId); return r ? r.code : '–'; };

  /* ---- phạm vi ---- */
  Q.scopedBuildings = () => { const sc = TH.auth.buildingScope(); return S.all('buildings').filter(b => !sc || sc.has(b.id)); };
  Q.scoped = (arr, bKey = 'buildingId') => {
    const sc = TH.auth.buildingScope(); if (!sc) return arr;
    const rs = TH.auth.roomScope(); // phân công theo phòng: chỉ thấy bản ghi của phòng được giao trong tòa đó
    const roomOf = (x) => x.roomId || (x.stayId ? (S.get('stays', x.stayId) || {}).roomId : null);
    return arr.filter(x => { if (!sc.has(x[bKey])) return false; const set = rs[x[bKey]]; if (!set) return true; const rid = roomOf(x); return !rid || set.has(rid); });
  };

  /* ---- chỉ mục ---- */
  Q.roomsByBuilding = () => cached('rbb', () => F.by(S.all('rooms'), 'buildingId'));
  Q.staysByRoom = () => cached('sbr', () => F.by(S.all('stays'), 'roomId'));
  Q.invoicesByStay = () => cached('ibs', () => F.by(S.all('invoices'), 'stayId'));
  Q.paymentsByStay = () => cached('pbs', () => F.by(S.all('payments'), 'stayId'));
  Q.paidIndex = () => cached('paid', () => {
    const m = {};
    S.all('payments').forEach(p => { if (p.status === 'reversed') return; (p.allocations || []).forEach(a => { m[a.invoiceId] = (m[a.invoiceId] || 0) + a.amount; }); });
    return m;
  });
  /* Phân bổ theo dòng hóa đơn (UI-13): {invoiceId: {lineNo: số}} – chỉ phần phân bổ có chỉ định dòng */
  Q.paidByLine = () => cached('paidLine', () => {
    const m = {};
    S.all('payments').forEach(p => { if (p.status === 'reversed') return; (p.allocations || []).forEach(a => { if (a.lineNo == null) return; const x = m[a.invoiceId] = m[a.invoiceId] || {}; x[a.lineNo] = (x[a.lineNo] || 0) + a.amount; }); });
    return m;
  });
  Q.lastPayIndex = () => cached('lastpay', () => {
    const m = {};
    S.all('payments').forEach(p => { if (p.status === 'reversed') return; (p.allocations || []).forEach(a => { if (!m[a.invoiceId] || m[a.invoiceId] < p.receivedAt) m[a.invoiceId] = p.receivedAt; }); });
    return m;
  });

  /* ---- hóa đơn: trạng thái thu + công nợ ---- */
  Q.invState = (inv, asOf) => {
    const cash = Q.paidIndex()[inv.id] || 0;
    // Khách của chủ nhà đã đóng thẳng cho chủ (OQ-14): bù trừ tiền trả chủ nhà → tính là đã thu, không là công nợ khách
    const ownerSettled = inv.ownerSettled || 0, paid = cash + ownerSettled;
    const due = inv.totalDue;
    const carried = inv.carriedOut || 0; // phần nợ đã chuyển sang dòng "Nợ cũ" của hóa đơn kỳ sau
    const remaining = Math.max(0, due - paid - carried), credit = Math.max(0, paid - due);
    const status = Cc.payments.payStatus(due, paid);
    const debt = inv.lifecycle === 'draft' ? { state: 'draft', days: 0 } : Cc.payments.debtState(inv, remaining, asOf || F.today(), Q.params());
    return { due, paid, cash, ownerSettled, remaining, credit, status, debt, lastPaid: Q.lastPayIndex()[inv.id] || null };
  };
  /* Thu theo từng dòng: phần phân bổ chỉ định dòng + phần cấp hóa đơn (dữ liệu cũ, bù trừ chủ nhà, nợ đã chuyển kỳ sau) rải theo thứ tự dòng để hiển thị số còn phải thu mỗi dòng */
  Q.lineState = (inv) => {
    const L = Cc.billing.expand(inv.lines), byLine = Q.paidByLine()[inv.id] || {};
    const explicit = Object.values(byLine).reduce((s, v) => s + v, 0);
    const st = Q.invState(inv);
    let generic = Math.max(0, st.paid - explicit) + (inv.carriedOut || 0);
    return L.map(l => {
      const own = byLine[l.no] || 0; const amt = Number(l.amount) || 0;
      const g = Math.max(0, Math.min(generic, amt - own)); generic -= g;
      return { no: l.no, label: l.label, amount: amt, paid: own + g, explicit: own, remaining: Math.max(0, Math.round((amt - own - g) * 100) / 100) };
    });
  };
  /* Cờ tháng lẻ lệch quy tắc số ngày thực (UI-11/UI-12, §3.12b) */
  Q.prorataFlag = (inv) => { if (inv.isBreach) return null; const s = Q.stay(inv.stayId); if (!s || !s.rentStart) return null; return Cc.billing.prorataFlag(Cc.billing.expand(inv.lines)[0], Cc.dates.proRataDays(s.rentStart, inv.period, s.stopBillingDate)); };
  Q.invoicesOf = (period) => cached('inv:' + period, () => S.all('invoices').filter(i => i.period === period));

  /* ---- người phụ trách tại ngày ---- */
  Q.managerOf = (buildingId, date) => {
    const d = date || F.today();
    const a = S.all('assignments').find(x => x.buildingId === buildingId && !x.roomId && x.responsibility === 'operate' && (!x.from || x.from <= d) && (!x.to || d <= x.to));
    return a ? S.get('employees', a.employeeId) : null;
  };
  Q.managerMap = (date) => cached('mgr:' + (date || F.today()), () => { const m = {}; S.all('buildings').forEach(b => { m[b.id] = Q.managerOf(b.id, date); }); return m; });
  Q.leaderOf = (empId, date) => {
    const d = date || F.today();
    const l = S.all('orgLinks').find(x => x.employeeId === empId && (!x.from || x.from <= d) && (!x.to || d <= x.to));
    return l ? S.get('employees', l.leaderId) : null;
  };
  /* E3: theo ngày (xem kỳ cũ thấy leader cũ – đặc tả §3.6 dòng 338); không truyền ngày = cơ cấu hiện tại */
  const eff = (x, d) => (!x.from || x.from <= d) && (!x.to || d <= x.to);
  Q.teamLeaders = (date) => date ? (() => { const ids = new Set(S.all('orgLinks').filter(l => eff(l, date)).map(l => l.leaderId)); return S.all('employees').filter(e => ids.has(e.id)); })()
    : cached('leaders', () => { const ids = new Set(S.all('orgLinks').filter(l => !l.to).map(l => l.leaderId)); return S.all('employees').filter(e => ids.has(e.id)); });
  /* Team của leader tại ngày: cả nhánh (trực tiếp + gián tiếp) hoặc "chỉ team trực tiếp" */
  Q.teamOf = (leaderId, date, direct) => direct ? new Set([leaderId, ...S.all('orgLinks').filter(l => l.leaderId === leaderId && eff(l, date)).map(l => l.employeeId)]) : TH.auth.branchOf(leaderId, date);
  /* E3: vai trò phụ trách (§3.6) quyết định lấy tòa theo phân công vận hành, việc kỹ thuật của thợ trong kỳ, deal của sale trong kỳ; vai trò chưa có dữ liệu phân công → rỗng */
  Q.RESP_FILTER = [['operate', 'Vận hành phòng'], ['tech', 'Kỹ thuật (việc sửa của thợ)'], ['sale', 'Sale (deal chốt)'], ['remind', 'Nhắc thu'], ['collect', 'Thu thực tế'], ['cleaning', 'Vệ sinh']];
  Q.leaderBuildings = (leaderId, date, { direct = false, resp = 'operate' } = {}) => {
    const team = Q.teamOf(leaderId, date, direct); const p = F.period(date);
    if (resp === 'operate') { const mm = Q.managerMap(date); return new Set(Object.keys(mm).filter(b => mm[b] && team.has(mm[b].id))); }
    if (resp === 'tech') return new Set(S.all('repairLogs').filter(r => r.status !== 'void' && team.has(r.workerId) && r.period === (Q.repairPeriodOf ? Q.repairPeriodOf(date) : p)).map(r => r.buildingId));
    if (resp === 'sale') return new Set(S.all('deals').filter(d => F.period(d.closeDate) === p && (d.saleIds || []).some(id => team.has(id))).map(d => d.buildingId));
    return new Set(S.all('assignments').filter(a => a.responsibility === resp && eff(a, date) && team.has(a.employeeId)).map(a => a.buildingId));
  };
  /* Phạm vi lọc dùng chung cho list/report/export. Mọi tiêu chí đều được giao với phạm vi RBAC hiện hành. */
  Q.scopeBuildingIds = (filters = {}, at) => {
    const day = at || filters.at || F.today(), mm = Q.managerMap(day);
    const leader = filters.leader ? Q.leaderBuildings(filters.leader, day, { direct: filters.direct === true || filters.direct === '1' }) : null;
    return new Set(Q.scopedBuildings().filter(b => {
      if (filters.area && b.areaId !== filters.area) return false;
      if (filters.group && b.group !== filters.group) return false;
      if (filters.building && b.id !== filters.building) return false;
      if (filters.manager && (mm[b.id] || {}).id !== filters.manager) return false;
      if (leader && !leader.has(b.id)) return false;
      if (filters.shareholder && (!Q.shareRatios || !Q.shareRatios(b.id, day).some(r => r.shareholderId === filters.shareholder))) return false;
      return true;
    }).map(b => b.id));
  };
  Q.departmentOf = (employeeId, at) => {
    const day = at || F.today();
    const link = S.where('orgLinks', l => l.employeeId === employeeId && eff(l, day)).sort((a, b) => String(b.from || '').localeCompare(String(a.from || '')))[0];
    return link && link.unit || 'Chưa phân phòng ban';
  };

  /* ---- lượt thuê ---- */
  Q.currentStay = (roomId) => { const arr = Q.staysByRoom()[roomId] || []; return arr.find(s => s.status === 'active') || null; };
  Q.pendingStay = (roomId) => { const arr = Q.staysByRoom()[roomId] || []; return arr.find(s => s.status === 'pending') || null; };
  Q.rateOf = (stayId, date) => {
    const d = date || F.today();
    const vs = S.all('rateVersions').filter(v => v.stayId === stayId && (!v.from || v.from <= d) && (!v.to || d <= v.to)).sort((a, b) => String(b.from).localeCompare(String(a.from)));
    return vs[0] || S.all('rateVersions').filter(v => v.stayId === stayId).sort((a, b) => String(b.from).localeCompare(String(a.from)))[0] || null;
  };
  Q.expiring = (days) => {
    const t = F.today(), lim = F.addDays(t, days == null ? Q.param('expiryWarnDays') : days);
    return S.all('stays').filter(s => s.status === 'active' && s.endDate && s.endDate >= t && s.endDate <= lim);
  };
  Q.stayLabel = (s) => { const c = Q.customer(s.customerId); return (c ? c.name : '') + ' · ' + s.code; };
  Q.endTypeLabel = (k) => ((TH.data.catalog.endTypes.find(x => x.key === k) || {}).label) || '';
  Q.contractState = (stay, asOf) => {
    if (!stay) return 'unknown';
    const day = asOf || F.today(), refund = S.one('refunds', r => r.stayId === stay.id);
    if (['breach', 'abscond'].includes(stay.endType)) return 'breach';
    if (stay.status === 'ended') return refund && refund.status !== 'paid' ? 'pending_settlement' : 'ended';
    if (!Q.signedContract || !Q.signedContract(stay.id)) return 'pending_signature';
    const warn = Number(Q.param('expiryWarnDays', day)) || 30;
    if (stay.status === 'active' && stay.endDate && stay.endDate >= day && stay.endDate <= F.addDays(day, warn)) return 'expiring';
    return 'active';
  };
  Q.contractRows = (filters = {}) => {
    const asOf = filters.asOf || F.today(), q = String(filters.q || '').trim().toLowerCase();
    return Q.scoped(S.all('stays')).map(stay => {
      const customer = Q.customer(stay.customerId) || {}, room = Q.room(stay.roomId) || {}, building = Q.building(stay.buildingId) || {}, manager = Q.managerOf(stay.buildingId, asOf);
      return { id: stay.id, stay, customer, room, building, manager, state: Q.contractState(stay, asOf), signedFile: Q.signedContract ? Q.signedContract(stay.id) : null, versions: S.where('stayVersions', v => v.stayId === stay.id).length };
    }).filter(x => (!filters.view || filters.view === 'all' || x.state === filters.view)
      && (!q || [x.stay.code, x.customer.name, x.customer.phone, x.room.code].some(v => String(v || '').toLowerCase().includes(q)))
      && (!filters.building || x.stay.buildingId === filters.building)
      && (!filters.manager || (x.manager || {}).id === filters.manager)
      && (!filters.from || x.stay.endDate >= filters.from)
      && (!filters.to || x.stay.rentStart <= filters.to));
  };
  Q.contractTimeline = (stayId) => {
    const versions = S.where('stayVersions', v => v.stayId === stayId).map(v => ({ at: v.createdAt || v.effectiveFrom, type: 'version', title: `Phiên hợp đồng v${v.version}`, detail: v.reason, ref: v.id }));
    const docs = (Q.contractsOfStay ? Q.contractsOfStay(stayId) : []).filter(d => !Q.canDownloadDoc || Q.canDownloadDoc(Object.assign({ status: 'current', objectType: 'stay', objectId: stayId }, d))).map(d => ({ at: d.uploadedAt || d.createdAt, type: 'document', title: d.signed ? 'Hợp đồng đã ký' : 'Tài liệu hợp đồng', detail: d.name, ref: d.id }));
    const payments = TH.auth.can('payments.view') ? S.where('payments', p => p.stayId === stayId && p.status !== 'reversed').map(p => ({ at: p.receivedAt, type: 'payment', title: `Phiếu thu ${p.code}`, detail: F.vndd(p.amount), ref: p.id, href: '#/billing/receipts/' + p.id })) : [];
    const audits = TH.auth.can('settings.view') ? S.where('auditLog', a => (a.entity === 'stay' && a.entityId === stayId) || (a.entity === 'stayVersion' && versions.some(v => v.ref === a.entityId))).map(a => ({ at: a.at, type: 'audit', title: a.summary, detail: a.userName, ref: a.id })) : [];
    return [...versions, ...docs, ...payments, ...audits].filter(x => x.at).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  };
  Q.debtAging = (asOf, filters = {}) => {
    const day = asOf || F.today();
    return Q.scoped(S.all('invoices')).map(invoice => { const payment = Q.invState(invoice, day), stay = Q.stay(invoice.stayId); const ageDays = payment.debt.days || 0; const bucket = ageDays <= 0 ? 'not_due' : ageDays <= 30 ? '1-30' : ageDays <= 60 ? '31-60' : ageDays <= 90 ? '61-90' : ageDays <= 180 ? '91-180' : '181+'; return { invoice, payment, stay, ageDays, bucket, contractState: Q.contractState(stay, day) }; })
      .filter(x => x.payment.remaining > 0 && (!filters.bucket || x.bucket === filters.bucket) && (!filters.building || x.invoice.buildingId === filters.building) && (!filters.contractState || x.contractState === filters.contractState));
  };
  Q.invoiceRows = (filters = {}) => {
    const day = filters.asOf || F.today(), scope = Q.scopeBuildingIds(filters, day), q = String(filters.q || '').trim().toLowerCase();
    const src = filters.period ? Q.invoicesOf(filters.period) : S.all('invoices');
    return Q.scoped(src).filter(i => scope.has(i.buildingId)).map(invoice => {
      const stay = Q.stay(invoice.stayId) || {}, room = Q.room(invoice.roomId) || {}, building = Q.building(invoice.buildingId) || {};
      const manager = Q.managerOf(invoice.buildingId, day), leader = manager ? Q.leaderOf(manager.id, day) : null, payment = Q.invState(invoice, day);
      const dueDate = invoice.dueTo || invoice.dueFrom || invoice.issueDate || invoice.issuedAt || '';
      const dueStatus = invoice.lifecycle === 'draft' ? 'draft' : payment.remaining <= 0 ? 'paid' : dueDate && dueDate < day ? 'overdue' : dueDate && dueDate <= F.addDays(day, 7) ? 'due' : 'not_due';
      return { invoice, stay, room, building, buildingId: invoice.buildingId, roomId: invoice.roomId, manager, leader, payment, dueDate, dueStatus };
    }).filter(x => (!filters.life || x.invoice.lifecycle === filters.life)
      && (!filters.pay || x.payment.status === filters.pay)
      && (!filters.kind || filters.kind === 'new' && x.invoice.isNewStay || filters.kind === 'breach' && x.invoice.isBreach)
      && (!filters.dueStatus || x.dueStatus === filters.dueStatus)
      && (!filters.dueFrom || x.dueDate >= filters.dueFrom)
      && (!filters.dueTo || x.dueDate <= filters.dueTo)
      && (!q || [x.invoice.code, x.invoice.customerCode, x.room.code, x.building.code, (Q.customer(x.stay.customerId) || {}).name].some(v => String(v || '').toLowerCase().includes(q))));
  };
  Q.refundRows = (filters = {}) => {
    const day = filters.asOf || F.today(), scope = Q.scopeBuildingIds(filters, day), q = String(filters.q || '').trim().toLowerCase(), dateBasis = filters.dateBasis === 'paidAt' ? 'paidAt' : 'handoverDate';
    return Q.scoped(S.all('refunds')).filter(r => scope.has(r.buildingId)).map(refund => {
      const stay = Q.stay(refund.stayId) || {}, room = Q.room(refund.roomId) || {}, building = Q.building(refund.buildingId) || {};
      const manager = Q.managerOf(refund.buildingId, refund[dateBasis] || day), leader = manager ? Q.leaderOf(manager.id, refund[dateBasis] || day) : null;
      return { refund, stay, room, building, buildingId: refund.buildingId, roomId: refund.roomId, manager, leader, date: refund[dateBasis] || '' };
    }).filter(x => (filters.status === 'open' ? x.refund.status !== 'paid' : !filters.status || x.refund.status === filters.status)
      && (!filters.from || x.date >= filters.from) && (!filters.to || x.date <= filters.to)
      && (!q || [x.refund.code, x.room.code, x.stay.code, (Q.customer(x.stay.customerId) || {}).name].some(v => String(v || '').toLowerCase().includes(q))));
  };

  /* Phòng tính vào số phòng lương / HS / lấp đầy / mẫu số phân bổ: bỏ đồng hồ chung, phòng ngừng khai thác và – theo tham số OQ-14 – phòng không có giá thuê (chủ nhà ở) */
  Q.rentable = (r, date) => r.exploitation !== 'meter_common' && r.status !== 'inactive' && (r.price > 0 || !Q.param('noRentRoomsExcluded', date));
  /* ---- phòng trống 3 loại (GĐ OQ-06, UI-01): chỉ phòng có giá thuê; "ở luôn" = trống sẵn sàng, chưa có deal (phòng cần dọn/xử lý tách riêng) ---- */
  Q.vacancy = (asOf) => cached('vac:' + (asOf || F.today()), () => {
    const t = asOf || F.today(), pEnd = F.periodEnd(F.period(t));
    const out = { now: [], endOfMonth: [], waiting: [], cleaning: [] };
    S.all('rooms').forEach(r => {
      if (!Q.rentable(r, t) || !(r.price > 0)) return;
      const stays = Q.staysByRoom()[r.id] || [];
      const active = stays.find(s => s.status === 'active');
      const pending = stays.find(s => s.status === 'pending');
      if (pending) out.waiting.push(r);
      else if (!active) (r.status === 'vacant_cleaning' ? out.cleaning : out.now).push(r);
      else if ((active.plannedLeaveDate || active.endDate) && (active.plannedLeaveDate || active.endDate) <= pEnd && (active.plannedLeaveDate || active.endDate) >= t) out.endOfMonth.push(r);
    });
    return out;
  });

  /* ---- mức nhạy cảm ---- */
  Q.pii = (v, keep = 3) => TH.auth.can('customers.pii') ? v : F.mask(v, keep);
  Q.money = (v) => TH.auth.can('debts.viewAmounts') ? F.vnd(v) : '•••';
  TH.q = Q;
})(window.TH);
