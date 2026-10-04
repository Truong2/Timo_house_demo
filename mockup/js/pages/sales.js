/* UI-19 Tổng quan hàng hóa cho sale · UI-20 Khách tiềm năng & lượt xem (E08 trùng liên hệ). Đặc tả §3.5 dòng 286–293.
   Sale chỉ thấy khách / deal của mình; trưởng nhóm KD thấy team; admin, kế toán thấy tất cả. "Chốt" khác "đã nhận". */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, A = TH.auth;
  const cnt = (v) => String(Math.round(v * 100) / 100).replace('.', ',');
  const phone = (p) => A.can('customers.phone') ? esc(p) : esc(F.mask(p, 3));
  const saleOpts = () => { const sc = A.salesScope(); return Q.salesStaff().filter(e => !sc || sc.has(e.id)).map(e => [e.id, e.name + ' · ' + e.title]); };
  const tabsNav = (cur) => `<div class="subnav mb16">${[['sales', 'Tổng quan hàng', '#/sales'], ['leads', 'Khách xem', '#/sales/leads'], ['deals', 'Giao dịch chốt', '#/sales/deals'], ['commission', 'Hoa hồng', '#/sales/commission', 'commission.view']]
    .filter(x => !x[3] || A.can(x[3])).map(([k, l, h]) => `<a class="${k === cur ? 'on' : ''}" href="${h}">${l}</a>`).join('')}</div>`;
  TH.salesNav = tabsNav;
  const KIND = { now: ['Trống ở luôn', 'green'], eom: ['Trống cuối tháng', 'blue'], clean: ['Cần dọn', 'amber'] };

  TH.router.handle('/sales', (root, p, q) => {
    const period = q.period || S.meta.period;
    const areaOf = (bId) => (Q.building(bId) || {}).areaId;
    let deals = Q.salesScoped(S.all('deals'));
    if (q.area) deals = deals.filter(d => areaOf(d.buildingId) === q.area);
    if (q.sale) deals = deals.filter(d => (d.saleIds || []).includes(q.sale));
    if (q.leader) { const br = A.branchOf(q.leader, F.today()); deals = deals.filter(d => (d.saleIds || []).some(id => br.has(id))); }
    const inP = (x) => x && F.period(x) === period;
    const closed = deals.filter(d => inP(d.closeDate) && !['cancelled', 'forfeited'].includes(d.status)); // OQ-25: hủy / bỏ cọc tách riêng
    const received = deals.filter(d => d.status === 'received' && inP(d.moveInDate));
    let forSale = Q.forSale(); if (q.area) forSale = forSale.filter(x => areaOf(x.room.buildingId) === q.area);
    // Phòng lên lại để bán trong kỳ: lượt thuê kết thúc (phá HĐ, bỏ trốn, hết hạn, bỏ cọc) và phòng chưa có khách mới
    const back = S.where('stays', s => s.status === 'ended' && inP(s.endDate) && ['breach', 'abscond', 'expired', 'forfeit'].includes(s.endType) && !Q.currentStay(s.roomId) && !Q.pendingStay(s.roomId))
      .filter(s => !q.area || areaOf(s.buildingId) === q.area);
    const rooms = new Set(closed.map(d => d.roomId)); // phòng nhiều sale giới thiệu chỉ đếm 1 lần
    root.innerHTML = U.pageHead({ title: 'Tổng quan hàng hóa', sub: 'Phòng còn bán, đã chốt, đã nhận theo khu, trưởng nhóm, sale và kỳ · "Chốt" khác "đã nhận" · phòng nhiều sale chỉ đếm một lần', acts: [U.btn({ label: 'Thêm khách xem', icon: 'user-plus', cls: 'btn-primary', href: '#/sales/leads?new=1', perm: 'sales.manage' })] })
      + tabsNav('sales')
      + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Còn bán', value: forSale.length, cap: forSale.filter(x => x.kind === 'now').length + ' ở luôn · ' + forSale.filter(x => x.kind === 'eom').length + ' cuối tháng · ' + forSale.filter(x => x.kind === 'clean').length + ' cần dọn', icon: 'door', tone: 'green' })}
        ${U.kpi({ label: 'Đã chốt ' + F.periodShort(period) + ' (phòng)', value: rooms.size, cap: closed.length + ' giao dịch · ' + F.vnd(closed.reduce((t, d) => t + d.price, 0)) + 'đ giá chốt', icon: 'check-circle', tone: 'blue' })}
        ${U.kpi({ label: 'Đã nhận phòng ' + F.periodShort(period), value: received.length, cap: deals.filter(d => d.status === 'closed').length + ' deal đang chờ nhận (mọi kỳ)', icon: 'log-in', tone: 'purple' })}
        ${U.kpi({ label: 'Lên lại từ phá HĐ / hoàn cọc', value: back.length, cap: 'trong kỳ, chưa có khách mới', icon: 'refresh', tone: 'amber' })}</div>`
      + K.filters([{ name: 'period', label: 'Kỳ', options: K.periodOpts(), value: S.meta.period, all: false }, { name: 'area', label: 'Khu vực', options: K.areaOpts() },
        { name: 'leader', label: 'Trưởng nhóm', options: Q.teamLeaders().filter(e => ['TNKD', 'TPVH', 'QL TỔNG'].includes(e.title)).map(e => [e.id, e.name + ' · ' + e.title]) }, { name: 'sale', label: 'Sale', options: saleOpts() }], q)
      + `<div class="grid grid-2 mt16"><div>${K.tableCard('fs', 'Phòng còn bán (' + forSale.length + ')')}</div><div>${K.tableCard('bs', 'Theo sale – ' + F.periodLabel(period))}</div></div>`
      + '<div class="mt16">' + K.tableCard('dl', 'Giao dịch chốt trong kỳ (' + closed.length + ')') + '</div>';
    K.bindFilters(root);
    U.table(root.querySelector('#fs'), { rows: forSale, pageSize: 10, rowHref: x => '#/buildings/' + x.room.buildingId + '?tab=phong&room=' + x.room.id, cols: [
      { key: 'r', label: 'Phòng', render: x => `<span class="code">${esc(x.room.code)}</span>` }, { key: 'a', label: 'Khu', render: x => esc((S.get('areas', areaOf(x.room.buildingId)) || {}).name || '') },
      { key: 'p', label: 'Giá niêm yết', num: true, sortable: true, sortVal: x => x.room.price, render: x => F.vnd(x.room.listPrice || x.room.price) }, { key: 'k', label: 'Tình trạng', render: x => U.chip(KIND[x.kind][0], KIND[x.kind][1], true) }] });
    const vol = TH.calc.commission.salesVolume(closed.concat(deals.filter(d => inP(d.closeDate) && ['cancelled', 'forfeited'].includes(d.status))));
    const bySale = Object.entries(vol).map(([id, v]) => ({ id, v, rec: received.filter(d => d.saleIds.includes(id)).length })).sort((a, b) => b.v.volume - a.v.volume);
    U.table(root.querySelector('#bs'), { rows: bySale, pageSize: 10, cols: [{ key: 'n', label: 'Sale', render: x => esc((Q.emp(x.id) || {}).name || '?') }, { key: 'c', label: 'Chốt', num: true, render: x => cnt(x.v.count) },
      { key: 'r', label: 'Đã nhận', num: true, render: x => x.rec }, { key: 'x', label: 'Hủy / bỏ cọc', num: true, render: x => cnt(x.v.cancelled) }, { key: 'v', label: 'Doanh số (Σ giá chốt)', num: true, render: x => F.vnd(x.v.volume) }] });
    U.table(root.querySelector('#dl'), { rows: closed.sort((a, b) => b.closeDate.localeCompare(a.closeDate)), pageSize: 10, rowHref: d => '#/sales/deals/' + d.id, cols: [
      { key: 'c', label: 'Mã', render: d => `<b>${esc(d.code)}</b>` }, { key: 'd', label: 'Ngày chốt', render: d => F.date(d.closeDate) }, { key: 'r', label: 'Phòng', render: d => K.room(d.roomId) },
      { key: 's', label: 'Sale', render: d => esc(Q.saleName(d.saleIds)) }, { key: 'p', label: 'Giá chốt', num: true, render: d => F.vnd(d.price) }, { key: 'k', label: 'Loại', render: d => esc(Q.dealKind(d)) },
      { key: 'st', label: 'Trạng thái', render: d => U.chip(Q.DEAL_ST[d.status][0], Q.DEAL_ST[d.status][1], true) }] });
  });

  /* ---------- UI-20 ---------- */
  const leadDrawer = (l) => {
    const vs = Q.viewingsOf(l.id); const deal = S.one('deals', d => d.leadId === l.id && d.status !== 'cancelled');
    const own = A.inSales(l.saleIds);
    const d = U.drawer({ title: 'Khách ' + l.code + ' · ' + esc(l.name), sub: phone(l.phone) + ' · ' + esc(l.source) + (l.partner ? ' · ' + esc(l.partner) : '') + ' · sale ' + esc(Q.saleName(l.saleIds)), wide: true,
      body: U.kv([['Trạng thái', U.chip(Q.LEAD_ST[l.status][0], Q.LEAD_ST[l.status][1], true)], ['Nhóm nguồn', esc(l.group || '')], ['Ngày gửi khách', F.date(l.sentAt)], ['Khu vực', esc((S.get('areas', l.areaId) || {}).name || '–')], ['Giao dịch', deal ? `<a href="#/sales/deals/${deal.id}">${esc(deal.code)}</a>` : '–']])
        + (l.note ? U.note('info', 'Ghi chú', esc(l.note)) : '')
        + U.section('Lượt xem (' + vs.length + ')') + (vs.length ? `<table class="tbl compact"><thead><tr><th>Ngày</th><th>Phòng</th><th class="num">Giá</th><th>Kết quả</th></tr></thead><tbody>${vs.map(v => `<tr><td>${F.date(v.date)}</td><td>${K.room(v.roomId)}</td><td class="num">${F.vnd((Q.room(v.roomId) || {}).price)}</td><td>${U.chip({ closed: 'Chốt', viewed: 'Đã xem', lost: 'Không thuê' }[v.result] || v.result, v.result === 'closed' ? 'green' : v.result === 'lost' ? 'red' : 'blue')}</td></tr>`).join('')}</tbody></table>` : U.empty({ icon: 'eye', title: 'Chưa có lượt xem' }))
        + U.note('info', '', 'Khách thuê (UI-07) chỉ được tạo khi chốt giao dịch – không tạo khách thuê từ khách xem.'),
      footer: own && l.status !== 'closed' ? [U.btn({ label: 'Thêm lượt xem', icon: 'eye', act: 'view', perm: 'sales.manage' }), U.btn({ label: 'Không thuê', icon: 'x', act: 'lost', perm: 'sales.manage' }), (TH.calc.rbac.ROLES[A.role()] || {}).sales !== 'own' ? U.btn({ label: 'Chuyển sale', icon: 'users', act: 'assign', perm: 'sales.manage' }) : '', U.btn({ label: 'Chốt thuê', icon: 'check-circle', cls: 'btn-primary', act: 'close', perm: 'deals.close' })].join('') : U.btn({ label: 'Đóng', act: 'x' }) });
    U.bind(d.el, {
      x: () => d.close(),
      view: () => { d.close(); K.formDrawer({ title: 'Thêm lượt xem – ' + l.code, modal: true, fields: [{ name: 'roomId', label: 'Phòng', type: 'select', req: true, options: roomOpts(l) }, { name: 'date', label: 'Ngày xem', type: 'date', value: F.today(), req: true }, { name: 'note', label: 'Ghi chú', span: true }],
        submit: 'Lưu', onSubmit: (x) => { X.addViewing(l.id, x); U.toast('ok', 'Đã thêm lượt xem'); } }); },
      lost: () => { d.close(); K.formDrawer({ title: 'Khách không thuê – ' + l.code, modal: true, fields: [{ name: 'note', label: 'Lý do', req: true, span: true }], submit: 'Lưu', onSubmit: (x) => { X.setLeadStatus(l.id, 'lost', x.note); U.toast('ok', 'Đã cập nhật'); } }); },
      assign: () => { d.close(); K.formDrawer({ title: 'Chuyển sale phụ trách – ' + l.code, modal: true, fields: [{ name: 'saleId', label: 'Sale mới', type: 'select', options: saleOpts(), req: true }, { name: 'reason', label: 'Lý do', req: true, span: true }], submit: 'Chuyển', onSubmit: (x) => { X.assignLead(l.id, x.saleId, x.reason); U.toast('ok', 'Đã chuyển sale'); } }); },
      close: () => { d.close(); closeDrawer(l); },
    });
  };
  const roomOpts = (l) => {
    const seen = new Set(Q.viewingsOf(l.id).map(v => v.roomId));
    const rows = Q.forSale().sort((a, b) => (seen.has(b.room.id) - seen.has(a.room.id)) || a.room.code.localeCompare(b.room.code));
    return rows.map(x => [x.room.id, `${x.room.code} · ${F.vnd(x.room.price)} · ${KIND[x.kind][0]}${seen.has(x.room.id) ? ' · đã xem' : ''}`]);
  };
  /* Sale chia trùng: tối đa 2 người thêm; mặc định sale của lead trùng SĐT (dupOf) */
  const coSaleFields = (l) => {
    const dup = S.all('leads').filter(x => x.id !== l.id && (x.id === l.dupOf || x.dupOf === l.id || x.phone === l.phone)).flatMap(x => x.saleIds).filter(id => !l.saleIds.includes(id));
    const opts = Q.salesStaff().filter(e => !l.saleIds.includes(e.id) && (!A.salesScope() || A.salesScope().has(e.id))).map(e => [e.id, e.name + ' (' + e.title + ')']);
    return [{ name: 'co1', label: 'Sale chia trùng thứ 2', type: 'select', options: opts, value: dup[0] || '', placeholder: 'Không chia trùng', help: 'Khách trùng: 2 người 25%, 3 người 16,67% (theo chính sách)' },
      { name: 'co2', label: 'Sale chia trùng thứ 3', type: 'select', options: opts, value: dup[1] || '', placeholder: 'Không' }];
  };
  /* Chốt thuê (UI-21): ngày chốt, ngày vào ở, ngày tính tiền tách riêng; tạo khách + lượt thuê chờ nhận */
  const closeDrawer = (l) => {
    const first = Q.viewingsOf(l.id).map(v => Q.room(v.roomId)).find(r => r && Q.forSale().some(x => x.room.id === r.id));
    const partners = [...new Set([...S.all('deals').map(d => d.partner), ...S.all('leads').map(x => x.partner)].filter(Boolean))].sort();
    K.formDrawer({ title: 'Chốt thuê – ' + l.code, sub: esc(l.name) + ' · ' + phone(l.phone), wide: true,
      note: U.note('info', '', 'Chốt tạo khách thuê + lượt thuê <b>chờ nhận</b> giữ phòng. Kế toán ghi phiếu cọc ở Phiếu thu (UI-13); khách vào ở thì bấm "Nhận phòng" trên giao dịch.'),
      fields: [{ name: 'roomId', label: 'Phòng', type: 'select', req: true, options: roomOpts(l), value: first ? first.id : '' }, { name: 'name', label: 'Tên khách (trên HĐ)', value: l.name, req: true },
        { name: 'price', label: 'Giá chốt (1 tháng)', type: 'money', req: true, value: first ? first.price : '' }, { name: 'deposit', label: 'Tiền cọc', type: 'money', req: true, value: first ? first.price : '' },
        { name: 'closeDate', label: 'Ngày chốt', type: 'date', value: F.today(), req: true }, { name: 'moveInDate', label: 'Ngày vào ở', type: 'date', value: F.today() },
        { name: 'billingStart', label: 'Ngày tính tiền phòng', type: 'date', value: F.today(), req: true }, { name: 'term', label: 'Thời hạn HĐ (tháng)', type: 'number', value: 12, req: true },
        // A9: khách trùng (cùng SĐT) giữa nhiều sale → chia trùng; gợi ý sale của lead trùng
        ...coSaleFields(l),
        { name: 'partner', label: 'Đối tác giới thiệu (nếu có)', type: 'select', options: partners.map(x => [x, x]), value: l.partner || '', placeholder: 'Không – khách của sale' }, { name: 'occupation', label: 'Nghề nghiệp', type: 'select', options: [['Sinh viên', 'Sinh viên'], ['Người đi làm', 'Người đi làm']], value: 'Người đi làm' },
        { name: 'note', label: 'Ghi chú', span: true }],
      submit: 'Chốt thuê', onSubmit: (x) => { const saleIds = [...new Set([...l.saleIds, x.co1, x.co2].filter(Boolean))]; const deal = X.closeDeal(Object.assign({ leadId: l.id }, x, { saleIds, price: F.num(x.price), deposit: F.num(x.deposit) })); U.toast('ok', 'Đã chốt ' + deal.code); TH.go('#/sales/deals/' + deal.id); } });
  };
  TH.pages.closeDeal = closeDrawer;

  TH.router.handle('/sales/leads', (root, p, q) => {
    let rows = Q.salesScoped(S.all('leads'));
    const all = rows;
    if (q.status) rows = rows.filter(l => l.status === q.status);
    if (q.source) rows = rows.filter(l => l.source === q.source);
    if (q.sale) rows = rows.filter(l => l.saleIds.includes(q.sale));
    if (q.period) rows = rows.filter(l => F.period(l.sentAt) === q.period);
    if (q.area) rows = rows.filter(l => l.areaId === q.area);
    if (q.q) rows = rows.filter(l => K.match(q.q, l.code, l.name, l.phone, l.partner));
    rows.sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt)));
    const vcount = F.by(S.all('viewings'), 'leadId');
    const dupPhones = new Set(); const seen = {}; S.all('leads').forEach(l => { const k = l.phone; if (seen[k]) dupPhones.add(k); seen[k] = 1; }); S.all('customers').forEach(c => { if (seen[c.phone] && S.one('leads', l => l.phone === c.phone && !S.one('deals', d => d.leadId === l.id))) dupPhones.add(c.phone); });
    root.innerHTML = U.pageHead({ title: 'Khách tiềm năng & lượt xem', sub: 'Một khách xem nhiều phòng · phát hiện trùng SĐT (E08) · khách thuê chỉ tạo khi chốt giao dịch', acts: [U.btn({ label: 'Thêm khách', icon: 'user-plus', cls: 'btn-primary', act: 'add', perm: 'sales.manage' })] })
      + tabsNav('leads')
      + `<div class="grid grid-4 mb16">${Object.entries(Q.LEAD_ST).filter(([k]) => k !== 'new').map(([k, v]) => U.kpi({ label: v[0], value: all.filter(l => l.status === k).length, icon: k === 'closed' ? 'check-circle' : k === 'lost' ? 'x-circle' : 'eye', tone: { viewed: 'blue', considering: 'amber', closed: 'green', lost: 'red' }[k] })).join('')}</div>`
      + K.filters([{ name: 'q', type: 'search', label: 'Tìm', placeholder: 'Mã, tên, SĐT, đối tác' }, { name: 'status', label: 'Trạng thái', options: Object.entries(Q.LEAD_ST).map(([k, v]) => [k, v[0]]) },
        { name: 'source', label: 'Nguồn', options: [...new Set(all.map(l => l.source))].map(x => [x, x]) }, { name: 'sale', label: 'Sale', options: saleOpts() }, { name: 'area', label: 'Khu vực', options: K.areaOpts() }, { name: 'period', label: 'Tháng gửi khách', options: [...new Set(all.map(l => F.period(l.sentAt)))].sort().reverse().map(x => [x, F.periodLabel(x)]) }], q)
      + '<div class="mt16">' + K.tableCard('t', rows.length + ' khách') + '</div>';
    K.bindFilters(root);
    U.table(root.querySelector('#t'), { rows, pageSize: 25, onRowOpen: leadDrawer, cols: [
      {key:'stt',label:'STT',num:true,render:(_row,index)=>index+1},
      { key: 'c', label: 'Mã', render: l => `<b>${esc(l.code)}</b>` }, { key: 'n', label: 'Khách', render: l => U.cell2(esc(l.name), phone(l.phone) + (dupPhones.has(l.phone) ? ' ' + U.chip('Trùng SĐT', 'red') : '')) },
      { key: 's', label: 'Nguồn', render: l => U.cell2(esc(l.source), esc(l.partner || l.group || '')) }, { key: 'sl', label: 'Sale', render: l => esc(Q.saleName(l.saleIds)) }, { key: 'tm', label: 'Team', render: l => esc([...new Set(l.saleIds.map(id => (Q.leaderOf(id) || {}).name || '–'))].join(', ')) },
      { key: 'd', label: 'Ngày gửi', sortable: true, sortVal: l => l.sentAt, render: l => F.date(l.sentAt) }, { key: 'v', label: 'Lượt xem', num: true, render: l => (vcount[l.id] || []).length },
      { key: 'r', label: 'Phòng xem gần nhất', render: l => { const v = (vcount[l.id] || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))[0]; return v ? K.room(v.roomId) : '–'; } },
      { key: 'st', label: 'Trạng thái', render: l => U.chip(Q.LEAD_ST[l.status][0], Q.LEAD_ST[l.status][1], true) + ((l.transfers || []).length ? ' ' + U.chip('đã chuyển sale', 'purple') : '') }] });
    const add = () => K.formDrawer({ title: 'Thêm khách xem', wide: true,
      note: U.note('info', 'Trùng liên hệ (E08)', 'Nếu SĐT đã có (khách xem khác hoặc khách thuê), hệ thống báo trùng kèm sale đang phụ trách. Chọn "gắn vào khách cũ" hoặc ghi lý do tạo mới.'),
      fields: [{ name: 'phone', label: 'SĐT', req: true }, { name: 'name', label: 'Tên khách' }, { name: 'source', label: 'Nguồn', type: 'select', req: true, options: ['Facebook', 'Tờ rơi', 'Đăng tin', 'Zalo', 'Đối tác'].map(x => [x, x]) },
        { name: 'group', label: 'Nhóm nguồn', type: 'select', options: ['LEAD - CTV', 'PHÒNG KD', 'SALE VH', 'VẬN HÀNH'].map(x => [x, x]), value: 'PHÒNG KD' }, { name: 'partner', label: 'Đối tác (nếu qua đối tác)' },
        { name: 'saleId', label: 'Sale phụ trách', type: 'select', options: saleOpts(), value: S.session.employeeId }, { name: 'areaId', label: 'Khu vực quan tâm', type: 'select', options: K.areaOpts() },
        { name: 'sentAt', label: 'Ngày gửi khách', type: 'date', value: F.today() }, { name: 'attach', type: 'check', checkLabel: 'SĐT trùng: gắn vào khách cũ (không tạo mới)', span: true }, { name: 'dupReason', label: 'Lý do tạo mới khi trùng SĐT', span: true }, { name: 'note', label: 'Ghi chú', span: true }],
      submit: 'Lưu', onSubmit: (x) => { const hit = x.attach ? X.findContact(x.phone) : null; const l = X.addLead(Object.assign({}, x, { attachTo: hit && hit.lead ? hit.lead.id : null })); U.toast('ok', x.attach ? 'Đã gắn vào ' + l.code : 'Đã thêm khách ' + l.code); } });
    U.bind(root, { add });
    if (q.new) { TH.router.replaceQuery(Object.assign({}, q, { new: '' })); add(); }
  });
})(window.TH);
