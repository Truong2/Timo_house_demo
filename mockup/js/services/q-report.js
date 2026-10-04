/* Nguồn số cho báo cáo (UI-27 → UI-30): dòng gốc theo tòa lấy từ giao dịch web; kỳ chạy song song lấy doanh thu từ Excel và so sánh.
   Ánh xạ dòng ↔ nguồn đặc tả §7.1b (SRS §2.3). */
(function (TH) {
  const S = TH.store, F = TH.f, Q = TH.q, R = TH.calc.report, D = TH.calc.dates;
  const QR = {};
  const add = (m, b, k, v) => { if (!v) return; (m[b] = m[b] || {})[k] = (m[b][k] || 0) + v; };

  QR.revenueLive = (period, m, src) => {
    const invs = Q.invoicesOf(period).filter(i => i.lifecycle !== 'draft');
    const paid = Q.paidIndex();
    invs.forEach(i => {
      const L = TH.calc.billing.expand(i.lines), b = i.buildingId;
      add(m, b, 'rev_total', (paid[i.id] || 0) + (i.ownerSettled || 0)); // khách chủ nhà đóng thẳng cho chủ: bù trừ tiền trả chủ nhà (OQ-14) = đã thu
      add(m, b, 'dep_new', L[1].amount);
      if (i.isBreach) { add(m, b, 'cnt_breach', 1); add(m, b, 'rev_el', L[2].amount); return; }
      if (i.isNewStay) add(m, b, 'cnt_new', 1);
      add(m, b, 'rev_rent', L[0].amount); add(m, b, 'rev_el', L[2].amount + L[11].amount); add(m, b, 'rev_wa', L[3].amount);
      add(m, b, 'rev_clean', L[4].amount + L[9].amount / 2); add(m, b, 'rev_wash', L[8].amount + L[9].amount / 2);
      add(m, b, 'rev_net', L[5].amount); add(m, b, 'rev_elev', L[6].amount); add(m, b, 'rev_ev', L[7].amount);
    });
    S.all('refunds').filter(r => r.status === 'paid' && F.period(r.paidAt) === period).forEach(r => {
      add(m, r.buildingId, 'refund', r.paidAmount); add(m, r.buildingId, 'rev_total', -r.paidAmount);
      r.deductions.forEach(d => { if (d.kind === 'electric') add(m, r.buildingId, 'rev_el', d.amount); if (d.kind === 'water') add(m, r.buildingId, 'rev_wa', d.amount); });
    });
    // Phiếu nhận cọc giữ phòng (UI-13 loại cọc, lượt thuê chờ nhận UI-07) → dòng 4 "Cọc phòng mới" và dòng 3 theo kỳ nhận tiền; đảo phiếu ghi số âm
    const viaReceipt = {};
    S.all('depositLedger').filter(l => l.kind === 'receive' && l.paymentId).forEach(l => { viaReceipt[l.stayId] = (viaReceipt[l.stayId] || 0) + l.amount; if (l.period === period) { add(m, l.buildingId, 'dep_new', l.amount); add(m, l.buildingId, 'rev_total', l.amount); } });
    // Cọc khách bỏ không ở → dòng 5; chỉ cộng vào dòng 3 phần chưa tính khi nhận (cọc nhận trước go-live)
    S.all('depositLedger').filter(l => l.kind === 'forfeit_revenue' && l.period === period).forEach(l => { add(m, l.buildingId, 'dep_forfeit', l.amount); add(m, l.buildingId, 'rev_total', Math.max(0, l.amount - (viaReceipt[l.stayId] || 0))); });
    const vac = Q.vacancy(D.periodEnd(period)); vac.now.forEach(r => add(m, r.buildingId, 'cnt_vacant', 1));
    src.revenue = 'Hóa đơn & phiếu thu trên web kỳ ' + F.periodShort(period);
  };
  QR.revenueExcel = (period, m, src) => {
    const REV = ['rev_total', 'dep_new', 'dep_forfeit', 'refund', 'cnt_breach', 'cnt_new', 'cnt_vacant', 'rev_rent', ...R.SVC];
    S.all('benchLines').filter(x => x.period === period && REV.includes(x.code)).forEach(x => add(m, x.buildingId, x.code, x.value));
    src.revenue = 'Excel SRC-04 (kỳ chạy song song – chưa có hóa đơn trên web)';
  };
  QR.costs = (period, m, src, opt = {}) => {
    const pe = D.periodEnd(period);
    // 20 tiền thuê nhà 1 tháng: giá HĐ chủ nhà hiệu lực trong kỳ
    S.all('ownerContracts').forEach(oc => { const v = TH.actions.ownerRentAt(oc.id, pe); add(m, oc.buildingId, 'cost_rent', v); });
    S.all('expenses').filter(e => e.period === period && e.status !== 'void' && e.scope === 'building' && e.reportLine && e.reportLine !== 'cost_rent').forEach(e => add(m, e.buildingId, e.reportLine, e.amount));
    // quỹ chung → phân bổ (phiên đã lưu, hoặc xem trước)
    const run = S.one('allocationRuns', r => r.period === period) || null;
    const al = run || TH.actions.previewAllocation(period);
    al.lines.forEach(l => Object.entries(l.results).forEach(([b, v]) => add(m, b, l.lineCode, v)));
    src.allocation = run ? `${run.code} (${run.status === 'closed' ? 'đã chốt' : 'nháp'}) · mẫu số ${run.denominator}` : 'Xem trước (chưa lưu phiên phân bổ) · mẫu số ' + al.denominator;
    const pr = S.one('payrollRuns', r => r.period === period && r.status !== 'superseded');
    const pv = pr ? (pr.status === 'closed' ? null : pr) : TH.actions.previewPayroll(period);
    if (pv) {
      pv.lines.forEach(l => l.buildings.forEach(b => add(m, b.buildingId, 'sal_mgr', b.W)));
      (pv.buildingCosts || []).forEach(c => add(m, c.buildingId, c.line, c.amount)); // lương vệ sinh/bảo vệ, tiền công thợ nhập tay (chưa chốt)
    }
    src.payroll = pr ? `${pr.code} (${pr.status === 'closed' ? 'đã chốt – chi phí lương theo tòa' : 'tạm tính'})` : 'Xem trước bảng lương (chưa lưu phiên)';
    const dep = Q.depOfPeriod(period); // Phase 3: tài sản công ty UI-34, khấu hao theo số tháng từng tài sản + thanh lý
    src.depreciation = dep; return dep;
  };
  /* type: 'total' | 'business'; bizMode: 'gd' (giả định OQ-10) | 'excel' (tái hiện sheet KD) */
  /* opts.noAdj: bỏ dòng điều chỉnh sau khóa – dùng khi khóa kỳ chụp số (điều chỉnh luôn cộng thêm khi đọc, không nằm trong ảnh chụp) */
  QR.officialBusinessMode = period => {
    const per = S.get('periods',period), snapshot = per?.status === 'closed' ? S.get('reportSnapshots','rs_'+period) : null;
    if (snapshot) return snapshot.officialMode || 'excel';
    const policy = Q.policy('businessReportMode',D.periodEnd(period));
    return period >= '2026-10' && policy?.value === 'web' && policy.status === 'confirmed' ? 'web' : 'excel';
  };
  QR.build = (period, type = 'total', bizMode, opts = {}) => {
    const officialMode = QR.officialBusinessMode(period);
    bizMode = bizMode || officialMode;
    if (bizMode === 'web' && officialMode !== 'web') bizMode = officialMode;
    // Chế độ OQ-10 chỉ là phương án rà soát nội bộ. Chặn ngay tại service để
    // không thể lách giới hạn của màn hình bằng cách gọi QR.build trực tiếp.
    if (!['admin', 'ketoan'].includes(TH.auth.role())) bizMode = officialMode;
    const per = S.get('periods', period) || {}; const parallel = per.source === 'excel_parallel';
    let m = {}; let src = {}; let dep;
    const snap = per.status === 'closed' ? S.get('reportSnapshots', 'rs_' + period) : null;
    const adjs = opts.noAdj ? [] : S.where('adjustments', a => a.entity === 'report' && a.originalPeriod === period && a.status !== 'absorbed'); // D18: dòng đã gỡ khi mở lại kỳ không cộng
    if (snap) {
      m = JSON.parse(JSON.stringify(snap.base)); dep = snap.dep;
      src = Object.assign({}, snap.sources, { frozen: `Số chốt khi khóa kỳ ${F.datetime(snap.at)} (${snap.by})` + (adjs.length ? ` + ${adjs.length} dòng điều chỉnh sau khóa` : '') });
    } else {
      if (parallel) QR.revenueExcel(period, m, src); else QR.revenueLive(period, m, src);
      dep = QR.costs(period, m, src);
    }
    adjs.forEach(a => add(m, a.buildingId, a.reportLine, a.delta));
    const groupOf = (b) => (Q.building(b) || {}).group || F.groupOf(String(b).slice(2));
    let byB = m;
    if (type === 'business') {
      byB = {};
      if (snap && bizMode === (snap.officialMode || 'excel') && snap.business && !adjs.length) byB = JSON.parse(JSON.stringify(snap.business));
      else if (parallel && bizMode === 'excel') {
        // Kỳ lịch sử: số chính thức theo từng tòa cũng phải là số của sheet
        // Excel, không chỉ ép đúng bốn cột tổng T/S/G/TOTAL ở phía dưới.
        const benchBase = {};
        S.all('benchLines').filter(x => x.period === period).forEach(x => add(benchBase, x.buildingId, x.code, x.value));
        adjs.forEach(a => {
          const v = benchBase[a.buildingId] = benchBase[a.buildingId] || {};
          v[a.reportLine] = (v[a.reportLine] || 0) + a.delta;
        });
        const officialDep = Q.depOfficialOfPeriod(period);
        Object.entries(benchBase).forEach(([b, v]) => { byB[b] = R.business(v, { depreciation: officialDep.byBuilding[b] || 0, addBackRefund: Q.param('bizAddBackRefund'), useDepreciation: Q.param('bizDepreciation'), mode: 'excel' }); });
      }
      else {
        const officialDep = bizMode !== 'gd' ? (snap ? snap.officialDep || dep : Q.depOfficialOfPeriod(period)) : dep;
        Object.entries(m).forEach(([b, v]) => { byB[b] = R.business(v, { depreciation: officialDep.byBuilding[b] || 0, addBackRefund: Q.param('bizAddBackRefund'), useDepreciation: Q.param('bizDepreciation'), mode: bizMode }); });
      }
    }
    let cols = R.aggregate(byB, groupOf);
    const derived = {}; Object.entries(byB).forEach(([b, v]) => { derived[b] = R.derive(v); });
    let excel = null;
    if (parallel && TH.data.bench202608 && period === '2026-08') {
      const X = TH.data.bench202608.report; const sheet = type === 'business' ? X.business : X.total; excel = {};
      TH.data.catalog.reportLines.forEach(l => { const r = sheet[l.row]; if (r) excel[l.code] = { TOTAL: r[0], T: r[1], S: r[2], G: r[3] }; });
    }
    if (type === 'business' && (bizMode === 'excel' || (snap && bizMode === (snap.officialMode || 'excel') && !adjs.length))) {
      if (snap && bizMode === (snap.officialMode || 'excel') && snap.businessCols) cols = JSON.parse(JSON.stringify(snap.businessCols));
      else if (excel) {
        cols = { TOTAL: {}, T: {}, S: {}, G: {} };
        Object.entries(excel).forEach(([code, values]) => Object.keys(cols).forEach(k => { cols[k][code] = values[k]; }));
      }
      if ((snap && bizMode === (snap.officialMode || 'excel') && snap.businessCols) || excel) adjs.forEach(a => {
        ['TOTAL', groupOf(a.buildingId)].forEach(k => {
          const v = Object.assign({}, cols[k]);
          if (a.reportLine === 'dep_new') { v.dep_new = (v.dep_new || 0) + a.delta; v.rev_total = (v.rev_total || 0) - a.delta; }
          else if (a.reportLine !== 'cost_equip') v[a.reportLine] = (v[a.reportLine] || 0) + a.delta;
          cols[k] = R.derive(v);
        });
      });
    }
    /* Cầu nối kinh doanh tính trên số Excel của sheet tổng (tháng 8: 790.331.663 so với sheet KD 685.928.969) */
    let excelBiz = null;
    if (excel && type === 'business') {
      const X = TH.data.bench202608.report.total; const eb = {};
      TH.data.catalog.reportLines.forEach(l => { if (X[l.row]) eb[l.code] = X[l.row][0]; });
      excelBiz = { gd: R.business(eb, { depreciation: dep.total, addBackRefund: Q.param('bizAddBackRefund'), useDepreciation: Q.param('bizDepreciation') }), sheet: R.business(eb, { depreciation: Q.depOfficialOfPeriod(period).total, mode: 'excel' }), total: R.derive(eb) };
    }
    const policySnapshot = snap && snap.policySnapshot ? snap.policySnapshot : Q.policySnapshot(D.periodEnd(period));
    return { period, type, bizMode, parallel, cols, byBuilding: derived, base: m, sources: src, excel, excelBiz, dep, frozen: !!snap, adjustments: adjs,
      policySnapshot, ruleVersion: snap && snap.at ? snap.at : (Q.policy('businessReportMode',D.periodEnd(period))?.formulaVersion || D.periodEnd(period)), policyStatus: bizMode !== 'gd' ? 'confirmed' : 'proposed', official: bizMode === officialMode };
  };
  /* Đối chiếu tổng chi phí (TCP) kỳ song song: số web − số Excel tách thành từng nhóm nguyên nhân, đến từng ô tòa × dòng.
     Nhóm: (1) tòa có trong bảng lương/mẫu số nhưng không có cột trong báo cáo Excel; (2) lương quản lý – dòng lỗi nguồn bảng lương;
     (3) ô phân bổ quỹ chung của sheet tòa Excel khác công thức chung; (4) phần còn lại (phải = 0 để đạt nghiệm thu). */
  QR.reconcile = (period) => {
    const rep = QR.build(period, 'total');
    if (!rep.excel) return null;
    const bench = {}; S.all('benchLines').filter(x => x.period === period).forEach(x => { (bench[x.buildingId] = bench[x.buildingId] || {})[x.code] = x.value; });
    const code = (b) => (Q.building(b) || {}).code || b;
    const costKeys = [...R.GV, ...R.CPBH];
    const allocCodes = new Set(TH.data.allocRules.map(r => r.lineCode));
    const outB = Object.keys(rep.byBuilding).filter(b => !bench[b] && costKeys.some(k => rep.base[b] && rep.base[b][k]));
    const outAmt = outB.reduce((s, b) => s + rep.byBuilding[b].tcp, 0);
    let pay = 0, other = 0; const cells = [], others = [];
    Object.keys(bench).forEach(b => costKeys.forEach(k => {
      const d = ((rep.base[b] || {})[k] || 0) - (bench[b][k] || 0); if (Math.abs(d) < 0.005) return;
      if (k === 'sal_mgr') pay += d;
      else if (allocCodes.has(k)) cells.push({ b: code(b), line: k, amount: d });
      else { other += d; others.push({ b: code(b), line: k, amount: d }); }
    }));
    const pv = TH.actions.previewPayroll(period);
    const payRows = pv.lines.flatMap(l => l.buildings.filter(x => x.excel && Math.abs(x.W - x.excel.W) > 0.5).map(x => ({ b: code(x.buildingId), d: x.W - x.excel.W })));
    const allocAmt = cells.reduce((s, c) => s + c.amount, 0);
    const web = rep.cols.TOTAL.tcp, excel = rep.excel.tcp.TOTAL;
    const items = [
      { key: 'scope', label: 'Tòa có trong bảng lương và mẫu số 1.382 nhưng không có cột trong báo cáo Excel: ' + outB.map(code).join(', '), amount: outAmt, needsDecision: true },
      { key: 'payroll', label: 'Lương quản lý: dòng lỗi nguồn bảng lương Excel ' + payRows.map(r => r.b).join(', '), amount: pay, expected: payRows.reduce((s, r) => s + r.d, 0) },
      { key: 'alloc', label: `Phân bổ quỹ chung: ${cells.length} ô của sheet tòa Excel khác công thức chung (${cells.map(c => c.b + ' ' + c.line).join(', ')})`, amount: allocAmt, cells },
      { key: 'other', label: 'Chênh lệch khác (chưa giải thích)', amount: other, cells: others },
    ];
    return { period, web, excel, diff: web - excel, items, residual: (web - excel) - items.reduce((s, i) => s + i.amount, 0) };
  };
  /* Giao dịch nguồn của một ô báo cáo (UI-27 "click số → giao dịch gốc" UI-12/UI-13/UI-15/UI-16/UI-18/UI-25): dòng × tập tòa.
     Trả về { items: [{ type, label, sub, href, amount, buildingId }], note } – dòng tính (tổng, lợi nhuận, tỷ lệ) trả về các dòng thành phần. */
  const INV_LINE = { rev_rent: [[0, 1]], rev_el: [[2, 1], [11, 1]], rev_wa: [[3, 1]], rev_clean: [[4, 1], [9, 0.5]], rev_wash: [[8, 1], [9, 0.5]], rev_net: [[5, 1]], rev_elev: [[6, 1]], rev_ev: [[7, 1]], dep_new: [[1, 1]] };
  const REV_CODES = ['rev_total', 'dep_new', 'dep_forfeit', 'refund', 'cnt_breach', 'cnt_new', 'cnt_vacant', 'rev_rent', ...R.SVC];
  QR.sources = (period, code, bids) => {
    const bset = new Set(bids); const inB = (b) => bset.has(b);
    const per = S.get('periods', period) || {}; const items = []; const notes = [];
    const bc = (b) => (Q.building(b) || {}).code || b;
    const push = (o) => items.push(Object.assign({ sub: '' }, o));
    const COMPOSITE = { rev_svc: R.SVC, gv: R.GV, cpbh: R.CPBH, tcp: [...R.GV, ...R.CPBH] };
    if (COMPOSITE[code] || !R.BASE.includes(code)) return { items: [], parts: COMPOSITE[code] || null, note: COMPOSITE[code] ? 'Dòng tổng – mở từng dòng thành phần bên dưới' : 'Dòng tính theo công thức sheet từ các dòng khác – không có giao dịch riêng' };
    if (per.source === 'excel_parallel' && REV_CODES.includes(code)) {
      S.all('benchLines').filter(x => x.period === period && x.code === code && inB(x.buildingId)).forEach(x => push({ type: 'Excel SRC-04', label: 'Sheet BC DT tòa ' + bc(x.buildingId), amount: x.value, buildingId: x.buildingId }));
      notes.push('Kỳ chạy song song: doanh thu lấy từ Excel SRC-04, chưa có hóa đơn/phiếu thu trên web');
    } else if (REV_CODES.includes(code)) {
      const invs = Q.invoicesOf(period).filter(i => i.lifecycle !== 'draft' && inB(i.buildingId));
      const E = (i) => TH.calc.billing.expand(i.lines);
      if (INV_LINE[code]) invs.filter(i => !(code === 'rev_rent' && i.isBreach) && !(i.isBreach && code !== 'rev_el' && code !== 'dep_new')).forEach(i => {
        const L = E(i); const v = i.isBreach && code === 'rev_el' ? L[2].amount : INV_LINE[code].reduce((s, [k, f]) => s + (L[k] ? L[k].amount * f : 0), 0);
        if (v) push({ type: 'Hóa đơn', label: i.code, sub: Q.roomCode(i.roomId) + (i.isBreach ? ' · phá HĐ' : i.isNewStay ? ' · phòng mới' : ''), href: '#/billing/invoices/' + i.id, amount: v, buildingId: i.buildingId });
      });
      if (code === 'rev_total') {
        const ids = new Set(invs.map(i => i.id));
        S.all('payments').filter(p => p.status !== 'reversed').forEach(p => { const a = (p.allocations || []).filter(x => ids.has(x.invoiceId)).reduce((s, x) => s + x.amount, 0); if (a) push({ type: 'Phiếu thu', label: p.code, sub: F.date(p.receivedAt) + ' · ' + ((Q.stay(p.stayId) || {}).code || ''), href: '#/billing/receipts/' + p.id, amount: a, buildingId: p.buildingId }); });
        invs.filter(i => i.ownerSettled > 0).forEach(i => push({ type: 'Bù trừ chủ nhà', label: i.code, sub: 'Khách của chủ nhà đóng thẳng cho chủ – trừ vào kỳ trả chủ nhà', href: '#/billing/invoices/' + i.id, amount: i.ownerSettled, buildingId: i.buildingId }));
      }
      if (['rev_total', 'dep_new'].includes(code)) S.all('depositLedger').filter(l => l.kind === 'receive' && l.paymentId && l.period === period && inB(l.buildingId)).forEach(l => push({ type: 'Phiếu nhận cọc', label: (S.get('payments', l.paymentId) || {}).code || l.note, sub: l.note, href: '#/billing/receipts/' + l.paymentId, amount: l.amount, buildingId: l.buildingId }));
      if (['rev_total', 'refund', 'rev_el', 'rev_wa'].includes(code)) S.all('refunds').filter(r => r.status === 'paid' && F.period(r.paidAt) === period && inB(r.buildingId)).forEach(r => {
        const v = code === 'rev_total' ? -r.paidAmount : code === 'refund' ? r.paidAmount : r.deductions.filter(d => d.kind === (code === 'rev_el' ? 'electric' : 'water')).reduce((s, d) => s + d.amount, 0);
        if (v) push({ type: 'Phiếu hoàn cọc', label: r.code, sub: Q.roomCode(r.roomId) + ' · chi ' + F.date(r.paidAt), href: '#/refunds/' + r.id, amount: v, buildingId: r.buildingId });
      });
      if (['rev_total', 'dep_forfeit'].includes(code)) S.all('depositLedger').filter(l => l.kind === 'forfeit_revenue' && l.period === period && inB(l.buildingId)).forEach(l => push({ type: 'Cọc khách bỏ', label: (Q.stay(l.stayId) || {}).code || '', sub: l.note, href: '#/stays/' + l.stayId, amount: l.amount, buildingId: l.buildingId }));
      if (code === 'cnt_breach' || code === 'cnt_new') invs.filter(i => code === 'cnt_breach' ? i.isBreach : i.isNewStay && !i.isBreach).forEach(i => push({ type: 'Lượt thuê', label: i.customerCode, sub: Q.roomCode(i.roomId), href: '#/stays/' + i.stayId, amount: 1, buildingId: i.buildingId }));
      if (code === 'cnt_vacant') Q.vacancy(D.periodEnd(period)).now.filter(r => inB(r.buildingId)).forEach(r => push({ type: 'Phòng trống', label: r.code, href: '#/buildings/' + r.buildingId + '?tab=phong&room=' + r.id, amount: 1, buildingId: r.buildingId }));
    } else {
      const pe = D.periodEnd(period);
      if (code === 'cost_rent') S.all('ownerContracts').filter(oc => inB(oc.buildingId)).forEach(oc => { const v = TH.actions.ownerRentAt(oc.id, pe); if (v) push({ type: 'HĐ chủ nhà', label: oc.code, sub: 'giá hiệu lực ' + F.date(pe), href: '#/owners/' + oc.id, amount: v, buildingId: oc.buildingId }); });
      S.all('expenses').filter(e => e.period === period && e.status !== 'void' && e.scope === 'building' && e.reportLine === code && code !== 'cost_rent' && inB(e.buildingId))
        .forEach(e => push({ type: e.source === 'payroll' ? 'Chi phí từ bảng lương' : 'Chứng từ chi phí', label: e.code, sub: (e.note || '').slice(0, 70), href: '#/expenses?period=' + period + '&q=' + encodeURIComponent(e.code), amount: e.amount, buildingId: e.buildingId }));
      const rule = TH.data.allocRules.find(r => r.lineCode === code);
      if (rule) {
        const run = S.one('allocationRuns', r => r.period === period); const al = run || TH.actions.previewAllocation(period); const ln = al.lines.find(l => l.lineCode === code);
        if (ln) Object.entries(ln.results).filter(([b, v]) => inB(b) && v).forEach(([b, v]) => push({ type: 'Phân bổ quỹ chung', label: (run ? run.code : 'xem trước') + ' · ' + bc(b), sub: 'quỹ ' + F.vnd(ln.fund) + ' / ' + al.denominator + ' × số phòng', href: '#/expenses/allocation?period=' + period, amount: v, buildingId: b }));
        S.all('expenses').filter(e => e.period === period && e.status !== 'void' && e.scope === 'fund' && e.fundCode === rule.fundCode).forEach(e => push({ type: 'Chứng từ quỹ (cả hệ thống)', label: e.code, sub: (e.note || '').slice(0, 70), href: '#/expenses?period=' + period + '&scope=fund&q=' + encodeURIComponent(e.code), amount: e.amount, buildingId: null, context: true }));
      }
      const pr = S.one('payrollRuns', r => r.period === period && r.status !== 'superseded'); const pv = pr ? (pr.status === 'closed' ? null : pr) : (code === 'sal_mgr' || ['sal_clean', 'sal_guard', 'repair'].includes(code) ? TH.actions.previewPayroll(period) : null);
      if (pv && code === 'sal_mgr') pv.lines.forEach(l => l.buildings.filter(b => inB(b.buildingId) && b.W).forEach(b => push({ type: pr ? 'Bảng lương (tạm tính)' : 'Bảng lương (xem trước)', label: (Q.emp(l.employeeId) || {}).name + ' · ' + bc(b.buildingId), sub: 'HS ' + (b.HS == null ? '–' : F.dec(b.HS, 2)) + ' · ' + b.J + ' phòng', href: '#/hr/payroll?period=' + period, amount: b.W, buildingId: b.buildingId })));
      if (pv) (pv.buildingCosts || []).filter(c => c.line === code && inB(c.buildingId)).forEach(c => push({ type: 'Bảng lương – nhập tay', label: c.kind === 'repair_labor' ? 'Tiền công ' + ((Q.emp(c.employeeId) || {}).name || '') : c.line === 'sal_clean' ? 'Lương vệ sinh' : 'Lương bảo vệ', sub: c.note, href: '#/hr/payroll?period=' + period + '&tab=nhap-tay', amount: c.amount, buildingId: c.buildingId }));
    }
    S.where('adjustments', a => a.entity === 'report' && a.originalPeriod === period && a.status !== 'absorbed' && a.reportLine === code && inB(a.buildingId)).forEach(a => push({ type: 'Điều chỉnh sau khóa', label: bc(a.buildingId) + ' · ' + a.reason, sub: a.by + ' · ' + F.datetime(a.at), href: '#/settings?tab=ky', amount: a.delta, buildingId: a.buildingId }));
    if (per.status === 'closed') notes.push('Kỳ đã khóa: số báo cáo là số chốt; danh sách giao dịch là dữ liệu hiện tại');
    return { items, parts: null, note: notes.join(' · ') };
  };
  QR.memo = {};
  QR.get = (period, type, bizMode) => { const k = [period, type, bizMode, S.version].join('|'); if (!QR.memo[k]) QR.memo = { [k]: QR.build(period, type, bizMode) }; return QR.memo[k]; };
  /* Một model duy nhất cho preview/export/acceptance: dòng 3–61, TỔNG/T/S/G và metadata chính sách. */
  QR.exportModel = (period, type = 'total', mode, filters = {}) => {
    const rep = QR.get(period, type, mode);
    const lines = TH.data.catalog.reportLines.filter(l => l.row >= 3 && l.row <= 61);
    const scope = Q.scopeBuildingIds(filters,D.periodEnd(period));
    const selected = Object.keys(rep.byBuilding).filter(id=>scope.has(id));
    let cols = rep.cols;
    if (filters.building || filters.group || filters.area || filters.manager || filters.leader || filters.shareholder) cols = R.aggregate(Object.fromEntries(selected.map(id => [id, rep.byBuilding[id]])), id => (Q.building(id) || {}).group || '');
    const policy = rep.policySnapshot && rep.policySnapshot.businessReportMode;
    const method = type === 'business' ? (rep.bizMode === 'web' ? 'Theo mô tả web – loại cọc mới/hoàn cọc, dùng KH xác nhận' : rep.bizMode === 'excel' ? 'Excel chính thức – chỉ loại cọc mới' : 'Phương án đề xuất OQ-10') : 'Excel / dòng tiền';
    return { exportSpecVersion: 'report-export-v4', templateVersion: 'SRC-04-v1.13', period, type, mode: rep.bizMode, report: rep, cols,
      headers: ['Dòng', 'Chỉ tiêu', 'TỔNG', 'NHÀ T', 'NHÀ S', 'NHÀ G'],
      metadata: [['Báo cáo', type === 'business' ? 'BÁO CÁO KINH DOANH' : 'BÁO CÁO TỔNG (LN DÒNG TIỀN)'], ['Kỳ', F.periodLabel(period)], ['Cách tính', method], ['Trạng thái nghiệp vụ', rep.policyStatus === 'confirmed' ? 'Đã xác nhận' : 'Chờ khách xác nhận'], ['Phiên bản quy tắc', String(rep.ruleVersion || '')], ['Nguồn quy tắc', (policy && policy.sourceRef) || (rep.bizMode === 'excel' ? 'SRC-04' : 'OQ-10')], ['Phiên bản export', 'report-export-v4'], ['Phiên bản mẫu', 'SRC-04-v1.13'], ['Xuất lúc', F.datetime(F.nowISO())]],
      rows: lines.map(l => ({ row: l.row, code: l.code, label: l.label, ratio: !!l.ratio, bold: !!l.bold, group: !!l.group, values: ['TOTAL','T','S','G'].map(k => (cols[k] || {})[l.code]) })) };
  };
  TH.qr = QR;
})(window.TH);
