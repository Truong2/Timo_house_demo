/* Phase 2 – Đợt E: lỗi kiểm tra 01/10 + backlog "Chưa làm – chờ khách chọn". Kịch bản docs/uat/Phase2_Kich_ban_kiem_thu.md mục 8. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));

/* ---------------- E0 – lỗi kiểm tra 01/10 ---------------- */
test('E0.1 – seed: khách cũ của phòng có lượt chờ nhận đã báo trả, bàn giao trước ngày khách mới tính tiền', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store;
  const pending = S.where('stays', s => s.status === 'pending');
  assert.ok(pending.length > 0);
  const bad = pending.map(p => [p, S.one('stays', a => a.status === 'active' && a.roomId === p.roomId)]).filter(([p, a]) => a && p.rentStart <= (a.plannedLeaveDate || a.endDate));
  assert.deepEqual(plain(bad.map(([p, a]) => p.code + ' / ' + a.code)), [], 'không lượt chờ nhận nào chồng lên thời gian ở của khách cũ');
  const a = S.one('stays', x => x.status === 'active' && x.roomId === 'r_404S4');
  assert.equal(a.plannedLeaveDate, '2026-09-30'); assert.equal(a.noticeDate, '2026-09-01'); assert.equal(a.stopBillingDate, null, 'chỉ báo trả, chưa kết thúc');
});

test('E0.1 – nhận phòng deal seed: kết thúc lượt cũ ngày 30/09 rồi nhận 01/10; ⛔ nhận khi còn khách cũ', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const d = S.one('deals', x => x.code === 'GD-2609-036'); const old = Q.currentStay(d.roomId);
  const r = attempt(() => X.receiveDeal(d.id, '2026-10-01'));
  assert.ok(!r.ok && /khách cũ/.test(r.msg));
  X.endStay(old.id, { endType: 'expired', date: old.plannedLeaveDate });
  X.receiveDeal(d.id, '2026-10-01');
  assert.equal(S.get('deals', d.id).status, 'received');
  assert.equal(Q.stay(d.stayId).status, 'active');
  assert.equal(S.where('stays', s => s.roomId === d.roomId && s.status === 'active').length, 1);
});

test('E0.1 – số liệu không đổi: phòng có lượt chờ nhận vẫn ở nhóm "đang chờ", không vào "trống cuối tháng"', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, Q = TH.q;
  const v = Q.vacancy('2026-09-29'); const waiting = new Set(v.waiting.map(r => r.id));
  S.where('stays', s => s.status === 'pending').forEach(p => assert.ok(waiting.has(p.roomId) || !(Q.room(p.roomId) || {}).price, p.code));
  assert.ok(!v.endOfMonth.some(r => waiting.has(r.id)));
});

/* ---------------- E1 – chặn theo mốc, Zalo, tài liệu ---------------- */
test('E1.1 – mốc 1A: action Phase 2 bị chặn ở mức action (không chỉ route); ⛔ gọi trực tiếp từ console', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const deal = S.one('deals', d => d.status === 'closed'); const inbox = S.all('zaloInbox')[0];
  S.meta.milestone = '1A';
  const calls = {
    addLead: () => X.addLead({ phone: '0911555666', source: 'Zalo' }),
    cancelDeal: () => X.cancelDeal(deal.id, 'x'),
    addRepair: () => X.addRepair({ buildingId: 'b_T2', date: '2026-09-20', content: 'x' }),
    lockShareRun: () => X.lockShareRun('b_G1', '2026-08', 'web'),
    uploadDocument: () => X.uploadDocument({ type: 'pccc', buildingId: 'b_T2', objectType: 'building', objectId: 'b_T2', name: 'pccc.pdf' }),
    addCommissionPolicy: () => X.addCommissionPolicy({ from: '2026-10-01', base: 0.5 }),
    updateInbox: () => X.updateInbox(inbox.id, { status: 'processing' }),
  };
  Object.entries(calls).forEach(([k, fn]) => { const r = attempt(fn); assert.ok(!r.ok && /chưa mở ở mốc/.test(r.msg), k + ': ' + r.msg); });
  assert.deepEqual(plain(X.buildDealCommissions(deal.id, true)), [], 'hoa hồng tự động không chạy ở 1A (bỏ cọc UI-07 vẫn chạy)');
});

