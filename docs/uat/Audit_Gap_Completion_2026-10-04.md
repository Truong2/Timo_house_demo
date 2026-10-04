# Nghiệm thu sửa 6 gap và 2 mục PARTIAL — 04/10/2026

Đợt sửa này thực hiện các quyết định người dùng xác nhận trong kế hoạch. Phạm vi là 8 mục trong audit sau commit `3d5b645`; không dùng kết quả này để tuyên bố mọi công thức chưa xác nhận trong workbook đã được nghiệm thu.

## Hành vi đã sửa

| Mục / căn cứ workbook | Kết quả và ca nghiệm thu |
|---|---|
| VEHICLE-BILLING — Thông tin khách hàng G7:G9 | Phiên xe theo lượt thuê, ngày hiệu lực và cuối kỳ. Hai xe × 100.000đ = 200.000đ. Danh sách xác nhận rỗng và số ghi đè 0 đều tính 0. Xe/biểu phí/chỉ số đổi làm nháp cần tính lại; phát hành bị chặn đến khi tính lại. Snapshot đã phát hành giữ nguyên. |
| FEE-SPLIT — Thông tin khách hàng G9 | `parking` và `charging` có đơn giá riêng trong biểu phí, intake/PDF/OCR/Excel và OCR lượt thuê đang có. Hai xe gửi × 100.000đ + một xe sạc × 50.000đ = 250.000đ. Dòng in 8 giữ hai thành phần và ghi chú. Không tính trùng `ev` cũ với phí mới. |
| EXP-FILTER — Tài chính chung I22 | Khu vực, vận hành, trưởng vùng cùng phạm vi tòa tại cuối kỳ; bảng/KPI/CSV dùng chung query. Quỹ chưa phân bổ không bị quy về nhân sự/khu vực. |
| SHARE-ASOF — TT CỔ ĐÔNG E2:F2/C5 | Cọc theo phiên hợp đồng tại Đến ngày; tài sản xét nhận/chuyển/thanh lý và khấu hao tại kỳ xem. Test cọc tăng 1.000.000đ từ tháng 10 và tài sản nhận tháng 10, kiểm tra riêng tháng 9/10. |
| SALE-REPORT-LEADER — BÁO CÁO E22 | Trưởng vùng vận hành tách với team sale; lượt xem/giao dịch/KPI/bản xuất dùng cùng phạm vi tòa và RBAC. |
| SALE-STT — KINH DOANH C37 | STT dùng chỉ số hàng sau sắp xếp, liên tục qua phân trang. |
| SALARY-MODE — NHÂN SỰ A5:A9 | 5 mode chọn công thức thật; HS chỉ vận hành, repair chỉ kỹ thuật. Ngày công phải xác nhận; tổng nhập tay có căn cứ, cho phép 0, không cộng lại phụ cấp. Thiếu đầu vào/chính sách thì chặn duyệt/chốt. Đổi nguồn làm phiên duyệt cần tính lại. |
| BUSINESS-REFUND — BÁO CÁO D6 | Mode `web` chính thức từ 10/2026: DT dòng tiền − cọc mới + hoàn cọc đã trừ; dòng cọc/hoàn cọc KD bằng 0; mua thiết bị thay bằng khấu hao đã xác nhận. Kỳ Excel và snapshot cũ giữ mode cũ. Khóa kỳ mới lưu mode, policy và khấu hao chính thức. |

## Tương thích

- Giữ schema, khóa localStorage và seed hash hiện có; migration policy chạy lặp an toàn và giữ overlay/file IndexedDB. Nạp lại store xóa cache index cũ trước khi dựng dữ liệu.
- Nguồn phí xe chung vẫn là `ev`; chuyển sang hai phí cần phiên giá mới có căn cứ. Reading demo tự sinh không ghi đè danh sách xe đã xác nhận; số ghi đè người dùng nhập vẫn ưu tiên, kể cả 0.
- Snapshot hóa đơn/lương/báo cáo đã chốt không tính lại từ hồ sơ hiện tại. Sửa số sau phát hành/khóa dùng luồng điều chỉnh có vết.
- Chủ nhà/tài sản thiếu ngày, giá trị hoặc chính sách xác nhận được ghi rõ thiếu dữ liệu; không tự lấy số hiện tại làm số lịch sử.

