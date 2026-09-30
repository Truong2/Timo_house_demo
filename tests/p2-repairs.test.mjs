/* Phase 2 – Đợt 2: sổ sửa chữa & ứng chi vật tư (UI-47). Kịch bản docs/uat/Phase2_Kich_ban_kiem_thu.md F25, NT-5, NT-6, K-6. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';
import { load, fixture } from './_load.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));

const W1 = 'emp_NV94361688', W2 = 'emp_NV01060895';

test('F25 – domain: kỳ sổ 26 → 25, lương thợ, quyết toán ứng chi', () => {
  const R = load().calc.repairs;
  assert.equal(R.periodOf('2026-07-26'), '2026-08'); assert.equal(R.periodOf('2026-08-25'), '2026-08'); assert.equal(R.periodOf('2026-08-26'), '2026-09'); assert.equal(R.periodOf('2026-12-27'), '2027-01');
  assert.deepEqual(plain(R.window('2026-08')), ['2026-07-26', '2026-08-25']);
  assert.equal(R.workerPay({ base: 7500000, seniority: 3000000, labor: 13300000, lunch: 700000 }), 24500000);
  assert.equal(R.settlement(8231000, 10000000), -1769000);
  assert.equal(R.classifyBearer('Khách chi'), 'tenant'); assert.equal(R.classifyBearer('chủ nhà hỗ trợ 50%'), 'owner'); assert.equal(R.classifyReason('kh phá hd'), 'breach');
});

test('F25.1 / F25.2 – NT-5, NT-6: sổ T8 như Excel khớp SRC-16; chế độ web cảnh báo dòng ngoài kỳ (K-6)', () => {
  const TH = boot({ user: 'ketoan' }); const Q = TH.q;
  const a = Q.repairSettlement(W1, '2026-08', 'excel');
  assert.deepEqual([a.count, a.labor, a.material, a.pay, a.advance, a.diff], [98, 13300000, 8231000, 24500000, 10000000, -1769000]);
  const b = Q.repairSettlement(W2, '2026-08', 'excel');
  assert.deepEqual([b.count, b.labor, b.material, b.pay, b.advance, b.diff], [135, 10050000, 13750000, 21250000, 10000000, 3750000]);
  // chế độ web: thợ 1 mọi dòng trong kỳ; thợ 2 có 53 dòng ngoài 26/07–25/08 (12 trước, 40 sau, 1 ngày 08/10)
  const aw = Q.repairSettlement(W1, '2026-08', 'web'); assert.equal(aw.count, 98); assert.equal(aw.outside, 0);
  const L = Q.repairLedger('2026-08', { workerId: W2 });
  assert.equal(L.outside.length, 53); assert.equal(L.rows.length, 82);
  assert.deepEqual([L.totals.labor, L.totals.material], [5550000, 7025000]);
  assert.equal(L.outside.filter(r => r.date < '2026-07-26').length, 12);
  assert.ok(L.outside.some(r => r.date === '2026-10-08'));
  const fx = fixture('repairs-2026-08-p2.json'); assert.equal(fx.workers.length, 2);
});

test('F25.3 / F25.4 – kỹ thuật nhập việc của mình; ⛔ ngày ngoài kỳ phải ghi lý do; ⛔ không xác nhận', async (t) => {
  const TH = boot({ user: 'kythuat' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const b = S.get('buildings', 'b_T21');
  await t.test('thêm việc: thợ = chính mình, nháp, kỳ theo ngày', () => {
    const r = X.addRepair({ workerId: W2, date: '2026-09-10', buildingId: b.id, desc: 'Thay vòi sen', jobType: 'water', labor: 100000, material: 150000 });
    assert.equal(r.workerId, W1, 'kỹ thuật không ghi hộ thợ khác'); assert.equal(r.period, '2026-09'); assert.equal(r.status, 'draft');
  });
  await t.test('⛔ ngày 27/09 ghi vào kỳ 09 (thuộc kỳ 10) không có lý do', () => {
    const r = attempt(() => X.addRepair({ date: '2026-09-27', period: '2026-09', buildingId: b.id, desc: 'Sơn tường', jobType: 'paint', labor: 200000 }));
    assert.ok(!r.ok);
    const ok = X.addRepair({ date: '2026-09-27', period: '2026-09', periodReason: 'Việc giao từ 24/09, làm xong 27/09', buildingId: b.id, desc: 'Sơn tường', jobType: 'paint', labor: 200000 });
    assert.equal(ok.period, '2026-09');
  });
  await t.test('⛔ thiếu tiền / nội dung; ⛔ kỹ thuật không xác nhận; chỉ thấy việc của mình', () => {
    assert.ok(!attempt(() => X.addRepair({ date: '2026-09-10', buildingId: b.id, desc: '', jobType: 'water' })).ok);
    assert.ok(!attempt(() => X.confirmRepairs(S.where('repairLogs', r => r.status === 'draft').map(r => r.id))).ok);
    const mine = Q.repairsScoped(S.all('repairLogs'));
    assert.ok(mine.length && mine.every(r => r.workerId === W1));
    assert.ok(!TH.auth.can('payments.view') && !TH.auth.can('invoices.view'));
  });
});

test('F25.5 / F25.6 / F25.7 – xác nhận: chủ nhà chịu → bù trừ trả chủ nhà; khách chi → đề xuất trừ cọc (áp khi xác nhận); tiền công → lương + dòng 41; chốt kỳ sổ → vật tư dòng 41', async (t) => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  // phòng có phiếu hoàn nháp: kết thúc hết hạn một lượt thuê đang ở
  const st = S.all('stays').find(s => s.status === 'active' && s.buildingId === 'b_T21' && X.depositBalance(s.id) > 500000);
  X.endStay(st.id, { endType: 'expired', date: '2026-09-28' });
  const rf = S.one('refunds', r => r.stayId === st.id);
  const b = Q.building('b_T21');
  const opBefore = S.all('ownerPayments').filter(o => o.buildingId === b.id).reduce((t, o) => t + (o.paid || 0), 0);
  const rT = X.addRepair({ workerId: W1, date: '2026-09-10', buildingId: b.id, roomId: st.roomId, desc: 'Thay khóa cửa – khách làm hỏng', jobType: 'replace', labor: 50000, material: 250000, bearer: 'tenant' });
  const rO = X.addRepair({ workerId: W1, date: '2026-09-11', buildingId: b.id, desc: 'Thay bơm tầng thượng', jobType: 'water', labor: 100000, material: 900000, bearer: 'owner' });
  const rC = X.addRepair({ workerId: W1, date: '2026-09-12', buildingId: b.id, desc: 'Sửa ổ cắm', jobType: 'electric', labor: 120000, material: 30000, bearer: 'company' });
  await t.test('xác nhận 3 dòng', () => { assert.equal(X.confirmRepairs([rT.id, rO.id, rC.id]), 3); });
  await t.test('chủ nhà chịu → kỳ trả chủ nhà được bù trừ 1.000.000', () => {
    const after = S.all('ownerPayments').filter(o => o.buildingId === b.id).reduce((t, o) => t + (o.paid || 0), 0);
    assert.equal(after - opBefore, 1000000);
    assert.ok(S.all('ownerPayments').some(o => (o.offsets || []).some(x => x.repairId === rO.id)));
  });
  await t.test('khách chi → chỉ là đề xuất; áp → phiếu hoàn thêm dòng sửa chữa 300.000', () => {
    const bc0 = S.get('refunds', rf.id).bc;
    assert.equal(S.get('repairLogs', rT.id).tenantCharge.status, 'suggested');
    assert.equal(S.get('refunds', rf.id).bc, bc0, 'chưa áp thì phiếu hoàn không đổi');
    X.applyRepairToRefund(rT.id);
    assert.equal(S.get('refunds', rf.id).bc, bc0 + 300000);
    assert.equal(S.get('repairLogs', rT.id).tenantCharge.status, 'applied');
    assert.ok(!attempt(() => X.applyRepairToRefund(rT.id)).ok, 'không áp hai lần');
  });
  await t.test('tiền công theo sổ → lương thợ kỳ 09 đủ mọi việc; chi phí dòng 41 chỉ việc công ty + khách chịu (chủ nhà đã bù trừ – A2); kỳ song song 08 không lấy', () => {
    const pv = X.previewPayroll('2026-09');
    const line = pv.lines.find(l => l.employeeId === W1);
    assert.equal(line.labor, 50000 + 100000 + 120000);
    const lab = pv.buildingCosts.filter(c => c.source === 'ledger' && c.buildingId === b.id && c.line === 'repair');
    assert.equal(lab.reduce((t, c) => t + c.amount, 0), 50000 + 120000, 'tiền công việc chủ nhà chịu không thành chi phí công ty');
    assert.equal(X.repairLaborCosts('2026-08').length, 0);
  });
  await t.test('chốt kỳ sổ 09: vật tư công ty + khách chịu → chi phí "Sửa chữa" dòng 41 (khách chịu thu hồi qua cọc); ⛔ kỳ 08 song song', () => {
    assert.ok(!attempt(() => X.postRepairPeriod('2026-08')).ok);
    const exps = X.postRepairPeriod('2026-09');
    const e = exps.find(x => x.buildingId === b.id);
    assert.equal(e.reportLine, 'repair'); assert.equal(e.amount, 30000 + 250000, 'vật tư công ty + khách chịu, không gồm chủ nhà chịu');
    assert.ok(S.get('repairLogs', rC.id).posted);
  });
});

test('NT-0 – Phase 1 không đổi sau Đợt 2: bộ nghiệm thu trong app (T8 lương 98/101, báo cáo tổng, LNR kinh doanh, T9 1.471 hóa đơn)', () => {
  const TH = boot({ user: 'admin', pages: true });
  const acc = TH.pages.acceptance();
  assert.deepEqual(plain(acc.filter(a => !a.ok).map(a => a.name + ' → ' + a.detail)), []);
});
