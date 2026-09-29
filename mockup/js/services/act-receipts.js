/* Actions – phiếu thu, phân bổ do kế toán chọn, đảo phiếu (UI-13, GĐ OQ-09: chỉ admin/kế toán ghi thu). */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, Cc = TH.calc;
  /* Kế hoạch phân bổ: mỗi dòng {invoiceId, lineNo?}; có lineNo → trần = số còn phải thu của dòng đó (SRS UI-13 "không vượt số còn phải thu của dòng"); không có → trần = còn nợ hóa đơn */
  const planOf = (allocs, allowOver) => {
    const rows = (allocs || []).filter(a => Number(a.amount) > 0).map(a => {
      const inv = Q.invoice(a.invoiceId); if (!inv) throw new Error('Không tìm thấy hóa đơn ' + a.invoiceId);
      if (inv.lifecycle === 'draft') throw new Error('Hóa đơn ' + inv.code + ' chưa phát hành – chưa phân bổ được');
      const no = a.lineNo == null || a.lineNo === '' ? null : Number(a.lineNo);
      const max = allowOver ? null : no ? (Q.lineState(inv)[no - 1] || {}).remaining || 0 : Q.invState(inv).remaining;
      return { invoiceId: inv.id, lineNo: no, amount: Number(a.amount), max, label: inv.code + (no ? ' dòng ' + no + ' ' + Cc.billing.lineDef(no).label : '') };
    });
    // Cộng cả hóa đơn không vượt số còn nợ của hóa đơn (khi trộn phân bổ theo dòng và cấp hóa đơn)
    if (!allowOver) { const by = {}; rows.forEach(r => { by[r.invoiceId] = (by[r.invoiceId] || 0) + r.amount; }); Object.entries(by).forEach(([id, v]) => { const inv = Q.invoice(id); if (v - Q.invState(inv).remaining > 0.5) throw new Error('Phân bổ vượt số còn phải thu của ' + inv.code); }); }
    return rows;
  };
  const allocRec = (a) => a.lineNo ? { invoiceId: a.invoiceId, lineNo: a.lineNo, amount: a.amount } : { invoiceId: a.invoiceId, amount: a.amount };
  X.recordPayment = (d, silent) => {
    _.need('payments.record');
    const s = Q.stay(d.stayId); if (!s) throw new Error('Chọn khách / lượt thuê');
    const amount = Number(d.amount);
    // Phiếu cọc chỉ ghi sổ cọc; cọc trên hóa đơn đầu (dòng 2) thu bằng phiếu thu hóa đơn – tránh đếm một khoản tiền hai lần
    if (d.type === 'deposit' && (d.allocations || []).some(a => Number(a.amount) > 0)) throw new Error('Phiếu nhận cọc không phân bổ vào hóa đơn – cọc trên hóa đơn thu bằng phiếu "Thu hóa đơn"');
    if (!TH.auth.inScope(s.buildingId)) throw new Error('Lượt thuê ngoài phạm vi được giao');
    const plan = planOf(d.allocations, d.allowOver);
    const v = Cc.payments.validateAllocation(amount, plan);
    if (!v.ok) throw new Error(v.errs.join('; '));
    if (!d.receivedAt) throw new Error('Nhập ngày tiền thực nhận');
    if (d.receivedAt > F.today()) throw new Error('Ngày thực nhận không được sau hôm nay');
    plan.forEach(a => _.guardPeriod(Q.invoice(a.invoiceId).period, 'ghi thu vào hóa đơn'));
    // Trả trước nhiều tháng (E14): chia phần từng kỳ theo tiền phòng tháng; tiền mặt chỉ ghi một lần tại ngày thu
    let prepayPlan = null;
    if ((d.type || (plan.length ? 'invoice' : 'prepay')) === 'prepay' && Number(d.months) > 0) {
      if (!/^\d{4}-\d{2}$/.test(d.fromPeriod || '')) throw new Error('Chọn kỳ bắt đầu trả trước');
      const monthly = Number(d.monthly) || (Q.rateOf(s.id, Cc.dates.periodStart(d.fromPeriod)) || {}).rent || s.rent;
      if (!(monthly > 0)) throw new Error('Lượt thuê chưa có giá thuê để chia trả trước');
      const sp = Cc.payments.prepaySplit(v.unallocated, monthly, Number(d.months));
      prepayPlan = sp.parts.map(x => ({ period: F.addMonths(d.fromPeriod + '-01', x.index).slice(0, 7), amount: x.amount, applied: 0 }));
    }
    const code = S.nextCode('payments', 'PT-' + d.receivedAt.slice(0, 7).replace('-', '') + '-');
    const p = S.add('payments', { id: 'pay_' + code, code, type: d.type || (plan.length ? 'invoice' : 'prepay'), stayId: s.id, customerId: s.customerId, buildingId: s.buildingId, receivedAt: d.receivedAt, enteredAt: F.today(),
      method: d.method || 'bank', accountId: d.accountId || (Q.building(s.buildingId) || {}).accountId, amount, reference: d.reference || '', evidence: d.evidence || null,
      receivedBy: d.receivedBy || _.who(), recordedBy: _.who(), allocations: plan.map(allocRec), unallocated: v.unallocated, prepayPlan, forPeriod: prepayPlan ? prepayPlan[0].period : undefined, note: d.note || '', status: 'posted' });
    if (p.type === 'deposit') { S.add('depositLedger', { stayId: s.id, buildingId: s.buildingId, kind: 'receive', amount, date: d.receivedAt, period: F.period(d.receivedAt), paymentId: p.id, note: 'Nhận cọc ' + code }); X.syncDepositStatus(s.id); }
    _.audit('create', 'payment', p.id, `Ghi thu ${code}: ${F.vnd(amount)} (${s.code})` + (prepayPlan ? ` – trả trước ${prepayPlan.length} kỳ từ ${F.periodShort(prepayPlan[0].period)}` : ''));
    // Kỳ trả trước đã có hóa đơn phát hành → áp ngay
    if (prepayPlan) S.where('invoices', i => i.stayId === s.id && i.lifecycle !== 'draft' && prepayPlan.some(x => x.period === i.period)).forEach(i => X.applyPrepay(i.id));
    if (!silent) _.done(); return S.get('payments', p.id);
  };
  /* Phân bổ số dư chưa phân bổ (trả trước, cọc giữ phòng) vào hóa đơn */
  X.allocatePayment = (id, allocations) => {
    _.need('payments.record');
    const p = S.get('payments', id); if (!p) throw new Error('Không tìm thấy phiếu thu');
    if (!TH.auth.inScope(p.buildingId)) throw new Error('Phiếu thu ngoài phạm vi được giao');
    if (p.status === 'reversed') throw new Error('Phiếu đã đảo');
    if (p.type === 'deposit') throw new Error('Phiếu nhận cọc không phân bổ vào hóa đơn (cọc giữ trong sổ cọc)');
    const plan = planOf(allocations);
    if (plan.some(a => Q.invoice(a.invoiceId).stayId !== p.stayId)) throw new Error('Chỉ phân bổ vào hóa đơn của cùng lượt thuê');
    plan.forEach(a => _.guardPeriod(Q.invoice(a.invoiceId).period, 'phân bổ phiếu thu'));
    const v = Cc.payments.validateAllocation(p.unallocated, plan); if (!v.ok) throw new Error(v.errs.join('; '));
    S.update('payments', id, { allocations: [...p.allocations, ...plan.map(allocRec)], unallocated: v.unallocated });
    _.audit('allocate', 'payment', id, `Phân bổ ${F.vnd(v.allocated)} từ ${p.code}`); _.done();
  };
  /* Áp phần trả trước của kỳ vào hóa đơn đã phát hành (tự động khi phát hành): ưu tiên dòng 1 tiền phòng, phần còn lại cấp hóa đơn; không vượt số còn phải thu */
  X.applyPrepay = (invId) => {
    const inv = Q.invoice(invId); if (!inv || inv.lifecycle === 'draft') return 0;
    let total = 0;
    S.where('payments', p => p.stayId === inv.stayId && p.status !== 'reversed' && p.unallocated > 0.5 && (p.prepayPlan || []).some(x => x.period === inv.period && x.amount - (x.applied || 0) > 0.5))
      .sort((a, b) => a.receivedAt.localeCompare(b.receivedAt)).forEach(p => {
        const part = p.prepayPlan.find(x => x.period === inv.period);
        const want = Math.min(part.amount - (part.applied || 0), p.unallocated, Q.invState(inv).remaining); if (want <= 0.5) return;
        const r1 = Q.lineState(inv)[0].remaining, onRent = Math.min(want, r1), add = [];
        if (onRent > 0.5) add.push({ invoiceId: inv.id, lineNo: 1, amount: onRent });
        if (want - onRent > 0.5) add.push({ invoiceId: inv.id, amount: want - onRent });
        S.update('payments', p.id, { allocations: [...p.allocations, ...add], unallocated: p.unallocated - want, prepayPlan: p.prepayPlan.map(x => x === part ? Object.assign({}, x, { applied: (x.applied || 0) + want, invoiceId: inv.id }) : x) });
        _.audit('allocate', 'payment', p.id, `Áp trả trước ${F.vnd(want)} từ ${p.code} vào ${inv.code}`); total += want;
      });
    return total;
  };
  X.reversePayment = (id, reason) => {
    _.need('payments.reverse');
    if (!String(reason || '').trim()) throw new Error('Nhập lý do đảo phiếu');
    const p = S.get('payments', id); if (p.status === 'reversed') throw new Error('Phiếu đã đảo');
    p.allocations.forEach(a => _.guardPeriod(Q.invoice(a.invoiceId).period, 'đảo phiếu'));
    S.update('payments', id, { status: 'reversed', reversedAt: F.nowISO(), reversedBy: _.who(), reverseReason: reason });
    // Đảo phiếu cọc: ghi bút toán đảo vào sổ cọc (số âm, cùng kỳ nhận) để số dư cọc và báo cáo khớp
    if (p.type === 'deposit') {
      _.guardPeriod(F.period(p.receivedAt), 'đảo phiếu cọc');
      S.add('depositLedger', { stayId: p.stayId, buildingId: p.buildingId, kind: 'receive', amount: -p.amount, date: p.receivedAt, period: F.period(p.receivedAt), paymentId: p.id, note: 'Đảo phiếu cọc ' + p.code + ': ' + reason });
      X.syncDepositStatus(p.stayId);
    }
    _.audit('reverse', 'payment', id, `Đảo phiếu ${p.code}: ${reason}`); _.done();
  };
})(window.TH);
