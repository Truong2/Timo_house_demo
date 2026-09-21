/* Panel Hướng dẫn – luồng Phase 1 bổ sung theo spec v1.8 Wave 1: F11 Tổ chức & phân công tòa nhà (§4.3, §4.23, §4.25) + runAllOrg. Progress lưu chung store.state.guide. */
(function (TH) {
  const F = TH.f, Q = TH.q, St = TH.store, X = TH.actions, G = TH.guide; if (!G) return;
  const u = (c, f) => St.rawAll(c).filter(x => x && x.source === 'user' && (!f || f(x)));
  const ctxOrg = () => {
    const unit = u('orgUnits').sort((a, b) => F.cmp(b.createdAt || '', a.createdAt || ''))[0] || null;
    const mgrAsn = u('buildingAssignments', a => a.role === 'manager').sort((a, b) => F.cmp(b.createdAt || '', a.createdAt || ''));
    const asn = mgrAsn[0] || null; const approved = mgrAsn.find(a => ['approved', 'active'].includes(a.status)) || null;
    const b = asn ? Q.building(asn.buildingId) : null;
    return { unit, asn, approved, b, visited: St.state.guide.visited || {} };
  };
  const v = (c, path) => Object.keys(c.visited).some(k => k === path || k.startsWith(path + '?'));
  const ORG = [
    { key: 'H1', title: 'Tổ chức & phân công tòa nhà', golive: '', ms: [
      { id: 'H1.1', title: 'Xem cây tổ chức & scope theo đơn vị', route: '#/hr/org', role: 'admin', how: 'Nhân sự → Cơ cấu tổ chức. Chọn "TPVH 1": panel bên phải hiện Lead, số nhân sự và các tòa thuộc scope (tòa do nhân sự đơn vị làm Phụ trách chính). Đổi "Xem cây tại ngày" sang 30/09/2026 để thấy tòa Central còn thuộc TPVH 1.', expect: 'Scope = đơn vị + đơn vị con → nhân sự → tòa (§4.3); tháng 9 Central thuộc TPVH 1, từ 01/10 thuộc TPVH 2.', check: c => v(c, '/hr/org'), hl: 'org-tree' },
      { id: 'H1.2', title: 'Tạo đơn vị / bổ nhiệm Lead', route: '#/hr/org', role: 'admin', how: '"Thêm đơn vị" (VD: TPVH 3, loại Đội/Nhóm, cha = Đơn vị vận hành, ngày hiệu lực) → chọn đơn vị vừa tạo → "Bổ nhiệm / thay Lead".', expect: 'Đơn vị xuất hiện đúng vị trí trong cây; mỗi đội có đúng một Lead hiệu lực, thay Lead lưu lịch sử (§4.23).', check: c => !!c.unit, hl: 'org-add' },
      { id: 'H1.3', title: 'Thay đổi quản lý tòa (hiệu lực tương lai)', route: () => { const b = St.rawAll('buildings').find(x => x && x.name === 'Tòa Sunrise') || St.rawAll('buildings').find(x => x && !x.stub); return b ? '#/buildings/' + b.id + '?tab=staff' : '#/buildings'; }, role: 'admin', how: 'Chi tiết tòa → tab "Nhân sự / Phân công" → "Thay đổi quản lý" (form mở từ module Phân công): chọn nhân viên, vai trò Phụ trách chính, ngày hiệu lực 01/12/2026, lý do → "Gửi duyệt" (hoặc "Xác nhận ngay").', expect: 'Tòa không có cơ chế đổi quản lý riêng – mọi thay đổi đi qua Nhân sự → Phân công (§4.6, §10.17). Quản lý hiện tại chưa đổi trước ngày hiệu lực.', check: c => !!c.asn, hl: 'bld-change-manager' },
      { id: 'H1.4', title: 'Duyệt phân công (Quản lý Tổng / Admin)', route: '#/hr/assignments?view=pending', role: 'qltong', how: 'Chuyển vai trò Quản lý Tổng (hoặc Admin) → Phân công tòa nhà → tab "Chờ duyệt" → "Duyệt" trên dòng vừa tạo.', expect: 'Phân công → Đã duyệt – chờ hiệu lực; Phụ trách chính cũ tự kết thúc ngày hiệu lực − 1 (§4.25.5); trạng thái xuất hiện ở tab "Sắp tới".', check: c => !!c.approved, hl: 'assign-approve' },
      { id: 'H1.5', title: 'Xem "Quản lý sắp tới" trên màn Tòa', route: c => c.b ? '#/buildings/' + c.b.id : '#/buildings', role: 'any', how: 'Mở danh sách Tòa nhà (cột Quản lý đang phụ trách / Quản lý sắp tới) hoặc chi tiết tòa vừa đổi.', expect: 'Quản lý hiện tại giữ nguyên, Quản lý sắp tới = nhân viên mới kèm ngày hiệu lực – chỉ đọc từ assignment (§4.25.7).', check: c => !!c.approved && v(c, '/buildings'), hl: 'bld-change-manager' },
      { id: 'H1.6', title: 'Dashboard theo tổ chức & kỳ', route: () => { const un = St.rawAll('orgUnits').find(x => x && x.code === 'TPVH1'); return '#/dashboard?orgUnitId=' + (un ? un.id : '') + '&period=2026-09'; }, role: 'admin', how: 'Tổng quan → bộ lọc "Tổ chức" = TPVH 1 → đổi Kỳ 09/2026 ↔ 10/2026.', expect: 'Ghi chú phạm vi liệt kê tòa theo assignment hiệu lực cuối kỳ: 09/2026 có Central, 10/2026 không (§4.3 quy tắc theo thời gian); KPI/biểu đồ chỉ tính tòa trong scope, không đếm trùng.', check: c => Object.keys(c.visited).some(k => k.startsWith('/dashboard') && k.includes('orgUnitId=')), hl: 'dash-kpi' },
    ] },
  ];
  // Chèn ngay sau F10 (trước các luồng P2/P3)
  const idx = G.FLOWS.findIndex(f => f.key === 'F10');
  G.FLOWS.splice(idx >= 0 ? idx + 1 : G.FLOWS.length, 0, ...ORG);
  ORG.forEach(f => f.ms.forEach(m => { const chk = m.check; const rt = m.route; m.check = (c) => chk(Object.assign({}, c, ctxOrg())); if (typeof rt === 'function') m.route = (c) => rt(Object.assign({}, c || {}, ctxOrg())); }));

  /* Chạy kỹ thuật H1 (dùng trong runAll) */
  G.runAllOrg = async () => {
    const log = []; const prevRole = TH.auth.role(); TH.auth.switchRole('admin');
    const vh = St.rawAll('orgUnits').find(x => x && x.code === 'VH');
    const unit = X.saveOrgUnit({ name: 'TPVH Auto ' + Date.now().toString().slice(-4), type: 'team', parentId: vh ? vh.id : null, effectiveFrom: F.today() }); log.push('Đơn vị ' + unit.code);
    const lead = St.rawAll('employees').find(e => e && e.status === 'working' && e.dept === 'vanhanh'); if (lead) { X.setOrgLead(unit.id, lead.id, F.today(), 'Kịch bản tự động'); log.push('Lead ' + lead.name); }
    const b = St.rawAll('buildings').find(x => x && x.name === 'Tòa Sunrise') || St.rawAll('buildings').find(x => x && !x.stub);
    const cur = Q.buildingManager(b.id); const emp = St.rawAll('employees').find(e => e && e.status === 'working' && e.id !== cur.id && e.dept === 'vanhanh');
    const a = X.changeManager({ buildingId: b.id, employeeId: emp.id, start: F.addDays(F.today(), 30), reason: 'Kịch bản tự động H1' }); log.push('Đề xuất ' + Q.employeeName(a.employeeId) + ' → ' + b.name);
    X.approveAssignment(a.id, 'Kịch bản tự động'); log.push('Đã duyệt – sắp tới từ ' + F.date(a.start));
    if (prevRole && prevRole !== 'admin') try { TH.auth.switchRole(prevRole); } catch (e) { }
    return log.join(' · ');
  };
})(window.TH);
