/* Actions – bảng lương (UI-25, F08): tính thử theo mốc thu 5/10/15, cờ HS>100/HS<70 duyệt tay, chốt → chi phí theo tòa và quỹ chung. */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, P = TH.calc.payroll, D = TH.calc.dates;
  const OPS = ['NVVH', 'TNVH', 'TPVH'];
  const FUND_OF = { 'QL TỔNG': 'F_GM', TPVH: 'F_HEAD', TNVH: 'F_LEAD', 'THỊ TRƯỜNG': 'F_SOURCE', NVKD: 'F_SALES', SALE: 'F_SALES', TNKD: 'F_SALES', 'KẾ TOÁN': 'F_ACCT', 'KỸ THUẬT': 'F_REPAIR' };
  const POLICY_DEPARTMENTS = { operations: 'Vận hành', sales: 'Kinh doanh', technical: 'Kỹ thuật', market: 'Thị trường', finance: 'Tài chính – Kế toán' };
  const POLICY_MODES = { operations_hs: 'HS vận hành theo tòa', workday: 'Lương theo ngày công', repair: 'Lương kỹ thuật + tiền công', fixed: 'Lương cơ bản + phụ cấp', manual: 'Nhập tay có căn cứ' };
  const policyDepartment = title => OPS.includes(title) ? 'operations' : ['SALE', 'NVKD', 'TNKD', 'TPKD'].includes(title) ? 'sales' : title === 'KỸ THUẬT' ? 'technical' : title === 'THỊ TRƯỜNG' ? 'market' : title === 'KẾ TOÁN' ? 'finance' : null;
  Q.PAYROLL_DEPARTMENTS = POLICY_DEPARTMENTS; Q.PAYROLL_POLICY_MODES = POLICY_MODES;
  Q.payrollDepartmentKey = employee => policyDepartment(typeof employee === 'string' ? (Q.emp(employee) || {}).title : (employee || {}).title);
  Q.salaryPolicies = (at, all = false) => {
    const day = at || F.today(), rows = S.all('salaryPolicies').slice();
    return (all ? rows : rows.filter(p => (!p.effectiveFrom || p.effectiveFrom <= day) && (!p.effectiveTo || day <= p.effectiveTo))).sort((a, b) => String(a.department).localeCompare(String(b.department)) || String(b.effectiveFrom).localeCompare(String(a.effectiveFrom)));
  };
  Q.salaryPolicyFor = (employee, at) => {
    const e = typeof employee === 'string' ? Q.emp(employee) : employee, department = Q.payrollDepartmentKey(e); if (!e || !department) return null;
    return Q.salaryPolicies(at).filter(p => p.department === department && (!p.title || p.title === e.title)).sort((a, b) => Number(!!b.title) - Number(!!a.title) || String(b.effectiveFrom).localeCompare(String(a.effectiveFrom)))[0] || null;
  };
  X.saveSalaryPolicy = d => {
    _.need('settings.manage');
    const errs = {}, from = d.effectiveFrom || F.today(), title = d.title || null;
    if (!POLICY_DEPARTMENTS[d.department]) errs.department = 'Chọn phòng ban';
    if (!POLICY_MODES[d.mode]) errs.mode = 'Chọn cách tính';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) errs.effectiveFrom = 'Nhập ngày hiệu lực';
    if (!/^[-A-Za-z0-9_.]+$/.test(String(d.formulaVersion || ''))) errs.formulaVersion = 'Nhập phiên bản công thức, không dùng khoảng trắng';
    if (!['proposed', 'confirmed'].includes(d.status)) errs.status = 'Chọn trạng thái nghiệp vụ';
    if (!String(d.sourceRef || '').trim()) errs.sourceRef = 'Nhập nguồn/căn cứ';
    if (Object.keys(errs).length) { const e = new Error('Chính sách lương chưa hợp lệ'); e.fields = errs; throw e; }
    _.guardEffective(from, 'chính sách lương');
    const current = S.where('salaryPolicies', p => p.department === d.department && (p.title || null) === title && !p.effectiveTo).sort((a, b) => String(b.effectiveFrom).localeCompare(String(a.effectiveFrom)))[0];
    if (current && from <= current.effectiveFrom) throw new Error('Ngày hiệu lực phiên mới phải sau phiên hiện tại');
    if (current) S.update('salaryPolicies', current.id, { effectiveTo: D.addDays(from, -1) });
    const version = S.where('salaryPolicies', p => p.department === d.department && (p.title || null) === title).length + 1;
    const rec = S.add('salaryPolicies', { department: d.department, title, label: POLICY_DEPARTMENTS[d.department], mode: d.mode, effectiveFrom: from, effectiveTo: null, formulaVersion: String(d.formulaVersion).trim(), requiredInputs: Array.isArray(d.requiredInputs) ? d.requiredInputs : String(d.requiredInputs || '').split(',').map(x => x.trim()).filter(Boolean),
      status: d.status, sourceRef: String(d.sourceRef).trim(), approvedBy: d.status === 'confirmed' ? _.who() : null, approvedAt: d.status === 'confirmed' ? F.nowISO() : null, version, reason: String(d.reason || '').trim(), createdBy: _.who(), createdAt: F.nowISO() });
    _.audit('version', 'salaryPolicy', rec.id, `${POLICY_DEPARTMENTS[rec.department]} · ${rec.formulaVersion} · ${rec.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}`, { before: current || null, after: rec, reason: rec.reason || 'Tạo phiên chính sách', sourceRef: rec.sourceRef });
    _.done(); return rec;
  };
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
  X.manualSig = (period) => X.manualOf(period).map(x => [x.id, x.kind, x.employeeId, x.buildingId, x.line, x.amount, x.days].join(':')).concat(ledgerCosts(period).map(c => ['ledger', c.employeeId, c.buildingId, c.bearer || '', c.amount].join(':'))).sort().join('|');
  /* Phase 2: tiền công theo sổ sửa chữa đã xác nhận (UI-47) – act-repairs.js; không có thì rỗng */
  const ledgerCosts = (period) => (X.repairLaborCosts ? X.repairLaborCosts(period) : []);
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
    } else if (d.kind === 'ops_below70') {
      if (!Q.emp(d.employeeId)) throw new Error('Chọn nhân viên vận hành');
      if (!Q.building(d.buildingId)) throw new Error('Chọn tòa');
      if (!(amount > 0)) throw new Error('Nhập lương/phòng lớn hơn 0');
      if (!String(d.note || '').trim()) throw new Error('Nhập lý do áp dụng mức lương/phòng');
      const old = S.one('payrollManual', x => x.period === d.period && x.kind === 'ops_below70' && x.employeeId === d.employeeId && x.buildingId === d.buildingId);
      if (old) S.remove('payrollManual', old.id);
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
    const { lines, parallel, buildingCosts, salaryPolicySnapshot } = X.previewPayroll(period);
    const prev = S.where('payrollRuns', r => r.period === period);
    if (prev.some(r => r.status === 'closed')) throw new Error('Bảng lương kỳ đã chốt – mở lại bằng điều chỉnh');
    const version = Math.max(0, ...prev.map(r => Number(r.version) || Number(String(r.code || '').match(/-v(\d+)$/)?.[1]) || 1)) + 1;
    prev.filter(r => r.status !== 'superseded').forEach(r => S.update('payrollRuns', r.id, { status: 'superseded', supersededAt: F.nowISO(), supersededBy: _.who() }));
    const run = S.add('payrollRuns', { id: 'pr_' + period + '_' + version, code: 'BL-' + period.replace('-', '') + '-v' + version, version, period, status: 'draft', parallel, lines, buildingCosts, salaryPolicySnapshot, inputSig: F.hash(JSON.stringify({ lines, buildingCosts, salaryPolicySnapshot })), manualSig: X.manualSig(period), approvals: {}, computedAt: F.nowISO(), computedBy: _.who(),
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
    const ledger = ledgerCosts(period);
    S.all('employees').filter(e => e.status === 'active' || (e.leftDate && e.leftDate >= D.periodStart(period))).forEach(e => {
      const salaryPolicy = Q.salaryPolicyFor(e, pEnd);
      const over1y = P.over1y(e.hireDate, pEnd);
      let blds = [];
      if (OPS.includes(e.title)) {
        if (parallel && inputs.length) blds = inputs.filter(x => x.employeeId === e.id).map(x => {
          const r = P.buildingPay({ J: x.J, K: x.K, L: x.L, A: x.M + x.N + x.O, Q: x.Q, C: x.S, over1y, fixedPerRoom: x.fixedPerRoom });
          if (r.HS < 70 && !x.fixedPerRoom) {
            const man = M.find(z => z.kind === 'ops_below70' && z.employeeId === e.id && z.buildingId === x.buildingId);
            const v = man ? man.amount : x.excel && Number(x.excel.V) > 0 ? Number(x.excel.V) : 0;
            Object.assign(r, { V: v, W: v * x.J, rate: null, bound: null, manualApplied: !!man || !!(x.excel && Number(x.excel.V) > 0), manualReason: man ? man.note : 'Giữ đúng mức nhập từ SRC-03', rule: man ? 'Nhập tay: ' + man.note : 'Nhập từ SRC-03 (kỳ lịch sử)' });
          }
          return Object.assign({ buildingId: x.buildingId, J: x.J, K: x.K, L: x.L, M1: x.M, M2: x.N, M3: x.O, Q: x.Q, C: x.S, source: 'SRC-03', excel: x.excel }, r);
        });
        else {
          const bids = S.all('assignments').filter(a => a.employeeId === e.id && a.responsibility === 'operate' && !a.roomId && a.from <= d15 && (!a.to || a.to >= d15)).map(a => a.buildingId);
          blds = bids.map(bid => {
            const inp = X.payrollBuildingInputs(period, bid); const b = Q.building(bid);
            const isNew = b.operatedFrom && D.diffDays(b.operatedFrom, pEnd) < 92;
            const ms = P.milestones({ R5: inp.R5, R10: inp.R10, R15: inp.R15, deduct: inp.deduct, w: msCfg.w });
            const r = P.buildingPay({ J: inp.J, K: inp.K, L: inp.L, A: ms.A, Q: inp.Q, C: inp.C, over1y, fixedPerRoom: isNew ? fixedPay : null });
            if (r.HS < 70 && !isNew) {
              const man = M.find(z => z.kind === 'ops_below70' && z.employeeId === e.id && z.buildingId === bid);
              const v = man ? man.amount : 0;
              Object.assign(r, { V: v, W: v * inp.J, rate: null, bound: null, manualApplied: !!man, manualReason: man ? man.note : '', rule: man ? 'Nhập tay: ' + man.note : 'Chờ nhập tay lương/phòng và lý do' });
            }
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
      // Thợ sửa chữa (UI-47, SRC-16): phần cố định = lương cứng + thâm niên + ăn trưa theo hồ sơ thợ; kỳ song song Excel giữ nguyên số Excel
      const rp = !parallel && e.repairPay;
      if (rp) base = (rp.base || 0) + (rp.seniority || 0);
      if (X.SALE_TITLES.includes(e.title)) {
        const wd = M.find(x => x.kind === 'workdays' && x.employeeId === e.id);
        workdays = wd ? wd.days : divisor;
        base = parallel && e.excel && !wd ? (e.excel.total - ((e.allowances || {}).lunch || 0) - ((e.allowances || {}).fuel || 0)) : P.salePay(e.baseSalary || 0, workdays, divisor);
      }
      const al = e.allowances || {};
      const laborRows = M.filter(x => x.kind === 'repair_labor' && x.employeeId === e.id).concat(ledger.filter(x => x.employeeId === e.id));
      const labor = laborRows.reduce((s, x) => s + x.amount, 0);
      const manualPay = M.filter(x => x.kind === 'manual_pay' && x.employeeId === e.id).reduce((s, x) => s + x.amount, 0);
      const lunch = rp && rp.lunch != null ? rp.lunch : (al.lunch || 0);
      const Xn = W + base + lunch + (al.fuel || 0) + lead + (al.support || 0) + labor + manualPay;
      const flags = blds.filter(b => b.flag && b.flag !== 'Lương cố định').map(b => ({ buildingId: b.buildingId, flag: b.flag, HS: b.HS }));
      lines.push({ employeeId: e.id, title: e.title, department: Q.payrollDepartmentKey(e), salaryPolicy: salaryPolicy ? { id: salaryPolicy.id, department: salaryPolicy.department, title: salaryPolicy.title || null, mode: salaryPolicy.mode, formulaVersion: salaryPolicy.formulaVersion, status: salaryPolicy.status, sourceRef: salaryPolicy.sourceRef, effectiveFrom: salaryPolicy.effectiveFrom } : null,
        over1y, buildings: blds, W, base, workdays, lunch, fuel: al.fuel || 0, lead, leadNote, support: al.support || 0, labor, laborByB: laborRows.map(x => ({ buildingId: x.buildingId, amount: x.amount })), manualPay, divisor, X: Xn, flags, excelNet: e.excel ? e.excel.net : null });
    });
    const salaryPolicySnapshot = [...new Map(lines.filter(l => l.salaryPolicy).map(l => [l.salaryPolicy.id, l.salaryPolicy])).values()].map(p => JSON.parse(JSON.stringify(p)));
    return { lines, parallel, salaryPolicySnapshot, buildingCosts: X.manualBuildingCosts(period).concat(ledger.filter(c => c.bearer !== 'owner')) };
  };
  X.approvePayFlag = (runId, key, note) => {
    _.need('payroll.manage');
    const run = S.get('payrollRuns', runId);
    _.guardPeriod(run.period, 'duyệt cờ bảng lương');
    if (run.status !== 'draft') throw new Error('Chỉ duyệt ca của phiên nháp hiện hành');
    const [employeeId, buildingId] = key.split(':'); const line = run.lines.find(x => x.employeeId === employeeId); const building = line && line.buildings.find(x => x.buildingId === buildingId);
    if (building && building.HS != null && building.HS < 70 && !building.manualApplied) throw new Error('HS < 70: phải nhập lương/phòng và lý do, sau đó tính lại trước khi duyệt');
    S.update('payrollRuns', runId, { approvals: Object.assign({}, run.approvals, { [key]: { by: _.who(), at: F.nowISO(), note } }) }); _.done();
  };
  Q.payrollVersions = period => TH.auth.can('payroll.view') ? S.where('payrollRuns', r => r.period === period).slice().sort((a, b) => (b.version || Number(String(b.code || '').match(/-v(\d+)$/)?.[1]) || 1) - (a.version || Number(String(a.code || '').match(/-v(\d+)$/)?.[1]) || 1)) : [];
  Q.payrollRun = period => Q.payrollVersions(period).find(r => r.status !== 'superseded') || null;
  X.payrollStale = run => {
    if ((run.manualSig || '') !== X.manualSig(run.period)) return true;
    if (!run.inputSig || run.status === 'closed') return false;
    const { lines, buildingCosts, salaryPolicySnapshot } = X.previewPayroll(run.period);
    return run.inputSig !== F.hash(JSON.stringify({ lines, buildingCosts, salaryPolicySnapshot }));
  };
  X.approvePayrollRun = (runId, note) => {
    _.need('payroll.manage');
    const run = S.get('payrollRuns', runId);
    if (!run || run.status !== 'draft') throw new Error('Chỉ duyệt phiên nháp hiện hành');
    _.guardPeriod(run.period, 'duyệt bảng lương');
    if (!String(note || '').trim()) throw new Error('Nhập căn cứ duyệt bảng lương');
    if (X.payrollStale(run)) throw new Error('Dữ liệu nguồn đã đổi – bấm "Tính lại" trước khi duyệt');
    if (!run.parallel && run.lines.some(l => l.department && (!l.salaryPolicy || l.salaryPolicy.status !== 'confirmed'))) throw new Error('Còn chính sách lương chưa xác nhận');
    if (run.lines.some(l => l.buildings.some(b => b.HS != null && b.HS < 70 && !b.manualApplied))) throw new Error('Còn ca HS < 70 chưa nhập mức và lý do');
    if (run.lines.some(l => l.flags.some(f => !run.approvals[l.employeeId + ':' + f.buildingId]))) throw new Error('Còn ca lương cần duyệt tay');
    const approval = { by: _.who(), at: F.nowISO(), note: String(note).trim(), inputSig: run.inputSig };
    S.update('payrollRuns', run.id, { status: 'approved', approval });
    _.audit('approve', 'payroll', run.id, 'Duyệt bảng lương ' + run.code, { sourceRef: approval.note }); _.done(); return S.get('payrollRuns', run.id);
  };
  X.closePayroll = (runId) => {
    _.need('payroll.manage');
    const run = S.get('payrollRuns', runId);
    if (!run || !['draft', 'approved'].includes(run.status)) throw new Error('Phiên lương đã chốt hoặc đã được thay thế');
    _.guardPeriod(run.period, 'chốt bảng lương');
    if ((run.manualSig || '') !== X.manualSig(run.period)) throw new Error('Dữ liệu nhập tay đã đổi sau lần tính – bấm "Tính lại" trước khi chốt');
    if (!run.parallel) {
      const waiting = run.lines.filter(l => l.department && (!l.salaryPolicy || l.salaryPolicy.status !== 'confirmed'));
      if (waiting.length) throw new Error(`Còn ${waiting.length} nhân viên chưa có chính sách lương đã xác nhận`);
    }
    const missingBelow70 = run.lines.flatMap(l => l.buildings.filter(b => b.HS != null && b.HS < 70 && !b.manualApplied).map(b => l.employeeId + ':' + b.buildingId));
    if (missingBelow70.length) throw new Error(`Còn ${missingBelow70.length} ca HS < 70 chưa nhập lương/phòng và lý do`);
    const pending = run.lines.flatMap(l => l.flags.map(f => l.employeeId + ':' + f.buildingId)).filter(k => !run.approvals[k]);
    if (pending.length) throw new Error(`Còn ${pending.length} ca cần duyệt tay (HS>100 / HS<70 / không có phòng) trước khi chốt`);
    if (X.payrollStale(run)) throw new Error('Dữ liệu nguồn đã đổi – bấm "Tính lại" trước khi chốt');
    if (!run.parallel && run.status !== 'approved') throw new Error('Duyệt bảng lương trước khi chốt');
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
    const obligations = run.lines.filter(l => Math.round(l.X) > 0).map(l => ({ id: `${run.id}:employee:${l.employeeId}`, kind: 'employee', employeeId: l.employeeId, payee: (Q.emp(l.employeeId) || {}).name || l.employeeId, amount: Math.round(l.X), source: 'X', buildingId: null }))
      .concat((run.buildingCosts || []).filter(c => c.kind === 'building_salary' && !c.employeeId && Math.round(c.amount) > 0).map((c, i) => ({ id: `${run.id}:external:${c.buildingId}:${c.line}:${i + 1}`, kind: 'external', employeeId: null, payee: `${c.line === 'sal_clean' ? 'Vệ sinh' : 'Bảo vệ'} · ${(Q.building(c.buildingId) || {}).code || c.buildingId}`, amount: Math.round(c.amount), source: c.line, buildingId: c.buildingId })));
    S.update('payrollRuns', runId, { status: 'closed', obligations, closedAt: F.nowISO(), closedBy: _.who() });
    _.audit('close', 'payroll', runId, `Chốt bảng lương ${run.code}`); _.done();
  };

  const obligationRows = (run) => (run.obligations || []).map(o => {
    const paid = S.where('payrollDisbursements', d => d.payrollRunId === run.id && d.obligationId === o.id && d.status !== 'void').reduce((t, d) => t + Number(d.amount || 0), 0);
    const remaining = Math.max(0, Number(o.amount || 0) - paid);
    return Object.assign({}, o, { paid, remaining, status: remaining <= 0.5 ? 'paid' : paid > 0 ? 'partial' : 'unpaid' });
  });
  Q.payrollDisbursementSummary = (runId, obligationId) => {
    const run = S.get('payrollRuns', runId); if (!run) return { run: null, rows: [], obligation: null, total: 0, paid: 0, remaining: 0 };
    const rows = obligationRows(run); const selected = obligationId ? rows.find(o => o.id === obligationId) || null : null;
    return { run, rows, obligation: selected, total: rows.reduce((t, o) => t + o.amount, 0), paid: rows.reduce((t, o) => t + o.paid, 0), remaining: rows.reduce((t, o) => t + o.remaining, 0) };
  };
  X.recordPayrollDisbursement = (obligationId, d) => {
    _.need('payroll.manage');
    const run = S.one('payrollRuns', r => r.status === 'closed' && (r.obligations || []).some(o => o.id === obligationId));
    if (!run) throw new Error('Chỉ được chi nghĩa vụ của bảng lương đã chốt');
    const summary = Q.payrollDisbursementSummary(run.id, obligationId), obligation = summary.obligation;
    const amount = Number(d.amount), date = d.date, period = F.period(date || '');
    if (!(amount > 0)) throw new Error('Nhập số tiền chi lớn hơn 0');
    if (amount > obligation.remaining + 0.5) throw new Error(`Số chi vượt còn phải trả ${F.vnd(obligation.remaining)}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('Nhập ngày chi');
    const p = S.get('periods', period); if (!p) throw new Error(`Kỳ chi ${F.periodShort(period)} chưa được mở`);
    _.guardPeriod(period, 'ghi chi lương');
    if (!['bank', 'cash'].includes(d.method)) throw new Error('Chọn phương thức chi');
    const rec = S.add('payrollDisbursements', { code: S.nextCode('payrollDisbursements', 'CL-' + period.replace('-', '') + '-', 4), payrollRunId: run.id, obligationId, employeeId: obligation.employeeId || null, buildingId: obligation.buildingId || null, payee: obligation.payee,
      amount: Math.round(amount), paidAt: date, period, method: d.method, accountId: d.accountId || null, reference: String(d.reference || '').trim(), evidence: String(d.evidence || '').trim(), documentIds: d.documentIds || [], status: 'posted', createdAt: F.nowISO(), createdBy: _.who() });
    _.audit('pay', 'payrollDisbursement', rec.id, `Chi lương ${rec.code}: ${rec.payee} ${F.vnd(rec.amount)}`, { before: { remaining: obligation.remaining }, after: { remaining: obligation.remaining - rec.amount }, reason: d.reference || 'Giải ngân bảng lương', sourceRef: rec.evidence || rec.reference || null });
    _.done(); return rec;
  };
  X.voidPayrollDisbursement = (id, reason) => {
    _.need('payroll.manage');
    const rec = S.get('payrollDisbursements', id); if (!rec) throw new Error('Không tìm thấy giao dịch chi lương');
    if (rec.status === 'void') throw new Error('Giao dịch đã hủy');
    if (!String(reason || '').trim()) throw new Error('Nhập lý do hủy');
    _.guardPeriod(F.period(F.today()), 'hủy giao dịch chi lương');
    const before = { status: rec.status, amount: rec.amount };
    S.update('payrollDisbursements', id, { status: 'void', voidReason: reason.trim(), voidedAt: F.nowISO(), voidedBy: _.who() });
    _.audit('void', 'payrollDisbursement', id, `Hủy chi lương ${rec.code}: ${reason.trim()}`, { before, after: { status: 'void', amount: rec.amount }, reason: reason.trim(), sourceRef: rec.reference || rec.evidence || null });
    _.done(); return S.get('payrollDisbursements', id);
  };
})(window.TH);
