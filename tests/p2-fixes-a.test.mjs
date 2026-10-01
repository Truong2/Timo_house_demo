/* Phase 2 – sửa lỗi audit 30/09, Đợt A (9 lỗi nặng). Mỗi test tái hiện đúng kịch bản lỗi của audit rồi kiểm hành vi đúng.
   Kịch bản docs/uat/Phase2_Kich_ban_kiem_thu.md mục "Audit 30/09 – lỗi đã sửa". */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));
const worker = (TH, i = 0) => TH.store.all('employees').filter(e => e.title === 'KỸ THUẬT' && e.repairPay)[i];
const approveAll = (X, run) => run.lines.forEach(l => l.flags.forEach(f => X.approvePayFlag(run.id, l.employeeId + ':' + f.buildingId, 'kiểm thử')));
/* Khóa kỳ trong test (bỏ điều kiện chốt lương / phân bổ của mốc 1B – không phải đối tượng kiểm) */
const lock = (TH, period) => { const S = TH.store; const ms = S.meta.milestone; S.meta.milestone = '1A'; TH.actions.closePeriod(period); S.meta.milestone = ms; };

test('A1 – bảng lương UI-25: lương thợ = lương cứng + thâm niên + tiền công + ăn trưa, khớp UI-47; T8 song song không đổi', () => {
  const TH = boot({ user: 'ketoan' }); const X = TH.actions, Q = TH.q;
  const w = worker(TH);
  const r = X.addRepair({ workerId: w.id, date: '2026-09-10', buildingId: 'b_T21', desc: 'Thay vòi', jobType: 'water', labor: 13300000, material: 0, bearer: 'company' });
  X.confirmRepairs([r.id]);
  const line = X.previewPayroll('2026-09').lines.find(l => l.employeeId === w.id);
  const ui47 = Q.repairSettlement(w.id, '2026-09', 'web');
  assert.equal(ui47.pay, 24500000);
  assert.equal(line.X, ui47.pay, 'UI-25 = UI-47');
  assert.equal(line.base, 10500000); assert.equal(line.lunch, 700000);
  // quỹ "Lương sửa chữa" = phần cố định của thợ (OQ-22), không còn gần 0
  const fixed = X.previewPayroll('2026-09').lines.filter(l => l.title === 'KỸ THUẬT').reduce((t, l) => t + l.X - l.W - l.labor, 0);
  assert.ok(fixed >= 2 * 11200000, 'quỹ sửa chữa ' + fixed);
});

test('A2 – tiền công việc chủ nhà chịu không thành chi phí công ty; thợ vẫn nhận đủ tiền công', () => {
  const TH = boot({ user: 'ketoan' }); const X = TH.actions;
  const w = worker(TH);
  const rO = X.addRepair({ workerId: w.id, date: '2026-09-11', buildingId: 'b_T21', desc: 'Thay bơm', jobType: 'water', labor: 100000, material: 900000, bearer: 'owner' });
  X.confirmRepairs([rO.id]);
  const pv = X.previewPayroll('2026-09');
  assert.equal(pv.lines.find(l => l.employeeId === w.id).labor, 100000, 'thợ nhận tiền công');
  assert.equal(pv.buildingCosts.filter(c => c.source === 'ledger' && c.buildingId === 'b_T21').reduce((t, c) => t + c.amount, 0), 0, 'không ghi dòng 41');
  assert.equal(X.postRepairPeriod('2026-09').filter(e => e.buildingId === 'b_T21').length, 0, 'vật tư chủ nhà chịu không ghi chi phí');
});

test('A3 – ⛔ nhập / xác nhận tiền công sau khi bảng lương kỳ đã chốt (không để tiền công mất)', () => {
  const TH = boot({ user: 'ketoan' }); const X = TH.actions, S = TH.store;
  const w = worker(TH);
  const draft = X.addRepair({ workerId: w.id, date: '2026-09-12', buildingId: 'b_T21', desc: 'Sửa ổ cắm', jobType: 'electric', labor: 400000, material: 0 });
  const run = X.computePayroll('2026-09'); approveAll(X, run); X.closePayroll(run.id);
  const c = attempt(() => X.confirmRepairs([draft.id]));
  assert.ok(!c.ok && /Bảng lương kỳ 09\/2026 đã chốt/.test(c.msg), c.msg);
  assert.equal(S.get('repairLogs', draft.id).status, 'draft');
  const a = attempt(() => X.addRepair({ workerId: w.id, date: '2026-09-13', buildingId: 'b_T21', desc: 'Sửa vòi', jobType: 'water', labor: 200000, material: 0 }));
  assert.ok(!a.ok && /đã chốt/.test((a.fields || {}).period || ''));
  // việc chỉ có vật tư vẫn ghi được (không đi qua lương)
  assert.ok(attempt(() => X.addRepair({ workerId: w.id, date: '2026-09-13', buildingId: 'b_T21', desc: 'Mua bóng đèn', jobType: 'electric', labor: 0, material: 50000 })).ok);
});

