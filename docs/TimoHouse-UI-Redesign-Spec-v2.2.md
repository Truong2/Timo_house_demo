# TimoHouse UI Redesign Specification v2.3

**Trạng thái:** Draft for Stakeholder Sign-off  
**Ngày lập:** 16/09/2026  
**Ngày cập nhật:** 16/09/2026  
**Document owner:** Product Owner TimoHouse  
**Người soạn:** UX/UI & Product Design  
**Người phê duyệt:** Chưa chỉ định  
**Ngày phê duyệt:** Chưa phê duyệt  
**Phạm vi:** Toàn bộ mockup tương tác Phase 1, Phase 2 và Phase 3 (63 route, 7 vai trò)  
**Đối tượng ưu tiên:** Nhân viên nghiệp vụ sử dụng hằng ngày; đồng thời giữ khả năng demo roadmap P2/P3 cho khách hàng (xem mục 18)  
**Nền tảng chính:** Desktop và laptop, độ rộng 1366-1920 px  
**Hướng thiết kế:** Enterprise tinh gọn  
**Chiến lược:** Giữ tương thích nghiệp vụ, dữ liệu và route hiện có; thay đổi kiến trúc thông tin và UX; được phép **thêm additive** collection/field và route được kiểm soát tại Phụ lục D

> Tài liệu này kế thừa v2.2 và bổ sung lớp Workbook Alignment v2.3. Thay đổi xem Phụ lục C/D.

### Lịch sử phiên bản

| Phiên bản | Ngày | Nội dung | Trạng thái |
| --- | --- | --- | --- |
| v2.0 | 16/09/2026 | Định hướng redesign ban đầu | Superseded |
| v2.1 | 16/09/2026 | Bổ sung baseline, route mapping, rollout và tiền đề kỹ thuật | Superseded |
| v2.2 | 16/09/2026 | Khóa contract UX, decision log, acceptance, test và traceability | Draft for Sign-off |
| v2.3 | 16/09/2026 | Bổ sung dimension, metric, preset đối soát và Trung tâm Tài liệu theo audit workbook | Draft for Review |

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
| Admin | Kiểm kê cần xử lý | `Q.latestInventory()` đang thực hiện và `needsAction > 0` | High | `/assets/inventory/:id?status=needs_action` | Tiếp tục kiểm kê |
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
| Cổ đông | Nghĩa vụ góp vốn đến hạn | Contribution của cổ đông hiện tại có `st in due,overdue` | High khi overdue; Medium khi due | `/investment/shareholders?tab=contributions` | Xem nghĩa vụ |
| Cổ đông | Phân phối mới | Distribution thuộc dự án được xem có status `approved/paid` và chưa mở trong phiên | Info | `/investment/shareholders?tab=distributions` | Xem phân phối |

Quy tắc action:

- Chỉ render CTA nếu `TH.auth.can()` cho phép; nếu chỉ có quyền xem, CTA dùng động từ `Xem`.
- Item thuộc phase tắt không được đưa vào work queue.
- Khi không có item, hiển thị empty state `Không có công việc cần xử lý` và tối đa hai quick link thường dùng theo role.
- Count trên notification center và Dashboard dùng cùng selector để không lệch số.

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

### 7.3. Khách thuê

- Identity column gộp tên, điện thoại và mã khách.
- Hiển thị hợp đồng hiện tại, phòng, công nợ và trạng thái liên hệ.
- Thông tin cá nhân đầy đủ chuyển sang detail; tab mặc định của detail là `Tổng quan` (hiện tại là `Tài chính`).
- CTA chính trên detail phụ thuộc trạng thái: tạo hợp đồng, ghi nhận thu hoặc liên hệ.

### 7.4. Hợp đồng **[v2.1]**

- Bỏ dãy KPI tổng số/hiệu lực/sắp hết hạn/dự thảo; status tabs là nguồn thống kê duy nhất.
- Cột mặc định: Hợp đồng/Khách, Phòng/Tòa, Thời hạn (`dd/mm/yyyy – dd/mm/yyyy`, dòng phụ: `còn N ngày` hoặc `quá hạn N ngày`), Giá thuê, Tiền cọc, Người phụ trách, Action. Cột Trạng thái chỉ ở tab Tất cả; cột `Còn lại` riêng bị bỏ vì trùng với Thời hạn.
- Hành động ưu tiên: dự thảo → Hoàn thiện; sắp hết hạn → Gia hạn; hiệu lực → Xem; đã kết thúc → Xem hồ sơ.
- Detail contract đưa công nợ, tiền cọc và thời hạn vào summary header.

### 7.5. Hóa đơn, thu tiền và công nợ

- Tách rõ ba intent: phát hành hóa đơn, ghi nhận thu và theo dõi công nợ.
- Hóa đơn chỉ còn một primary `Tạo hóa đơn theo kỳ`; `Xuất danh sách` chuyển sang toolbar.
- Công nợ có primary `Ghi nhận thu`; bỏ card search thứ hai, gộp vào toolbar.
- Dashboard Kế toán liên kết trực tiếp đến từng filtered list.
- Màn công nợ mặc định sort theo mức độ ưu tiên, sau đó số ngày quá hạn.
- Bulk action chỉ xuất hiện khi có row được chọn.
- Trạng thái kỳ khóa hiển thị tại header và giải thích action bị chặn.

