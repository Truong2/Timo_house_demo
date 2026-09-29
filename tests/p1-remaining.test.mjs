/* Các mục P1 còn lại của Phase 1 (plan 4 đợt): mỗi mục có ca đúng và ca bị chặn. Chạy trên app dựng từ seed (tests/_app.mjs). */
import test from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';
const plain = (v) => JSON.parse(JSON.stringify(v)); // mảng/đối tượng từ vm context khác realm → so sánh giá trị

const OCT = '2026-10';

/* ============================ Đợt 1 – tiền và công nợ ============================ */

test('Đợt 1.1 / UI-12 – sửa hóa đơn nháp: chỉ số → SL, đổi đơn giá bắt buộc lý do, lưu lịch sử; hóa đơn đã phát hành không sửa', async t => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, B = TH.calc.billing;
  const { created } = X.createInvoiceDrafts(OCT, ['b_G1']);
  const inv = created.find(i => B.expand(i.lines)[2].curr != null);
  assert.ok(inv, 'có hóa đơn nháp có chỉ số điện');
  const l3 = B.expand(inv.lines)[2];
  await t.test('sửa chỉ số mới dòng 3 → SL = mới − cũ, thành tiền và tổng tính lại', () => {
    const r = X.updateDraftLines(inv.id, [{ no: 3, curr: l3.prev + 100 }]);
    const n3 = B.expand(r.lines)[2];
    assert.equal(n3.qty, 100); assert.equal(n3.amount, Math.round(100 * n3.unit));
    assert.equal(r.totalDue, B.total(B.expand(r.lines)));
    assert.ok(r.edits.some(e => e.no === 3 && e.field === 'curr'));
  });
  await t.test('đổi đơn giá không có lý do → chặn; có lý do → lưu', () => {
    assert.ok(!attempt(() => X.updateDraftLines(inv.id, [{ no: 3, unit: 3500 }])).ok);
    const r = X.updateDraftLines(inv.id, [{ no: 3, unit: 3500 }], 'Giá điện theo phụ lục');
    assert.equal(B.expand(r.lines)[2].unit, 3500);
  });
  await t.test('chỉ số mới nhỏ hơn cũ → chặn', () => { assert.ok(!attempt(() => X.updateDraftLines(inv.id, [{ no: 3, curr: l3.prev - 1 }])).ok); });
  await t.test('hóa đơn đã phát hành → chặn sửa nháp', () => {
    const issued = S.one('invoices', i => i.period === '2026-09' && i.lifecycle === 'issued');
    assert.match(attempt(() => X.updateDraftLines(issued.id, [{ no: 1, amount: 1 }], 'x')).msg, /phát hành/);
  });
});

test('Đợt 1.2 / UI-13 – phân bổ phiếu thu theo dòng hóa đơn', async t => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, Q = TH.q, X = TH.actions;
  // hóa đơn kỳ 10 vừa phát hành: mọi dòng còn phải thu
  const { created } = X.createInvoiceDrafts(OCT, ['b_G1']); X.issueInvoices(created.map(i => i.id));
  const inv = created.map(i => Q.invoice(i.id)).find(i => Q.invState(i).status === 'CHUA_TT' && Q.lineState(i)[0].amount > 0 && Q.lineState(i)[2].amount > 50000);
  const L = Q.lineState(inv);
  await t.test('vượt số còn phải thu của dòng → chặn', () => {
    assert.match(attempt(() => X.recordPayment({ stayId: inv.stayId, type: 'invoice', amount: L[0].amount + 1000, receivedAt: '2026-09-20', allocations: [{ invoiceId: inv.id, lineNo: 1, amount: L[0].amount + 1000 }] })).msg, /dòng 1/);
  });
  await t.test('thu đủ dòng 1 → dòng 1 còn 0, các dòng khác giữ nguyên, hóa đơn "Thiếu"', () => {
    const p = X.recordPayment({ stayId: inv.stayId, type: 'invoice', amount: L[0].amount + 50000, receivedAt: '2026-09-20', allocations: [{ invoiceId: inv.id, lineNo: 1, amount: L[0].amount }] });
    const N = Q.lineState(inv);
    assert.equal(N[0].remaining, 0); assert.equal(N[2].remaining, L[2].remaining);
    assert.equal(Q.invState(inv).status, 'THIEU');
    assert.equal(p.unallocated, 50000, 'phần dư nằm ở số chưa phân bổ');
    assert.deepEqual(plain(p.allocations), [{ invoiceId: inv.id, lineNo: 1, amount: L[0].amount }]);
  });
  await t.test('phân bổ số dư sang dòng điện của cùng hóa đơn; hóa đơn lượt thuê khác → chặn', () => {
    const p = S.where('payments', x => x.stayId === inv.stayId && x.unallocated === 50000)[0];
    X.allocatePayment(p.id, [{ invoiceId: inv.id, lineNo: 3, amount: 50000 }]);
    assert.equal(Q.lineState(inv)[2].remaining, L[2].remaining - 50000);
    const other = created.map(i => Q.invoice(i.id)).find(i => i.stayId !== inv.stayId && Q.invState(i).remaining > 0);
    const p2 = X.recordPayment({ stayId: inv.stayId, type: 'prepay', amount: 10000, receivedAt: '2026-09-21', allocations: [] });
    assert.ok(!attempt(() => X.allocatePayment(p2.id, [{ invoiceId: other.id, amount: 10000 }])).ok);
  });
});

