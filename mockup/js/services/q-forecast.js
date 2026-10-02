/* Forecast suggestions are as-of the draft date; source fixtures are reference inputs, not live receipts. */
(function (TH) {
  const S = TH.store, Q = TH.q, F = TH.f, DT = TH.calc.dates, FC = TH.calc.forecast;
  const clone = x => JSON.parse(JSON.stringify(x));
  Q.forecasts = period => { TH.auth.need('forecast.view'); return clone(S.all('forecasts').filter(f => !period || f.period === period).sort((a, b) => b.period.localeCompare(a.period) || b.version - a.version)); };
  Q.forecast = id => { TH.auth.need('forecast.view'); const f = S.get('forecasts', id); return f ? clone(f) : null; };
  Q.forecastLatestPeriod = () => S.all('forecasts').map(f => f.period).sort().pop() || null;
  /* Tòa mới đưa vào vận hành trong kỳ – gợi ý loại trừ khi lập (Excel "Tính đến G15" = chưa gồm G16–G18) */
  Q.forecastNewBuildings = period => S.all('buildings').filter(b => b.operatedFrom > DT.periodEnd(DT.prevPeriod(period)) && b.operatedFrom <= DT.periodEnd(period));
  /* Phạm vi tòa của bản dự kiến: excluded = id tòa loại trừ; scopeNote sinh từ danh sách loại trừ */
  Q.forecastScopeNote = excluded => excluded.length ? 'Trừ ' + excluded.map(id => (Q.building(id) || {}).code || id).sort((a, b) => a.localeCompare(b, 'vi', { numeric: true })).join(', ') : 'Toàn bộ tòa trên web';
  Q.forecastAuto = (period, draftDate, { excluded = [] } = {}) => {
    TH.auth.need('forecast.manage');
    if (!Array.isArray(excluded) || excluded.some(id => !Q.building(id))) throw new Error('Tòa loại trừ không tồn tại');
    const out = new Set(excluded), inScope = bid => !out.has(bid);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period) || !/^\d{4}-\d{2}-\d{2}$/.test(draftDate || '') || Number.isNaN(Date.parse(draftDate)) || new Date(draftDate).toISOString().slice(0, 10) !== draftDate || draftDate.slice(0, 7) !== period) throw new Error('Ngày lập hợp lệ phải thuộc kỳ dự kiến');
    const previous = DT.prevPeriod(period), paid = {}, before = {}, prevPaid = {}, previousEnd = DT.periodEnd(previous);
    S.all('payments').filter(p => p.status !== 'reversed').forEach(p => {
      (p.allocations || []).forEach(a => { const date = (p.receivedAt || '').slice(0, 10); if (date <= draftDate) paid[a.invoiceId] = (paid[a.invoiceId] || 0) + a.amount; if (date <= previous + draftDate.slice(7)) before[a.invoiceId] = (before[a.invoiceId] || 0) + a.amount; if (date <= previousEnd) prevPaid[a.invoiceId] = (prevPaid[a.invoiceId] || 0) + a.amount; });
    });
    const prevInv = Q.invoicesOf(previous).filter(i => i.lifecycle !== 'draft' && inScope(i.buildingId)), finalPaid = prevPaid;
    const afterDue = prevInv.reduce((s, i) => s + Math.max(0, i.totalDue - (before[i.id] || 0) - (i.ownerSettled || 0)), 0);
    const afterPaid = prevInv.reduce((s, i) => s + Math.min(Math.max(0, i.totalDue - (before[i.id] || 0)), Math.max(0, (finalPaid[i.id] || 0) - (before[i.id] || 0))), 0);
    const recoveryRate = afterDue > 0 ? Math.min(1, afterPaid / afterDue) : 0;
    const inputs = { J3: 0, J4: 0, J5: 0, J6: 0, J7: 0, E4: 0, G4: 0, E4parts: [] };
    Q.invoicesOf(period).filter(i => i.lifecycle !== 'draft' && inScope(i.buildingId)).forEach(i => {
      const cash = (paid[i.id] || 0) + (i.ownerSettled || 0), key = i.isNewStay ? 'J5' : 'J4'; inputs[key] += cash;
      inputs[i.isNewStay ? 'J7' : 'J6'] += Math.max(0, i.totalDue - cash - (i.carriedOut || 0)) * recoveryRate;
      const deposit = TH.calc.billing.expand(i.lines)[1].amount;
      inputs.E4 += Math.min(Math.max(0, deposit), Math.max(0, cash));
    });
    S.all('depositLedger').filter(l => l.kind === 'receive' && inScope(l.buildingId) && l.paymentId && l.period === period && ((S.get('payments', l.paymentId) || {}).receivedAt || '').slice(0, 10) <= draftDate).forEach(l => { inputs.E4 += l.amount; inputs.J5 += l.amount; });
    S.all('refunds').filter(r => r.status === 'paid' && inScope(r.buildingId) && F.period(r.paidAt) === period && r.paidAt.slice(0, 10) <= draftDate).forEach(r => { inputs.G4 += r.paidAmount; });
    S.all('expenses').filter(e => e.status !== 'void' && (!e.buildingId || inScope(e.buildingId)) && e.period === period && (e.date || e.paidAt || e.createdAt || '').slice(0, 10) <= draftDate && e.reportLine === 'cost_equip').forEach(e => { inputs.J3 += e.amount; });
    // Chi phí gợi ý = thực tế UI-29 kỳ trước của các tòa trong phạm vi (chi phí chung đã phân bổ theo tòa) + tiền thuê tòa mới trong phạm vi
    const rep = TH.qr.get(previous, 'total'), prevCost = {};
    Object.entries(rep.byBuilding).filter(([bid]) => inScope(bid)).forEach(([, v]) => Object.keys(v).forEach(k => { if (typeof v[k] === 'number') prevCost[k] = (prevCost[k] || 0) + v[k]; }));
    const added = Q.forecastNewBuildings(period).filter(b => inScope(b.id)).reduce((n, b) => n + TH.actions.ownerRentAt('oc_' + b.code, DT.periodEnd(period)), 0);
    const depBy = Q.depOfPeriod(period).byBuilding, depWeb = Object.entries(depBy).filter(([bid]) => inScope(bid)).reduce((n, [, v]) => n + v, 0);
    const lines = FC.suggest(prevCost, added).map(l => Object.assign(l, { source_ref: 'UI-29 ' + previous, formula: 'Chi phí kỳ trước' }));
    lines.forEach(l => { if (l.key === 'refund') l.value = l.suggested = inputs.G4; if (l.key === 'cost_equip') l.value = l.suggested = depWeb; if (l.key === 'marketing') l.value = l.suggested = inputs.E4 / 2; if (l.key === 'sal_head2') l.value = l.suggested = 0; });
    const inputMeta = Object.fromEntries(['J3', 'J4', 'J5', 'J6', 'J7', 'E4', 'G4'].map(k => [k, { auto: inputs[k], suggested: inputs[k], reason: '', source_ref: ['J6', 'J7'].includes(k) ? 'Nợ kỳ hiện tại × tỷ lệ thu sau ngày lập kỳ trước' : 'Giao dịch web đến ' + draftDate }]));
    return { period, draftDate, inputs, inputMeta, lines, recoveryRate, scopeNote: Q.forecastScopeNote([...out]), excludedBuildings: [...out], depWeb };
  };
  Q.forecastResult = (fc, mode = 'excel') => FC.compute(fc, { mode, depRate: fc.depRate == null ? Q.param('depRate', fc.draftDate) : fc.depRate, depWeb: fc.depWeb == null ? Q.depOfPeriod(fc.period).total : fc.depWeb });
  Q.forecastVsActual = (id, mode = 'web') => {
    const fc = Q.forecast(id); if (!fc) return null;
    if (TH.auth.role() === 'codong') return { available: false, reason: 'Cổ đông chỉ xem bản dự kiến; số thực tế UI-29/UI-30 toàn hệ thống ngoài phạm vi tòa góp vốn' };
    const p = S.get('periods', fc.period) || {}; if (p.status !== 'closed' && p.source !== 'excel_parallel') return { available: false, reason: 'Kỳ chưa chốt hoặc chưa chạy song song Excel' };
    const result = Q.forecastResult(fc, mode), total = TH.qr.get(fc.period, 'total'), business = TH.qr.get(fc.period, 'business');
    return { available: true, scopeNote: fc.scopeNote, total: FC.compare(result.total, total.cols.TOTAL), business: FC.compare(result.business, business.cols.TOTAL), note: 'Đối chiếu phạm vi dự kiến với phạm vi UI-29/UI-30 trước khi kết luận; SRC-14 không chia theo tòa.' };
  };
})(window.TH);
