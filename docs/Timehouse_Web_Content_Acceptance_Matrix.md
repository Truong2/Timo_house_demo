# Ma trận nghiệm thu nội dung web Timehouse

Nguồn: `nội dung làm web Timehouse 31.8.2026(2).xlsx`. Workbook là chuẩn phạm vi UI; các công thức OQ chưa xác nhận không được nâng thành chính sách chính thức.

| Sheet | Route chính | Trường / filter / output nghiệm thu | Test / evidence | Trạng thái |
|---|---|---|---|---|
| menu chính | Toàn bộ sidebar | Đủ module hiện có, không tạo route trùng | `sweep`, `verify:ui-audit` | Đạt |
| Tổng quan | `/dashboard` | Ba nhóm phòng trống, doanh thu, tiến độ thu, phạm vi quản lý | `smoke`, `verify:p0` | Đạt |
| Khu nhà và toàn nhà | `/owners`, `/buildings` | Giữ giá, điều khoản, nguồn, diện tích sàn, ĐKKD/PCCC, tài sản bàn giao | `workbook-content.test.mjs`, ảnh 375/768/1024/1440 | Đạt |
| Thông tin khách hàng | `/tenants`, `/stays/:id` | Quản lý/leader, chờ hoàn cọc, Zalo, xe, tạm trú, phiên hợp đồng | `verify:workbook-content`, `verify:v5-gaps` | Đạt |
| Tài chính chung | `/billing/invoices`, `/refunds`, `/expenses` | Giá/cọc/kỳ trả, hạn thanh toán, bộ lọc hoàn cọc và export cùng scope | `workbook-content.test.mjs`, `verify:p0` | Đạt |
| KINH DOANH | `/sales/*` | Hàng, lead, deal, hoa hồng, doanh số và nguồn | `verify:p2`, `verify:v5-gaps` | Đạt |
| BÁO CÁO | `/reports/*` | Bộ lọc T/S/G, quản lý/leader/cổ đông; Điện/Nước/Dịch vụ | `verify:workbook-content`, `verify:ui-audit` | Đạt; Dịch vụ web chờ xác nhận |
| NHÂN SỰ | `/hr`, `/hr/payroll` | Phòng ban hiệu lực, chức danh, leader, thâm niên, phạm vi và export | `workbook-content.test.mjs`, `verify:p0` | Đạt |
| TT CỔ ĐÔNG | `/shares/*` | Tỷ lệ, bảng kê, góp vốn, chi thực và tài sản | `verify:p2`, `verify:p3` | Đạt |
| BẢO TRÌ BẢO DƯỠNG | `/assets/*` | Thang máy, bơm, máy giặt, lọc nước, kiểm kê | `verify:p3` | Đạt |

## Quy tắc bảo toàn

- Excel vẫn là số chính thức cho dữ liệu lịch sử và kỳ khóa.
- OQ-06, OQ-10 và thu–chi dịch vụ chưa xác nhận luôn có nhãn đề xuất.
- Không sửa golden fixture hoặc snapshot kỳ khóa để làm kết quả khớp.
- Dữ liệu cũ thiếu trường hiển thị “Chưa có dữ liệu”; không suy diễn từ ghi chú tự do.
