/* Domain – dựng 13 dòng hóa đơn, tháng lẻ, Thu khác, phá HĐ, mẫu in (đặc tả UI-11/UI-12, §3.12). Thuần, không DOM. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const B = {};
  /* Thứ tự dòng theo mẫu in HĐ (...) + dòng 13 Thu khác (bổ sung v1.4) */
  B.LINES = [
    { no: 1, key: 'rent', label: 'Tiền phòng', kind: 'rent' },
    { no: 2, key: 'deposit', label: 'Tiền cọc phòng (đối với KH mới ở)', kind: 'deposit' },
    { no: 3, key: 'electric', label: 'Điện (số)', kind: 'meter' },
    { no: 4, key: 'water', label: 'Nước (khối)', kind: 'meter' },
    { no: 5, key: 'cleaning', label: 'DV Vệ sinh', kind: 'service' },
    { no: 6, key: 'internet', label: 'DV Internet (phòng)', kind: 'service' },
    { no: 7, key: 'elevator', label: 'DV Thang máy (người)', kind: 'service' },
    { no: 8, key: 'ev', label: 'DV Gửi xe', kind: 'service' },
    { no: 9, key: 'washer', label: 'Máy giặt/Máy sấy', kind: 'service' },
    { no: 10, key: 'combo', label: 'DV Combo/ DV khác', kind: 'service' },
    { no: 11, key: 'oldDebt', label: 'Nợ cũ', kind: 'debt' },
    { no: 12, key: 'common', label: 'Điện chung', kind: 'common' },
    { no: 13, key: 'other', label: 'Thu khác', kind: 'other' },
  ];
  B.lineDef = (no) => B.LINES[no - 1];
  const round = (v, on) => on ? Math.round(v) : Math.round(v * 100) / 100;

  /* Chuẩn hóa dòng dạng mảng seed [no, mới, cũ, SL, hệ số, đơn giá, thành tiền] → object đủ 13 dòng */
  B.expand = (lines) => {
    const map = {};
    (lines || []).forEach(l => { const o = Array.isArray(l) ? { no: l[0], curr: l[1], prev: l[2], qty: l[3], factor: l[4], unit: l[5], amount: l[6], note: l[7] || '' } : l; map[o.no] = o; });
    return B.LINES.map(d => Object.assign({ no: d.no, key: d.key, label: d.label, curr: null, prev: null, qty: 0, factor: 1, unit: 0, amount: 0, note: '' }, map[d.no] || {}, { key: d.key, label: d.label }));
  };
  B.total = (lines) => lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);

  /* Dựng dòng cho kỳ mới từ biểu phí + chỉ số (UI-11). Chỉ chia ngày một lần:
     tiền phòng theo ngày tính tiền phòng, DV cố định theo ngày bắt đầu DV; cọc, nợ cũ, điện/nước theo chỉ số không chia ngày. */
  B.buildLines = (o) => {
    const { stay, rate, period, reading = {}, people = 1, vehicles = 0, depositDue = 0, oldDebt = 0, common = null, other = null, roundLines = true } = o;
    const Dt = C.dates;
    const rent = Dt.proRata(rate.rent || 0, stay.rentStart, period, stay.stopBillingDate);
    const svc = Dt.proRataDays(stay.svcStart || stay.rentStart, period, stay.stopBillingDate);
    const svcF = svc.days / svc.denom;
    const it = rate.items || {};
    const L = [];
    L.push({ no: 1, qty: stay.payMonths || 1, factor: rent.factor, unit: rate.rent || 0, amount: round((rate.rent || 0) * rent.factor * (stay.payMonths || 1), roundLines), days: rent.days, denom: rent.denom });
    L.push({ no: 2, qty: depositDue ? 1 : 0, factor: 1, unit: depositDue, amount: depositDue });
    const el = it.electric || {};
    const eq = reading.elCurr != null && reading.elPrev != null ? Math.max(0, reading.elCurr - reading.elPrev) : 0;
    L.push({ no: 3, curr: reading.elCurr ?? null, prev: reading.elPrev ?? null, qty: eq, factor: 1, unit: el.unit || 0, amount: round(eq * (el.unit || 0), roundLines) });
    const wa = it.water || {};
    if (wa.method === 'meter') {
      const wq = reading.waCurr != null && reading.waPrev != null ? Math.max(0, reading.waCurr - reading.waPrev) : 0;
      L.push({ no: 4, curr: reading.waCurr ?? null, prev: reading.waPrev ?? null, qty: wq, factor: 1, unit: wa.unit || 0, amount: round(wq * (wa.unit || 0), roundLines) });
    } else {
      const q = wa.unit ? people : 0;
      L.push({ no: 4, qty: q, factor: svcF, unit: wa.unit || 0, amount: round(q * (wa.unit || 0) * svcF, roundLines) });
    }
    [['cleaning', 5], ['internet', 6], ['elevator', 7], ['ev', 8], ['washer', 9], ['combo', 10]].forEach(([k, no]) => {
      const x = it[k] || {};
      const q = !x.unit ? 0 : x.method === 'person' ? people : x.method === 'vehicle' ? vehicles : (x.qty || 1);
      L.push({ no, qty: q, factor: svcF, unit: x.unit || 0, amount: round(q * (x.unit || 0) * svcF, roundLines) });
    });
    L.push({ no: 11, qty: oldDebt ? 1 : 0, factor: 1, unit: oldDebt, amount: oldDebt });
    L.push(common ? { no: 12, qty: common.qty, factor: 1, unit: common.unit, amount: round(common.amount, roundLines), note: common.note || '' } : { no: 12, qty: 0, factor: 1, unit: 0, amount: 0 });
    L.push(other ? { no: 13, qty: 1, factor: 1, unit: round(other.amount, roundLines), amount: round(other.amount, roundLines), note: other.note || '' } : { no: 13, qty: 0, factor: 1, unit: 0, amount: 0 });
    return B.expand(L);
  };

  /* Thu khác = tiền những ngày lẻ của tháng trước chưa thu: (giá [+ DV]) / số ngày tháng trước × số ngày */
  B.carryOther = ({ monthly, services = 0, startISO, period, includeServices = false }) => {
    const prev = C.dates.prevPeriod(period);
    const r = C.dates.proRataDays(startISO, prev);
    if (!r.days || !startISO || startISO.slice(0, 7) !== prev) return null;
    const base = monthly + (includeServices ? services : 0);
    return { amount: base / r.denom * r.days, days: r.days, denom: r.denom, note: `${r.days} ngày lẻ tháng ${Number(prev.slice(5))} (${includeServices ? 'tiền phòng + DV' : 'tiền phòng'})` };
  };

  /* Chia điện chung: theo số phòng hoặc theo tổng số người */
  /* Gắn cờ tháng lẻ lệch quy tắc (§3.12b): hệ số dòng 1 ≠ số ngày thực/số ngày của tháng, hoặc đơn giá tiền phòng lẻ (Excel chia ngày trong đơn giá) */
  B.prorataFlag = (line1, expected) => {
    if (!line1 || !expected) return null;
    if (line1.factor > 0 && line1.factor < 1 && Math.abs(line1.factor - expected.days / expected.denom) > 1e-4) return `Hệ số tháng lẻ ${line1.factor.toFixed(4)} ≠ ${expected.days}/${expected.denom} ngày`;
    // Đơn giá lẻ = Excel chia ngày ngay trong đơn giá; hợp lệ nếu quy ngược ra giá tháng tròn nghìn theo đúng số ngày của tháng
    const u = line1.unit;
    if (line1.factor === 1 && u && Math.abs(u - Math.round(u)) > 0.001) {
      const ok = Array.from({ length: expected.denom }, (_, i) => i + 1).some(d => { const m = u * expected.denom / d; return Math.abs(m - Math.round(m / 1000) * 1000) < 1; });
      if (!ok) return `Đơn giá tiền phòng ${u.toFixed(2)} đã chia ngày nhưng không theo mẫu số ${expected.denom} ngày của tháng`;
    }
    return null;
  };
  B.splitShared = ({ prev, curr, unit, rooms, method = 'rooms' }) => {
    const qty = Math.max(0, curr - prev), amount = qty * unit;
    const totalPeople = rooms.reduce((s, r) => s + (r.people || 0), 0) || 1;
    return rooms.map(r => {
      const share = method === 'people' ? (r.people || 0) / totalPeople : 1 / rooms.length;
      return { roomId: r.roomId, qty: Math.round(qty * share * 100) / 100, unit, amount: amount * share };
    });
  };

  /* Phá HĐ / bỏ trốn: giữ cọc, chỉ thu tiền điện theo chỉ số (GĐ OQ-03) */
  B.breachLines = (lines, charge = ['electric']) => B.expand(lines).map(l => charge.includes(l.key) ? l : Object.assign({}, l, { qty: 0, amount: 0, note: l.amount ? 'Không thu (phá HĐ)' : '' }));

  /* Kiểm tra trước phát hành */
  B.checkBeforeIssue = (inv, ctx = {}) => {
    const errs = [], warns = [];
    const lines = B.expand(inv.lines);
    const tot = B.total(lines);
    if (inv.totalDue != null && Math.abs(tot - inv.totalDue) > 1) errs.push(`Tổng in (${Math.round(tot)}) ≠ tổng cần đóng (${Math.round(inv.totalDue)})`);
    const el = lines[2];
    if (el.curr != null && el.prev != null && el.curr < el.prev) errs.push('Chỉ số điện mới nhỏ hơn chỉ số cũ');
    if (ctx.duplicate) errs.push('Đã có hóa đơn cho lượt thuê này trong kỳ');
    if (ctx.missingReading) warns.push('Thiếu chỉ số điện/nước của kỳ');
    if (!inv.accountId) warns.push('Tòa chưa gán tài khoản nhận tiền');
    return { ok: !errs.length, errs, warns, total: tot };
  };

  /* 4 biến thể mẫu in: cùng bố cục, khác nguồn dữ liệu và tài khoản nhận (UI-12) */
  B.TEMPLATES = {
    VP: { key: 'VP', name: 'HĐ (VP)', group: 'S', version: 'VP-v4', accountTemplate: 'VP', transferPrefix: '' },
    VP_HANG: { key: 'VP_HANG', name: 'HĐ (VP-HẰNG)', group: 'S', version: 'VP-HẰNG-v4', accountTemplate: 'VP_HANG', transferPrefix: '' },
    TECH: { key: 'TECH', name: 'HĐ (TECH)', group: 'T', version: 'TECH-v4', accountTemplate: 'TECH', transferPrefix: '' },
    G1_TECH: { key: 'G1_TECH', name: 'HĐ G1 (TECH)', group: 'G', version: 'G1-TECH-v4', accountTemplate: 'G1_TECH', transferPrefix: '' },
  };
  B.printModel = (inv, ctx) => {
    const p = inv.period, [y, m] = p.split('-');
    const prev = C.dates.prevPeriod(p), [py, pm] = prev.split('-');
    const allLines = B.expand(inv.lines);
    const extended = Number((allLines[12] || {}).amount) !== 0;
    const lines = extended ? allLines : allLines.slice(0, 12);
    const pad = (n) => String(n).padStart(2, '0');
    const dd = (iso) => iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '';
    const fee = ctx.lateFee != null ? ctx.lateFee : 200000;
    const acc = ctx.account || {};
    const tpl = B.TEMPLATES[ctx.template] || B.TEMPLATES.VP;
    return {
      template: tpl.name,
      templateVersion: `${tpl.version} · ${extended ? 'Mẫu mở rộng · 13 dòng' : 'Mẫu chuẩn · 12 dòng'}`,
      title: `HÓA ĐƠN THÁNG ${Number(m)}/${y}`,
      intro: `Xin thông báo để anh/chị biết tiền thuê phòng Tháng ${Number(m)} và tiền dịch vụ Tháng ${Number(m)} năm ${y} như sau:`,
      customerCode: ctx.customerCode, room: ctx.roomCode, cutoff: dd(inv.cutoff),
      rows: lines.map(l => ({ no: l.no, label: l.label, curr: l.curr, prev: l.prev, qty: l.qty, factor: l.factor, unit: l.unit, amount: l.amount, note: l.note })),
      total: B.total(lines),
      noteJ7: `ĐỀ NGHỊ QUÝ KHÁCH HÀNG THANH TOÁN ĐÚNG HẠN NGÀY ${Number((inv.dueTo || '').slice(8, 10))}/${Number(pm)} VÀ GHI ĐÚNG NỘI DUNG CK. TRƯỜNG HỢP THANH TOÁN CHẬM PHÍ PHẠT ${Math.round(fee / 1000)}K/NGÀY.`,
      dueText: `Yêu cầu khách hàng thanh toán đầy đủ và đúng hạn từ ngày ${Number((inv.dueFrom || '').slice(8, 10))} đến ngày ${Number((inv.dueTo || '').slice(8, 10))} tháng ${Number(pm)} năm ${py}`,
      warnText: 'Quá thời hạn thanh toán trên, nếu khách hàng chưa thanh toán thì Ban Quản Lý Tòa Nhà sẽ cắt dịch vụ và trục xuất ra khỏi phòng',
      transfer: tpl.transferPrefix + ctx.customerCode,
      accountTemplate: tpl.accountTemplate,
      transferNote: 'LƯU Ý: QUÝ KHÁCH HÀNG CHUYỂN KHOẢN KHÔNG ĐÚNG NỘI DUNG KẾ TOÁN KHÔNG CHECK ĐƯỢC SẼ TÍNH LÀ CHƯA THANH TOÁN. TRÂN TRỌNG !',
      accountLine: acc.number ? `TK ${acc.number} - ${acc.bank} - ${acc.holder}` : '(chưa gán tài khoản nhận)',
      closing: 'TRÂN TRỌNG THÔNG BÁO',
      pad,
    };
  };
  C.billing = B;
})(window.TH);
