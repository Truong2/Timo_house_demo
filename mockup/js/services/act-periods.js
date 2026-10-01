/* Actions – tham số GĐ có hiệu lực, khóa/mở kỳ (UI-38), ngày hệ thống demo. */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, D = TH.calc.dates;
  /* Phiên tham số mới: đóng phiên cũ tại ngày trước hiệu lực */
  X.setParam = (key, value, from, reason) => {
    _.need('settings.manage');
    if (!from) throw new Error('Nhập ngày hiệu lực');
    if (!String(reason || '').trim()) throw new Error('Nhập lý do (vd: khách xác nhận OQ-xx)');
    const rows = S.where('params', p => p.key === key);
    const base = rows[0];
    if (!base) throw new Error('Tham số không tồn tại: ' + key);
    const def = Object.assign({}, base, (TH.data.catalog.params || []).find(p => p.key === key) || {});
    const v = TH.calc.params.validate(def, value); if (!v.ok) throw new Error(base.label + ': ' + v.err);
    value = v.value;
    _.guardEffective(from, 'tham số mới');
    if (rows.some(r => r.effectiveFrom >= from)) throw new Error('Đã có phiên hiệu lực từ ' + F.date(rows.map(r => r.effectiveFrom).sort().pop()));
    rows.filter(r => !r.effectiveTo).forEach(r => S.update('params', r.id, { effectiveTo: D.addDays(from, -1) }));
    const p = S.add('params', Object.assign({}, base, { id: undefined, value, effectiveFrom: from, effectiveTo: null, reason, by: _.who() }));
    _.audit('param', 'param', p.id, `Tham số ${base.label}: ${TH.calc.params.format(def, value, F)} từ ${F.date(from)} (${reason})`); _.done(); return p;
  };
  X.closePeriod = (period, checks) => {
    _.need('periods.close');
    const p = S.get('periods', period); if (!p) throw new Error('Không có kỳ ' + period);
    if (p.status === 'closed') throw new Error('Kỳ đã khóa');
    const pend = [];
    if (TH.ms.on('1B')) {
      if (!S.one('payrollRuns', r => r.period === period && r.status === 'closed')) pend.push('bảng lương chưa chốt');
      if (!S.one('allocationRuns', r => r.period === period && r.status === 'closed')) pend.push('phân bổ chưa chốt');
    }
    if (pend.length) throw new Error('Chưa đủ điều kiện khóa kỳ: ' + pend.join(', '));
    // Chốt số báo cáo tại thời điểm khóa: báo cáo kỳ đã khóa đọc từ ảnh chụp này + dòng điều chỉnh sau khóa
    const rep = TH.qr.build(period, 'total', 'gd', { noAdj: true }); // A5: không chụp dòng điều chỉnh (tránh cộng hai lần khi mở lại → khóa lại)
    S.remove('reportSnapshots', 'rs_' + period);
    S.add('reportSnapshots', { id: 'rs_' + period, period, base: JSON.parse(JSON.stringify(rep.base)), dep: JSON.parse(JSON.stringify(rep.dep)), sources: rep.sources, at: F.nowISO(), by: _.who() });
    // Phase 2 (UI-38 nâng cao): mỗi lần khóa lưu một phiên bản số chốt để so sánh giữa các lần khóa / mở lại
    const ver = S.where('reportSnapshotVersions', v => v.period === period).length + 1;
    S.add('reportSnapshotVersions', { id: 'rsv_' + period + '_' + ver, period, version: ver, base: JSON.parse(JSON.stringify(rep.base)), at: F.nowISO(), by: _.who() });
    S.update('periods', period, { status: 'closed', closedAt: F.nowISO(), closedBy: _.who(), history: [...(p.history || []), { type: 'close', version: ver, at: F.nowISO(), by: _.who() }] });
    _.audit('close', 'period', period, 'Khóa kỳ ' + F.periodShort(period) + ' – chốt số báo cáo (phiên bản ' + ver + ')'); _.done();
  };
  /* ---- Quản lý kỳ nâng cao (UI-38, Phase 2 – [GĐ K-7]): mở lại kỳ đã khóa cần yêu cầu có lý do + duyệt của CẢ admin và kế toán;
     lịch sử khóa / mở; so sánh số báo cáo giữa hai phiên bản khóa ---- */
  X.requestReopen = (period, reason) => {
    _.need('periods.close');
    if (!TH.ms.on('2')) throw new Error('Mở lại kỳ cần duyệt kép thuộc Phase 2 – ở mốc hiện tại admin dùng "Mở khóa"');
    const p = S.get('periods', period); if (!p || p.status !== 'closed') throw new Error('Chỉ yêu cầu mở lại kỳ đã khóa');
    if (p.reopenRequest) throw new Error('Kỳ đã có yêu cầu mở lại đang chờ duyệt');
    if (!String(reason || '').trim()) { const e = new Error('Nhập lý do mở lại'); e.fields = { reason: 'Nhập lý do mở lại' }; throw e; }
    S.update('periods', period, { reopenRequest: { reason, by: _.who(), byRole: TH.auth.role(), at: F.nowISO(), approvals: [] } });
    _.audit('request', 'period', period, 'Yêu cầu mở lại kỳ ' + F.periodShort(period) + ': ' + reason); _.done();
  };
  X.approveReopen = (period) => { _.needMs('2', 'Mở lại kỳ cần duyệt kép');
    const role = TH.auth.role();
    if (!['admin', 'ketoan'].includes(role)) throw new Error('Chỉ admin và kế toán duyệt mở lại kỳ');
    _.need(role === 'admin' ? 'periods.reopen.admin' : 'periods.reopen.ketoan');
    const p = S.get('periods', period); const rq = p && p.reopenRequest; if (!rq) throw new Error('Kỳ không có yêu cầu mở lại');
    if (rq.approvals.some(a => a.role === role)) throw new Error('Vai trò ' + TH.auth.roleLabel(role) + ' đã duyệt – cần người của vai trò còn lại');
    const approvals = [...rq.approvals, { role, by: _.who(), at: F.nowISO() }];
    if (approvals.length < 2) { S.update('periods', period, { reopenRequest: Object.assign({}, rq, { approvals }) }); _.audit('approve', 'period', period, 'Duyệt mở lại kỳ ' + F.periodShort(period) + ' (' + TH.auth.roleLabel(role) + ')'); _.done(); return false; }
    S.update('periods', period, { status: 'open', reopenRequest: null, reopenedAt: F.nowISO(), reopenedBy: approvals.map(a => a.by).join(' + '), reopenReason: rq.reason, history: [...(p.history || []), { type: 'reopen', at: F.nowISO(), by: approvals.map(a => a.by).join(' + '), reason: rq.reason }] });
    S.remove('reportSnapshots', 'rs_' + period);
    // D18 [GĐ]: kỳ mở lại → dòng điều chỉnh sau khóa tạm gỡ khỏi báo cáo (kế toán sửa thẳng số gốc, tránh cộng hai lần)
    const adjs = S.where('adjustments', a => a.entity === 'report' && a.originalPeriod === period && a.status !== 'absorbed');
    adjs.forEach(a => S.update('adjustments', a.id, { status: 'absorbed', absorbedAt: F.nowISO(), fixed: false }));
    _.audit('unlock', 'period', period, 'Mở lại kỳ ' + F.periodShort(period) + ' (đủ duyệt admin + kế toán): ' + rq.reason + (adjs.length ? ` · tạm gỡ ${adjs.length} dòng điều chỉnh sau khóa – sửa số gốc` : '')); _.done(); return true;
  };
  /* Người gửi yêu cầu rút lại = "hủy"; người khác = "từ chối" (lịch sử phân biệt) */
  X.cancelReopen = (period, reason) => {
    _.need('periods.close');
    if (!TH.ms.on('2')) throw new Error('Yêu cầu mở lại thuộc Phase 2');
    if (!String(reason || '').trim()) { const e = new Error('Nhập lý do'); e.fields = { reason: 'Nhập lý do' }; throw e; }
    const p = S.get('periods', period); if (!p || !p.reopenRequest) throw new Error('Không có yêu cầu');
    const type = p.reopenRequest.by === _.who() ? 'reopen_cancel' : 'reopen_reject';
    S.update('periods', period, { reopenRequest: null, history: [...(p.history || []), { type, at: F.nowISO(), by: _.who(), reason }] });
    _.audit('cancel', 'period', period, (type === 'reopen_cancel' ? 'Hủy' : 'Từ chối') + ' yêu cầu mở lại: ' + reason); _.done();
  };
  /* D18: đánh dấu dòng điều chỉnh đã gỡ là "đã sửa số gốc" (chỉ để theo dõi) */
  X.markAdjustmentFixed = (id) => {
    _.need('expenses.manage');
    const a = S.get('adjustments', id); if (!a || a.status !== 'absorbed') throw new Error('Chỉ đánh dấu dòng điều chỉnh đã gỡ khi mở lại kỳ');
    S.update('adjustments', id, { fixed: true, fixedBy: _.who(), fixedAt: F.nowISO() });
    _.audit('update', 'adjustment', id, 'Đã sửa số gốc cho dòng điều chỉnh kỳ ' + F.periodShort(a.originalPeriod)); _.done();
  };
  TH.q.absorbedAdjustments = (period) => S.where('adjustments', a => a.entity === 'report' && a.status === 'absorbed' && (!period || a.originalPeriod === period));
  TH.q.snapshotVersions = (period) => S.where('reportSnapshotVersions', v => v.period === period).sort((a, b) => a.version - b.version);
  /* So sánh hai phiên bản khóa: chênh theo tòa × dòng báo cáo nhập liệu */
  TH.q.compareSnapshots = (period, v1, v2) => {
    const A = S.get('reportSnapshotVersions', 'rsv_' + period + '_' + v1), B = S.get('reportSnapshotVersions', 'rsv_' + period + '_' + v2);
    if (!A || !B) return [];
    const out = []; const bids = new Set([...Object.keys(A.base), ...Object.keys(B.base)]);
    bids.forEach(b => { const codes = new Set([...Object.keys(A.base[b] || {}), ...Object.keys(B.base[b] || {})]); codes.forEach(c => { const a = (A.base[b] || {})[c] || 0, x = (B.base[b] || {})[c] || 0; if (Math.abs(x - a) > 0.5) out.push({ buildingId: b, code: c, a, b: x, diff: x - a }); }); });
    return out.sort((p, q) => Math.abs(q.diff) - Math.abs(p.diff));
  };
  /* Điều chỉnh sau khóa: không sửa số đã chốt, ghi dòng điều chỉnh (tòa × dòng báo cáo) có lý do, cộng vào báo cáo kỳ gốc */
  X.addPeriodAdjustment = (d) => {
    _.need('expenses.manage');
    const p = S.get('periods', d.period);
    if (!p || p.status !== 'closed') throw new Error('Kỳ đang mở – sửa trực tiếp chứng từ, không cần điều chỉnh');
    if (!String(d.reason || '').trim()) throw new Error('Nhập lý do điều chỉnh');
    if (!TH.q.building(d.buildingId)) throw new Error('Chọn tòa');
    if (!TH.calc.report.BASE.includes(d.reportLine) || /^cnt_/.test(d.reportLine)) throw new Error('Chọn dòng báo cáo nhập liệu (không chọn dòng tính)');
    const amount = Number(d.amount); if (!amount) throw new Error('Nhập số tiền điều chỉnh (âm để giảm)');
    const a = S.add('adjustments', { period: F.period(F.today()), originalPeriod: d.period, entity: 'report', buildingId: d.buildingId, reportLine: d.reportLine, delta: amount, reason: d.reason, by: _.who(), at: F.nowISO() });
    _.audit('adjust', 'period', d.period, `Điều chỉnh sau khóa kỳ ${F.periodShort(d.period)}: ${d.reportLine} ${TH.q.building(d.buildingId).code} ${F.vnd(amount)} – ${d.reason}`); _.done(); return a;
  };
  X.unlockPeriod = (period, reason) => {
    _.need('periods.unlock');
    if (TH.ms.on('2')) throw new Error('Phase 2: mở lại kỳ đã khóa cần "Yêu cầu mở lại" và được cả admin và kế toán duyệt');
    if (!String(reason || '').trim()) throw new Error('Nhập lý do mở khóa');
    S.update('periods', period, { status: 'open', reopenedAt: F.nowISO(), reopenedBy: _.who(), reopenReason: reason });
    S.remove('reportSnapshots', 'rs_' + period);
    _.audit('unlock', 'period', period, 'Mở khóa kỳ ' + F.periodShort(period) + ': ' + reason); _.done();
  };
  X.setToday = (iso) => { _.need('settings.manage'); S.setMeta({ today: iso }); _.done(); };

  /* ---- Cài đặt (UI-38, E26): tài khoản người dùng, khu vực, TK nhận tiền, danh mục mở rộng ---- */
  const RB = TH.calc.rbac;
  const fail = (fields) => { const e = new Error('Dữ liệu chưa hợp lệ'); e.fields = fields; throw e; };
  X.addUser = (d) => {
    _.need('settings.manage');
    const errs = {}; const username = String(d.username || '').trim().toLowerCase();
    if (!/^[a-z0-9._]{3,32}$/.test(username)) errs.username = 'Tên đăng nhập 3–32 ký tự: a-z, 0-9, dấu chấm, gạch dưới';
    else if (S.one('users', u => u.username === username)) errs.username = 'Tên đăng nhập đã tồn tại';
    if (!RB.ROLES[d.role]) errs.role = 'Chọn vai trò';
    else if (RB.ROLES[d.role].phase && !TH.ms.on(RB.ROLES[d.role].phase)) errs.role = 'Vai trò thuộc Phase ' + RB.ROLES[d.role].phase + ' – chưa mở ở mốc hiện tại'; // D17
    const emp = d.employeeId ? S.get('employees', d.employeeId) : null;
    if (d.employeeId && !emp) errs.employeeId = 'Nhân viên không tồn tại';
    if (RB.ROLES[d.role] && RB.ROLES[d.role].scope !== 'all' && !emp) errs.employeeId = 'Vai trò có phạm vi theo phân công phải gắn nhân viên';
    if (!emp && !String(d.display || '').trim()) errs.display = 'Nhập tên hiển thị hoặc chọn nhân viên';
    if (Object.keys(errs).length) fail(errs);
    const u = S.add('users', { id: 'u_' + username, username, role: d.role, employeeId: emp ? emp.id : null, name: emp ? emp.name : d.display.trim(), display: String(d.display || '').trim() || (emp ? emp.name : username), status: 'active' });
    _.audit('create', 'user', u.id, `Tạo tài khoản ${username} (${RB.ROLES[d.role].label})`); _.done(); return u;
  };
  X.updateUser = (id, d) => {
    _.need('settings.manage');
    const u = S.get('users', id); if (!u) throw new Error('Không tìm thấy tài khoản');
    const errs = {}; const role = d.role || u.role;
    if (!RB.ROLES[role]) errs.role = 'Chọn vai trò';
    else if (role !== u.role && RB.ROLES[role].phase && !TH.ms.on(RB.ROLES[role].phase)) errs.role = 'Vai trò thuộc Phase ' + RB.ROLES[role].phase + ' – chưa mở ở mốc hiện tại'; // D17
    const empId = d.employeeId !== undefined ? (d.employeeId || null) : u.employeeId;
    const emp = empId ? S.get('employees', empId) : null; if (empId && !emp) errs.employeeId = 'Nhân viên không tồn tại';
    if (RB.ROLES[role] && RB.ROLES[role].scope !== 'all' && !emp) errs.employeeId = 'Vai trò có phạm vi theo phân công phải gắn nhân viên';
    if (u.role === 'admin' && role !== 'admin' && !S.where('users', x => x.role === 'admin' && x.status === 'active' && x.id !== id).length) errs.role = 'Phải còn ít nhất một quản trị đang hoạt động';
    if (Object.keys(errs).length) fail(errs);
    S.update('users', id, { role, employeeId: empId, name: emp ? emp.name : (String(d.display || '').trim() || u.name), display: String(d.display || '').trim() || u.display });
    _.audit('update', 'user', id, `Sửa tài khoản ${u.username}: ${RB.ROLES[role].label}`); _.done(); return S.get('users', id);
  };
  X.setUserStatus = (id, status, reason) => {
    _.need('settings.manage');
    const u = S.get('users', id); if (!u) throw new Error('Không tìm thấy tài khoản');
    if (!['active', 'locked'].includes(status)) throw new Error('Trạng thái không hợp lệ');
    if (status === 'locked') {
      if (S.session && S.session.userId === id) throw new Error('Không tự khóa tài khoản đang đăng nhập');
      if (u.role === 'admin' && !S.where('users', x => x.role === 'admin' && x.status === 'active' && x.id !== id).length) throw new Error('Phải còn ít nhất một quản trị đang hoạt động');
      if (!String(reason || '').trim()) throw new Error('Nhập lý do khóa');
    }
    S.update('users', id, { status, statusReason: status === 'locked' ? reason : null, statusAt: F.nowISO() });
    _.audit(status === 'locked' ? 'lock' : 'unlock', 'user', id, `${status === 'locked' ? 'Khóa' : 'Mở khóa'} tài khoản ${u.username}${status === 'locked' ? ': ' + reason : ''}`); _.done();
  };
  X.saveArea = (d) => {
    _.need('settings.manage');
    const name = String(d.name || '').trim(); if (!name) fail({ name: 'Nhập tên khu vực' });
    if (S.one('areas', a => a.name.toLowerCase() === name.toLowerCase() && a.id !== d.id)) fail({ name: 'Khu vực đã có' });
    const a = d.id ? S.update('areas', d.id, { name }) : S.add('areas', { name });
    _.audit(d.id ? 'update' : 'create', 'area', a.id, (d.id ? 'Sửa' : 'Thêm') + ' khu vực ' + name); _.done(); return a;
  };
  X.saveAccount = (d) => {
    _.need('settings.manage');
    const errs = {};
    if (!TH.calc.billing.TEMPLATES[d.template]) errs.template = 'Chọn mẫu in';
    if (!String(d.bank || '').trim()) errs.bank = 'Nhập ngân hàng';
    if (!/^[\d ]{6,24}$/.test(String(d.number || '').trim())) errs.number = 'Số tài khoản 6–24 chữ số';
    if (!String(d.holder || '').trim()) errs.holder = 'Nhập chủ tài khoản';
    if (Object.keys(errs).length) fail(errs);
    const rec = { template: d.template, bank: d.bank.trim(), number: d.number.trim(), holder: d.holder.trim() };
    const a = d.id ? S.update('accounts', d.id, rec) : S.add('accounts', rec);
    _.audit(d.id ? 'update' : 'create', 'account', a.id, `${d.id ? 'Sửa' : 'Thêm'} TK nhận ${rec.bank} ${rec.number} (${rec.template})`); _.done(); return a;
  };
  /* Danh mục mở rộng được: loại chi phí (kèm dòng báo cáo), lý do phá HĐ, chức danh. Mục đã dùng chỉ "ngừng dùng" (có lý do), không xóa. */
  X.CATALOG_KINDS = { expenseCategories: 'loại chi phí', breachReasons: 'lý do phá HĐ', titles: 'chức danh' };
  const areaFind = (v) => v ? S.one('areas', a => a.id === v || a.name.toLowerCase() === String(v).trim().toLowerCase()) : null;
  X.findArea = areaFind;
  X.addCatalogItem = (d) => {
    _.need('settings.manage');
    const kind = d.kind; if (!X.CATALOG_KINDS[kind]) throw new Error('Danh mục không hỗ trợ thêm mục');
    const C = TH.data.catalog, errs = {}; const label = String(d.label || '').trim(); if (!label) errs.label = 'Nhập tên';
    const key = kind === 'breachReasons' ? label : String(d.key || '').trim();
    if (kind !== 'breachReasons' && !/^[^|;,]{1,40}$/.test(key)) errs.key = 'Mã 1–40 ký tự';
    const exists = kind === 'titles' ? !!(C.titlesAll || C.titles)[key] : kind === 'breachReasons' ? C.breachReasons.includes(label) : C.expenseCategories.some(c => c.key === key || c.label.toLowerCase() === label.toLowerCase());
    if (exists || S.one('catalogItems', x => x.kind === kind && x.key === key)) errs[kind === 'breachReasons' ? 'label' : 'key'] = 'Mã / tên đã có trong danh mục';
    if (kind === 'expenseCategories' && d.reportLine && !C.reportLines.some(l => l.code === d.reportLine)) errs.reportLine = 'Dòng báo cáo không tồn tại';
    if (Object.keys(errs).length) fail(errs);
    const it = S.add('catalogItems', { kind, key, label, reportLine: d.reportLine || null, group: d.group || 'Bổ sung', active: true, by: _.who() });
    S.applyCatalog(); _.audit('create', 'catalogItem', it.id, `Thêm ${X.CATALOG_KINDS[kind]}: ${label}`); _.done(); return it;
  };
  X.setCatalogItemActive = (kind, key, active, reason) => {
    _.need('settings.manage');
    if (!X.CATALOG_KINDS[kind]) throw new Error('Danh mục không hỗ trợ');
    if (!active && !String(reason || '').trim()) throw new Error('Nhập lý do ngừng dùng');
    const C = TH.data.catalog, cur = S.one('catalogItems', x => x.kind === kind && x.key === key);
    if (cur) S.update('catalogItems', cur.id, { active: !!active, reason: active ? null : reason });
    else {
      const base = kind === 'titles' ? (C.titlesAll || C.titles)[key] && { label: (C.titlesAll || C.titles)[key] } : kind === 'breachReasons' ? (TH.data.catalogBase.breachReasons.includes(key) && { label: key }) : C.expenseCategories.find(c => c.key === key);
      if (!base) throw new Error('Không tìm thấy mục danh mục');
      S.add('catalogItems', { kind, key, label: base.label, reportLine: base.reportLine || null, group: base.group || null, base: true, active: !!active, reason: active ? null : reason, by: _.who() });
    }
    S.applyCatalog(); _.audit('update', 'catalogItem', kind + ':' + key, `${active ? 'Dùng lại' : 'Ngừng dùng'} ${X.CATALOG_KINDS[kind]} "${key}"${active ? '' : ': ' + reason}`); _.done();
  };
  X.removeCatalogItem = (kind, key) => {
    _.need('settings.manage');
    const cur = S.one('catalogItems', x => x.kind === kind && x.key === key && !x.base); if (!cur) throw new Error('Chỉ xóa được mục bổ sung; mục gốc dùng "Ngừng dùng"');
    const used = kind === 'expenseCategories' ? S.one('expenses', e => e.category === key) : kind === 'titles' ? S.one('employees', e => e.title === key) : S.one('stays', s => s.breachReason === key);
    if (used) throw new Error('Mục đã được dùng – chỉ "Ngừng dùng", không xóa');
    S.remove('catalogItems', cur.id); S.applyCatalog(); _.audit('delete', 'catalogItem', kind + ':' + key, `Xóa ${X.CATALOG_KINDS[kind]} "${cur.label}"`); _.done();
  };
})(window.TH);