test('Đợt 1.3 / E14 – trả trước 3 tháng: tiền ghi một lần, tự áp phần từng kỳ khi phát hành', async t => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, Q = TH.q, X = TH.actions;
  const s = S.all('stays').find(x => x.status === 'active' && x.buildingId === 'b_G1' && x.rent > 0 && !S.one('invoices', i => i.stayId === x.id && i.period === OCT) && !S.one('payments', p => p.stayId === x.id && p.type === 'prepay'));
  const rent = Q.rateOf(s.id, OCT + '-01').rent;
  const p = X.recordPayment({ stayId: s.id, type: 'prepay', amount: rent * 3, receivedAt: '2026-09-25', allocations: [], months: 3, fromPeriod: OCT });
  await t.test('kế hoạch 3 kỳ 10/11/12, mỗi kỳ = tiền phòng tháng', () => {
    assert.deepEqual(plain(p.prepayPlan.map(x => [x.period, x.amount])), [[OCT, rent], ['2026-11', rent], ['2026-12', rent]]);
    assert.equal(p.unallocated, rent * 3);
  });
  await t.test('phát hành hóa đơn kỳ 10 → áp đúng phần kỳ 10 vào dòng tiền phòng; phiếu không đổi số tiền', () => {
    X.createInvoiceDrafts(OCT, ['b_G1'], { allowMissingReading: true });
    const inv = S.one('invoices', i => i.stayId === s.id && i.period === OCT);
    X.issueInvoices([inv.id]);
    const pp = S.get('payments', p.id);
    const applied = Math.min(rent, Q.lineState(inv)[0].amount + 0, TH.calc.billing.total(TH.calc.billing.expand(inv.lines)));
    assert.equal(pp.amount, rent * 3);
    assert.equal(pp.prepayPlan[0].applied, applied);
    assert.equal(pp.prepayPlan[1].applied, 0, 'kỳ 11 chưa áp');
    assert.equal(pp.unallocated, rent * 3 - applied);
    assert.equal(Q.lineState(inv)[0].remaining, Math.max(0, Q.lineState(inv)[0].amount - applied));
  });
  await t.test('thiếu kỳ bắt đầu → chặn', () => {
    assert.ok(!attempt(() => X.recordPayment({ stayId: s.id, type: 'prepay', amount: rent, receivedAt: '2026-09-25', months: 2 })).ok);
  });
});

test('Đợt 1.4 / UI-18 E18 – vượt cọc thành hóa đơn thu riêng; sổ cọc về 0', async t => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, Q = TH.q, X = TH.actions;
  // khách hết hạn HĐ: kết thúc 2 lượt thuê đang giữ cọc
  const cands = S.all('stays').filter(s => s.status === 'active' && s.buildingId === 'b_G1' && X.depositBalance(s.id) > 0).slice(0, 2);
  cands.forEach(s => X.endStay(s.id, { endType: 'expired', date: '2026-09-27' }));
  const approveBoth = (id) => { TH.auth.login('admin'); X.approveRefund(id); TH.auth.login('ketoan'); X.approveRefund(id); };
  await t.test('BD âm: số chi 0, lập INV-…-VC dòng 13 = phần vượt, vào công nợ; sổ cọc = 0', () => {
    const s = cands[0]; const dep = X.depositBalance(s.id);
    const rf = S.one('refunds', r => r.stayId === s.id) || X.createRefund(s.id);
    X.updateRefund(rf.id, { deductions: [{ kind: 'other', qty: 1, unit: dep + 1200000, note: 'Hư hỏng nội thất' }] });
    approveBoth(rf.id);
    X.payRefund(rf.id, { date: '2026-09-28' });
    const r = S.get('refunds', rf.id); const inv = Q.invoice(r.excessInvoiceId);
    assert.equal(r.paidAmount, 0);
    assert.ok(inv && inv.kind === 'deposit_excess');
    assert.equal(inv.totalDue, 1200000); assert.equal(TH.calc.billing.expand(inv.lines)[12].amount, 1200000);
    assert.equal(Q.invState(inv).remaining, 1200000);
    assert.equal(X.depositBalance(s.id), 0);
    assert.ok(!S.one('tasks', x => x.kind === 'refund_excess' && x.refId === rf.id), 'không còn chỉ tạo task');
  });
  await t.test('BD dương: chi BD, sổ cọc cũng về 0 (khấu trừ ghi "deduct")', () => {
    const s = cands[1]; const rf = S.one('refunds', r => r.stayId === s.id) || X.createRefund(s.id);
    X.updateRefund(rf.id, {}); approveBoth(rf.id);
    X.payRefund(rf.id, { date: '2026-09-28' });
    assert.equal(X.depositBalance(s.id), 0);
    assert.ok(!S.get('refunds', rf.id).excessInvoiceId);
  });
});

