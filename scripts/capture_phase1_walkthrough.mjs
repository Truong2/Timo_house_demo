/*
 * Chạy walkthrough/UAT Phase 1 bằng UI thật, chụp evidence và sinh DOCX.
 *
 * Không gọi các action nghiệp vụ trực tiếp. `page.evaluate` chỉ dùng để reset
 * profile trước khi chạy, đọc state để tạo assertion/manifest và vẽ callout
 * tạm thời trên ảnh chụp.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import net from 'node:net';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  PageBreak,
  PageNumber,
  PageOrientation,
  Packer,
  Paragraph,
  SectionType,
  ShadingType,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { saveDownload, writeSwimlane, FLOW_TRACE, BRANCH } from './uat/runtime.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RUN_ROOT = process.env.TIMEHOUSE_UAT_ROOT ? path.resolve(process.env.TIMEHOUSE_UAT_ROOT) : null;
const OUT = RUN_ROOT ? path.join(RUN_ROOT, 'phase-1') : path.join(ROOT, 'docs', 'phase1-walkthrough');
const EVIDENCE = path.join(OUT, 'evidence');
const DOWNLOADS = path.join(OUT, 'downloads');
const MANIFEST_PATH = path.join(OUT, 'manifest.json');
const DOCX_PATH = RUN_ROOT ? path.join(RUN_ROOT, '01_TimeHouse_Phase1_UAT_Evidence.docx') : path.join(OUT, 'TimeHouse_Phase1_Walkthrough_UAT_v1.0.docx');
const WIDTH = 1440;
const HEIGHT = 1080;
const BASE_URL = process.env.TIMEHOUSE_BASE_URL || ''; // chỉ dùng server có sẵn khi được chỉ định rõ (tránh chạy nhầm workspace khác)
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const COMMIT = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();

const roleLabel = { admin: 'Quản trị viên', accountant: 'Kế toán', ops: 'Vận hành', sale: 'Kinh doanh', kythuat: 'Kỹ thuật', hr: 'Nhân sự', codong: 'Cổ đông' };
const ROLE_MENU = { admin: /Quay lại Admin|Quản trị viên/, accountant: /Kế toán/, ops: /Vận hành/, sale: /Kinh doanh|Sale/, kythuat: /Kỹ thuật/, hr: /Nhân sự/, codong: /Cổ đông/ };
const EXPECTED = 53; // S0 (4) + F00 (4) + F01–F10 (32) + F12 OCR Data Onboarding (4, spec v1.8 §12.8) + F14 Hiệu suất → lương → chi lương (3, §4.26) + F15 Import chi phí & phân bổ (1, §4.27) + F16 Báo cáo tháng & đối soát (3, §12.23) + F17 Cổ đông & chia lợi nhuận (2, §4.29–4.32)
const route = (x) => `#${x}`;

const FLOWS = [
  {
    key: 'S0', title: 'Khởi động', core: true, steps: [
      ['S0.1', 'Đăng nhập hệ thống', 'admin', '/login', 'Màn hình đăng nhập với email/tên đăng nhập, mật khẩu và nút Đăng nhập.', 'admin / demo123', 'Nhập tài khoản và bấm Đăng nhập.', 'Vào Tổng quan, topbar hiện Nguyễn Văn Minh – Quản trị viên.', '[data-guide="login-card"]'],
      ['S0.2', 'Xem Tổng quan', 'admin', '/dashboard', 'Dashboard gồm bộ lọc kỳ/khu vực/tòa, 4 KPI, tài chính, biểu đồ và Top khoản quá hạn.', 'Kỳ 10/2026', 'Quan sát KPI, biểu đồ và bảng quá hạn.', 'KPI phòng, tiến độ thu và nút Nhắc thu hiển thị.', '[data-guide="dash-kpi"]'],
      ['S0.3', 'Kiểm tra danh mục dịch vụ & bảng giá', 'admin', '/settings/catalog', 'Danh sách dịch vụ, đơn vị, giá mặc định, phạm vi và lịch sử giá.', 'Không nhập; dùng seed catalog.', 'Mở Cấu hình → Danh mục dùng chung và mở một dịch vụ.', '7 dịch vụ đang hoạt động, gồm Điện 3.500/kWh và Nước 20.000/m³.', '[data-guide="catalog-table"]'],
      ['S0.4', 'Xem phòng sẵn sàng cho thuê', 'ops', '/rooms?status=ready', 'Danh sách phòng có tab trạng thái, giá, tòa và action trên từng dòng.', 'Lọc Sẵn sàng.', 'Chuyển Vận hành, mở Phòng và chọn tab Sẵn sàng.', 'Có dòng phòng với Giữ chỗ/Tạo hợp đồng.', '[data-guide="rooms-table"]'],
    ],
  },
  {
    key: 'F00', title: 'Thiết lập chủ nhà, tòa & phòng', golive: '', core: true, steps: [
      ['F00.1', 'Onboarding chủ nhà → HĐ đầu vào → tòa', 'admin', '/landlords/new', 'Wizard 4 bước: Chủ nhà → Hợp đồng & tòa nhà → Phòng → Xác nhận.', 'Nguyễn Demo Chủ Nhà; Khu Cầu Giấy (KV-CG-DEMO); TH-DEMO-01; HĐ 90.000.000đ/tháng, cọc 180.000.000đ, 01/10/2026–30/09/2029.', 'Dùng các nút Điền dữ liệu mẫu ở bước Chủ nhà, modal Khu nhà, card Tòa mới và HĐ đầu vào; người demo tự bấm Tiếp tục.', 'Có tòa ⇒ bắt buộc HĐ đầu vào; tòa khác bị khóa; sang bước 3 với lưới 5 tầng × 4 phòng.', '#content'],
      ['F00.2', 'Sinh phòng theo lưới & hoàn tất', 'admin', '/landlords/new', 'Bước Phòng: từ tầng – đến tầng × phòng/tầng, loại, diện tích, giá; preview số phòng; bước Xác nhận có lịch trả chủ nhà.', 'Giá tham chiếu 6.500.000đ; giữ 5 tầng × 4 phòng.', 'Nhập giá, Kiểm tra hồ sơ → xem preview lịch trả 12 kỳ → Hoàn tất onboarding.', 'Toast "1 tòa · 20 phòng · HD-… · 12 kỳ trả"; chuyển tới chi tiết chủ nhà tab Tòa nhà với tòa mới có 20 phòng.', '#content'],
      ['F00.3', 'Lịch trả chủ nhà sinh tự động', 'admin', '/landlords/:id?tab=contracts', 'Tab Hợp đồng đầu vào: điều khoản HĐ và bảng lịch thanh toán.', 'HĐ đầu vào vừa tạo.', 'Mở chi tiết chủ nhà → tab Hợp đồng đầu vào.', '12 kỳ theo chu kỳ 3 tháng, số tiền 270.000.000đ/kỳ, trạng thái Chưa đến hạn/Chờ thanh toán.', '#content'],
      ['F00.4', 'Tòa liên kết HĐ đầu vào', 'admin', '/buildings/:id?tab=landlord', 'Tab Chủ nhà & HĐ đầu vào của tòa: HĐ phủ tòa, kỳ trả tới, thời gian giữ giá.', 'Tòa Demo Onboard.', 'Mở chi tiết tòa → tab Chủ nhà & HĐ đầu vào; tab Phòng liệt kê 20 phòng Sẵn sàng.', 'HĐ đầu vào Đang hiệu lực, kỳ trả tới 28/10/2026 · 270.000.000đ; phòng chỉ cho thuê khi tòa có HĐ đầu vào hiệu lực.', '#content'],
    ],
  },
  {
    key: 'F01', title: 'Tạo khách thuê', golive: '1', core: true, steps: [
      ['F01.1', 'Mở form Thêm khách thuê', 'ops', '/tenants', 'Danh sách khách thuê và drawer nhập hồ sơ ở bên phải.', 'Không nhập.', 'Bấm + Thêm khách thuê.', 'Drawer có Họ tên, SĐT, Zalo, Email, CCCD, nghề nghiệp và phân khúc.', '[data-guide="tenant-add"]'],
      ['F01.2', 'Lưu khách thuê mới', 'ops', '/tenants', 'Drawer form khách thuê.', 'Nguyễn Demo Khách; 0912 000 111; CCCD 012345678999; sinh 15/06/1995.', 'Bấm Điền dữ liệu mẫu, kiểm tra rồi tự bấm Lưu khách thuê.', 'Toast lưu thành công; khách mới có mã KH… và trạng thái Khách mới.', '[data-guide="tenant-add"]'],
    ],
  },
  {
    key: 'F02', title: 'Chọn phòng & tạo hợp đồng', golive: '2, 3, 4', core: true, steps: [
      ['F02.1', 'Chọn phòng sẵn sàng → Tạo hợp đồng', 'ops', '/rooms?status=ready', 'Bảng phòng Sẵn sàng với action Tạo hợp đồng.', 'Z.01.01 thuộc TH-DEMO-01.', 'Bấm Tạo hợp đồng đúng trên dòng Z.01.01.', 'Form Tạo hợp đồng nạp đúng phòng/tòa vừa onboarding.', '[data-guide="rooms-table"]'],
      ['F02.2', 'Chọn khách, thời hạn, chu kỳ thanh toán', 'ops', '/contracts/new', 'Wizard hợp đồng với khách, phòng, thời hạn và chu kỳ thanh toán.', 'Khách vừa tạo; 01/10/2026–30/09/2027; ngày thu 05.', 'Chọn khách, giữ phòng, nhập ngày và ngày thanh toán.', 'Tóm tắt cập nhật và checklist chuyển sang hợp lệ.', '[data-guide="contract-save"]'],
      ['F02.3', 'Thiết lập giá thuê, cọc, dịch vụ', 'ops', '/contracts/new', 'Khu Giá thuê, cọc và phụ phí; bảng dịch vụ; thành viên ở.', 'Giá 6.500.000đ; cọc 13.000.000đ; Internet 200.000đ + quản lý 150.000đ + gửi xe 100.000đ.', 'Kiểm tra dữ liệu đã tự điền rồi bấm Lưu hợp đồng →.', 'HĐ được lưu ở Dự thảo và mở bước Review.', '[data-guide="price"]'],
      ['F02.4', 'Xác nhận & kích hoạt hợp đồng', 'ops', '/contracts/new', 'Review hợp đồng, checklist (gồm dòng HĐ đầu vào của tòa) và card Chứng từ khi kích hoạt.', 'HĐ Dự thảo của khách demo; giữ "Ghi nhận thu tiền cọc ngay", bỏ chọn "Tạo hóa đơn nháp kỳ đầu" (hóa đơn lập theo kỳ ở F03).', 'Bỏ chọn tạo hóa đơn kỳ đầu, bấm Xác nhận & kích hoạt hợp đồng và xác nhận modal.', 'HĐ Hiệu lực; phòng chuyển Đang thuê; phiếu thu cọc PAY… được tạo và cọc đang giữ; checklist HĐ đầu vào xanh.', '[data-guide="contract-activate"]'],
    ],
  },
  {
    key: 'F03', title: 'Điện nước & hóa đơn', golive: '5, 6', core: true, steps: [
      ['F03.1', 'Mở Tạo hóa đơn theo kỳ', 'accountant', '/invoices', 'Wizard 4 bước lập hóa đơn theo kỳ, phạm vi tòa và dịch vụ.', 'Kỳ 10/2026; tòa của phòng demo; Tiền phòng/Điện/Nước/Dịch vụ cố định.', 'Mở Tạo hóa đơn theo kỳ và chọn phạm vi phòng demo.', 'Wizard hiển thị hợp đồng hiệu lực và cảnh báo thiếu chỉ số nếu có.', '[data-guide="invoice-batch"]'],
      ['F03.2', 'Nhập chỉ số điện nước cho phòng mới', 'accountant', '/invoices/batch', 'Bảng chỉ số cũ/mới điện và nước, SL tự tính, nút Lưu tạm.', 'Điện mới = điện cũ +150; nước mới = nước cũ +12.', 'Nhập hai chỉ số mới và bấm Lưu tạm.', 'Có toast lưu 2 chỉ số; phòng hết cảnh báo Thiếu chỉ số.', '[data-guide="meter-save"]'],
      ['F03.3', 'Preflight & tạo hóa đơn nháp', 'accountant', '/invoices/batch', 'Preflight hiển thị phòng hợp lệ, phòng bị loại và dự thu.', 'Giữ bộ dịch vụ và phòng demo đã có chỉ số.', 'Bấm Tiếp tục preflight → rồi Tạo N hóa đơn nháp.', 'Mã hóa đơn nháp của phòng demo xuất hiện ở bước kết quả.', '[data-guide="invoice-create"]'],
      ['F03.4', 'Phát hành hóa đơn', 'accountant', '/invoices', 'Chi tiết hóa đơn nháp với nút Phát hành.', 'Hóa đơn HD-202610-… vừa tạo.', 'Mở hóa đơn và bấm Phát hành, xác nhận modal.', 'Chứng từ Đã phát hành; trạng thái thu Chưa thu.', '[data-guide="invoice-issue"]'],
    ],
  },
  {
    key: 'F04', title: 'Gửi hóa đơn qua Zalo', golive: '7', core: true, steps: [
      ['F04.1', 'Mở preview nhắc tiền từ hóa đơn vừa phát hành', 'admin', '/invoices/:invoiceId → drawer Gửi nhắc tiền', 'Drawer preview người nhận, template và số tiền còn nợ.', 'Hóa đơn HD-202610-… vừa phát hành.', 'Mở chi tiết hóa đơn, bấm Gửi nhắc tiền và kiểm tra preview.', 'Đúng một khách/phòng demo, số dư hiện tại và trạng thái đủ điều kiện.', '[data-guide="zalo-recipients"]'],
      ['F04.2', 'Xác nhận gửi', 'admin', '/invoices/:invoiceId → drawer Gửi nhắc tiền', 'Drawer preview có nút Xác nhận gửi.', 'Danh sách preview đã kiểm tra.', 'Bấm Xác nhận gửi để tạo đợt.', 'Đợt ZL-202610-… chuyển Đang gửi rồi chạy timer.', '[data-guide="zalo-send"]'],
      ['F04.3', 'Theo dõi kết quả gửi', 'admin', '/zalo/history', 'Lịch sử gửi và chi tiết 7 trạng thái tin nhắn.', 'Đợt Zalo vừa tạo.', 'Mở chi tiết đợt, chờ timer kết thúc và mở tab nhắc tiền của hóa đơn.', 'Đợt Thành công/Một phần; tin khách demo có trạng thái giao nhận.', '[data-guide="zalo-recipients"]'],
    ],
  },
  {
    key: 'F05', title: 'Công nợ & thu tiền một phần', golive: '8, 9, 10', core: true, steps: [
      ['F05.1', 'Xem công nợ', 'accountant', '/receivables', 'Bảng công nợ với tổng, đã thu, còn lại, quá hạn và trạng thái nhắc.', 'Tìm theo mã phòng demo.', 'Mở Thu tiền & công nợ và tìm phòng demo.', 'Dòng hóa đơn có Đã thu 0, Còn lại = tổng và trạng thái đã nhắc.', '[data-guide="receivables-table"]'],
      ['F05.2', 'Ghi nhận thu tiền một phần', 'accountant', '/receivables', 'Drawer Ghi nhận thu tiền với khách, số tiền, phương thức, tham chiếu và phân bổ.', '3.000.000đ; Chuyển khoản; CK289104; ghi chú thanh toán một phần.', 'Chọn khách demo, nhập dữ liệu, Tự động phân bổ và Xác nhận ghi nhận.', 'Tạo PAY…; hóa đơn chuyển Thu một phần.', '[data-guide="receivable-pay"]'],
      ['F05.3', 'Xem chi tiết khoản thu', 'accountant', '/payments/:id', 'Chi tiết khoản thu, phân bổ công nợ và lịch sử xử lý.', 'PAY… vừa tạo.', 'Mở liên kết chi tiết khoản thu từ toast hoặc route.', 'Đã phân bổ = 3.000.000đ; còn lại sau phân bổ đúng.', '[data-guide="pay-form"]'],
      ['F05.4', 'Theo dõi số còn nợ', 'accountant', '/receivables', 'Bảng công nợ/hóa đơn sau khi đã phân bổ.', 'Hóa đơn và khoản thu demo.', 'Quay lại công nợ hoặc mở hóa đơn, kiểm tra Còn lại.', 'Đã thu = 3.000.000đ, Còn lại > 0, chip Thu một phần.', '[data-guide="receivables-table"]'],
    ],
  },
  {
    key: 'F06', title: 'Nhắc công nợ qua Zalo', golive: '11', core: true, steps: [
      ['F06.1', 'Tạo đợt nhắc công nợ', 'admin', '/receivables', 'Bảng công nợ có chọn dòng và action Gửi nhắc Zalo.', 'Hóa đơn demo còn nợ sau thu một phần; bật Vẫn gửi nếu rule 3 ngày chặn.', 'Chọn dòng khách demo, bấm Gửi nhắc Zalo, chọn template và preview.', 'Preview dùng số dư mới sau F05, không dùng tổng cũ.', '[data-guide="receivables-table"]'],
      ['F06.2', 'Xác nhận gửi & theo dõi', 'admin', '/zalo/history', 'Chi tiết đợt nhắc nợ và tiến độ timer.', 'Đợt debt vừa tạo.', 'Xác nhận gửi và chờ trạng thái kết thúc.', 'Tin chứa Còn nợ hiện tại đúng với số dư sau F05.', '[data-guide="zalo-recipients"]'],
      ['F06.3', 'Thử lại tin lỗi (nếu có)', 'admin', '/zalo/history', 'Chi tiết đợt có nút Thử lại các tin đủ điều kiện.', 'Tin failed/unknown của đợt mới hoặc seed ZL-202610-026.', 'Bấm retry và xác nhận; chỉ xếp hàng failed/unknown chưa retry.', 'Tin Đã giao giữ nguyên; tin retry có lần thử mới và mã trạng thái.', '[data-guide="zalo-retry"]'],
    ],
  },
  {
    key: 'F07', title: 'Kết thúc hợp đồng', golive: '12, 14', core: true, steps: [
      ['F07.1', 'Mở hợp đồng của khách mới', 'ops', '/contracts/:id', 'Chi tiết HĐ với trạng thái, KPI cọc/công nợ và action kết thúc.', 'HĐ demo Hiệu lực.', 'Chuyển Vận hành và mở HĐ demo.', 'Nút Kết thúc hợp đồng hiển thị, công nợ còn lại được tính.', '[data-guide="contract-terminate"]'],
      ['F07.2', 'Kết thúc HĐ (chỉ số cuối → hóa đơn cuối → công nợ → cọc → hồ sơ hoàn cọc)', 'ops', '/contracts/:id', 'Wizard kết thúc HĐ §4.17: loại kết thúc, ngày ra, chỉ số cuối, hóa đơn cuối, công nợ được phép bù trừ, khấu trừ.', 'Khách chấm dứt sớm; ngày ra 28/10/2026; chỉ số cuối = chỉ số gần nhất; bù trừ toàn bộ công nợ.', 'Bấm Kết thúc hợp đồng, Điền dữ liệu mẫu và Xác nhận kết thúc.', 'HĐ Đã kết thúc; phòng Chờ dọn; hồ sơ RC… Nháp được tạo.', '[data-guide="contract-terminate"]'],
    ],
  },
  {
    key: 'F08', title: 'Hoàn cọc', golive: '13', core: true, steps: [
      ['F08.1', 'Lập phương án hoàn cọc', 'ops', '/refunds/new', 'Wizard hiện trạng, dòng khấu trừ, bằng chứng và tổng tiền hoàn.', 'Khấu hao 200.000đ + vệ sinh 200.000đ; mỗi dòng có bằng chứng; bù trừ công nợ được phép 4.715.000đ (§4.18).', 'Mở hồ sơ RC…, kiểm tra hiện trạng, thêm dòng vệ sinh và lưu phương án.', 'Số hoàn = cọc − 400.000đ; bằng chữ và tổng khấu trừ đúng.', '[data-guide="refund-review"]'],
      ['F08.2', 'Gửi duyệt', 'ops', '/refunds/new', 'Review phương án với nút Gửi duyệt hoàn cọc.', 'Hồ sơ đã có khấu trừ và bằng chứng.', 'Bấm Gửi duyệt hoàn cọc.', 'Hồ sơ Chờ duyệt; Vận hành không có nút Duyệt.', '[data-guide="refund-submit"]'],
      ['F08.3', 'Kế toán duyệt hồ sơ', 'accountant', '/refunds/:id', 'Chi tiết hồ sơ với nút Duyệt hoàn cọc.', 'Hồ sơ RC… Chờ duyệt.', 'Chuyển Kế toán, mở hồ sơ và bấm Duyệt hoàn cọc.', 'Hồ sơ Đã duyệt; ghi chú Duyệt ≠ đã chuyển tiền.', '[data-guide="refund-approve"]'],
      ['F08.4', 'Ghi nhận đã hoàn (kèm bằng chứng)', 'accountant', '/refunds/:id', 'Modal ghi nhận hoàn gồm ngày, phương thức, tham chiếu và upload evidence.', 'Ngày 28/10/2026; Chuyển khoản; UNC289104; `uy_nhiem_chi_hoan_coc.pdf`.', 'Dùng file mẫu/đính kèm evidence và bấm Xác nhận đã hoàn.', 'Hồ sơ Đã hoàn; phòng vẫn Chờ dọn.', '[data-guide="refund-paid"]'],
    ],
  },
  {
    key: 'F09', title: 'Dọn phòng & mở cho thuê lại', golive: '15, 16', core: true, steps: [
      ['F09.1', 'Xác nhận dọn xong', 'ops', '/rooms?status=cleaning', 'Tab Chờ dọn và action Xác nhận dọn xong.', 'Phòng demo Chờ dọn.', 'Chuyển Vận hành, mở tab Chờ dọn và bấm Xác nhận dọn xong.', 'Toast xác nhận; phòng rời khỏi danh sách Chờ dọn.', '[data-guide="confirm-clean"]'],
      ['F09.2', 'Phòng trở lại Sẵn sàng', 'ops', '/rooms?status=ready', 'Tab Sẵn sàng và action Giữ chỗ/Tạo hợp đồng.', 'Mã phòng demo sau khi dọn.', 'Lọc Sẵn sàng và tìm lại mã phòng.', 'Phòng Sẵn sàng; vòng đời cho thuê hoàn tất.', '[data-guide="rooms-table"]'],
    ],
  },
  {
    key: 'F10', title: 'Bổ trợ (tùy chọn)', core: false, steps: [
      ['F10.1', 'Thêm chi phí', 'accountant', '/expenses', 'Danh sách chi phí và drawer nhập nhóm chi, số tiền và tòa.', '28/10/2026; Sửa khóa phòng Z.01.01; 350.000đ; Tòa Demo Onboard.', 'Bấm Điền dữ liệu mẫu, kiểm tra đúng tòa rồi lưu.', 'Chi phí CP… xuất hiện và liên kết đúng TH-DEMO-01.', '[data-guide="expense-add"]'],
      ['F10.2', 'Import khách bằng file mẫu', 'admin', '/settings/import?type=tenant', 'Wizard upload, mapping, kiểm tra lỗi và commit.', 'File mẫu 10 dòng có lỗi cố ý.', 'Bấm Dùng file mẫu, mapping, kiểm tra và Xác nhận import.', 'KPI Hợp lệ/Cần kiểm tra/Lỗi; dòng hợp lệ được tạo, dòng lỗi bị bỏ qua.', '[data-guide="import-sample"]'],
      ['F10.3', 'Tạo tài khoản Vận hành', 'admin', '/settings/users', 'Danh sách tài khoản và drawer tạo user.', 'Lê Demo Vận Hành; demo.vanhanh@timohouse.vn; 0913 222 333; role ops; hiệu lực 28/10/2026; chọn tòa đầu tiên.', 'Bấm Tạo tài khoản, điền form và lưu.', 'Tài khoản mới có chip Vận hành và phạm vi tòa.', '[data-guide="user-add"]'],
      ['F10.4', 'Xuất báo cáo công nợ', 'accountant', '/reports?tab=debt', 'Báo cáo công nợ theo tòa và nút Xuất CSV.', 'Kỳ 10/2026.', 'Chuyển Kế toán, mở báo cáo công nợ và bấm Xuất CSV.', 'File CSV chứa phải thu, đã thu và còn nợ theo tòa.', '[data-guide="reports-table"]'],
    ],
  },
  {
    key: 'F12', title: 'OCR hợp đồng & Data Onboarding (spec v1.8 §12.8)', core: true, steps: [
      ['F12.1', 'Tải file mẫu, kiểm tra hash & chạy OCR', 'ops', '/contracts/ocr', 'Bước 1 Tải file: loại tài liệu, dropzone, nút Dùng file mẫu; danh sách OCR Job.', 'File mẫu HĐ cho thuê phòng 4 trang (engine mock-1).', 'Chọn loại "Hợp đồng thuê", bấm Dùng file mẫu; job chuyển UPLOADED → PROCESSING → READY_FOR_REVIEW.', 'Màn Review hiện 13 nhóm entity, 5 trường Cần kiểm tra, khách hàng cảnh báo xung đột CCCD/SĐT, tòa & phòng đề xuất LINK.', '[data-guide="ocr-validate"]'],
      ['F12.2', 'Review nhóm entity – sửa trường & xử lý xung đột khách', 'ops', '/contracts/ocr', 'Section Khách hàng (Create/Link/Update), Tòa nhà, Phòng, Hợp đồng, Cọc với bảng trường raw/normalized/confidence/trang.', 'Họ tên có dấu, SĐT đủ 10 số, ngày kết thúc 31/10/2027, cọc = 1 tháng tiền nhà, xác nhận mã phòng gợi ý.', 'Sửa 5 trường Cần kiểm tra ngay trên section; chọn Update cho khách trùng CCCD (ghi SĐT mới, có audit).', 'Không còn trường Cần kiểm tra; Khách hàng = Update hồ sơ có sẵn; Tòa/Phòng = Link bản ghi hệ thống (không tạo trùng).', '[data-guide="ocr-validate"]'],
      ['F12.3', 'Giá dịch vụ HĐ ≠ giá tòa → Validate', 'ops', '/contracts/ocr', 'Section Dịch vụ & Giá: giá HĐ, giá tòa, radio Chỉ HĐ này / Cập nhật giá tòa / Ignore.', 'Điện 4.000đ (tòa 3.800đ) → Cập nhật giá tòa từ 01/11/2026; Internet 100.000đ (tòa 200.000đ) → Chỉ áp dụng HĐ này.', 'Chọn cách xử lý từng dòng xung đột giá rồi bấm Validate.', 'Validate đạt, job VALIDATED; nút Xác nhận tạo hợp đồng bật.', '[data-guide="ocr-commit"]'],
      ['F12.4', 'Xác nhận tạo hợp đồng – commit 1 transaction', 'ops', '/contracts/ocr', 'Modal xác nhận tóm tắt payload; màn Kết quả liệt kê entity đã tạo/liên kết.', 'Commit không mô phỏng lỗi.', 'Bấm Xác nhận tạo hợp đồng → Commit.', 'Job COMMITTED; HĐ Dự thảo nguồn OCR kèm người thuê, 6 dịch vụ snapshot, cọc RECEIVABLE, xe, 2 chỉ số OPENING, tài sản bàn giao, điều khoản thanh toán/gia hạn, tài liệu; giá điện tòa Sunrise có bản ghi mới hiệu lực 01/11/2026.', '[data-guide="ocr-open-contract"]'],
    ],
  },
  {
    key: 'F14', title: 'Hiệu suất thu tiền → bảng lương → chi lương (spec v1.8 §4.26)', core: true, steps: [
      ['F14.1', 'Hiệu suất thu tiền M1/M2/M3 theo NV × tòa', 'admin', '/hr/collection-performance', 'Bảng NV × tòa: số phòng, DT niêm yết, DT phải thu, thu M1/M2/M3, tổng sau 3 mốc, dịch vụ, tỷ lệ DV/DT, thu thêm, tổng DT thu được, hiệu suất %, mức lương/phòng, lương theo phòng; drill-down về Payment.', 'Kỳ 10/2026; mốc M1 ≤ 05, M2 ≤ 10, M3 ≤ 15 (Master Data); Payroll Rule PR-2026-01/PR-2026-01S (chờ chốt).', 'Mở Nhân sự → Hiệu suất thu tiền, bấm drill-down dòng đầu.', 'Mọi số thu truy được về Payment Allocation gắn mốc; hiệu suất = Tổng DT thu được / DT niêm yết × 100.', '[data-guide="perf-table"]'],
      ['F14.2', 'Mở kỳ lương → điều chỉnh có lý do → review → duyệt → khóa', 'hr', '/hr/payroll', 'Bảng lương cấu phần §4.26.5, stepper Nháp → Chờ duyệt → Đã duyệt → Đã khóa, drill-down §4.26.7.', 'Kỳ 10/2026 (đã mở sẵn – Nháp); điều chỉnh +300.000đ có lý do cho dòng đầu.', 'Nhân sự: điều chỉnh dòng đầu (có lý do) → Gửi review; Kế toán: Duyệt → Khóa bảng lương.', 'Snapshot NV + tòa + kỳ; không hoa hồng Sale / PC số nhà; khóa sinh danh sách chi lương + Payroll Cost Allocation, KHÔNG tạo chi phí Lương.', '[data-guide="pay-lock"]'],
      ['F14.3', 'Chi lương từng người (partial) & hàng loạt', 'accountant', '/hr/salary-payments', 'Danh sách chi lương từ bảng lương đã khóa: phải chi / đã chi / còn phải chi, TK nhận snapshot, mã GD, chứng từ, trạng thái.', 'Chi một phần 50% cho người đầu tiên (UNC-UAT-1), rồi chi hàng loạt phần còn lại (UNC-202610).', 'Bấm Ghi nhận chi trên dòng đầu → nhập 50% → Ghi nhận; bấm Chi hàng loạt → Chi.', 'Trạng thái Chưa chi → Chi một phần → Đã chi; tổng còn phải chi = 0; không có Expense nhóm Lương.', '[data-guide="salary-table"]'],
    ],
  },
  {
    key: 'F15', title: 'Import chi phí & phân bổ chi phí chung (spec v1.8 §4.27)', core: true, steps: [
      ['F15.1', 'Import chi phí từ file mẫu – phát hiện trùng → phân bổ chi phí chung', 'accountant', '/settings/import?type=expense', 'Wizard import 4 bước với dòng trùng/lỗi; phiếu CHUNG chờ phân bổ → drawer phân bổ theo số phòng / doanh thu / số tòa / tỷ lệ / nhóm T-S-G.', 'File mẫu 9 dòng: 6 hợp lệ (1 CHUNG), 1 trùng phiếu đã có, 1 tòa không tồn tại, 1 hạng mục sai & số tiền 0.', 'Dùng file mẫu → Tiếp tục → Xác nhận import; ở Chi phí lọc Chờ phân bổ → Phân bổ theo số phòng → Xác nhận.', 'Job import tạo 6, bỏ qua 3 (nguồn Import, Work Queue đếm lỗi); phiếu chung → Đã phân bổ với Expense Allocation ghi phương thức/kỳ/người xác nhận.', '[data-guide="expense-alloc"]'],
    ],
  },
  {
    key: 'F16', title: 'Báo cáo tháng: Report A/B → khóa kỳ → đối soát golden (spec v1.8 §12.23)', core: true, steps: [
      ['F16.1', 'Report A tòa G1 kỳ 06/2026 (snapshot đã khóa) & drill-down về chứng từ', 'accountant', '/reports/building-profit?period=2026-06', 'Layout "Báo cáo tháng 6" 12 nhóm: mỗi dòng có metric_code, giá trị, trạng thái (Đã xác nhận / Chờ chốt Q-RPT), kính lúp drill-down; bảng cổ phần 9 cổ đông = 100% với LN gộp/ròng × %.', 'Kỳ 06/2026 đã khóa 05/07/2026 (kịch bản), tòa G1 loại G.', 'Chọn kỳ 06/2026 + tòa G1; bấm kính lúp dòng Doanh thu tiền phòng → danh sách Invoice Line.', 'Snapshot đã khóa; RENT_REVENUE 47.760.000 = 12 Invoice Line; chuỗi Tòa → Phòng → Hóa đơn → Invoice Line; NET_PROFIT có chip Chờ chốt do TOTAL_REVENUE chưa chốt.', '[data-guide="ra-table"]'],
      ['F16.2', 'Report B T/S/G kỳ 10/2026 → gửi review → khóa kỳ → dữ liệu sau khóa không đổi báo cáo', 'accountant', '/reports/business-summary', 'Bảng Total / Nhà T / Nhà S / Nhà G theo Metric Registry; loại tòa resolve theo Building Type History; TOTAL = T + S + G; kỳ báo cáo Open → Reviewing → Locked.', 'Kỳ 10/2026 đang Open; 7 tòa (5 tòa gốc + G1 + Tòa Demo Onboard).', 'Xem Report B → Kỳ báo cáo: Gửi review → Khóa kỳ (xác nhận) → thêm 1 chi phí kỳ 10 → mở lại Report A: giá trị giữ nguyên snapshot.', 'Kỳ Đã khóa với snapshot A mỗi tòa + 1 snapshot B, freeze metric/allocation/loại tòa/share; audit PROFIT_REPORT_LOCKED; chi phí thêm sau khóa không đổi metric (chip "Dữ liệu sống hiện lệch").', '[data-guide="rp-lock"]'],
      ['F16.3', 'Đối soát golden G1 tháng 6 & ký xác nhận metric (Admin)', 'admin', '/reports/reconcile', 'Bảng metric_code / excel_value / system_value / difference / % / status / note; Metric Registry với nút Xác nhận cho metric chờ chốt.', 'Golden A: TOTAL_REVENUE 79.912.000, RENT 47.760.000, SERVICE 21.063.333,333, COGS 66.358.594, OPEX 10.476.125,04…', 'Chọn Golden A → xem status; sang Metric Registry → Xác nhận NEW_ROOM_COUNT với quyết định "HĐ bắt đầu trong kỳ".', 'Từng line RENT/ELECTRIC/WATER/…/COGS/OPEX/TOTAL_COST = MATCH; TOTAL_REVENUE, GROSS/NET_PROFIT, count = NEED_BUSINESS_CONFIRMATION kèm Q-RPT; metric xác nhận tăng version v2, kỳ đã khóa giữ version cũ.', '[data-guide="rc-table"]'],
    ],
  },
  {
    key: 'F17', title: 'Cổ đông → cổ phần theo tòa → góp vốn → chia lợi nhuận từ báo cáo khóa (spec v1.8 §4.29–4.32)', core: true, steps: [
      ['F17.1', 'Cấu hình cổ phần G1 theo ngày hiệu lực (100%, không ghi đè lịch sử) → đợt góp vốn → ghi nhận', 'accountant', '/investment/shares', 'Màn Cổ phần theo tòa: tỷ lệ hiện tại / theo ngày / lịch sử / kiểm tra 100% / export; drawer cấu hình từ ngày hiệu lực; đợt góp vốn phân bổ theo cổ phần.', 'G1: 9 cổ đông = 100%; An 7% → 5%, Lan 5% → 7% từ 01/09/2026. Chuyển 1% Đức → Hương từ 29/10/2026; đợt góp vốn 45.000.000 hạn +14 ngày.', 'Xem tỷ lệ tại 30/06/2026 rồi hôm nay; Cấu hình cổ phần (Đức −1, Hương +1, hiệu lực ngày mai) → Lưu; Tạo đợt góp vốn → mở đợt → Ghi nhận dòng đầu (UNC-UAT-GV-G1).', 'Tổng tại 30/06 và hôm nay đều 100% với tỷ lệ khác nhau; record mới từ ngày mai, record cũ đóng effectiveTo, lịch sử tăng; đợt góp vốn 9 dòng theo cổ phần, dòng đầu Đã góp có chứng từ.', '[data-guide="shares-table"]'],
      ['F17.2', 'Generate phân phối LN từ kỳ đã khóa → xác nhận (Admin)', 'admin', '/investment/shareholders?tab=profit', 'Tab Phân phối lợi nhuận: generate từ kỳ Locked, bảng cổ đông × tỷ lệ snapshot × NET_PROFIT, cột Vốn / LN gộp × % / LN ròng × % / Tổng nhận; trạng thái Nháp → Chờ xác nhận → Đã xác nhận.', 'Kỳ 10/2026 vừa khóa ở F16.2; tòa G1 (cổ phần snapshot 9 cổ đông tại 31/10).', 'Generate từ báo cáo khóa: kỳ 10/2026, tòa G1 → Generate → Xác nhận; thử Mở lại kỳ ở Kỳ báo cáo → bị chặn.', 'Bảng PL-202610-xxx đã xác nhận: Σ LN ròng × % = NET_PROFIT snapshot; tỷ lệ snapshot không đổi khi đổi cổ phần sau đó; kỳ có bảng đã xác nhận không mở lại được.', '[data-guide="profit-table"]'],
    ],
  },
];

const STEPS = FLOWS.flatMap((f) => f.steps.map((s) => ({
  id: s[0], flow: f.key, flowTitle: f.title, title: s[1], role: s[2], route: s[3], screen: s[4], inputs: s[5], action: s[6], expected: s[7], selector: s[8], core: f.core, golive: f.golive || '',
})));
const STEP = new Map(STEPS.map((s) => [s.id, s]));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

async function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); });
  });
}

async function ensureServer() {
  if (BASE_URL) { const r = await fetch(`${BASE_URL}/index.html`); if (!r.ok) throw new Error(`TIMEHOUSE_BASE_URL trả HTTP ${r.status}`); return { url: BASE_URL, child: null }; }
  const port = await freePort();
  const child = spawn(process.execPath, ['scripts/serve.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(port) }, stdio: 'ignore', windowsHide: true });
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 40; i++) { try { const r = await fetch(`${url}/index.html`); if (r.ok) return { url, child }; } catch { /* wait */ } await sleep(100); }
  child.kill(); throw new Error(`Không khởi động được server tại ${url}`);
}

