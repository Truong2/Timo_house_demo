/* UI-39 Thông báo Zalo ZNS (mô phỏng): đợt gửi · quy tắc · mẫu ZNS · nhật ký từng tin · dự phòng SMS/gọi · hộp thư phản hồi. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, Z = TH.calc.zalo;
  const MST = { queued: ['Chờ gửi', 'blue'], delivered: ['Đã nhận', 'green'], failed: ['Lỗi', 'red'], skipped_paid: ['Bỏ qua – đã thanh toán', 'gray'], skipped_stale: ['Bỏ qua – sự kiện không còn đúng', 'gray'] };
  const mchip = (m) => U.chip(MST[m.status][0] + (m.error ? ' · ' + m.error : ''), MST[m.status][1]);
  /* Quy tắc / mẫu Phase 2 (sắp hết HĐ, đã chi hoàn cọc) chỉ hiện khi đã mở mốc 2 */
  const onMs = (x) => !x.phase || TH.ms.on(x.phase);
  /* Hộp thư phản hồi (Phase 2): trạng thái xử lý + ghi chú; dùng ở UI-39 và tab Zalo của lượt thuê (UI-07) */
  TH.pages.inboxTable = (el, rows, onDone) => {
    U.table(el, { rows: rows.slice().sort((a, b) => String(b.at).localeCompare(String(a.at))), pageSize: 15, empty: U.empty({ icon: 'inbox', title: 'Chưa có phản hồi' }), cols: [{ key: 'a', label: 'Thời điểm', render: x => F.datetime(x.at) },
      { key: 'c', label: 'Mã KH', render: x => x.stayId ? `<a href="#/stays/${x.stayId}?tab=zalo">${esc(x.customerCode || '')}</a>` : esc(x.customerCode || '') }, { key: 't', label: 'Nội dung khách trả lời', render: x => esc(x.text) },
      { key: 'as', label: 'Trưởng phòng phụ trách', render: x => esc((Q.emp(x.assigneeId) || {}).name || 'Chưa gán') }, { key: 'n', label: 'Ghi chú xử lý', render: x => `<span class="small">${(x.notes || []).map(n => esc(n.text) + ' <span class="muted">(' + esc(n.by) + ')</span>').join('<br>') || esc(x.note || '')}</span>` },
      { key: 's', label: 'Trạng thái', render: x => U.chip((Q.INBOX_ST || {})[x.status] ? Q.INBOX_ST[x.status][0] : x.status, (Q.INBOX_ST || {})[x.status] ? Q.INBOX_ST[x.status][1] : 'gray') },
      { key: 'actions', label: '', render: x => x.status !== 'done' ? U.actBtn({ icon: 'pencil', label: 'Xử lý', act: 'inbox', attrs: { 'data-id': x.id } }) : '' }] });
    U.bind(el, { inbox: (b) => { const x = S.get('zaloInbox', b.dataset.id); K.formDrawer({ title: 'Xử lý phản hồi – ' + esc(x.customerCode || ''), modal: true, note: U.note('info', esc(x.text), 'Tin nhắn trả lời không thay phiếu thu – khách báo đã chuyển khoản thì kế toán kiểm tra và ghi phiếu thu (UI-13).'),
      fields: [{ name: 'status', label: 'Trạng thái', type: 'select', options: Object.entries(Q.INBOX_ST).map(([k, v]) => [k, v[0]]), value: x.status === 'open' ? 'processing' : 'done' }, { name: 'note', label: 'Ghi chú xử lý', type: 'textarea', span: true }],
      submit: 'Lưu', onSubmit: (d) => { X.updateInbox(x.id, d); U.toast('ok', 'Đã cập nhật phản hồi'); if (onDone) onDone(); } }); } });
  };
  /* Phase 2: hộp thư phản hồi riêng cho trưởng phòng (quyền zalo.inbox, không cần quyền xem đợt gửi) – B18 */
  TH.router.handle('/zalo/inbox', (root) => {
    TH.layout.crumb([{ label: 'Phản hồi Zalo' }]);
    root.innerHTML = U.pageHead({ title: 'Phản hồi Zalo', sub: 'Tin khách trả lời, tự gán trưởng phòng phụ trách tòa theo cơ cấu tổ chức (UI-24) · tin trả lời không thay phiếu thu (UI-13)' }) + K.tableCard('t', 'Hộp thư phản hồi');
    TH.pages.inboxTable(root.querySelector('#t'), Q.inboxScoped());
  });
  TH.router.handle('/zalo', (root, p, q) => {
    const p2 = TH.ms.on('2'); // hộp thư phản hồi chỉ có từ mốc 2 (E1)
    const tab = q.tab === 'hop-thu' && !p2 ? 'dot-gui' : q.tab || 'dot-gui';
    const batches = S.all('zaloBatches').slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const msgs = S.all('zaloMessages');
    root.innerHTML = U.pageHead({ title: 'Thông báo Zalo ZNS', sub: 'Timehouse chủ động gửi theo SĐT, không cần khách follow OA · chỉ gửi số đã phát hành · tin nhắn không thay phiếu thu', acts: [U.btn({ label: 'Tạo đợt gửi', icon: 'send', cls: 'btn-primary', act: 'new', perm: 'zalo.send' })] })
      + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Tin đã gửi', value: msgs.filter(m => m.status !== 'queued').length, icon: 'send' })}${U.kpi({ label: 'Đã nhận', value: msgs.filter(m => m.status === 'delivered').length, icon: 'check-circle', tone: 'green' })}
        ${U.kpi({ label: 'Lỗi', value: msgs.filter(m => m.status === 'failed').length, cap: msgs.filter(m => m.error === 'NOT_LINKED').length + ' chưa liên kết → SMS + giao việc gọi', icon: 'x-circle', tone: 'red' })}${p2 ? U.kpi({ label: 'Phản hồi chờ xử lý', value: S.where('zaloInbox', x => x.status === 'open').length, icon: 'inbox', tone: 'amber' }) : U.kpi({ label: 'Bỏ qua', value: msgs.filter(m => /^skipped/.test(m.status)).length, cap: 'đã thanh toán đủ trước khi gửi', icon: 'minus-circle' })}</div>`
      + U.tabs([{ key: 'dot-gui', label: 'Đợt gửi', count: batches.length }, { key: 'nhat-ky', label: 'Nhật ký tin' }, { key: 'quy-tac', label: 'Quy tắc gửi' }, { key: 'mau', label: 'Mẫu ZNS' }, ...(p2 ? [{ key: 'hop-thu', label: 'Hộp thư phản hồi' }] : []), { key: 'du-phong', label: 'Dự phòng (gọi/SMS)' }], tab)
      + '<div id="tb" class="mt16"></div>';
    const tb = root.querySelector('#tb');
    if (tab === 'dot-gui') {
      tb.innerHTML = K.tableCard('t', 'Đợt gửi');
      U.table(tb.querySelector('#t'), { rows: batches, pageSize: 20, rowHref: b => '#/zalo/batches/' + b.id, empty: U.empty({ icon: 'send', title: 'Chưa có đợt gửi', text: 'Tạo đợt gửi sau khi phát hành hóa đơn hoặc để nhắc công nợ.' }), cols: [
        { key: 'c', label: 'Mã đợt', render: b => `<b>${esc(b.code)}</b>` }, { key: 'e', label: 'Sự kiện', render: b => esc(Z.EVENTS[b.event]) }, { key: 'p', label: 'Kỳ', render: b => b.period ? F.periodShort(b.period) : 'Tất cả' },
        { key: 'n', label: 'Số tin', num: true, render: b => b.count }, { key: 'd', label: 'Đã nhận', num: true, render: b => (b.stats || {}).delivered ?? '–' }, { key: 'f', label: 'Lỗi', num: true, render: b => (b.stats || {}).failed ?? '–' },
        { key: 's', label: 'Bỏ qua', num: true, render: b => (b.stats || {}).skipped ?? '–' }, { key: 'st', label: 'Trạng thái', render: b => b.status === 'sent' ? U.chip('Đã gửi ' + F.datetime(b.sentAt), 'green') : U.chip('Đã chuẩn bị', 'blue') }, { key: 'by', label: 'Người tạo', render: b => esc(b.createdBy) }] });
    }
    if (tab === 'nhat-ky') {
      let rows = msgs.slice().sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt))); if (q.status) rows = rows.filter(m => m.status === q.status);
      tb.innerHTML = K.filters([{ name: 'status', label: 'Trạng thái', options: Object.entries(MST).map(([k, v]) => [k, v[0]]) }], q) + '<div class="mt12">' + K.tableCard('t', rows.length + ' tin') + '</div>';
      K.bindFilters(tb, ['tab']);
      U.table(tb.querySelector('#t'), { rows, pageSize: 25, cols: [{ key: 't', label: 'Thời điểm', render: m => F.datetime(m.sentAt) }, { key: 'r', label: 'Phòng', render: m => esc(Q.roomCode((Q.invoice(m.invoiceId) || Q.stay(m.stayId) || {}).roomId)) }, { key: 'ph', label: 'SĐT', render: m => esc(Q.pii(m.phone)) },
        { key: 'e', label: 'Sự kiện', render: m => esc(Z.EVENTS[m.event]) }, { key: 'a', label: 'Số tiền gửi', num: true, render: m => F.vnd(m.amount) }, { key: 'x', label: 'Nội dung', render: m => `<span class="small">${esc(m.text || '')}</span>` }, { key: 'n', label: 'Lần', num: true, render: m => m.attempts }, { key: 's', label: 'Trạng thái', render: mchip }] });
    }
    if (tab === 'quy-tac') {
      tb.innerHTML = U.card({ title: 'Quy tắc gửi do người dùng tự đặt (CH-34)', icon: 'sliders', body: S.all('zaloRules').filter(onMs).map(r => `<div class="rule-row"><div class="grow"><b>${esc(r.name)}</b><div class="small muted">${esc(Z.EVENTS[r.event])} · mẫu "${esc((S.get('zaloTemplates', r.templateId) || {}).name)}" · gửi lúc ${r.time}${r.event === 'before_due' ? ' · trước hạn ' + (r.daysBefore != null ? r.daysBefore : Q.param('zaloRemindBeforeDays')) + ' ngày' + (r.daysBefore != null ? '' : ' (tham số zaloRemindBeforeDays)') : ''}${r.event === 'overdue' ? ' · từ ngày thành công nợ (ngày ' + (Q.param('debtAfterDueDays') + 1) + ' tháng N)' : ''}${r.repeatDays ? ' · không lặp trong ' + r.repeatDays + ' ngày' : ''}</div></div>${U.toggle(r.on, 'rule', { 'data-id': r.id })}</div>`).join('') })
        + U.note('info', 'Kiểm tra lại trước khi gửi', 'Hóa đơn: tính lại số còn nợ – đã thanh toán đủ → bỏ qua; thu một phần → gửi số còn lại.' + (p2 ? ' Sắp hết HĐ: bỏ qua nếu lượt thuê đã kết thúc / đã gia hạn / ra ngoài cửa sổ cảnh báo. Đã chi hoàn cọc: bỏ qua nếu phiếu hoàn không còn "đã chi".' : '') + ' Không gửi lại tin cho người đã nhận thành công.');
    }
    if (tab === 'mau') tb.innerHTML = `<div class="grid grid-3">${S.all('zaloTemplates').filter(onMs).map(t => U.card({ title: t.name, icon: 'message', sub: U.chip(t.status === 'approved' ? 'Zalo đã duyệt' : 'Chờ duyệt', t.status === 'approved' ? 'green' : 'amber') + ' · ' + t.cost + 'đ/tin', body: `<div class="zbubble">${esc(t.body)}</div><p class="small muted mt8">Biến: {{ky}} {{phong}} {{sotien}} {{han}} {{noidung}}</p>` })).join('')}</div>`;
    if (tab === 'hop-thu') {
      tb.innerHTML = K.tableCard('t', 'Tin khách trả lời – tự gán trưởng phòng phụ trách tòa theo cơ cấu tổ chức (UI-24)');
      TH.pages.inboxTable(tb.querySelector('#t'), Q.inboxScoped());
    }
    if (tab === 'du-phong') {
      const rows = S.where('tasks', t => t.kind === 'call'), sms = S.all('smsMessages').slice().sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt)));
      tb.innerHTML = K.tableCard('sms', `Tin SMS dự phòng · ${sms.length} tin · ${F.vnd(sms.reduce((s, x) => s + (x.cost || 0), 0))}đ`) + '<div class="mt16"></div>' + K.tableCard('t', 'Việc gọi điện cho NV phụ trách (khách chưa liên kết Zalo / gửi lỗi)');
      U.table(tb.querySelector('#sms'), { rows: sms, pageSize: 20, empty: U.empty({ title: 'Chưa có SMS dự phòng' }), cols: [{ key: 't', label: 'Thời điểm', render: x => F.datetime(x.sentAt) }, { key: 'r', label: 'Phòng', render: x => esc(Q.roomCode((Q.invoice(x.invoiceId) || {}).roomId)) }, { key: 'ph', label: 'SĐT', render: x => esc(Q.pii(x.phone)) },
        { key: 'why', label: 'Lý do', render: x => esc(x.reason || '') }, { key: 'x', label: 'Nội dung', render: x => `<span class="small mono">${esc(x.text)}</span>` }, { key: 'c', label: 'Chi phí', num: true, render: x => F.vnd(x.cost || 0) },
        { key: 's', label: 'Trạng thái', render: x => x.status === 'sent' ? U.chip('Đã gửi', 'green') : U.chip('Lỗi · ' + (x.error || ''), 'red') }] });
      U.table(tb.querySelector('#t'), { rows, noPager: true, empty: U.empty({ title: 'Không có việc dự phòng' }), cols: [{ key: 'd', label: 'Ngày', render: x => F.date(x.at) }, { key: 't', label: 'Việc', render: x => esc(x.title) }, { key: 'a', label: 'Giao cho', render: x => esc((Q.emp(x.assigneeId) || {}).name || '') }, { key: 's', label: 'Trạng thái', render: x => U.chip(x.status === 'open' ? 'Chưa gọi' : 'Đã gọi', x.status === 'open' ? 'amber' : 'green') }] });
    }
    U.bind(root, { tab: (el) => TH.router.setQuery({ tab: el.dataset.key, status: '' }), rule: (el) => K.act(() => X.toggleZaloRule(el.dataset.id)),
      new: () => { const d = K.formDrawer({ title: 'Tạo đợt gửi', sub: 'Chọn quy tắc → xem trước người nhận → gửi', wide: true, fields: [
        { name: 'ruleId', label: 'Sự kiện / quy tắc', type: 'select', req: true, options: S.all('zaloRules').filter(onMs).map(r => [r.id, r.name + (r.on ? '' : ' (đang tắt)')]), value: q.rule || 'zr_overdue' },
        { name: 'period', label: 'Kỳ hóa đơn', type: 'select', options: K.periodOpts(), value: S.meta.period }, { name: 'building', label: 'Tòa (để trống = toàn phạm vi)', type: 'select', options: K.buildingOpts() },
        { type: 'html', span: true, html: '<div id="zprev"></div>' }], submit: 'Tạo đợt', onSubmit: (x) => { const b = X.createZaloBatch({ ruleId: x.ruleId, period: x.period, buildingIds: x.building ? [x.building] : [] }); U.toast('ok', 'Đã tạo đợt ' + b.code); TH.go('#/zalo/batches/' + b.id); } });
        const prev = () => { const x = d.data(); const c = X.zaloCandidates(x.ruleId, x.building ? [x.building] : [], x.period); d.el.querySelector('#zprev').innerHTML = U.note(c.length ? 'info' : 'warn', `${c.length} người nhận tại ngày ${F.date(F.today())}`, c.slice(0, 6).map(i => i.invoice ? esc(Q.roomCode(i.invoice.roomId)) + ' – ' + F.vnd(i.remaining) : esc(Q.roomCode((i.stay || {}).roomId)) + ' – ' + (i.amount ? F.vnd(i.amount) : F.date(i.date || (i.stay || {}).endDate))).join(' · ') + (c.length > 6 ? ' …' : '')); };
        d.el.addEventListener('change', prev); prev(); } });
  });
  TH.router.handle('/zalo/batches/:id', (root, p) => {
    const b = S.get('zaloBatches', p.id); if (!b) { root.innerHTML = U.empty({ title: 'Không tìm thấy đợt' }); return; }
    TH.layout.crumb([{ label: 'Thông báo Zalo', href: '#/zalo' }, { label: b.code }]);
    const rows = S.where('zaloMessages', m => m.batchId === b.id);
    const retry = rows.filter(m => m.status === 'failed' && Z.retryable(m.error)).length;
    root.innerHTML = U.pageHead({ title: 'Đợt gửi ' + esc(b.code), back: '#/zalo', sub: `${esc(Z.EVENTS[b.event])} · ${rows.length} tin · tạo bởi ${esc(b.createdBy)}`, acts: [
      b.status !== 'sent' ? U.btn({ label: Z.STAY_EVENTS.includes(b.event) ? 'Kiểm tra lại sự kiện & gửi' : 'Kiểm tra lại số nợ & gửi', icon: 'send', cls: 'btn-primary', act: 'send', perm: 'zalo.send' }) : '', retry ? U.btn({ label: `Gửi lại ${retry} tin lỗi tạm thời`, icon: 'refresh', act: 'retry', perm: 'zalo.send' }) : ''] })
      + `<div class="grid grid-4 mb16">${Object.entries(MST).filter(([k]) => k !== 'skipped_stale' || rows.some(m => m.status === k)).map(([k, v]) => U.kpi({ label: v[0], value: rows.filter(m => m.status === k).length, icon: 'message', tone: v[1] })).join('')}</div>` + K.tableCard('t', 'Tin trong đợt');
    U.table(root.querySelector('#t'), { rows, pageSize: 30, cols: [{ key: 'r', label: 'Phòng', render: m => esc(Q.roomCode((Q.invoice(m.invoiceId) || Q.stay(m.stayId) || {}).roomId)) }, { key: 'kh', label: 'Mã KH', render: m => esc((Q.stay(m.stayId) || {}).code) }, { key: 'ph', label: 'SĐT', render: m => esc(Q.pii(m.phone)) },
      { key: 'z', label: 'Zalo', render: m => m.zaloLinked ? U.chip('Đã liên kết', 'green') : U.chip('Chưa liên kết', 'gray') }, { key: 'a', label: 'Số tiền', num: true, render: m => F.vnd(m.amount) }, { key: 'x', label: 'Nội dung / lỗi', render: m => `<span class="small">${esc(m.errorText || m.text || '')}</span>` },
      { key: 'fb', label: 'Dự phòng', render: m => { if (!m.fallback) return ''; const x = S.get('smsMessages', m.smsId) || {}; return U.chip('SMS ' + (x.status === 'sent' ? 'đã gửi' : 'lỗi') + ' + giao gọi', x.status === 'sent' ? 'amber' : 'red'); } }, { key: 's', label: 'Trạng thái', render: mchip }] });
    U.bind(root, { send: () => K.act(() => X.sendZaloBatch(b.id), 'Đã gửi đợt'), retry: () => K.act(() => X.retryZalo(b.id), 'Đã gửi lại') });
  });
})(window.TH);
