/* UI-14 Thu tiền theo tòa – theo sheet "cập nhật thu tiền" (SRC-08). Quản lý cập nhật số đã thu cộng dồn tại mốc 5/10/15 của tòa mình;
   admin duyệt / từ chối (đối chiếu số phiếu thu); kế toán xem toàn bộ, xuất Excel làm báo cáo. Số mốc đã duyệt đi vào lương vận hành (UI-25). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, A = TH.auth;
  const pct = v => (v == null ? '–' : F.pctv(v / 100));
  const TABS = [{ key: 'toa', label: 'Theo tòa' }, { key: 'quan-ly', label: 'Theo quản lý' }, { key: 'cho-duyet', label: 'Chờ duyệt' }, { key: 'lich-su', label: 'Lịch sử cập nhật' }];
  const msChip = (m) => !m.reached ? U.chip('Chưa đến mốc', 'gray') : m.pending ? U.chip('Chờ duyệt ' + F.vnd(m.pending.amount), 'amber') : m.approved ? U.chip('Đã duyệt', 'green') : U.chip('Theo phiếu thu', 'blue');
  const msCell = (m) => `<div class="num"><b>${m.reached || m.approved ? F.vnd(m.value) : '–'}</b></div><div class="small">${msChip(m)}${m.approved && Math.abs(m.diff) > 0.5 ? ` <span class="muted" title="Số đã duyệt − số phiếu thu">Δ ${F.vnd(m.diff)}</span>` : ''}</div>`;
  const stChip = (r) => U.chip(...(Q.MS_ST[r.status] || [r.status, 'gray']));

  TH.router.handle('/billing/collection', (root, p, q) => {
    const period = q.period || F.defaultPeriod(S.meta.period);
    const tab = K.pickTab(TABS, q.tab, A.can('collection.approve') && !q.tab ? 'cho-duyet' : 'toa');
    const filters = { area: q.area, group: q.group, manager: q.manager, leader: q.leader, building: q.building };
    const cp = Q.collectionProgress(period, filters), T = cp.total;
    const pend = Q.milestoneRecords({ period, status: 'pending' }).filter(r => cp.rows.some(x => x.buildingId === r.buildingId));
    const due = A.can('collection.report') ? Q.milestonesDue(period) : [];
    const days = cp.days;
    root.innerHTML = TH.pages.billingTabs('collection') + U.pageHead({ title: 'Thu tiền theo tòa', sub: `Phải thu = tổng hóa đơn của tòa kỳ ${F.periodShort(period)} · quản lý cập nhật số đã thu cộng dồn tại mốc ngày ${days.join('/')} · admin duyệt · số mốc đã duyệt dùng tính lương vận hành (UI-25)`,
      acts: [U.btn({ label: 'Xuất Excel', icon: 'download', act: 'exp', perm: 'collection.export' })] })
      + K.filters([{ name: 'period', label: 'Kỳ', options: K.periodOpts(), value: period, all: false }, { name: 'area', label: 'Khu vực', options: K.areaOpts() }, { name: 'group', label: 'Nhóm T/S/G', options: K.groupOpts() },
        ...(A.role() === 'vanhanh' ? [] : [{ name: 'manager', label: 'Quản lý', options: K.managerOpts(cp.mgrDate) }, { name: 'leader', label: 'Leader', options: Q.teamLeaders(cp.mgrDate).map(e => [e.id, e.name]) }]), { name: 'building', label: 'Tòa', options: K.buildingOpts() }], q)
      + `<div class="grid grid-4 mt16 mb16">${U.kpi({ label: 'Doanh thu phải thu', value: F.vnd(T.due), cap: cp.rows.length + ' tòa · ' + (T.breachDue ? 'gồm phá HĐ ' + F.vnd(T.breachDue) : 'không có phá HĐ'), icon: 'receipt', tone: 'blue' })}
        ${U.kpi({ label: 'Thực thu', value: F.vnd(T.collected), cap: 'tỷ lệ ' + pct(T.rate) + ' · còn ' + F.vnd(T.remaining), icon: 'check-circle', tone: 'green', bar: T.rate == null ? null : Math.min(100, Math.round(T.rate)) })}
        ${U.kpi({ label: `Cộng dồn mốc ${days.join(' / ')} (% phải thu)`, value: T.ms.map(v => (T.due ? (v / T.due * 100).toFixed(1).replace('.', ',') : '–')).join(' / '), cap: 'DT sau 3 mốc (A) ' + F.vnd(T.A), icon: 'activity', tone: 'purple' })}
        ${U.kpi({ label: 'Mốc chờ duyệt', value: pend.length, cap: due.length ? due.length + ' mốc đã tới chưa cập nhật' : 'admin duyệt trước khi chốt lương', icon: 'clock', tone: pend.length ? 'amber' : 'gray' })}</div>`
      + (due.length ? U.note('warn', 'Đến mốc – cập nhật số thu', due.slice(0, 8).map(x => `${esc(x.code)} mốc ngày ${x.day}`).join(' · ') + (due.length > 8 ? ` … (+${due.length - 8})` : '')) : '')
      + U.tabs(TABS, tab) + '<div id="tb" class="mt16"></div>';
    K.bindFilters(root, ['tab']);
    U.bind(root, { tab: (el) => TH.router.setQuery({ tab: el.dataset.key }), exp: () => exportXls(cp) });
    const tb = root.querySelector('#tb');

    if (tab === 'toa') {
      tb.innerHTML = K.tableCard('t', `${cp.rows.length} tòa`, '', `T/U/V = đã thu cộng dồn đến hết ngày ${days.join(', ')} · DT mốc = T×${cp.weights[0] * 100}%, (U−T)×${cp.weights[1] * 100}%, (V−U)×${cp.weights[2] * 100}% (trừ cọc mới/tháng trả trước – TH1) · phá HĐ theo hóa đơn gốc`);
      U.table(tb.querySelector('#t'), { rows: cp.rows, pageSize: 50, empty: U.empty({ title: 'Không có tòa trong phạm vi', text: 'Kỳ này chưa có hóa đơn phát hành cho tòa bạn quản lý.' }), cols: [
        { key: 'c', label: 'Mã tòa', sortable: true, sortVal: r => r.code, render: r => `<b class="code">${esc(r.code)}</b>` + (A.can('collection.report') && A.inScope(r.buildingId) ? '<div class="mt4">' + U.btn({ label: 'Cập nhật mốc', size: 'btn-sm', cls: 'btn-primary', act: 'upd', attrs: { 'data-b': r.buildingId } }) + '</div>' : '') },
        { key: 'm', label: 'Quản lý', render: r => esc(r.manager ? r.manager.name : 'Chưa phân công') },
        { key: 'n', label: 'Phải thu', num: true, sortable: true, sortVal: r => r.due, render: r => F.vnd(r.due) },
        { key: 'o', label: 'Thực thu', num: true, render: r => F.vnd(r.collected) },
        { key: 'pq', label: 'Phá HĐ / thu được', num: true, render: r => r.breachDue ? F.vnd(r.breachDue) + '<div class="small muted">' + F.vnd(r.breachCollected) + '</div>' : '–' },
        { key: 'r', label: 'Tỷ lệ thu', num: true, sortable: true, sortVal: r => r.rate || 0, render: r => pct(r.rate) },
        ...r3(days).map((d, i) => ({ key: 'ms' + i, label: 'Ngày ' + d, num: true, render: r => msCell(r.ms[i]) })),
        { key: 'w', label: 'DT mốc 1 / 2 / 3', num: true, render: r => [r.M1, r.M2, r.M3].map(v => F.vnd(v)).join('<br>') },
        { key: 'hs', label: 'HS tạm tính', num: true, render: r => (r.HS == null ? '–' : r.HS.toFixed(1)) }] });
      U.bind(tb, { upd: (el) => updateDrawer(period, el.dataset.b) });
    }
    if (tab === 'quan-ly') {
      tb.innerHTML = K.tableCard('t', `${cp.managers.length} quản lý`, '', 'Theo phân công tại ngày mốc cuối (OQ-02) · còn lại = phải thu − thực thu − (phá HĐ − phá HĐ thu được)');
      U.table(tb.querySelector('#t'), { rows: cp.managers, noPager: true, cols: [
        { key: 'm', label: 'Quản lý', render: r => `<b>${esc(r.manager ? r.manager.name : 'Chưa phân công')}</b><div class="small muted">${r.buildings} tòa</div>` },
        { key: 'b', label: 'Tổng doanh thu phải thu', num: true, render: r => F.vnd(r.due) }, { key: 'c', label: 'Thực thu', num: true, render: r => F.vnd(r.collected) },
        { key: 'd', label: 'Còn phải thu', num: true, render: r => F.vnd(r.remaining) }, { key: 'e', label: 'Tỷ lệ (%)', num: true, render: r => pct(r.rate) },
        { key: 'f', label: 'DT phá HĐ', num: true, render: r => F.vnd(r.breachDue) }, { key: 'g', label: 'Phá HĐ thu được', num: true, render: r => F.vnd(r.breachCollected) },
        { key: 'h', label: 'Tỷ lệ thu phá HĐ', num: true, render: r => pct(r.breachRate) }, { key: 'i', label: 'Tỷ lệ DT phá HĐ', num: true, render: r => pct(r.breachShare) },
        ...r3(days).map((d, i) => ({ key: 'ms' + i, label: 'Ngày ' + d, num: true, render: r => F.vnd(r.ms[i]) })),
        { key: 'a', label: 'DT sau 3 mốc (A)', num: true, render: r => F.vnd(r.A) }, { key: 'hs', label: 'HS tạm tính', num: true, render: r => (r.HS == null ? '–' : r.HS.toFixed(1)) }] });
    }
    if (tab === 'cho-duyet' || tab === 'lich-su') {
      const list = tab === 'cho-duyet' ? pend : Q.milestoneRecords({ period, building: q.building }).filter(r => cp.rows.some(x => x.buildingId === r.buildingId));
      tb.innerHTML = (tab === 'cho-duyet' && A.can('collection.approve') ? U.note('info', 'Kiểm tra trước khi duyệt', 'So số quản lý nhập với số tính từ phiếu thu (theo ngày tiền thực nhận). Lệch lớn: hỏi lại quản lý hoặc từ chối kèm lý do. Số đã duyệt thay số phiếu thu trong lương vận hành.') : '')
        + K.tableCard('t', `${list.length} bản nhập`);
      U.table(tb.querySelector('#t'), { rows: list, pageSize: 25, empty: U.empty({ icon: 'check-circle', title: tab === 'cho-duyet' ? 'Không có mốc chờ duyệt' : 'Chưa có bản nhập' }), cols: [
        { key: 'b', label: 'Tòa · mốc', render: r => `<b class="code">${esc(Q.building(r.buildingId).code)}</b> · ngày ${r.day}<div class="small muted">kỳ ${F.periodShort(r.period)} · phiên ${r.version || 1}</div>` },
        { key: 'a', label: 'Số QL nhập', num: true, render: r => `<b>${F.vnd(r.amount)}</b>` + (r.previousAmount != null ? `<div class="small muted">trước: ${F.vnd(r.previousAmount)}</div>` : '') },
        { key: 's', label: 'Theo phiếu thu', num: true, render: r => { const sys = Q.receiptCum(r.period, r.buildingId, r.day), dd = r.amount - sys; return F.vnd(sys) + (Math.abs(dd) > 0.5 ? `<div class="small ${Math.abs(dd) > Math.max(1, sys) * 0.05 ? 'red' : 'muted'}">Δ ${F.vnd(dd)}</div>` : ''); } },
        { key: 'n', label: 'Người nhập · ghi chú', render: r => `${esc(r.reportedByName || '')} · ${F.datetime(r.reportedAt)}` + (r.note ? `<div class="small">${esc(r.note)}</div>` : '') + (r.evidence ? `<div class="small muted">${esc(r.evidence)}</div>` : '') },
        { key: 'st', label: 'Trạng thái', render: r => stChip(r) + (r.approvedBy && r.status !== 'pending' ? `<div class="small muted">${esc(r.approvedBy)} · ${F.datetime(r.approvedAt)}</div>` : '') + (r.rejectReason ? `<div class="small red">${esc(r.rejectReason)}</div>` : '') },
        { key: 'x', label: '', render: r => r.status !== 'pending' ? '' : (A.can('collection.approve') ? U.btn({ label: 'Duyệt', size: 'btn-sm', cls: 'btn-primary', act: 'ok', attrs: { 'data-id': r.id } }) + ' ' + U.btn({ label: 'Từ chối', size: 'btn-sm', act: 'no', attrs: { 'data-id': r.id } }) : '')
          + (r.reportedBy === (S.session || {}).userId ? U.btn({ label: 'Sửa', size: 'btn-sm', act: 'edit', attrs: { 'data-b': r.buildingId, 'data-k': r.milestone } }) + ' ' + U.btn({ label: 'Hủy', size: 'btn-sm', act: 'cancel', attrs: { 'data-id': r.id } }) : '') }] });
      U.bind(tb, {
        ok: (el) => K.formDrawer({ title: 'Duyệt số mốc thu', modal: true, fields: [{ name: 'note', label: 'Ghi chú kiểm tra (tùy chọn)', type: 'textarea', span: true }], submit: 'Duyệt', onSubmit: (x) => { X.approveMilestone(el.dataset.id, x.note); U.toast('ok', 'Đã duyệt', 'Lương vận hành kỳ này dùng số đã duyệt'); } }),
        no: (el) => K.formDrawer({ title: 'Từ chối số mốc thu', modal: true, fields: [{ name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Từ chối', onSubmit: (x) => { X.rejectMilestone(el.dataset.id, x.reason); U.toast('ok', 'Đã từ chối', 'Quản lý thấy lý do và nhập lại'); } }),
        edit: (el) => updateDrawer(period, el.dataset.b, Number(el.dataset.k)),
        cancel: (el) => K.act(() => X.cancelMilestone(el.dataset.id), 'Đã hủy bản nhập'),
      });
    }
  });
  const r3 = (days) => days.slice(0, 3);

  /* Drawer cập nhật mốc: số đã thu cộng dồn của tòa; hiện số phiếu thu, mốc liền trước và DT mốc / HS tính lại khi nhập */
  const updateDrawer = (period, bid, kDefault) => {
    const row = Q.collectionProgress(period).rows.find(r => r.buildingId === bid); if (!row) return;
    const reached = row.ms.filter(m => m.reached);
    const k0 = kDefault || (reached.length ? reached[reached.length - 1].k : 1), m0 = row.ms[k0 - 1];
    const info = (k) => { const m = row.ms[k - 1], prev = k > 1 ? row.ms[k - 2] : null; return `<div class="small">Theo phiếu thu đến ${F.date(m.date)}: <b>${F.vnd(m.sys)}</b>${m.approved ? ` · đã duyệt: <b>${F.vnd(m.approved.amount)}</b>` : ''}${prev ? ` · mốc ngày ${prev.day}: ${F.vnd(prev.value)}` : ''} · phải thu ${F.vnd(row.due)}</div><div class="small muted" id="msCalc"></div>`; };
    const d = K.formDrawer({ title: 'Cập nhật mốc thu – tòa ' + row.code, sub: `Kỳ ${F.periodShort(period)} · nhập số ĐÃ THU CỘNG DỒN của cả tòa đến hết ngày mốc · admin duyệt rồi mới vào lương`, fields: [
      { name: 'milestone', label: 'Mốc', type: 'select', req: true, value: String(k0), options: row.ms.map(m => [String(m.k), `Ngày ${m.day} (${F.date(m.date)})` + (m.reached ? '' : ' – chưa đến')]) },
      { name: 'amount', label: 'Đã thu cộng dồn', type: 'money', req: true, value: (m0.pending || m0.approved || {}).amount ?? Math.round(m0.sys) },
      { type: 'html', span: true, html: `<div id="msInfo">${info(k0)}</div>` },
      { name: 'note', label: 'Ghi chú', type: 'textarea', span: true, value: (m0.pending || {}).note || '' },
      { name: 'evidence', label: 'Chứng từ / nguồn', span: true, value: (m0.pending || {}).evidence || '', placeholder: 'Sao kê, sổ thu tiền mặt…' }],
      submit: 'Gửi duyệt', onSubmit: (x) => { X.reportMilestone({ period, buildingId: bid, milestone: Number(x.milestone), amount: F.num(x.amount), note: x.note, evidence: x.evidence }); U.toast('ok', 'Đã gửi duyệt', 'Admin kiểm tra và duyệt số mốc'); } });
    const recalc = () => {
      const data = d.data(), k = Number(data.milestone), v = F.num(data.amount), cum = row.ms.map(m => m.value); cum[k - 1] = v;
      const st = TH.calc.payments.milestoneSteps(cum, Q.milestoneCfg(period).w, row.deduct), el = d.el.querySelector('#msCalc');
      if (el) el.textContent = 'DT mốc 1/2/3 sau khi nhập: ' + st.map(x => F.vnd(x || 0)).join(' / ');
    };
    d.el.querySelector('[name=milestone]')?.addEventListener('change', (e) => { d.el.querySelector('#msInfo').innerHTML = info(Number(e.target.value)); recalc(); });
    d.el.querySelector('[name=amount]')?.addEventListener('input', recalc); recalc();
    return d;
  };

  const exportXls = (cp) => {
    const head = ['MÃ TOÀ', 'QUẢN LÝ', 'DOANH THU PHẢI THU', 'DOANH THU THU ĐƯỢC', 'DT PHÁ HĐ', 'DT PHÁ HD THU ĐƯỢC', 'TỈ LỆ THU (%)', 'TỈ LỆ PHÁ HĐ', ...cp.days.map((d, i) => (i === 2 ? 'NGÀY ' + d : 'NGÀY M' + d)), 'DT MỐC 1', 'DT MỐC 2', 'DT MỐC 3', 'TRẠNG THÁI MỐC'];
    const rows = cp.rows.map(r => [r.code, r.manager ? r.manager.name : '', Math.round(r.due), Math.round(r.collected), Math.round(r.breachDue), Math.round(r.breachCollected), r.rate == null ? '' : +r.rate.toFixed(2), r.breachShare == null ? '' : +r.breachShare.toFixed(2),
      ...r.ms.map(m => Math.round(m.value)), Math.round(r.M1), Math.round(r.M2), Math.round(r.M3), r.ms.map(m => 'M' + m.day + ':' + (m.pending ? 'chờ duyệt' : m.approved ? 'đã duyệt' : m.reached ? 'phiếu thu' : 'chưa đến')).join(' ')]);
    K.xls('cap-nhat-thu-tien-' + cp.period + '.xls', 'cập nhật thu tiền', ['CẬP NHẬT THU TIỀN', ['Kỳ', F.periodLabel(cp.period)], ['Phạm vi', cp.rows.length + ' tòa'], ['Nguồn mốc', 'Số QL cập nhật đã duyệt; mốc chưa duyệt = số phiếu thu']], head, rows);
  };
})(window.TH);
