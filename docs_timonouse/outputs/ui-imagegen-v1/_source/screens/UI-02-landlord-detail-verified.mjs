// UI-02 — Chi tiết chủ nhà Phí Văn Thắng, tạo từ job trích xuất HĐ mẫu tùng sói.
import { page, chip, btn, card, table, tabs, alert, dl, grid, note, icon, vnd } from '../shell.mjs';
import { LANDLORD, BUILDING, LEASE, SRC } from '../data/landlord-tungsoi.mjs';

const body = `
${tabs(['Tổng quan', 'HĐ đầu vào (1)', 'Tòa nhà (1)', 'Thanh toán', 'Tài liệu (3)', 'Lịch sử'], 0)}
${alert('Hồ sơ tạo từ trích xuất HĐ — còn thiếu thông tin', 'Tài khoản nhận tiền không có trên HĐ mẫu (Đ.4.4 chỉ ghi “chuyển khoản hoặc tiền mặt”). Bổ sung trước khi kích hoạt HĐ đầu vào để sinh lệnh trả tiền.', 'warn', btn('Bổ sung TK', 'outline sm', 'plus'))}
${grid('1fr 1fr', [
  card(`${icon('user', 16)} ② Bên A — thông tin định danh`, dl([
    ['Mã', `<span class="mono">${LANDLORD.code}</span>`],
    ['Loại', LANDLORD.type],
    ['Họ tên', `<b>${LANDLORD.name}</b>`],
    ['CCCD', `<span class="mono">${LANDLORD.idNo}</span>`],
    ['Ngày cấp', LANDLORD.idIssued],
    ['Nơi cấp', LANDLORD.idPlace],
    ['Người đại diện / ủy quyền', '<span class="muted">Không có trên HĐ</span>'],
    ['Trạng thái', chip('Hoạt động', 'ok')],
  ], 1) + note('Nguồn: phần mở đầu HĐ · CCCD và SĐT che theo quyền.')),
  card(`${icon('message', 16)} ③ Liên hệ · ④ Thanh toán`, dl([
    ['Điện thoại', `<span class="mono">${LANDLORD.phone}</span>`],
    ['Email', '<span class="muted">—</span>'],
    ['Hộ khẩu thường trú', LANDLORD.address],
    ['Địa chỉ liên hệ', '<span class="muted">Chưa tách — mặc định HKTT</span>'],
    ['Ngân hàng · Số TK · Chủ TK', `${chip('Chưa có trên HĐ', 'warn')}`],
    ['Kỳ trả mặc định', LEASE.cycle],
    ['Hình thức', LEASE.method],
    ['Lịch sử STK', btn('Xem', 'ghost sm', 'history')],
  ], 1)),
])}
<div style="height:14px"></div>
${card(`${icon('building', 16)} ⑤ Nhà cho thuê — suy ra từ HĐ đầu vào`, table([
  { h: 'Tòa' }, { h: 'Địa chỉ' }, { h: 'Phạm vi' }, { h: 'HĐ đầu vào' }, { h: 'Tiền thuê', num: 1 }, { h: 'Phòng', num: 1 }, { h: 'Trạng thái' },
], [[
  `<span class="mono">${BUILDING.codeExample}</span> ${chip('Mã ví dụ', 'assumed')}`,
  BUILDING.address, BUILDING.scope, `<span class="mono">${LEASE.code}</span> · Nháp`, `${vnd(LEASE.rent)} đ/th`, '0', chip('Chuẩn bị', 'neutral'),
]], { foot: '<span>Quan hệ chủ nhà ↔ tòa suy ra từ HĐ đầu vào (BR-2.01.4) · phòng tạo ở UI-05 vì HĐ không có danh sách phòng</span><span>1 tòa</span>' }), btn('Thêm tòa từ HĐ', 'outline sm', 'upload'), 'flush')}
${grid('1fr 1fr', [
  card(`${icon('file', 16)} ⑥ Hồ sơ của chủ nhà`, table([{ h: 'Loại' }, { h: 'File' }, { h: 'Xác minh' }], [
    ['CCCD bên cho thuê', 'Trích từ HĐ (mở đầu)', chip('Chờ bản chụp', 'warn')],
    ['HĐ thuê nhà đã ký', `<span class="mono">${SRC.file.slice(0, 26)}…</span>`, chip('Chờ xác minh', 'neutral')],
    ['Phụ lục bàn giao tài sản', 'Trong file HĐ · 13 hạng mục', chip('Chờ xác minh', 'neutral')],
    ['Giấy ủy quyền', '—', chip('Không áp dụng', 'neutral', 'info')],
  ], { compact: 1 }) + note('Sổ đỏ/GCN, PCCC, HKD là hồ sơ của TÒA — xem UI-04. Phụ lục góp vốn 3 bên thuộc module Cổ đông (làm sau).'), btn('Tải tài liệu', 'outline sm', 'upload'), 'flush'),
  card(`${icon('history', 16)} Nguồn tạo hồ sơ`, dl([
    ['Job trích xuất', `<span class="mono">${SRC.job}</span>`],
    ['File', `${SRC.sizeKb} KB · ${SRC.pages} trang · ${SRC.hash}…`],
    ['Người tải · lúc', `${SRC.uploadedBy} · ${SRC.uploadedAt}`],
    ['Dò trùng', 'CCCD → SĐT → tên · không trùng'],
    ['Quyền truy cập', 'Cổ đông không xem được màn này'],
  ], 1)),
])}
`;

export default {
  file: 'UI-02-landlord-detail-verified.png',
  html: page({
    active: 'UI-02', breadcrumb: ['Nguồn nhà & tòa/phòng', 'Chủ nhà', LANDLORD.code],
    title: `${LANDLORD.code} · ${LANDLORD.name}`, status: chip('Hoạt động', 'ok'),
    subtitle: `Cá nhân · 1 tòa · HĐ đầu vào ${LEASE.code} đang Nháp · tạo từ trích xuất HĐ`,
    actions: `${btn('', 'outline', 'more')}${btn('Sửa', 'outline', 'edit')}${btn('Mở HĐ đầu vào', 'primary', 'file')}`,
    body,
  }),
};
