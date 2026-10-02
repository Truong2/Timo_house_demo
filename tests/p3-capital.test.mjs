import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

test('NT-9 initial capital source ledger is deduplicated and opening assets do not depreciate retroactively', () => {
  const t = boot(), r = t.q.capitalInitial('b_G1').result;
  assert.equal(Math.round(r.expense), 269906348); assert.equal(r.receipt, 104919000); assert.equal(Math.round(r.difference), -164987348);
  assert.equal(r.paid, 230400000); assert.equal(Math.round(r.received), 65412652); assert.equal(r.investment, 38862000);
  const record = t.data.p3.initial, duplicate = { ...record, lines: [...record.lines, ...record.assets.map(a => ({ id: a.id, dupOf: a.dupOf, expense: a.cost }))] };
  assert.equal(t.calc.capital.initial(duplicate).expense, r.expense);
  // GĐ-P3-03: mua 11/2025, ghi sổ web từ 10/2026 – T8 không có khấu hao web nhưng giá trị còn lại (84%) có trong mẫu số UI-41
  assert.equal(t.q.depOfPeriod('2026-08').byBuilding.b_G1 || 0, 0); assert.ok(Math.abs(t.q.assetNbv('b_G1', '2026-08') - 38862000 * 0.84) < 1); assert.equal(t.q.depOfPeriod('2026-08').total, 566080);
  assert.equal(t.store.get('ownerContracts', 'oc_G1').deposit, 48000000);
  const initial = t.q.depItems('2026-10').filter(a => a.source === 'initial');
  assert.equal(t.calc.depreciation.forPeriod(initial, '2026-10').total, 38862000 * 0.016);
});

test('P3-4 schedule follows UI-05 due date and effective ratios; CHUNG 4.8m; partial and soon flags', () => {
  const t = boot(), rows = t.q.capitalSchedule();
  const common = rows.find(l => l.shareholderId === 'sh_CHUNG' && l.from === '2026-10-01');
  assert.equal(common.due, 4800000); assert.equal(common.dueDate, '2026-10-05'); assert.equal(common.soon, true);
  assert.equal(rows.find(l => l.shareholderId === 'sh_CD-03' && l.from === '2026-09-01').paid, 1200000);
  assert.equal(rows.find(l => l.shareholderId === 'sh_CD-07' && l.from === '2026-09-01').paid, 0);
  t.auth.login('codong'); assert.ok(t.q.capitalSchedule().every(l => l.shareholderId === 'sh_CD-01' && l.buildingId === 'b_G1'));
  assert.equal(t.q.capitalSchedule({ sh: 'sh_CHUNG' }).length, 0);
});

test('P3-4 payout requires locked M, rejects excess, records and voids independent cash transactions; NT-2 unchanged', () => {
  const t = boot(), x = t.actions, s = t.store, before = t.qr.get('2026-08', 'total').cols.TOTAL.lnr;
  assert.ok(!attempt(() => x.recordPayout({ shareRunId: 'missing', shareholderId: 'sh_CD-01', amount: 1 })).ok);
  const run = x.lockShareRun('b_G1', '2026-08'), row = t.q.capitalPayouts().find(r => r.shareholderId === 'sh_CD-01');
  assert.ok(!attempt(() => x.recordPayout({ shareRunId: run.id, shareholderId: row.shareholderId, amount: row.due + 1 })).ok);
  const a = x.recordPayout({ shareRunId: run.id, shareholderId: row.shareholderId, amount: 1000000, date: '2026-09-29' });
  assert.equal(t.q.capitalPayouts().find(r => r.id === row.id).remaining, row.due - 1000000);
  x.voidShareTxn(a.id, 'Ghi sai'); assert.equal(t.q.capitalPayouts().find(r => r.id === row.id).remaining, row.due);
  assert.equal(t.qr.get('2026-08', 'total').cols.TOTAL.lnr, before); assert.equal(s.get('shareRuns', run.id).totals.M, 62672849);
  assert.equal(t.q.shareBase('b_G1', '2026-08', 'excel').rent + Math.round(t.q.shareBase('b_G1', '2026-08', 'excel').lnr), 62664969);
});

test('P3-4 withdrawal limited to net contributions; cannot void contribution already withdrawn', () => {
  const t = boot(), x = t.actions, l = t.q.capitalSchedule().find(l => l.from === '2026-10-01' && l.shareholderId === 'sh_CD-01');
  const a = x.recordContribution({ ...l, amount: l.due, date: '2026-09-29' });
  x.recordWithdrawal({ ...l, amount: 1000000, date: '2026-09-29', reason: 'Chuyển kỳ' });
  assert.ok(!attempt(() => x.voidShareTxn(a.id, 'Ghi sai')).ok);
  assert.ok(!attempt(() => x.recordWithdrawal({ ...l, amount: l.due, reason: 'x' })).ok);
  t.auth.login('codong'); assert.ok(!attempt(() => x.recordContribution({ ...l, amount: 1 })).ok);
  t.auth.login('admin'); t.ms.set('2'); assert.ok(!attempt(() => x.recordContribution({ ...l, amount: 1 })).ok);
});

test('NT-0 after P3-4', () => { const t = boot({ pages: true }); assert.deepEqual(Array.from(t.pages.acceptance().filter(r => !r.ok), r => r.name), []); });

test('P3-4 relocking a share run retains cash paid against its old version and never allows a second full payout', () => {
  const t = boot(), s = t.store, x = t.actions, run = x.lockShareRun('b_G1', '2026-08'), h = run.rows.find(h => h.id === 'sh_CD-01');
  x.recordPayout({ shareRunId: run.id, shareholderId: h.id, amount: h.M, date: '2026-09-29' });
  s.update('periods', '2026-08', { history: [{ type: 'reopen' }] });
  const next = x.lockShareRun('b_G1', '2026-08'), row = t.q.capitalPayouts().find(r => r.shareholderId === h.id);
  assert.equal(next.version, 2); assert.equal(row.paid, h.M); assert.equal(row.remaining, 0);
  assert.ok(!attempt(() => x.recordPayout({ shareRunId: next.id, shareholderId: h.id, amount: 1 })).ok);
  assert.equal(s.all('shareTxns').filter(t => t.kind === 'payout').length, 1);
  assert.ok(!attempt(() => x.recordPayout({ shareRunId: run.id, shareholderId: h.id, amount: 1 })).ok);
});

test('P3-4 lịch góp: kỳ đã do vốn ban đầu chi trả (coveredTo) không sinh dòng phải góp; không có vốn ban đầu thì lấy đủ kỳ (không mốc ngày cứng)', () => {
  const t = boot(), q = t.q, s = t.store;
  const lines = q.capitalSchedule({ building: 'b_G1' }); assert.equal(lines.length, 11 * 9); assert.ok(lines.every(l => l.from >= '2026-02-01'), 'T1 do vốn ban đầu chi trả');
  const ci = s.one('capitalInitial', c => c.buildingId === 'b_G1'); assert.equal(ci.coveredTo, '2026-01');
  s.update('capitalInitial', ci.id, { coveredTo: null });
  const all = q.capitalSchedule({ building: 'b_G1' }); assert.equal(all.length, 12 * 9); assert.equal(all.filter(l => l.from === '2026-01-01').length, 9);
});
