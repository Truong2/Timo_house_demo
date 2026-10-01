/* UI-38 Cài đặt: tài khoản · vai trò & quyền (E26 xem như vai trò) · danh mục · tài khoản nhận/mẫu in · tham số GĐ · kỳ & khóa kỳ · nhật ký · đối chiếu nghiệm thu · hệ thống. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, CAT = () => TH.data.catalog, RB = TH.calc.rbac;
  const PERM_GROUPS = [['Tòa nhà', ['buildings.view', 'buildings.manage', 'rooms.status', 'owners.view']], ['Khách thuê', ['tenants.view', 'tenants.manage', 'stays.end', 'customers.pii']], ['Hóa đơn', ['invoices.view', 'invoices.prepare', 'invoices.issue', 'readings.manage']],
    ['Thu tiền & công nợ', ['payments.record', 'payments.reverse', 'debts.viewStatus', 'debts.viewAmounts']], ['Hoàn cọc', ['refunds.prepare', 'refunds.approve.admin', 'refunds.approve.ketoan', 'refunds.pay']], ['Chi phí', ['expenses.manage', 'allocation.manage']],
    ['Nhân sự & lương', ['hr.view', 'hr.manage', 'hr.salary', 'payroll.manage']], ['Báo cáo', ['reports.view', 'reports.export']], ['Zalo', ['zalo.send', 'zalo.config']], ['Hệ thống', ['import.master', 'import.finance', 'settings.manage', 'periods.close', 'periods.unlock']]];

  const PERM_GROUPS_P2 = [['Kinh doanh (P2)', ['sales.view', 'sales.manage', 'deals.close', 'deals.cancel', 'customers.phone']], ['Hoa hồng (P2)', ['commission.view', 'commission.approve', 'commission.pay', 'commission.policy']],
    ['Sửa chữa (P2)', ['repairs.view', 'repairs.enter', 'repairs.confirm', 'repairs.money']], ['Báo cáo, cổ đông (P2)', ['reports.ops', 'shares.view', 'shares.manage', 'shares.lock']],
    ['Tài liệu, OCR (P2)', ['documents.view', 'documents.upload', 'documents.download', 'ocr.review']], ['Zalo, kỳ (P2)', ['zalo.inbox', 'periods.reopen.admin', 'periods.reopen.ketoan']]];
  /* Điều chỉnh sau khóa (UI-38, SRS §2.2): dùng chung ở Cài đặt → Kỳ, Bảng lương, Phân bổ, Chi phí, ô báo cáo */
  TH.pages.adjustDrawer = (period, preset = {}) => K.formDrawer({ title: 'Điều chỉnh sau khóa – kỳ ' + F.periodShort(period), sub: 'Không sửa số đã chốt; ghi dòng điều chỉnh (tòa × dòng báo cáo) cộng vào báo cáo kỳ gốc', modal: true, fields: [
    { name: 'buildingId', label: 'Tòa', type: 'select', req: true, value: preset.buildingId || '', options: K.buildingOpts(false) },
    { name: 'reportLine', label: 'Dòng báo cáo', type: 'select', req: true, value: preset.reportLine || '', options: CAT().reportLines.filter(l => TH.calc.report.BASE.includes(l.code) && !/^cnt_/.test(l.code)).map(l => [l.code, l.row + '. ' + l.label]) },
    { name: 'amount', label: 'Số tiền (âm để giảm)', type: 'number', req: true }, { name: 'reason', label: 'Lý do / chứng từ gốc', type: 'textarea', req: true, span: true, help: 'VD: hóa đơn điện T8 về muộn, sửa lương tòa S39…' }],
    submit: 'Ghi điều chỉnh', onSubmit: (d) => { X.addPeriodAdjustment(Object.assign(d, { period })); U.toast('ok', 'Đã ghi điều chỉnh', 'Báo cáo kỳ ' + F.periodShort(period) + ' đã cập nhật'); } });

  /* Bộ kiểm tra nghiệm thu chạy trên dữ liệu thật của app */
  TH.pages.acceptance = () => {
    const out = [];
    const inv9 = S.all('invoices').filter(i => i.period === '2026-09' && i.excel);
    const known = new Set(['102T20A002', '103T25A001', '101S8A001', '103S22A001', '201S38A002', '101G4A001', '302G6A001', '301G7A002', '601G16A001']);
    const printTot = (i) => TH.calc.billing.total(TH.calc.billing.expand(i.lines));
    const badPrint = inv9.filter(i => Math.abs(printTot(i) - i.totalDue) > 0.5);
    const mism = inv9.filter(i => !i.isBreach && Math.abs(printTot(i) - i.excel.total) > 1);
    out.push({ ms: '1A', name: 'Hóa đơn T9: tổng in 13 dòng = tổng cần đóng trên mọi hóa đơn; lệch Excel nguồn được gắn cờ', ok: !badPrint.length && mism.length === known.size && mism.every(i => known.has(i.customerCode)),
      detail: `${inv9.length} hóa đơn, ${badPrint.length} hóa đơn tổng in ≠ tổng cần đóng; ${mism.length} hóa đơn Excel ghi "Tổng cần đóng" khác tổng 13 dòng (ô gõ số cứng / công thức bỏ sót khoản) – web thu theo 13 dòng và hiện cảnh báo lệch nguồn: ${mism.map(i => i.customerCode).join(', ')}` });
    const pm = inv9.filter(i => i.isNewStay);
    const pmPaid = pm.reduce((s, i) => s + (Q.paidIndex()[i.id] || 0), 0);
    out.push({ ms: '1A', name: 'Phòng mới T9: tổng đã thu = 126.912.000', ok: Math.abs(pmPaid - 126912000) < 1, detail: F.vndd(pmPaid) + ' · ' + pm.length + ' hóa đơn tháng lẻ' });
    const tk = inv9.find(i => i.customerCode === '403T20A001'); const tks = tk && Q.invState(tk);
    out.push({ ms: '1A', name: 'Thu khác 403T20: dòng 13 in trên hóa đơn, trạng thái Thiếu 892đ', ok: !!tks && tks.status === 'THIEU' && Math.round(tks.remaining) === 892, detail: tk ? `Dòng 13 = ${F.vnd(TH.calc.billing.expand(tk.lines)[12].amount)} · còn ${F.dec(tks.remaining, 2)}` : 'thiếu dữ liệu' });
    const br = inv9.filter(i => i.isBreach);
    const brDue = br.reduce((s, i) => s + i.totalDue, 0), brPaid = br.reduce((s, i) => s + (Q.paidIndex()[i.id] || 0), 0);
    out.push({ ms: '1A', name: 'Phá HĐ: 20 phòng, phải thu 16.048.000 / đã thu 3.662.000 (chỉ tiền điện)', ok: br.length === 20 && brDue === 16048000 && brPaid === 3662000, detail: `${br.length} phòng · ${F.vnd(brDue)} / ${F.vnd(brPaid)}` });
    const rf = S.all('refunds').find(r => r.roomId === 'r_301T41');
    out.push({ ms: '1A', name: 'Hoàn cọc 301T41: BD = 2.530.000, không trừ tiền ngày ở thêm', ok: !!rf && rf.bd === 2530000 && !rf.deductExtra, detail: rf ? `cọc ${F.vnd(rf.deposit)} − BC ${F.vnd(rf.bc)} = ${F.vnd(rf.bd)}; ngày ở thêm ${F.vnd(rf.extraRent)} hiện riêng` : '' });
    const tpl = Object.keys(TH.calc.billing.TEMPLATES).every(t => S.all('buildings').some(b => b.template === t) && S.one('accounts', a => a.template === t));
    out.push({ ms: '1A', name: '4 mẫu in HĐ (VP) / (VP-HẰNG) / (TECH) / G1 (TECH) có tài khoản nhận', ok: tpl, detail: Object.values(TH.calc.billing.TEMPLATES).map(t => t.name + ': ' + S.all('buildings').filter(b => b.template === t.key).length + ' tòa').join(' · ') });
    const flagged = inv9.filter(i => Q.prorataFlag(i)).map(i => i.customerCode).sort();
    const other13 = inv9.filter(i => TH.calc.billing.expand(i.lines)[12].amount > 0);
    const expFlag = ['101G18A001', '304T35A002', '404S4A001'];
    out.push({ ms: '1A', name: 'Tháng lẻ theo số ngày thực: 22 hóa đơn phòng mới, dòng Thu khác kỳ 9; ngoại lệ Excel được gắn cờ', ok: pm.length === 22 && JSON.stringify(flagged) === JSON.stringify(expFlag) && TH.calc.dates.proRataDays('2026-09-06', '2026-09').days === 25,
      detail: `${pm.length} hóa đơn phòng mới; ${other13.length} hóa đơn có dòng Thu khác; gắn cờ lệch quy tắc: ${flagged.join(', ') || 'không'} · vào 06/09 → 25/30 ngày` });
    if (TH.pages.acceptance1B) out.push(...TH.pages.acceptance1B());
    return out;
  };

  TH.router.handle('/settings', (root, p, q) => {
    const tab = q.tab || 'tai-khoan';
    const tabs = [{ key: 'tai-khoan', label: 'Tài khoản' }, { key: 'vai-tro', label: 'Vai trò & quyền' }, { key: 'danh-muc', label: 'Danh mục' }, { key: 'tk-nhan', label: 'TK nhận tiền & mẫu in' }, { key: 'tham-so', label: 'Tham số giả định' },
      { key: 'ky', label: 'Kỳ & khóa kỳ' }, { key: 'nhat-ky', label: 'Nhật ký' }, { key: 'doi-chieu', label: 'Đối chiếu nghiệm thu' }, { key: 'he-thong', label: 'Hệ thống demo' }];
    root.innerHTML = U.pageHead({ title: 'Cài đặt', sub: 'Danh mục, quyền, tham số có ngày hiệu lực và kỳ dùng chung cho mọi màn' }) + U.tabs(tabs, tab) + '<div id="tb" class="mt16"></div>';
    const tb = root.querySelector('#tb');
    U.bind(root, { tab: (el) => TH.router.setQuery({ tab: el.dataset.key }) });
    if (tab === 'tai-khoan') {
      const can = TH.auth.can('settings.manage');
      tb.innerHTML = K.tableCard('t', 'Tài khoản người dùng', can ? '<button class="btn btn-primary btn-sm" data-act="addu">Thêm tài khoản</button>' : '');
      const userForm = (u) => K.formDrawer({ title: u ? 'Sửa tài khoản ' + u.username : 'Thêm tài khoản', sub: 'Vai trò quyết định quyền; phạm vi dữ liệu theo phân công của nhân viên gắn kèm (E26)', modal: true, fields: [
        ...(u ? [] : [{ name: 'username', label: 'Tên đăng nhập', req: true, help: 'a-z, 0-9, dấu chấm, gạch dưới · mật khẩu demo: demo123' }]),
        { name: 'role', label: 'Vai trò', type: 'select', req: true, options: Object.entries(RB.ROLES).filter(([, v]) => !v.phase || TH.ms.on(v.phase)).map(([k, v]) => [k, v.label]), value: u ? u.role : 'vanhanh' },
        { name: 'employeeId', label: 'Nhân viên gắn kèm', type: 'select', options: S.all('employees').filter(e => e.status === 'active').map(e => [e.id, e.name + ' – ' + ((CAT().titlesAll || CAT().titles)[e.title] || e.title)]), value: u ? u.employeeId || '' : '' },
        { name: 'display', label: 'Tên hiển thị', value: u ? u.display : '', span: true }],
        submit: u ? 'Lưu' : 'Tạo tài khoản', onSubmit: (d) => { u ? X.updateUser(u.id, d) : X.addUser(d); U.toast('ok', 'Đã lưu tài khoản'); } });
      U.table(tb.querySelector('#t'), { rows: S.all('users').filter(u => { const ph = u.phase || (RB.ROLES[u.role] || {}).phase; return !ph || TH.ms.on(ph); }), noPager: true, cols: [{ key: 'u', label: 'Tên đăng nhập', render: u => `<b>${esc(u.username)}</b>` }, { key: 'n', label: 'Người dùng', render: u => esc(u.name) + (u.employeeId ? '' : ' <span class="muted small">(không gắn NV)</span>') }, { key: 'r', label: 'Vai trò', render: u => esc(RB.ROLES[u.role].label) },
        { key: 's', label: 'Phạm vi dữ liệu', render: u => ({ all: 'Toàn hệ thống', assigned: 'Tòa / phòng được phân công', branch: 'Nhánh tổ chức (cấp dưới trực tiếp + gián tiếp)' })[RB.ROLES[u.role].scope] },
        { key: 'st', label: 'Trạng thái', render: u => u.status === 'active' ? U.chip('Hoạt động', 'green') : U.chip('Đã khóa' + (u.statusReason ? ' · ' + u.statusReason : ''), 'red') },
        { key: 'a', label: '', render: u => U.actBtn({ icon: 'pencil', label: 'Sửa', act: 'edu', attrs: { 'data-id': u.id }, perm: 'settings.manage' }) + (u.status === 'active' ? U.actBtn({ icon: 'lock', label: 'Khóa', act: 'lock', attrs: { 'data-id': u.id }, perm: 'settings.manage' }) : U.actBtn({ icon: 'unlock', label: 'Mở khóa', act: 'unlock', attrs: { 'data-id': u.id }, perm: 'settings.manage' })) }] });
      U.bind(tb, { addu: () => userForm(null), edu: (el) => userForm(S.get('users', el.dataset.id)),
        lock: (el) => K.formDrawer({ title: 'Khóa tài khoản', modal: true, size: 'sm', fields: [{ name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Khóa', onSubmit: (d) => { X.setUserStatus(el.dataset.id, 'locked', d.reason); U.toast('ok', 'Đã khóa tài khoản'); } }),
        unlock: (el) => K.act(() => X.setUserStatus(el.dataset.id, 'active', ''), 'Đã mở khóa') });
    }
    if (tab === 'vai-tro') {
      const roles = Object.keys(RB.ROLES).filter(k => !RB.ROLES[k].phase || TH.ms.on(RB.ROLES[k].phase));
      tb.innerHTML = U.card({ title: 'Ma trận quyền theo vai trò', icon: 'shield', sub: 'Nguồn duy nhất: js/domain/rbac-policy.js – kiểm tra tự động bằng scripts/check-rbac.mjs', body: `<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Nhóm</th><th>Quyền</th>${roles.map(r => `<th class="tc">${esc(RB.ROLES[r].label)}</th>`).join('')}</tr></thead><tbody>
        ${[...PERM_GROUPS, ...(TH.ms.on('2') ? PERM_GROUPS_P2 : [])].map(([g, ps]) => ps.map((pp, i) => `<tr>${i === 0 ? `<td rowspan="${ps.length}"><b>${g}</b></td>` : ''}<td class="mono small">${pp}</td>${roles.map(r => `<td class="tc">${RB.can(r, pp) ? '<span class="green">✔</span>' : '<span class="muted">–</span>'}</td>`).join('')}</tr>`).join('')).join('')}</tbody></table></div>` })
        + U.card({ title: 'Xem như vai trò (E26)', icon: 'eye', body: `<p class="small muted mb8">Chuyển nhanh sang tài khoản demo để kiểm tra phạm vi dữ liệu: quản lý chỉ thấy tòa được giao; lương/CCCD/số tiền công nợ bị ẩn; không lộ qua xuất file.</p><div class="row wrap">${S.all('users').filter(u => !u.phase || TH.ms.on(u.phase)).map(u => `<button class="btn btn-ghost btn-sm" data-act="as" data-u="${u.username}">${esc(u.display)}</button>`).join('')}</div>` });
      U.bind(tb, { as: (el) => { TH.auth.switchRole(el.dataset.u); TH.layout.reset(); TH.go('#/dashboard'); U.toast('ok', 'Đang xem như ' + el.textContent); } });
    }
    if (tab === 'danh-muc') {
      const can = TH.auth.can('settings.manage'); const items = S.all('catalogItems');
      const off = (kind, key) => items.some(x => x.kind === kind && x.key === key && x.active === false), isCustom = (kind, key) => items.some(x => x.kind === kind && x.key === key && !x.base);
      const act = (icon, label, a, kind, key) => `<button class="btn btn-ghost btn-xs" data-act="${a}" data-kind="${esc(kind)}" data-key="${esc(key)}" title="${label}">${label}</button>`;
      const row = (kind, key, label, extra, active) => `<div class="mini-row"><b class="grow ${active ? '' : 'muted'}">${esc(label)}${active ? '' : ' ' + U.chip('Ngừng dùng', 'gray')}${isCustom(kind, key) ? ' ' + U.chip('Bổ sung', 'blue') : ''}</b><span class="small muted">${extra || ''}</span>${can ? (active ? act('x', 'Ngừng dùng', 'coff', kind, key) : act('refresh', 'Dùng lại', 'con', kind, key)) + (isCustom(kind, key) ? act('trash', 'Xóa', 'cdel', kind, key) : '') : ''}</div>`;
      const addBtn = (kind) => can ? `<button class="btn btn-ghost btn-sm" data-act="cadd" data-kind="${kind}">+ Thêm</button>` : '';
      tb.innerHTML = U.note('info', 'Danh mục', 'Khu vực, loại chi phí (kèm dòng báo cáo), lý do phá HĐ, chức danh: thêm / sửa / ngừng dùng tại đây; mục đã dùng chỉ ngừng dùng, không xóa. Dòng báo cáo (3–61) và 13 loại phí hóa đơn là cấu trúc mẫu – cố định.')
        + `<div class="grid grid-2 mt12">${U.card({ title: 'Khu vực', icon: 'map-pin', actions: can ? '<button class="btn btn-ghost btn-sm" data-act="aadd">+ Thêm</button>' : '', body: S.all('areas').map(a => `<div class="mini-row"><b class="grow">${esc(a.name)}</b><span class="muted small">${S.all('buildings').filter(b => b.areaId === a.id).length} tòa</span>${can ? `<button class="btn btn-ghost btn-xs" data-act="aedit" data-id="${a.id}">Sửa</button>` : ''}</div>`).join('') })}
        ${U.card({ title: 'Loại chi phí → dòng báo cáo', icon: 'tag', actions: addBtn('expenseCategories'), body: CAT().expenseCategories.map(c => row('expenseCategories', c.key, c.label, esc(c.reportLine ? (CAT().reportLines.find(l => l.code === c.reportLine) || {}).label || c.reportLine : 'không vào lợi nhuận'), c.active !== false)).join('') })}
        ${U.card({ title: 'Lý do phá HĐ', icon: 'log-out', actions: addBtn('breachReasons'), body: [...CAT().breachReasons, ...items.filter(x => x.kind === 'breachReasons' && x.active === false).map(x => x.label)].map(r => row('breachReasons', r, r, '', !off('breachReasons', r))).join('') })}
        ${U.card({ title: 'Chức danh', icon: 'users', actions: addBtn('titles'), body: Object.entries(CAT().titlesAll || CAT().titles).map(([k, v]) => row('titles', k, v, `<span class="mono">${esc(k)}</span> · ${S.all('employees').filter(e => e.title === k).length} NV`, !off('titles', k))).join('') })}
        ${U.card({ title: 'Loại phí ↔ dòng in hóa đơn (cố định)', icon: 'list', body: CAT().feeTypes.map(f => `<div class="mini-row"><span>Dòng ${f.line}</span><b class="grow">${esc(f.label)}</b><span class="muted small">${esc(f.unit)}</span></div>`).join('') + '<div class="mini-row"><span>Dòng 11</span><b class="grow">Nợ cũ</b></div><div class="mini-row"><span>Dòng 13</span><b class="grow">Thu khác</b></div>' })}
        ${U.card({ title: 'Loại kết thúc lượt thuê (cố định)', icon: 'log-out', body: CAT().endTypes.map(t => `<div class="mini-row"><b class="grow">${esc(t.label)}</b>${t.refund ? U.chip('Hoàn cọc', 'green') : U.chip('Không hoàn', 'red')}</div>`).join('') })}</div>`;
      const addForm = (kind) => K.formDrawer({ title: 'Thêm ' + X.CATALOG_KINDS[kind], modal: true, fields: [
        ...(kind === 'breachReasons' ? [] : [{ name: 'key', label: kind === 'titles' ? 'Mã chức danh' : 'Mã loại chi phí', req: true, help: kind === 'titles' ? 'VD: LE TAN' : 'VD: security' }]),
        { name: 'label', label: 'Tên hiển thị', req: true, span: kind === 'breachReasons' },
        ...(kind === 'expenseCategories' ? [{ name: 'reportLine', label: 'Dòng báo cáo', type: 'select', options: CAT().reportLines.filter(l => !l.ratio).map(l => [l.code, l.row + '. ' + l.label]), help: 'Để trống = không vào lợi nhuận' }, { name: 'group', label: 'Nhóm', value: 'Chi phí vận hành' }] : [])],
        submit: 'Thêm', onSubmit: (d) => { X.addCatalogItem(Object.assign({ kind }, d)); U.toast('ok', 'Đã thêm vào danh mục'); } });
      U.bind(tb, { cadd: (el) => addForm(el.dataset.kind),
        aadd: () => K.formDrawer({ title: 'Thêm khu vực', modal: true, size: 'sm', fields: [{ name: 'name', label: 'Tên khu vực', req: true, span: true }], submit: 'Thêm', onSubmit: (d) => { X.saveArea(d); U.toast('ok', 'Đã thêm khu vực'); } }),
        aedit: (el) => { const a = S.get('areas', el.dataset.id); K.formDrawer({ title: 'Sửa khu vực', modal: true, size: 'sm', fields: [{ name: 'name', label: 'Tên khu vực', req: true, span: true, value: a.name }], submit: 'Lưu', onSubmit: (d) => { X.saveArea({ id: a.id, name: d.name }); U.toast('ok', 'Đã lưu'); } }); },
        coff: (el) => K.formDrawer({ title: 'Ngừng dùng mục danh mục', sub: el.dataset.key, modal: true, size: 'sm', fields: [{ name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Ngừng dùng', onSubmit: (d) => { X.setCatalogItemActive(el.dataset.kind, el.dataset.key, false, d.reason); U.toast('ok', 'Đã ngừng dùng'); } }),
        con: (el) => K.act(() => X.setCatalogItemActive(el.dataset.kind, el.dataset.key, true, ''), 'Đã dùng lại'),
        cdel: (el) => K.act(() => X.removeCatalogItem(el.dataset.kind, el.dataset.key), 'Đã xóa') });
    }
    if (tab === 'tk-nhan') {
      tb.innerHTML = K.tableCard('t', 'Tài khoản nhận tiền theo mẫu in (số TK demo)', TH.auth.can('settings.manage') ? '<button class="btn btn-primary btn-sm" data-act="acadd">Thêm tài khoản</button>' : '') + '<div class="mt16">' + K.tableCard('b', 'Mẫu in theo tòa') + '</div>';
      const accForm = (a) => K.formDrawer({ title: a ? 'Sửa tài khoản nhận' : 'Thêm tài khoản nhận', modal: true, fields: [{ name: 'template', label: 'Mẫu in', type: 'select', req: true, options: Object.values(TH.calc.billing.TEMPLATES).map(t => [t.key, t.name]), value: a ? a.template : 'VP' }, { name: 'bank', label: 'Ngân hàng', req: true, value: a ? a.bank : '' }, { name: 'number', label: 'Số tài khoản', req: true, value: a ? a.number : '' }, { name: 'holder', label: 'Chủ tài khoản', req: true, value: a ? a.holder : '' }],
        submit: 'Lưu', onSubmit: (d) => { X.saveAccount(Object.assign({ id: a ? a.id : null }, d)); U.toast('ok', 'Đã lưu tài khoản nhận'); } });
      U.bind(tb, { acadd: () => accForm(null), acedit: (el) => accForm(S.get('accounts', el.dataset.id)) });
      U.table(tb.querySelector('#t'), { rows: S.all('accounts'), noPager: true, cols: [{ key: 't', label: 'Mẫu', render: a => esc(TH.calc.billing.TEMPLATES[a.template].name) }, { key: 'b', label: 'Ngân hàng', render: a => esc(a.bank) }, { key: 'n', label: 'Số TK', render: a => esc(a.number) }, { key: 'h', label: 'Chủ TK', render: a => esc(a.holder) }, { key: 'c', label: 'Số tòa', num: true, render: a => S.all('buildings').filter(b => b.accountId === a.id).length },
        { key: 'a', label: '', render: a => U.actBtn({ icon: 'pencil', label: 'Sửa', act: 'acedit', attrs: { 'data-id': a.id }, perm: 'settings.manage' }) }] });
      U.table(tb.querySelector('#b'), { rows: S.all('buildings'), pageSize: 20, cols: [{ key: 'c', label: 'Tòa', render: b => `<b>${esc(b.code)}</b>` }, { key: 'g', label: 'Nhóm', render: b => b.group },
        { key: 't', label: 'Mẫu in', render: b => TH.auth.can('settings.manage') ? U.select({ name: 'tpl', value: b.template, options: Object.values(TH.calc.billing.TEMPLATES).map(t => [t.key, t.name]), attrs: { 'data-on': 'tpl', 'data-id': b.id }, cls: 'sm' }) : esc(TH.calc.billing.TEMPLATES[b.template].name) }] });
      U.onChange(tb, { tpl: (el) => { const a = S.one('accounts', x => x.template === el.value); K.act(() => X.updateBuilding(el.dataset.id, { template: el.value, accountId: a.id }), 'Đã đổi mẫu in'); } });
    }
    if (tab === 'tham-so') {
      const rows = S.all('params').slice().sort((a, b) => a.group.localeCompare(b.group) || a.key.localeCompare(b.key) || String(b.effectiveFrom).localeCompare(String(a.effectiveFrom)));
      tb.innerHTML = U.note('info', 'Giả định làm việc (GĐ)', 'Mỗi câu hỏi mở OQ-xx là một tham số có ngày hiệu lực. Khi khách trả lời khác, thêm phiên mới – không sửa cấu trúc dữ liệu, không sửa số kỳ đã chốt.') + '<div class="mt12">' + K.tableCard('t', rows.length + ' phiên tham số') + '</div>';
      U.table(tb.querySelector('#t'), { rows, pageSize: 40, cols: [{ key: 'g', label: 'Nhóm', render: r => esc(r.group) }, { key: 'l', label: 'Tham số', render: r => U.cell2(esc(r.label), `<span class="mono">${esc(r.key)}</span>`) }, { key: 'v', label: 'Giá trị', render: r => `<b>${esc(TH.calc.params.format(r, r.value, F))}</b> ${esc(r.unit || '')}` },
        { key: 'o', label: 'Căn cứ', render: r => U.chip(r.oq || '–', 'purple') }, { key: 'f', label: 'Hiệu lực', render: r => F.date(r.effectiveFrom) + ' → ' + (r.effectiveTo ? F.date(r.effectiveTo) : 'nay') }, { key: 'r', label: 'Lý do', render: r => `<span class="small">${esc(r.reason || 'Mặc định theo GĐ v1.6')}</span>` },
        { key: 'a', label: '', render: r => !r.effectiveTo ? U.actBtn({ icon: 'pencil', label: 'Phiên mới', act: 'prm', attrs: { 'data-key': r.key }, perm: 'settings.manage' }) : '' }] });
      U.bind(tb, { prm: (el) => { const cur = rows.find(r => r.key === el.dataset.key && !r.effectiveTo); const t = cur.type || (typeof cur.value === 'boolean' ? 'bool' : typeof cur.value === 'number' ? 'number' : 'text');
        const vf = t === 'bool' ? { type: 'select', options: [['true', 'Có'], ['false', 'Không']], value: String(cur.value) } : t === 'enum' ? { type: 'select', options: cur.options, value: cur.value }
          : t === 'money' ? { type: 'money', value: cur.value } : t === 'milestones' ? { value: TH.calc.params.format(cur, cur.value), help: 'Ba mốc "ngày: hệ số", vd 5: 100% · 10: 90% · 15: 70%' }
          : t === 'pct' ? { value: TH.calc.params.format(cur, cur.value), help: 'Phần trăm, vd 1,6%' } : { type: t === 'int' ? 'number' : 'text', value: cur.value };
        K.formDrawer({ title: 'Phiên tham số mới', sub: cur.label, modal: true, fields: [Object.assign({ name: 'value', label: 'Giá trị mới' + (cur.unit ? ' (' + cur.unit + ')' : ''), req: true, help: cur.min != null ? `Từ ${cur.min} đến ${cur.max}` : '' }, vf), { name: 'from', label: 'Hiệu lực từ', type: 'date', req: true, value: F.nextPeriod(S.meta.period) + '-01' }, { name: 'reason', label: 'Lý do / căn cứ', type: 'textarea', req: true, span: true }],
          onSubmit: (d) => { try { X.setParam(cur.key, d.value, d.from, d.reason); } catch (e) { if (/Giá trị|Chọn|Cần|Mốc|số|Nhập giá trị|danh sách|tăng dần/.test(e.message)) e.fields = { value: e.message.split(': ').slice(1).join(': ') || e.message }; throw e; } U.toast('ok', 'Đã thêm phiên tham số'); } }); } });
    }
    if (tab === 'ky') {
      tb.innerHTML = K.tableCard('t', 'Kỳ nghiệp vụ') + U.note('info', 'Khóa kỳ (mốc 1B)', 'Sau khi chốt lương và phân bổ, khóa kỳ để chốt số báo cáo. Sau khóa chỉ ghi dòng điều chỉnh có lý do (cộng vào báo cáo kỳ gốc, ghi nhận ngày điều chỉnh). ' + (TH.ms.on('2') ? 'Phase 2 [GĐ K-7]: mở lại kỳ cần yêu cầu có lý do và được cả admin và kế toán duyệt; mỗi lần khóa lưu một phiên bản số chốt để so sánh.' : 'Chỉ admin mở khóa.'));
      U.table(tb.querySelector('#t'), { rows: S.all('periods'), noPager: true, cols: [{ key: 'p', label: 'Kỳ', render: r => `<b>${F.periodLabel(r.id)}</b>` }, { key: 'n', label: 'Ghi chú', render: r => esc(r.note || '') },
        { key: 'pr', label: 'Bảng lương', render: r => { const x = S.one('payrollRuns', y => y.period === r.id && y.status === 'closed'); return x ? U.chip('Đã chốt', 'green') : U.chip('Chưa chốt', 'gray'); } },
        { key: 'al', label: 'Phân bổ', render: r => { const x = S.one('allocationRuns', y => y.period === r.id && y.status === 'closed'); return x ? U.chip('Đã chốt', 'green') : U.chip('Chưa chốt', 'gray'); } },
        { key: 'adj', label: 'Điều chỉnh sau khóa', num: true, render: r => { const n = S.where('adjustments', a => a.originalPeriod === r.id && a.status !== 'absorbed').length, g = Q.absorbedAdjustments(r.id).filter(a => !a.fixed).length; return n + (g ? ` <small class="d-block amber">${g} đã gỡ – chờ sửa gốc</small>` : ''); } },
        { key: 's', label: 'Trạng thái', render: r => r.status === 'closed' ? U.chip('Đã khóa ' + F.datetime(r.closedAt), 'red') : U.chip('Đang mở', 'green') },
        ...(TH.ms.on('2') ? [{ key: 'v', label: 'Phiên bản chốt', render: r => { const vs = Q.snapshotVersions(r.id); return vs.length ? vs.length + ' phiên' + (vs.length > 1 ? ' ' + U.btn({ label: 'So sánh', size: 'btn-xs', act: 'cmp', attrs: { 'data-id': r.id } }) : '') : '–'; } },
          { key: 'rq', label: 'Yêu cầu mở lại', render: r => r.reopenRequest ? U.chip('Chờ duyệt ' + (2 - r.reopenRequest.approvals.length) + '/2', 'amber') + '<small class="d-block muted">' + esc(r.reopenRequest.reason) + ' · ' + r.reopenRequest.approvals.map(a => esc(TH.auth.roleLabel(a.role)) + ' ✓').join(', ') + '</small>' : (r.history || []).length ? `<a href="javascript:void 0" data-act="hist" data-id="${r.id}" class="small">Lịch sử ${(r.history || []).length}</a>` : '–' }] : []),
        { key: 'a', label: '', render: r => !TH.ms.on('1B') ? '<span class="small muted">mốc 1B</span>' : r.status === 'closed' ? U.btn({ label: 'Điều chỉnh sau khóa', size: 'btn-xs', act: 'adj', attrs: { 'data-id': r.id }, perm: 'expenses.manage' }) + ' ' + (TH.ms.on('2') ? (r.reopenRequest ? (['admin', 'ketoan'].includes(TH.auth.role()) && !r.reopenRequest.approvals.some(a => a.role === TH.auth.role()) ? U.btn({ label: 'Duyệt mở lại (' + TH.auth.roleLabel() + ')', size: 'btn-xs', cls: 'btn-success', act: 'appr', attrs: { 'data-id': r.id } }) : '') + ' ' + U.btn({ label: r.reopenRequest.byRole === TH.auth.role() ? 'Hủy yêu cầu' : 'Từ chối', size: 'btn-xs', act: 'rejopen', attrs: { 'data-id': r.id }, perm: 'periods.close' }) : U.btn({ label: 'Yêu cầu mở lại', size: 'btn-xs', act: 'reqopen', attrs: { 'data-id': r.id }, perm: 'periods.close' })) : U.btn({ label: 'Mở khóa', size: 'btn-xs', act: 'unlock', attrs: { 'data-id': r.id }, perm: 'periods.unlock' })) : U.btn({ label: 'Khóa kỳ', size: 'btn-xs', cls: 'btn-primary', act: 'lock', attrs: { 'data-id': r.id }, perm: 'periods.close' }) }] });
      const adjs = S.where('adjustments', a => a.entity === 'report').slice().reverse();
      if (adjs.length) tb.insertAdjacentHTML('beforeend', '<div class="mt16">' + U.card({ title: 'Dòng điều chỉnh sau khóa', icon: 'history', sub: 'Dòng "đã gỡ": kỳ đã mở lại nên không cộng vào báo cáo – sửa thẳng số gốc rồi đánh dấu (GĐ D18)', body: adjs.map(a => `<div class="mini-row"><span>${F.periodShort(a.originalPeriod)}</span><span class="code">${esc((Q.building(a.buildingId) || {}).code || '')}</span><span class="grow">${esc((CAT().reportLines.find(l => l.code === a.reportLine) || {}).label || a.reportLine)} – ${esc(a.reason)} <small class="muted">${esc(a.by)} · ${F.datetime(a.at)}</small>${a.status === 'absorbed' ? ' ' + (a.fixed ? U.chip('Đã gỡ – đã sửa gốc', 'green') : U.chip('Đã gỡ – chờ sửa gốc', 'amber') + ' ' + U.btn({ label: 'Đã sửa gốc', size: 'btn-xs', act: 'adjfix', attrs: { 'data-id': a.id }, perm: 'expenses.manage' })) : ''}</span><b class="${a.status === 'absorbed' ? 'muted' : ''}">${F.vnd(a.delta)}</b></div>`).join('') }) + '</div>');
      U.bind(tb, { lock: async (el) => { const g = Q.absorbedAdjustments(el.dataset.id).filter(a => !a.fixed).length; const ok = await U.confirm({ title: 'Khóa kỳ ' + F.periodShort(el.dataset.id), text: 'Điều kiện: bảng lương và phân bổ đã chốt. Khi khóa, số báo cáo của kỳ được chốt lại; sau khóa mọi thao tác ghi vào kỳ bị chặn, chỉ ghi được dòng điều chỉnh có lý do.' + (g ? ` Lưu ý: còn ${g} dòng điều chỉnh đã gỡ khi mở lại kỳ chưa đánh dấu "đã sửa gốc" – kiểm tra số gốc trước khi khóa.` : ''), ok: 'Khóa kỳ' }); if (ok) K.act(() => X.closePeriod(el.dataset.id), 'Đã khóa kỳ'); },
        adj: (el) => TH.pages.adjustDrawer(el.dataset.id),
        adjfix: (el) => K.act(() => X.markAdjustmentFixed(el.dataset.id), 'Đã đánh dấu sửa số gốc'),
        unlock: (el) => K.formDrawer({ title: 'Mở khóa kỳ', modal: true, size: 'sm', fields: [{ name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], onSubmit: (d) => { X.unlockPeriod(el.dataset.id, d.reason); U.toast('ok', 'Đã mở khóa'); } }),
        /* Phase 2 – quản lý kỳ nâng cao [GĐ K-7] */
        rejopen: (el) => K.formDrawer({ title: 'Hủy / từ chối yêu cầu mở lại kỳ ' + F.periodShort(el.dataset.id), modal: true, fields: [{ name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Xác nhận', onSubmit: (d) => { X.cancelReopen(el.dataset.id, d.reason); U.toast('ok', 'Đã hủy yêu cầu mở lại'); } }),
        reqopen: (el) => K.formDrawer({ title: 'Yêu cầu mở lại kỳ ' + F.periodShort(el.dataset.id), modal: true, note: U.note('warn', 'Cần duyệt của cả admin và kế toán', 'Mở lại xong, số báo cáo tính lại theo dữ liệu hiện tại; khóa lại sẽ tạo phiên bản chốt mới để so sánh với phiên trước.'), fields: [{ name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Gửi yêu cầu', onSubmit: (d) => { X.requestReopen(el.dataset.id, d.reason); U.toast('ok', 'Đã gửi yêu cầu mở lại'); } }),
        appr: (el) => { const r = K.act(() => X.approveReopen(el.dataset.id)); if (r === true) U.toast('ok', 'Đủ hai duyệt – kỳ đã mở lại'); else if (r === false) U.toast('ok', 'Đã duyệt – chờ vai trò còn lại'); },
        hist: (el) => { const p = S.get('periods', el.dataset.id); U.drawer({ title: 'Lịch sử khóa / mở kỳ ' + F.periodShort(p.id), body: U.timeline((p.history || []).slice().reverse().map(h => ({ when: F.datetime(h.at), title: { close: 'Khóa – phiên bản ' + h.version, reopen: 'Mở lại', reopen_cancel: 'Hủy yêu cầu mở lại (người gửi)', reopen_reject: 'Từ chối yêu cầu mở lại' }[h.type] || h.type, sub: esc([h.by, h.reason].filter(Boolean).join(' · ')), color: h.type === 'close' ? 'red' : 'green' }))) }); },
        cmp: (el) => { const pid = el.dataset.id; const vs = Q.snapshotVersions(pid); const a = vs[vs.length - 2].version, b = vs[vs.length - 1].version; const rows = Q.compareSnapshots(pid, a, b);
          U.drawer({ title: `So sánh số chốt kỳ ${F.periodShort(pid)}: phiên ${a} → ${b}`, wide: true, body: rows.length ? `<table class="tbl compact"><thead><tr><th>Tòa</th><th>Dòng báo cáo</th><th class="num">Phiên ${a}</th><th class="num">Phiên ${b}</th><th class="num">Chênh</th></tr></thead><tbody>${rows.slice(0, 200).map(x => `<tr><td><b>${esc((Q.building(x.buildingId) || {}).code || x.buildingId)}</b></td><td>${esc((CAT().reportLines.find(l => l.code === x.code) || {}).label || x.code)}</td><td class="num">${F.vnd(x.a)}</td><td class="num">${F.vnd(x.b)}</td><td class="num"><b class="${x.diff > 0 ? 'green' : 'red'}">${F.vnd(x.diff)}</b></td></tr>`).join('')}</tbody></table>` : U.empty({ title: 'Hai phiên bản không có chênh lệch' }) }); } });
    }
    if (tab === 'nhat-ky') {
      const rows = S.all('auditLog').slice().reverse();
      tb.innerHTML = K.tableCard('t', rows.length + ' thao tác trong phiên demo');
      U.table(tb.querySelector('#t'), { rows, pageSize: 30, cols: [{ key: 'a', label: 'Thời điểm', render: r => F.datetime(r.at) }, { key: 'u', label: 'Người', render: r => esc(r.userName) + ' <span class="muted small">' + esc((RB.ROLES[r.role] || {}).label || '') + '</span>' }, { key: 'x', label: 'Thao tác', render: r => U.chip(r.action, 'gray') }, { key: 's', label: 'Nội dung', render: r => esc(r.summary) }] });
    }
    if (tab === 'doi-chieu') {
      const rows = TH.pages.acceptance();
      tb.innerHTML = U.card({ title: 'Đối chiếu nghiệm thu với số liệu Excel của khách', icon: 'clipboard-check', sub: `${rows.filter(r => r.ok).length}/${rows.length} tiêu chí đạt`, body: rows.map(r => `<div class="acc-row ${r.ok ? 'ok' : 'fail'}"><span class="acc-ms">${r.ms}</span><div class="grow"><b>${esc(r.name)}</b><div class="small muted">${esc(r.detail)}</div></div>${r.ok ? U.chip('PASS', 'green') : U.chip('FAIL', 'red')}</div>`).join('') });
    }
    if (tab === 'he-thong') {
      const ms = TH.ms.current();
      tb.innerHTML = `<div class="grid grid-2">${U.card({ title: 'Mốc triển khai', icon: 'flag', body: `<p class="small muted mb8">1A = go-live hóa đơn & thu tiền. 1B = thêm chốt tháng (lương, phân bổ, báo cáo tòa, Báo cáo tổng/kinh doanh, khóa kỳ). Phase 2 = thêm kinh doanh & hoa hồng, sổ sửa chữa, báo cáo vận hành, chia cổ đông, tài liệu, OCR.</p><div class="row">${TH.ms.ORDER.map(m => `<button class="btn ${m === ms ? 'btn-primary' : 'btn-ghost'}" data-act="ms" data-m="${m}" data-perm="settings.manage">${esc(TH.ms.INFO[m].label)} – ${esc(TH.ms.INFO[m].name)}</button>`).join('')}</div>` })}
        ${U.card({ title: 'Ngày hệ thống demo', icon: 'calendar', body: `<div class="row">${U.date({ name: 'today', value: F.today() })}<button class="btn btn-ghost" data-act="today" data-perm="settings.manage">Đổi ngày</button></div><p class="small muted mt8">Mặc định 29/09/2026: kỳ 08 chạy song song Excel, kỳ 09 live, kỳ 10 đang lập hóa đơn.</p>` })}
        ${U.card({ title: 'Dữ liệu thao tác thử', icon: 'database', body: `<p class="small">Đã ghi ${S.dirtyCount()} bản ghi thay đổi · ${Math.round(S.usage() / 1024)} KB trong trình duyệt · dựng dữ liệu ${TH.bootMs} ms.</p><div class="row mt8"><button class="btn btn-ghost" data-act="exportState">Xuất JSON</button><button class="btn btn-ghost" data-act="importState">Nhập JSON</button><button class="btn btn-danger" data-act="reset">Xóa dữ liệu thao tác</button></div>` })}
        ${U.card({ title: 'Nguồn dữ liệu demo', icon: 'file-spreadsheet', body: `<p class="small">Sinh bằng <span class="mono">scripts/seed/extract_seed.py</span> từ: ${(TH.data.master.generatedFrom || []).map(esc).join(', ')}. Tên người, SĐT, CCCD, số tài khoản đã ẩn danh; mã, giá, chỉ số, số tiền giữ nguyên để nghiệm thu.</p>` })}</div>`;
      U.bind(tb, {
        ms: (el) => { TH.ms.set(el.dataset.m); U.toast('ok', 'Đã chuyển sang ' + TH.ms.INFO[el.dataset.m].label); },
        today: () => { K.act(() => X.setToday(tb.querySelector('[name=today]').value), 'Đã đổi ngày hệ thống'); TH.layout.reset(); TH.router.render(); },
        exportState: () => F.download('timohouse-demo-state.json', S.exportJSON(), 'application/json'),
        importState: () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.onchange = () => { const r = new FileReader(); r.onload = () => { try { S.importJSON(String(r.result)); U.toast('ok', 'Đã nhập dữ liệu'); TH.router.render(); } catch (e) { U.toast('err', 'Không nhập được', e.message); } }; r.readAsText(i.files[0]); }; i.click(); },
        reset: async () => { if (await U.confirm({ title: 'Xóa dữ liệu thao tác', text: 'Quay về bộ dữ liệu demo gốc (giữ đăng nhập)?', danger: true, ok: 'Xóa' })) { S.reset(); TH.layout.reset(); TH.router.render(); U.toast('ok', 'Đã quay về dữ liệu gốc'); } },
      });
    }
  });
})(window.TH);
