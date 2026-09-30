/* Actions – chi phí gốc (UI-15): mỗi khoản gắn tòa hoặc quỹ chung + dòng báo cáo SRC-04; thiết bị có khấu hao. */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q;
  X.addExpense = (d, silent) => {
    _.need('expenses.manage');
    const errs = {};
    const cat = TH.data.catalog.expenseCategories.find(c => c.key === d.category);
    if (!cat) errs.category = 'Chọn loại chi phí';
    if (!d.date) errs.date = 'Nhập ngày chi';
    if (!/^\d{4}-\d{2}$/.test(d.period || '')) errs.period = 'Nhập kỳ hưởng';
    if (!(Number(d.amount) > 0)) errs.amount = 'Nhập số tiền';
    if (d.scope === 'building' && !d.buildingId) errs.buildingId = 'Chọn tòa';
    if (d.scope === 'fund' && !d.fundCode) errs.fundCode = 'Chọn quỹ chung';
    if (!['building', 'fund'].includes(d.scope)) errs.scope = 'Chọn tòa hoặc quỹ chung';
    if (Object.keys(errs).length) { const e = new Error('Dữ liệu chưa hợp lệ'); e.fields = errs; throw e; }
    _.guardPeriod(d.period, 'ghi chi phí');
    if (d.code && S.one('expenses', x => x.code === d.code)) throw new Error('Mã chứng từ đã tồn tại: ' + d.code);
    const fund = d.scope === 'fund' ? TH.data.catalog.funds.find(f => f.code === d.fundCode) : null;
    const code = d.code || S.nextCode('expenses', 'CP-' + d.period.replace('-', '') + '-');
    const e = S.add('expenses', { id: 'exp_' + code, code, date: d.date, period: d.period, enteredAt: F.today(), category: d.category, reportLine: (d.source === 'payroll' && d.reportLine) || (fund ? fund.reportLine : cat.reportLine),
      scope: d.scope, buildingId: d.scope === 'building' ? d.buildingId : null, roomId: d.roomId || null, fundCode: fund ? fund.code : null, vendor: d.vendor || '', amount: Number(d.amount),
      method: d.method || 'bank', note: d.note || '', source: d.source || 'manual', refId: d.refId || null, isEquipment: !!cat.equipment, depRate: cat.equipment ? (Number(d.depRate) || Q.param('depRate')) : null,
      enteredBy: _.who(), status: 'posted', evidence: d.evidence || null });
    if (cat.equipment) S.add('equipment', { buildingId: e.buildingId, name: d.note || 'Thiết bị', purchaseDate: d.date, cost: e.amount, depRate: e.depRate, source: 'expense', expenseId: e.id });
    _.audit('create', 'expense', e.id, `Chi phí ${code}: ${F.vnd(e.amount)} – ${cat.label}`);
    if (!silent) _.done(); return e;
  };
  X.voidExpense = (id, reason) => {
    _.need('expenses.manage');
    if (!String(reason || '').trim()) throw new Error('Nhập lý do hủy');
    const e = S.get('expenses', id); _.guardPeriod(e.period, 'hủy chi phí');
    if (e.source === 'payroll') throw new Error('Chi phí lương sinh từ bảng lương đã chốt – điều chỉnh ở bảng lương');
    S.update('expenses', id, { status: 'void', voidReason: reason, voidBy: _.who() });
    // Hủy khoản chi tiền nhà → trả lại số đã chi của kỳ trả chủ nhà (UI-05)
    // Hủy chứng từ chi hoa hồng (UI-22) → gỡ đợt chi, dòng hoa hồng chi lại được
    if (e.source === 'commission' && e.refId) { const c = S.get('commissions', e.refId); if (c) S.update('commissions', c.id, { installments: (c.installments || []).filter(i => i.expenseId !== id), status: c.status === 'paid' ? 'approved' : c.status }); }
    if (e.source === 'ownerPayment' && e.refId) { const op = S.get('ownerPayments', e.refId); if (op) S.update('ownerPayments', op.id, { paid: Math.max(0, (op.paid || 0) - e.amount), expenseIds: (op.expenseIds || []).filter(x => x !== id) }); }
    _.audit('void', 'expense', id, `Hủy chi phí ${e.code}: ${reason}`); _.done();
  };
})(window.TH);
