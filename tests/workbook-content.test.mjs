import test from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './_app.mjs';

test('workbook fields persist for building and owner contract with field-level audit', () => {
  const TH = boot(); const { store: S, actions: X, q: Q } = TH;
  const b = S.all('buildings')[0], oc = S.one('ownerContracts', x => x.buildingId === b.id);
  X.updateBuildingProfile(b.id, { floorAreaM2: 1234, businessRegistration: 'ĐKKD-01 · PCCC-01', features: 'Thang máy · máy bơm', operatedFrom: '2024-02-01' });
  X.updateOwnerContractMeta(oc.id, { holdPriceTo: '2028-12-31', terms: 'Thuế và PCCC theo phụ lục 01', operatorName: 'Timehouse', operatorPhone: '0901000000', operatorIdNo: '010101010101', buildingFeatures: 'Bàn giao đủ thiết bị', businessRegistration: 'PCCC-01', sourceRef: 'SRC-WORKBOOK', note: 'Đã đối chiếu', reason: 'Nghiệm thu workbook' });
  assert.equal(Q.building(b.id).floorAreaM2, 1234);
  assert.equal(Q.building(b.id).businessRegistration, 'ĐKKD-01 · PCCC-01');
  assert.equal(S.get('ownerContracts', oc.id).operator.name, 'Timehouse');
  assert.equal(S.get('ownerContracts', oc.id).holdPriceTo, '2028-12-31');
  const audit = S.where('auditLog', a => a.entity === 'ownerContract' && a.entityId === oc.id).at(-1);
  assert.equal(audit.reason, 'Nghiệm thu workbook'); assert.equal(audit.sourceRef, 'SRC-WORKBOOK'); assert.ok(audit.before && audit.after);
});

test('shared scope, invoice/refund filters and department use effective-date data', () => {
  const TH = boot(); const { store: S, q: Q } = TH;
  const invoice = S.all('invoices').find(i => i.lifecycle !== 'draft' && Q.invState(i, '2026-09-29').remaining > 0), manager = Q.managerOf(invoice.buildingId, '2026-09-29'), leader = manager && Q.leaderOf(manager.id, '2026-09-29');
  assert.ok(Q.scopeBuildingIds({ building: invoice.buildingId }, '2026-09-29').has(invoice.buildingId));
  if (leader) assert.ok(Q.scopeBuildingIds({ leader: leader.id }, '2026-09-29').has(invoice.buildingId));
  S.update('invoices', invoice.id, { dueFrom: '2026-09-05', dueTo: '2026-09-05' });
  const overdue = Q.invoiceRows({ period: invoice.period, building: invoice.buildingId, dueStatus: 'overdue', dueFrom: '2026-09-05', dueTo: '2026-09-05', asOf: '2026-09-29' });
  assert.ok(overdue.some(x => x.invoice.id === invoice.id)); assert.ok(overdue.every(x => x.manager && x.dueDate === '2026-09-05'));
  const refund = S.all('refunds')[0]; S.update('refunds', refund.id, { handoverDate: '2026-09-10', paidAt: '2026-09-20', status: 'paid' });
  assert.ok(Q.refundRows({ building: refund.buildingId, dateBasis: 'handoverDate', from: '2026-09-10', to: '2026-09-10' }).some(x => x.refund.id === refund.id));
  assert.ok(Q.refundRows({ building: refund.buildingId, dateBasis: 'paidAt', from: '2026-09-20', to: '2026-09-20' }).some(x => x.refund.id === refund.id));
  const employee = S.all('employees')[0];
  assert.equal(typeof Q.departmentOf(employee.id, '2026-09-29'), 'string');
  TH.auth.login('vanhanh'); const allowed = TH.auth.buildingScope();
  assert.ok(Q.invoiceRows({ period: invoice.period }).every(x => allowed.has(x.buildingId)), 'selector hóa đơn phải giữ phạm vi RBAC');
  assert.ok(Q.refundRows({}).every(x => allowed.has(x.buildingId)), 'selector hoàn cọc phải giữ phạm vi RBAC');
});

test('service margin stays proposed and traces invoice/expense sources', () => {
  const TH = boot(); const { store: S, q: Q } = TH;
  const inv = S.all('invoices').find(i => i.period === '2026-09' && i.lifecycle !== 'draft'); assert.ok(inv);
  S.add('expenses', { code: 'CP-DV-TEST', period: '2026-09', date: '2026-09-15', buildingId: inv.buildingId, scope: 'building', category: 'util_internet', reportLine: 'cost_net', amount: 123456, status: 'confirmed' });
  const excel = Q.utilityMargin('2026-09', 'service', 'excel', { building: inv.buildingId });
  assert.equal(excel.status, 'no_data'); assert.equal(excel.policyStatus, 'proposed');
  const web = Q.utilityMargin('2026-09', 'service', 'web', { building: inv.buildingId });
  assert.equal(web.policyStatus, 'proposed'); assert.equal(web.rows.length, 1);
  assert.ok(web.rows[0].invoices.length); assert.ok(web.rows[0].expenses.length); assert.equal(web.rows[0].net, web.rows[0].collected - web.rows[0].cost);
});
