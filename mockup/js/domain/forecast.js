/* SRC-14: canonical 24 cost rows, two results from one immutable set of inputs. Pure. */
(function (TH) {
  const FC = {}, R = TH.calc.report;
  const defs = [['cost_rent', 'Tiền thuê nhà'], ['refund', 'Hoàn cọc'], ['cost_el', 'Điện'], ['cost_wa', 'Nước'], ['cost_net', 'Mạng'], ['cost_garbage', 'Phí thu rác'], ['cost_env', 'Phí môi trường'], ['cost_elev', 'Phí bảo trì thang máy'], ['sal_mgr', 'Lương quản lý'], ['sal_gm', 'Lương quản lý tổng'], ['sal_head', 'Lương TPVH 1'], ['sal_head2', 'Lương TPVH 2'], ['sal_lead', 'Lương trưởng nhóm / phó phòng'], ['sal_source', 'Lương nhân viên nguồn / đào tạo'], ['sal_sales', 'Lương NV PDKD'], ['sal_clean', 'Lương vệ sinh'], ['sal_acct', 'Lương kế toán'], ['sal_repair', 'Lương sửa chữa'], ['sal_guard', 'Lương bảo vệ'], ['office', 'Thuê và dịch vụ VP'], ['marketing', 'Phí marketing'], ['repair', 'Sửa chữa'], ['other', 'Các chi phí khác'], ['cost_equip', 'Mua sắm thiết bị / khấu hao']];
  FC.LINES = defs.map(([key, label]) => ({ key, label, reportCode: key === 'sal_head2' ? 'sal_head' : key }));
  FC.compute = (fc, { mode = 'excel', depRate = 0.016, depWeb = 0 } = {}) => {
    const i = fc.inputs || {}, values = {};
    (fc.lines || []).forEach(l => { values[l.key] = (values[l.key] || 0) + Number(l.value || 0); });
    const marketing = values.marketing == null ? Number(i.E4 || 0) / 2 : values.marketing;
    const dep = mode === 'web' ? depWeb : Number(i.J3 || 0) * depRate;
    const base = {}, adjustment = (fc.adjustments || []).reduce((s, a) => s + Number(a.amount || 0), 0);
    FC.LINES.forEach(l => { if (!['refund', 'cost_equip', 'marketing'].includes(l.key)) base[l.reportCode] = (base[l.reportCode] || 0) + Number(values[l.key] || 0); });
    base.marketing = marketing;
    const income = ['J4', 'J5', 'J6', 'J7'].reduce((s, k) => s + Number(i[k] || 0), 0) + adjustment;
    const business = R.derive(Object.assign({}, base, { rev_total: income - Number(i.E4 || 0), cost_equip: dep }));
    // Legacy cash sheets used depreciation instead of full equipment cash outlay.
    const legacy = mode === 'excel' && fc.form === 'cash';
    const total = R.derive(Object.assign({}, base, { rev_total: income, cost_equip: legacy ? dep : Number(i.J3 || 0) }));
    total.refundOut = Number(i.G4 || 0); total.tcp += total.refundOut; total.lnr -= total.refundOut;
    total.r_lnr_dt = total.rev_total ? total.lnr / total.rev_total : null; total.r_lnr_gv = total.gv ? total.lnr / total.gv : null;
    total.r_lnr_dt2 = total.r_lnr_dt; total.r_tcp_dt = total.rev_total ? total.tcp / total.rev_total : null; total.r_lnr_lng = total.lng ? total.lnr / total.lng : null; total.r_cp_lng = total.lng ? total.tcp / total.lng : null;
    const primary = fc.form === 'cash' ? total : business;
    const benchmark = fc.excelCheck && mode === 'excel' ? Object.keys(fc.excelCheck).every(k => Math.abs((primary[k] || 0) - fc.excelCheck[k]) < (k.startsWith('r_') ? 1e-8 : 0.51)) : null;
    return { total, business, primary, dep, marketing, adjustment, benchmark, legacy, ratios: { total: FC.ratios(total, total.refundOut), business: FC.ratios(business, 0) } };
  };
  /* Chỉ số phụ theo SRC-14 sheet "Tháng 8  " (8/9/2025) E8:E15, DT = E3:
     tiền nhà/DT = G3/E3; GV/DT = (G3 + G5:G10)/E3 (mốc 0,7); DV/DT = G5:G10/E3 (mốc 10–15%); LƯƠNG/DT = G11:G21/E3 (11 dòng lương + thuê VP);
     CPPS/DT = G22:G25/E3 (marketing, sửa chữa, khác, thiết bị); HC/DT = G4/E3 (chỉ dòng tiền); TCP/DT = E8 + E10:E12 + E14; LN/DT = 100% − TCP/DT */
  const SVC_COST = ['cost_el', 'cost_wa', 'cost_net', 'cost_garbage', 'cost_env', 'cost_elev'];
  FC.ratios = (v, refund = 0) => {
    const dt = v.rev_total, d = n => dt ? n / dt : null, sum = keys => keys.reduce((s, k) => s + (Number(v[k]) || 0), 0);
    const parts = { rent: d(sum(['cost_rent'])), dv: d(sum(SVC_COST)), luong: d(sum(R.SAL)), cpps: d(sum(['marketing', 'repair', 'other', 'cost_equip'])), hc: d(refund) };
    const tcp = dt ? parts.rent + parts.dv + parts.luong + parts.cpps + parts.hc : null;
    return [
      { key: 'rent', label: 'Tiền nhà / DT', value: parts.rent },
      { key: 'gv', label: 'GV / DT', value: d(sum(['cost_rent', ...SVC_COST])), ref: 'mốc 0,7' },
      { key: 'dv', label: 'DV / DT', value: parts.dv, ref: 'mốc 10–15%' },
      { key: 'luong', label: 'Lương / DT', value: parts.luong },
      { key: 'cpps', label: 'CPPS / DT', value: parts.cpps },
      { key: 'hc', label: 'HC / DT', value: parts.hc, ref: 'chỉ dòng tiền' },
      { key: 'tcp', label: 'TCP / DT', value: tcp },
      { key: 'ln', label: 'LN / DT', value: tcp == null ? null : 1 - tcp }];
  };
  FC.suggest = (previous, newRent = 0) => FC.LINES.map(l => ({ key: l.key, value: Number(previous[l.reportCode] || 0) + (l.key === 'cost_rent' ? newRent : 0), suggested: Number(previous[l.reportCode] || 0) + (l.key === 'cost_rent' ? newRent : 0) }));
  FC.compare = (expected, actual) => ['rev_total', 'gv', 'tcp', 'lnr', 'r_lnr_dt', 'r_lnr_gv'].map(key => ({ key, forecast: expected[key], actual: actual[key], diff: actual[key] == null || expected[key] == null ? null : actual[key] - expected[key] }));
  TH.calc.forecast = FC;
})(window.TH);
