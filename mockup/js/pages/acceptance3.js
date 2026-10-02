(function (TH) {
  const Q = TH.q, FC = TH.calc.forecast, DP = TH.calc.depreciation;
  TH.pages.acceptance3 = () => {
    const source = TH.data.p3, initial = TH.calc.capital.initial(source.initial), fc = period => FC.compute(source.forecasts.find(f => f.period === period));
    const p9 = fc('2026-09'), p1 = fc('2026-01'), p8 = fc('2026-08'), efficiency = TH.qe.build('2026-08', { source: 'excel', basis: 'business' });
    const near = (a, b, tol = 0.51) => Math.abs(a - b) <= tol;
    const item = Q.asset('as_08_S4'), disposed = Object.assign({}, item, { disposal: { period: '2026-10' } });
    return [
      { ms: '3', name: 'NT-7 · Dự kiến T9 như Excel', ok: p9.benchmark && near(p9.business.rev_total, 7106329529) && near(p9.business.tcp, 6468533333) && near(p9.business.lnr, 637796196), detail: 'DT 7.106.329.529 · TCP 6.468.533.333 · LN 637.796.196 · E4/2 361.350.000' },
      { ms: '3', name: 'NT-8 · Dự kiến T1 / T8', ok: near(p1.primary.tcp, 4827748333) && near(p1.primary.lnr, 705406244) && near(p8.primary.lnr, 723332525), detail: 'T1 KH 640.000 · LN 705.406.244; T8 LN 723.332.525' },
      { ms: '3', name: 'NT-9 · Đầu tư ban đầu G1', ok: near(initial.expense, 269906348) && near(initial.receipt, 104919000) && near(initial.received, 65412652) && near(initial.investment, 38862000), detail: 'Chi 269.906.348 · Thu 104.919.000 · Đã đóng 230.400.000 · Thực nhận 65.412.652; đầu tư tính một lần' },
      { ms: '3', name: 'NT-10 · Hiệu quả T8 như Excel', ok: near(efficiency.totals.TOTAL.profitOnCapital, 0.12987, 0.00001) && near(efficiency.totals.TOTAL.rentMargin, 1.22881, 0.00001), detail: 'KD LNR/GV ≈ 0,12987 · Biên tiền nhà ≈ 1,22881 · G1 lệch OQ-04 7.879đ' },
      { ms: '3', name: 'NT-10b · LN/tài sản chỉ tòa có số dư nền', ok: (efficiency.rows.find(r => r.code === 'G1') || {}).profitOnAssets != null && efficiency.rows.filter(r => r.code !== 'G1' && r.nbv > 0).every(r => r.profitOnAssets == null), detail: 'G1: LNR KD / còn lại 8 khoản đầu tư ban đầu (mua 11/2025, 84% cuối T8); tòa chỉ có thiết bị mua lẻ → chờ số dư UI-37 (GĐ OQ-24)' },
      { ms: '3', name: 'NT-11 · Khấu hao / thanh lý', ok: near(Q.depOfPeriod('2026-08').total, 566080) && near(DP.forPeriod(Q.depItems('2026-08').map(a => Object.assign({}, a, { disposal: null })), '2031-10').total, 283040) && near(DP.ofItem(disposed, '2026-10').amount, 3329920), detail: 'T8 566.080 · tháng 63 283.040 · S4 nguồn 3.440.000 → thanh lý T10 3.329.920; ví dụ 1.400.000 → 1.355.200' },
    ];
  };
})(window.TH);
