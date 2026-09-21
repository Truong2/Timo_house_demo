/* Selectors – Spec v1.8 Wave 1: cây tổ chức (§4.23), phân công tòa là nguồn chuẩn (§4.25), scope theo tổ chức & thời gian (§4.3, §12.1), lịch sử loại tòa (§4.6), master data (§7.5). */
(function (TH) {
  const F = TH.f, St = TH.store, Q = TH.q;
  const raw = c => St.rawAll(c).filter(Boolean);
  const EFFECTIVE = ['active', 'ended', 'approved'];
  Q.L.assignRole = { manager: ['Phụ trách chính', 'blue'], support: ['Phối hợp', 'teal'], lead: ['Giám sát khu vực', 'purple'], tech: ['Kỹ thuật', 'orange'], cleaning: ['Vệ sinh', 'gray'], ops: ['Phối hợp', 'teal'] };
  Q.L.assignment = { draft: ['Dự thảo', 'gray'], pending: ['Chờ duyệt', 'amber'], approved: ['Đã duyệt – chờ hiệu lực', 'blue'], active: ['Đang hiệu lực', 'green'], ended: ['Hết hiệu lực', 'gray'], rejected: ['Từ chối', 'red'], cancelled: ['Đã hủy', 'red'] };
  Q.L.orgUnitType = { company: ['Công ty', 'gray'], division: ['Khối / Ban', 'purple'], department: ['Phòng / Đơn vị', 'blue'], team: ['Đội / Nhóm', 'teal'] };
  Q.periodEndDate = (p) => { if (!p || p === 'all') return F.today(); const [y, m] = String(p).split('-').map(Number); return y && m ? F.toISO(new Date(y, m, 0)) : F.today(); };
  Q.refDate = (f = {}) => f.date || (f.period ? Q.periodEndDate(f.period) : F.today());

  /* ---- Master data (§7.5) ---- */
  Q.md = (kind, activeOnly = true) => raw('masterData').filter(m => m.kind === kind && (!activeOnly || m.status !== 'inactive')).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  Q.mdItem = (kind, code) => raw('masterData').find(m => m.kind === kind && m.code === code) || null;
  Q.mdLabel = (kind, code) => (Q.mdItem(kind, code) || {}).name || code || '-';
  Q.milestones = () => { const ms = Q.md('milestone'); return ms.length ? ms.map(m => ({ code: m.code, day: Number(m.day) || 0 })) : [{ code: 'M1', day: 5 }, { code: 'M2', day: 10 }, { code: 'M3', day: 15 }]; };

  /* ---- Cây tổ chức (§4.23) ---- */
  Q.orgUnit = (id) => St.rawGet('orgUnits', id) || {};
  Q.orgUnits = (date = F.today()) => raw('orgUnits').filter(u => u.status !== 'inactive' && (!u.effectiveFrom || u.effectiveFrom <= date) && (!u.effectiveTo || u.effectiveTo >= date));
  Q.orgChildren = (parentId, date) => Q.orgUnits(date).filter(u => (u.parentId || null) === (parentId || null));
  Q.orgDescendants = (unitId, date) => { const out = []; const walk = (id) => { out.push(id); Q.orgChildren(id, date).forEach(c => walk(c.id)); }; if (unitId) walk(unitId); return out; };
  Q.orgAncestors = (unitId) => { const out = []; let u = Q.orgUnit(unitId); let guard = 0; while (u && u.id && guard++ < 20) { out.unshift(u); u = u.parentId ? Q.orgUnit(u.parentId) : null; } return out; };
  Q.orgPath = (unitId) => Q.orgAncestors(unitId).map(u => u.name).join(' › ');
  Q.orgTree = (date = F.today()) => { const build = (parentId, depth) => Q.orgChildren(parentId, date).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || F.cmp(a.code, b.code)).flatMap(u => [{ ...u, depth }].concat(build(u.id, depth + 1))); return build(null, 0); };
  Q.orgOptions = (date) => Q.orgTree(date).map(u => [u.id, ' '.repeat(u.depth * 3) + (u.depth ? '└ ' : '') + u.name]);
  Q.orgLead = (unitId, date = F.today()) => { const u = Q.orgUnit(unitId); const h = (u.leadHistory || []).find(x => x.from <= date && (!x.to || x.to >= date)); const id = h ? h.employeeId : (u.leadEmployeeId || null); return id ? (St.rawGet('employees', id) || {}) : {}; };
  Q.position = (id) => St.rawGet('positions', id) || {};

  /* ---- Quan hệ tổ chức của nhân viên (§4.24) ---- */
  Q.employmentAt = (employeeId, date = F.today()) => raw('employmentAssignments').filter(a => a.employeeId === employeeId && a.status !== 'cancelled' && a.effectiveFrom <= date && (!a.effectiveTo || a.effectiveTo >= date)).sort((a, b) => (b.isPrimary - a.isPrimary) || F.cmp(b.effectiveFrom, a.effectiveFrom));
  Q.employeeUnit = (employeeId, date) => { const a = Q.employmentAt(employeeId, date)[0]; return a ? Q.orgUnit(a.orgUnitId) : {}; };
  Q.employeePosition = (employeeId, date) => { const a = Q.employmentAt(employeeId, date)[0]; return a ? Q.position(a.positionId) : {}; };
  Q.employeesOfUnits = (unitIds, date = F.today()) => { const set = new Set(unitIds || []); const ids = new Set(raw('employmentAssignments').filter(a => set.has(a.orgUnitId) && a.status !== 'cancelled' && a.effectiveFrom <= date && (!a.effectiveTo || a.effectiveTo >= date)).map(a => a.employeeId)); return raw('employees').filter(e => ids.has(e.id)); };
  Q.employeeOptions = (f = {}) => { const date = Q.refDate(f); let list = raw('employees').filter(e => e.status !== 'resigned'); if (f.orgUnitId) { const ids = new Set(Q.employeesOfUnits(Q.orgDescendants(f.orgUnitId, date), date).map(e => e.id)); list = list.filter(e => ids.has(e.id)); } return list.sort((a, b) => F.cmp(a.name, b.name)).map(e => [e.id, e.name + (e.code ? ' (' + e.code + ')' : '')]); };

  /* ---- Phân công tòa nhà – single source of truth (§4.25) ---- */
  Q.assignment = (id) => St.rawGet('buildingAssignments', id) || null;
  Q.assignmentsAt = (buildingId, date = F.today(), role) => raw('buildingAssignments').filter(a => a.buildingId === buildingId && (!role || a.role === role) && EFFECTIVE.includes(a.status) && a.start <= date && (!a.end || a.end >= date));
  Q.managerAssignment = (buildingId, date = F.today()) => Q.assignmentsAt(buildingId, date, 'manager').sort((a, b) => F.cmp(b.start, a.start))[0] || null;
  Q.buildingManager = (buildingId, date = F.today()) => { const a = Q.managerAssignment(buildingId, date); return a ? (St.rawGet('employees', a.employeeId) || {}) : {}; };
  Q.buildingManagerName = (buildingId, date) => { const e = Q.buildingManager(buildingId, date); if (e.name) return e.name; const b = St.rawGet('buildings', buildingId); return b && b.managerId ? Q.userName(b.managerId) : 'Chưa phân công'; };
  Q.upcomingAssignments = (buildingId, date = F.today()) => raw('buildingAssignments').filter(a => a.buildingId === buildingId && a.status === 'approved' && a.start > date).sort((a, b) => F.cmp(a.start, b.start));
  Q.upcomingManager = (buildingId, date = F.today()) => { const a = Q.upcomingAssignments(buildingId, date).find(x => x.role === 'manager'); return a ? Object.assign({ assignment: a }, St.rawGet('employees', a.employeeId) || {}) : null; };
  Q.assignmentHistory = (buildingId) => raw('buildingAssignments').filter(a => a.buildingId === buildingId).sort((a, b) => F.cmp(b.start, a.start));
  Q.employeeAssignmentsAt = (employeeId, date = F.today(), opts = {}) => raw('buildingAssignments').filter(a => a.employeeId === employeeId && (opts.upcoming ? a.status === 'approved' && a.start > date : EFFECTIVE.includes(a.status) && a.start <= date && (!a.end || a.end >= date)));
  Q.buildingsOfEmployee = (employeeId, date = F.today(), opts = {}) => [...new Set(Q.employeeAssignmentsAt(employeeId, date, opts).filter(a => !opts.role || a.role === opts.role).map(a => a.buildingId))].map(id => St.rawGet('buildings', id)).filter(Boolean);
  Q.buildingsMissingManager = (date = F.today()) => raw('buildings').filter(b => !b.stub && b.status !== 'inactive' && !Q.managerAssignment(b.id, date));
  Q.assignmentOverlaps = (a) => raw('buildingAssignments').filter(o => o.id !== a.id && o.buildingId === a.buildingId && o.employeeId === a.employeeId && o.role === a.role && ['active', 'approved', 'pending'].includes(o.status) && o.start <= (a.end || '9999-12-31') && (!o.end || o.end >= a.start));
  Q.managerConflicts = (a) => a.role !== 'manager' ? [] : raw('buildingAssignments').filter(o => o.id !== a.id && o.buildingId === a.buildingId && o.role === 'manager' && ['active', 'approved'].includes(o.status) && o.start > a.start && (!a.end || o.start <= a.end));
  // Bảng §4.25.9: nhà/phòng hiện tại & sắp tới tính từ assignment + danh mục phòng
  Q.assignmentWorkload = (employeeId, date = F.today()) => {
    const cur = Q.buildingsOfEmployee(employeeId, date), up = Q.buildingsOfEmployee(employeeId, date, { upcoming: true });
    const roomsOf = (bs) => F.sum(bs, b => b.stub ? (b.roomCount || 0) : raw('rooms').filter(r => r.buildingId === b.id).length);
    return { current: cur, upcoming: up, currentRooms: roomsOf(cur), upcomingRooms: roomsOf(up) };
  };

  /* ---- Scope theo cây tổ chức + thời gian (§4.3, §12.1.5) ---- */
  Q.scopeBuildingIds = (f = {}) => {
    const date = Q.refDate(f);
    let buildings = raw('buildings').filter(b => !b.stub);
    if (f.orgUnitId) { const units = new Set(Q.orgDescendants(f.orgUnitId, date)); const emps = new Set(Q.employeesOfUnits([...units], date).map(e => e.id)); buildings = buildings.filter(b => { const a = Q.managerAssignment(b.id, date); return a && emps.has(a.employeeId); }); }
    if (f.employeeId) buildings = buildings.filter(b => Q.assignmentsAt(b.id, date).some(a => a.employeeId === f.employeeId));
    return buildings.map(b => b.id);
  };
  Q.buildingUnit = (buildingId, date = F.today()) => { const e = Q.buildingManager(buildingId, date); return e.id ? Q.employeeUnit(e.id, date) : {}; };

  /* ---- Lịch sử ký hiệu loại tòa (§4.6) ---- */
  Q.buildingTypeAt = (buildingId, date = F.today()) => { const h = raw('buildingTypeHistory').filter(x => x.buildingId === buildingId && x.effectiveFrom <= date && (!x.effectiveTo || x.effectiveTo >= date)).sort((a, b) => F.cmp(b.effectiveFrom, a.effectiveFrom))[0]; if (h) return h.type; const b = St.rawGet('buildings', buildingId); return b ? (b.buildingType || '') : ''; };
  Q.buildingTypeHistory = (buildingId) => raw('buildingTypeHistory').filter(x => x.buildingId === buildingId).sort((a, b) => F.cmp(b.effectiveFrom, a.effectiveFrom));
  Q.buildingTypeOptions = () => { const items = Q.md('buildingType'); return items.length ? items.map(m => [m.code, m.name]) : Object.entries(Q.L.buildingType).map(([k, v]) => [k, v[0]]); };
  Q.buildingTypeLabel = t => { const m = Q.mdItem('buildingType', t); return m ? m.name : (Q.L.buildingType[t] || [t || '-', 'gray'])[0]; };
})(window.TH);
