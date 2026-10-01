/* Domain – ma trận quyền Phase 1 + Phase 2 (đặc tả §1.1, CH-01/CH-23, GĐ OQ-09). Thuần: dùng chung cho web và scripts/check-rbac.mjs.
   Phase 2 thêm vai trò sale (chỉ lead/deal của mình, CH-01 không thấy hoa hồng) và kỹ thuật (nhập sổ sửa chữa, không thấy tiền thu). */
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
  };
  const ALL = Object.keys(ROLES);
  const FIN = ['admin', 'ketoan'];
  const OPS = ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong'];
  const POLICY = {
    'dashboard.view': ALL,
    'dashboard.money': ['admin', 'ketoan', 'truongphong'],
    'buildings.view': ALL, 'buildings.manage': ['admin'], 'rooms.status': ['admin', 'ketoan', 'vanhanh'],
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
    'reports.view': ['admin', 'ketoan', 'truongphong'], 'reports.export': FIN,
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
    'shares.view': FIN, 'shares.manage': FIN, 'shares.lock': FIN,
    'documents.view': ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong'], 'documents.upload': ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong'],
    'documents.download': ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong', 'truongkd', 'sale', 'kythuat'], // E1 [GĐ-E1]: sale/kỹ thuật tải trong phạm vi hẹp (Q.canDownloadDoc), không mở kho
    'ocr.review': OPS, // rà soát trường; "Áp dụng vào biểu phí" cần rates.manage (FIN)
    'zalo.inbox': ['admin', 'ketoan', 'truongphong'],
    'periods.reopen.admin': ['admin'], 'periods.reopen.ketoan': ['ketoan'],
  };
  const can = (role, perm) => !!(POLICY[perm] && POLICY[perm].includes(role));
  C.rbac = { ROLES, POLICY, can, perms: Object.keys(POLICY) };
})(window.TH);
