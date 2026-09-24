# 07 — Nhân sự & lương

**Menu theo thứ tự thao tác (spec §6.2):** Cơ cấu tổ chức → Nhân sự → Phân công tòa → Hiệu suất thu tiền → Bảng lương → Chi lương

**UI ID:** UI-18, UI-19, UI-20, UI-21, UI-22, UI-23 · **Không đạt:** 5/6 ảnh chính. Chi tiết lỗi xem [`../AUDIT.md`](../AUDIT.md).

| # | UI ID | Màn hình | Ảnh | Kết luận | Lỗi chính |
|---:|---|---|---|---|---|
| 1 | UI-18 | Cơ cấu tổ chức | [UI-18-organization-structure.png](UI-18-organization-structure.png) | **KHÔNG ĐẠT** | Cây tổ chức bịa; thiếu Xem tại ngày, timeline Lead, 408 phòng dưới quyền |
| 2 | UI-19 | Nhân sự | [UI-19-employee-profile.png](UI-19-employee-profile.png) | **KHÔNG ĐẠT** | 9 tòa, Lead, Level sai seed; thiếu cấu phần lương, cảnh báo nghỉ việc |
| 3 | UI-20 | Phân công tòa | [UI-20-building-assignments.png](UI-20-building-assignments.png) | ĐẠT CÓ LƯU Ý | Đủ ①–⑤; thiếu cột lý do/người duyệt và action Duyệt/Trả sửa |
| 4 | UI-21 | Hiệu suất thu tiền | [UI-21-collection-performance.png](UI-21-collection-performance.png) | **KHÔNG ĐẠT** | Số bịa (Huyền 220 phòng, seed 135); mọi tòa 130.000/phòng trái rule bậc |
| 5 | UI-22 | Bảng lương | [UI-22-payroll-review.png](UI-22-payroll-review.png) | **KHÔNG ĐẠT** | LCB, thực nhận, tổng 372.502.949,84 sai seed (198.412.000) |
| 6 | UI-23 | Chi lương | [UI-23-salary-payments.png](UI-23-salary-payments.png) | **KHÔNG ĐẠT** | Lệnh 04 chi trùng lệnh 01; duyệt 3 cấp bịa (spec: Admin duyệt) |

## Flow liên quan

| Flow | Ảnh | Kết luận |
|---|---|---|
| F-05 Hiệu suất → lương → chi | [F-05-performance-payroll-flow.png](../flows/F-05-performance-payroll-flow.png) | **KHÔNG ĐẠT** |
| F-08 Thay đổi quản lý tòa | [F-08-assignment-scope-flow.png](../flows/F-08-assignment-scope-flow.png) | ĐẠT CÓ LƯU Ý |

Tham chiếu phong cách: [Design System](../00-design-system/00-timohouse-design-system.png).
