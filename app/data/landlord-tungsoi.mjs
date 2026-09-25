// Dữ liệu trích từ HĐ chủ nhà mẫu `docs_timonouse/Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc`
// (file WPS, đọc lớp chữ UTF-16). Mọi màn cụm 02 import từ đây để số và chữ khớp nhau.
// status: ok = đọc được · blank = mẫu để trống · conflict = chặn commit · warn = cảnh báo không chặn.
import { mask } from '../ui/shell.mjs';

export const SRC = {
  file: 'Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc',
  hash: 'd8403819975d',
  sizeKb: 96,
  pages: 9, // metadata file; điều 12.2 ghi "07 trang"
  uploadedBy: 'Kế toán demo',
  uploadedAt: '24/09/2026 09:05',
  job: 'LLX-001',
};

/** Bên A — chủ nhà. CCCD/SĐT hiển thị đã che. */
export const LANDLORD = {
  code: 'LL-0007',
  name: 'Phí Văn Thắng',
  nameRaw: 'PHÍ VĂN THẮNG',
  type: 'Cá nhân',
  idNo: mask('001070018351'),
  idIssued: '19/04/2021',
  idPlace: 'Hà Nội',
  phone: mask('0916122338'),
  address: 'Tổ 18 Phú Diễn, Hà Nội',
};

/** Bên B trên mẫu là CÁ NHÂN, không phải pháp nhân Timehouse. */
export const PARTY_B = { name: 'Nguyễn Đình Chung', idNo: mask('001096005087'), phone: mask('0393542196') };

export const BUILDING = {
  address: 'Số 25A Ngõ 261 Phú Diễn, Hà Nội',
  codeExample: 'PD25A', // mẫu không có mã tòa — người review đặt; giá trị minh họa
  structure: 'Gạch và bê tông',
  purpose: 'Kinh doanh cho thuê',
  scope: 'Thuê toàn bộ căn nhà',
};

export const LEASE = {
  code: 'HL-0031',
  rent: 114000000,
  months: 60,
  cycle: '3 tháng/lần',
  dueWindow: 'Ngày 01–10 tháng đầu kỳ',
  method: 'Chuyển khoản hoặc tiền mặt',
  deposit: 114000000,
  depositRaw: '114.000.000 đồng/tháng',
  renewNotice: 'Báo trước 03 tháng · Bên B được ưu tiên',
};

