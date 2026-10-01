/* Actions – import CSV có mapping, kiểm tra, nhập dòng hợp lệ, không nhập trùng mã nguồn (UI-37). */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, I = TH.calc.importv;
  const keyOf = {
    buildings: r => 'b:' + String(r.code || '').toUpperCase(),
    rooms: r => 'r:' + r.number + String(r.building || '').toUpperCase(),
    stays: r => 's:' + r.room + ':' + r.moveIn + ':' + r.phone,
    readings: r => 'rd:' + r.room + ':' + r.period,
    openingDebt: r => 'od:' + r.stay + ':' + r.period,
    expenses: r => 'ex:' + r.code,
    commissions: r => 'cm:' + r.code,
    vendorBills: r => 'vb:' + String(r.service || '').toLowerCase() + ':' + (r.customerCode || r.building || '') + ':' + r.period + ':' + r.invoiceNo,
    equipment: r => 'eq:' + r.building + ':' + r.name + ':' + r.purchaseDate,
    staff: r => 'st:' + r.code,
  };
  /* Hóa đơn nhà cung cấp (§2.3 dòng 22–27): dịch vụ → loại chi phí; mã KH điện/nước/mạng → tòa theo danh sách mã HĐ (UI-03 dịch vụ đầu vào) */
  const SVC = { 'điện': ['util_electric', 'electric'], 'nước': ['util_water', 'water'], 'mạng': ['util_internet', 'internet'], 'internet': ['util_internet', 'internet'], 'rác': ['util_garbage'], 'môi trường': ['util_env'], 'thang máy': ['util_elevator'] };
  X.vendorBillTarget = (d) => {
    const svc = SVC[String(d.service || '').trim().toLowerCase()]; if (!svc) return { err: 'Dịch vụ không hợp lệ: ' + d.service };
    const code = String(d.customerCode || '').trim();
    if (code && svc[1]) { const b = S.all('buildings').find(x => x.vendor && x.vendor[svc[1]] && x.vendor[svc[1]].code === code); if (!b) return { err: 'Mã KH ' + code + ' không khớp tòa nào (UI-03 → Dịch vụ đầu vào)' }; return { category: svc[0], building: b }; }
    if (code && !svc[1]) return { err: 'Dịch vụ ' + d.service + ' chưa có danh mục mã KH – nhập Mã tòa' };
    const b = d.building && S.one('buildings', x => x.code === String(d.building).trim().toUpperCase()); if (!b) return { err: d.building ? 'Mã tòa không tồn tại: ' + d.building : 'Thiếu mã KH hoặc mã tòa' };
    return { category: svc[0], building: b };
  };
  X.importPermFor = (type) => ['buildings', 'rooms', 'staff'].includes(type) ? 'import.master' : 'import.finance';
  X.validateImport = (type, rows) => {
    const existing = new Set(S.all('importJobs').filter(j => j.type === type && j.status === 'done').flatMap(j => j.sourceKeys || []));
    const res = I.validate(type, rows, existing, keyOf[type]);
    // kiểm tra tham chiếu
    res.forEach(r => {
      if (r.status !== 'ok') return;
      const d = r.data;
      if (['rooms', 'equipment'].includes(type) && !S.one('buildings', b => b.code === String(d.building).toUpperCase())) { r.status = 'error'; r.errs.push('Mã tòa không tồn tại: ' + d.building); }
      if (['stays', 'readings', 'commissions'].includes(type) && !S.get('rooms', 'r_' + String(d.room).toUpperCase())) { r.status = 'error'; r.errs.push('Mã phòng không tồn tại: ' + d.room); }
      // Phase 2: hoa hồng từ kỳ 09/2026 tính và chi trên web (UI-22) – import chỉ cho dữ liệu lịch sử, tránh cộng hai lần dòng 40
      if (type === 'commissions' && TH.ms && TH.ms.on('2') && String(d.period || '') >= '2026-09') { r.status = 'error'; r.errs.push('Từ kỳ 09/2026 hoa hồng tính trên web (UI-22) – chỉ import lịch sử đến 08/2026'); }
      if (type === 'commissions' && r.status === 'ok') {
        if (!/^\d{4}-\d{2}$/.test(d.period || '')) { r.status = 'error'; r.errs.push('Kỳ ghi nhận dạng YYYY-MM'); }
        else if (!I.caseOf(d.caseType)) { r.status = 'error'; r.errs.push('Loại ca không có trong danh mục: ' + d.caseType); }
        else { const exp = TH.calc.commission.amount(d.F, d.H); if (Math.abs(exp - d.amount) > 0.5) r.warns.push(`I ≠ F × H: ${F.vnd(d.amount)} so với ${F.vnd(exp)} (lệch ${F.vnd(d.amount - exp)}) – vẫn nhập theo I của file [GĐ-E4]`); } }
      // Lượt thuê đang có trên web (cùng phòng, cùng SĐT, cùng ngày vào) → trùng dữ liệu hiện có, không chỉ trùng lần import trước
      if (type === 'stays' && r.status === 'ok') { const room = S.get('rooms', 'r_' + String(d.room).toUpperCase()); const phone = String(d.phone || '').replace(/\s/g, '');
        if (room && S.all('stays').some(s => s.roomId === room.id && ['active', 'pending'].includes(s.status) && ((Q.customer(s.customerId) || {}).phone === phone || s.rentStart === d.moveIn))) { r.status = 'duplicate'; r.errs.push('Phòng ' + room.code + ' đã có lượt thuê hiệu lực trùng khách/ngày vào'); } }
      // Phase 3: số dư tài sản – nguồn sở hữu, số tháng KH, kỳ bắt đầu ghi sổ (YYYY-MM)
      if (type === 'equipment' && r.status === 'ok') {
        if (d.ownership && !['Chủ nhà', 'Công ty'].includes(String(d.ownership).trim())) { r.status = 'error'; r.errs.push('Nguồn sở hữu ghi "Chủ nhà" hoặc "Công ty": ' + d.ownership); }
        else if (d.depMonths && !(Number(d.depMonths) >= 1)) { r.status = 'error'; r.errs.push('Số tháng KH là số ≥ 1'); }
        else if (d.openingPeriod && !/^\d{4}-\d{2}$/.test(d.openingPeriod)) { r.status = 'error'; r.errs.push('Kỳ bắt đầu ghi sổ dạng YYYY-MM'); }
        else if (String(d.ownership).trim() === 'Chủ nhà' && Number(d.cost) > 0) r.warns.push('Tài sản chủ nhà không ghi nguyên giá – bỏ qua nguyên giá (CH-15)'); }
      if (type === 'openingDebt' && !S.get('stays', 'st_' + d.stay)) { r.status = 'error'; r.errs.push('Mã KH/lượt thuê không tồn tại: ' + d.stay); }
      if (type === 'expenses' && !TH.data.catalog.expenseCategories.some(c => c.active !== false && (c.key === d.category || c.label === d.category))) { r.status = 'error'; r.errs.push('Loại chi phí không có trong danh mục (hoặc đã ngừng dùng): ' + d.category); }
      // Tòa (UI-02 import): mã trùng web (không phân biệt hoa/thường) → trùng; nhóm phải khớp tiền tố mã; quản lý và khu vực phải tồn tại – không tự gán mặc định
      if (type === 'buildings') { const code = String(d.code).trim().toUpperCase();
        if (S.one('buildings', b => String(b.code).toUpperCase() === code)) { r.status = 'duplicate'; r.errs.push('Mã tòa đã có trên web: ' + code); }
        else { const pre = F.groupOf(code); if (d.group && pre && String(d.group).toUpperCase() !== pre) { r.status = 'error'; r.errs.push(`Loại ${d.group} không khớp tiền tố mã tòa ${code} (nhóm ${pre})`); }
          if (!S.one('employees', e => e.code === String(d.manager).trim())) { r.status = 'error'; r.errs.push('Mã NV quản lý không tồn tại: ' + d.manager); }
          if (!X.findArea(d.area)) { r.status = 'error'; r.errs.push('Khu vực không tồn tại: ' + d.area); } } }
      // Nhân viên: giữ mã nguồn (trùng web → trùng), chức danh phải có trong danh mục, khu vực (nếu ghi) phải tồn tại
      if (type === 'staff') { const T = TH.data.catalog.titles;
        if (S.one('employees', e => e.code === String(d.code).trim())) { r.status = 'duplicate'; r.errs.push('Mã NV đã có trên web: ' + d.code); }
        else if (!T[d.title] && !Object.values(T).some(v => v.toLowerCase() === String(d.title).toLowerCase())) { r.status = 'error'; r.errs.push('Chức danh không có trong danh mục: ' + d.title); }
        else if (d.area && !X.findArea(d.area)) { r.status = 'error'; r.errs.push('Khu vực không tồn tại: ' + d.area); } }
      // Chi phí phải gắn tòa hoặc đúng mã quỹ chung (F_OFFICE, F_MKT…) – không tự gán "CHUNG" vào quỹ văn phòng
      if (type === 'expenses' && !S.one('buildings', b => b.code === String(d.scope).toUpperCase()) && !TH.data.catalog.funds.some(f => f.code === d.scope)) { r.status = 'error'; r.errs.push('Tòa/quỹ không tồn tại: ' + d.scope + ' (quỹ chung ghi mã quỹ, vd F_OFFICE)'); }
      if (type === 'vendorBills') { const t = X.vendorBillTarget(d); if (t.err) { r.status = 'error'; r.errs.push(t.err); } else if (!/^\d{4}-\d{2}$/.test(d.period || '')) { r.status = 'error'; r.errs.push('Kỳ hưởng dạng YYYY-MM'); }
        else if (S.one('expenses', e => e.code === 'NCC-' + d.invoiceNo)) { r.status = 'duplicate'; r.errs.push('Số hóa đơn đã có trong Chi phí'); } }
    });
    return res;
  };
  X.commitImport = (type, fileName, results) => {
    _.need(X.importPermFor(type));
    const ok = results.filter(r => r.status === 'ok');
    const done = [];
    ok.forEach(r => {
      const d = r.data;
      try {
        if (type === 'readings') { const room = S.get('rooms', 'r_' + d.room.toUpperCase()); const st = Q.currentStay(room.id); X.saveReading({ roomId: room.id, stayId: st && st.id, buildingId: room.buildingId, period: d.period, elPrev: d.elPrev, elCurr: d.elCurr, waPrev: d.waPrev, waCurr: d.waCurr, reason: d.elCurr < d.elPrev ? 'Import' : '' }); }
        else if (type === 'expenses') { const cat = TH.data.catalog.expenseCategories.find(c => c.key === d.category || c.label === d.category); const b = S.one('buildings', x => x.code === String(d.scope).toUpperCase()); const fund = TH.data.catalog.funds.find(f => f.code === d.scope);
          X.addExpense({ code: d.code, date: d.date, period: d.period, category: cat.key, scope: b ? 'building' : 'fund', buildingId: b && b.id, fundCode: fund ? fund.code : null, amount: d.amount, vendor: d.vendor, source: 'import' }, true); }
        else if (type === 'vendorBills') { const t = X.vendorBillTarget(d); X.addExpense({ code: 'NCC-' + d.invoiceNo, date: d.date, period: d.period, category: t.category, scope: 'building', buildingId: t.building.id, amount: d.amount, vendor: d.service + (d.customerCode ? ' – ' + d.customerCode : ''), source: 'import', note: 'Hóa đơn ' + d.service + ' ' + d.invoiceNo + ' tòa ' + t.building.code }, true); }
        else if (type === 'commissions') { const room = S.get('rooms', 'r_' + d.room.toUpperCase()); const ex = X.addExpense({ code: d.code, date: d.period + '-15', period: d.period, category: 'commission', scope: 'building', buildingId: room.buildingId, roomId: room.id, amount: d.amount, vendor: d.sale, source: 'import', note: 'Hoa hồng ' + room.code }, true);
          // E2: giữ chi tiết dòng lịch sử (F/G/H/loại ca/I) để tra ở UI-22 – không trộn vào hoa hồng tính theo giao dịch web
          S.add('commissionImports', { code: d.code, period: d.period, roomId: room.id, buildingId: room.buildingId, recipient: d.sale, F: d.F, G: d.G || '', H: d.H, caseType: I.caseOf(d.caseType), amount: d.amount, expected: TH.calc.commission.amount(d.F, d.H), expenseId: ex.id, warns: r.warns || [] }); }
        else if (type === 'equipment') { const b = S.one('buildings', x => x.code === String(d.building).toUpperCase()); const room = d.room ? S.one('rooms', x => x.buildingId === b.id && (x.code === String(d.room).toUpperCase() || String(x.number) === String(d.room))) : null;
          // Phase 3: số dư thiết bị → tài sản công ty UI-34; chỉ ghi khấu hao từ kỳ bắt đầu ghi sổ (mặc định kỳ sau kỳ khóa gần nhất)
          const lastClosed = S.all('periods').filter(p => p.status === 'closed').map(p => p.id).sort().pop();
          X._createAsset({ name: d.name, type: TH.calc.assets.classify(d.type || d.name), ownership: d.ownership === 'Chủ nhà' ? 'owner' : 'company', buildingId: b.id, roomId: room ? room.id : null, qty: Number(d.qty) || 1, receivedDate: d.purchaseDate, depStart: d.purchaseDate,
            cost: d.ownership === 'Chủ nhà' ? 0 : d.cost, depMonths: Number(d.depMonths) || null, openingPeriod: d.openingPeriod || (lastClosed ? TH.calc.dates.nextPeriod(lastClosed) : null), source: 'opening' }); }
        else if (type === 'openingDebt') { const s = S.get('stays', 'st_' + d.stay); S.add('invoices', { id: 'inv_OPEN-' + d.stay + '-' + d.period, code: 'OPEN-' + d.period + '-' + d.stay, period: d.period, stayId: s.id, roomId: s.roomId, buildingId: s.buildingId, customerCode: s.code, lifecycle: 'issued', kind: 'opening', lines: [[11, null, null, 1, 1, d.amount, d.amount]], totalDue: d.amount, dueTo: d.period + '-01', dueFrom: d.period + '-01', cutoff: d.period + '-01', issueDate: d.period + '-01', note: 'Công nợ đầu kỳ (import)' }); }
        else if (type === 'staff') { const T = TH.data.catalog.titles; const tk = T[d.title] ? d.title : Object.entries(T).find(([k, v]) => v.toLowerCase() === String(d.title).toLowerCase())[0]; const area = X.findArea(d.area);
          X.addEmployee({ code: String(d.code).trim(), name: d.name, title: tk, hireDate: d.hireDate, phone: d.phone || '', areaId: area ? area.id : null }); }
        else if (type === 'buildings') { X.addBuilding({ code: d.code, address: d.address, group: d.group ? String(d.group).toUpperCase() : undefined, areaId: X.findArea(d.area).id, managerId: S.one('employees', e => e.code === String(d.manager).trim()).id, floors: d.floors, operatedFrom: d.operatedFrom, rooms: 0 }); }
        else if (type === 'rooms') { const b = S.one('buildings', x => x.code === String(d.building).toUpperCase()); X.addRoom(b.id, { number: d.number, listPrice: d.listPrice, price: d.price }); }
        else if (type === 'stays') { const room = S.get('rooms', 'r_' + d.room.toUpperCase()); if (Q.currentStay(room.id)) throw new Error('Phòng ' + room.code + ' đang có khách – kết thúc lượt thuê cũ trước khi import');
          X.createStay({ roomId: room.id, name: d.name, phone: d.phone, dealDate: d.moveIn, rentStart: d.moveIn, endDate: d.endDate, rent: d.rent, deposit: d.deposit, openingDeposit: d.deposit, status: 'active' }); }
        done.push(r.sourceKey);
      } catch (e) { r.status = 'error'; r.errs.push(e.message); }
    });
    const job = S.add('importJobs', { type, fileName, at: F.nowISO(), by: _.who(), total: results.length, ok: done.length, errors: results.filter(r => r.status === 'error').length, duplicates: results.filter(r => r.status === 'duplicate').length, sourceKeys: done, status: 'done' });
    _.audit('import', 'importJob', job.id, `Import ${I.SCHEMAS[type].label}: ${done.length}/${results.length} dòng`); _.done(); return job;
  };
  X.importTemplate = (type) => { const sc = I.SCHEMAS[type]; return F.csv([], sc.cols.map(c => c[1])); };
})(window.TH);
