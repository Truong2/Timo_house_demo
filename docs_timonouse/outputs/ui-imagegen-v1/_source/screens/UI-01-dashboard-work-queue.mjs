// UI-01 — Dashboard & Work Queue. Số liệu: Seed §10.1 (tiến độ thu chốt 16/09), §14 (Report B kỳ 08/2026), §8 (phá HĐ).
import { page, vnd, pct, kpi, card, table, chip, btn, filters, alert, note, grid, icon, pchip } from '../shell.mjs';

const collect = [
  ['Nguyễn Thị Thương Huyền', 496854892.5, 497458881, 100.12, 2894000, 0],
  ['Đào Hữu Hoàng Giang', 839098838.7, 792461800, 94.44, 24057000, 584000],
  ['Trịnh Xuân Hòa Tú', 410381166.7, 407047833, 99.19, 10588000, 0],
  ['Đỗ Công Trường', 327479000, 327609000, 100.04, 0, 0],
  ['Đỗ Thuỳ Linh', 1021393600, 1010613000, 98.94, 8154000, 1664000],
  ['Đỗ Thị Nụ', 455910248.4, 450779600, 98.87, 5138000, 0],
  ['Nguyễn Công Lâm', 444273000, 440337667, 99.11, 4456000, 500000],
  ['Đặng Văn Thủy', 507704058, 503614000, 99.19, 4184000, 0],
  ['Đồng Văn Phương', 427613968, 426835948, 99.82, 3248000, 50000],
  ['Đặng Trung Kiên', 871204000, 871427000, 100.03, 0, 0],
  ['Đỗ Thanh Hương', 880447600, 851348000, 96.69, 33730000, 760000],
  ['Nguyễn Ngọc Văn Khải', 1059013510, 1055884800, 99.70, 3634000, 104000],
];

const rows = collect.map(([n, due, got, r, bk, bkGot]) => [
  n, vnd(due, 1), vnd(got), r > 100 ? `<b class="pos">${pct(r)}</b>` : r < 95 ? `<b class="wtx">${pct(r)}</b>` : pct(r), vnd(bk), vnd(bkGot),
]);

const wq = [
  [chip('Công nợ > 5 ngày', 'danger'), '402G5', 'Nguyễn Ngọc Văn Khải', '9 ngày', `${btn('Nhắc Zalo', 'outline sm', 'message')} ${btn('Đề xuất phạt', 'outline sm')}`],
  [chip('Chỉ số chưa duyệt', 'warn'), 'Tòa T24', 'Trần Quang Huy · TNVH', '2 ngày', btn('Duyệt', 'outline sm', 'check')],
  [chip('OCR chờ review', 'warn'), 'HĐ 302G6', 'Đỗ Thuỳ Linh', '3 ngày', btn('Mở review', 'outline sm', 'scan')],
  [chip('Hoàn cọc chờ duyệt', 'info'), '301T41', 'Kế toán', '1 ngày', `${btn('Duyệt', 'outline sm')} ${btn('Trả sửa', 'outline sm')}`],
  [chip('Lịch trả chủ nhà', 'info'), 'HĐ LL-0007', 'Kế toán', '5 ngày', btn('Ghi nhận đã trả', 'outline sm')],
  [chip('Thu thiếu hóa đơn', 'warn'), '304G1 · thiếu 60.000', 'Đỗ Thuỳ Linh', '4 ngày', btn('Chuyển công nợ', 'outline sm')],
];

