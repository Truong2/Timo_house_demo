/* UI-23 Nhân sự (danh sách, hồ sơ; 1B: lương cứng/phụ cấp, cơ cấu leader/team) · UI-24 Phân công tòa theo hiệu lực (E20). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, I = TH.icon, esc = F.esc, CAT = () => TH.data.catalog;
  const titleLabel = (t) => (CAT().titlesAll || CAT().titles)[t] || t;
  const salaryOn = () => TH.ms.on('1B') && TH.auth.can('hr.salary');
  TH.pages.hrTabs = (cur) => `<div class="subnav">${[['staff', 'Nhân viên', '#/hr', 'hr.view', '1A'], ['org', 'Cơ cấu tổ chức', '#/hr?tab=co-cau', 'hr.view', '1B'], ['assign', 'Phân công', '#/hr/assignments', 'hr.view', '1A'], ['payroll', 'Bảng lương', '#/hr/payroll', 'payroll.view', '1B']]
    .filter(x => TH.auth.can(x[3]) && TH.ms.on(x[4])).map(([k, l, h]) => `<a class="${k === cur ? 'on' : ''}" href="${h}">${l}</a>`).join('')}</div>`;
  const roomsOf = (empId, date) => S.all('assignments').filter(a => a.employeeId === empId && (!a.from || a.from <= date) && (!a.to || date <= a.to)).reduce((s, a) => s + (a.roomId ? 1 : (Q.roomsByBuilding()[a.buildingId] || []).filter(r => Q.rentable(r, date)).length), 0);
  const seniority = (hire) => { const m = F.monthsBetween(hire, F.today()); return m >= 12 ? Math.floor(m / 12) + ' năm ' + (m % 12) + ' tháng' : m + ' tháng'; };

  /* Vai trò trong phác thảo và người có chức danh tương ứng tại ngày xem. */
  const orgPersonLink = (e) => `<a class="org-role-person" href="#/hr/staff/${esc(e.id)}">${esc(e.name)}</a>`;
  const orgRole = (label, people, emptyLabel) => `<div class="org-role"><div class="org-role-title"><span class="org-role-dot"></span><span>${esc(label)}</span>${people.length ? `<b>${people.length}</b>` : ''}</div>${people.length ? `<div class="org-role-people ${people.length > 8 ? 'dense' : ''}">${people.map(orgPersonLink).join('')}</div>` : `<span class="org-vacant">${esc(emptyLabel)}</span>`}</div>`;
  const orgBranch = ({ no, name, icon, tone, lines }) => `<section class="org-branch org-${tone}" aria-label="${esc(name)}">
    <div class="org-branch-top"><span class="org-branch-icon">${I(icon)}</span><span class="org-branch-no">${esc(no)}</span></div>
    <h3>${esc(name)}</h3><div class="org-branch-line"></div>
    <div class="org-branch-body">${lines}</div>
  </section>`;
  const orgBlueprint = (date) => {
    const role = TH.calc.rbac.ROLES[TH.auth.role()];
    const allScope = role && role.scope === 'all';
    const visible = allScope ? null : TH.auth.branchOf(S.session.employeeId, date);
    const allStaff = S.all('employees').filter(e => e.status === 'active');
    const staff = allStaff.filter(e => !visible || visible.has(e.id));
    const byTitle = (title) => staff.filter(e => e.title === title);
    const heads = allStaff.filter(e => e.title === 'TPVH');
    const inBranch = (head, title) => head ? staff.filter(e => e.title === title && TH.auth.branchOf(head.id, date).has(e.id)) : [];
    const empty = allScope ? 'Chưa phân công' : 'Ngoài phạm vi xem';
    const ops = (index) => {
      const head = heads[index];
      const lines = orgRole('Trưởng phòng vận hành', head && (!visible || visible.has(head.id)) ? [head] : [], empty)
        + orgRole('Trưởng nhóm vận hành', inBranch(head, 'TNVH'), empty)
        + orgRole('Nhân viên vận hành', inBranch(head, 'NVVH'), empty)
        + (index === 0 ? orgRole('Nhân viên sàn / hầm', [], empty) : '');
      return orgBranch({ no: '0' + (index + 1), name: 'TP vận hành ' + (index + 1), icon: 'building', tone: 'blue', lines });
    };
    const manager = byTitle('QL TỔNG')[0];
    const tech = byTitle('KỸ THUẬT');
    const market = byTitle('THỊ TRƯỜNG');
    return `<div class="org-blueprint">
    <div class="org-blueprint-head"><div><span class="org-eyebrow">SƠ ĐỒ TỔ CHỨC</span><h2>Cơ cấu TimoHouse</h2><p>Nhân sự và chức danh đang có hiệu lực tại ${F.date(date)}.</p></div><span class="org-legend"><i></i> Tên nhân sự · chức danh</span></div>
    <div class="org-chart-scroll"><div class="org-chart">
      <div class="org-root"><div class="org-root-icon">${I('users')}</div><div><small>CẤP QUẢN LÝ</small><strong>Quản lý tổng</strong>${manager ? orgPersonLink(manager) : `<span>${esc(empty)}</span>`}</div></div>
      <div class="org-branches">
        ${ops(0)}${ops(1)}${ops(2)}
        ${orgBranch({ no: '04', name: 'Tài chính · Kế toán', icon: 'wallet', tone: 'amber', lines: orgRole('Kế toán', byTitle('KẾ TOÁN'), empty) })}
        ${orgBranch({ no: '05', name: 'Kinh doanh', icon: 'trending-up', tone: 'purple', lines: orgRole('Trưởng phòng kinh doanh', byTitle('TPKD'), empty) + orgRole('Trưởng nhóm kinh doanh', byTitle('TNKD'), empty) + orgRole('Nhân viên kinh doanh', byTitle('NVKD'), empty) + orgRole('Lead team sale', [], empty) + orgRole('Sale', byTitle('SALE'), empty) })}
      </div>
      <div class="org-support-row"><div class="org-shared"><span class="org-shared-icon">${I('share')}</span><div><strong>Kỹ thuật dùng chung</strong><span>Hỗ trợ cả 3 phòng vận hành</span><div class="org-support-people">${tech.length ? tech.map(orgPersonLink).join('') : `<span>${esc(empty)}</span>`}</div></div></div><div class="org-market"><span class="org-shared-icon">${I('users')}</span><div><strong>Thị trường</strong><span>Báo cáo trực tiếp quản lý tổng</span><div class="org-support-people">${market.length ? market.map(orgPersonLink).join('') : `<span>${esc(empty)}</span>`}</div></div></div></div>
    </div></div>
    <div class="org-chart-note">${I('info')} TP vận hành 2–3 và các chức danh chưa có người được đánh dấu rõ trên sơ đồ. “Quan hệ nhân sự” hiển thị leader trực tiếp theo dữ liệu demo.</div>
  </div>`;
  };
  const orgPeople = (date) => {
    const all = S.all('employees');
    const role = TH.calc.rbac.ROLES[TH.auth.role()];
    const visible = role && role.scope === 'branch' ? TH.auth.branchOf(S.session.employeeId, date) : new Set(all.map(e => e.id));
    const links = S.all('orgLinks').filter(l => (!l.from || l.from <= date) && (!l.to || date <= l.to) && visible.has(l.employeeId) && visible.has(l.leaderId));
    const children = new Map(); links.forEach(l => { if (!children.has(l.leaderId)) children.set(l.leaderId, []); children.get(l.leaderId).push(l.employeeId); });
    const linked = new Set(links.map(l => l.employeeId));
    const byId = new Map(all.filter(e => visible.has(e.id)).map(e => [e.id, e]));
    const node = (id, seen = new Set()) => {
      const e = byId.get(id); if (!e || seen.has(id)) return '';
      const next = new Set(seen); next.add(id);
      const kids = (children.get(id) || []).filter(k => byId.has(k) && !next.has(k));
      const person = `<span class="org-person-avatar">${esc(e.name.split(' ').slice(-2).map(s => s[0]).join('').toUpperCase())}</span><span class="org-person-text"><a href="#/hr/staff/${esc(e.id)}" onclick="event.stopPropagation()">${esc(e.name)}</a><small>${esc(titleLabel(e.title))}${roomsOf(e.id, date) ? ' · ' + roomsOf(e.id, date) + ' phòng' : ''}</small></span>${kids.length ? `<span class="org-person-count">${kids.length} trực tiếp</span>` : ''}`;
      return `<li class="org-person-li">${kids.length ? `<details ${seen.size < 2 ? 'open' : ''}><summary>${person}</summary><ul>${kids.map(k => node(k, next)).join('')}</ul></details>` : `<div class="org-person-leaf">${person}</div>`}</li>`;
    };
    const roots = all.filter(e => visible.has(e.id) && !linked.has(e.id));
    return `<div class="org-people"><div class="org-people-head"><div><h2>Quan hệ nhân sự</h2><p>Leader và thành viên đang có hiệu lực tại ${F.date(date)}.</p></div><div class="org-people-actions"><button type="button" class="btn btn-ghost btn-sm" data-act="org-expand">Mở tất cả</button><button type="button" class="btn btn-ghost btn-sm" data-act="org-collapse">Thu gọn</button></div></div><div class="org-people-tree">${roots.length ? `<ul>${roots.map(e => node(e.id)).join('')}</ul>` : U.empty({ title: 'Chưa có quan hệ tổ chức' })}</div></div>`;
  };

  TH.router.handle('/hr', (root, p, q) => {
    const tab = q.tab === 'co-cau' && TH.ms.on('1B') ? 'co-cau' : 'nhan-vien';
    const t = F.today(); let exportedStaff = [];
    if (tab === 'nhan-vien') {
      let rows = S.all('employees');
      if (!TH.calc.rbac.ROLES[TH.auth.role()] || TH.calc.rbac.ROLES[TH.auth.role()].scope === 'branch') { const br = TH.auth.branchOf(S.session.employeeId, t); rows = rows.filter(e => br.has(e.id)); }
      if (q.title) rows = rows.filter(e => e.title === q.title);
      if (q.status) rows = rows.filter(e => e.status === q.status);
      if (q.q) rows = rows.filter(e => K.match(q.q, e.name, e.code));
      exportedStaff = rows;
      root.innerHTML = TH.pages.hrTabs('staff') + U.pageHead({ title: 'Nhân sự', sub: 'Phân công tòa có ngày hiệu lực là nguồn cho phân quyền, bộ lọc quản lý và bảng lương', acts: [U.btn({ label: 'Xuất', icon: 'download', act: 'exp' }), U.btn({ label: 'Import nhân viên', icon: 'upload', href: '#/import?type=staff', perm: 'import.master' }), U.btn({ label: 'Thêm nhân sự', icon: 'user-plus', cls: 'btn-primary', act: 'add', perm: 'hr.manage' })] })
        + `<div class="grid grid-4 mb16">${U.kpi({ label: 'Đang làm việc', value: rows.filter(e => e.status === 'active').length, icon: 'users' })}${U.kpi({ label: 'Vận hành (NVVH/TNVH/TPVH)', value: rows.filter(e => ['NVVH', 'TNVH', 'TPVH'].includes(e.title)).length, icon: 'building', tone: 'teal' })}
          ${U.kpi({ label: 'Kinh doanh', value: rows.filter(e => ['SALE', 'NVKD', 'TNKD'].includes(e.title)).length, icon: 'trending-up', tone: 'purple' })}${U.kpi({ label: 'Tòa chưa phân công', value: S.all('buildings').filter(b => !Q.managerOf(b.id)).length, icon: 'alert-triangle', tone: 'amber' })}</div>`
        + K.filters([{ name: 'q', type: 'search', label: 'Tìm', placeholder: 'Tên, mã NV' }, { name: 'title', label: 'Chức danh', options: Object.entries(CAT().titles) }, { name: 'status', label: 'Trạng thái', options: [['active', 'Đang làm'], ['left', 'Đã nghỉ']] }], q)
        + '<div class="mt16">' + K.tableCard('t', rows.length + ' nhân sự') + '</div>';
      K.bindFilters(root);
      U.table(root.querySelector('#t'), { rows, pageSize: 25, rowHref: e => '#/hr/staff/' + e.id, cols: [
        { key: 'code', label: 'Mã NV', render: e => esc(e.code) }, { key: 'name', label: 'Họ tên', render: e => `<b>${esc(e.name)}</b>` }, { key: 'dept', label: 'Phòng ban', render: e => esc(Q.departmentOf(e.id, t)) }, { key: 't', label: 'Chức danh', render: e => esc(titleLabel(e.title)) },
        { key: 'l', label: 'Leader', render: e => esc((Q.leaderOf(e.id, t) || {}).name || '–') }, { key: 'h', label: 'Ngày vào', render: e => F.date(e.hireDate) }, { key: 's', label: 'Thâm niên', render: e => seniority(e.hireDate) },
        { key: 'b', label: 'Tòa phụ trách', render: e => { const bs = S.all('assignments').filter(a => a.employeeId === e.id && (!a.to || a.to >= t) && a.from <= t).map(a => (Q.building(a.buildingId) || {}).code); return bs.length ? `<span class="small">${esc(bs.slice(0, 6).join(', '))}${bs.length > 6 ? ' +' + (bs.length - 6) : ''}</span>` : '–'; } },
        { key: 'r', label: 'Số phòng', num: true, render: e => roomsOf(e.id, t) || '–' },
        ...(salaryOn() ? [{ key: 'sal', label: 'Lương cứng', num: true, render: e => F.vnd(e.baseSalary || 0) }] : []),
        { key: 'st', label: 'Trạng thái', render: e => e.status === 'active' ? U.chip('Đang làm', 'green') : U.chip('Đã nghỉ ' + F.date(e.leftDate), 'gray') }] });
    } else {
      const peopleView = q.view === 'people';
      root.innerHTML = TH.pages.hrTabs('org') + U.pageHead({ title: 'Cơ cấu tổ chức', sub: 'Sơ đồ vai trò và quan hệ leader – thành viên tại ' + F.date(t), acts: [U.btn({ label: 'Đổi leader', icon: 'arrow-left-right', cls: 'btn-primary', act: 'leader', perm: 'hr.manage' })] })
        + `<div class="org-view-tabs" role="tablist" aria-label="Chế độ xem cơ cấu tổ chức"><a role="tab" aria-selected="${!peopleView}" class="${!peopleView ? 'on' : ''}" href="#/hr?tab=co-cau">${I('share')} Sơ đồ tổ chức</a><a role="tab" aria-selected="${peopleView}" class="${peopleView ? 'on' : ''}" href="#/hr?tab=co-cau&view=people">${I('users')} Quan hệ nhân sự</a></div>`
        + (peopleView ? orgPeople(t) : orgBlueprint(t));
    }
    U.bind(root, {
      exp: () => K.csv('nhan-su.csv', ['Mã NV', 'Họ tên', 'Phòng ban', 'Chức danh', 'Leader', 'Ngày vào', 'Thâm niên', 'Trạng thái', 'Tòa/phòng phụ trách'], exportedStaff.map(e => { const as = S.where('assignments', a => a.employeeId === e.id && a.from <= t && (!a.to || t <= a.to)); return [e.code, e.name, Q.departmentOf(e.id, t), titleLabel(e.title), (Q.leaderOf(e.id, t) || {}).name || '', e.hireDate, seniority(e.hireDate), e.status, as.map(a => (Q.building(a.buildingId) || {}).code + (a.roomId ? '/' + Q.roomCode(a.roomId) : '')).join(', ')]; })),
      add: () => K.formDrawer({ title: 'Thêm nhân sự', fields: [{ name: 'name', label: 'Họ tên', req: true }, { name: 'title', label: 'Chức danh', type: 'select', req: true, options: Object.entries(CAT().titles) }, { name: 'hireDate', label: 'Ngày vào làm', type: 'date', req: true, value: F.today() },
        { name: 'leaderId', label: 'Leader trực tiếp', type: 'select', options: S.all('employees').map(e => [e.id, e.name + ' – ' + titleLabel(e.title)]) }, { name: 'phone', label: 'SĐT' },
        ...(salaryOn() ? [{ name: 'baseSalary', label: 'Lương cứng', type: 'money' }, { name: 'lunch', label: 'Phụ cấp ăn trưa', type: 'money' }, { name: 'fuel', label: 'Phụ cấp xăng xe', type: 'money' }] : [])], onSubmit: (d) => { X.addEmployee(d); U.toast('ok', 'Đã thêm nhân sự'); } }),
      leader: () => K.formDrawer({ title: 'Đổi leader', fields: [{ name: 'employeeId', label: 'Nhân viên', type: 'select', req: true, options: S.all('employees').map(e => [e.id, e.name]) }, { name: 'leaderId', label: 'Leader mới', type: 'select', req: true, options: S.all('employees').map(e => [e.id, e.name + ' – ' + titleLabel(e.title)]) }, { name: 'from', label: 'Hiệu lực từ', type: 'date', req: true, value: F.today() }],
        onSubmit: (d) => { X.setLeader(d); U.toast('ok', 'Đã đổi leader'); } }),
      'org-expand': () => root.querySelectorAll('.org-people-tree details').forEach(d => { d.open = true; }),
      'org-collapse': () => root.querySelectorAll('.org-people-tree details').forEach((d, i) => { d.open = i === 0; }),
    });
  });

  TH.router.handle('/hr/staff/:id', (root, p) => {
    const e = Q.emp(p.id); if (!e) { root.innerHTML = U.empty({ title: 'Không tìm thấy nhân viên' }); return; }
    TH.layout.crumb([{ label: 'Nhân sự', href: '#/hr' }, { label: e.name }]);
    const as = S.where('assignments', a => a.employeeId === e.id).sort((a, b) => String(b.from).localeCompare(String(a.from)));
    const links = S.where('orgLinks', l => l.employeeId === e.id);
    root.innerHTML = U.pageHead({ title: esc(e.name), back: '#/hr', sub: `${esc(e.code)} · ${esc(titleLabel(e.title))} · vào làm ${F.date(e.hireDate)} (${seniority(e.hireDate)})`, acts: [U.btn({ label: 'Sửa hồ sơ', icon: 'pencil', act: 'edit', perm: 'hr.manage' }), e.status === 'active' ? U.btn({ label: 'Ngừng hoạt động', icon: 'user-x', act: 'off', perm: 'hr.manage' }) : ''] })
      + `<div class="two-col"><div class="side-stack">${K.tableCard('at', 'Phân công tòa theo thời gian')}${U.card({ title: 'Lịch sử leader', icon: 'users', body: links.map(l => `<div class="mini-row"><span>${F.date(l.from)} → ${l.to ? F.date(l.to) : 'nay'}</span><b class="grow tr">${esc((Q.emp(l.leaderId) || {}).name || '')}</b></div>`).join('') || '<span class="muted small">Cấp cao nhất</span>' })}</div>
      <div class="side-stack">${U.card({ title: 'Hồ sơ', icon: 'user', body: U.kv([['Chức danh', esc(titleLabel(e.title))], ['SĐT', esc(e.phone || '')], ['Ngày vào', F.date(e.hireDate)], ['Thâm niên tại kỳ lương', F.monthsBetween(e.hireDate, F.periodEnd(S.meta.period)) >= 12 ? 'Trên 1 năm' : 'Dưới 1 năm'], ['Trạng thái', e.status === 'active' ? 'Đang làm' : 'Đã nghỉ']]) })}
        ${salaryOn() ? U.card({ title: 'Lương & phụ cấp', icon: 'wallet', body: U.kv([['Lương cứng', F.vndd(e.baseSalary || 0)], ['Phụ cấp ăn trưa', F.vndd((e.allowances || {}).lunch || 0)], ['Phụ cấp xăng xe', F.vndd((e.allowances || {}).fuel || 0)], ['Hỗ trợ', F.vndd((e.allowances || {}).support || 0)]]) }) : ''}</div></div>`;
    U.table(root.querySelector('#at'), { rows: as, noPager: true, cols: [{ key: 'b', label: 'Tòa', render: a => `<a href="#/buildings/${a.buildingId}">${esc((Q.building(a.buildingId) || {}).code)}</a>` }, { key: 'f', label: 'Từ', render: a => F.date(a.from) }, { key: 't', label: 'Đến', render: a => a.to ? F.date(a.to) : U.chip('Hiệu lực', 'green') }, { key: 'r', label: 'Lý do', render: a => esc(a.reason || a.closedReason || '') }] });
    U.bind(root, {
      edit: () => K.formDrawer({ title: 'Sửa hồ sơ', fields: [{ name: 'name', label: 'Họ tên', value: e.name, req: true }, { name: 'title', label: 'Chức danh', type: 'select', options: Object.entries(CAT().titles), value: e.title }, { name: 'hireDate', label: 'Ngày vào', type: 'date', value: e.hireDate }, { name: 'phone', label: 'SĐT', value: e.phone },
        ...(salaryOn() ? [{ name: 'baseSalary', label: 'Lương cứng', type: 'money', value: e.baseSalary || 0 }, { name: 'lunch', label: 'Ăn trưa', type: 'money', value: (e.allowances || {}).lunch || 0 }, { name: 'fuel', label: 'Xăng xe', type: 'money', value: (e.allowances || {}).fuel || 0 }, { name: 'support', label: 'Hỗ trợ', type: 'money', value: (e.allowances || {}).support || 0 }] : [])],
        onSubmit: (d) => { const patch = { name: d.name, title: d.title, hireDate: d.hireDate, phone: d.phone }; if (salaryOn()) Object.assign(patch, { baseSalary: d.baseSalary, allowances: { lunch: d.lunch, fuel: d.fuel, support: d.support } }); X.updateEmployee(e.id, patch); U.toast('ok', 'Đã lưu'); } }),
      off: () => K.formDrawer({ title: 'Ngừng hoạt động ' + e.name, modal: true, fields: [{ name: 'date', label: 'Ngày ngừng', type: 'date', req: true, value: F.today() }, { name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Xác nhận', onSubmit: (d) => { X.deactivateEmployee(e.id, d); U.toast('ok', 'Đã ngừng hoạt động'); } }),
    });
  });

  TH.router.handle('/hr/assignments', (root, p, q) => {
    const t = q.date || F.today();
    let rows = S.all('assignments').filter(a => TH.auth.inScope(a.buildingId));
    if (q.building) rows = rows.filter(a => a.buildingId === q.building);
    if (q.emp) rows = rows.filter(a => a.employeeId === q.emp);
    if (q.state === 'active') rows = rows.filter(a => a.from <= t && (!a.to || a.to >= t)); if (q.state === 'ended') rows = rows.filter(a => a.to && a.to < t);
    rows.sort((a, b) => ((Q.building(a.buildingId) || {}).code || '').localeCompare((Q.building(b.buildingId) || {}).code || '') || String(b.from).localeCompare(String(a.from)));
    root.innerHTML = TH.pages.hrTabs('assign') + U.pageHead({ title: 'Phân công theo thời gian', sub: 'Chuyển phân công giữa tháng đóng phiên cũ ngày trước đó – lương tính cho người phụ trách tại ngày 15 (GĐ OQ-02)', acts: [U.btn({ label: 'Chuyển phân công', icon: 'arrow-left-right', cls: 'btn-primary', act: 'move', perm: 'hr.manage' })] })
      + K.filters([{ name: 'date', type: 'date', label: 'Xem tại ngày', value: t }, { name: 'building', label: 'Tòa', options: K.buildingOpts() }, { name: 'emp', label: 'Nhân viên', options: K.managerOpts() }, { name: 'state', label: 'Hiệu lực', options: [['active', 'Đang hiệu lực'], ['ended', 'Đã kết thúc']] }], q)
      + '<div class="mt16">' + K.tableCard('t', rows.length + ' phân công') + '</div>';
    K.bindFilters(root);
    U.table(root.querySelector('#t'), { rows, pageSize: 30, cols: [
      { key: 'b', label: 'Tòa', render: a => `<b>${esc((Q.building(a.buildingId) || {}).code)}</b>` }, { key: 'e', label: 'Nhân viên', render: a => `<a href="#/hr/staff/${a.employeeId}">${esc((Q.emp(a.employeeId) || {}).name || '')}</a>` },
      { key: 'l', label: 'Leader tại ngày', render: a => esc((Q.leaderOf(a.employeeId, t) || {}).name || '') }, { key: 'sc', label: 'Phạm vi', render: a => a.roomId ? U.chip('Phòng ' + Q.roomCode(a.roomId), 'purple') : U.chip('Cả tòa', 'gray') }, { key: 'r', label: 'Trách nhiệm', render: a => esc(CAT().responsibilities[a.responsibility] || a.responsibility) },
      { key: 'f', label: 'Từ', render: a => F.date(a.from) }, { key: 'to', label: 'Đến', render: a => a.to ? F.date(a.to) : '–' }, { key: 'rs', label: 'Lý do', render: a => `<span class="small">${esc(a.reason || a.closedReason || '')}</span>` },
      { key: 'st', label: '', render: a => a.from <= t && (!a.to || a.to >= t) ? U.chip('Hiệu lực', 'green') : a.from > t ? U.chip('Sắp hiệu lực', 'blue') : U.chip('Đã kết thúc', 'gray') },
      { key: 'x', label: '', render: a => !a.to || a.to >= t ? U.actBtn({ icon: 'x', label: 'Bỏ phân công', act: 'end', attrs: { 'data-id': a.id }, perm: 'hr.manage' }) : '' }] });
    U.bind(root, { end: (el) => { const a = S.get('assignments', el.dataset.id); K.formDrawer({ title: 'Bỏ phân công', sub: `${esc((Q.emp(a.employeeId) || {}).name)} · ${a.roomId ? 'phòng ' + Q.roomCode(a.roomId) : 'tòa ' + (Q.building(a.buildingId) || {}).code}`, modal: true, size: 'sm', fields: [
        { name: 'to', label: 'Kết thúc sau ngày', type: 'date', req: true, value: F.today() }, { name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }], submit: 'Bỏ phân công', onSubmit: (x) => { X.endAssignment(a.id, x.to, x.reason); U.toast('ok', 'Đã bỏ phân công'); } }); },
      move: () => {
      const d = K.formDrawer({ title: 'Chuyển phân công (E20)', sub: 'Không ghi đè kỳ trước – hệ thống kiểm tra xung đột', fields: [
        { name: 'buildingId', label: 'Tòa', type: 'select', req: true, options: K.buildingOpts(), value: q.building || '' }, { name: 'employeeId', label: 'Nhân viên nhận', type: 'select', req: true, options: S.all('employees').filter(e => e.status === 'active').map(e => [e.id, e.name + ' – ' + titleLabel(e.title)]) },
        { name: 'from', label: 'Hiệu lực từ', type: 'date', req: true, value: F.today() }, { name: 'responsibility', label: 'Trách nhiệm', type: 'select', options: Object.entries(CAT().responsibilities), value: 'operate' },
        { type: 'html', html: `<div class="field"><label>Phạm vi phòng</label><select class="inp" name="roomId"><option value="">Cả tòa</option></select><div class="help">Để trống = cả tòa; chọn phòng = chỉ phụ trách phòng đó (phạm vi dữ liệu theo phòng)</div></div>` },
        { name: 'reason', label: 'Lý do', type: 'textarea', req: true, span: true }, { type: 'html', span: true, html: '<div id="cur-as" class="small"></div>' }],
        submit: 'Lưu phân công', onSubmit: (x) => { X.assign(x); U.toast('ok', 'Đã lưu phân công'); } });
      const show = () => { const bid = d.el.querySelector('[name=buildingId]').value, rid = d.el.querySelector('[name=roomId]').value, resp = d.el.querySelector('[name=responsibility]').value;
        const sel = d.el.querySelector('[name=roomId]'); if (sel.dataset.b !== bid) { sel.dataset.b = bid; sel.innerHTML = '<option value="">Cả tòa</option>' + (Q.roomsByBuilding()[bid] || []).slice().sort((a, b) => a.number - b.number).map(r => `<option value="${r.id}">${esc(r.code)}</option>`).join(''); }
        const cur = S.where('assignments', a => a.buildingId === bid && a.responsibility === resp && (a.roomId || '') === (sel.value || '') && !a.to);
        d.el.querySelector('#cur-as').innerHTML = cur.length ? 'Đang phụ trách cùng phạm vi: <b>' + cur.map(a => esc((Q.emp(a.employeeId) || {}).name) + ' (từ ' + F.date(a.from) + ')').join(', ') + '</b> – sẽ đóng phiên ngày trước hiệu lực mới' : 'Chưa ai giữ trách nhiệm này ở phạm vi đã chọn'; };
      d.el.addEventListener('change', show); show(); } });
  });
})(window.TH);
