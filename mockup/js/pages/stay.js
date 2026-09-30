/* UI-07 Chi tiết lượt thuê: tab Lưu trú · Hợp đồng (UI-08 upload, OCR Phase 2) · Biểu phí (UI-09, E07) · Tài chính · Zalo.
   Modal: kết thúc thuê 5 loại (F12), gia hạn / chuyển phòng (E04), nhận phòng, lập phiếu hoàn. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, CAT = () => TH.data.catalog;
  const FEE = [['electric', 'Điện riêng', 'meter'], ['water', 'Nước', 'meter|person'], ['cleaning', 'Vệ sinh', 'room'], ['internet', 'Internet', 'room'], ['elevator', 'Thang máy', 'person'], ['ev', 'Xe điện / gửi xe', 'vehicle'], ['washer', 'Máy giặt/sấy', 'person'], ['combo', 'Combo / DV chung', 'person']];
  const methodLabel = (m) => ({ meter: 'theo chỉ số', person: 'theo người', room: 'theo phòng', vehicle: 'theo xe' }[m] || m || '');

  const endModal = (s) => {
    const pending = s.status === 'pending';
    const types = CAT().endTypes.filter(t => pending ? t.key === 'forfeit' : t.key !== 'forfeit');
    const rooms = S.all('rooms').filter(r => r.id !== s.roomId && r.exploitation !== 'meter_common' && !Q.currentStay(r.id) && !Q.pendingStay(r.id) && TH.auth.inScope(r.buildingId));
    const d = K.formDrawer({ title: 'Kết thúc lượt thuê ' + s.code, sub: 'Bắt buộc chọn loại kết thúc – quyết định cọc và khoản còn thu', fields: [
      { name: 'endType', label: 'Loại kết thúc', type: 'select', req: true, options: types.map(t => [t.key, t.label]), value: pending ? 'forfeit' : 'expired' },
      { name: 'date', label: pending ? 'Ngày báo bỏ cọc' : 'Ngày ngừng tính tiền / bàn giao', type: 'date', req: true, value: s.plannedLeaveDate || F.today() },
      { name: 'noticeDate', label: 'Ngày báo trả', type: 'date' },
      { name: 'reason', label: 'Lý do', type: 'select', options: CAT().breachReasons, help: 'Bắt buộc với phá HĐ, bỏ trốn, bỏ cọc' },
      { name: 'toRoomId', label: 'Chuyển sang phòng (khi chuyển phòng)', type: 'select', options: rooms.map(r => [r.id, r.code]) },
      { name: 'elCurr', label: 'Chỉ số điện chốt (hết hạn HĐ)', type: 'number', help: 'Dùng cho phiếu hoàn cọc' },
      { type: 'html', span: true, html: `<div id="end-effect">${effect(pending ? 'forfeit' : 'expired')}</div>` }],
      submit: 'Xác nhận kết thúc', onSubmit: (x) => {
        // Chuyển phòng cần phương án cọc khách xác nhận → mở form chuyển phòng riêng
        if (x.endType === 'transfer') { setTimeout(() => transferDrawer(s, { toRoomId: x.toRoomId, date: x.date }), 0); return; }
        const r = X.endStay(s.id, { endType: x.endType, date: x.date, noticeDate: x.noticeDate, reason: x.reason, finalReading: x.elCurr ? { elCurr: Number(x.elCurr) } : null });
        U.toast('ok', 'Đã kết thúc lượt thuê'); if (r && r.refund) TH.go('#/refunds/' + r.refund.id);
      } });
    d.el.querySelector('[name=endType]').addEventListener('change', (e) => { d.el.querySelector('#end-effect').innerHTML = effect(e.target.value); });
  };
  /* Chuyển phòng (E04): lượt thuê mới liên kết; cọc theo phương án khách xác nhận (không tự chuyển) */
  const transferDrawer = (s, pre = {}) => {
    const rooms = S.all('rooms').filter(r => r.id !== s.roomId && r.exploitation !== 'meter_common' && !Q.currentStay(r.id) && !Q.pendingStay(r.id) && TH.auth.inScope(r.buildingId));
    const held = Math.max(0, X.depositBalance(s.id));
    const debt = (Q.invoicesByStay()[s.id] || []).reduce((t, i) => t + Q.invState(i).remaining, 0);
    K.formDrawer({ title: 'Chuyển phòng – ' + s.code, sub: 'Tạo lượt thuê mới liên kết; cọc theo phương án khách đã xác nhận', fields: [
      { name: 'toRoomId', label: 'Phòng mới', type: 'select', req: true, value: pre.toRoomId || '', options: rooms.map(r => [r.id, `${r.code} – ${F.vnd(r.price)}`]) }, { name: 'date', label: 'Ngày hiệu lực', type: 'date', req: true, value: pre.date || F.nextPeriod(F.period(F.today())) + '-01' },
      { name: 'rent', label: 'Giá thuê phòng mới', type: 'money' }, { name: 'newDeposit', label: 'Cọc yêu cầu phòng mới', type: 'money', value: s.depositAmount },
      { name: 'depositPlan', label: 'Phương án cọc', type: 'select', req: true, span: true, options: Object.entries(X.DEPOSIT_PLANS) },
      { name: 'depositConfirmed', type: 'check', span: true, checkLabel: 'Khách đã xác nhận phương án cọc (bắt buộc)' },
      { type: 'html', span: true, html: U.note('info', 'Cọc & công nợ', `Cọc đang giữ trong sổ cọc: ${F.vndd(held)}. Cọc yêu cầu lớn hơn số chuyển → phần thiếu thu ở hóa đơn đầu của phòng mới. Chọn "hoàn lại phần dư" → lập phiếu hoàn cho lượt thuê cũ. Công nợ ${Q.money(debt)} giữ ở lượt thuê gốc, không gán cho lượt thuê mới.`) }],
      submit: 'Tạo lượt thuê mới', onSubmit: (x) => { const ns = X.transferStay(s.id, x); U.toast('ok', 'Đã chuyển sang ' + ns.code, ns.refund ? 'Phiếu hoàn phần cọc dư: ' + ns.refund.code : ''); TH.go('#/stays/' + ns.id); } });
  };
  const effect = (t) => U.note(({ expired: 'info', breach: 'danger', abscond: 'danger', forfeit: 'warn', transfer: 'info' })[t], 'Tác động', ({
    expired: 'Cọc chuyển "chờ hoàn" và tạo phiếu hoàn (khấu hao 200.000đ/phòng + điện nước chốt + phí thực tế). Phòng → trống cần kiểm tra/dọn.',
    breach: 'Giữ cọc, KHÔNG lập phiếu hoàn. Hóa đơn kỳ hiện tại chỉ còn tiền điện theo chỉ số, phần còn lại không thành công nợ (GĐ OQ-03).',
    abscond: 'Như phá HĐ: giữ cọc, chỉ thu tiền điện. Tiền điện không thu được đưa vào danh sách điện nước không thu được.',
    forfeit: 'Khách đã cọc nhưng không vào ở: cọc thành doanh thu "Cọc khách bỏ không ở", không hoàn.',
    transfer: 'Tạo lượt thuê mới ở phòng đích (mã KH mới), chuyển cọc sang lượt thuê mới; lượt thuê cũ kết thúc loại "Chuyển phòng".',
  })[t]);

  TH.router.handle('/stays/:id', (root, p, q) => {
    const s = Q.stay(p.id); if (!s) { root.innerHTML = U.empty({ title: 'Không tìm thấy lượt thuê' }); return; }
    if (!TH.auth.inScope(s.buildingId)) { root.innerHTML = U.card({ body: U.empty({ icon: 'lock', title: 'Lượt thuê ngoài phạm vi được giao' }) }); return; }
    const c = Q.customer(s.customerId) || {}; const room = Q.room(s.roomId);
    TH.layout.crumb([{ label: 'Khách thuê', href: '#/tenants' }, { label: s.code }]);
    const TABS = [{ key: 'luu-tru', label: 'Lưu trú' }, { key: 'hop-dong', label: 'Hợp đồng' }, { key: 'bieu-phi', label: 'Biểu phí', perm: 'rates.view' }, { key: 'tai-chinh', label: 'Tài chính' }, { key: 'zalo', label: 'Zalo' }];
    const tab = K.pickTab(TABS, q.tab || 'luu-tru', 'luu-tru');
    const invs = (Q.invoicesByStay()[s.id] || []).slice().sort((a, b) => b.period.localeCompare(a.period));
    const pays = (Q.paymentsByStay()[s.id] || []).slice().sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
    const debt = invs.reduce((t, i) => t + Q.invState(i).remaining, 0);
    const refund = S.one('refunds', r => r.stayId === s.id);
    const acts = [];
    if (s.status === 'pending') acts.push(U.btn({ label: 'Nhận phòng', icon: 'log-in', act: 'activate', perm: 'tenants.manage' }));
    if (['active', 'pending'].includes(s.status)) acts.push(U.btn({ label: 'Kết thúc thuê', icon: 'log-out', act: 'end', perm: 'stays.end' }));
    if (s.status === 'active') acts.push(U.btn({ label: 'Ghi báo trả', icon: 'calendar-clock', act: 'notice', perm: 'stays.end' }));
    if (s.status === 'active') acts.push(U.btn({ label: 'Gia hạn', icon: 'calendar-check', act: 'renew', perm: 'tenants.manage' }), U.btn({ label: 'Chuyển phòng', icon: 'arrow-left-right', act: 'transfer', perm: 'stays.transfer' }));
    if (refund) acts.push(U.btn({ label: 'Phiếu hoàn ' + refund.code, icon: 'hand-coins', href: '#/refunds/' + refund.id }));
    else if (s.status === 'ended' && s.endType === 'expired') acts.push(U.btn({ label: 'Lập phiếu hoàn', icon: 'hand-coins', act: 'mkrefund', perm: 'refunds.prepare' }));
    if (s.status === 'active' || s.status === 'pending') acts.push(U.btn({ label: 'Ghi thu', icon: 'banknote', cls: 'btn-primary', href: '#/billing/receipts/new?stay=' + s.id, perm: 'payments.record' }));
    root.innerHTML = U.pageHead({ title: esc(c.name || '') + ' ' + K.stayChip(s), back: '#/tenants', sub: `Mã KH <b>${esc(s.code)}</b> · Phòng <b>${esc(room.code)}</b> · Tòa ${esc(Q.building(s.buildingId).code)} · Quản lý ${esc((Q.managerOf(s.buildingId) || {}).name || '–')}`, acts })
      + `<div class="info-strip mb16">
        <div class="it">${TH.icon('calendar')}<div><small>Ngày tính tiền phòng</small><b>${F.date(s.rentStart)}</b></div></div>
        <div class="it">${TH.icon('calendar')}<div><small>Bắt đầu tính dịch vụ</small><b>${F.date(s.svcStart)}</b></div></div>
        <div class="it">${TH.icon('calendar-clock')}<div><small>Hết hạn HĐ</small><b>${F.date(s.endDate)}${s.status === 'active' ? ` <span class="muted small">(còn ${F.daysBetween(F.today(), s.endDate)} ngày)</span>` : ''}</b></div></div>
        <div class="it">${TH.icon('piggy')}<div><small>Cọc</small><b>${F.vnd(s.depositAmount)} ${K.depChip(s.depositStatus)}</b></div></div>
        <div class="it">${TH.icon('alert-triangle')}<div><small>Còn nợ</small><b class="${debt > 0 ? 'red' : ''}">${Q.money(debt)}</b></div></div>
        ${s.endType ? `<div class="it">${TH.icon('log-out')}<div><small>Kết thúc</small><b>${esc(Q.endTypeLabel(s.endType))} · ${F.date(s.endDate)}</b>${s.breachReason || s.endReason ? `<small>${esc(s.breachReason || s.endReason)}</small>` : ''}</div></div>` : ''}
      </div>`
      + U.tabs(TABS.map(t => t.key === 'tai-chinh' ? Object.assign({}, t, { count: invs.length }) : t), tab)
      + '<div id="tb" class="mt16"></div>';
    const tb = root.querySelector('#tb');
    if (tab === 'luu-tru') {
      const hist = (Q.staysByRoom()[s.roomId] || []).filter(x => x.id !== s.id);
      tb.innerHTML = `<div class="two-col"><div class="side-stack">${U.card({ title: 'Thông tin khách', icon: 'user', actions: U.btn({ label: 'Sửa', icon: 'pencil', size: 'btn-sm', act: 'editc', perm: 'tenants.manage' }), body: U.kv([['Họ tên', esc(c.name)], ['SĐT', esc(Q.pii(c.phone))], ['CCCD', esc(Q.pii(c.idNo || ''))], ['Nghề nghiệp', esc(c.occupation || '')], ['Zalo', c.zaloLinked ? U.chip('Đã liên kết', 'green') : U.chip('Chưa liên kết', 'gray')]]) })}
        ${U.card({ title: 'Lưu trú', icon: 'door', body: U.kv([['Số người', s.people], ['Số xe điện', s.vehicles || 0], ['Kỳ thanh toán', (s.payMonths || 1) + ' tháng'], ['Ngày chốt / đặt cọc', F.date(s.dealDate)], ['Ngày nhận phòng', F.date(s.moveInDate)], ['Số lần gia hạn', s.renewals || 0],
          ['Từ lượt thuê', s.fromStayId ? `<a href="#/stays/${s.fromStayId}">${esc(Q.stay(s.fromStayId).code)}</a>` : '–'], ['Sang lượt thuê', s.toStayId ? `<a href="#/stays/${s.toStayId}">${esc(Q.stay(s.toStayId).code)}</a>` : '–']]) })}</div>
        <div>${U.card({ title: 'Các lượt thuê khác cùng phòng ' + room.code, icon: 'history', body: hist.map(h => `<a class="mini-row" href="#/stays/${h.id}"><span class="code">${esc(h.code)}</span><span class="grow truncate">${esc((Q.customer(h.customerId) || {}).name || '')}</span>${K.stayChip(h)}</a>`).join('') || '<span class="muted small">Không có</span>' })}</div></div>`;
    }
    if (tab === 'hop-dong') {
      const files = S.where('contractFiles', f => f.stayId === s.id);
      tb.innerHTML = `<div class="two-col"><div>${U.card({ title: 'File hợp đồng khách', icon: 'file-text', body: `${U.dropzone({ name: 'hd', hint: 'PDF/ảnh hợp đồng đã ký – lưu bản gốc, gắn lượt thuê', multiple: true, accept: '.pdf,image/*' })}
          <div class="mt12">${files.map(f => { const oc = TH.ms.on('2') && Q.ocrOf ? Q.ocrOf(f.id)[0] : null; return U.fileItem({ name: f.name, size: Math.round(f.size / 1024) + ' KB', date: f.uploadedAt }, TH.ms.on('2') ? (oc ? `<a class="btn btn-xs btn-ghost" href="#/ocr/${oc.id}">OCR phiên ${oc.run} · ${esc({ review: 'chờ rà soát', error: 'lỗi', applied: 'đã áp dụng' }[oc.status])}</a>` : `<button type="button" class="btn btn-xs btn-ghost" data-act="ocr" data-id="${f.id}" data-perm="ocr.review">Đọc OCR</button>`) : ''); }).join('') || '<span class="muted small">Chưa có file</span>'}</div>
          <button type="button" class="btn btn-primary mt12" data-act="upload" data-perm="tenants.manage">Lưu file đã chọn</button>` })}</div>
        <div>${TH.ms.on('2') ? U.note('info', 'OCR hợp đồng (UI-08)', 'Đọc tự động người thuê, ngày, giá, cọc, biểu phí → màn rà soát đặt bản gốc cạnh từng trường (độ tin cậy, trang/vùng). Chỉ áp dụng vào biểu phí khi đủ trường bắt buộc và đã rà mọi nhóm; OCR không ghi vào hóa đơn.') : U.note('info', 'OCR hợp đồng – Phase 2', 'Phase 1 chỉ tải và lưu file gốc. Đọc tự động các trường (người thuê, giá, cọc, phí dịch vụ) và bàn rà soát OCR làm ở Phase 2; giá áp dụng hiện nhập ở tab Biểu phí.')}
        ${U.card({ title: 'Điều kiện hợp đồng', icon: 'list', body: U.kv([['Giá thuê', F.vndd(s.rent)], ['Giá niêm yết phòng', F.vndd(room.listPrice)], ['Cọc', F.vndd(s.depositAmount)], ['Thời hạn', F.date(s.rentStart) + ' → ' + F.date(s.endDate)], ['Kỳ trả', (s.payMonths || 1) + ' tháng/lần']]) })}</div></div>`;
      U.bindDropzones(tb);
      U.bind(tb, { upload: () => { const fs = U.dzFiles(tb, 'hd'); if (!fs.length) return U.toast('warn', 'Chọn file trước'); fs.forEach(f => X.addContractFile(s.id, { name: f.name, size: f.size })); U.toast('ok', 'Đã lưu ' + fs.length + ' file'); },
        ocr: (el) => { const o = K.act(() => X.runOcr(el.dataset.id)); if (o) TH.go('#/ocr/' + o.id); } });
    }
    if (tab === 'bieu-phi') {
      const vs = S.where('rateVersions', v => v.stayId === s.id).sort((a, b) => String(b.from).localeCompare(String(a.from)));
      const cur = Q.rateOf(s.id);
      tb.innerHTML = `<div class="two-col"><div>${U.card({ title: 'Biểu phí đang áp dụng', icon: 'list', sub: cur ? `Hiệu lực từ ${F.date(cur.from)} · nguồn: ${esc(cur.reason || '')}` : '', actions: U.btn({ label: 'Thêm phiên giá', icon: 'plus', size: 'btn-sm', cls: 'btn-primary', act: 'newrate', perm: 'rates.manage' }),
          body: cur ? `<table class="tbl compact"><thead><tr><th>Loại phí</th><th>Cách tính</th><th class="num">Đơn giá</th><th class="num">SL mặc định</th><th>Dòng in</th></tr></thead><tbody>
          <tr><td><b>Tiền phòng</b></td><td>theo tháng, chia ngày tháng lẻ</td><td class="num">${F.vnd(cur.rent)}</td><td class="num">1</td><td>1</td></tr>
          ${FEE.map(([k, l]) => { const it = (cur.items || {})[k]; return it && it.unit ? `<tr><td>${l}</td><td>${methodLabel(it.method)}</td><td class="num">${F.vnd(it.unit)}</td><td class="num">${it.method === 'person' ? s.people : it.method === 'vehicle' ? s.vehicles : it.qty || (it.method === 'meter' ? '–' : 1)}</td><td>${TH.data.catalog.feeTypes.find(f => f.key === k).line}</td></tr>` : ''; }).join('')}</tbody></table>` : U.empty({ title: 'Chưa có biểu phí' }) })}</div>
        <div>${U.card({ title: 'Lịch sử phiên giá', icon: 'history', body: vs.map((v, i) => `<div class="mini-row"><span>v${vs.length - i}</span><span class="grow">${F.date(v.from)} → ${v.to ? F.date(v.to) : 'nay'}<br><small class="muted">${esc(v.reason || '')}</small></span><b>${F.vnd(v.rent)}</b></div>`).join('') })}
        ${U.note('info', '', 'Phiên giá mới chỉ áp dụng hóa đơn chưa phát hành; hóa đơn đã phát hành giữ giá snapshot.')}</div></div>`;
    }
    if (tab === 'tai-chinh') {
      tb.innerHTML = `<div class="grid grid-2">${K.tableCard('it', 'Hóa đơn')}${K.tableCard('pt', 'Phiếu thu', '', TH.auth.can('payments.view') ? '' : 'Chỉ kế toán/admin xem chi tiết phiếu thu')}</div>`;
      U.table(tb.querySelector('#it'), { rows: invs, noPager: true, rowHref: i => '#/billing/invoices/' + i.id, cols: [
        { key: 'p', label: 'Kỳ', render: i => F.periodShort(i.period) }, { key: 'l', label: '', render: i => K.lifeChip(i.lifecycle) + (i.isBreach ? ' ' + U.chip('Phá HĐ', 'red') : '') },
        { key: 'd', label: 'Phải thu', num: true, render: i => Q.money(i.totalDue) }, { key: 'r', label: 'Còn nợ', num: true, render: i => Q.money(Q.invState(i).remaining) }, { key: 's', label: 'Trạng thái', render: i => K.payChip(Q.invState(i).status) }] });
      if (TH.auth.can('payments.view')) U.table(tb.querySelector('#pt'), { rows: pays, noPager: true, rowHref: x => '#/billing/receipts/' + x.id, cols: [
        { key: 'c', label: 'Mã phiếu', render: x => esc(x.code) }, { key: 'd', label: 'Ngày thực nhận', render: x => F.date(x.receivedAt) }, { key: 't', label: 'Loại', render: x => ({ invoice: 'Thu hóa đơn', deposit: 'Cọc', prepay: 'Trả trước' }[x.type] || x.type) },
        { key: 'a', label: 'Số tiền', num: true, render: x => F.vnd(x.amount) + (x.status === 'reversed' ? ' ' + U.chip('Đã đảo', 'gray') : '') }] });
      else tb.querySelector('#pt').innerHTML = U.empty({ icon: 'lock', title: 'Không có quyền xem phiếu thu' });
    }
    if (tab === 'zalo') {
      const msgs = S.where('zaloMessages', m => m.stayId === s.id);
      const inbox = TH.ms.on('2') && (TH.auth.can('zalo.inbox') || TH.auth.can('zalo.view')) && Q.inboxScoped ? Q.inboxScoped().filter(x => x.stayId === s.id) : null;
      tb.innerHTML = U.card({ title: 'Lịch sử tin Zalo', icon: 'message', body: msgs.map(m => `<div class="mini-row"><span>${F.datetime(m.sentAt)}</span><span class="grow">${esc(m.text || TH.calc.zalo.EVENTS[m.event])}</span>${({ delivered: U.chip('Đã nhận', 'green'), failed: U.chip('Lỗi ' + (m.error || ''), 'red'), skipped_paid: U.chip('Bỏ qua – đã thanh toán', 'gray'), queued: U.chip('Chờ gửi', 'blue') })[m.status] || ''}</div>`).join('') || '<span class="muted small">Chưa có tin</span>' });
      if (inbox) { tb.insertAdjacentHTML('beforeend', '<div class="mt16">' + K.tableCard('ibx', 'Phản hồi của khách (hộp thư Zalo – Phase 2)') + '</div>'); TH.pages.inboxTable(tb.querySelector('#ibx'), inbox); }
    }
    U.bind(root, {
      tab: (el) => TH.router.setQuery({ tab: el.dataset.key }),
      end: () => endModal(s),
      notice: () => K.formDrawer({ title: 'Khách báo trả phòng ' + room.code, modal: true, size: 'sm', fields: [{ name: 'noticeDate', label: 'Ngày báo trả', type: 'date', req: true, value: s.noticeDate || F.today() }, { name: 'plannedLeaveDate', label: 'Ngày dự kiến bàn giao', type: 'date', req: true, value: s.plannedLeaveDate || '' }],
        submit: 'Lưu', onSubmit: (x) => { X.setNotice(s.id, x); U.toast('ok', 'Đã ghi báo trả', 'Có thể nhận khách chờ vào từ ngày sau ngày bàn giao'); } }),
      activate: () => K.formDrawer({ title: 'Khách nhận phòng ' + room.code, modal: true, size: 'sm', fields: [{ name: 'date', label: 'Ngày nhận phòng', type: 'date', req: true, value: s.rentStart }], submit: 'Xác nhận', onSubmit: (x) => { X.activateStay(s.id, x.date); U.toast('ok', 'Khách đã nhận phòng'); } }),
      renew: () => K.formDrawer({ title: 'Gia hạn ' + s.code, sub: 'Hết hạn hiện tại ' + F.date(s.endDate), fields: [{ name: 'endDate', label: 'Ngày hết hạn mới', type: 'date', req: true, value: F.addMonths(s.endDate, 12) }, { name: 'rent', label: 'Giá thuê mới (nếu đổi)', type: 'money' }], submit: 'Gia hạn', onSubmit: (x) => { X.renewStay(s.id, x); U.toast('ok', 'Đã gia hạn'); } }),
      transfer: () => transferDrawer(s),
      mkrefund: () => { const r = K.act(() => X.createRefund(s.id), 'Đã lập phiếu hoàn'); if (r) TH.go('#/refunds/' + r.id); },
      editc: () => K.formDrawer({ title: 'Sửa thông tin khách', fields: [{ name: 'name', label: 'Họ tên', value: c.name, req: true }, { name: 'phone', label: 'SĐT', value: c.phone }, { name: 'occupation', label: 'Nghề nghiệp', type: 'select', options: ['Sinh viên', 'Người đi làm'], value: c.occupation }, { name: 'zaloLinked', type: 'check', label: 'Đã liên kết Zalo', value: c.zaloLinked }],
        onSubmit: (x) => { X.updateCustomer(c.id, x); U.toast('ok', 'Đã lưu'); } }),
      newrate: () => { const cur = Q.rateOf(s.id) || { items: {} };
        const d = K.formDrawer({ title: 'Thêm phiên giá – ' + s.code, sub: 'Không chồng ngày hiệu lực; không ghi đè hóa đơn đã phát hành', wide: true, fields: [
          { name: 'from', label: 'Hiệu lực từ', type: 'date', req: true, value: F.nextPeriod(F.period(F.today())) + '-01' }, { name: 'rent', label: 'Giá thuê/tháng', type: 'money', value: cur.rent },
          ...FEE.map(([k, l]) => ({ name: 'u_' + k, label: l + ' – đơn giá (' + methodLabel((cur.items[k] || {}).method || k.split('|')[0]) + ')', type: 'money', value: (cur.items[k] || {}).unit || '' })),
          { name: 'reason', label: 'Nguồn / lý do', type: 'textarea', req: true, span: true, help: 'VD: phụ lục ngày…, hỗ trợ giá đến hết HĐ' }],
          submit: 'Lưu phiên giá', onSubmit: (x) => { const items = JSON.parse(JSON.stringify(cur.items || {})); FEE.forEach(([k]) => { const u = x['u_' + k]; if (u) items[k] = Object.assign({ method: k === 'electric' ? 'meter' : 'person' }, items[k] || {}, { unit: u }); else delete items[k]; });
            const r = X.addRateVersion(s.id, { from: x.from, rent: x.rent, items, reason: x.reason }); U.toast(r.warnIssued.length ? 'warn' : 'ok', 'Đã lưu phiên giá', r.warnIssued.length ? 'Các kỳ đã phát hành giữ giá cũ: ' + r.warnIssued.join(', ') : ''); } }); },
    });
    if (q.open === 'end') endModal(s);
  });
})(window.TH);
