/* UI-01 Tổng quan: 3 loại phòng trống, tiến độ thu theo mốc 5/10/15, việc cần xử lý. Chỉ đọc.
   Phase 2: HS thực tế / tạm tính (cùng công thức bảng lương – OQ-18), thẻ kinh doanh (deal của tôi cho sale), phản hồi Zalo chờ xử lý (trưởng phòng). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, I = TH.icon, esc = F.esc;
  const scopeBuildings = (q, date) => {
    const d = date || F.today(); const mgr = Q.managerMap(d); // phân công / cơ cấu tại cuối kỳ đang xem
    let bs = Q.scopedBuildings();
    if (q.group) bs = bs.filter(b => b.group === q.group);
    if (q.area) bs = bs.filter(b => b.areaId === q.area);
    if (q.manager) bs = bs.filter(b => (mgr[b.id] || {}).id === q.manager);
    // E3: leader theo cơ cấu tại ngày xem; "chỉ team trực tiếp"; vai trò phụ trách (vận hành / kỹ thuật / sale …) – đặc tả §3.6 dòng 338
    if (q.leader) { const set = Q.leaderBuildings(q.leader, d, { direct: q.direct === '1', resp: TH.ms.on('2') && q.resp ? q.resp : 'operate' }); bs = bs.filter(b => set.has(b.id)); }
    return bs;
  };
  /* Hàng thẻ Phase 2: HS (nhãn thực tế / tạm tính), lấp đầy, kinh doanh, phản hồi Zalo */
  const p2Row = (period, bset, q = {}) => {
    const role = TH.auth.role();
    const cards = [];
    if (TH.auth.can('buildings.view') && role !== 'sale' && role !== 'kythuat') {
      const O = TH.qo.rooms(period, (b) => bset.has(b)); const T = O.totals;
      const f1 = (v) => v == null ? '–' : String(Math.round(v * 10) / 10).replace('.', ',');
      cards.push(U.kpi({ label: T.hsFinal ? 'HS thực tế' : 'HS (tạm tính)', value: f1(T.hs), cap: 'thu trong 3 mốc / giá niêm yết – cùng công thức lương (OQ-18)' + (O.parallel ? ' · số Excel kỳ song song' : '') + (TH.auth.can('reports.ops') ? ` · <a href="#/reports/rooms?view=hs&period=${period}${['group', 'area', 'manager', 'leader', 'direct'].filter(k => q[k]).map(k => '&' + k + '=' + encodeURIComponent(q[k])).join('')}">chi tiết theo tòa (UI-45)</a>` : ''), icon: 'gauge', tone: 'blue' }));
      cards.push(U.kpi({ label: 'HS tạm tính', value: f1(T.hsTemp), cap: '(tiền nhà đã thu + bỏ cọc) / giá niêm yết – không phải lấp đầy', icon: 'activity', tone: 'purple' }));
    }
    const mine = TH.auth.can('sales.view') ? Q.salesScoped(S.all('deals')) : [];
    if (TH.auth.can('sales.view') && (mine.length || role === 'sale')) { const inP = mine.filter(d => F.period(d.closeDate) === period && !['cancelled', 'forfeited'].includes(d.status));
      cards.push(U.kpi({ label: role === 'sale' ? 'Deal của tôi – ' + F.periodShort(period) : 'Deal chốt – ' + F.periodShort(period), value: inP.length, cap: mine.filter(d => d.status === 'closed').length + ' chờ nhận · ' + mine.filter(d => d.status === 'received' && F.period(d.moveInDate) === period).length + ' đã nhận · doanh số ' + F.vnd(inP.reduce((t, d) => t + d.price, 0)), icon: 'briefcase', tone: 'green' }));
      if (role === 'sale') { const leads = Q.salesScoped(S.all('leads')); cards.push(U.kpi({ label: 'Khách xem của tôi', value: leads.filter(l => !['closed', 'lost'].includes(l.status)).length, cap: 'đang chăm sóc · <a href="#/sales/leads">mở danh sách</a>', icon: 'eye', tone: 'amber' })); }
    }
    if (TH.auth.can('zalo.inbox') && Q.inboxScoped) { const ib = Q.inboxScoped().filter(x => x.status !== 'done'); cards.push(U.kpi({ label: 'Phản hồi Zalo chờ xử lý', value: ib.length, cap: (role === 'truongphong' ? 'gán cho nhánh của tôi' : 'toàn hệ thống') + ' · <a href="#/zalo/inbox">mở hộp thư</a>', icon: 'inbox', tone: ib.length ? 'amber' : 'gray' })); }
    // Phase 3: nhắc bảo dưỡng trên web (CH-32) – theo phạm vi tòa của vai trò / nhánh leader (F11)
    if (TH.ms.on('3') && TH.auth.can('maintenance.view') && Q.maintStats) { const ms = Q.maintStats(); cards.push(U.kpi({ label: 'Bảo dưỡng', value: ms.overdue + ' quá hạn', cap: ms.soon + ' việc trong ' + ms.remindDays + ' ngày tới · <a href="#/assets/maintenance?soon=1">mở lịch UI-35</a>', icon: 'wrench', tone: ms.overdue ? 'red' : ms.soon ? 'amber' : 'gray' })); }
    if (role === 'kythuat' && Q.repairsScoped) { const rs = Q.repairsScoped(S.all('repairLogs')).filter(r => r.status === 'draft'); cards.push(U.kpi({ label: 'Việc sửa chữa chờ xác nhận', value: rs.length, cap: '<a href="#/repairs">mở sổ sửa chữa</a>', icon: 'wrench', tone: 'blue' })); }
    return cards.length ? `<div class="grid grid-${Math.min(4, cards.length)} mt16">${cards.join('')}</div>` : '';
  };
  TH.router.handle('/dashboard', (root, p, q) => {
    const period = q.period || S.meta.period;
    const money = TH.auth.can('dashboard.money'), opsView = TH.auth.can('debts.viewStatus');
    const pe = TH.calc.dates.periodEnd(period); const dd = pe < F.today() ? pe : F.today(); const bs = scopeBuildings(q, dd); const bset = new Set(bs.map(b => b.id));
    const vac = Q.vacancy();
    const inB = (r) => bset.has(r.buildingId);
    const vNow = vac.now.filter(inB), vEnd = vac.endOfMonth.filter(inB), vWait = vac.waiting.filter(inB);
    const rooms = S.all('rooms').filter(r => inB(r) && r.exploitation !== 'meter_common');
    const invs = Q.invoicesOf(period).filter(i => bset.has(i.buildingId) && i.lifecycle !== 'draft');
    const main = invs.filter(i => !i.isBreach), br = invs.filter(i => i.isBreach);
    const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
    const due = sum(main, i => i.totalDue), paid = sum(main, i => Math.min(i.totalDue, Q.invState(i).paid)), remain = sum(main, i => Q.invState(i).remaining);
    const msDays = TH.calc.params.milestones(Q.param('milestones', F.periodEnd(period))).days;
    const byInv = {};
    S.all('payments').forEach(pm => { if (pm.status === 'reversed') return; pm.allocations.forEach(a => { const iv = Q.invoice(a.invoiceId); if (iv && iv.period === period && !iv.isBreach && bset.has(iv.buildingId)) (byInv[iv.id] = byInv[iv.id] || []).push({ receivedAt: pm.receivedAt, amount: a.amount }); }); });
    const perInv = Object.entries(byInv).map(([id, arr]) => { const due = Q.invoice(id).totalDue; return TH.calc.payments.milestoneCum(arr, period, msDays).map(m => Math.min(due, m.amount)); });
    const ms = msDays.map((d, k) => ({ day: d, amount: perInv.reduce((s, x) => s + x[k], 0) }));
    const debtors = main.filter(i => Q.invState(i).debt.state === 'debt');
    const exp = Q.expiring().filter(s => bset.has(s.buildingId));
    const zErr = S.where('zaloMessages', m => m.status === 'failed' && bset.has(m.buildingId));
    const refunds = S.where('refunds', r => !['paid'].includes(r.status) && bset.has(r.buildingId));
    const cleaning = rooms.filter(r => r.status === 'vacant_cleaning');
    const pctNow = due ? paid / due : 0;
    root.innerHTML = U.pageHead({ title: 'Tổng quan', sub: `${F.periodLabel(period)} · ${bs.length} tòa trong phạm vi · số liệu tính đến ${F.date(F.today())}` })
      + K.filters([
        { name: 'period', label: 'Kỳ', options: K.periodOpts(), value: S.meta.period, all: false },
        { name: 'group', label: 'Loại nhà', options: K.groupOpts() },
        { name: 'area', label: 'Khu vực', options: K.areaOpts() },
        { name: 'manager', label: 'Quản lý', options: K.managerOpts(dd) },
        { name: 'leader', label: 'Leader / trưởng nhóm', options: Q.teamLeaders(dd).map(e => [e.id, e.name + (e.status === 'inactive' || e.leftDate ? ' (đã nghỉ)' : '')]) },
        ...(TH.ms.on('2') && q.leader ? [{ name: 'direct', label: 'Phạm vi team', options: [['1', 'Chỉ team trực tiếp']], all: 'Cả nhánh (trực tiếp + gián tiếp)' }, { name: 'resp', label: 'Vai trò phụ trách', options: Q.RESP_FILTER.filter(x => x[0] !== 'operate'), all: 'Vận hành phòng' }] : []),
      ], q)
      + `<div class="grid grid-3 mt16">
        ${U.kpi({ label: 'Trống ở luôn', value: vNow.length, cap: 'phòng sẵn sàng, chưa có khách cọc', icon: 'door', tone: 'blue' })}
        ${U.kpi({ label: 'Trống cuối tháng', value: vEnd.length, cap: 'khách hết HĐ / báo trả trong tháng', icon: 'calendar-clock', tone: 'amber' })}
        ${U.kpi({ label: 'Đang chờ (đã cọc)', value: vWait.length, cap: 'khách đã cọc, chưa vào ở', icon: 'user-check', tone: 'purple' })}
      </div>`
      + (!opsView ? '' : `<div class="grid grid-4 mt16">
        ${U.kpi({ label: 'Phải thu kỳ ' + F.periodShort(period), value: money ? F.vnd(due) : main.length + ' HĐ', cap: money ? main.length + ' hóa đơn (không gồm phá HĐ)' : 'hóa đơn đã phát hành', icon: 'receipt', tone: 'blue' })}
        ${U.kpi({ label: 'Đã thu', value: money ? F.vnd(paid) : main.filter(i => Q.invState(i).remaining <= 0).length + ' HĐ', cap: F.pctv(pctNow) + ' số phải thu', icon: 'check-circle', tone: 'green', bar: Math.round(pctNow * 100) })}
        ${U.kpi({ label: 'Còn nợ', value: money ? F.vnd(remain) : main.filter(i => Q.invState(i).remaining > 0).length + ' HĐ', cap: debtors.length + ' hóa đơn đã thành công nợ (từ ngày 6)', icon: 'alert-triangle', tone: 'red' })}
        ${U.kpi({ label: 'Phá HĐ / bỏ trốn', value: br.length, cap: money ? 'còn thu ' + F.vnd(sum(br, i => Q.invState(i).remaining)) + ' (tiền điện)' : 'giữ cọc, chỉ thu tiền điện', icon: 'file-x', tone: 'orange' })}
      </div>`)
      + (TH.ms.on('2') ? p2Row(period, bset, q) : '')
      + (!opsView ? '' : `<div class="two-col mt16"><div class="side-stack">
        ${U.card({ title: 'Tiến độ thu theo mốc (ngày tiền thực nhận)', icon: 'activity', sub: `Mốc ${msDays.join('/')} (tham số) dùng đo tiến độ và tính lương – không phải hạn thanh toán; thu thừa không tính quá số phải thu`, body: `<div class="ms-bars">${ms.map(m => { const v = due ? Math.min(1, m.amount / due) : 0; return `<div class="ms-bar"><div class="row between"><b>Đến hết ngày ${m.day}/${Number(period.slice(5))}</b><span>${money ? F.vnd(m.amount) + ' · ' : ''}${F.pctv(v)}</span></div><div class="progress"><i style="width:${Math.min(100, v * 100)}%"></i></div></div>`; }).join('')}</div>` })}
        ${U.card({ title: 'Tòa cần chú ý', icon: 'building', sub: 'Xếp theo số còn nợ', body: '<div id="db-bld"></div>', bodyCls: 'flush' })}
      </div><div class="side-stack">
        ${U.card({ title: 'Việc cần xử lý', icon: 'clipboard-check', body: `<div class="todo">
          <a class="todo-it" href="#/tenants?view=expiring">${I('calendar-clock')}<span>HĐ sắp hết hạn (≤ ${Q.param('expiryWarnDays')} ngày)</span><b>${exp.length}</b></a>
          <a class="todo-it" href="#/billing/debts">${I('alert-triangle')}<span>Hóa đơn đã thành công nợ</span><b>${debtors.length}</b></a>
          <a class="todo-it" href="#/zalo?tab=nhat-ky&status=failed">${I('message')}<span>Tin Zalo gửi lỗi</span><b>${zErr.length}</b></a>
          <a class="todo-it" href="#/refunds?status=open">${I('hand-coins')}<span>Hoàn cọc đang xử lý</span><b>${refunds.length}</b></a>
          <a class="todo-it" href="#/buildings?roomStatus=vacant_cleaning">${I('brush')}<span>Phòng trống cần kiểm tra/dọn</span><b>${cleaning.length}</b></a>
        </div>` })}
        ${U.card({ title: 'Hợp đồng sắp hết hạn', icon: 'calendar', body: exp.slice(0, 6).map(s => `<a class="mini-row" href="#/stays/${s.id}"><span class="code">${esc(Q.roomCode(s.roomId))}</span><span class="grow truncate">${esc((Q.customer(s.customerId) || {}).name || '')}</span><span class="muted">${F.date(s.endDate)} · còn ${F.daysBetween(F.today(), s.endDate)} ngày</span></a>`).join('') || U.empty({ title: 'Không có hợp đồng sắp hết hạn' }) })}
      </div></div>`);
    K.bindFilters(root, []);
    if (!opsView) return; // sale / kỹ thuật: không xem công nợ, tiến độ thu (CH-01)
    const rows = bs.map(b => {
      const bi = main.filter(i => i.buildingId === b.id);
      const d = sum(bi, i => i.totalDue), r = sum(bi, i => Q.invState(i).remaining);
      const bRooms = (Q.roomsByBuilding()[b.id] || []).filter(x => x.exploitation !== 'meter_common');
      const occ = bRooms.filter(x => Q.currentStay(x.id)).length;
      return { b, due: d, remain: r, pct: d ? (d - r) / d : 1, rooms: bRooms.length, occ, mgr: (Q.managerMap(dd)[b.id] || {}).name || 'Chưa phân công' };
    }).sort((a, b) => b.remain - a.remain);
    U.table(root.querySelector('#db-bld'), { rows, pageSize: 8, rowHref: r => '#/buildings/' + r.b.id, cols: [
      { key: 'b', label: 'Tòa', render: r => `<b>${esc(r.b.code)}</b> <span class="muted small">${r.b.group}</span>` },
      { key: 'mgr', label: 'Quản lý', render: r => esc(r.mgr) },
      { key: 'occ', label: 'Lấp đầy', num: true, render: r => `${r.occ}/${r.rooms}` },
      { key: 'pct', label: '% thu', num: true, sortable: true, render: r => F.pctv(r.pct) },
      { key: 'remain', label: 'Còn nợ', num: true, sortable: true, render: r => money ? F.vnd(r.remain) : (r.remain > 0 ? U.chip('Còn nợ', 'amber') : U.chip('Đủ', 'green')) },
    ] });
  });
})(window.TH);
