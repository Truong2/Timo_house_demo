# TimoHouse UI Redesign Specification v2.5

**Trạng thái:** Draft for Stakeholder Sign-off  
**Ngày lập:** 16/09/2026  
**Ngày cập nhật:** 17/09/2026  
**Document owner:** Product Owner TimoHouse  
**Người soạn:** UX/UI & Product Design  
**Người phê duyệt:** Chưa chỉ định  
**Ngày phê duyệt:** Chưa phê duyệt  
**Phạm vi:** Toàn bộ mockup tương tác Phase 1, Phase 2 và Phase 3 (67 route, 7 vai trò)  
**Đối tượng ưu tiên:** Nhân viên nghiệp vụ sử dụng hằng ngày; đồng thời giữ khả năng demo roadmap P2/P3 cho khách hàng (xem mục 18)  
**Nền tảng chính:** Desktop và laptop, độ rộng 1366-1920 px  
**Hướng thiết kế:** Enterprise tinh gọn  
**Chiến lược:** Giữ tương thích nghiệp vụ, dữ liệu và route hiện có; thay đổi kiến trúc thông tin và UX; được phép **thêm additive** collection/field và route được kiểm soát tại Phụ lục D

> Tài liệu này kế thừa v2.3, bổ sung lớp Business Clarification v2.4 từ câu trả lời làm rõ nghiệp vụ của khách hàng (06/09/2026) và v2.5 (mô hình bản ghi báo cáo, mục 8.5). Thay đổi xem Phụ lục C/D/E.

### Lịch sử phiên bản

| Phiên bản | Ngày | Nội dung | Trạng thái |
| --- | --- | --- | --- |
| v2.0 | 16/09/2026 | Định hướng redesign ban đầu | Superseded |
| v2.1 | 16/09/2026 | Bổ sung baseline, route mapping, rollout và tiền đề kỹ thuật | Superseded |
| v2.2 | 16/09/2026 | Khóa contract UX, decision log, acceptance, test và traceability | Superseded |
| v2.3 | 16/09/2026 | Bổ sung dimension, metric, preset đối soát và Trung tâm Tài liệu theo audit workbook | Superseded |
| v2.4 | 17/09/2026 | Đối chiếu câu trả lời làm rõ nghiệp vụ 06/09/2026: xác nhận rule, sửa ngữ nghĩa T/S/G, thêm contract thông báo/chủ nhà/cổ đông, decision phân quyền D-13..D-18, Phụ lục E | Draft for Review |
| v2.5 | 17/09/2026 | Trung tâm báo cáo chuyển sang mô hình bản ghi báo cáo: tạo theo loại + tham số (Từ kỳ–Đến kỳ), snapshot lúc tạo, xem trước và tải CSV; route `/reports/new`, `/reports/runs/:id`; collection `reportRuns` | Current |

---

## 1. Mục đích tài liệu

Tài liệu này mô tả chi tiết phương án cải tổ UI/UX của TimoHouse để stakeholder review trước khi triển khai. Đây không phải tài liệu thay đổi nghiệp vụ.

Mục tiêu của redesign:

1. Giúp người dùng biết ngay việc cần làm tiếp theo.
2. Giảm lượng thông tin phải đọc trên mỗi màn hình.
3. Tăng tốc độ tìm kiếm, lọc và xử lý hồ sơ.
4. Tạo trải nghiệm riêng phù hợp với từng vai trò.
5. Chuẩn hóa toàn bộ 3 phase trên cùng một design system.
6. Bảo toàn các luồng nghiệp vụ, dữ liệu demo, RBAC và hash route hiện tại.

### 1.1. Kết quả mong đợi và baseline hiện tại **[v2.2]**

| Tiêu chí | Hiện tại (đo trên mockup) | Mục tiêu |
| --- | --- | --- |
| Số mục sidebar Admin | 35 (P1) đến 41 (P1+P2+P3) | ≤ 7 mục nghiệp vụ cấp cao, không tính launcher `Phân hệ & Quản trị` |
| Primary action trên page header | Hóa đơn: 2; Công nợ: 0 | Đúng 1 |
| Thống kê lặp giữa tab và KPI | Phòng 5/6 tab trùng KPI; Hợp đồng 4/4 | 0 |
| Số cột mặc định bảng chính | Phòng 11, Hợp đồng 12, Hóa đơn 12, Công nợ 11 | ≤ 7 cột nghiệp vụ; không tính checkbox và cột action |
| Cuộn ngang ở 1366 px | Có (td `nowrap`) | Không, với cấu hình cột mặc định |
| Click từ Dashboard đến 1 việc cần xử lý | 2-3 (qua chuông thông báo hoặc sidebar → tab) | ≤ 2 |
| Tương phản WCAG AA cho nội dung và control chính | Chưa đo | Đạt |

Cách đo: đếm thủ công trên 6 reference screens (mục 15, giai đoạn 0) trước và sau; ghi vào bảng này khi bàn giao.

### 1.2. Ngoài phạm vi

- Không viết lại ứng dụng sang React, Vue hoặc framework khác.
- Không thay đổi business rule, công thức tài chính hoặc state machine.
- Không thay đổi tên collection, entity ID hoặc cấu trúc dữ liệu nghiệp vụ.
- Không xóa hoặc đổi URL hiện tại của các màn hình.
- Không triển khai dark mode trong phiên bản này.
- Không yêu cầu tất cả luồng nghiệp vụ hoạt động đầy đủ trên điện thoại.
- **[v2.1]** Không thêm nghiệp vụ mới (ví dụ màn phân phối lợi nhuận riêng chỉ được tạo nếu dữ liệu `distributions` hiện có đủ để hiển thị; không thêm seed mới).
- **[v2.4]** Các yêu cầu mới phát sinh từ câu trả lời của khách hàng (công cụ tự đặt quy tắc gửi thông báo Q34, đồng bộ hội thoại Zalo Q37, khấu hao khoản đầu tư Q6/Q15) chỉ được mô tả ở mức UI contract trong tài liệu này; phase triển khai và cam kết thương mại chốt qua D-16/D-17 tại mục 18.

---

## 2. Hiện trạng và vấn đề cần giải quyết

Các nhận định dưới đây đã được đối chiếu với source `mockup/js` và `mockup/css`.

### 2.1. Điều hướng

- Sidebar hiện có 1 mục đứng riêng + 8 nhóm, tổng 41 item (`ui/layout.js` `L.MENU`); Admin thấy 35-41 mục cùng lúc.
- Phase 1, 2 và 3 được tổ chức theo module kỹ thuật, chưa theo công việc của từng vai trò.
- Công cụ demo (phase switch, reset, JSON, kịch bản) nằm trong footer sidebar.
- Một số chức năng cùng hành trình nằm ở nhóm khác nhau (Zalo vừa ở `Thông báo` vừa ở `Cấu hình`; `Tài sản` nằm trong `Đầu tư`).
- Không có chế độ thu gọn sidebar; chỉ có accordion một nhóm mở và off-canvas ở mobile.

### 2.2. Mật độ thông tin

Màn danh sách thường xếp liên tiếp: page header nhiều action → tab trạng thái → bộ lọc inline 4-6 field → dãy KPI card (trùng tab) → bảng 11-12 cột → 2-3 action mỗi dòng. Người dùng phải quét qua nhiều lớp trước khi đến dữ liệu cần thao tác.

### 2.3. Thứ bậc hành động

- Nhiều nút dùng cùng màu xanh primary (Hóa đơn có 2 primary trên header).
- Action trên dòng bảng chưa phản ánh trạng thái đối tượng một cách nhất quán; menu ba chấm tới 7 mục.
- Chưa có row click mở detail; link chỉ nằm ở cột mã.

### 2.4. Dashboard

- Một route `/dashboard` dùng chung cho 7 vai trò: 8 KPI, 2 biểu đồ, 1 bảng quá hạn; số delta hard-code.
- Dashboard thiên về báo cáo tổng hợp hơn công việc cần xử lý.
- Danh sách việc cần xử lý theo quyền/phase đã tồn tại dưới dạng `Q.todo()` trong chuông thông báo nhưng chưa được đưa lên dashboard.

### 2.5. Màn OCR

- Bố cục tài liệu/form song song đúng hướng nhưng form hiển thị toàn bộ 23 trường đang render (trong 29 trường được định nghĩa; 6 trường nhóm `meta` chưa có trong form).
- Confidence chỉ hiện dạng tooltip trên chip `Cần kiểm tra`.
- Không có hàng đợi trường cần kiểm tra; chọn field không dẫn đến vị trí nguồn trên tài liệu; highlight chỉ có ở trang 1.
- Mọi thao tác (đổi field, trang, zoom) re-render toàn trang nên mất focus.

---

## 3. Nguyên tắc thiết kế bắt buộc

### 3.1. Task first

Mỗi màn hình phải trả lời được ba câu hỏi: Tôi đang ở đâu? Việc quan trọng nhất trên màn hình này là gì? Tôi cần làm gì tiếp theo?

### 3.2. Progressive disclosure

- Chỉ hiển thị thông tin cần cho quyết định hiện tại.
- Bộ lọc nâng cao, thống kê phụ, lịch sử và metadata được mở khi cần.
- Form dài chia thành section hoặc step; section hoàn tất có thể thu gọn.

### 3.3. One primary action

- Mỗi page header chỉ có một CTA primary.
- Action phụ dùng outline, ghost hoặc menu ba chấm.
- Nút destructive chỉ dùng màu đỏ khi thực sự gây thay đổi khó hoàn tác.

### 3.4. Role relevance

- Navigation, dashboard, quick action và default filter phải phản ánh vai trò.
- Không hiển thị chức năng người dùng **không có quyền** chỉ để sau đó disable.
- **[v2.1]** Chức năng thuộc **phase đang tắt** là ngoại lệ có chủ đích: hiển thị dạng teaser tại launcher `Phân hệ & Quản trị` theo quyết định ở mục 18, không hiển thị trong 7 mục nghiệp vụ.
- Permission ở UI không thay thế route guard hiện tại.

### 3.5. Preserve context

- Khi quay lại danh sách, giữ tab, filter, sort, page và cột đang chọn.
- Khi mở detail từ danh sách, có đường quay lại đúng context trước đó.
- Form dài phải giữ draft và cảnh báo trước khi rời trang nếu có thay đổi chưa lưu (yêu cầu hạ tầng tại mục 11.2).

---

## 4. Kiến trúc điều hướng mới

### 4.1. App shell

#### Sidebar

- Rộng 224 px khi mở và 72 px khi thu gọn (chế độ mới, xem 11.4).
- Logo nằm trên cùng; nút thu gọn đặt cạnh logo.
- **[v2.2] Mô hình 2 cấp, không dùng hub page:** cấp 1 là mục nghiệp vụ (tối đa 7, không tính launcher `Phân hệ & Quản trị`); cấp 2 là submenu accordion tối đa 6 destination.
- Mục cấp 1 có submenu chỉ mở/đóng submenu, **không tự điều hướng**. Destination đầu tiên phải là item có nhãn rõ ràng; không gắn hai hành vi mở nhóm và điều hướng vào cùng một click target.
- Khi thu gọn, click hoặc focus vào icon cấp 1 mở flyout; hover chỉ là hỗ trợ. Flyout đóng bằng `Esc`, click ra ngoài hoặc chọn destination. Tooltip chỉ dùng để giải thích icon, không chứa action độc lập.
- Từ sidebar mở, mọi destination nằm trong tối đa 2 click: mở nhóm và chọn item. Destination trực tiếp chỉ cần 1 click.
- Chỉ hiển thị destination phù hợp với role và phase đang bật; destination thuộc phase tắt chuyển vào launcher `Phân hệ & Quản trị` (mục 18).
- Nút `Phân hệ & Quản trị` cố định trên topbar, mở popover (không phải route) chứa các destination còn lại mà role có quyền.
- Nhãn customer-facing là `Phân hệ & Quản trị`; mô tả là “Truy cập các phân hệ nghiệp vụ và thiết lập quản trị hệ thống.” Không dùng từ “Ứng dụng” vì đây là các module của cùng một sản phẩm.
- Launcher loại trừ destination đang có trên sidebar của role hiện tại; mỗi destination chỉ có một điểm vào chính trong cùng trạng thái phase.
- Footer chỉ giữ phiên bản sản phẩm và link trợ giúp.
- Công cụ demo chuyển vào route mới `#/settings/tools` (Phụ lục B), có nhãn `Chỉ dùng cho demo`, chỉ role có `advancedTools`.

#### Topbar **[v2.1]**

Thứ tự từ trái sang phải:

1. Nút mở menu ở breakpoint nhỏ.
2. Breadcrumb rút gọn.
3. Global search (`Ctrl/Cmd + K`, giữ command palette hiện có).
4. Quick create theo vai trò (menu `+`), danh sách item:
   - Admin: Hợp đồng, Hóa đơn theo kỳ, Ghi nhận thu, Đợt gửi Zalo, Sự cố (P2).
   - Vận hành: Hợp đồng, Ghi nhận thu, Hoàn cọc, Sự cố (P2), Giữ chỗ (P2).
   - Kế toán: Hóa đơn theo kỳ, Ghi nhận thu, Chi phí, Nhập bảng kê (P2).
   - Kinh doanh: Lead, Lịch xem, Giữ chỗ, Chốt thuê.
   - Kỹ thuật: Sự cố, Lịch bảo dưỡng.
   - Nhân sự: Nhân viên, Bảng lương.
   - Cổ đông: không có quick create.
5. Nút `Phân hệ & Quản trị`, mở popover các phân hệ nghiệp vụ và thiết lập quản trị ngoài điều hướng chính.
6. Nút `Hướng dẫn thao tác` (giữ guide panel 360 px hiện có; đây là công cụ walkthrough F01-F19).
7. Notification center (giữ `Q.todo()`).
8. User menu (đổi vai trò demo, tài khoản, đăng xuất).

`Kỳ báo cáo` không còn là control toàn cục trên topbar. Quy tắc mới xem 4.4.

#### Content area

- Chiều rộng sử dụng toàn bộ không gian còn lại.
- Padding mặc định: 24 px ở desktop, 20 px ở laptop nhỏ và 16 px ở tablet.
- Không giới hạn content bằng max-width trên màn danh sách.
- Form và màn đọc nội dung có thể giới hạn 1200-1440 px để dễ đọc.

### 4.2. Navigation theo vai trò **[v2.1 – đã ánh xạ với route và permission thật]**

Ký hiệu: `→ route` là đích đến; `(P2)`/`(P3)` chỉ hiện khi phase bật; `[RO]` read-only theo `P2_READ`. Chi tiết đầy đủ xem Phụ lục A.

#### Quản trị viên (6 mục sidebar + launcher)

1. Tổng quan → `/dashboard` (toggle `Công việc` / `Điều hành` bằng query `view`)
2. Quản lý cho thuê: Phòng, Tòa nhà, Khách thuê, Hợp đồng, OCR hợp đồng (P2), Chủ nhà & đối tác
3. Kinh doanh (P2): Tổng quan kinh doanh → `/crm`, Lead, Lịch xem, Giữ chỗ, Giao dịch & hoa hồng
4. Tài chính: Hóa đơn, Thu tiền & công nợ, Hoàn cọc, Quản lý cọc (P2), Chi phí, Ngân hàng (P3)
5. Vận hành: Sự cố (P2), Lịch bảo dưỡng (P2), Tài sản (P3), Kiểm kê (P3), Thông báo Zalo
6. Báo cáo: Báo cáo Phase 1, Trung tâm báo cáo (P2), Thu chi (P2)
Launcher topbar `Phân hệ & Quản trị`: Nhân sự (P3), Đầu tư (P3), Thiết lập (Tài khoản, Danh mục, Import, Data Job (P2), Nhập bảng kê (P2), Chuyển số dư (P2), Thiết lập thông báo Zalo, Công cụ demo)

Lý do Zalo nằm ở `Vận hành` thay vì launcher: đợt nhắc nợ là tác vụ định kỳ hằng tuần của Admin. `Nhập bảng kê`/`Chuyển số dư` là tác vụ khởi tạo, không hằng ngày, nên vào Thiết lập.

#### Vận hành (6 mục)

1. Công việc của tôi → `/dashboard`
2. Phòng & tòa nhà: Phòng, Tòa nhà, Chủ nhà & đối tác
3. Khách thuê & hợp đồng: Khách thuê, Hợp đồng, OCR hợp đồng (P2)
4. Tài chính vận hành: Hóa đơn [xem], Thu tiền & công nợ, Hoàn cọc, Quản lý cọc (P2), Chi phí
5. Bảo trì & tài sản (P2/P3): Sự cố, Lịch bảo dưỡng, Tài sản (P3), Kiểm kê (P3)
6. Lịch xem & giữ chỗ (P2): Lịch xem phòng, Giữ chỗ, Lead [xem]

Mục `Báo cáo vận hành` của v2.0 bị bỏ vì role `ops` không có `reports.view`/`reports.hub`; nếu muốn có, phải mở permission (ngoài phạm vi).

#### Kế toán (5 mục)

1. Công việc của tôi → `/dashboard`
2. Tài chính: Hóa đơn, Thu tiền & công nợ, Hoàn cọc, Quản lý cọc (P2), Chi phí, Ngân hàng (P3)
3. Dữ liệu & đối soát: Nhập bảng kê (P2), Chuyển số dư (P2), Data Job (P2)
4. Báo cáo: Báo cáo Phase 1, Trung tâm báo cáo (P2), Thu chi (P2)
5. Tra cứu: Phòng, Tòa nhà, Khách thuê, Hợp đồng, Chủ nhà & đối tác [xem]
- `Phân hệ & Quản trị`: Lịch sử Zalo, Danh mục dùng chung, Import, Kinh doanh (P2), Bảo trì/Tài sản/Kiểm kê (P2/P3) [xem], Lương thưởng (P3, duyệt), Đầu tư (P3)

#### Kinh doanh (3 mục)

1. Công việc của tôi → `/dashboard`
2. Kinh doanh: Hiệu suất kinh doanh, Lead, Lịch xem phòng, Giữ chỗ, Giao dịch & hoa hồng
3. Tra cứu [RO]: Phòng, Tòa nhà, Khách thuê, Hợp đồng

#### Kỹ thuật (3 mục)

1. Công việc của tôi → `/dashboard`
2. Công việc kỹ thuật: Sự cố được giao, Lịch bảo dưỡng
3. Tra cứu [RO]: Phòng, Tòa nhà, Tài sản/Kiểm kê (P3), Chi phí liên quan

#### Nhân sự (3 mục)

1. Công việc của tôi → `/dashboard`
2. Nhân sự: Nhân viên, Chấm công, Lương thưởng
3. Tra cứu: Tòa nhà [xem]

Mục `Phân công` và `Báo cáo nhân sự` của v2.0 bị bỏ: không có route và role `hr` không có quyền báo cáo.

#### Cổ đông (2 mục)

