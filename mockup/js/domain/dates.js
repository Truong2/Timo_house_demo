/* Domain – kỳ, tháng lẻ, hạn thanh toán, mốc công nợ (đặc tả §3.12a/b). Thuần, không DOM. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const pad = (n) => String(n).padStart(2, '0');
  const D = {};
  D.daysInMonth = (p) => { const [y, m] = p.split('-').map(Number); return new Date(y, m, 0).getDate(); };
  D.prevPeriod = (p) => { const [y, m] = p.split('-').map(Number); return m === 1 ? (y - 1) + '-12' : y + '-' + pad(m - 1); };
  D.nextPeriod = (p) => { const [y, m] = p.split('-').map(Number); return m === 12 ? (y + 1) + '-01' : y + '-' + pad(m + 1); };
  D.periodStart = (p) => p + '-01';
  D.periodEnd = (p) => p + '-' + pad(D.daysInMonth(p));
  D.addDays = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, d + n)); return t.toISOString().slice(0, 10); };
  /* Cộng n tháng, giữ ngày (kẹp về cuối tháng nếu tháng đích ngắn hơn): 2026-01-31 + 1 → 2026-02-28 */
  D.addMonths = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); const t = y * 12 + (m - 1) + n; const p = Math.floor(t / 12) + '-' + pad(t % 12 + 1); return p + '-' + pad(Math.min(d, D.daysInMonth(p))); };
  D.diffDays = (a, b) => Math.round((Date.UTC(...b.split('-').map((v, i) => i === 1 ? v - 1 : +v)) - Date.UTC(...a.split('-').map((v, i) => i === 1 ? v - 1 : +v))) / 86400000);

  /* Tháng lẻ: số ngày tính = số ngày của tháng − ngày vào + 1 (đếm cả ngày vào); mẫu số = số ngày thực của tháng */
  D.proRataDays = (startISO, p, endISO) => {
    const dim = D.daysInMonth(p), ps = D.periodStart(p), pe = D.periodEnd(p);
    const from = !startISO || startISO < ps ? ps : startISO;
    const to = !endISO || endISO > pe ? pe : endISO;
    if (from > pe || to < ps || from > to) return { days: 0, denom: dim };
    return { days: D.diffDays(from, to) + 1, denom: dim };
  };
  D.proRata = (monthly, startISO, p, endISO) => {
    const { days, denom } = D.proRataDays(startISO, p, endISO);
    return { days, denom, factor: days / denom, amount: monthly * days / denom };
  };

  /* Hóa đơn tháng N (trả trước): chốt số ngày 22 tháng N−1, hạn 25 → cuối tháng N−1; công nợ từ ngày 6 tháng N (GĐ OQ-12) */
  D.billingWindow = (p, prm = {}) => {
    const prev = D.prevPeriod(p);
    const cutoffDay = prm.cutoffDay || 22, dueFromDay = prm.dueFromDay || 25, debtAfter = prm.debtAfterDueDays == null ? 5 : prm.debtAfterDueDays;
    const dueTo = D.periodEnd(prev);
    return { cutoff: prev + '-' + pad(cutoffDay), issueDate: prev + '-' + pad(cutoffDay), dueFrom: prev + '-' + pad(dueFromDay), dueTo, debtFrom: D.addDays(dueTo, debtAfter + 1) };
  };
  D.debtStart = (p, prm) => D.billingWindow(p, prm).debtFrom;
  /* Đóng đúng hạn = đủ tiền trước hết ngày 5 tháng N */
  D.isOnTime = (paidFullAt, p, prm) => !!paidFullAt && paidFullAt < D.debtStart(p, prm);
  D.milestoneDate = (p, day) => p + '-' + pad(day);
  C.dates = D;
})(window.TH);
