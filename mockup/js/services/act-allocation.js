/* Actions – phân bổ quỹ chung theo số phòng (UI-16, E17): xem trước, đổi mẫu số có lý do, chốt phiên bản. */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, D = TH.calc.dates;
  /* Số phòng từng tòa của kỳ: kỳ song song dùng số phòng bảng lương SRC-03; kỳ live đếm phòng có giá thuê đang khai thác (GĐ OQ-14) */
  X.roomBasis = (period) => {
    const rb = S.where('roomBasis', r => r.period === period);
    if (rb.length) return { rooms: Object.fromEntries(rb.map(r => [r.buildingId, r.rooms])), source: rb[0].source };
    const pe = D.periodEnd(period); const out = {};
    // Tham số allocDenominator (OQ-04): systemRooms = phòng có giá thuê (theo noRentRoomsExcluded); allRooms = mọi phòng đang khai thác kể cả phòng không giá
    const allRooms = Q.param('allocDenominator', pe) === 'allRooms';
    S.all('buildings').filter(b => !b.operatedFrom || b.operatedFrom <= pe).forEach(b => { const n = (Q.roomsByBuilding()[b.id] || []).filter(r => allRooms ? r.exploitation !== 'meter_common' && r.status !== 'inactive' : Q.rentable(r, pe)).length; if (n) out[b.id] = n; });
    return { rooms: out, source: (allRooms ? 'Mọi phòng đang khai thác (kể cả không giá)' : 'Phòng có giá thuê đang khai thác') + ' tại ' + F.date(pe) + ' · tham số allocDenominator' };
  };
  X.fundAmounts = (period) => {
    const m = {}; S.all('expenses').filter(e => e.period === period && e.scope === 'fund' && e.status !== 'void').forEach(e => { m[e.fundCode] = (m[e.fundCode] || 0) + e.amount; });
    return m;
  };
  X.previewAllocation = (period, override) => {
    const basis = X.roomBasis(period);
    const amounts = X.fundAmounts(period);
    // Phụ phí/phòng và phần cố định/tòa (công thức G1 C36–C46) chỉ dùng để tái hiện Excel ở kỳ chạy song song.
    // Kỳ live: mọi khoản phân bổ phải có chứng từ quỹ (lương trưởng phòng 10.000đ/phòng vào quỹ khi chốt bảng lương) – không sinh chi phí không nguồn.
    const per = S.get('periods', period) || {}; const excelFormula = per.source === 'excel_parallel';
    const funds = TH.data.allocRules.map(r => { const amount = amounts[r.fundCode] || 0; return { lineCode: r.lineCode, fundCode: r.fundCode, label: r.label, amount, surchargePerRoom: excelFormula && amount ? r.surchargePerRoom || 0 : 0, fixedPerBuilding: excelFormula && amount ? r.fixedPerBuilding || 0 : 0, g1: r.g1 }; });
    const denom = override && override.denominator ? Number(override.denominator) : null;
    const res = TH.calc.allocation.allocate({ funds, roomsByBuilding: basis.rooms, denominator: denom });
    res.lines.forEach((l, i) => Object.assign(l, { fundCode: funds[i].fundCode, label: funds[i].label, g1: funds[i].g1 }));
    return Object.assign(res, { basisSource: basis.source, missingFunds: funds.filter(f => !f.amount).map(f => f.label), overrideReason: override && override.reason });
  };
  X.saveAllocation = (period, override) => {
    _.need('allocation.manage');
    _.guardPeriod(period, 'phân bổ');
    if (override && override.denominator && !String(override.reason || '').trim()) throw new Error('Đổi mẫu số phải ghi lý do (GĐ OQ-04)');
    const res = X.previewAllocation(period, override);
    if (!res.sumRooms) throw new Error('Thiếu cơ sở phân bổ: chưa có số phòng của kỳ');
    const prev = S.where('allocationRuns', r => r.period === period);
    if (prev.some(r => r.status === 'closed')) throw new Error('Kỳ đã có phiên phân bổ chốt');
    prev.forEach(r => S.remove('allocationRuns', r.id));
    const run = S.add('allocationRuns', { id: 'al_' + period, code: 'PB-' + period.replace('-', '') + '-v' + (prev.length + 1), period, status: 'draft', denominator: res.denominator, sumRooms: res.sumRooms, basisSource: res.basisSource, overrideReason: res.overrideReason || null,
      lines: res.lines.map(l => ({ lineCode: l.lineCode, fundCode: l.fundCode, label: l.label, fund: l.fund, surchargePerRoom: l.surchargePerRoom, fixedPerBuilding: l.fixedPerBuilding, results: l.results, total: l.total, g1: l.g1 })), savedBy: _.who(), savedAt: F.nowISO() });
    _.audit('save', 'allocation', run.id, `Lưu phân bổ ${run.code}: mẫu số ${res.denominator}`); _.done(); return run;
  };
  X.closeAllocation = (id) => {
    _.need('allocation.manage');
    const r = S.get('allocationRuns', id); _.guardPeriod(r.period, 'chốt phân bổ');
    S.update('allocationRuns', id, { status: 'closed', closedAt: F.nowISO(), closedBy: _.who() });
    _.audit('close', 'allocation', id, 'Chốt phân bổ ' + r.code); _.done();
  };
})(window.TH);
