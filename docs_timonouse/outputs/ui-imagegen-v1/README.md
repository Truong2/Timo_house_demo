# TimoHouse UI ImageGen v1

Bộ visual mockup high-fidelity được sinh từ:

- `TimoHouse_UI_Mockup_Spec_v1.0.md` (nội dung hiện tại: specification 1.6).
- `TimoHouse_Mockup_Seed_Data_v1.0.md`.
- 20 screenshot chụp trực tiếp từ SPA trong `../ui-mockups/`.

## Kết quả

- 01 master Design System.
- 16 màn hình bổ sung cho các UI ID còn thiếu hoặc chưa có ảnh riêng.
- 08 functional flow board F-01…F-08.
- 04 responsive reference board tại 1440/1024/768/375px.
- 02 state matrix cho data, permission, lock, form và approval.
- Kết hợp với 20 screenshot SPA hiện có: **51 ảnh**, phủ UI-00…UI-33 và F-01…F-08.

## Design baseline

- Desktop enterprise dashboard, data-dense và accessible.
- Primary `#1E40AF`, secondary `#3B82F6`, navy sidebar `#122F5B`.
- Background `#F8FAFC`, text `#0F172A`, border `#CBD5E1`.
- Fira Sans-like Vietnamese-safe sans serif và Lucide-style outline icons.
- Không gradient, glassmorphism, ảnh trang trí hoặc emoji cấu trúc.

## Cấu trúc

- `00-timohouse-design-system.png`: master visual language.
- `UI-*.png`: màn hình high-fidelity bổ sung.
- `flows/`: luồng F-01…F-08.
- `responsive/`: quy tắc chuyển đổi theo breakpoint.
- `states/`: trạng thái dùng chung.
- `COVERAGE.md`: map UI ID sang ảnh chính.
- `PROMPTS.md`: prompt set đã dùng.

## Lưu ý nghiệm thu

Ảnh ImageGen là visual design artifact. Mô hình ảnh có thể tự diễn giải một số tên, số hoặc câu chữ nhỏ. Mọi số liệu tài chính và copy nghiệp vụ phải được kiểm tra lại bằng Seed Data và SPA trước khi dùng làm bằng chứng nghiệm thu. Screenshot trong `../ui-mockups/` vẫn là nguồn chính xác hơn cho dữ liệu đã triển khai.
