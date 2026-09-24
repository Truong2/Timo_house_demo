# TimoHouse UI ImageGen v1

Bộ visual mockup high-fidelity được sinh từ:

- `TimoHouse_UI_Mockup_Spec_v1.0.md` (nội dung hiện tại: specification 1.6).
- `TimoHouse_Mockup_Seed_Data_v1.0.md`.
- Wireframe của từng UI ID trong specification 1.6; ảnh UI-07 là tham chiếu phong cách cho các màn bổ sung.

## Kết quả

- 01 master Design System.
- 34 ảnh chính, mỗi UI ID từ UI-00 đến UI-33 có một ảnh riêng, đặt trong thư mục cụm menu tương ứng (xem Cấu trúc).
- 17 màn bổ sung bằng ImageGen theo wireframe; UI-01, UI-26 và UI-31 có bản render từ mã nguồn để giữ số liệu Seed Data chính xác.
- 08 functional flow board F-01…F-08.
- 04 responsive reference board tại 1440/1024/768/375px.
- 02 state matrix cho data, permission, lock, form và approval.
- Tổng **49 ảnh chính**: 01 design system, 34 màn UI, 08 flow, 04 responsive, 02 state. `COVERAGE.md` chỉ đến các file chính đang tồn tại.
- `06-chi-phi-dau-tu/UI-26-commissions.png` và `08-bao-cao-doi-soat/UI-31-financial-reports.png` là bản ImageGen phác thảo, có số chưa khớp seed; dùng bản `-verified.png` tương ứng để review nội dung và số liệu.

## Design baseline

- Desktop enterprise dashboard, data-dense và accessible.
- Primary `#1E40AF`, secondary `#3B82F6`, navy sidebar `#122F5B`.
- Background `#F8FAFC`, text `#0F172A`, border `#CBD5E1`.
- Fira Sans-like Vietnamese-safe sans serif và Lucide-style outline icons.
- Không gradient, glassmorphism, ảnh trang trí hoặc emoji cấu trúc.

## Cấu trúc

Ảnh màn hình được chia theo **9 cụm menu chức năng** của spec §6.2; mỗi thư mục có `README.md` liệt kê màn theo thứ tự thao tác, kết luận nghiệm thu và flow liên quan.

| Thư mục | Cụm menu | UI ID |
|---|---|---|
| [`01-tong-quan/`](01-tong-quan/README.md) | Tổng quan | UI-01 |
| [`02-nguon-nha-toa-phong/`](02-nguon-nha-toa-phong/README.md) | Nguồn nhà & tòa/phòng | UI-02, 03, 04, 05, 27 |
| [`03-khach-thue-hop-dong/`](03-khach-thue-hop-dong/README.md) | Khách thuê & hợp đồng | UI-06, 08, 07, 15, 16 |
| [`04-dich-vu-chi-so/`](04-dich-vu-chi-so/README.md) | Dịch vụ & chỉ số | UI-09, 10 |
| [`05-hoa-don-thu-tien/`](05-hoa-don-thu-tien/README.md) | Hóa đơn & thu tiền | UI-11, 12, 13, 14, 17 |
| [`06-chi-phi-dau-tu/`](06-chi-phi-dau-tu/README.md) | Chi phí & đầu tư | UI-24, 25, 26, 28, 29 |
| [`07-nhan-su-luong/`](07-nhan-su-luong/README.md) | Nhân sự & lương | UI-18…23 |
| [`08-bao-cao-doi-soat/`](08-bao-cao-doi-soat/README.md) | Báo cáo & đối soát | UI-30, 31, 32 |
| [`09-quan-tri-he-thong/`](09-quan-tri-he-thong/README.md) | Quản trị hệ thống | UI-00, UI-33 |

Dùng chung:

- `00-design-system/`: master visual language.
- `flows/`: luồng F-01…F-08 (mỗi README cụm có link tới flow liên quan).
- `responsive/`: quy tắc chuyển đổi theo breakpoint.
- `states/`: trạng thái dùng chung.
- `_source/`: mã HTML/CSS và lệnh render cho UI-01, UI-26, UI-31 và 7 màn cụm 02 (`data/landlord-tungsoi.mjs` giữ dữ liệu HĐ chủ nhà mẫu); `render.mjs` ghi ảnh thẳng vào thư mục cụm.
- `COVERAGE.md`: map UI ID sang ảnh chính.
- `AUDIT.md`: kết quả nghiệm thu từng ảnh so với specification và Seed Data (24/09/2026).
- `PROMPTS.md`: prompt set đã dùng.

## Lưu ý nghiệm thu

Ảnh ImageGen là visual design artifact. Mô hình ảnh có thể tự diễn giải một số tên, số hoặc câu chữ nhỏ. Mọi số liệu tài chính và copy nghiệp vụ trên ảnh ImageGen phải được kiểm tra lại bằng Seed Data và specification trước khi dùng làm bằng chứng nghiệm thu. UI-01, UI-26 và UI-31 bản `verified` được render từ mã với số liệu Seed Data; các tham chiếu SPA cũ trong `../ui-mockups/` hiện không còn trong workspace.

**Kết quả nghiệm thu 24/09/2026:** chưa ảnh nào đạt trọn vẹn; 21/34 màn và 7/8 flow không đạt. Chi tiết, danh sách lỗi và thứ tự làm lại xem [`AUDIT.md`](AUDIT.md). Bộ ảnh hiện tại sinh từ specification 1.6; specification 1.7 đã sửa các lỗi nằm sẵn trong wireframe (UI-01, 03, 04, 08, 12, 16, 19, 26, 27, 28), cần sinh lại các màn này.

**Cụm 02 dựng lại 24/09/2026:** 7 màn `-verified` (danh sách chủ nhà, trích xuất HĐ chủ nhà, chi tiết chủ nhà, HĐ đầu vào, tòa, tạo phòng, tài sản bàn giao) render từ mã với dữ liệu HĐ mẫu tùng sói — xem [`02-nguon-nha-toa-phong/README.md`](02-nguon-nha-toa-phong/README.md). Phần cổ đông góp vốn làm sau.