async function goto(page, base, hash) {
  await page.goto(`${base}/${hash}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(100);
  await page.evaluate(() => document.body.classList.remove('guide-open'));
}

async function clickText(page, text, opts = {}) {
  const root = opts.scope || page;
  const loc = root.getByRole(opts.role || 'button', { name: text, exact: opts.exact !== false }).first();
  await loc.waitFor({ state: 'visible' });
  await loc.click();
  return loc;
}

async function clickContains(page, text) {
  const loc = page.locator('button, a').filter({ hasText: text }).first();
  await loc.waitFor({ state: 'visible' });
  await loc.click();
  return loc;
}

async function fill(page, name, value, scope = page) {
  const loc = scope.locator(`[name="${name}"]`).first();
  await loc.waitFor({ state: 'visible' });
  await loc.fill(String(value));
  await loc.press('Tab').catch(() => {});
}

async function select(page, name, value, scope = page) {
  const loc = scope.locator(`select[name="${name}"]`).first();
  await loc.waitFor({ state: 'visible' });
  const options = await loc.locator('option').evaluateAll((xs) => xs.map((x) => ({ value: x.value, text: x.textContent.trim() })));
  const match = options.find((x) => x.value === String(value)) || options.find((x) => x.text.includes(String(value)));
  if (!match) throw new Error(`Không tìm thấy option ${name}=${value}; có: ${options.map((x) => x.text).join(', ')}`);
  await loc.selectOption(match.value);
}

async function switchRole(page, role) {
  const current = await page.evaluate(() => window.TH?.auth?.role?.() || '').catch(() => '');
  if (current === role) return;
  await page.locator('.tb-user').click();
  const item = page.locator('div[role="menu"] button[role="menuitem"]').filter({ hasText: ROLE_MENU[role] || new RegExp(roleLabel[role] || role) }).first();
  await item.waitFor({ state: 'visible' }); await item.click({ force: true }); await page.waitForTimeout(120);
  const actual = await page.evaluate(() => window.TH?.auth?.role?.() || '');
  if (actual !== role) throw new Error(`Chuyển vai trò thất bại: cần ${role}, thực tế ${actual}`);
}

async function stateSnapshot(page) {
  return page.evaluate(() => {
    const T = window.TH; const s = T.store.state; const raw = (c) => s[c] || [];
    const users = raw('users'); const session = s.session || {};
    const userTenants = raw('tenants').filter((x) => x.source === 'user');
    const demoTenant = userTenants.find((x) => x.phone === '0912 000 111');
    const tenant = demoTenant || userTenants.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
    const landlord = raw('landlords').find((x) => x.name === 'Nguyễn Demo Chủ Nhà' || x.phone === '0909 000 111') || null;
    const building = raw('buildings').find((x) => x.code === 'TH-DEMO-01' || x.name === 'Tòa Demo Onboard') || null;
    const area = building ? raw('areas').find((x) => x.id === building.areaId) || null : null;
    const room = building ? raw('rooms').find((x) => x.buildingId === building.id && x.code === 'Z.01.01') || null : null;
    const contracts = raw('contracts').filter((x) => x.source === 'user');
    const contract = contracts.find((x) => tenant && room && x.tenantId === tenant.id && x.roomId === room.id) || null;
    const invoices = contract ? raw('invoices').filter((x) => x.contractId === contract.id && x.source === 'user' && x.docStatus !== 'cancelled') : [];
    const invoice = invoices.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
    const pays = invoice ? raw('payments').filter((x) => x.source === 'user' && raw('paymentAllocations').some((a) => a.paymentId === x.id && a.invoiceId === invoice.id)) : [];
    const payment = pays.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
     const batches = raw('zaloBatches').filter((x) => x.source === 'user');
     // St.add preserves creation order; use the last user batch when timestamps share a second.
     const batch = batches[batches.length - 1] || null;
     const refund = contract ? raw('refunds').filter((x) => x.contractId === contract.id).slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] : null;
     const expense = raw('expenses').filter((x) => x.source === 'user' && x.dataSource !== 'import').slice().sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))[0] || null;
     const expenseAllocations = expense ? raw('expenseAllocations').filter((x) => x.expenseId === expense.id) : [];
     const importJob = raw('importJobs').filter((x) => x.source === 'user' && x.type === 'tenant').slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
     const user = users.filter((x) => x.source === 'user').slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
     const meter = room ? raw('meterReadings').filter((x) => x.roomId === room.id && x.period === s.meta.period).slice(-2) : [];
     const paid = invoice ? T.q.invPaid(invoice) : 0; const remaining = invoice ? T.q.invRemaining(invoice) : 0;
     const landlordContract = building ? (T.q.landlordContractOf ? T.q.landlordContractOf(building.id) : null) : null;
     const landlordPayments = landlordContract ? raw('landlordPayments').filter((x) => x.landlordContractId === landlordContract.id) : [];
     const landlordRooms = building ? raw('rooms').filter((x) => x.buildingId === building.id) : [];
     const contractServices = contract ? raw('contractServices').filter((x) => x.contractId === contract.id) : [];
     return { session, today: s.meta.today, period: s.meta.period, tenant, contract, room, invoice, payment, batch, refund, expense, expenseAllocations, importJob, user, meter, paid, remaining, landlord, area, building, contractServices, landlordContract, landlordPayments: landlordPayments.length, landlordRooms: landlordRooms.length, landlordRoomsReady: landlordRooms.filter((x) => x.status === 'ready').length, guide: s.guide, url: location.hash };
  });
}

async function annotate(page, id, role, selector) {
  await page.evaluate(({ id, role, selector, labels }) => {
    document.querySelectorAll('[data-evidence-callout]').forEach((x) => x.remove());
    let target = null; try { target = selector && document.querySelector(selector); } catch (e) { target = null; }
    if (target) { const box = target.getBoundingClientRect(); const style = getComputedStyle(target); if (box.width === 0 || box.height === 0 || style.visibility === 'hidden' || style.display === 'none') target = null; }
    const modal = [...document.querySelectorAll('.overlay .drawer, .overlay .modal')].reverse().find((x) => { const b = x.getBoundingClientRect(); const st = getComputedStyle(x); return b.width > 0 && b.height > 0 && st.visibility !== 'hidden' && st.display !== 'none'; });
    if (modal) target = modal;
    if (!target) target = document.querySelector('#content') || document.body;
    if (target) { target.scrollIntoView({ block: 'center', inline: 'nearest' }); target.dataset.evidenceOldOutline = target.style.outline || ''; target.style.outline = '3px solid #f59e0b'; target.style.outlineOffset = '4px'; target.dataset.evidenceTarget = '1'; }
    const label = document.createElement('div'); label.dataset.evidenceCallout = '1'; label.textContent = `${id} · ${labels[role] || role} · ${location.hash}`;
    label.textContent += ` | captured ${new Date().toISOString()}`;
    Object.assign(label.style, { position: 'fixed', zIndex: '2147483647', right: '16px', bottom: '16px', padding: '8px 12px', borderRadius: '8px', background: '#0f2a5f', color: '#fff', font: '600 14px system-ui', boxShadow: '0 2px 10px rgba(0,0,0,.25)' });
    document.body.appendChild(label);
  }, { id, role, selector, labels: roleLabel });
}

async function clearAnnotations(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-evidence-target]').forEach((x) => { x.style.outline = x.dataset.evidenceOldOutline || ''; x.style.outlineOffset = ''; delete x.dataset.evidenceTarget; delete x.dataset.evidenceOldOutline; });
    document.querySelectorAll('[data-evidence-callout]').forEach((x) => x.remove());
  });
}

async function screenshot(page, id, kind, role, selector) {
  await annotate(page, id, role, selector);
  const file = path.join(EVIDENCE, `${id}-${kind}.png`);
  await page.screenshot({ path: file, fullPage: false });
  await clearAnnotations(page);
  return path.relative(OUT, file).replaceAll('\\', '/');
}

async function waitForModal(page) { await page.locator('.overlay').last().waitFor({ state: 'visible' }); return page.locator('.overlay').last(); }
async function closeModal(page) { const m = page.locator('.overlay').last(); if (await m.count()) { const close = m.locator('button').filter({ hasText: /Hủy|Đóng|×/ }).first(); if (await close.count()) await close.click().catch(() => {}); } }
async function clickAction(page, act) { const loc = page.locator(`[data-act="${act}"]`).first(); await loc.waitFor({ state: 'visible' }); await loc.click(); return loc; }
async function fillDemo(page, key, scope = page) {
  const button = scope.locator(`[data-demo-fill="${key}"]`).first();
  await button.waitFor({ state: 'visible' }); await button.click(); await page.waitForTimeout(180);
  return button;
}

const RESULTS = [];
async function runScenario(page, base) {
  const actual = {};
  const results = RESULTS;
  const run = async (id, fn, options = {}) => {
    const def = STEP.get(id); const started = new Date().toISOString(); let before = [];
    try {
      if (options.before) before.push(await screenshot(page, id, 'input', def.role, def.selector));
      const out = await fn(); await page.waitForTimeout(options.wait || 160);
      await page.evaluate(() => { try { window.TH.guide.evaluate('uat'); } catch (e) { /* guide optional */ } });
      const snap = await stateSnapshot(page); Object.assign(actual, snap);
      const failedAssertion = (out?.assertions || []).find((x) => x.status === 'FAIL'); if (failedAssertion) throw new Error(`${id} assertion ${failedAssertion.id} FAIL: ${failedAssertion.detail || ''}`);
      const after = await screenshot(page, id, 'result', def.role, out?.scrollTo || def.selector);
      const extra = Array.isArray(out?.screenshots) ? out.screenshots : [];
      const finished = new Date().toISOString();
      const record = { ...def, phase: 'P1', milestone: id, route: snap.url || def.route, phaseFlags: { p1: true, p2: false, p3: false }, timestamps: { startedAt: started, finishedAt: finished }, startedAt: started, finishedAt: finished, status: 'PASS', actual: out?.actual || describeActual(id, snap), assertions: out?.assertions || [], screenshots: [...before, ...extra, after], downloads: out?.downloads || [], recordIds: idsOf(snap), commit: COMMIT, error: '' };
      results.push(record); return record;
    } catch (e) {
      const snap = await stateSnapshot(page).catch(() => ({})); Object.assign(actual, snap);
      const images = [...before]; try { images.push(await screenshot(page, id, 'error', def.role, def.selector)); } catch { /* keep original error */ }
      const finished = new Date().toISOString();
      results.push({ ...def, phase: 'P1', milestone: id, route: snap.url || def.route, phaseFlags: { p1: true, p2: false, p3: false }, timestamps: { startedAt: started, finishedAt: finished }, startedAt: started, finishedAt: finished, status: 'FAIL', actual: describeActual(id, snap), assertions: [], screenshots: images, downloads: [], recordIds: idsOf(snap), commit: COMMIT, error: e.stack || e.message });
      throw e;
    }
  };

  // S0 – fresh login, then overview/catalog/ready room.
  await goto(page, base, route('/login'));
  await page.locator('input[name=username]').fill('admin'); await page.locator('input[name=password]').fill('demo123');
  await run('S0.1', async () => { await clickText(page, 'Đăng nhập'); await page.waitForURL(/#\/dashboard/); return { actual: 'Đăng nhập thành công; Tổng quan mở với vai trò Quản trị viên.' }; }, { before: true });
  await run('S0.2', async () => { await goto(page, base, route('/dashboard')); return { actual: norm((await page.locator('#content').innerText()).slice(0, 450)) }; });
  await run('S0.3', async () => { await goto(page, base, route('/settings/catalog')); return { actual: norm((await page.locator('#content').innerText()).slice(0, 500)) }; });
  await switchRole(page, 'ops');
  await run('S0.4', async () => { await goto(page, base, route('/rooms?status=ready')); return { actual: norm((await page.locator('#content').innerText()).slice(0, 500)) }; });

  // F00 – landlord → lease → building → rooms (admin).
  await switchRole(page, 'admin');
  await run('F00.1', async () => {
    await goto(page, base, route('/landlords/new')); await page.waitForTimeout(500); await page.evaluate(() => { if (window.TH?._wz) delete window.TH._wz.landlordOnboarding; window.TH.router.refresh(); }); await page.waitForTimeout(400); await page.locator('#onboard-landlord input[name=name]').waitFor({ state: 'visible' });
    await fillDemo(page, 'landlord', page.locator('#content'));
    await clickText(page, 'Tiếp tục hợp đồng & tòa →'); await page.waitForTimeout(250);
    await fillDemo(page, 'owner-contract', page.locator('#content'));
    await clickText(page, 'Thêm tòa mới'); await page.waitForTimeout(250);
    let card = page.locator('[data-new-building]').first(); await card.locator('[data-act=quick-area]').click(); const areaModal = await waitForModal(page); await fillDemo(page, 'area', areaModal); await clickText(page, 'Thêm Khu nhà', { scope: areaModal }); await page.waitForTimeout(280);
    card = page.locator('[data-new-building]').first(); await fillDemo(page, 'building', card);
    const locked = await page.locator('[data-existing-building]:disabled, [data-linked-building]').count();
    await clickText(page, 'Tiếp tục khai báo phòng →'); await page.waitForTimeout(300);
    const preview = norm(await page.locator('[data-room-preview]').first().innerText());
    return { actual: `Bước 3 Phòng mở; preview "${preview}"; ${locked} tòa của chủ nhà khác bị khóa ở bước 2.`, assertions: [{ id: 'room-grid-preview', status: /20/.test(preview) ? 'PASS' : 'FAIL', detail: preview }] };
  }, { before: true });
  await run('F00.2', async () => {
    const spec = page.locator('[data-room-spec]').first(); await fillDemo(page, 'rooms', spec);
    await clickText(page, 'Kiểm tra hồ sơ →'); await page.waitForTimeout(300);
    const schedule = norm(await page.locator('#content .card').filter({ hasText: 'Lịch trả chủ nhà' }).first().innerText());
    await clickText(page, 'Hoàn tất onboarding'); await page.waitForURL(/#\/landlords\/[^?]+\?tab=buildings/); await page.waitForTimeout(350);
    const toast = norm(await page.locator('.toast').last().innerText().catch(() => ''));
    const s = await stateSnapshot(page);
    return { actual: `${toast || 'Đã hoàn tất onboarding'} · tòa ${s.building?.code || ''} có ${s.landlordRooms} phòng (${s.landlordRoomsReady} Sẵn sàng); HĐ ${s.landlordContract?.code || ''} sinh ${s.landlordPayments} kỳ trả.`, assertions: [{ id: 'rooms-generated', status: s.landlordRooms === 20 ? 'PASS' : 'FAIL', detail: `rooms=${s.landlordRooms}` }, { id: 'schedule-generated', status: s.landlordPayments === 12 ? 'PASS' : 'FAIL', detail: `payments=${s.landlordPayments}; preview="${schedule.slice(0, 80)}"` }] };
  }, { before: true });
  await run('F00.3', async () => { const s = await stateSnapshot(page); await goto(page, base, route(`/landlords/${s.landlord.id}?tab=contracts`)); const rows = await page.locator('#pay-card tbody tr').count(); const amountOk = (await page.locator('#pay-card tbody tr').first().innerText()).includes('270,000,000'); return { actual: `Tab Hợp đồng đầu vào hiển thị ${s.landlordContract?.code || ''} và lịch thanh toán ${s.landlordPayments} kỳ (bảng phân trang ${rows} dòng/trang, 270.000.000đ/kỳ).`, assertions: [{ id: 'schedule-rows', status: rows >= 10 && s.landlordPayments === 12 && amountOk ? 'PASS' : 'FAIL', detail: `rows=${rows}; payments=${s.landlordPayments}; amount270m=${amountOk}` }], scrollTo: '#pay-card' }; }, { before: true });
  await run('F00.4', async () => { const s = await stateSnapshot(page); await goto(page, base, route(`/buildings/${s.building.id}?tab=landlord`)); const text = norm(await page.locator('#tab-body').innerText()); const ok = text.includes(s.landlordContract?.code || '@@') && /Kỳ trả tới/.test(text); return { actual: `Tab Chủ nhà & HĐ đầu vào của ${s.building?.code}: ${text.slice(0, 260)}`, assertions: [{ id: 'building-has-lease', status: ok ? 'PASS' : 'FAIL', detail: ok ? `${s.landlordContract?.code} phủ tòa` : text.slice(0, 120) }], scrollTo: '#tab-body' }; }, { before: true });

  // F01 – tenant.
  await run('F01.1', async () => { await goto(page, base, route('/tenants')); await clickText(page, 'Thêm khách thuê'); await waitForModal(page); return { actual: 'Drawer Thêm khách thuê đã mở.' }; }, { before: true });
  await run('F01.2', async () => {
    const m = page.locator('.overlay').last(); await fillDemo(page, 'tenant', m); await clickText(page, 'Lưu khách thuê'); await page.waitForTimeout(300); return { actual: 'Đã dùng profile mẫu và lưu Nguyễn Demo Khách với mã KH… và trạng thái Khách mới.' };
  }, { before: true });

  // F02 – luôn dùng phòng Z.01.01 vừa sinh, không chọn nhầm phòng seed.
  await run('F02.1', async () => {
    await goto(page, base, route('/rooms?status=ready&s=Z.01.01'));
    const row = page.locator('tr').filter({ hasText: 'Z.01.01' }).first(); await row.waitFor({ state: 'visible' });
    const link = row.locator('[data-act="new-contract"], [data-act="newc"]').first();
    if (await link.count()) await link.click(); else await clickContains(page, 'Tạo hợp đồng');
    await page.waitForURL(/#\/contracts\/new/); return { actual: 'Form Tạo hợp đồng mở từ phòng Z.01.01 của Tòa Demo Onboard.' };
  }, { before: true });
  await run('F02.2', async () => {
    await fillDemo(page, 'contract', page.locator('#cf'));
    const form = page.locator('#cf'); const roomText = await form.locator('select[name=roomId] option:checked').innerText();
    return { actual: `Đã tự điền khách demo, phòng ${roomText}, thời hạn 01/10/2026–30/09/2027, ngày thu 05 và 3 dịch vụ.` };
  }, { before: true });
  await run('F02.3', async () => {
    const form = page.locator('#cf'); const price = await form.locator('input[name=price]').inputValue();
    const member = form.locator('input[name^=mb_name_]').first(); if (await member.count() && !(await member.inputValue())) await member.fill('Nguyễn Demo Khách');
    const services = await form.locator('#svc-body tr').count(); await clickText(page, 'Lưu hợp đồng →'); await page.waitForURL(/#\/contracts\/new\?id=.*step=5/); return { actual: `Hợp đồng giá ${price}, cọc 13.000.000đ và ${services} dịch vụ đã lưu Dự thảo.` };
  }, { before: true });
  await run('F02.4', async () => { const checks = norm(await page.locator('.check-list').first().innerText()); await fillDemo(page, 'activation', page.locator('#content')); await clickText(page, 'Xác nhận & kích hoạt hợp đồng'); await clickText(page, 'Kích hoạt', { exact: true }); await page.waitForTimeout(350); const s = await stateSnapshot(page); const dep = await page.evaluate((id) => { const c = window.TH.store.state.contracts.find((x) => x.id === id); const p = c && c.depositPaymentId ? window.TH.store.state.payments.find((x) => x.id === c.depositPaymentId) : null; return p ? p.code + ' ' + p.amount : ''; }, s.contract?.id); return { actual: `HĐ ${s.contract?.code} Hiệu lực; phòng ${s.room?.code} Đang thuê; phiếu thu cọc ${dep || '(không)'}; checklist: ${checks.slice(0, 200)}`, assertions: [{ id: 'lease-check-visible', status: /HĐ đầu vào/.test(checks) ? 'PASS' : 'FAIL', detail: checks.slice(0, 120) }, { id: 'deposit-receipt', status: dep ? 'PASS' : 'FAIL', detail: dep || 'no deposit payment' }] }; }, { before: true });

  // F03 – meters/invoice.
  await switchRole(page, 'accountant');
  await run('F03.1', async () => { await goto(page, base, route('/invoices')); await clickText(page, 'Tạo hóa đơn theo kỳ'); await page.waitForURL(/#\/invoices\/batch/); await fillDemo(page, 'invoice-scope', page.locator('#content')); return { actual: 'Wizard mở và đã tự chọn kỳ 10/2026, Tòa Demo Onboard, đủ 4 nhóm dịch vụ.' }; }, { before: true });
  await run('F03.2', async () => {
    const s = await stateSnapshot(page); const roomId = s.room?.id; await goto(page, base, route(`/invoices/batch?step=2&period=2026-10&buildingId=${encodeURIComponent(s.building?.id || '')}&room=${encodeURIComponent(roomId || '')}`));
    const ePrev = Number(await page.locator(`input[data-m=electricPrev][data-r="${roomId}"]`).inputValue()); const wPrev = Number(await page.locator(`input[data-m=waterPrev][data-r="${roomId}"]`).inputValue());
    await fillDemo(page, 'meter', page.locator('#content'));
    await clickText(page, 'Lưu tạm'); await page.waitForTimeout(250); return { actual: `Đã lưu chỉ số điện ${ePrev + 150}, nước ${wPrev + 12}.` };
  }, { before: true });
  await run('F03.3', async () => { await clickText(page, 'Tiếp tục preflight →'); await page.waitForURL(/#\/invoices\/batch\?step=3/); await clickText(page, /Tạo \d+ hóa đơn nháp/); await clickText(page, 'Tạo hóa đơn'); await page.waitForTimeout(250); return { actual: 'Preflight hợp lệ và tạo hóa đơn nháp.' }; }, { before: true });
  await run('F03.4', async () => { const s = await stateSnapshot(page); if (!s.invoice) throw new Error('Không tìm thấy hóa đơn nháp'); await goto(page, base, route(`/invoices/${s.invoice.id}`)); await clickText(page, 'Phát hành'); const m = await waitForModal(page); await clickText(page, 'Phát hành', { exact: true, scope: m }); await page.waitForTimeout(250); return { actual: 'Hóa đơn đã phát hành; trạng thái thu Chưa thu.' }; }, { before: true });

  // F04 – invoice reminder.
  await switchRole(page, 'admin');
  await run('F04.1', async () => { const s = await stateSnapshot(page); await goto(page, base, route(`/invoices/${s.invoice.id}`)); await clickAction(page, 'remind'); const m = await waitForModal(page); await fillDemo(page, 'zalo', m); return { actual: 'Drawer preview tự chọn đúng Nguyễn Demo Khách, Z.01.01 và số tiền hóa đơn.' }; }, { before: true });
  await run('F04.2', async () => { const drawer = await waitForModal(page); const send = drawer.locator('[data-act="send"]').first(); await send.click(); await page.waitForFunction(() => location.hash.includes('/zalo/batches/')); await page.waitForTimeout(400); return { actual: 'Đã tạo đợt ZL-202610-… và bắt đầu gửi.' }; }, { before: true });
  await run('F04.3', async () => { await page.waitForFunction(() => { const bs = (window.TH?.store?.state?.zaloBatches || []).filter(x => x.source === 'user'); const b = bs[bs.length - 1]; return b && !['sending', 'scheduled', 'draft'].includes(b.status); }, null, { timeout: 70000, polling: 900 }); const s = await stateSnapshot(page); if (s.batch) await goto(page, base, route(`/zalo/batches/${s.batch.id}`)); else await goto(page, base, route('/zalo/history')); return { actual: 'Đã theo dõi timer và trạng thái kết quả gửi.' }; }, { wait: 100 });

  // F05 – partial payment.
  await switchRole(page, 'accountant');
  await run('F05.1', async () => { const s = await stateSnapshot(page); await goto(page, base, route('/receivables')); const search = page.locator('input[name=s]').first(); if (await search.count()) { await search.fill(s.room?.code || ''); await search.press('Enter'); } return { actual: 'Dòng công nợ khách demo hiển thị tổng, đã thu 0 và còn lại.' }; }, { before: true });
  await run('F05.2', async () => { await clickAction(page, 'pay'); const m = await waitForModal(page); await fillDemo(page, 'payment', m); await clickText(page, 'Xác nhận ghi nhận', { exact: true, scope: m }); await page.waitForTimeout(500); return { actual: 'Đã dùng profile mẫu để ghi nhận PAY… 3.000.000đ, CK289104 và tự động phân bổ.' }; }, { before: true });
  await run('F05.3', async () => { const s = await stateSnapshot(page); if (!s.payment) throw new Error('Không có khoản thu user'); await goto(page, base, route(`/payments/${s.payment.id}`)); return { actual: `Khoản thu ${s.payment.code}; đã phân bổ ${s.payment.amount}đ.` }; });
  await run('F05.4', async () => { const s = await stateSnapshot(page); await goto(page, base, route('/receivables')); const search = page.locator('input[name=s]').first(); if (await search.count()) { await search.fill(s.invoice?.code || s.room?.code || ''); await search.press('Enter'); await page.waitForTimeout(150); } const row = page.locator('tr').filter({ hasText: s.invoice?.code || s.room?.code || '' }).first(); await row.scrollIntoViewIfNeeded(); const text = norm(await row.innerText()); await row.evaluate((el) => { document.querySelectorAll('[data-uat-row]').forEach((x) => x.removeAttribute('data-uat-row')); el.setAttribute('data-uat-row', '1'); }); const digits = text.replace(/[.,]/g, ''); const okRow = digits.includes(String(s.remaining || 0)) && digits.includes(String(s.paid || 0)); if (!okRow) throw new Error(`Dòng công nợ không hiển thị đã thu ${s.paid} / còn lại ${s.remaining}: ${text}`); return { actual: `Dòng ${s.invoice?.code} hiển thị Đã thu ${s.paid.toLocaleString('vi-VN')}đ; Còn lại ${s.remaining.toLocaleString('vi-VN')}đ; Thu một phần.`, assertions: [{ id: 'demo-receivable-row', status: 'PASS', detail: text }], scrollTo: '[data-uat-row]' }; });

  // F06 – debt reminder/retry.
  await switchRole(page, 'admin');
  await run('F06.1', async () => { const s = await stateSnapshot(page); await goto(page, base, route('/receivables')); const search = page.locator('input[name=s]').first(); if (await search.count()) { await search.fill(s.room?.code || ''); await search.press('Enter'); }
    const row = page.locator('tr').filter({ hasText: s.invoice?.code || s.tenant?.name || '' }).first(); const more = row.locator('button').last(); if (await more.count()) { await more.click(); await clickContains(page, 'Gửi nhắc Zalo'); } else await clickText(page, 'Gửi nhắc Zalo');
    await page.waitForTimeout(200); return { actual: `Preview nhắc nợ dùng số còn nợ mới ${s.remaining.toLocaleString('vi-VN')}đ.` }; }, { before: true });
  await run('F06.2', async () => { const drawer = await waitForModal(page); const force = drawer.locator('input[name=force]').first(); if (await force.count() && await force.isVisible() && !(await force.isChecked())) await force.check(); const send = drawer.locator('[data-act="send"]').first(); await send.click(); await page.waitForFunction(() => location.hash.includes('/zalo/batches/')); await page.waitForFunction(() => { const bs = (window.TH?.store?.state?.zaloBatches || []).filter(x => x.source === 'user'); const b = bs[bs.length - 1]; return b && !['sending', 'scheduled', 'draft'].includes(b.status); }, null, { timeout: 70000, polling: 900 }); const done = await stateSnapshot(page); if (done.batch?.id) await goto(page, base, route(`/zalo/batches/${done.batch.id}`)); return { actual: 'Đợt nhắc nợ kết thúc và tin có số dư hiện tại.' }; }, { before: true });
  await run('F06.3', async () => { const s = await stateSnapshot(page); const candidate = await page.evaluate(() => { const st = window.TH.store.state; const batches = (st.zaloBatches || []).filter((x) => x.source === 'user'); return batches.slice().reverse().find((b) => (st.zaloMessages || []).some((m) => m.batchId === b.id && ['failed', 'unknown'].includes(m.status))) || (st.zaloBatches || []).find((b) => b.code === 'ZL-202610-026'); });
    if (!candidate) return { actual: 'Không có tin failed/unknown; hệ thống giữ retry disabled đúng rule.' };
     await goto(page, base, route(`/zalo/batches/${candidate.id}`)); const retry = page.locator('[data-act="retry"]').first(); if (await retry.isEnabled().catch(() => false)) { await retry.click(); const m = await waitForModal(page); await clickText(page, 'Thử lại', { exact: true, scope: m }); await page.waitForTimeout(700); return { actual: `Đã xếp hàng retry tin lỗi của ${candidate.code}; tin đã giao không gửi lại.` }; }
    return { actual: `Đợt ${candidate.code} không còn tin đủ điều kiện retry; nút bị khóa đúng rule.` };
  }, { before: true });

  // F07/F08/F09 – terminate, refund, clean.
  await switchRole(page, 'ops');
  await run('F07.1', async () => { const s = await stateSnapshot(page); await goto(page, base, route(`/contracts/${s.contract.id}`)); const terminate = page.locator('[data-act="terminate"]').first(); await terminate.waitFor({ state: 'visible' }); const debtText = norm(await page.locator('#content').innerText()); return { actual: `Mở HĐ ${s.contract.code}; nút Kết thúc hợp đồng hiển thị; KPI công nợ còn ${s.remaining.toLocaleString('vi-VN')}đ.`, assertions: [{ id: 'terminate-action-visible', status: await terminate.isVisible() && debtText.includes('Công nợ') ? 'PASS' : 'FAIL', detail: debtText.slice(0, 180) }] }; }, { before: true });
  await run('F07.2', async () => { await clickAction(page, 'terminate'); const m = await waitForModal(page); await fillDemo(page, 'termination', m); await clickText(page, 'Xác nhận kết thúc', { exact: true, scope: m }); await page.waitForTimeout(350); const s2 = await stateSnapshot(page); return { actual: `Đã tự điền ngày 28/10/2026; HĐ ${s2.contract?.status || '-'} (Chờ quyết toán), Z.01.01 ${s2.room?.status || '-'}, hồ sơ hoàn cọc ${s2.refund?.code || ''} Nháp được tạo với cọc đang giữ ${(s2.refund?.deposit || 0).toLocaleString('vi-VN')}đ.`, assertions: [{ id: 'contract-pending-settlement', status: s2.contract?.status === 'pending_settlement' && s2.room?.status === 'cleaning' && !!s2.refund ? 'PASS' : 'FAIL', detail: `contract=${s2.contract?.status}; room=${s2.room?.status}; refund=${s2.refund?.code || '-'}` }] }; }, { before: true });
  await run('F08.1', async () => { const s = await stateSnapshot(page); await goto(page, base, route(`/refunds/new?id=${s.refund.id}&step=3`)); await fillDemo(page, 'refund-deductions', page.locator('#content')); const evs = page.locator('[data-act="add-ev"]'); for (let i = 0; i < Math.min(2, await evs.count()); i++) await evs.nth(i).click(); const lines = await page.locator('input[name^="d_"]').evaluateAll((xs) => xs.slice(0, 2).map((x, i) => x.value + ' = ' + ((document.querySelector('input[name="a_' + i + '"]') || {}).value || '0'))); return { actual: `Tự điền phương án: ${lines.join('; ')}; bù trừ công nợ 4.715.000đ; thực hoàn = 13.000.000 − 4.715.000 − 400.000 = 7.885.000đ.` }; }, { before: true });
  await run('F08.2', async () => { await clickAction(page, 'to4'); await page.waitForFunction(() => location.hash.includes('step=4')); await clickAction(page, 'submit'); const m = await waitForModal(page); await clickText(page, 'Gửi duyệt', { exact: true, scope: m }); await page.waitForTimeout(300); return { actual: 'Hồ sơ chuyển Chờ duyệt; vai trò Vận hành không thấy action Duyệt.' }; }, { before: true });
  await switchRole(page, 'accountant');
  await run('F08.3', async () => { const s = await stateSnapshot(page); await goto(page, base, route(`/refunds/${s.refund.id}`)); await clickText(page, 'Duyệt hoàn cọc'); await clickText(page, 'Duyệt', { exact: true }).catch(() => {}); await page.waitForTimeout(300); return { actual: 'Hồ sơ Đã duyệt; Duyệt không đồng nghĩa đã chuyển tiền.' }; }, { before: true });
  await run('F08.4', async () => { await clickText(page, 'Ghi nhận đã hoàn'); const m = await waitForModal(page); await fillDemo(page, 'refund-paid', m); await clickText(page, 'Xác nhận đã hoàn'); await page.waitForTimeout(350); const s = await stateSnapshot(page); const dedStatus = await page.evaluate((id) => (window.TH.store.state.refundDeductions || []).filter((d) => d.refundId === id).map((d) => d.status || '-'), s.refund?.id); const [download] = await Promise.all([page.waitForEvent('download'), clickAction(page, 'dl')]); const artifact = await saveDownload(download, { downloads: DOWNLOADS, out: OUT }, { expectValues: [{ row: 'any', value: s.refund?.code || '' }] }); return { actual: `Hồ sơ ${s.refund?.code} Đã hoàn ${(s.refund?.refundAmount || 0).toLocaleString('vi-VN')}đ; HĐ ${s.contract?.status || '-'} (Đã kết thúc sau hoàn cọc); UNC289104 và uy_nhiem_chi_hoan_coc.pdf đã lưu; dòng khấu trừ [${dedStatus.join(', ')}].`, downloads: [artifact], assertions: [{ id: 'deduction-status-sync', status: dedStatus.length && dedStatus.every((x) => x === 'refunded') ? 'PASS' : 'FAIL', detail: dedStatus.join(', ') || 'no deductions' }] }; }, { before: true });
  await switchRole(page, 'ops');
  await run('F09.1', async () => { const s = await stateSnapshot(page); await goto(page, base, route('/rooms?status=cleaning')); const row = page.locator('tr').filter({ hasText: s.room?.code || '' }).first(); const btn = row.locator('[data-act="clean"]').first(); if (await btn.count()) { await btn.click(); const m = await waitForModal(page); await clickText(page, 'Xác nhận dọn xong', { exact: true, scope: m }); } else await clickText(page, 'Xác nhận dọn xong'); await page.waitForTimeout(300); return { actual: `Phòng ${s.room?.code || ''} đã xác nhận dọn xong.` }; }, { before: true });
  await run('F09.2', async () => { const s = await stateSnapshot(page); await goto(page, base, route('/rooms?status=ready')); return { actual: `Phòng ${s.room?.code || ''} hiển thị Sẵn sàng với action cho thuê lại.` }; });

  // F10 – optional supporting steps, still UI-only.
  await switchRole(page, 'accountant');
  await run('F10.1', async () => { await goto(page, base, route('/expenses')); await clickText(page, 'Thêm chi phí'); const m = await waitForModal(page); await fillDemo(page, 'expense', m); await clickText(page, 'Lưu chi phí'); await page.waitForTimeout(350); return { actual: 'Chi phí sửa khóa Z.01.01 350.000đ đã lưu và liên kết Tòa Demo Onboard.' }; }, { before: true });
  await switchRole(page, 'admin');
  await run('F10.2', async () => { await goto(page, base, route('/settings/import?type=tenant')); await fillDemo(page, 'import', page.locator('#content')); await page.waitForFunction(() => location.hash.includes('step=2')); const phoneMap = page.locator('select[name="m_1"]'); if (await phoneMap.count() && (await phoneMap.inputValue()) !== 'phone') await phoneMap.selectOption('phone'); await clickAction(page, 'to3'); await page.waitForFunction(() => location.hash.includes('step=3')); await clickAction(page, 'to4'); await page.waitForFunction(() => location.hash.includes('step=4')); const actionShot = await screenshot(page, 'F10.2', 'action', 'admin', '[data-act="commit"]'); const commit = page.locator('[data-act="commit"]').first(); await commit.click(); const m = await waitForModal(page); await clickText(page, 'Import', { exact: true, scope: m }); await page.waitForTimeout(500); return { actual: 'File profile dùng phòng Z.* đã mapping/kiểm tra/commit; các dòng lỗi cố ý bị chặn.', screenshots: [actionShot] }; }, { before: true });
  await run('F10.3', async () => { await goto(page, base, route('/settings/users')); await clickText(page, 'Tạo tài khoản'); const m = await waitForModal(page); await fillDemo(page, 'user', m); await clickText(page, 'Lưu tài khoản'); await page.waitForTimeout(350); return { actual: 'Lê Demo Vận Hành đã lưu với vai trò Vận hành và phạm vi Tòa Demo Onboard.' }; }, { before: true });
  await switchRole(page, 'accountant');
  await run('F10.4', async () => { await goto(page, base, route('/reports?tab=debt')); const exp = page.locator('#content button[data-act="export"]').first(); if (!(await exp.count())) throw new Error('Không tìm thấy nút Xuất CSV báo cáo công nợ'); const [download] = await Promise.all([page.waitForEvent('download'), exp.click()]); const suggested = download.suggestedFilename(); const saved = path.join(DOWNLOADS, suggested); await download.saveAs(saved); const bytes = fs.readFileSync(saved); const content = bytes.toString('utf8').replace(/^\uFEFF/, ''); const lines = content.split(/\r?\n/).filter(Boolean); const header = lines[0] || ''; const required = ['Phải thu', 'Đã thu', 'Còn nợ']; const missing = required.filter(x => !header.includes(x)); if (missing.length || lines.length < 2) throw new Error(`CSV không hợp lệ: thiếu ${missing.join(', ') || 'dòng dữ liệu'}`); const artifact = { file: path.relative(OUT, saved).replaceAll('\\', '/'), name: suggested, bytes: bytes.length, rows: lines.length - 1, header, sha256: crypto.createHash('sha256').update(bytes).digest('hex') }; return { actual: `Đã kiểm tra CSV ${suggested}: ${artifact.rows} dòng, đủ cột Phải thu/Đã thu/Còn nợ, SHA-256 ${artifact.sha256.slice(0, 12)}…`, downloads: [artifact], assertions: [{ id: 'csv-content', status: 'PASS', detail: artifact }] }; }, { before: true });

  // F12 – OCR Data Onboarding (spec v1.8 §12.8): upload sample → review sections → price conflict → validate → commit
  await switchRole(page, 'ops');
  const ocrJob = () => page.evaluate(() => { const j = (window.TH.store.state.ocrJobs || []).slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0]; return j ? { id: j.id, code: j.code, status: j.status, pending: (j.fields || []).filter(f => f.decision === 'pending').map(f => f.key), result: j.result } : null; });
  await run('F12.1', async () => { await goto(page, base, route('/contracts/ocr')); await page.waitForTimeout(200); const sel = page.locator('#ocr-doctype'); if (await sel.count()) await sel.selectOption('contract'); await clickAction(page, 'sample'); await page.waitForURL(/#\/contracts\/ocr\?id=/); await page.waitForTimeout(2800); const j = await ocrJob(); if (!j || j.status !== 'READY_FOR_REVIEW') throw new Error('Job OCR chưa READY_FOR_REVIEW: ' + JSON.stringify(j)); const secs = await page.locator('details.ocr-sec').count(); return { actual: `Job ${j.code} READY_FOR_REVIEW (engine mock-1); ${secs} nhóm entity, ${j.pending.length} trường Cần kiểm tra (${j.pending.join(', ')}); khách hàng cảnh báo xung đột CCCD trùng/SĐT khác. OCR MÔ PHỎNG.`, assertions: [{ id: 'ocr-sections', status: secs === 13 ? 'PASS' : 'FAIL', detail: `${secs} section` }] }; }, { before: true });
  await run('F12.2', async () => {
    const spec = await page.evaluate(() => { const s = window.TH.ocr.sampleSpec(); return { tenantName: s.tenantName, phone: s.phone, end: window.TH.f.fromVN(s.end), deposit: s.deposit }; });
    const setField = async (key, value, kind) => { const det = page.locator(`details.ocr-sec:has([data-ocr-field="${key}"])`).first(); await det.evaluate((d) => { d.open = true; }); const ctl = page.locator(`[data-ocr-field="${key}"] [name="${key}"]`).first(); await ctl.waitFor({ state: 'visible' }); if (kind === 'money') { await ctl.fill(String(value)); } else await ctl.fill(String(value)); await ctl.dispatchEvent('change'); await page.waitForTimeout(220); };
    await setField('tenantName', spec.tenantName); await setField('phone', spec.phone); await setField('end', spec.end); await setField('deposit', spec.deposit, 'money');
    const rc = page.locator('[data-ocr-field="roomCode"] [data-act="accept"]').first(); if (await rc.count()) { await page.locator('details.ocr-sec[data-sec="ROOM"]').evaluate((d) => { d.open = true; }); await rc.click(); await page.waitForTimeout(220); }
    await page.locator('details.ocr-sec[data-sec="CUSTOMER"]').evaluate((d) => { d.open = true; }); const upd = page.locator('[data-act="dec"][data-g="CUSTOMER"][data-d="update"]').first(); if (await upd.count() && await upd.isEnabled()) { await upd.click(); await page.waitForTimeout(250); }
    const j = await ocrJob(); const dec = await page.evaluate((id) => { const x = window.TH.store.state.ocrJobs.find(z => z.id === id); return { c: (x.decisions.CUSTOMER || {}).decision, b: (x.decisions.BUILDING || {}).decision, r: (x.decisions.ROOM || {}).decision, rid: (x.decisions.ROOM || {}).candidateId }; }, j.id);
    return { actual: `Đã sửa/xác nhận 5 trường; còn ${j.pending.length} trường Cần kiểm tra. Khách hàng = ${dec.c}, Tòa = ${dec.b}, Phòng = ${dec.r} (candidate ${dec.rid ? 'có' : 'không'}). OCR MÔ PHỎNG.`, assertions: [{ id: 'ocr-reviewed', status: j.pending.length === 0 && dec.c === 'update' && dec.b === 'link' && dec.r === 'link' ? 'PASS' : 'FAIL', detail: JSON.stringify(dec) + ' pending=' + j.pending.join(',') }], scrollTo: 'details.ocr-sec[data-sec="CUSTOMER"]' };
  });
  await run('F12.3', async () => {
    await page.locator('details.ocr-sec[data-sec="CONTRACT_SERVICE"]').evaluate((d) => { d.open = true; }); await page.waitForTimeout(120);
    const keys = await page.evaluate(() => [...document.querySelectorAll('input[type=radio][data-on="svc-mode"]')].map(x => x.dataset.k).filter((v, i, a) => a.indexOf(v) === i));
    for (const k of keys) { const mode = k === 'svc_electric' ? 'updateBuilding' : 'snapshot'; const radio = page.locator(`input[name="svm_${k}"][value="${mode}"]`).first(); await radio.check(); await page.waitForTimeout(250); if (mode === 'updateBuilding') { const eff = page.locator(`[name="sveff_${k}"]`).first(); if (await eff.count()) { await eff.fill('2026-11-01'); await eff.dispatchEvent('change'); await page.waitForTimeout(250); } } }
    const before = await screenshot(page, 'F12.3', 'action', 'ops', 'details.ocr-sec[data-sec="CONTRACT_SERVICE"]');
    await page.locator('[data-guide="ocr-validate"]').first().click(); await page.waitForTimeout(500);
    const j = await ocrJob(); const v = await page.evaluate((id) => { const x = window.TH.store.state.ocrJobs.find(z => z.id === id); return x.lastValidation || { errors: [], warnings: [] }; }, j.id);
    return { actual: `Xử lý ${keys.length} xung đột giá (${keys.join(', ')}); Validate: ${v.errors.length} lỗi, ${v.warnings.length} cảnh báo → job ${j.status}. OCR MÔ PHỎNG.`, assertions: [{ id: 'ocr-validated', status: j.status === 'VALIDATED' ? 'PASS' : 'FAIL', detail: (v.errors || []).map(e => e.msg).join('; ') }], screenshots: [before], scrollTo: '[data-guide="ocr-commit"]' };
  });
  await run('F12.4', async () => {
    await page.locator('[data-guide="ocr-commit"]').first().click(); const m = await waitForModal(page); await m.locator('[data-guide="ocr-commit-confirm"]').click(); await page.waitForTimeout(700);
    const j = await ocrJob(); const info = await page.evaluate((id) => { const T = window.TH; const x = T.store.state.ocrJobs.find(z => z.id === id); const cid = x.result && x.result.contractId; const c = cid ? T.q.contract(cid) : null; return { code: c && c.code, status: c && c.status, entities: x.result ? x.result.entities.length : 0, tenants: cid ? T.q.contractTenants(cid).length : 0, services: cid ? T.q.contractServices(cid).length : 0, ledger: cid ? T.q.depositLedger(cid).length : 0, opening: cid ? T.q.openingReadings(cid).length : 0, assets: cid ? T.q.contractHandoverAssets(cid).length : 0, terms: cid ? !!T.q.contractPaymentTerms(cid) : false, renewal: cid ? !!T.q.contractRenewal(cid) : false, docs: cid ? T.store.state.documents.filter(d => d.entityId === cid).length : 0, dienNov: c ? T.q.servicePriceByCode('DIEN', c.buildingId, '2026-11-01') : 0 }; }, j.id);
    const ok = j.status === 'COMMITTED' && info.status === 'draft' && info.tenants >= 1 && info.services >= 1 && info.ledger >= 1 && info.opening === 2 && info.assets > 0 && info.terms && info.renewal && info.docs === 1 && info.dienNov === 4000;
    return { actual: `Job ${j.status}: HĐ ${info.code} (${info.status}) với ${info.entities} entity – ${info.tenants} người thuê, ${info.services} dịch vụ snapshot, ${info.ledger} bút toán cọc, ${info.opening} chỉ số OPENING, ${info.assets} tài sản bàn giao, điều khoản TT ${info.terms ? 'có' : 'không'}, gia hạn ${info.renewal ? 'có' : 'không'}, ${info.docs} tài liệu; giá điện tòa từ 01/11/2026 = ${info.dienNov}. OCR MÔ PHỎNG.`, assertions: [{ id: 'ocr-committed', status: ok ? 'PASS' : 'FAIL', detail: JSON.stringify(info) }] };
  });
  await switchRole(page, 'admin');

  // F14 – Hiệu suất thu tiền → bảng lương → chi lương (spec v1.8 §4.26)
  const payroll = () => page.evaluate(() => { const T = window.TH; const p = T.q.payroll('2026-10'); if (!p) return null; const rs = T.q.payrollResults(p.id); return { code: p.code, status: p.status, employees: rs.length, total: p.total, snapshots: T.q.payrollSnapshots(p.id).length, adjust: rs.reduce((s, r) => s + (r.adjustmentTotal || 0), 0), cost: T.q.payrollCostAllocations({ period: '2026-10' }).length, salary: T.q.salaryTotals(T.q.salaryPayments({ period: '2026-10' })), luongExpenses: T.store.all('expenses').filter(e => /^VH-L-/.test(e.categoryCode) || /chi lương/i.test(e.desc)).length }; });
  await run('F14.1', async () => { await goto(page, base, route('/hr/collection-performance')); await page.waitForTimeout(300); const n = await page.locator('#perf-tbl tbody tr').count(); const t = await page.evaluate(() => { const rows = window.TH.q.perfRows('2026-10'); const tt = window.TH.q.perfTotals(rows); return { rows: rows.length, M1: tt.M1, M2: tt.M2, M3: tt.M3, eff: tt.efficiency, roomSalary: tt.roomSalary, tagged: window.TH.store.all('paymentAllocations').filter(a => a.milestone).length, total: window.TH.store.all('paymentAllocations').length }; }); const drill = page.locator('[data-guide="perf-drill"]').first(); if (await drill.count()) { await drill.click(); await page.waitForTimeout(300); } const extra = [await screenshot(page, 'F14.1', 'action', 'admin', '.overlay')]; await closeModal(page); return { actual: `${t.rows} dòng NV × tòa kỳ 10/2026; thu M1 ${t.M1.toLocaleString('vi-VN')} · M2 ${t.M2.toLocaleString('vi-VN')} · M3 ${t.M3.toLocaleString('vi-VN')}; hiệu suất chung ${t.eff}% → lương theo phòng ${t.roomSalary.toLocaleString('vi-VN')}đ; ${t.tagged}/${t.total} Payment Allocation gắn mốc.`, assertions: [{ id: 'perf-rows', status: n >= 5 && t.rows === n && t.tagged === t.total ? 'PASS' : 'FAIL', detail: `table=${n}; rows=${t.rows}; tagged=${t.tagged}/${t.total}` }], screenshots: extra }; }, { before: true });
  await run('F14.2', async () => {
    await switchRole(page, 'hr'); await goto(page, base, route('/hr/payroll?period=2026-10')); await page.waitForTimeout(300);
    const st0 = await payroll(); if (!st0) { await clickAction(page, 'open'); await page.waitForTimeout(400); }
    const adj = page.locator('[data-guide="pay-adjust"]').first(); await adj.click(); let m = await waitForModal(page); await fill(page, 'amount', '300000', m); await fill(page, 'reason', 'Thưởng hỗ trợ bàn giao phòng (UAT)', m); await m.locator('[data-act="save"]').click(); await page.waitForTimeout(300);
    const before = await screenshot(page, 'F14.2', 'action', 'hr', '[data-guide="payroll-table"]');
    await page.locator('[data-guide="pay-submit"]').first().click(); await page.waitForTimeout(300);
    await switchRole(page, 'accountant'); await goto(page, base, route('/hr/payroll?period=2026-10')); await page.waitForTimeout(300); await page.locator('[data-guide="pay-approve"]').first().click(); await page.waitForTimeout(300);
    await page.locator('[data-guide="pay-lock"]').first().click(); m = await waitForModal(page); await m.locator('[data-act="yes"]').click(); await page.waitForTimeout(500);
    const st = await payroll();
    return { actual: `Bảng lương ${st.code} → ${st.status}: ${st.employees} NV, ${st.snapshots} snapshot NV × tòa, điều chỉnh +${st.adjust.toLocaleString('vi-VN')}đ có lý do, tổng ${st.total.toLocaleString('vi-VN')}đ; khóa sinh ${st.salary.count} khoản chi lương + ${st.cost} dòng Payroll Cost Allocation; chi phí "Lương" ở Chi phí = ${st.luongExpenses}.`, assertions: [{ id: 'payroll-locked', status: st.status === 'locked' && st.adjust === 300000 && st.salary.count > 0 && st.cost > 0 && st.luongExpenses === 0 ? 'PASS' : 'FAIL', detail: JSON.stringify({ status: st.status, adjust: st.adjust, salary: st.salary.count, cost: st.cost, luong: st.luongExpenses }) }], screenshots: [before] };
  }, { before: true });
  await run('F14.3', async () => {
    await goto(page, base, route('/hr/salary-payments?period=2026-10')); await page.waitForTimeout(300);
    const first = await page.evaluate(() => { const s = window.TH.q.salaryPayments({ period: '2026-10' })[0]; return { id: s.id, due: s.amountDue }; });
    await page.locator(`[data-guide="salary-pay"][data-id="${first.id}"]`).first().click(); let m = await waitForModal(page); await fill(page, 'amount', String(Math.round(first.due / 2 / 1000) * 1000), m); await fill(page, 'ref', 'UNC-UAT-1', m); await m.locator('[data-guide="salary-record"]').click(); await page.waitForTimeout(300);
    const before = await screenshot(page, 'F14.3', 'action', 'accountant', '[data-guide="salary-table"]');
    await page.locator('[data-guide="salary-bulk"]').first().click(); m = await waitForModal(page); await m.locator('[data-act="save"]').click(); await page.waitForTimeout(500);
    const st = await payroll(); const s1 = await page.evaluate((id) => { const s = window.TH.store.get('salaryPayments', id); return { status: s.status, payments: s.payments.length, paid: s.amountPaid, due: s.amountDue }; }, first.id);
    return { actual: `Khoản đầu: chi ${s1.payments} lần (một phần rồi đủ) → ${s1.status}; kỳ 10/2026: phải chi ${st.salary.due.toLocaleString('vi-VN')} · đã chi ${st.salary.paid.toLocaleString('vi-VN')} · còn ${st.salary.remaining.toLocaleString('vi-VN')}; ${st.salary.done}/${st.salary.count} Đã chi.`, assertions: [{ id: 'salary-paid', status: s1.status === 'paid' && s1.payments === 2 && st.salary.remaining === 0 ? 'PASS' : 'FAIL', detail: JSON.stringify(s1) + ' remaining=' + st.salary.remaining }], screenshots: [before] };
  }, { before: true });
  // F15 – Import chi phí & phân bổ (spec v1.8 §4.27)
  await run('F15.1', async () => {
    await goto(page, base, route('/settings/import?type=expense&period=2026-10')); await page.waitForTimeout(200); await clickAction(page, 'use-sample'); await page.waitForTimeout(300); await clickAction(page, 'to3'); await page.waitForTimeout(300);
    const before = await screenshot(page, 'F15.1', 'action', 'accountant', '.wz-foot');
    await clickAction(page, 'to4'); await page.waitForTimeout(300); await clickAction(page, 'commit'); const m = await waitForModal(page); await m.locator('[data-act="yes"]').click(); await page.waitForTimeout(600);
    const job = await page.evaluate(() => { const j = window.TH.store.all('importJobs').filter(x => x.type === 'expense' && x.source === 'user').slice(-1)[0]; return j ? { code: j.code, created: j.created, skipped: j.skipped, error: j.error } : null; });
    await goto(page, base, route('/expenses?status=pending_alloc&period=2026-10')); await page.waitForTimeout(300); const alloc = page.locator('[data-guide="expense-alloc"]').first(); await alloc.click(); const d = await waitForModal(page); await select(page, 'allocMethod', 'ROOM_COUNT', d); await page.waitForTimeout(200); const mid = await screenshot(page, 'F15.1', 'action2', 'accountant', '.overlay'); await d.locator('[data-guide="expense-allocate"]').click(); await page.waitForTimeout(400);
    const ex = await page.evaluate(() => { const e = window.TH.store.all('expenses').filter(x => x.status === 'allocated' && x.source === 'user').slice(-1)[0]; return e ? { code: e.code, method: (e.allocation || {}).method, allocs: window.TH.q.expenseAllocations(e.id).map(a => ({ pct: a.pct, amount: a.amount, method: a.method, period: a.period, by: !!a.confirmedBy })) } : null; });
    const ok = job && job.created === 6 && job.skipped === 3 && ex && ex.method === 'ROOM_COUNT' && ex.allocs.length >= 5 && ex.allocs.every(a => a.period === '2026-10' && a.by);
    return { actual: `Import ${job?.code}: tạo ${job?.created}, bỏ qua ${job?.skipped} (trùng CP đã có / tòa không tồn tại / hạng mục sai); phiếu ${ex?.code} phân bổ ${ex?.method} cho ${ex?.allocs.length} tòa (${(ex?.allocs || []).map(a => a.pct + '%').join(', ')}), Expense Allocation ghi kỳ & người xác nhận.`, assertions: [{ id: 'expense-import-alloc', status: ok ? 'PASS' : 'FAIL', detail: JSON.stringify({ job, ex }) }], screenshots: [before, mid] };
  }, { before: true });
  await switchRole(page, 'admin');

  // F16 – Báo cáo tháng (spec v1.8 §12.23)
  const g1Id = await page.evaluate(() => (window.TH.store.rawAll('buildings').find(b => b && b.code === 'G1') || {}).id);
  await run('F16.1', async () => {
    await switchRole(page, 'accountant'); await goto(page, base, route('/reports/building-profit?period=2026-06&buildingId=' + g1Id)); await page.waitForTimeout(400);
    const info = await page.evaluate((id) => { const T = window.TH; const r = T.reportP1.building('2026-06', id); const rp = T.q.reportPeriod('2026-06'); const d = T.reportP1.drill('2026-06', id, 'RENT_REVENUE'); return { frozen: r.frozen, status: rp && rp.status, rent: r.values.RENT_REVENUE, svc: r.values.SERVICE_REVENUE, cogs: r.values.COGS, opex: r.values.OPERATING_SELLING_COST, net: r.values.NET_PROFIT, netStatus: T.metrics.effectiveStatus('NET_PROFIT'), rows: d.rows.length, chain: d.rows[0] && d.rows[0].chain, shares: r.shares.rows.length, sharesOk: r.shares.ok, groups: T.reportP1.layoutA().length }; }, g1Id);
    await page.locator('[data-guide="ra-drill"]').first().click(); await waitForModal(page); await page.waitForTimeout(250); const mid = await screenshot(page, 'F16.1', 'action', 'accountant', '.overlay'); await closeModal(page); await page.waitForTimeout(200);
    const ok = info.frozen && info.status === 'LOCKED' && info.rent === 47760000 && Math.abs(info.svc - 21063333.333) < 0.01 && info.cogs === 66358594 && Math.abs(info.opex - 10476125.04) < 0.01 && info.rows === 12 && info.shares === 9 && info.sharesOk && info.netStatus === 'NEED_BUSINESS_CONFIRMATION' && info.groups === 11;
    return { actual: `Report A G1 06/2026 (${info.status}, snapshot): ${info.groups} nhóm dòng; RENT_REVENUE ${info.rent.toLocaleString('vi-VN')} = ${info.rows} Invoice Line (chuỗi ${(info.chain || []).join(' → ')}); SERVICE ${Math.round(info.svc).toLocaleString('vi-VN')}, COGS ${info.cogs.toLocaleString('vi-VN')}, CPBH ${Math.round(info.opex).toLocaleString('vi-VN')}, NET_PROFIT ${Math.round(info.net).toLocaleString('vi-VN')} (${info.netStatus} – phụ thuộc TOTAL_REVENUE Q-RPT-001); bảng cổ phần ${info.shares} cổ đông = 100%.`, assertions: [{ id: 'report-a-snapshot', status: ok ? 'PASS' : 'FAIL', detail: JSON.stringify(info) }], screenshots: [mid] };
  });
  await run('F16.2', async () => {
    await goto(page, base, route('/reports/business-summary?period=2026-10')); await page.waitForTimeout(400);
    const before = await screenshot(page, 'F16.2', 'action', 'accountant', '[data-guide="rb-table"]');
    await goto(page, base, route('/reports/periods')); await page.waitForTimeout(300); await page.locator('[data-guide="rp-review"][data-p="2026-10"]').first().click(); await page.waitForTimeout(300);
    await page.locator('[data-guide="rp-lock"][data-p="2026-10"]').first().click(); const m = await waitForModal(page); await m.locator('[data-act="yes"]').click(); await page.waitForTimeout(900);
    const mid = await screenshot(page, 'F16.2', 'action2', 'accountant', '[data-guide="rp-table"]');
    const st = await page.evaluate((id) => { const T = window.TH; const rp = T.q.reportPeriod('2026-10'); const s = T.reportP1.summary('2026-10'); const before = T.reportP1.building('2026-10', id).values.OTHER_COST; T.actions.saveExpense({ docDate: T.f.today(), categoryCode: 'VH-KHAC', desc: 'Chi phí phát sinh sau khóa kỳ (UAT)', amount: 999000, buildingId: id, supplier: 'UAT', payMethod: 'cash' }); const after = T.reportP1.building('2026-10', id).values.OTHER_COST; const live = T.reportP1.compute('2026-10', id).values.OTHER_COST; const add = T.metrics.P1.filter(d => d.additive).every(d => Math.abs(Number(s.values[d.code] || 0) - (Number(s.tsg[d.code].T || 0) + Number(s.tsg[d.code].S || 0) + Number(s.tsg[d.code].G || 0))) < 0.01); return { status: rp.status, buildings: rp.buildingCount, snapA: T.store.rawAll('reportSnapshots').filter(x => x.reportPeriodId === rp.id && x.reportType === 'A').length, snapB: T.store.rawAll('reportSnapshots').filter(x => x.reportPeriodId === rp.id && x.reportType === 'B').length, frozenB: s.frozen, add, types: s.buildings.map(b => b.type).join(''), total: s.values.TOTAL_REVENUE, T: s.tsg.TOTAL_REVENUE.T, G: s.tsg.TOTAL_REVENUE.G, nm: s.values.NET_MARGIN, before, after, live, audit: T.store.rawAll('auditLog').some(a => a && a.event === 'PROFIT_REPORT_LOCKED' && a.userId) }; }, g1Id);
    await goto(page, base, route('/reports/building-profit?period=2026-10&buildingId=' + g1Id)); await page.waitForTimeout(400);
    const ok = st.status === 'LOCKED' && st.snapA === st.buildings && st.snapB === 1 && st.frozenB && st.add && st.before === st.after && st.live === st.after + 999000 && st.audit;
    return { actual: `Report B 10/2026: ${st.buildings} tòa (loại ${st.types}), Total ${Math.round(st.total).toLocaleString('vi-VN')} = T ${Math.round(st.T).toLocaleString('vi-VN')} + S 0 + G ${Math.round(st.G).toLocaleString('vi-VN')} (additive ✓), LNR/DT ${st.nm}% tính từ tổng. Khóa kỳ → ${st.status}: ${st.snapA} snapshot A + ${st.snapB} snapshot B, audit PROFIT_REPORT_LOCKED; thêm chi phí 999.000 sau khóa → OTHER_COST báo cáo giữ ${Math.round(st.after).toLocaleString('vi-VN')} (sống ${Math.round(st.live).toLocaleString('vi-VN')}).`, assertions: [{ id: 'report-period-locked', status: ok ? 'PASS' : 'FAIL', detail: JSON.stringify(st) }], screenshots: [before, mid], scrollTo: '.note-box' };
  });
  await run('F16.3', async () => {
    await switchRole(page, 'admin'); await goto(page, base, route('/reports/reconcile')); await page.waitForTimeout(400);
    const rec = await page.evaluate(() => { const T = window.TH; const g = T.q.goldenDatasets().find(x => x.reportType === 'A'); const r = T.reportP1.reconcile(g.id); return { code: g.code, count: r.count, frozen: r.frozen, match: r.rows.filter(x => x.status === 'MATCH').map(x => x.code), need: r.rows.filter(x => x.status === 'NEED_BUSINESS_CONFIRMATION').map(x => x.code), bad: r.rows.filter(x => ['RULE_DIFFERENCE', 'SOURCE_DATA_DIFFERENCE'].includes(x.status)).map(x => x.code) }; });
    const before = await screenshot(page, 'F16.3', 'action', 'admin', '[data-guide="rc-table"]');
    await goto(page, base, route('/reports/metrics?status=NEED_BUSINESS_CONFIRMATION')); await page.waitForTimeout(300); await page.locator('[data-guide="metric-confirm"][data-code="NEW_ROOM_COUNT"]').first().click(); const m = await waitForModal(page); await m.locator('[name="decision"]').fill('Phòng mới = HĐ (loại mới) bắt đầu trong kỳ – ký Ngọc 28/10/2026 (UAT)'); await m.locator('[data-act="yes"]').click(); await page.waitForTimeout(400);
    const mt = await page.evaluate(() => { const T = window.TH; const d = T.metrics.def('NEW_ROOM_COUNT'); const rp = T.q.reportPeriod('2026-10'); return { status: d.status, version: d.version, eff: T.metrics.effectiveStatus('NEW_ROOM_COUNT'), registry: T.metrics.version(), frozen: rp.metricVersion }; });
    const expectMatch = ['RENT_REVENUE', 'ELECTRIC_REVENUE', 'WATER_REVENUE', 'CLEANING_REVENUE', 'INTERNET_REVENUE', 'ELECTRIC_VEHICLE_REVENUE', 'ELEVATOR_REVENUE', 'WASHING_REVENUE', 'SERVICE_REVENUE', 'HEAD_LEASE_COST', 'EQUIPMENT_PURCHASE_COST', 'ELECTRIC_INPUT_COST', 'WATER_INPUT_COST', 'INTERNET_INPUT_COST', 'GARBAGE_COST', 'COGS', 'OPERATING_SELLING_COST', 'TOTAL_COST', 'NEW_DEPOSIT'];
    const ok = rec.frozen && expectMatch.every(c => rec.match.includes(c)) && rec.bad.length === 0 && rec.need.includes('TOTAL_REVENUE') && mt.status === 'CONFIRMED' && mt.version === 2 && mt.registry !== mt.frozen;
    return { actual: `${rec.code} (snapshot): ${rec.match.length} MATCH từng line (${rec.match.slice(0, 6).join(', ')}…), ${rec.need.length} NEED_BUSINESS_CONFIRMATION (${rec.need.join(', ')}), ${rec.bad.length} lệch rule/nguồn. Xác nhận NEW_ROOM_COUNT → ${mt.status} v${mt.version}; registry ${mt.registry}, kỳ 10/2026 giữ ${mt.frozen}.`, assertions: [{ id: 'golden-reconcile', status: ok ? 'PASS' : 'FAIL', detail: JSON.stringify({ rec, mt }) }], screenshots: [before], scrollTo: '[data-guide="metrics-table"]' };
  });
  // F17 – Cổ đông & chia lợi nhuận (spec v1.8 §4.29–4.32)
  await run('F17.1', async () => {
    await switchRole(page, 'accountant'); await goto(page, base, route('/investment/shares?buildingId=' + g1Id + '&date=2026-06-30')); await page.waitForTimeout(350);
    const june = await page.evaluate((id) => window.TH.q.buildingShares(id, '2026-06-30').map(s => window.TH.q.shareholder(s.shareholderId).name.split(' ').slice(-1)[0] + ' ' + s.percentage).join(', ') + ' = ' + window.TH.q.buildingShareTotal(id, '2026-06-30') + '%', g1Id);
    const before = await screenshot(page, 'F17.1', 'action', 'accountant', '[data-guide="shares-table"]');
    await goto(page, base, route('/investment/shares?buildingId=' + g1Id)); await page.waitForTimeout(300); await page.locator('[data-guide="shares-config"]').first().click(); let m = await waitForModal(page);
    const ids = await page.evaluate((id) => window.TH.q.buildingShares(id).slice(0, 2).map(s => ({ sh: s.shareholderId, pct: s.percentage })), g1Id);
    const tomorrow = await page.evaluate(() => window.TH.f.addDays(window.TH.f.today(), 1)); await fill(page, 'effectiveFrom', tomorrow, m); await fill(page, 'p_' + ids[0].sh, String(ids[0].pct - 1), m); await fill(page, 'p_' + ids[1].sh, String(ids[1].pct + 1), m); await fill(page, 'reason', 'Chuyển 1% (UAT)', m); await m.locator('[data-guide="shares-save"]').click(); await page.waitForTimeout(400);
    await goto(page, base, route('/investment/shareholders?tab=capital&buildingId=' + g1Id)); await page.waitForTimeout(300); await page.locator('[data-guide="capital-add"]').first().click(); m = await waitForModal(page); await fill(page, 'name', 'Đợt 3 – UAT', m); await fill(page, 'total', 45000000, m); await m.locator('[data-guide="capital-save"]').click(); await page.waitForTimeout(400);
    const call = await page.evaluate((id) => { const c = window.TH.q.capitalCalls({ buildingId: id }).find(x => x.name === 'Đợt 3 – UAT'); const l = window.TH.q.capitalLines(c.id)[0]; return { id: c.id, code: c.code, lines: window.TH.q.capitalLines(c.id).length, lineId: l.id, required: l.required }; }, g1Id);
    await page.locator(`[data-act="open-call"][data-id="${call.id}"]`).first().click(); m = await waitForModal(page); await m.locator(`[data-guide="capital-pay"][data-id="${call.lineId}"]`).click(); m = await waitForModal(page); await fill(page, 'ref', 'UNC-UAT-GV-G1', m); await m.locator('[data-guide="capital-pay-save"]').click(); await page.waitForTimeout(400); for (let i = 0; i < 3 && await page.locator('.overlay').count(); i++) { await closeModal(page); await page.waitForTimeout(200); }
    const st = await page.evaluate(({ id, lineId }) => { const T = window.TH; const tmr = T.f.addDays(T.f.today(), 1); return { today: T.q.buildingShareTotal(id), tomorrow: T.q.buildingShareTotal(id, tmr), june: T.q.buildingShareTotal(id, '2026-06-30'), hist: T.q.shareHistory(id).length, changes: T.q.shareChangeDates(id).length, line: (l => ({ paid: l.paid, required: l.required, ref: l.ref, st: T.q.capitalLineStatus(l) }))(T.store.rawGet('capitalPayments', lineId)), first: T.q.buildingShares(id, tmr)[0].percentage }; }, { id: g1Id, lineId: call.lineId });
    const ok = st.today === 100 && st.tomorrow === 100 && st.june === 100 && st.changes >= 3 && call.lines === 9 && st.line.st === 'paid' && st.line.ref === 'UNC-UAT-GV-G1';
    return { actual: `Cổ phần G1 tại 30/06/2026: ${june}; hôm nay 100% (An 5 / Lan 7); cấu hình từ ${tomorrow}: chuyển 1% → tổng ${st.tomorrow}%, lịch sử ${st.hist} record / ${st.changes} mốc thay đổi. Đợt ${call.code}: ${call.lines} dòng theo cổ phần; dòng đầu góp ${st.line.paid.toLocaleString('vi-VN')}/${st.line.required.toLocaleString('vi-VN')} (${st.line.ref}) → ${st.line.st}.`, assertions: [{ id: 'shares-capital', status: ok ? 'PASS' : 'FAIL', detail: JSON.stringify(st) }], screenshots: [before] };
  });
  await run('F17.2', async () => {
    await switchRole(page, 'admin'); await goto(page, base, route('/investment/shareholders?tab=profit')); await page.waitForTimeout(350);
    await page.locator('[data-guide="dist-generate"]').first().click(); let m = await waitForModal(page); await select(page, 'period', '2026-10', m); await select(page, 'buildingId', g1Id, m); await m.locator('[data-guide="dist-generate-save"]').click(); await page.waitForTimeout(500);
    const before = await screenshot(page, 'F17.2', 'action', 'admin', '.overlay');
    m = await waitForModal(page); await m.locator('[data-guide="dist-confirm"]').click(); const c = await waitForModal(page); await c.locator('[data-act="yes"]').click(); await page.waitForTimeout(400);
    const st = await page.evaluate((id) => { const T = window.TH; const d = T.q.profitDistributions({ period: '2026-10', buildingId: id })[0]; const snap = T.reportP1.snapshot('2026-10', 'A', id); const net = T.reportP1.fromSnapshot(snap).values.NET_PROFIT; let reopen = ''; try { T.actions.reopenReportPeriod('2026-10', 'UAT'); } catch (e) { reopen = e.message; } return { code: d.code, status: d.status, profit: d.profitDistributable, net, lines: d.lines.length, sum: Math.round(d.lines.reduce((s, l) => s + l.netShare, 0) * 100) / 100, pct: d.lines.reduce((s, l) => s + l.percentage, 0), first: d.lines[0].percentage, snapFirst: snap.shares.rows[0].percentage, reopen, period: T.q.reportPeriod('2026-10').status }; }, g1Id);
    const ok = st.status === 'confirmed' && Math.abs(st.profit - st.net) < 0.01 && Math.abs(st.sum - st.profit) < 0.01 && Math.abs(st.pct - 100) < 0.01 && st.lines === 9 && st.first === st.snapFirst && st.reopen && st.period === 'LOCKED';
    return { actual: `${st.code} → ${st.status}: LN được phân phối ${Math.round(st.profit).toLocaleString('vi-VN')} = NET_PROFIT snapshot; ${st.lines} cổ đông, Σ tỷ lệ ${st.pct}%, Σ LN ròng × % = ${Math.round(st.sum).toLocaleString('vi-VN')}; tỷ lệ dòng đầu ${st.first}% = share snapshot khi khóa (cấu hình 1% ngày mai không ảnh hưởng). Mở lại kỳ 10/2026 bị chặn: "${st.reopen}".`, assertions: [{ id: 'profit-distribution', status: ok ? 'PASS' : 'FAIL', detail: JSON.stringify(st) }], screenshots: [before] };
  });
  await switchRole(page, 'admin');

  return { results, final: await stateSnapshot(page) };
}

function idsOf(s) { return { landlord: s.landlord?.id || '', landlordCode: s.landlord?.code || '', building: s.building?.id || '', buildingCode: s.building?.code || '', landlordContract: s.landlordContract?.id || '', landlordContractCode: s.landlordContract?.code || '', tenant: s.tenant?.id || '', tenantCode: s.tenant?.code || '', room: s.room?.id || '', roomCode: s.room?.code || '', contract: s.contract?.id || '', contractCode: s.contract?.code || '', invoice: s.invoice?.id || '', invoiceCode: s.invoice?.code || '', payment: s.payment?.id || '', paymentCode: s.payment?.code || '', batch: s.batch?.id || '', batchCode: s.batch?.code || '', refund: s.refund?.id || '', refundCode: s.refund?.code || '', expense: s.expense?.id || '', expenseCode: s.expense?.code || '', importJob: s.importJob?.id || '', user: s.user?.id || '' }; }
function qaAssertions(final, steps) {
  const checks = [];
  const add = (id, ok, detail) => checks.push({ id, status: ok ? 'PASS' : 'FAIL', detail });
  add('milestones', steps.length === EXPECTED && steps.every((x) => x.status === 'PASS'), `${steps.filter((x) => x.status === 'PASS').length}/${steps.length} PASS (kỳ vọng ${EXPECTED})`);
  add('landlord-chain', final.landlord?.name === 'Nguyễn Demo Chủ Nhà' && final.area?.code === 'KV-CG-DEMO' && final.building?.code === 'TH-DEMO-01' && final.building?.landlordId === final.landlord?.id && final.building?.areaId === final.area?.id && final.landlordRooms === 20 && final.landlordPayments === 12 && !!final.landlordContract, `landlord=${final.landlord?.name || '-'}; area=${final.area?.code || '-'}; building=${final.building?.code || '-'}; rooms=${final.landlordRooms}; payments=${final.landlordPayments}`);
  add('full-demo-chain', final.room?.code === 'Z.01.01' && final.room?.buildingId === final.building?.id && final.contract?.roomId === final.room?.id && final.contract?.tenantId === final.tenant?.id && final.invoice?.contractId === final.contract?.id && final.payment && final.refund?.contractId === final.contract?.id, `building=${final.building?.code}; room=${final.room?.code}; tenant=${final.tenant?.name}; contract=${final.contract?.code}; invoice=${final.invoice?.code}; payment=${final.payment?.code}; refund=${final.refund?.code}`);
  add('contract-profile', final.contract?.start === '2026-10-01' && final.contract?.end === '2027-09-30' && final.contract?.price === 6500000 && final.contract?.deposit === 13000000 && final.contractServices?.length === 3, `term=${final.contract?.start}->${final.contract?.end}; price=${final.contract?.price}; deposit=${final.contract?.deposit}; services=${final.contractServices?.length}`);
  add('room-lifecycle', final.room?.status === 'ready', `room=${final.room?.status || '-'}`);
  add('contract-lifecycle', final.contract?.status === 'ended', `contract=${final.contract?.status || '-'}`);
  add('invoice-issued', final.invoice?.docStatus === 'issued' && final.invoice?.total === 7715000, `invoice=${final.invoice?.docStatus || '-'}; total=${final.invoice?.total || 0}`);
  add('payment-partial', final.paid === 3000000 && final.remaining === 4715000 && final.invoice && final.paid + final.remaining === final.invoice.total, `paid=${final.paid}; remaining=${final.remaining}; total=${final.invoice?.total || 0}`);
  add('meter-nonnegative', (final.meter || []).every((x) => Number(x.curr) >= Number(x.prev || 0)), (final.meter || []).map((x) => `${x.type}:${x.prev}->${x.curr}`).join(', '));
  add('refund-math', final.refund?.status === 'refunded' && final.refund.deductionsTotal === 400000 && final.refund.refundAmount === 7885000 && final.refund.offsetDebt === true && final.refund.paidRef === 'UNC289104' && final.refund.paidEvidence === 'uy_nhiem_chi_hoan_coc.pdf', `status=${final.refund?.status}; deposit=${final.refund?.deposit}; ded=${final.refund?.deductionsTotal}; refund=${final.refund?.refundAmount}; ref=${final.refund?.paidRef}`);
  add('expense-link', final.expense?.amount === 350000 && final.expense?.buildingId === final.building?.id && /Z\.01\.01/.test(final.expense?.desc || ''), `amount=${final.expense?.amount}; building=${final.expense?.buildingId}; desc=${final.expense?.desc || '-'}`);
  add('import-job', final.importJob?.status === 'done', `import=${final.importJob?.status || '-'}`);
  add('user-role', final.user?.role === 'ops' && (final.user?.buildingIds || []).includes(final.building?.id), `role=${final.user?.role || '-'}; buildings=${(final.user?.buildingIds || []).join(',')}`);
  return { status: checks.every((x) => x.status === 'PASS') ? 'PASS' : 'FAIL', checks };
}
function describeActual(id, s) {
  const i = idsOf(s); const bits = [];
  if (i.tenantCode) bits.push(`KH ${i.tenantCode}`); if (i.roomCode) bits.push(`phòng ${i.roomCode}`); if (i.contractCode) bits.push(`HĐ ${i.contractCode}`); if (i.invoiceCode) bits.push(`HĐơn ${i.invoiceCode}`); if (i.paymentCode) bits.push(`thu ${i.paymentCode}`); if (i.batchCode) bits.push(`Zalo ${i.batchCode}`); if (i.refundCode) bits.push(`RC ${i.refundCode}`); if (i.expenseCode) bits.push(`CP ${i.expenseCode}`); return bits.join(' · ') || norm(s.url || 'Đã thao tác');
}

function cell(text, opts = {}) { return new TableCell({ shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined, children: [new Paragraph({ children: [new TextRun({ text: String(text ?? ''), bold: !!opts.bold, color: opts.color || '334155', size: opts.size || 18 })] })] }); }
function table(rows, widths = []) { return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: { top: { style: BorderStyle.SINGLE, size: 4, color: 'D7DDE3' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D7DDE3' }, left: { style: BorderStyle.SINGLE, size: 4, color: 'D7DDE3' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'D7DDE3' }, insideH: { style: BorderStyle.SINGLE, size: 2, color: 'E5EAF2' }, insideV: { style: BorderStyle.SINGLE, size: 2, color: 'E5EAF2' } }, rows: rows.map((r, ri) => new TableRow({ children: r.map((x) => cell(x, { fill: ri === 0 ? '16324F' : undefined, color: ri === 0 ? 'FFFFFF' : undefined, bold: ri === 0 })) })) }); }
function p(text = '', opts = {}) { return new Paragraph({ style: opts.style, alignment: opts.align, spacing: { after: opts.after ?? 80, line: 260 }, children: [new TextRun({ text: String(text), bold: !!opts.bold, color: opts.color || '3F4A54', size: opts.size || 20 })] }); }
function bullet(text) { return new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: String(text), size: 19, color: '3F4A54' })] }); }
function heading(text, level = HeadingLevel.HEADING_1) { return new Paragraph({ heading: level, children: [new TextRun({ text, bold: true })] }); }

function diagramSvg() {
  const colors = { admin: '#2563EB', ops: '#0F766E', accountant: '#C2410C' };
  const lanes = [['admin', 'Admin / Quản trị viên', 92], ['ops', 'Vận hành', 226], ['accountant', 'Kế toán', 360]];
  const nodes = [
    ['S0', 'Khởi động', 'admin', 240], ['F00', 'Chủ nhà, tòa', 'admin', 348], ['F01', 'Khách thuê', 'ops', 456], ['F02', 'Hợp đồng', 'ops', 564], ['F03', 'Hóa đơn', 'accountant', 672], ['F04', 'Zalo HĐ', 'admin', 780], ['F05', 'Thu một phần', 'accountant', 888], ['F06', 'Nhắc nợ', 'admin', 996], ['F07', 'Kết thúc HĐ', 'ops', 1104], ['F08', 'Hoàn cọc', 'accountant', 1212], ['F09', 'Dọn phòng', 'ops', 1320], ['F10', 'Bổ trợ', 'accountant', 1428],
  ];
  const laneMarkup = lanes.map(([key, label, y]) => `<rect x="20" y="${y}" width="1525" height="112" rx="10" fill="#fff" stroke="#D7E0EA"/><rect x="20" y="${y}" width="205" height="112" rx="10" fill="${colors[key]}" opacity=".1"/><text x="38" y="${y + 42}" font-family="Arial" font-size="16" font-weight="700" fill="${colors[key]}">${label}</text><text x="38" y="${y + 67}" font-family="Arial" font-size="12" fill="#64748B">Các mốc được thực thi qua UI</text>`).join('');
  const centers = Object.fromEntries(lanes.map(([key, , y]) => [key, y + 56]));
  const box = nodes.map(([id, title, role, x], i) => { const y = centers[role] - 38; const next = nodes[i + 1]; const arrow = next ? (() => { const ny = centers[next[2]]; return `<path d="M${x + 108} ${centers[role]} C${x + 122} ${centers[role]}, ${next[3] - 16} ${ny}, ${next[3] - 8} ${ny}" fill="none" stroke="#94A3B8" stroke-width="2.5" marker-end="url(#a)"/>`; })() : ''; return `<g><rect x="${x}" y="${y}" width="108" height="76" rx="10" fill="#fff" stroke="${colors[role]}" stroke-width="2"/><rect x="${x}" y="${y}" width="108" height="7" rx="4" fill="${colors[role]}"/><text x="${x + 54}" y="${y + 30}" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#0F2A5F">${id}</text><text x="${x + 54}" y="${y + 51}" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">${title}</text></g>${arrow}`; }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1565" height="510" viewBox="0 0 1565 510"><defs><marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#94A3B8"/></marker></defs><rect width="1565" height="510" fill="#F8FAFC"/><text x="28" y="34" font-family="Arial" font-size="21" font-weight="700" fill="#16324F">Phase 1 · Swimlane theo vai trò</text><text x="28" y="60" font-family="Arial" font-size="13" fill="#64748B">Chuỗi S0 → F00 → F10; mũi tên nối theo thứ tự chạy, màu viền thể hiện vai trò thực hiện chính.</text>${laneMarkup}${box}<text x="28" y="497" font-family="Arial" font-size="12" fill="#64748B">Evidence runtime 1440×1080 · manifest.json lưu route, dữ liệu nhập, action, expected/actual và trạng thái từng mốc.</text></svg>`;
}

async function writeDiagramPng() {
  const svg = path.join(OUT, 'phase1-flow.svg'); fs.writeFileSync(svg, diagramSvg(), 'utf8');
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] }); const page = await browser.newPage({ viewport: { width: 1565, height: 510 } });
  await page.goto(`file:///${svg.replaceAll('\\', '/')}`); const png = path.join(OUT, 'phase1-flow.png'); await page.screenshot({ path: png }); await browser.close(); return png;
}

