/* Domain – tài sản / thiết bị theo tòa, phòng (UI-34, đặc tả dòng 545; CH-06, CH-15, CH-31; GĐ OQ-11). Thuần.
   Hai nguồn sở hữu: chủ nhà (phụ lục bàn giao UI-04 – không khấu hao) và công ty (danh sách đầu tư – nguyên giá, số tháng khấu hao).
   Giá trị chỉ ghi khi có chứng từ (UI-15 chi mua sắm, UI-37 import số dư, UI-33 đầu tư ban đầu, tệp đính kèm). */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const A = {};
  /* Loại tài sản theo đặc tả dòng 545 / SRC-02 BẢO TRÌ A1:A5 */
  A.TYPES = [['elevator', 'Thang máy'], ['pump', 'Máy bơm'], ['washer', 'Máy giặt'], ['water_filter', 'Máy lọc nước'], ['decor', 'Đồ décor'], ['other', 'Khác']];
  A.OWNERSHIP = [['owner', 'Chủ nhà'], ['company', 'Công ty']];
  A.CONDITIONS = [['good', 'Sử dụng bình thường'], ['repair', 'Cần sửa'], ['broken', 'Hỏng'], ['missing', 'Mất / không thấy']];
  A.SOURCES = { expense: 'Chi mua sắm UI-15', opening: 'Import số dư UI-37', handover: 'Phụ lục bàn giao UI-04', initial: 'Đầu tư ban đầu UI-33', manual: 'Nhập tay' };
  A.STATUS = { active: 'Đang dùng', disposed: 'Đã thanh lý', void: 'Đã hủy (chứng từ mua bị hủy)' };
  const lab = (list) => (k) => (list.find(x => x[0] === k) || [k, k || ''])[1];
  A.typeLabel = lab(A.TYPES); A.ownLabel = lab(A.OWNERSHIP); A.condLabel = lab(A.CONDITIONS);
  /* Phân loại tên thiết bị theo từ khóa (import / chi mua sắm không ghi loại) */
  A.classify = (name) => { const s = String(name || '').toLowerCase();
    return /thang máy/.test(s) ? 'elevator' : /bơm/.test(s) ? 'pump' : /máy giặt|sấy/.test(s) ? 'washer' : /lọc nước/.test(s) ? 'water_filter' : /décor|decor|rèm|tranh|đèn trang trí|thạch cao/.test(s) ? 'decor' : 'other'; };
  /* Mã tài sản TS-<mã tòa>-<số thứ tự 3 chữ số> */
  A.code = (bcode, n) => 'TS-' + bcode + '-' + String(n).padStart(3, '0');
  /* Kiểm tra dữ liệu tài sản; trả {field: lỗi}. hasEvidence = có chứng từ cho giá trị */
  A.validate = (d, { hasEvidence = false } = {}) => {
    const e = {};
    if (!String(d.name || '').trim()) e.name = 'Nhập tên tài sản';
    if (!A.TYPES.some(t => t[0] === d.type)) e.type = 'Chọn loại tài sản';
    if (!A.OWNERSHIP.some(t => t[0] === d.ownership)) e.ownership = 'Chọn nguồn sở hữu (chủ nhà / công ty)';
    if (!d.buildingId) e.buildingId = 'Chọn tòa';
    if (!(Number(d.qty) >= 1) || Math.floor(Number(d.qty)) !== Number(d.qty)) e.qty = 'Số lượng là số nguyên ≥ 1';
    const cost = Number(d.cost) || 0;
    if (cost < 0) e.cost = 'Nguyên giá không âm';
    if (cost > 0 && d.ownership === 'owner') e.cost = 'Tài sản chủ nhà không ghi nguyên giá / không khấu hao (CH-15)';
    if (cost > 0 && !hasEvidence) e.cost = 'Chỉ ghi giá trị khi có chứng từ (UI-15 / UI-37 / tệp đính kèm)';
    if (cost > 0 && !(Number(d.depMonths) >= 1)) e.depMonths = 'Nhập số tháng khấu hao (mặc định 63 ≈ 1,6%/tháng)';
    return e;
  };
  C.assets = A;
})(window.TH);
