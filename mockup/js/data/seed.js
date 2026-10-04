/* Dựng state gốc từ dữ liệu sinh (seed-*.js) + danh mục (catalog.js). Không ghi localStorage. */
(function (TH) {
  const Seed = {};
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0); };

  Seed.build = () => {
    const D = TH.data, M = D.master, P = D.p202609, CAT = D.catalog;
    const st = {};
    const col = (name, arr) => { st[name] = arr; };

    /* --- danh mục --- */
    col('params', [...CAT.params.map((p, i) => Object.assign({ id: 'prm_' + i }, p)), ...(CAT.policyParams || []).map((p, i) => Object.assign({ id: 'policy_' + i }, p))]);
    col('accounts', CAT.accounts.map(a => Object.assign({ version: 1, effectiveFrom: '1900-01-01', effectiveTo: null, sourceRef: 'SRC-08 – cấu hình tài khoản nhận tiền' }, a)));
    col('areas', M.areas.map(a => Object.assign({}, a)));
    const accByTpl = {}; CAT.accounts.forEach(a => { accByTpl[a.template] = a.id; });

    /* --- nhân viên, người dùng, tổ chức --- */
    const emps = M.employees.map((e, i) => ({ id: 'emp_' + e.key.replace(/\W+/g, '_'), key: e.key, code: 'NV-' + String(i + 1).padStart(4, '0'), name: e.name, title: e.title, status: 'active',
      hireDate: ['2023-', '2024-', '2025-'][hash('hire' + e.key) % 3] + String(1 + hash('hm' + e.key) % 12).padStart(2, '0') + '-01', phone: '09' + String(10000000 + hash('ph' + e.key) % 89999999) }));
    const empByKey = {}; emps.forEach(e => { empByKey[e.key] = e; });
    col('employees', emps);
    col('users', CAT.users.map(u => ({ id: 'u_' + u.username, username: u.username, role: u.role, employeeId: (empByKey[u.empKey] || {}).id || null, shareholderId: u.shKey ? 'sh_' + u.shKey : null, name: (empByKey[u.empKey] || {}).name || u.display, display: u.display, status: 'active', phase: u.phase || null })));

    /* --- tòa, phòng --- */
    // Mã tòa chuẩn hóa in hoa: nguồn Excel ghi lẫn s8/S8, t20/T20… → gộp bản ghi trùng (bản in hoa ưu tiên, bản thường bù thông tin thiếu), nhóm T/S/G theo tiền tố mã
    const bmap = {};
    M.buildings.forEach(b => { const code = String(b.code).trim().toUpperCase(); const grp = 'TSG'.includes(code[0]) ? code[0] : b.group; const cur = bmap[code];
      bmap[code] = cur ? Object.assign({}, b, cur, { code, group: grp, ownerRent: cur.ownerRent || b.ownerRent, vendor: cur.vendor || b.vendor, level: cur.level || b.level, managerKey: cur.managerKey || b.managerKey }) : Object.assign({}, b, { code, group: grp }); });
    const UB = (c) => 'b_' + String(c).trim().toUpperCase();
    const buildings = Object.values(bmap).map(b => ({ id: 'b_' + b.code, code: b.code, group: b.group, areaId: b.areaId, level: b.level, address: b.address, status: 'active', floorAreaM2: b.floorAreaM2 || null, businessRegistration: b.businessRegistration || '', features: b.features || '',
      template: b.template, accountId: accByTpl[b.template], ownerRent: b.ownerRent || 0, managerKey: b.managerKey,
      operatedFrom: '2024-' + String(1 + hash('op' + b.code) % 12).padStart(2, '0') + '-01', floors: 3 + hash('fl' + b.code) % 5, vendor: b.vendor || null }));
    const bByCode = {}; buildings.forEach(b => { bByCode[b.code] = b; });
    // Cấu hình demo: các tòa S do một quản lý phụ trách nhận tiền vào TK mẫu HĐ (VP-HẰNG) – admin đổi ở Cài đặt → TK nhận tiền
    buildings.filter(b => b.group === 'S' && b.managerKey === 'NV99146292').forEach(b => { b.template = 'VP_HANG'; b.accountId = accByTpl.VP_HANG; });
    // tòa mới nhận (G12A, G13, G14… và các tòa đầu kỳ 2026) → mốc 3 tháng lương cố định
    ['G12A', 'G13', 'G14', 'G15', 'G16', 'G17', 'G18'].forEach((c, i) => { if (bByCode[c]) bByCode[c].operatedFrom = ['2026-06-01', '2026-06-15', '2026-07-01', '2026-08-01', '2026-09-01', '2026-09-01', '2026-09-01'][i]; });
    col('buildings', buildings);
    const rooms = M.rooms.map(r => ({ id: 'r_' + r.code, code: r.code, buildingId: UB(r.b), number: r.number, floor: r.floor, listPrice: r.list, mgmtPrice: r.mgmt, price: r.price,
      exploitation: r.exploitation === 'timehouse' && !r.price ? 'owner_live' : r.exploitation, status: r.status, type: r.number && r.number % 100 >= 5 ? 'Studio' : 'Phòng đơn' }));
    const rByCode = {}; rooms.forEach(r => { rByCode[r.code] = r; });
    col('rooms', rooms);

    /* --- chủ nhà & HĐ đầu vào (giá theo tiền thuê 1 tháng của báo cáo T8) --- */
    const owners = [], ownerContracts = [], ownerRateVersions = [];
    buildings.forEach((b, i) => {
      const oid = 'own_' + b.code;
      owners.push({ id: oid, code: 'CN-' + b.code, name: (b.vendor && b.vendor.electric && b.vendor.electric.holder) || ('Chủ nhà ' + b.code), phone: '09' + String(10000000 + hash('own' + b.code) % 89999999), idNo: '0' + String(10000000000 + hash('oid' + b.code) % 89999999999).slice(0, 11), bank: ['Vietcombank', 'BIDV', 'Techcombank', 'MB Bank'][i % 4] });
      const start = b.operatedFrom;
      // G17 (tòa mới nhận T9, chưa có trong báo cáo T8): giá HĐ chủ nhà demo, trả hằng tháng – để minh họa bù trừ khách của chủ nhà (OQ-14)
      const demoRent = b.code === 'G17' && !b.ownerRent;
      const rent = b.ownerRent || (demoRent ? 40000000 : 0);
      const cycle = demoRent ? 1 : [1, 3, 3, 6][hash('cy' + b.code) % 4];
      ownerContracts.push({ id: 'oc_' + b.code, code: 'HĐCN-' + b.code, buildingId: b.id, ownerId: oid, signDate: start, startDate: start, endDate: String(Number(start.slice(0, 4)) + 5) + start.slice(4), deposit: Math.round(rent * 2), payCycleMonths: cycle, payDay: 5, status: 'active', holdPriceTo: null, terms: '', operator: null, buildingFeatures: '', businessRegistration: '', sourceRef: 'Dữ liệu nguồn Excel', note: '' });
      if (rent) ownerRateVersions.push({ id: 'orv_' + b.code + '_1', contractId: 'oc_' + b.code, from: start, to: null, monthlyRent: rent, reason: demoRent ? 'Giá HĐ demo (tòa mới nhận, chưa có trong báo cáo T8)' : 'Giá theo HĐ (tiền thuê 1 tháng – báo cáo T8/2026)' });
    });
    col('owners', owners); col('ownerContracts', ownerContracts); col('ownerRateVersions', ownerRateVersions);
    const ownerPayments = [];
    ownerContracts.forEach(oc => {
      const rv = ownerRateVersions.find(v => v.contractId === oc.id); if (!rv) return;
      for (let m = 1; m <= 12; m += oc.payCycleMonths) {
        const from = '2026-' + String(m).padStart(2, '0') + '-01'; if (from < oc.startDate.slice(0, 8) + '01') continue;
        const due = TH.calc.dates.addDays(from, oc.payDay - 1);
        const amount = rv.monthlyRent * oc.payCycleMonths;
        const wasPaid = due <= '2026-09-10';
        ownerPayments.push({ id: 'op_' + oc.id + '_' + m, contractId: oc.id, buildingId: oc.buildingId, from, months: oc.payCycleMonths, dueDate: due, amountDue: amount, paid: wasPaid ? amount : 0, paidAt: wasPaid ? due : null,
          payments: wasPaid ? [{ amount, date: due, method: 'bank', reference: 'Dữ liệu lịch sử', evidence: 'Nguồn Excel lịch trả chủ nhà', by: 'Import Excel', at: due + 'T09:00:00' }] : [] });
      }
    });
    col('ownerPayments', ownerPayments);

    /* --- khách, lượt thuê --- */
    col('customers', M.customers.map(c => ({ id: c.id, name: c.name, phone: c.phone, idNo: c.idNo, occupation: c.occupation, zaloLinked: c.zalo })));
    const stays = M.stays.map(s => ({ id: 'st_' + s.code, code: s.code, roomId: 'r_' + s.room, buildingId: UB(s.b), customerId: s.customerId, status: s.status, endType: s.endType || null,
      breachReason: s.breachReason || null, moveInDate: s.moveIn, rentStart: s.rentStart, svcStart: s.svcStart, endDate: s.endDate, stopBillingDate: s.status === 'ended' ? s.endDate : null,
      depositAmount: s.deposit || 0, depositStatus: s.depositStatus, rent: s.rent || 0, listPrice: s.list || 0, people: s.people || 1, vehicles: 0, payMonths: s.payMonths || 1, source: s.source }));
    const stByCode = {}; stays.forEach(s => { stByCode[s.code] = s; });
    // Excel không ghi lượt thuê cũ đã kết thúc khi phòng có khách mới trong tháng 9 (6 phòng) → một phòng không có hai lượt "đang ở":
    // lượt cũ kết thúc (hết hạn) ngày trước khi khách mới tính tiền phòng; chỉ số kỳ sau chỉ sinh cho khách mới.
    const actByRoom = {}; stays.filter(s => s.status === 'active').forEach(s => { (actByRoom[s.roomId] = actByRoom[s.roomId] || []).push(s); });
    Object.values(actByRoom).filter(a => a.length > 1).forEach(a => {
      a.sort((x, y) => String(x.rentStart).localeCompare(String(y.rentStart)));
      const last = a[a.length - 1];
      a.slice(0, -1).forEach(s => { const end = TH.calc.dates.addDays(last.rentStart, -1); Object.assign(s, { status: 'ended', endType: 'expired', endDate: end, stopBillingDate: end, handoverDate: end, depositStatus: 'refund_pending', endReason: 'Suy từ dữ liệu: phòng có khách mới ' + last.code + ' từ ' + last.rentStart }); });
    });
    // Excel có khách mới đã cọc tháng 10 (lượt chờ nhận) nhưng không ghi khách cũ báo trả → khách cũ báo trả trước 30 ngày, dự kiến bàn giao ngày trước khi khách mới tính tiền
    // (chỉ ghi báo trả, chưa kết thúc: hóa đơn, lương, báo cáo không đổi; kết thúc lượt cũ rồi mới nhận phòng được).
    stays.filter(s => s.status === 'pending').forEach(p => {
      const a = (actByRoom[p.roomId] || []).find(s => s.status === 'active');
      if (!a || !p.rentStart || (a.endDate && a.endDate < p.rentStart)) return;
      Object.assign(a, { noticeDate: TH.calc.dates.addDays(p.rentStart, -30), plannedLeaveDate: TH.calc.dates.addDays(p.rentStart, -1), endReason: 'Suy từ dữ liệu: khách mới ' + p.code + ' đã cọc, tính tiền từ ' + p.rentStart });
    });
    col('stays', stays);

    /* --- hóa đơn kỳ 2026-09 (đã phát hành từ Excel) + biểu phí suy từ dòng hóa đơn --- */
    const B = TH.calc.billing;
    const invoices = [], rateVersions = [], readings = [];
    const rateBy = {};
    P.invoices.forEach(iv => {
      const s = stByCode[iv.stay]; const b = bByCode[String(iv.b).toUpperCase()];
      const lines = iv.isBreach ? B.breachLines(iv.lines) : B.expand(iv.lines);
      // Tổng cần đóng = tổng các dòng in (web là nguồn sự thật); số Excel giữ ở excel.total để gắn cờ lệch nguồn
      const due = iv.isBreach ? iv.breachDue : B.total(lines);
      invoices.push({ id: 'inv_' + iv.code, code: iv.code, period: iv.period, stayId: s.id, roomId: s.roomId, buildingId: s.buildingId, customerCode: iv.stay,
        template: b ? b.template : 'VP', accountId: b ? b.accountId : null, issueDate: iv.issueDate, cutoff: iv.cutoff, dueFrom: iv.dueFrom, dueTo: iv.dueTo, lifecycle: 'issued',
        isNewStay: iv.isNewStay, isBreach: iv.isBreach, lines, totalDue: Math.round(due * 100) / 100, note: iv.note || '',
        excel: { total: iv.excelTotal, paid: iv.excelPaid, status: iv.excelStatus, src: iv.src, hardTotal: iv.hardTotal, lines: iv.isBreach ? iv.lines : null, svcFactor: iv.svcFactor },
        issuedBy: 'Import Excel SRC-08', issuedAt: iv.issueDate });
      // biểu phí từ đơn giá dòng hóa đơn
      const L = B.expand(iv.lines); const get = (no) => L[no - 1];
      const items = {};
      if (get(3).unit) items.electric = { unit: get(3).unit, method: 'meter' };
      if (get(4).unit) items.water = { unit: get(4).unit, method: get(4).prev != null || get(4).curr != null ? 'meter' : 'person' };
      [['cleaning', 5], ['internet', 6], ['elevator', 7], ['ev', 8], ['washer', 9], ['combo', 10]].forEach(([k, no]) => { const l = get(no); if (l.unit && l.qty) items[k] = { unit: l.unit, method: k === 'internet' || k === 'cleaning' ? 'room' : k === 'ev' ? 'vehicle' : 'person', qty: l.qty }; });
      if (get(8).qty) s.vehicles = get(8).qty;
      const rent = s.rent || (L[0].unit);
      const rv = { id: 'rv_' + s.code + '_1', stayId: s.id, from: s.rentStart || '2026-01-01', to: null, rent, items, reason: 'Biểu phí theo hợp đồng (đối chiếu đơn giá hóa đơn T9)', source: 'SRC-08', createdAt: '2026-08-22' };
      rateVersions.push(rv); rateBy[s.id] = rv;
      rateBy['b:' + s.buildingId] = rateBy['b:' + s.buildingId] || rv;
      // chỉ số kỳ dịch vụ 9 (chốt 22/08)
      const el = get(3), wa = get(4);
      if (el.curr != null || el.prev != null) readings.push({ id: 'rd_' + s.code + '_2026-09', period: '2026-09', roomId: s.roomId, stayId: s.id, buildingId: s.buildingId, elPrev: el.prev || 0, elCurr: el.curr || el.prev || 0,
        waPrev: wa.prev, waCurr: wa.curr, people: s.people, vehicles: s.vehicles, readAt: '2026-08-22', enteredBy: 'Import Excel', locked: true, source: 'SRC-08' });
    });
    // lượt thuê đang chờ (đã cọc tháng 10): biểu phí theo tòa
    stays.filter(s => s.status === 'pending').forEach(s => {
      const base = rateBy['b:' + s.buildingId];
      const rv = { id: 'rv_' + s.code + '_1', stayId: s.id, from: s.rentStart, to: null, rent: s.rent, items: base ? JSON.parse(JSON.stringify(base.items)) : { electric: { unit: 4000, method: 'meter' }, water: { unit: 120000, method: 'person' }, internet: { unit: 100000, method: 'room', qty: 1 } }, reason: 'Biểu phí mặc định theo tòa (khách đã cọc, chờ vào ở)', source: 'catalog', createdAt: '2026-09-20' };
      if (rv.items.electric && rv.items.electric.method) rv.items.electric.method = 'meter';
      rateVersions.push(rv);
    });
    col('invoices', invoices); col('rateVersions', rateVersions);
    /* Phiên HĐ v1 idempotent cho dữ liệu cũ. Đây là snapshot điều khoản, không phải collection HĐ thứ hai. */
    col('stayVersions', stays.map(s => { const rv = rateVersions.filter(v => v.stayId === s.id).sort((a, b) => String(a.from).localeCompare(String(b.from)))[0]; return {
      id: 'sv_' + s.id + '_1', stayId: s.id, version: 1, effectiveFrom: s.rentStart, kind: 'legacy_migration',
      terms: { roomId: s.roomId, buildingId: s.buildingId, customerId: s.customerId, dealDate: s.dealDate || null, moveInDate: s.moveInDate, rentStart: s.rentStart, svcStart: s.svcStart, endDate: s.endDate, depositAmount: s.depositAmount, payMonths: s.payMonths, people: s.people, vehicles: s.vehicles },
      rates: rv ? { rent: rv.rent, items: JSON.parse(JSON.stringify(rv.items || {})), rateVersionId: rv.id } : { rent: s.rent, items: {} }, sourceRef: s.source || 'legacy', documentIds: [], reason: 'Khởi tạo phiên v1 từ dữ liệu nguồn', createdBy: 'Hệ thống', createdAt: '2026-09-01T00:00:00.000Z'
    }; }));
    // Phòng "Khách của chủ nhà" (UI-03, §3.12e): theo ghi chú hóa đơn nguồn "kh chủ nhà / kh của chủ nhà" (tòa mới nhận G15, G17)
    invoices.filter(i => /kh (của )?chủ nhà/i.test(i.note || '')).forEach(i => { const r = rooms.find(x => x.id === i.roomId); if (r && r.price > 0) r.exploitation = 'owner_tenant'; });

    /* --- chỉ số kỳ 10 (chốt 22/09): dữ liệu demo sinh xác định, có vài ca thiếu/bất thường để minh họa E10 --- */
    readings.slice().forEach(r0 => {
      const s = stays.find(x => x.id === r0.stayId);
      if (!s || s.status !== 'active') return;
      const hv = hash('oct' + r0.stayId);
      if (hv % 97 === 0) return; // thiếu chỉ số
      const use = Math.max(0, Math.round((r0.elCurr - r0.elPrev) * (0.8 + (hv % 40) / 100))) || (40 + hv % 120);
      const r = { id: 'rd_' + s.code + '_2026-10', period: '2026-10', roomId: r0.roomId, stayId: r0.stayId, buildingId: r0.buildingId, elPrev: r0.elCurr, elCurr: r0.elCurr + use,
        waPrev: r0.waCurr, waCurr: r0.waCurr != null ? r0.waCurr + (hv % 6) : null, people: r0.people, vehicles: r0.vehicles, readAt: '2026-09-22', enteredBy: 'Demo (sinh)', locked: false, source: 'demo' };
      if (hv % 211 === 5) { r.elCurr = r.elPrev - 12; r.anomaly = 'decrease'; }
      readings.push(r);
    });
    // phòng trống / phá HĐ không thu được (UI-10 tab phòng trống)
    P.vacantUtil.forEach((v, i) => {
      const room = rByCode[v.room];
      readings.push({ id: 'rdv_' + i, period: '2026-09', roomId: room ? room.id : null, roomCode: v.room, buildingId: room ? room.buildingId : null, vacant: true, reason: v.note || 'Phòng trống',
        elPrev: v.elPrev, elCurr: v.elCurr, elUnit: v.elPrice, elAmount: v.elAmt, waPrev: v.waPrev || null, waCurr: v.waCurr || null, waUnit: v.waPrice, waAmount: v.waAmt, readAt: '2026-08-22', source: 'SRC-08', locked: true });
    });
    col('meterReadings', readings);
    // Demo điện chung (UI-10, dòng 12): nhóm phòng tầng 2–3 tòa G1 dùng chung đồng hồ hành lang, chỉ số kỳ 10 (dữ liệu sinh)
    const g1Rooms = rooms.filter(r => r.buildingId === 'b_G1' && r.exploitation !== 'meter_common' && r.floor >= 2 && r.floor <= 3).map(r => r.id);
    col('sharedMeterGroups', g1Rooms.length >= 2 ? [{ id: 'smg_G1_1', buildingId: 'b_G1', name: 'Hành lang tầng 2–3 G1', roomIds: g1Rooms, method: 'rooms', unit: 3500, active: true, meterCode: 'ĐC-G1-01', source: 'demo' }] : []);
    if (g1Rooms.length >= 2) readings.push({ id: 'rdc_G1_1_2026-10', period: '2026-10', groupId: 'smg_G1_1', buildingId: 'b_G1', kind: 'common', elPrev: 12040, elCurr: 12400, readAt: '2026-09-22', enteredBy: 'Demo (sinh)', source: 'demo', locked: false });

    /* --- phiếu thu --- */
    const invByCode = {}; invoices.forEach(i => { invByCode[i.code] = i; });
    const accountant = (st.users.find(u => u.role === 'ketoan') || {});
    col('payments', P.payments.map(p => {
      const inv = p.invoice ? invByCode[p.invoice] : null; const s = stByCode[p.stay];
      return { id: 'pay_' + p.code, code: p.code, type: p.kind, stayId: s.id, customerId: s.customerId, buildingId: s.buildingId, receivedAt: p.date, enteredAt: p.date, dateSource: p.dateSource,
        method: p.method, accountId: inv ? inv.accountId : (bByCode[s.buildingId.slice(2)] || {}).accountId, amount: p.amount, receivedBy: accountant.name || 'Kế toán', recordedBy: 'Import Excel',
        allocations: inv ? [{ invoiceId: inv.id, amount: p.amount }] : [], unallocated: inv ? 0 : (p.kind === 'prepay' ? p.amount : 0), forPeriod: p.period, status: 'posted' };
    }));
    // phá HĐ: số đã thu theo DS phòng phá HĐ (thay cho tổng đã đóng của dòng khách cũ)
    invoices.filter(i => i.isBreach).forEach(i => {
      const pays = st.payments.filter(p => p.allocations.some(a => a.invoiceId === i.id));
      const src = P.invoices.find(x => x.code === i.code);
      const target = src.breachPaid || 0; let left = target;
      pays.forEach(p => { const a = Math.min(left, p.amount); p.amount = a; p.allocations = [{ invoiceId: i.id, amount: a }]; left -= a; if (!a) p.status = 'void'; });
    });
    st.payments = st.payments.filter(p => p.status !== 'void');
    // Trả trước cho kỳ sau (E14): phần của kỳ ghi trong kế hoạch → tự áp khi phát hành hóa đơn kỳ đó
    st.payments.filter(p => p.type === 'prepay' && p.forPeriod && p.unallocated > 0).forEach(p => { p.prepayPlan = [{ period: p.forPeriod, amount: p.unallocated, applied: 0 }]; });
    // Khách của chủ nhà đã đóng tiền T9 thẳng cho chủ (ghi chú nguồn) → bù trừ vào kỳ trả chủ nhà chưa chi kế tiếp (OQ-14), không là công nợ
    const paidInv = new Set(st.payments.flatMap(p => p.allocations.map(a => a.invoiceId)));
    invoices.filter(i => /đã đóng tiền/i.test(i.note || '') && !paidInv.has(i.id) && (rooms.find(r => r.id === i.roomId) || {}).exploitation === 'owner_tenant').forEach(i => {
      const oc = ownerContracts.find(c => c.buildingId === i.buildingId); if (!oc) return;
      const op = ownerPayments.filter(o => o.contractId === oc.id && o.amountDue - o.paid >= i.totalDue).sort((a, b) => a.from.localeCompare(b.from))[0]; if (!op) return;
      const rec = { invoiceId: i.id, opId: op.id, amount: i.totalDue, date: '2026-09-05', reason: 'Ghi chú nguồn: "' + i.note + '"', by: 'Import Excel', at: '2026-09-05T00:00:00' };
      op.paid += i.totalDue; op.offsets = [...(op.offsets || []), rec];
      i.ownerSettled = i.totalDue; i.ownerSettlements = [rec];
    });

    /* --- sổ cọc --- */
    const ledger = [];
    stays.forEach(s => { if (s.depositAmount && s.source !== 'PHÒNG MỚI THÁNG 10') ledger.push({ id: 'dl_open_' + s.code, stayId: s.id, buildingId: s.buildingId, kind: 'opening', amount: s.depositAmount, date: '2026-08-31', period: '2026-08', note: 'Cọc đang giữ đầu kỳ' }); });
    P.depositLedger.forEach((d, i) => { const s = stByCode[d.stay]; if (!s || !d.amount) return; ledger.push({ id: 'dl_' + i, stayId: s.id, buildingId: s.buildingId, kind: d.kind, amount: d.amount, date: d.kind === 'receive' ? (s.rentStart && s.rentStart > '2026-08-25' ? s.rentStart : '2026-09-01') : '2026-09-05', period: d.period }); });
    col('depositLedger', ledger);

    /* --- hoàn cọc --- */
    const adm = st.users.find(u => u.role === 'admin') || {};
    col('refunds', P.refunds.map((r, i) => {
      const s = stByCode[r.stay]; const done = r.status === 'paid';
      const calc = TH.calc.refund.calc({ deposit: r.deposit, deductions: r.deductions });
      return { id: 'rf_' + r.code, code: r.code, stayId: s.id, roomId: s.roomId, buildingId: s.buildingId, deposit: r.deposit, deductions: r.deductions.map(d => Object.assign({}, d)),
        bc: calc.bc, bd: calc.bd, extraDays: r.extraDays || 0, extraRent: r.extraRent || 0, deductExtra: false, handoverDate: s.endDate, status: done ? 'paid' : 'calculated',
        approvals: done ? [{ role: 'admin', by: adm.name, at: '2026-09-02' }, { role: 'ketoan', by: accountant.name, at: '2026-09-02' }] : [],
        paidAt: done ? '2026-09-0' + (2 + i % 7) : null, paidAmount: done ? calc.payable : null, method: 'bank', note: r.note, excel: { bc: r.excelBC, bd: r.excelBD, src: r.src } };
    }));

    /* --- phân công, tổ chức (1B) --- */
    col('assignments', M.assignments.map((a, i) => ({ id: 'as_' + i, employeeId: (empByKey[a.emp] || {}).id, buildingId: UB(a.b), responsibility: a.resp, from: a.start, to: a.end, changedBy: 'Import Excel', changedAt: a.start + 'T09:00:00' })).filter(a => a.employeeId));
    const orgLinks = [];
    const byTitle = (t) => emps.filter(e => e.title === t);
    const gm = byTitle('QL TỔNG')[0], head = byTitle('TPVH')[0], lead = byTitle('TNVH')[0], tnkd = byTitle('TNKD')[0];
    const roomsOf = (emp) => st.assignments.filter(a => a.employeeId === emp.id && !a.to).reduce((s, a) => s + rooms.filter(r => r.buildingId === a.buildingId).length, 0);
    let acc = 0;
    byTitle('NVVH').sort((a, b) => roomsOf(b) - roomsOf(a)).forEach(e => {
      const toLead = lead && acc < 408 && acc + roomsOf(e) <= 460; if (toLead) acc += roomsOf(e);
      orgLinks.push({ id: 'ol_' + e.id, employeeId: e.id, leaderId: (toLead ? lead : head || gm).id, from: '2026-01-01', to: null, unit: 'Phòng Vận hành' });
    });
    if (lead && head) orgLinks.push({ id: 'ol_' + lead.id, employeeId: lead.id, leaderId: head.id, from: '2026-01-01', to: null, unit: 'Phòng Vận hành' });
    emps.filter(e => ['NVKD', 'SALE'].includes(e.title)).forEach(e => { if (tnkd) orgLinks.push({ id: 'ol_' + e.id, employeeId: e.id, leaderId: tnkd.id, from: '2026-01-01', to: null, unit: 'Phòng Kinh doanh' }); });
    [head, tnkd, ...byTitle('KẾ TOÁN'), ...byTitle('THỊ TRƯỜNG'), ...byTitle('KỸ THUẬT')].filter(Boolean).forEach(e => { if (gm && e.id !== gm.id) orgLinks.push({ id: 'ol_' + e.id, employeeId: e.id, leaderId: gm.id, from: '2026-01-01', to: null, unit: e.title === 'KẾ TOÁN' ? 'Kế toán' : e.title === 'TNKD' ? 'Phòng Kinh doanh' : e.title === 'TPVH' ? 'Phòng Vận hành' : 'Khối hỗ trợ' }); });
    col('orgLinks', orgLinks);

    /* --- kỳ, chi phí, Zalo, import, nhật ký --- */
    col('periods', [
      { id: '2026-08', status: 'open', source: 'excel_parallel', note: 'Kỳ chạy song song Excel (nghiệm thu 1B)' },
      { id: '2026-09', status: 'open', source: 'web', note: 'Kỳ live đầu tiên – hóa đơn nhập từ Excel SRC-08' },
      { id: '2026-10', status: 'open', source: 'web', note: 'Đang lập hóa đơn (chốt số 22/09)' },
    ]);
    col('expenses', []);
    col('assets', []); // Phase 3: thay collection equipment – tài sản chủ nhà + công ty (UI-34)
    col('allocationRuns', []); col('payrollRuns', []); col('payrollDisbursements', []); col('adjustments', []); col('reportSnapshots', []); col('reportSnapshotVersions', []); col('payrollManual', []);
    col('zaloTemplates', CAT.zaloTemplates.map(t => Object.assign({}, t)));
    col('zaloRules', CAT.zaloRules.map(t => Object.assign({}, t)));
    col('zaloBatches', []); col('zaloMessages', []); col('zaloInbox', []); col('smsMessages', []);
    col('importJobs', []); col('contractFiles', []); col('auditLog', []); col('tasks', []); col('catalogItems', []);
    if (TH.data.seedExtras) TH.data.seedExtras(st);
    return st;
  };
  TH.seed = Seed;
})(window.TH);