1. Tổng quan đầu tư → `/dashboard`
2. Đầu tư: Dự án, Vốn góp & phân phối, Hiệu quả đầu tư

Vai trò Cổ đông tiếp tục ở chế độ read-only và chỉ thấy dữ liệu trong phạm vi dự án được cấp quyền.

> **[v2.4] Ghi chú phân quyền:** câu trả lời Q1 (công nợ, lương, hoa hồng chỉ Admin và Kế toán được xem/sửa), Q23 (Cổ đông, Admin, Kế toán, trưởng phòng xem báo cáo lợi nhuận) và Q33 (Admin và Kế toán nhập/duyệt kiểm kê) có thể thay đổi navigation của Vận hành, Kinh doanh, Kế toán và Cổ đông. Các thay đổi này được ghi tại D-13/D-14/D-15 (mục 18.1). Navigation ở 4.2 và Phụ lục A **giữ nguyên** cho đến khi các decision đó Approved.

### 4.3. Route và quyền **[v2.1]**

- Giữ nguyên toàn bộ 63 hash route hiện tại; không xóa, không đổi.
- Được **thêm** route mới và query parameter mới theo Phụ lục B; mọi route mới phải có `permission` và `phase` trong route meta.
- `TH.auth.can()` và route metadata tiếp tục là nguồn quyết định quyền; không mở rộng `PERMS`.
- Navigation config mới lọc theo `permission`, `phase`, `role` và scope tòa nhà.
- Truy cập URL không có quyền vẫn hiển thị màn unauthorized hiện có.

### 4.4. Kỳ báo cáo **[v2.1]**

- `meta.period` vẫn là **state dùng chung** cho toàn ứng dụng; chỉ thay đổi vị trí control.
- Control `Kỳ` đặt tại page header (bên phải title) của các màn: Dashboard (view `Điều hành` của Admin, dashboard Kế toán), Hóa đơn, Thu tiền & công nợ, Chi phí, Thu chi, Báo cáo Phase 1, Trung tâm báo cáo và từng report, Lương thưởng, Hiệu quả đầu tư, Ngân hàng & đối soát.
- Đổi kỳ ở bất kỳ màn nào cập nhật `meta.period`; các màn khác dùng cùng giá trị. Kế toán không phải chọn lại kỳ khi chuyển màn.
- Màn không dùng kỳ không hiển thị control và không bị lọc theo kỳ (giữ hành vi `router.applyFilter` hiện tại).
- Trạng thái kỳ khóa hiển thị cạnh control kỳ.

---

## 5. Design system mới

### 5.1. Màu sắc

#### Màu thương hiệu

- Primary 600: `#2563EB` (giữ nguyên), Primary 700: `#1D4ED8`, Primary 50: `#EFF6FF`.
- Sidebar background: `#0F2854`, màu phẳng, thay gradient hiện tại.

#### Neutral

- App background `#F6F8FC`, Surface `#FFFFFF`, Border `#E2E8F0`.
- Text primary `#172B4D`, secondary `#475569`, muted `#64748B`.

#### Semantic

- Success chỉ dùng cho trạng thái hoàn tất/hợp lệ; Warning cho cần chú ý/sắp đến hạn; Danger cho lỗi, quá hạn nghiêm trọng hoặc destructive; Info cho đang xử lý hoặc hướng dẫn.
- Không dùng semantic color để trang trí KPI không có ý nghĩa trạng thái.
- Bỏ toàn bộ số `delta` hard-code trên KPI; chỉ hiển thị delta khi có dữ liệu kỳ trước thật.

### 5.2. Typography **[v2.1]**

- Font: Inter, fallback system font.
- Page title 24/32/700; Section title 16/24/600; Body 14/22/400; Label 13/18/500; Caption 12/18/400.
- **Bảng dữ liệu: 13 px / 20 px** (hiện tại 12.5 px); header bảng 12 px uppercase được phép.
- Không dùng chữ nhỏ hơn 12 px cho nội dung cần đọc.
- Số tiền dùng `font-variant-numeric: tabular-nums`, căn phải.

### 5.3. Spacing và surface

- Lưới 8 px: 4, 8, 12, 16, 24, 32.
- Card radius 10 px; input/button radius 8 px.
- Shadow chỉ dùng cho popover, drawer, modal hoặc sticky surface. Card thông thường dùng border.
- Giảm số lượng card lồng nhau.

### 5.4. Control

- Input/select/button mặc định cao 40 px (hiện 38 px).
- Nút icon tối thiểu 36 x 36 px; vùng bấm thực tế tối thiểu 40 px.
- Primary button chỉ xuất hiện một lần trong page header hoặc sticky footer.
- Label luôn hiển thị; placeholder không thay thế label.
- Validation hiển thị tại field và có summary ở đầu section khi submit lỗi.

### 5.5. Trạng thái tiêu chuẩn

Mọi page/component phải có: loading/processing; empty state có hướng xử lý; filtered-empty có nút xóa filter; error có retry; permission state; disabled có giải thích; success feedback bằng toast và cập nhật UI tại chỗ.

---

## 6. Template màn hình chuẩn

### 6.1. Dashboard theo vai trò (= `Công việc của tôi`) **[v2.1]**

Route `/dashboard` render theo role đăng nhập; không tạo route riêng cho `Công việc của tôi`.

Thứ tự nội dung:

1. Lời chào, ngày làm việc và phạm vi dữ liệu (tòa được giao).
2. `Cần xử lý ngay`: tối đa 5 loại công việc, có số lượng và mức ưu tiên; nguồn dữ liệu là các selector đang cấp cho `Q.todo()`.
3. `Công việc hôm nay`: danh sách ngắn có CTA tại dòng.
4. 3-4 KPI phù hợp vai trò.
5. Insight hoặc biểu đồ phụ, mặc định dưới fold.

Admin có toggle `Công việc` / `Điều hành` (`?view=work|exec`); view `Điều hành` giữ 4 KPI + 2 biểu đồ hiện có và control kỳ. Dashboard không hiển thị đồng thời nhiều nhóm biểu đồ quản trị; link `Xem báo cáo` dẫn đến report tương ứng.

#### Work Queue Matrix **[v2.2]**

Work queue không được tự suy diễn từ tổng `Q.todo().total`. Mỗi item phải có selector, role, ưu tiên, route và CTA xác định. Nếu một record thỏa nhiều điều kiện, chỉ giữ item có mức ưu tiên cao nhất theo `entityType + entityId`.

Thứ tự chung: `Critical` → `High` → `Medium` → hạn gần nhất → thời điểm tạo cũ nhất. Dashboard hiển thị tối đa 8 record trong `Cần xử lý ngay`; link `Xem tất cả` mở đúng filtered list.

| Role | Công việc | Điều kiện/nguồn dữ liệu | Ưu tiên | Route | CTA |
| --- | --- | --- | --- | --- | --- |
| Admin | Hóa đơn quá hạn | `Q.invOverdue(i)` | Critical khi >15 ngày; High còn lại | `/receivables?overdue=1` | Xem công nợ |
| Admin | Hoàn cọc chờ xử lý | `refund.status in pending,approved` | High | `/refunds` theo status | Xem hồ sơ |
| Admin | Hợp đồng sắp hết hạn | `Q.contractStatus(c) === expiring` | High nếu ≤14 ngày; Medium còn lại | `/contracts?status=expiring` | Xem/Gia hạn |
| Admin | Tin Zalo lỗi | Message failed chưa retry và chưa có retry record | High | `/zalo/history?status=failed` | Xem lỗi |
| Admin | Bảo dưỡng đến hạn | `Q.schedulesDue()` khi P2 bật | Medium | `/maintenance/schedules?status=due_soon` | Xem lịch |
| Admin, Kế toán **[v2.4]** | Kiểm kê cần xử lý | `Q.latestInventory()` đang thực hiện và `needsAction > 0`; kiểm kê chu kỳ 1 tháng/lần, Admin và Kế toán nhập/duyệt (Q33; dòng Kế toán phụ thuộc D-15) | High | `/assets/inventory/:id?status=needs_action` | Tiếp tục kiểm kê |
| Admin, Kế toán **[v2.4]** | Kỳ trả tiền chủ nhà đến hạn | `buildings.payCycle` (3/4/6 tháng) + `payDay`; cùng nguồn với event `landlord_due` (nhắc trước 5 ngày) (Q8) | High nếu ≤5 ngày; Medium nếu ≤15 ngày | `/landlords?due=1` | Xem lịch thanh toán |
| Vận hành | Phòng chờ dọn | `room.status === cleaning` trong scope | High | `/rooms?status=cleaning` | Xác nhận dọn xong |
| Vận hành | Hợp đồng sắp hết hạn | `Q.contractStatus(c) === expiring` trong scope | High/Medium theo số ngày | `/contracts?status=expiring` | Gia hạn |
| Vận hành | Hoàn cọc cần lập/sửa | `refund.status in draft,needs_edit` trong scope | High | `/refunds` theo status | Hoàn thiện hồ sơ |
| Vận hành | Sự cố chưa hoàn tất | Incident trong scope, status khác `done/cancelled` | High theo SLA; Medium còn lại | `/maintenance` theo status | Xem sự cố |
| Vận hành | Lịch xem hôm nay | Viewing scheduled hôm nay trong scope | Medium | `/crm/viewings?date=today` | Xem lịch |
| Kế toán | Hóa đơn nháp cần phát hành | `invoice.docStatus === draft` trong kỳ | High | `/invoices?status=draft` | Phát hành |
| Kế toán | Khoản thu quá hạn | `Q.invOverdue(i)` trong kỳ | Critical/High theo số ngày | `/receivables?overdue=1` | Ghi nhận thu |
| Kế toán | Hoàn cọc chờ duyệt/chi | `refund.status in pending,approved` | High | `/refunds` theo status | Duyệt/Ghi nhận chi |
| Kế toán | Giao dịch ngân hàng chưa khớp | `matchStatus in unmatched,check` khi P3 bật | High | `/finance/bank?status=unmatched` | Đối soát |
| Kế toán | Bảng lương chờ duyệt | Payroll kỳ hiện tại có status `review` | High | `/hr/payroll` | Duyệt bảng lương |
| Kinh doanh | Lead cần liên hệ | `Q.leadsToday()`, lọc `saleId` là user hiện tại | High cho lead hot; Medium còn lại | `/crm/leads/:id` | Gọi/Cập nhật |
| Kinh doanh | Lịch xem hôm nay | Viewing scheduled hôm nay của nhân viên kinh doanh | High khi sắp diễn ra ≤2 giờ; Medium còn lại | `/crm/viewings` | Xem lịch |
| Kinh doanh | Giữ chỗ sắp hết hạn | Hold active còn ≤2 ngày | High | `/crm/holds` | Chốt/Hủy giữ chỗ |
| Kinh doanh | Giao dịch chờ hợp đồng | `deal.status === pending_contract` của nhân viên kinh doanh | High | `/crm/deals/:id` | Tạo/Xem hợp đồng |
| Kỹ thuật | Sự cố được giao | Assignee là user hiện tại, chưa `done/cancelled` | Critical/High theo SLA | `/maintenance?assignee=me` | Cập nhật xử lý |
| Kỹ thuật | Bảo dưỡng đến hạn | `Q.schedulesDue()` được giao | Medium | `/maintenance/schedules` | Cập nhật lịch |
| Nhân sự | Thử việc sắp kết thúc | `Q.probationEnding(14)` | High nếu ≤3 ngày; Medium còn lại | `/hr/:id` | Xem hồ sơ |
| Nhân sự | Bảng công chưa xác nhận | Timesheet kỳ hiện tại status khác `confirmed` | High trước ngày chốt; Medium còn lại | `/hr/timesheet` | Hoàn thiện bảng công |
| Nhân sự | Bảng lương cần lập/gửi duyệt | Payroll chưa có hoặc status `draft` | High sau khi bảng công đủ | `/hr/payroll` | Lập/Gửi duyệt |
| Cổ đông | Kỳ đóng tiền nhà đến hạn **[v2.4]** | Contribution của cổ đông hiện tại có `st in due,overdue`; mỗi contribution kỳ = kỳ trả chủ nhà của tòa × tỷ lệ % vốn góp nhập tay (Q29/Q30) | High khi overdue; Medium khi due | `/investment/shareholders?tab=contributions` | Xem kỳ đóng tiền |
| Cổ đông | Phân phối mới | Distribution thuộc dự án được xem có status `approved/paid` và chưa mở trong phiên | Info | `/investment/shareholders?tab=distributions` | Xem phân phối |

Quy tắc action:

- Chỉ render CTA nếu `TH.auth.can()` cho phép; nếu chỉ có quyền xem, CTA dùng động từ `Xem`.
- Item thuộc phase tắt không được đưa vào work queue.
- Khi không có item, hiển thị empty state `Không có công việc cần xử lý` và tối đa hai quick link thường dùng theo role.
- Count trên notification center và Dashboard dùng cùng selector để không lệch số.
- **[v2.4]** `Vận hành / Phòng chờ dọn` bao gồm cả phòng phát sinh do hoàn cọc hoặc phá hợp đồng: khách xác nhận phải kiểm tra/dọn dẹp trước khi đưa phòng lại thị trường (Q21); dùng chung trạng thái `cleaning`, không thêm loại công việc mới.

### 6.2. List page

#### Cấu trúc

1. Page header: title, mô tả ngắn, một CTA primary, control kỳ nếu màn dùng kỳ.
2. Status tabs có count (nguồn thống kê duy nhất; bỏ KPI card trùng).
3. Toolbar: search, tối đa 2 filter thường dùng, nút `Bộ lọc`, `Cột`, `Xuất`.
4. Active filter chips.
5. Table hoặc board.
6. Pagination.

KPI dạng tiền (ví dụ tổng phải thu/đã thu ở Hóa đơn, Công nợ) không trùng tab nên được giữ, tối đa 3, hiển thị dạng dòng số liệu gọn dưới tabs thay vì card.

#### Quy tắc bảng **[v2.2]**

- Tối đa 7 **cột nghiệp vụ** hiển thị mặc định; không tính checkbox chọn dòng và cột action. Ngoại lệ chỉ được chấp nhận trong Default Column Matrix hoặc Decision Log.
- Cột identity nằm đầu và có thể gộp hai dòng thông tin.
- Click vào dòng mở detail; các control trong dòng ngăn row navigation.
- Chỉ có một inline action tùy trạng thái; action còn lại nằm trong menu ba chấm (tối đa 5 mục).
- Header sticky khi cuộn.
- Density hai mức: `Thoải mái` (row 48 px) và `Gọn` (row 40 px); mặc định `Gọn`.
- Column preference lưu theo user và table key.
- Cột trạng thái chỉ hiển thị khi tab đang chọn là `Tất cả`; ở tab cụ thể, cột này tự ẩn để nhường chỗ.

#### Default Column Matrix **[v2.2]**

| Route/nhóm | Cột nghiệp vụ mặc định | Cột tùy chọn | Hành vi tại 1180-1439 px |
| --- | --- | --- | --- |
| `/rooms` | Phòng/Tòa; Trạng thái; Khách hiện tại; Giá thuê; HĐ hết hạn; Người phụ trách | Tầng; Vật lý; Khả dụng | Ẩn Người phụ trách |
| `/tenants` | Khách thuê; Liên hệ; Phòng/HĐ hiện tại; Công nợ; Trạng thái; Người phụ trách | Ngày sinh; CCCD; Ngày tạo | Ẩn Người phụ trách |
| `/contracts` | Hợp đồng/Khách; Phòng/Tòa; Thời hạn; Giá thuê; Tiền cọc; Người phụ trách; Trạng thái ở tab Tất cả | Ngày bắt đầu; Ngày kết thúc; Nguồn | Ẩn Người phụ trách; trạng thái giữ nếu tab Tất cả |
| `/invoices` | Hóa đơn/Khách; Phòng/Tòa; Kỳ; Tổng tiền; Đã thu/Còn lại; Hạn thanh toán; Trạng thái | Ngày phát hành; Người tạo | Gộp Tổng tiền và Đã thu/Còn lại thành một cell hai dòng |
| `/receivables` | Khách/Hóa đơn; Phòng/Tòa; Phải thu; Đã thu/Còn lại; Hạn; Quá hạn; Trạng thái | Lần nhắc gần nhất; Người phụ trách | Ẩn Trạng thái khi đang ở tab cụ thể |
| `/refunds` | Hồ sơ/Khách; Phòng/Tòa; Tiền cọc; Khấu trừ; Hoàn dự kiến; Trạng thái; Cập nhật | Người lập; Người duyệt | Gộp Tiền cọc/Khấu trừ ở laptop nhỏ |
| `/crm/leads` list | Lead; Nhu cầu; Mức độ; Giai đoạn; Lần liên hệ; Nhân viên kinh doanh phụ trách | Nguồn; Tòa quan tâm; Ngày tạo | Ẩn người phụ trách với role Kinh doanh |
| `/maintenance` | Sự cố; Phòng/Tòa; Mức độ; SLA; Người xử lý; Trạng thái | Chi phí; Ngày tạo | Gộp Mức độ/SLA |
| `/assets` | Tài sản; Vị trí; Tình trạng; Giá trị; Lần kiểm kê; Trạng thái | Nhóm; Ngày mua; Khấu hao | Ẩn Giá trị với role không cần tài chính |
| `/hr` | Nhân viên; Phòng ban/Chức danh; Trạng thái; Ngày vào; Phân công chính; Liên hệ | Quản lý; Khu vực | Ẩn Liên hệ |
| Chấm công/Payroll/Đối soát | Được phép nhiều hơn 7 cột do bản chất ma trận | Cấu hình theo màn | Dùng sticky identity column và horizontal scroll có chủ đích; không áp dụng tiêu chí “không cuộn ngang” |

Checkbox và Action luôn cố định ở hai đầu khi có horizontal scroll. Action column không rộng quá 104 px và chỉ chứa một inline action cùng menu ba chấm.

### 6.3. Detail page

#### Summary header

- Tên/mã đối tượng, status chip, tối đa 4 metadata quan trọng.
- Một primary action phản ánh trạng thái hiện tại; secondary actions trong menu.

#### Nội dung

- Tab chính: Tổng quan, Tài chính/Tiến trình, Tài liệu, Lịch sử tùy entity; tối đa 6 tab.
- Chỉ detail page mới dùng layout hai cột khi sidebar có thông tin thực sự cần theo dõi.
- Timeline/audit không hiển thị mặc định nếu không liên quan công việc hiện tại.
- Đổi tab không re-render toàn trang (xem 11.1).

### 6.4. Wizard và form

- Stepper rút gọn chỉ hiển thị tên bước; mô tả đặt trong nội dung.
- Mỗi bước có một mục tiêu và không quá 8-10 field đang mở.
- Section hoàn thành có thể thu gọn.
- Footer sticky gồm `Quay lại`, trạng thái lưu nháp và CTA tiếp tục.
- Khi lỗi, focus vào field lỗi đầu tiên và hiển thị tổng số lỗi.
- Giữ query parameter và dữ liệu draft (hạ tầng tại 11.2).

