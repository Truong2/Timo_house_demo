/* Selectors dùng chung (memo theo store.version). Áp phạm vi dữ liệu theo vai trò khi gọi *Scoped(). */
(function (TH) {
  const S = TH.store, F = TH.f, Cc = TH.calc;
  const Q = {};
  const memo = {};
  const cached = (key, fn) => { const m = memo[key]; if (m && m.v === S.version) return m.val; const val = fn(); memo[key] = { v: S.version, val }; return val; };

  Q.param = (key, date) => Cc.params.at(S.all('params'), key, date || F.today());
  Q.params = (date) => Cc.params.snapshot(S.all('params'), date || F.today());
  Q.building = (id) => S.get('buildings', id);
  Q.room = (id) => S.get('rooms', id);
  Q.stay = (id) => S.get('stays', id);
  Q.customer = (id) => S.get('customers', id);
  Q.emp = (id) => S.get('employees', id);
  Q.invoice = (id) => S.get('invoices', id);
  Q.account = (id) => S.get('accounts', id);
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
  Q.teamLeaders = () => cached('leaders', () => { const ids = new Set(S.all('orgLinks').filter(l => !l.to).map(l => l.leaderId)); return S.all('employees').filter(e => ids.has(e.id)); });

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
