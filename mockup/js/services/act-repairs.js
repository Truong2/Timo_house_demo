/* Sổ sửa chữa & ứng chi vật tư (UI-47; F16; GĐ OQ-22, OQ-23). Kỹ thuật nhập việc; kế toán xác nhận, chốt kỳ sổ và quyết toán ứng chi.
   Người chịu: công ty → chi phí "Sửa chữa, thay thế, bảo trì" (dòng 41) theo tòa khi chốt kỳ sổ (vật tư) và qua bảng lương (tiền công, OQ-22);
   khách → ĐỀ XUẤT dòng trừ trên phiếu hoàn cọc nháp, chỉ áp khi kế toán xác nhận (OQ-23); chủ nhà → bù trừ vào kỳ trả chủ nhà (UI-05).
   Kỳ chạy song song Excel (08/2026) chỉ để đối chiếu: không ghi lại chi phí / lương đã có trong số Excel. */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, RP = TH.calc.repairs, A = TH.auth;
  const fail = (fields, msg = 'Dữ liệu chưa hợp lệ') => { const e = new Error(msg); e.fields = fields; throw e; };
  const startDay = (date) => Q.param('repairCycleStartDay', date) || 26;
  const parallel = (period) => ((S.get('periods', period) || {}).source === 'excel_parallel');
  Q.repairPeriodOf = (date) => RP.periodOf(date, startDay(date));
  Q.repairWindow = (period) => RP.window(period, startDay(TH.calc.dates.periodEnd(period)));
  Q.repairWorkers = () => S.all('employees').filter(e => e.title === 'KỸ THUẬT');
  /* Dòng sổ theo phạm vi: kỹ thuật chỉ thấy việc của mình; vận hành / trưởng phòng theo tòa được giao */
  Q.repairsScoped = (arr) => { const role = A.role(); if (role === 'kythuat') return arr.filter(r => r.workerId === S.session.employeeId); const sc = A.buildingScope(); return sc ? arr.filter(r => r.buildingId && sc.has(r.buildingId)) : arr; };
  /* Dòng thuộc kỳ sổ: ngày trong 26 → 25, hoặc ghi vào kỳ này có lý do (periodOverride) */
  Q.repairInPeriod = (r, period, sd) => !!r.periodOverride || RP.periodOf(r.date, sd || startDay(TH.calc.dates.periodEnd(period))) === period;
  Q.repairLedger = (period, { workerId, mode = 'web' } = {}) => {
    const rows = S.where('repairLogs', r => r.period === period && (!workerId || r.workerId === workerId) && r.status !== 'void');
    const sd = startDay(TH.calc.dates.periodEnd(period));
    const inP = (r) => Q.repairInPeriod(r, period, sd);
    // D15: tổng (lương thợ, quyết toán, UI-44) chỉ tính dòng đã xác nhận; dòng nháp hiện riêng "chưa tính"
    const conf = rows.filter(r => r.status === 'confirmed'), dr = rows.filter(r => r.status === 'draft' && (mode === 'excel' || inP(r)));
    return { rows: mode === 'excel' ? rows : rows.filter(inP), outside: rows.filter(r => !inP(r)), totals: RP.totals(conf, period, mode, sd),
      drafts: { count: dr.length, labor: dr.reduce((t, r) => t + (r.labor || 0), 0), material: dr.reduce((t, r) => t + (r.material || 0), 0) } };
  };
  /* Lương thợ + quyết toán ứng chi của kỳ sổ */
  Q.repairSettlement = (workerId, period, mode = 'web') => {
    const e = Q.emp(workerId) || {}; const pay = e.repairPay || { base: e.baseSalary || 0, seniority: 0, lunch: (e.allowances || {}).lunch || 0 };
    const t = Q.repairLedger(period, { workerId, mode }).totals;
    const advance = S.where('repairAdvances', a => a.workerId === workerId && a.period === period).reduce((s, a) => s + a.amount, 0);
    return { worker: e, period, mode, labor: t.labor, material: t.material, count: t.count, outside: t.outside, base: pay.base, seniority: pay.seniority, lunch: pay.lunch,
      pay: RP.workerPay({ base: pay.base, seniority: pay.seniority, labor: t.labor, lunch: pay.lunch }), advance, diff: RP.settlement(t.material, advance) };
  };
  /* Tiền công theo sổ đã xác nhận → lương thợ + chi phí dòng 41 theo tòa (qua bảng lương). Kỳ song song Excel: không lấy (đã có trong số Excel);
     kỳ đã nhập tay tiền công cho thợ đó: giữ nhập tay (không cộng hai lần). */
  /* Theo người chịu (A2, [GĐ]): thợ nhận đủ tiền công mọi việc; chi phí dòng 41 = việc công ty chịu + việc khách chịu (công ty ứng trước, khoản trừ cọc / thu khác
     là doanh thu thu hồi); việc chủ nhà chịu đã bù trừ đủ vào kỳ trả chủ nhà nên không ghi chi phí (bảng lương lọc bearer 'owner'). */
  X.repairLaborCosts = (period) => {
    if (parallel(period)) return [];
    const manual = new Set(S.where('payrollManual', x => x.period === period && x.kind === 'repair_labor').map(x => x.employeeId));
    const by = {};
    S.where('repairLogs', r => r.period === period && r.status === 'confirmed' && r.labor > 0 && !manual.has(r.workerId) && r.buildingId).forEach(r => { const k = r.workerId + '|' + r.buildingId + '|' + (r.bearer || 'company'); by[k] = (by[k] || 0) + r.labor; });
    return Object.entries(by).map(([k, amount]) => { const [employeeId, buildingId, bearer] = k.split('|'); return { buildingId, line: 'repair', amount, kind: 'repair_labor', employeeId, bearer, note: 'Theo sổ sửa chữa kỳ ' + F.periodShort(period) + (bearer === 'owner' ? ' (chủ nhà chịu – đã bù trừ)' : bearer === 'tenant' ? ' (khách chịu – thu hồi qua cọc/hóa đơn)' : ''), source: 'ledger' }; });
  };
  /* Bảng lương kỳ đã chốt → tiền công mới không vào lương được nữa (A3) */
  const payrollClosed = (period) => !!S.one('payrollRuns', r => r.period === period && r.status === 'closed');
  const PAY_CLOSED = (period) => `Bảng lương kỳ ${F.periodShort(period)} đã chốt – tiền công không vào lương được nữa; ghi vào kỳ sổ sau hoặc dùng "Điều chỉnh sau khóa"`;
  /* E2: thợ đã quyết toán ứng chi của kỳ → không đổi vật tư / số ứng của kỳ đó nữa (quyết toán đã chi / thu theo số cũ) */
  Q.repairSettlementDoc = (workerId, period) => S.one('repairSettlements', x => x.workerId === workerId && x.period === period && x.status !== 'void');
  const settled = (workerId, period) => !!Q.repairSettlementDoc(workerId, period);
  const SETTLED = (workerId, period) => `${(Q.emp(workerId) || {}).name || 'Thợ'} đã quyết toán ứng chi kỳ sổ ${F.periodShort(period)} – ghi vật tư vào kỳ sau`;

  X.addRepair = (d) => { _.needMs('2', 'Sổ sửa chữa (UI-47)');
    _.need('repairs.enter');
    const self = A.role() === 'kythuat';
    const workerId = self ? S.session.employeeId : d.workerId;
    const errs = {};
    if (!workerId || !Q.emp(workerId)) errs.workerId = 'Chọn thợ';
    else if (Q.emp(workerId).title !== 'KỸ THUẬT') errs.workerId = 'Chỉ ghi sổ cho nhân viên kỹ thuật (thợ sửa chữa)';
    if (!d.date) errs.date = 'Nhập ngày';
    const b = Q.building(d.buildingId); if (!b) errs.buildingId = 'Chọn tòa';
    if (d.roomId && (!Q.room(d.roomId) || Q.room(d.roomId).buildingId !== d.buildingId)) errs.roomId = 'Phòng không thuộc tòa';
    if (!String(d.desc || '').trim()) errs.desc = 'Nhập nội dung';
    if (!RP.JOB_TYPES.some(x => x[0] === d.jobType)) errs.jobType = 'Chọn loại việc';
    const labor = Number(d.labor) || 0, material = Number(d.material) || 0;
    if (labor < 0 || material < 0 || !(labor + material > 0)) errs.labor = 'Nhập tiền công và/hoặc vật tư';
    if (d.bearer && !RP.BEARERS.some(x => x[0] === d.bearer)) errs.bearer = 'Người chịu không hợp lệ';
    // E2: trạng thái thu chỉ cho việc khách chịu; lượt thuê phải thuộc đúng phòng; ảnh việc sửa chỉ nhận ảnh / PDF
    if (d.collectStatus && !RP.COLLECT.some(x => x[0] === d.collectStatus)) errs.collectStatus = 'Trạng thái thu không hợp lệ';
    else if (d.collectStatus && (d.bearer || 'company') !== 'tenant') errs.collectStatus = 'Trạng thái thu chỉ dùng cho việc khách chịu';
    const stay = d.stayId ? Q.stay(d.stayId) : null;
    if (d.stayId && (!stay || !d.roomId || stay.roomId !== d.roomId)) errs.stayId = 'Lượt thuê không thuộc phòng đã chọn';
    const photos = (d.photos || []).map(f => ({ name: String(f.name || '').trim(), size: Number(f.size) || 0 }));
    if (photos.some(f => !/\.(jpe?g|png|heic|pdf)$/i.test(f.name))) errs.photos = 'Ảnh việc sửa: chỉ nhận JPG, PNG, HEIC hoặc PDF';
    // Phase 3 (đặc tả dòng 557): dòng sổ có thể gắn lịch bảo dưỡng UI-35 cùng tòa
    const mtask = d.maintenanceTaskId ? S.get('maintenanceTasks', d.maintenanceTaskId) : null;
    if (d.maintenanceTaskId && (!mtask || mtask.buildingId !== d.buildingId)) errs.maintenanceTaskId = 'Lịch bảo dưỡng không thuộc tòa đã chọn';
    const period = d.period || (d.date ? Q.repairPeriodOf(d.date) : null);
    if (!errs.period && period && material > 0 && settled(workerId, period)) errs.period = SETTLED(workerId, period);
    // ngày ngoài kỳ sổ đang ghi (K-6): phải chọn đúng kỳ hoặc ghi lý do
    if (d.date && period && Q.repairPeriodOf(d.date) !== period && !String(d.periodReason || '').trim()) errs.period = `Ngày ${F.date(d.date)} thuộc kỳ sổ ${F.periodShort(Q.repairPeriodOf(d.date))} – chọn đúng kỳ hoặc ghi lý do`;
    if (!errs.period && period && parallel(period)) errs.period = `Kỳ sổ ${F.periodShort(period)} chạy song song Excel – chỉ để đối chiếu, không ghi thêm dòng web`;
    if (!errs.period && period && labor > 0 && payrollClosed(period)) errs.period = PAY_CLOSED(period);
    if (Object.keys(errs).length) fail(errs);
    _.guardPeriod(period, 'ghi sổ sửa chữa');
    const r = S.add('repairLogs', { code: S.nextCode('repairLogs', 'SC-' + period.slice(2, 4) + period.slice(5, 7) + '-'), period, date: d.date, buildingId: b.id, buildingCode: b.code, roomId: d.roomId || null, roomCode: d.roomId ? Q.roomCode(d.roomId).replace(b.code, '') : null,
      desc: d.desc.trim(), jobType: d.jobType, workerId, labor, material, paintFrom: d.paintFrom || null, reason: d.reason || 'other', bearer: d.bearer || 'company', collectStatus: d.collectStatus || null,
      stayId: d.stayId || null, maintenanceTaskId: mtask ? mtask.id : null, photos: photos.map(f => Object.assign(f, { at: F.nowISO(), by: _.who() })), note: [d.note, d.periodReason ? 'Ngoài kỳ: ' + d.periodReason : ''].filter(Boolean).join(' · '), periodOverride: !!(d.date && Q.repairPeriodOf(d.date) !== period), status: 'draft', source: 'web', enteredBy: _.who() });
    if (mtask) S.update('maintenanceTasks', mtask.id, { repairLogIds: [...(mtask.repairLogIds || []), r.id] });
    _.audit('create', 'repair', r.id, `Sổ sửa chữa ${r.code}: ${b.code} ${d.desc} – công ${F.vnd(labor)}, vật tư ${F.vnd(material)}`); _.done(); return r;
  };
  X.voidRepair = (id, reason) => { _.needMs('2', 'Sổ sửa chữa (UI-47)'); _.need('repairs.enter');
    const r = S.get('repairLogs', id); if (!r) throw new Error('Không tìm thấy dòng sổ');
    if (r.status !== 'draft') throw new Error('Chỉ hủy dòng nháp – dòng đã xác nhận dùng "Điều chỉnh"');
    if (A.role() === 'kythuat' ? r.workerId !== S.session.employeeId : !A.can('repairs.confirm')) throw new Error('Bạn không có quyền hủy dòng này');
    if (!String(reason || '').trim()) fail({ reason: 'Nhập lý do' });
    _.guardPeriod(r.period, 'hủy dòng sổ sửa chữa');
    S.update('repairLogs', id, { status: 'void', note: [r.note, 'Hủy: ' + reason].filter(Boolean).join(' · ') }); _.audit('void', 'repair', id, 'Hủy dòng sổ ' + r.code); _.done();
  };
  /* Xác nhận (kế toán): chủ nhà chịu → bù trừ kỳ trả chủ nhà; khách chịu → đề xuất trừ cọc (chưa áp) */
  X.confirmRepairs = (ids) => { _.needMs('2', 'Sổ sửa chữa (UI-47)');
    _.need('repairs.confirm');
    const rows = ids.map(id => S.get('repairLogs', id)).filter(r => r && r.status === 'draft');
    if (!rows.length) throw new Error('Chọn dòng nháp cần xác nhận');
    // Hai pha (B8): kiểm tra hết mọi dòng (kỳ, bảng lương đã chốt, kỳ trả chủ nhà đủ để bù trừ) rồi mới ghi – không áp dở dang
    const room = {}; const plan = rows.map(r => {
      _.guardPeriod(r.period, 'xác nhận sổ sửa chữa');
      if (r.labor > 0 && payrollClosed(r.period)) throw new Error(r.code + ': ' + PAY_CLOSED(r.period));
      if (r.bearer !== 'owner') return { r };
      const oc = S.one('ownerContracts', c => c.buildingId === r.buildingId && c.status === 'active');
      const need = r.labor + r.material;
      const op = oc && S.where('ownerPayments', o => o.contractId === oc.id && o.amountDue - (o.paid || 0) - (room[o.id] || 0) >= need).sort((a, b) => a.from.localeCompare(b.from))[0];
      if (!op) throw new Error(`Tòa ${r.buildingCode}: không có kỳ trả chủ nhà chưa chi đủ để bù trừ ${r.code}`);
      room[op.id] = (room[op.id] || 0) + need;
      return { r, opId: op.id };
    });
    plan.forEach(({ r, opId }) => {
      const patch = { status: 'confirmed', confirmedBy: _.who(), confirmedAt: F.nowISO() };
      if (opId) {
        const op = S.get('ownerPayments', opId);
        const rec = { repairId: r.id, opId, amount: r.labor + r.material, date: r.date, reason: 'Sửa chữa chủ nhà chịu: ' + r.desc, by: _.who(), at: F.nowISO() };
        S.update('ownerPayments', opId, { paid: (op.paid || 0) + rec.amount, offsets: [...(op.offsets || []), rec] });
        patch.ownerOffset = { opId, amount: rec.amount };
      }
      if (r.bearer === 'tenant') patch.tenantCharge = { status: 'suggested', amount: r.labor + r.material };
      S.update('repairLogs', r.id, patch);
    });
    _.audit('confirm', 'repair', rows[0].id, `Xác nhận ${rows.length} dòng sổ sửa chữa`); _.done();
    return rows.length;
  };
  /* Phiếu hoàn cọc nháp của phòng (để áp đề xuất "khách chi") */
  Q.refundForRepair = (r) => {
    const stays = S.where('stays', s => s.roomId === r.roomId && (s.id === r.stayId || !r.stayId));
    return S.one('refunds', f => stays.some(s => s.id === f.stayId) && ['draft', 'calculated'].includes(f.status)) || null;
  };
  X.applyRepairToRefund = (id) => { _.needMs('2', 'Sổ sửa chữa (UI-47)');
    _.need('repairs.confirm');
    const r = S.get('repairLogs', id); if (!r || !r.tenantCharge || r.tenantCharge.status !== 'suggested') throw new Error('Không có đề xuất trừ cọc cho dòng này');
    const rf = Q.refundForRepair(r); if (!rf) throw new Error('Phòng ' + (r.roomCode || '') + ' chưa có phiếu hoàn cọc nháp');
    X.updateRefund(rf.id, { deductions: [...rf.deductions, { kind: 'repair', qty: 1, unit: r.tenantCharge.amount, note: 'Sổ sửa chữa ' + r.code + ': ' + r.desc }] });
    S.update('repairLogs', id, { tenantCharge: Object.assign({}, r.tenantCharge, { status: 'applied', refundId: rf.id, at: F.nowISO(), by: _.who() }) });
    _.audit('apply', 'repair', id, `Áp khách chi ${r.code} vào phiếu hoàn ${rf.code}`); _.done(); return rf;
  };
  /* Khách chịu, khách còn ở → đề xuất thành dòng 13 "Thu khác" trên hóa đơn nháp của lượt thuê (OQ-23; áp khi kế toán xác nhận) */
  Q.draftInvoiceForRepair = (r) => { const stays = S.where('stays', s => s.roomId === r.roomId && (s.id === r.stayId || !r.stayId) && s.status === 'active'); return S.where('invoices', i => stays.some(s => s.id === i.stayId) && i.lifecycle === 'draft').sort((a, b) => b.period.localeCompare(a.period))[0] || null; };
  X.applyRepairToInvoice = (id) => { _.needMs('2', 'Sổ sửa chữa (UI-47)');
    _.need('repairs.confirm');
    const r = S.get('repairLogs', id); if (!r || !r.tenantCharge || r.tenantCharge.status !== 'suggested') throw new Error('Không có đề xuất thu khách cho dòng này');
    const inv = Q.draftInvoiceForRepair(r); if (!inv) throw new Error('Phòng ' + (r.roomCode || '') + ' chưa có hóa đơn nháp của khách đang ở');
    const cur = TH.calc.billing.expand(inv.lines).find(l => l.no === 13) || {};
    X.updateDraftLines(inv.id, [{ no: 13, qty: 1, unit: (Number(cur.amount) || 0) + r.tenantCharge.amount, reason: 'Sổ sửa chữa ' + r.code + ' – khách chịu: ' + r.desc }], 'Sổ sửa chữa ' + r.code + ' – khách chịu');
    S.update('repairLogs', id, { tenantCharge: Object.assign({}, r.tenantCharge, { status: 'applied', invoiceId: inv.id, at: F.nowISO(), by: _.who() }) });
    _.audit('apply', 'repair', id, `Áp khách chịu ${r.code} vào hóa đơn nháp ${inv.code || inv.id} (Thu khác)`); _.done(); return inv;
  };
  /* Chốt kỳ sổ: vật tư công ty / khách chịu → chi phí dòng 41 theo tòa (tiền công đi qua bảng lương); chủ nhà chịu đã bù trừ kỳ trả chủ nhà */
  X.postRepairPeriod = (period) => { _.needMs('2', 'Sổ sửa chữa (UI-47)');
    _.need('repairs.confirm');
    _.guardPeriod(period, 'chốt sổ sửa chữa');
    if (parallel(period)) throw new Error('Kỳ ' + F.periodShort(period) + ' chạy song song Excel – chi phí sửa chữa đã có trong số Excel, sổ chỉ để đối chiếu');
    if (S.one('repairLogs', r => r.period === period && r.status === 'draft')) throw new Error('Còn dòng nháp chưa xác nhận');
    const by = {};
    S.where('repairLogs', r => r.period === period && r.status === 'confirmed' && ['company', 'tenant'].includes(r.bearer || 'company') && r.material > 0 && !r.posted).forEach(r => { (by[r.buildingId] = by[r.buildingId] || []).push(r); });
    const pEnd = TH.calc.dates.periodEnd(period);
    const exps = Object.entries(by).map(([bid, rs]) => {
      const e = X.addExpense({ date: pEnd, period, category: 'repair', scope: 'building', buildingId: bid, amount: rs.reduce((t, r) => t + r.material, 0), source: 'repairLedger', refId: 'rp_' + period, note: `Vật tư sửa chữa kỳ sổ ${F.periodShort(period)} (${rs.length} việc)` }, true);
      rs.forEach(r => S.update('repairLogs', r.id, { posted: e.id }));
      return e;
    });
    _.audit('post', 'repair', period, `Chốt sổ sửa chữa kỳ ${F.periodShort(period)}: ${exps.length} chứng từ vật tư`); _.done(); return exps;
  };
  /* B9: điều chỉnh dòng đã xác nhận (tiền công / vật tư / người chịu) khi kỳ sổ còn mở, lương chưa chốt, vật tư chưa chốt kỳ sổ.
     Lưu lịch sử; bù trừ chủ nhà và đề xuất trừ cọc đi theo số mới. Sau các mốc đó: ghi dòng mới ở kỳ sau hoặc "Điều chỉnh sau khóa". */
  X.adjustRepair = (id, d) => { _.needMs('2', 'Sổ sửa chữa (UI-47)');
    _.need('repairs.confirm');
    const r = S.get('repairLogs', id); if (!r || r.status !== 'confirmed') throw new Error('Chỉ điều chỉnh dòng đã xác nhận');
    if (!String(d.reason || '').trim()) fail({ reason: 'Nhập lý do điều chỉnh' });
    const labor = d.labor != null && d.labor !== '' ? Number(d.labor) : r.labor, material = d.material != null && d.material !== '' ? Number(d.material) : r.material;
    const bearer = d.bearer || r.bearer || 'company'; const oldBearer = r.bearer || 'company';
    if (!RP.BEARERS.some(x => x[0] === bearer)) fail({ bearer: 'Người chịu không hợp lệ' });
    if (labor < 0 || material < 0 || !(labor + material > 0)) fail({ labor: 'Tiền công / vật tư không âm, tổng > 0' });
    const collectStatus = bearer !== 'tenant' ? null : d.collectStatus !== undefined ? (d.collectStatus || null) : (r.collectStatus || null);
    if (collectStatus && !RP.COLLECT.some(x => x[0] === collectStatus)) fail({ collectStatus: 'Trạng thái thu không hợp lệ' });
    _.guardPeriod(r.period, 'điều chỉnh sổ sửa chữa');
    if (material !== r.material && settled(r.workerId, r.period)) throw new Error(SETTLED(r.workerId, r.period));
    if (labor !== r.labor && payrollClosed(r.period)) throw new Error(PAY_CLOSED(r.period));
    // người chịu quyết định tiền công có vào chi phí dòng 41 qua bảng lương hay không → sau chốt lương không đổi được nữa
    if (bearer !== oldBearer && (r.labor > 0 || labor > 0) && payrollClosed(r.period)) throw new Error(`Bảng lương kỳ ${F.periodShort(r.period)} đã chốt – không đổi người chịu của dòng có tiền công; ghi dòng mới ở kỳ sau hoặc dùng "Điều chỉnh sau khóa"`);
    if (r.posted && (material !== r.material || bearer !== r.bearer)) throw new Error('Vật tư đã chốt kỳ sổ (chứng từ chi) – ghi dòng mới ở kỳ sau hoặc "Điều chỉnh sau khóa"');
    if (r.tenantCharge && r.tenantCharge.status === 'applied') throw new Error('Đã áp trừ vào phiếu hoàn – sửa phiếu hoàn trước');
    const patch = { labor, material, bearer, collectStatus, history: [...(r.history || []), { labor: r.labor, material: r.material, bearer: r.bearer, collectStatus: r.collectStatus || null, reason: d.reason, by: _.who(), at: F.nowISO() }] };
    // bù trừ chủ nhà (D2): chọn kỳ trả chủ nhà đích TRƯỚC (tính cả phần bù trừ cũ sẽ được gỡ), không có thì báo lỗi khi chưa ghi gì
    let target = null;
    if (bearer === 'owner') {
      const oc = S.one('ownerContracts', c => c.buildingId === r.buildingId && c.status === 'active');
      const free = (o) => o.amountDue - (o.paid || 0) + (r.ownerOffset && r.ownerOffset.opId === o.id ? r.ownerOffset.amount : 0);
      target = oc && S.where('ownerPayments', o => o.contractId === oc.id && free(o) >= labor + material).sort((a, b) => a.from.localeCompare(b.from))[0];
      if (!target) throw new Error(`Tòa ${r.buildingCode}: không có kỳ trả chủ nhà chưa chi đủ để bù trừ`);
    }
    if (r.ownerOffset) { const op = S.get('ownerPayments', r.ownerOffset.opId); if (op) S.update('ownerPayments', op.id, { paid: Math.max(0, (op.paid || 0) - r.ownerOffset.amount), offsets: (op.offsets || []).filter(o => o.repairId !== r.id) }); patch.ownerOffset = null; }
    if (target) {
      const op = S.get('ownerPayments', target.id);
      S.update('ownerPayments', op.id, { paid: (op.paid || 0) + labor + material, offsets: [...(op.offsets || []), { repairId: r.id, opId: op.id, amount: labor + material, date: r.date, reason: 'Sửa chữa chủ nhà chịu (điều chỉnh): ' + r.desc, by: _.who(), at: F.nowISO() }] });
      patch.ownerOffset = { opId: op.id, amount: labor + material };
    }
    patch.tenantCharge = bearer === 'tenant' ? { status: 'suggested', amount: labor + material } : null;
    S.update('repairLogs', id, patch);
    _.audit('adjust', 'repair', id, `Điều chỉnh ${r.code}: công ${F.vnd(r.labor)} → ${F.vnd(labor)}, vật tư ${F.vnd(r.material)} → ${F.vnd(material)} – ${d.reason}`); _.done();
    return S.get('repairLogs', id);
  };
  X.setRepairAdvance = (workerId, period, amount, note) => { _.needMs('2', 'Sổ sửa chữa (UI-47)');
    _.need('repairs.confirm');
    _.guardPeriod(period, 'ghi ứng chi');
    if (!(Number(amount) > 0)) fail({ amount: 'Nhập số ứng' });
    if (settled(workerId, period)) throw new Error(SETTLED(workerId, period).replace('ghi vật tư', 'ghi ứng chi'));
    const a = S.add('repairAdvances', { workerId, period, amount: Number(amount), date: F.today(), note: note || '' });
    _.audit('create', 'repairAdvance', a.id, `Ứng chi vật tư ${(Q.emp(workerId) || {}).name} kỳ ${F.periodShort(period)}: ${F.vnd(amount)}`); _.done(); return a;
  };
  /* E2 [GĐ-E2]: quyết toán ứng chi = chứng từ quỹ (phiếu chi bổ sung cho thợ / phiếu thu thợ hoàn ứng), KHÔNG ghi chi phí mới:
     vật tư đã vào chi phí dòng 41 khi chốt kỳ sổ, số ứng chỉ là tiền tạm ứng. Mỗi thợ × kỳ sổ một lần; sau quyết toán không đổi vật tư / số ứng của kỳ. */
  X.settleRepairAdvance = (workerId, period, d = {}) => { _.needMs('2', 'Sổ sửa chữa (UI-47)');
    _.need('repairs.confirm');
    _.guardPeriod(period, 'quyết toán ứng chi');
    if (parallel(period)) throw new Error('Kỳ ' + F.periodShort(period) + ' chạy song song Excel – quyết toán ứng chi đã làm trên file, sổ chỉ để đối chiếu');
    if (!Q.emp(workerId)) throw new Error('Không tìm thấy thợ');
    if (settled(workerId, period)) throw new Error(`Đã quyết toán ứng chi kỳ ${F.periodShort(period)} (${Q.repairSettlementDoc(workerId, period).code})`);
    if (S.one('repairLogs', r => r.workerId === workerId && r.period === period && r.status === 'draft')) throw new Error('Còn dòng nháp của thợ trong kỳ – xác nhận hoặc hủy trước khi quyết toán');
    const st = Q.repairSettlement(workerId, period, 'web');
    if (!st.advance && !st.material) throw new Error('Thợ không có ứng chi / vật tư trong kỳ');
    const date = d.date || F.today();
    if (!['cash', 'bank'].includes(d.method || 'cash')) fail({ method: 'Hình thức không hợp lệ' });
    const code = S.nextCode('repairSettlements', 'QT-' + period.slice(2, 4) + period.slice(5, 7) + '-');
    const doc = S.add('repairSettlements', { code, workerId, period, date, method: d.method || 'cash', advance: st.advance, material: st.material, diff: st.diff,
      kind: st.diff > 0 ? 'pay' : st.diff < 0 ? 'refund' : 'zero', note: d.note || '', status: 'done', by: _.who() });
    _.audit('settle', 'repairSettlement', doc.id, `Quyết toán ứng chi ${st.worker.name} kỳ ${F.periodShort(period)}: vật tư ${F.vnd(st.material)} − ứng ${F.vnd(st.advance)} = ` + (st.diff > 0 ? 'công ty trả thêm ' + F.vnd(st.diff) : st.diff < 0 ? 'thợ trả lại ' + F.vnd(-st.diff) : '0')); _.done();
    return doc;
  };
  /* E2: tồn sơn theo điểm (đặc tả dòng 562 – danh mục vật tư đơn giản, không phải phân hệ kho) = tồn đầu từ SRC-16 Sheet4 + nhập − xuất */
  Q.paintStock = () => {
    const base = ((TH.data.p2 && TH.data.p2.repairs && TH.data.p2.repairs.paint) || { stock: [] }).stock;
    const m = {}; base.forEach(x => { m[x.point] = (m[x.point] || 0) + (Number(x.qty) || 0); });
    S.all('paintMoves').forEach(x => { m[x.point] = (m[x.point] || 0) + (x.kind === 'out' ? -x.qty : x.qty); });
    return Object.entries(m).map(([point, qty]) => ({ point, qty })).sort((a, b) => a.point.localeCompare(b.point));
  };
  X.addPaintMove = (d) => { _.needMs('2', 'Sổ sửa chữa (UI-47)');
    _.need('repairs.confirm');
    const point = String(d.point || '').trim().toUpperCase(); const qty = Number(d.qty); const kind = d.kind || 'in';
    const errs = {};
    if (!/^[A-Z]{1,3}\d{0,3}[A-Z]?$/.test(point)) errs.point = 'Nhập mã điểm (vd T20, T42, VP)';
    if (!['in', 'out'].includes(kind)) errs.kind = 'Chọn nhập / xuất';
    if (!(qty > 0) || Math.abs(Math.round(qty * 10) - qty * 10) > 1e-9) errs.qty = 'Số thùng > 0 (tối đa 1 chữ số lẻ)';
    if (!d.date) errs.date = 'Nhập ngày';
    const room = d.roomCode ? S.one('rooms', r => r.code === String(d.roomCode).trim().toUpperCase()) : null;
    if (d.roomCode && !room) errs.roomCode = 'Không tìm thấy phòng (nhập mã đầy đủ, vd 203T20)';
    if (!errs.point && kind === 'out' && qty > ((Q.paintStock().find(x => x.point === point) || {}).qty || 0)) errs.qty = 'Vượt tồn tại điểm ' + point;
    if (Object.keys(errs).length) fail(errs);
    const x = S.add('paintMoves', { point, qty, kind, date: d.date, roomId: room ? room.id : null, note: d.note || '', by: _.who() });
    _.audit(kind === 'in' ? 'create' : 'use', 'paint', x.id, `${kind === 'in' ? 'Nhập' : 'Xuất'} ${qty} thùng sơn tại ${point}${room ? ' cho phòng ' + room.code : ''}`); _.done(); return x;
  };
})(window.TH);
