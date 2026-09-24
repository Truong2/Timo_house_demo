// UI-31 — Các con số lấy nguyên từ Seed Data v1.0 §13–14, kỳ golden 08/2026.
import { page, vnd, chip, btn, card, table, alert, note, grid, tabs, filters, sumRow } from '../shell.mjs';

const a = [
  ['Tổng doanh thu tháng 8', 84186000],
  ['Doanh thu tiền phòng', 57348387.096774],
  ['Doanh thu tổng dịch vụ', 22214338.709677],
  ['Tiền thuê nhà', 48000000],
  ['Giá vốn (GV)', 61195068],
  ['Tổng chi phí bán hàng (CPBH)', 8325962.751223],
  ['Tổng chi phí (TCP)', 69521030.751223],
  ['Lợi nhuận gộp (LNG)', 22990932],
  ['Lợi nhuận ròng (LNR)', 14664969.248777],
];
const b = [
  ['Tổng doanh thu', 7036256236, 2527702129, 3551745507, 956808600],
  ['Cọc phòng mới', 371850000, 152600000, 187450000, 31800000],
  ['Hoàn cọc', 104968774, 32671000, 67345774, 4952000],
  ['Số phòng phá HĐ', 39, 18, 15, 6],
  ['Số phòng mới', 95, 41, 47, 7],
  ['Số phòng trống', 11, 6, 4, 1],
  ['Doanh thu tiền phòng', 5021511225.81, 1769319354.84, 2539543161.29, 712648709.68],
  ['Doanh thu tổng dịch vụ', 1745169586.02, 639965324.73, 895335161.29, 209869100],
  ['Tiền thuê nhà', 4086483333.33, 1459650000, 2045333333.33, 581500000],
  ['Giá vốn (GV)', 5316928771.92, 1906621248.33, 2679802868.58, 730504655],
  ['Lương bảo vệ', 5500000, 5500000, 0, 0],
];
const fmt = (n) => Number.isInteger(n) ? vnd(n) : vnd(n, 2);
const body = `
${filters([['Kỳ golden', '08/2026'], ['Basis', 'CF · Dòng tiền'], ['Báo cáo', 'A — G1 / B — Toàn hệ thống']], btn('So sánh kỳ', 'outline'))}
${alert('Số liệu đối soát từ Excel nguồn', 'Report A: G1 kỳ 08/2026. Report B: toàn hệ thống kỳ 08/2026. Các khoản memo và tỷ lệ có quy tắc riêng trong Seed Data v1.0.', 'info')}
${grid('0.87fr 1.13fr', [
  card('Report A · Tòa G1 · kỳ 08/2026', `
    ${table([{h:'Chỉ tiêu'},{h:'Giá trị (đ)',num:1}], a.map(([label,value]) => [label, `<b>${fmt(value)}</b>`]), {compact:1})}
    <div style="padding:10px 12px">${note('Tổng doanh thu basis CF có thể khác tiền phòng + dịch vụ do cọc mới, hoàn cọc và dòng tiền khác. Không cộng cọc khách bỏ không ở (memo) vào tổng.')}</div>
    <div style="padding:0 12px 10px">${chip('2 phòng mới', 'ok')} ${chip('1 phòng phá HĐ', 'danger')} ${chip('0 phòng trống', 'neutral')} ${chip('11 tỷ lệ trong báo cáo gốc', 'info')}</div>
  `, '', 'flush'),
  card('Report B · Tổng theo nhóm T / S / G', `
    ${table([{h:'Chỉ tiêu'},{h:'TỔNG',num:1},{h:'T',num:1},{h:'S',num:1},{h:'G',num:1}], b.map(([label,...values]) => [label,...values.map(fmt)]), {compact:1})}
    <div style="padding:10px 12px">${note('Dòng tiền và số phòng: TỔNG = T + S + G. Tỷ lệ phải tính lại từ tử số và mẫu số từng cột; không cộng hoặc lấy trung bình tỷ lệ.')}</div>
  `, '', 'flush'),
])}
<div style="height:14px"></div>
${grid('1fr 1fr', [
  card('Cọc / hoàn cọc · G1', table([{h:'Khoản mục'},{h:'Giá trị (đ)',num:1}], [
    ['Cọc phòng mới · P203', '4.100.000'], ['Cọc phòng mới · P601', '3.900.000'], ['Hoàn cọc · P203', '2.940.000'],
  ], {compact:1})),
  card('Đối soát nguồn & độ tin cậy', `<div style="display:flex;gap:8px;flex-wrap:wrap">${chip('Confirmed · Golden Excel', 'ok')}${chip('Assumed · quy tắc chưa ký', 'assumed')}${chip('Chênh lệch nguồn · cần xử lý', 'danger')}</div>${note('Giữ nguyên giá trị gốc và truy về dòng nguồn khi có sai lệch.')}`),
])}
`;

export default {
  file: 'UI-31-financial-reports-verified.png',
  html: page({
    active: 'UI-31', breadcrumb: ['Báo cáo & đối soát', 'Report A/B · CF/AC'], period: 'Kỳ 08/2026',
    title: 'Báo cáo A/B · CF/AC', status: chip('Golden · 08/2026', 'info'),
    subtitle: 'Report A theo tòa G1 · Report B toàn hệ thống theo nhóm T/S/G · số đối chiếu từ Seed Data v1.0',
    actions: `${btn('Xuất CSV dữ liệu', 'outline', 'download')}${btn('Xuất XLSX đúng layout', 'primary', 'download')}`,
    body,
  }),
};
