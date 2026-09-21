/* Shell: sidebar + topbar + content + công cụ nâng cao */
(function (TH) {
  const F = TH.f, U = TH.ui, I = TH.icon, esc = F.esc, Q = TH.q;
  const L = {};
  const navItem = (key, label, icon, href, permission, phase = 0) => ({ key, label, icon, href, permission, phase });
  const NAV_ITEMS = {
    dashboard: navItem('dashboard', 'Tổng quan', 'home', '#/dashboard', 'dashboard.view'),
    rooms: navItem('rooms', 'Phòng', 'door', '#/rooms', 'rooms.view'), buildings: navItem('buildings', 'Tòa nhà', 'building', '#/buildings', 'buildings.view'),
    tenants: navItem('tenants', 'Khách thuê', 'users', '#/tenants', 'tenants.view'), contracts: navItem('contracts', 'Hợp đồng', 'file-text', '#/contracts', 'contracts.view'), expiring: navItem('expiring', 'HĐ sắp hết hạn', 'clock', '#/contracts/expiring', 'contracts.view'), meters: navItem('meters', 'Điện / Nước', 'zap', '#/meters', 'invoices.view'), 'billing-periods': navItem('billing-periods', 'Kỳ hóa đơn', 'calendar', '#/finance/periods', 'invoices.view'),
    ocr: navItem('ocr', 'Trích xuất hợp đồng', 'file-check', '#/contracts/ocr', 'ocr.use'), landlords: navItem('landlords', 'Chủ nhà & đối tác', 'user-check', '#/landlords', 'landlords.view'),
    'crm-overview': navItem('crm-overview', 'Tổng quan kinh doanh', 'bar-chart-2', '#/crm', 'crm.view', 2), crm: navItem('crm', 'Khách hàng tiềm năng', 'user', '#/crm/leads', 'crm.view', 2),
    viewings: navItem('viewings', 'Lịch xem phòng', 'calendar-check', '#/crm/viewings', 'crm.view', 2), holds: navItem('holds', 'Giữ chỗ', 'clock', '#/crm/holds', 'crm.view', 2), deals: navItem('deals', 'Giao dịch & hoa hồng', 'hand-coins', '#/crm/deals', 'deals.view', 2),
    invoices: navItem('invoices', 'Hóa đơn', 'receipt', '#/invoices', 'invoices.view'), receivables: navItem('receivables', 'Thu tiền & công nợ', 'wallet', '#/receivables', 'payments.view'), refunds: navItem('refunds', 'Hoàn cọc', 'hand-coins', '#/refunds', 'refunds.view'),
    deposits: navItem('deposits', 'Quản lý cọc', 'piggy', '#/finance/deposits', 'deposits.view', 2), expenses: navItem('expenses', 'Chi phí', 'credit-card', '#/expenses', 'expenses.view'), bank: navItem('bank', 'Ngân hàng & đối soát', 'landmark', '#/finance/bank', 'bank.view', 3),
    maintenance: navItem('maintenance', 'Bảo trì & sự cố', 'wrench', '#/maintenance', 'maintenance.view', 2), tasks: navItem('tasks', 'Lịch bảo dưỡng', 'calendar', '#/maintenance/schedules', 'maintenance.view', 2),
    documents: navItem('documents', 'Tài liệu', 'folder', '#/documents', 'documents.view'), assets: navItem('assets', 'Tài sản', 'package', '#/assets', 'assets.view', 3), inventory: navItem('inventory', 'Kiểm kê', 'clipboard-check', '#/assets/inventory', 'inventory.view', 3),
    'zalo-history': navItem('zalo-history', 'Lịch sử gửi Zalo', 'send', '#/zalo/history', 'zalo.view'), 'zalo-config': navItem('zalo-config', 'Thông báo & nhắc việc', 'sliders', '#/zalo/config', 'zalo.config'), reports: navItem('reports', 'Báo cáo tổng quan', 'bar-chart', '#/reports', 'reports.view'),
    'reports-detail': navItem('reports-detail', 'Trung tâm báo cáo', 'list', '#/reports/hub', 'reports.hub', 2), cashbook: navItem('cashbook', 'Dòng tiền', 'arrow-left-right', '#/reports/cashflow', 'reports.hub', 2),
    statement: navItem('statement', 'Nhập bảng kê thu tiền', 'file-spreadsheet', '#/finance/statement-import', 'statement.import', 2), opening: navItem('opening', 'Số dư ban đầu', 'layers', '#/finance/opening-balance', 'openingBalance.manage', 2), jobs: navItem('jobs', 'Tác vụ dữ liệu', 'database', '#/settings/jobs', 'dataJobs.view', 2),
    hr: navItem('hr', 'Nhân viên', 'users', '#/hr', 'hr.view'), timesheet: navItem('timesheet', 'Chấm công', 'clock', '#/hr/timesheet', 'timesheet.view', 3), payroll: navItem('payroll', 'Bảng lương', 'banknote', '#/hr/payroll', 'payroll.view'),
    // Spec v1.8 Wave 1 – Nhân sự P1: cơ cấu tổ chức, phân công tòa nhà (single source of truth); Cài đặt: master data
    org: navItem('org', 'Cơ cấu tổ chức', 'layers', '#/hr/org', 'org.view'), assignments: navItem('assignments', 'Phân công tòa nhà', 'building', '#/hr/assignments', 'assignments.view'),
    'master-data': navItem('master-data', 'Master Data', 'database', '#/settings/catalog?tab=master', 'masterData.view'),
    projects: navItem('projects', 'Dự án', 'folder', '#/investment/projects', 'projects.view', 3), shareholders: navItem('shareholders', 'Cổ đông, góp vốn & phân phối', 'users', '#/investment/shareholders', 'shareholders.view'), roi: navItem('roi', 'Hiệu quả đầu tư', 'trending-up', '#/investment/roi', 'roi.view', 3),
  };
  const item = ref => { const spec = typeof ref === 'string' ? { key: ref } : ref; return Object.assign({}, NAV_ITEMS[spec.key], spec); };
  const section = (key, group, icon, refs) => ({ key, group, icon, items: refs.map(item) });
  const home = label => ({ items: [item({ key: 'dashboard', label })] });
  // Menu theo spec v1.8 §8: Tổng quan · Vận hành · Tài chính · Kinh doanh (P2) · Nhân sự · Tài sản (P2/P3) · Đầu tư · Thông báo · Báo cáo. Cài đặt qua app launcher.
  const ROLE_NAV_LAYOUT = {
    admin: [home('Tổng quan'), section('leasing', 'Vận hành', 'building', ['contracts', 'ocr', 'expiring', 'buildings', 'rooms', 'tenants', 'landlords', 'refunds']), section('finance', 'Tài chính', 'wallet', ['meters', 'invoices', 'billing-periods', 'receivables', 'expenses', 'deposits', 'bank']), section('business', 'Kinh doanh', 'briefcase', ['crm-overview', 'crm', 'viewings', 'holds', 'deals']), section('hr', 'Nhân sự', 'users', ['org', 'hr', 'assignments', 'payroll', 'timesheet']), section('assets', 'Tài sản & bảo trì', 'package', ['assets', 'inventory', 'maintenance', 'tasks', 'documents']), section('investment', 'Đầu tư', 'trending-up', ['shareholders', 'projects', 'roi']), section('notify', 'Thông báo', 'send', ['zalo-history', 'zalo-config']), section('reports', 'Báo cáo', 'bar-chart', ['reports', 'reports-detail', 'cashbook'])],
    qltong: [home('Tổng quan'), section('leasing', 'Vận hành', 'building', ['contracts', 'expiring', 'buildings', 'rooms', 'tenants', 'landlords', 'refunds']), section('finance', 'Tài chính', 'wallet', ['meters', 'invoices', 'billing-periods', 'receivables', 'expenses', 'deposits']), section('hr', 'Nhân sự', 'users', ['org', 'hr', 'assignments', 'payroll']), section('investment', 'Đầu tư', 'trending-up', ['shareholders', 'projects', 'roi']), section('reports', 'Báo cáo', 'bar-chart', ['reports', 'reports-detail', 'cashbook'])],
    tpvh: [home('Công việc của tôi'), section('leasing', 'Vận hành', 'building', ['contracts', 'ocr', 'expiring', 'buildings', 'rooms', 'tenants', 'landlords', 'refunds']), section('collection', 'Tài chính vận hành', 'wallet', ['meters', 'invoices', 'receivables', 'deposits', 'expenses']), section('hr', 'Nhân sự', 'users', ['org', 'hr', 'assignments']), section('maintenance', 'Bảo trì & tài liệu', 'wrench', ['maintenance', 'tasks', 'documents'])],
    ops: [home('Công việc của tôi'), section('property', 'Phòng & tòa nhà', 'building', ['rooms', 'buildings', 'landlords']), section('leasing', 'Khách thuê & hợp đồng', 'file-text', ['tenants', 'contracts', 'ocr', 'expiring']), section('collection', 'Tài chính vận hành', 'wallet', ['meters', 'invoices', 'receivables', 'refunds', 'deposits', 'expenses']), section('hr', 'Phân công', 'users', ['assignments', 'org']), section('maintenance', 'Bảo trì & tài sản', 'wrench', ['maintenance', 'tasks', 'documents', 'assets', 'inventory']), section('sales-ops', 'Hỗ trợ kinh doanh', 'calendar-check', ['crm-overview', 'crm', 'viewings', 'holds'])],
    accountant: [home('Công việc của tôi'), section('finance', 'Tài chính', 'wallet', ['meters', 'invoices', 'billing-periods', 'receivables', 'deposits', 'refunds', 'expenses', 'bank']), section('data', 'Dữ liệu & đối soát', 'database', ['statement', 'opening', 'jobs', 'documents', 'inventory']), section('investment', 'Đầu tư', 'trending-up', ['shareholders', 'payroll']), section('reports', 'Báo cáo', 'bar-chart', ['reports', 'reports-detail', 'cashbook']), section('reference', 'Tra cứu', 'search', ['rooms', 'buildings', 'tenants', 'contracts', 'landlords', 'assignments', 'deals', 'maintenance'])],
    sale: [home('Công việc của tôi'), section('business', 'Kinh doanh', 'briefcase', ['crm-overview', 'crm', 'viewings', 'holds', 'deals']), section('reports', 'Báo cáo', 'bar-chart', ['reports-detail']), section('reference', 'Tra cứu', 'search', ['rooms', 'buildings', 'tenants', 'contracts'])],
    kythuat: [home('Công việc của tôi'), section('maintenance', 'Công việc kỹ thuật', 'wrench', [{ key: 'maintenance', label: 'Sự cố được giao', href: '#/maintenance?assignee=me' }, 'tasks']), section('reference', 'Tra cứu', 'search', ['rooms', 'buildings', 'assets', 'inventory', { key: 'expenses', label: 'Chi phí sự cố' }])],
    hr: [home('Công việc của tôi'), section('hr', 'Nhân sự', 'users', ['org', 'hr', 'assignments', 'payroll', 'timesheet']), section('reference', 'Tra cứu', 'search', ['buildings', 'rooms'])],
    codong: [home('Tổng quan đầu tư'), section('investment', 'Đầu tư', 'trending-up', ['projects', 'shareholders', 'roi'])],
  };
  const NAV = ROLE_NAV_LAYOUT;
  L.NAV_ITEMS = NAV_ITEMS; L.ROLE_NAV_LAYOUT = ROLE_NAV_LAYOUT;
  L.menuForRole = (role) => NAV[role || (TH.store.state && TH.auth.role && TH.auth.role()) || 'admin'] || NAV.admin;
  L.MENU = NAV.admin;
  const SIDEBAR_GROUP_KEY = 'timohouse.sidebar.openGroup';
  const SIDEBAR_COLLAPSED_KEY = 'timohouse.sidebar.collapsed';
  const validSidebarGroup = (key) => !!key && L.menuForRole().some(group => group.key === key && group.group);
  const readSidebarGroup = () => { try { const key = sessionStorage.getItem(SIDEBAR_GROUP_KEY); return validSidebarGroup(key) ? key : ''; } catch (e) { return ''; } };
  const saveSidebarGroup = (key) => { try { sessionStorage.setItem(SIDEBAR_GROUP_KEY, key || ''); } catch (e) { } };
  // Mục có phase: phase tắt → hiện như bản P1 (mờ, coming-soon, không lọc quyền trừ offPermission); phase bật → link thật, lọc quyền, giữ badge
  const phaseOn = (it) => !it.phase || (TH.phase && TH.phase.on(it.phase));
  const visibleItems = group => group.items.filter(it => phaseOn(it) && (!it.permission || TH.auth.can(it.permission)));
  const sidebarItem = (it) => `<a class="sb-item" data-key="${it.key}" href="${it.href}" aria-label="${esc(it.label)}" title="${esc(it.label)}">${I(it.icon)}<span>${esc(it.label)}</span>${it.phase ? `<span class="ptag on">P${it.phase}</span>` : ''}</a>`;
  const sidebarGroup = (group) => {
    const items = visibleItems(group); if (!items.length) return '';
    if (!group.group) return `<div class="sb-standalone">${items.map(sidebarItem).join('')}</div>`;
    const open = group.key === L._openGroup; const contentId = 'sb-group-' + group.key;
    return `<section class="sb-section ${open ? 'open' : ''}" data-sb-group="${group.key}"><button type="button" class="sb-group" data-act="sb-group" data-group="${group.key}" aria-label="${esc(group.group)}" title="${esc(group.group)}" aria-expanded="${open}" aria-controls="${contentId}"><span class="sb-group-icon">${I(group.icon)}</span><span>${esc(group.group)}</span><span class="sb-group-chevron">${I('chevron-down')}</span></button><div class="sb-children" id="${contentId}" aria-hidden="${!open}" ${open ? '' : 'inert'}><div class="sb-children-inner">${items.map(sidebarItem).join('')}</div></div></section>`;
  };
  const renderSidebar = () => { L.MENU = L.menuForRole(); if (!validSidebarGroup(L._openGroup)) L._openGroup = ''; const nav = document.querySelector('.sb-nav'); if (nav) nav.innerHTML = L.MENU.map(sidebarGroup).join(''); };
  L._openGroup = readSidebarGroup();
  L._activeMenuKey = null;
  L.setOpenGroup = (key, persist = true) => {
    const next = validSidebarGroup(key) ? key : '';
    L._openGroup = next;
    document.querySelectorAll('.sb-section').forEach(section => {
      const open = section.dataset.sbGroup === next; const button = section.querySelector('.sb-group'); const children = section.querySelector('.sb-children');
      section.classList.toggle('open', open); button && button.setAttribute('aria-expanded', String(open));
      if (children) { children.setAttribute('aria-hidden', String(!open)); children.toggleAttribute('inert', !open); }
    });
    if (persist) saveSidebarGroup(next);
  };
  L.P2_INFO = {
    maintenance: ['Bảo trì - Sửa chữa', 2, 'Ghi nhận sự cố theo tòa/phòng, phân công, mức ưu tiên, chi phí liên quan; lịch bảo dưỡng nhắc trước 7 ngày; checklist và evidence.', 'FR-MNT-01/03'],
    tasks: ['Lịch công việc', 2, 'Lịch việc cho NV vận hành/kỹ thuật, nhắc việc theo tòa.', 'FR-MNT-01'],
    cashbook: ['Thu chi', 2, 'Sổ thu chi tổng hợp, cashflow, operating result, khóa kỳ.', 'FR-FIN-08, FR-REP-02'],
    deposits: ['Quản lý cọc', 2, 'Sổ cọc khách thuê tách với cọc trả chủ nhà, đối chiếu số dư cọc.', 'FR-FIN-06/07'],
    bank: ['Ngân hàng', 3, 'Kết nối ngân hàng, đối soát tự động, QR payment, webhook thanh toán.', 'Phase 3 – Payment & Banking'],
    crm: ['Khách hàng (CRM Lead)', 2, 'Lead list/Kanban, nguồn khách, sale phụ trách, lịch sử chăm sóc, pipeline Mới → Chốt thuê.', 'FR-SAL-01'],
    channels: ['Kênh cho thuê', 2, 'Quản lý kênh đăng tin, đối tác môi giới, hiệu quả kênh.', 'FR-SAL-01/05', true],
    viewings: ['Lịch xem phòng', 2, 'Đặt lịch xem phòng, nhân viên phụ trách, nhắc lịch, kết quả xem.', 'FR-SAL-02'],
    marketing: ['Marketing', 2, 'Chiến dịch, chi phí marketing, đo hiệu quả theo nguồn.', 'FR-SAL-05', true],
    'crm-overview': ['Tổng quan kinh doanh', 2, 'KPI lead, lịch xem, giữ chỗ, chốt thuê và doanh số theo nhân viên.', 'FR-SAL-01/04'],
    holds: ['Giữ chỗ phòng', 2, 'Giữ chỗ có thời hạn tối đa 14 ngày, phí giữ chỗ trừ vào cọc, tự hết hạn.', 'FR-SAL-02 (OI-09)'],
    deals: ['Giao dịch & hoa hồng', 2, 'Chốt thuê từ lead, theo dõi doanh số và hoa hồng theo nhân viên (BR-13).', 'FR-SAL-03/04'],
    jobs: ['Nhập dữ liệu & tác vụ (Data Jobs)', 2, 'Theo dõi tác vụ import, tiến độ, kết quả từng dòng, thử lại phần lỗi.', 'Phase 2 §3.4'],
    opening: ['Chuyển số dư ban đầu', 2, 'Đối chiếu công nợ/cọc từ hệ thống cũ, xác nhận chuyển số dư.', 'FR-FIN-09'],
    p2: ['Màn hình Phase 2', 2, 'Route này thuộc Phase 2 – bật phase để xem.', ''],
    p3: ['Màn hình Phase 3', 3, 'Route này thuộc Phase 3 – bật phase để xem.', ''],
    inventory: ['Kiểm kê tài sản', 3, 'Đợt kiểm kê hàng tháng theo tòa, ghi kết quả/bằng chứng, biên bản kiểm kê (Admin/Kế toán phụ trách).', 'FR-MNT-02'],
    shareholders: ['Cổ đông, vốn góp & phân phối', 1, 'Danh sách cổ đông, cổ phần theo tòa, đợt góp vốn, bảng phân phối lợi nhuận (spec v1.8 §4.29–4.32).', 'Phase 1'],
    hr: ['Nhân viên', 1, 'Hồ sơ nhân viên, đơn vị tổ chức, chức danh, phân công tòa (spec v1.8 §4.24).', 'Phase 1'],
    timesheet: ['Chấm công', 3, 'Chấm công nếu cần, liên kết bảng lương.', 'FR-HR-02'],
    payroll: ['Bảng lương', 1, 'Hiệu suất thu tiền M1/M2/M3 theo tòa → Payroll Rule → bảng lương → chi lương (spec v1.8 §4.26).', 'Phase 1'],
    projects: ['Dự án', 3, 'Danh mục dự án đầu tư, cổ đông, vốn góp.', 'FR-SHR-01/02'],
    assets: ['Tài sản', 3, 'Danh mục tài sản theo phòng/tòa, QR, kiểm kê hàng tháng, khấu hao.', 'FR-BLD-04, FR-MNT-02'],
    roi: ['Hiệu quả đầu tư', 3, 'Hiệu suất, lợi nhuận theo tòa, phân phối cổ đông – công thức TBD (OI-10/12/13/17).', 'FR-REP-01/02, FR-SHR-02'],
    'reports-detail': ['Trung tâm báo cáo', 2, 'Tạo báo cáo theo loại (48 loại) và kỳ, lưu bản ghi snapshot, xem trước và tải CSV.', 'FR-REP-07–11'],
    system: ['Thiết lập hệ thống', 2, 'Thông số hệ thống, múi giờ, làm tròn, chính sách lưu trữ (OI-24).', 'NFR', true],
    ocr: ['Trích xuất hợp đồng (OCR)', 1, 'Upload PDF/JPG → review theo nhóm entity → Create/Link/Update/Ignore → commit (spec v1.8 §12.8).', 'Phase 1'],
    statement: ['Import bảng kê thu tiền', 2, 'Mapping, auto-match hóa đơn, review, Data Jobs, retry dòng lỗi.', 'Phase 2 §3.4'],
    'refund-workflow': ['Duyệt hoàn cọc nhiều cấp', 2, 'Workflow duyệt nhiều cấp theo ngưỡng số tiền.', 'FR-FIN-07 (OI-07)'],
    'zalo-advanced': ['Notification nâng cao', 2, 'Rule Builder, template management, provider response, fallback SMS, hội thoại 2 chiều.', 'FR-ZAL-04/05/06'],
  };
  const switchDemoRole = role => {
    try { TH.auth.switchRole(role); L.refreshTop(); TH.router.refresh(); U.toast('ok', role === 'admin' ? 'Đã quay lại Admin' : 'Đã chuyển vai trò', TH.auth.ROLE_LABEL[role] + ' – ' + TH.store.state.session.name); }
    catch (e) { U.toast('err', 'Không thể chuyển vai trò', e.message); }
  };
  const openUserMenu = el => {
    const s = TH.store.state.session, items = [];
    if (s.role === 'admin' || s.impersonator) {
      items.push({ header: s.impersonator ? 'Admin đang xem theo vai trò' : 'Chuyển vai trò (Admin demo)' });
      ['admin', 'qltong', 'tpvh', 'accountant', 'ops', 'hr', ...(TH.phase && TH.phase.on(2) ? ['sale', 'kythuat'] : []), ...(TH.phase && TH.phase.on(3) ? ['codong'] : [])].forEach(role => items.push({ label: role === 'admin' && s.impersonator ? 'Quay lại Admin' : (s.role === role ? '● ' : '○ ') + TH.auth.ROLE_LABEL[role], icon: role === 'admin' && s.impersonator ? 'corner-up-left' : 'user', onClick: () => switchDemoRole(role) }));
      items.push('-');
    }
    if (TH.auth.can('users.manage')) items.push({ label: 'Quản lý tài khoản', icon: 'user-check', onClick: () => TH.go('#/settings/users') });
    items.push({ label: 'Đăng xuất', icon: 'log-out', danger: true, onClick: () => { TH.auth.logout(); TH.go('#/login'); } });
    U.menu(el, items);
  };
  const setSidebarCollapsed = (collapsed) => {
    document.body.classList.toggle('sb-collapsed', !!collapsed);
    try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0'); } catch (e) { }
    const btn = document.querySelector('[data-act=sb-collapse]');
    if (btn) { btn.setAttribute('aria-label', collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'); btn.innerHTML = I(collapsed ? 'chevron-right' : 'arrow-left'); }
  };
  L.openCollapsedFlyout = (anchor) => {
    document.querySelectorAll('.sb-flyout').forEach(x => x.remove());
    const group = L.menuForRole().find(g => g.key === anchor.dataset.group); if (!group) return;
    const flyout = U.el(`<div class="sb-flyout" role="menu"><div class="sb-flyout-title">${I(group.icon)} ${esc(group.group)}</div>${visibleItems(group).map(it => `<a role="menuitem" href="${it.href}" data-key="${it.key}">${I(it.icon)}<span>${esc(it.label)}</span>${it.phase ? `<em>P${it.phase}</em>` : ''}</a>`).join('')}</div>`);
    document.body.appendChild(flyout); const r = anchor.getBoundingClientRect(); flyout.style.left = (r.right + 8) + 'px'; flyout.style.top = Math.min(r.top, window.innerHeight - flyout.offsetHeight - 12) + 'px';
    const close = (e) => { if (e && (flyout.contains(e.target) || anchor.contains(e.target))) return; flyout.remove(); document.removeEventListener('pointerdown', close, true); window.removeEventListener('scroll', close, true); };
    setTimeout(() => { document.addEventListener('pointerdown', close, true); window.addEventListener('scroll', close, true); }, 0); flyout.querySelector('a')?.focus();
  };
  const launcherApps = () => [
    { label: 'Kinh doanh', text: 'CRM, lịch xem, giữ chỗ và giao dịch', icon: 'briefcase', href: '#/crm', permission: 'crm.view', phase: 2 },
    { label: 'OCR hợp đồng', text: 'Trích xuất và review hợp đồng', icon: 'file-check', href: '#/contracts/ocr', permission: 'ocr.use' },
    { label: 'Nhân sự', text: 'Tổ chức, nhân viên, phân công, lương', icon: 'users', href: '#/hr', permission: 'hr.view' },
    { label: 'Bảng lương', text: 'Bảng lương và phê duyệt', icon: 'banknote', href: '#/hr/payroll', permission: 'payroll.view' },
    { label: 'Đầu tư', text: 'Cổ đông, cổ phần, góp vốn, phân phối', icon: 'trending-up', href: '#/investment/shareholders', permission: 'shareholders.view' },
    { label: 'Tài sản', text: 'Tài sản và kiểm kê', icon: 'package', href: '#/assets', permission: 'assets.view', phase: 3 },
    { label: 'Tài liệu', text: 'Tra cứu hồ sơ vận hành và pháp lý', icon: 'folder', href: '#/documents', permission: 'documents.view' },
    { label: 'Lịch sử gửi Zalo', text: 'Theo dõi trạng thái và gửi lại', icon: 'send', href: '#/zalo/history', permission: 'zalo.view' },
    { label: 'Thông báo & nhắc việc', text: 'Cấu hình Zalo và mẫu nhắc việc', icon: 'sliders', href: '#/zalo/config', permission: 'zalo.config' },
    { label: 'Nhập bảng kê thu tiền', text: 'Nạp và ghép bảng kê thu tiền', icon: 'file-spreadsheet', href: '#/finance/statement-import', permission: 'statement.import', phase: 2 },
    { label: 'Số dư ban đầu', text: 'Chuyển số dư từ hệ thống cũ', icon: 'layers', href: '#/finance/opening-balance', permission: 'openingBalance.manage', phase: 2 },
    { label: 'Tác vụ dữ liệu', text: 'Theo dõi import và xử lý dữ liệu', icon: 'database', href: '#/settings/jobs', permission: 'dataJobs.view', phase: 2 },
    { label: 'Tài khoản & phân quyền', text: 'Người dùng và phân quyền', icon: 'shield', href: '#/settings/users', permission: 'users.manage' },
    { label: 'Danh mục', text: 'Dịch vụ và dữ liệu dùng chung', icon: 'sliders', href: '#/settings/catalog', permission: 'catalog.view' },
    { label: 'Master Data', text: 'Loại tòa, loại phòng, trạng thái khách, vai trò phân công…', icon: 'database', href: '#/settings/catalog?tab=master', permission: 'masterData.view' },
    { label: 'Import dữ liệu', text: 'Nhập dữ liệu nghiệp vụ', icon: 'upload', href: '#/settings/import', permission: 'import.view' },
    { label: 'Công cụ hệ thống', text: 'Phạm vi demo và dữ liệu kỹ thuật', icon: 'settings', href: '#/settings/tools', permission: 'advancedTools' },
  ];
  L.availableLauncherApps = () => {
    const sidebarHrefs = new Set(L.menuForRole().flatMap(group => visibleItems(group).map(item => item.href)));
    return launcherApps().filter(app => (!app.roles || app.roles.includes(TH.auth.role())) && (!app.permission || TH.auth.can(app.permission)) && !sidebarHrefs.has(app.href));
  };
  L.launcher = () => {
    const apps = L.availableLauncherApps();
    const m = U.modal({ title: 'Phân hệ & Quản trị', sub: 'Truy cập các phân hệ nghiệp vụ và thiết lập quản trị hệ thống.', size: 'lg', body: `<div class="app-launcher-grid">${apps.map((a, i) => { const off = a.phase && !TH.phase.on(a.phase); return `<button type="button" class="app-tile ${off ? 'is-teaser' : ''}" data-act="launch-app" data-i="${i}"><span class="app-tile-icon">${I(a.icon)}</span><span><b>${esc(a.label)}</b><small>${esc(a.text)}</small></span>${off ? `<em>P${a.phase} · Chưa bật</em>` : I('chevron-right')}</button>`; }).join('')}</div>` });
    U.bind(m.el, { 'launch-app': (el) => { const a = apps[Number(el.dataset.i)]; if (a.phase && !TH.phase.on(a.phase)) return U.toast('info', a.label + ' thuộc Phase ' + a.phase, 'Admin có thể bật phạm vi tại Công cụ hệ thống.'); m.close(); TH.go(a.href); } });
  };
  L.quickCreate = (el) => {
    const options = [
      { label: 'Tạo hợp đồng', icon: 'file-plus', permission: 'contracts.manage', href: '#/contracts/new' },
      { label: 'Lập hóa đơn', icon: 'receipt', permission: 'invoices.prepare', href: '#/invoices/batch' },
      { label: 'Ghi nhận thu tiền', icon: 'wallet', permission: 'payments.record', href: '#/receivables?create=payment' },
      { label: 'Thêm khách hàng tiềm năng', icon: 'user-plus', permission: 'crm.manage', phase: 2, href: '#/crm/leads?create=1' },
      { label: 'Tạo sự cố', icon: 'wrench', permission: 'maintenance.manage', phase: 2, href: '#/maintenance?create=1' },
    ].filter(x => TH.auth.can(x.permission) && (!x.phase || TH.phase.on(x.phase)));
    U.menu(el, options.length ? options.map(x => ({ label: x.label, icon: x.icon, onClick: () => TH.go(x.href) })) : [{ label: 'Không có thao tác tạo nhanh', icon: 'info', disabled: true }]);
  };
  L.ensure = (app) => {
    if (app.querySelector('.app')) { L.refreshTop(); return; }
    try { document.body.classList.toggle('sb-collapsed', localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'); } catch (e) { }
    app.innerHTML = `<div class="app"><div class="sb-backdrop" data-act="sb-close"></div><aside class="sidebar"><div class="sb-logo"><div class="mark">${I('home')}</div><div class="sb-brand"><div class="name">Timo<span>House</span></div><div class="tag">Quản lý nhà cho thuê</div></div><button type="button" class="sb-collapse" data-act="sb-collapse" aria-label="Thu gọn thanh điều hướng">${I('arrow-left')}</button></div><nav class="sb-nav" data-guide="sidebar">${L.MENU.map(sidebarGroup).join('')}</nav><div class="sb-foot"><div class="sb-meta"><div id="sb-version">Phiên bản 3.0.0 · P1</div><div>TimoHouse © 2026</div></div></div></aside><div class="main"><header class="topbar"><button class="tb-menu-btn" data-act="sb-toggle" aria-label="Menu">${I('menu')}</button><div class="crumbs" id="crumbs"></div><div class="tb-search" data-act="palette">${I('search')}<input placeholder="Tìm phòng, khách thuê, hợp đồng..." readonly><span class="kbd">Ctrl K</span></div><label class="tb-period" id="tb-period" hidden title="Kỳ báo cáo dùng chung cho các màn theo kỳ"><span>Kỳ</span><select data-on="tb-period"></select></label><button class="tb-quick btn btn-primary btn-sm" data-act="quick-create">${I('plus')}<span>Tạo mới</span>${I('chevron-down')}</button><button class="tb-icon" data-act="app-launcher" aria-label="Mở Phân hệ & Quản trị" data-tip="Phân hệ & Quản trị">${I('grid')}</button><button class="tb-icon" data-act="guide" data-guide="guide-btn" aria-label="Hướng dẫn thao tác" data-tip="Hướng dẫn">${I('book-open')}</button><button class="tb-bell" data-act="bell" aria-label="Thông báo">${I('bell')}<span class="badge" id="bell-badge">0</span></button><div class="tb-user" data-act="user-menu"><div class="avatar" id="tb-avatar"></div><div><div class="nm" id="tb-name"></div><div class="rl" id="tb-role"></div></div>${I('chevron-down')}</div></header><main class="content" id="content"></main></div></div>`;
    if (!app.dataset.bound) { app.dataset.bound = '1';
    U.bind(app, {
      'sb-toggle': () => document.body.classList.toggle('sb-open'), 'sb-close': () => document.body.classList.remove('sb-open'),
      'sb-collapse': () => setSidebarCollapsed(!document.body.classList.contains('sb-collapsed')),
      'sb-group': (el) => document.body.classList.contains('sb-collapsed') && window.innerWidth > 760 ? L.openCollapsedFlyout(el) : L.setOpenGroup(el.dataset.group === L._openGroup ? '' : el.dataset.group),
      palette: () => L.palette(), guide: () => TH.guide && TH.guide.toggle(), 'app-launcher': () => L.launcher(), 'quick-create': (el) => L.quickCreate(el),
      bell: (el) => { const t = Q.todo(); U.menu(el, [{ header: 'Việc cần xử lý' }, ...(TH.auth.can('contracts.view') ? [{ label: `Hợp đồng sắp hết hạn (${t.expiring})`, icon: 'file-text', onClick: () => TH.go('#/contracts?status=expiring') }] : []), ...(TH.auth.can('payments.view') ? [{ label: `Hóa đơn quá hạn (${t.overdue})`, icon: 'receipt', onClick: () => TH.go('#/receivables?overdue=1&period=all') }] : []), ...(TH.auth.can('zalo.view') ? [{ label: `Tin Zalo gửi lỗi (${t.zaloFailed} tin · ${t.zaloFailedBatches} đợt)`, icon: 'send', onClick: () => TH.go('#/zalo/history?hasFailed=1') }] : []), ...(TH.auth.can('refunds.view') ? [{ label: `Hoàn cọc đang xử lý (${t.refunds})`, icon: 'hand-coins', onClick: () => TH.go('#/refunds?status=processing') }] : []), ...(TH.auth.can('invoices.prepare') ? [{ label: `Hóa đơn nháp chờ phát hành (${t.drafts})`, icon: 'file-plus', onClick: () => TH.go('#/invoices?doc=draft&period=all') }] : []), ...(TH.auth.can('landlordPayments.manage') ? [{ label: `Kỳ trả chủ nhà đến hạn 7 ngày (${t.landlordDue || 0})`, icon: 'banknote', onClick: () => TH.go('#/landlords?upcoming=1') }] : []), ...(TH.phase && TH.phase.on(2) && TH.auth.can('maintenance.view') ? [{ label: `Lịch bảo dưỡng sắp đến hạn 7 ngày (${t.maintenanceDue || 0})`, icon: 'wrench', onClick: () => TH.go('#/maintenance/schedules?status=due_soon') }] : []), ...(TH.phase && TH.phase.on(2) && TH.auth.can('crm.view') ? [{ label: `Lịch xem phòng hôm nay (${t.viewingsToday || 0})`, icon: 'calendar-check', onClick: () => TH.go('#/crm/viewings?status=scheduled') }] : []), ...(TH.phase && TH.phase.on(3) && TH.auth.can('inventory.view') ? [{ label: `Tài sản cần xử lý sau kiểm kê (${t.inventoryPending || 0})`, icon: 'package', onClick: () => TH.go('#/assets/inventory?status=needs_action') }] : []), ...(TH.phase && TH.phase.on(3) && TH.auth.can('shareholders.view') ? [{ label: `Đợt góp vốn đến hạn (${t.contributionsDue || 0})`, icon: 'hand-coins', onClick: () => TH.go('#/investment/shareholders?tab=contributions&status=due') }] : []), ...(TH.phase && TH.phase.on(3) && TH.auth.can('hr.view') ? [{ label: `Nhân viên sắp hết thử việc (${t.probationEnding || 0})`, icon: 'user-plus', onClick: () => TH.go('#/hr?status=probation') }] : [])]); },
      'user-menu': openUserMenu,
      'adv-reset': async () => { if (await U.confirm({ title: 'Đặt lại dữ liệu demo?', text: 'Toàn bộ dữ liệu nghiệp vụ sẽ quay về bộ seed ban đầu. Tiến độ hướng dẫn được giữ.', ok: 'Đặt lại', danger: true })) { const g = TH.store.state.guide; TH.store.reset(true); TH.store.state.guide = g; TH.store.saveNow(); TH.auth.login('admin', 'demo'); TH.go('#/dashboard'); TH.router.refresh(); U.toast('ok', 'Đã đặt lại dữ liệu demo'); } },
      'adv-clear': async () => { if (await U.confirm({ title: 'Xóa trắng dữ liệu nghiệp vụ?', text: 'Chỉ giữ tài khoản, danh mục dịch vụ và cấu hình Zalo. Dùng để demo từ trạng thái rỗng theo spec v1.5.', ok: 'Xóa trắng', danger: true })) { TH.store.clearBusiness(); TH.go('#/dashboard'); TH.router.refresh(); U.toast('ok', 'Đã xóa trắng dữ liệu nghiệp vụ'); } },
      'adv-today': () => { const m = U.modal({ title: 'Đổi ngày hệ thống demo', size: 'sm', body: U.field({ label: 'Ngày "hôm nay" của demo', input: U.date({ name: 'today', value: F.today() }), help: 'Mặc định 28/10/2026 để khớp số liệu mockup. Ảnh hưởng tính quá hạn, sắp hết hạn, còn lại N ngày.' }), footer: U.btn({ label: 'Hủy', act: 'close2' }) + U.btn({ label: 'Áp dụng', act: 'ok', cls: 'btn-primary' }) }); U.bind(m.el, { ok: () => { TH.actions.setToday(m.data().today); m.close(); TH.router.refresh(); }, close2: () => m.close() }); },
      'adv-export': () => { F.download('timehouse-demo-state.json', TH.store.exportJSON(), 'application/json'); U.toast('ok', 'Đã xuất state JSON'); },
      'adv-import': () => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json'; inp.onchange = () => { const f = inp.files[0]; const rd = new FileReader(); rd.onload = () => { try { TH.store.importJSON(rd.result); TH.router.refresh(); U.toast('ok', 'Đã nhập state'); } catch (e) { U.toast('err', 'Không nhập được', e.message); } }; rd.readAsText(f); }; inp.click(); },
      'adv-runall': async () => { if (await U.confirm({ title: 'Chạy toàn bộ kịch bản Go-live?', text: 'Hệ thống tự thực hiện 16 bước (tạo khách → HĐ → điện nước → hóa đơn → Zalo → thu tiền → nhắc nợ → kết thúc HĐ → hoàn cọc → dọn phòng) trên dữ liệu hiện có. Chỉ dùng để kiểm tra kỹ thuật.', ok: 'Chạy' })) { try { const r = await TH.guide.runAll(); U.toast('ok', 'Đã chạy xong kịch bản', r); TH.router.refresh(); } catch (e) { U.toast('err', 'Kịch bản dừng', e.message); TH.router.refresh(); } } },
      'adv-guide-reset': () => { TH.guide.resetProgress(); U.toast('ok', 'Đã reset tiến độ hướng dẫn', 'Dữ liệu nghiệp vụ được giữ nguyên'); },
      'adv-runall-p3': async () => { if (await U.confirm({ title: 'Chạy kịch bản Phase 3?', text: 'Hệ thống tự thực hiện các luồng F16–F19 (kiểm kê tài sản; nhân sự → phân công → chấm công → lương; cổ đông → góp vốn → phân phối; sao kê ngân hàng → đối soát) trên dữ liệu hiện có. Chỉ dùng để kiểm tra kỹ thuật.', ok: 'Chạy' })) { try { const r = await TH.guide.runAllP3(); U.toast('ok', 'Đã chạy xong kịch bản Phase 3', r, 6000); TH.router.refresh(); } catch (e) { U.toast('err', 'Kịch bản dừng', e.message); TH.router.refresh(); } } },
      'adv-runall-p2': async () => { if (await U.confirm({ title: 'Chạy kịch bản Phase 2?', text: 'Hệ thống tự thực hiện các luồng F11–F15 (lead → giữ chỗ → chốt thuê → HĐ → hoa hồng; OCR; bảng kê & Data Job; sự cố & bảo dưỡng; báo cáo/khóa kỳ/Zalo retry) trên dữ liệu hiện có. Chỉ dùng để kiểm tra kỹ thuật.', ok: 'Chạy' })) { try { const r = await TH.guide.runAllP2(); U.toast('ok', 'Đã chạy xong kịch bản Phase 2', r, 6000); TH.router.refresh(); } catch (e) { U.toast('err', 'Kịch bản dừng', e.message); TH.router.refresh(); } } },
    });
    U.onChange(app, { 'tb-period': (el) => { const cur = TH.store.state.meta.period; if (!el.value || el.value === cur) return; TH.router.applyFilter(Object.assign({}, (TH.router.current || {}).query || {}, { period: cur }), { period: el.value }); }, 'phase-2': (el) => L.togglePhase(2, el.checked), 'phase-3': (el) => L.togglePhase(3, el.checked), 'demo-notes': (el) => { const m = TH.store.state.meta; m.uiPrefs = m.uiPrefs || {}; m.uiPrefs.demoNotes = !!el.checked; TH.store.save(); U.toast('ok', el.checked ? 'Đã hiện chú thích demo/BA' : 'Đã ẩn chú thích demo/BA'); TH.router.refresh(); } });
    document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); L.palette(); } });
    }
    L.refreshTop();
  };
  /* Pill Kỳ ở topbar (spec 4.4): chỉ hiện với màn có bộ lọc kỳ trong trang; đổi kỳ → meta.period + applyFilter (đồng bộ mọi màn theo kỳ) */
  L.syncPeriod = () => {
    const wrap = document.getElementById('tb-period'); if (!wrap) return; const sel = wrap.querySelector('select');
    const src = document.querySelector('#content .filterbar select[name="period"], #content select[name="period"]');
    if (!src || !TH.store.state.session) { wrap.hidden = true; return; }
    const cur = TH.store.state.meta.period; const opts = [...src.options].filter(o => o.value && o.value !== 'all').map(o => [o.value, o.textContent]);
    if (!opts.some(o => o[0] === cur)) opts.unshift([cur, F.periodLabel(cur)]);
    sel.innerHTML = opts.map(([v, l]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(l)}</option>`).join('');
    wrap.hidden = false;
  };
  L.refreshTop = () => {
    const s = TH.store.state.session; if (!s) return; const u = TH.auth.user() || {};
    renderSidebar();
    const av = document.getElementById('tb-avatar'); if (av) { av.textContent = F.initials(u.name); }
    const nm = document.getElementById('tb-name'); if (nm) nm.textContent = u.name || ''; const rl = document.getElementById('tb-role'); if (rl) rl.textContent = (TH.auth.ROLE_LABEL[u.role] || '') + (s.impersonator ? ' · Đang giả lập' : '');
    const badge = document.getElementById('bell-badge'); if (badge) { const t = Q.todo(); badge.textContent = t.total > 99 ? '99+' : t.total; badge.hidden = !t.total; }
    const ver = document.getElementById('sb-version'); if (ver && TH.phase) ver.textContent = 'Phiên bản 3.0.0 · Phạm vi: ' + TH.phase.label();
    const rp2 = document.getElementById('adv-runall-p2'); if (rp2) rp2.hidden = !(TH.phase && TH.phase.on(2));
    const rp3 = document.getElementById('adv-runall-p3'); if (rp3) rp3.hidden = !(TH.phase && TH.phase.on(3));
    if (L._activeMenuKey) L.setActive(L._activeMenuKey);
  };
  L.setActive = (key) => {
    let active = null;
    document.querySelectorAll('.sb-item').forEach(item => { const on = item.dataset.key === key; item.classList.toggle('active', on); if (on) active = item; });
    const owner = active && active.closest('.sb-section');
    if (owner && L._activeMenuKey !== key) L.setOpenGroup(owner.dataset.sbGroup);
    L._activeMenuKey = key;
  };
  L.setBreadcrumb = (items) => { const c = document.getElementById('crumbs'); if (!c) return; c.innerHTML = `<a href="#/dashboard" title="Tổng quan">${I('home')}</a>` + items.map((it, i) => `<span class="sep">/</span>${i === items.length - 1 ? `<span class="cur">${esc(it.label)}</span>` : `<a class="hide-m" href="${it.href || '#'}">${esc(it.label)}</a>`}`).join(''); document.title = (items.length ? items[items.length - 1].label + ' – ' : '') + 'TimoHouse'; };
  L.palette = () => {
    if (document.querySelector('.cmdk')) return;
    const box = U.el(`<div class="cmdk"><div class="box"><input placeholder="Tìm phòng, khách thuê, hợp đồng, hóa đơn, tòa nhà… (Esc để đóng)"><div class="res"></div></div></div>`);
    document.body.appendChild(box); const inp = box.querySelector('input'), res = box.querySelector('.res'); inp.focus();
    const go = (r) => { box.remove(); TH.go(r); };
    const render = () => { const items = Q.search(inp.value); res.innerHTML = items.length ? items.map((it, i) => `<button type="button" data-i="${i}" class="${i === 0 ? 'on' : ''}">${I({ 'Phòng': 'door', 'Khách thuê': 'user', 'Hợp đồng': 'file-text', 'Hóa đơn': 'receipt', 'Tòa nhà': 'building' }[it.type])}<span><b>${esc(it.label)}</b> <span class="muted small">${esc(it.sub || '')}</span></span><span class="k">${it.type}</span></button>`).join('') : `<div class="empty small">${inp.value ? 'Không tìm thấy kết quả' : 'Gõ mã phòng (A.12.03), tên khách, mã HĐ/hóa đơn…'}</div>`; res._items = items; };
    inp.addEventListener('input', render); render();
    inp.addEventListener('keydown', (e) => { if (e.key === 'Escape') box.remove(); if (e.key === 'Enter' && res._items[0]) go(res._items[0].route); });
    res.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) go(res._items[Number(b.dataset.i)].route); });
    box.addEventListener('click', (e) => { if (e.target === box) box.remove(); });
  };
  /* Công tắc phase: bật/tắt → toast; tắt phase n khi đang là vai trò của phase đó → về Admin; route tự thành coming-soon (router guard, giữ URL) */
  const PHASE_TOAST = { 2: '18 màn CRM / Tài chính / Bảo trì / Báo cáo / Data Job đã mở · thêm vai trò Sale, Kỹ thuật', 3: 'Sổ tài sản & kiểm kê / Chấm công / Dự án / ROI / Ngân hàng đã mở · thêm vai trò Cổ đông' };
  const PHASE_OFF = { 2: 'Trở về kịch bản Go-live Phase 1 – dữ liệu P2 vẫn được giữ', 3: 'Các màn Phase 3 về coming-soon – dữ liệu P3 vẫn được giữ' };
  L.togglePhase = (n, on) => {
    try {
      if (!!TH.phase.state[n] === !!on) return;
      if (!on && (TH.phase.ROLES[n] || []).includes(TH.auth.role())) { const s = TH.store.state.session; if (s && s.impersonator) TH.auth.endImpersonation(); else { const admin = TH.store.rawAll('users').find(u => u.username === 'admin' && u.status === 'active'); if (admin) { TH.store.state.session = { userId: admin.id, name: admin.name, role: 'admin', at: F.nowISO() }; TH.store.saveNow(); } else TH.auth.logout(); } U.toast('info', 'Đã chuyển về Admin', 'Vai trò ' + (TH.phase.ROLES[n] || []).map(r => TH.auth.ROLE_LABEL[r]).join(' / ') + ' chỉ khả dụng khi Phase ' + n + ' bật'); }
      TH.phase.set(n, on);
      if (on) U.toast('ok', 'Đã bật ' + TH.phase.info(n).label, PHASE_TOAST[n] || TH.phase.info(n).name, 5000);
      else U.toast('ok', 'Đã tắt ' + TH.phase.info(n).label, PHASE_OFF[n] || '');
    } catch (e) { U.toast('err', 'Không đổi được phạm vi demo', e.message); L.refreshTop(); }
  };
  TH.layout = L;
})(window.TH);
