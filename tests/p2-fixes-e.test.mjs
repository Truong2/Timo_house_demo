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

test('NT-0 – Phase 1 không đổi sau Đợt E (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name + ' → ' + a.detail)), []);
});