test('Đợt 1.5 / OQ-14 – khách của chủ nhà: bù trừ tiền trả chủ nhà, không là công nợ; phòng chủ nhà ở chỉ thu DV', async t => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, Q = TH.q, X = TH.actions;
  const G = ['501G17A001', '502G17A001', '601G17A001', '602G17A001'].map(c => S.one('invoices', i => i.code === 'INV-2026-09-' + c));
  const opOct = plain(S.one('ownerPayments', o => o.buildingId === 'b_G17' && o.from === '2026-10-01'));
  await t.test('4 hóa đơn G17 "đã đóng cho chủ" → Đủ, còn nợ 0; kỳ trả chủ nhà 10 giảm đúng tổng', () => {
    G.forEach(i => { assert.equal(Q.invState(i).status, 'DU', i.code); assert.equal(Q.invState(i).remaining, 0); });
    assert.equal(opOct.paid, G.reduce((s, i) => s + i.totalDue, 0));
    assert.equal(opOct.offsets.length, 4);
  });
  await t.test('hủy bù trừ → hóa đơn thành nợ lại, kỳ trả chủ nhà hoàn lại; báo cáo dòng 3 giảm đúng số', () => {
    const rev = () => TH.qr.build('2026-09', 'total').base.b_G17.rev_total;
    const before = rev();
    X.unmarkOwnerCollected(G[0].id, 'Chủ nhà chưa xác nhận');
    assert.equal(Q.invState(G[0]).remaining, G[0].totalDue);
    assert.equal(S.get('ownerPayments', opOct.id).paid, opOct.paid - G[0].totalDue);
    assert.equal(Math.round(before - rev()), Math.round(G[0].totalDue));
    X.markOwnerCollected(G[0].id, { date: '2026-09-05', reason: 'Chủ nhà xác nhận qua Zalo' });
    assert.equal(Q.invState(G[0]).remaining, 0);
  });
  await t.test('phòng Timehouse khai thác → chặn "Chủ nhà đã thu"', () => {
    const inv = S.one('invoices', i => i.code === 'INV-2026-09-401G17A001');
    assert.match(attempt(() => X.markOwnerCollected(inv.id, { date: '2026-09-05', reason: 'x' })).msg, /Khách của chủ nhà/);
  });
  await t.test('lượt thuê chỉ thu dịch vụ: phòng chủ nhà ở giá 0 được; phòng thường giá 0 bị chặn', () => {
    const free = (pred) => S.all('rooms').find(r => pred(r) && !Q.currentStay(r.id) && !Q.pendingStay(r.id));
    const base = { name: 'Khách thử', phone: '0912345678', rentStart: '2026-10-01', endDate: '2027-09-30', status: 'active', rent: 0 };
    const own = free(r => r.exploitation === 'owner_live');
    if (own) assert.ok(attempt(() => X.createStay(Object.assign({ roomId: own.id }, base))).ok, attempt(() => 0).msg);
    const th = free(r => r.exploitation === 'timehouse' && r.price > 0);
    assert.ok(!attempt(() => X.createStay(Object.assign({ roomId: th.id }, base))).ok);
  });
});

/* ============================ Đợt 2 – tham số, dashboard, Zalo ============================ */

test('Đợt 2.1 / UI-38 – tham số có kiểu và khoảng: key lạ, sai kiểu, ngoài khoảng bị chặn', async t => {
  const TH = boot({ user: 'admin' }); const X = TH.actions, Q = TH.q;
  const set = (k, v) => attempt(() => X.setParam(k, v, '2026-11-01', 'Khách xác nhận'));
  await t.test('key không tồn tại → chặn', () => { assert.match(set('khongCo', 1).msg, /không tồn tại/); });
  await t.test('ngày chốt "abc" / 40 → chặn; 20 → nhận số', () => {
    assert.ok(!set('cutoffDay', 'abc').ok); assert.match(set('cutoffDay', 40).msg, /1 đến 28/);
    assert.ok(set('cutoffDay', '20').ok); assert.equal(Q.param('cutoffDay', '2026-11-05'), 20);
  });
  await t.test('Có/Không, danh sách chọn, phần trăm', () => {
    assert.ok(!set('roundLines', 'hmm').ok); assert.ok(set('roundLines', 'false').ok); assert.equal(Q.param('roundLines', '2026-11-05'), false);
    assert.ok(!set('breachCharge', 'water').ok); assert.ok(set('breachCharge', 'electric,water').ok);
    assert.ok(set('depRate', '1,5%').ok); assert.equal(Q.param('depRate', '2026-11-05'), 0.015); assert.ok(!set('depRate', '50%').ok);
  });
  await t.test('mốc thu: phải đủ 3 mốc tăng dần', () => {
    assert.ok(!set('milestones', '5:100% · 10:90%').ok); assert.ok(!set('milestones', '10:100% · 5:90% · 15:70%').ok);
    assert.ok(set('milestones', '5:100% · 12:80% · 15:70%').ok);
    assert.deepEqual(plain(TH.calc.params.milestones(Q.param('milestones', '2026-11-05'))), { days: [5, 12, 15], w: [1, 0.8, 0.7] });
  });
});

