/* Actions – Zalo ZNS (mô phỏng): đợt gửi, kiểm tra lại số nợ trước khi gửi, log từng tin, retry, dự phòng SMS/gọi (UI-39). */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, Cc = TH.calc;
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h >>> 0; };
  /* Ứng viên theo quy tắc tại ngày */
  /* Phase 2: sự kiện gắn lượt thuê – sắp hết HĐ (trong số ngày cảnh báo, CH-09) và đã chi hoàn cọc (7 ngày gần nhất); mỗi lượt thuê gửi một lần */
  const stayCandidates = (rule, set) => {
    const t = F.today(); const sent = new Set(S.where('zaloMessages', m => m.event === rule.event && !['queued', 'skipped_stale'].includes(m.status)).map(m => m.stayId));
    if (rule.event === 'contract_expiring') return Q.expiring().filter(s => (!set || set.has(s.buildingId)) && !sent.has(s.id)).map(s => ({ stay: s, amount: 0, date: s.endDate }));
    return S.all('refunds').filter(r => r.status === 'paid' && r.paidAt && Cc.dates.diffDays(String(r.paidAt).slice(0, 10), t) <= 7 && (!set || set.has(r.buildingId)) && !sent.has(r.stayId))
      .map(r => ({ stay: Q.stay(r.stayId), amount: r.paidAmount || 0, date: String(r.paidAt).slice(0, 10), refundId: r.id }));
  };
  /* Người nhận đang có tin chờ gửi (đợt khác chưa gửi) cùng sự kiện → không đưa vào đợt mới (A6: không gửi lặp) */
  const keyOfMsg = (m) => m.invoiceId || (m.taskId ? 'tk:' + m.taskId : 'st:' + m.stayId);
  const queuedKeys = (event) => new Set(S.where('zaloMessages', m => m.event === event && m.status === 'queued').map(keyOfMsg));
  /* Phase 3: nhắc bảo dưỡng – việc còn dự kiến, hạn trong N ngày tới (CH-32); mỗi lần bảo dưỡng nhắc một lần */
  const taskCandidates = (rule, set) => { const sent = new Set(S.where('zaloMessages', m => m.event === rule.event && !['queued', 'skipped_stale'].includes(m.status)).map(m => m.taskId));
    return Q.maintDueForReminder(set ? [...set] : null).filter(t => !sent.has(t.id)).map(t => ({ task: t, amount: 0, date: t.dueDate })); };
  X.zaloCandidates = (ruleId, buildingIds, period) => {
    const rule = S.get('zaloRules', ruleId); const q = queuedKeys(rule.event);
    return candidatesOf(rule, buildingIds, period).filter(c => !q.has(c.invoice ? c.invoice.id : c.task ? 'tk:' + c.task.id : 'st:' + c.stay.id));
  };
  const candidatesOf = (rule, buildingIds, period) => {
    const set = buildingIds && buildingIds.length ? new Set(buildingIds) : null; const t = F.today(); const prm = Q.params(t);
    if (Cc.zalo.STAY_EVENTS.includes(rule.event)) return stayCandidates(rule, set);
    if ((Cc.zalo.TASK_EVENTS || []).includes(rule.event)) return taskCandidates(rule, set);
    const last = {}; S.all('zaloMessages').forEach(m => { if (m.event === rule.event && m.sentAt && m.status !== 'skipped_paid' && (!last[m.invoiceId] || last[m.invoiceId] < m.sentAt)) last[m.invoiceId] = m.sentAt; });
    const items = S.all('invoices').filter(i => (!set || set.has(i.buildingId)) && (!period || i.period === period) && i.lifecycle !== 'draft' && !i.isBreach).map(inv => {
      const st = Q.invState(inv); return { invoice: inv, remaining: st.remaining, dueTo: inv.dueTo, debtFrom: Cc.dates.billingWindow(inv.period, prm, inv).debtFrom, lastSentAt: last[inv.id] || null, issued: true };
    });
    return Cc.zalo.dueMessages(rule, items, t, prm);
  };
  X.createZaloBatch = (d) => {
    _.need('zalo.send');
    const rule = S.get('zaloRules', d.ruleId); if (!rule) throw new Error('Chọn quy tắc / sự kiện');
    if (!rule.on) throw new Error('Quy tắc đang tắt trong cấu hình – bật lại trước khi tạo đợt');
    if (rule.phase && !TH.ms.on(rule.phase)) throw new Error('Quy tắc thuộc Phase ' + rule.phase + ' – chưa mở ở mốc hiện tại');
    const tpl = S.get('zaloTemplates', rule.templateId);
    const cands = X.zaloCandidates(d.ruleId, d.buildingIds, d.period);
    if (!cands.length) throw new Error('Không có người nhận phù hợp quy tắc tại ngày ' + F.date(F.today()));
    const code = S.nextCode('zaloBatches', 'ZB-' + F.today().replace(/-/g, '') + '-', 2);
    const b = S.add('zaloBatches', { id: 'zb_' + code, code, ruleId: rule.id, event: rule.event, templateId: tpl.id, buildingIds: d.buildingIds || [], period: d.period || null, status: 'prepared', createdBy: _.who(), count: cands.length });
    cands.forEach(c => {
      if (c.task) { const t = c.task; const emp = Q.emp(t.assigneeId || t.leaderId) || {}; // nhân viên: giả định đã liên kết Zalo nội bộ [P]
        S.add('zaloMessages', { batchId: b.id, invoiceId: null, stayId: null, taskId: t.id, employeeId: emp.id || null, buildingId: t.buildingId, phone: emp.phone || '', zaloLinked: !!emp.id, event: rule.event, amount: 0, date: t.dueDate, status: 'queued', attempts: 0 }); return; }
      if (!c.invoice) { const s = c.stay; const cust = Q.customer(s.customerId) || {}; S.add('zaloMessages', { batchId: b.id, invoiceId: null, stayId: s.id, refundId: c.refundId || null, buildingId: s.buildingId, phone: cust.phone, zaloLinked: cust.zaloLinked, event: rule.event, amount: c.amount, date: c.date, status: 'queued', attempts: 0 }); return; }
      const inv = c.invoice; const s = Q.stay(inv.stayId); const cust = Q.customer(s.customerId);
      S.add('zaloMessages', { batchId: b.id, invoiceId: inv.id, stayId: s.id, buildingId: inv.buildingId, phone: cust.phone, zaloLinked: cust.zaloLinked, event: rule.event,
        amount: rule.event === 'invoice_issued' ? inv.totalDue : c.remaining, status: 'queued', attempts: 0 });
    });
    _.audit('create', 'zaloBatch', b.id, `Tạo đợt gửi ${code}: ${cands.length} tin (${Cc.zalo.EVENTS[rule.event]})`); _.done(); return b;
  };
  const deliver = (m) => {
    const inv = m.invoiceId ? Q.invoice(m.invoiceId) : null; const st = inv ? Q.invState(inv) : { remaining: 0 };
    const chk = Cc.zalo.recheck(m, st.remaining, m.taskId ? { task: S.get('maintenanceTasks', m.taskId), asOf: F.today(), remindDays: Q.param('maintRemindDays') } : inv ? {} : { stay: Q.stay(m.stayId), refund: m.refundId ? S.get('refunds', m.refundId) : null, asOf: F.today(), warnDays: Q.param('expiryWarnDays') });
    if (chk.action === 'skip') return { status: chk.status, error: chk.reason };
    if (!m.zaloLinked) return { status: 'failed', error: 'NOT_LINKED', errorText: m.taskId ? 'Chưa giao người nhận nhắc' : 'Khách chưa liên kết Zalo', amount: chk.amount };
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
      const r = deliver(m); const inv = m.invoiceId ? Q.invoice(m.invoiceId) : null; const st = Q.stay(m.stayId) || {};
      if (m.taskId) { const t = S.get('maintenanceTasks', m.taskId) || {}; const a = Q.asset(t.assetId) || {};
        S.update('zaloMessages', m.id, { status: r.status, error: r.error || null, errorText: r.errorText || null, text: Cc.zalo.render(tpl.body, { phong: ((Q.building(t.buildingId) || {}).code || '') + ' – ' + (a.name || ''), han: F.date(t.dueDate), noidung: t.code + ' ' + (t.kind || '') }), attempts: m.attempts + 1, sentAt: F.nowISO() });
        if (r.status === 'delivered') S.update('maintenanceTasks', t.id, { remindedAt: F.nowISO() }); // nội bộ: lỗi thì nhắc trên web (UI-35, UI-01), không SMS
        return; }
      const text = inv ? Cc.zalo.render(tpl.body, { ky: F.periodShort(inv.period), phong: Q.roomCode(inv.roomId), sotien: F.vnd(r.amount || m.amount), han: F.date(inv.dueTo), noidung: inv.customerCode })
        : Cc.zalo.render(tpl.body, { ky: '', phong: Q.roomCode(st.roomId), sotien: F.vnd(m.amount), han: F.date(m.date), noidung: st.code });
      S.update('zaloMessages', m.id, { status: r.status, error: r.error || null, errorText: r.errorText || null, amount: r.amount || m.amount, text, attempts: m.attempts + 1, sentAt: F.nowISO() });
      // tin gắn lượt thuê lỗi → giao việc gọi (không có SMS công nợ)
      if (!inv) { if (r.status === 'failed' && !m.taskId) { const mgr = Q.managerOf(m.buildingId); const tk = S.add('tasks', { kind: 'call', refId: m.id, title: 'Gọi báo ' + Cc.zalo.EVENTS[m.event].toLowerCase() + ' – ' + Q.roomCode(st.roomId) + (r.error === 'NOT_LINKED' ? ' (khách chưa liên kết Zalo)' : ' (Zalo lỗi)'), assigneeId: mgr ? mgr.id : null, status: 'open', at: F.today() }); S.update('zaloMessages', m.id, { taskId: tk.id }); } return; }
      // lỗi không gửi lại được (chưa liên kết) hoặc vẫn lỗi ở lần gửi lại → SMS + giao gọi (một lần cho mỗi tin)
      if (r.status === 'failed' && !m.smsId && (!Cc.zalo.retryable(r.error) || retry)) fallback(Object.assign({}, m, { batchId: id }), inv, r.amount || m.amount, r.error === 'NOT_LINKED' ? 'khách chưa liên kết Zalo' : 'Zalo lỗi sau khi gửi lại');
    });
    const all = S.where('zaloMessages', m => m.batchId === id);
    S.update('zaloBatches', id, Object.assign({ status: 'sent', stats: { delivered: all.filter(m => m.status === 'delivered').length, failed: all.filter(m => m.status === 'failed').length, skipped: all.filter(m => ['skipped_paid', 'skipped_stale'].includes(m.status)).length, sms: S.where('smsMessages', x => x.batchId === id).length } }, retry ? { retriedAt: F.nowISO() } : { sentAt: F.nowISO() }));
    // mô phỏng phản hồi khách → hộp thư trưởng phòng: chỉ tin gửi thành công trong lần này, mỗi tin tối đa một phản hồi
    const sentNow = new Set(msgs.map(m => m.id));
    all.filter(m => sentNow.has(m.id) && m.status === 'delivered' && m.stayId && hash(m.id) % 29 === 1 && !S.one('zaloInbox', x => x.messageId === m.id)).slice(0, 3).forEach(m => {
      const s = Q.stay(m.stayId); const lead = Q.inboxAssignee(m.buildingId);
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
  X.closeInbox = (id, note) => X.updateInbox(id, { status: 'done', note: note || 'Đã xử lý' });
  /* Hộp thư phản hồi (Phase 2, CH-37): gán trưởng phòng phụ trách tòa theo cơ cấu tổ chức UI-24 (đi lên từ quản lý tòa tới TPVH; không có thì cấp trên trực tiếp).
     Tin khách trả lời không thay phiếu thu (UI-13). */
  Q.inboxAssignee = (buildingId) => {
    // chỉ gán cho trưởng phòng (TPVH – vai trò có quyền hộp thư); không tìm thấy → để trống, admin / kế toán xử lý (B18)
    let e = Q.managerOf(buildingId); const seen = new Set();
    if (e && e.title === 'TPVH') return e; // E1: trưởng phòng trực tiếp phụ trách tòa
    while (e && !seen.has(e.id)) { seen.add(e.id); const up = Q.leaderOf(e.id); if (!up) break; if (up.title === 'TPVH') return up; e = up; }
    return null;
  };
  Q.INBOX_ST = { open: ['Chờ xử lý', 'amber'], processing: ['Đang xử lý', 'blue'], done: ['Đã xử lý', 'green'] };
  Q.inboxScoped = () => { const sc = TH.auth.salesScope(); const role = TH.auth.role(); const all = S.all('zaloInbox'); if (['admin', 'ketoan'].includes(role)) return all; const br = TH.auth.branchOf(S.session.employeeId, F.today()); return all.filter(x => x.assigneeId && br.has(x.assigneeId)); };
  X.updateInbox = (id, d) => { _.needMs('2', 'Hộp thư phản hồi Zalo (UI-39)');
    if (!TH.auth.can('zalo.view')) _.need('zalo.inbox');
    const x = S.get('zaloInbox', id); if (!x) throw new Error('Không tìm thấy tin');
    if (!Q.INBOX_ST[d.status]) throw new Error('Trạng thái không hợp lệ');
    if (!Q.inboxScoped().some(y => y.id === id)) throw new Error('Tin thuộc trưởng phòng khác');
    if (d.status === 'done' && !String(d.note || '').trim()) { const e = new Error('Nhập ghi chú xử lý'); e.fields = { note: 'Nhập ghi chú xử lý' }; throw e; }
    S.update('zaloInbox', id, { status: d.status, notes: [...(x.notes || []), ...(d.note ? [{ text: d.note, by: _.who(), at: F.nowISO() }] : [])], note: d.note || x.note || '', doneBy: d.status === 'done' ? _.who() : (x.doneBy || null) });
    _.audit('inbox', 'zaloInbox', id, 'Phản hồi Zalo ' + (x.customerCode || '') + ': ' + Q.INBOX_ST[d.status][0]); _.done();
  };
})(window.TH);