### 6.5. Drawer và modal

- Drawer dùng cho filter nâng cao, activity, quick edit hoặc preview phụ.
- Modal chỉ dùng cho quyết định ngắn: xác nhận, nhập lý do, chọn một giá trị.
- Không đặt form nhiều section trong modal.
- Destructive confirmation phải nêu rõ đối tượng và hậu quả.

---

## 7. Thay đổi chi tiết Phase 1

### 7.1. Tổng quan

- Đổi từ dashboard báo cáo chung sang dashboard theo vai trò (6.1).
- Vận hành thấy phòng cần dọn, hợp đồng sắp hết hạn, hồ sơ chờ xử lý và sự cố (P2).
- Kế toán thấy khoản quá hạn, hóa đơn chờ phát hành, hoàn cọc chờ duyệt và kỳ chưa khóa.
- Admin chuyển giữa `Công việc` và `Điều hành`.
- Chỉ giữ tối đa 4 KPI; biểu đồ phòng và tiến độ thu chuyển vào view `Điều hành` và báo cáo chi tiết.

### 7.2. Tòa nhà và phòng

- Gộp `Tòa nhà` và `Phòng` dưới cùng mục cấp 1 (`Quản lý cho thuê` với Admin, `Phòng & tòa nhà` với Vận hành).
- Danh sách phòng bỏ dãy 5 KPI trạng thái vì đã có status tabs.
- Cột mặc định: Phòng/Tòa, Trạng thái (chỉ ở tab Tất cả), Khách hiện tại, Giá thuê, HĐ hết hạn, Người phụ trách, Action.
- Các field tầng, vật lý, khả dụng chuyển vào filter nâng cao hoặc column chooser.
- Inline action theo trạng thái: `Giữ chỗ`, `Tạo hợp đồng`, `Xem hợp đồng`, `Xác nhận dọn xong` hoặc `Xem sự cố`.
- Detail phòng giữ Tổng quan, Hợp đồng, Công nợ, Tài sản, Sự cố và Tài liệu dưới dạng tab (gộp `history` vào Hợp đồng, `services` vào Tổng quan để ≤ 6 tab).
- **[v2.4]** Filter và chip `Loại nhà` đổi nhãn thành `Nhóm tòa (T/S/G)`; giá trị suy ra từ ký tự đầu của `buildings.code` (T2, T3, S1, S2, G1, G2…). Bỏ các nhãn `Thuê lại chủ nhà / Sở hữu công ty / Góp vốn cổ đông` và bỏ chip giả định `U.assume()` trên cột này vì khách đã xác nhận (Q2, D-18).
- **[v2.4]** Tab Chủ nhà trong detail tòa hiển thị `Thời gian giữ giá` với tooltip “Khoảng thời gian chủ nhà không được tăng giá thuê đối với TimoHouse” (Q5) và `Kỳ thanh toán chủ nhà` (3/4/6 tháng, `buildings.payCycle`) kèm ngày đến hạn kế tiếp; ngày đến hạn là nguồn cho work queue `Kỳ trả tiền chủ nhà đến hạn` và event `landlord_due` (Q8).

### 7.3. Khách thuê

- Identity column gộp tên, điện thoại và mã khách.
- Hiển thị hợp đồng hiện tại, phòng, công nợ và trạng thái liên hệ.
- Thông tin cá nhân đầy đủ chuyển sang detail; tab mặc định của detail là `Tổng quan` (hiện tại là `Tài chính`).
- CTA chính trên detail phụ thuộc trạng thái: tạo hợp đồng, ghi nhận thu hoặc liên hệ.
- **[v2.4]** Tab `Tài chính` giữ nội dung hiện tại (hóa đơn theo kỳ, công nợ, tiền cọc và lịch sử thu) vì khách chưa có mô tả (Q11: “chưa có”); header tab gắn nhãn `Giả định – khách chưa xác nhận nội dung` cho đến khi có phản hồi.
- **[v2.4]** `Phân khúc` (sinh viên / người đi làm) là field nhập tay trên hợp đồng và đồng bộ sang hồ sơ khách (`tenants.segment`), không suy luận từ nghề nghiệp (Q25).

### 7.4. Hợp đồng **[v2.1]**

- Bỏ dãy KPI tổng số/hiệu lực/sắp hết hạn/dự thảo; status tabs là nguồn thống kê duy nhất.
- Cột mặc định: Hợp đồng/Khách, Phòng/Tòa, Thời hạn (`dd/mm/yyyy – dd/mm/yyyy`, dòng phụ: `còn N ngày` hoặc `quá hạn N ngày`), Giá thuê, Tiền cọc, Người phụ trách, Action. Cột Trạng thái chỉ ở tab Tất cả; cột `Còn lại` riêng bị bỏ vì trùng với Thời hạn.
- Hành động ưu tiên: dự thảo → Hoàn thiện; sắp hết hạn → Gia hạn; hiệu lực → Xem; đã kết thúc → Xem hồ sơ.
- Detail contract đưa công nợ, tiền cọc và thời hạn vào summary header.
- **[v2.4]** Mốc `Sắp hết hạn` = còn ≤ 35 ngày là hằng số toàn hệ thống (Q9); không có cấu hình theo tòa/loại phòng và không thêm field vào Thiết lập.
- **[v2.4]** Nút `Tải hợp đồng` trên list và bước 1 của wizard dẫn vào OCR (`/contracts/ocr`) làm luồng chính để đọc dữ liệu tự động từ file (Q10); nhập tay chỉ là fallback khi không có file hoặc OCR thất bại. Wizard tạo hợp đồng nhận prefill từ OCR như hiện tại.
- **[v2.4]** Section `Xe` trong wizard là repeater không giới hạn số dòng (`contracts.vehicles`, Q12); mỗi xe sinh một dòng phí gửi xe trên hóa đơn theo kỳ; summary header hợp đồng hiển thị badge `N xe` và detail hóa đơn cho phép mở danh sách biển số từ dòng phí gửi xe.
- **[v2.4]** Thuật ngữ giá: `Giá niêm yết` (`listPrice`, giá tiêu chuẩn của TimoHouse) và `Giá thuê` (`price`, giá thực tế khách đang thuê) (Q13); không dùng `Giá chốt` ngoài preset Đối soát.

### 7.5. Hóa đơn, thu tiền và công nợ

- Tách rõ ba intent: phát hành hóa đơn, ghi nhận thu và theo dõi công nợ.
- Hóa đơn chỉ còn một primary `Tạo hóa đơn theo kỳ`; `Xuất danh sách` chuyển sang toolbar.
- Công nợ có primary `Ghi nhận thu`; bỏ card search thứ hai, gộp vào toolbar.
- Dashboard Kế toán liên kết trực tiếp đến từng filtered list.
- Màn công nợ mặc định sort theo mức độ ưu tiên, sau đó số ngày quá hạn.
- Bulk action chỉ xuất hiện khi có row được chọn.
- Trạng thái kỳ khóa hiển thị tại header và giải thích action bị chặn.
- **[v2.4]** Định nghĩa tab `Công nợ` trên `/receivables`: hóa đơn đã phát hành từ 5 ngày trở lên và còn dư nợ (BR-07, khách xác nhận tại Q14). Tab count, work queue `Hóa đơn quá hạn` và nguồn đợt gửi Zalo `Cần xử lý công nợ` dùng cùng ngưỡng này.

### 7.6. Hoàn cọc và chi phí

- Hoàn cọc dùng timeline trạng thái ở detail.
- CTA thay đổi theo vai trò: Vận hành lập/gửi duyệt; Kế toán duyệt/yêu cầu sửa/ghi nhận đã hoàn.
- Chi phí mặc định hiển thị kỳ, tòa, nhóm, số tiền, trạng thái và người tạo.
- Phân bổ và khấu hao nằm trong drawer/detail, không chiếm cột mặc định.
- **[v2.4]** Wizard hoàn cọc prefill dòng khấu trừ `Khấu hao cố định 200.000đ/phòng` (nhóm `KH`, BR-12); số tiền không sửa được, chỉ có thể bỏ dòng kèm lý do. `Sửa chữa` (`SC`) và `Vệ sinh` (`VS`) nhập theo chi phí thực tế phát sinh và bắt buộc chứng từ (Q17).
- **[v2.4]** Người duyệt số tiền hoàn cọc cuối cùng là Admin hoặc Kế toán (Q17); CTA `Duyệt` render cho cả hai role theo `TH.auth.can()`, Vận hành chỉ lập/sửa.
- **[v2.4]** Chi phí mua sắm thiết bị/khoản đầu tư: hạch toán một lần trong báo cáo lợi nhuận dòng tiền, khấu hao theo thời gian trong báo cáo kinh doanh (Q6/Q15). Drawer chi phí hiển thị cả hai giá trị (`Chi thực tế kỳ này` và `Khấu hao kỳ này`) kèm biểu tượng thông tin mở công thức từ `TH.metrics`.

### 7.7. Zalo và thông báo **[v2.1]**

- Mục `Thông báo Zalo` trong sidebar trỏ `/zalo/history`; header có primary `Tạo đợt gửi` và secondary `Cấu hình`. Không tạo hub page.
- Màn tạo đợt gửi dùng wizard: Đối tượng → Nội dung → Kiểm tra → Gửi.
- Lịch sử gửi ưu tiên trạng thái lỗi và khả năng retry.
- Mã lỗi kỹ thuật hiển thị sau phần giải thích dễ hiểu.

#### Kênh gửi và dự phòng **[v2.4]**

- Kênh chính là Zalo ZNS (ZBS Template Message): mọi tin cá nhân hóa (hóa đơn, nhắc nợ, hết hạn hợp đồng, hoàn cọc) gửi theo số điện thoại của khách, không yêu cầu khách quan tâm OA (Q35, Q36). OA Broadcast chỉ dùng cho `Thông báo chung`.
- Template ZNS phải ở trạng thái `Đã duyệt` mới được chọn trong wizard; giữ luồng gửi duyệt/duyệt mẫu hiện có ở `/zalo/config`.
- Bước `Kiểm tra` của wizard hiển thị số khách chưa liên kết Zalo (không có `zalo`/số điện thoại không hợp lệ) và phương án dự phòng lấy từ policy (`fallbackSms`: SMS hoặc gọi điện); người gửi phải xác nhận phương án dự phòng trước khi gửi (Q36).
- Tham khảo chi phí và giới hạn kênh tại Phụ lục E.3; không phải cam kết giá.

#### Quy tắc gửi tự động **[v2.4 – phụ thuộc D-16]**

- Khách yêu cầu công cụ tự đặt điều kiện và thời điểm gửi linh hoạt thay vì bật/tắt sự kiện cố định (Q34). Contract: tab `Quy tắc gửi` tại `/zalo/config?tab=rules` (Phụ lục B), mở rộng từ `zaloEvents` hiện có (`condition`, `offsetDays`, `offsetDir`, `buildingId`, `templateId`).
- Mỗi quy tắc gồm: sự kiện nguồn (hóa đơn phát hành, đến hạn, quá hạn, công nợ ≥ 5 ngày, HĐ sắp hết hạn, hoàn cọc, kỳ trả chủ nhà, bảo dưỡng), ngưỡng (số ngày trước/sau, số tiền còn nợ tối thiểu), thời điểm gửi (offset và giờ trong ngày), phạm vi (tòa, nhóm tòa T/S/G, loại phòng), template ZNS đã duyệt, kênh dự phòng và trạng thái bật/tắt.
- Danh sách quy tắc ≤ 7 cột nghiệp vụ: Tên, Sự kiện, Điều kiện, Thời điểm, Phạm vi, Template, Trạng thái; form quy tắc mở trong drawer. Có nút `Xem trước đối tượng` cho biết số khách khớp điều kiện tại thời điểm hiện tại.
- Chỉ role có `zalo.config` được tạo/sửa; lịch sử gửi ghi rõ đợt gửi phát sinh từ quy tắc nào.

#### Hội thoại Zalo **[v2.4 – phụ thuộc D-17]**

- Phản hồi của khách trên Zalo được route về trưởng phòng phụ trách tòa của khách (area lead qua `Q.scope`), không tập trung một đầu mối; hội thoại được đồng bộ vào hệ thống (Q37).
- Contract: route tùy chọn `#/zalo/inbox` (danh sách hội thoại theo tòa được giao, ưu tiên chưa đọc) và tab `Hội thoại Zalo` trong detail khách thuê (`/tenants/:id?tab=zalo`). Chỉ hiển thị khi phase và tích hợp ZNS webhook sẵn sàng; mockup chỉ cần dữ liệu demo.
- Work queue có thể thêm `Hội thoại chưa trả lời` cho Vận hành/trưởng phòng sau khi D-17 Approved; chưa đưa vào ma trận 6.1.

### 7.8. Thiết lập và import

- Thiết lập chỉ hiển thị cho role có quyền, truy cập qua `Phân hệ & Quản trị`.
- Import dùng cùng pattern wizard và error review.
- Công cụ demo, reset, phase toggle và state JSON chuyển vào `#/settings/tools` với nhãn `Chỉ dùng cho demo`.
- **[v2.4]** Danh mục `Nguồn khách` mặc định gồm Facebook, Tờ rơi, Đăng tin, Zalo (Q18); các nguồn khác trong seed (Google Ads, TikTok, Website, Giới thiệu) chuyển trạng thái `inactive`, vẫn chọn được khi bật lại.
- **[v2.4]** Không thêm cấu hình `Số ngày báo trước hết hạn HĐ` (cố định 35 ngày, Q9) và `Số ngày chuyển công nợ` (cố định 5 ngày, Q14) vào Thiết lập.

---

## 8. Thay đổi chi tiết Phase 2

### 8.1. CRM

- Dashboard Kinh doanh tập trung lead cần gọi, lịch xem hôm nay, giữ chỗ sắp hết hạn và deal chờ hoàn tất.
- Lead list hỗ trợ chuyển đổi List/Kanban nhưng dùng chung search và filter state.
- Lead card chỉ hiển thị tên, nhu cầu, mức độ ưu tiên, lần liên hệ gần nhất và next action.
- Detail lead có một CTA theo pipeline stage.
- Wizard lịch xem, giữ chỗ và chốt thuê dùng sticky footer và summary bên phải ở desktop.
- **[v2.4]** Hoa hồng tính theo % (`sale.commissionRate`); chip `Đủ điều kiện` chỉ khi khách đã đóng đủ cọc 1 và ký hợp đồng (BR-13, khách xác nhận tại Q19). Detail giao dịch giải thích điều kiện còn thiếu khi chip là `Chưa đủ`.
- **[v2.4]** Hoa hồng luôn chia theo cá nhân (Q20); `teamId` chỉ là dimension lọc/nhóm trong Sổ hoa hồng và Hiệu suất kinh doanh, không có màn chia hoa hồng theo team.

### 8.2. OCR hợp đồng **[v2.1]**

#### Bố cục review

- Giữ tài liệu bên trái và panel review bên phải.
- Tỷ lệ mặc định: tài liệu 56%, review 44%; ở content < 1200 px chuyển 50/50; panel review tối thiểu 460 px. Tỷ lệ này phải được kiểm chứng bằng wireframe 1366 px ở giai đoạn 0.
- **[v2.4]** Field schema theo template thật `HỢP ĐỒNG CHO THUÊ PHÒNG` (HĐ mới của Linh, 4 trang): **43 trường, 7 nhóm** (Thông tin ký kết; Bên cho thuê A; Bên thuê B; Đối tượng thuê – Điều 1; Thời hạn – Điều 3; Giá & thanh toán – Điều 4; Đơn giá dịch vụ – Điều 4.2) + bảng tài sản bàn giao Điều 2.2 (30 hạng mục, chỉ đọc). Header review hiển thị `N cần kiểm tra / 43 trường` và tiến độ xác nhận; số trường lấy từ schema `TH.ocrParser.FIELDS`, không hard-code.
- **[v2.4]** Trích xuất là **parser thật** (`mockup/js/core/ocr-parser.js`): đọc text từ PDF điền trên máy bằng pdf.js (nạp từ cdnjs khi cần, ghép item theo tọa độ để không vỡ dấu tiếng Việt) hoặc file `.txt`; nhận diện theo anchor Điều 1–4; confidence tính theo validate (SĐT 10 số, CCCD 12 số, ngày hợp lệ, cọc = 1 tháng tiền nhà, số tiền khớp bằng chữ, thời hạn khớp ngày). Ảnh scan (JPG/PNG) bị từ chối với thông báo rõ, không giả lập.
- **[v2.4]** Màn review có card **Kết quả trích xuất** theo thực thể (Khách thuê · Tòa & phòng · Hợp đồng · Dịch vụ · Tài sản) với trạng thái khớp hệ thống và hành động; khung tài liệu hiển thị **mọi trang nối tiếp** (nhãn `Trang n/N`, chọn trang để cuộn) để người dùng thấy toàn bộ file đã được đọc.
- **[v2.4]** OCR đồng thời là **bước tạo khách thuê**: khớp khách theo SĐT hoặc CCCD → dùng khách đó (có nút bổ sung CCCD/nơi cấp/ngày sinh/hộ khẩu còn thiếu từ HĐ); trùng tên nhưng khác SĐT/CCCD chỉ là gợi ý; không khớp → `Tạo khách thuê` mở form đã điền sẵn (sửa được) hoặc tự tạo khi bấm `Tạo hợp đồng`. Phòng: tách "P302 - Tòa TH01" thành mã phòng + gợi ý tòa, khớp phòng theo mã hoặc theo số phòng trong tòa đã chọn; không tạo tòa/phòng mới từ OCR.
- Mặc định chọn chế độ `Chỉ trường cần kiểm tra`.

#### Hàng đợi lỗi

- Mỗi item gồm label, giá trị OCR, confidence, lý do cảnh báo và action xác nhận.
- Chọn item mở đúng group, focus field và highlight vùng tương ứng trên tài liệu (mark có `data-field` trên mọi trang có dữ liệu; cuộn tài liệu đến mark).
- Nút `Xác nhận và tiếp tục` chuyển đến item chưa xác nhận tiếp theo mà không mất focus (yêu cầu 11.1).
- Người dùng có thể chuyển sang `Xem tất cả trường` khi cần.

#### Group và trạng thái

- Group không có lỗi được thu gọn và hiển thị số trường đã xác nhận; group có lỗi mở mặc định.
- Field đã sửa hiển thị giá trị OCR gốc và giá trị hiện tại (giá trị gốc lấy từ bản chụp `raw` hiện có, không cần lịch sử nhiều bước).
- Trường bắt buộc hoặc ảnh hưởng tiền không được bỏ qua.
- CTA `Tạo hợp đồng` disabled đến khi không còn lỗi bắt buộc; tooltip giải thích số trường còn lại. Guard `ocrReadyToCreate` hiện có vẫn là nguồn chân lý.

