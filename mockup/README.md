# Mockup Phase 1 – hướng dẫn demo

## Vai trò

| Tài khoản | Vai trò | Thấy gì |
|---|---|---|
| `admin` | Quản trị hệ thống | Toàn bộ; cấu hình, tham số, mở khóa kỳ; duyệt hoàn cọc phần admin |
| `ketoan` | Kế toán | Hóa đơn, thu tiền, công nợ (số tiền), chi phí, phân bổ, lương, báo cáo; duyệt hoàn cọc phần kế toán |
| `vanhanh` | Quản lý / vận hành | Chỉ tòa được phân công: phòng, khách, chỉ số, hóa đơn (không thấy số tiền nợ), lập phiếu hoàn, kết thúc lượt thuê |
| `leader` | Trưởng nhóm | Nhánh tổ chức: trạng thái & số còn nợ, nhân sự trong nhánh; không ghi thu |
| `truongphong` | Trưởng phòng | Nhánh tổ chức + xem Báo cáo tổng/kinh doanh (CH-23) |

## Mốc 1A / 1B

Cài đặt → Hệ thống demo → chọn mốc. Mốc 1A ẩn Báo cáo, Phân bổ, Bảng lương, Cơ cấu tổ chức và khóa kỳ (go-live hóa đơn & thu tiền trước); mốc 1B mở toàn bộ.

## Kịch bản gợi ý

1. **Go-live (1A):** Tòa nhà → S43 → tab Phòng → chọn phòng trống → Tạo lượt thuê "chờ nhận" + cọc → Hóa đơn & thu tiền → Chỉ số (kỳ 10) → Tạo kỳ hóa đơn (wizard) → Phát hành → Xem/in (4 mẫu) → Ghi thu một phần → Công nợ → Khách thuê → Kết thúc thuê (phá HĐ / hết hạn) → Hoàn cọc (admin duyệt, đăng nhập `ketoan` duyệt, ghi chi) → Thông báo Zalo (tạo đợt, gửi, gửi lại tin lỗi) → Tổng quan.
2. **Chốt tháng (1B):** Nhân sự & lương → Bảng lương (kỳ 08, đối chiếu Excel, duyệt ca HS>100) → Chốt → Chi phí → Phân bổ chung (mẫu số 1.382) → Chốt → Báo cáo tổng / Báo cáo kinh doanh / theo tòa → Cài đặt → Kỳ → Khóa kỳ 08.

## Lệch có chủ đích so với ảnh `docs/UI`

- Mã phòng hiển thị `501S43` (số phòng + mã tòa), không `G1-501`; mã KH = mã phòng + A001, A002… theo lượt thuê.
- Hóa đơn in 9 cột, **13 dòng** (thêm dòng 13 "Thu khác"), chọn 1 trong 4 mẫu theo tòa; trạng thái thu theo Excel: Chưa TT / Thiếu / Đủ / Thừa; công nợ từ ngày 6 tháng N.
- Báo cáo đúng dòng 3–61 của sheet SRC-04 với cột TỔNG / NHÀ T / S / G; báo cáo theo tòa mỗi cột một tòa.
- Bảng lương theo HS = T/K×100, mốc 5/10/15 (100/90/70%), bậc cận gần nhất – không dùng công thức A/B/C×91% của ảnh UI-25.
- Chia cổ đông G1, kinh doanh/lead, OCR là Phase 2 (mốc mặc định; đổi ở Cài đặt → Hệ thống demo); tài sản / bảo dưỡng là Phase 3 – chưa có.
- Phase 2: ảnh UI-22 (tỷ lệ mẫu 10/2/3%) và UI-27 (chọn 2 báo cáo) đã cũ – làm theo đặc tả và SRC-09; UI-42…UI-47, hộp thư Zalo không có ảnh – thiết kế theo khung báo cáo Phase 1. Chi tiết: `docs/uat/Phase2_Kich_ban_kiem_thu.md` §3.
- UI-39 Thông báo Zalo không có ảnh – thiết kế theo bộ nền B00.

## Công cụ

Cài đặt → Hệ thống demo: đổi ngày hệ thống, xuất/nhập JSON thao tác, xóa dữ liệu thao tác. Console: `window.__timohouse`.
