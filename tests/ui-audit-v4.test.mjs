import test from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './_app.mjs';

test('UI-48 contract registry exposes seven views and immutable v1 snapshots', () => {
  const TH = boot(); const { store: S, q: Q, f: F } = TH;
  assert.equal(TH.routes.ROUTES.find(r => r.path === '/contracts')?.ui, 'UI-48');
  assert.equal(S.all('stayVersions').length, S.all('stays').length);
  assert.ok(S.all('stayVersions').every(v => v.version === 1 && v.terms && v.rates));
  const base = S.all('stays')[0], clone = (id, patch = {}) => S.add('stays', { ...base, id, code: id, status: 'active', endType: null, endDate: F.addDays(F.today(), 365), ...patch });
  const pending = clone('ct_pending');
  assert.equal(Q.contractState(pending), 'pending_signature');
  S.add('contractFiles', { stayId: pending.id, name: 'signed.pdf', signed: true, uploadedAt: F.nowISO() });
  assert.equal(Q.contractState(pending), 'active');
  const exp = clone('ct_exp', { endDate: F.addDays(F.today(), 10) }); S.add('contractFiles', { stayId: exp.id, name: 'signed.pdf', signed: true, uploadedAt: F.nowISO() });
  assert.equal(Q.contractState(exp), 'expiring');
  const ended = clone('ct_ended', { status: 'ended', endType: 'expired' }); assert.equal(Q.contractState(ended), 'ended');
  S.add('refunds', { stayId: ended.id, status: 'calculated' }); assert.equal(Q.contractState(ended), 'pending_settlement');
  const breach = clone('ct_breach', { status: 'ended', endType: 'breach' }); assert.equal(Q.contractState(breach), 'breach');
  assert.deepEqual(new Set(['all','pending_signature','active','expiring','pending_settlement','ended','breach']).size, 7);
});

test('debt aging uses debtBasis result and exact 30/31, 60/61, 90/91, 180/181 boundaries', () => {
  const TH = boot(); const { store: S, q: Q, f: F } = TH; const asOf = '2026-10-31';
  const stay = S.all('stays')[0]; const ages = [30,31,60,61,90,91,180,181];
  ages.forEach(age => { const issued = F.addDays(asOf, -(age + 4)); S.add('invoices', { id:'age_'+age, code:'AGE-'+age, stayId:stay.id, roomId:stay.roomId, buildingId:stay.buildingId, customerCode:stay.code, period:'2026-10', lifecycle:'issued', issueDate:issued, issuedAt:issued, dueFrom:issued, dueTo:F.addDays(issued,4), totalDue:age, lines:[] }); });
  const got = Object.fromEntries(Q.debtAging(asOf).filter(x => x.invoice.id.startsWith('age_')).map(x => [x.ageDays,x.bucket]));
  assert.deepEqual(got, { 30:'1-30',31:'31-60',60:'31-60',61:'61-90',90:'61-90',91:'91-180',180:'91-180',181:'181+' });
});

test('report export model is the official row 3–61 contract with policy metadata', () => {
  const TH = boot(); const m = TH.qr.exportModel('2026-08', 'business', 'excel');
  assert.equal(m.exportSpecVersion, 'report-export-v4');
  assert.equal(m.templateVersion, 'SRC-04-v1.13');
  assert.deepEqual(Array.from(m.headers), ['Dòng','Chỉ tiêu','TỔNG','NHÀ T','NHÀ S','NHÀ G']);
  assert.ok(m.rows.length > 0 && m.rows.every(r => r.row >= 3 && r.row <= 61 && r.values.length === 4));
  assert.equal(m.report.official, true);
  assert.ok(m.metadata.some(x => x[0] === 'Trạng thái nghiệp vụ' && x[1] === 'Đã xác nhận'));
});