test('E1.1 – mốc 1A: bỏ cọc lượt thuê chờ nhận ở UI-07 vẫn chạy (deal đồng bộ, không tính hoa hồng)', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions;
  const deal = S.one('deals', d => d.status === 'closed'); const n = S.where('commissions', c => c.dealId === deal.id).length;
  S.meta.milestone = '1A';
  X.endStay(deal.stayId, { endType: 'forfeit', date: '2026-09-29', reason: 'khách báo bỏ' });
  assert.equal(S.get('stays', deal.stayId).status, 'ended');
  assert.equal(S.get('deals', deal.id).status, 'forfeited');
  assert.equal(S.where('commissions', c => c.dealId === deal.id).length, n);
});

test('E1.2 – Zalo sắp hết HĐ: gia hạn trước khi gửi → bỏ qua "sự kiện không còn đúng"; còn đúng → gửi', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions;
  const b = X.createZaloBatch({ ruleId: 'zr_expiring' });
  const msgs = S.where('zaloMessages', m => m.batchId === b.id); assert.ok(msgs.length >= 2);
  const ext = msgs[0]; S.update('stays', ext.stayId, { endDate: '2027-12-31' });
  X.sendZaloBatch(b.id);
  const after = S.get('zaloMessages', ext.id);
  assert.equal(after.status, 'skipped_stale'); assert.match(after.error, /gia hạn/);
  assert.ok(S.where('zaloMessages', m => m.batchId === b.id && m.id !== ext.id).every(m => m.status !== 'skipped_stale'));
  assert.equal(S.get('zaloBatches', b.id).stats.skipped, 1);
  assert.ok(X.zaloCandidates('zr_expiring').every(c => c.stay.id !== ext.stayId), 'lượt đã gia hạn không còn là ứng viên');
});

test('E1.2 – Zalo đã chi hoàn cọc: phiếu hoàn không còn "đã chi" → bỏ qua (kiểm tra lại thuần)', () => {
  const TH = boot({ user: 'admin' }); const Z = TH.calc.zalo;
  const m = { event: 'refund_paid', amount: 1000000, refundId: 'rf_1' };
  assert.equal(Z.recheck(m, 0, { refund: { status: 'paid', paidAmount: 1200000 } }).amount, 1200000);
  const r = Z.recheck(m, 0, { refund: { status: 'approved' } });
  assert.equal(r.action, 'skip'); assert.equal(r.status, 'skipped_stale');
  const e = { event: 'contract_expiring', date: '2026-10-20' };
  assert.equal(Z.recheck(e, 0, { stay: { status: 'ended', endDate: '2026-10-20' } }).action, 'skip');
  assert.equal(Z.recheck(e, 0, { stay: { status: 'active', endDate: '2026-10-20' }, asOf: '2026-09-29', warnDays: 35 }).action, 'send');
  assert.equal(Z.recheck(e, 0, { stay: { status: 'active', endDate: '2026-10-20' }, asOf: '2026-09-01', warnDays: 35 }).action, 'skip', 'ngoài cửa sổ 35 ngày');
  assert.equal(Z.recheck({ event: 'overdue' }, 0).status, 'skipped_paid');
});

