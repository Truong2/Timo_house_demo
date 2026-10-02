/* UI-33: derived owner rent obligations, investor cash transactions and deduplicated initial ledger. */
(function (TH) {
  const CAP = {}, DT = TH.calc.dates;
  CAP.schedule = (payments, ratiosAt, holders) => payments.flatMap(p => ratiosAt(p.buildingId, p.dueDate).filter(r => r.pct > 0).map(r => ({ id: p.id + '_' + r.shareholderId, ownerPaymentId: p.id, buildingId: p.buildingId, from: p.from, months: p.months, dueDate: p.dueDate, shareholderId: r.shareholderId, common: !!(holders.find(h => h.id === r.shareholderId) || {}).common, pct: r.pct, periodAmount: p.amountDue, due: Math.round(p.amountDue * r.pct / 100) })));
  CAP.lineState = (line, txns, today, remindDays = 7) => {
    const paid = txns.filter(t => t.status !== 'void' && t.ownerPaymentId === line.ownerPaymentId && t.shareholderId === line.shareholderId).reduce((n, t) => n + (t.kind === 'contribute' ? t.amount : t.kind === 'withdraw' ? -t.amount : 0), 0);
    const remaining = Math.max(0, line.due - paid), days = TH.f.daysBetween(today, line.dueDate);
    return { paid, remaining, status: remaining <= 0 ? 'paid' : days < 0 ? 'overdue' : paid > 0 ? 'partial' : 'unpaid', soon: remaining > 0 && days >= 0 && days <= remindDays, days };
  };
  CAP.initial = rec => {
    const seen = new Set(), unique = (rec.lines || []).filter(l => { if (l.dupOf || seen.has(l.id)) return false; seen.add(l.id); return true; });
    const expense = unique.reduce((s, l) => s + (Number(l.expense) || 0), 0), receipt = unique.reduce((s, l) => s + (Number(l.receipt) || 0), 0), difference = receipt - expense;
    const holders = (rec.holders || []).map(h => Object.assign({}, h, { loss: difference * h.pct / 100, received: h.paid + difference * h.pct / 100 }));
    return { expense, receipt, difference, paid: holders.reduce((s, h) => s + h.paid, 0), received: holders.reduce((s, h) => s + h.received, 0), holders, unique, investment: (rec.assets || []).reduce((s, a) => s + a.cost, 0) };
  };
  TH.calc.capital = CAP;
})(window.TH);
