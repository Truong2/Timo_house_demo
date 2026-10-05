/* Bộ dữ liệu luồng tháng 9 (scripts/seed/generate-september-flow.mjs): các luồng nối nhau, số khớp Excel nguồn.
   Một lần boot cho cả file vì bộ dữ liệu lớn; mọi test chỉ đọc. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { boot } from './_app.mjs';
import { ROOT } from './_load.mjs';

const TH = boot({ dataset: 'september', pages: true });
const { store: S, q: Q, actions: X } = TH;
const P = '2026-09', D = TH.data.septemberFlow;
const sum = (xs, k) => xs.reduce((n, x) => n + Number(x[k] || 0), 0);
const step = prefix => D.summary.steps.find(s => s.name.startsWith(prefix));
const ids = c => new Set(S.all(c).map(x => x.id));
// Mảng sinh trong vm khác realm → so độ dài, in vài phần tử khi lỗi.
const none = (xs, what) => assert.equal(xs.length, 0, what + ': ' + [...xs].slice(0, 5).join(', '));

test('tháng 9 – store chọn bộ luồng tháng 9, ngày xem 05/10, kỳ 9 đã khóa', () => {
  assert.equal(S.dataset, D.id);
  assert.equal(S.meta.today, '2026-10-05');
  assert.equal(S.get('periods', P).status, 'closed');
  assert.equal(S.where('payrollRuns', r => r.period === P && r.status === 'closed').length, 1);
  assert.equal(S.where('allocationRuns', r => r.period === P && r.status === 'closed').length, 1);
});

test('tháng 9 – boot mặc định vẫn là bộ đối chiếu lịch sử', () => {
  const C = boot();
  assert.equal(C.store.dataset, 'classic');
  assert.equal(C.data.septemberFlow, undefined);
});

test('tháng 9 – không có tham chiếu treo giữa các luồng', () => {
  const stays = ids('stays'), invs = ids('invoices'), rates = ids('rateVersions'), reads = ids('meterReadings'), deals = ids('deals'), exps = ids('expenses'), blds = ids('buildings');
  const inv = S.where('invoices', i => i.period === P);
  none(inv.filter(i => !stays.has(i.stayId) || !rates.has(i.rateVersionId) || (i.readingId && !reads.has(i.readingId))).map(i => i.code), 'treo #1');
  none(S.all('payments').flatMap(p => (p.allocations || []).filter(a => !invs.has(a.invoiceId)).map(() => p.code)), 'treo #2');
  none(S.all('payments').filter(p => (p.allocations || []).reduce((n, a) => n + a.amount, 0) > p.amount + 0.5).map(p => p.code), 'treo #3');
  none(S.all('depositLedger').filter(l => !stays.has(l.stayId)).map(l => l.id), 'treo #4');
  none(S.all('refunds').filter(r => !stays.has(r.stayId)).map(r => r.code), 'treo #5');
  none(S.where('expenses', e => e.period === P && e.buildingId && !blds.has(e.buildingId)).map(e => e.code), 'treo #6');
  none(S.all('commissions').filter(c => !deals.has(c.dealId)).map(c => c.id), 'treo #7');
  none(S.all('commissions').flatMap(c => (c.installments || []).filter(i => !exps.has(i.expenseId)).map(() => c.id)), 'treo #8');
  none(S.all('deals').filter(d => d.stayId && !stays.has(d.stayId)).map(d => d.code), 'treo #9');
});

test('tháng 9 – hóa đơn Excel giữ nguyên tổng, sổ cọc không âm', () => {
  const excel = S.where('invoices', i => i.period === P && i.excel);
  assert.equal(excel.length, step('01.').count);
  assert.ok(Math.abs(sum(excel, 'totalDue') - step('01.').total) < 0.01);
  assert.ok(S.where('invoices', i => i.period === P).every(i => i.lifecycle === 'issued'));
  none(S.all('stays').filter(s => X.depositBalance(s.id) < -0.5).map(s => s.code), 'treo #10');
});

test('tháng 9 – ca khách mới: biểu phí có dịch vụ, chỉ số nối tiếp, hóa đơn đầu thu đủ', () => {
  const j = D.summary.journey, rate = Q.rateOf(j.stayId), inv = S.get('invoices', j.invoiceId);
  assert.ok(Object.keys(rate.items).length >= 2, 'biểu phí có dịch vụ');
  assert.equal(S.get('meterReadings', j.readingId).elPrev, j.meterStart.el);
  assert.equal(S.get('meterReadings', j.meterStart.from).roomId, j.roomId, 'chỉ số đầu lấy từ chính phòng đó');
  assert.ok(TH.calc.billing.expand(inv.lines).filter(l => l.amount).length > 1, 'hóa đơn có tiền phòng và dịch vụ');
  assert.equal(Q.invState(inv).remaining <= 0.5, true);
  assert.equal(Q.deal(j.dealId).status, 'received');
  assert.ok(Q.signedContract(j.stayId));
});

test('tháng 9 – hoa hồng khớp ô tổng I3 của sheet HOA HỒNG THÁNG 9.26', () => {
  const s = step('05.'), cs = S.all('commissions').filter(c => c.excel);
  assert.equal(s.sourceRows, 265);
  assert.equal(cs.length, s.matchedRows);
  const paid = cs.filter(c => c.excel.inTotal).reduce((n, c) => n + Q.commissionPaid(c), 0);
  const unmatched = D.summary.issues.filter(i => i.kind === 'commission_unmatched' && i.inTotal).reduce((n, i) => n + i.amount, 0);
  assert.ok(Math.abs(paid + unmatched - s.excelTotal) < 2, `${paid} + ${unmatched} ≠ ${s.excelTotal}`);
  assert.ok(cs.every(c => Math.abs(c.approvedAmount - c.excel.I) < 0.01), 'số duyệt = thành tiền Excel');
  assert.ok(cs.filter(c => !c.excel.inTotal).every(c => c.status === 'approved' && !(c.installments || []).length), 'dòng ngoài vùng I3 chưa chi');
  const exp = S.where('expenses', e => e.period === P && e.category === 'commission');
  assert.ok(Math.abs(sum(exp, 'amount') - paid) < 0.5, 'chi phí hoa hồng kỳ 9 = số đã chi');
  assert.ok(Math.abs(TH.qr.get(P, 'total').cols.TOTAL.marketing - sum(S.where('expenses', e => e.period === P && e.reportLine === 'marketing'), 'amount')) < 1, 'dòng 40 báo cáo gồm hoa hồng');
});

test('tháng 9 – tài sản mới có khấu hao, bảo dưỡng và kiểm kê đã duyệt', () => {
  const s = step('06.'), a = Q.asset(s.assetId), session = S.get('inventorySessions', s.inventorySessionId);
  assert.equal(a.cost, s.cost);
  assert.equal(Q.maintTask(s.maintenanceId).status, 'done');
  assert.equal(Q.maintTask(s.maintenanceNextId).status, 'planned');
  assert.equal(session.status, 'approved');
  assert.ok(session.lines.some(l => l.assetId === a.id));
  assert.ok(session.approvals.admin && session.approvals.ketoan);
});

test('tháng 9 – lương chốt và đã chi đủ, bảng kê G1 đã khóa', () => {
  const run = S.one('payrollRuns', r => r.period === P && r.status === 'closed');
  assert.ok(Math.abs(Q.payrollDisbursementSummary(run.id).paid - sum(run.obligations, 'amount')) < 1);
  const share = S.one('shareRuns', r => r.buildingId === 'b_G1' && r.period === P);
  assert.equal(share.status, 'locked');
  assert.ok(Math.abs(share.totals.M - step('09.').shareTotal) < 1);
});

test('tháng 9 – đối chiếu nghiệm thu vẫn đạt toàn bộ', () => {
  const rows = [...TH.pages.acceptance(), ...(TH.pages.acceptance3 ? TH.pages.acceptance3() : [])];
  none(rows.filter(r => !r.ok).map(r => r.name), 'treo #11');
});

test('tháng 9 – manifest trùng dữ liệu nạp và file demo tồn tại', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/data/September_2026_Flow_Manifest.json'), 'utf8'));
  assert.deepEqual(manifest.summary, JSON.parse(JSON.stringify(D.summary)));
  assert.equal(manifest.version, D.version);
  for (const f of [...Object.values(D.files).map(f => f.url), 'demo/september/Bo_du_lieu_mau_2026-09.xlsx'])
    assert.ok(fs.statSync(path.join(ROOT, 'mockup', f)).size > 1000, f);
  assert.match(fs.readFileSync(path.join(ROOT, 'mockup/js/pages/settings.js'), 'utf8'), /demo\/september\/Bo_du_lieu_mau_2026-09\.xlsx/);
});

test('tháng 9 – mốc thu 5/10/15 do quản lý cập nhật đã được admin duyệt trước khi chốt lương', () => {
  const s = step('06b.');
  assert.ok(s && s.approved > 0 && s.managerMismatch === 0);
  assert.equal(S.where('collectionMilestones', r => r.period === P && r.status === 'pending').length, 0);
  const ok = S.where('collectionMilestones', r => r.period === P && r.status === 'approved');
  assert.ok(ok.every(r => r.approvedBy && r.reportedBy && r.reportedBy !== r.approvedByUser), 'người nhập khác người duyệt');
  assert.equal(s.buildings, 103, 'đủ 103 tòa trên sheet');
  assert.equal(ok.length, 103 * 3, 'mỗi tòa 3 mốc đã duyệt');
});
