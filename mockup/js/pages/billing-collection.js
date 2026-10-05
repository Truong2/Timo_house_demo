/* UI-14 Thu tiền theo tòa – theo sheet "cập nhật thu tiền" (SRC-08). Quản lý cập nhật số đã thu cộng dồn tại mốc 5/10/15 của tòa mình;
   admin duyệt / từ chối (đối chiếu số phiếu thu); kế toán xem toàn bộ, xuất Excel làm báo cáo. Số mốc đã duyệt đi vào lương vận hành (UI-25).
   Bảng chỉ giữ số chính; chênh lệch, DT mốc 1/2/3 và lịch sử nằm trong ngăn chi tiết của từng tòa (bấm vào dòng). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, A = TH.auth;
  const pct = v => (v == null ? '–' : F.pctv(v / 100));
  const hs = v => (v == null ? '–' : F.dec(v, 1));
  const sgn = v => (v > 0 ? '+' : '') + F.vnd(v);
  const dash = '<span class="muted">–</span>';
  const mgrName = r => esc(r.manager ? r.manager.name : 'Chưa phân công');
  const stChip = (r) => U.chip(...(Q.MS_ST[r.status] || [r.status, 'gray']));

  /* Trạng thái từng mốc: chấm màu + một dòng chữ cho cả tòa (không lặp chip ở từng ô số) */
  const MS = { approved: ['green', 'Đã duyệt'], pending: ['amber', 'Chờ duyệt'], receipts: ['blue', 'Theo phiếu thu'], future: ['', 'Chưa đến mốc'] };
  const msKind = m => (m.pending ? 'pending' : m.approved ? 'approved' : m.reached ? 'receipts' : 'future');
  const dots = (tone, kinds, text) => `<span class="st-dots ${tone}">${kinds.map(k => `<i class="${MS[k][0]}"></i>`).join('')}<span>${esc(text)}</span></span>`;
  const msSummary = (r) => {
    const ks = r.ms.map(msKind), n = k => ks.filter(x => x === k).length;
    const [tone, text] = n('pending') ? ['amber', n('pending') + ' mốc chờ duyệt'] : n('approved') === ks.length ? ['green', 'Đã duyệt'] : n('approved') ? ['blue', `${n('approved')}/${ks.length} mốc đã duyệt`] : n('receipts') ? ['blue', 'Theo phiếu thu'] : ['gray', 'Chưa đến mốc'];
    return dots(tone, ks, text);
  };
  const msNum = (m) => (!m.reached && !m.approved ? dash
    : `<span class="${m.approved ? '' : 'muted'}" data-tip="${m.approved ? (Math.abs(m.diff) > 0.5 ? `Đã duyệt · phiếu thu ${F.vnd(m.sys)} (lệch ${sgn(m.diff)})` : 'Đã duyệt · khớp phiếu thu') : 'Theo phiếu thu – chưa có số duyệt'}">${F.vnd(m.value)}</span>`);
  const legend = () => `<div class="legend-inline">${[['approved', 'Đã duyệt – dùng tính lương'], ['pending', 'Quản lý đã nhập, chờ admin duyệt'], ['receipts', 'Chưa có số duyệt – tạm theo phiếu thu'], ['future', 'Chưa đến mốc']].map(([k, t]) => dots('', [k], t)).join('')}</div>`;
  const foot = (cols, T) => `<tr>${cols.map((c, i) => `<td class="${c.num ? 'num' : 'lbl'}">${c.foot ? c.foot(T) : i === 0 ? 'Tổng' : ''}</td>`).join('')}</tr>`;

  TH.router.handle('/billing/collection', (root, p, q) => {
    const period = q.period || F.defaultPeriod(S.meta.period);
    const filters = { area: q.area, group: q.group, manager: q.manager, leader: q.leader, building: q.building };
    const cp = Q.collectionProgress(period, filters), T = cp.total, days = cp.days;
    const inView = r => cp.rows.some(x => x.buildingId === r.buildingId);
    const pend = Q.milestoneRecords({ period, status: 'pending' }).filter(inView);
    const canReport = A.can('collection.report'), canApprove = A.can('collection.approve');
    const due = canReport ? Q.milestonesDue(period) : [];
    const TABS = [{ key: 'toa', label: 'Theo tòa', count: cp.rows.length }, { key: 'quan-ly', label: 'Theo quản lý', count: cp.managers.length }, { key: 'cho-duyet', label: 'Chờ duyệt', count: pend.length }, { key: 'lich-su', label: 'Lịch sử cập nhật' }];
    const tab = K.pickTab(TABS, q.tab, canApprove && !q.tab && pend.length ? 'cho-duyet' : 'toa');
    const dueByDay = days.map(d => [d, due.filter(x => x.day === d).map(x => x.code)]).filter(([, xs]) => xs.length);
    const short = xs => xs.slice(0, 10).join(', ') + (xs.length > 10 ? ` … (+${xs.length - 10})` : '');

    root.innerHTML = TH.pages.billingTabs('collection') + U.pageHead({ title: 'Thu tiền theo tòa', sub: `Kỳ ${F.periodShort(period)} · quản lý cập nhật số đã thu tại mốc ngày ${days.join(', ')} · số đã duyệt dùng tính lương vận hành`,
      acts: [U.btn({ label: 'Cách tính', icon: 'help-circle', act: 'how' }), U.btn({ label: 'Xuất Excel', icon: 'download', act: 'exp', perm: 'collection.export' })] })
      + K.filters([{ name: 'period', label: 'Kỳ', options: K.periodOpts(), value: period, all: false }, { name: 'area', label: 'Khu vực', options: K.areaOpts() }, { name: 'group', label: 'Nhóm T/S/G', options: K.groupOpts() },
        ...(A.role() === 'vanhanh' ? [] : [{ name: 'manager', label: 'Quản lý', options: K.managerOpts(cp.mgrDate) }, { name: 'leader', label: 'Leader', options: Q.teamLeaders(cp.mgrDate).map(e => [e.id, e.name]) }]), { name: 'building', label: 'Tòa', options: K.buildingOpts() }], q)
      + `<div class="grid grid-4">${U.kpi({ label: 'Phải thu', value: F.vnd(T.due), cap: cp.rows.length + ' tòa' + (T.breachDue ? ' · phá HĐ ' + F.vnd(T.breachDue) : ''), icon: 'receipt', tone: 'blue' })}
        ${U.kpi({ label: 'Thực thu', value: F.vnd(T.collected), cap: pct(T.rate) + ' · còn ' + F.vnd(Math.max(0, T.due - T.collected)), icon: 'check-circle', tone: 'green', bar: T.rate == null ? null : Math.min(100, Math.round(T.rate)) })}
        ${U.kpi({ label: '% đã thu đến mốc', valueCls: 'ms-vl', value: `<span class="ms3">${days.map((d, i) => `<span><small>Ngày ${d}</small>${T.due ? F.pctv(T.ms[i] / T.due) : '–'}</span>`).join('')}</span>`, cap: 'DT sau 3 mốc ' + F.vnd(T.A), icon: 'activity', tone: 'purple' })}
        ${U.kpi({ label: 'Mốc chờ duyệt', value: pend.length, cap: canReport ? (due.length ? due.length + ' mốc đã tới chưa cập nhật' : 'Đã cập nhật đủ mốc đã tới') : pend.length ? 'Duyệt trước khi chốt lương' : 'Không có mốc chờ duyệt', icon: 'clock', tone: pend.length ? 'amber' : 'gray' })}</div>`
      + (dueByDay.length ? U.note('warn', 'Đã đến mốc – cần cập nhật số thu', dueByDay.map(([d, xs]) => `Ngày ${d}: ${esc(short(xs))}`).join(' · ')) : '')
      + U.tabs(TABS, tab) + '<div id="tb"></div>';
    K.bindFilters(root, ['tab']);
    U.bind(root, { tab: (el) => TH.router.setQuery({ tab: el.dataset.key }), exp: () => exportXls(cp), how: () => howModal(cp) });
    const tb = root.querySelector('#tb');

    if (tab === 'toa') {
      const showMgr = A.role() !== 'vanhanh', showBreach = cp.rows.some(r => r.breachDue);
      const cols = [
        { key: 'c', label: 'Tòa', sortable: true, sortVal: r => r.code, render: r => U.cell2(esc(r.code), showMgr ? mgrName(r) : '', 'code'), foot: () => `Tổng ${cp.rows.length} tòa` },
        { key: 'n', label: 'Phải thu', num: true, sortable: true, sortVal: r => r.due, render: r => F.vnd(r.due), foot: t => F.vnd(t.due) },
        { key: 'o', label: 'Thực thu', num: true, sortable: true, sortVal: r => r.collected, render: r => F.vnd(r.collected), foot: t => F.vnd(t.collected) },
        { key: 'r', label: '% thu', num: true, sortable: true, sortVal: r => r.rate || 0, render: r => pct(r.rate), foot: t => pct(t.rate) },
        ...(showBreach ? [{ key: 'pq', label: 'Phá HĐ', num: true, render: r => (r.breachDue ? `${F.vnd(r.breachDue)}<span class="sub">thu ${F.vnd(r.breachCollected)}</span>` : dash), foot: t => F.vnd(t.breachDue) }] : []),
        ...days.map((d, i) => ({ key: 'ms' + i, label: 'Ngày ' + d, num: true, render: r => msNum(r.ms[i]) })),
        { key: 'st', label: 'Trạng thái mốc', sortable: true, sortVal: r => r.pendingCount * 10 + r.ms.filter(m => m.approved).length, render: msSummary },
        { key: 'a', label: 'DT sau 3 mốc', num: true, render: r => `<span data-tip="Mốc 1: ${F.vnd(r.M1)} · mốc 2: ${F.vnd(r.M2)} · mốc 3: ${F.vnd(r.M3)}">${F.vnd(r.A)}</span>`, foot: t => F.vnd(t.A) },
        { key: 'hs', label: '<span data-tip="Hiệu suất tạm tính = T / doanh thu niêm yết × 100">HS</span>', num: true, sortable: true, sortVal: r => r.HS || 0, render: r => hs(r.HS) },
        ...(canReport ? [{ key: 'actions', label: '', render: r => (A.inScope(r.buildingId) ? U.rowActions([U.btn({ label: 'Cập nhật', icon: 'pencil', size: 'btn-sm', cls: 'btn-light', act: 'upd', attrs: { 'data-b': r.buildingId } })]) : '') }] : [])];
      tb.innerHTML = U.card({ title: `${cp.rows.length} tòa`, sub: 'Số đã thu cộng dồn đến hết từng ngày mốc · bấm vào dòng để xem chi tiết' + (canReport ? ' hoặc cập nhật mốc' : ' và lịch sử'), body: '<div id="t"></div>' + legend(), bodyCls: 'flush' });
      U.table(tb.querySelector('#t'), { rows: cp.rows, pageSize: 50, unit: 'tòa', cols, stickyFirst: true, onRowOpen: r => detailDrawer(period, r.buildingId),
        empty: U.empty({ title: 'Không có tòa trong phạm vi', text: 'Kỳ này chưa có hóa đơn phát hành cho tòa bạn quản lý.' }) });
      U.bind(tb, { upd: (el) => updateDrawer(period, el.dataset.b) });
    }
    if (tab === 'quan-ly') {
      const cols = [
        { key: 'm', label: 'Quản lý', render: r => U.cell2(`<b>${mgrName(r)}</b>`, r.buildings + ' tòa'), foot: t => `Tổng ${t.buildings} tòa` },
        { key: 'b', label: 'Phải thu', num: true, render: r => F.vnd(r.due), foot: t => F.vnd(t.due) }, { key: 'c', label: 'Thực thu', num: true, render: r => F.vnd(r.collected), foot: t => F.vnd(t.collected) },
        { key: 'd', label: 'Còn phải thu', num: true, render: r => F.vnd(r.remaining), foot: t => F.vnd(t.remaining) }, { key: 'e', label: '% thu', num: true, render: r => pct(r.rate), foot: t => pct(t.rate) },
        { key: 'f', label: 'Phá HĐ', num: true, render: r => (r.breachDue ? `${F.vnd(r.breachDue)}<span class="sub">${pct(r.breachShare)} phải thu</span>` : dash), foot: t => F.vnd(t.breachDue) },
        { key: 'g', label: 'Thu phá HĐ', num: true, render: r => (r.breachDue ? `${F.vnd(r.breachCollected)}<span class="sub">${pct(r.breachRate)}</span>` : dash), foot: t => F.vnd(t.breachCollected) },
        ...days.map((d, i) => ({ key: 'ms' + i, label: '<span data-tip="Đã thu cộng dồn đến hết ngày ' + d + ' so với phải thu">Ngày ' + d + '</span>', num: true, render: r => (r.due ? F.pctv(r.ms[i] / r.due) : '–'), foot: t => (t.due ? F.pctv(t.ms[i] / t.due) : '–') })),
        { key: 'a', label: 'DT sau 3 mốc', num: true, render: r => F.vnd(r.A), foot: t => F.vnd(t.A) }, { key: 'hs', label: 'HS', num: true, render: r => hs(r.HS), foot: t => hs(t.HS) }];
      tb.innerHTML = K.tableCard('t', `${cp.managers.length} quản lý`, '', 'Theo phân công tại ngày mốc cuối · còn phải thu đã trừ phần phá HĐ chưa thu');
      U.table(tb.querySelector('#t'), { rows: cp.managers, noPager: true, rowKey: r => (r.manager ? r.manager.id : 'none'), cols, stickyFirst: true, footer: () => foot(cols, T) });
    }
    if (tab === 'cho-duyet' || tab === 'lich-su') {
      const isPend = tab === 'cho-duyet', me = (S.session || {}).userId;
      const list = isPend ? pend : Q.milestoneRecords({ period, building: q.building }).filter(inView);
      const sysOf = r => Q.receiptCum(r.period, r.buildingId, r.day);
      tb.innerHTML = (isPend && canApprove && list.length ? U.note('info', 'Kiểm tra trước khi duyệt', 'So số quản lý nhập với số tính từ phiếu thu. Lệch lớn: hỏi lại quản lý hoặc từ chối kèm lý do. Số đã duyệt thay số phiếu thu trong lương vận hành.') : '')
        + K.tableCard('t', isPend ? `${list.length} mốc chờ duyệt` : `${list.length} lần cập nhật`);
      U.table(tb.querySelector('#t'), { rows: list, pageSize: 25, unit: 'bản nhập', empty: U.empty({ icon: 'check-circle', title: isPend ? 'Không có mốc chờ duyệt' : 'Chưa có lần cập nhật nào', text: isPend ? 'Các mốc quản lý đã nhập đều được xử lý.' : '' }), cols: [
        { key: 'b', label: 'Tòa', render: r => `<b class="code">${esc(Q.building(r.buildingId).code)}</b>` },
        { key: 'k', label: 'Mốc', render: r => U.cell2('Ngày ' + r.day, (r.version || 1) > 1 ? 'lần nhập ' + r.version : '') },
        { key: 'a', label: 'Quản lý nhập', num: true, render: r => `<b>${F.vnd(r.amount)}</b>` + (r.previousAmount != null ? `<span class="sub">trước ${F.vnd(r.previousAmount)}</span>` : '') },
        { key: 's', label: 'Theo phiếu thu', num: true, render: r => F.vnd(sysOf(r)) },
        { key: 'd', label: 'Lệch', num: true, render: r => { const sys = sysOf(r), dd = r.amount - sys; return Math.abs(dd) <= 0.5 ? dash : `<span class="${Math.abs(dd) > Math.max(1, sys) * 0.05 ? 'red bold' : ''}">${sgn(dd)}</span>`; } },
        { key: 'n', label: 'Người nhập', render: r => U.cell2(esc(r.reportedByName || ''), F.datetime(r.reportedAt)) },
        { key: 'note', label: 'Ghi chú', cls: 'wrap', render: r => (r.note || r.evidence ? esc(r.note || '') + (r.evidence ? `<span class="sub">${esc(r.evidence)}</span>` : '') : dash) },
        ...(isPend ? [] : [{ key: 'st', label: 'Trạng thái', cls: 'wrap sm', render: r => stChip(r) + (r.approvedBy && r.status !== 'pending' ? `<span class="sub">${esc(r.approvedBy)} · ${F.datetime(r.approvedAt)}</span>` : '') + (r.rejectReason ? `<span class="sub red">${esc(r.rejectReason)}</span>` : '') }]),
        { key: 'actions', label: '', render: r => (r.status !== 'pending' ? '' : U.rowActions([
          ...(canApprove ? [U.btn({ label: 'Duyệt', size: 'btn-sm', cls: 'btn-primary', act: 'ok', attrs: { 'data-id': r.id } }), U.btn({ label: 'Từ chối', size: 'btn-sm', act: 'no', attrs: { 'data-id': r.id } })] : []),
          ...(r.reportedBy === me ? [U.btn({ label: 'Sửa', size: 'btn-sm', act: 'edit', attrs: { 'data-b': r.buildingId, 'data-k': r.milestone } }), U.btn({ label: 'Hủy', size: 'btn-sm', cls: 'btn-danger', act: 'cancel', attrs: { 'data-id': r.id } })] : [])])) }] });
      U.bind(tb, {
        ok: (el) => K.formDrawer({ title: 'Duyệt số mốc thu', modal: true, fields: [{ name: 'note', label: 'Ghi chú kiểm tra (tùy chọn)', type: 'textarea', span: true }], submit: 'Duyệt', onSubmit: (x) => { X.approveMilestone(el.dataset.id, x.note); U.toast('ok', 'Đã duyệt', 'Lương vận hành kỳ này dùng số đã duyệt'); } }),
        no: (el) => K.formDrawer({ title: 'Từ chối số mốc thu', modal: true, fields: [{ name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Từ chối', onSubmit: (x) => { X.rejectMilestone(el.dataset.id, x.reason); U.toast('ok', 'Đã từ chối', 'Quản lý thấy lý do và nhập lại'); } }),
        edit: (el) => updateDrawer(period, el.dataset.b, Number(el.dataset.k)),
        cancel: (el) => K.act(() => X.cancelMilestone(el.dataset.id), 'Đã hủy bản nhập'),
      });
    }
  });

  /* Giải thích cách tính – tách khỏi tiêu đề trang và tiêu đề bảng cho đỡ rối */
  const howModal = (cp) => {
    const w = cp.weights.map(x => Math.round(x * 100) + '%'), d = cp.days;
    U.modal({ title: 'Cách tính thu tiền theo tòa', body: `<ul class="plain-list">
      <li><b>Phải thu</b> = tổng hóa đơn đã phát hành của tòa trong kỳ. Phòng phá hợp đồng tính theo hóa đơn gốc.</li>
      <li>Quản lý nhập <b>số đã thu cộng dồn</b> của cả tòa đến hết ngày ${d.join(', ')}; admin kiểm tra với phiếu thu rồi duyệt. Mốc chưa có số duyệt tạm dùng số tính từ phiếu thu.</li>
      <li><b>DT mốc 1</b> = số ngày ${d[0]} × ${w[0]} (đã trừ cọc mới và tháng trả trước).<br><b>DT mốc 2</b> = (ngày ${d[1]} − ngày ${d[0]}) × ${w[1]}.<br><b>DT mốc 3</b> = (ngày ${d[2]} − ngày ${d[1]}) × ${w[2]}.</li>
      <li><b>DT sau 3 mốc</b> = tổng ba DT mốc; dùng tính HS và lương vận hành của quản lý phụ trách tòa.</li>
      <li><b>Còn phải thu</b> = phải thu − thực thu − (phá HĐ − phá HĐ thu được).</li></ul>` });
  };

  /* Ngăn chi tiết một tòa: số 3 mốc so với phiếu thu, DT mốc 1/2/3, HS và lịch sử cập nhật */
  const detailDrawer = (period, bid) => {
    const row = Q.collectionProgress(period).rows.find(r => r.buildingId === bid); if (!row) return null;
    const hist = Q.milestoneRecords({ period, building: bid }), canUpd = A.can('collection.report') && A.inScope(bid);
    const tone = { approved: 'green', pending: 'amber', rejected: 'red' };
    const body = `<div class="sum-box">
        <div class="it"><span>Phải thu</span><b>${F.vnd(row.due)}</b></div>
        <div class="it"><span>Thực thu</span><b>${F.vnd(row.collected)} · ${pct(row.rate)}</b></div>
        ${row.breachDue ? `<div class="it"><span>Phá HĐ (theo hóa đơn gốc)</span><b>${F.vnd(row.breachDue)} · thu ${F.vnd(row.breachCollected)}</b></div>` : ''}</div>
      <div><div class="fs-h">Số thu tại 3 mốc</div><div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Mốc</th><th class="num">Dùng tính lương</th><th class="num">Theo phiếu thu</th><th class="num">Lệch</th><th>Trạng thái</th></tr></thead><tbody>${row.ms.map(m => { const k = msKind(m); return `<tr>
        <td>${U.cell2('Ngày ' + m.day, F.date(m.date))}</td><td class="num"><b>${m.reached || m.approved ? F.vnd(m.value) : '–'}</b></td><td class="num">${m.reached ? F.vnd(m.sys) : '–'}</td>
        <td class="num">${m.approved && Math.abs(m.diff) > 0.5 ? sgn(m.diff) : '–'}</td><td>${U.chip(MS[k][1], MS[k][0] || 'gray')}${m.pending ? `<span class="sub">đang chờ ${F.vnd(m.pending.amount)}</span>` : ''}</td></tr>`; }).join('')}</tbody></table></div></div>
      <div><div class="fs-h">Doanh thu tính lương</div>${U.kv([['DT mốc 1', F.vnd(row.M1)], ['DT mốc 2', F.vnd(row.M2)], ['DT mốc 3', F.vnd(row.M3)], ['DT sau 3 mốc', F.vnd(row.A)], ['HS tạm tính', hs(row.HS)]], 'one')}</div>
      <div><div class="fs-h">Lịch sử cập nhật</div>${hist.length ? U.timeline(hist.map(r => ({ when: F.datetime(r.reportedAt), color: tone[r.status] || 'gray', fill: r.status === 'approved',
        title: `Ngày ${r.day}: ${F.vnd(r.amount)} – ${(Q.MS_ST[r.status] || [r.status])[0]}`, sub: esc([r.reportedByName, r.note, r.rejectReason ? 'Lý do từ chối: ' + r.rejectReason : ''].filter(Boolean).join(' · ')) }))) : '<p class="muted small">Chưa có lần cập nhật nào – các mốc đang dùng số phiếu thu.</p>'}</div>`;
    const d = U.drawer({ title: 'Thu tiền tòa ' + esc(row.code), sub: `Kỳ ${F.periodShort(period)} · quản lý ${mgrName(row)}`, wide: true, body,
      footer: U.btn({ label: 'Đóng', act: 'close-d' }) + (canUpd ? U.btn({ label: 'Cập nhật mốc', icon: 'pencil', cls: 'btn-primary', act: 'upd-d' }) : '') });
    U.bind(d.el, { 'close-d': () => d.close(), 'upd-d': () => { d.close(); updateDrawer(period, bid); } });
    return d;
  };

  /* Drawer cập nhật mốc: số đã thu cộng dồn của tòa; hiện số phiếu thu, mốc liền trước và DT mốc tính lại khi nhập */
  const updateDrawer = (period, bid, kDefault) => {
    const row = Q.collectionProgress(period).rows.find(r => r.buildingId === bid); if (!row) return;
    const reached = row.ms.filter(m => m.reached);
    const k0 = kDefault || (reached.length ? reached[reached.length - 1].k : 1), m0 = row.ms[k0 - 1];
    const info = (k) => { const m = row.ms[k - 1], prev = k > 1 ? row.ms[k - 2] : null; return `<div class="sum-box">
      <div class="it"><span>Theo phiếu thu đến ${F.date(m.date)}</span><b>${F.vnd(m.sys)}</b></div>
      ${m.approved ? `<div class="it"><span>Số đã duyệt hiện tại</span><b>${F.vnd(m.approved.amount)}</b></div>` : ''}
      ${prev ? `<div class="it"><span>Mốc ngày ${prev.day}</span><b>${F.vnd(prev.value)}</b></div>` : ''}
      <div class="it"><span>Phải thu của tòa</span><b>${F.vnd(row.due)}</b></div>
      <div class="it"><span>DT mốc 1 / 2 / 3 sau khi nhập</span><b id="msCalc">–</b></div></div>`; };
    const d = K.formDrawer({ title: 'Cập nhật mốc thu – tòa ' + row.code, sub: `Kỳ ${F.periodShort(period)} · nhập số đã thu cộng dồn của cả tòa đến hết ngày mốc`, fields: [
      { name: 'milestone', label: 'Mốc', type: 'select', req: true, value: String(k0), options: row.ms.map(m => [String(m.k), `Ngày ${m.day} (${F.date(m.date)})` + (m.reached ? '' : ' – chưa đến')]) },
      { name: 'amount', label: 'Đã thu cộng dồn', type: 'money', req: true, value: (m0.pending || m0.approved || {}).amount ?? Math.round(m0.sys) },
      { type: 'html', span: true, html: `<div id="msInfo">${info(k0)}</div>` },
      { name: 'note', label: 'Ghi chú', type: 'textarea', span: true, value: (m0.pending || {}).note || '', help: 'Bắt buộc khi số cộng dồn giảm so với mốc liền kề' },
      { name: 'evidence', label: 'Chứng từ / nguồn', span: true, value: (m0.pending || {}).evidence || '', placeholder: 'Sao kê, sổ thu tiền mặt…' }],
      submit: 'Gửi duyệt', onSubmit: (x) => { X.reportMilestone({ period, buildingId: bid, milestone: Number(x.milestone), amount: F.num(x.amount), note: x.note, evidence: x.evidence }); U.toast('ok', 'Đã gửi duyệt', 'Admin kiểm tra và duyệt số mốc'); } });
    const recalc = () => {
      const data = d.data(), k = Number(data.milestone), v = F.num(data.amount), cum = row.ms.map(m => m.value); cum[k - 1] = v;
      const st = TH.calc.payments.milestoneSteps(cum, Q.milestoneCfg(period).w, row.deduct), el = d.el.querySelector('#msCalc');
      if (el) el.textContent = st.map(x => F.vnd(x || 0)).join(' / ');
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
