# TimoHouse · ảnh chụp mockup đang chạy

Các PNG trong thư mục này được chụp trực tiếp từ SPA `mockup/` ở màn 1440 px, dùng profile trình duyệt mới và dữ liệu seed theo [TimoHouse Mockup Seed Data v1.0](../TimoHouse_Mockup_Seed_Data_v1.0.md). Chạy `npm run dev`, sau đó `node scripts/capture_mockup_gallery.mjs` để tạo lại. Ảnh là bằng chứng giao diện hiện tại; các dòng thiếu trong workbook vẫn để trống hoặc gắn cảnh báo nghiệp vụ.

| Ảnh | Màn hình | Nội dung đang chụp |
|---|---|---|
| [01 Tổng quan](01-dashboard-work-queue.png) | UI-01 | Dashboard kỳ 09/2026 |
| [02 Hồ sơ tòa](02-building-documents.png) | UI-04 | Tòa G1, tab tài liệu |
| [03 Trích xuất HĐ](03-contract-ocr-review.png) | UI-08 | OCR và đối chiếu |
| [04 Bảng giá](04-building-service-prices.png) | UI-09 | Tòa G1, tab dịch vụ |
| [05 Hóa đơn](05-invoice-collection.png) | UI-12 | Hóa đơn 201G1 · 09/2026 |
| [06 Khách thuê](06-tenant-lifecycle.png) | UI-06 | Khách phòng 201G1; tên được ẩn trong tài liệu seed |
| [07 Chi phí](07-expenses-import.png) | UI-24 | Sổ chi phí kỳ 09/2026 |
| [08 Chủ nhà](08-landlord-buildings-rooms.png) | UI-02 | Chủ nhà tòa G1 |
| [09 Bảng lương](09-payroll-collection-performance.png) | UI-23 | Bảng lương kỳ 09/2026 |
| [10 Report A](10-business-reports.png) | UI-29 | G1 kỳ đối soát 08/2026 |
| [11 Điện nước](11-room-meters.png) | UI-10 | 15 phòng G1 và 3 dòng điện chung nguồn |
| [12 Hoàn cọc](12-contract-end-refund.png) | UI-17 | Hồ sơ hoàn cọc nguồn |
| [13 Phân công tòa](13-building-assignments.png) | UI-20 | Phân công nhân sự |
| [14 Tài sản](14-assets-shareholders.png) | UI-27 | Tài sản tòa G1 |
| [15 Import jobs](15-settings-import-jobs.png) | UI-33 | Danh sách tác vụ nhập dữ liệu |
| [16 Wizard](16-landlord-head-lease-wizard.png) | UI-02 | Bước đầu onboarding chủ nhà |
| [17 Chỉ số phòng](17-invoice-electricity-carry-forward.png) | UI-05/10 | Phòng 201G1, tab điện nước |
| [18 Hoa hồng](18-commissions.png) | UI-26 | 13 dòng trích từ sheet hoa hồng 09/2026 |
| [19 Tiền thuê đầu vào](19-head-lease-costs.png) | UI-28 | G1: CF 48 triệu/tháng, AC và ngày trả chưa có trong nguồn |
| [20 Report B](20-business-summary.png) | UI-30 | Tổng T/S/G kỳ 08/2026 theo workbook nguồn |

Một ảnh chỉ hiển thị trạng thái đầu của màn hình tương ứng. Luồng nhập, duyệt và lỗi cần xem trên SPA tương tác; ảnh gallery không thay thế việc kiểm tra luồng.
