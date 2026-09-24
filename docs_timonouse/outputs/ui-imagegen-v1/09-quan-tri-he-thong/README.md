# 09 — Quản trị hệ thống

**Menu theo thứ tự thao tác (spec §6.2):** Đăng nhập (cửa vào) · Danh mục, tham số, user/quyền, import jobs, audit

**UI ID:** UI-00, UI-33 · **Không đạt:** 0/2 ảnh chính. Chi tiết lỗi xem [`../AUDIT.md`](../AUDIT.md).

| # | UI ID | Màn hình | Ảnh | Kết luận | Lỗi chính |
|---:|---|---|---|---|---|
| 1 | UI-00 | Đăng nhập | [UI-00-login.png](UI-00-login.png) | ĐẠT CÓ LƯU Ý | Thiếu băng Dữ liệu mô phỏng và nút Gửi lại OTP |
| 2 | UI-33 | User, quyền, tham số, jobs, audit | [UI-33-settings-permissions-audit.png](UI-33-settings-permissions-audit.png) | ĐẠT CÓ LƯU Ý | Đủ ①–⑦; thiếu cột ngày hiệu lực của tham số |

## Flow liên quan

| Flow | Ảnh | Kết luận |
|---|---|---|
| F-08 Thay đổi quản lý tòa | [F-08-assignment-scope-flow.png](../flows/F-08-assignment-scope-flow.png) | ĐẠT CÓ LƯU Ý |

## Tham chiếu dùng chung

- [S-01-data-permission-lock.png](../states/S-01-data-permission-lock.png)
- [S-02-forms-approval.png](../states/S-02-forms-approval.png)

Tham chiếu phong cách: [Design System](../00-design-system/00-timohouse-design-system.png).
