/* Domain – ma trận quyền Phase 1 + Phase 2 + Phase 3 (đặc tả §1.1, CH-01/CH-23, GĐ OQ-09). Thuần: dùng chung cho web và scripts/check-rbac.mjs.
   Phase 2 thêm vai trò sale (chỉ lead/deal của mình, CH-01 không thấy hoa hồng) và kỹ thuật (nhập sổ sửa chữa, không thấy tiền thu).
   Phase 3 thêm vai trò cổ đông (đặc tả dòng 69-71, CH-23): chỉ xem báo cáo / bảng kê / góp vốn của các tòa mình góp vốn, không thấy khách, lương chi tiết, tòa khác. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const ROLES = {
    admin: { label: 'Quản trị hệ thống', scope: 'all' },
    ketoan: { label: 'Kế toán', scope: 'all' },
    vanhanh: { label: 'Quản lý / Vận hành', scope: 'assigned' },
    leader: { label: 'Trưởng nhóm (leader)', scope: 'branch' },
    truongphong: { label: 'Trưởng phòng', scope: 'branch', sales: 'all' }, // D4 [GĐ]: TPVH xem kinh doanh toàn bộ, chỉ xem
    truongkd: { label: 'Trưởng nhóm kinh doanh', scope: 'all', sales: 'branch', phase: '2' },
    sale: { label: 'Nhân viên kinh doanh (sale)', scope: 'all', sales: 'own', phase: '2' },
    kythuat: { label: 'Kỹ thuật / thợ sửa chữa', scope: 'all', phase: '2' },
    codong: { label: 'Cổ đông (chỉ xem)', scope: 'shareholder', phase: '3' }, // phạm vi = tòa có tỷ lệ góp hiệu lực (auth.buildingScope)
  };
  const ALL = Object.keys(ROLES);
  const STAFF = ALL.filter(r => r !== 'codong');
  const FIN = ['admin', 'ketoan'];
  const OPS = ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong'];
  const POLICY = {
    'dashboard.view': ALL,
    'dashboard.money': ['admin', 'ketoan', 'truongphong'],
    'buildings.view': STAFF, 'buildings.manage': ['admin'], 'rooms.status': ['admin', 'ketoan', 'vanhanh'],
    'owners.view': FIN, 'owners.manage': ['admin'], 'ownerPayments.view': FIN, 'ownerPayments.record': FIN,
    'tenants.view': OPS, 'tenants.manage': FIN, 'stays.end': ['admin', 'ketoan', 'vanhanh'], 'stays.transfer': FIN,
    'customers.pii': FIN,
    'rates.view': ['admin', 'ketoan', 'vanhanh'], 'rates.manage': FIN,
    'readings.view': ['admin', 'ketoan', 'vanhanh'], 'readings.manage': ['admin', 'ketoan', 'vanhanh'],
    'invoices.view': ['admin', 'ketoan', 'vanhanh'], 'invoices.prepare': FIN, 'invoices.issue': FIN, 'invoices.adjust': FIN,
    'payments.view': FIN, 'payments.record': FIN, 'payments.reverse': FIN,
    'debts.viewStatus': OPS, 'debts.viewAmounts': FIN,
    'refunds.view': ['admin', 'ketoan', 'vanhanh'], 'refunds.prepare': ['admin', 'ketoan', 'vanhanh'],
    'refunds.approve.admin': ['admin'], 'refunds.approve.ketoan': ['ketoan'], 'refunds.pay': FIN,
    'expenses.view': FIN, 'expenses.manage': FIN,
    'allocation.view': FIN, 'allocation.manage': FIN,
    'hr.view': ['admin', 'ketoan', 'leader', 'truongphong'], 'hr.manage': ['admin'], 'hr.salary': FIN,
    'payroll.view': FIN, 'payroll.manage': FIN,
    'reports.view': ['admin', 'ketoan', 'truongphong', 'codong'], 'reports.export': FIN,
    'zalo.view': FIN, 'zalo.send': FIN, 'zalo.config': ['admin'],
    'import.view': FIN, 'import.master': ['admin'], 'import.finance': FIN,
    'settings.view': FIN, 'settings.manage': ['admin'], 'periods.close': FIN, 'periods.unlock': ['admin'],
    /* --- Phase 2 --- */
    // Kinh doanh: trưởng nhóm KD (nhánh sale) thay cho leader vận hành (TNVH không thấy nhóm Kinh doanh – B21)
    'sales.view': ['admin', 'ketoan', 'truongkd', 'truongphong', 'sale'], 'sales.manage': ['admin', 'truongkd', 'sale'],
    'deals.close': ['admin', 'truongkd', 'sale'], 'deals.cancel': ['admin', 'ketoan', 'truongkd'], 'customers.phone': ['admin', 'ketoan', 'truongkd', 'truongphong', 'sale'],
    'commission.view': FIN, 'commission.approve': FIN, 'commission.pay': FIN, 'commission.policy': ['admin'],
    'repairs.view': ['admin', 'ketoan', 'vanhanh', 'truongphong', 'kythuat'], 'repairs.enter': ['admin', 'ketoan', 'kythuat'], 'repairs.confirm': FIN, 'repairs.money': ['admin', 'ketoan', 'truongphong'],
    'reports.ops': ['admin', 'ketoan', 'truongphong'],
    'shares.view': ['admin', 'ketoan', 'codong'], 'shares.manage': FIN, 'shares.lock': FIN,
    'documents.view': ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong'], 'documents.upload': ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong'],
    'documents.download': ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong', 'truongkd', 'sale', 'kythuat', 'codong'], // E1 [GĐ-E1]: sale/kỹ thuật tải trong phạm vi hẹp (Q.canDownloadDoc), không mở kho
    'ocr.review': OPS, // rà soát trường; "Áp dụng vào biểu phí" cần rates.manage (FIN)
    'zalo.inbox': ['admin', 'ketoan', 'truongphong'],
    'periods.reopen.admin': ['admin'], 'periods.reopen.ketoan': ['ketoan'],
    /* --- Phase 3 --- */
    // UI-34 tài sản: xem theo phạm vi tòa; giá trị (nguyên giá / còn lại) chỉ admin, kế toán, trưởng phòng; thêm / chuyển / thanh lý = kế toán, admin
    'assets.view': ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong', 'kythuat'], 'assets.value': ['admin', 'ketoan', 'truongphong'], 'assets.manage': FIN, 'assets.dispose': FIN,
    // UI-35 bảo dưỡng: leader theo dõi việc theo nhánh (F11); kỹ thuật / vận hành đánh dấu đã thực hiện
    'maintenance.view': ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong', 'kythuat'], 'maintenance.plan': ['admin', 'ketoan', 'leader', 'truongphong'], 'maintenance.done': ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong', 'kythuat'],
    // UI-36 kiểm kê: admin và kế toán nhập và duyệt (CH-33) – duyệt kép, mỗi vai trò một quyền
    'inventory.view': ['admin', 'ketoan', 'truongphong'], 'inventory.enter': FIN, 'inventory.approve.admin': ['admin'], 'inventory.approve.ketoan': ['ketoan'],
    // UI-33 góp vốn / chi thực: cổ đông chỉ xem dòng của mình
    'capital.view': ['admin', 'ketoan', 'codong'], 'capital.manage': FIN,
    // UI-40 dự kiến lợi nhuận: số toàn hệ thống, không chia tòa → cổ đông chưa xem (GĐ-P3 O1); UI-41 hiệu quả theo tòa
    'forecast.view': ['admin', 'ketoan', 'truongphong'], 'forecast.manage': FIN, 'efficiency.view': ['admin', 'ketoan', 'truongphong', 'codong'],
    'reports.drill': ['admin', 'ketoan', 'truongphong'], // mở chứng từ gốc từ ô báo cáo (UI-28) – cổ đông chỉ xem số tổng
  };
  const can = (role, perm) => !!(POLICY[perm] && POLICY[perm].includes(role));
  C.rbac = { ROLES, POLICY, can, perms: Object.keys(POLICY) };
})(window.TH);