test('Đợt 2.2 – tham số có tác dụng: mốc lương, phân bổ, trừ ngày ở thêm, nhắc trước hạn', async t => {
  await t.test('milestones đổi → bảng lương kỳ 9 tính theo mốc mới', () => {
    const TH = boot({ user: 'admin' }); const X = TH.actions;
    const bl = () => X.previewPayroll('2026-09').lines.flatMap(l => l.buildings).filter(b => b.source === 'web');
    const before = bl(); assert.deepEqual(plain(before[0].msDays), [5, 10, 15]);
    X.setParam('milestones', '5:100% · 20:80% · 25:50%', '2026-09-01', 'Thử mốc mới');
    const after = bl(); assert.deepEqual(plain(after[0].msDays), [5, 20, 25]); assert.deepEqual(plain(after[0].msW), [1, 0.8, 0.5]);
    const sumA = (arr) => Math.round(arr.reduce((s, b) => s + (b.M1 || 0) + (b.M2 || 0) + (b.M3 || 0), 0)); assert.notEqual(sumA(after), sumA(before));
  });
  await t.test('allocDenominator = allRooms → mẫu số kỳ 9 tăng đúng số phòng không giá', () => {
    const TH = boot({ user: 'admin' }); const X = TH.actions, S = TH.store;
    const d0 = X.previewAllocation('2026-09').denominator;
    const inBasis = new Set(Object.keys(X.roomBasis('2026-09').rooms));
    X.setParam('allocDenominator', 'allRooms', '2026-09-01', 'Thử');
    const d1 = X.previewAllocation('2026-09').denominator;
    const noRent = S.all('rooms').filter(r => r.exploitation !== 'meter_common' && !(r.price > 0) && Object.keys(X.roomBasis('2026-09').rooms).includes(r.buildingId)).length;
    assert.equal(d1 - d0, noRent); assert.ok(noRent > 0); assert.ok(inBasis.size > 0);
  });
  await t.test('refundDeductExtraDays = Có → phiếu hoàn tự trừ tiền ngày ở thêm, có lý do theo tham số', () => {
    const TH = boot({ user: 'admin' }); const X = TH.actions, S = TH.store;
    X.setParam('refundDeductExtraDays', 'true', '2026-09-01', 'Khách chọn trừ');
    const s = S.all('stays').find(x => x.status === 'active' && x.rentStart < '2026-09-01' && X.depositBalance(x.id) > 0 && x.rent > 0);
    X.endStay(s.id, { endType: 'expired', date: '2026-09-20' });
    const r = S.one('refunds', x => x.stayId === s.id);
    assert.equal(r.extraDays, 20); assert.ok(r.deductExtra); assert.match(r.extraReason, /OQ-16/);
    assert.equal(Math.round(r.bc), Math.round(r.deductions.reduce((t, d) => t + d.amount, 0) + r.extraRent));
  });
  await t.test('nhắc trước hạn: số ngày lấy từ tham số zaloRemindBeforeDays', () => {
    const TH = boot({ user: 'admin' }); const Z = TH.calc.zalo;
    const rule = TH.store.get('zaloRules', 'zr_before'); const it = [{ issued: true, remaining: 1, dueTo: '2026-09-30' }];
    assert.equal(Z.dueMessages(rule, it, '2026-09-27', { zaloRemindBeforeDays: 2 }).length, 0);
    assert.equal(Z.dueMessages(rule, it, '2026-09-27', { zaloRemindBeforeDays: 3 }).length, 1);
  });
});

test('Đợt 2.3 / UI-01 – phòng trống: bỏ phòng không giá; phòng cần dọn tách khỏi "ở luôn"', () => {
  const TH = boot({ user: 'admin' }); const Q = TH.q, S = TH.store;
  const v = Q.vacancy();
  assert.ok(v.now.length > 0 && v.now.every(r => r.price > 0), 'không đếm phòng chủ nhà ở (giá 0)');
  const r = v.now[0]; S.update('rooms', r.id, { status: 'vacant_cleaning' });
  const v2 = Q.vacancy(); assert.ok(!v2.now.some(x => x.id === r.id) && v2.cleaning.some(x => x.id === r.id));
});