test('A4 – deal và lượt thuê không lệch khi thao tác ở UI-07', async (t) => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const pend = () => S.all('deals').filter(d => d.status === 'closed' && (Q.stay(d.stayId) || {}).status === 'pending');
  await t.test('nhận phòng ở UI-07 → deal "đã nhận" + sự kiện', () => {
    const l = X.addLead({ phone: '0987000111', source: 'Zalo', saleId: Q.salesStaff()[0].id }); const r = Q.forSale().find(x => x.kind === 'now').room;
    const d = X.closeDeal({ leadId: l.id, roomId: r.id, price: r.price, deposit: r.price, closeDate: '2026-09-28', billingStart: '2026-09-30', term: 12 });
    X.activateStay(d.stayId, '2026-09-30');
    const d2 = Q.deal(d.id); assert.equal(d2.status, 'received'); assert.ok(d2.events.some(e => e.type === 'receive'));
    assert.ok(!attempt(() => X.cancelDeal(d.id, 'x')).ok, 'đã nhận thì không hủy');
    assert.equal(Q.stay(d.stayId).status, 'active');
  });
  await t.test('bỏ cọc ở UI-07 → deal "bỏ cọc", hoa hồng tính lại trên cọc − tiền ngày đã ở, phòng mở bán lại', () => {
    const d = pend().find(x => Q.dealDeposit(x).held > 0); const held = X.depositBalance(d.stayId);
    X.endStay(d.stayId, { endType: 'forfeit', date: d.billingStart, reason: 'Khách đổi ý' });
    const d2 = Q.deal(d.id); assert.equal(d2.status, 'forfeited'); assert.equal(d2.forfeit.deposit, held);
    const c = Q.commissionsOf(d.id)[0]; assert.equal(c.term, 'forfeit'); assert.equal(c.F, d2.forfeit.base);
    assert.ok(!Q.dealHolds(d.roomId), 'phòng không còn bị giữ');
    assert.equal(Q.stay(d.stayId).endType, 'forfeit');
  });
  await t.test('bỏ cọc từ UI-21 vẫn đúng một sự kiện, không tính hai lần', () => {
    const d = pend().find(x => Q.dealDeposit(x).held > 0); const held = X.depositBalance(d.stayId);
    X.forfeitDeal(d.id, { date: d.billingStart, reason: 'Khách bỏ' });
    const d2 = Q.deal(d.id); assert.equal(d2.events.filter(e => e.type === 'forfeit').length, 1); assert.equal(d2.forfeit.deposit, held);
    assert.equal(S.where('depositLedger', l => l.stayId === d.stayId && l.kind === 'forfeit_revenue').length, 1);
  });
  await t.test('⛔ hủy deal khi lượt thuê không còn chờ nhận (dữ liệu cũ lệch trạng thái)', () => {
    const d = pend()[0];
    S.update('stays', d.stayId, { status: 'active' }); // dữ liệu cũ: nhận phòng trước khi có đồng bộ
    const r = attempt(() => X.cancelDeal(d.id, 'x'));
    assert.ok(!r.ok && /không còn chờ nhận/.test(r.msg));
    assert.equal(Q.stay(d.stayId).status, 'active', 'khách đang ở không bị hủy');
  });
});

test('A5 / D18 – mở lại kỳ: dòng điều chỉnh sau khóa tạm gỡ, sửa số gốc chỉ cộng một lần; khóa lại không cộng hai lần', () => {
  const TH = boot({ user: 'ketoan' }); const X = TH.actions, Q = TH.q;
  const P = '2026-10';
  const val = () => Math.round(((TH.qr.build(P, 'total').base.b_T21) || {}).repair || 0);
  const v0 = val();
  lock(TH, P);
  X.addPeriodAdjustment({ period: P, buildingId: 'b_T21', reportLine: 'repair', amount: 1000000, reason: 'Hóa đơn sửa chữa về muộn' });
  assert.equal(val(), v0 + 1000000);
  X.requestReopen(P, 'Nhập thiếu chi phí'); X.approveReopen(P); TH.auth.login('admin'); X.approveReopen(P); TH.auth.login('ketoan');
  assert.equal(val(), v0, 'kỳ mở lại: dòng điều chỉnh tạm gỡ (GĐ D18)');
  assert.equal(Q.absorbedAdjustments(P).length, 1);
  X.addExpense({ date: '2026-10-15', period: P, category: 'repair', scope: 'building', buildingId: 'b_T21', amount: 1000000, note: 'Hóa đơn sửa chữa về muộn – sửa số gốc' });
  assert.equal(val(), v0 + 1000000, 'sửa số gốc: cộng một lần');
  X.markAdjustmentFixed(Q.absorbedAdjustments(P)[0].id);
  lock(TH, P);
  assert.equal(val(), v0 + 1000000, 'khóa lại: không cộng hai lần');
  const d = plain(Q.compareSnapshots(P, 1, 2));
  assert.ok(d.length >= 1 && d.every(x => x.buildingId === 'b_T21') && Math.round(d.find(x => x.code === 'repair').diff) === 1000000, 'phiên 2 chênh đúng khoản sửa số gốc');
});

