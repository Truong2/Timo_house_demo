// UI-05 — Tạo phòng cho tòa mới. HĐ chủ nhà không có danh sách phòng → hai cách:
// sinh theo tầng × số phòng/tầng, hoặc import Excel. Giá trị nhập là MINH HỌA, gắn nhãn.
import { page, chip, btn, card, table, tabs, alert, grid, note, icon, stepper, rowCls } from '../shell.mjs';
import { BUILDING } from '../data/landlord-tungsoi.mjs';

const C = BUILDING.codeExample;
const field = (label, value, extra = '') => `<div class="field"><label>${label}</label><div class="in">${value}${extra}</div></div>`;

// Minh họa: người dùng nhập 2 tầng × 3 phòng để xem preview.
const gen = [];
for (const f of [1, 2]) for (const r of [1, 2, 3]) gen.push([`<span class="mono b">${f}0${r}${C}</span>`, `${f}0${r}`, `Tầng ${f}`, 'Phòng thường', '2', '<span class="muted">—</span>', '<span class="muted">—</span>', chip('Mới', 'info', 'plus')]);

const imp = [
  rowCls(['2', `<span class="mono">301${C}</span>`, '3', '—', '—', '2', chip('Hợp lệ', 'ok')], ''),
  rowCls(['3', `<span class="mono">302${C}</span>`, '3', '—', '—', '2', chip('Hợp lệ', 'ok')], ''),
  rowCls(['4', `<span class="mono">101${C}</span>`, '1', '—', '—', '2', chip('Trùng mã với dòng sinh theo tầng', 'danger')], 'dangerrow'),
  rowCls(['5', `<span class="mono">30A${C}</span>`, '3', '—', '—', '—', chip('Thiếu sức chứa', 'warn')], 'warnrow'),
];

const body = `
${alert('HĐ chủ nhà không có danh sách phòng', `Mẫu tùng sói chỉ có địa chỉ, “Nhà có … tầng” (để trống) và phụ lục “Cửa sổ các phòng”. Phòng tạo tay theo tầng hoặc import file. Mã phòng = số phòng + mã tòa (lưu 2 trường riêng).`, 'info')}
${tabs(['Sinh theo tầng', 'Import Excel'], 0)}
${grid('320px 1fr', [
  card(`${icon('layers', 16)} Tham số sinh phòng`, `
    ${field('Tòa', `<b>25A Phú Diễn</b> · mã <span class="mono">${C}</span>`, chip('Ví dụ', 'assumed'))}
    ${field('Số tầng', '2', chip('Minh họa · HĐ trống', 'assumed'))}
    ${field('Số phòng mỗi tầng', '3', chip('Minh họa', 'assumed'))}
    ${field('Mẫu số phòng', '<span class="mono">{tầng}0{stt}</span>')}
    ${field('Loại phòng · sức chứa mặc định', 'Phòng thường · 2 người')}
    ${field('Giá niêm yết · giá QL', '<span class="muted">Để trống — nhập sau</span>')}
    ${note('Giá hiện tại của phòng chỉ đọc từ HĐ thuê khách, không nhập ở đây.')}`),
  card(`${icon('eye', 16)} Preview — sửa được từng dòng trước khi tạo`, table([
    { h: 'Mã phòng' }, { h: 'Số phòng' }, { h: 'Tầng' }, { h: 'Loại' }, { h: 'Sức chứa', num: 1 }, { h: 'Giá niêm yết', num: 1 }, { h: 'Giá QL', num: 1 }, { h: '' },
  ], gen, { compact: 1, foot: '<span>Phòng tạo ở trạng thái Trống · chưa có công tơ phòng — khai báo ở UI-10</span><span>6 phòng</span>' }), btn('Thêm dòng', 'outline sm', 'plus'), 'flush'),
])}
<div style="height:6px"></div>
${tabs(['Sinh theo tầng', 'Import Excel'], 1)}
${stepper(['Upload', 'Map cột', 'Validate', 'Preview', 'Commit'], 3)}
${grid('1fr 300px', [
  card(`${icon('upload', 16)} Preview import · <span class="mono">phong_25A_PhuDien.xlsx</span> <span class="muted">(file minh họa)</span>`, table([
    { h: 'Dòng', num: 1 }, { h: 'Mã phòng' }, { h: 'Tầng', num: 1 }, { h: 'Giá niêm yết', num: 1 }, { h: 'Giá QL', num: 1 }, { h: 'Sức chứa', num: 1 }, { h: 'Kết quả' },
  ], imp, { compact: 1, foot: '<span>Cột bắt buộc: mã, tòa, số phòng, tầng, giá niêm yết, giá QL, sức chứa</span><span>4 dòng · 2 hợp lệ</span>' }), '', 'flush'),
  card('Kết quả validate', `<div class="dl c1">
    <div><dt>Hợp lệ</dt><dd class="pos">2</dd></div>
    <div><dt>Trùng mã</dt><dd class="neg">1</dd></div>
    <div><dt>Thiếu dữ liệu</dt><dd class="wtx">1</dd></div>
  </div>${note('Dòng lỗi không chặn các dòng hợp lệ. Tải file dòng lỗi để sửa và import lại.')}
  <div style="display:flex;gap:6px;margin-top:10px">${btn('Tải dòng lỗi', 'outline sm', 'download')}</div>`),
])}
`;

export default {
  file: 'UI-05-rooms-create-verified.png',
  html: page({
    active: 'UI-05', breadcrumb: ['Nguồn nhà & tòa/phòng', 'Phòng', 'Tạo phòng cho tòa mới'],
    title: 'Tạo phòng · 25A Phú Diễn', status: chip('0 phòng', 'neutral', 'layers'),
    subtitle: 'Hai cách: sinh theo tầng × số phòng/tầng hoặc import Excel · có preview và phát hiện trùng mã',
    actions: `${btn('Hủy', 'outline')}${btn('Tạo 6 phòng', 'primary', 'check')}`,
    body,
  }),
};
