/* Extend Phase 3 demo with non-retroactive initial assets and immutable source forecasts. */
(function (TH) {
  const prev = TH.data.seedExtras;
  TH.data.seedExtras = st => {
    if (prev) prev(st);
    const src = TH.data.p3, clone = x => JSON.parse(JSON.stringify(x));
    // GĐ-P3-03: SRC-07 ĐẦU TƯ BAN ĐẦU chỉ ghi khoảng 1/10–30/11/2025, không có ngày từng khoản → lấy tháng cuối khoảng
    const INITIAL_START = '2025-11-01';
    st.forecasts = clone(src.forecasts); st.capitalInitial = [Object.assign(clone(src.initial), { coveredTo: '2026-01' })]; st.shareTxns = []; st.inventorySessions = []; // coveredTo: T1 do vốn ban đầu chi trả (THU CHI BAN ĐẦU)
    const oc = st.ownerContracts.find(o => o.id === 'oc_G1'); if (oc) oc.deposit = 48000000;
    src.initial.assets.forEach((a, i) => st.assets.push({ id: 'as_' + a.id, code: 'TS-G1-' + String(901 + i), name: a.name, type: a.type, ownership: 'company', buildingId: 'b_G1', roomId: null, position: 'Đầu tư ban đầu G1', qty: a.name.startsWith('2 ') ? 2 : 1, condition: 'good', receivedDate: INITIAL_START, cost: a.cost, depStart: INITIAL_START, depMonths: 63, depreciationPolicyStatus: 'legacy_assumption', depreciationSource: 'Giả định lịch sử 63 tháng – OQ-11 chưa xác nhận', openingPeriod: '2026-10', warrantyTo: null, source: 'initial', expenseId: null, capitalRef: a.dupOf, ownerContractId: null, docs: [{ name: 'SRC-07 ' + a.source_ref }], status: 'active', disposal: null, history: [{ kind: 'create', date: INITIAL_START, by: 'Dữ liệu nguồn', reason: 'GĐ-P3-03: mua 10–11/2025, ghi sổ web từ 10/2026 – phần trước coi như đã khấu hao ngoài web; trùng ' + a.dupOf + ' tính một lần' }] }));
    // G1 rent is monthly, synchronized with UI-05; T1 was funded by initial capital.
    if (oc) {
      oc.payCycleMonths = 1;
      // Reuse UI-05 rows, IDs and payment balances. Investor contributions and owner
      // payments are independent cash flows: a paid rent installment can still have unpaid investors.
      TH.calc.capital.schedule(st.ownerPayments.filter(p => p.buildingId === 'b_G1' && p.from >= '2026-02-01' && p.from <= '2026-09-01'), (bid, day) => st.shareRatios.filter(r => r.buildingId === bid && r.from <= day && (!r.to || r.to >= day)), st.shareholders).forEach(l => {
        const m = Number(l.from.slice(5, 7)); let amount = l.due; if (m === 9 && l.shareholderId === 'sh_CD-03') amount /= 2; if (m === 9 && l.shareholderId === 'sh_CD-07') amount = 0;
        if (amount) st.shareTxns.push({ id: 'stx_' + l.id, code: 'GV-' + l.id, kind: 'contribute', ref: 'ownerPayment', ownerPaymentId: l.ownerPaymentId, shareholderId: l.shareholderId, buildingId: l.buildingId, amount, date: l.dueDate, method: 'bank', status: 'active', docId: null, by: 'Dữ liệu demo' });
      });
    }
    ['2026-08', '2026-09'].forEach(period => {
      const assets = st.assets.filter(a => a.buildingId === 'b_G1' && a.receivedDate <= period + '-31' && (!a.openingPeriod || a.openingPeriod <= period));
      st.inventorySessions.push({ id: 'ivs_' + period + '_b_G1', period, buildingId: 'b_G1', status: period === '2026-08' ? 'approved' : 'entered', virtual: false, openedAt: period + '-01',
        lines: assets.map((a, i) => ({ assetId: a.id, bookQty: a.qty, bookCondition: a.condition, actualQty: period === '2026-09' && i === 0 ? a.qty - 1 : a.qty, condition: period === '2026-09' && i === 1 ? 'broken' : a.condition, note: i < 2 && period === '2026-09' ? 'Cần đối chiếu thực tế' : '', docIds: [], checkedBy: 'Dữ liệu demo' })), proposals: [], approvals: period === '2026-08' ? { admin: { userId: 'demo_admin', by: 'Admin demo' }, ketoan: { userId: 'demo_ketoan', by: 'Kế toán demo' } } : {} });
    });
    st.forecasts.forEach(fc => {
      fc.depRate = 0.016;
      fc.depWeb = TH.calc.depreciation.forPeriod(st.assets.filter(a => a.ownership === 'company' && a.cost > 0 && a.status !== 'void' && (!a.openingPeriod || a.openingPeriod <= fc.period)), fc.period, 0.016).total;
      Object.assign(fc, { status: 'confirmed', policyStatus: 'confirmed', sourceRef: 'SRC-14 – DỰ KIẾN LỢI NHUẬN', approvedBy: 'Dữ liệu nguồn Excel', approvedAt: fc.draftDate + 'T17:00:00' });
    });
  };
})(window.TH);
