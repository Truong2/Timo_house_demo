/* UI-14 Công nợ & tiến độ thu: khoản còn nợ sau ngày 5 tháng N (GĐ OQ-12); nhóm phá HĐ riêng; leader/vận hành chỉ thấy trạng thái + số còn nợ. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, esc = F.esc;
  TH.router.handle('/billing/debts', (root, p, q) => {
    const asOf = q.asOf || F.today();
    const group = q.group || 'main';
    const full = TH.auth.can('debts.viewAmounts');
    const mm = Q.managerMap(asOf);
    let base = Q.scoped(S.all('invoices')).filter(i => i.lifecycle !== 'draft' && i.issueDate <= asOf);
    base = base.filter(i => group === 'broken' ? i.isBreach : !i.isBreach);
    const withSt = base.map(i => ({ i, st: Q.invState(i, asOf) })).filter(x => x.st.remaining > 0.5);
    let rows = withSt.filter(x => q.state ? x.st.debt.state === q.state : (group === 'broken' ? true : x.st.debt.state === 'debt'));
    if (q.building) rows = rows.filter(x => x.i.buildingId === q.building);
    if (q.period) rows = rows.filter(x => x.i.period === q.period);
    if (q.manager) rows = rows.filter(x => (mm[x.i.buildingId] || {}).id === q.manager);
    if (q.leader) { const br = TH.auth.branchOf(q.leader, asOf); rows = rows.filter(x => br.has((mm[x.i.buildingId] || {}).id)); }
    const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
    const byState = (k) => withSt.filter(x => x.st.debt.state === k);
    root.innerHTML = TH.pages.billingTabs('debts') + U.pageHead({ title: 'Công nợ & tiến độ thu', sub: `Tính đến ${F.date(asOf)} · khoản chưa đủ chuyển thành công nợ từ ngày ${Q.param('debtAfterDueDays') + 1} tháng N (hạn cuối tháng N−1 + ${Q.param('debtAfterDueDays')} ngày)`, acts: [
      U.btn({ label: 'Xuất danh sách nhắc nợ', icon: 'download', act: 'exp' }), U.btn({ label: 'Nhắc qua Zalo', icon: 'message', href: '#/zalo?tab=dot-gui&rule=zr_overdue', perm: 'zalo.send' })] })
      + U.statusTabs([{ key: 'main', label: 'Công nợ chính' }, { key: 'broken', label: 'Nhóm phá HĐ / bỏ trốn' }], group, 'grp')
      + `<div class="grid grid-4 mt16 mb16">${U.kpi({ label: 'Công nợ (quá mốc)', value: full ? F.vnd(sum(byState('debt'), x => x.st.remaining)) : byState('debt').length + ' HĐ', cap: byState('debt').length + ' hóa đơn', icon: 'alert-triangle', tone: 'red' })}
        ${U.kpi({ label: 'Quá hạn chưa thành công nợ', value: full ? F.vnd(sum(byState('overdue'), x => x.st.remaining)) : byState('overdue').length + ' HĐ', cap: byState('overdue').length + ' hóa đơn (trong 5 ngày sau hạn)', icon: 'clock', tone: 'amber' })}
        ${U.kpi({ label: 'Còn trong hạn', value: full ? F.vnd(sum(byState('in_term'), x => x.st.remaining)) : byState('in_term').length + ' HĐ', cap: byState('in_term').length + ' hóa đơn', icon: 'calendar', tone: 'blue' })}
        ${U.kpi({ label: 'Tổng còn phải thu', value: full ? F.vnd(sum(withSt, x => x.st.remaining)) : withSt.length + ' HĐ', icon: 'coins' })}</div>`
      + K.filters([{ name: 'asOf', type: 'date', label: 'Tính đến ngày', value: asOf }, { name: 'state', label: 'Trạng thái', options: [['debt', 'Công nợ'], ['overdue', 'Quá hạn < 5 ngày'], ['in_term', 'Trong hạn']] }, { name: 'period', label: 'Kỳ', options: K.periodOpts() },
        { name: 'building', label: 'Tòa', options: K.buildingOpts() }, { name: 'manager', label: 'NV nhắc thu', options: K.managerOpts() }, { name: 'leader', label: 'Leader / team', options: Q.teamLeaders().map(e => [e.id, e.name]) }], q)
      + (group === 'broken' ? U.note('info', 'Phá HĐ / bỏ trốn', 'Số phải thu chỉ gồm tiền điện theo chỉ số (giữ cọc); không cộng vào tỷ lệ thu chính.') : '')
      + (!full ? U.note('info', 'Chế độ xem theo quyền', 'Vai trò của bạn thấy trạng thái và số còn nợ của phòng được giao; tổng tiền và phiếu thu chỉ kế toán/admin xem (CH-01).') : '')
      + '<div class="mt16">' + K.tableCard('t', `${rows.length} khoản`, '', 'Định danh bằng mã phòng + mã tòa (SRC-02!E4); tên khách xem ở chi tiết') + '</div>';
    K.bindFilters(root, ['group']);
    U.table(root.querySelector('#t'), { rows, pageSize: 25, onRowOpen: (x) => drawer(x.i, asOf), cols: [
      { key: 'r', label: 'Phòng', sortable: true, sortVal: x => Q.roomCode(x.i.roomId), render: x => `<b class="code">${esc(Q.roomCode(x.i.roomId))}</b>` + (TH.actions.isOwnerTenantInv(x.i) ? ' ' + U.chip('Khách chủ nhà', 'teal') : '') + (x.i.kind === 'deposit_excess' ? ' ' + U.chip('Vượt cọc', 'purple') : '') },
      { key: 'kh', label: 'Mã KH', render: x => esc(x.i.customerCode) }, { key: 'p', label: 'Kỳ', render: x => F.periodShort(x.i.period) }, { key: 'due', label: 'Hạn', render: x => F.date(x.i.dueTo) },
      { key: 'd', label: 'Phải thu', num: true, render: x => full ? F.vnd(x.i.totalDue) : '•••' }, { key: 'pd', label: 'Đã phân bổ', num: true, render: x => full ? F.vnd(x.st.paid) : '•••' },
      { key: 'rm', label: 'Còn nợ', num: true, sortable: true, sortVal: x => x.st.remaining, render: x => `<b class="red">${F.vnd(x.st.remaining)}</b>` },
      { key: 'days', label: 'Quá hạn', num: true, sortable: true, sortVal: x => x.st.debt.days, render: x => x.st.debt.days ? x.st.debt.days + ' ngày' : '–' },
      { key: 'lp', label: 'Thu gần nhất', render: x => x.st.lastPaid ? F.date(x.st.lastPaid) : '–' },
      { key: 'mg', label: 'NV nhắc thu', render: x => esc((mm[x.i.buildingId] || {}).name || 'Chưa phân công') },
      { key: 'ld', label: 'Leader', render: x => esc((Q.leaderOf((mm[x.i.buildingId] || {}).id, asOf) || {}).name || '') },
      { key: 'z', label: 'Nhắc Zalo gần nhất', render: x => { const m = S.where('zaloMessages', z => z.invoiceId === x.i.id).sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt)))[0]; return m ? F.date(m.sentAt) + ' ' + (m.status === 'delivered' ? U.chip('Đã nhận', 'green') : U.chip('Lỗi', 'red')) : '–'; } },
      { key: 'st', label: '', render: x => K.debtChip(x.st.debt) }] });
    U.bind(root, { grp: (el) => TH.router.setQuery({ group: el.dataset.key, state: '' }), exp: () => K.csv('nhac-no-' + asOf + '.csv', ['Phòng', 'Mã KH', 'Kỳ', 'Hạn', 'Còn nợ', 'Quá hạn (ngày)', 'NV nhắc thu'], rows.map(x => [Q.roomCode(x.i.roomId), x.i.customerCode, x.i.period, x.i.dueTo, Math.round(x.st.remaining), x.st.debt.days, (mm[x.i.buildingId] || {}).name || ''])) });
  });
  /* E15: lịch sử thu của khoản */
  const drawer = (inv, asOf) => {
    const st = Q.invState(inv, asOf); const s = Q.stay(inv.stayId); const c = Q.customer(s.customerId) || {};
    const pays = S.all('payments').filter(x => x.allocations.some(a => a.invoiceId === inv.id));
    const d = U.drawer({ title: 'Chi tiết công nợ ' + Q.roomCode(inv.roomId), sub: inv.code, body: `${U.kv([['Khách', esc(c.name || '')], ['SĐT', esc(Q.pii(c.phone || ''))], ['Kỳ', F.periodLabel(inv.period)], ['Còn nợ', '<b class="red">' + F.vndd(st.remaining) + '</b>'], ['Trạng thái', K.payChip(st.status) + ' ' + K.debtChip(st.debt)]])}
      <h4 class="mt16 mb8">Lịch sử thu (${pays.length} lần)</h4>${TH.auth.can('payments.view') ? pays.map(x => `<div class="mini-row"><span>${F.date(x.receivedAt)}</span><span class="grow">${esc(x.code)} · ${x.method === 'cash' ? 'tiền mặt' : 'CK'} · nhận: ${esc(x.receivedBy || '')}</span><b>${F.vnd(x.allocations.filter(a => a.invoiceId === inv.id).reduce((t, a) => t + a.amount, 0))}</b></div>`).join('') || '<span class="muted small">Chưa thu</span>' : '<span class="muted small">Chỉ kế toán/admin xem chi tiết phiếu thu</span>'}`,
      footer: `<a class="btn btn-ghost" href="#/billing/invoices/${inv.id}">Mở hóa đơn</a>${TH.auth.can('payments.record') ? `<a class="btn btn-primary" href="#/billing/receipts/new?stay=${s.id}&invoice=${inv.id}">Ghi thu</a>` : ''}` });
    return d;
  };
})(window.TH);
