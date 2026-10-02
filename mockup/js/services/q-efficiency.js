(function (TH) {
  const S = TH.store, Q = TH.q, EF = TH.calc.efficiency, R = TH.calc.report;
  const QE = {};
  QE.build = (period, { basis = 'business', source = 'web', group, area, manager } = {}) => {
    TH.auth.need('efficiency.view');
    if (!['business', 'total'].includes(basis) || !['web', 'excel'].includes(source)) throw new Error('Cơ sở báo cáo không hợp lệ');
    if (TH.auth.role() === 'codong') source = 'web';
    const pe = TH.calc.dates.periodEnd(period), rep = TH.qr.get(period, basis, source === 'excel' ? 'excel' : 'gd'), mm = Q.managerMap(pe);
    // LN/tài sản luôn dùng LNR kinh doanh (GĐ OQ-24), kể cả khi báo cáo cơ sở là Báo cáo tổng
    const biz = basis === 'business' ? rep : TH.qr.get(period, 'business', source === 'excel' ? 'excel' : 'gd');
    const headOf = id => { const seen = new Set(); let e = Q.emp(id); while (e && !seen.has(e.id)) { if (e.title === 'TPVH') return e; seen.add(e.id); e = Q.leaderOf(e.id, pe); } return null; };
    const bench = {};
    if (source === 'excel') { if (!(S.get('periods', period) || {}).source || !rep.parallel) throw new Error('Kỳ này chưa có số Excel đối chiếu'); S.all('benchLines').filter(l => l.period === period).forEach(l => { (bench[l.buildingId] = bench[l.buildingId] || {})[l.code] = l.value; }); }
    const rows = Q.scopedBuildings().filter(b => (!group || b.group === group) && (!area || b.areaId === area) && (!manager || (headOf((mm[b.id] || {}).id) || {}).id === manager)).map(b => {
      let v = rep.byBuilding[b.id], vb = biz.byBuilding[b.id];
      if (source === 'excel' && bench[b.id]) { vb = R.business(bench[b.id], { mode: 'excel' }); v = basis === 'business' ? vb : R.derive(bench[b.id]); }
      if (!v) return null;
      return Object.assign({ buildingId: b.id, code: b.code, group: b.group, areaId: b.areaId, managerId: (headOf((mm[b.id] || {}).id) || {}).id || null },
        EF.row(v, Q.assetNbv(b.id, period), { lnrBiz: (vb || v).lnr, baseline: Q.assetBaseline(b.id, period) }));
    }).filter(Boolean);
    const aggregate = rs => {
      const v = rs.reduce((v, r) => { ['lnr', 'gv', 'rev_rent', 'cost_rent', 'nbv'].forEach(k => { v[k] += r[k] || 0; }); return v; }, { lnr: 0, gv: 0, rev_rent: 0, cost_rent: 0, nbv: 0 });
      const cov = rs.filter(r => r.profitOnAssets != null), covNbv = cov.reduce((s, r) => s + r.nbv, 0);
      return Object.assign(v, { profitOnCapital: v.gv ? v.lnr / v.gv : null, rentMargin: v.cost_rent ? v.rev_rent / v.cost_rent : null, profitOnAssets: covNbv ? cov.reduce((s, r) => s + r.lnrBiz, 0) / covNbv : null, covered: cov.length, total: rs.length });
    };
    const totals = { TOTAL: aggregate(rows), ...Object.fromEntries(['T', 'S', 'G'].map(g => [g, aggregate(rows.filter(r => r.group === g))])) };
    // Unfiltered Excel totals come from the source total cells, which have documented per-building reconciliation differences.
    if (source === 'excel' && !TH.auth.buildingScope() && !group && !area && !manager && rep.excel) ['TOTAL', 'T', 'S', 'G'].forEach(g => { totals[g].profitOnCapital = rep.excel.r_lnr_gv[g]; totals[g].rentMargin = rep.excel.r_nha_thue[g]; });
    return { period, basis, source, rows, totals };
  };
  TH.qe = QE;
})(window.TH);
