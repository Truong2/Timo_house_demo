/* UI-06 Khách thuê / lượt thuê (chế độ xem: đang ở, chờ nhận, sắp hết hạn, đã kết thúc, phá HĐ) · UI-07 tạo khách & lượt thuê. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc;
  const VIEWS = [['active', 'Đang ở'], ['pending', 'Chờ nhận (đã cọc)'], ['expiring', 'Sắp hết hạn'], ['ended', 'Đã kết thúc'], ['broken', 'Phá HĐ / bỏ trốn'], ['all', 'Tất cả']];
  TH.router.handle('/tenants', (root, p, q) => {
    const view = q.view || 'active';
    const warn = Q.param('expiryWarnDays');
    const inv = Q.invoicesByStay();
    const all = Q.scoped(S.all('stays'));
    const counts = {};
    const pick = (v, s) => v === 'all' ? true : v === 'active' ? s.status === 'active' : v === 'pending' ? s.status === 'pending' : v === 'expiring' ? s.status === 'active' && s.endDate && F.daysBetween(F.today(), s.endDate) <= warn && s.endDate >= F.today()
      : v === 'ended' ? s.status === 'ended' : v === 'broken' ? ['breach', 'abscond'].includes(s.endType) : true;
    VIEWS.forEach(([k]) => { counts[k] = all.filter(s => pick(k, s)).length; });
    let rows = all.filter(s => pick(view, s));
    if (q.building) rows = rows.filter(s => s.buildingId === q.building);
    if (q.debt === '1') rows = rows.filter(s => (inv[s.id] || []).some(i => Q.invState(i).remaining > 0));
    if (q.zalo) rows = rows.filter(s => String(!!(Q.customer(s.customerId) || {}).zaloLinked) === q.zalo);
    if (q.q) rows = rows.filter(s => { const c = Q.customer(s.customerId) || {}; return K.match(q.q, s.code, c.name, c.phone, Q.roomCode(s.roomId)); });
    const debtOf = (s) => (inv[s.id] || []).reduce((t, i) => t + Q.invState(i).remaining, 0);
    const brMap = {}; (TH.data.p202609.breach || []).forEach(b => { brMap[b.code] = b; });
    root.innerHTML = U.pageHead({ title: 'Khách thuê', sub: 'Mỗi lượt thuê có mã KH riêng (mã phòng + A001…); cùng phòng khác khách là lượt thuê khác', acts: [
      U.btn({ label: 'Xuất', icon: 'download', act: 'exp' }), U.btn({ label: 'Xem công nợ', icon: 'alert-triangle', href: '#/billing/debts' }), U.btn({ label: 'Tạo khách / lượt thuê', icon: 'user-plus', cls: 'btn-primary', href: '#/tenants/new', perm: 'tenants.manage' })] })
      + U.statusTabs(VIEWS.map(([k, l]) => ({ key: k, label: l, count: counts[k] })), view, 'view')
      + K.filters([{ name: 'q', type: 'search', label: 'Tìm', placeholder: 'Mã KH, mã phòng, tên, SĐT…' }, { name: 'building', label: 'Tòa', options: K.buildingOpts() },
        { name: 'debt', label: 'Công nợ', options: [['1', 'Có nợ']] }, { name: 'zalo', label: 'Zalo', options: [['true', 'Đã liên kết'], ['false', 'Chưa liên kết']] }], q)
      + (view === 'expiring' ? U.note('warn', `${counts.expiring} lượt thuê còn ≤ ${warn} ngày`, 'Mốc cảnh báo cố định toàn hệ thống (CH-09). Cảnh báo không tự đổi trạng thái hợp đồng.') : '')
      + (view === 'broken' ? U.note('info', 'Phá HĐ / bỏ trốn', 'Không hoàn cọc; khoản còn thu = tiền điện theo chỉ số (GĐ OQ-03). Tháng 9/2026: 20 phòng, phải thu 16.048.000 / đã thu 3.662.000.') : '')
      + '<div class="mt16">' + K.tableCard('t', `${rows.length} lượt thuê`) + '</div>';
    K.bindFilters(root, ['view']);
    const money = TH.auth.can('debts.viewAmounts');
    const cols = [
      { key: 'code', label: 'Mã KH', sortable: true, render: s => `<b>${esc(s.code)}</b>` },
      { key: 'room', label: 'Phòng', sortable: true, sortVal: s => Q.roomCode(s.roomId), render: s => `<span class="code">${esc(Q.roomCode(s.roomId))}</span>` },
      { key: 'name', label: 'Khách đại diện', render: s => { const c = Q.customer(s.customerId) || {}; return U.cell2(esc(c.name || ''), esc(Q.pii(c.phone || ''))); } },
      { key: 'mgr', label: 'Quản lý', render: s => esc((Q.managerMap()[s.buildingId] || {}).name || '') },
      { key: 'from', label: 'Ngày tính tiền', sortable: true, sortVal: s => s.rentStart, render: s => F.date(s.rentStart) },
      { key: 'end', label: 'Hết hạn HĐ', sortable: true, sortVal: s => s.endDate, render: s => F.date(s.endDate) },
      { key: 'st', label: 'Trạng thái', render: s => K.stayChip(s) },
      { key: 'dep', label: 'Cọc', num: true, render: s => `${F.vnd(s.depositAmount)}<br>${K.depChip(s.depositStatus)}` },
      { key: 'debt', label: 'Còn nợ', num: true, sortable: true, sortVal: debtOf, render: s => { const d = debtOf(s); return d > 0 ? (money ? `<b class="red">${F.vnd(d)}</b>` : U.chip('Còn nợ', 'amber')) : '–'; } },
      { key: 'zalo', label: 'Zalo', render: s => (Q.customer(s.customerId) || {}).zaloLinked ? U.chip('Đã liên kết', 'green') : U.chip('Chưa liên kết', 'gray') },
    ];
    if (view === 'broken') cols.splice(6, 0, { key: 'reason', label: 'Lý do', render: s => esc(s.breachReason || s.endReason || '') }, { key: 'br', label: 'Phải thu / đã thu (tiền điện)', num: true, render: s => { const iv = (inv[s.id] || []).find(i => i.isBreach); if (!iv) return '–'; const st = Q.invState(iv); return money ? F.vnd(iv.totalDue) + ' / ' + F.vnd(st.paid) : '••• / •••'; } });
    U.table(root.querySelector('#t'), { rows, pageSize: 25, rowHref: s => '#/stays/' + s.id, cols });
    U.bind(root, { view: (el) => TH.router.setQuery({ view: el.dataset.key }), exp: () => K.csv('khach-thue.csv', ['Mã KH', 'Phòng', 'Khách', 'Ngày tính tiền', 'Hết hạn', 'Trạng thái', 'Cọc', 'Còn nợ'], rows.map(s => [s.code, Q.roomCode(s.roomId), (Q.customer(s.customerId) || {}).name, s.rentStart, s.endDate, s.status + (s.endType ? '/' + s.endType : ''), s.depositAmount, debtOf(s)]), ['Còn nợ']) });
  });

  /* UI-07 tạo khách & lượt thuê: chờ nhận (đã cọc) hoặc vào ở ngay */
  TH.router.handle('/tenants/new', (root, p, q) => {
    TH.layout.crumb([{ label: 'Khách thuê', href: '#/tenants' }, { label: 'Tạo khách & lượt thuê' }]);
    const rooms = S.all('rooms').filter(r => r.exploitation !== 'meter_common' && TH.auth.inScope(r.buildingId) && !Q.pendingStay(r.id)).sort((a, b) => a.code.localeCompare(b.code));
    const r0 = q.room ? Q.room(q.room) : null;
    const in30 = F.addDays(F.today(), 2);
    root.innerHTML = U.pageHead({ title: 'Tạo khách & lượt thuê', back: '#/tenants', sub: 'Chưa có module Kinh doanh ở Phase 1: khách đã cọc giữ phòng được ghi là lượt thuê "chờ nhận"' })
      + `<form id="f" class="two-col"><div class="side-stack">
        ${U.card({ title: '1. Khách thuê', icon: 'user', body: `<div class="form-grid">${U.field({ label: 'Họ tên', req: true, name: 'name', input: U.input({ name: 'name' }) })}${U.field({ label: 'SĐT (Zalo)', req: true, name: 'phone', input: U.input({ name: 'phone', placeholder: '09xxxxxxxx' }) })}
          ${U.field({ label: 'CCCD', name: 'idNo', input: U.input({ name: 'idNo' }) })}${U.field({ label: 'Nghề nghiệp (phân khúc khách)', name: 'occupation', input: U.select({ name: 'occupation', value: 'Người đi làm', options: ['Sinh viên', 'Người đi làm'] }) })}
          ${U.field({ label: '', name: 'zaloLinked', input: U.check({ name: 'zaloLinked', label: 'Khách đã liên kết Zalo', checked: true }) })}</div>` })}
        ${U.card({ title: '2. Phòng & thời hạn', icon: 'door', body: `<div class="form-grid">${U.field({ label: 'Phòng', req: true, name: 'roomId', input: U.select({ name: 'roomId', value: r0 ? r0.id : '', placeholder: 'Chọn phòng', options: rooms.map(r => [r.id, r.code + (Q.currentStay(r.id) ? ' – đang có khách (chỉ tạo chờ nhận)' : ' – trống')]) }) })}
          ${U.field({ label: 'Trạng thái lượt thuê', name: 'status', input: U.select({ name: 'status', value: 'pending', options: [['pending', 'Chờ nhận – đã cọc, chưa vào ở'], ['active', 'Vào ở ngay']] }) })}
          ${U.field({ label: 'Ngày chốt / đặt cọc', req: true, name: 'dealDate', input: U.date({ name: 'dealDate', value: F.today() }) })}
          ${U.field({ label: 'Ngày tính tiền phòng', req: true, name: 'rentStart', input: U.date({ name: 'rentStart', value: in30 }), help: 'Vào giữa tháng → hóa đơn đầu chia theo ngày thực của tháng' })}
          ${U.field({ label: 'Ngày bắt đầu tính dịch vụ', name: 'svcStart', input: U.date({ name: 'svcStart' }), help: 'Để trống = trùng ngày tính tiền phòng' })}
          ${U.field({ label: 'Ngày hết hạn HĐ', req: true, name: 'endDate', input: U.date({ name: 'endDate', value: F.addDays(F.addMonths(in30, 12), -1) }) })}
          ${U.field({ label: 'Kỳ thanh toán (tháng)', name: 'payMonths', input: U.select({ name: 'payMonths', value: '1', options: [['1', '1 tháng'], ['2', '2 tháng'], ['3', '3 tháng']] }) })}
          ${U.field({ label: 'Số người', name: 'people', input: U.input({ name: 'people', type: 'number', value: 1 }) })}${U.field({ label: 'Số xe điện', name: 'vehicles', input: U.input({ name: 'vehicles', type: 'number', value: 0 }) })}</div>` })}
      </div><div class="side-stack">
        ${U.card({ title: '3. Giá & cọc', icon: 'coins', body: `${U.field({ label: 'Giá thuê/tháng', req: true, name: 'rent', input: U.money({ name: 'rent', value: r0 ? r0.price : '' }) })}
          <div class="mt12">${U.field({ label: 'Tiền cọc', name: 'deposit', input: U.money({ name: 'deposit', value: r0 ? r0.price : '' }), help: 'Mặc định 1 tháng tiền phòng; cọc không chia ngày' })}</div>
          <div class="mt12">${U.field({ label: 'Đã nhận cọc hôm nay', name: 'depAmount', input: U.money({ name: 'depAmount' }), help: 'Bắt buộc khi "chờ nhận" – ghi phiếu thu loại cọc (kế toán/admin)' })}</div>
          <p class="small muted mt12">Biểu phí dịch vụ lấy theo tòa, sửa ở tab Biểu phí sau khi tạo.</p>` })}
        <button class="btn btn-primary btn-block" type="submit">Tạo lượt thuê</button></div></form>`;
    U.onInput(root);
    root.querySelector('[name=roomId]').addEventListener('change', (e) => { const r = Q.room(e.target.value); if (r) { root.querySelector('[name=rent]').value = F.vnd(r.price); root.querySelector('[name=deposit]').value = F.vnd(r.price); } });
    root.querySelector('#f').addEventListener('submit', (e) => {
      e.preventDefault(); const d = U.formData(root);
      try {
        const s = X.createStay(Object.assign(d, { depositReceived: d.depAmount ? { amount: d.depAmount, date: F.today(), method: 'bank' } : null }));
        U.toast('ok', 'Đã tạo lượt thuê ' + s.code); TH.go('#/stays/' + s.id);
      } catch (err) { if (err.fields) U.setErrors(root, err.fields); U.toast('err', 'Chưa tạo được', err.message); }
    });
  });
})(window.TH);