/** Nhóm trường theo Điều — dùng cho màn trích xuất UI-03. */
export const FIELDS = [
  { group: 'Bên A — chủ nhà', dieu: 'Mở đầu', target: 'LANDLORD', decision: 'Create', rows: [
    ['Họ tên', 'PHÍ VĂN THẮNG', 'Phí Văn Thắng', 'ok'],
    ['CCCD', mask('001070018351'), '12 số hợp lệ', 'ok'],
    ['Ngày cấp · Nơi cấp', '19/4/2021 · Hà Nội', '19/04/2021 · Hà Nội', 'ok'],
    ['Điện thoại', mask('0916122338'), 'Đã chuẩn hóa', 'ok'],
    ['Hộ khẩu thường trú', 'Tổ 18 Phú diễn , Hà Nội', 'Tổ 18 Phú Diễn, Hà Nội', 'ok'],
    ['Tài khoản nhận tiền', '—', 'Mẫu không có', 'warn'],
  ] },
  { group: 'Bên B — bên thuê', dieu: 'Mở đầu', target: 'HEAD_LEASE.party_b', decision: 'Xác nhận', rows: [
    ['Họ tên', 'NGUYỄN ĐÌNH CHUNG', 'Cá nhân — không phải pháp nhân Timehouse', 'conflict'],
  ] },
  { group: 'Nhà đất', dieu: 'Đ.1', target: 'BUILDING', decision: 'Create ứng viên', rows: [
    ['Địa chỉ', 'Số 25A Ngõ 261 Phú Diễn , Hà Nội', BUILDING.address, 'ok'],
    ['Số GCN · cơ quan · ngày cấp', '………… · UBND quận …… · ……', 'Trống', 'warn'],
    ['Số tầng · DT sàn', '… tầng · …m2', 'Trống — nhập ở tòa', 'warn'],
    ['Kết cấu · phạm vi', 'gạch và bê tông · thuê toàn bộ', 'Gạch và bê tông · toàn bộ', 'ok'],
  ] },
  { group: 'Thời hạn', dieu: 'Đ.2', target: 'HEAD_LEASE', decision: 'Create nháp', rows: [
    ['Ngày giao nhà', '……', 'Trống', 'conflict'],
    ['Thời hạn · từ – đến', '05 năm (60 tháng) · từ …… đến ……', '60 tháng · chưa có ngày', 'conflict'],
    ['Gia hạn', 'báo trước 03 tháng, B được ưu tiên', LEASE.renewNotice, 'ok'],
  ] },
  { group: 'Mục đích', dieu: 'Đ.3', target: 'HEAD_LEASE', decision: 'Create nháp', rows: [
    ['Mục đích thuê', 'kinh doanh cho thuê', BUILDING.purpose, 'ok'],
  ] },
  { group: 'Tiền thuê & thanh toán', dieu: 'Đ.4', target: 'HEAD_LEASE', decision: 'Create nháp', rows: [
    ['Giá thuê', '114.000.000 đồng/tháng', '114.000.000 đ/tháng', 'ok'],
    ['Kỳ · hạn trả', '03 tháng/lần · ngày 01–10 tháng đầu kỳ', 'Kỳ 3 tháng · hạn 01–10', 'ok'],
    ['Thuế · phí', 'A chịu thuế nhà đất, TNCN · B trả điện nước, DV', 'Lưu điều khoản', 'ok'],
    ['Giữ giá · tăng giá · tháng miễn', '—', 'Mẫu không có · 4.2 theo thị trường khi gia hạn', 'warn'],
  ] },
  { group: 'Tiền cọc', dieu: 'Đ.5', target: 'HEAD_LEASE.deposit', decision: 'Create nháp', rows: [
    ['Số tiền cọc', LEASE.depositRaw, '114.000.000 · bỏ "/tháng"?', 'conflict'],
    ['Hoàn · khấu trừ', '4 trường hợp hoàn · A không tự khấu trừ', 'Lưu điều khoản', 'ok'],
  ] },
  { group: 'Nghĩa vụ & chấm dứt', dieu: 'Đ.6, 7, 10', target: 'Điều khoản', decision: 'Lưu nguyên văn', rows: [
    ['Chậm trả', '6.2 / 10.2: chậm 1 tháng → A có quyền lấy nhà', 'Rủi ro cao', 'warn'],
    ['Phạt A chấm dứt', '6.1: 03 tháng tiền thuê · 10.4: 03 lần tiền cọc', 'Hai mức khác nhau', 'warn'],
    ['Phạt B chấm dứt', '10.4: mất cọc + 03 lần tiền cọc', 'Lưu điều khoản', 'ok'],
    ['HKD · PCCC', '6.1: A đăng ký KD, nộp thuế · hồ sơ PCCC', 'Checklist pháp lý tòa', 'ok'],
  ] },
  { group: 'Phụ lục bàn giao tài sản', dieu: 'Phụ lục I–II', target: 'Tài sản chủ nhà · công tơ', decision: 'Create 13 dòng', rows: [
    ['Hạng mục', '13 dòng · 2 nhóm', '11 tài sản + 2 công tơ', 'ok'],
    ['Số lượng', '(trống cả 13 dòng)', 'Bắt buộc bổ sung', 'warn'],
    ['Trả lại tài sản', 'PL II: "không tính hao mòn" · 7.1: "trừ hao mòn"', 'Hai điều khác nhau', 'warn'],
  ] },
  { group: 'Phụ lục góp vốn 3 bên', dieu: 'Đ.7.2', target: 'DOCUMENT', decision: 'Làm sau', rows: [
    ['Người góp vốn', 'Phụ lục 3 bên ký bổ sung khi đổi người góp vốn', 'Module Cổ đông · làm sau', 'ok'],
  ] },
];

/** Phụ lục I — 13 hạng mục, cột Số lượng trống trên mẫu. */
export const HANDOVER = [
  ['1', 'Điều hòa, kèm điều khiển', 'Thiết bị', 'asset'],
  ['2', 'Thiết bị mạng, công tắc điện, ổ cắm…', 'Thiết bị', 'asset'],
  ['3', 'Bình nóng lạnh', 'Thiết bị', 'asset'],
  ['4', 'Thiết bị vệ sinh (bồn cầu, vòi sen, vòi xịt, lavabo…)', 'Thiết bị', 'asset'],
  ['1', 'Cửa ra vào', 'Kết cấu', 'asset'],
  ['2', 'Cửa WC', 'Kết cấu', 'asset'],
  ['3', 'Cửa sổ các phòng', 'Kết cấu', 'asset'],
  ['4', 'Cửa ban công', 'Kết cấu', 'asset'],
  ['5', 'Bóng điện (nhà xe, từng phòng, hành lang…)', 'Thiết bị', 'asset'],
  ['6', 'Công tơ điện', 'Công tơ', 'meter'],
  ['7', 'Đồng hồ nước', 'Công tơ', 'meter'],
  ['8', 'Hệ thống báo cháy (chuông, nút ấn, báo nhiệt)', 'PCCC', 'asset'],
  ['9', 'Cửa chống cháy', 'PCCC', 'asset'],
];

