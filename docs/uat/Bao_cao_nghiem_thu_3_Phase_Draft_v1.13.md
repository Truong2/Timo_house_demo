# Báo cáo nghiệm thu sai lệch nghiệp vụ 3 Phase — Draft v1.13

Ngày kiểm tra: 03/10/2026.

## Kết luận

- Số chính thức của dữ liệu lịch sử dùng Excel; không thay đổi snapshot kỳ đã khóa.
- Quy tắc chưa có trả lời khách được giữ để so sánh với trạng thái `proposed`, không công bố cho cổ đông và không dùng để khóa số.
- Mỗi export chính có cách tính, trạng thái nghiệp vụ, phiên bản quy tắc và nguồn căn cứ.

## Phân tách số chính thức và phương án chờ xác nhận

| Phạm vi | Đúng Excel / chính thức | Phương án chờ khách xác nhận |
|---|---|---|
| Công nợ | 5 ngày lịch từ ngày phát hành; tương thích dữ liệu cũ có nguồn fallback | Cơ sở `dueDate` chỉ để đối chiếu |
| Báo cáo kinh doanh | Chế độ `excel`; tháng 8 = 685.928.969; chỉ admin/kế toán được mở so sánh | OQ-10 cộng hoàn cọc và thay mua sắm bằng khấu hao |
| Lương HS < 70% | Chỉ chốt sau khi nhập lương/phòng và lý do theo nhân viên × tòa × kỳ | Không còn mặc định 6.000/6.500đ |
| Hoa hồng | Mỗi đợt ghi đúng tháng thực chi; kỳ khóa bị chặn | Kỳ đủ điều kiện chỉ là điều kiện chi, không phải kỳ hạch toán |
| Chuyển đổi | Công bố số khách xem và khách chốt | `chốt/xem` mang nhãn đề xuất OQ-06 |
| Cổ đông | Kỳ lịch sử lấy đúng Excel; chênh làm tròn hiện riêng | Không dồn CHUNG và không khóa khi chính sách chưa xác nhận |
| Âm dương | Lịch sử mở chế độ Excel; kỳ web tách thực thu và phòng trống | Tổng mở rộng có phòng trống không mang tên “thực thu” |
| Sửa chữa | Lịch sử theo Excel; dòng ngoài kỳ hiển thị riêng và có lý do | Chu kỳ 26→25 là chế độ web |
| Tài sản | Tài sản mới bắt buộc số tháng, nguồn và trạng thái; chỉ `confirmed` vào báo cáo chính thức | Tài sản 63 tháng cũ là `legacy_assumption`, chỉ xem lịch thử |
| Forecast | Bản Excel nguồn giữ nguyên; bản xác nhận mới được cổ đông xem | Bản web mới tạo là nháp, đặt cạnh Excel để rà soát |
| LN/tài sản | Có đủ chính sách xác nhận mới tính | Trả “Chờ chính sách tài sản” nếu mẫu số chưa đủ căn cứ |

## Kết quả kiểm thử

| Lệnh / bộ kiểm tra | Kết quả |
|---|---|
| `npm run check` | 111 file JS hợp lệ; RBAC 520 kiểm tra; 320/320 test đạt |
| `npm run smoke` | 36/36 bước đạt |
| `npm run sweep` | 9 vai trò × 143 route; 0 lỗi hiển thị, 0 lỗi JS |
| `npm run verify:p0` | 19/19 kiểm tra đạt |
| `npm run verify:p2` | 88 ảnh minh chứng; không lỗi trang |
| `npm run verify:p3` | 30 ảnh minh chứng, gồm 8 ảnh responsive; đạt |
| `npm run verify:intake:ui` | Toàn bộ kiểm tra đạt; 24 ảnh responsive không tràn ngang |

Benchmark giữ nguyên: 1.471 hóa đơn tháng 9; lương Excel 98/101 dòng đối chiếu; báo cáo tổng và kinh doanh tháng 8; hoa hồng T8; G1; âm dương; sổ sửa chữa.

## Hồ sơ quyết định còn mở

Ma trận OQ-01…OQ-25 và người ký duyệt nằm tại `docs/SRS/TimoHouse_Ma_tran_Quyet_dinh_Nghiep_vu.md`. R01 và R02 đã đóng theo căn cứ/test; R03–R08 chỉ đóng khi có quyết định nghiệp vụ và test tương ứng. Cột trả lời khách trong workbook nguồn không bị thay đổi.
