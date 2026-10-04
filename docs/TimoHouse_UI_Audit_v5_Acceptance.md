# Biên bản nghiệm thu UI Audit v5 — mockup local

Ngày nghiệm thu: **04/10/2026**  
Phạm vi: mã nguồn và mockup chạy tại workspace local. Biên bản này **không xác nhận** bản Netlify/live đã được triển khai cùng phiên bản.

## Kết quả đóng gap

| Nhóm | Kết quả | Evidence / kiểm tra chính |
|---|---|---|
| Báo cáo Tổng và Kinh doanh | Đạt | Preview, download và test dùng chung `xlsReportXml`; đọc ngược SpreadsheetML để so dòng 3–61, TỔNG/T/S/G, metadata, kiểu ô, style, freeze pane và độ rộng cột |
| Snapshot báo cáo | Đạt | Kỳ khóa xuất từ snapshot và `policySnapshot`; thay đổi tham số sau khóa không làm đổi output lịch sử |
| Hóa đơn | Đạt | Tài khoản nhận tiền có phiên hiệu lực; hóa đơn phát hành đóng băng `printSnapshot`; hóa đơn nháp được đổi template theo quyền |
| PDF hóa đơn | Đạt | 4 template `VP`, `VP-HẰNG`, `TECH`, `G1-TECH` × mẫu 12/13 dòng; đúng snapshot tài khoản, tổng tiền và A4 không cắt bảng/chữ ký |
| Hoàn cọc | Đạt | Fixture đủ công nợ, chỉ số cuối, khấu hao, sửa chữa, vệ sinh, sơn và dịch vụ khác; mỗi dòng có nguồn truy vết |
| Giải ngân bảng lương | Đạt | Chốt lương đóng băng nghĩa vụ; hỗ trợ nhiều lần chi, chặn vượt nghĩa vụ/kỳ khóa; reversal phục hồi số còn trả; không ghi trùng chi phí |
| Tài liệu và timeline | Đạt trong mockup | Dùng chung kho tài liệu cho owner payment, refund, share run, stay version và payroll disbursement; timeline hợp nhất có lọc quyền |
| Hoa hồng | Đạt | Chế độ `paidAt` dùng nội dung kỳ thực chi; nội dung OQ-13 chỉ hiện ở chế độ đề xuất |
| Aging/OCR | Đạt regression | Aging giữ đủ biên 30/31, 60/61, 90/91, 180/181 và che số tiền theo quyền; OCR Review → Apply/Commit tiếp tục qua regression hiện có |
| Accessibility/responsive | Đạt | Axe không có lỗi critical/serious trên route trọng yếu; kiểm tra skip-link, route focus, focus trap/return, keyboard sort, tabs, live region, error summary, reduced motion và target 24×24; viewport 375/768/1024/1440 không tràn toàn trang |

## Evidence output

Các file dưới đây được sinh lại bởi `npm run verify:v5-gaps` trong `output/ui-audit/latest/`:

- `report-total-2026-08.xls`
- `report-business-2026-08.xls`
- `invoice-VP-12.pdf`, `invoice-VP-13.pdf`
- `invoice-VP_HANG-12.pdf`, `invoice-VP_HANG-13.pdf`
- `invoice-TECH-12.pdf`, `invoice-TECH-13.pdf`
- `invoice-G1_TECH-12.pdf`, `invoice-G1_TECH-13.pdf`
- `refund-full-a4.pdf`
- `responsive-375.png`, `responsive-768.png`, `responsive-1024.png`, `responsive-1440.png`

Định dạng báo cáo chính thức tiếp tục là SpreadsheetML với đuôi `.xls` và MIME Excel XML; không chuyển sang `.xlsx`.

## Lệnh kiểm tra

- `npm run check`: **327/327 test**, **530 kiểm tra RBAC**, cú pháp 112 file JavaScript đạt.
- `npm run verify:v5-gaps`: **4/4 test nghiệp vụ v5** và **225 browser acceptance checks** đạt; sinh 2 XLS, 8 PDF hóa đơn và 1 PDF hoàn cọc.
- Bộ bắt buộc đã chạy đạt trong đợt triển khai: `smoke`, `sweep`, `verify:p0`, `verify:p1r`, `verify:p2`, `verify:p2:fixes`, `verify:p3`, `verify:intake:ui`.

## Giới hạn xác nhận

- Evidence xác nhận mockup local và output từ browser engine của bộ test.
- Chưa xác nhận deployment Netlify/live cho đến khi cùng commit được deploy và chạy lại smoke/acceptance trên URL live.
- Không sửa golden fixture hoặc snapshot kỳ khóa để làm kết quả khớp.