#### Footer

- Trái: Chạy lại trích xuất. Giữa: trạng thái lưu tự động (hiện tại đã persist mỗi thay đổi; chỉ cần indicator). Phải: Lưu và thoát, Tạo hợp đồng.

### 8.3. Bảng kê, số dư đầu kỳ và Data Job

- Import flow thống nhất: Upload → Map/nhận dạng → Review lỗi → Xác nhận.
- Review ưu tiên dòng lỗi; dòng hợp lệ được thu gọn.
- Data Job detail hiển thị summary, progress, lỗi có thể retry và audit log.
- Action retry chỉ xuất hiện khi lỗi thuộc nhóm được phép retry.

### 8.4. Bảo trì

- Sự cố list mặc định ưu tiên SLA và người được giao; Kỹ thuật vào bằng `?assignee=me`.
- Card hoặc row hiển thị mức độ, phòng/tòa, thời gian mở, SLA và next action.
- Detail dùng timeline cập nhật; ảnh và chi phí nằm trong section riêng.
- Lịch bảo dưỡng có chế độ tháng và danh sách để thao tác trên laptop nhỏ.

### 8.5. Trung tâm báo cáo **[v2.1]**

Report Hub hiện đã có nhóm nghiệp vụ, search, ghim, gần đây và nhãn `OI` cho báo cáo chưa chốt công thức. Thay đổi còn lại:

- Bỏ 3 KPI (favorites/recent/total) có delta hard-code; giữ tile Ghim/Gần đây.
- Báo cáo `OI` không dùng CTA giống báo cáo chạy thật; card chuyển sang style muted.
- Control kỳ nằm trong report header theo 4.4; trạng thái kỳ khóa luôn nhìn thấy.
- **[v2.4]** Thêm hai metric vào `TH.metrics`: `perf.actual` (Hiệu suất thực tế – tính sau khi đã thu tiền xong) và `perf.provisional` (Hiệu suất tạm tính – tính tại thời điểm lập báo cáo) (Q22, Approved). Report hiển thị cả hai cạnh nhau, nhãn nêu rõ thời điểm chốt số liệu.
- **[v2.4]** Người xem `Báo cáo lợi nhuận dòng tiền` và `Báo cáo kinh doanh`: Cổ đông, Admin, Kế toán, trưởng phòng (Q23). Cổ đông và trưởng phòng hiện chưa có `reports.hub`; xử lý qua D-14, chưa đổi navigation.
- **[v2.4]** Các công thức khách hẹn trao đổi trực tiếp (Q7 hiệu suất/lợi nhuận/thời gian vận hành tòa, Q16 Báo cáo kinh doanh của nhà, Q24 Bảng dự kiến lợi nhuận dòng tiền) giữ nhãn `Giả định – chờ họp trực tiếp` và không được dùng để tuyên bố số liệu đã duyệt; danh sách tại Phụ lục E.2.

**[v2.5] Bản ghi báo cáo (report run)** – Trung tâm báo cáo chuyển từ catalog "xem live" sang mô hình **tạo → lưu → xem lại**:

- `/reports/hub` là **danh sách bản ghi báo cáo đã tạo** (`reportRuns`): cột Mã (`BC-0001`), Báo cáo (tên + loại + danh mục), Kỳ, Phạm vi, Số dòng, Người tạo, Ngày tạo; thao tác Xem / Tải CSV / Tạo lại / Xóa; bộ lọc tìm kiếm, danh mục, loại, kỳ, người tạo; KPI đếm không dùng delta hard-code. Trạng thái rỗng có CTA "Tạo báo cáo đầu tiên".
- `/reports/new` là wizard 2 bước: **Chọn loại** (catalog 48 loại theo danh mục, tìm kiếm; chỉ loại `live` chọn được, loại `OI` hiển thị muted "Chờ chốt công thức", loại Phase 3 mở trang tương ứng) → **Điền thông tin** (Tên, **Từ kỳ – Đến kỳ** tối đa 12 tháng, Tòa nhà hoặc các chiều workbook `dims` của loại, Ghi chú) → "Tạo báo cáo".
- Khi tạo, hệ thống tính từng kỳ bằng engine hiện có (`TH.reportEngine.run`) và **chốt snapshot** (KPI + bảng, dạng text) vào bản ghi; dữ liệu gốc thay đổi về sau không ảnh hưởng bản ghi. "Tạo lại" lập bản ghi mới cùng tham số (`rerunOf`).
- `/reports/runs/:id`: KPI (kỳ cuối), card **Tổng hợp theo kỳ** (Kỳ × KPI khi nhiều kỳ), **Xem trước** dạng tài liệu nhiều trang (trang tổng hợp + mỗi kỳ 1 trang, dùng `U.docPreview` stacked, zoom), card thông tin bản ghi, cột dữ liệu; hành động Tải CSV (BOM UTF-8; nhiều kỳ thêm cột `Kỳ`), Tạo lại, Xem live (`/reports/r/:key`), Xóa.
- Quyền: `reports.hub`; Sale chỉ thấy/tạo bản ghi nhóm Kinh doanh; mọi mutation qua `createReportRun`/`rerunReport`/`deleteReportRun` có `authorize`. `/reports` (Phase 1), `/reports/cashflow` và `/reports/r/:key` giữ nguyên.

---

## 9. Thay đổi chi tiết Phase 3

### 9.1. Tài sản và kiểm kê

- Asset list dùng identity column gồm mã, tên và vị trí.
- Trạng thái, giá trị và lần kiểm kê gần nhất là cột mặc định.
- Inventory detail tập trung danh sách cần xử lý; item đã đạt được thu gọn.
- Bulk action chỉ xuất hiện sau khi chọn tài sản.
- Tạo sự cố từ tài sản giữ liên kết hai chiều với biên bản kiểm kê.
- **[v2.4]** Kiểm kê thực hiện theo chu kỳ 1 tháng/lần; Admin và Kế toán được bắt đầu, nhập và kết thúc kiểm kê (`inventory.manage` hiện đã cấp cho `accountant`, Q33). Lịch kiểm kê tháng hiển thị trên dashboard Admin/Kế toán qua work queue 6.1.
- **[v2.4]** Khoản đầu tư (`assets.ownership = company`) có khấu hao theo thời gian (Q6); cột `Khấu hao lũy kế` và `Giá trị còn lại` thuộc preset Đối soát, không phải cột mặc định. Lịch bảo dưỡng thiết bị nhắc tự động trước 7 ngày (BR-16, Q32 Approved).

### 9.2. Nhân sự

- Dashboard HR ưu tiên nhân viên mới, thử việc sắp kết thúc, bảng công và bảng lương cần xử lý.
- Danh sách nhân viên gộp avatar, tên, mã và chức danh.
- Detail nhân viên dùng tab Tổng quan, Phân công, Hồ sơ và Lịch sử.
- Chấm công dùng sticky name column và cảnh báo ô bất thường.
- Payroll giữ mô hình trạng thái hiện có (`stepperStatus` Tạo bảng → Kiểm tra → Gửi duyệt → Duyệt/Ghi chi) với một primary theo trạng thái; không chuyển thành wizard nhiều trang.
- **[v2.4]** Trạng thái nhân viên theo khách: `Thử việc`, `Đang làm`, `Nghỉ việc` (Q27). Status tabs chỉ gồm ba trạng thái này; giá trị `leave` (Tạm nghỉ) giữ trong dữ liệu, hiển thị dưới tab `Đang làm` bằng chip phụ, không có tab riêng.
- **[v2.4]** Công thức lương theo phòng ban chưa được khách cung cấp (Q26, chờ họp trực tiếp); màn Lương thưởng giữ nhãn `Giả định` trên cột tính toán.

### 9.3. Đầu tư và cổ đông **[v2.1]**

- Tách rõ Dự án, Vốn góp, Phân phối và Hiệu quả bằng **tab** trong `/investment/shareholders` (Vốn góp / Phân phối) và 2 route hiện có; không tạo route mới trừ khi tab không đủ (Phụ lục B, tùy chọn).
- Dashboard Cổ đông chỉ hiển thị dự án thuộc phạm vi được cấp quyền.
- Giá trị tiền và tỷ lệ dùng số tabular, căn phải và có giải thích công thức.
- Action tạo/sửa/duyệt không render cho role read-only.
- Chi tiết phân phối có summary tổng, trạng thái duyệt và bảng phân bổ.
- **[v2.4]** Tab `Vốn góp` đổi nhãn thành `Lịch đóng tiền nhà`: mỗi dòng là kỳ cổ đông đóng tiền nhà định kỳ cho chủ nhà theo tỷ lệ % vốn góp (Q29); số tiền = tiền thuê kỳ trả chủ nhà của tòa × tỷ lệ; hiển thị kỳ, tòa, tỷ lệ, số tiền, hạn, trạng thái.
- **[v2.4]** Một cổ đông có thể góp vào nhiều tòa; tỷ lệ % nhập tay tại form dự án, có validate tổng tỷ lệ mỗi tòa = 100% và cảnh báo khi lệch (Q30).
- **[v2.4]** `Thống kê tài sản` và `Thống kê tiền cọc` của cổ đông lấy từ module Tòa nhà qua `projects.buildingId` (Q31 Approved); không nhập số độc lập.
- **[v2.4]** Mẫu `Bảng kê chia cổ phần các nhà` chưa được cung cấp (Q28, chờ họp); báo cáo phân phối giữ nhãn `Giả định`.

### 9.4. Ngân hàng và đối soát

- Luồng chuẩn: Nhập sao kê → Đối soát tự động → Review chưa khớp → Khớp tay/Bỏ qua.
- Mặc định chỉ hiển thị giao dịch cần xử lý.
- Panel match hiển thị giao dịch ngân hàng và record đề xuất cạnh nhau; ghi rõ lý do và độ tin cậy.

---

## 10. Component và interface cần bổ sung

### 10.1. Navigation configuration

Navigation item cần hỗ trợ: mục cha (cấp 1), thứ tự theo role, permission bắt buộc, phase bắt buộc, badge/count provider tùy chọn, trạng thái hidden/read-only, cờ `launcherOnly`. Không thay đổi route string hiện tại. Config sinh từ Phụ lục A.

### 10.2. Page header

Nhận title/subtitle, status/meta tùy chọn, một primary action, danh sách secondary action, back context tùy chọn, slot control kỳ. Nếu truyền nhiều primary action, chỉ render action đầu tiên dạng primary.

### 10.3. List toolbar

Search input, status tabs, tối đa 2 quick filter, advanced filter drawer, active filter chips, column chooser, density chooser, export. Filter state lưu trên query string; preference hiển thị lưu ở `meta.uiPrefs` (12.2).

### 10.4. Data table v2 **[v2.2]**

`U.table` hiện tại không có sticky header, row click, density, loading state và re-render toàn bộ innerHTML mỗi lần sort/page. Hạng mục này là **viết lại component** nhưng phải tương thích ngược với page chưa migrate.

Input API phải giữ nguyên: `cols`, `rows`, `pageSize`, `selectable`, `rowKey`, `rowClass`, `selectableIf`, `onSelect`, `sortKey`, `sortDir`, `footer`, `extraFooter`, `noPager`, `colPrefsKey`, `compact`, `editable`, `empty`, `onRender`. Thuộc tính cột tiếp tục hỗ trợ `key`, `label`, `render`, `sortable`, `num`, `sortVal`, `cls`, `width`, `hideable`.

API bổ sung:

- `rowHref(row)` hoặc `onRowOpen(row)`; không cho phép truyền đồng thời cả hai.
- `defaultVisible` theo cột và `density: compact|comfortable`.
- `loading`, `error`, `onRetry`, `filtered`, `emptyAction`.
- `primaryAction(row)` và `secondaryActions(row)`; page cũ vẫn được phép tự render cột `actions`.
- `stickyHeader`, `stickyIdentity`, `stickyActions` tùy loại bảng.

Object trả về phải giữ đủ các method hiện tại: `render()`, `selected()`, `clearSelection()`, `setRows(rows)`, `toggleCol(key)`, `hidden()`, `state`. Được bổ sung `setLoading()`, `setError()`, `setDensity()` nhưng không được đổi signature cũ.

Quy tắc tương tác:

- Click/Enter trên row mở detail; click vào `a`, `button`, `input`, `select`, `textarea` hoặc phần tử có `data-stop-row-open` không kích hoạt row navigation.
- Selection được giữ theo `rowKey` khi sort/page; bị xóa khi record không còn trong tập dữ liệu sau filter.
- Sort, page và filter không làm mất focus nếu trigger vẫn còn; sau rerender focus trả về control tương đương.
- Event delegation tiếp tục dùng `data-act`; không buộc page cũ bind lại từng dòng.
- Preference cũ ở `meta.columnPrefs` được đọc làm fallback; lần thay đổi đầu tiên ghi sang `meta.uiPrefs.hiddenColumns[tableKey]`.
- Loading dùng skeleton theo số cột; empty và filtered-empty là hai trạng thái khác nhau; error luôn có retry khi `onRetry` tồn tại.

Definition of backward compatibility: toàn bộ page chưa migrate phải render và thực hiện được sort, page, select, column preference và action giống trước khi thay `U.table`.

### 10.5. Work queue

Chuẩn hóa record: loại công việc, tiêu đề và đối tượng, mức ưu tiên, hạn xử lý, người phụ trách, route mở chi tiết, primary action theo role. Chỉ tổng hợp từ selector hiện có (`Q.todo()` và các query đang dùng ở dashboard); không tạo entity mới.

### 10.6. Review queue

Dùng cho OCR, import và đối soát: danh sách item cần kiểm tra, filter chỉ lỗi/tất cả, current item, source locator tùy loại tài liệu, confirm/edit/skip nếu được phép, progress và completion guard.

---

## 11. Tiền đề kỹ thuật **[v2.1 – mới]**

Các hạng mục sau chưa có trong mockup và là điều kiện để các mục 6.3, 6.4, 8.2, 10.4 hoạt động như mô tả. Phải được lên kế hoạch như hạng mục riêng, không gộp vào "chuẩn hóa màn hình".

### 11.1. Partial re-render

- OCR, detail tab và table hiện gọi `router.refresh()` hoặc gán lại `innerHTML` toàn vùng cho mọi thay đổi nhỏ, làm mất focus và scroll.
- Yêu cầu: page có thể đăng ký vùng render con (`root.querySelector` + hàm render vùng) để đổi tab/field/sort chỉ vẽ lại vùng đó. Áp dụng tối thiểu cho OCR review panel, detail tabs và table body.

### 11.2. Draft store và unsaved guard

- Wizard hiện giữ state in-memory (`TH._wz`, `TH._import`) mất khi reload; `meta.drafts` chỉ được ghi, chưa được đọc; không có `beforeunload` hay guard hashchange.
- Yêu cầu: helper `TH.draft.get/set/clear(key)` lưu trong `meta.drafts[key]`, wizard đọc lại khi mở; guard rời trang (hashchange + beforeunload) khi draft dirty; sticky footer hiển thị `Đã lưu nháp lúc hh:mm`.
- Áp dụng cho: tạo hợp đồng, hóa đơn theo kỳ, hoàn cọc, đợt gửi Zalo, import, lịch xem, giữ chỗ, chốt thuê, OCR.
- Draft key dùng cấu trúc `route + entity/new + userId`; không chia sẻ draft giữa hai người dùng demo.
- Khi rời trang bằng điều hướng nội bộ: modal có ba lựa chọn `Lưu nháp và rời đi`, `Bỏ thay đổi`, `Ở lại`; focus mặc định vào `Ở lại`.
- Khi đóng tab/reload: dùng cảnh báo native `beforeunload`; không cố hiển thị custom modal.
- Sau submit thành công hoặc người dùng chọn bỏ thay đổi, phải gọi `TH.draft.clear(key)` trước khi điều hướng.
- Draft phải có `updatedAt` và tự hết hạn sau 30 ngày; draft cũ chỉ xóa khi đọc hoặc khi reset dữ liệu demo.

### 11.3. Gộp UI preference

- Hiện có `meta.columnPrefs`, `meta.savedFilters`, `meta.reportPrefs`, `sessionStorage['timohouse.sidebar.openGroup']`.
- Yêu cầu: `meta.uiPrefs` là namespace duy nhất; các key cũ được đọc làm fallback và ghi sang `uiPrefs` khi người dùng thay đổi lần đầu (không migrate hàng loạt). Sidebar collapsed/open group chuyển từ sessionStorage sang `uiPrefs.sidebar`.

### 11.4. Sidebar collapse và flyout

- Chưa tồn tại; cần: trạng thái 72 px, icon-only với tooltip, flyout submenu khi hover/focus, đóng flyout bằng `Esc`, lưu trạng thái ở `uiPrefs.sidebar.collapsed`, tự thu gọn ở 1180-1439 px lần đầu.

### 11.5. Ngoại lệ schema

- Không đổi schema nghiệp vụ. Được phép thêm field UI-only: `meta.uiPrefs`, `meta.drafts[key]`. OCR không cần field lịch sử mới vì bản `raw` đã có để so sánh giá trị gốc.

---

## 12. State và tương thích

### 12.1. Dữ liệu nghiệp vụ

- Không đổi `schema`, collection hoặc seed nghiệp vụ; không migrate record hiện có.
- Không thay đổi API console đang dùng trong walkthrough (`window.__timehouseDemo`).
- Không thay đổi logic permission hoặc scope tòa nhà.

### 12.2. UI preference

`meta.uiPrefs` (xem 11.3) gồm: `sidebar.collapsed`, `sidebar.openGroup`, `tableDensity`, `hiddenColumns[tableKey]`, `savedFilters[route]`, `lastHub[role]`, `dashboardWidgets` nếu bật tùy chỉnh. Nếu không tồn tại, dùng default mới; state cũ mở được không cần migration.

### 12.3. URL

- Giữ toàn bộ hash route; tiếp tục dùng query parameter cho filter và OCR page/zoom.
- Bổ sung query `view`, `filterOpen`, `reviewMode`, `assignee`, `source` (Phụ lục B); không xóa query cũ.

---

## 13. Responsive và accessibility

### 13.1. Breakpoint

- Từ 1440 px: layout đầy đủ.
- 1180-1439 px: sidebar mặc định thu gọn, giảm cột mặc định phụ.
- 768-1179 px: sidebar drawer, list ưu tiên cột identity/trạng thái/action.
- Minimum supported viewport là 360 x 640 px. Dưới 768 px chỉ cam kết các khả năng trong Mobile Capability Matrix; ngoài danh sách này không phải acceptance blocker.

#### Mobile Capability Matrix **[v2.2]**

