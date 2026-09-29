/* UI-04 Chủ nhà & HĐ đầu vào (E03 phụ lục thay giá) · UI-05 Lịch trả chủ nhà (ghi chi → UI-15). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc;

  TH.pages.ownerPayDrawer = (opId) => {
    const o = S.get('ownerPayments', opId); const b = Q.building(o.buildingId);
    K.formDrawer({ title: 'Ghi chi tiền nhà – ' + b.code, sub: `Kỳ từ ${F.date(o.from)} · ${o.months} tháng · hạn ${F.date(o.dueDate)}`, modal: true, fields: [
      { name: 'amount', label: 'Số tiền chi', type: 'money', req: true, value: Math.max(0, o.amountDue - o.paid) },
      { name: 'date', label: 'Ngày chi', type: 'date', req: true, value: F.today() },
      { name: 'method', label: 'Phương thức', type: 'select', options: [['bank', 'Chuyển khoản'], ['cash', 'Tiền mặt']], value: 'bank' },
      { type: 'html', span: true, html: U.note('info', '', 'Khoản chi được ghi một lần ở Chi phí (UI-15) loại "Tiền thuê nhà trả chủ". Báo cáo dùng tiền thuê 1 tháng theo HĐ, không cộng lặp.') }],
      submit: 'Ghi chi', onSubmit: (d) => { X.recordOwnerPayment(opId, d); U.toast('ok', 'Đã ghi chi tiền nhà'); } });
  };

  TH.router.handle('/owners/:id', (root, p) => {
    const oc = S.get('ownerContracts', p.id); if (!oc) { root.innerHTML = U.empty({ title: 'Không tìm thấy hợp đồng' }); return; }
    const b = Q.building(oc.buildingId), own = S.get('owners', oc.ownerId);
    TH.layout.crumb([{ label: 'Tòa nhà', href: '#/buildings' }, { label: b.code, href: '#/buildings/' + b.id }, { label: 'Chủ nhà & HĐ' }]);
    const vs = S.where('ownerRateVersions', v => v.contractId === oc.id).sort((a, c) => a.from.localeCompare(c.from));
    const cur = X.ownerRentAt(oc.id, F.today());
    root.innerHTML = U.pageHead({ title: 'Chủ nhà & hợp đồng đầu vào', back: '#/buildings/' + b.id + '?tab=chu-nha-hd', sub: `${esc(oc.code)} · Tòa ${esc(b.code)}`, acts: [
      U.btn({ label: 'Xem lịch trả', icon: 'calendar', href: '#/owner-payments?building=' + b.id }), U.btn({ label: 'Thêm phụ lục thay giá', icon: 'plus', cls: 'btn-primary', act: 'appendix', perm: 'owners.manage' })] })
      + `<div class="two-col"><div class="side-stack">
        ${U.card({ title: 'Thông tin hợp đồng ' + (oc.startDate > F.today() ? U.chip('Chưa hiệu lực', 'blue') : oc.endDate && oc.endDate < F.today() ? U.chip('Hết hạn', 'gray') : F.daysBetween(F.today(), oc.endDate) <= 90 ? U.chip('Sắp hết hạn', 'amber') : U.chip('Đang hiệu lực', 'green')), icon: 'file-text', body: U.kv([['Mã HĐ', esc(oc.code)], ['Phạm vi', 'Toàn bộ tòa ' + esc(b.code)], ['Ngày ký / bàn giao', F.date(oc.signDate)], ['Thời hạn', F.date(oc.startDate) + ' → ' + F.date(oc.endDate)],
          ['Giá thuê hiện hành', '<b>' + F.vndd(cur) + '</b>/tháng'], ['Cọc chủ nhà', F.vndd(oc.deposit) + ' <small class="muted">(dòng tiền, không vào chi phí lợi nhuận)</small>'], ['Kỳ trả', oc.payCycleMonths + ' tháng/lần, hạn ngày ' + oc.payDay + ' đầu kỳ']]) })}
        ${U.card({ title: 'Lịch sử giá / phụ lục', icon: 'history', body: '<div id="vt"></div>', bodyCls: 'flush' })}
      </div><div class="side-stack">
        ${U.card({ title: 'Chủ nhà', icon: 'user', body: U.kv([['Họ tên', esc(own.name)], ['SĐT', esc(Q.pii(own.phone))], ['CCCD', esc(Q.pii(own.idNo))], ['Ngân hàng', esc(own.bank)]]) })}
        ${U.note('info', 'Báo cáo dùng giá nào?', 'Dòng "Tiền thuê nhà 1 tháng" của báo cáo lấy giá hiệu lực trong kỳ (dù trả 3 tháng/lần), như mẫu G1 C22.')}
      </div></div>`;
    U.table(root.querySelector('#vt'), { rows: vs, noPager: true, cols: [
      { key: 'no', label: 'Phụ lục', render: v => esc(v.appendixNo || 'HĐ gốc') }, { key: 'f', label: 'Từ ngày', render: v => F.date(v.from) }, { key: 't', label: 'Đến ngày', render: v => v.to ? F.date(v.to) : '–' },
      { key: 'r', label: 'Giá thuê', num: true, render: v => F.vnd(v.monthlyRent) }, { key: 'l', label: 'Lý do', render: v => esc(v.reason || '') },
      { key: 's', label: 'Trạng thái', render: v => (!v.to || v.to >= F.today()) && v.from <= F.today() ? U.chip('Đang áp dụng', 'green') : v.from > F.today() ? U.chip('Sắp hiệu lực', 'blue') : U.chip('Hết hiệu lực', 'gray') }] });
    U.bind(root, { appendix: () => K.formDrawer({ title: 'Thêm phụ lục thay giá', sub: `Hiện tại ${F.vndd(cur)}/tháng, cọc ${F.vndd(oc.deposit)}`, fields: [
      { name: 'from', label: 'Ngày hiệu lực', type: 'date', req: true, help: 'Phải sau phiên giá gần nhất; phiên cũ tự đóng ngày trước đó' },
      { name: 'rent', label: 'Giá thuê mới/tháng', type: 'money', req: true }, { name: 'deposit', label: 'Tiền cọc mới (nếu đổi)', type: 'money' },
      { name: 'reason', label: 'Lý do thay đổi', type: 'textarea', req: true, span: true }],
      submit: 'Lưu phụ lục', onSubmit: (d) => { X.addOwnerRate(oc.id, d); U.toast('ok', 'Đã lưu phụ lục'); } }) });
  });

  TH.router.handle('/owner-payments', (root, p, q) => {
    let rows = S.all('ownerPayments').filter(o => TH.auth.inScope(o.buildingId));
    if (q.building) rows = rows.filter(o => o.buildingId === q.building);
    if (q.status === 'due') rows = rows.filter(o => o.paid < o.amountDue && F.daysBetween(F.today(), o.dueDate) <= 7);
    if (q.status === 'paid') rows = rows.filter(o => o.paid >= o.amountDue);
    if (q.status === 'open') rows = rows.filter(o => o.paid < o.amountDue);
    rows.sort((a, c) => a.dueDate.localeCompare(c.dueDate));
    const due = rows.reduce((s, o) => s + o.amountDue, 0), paid = rows.reduce((s, o) => s + o.paid, 0);
    root.innerHTML = U.pageHead({ title: 'Lịch trả chủ nhà', sub: 'Lịch phát sinh từ kỳ trả của HĐ đầu vào; ghi chi tạo khoản chi gốc ở Chi phí', acts: [U.btn({ label: 'Xuất', icon: 'download', act: 'exp' })] })
      + `<div class="grid grid-3 mb16">${U.kpi({ label: 'Tổng phải trả', value: F.vnd(due), cap: rows.length + ' kỳ', icon: 'landmark' })}${U.kpi({ label: 'Đã chi', value: F.vnd(paid), icon: 'check-circle', tone: 'green' })}${U.kpi({ label: 'Còn phải trả', value: F.vnd(due - paid), cap: rows.filter(o => o.paid < o.amountDue).length + ' kỳ', icon: 'alert-triangle', tone: 'amber' })}</div>`
      + K.filters([{ name: 'building', label: 'Tòa', options: K.buildingOpts() }, { name: 'status', label: 'Trạng thái', options: [['open', 'Chưa trả'], ['due', 'Đến hạn ≤ 7 ngày'], ['paid', 'Đã trả']] }], q)
      + '<div class="mt16">' + K.tableCard('t') + '</div>';
    K.bindFilters(root);
    U.table(root.querySelector('#t'), { rows, pageSize: 20, cols: TH.pages.ownerPayCols() });
    U.bind(root, { 'op-pay': (el) => TH.pages.ownerPayDrawer(el.dataset.id), exp: () => K.csv('lich-tra-chu-nha.csv', ['Tòa', 'Kỳ từ', 'Số tháng', 'Hạn', 'Phải trả', 'Đã chi'], rows.map(o => [(Q.building(o.buildingId) || {}).code, o.from, o.months, o.dueDate, o.amountDue, o.paid])) });
  });
})(window.TH);
