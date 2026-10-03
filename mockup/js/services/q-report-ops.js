/* Báo cáo vận hành & kinh doanh Phase 2 (UI-42 chi phí, UI-43 âm dương điện nước, UI-44 sửa chữa/vệ sinh, UI-45 phòng vận hành, UI-46 khách & doanh số)
   và danh mục trung tâm báo cáo UI-27 (4 nhóm). Đặc tả §4 dòng 378–512, GĐ OQ-06, OQ-12, OQ-18, OQ-20, OQ-21, OQ-25. */
(function (TH) {
  const S = TH.store, F = TH.f, Q = TH.q, D = TH.calc.dates, CAT = () => TH.data.catalog;
  const QO = {};
  const sum = (arr, f) => arr.reduce((t, x) => t + (typeof f === 'function' ? f(x) : x[f]) , 0);
  const r2 = (x) => Math.round(x * 100) / 100;

  /* ---------- UI-42: chi phí giá vốn / cố định / phát sinh – cùng số với Báo cáo tổng (dòng 20–42) ---------- */
  QO.COST_GROUPS = [{ key: 'gv', label: 'Giá vốn', sub: 'Tiền thuê nhà, thiết bị, giá gốc dịch vụ (dòng 20–27)', sections: ['gv'] }, { key: 'fixed', label: 'Cố định', sub: 'Lương các vị trí, thuê & dịch vụ văn phòng (dòng 29–39)', sections: ['op'] },
    { key: 'var', label: 'Phát sinh', sub: 'Marketing gồm hoa hồng, sửa chữa, chi phí khác (dòng 40–42)', sections: ['sell'] }];
  QO.costs = (period, okB = () => true) => {
    const rep = TH.qr.get(period, 'total');
    const bids = Object.keys(rep.byBuilding).filter(okB);
    const line = (l) => { const byB = {}; bids.forEach(b => { const v = (rep.byBuilding[b] || {})[l.code]; if (v) byB[b] = v; }); return { code: l.code, row: l.row, label: l.label, byB, total: sum(Object.values(byB), v => v) }; };
    const groups = QO.COST_GROUPS.map(g => { const lines = CAT().reportLines.filter(l => g.sections.includes(l.section) && !['gv'].includes(l.code) && l.row < 43).map(line); return Object.assign({}, g, { lines, total: sum(lines, 'total') }); });
    const rev = sum(bids, b => (rep.byBuilding[b] || {}).rev_total || 0);
    return { period, rep, bids, groups, revenue: rev, total: sum(groups, 'total') };
  };

  /* ---------- UI-43: âm dương điện nước ----------
     Chế độ "excel": số theo tòa trích từ file âm dương của khách (SRC-15: điện T6, T7; nước T6).
     Chế độ "web": phải thu = dòng hóa đơn đã phát hành của kỳ; thực thu = phiếu thu phân bổ theo dòng; + điện/nước trừ cọc (phiếu hoàn) + phòng trống (OQ-20, tách dòng);
     ghép dòng theo OQ-21: combo = ½ vệ sinh + ½ máy giặt; máy giặt = ½ điện + ½ nước; thang máy, xe điện 100% điện. K = H + B/2 (+ E với điện); M = K − L.
     Chi L = chứng từ chi phí giá gốc điện/nước của tòa trong kỳ, nếu chưa có thì hóa đơn nhà cung cấp tháng trước (cùng quy ước báo cáo tháng). */
  QO.amDuongExcelPeriods = () => { const A = (TH.data.p2 || {}).amduong || {}; return Object.entries(A).flatMap(([p, o]) => Object.keys(o).map(k => ({ period: p, kind: k }))); };
  QO.amDuong = (period, kind = 'electric', mode = 'web') => {
    if (mode === 'excel') {
      const src = ((TH.data.p2 || {}).amduong || {})[period]; const x = src && src[kind];
      if (!x) return { period, kind, mode, status: 'no_data', rows: [], total: null };
      const rows = x.rows.map(r => Object.assign({}, r, { buildingId: S.get('buildings', 'b_' + r.b) ? 'b_' + r.b : null, flags: [!S.get('buildings', 'b_' + r.b) && 'Mã tòa Excel không có trên web', r.L == null && 'Chưa có hóa đơn chi'].filter(Boolean) }));
      return { period, kind, mode, status: 'ready', sheet: x.sheet, src: x.src, rows, total: x.total };
    }
    const invs = Q.invoicesOf(period).filter(i => i.lifecycle !== 'draft');
    const m = {}; const row = (b) => (m[b] = m[b] || { buildingId: b, b: (Q.building(b) || {}).code, B: 0, C: 0, E: 0, F: 0, H: 0, I: 0, dep: 0, vac: 0, kwh: 0, invoices: [] });
    invs.forEach(i => {
      const L = TH.calc.billing.expand(i.lines), ls = Q.lineState(i), x = row(i.buildingId);
      // OQ-21: combo (dòng 10) → 1/2 máy giặt (B, sau đó 1/2 điện + 1/2 nước); thang máy (7), xe điện (8), máy giặt/sấy (9, cột AN) → 100% điện (E)
      x.C += L[9].amount / 2; x.B += ls[9].paid / 2;
      if (kind === 'electric') { x.kwh += Number(L[2].qty) || 0; x.F += L[6].amount + L[7].amount + L[8].amount; x.E += ls[6].paid + ls[7].paid + ls[8].paid; x.I += L[2].amount + L[11].amount; x.H += ls[2].paid + ls[11].paid; }
      else { x.I += L[3].amount; x.H += ls[3].paid; }
      if ((kind === 'electric' ? L[2].amount + L[11].amount : L[3].amount) > 0) x.invoices.push(i.id);
    });
    // điện / nước trừ vào cọc (phiếu hoàn) – đã thu qua cọc
    S.all('refunds').filter(r => r.status === 'paid' && F.period(r.paidAt || '') === period).forEach(r => { // chỉ phiếu hoàn đã chi (như Báo cáo tổng)
      const v = r.deductions.filter(d => d.kind === (kind === 'electric' ? 'electric' : 'water')).reduce((t, d) => t + (d.amount || 0), 0);
      if (v) { const x = row(r.buildingId); x.dep += v; x.H += v; x.I += v; }
    });
    // Kỳ web: phòng trống là sản lượng riêng, tuyệt đối không cộng vào H/K "thực thu". Chế độ Excel lịch sử giữ nguyên số nguồn.
    const withVac = false;
    S.all('meterReadings').filter(r => r.vacant && r.period === period && r.buildingId).forEach(r => { const v = kind === 'electric' ? r.elAmount || 0 : r.waAmount || 0; if (!v) return; row(r.buildingId).vac += v; });
    const prevP = D.prevPeriod(period);
    Object.values(m).forEach(x => {
      const b = Q.building(x.buildingId) || {};
      const exp = S.all('expenses').filter(e => e.period === period && e.buildingId === x.buildingId && e.reportLine === (kind === 'electric' ? 'cost_el' : 'cost_wa') && e.status !== 'void');
      const v = (b.vendor || {})[kind === 'electric' ? 'electric' : 'water'];
      // E3 [GĐ-E5] (đặc tả dòng 496): tòa trả điện qua chủ nhà → chi = đơn giá trả chủ nhà × kWh trên hóa đơn đã phát hành; chưa có đơn giá → cờ, không lấy hóa đơn EVN
      const vo = kind === 'electric' && b.vendor && b.vendor.electricViaOwner && (!b.vendor.electricViaOwner.from || b.vendor.electricViaOwner.from <= D.periodEnd(period)) ? b.vendor.electricViaOwner : null;
      if (exp.length) { x.L = sum(exp, 'amount'); x.Lsrc = 'Chứng từ chi phí kỳ'; }
      else if (vo) { x.L = vo.unitPrice ? vo.unitPrice * x.kwh : null; x.Lsrc = vo.unitPrice ? `Trả chủ nhà ${F.vnd(vo.unitPrice)}đ/kWh × ${F.num0(x.kwh)} kWh` : null; }
      else { x.L = v && v.bills && v.bills[prevP] != null ? v.bills[prevP] : null; x.Lsrc = x.L != null ? 'Hóa đơn NCC tháng ' + F.periodShort(prevP) : null; }
      x.D = x.C - x.B; x.G = x.F - x.E; x.J = x.I - x.H;
      x.K = x.H + x.B / 2 + (kind === 'electric' ? x.E : 0);
      x.excelLikeK = x.K + x.vac;
      x.M = x.L != null ? x.K - x.L : null;
      x.realM = x.M != null ? x.M - (withVac ? x.vac : 0) : null;
      x.flags = [vo ? (vo.unitPrice ? 'Trả điện qua chủ nhà' : 'Trả điện qua chủ nhà – chưa có đơn giá') : !v && 'Không có mã KH ' + (kind === 'electric' ? 'điện' : 'nước') + ' – có thể trả qua chủ nhà', x.L == null && !(vo && !vo.unitPrice) && 'Chờ hóa đơn chi'].filter(Boolean);
      ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'realM', 'dep', 'vac'].forEach(k => { if (x[k] != null) x[k] = r2(x[k]); });
    });
    const rows = Object.values(m).sort((a, c) => String(a.b).localeCompare(String(c.b), 'vi', { numeric: true }));
    const tot = {}; ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'dep', 'vac'].forEach(k => { tot[k] = r2(sum(rows, k)); });
    const withL = rows.filter(r => r.L != null); tot.L = r2(sum(withL, 'L')); tot.M = r2(sum(withL, 'M')); tot.realM = r2(sum(withL, 'realM'));
    return { period, kind, mode, status: !invs.length ? 'no_data' : withL.length < rows.length ? 'no_cost' : 'ready', rows, total: tot, withVac, vacantSeparated: true, costCoverage: withL.length + '/' + rows.length };
  };
  /* Sản lượng / biến động chi (tab 3 UI-43): chi điện/nước theo hóa đơn nhà cung cấp tháng m so với tháng m−1 */
  QO.costTrend = (kind = 'electric') => {
    const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];
    const k = kind === 'electric' ? 'electric' : 'water';
    return months.map((p, i) => { const v = sum(S.all('buildings'), b => ((((b.vendor || {})[k] || {}).bills || {})[p]) || 0); return { period: p, total: v }; })
      .map((x, i, a) => Object.assign(x, { delta: i ? x.total - a[i - 1].total : null, pct: i && a[i - 1].total ? (x.total - a[i - 1].total) / a[i - 1].total : null }));
  };

  /* ---------- UI-44: chi phí sửa chữa, vệ sinh theo kỳ sổ 26 → 25 ---------- */
  QO.repairs = (period, mode = 'web', by = 'building') => {
    const sc = TH.auth.buildingScope(); // B12: trưởng phòng / vận hành chỉ thấy tòa trong phạm vi
    const L = Q.repairLedger(period, { mode }); const all = L.rows.filter(r => !sc || sc.has(r.buildingId)); const rows = all.filter(r => r.status === 'confirmed'); // D15: dòng nháp chưa tính
    const keyOf = { room: r => (r.buildingCode || '?') + (r.roomCode ? '-' + r.roomCode : ' (chung)'), building: r => r.buildingCode || '?', worker: r => (Q.emp(r.workerId) || {}).name || '?', jobType: r => TH.calc.repairs.label(TH.calc.repairs.JOB_TYPES, r.jobType), reason: r => TH.calc.repairs.label(TH.calc.repairs.REASONS, r.reason), bearer: r => TH.calc.repairs.label(TH.calc.repairs.BEARERS, r.bearer) }[by];
    // E3: giữ khóa gốc để mở đúng phần sổ UI-47 (drill-down) + chứng từ liên quan: phiếu hoàn UI-18 / hóa đơn (khách chịu), chứng từ chi UI-15 (vật tư đã chốt kỳ sổ)
    const idOf = { room: r => ({ building: r.buildingId, room: r.roomId || '' }), building: r => ({ building: r.buildingId }), worker: r => ({ worker: r.workerId }), jobType: r => ({ jobType: r.jobType }), reason: r => ({ reason: r.reason }), bearer: r => ({ bearer: r.bearer || 'company' }) }[by];
    const g = {}; rows.forEach(r => { const k = keyOf(r); const x = g[k] = g[k] || { key: k, buildingId: r.buildingId, ref: idOf(r), jobs: 0, rooms: new Set(), labor: 0, material: 0, refunds: new Set(), invoices: new Set(), expenses: new Set() }; x.jobs++; if (r.roomId || r.roomCode) x.rooms.add(r.buildingCode + '-' + r.roomCode); x.labor += r.labor; x.material += r.material;
      const tc = r.tenantCharge || {}; if (tc.refundId) x.refunds.add(tc.refundId); if (tc.invoiceId) x.invoices.add(tc.invoiceId); if (r.posted && r.posted !== 'excel') x.expenses.add(r.posted); });
    const out = Object.values(g).map(x => { const tot = x.labor + x.material; const nRooms = by === 'building' && x.buildingId ? (Q.roomsByBuilding()[x.buildingId] || []).filter(r => Q.rentable(r)).length : null;
      return Object.assign(x, { rooms: x.rooms.size, total: tot, perRoom: nRooms ? tot / nRooms : null, roomsInBuilding: nRooms, refunds: [...x.refunds], invoices: [...x.invoices], expenses: [...x.expenses] }); }).sort((a, b) => b.total - a.total);
    const clean = rows.filter(r => r.jobType === 'cleaning');
    let salClean = null; try { salClean = TH.qr.get(period, 'total').cols.TOTAL.sal_clean || 0; } catch (e) { salClean = null; }
    return { period, mode, by, rows: out, totals: { jobs: rows.length, labor: sum(rows, 'labor'), material: sum(rows, 'material'), outside: L.outside.length, drafts: all.length - rows.length }, cleaning: { jobs: clean.length, cost: sum(clean, r => r.labor + r.material), salary: salClean } };
  };

  /* ---------- UI-45: báo cáo phòng vận hành ----------
     HS thực tế = cùng công thức bảng lương (OQ-18: T = A − A×B + C; HS = T/K×100, A = thu trong 3 mốc); HS tạm tính = (tiền nhà phải thu + bỏ cọc) / giá niêm yết.
     Lấp đầy = ngày phòng tính tiền / ngày phòng khai thác (bỏ phòng không giá, OQ-06); thời gian trống = trung bình ngày từ ngừng tính tiền khách cũ đến tính tiền khách mới.
     Đóng đúng hạn = đủ trước hết ngày 5 (OQ-12); chia 6–10, 11–15, sau 15; phân khúc theo nghề nghiệp trên hợp đồng. */
  QO.rooms = (period, okB = () => true) => {
    const pEnd = D.periodEnd(period), dim = D.daysInMonth(period), P = TH.calc.payroll;
    const per = S.get('periods', period) || {}; const parallel = per.source === 'excel_parallel';
    const invAll = Q.invoicesOf(period).filter(i => i.lifecycle !== 'draft' && i.kind !== 'deposit_excess');
    const byB = F.by(invAll, 'buildingId');
    const ms = TH.calc.params.milestones(Q.param('milestones', pEnd)).days;
    const asOf = F.today() < pEnd ? F.today() : pEnd; const vacAt = Q.vacancy(asOf);
    const out = S.all('buildings').filter(b => okB(b.id) && b.status !== 'inactive').map(b => {
      const rooms = (Q.roomsByBuilding()[b.id] || []).filter(r => Q.rentable(r, pEnd) && r.price > 0);
      if (!rooms.length) return null;
      let hs = null, hsT = null, hsK = null;
      if (parallel) { const x = S.where('payrollInputs', i => i.period === period && i.buildingId === b.id)[0]; if (x) { const o = P.opsBuilding({ K: x.K, L: x.L, A: x.M + x.N + x.O, Q: x.Q, C: x.S }); hs = o.HS; hsT = o.T; hsK = x.K; } }
      else if (byB[b.id]) { const inp = TH.actions.payrollBuildingInputs(period, b.id); const m = P.milestones({ R5: inp.R5, R10: inp.R10, R15: inp.R15, deduct: inp.deduct }); if (inp.K) { const o = P.opsBuilding({ K: inp.K, L: inp.L, A: m.A, Q: inp.Q, C: inp.C }); hs = o.HS; hsT = o.T; hsK = inp.K; } }
      const invs = byB[b.id] || [];
      const list = sum(rooms, r => r.listPrice || r.price || 0);
      // HS tạm tính (đặc tả dòng 117): DT tiền nhà ĐÃ THU tại thời điểm xem + bỏ cọc / giá niêm yết
      const rentPaid = sum(invs, i => (Q.lineState(i)[0] || {}).paid || 0);
      const forfeit = S.where('depositLedger', l => l.buildingId === b.id && l.kind === 'forfeit_revenue' && l.period === period).reduce((t, l) => t + l.amount, 0);
      const hsTemp = list ? (rentPaid + forfeit) / list * 100 : null;
      // lấp đầy theo ngày tính tiền của lượt thuê trong kỳ
      const ids = new Set(rooms.map(r => r.id));
      const stays = S.all('stays').filter(s => ids.has(s.roomId) && ['active', 'ended'].includes(s.status) && s.rentStart && s.rentStart <= pEnd && (!s.stopBillingDate || s.stopBillingDate >= period + '-01'));
      const billed = Math.min(rooms.length * dim, sum(stays, s => D.proRataDays(s.rentStart, period, s.stopBillingDate).days));
      // thời gian trống: lượt thuê mới bắt đầu tính tiền trong kỳ ← lượt cũ cùng phòng ngừng tính tiền
      const gaps = S.all('stays').filter(s => ids.has(s.roomId) && s.rentStart && F.period(s.rentStart) === period).map(s => {
        const prev = S.all('stays').filter(x => x.roomId === s.roomId && x.id !== s.id && x.stopBillingDate && x.stopBillingDate < s.rentStart).sort((a, c) => c.stopBillingDate.localeCompare(a.stopBillingDate))[0];
        return prev ? Math.max(0, D.diffDays(prev.stopBillingDate, s.rentStart) - 1) : null; }).filter(x => x != null);
      // đúng hạn
      const bucket = { ontime: 0, d10: 0, d15: 0, late: 0, open: 0 };
      invs.forEach(i => { const st = Q.invState(i); if (st.remaining > 0.5) { bucket.open++; return; } const d = st.lastPaid || ''; const day = d.slice(0, 7) < period ? 0 : d.slice(0, 7) > period ? 99 : Number(d.slice(8, 10));
        if (day <= ms[0]) bucket.ontime++; else if (day <= ms[1]) bucket.d10++; else if (day <= ms[2]) bucket.d15++; else bucket.late++; });
      // phân khúc tại kỳ xem: lượt thuê có tính tiền trong kỳ (kể cả khách đã rời sau đó)
      const act = stays; const stu = act.filter(s => /sinh viên/i.test((Q.customer(s.customerId) || {}).occupation || '')).length;
      const vac = { now: vacAt.now.filter(r => ids.has(r.id)).length, eom: vacAt.endOfMonth.filter(r => ids.has(r.id)).length, clean: vacAt.cleaning.filter(r => ids.has(r.id)).length };
      return { buildingId: b.id, code: b.code, group: b.group, areaId: b.areaId, rooms: rooms.length, hs, hsT, hsK, hsTemp, rentPaid, list, forfeit, vac, occ: rooms.length ? billed / (rooms.length * dim) : null, vacancyDays: gaps.length ? sum(gaps, x => x) / gaps.length : null, gaps: gaps.length,
        invoices: invs.length, bucket, students: stu, workers: act.length - stu, active: act.length };
    }).filter(Boolean);
    const T = { rooms: sum(out, 'rooms'), invoices: sum(out, 'invoices') };
    const wAvg = (k) => { const a = out.filter(x => x[k] != null); const w = sum(a, 'rooms'); return w ? sum(a, x => x[k] * x.rooms) / w : null; };
    // HS tổng = Σ T / Σ K (SRC-13), không phải trung bình HS các tòa
    const hk = out.filter(x => x.hsK); T.hs = hk.length ? sum(hk, 'hsT') / sum(hk, 'hsK') * 100 : null;
    const lp = sum(out, 'list'); T.hsTemp = lp ? (sum(out, 'rentPaid') + sum(out, 'forfeit')) / lp * 100 : null; T.occ = wAvg('occ');
    T.vac = { now: sum(out, x => x.vac.now), eom: sum(out, x => x.vac.eom), clean: sum(out, x => x.vac.clean) };
    // "HS thực tế" chỉ khi đã qua mốc thu cuối (ngày 15) của kỳ hoặc kỳ đã khóa / song song; trước đó ghi "tạm tính"
    T.hsFinal = parallel || per.status === 'closed' || F.today() > period + '-' + String(ms[2]).padStart(2, '0');
    const g = out.filter(x => x.gaps); T.vacancyDays = g.length ? sum(g, x => x.vacancyDays * x.gaps) / sum(g, 'gaps') : null;
    T.bucket = ['ontime', 'd10', 'd15', 'late', 'open'].reduce((o, k) => (o[k] = sum(out, x => x.bucket[k]), o), {});
    T.students = sum(out, 'students'); T.active = sum(out, 'active');
    return { period, parallel, rows: out, totals: T, msDays: ms };
  };

  /* ---------- UI-46: khách hàng, tỷ lệ chuyển đổi, doanh số sale ----------
     Chuyển đổi (OQ-06) = khách có deal chốt / khách có lượt xem, theo tháng của ngày xem; doanh số (OQ-25) = Σ giá chốt theo ngày chốt, chia đều khi nhiều sale, hủy/bỏ cọc cột riêng. */
  QO.sales = (period, by = 'sale', f = {}) => {
    const conversionPolicy = Q.policy('conversionFormula', D.periodEnd(period));
    const conversionFormula = conversionPolicy ? conversionPolicy.value : 'none';
    const teamOf = (id) => (Q.leaderOf(id) || { id: '–' }).id;
    const okSale = (ids) => (!f.sale || (ids || []).includes(f.sale)) && (!f.team || (ids || []).some(id => teamOf(id) === f.team));
    // E3: thêm lọc nhóm T/S/G, NV vận hành (quản lý tòa cuối kỳ), cổ đông (tòa cổ đông có tỷ lệ góp cuối kỳ – chỉ giới hạn tòa, không đổi định nghĩa doanh số; đặc tả dòng 410, 518)
    const pe = D.periodEnd(period); const mm = f.manager ? Q.managerMap(pe) : null; const shB = f.shareholder && Q.shareRatios ? (bid) => Q.shareRatios(bid, pe).some(r => r.shareholderId === f.shareholder) : null;
    const okB2 = (bid) => { const b = Q.building(bid) || {}; return (!f.building || bid === f.building) && (!f.area || b.areaId === f.area) && (!f.group || b.group === f.group) && (!mm || (mm[bid] || {}).id === f.manager) && (!shB || shB(bid)); };
    const views = S.all('viewings').filter(v => F.period(v.date) === period && okB2(v.buildingId) && okSale((Q.lead(v.leadId) || {}).saleIds));
    const leadsViewed = new Set(views.map(v => v.leadId));
    const closedLead = new Set(S.all('deals').filter(d => !['cancelled'].includes(d.status)).map(d => d.leadId));
    const keyFns = { sale: (l) => l.saleIds, team: (l) => l.saleIds.map(id => (Q.leaderOf(id) || { id: '–' }).id), source: (l) => [l.source], area: (l) => [l.areaId || '–'],
      building: (l) => [...new Set(views.filter(v => v.leadId === l.id).map(v => v.buildingId))] };
    const g = {};
    [...leadsViewed].forEach(id => { const l = Q.lead(id); if (!l || !TH.auth.inSales(l.saleIds)) return; const ks = keyFns[by](l); ks.forEach(k => { const x = g[k] = g[k] || { key: k, viewed: 0, closed: 0 }; x.viewed += 1 / ks.length; if (closedLead.has(l.id)) x.closed += 1 / ks.length; }); });
    // D5: lọc sale / team chỉ hiện dòng của người được lọc (người chia trùng ngoài bộ lọc không hiện)
    const keep = (id) => (!f.sale || id === f.sale) && (!f.team || teamOf(id) === f.team);
    const ratio = x => conversionFormula === 'viewedPerClosed' ? (x.closed ? x.viewed / x.closed : null) : (x.viewed ? x.closed / x.viewed : null);
    const conv = Object.values(g).filter(x => by === 'sale' ? keep(x.key) : by === 'team' && f.team ? x.key === f.team : true).map(x => Object.assign(x, { rate: conversionFormula === 'none' ? null : ratio(x) })).sort((a, b) => b.viewed - a.viewed);
    const deals = Q.salesScoped(S.all('deals')).filter(d => F.period(d.closeDate) === period && okB2(d.buildingId) && okSale(d.saleIds));
    const vol = TH.calc.commission.salesVolume(deals);
    const target = Q.param('salesTarget', D.periodEnd(period));
    const volume = Object.entries(vol).filter(([id]) => keep(id)).map(([id, v]) => { const tg = Q.salesTarget ? Q.salesTarget(id, D.periodEnd(period)) : target; return Object.assign({ id, name: (Q.emp(id) || {}).name || '?', team: teamOf(id), target: tg, pct: tg ? v.volume / tg : null }, v); }).sort((a, b) => b.volume - a.volume);
    const tv = sum(Object.values(g), 'viewed'), tc = sum(Object.values(g), 'closed');
    const inScope = [...leadsViewed].filter(id => { const l = Q.lead(id); return l && TH.auth.inSales(l.saleIds); }); // D5: số tổng theo phạm vi như các dòng
    const abs = { viewed: inScope.length, closed: inScope.filter(id => closedLead.has(id)).length };
    return { period, by, conv, volume, conversionFormula, conversionPolicy, totals: { viewed: abs.viewed, closed: abs.closed, rate: conversionFormula === 'none' ? null : ratio(abs), volume: sum(volume, 'volume'), cancelled: sum(volume, 'cancelledVolume') } };
  };

  /* ---------- UI-27: danh mục trung tâm báo cáo (4 nhóm) – trạng thái sẵn sàng / chờ định nghĩa / chờ dữ liệu ---------- */
  QO.catalog = () => {
    const lastLive = S.all('periods').filter(p => p.source === 'web' && Q.invoicesOf(p.id).some(i => i.lifecycle !== 'draft')).map(p => p.id).sort().pop() || null;
    // kỳ báo cáo gần nhất có số: kỳ đã khóa / song song Excel / kỳ web đã phát hành hóa đơn
    const lastRep = S.all('periods').filter(p => p.status === 'closed' || p.source === 'excel_parallel' || p.id === lastLive).map(p => p.id).sort().pop() || null;
    const ad = lastLive ? QO.amDuong(lastLive, 'electric', 'web') : { status: 'no_data' };
    const adBench = Object.keys(((TH.data.p2 || {}).amduong) || {}).sort().pop() || null;
    const lastRepair = [...new Set(S.all('repairLogs').map(r => r.period))].sort().pop() || null;
    const lastDeal = S.all('deals').map(d => F.period(d.closeDate)).sort().pop() || null;
    const lastView = S.all('viewings').map(v => F.period(v.date)).sort().pop() || null;
    const st = (p) => p ? 'ready' : 'waiting';
    return [
      { key: 'kq', label: 'Kết quả kinh doanh', items: [
        { ui: 'UI-29', title: 'Báo cáo tổng (LN dòng tiền)', href: '#/reports/total', formula: 'báo cáo lợi nhuận kinh doanh thực thu (gồm cọc mới và mua sắm tb) – SRC-13', period: lastRep, status: st(lastRep) },
        { ui: 'UI-30', title: 'Báo cáo kinh doanh', href: '#/reports/business', formula: 'không gồm cọc mới, hoàn cọc, mua sắm tb; khấu hao thiết bị theo số tháng từng tài sản UI-34, mặc định 63 tháng ≈ 1,6% (GĐ OQ-10, OQ-11)', period: lastRep, status: st(lastRep) },
        { ui: 'UI-42', title: 'Chi phí giá vốn / cố định / phát sinh', href: '#/reports/costs', formula: 'các mục giá vốn / chi phí vận hành / chi phí phát sinh trong báo cáo nhà; từng nhà và toàn hệ thống', period: lastRep, status: st(lastRep) },
        ...(TH.ms.on('3') ? (() => { const fc = Q.forecastLatestPeriod ? Q.forecastLatestPeriod() : null; return [ // Phase 3: UI-40 / UI-41
          { ui: 'UI-40', title: 'Dự kiến lợi nhuận', href: '#/reports/forecast', formula: 'một bộ đầu vào → bản dòng tiền (có cọc mới, hoàn cọc, mua sắm thiết bị) và bản kinh doanh (khấu hao) – SRC-14', period: fc, status: st(fc) },
          { ui: 'UI-41', title: 'Hiệu quả vốn, tài sản & tiền nhà', href: '#/reports/efficiency', formula: 'LN/vốn = LNR/GV (dòng 51) · LN/tài sản = LNR / giá trị TS còn lại · biên tiền nhà = DT tiền phòng / tiền thuê (dòng 59)', period: lastRep, status: st(lastRep) }]; })()
        : [{ ui: 'UI-40', title: 'Dự kiến lợi nhuận', formula: 'có / không tính cọc mới, hoàn cọc, mua sắm thiết bị', status: 'phase3' },
          { ui: 'UI-41', title: 'Hiệu quả đầu tư', formula: 'LN/vốn, LN/tài sản, biên LN tiền nhà', status: 'phase3' }])] },
      { key: 'vh', label: 'Phòng vận hành', items: [
        { ui: 'UI-45', title: 'Hiệu suất NV vận hành (HS)', href: '#/reports/rooms?view=hs', formula: 'HS thực tế / HS tạm tính (UI-01) – cùng công thức bảng lương (OQ-18)', period: lastLive, status: st(lastLive) },
        { ui: 'UI-45', title: 'Tỷ lệ lấp đầy, thời gian trống', href: '#/reports/rooms?view=occ', formula: 'từng nhà và hệ thống; lọc trưởng phòng, khu vực (OQ-06)', period: lastLive, status: st(lastLive) },
        { ui: 'UI-43', title: 'Âm dương điện nước', href: '#/reports/amduong', formula: 'theo file mẫu: K = điện thực thu + ½ máy giặt + thang máy/sấy/xe điện; M = K − điện chi (SRC-15)', period: adBench, status: st(adBench), note: lastLive ? 'Web kỳ ' + F.periodShort(lastLive) + ': ' + (ad.status === 'ready' ? 'đủ chi' : 'chờ hóa đơn chi') : '' },
        { ui: 'UI-44', title: 'Chi phí sửa chữa, vệ sinh', href: '#/reports/repairs', formula: 'theo file mẫu – sổ sửa chữa kỳ 26 → 25 (OQ-22)', period: lastRepair, status: st(lastRepair) },
        { ui: 'UI-45', title: 'Phân khúc khách hàng', href: '#/reports/rooms?view=seg', formula: '% sinh viên, % người đi làm (nghề nghiệp trên HĐ, CH-25)', period: lastLive, status: st(lastLive) },
        { ui: 'UI-45', title: 'Đóng tiền đúng hạn / quá hạn', href: '#/reports/rooms?view=pay', formula: '% khách đóng đúng hạn (đủ trước hết ngày 5), % quá hạn (OQ-12)', period: lastLive, status: st(lastLive) }] },
      { key: 'kd', label: 'Phòng kinh doanh', items: [
        { ui: 'UI-46', title: 'Báo cáo khách hàng', href: '#/reports/sales?tab=chuyen-doi', formula: 'tỷ lệ chuyển đổi = khách xem / khách chốt (SRC-13; web tính chốt / xem – K-8)', period: lastView, status: st(lastView) },
        { ui: 'UI-46', title: 'Báo cáo doanh số', href: '#/reports/sales?tab=doanh-so', formula: 'tổng giá phòng cho thuê được trong tháng theo từng sale (OQ-25)', period: lastDeal, status: st(lastDeal) }] },
      { key: 'toa', label: 'Drill-down', items: [
        { ui: 'UI-28', title: 'Chi tiết tòa trong báo cáo đang xem', href: '#/reports/buildings', formula: 'mỗi cột một tòa như mẫu BC DT NHÀ T/S/G và G1', period: lastRep, status: st(lastRep) }] },
    ];
  };
  TH.qo = QO;
})(window.TH);
