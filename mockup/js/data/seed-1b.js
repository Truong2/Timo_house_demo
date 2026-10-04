/* Dữ liệu mốc 1B – kỳ 08/2026 chạy song song Excel: input bảng lương SRC-03, dòng báo cáo SRC-04 theo tòa, quỹ phân bổ theo công thức G1 (SRC-07 C36–C46).
   Chạy trong TH.seed.build (hook seedExtras), không lưu localStorage. */
(function (TH) {
  const B = TH.data.bench202608;
  /* Quỹ phân bổ tháng 8 theo công thức G1 C36–C46 (mẫu số 1.382 phòng) */
  TH.data.allocRules = [
    { fundCode: 'F_GM', lineCode: 'sal_gm', label: 'Lương quản lý tổng', g1: '=(13000000/1382)*15' },
    { fundCode: 'F_HEAD', lineCode: 'sal_head', label: 'Lương trưởng phòng vận hành', surchargePerRoom: 10000, g1: '=(20000000/1382)*15+10000*15' },
    { fundCode: 'F_LEAD', lineCode: 'sal_lead', label: 'Lương phó phòng / trưởng nhóm VH', g1: '=(4000000/1382)*15' },
    { fundCode: 'F_SOURCE', lineCode: 'sal_source', label: 'Lương nhân viên nguồn', g1: '=(3000000/1382)*15' },
    { fundCode: 'F_SALES', lineCode: 'sal_sales', label: 'Lương NVKD', g1: "=(SUM('[18]THÁNG 8'!$Y$141/1382)*15)" },
    { fundCode: 'F_ACCT', lineCode: 'sal_acct', label: 'Lương kế toán', surchargePerRoom: 10000, fixedPerBuilding: 10000, g1: '=150000+10000+(2000000/1382)*15' },
    { fundCode: 'F_REPAIR', lineCode: 'sal_repair', label: 'Lương sửa chữa', g1: '=(25000000/1343)*15  ← Excel sót mẫu số tháng 7 (GĐ OQ-04)' },
    { fundCode: 'F_OFFICE', lineCode: 'office', label: 'Thuê & DV văn phòng', g1: "=('[19]THÁNG 8.26'!$B$12/1382)*15" },
    { fundCode: 'F_MKT', lineCode: 'marketing', label: 'Quỹ marketing', g1: "=('[19]THÁNG 8.26'!$F$10/1382)*15 + hoa hồng theo phòng" },
  ];
  const FUND08 = { F_GM: 13000000, F_HEAD: 20000000, F_LEAD: 4000000, F_SOURCE: 3000000, F_SALES: 57300001, F_ACCT: 2000000, F_REPAIR: 25000000, F_OFFICE: 53851231, F_MKT: 23681000 };
  const rowOf = {}; TH.data.catalog.reportLines.forEach(l => { rowOf[l.row] = l.code; });
  /* (đơn giá, cận) → thâm niên, suy từ công thức V của SRC-03 */
  const seniorityFrom = (vf) => {
    const m = String(vf || '').match(/\*(\d+)\/(\d+)/); if (!m) return null;
    const rate = +m[1], bound = +m[2];
    for (const [a, u, o] of TH.calc.payroll.TIERS) {
      if ((bound === a && o[0] === rate) || (bound === a + 5 && o[1] === rate)) return true;
      if ((bound === a && u[0] === rate) || (bound === a + 5 && u[1] === rate)) return false;
    }
    return null;
  };

  TH.data.seedExtras = (st) => {
    if (!B) return;
    const empByKey = {}; st.employees.forEach(e => { empByKey[e.key] = e; });
    const bId = (code) => {
      const c = String(code).trim().toUpperCase();
      if (!st.buildings.some(x => x.code === c)) st.buildings.push({ id: 'b_' + c, code: c, group: TH.f.groupOf(c) || 'G', areaId: st.areas[0].id, level: null, address: '(chỉ có trong bảng lương T8 – tòa mới nhận)', status: 'active', template: 'G1_TECH', accountId: 'acc_g1', ownerRent: 0, operatedFrom: '2026-07-01', floors: null, vendor: null });
      return 'b_' + c;
    };
    /* --- nhân viên: lương cứng, phụ cấp, thâm niên --- */
    st.payrollInputs = [];
    B.payroll.forEach(p => {
      const e = empByKey[p.key]; if (!e) return;
      e.baseSalary = p.base; e.allowances = { lunch: p.lunch, fuel: p.fuel, support: p.support };
      e.excel = { lead: p.lead, total: p.total, net: p.net, leadF: p.leadF, baseF: p.baseF };
      const sen = p.buildings.map(b => seniorityFrom(b.Vf)).find(x => x != null);
      if (sen === true) e.hireDate = '2024-03-01'; else if (sen === false) e.hireDate = '2026-01-15';
      p.buildings.forEach(b => {
        st.payrollInputs.push({ id: 'pi_' + e.id + '_' + b.b + '_' + b.row, period: '2026-08', employeeId: e.id, buildingId: bId(b.b), J: b.J, K: b.K, L: b.L, M: b.M, N: b.N, O: b.O, Q: b.Q, S: b.S,
          fixedPerRoom: /^\d+(\.0)?$/.test(String(b.V)) && !b.Vf.startsWith('=') ? b.V : null,
          excel: { T: b.T, U: b.U, V: b.V, W: b.W, Vf: b.Vf, Lf: b.Lf, Mf: b.Mf, row: b.row }, source: 'SRC-03' });
      });
    });
    /* --- phòng tính lương / mẫu số phân bổ tháng 8 --- */
    st.roomBasis = [];
    const jBy = {}; st.payrollInputs.forEach(x => { jBy[x.buildingId] = (jBy[x.buildingId] || 0) + (x.J || 0); });
    Object.entries(jBy).forEach(([b, r]) => st.roomBasis.push({ id: 'rb_08_' + b, period: '2026-08', buildingId: b, rooms: r, source: 'SRC-03 cột J' }));
    /* --- dòng báo cáo Excel theo tòa (đối chiếu) + doanh thu kỳ song song --- */
    st.benchLines = [];
    Object.entries(B.report.byBuilding).forEach(([code, o]) => {
      Object.entries(o.v).forEach(([row, val]) => { const c = rowOf[row]; if (c) st.benchLines.push({ period: '2026-08', buildingId: bId(code), code: c, value: val }); });
    });
    /* --- chi phí tháng 8 theo tòa (nguồn Excel, ghi 1 lần) --- */
    const add = (o) => { st.expenses.push(Object.assign({ id: 'exp_b08_' + st.expenses.length, code: 'CP-202608-X' + String(st.expenses.length + 1).padStart(4, '0'), date: '2026-08-25', period: '2026-08', enteredAt: '2026-08-31', method: 'bank', source: 'bench', status: 'posted', enteredBy: 'Import Excel SRC-04' }, o)); };
    const CATOF = { cost_el: 'util_electric', cost_wa: 'util_water', cost_net: 'util_internet', cost_garbage: 'util_garbage', cost_env: 'util_env', cost_elev: 'util_elevator', repair: 'repair', other: 'other' };
    const excelRooms = (code) => { const v = (B.report.byBuilding[code] || {}).v || {}; return v[30] ? Math.round(v[30] * 1382 / 13000000) : 0; };
    Object.entries(B.report.byBuilding).forEach(([code, o]) => {
      const v = o.v, b = bId(code);
      if (!st.buildings.some(x => x.id === b)) return;
      Object.entries(CATOF).forEach(([line, cat]) => { const row = TH.data.catalog.reportLines.find(l => l.code === line).row; if (v[row]) add({ category: cat, reportLine: line, scope: 'building', buildingId: b, amount: v[row], note: 'Excel T8 – ' + TH.data.catalog.reportLines.find(l => l.code === line).label }); });
      if (v[21]) { const eid = 'exp_b08_' + st.expenses.length; add({ category: 'equipment', reportLine: 'cost_equip', scope: 'building', buildingId: b, amount: v[21], isEquipment: true, depMonths: 63, note: 'Mua sắm thiết bị T8' });
        // tài sản công ty UI-34: 63 tháng = 1,6%/tháng (GĐ OQ-11) – khấu hao T8 không đổi (566.080)
        st.assets.push({ id: 'as_08_' + code, code: 'TS-' + code + '-001', name: 'Thiết bị mua T8/2026', type: 'other', ownership: 'company', buildingId: b, roomId: null, position: 'Theo chứng từ Excel T8', qty: 1, condition: 'good',
          receivedDate: '2026-08-25', cost: v[21], depStart: '2026-08-25', depMonths: 63, depreciationPolicyStatus: 'legacy_assumption', depreciationSource: 'Giả định lịch sử 63 tháng – OQ-11 chưa xác nhận', openingPeriod: null, warrantyTo: null, source: 'expense', expenseId: eid, ownerContractId: null, capitalRef: null, docs: [], note: 'SRC-04 dòng 22 (mua sắm thêm thiết bị)', status: 'active', disposal: null,
          history: [{ at: '2026-08-31T17:00:00', date: '2026-08-25', by: 'Import Excel SRC-04', kind: 'create', after: { buildingId: b, roomId: null, position: '' }, reason: 'Chi mua sắm UI-15' }] }); }
      if (v[35]) add({ category: 'salary', reportLine: 'sal_clean', scope: 'building', buildingId: b, amount: v[35], note: 'Lương vệ sinh theo tòa (Excel T8)' });
      if (v[38]) add({ category: 'salary', reportLine: 'sal_guard', scope: 'building', buildingId: b, amount: v[38], note: 'Lương bảo vệ (Excel T8)' });
      const comm = (v[40] || 0) - FUND08.F_MKT * excelRooms(code) / 1382;
      if (comm > 1) add({ category: 'commission', reportLine: 'marketing', scope: 'building', buildingId: b, amount: Math.round(comm * 100) / 100, note: 'Hoa hồng theo phòng T8 (tách từ phí marketing Excel)' });
    });
    Object.entries(FUND08).forEach(([f, amt]) => { const r = TH.data.allocRules.find(x => x.fundCode === f); add({ category: f === 'F_OFFICE' ? 'office' : f === 'F_MKT' ? 'marketing' : 'salary', reportLine: r.lineCode, scope: 'fund', fundCode: f, amount: amt, note: 'Quỹ chung T8 theo công thức G1 ' + r.g1 }); });
    st.expenses.forEach(e => { if (e.isEquipment == null) e.isEquipment = false; });
    st.payrollRuns = []; st.payrollDisbursements = []; st.allocationRuns = [];
  };
})(window.TH);
