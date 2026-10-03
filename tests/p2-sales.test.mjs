/* Phase 2 – Đợt 1: kinh doanh & hoa hồng (UI-19…22). Kịch bản docs/uat/Phase2_Kich_ban_kiem_thu.md F21–F24, NT-1. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';
import { load, fixture } from './_load.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));
const freeRoom = (TH) => TH.q.forSale().find(x => x.kind === 'now').room;

test('F24 / NT-1 – đối chiếu file hoa hồng T8 (SRC-09): Σ I = F × H = 227.476.935,5; không dòng nào lệch công thức', () => {
  const TH = boot({ user: 'ketoan' });
  const B = TH.q.commissionBench();
  assert.equal(B.rows.length, 125); assert.equal(B.countI, 122);
  assert.ok(Math.abs(B.webTotal - 227476935.5) < 0.05, 'Σ web ' + B.webTotal);
  assert.ok(Math.abs(B.excelTotal - 227476935.5) < 0.05);
  assert.equal(B.mismatch, 0);
  assert.ok(B.matched >= 95, 'tỷ lệ gợi ý khớp thực tế ' + B.matched + '/122');
  // fixture sinh cùng nguồn
  const fx = fixture('commission-2026-08-p2.json');
  assert.equal(fx.rows.length, 125);
});

test('F24 – domain hoa hồng: gợi ý tỷ lệ theo chính sách SRC-09, cơ sở bỏ cọc, điều kiện chi', () => {
  const CM = load().calc.commission;
  const P = CM.DEFAULT_POLICY;
  assert.equal(CM.suggest({ term: 12 }, P).rate, 0.5);
  assert.equal(CM.suggest({ term: 12, partner: 'moithue' }, P).rate, 0.65);
  assert.equal(CM.suggest({ term: 12, share: 2 }, P).rate, 0.25);
  assert.equal(CM.suggest({ term: 12, share: 3 }, P).rate, 0.1667);
  assert.equal(CM.suggest({ term: 3 }, P).rate, 0.25, 'HĐ 3 tháng = 50/6 × 3');
  assert.ok(Math.abs(CM.suggest({ term: 5 }, P).rate - 0.416667) < 1e-6);
  assert.equal(CM.forfeitBase({ deposit: 1000000, rent: 4100000, days: 6, dim: 31 }), 206451.61);
  assert.equal(CM.amount(3500000, 0.5, 1200000), 550000);
  assert.deepEqual(plain(CM.eligible({ depositHeld: 3000000, depositDue: 3500000, firstMonthPaid: true, hasContract: false }).missing), ['Chưa thu đủ cọc', 'Chưa có file HĐ đã ký']);
  assert.ok(CM.eligible({ depositHeld: 3500000, depositDue: 3500000, firstMonthPaid: true, hasContract: true }).ok);
  assert.ok(CM.eligible({ forfeited: true, forfeitAmount: 1000000 }).ok);
  // chính sách theo hiệu lực: trước 4/2025 cơ bản 35%
  const TH = boot({ user: 'admin' });
  assert.equal(TH.q.commissionPolicy('2025-02-01').base, 0.35);
  assert.equal(TH.q.commissionPolicy('2026-09-01').base, 0.5);
});

test('F21 – khách xem: sale thêm khách, trùng SĐT (E08), phạm vi sale / trưởng nhóm, lượt xem', async (t) => {
  const TH = boot({ user: 'sale' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const me = S.session.employeeId;
  await t.test('sale chỉ thấy khách của mình; trưởng nhóm KD thấy cả team', () => {
    const mine = Q.salesScoped(S.all('leads'));
    assert.ok(mine.length > 0 && mine.every(l => l.saleIds.includes(me)));
    assert.ok(mine.length < S.all('leads').length);
    TH.auth.login('truongkd'); const team = Q.salesScoped(S.all('leads')); TH.auth.login('sale');
    assert.ok(team.length > mine.length && team.length <= S.all('leads').length);
  });
  await t.test('thêm khách: SĐT sai bị chặn; mặc định sale là chính mình', () => {
    assert.ok(!attempt(() => X.addLead({ phone: '123', source: 'Zalo' })).ok);
    const l = X.addLead({ phone: '0912345678', name: 'Khách test', source: 'Zalo' });
    assert.deepEqual(plain(l.saleIds), [me]); assert.equal(l.status, 'new');
  });
  await t.test('⛔ E08: trùng SĐT khách xem / khách thuê → báo trùng; gắn vào khách cũ hoặc ghi lý do thì lưu được', () => {
    const r = attempt(() => X.addLead({ phone: '0912345678', source: 'Facebook' }));
    assert.ok(!r.ok && /Trùng liên hệ/.test(r.msg));
    const tenantPhone = S.all('customers')[0].phone;
    assert.ok(!attempt(() => X.addLead({ phone: tenantPhone, source: 'Facebook' })).ok, 'trùng khách thuê');
    const old = S.one('leads', l => l.phone === '0912345678');
    const same = X.addLead({ phone: '0912345678', source: 'Facebook', attachTo: old.id, note: 'gọi lại' });
    assert.equal(same.id, old.id);
    const n = S.all('leads').length;
    X.addLead({ phone: '0912345678', source: 'Facebook', dupReason: 'Người nhà dùng chung số' });
    assert.equal(S.all('leads').length, n + 1);
  });
  await t.test('lượt xem + trạng thái; ⛔ sale không tự chuyển khách, không giao cho sale khác', () => {
    const l = S.one('leads', x => x.phone === '0912345678' && !x.dupOf);
    X.addViewing(l.id, { roomId: freeRoom(TH).id, date: '2026-09-29' });
    assert.equal(Q.lead(l.id).status, 'viewed');
    assert.ok(!attempt(() => X.assignLead(l.id, S.all('employees').find(e => e.title === 'SALE' && e.id !== me).id, 'x')).ok);
    const other = S.all('employees').find(e => e.title === 'SALE' && e.id !== me);
    assert.ok(!attempt(() => X.addLead({ phone: '0987000111', source: 'Zalo', saleId: other.id })).ok, 'sale chỉ tạo khách cho mình');
    assert.ok(!attempt(() => X.setLeadStatus(l.id, 'lost', '')).ok, 'không thuê phải có lý do');
  });
  await t.test('⛔ khách của sale khác: không thêm lượt xem', () => {
    const o = S.all('leads').find(l => !l.saleIds.includes(me));
    assert.ok(!attempt(() => X.addViewing(o.id, { roomId: freeRoom(TH).id, date: '2026-09-29' })).ok);
  });
});

test('F22 – chốt deal → lượt thuê chờ nhận → thu cọc → nhận phòng; UI-19 đếm đúng', async (t) => {
  const TH = boot({ user: 'sale' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const lead = X.addLead({ phone: '0911222333', name: 'Nguyễn Chốt Thuê', source: 'Đăng tin' });
  const room = freeRoom(TH);
  let deal;
  await t.test('chốt: tạo khách + lượt thuê chờ nhận (không cần phiếu cọc), phòng rời "trống ở luôn", hoa hồng chờ duyệt', () => {
    const before = Q.vacancy().now.length;
    assert.ok(!attempt(() => X.closeDeal({ leadId: lead.id, roomId: room.id, price: room.price, deposit: room.price, closeDate: '2026-09-29', billingStart: '2026-09-25', term: 12 })).ok, 'ngày tính tiền trước ngày chốt');
    deal = X.closeDeal({ leadId: lead.id, roomId: room.id, price: room.price, deposit: room.price, closeDate: '2026-09-29', moveInDate: '2026-10-01', billingStart: '2026-10-01', term: 12 });
    const st = Q.stay(deal.stayId);
    assert.equal(st.status, 'pending'); assert.equal(st.dealId, deal.id); assert.equal(st.endDate, '2027-09-30');
    assert.equal(Q.customer(st.customerId).phone, '0911222333');
    assert.equal(Q.lead(lead.id).status, 'closed');
    assert.equal(Q.vacancy().now.length, before - 1);
    assert.ok(Q.vacancy().waiting.some(r => r.id === room.id));
    const cs = Q.commissionsOf(deal.id); assert.equal(cs.length, 1); assert.equal(cs[0].status, 'pending'); assert.equal(cs[0].amount, room.price * 0.5);
    assert.equal(Q.dealKind(deal), 'Ở ngay', 'vào ở trong 3 ngày sau chốt');
  });
  await t.test('⛔ chốt trùng phòng đã có giao dịch chờ', () => {
    const l2 = X.addLead({ phone: '0911222444', source: 'Zalo' });
    const r = attempt(() => X.closeDeal({ leadId: l2.id, roomId: room.id, price: 1, deposit: 1, closeDate: '2026-09-29', billingStart: '2026-10-01', term: 12 }));
    assert.ok(!r.ok);
  });
  await t.test('⛔ sale không nhận phòng (không có quyền lượt thuê); kế toán ghi cọc → cọc đủ; admin nhận phòng → đã nhận', () => {
    assert.ok(!attempt(() => X.receiveDeal(deal.id, '2026-10-01')).ok);
    TH.auth.login('ketoan');
    X.recordPayment({ stayId: deal.stayId, type: 'deposit', amount: deal.deposit, receivedAt: '2026-09-29', method: 'bank', allocations: [] });
    assert.equal(Q.dealDeposit(Q.deal(deal.id)).state, 'full');
    TH.auth.login('admin');
    X.receiveDeal(deal.id, '2026-10-01');
    assert.equal(Q.deal(deal.id).status, 'received'); assert.equal(Q.stay(deal.stayId).status, 'active');
    assert.ok(Q.deal(deal.id).events.some(e => e.type === 'receive'));
  });
  await t.test('UI-19: đã chốt ≠ đã nhận; deal nhiều sale chia đều doanh số', () => {
    const sept = S.all('deals').filter(d => d.closeDate.startsWith('2026-09') && d.status !== 'cancelled');
    const vol = TH.calc.commission.salesVolume(sept);
    const total = Object.values(vol).reduce((t, v) => t + v.volume, 0);
    assert.ok(Math.abs(total - sept.reduce((t, d) => t + d.price, 0)) < 1, 'Σ doanh số theo sale = Σ giá chốt (không đếm trùng)');
  });
});

test('F23 – đổi phòng, hủy, bỏ cọc: sự kiện riêng, hoa hồng tính lại, cọc thành doanh thu dòng 5', async (t) => {
  const TH = boot({ user: 'sale' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const mk = (phone) => { const l = X.addLead({ phone, source: 'Zalo' }); const r = freeRoom(TH); return X.closeDeal({ leadId: l.id, roomId: r.id, price: r.price, deposit: r.price, closeDate: '2026-09-20', billingStart: '2026-09-25', term: 12 }); };
  const d1 = mk('0933000001'), d2 = mk('0933000002'), d3 = mk('0933000003');
  await t.test('⛔ sale không hủy / bỏ cọc / đổi phòng', () => {
    assert.ok(!attempt(() => X.cancelDeal(d1.id, 'x')).ok);
    assert.ok(!attempt(() => X.forfeitDeal(d1.id, { date: '2026-09-28', reason: 'x' })).ok);
  });
  TH.auth.login('truongkd');
  await t.test('đổi phòng: lượt thuê chờ chuyển phòng, phòng cũ mở bán, hoa hồng giữ theo deal', () => {
    const to = freeRoom(TH); const from = d1.roomId;
    X.transferDeal(d1.id, { toRoomId: to.id, reason: 'Khách đổi ý chọn phòng tầng thấp' });
    const d = Q.deal(d1.id);
    assert.equal(d.roomId, to.id); assert.equal(Q.stay(d.stayId).roomId, to.id);
    assert.ok(!Q.pendingStay(from)); assert.ok(Q.forSale().some(x => x.room.id === from));
    assert.ok(d.events.some(e => e.type === 'transfer' && e.to === to.code));
    assert.equal(Q.commissionsOf(d1.id).length, 1);
  });
  await t.test('hủy (chưa cọc): không doanh số, hoa hồng hủy; ⛔ đã cọc thì phải dùng bỏ cọc', () => {
    X.cancelDeal(d2.id, 'Khách không liên lạc được');
    assert.equal(Q.deal(d2.id).status, 'cancelled'); assert.equal(Q.stay(d2.stayId).status, 'cancelled');
    assert.ok(Q.commissionsOf(d2.id).every(c => c.status === 'void'));
    assert.ok(!Q.pendingStay(d2.roomId));
    TH.auth.login('ketoan'); X.recordPayment({ stayId: d3.stayId, type: 'deposit', amount: 1000000, receivedAt: '2026-09-21', method: 'bank', allocations: [] }); TH.auth.login('truongkd');
    assert.ok(!attempt(() => X.cancelDeal(d3.id, 'x')).ok);
  });
  await t.test('bỏ cọc: cọc → doanh thu (forfeit_revenue), không phiếu hoàn; cơ sở hoa hồng = cọc − tiền ngày đã tính', () => {
    X.forfeitDeal(d3.id, { date: '2026-09-28', reason: 'Khách đổi công việc' });
    const d = Q.deal(d3.id);
    assert.equal(d.status, 'forfeited'); assert.equal(Q.stay(d.stayId).endType, 'forfeit');
    const led = S.where('depositLedger', l => l.stayId === d.stayId && l.kind === 'forfeit_revenue');
    assert.equal(led.length, 1); assert.equal(led[0].amount, 1000000);
    assert.ok(!S.one('refunds', r => r.stayId === d.stayId));
    assert.equal(d.forfeit.days, 3);
    assert.equal(d.forfeit.base, Math.round((1000000 - d.price / 30 * 3) * 100) / 100);
    const c = Q.commissionsOf(d3.id)[0]; assert.equal(c.F, d.forfeit.base); assert.equal(c.term, 'forfeit');
    assert.ok(Q.dealEligibility(d).ok, 'bỏ cọc: đủ điều kiện khi cọc đã thành doanh thu');
  });
});

test('F24 – duyệt và chi hoa hồng: điều kiện chi, nhiều đợt ghi đúng từng kỳ thực chi', async (t) => {
  const TH = boot({ user: 'ketoan' }); const S = TH.store, X = TH.actions, Q = TH.q;
  const ok = S.all('commissions').find(c => c.status === 'approved' && Q.dealEligibility(Q.deal(c.dealId)).ok);
  const notOk = S.all('commissions').find(c => c.status === 'approved' && !Q.dealEligibility(Q.deal(c.dealId)).ok);
  await t.test('⛔ sale không có quyền hoa hồng (CH-01)', () => { TH.auth.login('sale'); assert.ok(!TH.auth.can('commission.view')); assert.ok(!attempt(() => X.approveCommission(ok.id, {})).ok); TH.auth.login('ketoan'); });
  await t.test('⛔ duyệt tỷ lệ khác gợi ý / có khoản trừ mà không lý do', () => {
    assert.ok(!attempt(() => X.approveCommission(ok.id, { H: 0.35 })).ok);
    assert.ok(!attempt(() => X.approveCommission(ok.id, { H: ok.suggestedH, deduction: 100000 })).ok);
    X.approveCommission(ok.id, { H: ok.suggestedH, deduction: 100000, reason: 'Hỗ trợ khách 100k' });
    assert.equal(S.get('commissions', ok.id).approvedAmount, Math.round((ok.F * ok.suggestedH - 100000) * 100) / 100);
  });
  await t.test('⛔ chi khi chưa đủ điều kiện (thiếu cọc / tháng đầu / HĐ)', () => {
    const r = attempt(() => X.payCommission(notOk.id, { amount: 1000, date: '2026-09-29' }));
    assert.ok(!r.ok && /Chưa đủ điều kiện/.test(r.msg));
  });
  await t.test('chi 2 đợt: chứng từ "Hoa hồng" dòng 40 theo tháng của từng ngày chi; ⛔ vượt số duyệt', () => {
    const c = S.get('commissions', ok.id);
    const half = Math.round(c.approvedAmount / 2);
    const e1 = X.payCommission(c.id, { amount: half, date: '2026-09-29' });
    assert.equal(e1.category, 'commission'); assert.equal(e1.reportLine, 'marketing'); assert.equal(e1.period, '2026-09'); assert.equal(e1.buildingId, c.buildingId);
    assert.ok(!attempt(() => X.payCommission(c.id, { amount: c.approvedAmount, date: '2026-09-29' })).ok, 'vượt số còn được chi');
    const e2 = X.payCommission(c.id, { amount: c.approvedAmount - half, date: '2026-10-01' });
    assert.equal(e2.period, '2026-10');
    assert.equal(S.get('commissions', c.id).status, 'paid');
    assert.deepEqual(plain(S.where('expenses', e => e.refId === c.id).map(e => e.period).sort()), ['2026-09', '2026-10']);
  });
});

test('NT-0 – Phase 1 không đổi sau Đợt 1: báo cáo tổng T8, 1.471 hóa đơn T9', () => {
  const TH = boot({ user: 'admin' });
  assert.equal(Math.round(TH.qr.build('2026-08', 'total').cols.TOTAL.rev_total), 7036256236);
  assert.equal(TH.store.all('invoices').filter(i => i.period === '2026-09').length, 1471);
});
