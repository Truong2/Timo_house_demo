/* Domain – quy tắc gửi Zalo ZNS (đặc tả UI-39, CH-34–37). Thuần. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const Z = {};
  Z.EVENTS = {
    invoice_issued: 'Hóa đơn phát hành',
    before_due: 'Nhắc trước hạn',
    overdue: 'Quá hạn / công nợ',
    contract_expiring: 'Sắp hết hợp đồng',
    refund_paid: 'Đã chi hoàn cọc',
  };
  /* Sự kiện Phase 2 gắn lượt thuê (không gắn hóa đơn): không kiểm tra lại số nợ, mỗi lượt thuê chỉ gửi một lần cho mỗi sự kiện */
  Z.STAY_EVENTS = ['contract_expiring', 'refund_paid'];
  /* Chọn người nhận theo quy tắc tại ngày asOf. items: [{invoice, remaining, dueTo, debtFrom, lastSentAt, issued}]
     prm: tham số hiệu lực (zaloRemindBeforeDays). Quá hạn = từ ngày thành công nợ (ngày 6 tháng N, OQ-12);
     repeatDays: không gửi lại cùng hóa đơn + cùng sự kiện trong N ngày; tin phát hành chỉ gửi một lần. */
  Z.dueMessages = (rule, items, asOf, prm = {}) => items.filter(it => {
    if (!it.issued) return false;
    const last = it.lastSentAt ? String(it.lastSentAt).slice(0, 10) : null;
    if (rule.event === 'invoice_issued') return !last;
    if (last && rule.repeatDays && C.dates.diffDays(last, asOf) < rule.repeatDays) return false;
    if (last && !rule.repeatDays && last === asOf) return false;
    if (rule.event === 'before_due') { const n = rule.daysBefore != null ? rule.daysBefore : (prm.zaloRemindBeforeDays != null ? prm.zaloRemindBeforeDays : 2); return it.remaining > 0.5 && C.dates.diffDays(asOf, it.dueTo) <= n && asOf <= it.dueTo; }
    if (rule.event === 'overdue') return it.remaining > 0.5 && (it.debtFrom ? asOf >= it.debtFrom : asOf > it.dueTo);
    return false;
  });
  /* Kiểm tra lại ngay trước khi gửi. Hóa đơn: đã đủ → bỏ qua; thu một phần → gửi số còn lại.
     Sự kiện lượt thuê (E1, đặc tả UI-39 "chỉ gửi nội dung còn đúng"): ctx = { stay, refund, asOf, warnDays }
     – sắp hết HĐ: lượt thuê còn đang ở, ngày hết hạn chưa đổi (chưa gia hạn), vẫn trong cửa sổ cảnh báo; – đã chi hoàn cọc: phiếu hoàn vẫn "đã chi". */
  Z.recheck = (msg, remaining, ctx = {}) => {
    if (msg.event === 'contract_expiring') {
      const s = ctx.stay;
      if (!s || s.status !== 'active') return { action: 'skip', status: 'skipped_stale', reason: 'Lượt thuê đã kết thúc' };
      if (s.endDate !== msg.date) return { action: 'skip', status: 'skipped_stale', reason: 'Hợp đồng đã gia hạn / đổi ngày hết hạn' };
      if (ctx.asOf && (s.endDate < ctx.asOf || (ctx.warnDays != null && C.dates.diffDays(ctx.asOf, s.endDate) > ctx.warnDays))) return { action: 'skip', status: 'skipped_stale', reason: 'Ngoài cửa sổ cảnh báo hết hạn' };
      return { action: 'send', amount: msg.amount };
    }
    if (msg.event === 'refund_paid') {
      if (!ctx.refund || ctx.refund.status !== 'paid') return { action: 'skip', status: 'skipped_stale', reason: 'Phiếu hoàn không còn ở trạng thái đã chi' };
      return { action: 'send', amount: ctx.refund.paidAmount != null ? ctx.refund.paidAmount : msg.amount };
    }
    if (msg.event !== 'invoice_issued' && remaining <= 0.5) return { action: 'skip', status: 'skipped_paid', reason: 'Đã thanh toán đủ' };
    return { action: 'send', amount: msg.event === 'invoice_issued' ? msg.amount : remaining };
  };
  /* Nội dung tin theo mẫu có biến {{...}} */
  Z.render = (tpl, vars) => String(tpl || '').replace(/\{\{(\w+)\}\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  /* Chỉ retry lỗi tạm thời */
  Z.retryable = (code) => ['TIMEOUT', 'RATE_LIMIT'].includes(code);
  C.zalo = Z;
})(window.TH);
