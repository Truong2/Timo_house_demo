// UI-03 — Trích xuất HĐ chủ nhà (upload → trích xuất → review → commit), bố cục 3 vùng như UI-08.
// Số liệu và nguyên văn lấy từ data/landlord-tungsoi.mjs (HĐ mẫu tùng sói).
import { page, chip, btn, card, table, stepper, alert, note, grid, icon, rowCls } from '../shell.mjs';
import { SRC, FIELDS, HANDOVER } from '../data/landlord-tungsoi.mjs';

const DEC = (d) => (d === 'Làm sau' ? chip(d, 'neutral', 'clock') : `<span class="tag">${d}</span>`);

const all = FIELDS.flatMap((g) => g.rows);
const nOk = all.filter((r) => r[3] === 'ok').length;
const nWarn = all.filter((r) => r[3] === 'warn').length;

const MARK = { ok: `<span class="pos">${icon('check', 13)}</span>`, warn: `<span class="wtx">${icon('alert', 13)}</span>`, conflict: `<span class="neg">${icon('x', 13)}</span>` };
const rows = FIELDS.flatMap((g) => [
  rowCls([`<b>${g.group}</b> <span class="mono muted">${g.dieu}</span>`, `<span class="muted">→ ${g.target}</span>`, DEC(g.decision)], 'hl'),
  ...g.rows.map(([f, raw, norm, st]) => rowCls(
    [`<span style="display:inline-flex;gap:6px;align-items:center">${MARK[st]}${f}</span>`, `<span class="muted">${raw}</span>`, norm],
    st === 'conflict' ? 'dangerrow' : st === 'warn' ? 'warnrow' : '',
  )),
]);

const viewer = card(`${icon('file', 16)} Tệp & trang`, `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
    <span class="btn sm">${icon('arrowLeft', 12)} 3 / ${SRC.pages} ${icon('arrowRight', 12)}</span><span class="tag">100 %</span>
  </div>
  <div style="border:1px solid var(--bd);border-radius:6px;padding:14px 12px;background:#fff;font-size:10.5px;line-height:1.6;color:#334155;min-height:380px">
    <div style="text-align:center;font-weight:700;font-size:11px;margin-bottom:8px">ĐIỀU 4: TIỀN THUÊ NHÀ VÀ<br/>PHƯƠNG THỨC THANH TOÁN</div>
    <div style="background:#DBEAFE;outline:2px solid var(--sec);border-radius:2px;padding:2px 3px">4.1. Tiền thuê nhà mà bên B phải trả cho bên A là: <b>114.000.000 đồng/tháng</b>.</div>
    <div>(Bằng chữ: Một trăm mười bốn triệu đồng chẵn)</div>
    <div style="color:#94A3B8">Tiền thuế nhà đất hàng năm và thuế thu nhập cá nhân… do bên A chịu.</div>
    <div style="color:#94A3B8">4.2. … giá thuê được điều chỉnh theo thị trường…</div>
    <div style="background:#FEF3C7;border-radius:2px;padding:2px 3px;margin-top:4px">4.4. Thanh toán theo kỳ <b>03 tháng/lần</b> … vào <b>ngày 01 đến ngày 10</b> của tháng đầu tiên trong kỳ thanh toán đó.</div>
    <div style="text-align:center;font-weight:700;font-size:11px;margin:10px 0 6px">ĐIỀU 5: TIỀN ĐẶT CỌC</div>
    <div style="background:#FEE2E2;outline:2px solid var(--dan);border-radius:2px;padding:2px 3px">5.1. … tiền đặt cọc là: <b>114.000.000 đồng/tháng</b></div>
    <div style="color:#94A3B8">5.2. Bên A hoàn trả tiền đặt cọc trong các trường hợp…</div>
  </div>
  <div class="dl c1" style="margin-top:10px">
    <div><dt>Raw</dt><dd>${icon('eye', 12)}</dd></div><div><dt>Chuẩn hóa</dt><dd>${icon('check', 12)}</dd></div><div><dt>Trang / vùng</dt><dd>tr.3 · Đ.4.1</dd></div>
  </div>`);

const body = `
${stepper(['Upload', 'Trích xuất', 'Review', 'Validate', 'Commit'], 2)}
${alert('Chỉ nhận HĐ thuê nguyên tòa từ chủ nhà', 'Hợp đồng thuê phòng của khách đi qua UI-08. Giá trị trong file chỉ là đề xuất: người review xác nhận từng nhóm; trường trống giữ trống, hệ thống không suy diễn.', 'info')}
${grid('230px 1fr', [
  viewer,
  card(`${icon('layers', 16)} ② Nhóm trường theo Điều`, table([
    { h: 'Trường', w: '165px' }, { h: 'Nguyên văn trong HĐ' }, { h: 'Chuẩn hóa / đích', w: '200px' },
  ], rows, { compact: 1, foot: `<span>${icon('check', 12)} đọc được · ${icon('alert', 12)} cảnh báo · ${icon('x', 12)} chặn commit · quyết định Create / Link / Ignore theo nhóm</span><span>${all.length} trường · ${FIELDS.length} nhóm</span>` }), btn('Chỉ hiện cần xử lý', 'outline sm', 'filter'), 'flush'),
])}
`;

