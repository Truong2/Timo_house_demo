/* Domain – hoa hồng sale (UI-22, đặc tả §3.5 dòng 301–313, SRC-09, CH-19/CH-20, GĐ OQ-13). Thuần: không DOM/store.
   Tỷ lệ tự động chỉ là GỢI Ý theo bảng chính sách có ngày hiệu lực (công thức phụ tháng 8 của khách sai 29/42 dòng → không dùng làm luật);
   kế toán duyệt tỷ lệ H, khác gợi ý phải có lý do. Thành tiền I = F × H − khoản trừ (hỗ trợ khách…). */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const r2 = (x) => Math.round(x * 100) / 100;
  const CM = {};
  /* Bảng chính sách mặc định (SRC-09): cơ bản 50% × 1 tháng giá chốt từ 4/2025 (trước đó 35%); đối tác riêng (MOITHUE 65%);
     HĐ dưới 6 tháng = cơ bản / 6 × số tháng; khách trùng chia đều 2 người 25%, 3 người 16,67%; bỏ cọc tính trên cọc − tiền ngày đã ở. */
  CM.DEFAULT_POLICY = { base: 0.5, partners: { MOITHUE: 0.65 }, fullTermMonths: 6, share: { 2: 0.25, 3: 0.1667 }, forfeitRate: 0.5 };
  CM.policyAt = (versions, date) => {
    const v = (versions || []).filter(x => !x.from || x.from <= date).sort((a, b) => String(b.from).localeCompare(String(a.from)))[0];
    return Object.assign({}, CM.DEFAULT_POLICY, v || {});
  };
  /* Cơ sở tính khi khách bỏ cọc: cọc − giá thuê / số ngày tháng × số ngày đã tính tiền (vd 1.000.000 − 4.100.000/31×6) */
  CM.forfeitBase = ({ deposit, rent, days = 0, dim = 30 }) => r2(Math.max(0, (Number(deposit) || 0) - (Number(rent) || 0) / (dim || 30) * (Number(days) || 0)));
  /* Gợi ý tỷ lệ H: { rate, reasons[] }. input: { term (số tháng | 'forfeit'), partner, share (số người trùng) } */
  CM.suggest = ({ term, partner, share = 1 }, policy) => {
    const P = Object.assign({}, CM.DEFAULT_POLICY, policy || {});
    const reasons = [];
    const key = String(partner || '').trim().toUpperCase();
    let rate = P.base; reasons.push('Cơ bản ' + Math.round(P.base * 100) + '%');
    // Khách trùng: bảng chia (SRC-09: 2 người 25%, 3 người 16,67% khi cơ bản 50%) co giãn theo mức cơ bản của chính sách; từ 4 người chia đều cơ bản / số người
    const shareRate = share >= 2 ? (P.share && P.share[share] != null ? P.share[share] * P.base / CM.DEFAULT_POLICY.base : P.base / share) : null;
    if (shareRate != null) { rate = shareRate; reasons.push(`Khách trùng ${share} người → ${(shareRate * 100).toFixed(2).replace(/\.?0+$/, '')}%`); }
    else if (key && P.partners[key] != null) { rate = P.partners[key]; reasons.push(`Đối tác ${key} ${Math.round(rate * 100)}%`); }
    if (term === 'forfeit') { rate = shareRate != null ? rate : P.forfeitRate; reasons.push('Bỏ cọc: tính trên cọc − tiền ngày đã ở'); }
    else if (Number(term) > 0 && Number(term) < P.fullTermMonths) { rate = rate / P.fullTermMonths * Number(term); reasons.push(`HĐ ${term} tháng < ${P.fullTermMonths} → × ${term}/${P.fullTermMonths}`); }
    return { rate: Math.round(rate * 1e6) / 1e6, reasons };
  };
  CM.amount = (F, H, deduction = 0) => r2((Number(F) || 0) * (Number(H) || 0) - (Number(deduction) || 0));
  CM.sameRate = (a, b) => Math.abs((Number(a) || 0) - (Number(b) || 0)) < 0.00005;
  /* Điều kiện chi (CH-19): đã thu đủ 1 cọc + 1 tháng tiền nhà và đã ký HĐ; bỏ cọc: cọc đã chuyển doanh thu */
  CM.eligible = ({ forfeited = false, forfeitAmount = 0, depositHeld = 0, depositDue = 0, firstMonthPaid = false, hasContract = false }) => {
    if (forfeited) return forfeitAmount > 0 ? { ok: true, missing: [] } : { ok: false, missing: ['Cọc bỏ chưa ghi nhận doanh thu'] };
    const missing = [];
    if (!(depositDue > 0) || depositHeld + 0.5 < depositDue) missing.push('Chưa thu đủ cọc');
    if (!firstMonthPaid) missing.push('Chưa thu đủ tháng đầu');
    if (!hasContract) missing.push('Chưa có file HĐ đã ký');
    return { ok: !missing.length, missing };
  };
  /* Kỳ ghi nhận chi phí hoa hồng = tháng đủ điều kiện chi (GĐ OQ-13), dòng 40 "Phí marketing" */
  CM.recognitionPeriod = (eligibleDate) => String(eligibleDate || '').slice(0, 7);
  /* Doanh số sale (GĐ OQ-25): Σ giá chốt theo ngày chốt, deal nhiều sale chia đều; deal hủy / bỏ cọc tách cột riêng */
  CM.salesVolume = (deals) => {
    const m = {};
    deals.forEach(d => { const n = (d.saleIds || []).length || 1; (d.saleIds || []).forEach(id => { const x = m[id] = m[id] || { count: 0, volume: 0, cancelled: 0, cancelledVolume: 0 };
      if (['cancelled', 'forfeited'].includes(d.status)) { x.cancelled += 1 / n; x.cancelledVolume += (d.price || 0) / n; } else { x.count += 1 / n; x.volume += (d.price || 0) / n; } }); });
    return m;
  };
  C.commission = CM;
})(window.TH);
