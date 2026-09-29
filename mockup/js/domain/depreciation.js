/* Domain – khấu hao thiết bị đường thẳng theo tỷ lệ/tháng, cộng dồn đến đủ 100% nguyên giá (GĐ OQ-11). Thuần. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const D = {};
  const mIndex = (p) => { const [y, m] = p.split('-').map(Number); return y * 12 + m - 1; };
  /* items: [{buildingId, purchaseDate, cost, depRate}] → khấu hao của kỳ p (tháng mua là tháng khấu hao thứ nhất) */
  D.forPeriod = (items, p, defRate = 0.016) => {
    const byBuilding = {}; let total = 0; const detail = [];
    items.forEach(it => {
      const k = mIndex(p) - mIndex(it.purchaseDate.slice(0, 7));
      if (k < 0) return;
      const rate = it.depRate || defRate;
      const before = Math.min(it.cost, it.cost * rate * k);
      const amt = Math.max(0, Math.min(it.cost * rate, it.cost - before));
      if (!amt) return;
      byBuilding[it.buildingId] = (byBuilding[it.buildingId] || 0) + amt; total += amt;
      detail.push({ item: it, month: k + 1, amount: amt, remaining: it.cost - before - amt });
    });
    return { total, byBuilding, detail };
  };
  D.monthsToFull = (rate) => Math.ceil(1 / rate);
  C.depreciation = D;
})(window.TH);
