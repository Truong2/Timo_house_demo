/* Domain – ma trận quyền Phase 1 (đặc tả §1.1, CH-01/CH-23, GĐ OQ-09). Thuần: dùng chung cho web và scripts/check-rbac.mjs. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const ROLES = {
    admin: { label: 'Quản trị hệ thống', scope: 'all' },
    ketoan: { label: 'Kế toán', scope: 'all' },
    vanhanh: { label: 'Quản lý / Vận hành', scope: 'assigned' },
    leader: { label: 'Trưởng nhóm (leader)', scope: 'branch' },
    truongphong: { label: 'Trưởng phòng', scope: 'branch' },
  };
  const ALL = Object.keys(ROLES);
  const FIN = ['admin', 'ketoan'];
  const POLICY = {
    'dashboard.view': ALL,
    'dashboard.money': ['admin', 'ketoan', 'truongphong'],
    'buildings.view': ALL, 'buildings.manage': ['admin'], 'rooms.status': ['admin', 'ketoan', 'vanhanh'],
    'owners.view': FIN, 'owners.manage': ['admin'], 'ownerPayments.view': FIN, 'ownerPayments.record': FIN,
    'tenants.view': ALL, 'tenants.manage': FIN, 'stays.end': ['admin', 'ketoan', 'vanhanh'], 'stays.transfer': FIN,
    'customers.pii': FIN,
    'rates.view': ['admin', 'ketoan', 'vanhanh'], 'rates.manage': FIN,
    'readings.view': ['admin', 'ketoan', 'vanhanh'], 'readings.manage': ['admin', 'ketoan', 'vanhanh'],
    'invoices.view': ['admin', 'ketoan', 'vanhanh'], 'invoices.prepare': FIN, 'invoices.issue': FIN, 'invoices.adjust': FIN,
    'payments.view': FIN, 'payments.record': FIN, 'payments.reverse': FIN,
    'debts.viewStatus': ALL, 'debts.viewAmounts': FIN,
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
  };
  const can = (role, perm) => !!(POLICY[perm] && POLICY[perm].includes(role));
  C.rbac = { ROLES, POLICY, can, perms: Object.keys(POLICY) };
})(window.TH);
