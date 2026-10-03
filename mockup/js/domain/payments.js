/* Domain – trạng thái thu, công nợ, phân bổ, mốc 5/10/15 (đặc tả UI-13/UI-14, §3.12c). Thuần. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const P = {};
  /* Ánh xạ trạng thái Excel cột AY (so Tổng cần đóng AV với Tổng đã đóng AX) */
  P.STATUS = {
    CHUA_TT: { label: 'Chưa TT', web: 'Chưa thu', tone: 'red' },
    THIEU: { label: 'Thiếu', web: 'Thu một phần', tone: 'amber' },
    DU: { label: 'Đủ', web: 'Đã thu đủ', tone: 'green' },
    THUA: { label: 'Thừa', web: 'Thu thừa', tone: 'blue' },
    DONG_COC: { label: 'Đóng cọc', web: 'Đặt cọc/trả trước', tone: 'purple' },
    TRONG: { label: 'Trống', web: 'Không phát sinh', tone: 'gray' },
  };
  const EPS = 0.5;
  P.payStatus = (due, paid) => {
    due = Number(due) || 0; paid = Number(paid) || 0;
    if (due > EPS && paid <= EPS) return 'CHUA_TT';
    if (due <= EPS && paid <= EPS) return 'TRONG';
    if (due <= EPS && paid > EPS) return 'DONG_COC';
    if (paid - due > EPS) return 'THUA';
    if (paid - due < -EPS) return 'THIEU';
    return 'DU';
  };
  /* Excel đúng nguyên văn (Thừa được xét trước Đóng cọc) – để đối chiếu */
  P.excelStatus = (due, paid) => {
    if (due > 0 && paid === 0) return 'Chưa TT';
    if (paid - due > 0) return 'Thừa';
    if (due === 0 && paid === 0) return 'Trống';
    if (paid < due) return 'Thiếu';
    return 'Đủ';
  };
  /* Tổng đã phân bổ vào hóa đơn (bỏ phiếu đã đảo) */
  P.paidOf = (invoiceId, payments) => payments.reduce((s, p) => p.status === 'reversed' ? s : s + (p.allocations || []).filter(a => a.invoiceId === invoiceId).reduce((t, a) => t + a.amount, 0), 0);
  /* Công nợ theo cơ sở cấu hình: ngày phát hành (mặc định CH-14) hoặc ngày hết hạn (tương thích cũ). */
  P.debtState = (inv, remaining, asOf, prm) => {
    if (remaining <= EPS) return { state: 'none', days: 0 };
    const w = C.dates.billingWindow(inv.period, prm, inv);
    const days = Math.max(0, C.dates.diffDays(w.dueTo, asOf));
    if (asOf < w.debtFrom) return { state: asOf <= w.dueTo ? 'in_term' : 'overdue', days, debtFrom: w.debtFrom, debtBasis: w.debtBasis };
    return { state: 'debt', days, debtFrom: w.debtFrom, debtBasis: w.debtBasis };
  };
  /* Phân bổ do kế toán chọn: không tự quyết định thứ tự bù nợ; tổng phân bổ không vượt số tiền phiếu */
  P.validateAllocation = (amount, plan) => {
    const errs = [];
    const s = plan.reduce((t, a) => t + (Number(a.amount) || 0), 0);
    if (amount <= 0) errs.push('Số tiền thu phải lớn hơn 0');
    if (s - amount > EPS) errs.push('Tổng phân bổ vượt số tiền phiếu thu');
    plan.forEach(a => { if (a.amount < 0) errs.push('Số phân bổ không được âm'); if (a.max != null && a.amount - a.max > EPS) errs.push(`Phân bổ vượt số còn phải thu của ${a.label || a.invoiceId}`); });
    return { ok: !errs.length, errs, allocated: s, unallocated: Math.max(0, amount - s) };
  };
  /* Trả trước nhiều tháng: tiền mặt xuất hiện một lần tại ngày thu, chia từng kỳ để đánh dấu đã thu */
  P.prepaySplit = (amount, monthlyDue, months) => {
    const out = []; let left = amount;
    for (let i = 0; i < months && left > EPS; i++) { const a = Math.min(left, monthlyDue); out.push({ index: i, amount: a }); left -= a; }
    return { parts: out, unallocated: left };
  };
  /* Thu lũy kế theo NGÀY TIỀN THỰC NHẬN tại hết ngày 5/10/15 của kỳ (ảnh chụp mốc) */
  P.milestoneCum = (payments, period, days = [5, 10, 15]) => days.map(d => {
    const lim = period + '-' + String(d).padStart(2, '0');
    return { day: d, date: lim, amount: payments.filter(p => p.status !== 'reversed' && p.receivedAt <= lim).reduce((s, p) => s + p.amount, 0) };
  });
  C.payments = P;
})(window.TH);
