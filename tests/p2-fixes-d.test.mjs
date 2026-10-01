/* Phase 2 – rà soát lại 30/09, Đợt D (lỗi nặng + trung bình còn lại). Kịch bản docs/uat/Phase2_Kich_ban_kiem_thu.md mục 7. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));
const lock = (TH, period) => { const S = TH.store; const ms = S.meta.milestone; S.meta.milestone = '1A'; TH.actions.closePeriod(period); S.meta.milestone = ms; };
const reopen = (TH, period) => { const X = TH.actions; const u = TH.store.session.username; TH.auth.login('ketoan'); X.requestReopen(period, 'kiểm thử'); X.approveReopen(period); TH.auth.login('admin'); X.approveReopen(period); TH.auth.login(u); };
const worker = (TH) => TH.store.all('employees').filter(e => e.title === 'KỸ THUẬT' && e.repairPay)[0];
const newDeal = (TH, phone, extra = {}) => { const X = TH.actions, Q = TH.q; const l = X.addLead({ phone, source: 'Zalo' }); const r = Q.forSale().find(x => x.kind === 'now').room;
  return { l, r, d: X.closeDeal(Object.assign({ leadId: l.id, roomId: r.id, price: r.price, deposit: r.price, closeDate: '2026-09-28', billingStart: '2026-10-01', term: 12 }, extra)) }; };

/* ---------------- Lỗi nặng ---------------- */
test('D1 / D6 – khóa lại bảng kê lỗi E24 không làm mất phiên đã khóa; có nút khóa phiên mới sau mở lại kỳ', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const v1 = X.lockShareRun('b_G1', '2026-08', 'web');
  assert.equal(Q.shareRelockable('b_G1', '2026-08'), false);
  lock(TH, '2026-08'); reopen(TH, '2026-08');
  assert.equal(Q.shareRelockable('b_G1', '2026-08'), true, 'kỳ mở lại sau lần khóa → khóa phiên mới được');
  const rows = Q.shareRatios('b_G1', '2026-08-31').map(r => ({ shareholderId: r.shareholderId, pct: r.shareholderId === 'sh_CHUNG' ? r.pct - 1 : r.pct }));
  X.setShareRatios('b_G1', rows, '2026-08-15', 'Kiểm thử 99%');
  const r = attempt(() => X.lockShareRun('b_G1', '2026-08', 'web'));
  assert.ok(!r.ok && /E24/.test(r.msg));
  assert.equal(S.get('shareRuns', v1.id).status, 'locked', 'phiên 1 vẫn khóa');
  assert.equal(Q.shareRun('b_G1', '2026-08').locked, true);
});

test('D7 – chỉ khóa bảng kê khi kỳ báo cáo đã khóa (hoặc kỳ song song Excel)', () => {
  const TH = boot({ user: 'admin' }); const X = TH.actions, Q = TH.q;
  assert.equal(Q.shareLockable('2026-08'), true); assert.equal(Q.shareLockable('2026-09'), false);
  const r = attempt(() => X.lockShareRun('b_G1', '2026-09', 'web'));
  assert.ok(!r.ok && /chưa khóa số báo cáo/.test(r.msg));
});

