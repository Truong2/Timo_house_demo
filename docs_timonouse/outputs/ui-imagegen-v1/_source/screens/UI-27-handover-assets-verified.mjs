// UI-27 — Tài sản bàn giao từ Phụ lục I của HĐ chủ nhà mẫu: thuộc CHỦ NHÀ, không vốn hóa, không khấu hao.
import { page, chip, btn, card, table, tabs, alert, grid, note, icon, filters, rowCls } from '../shell.mjs';
import { HANDOVER, LANDLORD, LEASE } from '../data/landlord-tungsoi.mjs';

const rows = HANDOVER.map(([stt, name, cat, kind], i) => rowCls([
  `<span class="muted">${i < 4 ? 'Nhóm 1' : 'Nhóm 2'} · ${stt}</span>`,
  `<b>${name}</b>`,
  cat,
  `<span class="wtx">${icon('alert', 12)} Trống</span>`,
  'Sử dụng bình thường',
  kind === 'meter' ? chip('→ Công tơ UI-04', 'info', 'gauge') : chip('Chủ nhà', 'neutral', 'user'),
  '<span class="muted">Không</span>',
], kind === 'meter' ? 'hl' : ''));

const body = `
${tabs(['Tài sản công ty đầu tư', `Tài sản bàn giao của chủ nhà (${HANDOVER.length})`, 'Lịch khấu hao', 'Điều chuyển'], 1)}
${filters([['Tòa', '25A Phú Diễn'], ['Nguồn', `Phụ lục HĐ ${LEASE.code}`], ['Nhóm', 'Tất cả'], ['Sở hữu', 'Chủ nhà']], btn('Xuất biên bản', 'outline', 'download'))}
${grid('1fr 1fr', [
  alert('Tài sản của chủ nhà — không vốn hóa, không khấu hao', 'Theo dõi để bàn giao lại khi chấm dứt HĐ. Khấu hao chỉ áp cho tài sản công ty tự đầu tư (tab đầu).', 'info'),
  alert('Phụ lục II lệch Điều 7.1', 'PL II: trả lại tài sản “(Không tính hao mòn theo thời gian)”. Đ.7.1: giao lại nhà “trừ hao mòn theo thời gian”. Lưu cả hai, kế toán chốt khi quyết toán.', 'warn'),
])}
${card(`${icon('package', 16)} Phụ lục I — Nội dung bàn giao · ${LANDLORD.name}`, table([
  { h: 'STT trên phụ lục' }, { h: 'Tên tài sản' }, { h: 'Nhóm' }, { h: 'Số lượng' }, { h: 'Tình trạng' }, { h: 'Sở hữu / đích' }, { h: 'Khấu hao' },
], rows, { compact: 1, foot: '<span>Nguyên văn phụ lục: cột Số lượng (chiếc/bộ) để trống cả 13 dòng · STT đánh lại từ 1 ở nhóm 2 · dòng 10–18 trống</span><span>11 tài sản + 2 công tơ</span>' }), btn('Nhập số lượng', 'outline sm', 'edit'), 'flush')}
${grid('1fr 1fr 1fr', [
  card('Việc cần làm trước bàn giao', `<div class="dl c1">
    <div><dt>Nhập số lượng thực tế</dt><dd class="wtx">13 dòng</dd></div>
    <div><dt>Ảnh hiện trạng</dt><dd class="wtx">Chưa có</dd></div>
    <div><dt>Chữ ký hai bên trên biên bản</dt><dd class="wtx">Chưa có</dd></div>
  </div>`),
  card('Khi chấm dứt HĐ', `<p>Bên B trả đủ tài sản; mất hoặc hỏng thì sửa hoặc bồi thường đúng chủng loại (PL II). Bên A tự sửa thì bên B chịu chi phí.</p>`),
  card('Liên kết', `<div class="dl c1">
    <div><dt>Công tơ điện · đồng hồ nước</dt><dd>Tạo công tơ ở UI-04</dd></div>
    <div><dt>Cờ “Là vốn góp ban đầu”</dt><dd>${chip('Làm sau', 'neutral', 'clock')}</dd></div>
  </div>${note('Cờ vốn góp dùng cho tài sản công ty đầu tư, bật khi có module Cổ đông (UI-29).')}`),
])}
`;

export default {
  file: 'UI-27-handover-assets-verified.png',
  html: page({
    active: 'UI-27', breadcrumb: ['Nguồn nhà & tòa/phòng', 'Tài sản & khấu hao', 'Bàn giao của chủ nhà'],
    title: 'Tài sản bàn giao · 25A Phú Diễn', status: chip('Chờ xác nhận', 'warn'),
    subtitle: `Trích từ Phụ lục I của HĐ ${LEASE.code} · job LLX-001`,
    actions: `${btn('In biên bản', 'outline', 'printer')}${btn('Xác nhận bàn giao', 'primary', 'check')}`,
    body,
  }),
};
