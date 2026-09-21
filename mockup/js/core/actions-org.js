/* Actions – Spec v1.8 Wave 1: cơ cấu tổ chức (§4.23, §12.17), phân công tòa nhà workflow (§4.25, §12.19), ký hiệu loại tòa có hiệu lực (§4.6), master data (§7.5).
   Nguyên tắc: managerId trên Tòa/Phòng/HĐ/Khách chỉ là cache dẫn xuất (§10.17); mọi thay đổi quản lý đi qua X.createAssignment / X.changeManager. */
(function (TH) {
  const F = TH.f, Q = TH.q, St = TH.store, Au = TH.auth, X = TH.actions, seed = TH.seed;
  const err = (m) => { throw new Error(m); };
  const req = (v, m) => { if (v === undefined || v === null || v === '' || (typeof v === 'number' && isNaN(v))) err(m); return v; };
  const me = () => (St.state.session || {}).userId || null;
  const done = () => { St.save(); St.emit('change'); };
  const audit = (action, type, id, summary, extra) => St.audit(action, type, id, summary, extra || {});
  const snap = (o, keys) => { const out = {}; keys.forEach(k => { out[k] = o ? o[k] : undefined; }); return out; };

  /* ---------- Dẫn xuất: quản lý tòa từ assignment ---------- */
  X.activateDueAssignments = (date = F.today()) => { const n = seed.activateDueAssignments(St.state, date); if (n) { seed.syncDerivedManagers(St.state, date); St.save(); } return n; };
  X.syncDerivedManagers = (date = F.today()) => { seed.syncDerivedManagers(St.state, date); St.save(); };

  /* ---------- Master data (§7.5) ---------- */
  X.saveMasterData = (d) => {
    Au.need('masterData.manage'); req(d.kind, 'Loại danh mục'); req(d.name, 'Tên là bắt buộc');
    if (d.id) { const old = St.rawGet('masterData', d.id); const before = snap(old, ['name', 'status', 'color', 'day']); const x = St.update('masterData', d.id, d); audit('update', 'masterData', x.id, 'Cập nhật danh mục ' + d.kind + ' · ' + x.name, { before, after: snap(x, ['name', 'status', 'color', 'day']), reason: d.reason }); done(); return x; }
    const code = d.code || (String(d.kind).toUpperCase().slice(0, 3) + F.pad(St.rawAll('masterData').filter(m => m.kind === d.kind).length + 1, 2));
    if (St.rawAll('masterData').some(m => m && m.kind === d.kind && m.code === code)) err('Mã ' + code + ' đã tồn tại trong danh mục');
    const x = St.add('masterData', Object.assign({ status: 'active', sortOrder: St.rawAll('masterData').filter(m => m.kind === d.kind).length + 1 }, d, { code }));
    audit('create', 'masterData', x.id, 'Thêm danh mục ' + d.kind + ' · ' + x.name); done(); return x;
  };
  X.toggleMasterData = (id) => { Au.need('masterData.manage'); const x = St.rawGet('masterData', id); if (!x) err('Không tìm thấy'); const before = x.status; x.status = x.status === 'inactive' ? 'active' : 'inactive'; audit('update', 'masterData', id, (x.status === 'inactive' ? 'Ngừng dùng ' : 'Kích hoạt ') + x.name, { before: { status: before }, after: { status: x.status } }); done(); return x; };

  /* ---------- Cơ cấu tổ chức (§4.23, §12.17) ---------- */
  X.saveOrgUnit = (d) => {
    Au.need('org.manage'); req(d.name, 'Tên đơn vị là bắt buộc'); req(d.type, 'Loại đơn vị');
    if (d.parentId && d.id) { if (Q.orgDescendants(d.id).includes(d.parentId)) err('Không thể đặt đơn vị cha là đơn vị con của chính nó (cây không có chu trình)'); }
    if (d.id) { const old = St.rawGet('orgUnits', d.id); const before = snap(old, ['name', 'type', 'parentId', 'effectiveFrom', 'effectiveTo', 'status']); const u = St.update('orgUnits', d.id, { name: d.name, type: d.type, parentId: d.parentId || null, effectiveFrom: d.effectiveFrom || old.effectiveFrom, effectiveTo: d.effectiveTo || '', note: d.note || '' }); audit('update', 'orgUnit', u.id, 'Cập nhật đơn vị ' + u.name, { before, after: snap(u, ['name', 'type', 'parentId', 'effectiveFrom', 'effectiveTo', 'status']), reason: d.reason }); done(); return u; }
    const code = d.code || St.nextCode('orgUnits', 'DV', 2);
    if (St.rawAll('orgUnits').some(u => u && u.code === code)) err('Mã đơn vị ' + code + ' đã tồn tại');
    const u = St.add('orgUnits', { code, name: d.name, type: d.type, parentId: d.parentId || null, leadEmployeeId: null, leadHistory: [], effectiveFrom: d.effectiveFrom || F.today(), effectiveTo: '', status: 'active', note: d.note || '' });
    audit('create', 'orgUnit', u.id, 'Tạo đơn vị ' + u.name + (u.parentId ? ' thuộc ' + Q.orgUnit(u.parentId).name : '')); done(); return u;
  };
  X.moveOrgUnit = (id, parentId, effectiveFrom, reason) => {
    Au.need('org.manage'); const u = St.rawGet('orgUnits', id); if (!u) err('Không tìm thấy đơn vị');
    if (parentId && Q.orgDescendants(id).includes(parentId)) err('Không thể chuyển vào đơn vị con của chính nó');
    const before = { parentId: u.parentId }; u.moveHistory = u.moveHistory || []; u.moveHistory.push({ from: u.parentId, to: parentId || null, effectiveFrom: effectiveFrom || F.today(), reason: reason || '', by: me(), at: F.nowISO() }); u.parentId = parentId || null;
    audit('move', 'orgUnit', id, 'Chuyển ' + u.name + ' sang ' + (parentId ? Q.orgUnit(parentId).name : 'gốc'), { before, after: { parentId: u.parentId }, reason }); done(); return u;
  };
  // Đúng một Lead hiệu lực tại một thời điểm; nhiệm kỳ cũ kết thúc ngày hiệu lực − 1, không ghi đè (§4.23)
  X.setOrgLead = (id, employeeId, effectiveFrom, reason) => {
    Au.need('org.manage'); const u = St.rawGet('orgUnits', id); if (!u) err('Không tìm thấy đơn vị'); req(employeeId, 'Chọn nhân viên làm Lead'); const from = effectiveFrom || F.today();
    const e = St.rawGet('employees', employeeId); if (!e || e.status === 'resigned') err('Nhân viên không hợp lệ hoặc đã nghỉ việc');
    u.leadHistory = u.leadHistory || []; if (u.leadEmployeeId && !u.leadHistory.length) u.leadHistory.push({ employeeId: u.leadEmployeeId, from: u.effectiveFrom || '2024-01-01', to: '' });
    u.leadHistory.forEach(h => { if (!h.to && h.from < from) h.to = F.addDays(from, -1); if (!h.to && h.from >= from) h.to = h.from; });
    u.leadHistory.push({ employeeId, from, to: '', reason: reason || '', by: me() }); const before = { leadEmployeeId: u.leadEmployeeId }; u.leadEmployeeId = employeeId;
    audit('setLead', 'orgUnit', id, 'Bổ nhiệm ' + e.name + ' làm Lead ' + u.name + ' từ ' + F.date(from), { before, after: { leadEmployeeId: employeeId }, reason }); done(); return u;
  };
  X.deactivateOrgUnit = (id, effectiveTo, reason) => {
    Au.need('org.manage'); const u = St.rawGet('orgUnits', id); if (!u) err('Không tìm thấy đơn vị');
    if (Q.orgChildren(id).length) err('Đơn vị còn đơn vị con đang hoạt động – chuyển/ngừng đơn vị con trước');
    const to = effectiveTo || F.today(); const members = Q.employeesOfUnits([id], F.addDays(to, 1)); if (members.length) err('Đơn vị còn ' + members.length + ' nhân sự hiệu lực sau ' + F.date(to) + ' – điều chuyển trước khi ngừng');
    const before = snap(u, ['status', 'effectiveTo']); u.status = 'inactive'; u.effectiveTo = to; audit('deactivate', 'orgUnit', id, 'Ngừng hoạt động đơn vị ' + u.name + ' từ ' + F.date(to), { before, after: snap(u, ['status', 'effectiveTo']), reason }); done(); return u;
  };
  // Gán/điều chuyển tổ chức của nhân viên (§4.24): assignment cũ kết thúc ngày hiệu lực − 1, lưu lịch sử
  X.setEmployment = ({ employeeId, orgUnitId, positionId, effectiveFrom, isPrimary = true, reason }) => {
    Au.need('hr.manage'); const e = St.rawGet('employees', employeeId); if (!e) err('Không tìm thấy nhân viên'); req(orgUnitId, 'Đơn vị tổ chức'); const from = effectiveFrom || F.today();
    if (isPrimary) St.rawAll('employmentAssignments').forEach(a => { if (a && a.employeeId === employeeId && a.isPrimary && a.status !== 'cancelled' && !a.effectiveTo) { if (a.effectiveFrom >= from) a.status = 'cancelled'; else a.effectiveTo = F.addDays(from, -1); } });
    const a = St.add('employmentAssignments', { employeeId, orgUnitId, positionId: positionId || null, isPrimary: !!isPrimary, effectiveFrom: from, effectiveTo: '', status: 'active', reason: reason || '', createdBy: me() });
    (e.history = e.history || []).push({ at: F.nowISO(), type: 'org', text: (isPrimary ? 'Điều chuyển sang ' : 'Kiêm nhiệm tại ') + Q.orgUnit(orgUnitId).name + (positionId ? ' – ' + Q.position(positionId).name : '') + ' từ ' + F.date(from), by: me() });
    audit('employment', 'employee', employeeId, e.name + ' → ' + Q.orgUnit(orgUnitId).name + ' từ ' + F.date(from), { after: snap(a, ['orgUnitId', 'positionId', 'effectiveFrom', 'isPrimary']), reason }); done(); return a;
  };

  /* ---------- Phân công tòa nhà (§4.25, §12.19) ---------- */
  const validateAssignment = (a) => {
    const e = St.rawGet('employees', a.employeeId); if (!e) err('Không tìm thấy nhân viên'); if (e.status === 'resigned') err('Nhân viên đã nghỉ việc');
    const b = St.rawGet('buildings', a.buildingId); if (!b) err('Không tìm thấy tòa');
    req(a.role, 'Vai trò phân công'); req(a.start, 'Ngày hiệu lực'); if (a.end && a.end < a.start) err('Ngày kết thúc phải sau ngày hiệu lực');
    if (Q.assignmentOverlaps(a).length) err('Nhân viên đã có phân công trùng thời gian tại tòa này (§4.25.5)');
    if (a.role === 'manager' && Q.managerConflicts(a).length) err('Tòa đã có Phụ trách chính khác hiệu lực sau ngày ' + F.date(a.start) + ' – hủy/kết thúc phân công đó trước');
  };
  const orgSnapshot = (employeeId, date) => (Q.employeeUnit(employeeId, date) || {}).id || null;
  // Tạo phân công: confirm=true (Admin/Quản lý Tổng) → duyệt ngay; ngược lại → Chờ duyệt (§4.25.6)
  X.createAssignment = ({ employeeId, buildingId, role, start, end, reason, note, roomScope, primary, confirm }) => {
    Au.need('assignments.manage');
    const a = { employeeId, buildingId, role: role || 'manager', start: start || F.today(), end: end || null, reason: reason || '', note: note || '', roomScope: roomScope || '', primary: !!primary, status: 'pending', createdBy: me(), orgUnitId: orgSnapshot(employeeId, start || F.today()) };
    validateAssignment(a);
    if (a.role === 'manager' && !a.reason) err('Nhập lý do thay đổi/điều chuyển (§4.25.1)');
    const rec = St.add('buildingAssignments', a);
    audit('create', 'buildingAssignment', rec.id, 'Đề xuất phân công ' + Q.employeeName(employeeId) + ' – ' + Q.label('assignRole', rec.role) + ' – ' + Q.building(buildingId).name + ' từ ' + F.date(rec.start), { after: snap(rec, ['employeeId', 'buildingId', 'role', 'start', 'end']), reason });
    if (confirm && Au.can('assignments.approve')) return X.approveAssignment(rec.id, 'Xác nhận ngay khi tạo');
    done(); return rec;
  };
  X.approveAssignment = (id, note) => {
    Au.need('assignments.approve'); const a = St.rawGet('buildingAssignments', id); if (!a) err('Không tìm thấy phân công'); if (!['pending', 'draft'].includes(a.status)) err('Chỉ duyệt phân công ở trạng thái Chờ duyệt');
    validateAssignment(a);
    const before = { status: a.status }; a.status = 'approved'; a.approvedBy = me(); a.approvedAt = F.nowISO(); a.approveNote = note || '';
    // Phụ trách chính mới: kết thúc Phụ trách chính cũ ngày hiệu lực − 1 (không xóa cứng – §4.25.5)
    if (a.role === 'manager') St.rawAll('buildingAssignments').forEach(o => { if (o && o.id !== a.id && o.buildingId === a.buildingId && o.role === 'manager' && ['active', 'approved'].includes(o.status) && (!o.end || o.end >= a.start)) { if (o.start >= a.start) { o.status = 'cancelled'; o.cancelReason = 'Bị thay bởi phân công ' + F.date(a.start); } else { o.end = F.addDays(a.start, -1); o.endReason = 'Thay đổi quản lý – hiệu lực ' + F.date(a.start); if (o.end < F.today()) o.status = 'ended'; } } });
    const e = St.rawGet('employees', a.employeeId); if (e) (e.history = e.history || []).push({ at: F.nowISO(), type: 'assign', text: Q.label('assignRole', a.role) + ' ' + Q.building(a.buildingId).name + ' từ ' + F.date(a.start), by: me() });
    audit('approve', 'buildingAssignment', id, 'Duyệt phân công ' + Q.employeeName(a.employeeId) + ' – ' + Q.building(a.buildingId).name + ' từ ' + F.date(a.start), { before, after: { status: 'approved' }, reason: note });
    seed.activateDueAssignments(St.state, F.today()); seed.syncDerivedManagers(St.state, F.today()); done(); return a;
  };
  X.rejectAssignment = (id, reason) => { Au.need('assignments.approve'); const a = St.rawGet('buildingAssignments', id); if (!a || a.status !== 'pending') err('Chỉ từ chối phân công Chờ duyệt'); req(reason, 'Nhập lý do từ chối'); a.status = 'rejected'; a.rejectReason = reason; a.rejectedBy = me(); audit('reject', 'buildingAssignment', id, 'Từ chối phân công ' + Q.employeeName(a.employeeId) + ' – ' + Q.building(a.buildingId).name, { before: { status: 'pending' }, after: { status: 'rejected' }, reason }); done(); return a; };
  X.cancelAssignment = (id, reason) => { Au.need('assignments.manage'); const a = St.rawGet('buildingAssignments', id); if (!a || !['approved', 'pending', 'draft'].includes(a.status)) err('Chỉ hủy kế hoạch chưa hiệu lực'); if (a.status === 'approved' && a.start <= F.today()) err('Phân công đã đến ngày hiệu lực – dùng Kết thúc phân công'); a.status = 'cancelled'; a.cancelReason = reason || ''; audit('cancel', 'buildingAssignment', id, 'Hủy kế hoạch phân công ' + Q.employeeName(a.employeeId) + ' – ' + Q.building(a.buildingId).name, { before: { status: 'approved' }, after: { status: 'cancelled' }, reason }); done(); return a; };
  X.endAssignment = (id, end, reason) => {
    Au.need('assignments.manage'); const a = St.rawGet('buildingAssignments', id); if (!a || a.status !== 'active') err('Phân công không còn hiệu lực'); const to = end || F.today(); if (to < a.start) err('Ngày kết thúc phải sau ngày hiệu lực');
    const before = snap(a, ['status', 'end']); a.end = to; a.endReason = reason || ''; if (to <= F.today()) a.status = 'ended';
    const e = St.rawGet('employees', a.employeeId); if (e) (e.history = e.history || []).push({ at: F.nowISO(), type: 'assign', text: 'Kết thúc phụ trách ' + Q.building(a.buildingId).name + ' ngày ' + F.date(to), by: me() });
    audit('end', 'buildingAssignment', id, 'Kết thúc phân công ' + Q.employeeName(a.employeeId) + ' – ' + Q.building(a.buildingId).name + ' ngày ' + F.date(to), { before, after: snap(a, ['status', 'end']), reason }); seed.syncDerivedManagers(St.state, F.today()); done(); return a;
  };
  // Luồng chuẩn §4.25.4: chọn NV mới → vai trò Phụ trách chính → ngày hiệu lực → lý do → gửi duyệt/xác nhận
  X.changeManager = ({ buildingId, employeeId, start, reason, note, confirm }) => X.createAssignment({ buildingId, employeeId, role: 'manager', start, reason, note, confirm });
  // Điều chuyển hàng loạt: nhiều tòa từ NV A sang NV B cùng ngày hiệu lực (§4.25.3)
  X.bulkTransfer = ({ fromEmployeeId, toEmployeeId, buildingIds, start, reason, confirm }) => {
    Au.need('assignments.manage'); req(toEmployeeId, 'Chọn nhân viên nhận'); if (!buildingIds || !buildingIds.length) err('Chọn ít nhất một tòa');
    const out = []; buildingIds.forEach(bid => { out.push(X.createAssignment({ buildingId: bid, employeeId: toEmployeeId, role: 'manager', start, reason: reason || ('Điều chuyển từ ' + Q.employeeName(fromEmployeeId)), confirm })); });
    return out;
  };
  // Tương thích P3: X.assignBuilding cũ (tab Phân công ở chi tiết NV) → workflow mới, xác nhận ngay nếu có quyền duyệt
  X.assignBuilding = ({ employeeId, buildingId, role, primary, start, reason }) => X.createAssignment({ employeeId, buildingId, role: role === 'ops' ? 'support' : role, primary, start, reason: reason || 'Phân công từ hồ sơ nhân viên', confirm: true });

  /* ---------- Ký hiệu / loại tòa theo hiệu lực (§4.6, §12.3.4) ---------- */
  X.setBuildingType = ({ buildingId, type, effectiveFrom, reason, sourceType, sourceId }) => {
    Au.need('buildings.manage'); const b = St.rawGet('buildings', buildingId); if (!b) err('Không tìm thấy tòa'); req(type, 'Chọn ký hiệu loại tòa'); req(effectiveFrom, 'Nhập ngày hiệu lực (§4.6)');
    const cur = Q.buildingTypeHistory(buildingId)[0];
    if (cur && cur.type === type && cur.effectiveFrom === effectiveFrom) return cur;
    St.rawAll('buildingTypeHistory').forEach(h => { if (h && h.buildingId === buildingId && !h.effectiveTo && h.effectiveFrom < effectiveFrom) h.effectiveTo = F.addDays(effectiveFrom, -1); });
    const h = St.add('buildingTypeHistory', { buildingId, type, effectiveFrom, effectiveTo: '', sourceType: sourceType || 'manual', sourceId: sourceId || null, reason: reason || '', by: me() });
    const before = { buildingType: b.buildingType }; if (effectiveFrom <= F.today()) b.buildingType = type;
    audit('setType', 'building', buildingId, 'Ký hiệu loại tòa ' + b.name + ' → ' + type + ' từ ' + F.date(effectiveFrom), { before, after: { buildingType: type, effectiveFrom }, reason }); done(); return h;
  };
})(window.TH);