| Nhóm chức năng | Dưới 768 px | Hành vi |
| --- | --- | --- |
| Đăng nhập, Dashboard, notification | Hỗ trợ | Một cột, work queue đầy đủ |
| Global search | Hỗ trợ | Mở full-screen command palette |
| List page | Hỗ trợ cơ bản | Search, status tab, quick filter; hiển thị identity/status/primary action; advanced column chooser ẩn |
| Detail page | Hỗ trợ đọc | Tab chuyển thành horizontal scroll; action theo quyền vẫn dùng được nếu không mở form dài |
| Sự cố bảo trì | Hỗ trợ | Xem, cập nhật trạng thái, ghi chú và ảnh |
| Ghi nhận thu nhanh | Hỗ trợ | Chỉ luồng một hóa đơn; không hỗ trợ bulk |
| Wizard hợp đồng, hóa đơn theo kỳ, import | Không cam kết | Hiển thị banner `Nên sử dụng desktop`; cho phép xem draft nhưng không submit |
| OCR review, bảng lương, chấm công ma trận, đối soát | Không hỗ trợ thao tác | Read-only summary và banner mở trên desktop |

Ở 768-1179 px, các luồng desktop vẫn phải hoàn thành được; bảng phức tạp được phép horizontal scroll với sticky identity/action.

### 13.2. Keyboard

- Tab order theo thứ tự thị giác; focus ring 2 px rõ ràng.
- `Enter` mở row đang focus; menu ba chấm mở bằng Enter/Space; `Esc` đóng drawer/modal/popover/flyout.
- Command search tiếp tục hỗ trợ `Ctrl/Cmd + K`.

### 13.3. Screen reader và semantic

- Icon button luôn có accessible label; table header dùng `scope`.
- Status không chỉ truyền đạt bằng màu.
- Form error liên kết với control bằng `aria-describedby`.
- Modal/drawer/flyout quản lý focus và trả focus về trigger khi đóng.

### 13.4. Chuẩn accessibility và nội dung **[v2.2]**

- Chuẩn nghiệm thu: WCAG 2.2 mức AA cho 6 reference screens và shell.
- Tương phản chữ thường tối thiểu 4.5:1; chữ lớn và thành phần UI tối thiểu 3:1.
- Focus indicator có diện tích và độ tương phản nhìn thấy rõ; không có keyboard trap.
- Target pointer tối thiểu 24 x 24 px theo WCAG; design target của sản phẩm vẫn là 40 x 40 px cho icon action chính.
- Không dùng màu, icon hoặc vị trí làm tín hiệu duy nhất; status luôn có text label.
- Ngôn ngữ giao diện là tiếng Việt; sentence case cho title/button, không viết hoa toàn bộ trừ mã và heading bảng ngắn.
- Thuật ngữ chuẩn: `Lead` trước khi trở thành khách thuê; `Khách thuê` sau khi có hồ sơ/giữ chỗ/hợp đồng; không dùng xen kẽ `Khách hàng` nếu không chỉ khái niệm chung.
- **[v2.4]** Thuật ngữ đã được khách xác nhận: `Giá niêm yết` = giá tiêu chuẩn của TimoHouse, `Giá thuê` = giá thực tế khách đang thuê (Q13); `Nhóm tòa (T/S/G)` thay cho `Loại nhà` (Q2); `Hiệu suất thực tế` = sau khi thu tiền xong, `Hiệu suất tạm tính` = tại thời điểm lập (Q22); `Kỳ trả chủ nhà` cho lịch TimoHouse thanh toán chủ nhà (Q8) và `Lịch đóng tiền nhà` cho phần cổ đông (Q29); `Thời gian giữ giá` = thời gian chủ nhà không được tăng giá (Q5).
- Ngày hiển thị `dd/mm/yyyy`; kỳ hiển thị `Tháng mm/yyyy`; dữ liệu nội bộ tiếp tục dùng ISO.
- Tiền hiển thị phân tách hàng nghìn và hậu tố `đ` hoặc header có đơn vị `VND`, không dùng cả hai trong cùng cell.
- Error message phải nêu vấn đề và cách sửa; tránh chỉ hiển thị mã lỗi kỹ thuật.

---

## 14. Phạm vi, ước lượng và rollout **[v2.1 – mới]**

### 14.1. Chia hai đợt

| Đợt | Nội dung | Kết quả demo được |
| --- | --- | --- |
| **v2.2-A (bắt buộc)** | Giai đoạn 0-3 ở mục 15: wireframe, foundation, shell/navigation, tiền đề kỹ thuật 11.1-11.4, 6 reference screens | Shell mới + 6 màn mẫu chạy trên dữ liệu thật; các màn còn lại chạy trên shell mới với UI cũ |
| **v2.2-B (sau khi duyệt A)** | Giai đoạn 4-7: nhân rộng Phase 1, 2, 3, QA | Toàn bộ 63 route |

Stakeholder chỉ cam kết đợt A ở lần duyệt này; đợt B được duyệt sau khi xem A.

### 14.2. Ước lượng sơ bộ **[v2.2]**

Ước lượng dưới đây là planning range, không phải cam kết thương mại. Đơn vị là người-ngày thực hiện; chưa tính thời gian chờ stakeholder phản hồi. Nhân sự tối thiểu khuyến nghị: 1 UX/UI, 1 FE và QA bán thời gian. Nếu chỉ có 1 FE kiêm thiết kế/QA, thời gian lịch phải tăng tương ứng.

| Giai đoạn | Ước lượng người-ngày |
| --- | --- |
| 0. Task flow + wireframe 6 reference screens ở 3 breakpoint | 5-7 |
| 1. Foundation và component states | 4-6 |
| 2. Shell, navigation, launcher, period control | 6-8 |
| 2b. Partial render, draft store, uiPrefs, table v2 | 8-12 |
| 3. 6 reference screens + accessibility + evidence | 10-14 |
| **Tổng v2.2-A** | **33-47** |
| 4. Phase 1 còn lại | 14-19 |
| 5. Phase 2 | 16-22 |
| 6. Phase 3 | 10-14 |
| 7. Regression, visual QA, tài liệu và UAT | 10-14 |
| **Tổng v2.2-B** | **50-69** |

Phải lập WBS theo template/route sau giai đoạn 0 và cộng contingency 20% cho các hạng mục có blast radius cao: table v2, draft guard, RBAC navigation và OCR partial render. Estimate chỉ được chốt thương mại sau khi reference screens và component contract được duyệt.

### 14.3. Rollout

- Thêm công tắc `ui.v2` trong `TH.phase`-style store (localStorage riêng, giống `timehouse-phase-v1`), bật mặc định trên nhánh redesign, tắt được để demo bản cũ trong thời gian chuyển tiếp.
- Shell mới và shell cũ dùng chung route table; page chưa chuyển đổi vẫn render trong shell mới.
- CSS redesign phải nằm dưới root class `.ui-v2` cho tới khi đợt B hoàn tất để tránh ảnh hưởng shell cũ. UI preference của hai shell dùng namespace riêng.
- Rollback về shell cũ không được sửa hoặc xóa dữ liệu nghiệp vụ; chỉ thay đổi flag UI và reload route hiện tại.
- Gỡ công tắc và code shell cũ khi đợt B hoàn tất.

---

## 15. Trình tự triển khai **[v2.1 – đã đảo thứ tự]**

### Giai đoạn 0 - Wireframe và duyệt

- Chốt task flow cho 5 tác vụ UAT của Vận hành, Kế toán và Kinh doanh; mỗi flow ghi điểm bắt đầu, bước, trạng thái lỗi và kết quả thành công.
- Lo-fi wireframe 6 reference screens ở 1024, 1366 và 1920 px: Dashboard Vận hành, Dashboard Kế toán, Danh sách Phòng, Danh sách Hợp đồng, Danh sách Công nợ, Review OCR.
- Wireframe shell: sidebar mở/thu gọn cho Admin và Kế toán, launcher, topbar.
- Wireframe có annotation cho CTA, permission, loading/empty/error, keyboard focus, responsive và dữ liệu bị ẩn/chuyển drawer.
- Tạo prototype click-through tối thiểu cho navigation, list → detail và OCR error queue.
- Stakeholder xác nhận checklist mục 18 trên wireframe, không trên văn bản.

### Giai đoạn 1 - Foundation

- Cập nhật token, typography, spacing, trạng thái focus.
- Chuẩn hóa button, input, chip, card, drawer, modal, empty state.
- Bổ sung `meta.uiPrefs` và công tắc `ui.v2`.

### Giai đoạn 2 - Shell, navigation và tiền đề kỹ thuật

- Navigation config từ Phụ lục A; sidebar collapse/flyout; launcher; topbar mới; period control theo 4.4; `#/settings/tools`.
- Partial re-render, draft store, table v2.

### Giai đoạn 3 - Reference screens

- Hoàn thiện 6 màn mẫu trên dữ liệu thật; đo lại bảng 1.1.
- Duyệt v2.2-A. Chỉ sau khi duyệt mới sang giai đoạn 4.

### Giai đoạn 4 - Phase 1

- Chuẩn hóa toàn bộ list/detail/form/wizard Phase 1; kiểm tra lại F01-F10.

### Giai đoạn 5 - Phase 2

- CRM, OCR, bảng kê, bảo trì, báo cáo, Data Job; kiểm tra F11-F15 và F08.5.

### Giai đoạn 6 - Phase 3

- Tài sản, HR, payroll, đầu tư, ngân hàng; kiểm tra F16-F19.

### Giai đoạn 7 - QA và bàn giao

- Visual regression ở viewport mục tiêu; accessibility review; cập nhật ảnh mockup và walkthrough; UAT theo vai trò; gỡ shell cũ.

---

## 16. Test plan

### 16.1. Regression kỹ thuật **[v2.1]**

- `npm run check` phải pass (lưu ý: script này chỉ kiểm tra cú pháp `node --check`, không phải regression chức năng).
- Mở rộng `scripts/capture_phase1_walkthrough.mjs` để chạy được với shell mới; giữ 36 mốc P1 PASS.
- Bắt buộc có Playwright smoke suite cho P2/P3: chạy `G.runAll` của guide-p2/guide-p3, assert không có exception và số mốc `check()` đạt bằng bản baseline. Kiểm thử thủ công chỉ bổ sung, không thay thế smoke suite này.
- Toàn bộ 63 route render không có exception ở cả 7 role.
- Dữ liệu localStorage hiện có (`timehouse-demo-p1-v3-2026`) tiếp tục hoạt động.
- Refresh trang giữ đúng route và query.
- Permission và scope tòa nhà không bị mở rộng.
- Bắt buộc tự động hóa các contract có blast radius: navigation/RBAC của 7 role, table v2 backward compatibility, draft persistence/guard, UI preference fallback và OCR completion guard.
- Evidence gồm log test, screenshot viewport và JSON kết quả được lưu dưới `docs/ui-redesign/evidence/<version>/`; evidence là một phần của acceptance, không chỉ là artifact nội bộ.

### 16.2. Navigation theo vai trò

Kiểm tra Admin, Kế toán, Vận hành, Kinh doanh, Kỹ thuật, Nhân sự, Cổ đông: đúng menu theo Phụ lục A; đúng dashboard; không hiển thị action không có quyền; URL trái quyền bị chặn; tắt Phase 2/3 xử lý đúng role phụ thuộc phase và teaser theo mục 18.

### 16.3. Danh sách

- Search, quick filter, advanced filter, reset; tab count khớp dữ liệu.
- Sort, pagination, chọn dòng, bulk action; ẩn/hiện cột và lưu preference; density.
- Row click không xung đột với checkbox/button/link.
- Không cuộn ngang tại 1366 px với cột mặc định và sidebar mở.

### 16.4. OCR

- Chỉ lỗi hiển thị đúng danh sách pending; chọn lỗi highlight đúng nội dung; confirm chuyển đến lỗi tiếp theo không mất focus.
- Sửa field cập nhật confidence/confirmed đúng quy tắc hiện tại.
- Không tạo hợp đồng khi còn trường bắt buộc chưa xác nhận.
- Rerun reset đúng dữ liệu OCR, giữ route; draft và contract prefill tiếp tục hoạt động.

### 16.5. Viewport

1366 x 768, 1440 x 900, 1920 x 1080, 1024 x 768 (tablet/basic fallback).

### 16.6. UAT nghiệp vụ **[v2.1]**

Điều kiện tiên quyết: khách hàng cử tối thiểu 2 người dùng thật cho mỗi nhóm Vận hành, Kế toán, Kinh doanh; mỗi người thực hiện cùng 5 tác vụ cố định không có hướng dẫn trực tiếp; đo trước và sau để có baseline.

Task script bắt buộc:

| Role | Tác vụ |
| --- | --- |
| Vận hành | Tìm phòng sẵn sàng và tạo luồng hợp đồng |
| Vận hành | Xử lý một phòng chờ dọn và xác nhận hoàn tất |
| Vận hành | Mở hợp đồng sắp hết hạn và thực hiện bước gia hạn tiếp theo |
| Kế toán | Tìm một khoản quá hạn và ghi nhận thu một phần |
| Kế toán | Mở hồ sơ hoàn cọc chờ duyệt và thực hiện action đúng vai trò |
| Kế toán | Chuyển kỳ, kiểm tra trạng thái khóa và quay lại công nợ mà không mất kỳ |
| Kinh doanh | Tìm lead hot cần liên hệ và cập nhật hoạt động |
| Kinh doanh | Mở lịch xem hôm nay và tạo giữ chỗ |
| Kinh doanh | Mở deal chờ hợp đồng và đi đến bước tạo hợp đồng |
| Chung | Dùng global search để mở một entity và quay lại đúng list context |
| Chung | Thay đổi cột/filter, reload và xác nhận preference được giữ |

Mỗi người thực hiện 5 task phù hợp vai trò; Product Owner chọn từ danh sách trên nhưng phải dùng cùng task ở baseline và redesign.

Tiêu chí đạt: ≥ 90% tác vụ hoàn tất; không có lỗi usability nghiêm trọng; tìm được chức năng trong ≤ 10 giây; không tác vụ chính nào tăng quá một bước so với flow cũ, trừ bước xác nhận giảm rủi ro.

Severity scale:

- **S1 Blocker:** không thể hoàn thành tác vụ, mất dữ liệu, sai quyền hoặc sai kết quả nghiệp vụ. Không chấp nhận.
- **S2 Major:** hoàn thành được nhưng cần trợ giúp, đi sai luồng hoặc mất hơn gấp đôi thời gian baseline. Không chấp nhận khi sign-off.
- **S3 Minor:** gây chậm/nhầm nhẹ nhưng người dùng tự phục hồi. Được phép có kế hoạch sửa đã thống nhất.
- **S4 Cosmetic:** không ảnh hưởng hiểu và thao tác. Không chặn sign-off.

Đo `tìm được chức năng trong ≤10 giây` từ lúc facilitator đọc xong yêu cầu đến click đầu tiên vào đúng destination; ghi bằng screen recording hoặc timestamp trong biên bản UAT.

---

## 17. Acceptance criteria tổng

Đợt A hoàn tất khi tất cả điều kiện sau đạt:

1. Shell mới và 6 reference screens chạy trên dữ liệu thật ở 1024, 1366 và 1920 px.
2. Navigation của 7 role khớp Phụ lục A; route trái quyền vẫn bị chặn; phase off hoạt động theo Decision Log.
3. Sidebar mở/thu gọn, flyout, launcher, topbar và global search đạt keyboard test.
4. Table v2 pass backward-compatibility suite trên page cũ và reference list pages; không cuộn ngang ở 1366 px ngoại trừ bảng được ghi là ma trận.
5. Draft store, unsaved guard và UI preference fallback pass test tự động.
6. OCR error queue, source highlight, confirm-next và `ocrReadyToCreate` pass acceptance tại 16.4.
7. Sáu reference screens đạt WCAG 2.2 AA theo 13.4; không có S1/S2 trong accessibility review.
8. Bảng 1.1 được đo lại; 36 mốc P1 walkthrough PASS; P2/P3 smoke suite PASS.
9. Wireframe, prototype, component contract và Decision Log được stakeholder ký.

Đợt B hoàn tất khi:

1. Toàn bộ 63 route sử dụng shell và design system mới.
2. Cả 7 vai trò có navigation theo Phụ lục A và dashboard phù hợp.
3. Route, state, business rule và dữ liệu demo hiện có không bị phá vỡ.
4. Các list page chính đáp ứng giới hạn cột và action.
5. OCR hoạt động theo exception-first review.
6. Walkthrough Phase 1 và scenario Phase 2/3 chạy thành công.
7. Viewport mục tiêu không có nội dung chồng lấn, clipping hoặc action không truy cập được.
8. Bộ ảnh mockup và tài liệu walkthrough được cập nhật.
9. UAT đạt 16.6.

---

## 18. Decision Log và checklist sign-off **[v2.2]**

Không xem việc stakeholder không phản hồi là đồng ý. Mọi quyết định trạng thái `Pending` phải có người duyệt và ngày duyệt trước implementation gate liên quan.

### 18.1. Decision Log

