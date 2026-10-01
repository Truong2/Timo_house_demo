/* Domain – kiểm tra dữ liệu import (đặc tả UI-37): schema cột, tiền/ngày, #REF!, trùng mã nguồn. Thuần. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const I = {};
  I.SCHEMAS = {
    buildings: { label: 'Tòa nhà', hint: 'Mã tòa in hoa, duy nhất (không phân biệt hoa/thường); loại T/S/G theo tiền tố mã; khu vực và mã NV quản lý phải có sẵn trên web.', cols: [['code', 'Mã tòa', true], ['address', 'Địa chỉ', true], ['group', 'Loại T/S/G'], ['area', 'Khu vực', true], ['manager', 'Mã NV quản lý', true], ['floors', 'Số tầng', false, 'number'], ['operatedFrom', 'Ngày nhận vận hành', false, 'date']] },
    rooms: { label: 'Phòng', cols: [['building', 'Mã tòa', true], ['number', 'Số phòng', true], ['listPrice', 'Giá niêm yết', true, 'money'], ['price', 'Giá cho thuê', false, 'money']] },
    stays: { label: 'Khách & lượt thuê', cols: [['room', 'Mã phòng', true], ['name', 'Tên khách', true], ['phone', 'SĐT', true], ['moveIn', 'Ngày vào ở', true, 'date'], ['endDate', 'Ngày hết hạn', true, 'date'], ['rent', 'Giá thuê', true, 'money'], ['deposit', 'Cọc đang giữ', false, 'money']] },
    readings: { label: 'Chỉ số điện nước', cols: [['room', 'Mã phòng', true], ['period', 'Kỳ (YYYY-MM)', true], ['elPrev', 'Điện cũ', true, 'number'], ['elCurr', 'Điện mới', true, 'number'], ['waPrev', 'Nước cũ', false, 'number'], ['waCurr', 'Nước mới', false, 'number']] },
    openingDebt: { label: 'Công nợ đầu kỳ', cols: [['stay', 'Mã KH (lượt thuê)', true], ['amount', 'Số còn nợ', true, 'money'], ['period', 'Kỳ gốc', true]] },
    expenses: { label: 'Chi phí', cols: [['code', 'Mã chứng từ', true], ['date', 'Ngày chi', true, 'date'], ['period', 'Kỳ hưởng', true], ['category', 'Loại chi phí', true], ['scope', 'Tòa / quỹ chung', true], ['amount', 'Số tiền', true, 'money'], ['vendor', 'Nhà cung cấp']] },
    vendorBills: { label: 'Hóa đơn nhà cung cấp (theo mã KH)', hint: 'Dịch vụ: Điện/Nước/Mạng/Rác/Môi trường/Thang máy. Điện, nước, mạng tìm tòa theo mã KH nhà cung cấp; dịch vụ khác ghi Mã tòa.', cols: [['service', 'Dịch vụ', true], ['customerCode', 'Mã KH nhà cung cấp'], ['building', 'Mã tòa'], ['period', 'Kỳ hưởng', true], ['date', 'Ngày hóa đơn', true, 'date'], ['amount', 'Số tiền', true, 'money'], ['invoiceNo', 'Số hóa đơn', true]] },
    // E2: lịch sử hoa hồng ≤ 08/2026 theo mẫu SRC-09 – F giá chốt, G thời hạn / bỏ cọc, H tỷ lệ, loại ca, I thành tiền (kiểm I = F × H)
    commissions: { label: 'Hoa hồng (lịch sử theo phòng)', hint: 'Chỉ kỳ đến 08/2026 (từ 09/2026 tính trên UI-22). H ghi 50% hoặc 0,5. Loại ca: Thường / Đối tác / Trùng 2 / Trùng 3 / Bỏ cọc / HĐ ngắn. I khác F × H quá 0,5đ chỉ cảnh báo.',
      cols: [['code', 'Mã khoản', true], ['period', 'Kỳ ghi nhận', true], ['room', 'Mã phòng', true], ['sale', 'Người nhận (sale / đối tác)', true], ['F', 'Giá chốt (F)', true, 'money'], ['G', 'Thời hạn / bỏ cọc (G)'], ['H', 'Tỷ lệ (H)', true, 'rate'], ['caseType', 'Loại ca'], ['amount', 'Thành tiền (I)', true, 'money']] },
    equipment: { label: 'Tài sản / thiết bị đã mua (số dư khấu hao)', cols: [['building', 'Mã tòa', true], ['name', 'Tên thiết bị', true], ['purchaseDate', 'Ngày mua', true, 'date'], ['cost', 'Nguyên giá', true, 'money'],
      ['type', 'Loại', false], ['ownership', 'Nguồn sở hữu', false], ['room', 'Phòng', false], ['qty', 'Số lượng', false], ['depMonths', 'Số tháng KH', false], ['openingPeriod', 'Kỳ bắt đầu ghi sổ', false]] },
    staff: { label: 'Nhân viên', hint: 'Giữ mã NV của nguồn; chức danh theo danh mục (mã hoặc tên); khu vực nếu ghi phải có sẵn.', cols: [['code', 'Mã NV', true], ['name', 'Họ tên', true], ['title', 'Chức danh', true], ['hireDate', 'Ngày vào làm', true, 'date'], ['phone', 'SĐT'], ['area', 'Khu vực']] },
  };
  const parseMoney = (v) => {
    const s = String(v == null ? '' : v).trim();
    if (!s) return null;
    const n = Number(s.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.-]/g, ''));
    return isNaN(n) ? NaN : n;
  };
  /* Tỷ lệ: "50%", "16,67%", "0,5", "0.5" → 0,5 / 0,1667 (số > 1 hiểu là phần trăm) */
  const parseRate = (v) => { const s = String(v == null ? '' : v).trim(); const pc = /%$/.test(s); const n = Number(s.replace('%', '').replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? NaN : (pc || n > 1 ? n / 100 : n); };
  /* Loại ca hoa hồng [GĐ-E3] */
  I.COMMISSION_CASES = [['normal', 'Thường'], ['partner', 'Đối tác'], ['split2', 'Trùng 2'], ['split3', 'Trùng 3'], ['forfeit', 'Bỏ cọc'], ['short', 'HĐ ngắn']];
  I.caseOf = (v) => { const t = String(v || '').trim().toLowerCase(); if (!t) return 'normal'; const c = I.COMMISSION_CASES.find(([k, l]) => k === t || l.toLowerCase() === t); return c ? c[0] : null; };
  const parseDate = (v) => {
    const s = String(v || '').trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m) return s;
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return null;
  };
  /* rows: mảng object theo key đã mapping; existingKeys: Set sourceKey đã có */
  I.validate = (type, rows, existingKeys = new Set(), keyOf = (r) => JSON.stringify(r)) => {
    const sc = I.SCHEMAS[type]; const seen = new Set();
    return rows.map((r, i) => {
      const errs = [], out = {};
      sc.cols.forEach(([k, label, req, kind]) => {
        const raw = r[k]; const s = String(raw == null ? '' : raw).trim();
        if (/#REF!|#VALUE!|#DIV\/0!|#N\/A/i.test(s)) { errs.push(`${label}: ô lỗi công thức (${s})`); return; }
        if (req && !s) { errs.push(`${label}: bắt buộc`); return; }
        if (!s) { out[k] = null; return; }
        if (kind === 'rate') { const n = parseRate(s); if (isNaN(n) || n < 0 || n > 1) errs.push(`${label}: tỷ lệ không hợp lệ (${s})`); else out[k] = n; }
        else if (kind === 'money' || kind === 'number') { const n = parseMoney(s); if (isNaN(n)) errs.push(`${label}: không phải số (${s})`); else out[k] = n; }
        else if (kind === 'date') { const d = parseDate(s); if (!d) errs.push(`${label}: ngày không hợp lệ (${s})`); else out[k] = d; }
        else out[k] = s;
      });
      const key = keyOf(out);
      let status = errs.length ? 'error' : 'ok';
      if (!errs.length && (existingKeys.has(key) || seen.has(key))) status = 'duplicate';
      seen.add(key);
      return { line: i + 2, data: out, errs, warns: [], status, sourceKey: key };
    });
  };
  C.importv = I;
})(window.TH);
