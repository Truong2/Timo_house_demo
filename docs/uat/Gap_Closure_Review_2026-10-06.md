# TimoHouse — Gap Closure Review 2026-10-06

## Kết luận

Tám finding của audit workbook ngày 04/10 đều **PASS ở trạng thái triển khai hiện tại**. Kết quả này xác nhận giao diện và logic demo trên source/Netlify đáp ứng các ca kiểm tra liệt kê bên dưới; nó **không thay thế xác nhận nghiệp vụ** cho công thức, phạm vi phase hay yêu cầu production.

## Bản và phạm vi kiểm tra

- Source commit: `6200ea2c9a0fcc9f2b4e545702c9802f82e8dfd2`.
- Netlify: `https://timohousev2.netlify.app`, build SHA `6200ea2`, `builtAt=2026-10-06T10:08:55.803Z`.
- Source/live: **117 JavaScript files, 0 mismatches**.
- UI: **54 routes** đã đọc.
- JavaScript/page errors: **0**; HTTP request ghi dữ liệu (`POST/PUT/DELETE`): **0**.
- Gap regression suite `tests/audit-gap-completion.test.mjs`: **10/10 passed**.
- Audit chạy trên local source và Netlify live; dữ liệu kiểm tra tạo trong browser context riêng.

## Finding theo workbook

| ID | Trạng thái | Kết quả hiện tại |
|---|---|---|
| `VEHICLE-BILLING` | PASS | Hai xe đã khai báo được đưa vào hóa đơn nháp; fixture kiểm tra 2 × 100.000đ = 200.000đ. |
| `FEE-SPLIT` | PASS | Tách `parking` và `charging`; 2 xe gửi × 100.000đ + 1 xe sạc × 50.000đ = 250.000đ. |
| `EXP-FILTER` | PASS | Danh sách chi phí có bộ lọc kỳ, khu vực, nhân viên vận hành và trưởng khu vực. |
| `SHARE-ASOF` | PASS | Số cọc và tài sản thay đổi theo ngày xem; kiểm tra hai mốc 30/09 và 31/10/2026. |
| `SALE-REPORT-LEADER` | PASS | Báo cáo sale có bộ lọc `leader` riêng với bộ lọc `team`. |
| `SALE-STT` | PASS | Tab nhân sự sale có cột STT. |
| `SALARY-MODE` | PASS về cơ chế | Chuyển sang nhập tay làm thay đổi kết quả và yêu cầu căn cứ. **Công thức nghiệp vụ cho một số phòng ban vẫn cần xác nhận.** |
| `BUSINESS-REFUND` | PASS về cơ chế | Web mode loại cọc mới, hoàn cọc và mua thiết bị khỏi báo cáo theo ca audit. **Policy chính thức còn mâu thuẫn với mặc định đang ghi trong SRS C-02.** |

## Điểm còn mở — không được xem là đã đóng

1. **C-02, Báo cáo Kinh doanh:** kiểm tra kỹ thuật cho thấy web mode cộng hoàn cọc trở lại; SRS `BUSINESS_V1_WORKBOOK` lại theo số Excel có hoàn cọc đã trừ. Cần xác nhận mode chính thức trước khi đổi SRS, seed kỳ lịch sử hoặc formula.
2. **C-03…C-06, lương:** mode hoạt động đúng về kỹ thuật; công thức/chính sách cho các phòng ban ngoài vận hành và một số ngoại lệ vẫn chưa được phê duyệt.
3. **C-15/C-25, phase:** SRS và `00_SCOPE_3_PHASE.md` chưa thống nhất phase của CRM, OCR, cổ đông, tài sản, nhân sự/lương, báo cáo quản trị và báo cáo âm/dương.
4. **C-01, C-07/C-08/C-10/C-11/C-19/C-22/C-26…C-29:** các định nghĩa phòng trống, doanh thu, KPI tòa, cách ghi nhận/đối chiếu chi phí, dự kiến và xử lý prepaid/SETUP còn theo sổ quyết định trong SRS.

Danh sách câu hỏi và trường ký duyệt: [Business Decision Log](Business_Decisions_Open_2026-10-06.md).

## Giới hạn xác nhận

Audit xác nhận mockup source và deploy Netlify cùng khớp tại SHA `6200ea2`. Repo mô tả app là SPA demo với state trình duyệt/seed; audit này **không** kiểm tra backend thật, API authorization, khóa kỳ phía server, đồng thời nhiều người dùng, backup/restore hoặc khả năng vận hành production.

## Chạy lại

```powershell
npm.cmd run verify:audit-gaps
npm.cmd run audit:live
```

`verify:audit-gaps` chạy regression suite và audit local. `audit:live` xác minh deploy Netlify hiện tại; kết quả của nó thay đổi theo deploy mới.
