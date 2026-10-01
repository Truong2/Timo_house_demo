/* UI-13 Phiếu thu: danh sách · ghi thu (thu một phần E13, trả trước E14, cọc) với phân bổ do kế toán chọn · chi tiết + đảo phiếu. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc;
  const TYPE = { invoice: 'Thu hóa đơn', deposit: 'Nhận cọc', prepay: 'Trả trước', other: 'Khác' };
  TH.router.handle('/billing/receipts', (root, p, q) => {
    let rows = Q.scoped(S.all('payments'));
    const from = q.from || '2026-08-20', to = q.to || F.today();
    rows = rows.filter(x => x.receivedAt >= from && x.receivedAt <= to);
    if (q.type) rows = rows.filter(x => x.type === q.type);
    if (q.building) rows = rows.filter(x => x.buildingId === q.building);
    if (q.method) rows = rows.filter(x => x.method === q.method);
    if (q.unalloc === '1') rows = rows.filter(x => x.unallocated > 0 && x.status !== 'reversed');
    if (q.q) rows = rows.filter(x => K.match(q.q, x.code, (Q.stay(x.stayId) || {}).code));
    rows.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
    const posted = rows.filter(x => x.status !== 'reversed');
    root.innerHTML = TH.pages.billingTabs('receipts') + U.pageHead({ title: 'Phiếu thu', sub: 'Ngày tiền thực nhận quyết định mốc 5/10/15 (không dùng ngày nhập)', acts: [U.btn({ label: 'Xuất', icon: 'download', act: 'exp' }), U.btn({ label: 'Ghi nhận thu', icon: 'plus', cls: 'btn-primary', href: '#/billing/receipts/new', perm: 'payments.record' })] })
      + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Số phiếu', value: posted.length, icon: 'receipt' })}${U.kpi({ label: 'Tổng thu', value: F.vnd(posted.reduce((s, x) => s + x.amount, 0)), icon: 'coins', tone: 'green' })}
        ${U.kpi({ label: 'Chưa phân bổ (trả trước / cọc)', value: F.vnd(posted.reduce((s, x) => s + (x.unallocated || 0), 0)), icon: 'inbox', tone: 'purple' })}${U.kpi({ label: 'Tiền mặt', value: F.vnd(posted.filter(x => x.method === 'cash').reduce((s, x) => s + x.amount, 0)), icon: 'banknote', tone: 'amber' })}</div>`
      + K.filters([{ name: 'q', type: 'search', label: 'Tìm', placeholder: 'Mã phiếu, mã KH…' }, { name: 'from', type: 'date', label: 'Thực nhận từ', value: from }, { name: 'to', type: 'date', label: 'đến', value: to },
        { name: 'type', label: 'Loại', options: Object.entries(TYPE) }, { name: 'method', label: 'Phương thức', options: [['bank', 'Chuyển khoản'], ['cash', 'Tiền mặt']] }, { name: 'building', label: 'Tòa', options: K.buildingOpts() }, { name: 'unalloc', label: 'Phân bổ', options: [['1', 'Còn chưa phân bổ']] }], q)
      + '<div class="mt16">' + K.tableCard('t', `${rows.length} phiếu`) + '</div>';
    K.bindFilters(root);
    U.table(root.querySelector('#t'), { rows, pageSize: 25, rowHref: x => '#/billing/receipts/' + x.id, cols: [
      { key: 'code', label: 'Mã phiếu', render: x => `<b>${esc(x.code)}</b>` }, { key: 'd', label: 'Ngày thực nhận', sortable: true, sortVal: x => x.receivedAt, render: x => F.date(x.receivedAt) + (x.dateSource === 'synthetic' ? ' <span class="muted small" data-tip="Ngày suy từ tiến độ thu (Excel không ghi ngày)">*</span>' : '') },
      { key: 's', label: 'Mã KH', render: x => esc((Q.stay(x.stayId) || {}).code || '') }, { key: 'r', label: 'Phòng', render: x => esc(Q.roomCode((Q.stay(x.stayId) || {}).roomId)) },
      { key: 't', label: 'Loại', render: x => TYPE[x.type] || x.type }, { key: 'm', label: 'Phương thức', render: x => x.method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản' },
      { key: 'a', label: 'Số tiền', num: true, sortable: true, sortVal: x => x.amount, render: x => F.vnd(x.amount) }, { key: 'u', label: 'Chưa phân bổ', num: true, render: x => x.unallocated ? F.vnd(x.unallocated) : '–' },
      { key: 'by', label: 'Người nhận / người ghi', render: x => U.cell2(esc(x.receivedBy || ''), esc(x.recordedBy || '')) }, { key: 'st', label: '', render: x => x.status === 'reversed' ? U.chip('Đã đảo', 'gray') : '' }] });
    U.bind(root, { exp: () => K.csv('phieu-thu.csv', ['Mã phiếu', 'Ngày thực nhận', 'Mã KH', 'Loại', 'Phương thức', 'Số tiền', 'Chưa phân bổ', 'Trạng thái'], rows.map(x => [x.code, x.receivedAt, (Q.stay(x.stayId) || {}).code, TYPE[x.type], x.method, x.amount, x.unallocated || 0, x.status])) });
  });

  TH.router.handle('/billing/receipts/new', (root, p, q) => {
    TH.layout.crumb([{ label: 'Phiếu thu', href: '#/billing/receipts' }, { label: 'Ghi nhận thu' }]);
    const stays = Q.scoped(S.all('stays')).filter(s => ['active', 'pending'].includes(s.status) || (Q.invoicesByStay()[s.id] || []).some(i => Q.invState(i).remaining > 0));
    let stay = q.stay ? Q.stay(q.stay) : null;
    const draw = () => {
      const open = stay ? (Q.invoicesByStay()[stay.id] || []).filter(i => i.lifecycle !== 'draft' && Q.invState(i).remaining > 0).sort((a, b) => a.period.localeCompare(b.period)) : [];
      const future = stay ? (Q.invoicesByStay()[stay.id] || []).filter(i => i.lifecycle !== 'draft' && Q.invState(i).remaining > 0) : [];
      root.innerHTML = U.pageHead({ title: 'Ghi nhận thu tiền', back: '#/billing/receipts', sub: 'Kế toán chọn rõ khoản phân bổ – hệ thống không tự bù trừ theo thứ tự' })
        + `<form id="f" class="two-col"><div class="side-stack">${U.card({ title: '1. Người nộp & số tiền', icon: 'user', body: `<div class="form-grid">
          ${U.field({ label: 'Khách / lượt thuê', req: true, name: 'stayId', input: `<input class="inp" list="stays" name="stayQ" value="${stay ? esc(stay.code + ' – ' + (Q.customer(stay.customerId) || {}).name) : ''}" placeholder="Gõ mã KH hoặc mã phòng"><datalist id="stays">${stays.slice(0, 3000).map(s => `<option value="${esc(s.code + ' – ' + (Q.customer(s.customerId) || {}).name)}">`).join('')}</datalist>` })}
          ${U.field({ label: 'Loại phiếu', name: 'type', input: U.select({ name: 'type', value: q.type || (open.length ? 'invoice' : 'prepay'), options: Object.entries(TYPE) }) })}
          ${U.field({ label: 'Số tiền thu', req: true, name: 'amount', input: U.money({ name: 'amount', value: q.amount || (open.length ? Math.round(open.reduce((s, i) => s + Q.invState(i).remaining, 0)) : '') }) })}
          ${U.field({ label: 'Ngày tiền thực nhận', req: true, name: 'receivedAt', input: U.date({ name: 'receivedAt', value: F.today() }), help: 'Khác ngày nhập; dùng cho mốc 5/10/15' })}
          ${U.field({ label: 'Phương thức', name: 'method', input: U.select({ name: 'method', value: 'bank', options: [['bank', 'Chuyển khoản'], ['cash', 'Tiền mặt']] }) })}
          ${U.field({ label: 'Tài khoản / quỹ nhận', name: 'accountId', input: U.select({ name: 'accountId', value: stay ? (Q.building(stay.buildingId) || {}).accountId : '', options: S.all('accounts').map(a => [a.id, a.bank + ' ' + a.number]).concat([['cash_fund', 'Quỹ tiền mặt']]) }) })}
          ${U.field({ label: 'Người thực nhận', name: 'receivedBy', input: U.input({ name: 'receivedBy', value: S.session.name }) })}
          ${U.field({ label: 'Mã tham chiếu / nội dung CK', name: 'reference', input: U.input({ name: 'reference', value: stay ? stay.code : '' }) })}
          ${U.field({ label: 'Chứng từ', name: 'ev', cls: 'span2', input: U.dropzone({ name: 'ev', hint: 'Ảnh chuyển khoản / biên nhận', multiple: false }) })}</div>` })}</div>
          <div class="side-stack">${U.card({ title: '2. Phân bổ theo dòng hóa đơn', icon: 'split', sub: 'Kế toán nhập số cho từng dòng; không vượt số còn phải thu của dòng, phần dư là chưa phân bổ', body: stay ? (open.length ? `<div style="overflow-x:auto"><table class="tbl compact"><thead><tr><th>Hóa đơn / dòng · còn phải thu</th><th class="num">Phân bổ</th></tr></thead><tbody>
            ${open.map(i => `<tr class="grp"><td style="white-space:normal"><b>${F.periodShort(i.period)}</b> ${i.id === q.invoice ? U.chip('đang chọn', 'blue') : ''}<br><small class="muted">${esc(i.code)} · còn ${F.vnd(Q.invState(i).remaining)}</small></td><td class="num" style="white-space:nowrap"><button type="button" class="btn btn-ghost btn-xs" data-act="fillinv" data-i="${i.id}">Điền đủ</button> <button type="button" class="btn btn-ghost btn-xs" data-act="clrinv" data-i="${i.id}">Xóa</button></td></tr>
              ${Q.lineState(i).filter(l => l.remaining > 0.5).map(l => `<tr><td style="padding-left:16px">${l.no}. ${esc(l.label)}<br><small class="muted">còn ${F.vnd(l.remaining)}</small></td><td class="num"><input class="inp sm tr" data-money data-inv="${i.id}" data-line="${l.no}" data-max="${l.remaining}" value="${q.proposal?'0':F.vnd(Math.round(l.remaining))}" style="width:112px"></td></tr>`).join('')}`).join('')}</tbody></table></div>
            <div class="sum-box mt12" id="sum"></div>` : U.note('info', 'Không có hóa đơn còn nợ', 'Số tiền ghi là trả trước / cọc (chưa phân bổ). Trả trước nhiều tháng: chọn số tháng để chia phần từng kỳ – tự áp khi phát hành hóa đơn kỳ đó.')) : U.empty({ title: 'Chọn khách trước' }) })}
            ${stay ? U.card({ title: '3. Trả trước nhiều tháng (E14)', icon: 'calendar', sub: 'Tiền ghi một lần tại ngày thu; phần từng tháng đánh dấu đã thu khi phát hành hóa đơn kỳ đó', body: `<div class="form-grid">
              ${U.field({ label: 'Số tháng', name: 'months', input: U.select({ name: 'months', value: '', options: [['', 'Không chia'], ['2', '2 tháng'], ['3', '3 tháng'], ['6', '6 tháng'], ['12', '12 tháng']] }) })}
              ${U.field({ label: 'Từ kỳ', name: 'fromPeriod', input: U.select({ name: 'fromPeriod', value: F.nextPeriod(S.meta.period), options: [S.meta.period, F.nextPeriod(S.meta.period), F.nextPeriod(F.nextPeriod(S.meta.period))].map(x => [x, F.periodLabel(x)]) }) })}
              <div class="span2 small muted" id="ppv"></div></div>` }) : ''}
            <button class="btn btn-primary btn-block" type="submit">Lưu phiếu thu</button></div></form>`;
      U.onInput(root); U.bindDropzones(root);
      const ppv = () => { const el = root.querySelector('#ppv'); if (!el) return; const m = Number(root.querySelector('[name=months]').value); if (!m) { el.innerHTML = ''; return; } const amt = F.num(root.querySelector('[name=amount]').value) - [...root.querySelectorAll('[data-inv]')].reduce((s, e) => s + F.num(e.value), 0); const from = root.querySelector('[name=fromPeriod]').value; const rent = (Q.rateOf(stay.id, from + '-01') || {}).rent || stay.rent; const sp = TH.calc.payments.prepaySplit(Math.max(0, amt), rent, m); el.innerHTML = 'Chia theo tiền phòng ' + F.vnd(rent) + '/tháng: ' + sp.parts.map(x => F.periodShort(F.addMonths(from + '-01', x.index).slice(0, 7)) + ' ' + F.vnd(x.amount)).join(' · ') + (sp.unallocated > 0.5 ? ' · dư ' + F.vnd(sp.unallocated) + ' chưa phân bổ' : ''); };
      const recalc = () => { ppv(); const amt = F.num(root.querySelector('[name=amount]').value); const al = [...root.querySelectorAll('[data-inv]')].reduce((s, e) => s + F.num(e.value), 0); const el = root.querySelector('#sum'); if (el) el.innerHTML = `<div class="it"><span>Số tiền</span><b>${F.vnd(amt)}</b></div><div class="it"><span>Đã phân bổ</span><b>${F.vnd(al)}</b></div><div class="it"><span>Chưa phân bổ (trả trước)</span><b class="${al > amt ? 'red' : ''}">${F.vnd(amt - al)}</b></div>${al > amt ? '<div class="small red">Tổng phân bổ vượt số tiền thu</div>' : ''}`; };
      root.addEventListener('input', recalc); root.addEventListener('change', recalc); recalc();
      U.bind(root, { fillinv: (el) => { root.querySelectorAll(`[data-inv="${el.dataset.i}"]`).forEach(x => { x.value = F.vnd(Math.round(Number(x.dataset.max))); }); recalc(); }, clrinv: (el) => { root.querySelectorAll(`[data-inv="${el.dataset.i}"]`).forEach(x => { x.value = '0'; }); recalc(); } });
      root.querySelector('[name=stayQ]').addEventListener('change', (e) => { const code = e.target.value.split(' – ')[0].trim(); const s = S.one('stays', x => x.code === code); if (s) { stay = s; TH.router.replaceQuery(Object.assign({}, q, { stay: s.id })); draw(); } });
      root.querySelector('#f').addEventListener('submit', (e) => {
        e.preventDefault(); if (!stay) return U.toast('err', 'Chọn khách / lượt thuê');
        const d = U.formData(root);
        const allocations = [...root.querySelectorAll('[data-inv]')].map(el => ({ invoiceId: el.dataset.inv, lineNo: el.dataset.line ? Number(el.dataset.line) : null, amount: F.num(el.value) }));
        const ev = U.dzFiles(root, 'ev')[0];
        const paymentData={ stayId: stay.id, type: d.type, amount: d.amount, receivedAt: d.receivedAt, method: d.method, accountId: d.accountId, receivedBy: d.receivedBy, reference: d.reference, allocations, months: d.months, fromPeriod: d.fromPeriod, evidence: ev ? ev.name : null };
        const pay = K.act(() => q.proposal ? X.confirmIntakePayment(q.proposal,paymentData) : X.recordPayment(paymentData));
        if (pay) { U.toast('ok', 'Đã ghi phiếu ' + pay.code, 'Chưa phân bổ: ' + F.vnd(pay.unallocated)); TH.go('#/billing/receipts/' + pay.id); }
      });
    };
    draw();
  });

  TH.router.handle('/billing/receipts/:id', (root, p) => {
    const x = S.get('payments', p.id); if (!x) { root.innerHTML = U.empty({ title: 'Không tìm thấy phiếu' }); return; }
    const s = Q.stay(x.stayId);
    TH.layout.crumb([{ label: 'Phiếu thu', href: '#/billing/receipts' }, { label: x.code }]);
    const open = (Q.invoicesByStay()[s.id] || []).filter(i => i.lifecycle !== 'draft' && Q.invState(i).remaining > 0);
    root.innerHTML = U.pageHead({ title: 'Phiếu thu ' + esc(x.code) + (x.status === 'reversed' ? ' ' + U.chip('Đã đảo', 'gray') : ''), back: '#/billing/receipts', sub: `<a href="#/stays/${s.id}">${esc(Q.stayLabel(s))}</a> · Phòng ${esc(Q.roomCode(s.roomId))}`, acts: [
      x.unallocated > 0 && x.type !== 'deposit' && open.length && x.status !== 'reversed' ? U.btn({ label: 'Phân bổ số dư', icon: 'split', cls: 'btn-primary', act: 'alloc', perm: 'payments.record' }) : '',
      x.status !== 'reversed' ? U.btn({ label: 'Đảo phiếu', icon: 'undo', act: 'rev', perm: 'payments.reverse' }) : ''] })
      + `<div class="two-col"><div class="side-stack">${U.card({ title: 'Phân bổ', icon: 'split', body: `<table class="tbl compact"><thead><tr><th>Hóa đơn</th><th>Kỳ</th><th>Dòng</th><th class="num">Phân bổ</th><th class="num">Hóa đơn còn</th><th>Trạng thái</th></tr></thead><tbody>
        ${x.allocations.map(a => { const i = Q.invoice(a.invoiceId); const st = Q.invState(i); return `<tr><td><a href="#/billing/invoices/${i.id}">${esc(i.code)}</a></td><td>${F.periodShort(i.period)}</td><td>${a.lineNo ? a.lineNo + '. ' + esc(TH.calc.billing.lineDef(a.lineNo).label) : '<span class="muted">cả hóa đơn</span>'}</td><td class="num">${F.vnd(a.amount)}</td><td class="num">${F.vnd(st.remaining)}</td><td>${K.payChip(st.status)}</td></tr>`; }).join('') || '<tr><td colspan="6" class="muted">Chưa phân bổ</td></tr>'}
        </tbody></table>${x.unallocated ? U.note('info', 'Chưa phân bổ ' + F.vndd(x.unallocated), x.type === 'deposit' ? 'Tiền cọc giữ phòng – ghi sổ cọc; phân bổ vào dòng cọc của hóa đơn đầu tiên khi phát hành.' : 'Trả trước – phân bổ khi có hóa đơn kỳ sau (tiền chỉ xuất hiện một lần tại ngày thu).') : ''}` })}
        ${(x.prepayPlan || []).length ? U.card({ title: 'Kế hoạch trả trước theo kỳ', icon: 'calendar', sub: 'Tự áp vào hóa đơn khi phát hành kỳ tương ứng', body: `<table class="tbl compact"><thead><tr><th>Kỳ</th><th class="num">Phần của kỳ</th><th class="num">Đã áp</th><th class="num">Còn</th><th>Hóa đơn</th></tr></thead><tbody>${x.prepayPlan.map(pp => `<tr><td>${F.periodShort(pp.period)}</td><td class="num">${F.vnd(pp.amount)}</td><td class="num">${F.vnd(pp.applied || 0)}</td><td class="num">${F.vnd(pp.amount - (pp.applied || 0))}</td><td>${pp.invoiceId ? `<a href="#/billing/invoices/${pp.invoiceId}">${esc((Q.invoice(pp.invoiceId) || {}).code || '')}</a>` : '<span class="muted">chờ phát hành</span>'}</td></tr>`).join('')}</tbody></table>` }) : ''}</div>
      <div class="side-stack">${U.card({ title: 'Thông tin phiếu', icon: 'receipt', body: U.kv([['Loại', TYPE[x.type]], ['Số tiền', '<b>' + F.vndd(x.amount) + '</b>'], ['Bằng chữ', esc(F.words(x.amount))], ['Ngày thực nhận', F.date(x.receivedAt)], ['Ngày nhập', F.date(x.enteredAt)], ['Phương thức', x.method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'],
        ['TK/quỹ nhận', esc(((Q.account(x.accountId) || {}).bank || 'Quỹ') + ' ' + ((Q.account(x.accountId) || {}).number || ''))], ['Người thực nhận', esc(x.receivedBy || '')], ['Người ghi', esc(x.recordedBy || '')], ['Tham chiếu', esc(x.reference || '')], ['Chứng từ', esc(x.evidence || '–')],
        ...(x.status === 'reversed' ? [['Đảo phiếu', F.datetime(x.reversedAt) + ' – ' + esc(x.reverseReason)]] : [])]) })}</div></div>`;
    U.bind(root, {
      rev: () => K.formDrawer({ title: 'Đảo phiếu ' + x.code, modal: true, size: 'sm', fields: [{ name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Đảo phiếu', onSubmit: (d) => { X.reversePayment(x.id, d.reason); U.toast('ok', 'Đã đảo phiếu'); } }),
      alloc: () => { const rows = open.flatMap(i => Q.lineState(i).filter(l => l.remaining > 0.5).map(l => ({ i, l }))); let left = x.unallocated;
        K.formDrawer({ title: 'Phân bổ số dư ' + F.vndd(x.unallocated), sub: 'Theo từng dòng hóa đơn – kế toán chọn', modal: true, wide: true, fields: rows.map(({ i, l }) => { const v = Math.max(0, Math.min(left, Math.round(l.remaining))); left -= v; return { name: 'a_' + i.id + '_' + l.no, label: `${F.periodShort(i.period)} · ${l.no}. ${l.label} – còn ${F.vnd(l.remaining)}`, type: 'money', value: v }; }),
          submit: 'Phân bổ', onSubmit: (d) => { X.allocatePayment(x.id, rows.map(({ i, l }) => ({ invoiceId: i.id, lineNo: l.no, amount: F.num(d['a_' + i.id + '_' + l.no]) }))); U.toast('ok', 'Đã phân bổ'); } }); },
    });
  });
})(window.TH);
