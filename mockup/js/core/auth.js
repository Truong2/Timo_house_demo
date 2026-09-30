/* Đăng nhập demo, quyền theo vai trò (domain/rbac-policy) và phạm vi dữ liệu theo phân công/nhánh tổ chức có hiệu lực. */
(function (TH) {
  const S = TH.store, R = TH.calc.rbac;
  const A = {};
  A.login = (username) => {
    const u = S.one('users', x => x.username === String(username || '').trim().toLowerCase() && x.status === 'active');
    if (!u) throw new Error('Tài khoản không tồn tại hoặc đã khóa');
    const ph = u.phase || (R.ROLES[u.role] || {}).phase; // D17: tài khoản tạo mới mang vai trò Phase 2 cũng bị chặn
    if (ph && TH.ms && !TH.ms.on(ph)) throw new Error('Tài khoản thuộc Phase ' + ph + ' – chưa mở ở mốc hiện tại'); // B19
    S.setSession({ userId: u.id, username: u.username, role: u.role, name: u.name, employeeId: u.employeeId, at: TH.f.nowISO() });
    A._scope = null; A._rscope = null;
    return u;
  };
  A.logout = () => { S.setSession(null); A._scope = null; };
  A.user = () => S.session ? S.get('users', S.session.userId) : null;
  A.role = () => S.session ? S.session.role : null;
  A.roleLabel = (r) => (R.ROLES[r || A.role()] || {}).label || '';
  A.can = (perm) => !!S.session && R.can(S.session.role, perm);
  A.need = (perm) => { if (!A.can(perm)) throw new Error('Bạn không có quyền thực hiện thao tác này'); };
  A.switchRole = (username) => { A.login(username); };

  /* Nhánh tổ chức của một nhân viên tại ngày (gồm cấp dưới trực tiếp + gián tiếp) */
  A.branchOf = (empId, date) => {
    const links = S.all('orgLinks').filter(l => (!l.from || l.from <= date) && (!l.to || date <= l.to));
    const out = new Set([empId]); let grew = true;
    while (grew) { grew = false; links.forEach(l => { if (out.has(l.leaderId) && !out.has(l.employeeId)) { out.add(l.employeeId); grew = true; } }); }
    return out;
  };
  /* Tòa được xem: null = toàn hệ thống */
  A.buildingScope = (date) => {
    if (!S.session) return new Set();
    const scope = (R.ROLES[S.session.role] || {}).scope;
    if (scope === 'all') return null;
    const d = date || TH.f.today();
    const key = S.version + '|' + d + '|' + S.session.userId;
    if (A._scope && A._scope.key === key) return A._scope.set;
    const emps = scope === 'branch' ? A.branchOf(S.session.employeeId, d) : new Set([S.session.employeeId]);
    const set = new Set(S.all('assignments').filter(a => emps.has(a.employeeId) && (!a.from || a.from <= d) && (!a.to || d <= a.to)).map(a => a.buildingId));
    A._scope = { key, set };
    return set;
  };
  A.inScope = (buildingId, date) => { const s = A.buildingScope(date); return !s || s.has(buildingId); };
  /* Phạm vi phòng (UI-24 phân công theo phòng): trong tòa mà người dùng / nhánh CHỈ có phân công cấp phòng → chỉ thấy các phòng đó. {buildingId: Set(roomId)}; tòa không có trong map = thấy cả tòa */
  A.roomScope = (date) => {
    if (!S.session) return {};
    const scope = (R.ROLES[S.session.role] || {}).scope; if (scope === 'all') return {};
    const d = date || TH.f.today();
    const key = S.version + '|' + d + '|' + S.session.userId;
    if (A._rscope && A._rscope.key === key) return A._rscope.map;
    const emps = scope === 'branch' ? A.branchOf(S.session.employeeId, d) : new Set([S.session.employeeId]);
    const map = {}, whole = new Set();
    S.all('assignments').filter(a => emps.has(a.employeeId) && (!a.from || a.from <= d) && (!a.to || d <= a.to)).forEach(a => { if (a.roomId) (map[a.buildingId] = map[a.buildingId] || new Set()).add(a.roomId); else whole.add(a.buildingId); });
    whole.forEach(b => { delete map[b]; });
    A._rscope = { key, map };
    return map;
  };
  A.inScopeRoom = (roomId, date) => { const r = S.get('rooms', roomId); if (!r) return false; if (!A.inScope(r.buildingId, date)) return false; const rs = A.roomScope(date)[r.buildingId]; return !rs || rs.has(roomId); };
  /* Phạm vi kinh doanh (Phase 2 – UI-19…22): nhân viên sale được xem lead/deal/doanh số. null = tất cả;
     sale = chính mình; leader / trưởng phòng = nhánh tổ chức (trưởng nhóm KD thấy sale trong team) */
  A.salesScope = (date) => {
    if (!S.session) return new Set();
    const role = S.session.role, d = date || TH.f.today();
    if ((R.ROLES[role] || {}).sales === 'own') return new Set([S.session.employeeId]);
    if ((R.ROLES[role] || {}).sales === 'all') return null; // D4: trưởng phòng xem kinh doanh toàn bộ (không có quyền sửa)
    if ((R.ROLES[role] || {}).scope === 'branch' || (R.ROLES[role] || {}).sales === 'branch') return A.branchOf(S.session.employeeId, d);
    return null;
  };
  A.inSales = (saleIds, date) => { const s = A.salesScope(date); return !s || (saleIds || []).some(id => s.has(id)); };
  A.canRoute = (meta) => !meta || !meta.perm || A.can(meta.perm);
  /* Ẩn nút theo quyền: [data-perm="payments.record"] */
  A.enforceUI = (root) => { root.querySelectorAll('[data-perm]').forEach(el => { if (!el.dataset.perm.split('|').some(p => A.can(p))) el.remove(); }); };
  TH.auth = A;
})(window.TH);
