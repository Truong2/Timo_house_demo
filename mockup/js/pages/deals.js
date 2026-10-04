/* UI-21 Giao dịch chốt – danh sách và chi tiết; E09 thao tác: nhận phòng, đổi phòng, hủy, khách bỏ cọc. Đặc tả §3.5 dòng 295–299.
   Deal thay "lượt thuê chờ nhận" của Phase 1; liên kết lượt thuê (UI-07), phiếu cọc (UI-13), hóa đơn đầu (UI-11), hoa hồng (UI-22). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, A = TH.auth;
  const phone = (p) => A.can('customers.phone') ? esc(p) : esc(F.mask(p, 3));
  const stChip = (d) => U.chip(Q.DEAL_ST[d.status][0], Q.DEAL_ST[d.status][1], true);
  const depChip = (d) => { const x = Q.dealDeposit(d); return d.status === 'forfeited' ? U.chip('Cọc → doanh thu', 'red') : x.state === 'full' ? U.chip('Cọc: đủ', 'green') : x.state === 'partial' ? U.chip('Cọc: thiếu', 'amber') : U.chip('Cọc: chưa thu', 'gray'); };
  const EV = { close: 'Chốt', receive: 'Nhận phòng', transfer: 'Đổi phòng', cancel: 'Hủy', forfeit: 'Bỏ cọc', movein: 'Đổi ngày nhận dự kiến' };
  const firstChip = (d) => { const c = Q.dealCollect(d); return c.first === 'none' ? '' : c.first === 'full' ? U.chip('Tháng đầu: đủ', 'green') : c.first === 'partial' ? U.chip('Tháng đầu: thiếu', 'amber') : U.chip('Tháng đầu: chưa thu', 'gray'); };

  TH.router.handle('/sales/deals', (root, p, q) => {
    const all = Q.dealRows(), rows = Q.dealRows(q);
    const live = rows.filter(x => !['cancelled', 'forfeited'].includes(x.deal.status));
    const paidLabel = x => x.paidState === 'full' ? U.chip('Đã đủ', 'green') : x.paidState === 'partial' ? U.chip('Còn thiếu', 'amber') : U.chip('Chưa thu', 'gray');
    root.innerHTML = U.pageHead({ title: 'Giao dịch chốt', sub: 'Ngày chốt, ngày vào ở, ngày tính tiền là ba trường riêng · hủy / đổi phòng / bỏ cọc ghi sự kiện riêng để doanh số, cọc, hoa hồng không bị đếm hai lần', acts: [U.btn({ label: 'Xuất', icon: 'download', act: 'exp' })] })
      + TH.salesNav('deals')
      + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Chờ nhận', value: rows.filter(x => x.deal.status === 'closed').length, cap: rows.filter(x => x.deal.status === 'closed' && x.depositRemaining > 0).length + ' chưa thu đủ cọc', icon: 'clock', tone: 'blue' })}
        ${U.kpi({ label: 'Đã nhận', value: rows.filter(x => x.deal.status === 'received').length, icon: 'log-in', tone: 'green' })}${U.kpi({ label: 'Hủy / bỏ cọc', value: rows.filter(x => ['cancelled', 'forfeited'].includes(x.deal.status)).length, icon: 'x-circle', tone: 'red' })}
        ${U.kpi({ label: 'Doanh số (Σ giá chốt)', value: F.vnd(live.reduce((t, x) => t + x.deal.price, 0)), cap: 'không gồm deal hủy / bỏ cọc (OQ-25)', icon: 'trending-up', tone: 'purple' })}</div>`
      + K.filters([{ name: 'q', type: 'search', label: 'Tìm', placeholder: 'Mã, phòng, khách, SĐT, đối tác' }, { name: 'period', label: 'Tháng chốt', options: [...new Set(all.map(x => F.period(x.deal.closeDate)))].sort().reverse().map(x => [x, F.periodLabel(x)]) },
        { name: 'status', label: 'Trạng thái', options: Object.entries(Q.DEAL_ST).map(([k, v]) => [k, v[0]]) }, { name: 'building', label: 'Tòa', options: K.buildingOpts(false) }, { name: 'sale', label: 'Sale', options: Q.salesStaff().filter(e => A.inSales([e.id])).map(e => [e.id, e.name]) }], q)
      + '<div class="mt16">' + K.tableCard('t', rows.length + ' giao dịch') + '</div>';
    K.bindFilters(root);
    U.table(root.querySelector('#t'), { rows, pageSize: 25, rowHref: x => '#/sales/deals/' + x.deal.id, cols: [
      { key: 'd', label: 'Ngày giao dịch', sortable: true, sortVal: x => x.deal.closeDate, render: x => U.cell2(F.date(x.deal.closeDate), esc(x.deal.code)) }, { key: 'r', label: 'Tòa / phòng', render: x => K.room(x.deal.roomId) },
      { key: 'm', label: 'Quản lý', render: x => U.cell2(esc(x.manager?.name || '–'), 'tại ngày chốt') }, { key: 'k', label: 'Khách / SĐT', render: x => U.cell2(esc(x.customer.name || ''), esc(x.phone || '')) },
      { key: 'dep', label: 'Cọc / thanh toán', num: true, render: x => U.cell2(`${F.vnd(x.depositHeld)} / ${F.vnd(x.depositRequired)}`, `${paidLabel(x)}${x.depositRemaining ? ' · thiếu ' + F.vnd(x.depositRemaining) : ''}`) }, { key: 'p', label: 'Giá chốt', num: true, sortable: true, sortVal: x => x.deal.price, render: x => F.vnd(x.deal.price) },
      { key: 'b', label: 'Tính tiền / thời hạn', render: x => U.cell2(F.date(x.deal.billingStart), x.deal.term + ' tháng') }, { key: 's', label: 'Nguồn / công cụ', render: x => U.cell2(esc(x.deal.source), esc(x.deal.partner || x.deal.group || '')) },
      { key: 'sl', label: 'Sale / cách chia', render: x => U.cell2(esc(x.sales), x.saleIds.length > 1 ? `Chia ${x.saleIds.length} sale` : 'Một sale') }, { key: 'kd', label: 'Nhận phòng', render: x => esc(x.dealKind) }, { key: 'nt', label: 'Ghi chú', render: x => `<span class="small muted">${esc(x.deal.note || '')}</span>` },
      ...(A.can('commission.view') ? [{ key: 'cm', label: 'Hoa hồng', render: x => x.commissions.length ? U.link('#/sales/commission?deal=' + x.deal.id, x.commissions.length + ' dòng · ' + F.vnd(x.commissionAmount)) + `<br><small>${esc(x.commissionStatus)}</small>` : '–' }] : []),
      { key: 'st', label: 'Trạng thái', render: x => stChip(x.deal) }] });
    U.bind(root, { exp: () => K.csv('giao-dich-chot.csv', ['Mã', 'Ngày giao dịch', 'Mã tòa', 'Mã phòng', 'Quản lý tại ngày chốt', 'Khách', 'SĐT', 'Cọc phải thu', 'Cọc đã thu', 'Cọc còn thiếu', 'Trạng thái thanh toán', 'Giá chốt', 'Ngày tính tiền', 'Thời hạn HĐ (tháng)', 'Nguồn', 'Đối tác/công cụ', 'Sale', 'Cách chia', 'Hoa hồng', 'Trạng thái hoa hồng', 'Loại nhận phòng', 'Trạng thái giao dịch', 'Ghi chú'],
      rows.map(x => [x.deal.code, x.deal.closeDate, x.building.code, x.room.code, x.manager?.name || '', x.customer.name || '', x.phone, x.depositRequired, x.depositHeld, x.depositRemaining, x.paidState, x.deal.price, x.deal.billingStart, x.deal.term, x.deal.source, x.deal.partner || x.deal.group || '', x.sales, x.saleIds.length > 1 ? `Chia ${x.saleIds.length} sale` : 'Một sale', A.can('commission.view') ? x.commissionAmount : '', A.can('commission.view') ? x.commissionStatus : '', x.dealKind, Q.DEAL_ST[x.deal.status][0], x.deal.note || ''])) });
  });

  TH.router.handle('/sales/deals/:id', (root, p) => {
    const d = Q.deal(p.id); if (!d) { root.innerHTML = U.card({ body: U.empty({ title: 'Không tìm thấy giao dịch' }) }); return; }
    if (!A.inSales(d.saleIds)) { root.innerHTML = U.card({ body: U.empty({ icon: 'lock', title: 'Giao dịch ngoài phạm vi kinh doanh của bạn' }) }); return; }
    TH.layout.crumb([{ label: 'Giao dịch chốt', href: '#/sales/deals' }, { label: d.code }]);
    const c = Q.customer(d.customerId) || {}; const s = d.stayId ? Q.stay(d.stayId) : null; const l = Q.lead(d.leadId);
    const inv = s ? S.where('invoices', i => i.stayId === s.id && i.lifecycle !== 'draft').sort((a, b) => a.period.localeCompare(b.period))[0] : null;
    const open = d.status === 'closed';
    // Phòng còn khách cũ: phải kết thúc lượt cũ (UI-07) trước khi nhận phòng – chỉ dẫn thay vì để nút "Nhận phòng" báo lỗi
    const old = open && Q.currentStay(d.roomId);
    const oldNote = old ? U.note('warn', 'Phòng còn khách cũ ' + esc(old.code), (old.plannedLeaveDate ? `Khách báo trả ${F.date(old.noticeDate)}, dự kiến bàn giao ${F.date(old.plannedLeaveDate)}. ` : `Hợp đồng đến ${F.date(old.endDate)}, chưa có ngày báo trả. `)
      + 'Kết thúc lượt thuê cũ trước khi nhận phòng' + (A.can('tenants.view') ? ` – <a href="#/stays/${old.id}">mở lượt thuê ${esc(old.code)}</a>` : '') + '.') : '';
    root.innerHTML = U.pageHead({ title: 'Giao dịch ' + esc(d.code) + ' ' + stChip(d), back: '#/sales/deals', sub: `Phòng ${esc(Q.roomCode(d.roomId))} · ${esc(c.name || '')} · sale ${esc(Q.saleName(d.saleIds))}${d.partner ? ' · đối tác ' + esc(d.partner) : ''}`, acts: open ? [
      U.btn({ label: 'Nhận phòng', icon: 'log-in', cls: 'btn-primary', act: 'receive', perm: 'tenants.manage' }), U.btn({ label: 'Sửa ngày nhận', icon: 'calendar', act: 'movein', perm: 'deals.close' }), U.btn({ label: 'Đổi phòng', icon: 'arrow-left-right', act: 'transfer', perm: 'deals.cancel' }),
      U.btn({ label: 'Khách bỏ cọc', icon: 'minus-circle', act: 'forfeit', perm: 'deals.cancel' }), U.btn({ label: 'Hủy giao dịch', icon: 'x', act: 'cancel', perm: 'deals.cancel' })] : [] })
      + oldNote + `<div class="two-col${old ? ' mt16' : ''}"><div class="side-stack">${U.card({ title: 'Thông tin giao dịch', icon: 'briefcase', body: U.kv([['Ngày chốt', F.date(d.closeDate)], ['Ngày vào ở', F.date(d.moveInDate)], ['Ngày tính tiền phòng', F.date(d.billingStart)], ['Thời hạn HĐ', d.term + ' tháng'],
          ['Giá chốt', F.vndd(d.price)], ['Tiền cọc', F.vndd(d.deposit) + ' ' + depChip(d)], ['Loại nhận phòng', esc(Q.dealKind(d))], ['Nguồn', esc(d.source) + (d.group ? ' · ' + esc(d.group) : '')], ['Quản lý tòa', esc((Q.managerOf(d.buildingId) || {}).name || '–')], ['Khách', esc(c.name || '') + ' · ' + phone(c.phone)]])
          + (d.forfeit ? U.note('danger', 'Khách bỏ cọc ' + F.date(d.forfeit.date), `Cọc ${F.vndd(d.forfeit.deposit)} → doanh thu dòng 5 "Cọc khách bỏ không ở". Không công nợ, không phiếu hoàn. Cơ sở hoa hồng = cọc − ${d.forfeit.days} ngày đã tính tiền = ${F.vndd(d.forfeit.base)}.`) : '') })}
        ${U.card({ title: 'Liên kết', icon: 'external-link', body: U.kv([['Lượt thuê (UI-07)', s ? (A.can('tenants.view') ? `<a href="#/stays/${s.id}">${esc(s.code)}</a>` : esc(s.code)) + ' · ' + ({ pending: 'chờ nhận', active: 'đang ở', ended: 'đã kết thúc', cancelled: 'đã hủy' }[s.status] || esc(s.status)) : '–'],
          ['Phiếu cọc (UI-13)', s && A.can('payments.record') && open ? `<a href="#/billing/receipts/new?stay=${s.id}&type=deposit">Ghi phiếu cọc</a>` : F.vndd(Q.dealDeposit(d).held) + ' đã thu'], ['Hóa đơn đầu (UI-11)', inv ? (A.can('invoices.view') ? `<a href="#/billing/invoices/${inv.id}">${esc(inv.code)}</a>` : esc(inv.code)) : 'Chưa phát hành'],
          ['Ghi chú', esc(d.note || '–')], ['Khách xem (UI-20)', l ? U.link('#/sales/leads?q=' + encodeURIComponent(l.code), esc(l.code)) + ' · ' + Q.viewingsOf(l.id).length + ' lượt xem' : '–']]) })}</div>
      <div class="side-stack">${U.card({ title: 'Lịch sử sự kiện', icon: 'history', body: U.timeline((d.events || []).slice().reverse().map(e => ({ when: F.date(e.at), title: (EV[e.type] || e.type) + (e.from ? ` ${e.from} → ${e.to}` : ''), sub: esc([e.by, e.note].filter(Boolean).join(' · ')), color: { close: 'blue', receive: 'green', transfer: 'amber', cancel: 'gray', forfeit: 'red' }[e.type] }))) })}
        ${s && A.can('documents.download') ? U.card({ title: 'Hợp đồng khách (UI-26)', icon: 'file-text', body: TH.pages.docDownloadList(Q.downloadableDocs(x => x.objectType === 'stay' && x.objectId === s.id)) }) : ''}
        ${A.can('commission.view') ? U.card({ title: 'Hoa hồng (UI-22)', icon: 'hand-coins', actions: U.btn({ label: 'Mở', size: 'btn-xs', href: '#/sales/commission?deal=' + d.id }), body: commissionBox(d) }) : ''}</div></div>`;
    U.bind(root, { docdl: (el) => TH.pages.docDownload(el.dataset.id),
      receive: () => K.formDrawer({ title: 'Khách nhận phòng – ' + d.code, modal: true, note: oldNote || undefined, fields: [{ name: 'date', label: 'Ngày nhận phòng', type: 'date', value: d.moveInDate > F.today() ? F.today() : d.moveInDate, req: true }], submit: 'Xác nhận', onSubmit: (x) => { X.receiveDeal(d.id, x.date); U.toast('ok', 'Khách đã nhận phòng'); } }),
      movein: () => K.formDrawer({ title: 'Sửa ngày nhận dự kiến – ' + d.code, modal: true, note: U.note('info', '', 'Ghi thành sự kiện riêng; lượt thuê chờ nhận đổi theo. Ngày tính tiền phòng giữ nguyên.'),
        fields: [{ name: 'date', label: 'Ngày nhận dự kiến', type: 'date', value: d.moveInDate, req: true }, { name: 'reason', label: 'Lý do', req: true, span: true }], submit: 'Lưu', onSubmit: (x) => { X.setDealMoveIn(d.id, x.date, x.reason); U.toast('ok', 'Đã đổi ngày nhận dự kiến'); } }),
      transfer: () => K.formDrawer({ title: 'Đổi phòng – ' + d.code, modal: true, note: U.note('info', '', 'Lượt thuê chờ nhận chuyển sang phòng mới; hoa hồng giữ theo giao dịch (đặc tả: đổi phòng giữ hoa hồng phòng cũ).'),
        fields: [{ name: 'toRoomId', label: 'Phòng mới', type: 'select', req: true, options: Q.forSale().filter(x => x.room.id !== d.roomId).map(x => [x.room.id, x.room.code + ' · ' + F.vnd(x.room.price)]) }, { name: 'price', label: 'Giá chốt mới (bỏ trống = giữ)', type: 'money' }, { name: 'reason', label: 'Lý do', req: true, span: true }],
        submit: 'Đổi phòng', onSubmit: (x) => { X.transferDeal(d.id, Object.assign({}, x, { price: F.num(x.price) })); U.toast('ok', 'Đã đổi phòng'); } }),
      cancel: () => K.formDrawer({ title: 'Hủy giao dịch – ' + d.code, modal: true, note: U.note('warn', '', 'Chỉ hủy khi khách chưa nộp cọc. Không tính doanh số, không tính hoa hồng; phòng mở bán lại.'), fields: [{ name: 'reason', label: 'Lý do', req: true, span: true }],
        submit: 'Hủy giao dịch', onSubmit: (x) => { X.cancelDeal(d.id, x.reason); U.toast('ok', 'Đã hủy giao dịch'); } }),
      forfeit: () => K.formDrawer({ title: 'Khách bỏ cọc – ' + d.code, modal: true, note: U.note('warn', '', 'Cọc đã thu chuyển doanh thu dòng 5; không công nợ, không phiếu hoàn; phòng mở bán lại; hoa hồng tính lại trên cọc − tiền ngày đã ở.'),
        fields: [{ name: 'date', label: 'Ngày khách báo bỏ', type: 'date', value: F.today(), req: true }, { name: 'reason', label: 'Lý do', req: true, span: true }], submit: 'Ghi bỏ cọc', onSubmit: (x) => { X.forfeitDeal(d.id, x); U.toast('ok', 'Đã ghi khách bỏ cọc'); } }),
    });
  });
  const commissionBox = (d) => {
    const cs = Q.commissionsOf(d.id); const el = Q.dealEligibility(d);
    const mode = Q.param('commissionRecognitionMode', el.date || F.today()), eligibleCopy = mode === 'eligibleAt'
      ? U.note('warn', 'Đủ điều kiện chi · phương án OQ-13', 'Từ ' + F.date(el.date) + ' – nếu chọn phương án đề xuất, kỳ đủ điều kiện là ' + F.periodShort(F.period(el.date)) + '.')
      : U.note('ok', 'Đủ điều kiện chi', 'Từ ' + F.date(el.date) + ' – chi phí chỉ ghi theo tháng thực chi của từng lần chi.');
    return (cs.length ? `<table class="tbl compact"><thead><tr><th>Người nhận</th><th class="num">H</th><th class="num">Thành tiền</th><th>Trạng thái</th></tr></thead><tbody>${cs.map(c => `<tr><td>${esc(c.recipient.name)}</td><td class="num">${(c.H * 100).toFixed(2).replace('.', ',')}%</td><td class="num">${F.vnd(c.approvedAmount || c.amount)}</td><td>${U.chip(Q.CM_ST[c.status][0], Q.CM_ST[c.status][1])}</td></tr>`).join('')}</tbody></table>` : U.empty({ title: 'Chưa có dòng hoa hồng' }))
      + (el.ok ? eligibleCopy : U.note('warn', 'Chưa đủ điều kiện chi (CH-19)', el.missing.join(' · ')));
  };
})(window.TH);