| ID | Quyết định | Phương án chốt/khuyến nghị | Owner duyệt | Trạng thái | Gate bị chặn |
| --- | --- | --- | --- | --- | --- |
| D-01 | Đối tượng ưu tiên | Nhân viên nghiệp vụ; demo roadmap là thứ yếu | Requester/Product Owner | **Approved** | – |
| D-02 | Phạm vi redesign | Toàn bộ 3 phase; giữ nghiệp vụ, đổi UX | Requester/Product Owner | **Approved** | – |
| D-03 | Hướng hình ảnh | Enterprise tinh gọn; desktop/laptop chính | Requester/Product Owner | **Approved** | – |
| D-04 | Teaser P2/P3 khi phase tắt | Khuyến nghị: chỉ hiển thị trong launcher với nhãn `Sắp có` | Product Owner/Sponsor | **Pending** | Shell/navigation implementation |
| D-05 | Vị trí Zalo cho Admin | Khuyến nghị: `Vận hành`; cấu hình ở `Phân hệ & Quản trị`/Thiết lập | Product Owner | **Pending** | Navigation config final |
| D-06 | Hành vi mục menu có submenu | Click nhóm chỉ expand; click destination mới điều hướng | UX Lead/Product Owner | **Proposed** | Wireframe sign-off |
| D-07 | Phạm vi mobile | Capability Matrix tại 13.1 | Product Owner | **Proposed** | Responsive acceptance |
| D-08 | Chia đợt A/B | Chỉ cam kết A; duyệt B sau reference screens | Sponsor/Delivery Owner | **Pending** | Commercial estimate và đợt B |
| D-09 | Route mới | Cho phép route/query bắt buộc tại Phụ lục B; route tùy chọn phải tạo decision riêng | Tech Lead/Product Owner | **Proposed** | Implementation route mới |
| D-10 | Tên launcher customer-facing | `Phân hệ & Quản trị`; không dùng “Ứng dụng” hoặc “Tất cả ứng dụng” | Requester/Product Owner | **Approved** | – |
| D-11 | Ngôn ngữ và phạm vi sidebar theo role | Dùng `Quản lý cho thuê`; role `Sale` hiển thị là `Kinh doanh`; mọi route có quyền phải có điểm vào sidebar hoặc launcher và launcher không lặp sidebar | Requester/Product Owner | **Approved** | – |
| D-12 | Ngoại lệ schema additive cho Workbook Alignment | Cho phép thêm collection/field ở Phụ lục D; không xóa/đổi nghĩa field cũ, không tăng `SCHEMA`, migration phải idempotent và giữ tương thích state | Tech Lead/Product Owner | **Approved for mockup** | Production data migration phải review riêng |
| D-13 **[v2.4]** | Phạm vi quyền dữ liệu nhạy cảm (Q1: công nợ, lương, hoa hồng chỉ Admin và Kế toán) | Khuyến nghị: chỉ Admin/Kế toán được **sửa**; Vận hành giữ quyền xem công nợ trong scope tòa để ghi nhận thu, Kinh doanh xem hoa hồng của chính mình, Nhân sự xem lương để lập bảng. Nếu khách yêu cầu đúng nghĩa đen, bỏ `Thu tiền & công nợ` khỏi Vận hành và `Giao dịch & hoa hồng` khỏi Kinh doanh | Product Owner | **Pending** | Navigation config final, Phụ lục A |
| D-14 **[v2.4]** | Cổ đông và trưởng phòng xem báo cáo lợi nhuận (Q23) | Khuyến nghị: cấp `reports.hub` [RO] cho `codong` giới hạn dự án được cấp quyền; trưởng phòng = user `ops` có assignment lead khu nhà, thấy báo cáo trong scope. Cần mở rộng `PERMS` có kiểm soát (ngoại lệ 4.3) | Product Owner/Tech Lead | **Pending** | Navigation Cổ đông, PERMS |
| D-15 **[v2.4]** | Kế toán nhập/duyệt kiểm kê hằng tháng (Q33) | Khuyến nghị: chuyển `Kiểm kê` từ launcher `L [xem]` thành destination trong mục `Dữ liệu & đối soát` của Kế toán; work queue 6.1 áp dụng cho Kế toán | Product Owner | **Pending** | Navigation Kế toán |
| D-16 **[v2.4]** | Công cụ tự đặt quy tắc gửi thông báo (Q34) | Contract tại 7.7 `Quy tắc gửi tự động`; khuyến nghị triển khai trong Phase 2 sau khi tích hợp ZNS | Product Owner/Sponsor | **Pending** | Route `#/zalo/config?tab=rules`, estimate đợt B |
| D-17 **[v2.4]** | Đồng bộ hội thoại Zalo về trưởng phòng phụ trách (Q37) | Contract tại 7.7 `Hội thoại Zalo`; phụ thuộc webhook ZNS/OA; khuyến nghị Phase 2/3 | Product Owner/Sponsor | **Pending** | Route `#/zalo/inbox`, tab khách thuê, tích hợp |
| D-18 **[v2.4]** | Ngữ nghĩa T/S/G (Q2) | T/S/G là tiền tố mã tòa (T2, S1, G1…), không phải loại sở hữu; đổi nhãn thành `Nhóm tòa`, bỏ nhãn giả định, suy ra từ `buildings.code` | Khách hàng (đã trả lời 06/09/2026) | **Approved** | – |

`Approved` ở D-01 đến D-03 ghi nhận các lựa chọn đã được requester xác nhận trong vòng lập kế hoạch. Các dòng `Proposed` vẫn cần ký trên wireframe/spec trước khi code phần liên quan. D-13 đến D-18 phát sinh từ câu trả lời làm rõ nghiệp vụ (Phụ lục E); D-18 được coi là Approved vì là xác nhận trực tiếp của khách.

### 18.2. Checklist ký trên wireframe giai đoạn 0

- [ ] Navigation theo vai trò 2 cấp, không dùng hub page và không tự điều hướng khi mở nhóm.
- [ ] Dashboard theo vai trò là `Công việc của tôi`; Admin có toggle `Điều hành`.
- [ ] Work Queue Matrix tại 6.1 đúng task, priority, route và CTA.
- [ ] Bỏ KPI trùng tab; giữ tối đa 3 số liệu tiền dạng dòng.
- [ ] Default Column Matrix tại 6.2 đáp ứng nghiệp vụ và breakpoint.
- [ ] Một CTA primary cho mỗi task region; secondary action không cạnh tranh thị giác.
- [ ] Filter nâng cao đặt trong drawer; active filter luôn nhìn thấy.
- [ ] OCR mặc định chỉ hiện trường cần kiểm tra, đủ số trường của template HĐ cho thuê phòng (43) và có source highlight.
- [ ] Route cũ được giữ; route/query mới tuân thủ Phụ lục B.
- [ ] `Kỳ báo cáo` là state chung nhưng control chỉ hiện ở page có kỳ.
- [ ] Mobile Capability Matrix được chấp thuận.
- [ ] Component contract của Table v2 và Draft guard được Tech Lead chấp thuận.
- [ ] WCAG 2.2 AA là tiêu chuẩn nghiệm thu reference screens.
- [ ] Phạm vi/estimate A-B và test evidence được Delivery Owner chấp thuận.
- [ ] Tất cả decision D-04 đến D-17 đã chuyển thành `Approved` hoặc `Rejected` kèm phương án thay thế.
- [ ] **[v2.4]** Các Open Items chờ họp trực tiếp (Phụ lục E.2: Q7, Q16, Q24, Q26, Q28) đã có lịch họp và biên bản trước sign-off metric.

### 18.3. Chữ ký

| Vai trò | Họ tên | Quyết định | Ngày |
| --- | --- | --- | --- |
| Product Owner |  | Approve / Reject / Approve with conditions |  |
| UX/UI Lead |  | Approve / Reject / Approve with conditions |  |
| Tech Lead |  | Approve / Reject / Approve with conditions |  |
| Delivery/Project Owner |  | Approve / Reject / Approve with conditions |  |

### 18.4. Implementation gate

- Được phép bắt đầu task flow và wireframe khi D-04/D-05/D-08 còn Pending; wireframe phải thể hiện phương án khuyến nghị.
- Không implement navigation config final khi D-04, D-05 hoặc D-06 chưa Approved.
- Không cam kết đợt B khi D-08 chưa Approved và estimate chưa được re-baseline sau reference screens.
- Không dùng phương án mặc định chỉ vì quá hạn phản hồi; Project Owner phải ghi nhận quyết định trì hoãn hoặc escalation.
- **[v2.4]** Không implement `Quy tắc gửi tự động` và `Hội thoại Zalo` (7.7) khi D-16/D-17 chưa Approved; không đổi navigation theo Q1/Q23/Q33 khi D-13/D-14/D-15 chưa Approved.

---

## 19. Route Coverage Matrix **[v2.2]**

Ma trận này là traceability giữa route, template redesign và acceptance. Phụ lục A tiếp tục là nguồn chi tiết cho permission/navigation.

| Route/nhóm route | Template đích | Mức thay đổi | Reference | Acceptance chính |
| --- | --- | --- | --- | --- |
| `/dashboard` | Role dashboard/work queue | Rewrite | Dashboard Vận hành + Kế toán | Work Queue Matrix, role/phase filter, ≤2 click |
| `/buildings`, `/buildings/:id` | List + detail | Major | Phòng list làm chuẩn list | Default columns, tabs ≤6, permission action |
| `/rooms`, `/rooms/:id` | List + detail | Rewrite/Major | **Reference** | 1366 không scroll; contextual CTA; tabs |
| `/tenants`, `/tenants/:id` | List + detail | Major | Pattern Phòng/Hợp đồng | Identity cell; default tab Tổng quan; context restore |
| `/contracts`, `/contracts/:id` | List + detail | Rewrite/Major | **Reference list** | Default Column Matrix; action theo status |
| `/contracts/new` | Wizard | Major | Wizard contract | Draft restore; guard; ≤10 field mở/bước |
| `/contracts/ocr` | Review workspace | Rewrite | **Reference** | Error queue; highlight; confirm-next; guard |
| `/landlords`, `/landlords/:id` | List + detail | Major | List/detail pattern | Role action; payment info progressive disclosure |
| `/invoices`, `/invoices/:id` | List + detail | Major | Công nợ pattern | Một primary; period lock; money format |
| `/invoices/batch` | Wizard | Major | Wizard pattern | Draft; validation summary; locked period |
| `/receivables`, `/payments/:id` | List + detail | Rewrite/Major | **Reference list** | Priority sort; record partial payment; period context |
| `/refunds`, `/refunds/new`, `/refunds/:id` | List + wizard + workflow detail | Major | Detail/wizard pattern | CTA theo role/status; timeline; approval guard |
| `/expenses` | List + drawer/modal | Major | List pattern | Default columns; allocation/depreciation disclosure |
| `/zalo/*` | List + wizard + detail/config | Major | Wizard/list pattern | Retry policy; readable provider error; RBAC; bước Kiểm tra hiển thị khách chưa liên kết + dự phòng (7.7) |
| `/zalo/config?tab=rules` **[v2.4]** | Rule list + drawer form | New (tùy chọn) | List/drawer pattern | Chỉ render khi D-16 Approved; ≤7 cột; xem trước đối tượng |
| `/zalo/inbox`, `/tenants/:id?tab=zalo` **[v2.4]** | Inbox + detail tab | New (tùy chọn) | List/detail pattern | Chỉ render khi D-17 Approved; scope theo trưởng phòng |
| `/documents` **[v2.4]** | List | Moderate | List pattern | Phạm vi HĐ khách thuê + HĐ chủ nhà; upload theo `documents.manage`; hạn tài liệu |
| `/landlords?due=1` **[v2.4]** | Filtered list | Moderate | List pattern | Kỳ trả chủ nhà đến hạn; đồng bộ với work queue 6.1 |
| `/settings/users`, `/settings/catalog` | Admin list/config | Moderate | List/form pattern | Admin-only; no hidden permission action |
| `/settings/import` | Import wizard/review | Major | Review queue pattern | Upload-map-review-confirm; error evidence |
| `/settings/jobs`, `/settings/jobs/:id` | List + job detail | Major | Detail pattern | Progress; retry eligibility; audit log |
| `/settings/tools` | Admin tools | New | Shell settings | `advancedTools`; destructive confirmation; demo label |
| `/reports`, `/reports/hub`, `/reports/r/:key`, `/reports/cashflow` | Report catalog/report | Moderate/Major | Report pattern | Period/lock state; OI distinction; export |
| `/reports/new`, `/reports/runs/:id` **[v2.5]** | Report wizard + report record | New | Wizard + Detail pattern | Type runnable; Từ kỳ–Đến kỳ ≤ 12; snapshot immutable; CSV = preview |
| `/crm` | Role dashboard | Major | Dashboard Kinh doanh | Funnel/next work; no hard-code delta |
| `/crm/leads*` | List/Kanban + detail | Major | List/Kanban pattern | Shared filter state; contextual stage CTA |
| `/crm/viewings*`, `/crm/holds*`, `/crm/deals*` | List + wizard/detail | Major | Wizard/detail pattern | Draft; stage guard; role action |
| `/finance/statement-import`, `/finance/opening-balance` | Import/reconciliation wizard | Major | Review queue pattern | Error-first review; idempotent actions |
| `/finance/deposits` | List | Moderate | List pattern | Distinguish contract/hold/refund; route link |
| `/finance/bank` | Reconciliation workspace | Major | Review queue pattern | Unmatched-first; proposal reason/confidence |
| `/maintenance`, `/maintenance/incidents/:id` | List + timeline detail | Major | List/detail pattern | SLA priority; assignee scope; update flow |
| `/maintenance/schedules` | Calendar/list | Major | Calendar pattern | Month/list parity; due filter; laptop use |
| `/assets`, `/assets/inventory*` | List + review/detail | Major | Review queue/list | Needs-action-first; bulk action visibility |
| `/hr`, `/hr/:id` | List + detail | Major | List/detail pattern | HR permission; tabs; probation work queue |
| `/hr/timesheet`, `/hr/payroll` | Matrix/status workflow | Major | Matrix exception | Sticky identity; intentional scroll; approval state |
| `/investment/projects`, `/investment/shareholders`, `/investment/roi` | List/tabs/report | Major | Report/list pattern | Shareholder scope; read-only action; formulas |
| `/coming-soon/:key` | Teaser | Moderate | Launcher pattern | Chỉ render khi D-04 Approved |

Mỗi route khi chuyển trạng thái sang `Done` phải có: screenshot ở viewport áp dụng, route/role smoke result, permission check và liên kết tới acceptance test tương ứng.

---

## 20. Component Inventory **[v2.2]**

| Component hiện tại | Quyết định | Component đích/hành vi | Điều kiện migrate |
| --- | --- | --- | --- |
| `L.MENU`, `.sidebar` | Rewrite | Navigation config theo role + collapsed/flyout + launcher | 7 role test và D-04/D-05/D-06 Approved |
| `.topbar` | Major update | Search, quick create, guide, notification, user; bỏ period toàn cục | Keyboard/focus và role quick-create test |
| `U.pageHead` | Extend | Title/meta/status/period slot + một primary + secondary menu | Page cũ vẫn render được |
| `U.statusTabs` | Retain/update | Count, keyboard tab semantics, optional status-column behavior | Count khớp selector |
| `U.filterbar` | Deprecate dần | `U.listToolbar` + advanced filter drawer + active chips | Query cũ được giữ; page cũ dùng được filterbar |
| `U.table` | Rewrite compatible | Data table v2 theo 10.4 | Backward-compatibility suite bắt buộc |
| `U.kpi` | Retain/simplify | Không hard-code delta; semantic tone có ý nghĩa | Dashboard/reference review |
| `U.card` | Style update | Border surface, giảm shadow/nesting | Visual regression |
| `U.wizard` | Major update | Compact stepper, draft indicator, sticky footer | Draft/guard test |
| `U.docPreview` | Extend | `data-field`, source locator, scroll-to-highlight | OCR test 16.4 |
| `U.modal`, `U.confirm` | Retain/update | Focus trap, return focus, destructive copy | Keyboard/accessibility test |
| Drawer mới | New | Filter, activity, quick edit, secondary preview | Focus/escape/backdrop test |
| `U.toast` | Retain | Success/error feedback; không thay validation inline | Screen reader announcement |
| Form helpers | Extend | Error summary, field association, draft integration | `aria-describedby`, first-error focus |

Không xóa component cũ khi vẫn còn route chưa migrate. Deprecation chỉ hoàn tất ở cuối đợt B sau khi route coverage không còn consumer.

---

## Phụ lục A. Ánh xạ menu cũ và route → navigation mới **[v2.1]**

Nguồn: `mockup/js/ui/layout.js` (`L.MENU`, 41 item), các lời gọi `register()` trong `mockup/js/pages/*.js` (63 route + `/__kit` nội bộ), `mockup/js/core/auth.js` (`PERMS`, `P2_READ`).

Cột `Cấp 1 / Cấp 2` là vị trí cho Admin; cột `Role khác` ghi vị trí với role còn lại (`L` = chỉ trong `Phân hệ & Quản trị`, `–` = không có quyền).

### A.1. Route danh sách/màn chính