const counters = `<div class="dl c2">
  <div><dt>Đọc được</dt><dd>${nOk}</dd></div><div><dt>Cảnh báo</dt><dd class="wtx">${nWarn}</dd></div>
  <div><dt>Xung đột chặn</dt><dd class="neg">3</dd></div><div><dt>Tài sản phụ lục</dt><dd>${HANDOVER.length}</dd></div>
</div>`;

const conflict = (n, title, text, opts) => `<div style="border:1px solid #FECACA;background:#FEF2F2;border-radius:8px;padding:9px 10px;margin-bottom:8px">
  <b style="color:#991B1B;display:flex;gap:6px;align-items:center">${icon('x', 14)} ${n}. ${title}</b>
  <p style="color:var(--tx2);font-size:12px;margin:3px 0 6px">${text}</p>
  <div style="display:flex;gap:6px;flex-wrap:wrap">${opts.map((o) => `<span class="btn sm">${o}</span>`).join('')}</div></div>`;

const rail = `
<h3>Job ${SRC.job}</h3>
<p class="muted" style="font-size:12px">${SRC.file}<br/>${SRC.sizeKb} KB · ${SRC.pages} trang · hash ${SRC.hash}… · ${SRC.uploadedBy} tải ${SRC.uploadedAt}</p>
<h4>③ Tổng hợp</h4>${counters}
<h4>④ Xung đột phải chọn trước commit</h4>
${conflict(1, 'Ngày thuê để trống', 'Đ.2.1 ngày giao nhà và Đ.2.2 “từ …… đến ……” trống → chưa sinh được lịch trả.', ['Nhập ngày', 'Lưu nháp chờ bổ sung'])}
${conflict(2, 'Tiền cọc ghi “/tháng”', 'Đ.5.1: 114.000.000 đồng/tháng. Cọc là khoản một lần.', ['114.000.000 · một lần', 'Hỏi lại chủ nhà'])}
${conflict(3, 'Bên B là cá nhân', 'Nguyễn Đình Chung ký cá nhân, không phải pháp nhân Timehouse.', ['Ký thay Timehouse · cần ủy quyền', 'Giữ cá nhân'])}
<h4>⑤ Cảnh báo không chặn</h4>
<div style="font-size:12px;line-height:1.7">
  ${chip('Đỏ', 'danger')} Chậm trả 01 tháng → chủ nhà được lấy nhà (6.2, 10.2)<br/>
  ${chip('Lệch', 'warn')} Phạt bên A: 03 tháng thuê (6.1) ≠ 03 lần cọc (10.4)<br/>
  ${chip('Lệch', 'warn')} Trả tài sản “không tính hao mòn” (PL II) ≠ “trừ hao mòn” (7.1)<br/>
  ${chip('Thiếu', 'warn')} GCN, số tầng, DT sàn, TK ngân hàng, SL tài sản
</div>
<h4>Kết quả khi commit</h4>
<div class="dl c1">
  <div><dt>${icon('user', 13)} Chủ nhà</dt><dd>1 · Create</dd></div>
  <div><dt>${icon('file', 13)} HĐ đầu vào</dt><dd>1 · Nháp</dd></div>
  <div><dt>${icon('building', 13)} Tòa</dt><dd>1 · ứng viên</dd></div>
  <div><dt>${icon('database', 13)} Tài liệu</dt><dd>3 · HĐ, PL bàn giao, CCCD</dd></div>
  <div><dt>${icon('package', 13)} Tài sản chủ nhà</dt><dd>11</dd></div>
  <div><dt>${icon('gauge', 13)} Công tơ điện · nước</dt><dd>2 · chờ mã</dd></div>
  <div><dt>${icon('layers', 13)} Phòng</dt><dd>0 · tạo ở UI-05</dd></div>
</div>
${note('Commit là một transaction: lỗi một entity thì rollback toàn bộ. Upload trùng hash mở lại job cũ.')}
`;

export default {
  file: 'UI-03-head-lease-extract-verified.png',
  html: page({
    active: 'UI-03', breadcrumb: ['Nguồn nhà & tòa/phòng', 'Chủ nhà', 'Tạo từ HĐ chủ nhà'],
    title: 'Trích xuất HĐ chủ nhà', status: chip('Đang review', 'info', 'scan'),
    subtitle: 'Route đề xuất #/landlords/import · nguồn: HĐ thuê nhà 2026 (mẫu) — Phí Văn Thắng · 25A Phú Diễn',
    actions: `${btn('Validate', 'outline', 'check')}${btn('Commit · còn 3 xung đột', 'primary dis', 'lock')}`,
    body, rail,
  }),
};
