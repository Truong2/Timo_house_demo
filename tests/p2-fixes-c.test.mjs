/* Phase 2 – sửa lỗi audit 30/09, Đợt C (phần còn thiếu so với đặc tả). Kịch bản docs/uat/Phase2_Kich_ban_kiem_thu.md mục "Audit 30/09 – lỗi đã sửa". */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));
const lock = (TH, period) => { const S = TH.store; const ms = S.meta.milestone; S.meta.milestone = '1A'; TH.actions.closePeriod(period); S.meta.milestone = ms; };

test('C-UI21 – sửa ngày nhận dự kiến là sự kiện riêng; thu đủ/thiếu gồm cọc + tháng đầu', () => {
  const TH = boot({ user: 'truongkd' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const d = Q.salesScoped(S.all('deals')).find(x => x.status === 'closed');
  assert.ok(!attempt(() => X.setDealMoveIn(d.id, '2026-11-02', '')).ok, 'phải có lý do');
  X.setDealMoveIn(d.id, '2026-11-02', 'Khách xin lùi ngày');
  const d2 = Q.deal(d.id); assert.equal(d2.moveInDate, '2026-11-02'); assert.ok(d2.events.some(e => e.type === 'movein'));
  assert.equal(Q.stay(d.stayId).moveInDate, '2026-11-02'); assert.equal(Q.stay(d.stayId).rentStart, d.billingStart, 'ngày tính tiền không đổi');
  const rc = S.all('deals').find(x => x.status === 'received');
  assert.ok(['full', 'partial', 'unpaid', 'none'].includes(Q.dealCollect(rc).first));
});

test('C-UI22 – chỉ tiêu doanh số theo từng sale có ngày hiệu lực; UI-46 lọc theo sale / team / tòa', () => {
  const TH = boot({ user: 'admin' }); const S = TH.store, X = TH.actions, Q = TH.q, QO = TH.qo;
  const e = Q.salesStaff()[0]; const base = Q.param('salesTarget', '2026-10-31');
  assert.equal(Q.salesTarget(e.id, '2026-10-31'), base);
  X.setSalesTarget(e.id, 55000000, '2026-10-01', 'Sale mới – chỉ tiêu thấp');
  assert.equal(Q.salesTarget(e.id, '2026-10-31'), 55000000); assert.equal(Q.salesTarget(e.id, '2026-09-30'), base);
  const all = QO.sales('2026-09', 'sale'); const d = S.all('deals').find(x => TH.f.period(x.closeDate) === '2026-09');
  const one = QO.sales('2026-09', 'sale', { sale: d.saleIds[0] });
  assert.ok(one.volume.every(v => v.id === d.saleIds[0] || S.all('deals').some(x => x.saleIds.includes(v.id) && x.saleIds.includes(d.saleIds[0]))));
  assert.ok(one.totals.volume <= all.totals.volume);
  const byB = QO.sales('2026-09', 'sale', { building: d.buildingId }); assert.ok(byB.totals.volume > 0 && byB.totals.volume <= all.totals.volume);
});

test('C-UI08 – OCR: đủ trường bắt buộc theo đặc tả, vòng đời trạng thái, vận hành rà soát nhưng không áp dụng', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  ['signDate', 'moveInDate', 'payMonths', 'dueDay'].forEach(k => assert.ok(Q.OCR_REQUIRED.includes(k), k));
  const cf = S.all('contractFiles')[0];
  assert.equal(Q.ocrStatusOf(cf.id), Q.ocrOf(cf.id).length ? Q.ocrOf(cf.id)[0].status : 'uploaded');
  const o = X.runOcr(cf.id); assert.equal(S.get('contractFiles', cf.id).ocr, o.status);
  X.ocrSetField(o.id, 'payMonths', '');
  Q.OCR_GROUPS.filter(([g]) => g !== 'money').forEach(([g]) => X.ocrConfirmGroup(o.id, g, true));
  assert.ok(!attempt(() => X.ocrConfirmGroup(o.id, 'money', true)).ok, 'thiếu kỳ thanh toán → chưa rà xong nhóm');
  assert.ok(Q.OCR_ST.superseded && Q.OCR_ST.extracting && Q.OCR_ST.uploaded);
  // vận hành rà soát trong phạm vi, không áp dụng vào biểu phí
  TH.auth.login('vanhanh'); const sc = TH.auth.buildingScope();
  const mine = S.all('contractFiles').find(f => sc.has((Q.stay(f.stayId) || {}).buildingId));
  const o2 = X.runOcr(mine.id); assert.ok(o2);
  Q.OCR_GROUPS.forEach(([g]) => attempt(() => X.ocrConfirmGroup(o2.id, g, true)));
  const r = attempt(() => X.ocrApply(o2.id, { from: '2026-12-01' })); assert.ok(!r.ok);
  const other = S.all('contractFiles').find(f => !sc.has((Q.stay(f.stayId) || {}).buildingId));
  assert.ok(!attempt(() => X.runOcr(other.id)).ok, 'ngoài phạm vi tòa');
});

test('C-UI26 – HĐ khách nhiều phiên: bản cũ "đã thay"; tải xuống ghi nhật ký, chặn ngoài phạm vi', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const cf = S.all('contractFiles')[0];
  X.addContractFile(cf.stayId, { name: 'HD-ky-lai.pdf', size: 1000 });
  const docs = Q.documentsAll().filter(d => d.source === 'contractFile' && d.objectId === cf.stayId);
  assert.equal(docs.filter(d => d.status === 'current').length, 1); assert.ok(docs.some(d => d.status === 'superseded'));
  const n = S.all('auditLog').length; X.downloadDocument(docs[0].id); assert.equal(S.all('auditLog').length, n + 1);
  TH.auth.login('vanhanh'); const sc = TH.auth.buildingScope();
  const out = Q.documentsAll().find(d => d.buildingId && !sc.has(d.buildingId));
  assert.ok(!attempt(() => X.downloadDocument(out.id)).ok);
});

