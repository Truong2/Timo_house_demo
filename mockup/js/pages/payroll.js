/* UI-25 Bảng lương: HS = T/K×100, mốc 5/10/15 (100/90/70%), bậc cận gần nhất, thâm niên, tòa mới 100.000đ/phòng, lương trưởng nhóm; E21 giải thích; cờ duyệt tay; chốt → chi phí. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, P = TH.calc.payroll;
  const titleLabel = (t) => (TH.data.catalog.titlesAll || TH.data.catalog.titles)[t] || t;
  const explain = (line, b) => {
    const e = Q.emp(line.employeeId); const bd = Q.building(b.buildingId) || {};
    U.drawer({ title: 'Giải thích lương – ' + e.name, sub: `Tòa ${bd.code} · ${line.over1y ? 'thâm niên trên 1 năm' : 'thâm niên dưới 1 năm'} · nguồn ${b.source === 'SRC-03' ? 'input bảng lương Excel T8' : 'hóa đơn & phiếu thu trên web'}`, wide: true, body: `
      <div class="pay-exp">
        <b>Bước 1 – Mốc thu (ngày tiền thực nhận)</b><div class="f mt4">${b.R5 != null ? `R${(b.msDays || [5, 10, 15])[0]} = ${F.vnd(b.R5)} · R${(b.msDays || [5, 10, 15])[1]} = ${F.vnd(b.R10)} · R${(b.msDays || [5, 10, 15])[2]} = ${F.vnd(b.R15)}${b.deduct ? ' · trừ cọc/tháng trả trước ' + F.vnd(b.deduct) + ' (TH1)' : ' (TH2)'}<br>` : ''}M1 = ${F.vnd(b.M1)} (${Math.round((b.msW || [1, 0.9, 0.7])[0] * 100)}%) · M2 = ${F.vnd(b.M2)} (${Math.round((b.msW || [1, 0.9, 0.7])[1] * 100)}%) · M3 = ${F.vnd(b.M3)} (${Math.round((b.msW || [1, 0.9, 0.7])[2] * 100)}%) → A = ${F.vnd(b.A)}</div>
        <b class="d-block mt12">Bước 2–4 – Doanh thu tiền phòng thu được</b><div class="f mt4">L (phải thu điều chỉnh) = ${F.vnd(b.L)} · Q (dịch vụ cần thu) = ${F.vnd(b.Q)} → B = Q/L = ${F.dec(b.B, 4)}<br>C (phòng phát sinh + bỏ cọc) = ${F.vnd(b.C)}<br>T = A − A×B + C = <b>${F.vnd(b.T)}</b></div>
        <b class="d-block mt12">Bước 5 – Hiệu suất</b><div class="f mt4">K (DT niêm yết) = ${F.vnd(b.K)} · HS = T/K×100 = <b>${b.HS == null ? '–' : F.dec(b.HS, 2)}</b></div>
        <b class="d-block mt12">Bước 6 – Lương/phòng</b><div class="f mt4">${esc(b.rule)} = <b>${F.vnd(b.V)}</b> × ${b.J} phòng = <b>${F.vnd(b.W)}</b></div>
        ${b.excel ? `<div class="mt12 small">Excel SRC-03 dòng ${b.excel.row}: HS ${F.dec(b.excel.U, 2)} · V ${F.vnd(b.excel.V)} (${esc(b.excel.Vf)}) · W ${F.vnd(b.excel.W)} ${Math.abs(b.W - b.excel.W) > 0.5 ? U.chip('lệch ' + F.vnd(b.W - b.excel.W), 'red') : U.chip('khớp', 'green')}</div>` : ''}
      </div>
      <h4 class="mt16 mb8">Bảng bậc (quy tắc cận gần nhất – khớp SRC-03)</h4><table class="tbl compact"><thead><tr><th>HS</th><th class="num">Dưới 1 năm</th><th class="num">Trên 1 năm</th></tr></thead><tbody>${P.TIERS.slice().reverse().map(t => `<tr><td>${t[0]} – ${t[0] + 5}</td><td class="num">${F.vnd(t[1][0])} – ${F.vnd(t[1][1])}</td><td class="num">${F.vnd(t[2][0])} – ${F.vnd(t[2][1])}</td></tr>`).join('')}<tr><td>dưới 70</td><td colspan="2" class="num">10% mức thấp nhất bậc 70–75 (GĐ OQ-01c)</td></tr></tbody></table>
      <p class="small muted mt8">HS &lt; cận dưới + 2,5 → mức thấp / cận dưới; ngược lại mức cao / cận trên. HS &gt; 100 không chặn trần (tính theo cận 100), gắn cờ duyệt tay.</p>` });
  };
  /* Tab "Nhập tay" (SRS §2.3 mục 6): ngày công sale, lương vệ sinh/bảo vệ theo tòa, tiền công thợ theo tòa, hỗ trợ/điều chỉnh, ngày vào làm */
  const manualTab = (el, period, lines, editable, parallel) => {
    const M = X.manualOf(period); const bOpts = K.buildingOpts(false);
    const emp = (id) => esc((Q.emp(id) || {}).name || '');
    const del = (x) => editable ? U.actBtn({ icon: 'trash', label: 'Xóa', act: 'mdel', attrs: { 'data-id': x.id } }) : '';
    const sales = S.all('employees').filter(e => e.status === 'active' && X.SALE_TITLES.includes(e.title));
    const divisor = Q.param('saleDivisor', TH.calc.dates.periodEnd(period)) || 26;
    const rows = (kind) => M.filter(x => x.kind === kind);
    const list = (kind, cols) => rows(kind).length ? `<table class="tbl compact"><tbody>${rows(kind).map(x => `<tr>${cols(x)}<td class="num">${del(x)}</td></tr>`).join('')}</tbody></table>` : '<p class="small muted">Chưa có dòng nào</p>';
    const bc = (id) => esc((Q.building(id) || {}).code || '');
    const excelLines = parallel ? S.all('expenses').filter(e => e.period === period && ['sal_clean', 'sal_guard'].includes(e.reportLine) && e.status !== 'void') : [];
    const noHire = S.all('employees').filter(e => e.status === 'active' && !e.hireDate);
    el.innerHTML = (editable ? '' : U.note('warn', 'Chỉ xem', 'Kỳ đã khóa hoặc bảng lương đã chốt – sửa bằng "Điều chỉnh sau khóa".'))
      + `<div class="grid grid-2">${U.card({ title: 'Ngày công nhân viên kinh doanh', icon: 'calendar', sub: `Lương = lương cứng × ngày công / ${divisor} + phụ cấp (UI-25)`, body: sales.length ? `<table class="tbl compact"><thead><tr><th>Nhân viên</th><th class="num">Lương cứng</th><th class="num">Ngày công</th><th class="num">Tính ra</th></tr></thead><tbody>${sales.map(e => { const wd = M.find(x => x.kind === 'workdays' && x.employeeId === e.id); const d = wd ? wd.days : divisor;
          return `<tr><td>${esc(e.name)}${parallel && !wd ? ' <small class="muted">(Excel)</small>' : ''}</td><td class="num">${F.vnd(e.baseSalary || 0)}</td><td class="num">${editable ? `<input class="inp sm tr" style="width:70px" type="number" min="0" max="31" name="wd_${e.id}" value="${d}">` : d}</td><td class="num">${F.vnd(P.salePay(e.baseSalary || 0, d, divisor))}</td></tr>`; }).join('')}</tbody></table>${editable ? '<button class="btn btn-primary btn-sm mt8" data-act="savewd">Lưu ngày công</button>' : ''}` : '<p class="small muted">Không có nhân viên kinh doanh</p>' })}
        ${U.card({ title: 'Lương vệ sinh / bảo vệ theo tòa', icon: 'users', sub: 'Dòng 35 và 38 báo cáo; chốt bảng lương → chi phí theo tòa', actions: editable && !parallel ? U.btn({ label: 'Thêm', icon: 'plus', size: 'btn-sm', act: 'addbs' }) : '',
          body: parallel ? `<p class="small muted mb8">Kỳ chạy song song: lấy từ Excel (${excelLines.length} dòng, ${F.vnd(excelLines.reduce((s, e) => s + e.amount, 0))}).</p>` : list('building_salary', x => `<td><b>${bc(x.buildingId)}</b></td><td>${x.line === 'sal_clean' ? 'Vệ sinh' : 'Bảo vệ'}</td><td class="grow">${esc(x.note || '')}</td><td class="num"><b>${F.vnd(x.amount)}</b></td>`) })}
        ${U.card({ title: 'Tiền công thợ sửa chữa theo tòa', icon: 'wrench', sub: 'OQ-22: tiền công ghi thẳng vào dòng 41 của tòa; phần cố định của thợ vào quỹ "Lương sửa chữa"', actions: editable ? U.btn({ label: 'Thêm', icon: 'plus', size: 'btn-sm', act: 'addlb' }) : '',
          body: list('repair_labor', x => `<td>${emp(x.employeeId)}</td><td><b>${bc(x.buildingId)}</b></td><td class="grow">${esc(x.note || '')}</td><td class="num"><b>${F.vnd(x.amount)}</b></td>`) })}
        ${U.card({ title: 'Hỗ trợ / điều chỉnh lương theo người', icon: 'coins', sub: 'Khoản chưa có công thức nguồn (kỹ thuật, thị trường…) – cộng vào thực nhận', actions: editable ? U.btn({ label: 'Thêm', icon: 'plus', size: 'btn-sm', act: 'addmp' }) : '',
          body: list('manual_pay', x => `<td>${emp(x.employeeId)}</td><td class="grow">${esc(x.note || '')}</td><td class="num"><b>${F.vnd(x.amount)}</b></td>`) })}
        ${U.card({ title: 'Ngày vào làm (thâm niên)', icon: 'calendar-check', sub: 'Sửa ở hồ sơ nhân viên; thâm niên "trên 1 năm" khi đủ 12 tháng tại cuối kỳ', body: noHire.length ? `<p class="small">${noHire.length} nhân viên chưa có ngày vào làm: ${noHire.map(e => `<a href="#/hr/staff/${e.id}">${esc(e.name)}</a>`).join(', ')}</p>` : `<p class="small muted">Tất cả ${S.all('employees').filter(e => e.status === 'active').length} nhân viên đang làm đã có ngày vào làm. <a href="#/hr">Mở danh sách</a></p>` })}</div>`;
    const techs = S.all('employees').filter(e => e.status === 'active' && e.title === 'KỸ THUẬT').map(e => [e.id, e.name]);
    const all = S.all('employees').filter(e => e.status === 'active').map(e => [e.id, e.name + ' – ' + titleLabel(e.title)]);
    const addForm = (title, kind, fields) => K.formDrawer({ title, modal: true, fields: [...fields, { name: 'amount', label: 'Số tiền', type: kind === 'manual_pay' ? 'number' : 'money', req: true }, { name: 'note', label: 'Nội dung', type: 'textarea', span: true, req: kind === 'manual_pay' }],
      onSubmit: (d) => { X.addPayrollManual(Object.assign(d, { kind, period })); U.toast('ok', 'Đã thêm', 'Bấm "Tính lại" để cập nhật bảng lương'); } });
    U.bind(el, {
      savewd: () => K.act(() => { sales.forEach(e => { const v = el.querySelector(`[name="wd_${e.id}"]`).value; const cur = M.find(x => x.kind === 'workdays' && x.employeeId === e.id); if (String(cur ? cur.days : divisor) !== String(v)) X.setWorkdays(period, e.id, v); }); }, 'Đã lưu ngày công'),
      addbs: () => addForm('Lương vệ sinh / bảo vệ theo tòa', 'building_salary', [{ name: 'buildingId', label: 'Tòa', type: 'select', req: true, options: bOpts }, { name: 'line', label: 'Loại', type: 'select', req: true, options: [['sal_clean', 'Lương vệ sinh (dòng 35)'], ['sal_guard', 'Lương bảo vệ (dòng 38)']] }]),
      addlb: () => addForm('Tiền công thợ sửa chữa', 'repair_labor', [{ name: 'employeeId', label: 'Thợ', type: 'select', req: true, options: techs }, { name: 'buildingId', label: 'Tòa', type: 'select', req: true, options: bOpts }]),
      addmp: () => addForm('Hỗ trợ / điều chỉnh lương', 'manual_pay', [{ name: 'employeeId', label: 'Nhân viên', type: 'select', req: true, options: all }]),
      mdel: (b) => K.act(() => X.removePayrollManual(b.dataset.id), 'Đã xóa dòng'),
    });
  };
  TH.router.handle('/hr/payroll', (root, p, q) => {
    const period = q.period || '2026-08';
    const run = S.one('payrollRuns', r => r.period === period);
    const lines = run ? run.lines : X.previewPayroll(period).lines;
    const flat = lines.flatMap(l => l.buildings.map(b => ({ l, b })));
    const cmp = flat.filter(x => x.b.excel);
    const match = cmp.filter(x => Math.abs(x.b.W - x.b.excel.W) <= 0.5).length;
    const flags = lines.flatMap(l => l.flags.map(f => ({ l, f, key: l.employeeId + ':' + f.buildingId })));
    const pending = run ? flags.filter(x => !run.approvals[x.key]) : flags;
    const tab = q.tab || 'van-hanh';
    const perRec = S.get('periods', period) || {}; const periodClosed = perRec.status === 'closed';
    const manualCount = X.manualOf(period).length;
    const stale = run && run.status !== 'closed' && (run.manualSig || '') !== X.manualSig(period);
    root.innerHTML = TH.pages.hrTabs('payroll') + U.pageHead({ title: 'Bảng lương ' + F.periodLabel(period), sub: run ? `${run.code} · ${run.status === 'closed' ? 'đã chốt ' + F.datetime(run.closedAt) : 'tạm tính ' + F.datetime(run.computedAt)}` : 'Xem trước – chưa lưu phiên', acts: [
      U.btn({ label: 'Xuất bảng', icon: 'download', act: 'exp' }), periodClosed ? U.btn({ label: 'Điều chỉnh sau khóa', icon: 'pencil', act: 'adj', perm: 'expenses.manage' }) : '', (!run || run.status !== 'closed') ? U.btn({ label: run ? 'Tính lại' : 'Tính thử & lưu', icon: 'refresh', act: 'compute', perm: 'payroll.manage' }) : '',
      run && run.status !== 'closed' ? U.btn({ label: 'Chốt bảng lương', icon: 'lock', cls: 'btn-primary', act: 'close', perm: 'payroll.manage', disabled: pending.length > 0, title: pending.length ? 'Còn ca cần duyệt tay' : '' }) : ''] })
      + K.filters([{ name: 'period', label: 'Kỳ lương', options: S.all('periods').map(x => [x.id, F.periodLabel(x.id)]), value: '2026-08', all: false }], q)
      + `<div class="grid grid-4 mt16 mb16">${U.kpi({ label: 'Tổng thực nhận', value: F.vnd(lines.reduce((s, l) => s + l.X, 0)), cap: lines.length + ' nhân viên', icon: 'wallet' })}${U.kpi({ label: 'Lương theo tòa (W)', value: F.vnd(lines.reduce((s, l) => s + l.W, 0)), cap: flat.length + ' dòng tòa', icon: 'building', tone: 'teal' })}
        ${cmp.length ? U.kpi({ label: 'Khớp Excel SRC-03', value: `${match}/${cmp.length}`, cap: 'dòng tòa có W khớp', icon: 'check-circle', tone: match === cmp.length ? 'green' : 'amber' }) : U.kpi({ label: 'Nguồn', value: 'Web', cap: 'hóa đơn & phiếu thu theo ngày thực nhận', icon: 'database', tone: 'blue' })}
        ${U.kpi({ label: 'Cần duyệt tay', value: pending.length, cap: 'HS>100 · HS<70 · không có phòng', icon: 'alert-triangle', tone: pending.length ? 'red' : 'green' })}</div>`
      + (period === '2026-08' ? U.note('info', 'Kỳ chạy song song', 'Input lấy từ bảng lương Excel tháng 8 (cột J–S); web tính lại T, HS, V, W theo quy tắc. Ngoại lệ đã biết: V51 (S39) Excel dùng 130.000/100, quy tắc cho 120.000/95 → 122.858đ/phòng; S28, S36 Excel dùng bảng dưới 1 năm trong khi các tòa khác của cùng NV dùng bảng trên 1 năm.') : '')
      + (stale ? U.note('warn', 'Dữ liệu nhập tay đã đổi', 'Bảng lương đang lưu được tính trước khi sửa dữ liệu nhập tay – bấm "Tính lại" trước khi chốt.') : '')
      + U.tabs([{ key: 'van-hanh', label: 'NV vận hành theo tòa', count: flat.length }, { key: 'nhap-tay', label: 'Nhập tay', count: manualCount }, { key: 'tong-hop', label: 'Tổng hợp theo người', count: lines.length }, { key: 'co', label: 'Cần duyệt', count: flags.length }], tab)
      + '<div class="mt12">' + K.tableCard('t') + '</div>';
    K.bindFilters(root, []);
    const el = root.querySelector('#t');
    if (tab === 'nhap-tay') manualTab(el, period, lines, !periodClosed && !(run && run.status === 'closed') && TH.auth.can('payroll.manage'), !!(perRec.source === 'excel_parallel'));
    if (tab === 'van-hanh') U.table(el, { rows: flat, pageSize: 30, onRowOpen: (x) => explain(x.l, x.b), cols: [
      { key: 'e', label: 'Nhân viên', render: x => U.cell2(esc(Q.emp(x.l.employeeId).name), (x.l.over1y ? 'trên 1 năm' : 'dưới 1 năm')) }, { key: 'b', label: 'Tòa', render: x => `<b>${esc((Q.building(x.b.buildingId) || {}).code)}</b>` },
      { key: 'j', label: 'Số phòng (J)', num: true, render: x => x.b.J }, { key: 'k', label: 'DT niêm yết (K)', num: true, render: x => F.vnd(x.b.K) }, { key: 'l', label: 'Phải thu (L)', num: true, render: x => F.vnd(x.b.L) },
      { key: 'a', label: 'A (3 mốc)', num: true, render: x => F.vnd(x.b.A) }, { key: 'bq', label: 'B = Q/L', num: true, render: x => x.b.B == null ? '–' : F.dec(x.b.B, 3) }, { key: 'c', label: 'C', num: true, render: x => F.vnd(x.b.C) },
      { key: 'hs', label: 'HS', num: true, sortable: true, sortVal: x => x.b.HS || 0, render: x => x.b.HS == null ? '–' : `<b>${F.dec(x.b.HS, 2)}</b>` }, { key: 'v', label: 'Lương/phòng (V)', num: true, render: x => F.vnd(x.b.V) },
      { key: 'w', label: 'Thành tiền (W)', num: true, sortable: true, sortVal: x => x.b.W, render: x => `<b>${F.vnd(x.b.W)}</b>` + (x.b.excel && Math.abs(x.b.W - x.b.excel.W) > 0.5 ? `<span class="diff bad d-block small red">Excel ${F.vnd(x.b.excel.W)}</span>` : '') },
      { key: 'f', label: '', render: x => x.b.flag ? `<span class="flag">${esc(x.b.flag)}</span>` : '' }] });
    if (tab === 'tong-hop') U.table(el, { rows: lines, pageSize: 50, cols: [
      { key: 'e', label: 'Nhân viên', render: l => `<a href="#/hr/staff/${l.employeeId}">${esc(Q.emp(l.employeeId).name)}</a>` }, { key: 't', label: 'Chức danh', render: l => esc(titleLabel(l.title)) },
      { key: 'w', label: 'Lương theo tòa (Σ W)', num: true, render: l => F.vnd(l.W) }, { key: 'b', label: 'Lương cơ bản', num: true, render: l => F.vnd(l.base) + (l.workdays != null ? `<br><small class="muted">× ${l.workdays}/${l.divisor || 26} công</small>` : '') },
      { key: 'lu', label: 'Ăn trưa', num: true, render: l => F.vnd(l.lunch) }, { key: 'fu', label: 'Xăng xe', num: true, render: l => F.vnd(l.fuel) },
      { key: 'ld', label: 'Lương trưởng nhóm', num: true, render: l => l.lead ? F.vnd(l.lead) + `<br><small class="muted">${esc(l.leadNote)}</small>` : '–' }, { key: 'sp', label: 'Hỗ trợ', num: true, render: l => F.vnd(l.support) },
      { key: 'lb', label: 'Tiền công thợ', num: true, render: l => l.labor ? F.vnd(l.labor) : '–' }, { key: 'mp', label: 'Nhập tay', num: true, render: l => l.manualPay ? F.vnd(l.manualPay) : '–' },
      { key: 'x', label: 'Thực nhận', num: true, sortable: true, sortVal: l => l.X, render: l => `<b>${F.vnd(l.X)}</b>` }] });
    if (tab === 'co') U.table(el, { rows: flags, noPager: true, empty: U.empty({ title: 'Không có ca cần duyệt' }), cols: [
      { key: 'e', label: 'Nhân viên', render: x => esc(Q.emp(x.l.employeeId).name) }, { key: 'b', label: 'Tòa', render: x => esc((Q.building(x.f.buildingId) || {}).code) }, { key: 'f', label: 'Cờ', render: x => `<span class="flag">${esc(x.f.flag)}</span>` },
      { key: 'h', label: 'HS', num: true, render: x => x.f.HS == null ? '–' : F.dec(x.f.HS, 2) },
      { key: 'a', label: 'Duyệt', render: x => run && run.approvals[x.key] ? U.chip('Đã duyệt – ' + run.approvals[x.key].by, 'green') : run ? U.btn({ label: 'Duyệt', size: 'btn-xs', act: 'appr', attrs: { 'data-key': x.key }, perm: 'payroll.manage' }) : '<span class="small muted">Lưu phiên để duyệt</span>' }] });
    U.bind(root, {
      tab: (b) => TH.router.setQuery({ tab: b.dataset.key }),
      compute: () => K.act(() => X.computePayroll(period), 'Đã tính và lưu phiên lương'),
      appr: (b) => K.formDrawer({ title: 'Duyệt ca lương đặc biệt', modal: true, size: 'sm', fields: [{ name: 'note', label: 'Ghi chú duyệt', type: 'textarea', req: true, span: true }], submit: 'Duyệt', onSubmit: (d) => { if (!d.note) { const e = new Error('Nhập ghi chú'); e.fields = { note: 'Bắt buộc' }; throw e; } X.approvePayFlag(run.id, b.dataset.key, d.note); U.toast('ok', 'Đã duyệt'); } }),
      adj: () => TH.pages.adjustDrawer(period, { reportLine: 'sal_mgr' }),
      close: async () => { if (await U.confirm({ title: 'Chốt bảng lương', text: 'Chốt sẽ ghi chi phí "Lương quản lý" theo tòa' + (run.parallel ? '' : ' và quỹ lương chung') + '. Sau chốt chỉ điều chỉnh có vết.', ok: 'Chốt' })) K.act(() => X.closePayroll(run.id), 'Đã chốt bảng lương'); },
      exp: () => K.csv('bang-luong-' + period + '.csv', ['Nhân viên', 'Chức danh', 'Tòa', 'J', 'K', 'L', 'A', 'B', 'C', 'T', 'HS', 'V', 'W'], flat.map(x => [Q.emp(x.l.employeeId).name, x.l.title, (Q.building(x.b.buildingId) || {}).code, x.b.J, Math.round(x.b.K), Math.round(x.b.L), Math.round(x.b.A), x.b.B, Math.round(x.b.C), Math.round(x.b.T), x.b.HS, Math.round(x.b.V), Math.round(x.b.W)])),
    });
  });
})(window.TH);