test('D2 – điều chỉnh dòng chủ nhà chịu: hết chỗ bù trừ thì không ghi gì; người chịu phải hợp lệ; ⛔ đổi người chịu sau chốt lương', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions;
  const w = worker(TH);
  const oc = S.all('ownerContracts').find(c => c.status === 'active' && S.where('ownerPayments', o => o.contractId === c.id && o.amountDue - (o.paid || 0) > 2000000).length);
  const r = X.addRepair({ workerId: w.id, date: '2026-09-28', buildingId: oc.buildingId, desc: 'Thay bơm', jobType: 'water', labor: 100000, material: 400000, bearer: 'owner' });
  X.confirmRepairs([r.id]);
  const off = S.get('repairLogs', r.id).ownerOffset; assert.ok(off);
  S.where('ownerPayments', o => o.contractId === oc.id).forEach(o => S.update('ownerPayments', o.id, { paid: o.amountDue })); // mọi kỳ đã chi đủ
  const snap = plain(S.where('ownerPayments', o => o.contractId === oc.id).map(o => [o.id, o.paid, (o.offsets || []).length]));
  const a = attempt(() => X.adjustRepair(r.id, { labor: 100000, material: 900000, reason: 'Vật tư tăng' }));
  assert.ok(!a.ok && /bù trừ/.test(a.msg));
  assert.deepEqual(plain(S.where('ownerPayments', o => o.contractId === oc.id).map(o => [o.id, o.paid, (o.offsets || []).length])), snap, 'không gỡ bù trừ cũ khi lỗi');
  assert.deepEqual(plain(S.get('repairLogs', r.id).ownerOffset), plain(off));
  assert.ok(!attempt(() => X.adjustRepair(r.id, { bearer: 'xyz', reason: 'x' })).ok, 'người chịu không hợp lệ');
  // cùng kỳ trả chủ nhà: giảm số vẫn được (tính cả phần bù trừ cũ)
  assert.ok(attempt(() => X.adjustRepair(r.id, { labor: 100000, material: 300000, reason: 'Trả lại vật tư thừa' })).ok);
  const c = X.addRepair({ workerId: w.id, date: '2026-09-28', buildingId: oc.buildingId, desc: 'Sửa ổ cắm', jobType: 'electric', labor: 300000, material: 0, bearer: 'company' });
  X.confirmRepairs([c.id]);
  S.add('payrollRuns', { period: c.period, status: 'closed', closedAt: '2026-10-26T10:00:00' });
  const b = attempt(() => X.adjustRepair(c.id, { bearer: 'owner', reason: 'Chủ nhà chịu' }));
  assert.ok(!b.ok && /không đổi người chịu/.test(b.msg));
});

/* ---------------- Sổ sửa chữa ---------------- */
test('D13 – đổi người chịu sau khi "Tính" lương làm đổi chữ ký → phải tính lại', () => {
  const TH = boot({ user: 'admin' }); const X = TH.actions; const w = worker(TH);
  const r = X.addRepair({ workerId: w.id, date: '2026-09-28', buildingId: 'b_T21', desc: 'Sửa vòi', jobType: 'water', labor: 300000, material: 0, bearer: 'company' });
  X.confirmRepairs([r.id]);
  const sig0 = X.manualSig(r.period);
  X.adjustRepair(r.id, { bearer: 'tenant', reason: 'Khách làm hỏng' });
  assert.notEqual(X.manualSig(r.period), sig0);
});

test('D14 – kỳ sổ theo ngày; ⛔ ghi vào kỳ song song Excel; ⛔ thợ không phải kỹ thuật', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions; const w = worker(TH);
  const r = X.addRepair({ workerId: w.id, period: '', date: '2026-09-20', buildingId: 'b_T21', desc: 'Sửa đèn', jobType: 'electric', labor: 50000, material: 0 });
  assert.equal(r.period, '2026-09', 'để trống kỳ = kỳ theo ngày 20/09');
  const p = attempt(() => X.addRepair({ workerId: w.id, date: '2026-08-10', buildingId: 'b_T21', desc: 'Ghi bù', jobType: 'electric', labor: 50000, material: 0 }));
  assert.ok(!p.ok && /song song/.test(p.fields.period));
  const nv = S.all('employees').find(e => e.title !== 'KỸ THUẬT');
  assert.ok(!attempt(() => X.addRepair({ workerId: nv.id, date: '2026-09-20', buildingId: 'b_T21', desc: 'x', jobType: 'electric', labor: 50000, material: 0 })).ok);
});

test('D15 – dòng nháp không vào lương thợ / UI-44; hiện riêng "chưa tính"', () => {
  const TH = boot({ user: 'admin' }); const X = TH.actions, Q = TH.q, QO = TH.qo; const w = worker(TH);
  const s0 = Q.repairSettlement(w.id, '2026-09'), u0 = QO.repairs('2026-09', 'web').totals;
  X.addRepair({ workerId: w.id, date: '2026-09-20', buildingId: 'b_T21', desc: 'Nháp', jobType: 'electric', labor: 500000, material: 20000 });
  assert.equal(Q.repairSettlement(w.id, '2026-09').pay, s0.pay);
  assert.equal(Q.repairLedger('2026-09').drafts.count, 1);
  const u1 = QO.repairs('2026-09', 'web').totals; assert.equal(u1.labor, u0.labor); assert.equal(u1.drafts, (u0.drafts || 0) + 1);
  // NT-5 / NT-6 không đổi (sổ T8 đã xác nhận)
  assert.equal(QO.repairs('2026-08', 'excel').totals.labor, 23350000);
});

