# Chuẩn hóa Sidebar và phân quyền cho bản Demo dùng Mock Data

## Tóm tắt

Giai đoạn hiện tại chỉ xử lý frontend demo:

- Tiếp tục dùng dữ liệu seed/local store.
- Chưa tích hợp API, database, JWT hoặc backend authorization.
- Sidebar thay đổi theo tài khoản demo.
- Router, dữ liệu hiển thị và action đều kiểm tra quyền phía frontend.
- Cấu trúc đủ gọn để sau này thay nguồn mock bằng API mà không phải thiết kế lại sidebar.

## Thay đổi chính

### 1. Kiến trúc navigation

Không duy trì 7 sidebar độc lập chứa route và permission bị lặp. Tách thành:

- `NAV_ITEMS`: định nghĩa chức năng dùng chung gồm `key`, `label`, `icon`, `href`, `permission`, `phase`.
- `ROLE_NAV_LAYOUT`: định nghĩa nhóm và thứ tự menu cho từng role bằng `key`.
- `ROLE_POLICY`: danh sách permission của từng role.
- `DATA_SCOPE`: cách lọc mock data theo tài khoản đang đăng nhập.

Luồng render:

```text
Mock session
→ Xác định role
→ Lấy layout của role
→ Ghép NAV_ITEMS
→ Lọc permission
→ Lọc phase
→ Bỏ nhóm rỗng
→ Render sidebar
```

Launcher và Quick Create dùng cùng `ROLE_POLICY`, không khai báo quyền riêng.

### 2. Sidebar theo từng role

- **Admin — 6 mục cấp một:** Tổng quan; Quản lý cho thuê; Kinh doanh; Tài chính; Vận hành; Báo cáo. Công cụ quản trị đặt trong Launcher.
- **Ops — 6 mục:** Công việc của tôi; Phòng & tòa nhà; Khách thuê & hợp đồng; Tài chính vận hành; Bảo trì & tài sản; Hỗ trợ kinh doanh. Bổ sung Lead và Inventory.
- **Accountant — 5 mục:** Công việc của tôi; Tài chính; Dữ liệu & đối soát; Báo cáo; Tra cứu. Bổ sung Maintenance và Inventory.
- **Sale — 3 mục:** Công việc của tôi; Kinh doanh; Tra cứu.
- **Kỹ thuật — 3 mục:** Công việc của tôi; Công việc kỹ thuật; Tra cứu.
- **HR — 3 mục:** Công việc của tôi; Nhân sự; Tra cứu.
- **Cổ đông — 2 mục:** Tổng quan đầu tư; Đầu tư.

Mỗi chức năng có một entry point chính trong sidebar hoặc Launcher, không xuất hiện trùng ở cả hai.

### 3. Scope dữ liệu mock

Sử dụng trực tiếp dữ liệu hiện có:

- Ops: lọc theo `users.buildingIds`.
- Sale thường: lọc theo `saleId === session.userId`.
- Trưởng Sale: xác định qua `salesTeams.leadUserId`, được xem dữ liệu người dùng cùng `teamId`.
- Kỹ thuật: nối `employees.userId` với `buildingAssignments` để lấy tòa phụ trách; chỉ cập nhật sự cố giao cho mình hoặc nhận sự cố chưa phân công thuộc tòa đó.
- Cổ đông: nối `shareholders.userId` với cam kết vốn và dự án để xác định phạm vi.
- Admin và Accountant: không giới hạn tòa đối với nghiệp vụ được cấp quyền.
- HR: chỉ truy cập nghiệp vụ nhân sự và dữ liệu tòa phục vụ phân công.

Mọi KPI, bộ đếm, dashboard, dropdown và bảng phải lọc dữ liệu trước khi tính toán.

### 4. Router và action frontend

Thứ tự guard:

```text
Login → Permission → Data scope → Phase → Render
```

- Chưa đăng nhập: về trang login.
- Sai quyền hoặc ngoài scope: trang 403.
- Có quyền nhưng phase chưa bật: trang “Sắp ra mắt”.
- Đủ điều kiện: render trang.

Chuẩn hóa internal interface:

```javascript
can(permission, resourceContext?)
need(permission, resourceContext?)
filterByScope(collection, records, action?)
```

Tất cả action thay đổi mock data phải gọi `need()` trước khi gọi `store.add`, `store.update` hoặc `store.remove`. Việc ẩn nút không được xem là kiểm soát quyền.

Sửa các lỗi điều hướng hiện tại:

- Kỹ thuật phải thực sự lọc “Sự cố được giao”; không chỉ thêm `?assignee=me`.
- Sale chỉ nhìn thấy dữ liệu cá nhân/team.
- KPI Cổ đông chỉ tính trên dự án được phép xem.
- Sửa `menuKey` của OCR, Inventory và Shareholders.
- Liên kết ROI của Cổ đông trỏ đúng `/investment/roi`.
- Router kiểm tra permission trước khi hiển thị thông báo phase.

## Kiểm thử demo

- Kiểm thử `7 role × 65 route × trạng thái phase`.
- Đăng nhập lần lượt từng tài khoản demo và đối chiếu sidebar.
- Truy cập URL trực tiếp để xác nhận route trái quyền trả 403.
- Gọi trực tiếp action trái quyền và xác nhận mock state không thay đổi.
- Kiểm tra dữ liệu chéo:
  - Ops không thấy tòa ngoài phân công.
  - Sale không thấy lead và hoa hồng của người khác.
  - Kỹ thuật không xử lý sự cố của kỹ thuật viên khác.
  - Cổ đông không thấy thông tin cá nhân và phần vốn của người khác.
- Kiểm tra dashboard, badge, bộ lọc, tìm kiếm và dropdown không làm lộ dữ liệu ngoài scope.
- Chạy `npm run check` sau khi hoàn tất.

## Giả định

- Giữ cơ chế đăng nhập demo và local storage hiện tại.
- Không tạo hoặc kết nối API.
- Không triển khai database, token, middleware backend hay migration.
- Reset demo sẽ phục hồi seed data và tài khoản mẫu.
- Phân quyền frontend nhằm mô phỏng đúng nghiệp vụ và UX; chưa được xem là bảo mật production.
