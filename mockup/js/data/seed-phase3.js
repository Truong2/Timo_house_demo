/* Dữ liệu demo Phase 3 – dựng trong TH.seed.build (nối tiếp hook seedExtras của Phase 2), không lưu localStorage.
   Tài sản (UI-34): 17 thiết bị công ty mua T8 đã có ở seed-1b (khấu hao 566.080/tháng giữ nguyên); thêm tài sản CHỦ NHÀ theo phụ lục bàn giao
   SRC-10 (13 hạng mục, số lượng để trống trong mẫu → suy theo số phòng / tầng [P]) cho các tòa demo, thang máy chủ nhà ở tòa có chi phí thang máy T8,
   máy bơm, máy giặt, máy lọc nước (4 loại lịch bảo dưỡng SRC-02 BẢO TRÌ A1:A4). Thiết bị công ty mua trước go-live chưa có chứng từ → không ghi giá trị. */
(function (TH) {
  const prev = TH.data.seedExtras;
  /* Phụ lục bàn giao tài sản cho thuê nhà – SRC-10 (hợp đồng mẫu), 4 + 9 hạng mục */
  const HANDOVER = [
    ['Điều hòa, kèm điều khiển', 'other', (r) => r], ['Thiết bị mạng, công tắc điện, ổ cắm…', 'other', () => 1], ['Bình nóng lạnh', 'other', (r) => r],
    ['Thiết bị vệ sinh (bồn cầu, vòi sen, vòi xịt, lavabo…)', 'other', (r) => r], ['Cửa ra vào', 'other', (r) => r], ['Cửa WC', 'other', (r) => r], ['Cửa sổ các phòng', 'other', (r) => r],
    ['Cửa ban công', 'other', (r, f) => f], ['Bóng điện (nhà xe, từng phòng, hành lang…)', 'decor', (r, f) => r * 2 + f], ['Công tơ điện', 'other', (r) => r + 1], ['Đồng hồ nước', 'other', () => 1],
    ['Hệ thống báo cháy (chuông, nút ấn, báo nhiệt)', 'other', () => 1], ['Cửa chống cháy', 'other', (r, f) => f],
  ];
  const DEMO = ['G1', 'S43', 'T17', 'T2', 'G15', 'S4'];
  TH.data.seedExtras = (st) => {
    if (prev) prev(st);
    const bBy = {}; st.buildings.forEach(b => { bBy[b.code] = b; });
    const roomsOf = (bid) => st.rooms.filter(r => r.buildingId === bid);
    const seq = {}; const code = (bc) => { seq[bc] = (seq[bc] || st.assets.filter(a => a.code.startsWith('TS-' + bc + '-')).length) + 1; return 'TS-' + bc + '-' + String(seq[bc]).padStart(3, '0'); };
    const hist = (b, date, reason) => [{ at: date + 'T09:00:00', date, by: 'Dữ liệu demo', kind: 'create', after: { buildingId: b.id, roomId: null, position: '' }, reason }];
    const add = (b, o) => { const c = code(b.code); st.assets.push(Object.assign({ id: 'as_' + c.replace(/-/g, '_'), code: c, roomId: null, position: '', qty: 1, condition: 'good', cost: 0, depStart: null, depMonths: null, openingPeriod: null, warrantyTo: null,
      expenseId: null, ownerContractId: null, capitalRef: null, docs: [], note: '', status: 'active', disposal: null, history: hist(b, o.receivedDate, o.source === 'handover' ? 'Phụ lục bàn giao UI-04' : 'Dữ liệu demo') }, o, { buildingId: b.id })); };
    DEMO.forEach(bc => {
      const b = bBy[bc]; if (!b) return; const rooms = roomsOf(b.id); const floors = new Set(rooms.map(r => r.floor)).size || 1;
      const oc = st.ownerContracts.find(o => o.buildingId === b.id); const rd = b.operatedFrom || (oc && oc.from) || '2026-01-01';
      HANDOVER.forEach(([name, type, q]) => add(b, { name, type, ownership: 'owner', qty: q(rooms.length, floors), receivedDate: rd, source: 'handover', ownerContractId: oc ? oc.id : null, position: 'Toàn tòa', note: 'SRC-10 phụ lục bàn giao – số lượng suy theo số phòng / tầng [P]' }));
    });
    /* Thang máy (chủ nhà) – tòa có chi phí thang máy T8 (SRC-04 dòng 27) */
    st.benchLines.filter(l => l.code === 'cost_elev' && l.value > 0).forEach(l => { const b = st.buildings.find(x => x.id === l.buildingId); if (b) add(b, { name: 'Thang máy tải khách', type: 'elevator', ownership: 'owner', receivedDate: b.operatedFrom || '2026-01-01', source: 'handover', position: 'Lõi thang', note: 'Có chi phí thang máy T8 (SRC-04)' }); });
    /* Máy bơm, máy lọc nước, máy giặt chung – lịch bảo dưỡng SRC-02 */
    [['T2', 'Máy bơm tăng áp', 'pump', 'owner', 'Tầng mái'], ['S43', 'Máy bơm nước sinh hoạt', 'pump', 'owner', 'Tầng 1'], ['T17', 'Máy bơm tăng áp', 'pump', 'owner', 'Tầng mái'],
      ['T2', 'Máy lọc nước tổng RO', 'water_filter', 'company', 'Tầng 1'], ['S43', 'Máy lọc nước tổng', 'water_filter', 'company', 'Tầng 1'], ['G15', 'Máy lọc nước tổng', 'water_filter', 'company', 'Tầng 1'],
      ['T2', 'Máy giặt chung 9kg', 'washer', 'company', 'Tầng 5 – khu giặt'], ['T17', 'Máy giặt chung 10kg', 'washer', 'company', 'Tầng 6 – khu giặt'], ['T5', 'Máy giặt chung 9kg', 'washer', 'company', 'Tầng 5 – khu giặt'], ['S4', 'Máy giặt + sấy chung', 'washer', 'company', 'Tầng 1']]
      .forEach(([bc, name, type, own, pos]) => { const b = bBy[bc]; if (b) add(b, { name, type, ownership: own, position: pos, receivedDate: b.operatedFrom || '2026-01-01', source: own === 'owner' ? 'handover' : 'manual',
        note: own === 'company' ? 'Mua trước go-live – chưa có chứng từ, giá trị chờ import số dư UI-37' : 'Thiết bị của tòa theo phụ lục bàn giao' }); });

    /* Lịch bảo dưỡng (UI-35) – 4 loại SRC-02 BẢO TRÌ A1:A4: thang máy hằng tháng, máy bơm 6 tháng, máy giặt 3 tháng, máy lọc nước 3 tháng.
       Hôm nay demo 29/09/2026: 2 việc quá hạn, 3 việc đến hạn trong 7 ngày (nhắc CH-32), còn lại đã làm / dự kiến. Không seed chi phí (giữ số T9). */
    const MT = TH.calc.assets.maint; const tasks = []; const seqT = {};
    const mgrOf = (bid, d) => { const a = st.assignments.find(x => x.buildingId === bid && !x.roomId && (!x.from || x.from <= d) && (!x.to || d <= x.to)); return a ? a.employeeId : null; };
    const leadOf = (eid, d) => { const l = st.orgLinks.find(x => x.employeeId === eid && (!x.from || x.from <= d) && (!x.to || d <= x.to)); return l ? l.leaderId : null; };
    const tech = (st.employees.find(e => e.key === 'NV94361688') || st.employees.find(e => e.title === 'KỸ THUẬT') || {}).id || null;
    const VENDOR = { elevator: 'Cty Thang máy Thành Công (demo)', water_filter: 'Đại lý lọc nước Karofi (demo)' };
    const mk = (a, due, cycle, done) => { const p = 'BD-' + due.slice(0, 7).replace('-', '') + '-'; seqT[p] = (seqT[p] || 0) + 1; const code = p + String(seqT[p]).padStart(4, '0');
      const asg = mgrOf(a.buildingId, due); const t = { id: 'bd_' + code.replace(/-/g, '_'), code, assetId: a.id, buildingId: a.buildingId, assetType: a.type, kind: MT.KINDS[a.type], cycleMonths: cycle, dueDate: due,
        leaderId: asg ? leadOf(asg, due) : null, assigneeId: a.type === 'elevator' ? null : asg, performerId: null, vendor: VENDOR[a.type] || '', status: 'planned', doneDate: null, result: '', photos: [], note: '', expenseId: null, repairLogIds: [],
        prevId: tasks.length && tasks[tasks.length - 1].assetId === a.id ? tasks[tasks.length - 1].id : null, nextId: null, remindedAt: null, createdBy: 'Dữ liệu demo', createdAt: '2026-07-01T08:00:00' };
      if (done) Object.assign(t, { status: 'done', doneDate: done, performerId: a.type === 'elevator' || a.type === 'water_filter' ? null : tech, result: a.type === 'elevator' ? 'Đạt – đã tra dầu cáp, kiểm tra phanh' : a.type === 'pump' ? 'Đạt – thay phớt, vệ sinh lưới lọc' : a.type === 'washer' ? 'Đạt – vệ sinh lồng giặt, ống xả' : 'Đạt – thay lõi 1-2-3', doneBy: 'Dữ liệu demo' });
      if (t.prevId) tasks[tasks.length - 1].nextId = t.id;
      tasks.push(t); };
    const A = (bc, type) => st.assets.find(a => a.type === type && a.buildingId === (bBy[bc] || {}).id);
    // thang máy hằng tháng: T8, T9 đã làm; T10 dự kiến (S9B ngày 03/10 → trong cửa sổ nhắc)
    [['S9B', '10-03'], ['S16', '10-08'], ['S37', '10-12']].forEach(([bc, d10]) => { const a = A(bc, 'elevator'); if (!a) return; const dd = d10.slice(3); mk(a, '2026-08-' + dd, 1, '2026-08-' + dd); mk(a, '2026-09-' + dd, 1, '2026-09-' + dd); mk(a, '2026-10-' + dd, 1, null); });
    // máy bơm 6 tháng: T2 làm 15/04 → 15/10; S43 quá hạn 20/09; T17 đến hạn 05/10
    (() => { const a = A('T2', 'pump'); if (a) { mk(a, '2026-04-15', 6, '2026-04-16'); mk(a, '2026-10-15', 6, null); } })();
    (() => { const a = A('S43', 'pump'); if (a) { mk(a, '2026-03-20', 6, '2026-03-20'); mk(a, '2026-09-20', 6, null); } })();
    (() => { const a = A('T17', 'pump'); if (a) mk(a, '2026-10-05', 6, null); })();
    // máy lọc nước 3 tháng: T2 làm 01/07 → 01/10 (sắp đến hạn); S43 quá hạn 22/09; G15 15/11
    (() => { const a = A('T2', 'water_filter'); if (a) { mk(a, '2026-07-01', 3, '2026-07-01'); mk(a, '2026-10-01', 3, null); } })();
    (() => { const a = A('S43', 'water_filter'); if (a) { mk(a, '2026-06-22', 3, '2026-06-23'); mk(a, '2026-09-22', 3, null); } })();
    (() => { const a = A('G15', 'water_filter'); if (a) mk(a, '2026-11-15', 3, null); })();
    // máy giặt chung 3 tháng: làm 20/08 → 20/11
    ['T2', 'T17', 'T5', 'S4'].forEach(bc => { const a = A(bc, 'washer'); if (a) { mk(a, '2026-08-20', 3, '2026-08-21'); mk(a, '2026-11-20', 3, null); } });
    st.maintenanceTasks = tasks;
  };
})(window.TH);
