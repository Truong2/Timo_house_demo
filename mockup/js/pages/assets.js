/* Phase 3 – UI-34 Tài sản & thiết bị (đặc tả dòng 545) và tab Tài sản ở UI-03. Bố cục giữ ảnh cũ (KPI · lọc · bảng · drawer chi tiết) nhưng nội dung theo đặc tả:
   loại thang máy / máy bơm / máy giặt / máy lọc nước / đồ décor / khác; nguồn sở hữu Chủ nhà / Công ty (không phải "Tòa nhà / Khách thuê");
   mã phòng dạng 501S43; giá trị chỉ khi có chứng từ (link UI-15 / UI-04 / UI-37, không phải "HD-xxxx"); khấu hao theo số tháng + thanh lý (OQ-11). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, A = TH.auth, AS = TH.calc.assets, DT = TH.calc.dates;
  const OWN_TONE = { owner: 'purple', company: 'blue' }, COND_TONE = { good: 'green', repair: 'amber', broken: 'red', missing: 'red' }, ST_TONE = { active: 'green', disposed: 'gray', void: 'gray', removed: 'gray' };
  /* Thanh điều hướng con UI-34 | UI-35 | UI-36 */
  TH.pages.assetNav = (cur) => { const items = [['/assets', 'Tài sản (UI-34)'], ['/assets/maintenance', 'Lịch bảo dưỡng (UI-35)'], ['/assets/inventory', 'Kiểm kê (UI-36)']]
    .filter(([p]) => { const r = TH.routes.ROUTES.find(x => x.path === p); return A.canRoute(r) && TH.ms.on(r.ms); });
    return `<div class="tabs mb16">${items.map(([p, l]) => `<button type="button" class="${p === cur ? 'on' : ''}" onclick="location.hash='#${p}'">${esc(l)}</button>`).join('')}</div>`; };
  const where = (a) => `<span class="code">${esc((Q.building(a.buildingId) || {}).code || '')}</span>${a.roomId ? ' · ' + K.room(a.roomId) : ''}${a.position ? `<br><small class="muted">${esc(a.position)}</small>` : ''}`;
  const evidence = (a) => {
    if (a.expenseId) { const e = S.get('expenses', a.expenseId); return e ? (A.can('expenses.view') ? `<a href="#/expenses?period=${e.period}&q=${encodeURIComponent(e.code)}">${esc(e.code)}</a>` : esc(e.code)) + `<br><small class="muted">UI-15${e.status === 'void' ? ' · đã hủy' : ''}</small>` : '–'; }
    if (a.source === 'handover') return (a.ownerContractId && A.can('owners.view') ? `<a href="#/owners/${a.ownerContractId}">Phụ lục bàn giao</a>` : 'Phụ lục bàn giao') + '<br><small class="muted">UI-04</small>';
    if (a.source === 'opening') return 'Import số dư<br><small class="muted">UI-37</small>';
    if (a.source === 'initial') return `<a href="#/shares/capital?tab=dau-tu-ban-dau&building=${a.buildingId}">Đầu tư ban đầu</a><br><small class="muted">UI-33</small>`;
    return (a.docs || []).length ? esc(a.docs[0].name) : '<span class="muted">chưa có</span>';
  };
  const nextMaint = (a) => Q.maintNextOfAsset ? Q.maintNextOfAsset(a.id) : null;
  const monthsDone = (a, period) => { const s = Q.assetDepSchedule(a, period); return s.length; };

  TH.router.handle('/assets', (root, p, q) => {
    const canVal = A.can('assets.value');
    const period = q.period || S.meta.period;
    const f = { building: q.building, type: q.type, ownership: q.ownership, condition: q.condition, status: q.status || '', room: q.room, q: q.q };
    let rows = Q.assets(Object.assign({}, f, { status: q.status === 'all' ? '' : f.status }));
    if (!q.status) rows = rows.filter(a => a.status === 'active');
    const comp = rows.filter(a => a.ownership === 'company' && a.cost > 0 && (!a.openingPeriod || a.openingPeriod <= period));
    const cost = comp.reduce((t, a) => t + a.cost, 0), nbv = comp.reduce((t, a) => t + TH.calc.depreciation.nbv(a, period), 0);
    const dep = Q.depOfPeriod(period); const sc = A.buildingScope(); const depIn = Object.entries(dep.byBuilding).filter(([b]) => (!sc || sc.has(b)) && (!q.building || b === q.building)).reduce((t, [, v]) => t + v, 0);
    const ms = Q.maintStats ? Q.maintStats({ building: q.building }) : null; const iv = Q.inventoryStats ? Q.inventoryStats(S.meta.period, { building: q.building }) : null;
    root.innerHTML = U.pageHead({ title: 'Tài sản & thiết bị', sub: 'Danh sách tài sản chủ nhà (phụ lục bàn giao – không khấu hao) và tài sản công ty (danh sách đầu tư – khấu hao theo số tháng, GĐ OQ-11). Giao dịch mua gốc nằm ở UI-15.',
      acts: [U.btn({ label: 'Xuất danh sách', icon: 'download', act: 'exp' }), U.btn({ label: 'Nhập từ file (UI-37)', icon: 'upload', href: '#/import?type=equipment', perm: 'import.master' }), q.building ? U.btn({ label: 'Trả nhà – thanh lý toàn bộ', icon: 'log-out', act: 'returnAll', perm: 'assets.dispose' }) : '', U.btn({ label: 'Thêm tài sản', icon: 'plus', cls: 'btn-primary', act: 'add', perm: 'assets.manage' })] })
      + TH.pages.assetNav('/assets')
      + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Dòng tài sản', value: rows.length, cap: 'Σ số lượng ' + F.num0(rows.reduce((t, a) => t + (a.qty || 0), 0)) + ' · chủ nhà ' + rows.filter(a => a.ownership === 'owner').length + ' · công ty ' + rows.filter(a => a.ownership === 'company').length, icon: 'package', tone: 'blue' })}
        ${canVal ? U.kpi({ label: 'Tài sản công ty có giá trị', value: F.vnd(nbv), cap: 'còn lại cuối ' + F.periodShort(period) + ' · nguyên giá ' + F.vnd(cost) + ' · ' + comp.length + ' tài sản', icon: 'wallet', tone: 'teal' }) : ''}
        ${canVal ? `<a class="kpi-link" href="#/reports/business?period=${period}">${U.kpi({ label: 'Khấu hao kỳ ' + F.periodShort(period), value: F.vnd(depIn), cap: 'Báo cáo KD dòng 21 (khấu hao + thanh lý)', icon: 'activity', tone: 'purple' })}</a>` : ''}
        ${ms ? U.kpi({ label: 'Bảo dưỡng', value: ms.overdue + ' quá hạn', cap: ms.soon + ' việc trong ' + ms.remindDays + ' ngày tới (CH-32)', icon: 'wrench', tone: ms.overdue ? 'red' : 'gray' }) : ''}
        ${iv ? U.kpi({ label: 'Kiểm kê ' + F.periodShort(S.meta.period), value: iv.pending + '/' + iv.total + ' tòa', cap: 'chưa duyệt đủ admin + kế toán (CH-33)', icon: 'clipboard-check', tone: iv.pending ? 'amber' : 'green' }) : ''}</div>`
      + K.filters([{ name: 'q', label: 'Từ khóa', type: 'search', placeholder: 'Mã, tên, vị trí…' }, { name: 'type', label: 'Loại', options: AS.TYPES }, { name: 'ownership', label: 'Nguồn sở hữu', options: AS.OWNERSHIP }, { name: 'building', label: 'Tòa', options: K.buildingOpts() },
        ...(q.building ? [{ name: 'room', label: 'Phòng', options: (Q.roomsByBuilding()[q.building] || []).map(r => [r.id, r.code]) }] : []), { name: 'condition', label: 'Tình trạng', options: AS.CONDITIONS },
        { name: 'status', label: 'Trạng thái', options: [['disposed', 'Đã thanh lý'], ['removed', 'Đã loại (kiểm kê)'], ['void', 'Đã hủy'], ['all', 'Mọi trạng thái']], all: 'Đang dùng' }, ...(canVal ? [{ name: 'period', label: 'Kỳ tính giá trị', options: K.periodOpts(), value: period, all: false }] : [])], q)
      + '<div id="tb" class="mt16"></div>';
    K.bindFilters(root);
    const tb = root.querySelector('#tb');
    tb.innerHTML = K.tableCard('t', rows.length + ' tài sản');
    U.table(tb.querySelector('#t'), { rows: rows.slice().sort((a, b) => a.code.localeCompare(b.code)), pageSize: 25, cols: [
      { key: 'c', label: 'Mã TS', sortable: true, sortVal: a => a.code, render: a => `<a href="#" data-act="view" data-id="${a.id}"><b>${esc(a.code)}</b></a>` },
      { key: 'n', label: 'Tên tài sản', render: a => esc(a.name) + (a.status !== 'active' ? ' ' + U.chip(AS.STATUS[a.status], ST_TONE[a.status]) : '') },
      { key: 't', label: 'Loại', render: a => esc(AS.typeLabel(a.type)) }, { key: 'o', label: 'Nguồn sở hữu', render: a => U.chip(AS.ownLabel(a.ownership), OWN_TONE[a.ownership]) },
      { key: 'w', label: 'Tòa / phòng / vị trí', render: where }, { key: 'q', label: 'SL', num: true, render: a => F.num0(a.qty) },
      { key: 'cd', label: 'Tình trạng', render: a => U.chip(AS.condLabel(a.condition), COND_TONE[a.condition] || 'gray', true) }, { key: 'rd', label: 'Ngày nhận / bàn giao', sortable: true, sortVal: a => a.receivedDate, render: a => F.date(a.receivedDate) },
      ...(canVal ? [{ key: 'v', label: 'Nguyên giá / còn lại', num: true, render: a => a.openingPeriod && a.openingPeriod > period ? '<small class="muted">Chờ ghi nhận ' + F.periodShort(a.openingPeriod) + '</small>' : a.cost > 0 ? F.vnd(a.cost) + `<br><small class="muted">còn ${F.vnd(TH.calc.depreciation.nbv(a, period))}</small>` : `<span class="muted small">${a.ownership === 'owner' ? 'không ghi (chủ nhà)' : 'chưa có chứng từ'}</span>` },
        { key: 'kh', label: 'Số tháng KH', render: a => a.cost > 0 ? `${monthsDone(a, period)}/${a.depMonths} tháng` + (a.openingPeriod ? `<br><small class="muted">ghi sổ từ ${F.periodShort(a.openingPeriod)}</small>` : '') : '–' }] : []),
      { key: 'e', label: 'Chứng từ', render: evidence }, { key: 'wt', label: 'Bảo hành đến', render: a => a.warrantyTo ? F.date(a.warrantyTo) : '–' },
      { key: 'm', label: 'Bảo dưỡng tiếp theo', render: a => { const t = nextMaint(a); return t ? `${F.date(t.dueDate)}${t.state.status === 'overdue' ? ' ' + U.chip('quá hạn', 'red') : t.state.soon ? ' ' + U.chip('sắp đến hạn', 'amber') : ''}` : '<span class="muted">–</span>'; } },
      { key: 'a', label: '', render: a => U.actBtn({ icon: 'eye', label: 'Xem', act: 'view', attrs: { 'data-id': a.id } }) }],
      footer: canVal ? (all) => `<tr><td colspan="8"><b>Tổng ${all.length} tài sản</b></td><td class="num"><b>${F.vnd(all.reduce((t, a) => t + (a.cost || 0), 0))}</b></td><td colspan="5"></td></tr>` : null });
    U.bind(root, {
      add: () => assetForm(q.building),
      returnAll: () => returnBuildingForm(q.building),
      view: (el) => detail(el.dataset.id, period),
      exp: () => K.xls('tai-san-' + period + '.xls', 'Tài sản', ['Danh sách tài sản & thiết bị (UI-34)', ['Kỳ tính giá trị', F.periodLabel(period)], ['Phạm vi', sc ? 'Tòa được giao' : 'Toàn hệ thống'], ['Xuất lúc', F.datetime(F.nowISO())]],
        ['Mã', 'Tên', 'Loại', 'Nguồn sở hữu', 'Tòa', 'Phòng', 'Vị trí', 'SL', 'Tình trạng', 'Ngày nhận', ...(canVal ? ['Nguyên giá', 'Còn lại', 'Số tháng KH'] : []), 'Nguồn chứng từ', 'Trạng thái'],
        rows.map(a => [a.code, a.name, AS.typeLabel(a.type), AS.ownLabel(a.ownership), (Q.building(a.buildingId) || {}).code, a.roomId ? Q.roomCode(a.roomId) : '', a.position, a.qty, AS.condLabel(a.condition), a.receivedDate,
          ...(canVal ? [a.cost || '', a.openingPeriod && a.openingPeriod > period ? 'Chờ ghi nhận ' + a.openingPeriod : a.cost ? TH.calc.depreciation.nbv(a, period) : '', a.depMonths || ''] : []), AS.SOURCES[a.source] || '', AS.STATUS[a.status]])),
    });
    if (q.asset) setTimeout(() => detail(q.asset, period), 0);
  });

  /* ---- Form thêm / sửa ---- */
  const roomOpts = (bid) => (Q.roomsByBuilding()[bid] || []).map(r => [r.id, r.code]);
  const assetForm = (bid) => {
    const d = K.formDrawer({ title: 'Thêm tài sản', sub: 'Tài sản chủ nhà: theo phụ lục bàn giao, không ghi giá trị. Tài sản công ty: chỉ ghi nguyên giá khi có chứng từ – khoản mua mới nên ghi ở UI-15 (tự tạo tài sản).', wide: true, fields: [
      { name: 'name', label: 'Tên tài sản', req: true }, { name: 'type', label: 'Loại', type: 'select', req: true, options: AS.TYPES, value: 'other' },
      { name: 'ownership', label: 'Nguồn sở hữu', type: 'select', req: true, options: AS.OWNERSHIP, value: 'company' }, { name: 'buildingId', label: 'Tòa', type: 'select', req: true, options: K.buildingOpts(), value: bid || '' },
      { name: 'roomId', label: 'Phòng (để trống = khu chung)', type: 'select', options: bid ? roomOpts(bid) : [] }, { name: 'position', label: 'Vị trí', placeholder: 'Tầng 1, sảnh, tầng mái…' },
      { name: 'qty', label: 'Số lượng', type: 'number', value: 1, req: true }, { name: 'condition', label: 'Tình trạng', type: 'select', options: AS.CONDITIONS, value: 'good' },
      { name: 'receivedDate', label: 'Ngày nhận / bàn giao', type: 'date', value: F.today(), req: true }, { name: 'warrantyTo', label: 'Bảo hành đến', type: 'date' },
      { name: 'cost', label: 'Nguyên giá (chỉ khi có chứng từ)', type: 'money' }, { name: 'depMonths', label: 'Số tháng khấu hao', type: 'number', value: Q.param('depMonthsDefault') || 63, help: '63 tháng ≈ 1,6%/tháng, tháng cuối 0,8%' },
      { name: 'depStart', label: 'Ngày bắt đầu khấu hao', type: 'date', help: 'Để trống = ngày nhận' }, { name: 'note', label: 'Ghi chú' },
      { type: 'html', span: true, html: U.field({ label: 'Chứng từ / ảnh (bắt buộc khi có nguyên giá)', input: U.dropzone({ name: 'docs', hint: 'PDF, ảnh JPG/PNG', multiple: true }) }) }],
      submit: 'Lưu tài sản', onSubmit: (x, dd) => { const files = U.dzFiles(dd.el, 'docs'); X.addAsset(Object.assign(x, { docName: files[0] ? files[0].name : '' })); U.toast('ok', 'Đã thêm tài sản'); } });
    const el = d.el; const sync = () => { const b = el.querySelector('[name=buildingId]').value; const rs = el.querySelector('[name=roomId]'); if (rs.dataset.b !== b) { rs.dataset.b = b; rs.innerHTML = '<option value="">–</option>' + roomOpts(b).map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join(''); }
      const own = el.querySelector('[name=ownership]').value; ['cost', 'depMonths', 'depStart'].forEach(k => { el.querySelector(`[data-field=${k}]`).hidden = own !== 'company'; }); };
    el.addEventListener('change', sync); sync();
  };
  const editForm = (a) => K.formDrawer({ title: 'Sửa tài sản ' + a.code, modal: true, fields: [{ name: 'name', label: 'Tên', value: a.name, req: true }, { name: 'type', label: 'Loại', type: 'select', options: AS.TYPES, value: a.type },
    { name: 'qty', label: 'Số lượng', type: 'number', value: a.qty }, { name: 'condition', label: 'Tình trạng', type: 'select', options: AS.CONDITIONS, value: a.condition }, { name: 'warrantyTo', label: 'Bảo hành đến', type: 'date', value: a.warrantyTo || '' },
    ...(a.cost > 0 ? [{ name: 'depMonths', label: 'Số tháng khấu hao', type: 'number', value: a.depMonths, help: Q.assetBookedInClosed(a) ? 'Đã có khấu hao trong kỳ đã khóa – không đổi được' : '' }] : []), { name: 'reason', label: 'Lý do sửa', span: true }],
    submit: 'Lưu', onSubmit: (x) => { X.updateAsset(a.id, x); U.toast('ok', 'Đã lưu'); } });
  const moveForm = (a) => { const d = K.formDrawer({ title: 'Chuyển vị trí ' + a.code, sub: 'Ghi lịch sử vị trí; khấu hao kỳ ghi cho tòa đặt tài sản cuối kỳ', modal: true, fields: [
    { name: 'buildingId', label: 'Tòa', type: 'select', options: a.ownership === 'owner' ? [[a.buildingId, (Q.building(a.buildingId) || {}).code]] : K.buildingOpts(), value: a.buildingId }, { name: 'roomId', label: 'Phòng', type: 'select', options: roomOpts(a.buildingId), value: a.roomId || '' },
    { name: 'position', label: 'Vị trí', value: a.position || '' }, { name: 'date', label: 'Ngày chuyển', type: 'date', value: F.today() }, { name: 'reason', label: 'Lý do chuyển', type: 'textarea', req: true, span: true }],
    submit: 'Chuyển', onSubmit: (x) => { X.moveAsset(a.id, x); U.toast('ok', 'Đã chuyển vị trí'); } });
    d.el.addEventListener('change', (e) => { if (e.target.name !== 'buildingId') return; const rs = d.el.querySelector('[name=roomId]'); rs.innerHTML = '<option value="">–</option>' + roomOpts(e.target.value).map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join(''); }); };
  const disposeForm = (a) => { const pr = F.period(F.today()); const remain = TH.calc.depreciation.nbv(a, DT.prevPeriod(pr));
    const d = K.formDrawer({ title: 'Thanh lý ' + a.code, sub: 'Kỳ thanh lý ghi một lần giá trị còn lại vào Báo cáo kinh doanh dòng 21 (GĐ OQ-11); Báo cáo tổng không đổi', modal: true,
      note: '<div id="disposal-preview">' + U.note('warn', 'Giá trị còn lại đầu kỳ ' + F.periodShort(pr) + ': ' + F.vnd(remain) + 'đ', 'Tiền thu thanh lý chỉ ghi nhận, chưa vào doanh thu (GĐ-P3 O4). Không thanh lý trong kỳ đã khóa.') + '</div>',
      fields: [{ name: 'date', label: 'Ngày thanh lý', type: 'date', value: F.today(), req: true }, { name: 'proceeds', label: 'Tiền thu thanh lý (nếu có)', type: 'money' }, { name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }],
      submit: 'Thanh lý', onSubmit: (x) => { X.disposeAsset(a.id, x); U.toast('ok', 'Đã thanh lý ' + a.code); } });
    d.el.querySelector('[name=date]').addEventListener('change', e => { const p = F.period(e.target.value || F.today()), remaining = TH.calc.depreciation.nbv(a, DT.prevPeriod(p)); d.el.querySelector('#disposal-preview').innerHTML = U.note('warn', 'Giá trị còn lại đầu kỳ ' + F.periodShort(p) + ': ' + F.vnd(remaining) + 'đ', 'Tiền thu thanh lý chỉ ghi nhận, chưa vào doanh thu. Kỳ đã khóa không thanh lý được.'); }); };

  /* ---- Drawer chi tiết: Thông tin | Khấu hao | Lịch sử vị trí | Bảo dưỡng | Kiểm kê | Tệp ---- */
  const HK = { create: 'Tạo', move: 'Chuyển vị trí', edit: 'Sửa', dispose: 'Thanh lý', void: 'Hủy theo chứng từ', inventory: 'Kiểm kê' };
  const detail = (id, period) => {
    const a = Q.asset(id); if (!a || !A.inScope(a.buildingId)) return;
    const canVal = A.can('assets.value');
    const tabs = [{ key: 'info', label: 'Thông tin' }, ...(a.cost > 0 && canVal ? [{ key: 'kh', label: 'Khấu hao' }] : []), { key: 'ls', label: 'Lịch sử vị trí', count: (a.history || []).length }, { key: 'bd', label: 'Bảo dưỡng' }, { key: 'kk', label: 'Kiểm kê' }, { key: 'tep', label: 'Tệp', count: (a.docs || []).length }];
    let cur = 'info';
    const body = () => {
      const b = Q.building(a.buildingId) || {};
      if (cur === 'info') return U.kv([['Mã', esc(a.code)], ['Tên', esc(a.name)], ['Loại', esc(AS.typeLabel(a.type))], ['Nguồn sở hữu', U.chip(AS.ownLabel(a.ownership), OWN_TONE[a.ownership])], ['Tòa', esc(b.code || '')], ['Phòng', a.roomId ? esc(Q.roomCode(a.roomId)) : 'Khu chung'],
        ['Vị trí', esc(a.position || '–')], ['Số lượng', F.num0(a.qty)], ['Tình trạng', U.chip(AS.condLabel(a.condition), COND_TONE[a.condition])], ['Ngày nhận / bàn giao', F.date(a.receivedDate)], ['Bảo hành đến', a.warrantyTo ? F.date(a.warrantyTo) : '–'],
        ['Nguồn dữ liệu', esc(AS.SOURCES[a.source] || '')], ['Chứng từ', evidence(a)], ...(canVal && a.cost > 0 ? [['Nguyên giá', F.vnd(a.cost)], ['Số tháng khấu hao', a.depMonths + ' tháng (' + F.pctv(TH.calc.depreciation.rateOf(a)) + '/tháng)'], ['Bắt đầu khấu hao', F.date(a.depStart)], ['Giá trị còn lại cuối ' + F.periodShort(period), F.vnd(TH.calc.depreciation.nbv(a, period))]] : []),
        ['Trạng thái', U.chip(AS.STATUS[a.status], ST_TONE[a.status])], ...(a.disposal ? [['Thanh lý', F.date(a.disposal.date) + ' · còn lại ghi một lần ' + F.vnd(a.disposal.remaining) + (a.disposal.proceeds ? ' · thu ' + F.vnd(a.disposal.proceeds) : '') + '<br><small>' + esc(a.disposal.reason) + '</small>']] : []), ['Ghi chú', esc(a.note || '–')]]);
      if (cur === 'kh') { const sch = Q.assetDepSchedule(a, DT.nextPeriod(period)); const last = sch[sch.length - 1];
        return U.note('info', 'Khấu hao ' + a.depMonths + ' tháng – tháng 1…' + (a.depMonths - 1) + ' mỗi tháng ' + F.pctv(TH.calc.depreciation.rateOf(a)) + ', tháng cuối nửa mức', 'Báo cáo kinh doanh (UI-30) dòng 21 ghi khấu hao từng kỳ; Báo cáo tổng (UI-29) ghi nguyên giá một lần ở kỳ mua.' + (a.openingPeriod ? ' Số dư đầu kỳ: chỉ ghi vào báo cáo web từ kỳ ' + F.periodShort(a.openingPeriod) + '.' : ''))
          + `<div class="tbl-wrap mt12"><table class="tbl compact"><thead><tr><th>Kỳ</th><th>Tháng thứ</th><th class="num">Khấu hao</th><th class="num">Lũy kế</th><th class="num">Còn lại</th><th>Ghi sổ web</th></tr></thead><tbody>${sch.slice(-24).map((s, i, arr) => `<tr class="${s.kind === 'disposal' ? 'tint-amber' : ''}"><td>${F.periodShort(s.period)}</td><td>${sch.length - arr.length + i + 1}${s.kind === 'disposal' ? ' ' + U.chip('thanh lý', 'amber') : ''}</td><td class="num">${F.vnd(s.amount)}</td><td class="num">${F.vnd(s.accumulated)}</td><td class="num">${F.vnd(s.remaining)}</td><td>${s.booked ? '✔' : '<span class="muted">trước ghi sổ</span>'}</td></tr>`).join('')}</tbody></table></div>`
          + (last ? `<p class="small muted mt8">Đến ${F.periodShort(last.period)}: lũy kế ${F.vnd(last.accumulated)} / ${F.vnd(a.cost)}${sch.length > 24 ? ' · hiện 24 kỳ gần nhất' : ''}</p>` : ''); }
      if (cur === 'ls') return U.timeline((a.history || []).slice().reverse().map(h => ({ when: F.date(h.date) + ' · ' + (h.by || ''), title: HK[h.kind] || h.kind,
        sub: (h.kind === 'move' ? `${esc((Q.building(h.before.buildingId) || {}).code || '')} ${h.before.roomId ? esc(Q.roomCode(h.before.roomId)) : esc(h.before.position || '')} → ${esc((Q.building(h.after.buildingId) || {}).code || '')} ${h.after.roomId ? esc(Q.roomCode(h.after.roomId)) : esc(h.after.position || '')}` : '') + (h.reason ? ' – ' + esc(h.reason) : '') })));
      if (cur === 'bd') { const ts = Q.maintOfAsset ? Q.maintOfAsset(a.id) : []; return ts.length ? `<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Mã</th><th>Loại BD</th><th>Hạn</th><th>Trạng thái</th><th>Kết quả</th></tr></thead><tbody>${ts.map(t => `<tr><td>${esc(t.code)}</td><td>${esc(t.kind)}</td><td>${F.date(t.dueDate)}</td><td>${TH.pages.maintChip ? TH.pages.maintChip(t) : esc(t.status)}</td><td class="small">${esc(t.result || '')}</td></tr>`).join('')}</tbody></table></div>` : U.empty({ icon: 'wrench', title: 'Chưa có lịch bảo dưỡng', text: 'Lập lịch ở UI-35' }); }
      if (cur === 'kk') { const ls = Q.inventoryLinesOfAsset ? Q.inventoryLinesOfAsset(a.id) : []; return ls.length ? `<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Kỳ</th><th class="num">Sổ</th><th class="num">Thực</th><th>Tình trạng</th><th>Người kiểm</th></tr></thead><tbody>${ls.map(l => `<tr><td>${F.periodShort(l.period)}</td><td class="num">${l.bookQty}</td><td class="num">${l.actualQty == null ? '–' : l.actualQty}</td><td>${esc(AS.condLabel(l.condition))}</td><td>${esc(l.checkedBy || '')}</td></tr>`).join('')}</tbody></table></div>` : U.empty({ icon: 'clipboard-check', title: 'Chưa có kết quả kiểm kê', text: 'Phiên kiểm kê mở đầu mỗi tháng theo tòa (UI-36)' }); }
      if (cur === 'tep') return (a.docs || []).length ? a.docs.map(f => U.fileItem({ name: f.name, date: f.at, size: f.by || '' })).join('') : U.empty({ icon: 'file', title: 'Chưa có tệp' });
      return '';
    };
    const acts = a.status !== 'active' ? '' : [U.btn({ label: 'Sửa', icon: 'pencil', act: 'ed', perm: 'assets.manage', size: 'btn-sm' }), U.btn({ label: 'Chuyển vị trí', icon: 'arrow-left-right', act: 'mv', perm: 'assets.manage', size: 'btn-sm' }),
      a.ownership === 'company' ? U.btn({ label: 'Thanh lý', icon: 'trash', act: 'dp', perm: 'assets.dispose', size: 'btn-sm' }) : '',
      U.btn({ label: 'Mở lịch bảo dưỡng', icon: 'wrench', href: '#/assets/maintenance?asset=' + a.id, size: 'btn-sm' }), A.can('inventory.view') ? U.btn({ label: 'Mở kiểm kê', icon: 'clipboard-check', href: '#/assets/inventory?building=' + a.buildingId, size: 'btn-sm' }) : ''].join('');
    const d = U.drawer({ title: esc(a.code) + ' – ' + esc(a.name), sub: AS.ownLabel(a.ownership) + ' · ' + esc((Q.building(a.buildingId) || {}).code || ''), wide: true,
      body: `<div class="row wrap gap8 mb12">${acts}</div>${U.tabs(tabs, cur, '', 'dtab')}<div class="mt12" id="ab">${body()}</div>` });
    TH.auth.enforceUI(d.el);
    U.bind(d.el, { dtab: (el) => { cur = el.dataset.key; d.el.querySelectorAll('[data-act=dtab]').forEach(x => x.classList.toggle('on', x.dataset.key === cur)); d.el.querySelector('#ab').innerHTML = body(); },
      ed: () => { d.close(); editForm(a); }, mv: () => { d.close(); moveForm(a); }, dp: () => { d.close(); disposeForm(a); } });
  };
  /* Trả nhà trước hạn (GĐ OQ-11): thanh lý một lần mọi tài sản công ty còn dùng của tòa */
  const returnBuildingForm = (bid) => { const b = Q.building(bid), comp = Q.assets({ building: bid, ownership: 'company', status: 'active' });
    const preview = (date) => { const p = F.period(date || F.today()); return U.note('warn', comp.length + ' tài sản công ty · giá trị còn lại đầu kỳ ' + F.periodShort(p) + ': ' + F.vnd(comp.reduce((t, a) => t + (a.cost > 0 ? TH.calc.depreciation.nbv(a, DT.prevPeriod(p)) : 0), 0)) + 'đ',
      'Ghi một lần vào Báo cáo kinh doanh dòng 21 kỳ thanh lý; Báo cáo tổng không đổi. Tài sản chủ nhà trả lại theo phụ lục bàn giao, không ghi giá trị. Không thanh lý trong kỳ đã khóa.'); };
    const d = K.formDrawer({ title: 'Trả nhà ' + (b ? b.code : '') + ' – thanh lý toàn bộ', sub: 'Trả nhà trước hạn / chấm dứt HĐ chủ nhà (GĐ OQ-11)', modal: true, note: '<div id="return-preview">' + preview(F.today()) + '</div>',
      fields: [{ name: 'date', label: 'Ngày trả nhà', type: 'date', value: F.today(), req: true }, { name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }],
      submit: 'Thanh lý ' + comp.length + ' tài sản', onSubmit: (x) => { const r = X.disposeBuildingAssets(bid, x); U.toast('ok', 'Đã thanh lý ' + r.count + ' tài sản', 'Giá trị còn lại ' + F.vnd(r.remaining) + 'đ'); } });
    d.el.querySelector('[name=date]').addEventListener('change', e => { d.el.querySelector('#return-preview').innerHTML = preview(e.target.value); }); };
  TH.pages.returnBuildingForm = returnBuildingForm;
  TH.pages.assetDetail = detail;

  /* ---- UI-03 tab Tài sản: liên kết UI-34 / UI-35 / UI-36, cọc chủ nhà UI-04 (chỉ liệt kê, không vào doanh thu) ---- */
  TH.pages.buildingAssetsTab = (b) => {
    const all = Q.assets({ building: b.id }); const own = all.filter(a => a.ownership === 'owner'), comp = all.filter(a => a.ownership === 'company');
    const period = S.meta.period; const canVal = A.can('assets.value');
    const bookedNbv = a => a.openingPeriod && a.openingPeriod > period ? 0 : TH.calc.depreciation.nbv(a, period);
    const oc = S.one('ownerContracts', c => c.buildingId === b.id);
    const nxt = (Q.maintOfBuilding ? Q.maintOfBuilding(b.id) : []).filter(t => t.status === 'planned').sort((x, y) => x.dueDate.localeCompare(y.dueDate))[0];
    const iv = Q.inventorySession && period <= F.period(F.today()) ? Q.inventorySession(period, b.id) : null;
    const list = (arr) => arr.length ? `<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Mã</th><th>Tên</th><th>Loại</th><th>Vị trí</th><th class="num">SL</th><th>Tình trạng</th>${canVal ? '<th class="num">Còn lại</th>' : ''}</tr></thead><tbody>${arr.map(a => `<tr><td><a href="#/assets?building=${b.id}&asset=${a.id}">${esc(a.code)}</a></td><td>${esc(a.name)}</td><td>${esc(AS.typeLabel(a.type))}</td><td class="small">${a.roomId ? esc(Q.roomCode(a.roomId)) : esc(a.position || '')}</td><td class="num">${F.num0(a.qty)}</td><td>${U.chip(AS.condLabel(a.condition), COND_TONE[a.condition], true)}</td>${canVal ? `<td class="num">${a.openingPeriod && a.openingPeriod > period ? 'Chờ ghi nhận ' + F.periodShort(a.openingPeriod) : a.cost > 0 ? F.vnd(bookedNbv(a)) : '–'}</td>` : ''}</tr>`).join('')}</tbody></table></div>` : U.empty({ icon: 'package', title: 'Chưa có tài sản' });
    return `<div class="grid grid-4 mb16">${U.kpi({ label: 'Tài sản chủ nhà', value: own.length + ' dòng', cap: 'phụ lục bàn giao – không khấu hao', icon: 'home', tone: 'purple' })}
        ${U.kpi({ label: 'Tài sản công ty', value: comp.length + ' dòng', cap: canVal ? 'còn lại đã ghi sổ ' + F.vnd(comp.reduce((t, a) => t + bookedNbv(a), 0)) + 'đ' : '', icon: 'package', tone: 'blue' })}
        ${A.can('owners.view') && oc ? U.kpi({ label: 'Cọc chủ nhà (UI-04)', value: F.vnd(oc.deposit || 0), cap: 'phải thu hồi khi kết thúc HĐ – không vào doanh thu', icon: 'lock', tone: 'teal' }) : ''}
        ${U.kpi({ label: 'Bảo dưỡng kế tiếp', value: nxt ? F.date(nxt.dueDate) : '–', cap: nxt ? esc(nxt.kind) : 'chưa có lịch', icon: 'wrench', tone: nxt && nxt.dueDate < F.today() ? 'red' : 'gray' })}</div>`
      + `<div class="row wrap gap8 mb12">${comp.length ? U.btn({ label: 'Trả nhà – thanh lý toàn bộ', icon: 'log-out', act: 'returnAll', perm: 'assets.dispose', size: 'btn-sm' }) : ''}<a class="btn btn-ghost btn-sm" href="#/assets?building=${b.id}">Mở UI-34 tài sản</a>${A.can('maintenance.view') ? `<a class="btn btn-ghost btn-sm" href="#/assets/maintenance?building=${b.id}">Lịch bảo dưỡng UI-35</a>` : ''}${A.can('inventory.view') ? `<a class="btn btn-ghost btn-sm" href="#/assets/inventory?building=${b.id}">Kiểm kê UI-36${iv ? ' · ' + esc(TH.pages.invStatusLabel ? TH.pages.invStatusLabel(iv) : '') : ''}</a>` : ''}</div>`
      + U.card({ title: 'Tài sản chủ nhà – phụ lục bàn giao (' + own.length + ')', icon: 'home', body: list(own), bodyCls: 'flush' })
      + U.card({ title: 'Tài sản công ty (' + comp.length + ')', icon: 'package', body: list(comp), bodyCls: 'flush', cls: 'mt16' });
  };
})(window.TH);
