/* Domain – chia lãi cổ đông theo tòa (UI-31, UI-32; đặc tả §3.9 dòng 516–526, SRC-07, GĐ OQ-08). Thuần: không DOM/store.
   G = tỷ lệ %; H = G × tiền thuê nhà 1 tháng / 100 ("Vốn"); I = G × LN gộp / 100; J = G × LN ròng / 100; M = H + J ("Tổng nhận" – số phải chia, không phải khoản chi).
   Làm tròn từng dòng đến đồng; mặc định hiển thị chênh thành dòng riêng, không tự dồn vào CHUNG khi OQ-08 chưa xác nhận. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const SH = {};
  SH.sumPct = (rows) => Math.round(rows.reduce((t, r) => t + (Number(r.pct) || 0), 0) * 1e6) / 1e6;
  SH.valid = (rows) => { const s = SH.sumPct(rows); return { ok: Math.abs(s - 100) < 1e-6, sum: s }; };
  /* rows: [{id, pct, common}], base: {rent, lng, lnr, gv, tcp}; round=true → làm tròn đồng, dồn chênh vào dòng common (không có thì dòng tỷ lệ lớn nhất) */
  SH.split = (rows, base, { round = true, roundingMode = 'explicitDelta' } = {}) => {
    const pick = rows.find(r => r.common) || rows.slice().sort((a, b) => b.pct - a.pct)[0];
    const col = (total) => {
      const raw = rows.map(r => (Number(r.pct) || 0) * (total || 0) / 100);
      if (!round) return { vals: raw, diff: 0 };
      const vals = raw.map(v => Math.round(v)); const diff = Math.round((total || 0) - vals.reduce((t, v) => t + v, 0));
      const i = rows.indexOf(pick); if (roundingMode === 'commonFund' && i >= 0) vals[i] += diff;
      return { vals, diff };
    };
    const H = col(base.rent), I = col(base.lng), J = col(base.lnr);
    const out = rows.map((r, i) => ({ id: r.id, pct: r.pct, common: !!r.common, H: H.vals[i], I: I.vals[i], J: J.vals[i], M: H.vals[i] + J.vals[i] }));
    const sum = (k) => out.reduce((t, r) => t + r[k], 0);
    return { rows: out, totals: { pct: SH.sumPct(rows), H: sum('H'), I: sum('I'), J: sum('J'), M: sum('M') }, rounding: { H: H.diff, I: I.diff, J: J.diff, to: roundingMode === 'commonFund' && pick ? pick.id : null }, roundingMode,
      K: base.gv ? base.lnr / base.gv * 100 : null, L: base.lng ? base.tcp / base.lng : null };
  };
  C.share = SH;
})(window.TH);
