/* Central document index – workbook alignment GAP-07. */
(function (TH) {
  const F = TH.f, U = TH.ui, Q = TH.q, St = TH.store, Fm = TH.forms, esc = F.esc;
  const entity = d => {
    const maps = { building: ['buildings', 'Tòa nhà'], room: ['rooms', 'Phòng'], tenant: ['tenants', 'Khách thuê'], contract: ['contracts', 'Hợp đồng'], landlord: ['landlords', 'Chủ nhà'], lead: ['leads', 'Lead'] };
    const m = maps[d.entityType] || [d.entityType, d.entityType], o = St.get(m[0], d.entityId) || {};
    let buildingId = o.buildingId || '';
    if (d.entityType === 'building') buildingId = o.id;
    if (d.entityType === 'landlord') buildingId = (St.one('buildings', b => b.landlordId === o.id) || {}).id;
    if (d.entityType === 'tenant') buildingId = (Q.activeContractOfTenant(o.id) || {}).buildingId;
    const hrefs = { building: '#/buildings/', room: '#/rooms/', tenant: '#/tenants/', contract: '#/contracts/', landlord: '#/landlords/', lead: '#/crm/leads/' };
    return { object: o, label: o.code || o.name || d.entityId || '-', typeLabel: m[1], buildingId, href: hrefs[d.entityType] ? hrefs[d.entityType] + o.id : '' };
  };
  const status = d => !d.expiry ? 'valid' : d.expiry < F.today() ? 'expired' : F.daysUntil(d.expiry) <= 30 ? 'expiring' : 'valid';
  const legalMissing = b => ['Sổ đỏ', 'PCCC', 'ĐKKD', 'Hợp đồng'].some(k => !St.all('documents').some(d => { const e = entity(d); return e.buildingId === b.id && F.norm(d.name).includes(F.norm(k)); }));
  TH.router.register('/documents', (root, p, q) => {
    TH.router.crumb([{ label: 'Vận hành' }, { label: 'Tài liệu' }]);
    const f = { s: q.s || '', type: q.type || '', entityType: q.entityType || '', areaId: q.areaId || '', buildingId: q.buildingId || '', status: q.status || '' }, scope = Q.scope(f);
    let rows = St.all('documents').map(d => ({ ...d, _entity: entity(d), _status: status(d) })).filter(d => (!f.s || F.norm([d.name, d.fileName, d._entity.label].join(' ')).includes(F.norm(f.s))) && (!f.type || F.norm(d.name).includes(F.norm(f.type))) && (!f.entityType || d.entityType === f.entityType) && (!f.buildingId || d._entity.buildingId === f.buildingId) && (!f.areaId || scope.buildingIds.includes(d._entity.buildingId)) && (!f.status || d._status === f.status));
    const all = St.all('documents').map(d => ({ ...d, _entity: entity(d), _status: status(d) }));
    const expiring = all.filter(d => d._status === 'expiring').length, expired = all.filter(d => d._status === 'expired').length, missing = St.where('buildings', b => !b.stub).filter(legalMissing).length;
    root.innerHTML = `${U.pageHead({ title: 'Tài liệu', sub: 'Tra cứu tập trung hồ sơ vận hành và pháp lý theo đối tượng.', acts: [U.btn({ label: 'Tải lên', icon: 'upload', cls: 'btn-primary', act: 'upload', disabled: !TH.auth.can('documents.manage') })] })}
      <div class="grid grid-3 mb16">${U.kpi({ label: 'Sắp hết hạn 30 ngày', value: expiring, icon: 'clock', tone: 'amber' })}${U.kpi({ label: 'Đã hết hạn', value: expired, icon: 'alert-circle', tone: 'red' })}${U.kpi({ label: 'Tòa thiếu hồ sơ pháp lý', value: missing, icon: 'building', tone: 'purple' })}</div>
      ${U.filterbar([U.field({ label: 'Tìm kiếm', input: U.input({ name: 's', value: f.s, placeholder: 'Tên file, tài liệu, đối tượng…', icon: 'search', attrs: { 'data-on': 'f' } }), cls: 'wide' }), U.field({ label: 'Đối tượng', input: U.select({ name: 'entityType', value: f.entityType, all: 'Tất cả đối tượng', options: [['building', 'Tòa nhà'], ['room', 'Phòng'], ['landlord', 'Chủ nhà'], ['tenant', 'Khách thuê'], ['contract', 'Hợp đồng'], ['lead', 'Lead']], attrs: { 'data-on': 'f' } }) }), `<details class="filter-more"><summary>${TH.icon('filter')} Bộ lọc khác</summary><div class="filter-pop">${U.field({ label: 'Tòa nhà', input: U.select({ name: 'buildingId', value: f.buildingId, all: 'Tất cả tòa', options: St.where('buildings', b => !b.stub).map(b => [b.id, b.name]), attrs: { 'data-on': 'f' } }) })}${U.field({ label: 'Khu nhà', input: U.select({ name: 'areaId', value: f.areaId, all: 'Tất cả khu', options: Q.areas().map(a => [a.id, a.name]), attrs: { 'data-on': 'f' } }) })}${U.field({ label: 'Trạng thái', input: U.select({ name: 'status', value: f.status, all: 'Tất cả', options: [['valid', 'Còn hiệu lực'], ['expiring', 'Sắp hết hạn'], ['expired', 'Hết hạn']], attrs: { 'data-on': 'f' } }) })}</div></details>`], U.btn({ label: 'Làm mới', icon: 'refresh', cls: 'btn-light', act: 'reset' }))}
      ${U.card({ title: `Danh sách tài liệu <span class="muted">(${rows.length})</span>`, body: null, id: 'docs-table' })}`;
    U.table(root.querySelector('#docs-table'), { rows, unit: 'tài liệu', colPrefsKey: 'documents', rowHref: d => d._entity.href || '', cols: [
      { key: 'name', label: 'Tài liệu', render: d => U.cell2(`<b>${esc(d.name)}</b>`, esc(d.fileName || d.size || '')) },
      { key: 'type', label: 'Loại', render: d => esc(d.kind || '-') },
      { key: 'entity', label: 'Đối tượng', render: d => U.cell2(d._entity.href ? U.link(d._entity.href, esc(d._entity.label)) : esc(d._entity.label), esc(d._entity.typeLabel)) },
      { key: 'building', label: 'Tòa', render: d => esc(Q.building(d._entity.buildingId).name || '-') },
      { key: 'date', label: 'Ngày tải', sortable: true, render: d => F.date(d.date) },
      { key: 'expiry', label: 'Hết hạn', sortable: true, render: d => d.expiry ? F.date(d.expiry) : '-' },
      { key: 'status', label: 'Trạng thái', render: d => U.chip(d._status === 'expired' ? 'Hết hạn' : d._status === 'expiring' ? 'Sắp hết hạn' : 'Còn hiệu lực', d._status === 'expired' ? 'red' : d._status === 'expiring' ? 'amber' : 'green') }
    ] });
    U.onChange(root, { f: () => TH.router.applyFilter(f, U.formData(root.querySelector('.filterbar'))) });
    U.bind(root, { reset: () => { TH.router.replaceQuery({}); TH.router.refresh(); }, upload: () => {
      // Chọn loại đối tượng (tòa / phòng / khách thuê / hợp đồng) rồi chọn bản ghi – không chỉ giới hạn tòa nhà
      const TYPES = { building: ['Tòa nhà', () => St.where('buildings', b => !b.stub).map(b => [b.id, b.name])], room: ['Phòng', () => St.all('rooms').map(r => [r.id, r.code + ' – ' + (Q.building(r.buildingId).name || '')])], tenant: ['Khách thuê', () => St.all('tenants').map(t => [t.id, t.name + ' · ' + (t.phone || '')])], contract: ['Hợp đồng', () => St.all('contracts').map(c => [c.id, c.code + ' – ' + (Q.tenant(c.tenantId).name || '')])] };
      const opts = (k) => TYPES[k][1]();
      const m = U.modal({ title: 'Chọn đối tượng tải tài liệu', size: 'sm', body: `${U.field({ label: 'Loại đối tượng', req: true, input: U.select({ name: 'entityType', value: 'building', options: Object.entries(TYPES).map(([k, v]) => [k, v[0]]), attrs: { id: 'doc-type' } }) })}<div id="doc-entity">${U.field({ label: 'Tòa nhà', req: true, input: U.select({ name: 'entityId', placeholder: 'Chọn tòa nhà', options: opts('building') }) })}</div>`, footer: U.btn({ label: 'Hủy', act: 'cancel' }) + U.btn({ label: 'Tiếp tục', act: 'next', cls: 'btn-primary' }) });
      m.el.querySelector('#doc-type').addEventListener('change', (e) => { const k = e.target.value; m.el.querySelector('#doc-entity').innerHTML = U.field({ label: TYPES[k][0], req: true, input: U.select({ name: 'entityId', placeholder: 'Chọn ' + TYPES[k][0].toLowerCase(), options: opts(k) }) }); });
      U.bind(m.el, { cancel: () => m.close(), next: () => { const d = m.data(); if (!d.entityId) throw new Error('Chọn ' + TYPES[d.entityType][0].toLowerCase()); m.close(); Fm.upload(d.entityType, d.entityId, () => TH.router.refresh()); } });
    } });
  }, { menu: 'documents', permission: 'documents.view' });
})(window.TH);
