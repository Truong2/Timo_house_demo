/* Actions – nhân viên, phân công tòa theo hiệu lực, cơ cấu leader/team (UI-23/UI-24, F11). */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, D = TH.calc.dates;
  X.addEmployee = (d) => {
    _.need('hr.manage');
    const errs = {};
    if (!String(d.name || '').trim()) errs.name = 'Nhập họ tên';
    if (!d.title) errs.title = 'Chọn chức danh';
    if (!d.hireDate) errs.hireDate = 'Nhập ngày vào làm';
    const code = d.code ? String(d.code).trim() : S.nextCode('employees', 'NV-');
    if (d.code && S.one('employees', e => e.code === code)) errs.code = 'Mã nhân viên đã tồn tại: ' + code;
    if (Object.keys(errs).length) { const e = new Error('Dữ liệu chưa hợp lệ'); e.fields = errs; throw e; }
    const e = S.add('employees', { id: 'emp_' + code.replace(/\W+/g, '_'), key: code, code, name: d.name.trim(), title: d.title, status: 'active', hireDate: d.hireDate, phone: d.phone || '', areaId: d.areaId || null, baseSalary: Number(d.baseSalary) || 0, allowances: { lunch: Number(d.lunch) || 0, fuel: Number(d.fuel) || 0, support: Number(d.support) || 0 } });
    if (d.leaderId) S.add('orgLinks', { employeeId: e.id, leaderId: d.leaderId, from: d.hireDate, to: null, unit: d.unit || '' });
    _.audit('create', 'employee', e.id, 'Thêm nhân viên ' + e.name); _.done(); return e;
  };
  X.updateEmployee = (id, patch) => { _.need('hr.manage'); S.update('employees', id, patch); _.audit('update', 'employee', id, 'Sửa hồ sơ nhân viên'); _.done(); };
  X.deactivateEmployee = (id, d) => {
    _.need('hr.manage');
    if (!d.date || !String(d.reason || '').trim()) throw new Error('Nhập ngày ngừng và lý do');
    const open = S.where('assignments', a => a.employeeId === id && (!a.to || a.to >= d.date));
    if (open.length && !d.force) throw new Error(`Còn ${open.length} phân công hiệu lực – chuyển phân công trước khi ngừng`);
    S.update('employees', id, { status: 'left', leftDate: d.date, leftReason: d.reason });
    _.audit('deactivate', 'employee', id, 'Ngừng hoạt động: ' + d.reason); _.done();
  };
  /* Phân công theo hiệu lực (UI-24, E20): phạm vi tòa hoặc phòng (roomId), loại trách nhiệm theo catalog.responsibilities.
     Xung đột = cùng loại + cùng phạm vi (một phòng có thể đồng thời có vận hành, kỹ thuật, sale). Chuyển từ ngày X: đóng phân công cũ ngày X−1, không ghi đè lịch sử. */
  X.assign = (d) => {
    _.need('hr.manage');
    if (!d.employeeId || !d.buildingId || !d.from) throw new Error('Chọn nhân viên, tòa và ngày hiệu lực');
    if (!String(d.reason || '').trim()) throw new Error('Nhập lý do phân công');
    const resp = d.responsibility || 'operate';
    if (!TH.data.catalog.responsibilities[resp]) throw new Error('Chọn loại trách nhiệm');
    const emp = Q.emp(d.employeeId); if (!emp) throw new Error('Không tìm thấy nhân viên');
    const roomId = d.roomId || null;
    if (roomId) { const r = Q.room(roomId); if (!r || r.buildingId !== d.buildingId) throw new Error('Phòng không thuộc tòa đã chọn'); }
    if (d.to && d.to < d.from) throw new Error('Ngày kết thúc phải sau ngày hiệu lực');
    _.guardEffective(d.from, 'phân công');
    const cur = S.where('assignments', a => a.buildingId === d.buildingId && a.responsibility === resp && (a.roomId || null) === roomId && (!a.to || a.to >= d.from));
    if (cur.some(a => a.from >= d.from)) throw new Error('Đã có phân công bắt đầu từ ' + F.date(cur.map(a => a.from).sort().pop()) + ' – không ghi đè kỳ trước');
    cur.forEach(a => S.update('assignments', a.id, { to: D.addDays(d.from, -1), closedReason: d.reason, changedBy: _.who(), changedAt: F.nowISO() }));
    const a = S.add('assignments', { employeeId: d.employeeId, buildingId: d.buildingId, roomId, responsibility: resp, from: d.from, to: d.to || null, reason: d.reason, replacesId: cur[0] ? cur[0].id : null, changedBy: _.who(), changedAt: F.nowISO() });
    _.audit('assign', 'assignment', a.id, `Phân công ${emp.name} – ${TH.data.catalog.responsibilities[resp]} ${roomId ? 'phòng ' + Q.roomCode(roomId) : 'tòa ' + Q.building(d.buildingId).code} từ ${F.date(d.from)}`); _.done(); return a;
  };
  X.assignBuilding = X.assign;
  /* Bỏ phân công từ ngày X (đóng phiên, không xóa lịch sử) */
  X.endAssignment = (id, to, reason) => {
    _.need('hr.manage');
    const a = S.get('assignments', id); if (!a) throw new Error('Không tìm thấy phân công');
    if (!to) throw new Error('Nhập ngày kết thúc');
    if (!String(reason || '').trim()) throw new Error('Nhập lý do bỏ phân công');
    if (to < a.from) throw new Error('Ngày kết thúc phải từ ' + F.date(a.from));
    if (a.to && a.to <= to) throw new Error('Phân công đã kết thúc ' + F.date(a.to));
    _.guardEffective(to, 'bỏ phân công');
    S.update('assignments', id, { to, closedReason: reason, changedBy: _.who(), changedAt: F.nowISO() });
    _.audit('assign', 'assignment', id, `Bỏ phân công ${(Q.emp(a.employeeId) || {}).name} ${a.roomId ? 'phòng ' + Q.roomCode(a.roomId) : 'tòa ' + (Q.building(a.buildingId) || {}).code} sau ${F.date(to)}: ${reason}`); _.done();
  };
  /* Đổi leader từ ngày X: đóng phiên cũ, mở phiên mới; chặn vòng lặp */
  X.setLeader = (d) => {
    _.need('hr.manage');
    if (!d.employeeId || !d.leaderId || !d.from) throw new Error('Chọn nhân viên, leader và ngày hiệu lực');
    if (d.employeeId === d.leaderId) throw new Error('Không thể tự làm leader của chính mình');
    _.guardEffective(d.from, 'đổi leader');
    if (TH.auth.branchOf(d.employeeId, d.from).has(d.leaderId)) throw new Error('Leader đang là cấp dưới của nhân viên này – tạo vòng lặp tổ chức');
    S.where('orgLinks', l => l.employeeId === d.employeeId && (!l.to || l.to >= d.from)).forEach(l => S.update('orgLinks', l.id, { to: D.addDays(d.from, -1) }));
    const l = S.add('orgLinks', { employeeId: d.employeeId, leaderId: d.leaderId, from: d.from, to: null, unit: d.unit || '' });
    _.audit('org', 'orgLink', l.id, `${Q.emp(d.employeeId).name} → leader ${Q.emp(d.leaderId).name} từ ${F.date(d.from)}`); _.done(); return l;
  };
})(window.TH);
