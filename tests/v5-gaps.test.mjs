import test from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt, completePayroll } from './_app.mjs';

test('v5 report SpreadsheetML uses the shared pure export builder', () => {
  const TH = boot({ kit: true });
  for (const type of ['total', 'business']) {
    const model = TH.qr.exportModel('2026-08', type, 'excel');
    const xml = TH.kit.xlsReportXml(model);
    assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    assert.match(xml, /application\/vnd\.ms-excel|Excel\.Sheet/);
    assert.match(xml, /<FreezePanes\/>/);
    assert.match(xml, /<Column ss:Width="42"\/><Column ss:Width="260"\/><Column ss:Width="95" ss:Span="3"\/>/);
    assert.match(xml, /<Style ss:ID="money"><NumberFormat ss:Format="#,##0;\[Red\]-#,##0"\/>/);
    assert.match(xml, /<Style ss:ID="ratio"><NumberFormat ss:Format="0\.00%"\/>/);
    assert.ok(model.rows.every(r => r.row >= 3 && r.row <= 61));
    assert.ok(model.rows.some(r => r.group) && model.rows.some(r => r.bold));
    assert.ok(model.metadata.some(m => m[0] === 'Trạng thái nghiệp vụ'));
    assert.doesNotMatch(xml, /<Formula|#REF!|#VALUE!/);
    assert.equal((xml.match(/ss:Type="Number"/g) || []).length > model.rows.length, true);
  }
});

test('v5 issued invoice freezes template and account print snapshot', () => {
  const TH = boot(); const { store: S, actions: X, q: Q } = TH;
  const source = S.all('invoices').find(i => i.lifecycle !== 'draft');
  const draft = S.add('invoices', { ...source, id: 'inv_v5_snapshot', code: 'INV-V5-SNAPSHOT', period: '2026-10', lifecycle: 'draft', issuedAt: null, issuedBy: null, snapshot: null, printSnapshot: null,
    issueDate: '2026-10-01', cutoff: '2026-09-25', dueFrom: '2026-10-01', dueTo: '2026-10-05', oldDebtFrom: [], carriedOut: 0, carriedTo: null });
  X.setInvoiceTemplate(draft.id, 'TECH');
    const rate = Q.rateOf(draft.stayId, '2026-10-01');
    S.update('invoices', draft.id, { rateVersionId: rate.id });
  const issued = X.issueInvoices([draft.id]); assert.equal(issued.issued, 1);
  const frozen = Q.invoice(draft.id), snap = { ...frozen.printSnapshot };
    const frozenRate = JSON.stringify(frozen.snapshot.rate);
    assert.equal(frozen.snapshot.rateVersionId, rate.id);
    assert.equal(frozen.snapshot.rate.id, rate.id);
    S.update('rateVersions', rate.id, { note: 'Changed after issue' });
    assert.equal(JSON.stringify(frozen.snapshot.rate), frozenRate, 'issued service prices must retain their source version');
  assert.equal(snap.template, 'TECH'); assert.ok(snap.templateVersion && snap.number && snap.bank && snap.holder);
  const oldAccount = Q.account(snap.accountId);
  const next = X.saveAccount({ id: oldAccount.id, template: 'TECH', bank: 'Ngân hàng mới', number: '9988 776655', holder: 'Chủ mới', effectiveFrom: '2026-10-02', sourceRef: 'V5-ACCOUNT-TEST' });
  assert.notEqual(next.id, oldAccount.id, 'tài khoản đã dùng phải tạo phiên mới');
  assert.equal(Q.invoice(draft.id).printSnapshot.number, snap.number);
  const print = TH.calc.billing.printModel(Q.invoice(draft.id), { snapshot: Q.invoice(draft.id).printSnapshot, customerCode: draft.customerCode, roomCode: Q.roomCode(draft.roomId) });
  assert.match(print.accountLine, new RegExp(snap.number.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(print.accountLine, /9988 776655/);
  const nextStay = S.all('stays').find(s => s.id !== draft.stayId);
  const afterVersion = S.add('invoices', { ...source, id: 'inv_v5_effective_account', code: 'INV-V5-EFFECTIVE', stayId: nextStay.id, roomId: nextStay.roomId, customerId: nextStay.customerId,
    period: '2026-10', lifecycle: 'draft', template: 'TECH', accountId: oldAccount.id, issueDate: '2026-10-03', issuedAt: null, issuedBy: null, snapshot: null, printSnapshot: null, oldDebtFrom: [], carriedOut: 0, carriedTo: null });
  assert.equal(X.issueInvoices([afterVersion.id]).issued, 1);
  assert.equal(Q.invoice(afterVersion.id).printSnapshot.accountId, next.id, 'phát hành phải tự lấy phiên tài khoản hiệu lực, không giữ ID cũ của draft');
});

test('v5 payroll obligations, installments and reversal do not duplicate expenses', () => {
  const TH = boot(); const { store: S, actions: X, q: Q, f: F } = TH;
  const building = S.all('buildings')[0];
  X.addPayrollManual({ period: '2026-09', kind: 'building_salary', buildingId: building.id, line: 'sal_clean', amount: 1200000, note: 'Người nhận ngoài' });
  const run = completePayroll(TH, '2026-09'); X.closePayroll(run.id);
  const closed = S.get('payrollRuns', run.id), summary = Q.payrollDisbursementSummary(run.id);
  assert.equal(closed.status, 'closed'); assert.ok(closed.obligations.length > closed.lines.length);
  assert.equal(closed.obligations.filter(o => o.kind === 'external').reduce((t, o) => t + o.amount, 0), 1200000);
  assert.equal(closed.obligations.some(o => o.source === 'repair'), false, 'tiền công đã nằm trong X không tạo nghĩa vụ lần hai');
  assert.equal(summary.total, closed.lines.reduce((t, l) => t + Math.round(l.X), 0) + 1200000);
  const obligation = summary.rows.find(o => o.kind === 'employee' && o.amount > 1), beforeExpenses = S.all('expenses').length, part = Math.floor(obligation.amount / 2);
  const paid = X.recordPayrollDisbursement(obligation.id, { amount: part, date: '2026-09-29', method: 'bank', reference: 'UNC-V5', evidence: 'TL-V5' });
  assert.equal(Q.payrollDisbursementSummary(run.id, obligation.id).obligation.status, 'partial');
  assert.equal(S.all('expenses').length, beforeExpenses, 'giải ngân không tạo lại chi phí');
  assert.equal(attempt(() => X.recordPayrollDisbursement(obligation.id, { amount: obligation.amount, date: '2026-09-29', method: 'bank' })).ok, false);
  S.update('periods', '2026-10', { status: 'closed' });
  assert.equal(attempt(() => X.recordPayrollDisbursement(obligation.id, { amount: 1, date: '2026-10-01', method: 'cash' })).ok, false);
  X.voidPayrollDisbursement(paid.id, 'Sai tài khoản chi');
  assert.equal(Q.payrollDisbursementSummary(run.id, obligation.id).obligation.remaining, obligation.amount);
  assert.equal(S.get('payrollDisbursements', paid.id).status, 'void');
  const audit = S.where('auditLog', a => a.entity === 'payrollDisbursement' && a.entityId === paid.id).at(-1);
  assert.equal(audit.reason, 'Sai tài khoản chi'); assert.ok(audit.before && audit.after);
  assert.equal(S.all('expenses').length, beforeExpenses);
  assert.equal(F.period(paid.paidAt), paid.period);
  TH.auth.login('vanhanh');
  assert.equal(attempt(() => X.recordPayrollDisbursement(obligation.id, { amount: 1, date: '2026-09-29', method: 'cash' })).ok, false, 'vận hành không được ghi chi lương');
});

test('v5 payroll disbursement evidence uses the existing document store', () => {
  const TH = boot(); const { store: S, actions: X, q: Q } = TH;
  const run = completePayroll(TH, '2026-09'); X.closePayroll(run.id);
  const obligation = Q.payrollDisbursementSummary(run.id).rows.find(o => o.kind === 'employee' && o.amount > 0 && (run.lines.find(l => l.employeeId === o.employeeId)?.buildings || []).length);
  const line = run.lines.find(l => l.employeeId === obligation.employeeId), buildingId = line.buildings[0].buildingId;
  const disbursement = X.recordPayrollDisbursement(obligation.id, { amount: 1, date: '2026-09-29', method: 'cash', reference: 'V5-DOC' });
  const doc = X.uploadDocument({ type: 'voucher', name: 'chi-luong-v5.pdf', size: 1024, buildingId, objectType: 'payrollDisbursement', objectId: disbursement.id });
  assert.equal(doc.objectType, 'payrollDisbursement'); assert.equal(doc.objectId, disbursement.id);
  assert.match(Q.docObjectHref(doc), /tab=chi-luong/);
  assert.equal(attempt(() => X.deleteDocument(doc.id, 'x')).ok, false);
});