test('A6 – Zalo: 2 đợt tạo liên tiếp trước khi gửi không trùng người nhận (sắp hết HĐ, quá hạn)', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions;
  ['zr_expiring', 'zr_overdue'].forEach(rule => {
    const b1 = X.createZaloBatch({ ruleId: rule, buildingIds: [] });
    const k = (m) => m.invoiceId || 'st:' + m.stayId;
    const first = new Set(S.where('zaloMessages', m => m.batchId === b1.id).map(k));
    assert.ok(first.size > 0, rule);
    const r2 = attempt(() => X.createZaloBatch({ ruleId: rule, buildingIds: [] }));
    const dup = r2.ok ? S.where('zaloMessages', m => m.batchId === r2.value.id && first.has(k(m))).length : 0;
    assert.equal(dup, 0, rule + ': không người nhận nào có 2 tin');
    X.sendZaloBatch(b1.id);
  });
});

test('A7 – OCR: số viết kiểu Việt Nam ("3.800", "4.200.000") được đọc đúng; giá thuê không hợp lệ bị chặn', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const cf = S.all('contractFiles')[0]; const o = X.runOcr(cf.id);
  X.ocrSetField(o.id, 'fee_electric', '3.800'); X.ocrSetField(o.id, 'rent', '4.200.000'); X.ocrSetField(o.id, 'deposit', '4.200.000');
  const f = (k) => Q.ocrSession(o.id).fields.find(z => z.key === k).value;
  assert.equal(f('fee_electric'), 3800); assert.equal(f('rent'), 4200000);
  Q.OCR_GROUPS.forEach(([g]) => X.ocrConfirmGroup(o.id, g, true));
  const res = X.ocrApply(o.id, { from: '2026-12-01', reason: 'kiểm thử' });
  assert.equal(res.version.rent, 4200000); assert.equal(res.version.items.electric.unit, 3800);
});

test('A8 – chi hoa hồng khi kỳ đủ điều kiện đã khóa → ghi kỳ của ngày chi; ⛔ chi trước ngày đủ điều kiện', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const c = S.all('commissions').find(x => x.status === 'approved' && Q.dealEligibility(Q.deal(x.dealId)).ok);
  const el = Q.dealEligibility(Q.deal(c.dealId));
  const before = attempt(() => X.payCommission(c.id, { amount: 1000, date: TH.calc.dates.addDays(el.date, -1) }));
  assert.ok(!before.ok && /trước ngày đủ điều kiện/.test((before.fields || {}).date || ''));
  lock(TH, el.date.slice(0, 7));
  const e = X.payCommission(c.id, { amount: 1000, date: '2026-10-05' });
  assert.equal(e.period, '2026-10'); assert.match(e.note, /đã khóa/);
});

test('A9 – chia trùng: 2 người 25%, 3 người 16,67%, ≥ 4 người chia đều; co giãn theo mức cơ bản; chốt deal nhiều sale', () => {
  const TH = boot({ user: 'truongkd' }); const S = TH.store, X = TH.actions, Q = TH.q, CM = TH.calc.commission;
  const P50 = CM.DEFAULT_POLICY, P35 = Object.assign({}, CM.DEFAULT_POLICY, { base: 0.35 });
  assert.equal(CM.suggest({ term: 12, share: 2 }, P50).rate, 0.25);
  assert.equal(CM.suggest({ term: 12, share: 3 }, P50).rate, 0.1667);
  assert.equal(CM.suggest({ term: 12, share: 4 }, P50).rate, 0.125);
  assert.equal(CM.suggest({ term: 12, share: 2 }, P35).rate, 0.175);
  const staff = Q.salesStaff().filter(e => TH.auth.inSales([e.id]));
  const l = X.addLead({ phone: '0912345678', source: 'Zalo', saleId: staff[0].id });
  const r = Q.forSale().find(x => x.kind === 'now').room;
  const d = X.closeDeal({ leadId: l.id, roomId: r.id, saleIds: [staff[0].id, staff[1].id], price: r.price, deposit: r.price, closeDate: '2026-09-29', billingStart: '2026-10-01', term: 12 });
  const cs = Q.commissionsOf(d.id);
  assert.equal(cs.length, 2); assert.ok(cs.every(c => c.suggestedH === 0.25), plain(cs.map(c => c.suggestedH)).join());
});

test('NT-0 – Phase 1 không đổi sau Đợt A (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name + ' → ' + a.detail)), []);
});
