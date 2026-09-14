# TimoHouse – Mockup tương tác Phase 1 (Core Rental / Go-live)

Mockup click-through dựng từ bộ PNG `Phase_1_Core_Rental_GoLive/`, SRS v1.2 và UI Spec v1.5. Mọi nút trong PNG đều bấm được; dữ liệu thay đổi thật (localStorage) theo state machine của SRS §6.

## Chạy
- **Cách 1:** mở `index.html` bằng Chrome/Edge (double-click) – chạy trực tiếp từ file://.
- **Cách 2:** kéo thả thư mục `mockup/` lên Netlify Drop, hoặc `python -m http.server 8765` rồi mở `http://localhost:8765`.
- Tài khoản demo (mật khẩu bất kỳ): `admin` (Quản trị viên), `ketoan` (Kế toán), `vanhanh` (Vận hành). Đổi vai trò nhanh ở menu góc phải.
- Ngày hệ thống demo cố định **28/10/2024**, kỳ **Tháng 10/2024** để khớp số liệu mockup (đổi tại *Công cụ nâng cao*).

## Kịch bản demo 16 điều kiện Go-live
Bật **Hướng dẫn thao tác** (nút trên topbar). Panel dẫn qua 10 luồng / 36 mốc, tự nhận biết hoàn thành từ dữ liệu bạn tạo:

| Luồng | Nội dung | Go-live |
|---|---|---|
| S0 | Đăng nhập, Tổng quan, Danh mục dịch vụ, Phòng sẵn sàng | – |
| F01 | Thêm khách thuê | 1 |
| F02 | Chọn phòng → Tạo hợp đồng → giá/cọc/dịch vụ → Kích hoạt (phòng → Đang thuê) | 2, 3, 4 |
| F03 | Nhập điện nước → Preflight → Tạo nháp → Phát hành hóa đơn | 5, 6 |
| F04 | Gửi hóa đơn qua Zalo (re-check công nợ, tiến độ gửi) | 7 |
| F05 | Xem công nợ → Thu một phần → Chi tiết khoản thu → Theo dõi còn nợ | 8, 9, 10 |
| F06 | Nhắc công nợ qua Zalo, thử lại tin lỗi | 11 |
| F07 | Kết thúc hợp đồng → phòng Chờ dọn, tạo hồ sơ hoàn cọc | 12, 14 |
| F08 | Lập phương án → Gửi duyệt → Kế toán duyệt → Ghi nhận đã hoàn | 13 |
| F09 | Xác nhận dọn xong → phòng Sẵn sàng | 15, 16 |
| F10 | Chi phí, Import khách bằng file mẫu, Tạo tài khoản, Xuất báo cáo | tùy chọn |

Các nút trong panel (Đi tới màn hình, Chuyển vai trò, Xem/Điền dữ liệu mẫu, Tải/Dùng file mẫu) **không tạo record**; record chỉ sinh qua nút Lưu/Xác nhận của màn nghiệp vụ.

## Công cụ nâng cao (cuối sidebar)
Đặt lại dữ liệu demo · Xóa trắng dữ liệu nghiệp vụ · Đổi ngày hệ thống · Xuất/Nhập state JSON · Chạy toàn bộ kịch bản Go-live (kiểm tra kỹ thuật) · Reset tiến độ hướng dẫn. API console: `window.__timehouseDemo`.

## Quy ước & mặc định nghiệp vụ (OI còn mở)
- Mã phòng chuẩn hóa `A.12.03`; mã đợt Zalo `ZL-202410-xxx`.
- Nút thao tác trên dòng bảng ở dạng icon; rê chuột hoặc focus (Tab) vào icon để xem tên thao tác. Nút ⋮ mở menu thao tác đầy đủ.
- **Kỳ báo cáo**: chọn kỳ ở topbar hoặc trong bộ lọc trang đều đồng bộ với nhau; "Tất cả kỳ" (từ chuông việc cần xử lý) bỏ lọc kỳ cho trang đó.
- **Kết thúc HĐ**: mặc định phòng → Chờ dọn (BR-02); bỏ tick "Chuyển phòng sang Chờ dọn" thì phòng → Sẵn sàng ngay. Phòng không bao giờ kẹt ở Đang thuê khi không còn HĐ hiệu lực.
- **Zalo**: rule 3 ngày (không gửi lại khách vừa nhận tin) áp dụng cả ở nút Gửi nhắc nhanh – có ô "Vẫn gửi" để ghi đè khi demo; công nợ được re-check lại đúng lúc bấm Xác nhận gửi; rule đang tắt trong Cấu hình Zalo sẽ chặn tạo đợt gửi cùng sự kiện (FR-ZAL-01). Các đợt gửi lịch sử (seed) chỉ có số liệu tổng, không có chi tiết tin.
- **Chỉ số điện nước**: chỉ số đã dùng cho hóa đơn của HĐ trước không tái dùng cho HĐ mới cùng kỳ – wizard báo "Thiếu chỉ số (chỉ số cũ của HĐ trước)" và lấy chỉ số cũ = số đã chốt.
- **Xác nhận thu tiền** (nút $ trên dòng / chọn nhiều dòng ở Hóa đơn, Thu tiền & công nợ, chi tiết hóa đơn/khách): thu **đủ** số còn lại của các hóa đơn đã chọn, bắt buộc đính kèm minh chứng (có "Dùng minh chứng mẫu" cho demo), tự tách 1 khoản thu / khách. **Thu tiền thủ công** (đầu trang Thu tiền & công nợ, menu ⋮ → "Thu một phần / phân bổ thủ công"): chọn khách, thu một phần, phân bổ tay.
- Thu một phần: **cho phép**. Cờ "cần xử lý công nợ" = phát hành + 5 ngày (BR-07); nhãn Quá hạn theo hạn thanh toán.
- **Import hóa đơn**: Hóa đơn → "Import hóa đơn" (hoặc Import dữ liệu → Hóa đơn). 1 dòng = 1 hóa đơn theo số tiền (Tiền phòng trống = giá HĐ, Điện/Nước/Dịch vụ khác nhập thẳng số tiền); gắn vào HĐ hiệu lực của phòng, bỏ qua phòng đã có hóa đơn kỳ đó; tạo ở trạng thái **Nháp**. File mẫu: `assets/samples/mau-import-hoa-don.csv` hoặc nút "Tải file mẫu".
- Hoàn cọc: khấu hao cố định 200.000đ/phòng (BR-12); **không** tự bù trừ công nợ (OI-07); chỉ Admin/Kế toán duyệt (FR-FIN-07); phòng chỉ Sẵn sàng sau xác nhận dọn xong (BR-02).
- Zalo: ZBS Template Message; fallback SMS chưa dùng (OI-21); gửi thành công ≠ đã thanh toán.
- Mục sidebar gắn **P2/P3** là ngoài scope Phase 1, mở trang mô tả scope, không có action.

## Cấu trúc
`index.html` · `css/` (tokens, base, components, pages) · `js/core/` (format, store, seed, selectors, auth, actions, router, guide) · `js/ui/` (icons, components, table, chart, layout, forms) · `js/pages/` (1 file / nhóm màn) · `assets/samples/` (CSV mẫu import).