| Route | Menu cũ | Phase | Permission | Admin: Cấp 1 / Cấp 2 | Vận hành | Kế toán | Kinh doanh | Kỹ thuật | Nhân sự | Cổ đông |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/dashboard` | Tổng quan | 1 | dashboard.view | Tổng quan | Công việc của tôi | Công việc của tôi | Công việc của tôi | Công việc của tôi | Công việc của tôi | Tổng quan đầu tư |
| `/rooms` | Vận hành/Phòng | 1 | rooms.view | Quản lý cho thuê / Phòng | Phòng & tòa nhà | Tra cứu | Tra cứu [RO] | Tra cứu [RO] | – | – |
| `/buildings` | Vận hành/Tòa nhà | 1 | buildings.view | Quản lý cho thuê / Tòa nhà | Phòng & tòa nhà | Tra cứu | Tra cứu [RO] | Tra cứu [RO] | Tra cứu [RO] | – |
| `/tenants` | Vận hành/Khách thuê | 1 | tenants.view | Quản lý cho thuê / Khách thuê | Khách thuê & hợp đồng | Tra cứu | Tra cứu [RO] | – | – | – |
| `/contracts` | Vận hành/Hợp đồng | 1 | contracts.view | Quản lý cho thuê / Hợp đồng | Khách thuê & hợp đồng | Tra cứu | Tra cứu [RO] | – | – | – |
| `/contracts/ocr` | (không có) | 2 | ocr.use | Quản lý cho thuê / OCR hợp đồng | Khách thuê & hợp đồng / OCR | – | – | – | – | – |
| `/landlords` | Vận hành/Chủ nhà & đối tác | 1 | landlords.view | Quản lý cho thuê / Chủ nhà & đối tác | Phòng & tòa nhà | Tra cứu | – | – | – | – |
| `/crm` | Kinh doanh/Tổng quan KD | 2 | crm.view | Kinh doanh / Tổng quan kinh doanh | L | L | Kinh doanh / Tổng quan kinh doanh | – | – | – |
| `/crm/leads` | Kinh doanh/Khách hàng-Lead | 2 | crm.view | Kinh doanh / Lead | Lịch xem & giữ chỗ / Lead [xem] | L | Kinh doanh / Lead | – | – | – |
| `/crm/viewings` | Kinh doanh/Lịch xem phòng | 2 | crm.view | Kinh doanh / Lịch xem | Lịch xem & giữ chỗ | L | Kinh doanh / Lịch xem phòng | – | – | – |
| `/crm/holds` | Kinh doanh/Giữ chỗ | 2 | crm.view | Kinh doanh / Giữ chỗ | Lịch xem & giữ chỗ | L | Kinh doanh / Giữ chỗ | – | – | – |
| `/crm/deals` | Kinh doanh/Giao dịch & hoa hồng | 2 | deals.view | Kinh doanh / Giao dịch & hoa hồng | – | L | Kinh doanh / Giao dịch & hoa hồng | – | – | – |
| `/invoices` | Tài chính/Hóa đơn | 1 | invoices.view | Tài chính / Hóa đơn | Tài chính vận hành / Hóa đơn [xem] | Tài chính / Hóa đơn | – | – | – | – |
| `/receivables` | Tài chính/Thu tiền & công nợ | 1 | payments.view | Tài chính / Thu tiền & công nợ | Tài chính vận hành | Tài chính / Thu tiền & công nợ | – | – | – | – |
| `/refunds` | Tài chính/Hoàn cọc | 1 | refunds.view | Tài chính / Hoàn cọc | Tài chính vận hành | Tài chính / Hoàn cọc | – | – | – | – |
| `/finance/deposits` | Tài chính/Quản lý cọc | 2 | deposits.view | Tài chính / Quản lý cọc | Tài chính vận hành | Tài chính / Quản lý cọc | – | – | – | – |
| `/expenses` | Tài chính/Chi phí | 1 | expenses.view | Tài chính / Chi phí | Tài chính vận hành | Tài chính / Chi phí | – | Tra cứu / Chi phí liên quan [RO] | – | – |
| `/finance/bank` | Tài chính/Ngân hàng | 3 | bank.view | Tài chính / Ngân hàng | – | Tài chính / Ngân hàng | – | – | – | – |
| `/finance/statement-import` | Tài chính/Nhập bảng kê | 2 | statement.import | Phân hệ & Quản trị / Thiết lập | – | Dữ liệu & đối soát / Nhập bảng kê | – | – | – | – |
| `/finance/opening-balance` | Tài chính/Chuyển số dư | 2 | openingBalance.manage | Phân hệ & Quản trị / Thiết lập | – | Dữ liệu & đối soát / Số dư ban đầu | – | – | – | – |
| `/settings/jobs` | Cấu hình/Nhập dữ liệu & tác vụ | 2 | dataJobs.view | Phân hệ & Quản trị / Thiết lập | L | Dữ liệu & đối soát / Tác vụ dữ liệu | – | – | – | – |
| `/reports/cashflow` | Tài chính/Thu chi | 2 | reports.hub | Báo cáo / Thu chi | – | Báo cáo | – | – | – | – |
| `/maintenance` | Vận hành/Bảo trì - Sửa chữa | 2 | maintenance.view | Vận hành / Sự cố | Bảo trì & tài sản | L [xem] | – | Công việc kỹ thuật / Sự cố được giao (`?assignee=me`) | – | – |
| `/maintenance/schedules` | Vận hành/Lịch công việc | 2 | maintenance.view | Vận hành / Lịch bảo dưỡng | Bảo trì & tài sản | L | – | Công việc kỹ thuật / Lịch bảo dưỡng | – | – |
| `/assets` | Đầu tư/Tài sản | 3 | assets.view | Vận hành / Tài sản | Bảo trì & tài sản | L | – | Tra cứu / Tài sản | – | – |
| `/assets/inventory` | (không có) | 3 | inventory.view | Vận hành / Kiểm kê | Bảo trì & tài sản | L | – | Tra cứu / Kiểm kê | – | – |
| `/zalo/history` | Thông báo/Lịch sử gửi | 1 | zalo.view | Vận hành / Thông báo Zalo | – | L | – | – | – | – |
| `/zalo/batches/new` | Thông báo/Tạo đợt gửi | 1 | zalo.send | (CTA trong `/zalo/history`; quick create) | – | – | – | – | – | – |
| `/zalo/config` | Thông báo/Cấu hình Zalo; Cấu hình/Thông báo & nhắc việc | 1 | zalo.config | Phân hệ & Quản trị / Thiết lập (secondary action ở `/zalo/history`) | – | – | – | – | – | – |
| `/reports` | Báo cáo/Báo cáo Phase 1 | 1 | reports.view | Báo cáo / Báo cáo Phase 1 | – | Báo cáo | – | – | – | – |
| `/reports/hub` | Báo cáo/Trung tâm báo cáo (danh sách bản ghi) | 2 | reports.hub | Báo cáo / Trung tâm báo cáo | – | Báo cáo | – | – | – | – |
| `/reports/new` **[v2.5]** | Báo cáo/Tạo báo cáo | 2 | reports.hub | Từ nút Tạo báo cáo ở `/reports/hub` | – | Báo cáo | – | – | – | – |
| `/reports/runs/:id` **[v2.5]** | Báo cáo/Bản ghi báo cáo | 2 | reports.hub | Từ danh sách `/reports/hub` | – | Báo cáo | – | – | – | – |
| `/hr` | Nhân sự/Nhân viên | 3 | hr.view | Phân hệ & Quản trị / Nhân sự | – | – | – | – | Nhân viên | – |
| `/hr/timesheet` | Nhân sự/Chấm công | 3 | timesheet.view | Phân hệ & Quản trị / Nhân sự | – | – | – | – | Chấm công | – |
| `/hr/payroll` | Nhân sự/Lương thưởng | 3 | payroll.view | Phân hệ & Quản trị / Nhân sự | – | L (duyệt) | – | – | Lương thưởng | – |
| `/investment/projects` | Đầu tư/Dự án | 3 | projects.view | Phân hệ & Quản trị / Đầu tư | – | L | – | – | – | Dự án |
| `/investment/shareholders` | Đầu tư/Hiệu quả đầu tư (nhầm nhãn) | 3 | shareholders.view | Phân hệ & Quản trị / Đầu tư | – | L | – | – | – | Vốn góp & phân phối |
| `/investment/roi` | (không có) | 3 | roi.view | Phân hệ & Quản trị / Đầu tư | – | L | – | – | – | Hiệu quả đầu tư |
| `/settings/users` | Cấu hình/Tài khoản & phân quyền | 1 | users.manage | Phân hệ & Quản trị / Thiết lập | – | – | – | – | – | – |
| `/settings/catalog` | Cấu hình/Danh mục dùng chung | 1 | catalog.view | Phân hệ & Quản trị / Thiết lập | – | L | – | – | – | – |
| `/settings/import` | Cấu hình/Import dữ liệu | 1 | import.view | Phân hệ & Quản trị / Thiết lập | L | L | – | – | – | – |
| `/coming-soon/:key` | (đích của mục scopeOnly) | 1 | dashboard.view | Chỉ dùng cho teaser khi D-04 Approved | | | | | | |

### A.2. Route detail/wizard (không xuất hiện trên menu, đến từ list hoặc quick create)

`/buildings/:id`, `/rooms/:id`, `/tenants/:id`, `/contracts/new`, `/contracts/:id`, `/landlords/:id`, `/invoices/batch`, `/invoices/:id`, `/payments/:id`, `/refunds/new`, `/refunds/:id`, `/zalo/batches/:id`, `/crm/leads/:id`, `/crm/viewings/new`, `/crm/holds/new`, `/crm/deals/new`, `/crm/deals/:id`, `/maintenance/incidents/:id`, `/settings/jobs/:id`, `/reports/r/:key`, `/assets/inventory/:id`, `/hr/:id`. Breadcrumb của các route này trỏ về mục cấp 1/cấp 2 tương ứng ở A.1.

### A.3. Mục menu cũ không còn destination riêng

| Mục cũ | Xử lý |
| --- | --- |
| `Kênh cho thuê`, `Marketing` (scopeOnly, coming-soon) | Chỉ hiển thị trong `Phân hệ & Quản trị` khi D-04 Approved; không nằm trong 7 mục |
| `Thiết lập hệ thống` (scopeOnly) | Thay bằng route mới `#/settings/tools` |
| `Cấu hình/Thông báo & nhắc việc` (trùng `/zalo/config`) | Bỏ mục trùng |
| Footer `Công cụ nâng cao` | Chuyển vào `#/settings/tools` |
| Mục `Đầu tư/Hiệu quả đầu tư` trỏ `/investment/shareholders` | Sửa nhãn: `Vốn góp & phân phối`; `Hiệu quả đầu tư` trỏ `/investment/roi` |

Kiểm tra: 41 mục cũ đều có dòng trong A.1 hoặc A.3; 63 route đều có trong A.1 hoặc A.2.

---

## Phụ lục B. Route và query mới **[v2.1]**

| Loại | Giá trị | Permission | Phase | Bắt buộc? | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| Route | `#/settings/tools` | advancedTools | 1 | Có | Công cụ demo: phase switch, reset, JSON, kịch bản, đổi ngày, reset guide |
| Query | `/dashboard?view=work\|exec` | dashboard.view | 1 | Có | Toggle của Admin; role khác bỏ qua |
| Query | `/maintenance?assignee=me` | maintenance.view | 2 | Có | Mặc định cho Kỹ thuật |
| Query | `/expenses?source=incident` | expenses.view | 2 | Có | Chi phí phát sinh từ sự cố |
| Query | `/investment/shareholders?tab=contributions\|distributions` | shareholders.view | 3 | Có | Tách Vốn góp / Phân phối |
| Query | `?filterOpen=1`, `?reviewMode=errors\|all`, `?density=` | – | – | Tùy chọn | Trạng thái UI trên URL |
| Route | `#/investment/distributions` | shareholders.view | 3 | Tùy chọn | Chỉ khi tab không đủ; dùng dữ liệu `distributions` hiện có |
| Query **[v2.4]** | `/landlords?due=1` | landlords.view | 1 | Có | Kỳ trả chủ nhà đến hạn (Q8); nguồn cho work queue Admin/Kế toán |
| Query **[v2.4]** | `/zalo/config?tab=rules` | zalo.config | 2 | Tùy chọn | Quy tắc gửi tự động (Q34); chỉ khi D-16 Approved |
| Route **[v2.4]** | `#/zalo/inbox` | zalo.view | 2 | Tùy chọn | Hội thoại Zalo theo trưởng phòng (Q37); chỉ khi D-17 Approved |
| Query **[v2.4]** | `/tenants/:id?tab=zalo` | tenants.view | 2 | Tùy chọn | Tab hội thoại trong detail khách thuê; chỉ khi D-17 Approved |
| Route **[v2.5]** | `#/reports/new` | reports.hub | 2 | Có | Wizard tạo báo cáo; query `?type=<key>` (bước 2), `?cat=&s=` (lọc bước 1) |
| Route **[v2.5]** | `#/reports/runs/:id` | reports.hub | 2 | Có | Bản ghi báo cáo (snapshot) – xem trước, tải CSV, tạo lại, xóa |
| Query **[v2.5]** | `/reports/hub?cat=&type=&per=&createdBy=&s=` | reports.hub | 2 | Tùy chọn | Bộ lọc danh sách bản ghi; `per` là kỳ chứa trong bản ghi (không đồng bộ `meta.period`) |

Launcher `Phân hệ & Quản trị` là popover, không phải route. `Công việc của tôi` dùng `/dashboard`, không tạo route mới.

---

## Phụ lục C. Lịch sử thay đổi chi tiết

### C.0. Thay đổi từ v2.3 lên v2.4

1. Đối chiếu 36 câu trả lời làm rõ nghiệp vụ của khách (06/09/2026) vào Phụ lục E; phân loại xác nhận / bác bỏ / bổ sung / chờ họp / ghi nhận.
2. Sửa ngữ nghĩa T/S/G thành tiền tố mã tòa (`Nhóm tòa`), bỏ nhãn giả định trên cột này (7.2, 13.4, D.1, D.3, D-18).
3. Xác nhận các rule đã có trong mockup: 35 ngày báo trước (Q9), công nợ sau 5 ngày (Q14), khấu hao 200k/phòng (Q17), hoa hồng % chi sau cọc + ký HĐ và theo cá nhân (Q19/Q20), nhắc bảo dưỡng 7 ngày (Q32), ZNS (Q35), fallback SMS (Q36); ghi rõ không thêm cấu hình cho các hằng số này (7.8).
4. Work Queue Matrix: thêm `Kỳ trả tiền chủ nhà đến hạn` cho Admin/Kế toán; mở `Kiểm kê cần xử lý` cho Kế toán; đổi `Nghĩa vụ góp vốn` thành `Kỳ đóng tiền nhà` theo % vốn góp; ghi chú phòng chờ dọn sau hoàn cọc.
5. Hợp đồng: OCR là luồng chính khi tải file (Q10); xe không giới hạn và sinh dòng phí gửi xe (Q12); chuẩn hóa `Giá niêm yết`/`Giá thuê` (Q13); `Phân khúc` nhập tay (Q25).
6. Hoàn cọc và chi phí: prefill khấu hao cố định, duyệt bởi Admin/Kế toán, hiển thị hai giá trị chi thực tế/khấu hao cho khoản đầu tư (Q6/Q15/Q17).
7. Zalo (7.7): thêm khối Kênh gửi và dự phòng, Quy tắc gửi tự động (D-16) và Hội thoại Zalo (D-17); bảng so sánh chi phí tại E.3.
8. Báo cáo: thêm metric `perf.actual`/`perf.provisional` (Q22); ghi nhận người xem báo cáo lợi nhuận (Q23 → D-14); giữ nhãn giả định cho công thức chờ họp.
9. Phase 3: kiểm kê tháng cho Admin/Kế toán (Q33), khấu hao khoản đầu tư (Q6), ba trạng thái nhân viên (Q27), `Lịch đóng tiền nhà` và tỷ lệ nhập tay có validate (Q29/Q30), thống kê cổ đông liên kết Tòa nhà (Q31).
10. Decision Log: thêm D-13 đến D-18; cập nhật checklist 18.2 và implementation gate 18.4; navigation 4.2/Phụ lục A giữ nguyên chờ D-13/D-14/D-15.
11. Route Coverage và Phụ lục B: thêm `/landlords?due=1`, `/zalo/config?tab=rules`, `#/zalo/inbox`, `/tenants/:id?tab=zalo`, bổ sung `/documents` vào ma trận.
12. Phụ lục D: cập nhật contract `buildingType`, phạm vi và quyền upload Trung tâm Tài liệu (Q3); tham chiếu Decision Pack v1.1.
13. OCR (8.2): card Kết quả trích xuất theo thực thể, tài liệu cuộn liên tục, OCR = bước tạo khách thuê (khớp SĐT/CCCD, tạo mới từ HĐ), tách mã phòng/tòa và gợi ý phòng; thêm `tenants.address`, `tenants.idPlace` (D.1). Thay mô phỏng 29 trường bằng parser thật theo template HĐ của Linh (43 trường, 7 nhóm, bảng tài sản), đọc PDF text-based qua pdf.js hoặc .txt; prefill wizard hợp đồng gồm xe và đơn giá dịch vụ; file mẫu `mau-hop-dong-ocr.txt` cập nhật theo template.
14. **[v2.5]** Báo cáo (8.5): Trung tâm báo cáo = danh sách bản ghi + wizard Tạo báo cáo (loại → tham số Từ kỳ–Đến kỳ) → bản ghi snapshot có xem trước và tải CSV; route `/reports/new`, `/reports/runs/:id`; collection `reportRuns`; guide F15.1 đổi sang luồng tạo bản ghi.

### C.1. Thay đổi từ v2.1 lên v2.2

1. Đồng bộ tên file, tiêu đề, metadata tài liệu và thêm lịch sử phiên bản/chữ ký.
2. Sửa navigation: group click chỉ expand, không đồng thời điều hướng; định nghĩa flyout bằng click/focus và keyboard.
3. Thêm Work Queue Matrix theo 7 role với selector, priority, route, CTA và dedup rule.
4. Sửa quy tắc 7 cột thành 7 cột nghiệp vụ, loại trừ checkbox/action; thêm Default Column Matrix và ngoại lệ bảng ma trận.
5. Khóa contract tương thích của Data table v2 gồm input, output methods, event, selection, focus và preference fallback.
6. Khóa hành vi Draft store/unsaved guard, key theo user, modal rời trang và thời hạn draft.
7. Thêm Mobile Capability Matrix, WCAG 2.2 AA, contrast threshold và quy chuẩn microcopy/format.
8. Re-baseline estimate, nêu rõ nguồn lực, contingency và điều kiện chốt thương mại.
9. Bỏ fallback `nếu không kịp` trong regression; quy định automated smoke/contract test và evidence path.
10. Thêm UAT task script, severity scale và cách đo thời gian tìm chức năng.
11. Mở rộng acceptance đợt A cho navigation, table, draft, OCR, accessibility và P2/P3 smoke.
12. Thay quyết định mặc định bằng Decision Log có owner/status/gate; không coi im lặng là đồng ý.
13. Thêm Route Coverage Matrix và Component Inventory để trace từ spec đến implementation/test.
14. Đổi tên customer-facing của launcher từ “Ứng dụng”/“Tất cả ứng dụng” thành `Phân hệ & Quản trị`; đồng bộ topbar, popover, Decision Log và Route Coverage Matrix.
15. Audit navigation theo account: đổi `Cho thuê` thành `Quản lý cho thuê`; chuẩn hóa `Sale` thành `Kinh doanh`; bổ sung route đã cấp quyền vào sidebar và loại tile launcher trùng sidebar.

### C.2. Thay đổi từ v2.0 lên v2.1

1. **Route:** bỏ câu "menu mới chỉ thay đổi cách nhóm route"; ghi rõ được thêm route/query theo Phụ lục B (1 route bắt buộc, 1 tùy chọn).
2. **Ánh xạ:** thêm Phụ lục A cho 41 mục menu cũ và 63 route; loại các mục v2.0 không có route hoặc vượt quyền (`Báo cáo vận hành`, `Phân công`, `Báo cáo nhân sự`, `Vốn góp`/`Phân phối lợi nhuận` riêng, hub `Tòa nhà và phòng`, hub `Thông báo`).
3. **Mô hình nav:** chốt 2 cấp (≤ 7 + submenu ≤ 6), bỏ hub page, launcher `Phân hệ & Quản trị` là popover; `Công việc của tôi` = `/dashboard` theo role.
4. **Zalo** ở `Vận hành` của Admin thay vì launcher `Phân hệ & Quản trị`; `Nhập bảng kê`/`Chuyển số dư`/`Data Job` chuyển Thiết lập (Admin) hoặc `Ngân hàng & đối soát` (Kế toán).
5. **Kỳ báo cáo:** giữ `meta.period` dùng chung; liệt kê màn có control kỳ (4.4).
6. **Số liệu:** OCR hiện đủ 29 trường (thêm nhóm 6 trường meta); density 2 mức; cột Hợp đồng bỏ `Còn lại` trùng; bảng 13 px; topbar thêm `Hướng dẫn thao tác`; định nghĩa quick create theo role; tỷ lệ OCR có ngưỡng tối thiểu 460 px.
7. **Tiền đề kỹ thuật (mục 11 mới):** partial re-render, draft store + unsaved guard, gộp uiPrefs với các pref hiện có, sidebar collapse/flyout, ngoại lệ schema; Data table là viết lại có tương thích ngược.
8. **Phạm vi & ước lượng (mục 14 mới):** chia đợt A/B, ước lượng sơ bộ, công tắc `ui.v2` để rollout.
9. **Thứ tự triển khai:** thêm giai đoạn 0 wireframe trước checklist; duyệt A trước khi nhân rộng.
10. **Test plan:** nêu rõ giới hạn `npm run check`; mở rộng Playwright P1 và bổ sung P2/P3; điều kiện tiên quyết UAT.
11. **Checklist:** thêm 3 quyết định cần khách chọn (teaser P2/P3, vị trí Zalo, đối tượng ưu tiên) kèm mặc định.
12. **Baseline:** bảng 1.1 có số đo hiện tại để so sánh sau redesign.
13. Bỏ số delta hard-code trên KPI; Report Hub ghi nhận phần đã có sẵn; Payroll giữ mô hình trạng thái thay vì wizard; detail phòng gộp tab để ≤ 6.

