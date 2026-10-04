# Ma trận nghiệm thu Source Workbook so với Live UI

Tài liệu này theo dõi các gap trong `TimoHouse_Source_Workbook_vs_Live_Analysis.md`. Workbook là chuẩn phạm vi giao diện; các công thức nghiệp vụ chưa được xác nhận vẫn giữ trạng thái đề xuất và không thay đổi số của kỳ đã khóa.

| Hạng mục | Route / màn hình | Dữ liệu và hành vi nghiệm thu | Kiểm tra | Trạng thái |
|---|---|---|---|---|
| Aging công nợ | `/debts` | Bucket 1–30, 31–60, 61–90, 91–180, 181+ dùng chung `debtBasis`; không lộ tiền ngoài quyền | `source-workbook-live.test.mjs`, regression P1 | Đã đóng, giữ regression |
| OCR và phiên giá | `/documents`, chi tiết lượt thuê | OCR apply và thay đổi giá tạo phiên bất biến; hóa đơn cũ tiếp tục dùng snapshot cũ | regression contract/rate hiện có | Đã đóng, giữ regression |
| Hoàn cọc | `/refunds` | Đủ khoản khấu trừ, lý do, chứng từ và truy vết; KPI/bảng/export dùng cùng bộ lọc | regression workbook/v5 | Đã đóng, giữ regression |
| Cổ đông | `/shareholders` | Phiên tỷ lệ, bảng kê khóa, chi thực, reversal và chênh làm tròn có audit | regression v5/P2 | Đã đóng, giữ regression |
| Pháp lý tòa nhà | `/buildings/:id?tab=phap-ly` | Hồ sơ ĐKKD, PCCC, sổ đỏ có số, trạng thái, hiệu lực, nguồn, tài liệu và lịch sử phiên | browser acceptance + unit mới | Đã triển khai |
| Phiên metadata hợp đồng chủ nhà | `/owners/:id` | Mỗi lần đổi metadata tạo snapshot; phiên cũ không bị sửa; xem được nguồn và lý do | browser acceptance + unit mới | Đã triển khai |
| Hồ sơ khách | `/customers`, chi tiết lượt thuê | Zalo, xe/biển số, tạm trú và fallback dữ liệu lịch sử | regression workbook-content | Đã đóng, giữ regression |
| Sales field-level | `/sales/deals` | KPI, bảng và CSV cùng dùng `Q.dealRows`; có quản lý hiệu lực, cọc, thanh toán, nguồn, sale, chia, hoa hồng và trạng thái | browser acceptance + unit mới | Đã triển khai |
| Báo cáo phân đoạn/đúng hạn | `/reports/summary`, `/reports/business` | Filter phạm vi dùng chung cho KPI, bảng, drill-down và export; số khóa đọc snapshot | regression P0/workbook | Đã đóng, giữ regression |
| Chính sách lương 5 bộ phận | `/payroll?tab=chinh-sach` | Vận hành, Kinh doanh, Kỹ thuật, Market, Tài chính có phiên hiệu lực, trạng thái, nguồn duyệt; bảng lương lưu snapshot chính sách | browser acceptance + unit mới | Đã triển khai |
| Sửa chữa/bảo dưỡng | `/maintenance` | Taxonomy, kỳ, chứng từ, dòng báo cáo và drill-down giữ liên kết | regression workbook/P2 | Đã đóng, giữ regression |
| Accessibility và responsive | Các route trọng yếu ở trên | Không có axe critical/serious; 375/768/1024/1440 không tràn ngang toàn trang; bảng tự cuộn trong container | `verify:source-workbook-live` và `verify:ui-audit` | Đã mở rộng nghiệm thu |

## Bằng chứng chạy tự động

- Unit/service: `npm run verify:source-workbook-live` chạy `tests/source-workbook-live.test.mjs`.
- Browser/output: cùng lệnh chạy `scripts/verify-source-workbook-live.mjs` và ghi bằng chứng vào `output/source-workbook-live/latest`.
- Full UI regression: `npm run verify:ui-audit` đã bao gồm kiểm tra source workbook/live.

Không thay golden fixture, hóa đơn đã phát hành, báo cáo hoặc snapshot kỳ khóa để làm kết quả khớp.
