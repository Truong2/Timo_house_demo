/* UI-31 Cổ đông & tỷ lệ góp theo tòa (E24 tổng tỷ lệ ≠ 100% chặn khóa) · UI-32 Bảng kê chia lãi theo tòa (G1 – SRC-07).
   Chỉ admin / kế toán. Tổng nhận M là số phải chia, không phải khoản chi (chi thực cho cổ đông ở UI-33 – Phase 3). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc;
  const pct = (v) => String(Math.round(v * 100) / 100).replace('.', ',') + '%';
  const dec = (v, d = 2) => v == null ? '–' : Number(v).toLocaleString('vi-VN', { maximumFractionDigits: d });
  TH.router.handle('/shares', (root, p, q) => {
    const blds = Q.shareBuildings();
    const bid = q.building || (blds[0] || {}).id;
    const date = q.date || F.today();
    const ratios = bid ? Q.shareRatios(bid, date) : [];
    const v = TH.calc.share.valid(ratios);
    const shx = q.sh && Q.shareholder(q.sh) ? { sh: Q.shareholder(q.sh), rows: S.all('buildings').map(bb => ({ b: bb, r: Q.shareRatios(bb.id, date).find(x => x.shareholderId === q.sh) })).filter(x => x.r) } : null;
    const hist = bid ? S.where('shareRatios', r => r.buildingId === bid).sort((a, b) => String(b.from).localeCompare(String(a.from))) : [];
    root.innerHTML = U.pageHead({ title: 'Cổ đông & tỷ lệ góp', sub: 'Nhà đầu tư – tòa nhiều-nhiều; tỷ lệ nhập tay có ngày hiệu lực (CH-30); tổng tỷ lệ tòa phải đủ 100% trước khi khóa bảng kê chia', acts: [U.btn({ label: 'Thêm cổ đông', icon: 'user-plus', act: 'addsh', perm: 'shares.manage' }), U.btn({ label: 'Sửa tỷ lệ', icon: 'percent', cls: 'btn-primary', act: 'ratio', perm: 'shares.manage' })] })
      + K.filters([{ name: 'building', label: 'Tòa', options: [...blds.map(b => [b.id, b.code]), ...S.all('buildings').filter(b => !blds.includes(b)).map(b => [b.id, b.code + ' (chưa có tỷ lệ)'])], value: bid, all: false }, { name: 'date', label: 'Tại ngày', type: 'date', value: F.today() }, { name: 'sh', label: 'Xem theo cổ đông', options: S.all('shareholders').map(x => [x.id, x.code + ' · ' + x.name]) }], q)
      + `<div class="grid grid-3 mt16">${U.kpi({ label: 'Số cổ đông của tòa', value: ratios.length, cap: blds.length + ' tòa đã có tỷ lệ', icon: 'users', tone: 'blue' })}${U.kpi({ label: 'Tổng tỷ lệ', value: pct(v.sum), cap: v.ok ? 'đủ 100% – khóa được bảng kê' : 'chưa đủ 100% – không khóa được (E24)', icon: 'percent', tone: v.ok ? 'green' : 'red' })}
        ${U.kpi({ label: 'Bảng kê đã khóa', value: S.where('shareRuns', r => r.buildingId === bid).length, cap: bid ? `<a href="#/shares/${bid}">Mở bảng kê chia</a>` : '', icon: 'lock', tone: 'purple' })}</div>`
      + (!v.ok && ratios.length ? U.note('danger', `Tổng tỷ lệ tòa ${esc((Q.building(bid) || {}).code)} = ${pct(v.sum)}`, 'Phải đủ 100% mới khóa được bảng kê chia (E24). Sửa tỷ lệ với ngày hiệu lực mới.') : '')
      + (shx ? '<div class="mt16">' + U.card({ title: 'Tòa tham gia – ' + esc(shx.sh.code + ' · ' + shx.sh.name), sub: 'Liên hệ: ' + esc(shx.sh.phone || '–') + ' · Tài khoản nhận: ' + esc(shx.sh.bank || '–') + ' (chỉ admin / kế toán)', bodyCls: 'flush',
          body: shx.rows.length ? `<table class="tbl compact"><thead><tr><th>Tòa</th><th class="num">Tỷ lệ</th><th>Hiệu lực từ</th><th></th></tr></thead><tbody>${shx.rows.map(x => `<tr><td><b>${esc(x.b.code)}</b></td><td class="num">${pct(x.r.pct)}</td><td>${F.date(x.r.from)}</td><td><a href="#/shares/${x.b.id}">Bảng kê chia</a></td></tr>`).join('')}</tbody></table>` : U.empty({ title: 'Không tham gia tòa nào tại ngày này' }) }) + '</div>' : '')
      + `<div class="grid grid-2 mt16"><div>${K.tableCard('t', 'Tỷ lệ góp hiệu lực ' + F.date(date))}</div><div>${K.tableCard('h', 'Lịch sử tỷ lệ')}</div></div>`;
    K.bindFilters(root);
    U.table(root.querySelector('#t'), { rows: ratios, noPager: true, empty: U.empty({ icon: 'percent', title: 'Tòa chưa có tỷ lệ góp', text: 'Bấm "Sửa tỷ lệ" để nhập.' }), cols: [
      { key: 'c', label: 'Mã', render: r => esc((Q.shareholder(r.shareholderId) || {}).code) }, { key: 'n', label: 'Nhà đầu tư', render: r => { const sh = Q.shareholder(r.shareholderId) || {}; return esc(sh.name) + (sh.common ? ' ' + U.chip('nhận chênh làm tròn', 'blue') : ''); } },
      { key: 'p', label: 'Tỷ lệ', num: true, render: r => `<b>${pct(r.pct)}</b>` }, { key: 'f', label: 'Hiệu lực từ', render: r => F.date(r.from) }],
      footer: () => `<tr><td></td><td><b>Tổng</b></td><td class="num"><b class="${v.ok ? 'green' : 'red'}">${pct(v.sum)}</b></td><td></td></tr>` });
    U.table(root.querySelector('#h'), { rows: hist, pageSize: 12, cols: [{ key: 'n', label: 'Cổ đông', render: r => esc((Q.shareholder(r.shareholderId) || {}).name) }, { key: 'p', label: 'Tỷ lệ', num: true, render: r => pct(r.pct) }, { key: 'f', label: 'Từ', render: r => F.date(r.from) }, { key: 't', label: 'Đến', render: r => r.to ? F.date(r.to) : 'hiện tại' }, { key: 'r', label: 'Căn cứ', render: r => `<span class="small muted">${esc(r.reason || '')}</span>` }] });
    U.bind(root, {
      addsh: () => K.formDrawer({ title: 'Thêm cổ đông / nhà đầu tư', modal: true, fields: [{ name: 'name', label: 'Tên', req: true }, { name: 'phone', label: 'Liên hệ' }, { name: 'bank', label: 'Tài khoản nhận' }, { name: 'note', label: 'Ghi chú', span: true }], submit: 'Lưu', onSubmit: (x) => { X.addShareholder(x); U.toast('ok', 'Đã thêm cổ đông'); } }),
      ratio: () => {
        const cur = {}; ratios.forEach(r => { cur[r.shareholderId] = r.pct; });
        K.formDrawer({ title: 'Tỷ lệ góp – tòa ' + esc((Q.building(bid) || {}).code), wide: true, note: U.note('info', '', 'Nhập % cho từng cổ đông (để trống = không góp). Lưu được khi chưa đủ 100% nhưng không khóa được bảng kê.'),
          fields: [...S.all('shareholders').map(sh => ({ name: 'p_' + sh.id, label: sh.code + ' · ' + sh.name, type: 'number', value: cur[sh.id] || '' })), { name: 'from', label: 'Hiệu lực từ', type: 'date', value: F.today(), req: true }, { name: 'reason', label: 'Căn cứ / lý do', req: true, span: true }],
          submit: 'Lưu tỷ lệ', onSubmit: (x) => { const rows = S.all('shareholders').map(sh => ({ shareholderId: sh.id, pct: F.num(x['p_' + sh.id]) })); const r = X.setShareRatios(bid, rows, x.from, x.reason); U.toast(r.ok ? 'ok' : 'warn', 'Đã lưu tỷ lệ', 'Tổng ' + pct(r.sum) + (r.ok ? '' : ' – chưa đủ 100%')); } });
      },
    });
  });

  TH.router.handle('/shares/:id', (root, p, q) => {
    const b = Q.building(p.id); if (!b) { root.innerHTML = U.card({ body: U.empty({ title: 'Không tìm thấy tòa' }) }); return; }
    const period = q.period || '2026-08'; const source = q.source === 'excel' ? 'excel' : 'web';
    TH.layout.crumb([{ label: 'Cổ đông', href: '#/shares?building=' + b.id }, { label: 'Bảng kê chia ' + b.code }]);
    const run = Q.shareRun(b.id, period, source); const vari = run && run.locked ? null : Q.shareVariance(b.id, period);
    const relock = run && run.locked && Q.shareRelockable(b.id, period);
    const excelAvail = !!Q.shareBase(b.id, period, 'excel');
    const drill = '#/reports/buildings?period=' + period + '&group=' + b.group + '&building=' + b.id; // C22 / C73 / C74 → báo cáo tòa UI-28
    root.innerHTML = U.pageHead({ title: 'Bảng kê chia lãi – tòa ' + esc(b.code), back: '#/shares?building=' + b.id, sub: 'Cơ sở luôn là Báo cáo tổng của tòa (doanh thu gồm cọc mới); lấy số theo mã chỉ tiêu, không theo địa chỉ ô · làm tròn từng dòng, chênh dồn CHUNG (OQ-08)',
      acts: [U.btn({ label: 'Xuất Excel', icon: 'download', act: 'exp' }), run && source === 'web' && (!run.locked ? Q.shareLockable(period) : relock) ? U.btn({ label: run.locked ? 'Khóa phiên mới' : 'Khóa bảng kê', icon: 'lock', cls: 'btn-primary', act: 'lock', perm: 'shares.lock' }) : ''] })
      + K.filters([{ name: 'period', label: 'Kỳ', options: S.all('periods').map(x => [x.id, F.periodLabel(x.id)]), value: '2026-08', all: false }, { name: 'source', label: 'Nguồn số', options: [['web', 'Báo cáo tổng tòa (web)'], ...(excelAvail ? [['excel', 'Như Excel SRC-07 (đối chiếu)']] : [])], value: 'web', all: false }], q)
      + (!run ? U.card({ body: U.empty({ title: 'Chưa có số báo cáo tòa kỳ này' }) }) : `<div class="mt16"></div>`
        + (relock ? U.note('warn', 'Kỳ báo cáo đã mở lại sau lần khóa bảng kê phiên ' + (run.version || 1), 'Bảng kê đang hiện là ảnh chụp cũ – khóa phiên mới sau khi kỳ được khóa lại để lấy số báo cáo mới.') : '')
        + (!run.locked && source === 'web' && !Q.shareLockable(period) ? U.note('info', 'Kỳ ' + F.periodShort(period) + ' chưa khóa số báo cáo', 'Đây là số tính thử; khóa kỳ ở UI-38 rồi mới khóa bảng kê.') : '')
        + (run.locked ? U.note('ok', 'Đã khóa ' + F.datetime(run.lockedAt) + ' – ' + esc(run.lockedBy) + (run.version > 1 ? ' (phiên ' + run.version + ')' : ''), 'Ảnh chụp số tại thời điểm khóa; sửa tỷ lệ sau đó không làm đổi bảng kê này.') : !run.valid.ok ? U.note('danger', 'Tổng tỷ lệ = ' + pct(run.valid.sum), 'Không khóa được bảng kê (E24) – sửa tỷ lệ ở UI-31.') : U.note('info', 'Tính thử', 'Bảng kê chưa khóa – số theo tỷ lệ hiệu lực cuối kỳ ' + F.date(TH.calc.dates.periodEnd(period)) + '.'))
        + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Vốn (tiền thuê 1 tháng – dòng 20)', value: U.link(drill, F.vnd(run.base.rent)), icon: 'building', tone: 'blue' })}${U.kpi({ label: 'LN gộp (dòng 45)', value: U.link(drill, dec(run.base.lng)), icon: 'trending-up', tone: 'green' })}
          ${U.kpi({ label: 'LN ròng (dòng 46)', value: U.link(drill, dec(run.base.lnr)), cap: run.base.src ? esc(run.base.src) : '', icon: 'wallet', tone: 'purple' })}${U.kpi({ label: 'Σ Tổng nhận (M = H + J)', value: F.vnd(run.totals.M), cap: 'LNR/GV ' + dec(run.K) + ' · CP/LNG ' + dec(run.L, 4), icon: 'hand-coins', tone: 'amber' })}</div>`
        + K.tableCard('t', 'Bảng kê chia – ' + F.periodLabel(period) + (source === 'excel' ? ' (như Excel)' : ''))
        + (vari && source === 'web' ? U.note('warn', 'Chênh so với bảng kê Excel SRC-07 (K-9)', `Vốn ${F.vnd(vari.rent)} · LNG ${dec(vari.lng)} · LNR <b>${dec(vari.lnr)}</b>đ. Ô C43 của file G1 dùng mẫu số 1.343 thay vì 1.382 cho lương sửa chữa (GĐ OQ-04): 25.000.000 × 15 / 1.343 − 25.000.000 × 15 / 1.382 = ${dec(vari.oq04)}đ; phần còn lại ${dec(vari.lnr - vari.oq04)}đ là sai số làm tròn của các ô liên kết ngoài.`) : ''));
    K.bindFilters(root);
    if (run) U.table(root.querySelector('#t'), { rows: run.rows, noPager: true, cols: [{ key: 'n', label: 'Cổ đông', render: r => { const sh = Q.shareholder(r.id) || {}; return esc(sh.code + ' · ' + sh.name) + (r.common && run.rounding && (run.rounding.I || run.rounding.J || run.rounding.H) ? ` <small class="muted">(+ chênh làm tròn: H ${run.rounding.H}, I ${run.rounding.I}, J ${run.rounding.J})</small>` : ''); } },
      { key: 'g', label: 'G – Tỷ lệ', num: true, render: r => pct(r.pct) }, { key: 'h', label: 'H – Vốn', num: true, render: r => F.vnd(r.H) }, { key: 'i', label: 'I – LN gộp', num: true, render: r => F.vnd(r.I) }, { key: 'j', label: 'J – LN ròng', num: true, render: r => F.vnd(r.J) }, { key: 'm', label: 'M – Tổng nhận', num: true, render: r => `<b>${F.vnd(r.M)}</b>` }],
      footer: () => `<tr><td><b>Tổng</b></td><td class="num"><b>${pct(run.totals.pct)}</b></td><td class="num"><b>${F.vnd(run.totals.H)}</b></td><td class="num"><b>${F.vnd(run.totals.I)}</b></td><td class="num"><b>${F.vnd(run.totals.J)}</b></td><td class="num"><b>${F.vnd(run.totals.M)}</b></td></tr>` });
    U.bind(root, {
      lock: () => K.act(() => X.lockShareRun(b.id, period, source), 'Đã khóa bảng kê'),
      exp: () => run && K.xls('chia-co-dong-' + b.code + '-' + period + '.xls', 'Chia ' + b.code, ['Bảng kê chia lãi ' + b.code + ' – ' + F.periodLabel(period), ['Nguồn', run.base.src || source], ['Trạng thái', run.locked ? 'Đã khóa ' + F.datetime(run.lockedAt) : 'Tính thử'], ['Ghi chú', 'M là số phải chia, không phải khoản chi']],
        ['Cổ đông', 'G %', 'H Vốn', 'I LN gộp', 'J LN ròng', 'M Tổng nhận'], [...run.rows.map(r => [(Q.shareholder(r.id) || {}).name, r.pct, r.H, r.I, r.J, r.M]), ['Tổng', run.totals.pct, run.totals.H, run.totals.I, run.totals.J, run.totals.M], ['Chênh làm tròn dồn CHUNG (OQ-08)', '', (run.rounding || {}).H || 0, (run.rounding || {}).I || 0, (run.rounding || {}).J || 0, '']]),
    });
  });
})(window.TH);
