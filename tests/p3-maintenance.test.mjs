/* Phase 3 – P3-2: lịch bảo dưỡng & kết quả (UI-35, đặc tả dòng 549), nhắc trước 7 ngày (CH-32) trên web và Zalo nội bộ (UI-39). Kịch bản F32. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));

test('P3-2 – seed 4 loại SRC-02; trạng thái chỉ dự kiến / đã thực hiện / quá hạn; "sắp đến hạn" là cờ 7 ngày', () => {
  const TH = boot({ user: 'admin' }); const Q = TH.q;
  const all = Q.maintTasks();
  assert.deepEqual(plain([...new Set(all.map(t => t.assetType))].sort()), ['elevator', 'pump', 'washer', 'water_filter']);
  assert.ok(all.every(t => ['planned', 'done', 'overdue', 'cancelled'].includes(t.state.status)));
  const st = Q.maintStats();
  assert.equal(st.remindDays, 7); assert.equal(st.overdue, 2); assert.equal(st.soon, 3);
  const soon = Q.maintTasks({ soon: true });
  assert.ok(soon.every(t => t.state.status === 'planned' && t.state.days >= 0 && t.state.days <= 7));
  TH.store.update('params', TH.store.all('params').find(p => p.key === 'maintRemindDays').id, { value: 3 });
  assert.equal(Q.maintStats().soon, 1, 'đổi tham số UI-38 còn 3 ngày (chỉ 01/10) → cửa sổ nhắc đổi theo');
});

test('P3-2 – hoàn thành có chu kỳ tự tạo lần kế tiếp; chi phí ghi UI-15 dòng 41; ⛔ thiếu kết quả, ⛔ hoàn thành lại', () => {
  const TH = boot({ user: 'ketoan' }); const Q = TH.q, X = TH.actions, S = TH.store;
  const t = Q.maintTasks({ status: 'overdue' }).find(x => x.assetType === 'pump');
  const r0 = attempt(() => X.completeMaintenance(t.id, { doneDate: '2026-09-29', vendor: 'Thợ ngoài' }));
  assert.ok(!r0.ok && r0.fields.result);
  const r = X.completeMaintenance(t.id, { doneDate: '2026-09-29', vendor: 'Điện nước Minh Phát', result: 'Thay phớt, chạy thử đạt', cost: 850000, photos: [{ name: 'bom-truoc.jpg' }] });
  assert.equal(r.task.status, 'done'); assert.equal(r.task.photos.length, 1);
  assert.equal(r.next.dueDate, '2027-03-20', 'chu kỳ 6 tháng từ hạn cũ 20/09');
  assert.equal(r.next.prevId, t.id); assert.equal(Q.maintTask(t.id).nextId, r.next.id);
  const e = S.get('expenses', r.task.expenseId);
  assert.equal(e.reportLine, 'repair'); assert.equal(e.source, 'maintenance'); assert.equal(e.amount, 850000); assert.equal(e.buildingId, t.buildingId);
  assert.ok(!attempt(() => X.completeMaintenance(t.id, { result: 'x', vendor: 'y' })).ok);
  const manual = X.planMaintenance({ assetId: t.assetId, dueDate: '2026-10-20', assigneeId: t.assigneeId });
  const r2 = X.completeMaintenance(manual.id, { doneDate: '2026-09-29', vendor: 'x', result: 'ok' });
  assert.equal(r2.next, null, 'lịch nhập tay không tạo lần kế tiếp');
});

test('P3-2 – quyền: kỹ thuật đánh dấu xong, không lập lịch, không ghi chi phí; leader chỉ thấy lịch tòa trong nhánh; ⛔ mốc 2', () => {
  const TH = boot({ user: 'kythuat' }); const Q = TH.q, X = TH.actions;
  const t = Q.maintTasks({ status: 'planned' })[0];
  assert.ok(!attempt(() => X.planMaintenance({ assetId: t.assetId, dueDate: '2026-10-30', vendor: 'x' })).ok);
  const rc = attempt(() => X.completeMaintenance(t.id, { result: 'ok', performerId: TH.store.session.employeeId, cost: 100000 }));
  assert.ok(!rc.ok && rc.fields.cost);
  X.completeMaintenance(t.id, { result: 'ok', performerId: TH.store.session.employeeId });
  TH.auth.login('leader'); const sc = TH.auth.buildingScope();
  assert.ok(Q.maintTasks().length > 0 && Q.maintTasks().every(x => sc.has(x.buildingId)));
  TH.auth.login('admin'); TH.ms.set('2');
  assert.ok(/Phase 3/.test(attempt(() => X.cancelMaintenance(t.id, 'x')).msg));
});

test('P3-2 – Zalo nhắc bảo dưỡng nội bộ: đợt gồm việc trong 7 ngày; kiểm tra lại trước khi gửi – đã làm / đổi hạn → bỏ qua', () => {
  const TH = boot({ user: 'admin' }); const Q = TH.q, X = TH.actions, S = TH.store;
  const b = X.createZaloBatch({ ruleId: 'zr_maint' });
  const msgs = S.where('zaloMessages', m => m.batchId === b.id);
  assert.equal(msgs.length, 3); assert.ok(msgs.every(m => m.taskId && m.employeeId));
  const [m1, m2] = msgs;
  X.completeMaintenance(m1.taskId, { result: 'Đã làm sớm', vendor: 'x' });
  X.updateMaintenance(m2.taskId, { dueDate: '2026-10-28' });
  X.sendZaloBatch(b.id);
  const after = S.where('zaloMessages', m => m.batchId === b.id);
  assert.equal(after.find(m => m.id === m1.id).status, 'skipped_stale');
  assert.equal(after.find(m => m.id === m2.id).status, 'skipped_stale');
  const m3 = after.find(m => m.id !== m1.id && m.id !== m2.id);
  assert.ok(['delivered', 'failed'].includes(m3.status) && /Nhắc bảo dưỡng/.test(m3.text || 'Nhắc bảo dưỡng'));
  assert.ok(!S.all('zaloInbox').some(x => after.some(m => m.id === x.messageId)), 'tin nội bộ không sinh phản hồi khách');
  assert.equal(S.all('smsMessages').filter(x => x.batchId === b.id).length, 0, 'không SMS dự phòng cho nhắc nội bộ');
  const r = attempt(() => X.createZaloBatch({ ruleId: 'zr_maint' }));
  assert.ok(!r.ok || S.where('zaloMessages', m => m.batchId === r.value.id).every(m => m.taskId !== m3.taskId), 'mỗi lần bảo dưỡng nhắc một lần');
});

test('P3-2 – UI-47 gắn lịch bảo dưỡng cùng tòa; ⛔ khác tòa', () => {
  const TH = boot({ user: 'admin' }); const Q = TH.q, X = TH.actions, S = TH.store;
  const t = Q.maintTasks({ status: 'overdue' })[0];
  const w = S.all('employees').find(e => e.title === 'KỸ THUẬT' && e.repairPay);
  const bad = attempt(() => X.addRepair({ workerId: w.id, date: '2026-09-27', buildingId: 'b_T2', desc: 'Thay rơ le bơm', jobType: 'electric', labor: 100000, material: 0, maintenanceTaskId: t.buildingId === 'b_T2' ? 'x' : t.id }));
  assert.ok(!bad.ok && bad.fields.maintenanceTaskId);
  const r = X.addRepair({ workerId: w.id, date: '2026-09-27', buildingId: t.buildingId, desc: 'Thay rơ le bơm', jobType: 'electric', labor: 100000, material: 250000, maintenanceTaskId: t.id });
  assert.equal(r.maintenanceTaskId, t.id); assert.deepEqual(plain(Q.maintTask(t.id).repairLogIds), [r.id]);
});

test('NT-0 – Phase 1 không đổi sau P3-2 (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name)), []);
});
