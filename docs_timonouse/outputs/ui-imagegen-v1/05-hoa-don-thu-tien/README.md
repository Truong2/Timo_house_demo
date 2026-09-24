# 05 — Hóa đơn & thu tiền

**Menu theo thứ tự thao tác (spec §6.2):** Kỳ hóa đơn → Hóa đơn phòng → Thu tiền → Công nợ/Phạt → Zalo nhắc thanh toán

**UI ID:** UI-11, UI-12, UI-13, UI-14, UI-17 · **Không đạt:** 5/5 ảnh chính. Chi tiết lỗi xem [`../AUDIT.md`](../AUDIT.md).

| # | UI ID | Màn hình | Ảnh | Kết luận | Lỗi chính |
|---:|---|---|---|---|---|
| 1 | UI-11 | Kỳ hóa đơn | [UI-11-billing-period-preflight.png](UI-11-billing-period-preflight.png) | **KHÔNG ĐẠT** | Khác wireframe; điện chung 8,816 đ/người là số bịa (seed 40.533,33) |
| 2 | UI-12 | Hóa đơn | [UI-12-invoices.png](UI-12-invoices.png) | **KHÔNG ĐẠT** | Dòng 12 Điện chung ghi 60.533, đúng là 40.533 |
| 3 | UI-13 | Thu tiền | [UI-13-payment-allocation.png](UI-13-payment-allocation.png) | **KHÔNG ĐẠT** | Thiếu 4/5 vùng; thứ tự phân bổ sai BR-2.10.4 |
| 4 | UI-14 | Công nợ & phạt | [UI-14-receivables-penalties.png](UI-14-receivables-penalties.png) | **KHÔNG ĐẠT** | Phạt 5 %/tháng, đúng là 200.000 đ/ngày từ ngày thứ 6; thiếu tab Nợ phá HĐ |
| 5 | UI-17 | Zalo ZNS | [UI-17-zalo-zns.png](UI-17-zalo-zns.png) | **KHÔNG ĐẠT** | Thiếu bảng rule, phương án dự phòng; số tự mâu thuẫn; lộ SĐT khách |

## Flow liên quan

| Flow | Ảnh | Kết luận |
|---|---|---|
| F-02 Chỉ số → hóa đơn | [F-02-meter-invoice-flow.png](../flows/F-02-meter-invoice-flow.png) | **KHÔNG ĐẠT** |
| F-03 Thu tiền → công nợ/phạt | [F-03-payment-debt-penalty-flow.png](../flows/F-03-payment-debt-penalty-flow.png) | **KHÔNG ĐẠT** |

## Tham chiếu dùng chung

- [R-02-list-table-breakpoints.png](../responsive/R-02-list-table-breakpoints.png)

Tham chiếu phong cách: [Design System](../00-design-system/00-timohouse-design-system.png).
