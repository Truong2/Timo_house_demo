/* Phase 3 – Tài sản & thiết bị (UI-34, tab Tài sản UI-03; đặc tả dòng 545, CH-06/15/31, GĐ OQ-11).
   Một collection `assets` cho cả tài sản chủ nhà (phụ lục bàn giao – không khấu hao) và tài sản công ty (danh sách đầu tư – nguyên giá,
   số tháng khấu hao). Khấu hao kỳ của Báo cáo kinh doanh (UI-30 dòng 21) lấy từ Q.depItems(); Báo cáo tổng vẫn ghi nguyên giá theo chứng từ UI-15.
   Chuyển vị trí ghi lịch sử; khấu hao kỳ ghi cho tòa đặt tài sản ở cuối kỳ. Thanh lý ghi một lần giá trị còn lại vào kỳ thanh lý. */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, AS = TH.calc.assets, DP = TH.calc.depreciation, DT = TH.calc.dates;
  const fail = (fields, msg = 'Dữ liệu chưa hợp lệ') => { const e = new Error(msg); e.fields = fields; throw e; };
  Q.asset = (id) => S.get('assets', id);
  /* Tòa đặt tài sản tại ngày (theo lịch sử chuyển vị trí) */
  Q.assetBuildingAt = (a, date) => {
    const mv = (a.history || []).filter(h => h.kind === 'move' && h.before && h.after).sort((x, y) => (x.date || '').localeCompare(y.date || ''));
    if (!mv.length) return a.buildingId;
    const last = mv.filter(h => h.date <= date).pop();
    return last ? last.after.buildingId : mv[0].before.buildingId;
  };
  /* Danh sách theo phạm vi tòa của vai trò; f: {building, type, ownership, condition, status, room, q} */
  Q.assets = (f = {}) => S.all('assets').filter(a => TH.auth.inScope(a.buildingId)
    && (!f.building || a.buildingId === f.building) && (!f.type || a.type === f.type) && (!f.ownership || a.ownership === f.ownership)
    && (!f.condition || a.condition === f.condition) && (f.status ? a.status === f.status : a.status !== 'void') && (!f.room || a.roomId === f.room)
    && (!f.q || (a.code + ' ' + a.name + ' ' + (a.position || '')).toLowerCase().includes(String(f.q).toLowerCase())));
  /* Tài sản công ty có giá trị, chưa hủy → nguồn khấu hao; buildingId = tòa đặt cuối kỳ */
  Q.depItems = (period) => { const pe = period ? DT.periodEnd(period) : F.today();
    return S.all('assets').filter(a => a.ownership === 'company' && a.cost > 0 && !['void', 'removed'].includes(a.status) && (!period || !a.openingPeriod || a.openingPeriod <= period)).map(a => Object.assign({}, a, { buildingId: Q.assetBuildingAt(a, pe) })); };
  Q.depOfPeriod = (period) => DP.forPeriod(Q.depItems(period), period, Q.param('depRate', DT.periodEnd(period)));
  /* Tài sản công ty có giá trị tại cuối kỳ (UI-41) – gồm số dư đầu kỳ chưa ghi khấu hao web (openingPeriod > kỳ): giá trị đã có thật, chỉ khấu hao mới bắt đầu ghi từ openingPeriod */
  Q.nbvItems = (period) => { const pe = DT.periodEnd(period);
    return S.all('assets').filter(a => a.ownership === 'company' && a.cost > 0 && !['void', 'removed'].includes(a.status) && (a.depStart || a.receivedDate || '') <= pe).map(a => Object.assign({}, a, { buildingId: Q.assetBuildingAt(a, pe) })); };
  /* Giá trị còn lại tài sản công ty của tòa cuối kỳ (UI-41 LN/tài sản, GĐ OQ-24) */
  Q.assetNbv = (bid, period) => Q.nbvItems(period).filter(a => a.buildingId === bid).reduce((t, a) => t + DP.nbv(a, period), 0);
  /* Tòa đã có số dư tài sản nền (import UI-37 hoặc đầu tư ban đầu UI-33) → mẫu số LN/tài sản đủ; chỉ có vài món mua lẻ thì "chờ dữ liệu" */
  Q.assetBaseline = (bid, period) => Q.nbvItems(period).some(a => a.buildingId === bid && (a.source === 'opening' || a.source === 'initial'));
  Q.assetDepSchedule = (a, toPeriod) => DP.schedule(a, toPeriod || F.period(F.today()));
  /* Đã có khấu hao ghi vào kỳ đã khóa → không hủy / sửa giá trị, chỉ thanh lý */
  Q.assetBookedInClosed = (a) => S.all('periods').filter(p => p.status === 'closed').some(p => { const r = DP.ofItem(a, p.id); return r && r.amount > 0; });
  const nextCode = (bid) => { const b = Q.building(bid); const n = S.where('assets', a => a.buildingId === bid || (a.code || '').startsWith('TS-' + b.code + '-')).length + 1; let c = AS.code(b.code, n), i = n; while (S.one('assets', a => a.code === c)) c = AS.code(b.code, ++i); return c; };
  const hasEvidence = (d) => !!(d.expenseId || d.source === 'opening' || d.source === 'initial' || (d.docName && String(d.docName).trim()));

  X.addAsset = (d, silent) => {
    _.need('assets.manage'); _.needMs('3', 'Tài sản & khấu hao (UI-34)');
    const rec = Object.assign({ qty: 1, condition: 'good', source: 'manual' }, d);
    rec.qty = Number(rec.qty || 1); rec.cost = Number(rec.cost) || 0; rec.depMonths = rec.cost > 0 ? Number(rec.depMonths || Q.param('depMonthsDefault') || 63) : null;
    const errs = AS.validate(rec, { hasEvidence: hasEvidence(rec) });
    if (rec.buildingId && !Q.building(rec.buildingId)) errs.buildingId = 'Tòa không tồn tại';
    if (rec.roomId) { const r = Q.room(rec.roomId); if (!r || r.buildingId !== rec.buildingId) errs.roomId = 'Phòng không thuộc tòa đã chọn'; }
    if (rec.cost > 0 && !rec.depStart && !rec.receivedDate) errs.depStart = 'Nhập ngày bắt đầu khấu hao';
    if (Object.keys(errs).length) fail(errs);
    if (rec.cost > 0 && rec.source !== 'opening' && rec.source !== 'initial') _.guardPeriod(F.period(rec.depStart || rec.receivedDate), 'ghi tài sản có khấu hao');
    const a = X._createAsset(rec);
    _.audit('create', 'asset', a.id, `Tài sản ${a.code}: ${a.name} (${AS.ownLabel(a.ownership)}${a.cost ? ' · ' + F.vnd(a.cost) + ' · ' + a.depMonths + ' tháng KH' : ''})`);
    if (!silent) _.done(); return a;
  };
  /* Ghi bản ghi tài sản (không kiểm quyền / mốc) – dùng chung cho UI-34, chi mua sắm UI-15, import UI-37, seed */
  X._createAsset = (rec) => {
    rec = Object.assign({ qty: 1, condition: 'good', source: 'manual' }, rec);
    rec.cost = Number(rec.cost) || 0; rec.qty = Number(rec.qty || 1);
    if (rec.cost > 0 && !rec.depMonths) rec.depMonths = Number(Q.param('depMonthsDefault') || 63);
    const depStart = rec.cost > 0 ? (rec.depStart || rec.receivedDate) : null;
    const code = rec.code || nextCode(rec.buildingId);
    return S.add('assets', { id: rec.id || 'as_' + code.replace(/[^A-Za-z0-9]/g, '_'), code, name: String(rec.name || 'Thiết bị').trim(), type: rec.type, ownership: rec.ownership, buildingId: rec.buildingId, roomId: rec.roomId || null,
      position: rec.position || '', qty: rec.qty, condition: rec.condition, receivedDate: rec.receivedDate || depStart || F.today(), cost: rec.cost, depStart, depMonths: rec.depMonths,
      openingPeriod: rec.openingPeriod || null, warrantyTo: rec.warrantyTo || null, source: rec.source, expenseId: rec.expenseId || null, ownerContractId: rec.ownerContractId || null, capitalRef: rec.capitalRef || null,
      docs: rec.docName ? [{ name: rec.docName, at: F.nowISO(), by: _.who() }] : [], note: rec.note || '', status: 'active', disposal: null,
      history: [{ at: F.nowISO(), date: rec.receivedDate || depStart || F.today(), by: _.who(), kind: 'create', after: { buildingId: rec.buildingId, roomId: rec.roomId || null, position: rec.position || '' }, reason: AS.SOURCES[rec.source] || '' }] });
  };
  /* Sửa thông tin mô tả; nguyên giá / số tháng KH chỉ sửa khi chưa có khấu hao ở kỳ đã khóa */
  X.updateAsset = (id, d) => {
    _.need('assets.manage'); _.needMs('3', 'Tài sản & khấu hao (UI-34)');
    const a = Q.asset(id); if (!a) throw new Error('Không tìm thấy tài sản');
    if (a.status !== 'active') throw new Error('Tài sản đã ' + AS.STATUS[a.status].toLowerCase() + ' – không sửa');
    const patch = {}; ['name', 'type', 'qty', 'condition', 'warrantyTo', 'note'].forEach(k => { if (d[k] !== undefined) patch[k] = k === 'qty' ? Number(d[k]) : d[k]; });
    if (d.depMonths !== undefined && Number(d.depMonths) !== a.depMonths) {
      if (!(a.cost > 0)) fail({ depMonths: 'Tài sản không có nguyên giá – không khấu hao' });
      if (Q.assetBookedInClosed(a)) fail({ depMonths: 'Đã có khấu hao trong kỳ đã khóa – không đổi số tháng' });
      patch.depMonths = Number(d.depMonths);
    }
    const errs = AS.validate(Object.assign({}, a, patch), { hasEvidence: true }); if (Object.keys(errs).length) fail(errs);
    const before = {}; Object.keys(patch).forEach(k => { before[k] = a[k]; });
    S.update('assets', id, Object.assign(patch, { history: [...(a.history || []), { at: F.nowISO(), date: F.today(), by: _.who(), kind: 'edit', before, after: Object.assign({}, patch), reason: d.reason || '' }] }));
    _.audit('update', 'asset', id, `Sửa tài sản ${a.code}`); _.done(); return Q.asset(id);
  };
  /* Chuyển vị trí (tòa / phòng / vị trí) – bắt buộc lý do, ghi lịch sử; không chuyển tài sản chủ nhà sang tòa khác */
  X.moveAsset = (id, d) => {
    _.need('assets.manage'); _.needMs('3', 'Tài sản & khấu hao (UI-34)');
    const a = Q.asset(id); if (!a) throw new Error('Không tìm thấy tài sản');
    const errs = {}; const date = d.date || F.today(); const bid = d.buildingId || a.buildingId;
    if (a.status !== 'active') errs.buildingId = 'Tài sản không còn sử dụng';
    if (!Q.building(bid)) errs.buildingId = 'Tòa không tồn tại';
    if (a.ownership === 'owner' && bid !== a.buildingId) errs.buildingId = 'Tài sản chủ nhà thuộc tòa theo phụ lục bàn giao – không chuyển sang tòa khác';
    if (d.roomId) { const r = Q.room(d.roomId); if (!r || r.buildingId !== bid) errs.roomId = 'Phòng không thuộc tòa đã chọn'; }
    if (!String(d.reason || '').trim()) errs.reason = 'Nhập lý do chuyển';
    if (bid === a.buildingId && (d.roomId || null) === (a.roomId || null) && (d.position || '') === (a.position || '')) errs.position = 'Vị trí mới trùng vị trí hiện tại';
    if (Object.keys(errs).length) fail(errs);
    if (bid !== a.buildingId && a.cost > 0) _.guardEffective(date, 'chuyển tòa tài sản có khấu hao');
    const before = { buildingId: a.buildingId, roomId: a.roomId || null, position: a.position || '' }, after = { buildingId: bid, roomId: d.roomId || null, position: d.position || '' };
    S.update('assets', id, Object.assign({}, after, { history: [...(a.history || []), { at: F.nowISO(), date, by: _.who(), kind: 'move', before, after, reason: d.reason }] }));
    _.audit('update', 'asset', id, `Chuyển ${a.code}: ${(Q.building(before.buildingId) || {}).code} ${before.roomId ? Q.roomCode(before.roomId) : before.position} → ${(Q.building(bid) || {}).code} ${after.roomId ? Q.roomCode(after.roomId) : after.position} – ${d.reason}`);
    _.done(); return Q.asset(id);
  };
  /* Thanh lý (GĐ OQ-11): kỳ thanh lý ghi một lần giá trị còn lại vào Báo cáo KD dòng 21; tiền thu thanh lý chỉ ghi nhận (GĐ-P3 O4) */
  const disposeErrors = (a, d, date) => {
    const errs = {}, period = F.period(date);
    if (a.ownership !== 'company') errs.reason = 'Chỉ thanh lý tài sản công ty – tài sản chủ nhà trả lại khi kết thúc HĐ (UI-04)';
    if (a.status !== 'active') errs.reason = 'Tài sản đã ' + AS.STATUS[a.status].toLowerCase();
    if (!String(d.reason || '').trim()) errs.reason = errs.reason || 'Nhập lý do thanh lý';
    if (a.depStart && period < a.depStart.slice(0, 7)) errs.date = 'Ngày thanh lý trước ngày bắt đầu khấu hao';
    if (Number(d.proceeds) < 0) errs.proceeds = 'Tiền thu không âm';
    return errs;
  };
  /* Ghi thanh lý một tài sản đã kiểm tra; trả giá trị còn lại ghi một lần */
  const disposeOne = (a, d, date) => {
    const period = F.period(date), remain = a.cost > 0 ? DP.nbv(a, DT.prevPeriod(period)) : 0;
    const disposal = { date, period, reason: d.reason, proceeds: Number(d.proceeds) || 0, remaining: remain, by: _.who(), at: F.nowISO() };
    S.update('assets', a.id, { status: 'disposed', disposal, history: [...(a.history || []), { at: F.nowISO(), date, by: _.who(), kind: 'dispose', before: { status: a.status }, after: { status: 'disposed' }, reason: d.reason }] });
    return disposal;
  };
  X.disposeAsset = (id, d) => {
    _.need('assets.dispose'); _.needMs('3', 'Thanh lý tài sản (UI-34)');
    const a = Q.asset(id); if (!a) throw new Error('Không tìm thấy tài sản');
    const date = d.date || F.today(), errs = disposeErrors(a, d, date);
    if (Object.keys(errs).length) fail(errs);
    _.guardPeriod(F.period(date), 'thanh lý tài sản');
    const disposal = disposeOne(a, d, date);
    _.audit('update', 'asset', id, `Thanh lý ${a.code} kỳ ${F.periodShort(disposal.period)}: ghi một lần giá trị còn lại ${F.vnd(disposal.remaining)}${disposal.proceeds ? ' · tiền thu ' + F.vnd(disposal.proceeds) : ''}`);
    _.done(); return Q.asset(id);
  };
  /* Trả nhà trước hạn (GĐ OQ-11): thanh lý một lần mọi tài sản công ty còn dùng của tòa; tài sản chủ nhà trả lại theo phụ lục bàn giao, không ghi giá trị */
  X.disposeBuildingAssets = (bid, d = {}) => {
    _.need('assets.dispose'); _.needMs('3', 'Trả nhà – thanh lý tài sản (UI-34)');
    const b = Q.building(bid); if (!b || !TH.auth.inScope(bid)) throw new Error('Tòa không tồn tại hoặc ngoài phạm vi');
    const date = d.date || F.today(), list = S.where('assets', a => a.buildingId === bid && a.ownership === 'company' && a.status === 'active');
    if (!String(d.reason || '').trim()) fail({ reason: 'Nhập lý do (trả nhà trước hạn, chấm dứt HĐ chủ nhà…)' });
    if (!list.length) fail({ reason: 'Tòa không còn tài sản công ty đang dùng' });
    const bad = list.map(a => [a, disposeErrors(a, { reason: d.reason }, date)]).filter(([, e]) => Object.keys(e).length);
    if (bad.length) fail({ date: bad.map(([a, e]) => a.code + ': ' + Object.values(e)[0]).join('; ') });
    _.guardPeriod(F.period(date), 'thanh lý tài sản khi trả nhà');
    let total = 0;
    S.atomic(() => { list.forEach(a => { total += disposeOne(a, { reason: d.reason }, date).remaining; }); });
    _.audit('update', 'building', bid, `Trả nhà ${b.code} – thanh lý ${list.length} tài sản công ty kỳ ${F.periodShort(F.period(date))}: ghi một lần giá trị còn lại ${F.vnd(total)} – ${d.reason}`);
    _.done(); return { count: list.length, remaining: total };
  };
  /* Hủy chứng từ mua (UI-15): chưa khấu hao kỳ khóa → tài sản 'void'; đã khấu hao kỳ khóa → chặn, dùng Thanh lý */
  X._voidAssetOfExpense = (expenseId) => {
    const a = S.one('assets', x => x.expenseId === expenseId && x.status !== 'void'); if (!a) return;
    if (a.status === 'disposed' || Q.assetBookedInClosed(a)) throw new Error(`Thiết bị ${a.code} đã khấu hao trong kỳ đã khóa – không hủy chứng từ mua, dùng Thanh lý ở UI-34`);
    S.update('assets', a.id, { status: 'void', history: [...(a.history || []), { at: F.nowISO(), date: F.today(), by: _.who(), kind: 'void', reason: 'Hủy chứng từ mua ' + expenseId }] });
  };
})(window.TH);
