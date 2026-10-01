/* Actions + selectors kinh doanh Phase 2 (UI-19 tổng quan hàng, UI-20 khách xem, UI-21 giao dịch chốt; đặc tả §3.5 dòng 284–299, F02/F11).
   Deal thay "lượt thuê chờ nhận" của Phase 1: chốt → tạo khách + lượt thuê chờ nhận; khách vào ở → deal "đã nhận".
   Mỗi thao tác hủy / đổi phòng / bỏ cọc là một sự kiện riêng để doanh số, cọc, hoa hồng không bị đếm hai lần. */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, Cc = TH.calc, A = TH.auth;
  const phoneOk = (p) => /^0\d{9}$/.test(String(p || '').replace(/\s/g, ''));
  const normPhone = (p) => String(p || '').replace(/\s/g, '');
  const fail = (fields, msg = 'Dữ liệu chưa hợp lệ') => { const e = new Error(msg); e.fields = fields; throw e; };

  /* ---- selectors ---- */
  Q.salesScoped = (arr) => arr.filter(x => A.inSales(x.saleIds));
  Q.lead = (id) => S.get('leads', id);
  Q.deal = (id) => S.get('deals', id);
  Q.dealOfStay = (stayId) => S.one('deals', d => d.stayId === stayId);
  Q.viewingsOf = (leadId) => S.where('viewings', v => v.leadId === leadId).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  Q.saleName = (ids) => (ids || []).map(id => (Q.emp(id) || {}).name || '?').join(', ');
  Q.salesStaff = () => S.all('employees').filter(e => ['SALE', 'NVKD', 'TNKD'].includes(e.title) && e.status !== 'inactive');
  /* Phòng có thể chốt (UI-19): có giá, khai thác, không có khách chờ nhận / deal đang chờ; trạng thái bán: ở luôn / trống cuối tháng / cần dọn */
  /* Phòng đang bị giữ bởi giao dịch chốt: deal "chờ nhận" và lượt thuê của deal vẫn chờ nhận (A4 – deal kẹt không khóa phòng mãi) */
  const heldDeals = () => S.where('deals', d => d.status === 'closed' && (Q.stay(d.stayId) || {}).status === 'pending');
  Q.dealHolds = (roomId) => heldDeals().some(d => d.roomId === roomId);
  Q.forSale = (asOf) => {
    const v = Q.vacancy(asOf); const held = new Set(heldDeals().map(d => d.roomId));
    return [...v.now.map(r => [r, 'now']), ...v.endOfMonth.map(r => [r, 'eom']), ...v.cleaning.map(r => [r, 'clean'])].filter(([r]) => !held.has(r.id) && !Q.pendingStay(r.id)).map(([r, k]) => ({ room: r, kind: k }));
  };
  Q.DEAL_ST = { closed: ['Đã chốt – chờ nhận', 'blue'], received: ['Đã nhận', 'green'], cancelled: ['Hủy', 'gray'], forfeited: ['Hủy – bỏ cọc', 'red'] };
  Q.LEAD_ST = { new: ['Mới', 'gray'], viewed: ['Đã xem', 'blue'], considering: ['Cân nhắc', 'amber'], closed: ['Đã chốt', 'green'], lost: ['Không thuê', 'red'] };
  /* Loại nhận phòng (UI-21): ở ngay (≤ 3 ngày sau chốt) / cuối tháng (nhận trong tháng chốt) / chờ nhận */
  Q.dealKind = (d) => !d.moveInDate ? 'Chờ nhận' : Cc.dates.diffDays(d.closeDate, d.moveInDate) <= 3 ? 'Ở ngay' : F.period(d.moveInDate) === F.period(d.closeDate) ? 'Cuối tháng' : 'Chờ nhận';
  /* Tình trạng thu cọc của deal theo sổ cọc lượt thuê */
  Q.dealDeposit = (d) => {
    if (!d.stayId) return { held: 0, state: 'none' };
    const held = Math.max(0, X.depositIn(d.stayId));
    return { held, state: held <= 0 ? 'none' : held + 0.5 < (d.deposit || 0) ? 'partial' : 'full' };
  };
  /* Điều kiện chi hoa hồng (CH-19): 1 cọc + 1 tháng + HĐ đã ký; ngày đủ điều kiện = ngày muộn nhất trong ba mốc (GĐ OQ-13 kỳ ghi nhận) */
  Q.dealEligibility = (d) => {
    const s = d.stayId ? Q.stay(d.stayId) : null;
    if (d.status === 'cancelled') return { ok: false, missing: ['Deal đã hủy'], date: null };
    if (d.status === 'forfeited') {
      const f = S.where('depositLedger', l => l.stayId === d.stayId && l.kind === 'forfeit_revenue');
      const r = Cc.commission.eligible({ forfeited: true, forfeitAmount: f.reduce((t, l) => t + l.amount, 0) });
      return Object.assign(r, { date: f.length ? f.map(l => l.date).sort().pop() : null });
    }
    if (!s) return { ok: false, missing: ['Chưa có lượt thuê'], date: null };
    const depRows = S.where('depositLedger', l => l.stayId === s.id && ['opening', 'receive', 'transfer_in'].includes(l.kind));
    const inv = S.where('invoices', i => i.stayId === s.id && i.lifecycle !== 'draft' && i.kind !== 'deposit_excess').sort((a, b) => a.period.localeCompare(b.period))[0];
    const st = inv ? Q.invState(inv) : null;
    const file = Q.signedContract(s.id);
    const r = Cc.commission.eligible({ depositHeld: X.depositIn(s.id), depositDue: d.deposit, firstMonthPaid: !!(st && st.remaining <= 0.5 && st.paid > 0), hasContract: !!file });
    const dates = [depRows.map(l => l.date).sort().pop(), st && st.lastPaid, file && String(file.signedAt || file.uploadedAt || F.today()).slice(0, 10)];
    return Object.assign(r, { date: r.ok ? dates.filter(Boolean).sort().pop() : null, invoiceId: inv ? inv.id : null });
  };
  const needDeal = (id) => {
    const d = Q.deal(id); if (!d) throw new Error('Không tìm thấy giao dịch');
    if (!A.inSales(d.saleIds)) throw new Error('Giao dịch ngoài phạm vi kinh doanh của bạn');
    return d;
  };
  const ev = (d, type, note, extra = {}) => S.update('deals', d.id, { events: [...(d.events || []), Object.assign({ type, at: F.today(), by: _.who(), note }, extra)] });

  /* ---- UI-20 khách tiềm năng ---- */
  /* Trùng SĐT (E08): với lead khác hoặc khách thuê đã có → báo lỗi ở ô SĐT; lưu được khi chọn gắn vào lead cũ (d.attachTo) hoặc ghi lý do (d.dupReason) */
  X.findContact = (phone) => {
    const p = normPhone(phone); if (!p) return null;
    const lead = S.one('leads', l => normPhone(l.phone) === p);
    const cust = S.one('customers', c => normPhone(c.phone) === p);
    return lead || cust ? { lead, customer: cust } : null;
  };
  X.addLead = (d) => { _.needMs('2', 'Kinh doanh (UI-19…22)');
    _.need('sales.manage');
    const errs = {};
    if (!phoneOk(d.phone)) errs.phone = 'SĐT 10 số, bắt đầu 0';
    if (!d.source) errs.source = 'Chọn nguồn khách';
    const scope = A.salesScope();
    const saleId = d.saleId || S.session.employeeId;
    if (!saleId || !Q.emp(saleId)) errs.saleId = 'Chọn sale phụ trách';
    else if (scope && !scope.has(saleId)) errs.saleId = 'Chỉ giao cho sale trong phạm vi của bạn';
    const hit = !errs.phone && X.findContact(d.phone);
    if (hit && !d.attachTo && !String(d.dupReason || '').trim()) {
      const who = hit.lead ? `khách xem ${hit.lead.code} – sale ${Q.saleName(hit.lead.saleIds)}` : `khách thuê ${hit.customer.name}`;
      errs.phone = 'Trùng liên hệ: ' + who + (hit.lead ? '. Gắn vào khách cũ hoặc ghi lý do tạo mới' : '. Ghi lý do tạo khách xem mới');
    }
    if (Object.keys(errs).length) fail(errs, errs.phone && errs.phone.startsWith('Trùng') ? 'Trùng liên hệ (E08)' : undefined);
    if (d.attachTo) {
      const l = Q.lead(d.attachTo); if (!l) throw new Error('Không tìm thấy khách cũ');
      if (!A.inSales(l.saleIds)) throw new Error('Khách cũ thuộc sale ngoài phạm vi của bạn – nhờ trưởng nhóm gắn liên hệ'); // B4
      S.update('leads', l.id, { note: [l.note, 'Liên hệ lại ' + F.date(F.today()) + (d.note ? ': ' + d.note : '')].filter(Boolean).join(' · ') });
      _.audit('update', 'lead', l.id, 'Gắn liên hệ trùng vào ' + l.code); _.done(); return Q.lead(l.id);
    }
    const lead = S.add('leads', { code: S.nextCode('leads', 'LD-'), name: String(d.name || '').trim() || 'Khách ' + normPhone(d.phone).slice(-4), phone: normPhone(d.phone), source: d.source,
      group: d.group || 'PHÒNG KD', partner: d.partner || null, saleIds: [saleId], sentAt: d.sentAt || F.today(), areaId: d.areaId || null, status: 'new', note: d.note || '',
      dupOf: hit ? (hit.lead ? hit.lead.id : hit.customer.id) : null, dupReason: hit ? d.dupReason : null });
    _.audit('create', 'lead', lead.id, `Khách xem ${lead.code} (${lead.source})${hit ? ' – trùng liên hệ: ' + d.dupReason : ''}`); _.done(); return lead;
  };
  /* Giao lại sale phụ trách: leader / trưởng phòng / admin trong nhánh; sale không tự chuyển */
  X.assignLead = (id, saleId, reason) => { _.needMs('2', 'Kinh doanh (UI-19…22)');
    _.need('sales.manage');
    const l = Q.lead(id); if (!l) throw new Error('Không tìm thấy khách');
    const scope = A.salesScope();
    if ((TH.calc.rbac.ROLES[A.role()] || {}).sales === 'own') throw new Error('Sale không tự chuyển khách – nhờ trưởng nhóm');
    if (!A.inSales(l.saleIds) || (scope && !scope.has(saleId))) throw new Error('Ngoài phạm vi kinh doanh của bạn');
    if (!String(reason || '').trim()) fail({ reason: 'Nhập lý do chuyển' });
    S.update('leads', id, { saleIds: [saleId], transfers: [...(l.transfers || []), { from: l.saleIds, to: saleId, reason, at: F.today(), by: _.who() }], note: [l.note, `Chuyển sale ${Q.saleName(l.saleIds)} → ${Q.saleName([saleId])}: ${reason}`].filter(Boolean).join(' · ') });
    _.audit('assign', 'lead', id, 'Chuyển sale phụ trách ' + l.code); _.done();
  };
  X.addViewing = (leadId, d) => { _.needMs('2', 'Kinh doanh (UI-19…22)');
    _.need('sales.manage');
    const l = Q.lead(leadId); if (!l) throw new Error('Không tìm thấy khách');
    if (!A.inSales(l.saleIds)) throw new Error('Khách ngoài phạm vi kinh doanh của bạn');
    const r = Q.room(d.roomId); const errs = {};
    if (!r) errs.roomId = 'Chọn phòng'; if (!d.date) errs.date = 'Nhập ngày xem';
    if (Object.keys(errs).length) fail(errs);
    const v = S.add('viewings', { leadId, buildingId: r.buildingId, roomId: r.id, date: d.date, saleId: l.saleIds[0], result: 'viewed', note: d.note || '' });
    if (['new'].includes(l.status)) S.update('leads', leadId, { status: 'viewed' });
    _.audit('create', 'viewing', v.id, `Lượt xem ${r.code} – ${l.code}`); _.done(); return v;
  };
  X.setLeadStatus = (id, status, note) => { _.needMs('2', 'Kinh doanh (UI-19…22)');
    _.need('sales.manage');
    const l = Q.lead(id); if (!l || !A.inSales(l.saleIds)) throw new Error('Khách ngoài phạm vi kinh doanh của bạn');
    if (!Q.LEAD_ST[status] || status === 'closed') throw new Error('Trạng thái không hợp lệ – "Đã chốt" chỉ đặt khi chốt giao dịch');
    if (status === 'lost' && !String(note || '').trim()) fail({ note: 'Nhập lý do không thuê' });
    S.update('leads', id, { status, note: note ? [l.note, note].filter(Boolean).join(' · ') : l.note });
    _.audit('update', 'lead', id, `${l.code}: ${Q.LEAD_ST[status][0]}`); _.done();
  };

  // Recheck at submit time: dropdown availability can be stale.
  const roomIssue = r => !r ? 'Chọn phòng' : !(r.price > 0) || !Q.rentable(r) ? 'Phòng không khai thác cho thuê' : Q.pendingStay(r.id) || Q.dealHolds(r.id) ? 'Phòng đã có giao dịch / khách chờ nhận' : null;
  /* ---- UI-21 giao dịch chốt ---- */
  X.closeDeal = (d) => { _.needMs('2', 'Kinh doanh (UI-19…22)');
    _.need('deals.close');
    const l = Q.lead(d.leadId); if (!l) throw new Error('Không tìm thấy khách');
    if (!A.inSales(l.saleIds)) throw new Error('Khách ngoài phạm vi kinh doanh của bạn');
    const r = Q.room(d.roomId); const errs = {};
    if (roomIssue(r)) errs.roomId = roomIssue(r);
    if (!String(d.name || l.name || '').trim()) errs.name = 'Nhập tên khách';
    if (!(Number(d.price) > 0)) errs.price = 'Nhập giá chốt';
    if (!(Number(d.deposit) > 0)) errs.deposit = 'Nhập tiền cọc';
    if (!d.closeDate) errs.closeDate = 'Nhập ngày chốt';
    if (!d.billingStart) errs.billingStart = 'Nhập ngày tính tiền';
    if (d.billingStart && d.closeDate && d.billingStart < d.closeDate) errs.billingStart = 'Ngày tính tiền không trước ngày chốt';
    if (d.closeDate && d.closeDate > F.today()) errs.closeDate = 'Ngày chốt không sau hôm nay';
    if (d.moveInDate && d.closeDate && d.moveInDate < d.closeDate) errs.moveInDate = 'Ngày nhận không trước ngày chốt';
    const rawSales = d.saleIds === undefined ? l.saleIds : d.saleIds;
    const saleIds = Array.isArray(rawSales) ? [...new Set(rawSales)] : []; // không cho một sale nhận hai phần chia trùng
    const scope = A.salesScope(), validSales = new Set(Q.salesStaff().map(e => e.id));
    if (!saleIds.length || saleIds.some(id => !validSales.has(id) || (scope && !scope.has(id)))) errs.saleIds = 'Chọn sale đang làm việc trong phạm vi của bạn';
    if (!(Number(d.term) > 0)) errs.term = 'Nhập thời hạn HĐ (tháng)';
    if (Object.keys(errs).length) fail(errs);
    _.guardPeriod(F.period(d.closeDate), 'chốt giao dịch');
    const endDate = Cc.dates.addDays(Cc.dates.addMonths(d.billingStart, Number(d.term)), -1);
    const stay = _.createStay({ roomId: r.id, name: d.name || l.name, phone: l.phone, occupation: d.occupation, rentStart: d.billingStart, svcStart: d.billingStart, moveInDate: d.moveInDate || d.billingStart,
      endDate, rent: Number(d.price), deposit: Number(d.deposit), dealDate: d.closeDate, status: 'pending', dealId: 'pending' });
    const deal = S.add('deals', { code: S.nextCode('deals', 'GD-' + d.closeDate.slice(2, 4) + d.closeDate.slice(5, 7) + '-', 3), leadId: l.id, customerId: stay.customerId, roomId: r.id, buildingId: r.buildingId, stayId: stay.id,
      saleIds, partner: d.partner !== undefined ? (d.partner || null) : l.partner, source: l.source, group: l.group, closeDate: d.closeDate, moveInDate: d.moveInDate || d.billingStart,
      billingStart: d.billingStart, term: Number(d.term), price: Number(d.price), deposit: Number(d.deposit), status: 'closed', note: d.note || '',
      events: [{ type: 'close', at: d.closeDate, by: _.who(), note: 'Chốt thuê phòng ' + r.code }] });
    S.update('stays', stay.id, { dealId: deal.id });
    S.update('leads', l.id, { status: 'closed', prevStatus: l.status === 'closed' ? (l.prevStatus || 'viewed') : l.status }); // D3: hủy deal → lead về trạng thái trước khi chốt
    S.where('viewings', v => v.leadId === l.id && v.roomId === r.id).forEach(v => S.update('viewings', v.id, { result: 'closed' }));
    X.buildDealCommissions(deal.id, true);
    _.audit('create', 'deal', deal.id, `Chốt ${deal.code}: ${r.code}, giá ${F.vnd(deal.price)}, cọc ${F.vnd(deal.deposit)}`); _.done();
    return Q.deal(deal.id);
  };
  /* Sửa ngày nhận phòng dự kiến (UI-21): sự kiện riêng, lượt thuê chờ nhận đổi theo; không đổi ngày tính tiền */
  X.setDealMoveIn = (id, date, reason) => { _.needMs('2', 'Kinh doanh (UI-19…22)');
    _.need('deals.close');
    const d = needDeal(id);
    if (d.status !== 'closed') throw new Error('Chỉ sửa ngày nhận khi giao dịch đang chờ nhận');
    if (!date) fail({ date: 'Nhập ngày nhận dự kiến' });
    if (date < d.closeDate) fail({ date: 'Ngày nhận không trước ngày chốt' });
    if (!String(reason || '').trim()) fail({ reason: 'Nhập lý do' });
    S.update('deals', id, { moveInDate: date });
    if ((Q.stay(d.stayId) || {}).status === 'pending') S.update('stays', d.stayId, { moveInDate: date });
    ev(Q.deal(id), 'movein', reason, { from: F.date(d.moveInDate), to: F.date(date) });
    _.audit('update', 'deal', id, `Đổi ngày nhận dự kiến ${d.code}: ${F.date(d.moveInDate)} → ${F.date(date)} – ${reason}`); _.done();
  };
  /* Tình trạng thu của deal (UI-21 "thu đủ/thiếu"): cọc + tháng đầu */
  Q.dealCollect = (d) => {
    const dep = Q.dealDeposit(d); const s = d.stayId ? Q.stay(d.stayId) : null;
    const inv = s ? S.where('invoices', i => i.stayId === s.id && i.lifecycle !== 'draft' && i.kind !== 'deposit_excess').sort((a, b) => a.period.localeCompare(b.period))[0] : null;
    const st = inv ? Q.invState(inv) : null;
    return { deposit: dep.state, first: !inv ? 'none' : st.remaining <= 0.5 ? 'full' : st.paid > 0 ? 'partial' : 'unpaid', invoiceId: inv ? inv.id : null };
  };
  /* Chỉ tiêu doanh số theo từng sale, có ngày hiệu lực (UI-22 nhân sự sale); không đặt riêng → tham số chung salesTarget */
  Q.salesTarget = (employeeId, date) => {
    const v = S.where('salesTargets', t => t.employeeId === employeeId && t.from <= date).sort((a, b) => b.from.localeCompare(a.from))[0];
    return v ? v.amount : Q.param('salesTarget', date);
  };
  X.setSalesTarget = (employeeId, amount, from, reason) => { _.needMs('2', 'Kinh doanh (UI-19…22)');
    _.need('commission.policy');
    const errs = {};
    if (!Q.emp(employeeId)) errs.employeeId = 'Chọn sale';
    if (!(Number(amount) > 0)) errs.amount = 'Nhập chỉ tiêu';
    if (!from) errs.from = 'Nhập ngày hiệu lực';
    if (!String(reason || '').trim()) errs.reason = 'Nhập lý do';
    if (Object.keys(errs).length) fail(errs);
    _.guardEffective(from, 'chỉ tiêu doanh số');
    const t = S.add('salesTargets', { employeeId, amount: Number(amount), from, reason, by: _.who(), at: F.nowISO() });
    _.audit('create', 'salesTarget', t.id, `Chỉ tiêu ${(Q.emp(employeeId) || {}).name} từ ${F.date(from)}: ${F.vnd(amount)}`); _.done(); return t;
  };
  /* Khách vào ở: kích hoạt lượt thuê chờ nhận (UI-07) – deal "đã nhận" */
  X.receiveDeal = (id, date) => { _.needMs('2', 'Kinh doanh (UI-19…22)');
    _.need('tenants.manage');
    const d = needDeal(id);
    if (d.status !== 'closed') throw new Error('Chỉ nhận phòng cho giao dịch đang chờ nhận');
    _.activateStay(d.stayId, date || d.moveInDate); // lõi nhận phòng cập nhật deal "đã nhận" + sự kiện
    _.audit('receive', 'deal', id, 'Khách nhận phòng ' + Q.roomCode(d.roomId)); _.done();
  };
  /* Đổi phòng trước khi nhận (E09): lượt thuê chờ chuyển sang phòng mới; hoa hồng giữ theo deal (đặc tả: đổi phòng giữ hoa hồng phòng cũ) */
  X.transferDeal = (id, d) => { _.needMs('2', 'Kinh doanh (UI-19…22)');
    _.need('deals.cancel');
    const deal = needDeal(id);
    if (deal.status !== 'closed') throw new Error('Chỉ đổi phòng khi giao dịch chưa nhận phòng');
    const to = Q.room(d.toRoomId); const errs = {};
    if (roomIssue(to)) errs.toRoomId = roomIssue(to);
    else if (to.id === deal.roomId) errs.toRoomId = 'Chọn phòng khác phòng hiện tại';
    if (!String(d.reason || '').trim()) errs.reason = 'Nhập lý do đổi phòng';
    if (Object.keys(errs).length) fail(errs);
    const s = Q.stay(deal.stayId); const from = Q.room(deal.roomId);
    if (Q.currentStay(to.id) && (Q.currentStay(to.id).plannedLeaveDate || Q.currentStay(to.id).endDate) >= s.rentStart) fail({ toRoomId: 'Phòng còn khách đến sau ngày tính tiền' });
    const n = S.where('stays', x => x.code && x.code.startsWith(to.code + 'A')).length;
    const code = to.code + 'A' + String(n + 1).padStart(3, '0');
    // B1: giá mới + biểu dịch vụ của tòa mới phải vào phiên biểu phí (hóa đơn đọc biểu phí, không đọc stay.rent)
    if (S.one('invoices', i => i.stayId === s.id && i.lifecycle !== 'draft')) fail({ toRoomId: 'Lượt thuê đã có hóa đơn phát hành – đổi phòng ở trang lượt thuê (UI-07)' });
    const newRent = Number(d.price) || s.rent;
    const items = to.buildingId !== s.buildingId ? (Q.rateOf((S.where('stays', x => x.buildingId === to.buildingId && x.id !== s.id && x.status === 'active')[0] || {}).id) || {}).items : null;
    S.where('rateVersions', v => v.stayId === s.id).forEach(v => S.update('rateVersions', v.id, Object.assign({ rent: newRent, reason: (v.reason || '') + ' · đổi phòng ' + from.code + ' → ' + to.code }, items ? { items: JSON.parse(JSON.stringify(items)) } : {})));
    S.update('stays', s.id, { roomId: to.id, buildingId: to.buildingId, code, rent: newRent, listPrice: to.listPrice });
    S.where('depositLedger', l => l.stayId === s.id).forEach(l => S.update('depositLedger', l.id, { buildingId: to.buildingId }));
    S.update('rooms', from.id, { status: Q.currentStay(from.id) ? from.status : 'vacant_ready', statusReason: 'Giao dịch chuyển sang ' + to.code });
    S.update('rooms', to.id, { status: Q.currentStay(to.id) ? to.status : 'reserved' });
    S.update('deals', id, { roomId: to.id, buildingId: to.buildingId, price: Number(d.price) || deal.price, transferredFrom: [...(deal.transferredFrom || []), from.id] });
    ev(Q.deal(id), 'transfer', d.reason, { from: from.code, to: to.code, priceFrom: deal.price, priceTo: Number(d.price) || deal.price }); // giữ giá cũ để truy vết doanh số
    S.where('commissions', c => c.dealId === id && c.status !== 'paid').forEach(c => S.update('commissions', c.id, { buildingId: to.buildingId, roomId: to.id, note: 'Giữ hoa hồng theo phòng cũ ' + from.code }));
    _.audit('transfer', 'deal', id, `Đổi phòng ${deal.code}: ${from.code} → ${to.code} – ${d.reason}`); _.done();
  };
  /* Hủy (chưa thu cọc): không doanh số, không hoa hồng, phòng mở bán lại */
  X.cancelDeal = (id, reason) => { _.needMs('2', 'Kinh doanh (UI-19…22)');
    _.need('deals.cancel');
    const d = needDeal(id);
    if (d.status !== 'closed') throw new Error('Chỉ hủy giao dịch chưa nhận phòng');
    if (!String(reason || '').trim()) fail({ reason: 'Nhập lý do hủy' });
    if ((Q.stay(d.stayId) || {}).status !== 'pending') throw new Error('Lượt thuê của giao dịch không còn chờ nhận (khách đã vào ở hoặc đã kết thúc) – không hủy được');
    if (Q.dealDeposit(d).held > 0) throw new Error('Khách đã nộp cọc – dùng "Khách bỏ cọc" để cọc thành doanh thu');
    S.update('stays', d.stayId, { status: 'cancelled', endType: null, endDate: F.today(), endReason: 'Hủy giao dịch: ' + reason });
    const r = Q.room(d.roomId); S.update('rooms', r.id, { status: Q.currentStay(r.id) ? r.status : 'vacant_ready', statusReason: 'Hủy giao dịch ' + d.code });
    S.update('deals', id, { status: 'cancelled' });
    ev(Q.deal(id), 'cancel', reason);
    // D3: khách quay lại theo dõi – chốt lại hoặc đánh "không thuê" được
    const l = Q.lead(d.leadId);
    if (l && l.status === 'closed' && !S.one('deals', x => x.leadId === l.id && x.id !== id && ['closed', 'received'].includes(x.status))) {
      const back = l.prevStatus && l.prevStatus !== 'closed' ? l.prevStatus : (S.one('viewings', v => v.leadId === l.id) ? 'viewed' : 'new');
      S.update('leads', l.id, { status: back, note: [l.note, 'Hủy giao dịch ' + d.code + ': ' + reason].filter(Boolean).join(' · ') });
    }
    S.where('viewings', v => v.leadId === d.leadId && v.roomId === d.roomId && v.result === 'closed').forEach(v => S.update('viewings', v.id, { result: 'viewed', note: [v.note, 'Giao dịch ' + d.code + ' đã hủy'].filter(Boolean).join(' · ') }));
    S.where('commissions', c => c.dealId === id && c.status !== 'paid').forEach(c => S.update('commissions', c.id, { status: 'void', note: 'Deal hủy' }));
    _.audit('cancel', 'deal', id, `Hủy ${d.code}: ${reason}`); _.done();
  };
  /* Khách bỏ cọc (đặc tả dòng 299): kết thúc lượt thuê chờ nhận loại "bỏ cọc" → cọc thành doanh thu dòng 5; không công nợ, không phiếu hoàn;
     hoa hồng tính lại trên cơ sở cọc − tiền phòng các ngày đã tính (nếu ngày bỏ sau ngày tính tiền) */
  X.forfeitDeal = (id, d) => { _.needMs('2', 'Kinh doanh (UI-19…22)');
    _.need('deals.cancel');
    const deal = needDeal(id);
    if (deal.status !== 'closed') throw new Error('Chỉ ghi bỏ cọc cho giao dịch chưa nhận phòng');
    if (!d.date) fail({ date: 'Nhập ngày khách báo bỏ' });
    if (!String(d.reason || '').trim()) fail({ reason: 'Nhập lý do' });
    const held = Q.dealDeposit(deal).held;
    if (!(held > 0)) throw new Error('Khách chưa nộp cọc – dùng "Hủy giao dịch"');
    if (d.date < deal.closeDate) fail({ date: 'Ngày khách bỏ không trước ngày chốt ' + F.date(deal.closeDate) });
    _.endStay(deal.stayId, { endType: 'forfeit', date: d.date, reason: d.reason }, { dealScope: true }); // lõi kết thúc gọi _.syncDealForfeit
    const f = Q.deal(id).forfeit || {};
    _.audit('forfeit', 'deal', id, `Khách bỏ cọc ${deal.code}: cọc ${F.vnd(f.deposit)} → doanh thu; cơ sở hoa hồng ${F.vnd(f.base)}`); _.done();
  };
  /* Đồng bộ deal khi lượt thuê chờ nhận kết thúc "bỏ cọc" (từ UI-21 hoặc UI-07): deal "bỏ cọc", cơ sở hoa hồng = cọc − tiền ngày đã ở, tính lại hoa hồng */
  _.syncDealForfeit = (dealId, { date, reason, deposit }) => {
    const deal = Q.deal(dealId); if (!deal || deal.status !== 'closed') return;
    const days = Math.max(0, Cc.dates.diffDays(deal.billingStart, date));
    const base = Cc.commission.forfeitBase({ deposit, rent: deal.price, days, dim: Cc.dates.daysInMonth(F.period(date)) });
    S.update('deals', dealId, { status: 'forfeited', forfeit: { date, deposit, days, base } });
    ev(Q.deal(dealId), 'forfeit', reason, { at: date });
    X.buildDealCommissions(dealId, true);
  };
})(window.TH);
