/* Thu tiền theo tòa – sheet "cập nhật thu tiền" (SRC-08). Quyết định 05/10/2026:
   - Quản lý tòa (vanhanh; leader / trưởng phòng theo nhánh) nhập số ĐÃ THU CỘNG DỒN của tòa tại mốc ngày 5/10/15 (cột T/U/V);
   - Admin duyệt / từ chối (đối chiếu với số tính từ phiếu thu); kế toán xem toàn bộ để làm báo cáo, xuất Excel;
   - Lương vận hành (UI-25) dùng số mốc đã duyệt; mốc chưa duyệt dùng số phiếu thu và gắn cờ cần duyệt trên bảng lương.
   Phải thu = tổng hóa đơn của tòa trong kỳ; phòng phá HĐ lấy hóa đơn gốc như cột P của Excel (chỉ hiển thị, không vào lương). */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, D = TH.calc.dates, P = TH.calc.payroll, PM = TH.calc.payments;
  const fail = (fields, msg = 'Dữ liệu chưa hợp lệ') => { const e = new Error(msg); e.fields = fields; throw e; };
  const memo = {};
  const cached = (key, fn) => { const m = memo[key]; if (m && m.v === S.version) return m.val; const val = fn(); memo[key] = { v: S.version, val }; return val; };
  const COL = 'collectionMilestones';

  Q.MS_ST = { pending: ['Chờ duyệt', 'amber'], approved: ['Đã duyệt', 'green'], rejected: ['Từ chối', 'red'], superseded: ['Phiên cũ', 'gray'], cancelled: ['Đã hủy', 'gray'] };
  Q.milestoneCfg = (period) => TH.calc.params.milestones(Q.param('milestones', D.periodEnd(period)));
  const recs = (period, bid, k) => S.where(COL, r => r.period === period && r.buildingId === bid && r.milestone === k);
  /* Số mốc hiện hành (bản duyệt mới nhất) và bản đang chờ của tòa × kỳ × mốc (k = 1..3) */
  Q.milestoneState = (period, bid, k) => {
    const all = recs(period, bid, k);
    const approved = all.filter(r => r.status === 'approved').sort((a, b) => (b.version || 0) - (a.version || 0))[0] || null;
    return { approved, pending: all.find(r => r.status === 'pending') || null, history: all.slice().sort((a, b) => (b.version || 0) - (a.version || 0)) };
  };
  Q.milestoneApproved = (period, bid, k) => Q.milestoneState(period, bid, k).approved;

  /* Tiền đã phân bổ vào hóa đơn kỳ, theo ngày tiền thực nhận (phiếu chưa đảo) – dựng một lần mỗi phiên bản store */
  const allocs = () => cached('allocs', () => {
    const m = {};
    S.all('payments').filter(p => p.status !== 'reversed').forEach(p => (p.allocations || []).forEach(a => { (m[a.invoiceId] = m[a.invoiceId] || []).push({ receivedAt: p.receivedAt, amount: a.amount }); }));
    return m;
  });
  const issuedOf = (period, bid) => Q.invoicesOf(period).filter(i => i.buildingId === bid && i.lifecycle !== 'draft');
  /* Đã thu cộng dồn của tòa đến hết ngày mốc tính từ phiếu thu (mọi hóa đơn đã phát hành, gồm phá HĐ) – số đối chiếu */
  Q.receiptCum = (period, bid, day) => {
    const lim = D.milestoneDate(period, day), A = allocs();
    return issuedOf(period, bid).reduce((s, i) => s + (A[i.id] || []).filter(x => x.receivedAt <= lim).reduce((t, x) => t + x.amount, 0), 0);
  };
  const dueOf = (i) => (i.isBreach && i.excel && Number(i.excel.total) > 0 ? Number(i.excel.total) : i.totalDue);

  /* Một dòng tòa (cột L–Y) + nguồn từng mốc */
  const buildingRow = (period, bid, mgrDate) => {
    const cfg = Q.milestoneCfg(period), today = F.today();
    const invs = issuedOf(period, bid), main = invs.filter(i => !i.isBreach), br = invs.filter(i => i.isBreach);
    const paid = (xs) => xs.reduce((s, i) => s + Q.invState(i).paid, 0);
    const due = invs.reduce((s, i) => s + dueOf(i), 0), collected = paid(invs), breachDue = br.reduce((s, i) => s + dueOf(i), 0), breachCollected = paid(br);
    const ms = cfg.days.map((day, idx) => {
      const k = idx + 1, date = D.milestoneDate(period, day), st = Q.milestoneState(period, bid, k), sys = Q.receiptCum(period, bid, day);
      const value = st.approved ? st.approved.amount : sys;
      return { k, day, date, reached: today >= date, sys, value, source: st.approved ? 'approved' : 'receipts', approved: st.approved, pending: st.pending, diff: st.approved ? st.approved.amount - sys : 0 };
    });
    const inp = X.payrollBuildingInputs(period, bid);
    const steps = P.milestones({ R5: inp.R5, R10: inp.R10, R15: inp.R15, deduct: inp.deduct, w: cfg.w });
    const pay = P.buildingPay({ J: inp.J, K: inp.K, L: inp.L, A: steps.A, Q: inp.Q, C: inp.C });
    const b = Q.building(bid), mgr = Q.managerOf(bid, mgrDate);
    return Object.assign({ buildingId: bid, code: b.code, group: b.group, manager: mgr, invoices: invs.length, mainInvoices: main.length, due, collected, breachDue, breachCollected, ms,
      M1: steps.M1, M2: steps.M2, M3: steps.M3, A: steps.A, T: pay.T, K: inp.K, HS: pay.HS, deduct: inp.deduct, pendingCount: ms.filter(m => m.pending).length }, PM.collectionRow({ due, collected, breachDue, breachCollected }));
  };
  /* Bảng tiến độ: theo tòa (L–Y) và theo quản lý (A–I). Quản lý gán theo phân công tại ngày mốc cuối (OQ-02). */
  Q.collectionProgress = (period, filters = {}) => cached('cp:' + period + ':' + JSON.stringify(filters) + ':' + ((S.session || {}).userId || ''), () => {
    const cfg = Q.milestoneCfg(period), last = D.milestoneDate(period, cfg.days[cfg.days.length - 1]);
    const mgrDate = F.today() < last ? F.today() : last;
    const ids = Q.scopeBuildingIds(filters, mgrDate);
    const withInv = new Set(Q.invoicesOf(period).filter(i => i.lifecycle !== 'draft').map(i => i.buildingId));
    const rows = [...ids].filter(id => withInv.has(id)).map(id => buildingRow(period, id, mgrDate)).sort((a, b) => a.code.localeCompare(b.code, 'vi', { numeric: true }));
    const agg = (xs) => {
      const s = (k) => xs.reduce((t, r) => t + (r[k] || 0), 0);
      const msSum = cfg.days.map((day, idx) => xs.reduce((t, r) => t + r.ms[idx].value, 0));
      const T = s('T'), K = s('K');
      return Object.assign({ buildings: xs.length, due: s('due'), collected: s('collected'), breachDue: s('breachDue'), breachCollected: s('breachCollected'), ms: msSum, M1: s('M1'), M2: s('M2'), M3: s('M3'), A: s('A'), HS: K ? T / K * 100 : null, pendingCount: s('pendingCount') },
        PM.collectionRow({ due: s('due'), collected: s('collected'), breachDue: s('breachDue'), breachCollected: s('breachCollected') }));
    };
    const byMgr = {};
    rows.forEach(r => { const key = r.manager ? r.manager.id : ''; (byMgr[key] = byMgr[key] || []).push(r); });
    const managers = Object.entries(byMgr).map(([id, xs]) => Object.assign({ manager: id ? Q.emp(id) : null }, agg(xs))).sort((a, b) => String(a.manager ? a.manager.name : 'zz').localeCompare(String(b.manager ? b.manager.name : 'zz'), 'vi'));
    return { period, days: cfg.days, weights: cfg.w, mgrDate, rows, managers, total: agg(rows) };
  });
  /* Danh sách bản nhập (chờ duyệt / lịch sử) trong phạm vi tòa */
  Q.milestoneRecords = (f = {}) => Q.scoped(S.all(COL)).filter(r => (!f.period || r.period === f.period) && (!f.status || r.status === f.status) && (!f.building || r.buildingId === f.building)
    && (!f.mine || r.reportedBy === (S.session || {}).userId)).sort((a, b) => String(b.reportedAt).localeCompare(String(a.reportedAt)));
  /* Việc của quản lý: mốc đã tới nhưng tòa chưa có số duyệt và chưa có bản đang chờ */
  Q.milestonesDue = (period) => (Q.collectionProgress(period).rows || []).flatMap(r => r.ms.filter(m => m.reached && !m.approved && !m.pending).map(m => ({ buildingId: r.buildingId, code: r.code, k: m.k, day: m.day })));

  const payrollClosed = (period) => S.where('payrollRuns', r => r.period === period && r.status === 'closed').length > 0;
  const neighbour = (period, bid, k) => { if (k < 1 || k > 3) return null; const st = Q.milestoneState(period, bid, k); const r = st.pending || st.approved; return r ? r.amount : null; };

  /* QL nhập số đã thu cộng dồn của tòa tại một mốc. Bản đang chờ của chính mốc đó được sửa đè (không tạo bản thứ hai). */
  X.reportMilestone = (d) => {
    _.need('collection.report');
    const bid = d.buildingId, k = Number(d.milestone), period = d.period;
    const b = Q.building(bid); if (!b) throw new Error('Không tìm thấy tòa');
    if (!TH.auth.inScope(bid)) throw new Error('Tòa ngoài phạm vi được giao');
    const per = S.get('periods', period); if (!per) throw new Error('Kỳ không tồn tại');
    _.guardPeriod(period, 'cập nhật mốc thu');
    if (payrollClosed(period)) throw new Error(`Lương kỳ ${F.periodShort(period)} đã chốt – số mốc không đổi được nữa; dùng điều chỉnh sau chốt (PA-02)`);
    const cfg = Q.milestoneCfg(period), errs = {};
    if (![1, 2, 3].includes(k)) errs.milestone = 'Chọn mốc';
    const day = cfg.days[k - 1], date = day ? D.milestoneDate(period, day) : null;
    if (date && F.today() < date) errs.milestone = `Chưa tới mốc ngày ${day} (${F.date(date)})`;
    const amount = Number(String(d.amount == null ? '' : d.amount).replace(/[^\d-]/g, ''));
    if (!Number.isFinite(amount) || String(d.amount).trim() === '' || amount < 0) errs.amount = 'Nhập số đã thu cộng dồn (≥ 0)';
    const note = String(d.note || '').trim();
    const before = neighbour(period, bid, k - 1), after = neighbour(period, bid, k + 1);
    if (!errs.amount && ((before != null && amount < before) || (after != null && amount > after)) && note.length < 5) errs.note = 'Số cộng dồn giảm giữa hai mốc – ghi rõ lý do (hoàn tiền, điều chỉnh…)';
    if (Object.keys(errs).length) fail(errs);
    const sys = Q.receiptCum(period, bid, day);
    const st = Q.milestoneState(period, bid, k), sess = S.session || {};
    const rec = { period, buildingId: bid, milestone: k, day, amount, systemAmount: sys, note, evidence: String(d.evidence || '').trim(), reportedBy: sess.userId || null, reportedByName: _.who(), reportedByEmployeeId: sess.employeeId || null, reportedAt: F.nowISO() };
    let out;
    if (st.pending) {
      if (st.pending.reportedBy !== sess.userId && !TH.auth.can('collection.approve')) throw new Error('Mốc này đang chờ duyệt bản nhập của ' + st.pending.reportedByName);
      out = S.update(COL, st.pending.id, Object.assign(rec, { revisions: [...(st.pending.revisions || []), { amount: st.pending.amount, at: st.pending.reportedAt, by: st.pending.reportedByName }] }));
    } else {
      const version = st.history.reduce((m, r) => Math.max(m, r.version || 0), 0) + 1;
      out = S.add(COL, Object.assign(rec, { id: 'msr_' + period + '_' + bid + '_' + k + '_v' + version, version, status: 'pending', previousAmount: st.approved ? st.approved.amount : null }));
    }
    _.audit(st.pending ? 'update' : 'create', 'collectionMilestone', out.id, `Mốc ngày ${day} tòa ${b.code} kỳ ${F.periodShort(period)}: đã thu cộng dồn ${F.vnd(amount)} (phiếu thu ${F.vnd(sys)})`);
    _.done(); return out;
  };
  X.approveMilestone = (id, note) => {
    _.need('collection.approve');
    const r = S.get(COL, id); if (!r) throw new Error('Không tìm thấy bản nhập');
    if (r.status !== 'pending') throw new Error('Bản nhập không ở trạng thái chờ duyệt');
    if (!TH.auth.inScope(r.buildingId)) throw new Error('Tòa ngoài phạm vi');
    if (r.reportedBy && r.reportedBy === (S.session || {}).userId) throw new Error('Không tự duyệt bản do chính mình nhập');
    _.guardPeriod(r.period, 'duyệt mốc thu');
    if (payrollClosed(r.period)) throw new Error('Lương kỳ đã chốt – không duyệt thay đổi mốc (PA-02)');
    S.atomic(() => {
      recs(r.period, r.buildingId, r.milestone).filter(x => x.status === 'approved').forEach(x => S.update(COL, x.id, { status: 'superseded', supersededBy: id }));
      S.update(COL, id, { status: 'approved', approvedBy: _.who(), approvedByUser: (S.session || {}).userId, approvedAt: F.nowISO(), approveNote: String(note || '').trim() });
      _.audit('approve', 'collectionMilestone', id, `Duyệt mốc ngày ${r.day} tòa ${Q.building(r.buildingId).code}: ${F.vnd(r.amount)} (phiếu thu ${F.vnd(r.systemAmount)})`);
    });
    _.done(); return S.get(COL, id);
  };
  X.rejectMilestone = (id, reason) => {
    _.need('collection.approve');
    const r = S.get(COL, id); if (!r) throw new Error('Không tìm thấy bản nhập');
    if (r.status !== 'pending') throw new Error('Bản nhập không ở trạng thái chờ duyệt');
    if (String(reason || '').trim().length < 5) fail({ reason: 'Nhập lý do từ chối (ít nhất 5 ký tự)' });
    S.update(COL, id, { status: 'rejected', rejectReason: String(reason).trim(), rejectedBy: _.who(), rejectedAt: F.nowISO() });
    _.audit('reject', 'collectionMilestone', id, `Từ chối mốc ngày ${r.day} tòa ${Q.building(r.buildingId).code}: ${reason}`); _.done(); return S.get(COL, id);
  };
  X.cancelMilestone = (id) => {
    _.need('collection.report');
    const r = S.get(COL, id); if (!r) throw new Error('Không tìm thấy bản nhập');
    if (r.status !== 'pending') throw new Error('Chỉ hủy bản đang chờ duyệt');
    if (r.reportedBy !== (S.session || {}).userId) throw new Error('Chỉ người nhập được hủy');
    S.update(COL, id, { status: 'cancelled', cancelledAt: F.nowISO() });
    _.audit('cancel', 'collectionMilestone', id, `Hủy bản nhập mốc ngày ${r.day} tòa ${Q.building(r.buildingId).code}`); _.done();
  };
})(window.TH);