test('Đợt 2.4 / UI-39 – Zalo: quá hạn từ ngày 6, không lặp trong N ngày, SMS dự phòng, gửi lại không nhân đôi hộp thư', async t => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Z = TH.calc.zalo;
  await t.test('quá hạn: ngày 5 chưa nhắc, ngày 6 nhắc (công nợ từ ngày 6); đã nhắc thì 3 ngày sau mới nhắc lại', () => {
    const rule = S.get('zaloRules', 'zr_overdue'); const it = { issued: true, remaining: 100, dueTo: '2026-08-31', debtFrom: '2026-09-06' };
    assert.equal(Z.dueMessages(rule, [it], '2026-09-05').length, 0); assert.equal(Z.dueMessages(rule, [it], '2026-09-06').length, 1);
    const sent = Object.assign({ lastSentAt: '2026-09-06T10:00:00' }, it);
    assert.equal(Z.dueMessages(rule, [sent], '2026-09-08').length, 0); assert.equal(Z.dueMessages(rule, [sent], '2026-09-09').length, 1);
  });
  const b = X.createZaloBatch({ ruleId: 'zr_overdue', period: '2026-09', buildingIds: [] });
  X.sendZaloBatch(b.id);
  await t.test('khách chưa liên kết → có bản ghi SMS (trạng thái, chi phí) + việc gọi gắn SMS', () => {
    const failed = S.where('zaloMessages', m => m.batchId === b.id && m.error === 'NOT_LINKED');
    assert.ok(failed.length > 0);
    failed.forEach(m => { const sms = S.get('smsMessages', m.smsId); assert.ok(sms && sms.parentId === m.id && ['sent', 'failed'].includes(sms.status)); });
    assert.ok(S.where('tasks', x => x.kind === 'call').every(x => S.get('smsMessages', x.smsId)));
  });
  await t.test('tạo đợt lại cùng ngày → không nhắc lại hóa đơn vừa gửi', () => {
    assert.ok(!attempt(() => X.createZaloBatch({ ruleId: 'zr_overdue', period: '2026-09', buildingIds: [] })).ok);
  });
  await t.test('gửi lại tin lỗi tạm thời → hộp thư không nhân đôi; đợt đã gửi không gửi lại toàn bộ', () => {
    if (S.where('zaloMessages', m => m.batchId === b.id && m.status === 'failed' && Z.retryable(m.error)).length) X.retryZalo(b.id);
    const n1 = S.all('zaloInbox').length;
    attempt(() => X.retryZalo(b.id));
    assert.equal(S.all('zaloInbox').length, n1);
    const ids = S.all('zaloInbox').map(x => x.messageId); assert.equal(new Set(ids).size, ids.length, 'mỗi tin tối đa một phản hồi');
    assert.ok(!attempt(() => X.sendZaloBatch(b.id)).ok);
  });
});

/* ============================ Đợt 3 – tòa, phòng, phân công ============================ */

test('Đợt 3.1 / UI-02, UI-03 – sửa hồ sơ tòa và phòng; mã tòa trùng khác hoa/thường; ngừng khai thác thay cho xóa', async t => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const base = { address: 'x', areaId: S.all('areas')[0].id, managerId: S.all('employees')[0].id };
  await t.test('thêm tòa "s43" khi đã có S43 → chặn', () => { assert.ok(!attempt(() => X.addBuilding(Object.assign({ code: 's43' }, base))).ok); });
  await t.test('sửa tòa: khu vực, địa chỉ, số tầng, tình trạng, ngày nhận; số tầng 99 bị chặn; mã không đổi', () => {
    const b = X.updateBuilding('b_G1', { address: 'Địa chỉ mới', floors: '7', level: 'Mới', operatedFrom: '2024-03-01', code: 'XX' });
    assert.equal(b.address, 'Địa chỉ mới'); assert.equal(b.floors, 7); assert.equal(b.level, 'Mới'); assert.equal(b.code, 'G1');
    assert.ok(!attempt(() => X.updateBuilding('b_G1', { floors: 99 })).ok);
    assert.ok(!attempt(() => X.updateBuilding('b_G1', { address: '  ' })).ok);
  });
  await t.test('ngừng khai thác tòa còn khách → chặn; tòa mới không khách → được, phòng chuyển inactive', () => {
    assert.match(attempt(() => X.updateBuilding('b_G1', { status: 'inactive' })).msg, /hợp lệ/);
    const nb = X.addBuilding(Object.assign({ code: 'S99', floors: 2, rooms: 4 }, base));
    X.updateBuilding(nb.id, { status: 'inactive' });
    assert.equal(Q.building(nb.id).status, 'inactive'); assert.ok(Q.roomsByBuilding()[nb.id].every(r => r.status === 'inactive'));
  });
  await t.test('sửa phòng: đổi giá phải có ngày hiệu lực và lưu lịch sử; phòng có khách không thành đồng hồ chung', () => {
    const r = S.all('rooms').find(x => x.buildingId === 'b_G1' && x.price > 0 && Q.currentStay(x.id)); const p0 = r.price; // store trả về đối tượng sống → giữ giá cũ riêng
    assert.ok(!attempt(() => X.updateRoom(r.id, { price: p0 + 100000 })).ok, 'thiếu ngày hiệu lực');
    const u = X.updateRoom(r.id, { price: p0 + 100000, effectiveFrom: '2026-10-01', area: '25', readyDate: '2026-10-05', type: 'Studio', reason: 'Tăng giá' });
    assert.equal(u.price, p0 + 100000); assert.equal(u.area, 25); assert.equal(u.type, 'Studio');
    assert.equal(u.priceHistory.length, 1); assert.equal(u.priceHistory[0].price, p0); assert.equal(u.priceHistory[0].from, '2026-10-01');
    assert.ok(!attempt(() => X.updateRoom(r.id, { exploitation: 'meter_common' })).ok);
    assert.ok(!attempt(() => X.updateRoom(r.id, { floor: 99 })).ok);
  });
});