### 7.6. Hoàn cọc và chi phí

- Hoàn cọc dùng timeline trạng thái ở detail.
- CTA thay đổi theo vai trò: Vận hành lập/gửi duyệt; Kế toán duyệt/yêu cầu sửa/ghi nhận đã hoàn.
- Chi phí mặc định hiển thị kỳ, tòa, nhóm, số tiền, trạng thái và người tạo.
- Phân bổ và khấu hao nằm trong drawer/detail, không chiếm cột mặc định.

### 7.7. Zalo và thông báo **[v2.1]**

- Mục `Thông báo Zalo` trong sidebar trỏ `/zalo/history`; header có primary `Tạo đợt gửi` và secondary `Cấu hình`. Không tạo hub page.
- Màn tạo đợt gửi dùng wizard: Đối tượng → Nội dung → Kiểm tra → Gửi.
- Lịch sử gửi ưu tiên trạng thái lỗi và khả năng retry.
- Mã lỗi kỹ thuật hiển thị sau phần giải thích dễ hiểu.

### 7.8. Thiết lập và import

- Thiết lập chỉ hiển thị cho role có quyền, truy cập qua `Phân hệ & Quản trị`.
- Import dùng cùng pattern wizard và error review.
- Công cụ demo, reset, phase toggle và state JSON chuyển vào `#/settings/tools` với nhãn `Chỉ dùng cho demo`.

---

## 8. Thay đổi chi tiết Phase 2

### 8.1. CRM

- Dashboard Kinh doanh tập trung lead cần gọi, lịch xem hôm nay, giữ chỗ sắp hết hạn và deal chờ hoàn tất.
- Lead list hỗ trợ chuyển đổi List/Kanban nhưng dùng chung search và filter state.
- Lead card chỉ hiển thị tên, nhu cầu, mức độ ưu tiên, lần liên hệ gần nhất và next action.
- Detail lead có một CTA theo pipeline stage.
- Wizard lịch xem, giữ chỗ và chốt thuê dùng sticky footer và summary bên phải ở desktop.

### 8.2. OCR hợp đồng **[v2.1]**

#### Bố cục review

- Giữ tài liệu bên trái và panel review bên phải.
- Tỷ lệ mặc định: tài liệu 56%, review 44%; ở content < 1200 px chuyển 50/50; panel review tối thiểu 460 px. Tỷ lệ này phải được kiểm chứng bằng wireframe 1366 px ở giai đoạn 0.
- Form review hiển thị đủ **29 trường** đã định nghĩa (bổ sung nhóm `Thông tin ký kết` với 6 trường meta hiện chưa render). Header review hiển thị `N cần kiểm tra / 29 trường` và tiến độ xác nhận.
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

---

## 9. Thay đổi chi tiết Phase 3

### 9.1. Tài sản và kiểm kê

- Asset list dùng identity column gồm mã, tên và vị trí.
- Trạng thái, giá trị và lần kiểm kê gần nhất là cột mặc định.
- Inventory detail tập trung danh sách cần xử lý; item đã đạt được thu gọn.
- Bulk action chỉ xuất hiện sau khi chọn tài sản.
- Tạo sự cố từ tài sản giữ liên kết hai chiều với biên bản kiểm kê.

### 9.2. Nhân sự

- Dashboard HR ưu tiên nhân viên mới, thử việc sắp kết thúc, bảng công và bảng lương cần xử lý.
- Danh sách nhân viên gộp avatar, tên, mã và chức danh.
- Detail nhân viên dùng tab Tổng quan, Phân công, Hồ sơ và Lịch sử.
- Chấm công dùng sticky name column và cảnh báo ô bất thường.
- Payroll giữ mô hình trạng thái hiện có (`stepperStatus` Tạo bảng → Kiểm tra → Gửi duyệt → Duyệt/Ghi chi) với một primary theo trạng thái; không chuyển thành wizard nhiều trang.

### 9.3. Đầu tư và cổ đông **[v2.1]**

- Tách rõ Dự án, Vốn góp, Phân phối và Hiệu quả bằng **tab** trong `/investment/shareholders` (Vốn góp / Phân phối) và 2 route hiện có; không tạo route mới trừ khi tab không đủ (Phụ lục B, tùy chọn).
- Dashboard Cổ đông chỉ hiển thị dự án thuộc phạm vi được cấp quyền.
- Giá trị tiền và tỷ lệ dùng số tabular, căn phải và có giải thích công thức.
- Action tạo/sửa/duyệt không render cho role read-only.
- Chi tiết phân phối có summary tổng, trạng thái duyệt và bảng phân bổ.

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

