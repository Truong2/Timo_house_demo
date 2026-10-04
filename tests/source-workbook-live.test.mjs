import test from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt, completePayroll } from './_app.mjs';

test('source workbook – hồ sơ pháp lý và hợp đồng chủ nhà tạo phiên bất biến', () => {
  const TH = boot(); const { store: S, q: Q, actions: X } = TH;
  const oc = S.all('ownerContracts')[0], before = Q.ownerContractVersions(oc.id)[0];
  assert.equal(before.version, 1);
  assert.equal(before.snapshot.terms, '');

  X.updateOwnerContractMeta(oc.id, { effectiveFrom: '2026-09-29', holdPriceTo: '2028-12-31', terms: 'Thuế và PCCC theo phụ lục 01', operatorName: 'Timehouse', sourceRef: 'SRC-WORKBOOK-LIVE', reason: 'Chuẩn hóa field-level' });
  const versions = Q.ownerContractVersions(oc.id);
  assert.equal(versions.length, 2);
  assert.equal(versions[0].version, 2);
  assert.equal(versions[0].snapshot.terms, 'Thuế và PCCC theo phụ lục 01');
  assert.equal(versions[1].snapshot.terms, '', 'snapshot v1 không bị ghi đè');

  const first = X.saveBuildingLegalRecord({ buildingId: oc.buildingId, kind: 'pccc', status: 'valid', number: 'PCCC-01', issuedAt: '2026-01-01', expiresAt: '2027-01-01', effectiveFrom: '2026-09-29', sourceRef: 'Hồ sơ PCCC gốc', note: 'Đã đối chiếu' });
  assert.match(attempt(() => X.saveBuildingLegalRecord({ id: first.id, buildingId: oc.buildingId, kind: 'pccc', status: 'valid', effectiveFrom: '2026-09-29', sourceRef: 'Cùng ngày' })).msg, /phải sau phiên hiện tại/);
  assert.equal(attempt(() => X.saveBuildingLegalRecord({ buildingId: oc.buildingId, kind: 'red_book', status: 'pending', effectiveFrom: '2026-09-29' })).ok, false, 'hồ sơ phải có nguồn/căn cứ');
  const second = X.saveBuildingLegalRecord({ id: first.id, buildingId: oc.buildingId, kind: 'pccc', status: 'valid', number: 'PCCC-02', issuedAt: '2026-10-01', expiresAt: '2027-10-01', effectiveFrom: '2026-10-01', sourceRef: 'Phụ lục PCCC', reason: 'Cấp lại giấy phép' });
  assert.equal(first.number, 'PCCC-01');
  assert.equal(S.get('buildingLegalRecords', first.id).effectiveTo, '2026-09-30');
  assert.equal(Q.legalRecords(oc.buildingId, '2026-09-30')[0].number, 'PCCC-01');
  assert.equal(Q.legalRecords(oc.buildingId, '2026-10-01')[0].number, 'PCCC-02');
  assert.equal(second.version, 2);
});

test('source workbook – năm phòng ban có policy và payrollRun đóng băng policy snapshot', () => {
  const TH = boot(); const { store: S, q: Q, actions: X } = TH;
  const departments = new Set(Q.salaryPolicies('2026-09-30').map(p => p.department));
  assert.deepEqual([...departments].sort(), ['finance', 'market', 'operations', 'sales', 'technical']);
  assert.ok(Q.salaryPolicies('2026-09-30').every(p => p.status === 'confirmed' && p.formulaVersion && p.sourceRef));

  const run = completePayroll(TH, '2026-09');
  assert.equal(run.salaryPolicySnapshot.length, 5);
  X.closePayroll(run.id);
  const frozen = JSON.stringify(S.get('payrollRuns', run.id).salaryPolicySnapshot);
  X.saveSalaryPolicy({ department: 'finance', mode: 'fixed', formulaVersion: 'FINANCE-FIXED-v2', effectiveFrom: '2026-10-01', status: 'proposed', requiredInputs: 'baseSalary, allowances', sourceRef: 'OQ-PAYROLL-FIN', reason: 'Chờ khách xác nhận chính sách mới' });
  assert.equal(JSON.stringify(S.get('payrollRuns', run.id).salaryPolicySnapshot), frozen, 'policy mới không đổi kỳ đã chốt');

  const draft = X.computePayroll('2026-10');
  assert.equal(draft.lines.find(l => l.department === 'finance').salaryPolicy.status, 'proposed');
  assert.match(attempt(() => X.closePayroll(draft.id)).msg, /chính sách lương đã xác nhận/);
});

test('source workbook – dealRows trả đủ field-level và bộ lọc dùng cùng model export', () => {
  const TH = boot(); const { q: Q, f: F } = TH;
  const rows = Q.dealRows(); assert.ok(rows.length > 0);
  const x = rows[0];
  for (const key of ['deal', 'customer', 'room', 'building', 'manager', 'phone', 'depositRequired', 'depositHeld', 'depositRemaining', 'collect', 'paidState', 'sales', 'commissionAmount', 'commissionStatus', 'dealKind']) assert.ok(Object.hasOwn(x, key), 'thiếu ' + key);
  assert.equal(x.manager?.id || null, Q.managerOf(x.deal.buildingId, x.deal.closeDate)?.id || null);
  assert.equal(Q.dealRows({ period: F.period(x.deal.closeDate) }).every(r => F.period(r.deal.closeDate) === F.period(x.deal.closeDate)), true);
  assert.equal(Q.dealRows({ status: x.deal.status }).every(r => r.deal.status === x.deal.status), true);
  assert.ok(Q.dealRows({ q: x.room.code }).some(r => r.deal.id === x.deal.id));
});

test('source workbook – ngày đầu thành nợ thuộc bucket 1–30, trước đó là chưa đến hạn', () => {
  const TH = boot(); const { store: S, q: Q, f: F } = TH, asOf = '2026-10-31';
  const stay = S.all('stays')[0], issued = F.addDays(asOf, -5);
  S.add('invoices', { id: 'age_day_1', code: 'AGE-DAY-1', stayId: stay.id, roomId: stay.roomId, buildingId: stay.buildingId, customerCode: stay.code, period: '2026-10', lifecycle: 'issued', issueDate: issued, issuedAt: issued, dueFrom: issued, dueTo: F.addDays(issued, 4), totalDue: 1, lines: [] });
  const row = Q.debtAging(asOf).find(x => x.invoice.id === 'age_day_1');
  assert.equal(row.ageDays, 1);
  assert.equal(row.bucket, '1-30');
  assert.equal(Q.debtAging(F.addDays(asOf, -1)).find(x => x.invoice.id === 'age_day_1').bucket, 'not_due');
});