test('Đợt 3.2 / UI-24 – phân công theo phòng và loại trách nhiệm; phạm vi dữ liệu theo phòng; bỏ phân công', async t => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const emp = S.one('users', u => u.username === 'vanhanh').employeeId;
  TH.auth.login('vanhanh'); const scope0 = TH.auth.buildingScope(); TH.auth.login('admin');
  const b = S.all('buildings').find(x => !scope0.has(x.id) && (Q.roomsByBuilding()[x.id] || []).filter(r => r.price > 0 && Q.currentStay(r.id) && Q.invoicesOf('2026-09').some(i => i.roomId === r.id)).length >= 3);
  const rooms = Q.roomsByBuilding()[b.id].filter(r => r.price > 0 && Q.currentStay(r.id) && Q.invoicesOf('2026-09').some(i => i.roomId === r.id));
  const mgr0 = (Q.managerOf(b.id) || {}).id;
  await t.test('phòng không thuộc tòa → chặn; loại trách nhiệm lạ → chặn; hai loại trên cùng phòng không xung đột', () => {
    const other = S.all('rooms').find(r => r.buildingId !== b.id);
    assert.ok(!attempt(() => X.assign({ employeeId: emp, buildingId: b.id, roomId: other.id, responsibility: 'tech', from: '2026-09-01', reason: 'x' })).ok);
    assert.ok(!attempt(() => X.assign({ employeeId: emp, buildingId: b.id, responsibility: 'boss', from: '2026-09-01', reason: 'x' })).ok);
    const a1 = X.assign({ employeeId: emp, buildingId: b.id, roomId: rooms[0].id, responsibility: 'operate', from: '2026-09-01', reason: 'Giao phòng' });
    const tech = S.all('employees').find(e => e.title === 'KỸ THUẬT');
    const a2 = X.assign({ employeeId: tech.id, buildingId: b.id, roomId: rooms[0].id, responsibility: 'tech', from: '2026-09-01', reason: 'Kỹ thuật' });
    assert.ok(a1.id && a2.id && !a1.to && !a2.to);
    assert.equal(S.where('assignments', x => x.roomId === rooms[0].id && !x.to).length, 2);
  });
  await t.test('vận hành chỉ thấy hóa đơn / khách của phòng được giao trong tòa đó', () => {
    TH.auth.login('vanhanh');
    assert.ok(TH.auth.inScope(b.id)); assert.ok(TH.auth.inScopeRoom(rooms[0].id)); assert.ok(!TH.auth.inScopeRoom(rooms[1].id));
    const inv = Q.scoped(Q.invoicesOf('2026-09')).filter(i => i.buildingId === b.id);
    assert.ok(inv.length >= 1 && inv.every(i => i.roomId === rooms[0].id), 'chỉ hóa đơn phòng được giao');
    const st = Q.scoped(S.all('stays')).filter(s => s.buildingId === b.id);
    assert.ok(st.length >= 1 && st.every(s => s.roomId === rooms[0].id));
    TH.auth.login('admin');
  });
  await t.test('người phụ trách tòa và lương không lấy phân công cấp phòng', () => {
    assert.equal((Q.managerOf(b.id) || {}).id, mgr0);
    const pv = TH.actions.previewPayroll('2026-09'); const line = pv.lines.find(l => l.employeeId === emp);
    assert.ok(!line || !line.buildings.some(x => x.buildingId === b.id));
  });
  await t.test('bỏ phân công: trước ngày bắt đầu bị chặn; sau khi bỏ → hết phạm vi, lịch sử giữ nguyên', () => {
    const a = S.one('assignments', x => x.employeeId === emp && x.roomId === rooms[0].id);
    assert.ok(!attempt(() => X.endAssignment(a.id, '2026-08-15', 'x')).ok);
    assert.ok(!attempt(() => X.endAssignment(a.id, '2026-09-20', '')).ok);
    X.endAssignment(a.id, '2026-09-20', 'Chuyển việc');
    TH.auth.login('vanhanh'); assert.ok(!TH.auth.inScope(b.id)); TH.auth.login('admin');
    assert.equal(S.get('assignments', a.id).from, '2026-09-01'); assert.equal(S.get('assignments', a.id).to, '2026-09-20');
  });
});

