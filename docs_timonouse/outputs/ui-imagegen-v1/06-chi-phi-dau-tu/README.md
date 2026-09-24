# 06 — Chi phí & đầu tư

**Menu theo thứ tự thao tác (spec §6.2):** Chi phí/Import → Phân bổ → Hoa hồng → Tiền thuê nhà đầu vào/Trả trước → Cổ đông/Cổ phần/Góp vốn/Phân phối

**UI ID:** UI-24, UI-25, UI-26, UI-28, UI-29 · **Không đạt:** 4/5 ảnh chính. Chi tiết lỗi xem [`../AUDIT.md`](../AUDIT.md).

| # | UI ID | Màn hình | Ảnh | Kết luận | Lỗi chính |
|---:|---|---|---|---|---|
| 1 | UI-24 | Chi phí & Import | [UI-24-expenses-import.png](UI-24-expenses-import.png) | ĐẠT CÓ LƯU Ý | Stepper dừng ở Upload dù đã Preview; thiếu cột Trạng thái/Lô |
| 2 | UI-25 | Phân bổ chi phí/lương | [UI-25-expense-salary-allocation.png](UI-25-expense-salary-allocation.png) | **KHÔNG ĐẠT** | Thiếu ①–⑦; N = 1.240 (đúng 1.382); phương pháp phân bổ không có trong spec |
| 3 | UI-26 | Hoa hồng — bản chính | [UI-26-commissions-verified.png](UI-26-commissions-verified.png) | **KHÔNG ĐẠT** | Số khớp seed §11; thiếu vùng ②④⑤⑥ và cột Deal/Đợt/TT chi |
|  | UI-26 | Hoa hồng — bản nháp | [UI-26-commissions.png](UI-26-commissions.png) | Không dùng | Phép tính lệch, chỉ tham khảo bố cục |
| 4 | UI-28 | Tiền thuê nhà/Trả trước | [UI-28-head-lease-prepayments.png](UI-28-head-lease-prepayments.png) | **KHÔNG ĐẠT** | CF − AC sai dấu, cổ đông A/B/C (spec 1.7 đã sửa); 3 CTA primary |
| 5 | UI-29 | Cổ đông/Cổ phần/Góp vốn | [UI-29-shareholders-capital.png](UI-29-shareholders-capital.png) | **KHÔNG ĐẠT** | Phân phối theo tháng thay vì theo quý; vốn góp sai seed; thiếu 232.262.000/P-29 |

## Flow liên quan

| Flow | Ảnh | Kết luận |
|---|---|---|
| F-06 Chi phí → khóa báo cáo | [F-06-expense-report-lock-flow.png](../flows/F-06-expense-report-lock-flow.png) | **KHÔNG ĐẠT** |
| F-07 Góp vốn → phân phối | [F-07-capital-distribution-flow.png](../flows/F-07-capital-distribution-flow.png) | **KHÔNG ĐẠT** |

Tham chiếu phong cách: [Design System](../00-design-system/00-timohouse-design-system.png).
