/* Domain – tham số giả định làm việc (GĐ) có ngày hiệu lực. Đổi khi khách trả lời khác, không đổi cấu trúc dữ liệu. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const P = {};
  /* rows: [{key, value, effectiveFrom, effectiveTo, oq, label}] → giá trị hiệu lực tại ngày */
  P.at = (rows, key, dateISO) => {
    const d = dateISO || '9999-12-31';
    const hits = rows.filter(r => r.key === key && (!r.effectiveFrom || r.effectiveFrom <= d) && (!r.effectiveTo || d <= r.effectiveTo));
    if (!hits.length) return undefined;
    hits.sort((a, b) => String(b.effectiveFrom || '').localeCompare(String(a.effectiveFrom || '')));
    return hits[0].value;
  };
  P.recordAt = (rows, key, dateISO) => {
    const d = dateISO || '9999-12-31';
    const hits = rows.filter(r => r.key === key && (!r.effectiveFrom || r.effectiveFrom <= d) && (!r.effectiveTo || d <= r.effectiveTo));
    return hits.sort((a, b) => String(b.effectiveFrom || '').localeCompare(String(a.effectiveFrom || '')))[0] || null;
  };
  /* Bộ tham số của một ngày → object phẳng */
  P.snapshot = (rows, dateISO) => {
    const o = {};
    [...new Set(rows.map(r => r.key))].forEach(k => { o[k] = P.at(rows, k, dateISO); });
    return o;
  };
  P.policySnapshot = (rows, dateISO) => {
    const out = {};
    [...new Set(rows.map(r => r.key))].forEach(key => {
      const r = P.recordAt(rows, key, dateISO); if (!r) return;
      out[key] = { value: JSON.parse(JSON.stringify(r.value)), status: r.status || 'proposed', sourceRef: r.sourceRef || r.oq || '', effectiveFrom: r.effectiveFrom || null, approvedBy: r.approvedBy || null, approvedAt: r.approvedAt || null };
    });
    return out;
  };
  /* Kiểm tra chồng hiệu lực khi thêm phiên mới */
  P.overlaps = (rows, key, from, to) => rows.filter(r => r.key === key).some(r => (!to || !r.effectiveFrom || r.effectiveFrom <= to) && (!r.effectiveTo || !from || from <= r.effectiveTo));
  /* Mốc thu tính lương (SRC-05): 3 mốc ngày tăng dần + hệ số; nhận mảng [{day,w}] hoặc chuỗi "5:100% · 10:90% · 15:70%" */
  P.DEFAULT_MILESTONES = [{ day: 5, w: 1 }, { day: 10, w: 0.9 }, { day: 15, w: 0.7 }];
  P.parseMilestones = (v) => {
    const arr = Array.isArray(v) ? v : String(v || '').split(/[·,;]/).map(x => x.trim()).filter(Boolean).map(x => { const m = x.match(/^(\d+)\s*:\s*([\d.,]+)\s*(%?)$/); return m ? { day: Number(m[1]), w: Number(m[2].replace(',', '.')) / (m[3] ? 100 : 1) } : { day: NaN, w: NaN }; });
    const errs = [];
    if (arr.length !== 3) errs.push('Cần đúng 3 mốc (M1, M2, M3)');
    arr.forEach((x, i) => { if (!Number.isInteger(x.day) || x.day < 1 || x.day > 28) errs.push(`Mốc ${i + 1}: ngày 1–28`); if (!(x.w >= 0 && x.w <= 1)) errs.push(`Mốc ${i + 1}: hệ số 0–100%`); if (i && x.day <= arr[i - 1].day) errs.push('Ngày mốc phải tăng dần'); });
    return { ok: !errs.length, errs, value: arr.map(x => ({ day: x.day, w: x.w })) };
  };
  P.milestones = (v) => { const r = P.parseMilestones(v); const m = r.ok ? r.value : P.DEFAULT_MILESTONES; return { days: m.map(x => x.day), w: m.map(x => x.w) }; };
  /* Kiểm tra giá trị theo metadata tham số (type/min/max/options) → {ok, value (đã chuẩn hóa), err} */
  P.validate = (def, raw) => {
    if (!def) return { ok: false, err: 'Tham số không tồn tại' };
    const t = def.type || (typeof def.value === 'boolean' ? 'bool' : typeof def.value === 'number' ? 'number' : 'text');
    const rng = (n) => (def.min != null && n < def.min) || (def.max != null && n > def.max) ? `Giá trị phải từ ${def.min} đến ${def.max}` : null;
    if (t === 'bool') { const s = String(raw).trim().toLowerCase(); if (['true', '1', 'có', 'co', 'yes', 'on'].includes(s) || raw === true) return { ok: true, value: true }; if (['false', '0', 'không', 'khong', 'no', 'off'].includes(s) || raw === false) return { ok: true, value: false }; return { ok: false, err: 'Chọn Có hoặc Không' }; }
    if (t === 'enum') { const ok = (def.options || []).some(o => o[0] === raw); return ok ? { ok: true, value: raw } : { ok: false, err: 'Giá trị không nằm trong danh sách' }; }
    if (t === 'milestones') { const r = P.parseMilestones(raw); return r.ok ? { ok: true, value: r.value } : { ok: false, err: r.errs.join('; ') }; }
    if (['int', 'money', 'number', 'pct'].includes(t)) {
      let s = String(raw == null ? '' : raw).trim(); if (!s) return { ok: false, err: 'Nhập giá trị' };
      const pct = t === 'pct' && /%$/.test(s); s = s.replace('%', '');
      if (t === 'money' || t === 'int') s = s.replace(/[.\s]/g, ''); s = s.replace(',', '.');
      let n = Number(s); if (!isFinite(n)) return { ok: false, err: 'Giá trị phải là số' };
      if (pct) n = n / 100;
      if (t === 'int' && !Number.isInteger(n)) return { ok: false, err: 'Giá trị phải là số nguyên' };
      const e = rng(n); return e ? { ok: false, err: e } : { ok: true, value: n };
    }
    return String(raw || '').trim() ? { ok: true, value: String(raw).trim() } : { ok: false, err: 'Nhập giá trị' };
  };
  /* Hiển thị giá trị tham số */
  P.format = (def, v, F) => {
    const t = (def && def.type) || '';
    if (typeof v === 'boolean') return v ? 'Có' : 'Không';
    if (t === 'milestones') return P.milestones(v).days.map((d, i) => `${d}: ${Math.round(P.milestones(v).w[i] * 100)}%`).join(' · ');
    if (t === 'pct') return (Math.round(v * 10000) / 100).toString().replace('.', ',') + '%';
    if (t === 'enum') return ((def.options || []).find(o => o[0] === v) || [v, v])[1];
    if (typeof v === 'number') return F ? F.vnd(v) : String(v);
    return String(v == null ? '' : v);
  };
  C.params = P;
})(window.TH);