test('C-UI47 – khách chịu, khách còn ở → "Thu khác" trên hóa đơn nháp (chỉ khi kế toán áp)', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  X.createInvoiceDrafts('2026-10', ['b_G1'], { allowMissingReading: true });
  const inv = S.all('invoices').find(i => i.period === '2026-10' && i.lifecycle === 'draft' && i.buildingId === 'b_G1');
  const st = Q.stay(inv.stayId); const w = S.all('employees').find(e => e.title === 'KỸ THUẬT' && e.repairPay);
  const other0 = TH.calc.billing.expand(inv.lines).find(l => l.no === 13).amount || 0;
  const r = X.addRepair({ workerId: w.id, date: '2026-09-15', buildingId: 'b_G1', roomId: st.roomId, stayId: st.id, desc: 'Thay khóa – khách làm mất', jobType: 'replace', labor: 50000, material: 150000, bearer: 'tenant' });
  X.confirmRepairs([r.id]);
  assert.equal(TH.calc.billing.expand(Q.invoice(inv.id).lines).find(l => l.no === 13).amount || 0, other0, 'chưa áp thì hóa đơn không đổi');
  X.applyRepairToInvoice(r.id);
  assert.equal(TH.calc.billing.expand(Q.invoice(inv.id).lines).find(l => l.no === 13).amount, other0 + 200000);
  assert.equal(S.get('repairLogs', r.id).tenantCharge.status, 'applied');
  assert.ok(!attempt(() => X.applyRepairToInvoice(r.id)).ok, 'không áp hai lần');
});

test('C-UI45 – HS tổng = Σ T / Σ K; HS tạm tính theo tiền nhà đã thu; 3 nhóm phòng trống; nhãn tạm tính theo mốc', () => {
  const TH = boot({ user: 'admin' }); const QO = TH.qo;
  const O = QO.rooms('2026-09'); const T = O.totals;
  const hk = O.rows.filter(x => x.hsK);
  assert.ok(Math.abs(T.hs - hk.reduce((t, x) => t + x.hsT, 0) / hk.reduce((t, x) => t + x.hsK, 0) * 100) < 1e-9);
  assert.ok(O.rows.every(x => x.hsTemp == null || x.rentPaid >= 0));
  assert.equal(T.vac.now + T.vac.eom + T.vac.clean, O.rows.reduce((t, x) => t + x.vac.now + x.vac.eom + x.vac.clean, 0));
  assert.equal(T.hsFinal, true, 'kỳ 09 đã qua ngày 15 (hôm nay 30/09)');
  assert.equal(QO.rooms('2026-10').totals.hsFinal, false, 'kỳ 10 chưa qua mốc');
  assert.equal(QO.rooms('2026-08').totals.hsFinal, true, 'kỳ song song Excel');
});

test('C-UI27 / UI-44 – trung tâm báo cáo 4 nhóm theo đặc tả, kỳ và trạng thái theo dữ liệu; UI-44 nhóm theo phòng', () => {
  const TH = boot({ user: 'admin' }); const QO = TH.qo;
  TH.ms.set('2');
  const C = QO.catalog();
  assert.deepEqual(plain(C.map(g => g.label)), ['Kết quả kinh doanh', 'Phòng vận hành', 'Phòng kinh doanh', 'Drill-down']);
  assert.ok(C.flatMap(g => g.items).filter(i => i.status !== 'phase3').every(i => i.period && i.status === 'ready'));
  assert.equal(C[1].items.find(i => i.ui === 'UI-44').period, '2026-08');
  const R = QO.repairs('2026-08', 'excel', 'room');
  assert.ok(R.rows.length > 20 && R.rows.every(x => /-|\(chung\)/.test(x.key)));
  assert.equal(R.totals.labor, 23350000);
});

test('C-UI38 – hủy / từ chối yêu cầu mở lại phải có lý do; lịch sử ghi lại', () => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions;
  lock(TH, '2026-10'); X.requestReopen('2026-10', 'Nhập thiếu');
  assert.ok(!attempt(() => X.cancelReopen('2026-10', '')).ok);
  TH.auth.login('admin'); X.cancelReopen('2026-10', 'Không cần mở – dùng điều chỉnh sau khóa');
  const p = S.get('periods', '2026-10'); assert.equal(p.reopenRequest, null); assert.equal(p.status, 'closed');
  assert.ok(p.history.some(h => h.type === 'reopen_reject' && /điều chỉnh/.test(h.reason)), 'người khác hủy = từ chối');
  TH.auth.login('ketoan'); X.requestReopen('2026-10', 'Nhập thiếu lần 2'); X.cancelReopen('2026-10', 'Tự rút lại');
  assert.ok(S.get('periods', '2026-10').history.some(h => h.type === 'reopen_cancel' && h.reason === 'Tự rút lại'), 'người gửi rút lại = hủy');
});

test('NT-0 – Phase 1 không đổi sau Đợt C (bộ nghiệm thu trong app)', () => {
  const TH = boot({ user: 'admin', pages: true });
  assert.deepEqual(plain(TH.pages.acceptance().filter(a => !a.ok).map(a => a.name + ' → ' + a.detail)), []);
});
