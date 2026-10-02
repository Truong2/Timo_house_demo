/* Cash transactions are separate from the M obligation in a locked distribution. */
(function (TH) {
  const S = TH.store, Q = TH.q, X = TH.actions, _ = X._, F = TH.f, CAP = TH.calc.capital;
  const own = id => TH.auth.role() !== 'codong' || id === TH.auth.shareholderId();
  const fail = fields => { const e = new Error('Giao dịch vốn chưa hợp lệ'); e.fields = fields; throw e; };
  /* Kỳ trả chủ nhà đã do vốn ban đầu chi trả (UI-33 Đầu tư ban đầu, coveredTo) → không sinh dòng phải góp; tòa không có vốn ban đầu thì lấy đủ */
  const fundedByInitial = p => { const ci = S.one('capitalInitial', c => c.buildingId === p.buildingId); return !!(ci && ci.coveredTo && p.from <= TH.calc.dates.periodEnd(ci.coveredTo)); };
  Q.capitalSchedule = (f = {}) => CAP.schedule(S.all('ownerPayments').filter(p => TH.auth.inScope(p.buildingId) && (!f.building || p.buildingId === f.building) && !fundedByInitial(p)), Q.shareRatios, S.all('shareholders')).filter(l => own(l.shareholderId) && (!f.sh || l.shareholderId === f.sh) && (!f.from || l.dueDate >= f.from) && (!f.to || l.dueDate <= f.to)).map(l => Object.assign({}, l, CAP.lineState(l, S.all('shareTxns'), F.today(), Q.param('shareRemindDays'))));
  Q.capitalPayouts = (f = {}) => S.all('shareRuns').filter(r => r.status === 'locked' && TH.auth.inScope(r.buildingId) && (!f.building || r.buildingId === f.building)).flatMap(r => r.rows.filter(h => own(h.id) && (!f.sh || h.id === f.sh)).map(h => {
    const versions = new Set(S.all('shareRuns').filter(v => v.buildingId === r.buildingId && v.period === r.period).map(v => v.id));
    const paid = S.all('shareTxns').filter(t => t.status !== 'void' && t.kind === 'payout' && versions.has(t.shareRunId) && t.shareholderId === h.id).reduce((s, t) => s + t.amount, 0);
    return { id: r.id + '_' + h.id, shareRunId: r.id, buildingId: r.buildingId, period: r.period, shareholderId: h.id, due: h.M, paid, remaining: Math.max(0, h.M - paid), overpaid: Math.max(0, paid - h.M), lockedAt: r.lockedAt };
  }));
  Q.capitalTxns = (f = {}) => S.all('shareTxns').filter(t => TH.auth.inScope(t.buildingId) && own(t.shareholderId) && (!f.building || t.buildingId === f.building) && (!f.sh || t.shareholderId === f.sh) && (!f.from || t.date >= f.from) && (!f.to || t.date <= f.to)).map(t => Object.assign({}, t));
  Q.capitalInitial = bid => {
    if (!TH.auth.inScope(bid)) return null;
    const rec = S.one('capitalInitial', c => c.buildingId === bid); if (!rec) return null;
    const result = CAP.initial(rec);
    return Object.assign({}, rec, { holders: rec.holders.filter(h => own(h.shareholderId)), result: Object.assign({}, result, { holders: result.holders.filter(h => own(h.shareholderId)) }) });
  };
  const record = (kind, d) => {
    _.need('capital.manage'); _.needMs('3', 'Góp vốn / chi thực');
    const errs = {}, amount = Number(d.amount), date = d.date || F.today();
    if (!Number.isFinite(amount) || amount <= 0) errs.amount = 'Số tiền phải lớn hơn 0';
    if (!/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) errs.date = 'Nhập ngày hợp lệ';
    if (!Q.shareholder(d.shareholderId)) errs.shareholderId = 'Chọn cổ đông';
    let bid, ref;
    if (kind === 'payout') {
      const r = S.get('shareRuns', d.shareRunId); const h = r && r.rows.find(h => h.id === d.shareholderId);
      if (!r || r.status !== 'locked' || !h) errs.shareRunId = 'Chỉ chi theo M của bảng kê đã khóa';
      else { bid = r.buildingId; ref = 'shareRun'; const line = Q.capitalPayouts().find(l => l.shareRunId === r.id && l.shareholderId === h.id); if (amount > line.remaining) errs.amount = 'Chi vượt số M còn phải trả'; }
    } else {
      const l = Q.capitalSchedule().find(l => l.ownerPaymentId === d.ownerPaymentId && l.shareholderId === d.shareholderId);
      if (!l) errs.ownerPaymentId = 'Chọn nghĩa vụ góp theo lịch trả chủ nhà';
      else { bid = l.buildingId; ref = 'ownerPayment'; if (kind === 'withdraw' && amount > l.paid) errs.amount = 'Rút vượt số đã góp'; if (kind === 'contribute' && amount > l.remaining) errs.amount = 'Góp vượt số phải góp'; }
    }
    if (kind === 'withdraw' && !String(d.reason || '').trim()) errs.reason = 'Nhập lý do rút vốn';
    if (bid && !TH.auth.inScope(bid)) errs.buildingId = 'Tòa ngoài phạm vi';
    if (d.docId) { const doc = S.get('documents', d.docId); if (!doc || doc.status !== 'current' || doc.objectType !== 'shareholder' || doc.objectId !== d.shareholderId || doc.buildingId !== bid) errs.docId = 'Chọn chứng từ hiện hành của cổ đông và tòa này'; }
    if (Object.keys(errs).length) fail(errs);
    _.guardPeriod(F.period(date), 'ghi giao dịch vốn');
    const t = S.add('shareTxns', { code: S.nextCode('shareTxns', 'GV-'), kind, ref, buildingId: bid, shareholderId: d.shareholderId, ownerPaymentId: d.ownerPaymentId || null, shareRunId: d.shareRunId || null, amount, date, method: d.method || 'bank', docId: d.docId || null, reason: d.reason || '', status: 'active', by: _.who() });
    _.audit('create', 'shareTxn', t.id, kind + ' ' + F.vnd(amount) + ' · ' + t.code); _.done(); return Object.assign({}, t);
  };
  X.recordContribution = d => record('contribute', d);
  X.recordWithdrawal = d => record('withdraw', d);
  X.recordPayout = d => record('payout', d);
  X.voidShareTxn = (id, reason) => {
    _.need('capital.manage'); _.needMs('3', 'Hủy giao dịch vốn');
    const t = S.get('shareTxns', id); if (!t || t.status === 'void' || !TH.auth.inScope(t.buildingId)) throw new Error('Giao dịch không còn hiệu lực hoặc ngoài phạm vi');
    if (!String(reason || '').trim()) fail({ reason: 'Nhập lý do hủy' });
    _.guardPeriod(F.period(t.date), 'hủy giao dịch vốn');
    if (t.kind === 'contribute') { const l = Q.capitalSchedule().find(l => l.ownerPaymentId === t.ownerPaymentId && l.shareholderId === t.shareholderId); if (!l || l.paid < t.amount) throw new Error('Đã rút một phần tiền góp; hủy giao dịch rút trước'); }
    S.update('shareTxns', id, { status: 'void', voidReason: reason, voidBy: _.who(), voidAt: F.nowISO() }); _.audit('void', 'shareTxn', id, 'Hủy ' + t.code + ': ' + reason); _.done();
  };
})(window.TH);
