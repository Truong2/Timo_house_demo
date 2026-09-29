/* Domain – phiếu tính hoàn cọc (đặc tả UI-18): BC = Σ khấu trừ, BD = I − BC. Thuần. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const R = {};
  R.KINDS = [
    { key: 'electric', label: 'Điện (số)', meter: true },
    { key: 'water', label: 'Nước', meter: true },
    { key: 'cleaningSvc', label: 'DV vệ sinh' },
    { key: 'internet', label: 'Internet' },
    { key: 'elevator', label: 'Thang máy' },
    { key: 'ev', label: 'Xe điện' },
    { key: 'washer', label: 'Máy giặt' },
    { key: 'depreciation', label: 'Khấu hao' },
    { key: 'repair', label: 'Sửa chữa' },
    { key: 'cleaning', label: 'Dọn vệ sinh' },
    { key: 'painting', label: 'Sơn phòng' },
    { key: 'other', label: 'DV khác' },
  ];
  R.kindLabel = (k) => (R.KINDS.find(x => x.key === k) || { label: k }).label;
  R.calc = ({ deposit, deductions }) => {
    const bc = (deductions || []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
    const bd = (Number(deposit) || 0) - bc;
    return { bc, bd, payable: Math.max(0, bd), excess: Math.max(0, -bd) };
  };
  /* Khấu trừ mặc định: tiền điện/nước theo chỉ số chốt + khấu hao cố định/phòng (CH-17, tham số) */
  R.defaultDeductions = ({ elPrev, elCurr, elUnit, waPrev, waCurr, waUnit, depreciationPerRoom = 200000 }) => {
    const out = [];
    if (elCurr != null && elPrev != null) { const q = Math.max(0, elCurr - elPrev); out.push({ kind: 'electric', prev: elPrev, curr: elCurr, qty: q, unit: elUnit, amount: q * elUnit }); }
    if (waCurr != null && waPrev != null && waCurr > waPrev) { const q = waCurr - waPrev; out.push({ kind: 'water', prev: waPrev, curr: waCurr, qty: q, unit: waUnit, amount: q * waUnit }); }
    out.push({ kind: 'depreciation', qty: 1, unit: depreciationPerRoom, amount: depreciationPerRoom });
    return out;
  };
  /* Tiền ngày ở thêm: hiện dòng riêng, mặc định KHÔNG trừ vào cọc (GĐ OQ-16) */
  R.extraDaysRent = (monthly, days, denom) => days ? monthly / denom * days : 0;
  C.refund = R;
})(window.TH);