## Phụ lục D. Workbook Alignment v2.3

### D.1. Ngoại lệ schema được phép

Theo D-12, mockup được thêm các collection `areas`, `salesTeams` và các field sau: `buildings.areaId`, `buildings.buildingType`, `buildings.areaM2`, `buildings.condition`, `buildings.operatingSince`, `buildings.licenseExpiry`, `buildings.pccc`, `expenseGroups.parentCode`, `expenses.categoryCode`, `refundDeductions.groupCode`, `services.wbType`, `contracts.vehicles`, `leadSources.kind`, `leads.handoverDate`, `users.teamId`, `documents.expiry`, **[v2.4]** `tenants.address` (hộ khẩu thường trú), `tenants.idPlace` (nơi cấp CCCD) – điền từ OCR hoặc form khách thuê; **[v2.5]** collection `reportRuns` (`code`, `type`, `name`, `cat`, `params{periodFrom, periodTo, buildingId, …dims}`, `periods[]`, `rowCount`, `snapshot.byPeriod[]{period, kpi, headers, rows}`, `note`, `rerunOf`, `createdBy`) – bản ghi báo cáo, snapshot text thuần.

Ràng buộc:

- Chỉ additive; field legacy vẫn đọc được và không bị ghi đè ngoài backfill đã mô tả.
- `TH.seed.workbook(st)` chạy idempotent trong migration và đặt `meta.wbSeeded=true`.
- Không tăng hằng `SCHEMA`; state hiện hữu phải load được.
- Migration production, nếu có, là deliverable riêng và không được suy ra trực tiếp từ seed mockup.
- **[v2.4]** `buildings.buildingType` giữ giá trị `T|S|G` nhưng ngữ nghĩa là **tiền tố mã tòa** (T2, T3, S1, S2, G1, G2…), không phải loại sở hữu (D-18). Giá trị phải suy ra từ ký tự đầu của `buildings.code`; seed `buildingTypeOf` và fixup `meta.wbFixups.buildingTypeV2` trong `seed-wb.js` cần thay bằng derive-from-code, nhãn `Q.L.buildingType` đổi thành `T`, `S`, `G` (không kèm mô tả sở hữu).
- **[v2.4]** `contracts.vehicles` không giới hạn số phần tử; mỗi phần tử sinh một dòng phí gửi xe trên hóa đơn theo kỳ (Q12).

### D.2. Dimension và công thức dùng chung

- `Q.scope(f)` là nguồn sự thật cho kỳ, Khu nhà, tòa, loại nhà, quản lý, trưởng nhóm, vận hành, cổ đông, sale và team.
- `TH.metrics` là registry bắt buộc cho KPI/báo cáo workbook; mỗi metric có công thức, includes/excludes, trạng thái `approved|assumed` và owner.
- Công thức `assumed` phải hiện nhãn `Giả định – chờ xác nhận` và không được dùng để tuyên bố số liệu kế toán đã duyệt.
- Decision Pack chi tiết: `docs/TimeHouse-Workbook-Alignment-Decisions-v1.0.md` (nội dung v1.1 sau đối chiếu 06/09/2026).
- **[v2.4]** Trạng thái metric sau câu trả lời của khách: `revenue.newDeposit`, `profit.actual`, `profit.business` chuyển `Approved` (Q15); thêm `perf.actual`, `perf.provisional` `Approved` (Q22); `margin.rent`, `vacancy.days`, `utility.diff`, `ontime.rate`, `roi.asset` giữ `Assumed` đến khi họp trực tiếp (Q7/Q16/Q24). Chi tiết tại Decision Pack mục 4.

### D.3. Route và query bổ sung

| Loại | Giá trị | Contract |
|---|---|---|
| Route | `#/documents` | Index tài liệu dùng chung. **[v2.4]** Phạm vi theo khách (Q3): hợp đồng thuê của khách thuê và hợp đồng với chủ nhà; quyền xem theo role, quyền tải lên cho nhân viên vận hành, trưởng nhóm, Admin, Kế toán (= `documents.manage` hiện tại); cột `Hạn tài liệu` từ `documents.expiry` |
| Query | `vac` | `immediate\|endOfMonth\|waiting` |
| Query | `areaId` | ID Khu nhà |
| Query | `buildingType` | `T\|S\|G` — **[v2.4]** nhóm tòa theo tiền tố mã tòa, nhãn UI `Nhóm tòa` |
| Query | `leadId` | Trưởng khu/trưởng nhóm |
| Query | `opsId` | Nhân sự vận hành hiệu lực |
| Query | `teamId` | Team kinh doanh |
| Query | `shareholderId` | Cổ đông qua dự án/tòa |
| Query | `preset` | Bộ cột, gồm `doisoat` khi page hỗ trợ |

### D.4. UI contract

- Bảng mặc định tiếp tục tuân thủ tối đa bảy cột nghiệp vụ; bộ cột workbook nằm trong preset `Đối soát` và được phép cuộn ngang.
- Xuất CSV lấy đúng bộ cột đang hiển thị.
- Mã nhận diện phòng thống nhất: `Mã tòa · Mã phòng` từ `F.roomRef(building, room)`.
- Dashboard, danh sách và báo cáo dùng cùng dimension/metric; không tự viết lại công thức tại page.

### D.5. Lịch sử v2.3

1. Cho phép schema additive có kiểm soát bằng D-12.
2. Thêm Khu nhà, loại nhà T/S/G, assignment effective-dated và team sale.
3. Thêm taxonomy chi phí hai cấp và chuẩn hóa nhóm khấu trừ hoàn cọc.
4. Thêm metric registry, nhãn giả định và snapshot công thức.
5. Thêm preset bảng Đối soát và export theo cột hiển thị.
6. Thêm route Trung tâm Tài liệu và nhóm báo cáo Workbook Alignment.

## Phụ lục E. Đối chiếu câu trả lời làm rõ nghiệp vụ 06/09/2026 **[v2.4]**

Nguồn: `Cau-hoi-lam-ro-nghiep-vu-Timehouse.xlsx` (gửi 06/09/2026, người gửi Trường Nguyễn; khách hàng đã điền cột “Trả lời của khách hàng”). Câu số 4 không tồn tại trong file (STT nhảy từ 3 sang 5). Sheet `ZALO` và `SO SÁNH CP ZALO` tóm tắt tại E.3.

Ký hiệu cột **Kết luận**: `Xác nhận` = rule/nhãn đã có trong mockup, chỉ đổi trạng thái; `Bác bỏ` = giả định hiện tại sai; `Bổ sung` = cần contract UI mới; `Chờ họp` = khách hẹn trao đổi trực tiếp; `Ghi nhận` = không đổi spec.

### E.1. Bảng đối chiếu

| STT | Nhóm | Câu hỏi (rút gọn) | Trả lời của khách | Kết luận | Mục spec | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Chung | Ai xem/sửa công nợ, lương, hoa hồng | Admin và Kế toán | Bổ sung (phân quyền) | 4.2 ghi chú | D-13 |
| 2 | Chung | Loại nhà T, S, G là gì | Ký hiệu tiền tố mã tòa: T2, T3, S1, S2, G1, G2 | Bác bỏ giả định “loại sở hữu” | 7.2, 13.4, D.1, D.3 | D-18 Approved |
| 3 | Chung | Module Tài liệu lưu gì, ai upload | Hợp đồng thuê của khách và chủ nhà; nhân viên, trưởng nhóm, Admin, Kế toán được tải lên | Xác nhận (`documents.manage`) | D.3, mục 19 | – |
| 5 | Tòa nhà | “Thời gian giữ giá” | Thời gian chủ nhà không được phép tăng giá của TimoHouse | Xác nhận, thêm tooltip | 7.2, 13.4 | – |
| 6 | Tòa nhà | Khoản đầu tư có khấu hao không | Có | Bổ sung | 7.6, 9.1 | – |
| 7 | Tòa nhà | Công thức Hiệu suất, Lợi nhuận, Thời gian vận hành tòa | Gặp trực tiếp trao đổi | Chờ họp | 8.5, E.2 | – |
| 8 | Tòa nhà | Chu kỳ thanh toán chủ nhà, có nhắc không | Cần nhắc; đa số 3 tháng/lần, có nhà 4 và 6 tháng | Bổ sung work queue + query | 6.1, 7.2, Phụ lục B | – |
| 9 | Khách thuê | Mốc 35 ngày cố định hay theo tòa | Toàn bộ hệ thống | Xác nhận (`Q.contractStatus`) | 7.4, 7.8 | – |
| 10 | Khách thuê | Upload hợp đồng có đọc tự động không | Nhập dữ liệu tự động từ file | Bổ sung (OCR là luồng chính) | 7.4, 8.2 | – |
| 11 | Khách thuê | Tab Tài chính trong chi tiết khách cần gì | Chưa có | Ghi nhận, giữ đề xuất + nhãn giả định | 7.3 | – |
| 12 | Khách thuê | Giới hạn xe, liên kết phí gửi xe | Không giới hạn; có liên kết sang hóa đơn | Bổ sung | 7.4, D.1 | – |
| 13 | Tài chính | Giá niêm yết vs giá cho thuê | Niêm yết = giá tiêu chuẩn TimoHouse; cho thuê = giá thực tế khách đang thuê | Xác nhận (`listPrice`/`price`) | 7.4, 13.4 | – |
| 14 | Tài chính | Sau bao nhiêu ngày chuyển sang công nợ | Sau 5 ngày kể từ khi có hóa đơn | Xác nhận (BR-07) | 7.5, 7.8 | – |
| 15 | Tài chính | Mua sắm thiết bị hạch toán thế nào | Một lần trong báo cáo LN dòng tiền; khấu hao trong báo cáo kinh doanh | Xác nhận metric `profit.actual`/`profit.business` | 7.6, D.2 | – |
| 16 | Tài chính | Báo cáo kinh doanh của nhà | Gặp trực tiếp trao đổi | Chờ họp | 8.5, E.2 | – |
| 17 | Tài chính | Công thức hoàn cọc, ai duyệt | Admin, Kế toán; khấu hao cố định 200k/phòng; sửa chữa, vệ sinh theo thực tế | Xác nhận (BR-12) + CTA duyệt cho Admin | 7.6 | – |
| 18 | Kinh doanh | Kênh nguồn khách | Facebook, tờ rơi, đăng tin, Zalo | Ghi nhận; 4 nguồn mặc định | 7.8 | – |
| 19 | Kinh doanh | Hoa hồng % hay bậc thang; chi khi nào | Theo %; chi ngay sau khi khách đóng đủ cọc 1 và ký HĐ | Xác nhận (BR-13) | 8.1 | – |
| 20 | Kinh doanh | Hoa hồng theo cá nhân hay team | Theo cá nhân | Xác nhận | 8.1 | – |
| 21 | Kinh doanh | Phòng sau hoàn cọc/phá HĐ có cần kiểm tra/dọn không | Có | Xác nhận (`cleaning`) | 6.1 | – |
| 22 | Báo cáo | Hiệu suất thực tế vs tạm tính | Thực tế = sau khi thu tiền xong; tạm tính = tại thời điểm làm | Bổ sung metric | 8.5, 13.4, D.2 | – |
| 23 | Báo cáo | Ai xem báo cáo LN dòng tiền / kinh doanh | Cổ đông, Admin, Kế toán, trưởng phòng | Bổ sung (phân quyền) | 8.5 | D-14 |
| 24 | Báo cáo | Bảng dự kiến LN dòng tiền | Gặp trực tiếp trao đổi | Chờ họp | E.2 | – |
| 25 | Báo cáo | Phân khúc khách nhập tay hay suy luận | Theo dữ liệu trên hợp đồng | Xác nhận (`tenants.segment` nhập tay) | 7.3 | – |
| 26 | Nhân sự | Công thức lương từng phòng ban | Gặp trực tiếp trao đổi | Chờ họp | 9.2, E.2 | – |
| 27 | Nhân sự | Trạng thái nhân viên | Đang làm, nghỉ việc, thử việc | Ghi nhận; 3 tab, `leave` không có tab riêng | 9.2 | – |
| 28 | Cổ đông | Mẫu Bảng kê chia cổ phần các nhà | Gặp trực tiếp trao đổi | Chờ họp | 9.3, E.2 | – |
| 29 | Cổ đông | Lịch đóng tiền từng người là gì | Lịch cổ đông đóng tiền nhà định kỳ cho chủ nhà theo tỷ lệ % góp vốn | Bổ sung (đổi nghĩa tab Vốn góp) | 6.1, 9.3 | – |
| 30 | Cổ đông | Góp nhiều tòa? Tỷ lệ nhập tay? | Được nhiều nhà; tỷ lệ nhập tay | Xác nhận + validate 100% | 9.3 | – |
| 31 | Cổ đông | Thống kê tài sản/cọc có liên kết Tòa nhà không | Có liên kết | Xác nhận | 9.3 | – |
| 32 | Bảo trì | Nhắc bảo dưỡng trước bao nhiêu ngày | Cần, trước 7 ngày | Xác nhận (BR-16) | 9.1 | – |
| 33 | Bảo trì | Chu kỳ kiểm kê, ai nhập/duyệt | Admin và Kế toán; 1 tháng/lần | Xác nhận quyền + bổ sung navigation | 6.1, 9.1 | D-15 |
| 34 | Zalo | Cấu hình sự kiện cố định hay công cụ tự đặt điều kiện | Công cụ tự đặt điều kiện + thời điểm gửi linh hoạt | Bổ sung (rule builder) | 7.7, Phụ lục B | D-16 |
| 35 | Zalo | OA Broadcast hay ZNS | Zalo ZNS | Xác nhận | 7.7 | – |
| 36 | Zalo | Cách liên kết khách; dự phòng | TimoHouse chủ động gửi; nếu chưa liên kết cần dự phòng | Xác nhận (`fallbackSms`) + bước Kiểm tra | 7.7 | – |
| 37 | Zalo | Ai nhận phản hồi; có đồng bộ hội thoại không | Từng trưởng phòng phụ trách; có đồng bộ | Bổ sung (inbox) | 7.7, Phụ lục B | D-17 |

### E.2. Open Items chờ họp trực tiếp

| Câu | Nội dung cần chốt | Metric/màn bị ảnh hưởng | Nhãn hiện tại | Gate |
| --- | --- | --- | --- | --- |
| Q7 | Công thức Hiệu suất, Lợi nhuận, Thời gian vận hành của từng tòa | `occupancy.rate`, `margin.rent`, `vacancy.days`, detail tòa | `Giả định – chờ xác nhận` | Sign-off metric, trước UAT |
| Q16 | Mục đích và công thức “Báo cáo kinh doanh của nhà” | `wb-building-business`, `utility.diff` | `Giả định – chờ họp trực tiếp` | Sign-off metric |
| Q24 | “Bảng dự kiến lợi nhuận dòng tiền”: trung bình lịch sử hay giả định nhập tay | Report dự kiến (chưa có route), `profit.actual` | Chưa triển khai | Quyết định scope trước đợt B |
| Q26 | Công thức lương từng phòng ban (lương cứng, % doanh số, phụ cấp) | `/hr/payroll` cột tính toán | `Giả định` | Trước UAT Phase 3 |
| Q28 | Mẫu thực tế “Bảng kê chia cổ phần các nhà” | `/investment/shareholders?tab=distributions`, `roi.capital` | `Giả định` | Sign-off metric Phase 3 |

Mỗi item phải có biên bản họp và cập nhật trạng thái trong Decision Pack trước khi bỏ nhãn giả định.

### E.3. Tham khảo kênh Zalo (từ sheet ZALO và SO SÁNH CP ZALO)

Số liệu do khách kiểm tra ngày 06/09/2026, là dự toán tham khảo, chốt theo template thực tế trong tài khoản ZBS; không phải cam kết giá của dự án.

| Tiêu chí | OA Broadcast | ZNS / ZBS Template Message |
| --- | --- | --- |
| Người nhận | Chỉ người đã quan tâm OA | Gửi theo số điện thoại/UID, không cần follow |
| Duyệt mẫu | Dùng bài viết trên OA | Đăng ký và kiểm duyệt template trước khi gửi |
| Cách gửi | Chọn bài, nhóm, đặt lịch trên OA Manager | Backend gọi API khi phát sinh nghiệp vụ hoặc đến lịch nhắc |
| Phù hợp | Thông báo chung (bảo trì khu nhà…) | Hóa đơn, nhắc nợ, hết hạn HĐ, hoàn cọc từng khách |
| Phí | Trong hạn mức gói OA (4 lượt/người quan tâm/tháng) | Gói OA + ~300đ/tin (dự toán; trang giá ghi 200đ) + phụ phí nút/ảnh |

Gói OA: Tiêu chuẩn 1.000.000đ/năm (không có API); Tăng trưởng 2.500.000đ/năm (khởi điểm cho API); Toàn diện 6.000.000đ/năm. Mẫu 1.000 khách × 2 tin/tháng: Broadcast ≈ 2.500.000đ/năm (chỉ phí OA), ZNS ≈ 10.420.000đ/năm gồm VAT giả định 10%; chưa gồm phí lập trình/trung gian. Kết luận của khách: dùng ZNS cho tin cá nhân hóa (Q35).

### E.4. Hạng mục implementation phát sinh cho mockup

Không thuộc phạm vi UX của tài liệu này nhưng cần thực hiện để mockup khớp câu trả lời:

1. `mockup/js/core/selectors-wb.js`: đổi `Q.L.buildingType` thành nhãn `T`/`S`/`G` (bỏ mô tả sở hữu); `mockup/js/pages/buildings.js` bỏ `U.assume()` trên cột/kv Loại nhà và đổi nhãn thành `Nhóm tòa`.
2. `mockup/js/core/seed-wb.js`: thay `buildingTypeOf` bằng derive từ ký tự đầu `buildings.code`; thêm fixup mới thay `buildingTypeV2`.
3. Thêm selector `Q.landlordDue(days)` từ `buildings.payCycle`/`payDay` và filter `due=1` cho `/landlords`; nối vào `Q.todo()` cho Admin/Kế toán.
4. `mockup/js/core/seed-p2.js`: các `leadSources` ngoài FB/FLY/POST/ZL đặt `status: 'inactive'`.
5. `mockup/js/pages/refunds.js`: khóa sửa số tiền dòng khấu hao 200.000đ, chỉ cho phép bỏ dòng kèm lý do; mở CTA duyệt cho `admin`.
6. `mockup/js/core/metrics.js`: thêm `perf.actual`, `perf.provisional`; đổi trạng thái `revenue.newDeposit`, `profit.actual`, `profit.business` thành `approved`.
7. `mockup/js/pages/hr.js`: status tabs còn ba trạng thái, `leave` hiển thị chip phụ dưới `Đang làm`.
8. `mockup/js/pages/investment.js`: đổi nhãn tab `Vốn góp` → `Lịch đóng tiền nhà`; validate tổng tỷ lệ 100%/tòa.
