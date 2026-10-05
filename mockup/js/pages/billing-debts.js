/* UI-14 Công nợ & tiến độ thu: mặc định sau 5 ngày lịch từ ngày phát hành; chế độ dueDate giữ để đối chiếu. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, esc = F.esc;
  TH.router.handle('/billing/debts', (root, p, q) => {
    const asOf = q.asOf || F.today();
    const group = q.group || 'main';
    const full = TH.auth.can('debts.viewAmounts');
    const mm = Q.managerMap(asOf);
    let rows = Q.debtAging(asOf).filter(x => x.invoice.lifecycle !== 'draft' && x.invoice.issueDate <= asOf).map(x => ({ ...x, i: x.invoice, st: x.payment }));
    rows = rows.filter(x => group === 'broken' ? x.contractState === 'breach' : group === 'ended' ? ['ended', 'pending_settlement'].includes(x.contractState) : !['breach', 'ended', 'pending_settlement'].includes(x.contractState));
    if (q.state) rows = rows.filter(x => x.st.debt.state === q.state); else if (group !== 'broken') rows = rows.filter(x => x.st.debt.state === 'debt');
    if (q.bucket) rows = rows.filter(x => x.bucket === q.bucket);
    if (q.building) rows = rows.filter(x => x.i.buildingId === q.building);
    if (q.period) rows = rows.filter(x => x.i.period === q.period);
    if (q.manager) rows = rows.filter(x => (mm[x.i.buildingId] || {}).id === q.manager);
    if (q.leader) { const br = TH.auth.branchOf(q.leader, asOf); rows = rows.filter(x => br.has((mm[x.i.buildingId] || {}).id)); }
    const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
    const byBucket = k => rows.filter(x => x.bucket === k);
    const issuedBasis = (Q.param('debtBasis', asOf) || 'issuedAt') === 'issuedAt';
    const debtRule = issuedBasis ? `sau ${Q.param('debtAfterDueDays') || 5} ngày lịch từ ngày phát hành` : `sau hạn thanh toán ${Q.param('debtAfterDueDays') || 5} ngày (chế độ tương thích)`;
    root.innerHTML = TH.pages.billingTabs('debts') + U.pageHead({ title: 'Công nợ & tiến độ thu', sub: `Tính đến ${F.date(asOf)} · khoản chưa đủ chuyển thành công nợ ${debtRule}`, acts: [
      U.btn({ label: 'Xuất danh sách nhắc nợ', icon: 'download', act: 'exp' }), U.btn({ label: 'Nhắc qua Zalo', icon: 'message', href: '#/zalo?tab=dot-gui&rule=zr_overdue', perm: 'zalo.send' })] })
      + U.statusTabs([{ key: 'main', label: 'Hợp đồng đang vận hành' }, { key: 'ended', label: 'Hợp đồng kết thúc' }, { key: 'broken', label: 'Phá HĐ / bỏ trốn' }], group, 'grp')
      + `<div class="grid grid-5 mt16 mb16">${['1-30','31-60','61-90','91-180','181+'].map((k, i) => U.kpi({ label: k + ' ngày', value: full ? F.vnd(sum(byBucket(k), x => x.st.remaining)) : byBucket(k).length + ' HĐ', cap: byBucket(k).length + ' hóa đơn', icon: i > 2 ? 'alert-triangle' : 'clock', tone: i > 2 ? 'red' : i > 0 ? 'amber' : 'blue' })).join('')}</div>`
      + K.filters([{ name: 'asOf', type: 'date', label: 'Tính đến ngày', value: asOf }, { name: 'state', label: 'Trạng thái', options: [['debt', 'Công nợ'], ['overdue', 'Quá hạn < 5 ngày'], ['in_term', 'Trong hạn']] }, { name: 'bucket', label: 'Tuổi nợ', options: [['1-30', '1–30 ngày'], ['31-60', '31–60 ngày'], ['61-90', '61–90 ngày'], ['91-180', '91–180 ngày'], ['181+', '181+ ngày']] }, { name: 'period', label: 'Kỳ', options: K.periodOpts() },
        { name: 'building', label: 'Tòa', options: K.buildingOpts() }, { name: 'manager', label: 'NV nhắc thu', options: K.managerOpts() }, { name: 'leader', label: 'Leader / team', options: Q.teamLeaders().map(e => [e.id, e.name]) }], q)
      + (group === 'broken' ? U.note('info', 'Phá HĐ / bỏ trốn', 'Số phải thu chỉ gồm tiền điện theo chỉ số (giữ cọc); không cộng vào tỷ lệ thu chính.') : '')
      + (!full ? U.note('info', 'Chế độ xem theo quyền', 'Vai trò của bạn thấy trạng thái và số còn nợ của phòng được giao; tổng tiền và phiếu thu chỉ kế toán/admin xem (CH-01).') : '')
      + '<div class="mt16">' + K.tableCard('t', `${rows.length} khoản`, '', 'Định danh bằng mã phòng + mã tòa (SRC-02!E4); tên khách xem ở chi tiết') + '</div>';
    K.bindFilters(root, ['group']);
    U.table(root.querySelector('#t'), { rows, pageSize: 25, stickyFirst: true, onRowOpen: (x) => drawer(x.i, asOf), cols: [
      { key: 'r', label: 'Phòng', sortable: true, sortVal: x => Q.roomCode(x.i.roomId), render: x => `<b class="code">${esc(Q.roomCode(x.i.roomId))}</b>` + (TH.actions.isOwnerTenantInv(x.i) ? ' ' + U.chip('Khách chủ nhà', 'teal') : '') + (x.i.kind === 'deposit_excess' ? ' ' + U.chip('Vượt cọc', 'purple') : '') },
      { key: 'kh', label: 'Mã KH', render: x => esc(x.i.customerCode) }, { key: 'p', label: 'Kỳ', render: x => F.periodShort(x.i.period) }, { key: 'due', label: 'Hạn', render: x => F.date(x.i.dueTo) },
      { key: 'd', label: 'Phải thu', num: true, render: x => full ? F.vnd(x.i.totalDue) : '•••' }, { key: 'pd', label: 'Đã phân bổ', num: true, render: x => full ? F.vnd(x.st.paid) : '•••' },
      { key: 'rm', label: 'Còn nợ', num: true, sortable: true, sortVal: x => x.st.remaining, render: x => `<b class="red">${full ? F.vnd(x.st.remaining) : '•••'}</b>` },
      { key: 'days', label: 'Tuổi nợ', num: true, sortable: true, sortVal: x => x.ageDays, render: x => x.ageDays ? `${x.ageDays} ngày · ${U.chip(x.bucket, x.bucket === '181+' ? 'red' : 'gray')}` : '–' },
      { key: 'lp', label: 'Thu gần nhất', render: x => x.st.lastPaid ? F.date(x.st.lastPaid) : '–' },
      { key: 'mg', label: 'NV nhắc thu', render: x => esc((mm[x.i.buildingId] || {}).name || 'Chưa phân công') },
      { key: 'ld', label: 'Leader', render: x => esc((Q.leaderOf((mm[x.i.buildingId] || {}).id, asOf) || {}).name || '') },
      { key: 'z', label: 'Nhắc Zalo gần nhất', render: x => { const m = S.where('zaloMessages', z => z.invoiceId === x.i.id).sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt)))[0]; return m ? F.date(m.sentAt) + ' ' + (m.status === 'delivered' ? U.chip('Đã nhận', 'green') : U.chip('Lỗi', 'red')) : '–'; } },
      { key: 'st', label: '', render: x => K.debtChip(x.st.debt) }] });
    U.bind(root, { grp: (el) => TH.router.setQuery({ group: el.dataset.key, state: '', bucket: '' }), exp: () => K.csv('nhac-no-' + asOf + '.csv', ['Phòng', 'Mã KH', 'Kỳ', 'Hạn', 'Còn nợ', 'Tuổi nợ (ngày)', 'Bucket', 'NV nhắc thu'], rows.map(x => [Q.roomCode(x.i.roomId), x.i.customerCode, x.i.period, x.i.dueTo, full ? Math.round(x.st.remaining) : 'Ẩn theo quyền', x.ageDays, x.bucket, (mm[x.i.buildingId] || {}).name || ''])) });
  });
  /* E15: lịch sử thu của khoản */
  const drawer = (inv, asOf) => {
    const st = Q.invState(inv, asOf); const s = Q.stay(inv.stayId); const c = Q.customer(s.customerId) || {};
    const pays = S.all('payments').filter(x => x.allocations.some(a => a.invoiceId === inv.id));
    const d = U.drawer({ title: 'Chi tiết công nợ ' + Q.roomCode(inv.roomId), sub: inv.code, body: `${U.kv([['Khách', esc(c.name || '')], ['SĐT', esc(Q.pii(c.phone || ''))], ['Kỳ', F.periodLabel(inv.period)], ['Còn nợ', '<b class="red">' + Q.money(st.remaining) + '</b>'], ['Trạng thái', K.payChip(st.status) + ' ' + K.debtChip(st.debt)]])}
      <h4 class="mt16 mb8">Lịch sử thu (${pays.length} lần)</h4>${TH.auth.can('payments.view') ? pays.map(x => `<div class="mini-row"><span>${F.date(x.receivedAt)}</span><span class="grow">${esc(x.code)} · ${x.method === 'cash' ? 'tiền mặt' : 'CK'} · nhận: ${esc(x.receivedBy || '')}</span><b>${F.vnd(x.allocations.filter(a => a.invoiceId === inv.id).reduce((t, a) => t + a.amount, 0))}</b></div>`).join('') || '<span class="muted small">Chưa thu</span>' : '<span class="muted small">Chỉ kế toán/admin xem chi tiết phiếu thu</span>'}`,
      footer: `<a class="btn btn-ghost" href="#/billing/invoices/${inv.id}">Mở hóa đơn</a>${TH.auth.can('payments.record') ? `<a class="btn btn-primary" href="#/billing/receipts/new?stay=${s.id}&invoice=${inv.id}">Ghi thu</a>` : ''}` });
    return d;
  };
})(window.TH);