test('E1.2 – hộp thư: quản lý tòa là trưởng phòng (TPVH) → gán chính người đó', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, Q = TH.q;
  const tp = S.one('employees', e => e.title === 'TPVH');
  const a = S.one('assignments', x => x.buildingId === 'b_T2' && x.responsibility === 'operate' && !x.to && !x.roomId);
  S.update('assignments', a.id, { employeeId: tp.id });
  assert.equal(Q.inboxAssignee('b_T2').id, tp.id);
  S.all('zaloInbox').forEach(x => assert.equal(x.assigneeId, (Q.inboxAssignee(x.buildingId) || {}).id || null, 'seed cùng quy tắc ' + x.id));
});

test('E1.3 – tài liệu: loại PCCC; sale chỉ tải HĐ khách của deal mình; kỹ thuật chỉ tải biên bản / ảnh chỉ số tòa có việc; ⛔ ngoài phạm vi', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q, A = TH.auth;
  const doc = X.uploadDocument({ type: 'pccc', buildingId: 'b_T2', objectType: 'building', objectId: 'b_T2', name: 'giay-pccc-T2.pdf', size: 1000 });
  assert.equal(doc.type, 'pccc');
  A.login('sale'); const me = S.session.employeeId;
  const mine = S.one('deals', d => d.saleIds.includes(me) && d.stayId); const other = S.one('deals', d => !d.saleIds.includes(me) && d.stayId);
  A.login('admin');
  X.addContractFile(mine.stayId, { name: 'hd-mine.pdf', size: 1000 }); X.addContractFile(other.stayId, { name: 'hd-other.pdf', size: 1000 });
  const cf = (sid) => Q.documentsAll().find(d => d.source === 'contractFile' && d.objectId === sid && d.status === 'current');
  A.login('sale');
  assert.ok(X.downloadDocument(cf(mine.stayId).id));
  const r1 = attempt(() => X.downloadDocument(cf(other.stayId).id)); assert.ok(!r1.ok && /ngoài phạm vi/.test(r1.msg));
  assert.ok(!attempt(() => X.downloadDocument(doc.id)).ok, 'sale không tải PCCC');
  assert.ok(!A.can('documents.view'));
  A.login('kythuat'); const w = S.session.employeeId;
  const rb = (S.one('repairLogs', r => r.workerId === w) || {}).buildingId;
  A.login('admin');
  const hv = X.uploadDocument({ type: 'handover', buildingId: rb, objectType: 'building', objectId: rb, name: 'bien-ban.pdf', size: 1000 });
  const nob = S.one('buildings', b => !S.one('repairLogs', r => r.workerId === w && r.buildingId === b.id));
  const hv2 = X.uploadDocument({ type: 'handover', buildingId: nob.id, objectType: 'building', objectId: nob.id, name: 'bien-ban-2.pdf', size: 1000 });
  A.login('kythuat');
  assert.ok(X.downloadDocument(hv.id));
  assert.ok(!attempt(() => X.downloadDocument(hv2.id)).ok, 'tòa không có việc của thợ');
  assert.ok(Q.downloadableDocs().every(d => ['handover', 'meter_photo'].includes(d.type)));
});

/* ---------------- E2 – sổ sửa chữa, import hoa hồng, UI-22, cổ đông ---------------- */
const worker = (TH) => TH.store.all('employees').filter(e => e.title === 'KỸ THUẬT' && e.repairPay)[0];
const job = (TH, extra = {}) => Object.assign({ workerId: worker(TH).id, date: '2026-09-20', buildingId: 'b_T2', desc: 'Thay vòi sen', jobType: 'water', labor: 100000, material: 250000 }, extra);

