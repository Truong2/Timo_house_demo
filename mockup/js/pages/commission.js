/* UI-22 Hoa hồng & nhân sự sale (chỉ admin / kế toán – CH-01). Tabs: hoa hồng theo giao dịch (duyệt, chi nhiều đợt) · đối chiếu file T8 (SRC-09, NT-1)
   · nhân sự sale (doanh số / chỉ tiêu) · chính sách tỷ lệ có hiệu lực. Đặc tả §3.5 dòng 301–313. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, A = TH.auth, CM = TH.calc.commission;
  const v1 = (v) => Number(v).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const pct = (h) => (Math.round(h * 10000) / 100).toString().replace('.', ',') + '%';
  const TABS = [{ key: 'hoa-hong', label: 'Hoa hồng theo giao dịch' }, { key: 'doi-chieu', label: 'Đối chiếu T8 (Excel)' }, { key: 'nhan-su', label: 'Nhân sự sale' }, { key: 'chinh-sach', label: 'Chính sách tỷ lệ' }];
  TH.router.handle('/sales/commission', (root, p, q) => {
    const tab = K.pickTab(TABS, q.tab, 'hoa-hong');
    const all = S.all('commissions').filter(c => c.status !== 'void');
    const el = {}; S.all('deals').forEach(d => { el[d.id] = Q.dealEligibility(d); });
    const left = (c) => (c.approvedAmount || 0) - Q.commissionPaid(c);
    const recognition = Q.param('commissionRecognitionMode', F.today()) || 'paidAt', byPaidAt = recognition === 'paidAt';
    root.innerHTML = U.pageHead({ title: 'Hoa hồng & nhân sự sale', sub: 'I = F × H − khoản trừ · tỷ lệ tự động chỉ là gợi ý, duyệt khác gợi ý phải có lý do · chi sau khi đủ 1 cọc + 1 tháng + HĐ đã ký (CH-19), từng cá nhân (CH-20) · ' + (byPaidAt ? 'ghi nhận chi phí theo tháng thực chi từng đợt' : 'phương án đề xuất OQ-13: ghi nhận kỳ đủ điều kiện') + ', dòng 40 Phí marketing' })
      + TH.salesNav('commission')
      + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Chờ duyệt', value: all.filter(c => c.status === 'pending').length, cap: F.vnd(all.filter(c => c.status === 'pending').reduce((t, c) => t + c.amount, 0)) + 'đ theo gợi ý', icon: 'clock', tone: 'amber' })}
        ${U.kpi({ label: 'Đã duyệt – đủ điều kiện chi', value: all.filter(c => c.status === 'approved' && el[c.dealId] && el[c.dealId].ok).length, cap: F.vnd(all.filter(c => c.status === 'approved' && el[c.dealId] && el[c.dealId].ok).reduce((t, c) => t + left(c), 0)) + 'đ còn phải chi', icon: 'check-circle', tone: 'green' })}
        ${U.kpi({ label: 'Đã duyệt – chưa đủ điều kiện', value: all.filter(c => c.status === 'approved' && !(el[c.dealId] && el[c.dealId].ok)).length, cap: 'thiếu cọc / tháng đầu / file HĐ', icon: 'alert-triangle', tone: 'red' })}
        ${U.kpi({ label: 'Đã chi', value: F.vnd(all.reduce((t, c) => t + Q.commissionPaid(c), 0)), cap: all.filter(c => c.status === 'paid').length + ' dòng chi đủ', icon: 'hand-coins', tone: 'blue' })}</div>`
      + U.tabs(TABS, tab) + '<div id="tb" class="mt16"></div>';
    U.bind(root, { tab: (e) => TH.router.setQuery({ tab: e.dataset.key }) });
    const tb = root.querySelector('#tb');
    if (tab === 'hoa-hong' && q.src === 'import') { // E2: dòng hoa hồng import lịch sử (≤ 08/2026) – tra cứu, không duyệt / chi lại
      const CASES = TH.calc.importv.COMMISSION_CASES; let rows = S.all('commissionImports').slice().sort((a, b) => b.period.localeCompare(a.period) || String(a.code).localeCompare(String(b.code)));
      if (q.period) rows = rows.filter(x => x.period === q.period);
      tb.innerHTML = K.filters([{ name: 'src', label: 'Nguồn', options: [['import', 'Import lịch sử (≤ 08/2026)']], all: 'Giao dịch trên web' }, { name: 'period', label: 'Kỳ ghi nhận', options: [...new Set(S.all('commissionImports').map(x => x.period))].sort().reverse().map(p => [p, F.periodShort(p)]) }], q)
        + '<div class="mt12">' + K.tableCard('t', rows.length + ' dòng import · Σ I ' + F.vnd(rows.reduce((t, x) => t + x.amount, 0)) + 'đ') + '</div>';
      K.bindFilters(tb, ['tab']);
      U.table(tb.querySelector('#t'), { rows, pageSize: 25, empty: U.empty({ icon: 'upload', title: 'Chưa import lịch sử hoa hồng', text: 'Import → Hoa hồng (lịch sử theo phòng), kỳ đến 08/2026.' }), cols: [
        { key: 'c', label: 'Mã khoản', render: x => `<b>${esc(x.code)}</b>` }, { key: 'p', label: 'Kỳ', render: x => F.periodShort(x.period) }, { key: 'r', label: 'Phòng', render: x => `<span class="code">${esc(Q.roomCode(x.roomId))}</span>` },
        { key: 'n', label: 'Người nhận', render: x => esc(x.recipient) }, { key: 'F', label: 'F', num: true, render: x => F.vnd(x.F) }, { key: 'G', label: 'G', render: x => esc(x.G || '') }, { key: 'H', label: 'H', num: true, render: x => pct(x.H) },
        { key: 'k', label: 'Loại ca', render: x => esc(((CASES.find(c => c[0] === x.caseType) || [])[1]) || '') }, { key: 'I', label: 'Thành tiền I', num: true, render: x => `<b>${F.vnd(x.amount)}</b>` + (Math.abs(x.amount - x.expected) > 0.5 ? ' ' + U.chip('≠ F × H ' + F.vnd(x.expected), 'amber') : '') },
        { key: 'e', label: 'Chứng từ chi', render: x => { const e = S.get('expenses', x.expenseId); return e ? U.link('#/expenses?period=' + e.period + '&q=' + encodeURIComponent(e.code), esc(e.code)) : '–'; } }] });
    }
    else if (tab === 'hoa-hong') {
      let rows = all.slice();
      if (q.deal) rows = rows.filter(c => c.dealId === q.deal);
      if (q.status === 'eligible') rows = rows.filter(c => c.status === 'approved' && el[c.dealId].ok); else if (q.status) rows = rows.filter(c => c.status === q.status);
      if (q.kind) rows = rows.filter(c => c.recipient.kind === q.kind);
      if (q.period) rows = rows.filter(c => F.period((Q.deal(c.dealId) || {}).closeDate) === q.period);
      if (q.sale) rows = rows.filter(c => c.recipient.employeeId === q.sale);
      if (q.team) rows = rows.filter(c => c.recipient.employeeId && (Q.leaderOf(c.recipient.employeeId) || {}).id === q.team);
      const byRecip = {}; rows.forEach(c => { const k = c.recipient.name; const x = byRecip[k] = byRecip[k] || { name: k, n: 0, amount: 0, paid: 0 }; x.n++; x.amount += c.approvedAmount != null ? c.approvedAmount : c.amount; x.paid += Q.commissionPaid(c); });
      rows.sort((a, b) => String((Q.deal(b.dealId) || {}).closeDate).localeCompare(String((Q.deal(a.dealId) || {}).closeDate)));
      tb.innerHTML = K.filters([{ name: 'src', label: 'Nguồn', options: [['import', 'Import lịch sử (≤ 08/2026)']], all: 'Giao dịch trên web' }, { name: 'status', label: 'Trạng thái', options: [['eligible', 'Đủ điều kiện chi'], ...Object.entries(Q.CM_ST).filter(([k]) => k !== 'void').map(([k, v]) => [k, v[0]])] }, { name: 'kind', label: 'Người nhận', options: [['partner', 'Đối tác'], ['ctv', 'CTV'], ['sale', 'Sale nội bộ']] }, { name: 'period', label: 'Kỳ (tháng chốt)', options: [...new Set(S.all('deals').map(d => F.period(d.closeDate)))].sort().reverse().map(x => [x, F.periodLabel(x)]) },
          { name: 'sale', label: 'Sale', options: Q.salesStaff().map(e => [e.id, e.name]) }, { name: 'team', label: 'Team', options: [...new Set(Q.salesStaff().map(e => (Q.leaderOf(e.id) || {}).id).filter(Boolean))].map(id => [id, (Q.emp(id) || {}).name]) }], q)
        + '<div class="mt12">' + K.tableCard('t', rows.length + ' dòng hoa hồng') + '</div>'
        + '<div class="mt16">' + U.card({ title: 'Tổng theo người nhận (J)', icon: 'users', bodyCls: 'flush', body: `<table class="tbl compact"><thead><tr><th>Người nhận</th><th class="num">Số dòng</th><th class="num">Thành tiền</th><th class="num">Đã chi</th><th class="num">Còn phải chi</th></tr></thead><tbody>${Object.values(byRecip).sort((a, b) => b.amount - a.amount).map(x => `<tr><td>${esc(x.name)}</td><td class="num">${x.n}</td><td class="num">${F.vnd(x.amount)}</td><td class="num">${F.vnd(x.paid)}</td><td class="num"><b>${F.vnd(x.amount - x.paid)}</b></td></tr>`).join('')}</tbody></table>` }) + '</div>';
      K.bindFilters(tb, ['tab']);
      U.table(tb.querySelector('#t'), { rows, pageSize: 25, cols: [
        {key:'stt',label:'STT',num:true,render:(_row,index)=>index+1},
        { key: 'd', label: 'Giao dịch', render: c => { const d = Q.deal(c.dealId); return U.cell2(U.link('#/sales/deals/' + d.id, esc(d.code)), F.date(d.closeDate) + ' · ' + esc(Q.roomCode(d.roomId))); } },
        { key: 'r', label: 'Người nhận', render: c => U.cell2(esc(c.recipient.name), (c.recipient.kind === 'partner' ? 'Đối tác' : c.recipient.kind === 'ctv' ? 'CTV' + (c.share > 1 ? ' · trùng ' + c.share : '') : 'Sale nội bộ' + (c.share > 1 ? ' · trùng ' + c.share : '')) + ' · STK ' + esc(c.recipient.kind !== 'sale' ? ((p) => p ? p.bank + ' ' + p.number : 'chưa khai báo')(Q.partnerOf(c.recipient.name)) : ((Q.emp(c.recipient.employeeId) || {}).bank || '–'))) },
        { key: 'kh', label: 'Khách / QL phòng', render: c => { const d = Q.deal(c.dealId) || {}; return U.cell2(esc(((Q.customer(d.customerId) || {}).phone) || '–'), esc((Q.managerOf(d.buildingId) || {}).name || '–')); } },
        { key: 'f', label: 'F (giá chốt)', num: true, render: c => F.vnd(c.F) }, { key: 'g', label: 'G', render: c => c.term === 'forfeit' ? 'Bỏ cọc' : c.term + ' th' },
        { key: 'sh', label: 'H gợi ý', num: true, render: c => `<span data-tip="${esc((c.reasons || []).join(' · '))}">${pct(c.suggestedH)}</span>` }, { key: 'h', label: 'H duyệt', num: true, render: c => c.status === 'pending' ? '–' : pct(c.H) + (CM.sameRate(c.H, c.suggestedH) ? '' : ' ' + U.chip('khác gợi ý', 'amber')) },
        { key: 'i', label: 'Thành tiền I', num: true, render: c => `<b>${F.vnd(c.approvedAmount != null ? c.approvedAmount : c.amount)}</b>${c.deduction ? `<small class="muted"> (trừ ${F.vnd(c.deduction)})</small>` : ''}` },
        { key: 'pd', label: 'Đã chi', num: true, render: c => F.vnd(Q.commissionPaid(c)) + (c.paidPerWorkbook ? ' ' + U.chip('theo Excel', 'gray') : '') + (c.recover ? ` <small class="red">cần thu hồi ${F.vnd(c.recover)}</small>` : '') },
        { key: 'dt', label: 'Ngày chi · chứng từ', render: c => (c.installments || []).map(i => { const e = S.get('expenses', i.expenseId); return F.date(i.date) + (e ? ' ' + U.link('#/expenses?period=' + e.period + '&q=' + encodeURIComponent(e.code), esc(e.code)) : ''); }).join('<br>') || '–' },
        { key: 'e', label: 'Điều kiện chi', render: c => el[c.dealId].ok ? U.chip(byPaidAt ? 'Đủ từ ' + F.date(el[c.dealId].date) : 'Đủ – kỳ ' + F.periodShort(F.period(el[c.dealId].date)) + ' · OQ-13', 'green') : `<span data-tip="${esc(el[c.dealId].missing.join(' · '))}">${U.chip('Chưa đủ', 'gray')}</span>` },
        { key: 'st', label: 'Trạng thái', render: c => U.chip(Q.CM_ST[c.status][0], Q.CM_ST[c.status][1], true) + (c.note ? `<div class="small muted">${esc(c.note)}</div>` : '') },
        { key: 'actions', label: '', render: c => U.rowActions([U.actBtn({ icon: 'history', label: 'Nguồn số', act: 'trace', attrs: { 'data-id': c.id } }), ['pending', 'approved'].includes(c.status) ? U.actBtn({ icon: 'check', label: 'Duyệt', act: 'ap', attrs: { 'data-id': c.id }, perm: 'commission.approve' }) : '',
          c.status === 'approved' ? U.actBtn({ icon: 'banknote', label: 'Chi', act: 'pay', attrs: { 'data-id': c.id }, perm: 'commission.pay', disabled: !el[c.dealId].ok }) : ''].filter(Boolean)) }] });
      U.bind(tb, {
        trace: (b) => { const c = S.get('commissions', b.dataset.id), d = Q.deal(c.dealId) || {}, lead = S.get('leads', d.leadId), eligibility = el[c.dealId] || {};
          U.drawer({ title: 'Nguồn hoa hồng – ' + esc(c.recipient.name), sub: esc(d.code || ''), wide: true, body: U.kv([
            ['Khách xem', lead ? `${esc(lead.code || lead.name || '')} · ${esc(lead.source || 'không rõ nguồn')}` : 'Không có lead liên kết'],
            ['Giao dịch', d.id ? U.link('#/sales/deals/' + d.id, esc(d.code)) + ` · ${F.date(d.closeDate)}` : '–'],
            ['Nhân viên / tỷ lệ chia', `${esc(c.recipient.name)} · ${c.share > 1 ? 'chia ' + c.share + ' người' : 'một người'} · H ${pct(c.H)} (gợi ý ${pct(c.suggestedH)})`],
            ['Căn cứ tỷ lệ', esc((c.reasons || []).join(' · ') || c.reason || 'Chính sách hiệu lực tại ngày chốt')],
            [byPaidAt ? 'Điều kiện được phép chi' : 'Kỳ đủ điều kiện · OQ-13', eligibility.date ? (byPaidAt ? `Đủ từ ${F.date(eligibility.date)}; chi phí theo ngày thực chi` : `${F.date(eligibility.date)} · ${F.periodLabel(F.period(eligibility.date))}`) : `Chưa đủ: ${esc((eligibility.missing || []).join(' · '))}`],
            ['Từng lần chi', (c.installments || []).map(i => `${F.date(i.date)} · ${F.vnd(i.amount)} · kỳ ${F.periodShort(i.period || F.period(i.date))} · ${esc(i.by || '')}`).join('<br>') || 'Chưa chi']
          ]) + U.note('warn', 'Công thức chuyển đổi', 'Tỷ lệ chốt/xem vẫn là chỉ số đề xuất cho đến khi OQ-06 được xác nhận; drawer này chỉ truy vết nguồn, không biến chỉ số đó thành KPI chính thức.') }); },
        ap: (b) => { const c = S.get('commissions', b.dataset.id); K.formDrawer({ title: 'Duyệt hoa hồng – ' + esc(c.recipient.name), modal: true,
          note: U.note('info', 'Gợi ý ' + pct(c.suggestedH), esc((c.reasons || []).join(' · ')) + `<br>F = ${F.vnd(c.F)} · I = F × H − khoản trừ`),
          fields: [{ name: 'H', label: 'Tỷ lệ H (%)', type: 'number', value: Math.round(c.H * 10000) / 100, req: true }, { name: 'deduction', label: 'Khoản trừ (hỗ trợ khách…)', type: 'money', value: c.deduction || '' }, { name: 'reason', label: 'Lý do (bắt buộc khi khác gợi ý / có khoản trừ)', span: true }],
          submit: 'Duyệt', onSubmit: (x) => { X.approveCommission(c.id, { H: F.num(x.H) / 100, deduction: F.num(x.deduction), reason: x.reason }); U.toast('ok', 'Đã duyệt hoa hồng'); } }); },
        pay: (b) => { const c = S.get('commissions', b.dataset.id); K.formDrawer({ title: 'Chi hoa hồng – ' + esc(c.recipient.name), modal: true,
          note: U.note(byPaidAt ? 'info' : 'warn', byPaidAt ? 'Ghi nhận theo tháng thực chi' : 'Phương án đề xuất OQ-13', `Còn được chi ${F.vndd(left(c))}. ${byPaidAt ? 'Mỗi lần chi tạo chi phí Hoa hồng dòng 40 trong tháng của ngày chi; ngày chi phải thuộc kỳ mở.' : `Chi phí dự kiến ghi ở kỳ ${F.periodShort(F.period(el[c.dealId].date))} là kỳ đủ điều kiện.`} Có thể chi nhiều đợt.`),
          fields: [{ name: 'amount', label: 'Số chi', type: 'money', value: left(c), req: true }, { name: 'date', label: 'Ngày chi', type: 'date', value: F.today(), req: true }, { name: 'method', label: 'Phương thức', type: 'select', options: [['bank', 'Chuyển khoản'], ['cash', 'Tiền mặt']], value: 'bank' }],
          submit: 'Ghi chi', onSubmit: (x) => { X.payCommission(c.id, { amount: F.num(x.amount), date: x.date, method: x.method }); U.toast('ok', 'Đã ghi chi hoa hồng'); } }); },
      });
    }
    if (tab === 'doi-chieu') {
      const B = Q.commissionBench();
      let rows = B.rows; if (q.only === 'diff') rows = rows.filter(r => r.I != null && !r.match);
      tb.innerHTML = `<div class="grid grid-4 mb16">${U.kpi({ label: 'Σ thành tiền – web (I = F × H)', value: v1(B.webTotal), cap: B.countI + ' dòng có thành tiền / ' + B.rows.length + ' dòng', icon: 'hash', tone: 'blue' })}
        ${U.kpi({ label: 'Σ thành tiền – Excel ô I3', value: v1(B.excelTotal), cap: Math.abs(B.webTotal - B.excelTotal) < 0.5 ? 'Khớp (lệch ' + F.vnd(Math.round(Math.abs(B.webTotal - B.excelTotal) * 100) / 100) + 'đ làm tròn)' : 'LỆCH ' + F.vnd(B.webTotal - B.excelTotal), icon: 'file-spreadsheet', tone: Math.abs(B.webTotal - B.excelTotal) < 0.5 ? 'green' : 'red' })}
        ${U.kpi({ label: 'Dòng I ≠ F × H', value: B.mismatch, cap: 'thành tiền Excel khác công thức', icon: 'alert-triangle', tone: B.mismatch ? 'red' : 'green' })}
        ${U.kpi({ label: 'Tỷ lệ gợi ý = tỷ lệ thực tế', value: B.matched + '/' + B.countI, cap: (B.countI - B.matched) + ' dòng áp tỷ lệ riêng · Σ theo gợi ý ' + v1(B.suggestedTotal) + ' (' + (B.suggestedDiff > 0 ? '+' : '') + F.vnd(B.suggestedDiff) + ' so Excel – K-5)', icon: 'percent', tone: 'amber' })}</div>`
        + U.note('info', 'Nguồn ' + esc(B.sheet) + ' (SRC-09, NT-1)', 'Người nhận là cá nhân đã ẩn danh (CTV …); đối tác doanh nghiệp giữ tên. Cột F dòng bỏ cọc tính lại từ công thức Excel = cọc − giá thuê/số ngày × số ngày đã ở. Tỷ lệ gợi ý theo chính sách hiệu lực 31/08/2026.')
        + K.filters([{ name: 'only', label: 'Hiển thị', options: [['diff', 'Chỉ dòng tỷ lệ khác gợi ý']] }], q)
        + '<div class="mt12">' + K.tableCard('t', rows.length + ' dòng') + '</div>';
      K.bindFilters(tb, ['tab']);
      U.table(tb.querySelector('#t'), { rows, pageSize: 30, cols: [{ key: 'row', label: 'Dòng', num: true, render: r => r.row }, { key: 'room', label: 'Phòng', render: r => `<span class="code">${esc(r.room)}</span>` },
        { key: 'st', label: 'TT khách', render: r => esc(r.status || '') }, { key: 'rc', label: 'Người nhận', render: r => U.cell2(esc(r.recipient || ''), r.lead ? 'LEAD' : r.recipientKind === 'partner' ? 'Đối tác' : 'Cá nhân') },
        { key: 'F', label: 'F', num: true, render: r => F.vnd(r.Fweb) }, { key: 'G', label: 'G', render: r => esc(r.termRaw || '') }, { key: 'H', label: 'H Excel', num: true, render: r => pct(r.H) },
        { key: 'sg', label: 'H gợi ý', num: true, render: r => r.match ? `<span class="green">${pct(r.suggested)}</span>` : `<span class="amber" data-tip="${esc(r.why)}">${pct(r.suggested)}</span>` },
        { key: 'I', label: 'I Excel', num: true, render: r => r.I != null ? (r.I % 1 ? v1(r.I) : F.vnd(r.I)) : '–' }, { key: 'w', label: 'I web', num: true, render: r => r.web != null ? (r.web % 1 ? v1(r.web) : F.vnd(r.web)) : '–' },
        { key: 'df', label: 'Lệch', num: true, render: r => r.diff == null ? '–' : Math.abs(r.diff) > 0.01 ? `<b class="red">${F.vnd(r.diff)}</b>` : '<span class="green">0</span>' }, { key: 'n', label: 'Ghi chú', render: r => `<span class="small">${esc([r.note, r.why].filter(Boolean).join(' · '))}</span>` }],
        footer: () => `<tr><td colspan="8"><b>Tổng</b></td><td class="num"><b>${v1(B.excelTotal)}</b></td><td class="num"><b>${v1(B.webTotal)}</b></td><td></td><td></td></tr>` });
    }
    if (tab === 'nhan-su') {
      const period = q.period || S.meta.period, target = Q.param('salesTarget', F.periodEnd(period)); const tg = (e) => Q.salesTarget(e.id, F.periodEnd(period));
      const deals = S.all('deals').filter(d => F.period(d.closeDate) === period);
      const vol = CM.salesVolume(deals);
      const rows = Q.salesStaff().map(e => ({ e, v: vol[e.id] || { count: 0, volume: 0, cancelled: 0, cancelledVolume: 0 }, months: Math.max(0, TH.calc.dates.diffDays(e.hireDate || F.today(), F.today()) / 30.4) })).sort((a, b) => b.v.volume - a.v.volume);
      tb.innerHTML = K.filters([{ name: 'period', label: 'Kỳ', options: K.periodOpts(), value: S.meta.period, all: false }], q) + '<div class="mt12">' + K.tableCard('t', 'Nhân sự sale – ' + F.periodLabel(period) + ' · chỉ tiêu chung ' + F.vnd(target) + 'đ/tháng (tham số, OQ-25); đặt riêng theo sale có ngày hiệu lực', U.btn({ label: 'Đặt chỉ tiêu', icon: 'target', size: 'btn-sm', act: 'tgt', perm: 'commission.policy' })) + '</div>';
      K.bindFilters(tb, ['tab']);
      U.table(tb.querySelector('#t'), { rows, pageSize: 30, cols: [{key:'stt',label:'STT',num:true,render:(_row,index)=>index+1}, { key: 'n', label: 'Nhân viên', render: x => U.cell2(esc(x.e.name), esc(x.e.code)) }, { key: 't', label: 'Chức danh', render: x => esc(x.e.title) },
        { key: 'l', label: 'Trưởng nhóm', render: x => esc((Q.leaderOf(x.e.id) || {}).name || '–') }, { key: 's', label: 'Thâm niên', render: x => Math.floor(x.months / 12) + ' năm ' + Math.floor(x.months % 12) + ' th' },
        { key: 'c', label: 'Deal chốt', num: true, render: x => String(Math.round(x.v.count * 100) / 100).replace('.', ',') }, { key: 'v', label: 'Doanh số', num: true, sortable: true, sortVal: x => x.v.volume, render: x => F.vnd(x.v.volume) },
        { key: 'x', label: 'Hủy / bỏ cọc', num: true, render: x => x.v.cancelled ? F.vnd(x.v.cancelledVolume) : '–' }, { key: 'tg', label: 'Chỉ tiêu', num: true, render: x => F.vnd(tg(x.e)) + (tg(x.e) !== target ? ' <small class="muted">riêng</small>' : '') }, { key: 'p', label: '% chỉ tiêu', num: true, render: x => tg(x.e) ? `<b class="${x.v.volume >= tg(x.e) ? 'green' : ''}">${Math.round(x.v.volume / tg(x.e) * 100)}%</b>` : '–' }] });
      U.bind(tb, { tgt: () => K.formDrawer({ title: 'Chỉ tiêu doanh số theo sale', modal: true, fields: [{ name: 'employeeId', label: 'Sale', type: 'select', req: true, options: Q.salesStaff().map(e => [e.id, e.name]) }, { name: 'amount', label: 'Chỉ tiêu / tháng', type: 'money', req: true, value: target }, { name: 'from', label: 'Hiệu lực từ', type: 'date', req: true, value: TH.calc.dates.periodStart(TH.calc.dates.nextPeriod(S.meta.period)) }, { name: 'reason', label: 'Lý do', req: true, span: true }],
        submit: 'Lưu', onSubmit: (x) => { X.setSalesTarget(x.employeeId, F.num(x.amount), x.from, x.reason); U.toast('ok', 'Đã đặt chỉ tiêu'); } }) });
    }
    if (tab === 'chinh-sach') {
      const rows = S.all('commissionPolicies').slice().sort((a, b) => b.from.localeCompare(a.from));
      tb.innerHTML = U.card({ title: 'Chính sách tỷ lệ gợi ý theo hiệu lực', icon: 'sliders', actions: U.btn({ label: 'Thêm phiên bản', icon: 'plus', size: 'btn-sm', act: 'addp', perm: 'commission.policy' }), bodyCls: 'flush', body: '<div id="t"></div>' })
        + '<div class="mt16">' + U.card({ title: 'Tài khoản nhận hoa hồng của đối tác', icon: 'landmark', actions: U.btn({ label: 'Thêm đối tác', icon: 'plus', size: 'btn-sm', act: 'addpt', perm: 'commission.pay' }), bodyCls: 'flush', body: '<div id="pt"></div>' }) + '</div>'
        + U.note('warn', 'Giả định cần khách xác nhận (K-5)', 'Đặc tả chưa có công thức chọn tỷ lệ tự động; công thức phụ tháng 8 (LEAD → 50%, còn lại 35%) sai 29/42 dòng nên không dùng. Bảng này chỉ tạo tỷ lệ GỢI Ý; kế toán duyệt tỷ lệ thực tế.');
      U.table(tb.querySelector('#t'), { rows, noPager: true, cols: [{ key: 'f', label: 'Hiệu lực từ', render: r => F.date(r.from) }, { key: 'b', label: 'Cơ bản', num: true, render: r => pct(r.base) },
        { key: 'p', label: 'Đối tác riêng', render: r => Object.entries(r.partners || {}).map(([k, v]) => esc(k) + ' ' + pct(v)).join(', ') || '–' }, { key: 's', label: 'Khách trùng', render: r => Object.entries(r.share || {}).map(([k, v]) => k + ' người ' + pct(v * r.base / CM.DEFAULT_POLICY.base)).join(' · ') + ' · ≥ 4 người chia đều' },
        { key: 't', label: 'HĐ ngắn hạn', render: r => '< ' + r.fullTermMonths + ' tháng: × số tháng / ' + r.fullTermMonths }, { key: 'fr', label: 'Bỏ cọc', num: true, render: r => pct(r.forfeitRate) }, { key: 'n', label: 'Căn cứ', render: r => esc(r.note || '') }] });
      const curP = Q.commissionPolicy(); const pkeys = [...new Set([...Object.keys(curP.partners || {}), ...Q.partnerNames().map(n => n.toUpperCase())])].filter(k => /^[A-Z0-9][A-Z0-9 ._-]{1,29}$/.test(k));
      U.table(tb.querySelector('#pt'), { rows: S.all('partners'), noPager: true, empty: U.empty({ icon: 'landmark', title: 'Chưa khai báo tài khoản đối tác' }), cols: [{ key: 'n', label: 'Đối tác', render: p => `<b>${esc(p.name)}</b>` }, { key: 'r', label: 'Tỷ lệ riêng hiện hành', num: true, render: p => (curP.partners || {})[p.name.toUpperCase()] ? pct(curP.partners[p.name.toUpperCase()]) : '–' },
        { key: 'b', label: 'Ngân hàng', render: p => esc(p.bank) }, { key: 'no', label: 'Số tài khoản', render: p => `<span class="mono">${esc(p.number)}</span>` }, { key: 'h', label: 'Chủ tài khoản', render: p => esc(p.holder) }, { key: 'a', label: '', render: p => U.actBtn({ icon: 'pencil', label: 'Sửa', act: 'editpt', attrs: { 'data-id': p.id }, perm: 'commission.pay' }) }] });
      const ptForm = (p = {}) => K.formDrawer({ title: p.id ? 'Sửa tài khoản đối tác' : 'Thêm tài khoản đối tác', modal: true, fields: [{ name: 'name', label: 'Đối tác', req: true, value: p.name || '', placeholder: Q.partnerNames().slice(0, 3).join(', ') }, { name: 'bank', label: 'Ngân hàng', req: true, value: p.bank || '' },
        { name: 'number', label: 'Số tài khoản', req: true, value: p.number || '' }, { name: 'holder', label: 'Chủ tài khoản', req: true, value: p.holder || '' }, { name: 'note', label: 'Ghi chú', span: true, value: p.note || '' }],
        submit: 'Lưu', onSubmit: (x) => { X.savePartner(Object.assign({ id: p.id }, x)); U.toast('ok', 'Đã lưu tài khoản đối tác'); } });
      U.bind(tb, { addpt: () => ptForm(), editpt: (b) => ptForm(S.get('partners', b.dataset.id)),
        addp: () => K.formDrawer({ title: 'Phiên bản chính sách hoa hồng', modal: true, note: U.note('info', '', 'Tỷ lệ riêng theo đối tác: để trống = áp tỷ lệ cơ bản. Thêm đối tác mới ở dòng cuối.'),
          fields: [{ name: 'from', label: 'Hiệu lực từ', type: 'date', req: true }, { name: 'base', label: 'Tỷ lệ cơ bản (%)', type: 'number', value: Math.round(curP.base * 10000) / 100, req: true }, { name: 'forfeitRate', label: 'Tỷ lệ khi bỏ cọc (%)', type: 'number', value: Math.round(curP.forfeitRate * 10000) / 100 },
            ...pkeys.map(k => ({ name: 'p_' + k, label: 'Đối tác ' + k + ' (%)', type: 'number', value: (curP.partners || {})[k] ? Math.round(curP.partners[k] * 10000) / 100 : '' })),
            { name: 'newPartner', label: 'Đối tác mới', placeholder: 'Tên đối tác' }, { name: 'newRate', label: 'Tỷ lệ đối tác mới (%)', type: 'number' }, { name: 'note', label: 'Căn cứ / lý do', req: true, span: true }],
          submit: 'Lưu', onSubmit: (x) => { const partners = {}; pkeys.forEach(k => { const v = x['p_' + k]; if (v !== '' && v != null) partners[k] = F.num(v) / 100; }); if (String(x.newPartner || '').trim()) partners[String(x.newPartner).trim().toUpperCase()] = F.num(x.newRate) / 100;
            X.addCommissionPolicy({ from: x.from, base: F.num(x.base) / 100, forfeitRate: F.num(x.forfeitRate) / 100, partners, note: x.note }); U.toast('ok', 'Đã thêm chính sách'); } }) });
    }
  });
})(window.TH);
