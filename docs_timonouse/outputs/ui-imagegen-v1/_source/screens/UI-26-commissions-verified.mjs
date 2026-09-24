// UI-26 — dữ liệu hoa hồng lấy từ Seed Data v1.0 §11, kỳ 09/2026.
import { page, vnd, chip, btn, card, table, filters, alert, note, grid } from '../shell.mjs';

const data = [
  ['103G5','G5','Hương',5000000,'35 %',1750000,'1.750.000','Ánh Sao'],
  ['501S45','S45','Kiên',4300000,'50 %',2150000,'3.830.000','Bách'],
  ['502S49','S49','Hương',4800000,'35 %',1680000,'—','—'],
  ['101G3','G3','Huyền',4300000,'35 %',1505000,'10.345.000','Dương'],
  ['801S21','S21','Hương',4200000,'35 %',1470000,'—','—'],
  ['402T17','T17','Phương',4200000,'35 %',1470000,'—','—'],
  ['302S27','S27','Khải',4000000,'50 %',2000000,'—','—'],
  ['401S25A','S25A','Khải',4300000,'50 %',2150000,'—','—'],
  ['302T13','T13','Thủy',3500000,'50 %',1750000,'—','—'],
  ['201G9','G9','Trường',3000000,'50 %',1500000,'7.875.000','Đỗ Chiến'],
  ['301T43','T43','Hương',3300000,'35 %',1155000,'—','—'],
  ['101S31','S31','Giang',3500000,'50 %',1750000,'—','—'],
  ['502S36','S36','Trường',4200000,'35 %',1470000,'—','—'],
];

const rows = data.map(([room,building,recipient,price,rate,amount,total,team]) => [
  `<b>${room}</b>`, building, recipient, vnd(price), rate, `<b>${vnd(amount)}</b>`, total, team,
]);
const body = `
${filters([['Kỳ chi', '09/2026'], ['Tòa', 'Tất cả'], ['Người nhận', 'Tất cả'], ['Tỷ lệ', '35 % / 50 %'], ['Trạng thái', 'Tất cả']], btn('Xuất đối soát', 'outline', 'download'))}
${alert('Phase 1: nhập và đối soát hoa hồng', 'Hai mức 35 % và 50 % cùng tồn tại. “Tổng nhận” trong sheet chỉ ghi ở dòng cuối của từng nhóm người nhận; không cộng giá trị trống vào các dòng.', 'info')}
${grid('1fr 1fr 1fr', [
  card('Tổng giá chốt · toàn sheet', '<b style="font-size:20px">900.416.666,7 đ</b>'+note('Giá trị tổng từ sheet hoa hồng 09/2026.')),
  card('Thành tiền · toàn sheet', '<b style="font-size:20px">464.085.294,6 đ</b>'+note('Giữ phần thập phân như dữ liệu gốc.')),
  card('Tổng nhận · toàn sheet', '<b style="font-size:20px">293.195.133,3 đ</b>'+note('Số theo các nhóm chi trong file nguồn.')),
])}
<div style="height:14px"></div>
${card('Danh sách dòng hoa hồng · trích 13 dòng từ file nguồn', table([
  {h:'Phòng'},{h:'Tòa'},{h:'Người nhận'},{h:'Giá chốt',num:1},{h:'Mức HH',num:1},{h:'Thành tiền',num:1},{h:'Tổng nhận',num:1},{h:'Team'},
], rows, {compact:1,foot:'<span>Nguồn: Hoa hồng năm 2025-2026 (1).xlsx · Seed Data §11. Các dòng hiển thị là trích mẫu; tổng sheet lấy từ toàn bộ file.</span><span>13 dòng mẫu</span>'}), '', 'flush')}
${card('Quy tắc hiển thị & kiểm tra', `<div class="dl c2">
  <div><dt>Nội dung chuyển khoản</dt><dd>HH + tên người nhận + lần 1 (lần 2…)</dd></div>
  <div><dt>Mức tham chiếu</dt><dd>35 % và 50 % · D-55</dd></div>
  <div><dt>G1 · phòng 201G1</dt><dd>0 đ · không phát sinh HH kỳ đầu</dd></div>
  <div><dt>Tổng nhận</dt><dd>Gộp theo người nhận trong cùng kỳ chi</dd></div>
</div>${note('Điều kiện đủ nhận hoa hồng và các trường hợp chia nguồn cần đối chiếu với nghiệp vụ trước khi chi.')}`)}
`;

export default {
  file: 'UI-26-commissions-verified.png',
  html: page({
    active:'UI-26', breadcrumb:['Chi phí & đầu tư','Hoa hồng'], period:'Kỳ 09/2026',
    title:'Hoa hồng', status:chip('Seed Data · 09/2026','info'),
    subtitle:'Danh sách hoa hồng theo phòng và người nhận · dữ liệu nguồn Excel',
    actions:`${btn('Lập nhóm chi','outline','users')}${btn('Import file','primary','upload')}`,
    body,
  }),
};
