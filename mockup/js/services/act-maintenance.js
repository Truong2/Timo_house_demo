/* Phase 3 – Lịch bảo dưỡng & kết quả (UI-35; đặc tả dòng 549, CH-32, F10, F11). Không có SLA / duyệt nhiều cấp.
   Mỗi lần bảo dưỡng là một bản ghi; khai báo chu kỳ thì hoàn thành tự tạo lần kế tiếp. Chi phí ghi qua UI-15 (thang máy → dòng 27 bảo trì thang máy, còn lại dòng 41 sửa chữa; nguồn "maintenance")
   – chứng từ bảo dưỡng là bản gốc duy nhất, không tự sinh việc sửa chữa UI-47. Nhắc trước maintRemindDays ngày trên web và Zalo nội bộ (UI-39). */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, MT = TH.calc.assets.maint;
  const fail = (fields, msg = 'Dữ liệu chưa hợp lệ') => { const e = new Error(msg); e.fields = fields; throw e; };
  const remind = () => Number(Q.param('maintRemindDays')) || 7;
  const withState = (t) => Object.assign({}, t, { state: MT.state(t, F.today(), remind()) });
  Q.maintTask = (id) => S.get('maintenanceTasks', id);
  /* Theo phạm vi tòa (leader / trưởng phòng theo nhánh – F11); f: {building, assetType, status(planned|done|overdue|cancelled), soon, leader, assignee, performer, from, to, asset} */
  Q.maintTasks = (f = {}) => S.all('maintenanceTasks').filter(t => TH.auth.inScope(t.buildingId)).map(withState).filter(t => (!f.building || t.buildingId === f.building) && (!f.asset || t.assetId === f.asset)
    && (!f.assetType || t.assetType === f.assetType) && (!f.status || t.state.status === f.status) && (!f.soon || (t.state.status === 'planned' && t.state.soon))
    && (!f.leader || t.leaderId === f.leader) && (!f.assignee || t.assigneeId === f.assignee) && (!f.performer || t.performerId === f.performer)
    && (!f.from || (t.doneDate || t.dueDate) >= f.from) && (!f.to || (t.doneDate || t.dueDate) <= f.to));
  Q.maintOfAsset = (id) => S.where('maintenanceTasks', t => t.assetId === id).map(withState).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  Q.maintOfBuilding = (bid) => S.where('maintenanceTasks', t => t.buildingId === bid).map(withState);
  Q.maintNextOfAsset = (id) => S.where('maintenanceTasks', t => t.assetId === id && t.status === 'planned').map(withState).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] || null;
  Q.maintStats = (f = {}) => { const ts = Q.maintTasks({ building: f.building }); return { overdue: ts.filter(t => t.state.status === 'overdue').length, soon: ts.filter(t => t.state.status === 'planned' && t.state.soon).length, planned: ts.filter(t => t.state.status === 'planned').length, remindDays: remind() }; };
  /* Việc cần nhắc (Zalo nội bộ, CH-32): còn dự kiến, hạn trong [hôm nay, hôm nay + N] */
  Q.maintDueForReminder = (buildingIds) => { const set = buildingIds && buildingIds.length ? new Set(buildingIds) : null;
    return S.all('maintenanceTasks').map(withState).filter(t => t.state.status === 'planned' && t.state.soon && (!set || set.has(t.buildingId))); };
  const nextCode = (date) => S.nextCode('maintenanceTasks', 'BD-' + date.slice(0, 7).replace('-', '') + '-', 4);
  const checkPeople = (d, errs) => {
    ['leaderId', 'assigneeId', 'performerId'].forEach(k => { if (d[k] && !Q.emp(d[k])) errs[k] = 'Nhân viên không tồn tại'; });
  };
  /* Ghi bản ghi (không kiểm quyền) – dùng cho lập lịch, lần kế tiếp và seed */
  X._createMaint = (d) => {
    const a = Q.asset(d.assetId); const code = d.code || nextCode(d.dueDate);
    return S.add('maintenanceTasks', { id: d.id || 'bd_' + code.replace(/-/g, '_'), code, assetId: a.id, buildingId: a.buildingId, assetType: a.type, kind: d.kind || MT.KINDS[a.type] || MT.KINDS.other,
      cycleMonths: d.cycleMonths ? Number(d.cycleMonths) : null, dueDate: d.dueDate, leaderId: d.leaderId || null, assigneeId: d.assigneeId || null, performerId: null, vendor: d.vendor || '',
      status: 'planned', doneDate: null, result: '', photos: [], note: d.note || '', expenseId: null, repairLogIds: [], prevId: d.prevId || null, nextId: null, remindedAt: null, createdBy: d.by || _.who(), createdAt: F.nowISO() });
  };
  X.planMaintenance = (d) => {
    _.need('maintenance.plan'); _.needMs('3', 'Lịch bảo dưỡng (UI-35)');
    const errs = {}; const a = d.assetId ? Q.asset(d.assetId) : null;
    if (!a) errs.assetId = 'Chọn thiết bị / tài sản';
    else if (a.status !== 'active') errs.assetId = 'Tài sản không còn sử dụng';
    else if (!TH.auth.inScope(a.buildingId)) errs.assetId = 'Tài sản ngoài phạm vi tòa được giao';
    if (!d.dueDate) errs.dueDate = 'Nhập ngày dự kiến (hoặc chọn chu kỳ)';
    if (d.cycleMonths && !(Number(d.cycleMonths) >= 1)) errs.cycleMonths = 'Chu kỳ là số tháng ≥ 1';
    if (!d.assigneeId && !String(d.vendor || '').trim()) errs.assigneeId = 'Chọn người được giao hoặc ghi đơn vị thực hiện';
    checkPeople(d, errs);
    if (Object.keys(errs).length) fail(errs);
    const t = X._createMaint(d);
    _.audit('create', 'maintenance', t.id, `Lập lịch ${t.code}: ${t.kind} – ${a.code} hạn ${F.date(t.dueDate)}${t.cycleMonths ? ' · chu kỳ ' + t.cycleMonths + ' tháng' : ''}`); _.done(); return t;
  };
  X.updateMaintenance = (id, d) => {
    _.need('maintenance.plan'); _.needMs('3', 'Lịch bảo dưỡng (UI-35)');
    const t = Q.maintTask(id); if (!t) throw new Error('Không tìm thấy lịch'); if (t.status !== 'planned') throw new Error('Chỉ sửa lịch còn dự kiến');
    const errs = {}; checkPeople(d, errs); if (d.dueDate === '') errs.dueDate = 'Nhập ngày dự kiến'; if (Object.keys(errs).length) fail(errs);
    const patch = {}; ['dueDate', 'leaderId', 'assigneeId', 'vendor', 'note', 'kind'].forEach(k => { if (d[k] !== undefined) patch[k] = d[k] || (k === 'dueDate' ? t.dueDate : null); });
    if (patch.dueDate && patch.dueDate !== t.dueDate) patch.remindedAt = null; // đổi hạn → nhắc lại theo hạn mới (tin cũ bị bỏ qua khi kiểm tra lại)
    S.update('maintenanceTasks', id, patch); _.audit('update', 'maintenance', id, 'Sửa lịch ' + t.code); _.done(); return Q.maintTask(id);
  };
  /* Đánh dấu đã thực hiện: ngày làm, người làm / đơn vị, kết quả, ảnh; tùy chọn ghi chi phí UI-15; có chu kỳ → tạo lần kế tiếp */
  X.completeMaintenance = (id, d) => {
    _.need('maintenance.done'); _.needMs('3', 'Lịch bảo dưỡng (UI-35)');
    const t = Q.maintTask(id); if (!t) throw new Error('Không tìm thấy lịch');
    if (t.status !== 'planned') throw new Error('Lịch đã ' + MT.STATUS[t.status][0].toLowerCase());
    if (!TH.auth.inScope(t.buildingId)) throw new Error('Lịch ngoài phạm vi tòa được giao');
    const errs = {}; const doneDate = d.doneDate || F.today();
    if (doneDate > F.today()) errs.doneDate = 'Ngày thực hiện không sau hôm nay';
    if (!String(d.result || '').trim()) errs.result = 'Ghi kết quả bảo dưỡng';
    if (!d.performerId && !String(d.vendor || t.vendor || '').trim()) errs.performerId = 'Chọn người thực hiện hoặc ghi đơn vị';
    checkPeople(d, errs);
    const cost = Number(d.cost) || 0;
    if (cost < 0) errs.cost = 'Chi phí không âm';
    if (cost > 0 && !TH.auth.can('expenses.manage')) errs.cost = 'Ghi chi phí cần quyền kế toán (UI-15) – để trống, kế toán ghi sau';
    // Thang máy: phí bảo trì là giá dịch vụ đầu vào (giá vốn dòng 27), không phải sửa chữa phát sinh (dòng 41)
    const category = d.costCategory || MT.costCategory(t.assetType);
    if (cost > 0 && !Object.keys(MT.COST_CATEGORIES).includes(category)) errs.costCategory = 'Loại chi phí bảo dưỡng không hợp lệ';
    (d.photos || []).forEach(f => { if (!/\.(jpe?g|png|heic|pdf)$/i.test(f.name || '')) errs.photos = 'Ảnh / biên bản: JPG, PNG, HEIC hoặc PDF'; });
    if (Object.keys(errs).length) fail(errs);
    let expenseId = null;
    if (cost > 0) { const e = X.addExpense({ category, scope: 'building', buildingId: t.buildingId, amount: cost, date: doneDate, period: d.costPeriod || F.period(doneDate), vendor: d.vendor || t.vendor || '', source: 'maintenance', refId: t.id, note: 'Bảo dưỡng ' + t.code + ' – ' + t.kind }, true); expenseId = e.id; }
    let next = null;
    if (t.cycleMonths) next = X._createMaint({ assetId: t.assetId, kind: t.kind, cycleMonths: t.cycleMonths, dueDate: MT.nextDue(t.dueDate, doneDate, t.cycleMonths), leaderId: t.leaderId, assigneeId: t.assigneeId, vendor: t.vendor, prevId: t.id });
    S.update('maintenanceTasks', id, { status: 'done', doneDate, performerId: d.performerId || null, vendor: d.vendor || t.vendor || '', result: String(d.result).trim(), note: d.note || t.note || '',
      photos: (d.photos || []).map(f => ({ name: f.name, size: f.size || 0, at: F.nowISO(), by: _.who() })), expenseId, nextId: next ? next.id : null, doneBy: _.who() });
    _.audit('update', 'maintenance', id, `Hoàn thành ${t.code} ngày ${F.date(doneDate)}${expenseId ? ' · chi phí ' + F.vnd(cost) : ''}${next ? ' · lần kế tiếp ' + next.code + ' hạn ' + F.date(next.dueDate) : ''}`);
    _.done(); return { task: Q.maintTask(id), next };
  };
  X.cancelMaintenance = (id, reason) => {
    _.need('maintenance.plan'); _.needMs('3', 'Lịch bảo dưỡng (UI-35)');
    const t = Q.maintTask(id); if (!t) throw new Error('Không tìm thấy lịch'); if (t.status !== 'planned') throw new Error('Chỉ hủy lịch còn dự kiến');
    if (!String(reason || '').trim()) fail({ reason: 'Nhập lý do hủy' });
    S.update('maintenanceTasks', id, { status: 'cancelled', cancelReason: reason, cancelledBy: _.who() }); _.audit('update', 'maintenance', id, `Hủy lịch ${t.code}: ${reason}`); _.done();
  };
})(window.TH);
