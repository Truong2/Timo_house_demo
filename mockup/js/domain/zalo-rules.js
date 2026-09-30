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
  /* Kiểm tra lại số nợ ngay trước khi gửi: đã đủ → bỏ qua; thu một phần → gửi số còn lại */
  Z.recheck = (msg, remaining) => {
    if (Z.STAY_EVENTS.includes(msg.event)) return { action: 'send', amount: msg.amount };
    if (msg.event !== 'invoice_issued' && remaining <= 0.5) return { action: 'skip', reason: 'Đã thanh toán đủ' };
    return { action: 'send', amount: msg.event === 'invoice_issued' ? msg.amount : remaining };
  };
  /* Nội dung tin theo mẫu có biến {{...}} */
  Z.render = (tpl, vars) => String(tpl || '').replace(/\{\{(\w+)\}\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  /* Chỉ retry lỗi tạm thời */
  Z.retryable = (code) => ['TIMEOUT', 'RATE_LIMIT'].includes(code);
  C.zalo = Z;
})(window.TH);
