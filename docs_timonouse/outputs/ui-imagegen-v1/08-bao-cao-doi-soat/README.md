# 08 — Báo cáo & đối soát

**Menu theo thứ tự thao tác (spec §6.2):** Kỳ báo cáo/Khóa kỳ → Report A/B, CF/AC → Đối soát/Metric definitions

**UI ID:** UI-30, UI-31, UI-32 · **Không đạt:** 3/3 ảnh chính. Chi tiết lỗi xem [`../AUDIT.md`](../AUDIT.md).

| # | UI ID | Màn hình | Ảnh | Kết luận | Lỗi chính |
|---:|---|---|---|---|---|
| 1 | UI-30 | Kỳ báo cáo & khóa kỳ | [UI-30-reporting-period-lock.png](UI-30-reporting-period-lock.png) | **KHÔNG ĐẠT** | Thiếu ⑥; checklist thiếu Σ % = 100 và kỳ N−1 Locked; mở lại ghi về Open |
| 2 | UI-31 | Report A/B — bản chính | [UI-31-financial-reports-verified.png](UI-31-financial-reports-verified.png) | **KHÔNG ĐẠT** | Số khớp seed §13, §14; thiếu bảng cổ phần, 11 tỷ lệ, ⑦, toggle CF/AC |
|  | UI-31 | Report A/B — bản nháp | [UI-31-financial-reports.png](UI-31-financial-reports.png) | Không dùng | Số cũ từ wireframe, chỉ tham khảo bố cục |
| 3 | UI-32 | Đối soát Golden & Metric | [UI-32-golden-reconciliation.png](UI-32-golden-reconciliation.png) | **KHÔNG ĐẠT** | SALARY/DEPRECIATION/ELECTRIC sai hoặc bịa; % KPI sai mẫu số |

## Flow liên quan

| Flow | Ảnh | Kết luận |
|---|---|---|
| F-06 Chi phí → khóa báo cáo | [F-06-expense-report-lock-flow.png](../flows/F-06-expense-report-lock-flow.png) | **KHÔNG ĐẠT** |
| F-07 Góp vốn → phân phối | [F-07-capital-distribution-flow.png](../flows/F-07-capital-distribution-flow.png) | **KHÔNG ĐẠT** |

## Tham chiếu dùng chung

- [R-04-report-breakpoints.png](../responsive/R-04-report-breakpoints.png)

Tham chiếu phong cách: [Design System](../00-design-system/00-timohouse-design-system.png).