test('E2.1 – sổ sửa chữa: ảnh việc sửa, gắn lượt thuê đúng phòng, trạng thái thu chỉ cho khách chịu; ⛔ sai phòng / sai loại file', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const st = S.one('stays', s => s.status === 'active' && s.buildingId === 'b_T2'); const other = S.one('stays', s => s.status === 'active' && s.roomId !== st.roomId);
  let r = attempt(() => X.addRepair(job(TH, { roomId: st.roomId, stayId: other.id }))); assert.ok(!r.ok && r.fields.stayId);
  r = attempt(() => X.addRepair(job(TH, { roomId: st.roomId, collectStatus: 'QL bank về HT' }))); assert.ok(!r.ok && /khách chịu/.test(r.fields.collectStatus));
  r = attempt(() => X.addRepair(job(TH, { roomId: st.roomId, photos: [{ name: 'virus.exe', size: 1 }] }))); assert.ok(!r.ok && r.fields.photos);
  const ok = X.addRepair(job(TH, { roomId: st.roomId, stayId: st.id, bearer: 'tenant', collectStatus: 'QL bank về HT', photos: [{ name: 'truoc.jpg', size: 2048 }, { name: 'sau.png', size: 4096 }] }));
  assert.equal(ok.stayId, st.id); assert.equal(ok.collectStatus, 'QL bank về HT'); assert.equal(ok.photos.length, 2);
  X.confirmRepairs([ok.id]);
  const adj = X.adjustRepair(ok.id, { collectStatus: 'Trừ cọc', reason: 'khách đồng ý trừ cọc' });
  assert.equal(adj.collectStatus, 'Trừ cọc'); assert.equal(adj.history.at(-1).collectStatus, 'QL bank về HT');
});

test('E2.1 – tồn sơn theo điểm: nhập / xuất; ⛔ xuất vượt tồn', () => {
  const TH = boot({ user: 'ketoan' }); const X = TH.actions, Q = TH.q;
  const p0 = Q.paintStock(); const pt = p0[0];
  X.addPaintMove({ kind: 'in', point: pt.point, qty: 4, date: '2026-09-20' });
  assert.equal(Q.paintStock().find(x => x.point === pt.point).qty, pt.qty + 4);
  const room = TH.store.one('rooms', r => r.price > 0);
  X.addPaintMove({ kind: 'out', point: pt.point, qty: 1, date: '2026-09-21', roomCode: room.code });
  assert.equal(Q.paintStock().find(x => x.point === pt.point).qty, pt.qty + 3);
  const r = attempt(() => X.addPaintMove({ kind: 'out', point: pt.point, qty: pt.qty + 10, date: '2026-09-22' })); assert.ok(!r.ok && /Vượt tồn/.test(r.fields.qty));
  X.addPaintMove({ kind: 'in', point: 'vp', qty: 2, date: '2026-09-20' });
  assert.equal(Q.paintStock().find(x => x.point === 'VP').qty, (p0.find(x => x.point === 'VP') || { qty: 0 }).qty + 2);
});

test('E2.1 – quyết toán ứng chi [GĐ-E2]: chứng từ quỹ, không thêm chi phí; ⛔ quyết toán 2 lần, đổi vật tư / ứng sau quyết toán, kỳ song song Excel', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const w = worker(TH); const period = '2026-09';
  S.where('repairLogs', r => r.workerId === w.id && r.period === period && r.status === 'draft').forEach(r => X.voidRepair(r.id, 'dọn dữ liệu thử'));
  const a = X.addRepair(job(TH, { material: 600000 })); X.confirmRepairs([a.id]);
  X.setRepairAdvance(w.id, period, 400000, 'ứng đầu kỳ');
  const st = Q.repairSettlement(w.id, period);
  const nExp = S.all('expenses').length;
  const doc = X.settleRepairAdvance(w.id, period, { method: 'bank' });
  assert.equal(doc.diff, st.diff); assert.equal(doc.kind, st.diff > 0 ? 'pay' : st.diff < 0 ? 'refund' : 'zero');
  assert.equal(S.all('expenses').length, nExp, 'không ghi chi phí mới');
  assert.ok(!attempt(() => X.settleRepairAdvance(w.id, period)).ok);
  assert.ok(/quyết toán/.test(attempt(() => X.setRepairAdvance(w.id, period, 100000)).msg));
  assert.ok(!attempt(() => X.addRepair(job(TH, { material: 50000 }))).ok, 'thêm vật tư vào kỳ đã quyết toán');
  assert.ok(!attempt(() => X.adjustRepair(a.id, { material: 700000, reason: 'x' })).ok);
  assert.ok(/song song Excel/.test(attempt(() => X.settleRepairAdvance(w.id, '2026-08')).msg));
});