/* ============================ Đợt 4 – cài đặt, import, dữ liệu ============================ */

test('Đợt 4.1 / UI-38 – tài khoản, khu vực, TK nhận tiền, danh mục mở rộng', async t => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions;
  await t.test('tài khoản: tạo, sửa vai trò, khóa → không đăng nhập; không tự khóa mình; không khóa admin cuối', () => {
    const emp = S.all('employees').find(e => e.title === 'NVVH' && !S.one('users', u => u.employeeId === e.id));
    assert.ok(!attempt(() => X.addUser({ username: 'ab', role: 'vanhanh', employeeId: emp.id })).ok, 'tên quá ngắn');
    assert.ok(!attempt(() => X.addUser({ username: 'moi.vh', role: 'vanhanh' })).ok, 'vai trò theo phân công cần nhân viên');
    const u = X.addUser({ username: 'moi.vh', role: 'vanhanh', employeeId: emp.id });
    assert.equal(TH.auth.login('moi.vh').id, u.id); TH.auth.login('admin');
    X.updateUser(u.id, { role: 'leader' }); assert.equal(S.get('users', u.id).role, 'leader');
    assert.ok(!attempt(() => X.setUserStatus(u.id, 'locked', '')).ok, 'khóa phải có lý do');
    X.setUserStatus(u.id, 'locked', 'Nghỉ việc');
    assert.ok(!attempt(() => TH.auth.login('moi.vh')).ok, 'tài khoản khóa không đăng nhập');
    assert.ok(!attempt(() => X.setUserStatus(S.session.userId, 'locked', 'x')).ok);
    assert.ok(!attempt(() => X.setUserStatus(S.one('users', x => x.role === 'admin').id, 'locked', 'x')).ok);
    X.setUserStatus(u.id, 'active', ''); assert.ok(attempt(() => TH.auth.login('moi.vh')).ok); TH.auth.login('admin');
  });
  await t.test('khu vực và TK nhận: thêm/sửa; trùng tên, số TK sai bị chặn', () => {
    const a = X.saveArea({ name: 'Khu Long Biên' }); assert.ok(!attempt(() => X.saveArea({ name: 'khu long biên' })).ok);
    X.saveArea({ id: a.id, name: 'Khu Long Biên 2' }); assert.equal(S.get('areas', a.id).name, 'Khu Long Biên 2');
    assert.ok(!attempt(() => X.saveAccount({ template: 'VP', bank: 'MB', number: '12', holder: 'A' })).ok);
    const acc = X.saveAccount({ template: 'VP', bank: 'MB Bank', number: '0011 22 3344', holder: 'Nguyễn A' }); assert.ok(S.get('accounts', acc.id));
    X.saveAccount({ id: acc.id, template: 'VP', bank: 'MB Bank', number: '0011 22 3355', holder: 'Nguyễn A' }); assert.equal(S.get('accounts', acc.id).number, '0011 22 3355');
  });
  await t.test('danh mục: loại chi phí mới có dòng báo cáo → dùng được ở chi phí; mục đã dùng không xóa, chỉ ngừng dùng có lý do; chức danh, lý do phá HĐ', () => {
    X.addCatalogItem({ kind: 'expenseCategories', key: 'security', label: 'Dịch vụ bảo vệ thuê ngoài', reportLine: 'other' });
    assert.ok(TH.data.catalog.expenseCategories.some(c => c.key === 'security'));
    assert.ok(!attempt(() => X.addCatalogItem({ kind: 'expenseCategories', key: 'security', label: 'x' })).ok, 'trùng mã');
    assert.ok(!attempt(() => X.addCatalogItem({ kind: 'expenseCategories', key: 'y', label: 'y', reportLine: 'khong_co' })).ok, 'dòng báo cáo lạ');
    const e = X.addExpense({ date: '2026-09-20', period: '2026-09', category: 'security', scope: 'building', buildingId: 'b_G1', amount: 500000, note: 'Bảo vệ' });
    assert.equal(e.reportLine, 'other');
    assert.ok(!attempt(() => X.removeCatalogItem('expenseCategories', 'security')).ok, 'đã dùng → không xóa');
    assert.ok(!attempt(() => X.setCatalogItemActive('expenseCategories', 'security', false, '')).ok, 'ngừng dùng cần lý do');
    X.setCatalogItemActive('expenseCategories', 'security', false, 'Không dùng nữa');
    assert.equal(TH.data.catalog.expenseCategories.find(c => c.key === 'security').active, false);
    X.setCatalogItemActive('expenseCategories', 'security', true, ''); assert.equal(TH.data.catalog.expenseCategories.find(c => c.key === 'security').active, true);
    X.addCatalogItem({ kind: 'titles', key: 'LE TAN', label: 'Lễ tân' }); assert.equal(TH.data.catalog.titles['LE TAN'], 'Lễ tân');
    X.addCatalogItem({ kind: 'breachReasons', label: 'Chuyển công tác' }); assert.ok(TH.data.catalog.breachReasons.includes('Chuyển công tác'));
    X.removeCatalogItem('breachReasons', 'Chuyển công tác'); assert.ok(!TH.data.catalog.breachReasons.includes('Chuyển công tác'));
    // sau khi nạp lại store, danh mục bổ sung vẫn còn (lưu trong catalogItems)
    S.saveNow(); S.load(); assert.ok(TH.data.catalog.expenseCategories.some(c => c.key === 'security') && TH.data.catalog.titles['LE TAN']);
  });
});

