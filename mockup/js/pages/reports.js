/* UI-27 Báo cáo (2 báo cáo) · UI-29 Báo cáo tổng (LN dòng tiền) · UI-30 Báo cáo kinh doanh + cầu nối · UI-28 Báo cáo theo tòa (mỗi cột một tòa). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, esc = F.esc, CAT = () => TH.data.catalog;
  const fmt = (l, v) => v == null ? '–' : l.ratio ? (l.times ? F.dec(v, 2) : F.pctv(v, 2)) : l.count ? F.num0(v) : F.vnd(v);
  const periods = () => S.all('periods').filter(p => p.id <= S.meta.period).map(p => [p.id, F.periodLabel(p.id) + (p.source === 'excel_parallel' ? ' (song song Excel)' : '')]);
  // Lọc quản lý theo người phụ trách tại cuối kỳ báo cáo (phân công có hiệu lực), không theo hôm nay
  const scopeFilter = (q) => {
    const mm = Q.managerMap(TH.calc.dates.periodEnd(q.period || '2026-08'));
    return (bid) => { const b = Q.building(bid); if (!b) return !q.area && !q.manager && !q.building && !TH.auth.buildingScope(); if (!TH.auth.inScope(bid)) return false; if (q.area && b.areaId !== q.area) return false; if (q.manager && (mm[bid] || {}).id !== q.manager) return false; if (q.building && bid !== q.building) return false; return true; };
  };
  const filterRep = (rep, q) => {
    const ok = scopeFilter(q); const sub = {}; Object.entries(rep.byBuilding).forEach(([b, v]) => { if (ok(b)) sub[b] = v; });
    const filtered = !!(q.area || q.manager || q.building || TH.auth.buildingScope());
    return { cols: filtered ? TH.calc.report.aggregate(sub, b => (Q.building(b) || {}).group) : rep.cols, sub, filtered };
  };
  const filterBar = (q, extra = []) => K.filters([{ name: 'period', label: 'Kỳ', options: periods(), value: '2026-08', all: false }, ...extra, { name: 'area', label: 'Khu vực', options: K.areaOpts() }, ...(TH.auth.role() === 'codong' ? [] : [{ name: 'manager', label: 'Quản lý', options: K.managerOpts() }]), { name: 'building', label: 'Tòa', options: K.buildingOpts() }], q);
  /* Phase 2 thêm các báo cáo vận hành / kinh doanh (UI-42 → UI-46) khi đã mở mốc 2 và có quyền reports.ops */
  const P2TABS = [['costs', 'Chi phí', '#/reports/costs'], ['amduong', 'Âm dương', '#/reports/amduong'], ['repairs', 'Sửa chữa', '#/reports/repairs'], ['rooms', 'Phòng vận hành', '#/reports/rooms'], ['sales', 'Khách & doanh số', '#/reports/sales']];
  TH.pages.reportTabs = (cur) => `<div class="subnav">${[['hub', 'Báo cáo', '#/reports'], ['total', 'Báo cáo tổng', '#/reports/total'], ['business', 'Báo cáo kinh doanh', '#/reports/business'], ['buildings', 'Báo cáo theo tòa', '#/reports/buildings'],
    ...(TH.ms.on('2') && TH.auth.can('reports.ops') ? P2TABS : []),
    ...(TH.ms.on('3') && TH.auth.can('forecast.view') ? [['forecast', 'Dự kiến LN', '#/reports/forecast']] : []),
    ...(TH.ms.on('3') && TH.auth.can('efficiency.view') ? [['efficiency', 'Hiệu quả vốn', '#/reports/efficiency']] : [])].map(([k, l, h]) => `<a class="${k === cur ? 'on' : ''}" href="${h}${keepQ(h)}">${l}</a>`).join('')}</div>`;
  /* Giữ bộ lọc chung (kỳ, khu vực, nhóm, quản lý, tòa) khi chuyển giữa các báo cáo (đặc tả UI-27) */
  const keepQ = (h) => { const qq = (TH.router.parse ? TH.router.parse().query : {}) || {}; const p = ['period', 'area', 'group', 'manager', 'building'].filter(k => qq[k]).map(k => k + '=' + encodeURIComponent(qq[k])).join('&'); return p ? (h.includes('?') ? '&' : '?') + p : ''; };

  TH.router.handle('/reports', (root, p, q) => {
    const period = q.period || '2026-08';
    if (TH.auth.role() === 'codong') {
      const total = filterRep(TH.qr.get(period, 'total'), q).cols.TOTAL, biz = filterRep(TH.qr.get(period, 'business'), q).cols.TOTAL;
      root.innerHTML = TH.pages.reportTabs('hub') + U.pageHead({ title: 'Báo cáo tòa góp vốn của tôi', sub: 'Chỉ số trong phạm vi cổ phần hiệu lực' }) + filterBar(q)
        + '<div class="grid grid-2 mt16">' + [['total', 'Báo cáo tổng', total], ['business', 'Báo cáo kinh doanh', biz]].map(([k, label, v]) => U.card({ title: label, body: '<p>DT ' + F.vnd(v.rev_total) + ' · TCP ' + F.vnd(v.tcp) + ' · LNR ' + F.vnd(v.lnr) + '</p><a href="#/reports/' + k + '?period=' + period + '">Mở báo cáo</a>' })).join('') + '</div><div class="mt16"><a class="btn btn-primary" href="#/reports/efficiency?period=' + period + '">Hiệu quả vốn / tài sản UI-41</a></div>'; K.bindFilters(root); return;
    }
    const t = TH.qr.get(period, 'total'), bz = TH.qr.get(period, 'business');
    root.innerHTML = TH.pages.reportTabs('hub') + U.pageHead({ title: 'Báo cáo', sub: 'Phase 1 gồm 2 báo cáo theo mẫu SRC-04 và báo cáo theo tòa; các báo cáo vận hành/kinh doanh khác ở Phase 2–3' })
      + filterBar(q)
      + `<div class="grid grid-2 mt16">${[['total', 'Báo cáo tổng (LN dòng tiền)', 'Lợi nhuận kinh doanh thực thu – gồm cọc mới và mua sắm thiết bị (hạch toán một lần)', t.cols.TOTAL], ['business', 'Báo cáo kinh doanh', 'Không gồm cọc mới, hoàn cọc, mua sắm thiết bị; thiết bị theo khấu hao 1,6%/tháng (GĐ OQ-10/11)', bz.cols.TOTAL]].map(([k, title, sub, v]) => `
        <a class="card rep-card" href="#/reports/${k}?period=${period}"><div class="card-b"><h3>${esc(title)}</h3><p class="small muted mt4">${esc(sub)}</p>
        <div class="grid grid-3 mt12"><div><small class="muted">Doanh thu</small><b class="d-block">${F.vnd(v.rev_total)}</b></div><div><small class="muted">Tổng chi phí</small><b class="d-block">${F.vnd(v.tcp)}</b></div><div><small class="muted">LN ròng</small><b class="d-block ${v.lnr >= 0 ? 'green' : 'red'}">${F.vnd(v.lnr)}</b></div></div>
        <div class="mt12 small muted">Tỷ lệ LNR/DT ${F.pctv(v.r_lnr_dt)} · LNR/GV ${F.pctv(v.r_lnr_gv)}</div></div></a>`).join('')}</div>`
      + `<div class="mt16">${U.card({ title: 'Nguồn số liệu kỳ ' + F.periodShort(period), icon: 'database', body: U.kv([['Doanh thu', esc(t.sources.revenue)], ['Lương quản lý', esc(t.sources.payroll)], ['Phân bổ chung', esc(t.sources.allocation)], ['Khấu hao kỳ (BC kinh doanh)', F.vndd(t.dep.total) + ' · ' + t.dep.detail.length + ' thiết bị']]) + (t.parallel ? U.note('info', 'Kỳ chạy song song Excel', 'Tháng 08/2026 chưa có hóa đơn trên web: doanh thu lấy từ SRC-04; chi phí lấy từ chi phí ghi trên web + bảng lương + phân bổ tính trên web. Báo cáo hiện cột Excel và chênh lệch để giải thích trước khi bỏ file.') : '') })}</div>`;
    // Phase 2: trung tâm báo cáo 4 nhóm (UI-27 đầy đủ) – thẻ có công thức, kỳ dữ liệu mới nhất, trạng thái
    if (TH.ms.on('2') && TH.pages.reportHubP2) { root.querySelector('.page-head .sub') && (root.querySelector('.page-head .sub').textContent = 'Trung tâm báo cáo 4 nhóm: kết quả kinh doanh, vận hành, kinh doanh, theo tòa · không gộp Báo cáo tổng và Báo cáo kinh doanh thành một số LN'); root.insertAdjacentHTML('beforeend', TH.pages.reportHubP2()); }
    K.bindFilters(root, []);
  });

  /* Bảng báo cáo dạng mẫu: hàng = dòng 3–61, cột TỔNG / NHÀ T / S / G (+ Excel/chênh lệch) */
  const reportTable = (rep, cols, compare, clickable) => {
    const heads = [['TOTAL', 'TỔNG'], ['T', 'NHÀ T'], ['S', 'NHÀ S'], ['G', 'NHÀ G']];
    let lastGroup = null;
    return `<div class="rpt-wrap"><table class="rpt"><thead><tr><th>Dòng</th><th>Chỉ tiêu</th>${heads.map(([k, l]) => `<th>${l}</th>`).join('')}</tr></thead><tbody>
      ${CAT().reportLines.map(l => {
        let g = ''; if (l.group && l.group !== lastGroup) { lastGroup = l.group; g = `<tr class="grp"><td></td><td colspan="5">${esc(l.group)}</td></tr>`; }
        if (l.section === 'ratio' && lastGroup !== 'TỶ LỆ') { lastGroup = 'TỶ LỆ'; g = `<tr class="grp"><td></td><td colspan="5">TỶ LỆ</td></tr>`; }
        return g + `<tr class="${l.bold ? 'b' : ''} ${l.note || l.count ? 'note' : ''} ${l.ratio ? 'ratio' : ''}"><td>${l.row}</td><td>${esc(l.label)}${l.formula ? ` <span class="muted small">(${esc(l.formula)})</span>` : ''}</td>
          ${heads.map(([k]) => { const v = cols[k][l.code]; const x = compare && rep.excel && rep.excel[l.code] ? rep.excel[l.code][k] : null; const d = x != null && v != null && !l.ratio ? v - x : null;
            return `<td class="num ${clickable && TH.auth.can('reports.drill') && !l.ratio ? 'cell' : ''}" data-code="${l.code}" data-col="${k}">${fmt(l, v)}${x != null ? `<span class="diff ${d != null && Math.abs(d) > 1 ? 'bad' : 'ok'}">Excel ${fmt(l, x)}${d != null && Math.abs(d) > 1 ? ' · lệch ' + F.vnd(d) : ''}</span>` : ''}</td>`; }).join('')}</tr>`;
      }).join('')}</tbody></table></div>`;
  };
  /* Bấm số → giao dịch nguồn (UI-27/UI-28): theo tòa + từng hóa đơn/phiếu thu/phiếu hoàn/chứng từ/phân bổ/bảng lương/điều chỉnh, có link */
  const cellDrawer = (rep, sub, code, col, onlyB) => {
    TH.auth.need('reports.drill');
    const l = CAT().reportLines.find(x => x.code === code);
    const bids = Object.keys(sub).filter(b => onlyB ? b === onlyB : col === 'TOTAL' || (Q.building(b) || {}).group === col);
    const rows = bids.map(b => ({ b, v: (sub[b] || {})[code] || 0 })).filter(r => r.v).sort((a, c) => c.v - a.v);
    const src = TH.qr.sources(rep.period, code, bids);
    const txt = { rev_total: 'Σ số đã thu phân bổ vào hóa đơn kỳ + phiếu nhận cọc giữ phòng − hoàn cọc chi trong kỳ + cọc bỏ nhận trước go-live', dep_new: 'Dòng 2 hóa đơn (cọc trên hóa đơn đầu) + phiếu nhận cọc giữ phòng theo ngày nhận', rev_rent: 'Dòng 1 hóa đơn (không gồm phá HĐ); phòng mới theo tháng lẻ', rev_el: 'Dòng 3 + điện chung (dòng 12) + tiền điện trừ vào cọc', rev_clean: 'Dòng 5 + 1/2 combo', rev_wash: 'Dòng 9 + 1/2 combo', cost_rent: 'Giá HĐ chủ nhà hiệu lực trong kỳ (thuê 1 tháng)', sal_mgr: 'Bảng lương – W của NV vận hành theo tòa', cost_equip: rep.type === 'business' ? 'Khấu hao kỳ 1,6%/tháng cộng dồn' : 'Nguyên giá thiết bị mua trong kỳ' }[code];
    const alloc = TH.data.allocRules.find(r => r.lineCode === code);
    const groups = F.by(src.items, x => x.type);
    const scopeLbl = onlyB ? 'Tòa ' + (Q.building(onlyB) || {}).code : col === 'TOTAL' ? 'Tổng' : 'Nhà ' + col;
    const total = src.items.filter(x => !x.context && x.type !== 'Lượt thuê' && x.type !== 'Phòng trống').reduce((s, x) => s + x.amount, 0);
    const d = U.drawer({ title: `${l.row}. ${l.label}`, sub: `${rep.type === 'business' ? 'Báo cáo kinh doanh' : 'Báo cáo tổng'} · ${F.periodLabel(rep.period)} · ${scopeLbl}`, wide: true, body: `
      ${txt ? U.note('info', 'Cách tính', esc(txt)) : alloc ? U.note('info', 'Phân bổ', 'Quỹ chung / mẫu số × số phòng tòa · ' + esc(alloc.g1)) : ''}
      ${src.note ? U.note('warn', '', esc(src.note)) : ''}
      ${rep.type === 'business' && ['rev_total', 'cost_equip'].includes(code) ? U.note('info', 'Báo cáo kinh doanh', code === 'rev_total' ? 'Doanh thu KD = doanh thu dòng tiền − cọc mới + hoàn cọc (GĐ OQ-10); giao dịch bên dưới là của Báo cáo tổng.' : 'Khấu hao + thanh lý kỳ theo danh sách tài sản công ty UI-34 (số tháng từng tài sản); giao dịch bên dưới là nguyên giá mua.' + (TH.ms.on('3') ? ' <a href="#/assets?ownership=company">Mở UI-34</a>' : '')) : ''}
      ${src.parts ? `<h4 class="mt12 mb8">Dòng thành phần</h4>${src.parts.map(k => { const pl = CAT().reportLines.find(x => x.code === k); const v = bids.reduce((s, b) => s + ((sub[b] || {})[k] || 0), 0); return pl && v ? `<a class="mini-row" href="javascript:void 0" data-part="${k}"><span>${pl.row}. ${esc(pl.label)}</span><span class="grow"></span><b>${fmt(pl, v)}</b></a>` : ''; }).join('')}` : ''}
      ${!onlyB ? `<h4 class="mt12 mb8">Theo tòa (${rows.length})</h4>${rows.slice(0, 60).map(r => `<a class="mini-row" href="javascript:void 0" data-b="${r.b}"><b>${esc((Q.building(r.b) || {}).code)}</b><span class="grow"></span><span>${fmt(l, r.v)}</span></a>`).join('') || '<span class="muted small">Không có giá trị</span>'}` : ''}
      ${Object.entries(groups).map(([t, arr]) => `<h4 class="mt16 mb8">${esc(t)} (${arr.length})</h4>${arr.slice(0, 40).map(x => `<a class="mini-row" href="${x.href || 'javascript:void 0'}"><span class="code">${esc(x.label)}</span><span class="grow truncate small muted">${esc(x.sub || '')}</span><b>${x.type === 'Lượt thuê' || x.type === 'Phòng trống' ? '' : F.vnd(x.amount)}</b></a>`).join('')}${arr.length > 40 ? `<p class="small muted">… và ${arr.length - 40} dòng khác</p>` : ''}`).join('')}
      ${src.items.length && !l.count && !src.parts ? `<p class="small muted mt12">Tổng giao dịch liệt kê: <b>${F.vnd(total)}</b> · số trên báo cáo: <b>${fmt(l, rows.reduce((s, r) => s + r.v, 0))}</b></p>` : ''}
      ${!src.items.length && !src.parts && !rows.length ? U.empty({ title: 'Không có giao dịch nguồn' }) : ''}` });
    d.el.querySelectorAll('[data-b]').forEach(a => a.onclick = () => { d.close(); cellDrawer(rep, sub, code, col, a.dataset.b); });
    d.el.querySelectorAll('[data-part]').forEach(a => a.onclick = () => { d.close(); cellDrawer(rep, sub, a.dataset.part, col, onlyB); });
  };
  TH.pages.reportCellDrawer = cellDrawer;
  /* Thông tin bắt buộc trên file xuất (UI-27): tên báo cáo, kỳ, bộ lọc, phiên bản dữ liệu / thời điểm chốt, người xuất */
  const exportMeta = (rep, q, title) => {
    const f = [q.area && 'Khu vực ' + ((S.get('areas', q.area) || {}).name || q.area), q.manager && 'Quản lý ' + ((Q.emp(q.manager) || {}).name || q.manager), q.building && 'Tòa ' + ((Q.building(q.building) || {}).code || q.building), q.group && 'Nhà ' + q.group, TH.auth.buildingScope() && 'Phạm vi tài khoản ' + TH.auth.buildingScope().size + ' tòa', rep.type === 'business' && (rep.bizMode === 'excel' ? 'Cách tính: như sheet Excel KD' : 'Cách tính: giả định OQ-10')].filter(Boolean);
    return [title + ' – ' + F.periodLabel(rep.period), ['Mẫu', 'SRC-04 dòng 3–61, cột TỔNG / NHÀ T / NHÀ S / NHÀ G'], ['Bộ lọc', f.join('; ') || 'Toàn hệ thống'],
      ['Phiên bản số liệu', rep.frozen ? rep.sources.frozen : rep.parallel ? 'Kỳ chạy song song Excel – số tạm tính' : 'Số web tạm tính (kỳ chưa khóa)'], ['Xuất lúc', F.datetime(F.nowISO()) + ' · ' + ((S.session || {}).name || '')]];
  };
  const num = (l, v) => v == null ? '' : l.ratio ? Math.round(Number(v) * 10000) / 10000 : Math.round(v);
  const exportRep = (rep, cols, name, q) => K.xls(name, rep.type === 'business' ? 'BÁO CÁO KINH DOANH' : 'BÁO CÁO TỔNG', exportMeta(rep, q, rep.type === 'business' ? 'BÁO CÁO KINH DOANH' : 'BÁO CÁO TỔNG (LN DÒNG TIỀN)'),
    ['Dòng', 'Chỉ tiêu', 'TỔNG', 'NHÀ T', 'NHÀ S', 'NHÀ G'], CAT().reportLines.map(l => [l.row, l.label, ...['TOTAL', 'T', 'S', 'G'].map(k => num(l, cols[k][l.code]))]));

  const reportPage = (type) => (root, p, q) => {
    const period = q.period || '2026-08'; const mode = TH.auth.role() === 'codong' ? 'gd' : q.mode || 'gd';
    const rep = TH.qr.get(period, type, mode); const { cols, sub, filtered } = filterRep(rep, q);
    const compare = rep.parallel && !filtered && !(type === 'business' && mode === 'gd');
    const v = cols.TOTAL;
    const title = type === 'total' ? 'Báo cáo tổng (LN dòng tiền)' : 'Báo cáo kinh doanh';
    root.innerHTML = TH.pages.reportTabs(type) + U.pageHead({ title, sub: `${F.periodLabel(period)} · mẫu SRC-04 dòng 3–61 · ${rep.parallel ? 'kỳ chạy song song Excel' : 'số web'}${filtered ? ' · đã lọc phạm vi' : ''}`, acts: [
      U.btn({ label: 'Báo cáo theo tòa', icon: 'columns', href: `#/reports/buildings?period=${period}&type=${type}` }), U.btn({ label: 'Xuất Excel theo mẫu', icon: 'download', act: 'exp', perm: 'reports.export' })] })
      + filterBar(q, type === 'business' && TH.auth.role() !== 'codong' ? [{ name: 'mode', label: 'Cách tính', options: [['gd', 'Theo giả định OQ-10 (cộng lại hoàn cọc, có khấu hao)'], ['excel', 'Như sheet Excel KD (chỉ trừ cọc mới)']], value: 'gd', all: false }] : [])
      + `<div class="grid grid-4 mt16 mb16">${U.kpi({ label: 'Tổng doanh thu', value: F.vnd(v.rev_total), icon: 'trending-up', tone: 'blue' })}${U.kpi({ label: 'Tổng chi phí (TCP)', value: F.vnd(v.tcp), cap: 'Giá vốn ' + F.vnd(v.gv) + ' · CPBH ' + F.vnd(v.cpbh), icon: 'coins', tone: 'amber' })}
        ${U.kpi({ label: 'Lợi nhuận ròng (LNR)', value: F.vnd(v.lnr), cap: 'LNR/DT ' + F.pctv(v.r_lnr_dt), icon: 'bar-chart', tone: v.lnr >= 0 ? 'green' : 'red' })}${U.kpi({ label: 'LN gộp (LNG)', value: F.vnd(v.lng), cap: 'LNR/GV ' + F.pctv(v.r_lnr_gv), icon: 'pie-chart', tone: 'teal' })}</div>`
      + (rep.frozen ? U.note('info', 'Kỳ đã khóa', esc(rep.sources.frozen) + '. Thay đổi dữ liệu nguồn sau khóa không làm đổi số; sửa bằng "Điều chỉnh sau khóa" ở Cài đặt → Kỳ.') : '')
      + (type === 'business' ? bridgeCard(rep, cols, q) : '')
      + (type === 'total' && rep.parallel && !filtered ? reconcileCard(period) : '')
      + (compare ? U.note('info', 'So sánh với Excel', 'Mỗi ô hiện số Excel bên dưới; ô đỏ là chênh lệch. Doanh thu và giá vốn khớp; chênh lệch chi phí được tách từng nhóm ở thẻ "Đối chiếu tổng chi phí Web ↔ Excel".') : '')
      + `<div class="mt12">${reportTable(rep, cols, compare, TH.auth.can('reports.drill'))}</div>`;
    K.bindFilters(root, ['mode']);
    root.querySelectorAll('td.cell').forEach(td => td.onclick = () => cellDrawer(rep, sub, td.dataset.code, td.dataset.col));
    U.bind(root, { exp: () => exportRep(rep, cols, `bao-cao-${type}-${period}.xls`, q) });
  };
  /* Cầu nối tính trên cùng số web và cùng bộ lọc với ô KPI; số Excel chỉ để tham chiếu */
  const bridgeCard = (rep, cols, q) => {
    const tcols = filterRep(TH.qr.get(rep.period, 'total'), q).cols;
    const rows = TH.calc.report.bridge(tcols.TOTAL, cols.TOTAL);
    const eb = !TH.auth.buildingScope() && rep.excelBiz; const rc = eb && TH.qr.reconcile(rep.period);
    return U.card({ title: 'Cầu nối Báo cáo tổng → Báo cáo kinh doanh (số web)', icon: 'split', sub: 'GĐ OQ-10: cộng lại hoàn cọc, thiết bị theo khấu hao – sheet KD của Excel chỉ trừ cọc mới', body: `<table class="tbl compact bridge"><tbody>
      ${rows.map((r, i) => `<tr class="${i === 0 || i === rows.length - 1 ? 'b' : ''}"><td>${esc(r.label)}</td><td class="num"><b>${F.vnd(r.value)}</b></td></tr>`).join('')}
      ${eb ? `<tr class="grp"><td colspan="2">Tham chiếu số Excel tháng 8</td></tr>
      <tr><td class="muted">Sheet "BÁO CÁO KINH DOANH THÁNG 8" (Excel, chỉ trừ cọc mới): LNR</td><td class="num muted">${F.vnd(eb.sheet.lnr)}</td></tr>
      <tr><td class="muted">Giả định OQ-10 áp trên số Excel của Báo cáo tổng: LNR</td><td class="num muted">${F.vnd(eb.gd.lnr)}</td></tr>
      ${rc && rep.bizMode === 'gd' ? `<tr><td class="muted">Số web − số Excel theo OQ-10 = −(chênh tổng chi phí ${F.vnd(rc.diff)}, xem Đối chiếu ở Báo cáo tổng)</td><td class="num">${F.vnd(cols.TOTAL.lnr - eb.gd.lnr)}</td></tr>` : ''}` : ''}</tbody></table>` }) + '<div class="mt16"></div>';
  };
  const reconcileCard = (period) => {
    const rc = TH.qr.reconcile(period); if (!rc) return '';
    return U.card({ title: 'Đối chiếu tổng chi phí Web ↔ Excel ' + F.periodShort(period), icon: 'sliders', sub: 'Tách chênh lệch thành từng nhóm, đến từng ô tòa × dòng báo cáo', body: `<table class="tbl compact bridge"><tbody>
      <tr class="b"><td>Tổng chi phí web</td><td class="num">${F.vnd(rc.web)}</td></tr><tr><td>Tổng chi phí Excel (sheet BÁO CÁO TỔNG)</td><td class="num">${F.vnd(rc.excel)}</td></tr>
      <tr class="b"><td>Chênh lệch</td><td class="num">${F.vnd(rc.diff)}</td></tr>
      ${rc.items.map(i => `<tr><td>${esc(i.label)}${i.needsDecision ? ' ' + U.chip('Cần khách chốt', 'amber') : ''}${i.expected != null ? `<div class="small muted">Tổng chênh W của các dòng này trong bảng lương: ${F.vnd(i.expected)}</div>` : ''}</td><td class="num">${F.vnd(i.amount)}</td></tr>`).join('')}
      <tr class="b"><td>Còn lại chưa giải thích</td><td class="num">${F.dec(rc.residual, 2)}</td></tr></tbody></table>
      ${U.note('warn', 'Số nghiệm thu SRS', 'SRS ghi tổng chi phí 6.013.857.267 / LNR 1.022.398.969 là số của sheet Excel. Số web chỉ bằng số này khi khách chốt loại các tòa trên khỏi kỳ 8 và xác nhận các ô phân bổ khác công thức là lỗi nguồn.')}` }) + '<div class="mt16"></div>';
  };
  TH.router.handle('/reports/total', reportPage('total'));
  TH.router.handle('/reports/business', reportPage('business'));

  TH.router.handle('/reports/buildings', (root, p, q) => {
    const period = q.period || '2026-08'; const type = q.type || 'total'; const group = q.group || 'G';
    const rep = TH.qr.get(period, type, TH.auth.role() === 'codong' ? 'gd' : q.mode || 'gd');
    const ok = scopeFilter(q);
    const code = (b) => (Q.building(b) || {}).code || b.slice(2);
    const bids = Object.keys(rep.byBuilding).filter(b => ((Q.building(b) || {}).group || TH.f.groupOf(b.slice(2))) === group && ok(b)).sort((a, b) => { const x = code(a), y = code(b); return x.length - y.length || x.localeCompare(y, 'vi', { numeric: true }); });
    const groupCol = TH.calc.report.aggregate(Object.fromEntries(bids.map(b => [b, rep.byBuilding[b]])), () => group)[group];
    const bench = {}; S.all('benchLines').filter(x => x.period === period).forEach(x => { (bench[x.buildingId] = bench[x.buildingId] || {})[x.code] = x.value; });
    const cmpRow = q.cmp === '1' && rep.parallel && !TH.auth.buildingScope();
    root.innerHTML = TH.pages.reportTabs('buildings') + U.pageHead({ title: 'Báo cáo theo tòa', sub: `${type === 'total' ? 'Báo cáo tổng' : 'Báo cáo kinh doanh'} · ${F.periodLabel(period)} · Nhà ${group}: ${bids.length} tòa · bố cục như sheet BC DT NHÀ ${group}`, acts: [U.btn({ label: 'Xuất Excel theo mẫu', icon: 'download', act: 'exp', perm: 'reports.export' })] })
      + filterBar(q, [{ name: 'type', label: 'Loại báo cáo', options: [['total', 'Báo cáo tổng'], ['business', 'Báo cáo kinh doanh']], value: 'total', all: false }, { name: 'group', label: 'Nhóm nhà', options: K.groupOpts(), value: 'G', all: false }, ...(rep.parallel && !TH.auth.buildingScope() ? [{ name: 'cmp', label: 'Đối chiếu', options: [['1', 'Hiện số Excel từng tòa']] }] : [])])
      + `<div class="rpt-wrap mt16"><table class="rpt"><thead><tr><th>Dòng</th><th>Chỉ tiêu</th><th>TỔNG NHÀ ${group}</th>${bids.map(b => `<th>${esc(code(b))}</th>`).join('')}</tr></thead><tbody>
        ${CAT().reportLines.filter(l => l.row <= 47 || l.code === 'r_lnr_gv' || l.code === 'r_nha_thue').map(l => `<tr class="${l.bold ? 'b' : ''} ${l.ratio ? 'ratio' : ''}"><td>${l.row}</td><td>${esc(l.label)}</td><td class="num"><b>${fmt(l, groupCol[l.code])}</b></td>${bids.map(b => { const v = rep.byBuilding[b][l.code]; const x = cmpRow && !l.ratio && bench[b] ? bench[b][l.code] : null;
          return `<td class="num ${TH.auth.can('reports.drill') && !l.ratio ? 'cell' : ''}" data-code="${l.code}" data-b="${b}">${fmt(l, v)}${x != null ? `<span class="diff ${Math.abs((v || 0) - x) > 1 ? 'bad' : 'ok'}">Excel ${fmt(l, x)}</span>` : ''}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`
      + (TH.auth.buildingScope() ? '' : U.note('info', 'Tòa G1', 'Cột G1 đối chiếu thêm mẫu báo cáo G1 (SRC-07): lương quản lý tổng 141.100 = 13.000.000/1.382×15; trưởng phòng 367.077 = 20.000.000/1.382×15 + 10.000×15; sửa chữa Excel dùng 25.000.000/1.343×15 (sót mẫu số tháng 7) – web dùng 1.382.'));
    K.bindFilters(root, ['type', 'group']);
    root.querySelectorAll('td.cell').forEach(td => td.onclick = () => cellDrawer(rep, rep.byBuilding, td.dataset.code, 'TOTAL', td.dataset.b));
    U.bind(root, { exp: () => K.xls(`bao-cao-toa-${group}-${period}.xls`, 'BC DT NHÀ ' + group, exportMeta(rep, Object.assign({}, q, { group }), 'BÁO CÁO THEO TÒA – NHÀ ' + group + ' (' + (type === 'total' ? 'Báo cáo tổng' : 'Báo cáo kinh doanh') + ')'),
      ['Dòng', 'Chỉ tiêu', 'TỔNG NHÀ ' + group, ...bids.map(code)], CAT().reportLines.map(l => [l.row, l.label, num(l, groupCol[l.code]), ...bids.map(b => num(l, rep.byBuilding[b][l.code]))])) });
  });
})(window.TH);
/* Tiêu chí nghiệm thu mốc 1B (hiện ở Cài đặt → Đối chiếu nghiệm thu) */
(function (TH) {
  const S = TH.store, F = TH.f;
  TH.pages.acceptance1B = () => {
    const out = [];
    const pv = TH.actions.previewPayroll('2026-08');
    const rows = pv.lines.flatMap(l => l.buildings.filter(b => b.excel).map(b => ({ b: (TH.q.building(b.buildingId) || {}).code, d: b.W - b.excel.W })));
    const bad = rows.filter(r => Math.abs(r.d) > 0.5).map(r => r.b);
    const known = ['S39', 'S28', 'S36'];
    out.push({ ms: '1B', name: 'Lương T8: W từng dòng tòa khớp bảng lương Excel', ok: bad.every(b => known.includes(b)), detail: `${rows.length - bad.length}/${rows.length} dòng khớp; ngoại lệ nguồn: ${bad.join(', ')} (V51 dùng sai cận; 2 dòng dùng bảng thâm niên khác các tòa còn lại của cùng NV)` });
    const al = TH.actions.previewAllocation('2026-08'); const g = (code) => (al.lines.find(l => l.lineCode === code).results.b_G1) || 0;
    const exp = { sal_gm: 141099.85528219971, sal_head: 367076.70043415343, sal_lead: 43415.34008683068, sal_source: 32561.505065123012, sal_acct: 181707.67004341533, office: 584492.3769898699, sal_sales: 621924.7575976845 };
    const okG1 = al.denominator === 1382 && Object.entries(exp).every(([k, v]) => Math.abs(g(k) - v) < 0.01);
    out.push({ ms: '1B', name: 'Phân bổ G1 khớp SRC-07 C36–C46 với mẫu số 1.382', ok: okG1, detail: `Mẫu số ${al.denominator}; QL tổng ${F.vnd(g('sal_gm'))}, TPVH ${F.vnd(g('sal_head'))}, kế toán ${F.vnd(g('sal_acct'))}, VP ${F.vnd(g('office'))}; sửa chữa web ${F.vnd(g('sal_repair'))} vs Excel 279.226 (Excel sót mẫu số 1.343)` });
    const rep = TH.qr.build('2026-08', 'total'); const t = rep.cols.TOTAL;
    const rc = TH.qr.reconcile('2026-08'); const it = Object.fromEntries(rc.items.map(i => [i.key, i]));
    const okT = Math.round(t.rev_total) === 7036256236 && Math.round(t.gv) === 5316928772 && Math.abs(it.other.amount) < 1 && Math.abs(it.payroll.amount - it.payroll.expected) < 1 && Math.abs(rc.residual) < 1;
    out.push({ ms: '1B', name: 'Báo cáo tổng T8 trên số web: DT 7.036.256.236 và giá vốn khớp Excel; chênh chi phí giải thích hết, không còn khoản lạ', ok: okT,
      detail: `DT ${F.vnd(t.rev_total)} · GV ${F.vnd(t.gv)} · TCP web ${F.vnd(rc.web)} − Excel ${F.vnd(rc.excel)} = ${F.vnd(rc.diff)}: ${rc.items.map(i => i.label.split(':')[0] + ' ' + F.vnd(i.amount)).join('; ')}. Số SRS 6.013.857.267 cần khách chốt ${it.scope.label.split(': ')[1]}` });
    const X = TH.data.bench202608.report.total; const eb = {}; TH.data.catalog.reportLines.forEach(l => { if (X[l.row]) eb[l.code] = X[l.row][0]; });
    const d = TH.calc.report.derive(eb);
    out.push({ ms: '1B', name: 'Công thức dòng 18–61 (chạy trên số Excel) tái hiện sheet: TCP 6.013.857.267, LNR 1.022.398.969', ok: Math.round(d.tcp) === 6013857267 && Math.round(d.lnr) === 1022398969 && Math.abs(d.r_dv_nhap - X[59][0]) < 1e-9, detail: `TCP ${F.vnd(d.tcp)} · LNR ${F.vnd(d.lnr)} · DT DV/giá nhập ${F.dec(d.r_dv_nhap, 4)} – kiểm công thức, không phải số web` });
    const bz = TH.qr.build('2026-08', 'business'); const b = bz.excelBiz; const br = TH.calc.report.bridge(t, bz.cols.TOTAL);
    const okB = Math.round(b.gd.lnr) === 790331663 && Math.round(b.sheet.lnr) === 685928969 && Math.abs(br[br.length - 1].value - bz.cols.TOTAL.lnr) < 1 && Math.abs(bz.cols.TOTAL.lnr - (b.gd.lnr - rc.diff)) < 1;
    out.push({ ms: '1B', name: 'Báo cáo kinh doanh T8: cầu nối trên số web = ô LNR; OQ-10 trên số Excel 790.331.663; sheet Excel 685.928.969', ok: okB,
      detail: `Web: LNR KD ${F.vnd(bz.cols.TOTAL.lnr)} (= 790.331.663 − chênh chi phí ${F.vnd(rc.diff)}) · Excel theo GĐ ${F.vnd(b.gd.lnr)} · sheet KD ${F.vnd(b.sheet.lnr)}` });
    return out;
  };
})(window.TH);