/* ---------------- Kinh doanh ---------------- */
test('D3 – hủy deal: lead về trạng thái trước khi chốt, lượt xem không còn "chốt"; chốt lại được', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const l = X.addLead({ phone: '0977123001', source: 'Zalo', saleId: Q.salesStaff()[0].id }); const r = Q.forSale().find(x => x.kind === 'now').room;
  X.addViewing(l.id, { roomId: r.id, date: '2026-09-27' });
  const d = X.closeDeal({ leadId: l.id, roomId: r.id, price: r.price, deposit: r.price, closeDate: '2026-09-28', billingStart: '2026-10-01', term: 12 });
  assert.equal(Q.lead(l.id).status, 'closed');
  X.cancelDeal(d.id, 'Khách đổi ý trước khi cọc');
  assert.equal(Q.lead(l.id).status, 'viewed');
  assert.ok(S.where('viewings', v => v.leadId === l.id).every(v => v.result !== 'closed'));
  assert.ok(attempt(() => X.closeDeal({ leadId: l.id, roomId: r.id, price: r.price, deposit: r.price, closeDate: '2026-09-29', billingStart: '2026-10-01', term: 12 })).ok, 'chốt lại được');
});

test('D4 – trưởng phòng vận hành: xem kinh doanh toàn bộ, không tạo lead / chốt / hủy', () => {
  const TH = boot({ user: 'truongphong' }); const S = TH.store, X = TH.actions, Q = TH.q, A = TH.auth;
  assert.equal(A.salesScope(), null);
  assert.equal(Q.salesScoped(S.all('deals')).length, S.all('deals').length);
  ['sales.manage', 'deals.close', 'deals.cancel'].forEach(p => assert.ok(!A.can(p), p));
  assert.ok(!attempt(() => X.addLead({ phone: '0977123002', source: 'Zalo' })).ok);
  assert.ok(TH.qo.sales('2026-09', 'sale').totals.viewed > 0);
});

test('D5 – UI-46: số tổng theo phạm vi như các dòng; lọc sale chỉ hiện người được lọc', () => {
  const TH = boot({ user: 'sale' }); const S = TH.store, QO = TH.qo;
  const R = QO.sales('2026-09', 'sale');
  assert.equal(R.totals.viewed, Math.round(R.conv.reduce((t, x) => t + x.viewed, 0)), 'sale: tổng = Σ dòng trong phạm vi');
  TH.auth.login('admin');
  const co = S.all('deals').find(d => d.saleIds.length > 1 && TH.f.period(d.closeDate) === '2026-09');
  if (co) { const one = QO.sales('2026-09', 'sale', { sale: co.saleIds[0] }); assert.ok(one.volume.every(v => v.id === co.saleIds[0])); }
  const d = S.all('deals').find(x => TH.f.period(x.closeDate) === '2026-09');
  assert.ok(QO.sales('2026-09', 'sale', { sale: d.saleIds[0] }).volume.every(v => v.id === d.saleIds[0]));
});

