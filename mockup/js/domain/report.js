/* Domain – Báo cáo tổng (LN dòng tiền) / Báo cáo kinh doanh theo mẫu SRC-04 (dòng 3–61). Thuần.
   Đầu vào: dòng gốc theo tòa {buildingId: {code: value}} → gộp TỔNG / NHÀ T / S / G → tính dòng dẫn xuất và tỷ lệ theo công thức sheet. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const R = {};
  R.SVC = ['rev_el', 'rev_wa', 'rev_clean', 'rev_net', 'rev_ev', 'rev_elev', 'rev_wash'];
  R.GV = ['cost_rent', 'cost_equip', 'cost_el', 'cost_wa', 'cost_net', 'cost_garbage', 'cost_env', 'cost_elev'];
  R.SAL = ['sal_mgr', 'sal_gm', 'sal_head', 'sal_lead', 'sal_source', 'sal_sales', 'sal_clean', 'sal_acct', 'sal_repair', 'sal_guard', 'office'];
  R.CPBH = [...R.SAL, 'marketing', 'repair', 'other'];
  R.BASE = ['rev_total', 'dep_new', 'dep_forfeit', 'refund', 'cnt_breach', 'cnt_new', 'cnt_vacant', 'rev_rent', ...R.SVC, ...R.GV, ...R.CPBH];
  const sum = (v, keys) => keys.reduce((s, k) => s + (Number(v[k]) || 0), 0);
  const div = (a, b) => b ? a / b : null;
  /* Dòng dẫn xuất theo công thức sheet BÁO CÁO TỔNG THÁNG 8 */
  R.derive = (base) => {
    const v = Object.assign({}, base);
    R.BASE.forEach(k => { v[k] = Number(v[k]) || 0; });
    v.rev_svc = sum(v, R.SVC);
    v.gv = sum(v, R.GV);
    v.cpbh = sum(v, R.CPBH);
    v.tcp = v.gv + v.cpbh;
    v.lng = v.rev_total - v.gv;
    v.lnr = v.rev_total - v.tcp;
    v.gv2 = v.gv;
    v.r_lnr_dt = div(v.lnr, v.rev_total); v.r_lng_dt = div(v.lng, v.rev_total); v.r_lnr_gv = div(v.lnr, v.gv2); v.r_lnr_lng = div(v.lnr, v.lng);
    v.r_cp_lng = div(v.tcp, v.lng); v.r_gv_dt = div(v.gv2, v.rev_total); v.r_cpbh_dt = div(v.cpbh, v.rev_total); v.r_tcp_dt = div(v.tcp, v.rev_total);
    v.r_luong_cpbh = div(sum(v, R.SAL.slice(0, 10)), v.cpbh); v.r_hh_cpbh = div(v.marketing, v.cpbh); v.r_cpk_cpbh = div(v.other, v.cpbh);
    v.r_dv_nhap = div(v.rev_svc, sum(v, ['cost_el', 'cost_wa', 'cost_net', 'cost_garbage', 'cost_env', 'cost_elev']) + v.sal_clean);
    v.r_nha_thue = div(v.rev_rent, v.cost_rent); v.r_lnr_dt2 = v.r_lnr_dt;
    return v;
  };
  /* Gộp theo nhóm nhà T/S/G */
  R.aggregate = (byBuilding, groupOf) => {
    const cols = { TOTAL: {}, T: {}, S: {}, G: {} };
    Object.entries(byBuilding).forEach(([b, v]) => {
      const g = groupOf(b);
      R.BASE.forEach(k => { const x = Number(v[k]) || 0; cols.TOTAL[k] = (cols.TOTAL[k] || 0) + x; if (cols[g]) cols[g][k] = (cols[g][k] || 0) + x; });
    });
    Object.keys(cols).forEach(k => { cols[k] = R.derive(cols[k]); });
    return cols;
  };
  /* Báo cáo kinh doanh (GĐ OQ-10): DT = DT tổng − cọc mới (+ hoàn cọc nếu bật); thiết bị = khấu hao kỳ (nếu bật) thay nguyên giá.
     mode 'excel' dùng công thức doanh thu của sheet; depreciation truyền vào chỉ gồm chính sách đã xác nhận. */
  R.business = (base, { depreciation = 0, addBackRefund = true, useDepreciation = true, mode = 'gd' } = {}) => {
    const v = Object.assign({}, base);
    if (mode === 'web') { v.rev_total = (base.rev_total || 0) - (base.dep_new || 0) + (base.refund || 0); v.dep_new = 0; v.refund = 0; v.cost_equip = depreciation; return R.derive(v); }
    if (mode === 'excel') { v.rev_total = (base.rev_total || 0) - (base.dep_new || 0); v.cost_equip = useDepreciation ? depreciation : 0; }
    else { v.rev_total = (base.rev_total || 0) - (base.dep_new || 0) + (addBackRefund ? (base.refund || 0) : 0); v.cost_equip = useDepreciation ? depreciation : 0; }
    return R.derive(v);
  };
  /* Cầu nối Báo cáo tổng → Báo cáo kinh doanh */
  R.bridge = (total, biz) => [
    { label: 'LNR Báo cáo tổng (dòng tiền)', value: total.lnr },
    { label: '− Cọc phòng mới (không phải doanh thu kinh doanh)', value: -total.dep_new },
    { label: '+ Hoàn cọc loại khỏi doanh thu KD', value: biz.rev_total - (total.rev_total - total.dep_new) },
    { label: '+ Mua sắm thiết bị (nguyên giá, bỏ khỏi chi phí KD)', value: total.cost_equip },
    { label: '− Khấu hao + thanh lý thiết bị của kỳ (chỉ chính sách đã xác nhận)', value: -biz.cost_equip },
    { label: '= LNR Báo cáo kinh doanh', value: biz.lnr },
  ];
  C.report = R;
})(window.TH);
