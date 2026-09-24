// UI-04 — Tòa 25A Phú Diễn, ứng viên tạo từ HĐ chủ nhà mẫu (trạng thái Chuẩn bị).
import { page, chip, btn, card, table, tabs, alert, dl, grid, note, icon, vnd } from '../shell.mjs';
import { LANDLORD, BUILDING, LEASE, HANDOVER } from '../data/landlord-tungsoi.mjs';

const field = (label, value, extra = '', cls = '') => `<div class="field"><label>${label}</label><div class="in ${cls}">${value}${extra}</div></div>`;
const meters = HANDOVER.filter((h) => h[3] === 'meter');

const body = `
${tabs(['Tổng quan', 'Phòng (0)', 'Phân công', 'Giá DV', 'Công tơ (2)', 'HĐ nguồn', 'Tài sản (11)', 'Báo cáo', 'Tài liệu', 'Lịch sử'], 0)}
${alert('Tòa ứng viên từ HĐ chủ nhà', 'Chỉ địa chỉ, kết cấu, mục đích và phạm vi có trên HĐ. Số tầng, diện tích sàn và GCN để trống trên mẫu — bổ sung trước khi chuyển Đang khai thác.', 'info')}
${grid('1fr 1fr', [
  card(`${icon('building', 16)} ② Cơ bản`, `
    ${field('Mã tòa (bất biến sau khi lưu)', `<span class="mono b">${BUILDING.codeExample}</span>`, chip('Ví dụ · người review đặt', 'assumed'))}
    ${field('Địa chỉ', BUILDING.address, chip('Đ.1', 'info', 'link'), 'ro')}
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
      ${field('Số tầng', '<span class="muted">—</span>', chip('Trống trên HĐ', 'warn'), 'err')}
      ${field('Diện tích sàn (m²)', '<span class="muted">—</span>', chip('Trống trên HĐ', 'warn'), 'err')}
      ${field('Kết cấu', BUILDING.structure, '', 'ro')}
      ${field('Mục đích', BUILDING.purpose, '', 'ro')}
    </div>`),
  card(`${icon('layers', 16)} ③ Phân loại · ⑤ Thu tiền`, dl([
    ['Nhóm T/S/G', '<span class="muted">Chọn khi kích hoạt · lịch sử riêng</span>'],
    ['Hạng L1–L3', '<span class="muted">Chọn khi kích hoạt · lịch sử riêng</span>'],
    ['Quản lý phụ trách', '<span class="muted">Chưa phân công (UI-20)</span>'],
    ['Chủ nhà · HĐ đầu vào', `${LANDLORD.name} · ${LEASE.code} (Nháp)`],
    ['Tiền thuê đầu vào', `${vnd(LEASE.rent)} đ/tháng`],
    ['TK nhận tiền khách', '<span class="muted">Chọn TK mặc định của tòa</span>'],
    ['Ngày chốt chỉ số', '22'],
  ], 1)),
])}
<div style="height:14px"></div>
${grid('1fr 1.25fr', [
  card(`${icon('gauge', 16)} ⑥ Công tơ cấp tòa — từ phụ lục bàn giao`, table([{ h: 'Phụ lục' }, { h: 'Loại' }, { h: 'Mã' }, { h: 'Chỉ số bàn giao' }], meters.map((m) => [
    `Nhóm 2 · STT ${m[0]}`, m[1] === 'Công tơ điện' ? 'MAIN · điện' : 'MAIN · nước', `<span class="muted">Chờ nhập</span>`, `<span class="muted">Chờ nhập</span>`,
  ]), { compact: 1 }) + `<div style="padding:0 14px 12px">${note('Công tơ tổng chỉ đối chiếu hóa đơn NCC, KHÔNG lên hóa đơn khách. Công tơ khu vực chung (COMMON) khai báo riêng khi có.')}</div>`, '', 'flush'),
  card(`${icon('shield', 16)} ⑦ Hồ sơ pháp lý`, table([{ h: 'Loại' }, { h: 'Đăng ký' }, { h: 'Xác minh' }, { h: 'Căn cứ' }], [
    ['Giấy CN nhà đất (GCN)', chip('Chưa có', 'warn'), '—', 'Đ.1 · số, nơi cấp, ngày trống'],
    ['Hồ sơ PCCC', chip('Chưa có', 'warn'), '—', 'Đ.6.1 · bên A lo PCCC'],
    ['Giấy ĐK hộ kinh doanh', chip('Chưa có', 'warn'), '—', 'Đ.6.1 · bên A đăng ký KD, nộp thuế'],
    ['HĐ thuê nhà đã ký', chip('Có file', 'ok'), chip('Chờ', 'neutral'), 'Job LLX-001'],
    ['Phụ lục bàn giao tài sản', chip('Có file', 'ok'), chip('Chờ', 'neutral'), '13 hạng mục'],
    ['Phụ lục góp vốn 3 bên', chip('Làm sau', 'neutral', 'clock'), '—', 'Đ.7.2 · module Cổ đông'],
  ], { compact: 1 }), btn('Tải tài liệu', 'outline sm', 'upload'), 'flush'),
])}
${card(`${icon('chart', 16)} ⑧ Chỉ số từ báo cáo`, `<p class="muted">Chưa có kỳ đã khóa — tòa ở trạng thái Chuẩn bị. Chỉ số hiệu suất và lợi nhuận hiện sau kỳ đầu tiên được khóa, không tính realtime.</p>`)}
`;

export default {
  file: 'UI-04-building-verified.png',
  html: page({
    active: 'UI-04', breadcrumb: ['Nguồn nhà & tòa/phòng', 'Tòa nhà', '25A Phú Diễn'],
    title: '25A Phú Diễn', status: chip('Chuẩn bị', 'neutral'),
    subtitle: `${BUILDING.scope} · chủ nhà ${LANDLORD.name} · HĐ ${LEASE.code} · 0 phòng`,
    actions: `${btn('Thêm tài liệu', 'outline', 'upload')}${btn('Phân công', 'outline', 'users')}${btn('Tạo phòng', 'primary', 'plus')}`,
    body,
  }),
};
