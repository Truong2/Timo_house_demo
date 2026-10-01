/* UI-47 Sổ sửa chữa & ứng chi vật tư. Tabs: sổ theo kỳ (26 → 25) · ứng chi & lương thợ · sơn. Chế độ "như Excel" (mọi dòng của sheet) để đối chiếu
   SRC-16 (NT-5, NT-6); chế độ web chỉ tính dòng có ngày trong kỳ và cảnh báo dòng ngoài kỳ (K-6). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, A = TH.auth, RP = TH.calc.repairs;
  const TABS = [{ key: 'so', label: 'Sổ sửa chữa' }, { key: 'ung-chi', label: 'Ứng chi & lương thợ', perm: 'repairs.money' }, { key: 'son', label: 'Sơn' }, { key: 'tai-lieu', label: 'Biên bản & ảnh', perm: 'documents.download' }];
  const BT = { company: 'gray', tenant: 'amber', owner: 'purple' };
  TH.router.handle('/repairs', (root, p, q) => {
    const tab = K.pickTab(TABS, q.tab, 'so');
    const cur = Q.repairPeriodOf(F.today()), P = TH.calc.dates.prevPeriod;
    const periods = [...new Set([...S.all('repairLogs').map(r => r.period), cur, P(cur), P(P(cur))])].sort().reverse();
    const openPeriods = periods.filter(x => (S.get('periods', x) || {}).source !== 'excel_parallel' && (S.get('periods', x) || {}).status !== 'closed'); // D14: kỳ ghi được
    // mặc định: kỳ sổ hiện tại nếu đã có việc, không thì kỳ gần nhất có dữ liệu
    const period = q.period || periods.find(x => S.one('repairLogs', r => r.period === x)) || periods[0];
    const mode = q.mode || 'web';
    const [w0, w1] = Q.repairWindow(period);
    const workers = Q.repairWorkers().filter(e => A.role() !== 'kythuat' || e.id === S.session.employeeId);
    const L = Q.repairLedger(period, { workerId: q.worker, mode });
    let rows = Q.repairsScoped(L.rows);
    if (q.building) rows = rows.filter(r => r.buildingId === q.building);
    if (q.bearer) rows = rows.filter(r => r.bearer === q.bearer);
    if (q.status) rows = rows.filter(r => r.status === q.status);
    const outside = Q.repairsScoped(L.outside);
    const sum = (arr, k) => arr.reduce((t, r) => t + (r[k] || 0), 0);
    const conf = rows.filter(r => r.status === 'confirmed'), dr = rows.filter(r => r.status === 'draft'); // D15: KPI chỉ tính dòng đã xác nhận
    const isPar = (S.get('periods', period) || {}).source === 'excel_parallel';
    root.innerHTML = U.pageHead({ title: 'Sổ sửa chữa & ứng chi vật tư', sub: `Kỳ sổ ${F.periodShort(period)}: ${F.date(w0)} → ${F.date(w1)} · tiền công vào bảng lương, vật tư công ty chịu vào chi phí dòng 41 theo tòa (OQ-22) · "khách chi" chỉ là đề xuất trừ cọc (OQ-23)`,
      acts: [U.btn({ label: 'Xuất', icon: 'download', act: 'exp' }), U.btn({ label: 'Chốt kỳ sổ', icon: 'lock', act: 'post', perm: 'repairs.confirm' }), U.btn({ label: 'Thêm việc', icon: 'plus', cls: 'btn-primary', act: 'add', perm: 'repairs.enter' })] })
      + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Số việc', value: rows.length, cap: new Set(rows.map(r => r.buildingId)).size + ' tòa · ' + new Set(rows.filter(r => r.roomId).map(r => r.roomId)).size + ' phòng', icon: 'wrench', tone: 'blue' })}
        ${U.kpi({ label: 'Tiền công', value: F.vnd(sum(conf, 'labor')), cap: 'đã xác nhận – vào bảng lương thợ' + (dr.length ? ' · ' + dr.length + ' dòng nháp chưa tính (' + F.vnd(sum(dr, 'labor')) + 'đ)' : ''), icon: 'users', tone: 'purple' })}${U.kpi({ label: 'Vật tư', value: F.vnd(sum(conf, 'material')), cap: 'tổng đã xác nhận ' + F.vnd(sum(conf, 'labor') + sum(conf, 'material')) + 'đ' + (dr.length ? ' · nháp ' + F.vnd(sum(dr, 'material')) + 'đ' : ''), icon: 'package', tone: 'green' })}
        ${U.kpi({ label: 'Dòng ngoài kỳ 26→25', value: outside.length, cap: outside.length ? 'công ' + F.vnd(sum(outside, 'labor')) + ' · vật tư ' + F.vnd(sum(outside, 'material')) + (mode === 'excel' ? ' (đang tính theo Excel)' : ' (không tính)') : 'không có', icon: 'alert-triangle', tone: outside.length ? 'red' : 'gray' })}</div>`
      + (isPar ? U.note('info', 'Kỳ chạy song song Excel', 'Sổ kỳ này nạp từ file SRC-16 để đối chiếu; lương và chi phí sửa chữa của kỳ đã nằm trong số Excel nên không ghi lại.') : '')
      + U.tabs(TABS.filter(t => !t.perm || A.can(t.perm)), tab)
      + K.filters([{ name: 'period', label: 'Kỳ sổ', options: periods.map(x => [x, 'Kỳ ' + F.periodShort(x)]), value: period, all: false }, { name: 'worker', label: 'Thợ', options: workers.map(e => [e.id, e.name]), all: A.role() === 'kythuat' ? false : 'Tất cả' },
        { name: 'mode', label: 'Cách tính', options: [['web', 'Web – chỉ dòng trong kỳ'], ['excel', 'Như Excel – mọi dòng của sheet']], value: 'web', all: false }, ...(tab === 'so' ? [{ name: 'building', label: 'Tòa', options: K.buildingOpts() }, { name: 'bearer', label: 'Người chịu', options: RP.BEARERS }, { name: 'status', label: 'Trạng thái', options: [['draft', 'Nháp'], ['confirmed', 'Đã xác nhận']] }] : [])], q)
      + '<div id="tb" class="mt16"></div>';
    K.bindFilters(root, ['tab']);
    const tb = root.querySelector('#tb');
    if (tab === 'so') {
      const sug = rows.filter(r => r.tenantCharge && r.tenantCharge.status === 'suggested');
      tb.innerHTML = (outside.length && mode === 'web' ? U.note('warn', `${outside.length} dòng có ngày ngoài kỳ sổ ${F.date(w0)} → ${F.date(w1)} (K-6)`, 'Không tính vào tổng kỳ này ở chế độ web. Chọn "Như Excel" để đối chiếu đúng tổng file; khách cần xác nhận các dòng này thuộc kỳ nào.') : '')
        + (sug.length && A.can('repairs.confirm') ? U.note('info', `${sug.length} việc "khách chi" – đề xuất trừ cọc hoặc thu khác trên hóa đơn nháp (OQ-23)`, sug.map(r => { const rf = Q.refundForRepair(r); return `${esc(r.code)} ${esc(r.buildingCode)}${r.roomCode ? '-' + esc(r.roomCode) : ''} ${F.vnd(r.tenantCharge.amount)}đ → ${rf ? `<button type="button" class="btn btn-xs btn-ghost" data-act="apply" data-id="${r.id}">Áp vào phiếu ${esc(rf.code)}</button>` : Q.draftInvoiceForRepair(r) ? `<button type="button" class="btn btn-xs btn-ghost" data-act="applyinv" data-id="${r.id}">Thêm vào "Thu khác" hóa đơn nháp</button>` : '<span class="muted">chưa có phiếu hoàn / hóa đơn nháp</span>'}`; }).join('<br>')) : '')
        + K.tableCard('t', rows.length + ' việc', U.btn({ label: 'Xác nhận đã chọn', icon: 'check-circle', size: 'btn-sm', act: 'confirm', perm: 'repairs.confirm' }));
      U.table(tb.querySelector('#t'), { rows: rows.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))), pageSize: 25, selectable: A.can('repairs.confirm'), selectableIf: r => r.status === 'draft', rowClass: r => (!Q.repairInPeriod(r, r.period) ? 'tint-amber' : ''), cols: [
        { key: 'c', label: 'Mã', render: r => `<b>${esc(r.code)}</b>` }, { key: 'd', label: 'Ngày', sortable: true, sortVal: r => r.date, render: r => F.date(r.date) + (!Q.repairInPeriod(r, r.period) ? ' ' + U.chip('ngoài kỳ', 'red') : '') },
        { key: 'b', label: 'Tòa / phòng', render: r => `<span class="code">${esc(r.buildingCode || '')}${r.roomCode ? '-' + esc(r.roomCode) : ''}</span>`
          + (r.stayId ? '<br>' + (A.can('tenants.view') ? `<a class="small" href="#/stays/${r.stayId}">${esc((Q.stay(r.stayId) || {}).code || '')}</a>` : `<span class="small muted">${esc((Q.stay(r.stayId) || {}).code || '')}</span>`) : '')
          + ((r.photos || []).length ? ' ' + `<span title="${esc(r.photos.map(f => f.name).join(', '))}">${U.chip(r.photos.length + ' ảnh', 'blue')}</span>` : '') }, { key: 'n', label: 'Nội dung', render: r => `<span class="small">${esc(r.desc)}</span>` },
        { key: 'j', label: 'Loại việc', render: r => esc(RP.label(RP.JOB_TYPES, r.jobType)) }, { key: 'w', label: 'Thợ', render: r => esc((Q.emp(r.workerId) || {}).name || '') },
        { key: 'l', label: 'Tiền công', num: true, render: r => r.labor ? F.vnd(r.labor) : '–' }, { key: 'm', label: 'Vật tư', num: true, render: r => r.material ? F.vnd(r.material) : '–' }, { key: 'ps', label: 'Lấy sơn', render: r => esc(r.paintFrom || '') },
        { key: 'r', label: 'Lý do', render: r => esc(RP.label(RP.REASONS, r.reason)) }, { key: 'br', label: 'Người chịu', render: r => U.chip(RP.label(RP.BEARERS, r.bearer), BT[r.bearer]) + (r.tenantCharge ? ' ' + U.chip(r.tenantCharge.status === 'applied' ? 'đã trừ cọc' : 'đề xuất trừ cọc', r.tenantCharge.status === 'applied' ? 'green' : 'amber') : '') + (r.collectStatus ? `<small class="muted"> ${esc(r.collectStatus)}</small>` : '') },
        { key: 'nt', label: 'Ghi chú', render: r => `<span class="small muted">${esc(r.note || '')}</span>` }, { key: 'st', label: 'Trạng thái', render: r => (r.status === 'draft' ? U.chip('Nháp', 'gray') : U.chip('Đã xác nhận', 'green') + (r.posted && r.posted !== 'excel' ? ' ' + U.chip('đã vào chi phí', 'blue') : '') + ((r.history || []).length ? ' ' + U.chip('điều chỉnh ' + r.history.length, 'amber') : ''))
          + (r.periodOverride ? ' ' + U.chip('ghi kỳ này có lý do', 'amber') : '') + (r.status === 'confirmed' && r.source === 'web' && A.can('repairs.confirm') ? ' ' + U.actBtn({ icon: 'pencil', label: 'Điều chỉnh', act: 'adjr', attrs: { 'data-id': r.id } }) : '') }],
        footer: (all) => `<tr><td colspan="6"><b>Tổng ${all.length} việc</b></td><td class="num"><b>${F.vnd(sum(all, 'labor'))}</b></td><td class="num"><b>${F.vnd(sum(all, 'material'))}</b></td><td colspan="5"></td></tr>` });
    }
    if (tab === 'ung-chi') {
      const st = workers.map(e => Q.repairSettlement(e.id, period, mode)).filter(x => x.count || x.advance);
      tb.innerHTML = K.tableCard('t', 'Lương thợ & quyết toán ứng chi – kỳ ' + F.periodShort(period) + (mode === 'excel' ? ' (như Excel)' : ''), U.btn({ label: 'Ghi ứng chi', icon: 'plus', size: 'btn-sm', act: 'adv', perm: 'repairs.confirm' }))
        + U.note('info', '', 'Lương = lương cứng + thâm niên + tiền công theo sổ + ăn trưa. Quyết toán = vật tư thực chi − số ứng: dương → công ty trả thêm cho thợ; âm → thợ trả lại công ty.');
      U.table(tb.querySelector('#t'), { rows: st, noPager: true, cols: [{ key: 'w', label: 'Thợ', render: x => U.cell2(esc(x.worker.name), esc(x.worker.code)) }, { key: 'n', label: 'Số việc', num: true, render: x => x.count },
        { key: 'b', label: 'Lương cứng', num: true, render: x => F.vnd(x.base) }, { key: 's', label: 'Thâm niên', num: true, render: x => F.vnd(x.seniority) }, { key: 'l', label: 'Tiền công (sổ)', num: true, render: x => F.vnd(x.labor) },
        { key: 'lu', label: 'Ăn trưa', num: true, render: x => F.vnd(x.lunch) }, { key: 'p', label: 'Tổng lương', num: true, render: x => `<b>${F.vnd(x.pay)}</b>` }, { key: 'a', label: 'Ứng chi', num: true, render: x => F.vnd(x.advance) },
        { key: 'm', label: 'Vật tư thực chi', num: true, render: x => F.vnd(x.material) }, { key: 'd', label: 'Quyết toán', num: true, render: x => x.diff > 0 ? `<b class="amber">Công ty trả thêm ${F.vnd(x.diff)}</b>` : x.diff < 0 ? `<b class="green">Thợ trả lại ${F.vnd(-x.diff)}</b>` : '0' },
        { key: 'qt', label: 'Chứng từ quyết toán', render: x => { const doc = Q.repairSettlementDoc(x.worker.id, period); return doc ? U.chip(doc.code + ' · ' + F.date(doc.date), 'green') : isPar || mode === 'excel' ? '<span class="small muted">–</span>' : U.actBtn({ icon: 'receipt', label: 'Quyết toán', act: 'settle', attrs: { 'data-id': x.worker.id }, perm: 'repairs.confirm' }); } }] });
      U.bind(tb, { settle: (el) => { const x = Q.repairSettlement(el.dataset.id, period, 'web'); K.formDrawer({ title: 'Quyết toán ứng chi – ' + esc(x.worker.name) + ' · kỳ ' + F.periodShort(period), modal: true,
          note: U.note(x.diff > 0 ? 'warn' : 'info', x.diff > 0 ? `Phiếu chi bổ sung: công ty trả thêm ${F.vnd(x.diff)}đ cho thợ` : x.diff < 0 ? `Phiếu thu hoàn ứng: thợ nộp lại ${F.vnd(-x.diff)}đ` : 'Vật tư thực chi bằng số ứng – không phát sinh tiền',
            `Vật tư ${F.vnd(x.material)} − ứng ${F.vnd(x.advance)}. Chứng từ quỹ, không ghi chi phí mới (vật tư đã vào chi phí dòng 41 khi chốt kỳ sổ) [GĐ-E2]. Sau quyết toán không đổi vật tư / số ứng của kỳ.`),
          fields: [{ name: 'date', label: 'Ngày', type: 'date', value: F.today(), req: true }, { name: 'method', label: 'Hình thức', type: 'select', options: [['cash', 'Tiền mặt'], ['bank', 'Chuyển khoản']], value: 'cash' }, { name: 'note', label: 'Ghi chú', span: true }],
          submit: 'Quyết toán', onSubmit: (d) => { const doc = X.settleRepairAdvance(x.worker.id, period, d); U.toast('ok', 'Đã quyết toán ' + doc.code); } }); },
        adv: () => K.formDrawer({ title: 'Ghi ứng chi vật tư – kỳ ' + F.periodShort(period), modal: true, fields: [{ name: 'workerId', label: 'Thợ', type: 'select', req: true, options: workers.map(e => [e.id, e.name]) }, { name: 'amount', label: 'Số ứng', type: 'money', req: true }, { name: 'note', label: 'Ghi chú', span: true }],
        submit: 'Lưu', onSubmit: (x) => { X.setRepairAdvance(x.workerId, period, F.num(x.amount), x.note); U.toast('ok', 'Đã ghi ứng chi'); } }) });
    }
    if (tab === 'son') {
      const P = (TH.data.p2 && TH.data.p2.repairs.paint) || { stock: [], uses: [] };
      const used = rows.filter(r => r.paintFrom);
      const moves = S.all('paintMoves').slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
      tb.innerHTML = `<div class="grid grid-2">${U.card({ title: 'Tồn sơn theo điểm', icon: 'package', actions: U.btn({ label: 'Nhập / xuất sơn', icon: 'plus', size: 'btn-xs', act: 'paint', perm: 'repairs.confirm' }),
          body: U.kv(Q.paintStock().map(x => ['Điểm ' + x.point, F.num0(x.qty) + ' thùng'])) + U.note('info', '', 'Tồn đầu từ SRC-16 Sheet4 + nhập − xuất trên web. Theo dõi đơn giản theo điểm lấy sơn – không phải module kho.')
            + (moves.length ? '<div class="mt8">' + moves.slice(0, 8).map(m => `<div class="mini-row"><span>${F.date(m.date)} · ${m.kind === 'in' ? 'Nhập' : 'Xuất'} ${F.num0(m.qty)} thùng · ${esc(m.point)}${m.roomId ? ' → ' + esc(Q.roomCode(m.roomId)) : ''}</span><span class="small muted">${esc(m.by || '')}</span></div>`).join('') + '</div>' : '') })}
        ${U.card({ title: 'Phòng đã lấy sơn', icon: 'brush', bodyCls: 'flush', body: `<table class="tbl compact"><thead><tr><th>Phòng</th><th class="num">Số thùng</th><th>Ghi chú</th></tr></thead><tbody>${P.uses.map(u => `<tr><td>${esc(u.rooms)}</td><td class="num">${F.num0(u.qty)}</td><td>${esc(u.note)}</td></tr>`).join('')}</tbody></table>` })}</div>`
        + '<div class="mt16">' + K.tableCard('t', 'Việc trong kỳ có ghi điểm lấy sơn (' + used.length + ')') + '</div>';
      U.table(tb.querySelector('#t'), { rows: used, pageSize: 15, cols: [{ key: 'd', label: 'Ngày', render: r => F.date(r.date) }, { key: 'b', label: 'Tòa / phòng', render: r => esc(r.buildingCode + (r.roomCode ? '-' + r.roomCode : '')) }, { key: 'n', label: 'Nội dung', render: r => esc(r.desc) }, { key: 'p', label: 'Điểm lấy sơn', render: r => esc(r.paintFrom) }] });
    }
    if (tab === 'tai-lieu') { // E1 [GĐ-E1]: biên bản bàn giao / ảnh chỉ số của tòa có việc sửa trong kỳ (kỹ thuật: chỉ tòa có việc của mình)
      const bs = new Set(rows.map(r => r.buildingId));
      tb.innerHTML = U.card({ title: 'Biên bản bàn giao & ảnh chỉ số – tòa có việc sửa trong kỳ', icon: 'folder', body: TH.pages.docDownloadList(Q.downloadableDocs(d => ['handover', 'meter_photo'].includes(d.type) && bs.has(d.buildingId))) });
    }
    const tbl = tb.querySelector('#t') && tb.querySelector('#t')._tbl;
    U.bind(root, {
      tab: (el) => TH.router.setQuery({ tab: el.dataset.key }), docdl: (el) => TH.pages.docDownload(el.dataset.id),
      paint: () => K.formDrawer({ title: 'Nhập / xuất sơn', modal: true, fields: [{ name: 'kind', label: 'Loại', type: 'select', options: [['in', 'Nhập thêm'], ['out', 'Xuất cho phòng']], value: 'in', req: true }, { name: 'point', label: 'Điểm', req: true, placeholder: 'T20, T42, T33, T28, VP' },
        { name: 'qty', label: 'Số thùng', type: 'number', req: true }, { name: 'date', label: 'Ngày', type: 'date', value: F.today(), req: true }, { name: 'roomCode', label: 'Phòng lấy sơn (khi xuất)', placeholder: 'vd 203T20' }, { name: 'note', label: 'Ghi chú', span: true }],
        submit: 'Lưu', onSubmit: (x) => { X.addPaintMove(x); U.toast('ok', 'Đã ghi ' + (x.kind === 'in' ? 'nhập' : 'xuất') + ' sơn'); } }),
      apply: (el) => K.act(() => X.applyRepairToRefund(el.dataset.id), 'Đã áp vào phiếu hoàn cọc'),
      applyinv: (el) => K.act(() => X.applyRepairToInvoice(el.dataset.id), 'Đã thêm vào "Thu khác" hóa đơn nháp'),
      adjr: (el) => { const r = S.get('repairLogs', el.dataset.id); K.formDrawer({ title: 'Điều chỉnh ' + r.code, modal: true, note: U.note('info', '', 'Điều chỉnh được khi kỳ sổ còn mở, bảng lương kỳ chưa chốt và vật tư chưa chốt kỳ sổ. Lưu lịch sử thay đổi; bù trừ chủ nhà và đề xuất trừ cọc đi theo số mới.'),
        fields: [{ name: 'labor', label: 'Tiền công', type: 'money', value: r.labor }, { name: 'material', label: 'Vật tư', type: 'money', value: r.material }, { name: 'bearer', label: 'Người chịu', type: 'select', options: RP.BEARERS, value: r.bearer },
          { name: 'collectStatus', label: 'Trạng thái thu (khách chịu)', type: 'select', options: RP.COLLECT, value: r.collectStatus || '' }, { name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }],
        submit: 'Lưu điều chỉnh', onSubmit: (x) => { X.adjustRepair(r.id, { labor: F.num(x.labor), material: F.num(x.material), bearer: x.bearer, collectStatus: x.collectStatus, reason: x.reason }); U.toast('ok', 'Đã điều chỉnh ' + r.code); } }); },
      confirm: () => { const ids = tbl ? [...tbl.selected] : []; K.act(() => X.confirmRepairs(ids), 'Đã xác nhận ' + ids.length + ' dòng'); },
      post: () => K.act(() => X.postRepairPeriod(period), 'Đã chốt kỳ sổ ' + F.periodShort(period)),
      exp: () => K.csv('so-sua-chua-' + period + '.csv', ['Mã', 'Ngày', 'Tòa', 'Phòng', 'Lượt thuê', 'Nội dung', 'Loại việc', 'Thợ', 'Tiền công', 'Vật tư', 'Điểm lấy sơn', 'Lý do', 'Người chịu', 'Trạng thái thu', 'Ảnh', 'Ghi chú', 'Trạng thái'],
        rows.map(r => [r.code, r.date, r.buildingCode, r.roomCode || '', (Q.stay(r.stayId) || {}).code || '', r.desc, RP.label(RP.JOB_TYPES, r.jobType), (Q.emp(r.workerId) || {}).name, r.labor, r.material, r.paintFrom || '', RP.label(RP.REASONS, r.reason), RP.label(RP.BEARERS, r.bearer), r.collectStatus || '', (r.photos || []).map(f => f.name).join('; '), r.note || '', r.status])),
      add: () => U.bindDropzones(K.formDrawer({ title: 'Thêm việc sửa chữa', wide: true, note: U.note('info', '', `Kỳ sổ tính theo ngày: từ ngày ${Q.param('repairCycleStartDay')} tháng trước đến ngày ${Q.param('repairCycleStartDay') - 1} tháng này. Ngày ngoài kỳ đang chọn phải ghi lý do.`),
        fields: [...(A.role() === 'kythuat' ? [] : [{ name: 'workerId', label: 'Thợ', type: 'select', req: true, options: workers.map(e => [e.id, e.name]) }]), { name: 'date', label: 'Ngày', type: 'date', value: F.today(), req: true },
          { name: 'period', label: 'Kỳ sổ', type: 'select', options: [['', 'Theo ngày (tự xác định)'], ...openPeriods.map(x => [x, 'Kỳ ' + F.periodShort(x)])], value: '', help: 'Chọn kỳ khác ngày chỉ khi ghi bù – phải ghi lý do' }, { name: 'buildingId', label: 'Tòa', type: 'select', req: true, options: K.buildingOpts(false) }, { name: 'roomCode', label: 'Mã phòng (vd 203)' },
          { name: 'desc', label: 'Nội dung sửa chữa', req: true, span: true }, { name: 'jobType', label: 'Loại việc', type: 'select', req: true, options: RP.JOB_TYPES }, { name: 'reason', label: 'Lý do', type: 'select', options: RP.REASONS, value: 'other' },
          { name: 'labor', label: 'Tiền công', type: 'money' }, { name: 'material', label: 'Vật tư', type: 'money' }, { name: 'bearer', label: 'Người chịu', type: 'select', options: RP.BEARERS, value: 'company' }, { name: 'paintFrom', label: 'Điểm lấy sơn' },
          { name: 'stay', label: 'Gắn lượt thuê', type: 'select', options: [['current', 'Khách đang ở phòng'], ['last', 'Khách vừa trả phòng gần nhất']], placeholder: 'Không gắn', help: 'Việc khách chịu nên gắn lượt thuê để đề xuất trừ cọc / thu khác đúng khách' },
          { name: 'collectStatus', label: 'Trạng thái thu (khách chịu)', type: 'select', options: RP.COLLECT, placeholder: '–' },
          { name: 'periodReason', label: 'Lý do nếu ngày ngoài kỳ sổ', span: true }, { name: 'note', label: 'Ghi chú', span: true },
          { type: 'html', span: true, html: '<div class="field"><label>Ảnh việc sửa (trước / sau)</label>' + U.dropzone({ name: 'photos', hint: 'JPG, PNG, HEIC hoặc PDF', accept: 'image/*,.pdf' }) + '</div>' }],
        submit: 'Lưu nháp', onSubmit: (x, dd) => { const b = Q.building(x.buildingId); const room = b && x.roomCode ? S.one('rooms', r => r.code === String(x.roomCode).trim() + b.code) : null;
          if (x.roomCode && !room) { const e = new Error('Không tìm thấy phòng'); e.fields = { roomCode: 'Phòng ' + x.roomCode + ' không có trong tòa ' + (b ? b.code : '') }; throw e; }
          if (x.stay && !room) { const e = new Error('Chọn phòng'); e.fields = { stay: 'Nhập mã phòng để gắn lượt thuê' }; throw e; }
          const stay = !x.stay ? null : x.stay === 'current' ? Q.currentStay(room.id) : S.where('stays', s => s.roomId === room.id && s.status === 'ended').sort((p, q2) => String(q2.endDate).localeCompare(String(p.endDate)))[0];
          if (x.stay && !stay) { const e = new Error('Không có lượt thuê'); e.fields = { stay: x.stay === 'current' ? 'Phòng đang trống' : 'Phòng chưa có khách trả phòng' }; throw e; }
          const r = X.addRepair(Object.assign({}, x, { roomId: room ? room.id : null, stayId: stay ? stay.id : null, labor: F.num(x.labor), material: F.num(x.material), photos: U.dzFiles(dd.el, 'photos') })); U.toast('ok', 'Đã thêm ' + r.code); } }).el),
    });
  });
})(window.TH);
