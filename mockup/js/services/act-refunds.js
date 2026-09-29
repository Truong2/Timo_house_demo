/* Actions – phiếu tính hoàn cọc, duyệt kép admin + kế toán, ghi chi hoàn (UI-17/UI-18, CH-17, GĐ OQ-16). */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, Cc = TH.calc;
  const inScope = (r) => { if (!r) throw new Error('Không tìm thấy phiếu hoàn'); if (!TH.auth.inScope(r.buildingId)) throw new Error('Phiếu hoàn ngoài phạm vi được giao'); };
  X.createRefund = (stayId, d = {}, silent) => {
    _.need('refunds.prepare');
    const s = Q.stay(stayId);
    if (S.one('refunds', r => r.stayId === stayId)) throw new Error('Lượt thuê đã có phiếu hoàn');
    if (!TH.auth.inScope(s.buildingId)) throw new Error('Lượt thuê ngoài phạm vi được giao');
    // Hoàn cọc: khách hết hạn HĐ; hoặc phần cọc dư khi chuyển phòng theo phương án "hoàn lại phần dư"
    if (s.endType && !(s.endType === 'expired' || (s.endType === 'transfer' && X.depositBalance(stayId) > 0))) throw new Error('Khách ' + Q.endTypeLabel(s.endType).toLowerCase() + ' không được hoàn cọc');
    const rate = Q.rateOf(stayId) || { items: {} };
    const fr = d.finalReading || {};
    const lastRd = S.where('meterReadings', r => r.roomId === s.roomId && !r.vacant).sort((a, b) => b.period.localeCompare(a.period))[0] || {};
    const dep = Math.max(0, X.depositBalance(stayId));
    const deductions = Cc.refund.defaultDeductions({ elPrev: fr.elPrev ?? lastRd.elCurr, elCurr: fr.elCurr ?? null, elUnit: (rate.items.electric || {}).unit || 4000,
      waPrev: fr.waPrev ?? lastRd.waCurr, waCurr: fr.waCurr ?? null, waUnit: (rate.items.water || {}).unit || 35000, depreciationPerRoom: Q.param('refundDepreciation') });
    const code = S.nextCode('refunds', 'HC-' + F.today().slice(0, 7).replace('-', '') + '-');
    const endDay = s.endDate ? Number(s.endDate.slice(8, 10)) : 0;
    const extraDays = s.endDate && endDay < 25 && s.endDate.slice(0, 7) > (s.rentStart || '').slice(0, 7) ? endDay : 0;
    const extraRent = extraDays ? Cc.refund.extraDaysRent(s.rent, extraDays, Cc.dates.daysInMonth(F.period(s.endDate))) : 0;
    // OQ-16: mặc định KHÔNG trừ tiền ngày ở thêm vào cọc; tham số refundDeductExtraDays = Có thì tự thêm dòng trừ (có lý do theo tham số)
    const dx = !!Q.param('refundDeductExtraDays', s.endDate || F.today()) && extraRent > 0;
    const extraReason = dx ? 'Theo tham số OQ-16 (refundDeductExtraDays)' : null;
    const calc = Cc.refund.calc({ deposit: dep, deductions: dx ? [...deductions, { kind: 'other', qty: 1, unit: extraRent, amount: extraRent, note: 'Tiền ngày ở thêm: ' + extraReason }] : deductions });
    const r = S.add('refunds', { id: 'rf_' + code, code, stayId, roomId: s.roomId, buildingId: s.buildingId, deposit: dep, deductions, bc: calc.bc, bd: calc.bd,
      extraDays, extraRent, deductExtra: dx, extraReason,
      handoverDate: s.handoverDate || s.endDate, status: 'draft', approvals: [], preparedBy: _.who() });
    _.audit('create', 'refund', r.id, `Lập phiếu hoàn ${code} cho ${s.code}`);
    if (!silent) _.done(); return r;
  };
  X.updateRefund = (id, d) => {
    _.need('refunds.prepare');
    const r = S.get('refunds', id); inScope(r);
    if (['approved', 'paid'].includes(r.status)) throw new Error('Phiếu đã duyệt – không sửa được');
    if (d.deductExtra && !String(d.extraReason || '').trim()) throw new Error('Nhập lý do khi trừ tiền ngày ở thêm vào cọc');
    const deductions = (d.deductions || r.deductions).map(x => Object.assign({}, x, { amount: Number(x.amount) || (Number(x.qty) || 0) * (Number(x.unit) || 0) }));
    const all = d.deductExtra ? [...deductions, { kind: 'other', qty: 1, unit: r.extraRent, amount: r.extraRent, note: 'Tiền ngày ở thêm: ' + d.extraReason }] : deductions;
    const calc = Cc.refund.calc({ deposit: r.deposit, deductions: all });
    S.update('refunds', id, { deductions, deductExtra: !!d.deductExtra, extraReason: d.extraReason || null, bc: calc.bc, bd: calc.bd, status: 'calculated', approvals: [] });
    _.audit('update', 'refund', id, `Tính lại phiếu hoàn: BC ${F.vnd(calc.bc)}, BD ${F.vnd(calc.bd)}`); _.done();
  };
  /* Duyệt kép: admin và kế toán mỗi người một lần; đủ hai → đã duyệt */
  X.approveRefund = (id) => {
    const role = TH.auth.role();
    const perm = role === 'admin' ? 'refunds.approve.admin' : 'refunds.approve.ketoan';
    _.need(perm);
    const r = S.get('refunds', id); inScope(r);
    if (r.status === 'draft') throw new Error('Bấm "Tính số hoàn" trước khi duyệt');
    if (r.status === 'paid') throw new Error('Phiếu đã chi');
    if ((r.approvals || []).some(a => a.role === role)) throw new Error('Vai trò ' + TH.auth.roleLabel() + ' đã duyệt phiếu này');
    const approvals = [...(r.approvals || []), { role, by: _.who(), at: F.nowISO() }];
    const both = ['admin', 'ketoan'].every(x => approvals.some(a => a.role === x));
    S.update('refunds', id, { approvals, status: both ? 'approved' : 'calculated' });
    _.audit('approve', 'refund', id, `${TH.auth.roleLabel()} duyệt phiếu hoàn ${r.code}${both ? ' – đủ 2 duyệt' : ''}`); _.done();
  };
  X.payRefund = (id, d) => {
    _.need('refunds.pay');
    const r = S.get('refunds', id); inScope(r);
    if (r.status !== 'approved') throw new Error('Phiếu cần đủ duyệt của Admin và Kế toán trước khi chi');
    if (!d.date) throw new Error('Nhập ngày chi');
    _.guardPeriod(F.period(d.date), 'ghi chi hoàn');
    const amount = d.amount != null ? Number(d.amount) : Math.max(0, r.bd);
    if (amount > Math.max(0, r.bd) + 0.5) throw new Error('Số chi vượt số tính hoàn');
    // Sổ cọc về 0: phần khấu trừ (tối đa bằng cọc đang giữ) ghi "deduct", phần chi ghi "refund"
    const bal = Math.max(0, X.depositBalance(r.stayId));
    const deduct = Math.min(bal, Math.max(0, bal - amount), r.bc);
    if (deduct > 0.5) S.add('depositLedger', { stayId: r.stayId, buildingId: r.buildingId, kind: 'deduct', amount: deduct, date: d.date, period: F.period(d.date), refundId: id, note: 'Khấu trừ khi hoàn cọc ' + r.code });
    S.add('depositLedger', { stayId: r.stayId, buildingId: r.buildingId, kind: 'refund', amount, date: d.date, period: F.period(d.date), refundId: id, note: 'Chi hoàn ' + r.code });
    // BD âm: số chi 0, phần khấu trừ vượt cọc thành hóa đơn thu riêng (dòng 13 Thu khác) → Công nợ UI-14, thu bằng phiếu thu thường
    const excessInv = r.bd < -0.5 ? X.createExcessInvoice(r, d.date) : null;
    S.update('refunds', id, { status: 'paid', paidAt: d.date, paidAmount: amount, method: d.method || 'bank', reference: d.reference || '', excessInvoiceId: excessInv ? excessInv.id : null });
    S.update('stays', r.stayId, { depositStatus: 'refunded' });
    _.audit('pay', 'refund', id, `Chi hoàn ${r.code}: ${F.vnd(amount)}` + (excessInv ? ` – vượt cọc ${F.vnd(-r.bd)} → ${excessInv.code}` : '')); _.done();
  };
  X.createExcessInvoice = (r, date) => {
    const s = Q.stay(r.stayId), b = Q.building(r.buildingId), period = F.period(date), excess = Math.round(-r.bd);
    const w = Cc.dates.billingWindow(period, Q.params());
    const lines = Cc.billing.expand([{ no: 13, qty: 1, factor: 1, unit: excess, amount: excess, note: 'Khấu trừ vượt cọc – phiếu hoàn ' + r.code }]);
    const code = 'INV-' + period + '-' + s.code + '-VC';
    if (S.get('invoices', 'inv_' + code)) throw new Error('Đã có hóa đơn vượt cọc ' + code);
    return S.add('invoices', { id: 'inv_' + code, code, period, stayId: s.id, roomId: s.roomId, buildingId: s.buildingId, customerCode: s.code, template: b.template, accountId: b.accountId,
      issueDate: date, cutoff: w.cutoff, dueFrom: date, dueTo: w.dueTo, lifecycle: 'issued', kind: 'deposit_excess', refundId: r.id, isNewStay: false, isBreach: false,
      lines, totalDue: excess, note: 'Khấu trừ vượt cọc phiếu ' + r.code, issuedAt: F.nowISO(), issuedBy: _.who(), snapshot: { lines: JSON.parse(JSON.stringify(lines)), total: excess }, createdBy: _.who() });
  };
})(window.TH);
