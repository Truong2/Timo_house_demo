/* Domain – sổ sửa chữa & ứng chi vật tư (UI-47; đặc tả §3.x dòng 549–557, F16, GĐ OQ-22, OQ-23; SRC-16). Thuần: không DOM/store.
   Kỳ sổ: ngày 26 tháng trước → ngày 25 tháng này (kỳ 08/2026 = 26/07 → 25/08). Lương thợ = lương cứng + thâm niên + tiền công theo sổ + ăn trưa.
   Quyết toán ứng chi = vật tư thực chi − số ứng (dương: công ty trả thêm cho thợ; âm: thợ trả lại). */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const pad = (n) => String(n).padStart(2, '0');
  const R = {};
  R.JOB_TYPES = [['replace', 'Thay thế'], ['repair', 'Sửa chữa'], ['paint', 'Sơn'], ['cleaning', 'Dọn phòng / vệ sinh'], ['waterproof', 'Chống thấm'], ['electric', 'Điện'], ['water', 'Nước'], ['washer', 'Máy giặt'], ['other', 'Khác']];
  R.REASONS = [['expired', 'Khách hết HĐ'], ['breach', 'Khách phá HĐ'], ['leak', 'Do thấm'], ['design', 'Do thiết kế nhà'], ['old_tenant', 'Lỗi khách cũ'], ['other', 'Khác']];
  R.BEARERS = [['company', 'Công ty'], ['tenant', 'Khách chi'], ['owner', 'Chủ nhà']];
  R.label = (list, k) => ((list.find(x => x[0] === k) || [])[1]) || k || '–';
  /* Kỳ sổ của một ngày: từ ngày startDay trở đi thuộc kỳ tháng sau */
  R.periodOf = (iso, startDay = 26) => {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    if (d < startDay) return y + '-' + pad(m);
    return m === 12 ? (y + 1) + '-01' : y + '-' + pad(m + 1);
  };
  R.window = (period, startDay = 26) => {
    const [y, m] = period.split('-').map(Number);
    const py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1;
    return [py + '-' + pad(pm) + '-' + pad(startDay), period + '-' + pad(startDay - 1)];
  };
  const has = (s, ...ks) => { const t = String(s || '').toLowerCase(); return ks.some(k => t.includes(k)); };
  /* Phân loại từ nội dung / ghi chú của sổ Excel (dữ liệu nhập tay trên web chọn trực tiếp) */
  R.classifyJob = (desc) => has(desc, 'sơn') ? 'paint' : has(desc, 'thấm') ? 'waterproof' : has(desc, 'dọn', 'vệ sinh') ? 'cleaning' : has(desc, 'máy giặt') ? 'washer'
    : has(desc, 'điện', 'đèn', 'át ', 'aptomat', 'ổ cắm', 'quạt', 'công tắc', 'bình nóng') ? 'electric' : has(desc, 'nước', 'vòi', 'sen', 'téc', 'bơm', 'ống', 'tắc', 'bồn cầu', 'wc', 'xí', 'lavabo', 'phao') ? 'water'
    : has(desc, 'thay') ? 'replace' : 'repair';
  R.classifyReason = (...notes) => { const t = notes.join(' '); return has(t, 'phá h', 'phá hf') ? 'breach' : has(t, 'hết h') ? 'expired' : has(t, 'thấm') ? 'leak' : has(t, 'thiết kế') ? 'design' : has(t, 'khách cũ', 'khasxch cũ') ? 'old_tenant' : 'other'; };
  R.classifyBearer = (...notes) => { const t = notes.join(' '); return has(t, 'khách chi', 'khachs chi', 'kh chi') ? 'tenant' : has(t, 'chủ nhà') ? 'owner' : 'company'; };
  R.collectOf = (...notes) => has(notes.join(' '), 'bank về ht') ? 'QL bank về HT' : null;
  /* Tổng theo dòng sổ; mode 'excel' = mọi dòng của sheet, 'web' = chỉ dòng có ngày trong kỳ 26→25 */
  R.totals = (rows, period, mode = 'web', startDay = 26) => {
    // dòng ghi vào kỳ khác ngày có lý do (periodOverride) thuộc kỳ đã chọn – cùng một quy tắc cho UI-47, UI-44, bảng lương, chốt kỳ sổ (B10)
    const inWin = (r) => !!r.periodOverride || R.periodOf(r.date, startDay) === period;
    const use = mode === 'excel' ? rows : rows.filter(inWin);
    const out = rows.filter(r => !inWin(r));
    const sum = (arr, k) => arr.reduce((t, r) => t + (Number(r[k]) || 0), 0);
    return { count: use.length, labor: sum(use, 'labor'), material: sum(use, 'material'), outside: out.length, outsideLabor: sum(out, 'labor'), outsideMaterial: sum(out, 'material') };
  };
  R.workerPay = ({ base = 0, seniority = 0, labor = 0, lunch = 0 }) => base + seniority + labor + lunch;
  R.settlement = (material, advance) => (Number(material) || 0) - (Number(advance) || 0);
  C.repairs = R;
})(window.TH);
