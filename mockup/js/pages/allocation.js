/* UI-16 Phân bổ chi phí chung: quỹ / tổng phòng hệ thống của kỳ × số phòng tòa (+ phụ phí/phòng, cố định/tòa) · E17 thiếu cơ sở / lệch tổng · chốt phiên. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc;
  TH.router.handle('/expenses/allocation', (root, p, q) => {
    const period = q.period || '2026-08';
    const run = S.one('allocationRuns', r => r.period === period);
    const res = run || X.previewAllocation(period, q.den ? { denominator: q.den, reason: q.why } : null);
    const bids = Object.keys((res.lines[0] || { results: {} }).results).sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
    const bcode = (b) => (Q.building(b) || {}).code || b.slice(2);
    const basis = X.roomBasis(period);
    const sumRooms = run ? run.sumRooms : res.sumRooms;
    const gap = res.denominator - sumRooms;
    const g1 = 'b_G1';
    root.innerHTML = TH.pages.expTabs('alloc') + U.pageHead({ title: 'Phân bổ chi phí chung', sub: `${F.periodLabel(period)} · ${run ? run.code + ' (' + (run.status === 'closed' ? 'đã chốt' : 'nháp') + ')' : 'xem trước – chưa lưu'} · cơ sở: ${esc(run ? run.basisSource : res.basisSource)}`, acts: [(S.get('periods', period) || {}).status === 'closed' ? U.btn({ label: 'Điều chỉnh sau khóa', icon: 'pencil', act: 'adj', perm: 'expenses.manage' }) : '', 
      U.btn({ label: 'Xuất', icon: 'download', act: 'exp' }), (!run || run.status !== 'closed') ? U.btn({ label: 'Đổi mẫu số', icon: 'sliders', act: 'den', perm: 'allocation.manage' }) : '',
      (!run || run.status !== 'closed') ? U.btn({ label: run ? 'Lưu lại phiên' : 'Lưu phiên phân bổ', icon: 'save', act: 'save', perm: 'allocation.manage' }) : '',
      run && run.status !== 'closed' ? U.btn({ label: 'Chốt phiên', icon: 'lock', cls: 'btn-primary', act: 'close', perm: 'allocation.manage' }) : ''] })
      + K.filters([{ name: 'period', label: 'Kỳ', options: S.all('periods').map(x => [x.id, F.periodLabel(x.id)]), value: '2026-08', all: false }], q)
      + `<div class="grid grid-4 mt16 mb16">${U.kpi({ label: 'Mẫu số (tổng phòng hệ thống)', value: F.num0(res.denominator), cap: (run && run.overrideReason) || q.why ? 'Đã đổi: ' + esc((run && run.overrideReason) || q.why) : 'GĐ OQ-04', icon: 'hash' })}
        ${U.kpi({ label: 'Số phòng các tòa trong phạm vi', value: F.num0(sumRooms), cap: Object.keys(basis.rooms).length + ' tòa', icon: 'building', tone: 'teal' })}
        ${U.kpi({ label: 'Tổng quỹ phân bổ', value: F.vnd(res.lines.reduce((s, l) => s + (l.fund || 0), 0)), icon: 'coins', tone: 'blue' })}
        ${U.kpi({ label: 'Đã phân bổ (gồm phụ phí/phòng)', value: F.vnd(res.lines.reduce((s, l) => s + l.total, 0)), icon: 'split', tone: 'green' })}</div>`
      + (gap ? U.note('danger', 'Thiếu cơ sở phân bổ (E17)', `Mẫu số ${F.num0(res.denominator)} nhưng tổng phòng các tòa = ${F.num0(sumRooms)} (lệch ${F.num0(gap)}). Phần quỹ tương ứng chưa phân bổ – kiểm tra tòa thiếu số phòng hoặc ghi lý do đổi mẫu số.`) : U.note('ok', 'Tổng phân bổ khớp quỹ', 'Tổng số phòng các tòa = mẫu số → toàn bộ quỹ được phân bổ.'))
      + ((res.missingFunds || []).length ? U.note('warn', 'Chưa có số tiền quỹ', esc(res.missingFunds.join(', ')) + ' – ghi chi phí "Quỹ chung" tương ứng ở Chi phí hoặc chốt bảng lương.') : '')
      + U.card({ title: 'Quỹ chung và kết quả', icon: 'split', body: `<table class="tbl compact"><thead><tr><th>Dòng báo cáo</th><th>Công thức G1 (SRC-07)</th><th class="num">Quỹ</th><th class="num">Phụ phí/phòng</th><th class="num">Cố định/tòa</th><th class="num">Tổng phân bổ</th><th class="num">G1 (web)</th></tr></thead><tbody>
        ${res.lines.map(l => `<tr><td><b>${esc(l.label)}</b></td><td class="mono small">${esc(l.g1 || '')}</td><td class="num">${F.vnd(l.fund)}</td><td class="num">${l.surchargePerRoom ? F.vnd(l.surchargePerRoom) : '–'}</td><td class="num">${l.fixedPerBuilding ? F.vnd(l.fixedPerBuilding) : '–'}</td><td class="num">${F.vnd(l.total)}</td><td class="num">${F.vnd(l.results[g1] || 0)}</td></tr>`).join('')}</tbody></table>` })
      + '<div class="mt16">' + K.tableCard('t', 'Kết quả theo tòa') + '</div>';
    K.bindFilters(root, []);
    U.table(root.querySelector('#t'), { rows: bids, pageSize: 25, cols: [
      { key: 'b', label: 'Tòa', render: b => `<b>${esc(bcode(b))}</b>` }, { key: 'r', label: 'Số phòng', num: true, render: b => basis.rooms[b] || 0 },
      ...res.lines.map(l => ({ key: l.lineCode, label: esc(l.label.replace('Lương ', 'L. ')), num: true, render: b => F.vnd(l.results[b] || 0) })),
      { key: 'sum', label: 'Tổng', num: true, render: b => `<b>${F.vnd(res.lines.reduce((s, l) => s + (l.results[b] || 0), 0))}</b>` }] });
    U.bind(root, { adj: () => TH.pages.adjustDrawer(period, { reportLine: 'sal_gm' }),
      save: () => K.act(() => X.saveAllocation(period, q.den ? { denominator: q.den, reason: q.why } : null), 'Đã lưu phiên phân bổ'),
      close: async () => { if (await U.confirm({ title: 'Chốt phân bổ', text: 'Chốt phiên ' + run.code + '? Báo cáo tòa dùng kết quả này.', ok: 'Chốt' })) K.act(() => X.closeAllocation(run.id), 'Đã chốt phân bổ'); },
      den: () => K.formDrawer({ title: 'Đổi mẫu số phân bổ', sub: 'Mặc định = tổng phòng hệ thống của kỳ tại ngày chốt (GĐ OQ-04)', modal: true, fields: [{ name: 'den', label: 'Mẫu số', type: 'number', req: true, value: res.denominator }, { name: 'why', label: 'Lý do', type: 'textarea', req: true, span: true }],
        submit: 'Xem trước', onSubmit: (d) => { if (!String(d.why || '').trim()) { const e = new Error('Nhập lý do'); e.fields = { why: 'Bắt buộc' }; throw e; } TH.router.setQuery({ den: d.den, why: d.why }); } }),
      exp: () => K.csv('phan-bo-' + period + '.csv', ['Tòa', 'Số phòng', ...res.lines.map(l => l.label)], bids.map(b => [bcode(b), basis.rooms[b] || 0, ...res.lines.map(l => Math.round(l.results[b] || 0))])),
    });
  });
})(window.TH);
