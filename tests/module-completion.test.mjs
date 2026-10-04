import test from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt, completePayroll } from './_app.mjs';

test('customer edits retain all vehicles, support removal, and reject duplicate plates without partial writes', () => {
  const TH = boot(), { store: S, actions: X } = TH, customer = S.all('customers')[0];
  X.updateCustomer(customer.id, { vehicles: [{ plate: '29A-12345', type: 'Ô tô' }, { plate: '29B-54321', type: 'Xe máy' }], residency: { status: 'registered', address: 'Hà Nội', registeredAt: '2026-09-20', reference: 'TT-01' } });
  X.updateCustomer(customer.id, { phone: '0901000000' });
  assert.equal(customer.vehicles.length, 2);
  assert.equal(customer.residency.reference, 'TT-01');
  const before = JSON.stringify(customer);
  assert.equal(attempt(() => X.updateCustomer(customer.id, { name: 'Must not persist', vehicles: [{ plate: '29A-12345', type: 'Ô tô' }, { plate: '29a 12345', type: 'Ô tô' }] })).ok, false);
  assert.equal(JSON.stringify(customer), before);
  X.updateCustomer(customer.id, { vehicles: [] }); assert.equal(customer.vehicles.length, 0);
  TH.auth.login('sale'); assert.equal(attempt(() => X.updateCustomer(customer.id, { name: 'Unauthorized' })).ok, false);
});

test('owner profile and contract metadata preserve source, personal details, PCCC and previous snapshots', () => {
  const TH = boot(), { store: S, actions: X, q: Q } = TH, contract = S.all('ownerContracts')[0], owner = S.get('owners', contract.ownerId);
  X.updateOwnerProfile(owner.id, { name: owner.name, address: 'Địa chỉ theo hợp đồng', bankAccount: '000123', accountHolder: owner.name, sourceRef: 'HĐ gốc', reason: 'Bổ sung giấy tờ' });
  const profile = S.all('ownerProfileVersions')[0], frozen = JSON.stringify(profile.snapshot);
  X.updateOwnerProfile(owner.id, { name: owner.name, address: 'Địa chỉ mới', sourceRef: 'Phụ lục', reason: 'Thay địa chỉ' });
  assert.equal(JSON.stringify(profile.snapshot), frozen);
  X.updateOwnerContractMeta(contract.id, { pcccStatus: 'yes', operatorName: 'Bên khai thác', holdPriceTo: '2027-01-01', sourceRef: 'HĐ gốc', reason: 'Đối chiếu', effectiveFrom: '2026-09-30' });
  const first = Q.ownerContractVersions(contract.id)[0], snapshot = JSON.stringify(first.snapshot);
  X.updateOwnerContractMeta(contract.id, { note: 'Bổ sung ghi chú', effectiveFrom: '2026-10-01' });
  assert.equal(contract.operator.name, 'Bên khai thác', 'partial metadata edits must not clear operator details');
  assert.equal(JSON.stringify(first.snapshot), snapshot);
  assert.equal(first.snapshot.pcccStatus, 'yes'); assert.equal(first.snapshot.owner.address, 'Địa chỉ mới');
  assert.equal(attempt(() => X.updateOwnerContractMeta(contract.id, { endDate: '1900-01-01' })).ok, false);
});

test('building staffing exposes cleaning and technical assignments at their effective dates', () => {
  const TH = boot(), { actions: X, q: Q } = TH;
  const cleaner = X.addEmployee({ name: 'Nhân viên vệ sinh mới', title: 'VỆ SINH', hireDate: '2026-09-01' });
  const technician = X.addEmployee({ name: 'Nhân viên kỹ thuật mới', title: 'KỸ THUẬT', hireDate: '2026-09-01' });
  X.assign({ employeeId: cleaner.id, buildingId: 'b_G1', responsibility: 'cleaning', from: '2026-09-30', reason: 'Bổ sung vệ sinh' });
  X.assign({ employeeId: technician.id, buildingId: 'b_G1', responsibility: 'tech', from: '2026-09-30', reason: 'Bổ sung kỹ thuật' });
  assert.equal(Q.buildingStaff('b_G1', '2026-09-29').cleaning.length, 0);
  assert.equal(Q.buildingStaff('b_G1', '2026-09-30').cleaning[0].employee.id, cleaner.id);
  assert.equal(Q.buildingStaff('b_G1', '2026-09-30').tech[0].employee.id, technician.id);
  assert.equal(attempt(() => X.assign({ employeeId: cleaner.id, buildingId: 'unknown', from: '2026-10-01', reason: 'Invalid' })).ok, false);
});

