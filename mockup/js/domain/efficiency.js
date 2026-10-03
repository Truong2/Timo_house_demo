/* UI-41 (GĐ OQ-24): LN/vốn = LNR/GV của báo cáo đang chọn; biên tiền nhà = DT tiền phòng / tiền thuê 1 tháng;
   LN/tài sản = LNR kinh doanh / giá trị còn lại tài sản công ty – chỉ khi tòa có số dư tài sản nền, còn lại "chờ dữ liệu". Thuần. */
(function (TH) {
  TH.calc.efficiency = {
    row: (v, nbv, { lnrBiz = v.lnr, baseline = true } = {}) => ({ profitOnCapital: v.r_lnr_gv, rentMargin: v.r_nha_thue, profitOnAssets: baseline && nbv > 0 ? lnrBiz / nbv : null,
      assetsPending: !baseline ? 'Chờ chính sách tài sản' : nbv > 0 ? null : 'Chưa có giá trị tài sản công ty', baseline, nbv, lnr: v.lnr, lnrBiz, gv: v.gv, rev_rent: v.rev_rent, cost_rent: v.cost_rent })
  };
})(window.TH);