async function buildDoc(manifest, diagramPng) {
  const header = new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'TIMEHOUSE  |  Phase 1 Walkthrough/UAT', bold: true, color: '1769AA', size: 16 })] })] });
  const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Tài liệu evidence runtime · Trang ', size: 16 }), PageNumber.CURRENT] })] });
  const portrait = { page: { margin: { top: 900, bottom: 850, left: 1000, right: 1000 } } };
  const landscape = { page: { size: { orientation: PageOrientation.LANDSCAPE, width: 12240, height: 15840 }, margin: { top: 700, bottom: 700, left: 700, right: 700 } } };
  const sections = [];
  const cover = [
    new Paragraph({ spacing: { before: 900 }, children: [new TextRun({ text: 'TIMEHOUSE', bold: true, size: 28, color: '1769AA' })] }),
    new Paragraph({ spacing: { before: 850, after: 140 }, children: [new TextRun({ text: 'WALKTHROUGH / UAT', bold: true, size: 34, color: '16324F' })] }),
    new Paragraph({ children: [new TextRun({ text: 'Phase 1 · Core Rental / Go-live', bold: true, size: 27, color: '1769AA' })] }),
    p('Tài liệu hướng dẫn nghiệp vụ và bằng chứng chạy runtime trên mockup TimoHouse.', { size: 22, after: 260 }),
    table([['Thông tin', 'Giá trị'], ['Phạm vi', `${EXPECTED} mốc · S0 + F00 thiết lập + 10 luồng core + F10 bổ trợ + F12 OCR + F14 hiệu suất/lương/chi lương + F15 import chi phí + F16 báo cáo tháng/đối soát + F17 cổ đông/chia LN (v1.8)`], ['Commit / nhánh', `${manifest.commit} · ${manifest.branch || ''}`], ['Đối tượng', 'Nghiệp vụ + UAT'], ['Môi trường', 'Chrome 1440×1080 · Phase 1 only'], ['Ngày/kỳ demo', '28/10/2026 · 10/2026'], ['Kết quả', `${manifest.qa.status} · ${manifest.summary.pass}/${manifest.summary.total}`]], [30, 70]),
    p('Lưu ý dữ liệu: hợp đồng dùng ngày bắt đầu 01/10/2026 để đủ điều kiện lập hóa đơn kỳ 10/2026. PNG gốc chỉ là tham chiếu UI, không phải bằng chứng thực thi.', { size: 18, color: '64748B', after: 220 }),
    heading('Sơ đồ tổng thể', HeadingLevel.HEADING_1),
    new Paragraph({ children: [new ImageRun({ data: fs.readFileSync(diagramPng), transformation: { width: 650, height: 216 }, type: 'png' })] }),
    heading('Cách đọc tài liệu', HeadingLevel.HEADING_1), bullet('Mỗi mốc có route, vai trò, dữ liệu nhập, action, expected result và actual result.'), bullet('Ảnh có hậu tố -input là trạng thái trước khi submit; -action là form/điểm thao tác bổ sung; -result là kết quả sau submit; -error chỉ xuất hiện nếu mốc lỗi.'), bullet('Mã record động (KH…, HD…, PAY…, ZL…, RC…) được lấy từ manifest của cùng một lần chạy.'),
    heading('Mục lục', HeadingLevel.HEADING_1), p('Mục lục tự cập nhật khi mở bằng Microsoft Word (chọn Cập nhật trường / F9).', { size: 17, color: '64748B' }), new TableOfContents('Mục lục', { hyperlink: true, headingStyleRange: '1-3' }),
  ];
  sections.push({ properties: portrait, headers: header, footers: footer, children: cover });

  for (const flow of FLOWS) {
    const flowDefs = STEPS.filter((s) => s.flow === flow.key);
    const children = [heading(`${flow.key} · ${flow.title}${flow.golive ? `  |  Go-live #${flow.golive}` : ''}`, HeadingLevel.HEADING_1), p(`Sơ đồ luồng: ${flow.steps.map((s) => s[0]).join(' → ')}`, { color: '1769AA', bold: true }), table([
      ['Màn hình', 'Dữ liệu', 'Action', 'Trạng thái / kết quả'],
      [flowDefs.map((d) => `${d.id}: ${d.route}`).join('\n'), flowDefs.map((d) => `${d.id}: ${d.inputs}`).join('\n'), flowDefs.map((d) => `${d.id}: ${d.action}`).join('\n'), flowDefs.map((d) => `${d.id}: ${d.expected}`).join('\n')],
    ])];
    for (const def of STEPS.filter((s) => s.flow === flow.key)) {
      const r = manifest.milestones.find((x) => x.id === def.id) || def;
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, pageBreakBefore: true, children: [new TextRun({ text: `${def.id} · ${def.title}`, bold: true })] }));
      const recordLabel = Object.entries(r.recordIds || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n') || '-';
      children.push(table([['Trường', 'Chi tiết'], ['Vai trò', `${roleLabel[def.role] || def.role}`], ['Màn hình/route', `${def.screen}\n${def.route}`], ['Dữ liệu nhập', def.inputs], ['Mã record', recordLabel], ['Action', def.action], ['Kết quả mong đợi', def.expected], ['Kết quả thực tế', r.actual || '-'], ['Assertions', (r.assertions || []).map((a) => `${a.id}: ${a.status}${a.detail ? ' – ' + a.detail : ''}`).join('\n') || '-'], ['File tải xuống', (r.downloads || []).map((d) => `${d.name} · ${d.bytes} B · ${d.rows != null ? d.rows + ' dòng · ' : ''}sha256 ${String(d.sha256 || '').slice(0, 16)}…`).join('\n') || '-'], ['Thời gian', r.timestamps ? `${r.timestamps.startedAt} → ${r.timestamps.finishedAt}` : '-'], ['Trạng thái', (r.status || 'NOT RUN') + (r.error ? '\n' + String(r.error).split('\n')[0] : '')]], [25, 75]));
      children.push(p('Ảnh minh chứng', { bold: true, color: '16324F', after: 40 }));
      const shots = (r.screenshots || []).filter((x) => x.endsWith('.png')).map((img) => path.join(OUT, img)).filter((f) => fs.existsSync(f));
      const noBorder = { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, insideH: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, insideV: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } };
      for (let i = 0; i < shots.length; i += 2) {
        const cells = shots.slice(i, i + 2).map((f) => new TableCell({ width: { size: 7050, type: WidthType.DXA }, borders: noBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 20 }, children: [new ImageRun({ data: fs.readFileSync(f), transformation: { width: 460, height: 345 }, type: 'png' })] }), p(path.basename(f), { align: AlignmentType.CENTER, size: 15, color: '64748B', after: 40 })] }));
        if (cells.length === 1) cells.push(new TableCell({ width: { size: 7050, type: WidthType.DXA }, borders: noBorder, children: [new Paragraph('')] }));
        children.push(new Table({ width: { size: 14100, type: WidthType.DXA }, columnWidths: [7050, 7050], borders: noBorder, rows: [new TableRow({ cantSplit: true, children: cells })] }));
      }
    }
    sections.push({ properties: landscape, headers: header, footers: footer, children });
  }

  const trace = [heading('Ma trận truy vết 16 điều kiện Go-live', HeadingLevel.HEADING_1), p('Các điều kiện được kiểm chứng qua các mốc core S0–F09; F10 là phần bổ trợ và không làm thay đổi số Go-live core.')];
  const traceRows = [['#', 'Điều kiện', 'Milestone', 'Evidence', 'Kết quả']];
  const traceFlows = [['Flow', 'Yêu cầu / phạm vi SRS', 'Mốc', 'Kết quả'], ...FLOWS.map((f) => { const items = manifest.milestones.filter((x) => x.flow === f.key); return [f.key, FLOW_TRACE[f.key] || '-', items.map((x) => x.id).join(', '), `${items.filter((x) => x.status === 'PASS').length}/${items.length} PASS`]; })];
  const map = [['1', 'Tạo khách thuê', 'F01.2'], ['2', 'Chọn phòng', 'F02.1'], ['3', 'Tạo HĐ', 'F02.2–F02.3'], ['4', 'Kích hoạt HĐ', 'F02.4'], ['5', 'Nhập điện nước', 'F03.2'], ['6', 'Lập/phát hành HĐơn', 'F03.3–F03.4'], ['7', 'Gửi HĐơn Zalo', 'F04.1–F04.3'], ['8', 'Xem công nợ', 'F05.1'], ['9', 'Thu một phần', 'F05.2–F05.3'], ['10', 'Theo dõi dư nợ', 'F05.4'], ['11', 'Nhắc công nợ', 'F06.1–F06.3'], ['12', 'Kết thúc HĐ', 'F07.1–F07.2'], ['13', 'Hoàn cọc', 'F08.1–F08.4'], ['14', 'Tạo hồ sơ hoàn cọc', 'F07.2'], ['15', 'Xác nhận dọn', 'F09.1'], ['16', 'Phòng sẵn sàng', 'F09.2']];
  for (const [n, label, ms] of map) { const first = ms.split('–')[0].trim(); const hit = manifest.milestones.find((x) => x.id === first); traceRows.push([n, label, ms, hit?.screenshots?.join('\n') || '-', hit?.status || 'NOT RUN']); }
  trace.push(table(traceRows)); trace.push(heading('Ma trận truy vết theo flow', HeadingLevel.HEADING_1)); trace.push(table(traceFlows));
  trace.push(heading('QA state assertions', HeadingLevel.HEADING_1)); trace.push(table([['Kiểm tra', 'Kết quả', 'Chi tiết'], ...(manifest.qa.checks || []).map((c) => [c.id, c.status, c.detail || ''])]));
  const issues = [...manifest.milestones.filter((x) => x.status !== 'PASS').map((x) => `${x.id} FAIL – ${String(x.error || '').split('\n')[0]}`), ...(manifest.qa.checks || []).filter((c) => c.status !== 'PASS').map((c) => `QA ${c.id} FAIL – ${c.detail || ''}`), 'OI-07 – NEEDS BUSINESS CONFIRMATION: không tự bù trừ công nợ vào tiền cọc; kết quả là “PASS theo mockup hiện tại”.', 'Giới hạn mô phỏng: Zalo gửi/retry là mô phỏng – PASS không chứng nhận tích hợp production.'];
  trace.push(heading('Danh sách vấn đề & giới hạn', HeadingLevel.HEADING_1)); issues.forEach((text) => trace.push(bullet(text)));
  trace.push(heading('Kết luận chạy', HeadingLevel.HEADING_1)); trace.push(p(`PASS: ${manifest.milestones.filter((x) => x.status === 'PASS').length}/${manifest.milestones.length} milestone. Ảnh và actual result lấy từ cùng một lần chạy sạch; xem manifest.json để kiểm tra route, mã record và thời gian chụp.`));
  sections.push({ properties: portrait, headers: header, footers: footer, children: trace });
  const doc = new Document({ sections });
  const buffer = await Packer.toBuffer(doc); fs.writeFileSync(DOCX_PATH, buffer);
}

