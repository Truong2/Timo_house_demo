/* Bản in hóa đơn tháng (4 mẫu, 13 dòng) và phiếu hoàn cọc HĐ (HOÀN CỌC). Dùng cho xem trước và trang in (A4). */
(function (TH) {
  const F = TH.f, esc = F.esc, Q = TH.q, S = TH.store;
  const P = {};
  const n = (v, dec) => v == null || v === '' ? '' : (dec ? F.dec(v, dec) : F.vnd(v));
  P.invoiceHtml = (inv) => {
    const b = Q.building(inv.buildingId); const acc = Q.account(inv.accountId);
    const m = TH.calc.billing.printModel(inv, { template: inv.template, account: acc, customerCode: inv.customerCode, roomCode: Q.roomCode(inv.roomId), lateFee: Q.param('lateFeePerDay') });
    const factor = (r) => r.factor == null ? '' : Math.abs(r.factor - 1) < 1e-9 ? '1' : F.dec(r.factor, 4);
    return `<div class="inv-print">
      <div class="ip-tpl">${esc(m.template)} · Tòa ${esc(b.code)}</div>
      <h2 class="ip-title">${esc(m.title)}</h2>
      <p class="ip-intro">${esc(m.intro)}</p>
      <div class="ip-head"><span>Mã KH: <b>${esc(m.customerCode)}</b></span><span>Phòng số: <b>${esc(m.room)}</b></span><span>Ngày chốt số liệu: <b>${esc(m.cutoff)}</b></span></div>
      <table class="ip-tbl"><thead><tr><th>STT</th><th>Nội dung</th><th>Chỉ số mới</th><th>Chỉ số cũ</th><th>Số lượng</th><th>Hệ số</th><th>Đơn giá</th><th>Thành tiền</th><th>Ghi chú</th></tr></thead><tbody>
      ${m.rows.map((r, i) => `<tr class="${r.no === 13 ? 'ip-new' : ''}"><td class="tc">${r.no}</td><td>${esc(r.label)}</td><td class="tr">${r.curr == null ? '' : F.num0(r.curr)}</td><td class="tr">${r.prev == null ? '' : F.num0(r.prev)}</td>
        <td class="tr">${r.qty ? F.dec(r.qty, r.qty % 1 ? 2 : 0) : ''}</td><td class="tr">${r.qty ? factor(r) : ''}</td><td class="tr">${r.unit ? n(r.unit) : ''}</td><td class="tr">${r.amount ? n(r.amount) : '0'}</td>
        <td class="ip-note">${i === 0 ? esc(m.noteJ7) : esc(r.note || '')}</td></tr>`).join('')}
      <tr class="ip-total"><td colspan="7">TỔNG CỘNG TIỀN THANH TOÁN</td><td class="tr">${F.vnd(m.total)}</td><td></td></tr></tbody></table>
      <p class="ip-words">Bằng chữ: <i>${esc(F.words(m.total))}</i></p>
      <p>${esc(m.dueText)}</p><p class="ip-warn">${esc(m.warnText)}</p>
      <p>Nội dung chuyển khoản: <b>${esc(m.transfer)}</b></p><p class="ip-small">${esc(m.transferNote)}</p>
      <p><b>${esc(m.accountLine)}</b></p><p class="ip-close">${esc(m.closing)}</p></div>`;
  };
  P.refundHtml = (r) => {
    const s = Q.stay(r.stayId); const c = Q.customer(s.customerId) || {};
    const rows = [{ label: 'Tiền phòng cọc', amount: r.deposit, sign: '' }, ...(r.extraRent && !r.deductExtra ? [{ label: `Tiền phòng ${r.extraDays} ngày ở thêm (không trừ vào cọc – thu ở hóa đơn cuối)`, amount: 0, note: F.vnd(r.extraRent) }] : []),
      ...r.deductions.map(d => ({ label: TH.calc.refund.kindLabel(d.kind) + (d.note ? ' – ' + d.note : ''), curr: d.curr, prev: d.prev, qty: d.qty, unit: d.unit, amount: d.amount, sign: '−' }))];
    return `<div class="inv-print">
      <div class="ip-tpl">HĐ (HOÀN CỌC) · ${esc(r.code)}</div><h2 class="ip-title">HÓA ĐƠN HOÀN CỌC</h2>
      <div class="ip-head"><span>Mã KH: <b>${esc(s.code)}</b></span><span>Phòng số: <b>${esc(Q.roomCode(s.roomId))}</b></span><span>Ngày chốt số liệu: <b>${F.date(r.handoverDate)}</b></span></div>
      <p>Khách hàng: <b>${esc(c.name || '')}</b></p>
      <table class="ip-tbl"><thead><tr><th>STT</th><th>Nội dung</th><th>Chỉ số mới</th><th>Chỉ số cũ</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th><th>Ghi chú</th></tr></thead><tbody>
      ${rows.map((x, i) => `<tr><td class="tc">${i + 1}</td><td>${esc(x.label)}</td><td class="tr">${x.curr == null ? '' : F.num0(x.curr)}</td><td class="tr">${x.prev == null ? '' : F.num0(x.prev)}</td><td class="tr">${x.qty || ''}</td><td class="tr">${x.unit ? F.vnd(x.unit) : ''}</td><td class="tr">${x.sign || ''}${F.vnd(x.amount)}</td><td class="ip-note">${esc(x.note || '')}</td></tr>`).join('')}
      <tr class="ip-total"><td colspan="6">TỔNG KHẤU TRỪ (BC)</td><td class="tr">${F.vnd(r.bc)}</td><td></td></tr>
      <tr class="ip-total"><td colspan="6">TỔNG TIỀN HOÀN CỌC (BD = cọc − BC)</td><td class="tr">${F.vnd(Math.max(0, r.bd))}</td><td>${r.bd < 0 ? 'Vượt cọc ' + F.vnd(-r.bd) + ' – xử lý công nợ riêng' : ''}</td></tr></tbody></table>
      <p class="ip-words">Bằng chữ: <i>${esc(F.words(Math.max(0, r.bd)))}</i></p>
      ${r.status === 'paid' ? `<p>Đã chi ngày ${F.date(r.paidAt)}: <b>${F.vnd(r.paidAmount)}</b> (${r.method === 'cash' ? 'tiền mặt' : 'chuyển khoản'})</p>` : '<p class="ip-warn">Phiếu chưa chi – bản xem trước</p>'}
      <div class="ip-sign"><div>Khách nhận tiền</div><div>Kế toán</div><div>Đại diện TimoHouse</div></div>
      <p class="ip-close">Xin chân thành cảm ơn khách hàng đã tin chọn Timehouse trong thời gian qua!!</p></div>`;
  };
  TH.print = P;
})(window.TH);
