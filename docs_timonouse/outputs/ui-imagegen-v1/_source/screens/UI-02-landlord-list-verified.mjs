// UI-02 — Danh sách chủ nhà (spec UI-02 "Danh sách"). Phí Văn Thắng từ HĐ mẫu tùng sói;
// các chủ nhà còn lại suy từ chủ HĐ điện là cá nhân chủ nhà (Seed §12), chưa có HĐ đầu vào.
import { page, chip, btn, card, table, filters, alert, kpi, grid, note, icon } from '../shell.mjs';
import { LANDLORD_LIST, SRC } from '../data/landlord-tungsoi.mjs';

const ST = {
  draft: chip('Nháp · từ trích xuất', 'info', 'scan'),
  missing: chip('Thiếu HĐ đầu vào', 'warn'),
};

const rows = LANDLORD_LIST.map((l) => {
  const r = [
    `<span class="mono" style="white-space:nowrap">${l.code}</span>`,
    `<b>${l.name}</b><br/><small class="muted">Cá nhân</small>`,
    l.status === 'draft' ? '<span class="mono">•••••••338</span>' : '<span class="muted">—</span>',
    l.status === 'draft' ? '<span class="mono">•••••••••351</span>' : '<span class="muted">—</span>',
    l.buildings,
    l.rooms,
    l.lease,
    ST[l.status],
    `<span class="muted">${l.src}</span>`,
    btn('Mở', 'ghost sm', 'eye'),
  ];
  if (l.status === 'draft') r._cls = 'hl';
  return r;
});

const body = `
<div class="kpis" style="grid-template-columns:repeat(4,1fr)">
  ${kpi('Chủ nhà', '7', '1 nháp từ trích xuất HĐ', '', 'users')}
  ${kpi('HĐ đầu vào hiệu lực', '0', 'HL-0031 đang Nháp', 'warn', 'file')}
  ${kpi('Thiếu HĐ đầu vào', '6', 'Suy từ chủ HĐ điện · Seed §12', 'warn', 'alert')}
  ${kpi('Job trích xuất đang mở', '1', `${SRC.job} · chờ commit`, '', 'scan')}
</div>
${filters([['Loại', 'Tất cả'], ['Trạng thái', 'Tất cả'], ['Khu vực', 'Tất cả'], ['Tòa', 'Tất cả'], ['HĐ sắp hết ≤ 6 tháng', 'Không'], `<div class="fsel">${icon('search', 14)}<span class="muted">Tên, SĐT, CCCD/MST…</span></div>`], btn('Xuất', 'outline', 'download'))}
${alert('6 chủ nhà chưa có HĐ đầu vào', 'Tên lấy từ chủ hợp đồng điện đứng tên cá nhân chủ nhà (Seed §12). Cần upload HĐ chủ nhà để trích xuất đủ CCCD, SĐT, tòa và lịch trả; hệ thống không tự điền các trường còn trống.', 'warn')}
${card('Danh sách chủ nhà', table([
  { h: 'Mã' }, { h: 'Chủ nhà · loại' }, { h: 'SĐT' }, { h: 'CCCD/MST' }, { h: 'Tòa' }, { h: 'Số phòng', num: 1 }, { h: 'HĐ đầu vào' }, { h: 'Trạng thái' }, { h: 'Nguồn' }, { h: '' },
], rows, { foot: '<span>CCCD, SĐT che theo quyền · “—” = chưa khai báo · T2 có 2 chủ HĐ điện, hiển thị người đầu tiên · số phòng T3, T10 theo Seed §9.3</span><span>7 chủ nhà</span>' }), '', 'flush')}
${grid('1fr 1fr', [
  card('Hai cách tạo chủ nhà', `<div class="dl c1">
    <div><dt>${icon('upload', 14)} Tạo từ HĐ chủ nhà (khuyến nghị)</dt><dd>Upload → trích xuất → review → commit</dd></div>
    <div><dt>${icon('plus', 14)} Tạo tay</dt><dd>Nhập Bên A, bổ sung HĐ sau</dd></div>
  </div>${note('Commit từ HĐ tạo cùng lúc: chủ nhà, HĐ đầu vào nháp, tòa ứng viên, tài liệu và tài sản bàn giao. Phòng tạo ở bước sau vì HĐ chủ nhà không có danh sách phòng.')}`),
  card('Chống trùng khi tạo', `<div class="dl c1">
    <div><dt>Khóa chống trùng</dt><dd>CCCD/MST → SĐT → Tên</dd></div>
    <div><dt>Trùng</dt><dd>Modal “Dùng bản ghi có sẵn / Vẫn tạo” · BR-2.01.2</dd></div>
    <div><dt>Xóa</dt><dd>Không xóa cứng · chỉ Ngừng hoạt động</dd></div>
  </div>`),
])}
`;

export default {
  file: 'UI-02-landlord-list-verified.png',
  html: page({
    active: 'UI-02', breadcrumb: ['Nguồn nhà & tòa/phòng', 'Chủ nhà'],
    title: 'Chủ nhà', status: chip('7 chủ nhà', 'neutral', 'users'),
    subtitle: 'Danh sách chủ nhà · quan hệ tòa suy ra từ HĐ đầu vào (BR-2.01.4)',
    actions: `${btn('Chủ nhà', 'outline', 'plus')}${btn('Tạo từ HĐ chủ nhà', 'primary', 'upload')}`,
    body,
  }),
};