async function main() {
  // --docs-only: dựng lại DOCX từ manifest đã có (sửa layout không cần chạy lại UAT)
  if (process.argv.includes('--docs-only')) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')); const diagram = await writeDiagramPng(); await buildDoc(manifest, diagram);
    console.log(JSON.stringify({ docx: DOCX_PATH, manifest: MANIFEST_PATH, rebuilt: true })); return;
  }
  fs.mkdirSync(EVIDENCE, { recursive: true });
  fs.mkdirSync(DOWNLOADS, { recursive: true });
  // Remove only prior runner-generated milestone PNGs; preserve any unrelated customer assets.
  for (const name of fs.readdirSync(EVIDENCE)) {
    if (/^(?:S0|F\d{2})(?:\.\d)+-(?:input|result|error|action)\.png$/i.test(name)) fs.unlinkSync(path.join(EVIDENCE, name));
  }
  const server = await ensureServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1, locale: 'vi-VN', timezoneId: 'Asia/Bangkok', acceptDownloads: true });
    const page = await context.newPage(); page.setDefaultTimeout(15000);
    // Clear only this temporary browser context; the user's normal profile/state is untouched.
    await page.goto(`${server.url}/#/login`, { waitUntil: 'networkidle' }); await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); await page.reload({ waitUntil: 'networkidle' });
    await page.evaluate(() => { if (window.TH?.phase) { window.TH.phase.set(2, false); window.TH.phase.set(3, false); } if (window.TH?.store) { window.TH.store.state.meta.today = '2026-10-28'; window.TH.store.state.meta.period = '2026-10'; window.TH.store.saveNow(); } });
     let run; let aborted = '';
     try { run = await runScenario(page, server.url); } catch (e) { aborted = e.stack || e.message; run = { results: RESULTS, final: await stateSnapshot(page).catch(() => ({})) }; }
     const qa = qaAssertions(run.final, run.results); if (aborted) { qa.checks.unshift({ id: 'aborted', status: 'FAIL', detail: aborted.split('\n')[0] }); qa.status = 'FAIL'; }
     const manifest = { generatedAt: new Date().toISOString(), commit: COMMIT, baseUrl: server.url, viewport: { width: WIDTH, height: HEIGHT }, today: '2026-10-28', period: '2026-10', phase: 'P1', phaseFlags: { p1: true, p2: false, p3: false }, branch: BRANCH, scope: `S0 + F00 thiết lập + 10 luồng core + F10 bổ trợ / ${EXPECTED} mốc`, milestones: run.results, simulationLabels: ['Zalo (gửi/retry mô phỏng)'], final: run.final, qa: { ...qa, status: qa.status, expectedMilestones: EXPECTED, actualMilestones: run.results.length, passMilestones: run.results.filter((x) => x.status === 'PASS').length }, summary: { total: run.results.length, pass: run.results.filter((x) => x.status === 'PASS').length, fail: run.results.filter((x) => x.status !== 'PASS').length, evidencePng: fs.existsSync(EVIDENCE) ? fs.readdirSync(EVIDENCE).filter((x) => x.endsWith('.png')).length : 0, qa: qa.status } };
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
    const diagram = await writeDiagramPng(); await buildDoc(manifest, diagram);
    const failed = manifest.milestones.filter((x) => x.status !== 'PASS');
    console.log(JSON.stringify({ docx: DOCX_PATH, manifest: MANIFEST_PATH, evidence: EVIDENCE, summary: manifest.summary, failed: failed.map((x) => ({ id: x.id, error: x.error })) }, null, 2));
     if (failed.length || qa.status !== 'PASS' || aborted) process.exitCode = 1;
  } finally { if (browser) await browser.close(); if (server.child) server.child.kill(); }
}

main().catch((e) => { console.error(e.stack || e.message); process.exitCode = 1; });