`Approved` ở D-01 đến D-03 ghi nhận các lựa chọn đã được requester xác nhận trong vòng lập kế hoạch. Các dòng `Proposed` vẫn cần ký trên wireframe/spec trước khi code phần liên quan.

### 18.2. Checklist ký trên wireframe giai đoạn 0

- [ ] Navigation theo vai trò 2 cấp, không dùng hub page và không tự điều hướng khi mở nhóm.
- [ ] Dashboard theo vai trò là `Công việc của tôi`; Admin có toggle `Điều hành`.
- [ ] Work Queue Matrix tại 6.1 đúng task, priority, route và CTA.
- [ ] Bỏ KPI trùng tab; giữ tối đa 3 số liệu tiền dạng dòng.
- [ ] Default Column Matrix tại 6.2 đáp ứng nghiệp vụ và breakpoint.
- [ ] Một CTA primary cho mỗi task region; secondary action không cạnh tranh thị giác.
- [ ] Filter nâng cao đặt trong drawer; active filter luôn nhìn thấy.
- [ ] OCR mặc định chỉ hiện trường cần kiểm tra, đủ 29 trường và có source highlight.
- [ ] Route cũ được giữ; route/query mới tuân thủ Phụ lục B.
- [ ] `Kỳ báo cáo` là state chung nhưng control chỉ hiện ở page có kỳ.
- [ ] Mobile Capability Matrix được chấp thuận.
- [ ] Component contract của Table v2 và Draft guard được Tech Lead chấp thuận.
- [ ] WCAG 2.2 AA là tiêu chuẩn nghiệm thu reference screens.
- [ ] Phạm vi/estimate A-B và test evidence được Delivery Owner chấp thuận.
- [ ] Tất cả decision D-04 đến D-11 đã chuyển thành `Approved` hoặc `Rejected` kèm phương án thay thế.

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
| `/zalo/*` | List + wizard + detail/config | Major | Wizard/list pattern | Retry policy; readable provider error; RBAC |
| `/settings/users`, `/settings/catalog` | Admin list/config | Moderate | List/form pattern | Admin-only; no hidden permission action |
| `/settings/import` | Import wizard/review | Major | Review queue pattern | Upload-map-review-confirm; error evidence |
| `/settings/jobs`, `/settings/jobs/:id` | List + job detail | Major | Detail pattern | Progress; retry eligibility; audit log |
| `/settings/tools` | Admin tools | New | Shell settings | `advancedTools`; destructive confirmation; demo label |
| `/reports`, `/reports/hub`, `/reports/r/:key`, `/reports/cashflow` | Report catalog/report | Moderate/Major | Report pattern | Period/lock state; OI distinction; export |
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
| `/reports/hub` | Báo cáo/Trung tâm báo cáo | 2 | reports.hub | Báo cáo / Trung tâm báo cáo | – | Báo cáo | – | – | – | – |
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

Launcher `Phân hệ & Quản trị` là popover, không phải route. `Công việc của tôi` dùng `/dashboard`, không tạo route mới.

---

## Phụ lục C. Lịch sử thay đổi chi tiết

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

Theo D-12, mockup được thêm các collection `areas`, `salesTeams` và các field sau: `buildings.areaId`, `buildings.buildingType`, `buildings.areaM2`, `buildings.condition`, `buildings.operatingSince`, `buildings.licenseExpiry`, `buildings.pccc`, `expenseGroups.parentCode`, `expenses.categoryCode`, `refundDeductions.groupCode`, `services.wbType`, `contracts.vehicles`, `leadSources.kind`, `leads.handoverDate`, `users.teamId`, `documents.expiry`.

Ràng buộc:

- Chỉ additive; field legacy vẫn đọc được và không bị ghi đè ngoài backfill đã mô tả.
- `TH.seed.workbook(st)` chạy idempotent trong migration và đặt `meta.wbSeeded=true`.
- Không tăng hằng `SCHEMA`; state hiện hữu phải load được.
- Migration production, nếu có, là deliverable riêng và không được suy ra trực tiếp từ seed mockup.

### D.2. Dimension và công thức dùng chung

- `Q.scope(f)` là nguồn sự thật cho kỳ, Khu nhà, tòa, loại nhà, quản lý, trưởng nhóm, vận hành, cổ đông, sale và team.
- `TH.metrics` là registry bắt buộc cho KPI/báo cáo workbook; mỗi metric có công thức, includes/excludes, trạng thái `approved|assumed` và owner.
- Công thức `assumed` phải hiện nhãn `Giả định – chờ xác nhận` và không được dùng để tuyên bố số liệu kế toán đã duyệt.
- Decision Pack chi tiết: `docs/TimeHouse-Workbook-Alignment-Decisions-v1.0.md`.

### D.3. Route và query bổ sung

| Loại | Giá trị | Contract |
|---|---|---|
| Route | `#/documents` | Index tài liệu dùng chung; quyền xem theo role, quyền upload theo permission |
| Query | `vac` | `immediate|endOfMonth|waiting` |
| Query | `areaId` | ID Khu nhà |
| Query | `buildingType` | `T|S|G` |
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