test('D3+ – kiểm tra ngày: ⛔ chốt ngày tương lai, ⛔ nhận / bỏ cọc trước ngày chốt (cả từ UI-07); saleIds không trùng', () => {
  const TH = boot({ user: 'admin' }); const X = TH.actions, Q = TH.q;
  const staff = Q.salesStaff();
  const l = X.addLead({ phone: '0977123003', source: 'Zalo' }); const r = Q.forSale().find(x => x.kind === 'now').room;
  const base = { leadId: l.id, roomId: r.id, price: r.price, deposit: r.price, billingStart: '2026-10-01', term: 12 };
  assert.ok(!attempt(() => X.closeDeal(Object.assign({}, base, { closeDate: '2026-10-15', billingStart: '2026-10-15' }))).ok, 'ngày chốt tương lai');
  assert.ok(!attempt(() => X.closeDeal(Object.assign({}, base, { closeDate: '2026-09-28', moveInDate: '2026-09-20' }))).ok, 'nhận trước chốt');
  const d = X.closeDeal(Object.assign({}, base, { closeDate: '2026-09-28', saleIds: [staff[0].id, staff[0].id] }));
  assert.deepEqual(plain(Q.deal(d.id).saleIds), [staff[0].id], 'bỏ sale trùng');
  assert.ok(!attempt(() => X.activateStay(d.stayId, '2026-09-25')).ok, 'nhận phòng trước ngày chốt');
  X.recordPayment({ stayId: d.stayId, type: 'deposit', amount: d.deposit, receivedAt: '2026-09-29', method: 'bank', allocations: [] });
  assert.ok(!attempt(() => X.forfeitDeal(d.id, { date: '2026-09-20', reason: 'x' })).ok, 'bỏ trước ngày chốt');
  assert.ok(!attempt(() => X.endStay(d.stayId, { endType: 'forfeit', date: '2026-09-20', reason: 'x' })).ok, 'bỏ cọc ở UI-07 trước ngày chốt');
  assert.ok(attempt(() => X.forfeitDeal(d.id, { date: '2026-09-29', reason: 'Khách bỏ' })).ok);
});

/* ---------------- OCR / tài liệu ---------------- */
const ocrReadyFor = (TH, cf) => { const X = TH.actions, Q = TH.q; const o = X.runOcr(cf.id);
  const dep = (o.fields.find(f => f.key === 'deposit') || {}).value; if (dep === '' || dep == null) X.ocrSetField(o.id, 'deposit', String(Q.stay(cf.stayId).depositAmount || 1000000));
  return o; };
const confirmAll = (TH, o) => TH.q.OCR_GROUPS.forEach(([g]) => TH.actions.ocrConfirmGroup(o.id, g, true));

test('D11 – trường OCR: số tiền kiểu Việt Nam, ngày, số nguyên; chữ / số vô lý → lỗi trường', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const o = ocrReadyFor(TH, S.all('contractFiles')[0]);
  const val = (k) => Q.ocrSession(o.id).fields.find(f => f.key === k).value;
  X.ocrSetField(o.id, 'rent', '4,2 triệu'); assert.equal(val('rent'), 4200000);
  X.ocrSetField(o.id, 'fee_electric', '3,800'); assert.equal(val('fee_electric'), 3800);
  X.ocrSetField(o.id, 'rent', '4.2tr'); assert.equal(val('rent'), 4200000);
  X.ocrSetField(o.id, 'endDate', '31/12/2027'); assert.equal(val('endDate'), '2027-12-31');
  [['deposit', 'abc'], ['dueDay', '45'], ['payMonths', 'abc'], ['signDate', 'hôm qua'], ['endDate', '31/02/2027']].forEach(([k, v]) => {
    const r = attempt(() => X.ocrSetField(o.id, k, v)); assert.ok(!r.ok && r.fields[k], k + ' = ' + v);
  });
});

test('D8 – áp dụng OCR ghi cả điều khoản HĐ vào lượt thuê; ngày đã có hóa đơn phát hành không đổi', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const cf = S.all('contractFiles').find(f => S.one('invoices', i => i.stayId === f.stayId && i.lifecycle !== 'draft'));
  const s0 = plain(Q.stay(cf.stayId));
  const o = ocrReadyFor(TH, cf);
  X.ocrSetField(o.id, 'payMonths', '3'); X.ocrSetField(o.id, 'endDate', '31/12/2027'); X.ocrSetField(o.id, 'rentStart', '2020-01-05');
  confirmAll(TH, o);
  const res = X.ocrApply(o.id, { from: '2026-11-01' });
  const s1 = Q.stay(cf.stayId);
  assert.equal(s1.payMonths, 3); assert.equal(s1.endDate, '2027-12-31');
  assert.equal(s1.rentStart, s0.rentStart, 'đã có hóa đơn phát hành → không đổi ngày tính tiền');
  assert.ok(res.terms.skipped.includes('rentStart'));
  assert.ok(Q.ocrTermsCompare(Q.ocrSession(o.id)).some(t => t.key === 'payMonths'));
});

