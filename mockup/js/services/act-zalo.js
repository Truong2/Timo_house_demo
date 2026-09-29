/* Actions – Zalo ZNS (mô phỏng): đợt gửi, kiểm tra lại số nợ trước khi gửi, log từng tin, retry, dự phòng SMS/gọi (UI-39). */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, Cc = TH.calc;
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h >>> 0; };
  /* Ứng viên theo quy tắc tại ngày */
  X.zaloCandidates = (ruleId, buildingIds, period) => {
    const rule = S.get('zaloRules', ruleId); const set = buildingIds && buildingIds.length ? new Set(buildingIds) : null; const t = F.today(); const prm = Q.params(t);
    const last = {}; S.all('zaloMessages').forEach(m => { if (m.event === rule.event && m.sentAt && m.status !== 'skipped_paid' && (!last[m.invoiceId] || last[m.invoiceId] < m.sentAt)) last[m.invoiceId] = m.sentAt; });
    const items = S.all('invoices').filter(i => (!set || set.has(i.buildingId)) && (!period || i.period === period) && i.lifecycle !== 'draft' && !i.isBreach).map(inv => {
      const st = Q.invState(inv); return { invoice: inv, remaining: st.remaining, dueTo: inv.dueTo, debtFrom: Cc.dates.billingWindow(inv.period, prm).debtFrom, lastSentAt: last[inv.id] || null, issued: true };
    });
    return Cc.zalo.dueMessages(rule, items, t, prm);
  };
  X.createZaloBatch = (d) => {
    _.need('zalo.send');
    const rule = S.get('zaloRules', d.ruleId); if (!rule) throw new Error('Chọn quy tắc / sự kiện');
    if (!rule.on) throw new Error('Quy tắc đang tắt trong cấu hình – bật lại trước khi tạo đợt');
    const tpl = S.get('zaloTemplates', rule.templateId);
    const cands = X.zaloCandidates(d.ruleId, d.buildingIds, d.period);
    if (!cands.length) throw new Error('Không có người nhận phù hợp quy tắc tại ngày ' + F.date(F.today()));
    const code = S.nextCode('zaloBatches', 'ZB-' + F.today().replace(/-/g, '') + '-', 2);
    const b = S.add('zaloBatches', { id: 'zb_' + code, code, ruleId: rule.id, event: rule.event, templateId: tpl.id, buildingIds: d.buildingIds || [], period: d.period || null, status: 'prepared', createdBy: _.who(), count: cands.length });
    cands.forEach(c => {
      const inv = c.invoice; const s = Q.stay(inv.stayId); const cust = Q.customer(s.customerId);
      S.add('zaloMessages', { batchId: b.id, invoiceId: inv.id, stayId: s.id, buildingId: inv.buildingId, phone: cust.phone, zaloLinked: cust.zaloLinked, event: rule.event,
        amount: rule.event === 'invoice_issued' ? inv.totalDue : c.remaining, status: 'queued', attempts: 0 });
    });
    _.audit('create', 'zaloBatch', b.id, `Tạo đợt gửi ${code}: ${cands.length} tin (${Cc.zalo.EVENTS[rule.event]})`); _.done(); return b;
  };
  const deliver = (m) => {
    const inv = Q.invoice(m.invoiceId); const st = Q.invState(inv);
    const chk = Cc.zalo.recheck(m, st.remaining);
    if (chk.action === 'skip') return { status: 'skipped_paid', error: chk.reason };
    if (!m.zaloLinked) return { status: 'failed', error: 'NOT_LINKED', errorText: 'Khách chưa liên kết Zalo', amount: chk.amount };
    if (m.attempts === 0 && hash(m.id) % 17 === 3) return { status: 'failed', error: 'TIMEOUT', errorText: 'Hết thời gian chờ nhà cung cấp', amount: chk.amount };
    return { status: 'delivered', amount: chk.amount };
  };
  /* Dự phòng khi Zalo không tới được khách (chưa liên kết, hoặc vẫn lỗi sau khi gửi lại): gửi SMS (bản ghi riêng có trạng thái/chi phí) + giao việc gọi cho NV phụ trách */
  const SMS_COST = 750; // đ/tin – đơn giá demo, thay bằng giá nhà mạng khi tích hợp
  const fallback = (m, inv, amount, why) => {
    const mgr = Q.managerOf(inv.buildingId);
    const text = `TIMEHOUSE: Phong ${Q.roomCode(inv.roomId)} ky ${F.periodShort(inv.period)} con ${F.vnd(amount)}d. ND CK: ${inv.customerCode}`;
    const ok = /^0\d{9}$/.test(String(m.phone || ''));
    const sms = S.add('smsMessages', { parentId: m.id, batchId: m.batchId, invoiceId: m.invoiceId, stayId: m.stayId, buildingId: m.buildingId, phone: m.phone, event: m.event, amount, text,
      status: ok ? 'sent' : 'failed', error: ok ? null : 'Số điện thoại không hợp lệ', cost: ok ? SMS_COST : 0, sentAt: F.nowISO(), reason: why });
    S.add('tasks', { kind: 'call', refId: m.id, smsId: sms.id, title: `Gọi nhắc ${Q.roomCode(inv.roomId)} – ${F.vnd(amount)} (${why}; SMS dự phòng ${ok ? 'đã gửi' : 'lỗi'})`, assigneeId: mgr ? mgr.id : null, status: 'open', at: F.today() });
    S.update('zaloMessages', m.id, { fallback: 'sms+call', smsId: sms.id });
  };
  const sendMsgs = (id, retry) => {
    const b = S.get('zaloBatches', id);
    const tpl = S.get('zaloTemplates', b.templateId);
    const msgs = S.where('zaloMessages', m => m.batchId === id && m.status === 'queued');
    msgs.forEach(m => {
      const r = deliver(m); const inv = Q.invoice(m.invoiceId);
      const text = Cc.zalo.render(tpl.body, { ky: F.periodShort(inv.period), phong: Q.roomCode(inv.roomId), sotien: F.vnd(r.amount || m.amount), han: F.date(inv.dueTo), noidung: inv.customerCode });
      S.update('zaloMessages', m.id, { status: r.status, error: r.error || null, errorText: r.errorText || null, amount: r.amount || m.amount, text, attempts: m.attempts + 1, sentAt: F.nowISO() });
      // lỗi không gửi lại được (chưa liên kết) hoặc vẫn lỗi ở lần gửi lại → SMS + giao gọi (một lần cho mỗi tin)
      if (r.status === 'failed' && !m.smsId && (!Cc.zalo.retryable(r.error) || retry)) fallback(Object.assign({}, m, { batchId: id }), inv, r.amount || m.amount, r.error === 'NOT_LINKED' ? 'khách chưa liên kết Zalo' : 'Zalo lỗi sau khi gửi lại');
    });
    const all = S.where('zaloMessages', m => m.batchId === id);
    S.update('zaloBatches', id, Object.assign({ status: 'sent', stats: { delivered: all.filter(m => m.status === 'delivered').length, failed: all.filter(m => m.status === 'failed').length, skipped: all.filter(m => m.status === 'skipped_paid').length, sms: S.where('smsMessages', x => x.batchId === id).length } }, retry ? { retriedAt: F.nowISO() } : { sentAt: F.nowISO() }));
    // mô phỏng phản hồi khách → hộp thư trưởng phòng: chỉ tin gửi thành công trong lần này, mỗi tin tối đa một phản hồi
    const sentNow = new Set(msgs.map(m => m.id));
    all.filter(m => sentNow.has(m.id) && m.status === 'delivered' && hash(m.id) % 29 === 1 && !S.one('zaloInbox', x => x.messageId === m.id)).slice(0, 3).forEach(m => {
      const s = Q.stay(m.stayId); const lead = Q.leaderOf((Q.managerOf(m.buildingId) || {}).id);
      S.add('zaloInbox', { batchId: id, messageId: m.id, stayId: m.stayId, buildingId: m.buildingId, text: ['Em chuyển khoản tối nay ạ', 'Cho em xin gia hạn đến ngày 10', 'Phòng em điện sao cao vậy ạ?'][hash(m.id) % 3], at: F.nowISO(), assigneeId: lead ? lead.id : null, status: 'open', customerCode: s.code });
    });
    _.audit(retry ? 'retry' : 'send', 'zaloBatch', id, `${retry ? 'Gửi lại ' + msgs.length + ' tin lỗi tạm thời' : 'Gửi'} đợt ${b.code}`); _.done();
  };
  X.sendZaloBatch = (id) => { _.need('zalo.send'); const b = S.get('zaloBatches', id); if (!b) throw new Error('Không tìm thấy đợt'); if (b.status === 'sent') throw new Error('Đợt đã gửi – dùng "Gửi lại" cho tin lỗi tạm thời'); sendMsgs(id, false); };
  X.retryZalo = (id) => {
    _.need('zalo.send');
    const msgs = S.where('zaloMessages', m => m.batchId === id && m.status === 'failed' && Cc.zalo.retryable(m.error));
    if (!msgs.length) throw new Error('Không có tin lỗi tạm thời để gửi lại (tin đã nhận thành công không gửi lại)');
    msgs.forEach(m => S.update('zaloMessages', m.id, { status: 'queued' }));
    sendMsgs(id, true);
  };
  X.toggleZaloRule = (id) => { _.need('zalo.config'); const r = S.get('zaloRules', id); S.update('zaloRules', id, { on: !r.on }); _.audit('config', 'zaloRule', id, (r.on ? 'Tắt' : 'Bật') + ' quy tắc ' + r.name); _.done(); };
  X.closeInbox = (id, note) => { _.need('zalo.view'); S.update('zaloInbox', id, { status: 'done', note, doneBy: _.who() }); _.done(); };
})(window.TH);