## Kiểm tra và bằng chứng

- `npm.cmd run check`: 350/350 unit/integration tests, 534 kiểm tra RBAC và 112 file JS qua kiểm tra cú pháp, gồm `tests/audit-gap-completion.test.mjs`.
- UI audit 225 checks; workbook 94 checks; field-level/source workbook 66 checks; verifier module và intake UI.
- Đọc thật PDF chủ nhà/khách thuê, OCR ảnh và Excel nguồn bằng `node scripts/verify-intake.mjs` (tự mở server, đóng sau kiểm tra).
- `npm.cmd run verify:audit-gaps`: 10 ca hành vi và audit browser local. Browser kiểm tra 54 màn/tab, 8 finding, lương nhập tay 0/8.000.000đ qua form, PDF phí xe, cùng responsive 375/768/1440px. Mỗi kích thước kiểm tra bảng biểu phí, màn hóa đơn và mở ba form xe/biểu phí/lương, lưu ảnh khi cuộn tới nút lưu. Danh sách xe xác nhận rỗng được kiểm tra cả lời nhắc trên hồ sơ và số xe tính phí. Kiểm tra query bổ sung cho kế toán/cổ đông/vận hành; gallery UI vẫn dùng admin.
- `npm.cmd run audit:live`: so sánh toàn bộ 112 JS với source, chạy cùng ca trên Netlify. Kết quả triển khai được lưu trong `output/audit-gap-completion-2026-10-04/live/audit.json`; SHA/builtAt trong file là bản đã kiểm tra.
- Evidence local ở `output/audit-gap-completion-2026-10-04/local/`; các log `output/audit-gap-*.log` ghi lần chạy cuối. Script trả lỗi nếu finding không PASS, có page error hoặc JS live không khớp source.

Audit trước sửa giữ tại `docs/TimoHouse_UI_Mockup_PostFix_Audit_vs_Workbook_2026-10-04.md` và `output/audit-post-fix-2026-10-04/`, là bằng chứng của bản cũ.

## Kết quả live và bản hoàn thiện hiển thị

Netlify triển khai commit `d196a72` lúc `2026-10-04T13:47:27.972Z`. Audit live cùng commit xác nhận 112/112 file JS khớp source, 8/8 mục PASS, không có lỗi JavaScript hoặc request ghi dữ liệu lên server. JSON, ảnh và PDF được lưu trong thư mục live nêu trên.

Sau lần này, bổ sung hiển thị số xe gửi/sạc theo phiên cuối kỳ ở bảng biểu phí và tổng quan lượt thuê. Audit local có thêm kiểm tra trực tiếp bảng biểu phí hiển thị 2 xe gửi / 1 xe sạc, trước khi đối chiếu hóa đơn 250.000đ. Bản bổ sung được audit live lại sau push; dùng `AUDIT_OUTPUT_DIR=tmp/audit-final-live` để không tạo vòng lặp commit bằng chứng rồi đổi SHA.

Audit live commit `70729fa` tiếp tục đạt 8/8 mục, 112/112 JS khớp source. Bản hoàn thiện kế tiếp ghi rõ phiên danh sách xe đang xem, từng dịch vụ xe và trạng thái đã xác nhận 0 xe; mở rộng kiểm tra responsive sang ba form nêu trên. Bằng chứng live cuối ở `tmp/audit-final-live/audit.json` ghi SHA triển khai thực tế.

Các hồ sơ lịch sử thiếu ngày nhận/chuyển/thanh lý, phiên hợp đồng hoặc chính sách khấu hao đã xác nhận vẫn cần bổ sung căn cứ. UI giữ trạng thái thiếu dữ liệu; kết quả 8/8 chỉ nghiệm thu 8 mục và các ca đã nêu, không xác nhận thay những hồ sơ đó.
