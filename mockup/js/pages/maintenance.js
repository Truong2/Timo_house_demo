/* Phase 3 – UI-35 Lịch bảo dưỡng & kết quả (đặc tả dòng 549; CH-32; plan mockup v1.1: leader/team, người được giao, người thực hiện).
   Khác ảnh cũ: trạng thái chỉ Dự kiến / Đã thực hiện / Quá hạn (bỏ "Đang thực hiện" – đặc tả không có SLA); "Sắp đến hạn" là cờ nhắc trước N ngày;
   có loại bảo dưỡng, đơn vị thực hiện, ghi chú; hoàn thành tự tạo lần kế tiếp theo chu kỳ; chi phí ghi qua UI-15. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc, A = TH.auth, AS = TH.calc.assets, MT = AS.maint;
  TH.pages.maintChip = (t) => { const st = t.state || MT.state(t, F.today(), Number(Q.param('maintRemindDays')) || 7); const m = MT.STATUS[st.status];
    return U.chip(m[0], m[1], true) + (st.status === 'planned' && st.soon ? ' ' + U.chip('sắp đến hạn', 'amber') : ''); };
  const empName = (id) => id ? esc((Q.emp(id) || {}).name || '') : '';
  const opsEmps = () => S.all('employees').filter(e => e.status === 'active' && ['NVVH', 'TNVH', 'TPVH', 'KỸ THUẬT', 'QL TỔNG'].includes(e.title)).map(e => [e.id, e.name + ' – ' + e.title]);
  const leaders = () => S.all('employees').filter(e => e.status === 'active' && ['TPVH', 'TNVH'].includes(e.title)).map(e => [e.id, e.name + ' – ' + e.title]);
  const dueText = (t) => { const d = t.state.days; return t.state.status === 'done' || t.state.status === 'cancelled' || d == null ? '' : d < 0 ? `<br><small class="red">quá ${-d} ngày</small>` : `<br><small class="muted">còn ${d} ngày</small>`; };

  TH.router.handle('/assets/maintenance', (root, p, q) => {
    const f = { building: q.building, assetType: q.type, status: q.status, soon: q.soon === '1', leader: q.leader, assignee: q.assignee, performer: q.performer, from: q.from, to: q.to, asset: q.asset };
    const RK = { overdue: 0, planned: 1, done: 2, cancelled: 3 }; // quá hạn → dự kiến (gần nhất trước) → đã làm (mới nhất trước)
    const rows = Q.maintTasks(f).sort((a, b) => RK[a.state.status] - RK[b.state.status] || (a.state.status === 'done' ? (b.doneDate || '').localeCompare(a.doneDate || '') : a.dueDate.localeCompare(b.dueDate)));
    const st = Q.maintStats({ building: q.building }); const month = F.period(F.today());
    const inMonth = Q.maintTasks({ building: q.building }).filter(t => (t.doneDate || t.dueDate).slice(0, 7) === month);
    const cost = inMonth.filter(t => t.expenseId).reduce((s, t) => s + ((S.get('expenses', t.expenseId) || {}).amount || 0), 0);
    const asset = q.asset ? Q.asset(q.asset) : null;
    root.innerHTML = U.pageHead({ title: 'Lịch bảo dưỡng & kết quả', sub: `Thiết bị theo UI-34 · nhắc trước ${st.remindDays} ngày trên web và Zalo nội bộ (CH-32, tham số UI-38) · chi phí ghi UI-15 dòng 41 · không có quy trình SLA / duyệt nhiều cấp`,
      acts: [U.btn({ label: 'Xuất lịch', icon: 'download', act: 'exp' }), U.btn({ label: 'Lập lịch bảo dưỡng', icon: 'plus', cls: 'btn-primary', act: 'plan', perm: 'maintenance.plan' })] })
      + TH.pages.assetNav('/assets/maintenance')
      + '<nav class="subnav" aria-label="Loại lịch bảo dưỡng">'+[['','Tất cả'],...AS.TYPES.filter(([key])=>['elevator','pump','washer','water_filter'].includes(key))].map(([key,label])=>'<a class="'+((q.type||'')===key?'on':'')+'" href="'+esc(TH.router.href('/assets/maintenance',{...q,type:key||undefined}))+'">'+esc(label)+'</a>').join('')+'<a href="#/assets/inventory?type=decor">Kiểm kê đồ décor</a></nav>'
      + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Lịch trong tháng ' + F.periodShort(month), value: inMonth.length, cap: inMonth.filter(t => t.state.status === 'done').length + ' đã thực hiện · ' + st.planned + ' dự kiến (mọi kỳ)', icon: 'calendar', tone: 'blue' })}
        ${U.kpi({ label: 'Quá hạn', value: st.overdue, cap: 'quá ngày dự kiến, chưa ghi kết quả', icon: 'alert-triangle', tone: st.overdue ? 'red' : 'gray' })}
        ${U.kpi({ label: 'Sắp đến hạn ' + st.remindDays + ' ngày', value: st.soon, cap: 'cờ nhắc – vẫn là "Dự kiến"', icon: 'bell', tone: st.soon ? 'amber' : 'gray' })}
        ${A.can('expenses.view') ? U.kpi({ label: 'Chi phí bảo dưỡng tháng', value: F.vnd(cost), cap: 'chứng từ UI-15 gắn lịch', icon: 'wallet', tone: 'purple' }) : U.kpi({ label: 'Đã thực hiện tháng', value: inMonth.filter(t => t.state.status === 'done').length, icon: 'check-circle', tone: 'green' })}</div>`
      + (asset ? U.note('info', 'Đang xem lịch của ' + esc(asset.code) + ' – ' + esc(asset.name), `<a href="#/assets/maintenance">Bỏ lọc tài sản</a>`) : '')
      + K.filters([{ name: 'building', label: 'Tòa', options: K.buildingOpts() }, { name: 'type', label: 'Loại thiết bị', options: AS.TYPES }, { name: 'status', label: 'Trạng thái', options: [['planned', 'Dự kiến'], ['done', 'Đã thực hiện'], ['overdue', 'Quá hạn'], ['cancelled', 'Đã hủy']] },
        { name: 'soon', label: 'Nhắc', options: [['1', 'Chỉ sắp đến hạn']], all: 'Tất cả' }, { name: 'leader', label: 'Leader / team', options: leaders() }, { name: 'assignee', label: 'Người được giao', options: opsEmps() },
        { name: 'performer', label: 'Người thực hiện', options: opsEmps() }, { name: 'from', label: 'Từ ngày', type: 'date' }, { name: 'to', label: 'Đến ngày', type: 'date' }], q)
      + '<div id="tb" class="mt16"></div>';
    K.bindFilters(root, q.asset ? ['asset'] : []);
    const tb = root.querySelector('#tb'); tb.innerHTML = K.tableCard('t', rows.length + ' lần bảo dưỡng');
    U.table(tb.querySelector('#t'), { rows, pageSize: 25, rowClass: t => t.state.status === 'overdue' ? 'tint-red' : t.state.soon ? 'tint-amber' : '', cols: [
      { key: 'c', label: 'Mã', render: t => `<b>${esc(t.code)}</b>` },
      { key: 'a', label: 'Tài sản / tòa', render: t => { const a = Q.asset(t.assetId) || {}; return `<a href="#/assets?building=${t.buildingId}&asset=${a.id}">${esc(a.code || '')}</a> ${esc(a.name || '')}<br><small class="muted">${esc((Q.building(t.buildingId) || {}).code || '')}${a.roomId ? ' · ' + esc(Q.roomCode(a.roomId)) : a.position ? ' · ' + esc(a.position) : ''}</small>`; } },
      { key: 'k', label: 'Loại bảo dưỡng', render: t => esc(t.kind) }, { key: 'cy', label: 'Chu kỳ', render: t => t.cycleMonths ? esc((MT.CYCLES.find(c => c[0] === t.cycleMonths) || [0, t.cycleMonths + ' tháng'])[1]) : '<span class="muted">nhập tay</span>' },
      { key: 'd', label: 'Ngày dự kiến', sortable: true, sortVal: t => t.dueDate, render: t => F.date(t.dueDate) + dueText(t) },
      { key: 'l', label: 'Leader / team', render: t => empName(t.leaderId) || '–' }, { key: 'g', label: 'Người được giao', render: t => empName(t.assigneeId) || '<span class="muted">–</span>' },
      { key: 'pf', label: 'Người thực hiện / đơn vị', render: t => [empName(t.performerId), esc(t.vendor || '')].filter(Boolean).join('<br><small class="muted">') + (t.performerId && t.vendor ? '</small>' : '') || '–' },
      { key: 's', label: 'Trạng thái', render: t => TH.pages.maintChip(t) }, { key: 'dd', label: 'Ngày thực hiện', render: t => t.doneDate ? F.date(t.doneDate) : '–' },
      { key: 'r', label: 'Kết quả', render: t => `<span class="small">${esc(t.result || t.cancelReason || '')}</span>` },
      ...(A.can('expenses.view') ? [{ key: 'cp', label: 'Chi phí', render: t => { const e = t.expenseId ? S.get('expenses', t.expenseId) : null; return e ? `<a href="#/expenses?period=${e.period}&q=${encodeURIComponent(e.code)}">${esc(e.code)}</a><br><small>${F.vnd(e.amount)}</small>` : '–'; } }] : []),
      { key: 'ph', label: 'Ảnh / ghi chú', render: t => ((t.photos || []).length ? U.chip(t.photos.length + ' ảnh', 'blue') + ' ' : '') + `<span class="small muted">${esc(t.note || '')}</span>` },
      { key: 'sc', label: 'Sửa chữa UI-47', render: t => (t.repairLogIds || []).length ? `<a href="#/repairs?building=${t.buildingId}">${t.repairLogIds.length} việc</a>` : '–' },
      { key: 'x', label: '', render: t => t.status !== 'planned' ? (t.nextId ? `<small class="muted">kế tiếp ${esc((Q.maintTask(t.nextId) || {}).code || '')}</small>` : '') :
        U.actBtn({ icon: 'check-circle', label: 'Hoàn thành', act: 'done', attrs: { 'data-id': t.id }, perm: 'maintenance.done' }) + U.actBtn({ icon: 'pencil', label: 'Sửa lịch', act: 'edit', attrs: { 'data-id': t.id }, perm: 'maintenance.plan' }) + U.actBtn({ icon: 'x-circle', label: 'Hủy', act: 'cancel', attrs: { 'data-id': t.id }, perm: 'maintenance.plan' }) }] });
    U.bind(root, {
      plan: () => planForm(q.asset || null, q.building),
      done: (el) => doneForm(Q.maintTask(el.dataset.id)),
      edit: (el) => { const t = Q.maintTask(el.dataset.id); K.formDrawer({ title: 'Sửa lịch ' + t.code, modal: true, fields: [{ name: 'dueDate', label: 'Ngày dự kiến', type: 'date', value: t.dueDate, req: true }, { name: 'kind', label: 'Loại bảo dưỡng', value: t.kind },
        { name: 'leaderId', label: 'Leader / team', type: 'select', options: leaders(), value: t.leaderId || '' }, { name: 'assigneeId', label: 'Người được giao', type: 'select', options: opsEmps(), value: t.assigneeId || '' }, { name: 'vendor', label: 'Đơn vị thực hiện', value: t.vendor || '' }, { name: 'note', label: 'Ghi chú', value: t.note || '', span: true }],
        submit: 'Lưu', onSubmit: (x) => { X.updateMaintenance(t.id, x); U.toast('ok', 'Đã lưu lịch'); } }); },
      cancel: (el) => K.formDrawer({ title: 'Hủy lịch bảo dưỡng', modal: true, size: 'sm', fields: [{ name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Hủy lịch', onSubmit: (x) => { X.cancelMaintenance(el.dataset.id, x.reason); U.toast('ok', 'Đã hủy lịch'); } }),
      exp: () => K.xls('lich-bao-duong.xls', 'Bảo dưỡng', ['Lịch bảo dưỡng & kết quả (UI-35)', ['Xuất lúc', F.datetime(F.nowISO())]], ['Mã', 'Tài sản', 'Tòa', 'Loại bảo dưỡng', 'Chu kỳ (tháng)', 'Ngày dự kiến', 'Leader', 'Người được giao', 'Người thực hiện', 'Đơn vị', 'Trạng thái', 'Sắp đến hạn', 'Ngày thực hiện', 'Kết quả'],
        rows.map(t => [t.code, ((Q.asset(t.assetId) || {}).code || '') + ' ' + ((Q.asset(t.assetId) || {}).name || ''), (Q.building(t.buildingId) || {}).code, t.kind, t.cycleMonths || 'nhập tay', t.dueDate, (Q.emp(t.leaderId) || {}).name || '', (Q.emp(t.assigneeId) || {}).name || '', (Q.emp(t.performerId) || {}).name || '', t.vendor || '', MT.STATUS[t.state.status][0], t.state.soon ? 'có' : '', t.doneDate || '', t.result || ''])),
    });
  });

  const planForm = (assetId, bid) => {
    const assets = Q.assets({ building: bid || '' }).filter(a => a.status === 'active');
    const d = K.formDrawer({ title: 'Lập lịch bảo dưỡng', sub: 'Chọn chu kỳ để hệ thống tự tạo lần kế tiếp khi hoàn thành; hoặc chỉ nhập ngày (nhập tay).', fields: [
      { name: 'assetId', label: 'Thiết bị / tài sản', type: 'select', req: true, value: assetId || '', options: assets.sort((x, y) => (x.type === 'other') - (y.type === 'other') || x.code.localeCompare(y.code)).map(a => [a.id, a.code + ' – ' + a.name + ' (' + AS.typeLabel(a.type) + ')']), span: true },
      { name: 'kind', label: 'Loại bảo dưỡng', placeholder: 'Để trống = theo loại thiết bị' }, { name: 'cycleMonths', label: 'Chu kỳ', type: 'select', options: MT.CYCLES, placeholder: 'Không – nhập tay' },
      { name: 'dueDate', label: 'Ngày dự kiến', type: 'date', req: true, value: F.today() }, { name: 'leaderId', label: 'Leader / team', type: 'select', options: leaders() },
      { name: 'assigneeId', label: 'Người được giao', type: 'select', options: opsEmps() }, { name: 'vendor', label: 'Đơn vị thực hiện (thuê ngoài)' }, { name: 'note', label: 'Ghi chú', span: true }],
      submit: 'Lập lịch', onSubmit: (x) => { const t = X.planMaintenance(x); U.toast('ok', 'Đã lập lịch ' + t.code); } });
    return d;
  };
  const doneForm = (t) => {
    const nextTxt = t.cycleMonths ? `Chu kỳ ${t.cycleMonths} tháng – sau khi lưu, hệ thống tạo lần kế tiếp dự kiến ${F.date(MT.nextDue(t.dueDate, F.today(), t.cycleMonths))}.` : 'Lịch nhập tay – không tạo lần kế tiếp.';
    K.formDrawer({ title: 'Hoàn thành ' + t.code, sub: esc(t.kind) + ' · ' + esc(((Q.asset(t.assetId) || {}).code || '')), note: U.note('info', 'Lần kế tiếp', nextTxt), fields: [
      { name: 'doneDate', label: 'Ngày thực hiện', type: 'date', value: F.today(), req: true }, { name: 'performerId', label: 'Người thực hiện', type: 'select', options: opsEmps(), value: TH.auth.role() === 'kythuat' ? S.session.employeeId : '' },
      { name: 'vendor', label: 'Đơn vị thực hiện', value: t.vendor || '' }, ...(A.can('expenses.manage') ? [{ name: 'cost', label: 'Chi phí (ghi chứng từ UI-15)', type: 'money' }, { name: 'costCategory', label: 'Loại chi phí', type: 'select', options: Object.entries(TH.calc.assets.maint.COST_CATEGORIES), value: TH.calc.assets.maint.costCategory(t.assetType) }] : []),
      { name: 'result', label: 'Kết quả', type: 'textarea', req: true, span: true }, { name: 'note', label: 'Ghi chú', span: true },
      { type: 'html', span: true, html: U.field({ label: 'Ảnh hiện trường / biên bản', input: U.dropzone({ name: 'photos', hint: 'JPG, PNG, HEIC, PDF', multiple: true }) }) }],
      submit: 'Lưu kết quả', onSubmit: (x, dd) => { const r = X.completeMaintenance(t.id, Object.assign(x, { photos: U.dzFiles(dd.el, 'photos') })); U.toast('ok', 'Đã ghi kết quả ' + t.code, r.next ? 'Lần kế tiếp ' + r.next.code + ' – ' + F.date(r.next.dueDate) : ''); } });
  };
})(window.TH);
