/* Workbook alignment v2.3 – dimension filters and metric disclosure UI. */
(function (TH) {
  const U = TH.ui, F = TH.f, Q = TH.q, St = TH.store, I = TH.icon;
  const dim = (key, f) => {
    const attrs = { 'data-on': 'f' }, value = f[key] || '';
    const activeEmployees = St.where('employees', e => e.status === 'working');
    const defs = {
      period: ['Kỳ', U.select({ name: key, value: f.period || St.state.meta.period, options: [...new Set(St.all('invoices').map(i => i.period).concat([St.state.meta.period]))].sort().reverse().map(p => [p, F.periodLabel(p)]), attrs })],
      // Spec v1.8 §4.3/§12.1.3: cascading Tổ chức (node + descendants) → Nhân sự → Tòa theo assignment hiệu lực tại kỳ
      orgUnitId: ['Tổ chức', U.select({ name: key, value, all: 'Toàn công ty', options: Q.orgOptions ? Q.orgOptions() : [], attrs })],
      employeeId: ['Nhân sự', U.select({ name: key, value, all: f.orgUnitId ? 'Tất cả nhân sự đơn vị' : 'Tất cả nhân sự', options: Q.employeeOptions ? Q.employeeOptions({ orgUnitId: f.orgUnitId, period: f.period }) : [], attrs })],
      areaId: ['Khu nhà', U.select({ name: key, value, all: 'Tất cả khu nhà', options: Q.areas().map(a => [a.id, a.name]), attrs })],
      buildingId: ['Tòa nhà', U.select({ name: key, value, all: f.orgUnitId || f.employeeId ? 'Tòa trong scope' : 'Tất cả tòa nhà', options: (() => { const ids = (f.orgUnitId || f.employeeId) && Q.scopeBuildingIds ? new Set(Q.scopeBuildingIds({ orgUnitId: f.orgUnitId, employeeId: f.employeeId, period: f.period })) : null; return St.where('buildings', b => !b.stub && (!f.areaId || b.areaId === f.areaId) && (!ids || ids.has(b.id))).map(b => [b.id, b.name]); })(), attrs })],
      buildingType: ['Loại nhà (hiệu lực trong kỳ)', U.select({ name: key, value, all: 'Tất cả loại', options: Q.buildingTypeOptions ? Q.buildingTypeOptions() : Object.entries(Q.L.buildingType).map(([k, v]) => [k, v[0]]), attrs })],
      managerId: ['Quản lý', U.select({ name: key, value, all: 'Tất cả quản lý', options: Q.managers().map(u => [u.id, u.name]), attrs })],
      leadId: ['Trưởng nhóm', U.select({ name: key, value, all: 'Tất cả trưởng nhóm', options: activeEmployees.filter(e => e.dept === 'vanhanh' || /trưởng/i.test(e.title || '')).map(e => [e.id, e.name]), attrs })],
      opsId: ['Vận hành', U.select({ name: key, value, all: 'Tất cả nhân sự', options: activeEmployees.filter(e => e.dept === 'vanhanh').map(e => [e.id, e.name]), attrs })],
      shareholderId: ['Cổ đông', U.select({ name: key, value, all: 'Tất cả cổ đông', options: St.all('shareholders').map(s => [s.id, s.name]), attrs })],
      saleId: ['Nhân viên KD', U.select({ name: key, value, all: 'Tất cả nhân viên', options: Q.salesUsers().map(u => [u.id, u.name]), attrs })],
      teamId: ['Team kinh doanh', U.select({ name: key, value, all: 'Tất cả team', options: St.all('salesTeams').map(t => [t.id, t.name]), attrs })]
    };
    const d = defs[key]; return d ? U.field({ label: d[0], input: d[1] }) : '';
  };
  U.dimFilter = (f = {}, opts = {}) => {
    const dims = opts.dims || ['period', 'areaId', 'buildingId'], inline = opts.inline == null ? 2 : opts.inline;
    const first = dims.slice(0, inline).map(k => dim(k, f));
    const more = dims.slice(inline).map(k => dim(k, f)).join('') + (opts.extraFields || '');
    if (more) first.push(`<details class="filter-more"><summary>${I('filter')} Bộ lọc khác</summary><div class="filter-pop">${more}</div></details>`);
    return U.filterbar(first, opts.actions || U.btn({ label: 'Làm mới', icon: 'refresh', cls: 'btn-light', act: 'reset' }));
  };
  // Chỉ trả về các field dimension (nhúng vào filterbar/filter-more sẵn có của page).
  U.dimFields = (f = {}, dims = []) => dims.map(k => dim(k, f)).join('');
  // Khối "Bộ lọc khác" chứa dimension workbook, dùng cho page đã có filterbar riêng.
  U.dimMore = (f = {}, dims = [], extraFields = '') => `<details class="filter-more"><summary>${I('filter')} Bộ lọc khác</summary><div class="filter-pop">${U.dimFields(f, dims)}${extraFields}</div></details>`;
  U.assume = (label = 'Giả định') => !U.demoNotes() ? '' : `<span class="chip amber wb-assume" title="Chờ khách xác nhận">${F.esc(label)}</span>`;
  U.metricInfo = key => { const d = TH.metrics && TH.metrics.get(key); return d ? `<button type="button" class="metric-info" data-act="metric-info" data-metric="${F.esc(key)}" title="${F.esc(d.formula)}">ⓘ</button>${d.status === 'assumed' ? U.assume() : ''}` : ''; };
  U.bindMetricInfo = root => U.bind(root, { 'metric-info': el => { const d = TH.metrics.get(el.dataset.metric); if (!d) return; const m = U.modal({ title: 'Công thức · ' + d.label, size: 'sm', body: TH.metrics.info(el.dataset.metric), footer: U.btn({ label: 'Đóng', act: 'close-metric', cls: 'btn-primary' }) }); U.bind(m.el, { 'close-metric': () => m.close() }); } });
  U.roomRef = roomId => { const r = Q.room(roomId), b = Q.building(r.buildingId); return U.cell2(U.link('#/rooms/' + r.id, F.esc(F.roomRef(b, r)), 'bold'), F.esc(b.name || '')); };
  U.presetSwitch = tbl => tbl && tbl.presets ? Object.entries(tbl.presets()).map(([key, p]) => `<button type="button" class="chip ${tbl.state.preset === key ? 'blue' : 'gray'}" data-preset="${key}">${F.esc(p.label)}</button>`).join('') : '';
})(window.TH);
