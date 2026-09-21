/* Phiên đăng nhập, RBAC Phase 1 và phạm vi tòa */
(function (TH) {
  const A = {};
  const ROLE_POLICY = {
    'dashboard.view': ['admin', 'accountant', 'ops'],
    'buildings.view': ['admin', 'accountant', 'ops'], 'buildings.manage': ['admin'],
    'landlords.view': ['admin', 'accountant', 'ops'], 'landlords.manage': ['admin'],
    'rooms.view': ['admin', 'accountant', 'ops'], 'rooms.manage': ['admin', 'ops'],
    'tenants.view': ['admin', 'accountant', 'ops'], 'tenants.manage': ['admin', 'ops'],
    'contracts.view': ['admin', 'accountant', 'ops'], 'contracts.manage': ['admin', 'ops'],
    'invoices.view': ['admin', 'accountant', 'ops'], 'invoices.prepare': ['admin', 'accountant'],
    'meterReadings.manage': ['admin', 'accountant', 'ops'],
    'payments.view': ['admin', 'accountant', 'ops'], 'payments.record': ['admin', 'accountant', 'ops'],
    'payments.adjust': ['admin', 'accountant'], 'payments.reverse': ['admin', 'accountant'],
    'refunds.view': ['admin', 'accountant', 'ops'], 'refunds.prepare': ['admin', 'ops'],
    'refunds.approve': ['admin', 'accountant'], 'refunds.pay': ['admin', 'accountant'],
    'expenses.view': ['admin', 'accountant', 'ops'], 'expenses.manage': ['admin', 'accountant', 'ops'],
    'expenses.manageCommon': ['admin', 'accountant'], 'landlordPayments.manage': ['admin', 'accountant'],
    'zalo.view': ['admin', 'accountant'], 'zalo.send': ['admin'], 'zalo.config': ['admin'],
    'reports.view': ['admin', 'accountant'], 'reports.export': ['admin', 'accountant'],
    'catalog.view': ['admin', 'accountant'], 'catalog.manage': ['admin', 'accountant'],
    'import.view': ['admin', 'accountant', 'ops'], 'import.all': ['admin'],
    'import.finance': ['admin', 'accountant'], 'import.operations': ['admin', 'ops'],
    'users.manage': ['admin'], advancedTools: ['admin'],
    'documents.view': ['admin', 'accountant', 'ops', 'sale', 'kythuat', 'hr', 'codong'], 'documents.manage': ['admin', 'accountant', 'ops'],
    // Compatibility aliases used by existing pages and forms.
    approveRefund: ['admin', 'accountant'], rejectRefund: ['admin', 'accountant'], recordRefundPaid: ['admin', 'accountant'],
    issueInvoice: ['admin', 'accountant'], adjustInvoice: ['admin', 'accountant'], reversePayment: ['admin', 'accountant'],
    adjustPayment: ['admin', 'accountant'], recordPayment: ['admin', 'accountant', 'ops'], manageUsers: ['admin'],
    manageCatalog: ['admin', 'accountant'], zaloConfig: ['admin'], deactivateBuilding: ['admin'],
    // Phase 2 (A=admin, K=accountant, O=ops, S=sale, T=kythuat) – chỉ có hiệu lực khi TH.phase.on(2)
    'crm.view': ['admin', 'accountant', 'ops', 'sale'], 'crm.manage': ['admin', 'sale'], 'crm.convert': ['admin', 'ops', 'sale'], 'viewings.manage': ['admin', 'ops', 'sale'], 'holds.manage': ['admin', 'ops', 'sale'],
    'deals.view': ['admin', 'accountant', 'sale'], 'deals.manage': ['admin', 'sale'], 'commission.view': ['admin', 'accountant', 'sale'], 'commission.pay': ['admin', 'accountant'],
    'ocr.use': ['admin', 'ops'], 'statement.import': ['admin', 'accountant'], 'openingBalance.manage': ['admin', 'accountant'], 'deposits.view': ['admin', 'accountant', 'ops'],
    'dataJobs.view': ['admin', 'accountant', 'ops'], 'dataJobs.manage': ['admin', 'accountant'],
    'maintenance.view': ['admin', 'accountant', 'ops', 'kythuat'], 'maintenance.manage': ['admin', 'ops', 'kythuat'], 'maintenance.assign': ['admin', 'ops'], 'maintenance.schedule': ['admin', 'ops', 'kythuat'],
    'reports.hub': ['admin', 'accountant', 'sale'], 'period.close': ['admin', 'accountant'], 'zalo.log': ['admin'], 'refunds.requestEdit': ['admin', 'accountant'], 'expenses.depreciation': ['admin', 'accountant'],
    // Phase 3 (H=hr, C=codong) – chỉ có hiệu lực khi TH.phase.on(3)
    'assets.view': ['admin', 'accountant', 'ops', 'kythuat'], 'assets.manage': ['admin', 'ops'], 'inventory.view': ['admin', 'accountant', 'ops', 'kythuat'], 'inventory.manage': ['admin', 'accountant'], 'inventory.record': ['admin', 'accountant', 'ops'],
    'hr.view': ['admin', 'hr'], 'hr.manage': ['admin', 'hr'], 'timesheet.view': ['admin', 'hr'], 'timesheet.manage': ['admin', 'hr'], 'payroll.view': ['admin', 'hr', 'accountant'], 'payroll.manage': ['admin', 'hr'], 'payroll.approve': ['admin', 'accountant'], 'payroll.lock': ['admin', 'accountant'], 'payroll.reopen': ['admin'], 'performance.view': ['admin', 'hr', 'accountant'], 'salary.view': ['admin', 'hr', 'accountant'], 'salary.pay': ['admin', 'accountant'], 'expenses.import': ['admin', 'accountant'],
    'projects.view': ['admin', 'accountant', 'codong'], 'projects.manage': ['admin'], 'shareholders.view': ['admin', 'accountant', 'codong'], 'shareholders.manage': ['admin', 'accountant'], 'contributions.record': ['admin', 'accountant'], 'distributions.manage': ['admin', 'accountant'], 'distributions.approve': ['admin'], 'roi.view': ['admin', 'accountant', 'codong'],
    'bank.view': ['admin', 'accountant'], 'bank.manage': ['admin', 'accountant'],
    // Spec v1.8 Wave 1 – Phase 1: cơ cấu tổ chức, phân công tòa (single source of truth), master data, vai trò Quản lý Tổng / TPVH (§16)
    'org.view': ['admin', 'accountant', 'ops', 'hr', 'qltong', 'tpvh'], 'org.manage': ['admin', 'hr', 'qltong'],
    'assignments.view': ['admin', 'accountant', 'ops', 'hr', 'qltong', 'tpvh'], 'assignments.manage': ['admin', 'hr', 'qltong', 'tpvh'], 'assignments.approve': ['admin', 'qltong'],
    'masterData.view': ['admin', 'accountant', 'hr'], 'masterData.manage': ['admin'],
    // Spec v1.8 Wave 5 – Phase 1: kỳ báo cáo / metric registry / cổ phần theo tòa
    'reports.lock': ['admin', 'accountant'], 'reports.reopen': ['admin'], 'metrics.manage': ['admin'], 'shares.view': ['admin', 'accountant', 'codong', 'qltong'], 'shares.manage': ['admin', 'accountant'],
  };
  // Vai trò tổ chức (§16): Quản lý Tổng xem toàn cây + duyệt; TPVH thao tác vận hành trong scope đơn vị + descendants
  const QLTONG_PERMS = ['dashboard.view', 'buildings.view', 'landlords.view', 'rooms.view', 'tenants.view', 'contracts.view', 'invoices.view', 'payments.view', 'refunds.view', 'refunds.approve', 'expenses.view', 'reports.view', 'reports.export', 'reports.hub', 'documents.view', 'hr.view', 'payroll.view', 'payroll.approve', 'performance.view', 'salary.view', 'shareholders.view', 'projects.view', 'roi.view', 'catalog.view', 'zalo.view', 'import.view', 'ocr.use', 'deposits.view', 'maintenance.view', 'crm.view', 'deals.view', 'assets.view', 'inventory.view'];
  const TPVH_PERMS = ['dashboard.view', 'buildings.view', 'landlords.view', 'rooms.view', 'rooms.manage', 'tenants.view', 'tenants.manage', 'contracts.view', 'contracts.manage', 'invoices.view', 'meterReadings.manage', 'payments.view', 'payments.record', 'recordPayment', 'refunds.view', 'refunds.prepare', 'expenses.view', 'expenses.manage', 'documents.view', 'documents.manage', 'hr.view', 'performance.view', 'ocr.use', 'deposits.view', 'import.view', 'import.operations', 'maintenance.view', 'maintenance.manage'];
  QLTONG_PERMS.forEach(k => { if (ROLE_POLICY[k] && !ROLE_POLICY[k].includes('qltong')) ROLE_POLICY[k].push('qltong'); });
  TPVH_PERMS.forEach(k => { if (ROLE_POLICY[k] && !ROLE_POLICY[k].includes('tpvh')) ROLE_POLICY[k].push('tpvh'); });
  // HR là vai trò Phase 1 (§4.23–4.26): mở quyền đọc vận hành cơ bản để đối chiếu phân công
  ['buildings.view', 'rooms.view', 'documents.view', 'dashboard.view'].forEach(k => { if (ROLE_POLICY[k] && !ROLE_POLICY[k].includes('hr')) ROLE_POLICY[k].push('hr'); });
  const PERMS = ROLE_POLICY; // alias tương thích cho các màn hình hiện hữu
  // Vai trò P2 được đọc một số màn P1 (read-only)
  const P2_READ = { sale: ['dashboard.view', 'rooms.view', 'tenants.view', 'contracts.view', 'buildings.view'], kythuat: ['dashboard.view', 'rooms.view', 'buildings.view', 'expenses.view'], hr: ['dashboard.view', 'buildings.view'], codong: ['dashboard.view'] };
  Object.entries(P2_READ).forEach(([role, perms]) => perms.forEach(k => { if (PERMS[k] && !PERMS[k].includes(role)) PERMS[k].push(role); }));
  const P1_ROLES = ['admin', 'accountant', 'ops', 'hr', 'qltong', 'tpvh']; // spec v1.8: Nhân sự thuộc Phase 1
  const PHASE_ROLES = { 2: ['sale', 'kythuat'], 3: ['codong'] };
  const phaseOfRole = (role) => Number(Object.keys(PHASE_ROLES).find(n => PHASE_ROLES[n].includes(role))) || 1;
  const roleAllowed = (role) => P1_ROLES.includes(role) || (phaseOfRole(role) > 1 && TH.phase && TH.phase.on(phaseOfRole(role)));
  const SCOPED_ROLES = ['ops', 'tpvh', 'sale', 'kythuat', 'codong'];
  const isScoped = (role) => SCOPED_ROLES.includes(role);
  const COLLECTION_TYPE = {
    buildings: 'building', rooms: 'room', landlords: 'landlord', landlordContracts: 'landlordContract', landlordPayments: 'landlordPayment',
    tenants: 'tenant', contracts: 'contract', contractMembers: 'contractMember', contractServices: 'contractService', holds: 'hold', roomAssets: 'roomAsset',
    meterReadings: 'meterReading', invoices: 'invoice', invoiceLines: 'invoiceLine', payments: 'payment', paymentAllocations: 'paymentAllocation',
    refunds: 'refund', refundDeductions: 'refundDeduction', expenses: 'expense', expenseAllocations: 'expenseAllocation', documents: 'document',
    importJobs: 'importJob', auditLog: 'auditLog', zaloBatches: 'zaloBatch', zaloMessages: 'zaloMessage', ocrExtractions: 'ocrExtraction', ocrJobs: 'ocrJob', reportRuns: 'reportRun',
    // Spec v1.8 W2: dữ liệu theo HĐ/phòng/tòa
    contractTenants: 'contractTenant', depositLedger: 'depositEntry', meters: 'meter', contractHandoverAssets: 'contractHandoverAsset', contractPaymentTerms: 'contractPaymentTerm', contractRenewalClauses: 'contractRenewalClause',
    // Phase 2: record có buildingId/roomId → ops vẫn bị giới hạn theo tòa
    leads: 'lead', leadActivities: 'leadActivity', viewings: 'viewing', deals: 'deal', commissions: 'commission', incidents: 'incident', incidentUpdates: 'incidentUpdate', maintenanceSchedules: 'maintenanceSchedule', openingBalances: 'openingBalance',
    // Phase 3: tài sản/kiểm kê theo tòa; dự án/vốn góp/phân phối theo tòa của dự án
    assets: 'asset', inventories: 'inventory', inventoryLines: 'inventoryLine', projects: 'project', shareholders: 'shareholder', capitalCommitments: 'capitalCommitment', contributions: 'contribution', distributions: 'distribution',
    // Spec v1.8 W5: cổ phần/góp vốn/phân phối theo tòa
    buildingShares: 'buildingShare', capitalCalls: 'capitalCall', capitalPayments: 'capitalPayment', profitDistributions: 'profitDistribution',
  };
  const DATA_SCOPE = {
    ops: new Set(Object.keys(COLLECTION_TYPE)),
    tpvh: new Set(Object.keys(COLLECTION_TYPE)),
    sale: new Set(['leads', 'leadActivities', 'viewings', 'holds', 'deals', 'commissions', 'tenants', 'contracts', 'reportRuns']),
    kythuat: new Set(['buildings', 'rooms', 'expenses', 'incidents', 'incidentUpdates', 'maintenanceSchedules', 'assets', 'inventories', 'inventoryLines']),
    codong: new Set(['buildings', 'rooms', 'projects', 'shareholders', 'capitalCommitments', 'contributions', 'distributions', 'buildingShares', 'capitalCalls', 'capitalPayments', 'profitDistributions']),
  };
  const rawAll = c => TH.store.rawAll ? TH.store.rawAll(c) : (TH.store.state[c] || []);
  const rawGet = (c, id) => TH.store.rawGet ? TH.store.rawGet(c, id) : rawAll(c).find(x => x && x.id === id) || null;
  const uniq = rows => [...new Set(rows.filter(Boolean))];

  A.ROLE_LABEL = { admin: 'Quản trị viên', qltong: 'Quản lý Tổng', tpvh: 'Trưởng phòng vận hành', accountant: 'Kế toán', ops: 'Vận hành', sale: 'Kinh doanh', kythuat: 'Kỹ thuật', tech: 'Kỹ thuật', hr: 'Nhân sự', codong: 'Cổ đông' };
  A.P1_ROLES = P1_ROLES; A.roleAllowed = roleAllowed; A.PHASE_ROLES = PHASE_ROLES; A.phaseOfRole = phaseOfRole;
  A.ROLE_POLICY = ROLE_POLICY; A.PERMISSIONS = PERMS; A.DATA_SCOPE = DATA_SCOPE;
  A.session = () => TH.store.state.session;
  A.user = () => { const s = A.session(); return s ? rawGet('users', s.userId) : null; };
  A.role = () => { const s = A.session(); return s ? s.role : null; };
  A.allowedSaleIds = () => {
    const u = A.user(); if (!u || A.role() !== 'sale') return null;
    const team = rawAll('salesTeams').find(t => t && t.leadUserId === u.id && t.status !== 'inactive');
    return new Set(team ? rawAll('users').filter(x => x && x.role === 'sale' && x.status === 'active' && x.teamId === team.id).map(x => x.id) : [u.id]);
  };
  A.shareholder = () => { const u = A.user(); return u ? rawAll('shareholders').find(s => s && s.userId === u.id) || null : null; };
  A.allowedProjectIds = () => {
    if (A.role() !== 'codong') return null;
    const sh = A.shareholder();
    return new Set(sh ? rawAll('capitalCommitments').filter(c => c && c.shareholderId === sh.id).map(c => c.projectId).filter(Boolean) : []);
  };
  A.allowedBuildingIds = () => {
    const role = A.role(), u = A.user();
    if (!isScoped(role) || role === 'sale') return null;
    // §4.25.7: scope Vận hành suy ra từ Phân công tòa nhà có hiệu lực (managerId/users.buildingIds chỉ là cache); fallback cache khi chưa có hồ sơ NV
    if (role === 'ops') {
      const employee = u && rawAll('employees').find(e => e && e.userId === u.id);
      const today = TH.f.today();
      const fromAssign = employee ? rawAll('buildingAssignments').filter(a => a && a.employeeId === employee.id && ['active', 'ended', 'approved'].includes(a.status || 'active') && a.start <= today && (!a.end || a.end >= today)).map(a => a.buildingId) : [];
      return new Set((fromAssign.length ? fromAssign : (u && Array.isArray(u.buildingIds) ? u.buildingIds : [])).filter(Boolean));
    }
    // §4.3/§16: TPVH thấy toàn bộ tòa do nhân sự thuộc đơn vị mình (kể cả đơn vị con) làm Phụ trách chính
    if (role === 'tpvh') {
      const employee = u && rawAll('employees').find(e => e && e.userId === u.id);
      if (!employee || !TH.q || !TH.q.employmentAt) return new Set();
      const units = [...new Set(TH.q.employmentAt(employee.id).map(a => a.orgUnitId).filter(Boolean).flatMap(id => TH.q.orgDescendants(id)))];
      return new Set(TH.q.scopeBuildingIds ? units.flatMap(id => TH.q.scopeBuildingIds({ orgUnitId: id })) : []);
    }
    if (role === 'kythuat') {
      const employee = u && rawAll('employees').find(e => e && e.userId === u.id);
      return new Set(employee ? rawAll('buildingAssignments').filter(a => a && a.employeeId === employee.id && a.status === 'active').map(a => a.buildingId).filter(Boolean) : []);
    }
    if (role === 'codong') {
      const projects = A.allowedProjectIds() || new Set(); const sh = A.shareholder();
      // §4.30: tòa cổ đông tham gia = Building Share (mọi record, kể cả đã hết hiệu lực) ∪ dự án P3
      return new Set(rawAll('projects').filter(p => p && projects.has(p.id)).map(p => p.buildingId).concat(sh ? rawAll('buildingShares').filter(x => x && x.shareholderId === sh.id && x.status !== 'cancelled').map(x => x.buildingId) : []).filter(Boolean));
    }
    return null;
  };
  A.shouldScopeCollection = c => !!(DATA_SCOPE[A.role()] && DATA_SCOPE[A.role()].has(c));

  function buildingIds(type, record, seen = new Set()) {
    if (!record) return [];
    type = COLLECTION_TYPE[type] || type;
    const token = type + ':' + (record.id || 'new'); if (seen.has(token)) return []; seen.add(token);
    if (record.buildingId) return [record.buildingId];
    if (Array.isArray(record.buildingIds)) return record.buildingIds;
    if (type === 'building') return [record.id];
    if (type === 'room' || type === 'roomAsset' || type === 'hold') {
      const room = type === 'room' ? record : rawGet('rooms', record.roomId); return room ? [room.buildingId] : [];
    }
    if (type === 'landlord') return uniq(rawAll('buildings').filter(b => b && (b.landlordId === record.id || (record.buildingIds || []).includes(b.id))).map(b => b.id));
    if (type === 'landlordContract') return record.buildingIds || [];
    if (type === 'landlordPayment') return record.buildingId ? [record.buildingId] : buildingIds('landlordContract', rawGet('landlordContracts', record.landlordContractId), seen);
    if (type === 'tenant') {
      const c = rawAll('contracts').filter(x => x && x.tenantId === record.id).flatMap(x => buildingIds('contract', x, seen));
      const h = rawAll('holds').filter(x => x && x.tenantId === record.id).flatMap(x => buildingIds('hold', x, seen));
      return uniq(c.concat(h));
    }
    if (type === 'contract') return record.buildingId ? [record.buildingId] : buildingIds('room', rawGet('rooms', record.roomId), seen);
    if (type === 'contractMember' || type === 'contractService') return buildingIds('contract', rawGet('contracts', record.contractId), seen);
    if (type === 'meterReading') return buildingIds('room', rawGet('rooms', record.roomId), seen);
    if (type === 'invoice') return record.roomId ? buildingIds('room', rawGet('rooms', record.roomId), seen) : buildingIds('contract', rawGet('contracts', record.contractId), seen);
    if (type === 'invoiceLine') return buildingIds('invoice', rawGet('invoices', record.invoiceId), seen);
    if (type === 'payment') return uniq(rawAll('paymentAllocations').filter(x => x && x.paymentId === record.id).flatMap(x => buildingIds('invoice', rawGet('invoices', x.invoiceId), seen)));
    if (type === 'paymentAllocation') return uniq(buildingIds('invoice', rawGet('invoices', record.invoiceId), seen).concat(buildingIds('payment', rawGet('payments', record.paymentId), seen)));
    if (type === 'refund') return record.roomId ? buildingIds('room', rawGet('rooms', record.roomId), seen) : buildingIds('contract', rawGet('contracts', record.contractId), seen);
    if (type === 'refundDeduction') return buildingIds('refund', rawGet('refunds', record.refundId), seen);
    if (type === 'expense') return record.buildingId ? [record.buildingId] : []; // common expense is outside Ops scope
    if (type === 'expenseAllocation') return buildingIds('expense', rawGet('expenses', record.expenseId), seen);
    if (type === 'document') {
      const cols = { building: 'buildings', room: 'rooms', tenant: 'tenants', contract: 'contracts', invoice: 'invoices', payment: 'payments', refund: 'refunds', landlord: 'landlords' };
      return buildingIds(record.entityType, rawGet(cols[record.entityType] || record.entityType, record.entityId), seen);
    }
    if (type === 'contractTenant' || type === 'depositEntry' || type === 'contractHandoverAsset' || type === 'contractPaymentTerm' || type === 'contractRenewalClause') return record.buildingId ? [record.buildingId] : buildingIds('contract', rawGet('contracts', record.contractId), seen);
    if (type === 'meter') return record.buildingId ? [record.buildingId] : buildingIds('room', rawGet('rooms', record.roomId), seen);
    if (type === 'ocrJob') {
      const cid = record.contractId || (record.result && record.result.contractId); if (cid) return buildingIds('contract', rawGet('contracts', cid), seen);
      const rd = (record.decisions || {}).ROOM; if (rd && rd.candidateId) return buildingIds('room', rawGet('rooms', rd.candidateId), seen);
      const bd = (record.decisions || {}).BUILDING; if (bd && bd.candidateId) return [bd.candidateId];
      const roomCode = ((record.fields || []).find(f => f && f.key === 'roomCode') || {}).value; const room = roomCode && rawAll('rooms').find(r => r && r.code === roomCode); return room ? [room.buildingId] : [];
    }
    if (type === 'ocrExtraction') {
      if (record.contractId) return buildingIds('contract', rawGet('contracts', record.contractId), seen);
      const roomCode = ((record.fields || []).find(f => f && f.key === 'roomCode') || {}).value;
      const room = roomCode && rawAll('rooms').find(r => r && r.code === roomCode);
      return room ? [room.buildingId] : [];
    }
    if (type === 'zaloBatch') return uniq(rawAll('zaloMessages').filter(x => x && x.batchId === record.id).flatMap(x => buildingIds('zaloMessage', x, seen)));
    if (type === 'zaloMessage') return record.buildingId ? [record.buildingId] : buildingIds('invoice', rawGet('invoices', record.invoiceId), seen);
    if (type === 'lead') return record.buildingIds && record.buildingIds.length ? record.buildingIds : [];
    if (type === 'leadActivity') return buildingIds('lead', rawGet('leads', record.leadId), seen);
    if (type === 'commission') return buildingIds('deal', rawGet('deals', record.dealId), seen);
    if (type === 'incidentUpdate') return buildingIds('incident', rawGet('incidents', record.incidentId), seen);
    if (type === 'openingBalance') return buildingIds('contract', rawGet('contracts', record.contractId), seen);
    if (type === 'inventoryLine') return buildingIds('asset', rawGet('assets', record.assetId), seen);
    if (type === 'capitalCommitment' || type === 'contribution' || type === 'distribution') return record.projectId ? buildingIds('project', rawGet('projects', record.projectId), seen) : uniq(rawAll('projects').map(p => p && p.buildingId));
    if (type === 'buildingShare' || type === 'capitalCall' || type === 'profitDistribution') return record.buildingId ? [record.buildingId] : [];
    if (type === 'capitalPayment') return buildingIds('capitalCall', rawGet('capitalCalls', record.capitalCallId), seen);
    if (type === 'auditLog') {
      const cols = { building: 'buildings', room: 'rooms', tenant: 'tenants', contract: 'contracts', invoice: 'invoices', payment: 'payments', refund: 'refunds', expense: 'expenses', landlord: 'landlords', landlordContract: 'landlordContracts' };
      return buildingIds(record.entityType, rawGet(cols[record.entityType] || record.entityType, record.entityId), seen);
    }
    return [];
  }

  A.inScope = (type, record, action) => {
    if (!isScoped(A.role())) return true;
    const role = A.role(), user = A.user();
    type = COLLECTION_TYPE[type] || type;
    if (typeof record === 'string') {
      const col = Object.keys(COLLECTION_TYPE).find(k => COLLECTION_TYPE[k] === type) || type;
      record = rawGet(col, record);
    }
    if (!record) return false;
    if (role === 'sale') {
      const saleIds = A.allowedSaleIds() || new Set();
      if (type === 'lead') return saleIds.has(record.saleId);
      if (type === 'leadActivity') return A.inScope('lead', rawGet('leads', record.leadId));
      if (type === 'viewing' || type === 'deal' || type === 'commission') return saleIds.has(record.saleId || (rawGet('deals', record.dealId) || {}).saleId);
      if (type === 'hold') return record.leadId ? A.inScope('lead', rawGet('leads', record.leadId)) : A.inScope('tenant', rawGet('tenants', record.tenantId));
      if (type === 'tenant') return rawAll('deals').some(d => d && d.tenantId === record.id && saleIds.has(d.saleId)) || rawAll('leads').some(l => l && l.tenantId === record.id && saleIds.has(l.saleId));
      if (type === 'contract') return rawAll('deals').some(d => d && d.contractId === record.id && saleIds.has(d.saleId));
      if (type === 'reportRun') return record.cat === 'sales' && saleIds.has(record.createdBy);
      return false;
    }
    if (role === 'codong') {
      const projectIds = A.allowedProjectIds() || new Set(), sh = A.shareholder();
      if (type === 'shareholder') return !!sh && record.id === sh.id;
      if (type === 'project') return projectIds.has(record.id);
      if (type === 'capitalCommitment' || type === 'contribution') return !!sh && record.shareholderId === sh.id && projectIds.has(record.projectId);
      if (type === 'distribution') return !!sh && (!record.projectId || projectIds.has(record.projectId)) && (record.lines || []).some(l => l.shareholderId === sh.id);
      if (type === 'buildingShare' || type === 'capitalPayment') return !!sh && record.shareholderId === sh.id;
      if (type === 'capitalCall') return !!sh && rawAll('capitalPayments').some(l => l && l.capitalCallId === record.id && l.shareholderId === sh.id);
      if (type === 'profitDistribution') return !!sh && (record.lines || []).some(l => l.shareholderId === sh.id);
    }
    if (['ops', 'tpvh'].includes(role) && (type === 'ocrExtraction' || type === 'ocrJob') && (record.createdBy === (user || {}).id || record.uploadedBy === (user || {}).id)) return true;
    // Ops: khách thuê chưa gắn HĐ/giữ chỗ nào (vừa tạo tay hoặc từ OCR) không thuộc tòa nào → được thấy/dùng để lập HĐ đầu tiên trong tòa của mình
    if (['ops', 'tpvh'].includes(role) && type === 'tenant' && !buildingIds(type, record).length) return true;
    const allowed = A.allowedBuildingIds(); if (!allowed || !allowed.size) return false;
    if (role === 'kythuat') {
      if (type === 'incident') return buildingIds(type, record).some(id => allowed.has(id)) && (!record.assigneeId || record.assigneeId === user.id);
      if (type === 'incidentUpdate') return A.inScope('incident', rawGet('incidents', record.incidentId));
      if (type === 'maintenanceSchedule') return buildingIds(type, record).some(id => allowed.has(id)) && (!record.assigneeId || record.assigneeId === user.id);
    }
    if (type === 'importJob' && record.createdBy === (A.user() || {}).id) return true;
    if (role === 'kythuat' && type === 'expense' && record.createdBy !== (A.user() || {}).id) return false;
    if (type === 'expenseAllocation') { const expense = rawGet('expenses', record.expenseId); return !!expense && A.inScope('expense', expense); }
    return buildingIds(type, record).some(id => allowed.has(id));
  };
  A.filterByScope = (type, records, action) => isScoped(A.role()) ? (records || []).filter(r => A.inScope(type, r, action)) : (records || []);
  A.scope = A.filterByScope;
  A.can = (permission, context) => {
    const allow = PERMS[permission], role = A.role();
    if (!role || !allow || !allow.includes(role)) return false; // fail closed
    if (!isScoped(role) || !context) return true;
    if (context.buildingId) { const ids = A.allowedBuildingIds(); return !ids || ids.has(context.buildingId); }
    if (context.type || context.record) return A.inScope(context.type, context.record || context.id);
    return true;
  };
  A.need = (permission, context, message) => {
    if (typeof context === 'string') { message = context; context = null; }
    if (!A.can(permission, context)) {
      const roles = (PERMS[permission] || []).map(x => A.ROLE_LABEL[x]).join('/');
      throw new Error(message || (roles ? 'Cần quyền của ' + roles + ' để thực hiện thao tác này.' : 'Thao tác chưa được cấp quyền.'));
    }
    return true;
  };
  A.resource = (type, id) => {
    const col = Object.keys(COLLECTION_TYPE).find(k => COLLECTION_TYPE[k] === type) || type;
    return rawGet(col, id);
  };
  A.canRoute = (meta, params) => {
    if (!meta || !meta.permission || !A.can(meta.permission)) return false;
    if (!meta.resource || !isScoped(A.role())) return true;
    const collection = Object.keys(COLLECTION_TYPE).find(key => COLLECTION_TYPE[key] === meta.resource.type) || meta.resource.type;
    if (!A.shouldScopeCollection(collection)) return true;
    const id = params && params[meta.resource.param || 'id'];
    return !!id && A.inScope(meta.resource.type, A.resource(meta.resource.type, id));
  };
  A.importTypes = () => A.role() === 'admin' ? ['room', 'tenant', 'contract', 'meter', 'invoice', 'expense', 'salaryResult'] : A.role() === 'accountant' ? ['meter', 'invoice', 'expense', 'salaryResult'] : ['ops', 'tpvh'].includes(A.role()) ? ['room', 'tenant', 'contract'] : [];
  A.validateSession = () => {
    const s = A.session(); if (!s) return false;
    const u = rawGet('users', s.userId);
    if (!u || u.status !== 'active' || !roleAllowed(u.role) || u.role !== s.role) { TH.store.state.session = null; TH.store.saveNow(); return false; }
    return true;
  };
  A.enforceUI = (root, path) => {
    if (!root) return;
    const role = A.role(), hide = names => String(names || '').split(' ').filter(Boolean).forEach(name => root.querySelectorAll(`[data-act="${name}"]`).forEach(el => el.remove()));
    if (path.startsWith('/buildings')) {
      if (role !== 'admin') hide('add import edit add-lc schedule actions upload rm-doc');
      if ((role === 'ops' || role === 'tpvh')) hide('add-pay paid paid2 landlord-paid go-catalog');
    }
    if (path.startsWith('/landlords')) {
      if (role !== 'admin') hide('add edit add-lc edit-lc schedule upload rm-doc');
      if ((role === 'ops' || role === 'tpvh')) hide('add-pay paid paid2');
    }
    if (path.startsWith('/rooms') && role === 'accountant') hide('edit svc add-asset edit-asset rm-asset newc newc-any hold release clean upload rm-doc more');
    if (path.startsWith('/rooms') && ['sale', 'kythuat'].includes(role)) hide('edit svc add-asset edit-asset rm-asset newc newc-any hold release clean upload rm-doc more export inv');
    if (path.startsWith('/buildings') && ['sale', 'kythuat'].includes(role)) hide('add import edit add-lc schedule actions upload rm-doc add-pay paid paid2 landlord-paid go-catalog add-room bulk import-rooms');
    if ((path.startsWith('/tenants') || path.startsWith('/contracts')) && role === 'sale') hide('add edit newc upload rm-doc more new save activate cancel terminate renew note edit-note pay import inv refund go-refund');
    if (path.startsWith('/expenses') && ['sale', 'kythuat'].includes(role)) hide('add e more');
    if (path.startsWith('/dashboard') && ['sale', 'kythuat'].includes(role)) hide('remind more');
    if (path.startsWith('/tenants') && role === 'accountant') hide('add edit newc upload rm-doc more');
    if (path.startsWith('/contracts') && role === 'accountant') hide('add new edit save activate cancel terminate renew note upload rm-doc more');
    if (path.startsWith('/invoices') && (role === 'ops' || role === 'tpvh')) hide('batch import issue-valid bulk-issue issue adjust add-line note remind bulk-zalo zalo more');
    if (path.startsWith('/payments') && (role === 'ops' || role === 'tpvh')) hide('adjust reverse');
    if (path.startsWith('/refunds')) {
      if (role === 'accountant') hide('new edit save submit');
      if ((role === 'ops' || role === 'tpvh')) hide('approve reject paid');
    }
    if (path.startsWith('/zalo') && role === 'accountant') hide('new retry retry-msg start send test save toggle new-tpl edit-tpl export');
    if (path.startsWith('/settings/catalog') && !A.can('catalog.manage')) hide('apply add-svc save toggle del add-item edit-item rm-item');
    // Phase 3: cổ đông read-only (FR-SHR-04 AC-2); Nhân sự không thấy nút ghi ngoài module HR
    if (role === 'codong') root.querySelectorAll('[data-act]').forEach(el => { const a = el.dataset.act; if (!/^(view|tab|stab|page|psize|tsort|tsel|export|reset|f|back|home|more|cols|filter|roi|detail|open|sb-|guide|palette)/.test(a)) el.remove(); });
    if (role === 'hr' && (path.startsWith('/buildings') || path.startsWith('/dashboard'))) hide('add import edit add-lc schedule actions upload rm-doc add-pay paid paid2 landlord-paid go-catalog add-room bulk import-rooms remind more');
    if (path.startsWith('/hr') && !path.startsWith('/hr/assignments') && !path.startsWith('/hr/org') && !A.can('hr.manage')) hide('add edit assign assign-more status doc-add doc-rm profile fill confirm');
    if (path.startsWith('/hr/org') && !A.can('org.manage')) hide('add edit move lead deactivate');
    if (path.startsWith('/hr/assignments') && !A.can('assignments.manage')) hide('new change transfer end cancel');
    if (path.startsWith('/hr/assignments') && !A.can('assignments.approve')) hide('approve reject');
    if (path.startsWith('/buildings') && !A.can('assignments.manage')) hide('change-manager');
    if (path.startsWith('/settings/catalog') && !A.can('masterData.manage')) hide('md-add md-edit md-toggle');
    if (path.startsWith('/hr/payroll') && !A.can('payroll.approve')) hide('approve pay return');
    if (path.startsWith('/hr/payroll') && !A.can('payroll.manage')) hide('build submit open refresh adjust deduction');
    if (path.startsWith('/hr/payroll') && !A.can('payroll.lock')) hide('lock');
    if (path.startsWith('/hr/payroll') && !A.can('payroll.reopen')) hide('reopen');
    if (path.startsWith('/hr/salary-payments') && !A.can('salary.pay')) hide('pay bulk-pay import fail cancel adjust');
    if (path.startsWith('/assets') && !A.can('inventory.manage')) hide('start finish export-report');
    if (path.startsWith('/assets') && !A.can('assets.manage')) hide('add edit dispose');
    if (path.startsWith('/investment') && !A.can('shareholders.manage')) hide('add edit add-round record add-dist add-project');
    if (path.startsWith('/investment') && !A.can('shares.manage')) hide('config shares-save');
    if (path.startsWith('/investment') && !A.can('contributions.record')) hide('add-call pay');
    if (path.startsWith('/investment') && !A.can('distributions.manage')) hide('gen-dist gen submit cancel');
    if (path.startsWith('/reports') && !A.can('reports.lock')) hide('lock');
    if (path.startsWith('/reports') && !A.can('reports.reopen')) hide('reopen');
    if (path.startsWith('/reports') && !A.can('metrics.manage')) hide('confirm revert');
    if (path.startsWith('/investment') && !A.can('distributions.approve')) hide('approve');
    if (path.startsWith('/finance/bank') && !A.can('bank.manage')) hide('import reconcile qr match ignore add-acc');
  };
  A.login = (username, password) => {
    username = String(username || '').trim().toLowerCase();
    const u = rawAll('users').find(x => x && (x.username === username || String(x.email || '').toLowerCase() === username));
    if (!u || !password) throw new Error('Vui lòng kiểm tra lại email/tên đăng nhập và mật khẩu.');
    if (u.status === 'locked') throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
    if (u.status === 'expired') throw new Error('Tài khoản đã hết hiệu lực. Vui lòng liên hệ quản trị viên.');
    if (!roleAllowed(u.role)) { const ph = phaseOfRole(u.role); throw new Error('Vai trò ' + A.ROLE_LABEL[u.role] + ' thuộc Phase ' + ph + ' – ' + (TH.phase && TH.phase.available(ph) ? 'bật Phase ' + ph + ' trong Công cụ nâng cao (Admin) để đăng nhập.' : 'chưa mở trong bản demo này.')); }
    TH.store.state.session = { userId: u.id, name: u.name, role: u.role, at: TH.f.nowISO() };
    u.lastLogin = TH.f.nowISO(); TH.store.saveNow(); TH.store.audit('login', 'user', u.id, u.name + ' đăng nhập');
    return u;
  };
  A.logout = () => { TH.store.state.session = null; TH.store.saveNow(); };
  A.isImpersonating = () => !!(A.session() && A.session().impersonator);
  A.switchRole = role => {
    const current = A.session();
    if (!current || (current.role !== 'admin' && !current.impersonator)) throw new Error('Chỉ Admin được dùng chế độ chuyển vai trò demo.');
    if (!roleAllowed(role)) { const ph = phaseOfRole(role); throw new Error(ph > 1 ? 'Vai trò ' + A.ROLE_LABEL[role] + ' thuộc Phase ' + ph + ' – bật Phase ' + ph + ' trong Công cụ nâng cao.' : 'Vai trò không được hỗ trợ trong Phase 1.'); }
    const origin = current.impersonator || { userId: current.userId, name: current.name, role: current.role };
    if (origin.role !== 'admin') throw new Error('Phiên gốc không có quyền Admin.');
    if (role === 'admin') return A.endImpersonation();
    const demo = { accountant: 'ketoan', ops: 'vanhanh', sale: 'sale', kythuat: 'kythuat', hr: 'nhansu', codong: 'codong', qltong: 'qltong', tpvh: 'tpvh1' }[role];
    const u = rawAll('users').find(x => x && x.username === demo && x.status === 'active') || rawAll('users').find(x => x && x.role === role && x.status === 'active');
    if (!u) throw new Error('Không có tài khoản demo hoạt động cho vai trò này.');
    TH.store.state.session = { userId: u.id, name: u.name, role: u.role, at: TH.f.nowISO(), impersonator: origin };
    TH.store.saveNow(); TH.store.audit('impersonate', 'user', u.id, 'Admin xem hệ thống với vai trò ' + A.ROLE_LABEL[u.role]);
    return u;
  };
  A.endImpersonation = () => {
    const s = A.session(), origin = s && s.impersonator;
    if (!origin) return A.user();
    const admin = rawGet('users', origin.userId);
    if (!admin || admin.status !== 'active' || admin.role !== 'admin') { A.logout(); throw new Error('Tài khoản Admin gốc không còn hiệu lực.'); }
    TH.store.state.session = { userId: admin.id, name: admin.name, role: admin.role, at: TH.f.nowISO() };
    TH.store.saveNow(); TH.store.audit('end_impersonate', 'user', admin.id, 'Quay lại tài khoản Admin');
    return admin;
  };
  TH.auth = A;
})(window.TH);