test('Đợt 4.2 / UI-37 – import tòa và nhân viên: đủ cột, kiểm tra tham chiếu, giữ mã nguồn', async t => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions;
  await t.test('tòa: trùng mã (khác hoa/thường) → trùng; sai nhóm, quản lý lạ, khu vực lạ → lỗi; hợp lệ → tạo đủ khu vực / tầng / ngày nhận', () => {
    const mgr = S.all('employees').find(e => e.title === 'NVVH').code;
    const rows = [{ code: 's43', address: 'x', group: 'S', area: 'Khu Cầu Giấy', manager: mgr }, { code: 'T98', address: 'x', group: 'S', area: 'Khu Cầu Giấy', manager: mgr }, { code: 'S97', address: 'x', group: 'S', area: 'Khu Cầu Giấy', manager: 'NV-9999' }, { code: 'S96', address: 'x', group: 'S', area: 'Khu Lạ', manager: mgr }, { code: 'S95', address: 'Số 1', group: 'S', area: 'Khu Cầu Giấy', manager: mgr, floors: '5', operatedFrom: '2026-10-01' }];
    const res = X.validateImport('buildings', rows);
    assert.deepEqual(plain(res.map(r => r.status)), ['duplicate', 'error', 'error', 'error', 'ok']);
    X.commitImport('buildings', 'toa.csv', res);
    const b = S.one('buildings', x => x.code === 'S95'); assert.ok(b); assert.equal(b.floors, 5); assert.equal(b.operatedFrom, '2026-10-01'); assert.equal((S.get('areas', b.areaId) || {}).name, 'Khu Cầu Giấy');
    assert.ok(!S.one('buildings', x => x.code === 'S97'), 'quản lý lạ không được tạo với người mặc định');
  });
  await t.test('nhân viên: giữ mã nguồn, SĐT, khu vực; trùng mã → trùng; chức danh lạ → lỗi', () => {
    const rows = [{ code: 'NV-DEMO-9', name: 'Nguyễn Văn Mới', title: 'NVVH', hireDate: '2026-09-15', phone: '0912000111', area: 'Khu Cầu Giấy' }, { code: S.all('employees')[0].code, name: 'Trùng', title: 'NVVH', hireDate: '2026-09-15' }, { code: 'NV-DEMO-8', name: 'Sai', title: 'GIAM DOC', hireDate: '2026-09-15' }, { code: 'NV-DEMO-7', name: 'Theo tên chức danh', title: 'Kế toán', hireDate: '2026-09-15' }];
    const res = X.validateImport('staff', rows);
    assert.deepEqual(plain(res.map(r => r.status)), ['ok', 'duplicate', 'error', 'ok']);
    X.commitImport('staff', 'nv.csv', res);
    const e = S.one('employees', x => x.code === 'NV-DEMO-9'); assert.ok(e); assert.equal(e.phone, '0912000111'); assert.ok(e.areaId);
    assert.equal(S.one('employees', x => x.code === 'NV-DEMO-7').title, 'KẾ TOÁN');
  });
});

test('Đợt 4.3 – mã tòa duy nhất (không phân biệt hoa/thường), nhóm theo tiền tố; số nghiệm thu không đổi', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store;
  const codes = S.all('buildings').map(b => b.code);
  assert.equal(new Set(codes.map(c => c.toUpperCase())).size, codes.length, 'không còn s8/S8');
  assert.ok(codes.every(c => c === c.toUpperCase()));
  ['b_S8', 'b_T20', 'b_S16', 'b_S18'].forEach(id => assert.ok(S.get('buildings', id), id));
  assert.ok(!S.get('buildings', 'b_s8') && !S.get('buildings', 'b_t20'));
  assert.equal(S.get('buildings', 'b_T20').group, 'T');
  assert.ok(S.all('rooms').every(r => S.get('buildings', r.buildingId)), 'mọi phòng thuộc tòa tồn tại');
  assert.ok(S.all('stays').every(s => S.get('buildings', s.buildingId)) && S.all('invoices').every(i => S.get('buildings', i.buildingId)));
  assert.equal(S.all('invoices').filter(i => i.period === '2026-09').length, 1471);
  assert.equal(Math.round(TH.qr.build('2026-08', 'total').cols.TOTAL.rev_total), 7036256236);
});