test('D9 / D10 – file HĐ mới thay phiên OCR của file cũ; vận hành không sửa phiên ngoài phạm vi', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const cf = S.all('contractFiles')[0];
  const o = ocrReadyFor(TH, cf); confirmAll(TH, o);
  X.addContractFile(cf.stayId, { name: 'HD-ky-lai.pdf', size: 1000 });
  assert.equal(Q.ocrSession(o.id).status, 'superseded');
  assert.ok(!attempt(() => X.ocrApply(o.id, { from: '2026-11-01' })).ok);
  assert.ok(!attempt(() => X.addContractFile(cf.stayId, { name: 'virus.exe', size: 1 })).ok, 'đuôi file');
  TH.auth.login('vanhanh'); const sc = TH.auth.buildingScope();
  const out = S.all('contractFiles').find(f => !sc.has((Q.stay(f.stayId) || {}).buildingId));
  TH.auth.login('ketoan'); const o2 = X.runOcr(out.id);
  TH.auth.login('vanhanh');
  assert.ok(!attempt(() => X.ocrSetField(o2.id, 'rent', '5000000')).ok);
  assert.ok(!attempt(() => X.ocrConfirmGroup(o2.id, 'party', true)).ok);
});

test('D12 – kho tài liệu: gắn khách / lượt thuê và phiếu thu; ⛔ thay bản không hiện hành; ⛔ tải tài liệu đã xóa; ⛔ file lạ', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const st = S.all('stays').find(s => s.status === 'active');
  const d1 = X.uploadDocument({ type: 'appendix', buildingId: st.buildingId, objectType: 'stay', objectId: st.id, name: 'Phu-luc.pdf' });
  assert.equal(d1.objectId, st.id); assert.equal(d1.roomId, st.roomId);
  const py = S.all('payments').find(p => p.buildingId);
  assert.ok(attempt(() => X.uploadDocument({ type: 'voucher', buildingId: py.buildingId, objectType: 'payment', objectId: py.id, name: 'UNC.jpg' })).ok);
  assert.ok(!attempt(() => X.uploadDocument({ type: 'voucher', buildingId: st.buildingId, objectType: 'payment', objectId: 'khong-co', name: 'UNC.jpg' })).ok);
  assert.ok(!attempt(() => X.uploadDocument({ type: 'other', buildingId: st.buildingId, objectType: 'building', name: 'setup.exe' })).ok);
  const b = X.uploadDocument({ type: 'handover', buildingId: st.buildingId, objectType: 'building', name: 'BB.pdf' });
  X.uploadDocument({ replaceId: b.id, name: 'BB-v2.pdf' });
  assert.ok(!attempt(() => X.uploadDocument({ replaceId: b.id, name: 'BB-v3.pdf' })).ok, 'bản cũ đã bị thay');
  const x = X.uploadDocument({ type: 'other', buildingId: st.buildingId, objectType: 'building', name: 'tam.pdf' });
  X.deleteDocument(x.id, 'Tải nhầm');
  assert.ok(!attempt(() => X.downloadDocument(x.id)).ok);
});

/* ---------------- Mở rộng ---------------- */
test('D16 – ứng viên Zalo sự kiện lượt thuê có phòng để xem trước (không có hóa đơn)', () => {
  const TH = boot({ user: 'ketoan' }); const X = TH.actions;
  const c = X.zaloCandidates('zr_expiring', [], TH.store.meta.period);
  assert.ok(c.length && c.every(i => !i.invoice && i.stay && i.stay.roomId));
});

test('D17 – vai trò Phase 2 bị chặn ở mốc 1A/1B kể cả tài khoản tạo mới', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions;
  X.addUser({ username: 'sale2', role: 'sale', display: 'Sale mới' });
  S.meta.milestone = '1A';
  assert.ok(!attempt(() => TH.auth.login('sale2')).ok, 'đăng nhập bị chặn');
  TH.auth.login('admin');
  assert.ok(!attempt(() => X.addUser({ username: 'sale3', role: 'sale', display: 'x' })).ok);
  const u = S.all('users').find(x => x.role === 'vanhanh');
  assert.ok(!attempt(() => X.updateUser(u.id, { role: 'sale' })).ok);
  assert.ok(!attempt(() => X.cancelReopen('2026-09', 'x')).ok, 'hủy yêu cầu mở lại thuộc Phase 2');
});

test('NT-0 – Phase 1 không đổi sau Đợt D (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name + ' → ' + a.detail)), []);
});
