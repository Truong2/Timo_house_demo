/* UI-02 Danh sách tòa (E01) · UI-03 Chi tiết tòa (tab phòng E02, chủ nhà/HĐ, lịch trả, nhân sự, dịch vụ đầu vào, tài chính). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, I = TH.icon, X = TH.actions, esc = F.esc;
  const cat = () => TH.data.catalog;

  const addBuilding = () => K.formDrawer({ title: 'Thêm tòa', sub: 'Loại T/S/G lấy theo tiền tố mã tòa (T2, S43, G1)', fields: [
    { name: 'code', label: 'Mã tòa', req: true, placeholder: 'VD: S50', help: 'Mã phòng hiển thị = số phòng + mã tòa (501S50)' },
    { name: 'areaId', label: 'Khu vực', type: 'select', req: true, options: K.areaOpts() },
    { name: 'address', label: 'Địa chỉ', req: true, span: true },
    { name: 'managerId', label: 'Quản lý vận hành', type: 'select', req: true, options: S.all('employees').filter(e => ['NVVH', 'TNVH', 'TPVH'].includes(e.title)).map(e => [e.id, e.name]) },
    { name: 'operatedFrom', label: 'Ngày nhận nhà', type: 'date', value: F.today() },
    { name: 'floors', label: 'Số tầng', type: 'number' }, { name: 'rooms', label: 'Số phòng tạo sẵn', type: 'number', help: 'Có thể thêm/sửa phòng sau' },
    { name: 'note', label: 'Ghi chú', type: 'textarea', span: true },
  ], submit: 'Lưu tòa', onSubmit: (d) => { const b = X.addBuilding(d); U.toast('ok', 'Đã thêm tòa ' + b.code); TH.go('#/buildings/' + b.id); } });

  /* Trạng thái HĐ chủ nhà tại hôm nay (UI-02 cột "trạng thái HĐ chủ nhà") */
  const ocStatus = (oc) => !oc ? U.chip('Chưa có HĐ', 'amber') : oc.startDate > F.today() ? U.chip('Chưa hiệu lực', 'blue') : oc.endDate && oc.endDate < F.today() ? U.chip('Hết hạn', 'gray') : F.daysBetween(F.today(), oc.endDate) <= 90 ? U.chip('Sắp hết hạn', 'amber') : U.chip('Hiệu lực', 'green');
  const LEVELS = ['Mới', 'Trung bình', 'Cũ'];
  /* UI-02 sửa hồ sơ tòa */
  const editBuilding = (b) => K.formDrawer({ title: 'Sửa hồ sơ tòa ' + b.code, sub: 'Mã tòa không đổi; ngừng khai thác thay cho xóa', fields: [
    { name: 'areaId', label: 'Khu vực', type: 'select', req: true, options: K.areaOpts(), value: b.areaId }, { name: 'group', label: 'Nhóm T/S/G', type: 'select', options: [['T', 'Nhà T'], ['S', 'Nhà S'], ['G', 'Nhà G']], value: b.group, help: 'Mặc định theo tiền tố mã tòa' },
    { name: 'address', label: 'Địa chỉ', req: true, span: true, value: b.address },
    { name: 'floors', label: 'Số tầng', type: 'number', value: b.floors || '' }, { name: 'operatedFrom', label: 'Ngày nhận vận hành', type: 'date', value: b.operatedFrom || '' },
    { name: 'level', label: 'Tình trạng nhà', type: 'select', options: [...new Set([...LEVELS, b.level].filter(Boolean))].map(x => [x, x]), value: b.level || '' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [['active', 'Đang khai thác'], ['inactive', 'Ngừng khai thác']], value: b.status, help: 'Ngừng khai thác chỉ khi không còn lượt thuê hiệu lực' },
    { name: 'note', label: 'Ghi chú', type: 'textarea', span: true, value: b.note || '' }],
    submit: 'Lưu', onSubmit: (d) => { X.updateBuilding(b.id, d); U.toast('ok', 'Đã lưu hồ sơ tòa'); } });
  /* UI-03 E02 sửa phòng */
  const editRoom = (room, after) => K.formDrawer({ title: 'Sửa phòng ' + room.code, sub: 'Đổi giá cần ngày hiệu lực – giữ lịch sử giá', fields: [
    { name: 'floor', label: 'Tầng', type: 'number', value: room.floor ?? '' }, { name: 'type', label: 'Loại phòng', type: 'select', options: [...new Set(['Phòng đơn', 'Studio', 'Phòng đôi', room.type].filter(Boolean))].map(x => [x, x]), value: room.type || '' },
    { name: 'area', label: 'Diện tích (m²)', type: 'number', value: room.area ?? '' }, { name: 'exploitation', label: 'Loại khai thác', type: 'select', options: Object.entries(TH.data.catalog.exploitation), value: room.exploitation },
    { name: 'listPrice', label: 'Giá niêm yết', type: 'money', value: room.listPrice || 0 }, { name: 'mgmtPrice', label: 'Giá quản lý', type: 'money', value: room.mgmtPrice || 0 }, { name: 'price', label: 'Giá đang cho thuê', type: 'money', value: room.price || 0 },
    { name: 'readyDate', label: 'Ngày sẵn sàng', type: 'date', value: room.readyDate || '' },
    { name: 'effectiveFrom', label: 'Giá mới hiệu lực từ', type: 'date', help: 'Bắt buộc khi đổi giá; không vào kỳ đã khóa' }, { name: 'reason', label: 'Lý do đổi giá', value: '' }],
    submit: 'Lưu phòng', onSubmit: (d) => { X.updateRoom(room.id, d); U.toast('ok', 'Đã lưu phòng'); after && after(); } });

  TH.router.handle('/buildings', (root, p, q) => {
    const mgr = Q.managerMap();
    // LN kỳ gần nhất theo tòa (UI-02 "hiệu suất/lợi nhuận kỳ"): chỉ khi có quyền báo cáo và mốc 1B
    const rep = TH.auth.can('reports.view') && TH.ms.on('1B') ? TH.qr.build(S.meta.period, 'total') : null;
    let rows = Q.scopedBuildings().map(b => {
      const rooms = (Q.roomsByBuilding()[b.id] || []).filter(r => r.exploitation !== 'meter_common');
      const occ = rooms.filter(r => Q.currentStay(r.id)).length;
      const oc = S.one('ownerContracts', c => c.buildingId === b.id && (!c.endDate || c.endDate >= F.today())) || S.one('ownerContracts', c => c.buildingId === b.id);
      return { b, rooms: rooms.length, occ, vac: rooms.filter(r => !Q.currentStay(r.id) && !Q.pendingStay(r.id)).length, clean: rooms.filter(r => r.status === 'vacant_cleaning').length, mgr: mgr[b.id], area: (S.get('areas', b.areaId) || {}).name,
        oc, owner: oc ? (S.get('owners', oc.ownerId) || {}).name : '', lnr: rep && rep.byBuilding[b.id] ? rep.byBuilding[b.id].lnr : null,
        // tiền thuê nhà theo giá hiệu lực hôm nay của HĐ đầu vào (phụ lục có hiệu lực thì đổi theo)
        rent: S.where('ownerContracts', c => c.buildingId === b.id).reduce((s, c) => s + X.ownerRentAt(c.id, F.today()), 0) };
    });
    if (q.group) rows = rows.filter(r => r.b.group === q.group);
    if (q.area) rows = rows.filter(r => r.b.areaId === q.area);
    if (q.manager) rows = rows.filter(r => r.mgr && r.mgr.id === q.manager);
    if (q.roomStatus === 'vacant_cleaning') rows = rows.filter(r => r.clean > 0);
    if (q.q) rows = rows.filter(r => K.match(q.q, r.b.code, r.b.address, r.mgr && r.mgr.name));
    const all = Q.scopedBuildings();
    root.innerHTML = U.pageHead({ title: 'Tòa nhà', sub: `${all.length} tòa · ${all.reduce((s, b) => s + (Q.roomsByBuilding()[b.id] || []).length, 0)} phòng trong phạm vi`, acts: [
      U.btn({ label: 'Xuất', icon: 'download', act: 'export' }), U.btn({ label: 'Import', icon: 'upload', href: '#/import?type=buildings', perm: 'import.master' }), U.btn({ label: 'Thêm tòa', icon: 'plus', cls: 'btn-primary', act: 'add', perm: 'buildings.manage' })] })
      + K.filters([{ name: 'q', type: 'search', label: 'Tìm', placeholder: 'Mã tòa, địa chỉ, quản lý…' }, { name: 'group', label: 'Loại T/S/G', options: K.groupOpts() }, { name: 'area', label: 'Khu vực', options: K.areaOpts() }, { name: 'manager', label: 'Quản lý', options: K.managerOpts() },
        { name: 'roomStatus', label: 'Phòng', options: [['vacant_cleaning', 'Có phòng cần kiểm tra/dọn']] }], q)
      + `<div class="mt16">${K.tableCard('tbl', `Tổng ${rows.length} tòa`)}</div>`;
    K.bindFilters(root);
    const t = U.table(root.querySelector('#tbl'), { rows, pageSize: 20, rowHref: r => '#/buildings/' + r.b.id, cols: [
      { key: 'code', label: 'Mã tòa', sortable: true, sortVal: r => r.b.code, render: r => `<b>${esc(r.b.code)}</b>` },
      { key: 'group', label: 'T/S/G', render: r => U.chip('Nhà ' + r.b.group, { T: 'blue', S: 'teal', G: 'purple' }[r.b.group]) },
      { key: 'addr', label: 'Địa chỉ', render: r => `<span class="small">${esc(r.b.address)}</span>` },
      { key: 'area', label: 'Khu vực', render: r => esc(r.area || '') },
      { key: 'own', label: 'Chủ nhà', render: r => TH.auth.can('owners.view') ? esc(r.owner || '–') : '•••' },
      { key: 'fl', label: 'Tầng', num: true, render: r => r.b.floors || '–' }, { key: 'lv', label: 'Tình trạng', render: r => r.b.level ? U.chip(r.b.level, 'gray') : '–' },
      { key: 'mgr', label: 'Quản lý', render: r => r.mgr ? esc(r.mgr.name) : U.chip('Chưa phân công', 'amber') },
      { key: 'op', label: 'Nhận vận hành', sortable: true, sortVal: r => r.b.operatedFrom || '', render: r => F.date(r.b.operatedFrom) },
      { key: 'ocs', label: 'HĐ chủ nhà', render: r => TH.auth.can('owners.view') ? ocStatus(r.oc) : '•••' },
      { key: 'rooms', label: 'Số phòng', num: true, sortable: true, render: r => r.rooms },
      { key: 'occ', label: 'Đang ở', num: true, sortable: true, render: r => r.occ },
      { key: 'vac', label: 'Trống', num: true, sortable: true, render: r => r.vac ? `<b class="amber">${r.vac}</b>` : 0 },
      { key: 'rent', label: 'Tiền thuê nhà/tháng', num: true, sortable: true, sortVal: r => r.rent, render: r => TH.auth.can('owners.view') ? F.vnd(r.rent) : '•••' },
      ...(rep ? [{ key: 'lnr', label: 'LN ' + F.periodShort(S.meta.period), num: true, sortable: true, sortVal: r => r.lnr || 0, render: r => r.lnr == null ? '–' : `<b class="${r.lnr < 0 ? 'red' : ''}">${F.vnd(r.lnr)}</b>` }] : []),
      { key: 'st', label: 'Trạng thái', render: r => r.b.status === 'active' ? U.chip('Đang khai thác', 'green', true) : U.chip('Ngừng khai thác', 'gray', true) },
    ] });
    U.bind(root, { add: addBuilding, export: () => K.csv('toa-nha.csv', ['Mã tòa', 'Loại', 'Địa chỉ', 'Quản lý', 'Số phòng', 'Đang ở', 'Trống'], rows.map(r => [r.b.code, r.b.group, r.b.address, r.mgr ? r.mgr.name : '', r.rooms, r.occ, r.vac])) });
    if (q.open === 'new') addBuilding();
  });

  /* E02: drawer phòng */
  const roomDrawer = (room) => {
    const stays = (Q.staysByRoom()[room.id] || []).slice().sort((a, b) => String(b.rentStart || '').localeCompare(String(a.rentStart || '')));
    const cur = stays.find(s => s.status === 'active'), pend = stays.find(s => s.status === 'pending');
    const d = U.drawer({ title: 'Phòng ' + room.code, sub: (TH.data.catalog.exploitation[room.exploitation] || '') + ' · ' + room.type, wide: true, body: `
      <div class="row wrap gap12 mb16">${K.roomChip(room.status)}${room.statusReason ? `<span class="small muted">${esc(room.statusReason)} (${F.date(room.statusAt)})</span>` : ''}</div>
      ${U.kv([['Giá niêm yết', F.vndd(room.listPrice)], ['Giá cho thuê', F.vndd(room.price)], ['Tầng', room.floor || '–'], ['Khách hiện tại', cur ? `<a href="#/stays/${cur.id}">${esc(Q.stayLabel(cur))}</a>` : '–'],
        ['Khách chờ nhận', pend ? `<a href="#/stays/${pend.id}">${esc(Q.stayLabel(pend))}</a>` : '–'], ['Hết hạn HĐ', cur ? F.date(cur.endDate) : '–']])}
      <h4 class="mt16 mb8">Lịch sử lượt thuê (${stays.length})</h4>
      <table class="tbl compact"><thead><tr><th>Mã KH</th><th>Khách</th><th>Từ</th><th>Đến</th><th>Trạng thái / loại kết thúc</th></tr></thead><tbody>
      ${stays.map(s => `<tr><td><a href="#/stays/${s.id}">${esc(s.code)}</a></td><td>${esc((Q.customer(s.customerId) || {}).name || '')}</td><td>${F.date(s.rentStart)}</td><td>${F.date(s.endDate)}</td><td>${K.stayChip(s)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">Chưa có</td></tr>'}</tbody></table>`,
      footer: [U.btn({ label: 'Sửa phòng', icon: 'pencil', act: 'editroom', perm: 'buildings.manage' }), U.btn({ label: 'Đổi trạng thái phòng', icon: 'refresh', act: 'status', perm: 'rooms.status' }), U.btn({ label: 'Thêm khách hàng', icon: 'user-plus', cls: 'btn-primary', href: '#/tenants/intake?room=' + room.id, perm: 'tenants.manage' })].join('') });
    TH.auth.enforceUI(d.el);
    U.bind(d.el, { editroom: () => editRoom(room, () => d.close()), status: () => K.formDrawer({ title: 'Đổi trạng thái ' + room.code, modal: true, size: 'sm', fields: [
      { name: 'status', label: 'Trạng thái mới', type: 'select', req: true, options: Object.entries(TH.data.catalog.roomStatuses).filter(([k]) => !['occupied', 'reserved'].includes(k)).map(([k, v]) => [k, v.label]) },
      { name: 'reason', label: 'Lý do', req: true, type: 'textarea', span: true, help: 'VD: đã kiểm tra, dọn xong (CH-21); sửa chữa; chủ nhà lấy lại' }],
      onSubmit: (x) => { X.setRoomStatus(room.id, x.status, x.reason); d.close(); U.toast('ok', 'Đã cập nhật trạng thái phòng'); } }) });
  };

  TH.router.handle('/buildings/:id', (root, p, q) => {
    const b = Q.building(p.id); if (!b) { root.innerHTML = U.empty({ title: 'Không tìm thấy tòa' }); return; }
    if (!TH.auth.inScope(b.id)) { root.innerHTML = U.card({ body: U.empty({ icon: 'lock', title: 'Tòa ngoài phạm vi được giao' }) }); return; }
    TH.layout.crumb([{ label: 'Tòa nhà', href: '#/buildings' }, { label: b.code }]);
    const rooms = (Q.roomsByBuilding()[b.id] || []).slice().sort((a, c) => a.number - c.number);
    const oc = S.one('ownerContracts', c => c.buildingId === b.id);
    const mgr = Q.managerOf(b.id);
    const realRooms = rooms.filter(r => r.exploitation !== 'meter_common'); const occ = realRooms.filter(r => Q.currentStay(r.id)).length, real = realRooms.length;
    const period = S.meta.period; const invs = Q.invoicesOf(period).filter(i => i.buildingId === b.id && i.lifecycle !== 'draft');
    const due = invs.reduce((s, i) => s + i.totalDue, 0), rem = invs.reduce((s, i) => s + Q.invState(i).remaining, 0);
    const tabs = [{ key: 'tong-quan', label: 'Tổng quan' }, { key: 'phong', label: 'Phòng', count: rooms.length }, { key: 'chu-nha-hd', label: 'Chủ nhà & HĐ', perm: 'owners.view' }, { key: 'lich-tra', label: 'Lịch trả chủ nhà', perm: 'ownerPayments.view' },
      { key: 'nhan-su', label: 'Nhân sự' }, { key: 'dich-vu-dau-vao', label: 'Dịch vụ đầu vào', perm: 'expenses.view' }, { key: 'tai-chinh', label: 'Tài chính', perm: 'debts.viewAmounts' }];
    const tab = K.pickTab(tabs, q.tab || 'tong-quan', 'tong-quan');
    root.innerHTML = U.pageHead({ title: 'Tòa ' + esc(b.code) + ' ' + U.chip('Nhà ' + b.group, 'blue') + (b.level ? ' ' + U.chip(b.level, 'gray') : ''), back: '#/buildings', sub: `${esc(b.address)} · Quản lý: ${mgr ? esc(mgr.name) : 'chưa phân công'} · Nhận nhà ${F.date(b.operatedFrom)}`,
      acts: [U.btn({ label: 'Chủ nhà / HĐ', icon: 'file-text', href: oc ? '#/owners/' + oc.id : '#', perm: 'owners.view' }), U.btn({ label: 'Sửa hồ sơ tòa', icon: 'pencil', act: 'editb', perm: 'buildings.manage' }), U.btn({ label: 'Thêm phòng', icon: 'plus', cls: 'btn-primary', act: 'addroom', perm: 'buildings.manage' })] })
      + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Lấp đầy', value: F.pctv(real ? occ / real : 0), cap: `${occ}/${real} phòng có khách`, icon: 'door', tone: 'blue' })}
        ${!TH.auth.can('debts.viewStatus') ? '' : U.kpi({ label: 'Phải thu ' + F.periodShort(period), value: TH.auth.can('debts.viewAmounts') ? F.vnd(due) : invs.length + ' HĐ', icon: 'receipt', tone: 'teal' })}
        ${!TH.auth.can('debts.viewStatus') ? '' : U.kpi({ label: 'Còn nợ', value: TH.auth.can('debts.viewAmounts') ? F.vnd(rem) : invs.filter(i => Q.invState(i).remaining > 0).length + ' HĐ', icon: 'alert-triangle', tone: rem > 0 ? 'red' : 'green' })}
        ${U.kpi({ label: 'Mẫu hóa đơn', value: TH.calc.billing.TEMPLATES[b.template].name, cap: TH.auth.can('settings.view') ? ((Q.account(b.accountId) || {}).bank || '') + ' ' + ((Q.account(b.accountId) || {}).number || '') : '', icon: 'printer', tone: 'purple', valueCls: 'sm' })}</div>`
      + U.tabs(tabs, tab) + '<div id="tab-body" class="mt16"></div>';
    const body = root.querySelector('#tab-body');
    U.bind(root, { tab: (el) => TH.router.setQuery({ tab: el.dataset.key }), editb: () => editBuilding(b), addroom: () => K.formDrawer({ title: 'Thêm phòng – ' + b.code, fields: [
      { name: 'number', label: 'Số phòng', req: true, type: 'number', help: 'Mã phòng = số phòng + mã tòa' }, { name: 'floor', label: 'Tầng', type: 'number', help: 'Mặc định = số phòng ÷ 100' }, { name: 'type', label: 'Loại phòng', type: 'select', options: [['Phòng đơn', 'Phòng đơn'], ['Studio', 'Studio'], ['Phòng đôi', 'Phòng đôi']], value: 'Phòng đơn' }, { name: 'area', label: 'Diện tích (m²)', type: 'number' },
      { name: 'listPrice', label: 'Giá niêm yết', type: 'money', req: true }, { name: 'mgmtPrice', label: 'Giá quản lý', type: 'money' }, { name: 'price', label: 'Giá cho thuê', type: 'money' }, { name: 'readyDate', label: 'Ngày sẵn sàng', type: 'date' },
      { name: 'exploitation', label: 'Loại khai thác', type: 'select', options: Object.entries(TH.data.catalog.exploitation), value: 'timehouse' }],
      onSubmit: (d) => { X.addRoom(b.id, d); U.toast('ok', 'Đã thêm phòng'); } }) });
    if (tab === 'tong-quan') {
      const byStatus = {}; rooms.forEach(r => { byStatus[r.status] = (byStatus[r.status] || 0) + 1; });
      body.innerHTML = `<div class="two-col"><div class="side-stack">${U.card({ title: 'Tình trạng phòng', icon: 'door', body: `<div class="row wrap gap12">${Object.entries(byStatus).map(([k, v]) => `<div class="stat-tile">${K.roomChip(k)}<b class="mt4" style="display:block;font-size:20px">${v}</b></div>`).join('')}</div>` })}
        ${U.card({ title: 'Hóa đơn kỳ ' + F.periodShort(period), icon: 'receipt', body: `<div class="row wrap gap12">${Object.entries(TH.calc.payments.STATUS).map(([k]) => { const n = invs.filter(i => Q.invState(i).status === k).length; return n ? `<div class="stat-tile">${K.payChip(k)}<b class="mt4" style="display:block;font-size:20px">${n}</b></div>` : ''; }).join('')}</div><a class="btn btn-ghost btn-sm mt12" href="#/billing/invoices?building=${b.id}&period=${period}">Xem hóa đơn tòa</a>` })}</div>
        <div class="side-stack">${U.card({ title: 'Thông tin tòa', icon: 'info', body: U.kv([['Mã tòa', esc(b.code)], ['Loại', 'Nhà ' + b.group + ' (tiền tố mã)'], ['Khu vực', esc((S.get('areas', b.areaId) || {}).name || '')], ['Số tầng', b.floors || '–'], ['Nhận nhà', F.date(b.operatedFrom)], ['Mức tòa', b.level || '–']]) })}</div></div>`;
    }
    if (tab === 'phong') {
      body.innerHTML = K.filters([{ name: 'rs', label: 'Trạng thái', options: Object.entries(TH.data.catalog.roomStatuses).map(([k, v]) => [k, v.label]) }], q, '') + '<div class="mt12">' + K.tableCard('rt', 'Danh sách phòng') + '</div>';
      K.bindFilters(body, ['tab']);
      let rr = rooms; if (q.rs) rr = rr.filter(r => r.status === q.rs);
      U.table(body.querySelector('#rt'), { rows: rr, pageSize: 50, onRowOpen: roomDrawer, cols: [
        { key: 'code', label: 'Mã phòng', sortable: true, render: r => `<b class="code">${esc(r.code)}</b>` }, { key: 'fl', label: 'Tầng', num: true, sortable: true, sortVal: r => r.floor || 0, render: r => r.floor ?? '–' },
        { key: 'type', label: 'Loại', render: r => esc(TH.data.catalog.exploitation[r.exploitation] === undefined ? r.type : r.exploitation === 'timehouse' ? r.type : TH.data.catalog.exploitation[r.exploitation]) },
        { key: 'area', label: 'm²', num: true, render: r => r.area || '–' },
        { key: 'listPrice', label: 'Giá niêm yết', num: true, sortable: true, render: r => F.vnd(r.listPrice) }, { key: 'mgmtPrice', label: 'Giá quản lý', num: true, sortable: true, render: r => F.vnd(r.mgmtPrice) },
        { key: 'price', label: 'Giá cho thuê', num: true, sortable: true, render: r => F.vnd(r.price) },
        { key: 'st', label: 'Trạng thái', render: r => K.roomChip(r.status) }, { key: 'rd', label: 'Sẵn sàng', render: r => r.readyDate ? F.date(r.readyDate) : '–' },
        { key: 'lastrd', label: 'Chỉ số gần nhất', render: r => { const x = S.where('meterReadings', m => m.roomId === r.id && !m.vacant && !m.groupId).sort((a, c) => String(c.period).localeCompare(String(a.period)))[0]; return x ? `<span class="small">${F.periodShort(x.period)}: điện ${x.elCurr}${x.waCurr != null ? ' · nước ' + x.waCurr : ''}</span>` : '–'; } },
        { key: 'cur', label: 'Khách hiện tại', render: r => { const s = Q.currentStay(r.id); return s ? `<a href="#/stays/${s.id}">${esc((Q.customer(s.customerId) || {}).name || '')}</a> <small class="muted">${esc(s.code)}</small>` : '–'; } },
        { key: 'end', label: 'Hết hạn HĐ', render: r => { const s = Q.currentStay(r.id); return s ? F.date(s.endDate) : '–'; } },
        { key: 'pend', label: 'Khách chờ nhận', render: r => { const s = Q.pendingStay(r.id); return s ? U.chip('Từ ' + F.date(s.rentStart), 'purple') : ''; } },
      ] });
      if (q.room) { const r = Q.room(q.room); if (r) roomDrawer(r); }
    }
    if (tab === 'chu-nha-hd') {
      const own = oc ? S.get('owners', oc.ownerId) : null;
      const vs = oc ? S.where('ownerRateVersions', v => v.contractId === oc.id).sort((a, c) => a.from.localeCompare(c.from)) : [];
      const addOc = () => K.formDrawer({ title: 'Tạo chủ nhà & HĐ đầu vào – ' + b.code, wide: true, fields: [
        { name: 'ownerId', label: 'Chủ nhà có sẵn', type: 'select', options: S.all('owners').map(o => [o.id, o.name]), help: 'Để trống để tạo chủ nhà mới' }, { name: 'ownerName', label: 'Tên chủ nhà mới' },
        { name: 'ownerPhone', label: 'SĐT chủ nhà' }, { name: 'ownerBank', label: 'Tài khoản nhận tiền' },
        { name: 'startDate', label: 'Ngày bắt đầu', type: 'date', req: true, value: F.today() }, { name: 'endDate', label: 'Ngày kết thúc', type: 'date', req: true, value: F.addDays(F.addMonths(F.today(), 60), -1) },
        { name: 'monthlyRent', label: 'Giá thuê/tháng', type: 'money', req: true }, { name: 'deposit', label: 'Cọc chủ nhà', type: 'money' },
        { name: 'payCycleMonths', label: 'Kỳ trả', type: 'select', req: true, value: '3', options: [['1', '1 tháng'], ['2', '2 tháng'], ['3', '3 tháng'], ['6', '6 tháng'], ['12', '12 tháng']] }, { name: 'payDay', label: 'Hạn trả (ngày đầu kỳ)', type: 'number', value: 5 }],
        submit: 'Tạo HĐ', onSubmit: (x) => { const c = X.addOwnerContract(Object.assign(x, { buildingId: b.id })); U.toast('ok', 'Đã tạo ' + c.code); TH.go('#/owners/' + c.id); } });
      U.bind(body, { addoc: addOc });
      body.innerHTML = oc ? `<div class="two-col"><div>${U.card({ title: 'Hợp đồng thuê đầu vào ' + esc(oc.code), icon: 'file-text', actions: `<a class="btn btn-ghost btn-sm" href="#/owners/${oc.id}">Mở chi tiết</a>`, body: U.kv([['Chủ nhà', esc(own.name)], ['Hiệu lực', F.date(oc.startDate) + ' → ' + F.date(oc.endDate)], ['Giá thuê hiện hành', F.vndd(X.ownerRentAt(oc.id, F.today()))], ['Cọc chủ nhà', F.vndd(oc.deposit)], ['Kỳ trả', oc.payCycleMonths + ' tháng/lần, hạn ngày ' + oc.payDay]]) })}</div>
        <div>${U.card({ title: 'Lịch sử giá', icon: 'history', body: vs.map(v => `<div class="mini-row"><span>${F.date(v.from)} → ${v.to ? F.date(v.to) : 'nay'}</span><b class="grow tr">${F.vndd(v.monthlyRent)}</b></div>`).join('') })}</div></div>` : U.empty({ title: 'Chưa có hợp đồng đầu vào', action: TH.auth.can('owners.manage') ? U.btn({ label: 'Tạo chủ nhà & HĐ đầu vào', icon: 'plus', cls: 'btn-primary', act: 'addoc' }) : '' });
    }
    if (tab === 'lich-tra') {
      const ops = S.where('ownerPayments', o => o.buildingId === b.id).sort((a, c) => a.dueDate.localeCompare(c.dueDate));
      body.innerHTML = K.tableCard('ot', 'Lịch trả tiền nhà', `<a class="btn btn-ghost btn-sm" href="#/owner-payments?building=${b.id}">Mở lịch trả</a>`);
      U.table(body.querySelector('#ot'), { rows: ops, noPager: true, cols: ownerPayCols() });
      U.bind(body, { 'op-pay': (el) => TH.pages.ownerPayDrawer(el.dataset.id) });
    }
    if (tab === 'nhan-su') {
      const as = S.where('assignments', a => a.buildingId === b.id).sort((a, c) => String(c.from).localeCompare(String(a.from)));
      body.innerHTML = K.tableCard('nt', 'Phân công theo thời gian', `<a class="btn btn-ghost btn-sm" href="#/hr/assignments?building=${b.id}">Chuyển phân công</a>`);
      U.table(body.querySelector('#nt'), { rows: as, noPager: true, cols: [
        { key: 'e', label: 'Nhân viên', render: a => `<a href="#/hr/staff/${a.employeeId}">${esc((Q.emp(a.employeeId) || {}).name || '')}</a>` },
        { key: 't', label: 'Chức danh', render: a => esc((TH.data.catalog.titles[(Q.emp(a.employeeId) || {}).title]) || '') },
        { key: 'sc', label: 'Phạm vi', render: a => a.roomId ? U.chip('Phòng ' + Q.roomCode(a.roomId), 'purple') : U.chip('Cả tòa', 'gray') }, { key: 'r', label: 'Trách nhiệm', render: a => esc(TH.data.catalog.responsibilities[a.responsibility] || a.responsibility) },
        { key: 'f', label: 'Từ', render: a => F.date(a.from) }, { key: 'to', label: 'Đến', render: a => a.to ? F.date(a.to) : U.chip('Hiệu lực', 'green') },
        { key: 'l', label: 'Leader', render: a => esc((Q.leaderOf(a.employeeId, a.to || F.today()) || {}).name || '–') },
      ] });
    }
    if (tab === 'dich-vu-dau-vao') {
      const v = b.vendor || {};
      const bills = (k) => Object.entries((v[k] || {}).bills || {}).sort().map(([m, a]) => `<div class="mini-row"><span>${F.periodShort(m)}</span><b class="grow tr">${F.vnd(a)}</b></div>`).join('') || '<span class="muted small">Chưa có hóa đơn</span>';
      body.innerHTML = `<div class="grid grid-3">${[['electric', 'Điện', 'zap'], ['water', 'Nước', 'droplet'], ['internet', 'Mạng', 'wifi']].map(([k, l, ic]) => U.card({ title: l, icon: ic, sub: `Mã KH: ${esc((v[k] || {}).code || 'chưa có')} · Chủ HĐ: ${esc((v[k] || {}).holder || '–')}`, body: bills(k) })).join('')}</div>
        ${U.note('info', 'Nguồn', 'Mã khách hàng nhà cung cấp và số tiền hóa đơn 2026 từ file "Danh sách mã HĐ điện nước mạng" (mã đã che). Hóa đơn nhà cung cấp ghi vào Chi phí theo tòa ở mốc 1B.')}`
        + (TH.ms.on('2') ? '<div class="mt16">' + U.card({ title: 'Điện trả qua chủ nhà (UI-43)', icon: 'zap', actions: U.btn({ label: 'Khai báo', icon: 'pencil', size: 'btn-xs', act: 'viaowner', perm: 'expenses.manage' }),
          body: v.electricViaOwner ? U.kv([['Đơn giá trả chủ nhà', v.electricViaOwner.unitPrice ? F.vnd(v.electricViaOwner.unitPrice) + 'đ/kWh' : 'Chưa có – báo cáo âm dương gắn cờ'], ['Hiệu lực từ', F.date(v.electricViaOwner.from)], ['Ghi chú', esc(v.electricViaOwner.note || '–')]]) : '<p class="small muted">Trả trực tiếp nhà cung cấp</p>' }) + '</div>' : '');
      U.bind(body, { viaowner: () => { const vo = v.electricViaOwner || {}; K.formDrawer({ title: 'Điện trả qua chủ nhà – tòa ' + esc(b.code), modal: true, note: U.note('info', '', 'Âm dương điện (web): chi = đơn giá × kWh trên hóa đơn đã phát hành. Để trống đơn giá thì chỉ gắn cờ "chưa có đơn giá".'),
        fields: [{ name: 'on', label: 'Trả điện qua chủ nhà', type: 'check', checkLabel: 'Tòa trả tiền điện qua chủ nhà', value: !!v.electricViaOwner }, { name: 'unitPrice', label: 'Đơn giá (đ/kWh)', type: 'number', value: vo.unitPrice || '' }, { name: 'from', label: 'Hiệu lực từ', type: 'date', value: vo.from || F.today() }, { name: 'note', label: 'Căn cứ', span: true, value: vo.note || '' }],
        submit: 'Lưu', onSubmit: (x) => { X.setElectricViaOwner(b.id, x); U.toast('ok', 'Đã cập nhật'); } }); } });
    }
    if (tab === 'tai-chinh') {
      const exps = S.where('expenses', e => e.buildingId === b.id && e.status !== 'void');
      body.innerHTML = `<div class="grid grid-2">${U.card({ title: 'Hóa đơn theo kỳ', icon: 'receipt', body: S.all('periods').map(pp => { const iv = Q.invoicesOf(pp.id).filter(i => i.buildingId === b.id && i.lifecycle !== 'draft'); if (!iv.length) return ''; const d = iv.reduce((s, i) => s + i.totalDue, 0), r = iv.reduce((s, i) => s + Q.invState(i).remaining, 0); return `<div class="mini-row"><span>${F.periodLabel(pp.id)}</span><span class="grow tr">Phải thu ${F.vnd(d)}</span><b class="tr" style="width:160px">Còn nợ ${F.vnd(r)}</b></div>`; }).join('') })}
        ${U.card({ title: 'Chi phí gắn tòa', icon: 'coins', body: exps.length ? exps.slice(-8).map(e => `<div class="mini-row"><span>${esc(e.code)}</span><span class="grow truncate">${esc(e.note || e.category)}</span><b>${F.vnd(e.amount)}</b></div>`).join('') : '<span class="muted small">Chưa có chi phí</span>' })}</div>`;
    }
  });

  const ownerPayCols = () => [
    { key: 'b', label: 'Tòa', render: o => esc((Q.building(o.buildingId) || {}).code) },
    { key: 'from', label: 'Kỳ từ', render: o => F.date(o.from) }, { key: 'm', label: 'Số tháng', num: true, render: o => o.months },
    { key: 'due', label: 'Hạn trả', render: o => F.date(o.dueDate) },
    { key: 'amt', label: 'Phải trả', num: true, render: o => F.vnd(o.amountDue) },
    { key: 'off', label: 'Bù trừ (khách chủ nhà / sửa chữa chủ nhà chịu)', num: true, render: o => { const v = (o.offsets || []).reduce((s, x) => s + x.amount, 0); return v ? `<span data-tip="${esc((o.offsets || []).map(x => (x.repairId ? 'Sửa chữa ' + ((S.get('repairLogs', x.repairId) || {}).code || '') : (Q.invoice(x.invoiceId) || {}).customerCode) + ' ' + F.vnd(x.amount)).join(' · '))}">${F.vnd(v)}</span>` : '–'; } },
    { key: 'paid', label: 'Đã chi (gồm bù trừ)', num: true, render: o => F.vnd(o.paid) },
    { key: 'rem', label: 'Còn phải trả', num: true, render: o => F.vnd(Math.max(0, o.amountDue - o.paid)) },
    { key: 'st', label: 'Trạng thái', render: o => o.paid >= o.amountDue ? U.chip('Đã trả', 'green') : o.dueDate < F.today() ? U.chip('Quá hạn', 'red') : F.daysBetween(F.today(), o.dueDate) <= 7 ? U.chip('Đến hạn ≤ 7 ngày', 'amber') : U.chip('Chưa đến hạn', 'gray') },
    { key: 'a', label: '', render: o => o.paid < o.amountDue ? U.actBtn({ icon: 'banknote', label: 'Ghi chi', act: 'op-pay', attrs: { 'data-id': o.id }, perm: 'ownerPayments.record' }) : '' },
  ];
  TH.pages.ownerPayCols = ownerPayCols;
})(window.TH);