test('E2.2 – import hoa hồng lịch sử: F/G/H/loại ca/I; I ≠ F × H chỉ cảnh báo [GĐ-E4]; ⛔ loại ca lạ, tỷ lệ sai', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions;
  const room = S.all('rooms').find(r => r.price > 0);
  const base = { period: '2026-08', room: room.code, sale: 'CTV A', F: '3.600.000', G: '12 tháng' };
  const v = X.validateImport('commissions', [Object.assign({ code: 'HI-1', H: '16,67%', caseType: 'Trùng 3', amount: '600120' }, base), Object.assign({ code: 'HI-2', H: '50%', caseType: 'Thường', amount: '1700000' }, base),
    Object.assign({ code: 'HI-3', H: '50%', caseType: 'Lạ', amount: '1800000' }, base), Object.assign({ code: 'HI-4', H: '150%', amount: '1800000' }, base)]);
  assert.equal(v[0].status, 'ok'); assert.ok(Math.abs(v[0].data.H - 0.1667) < 1e-9); assert.equal(v[0].warns.length, 0);
  assert.equal(v[1].status, 'ok'); assert.match(v[1].warns.join(), /I ≠ F × H/);
  assert.equal(v[2].status, 'error'); assert.match(v[2].errs.join(), /Loại ca/);
  assert.equal(v[3].status, 'error'); assert.match(v[3].errs.join(), /tỷ lệ/);
  const nE = S.all('expenses').length;
  X.commitImport('commissions', 'hh-t8.csv', v);
  const imp = S.all('commissionImports'); assert.equal(imp.length, 2);
  assert.equal(imp[1].caseType, 'normal'); assert.equal(imp[1].expected, 1800000); assert.equal(imp[1].amount, 1700000);
  assert.equal(S.all('expenses').length, nE + 2); assert.ok(imp.every(x => S.get('expenses', x.expenseId).category === 'commission'));
});

test('E2.3 – UI-22: tỷ lệ riêng theo đối tác trong chính sách; tài khoản đối tác; ⛔ tỷ lệ > 100%, STK sai', () => {
  const TH = boot({ user: 'admin' }); const X = TH.actions, Q = TH.q;
  let r = attempt(() => X.addCommissionPolicy({ from: '2026-11-01', base: 0.5, partners: { MOITHUE: 1.5 }, note: 'x' })); assert.ok(!r.ok && /0–100%/.test(r.fields.partners));
  X.addCommissionPolicy({ from: '2026-11-01', base: 0.5, partners: { moithue: 0.7, 'NHA TOT': 0.6 }, note: 'Thỏa thuận mới' });
  assert.deepEqual(plain(Q.commissionPolicy('2026-11-15').partners), { MOITHUE: 0.7, 'NHA TOT': 0.6 });
  assert.equal(TH.calc.commission.suggest({ term: 12, partner: 'MOITHUE', share: 1 }, Q.commissionPolicy('2026-11-15')).rate, 0.7);
  r = attempt(() => X.savePartner({ name: 'MOITHUE', bank: 'VCB', number: '12ab', holder: 'CT MOITHUE' })); assert.ok(!r.ok && r.fields.number);
  X.savePartner({ name: 'MOITHUE', bank: 'VCB', number: '0123456789', holder: 'CONG TY MOITHUE' });
  assert.equal(Q.partnerOf('moithue').number, '0123456789');
  assert.ok(!attempt(() => X.savePartner({ name: 'MoiThue', bank: 'VCB', number: '0123456789', holder: 'x' })).ok, 'trùng tên đối tác');
  TH.auth.login('sale'); assert.ok(!attempt(() => X.savePartner({ name: 'X', bank: 'VCB', number: '0123456789', holder: 'x' })).ok);
});

