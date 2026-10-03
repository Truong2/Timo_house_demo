/* Actions – khách, lượt thuê (chờ nhận có cọc), 5 loại kết thúc, chuyển phòng, biểu phí (UI-06 → UI-09, F12). */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, Cc = TH.calc;
  const nextStayCode = (roomCode) => {
    const n = S.where('stays', s => s.code && s.code.startsWith(roomCode + 'A')).length;
    return roomCode + 'A' + String(n + 1).padStart(3, '0');
  };
  const recordStayVersion = (stayId, kind, meta = {}) => {
    const stay = Q.stay(stayId); if (!stay) return null;
    const rate = Q.rateOf(stayId, meta.effectiveFrom || F.today());
    const version = Math.max(0, ...S.where('stayVersions', v => v.stayId === stayId).map(v => Number(v.version) || 0)) + 1;
    const rec = S.add('stayVersions', { stayId, version, effectiveFrom: meta.effectiveFrom || F.today(), kind,
      terms: { roomId: stay.roomId, buildingId: stay.buildingId, customerId: stay.customerId, dealDate: stay.dealDate || null, moveInDate: stay.moveInDate, rentStart: stay.rentStart, svcStart: stay.svcStart, endDate: stay.endDate, status: stay.status, endType: stay.endType || null, depositAmount: stay.depositAmount, payMonths: stay.payMonths, people: stay.people, vehicles: stay.vehicles },
      rates: rate ? { rent: rate.rent, items: JSON.parse(JSON.stringify(rate.items || {})), rateVersionId: rate.id } : { rent: stay.rent, items: {} },
      sourceRef: meta.sourceRef || stay.source || 'web', documentIds: (meta.documentIds || []).slice(), reason: meta.reason || kind, createdBy: _.who(), createdAt: F.nowISO() });
    _.audit('snapshot', 'stayVersion', rec.id, `${stay.code} · phiên HĐ v${version}: ${rec.reason}`, { sourceRef: rec.sourceRef });
    return rec;
  };
  X.recordStayVersion = recordStayVersion;

  /* Tạo khách + lượt thuê; trạng thái 'pending' = đã cọc, chờ vào ở. Phase 2: deal chốt (UI-21) gọi lõi này với d.dealId –
     giao dịch giữ phòng nên lượt thuê chờ nhận chưa cần phiếu cọc (kế toán ghi cọc sau ở UI-13). */
  const createStayCore = (d) => {
    const errs = {};
    const room = Q.room(d.roomId);
    if (!room) errs.roomId = 'Chọn phòng';
    if (!String(d.name || '').trim()) errs.name = 'Nhập tên khách';
    if (!/^0\d{9}$/.test(String(d.phone || '').replace(/\s/g, ''))) errs.phone = 'SĐT 10 số, bắt đầu 0';
    if (!d.rentStart) errs.rentStart = 'Nhập ngày tính tiền phòng';
    if (!d.endDate) errs.endDate = 'Nhập ngày hết hạn HĐ';
    if (d.endDate && d.rentStart && d.endDate <= d.rentStart) errs.endDate = 'Ngày hết hạn phải sau ngày tính tiền';
    // Phòng chủ nhà ở (UI-03, §3.12e): không thu tiền phòng, chỉ thu dịch vụ → giá thuê 0 hợp lệ
    const serviceOnly = room && room.exploitation === 'owner_live';
    if (serviceOnly ? !(Number(d.rent) >= 0) || Number(d.rent) > 0 : !(Number(d.rent) > 0)) errs.rent = serviceOnly ? 'Phòng chủ nhà ở chỉ thu dịch vụ – giá thuê = 0' : 'Nhập giá thuê';
    if (room && Q.currentStay(room.id) && d.status === 'active' && !d.allowOverlap) errs.roomId = 'Phòng đang có khách – chọn "chờ nhận" hoặc kết thúc lượt thuê cũ';
    // Ba loại ngày tách riêng (UI-07): ngày chốt/đặt cọc ≤ ngày tính tiền phòng; ngày bắt đầu dịch vụ không trước ngày chốt
    const dealDate = d.dealDate || F.today();
    if (d.rentStart && dealDate > d.rentStart) errs.dealDate = 'Ngày chốt phải trước hoặc bằng ngày tính tiền phòng';
    if (d.svcStart && d.svcStart < dealDate) errs.svcStart = 'Ngày bắt đầu dịch vụ không trước ngày chốt';
    // Khách chờ nhận trên phòng còn khách: ngày tính tiền phải sau ngày khách cũ rời (báo trả / hết hạn) – không chồng hai lượt thuê
    const cur = room && Q.currentStay(room.id);
    if (cur && d.status !== 'active' && d.rentStart && d.rentStart <= (cur.plannedLeaveDate || cur.endDate)) errs.rentStart = `Phòng còn khách ${cur.code} đến ${F.date(cur.plannedLeaveDate || cur.endDate)} – ghi ngày báo trả của khách cũ trước, hoặc chọn ngày sau đó`;
    // Lượt thuê chờ nhận phải có cọc thực nhận (SRS §2.3 mục 3): phiếu cọc hôm nay, hoặc cọc đang giữ khi import số dư
    const depIn = d.depositReceived ? Number(d.depositReceived.amount) || 0 : 0;
    if (d.status !== 'active' && !d.dealId && !d.confirmedContract && !(depIn > 0) && !(Number(d.openingDeposit) > 0)) errs.depAmount = 'Lượt thuê chờ nhận phải có cọc đã nhận hoặc hợp đồng đã xác nhận';
    if (room && Q.pendingStay(room.id)) errs.roomId = 'Phòng đã có khách cọc chờ nhận';
    if (Object.keys(errs).length) { const e = new Error('Dữ liệu chưa hợp lệ'); e.fields = errs; throw e; }
    const code = nextStayCode(room.code);
    const cust = (d.customerId && S.get('customers', d.customerId)) || S.add('customers', { id: 'KH-' + code, name: d.name.trim(), phone: d.phone.replace(/\s/g, ''), idNo: d.idNo || '', occupation: d.occupation || '', zaloLinked: !!d.zaloLinked });
    const stay = S.add('stays', { id: 'st_' + code, code, roomId: room.id, buildingId: room.buildingId, customerId: cust.id, status: d.status === 'active' ? 'active' : 'pending', endType: null,
      dealDate, moveInDate: d.moveInDate || d.rentStart, rentStart: d.rentStart, svcStart: d.svcStart || d.rentStart, endDate: d.endDate,
      depositAmount: Number(d.deposit) || 0, depositStatus: 'none', rent: Number(d.rent), listPrice: room.listPrice, people: Number(d.people) || 1, vehicles: Number(d.vehicles) || 0, payMonths: Number(d.payMonths) || 1, source: d.dealId ? 'deal' : 'web', dealId: d.dealId || null });
    const items = d.items || (Q.rateOf((S.where('stays', s => s.buildingId === room.buildingId && s.id !== stay.id)[0] || {}).id) || {}).items || {};
    S.add('rateVersions', { stayId: stay.id, from: d.rentStart, to: null, rent: Number(d.rent), items: JSON.parse(JSON.stringify(items)), reason: 'Biểu phí khi tạo lượt thuê', source: 'web' });
    recordStayVersion(stay.id, 'created', { effectiveFrom: d.rentStart, reason: 'Tạo hợp đồng/lượt thuê' });
    S.update('rooms', room.id, { status: stay.status === 'active' ? 'occupied' : (Q.currentStay(room.id) ? room.status : 'reserved') });
    // Import cọc đang giữ trước go-live → số dư đầu kỳ trong sổ cọc (không phải doanh thu kỳ này)
    if (Number(d.openingDeposit) > 0) { const opened=d.openingDepositDate||d.rentStart;S.add('depositLedger', { stayId: stay.id, buildingId: stay.buildingId, kind: 'opening', amount: Number(d.openingDeposit), date: opened, period: F.period(opened), note: 'Cọc đang giữ (import số dư)' }); X.syncDepositStatus(stay.id); }
    if (d.depositReceived && Number(d.depositReceived.amount) > 0) {
      X.recordPayment({ stayId: stay.id, type: 'deposit', amount: Number(d.depositReceived.amount), receivedAt: d.depositReceived.date || F.today(), method: d.depositReceived.method || 'bank', allocations: [], note: 'Nhận cọc giữ phòng' }, true);
    }
    _.audit('create', 'stay', stay.id, `Tạo lượt thuê ${code} (${stay.status === 'active' ? 'đang ở' : 'chờ nhận'})${d.dealId ? ' từ giao dịch chốt' : ''}`);
    _.done(); return stay;
  };
  X.createStay = (d) => { _.need('tenants.manage'); return createStayCore(d); };
  _.createStay = createStayCore;
  /* Khách chờ nhận vào ở */
  /* Phase 2: lượt thuê sinh từ giao dịch chốt → nhận phòng ở đâu (UI-07 hay UI-21) deal cũng thành "đã nhận" (không lệch trạng thái) */
  const activateCore = (id, date) => {
    const s = Q.stay(id); if (!s || s.status !== 'pending') throw new Error('Lượt thuê không ở trạng thái chờ nhận');
    if (Q.currentStay(s.roomId)) throw new Error('Phòng còn khách cũ – kết thúc lượt thuê cũ trước khi bàn giao');
    const d = date || s.rentStart;
    if (s.dealId && s.dealDate && d < s.dealDate) { const e = new Error('Ngày nhận phòng không trước ngày chốt ' + F.date(s.dealDate)); e.fields = { date: e.message }; throw e; }
    S.update('stays', id, { status: 'active', moveInDate: d });
    S.update('rooms', s.roomId, { status: 'occupied' });
    recordStayVersion(id, 'activated', { effectiveFrom: d, reason: 'Khách nhận phòng' });
    const deal = s.dealId && S.get('deals', s.dealId);
    if (deal && deal.status === 'closed') S.update('deals', deal.id, { status: 'received', moveInDate: d, events: [...(deal.events || []), { type: 'receive', at: d, by: _.who(), note: 'Khách nhận phòng' }] });
    _.audit('activate', 'stay', id, 'Khách nhận phòng ' + s.code + (deal ? ' (giao dịch ' + deal.code + ')' : ''));
  };
  X.activateStay = (id, date) => { _.need('tenants.manage'); activateCore(id, date); _.done(); };
  _.activateStay = activateCore;

  /* Khách báo trả phòng: ngày báo + ngày dự kiến bàn giao (UI-07) – để nhận khách chờ vào ngay sau, không chồng lượt thuê */
  X.setNotice = (id, d) => {
    _.need('stays.end');
    const s = Q.stay(id); if (!s || s.status !== 'active') throw new Error('Chỉ ghi báo trả cho lượt thuê đang ở');
    if (!TH.auth.inScope(s.buildingId)) throw new Error('Lượt thuê ngoài phạm vi được giao');
    if (!d.noticeDate || !d.plannedLeaveDate) throw new Error('Nhập ngày báo trả và ngày dự kiến bàn giao');
    if (d.plannedLeaveDate < d.noticeDate) throw new Error('Ngày bàn giao phải sau ngày báo trả');
    S.update('stays', id, { noticeDate: d.noticeDate, plannedLeaveDate: d.plannedLeaveDate });
    _.audit('notice', 'stay', id, `Khách ${s.code} báo trả ${F.date(d.noticeDate)}, dự kiến bàn giao ${F.date(d.plannedLeaveDate)}`); _.done();
  };
  /* Kết thúc lượt thuê – bắt buộc chọn loại (đặc tả UI-07, §3.12d) */
  X.endStay = (id, d) => { _.need('stays.end'); return endStayCore(id, d); };
  /* opts.dealScope: gọi từ giao dịch (UI-21, bỏ cọc) – phạm vi đã kiểm theo nhánh kinh doanh, không theo tòa được giao */
  const endStayCore = (id, d, opts = {}) => {
    const s = Q.stay(id); const cat = TH.data.catalog.endTypes.find(x => x.key === d.endType);
    if (!cat) throw new Error('Chọn loại kết thúc');
    if (!d.date) throw new Error('Nhập ngày kết thúc / bàn giao');
    if (['breach', 'abscond', 'forfeit'].includes(d.endType) && !String(d.reason || '').trim()) throw new Error('Nhập lý do');
    if (!opts.dealScope && !TH.auth.inScope(s.buildingId)) throw new Error('Lượt thuê ngoài phạm vi được giao');
    _.guardPeriod(F.period(d.date), 'kết thúc lượt thuê');
    if (d.endType === 'forfeit' && s.status !== 'pending') throw new Error('"Bỏ cọc" chỉ áp dụng khách đã cọc nhưng chưa vào ở');
    if (d.endType === 'forfeit' && s.dealId && s.dealDate && d.date < s.dealDate) { /* Phase 2: lượt thuê sinh từ giao dịch chốt */ const e = new Error('Ngày khách bỏ không trước ngày chốt ' + F.date(s.dealDate)); e.fields = { date: e.message }; throw e; }
    if (d.endType !== 'forfeit' && s.status !== 'active') throw new Error('Lượt thuê không còn hiệu lực');
    if (d.endType === 'transfer') return X.transferStay(id, d);
    const patch = { status: 'ended', endType: d.endType, endDate: d.date, stopBillingDate: d.date, handoverDate: d.handoverDate || d.date, noticeDate: d.noticeDate || null, endReason: d.reason || null, breachReason: ['breach', 'abscond'].includes(d.endType) ? d.reason : null };
    if (d.endType === 'expired') patch.depositStatus = 'refund_pending';
    if (['breach', 'abscond'].includes(d.endType)) patch.depositStatus = 'kept_breach';
    // Số cọc giữ / chuyển doanh thu = số dư thực có trong sổ cọc (không lấy số cọc thỏa thuận khi khách chưa nộp)
    const dep = Math.max(0, X.depositBalance(id));
    if (d.endType === 'forfeit') patch.depositStatus = dep ? 'forfeited_revenue' : 'none';
    if (['breach', 'abscond'].includes(d.endType) && !dep) patch.depositStatus = 'none';
    S.update('stays', id, patch);
    recordStayVersion(id, 'ended', { effectiveFrom: d.date, reason: 'Kết thúc: ' + cat.label, sourceRef: d.reason || 'web' });
    if (['breach', 'abscond'].includes(d.endType) && dep) S.add('depositLedger', { stayId: id, buildingId: s.buildingId, kind: 'keep_breach', amount: dep, date: d.date, period: F.period(d.date), note: 'Giữ cọc do ' + cat.label.toLowerCase() });
    if (d.endType === 'forfeit' && dep) S.add('depositLedger', { stayId: id, buildingId: s.buildingId, kind: 'forfeit_revenue', amount: dep, date: d.date, period: F.period(d.date), note: 'Cọc khách bỏ không ở → doanh thu' });
    // Phase 2: bỏ cọc ghi ở UI-07 hay UI-21 đều cập nhật giao dịch + tính lại hoa hồng (act-sales.js)
    if (d.endType === 'forfeit' && s.dealId && _.syncDealForfeit) _.syncDealForfeit(s.dealId, { date: d.date, reason: d.reason, deposit: dep });
    // Phá HĐ/bỏ trốn: hóa đơn kỳ hiện tại chỉ còn tiền điện theo chỉ số (GĐ OQ-03)
    if (['breach', 'abscond'].includes(d.endType)) {
      S.where('invoices', i => i.stayId === id && !i.isBreach && (i.period > F.period(d.date) || (i.period === F.period(d.date) && Q.invState(i).paid <= 0))).forEach(inv => {
        const lines = Cc.billing.breachLines(inv.lines, String(Q.param('breachCharge') || 'electric').split(',')); // OQ-03: khoản còn thu khi phá HĐ (tham số)
        S.update('invoices', inv.id, { lines, isBreach: true, totalDue: Cc.billing.total(lines), breachNote: 'Chuyển sang phá HĐ ' + F.date(d.date) + ': giữ cọc, chỉ thu tiền điện' });
      });
    }
    const room = Q.room(s.roomId);
    const nextPending = Q.pendingStay(s.roomId);
    S.update('rooms', s.roomId, { status: d.endType === 'forfeit' ? (Q.currentStay(s.roomId) ? room.status : 'vacant_ready') : nextPending ? 'reserved' : 'vacant_cleaning', statusReason: cat.label, statusAt: d.date });
    let refund = null;
    if (d.endType === 'expired') refund = X.createRefund(id, { finalReading: d.finalReading }, true);
    _.audit('end', 'stay', id, `Kết thúc ${s.code}: ${cat.label}${d.reason ? ' – ' + d.reason : ''}`);
    _.done(); return { stay: Q.stay(id), refund };
  };
  _.endStay = endStayCore;
  /* Chuyển phòng: lượt thuê mới liên kết, cọc chuyển theo phương án (không tự đổi mã phòng) */
  /* Phương án cọc khi chuyển phòng (UI-07, BR-DEP-013) – khách xác nhận trước khi tạo lượt thuê mới:
     carry = chuyển toàn bộ cọc đang giữ; cọc yêu cầu phòng mới lớn hơn → phần thiếu thu ở hóa đơn đầu hoặc phiếu cọc.
     refund_excess = chuyển đúng số cọc phòng mới; phần dư lập phiếu hoàn cho lượt thuê cũ (duyệt kép như hoàn cọc). */
  X.DEPOSIT_PLANS = { carry: 'Chuyển toàn bộ cọc đang giữ sang phòng mới (thiếu thì thu thêm)', refund_excess: 'Chuyển đúng số cọc phòng mới, hoàn lại phần dư' };
  X.transferStay = (id, d) => {
    _.need('stays.transfer');
    const s = Q.stay(id); const to = Q.room(d.toRoomId);
    if (!s || s.status !== 'active') throw new Error('Chỉ chuyển phòng cho lượt thuê đang ở');
    if (!TH.auth.inScope(s.buildingId)) throw new Error('Lượt thuê ngoài phạm vi được giao');
    if (!to) throw new Error('Chọn phòng mới');
    if (!d.date) throw new Error('Nhập ngày hiệu lực');
    if (Q.currentStay(to.id) || Q.pendingStay(to.id)) throw new Error('Phòng ' + to.code + ' đang có khách hoặc khách chờ nhận');
    if (!X.DEPOSIT_PLANS[d.depositPlan]) throw new Error('Chọn phương án cọc');
    if (!d.depositConfirmed) throw new Error('Xác nhận khách đã đồng ý phương án cọc');
    const held = Math.max(0, X.depositBalance(id));
    const newDep = Number(d.newDeposit) || s.depositAmount;
    const moved = d.depositPlan === 'refund_excess' ? Math.min(held, newDep) : held;
    const excess = held - moved;
    const code = nextStayCode(to.code);
    S.update('stays', id, { status: 'ended', endType: 'transfer', endDate: TH.calc.dates.addDays(d.date, -1), stopBillingDate: TH.calc.dates.addDays(d.date, -1), toStayId: 'st_' + code, depositStatus: excess > 0 ? 'refund_pending' : 'transferred', endReason: 'Chuyển sang ' + to.code, depositPlan: d.depositPlan });
    const ns = S.add('stays', Object.assign({}, s, { id: 'st_' + code, code, roomId: to.id, buildingId: to.buildingId, status: 'active', endType: null, rentStart: d.date, svcStart: d.date, moveInDate: d.date,
      endDate: d.endDate || s.endDate, rent: Number(d.rent) || to.price || s.rent, depositAmount: newDep, depositStatus: 'none', fromStayId: id, stopBillingDate: null, createdAt: F.nowISO(), source: 'web', depositPlan: d.depositPlan }));
    const oldRate = Q.rateOf(id);
    S.add('rateVersions', { stayId: ns.id, from: d.date, to: null, rent: ns.rent, items: JSON.parse(JSON.stringify((oldRate || {}).items || {})), reason: 'Chuyển phòng từ ' + Q.roomCode(s.roomId), source: 'web' });
    recordStayVersion(id, 'transferred_out', { effectiveFrom: d.date, reason: 'Chuyển sang ' + to.code });
    recordStayVersion(ns.id, 'transferred_in', { effectiveFrom: d.date, reason: 'Chuyển từ ' + Q.roomCode(s.roomId) });
    if (moved > 0) {
      S.add('depositLedger', { stayId: id, buildingId: s.buildingId, kind: 'transfer_out', amount: moved, date: d.date, period: F.period(d.date), note: 'Chuyển cọc sang ' + to.code });
      S.add('depositLedger', { stayId: ns.id, buildingId: to.buildingId, kind: 'transfer_in', amount: moved, date: d.date, period: F.period(d.date), note: 'Nhận cọc từ ' + Q.roomCode(s.roomId) });
    }
    X.syncDepositStatus(ns.id);
    S.update('rooms', s.roomId, { status: 'vacant_cleaning', statusReason: 'Khách chuyển phòng', statusAt: d.date });
    S.update('rooms', to.id, { status: 'occupied' });
    const refund = excess > 0 ? X.createRefund(id, {}, true) : null;
    _.audit('transfer', 'stay', id, `Chuyển phòng ${Q.roomCode(s.roomId)} → ${to.code} (${code}); cọc chuyển ${F.vnd(moved)}${excess > 0 ? ', hoàn dư ' + F.vnd(excess) : ''}${newDep > moved ? ', còn thiếu ' + F.vnd(newDep - moved) : ''}`);
    _.done(); return Object.assign(ns, { refund });
  };
  /* Gia hạn: đổi ngày hết hạn + phiên giá mới nếu đổi giá */
  X.renewStay = (id, d) => {
    _.need('tenants.manage');
    const s = Q.stay(id);
    if (!d.endDate || d.endDate <= s.endDate) throw new Error('Ngày hết hạn mới phải sau ' + F.date(s.endDate));
    S.update('stays', id, { endDate: d.endDate, renewals: (s.renewals || 0) + 1 });
    if (Number(d.rent) && Number(d.rent) !== s.rent) X.addRateVersion(id, { from: d.from || TH.calc.dates.addDays(s.endDate, 1), rent: Number(d.rent), reason: 'Gia hạn HĐ' }, true);
    recordStayVersion(id, 'renewed', { effectiveFrom: d.from || TH.calc.dates.addDays(s.endDate, 1), reason: 'Gia hạn đến ' + F.date(d.endDate) });
    _.audit('renew', 'stay', id, `Gia hạn ${s.code} đến ${F.date(d.endDate)}`); _.done();
  };
  /* Phiên biểu phí: chỉ áp dụng hóa đơn chưa phát hành; không chồng ngày */
  X.addRateVersion = (stayId, d, silent) => {
    _.need('rates.manage');
    if (!d.from) throw new Error('Nhập ngày hiệu lực');
    if (!String(d.reason || '').trim()) throw new Error('Nhập lý do/nguồn thay đổi');
    _.guardEffective(d.from, 'biểu phí'); // B16: không đổi biểu phí hiệu lực trong kỳ đã khóa
    const cur = S.where('rateVersions', v => v.stayId === stayId).sort((a, b) => String(b.from).localeCompare(String(a.from)));
    if (cur.some(v => v.from >= d.from)) throw new Error('Chồng ngày hiệu lực với phiên từ ' + F.date(cur[0].from));
    const issued = S.where('invoices', i => i.stayId === stayId && i.lifecycle !== 'draft' && i.period >= F.period(d.from));
    const base = cur[0] || { items: {}, rent: 0 };
    cur.filter(v => !v.to).forEach(v => S.update('rateVersions', v.id, { to: TH.calc.dates.addDays(d.from, -1) }));
    const items = JSON.parse(JSON.stringify(d.items || base.items || {}));
    const v = S.add('rateVersions', { stayId, from: d.from, to: null, rent: Number(d.rent) || base.rent, items, reason: d.reason, source: 'web' });
    if (Number(d.rent)) S.update('stays', stayId, { rent: Number(d.rent) });
    recordStayVersion(stayId, 'rate_changed', { effectiveFrom: d.from, reason: d.reason, sourceRef: d.sourceRef || 'web' });
    if (!silent) { _.audit('create', 'rateVersion', v.id, `Phiên biểu phí mới từ ${F.date(d.from)}`); _.done(); }
    return { version: v, warnIssued: issued.map(i => i.period) };
  };
  // One registry for UI-07, intake and real OCR. Old records remain readable without migration.
  Q.contractsOfStay = (stayId) => {
    const files = S.where('contractFiles', f => f.stayId === stayId);
    return files.concat(S.where('intakeAttachments', a => a.kind === 'tenant' && a.targetId === stayId && !files.some(f => f.blobId === a.fileId)).map(a => ({ ...a, id: 'ia:' + a.id, stayId, blobId: a.fileId, uploadedAt: a.createdAt, signed: a.contractSigned === true, version: 1, legacyAttachment: true })));
  };
  Q.signedContract = stayId => Q.contractsOfStay(stayId).filter(f => f.signed !== false && /\.(pdf|png|jpe?g)$/i.test(f.name)).sort((a,b) => String(a.uploadedAt || '').localeCompare(String(b.uploadedAt || '')))[0] || null;
  const registerContractFile = (stayId, f, reviewOnly = false) => {
    _.need(reviewOnly ? 'ocr.review' : 'tenants.manage');
    if (reviewOnly) _.needMs('2', 'OCR hợp đồng');
    const stay = Q.stay(stayId); if (!stay || !TH.auth.inScope(stay.buildingId)) throw new Error('Lượt thuê ngoài phạm vi được giao');
    _.checkFile(f.name);
    if (reviewOnly && !/\.(pdf|png|jpe?g)$/i.test(f.name)) throw new Error('OCR chỉ nhận PDF, JPG, PNG');
    if (f.size > 30 * 1024 * 1024) throw new Error('File vượt 30 MB');
    const same = f.blobId && S.one('contractFiles', x => x.stayId === stayId && (x.blobId === f.blobId || (f.hash && x.hash === f.hash)));
    if (same) {
      const changes = {};
      if (same.blobId !== f.blobId) changes.blobId = f.blobId;
      if (!reviewOnly && f.signed === true && same.signed === false) { changes.signed = true; changes.signedAt = F.nowISO(); }
      if (Object.keys(changes).length) { S.update('contractFiles', same.id, changes); _.audit('update','contractFile',same.id,'Bổ sung nguồn/xác nhận hợp đồng đã ký'); _.done(); }
      return S.get('contractFiles',same.id);
    }
    const v = S.where('contractFiles', x => x.stayId === stayId).length + 1;
    const olds = new Set(S.where('contractFiles', x => x.stayId === stayId).map(x => x.id));
    S.where('ocrSessions', o => olds.has(o.fileId) && ['review','uploaded'].includes(o.status)).forEach(o => S.update('ocrSessions', o.id, { status: 'superseded', supersededAt: F.nowISO(), supersededBy: 'file' }));
    const signed = !reviewOnly && /\.(pdf|png|jpe?g)$/i.test(f.name) && (f.signed === true || (!reviewOnly && f.signed === undefined));
    const r = S.add('contractFiles', { stayId, name: f.name, size: f.size, blobId: f.blobId, hash: f.hash, source: f.source || 'upload', signed, signedAt: signed ? F.nowISO() : null, version: v, uploadedBy: _.who(), uploadedAt: F.nowISO(), ocr: 'uploaded' });
    if (signed) recordStayVersion(stayId, 'signed', { effectiveFrom: r.signedAt.slice(0, 10), documentIds: [r.id], sourceRef: r.id, reason: 'Gắn hợp đồng đã ký ' + f.name });
    _.audit('upload', 'contractFile', r.id, 'Tải file HĐ ' + f.name); _.done(); return r;
  };
  X.registerContractFile = (stayId,f,reviewOnly=false) => S._batch ? registerContractFile(stayId,f,reviewOnly) : S.atomic(()=>registerContractFile(stayId,f,reviewOnly));
  X.addContractFile = (stayId, f) => X.registerContractFile(stayId, f);
  /* D8: điều khoản HĐ đã rà soát từ OCR → lượt thuê. Ngày ký / nhận / tính tiền chỉ đổi khi lượt thuê chưa có hóa đơn phát hành
     (hóa đơn đã phát hành không tính lại); trả về trường đã ghi và trường bỏ qua để UI cảnh báo. */
  _.applyStayTerms = (stayId, t, reason) => {
    const s = Q.stay(stayId); if (!s) throw new Error('Không tìm thấy lượt thuê');
    const issued = S.one('invoices', i => i.stayId === stayId && i.lifecycle !== 'draft');
    const MAP = { endDate: 'endDate', payMonths: 'payMonths', dueDay: 'dueDay', deposit: 'depositAmount', people: 'people', vehicles: 'vehicles', signDate: 'dealDate', moveInDate: 'moveInDate', rentStart: 'rentStart', svcStart:'svcStart' };
    const DATES = ['signDate', 'moveInDate', 'rentStart', 'svcStart'];
    const patch = {}, applied = [], skipped = [];
    Object.entries(t).forEach(([k, v]) => {
      const f = MAP[k]; if (!f || v === '' || v == null || String(s[f] ?? '') === String(v)) return;
      if (DATES.includes(k) && issued) { skipped.push(k); return; }
      patch[f] = v; applied.push(k);
      if (k === 'rentStart' && s.svcStart === s.rentStart) patch.svcStart = v;
    });
    if (applied.length) { S.update('stays', stayId, patch); recordStayVersion(stayId, 'ocr_applied', { effectiveFrom: patch.rentStart || F.today(), reason, sourceRef: reason }); _.audit('update', 'stay', stayId, `Điều khoản HĐ ${s.code} theo ${reason}: ${applied.join(', ')}`); }
    return { applied, skipped };
  };
  X.updateCustomer = (id, patch) => { _.need('tenants.manage'); S.update('customers', id, patch); _.audit('update', 'customer', id, 'Sửa thông tin khách'); _.done(); };
})(window.TH);
