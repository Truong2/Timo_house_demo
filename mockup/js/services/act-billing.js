/* Actions – chỉ số, tạo kỳ hóa đơn (nháp), phát hành, điều chỉnh sau phát hành (UI-10 → UI-12, F03/F04). */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, Cc = TH.calc;

  X.saveReading = (d) => {
    _.need('readings.manage');
    if (!TH.auth.inScope(d.buildingId)) throw new Error('Phòng ngoài phạm vi được giao');
    const elPrev = Number(d.elPrev), elCurr = Number(d.elCurr);
    if (isNaN(elCurr)) throw new Error('Nhập chỉ số điện mới');
    const anomaly = elCurr < elPrev ? 'decrease' : (elCurr - elPrev > 1500 ? 'spike' : null);
    if (anomaly === 'decrease' && !String(d.reason || '').trim()) throw new Error('Chỉ số mới nhỏ hơn chỉ số cũ – nhập lý do (thay đồng hồ, nhập sai kỳ trước…)');
    _.guardPeriod(d.period, 'nhập chỉ số');
    const ex = S.one('meterReadings', r => r.roomId === d.roomId && r.period === d.period && !r.vacant && (!d.stayId || !r.stayId || r.stayId === d.stayId));
    if (ex && ex.locked) throw new Error('Chỉ số đã đưa vào hóa đơn phát hành – tạo điều chỉnh trên hóa đơn');
    const rec = { period: d.period, roomId: d.roomId, stayId: d.stayId, buildingId: d.buildingId, elPrev, elCurr, waPrev: d.waPrev === '' || d.waPrev == null ? null : Number(d.waPrev), waCurr: d.waCurr === '' || d.waCurr == null ? null : Number(d.waCurr),
      people: Number(d.people) || 1, vehicles: Number(d.vehicles) || 0, readAt: d.readAt || F.today(), enteredBy: _.who(), anomaly: anomaly === 'decrease' && d.reason ? 'decrease_ok' : anomaly, reason: d.reason || null, source: 'web', locked: false };
    const r = ex ? S.update('meterReadings', ex.id, rec) : S.add('meterReadings', rec);
    _.audit('save', 'reading', r.id, `Chỉ số ${Q.roomCode(d.roomId)} kỳ ${F.periodShort(d.period)}: ${elPrev} → ${elCurr}`);
    _.done(); return r;
  };

  /* Điện chung (UI-10, dòng 12, §2.3 dòng 11): nhóm phòng dùng chung đồng hồ; tiền điện chung chia theo phòng hoặc theo người cho các lượt thuê trong kỳ */
  X.addSharedGroup = (d) => {
    _.need('rates.manage');
    const b = Q.building(d.buildingId); if (!b) throw new Error('Chọn tòa');
    const roomIds = (d.roomIds || []).filter(Boolean);
    if (roomIds.length < 2) throw new Error('Nhóm điện chung cần ít nhất 2 phòng');
    if (roomIds.some(r => (Q.room(r) || {}).buildingId !== b.id)) throw new Error('Các phòng phải cùng tòa ' + b.code);
    const busy = roomIds.filter(r => S.one('sharedMeterGroups', g => g.active !== false && g.roomIds.includes(r)));
    if (busy.length) throw new Error('Phòng đã thuộc nhóm điện chung khác: ' + busy.map(Q.roomCode).join(', '));
    if (!(Number(d.unit) > 0)) throw new Error('Nhập đơn giá điện chung');
    if (!['rooms', 'people'].includes(d.method)) throw new Error('Chọn cách chia');
    const g = S.add('sharedMeterGroups', { buildingId: b.id, name: String(d.name || '').trim() || 'Điện chung ' + b.code, roomIds, method: d.method, unit: Number(d.unit), active: true, meterCode: d.meterCode || '' });
    _.audit('create', 'sharedMeter', g.id, `Nhóm điện chung ${g.name}: ${roomIds.length} phòng, chia ${d.method === 'people' ? 'theo người' : 'theo phòng'}`); _.done(); return g;
  };
  X.saveSharedReading = (d) => {
    _.need('readings.manage');
    const g = S.get('sharedMeterGroups', d.groupId); if (!g) throw new Error('Chọn nhóm điện chung');
    if (!TH.auth.inScope(g.buildingId)) throw new Error('Tòa ngoài phạm vi được giao');
    _.guardPeriod(d.period, 'nhập chỉ số');
    const prev = Number(d.prev), curr = Number(d.curr);
    if (isNaN(prev) || isNaN(curr)) throw new Error('Nhập chỉ số cũ và mới');
    if (curr < prev && !String(d.reason || '').trim()) throw new Error('Chỉ số mới nhỏ hơn chỉ số cũ – nhập lý do');
    const ex = S.one('meterReadings', r => r.groupId === g.id && r.period === d.period);
    if (ex && ex.locked) throw new Error('Chỉ số điện chung đã vào hóa đơn phát hành');
    const rec = { period: d.period, groupId: g.id, buildingId: g.buildingId, kind: 'common', elPrev: prev, elCurr: curr, readAt: d.readAt || F.today(), reason: d.reason || null, enteredBy: _.who(), source: 'web', locked: false };
    const r = ex ? S.update('meterReadings', ex.id, rec) : S.add('meterReadings', rec);
    _.audit('save', 'reading', r.id, `Điện chung ${g.name} kỳ ${F.periodShort(d.period)}: ${prev} → ${curr}`); _.done(); return r;
  };
  /* Phần điện chung của một lượt thuê trong kỳ: chia cho các lượt thuê phát sinh hóa đơn thuộc các phòng của nhóm */
  X.commonShare = (s, period) => {
    const g = S.one('sharedMeterGroups', x => x.active !== false && x.roomIds.includes(s.roomId)); if (!g) return null;
    const rd = S.one('meterReadings', r => r.groupId === g.id && r.period === period); if (!rd) return { group: g, missing: true };
    const stays = X.billableStays(period, [g.buildingId]).filter(x => g.roomIds.includes(x.roomId) && (x.svcStart || x.rentStart) <= Cc.dates.billingWindow(period, Q.params()).cutoff);
    if (!stays.some(x => x.id === s.id)) return null;
    const parts = Cc.billing.splitShared({ prev: rd.elPrev, curr: rd.elCurr, unit: g.unit, method: g.method, rooms: stays.map(x => ({ roomId: x.id, people: x.people || 1 })) });
    const mine = parts.find(p => p.roomId === s.id);
    return { group: g, reading: rd, qty: mine.qty, unit: g.unit, amount: mine.amount, note: `${g.name}: ${rd.elCurr - rd.elPrev} kWh chia ${stays.length} ${g.method === 'people' ? 'phòng theo người' : 'phòng'}` };
  };
  /* Danh sách lượt thuê phát sinh hóa đơn kỳ p trong các tòa */
  X.billableStays = (period, buildingIds) => {
    const ps = Cc.dates.periodStart(period), pe = Cc.dates.periodEnd(period);
    const set = new Set(buildingIds);
    return S.all('stays').filter(s => set.has(s.buildingId) && ['active', 'pending'].includes(s.status) && s.rentStart && s.rentStart <= pe && (!s.endDate || s.endDate >= ps));
  };
  /* Xem trước / tạo nháp (E11): kiểm tra thiếu chỉ số, trùng hóa đơn, phòng mới giữa tháng */
  /* Chỉ số của đúng lượt thuê (F04 "không thu hai lần", UI-10 "không lấy chỉ số khách cũ"):
     chỉ số ghi cho lượt thuê nào thì chỉ lượt thuê đó dùng; chỉ số không gắn lượt thuê chỉ thuộc lượt thuê đã bắt đầu dịch vụ trước ngày chốt.
     Khách mới bắt đầu dịch vụ sau ngày chốt kỳ chưa có tiêu thụ → kỳ này không có dòng điện/nước theo chỉ số. */
  X.readingFor = (s, period) => S.one('meterReadings', r => r.period === period && !r.vacant && r.roomId === s.roomId
    && (r.stayId ? r.stayId === s.id : (s.svcStart || s.rentStart) <= (r.readAt || Cc.dates.periodStart(period))));
  X.meterNotStarted = (s, period, w) => (s.svcStart || s.rentStart) > w.cutoff;
  X.previewPeriod = (period, buildingIds) => {
    const prm = Q.params(); const w = Cc.dates.billingWindow(period, prm);
    return X.billableStays(period, buildingIds).map(s => {
      const dup = S.one('invoices', i => i.stayId === s.id && i.period === period);
      const notStarted = X.meterNotStarted(s, period, w);
      const rd = notStarted ? null : X.readingFor(s, period);
      const rate = Q.rateOf(s.id, Cc.dates.periodStart(period));
      const firstInvoice = !S.one('invoices', i => i.stayId === s.id);
      const rent = Cc.dates.proRataDays(s.rentStart, period, s.stopBillingDate);
      const issues = [];
      if (dup) issues.push('Đã có hóa đơn kỳ này');
      if (!rate) issues.push('Chưa có biểu phí');
      if (rate && rate.items.electric && !rd && !notStarted) issues.push('Thiếu chỉ số điện nước');
      if (rd && rd.anomaly === 'decrease') issues.push('Chỉ số giảm chưa xác nhận');
      const common = notStarted ? null : X.commonShare(s, period);
      if (common && common.missing) issues.push('Thiếu chỉ số điện chung ' + common.group.name);
      return { stay: s, reading: rd, common: common && !common.missing ? common : null, rate, dup, firstInvoice, midMonth: rent.days < rent.denom, days: rent.days, denom: rent.denom, issues, ok: !issues.length, window: w };
    });
  };
  X.createInvoiceDrafts = (period, buildingIds, opts = {}) => {
    _.need('invoices.prepare');
    _.guardPeriod(period, 'tạo hóa đơn');
    const prm = Q.params(); const w = Cc.dates.billingWindow(period, prm);
    const rows = X.previewPeriod(period, buildingIds);
    const created = [], skipped = [];
    rows.forEach(r => {
      if (!r.ok && !(opts.allowMissingReading && r.issues.every(x => x === 'Thiếu chỉ số điện nước'))) { skipped.push(r); return; }
      const s = r.stay, rate = r.rate, rd = r.reading || {};
      const depositPaidToInvoice = S.all('invoices').some(i => i.stayId === s.id && (i.lines || []).some(l => (Array.isArray(l) ? l[0] : l.no) === 2 && (Array.isArray(l) ? l[6] : l.amount) > 0));
      const depositDue = r.firstInvoice && !depositPaidToInvoice ? Math.max(0, (s.depositAmount || 0) - X.depositIn(s.id)) /* cọc đã có trong sổ cọc không thu lại */ : 0;
      const prev = S.all('invoices').filter(i => i.stayId === s.id && i.period < period && i.lifecycle !== 'draft');
      const oldDebt = prev.reduce((t, i) => t + Q.invState(i).remaining - (i.carriedOut || 0), 0);
      const prevPeriod = Cc.dates.prevPeriod(period);
      const hadPrev = S.one('invoices', i => i.stayId === s.id && i.period === prevPeriod);
      const other = !hadPrev && s.rentStart && s.rentStart.slice(0, 7) === prevPeriod ? Cc.billing.carryOther({ monthly: rate.rent, startISO: s.rentStart, period }) : null;
      const lines = Cc.billing.buildLines({ stay: s, rate, period, reading: { elPrev: rd.elPrev, elCurr: rd.elCurr, waPrev: rd.waPrev, waCurr: rd.waCurr }, people: rd.people || s.people, vehicles: rd.vehicles != null ? rd.vehicles : s.vehicles,
        depositDue, oldDebt: Math.max(0, Math.round(oldDebt)), other, common: r.common, roundLines: prm.roundLines !== false });
      const b = Q.building(s.buildingId);
      const inv = S.add('invoices', { id: 'inv_INV-' + period + '-' + s.code, code: 'INV-' + period + '-' + s.code, period, stayId: s.id, roomId: s.roomId, buildingId: s.buildingId, customerCode: s.code,
        template: b.template, accountId: b.accountId, issueDate: w.issueDate, cutoff: w.cutoff, dueFrom: w.dueFrom, dueTo: w.dueTo, lifecycle: 'draft', isNewStay: r.firstInvoice, isBreach: false,
        lines, totalDue: Cc.billing.total(lines), rateVersionId: rate.id, readingId: rd.id || null, commonReadingId: r.common ? r.common.reading.id : null, oldDebtFrom: prev.filter(i => Q.invState(i).remaining > 0).map(i => i.id), createdBy: _.who() });
      created.push(inv);
    });
    _.audit('create', 'invoicePeriod', period, `Tạo ${created.length} hóa đơn nháp kỳ ${F.periodShort(period)} (${buildingIds.length} tòa), bỏ qua ${skipped.length}`);
    _.done(); return { created, skipped };
  };
  /* Sửa hóa đơn nháp (UI-12 "sửa nháp"): chỉ số cũ/mới (dòng 3/4 → SL = mới − cũ), SL, hệ số, đơn giá, thành tiền, ghi chú.
     Đổi hệ số/đơn giá/thành tiền phải có lý do; mọi thay đổi lưu lịch sử edits[]; tổng cần đóng tính lại = tổng 13 dòng. */
  const num = (v) => v === '' || v == null ? null : Number(v);
  X.updateDraftLines = (id, patches, reason) => {
    _.need('invoices.prepare');
    const inv = Q.invoice(id); if (!inv) throw new Error('Không tìm thấy hóa đơn');
    if (!TH.auth.inScope(inv.buildingId)) throw new Error('Hóa đơn ngoài phạm vi được giao');
    if (inv.lifecycle !== 'draft') throw new Error('Hóa đơn đã phát hành – dùng điều chỉnh có lý do');
    _.guardPeriod(inv.period, 'sửa hóa đơn');
    const edits = [], at = F.nowISO(), by = _.who();
    let needReason = false;
    const lines = Cc.billing.expand(inv.lines).map(l => {
      const p = (patches || []).find(x => Number(x.no) === l.no); if (!p) return l;
      const o = Object.assign({}, l);
      ['prev', 'curr', 'qty', 'factor', 'unit'].forEach(k => { const v = num(p[k]); if (v != null && !isNaN(v)) o[k] = v; });
      if ([3, 4].includes(l.no) && o.curr != null && o.prev != null && (num(p.curr) != null || num(p.prev) != null)) {
        if (o.curr < o.prev) throw new Error(`Dòng ${l.no}: chỉ số mới nhỏ hơn chỉ số cũ`);
        o.qty = Math.round((o.curr - o.prev) * 100) / 100;
      }
      if (o.qty < 0 || o.unit < 0 || o.factor < 0) throw new Error(`Dòng ${l.no}: số lượng, hệ số, đơn giá không được âm`);
      const calc = Math.round(o.qty * o.unit * o.factor);
      const manual = num(p.amount) != null && Math.abs(num(p.amount) - calc) > 0.5 && Math.abs(num(p.amount) - l.amount) > 0.5;
      o.amount = manual ? num(p.amount) : calc;
      if (p.note != null) o.note = String(p.note);
      ['prev', 'curr', 'qty', 'factor', 'unit', 'amount', 'note'].forEach(k => { if (String(o[k] ?? '') !== String(l[k] ?? '')) edits.push({ no: l.no, field: k, from: l[k], to: o[k], reason: reason || '', by, at }); });
      if (o.factor !== l.factor || o.unit !== l.unit || manual) needReason = true;
      return o;
    });
    if (!edits.length) return inv;
    if (needReason && !String(reason || '').trim()) throw new Error('Nhập lý do khi sửa hệ số, đơn giá hoặc thành tiền');
    S.update('invoices', id, { lines, totalDue: Cc.billing.total(lines), edits: [...(inv.edits || []), ...edits] });
    _.audit('update', 'invoice', id, `Sửa nháp ${inv.code}: ${[...new Set(edits.map(e => e.no))].map(n => 'dòng ' + n).join(', ')}${reason ? ' – ' + reason : ''}`);
    _.done(); return Q.invoice(id);
  };
  X.updateDraftLine = (id, no, patch) => X.updateDraftLines(id, [Object.assign({ no }, patch)], patch && patch.reason);
  X.deleteDraft = (id) => { _.need('invoices.prepare'); const inv = Q.invoice(id); if (inv.lifecycle !== 'draft') throw new Error('Chỉ xóa được hóa đơn nháp'); S.remove('invoices', id); _.audit('delete', 'invoice', id, 'Xóa nháp ' + inv.code); _.done(); };
  X.setInvoiceTemplate = (id, template) => {
    _.need('invoices.prepare');
    const inv = Q.invoice(id); if (!inv) throw new Error('Không tìm thấy hóa đơn');
    if (inv.lifecycle !== 'draft') throw new Error('Hóa đơn đã phát hành chỉ được xem snapshot bản in');
    if (!Cc.billing.TEMPLATES[template]) throw new Error('Mẫu in không hợp lệ');
    _.guardPeriod(inv.period, 'đổi mẫu in');
    const account = Q.accountForTemplate(template, inv.issueDate || F.today());
    if (!account) throw new Error('Chưa có tài khoản nhận tiền hiệu lực cho mẫu in đã chọn');
    const before = { template: inv.template, accountId: inv.accountId };
    S.update('invoices', id, { template, accountId: account.id });
    _.audit('change_template', 'invoice', id, `Đổi mẫu in ${inv.code}: ${before.template} → ${template}`, { before, after: { template, accountId: account.id }, reason: 'Chọn mẫu trên hóa đơn nháp', sourceRef: account.sourceRef });
    _.done(); return Q.invoice(id);
  };
  const printSnapshot = (inv, effectiveAccount) => {
    const tpl = Cc.billing.TEMPLATES[inv.template] || Cc.billing.TEMPLATES.VP;
    const acc = effectiveAccount || Q.accountForTemplate(inv.template, inv.issueDate || F.today()) || {};
    return { template: inv.template, templateName: tpl.name, templateVersion: tpl.version, accountId: acc.id || null, accountVersion: acc.version || 1,
      bank: acc.bank || '', number: acc.number || '', holder: acc.holder || '', transferPrefix: tpl.transferPrefix || '',
      transferNote: 'LƯU Ý: QUÝ KHÁCH HÀNG CHUYỂN KHOẢN KHÔNG ĐÚNG NỘI DUNG KẾ TOÁN KHÔNG CHECK ĐƯỢC SẼ TÍNH LÀ CHƯA THANH TOÁN. TRÂN TRỌNG !',
      footer: 'TRÂN TRỌNG THÔNG BÁO', sourceRef: acc.sourceRef || null, capturedAt: F.nowISO() };
  };
  X.issueInvoices = (ids) => {
    _.need('invoices.issue');
    let n = 0; const errs = [];
    ids.forEach(id => {
      const inv = Q.invoice(id); if (!inv || inv.lifecycle !== 'draft') return;
      _.guardPeriod(inv.period, 'phát hành');
      const effectiveAccount = Q.accountForTemplate(inv.template, inv.issueDate || F.today());
      if (!effectiveAccount) { errs.push(inv.code + ': Chưa có tài khoản nhận tiền hiệu lực cho mẫu in'); return; }
      const chk = Cc.billing.checkBeforeIssue(inv, { duplicate: S.where('invoices', i => i.stayId === inv.stayId && i.period === inv.period).length > 1 });
      if (!chk.ok) { errs.push(inv.code + ': ' + chk.errs.join('; ')); return; }
      S.update('invoices', id, { lifecycle: 'issued', issuedAt: F.nowISO(), issuedBy: _.who(), accountId: effectiveAccount.id, snapshot: { lines: JSON.parse(JSON.stringify(inv.lines)), total: inv.totalDue }, printSnapshot: printSnapshot(inv, effectiveAccount) });
      // Nợ cũ đã chuyển sang dòng 11 → khóa phần còn nợ của hóa đơn cũ để không đếm hai lần
      (inv.oldDebtFrom || []).forEach(pid => { const p = Q.invoice(pid); const st = Q.invState(p); if (st.remaining > 0) S.update('invoices', pid, { carriedOut: (p.carriedOut || 0) + st.remaining, carriedTo: id }); });
      if (inv.readingId) S.update('meterReadings', inv.readingId, { locked: true });
      if (inv.commonReadingId) S.update('meterReadings', inv.commonReadingId, { locked: true });
      if (X.applyPrepay) X.applyPrepay(id); // phần trả trước của kỳ (E14) áp ngay khi phát hành
      n++;
    });
    if (n) _.audit('issue', 'invoice', ids[0], `Phát hành ${n} hóa đơn`);
    _.done(); return { issued: n, errs };
  };
  /* Sau phát hành: điều chỉnh có lý do, giữ snapshot gốc */
  X.adjustInvoice = (id, d) => {
    _.need('invoices.adjust');
    const inv = Q.invoice(id);
    if (inv.lifecycle === 'draft') throw new Error('Hóa đơn nháp sửa trực tiếp');
    if (!String(d.reason || '').trim()) throw new Error('Nhập lý do điều chỉnh');
    const per = S.get('periods', inv.period); const locked = per && per.status === 'closed';
    const lines = Cc.billing.expand(inv.lines).map(l => l.no === Number(d.no) ? Object.assign({}, l, { amount: Number(d.amount), note: (l.note ? l.note + '; ' : '') + 'Điều chỉnh: ' + d.reason }) : l);
    const delta = Cc.billing.total(lines) - inv.totalDue;
    S.update('invoices', id, { lines, totalDue: Cc.billing.total(lines), lifecycle: 'adjusted', adjustments: [...(inv.adjustments || []), { at: F.nowISO(), by: _.who(), no: Number(d.no), delta, reason: d.reason }] });
    if (locked) S.add('adjustments', { period: F.period(F.today()), originalPeriod: inv.period, entity: 'invoice', entityId: id, delta, reason: d.reason, by: _.who(), at: F.nowISO() });
    _.audit('adjust', 'invoice', id, `Điều chỉnh ${inv.code} dòng ${d.no}: ${F.vnd(delta)} – ${d.reason}`); _.done();
  };
})(window.TH);