test('payroll keeps superseded versions, requires approval, and prevents duplicate closing expenses', () => {
  const TH = boot(), { store: S, actions: X, q: Q } = TH;
  const first = completePayroll(TH, '2026-09'), saved = JSON.stringify(first.lines);
  const next = X.computePayroll('2026-09');
  assert.equal(first.status, 'superseded'); assert.equal(JSON.stringify(first.lines), saved);
  assert.equal(Q.payrollRun('2026-09').id, next.id);
  assert.ok(Q.payrollVersions('2026-09').length >= 3);
  assert.equal(new Set(Q.payrollVersions('2026-09').map(r => r.id)).size, Q.payrollVersions('2026-09').length);
  assert.equal(attempt(() => X.closePayroll(first.id)).ok, false);
  next.lines.forEach(l => l.flags.forEach(f => X.approvePayFlag(next.id, l.employeeId + ':' + f.buildingId, 'Đã rà')));
  assert.match(attempt(() => X.closePayroll(next.id)).msg, /Duyệt bảng lương/);
  X.approvePayrollRun(next.id, 'Nguồn lương đã kiểm tra'); X.closePayroll(next.id);
  const expenses = S.all('expenses').length;
  assert.equal(attempt(() => X.closePayroll(next.id)).ok, false);
  assert.equal(S.all('expenses').length, expenses);
});

test('approval becomes stale when salary source changes, while future policy does not change a closed snapshot', () => {
  const TH = boot(), { store: S, actions: X } = TH;
  const run = completePayroll(TH, '2026-09');
  const employee = S.all('employees').find(e => e.status === 'active' && e.baseSalary > 0);
  X.updateEmployee(employee.id, { allowances: { ...employee.allowances, support: (employee.allowances?.support || 0) + 12345 } });
  assert.equal(X.payrollStale(run), true);
  assert.match(attempt(() => X.closePayroll(run.id)).msg, /Dữ liệu nguồn đã đổi/);
  const latest = completePayroll(TH, '2026-09'); X.closePayroll(latest.id);
  const frozen = JSON.stringify(latest.lines);
  X.saveSalaryPolicy({ department: 'finance', mode: 'fixed', formulaVersion: 'NEXT', effectiveFrom: '2026-10-01', status: 'proposed', requiredInputs: 'baseSalary', sourceRef: 'Phụ lục', reason: 'Kỳ sau' });
  assert.equal(JSON.stringify(latest.lines), frozen);
});

test('ownership versions and locked distributions survive later ratio changes', () => {
  const TH = boot(), { actions: X, q: Q } = TH;
  const locked = X.lockShareRun('b_G1', '2026-08', 'web'), frozen = JSON.stringify(locked);
  const ratios = Q.shareRatios('b_G1').map(r => ({ shareholderId: r.shareholderId, pct: r.pct }));
  X.setShareRatios('b_G1', ratios, '2026-10-01', 'Phụ lục tỷ lệ 01');
  const version = Q.shareOwnershipVersions('b_G1')[0], snapshot = JSON.stringify(version);
  X.setShareRatios('b_G1', ratios, '2026-11-01', 'Phụ lục tỷ lệ 02');
  assert.equal(JSON.stringify(version), snapshot);
  assert.equal(JSON.stringify(locked), frozen);
  assert.equal(locked.ownership.length, locked.rows.length);
  assert.equal(Q.shareOwnershipVersions('b_G1')[0].version, version.version + 1);
});
