/* Seed / migration v5 – Spec v1.8 Wave 1: cơ cấu tổ chức (§4.23), quan hệ tổ chức nhân viên (§4.24), phân công tòa là nguồn chuẩn duy nhất (§4.25),
   lịch sử ký hiệu loại tòa (§4.6) và master data (§7.5). Chạy sau seed P2/P3/workbook, additive & idempotent (meta.v5Migrated).
   Vai trò phân công: manager = Phụ trách chính (quản lý tòa), support = Phối hợp, lead = Giám sát khu vực, tech = Kỹ thuật, cleaning = Vệ sinh.
   buildings.managerId / rooms.managerId / contracts.managerId / tenants.managerId chỉ còn là cache dẫn xuất từ assignment (X.syncDerivedManagers). */
(function (TH) {
  const F = TH.f, seed = TH.seed = TH.seed || {};
  const T = F.DEMO_TODAY; // 2026-10-28
  const mk = (st, col, obj) => { obj.id = obj.id || F.uid(col.slice(0, 3)); obj.source = obj.source || 'seed'; obj.createdAt = obj.createdAt || '2026-01-01T08:00'; st[col].push(obj); return obj; };
  const userBy = (st, username) => st.users.find(u => u && u.username === username) || null;
  const empOfUser = (st, userId) => st.employees.find(e => e && e.userId === userId) || null;
  const empByName = (st, name) => st.employees.find(e => e && e.name === name) || null;
  const bByName = (st, name) => st.buildings.find(b => b && b.name === name) || null;
  const md = (st, kind, code, name, extra = {}) => { let x = st.masterData.find(m => m && m.kind === kind && m.code === code); if (!x) x = mk(st, 'masterData', Object.assign({ kind, code, name, status: 'active', sortOrder: st.masterData.filter(m => m.kind === kind).length + 1 }, extra)); return x; };
  const unit = (st, code, name, type, parentCode, extra = {}) => {
    let u = st.orgUnits.find(x => x && x.code === code);
    if (!u) { const parent = parentCode ? st.orgUnits.find(x => x && x.code === parentCode) : null; u = mk(st, 'orgUnits', Object.assign({ code, name, type, parentId: parent ? parent.id : null, leadEmployeeId: null, leadHistory: [], effectiveFrom: '2024-01-01', effectiveTo: '', status: 'active' }, extra)); }
    return u;
  };
  const pos = (st, code, name, level, unitTypes) => { let p = st.positions.find(x => x && x.code === code); if (!p) p = mk(st, 'positions', { code, name, level, unitTypes, effectiveFrom: '2024-01-01', status: 'active' }); return p; };

  /* ---------- Master data & danh mục tổ chức (giữ khi Xóa trắng) ---------- */
  seed.catalogOrg = (st) => {
    st.masterData = st.masterData || []; st.orgUnits = st.orgUnits || []; st.positions = st.positions || [];
    [['T', 'T · Thuê lại chủ nhà', 'blue'], ['S', 'S · Sở hữu công ty', 'green'], ['G', 'G · Góp vốn cổ đông', 'purple']].forEach(([c, n, color]) => md(st, 'buildingType', c, n, { color }));
    ['Căn hộ Studio', 'Căn hộ 1PN', 'Căn hộ 2PN', 'Phòng đơn', 'Phòng đôi'].forEach((n, i) => md(st, 'roomType', 'RT' + (i + 1), n));
    [['active', 'Đang hoạt động', 'green'], ['inactive', 'Ngừng hợp tác', 'gray'], ['blocked', 'Hạn chế', 'red']].forEach(([c, n, color]) => md(st, 'customerStatus', c, n, { color }));
    [['on_time', 'Hết hạn – trả phòng đúng hạn'], ['early_tenant', 'Khách chấm dứt sớm'], ['early_company', 'Bên cho thuê chấm dứt sớm'], ['breach', 'Vi phạm hợp đồng / phá hợp đồng'], ['renew', 'Kết thúc để gia hạn'], ['other', 'Lý do khác']].forEach(([c, n]) => md(st, 'contractEndReason', c, n));
    [['manager', 'Phụ trách chính', 'blue'], ['support', 'Phối hợp', 'teal'], ['lead', 'Giám sát khu vực', 'purple'], ['tech', 'Kỹ thuật', 'orange'], ['cleaning', 'Vệ sinh', 'gray']].forEach(([c, n, color]) => md(st, 'assignmentRole', c, n, { color }));
    [['company', 'Công ty'], ['division', 'Khối / Ban'], ['department', 'Phòng / Đơn vị'], ['team', 'Đội / Nhóm']].forEach(([c, n]) => md(st, 'orgUnitType', c, n));
    [['reminder', 'Nhắc thanh toán'], ['contract_expiry', 'Hợp đồng sắp hết hạn'], ['refund_done', 'Đã hoàn cọc'], ['landlord_due', 'Đến kỳ trả chủ nhà'], ['broadcast', 'Thông báo chung']].forEach(([c, n]) => md(st, 'notificationEvent', c, n));
    [['M1', 'Mốc thu 1', 5], ['M2', 'Mốc thu 2', 10], ['M3', 'Mốc thu 3', 15]].forEach(([c, n, day]) => md(st, 'milestone', c, n, { day }));
    pos(st, 'QLT', 'Quản lý Tổng', 1, ['division']); pos(st, 'TPVH', 'Trưởng phòng vận hành', 2, ['department', 'team']); pos(st, 'QLKV', 'Quản lý khu vực', 3, ['team']); pos(st, 'TN', 'Trưởng nhóm', 3, ['team']);
    pos(st, 'NVVH', 'Nhân viên vận hành', 4, ['team']); pos(st, 'KTV', 'Kỹ thuật viên', 4, ['team']); pos(st, 'VS', 'Nhân viên vệ sinh', 5, ['team']); pos(st, 'KT', 'Kế toán', 4, ['department']); pos(st, 'NVKD', 'Nhân viên kinh doanh', 4, ['team']); pos(st, 'NV', 'Nhân viên', 5, ['department', 'team']);
    // Cây tổ chức §4.23 – số cấp linh hoạt
    unit(st, 'CO', 'Công ty TimoHouse', 'company', null);
    unit(st, 'QLT', 'Quản lý Tổng', 'division', 'CO');
    unit(st, 'VH', 'Đơn vị vận hành', 'department', 'QLT', { sortOrder: 1 });
    unit(st, 'TPVH1', 'TPVH 1', 'team', 'VH', { sortOrder: 1, note: 'Sunrise, Central, Garden, Ocean, SkyView, Green Park' });
    unit(st, 'TPVH2', 'TPVH 2', 'team', 'VH', { sortOrder: 2, note: 'Moonlight, Riverside, Harmony, Lotus' });
    unit(st, 'KT', 'Kỹ thuật', 'team', 'VH', { sortOrder: 3 });
    unit(st, 'TCKT', 'Tài chính – Kế toán', 'department', 'QLT', { sortOrder: 2 });
    unit(st, 'KD', 'Kinh doanh', 'department', 'QLT', { sortOrder: 3 });
    unit(st, 'NKD', 'Nhóm Kinh doanh', 'team', 'KD');
    (st.salesTeams || []).forEach((t, i) => unit(st, 'SALE' + (i + 1), t.name || ('Team Sale ' + (i + 1)), 'team', 'NKD', { salesTeamId: t.id }));
    if (!st.orgUnits.some(u => u.code === 'SALE1')) unit(st, 'SALE1', 'Team Sale 1', 'team', 'NKD');
  };

  /* ---------- Tài khoản demo vai trò tổ chức (§16): Quản lý Tổng, TPVH ---------- */
  seed.usersOrg = (st) => {
    const addU = (username, name, email, phone, role, scope, note) => { let u = userBy(st, username); if (!u) { u = { id: F.uid('usr'), source: 'seed', createdAt: '2026-09-01T08:00', username, name, email, phone, role, scope, status: 'active', lastLogin: '2026-10-22T09:00', effectiveDate: '2026-09-01', note }; st.users.push(u); } return u; };
    const addE = (u, dept, title, area) => { let e = empOfUser(st, u.id); if (!e) e = mk(st, 'employees', { code: 'NV' + F.pad(st.employees.length + 1, 3), name: u.name, dept, title, phone: u.phone, email: u.email, area, status: 'working', startDate: '2023-01-02', workType: 'Toàn thời gian', documents: [], history: [{ at: '2023-01-02T08:00', type: 'join', text: 'Vào làm – ' + title }], userId: u.id, salaryBase: title === 'Quản lý Tổng' ? 35000000 : 22000000, titleAllowance: title === 'Quản lý Tổng' ? 8000000 : 4000000, createdAt: '2023-01-02T08:00' }); return e; };
    const q = addU('qltong', 'Lê Thị Thu Hà', 'thuha@timohouse.vn', '0925 678 901', 'qltong', 'Toàn cây tổ chức', 'Tài khoản demo – Quản lý Tổng (duyệt điều chuyển, xem toàn bộ nhánh – §16)');
    const t = addU('tpvh1', 'Trần Quốc Toàn', 'toantq@timohouse.vn', '0926 789 012', 'tpvh', 'TPVH 1 + đơn vị con', 'Tài khoản demo – Trưởng phòng vận hành TPVH 1 (scope đơn vị + descendants – §16)');
    addE(q, 'hanhchinh', 'Quản lý Tổng', 'Tất cả khu vực'); addE(t, 'vanhanh', 'Trưởng phòng vận hành', 'Khu Thủ Đức');
  };

  /* ---------- Quan hệ tổ chức của nhân viên (§4.24) ---------- */
  const TPVH1_BUILDINGS = ['Tòa Sunrise', 'Tòa Central', 'Tòa Garden', 'Tòa Ocean', 'Tòa SkyView', 'Tòa Green Park'];
  const unitOfBuilding = (st, b) => st.orgUnits.find(u => u.code === (TPVH1_BUILDINGS.includes((b || {}).name) ? 'TPVH1' : 'TPVH2'));
  const POS_OF_TITLE = { 'Quản lý Tổng': 'QLT', 'Trưởng phòng vận hành': 'TPVH', 'Quản lý khu vực': 'QLKV', 'Trưởng nhóm': 'TN', 'Kỹ thuật viên': 'KTV', 'Nhân viên kinh doanh': 'NVKD', 'Nhân viên': 'NV' };
  function seedEmployment(st) {
    const U = (code) => st.orgUnits.find(u => u.code === code);
    const P = (code) => (st.positions.find(p => p.code === code) || {}).id || null;
    let alt = 0;
    st.employees.forEach(e => {
      if (!e || st.employmentAssignments.some(a => a && a.employeeId === e.id)) return;
      let u = null, posCode = POS_OF_TITLE[e.title] || 'NV';
      const own = st.buildingAssignments.find(a => a && a.employeeId === e.id && a.primary && a.status === 'active');
      const ownB = own ? st.buildings.find(b => b && b.id === own.buildingId) : null;
      const managed = e.userId ? st.buildings.find(b => b && b.managerId === e.userId) : null; // quản lý tòa (user) → thuộc TPVH của tòa đó
      if (managed) u = unitOfBuilding(st, managed);
      else if (e.dept === 'baotri') u = U('KT');
      else if (e.dept === 'kinhdoanh') { const usr = st.users.find(x => x && x.id === e.userId); const su = usr && usr.teamId ? st.orgUnits.find(x => x.salesTeamId === usr.teamId) : null; u = su || U(alt++ % 2 ? 'SALE2' : 'SALE1') || U('SALE1'); }
      else if (e.dept === 'taichinh' || e.dept === 'hanhchinh') { u = U('TCKT'); if (e.dept === 'taichinh') posCode = 'KT'; }
      else if (['vanhanh', 'cskh', 'khac'].includes(e.dept)) { u = ownB ? unitOfBuilding(st, ownB) : U(alt++ % 2 ? 'TPVH2' : 'TPVH1'); if (e.title === 'Nhân viên') posCode = e.dept === 'khac' ? 'VS' : 'NVVH'; }
      else u = U('VH');
      const usr = st.users.find(x => x && x.id === e.userId);
      if (managed && e.dept === 'baotri') posCode = 'NVVH';
      if (usr && usr.role === 'admin') { u = U('QLT'); posCode = 'QLT'; }
      if (usr && usr.role === 'qltong') { u = U('QLT'); posCode = 'QLT'; }
      if (usr && usr.role === 'tpvh') { u = U('TPVH1'); posCode = 'TPVH'; }
      if (usr && usr.role === 'hr') { u = U('TCKT'); }
      mk(st, 'employmentAssignments', { employeeId: e.id, orgUnitId: (u || U('VH')).id, positionId: P(posCode), isPrimary: true, effectiveFrom: e.startDate || '2024-01-01', effectiveTo: e.status === 'resigned' ? (e.endDate || T) : '', status: 'active', createdAt: (e.startDate || '2024-01-01') + 'T08:00' });
    });
    // Lead đơn vị (đúng 1 Lead hiệu lực – §4.23)
    const setLead = (code, emp, from = '2024-01-01') => { const u = U(code); if (!u || !emp || u.leadEmployeeId) return; u.leadEmployeeId = emp.id; u.leadHistory = [{ employeeId: emp.id, from, to: '' }]; const ea = st.employmentAssignments.find(a => a.employeeId === emp.id && a.isPrimary); if (ea && u.type !== 'company' && ['TPVH1', 'TPVH2', 'VH'].includes(code)) { ea.orgUnitId = u.id; if (code !== 'VH') ea.positionId = P('TPVH'); } };
    const ql = userBy(st, 'qltong') || userBy(st, 'admin'); setLead('QLT', ql ? empOfUser(st, ql.id) : null);
    setLead('VH', empByName(st, 'Trần Minh Đức'));
    const t1 = userBy(st, 'tpvh1') || userBy(st, 'vanhanh'); setLead('TPVH1', t1 ? empOfUser(st, t1.id) : null);
    const lh = userBy(st, 'lehoang'); setLead('TPVH2', lh ? empOfUser(st, lh.id) : null);
    setLead('KT', empByName(st, 'Lê Quang Huy'));
    const kt = userBy(st, 'ketoan'); setLead('TCKT', kt ? empOfUser(st, kt.id) : null);
    setLead('KD', empByName(st, 'Đặng Quốc Bảo')); setLead('NKD', empByName(st, 'Đặng Quốc Bảo'));
    st.orgUnits.filter(u => u.salesTeamId).forEach(u => { const t = st.salesTeams.find(x => x.id === u.salesTeamId); const e = t && t.leadUserId ? empOfUser(st, t.leadUserId) : null; setLead(u.code, e); });
  }

  /* ---------- Phân công tòa: nguồn chuẩn duy nhất (§4.25) ---------- */
  function migrateAssignments(st) {
    // vai trò cũ P3 'ops' → 'support' (Phối hợp); bổ sung workflow/audit fields
    st.buildingAssignments.forEach(a => {
      if (!a) return;
      if (a.role === 'ops') a.role = 'support';
      if (!a.status) a.status = a.end && a.end < T ? 'ended' : 'active';
      if (a.status === 'active' && a.end && a.end < T) a.status = 'ended';
      if (!a.orgUnitId) { const ea = st.employmentAssignments.find(x => x.employeeId === a.employeeId && x.isPrimary); a.orgUnitId = ea ? ea.orgUnitId : null; }
      if (a.reason === undefined) a.reason = ''; if (a.note === undefined) a.note = ''; if (a.roomScope === undefined) a.roomScope = '';
      if (!a.approvedAt && ['active', 'ended', 'approved'].includes(a.status)) { a.approvedAt = a.createdAt || (a.start + 'T08:00'); a.approvedBy = a.approvedBy || null; }
    });
    // Phụ trách chính từ buildings.managerId (user) → assignment role 'manager' theo ngày vận hành
    st.buildings.forEach(b => {
      if (!b || !b.managerId) return;
      let e = empOfUser(st, b.managerId);
      if (!e) { const u = st.users.find(x => x && x.id === b.managerId); if (!u) return; e = mk(st, 'employees', { code: 'NV' + F.pad(st.employees.length + 1, 3), name: u.name, dept: 'vanhanh', title: 'Nhân viên', phone: u.phone || '', email: u.email || '', area: 'Tất cả khu vực', status: 'working', startDate: '2024-01-01', workType: 'Toàn thời gian', documents: [], history: [], userId: u.id, salaryBase: 9000000, titleAllowance: 500000 }); const U1 = st.orgUnits.find(x => x.code === 'TPVH1'); mk(st, 'employmentAssignments', { employeeId: e.id, orgUnitId: U1 ? U1.id : null, positionId: (st.positions.find(p => p.code === 'NVVH') || {}).id || null, isPrimary: true, effectiveFrom: '2024-01-01', effectiveTo: '', status: 'active' }); }
      const has = st.buildingAssignments.some(a => a && a.buildingId === b.id && a.role === 'manager' && a.status === 'active');
      if (has) return;
      const ea = st.employmentAssignments.find(x => x.employeeId === e.id && x.isPrimary);
      mk(st, 'buildingAssignments', { employeeId: e.id, buildingId: b.id, role: 'manager', primary: !st.buildingAssignments.some(a => a && a.employeeId === e.id && a.primary && a.status === 'active'), start: b.operatingSince || '2024-01-01', end: null, status: 'active', orgUnitId: ea ? ea.orgUnitId : null, reason: 'Phân công ban đầu (chuyển từ quản lý tòa cũ)', note: '', roomScope: '', approvedAt: '2024-01-01T08:00', approvedBy: null, createdAt: (b.operatingSince || '2024-01-01') + 'T08:00' });
    });
  }

  /* ---------- Kịch bản demo §4.3 / §4.25.4: đổi quản lý theo thời gian + phân công sắp tới ---------- */
  function seedScenario(st) {
    const central = bByName(st, 'Tòa Central'), garden = bByName(st, 'Tòa Garden');
    const lh = userBy(st, 'lehoang'), vh = userBy(st, 'vanhanh'), hn = userBy(st, 'hnkhanh');
    const eLH = lh && empOfUser(st, lh.id), eVH = vh && empOfUser(st, vh.id), eHN = hn && empOfUser(st, hn.id);
    const admin = userBy(st, 'admin'); const adminId = admin ? admin.id : null;
    const unitOf = (e) => { const ea = e && st.employmentAssignments.find(x => x.employeeId === e.id && x.isPrimary); return ea ? ea.orgUnitId : null; };
    // Central: tháng 9 thuộc TPVH 1 (Hoàng Nam Khánh), từ 01/10/2026 thuộc TPVH 2 (Lê Hoàng) – báo cáo kỳ 09 vẫn thấy quản lý cũ
    if (central && eLH && eHN && !st.buildingAssignments.some(a => a && a.buildingId === central.id && a.employeeId === eLH.id && a.role === 'manager')) {
      st.buildingAssignments.filter(a => a && a.buildingId === central.id && a.role === 'manager' && a.status === 'active').forEach(a => { a.end = '2026-09-30'; a.status = 'ended'; a.endReason = 'Điều chuyển – nhân sự tạm nghỉ dài hạn'; });
      if (!st.buildingAssignments.some(a => a && a.buildingId === central.id && a.employeeId === eHN.id && a.role === 'manager')) mk(st, 'buildingAssignments', { employeeId: eHN.id, buildingId: central.id, role: 'manager', primary: true, start: central.operatingSince || '2024-01-01', end: '2026-09-30', status: 'ended', orgUnitId: unitOf(eHN), reason: 'Phân công ban đầu', endReason: 'Điều chuyển – nhân sự tạm nghỉ dài hạn', note: '', roomScope: '', approvedAt: '2024-01-01T08:00', approvedBy: adminId, createdAt: (central.operatingSince || '2024-01-01') + 'T08:00' });
      mk(st, 'buildingAssignments', { employeeId: eLH.id, buildingId: central.id, role: 'manager', primary: false, start: '2026-10-01', end: null, status: 'active', orgUnitId: unitOf(eLH), reason: 'Điều chuyển tòa Central sang TPVH 2 do NV phụ trách tạm nghỉ dài hạn', note: 'Ví dụ §4.3: kỳ 09/2026 tòa thuộc TPVH 1, từ 10/2026 thuộc TPVH 2', roomScope: '', createdBy: adminId, approvedBy: adminId, approvedAt: '2026-09-25T10:00', createdAt: '2026-09-20T09:00' });
    }
    // Garden: quản lý sắp tới từ 01/11/2026 (đã duyệt, chưa hiệu lực) – demo "Quản lý sắp tới" trên màn Tòa
    if (garden && eVH && !st.buildingAssignments.some(a => a && a.buildingId === garden.id && a.employeeId === eVH.id && a.role === 'manager')) {
      mk(st, 'buildingAssignments', { employeeId: eVH.id, buildingId: garden.id, role: 'manager', primary: false, start: '2026-11-01', end: null, status: 'approved', orgUnitId: unitOf(eVH), reason: 'Kế hoạch điều chuyển Q4/2026 – cân bằng số phòng phụ trách', note: 'Đến ngày hiệu lực assignment hiện tại của Trần Minh Đức tự kết thúc 31/10/2026', roomScope: '', createdBy: adminId, approvedBy: adminId, approvedAt: '2026-10-20T14:00', createdAt: '2026-10-18T09:00' });
    }
    // Một đề xuất chờ duyệt: Phối hợp tòa Sunrise cho NV vận hành TPVH 1
    const sunrise = bByName(st, 'Tòa Sunrise');
    if (sunrise && !st.buildingAssignments.some(a => a && a.buildingId === sunrise.id && a.status === 'pending')) {
      const cand = st.employees.find(e => e && e.status === 'working' && e.dept === 'vanhanh' && e.title === 'Nhân viên' && !st.buildingAssignments.some(a => a && a.employeeId === e.id && a.buildingId === sunrise.id && ['active', 'approved', 'pending'].includes(a.status)));
      if (cand) mk(st, 'buildingAssignments', { employeeId: cand.id, buildingId: sunrise.id, role: 'support', primary: false, start: F.addDays(T, 3), end: null, status: 'pending', orgUnitId: unitOf(cand), reason: 'Bổ sung nhân sự phối hợp cho tòa 80 phòng', note: '', roomScope: 'Tầng 1–3', createdBy: (vh || {}).id || null, createdAt: F.addDays(T, -1) + 'T09:30' });
    }
  }

  /* ---------- Lịch sử ký hiệu loại tòa (§4.6) ---------- */
  function seedTypeHistory(st) {
    st.buildings.forEach(b => {
      if (!b || st.buildingTypeHistory.some(h => h && h.buildingId === b.id)) return;
      const lc = (st.landlordContracts || []).find(c => c && (c.buildingIds || []).includes(b.id));
      mk(st, 'buildingTypeHistory', { buildingId: b.id, type: b.buildingType || 'T', effectiveFrom: b.operatingSince || (lc ? lc.start : '2024-01-01'), effectiveTo: '', sourceType: lc ? 'landlordContract' : 'manual', sourceId: lc ? lc.id : null, reason: 'Ký hiệu ban đầu theo hợp đồng đầu vào', by: null, createdAt: (b.operatingSince || '2024-01-01') + 'T08:00' });
    });
  }

  /* ---------- Hàm thuần trên state: dùng chung cho migration và TH.actions ---------- */
  const EFFECTIVE = ['active', 'ended', 'approved'];
  seed.assignmentsAt = (st, buildingId, date, role) => (st.buildingAssignments || []).filter(a => a && a.buildingId === buildingId && (!role || a.role === role) && EFFECTIVE.includes(a.status) && a.start <= date && (!a.end || a.end >= date));
  seed.managerAt = (st, buildingId, date) => { const a = seed.assignmentsAt(st, buildingId, date, 'manager').sort((x, y) => F.cmp(y.start, x.start))[0]; return a ? (st.employees.find(e => e && e.id === a.employeeId) || null) : null; };
  // Kích hoạt phân công đã duyệt đến ngày hiệu lực, kết thúc phân công quá hạn; Phụ trách chính mới tự kết thúc người cũ ngày hiệu lực − 1 (§4.25.5)
  seed.activateDueAssignments = (st, date = F.today()) => {
    let changed = 0;
    (st.buildingAssignments || []).forEach(a => {
      if (!a) return;
      if (a.status === 'approved' && a.start <= date) {
        if (a.role === 'manager') (st.buildingAssignments || []).forEach(o => { if (o && o !== a && o.buildingId === a.buildingId && o.role === 'manager' && o.status === 'active' && (!o.end || o.end >= a.start)) { o.end = F.addDays(a.start, -1); if (o.end < date) o.status = 'ended'; o.endReason = o.endReason || 'Thay đổi quản lý – hiệu lực ' + F.date(a.start); changed++; } });
        a.status = 'active'; a.activatedAt = F.nowISO(); changed++;
      }
      if (a.status === 'active' && a.end && a.end < date) { a.status = 'ended'; changed++; }
    });
    return changed;
  };
  // managerId trên tòa/phòng/HĐ/khách và users.buildingIds chỉ là cache dẫn xuất từ Phụ trách chính hiệu lực tại ngày (§10.17)
  seed.syncDerivedManagers = (st, date = F.today()) => {
    const byBuilding = {};
    (st.buildings || []).forEach(b => {
      if (!b) return; const e = seed.managerAt(st, b.id, date);
      b.managerEmployeeId = e ? e.id : null; if (e && e.userId) b.managerId = e.userId;
      byBuilding[b.id] = b.managerId;
    });
    (st.rooms || []).forEach(r => { if (r && byBuilding[r.buildingId]) r.managerId = byBuilding[r.buildingId]; });
    (st.contracts || []).forEach(c => { if (c && byBuilding[c.buildingId]) c.managerId = byBuilding[c.buildingId]; });
    (st.tenants || []).forEach(t => { if (!t) return; const c = (st.contracts || []).find(x => x && x.tenantId === t.id && x.status === 'active'); if (c && byBuilding[c.buildingId]) t.managerId = byBuilding[c.buildingId]; });
    (st.users || []).forEach(u => { if (!u || u.role !== 'ops') return; const e = (st.employees || []).find(x => x && x.userId === u.id); const ids = e ? [...new Set((st.buildingAssignments || []).filter(a => a && a.employeeId === e.id && EFFECTIVE.includes(a.status) && a.start <= date && (!a.end || a.end >= date)).map(a => a.buildingId))] : []; if (ids.length || e) u.buildingIds = ids; });
  };

  // Fixup nhỏ cho state đã migrate v5 trước đó (idempotent qua meta.v5Fixups)
  seed.v5Fixups = (st) => {
    st.meta.v5Fixups = st.meta.v5Fixups || {};
    if (!st.meta.v5Fixups.orgSort) { const ORDER = { VH: 1, TCKT: 2, KD: 3, TPVH1: 1, TPVH2: 2, KT: 3 }; (st.orgUnits || []).forEach(u => { if (u && ORDER[u.code] && !u.sortOrder) u.sortOrder = ORDER[u.code]; }); st.meta.v5Fixups.orgSort = true; }
  };
  seed.migrateV5 = (st) => {
    if (st.meta.v5Migrated) { seed.v5Fixups(st); return st; }
    ['orgUnits', 'positions', 'employmentAssignments', 'buildingTypeHistory', 'masterData'].forEach(c => { if (!Array.isArray(st[c])) st[c] = []; });
    seed.catalogOrg(st); seed.usersOrg(st);
    seedEmployment(st);
    migrateAssignments(st);
    seedScenario(st);
    seedTypeHistory(st);
    st.meta.v5Migrated = true; seed.v5Fixups(st);
    seed.activateDueAssignments(st, T); seed.syncDerivedManagers(st, T);
    return st;
  };
})(window.TH);