test('E2.4 – cổ đông: sửa thông tin có lịch sử; chứng từ góp vốn chỉ admin / kế toán thấy; K/L dòng tổng G1 T8', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const r0 = Q.shareRatios('b_G1', '2026-08-31').find(r => r.shareholderId !== 'sh_CHUNG'); const sh = Q.shareholder(r0.shareholderId);
  const u = X.updateShareholder(sh.id, { name: sh.name, phone: '0912345678', bank: 'TCB 1903…', note: '' });
  assert.equal(u.phone, '0912345678'); assert.equal(u.history.length, 1);
  assert.ok(!attempt(() => X.uploadDocument({ type: 'capital', buildingId: 'b_T2', objectType: 'shareholder', objectId: sh.id, name: 'gop-von.pdf' })).ok, 'tòa không góp vốn');
  const doc = X.uploadDocument({ type: 'capital', buildingId: 'b_G1', objectType: 'shareholder', objectId: sh.id, name: 'gop-von.pdf', size: 1000 });
  assert.ok(Q.documentsScoped().some(d => d.id === doc.id));
  assert.ok(!attempt(() => X.deleteDocument(doc.id, 'x')).ok, 'chứng từ gắn cổ đông không xóa');
  TH.auth.login('vanhanh'); assert.ok(!Q.documentsScoped().some(d => d.id === doc.id));
  TH.auth.login('ketoan');
  const run = Q.shareRun('b_G1', '2026-08', 'excel');
  assert.ok(Math.abs(run.K - 23.96) < 0.01, 'K ' + run.K); assert.ok(Math.abs(run.L - 3.0238) < 0.0001, 'L ' + run.L);
});

/* ---------------- E3 – báo cáo & Dashboard ---------------- */
test('E3.1 – UI-46: lọc loại T/S/G, NV vận hành, cổ đông chỉ giới hạn tòa (không đổi định nghĩa doanh số)', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, Q = TH.q, QO = TH.qo;
  const p = '2026-09'; const all = QO.sales(p, 'building');
  const g = QO.sales(p, 'building', { group: 'G' });
  assert.ok(g.conv.every(x => (Q.building(x.key) || {}).group === 'G'));
  assert.ok(g.totals.volume <= all.totals.volume);
  const shId = Q.shareRatios('b_G1', '2026-09-30').find(r => r.shareholderId !== 'sh_CHUNG').shareholderId;
  const sh = QO.sales(p, 'building', { shareholder: shId });
  assert.ok(sh.conv.every(x => Q.shareRatios(x.key, '2026-09-30').some(r => r.shareholderId === shId)));
  const mgr = Q.managerOf('b_T2', '2026-09-30');
  const m = QO.sales(p, 'building', { manager: mgr.id });
  assert.ok(m.conv.every(x => (Q.managerOf(x.key, '2026-09-30') || {}).id === mgr.id));
});

