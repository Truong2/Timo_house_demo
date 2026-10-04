/* UI-11 Hóa đơn & tạo kỳ (E11 wizard) · UI-12 Chi tiết + xem trước mẫu in + phát hành/điều chỉnh · bản in (E12). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, B = TH.calc.billing;
  const periodOpts = () => { const ps = new Set(S.all('periods').map(p => p.id)); S.all('invoices').forEach(i => ps.add(i.period)); return [...ps].sort().map(p => [p, F.periodLabel(p)]); };

  /* E11: wizard tạo kỳ – chọn kỳ + tòa → kiểm tra dữ liệu → tạo nháp */
  const wizard = (q) => {
    const period = q.period && q.period > S.meta.period ? q.period : F.nextPeriod(S.meta.period);
    let step = 0, sel = new Set(q.building ? [q.building] : []), preview = null, period2 = period;
    const d = U.drawer({ title: 'Tạo kỳ hóa đơn', wide: true, body: '<div id="wz"></div>', footer: '<div id="wzf" class="row between" style="width:100%"></div>' });
    const draw = () => {
      const steps = [{ title: 'Chọn kỳ & tòa' }, { title: 'Kiểm tra dữ liệu' }, { title: 'Tạo nháp' }];
      const w = TH.calc.dates.billingWindow(period2, Q.params());
      let html = U.wizard(steps, step);
      if (step === 0) {
        const bs = Q.scopedBuildings();
        html += `<div class="form-grid">${U.field({ label: 'Kỳ hóa đơn (tiền nhà trả trước)', input: U.select({ name: 'period', value: period2, options: [F.nextPeriod(S.meta.period), F.nextPeriod(F.nextPeriod(S.meta.period))].map(x => [x, F.periodLabel(x)]) }) })}
          <div class="field"><label>Mốc của kỳ</label><div class="small">Chốt số ${F.date(w.cutoff)} · hạn ${F.date(w.dueFrom)} → ${F.date(w.dueTo)} · công nợ từ ${F.date(w.debtFrom)}</div></div></div>
          <div class="row between mt16 mb8"><b>Tòa (${sel.size}/${bs.length})</b><div class="row">${['T', 'S', 'G'].map(g => `<button type="button" class="btn btn-ghost btn-xs" data-act="grp" data-g="${g}">Chọn nhà ${g}</button>`).join('')}<button type="button" class="btn btn-ghost btn-xs" data-act="none">Bỏ chọn</button></div></div>
          <div class="chk-grid">${bs.map(b => `<label class="chk"><input type="checkbox" data-b="${b.id}" ${sel.has(b.id) ? 'checked' : ''}> <span>${esc(b.code)}</span></label>`).join('')}</div>`;
      }
      if (step === 1) {
        const ok = preview.filter(r => r.ok), mid = preview.filter(r => r.ok && r.midMonth), miss = preview.filter(r => r.issues.includes('Thiếu chỉ số điện nước')), dup = preview.filter(r => r.dup), bad = preview.filter(r => !r.ok && !r.dup);
        html += `<div class="grid grid-4 mb16">${U.kpi({ label: 'Hợp lệ', value: ok.length, icon: 'check-circle', tone: 'green', mini: true })}${U.kpi({ label: 'Phòng mới giữa tháng', value: mid.length, cap: 'chia theo ngày thực của tháng', icon: 'calendar', tone: 'blue', mini: true })}
          ${U.kpi({ label: 'Thiếu / bất thường', value: bad.length, cap: miss.length + ' thiếu chỉ số', icon: 'alert-triangle', tone: 'amber', mini: true })}${U.kpi({ label: 'Đã có hóa đơn', value: dup.length, icon: 'copy', tone: 'gray', mini: true })}</div>
          ${mid.length ? U.note('info', 'Tháng lẻ', `Số ngày tính = số ngày của tháng − ngày vào + 1; mẫu số ${TH.calc.dates.daysInMonth(period2)} ngày (tháng ${Number(period2.slice(5))}). VD: ${esc(Q.roomCode(mid[0].stay.roomId))} vào ${F.date(mid[0].stay.rentStart)} → ${mid[0].days}/${mid[0].denom} ngày.`) : ''}
          <table class="tbl compact mt12"><thead><tr><th>Phòng</th><th>Mã KH</th><th>Tính từ</th><th class="num">Ngày tính</th><th>Điện (cũ → mới)</th><th>Vấn đề</th></tr></thead><tbody>
          ${preview.filter(r => !r.ok || r.midMonth).slice(0, 80).map(r => `<tr><td class="code">${esc(Q.roomCode(r.stay.roomId))}</td><td>${esc(r.stay.code)}</td><td>${F.date(r.stay.rentStart)}</td><td class="num">${r.days}/${r.denom}</td><td>${r.reading ? r.reading.elPrev + ' → ' + r.reading.elCurr : '–'}</td><td>${r.issues.map(x => U.chip(x, x.startsWith('Đã có') ? 'gray' : 'amber')).join(' ') || U.chip('Tháng lẻ', 'blue')}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">Không có dòng cần chú ý</td></tr>'}</tbody></table>
          <label class="chk mt12"><input type="checkbox" name="allowMissing"> <span>Vẫn tạo nháp cho phòng thiếu chỉ số (dòng điện = 0, cần bổ sung trước phát hành)</span></label>`;
      }
      if (step === 2) html += U.note('ok', 'Đã tạo nháp', `${d._res.created.length} hóa đơn nháp kỳ ${F.periodShort(period2)}; bỏ qua ${d._res.skipped.length}. Rà soát rồi phát hành ở danh sách (lọc "Nháp").`);
      d.body.querySelector('#wz').innerHTML = html;
      d.el.querySelector('#wzf').innerHTML = step === 0 ? `${U.btn({ label: 'Hủy', act: 'x' })}${U.btn({ label: 'Kiểm tra dữ liệu →', cls: 'btn-primary', act: 'next' })}`
        : step === 1 ? `${U.btn({ label: '← Quay lại', act: 'back' })}${U.btn({ label: `Tạo nháp (${preview.filter(r => r.ok).length} hóa đơn)`, cls: 'btn-primary', act: 'create' })}` : `${U.btn({ label: 'Đóng', act: 'x' })}${U.btn({ label: 'Xem hóa đơn nháp', cls: 'btn-primary', act: 'view' })}`;
    };
    d.el.addEventListener('change', (e) => { if (e.target.dataset.b) { e.target.checked ? sel.add(e.target.dataset.b) : sel.delete(e.target.dataset.b); draw(); } if (e.target.name === 'period') { period2 = e.target.value; draw(); } });
    U.bind(d.el, {
      x: () => d.close(), back: () => { step = 0; draw(); },
      grp: (el) => { Q.scopedBuildings().filter(b => b.group === el.dataset.g).forEach(b => sel.add(b.id)); draw(); }, none: () => { sel.clear(); draw(); },
      next: () => { if (!sel.size) return U.toast('warn', 'Chọn ít nhất một tòa'); preview = X.previewPeriod(period2, [...sel]); step = 1; draw(); },
      create: () => { const allow = d.el.querySelector('[name=allowMissing]').checked; const r = K.act(() => X.createInvoiceDrafts(period2, [...sel], { allowMissingReading: allow })); if (r) { d._res = r; step = 2; draw(); } },
      view: () => { d.close(); TH.go(`#/billing/invoices?period=${period2}&life=draft`); },
    });
    draw();
  };

  /* UI-12 sửa nháp: 13 dòng (chỉ số cũ/mới, SL, hệ số, đơn giá, thành tiền, ghi chú) + xem trước bản in theo số đang sửa */
  const editDraft = (inv) => {
    const L = B.expand(inv.lines);
    const inp = (no, k, v, w = 90) => `<input class="inp sm tr" name="l${no}_${k}" value="${v == null ? '' : esc(String(v))}" style="width:${w}px">`;
    const table = `<div style="overflow-x:auto"><table class="tbl compact"><thead><tr><th>Dòng</th><th class="num">Số mới</th><th class="num">Số cũ</th><th class="num">SL (F)</th><th class="num">Hệ số (G)</th><th class="num">Đơn giá (H)</th><th class="num">Thành tiền (I)</th><th>Ghi chú</th></tr></thead><tbody>
      ${L.map(l => `<tr><td><b>${l.no}</b>. ${esc(l.label)}</td><td class="num">${[3, 4].includes(l.no) ? inp(l.no, 'curr', l.curr, 72) : ''}</td><td class="num">${[3, 4].includes(l.no) ? inp(l.no, 'prev', l.prev, 72) : ''}</td>
        <td class="num">${inp(l.no, 'qty', l.qty, 56)}</td><td class="num">${inp(l.no, 'factor', l.factor, 64)}</td><td class="num">${inp(l.no, 'unit', l.unit, 92)}</td><td class="num">${inp(l.no, 'amount', l.amount, 100)}</td><td>${inp(l.no, 'note', l.note, 150)}</td></tr>`).join('')}</tbody></table></div>
      <div class="small muted mt8">I = H × F × G (dòng 3/4: F = số mới − số cũ). Sửa hệ số, đơn giá hoặc gõ thành tiền khác công thức phải nhập lý do. Tổng cần đóng tính lại theo 13 dòng.</div>`;
    const collect = (data) => L.map(l => { const o = { no: l.no }; ['curr', 'prev', 'qty', 'factor', 'unit', 'amount', 'note'].forEach(k => { if (data['l' + l.no + '_' + k] !== undefined) o[k] = k === 'note' ? data['l' + l.no + '_' + k] : String(data['l' + l.no + '_' + k]).trim().replace(',', '.'); }); return o; });
    const d = K.formDrawer({ title: 'Sửa hóa đơn nháp ' + inv.code, sub: 'Chỉ sửa được khi còn nháp; sau phát hành dùng điều chỉnh có lý do', wide: 'x', fields: [
      { type: 'html', span: true, html: table }, { name: 'reason', label: 'Lý do sửa', type: 'textarea', span: true, help: 'Bắt buộc khi đổi hệ số / đơn giá / thành tiền' },
      { type: 'html', span: true, html: '<div class="card-sub mt8"><b>Xem trước bản in</b></div><div class="print-frame" id="dprev"></div>' }],
      submit: 'Lưu nháp', onSubmit: (data) => { X.updateDraftLines(inv.id, collect(data), data.reason); U.toast('ok', 'Đã lưu hóa đơn nháp'); } });
    // Xem trước theo số đang sửa (không ghi store)
    const preview = () => {
      const data = d.data(), P = collect(data);
      const lines = L.map(l => { const p = P.find(x => x.no === l.no), o = Object.assign({}, l); ['curr', 'prev', 'qty', 'factor', 'unit'].forEach(k => { if (p[k] !== '' && p[k] != null && !isNaN(Number(p[k]))) o[k] = Number(p[k]); });
        if ([3, 4].includes(l.no) && o.curr != null && o.prev != null) o.qty = Math.max(0, o.curr - o.prev);
        const calc = Math.round(o.qty * o.unit * o.factor), am = Number(p.amount); o.amount = !isNaN(am) && Math.abs(am - l.amount) > 0.5 ? am : calc; o.note = p.note || ''; return o; });
      const el = d.el.querySelector('#dprev'); if (el) el.innerHTML = TH.print.invoiceHtml(Object.assign({}, inv, { lines, totalDue: B.total(lines) }));
    };
    d.el.addEventListener('input', preview); preview();
  };

  TH.router.handle('/billing/invoices', (root, p, q) => {
    const period = q.period || S.meta.period;
    const detailed = Q.scoped(Q.invoiceRows(Object.assign({}, q, { period })));
    const rows = detailed.map(x => x.invoice), detailOf = Object.fromEntries(detailed.map(x => [x.invoice.id, x]));
    const money = TH.auth.can('debts.viewAmounts');
    const st = (i) => Q.invState(i);
    const tot = (f) => rows.reduce((s, i) => s + f(i), 0);
    const drafts = rows.filter(i => i.lifecycle === 'draft');
    root.innerHTML = TH.pages.billingTabs('invoices') + U.pageHead({ title: 'Hóa đơn', sub: `${F.periodLabel(period)} · tiền nhà trả trước, dịch vụ theo chỉ số chốt ngày ${Q.param('cutoffDay')} tháng trước`, acts: [
      U.btn({ label: 'Xuất theo tòa', icon: 'download', act: 'exp' }), drafts.length ? U.btn({ label: `Phát hành ${drafts.length} nháp`, icon: 'send', act: 'issueall', perm: 'invoices.issue' }) : '', U.btn({ label: 'Tạo kỳ hóa đơn', icon: 'file-plus', cls: 'btn-primary', act: 'wizard', perm: 'invoices.prepare' })] })
      + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Hóa đơn', value: rows.length, cap: drafts.length + ' nháp · ' + rows.filter(i => i.isNewStay).length + ' phòng mới · ' + rows.filter(i => i.isBreach).length + ' phá HĐ', icon: 'receipt' })}
        ${U.kpi({ label: 'Tổng cần đóng', value: money ? F.vnd(tot(i => i.totalDue)) : '•••', icon: 'coins', tone: 'blue' })}${U.kpi({ label: 'Đã thu', value: money ? F.vnd(tot(i => Math.min(i.totalDue, st(i).paid))) : '•••', cap: rows.filter(i => ['DU', 'THUA'].includes(st(i).status)).length + ' hóa đơn đủ/thừa', icon: 'check-circle', tone: 'green' })}
        ${U.kpi({ label: 'Còn nợ', value: money ? F.vnd(tot(i => st(i).remaining)) : '•••', cap: rows.filter(i => st(i).remaining > 0).length + ' hóa đơn', icon: 'alert-triangle', tone: 'red' })}</div>`
      + K.filters([{ name: 'period', label: 'Kỳ', options: periodOpts(), value: period, all: false }, { name: 'q', type: 'search', label: 'Tìm', placeholder: 'Mã HĐ, mã KH, phòng…' }, { name: 'building', label: 'Tòa', options: K.buildingOpts() }, { name: 'group', label: 'T/S/G', options: K.groupOpts() },
        { name: 'manager', label: 'Quản lý', options: K.managerOpts() }, { name: 'leader', label: 'Leader', options: Q.teamLeaders().map(e => [e.id, e.name]) }, ...(q.leader ? [{ name: 'direct', label: 'Phạm vi team', options: [['1', 'Chỉ team trực tiếp']], all: 'Cả nhánh' }] : []), { name: 'life', label: 'Vòng đời', options: [['draft', 'Nháp'], ['issued', 'Đã phát hành'], ['adjusted', 'Đã điều chỉnh']] },
        { name: 'pay', label: 'Trạng thái thu', options: Object.entries(TH.calc.payments.STATUS).map(([k, v]) => [k, v.label + ' – ' + v.web]) }, { name: 'dueStatus', label: 'Hạn thanh toán', options: [['overdue', 'Quá hạn'], ['due', 'Đến hạn ≤ 7 ngày'], ['not_due', 'Chưa đến hạn'], ['paid', 'Đã thanh toán']] }, { name: 'dueFrom', type: 'date', label: 'Hạn từ' }, { name: 'dueTo', type: 'date', label: 'Hạn đến' }, { name: 'kind', label: 'Loại', options: [['new', 'Phòng mới'], ['breach', 'Phá HĐ']] }], q)
      + '<div class="mt16">' + K.tableCard('t', `${rows.length} hóa đơn`, '', 'Trạng thái thu theo cột "Tình trạng" của Excel: Chưa TT / Thiếu / Đủ / Thừa') + '</div>';
    K.bindFilters(root, ['period']);
    const tbl = U.table(root.querySelector('#t'), { rows, pageSize: 25, selectable: TH.auth.can('invoices.issue'), selectableIf: i => i.lifecycle === 'draft', rowHref: i => '#/billing/invoices/' + i.id, cols: [
      { key: 'code', label: 'Mã KH / phòng', sortable: true, sortVal: i => i.customerCode, render: i => U.cell2(`<b>${esc(i.customerCode)}</b>`, esc(Q.roomCode(i.roomId)) + ' · ' + esc((Q.building(i.buildingId) || {}).code)) },
      { key: 'mgr', label: 'Quản lý / leader', render: i => { const x = detailOf[i.id]; return U.cell2(esc((x.manager || {}).name || 'Chưa phân công'), esc((x.leader || {}).name || 'Chưa có leader')); } },
      { key: 'contract', label: 'Giá thuê / niêm yết', num: true, render: i => { const x = detailOf[i.id]; return money ? U.cell2(F.vnd((x.stay || {}).rent || 0) + ' / ' + F.vnd((x.room || {}).listPrice || 0), 'Cọc ' + F.vnd((x.stay || {}).depositAmount || 0) + ' · ' + ((x.stay || {}).payMonths || 1) + ' tháng/lần') : '•••'; } },
      { key: 'k', label: 'Loại', render: i => [i.isNewStay ? U.chip('Phòng mới', 'blue') : '', i.isBreach ? U.chip('Phá HĐ', 'red') : '', i.kind === 'opening' ? U.chip('Số dư đầu kỳ', 'gray') : '', i.kind === 'deposit_excess' ? U.chip('Vượt cọc', 'purple') : '', i.ownerSettled ? U.chip('Chủ nhà đã thu', 'teal') : X.isOwnerTenantInv(i) ? U.chip('Khách chủ nhà', 'gray') : '', Q.prorataFlag(i) ? U.chip('Lệch tháng lẻ', 'amber') : '', i.excel && !i.isBreach && Math.abs(i.excel.total - i.totalDue) > 1 ? U.chip('Lệch Excel nguồn', 'amber') : ''].join(' ') },
      { key: 'tpl', label: 'Mẫu in', render: i => `<span class="small">${esc(B.TEMPLATES[i.template].name)}</span>` },
      { key: 'due', label: 'Tổng cần đóng', num: true, sortable: true, sortVal: i => i.totalDue, render: i => money ? F.vnd(i.totalDue) : '•••' },
      { key: 'paid', label: 'Đã đóng', num: true, sortable: true, sortVal: i => st(i).paid, render: i => money ? F.vnd(st(i).paid) : '•••' },
      { key: 'rem', label: 'Còn nợ / dư', num: true, sortable: true, sortVal: i => st(i).remaining - st(i).credit, render: i => { const x = st(i); return x.remaining > 0 ? `<b class="red">${money ? F.vnd(x.remaining) : 'Còn nợ'}</b>` : x.credit > 0 ? `<span class="blue">dư ${money ? F.vnd(x.credit) : ''}</span>` : '0'; } },
      { key: 'last', label: 'Ngày thu', render: i => st(i).lastPaid ? F.date(st(i).lastPaid) : '–' },
      { key: 'life', label: 'Vòng đời', render: i => K.lifeChip(i.lifecycle) }, { key: 'st', label: 'Trạng thái thu', render: i => i.lifecycle === 'draft' ? '' : K.payChip(st(i).status) },
      { key: 'debt', label: 'Thời hạn / công nợ', render: i => { const x = detailOf[i.id]; return U.cell2((i.dueFrom ? F.date(i.dueFrom) + ' → ' : '') + F.date(x.dueDate), K.debtChip(st(i).debt)); } },
    ] });
    U.bind(root, {
      wizard: () => wizard(q),
      issueall: async () => { const sel = tbl.selected(); const ids = sel.length ? sel : drafts.map(i => i.id); const ok = await U.confirm({ title: 'Phát hành hóa đơn', text: `Phát hành ${ids.length} hóa đơn nháp? Sau phát hành giá được chụp lại (snapshot), sửa bằng điều chỉnh có lý do.`, ok: 'Phát hành' }); if (!ok) return; const r = K.act(() => X.issueInvoices(ids)); if (r) U.toast(r.errs.length ? 'warn' : 'ok', `Đã phát hành ${r.issued} hóa đơn`, r.errs.slice(0, 3).join(' · ')); },
      exp: () => K.csv(`hoa-don-${period}.csv`, ['Mã KH', 'Phòng', 'Tòa', 'Quản lý', 'Leader', 'Giá niêm yết', 'Giá thuê', 'Tiền cọc', 'Kỳ trả (tháng)', 'Hạn từ', 'Hạn đến', 'Mẫu', 'Tổng cần đóng', 'Đã đóng', 'Còn nợ', 'Tình trạng', 'Vòng đời'], rows.map(i => { const x = detailOf[i.id]; return [i.customerCode, Q.roomCode(i.roomId), x.building.code, (x.manager || {}).name || '', (x.leader || {}).name || '', x.room.listPrice || 0, x.stay.rent || 0, x.stay.depositAmount || 0, x.stay.payMonths || 1, i.dueFrom || '', x.dueDate, B.TEMPLATES[i.template].name, Math.round(i.totalDue), Math.round(st(i).paid), Math.round(st(i).remaining), TH.calc.payments.STATUS[st(i).status].label, i.lifecycle]; }), ['Giá niêm yết', 'Giá thuê', 'Tiền cọc', 'Tổng cần đóng', 'Đã đóng', 'Còn nợ']),
    });
    if (q.open === 'wizard' && TH.auth.can('invoices.prepare')) wizard(q);
  });

  TH.router.handle('/billing/invoices/:id', (root, p) => {
    const inv = Q.invoice(p.id); if (!inv) { root.innerHTML = U.empty({ title: 'Không tìm thấy hóa đơn' }); return; }
    if (!TH.auth.inScope(inv.buildingId)) { root.innerHTML = U.card({ body: U.empty({ icon: 'lock', title: 'Hóa đơn ngoài phạm vi' }) }); return; }
    const s = Q.stay(inv.stayId); const st = Q.invState(inv); const money = TH.auth.can('debts.viewAmounts');
    TH.layout.crumb([{ label: 'Hóa đơn & thu tiền', href: '#/billing/invoices?period=' + inv.period }, { label: inv.code }]);
    const pays = S.all('payments').filter(x => x.allocations.some(a => a.invoiceId === inv.id));
    const chk = B.checkBeforeIssue(inv);
    const lines = B.expand(inv.lines);
    const excelDiff = inv.excel && Math.abs(inv.excel.total - inv.totalDue) > 1 && !inv.isBreach;
    root.innerHTML = U.pageHead({ title: 'Hóa đơn ' + esc(inv.customerCode) + ' ' + K.lifeChip(inv.lifecycle) + ' ' + (inv.lifecycle !== 'draft' ? K.payChip(st.status) : ''), back: '#/billing/invoices?period=' + inv.period,
      sub: `${F.periodLabel(inv.period)} · Phòng ${esc(Q.roomCode(inv.roomId))} · <a href="#/stays/${s.id}">${esc(Q.stayLabel(s))}</a>`, acts: [
        U.btn({ label: 'Xem / in', icon: 'printer', href: '#/print/invoice/' + inv.id }),
        inv.lifecycle === 'draft' ? U.btn({ label: 'Xóa nháp', icon: 'trash', act: 'del', perm: 'invoices.prepare' }) + U.btn({ label: 'Đổi mẫu in', icon: 'file-text', act: 'template', perm: 'invoices.prepare' }) + U.btn({ label: 'Sửa dòng', icon: 'pencil', act: 'edit', perm: 'invoices.prepare' }) : U.btn({ label: 'Điều chỉnh', icon: 'pencil', act: 'adjust', perm: 'invoices.adjust' }),
        inv.lifecycle !== 'draft' && X.isOwnerTenantInv(inv) && st.remaining > 0 ? U.btn({ label: 'Chủ nhà đã thu', icon: 'key', act: 'owner', perm: 'ownerPayments.record' }) : '',
        inv.ownerSettled > 0 ? U.btn({ label: 'Hủy bù trừ chủ nhà', icon: 'undo', act: 'unowner', perm: 'ownerPayments.record' }) : '',
        inv.lifecycle === 'draft' ? U.btn({ label: 'Phát hành', icon: 'send', cls: 'btn-primary', act: 'issue', perm: 'invoices.issue' }) : (st.remaining > 0 ? U.btn({ label: 'Ghi nhận thu', icon: 'banknote', cls: 'btn-primary', href: `#/billing/receipts/new?stay=${s.id}&invoice=${inv.id}`, perm: 'payments.record' }) : '')] })
      + `<div class="two-col wide"><div class="side-stack">
        ${U.card({ title: 'Xem trước bản in', icon: 'file-text', sub: lines[12] && lines[12].amount ? 'Mẫu mở rộng 13 dòng – có “Thu khác”' : 'Mẫu chuẩn 12 dòng – không có “Thu khác”', body: `<div class="print-frame" role="region" aria-label="Xem trước bản in hóa đơn" tabindex="0">${TH.print.invoiceHtml(inv)}</div>` })}
        ${inv.kind === 'deposit_excess' ? U.note('info', 'Hóa đơn thu phần khấu trừ vượt cọc', `Lập tự động khi chi phiếu hoàn <a href="#/refunds/${inv.refundId}">${esc((S.get('refunds', inv.refundId) || {}).code || '')}</a>: khấu trừ lớn hơn cọc, số chi 0, phần vượt thu như hóa đơn thường (UI-18 E18).`) : ''}
        ${X.isOwnerTenantInv(inv) ? U.note(inv.ownerSettled ? 'ok' : 'info', 'Phòng khách của chủ nhà', inv.ownerSettled ? `Chủ nhà đã thu ${F.vndd(inv.ownerSettled)} – bù trừ vào kỳ trả chủ nhà ${(inv.ownerSettlements || []).map(x => F.date((S.get('ownerPayments', x.opId) || {}).from)).join(', ')}; không là công nợ khách (OQ-14).` : 'Khách đóng thẳng cho chủ nhà thì bấm "Chủ nhà đã thu": số đó trừ vào tiền trả chủ nhà kỳ tới, hóa đơn không thành công nợ (OQ-14).') : ''}
        ${inv.isBreach ? U.note('danger', 'Hóa đơn phá HĐ / bỏ trốn', 'Giữ cọc, chỉ thu tiền điện theo chỉ số; tiền phòng và dịch vụ còn lại KHÔNG thành công nợ (GĐ OQ-03).' + (inv.excel && inv.excel.lines ? ` Dòng gốc trên sheet NHÀ: ${F.vndd(inv.excel.total)} (Excel ghi "${esc(inv.excel.status)}").` : '')) : ''}
      </div><div class="side-stack">
        ${U.card({ title: 'Thông tin nội bộ', icon: 'info', body: U.kv([['Mã hóa đơn', esc(inv.code)], ['Mẫu in', esc((inv.printSnapshot && inv.printSnapshot.templateName) || B.TEMPLATES[inv.template].name) + (inv.printSnapshot ? ' · ' + esc(inv.printSnapshot.templateVersion) : '')], ['TK nhận', TH.auth.can('settings.view') ? esc(((inv.printSnapshot || Q.account(inv.accountId) || {}).bank || '') + ' ' + ((inv.printSnapshot || Q.account(inv.accountId) || {}).number || '')) : '•••'],
          ['Chốt số liệu', F.date(inv.cutoff)], ['Hạn thanh toán', F.date(inv.dueFrom) + ' → ' + F.date(inv.dueTo)], ['Thành công nợ từ', F.date(TH.calc.dates.debtStart(inv.period, Q.params(), inv)) + (Q.param('debtBasis') === 'issuedAt' ? ' · 5 ngày từ phát hành' : ' · theo hạn')], ['Phát hành', inv.issuedAt ? F.datetime(inv.issuedAt) + ' · ' + esc(inv.issuedBy || '') : 'Chưa'], ['Nguồn', esc((inv.excel && inv.excel.src) ? 'Excel ' + inv.excel.src : 'Tạo trên web')]]) })}
        ${U.card({ title: 'Thu tiền', icon: 'wallet', body: `${U.kv([['Tổng cần đóng', money ? F.vndd(inv.totalDue) : '•••'], ['Đã thu', money ? F.vndd(st.paid) : '•••'], ['Còn nợ', `<b class="${st.remaining > 0 ? 'red' : ''}">${money ? F.vndd(st.remaining) : (st.remaining > 0 ? 'Còn nợ' : '0')}</b>`], ['Dư', money ? F.vndd(st.credit) : '•••'], ['Hạn / công nợ', K.debtChip(st.debt)], ...(inv.carriedOut ? [['Đã chuyển sang nợ cũ kỳ sau', F.vndd(inv.carriedOut)]] : []), ...(st.ownerSettled ? [['Trong đó chủ nhà đã thu (bù trừ)', money ? F.vndd(st.ownerSettled) : '•••']] : [])])}
          ${inv.lifecycle !== 'draft' && money ? `<div class="mt12" style="overflow-x:auto" role="region" aria-label="Phân bổ thu theo dòng hóa đơn" tabindex="0"><table class="tbl compact"><thead><tr><th>Dòng</th><th class="num">Phải thu</th><th class="num">Đã thu</th><th class="num">Còn</th></tr></thead><tbody>${Q.lineState(inv).filter(l => l.amount).map(l => `<tr><td>${l.no}. ${esc(l.label)}</td><td class="num">${F.vnd(l.amount)}</td><td class="num">${F.vnd(l.paid)}${l.explicit ? '' : l.paid ? ' <span class="muted small" data-tip="Phân bổ cấp hóa đơn – hiển thị theo thứ tự dòng">*</span>' : ''}</td><td class="num ${l.remaining > 0 ? 'red' : ''}">${F.vnd(l.remaining)}</td></tr>`).join('')}</tbody></table></div>` : ''}
          ${TH.auth.can('payments.view') ? `<div class="mt12">${pays.map(x => `<a class="mini-row" href="#/billing/receipts/${x.id}"><span>${esc(x.code)}</span><span class="grow">${F.date(x.receivedAt)} · ${x.method === 'cash' ? 'tiền mặt' : 'chuyển khoản'}</span><b>${F.vnd(x.allocations.filter(a => a.invoiceId === inv.id).reduce((t, a) => t + a.amount, 0))}</b></a>`).join('') || '<span class="muted small">Chưa có phiếu thu</span>'}</div>` : ''}` })}
        ${U.card({ title: 'Kiểm tra trước phát hành', icon: 'clipboard-check', body: `${chk.ok ? U.note('ok', 'Tổng in = tổng cần đóng', F.vndd(chk.total)) : U.note('danger', 'Chưa đạt', chk.errs.join('<br>'))}${chk.warns.map(w => U.note('warn', '', esc(w))).join('')}
          ${Q.prorataFlag(inv) ? U.note('warn', 'Tháng lẻ lệch quy tắc số ngày thực', esc(Q.prorataFlag(inv)) + ' – kiểm tra lại với khách trước khi thu (§3.12b).') : ''}
          ${excelDiff ? U.note('warn', 'Lệch với Excel nguồn', `Excel "Tổng cần đóng" = ${F.vndd(inv.excel.total)}${inv.excel.hardTotal ? ' (ô gõ số cứng)' : ' (công thức bỏ sót khoản)'}; web tính lại theo 13 dòng = ${F.vndd(inv.totalDue)}.`) : ''}` })}
        ${(inv.edits || []).length ? U.card({ title: 'Lịch sử sửa nháp', icon: 'history', body: inv.edits.map(a => `<div class="mini-row"><span>${F.datetime(a.at)}</span><span class="grow">Dòng ${a.no} · ${esc(a.field)}: ${esc(String(a.from ?? ''))} → ${esc(String(a.to ?? ''))}${a.reason ? ' – ' + esc(a.reason) : ''} (${esc(a.by)})</span></div>`).join('') }) : ''}
        ${(inv.adjustments || []).length ? U.card({ title: 'Lịch sử điều chỉnh', icon: 'history', body: inv.adjustments.map(a => `<div class="mini-row"><span>${F.datetime(a.at)}</span><span class="grow">Dòng ${a.no}: ${esc(a.reason)} (${esc(a.by)})</span><b>${F.vnd(a.delta)}</b></div>`).join('') }) : ''}
      </div></div>`;
    U.bind(root, {
      edit: () => editDraft(inv),
      template: () => K.formDrawer({ title: 'Đổi mẫu in hóa đơn nháp', sub: 'Hệ thống tự chọn tài khoản đang hiệu lực của mẫu. Khi phát hành, cấu hình này được đóng băng.', modal: true, size: 'sm', fields: [
        { name: 'template', label: 'Mẫu in', type: 'select', req: true, value: inv.template, options: Object.values(B.TEMPLATES).map(t => [t.key, t.name]) }], submit: 'Áp dụng', onSubmit: (d) => { X.setInvoiceTemplate(inv.id, d.template); U.toast('ok', 'Đã đổi mẫu in'); } }),
      owner: () => K.formDrawer({ title: 'Chủ nhà đã thu – ' + inv.code, sub: 'Bù trừ vào tiền trả chủ nhà (UI-05, OQ-14)', modal: true, fields: [
        { name: 'amount', label: 'Số khách đã đóng cho chủ nhà', type: 'money', req: true, value: Math.round(st.remaining) }, { name: 'date', label: 'Ngày khách đóng', type: 'date', req: true, value: F.today() },
        { name: 'reason', label: 'Căn cứ', type: 'textarea', req: true, span: true, help: 'Chủ nhà xác nhận / ảnh tin nhắn / biên nhận' }],
        submit: 'Ghi bù trừ', onSubmit: (d) => { const r = X.markOwnerCollected(inv.id, d); U.toast('ok', 'Đã ghi bù trừ', 'Kỳ trả chủ nhà ' + F.date((S.get('ownerPayments', r.opId) || {}).from)); } }),
      unowner: () => K.formDrawer({ title: 'Hủy bù trừ chủ nhà', modal: true, size: 'sm', fields: [{ name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Hủy bù trừ', onSubmit: (d) => { X.unmarkOwnerCollected(inv.id, d.reason); U.toast('ok', 'Đã hủy bù trừ'); } }),
      issue: () => { const r = K.act(() => X.issueInvoices([inv.id])); if (r) U.toast(r.errs.length ? 'err' : 'ok', r.errs.length ? 'Chưa phát hành được' : 'Đã phát hành', r.errs.join('; ')); },
      del: async () => { if (await U.confirm({ title: 'Xóa hóa đơn nháp', text: 'Xóa nháp ' + inv.code + '?', danger: true, ok: 'Xóa' })) { K.act(() => X.deleteDraft(inv.id), 'Đã xóa nháp'); TH.go('#/billing/invoices?period=' + inv.period); } },
      adjust: () => K.formDrawer({ title: 'Điều chỉnh sau phát hành', sub: 'Giữ bản gốc; ghi dòng điều chỉnh có lý do', modal: true, fields: [
        { name: 'no', label: 'Dòng', type: 'select', req: true, options: lines.map(l => [l.no, l.no + '. ' + l.label + ' (' + F.vnd(l.amount) + ')']) }, { name: 'amount', label: 'Thành tiền mới', type: 'money', req: true },
        { name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Ghi điều chỉnh', onSubmit: (d) => { X.adjustInvoice(inv.id, d); U.toast('ok', 'Đã điều chỉnh'); } }),
    });
  });

  TH.router.handle('/print/invoice/:id', (root, p) => {
    const inv = Q.invoice(p.id); if (!inv) { root.innerHTML = 'Không tìm thấy hóa đơn'; return; }
    if (!TH.auth.inScope(inv.buildingId)) { root.innerHTML = U.card({ body: U.empty({ icon: 'lock', title: 'Hóa đơn ngoài phạm vi được giao' }) }); return; }
    root.innerHTML = `<div class="print-bar no-print"><a class="btn btn-ghost" href="#/billing/invoices/${inv.id}">← Quay lại</a><div class="row">${Object.values(B.TEMPLATES).map(t => `<span class="chip ${t.key === inv.template ? 'blue' : 'gray'}">${esc(t.name)}</span>`).join('')}</div><button class="btn btn-primary" onclick="window.print()">In / Lưu PDF (A4)</button></div>${TH.print.invoiceHtml(inv)}`;
  });
})(window.TH);
