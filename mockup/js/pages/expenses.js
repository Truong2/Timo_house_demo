/* UI-15 Chi phí: khoản chi gốc gắn tòa hoặc quỹ chung + dòng báo cáo SRC-04 (E16). 1B mở rộng: hóa đơn nhà cung cấp, hoa hồng theo phòng, thiết bị có khấu hao. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, CAT = () => TH.data.catalog;
  const catLabel = (k) => (CAT().expenseCategories.find(c => c.key === k) || { label: k }).label;
  const lineLabel = (c) => (CAT().reportLines.find(l => l.code === c) || { label: c ? c : '—' }).label;
  TH.pages.expTabs = (cur) => `<div class="subnav">${[['list', 'Chi phí', '#/expenses', 'expenses.view', '1A'], ['alloc', 'Phân bổ chung', '#/expenses/allocation', 'allocation.view', '1B'], ['owner', 'Lịch trả chủ nhà', '#/owner-payments', 'ownerPayments.view', '1A']]
    .filter(x => TH.auth.can(x[3]) && TH.ms.on(x[4])).map(([k, l, h]) => `<a class="${k === cur ? 'on' : ''}" href="${h}">${l}</a>`).join('')}</div>`;
  const form = () => {
    const is1B = TH.ms.on('1B');
    const cats = CAT().expenseCategories.filter(c => c.active !== false && c.key !== 'salary' && (is1B || !['equipment', 'commission', 'util_electric', 'util_water', 'util_internet', 'util_garbage', 'util_env', 'util_elevator'].includes(c.key)));
    const d = K.formDrawer({ title: 'Thêm chi phí', sub: 'Mỗi khoản gắn một tòa hoặc một quỹ chung và một dòng báo cáo', wide: true, fields: [
      { name: 'category', label: 'Loại chi phí', type: 'select', req: true, options: cats.map(c => [c.key, c.group + ' · ' + c.label]) },
      { name: 'scope', label: 'Phạm vi chi', type: 'select', req: true, options: [['building', 'Một tòa'], ['fund', 'Quỹ chung (phân bổ theo số phòng)']], value: 'building' },
      { name: 'buildingId', label: 'Tòa', type: 'select', options: K.buildingOpts(false) }, { name: 'fundCode', label: 'Quỹ chung', type: 'select', options: CAT().funds.map(f => [f.code, f.label]) },
      { name: 'roomId', label: 'Phòng (hoa hồng / sửa chữa theo phòng)', type: 'select', options: [] },
      { name: 'amount', label: 'Số tiền', type: 'money', req: true }, { name: 'date', label: 'Ngày chi', type: 'date', req: true, value: F.today() }, { name: 'period', label: 'Kỳ hưởng (YYYY-MM)', req: true, value: S.meta.period, help: 'Có thể khác tháng chi' },
      { name: 'vendor', label: 'Nhà cung cấp / người nhận' }, { name: 'method', label: 'Phương thức', type: 'select', options: [['bank', 'Chuyển khoản'], ['cash', 'Tiền mặt']], value: 'bank' },
      ...(is1B ? [{ name: 'depRate', label: 'Khấu hao/tháng (thiết bị)', value: Q.param('depRate'), help: 'Báo cáo tổng: nguyên giá một lần · Báo cáo KD: khấu hao cộng dồn (GĐ OQ-11)' }] : []),
      { name: 'code', label: 'Mã chứng từ (để trống = tự sinh)' }, { name: 'note', label: 'Nội dung', type: 'textarea', span: true },
      { type: 'html', span: true, html: '<div id="line-hint" class="small muted"></div>' }],
      submit: 'Lưu chi phí', onSubmit: (x) => { X.addExpense(x); U.toast('ok', 'Đã lưu chi phí'); } });
    const el = d.el;
    const sync = () => {
      const scope = el.querySelector('[name=scope]').value; const cat = CAT().expenseCategories.find(c => c.key === el.querySelector('[name=category]').value);
      el.querySelector('[data-field=buildingId]').hidden = scope !== 'building'; el.querySelector('[data-field=fundCode]').hidden = scope !== 'fund';
      const bid = el.querySelector('[name=buildingId]').value; const rs = el.querySelector('[name=roomId]');
      el.querySelector('[data-field=roomId]').hidden = !(cat && ['commission', 'repair'].includes(cat.key) && scope === 'building');
      if (bid && rs.dataset.b !== bid) { rs.dataset.b = bid; rs.innerHTML = '<option value="">–</option>' + (Q.roomsByBuilding()[bid] || []).map(r => `<option value="${r.id}">${esc(r.code)}</option>`).join(''); }
      const fund = CAT().funds.find(f => f.code === el.querySelector('[name=fundCode]').value);
      el.querySelector('#line-hint').innerHTML = 'Dòng báo cáo: <b>' + esc(scope === 'fund' && fund ? lineLabel(fund.reportLine) : cat ? lineLabel(cat.reportLine) : '–') + '</b>' + (cat && cat.key === 'owner_deposit' ? ' (không vào lợi nhuận)' : '');
      const dep = el.querySelector('[data-field=depRate]'); if (dep) dep.hidden = !(cat && cat.equipment);
    };
    el.addEventListener('change', sync); sync();
  };
  TH.router.handle('/expenses', (root, p, q) => {
    const period = q.period || S.meta.period;
    let rows = S.all('expenses').filter(e => e.status !== 'void' && e.period === period);
    if (q.cat) rows = rows.filter(e => e.category === q.cat);
    if (q.scope === 'fund') rows = rows.filter(e => e.scope === 'fund'); else if (q.scope) rows = rows.filter(e => e.buildingId === q.scope);
    if (q.line) rows = rows.filter(e => e.reportLine === q.line);
    if (q.src) rows = rows.filter(e => e.source === q.src);
    if (q.q) rows = rows.filter(e => K.match(q.q, e.code, e.note, e.vendor));
    rows.sort((a, b) => b.date.localeCompare(a.date));
    const sum = (arr) => arr.reduce((s, e) => s + e.amount, 0);
    const byGroup = F.by(rows, e => (CAT().expenseCategories.find(c => c.key === e.category) || {}).group || 'Lương');
    root.innerHTML = TH.pages.expTabs('list') + U.pageHead({ title: 'Chi phí', sub: `Kỳ hưởng ${F.periodLabel(period)} · nhập một lần, báo cáo tham chiếu theo dòng`, acts: [(S.get('periods', period) || {}).status === 'closed' ? U.btn({ label: 'Điều chỉnh sau khóa', icon: 'pencil', act: 'adj', perm: 'expenses.manage' }) : '', 
      U.btn({ label: 'Xuất', icon: 'download', act: 'exp' }), U.btn({ label: 'Import chi phí', icon: 'upload', href: '#/import?type=expenses', perm: 'import.finance' }), TH.ms.on('1B') ? U.btn({ label: TH.ms.on('2') ? 'Import hoa hồng (lịch sử ≤ 08/2026)' : 'Import hoa hồng', icon: 'upload', href: '#/import?type=commissions', perm: 'import.finance' }) : '', U.btn({ label: 'Thêm chi phí', icon: 'plus', cls: 'btn-primary', act: 'add', perm: 'expenses.manage' })] })
      + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Tổng chi kỳ', value: F.vnd(sum(rows)), cap: rows.length + ' khoản', icon: 'coins' })}${Object.entries(byGroup).slice(0, 3).map(([g, arr]) => U.kpi({ label: g, value: F.vnd(sum(arr)), cap: arr.length + ' khoản', icon: 'tag', tone: 'teal' })).join('')}</div>`
      + K.filters([{ name: 'period', label: 'Kỳ hưởng', options: K.periodOpts(), value: period, all: false }, { name: 'q', type: 'search', label: 'Tìm', placeholder: 'Mã, nội dung, nhà cung cấp' }, { name: 'cat', label: 'Loại', options: CAT().expenseCategories.map(c => [c.key, c.label]) },
        { name: 'scope', label: 'Tòa / quỹ', options: [['fund', 'Quỹ chung'], ...K.buildingOpts(false)] }, { name: 'line', label: 'Dòng báo cáo', options: CAT().reportLines.filter(l => !l.ratio && !l.count && !l.formula).map(l => [l.code, l.row + ' · ' + l.label]) },
        { name: 'src', label: 'Nguồn', options: [['manual', 'Nhập tay'], ['import', 'Import'], ['payroll', 'Bảng lương'], ['ownerPayment', 'Lịch trả chủ nhà'], ['bench', 'Excel T8 (song song)']] }], q)
      + '<div class="mt16">' + K.tableCard('t', rows.length + ' khoản chi') + '</div>';
    K.bindFilters(root, ['period']);
    U.table(root.querySelector('#t'), { rows, pageSize: 25, cols: [
      { key: 'code', label: 'Mã chi phí', render: e => `<b>${esc(e.code)}</b>` }, { key: 'note', label: 'Nội dung', render: e => U.cell2(esc(e.note || catLabel(e.category)), esc(e.vendor || '')) },
      { key: 'cat', label: 'Loại', render: e => esc(catLabel(e.category)) }, { key: 'sc', label: 'Tòa / quỹ', render: e => e.scope === 'fund' ? U.chip((CAT().funds.find(f => f.code === e.fundCode) || {}).label || 'Quỹ chung', 'purple') : `<b>${esc((Q.building(e.buildingId) || {}).code || '')}</b>${e.roomId ? ' · ' + esc(Q.roomCode(e.roomId)) : ''}` },
      { key: 'line', label: 'Dòng báo cáo', render: e => `<span class="small">${esc(lineLabel(e.reportLine))}</span>` }, { key: 'd', label: 'Ngày chi', sortable: true, sortVal: e => e.date, render: e => F.date(e.date) },
      { key: 'p', label: 'Kỳ hưởng', render: e => F.periodShort(e.period) + (F.period(e.date) !== e.period ? ' ' + U.chip('khác tháng chi', 'amber') : '') },
      { key: 'a', label: 'Số tiền', num: true, sortable: true, sortVal: e => e.amount, render: e => F.vnd(e.amount) + (e.isEquipment ? `<br><small class="muted">KH ${F.pctv(e.depRate)}/tháng</small>` : '') },
      { key: 's', label: 'Nguồn', render: e => U.chip({ manual: 'Nhập tay', import: 'Import', payroll: 'Bảng lương', ownerPayment: 'Tiền nhà', bench: 'Excel T8' }[e.source] || e.source, 'gray') },
      { key: 'x', label: '', render: e => e.source !== 'payroll' ? U.actBtn({ icon: 'trash', label: 'Hủy khoản chi', act: 'void', attrs: { 'data-id': e.id }, perm: 'expenses.manage' }) : '' }] });
    U.bind(root, { adj: () => TH.pages.adjustDrawer(period, { reportLine: 'other' }), add: form, void: (el) => K.formDrawer({ title: 'Hủy khoản chi', modal: true, size: 'sm', fields: [{ name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Hủy khoản', onSubmit: (d) => { X.voidExpense(el.dataset.id, d.reason); U.toast('ok', 'Đã hủy'); } }),
      exp: () => K.csv('chi-phi-' + period + '.csv', ['Mã', 'Ngày chi', 'Kỳ hưởng', 'Loại', 'Tòa/quỹ', 'Dòng báo cáo', 'Số tiền', 'Nhà cung cấp', 'Nội dung'], rows.map(e => [e.code, e.date, e.period, catLabel(e.category), e.scope === 'fund' ? e.fundCode : (Q.building(e.buildingId) || {}).code, lineLabel(e.reportLine), e.amount, e.vendor, e.note])) });
    if (q.open === 'new') form();
  });
})(window.TH);
