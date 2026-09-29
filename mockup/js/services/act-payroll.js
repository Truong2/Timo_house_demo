/* Actions – bảng lương (UI-25, F08): tính thử theo mốc thu 5/10/15, cờ HS>100/HS<70 duyệt tay, chốt → chi phí theo tòa và quỹ chung. */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, P = TH.calc.payroll, D = TH.calc.dates;
  const OPS = ['NVVH', 'TNVH', 'TPVH'];
  const FUND_OF = { 'QL TỔNG': 'F_GM', TPVH: 'F_HEAD', TNVH: 'F_LEAD', 'THỊ TRƯỜNG': 'F_SOURCE', NVKD: 'F_SALES', SALE: 'F_SALES', TNKD: 'F_SALES', 'KẾ TOÁN': 'F_ACCT', 'KỸ THUẬT': 'F_REPAIR' };
  const payRooms = (bid, date) => (Q.roomsByBuilding()[bid] || []).filter(r => Q.rentable(r, date));

  /* Đầu vào tòa kỳ live từ dữ liệu web (hóa đơn, phiếu thu theo ngày thực nhận) */
  X.payrollBuildingInputs = (period, bid) => {
    const rooms = payRooms(bid, D.periodEnd(period));
    const invs = Q.invoicesOf(period).filter(i => i.buildingId === bid && i.lifecycle !== 'draft' && !i.isBreach);
    const lines = (i) => TH.calc.billing.expand(i.lines);
    const L0 = invs.reduce((s, i) => s + i.totalDue, 0);
    const dep = invs.reduce((s, i) => s + lines(i)[1].amount, 0);
    const extraMonths = invs.reduce((s, i) => { const l = lines(i)[0]; return s + (l.qty > 1 ? l.amount * (l.qty - 1) / l.qty : 0); }, 0);
    const Qv = invs.reduce((s, i) => s + lines(i).filter(l => (l.no >= 3 && l.no <= 10) || l.no === 12).reduce((t, l) => t + l.amount, 0), 0);
    const ids = new Set(invs.map(i => i.id));
    const pays = S.all('payments').filter(p => p.status !== 'reversed').flatMap(p => p.allocations.filter(a => ids.has(a.invoiceId)).map(a => ({ receivedAt: p.receivedAt, amount: a.amount })));
    const cum = (d) => pays.filter(p => p.receivedAt <= D.milestoneDate(period, d)).reduce((s, p) => s + p.amount, 0);
    const deduct = dep + extraMonths;
    const newRent = invs.filter(i => i.isNewStay && Q.invState(i).remaining <= 0.5).reduce((s, i) => s + lines(i)[0].amount, 0);
    const forfeit = S.all('depositLedger').filter(l => l.buildingId === bid && l.kind === 'forfeit_revenue' && l.period === period).reduce((s, l) => s + l.amount, 0);
    const md = TH.calc.params.milestones(Q.param('milestones', D.periodEnd(period))).days; // tham số mốc thu (SRC-05), mặc định 5/10/15
    return { J: rooms.length, K: rooms.reduce((s, r) => s + (r.listPrice || r.price || 0), 0), L: L0 - deduct, R5: cum(md[0]), R10: cum(md[1]), R15: cum(md[2]), msDays: md, deduct, Q: Qv, C: newRent + forfeit, caseTH1: deduct > 0 };
  };

  /* Dữ liệu nhập tay theo kỳ (SRS §2.3 mục 6, UI-25): ngày công sale, lương vệ sinh/bảo vệ theo tòa, tiền công thợ sửa chữa theo tòa (OQ-22),
     hỗ trợ/điều chỉnh theo người. Kỳ chạy song song lấy các khoản này từ Excel. */
  X.SALE_TITLES = ['SALE', 'NVKD', 'TNKD'];
  X.manualOf = (period) => S.where('payrollManual', x => x.period === period);
  X.manualSig = (period) => X.manualOf(period).map(x => [x.id, x.kind, x.employeeId, x.buildingId, x.line, x.amount, x.days].join(':')).sort().join('|');
  const guardManual = (period) => {
    _.need('payroll.manage');
    if (!/^\d{4}-\d{2}$/.test(period || '')) throw new Error('Chọn kỳ lương');
    _.guardPeriod(period, 'nhập dữ liệu lương');
    if (S.one('payrollRuns', r => r.period === period && r.status === 'closed')) throw new Error('Bảng lương kỳ đã chốt – dùng "Điều chỉnh sau khóa" hoặc điều chỉnh có vết');
  };
  X.setWorkdays = (period, employeeId, days) => {
    guardManual(period);
    const e = Q.emp(employeeId); if (!e || !X.SALE_TITLES.includes(e.title)) throw new Error('Ngày công chỉ nhập cho nhân viên kinh doanh');
    const n = Number(days); const max = TH.calc.dates.daysInMonth(period);
    if (!(n >= 0 && n <= max)) throw new Error(`Ngày công từ 0 đến ${max}`);
    const ex = S.one('payrollManual', x => x.period === period && x.kind === 'workdays' && x.employeeId === employeeId);
    if (ex) S.update('payrollManual', ex.id, { days: n, by: _.who() }); else S.add('payrollManual', { period, kind: 'workdays', employeeId, days: n, by: _.who() });
    _.audit('manual', 'payroll', period, `Ngày công ${e.name} kỳ ${F.periodShort(period)}: ${n}`); _.done();
  };
  X.addPayrollManual = (d) => {
    guardManual(d.period);
    const amount = Number(d.amount);
    if (d.kind === 'building_salary') {
      if ((S.get('periods', d.period) || {}).source === 'excel_parallel') throw new Error('Kỳ chạy song song: lương vệ sinh/bảo vệ theo tòa đã lấy từ Excel – không nhập thêm');
      if (!Q.building(d.buildingId)) throw new Error('Chọn tòa');
      if (!['sal_clean', 'sal_guard'].includes(d.line)) throw new Error('Chọn lương vệ sinh hoặc bảo vệ');
      if (!(amount > 0)) throw new Error('Nhập số tiền');
    } else if (d.kind === 'repair_labor') {
      const e = Q.emp(d.employeeId); if (!e || e.title !== 'KỸ THUẬT') throw new Error('Chọn thợ sửa chữa (chức danh Kỹ thuật)');
      if (!Q.building(d.buildingId)) throw new Error('Chọn tòa của việc sửa chữa');
      if (!(amount > 0)) throw new Error('Nhập tiền công');
    } else if (d.kind === 'manual_pay') {
      if (!Q.emp(d.employeeId)) throw new Error('Chọn nhân viên');
      if (!amount) throw new Error('Nhập số tiền (âm để giảm)');
      if (!String(d.note || '').trim()) throw new Error('Nhập nội dung hỗ trợ / điều chỉnh');
    } else throw new Error('Loại dữ liệu nhập tay không hợp lệ');
    const r = S.add('payrollManual', { period: d.period, kind: d.kind, employeeId: d.employeeId || null, buildingId: d.buildingId || null, line: d.line || null, amount, note: d.note || '', by: _.who() });
    _.audit('manual', 'payroll', d.period, `Nhập tay lương ${F.periodShort(d.period)}: ${d.kind} ${F.vnd(amount)}`); _.done(); return r;
  };
  X.removePayrollManual = (id) => {
    const r = S.get('payrollManual', id); if (!r) return; guardManual(r.period);
    S.remove('payrollManual', id); _.audit('manual', 'payroll', r.period, 'Xóa dòng nhập tay lương'); _.done();
  };
  /* Khoản theo tòa từ nhập tay: lương vệ sinh/bảo vệ (dòng 35/38) và tiền công thợ (dòng 41 "Sửa chữa", ghi thẳng vào tòa – OQ-22) */
  X.manualBuildingCosts = (period) => X.manualOf(period).filter(x => ['building_salary', 'repair_labor'].includes(x.kind))
    .map(x => ({ buildingId: x.buildingId, line: x.kind === 'repair_labor' ? 'repair' : x.line, amount: x.amount, kind: x.kind, employeeId: x.employeeId, note: x.note }));

  X.computePayroll = (period) => {
    _.need('payroll.manage');
    _.guardPeriod(period, 'tính lại bảng lương');
    const { lines, parallel, buildingCosts } = X.previewPayroll(period);
    const prev = S.where('payrollRuns', r => r.period === period);
    if (prev.some(r => r.status === 'closed')) throw new Error('Bảng lương kỳ đã chốt – mở lại bằng điều chỉnh');
    prev.forEach(r => S.remove('payrollRuns', r.id));
    const run = S.add('payrollRuns', { id: 'pr_' + period + '_' + (prev.length + 1), code: 'BL-' + period.replace('-', '') + '-v' + (prev.length + 1), period, status: 'draft', parallel, lines, buildingCosts, manualSig: X.manualSig(period), approvals: {}, computedAt: F.nowISO(), computedBy: _.who(),
      totalX: lines.reduce((s, l) => s + l.X, 0), totalW: lines.reduce((s, l) => s + l.W, 0) });
    _.audit('compute', 'payroll', run.id, `Tính thử bảng lương ${F.periodShort(period)}: ${lines.length} nhân viên`); _.done(); return run;
  };
  /* Tính không lưu (dùng cho báo cáo khi chưa có phiên lương) */
  X.previewPayroll = (period) => {
    const per = S.get('periods', period); const parallel = per && per.source === 'excel_parallel';
    const pEnd = D.periodEnd(period), d15 = D.milestoneDate(period, 15);
    const inputs = S.where('payrollInputs', x => x.period === period);
    const fixedPay = Q.param('newBuildingFixedPay', pEnd), leadRate = Q.param('leadPerRoom', pEnd);
    const lines = [];
    const M = X.manualOf(period); const divisor = Q.param('saleDivisor', pEnd) || 26;
    const msCfg = TH.calc.params.milestones(Q.param('milestones', pEnd));
    S.all('employees').filter(e => e.status === 'active' || (e.leftDate && e.leftDate >= D.periodStart(period))).forEach(e => {
      const over1y = P.over1y(e.hireDate, pEnd);
      let blds = [];
      if (OPS.includes(e.title)) {
        if (parallel && inputs.length) blds = inputs.filter(x => x.employeeId === e.id).map(x => {
          const r = P.buildingPay({ J: x.J, K: x.K, L: x.L, A: x.M + x.N + x.O, Q: x.Q, C: x.S, over1y, fixedPerRoom: x.fixedPerRoom });
          return Object.assign({ buildingId: x.buildingId, J: x.J, K: x.K, L: x.L, M1: x.M, M2: x.N, M3: x.O, Q: x.Q, C: x.S, source: 'SRC-03', excel: x.excel }, r);
        });
        else {
          const bids = S.all('assignments').filter(a => a.employeeId === e.id && a.responsibility === 'operate' && !a.roomId && a.from <= d15 && (!a.to || a.to >= d15)).map(a => a.buildingId);
          blds = bids.map(bid => {
            const inp = X.payrollBuildingInputs(period, bid); const b = Q.building(bid);
            const isNew = b.operatedFrom && D.diffDays(b.operatedFrom, pEnd) < 92;
            const ms = P.milestones({ R5: inp.R5, R10: inp.R10, R15: inp.R15, deduct: inp.deduct, w: msCfg.w });
            const r = P.buildingPay({ J: inp.J, K: inp.K, L: inp.L, A: ms.A, Q: inp.Q, C: inp.C, over1y, fixedPerRoom: isNew ? fixedPay : null });
            return Object.assign({ buildingId: bid, J: inp.J, K: inp.K, L: inp.L, M1: ms.M1, M2: ms.M2, M3: ms.M3, Q: inp.Q, C: inp.C, R5: inp.R5, R10: inp.R10, R15: inp.R15, msDays: msCfg.days, msW: msCfg.w, deduct: inp.deduct, source: 'web' }, r);
          });
        }
      }
      const W = blds.reduce((s, b) => s + b.W, 0);
      let lead = 0, leadNote = '';
      if (['TPVH', 'TNVH'].includes(e.title)) {
        const br = TH.auth.branchOf(e.id, d15); br.delete(e.id);
        const rooms = S.all('assignments').filter(a => br.has(a.employeeId) && a.responsibility === 'operate' && !a.roomId && a.from <= d15 && (!a.to || a.to >= d15)).reduce((s, a) => s + payRooms(a.buildingId).length, 0);
        lead = parallel && e.excel ? e.excel.lead : P.leadPay(rooms, leadRate);
        leadNote = parallel && e.excel ? 'Excel: ' + e.excel.leadF : `${leadRate}đ × ${rooms} phòng của nhánh`;
      }
      let base = e.baseSalary || 0, workdays = null;
      if (X.SALE_TITLES.includes(e.title)) {
        const wd = M.find(x => x.kind === 'workdays' && x.employeeId === e.id);
        workdays = wd ? wd.days : divisor;
        base = parallel && e.excel && !wd ? (e.excel.total - ((e.allowances || {}).lunch || 0) - ((e.allowances || {}).fuel || 0)) : P.salePay(e.baseSalary || 0, workdays, divisor);
      }
      const al = e.allowances || {};
      const laborRows = M.filter(x => x.kind === 'repair_labor' && x.employeeId === e.id);
      const labor = laborRows.reduce((s, x) => s + x.amount, 0);
      const manualPay = M.filter(x => x.kind === 'manual_pay' && x.employeeId === e.id).reduce((s, x) => s + x.amount, 0);
      const Xn = W + base + (al.lunch || 0) + (al.fuel || 0) + lead + (al.support || 0) + labor + manualPay;
      const flags = blds.filter(b => b.flag && b.flag !== 'Lương cố định').map(b => ({ buildingId: b.buildingId, flag: b.flag, HS: b.HS }));
      lines.push({ employeeId: e.id, title: e.title, over1y, buildings: blds, W, base, workdays, lunch: al.lunch || 0, fuel: al.fuel || 0, lead, leadNote, support: al.support || 0, labor, laborByB: laborRows.map(x => ({ buildingId: x.buildingId, amount: x.amount })), manualPay, divisor, X: Xn, flags, excelNet: e.excel ? e.excel.net : null });
    });
    return { lines, parallel, buildingCosts: X.manualBuildingCosts(period) };
  };
  X.approvePayFlag = (runId, key, note) => {
    _.need('payroll.manage');
    const run = S.get('payrollRuns', runId);
    _.guardPeriod(run.period, 'duyệt cờ bảng lương');
    if (run.status === 'closed') throw new Error('Bảng lương đã chốt');
    S.update('payrollRuns', runId, { approvals: Object.assign({}, run.approvals, { [key]: { by: _.who(), at: F.nowISO(), note } }) }); _.done();
  };
  X.closePayroll = (runId) => {
    _.need('payroll.manage');
    const run = S.get('payrollRuns', runId);
    _.guardPeriod(run.period, 'chốt bảng lương');
    if ((run.manualSig || '') !== X.manualSig(run.period)) throw new Error('Dữ liệu nhập tay đã đổi sau lần tính – bấm "Tính lại" trước khi chốt');
    const pending = run.lines.flatMap(l => l.flags.map(f => l.employeeId + ':' + f.buildingId)).filter(k => !run.approvals[k]);
    if (pending.length) throw new Error(`Còn ${pending.length} ca cần duyệt tay (HS>100 / HS<70 / không có phòng) trước khi chốt`);
    const byB = {};
    run.lines.forEach(l => l.buildings.forEach(b => { byB[b.buildingId] = (byB[b.buildingId] || 0) + b.W; }));
    const pDate = D.periodEnd(run.period);
    Object.entries(byB).filter(([, amt]) => Math.round(amt) > 0).forEach(([bid, amt]) => X.addExpense({ date: pDate, period: run.period, category: 'salary', reportLine: 'sal_mgr', scope: 'building', buildingId: bid, amount: Math.round(amt), source: 'payroll', refId: run.id, note: 'Lương quản lý (NV vận hành) – ' + run.code }, true));
    // Nhập tay theo tòa: lương vệ sinh/bảo vệ → dòng 35/38; tiền công thợ → dòng 41 của tòa (OQ-22)
    (run.buildingCosts || []).forEach(c => X.addExpense({ date: pDate, period: run.period, category: c.kind === 'repair_labor' ? 'repair' : 'salary', reportLine: c.line, scope: 'building', buildingId: c.buildingId, amount: c.amount, source: 'payroll', refId: run.id,
      note: (c.kind === 'repair_labor' ? 'Tiền công thợ ' + ((Q.emp(c.employeeId) || {}).name || '') : c.line === 'sal_clean' ? 'Lương vệ sinh' : 'Lương bảo vệ') + (c.note ? ' – ' + c.note : '') + ' – ' + run.code }, true));
    if (!run.parallel) {
      const fund = {};
      // Lương ngoài phần theo tòa (W) và tiền công thợ vào quỹ chung, kể cả lương trưởng phòng/nhóm 10.000đ/phòng – là chứng từ cho phân bổ UI-16.
      // Thợ sửa chữa: chỉ phần cố định vào quỹ "Lương sửa chữa" (OQ-22), tiền công đã ghi thẳng vào tòa.
      run.lines.forEach(l => { const f = FUND_OF[l.title]; if (!f) return; fund[f] = (fund[f] || 0) + l.X - l.W - (l.labor || 0); });
      Object.entries(fund).forEach(([f, amt]) => { if (amt > 0) X.addExpense({ date: pDate, period: run.period, category: 'salary', scope: 'fund', fundCode: f, amount: Math.round(amt), source: 'payroll', refId: run.id, note: 'Quỹ lương chung – ' + run.code }, true); });
    }
    S.update('payrollRuns', runId, { status: 'closed', closedAt: F.nowISO(), closedBy: _.who() });
    _.audit('close', 'payroll', runId, `Chốt bảng lương ${run.code}`); _.done();
  };
})(window.TH);
