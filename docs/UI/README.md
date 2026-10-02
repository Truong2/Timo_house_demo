# TimoHouse UI — Best Match Selection

Bộ này gom các ảnh UI tốt nhất đã được chọn từ các vòng generate/rà soát trong cuộc hội thoại, theo cấu trúc B01 → B09.

## Số lượng
- B01: 8 ảnh
- B02: 8 ảnh
- B03: 6 ảnh
- B04: 11 ảnh
- B05: 8 ảnh
- B06: 6 ảnh
- B07: 10 ảnh
- B08: 8 ảnh
- B09: 17 ảnh (UI-40/41, UI-03A, E30…E43)
- Tổng: 82 ảnh

## Cách đặt tên
- `UI-xx_*`: màn hình nghiệp vụ chính.
- `Exx_*`: state/modal/drawer bắt buộc theo plan.
- `UI-23A_*`: state bổ sung cho action ngừng hoạt động nhân sự.

## Ghi chú lựa chọn
- B01/B02: dùng các vòng final đã cập nhật sau rà soát.
- B03: dùng bản rerun cuối, riêng UI-21/E09 dùng bản patch sau khi khóa master Sale và Deal → E09.
- B04: dùng bộ tài chính đã đồng bộ invoice/receipt/timeline và có E14 trả trước 3 tháng.
- B05: dùng các bản shell/data đã sửa cuối; E17/UI-17/UI-18/E18/E19 lấy vòng sửa cuối.
- B06: dùng vòng rerun cuối với mã nhân viên đồng bộ, conflict phân công đã xử lý, payroll demo chưa xác nhận.
- B07: dùng vòng rerun mới nhất/best available. Đây là batch gần nhất với SRS hiện có, nhưng trong cuộc review trước vẫn còn ghi nhận cần audit consistency cuối cho UI-30↔E23 và UI-31→UI-32→UI-33.
- B08: dùng toàn bộ batch mới nhất gồm Tài liệu, Tài sản, Bảo dưỡng, Kiểm kê, Import, Cấu hình, E25 và E26.

Nguồn tham chiếu: `TimoHouse_Plan_Mockup_UI_v1.md`.

## Cập nhật Phase 3 — 02/10/2026

B07/UI-33 và B08/UI-34…36 đã thay bằng ảnh chụp web 1600×1000. B09 có 17 ảnh mới, danh mục đánh số đến E43. E27…E29 thuộc mở rộng leader/team của kế hoạch v1.1, chưa có ảnh riêng trong bộ này. Xem [bảng đối chiếu](Phase3_Doi_chieu_dac_ta_vs_anh_cu.md) và [UAT](../uat/Phase3_Kich_ban_kiem_thu.md); 8 ảnh responsive 390/1024 và F37 ở output/verify-p3/shots.
