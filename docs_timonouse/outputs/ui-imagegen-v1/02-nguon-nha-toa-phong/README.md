# 02 — Nguồn nhà & tòa/phòng

**Menu theo thứ tự thao tác (spec §6.2):** Chủ nhà → Hợp đồng đầu vào → Tòa nhà/Hồ sơ tài liệu → Phòng → Tài sản bàn giao & khấu hao

**Nguồn dữ liệu:** HĐ chủ nhà mẫu `Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc` (Phí Văn Thắng · 25A Ngõ 261 Phú Diễn · 114.000.000 đ/tháng). Chi tiết ở Seed Data §17 và spec 1.9 (mục "Chuỗi Nguồn nhà" đầu §9, UI-02…UI-05). Ảnh `-verified` render từ mã tại `_source/screens/`, dữ liệu dùng chung ở `_source/data/landlord-tungsoi.mjs`.

**Cổ đông góp vốn:** làm sau. Phần cổ đông ở HĐ đầu vào (⑨), Phụ lục góp vốn 3 bên (Điều 7.2) và cờ "vốn góp ban đầu" chỉ hiện dưới dạng "Làm sau".

## Luồng review (đọc theo thứ tự)

| # | UI ID | Màn hình | Ảnh | Nội dung chính |
|---:|---|---|---|---|
| 1 | UI-02 | Danh sách chủ nhà | [UI-02-landlord-list-verified.png](UI-02-landlord-list-verified.png) | 7 chủ nhà: Phí Văn Thắng (nháp từ trích xuất) + 6 chủ HĐ điện theo Seed §12, chưa có HĐ đầu vào. CTA chính **Tạo từ HĐ chủ nhà** |
| 2 | UI-03 | Trích xuất HĐ chủ nhà | [UI-03-head-lease-extract-verified.png](UI-03-head-lease-extract-verified.png) | Upload → trích xuất → review: 29 trường theo Điều, 3 xung đột chặn commit (ngày trống, cọc "/tháng", Bên B cá nhân), 8 cảnh báo, preview kết quả commit |
| 3 | UI-02 | Chi tiết chủ nhà | [UI-02-landlord-detail-verified.png](UI-02-landlord-detail-verified.png) | Bên A đủ ngày/nơi cấp CCCD; thiếu TK ngân hàng; 1 tòa suy từ HĐ; hồ sơ của chủ nhà |
| 4 | UI-03 | HĐ đầu vào HL-0031 | [UI-03-head-lease-verified.png](UI-03-head-lease-verified.png) | Nháp; lịch trả bị chặn vì thiếu ngày (khi có: 20 kỳ × 342.000.000); điều khoản rủi ro nguyên văn; ⑨ cổ đông "Làm sau" |
| 5 | UI-04 | Tòa 25A Phú Diễn | [UI-04-building-verified.png](UI-04-building-verified.png) | Chuẩn bị; mã tòa ví dụ `PD25A`; số tầng, DT sàn, GCN trống; 2 công tơ từ phụ lục; checklist pháp lý |
| 6 | UI-05 | Tạo phòng | [UI-05-rooms-create-verified.png](UI-05-rooms-create-verified.png) | Sinh theo tầng × số phòng/tầng và Import Excel; preview, phát hiện trùng mã. Số nhập là minh họa |
| 7 | UI-27 | Tài sản bàn giao của chủ nhà | [UI-27-handover-assets-verified.png](UI-27-handover-assets-verified.png) | 13 hạng mục Phụ lục I; sở hữu chủ nhà, không khấu hao; số lượng trống; lệch PL II ↔ Điều 7.1 |

**Kết luận nghiệm thu:** chưa kiểm độc lập. Các ảnh `-verified` dựng từ dữ liệu HĐ và Seed, mỗi màn một CTA primary, chip có icon. Cần review nghiệp vụ.

## Bản nháp ImageGen cũ — không dùng

Dữ liệu minh họa T42 / S19A không có nguồn. Kết luận cũ xem [`../AUDIT.md`](../AUDIT.md).

| UI ID | Ảnh | Kết luận cũ |
|---|---|---|
| UI-02 | [UI-02-landlord.png](UI-02-landlord.png) | ĐẠT CÓ LƯU Ý |
| UI-03 | [UI-03-head-lease.png](UI-03-head-lease.png) | ĐẠT CÓ LƯU Ý |
| UI-04 | [UI-04-building.png](UI-04-building.png) | ĐẠT CÓ LƯU Ý |
| UI-05 | [UI-05-rooms.png](UI-05-rooms.png) | ĐẠT CÓ LƯU Ý |
| UI-27 | [UI-27-assets-depreciation.png](UI-27-assets-depreciation.png) | **KHÔNG ĐẠT** · vẫn là ảnh duy nhất cho tab Tài sản công ty đầu tư & lịch khấu hao |

## Flow liên quan

| Flow | Ảnh | Kết luận |
|---|---|---|
| F-07 Góp vốn → phân phối | [F-07-capital-distribution-flow.png](../flows/F-07-capital-distribution-flow.png) | **KHÔNG ĐẠT** · làm lại khi có module Cổ đông |

Tham chiếu phong cách: [Design System](../00-design-system/00-timohouse-design-system.png).
