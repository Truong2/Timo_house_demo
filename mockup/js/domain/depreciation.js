/* Domain – khấu hao thiết bị đường thẳng theo SỐ THÁNG của từng tài sản, cộng dồn đến đủ 100% nguyên giá (GĐ OQ-11, Phase 3). Thuần.
   n tháng: tháng 1…n−1 mỗi tháng 2/(2n−1) nguyên giá, tháng cuối nửa mức → n = 63 ra đúng 1,6%/tháng, tháng 63 = 0,8% (62 × 1,6% + 0,8%).
   Thanh lý: tháng thanh lý ghi một lần toàn bộ giá trị còn lại, các tháng sau = 0. Số dư đầu kỳ (import / đầu tư ban đầu): openingPeriod –
   chỉ ghi khấu hao từ kỳ đó; phần trước đó coi như đã khấu hao ngoài web (giá trị còn lại vẫn tính từ ngày bắt đầu). */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const D = {};
  const mIndex = (p) => { const [y, m] = p.split('-').map(Number); return y * 12 + m - 1; };
  const pOf = (i) => { const y = Math.floor(i / 12), m = i % 12 + 1; return y + '-' + String(m).padStart(2, '0'); };
  D.rateOfMonths = (n) => 2 / (2 * n - 1);
  D.monthsOfRate = (rate) => Math.ceil(1 / rate); // 1,6% → 63
  /* tỷ lệ/tháng của tài sản: số tháng KH (Phase 3) ưu tiên, sau đó depRate cũ, cuối cùng tỷ lệ mặc định */
  D.rateOf = (it, defRate = 0.016) => it.depMonths ? D.rateOfMonths(it.depMonths) : (it.depRate || defRate);
  const startOf = (it) => (it.depStart || it.purchaseDate).slice(0, 7);
  const disposedOf = (it) => it.disposal && it.disposal.period || null;
  /* Khấu hao của một tài sản trong kỳ p: {amount, kind:'dep'|'disposal', month, before, remaining} hoặc null */
  D.ofItem = (it, p, defRate = 0.016) => {
    const k = mIndex(p) - mIndex(startOf(it));
    if (k < 0) return null;
    const dp = disposedOf(it); if (dp && p > dp) return null;
    if (it.openingPeriod && p < it.openingPeriod) return null;
    const rate = D.rateOf(it, defRate);
    const before = Math.min(it.cost, it.cost * rate * k);
    if (dp && p === dp) { const amt = Math.max(0, it.cost - before); return { amount: amt, kind: 'disposal', month: k + 1, before, remaining: 0 }; }
    const amt = Math.max(0, Math.min(it.cost * rate, it.cost - before));
    if (!amt) return null;
    return { amount: amt, kind: 'dep', month: k + 1, before, remaining: it.cost - before - amt };
  };
  /* items: [{buildingId, depStart|purchaseDate, cost, depMonths|depRate, openingPeriod?, disposal?}] → khấu hao của kỳ p (tháng bắt đầu = tháng khấu hao thứ nhất) */
  D.forPeriod = (items, p, defRate = 0.016) => {
    const byBuilding = {}; let total = 0; const detail = [];
    items.forEach(it => {
      const r = D.ofItem(it, p, defRate); if (!r || !r.amount) return;
      byBuilding[it.buildingId] = (byBuilding[it.buildingId] || 0) + r.amount; total += r.amount;
      detail.push({ item: it, month: r.month, amount: r.amount, remaining: r.remaining, kind: r.kind });
    });
    return { total, byBuilding, detail };
  };
  /* Giá trị còn lại cuối kỳ p (gồm phần đã khấu hao trước openingPeriod); thanh lý → 0 từ kỳ thanh lý */
  D.nbv = (it, p, defRate = 0.016) => {
    if (!it.cost) return 0;
    const k = mIndex(p) - mIndex(startOf(it)); if (k < 0) return it.cost;
    const dp = disposedOf(it); if (dp && p >= dp) return 0;
    return Math.max(0, it.cost - Math.min(it.cost, it.cost * D.rateOf(it, defRate) * (k + 1)));
  };
  /* Lịch khấu hao từng tháng đến toPeriod: [{period, amount, kind, accumulated, remaining, booked}] – booked = có ghi vào báo cáo web (≥ openingPeriod) */
  D.schedule = (it, toPeriod, defRate = 0.016) => {
    const out = []; if (!it.cost) return out; let acc = 0;
    for (let i = mIndex(startOf(it)); i <= mIndex(toPeriod); i++) {
      const p = pOf(i); const k = i - mIndex(startOf(it)); const rate = D.rateOf(it, defRate);
      const dp = disposedOf(it); if (dp && p > dp) break;
      const before = Math.min(it.cost, it.cost * rate * k);
      const amt = dp && p === dp ? Math.max(0, it.cost - before) : Math.max(0, Math.min(it.cost * rate, it.cost - before));
      if (!amt) break;
      acc = before + amt;
      out.push({ period: p, amount: amt, kind: dp && p === dp ? 'disposal' : 'dep', accumulated: acc, remaining: Math.max(0, it.cost - acc), booked: !it.openingPeriod || p >= it.openingPeriod });
    }
    return out;
  };
  D.monthsToFull = (rate) => Math.ceil(1 / rate);
  C.depreciation = D;
})(window.TH);