test('E3.2 – UI-43 web: tòa trả điện qua chủ nhà – chi = đơn giá × kWh; chưa có đơn giá → cờ [GĐ-E5]; "như Excel" không đổi (NT-3)', () => {
  const TH = boot({ user: 'ketoan' }); const X = TH.actions, QO = TH.qo;
  const A = QO.amDuong('2026-09', 'electric', 'web');
  const s32 = A.rows.find(r => r.b === 'S32'); const s39 = A.rows.find(r => r.b === 'S39');
  if (s32) { assert.equal(s32.L, 2500 * s32.kwh); assert.match(s32.Lsrc, /Trả chủ nhà/); assert.ok(s32.flags.includes('Trả điện qua chủ nhà')); }
  if (s39) { assert.equal(s39.L, null); assert.ok(s39.flags.some(f => /chưa có đơn giá/.test(f))); }
  assert.ok(s32 || s39, 'có ít nhất một tòa trả qua chủ nhà trong kỳ web');
  const r = attempt(() => X.setElectricViaOwner('b_T2', { on: true, unitPrice: 50000, from: '2026-09-01' })); assert.ok(!r.ok && r.fields.unitPrice);
  X.setElectricViaOwner('b_T2', { on: true, unitPrice: 3000, from: '2026-09-01', note: 'thử' });
  const t2 = QO.amDuong('2026-09', 'electric', 'web').rows.find(x => x.b === 'T2');
  if (t2 && !t2.Lsrc.startsWith('Chứng từ')) assert.equal(t2.L, 3000 * t2.kwh);
  X.setElectricViaOwner('b_T2', { on: false });
  assert.equal(TH.q.building('b_T2').vendor.electricViaOwner, null);
  const ex = QO.amDuong('2026-07', 'electric', 'excel'); assert.equal(ex.total.L, 913178913);
});

test('E3.4 – UI-44: mọi cách gộp giữ khóa gốc để mở đúng phần sổ UI-47; khách chịu có link phiếu hoàn / hóa đơn', () => {
  const TH = boot({ user: 'ketoan' }); const QO = TH.qo;
  for (const by of ['building', 'room', 'worker', 'jobType', 'reason', 'bearer']) {
    const R = QO.repairs('2026-08', 'excel', by); assert.ok(R.rows.length, by);
    // tòa chỉ có trong sổ Excel, không có trên web (vd S48B) thì không mở được theo tòa
    assert.ok(R.rows.every(x => x.ref && (Object.values(x.ref).some(Boolean) || (by === 'building' && !x.buildingId))), by + ' có khóa gốc');
    assert.ok(R.rows.every(x => Array.isArray(x.refunds) && Array.isArray(x.invoices) && Array.isArray(x.expenses)), by);
  }
  const w = QO.repairs('2026-08', 'excel', 'worker').rows[0]; assert.ok(TH.q.emp(w.ref.worker));
});

test('E3.5 / E3.6 – leader theo ngày, chỉ team trực tiếp, vai trò phụ trách [GĐ-E6]', () => {
  const TH = boot({ user: 'admin', kit: true }); const S = TH.store, Q = TH.q, K = TH.kit;
  const d = '2026-09-30';
  const tp = Q.teamLeaders(d).find(e => e.title === 'TPVH');
  const all = Q.leaderBuildings(tp.id, d); const direct = Q.leaderBuildings(tp.id, d, { direct: true });
  assert.ok(all.size > 0); assert.ok([...direct].every(b => all.has(b)), 'team trực tiếp ⊂ cả nhánh');
  const kd = Q.teamLeaders(d).find(e => e.title === 'TNKD');
  if (kd) { const sb = Q.leaderBuildings(kd.id, d, { resp: 'sale' }); const team = Q.teamOf(kd.id, d);
    assert.deepEqual(plain([...sb].sort()), plain([...new Set(S.all('deals').filter(x => x.closeDate.startsWith('2026-09') && x.saleIds.some(id => team.has(id))).map(x => x.buildingId))].sort())); }
  assert.equal(Q.leaderBuildings(tp.id, d, { resp: 'cleaning' }).size, 0, 'vai trò chưa có dữ liệu phân công → rỗng');
  // leader / quản lý theo ngày: người đã thôi vai trò vẫn tìm được khi xem kỳ cũ
  const old = S.all('orgLinks').find(l => l.to); if (old) { assert.ok(Q.teamLeaders(old.to).some(e => e.id === old.leaderId) || Q.teamLeaders().some(e => e.id === old.leaderId)); }
  assert.ok(K.managerOpts(d).length > 0);
});

test('NT-0 – Phase 1 không đổi sau Đợt E (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name + ' → ' + a.detail)), []);
});