/** Danh sách chủ nhà: Phí Văn Thắng + chủ HĐ điện là cá nhân chủ nhà theo Seed §12. */
export const LANDLORD_LIST = [
  { code: LANDLORD.code, name: LANDLORD.name, buildings: '25A Phú Diễn (ứng viên)', rooms: '—', lease: 'HL-0031 · Nháp', status: 'draft', src: 'Trích xuất HĐ' },
  { code: 'LL-0001', name: 'Tống Văn Định', buildings: 'T2', rooms: '—', lease: '—', status: 'missing', src: 'Seed §12 · chủ HĐ điện' },
  { code: 'LL-0002', name: 'Nguyễn Văn Khiết', buildings: 'T3', rooms: '22', lease: '—', status: 'missing', src: 'Seed §12 · §9.3' },
  { code: 'LL-0003', name: 'Dương Văn Thành', buildings: 'T5', rooms: '—', lease: '—', status: 'missing', src: 'Seed §12' },
  { code: 'LL-0004', name: 'Hồ Bích Diệp', buildings: 'T7', rooms: '—', lease: '—', status: 'missing', src: 'Seed §12' },
  { code: 'LL-0005', name: 'Vũ Thị An Thái', buildings: 'T8', rooms: '—', lease: '—', status: 'missing', src: 'Seed §12' },
  { code: 'LL-0006', name: 'Nguyen Thi Anh Dao', buildings: 'T10', rooms: '8', lease: '—', status: 'missing', src: 'Seed §12 · §9.3' },
];

// ---------- Bổ sung cho SPA (không dùng trong ảnh mockup) ----------

/** Giá trị gốc chưa che. Store lưu raw để dò trùng; UI che theo Common Rule 2. */
export const RAW = {
  landlordIdNo: '001070018351', landlordPhone: '0916122338',
  partyBIdNo: '001096005087', partyBPhone: '0393542196',
};

/** Ba xung đột chặn commit của mẫu tùng sói. Lựa chọn có `blocking: true` vẫn giữ xung đột mở. */
export const CONFLICTS = [
  { id: 'dates', title: 'Ngày thuê để trống', text: 'Đ.2.1 ngày giao nhà và Đ.2.2 “từ …… đến ……” trống → chưa sinh được lịch trả.',
    options: [{ v: 'enter', label: 'Nhập ngày' }, { v: 'draft', label: 'Lưu nháp chờ bổ sung' }] },
  { id: 'deposit', title: 'Tiền cọc ghi “/tháng”', text: 'Đ.5.1: 114.000.000 đồng/tháng. Cọc là khoản một lần.',
    options: [{ v: 'once', label: '114.000.000 · một lần' }, { v: 'ask', label: 'Hỏi lại chủ nhà', blocking: true, pending: 'SRS FR03 · 03.1: xung đột còn chặn commit không?' }] },
  { id: 'partyB', title: 'Bên B là cá nhân', text: 'Nguyễn Đình Chung ký cá nhân, không phải pháp nhân Timehouse.',
    options: [{ v: 'proxy', label: 'Ký thay Timehouse · cần ủy quyền' }, { v: 'keep', label: 'Giữ cá nhân', pending: 'SRS FR03 · 03.1: hành vi "Giữ cá nhân" chưa đặc tả' }] },
];

/** Cảnh báo không chặn (⑤). */
export const WARNINGS = [
  ['Đỏ', 'danger', 'Chậm trả 01 tháng → chủ nhà được lấy nhà (6.2, 10.2)'],
  ['Lệch', 'warn', 'Phạt bên A: 03 tháng thuê (6.1) ≠ 03 lần cọc (10.4)'],
  ['Lệch', 'warn', 'Trả tài sản “không tính hao mòn” (PL II) ≠ “trừ hao mòn” (7.1)'],
  ['Thiếu', 'warn', 'GCN, số tầng, DT sàn, TK ngân hàng, SL tài sản'],
];

/** Điều khoản rủi ro lưu nguyên văn (03.2). level: danger | warn | info */
export const RISK_CLAUSES = [
  ['6.2 · 10.2', 'Bên B chậm thanh toán 01 tháng → bên A có quyền lấy nhà', 'Rủi ro cao', 'danger'],
  ['6.1', 'Bên A hủy HĐ → bồi thường 03 tháng tiền thuê', 'Lệch 10.4', 'warn'],
  ['10.4', 'Bên A tự ý chấm dứt → trả cọc + bồi thường 03 lần tiền cọc', 'Lệch 6.1', 'warn'],
  ['10.4', 'Bên B tự ý chấm dứt → mất cọc + bồi thường 03 lần tiền cọc', 'Lưu', 'info'],
  ['7.2', 'Bên B được chấm dứt không phạt khi thiên tai, dịch bệnh, chiến tranh', 'Lưu', 'info'],
  ['PL II · 7.1', 'Trả tài sản “không tính hao mòn” ≠ “trừ hao mòn theo thời gian”', 'Lệch', 'warn'],
];