const body = `
${filters([['Kỳ', '09/2026'], ['Ngày tham chiếu', '23/09/2026'], ['Khu vực', 'Tất cả'], ['Trưởng nhóm', 'Tất cả'], ['Quản lý', 'Tất cả'], ['Tòa', 'Tất cả'], ['Nhóm', 'T/S/G'], ['Hạng', 'L1–L3']], btn('Lưu bộ lọc', 'ghost'))}
<div class="kpis" style="grid-template-columns:repeat(6,1fr)">
  ${kpi('Tổng phòng quản lý', vnd(1382), 'N phân bổ · kể cả phòng trống', '', 'building')}
  ${kpi('Phòng tính hiệu suất', vnd(1079), `Khác mẫu số N ${pchip('P-05', 'Hai mẫu số')}`, '', 'gauge')}
  ${kpi('Phòng mới (T8)', '95', 'T 41 · S 47 · G 7', 'ok', 'plus')}
  ${kpi('Phá HĐ (T8)', '39', 'T 18 · S 15 · G 6', 'danger', 'x')}
  ${kpi('Phòng trống (T8)', '11', 'T 6 · S 4 · G 1', 'warn', 'alert')}
  ${kpi('Nợ phá HĐ kỳ 09', vnd(16048000), `Đã thu ${vnd(3662000)}`, 'danger', 'wallet')}
</div>
${grid('1fr 1.6fr', [
  card('KPI hợp đồng', `<div class="dl c1" style="display:grid;gap:8px">
      ${[['HĐ hiệu lực', vnd(1079)], ['Sắp hết trong 35 ngày', '74'], ['└ chưa xác nhận', '<b class="wtx">31</b>'], ['Chờ OCR review', '6'], ['Chờ quyết toán', '12']].map(([k, v]) => `<div style="display:flex;justify-content:space-between;border-bottom:1px dashed #E2E8F0;padding-bottom:5px"><span class="muted">${k}</span><b>${v}</b></div>`).join('')}
    </div>${note('Mốc 35 ngày khác HĐ mẫu ghi 30 ngày — ' + pchip('P-32'))}`),
  card('KPI tài chính — kỳ 08/2026 (tạm tính, basis CF)', `<div class="dl c2" style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px">
      ${[['Tổng doanh thu', vnd(7036256236)], ['Doanh thu tiền phòng', vnd(5021511225.81, 2)], ['Cọc phòng mới', vnd(371850000)], ['Doanh thu dịch vụ', vnd(1745169586.02, 2)], ['Cọc khách bỏ không ở (memo)', vnd(18400000)], ['Tiền thuê nhà', vnd(4086483333.33, 2)], ['Hoàn cọc', vnd(104968774)], ['Giá vốn (GV)', vnd(5316928771.92, 2)]].map(([k, v]) => `<div style="display:flex;justify-content:space-between;border-bottom:1px dashed #E2E8F0;padding-bottom:5px"><span class="muted">${k}</span><b style="font-variant-numeric:tabular-nums">${v}</b></div>`).join('')}
    </div>${note('Số tạm tính tại thời điểm xem — báo cáo chính thức ở UI-31 Report B. Nguồn: BÁO CÁO TỔNG THÁNG 8.')}`),
])}
<div style="height:14px"></div>
${card('Cập nhật tiến độ thu tiền — chốt 16/09/2026', table([
  { h: 'Quản lý' }, { h: 'DT phải thu', num: 1 }, { h: 'Thực thu', num: 1 }, { h: 'Tỷ lệ %', num: 1 }, { h: 'DT phá HĐ', num: 1 }, { h: 'Phá HĐ thu được', num: 1 },
], rows, { compact: 1, foot: `<span>${icon('info', 13)} Tỷ lệ &gt; 100 % là hợp lệ (thu được cả nợ cũ) — không chặn, không làm tròn xuống 100 %. Nguồn: sheet <b>cập nhật thu tiền</b>.</span><span>12 quản lý</span>` }),
  `<div class="tabs" style="margin:0;border:0"><span class="on">Theo quản lý</span><span>Theo tòa</span></div>${btn('Xuất', 'outline sm', 'download')}`, 'flush')}
${card('Work Queue — việc cần xử lý hôm nay', table([
  { h: 'Loại việc' }, { h: 'Đối tượng' }, { h: 'Phụ trách' }, { h: 'Tuổi', num: 1 }, { h: 'Hành động nhanh' },
], wq, { compact: 1, foot: `<span>Việc do hệ thống tự sinh/tự đóng từ dữ liệu nguồn. Bỏ qua bắt buộc lý do + ngày tái mở. Ngưỡng đỏ ${pchip('P-20')}</span><span>${btn('Nhận việc', 'outline sm')} ${btn('Chuyển', 'outline sm')} ${btn('Bỏ qua có lý do', 'outline sm')}</span>` }),
  `<span class="muted">Sắp xếp: Ưu tiên → tuổi giảm dần</span>`, 'flush')}
`;

export default {
  file: 'UI-01-dashboard-work-queue.png',
  html: page({
    active: 'UI-01',
    breadcrumb: ['Tổng quan', 'Dashboard & Work Queue'],
    title: 'Tổng quan',
    status: chip('Tạm tính · cập nhật 23/09/2026 08:30', 'neutral', 'clock'),
    subtitle: 'Toàn hệ thống · scope theo phân công tòa · KPI tài chính và phòng lấy kỳ đối soát 08/2026, tiến độ thu kỳ 09/2026',
    actions: `${btn('Xuất Excel', 'outline', 'download')}${btn('Mở Work Queue', 'primary', 'arrowRight')}`,
    body,
  }),
};
