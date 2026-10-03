/* UI-48 – Registry hợp đồng thuê, dùng chung dữ liệu stays và tài liệu hiện có. */
(function (TH) {
  const S = TH.store, Q = TH.q, U = TH.ui, K = TH.kit, F = TH.f, esc = F.esc;
  const STATES = {
    all: ['Tất cả', 'gray'], pending_signature: ['Chờ ký', 'amber'], active: ['Hiệu lực', 'green'], expiring: ['Sắp hết hạn', 'blue'],
    pending_settlement: ['Chờ quyết toán', 'purple'], ended: ['Kết thúc', 'gray'], breach: ['Phá hợp đồng', 'red']
  };
  const chip = key => { const x = STATES[key] || [key, 'gray']; return U.chip(x[0], x[1]); };
  TH.router.handle('/contracts', (root, p, q) => {
    const view = q.view || 'all';
    const all = Q.contractRows({ asOf: F.today() });
    const counts = Object.fromEntries(Object.keys(STATES).map(k => [k, k === 'all' ? all.length : all.filter(x => x.state === k).length]));
    const filters = { view, q: q.q || '', building: q.building || '', manager: q.manager || '', from: q.from || '', to: q.to || '' };
    const rows = Q.contractRows(filters);
    const buildings = Q.scopedBuildings().map(b => [b.id, b.code]);
    const managers = [...new Map(Q.scopedBuildings().map(b => Q.managerOf(b.id)).filter(Boolean).map(e => [e.id, e])).values()].map(e => [e.id, e.name]);
    TH.layout.crumb([{ label: 'Vận hành' }, { label: 'Hợp đồng thuê' }]);
    root.innerHTML = U.pageHead({ title: 'Hợp đồng thuê', sub: 'Registry dùng dữ liệu lượt thuê, phiên điều khoản, file ký và công nợ hiện có.', acts: [U.btn({ label: 'Tạo khách & lượt thuê', icon: 'plus', cls: 'btn-primary', href: '#/tenants/new', perm: 'tenants.manage' })] })
      + U.statusTabs(Object.entries(STATES).map(([key, x]) => ({ key, label: x[0], count: counts[key], color: x[1] })), view)
      + U.filterbar([
        U.field({ name: 'q', label: 'Tìm hợp đồng', input: U.input({ name: 'q', value: filters.q, placeholder: 'Mã HĐ, khách, SĐT, phòng' }) }),
        U.field({ name: 'building', label: 'Tòa', input: U.select({ name: 'building', value: filters.building, options: buildings, all: 'Tất cả tòa' }) }),
        U.field({ name: 'manager', label: 'Quản lý', input: U.select({ name: 'manager', value: filters.manager, options: managers, all: 'Tất cả quản lý' }) }),
        U.field({ name: 'from', input: U.date({ name: 'from', value: filters.from, attrs: { 'aria-label': 'Hiệu lực từ' } }) }),
        U.field({ name: 'to', input: U.date({ name: 'to', value: filters.to, attrs: { 'aria-label': 'Hiệu lực đến' } }) })
      ], U.btn({ label: 'Xuất CSV', icon: 'download', act: 'export' }))
      + K.tableCard('contracts-table', 'Danh sách hợp đồng', `${rows.length} hợp đồng · trạng thái tại ${F.date(F.today())}`);
    const box = root.querySelector('#contracts-table');
    const table = U.table(box, { rows, pageSize: Number(q.size) || 20, sortKey: q.sort || 'endDate', sortDir: q.dir || 'asc', colPrefsKey: 'contracts', ariaLabel: 'Danh sách hợp đồng thuê',
      rowHref: x => TH.router.href('/stays/' + x.id, { tab: 'tong-quan', return: location.hash.slice(1) }), cols: [
        { key: 'code', label: 'Mã HĐ', sortable: true, sortVal: x => x.stay.code, render: x => U.cell2(`<b>${esc(x.stay.code)}</b>`, `${esc(x.building.code)} · ${esc(x.room.code)}`) },
        { key: 'customer', label: 'Khách thuê', sortable: true, sortVal: x => x.customer.name, render: x => U.cell2(esc(x.customer.name), esc(Q.pii(x.customer.phone || ''))) },
        { key: 'state', label: 'Trạng thái', sortable: true, render: x => chip(x.state) },
        { key: 'start', label: 'Hiệu lực', sortable: true, sortVal: x => x.stay.rentStart, render: x => F.date(x.stay.rentStart) },
        { key: 'endDate', label: 'Hết hạn', sortable: true, sortVal: x => x.stay.endDate, render: x => F.date(x.stay.endDate) },
        { key: 'manager', label: 'Quản lý', sortable: true, sortVal: x => (x.manager || {}).name, render: x => esc((x.manager || {}).name || '–') },
        { key: 'signed', label: 'Ký / phiên', render: x => `${x.signedFile ? U.chip('Đã ký', 'green') : U.chip('Thiếu file ký', 'amber')} <span class="muted">v${x.versions || 1}</span>` }
      ] });
    const apply = () => { const x = U.formData(root.querySelector('.filters')); TH.router.setQuery({ ...x, page: null }); };
    root.querySelector('.filters').addEventListener('change', apply);
    let timer; root.querySelector('[name=q]').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(apply, 250); });
    U.bind(root, {
      stab: el => TH.router.setQuery({ view: el.dataset.key, page: null }),
      export: () => F.download(`hop-dong-${F.today()}.csv`, F.csv(rows.map(x => [x.stay.code, x.customer.name, x.room.code, x.building.code, STATES[x.state][0], x.stay.rentStart, x.stay.endDate, (x.manager || {}).name || '', x.signedFile ? 'Đã ký' : 'Chờ ký', x.versions]), ['Mã HĐ', 'Khách', 'Phòng', 'Tòa', 'Trạng thái', 'Từ ngày', 'Đến ngày', 'Quản lý', 'Ký', 'Phiên']))
    });
  });
})(window.TH);
