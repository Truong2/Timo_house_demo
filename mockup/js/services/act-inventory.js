/* UI-36: monthly virtual sessions; two different approvers apply catalog proposals atomically. */
(function (TH) {
  const S = TH.store, Q = TH.q, X = TH.actions, _ = X._, F = TH.f, AS = TH.calc.assets;
  const copy = x => JSON.parse(JSON.stringify(x));
  const fail = fields => { const e = new Error('Dữ liệu kiểm kê chưa hợp lệ'); e.fields = fields; throw e; };
  const scope = bid => { if (!Q.building(bid) || !TH.auth.inScope(bid)) throw new Error('Tòa ngoài phạm vi được xem'); };
  const periodCheck = p => { if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(p || '') || p > F.period(F.today())) throw new Error('Phiên kiểm kê tự mở từ ngày 1 của tháng; chưa đến kỳ'); };
  Q.inventorySession = (period, bid) => {
    scope(bid); periodCheck(period);
    const id = 'ivs_' + period + '_' + bid, stored = S.get('inventorySessions', id);
    if (stored) return copy(stored);
    const assets = Q.assets({ building: bid, status: 'active' }).filter(a => a.receivedDate <= TH.calc.dates.periodEnd(period) && (!a.openingPeriod || a.openingPeriod <= period));
    if (!assets.length) return null;
    return { id, period, buildingId: bid, status: 'open', virtual: true, openedAt: period + '-01', lines: assets.map(a => ({ assetId: a.id, bookQty: a.qty, bookCondition: a.condition, actualQty: null, condition: a.condition, note: '', docIds: [], checkedBy: null })), proposals: [], approvals: {} };
  };
  Q.inventorySessions = period => Q.scopedBuildings().map(b => Q.inventorySession(period, b.id)).filter(Boolean);
  Q.inventoryStats = (period, f = {}) => { const rows = Q.inventorySessions(period).filter(s => !f.building || s.buildingId === f.building); return { pending: rows.filter(s => s.status !== 'approved').length, total: rows.length }; };
  Q.inventoryLinesOfAsset = id => S.all('inventorySessions').filter(s => TH.auth.inScope(s.buildingId)).flatMap(s => s.lines.filter(l => l.assetId === id).map(l => Object.assign({ period: s.period }, l)));
  X.enterInventory = (period, bid, lines) => {
    _.need('inventory.enter'); _.needMs('3', 'Kiểm kê tài sản'); scope(bid); periodCheck(period);
    const session = Q.inventorySession(period, bid); if (!session) throw new Error('Tòa chưa có tài sản trong kỳ');
    if (session.status === 'approved') throw new Error('Phiên kiểm kê đã duyệt');
    const errs = {};
    if (!Array.isArray(lines) || lines.length !== session.lines.length || new Set(lines.map(l => l.assetId)).size !== lines.length) errs.lines = 'Nhập đủ và không trùng tài sản của phiên';
    (lines || []).forEach(l => { const book = session.lines.find(x => x.assetId === l.assetId); if (!book || l.actualQty == null || l.actualQty === '' || !Number.isInteger(Number(l.actualQty)) || Number(l.actualQty) < 0 || !AS.CONDITIONS.some(c => c[0] === l.condition)) errs.lines = 'Số thực phải là số nguyên không âm; chọn tình trạng hợp lệ'; });
    (lines || []).forEach(l => { if (!Array.isArray(l.docIds || []) || (l.docIds || []).some(id => { const d = S.get('documents', id); return !d || d.status !== 'current' || d.buildingId !== bid || !Q.canDownloadDoc(d); })) errs.lines = 'Ảnh/chứng từ phải hiện hành và thuộc tòa kiểm kê'; });
    if (Object.keys(errs).length) fail(errs);
    const next = Object.assign({}, session, { virtual: false, status: 'entered', approvals: {}, proposals: [], enteredBy: _.who(), enteredAt: F.nowISO(), lines: lines.map(l => ({ assetId: l.assetId, bookQty: session.lines.find(x => x.assetId === l.assetId).bookQty, bookCondition: session.lines.find(x => x.assetId === l.assetId).bookCondition || Q.asset(l.assetId).condition, actualQty: Number(l.actualQty), condition: l.condition, note: l.note || '', docIds: l.docIds || [], checkedBy: S.session.userId })) });
    if (S.get('inventorySessions', session.id)) S.update('inventorySessions', session.id, next); else S.add('inventorySessions', next);
    _.audit('update', 'inventory', session.id, 'Nhập kết quả kiểm kê ' + Q.building(bid).code + ' ' + period); _.done(); return copy(next);
  };
  const validateProposal = (session, p) => {
    const errs = {}; if (!String(p.reason || '').trim()) errs.reason = 'Bắt buộc lý do sửa danh mục';
    if (!['qty', 'condition', 'location', 'add', 'remove'].includes(p.kind)) errs.kind = 'Loại đề xuất không hợp lệ';
    const a = Q.asset(p.assetId);
    if (p.kind !== 'add' && (!a || a.buildingId !== session.buildingId || a.status !== 'active' || !session.lines.some(l => l.assetId === a.id))) errs.assetId = 'Tài sản không thuộc phiên hoặc không còn sử dụng';
    if (p.kind === 'qty' && (!Number.isInteger(Number(p.to)) || Number(p.to) <= 0)) errs.to = 'SL danh mục là số nguyên dương; số 0 dùng đề xuất loại bỏ';
    if (p.kind === 'condition' && !AS.CONDITIONS.some(c => c[0] === p.to)) errs.to = 'Chọn tình trạng';
    if (p.kind === 'location') { const d = p.to || {}; if (d.buildingId && d.buildingId !== session.buildingId) errs.to = 'Kiểm kê chỉ sửa vị trí trong tòa'; if (d.roomId && (!Q.room(d.roomId) || Q.room(d.roomId).buildingId !== session.buildingId)) errs.to = 'Phòng không thuộc tòa'; }
    if (p.kind === 'add') {
      const d = Object.assign({}, p.to, { buildingId: session.buildingId, cost: 0, source: 'manual' });
      Object.assign(errs, AS.validate(d, { hasEvidence: false }));
      if (p.to && Number(p.to.cost)) errs.cost = 'Kiểm kê không ghi giá trị/chi phí; dùng chứng từ UI-15 hoặc UI-37';
      if (d.roomId && (!Q.room(d.roomId) || Q.room(d.roomId).buildingId !== session.buildingId)) errs.to = 'Phòng không thuộc tòa';
    }
    if (a && a.cost > 0 && ['remove', 'location'].includes(p.kind)) errs.kind = 'Tài sản có giá trị: dùng Chuyển vị trí/Thanh lý UI-34';
    if (Object.keys(errs).length) fail(errs);
    return a;
  };
  X.proposeAssetChange = (id, proposal) => {
    _.need('inventory.enter'); _.needMs('3', 'Đề xuất kiểm kê');
    const s = S.get('inventorySessions', id); if (!s || s.status !== 'entered') throw new Error('Nhập kết quả trước; phiên đã duyệt không sửa'); scope(s.buildingId);
    const a = validateProposal(s, proposal);
    if (s.proposals.some(p => p.assetId === proposal.assetId && p.kind === proposal.kind)) fail({ kind: 'Đã có đề xuất cùng loại cho tài sản này' });
    const from = proposal.kind === 'qty' ? a.qty : proposal.kind === 'condition' ? a.condition : proposal.kind === 'location' ? { buildingId: a.buildingId, roomId: a.roomId, position: a.position } : proposal.kind === 'remove' ? a.status : null;
    const p = Object.assign({}, copy(proposal), { from, id: F.uid('ivp'), by: S.session.userId });
    S.update('inventorySessions', id, { proposals: [...s.proposals, p], approvals: {} });
    _.audit('update', 'inventory', id, 'Đề xuất sửa danh mục: ' + p.reason); _.done(); return copy(p);
  };
  X.approveInventory = (id, role = TH.auth.role()) => {
    _.need('inventory.approve.' + role); _.needMs('3', 'Duyệt kiểm kê');
    if (role !== TH.auth.role() || !['admin', 'ketoan'].includes(role)) throw new Error('Chỉ duyệt bằng vai trò đang đăng nhập');
    const s = S.get('inventorySessions', id); if (!s || s.status !== 'entered') throw new Error('Phiên chưa nhập hoặc đã duyệt'); scope(s.buildingId);
    if (s.approvals[role] || Object.values(s.approvals).some(x => x.userId === S.session.userId)) throw new Error('Hai người khác nhau duyệt; không duyệt hai lần');
    s.proposals.forEach(p => { const a = validateProposal(s, p); const current = p.kind === 'qty' ? a.qty : p.kind === 'condition' ? a.condition : p.kind === 'remove' ? a.status : p.kind === 'location' ? { buildingId: a.buildingId, roomId: a.roomId, position: a.position } : null; if (JSON.stringify(current) !== JSON.stringify(p.from)) throw new Error('Danh mục đã thay đổi; nhập lại kiểm kê trước khi duyệt'); });
    const approvals = Object.assign({}, s.approvals, { [role]: { userId: S.session.userId, by: _.who(), at: F.nowISO() } });
    const done = !!(approvals.admin && approvals.ketoan);
    S.atomic(() => {
      if (done) s.proposals.forEach(p => {
        if (p.kind === 'add') { const a = X._createAsset(Object.assign({}, p.to, { buildingId: s.buildingId, cost: 0, source: 'manual' })); S.update('assets', a.id, { history: [...a.history, { kind: 'inventory', date: F.today(), at: F.nowISO(), by: _.who(), reason: p.reason, sessionId: id }] }); return; }
        const a = Q.asset(p.assetId), patch = p.kind === 'qty' ? { qty: Number(p.to) } : p.kind === 'condition' ? { condition: p.to } : p.kind === 'location' ? { roomId: p.to.roomId || null, position: p.to.position || '' } : { status: 'removed' };
        S.update('assets', a.id, Object.assign({}, patch, { history: [...(a.history || []), { kind: 'inventory', date: F.today(), at: F.nowISO(), by: _.who(), before: p.from, after: p.to, reason: p.reason, sessionId: id }] }));
      });
      S.update('inventorySessions', id, { approvals, status: done ? 'approved' : 'entered', approvedAt: done ? F.nowISO() : null });
      _.audit('approve', 'inventory', id, done ? 'Đủ hai duyệt – áp đề xuất vào danh mục, không sinh chi phí' : 'Duyệt kiểm kê – chờ vai trò còn lại');
    }); _.done(); return done;
  };
})(window.TH);
