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
  };
})(window.TH);
