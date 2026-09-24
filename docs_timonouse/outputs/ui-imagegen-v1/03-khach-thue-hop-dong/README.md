# 03 — Khách thuê & hợp đồng

**Menu theo thứ tự thao tác (spec §6.2):** Khách thuê → OCR hợp đồng khách → Hợp đồng thuê → Sắp hết hạn/Gia hạn/Kết thúc → Cọc/Hoàn cọc

**UI ID:** UI-06, UI-07, UI-08, UI-15, UI-16 · **Không đạt:** 3/5 ảnh chính. Chi tiết lỗi xem [`../AUDIT.md`](../AUDIT.md).

| # | UI ID | Màn hình | Ảnh | Kết luận | Lỗi chính |
|---:|---|---|---|---|---|
| 1 | UI-06 | Khách thuê | [UI-06-tenants.png](UI-06-tenants.png) | ĐẠT CÓ LƯU Ý | Đủ ①–⑦; CT-2026-0442 lệch khách/phòng so với UI-07 |
| 2 | UI-08 | OCR/Data Onboarding | [UI-08-ocr-onboarding.png](UI-08-ocr-onboarding.png) | **KHÔNG ĐẠT** | Mới hiện 4/8 xung đột (spec 1.7 đã bổ sung); lỗi dấu ĐỔ/ĐÔNG HÔ/chi |
| 3 | UI-07 | Hợp đồng thuê | [UI-07-contract-detail.png](UI-07-contract-detail.png) | **KHÔNG ĐẠT** | Không theo wireframe, thiếu ②–⑧; tổng đầu kỳ 4.020.000 bỏ mất tiền phòng; lộ CCCD |
| 4 | UI-15 | HĐ sắp hết/Gia hạn/Kết thúc | [UI-15-expiring-contracts.png](UI-15-expiring-contracts.png) | **KHÔNG ĐẠT** | Thiếu nhánh Phá HĐ, checklist kết thúc; có ô Tiền cọc mới trái rule |
| 5 | UI-16 | Cọc & hoàn cọc | [UI-16-deposits-refunds.png](UI-16-deposits-refunds.png) | ĐẠT CÓ LƯU Ý | Cọc 301T41 theo seed là 3.800.000 (spec 1.7 đã sửa); thiếu ca prorate P-03 |

## Flow liên quan

| Flow | Ảnh | Kết luận |
|---|---|---|
| F-01 OCR → hợp đồng | [F-01-ocr-contract-flow.png](../flows/F-01-ocr-contract-flow.png) | **KHÔNG ĐẠT** |
| F-04 Gia hạn/kết thúc | [F-04-renewal-termination-flow.png](../flows/F-04-renewal-termination-flow.png) | **KHÔNG ĐẠT** |

## Tham chiếu dùng chung

- [R-03-detail-wizard-breakpoints.png](../responsive/R-03-detail-wizard-breakpoints.png)

Tham chiếu phong cách: [Design System](../00-design-system/00-timohouse-design-system.png).
