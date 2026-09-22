# TIMOHOUSE — UI MOCKUP FUNCTIONAL SPECIFICATION

**Phiên bản:** 1.0  
**Ngày lập:** 22/09/2026  
**Trạng thái:** DRAFT — baseline giả định, chờ khách hàng xác nhận  
**Phạm vi:** Web app quản lý vận hành thuê, tài chính, nhân sự, lương, hoa hồng, tài sản, cổ đông và báo cáo  
**Nền tảng mockup hiện tại:** Static SPA, Vanilla JavaScript, desktop-first nhưng phải responsive  

> Các quyết định lấy từ `TimoHouse_25_cau_hoi_xac_nhan_nghiep_vu.docx` trong bản này đều mang nhãn **ASSUMED**. Khi khách hàng sửa hoặc ký xác nhận, Product/BA phải cập nhật Decision Log, rule liên quan và test case trước khi triển khai.

---

## 1. Mục tiêu tài liệu

Tài liệu này là đầu vào chung cho BA, UI/UX, Front-end, Back-end và QA, nhằm:

- Xác định đầy đủ màn hình, route, vai trò được truy cập và phạm vi dữ liệu.
- Mô tả layout, field, bảng, trạng thái, chức năng và action của từng màn hình.
- Chuẩn hóa flow liên màn hình và các điểm phê duyệt.
- Làm rõ validation, cảnh báo, empty/loading/error state và audit.
- Cung cấp tiêu chí nghiệm thu cho mockup tương tác và sản phẩm thật.

Tài liệu không thay thế đặc tả công thức nghiệp vụ chi tiết trong `docs_timonouse/nghiep_vu`; các mã D-xx, R-xx, P-xx, BR-x.xx.x và metric code vẫn là nguồn đối chiếu khi phát triển.

## 2. Nguồn và thứ tự ưu tiên

| Ưu tiên | Nguồn | Cách sử dụng |
|---:|---|---|
| 1 | Phiếu 25 câu hỏi đã được khách hàng ký trong tương lai | Ghi đè mọi giả định cùng chủ đề |
| 2 | Phiếu 25 câu hỏi hiện tại đã điền giả định | Baseline `ASSUMED` cho UI, flow và dữ liệu mẫu |
| 3 | `nghiep_vu/00_shared_brief.md` đến `06_phu_luc.md` | Nguồn chính về entity, rule, trạng thái, công thức, quyền |
| 4 | Mockup hiện tại và `mockup/README.md` | Tham khảo route/component; không được ghi đè nghiệp vụ mới |

Nếu có mâu thuẫn, UI phải hiển thị nhãn `Cần xác nhận nghiệp vụ` và không âm thầm dùng rule cũ.

## 3. Phạm vi

### 3.1 Trong phạm vi

- Dashboard và Work Queue.
- Chủ nhà, hợp đồng đầu vào, tòa, phòng, khách thuê.
- Hợp đồng thuê, OCR/Data Onboarding, dịch vụ và bảng giá.
- Điện nước, kỳ hóa đơn, hóa đơn, thu tiền, công nợ, phạt.
- Sắp hết hạn, gia hạn, kết thúc/phá hợp đồng, cọc và hoàn cọc.
- Zalo ZNS nhắc thanh toán.
- Cơ cấu tổ chức, nhân sự, phân công tòa, hiệu suất, bảng lương, chi lương.
- Chi phí, phân bổ, hoa hồng, tài sản/khấu hao, tiền thuê nhà trả trước.
- Cổ đông, tỷ lệ sở hữu, góp vốn, phân phối lợi nhuận.
- Kỳ báo cáo, Report A/B, CF/AC, đối soát golden và drill-down.
- Cài đặt danh mục, tham số, người dùng/quyền, import job và audit log.

### 3.2 Ngoài phạm vi baseline này

- Portal đăng nhập riêng cho chủ nhà hoặc khách thuê.
- CRM lead/pipeline đầy đủ; Phase 1 chỉ quản lý người nhận và kết quả hoa hồng.
- SMS fallback thật, tích hợp ngân hàng thật, chữ ký số, e-invoice và mobile native.
- Tự động quyết định nghiệp vụ thay người dùng: tự gia hạn HĐ, tự miễn phạt, tự duyệt hoàn cọc, tự khóa kỳ.

## 4. Vai trò và phạm vi dữ liệu

| Vai trò | Phạm vi | Quyền chính | Hạn chế chính |
|---|---|---|---|
| Admin | Toàn hệ thống | Cấu hình, quyền, duyệt/mở khóa kỳ, duyệt phân phối, sửa dữ liệu nhạy cảm | Mọi thao tác nhạy cảm phải có lý do/audit |
| Kế toán | Toàn hệ thống hoặc tòa được cấp | Hóa đơn, payment, công nợ, chi phí, lương, báo cáo, hoàn cọc | Không thay assignment vận hành nếu không có quyền riêng |
| TPVH | Đơn vị và toàn bộ cấp dưới | Dashboard, Work Queue, giá chốt, hiệu suất, xem báo cáo | Không sửa công nợ/lương/hoa hồng |
| TNVH/Trưởng khu vực | Đơn vị và cấp dưới | Duyệt chỉ số, xác nhận HĐ sắp hết, xác nhận/miễn phạt | Không duyệt tài chính cuối cùng |
| NVVH | Tòa được phân công | Phòng, HĐ, chỉ số, hóa đơn, báo thu, kết thúc HĐ, lập hoàn cọc | Không duyệt hoàn cọc/khóa kỳ |
| NV nguồn | Hồ sơ do mình tạo, trước khi kích hoạt | Chủ nhà, HĐ đầu vào nháp | Không xem tài chính tòa |
| NVKD/Sale | Bản ghi hoa hồng của bản thân | Xem deal/hoa hồng | Không sửa hoặc duyệt |
| Kỹ thuật | Tòa được phân công chuyên môn | Nhận việc sửa chữa, cập nhật hiện trạng/nghiệm thu | Không sửa số tiền tài chính |
| Vệ sinh | Tòa được phân công | Xác nhận dọn xong | Không xem dữ liệu tài chính |
| Cổ đông | Tòa có tỷ lệ sở hữu | Xem Report A, bảng cổ phần, vốn, lịch góp | Read-only; không xem Report B toàn hệ thống |

Quy tắc quyền:

- `BUILDING_ASSIGNMENT` là nguồn duy nhất xác định phạm vi tòa; permission hệ thống là lớp độc lập.
- Mọi query danh sách phải áp scope ở server; không chỉ ẩn dữ liệu bằng UI.
- Action không có quyền vẫn có thể hiển thị disabled khi cần giải thích, kèm tooltip nêu quyền còn thiếu.
- HR và Quản lý Tổng chưa tách role riêng trong baseline; gộp vào Admin/Kế toán và mở rộng bằng permission.

## 5. Định hướng UI/UX và design system

### 5.1 Phong cách

- Kiểu: **Data-dense enterprise dashboard**, rõ ràng, ít trang trí.
- Mật độ: cao ở desktop; có nút đổi `Thoải mái / Gọn` cho bảng.
- Điều hướng: sidebar cố định ở desktop; drawer ở màn nhỏ.
- Mỗi màn chỉ có một CTA chính; action phụ đưa vào nút outline hoặc menu `…`.
- Không dùng emoji làm icon; dùng một bộ SVG outline thống nhất (khuyến nghị Lucide).

### 5.2 Token đề xuất

| Token | Giá trị | Mục đích |
|---|---|---|
| Primary | `#1E40AF` | CTA chính, active navigation, link |
| Secondary | `#3B82F6` | Biểu đồ và thông tin hỗ trợ |
| Accent | `#D97706` | Cảnh báo nghiệp vụ/ASSUMED |
| Background | `#F8FAFC` | Nền ứng dụng |
| Surface | `#FFFFFF` | Card, bảng, modal |
| Text primary | `#0F172A` | Văn bản chính |
| Text secondary | `#475569` | Mô tả, helper text |
| Success | `#15803D` | Hoàn tất/đã duyệt |
| Warning | `#B45309` | Đến hạn/cần kiểm tra |
| Danger | `#DC2626` | Quá hạn/lỗi/destructive |
| Border | `#CBD5E1` | Viền đủ tương phản |
| Focus ring | `#1E40AF`, 3px | Điều hướng bàn phím |

Typography: ưu tiên font hệ thống hoặc Fira Sans; số tiền, tỷ lệ, mã và cột số dùng tabular figures. Body desktop 14–16px, mobile tối thiểu 16px; line-height 1.5.

### 5.3 Responsive

| Breakpoint | Hành vi |
|---|---|
| 375–767px | Sidebar thành drawer; filter vào bottom sheet; bảng quan trọng chuyển card-list; action bar sticky dưới |
| 768–1023px | Sidebar thu gọn; detail hai cột chuyển một cột; bảng cho phép cuộn vùng bảng có nhãn cột cố định |
| 1024–1439px | Layout desktop chuẩn, sidebar 240px |
| ≥1440px | Content max-width linh hoạt; bảng tài chính full-width; panel phụ tối đa 360px |

### 5.4 Accessibility và hiệu năng bắt buộc

- Contrast chữ thường tối thiểu 4.5:1; không dùng màu làm dấu hiệu duy nhất.
- Mọi icon-only button có accessible name và tooltip; focus ring không bị sticky header che.
- Tất cả action dùng được bằng bàn phím; `Esc` đóng modal, không mất dữ liệu chưa lưu mà không cảnh báo.
- Field có label thật, helper text và lỗi ngay dưới field; submit lỗi nhiều field phải focus Error Summary.
- Target chuột tối thiểu 24×24 CSS px; trên layout touch tối thiểu 44×44px.
- Danh sách trên 50 dòng dùng phân trang hoặc virtualize; search debounce 300ms.
- Skeleton cho request trên 1 giây; nút submit chuyển loading và disabled để chống bấm lặp.
- Animation chỉ dùng opacity/transform, 150–250ms; tôn trọng `prefers-reduced-motion`.
- Chart luôn có bảng dữ liệu tương đương và export CSV/XLSX.

## 6. Application shell

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Logo | Breadcrumb                  Kỳ báo cáo | Search | Bell | User│
├───────────────┬─────────────────────────────────────────────────────┤
│ Sidebar       │ Page title · status · scope                         │
│               │ [Secondary actions]                 [Primary CTA]  │
│ Tổng quan     ├─────────────────────────────────────────────────────┤
│ Vận hành      │ Filter bar / saved view / related information      │
│ Tài chính     ├─────────────────────────────────────────────────────┤
│ Nhân sự       │ Main content: KPI / table / detail / wizard        │
│ Đầu tư        │                                                     │
│ Báo cáo       │                                                     │
│ Cài đặt       │                                                     │
└───────────────┴─────────────────────────────────────────────────────┘
```

### 6.1 Global controls

| Control | Quy tắc |
|---|---|
| Kỳ | Đồng bộ topbar với filter trang; kỳ Locked hiển thị khóa và version |
| Global search | Tìm theo mã tòa/phòng/khách/HĐ/hóa đơn; kết quả nhóm theo entity |
| Chuông việc | Đếm Work Queue theo scope; mở deep link với filter đã áp |
| Scope | Tổ chức → nhân sự → tòa; resolve theo ngày/kỳ đang chọn |
| Breadcrumb | Bắt buộc khi sâu từ 3 cấp; Back giữ filter và scroll của danh sách |
| User menu | Vai trò hiện tại, chuyển vai trò demo, đổi mật khẩu, đăng xuất |

### 6.2 Điều hướng chính

| Nhóm | Menu |
|---|---|
| Tổng quan | Dashboard, Work Queue |
| Vận hành | Chủ nhà, HĐ đầu vào, Tòa nhà, Phòng, Khách thuê, HĐ thuê, OCR, Điện nước, Sắp hết hạn |
| Tài chính | Kỳ hóa đơn, Hóa đơn, Thu tiền, Công nợ, Cọc/Hoàn cọc, Chi phí, Phân bổ, Hoa hồng, Chi lương |
| Nhân sự | Cơ cấu tổ chức, Nhân viên, Phân công tòa, Hiệu suất, Bảng lương |
| Tài sản/Đầu tư | Tài sản & khấu hao, Cổ đông, Cổ phần, Góp vốn, Phân phối lợi nhuận |
| Thông báo | Zalo: cấu hình, đợt gửi, lịch sử/lỗi |
| Báo cáo | Kỳ báo cáo, Report A, Report B, Đối soát, Metric definitions |
| Cài đặt | Dịch vụ & bảng giá, danh mục, tham số, user & quyền, import jobs, audit |

## 7. Mẫu màn hình dùng chung

### 7.1 List page

```text
Title + count + status summary                     Export | + Tạo mới
Saved view | Search | Scope filters | Status | Date | More filters
Related info/KPI (collapsible)
Bulk action bar (chỉ xuất hiện khi chọn dòng)
Table: checkbox | identity | business columns | status | owner | updated | …
Pagination + page size + column chooser + density
```

Quy tắc: click dòng mở chi tiết; action nhanh không kích hoạt click dòng; sort dùng `aria-sort`; filter lưu trong URL; export theo `Selected` hoặc `Toàn bộ kết quả filter`.

### 7.2 Detail page

```text
Back | Code + Name + status chips         Secondary actions | Primary action
Identity summary / alerts / pending approvals
Tabs: Overview | Related entities | Documents | Activity/Audit
Main column (fields/tables/timeline)     Right rail (owner, dates, quick links)
```

Read-only khác disabled: vẫn copy được, nền trung tính và có nhãn `Chỉ đọc` nếu do trạng thái/quyền.

### 7.3 Form và wizard

- Form ngắn mở modal/drawer; form dài hoặc từ 3 nhóm field dùng page/wizard.
- Wizard luôn có stepper, `Lưu nháp`, `Quay lại`, `Tiếp tục`, `Hủy`, summary trước confirm.
- Draft autosave theo từng bước; rời trang khi có thay đổi chưa lưu phải confirm.
- Field tiền hiển thị format VND nhưng lưu số; field phần trăm giữ tối đa 2 chữ số thập phân.

### 7.4 Approval pattern

| Action | UI |
|---|---|
| Gửi duyệt | Confirm nhẹ + checklist lỗi còn lại |
| Duyệt | Modal tóm tắt thay đổi và tác động |
| Trả sửa | Bắt buộc lý do, chọn field/dòng liên quan nếu có |
| Từ chối/Hủy | Danger modal, bắt buộc lý do |
| Mở khóa | Danger modal, bắt buộc lý do và hiển thị các snapshot bị ảnh hưởng |

### 7.5 Status và thông báo

- Chip gồm icon + chữ; trạng thái không chỉ phân biệt bằng màu.
- Toast thành công tự đóng sau 4 giây, không lấy focus; lỗi có `Thử lại`.
- Alert persistent dùng cho sai lệch nguồn, kỳ Locked, dữ liệu ASSUMED và quyền hạn chế.
- Mọi hành động tạo/sửa/duyệt/đảo/hủy phải ghi actor, thời điểm, before/after và lý do.

## 8. Danh mục màn hình

| ID | Màn hình | Route chuẩn | Module nguồn |
|---|---|---|---|
| UI-00 | Đăng nhập | `#/login` | System |
| UI-01 | Dashboard & Work Queue | `#/dashboard` | M-1.01 |
| UI-02 | Chủ nhà | `#/landlords`, `#/landlords/:id` | M-2.01 |
| UI-03 | Hợp đồng đầu vào | `#/landlords/:id?tab=head-leases` | M-2.02 |
| UI-04 | Tòa nhà | `#/buildings`, `#/buildings/:id` | M-2.03 |
| UI-05 | Phòng | `#/rooms`, `#/rooms/:id` | M-2.04 |
| UI-06 | Khách thuê | `#/tenants`, `#/tenants/:id` | M-2.05 |
| UI-07 | Hợp đồng thuê | `#/contracts`, `#/contracts/:id`, `#/contracts/new` | M-2.06 |
| UI-08 | OCR/Data Onboarding | `#/contracts/ocr` | M-2.06 |
| UI-09 | Dịch vụ & bảng giá | `#/settings/catalog?tab=services` | M-2.07 |
| UI-10 | Điện nước & chỉ số | `#/meters` | M-2.08 |
| UI-11 | Kỳ hóa đơn | `#/finance/periods` | M-2.09 |
| UI-12 | Hóa đơn | `#/invoices`, `#/invoices/:id` | M-2.09 |
| UI-13 | Thu tiền | `#/receivables?tab=payments`, `#/payments/:id` | M-2.10 |
| UI-14 | Công nợ & phạt | `#/receivables` | M-2.11 |
| UI-15 | HĐ sắp hết/Gia hạn/Kết thúc | `#/contracts/expiring` | M-2.12 |
| UI-16 | Cọc & hoàn cọc | `#/finance/deposits`, `#/refunds/:id` | M-2.13 |
| UI-17 | Zalo ZNS | `#/zalo/config`, `#/zalo/history`, `#/zalo/batches/:id` | M-2.14 |
| UI-18 | Cơ cấu tổ chức | `#/hr/org` | M-3.01 |
| UI-19 | Nhân sự | `#/hr`, `#/hr/:id` | M-3.02 |
| UI-20 | Phân công tòa | `#/hr/assignments` | M-3.03 |
| UI-21 | Hiệu suất thu tiền | `#/hr/collection-performance` | M-3.04 |
| UI-22 | Bảng lương | `#/hr/payroll` | M-3.05 |
| UI-23 | Chi lương | `#/hr/salary-payments` | M-3.06 |
| UI-24 | Chi phí & Import | `#/expenses`, `#/settings/import` | M-4.01 |
| UI-25 | Phân bổ chi phí/lương | `#/expenses?tab=allocation` | M-4.02 |
| UI-26 | Hoa hồng | `#/commissions` (route đề xuất) | M-4.03 |
| UI-27 | Tài sản & khấu hao | `#/assets` | M-4.04 |
| UI-28 | Tiền thuê nhà/Trả trước | `#/head-lease-costs` (route đề xuất) | M-4.05 |
| UI-29 | Cổ đông/Cổ phần/Góp vốn | `#/investment/shareholders`, `#/investment/shares` | M-4.06 |
| UI-30 | Kỳ báo cáo & khóa kỳ | `#/reports/periods` | M-5.01 |
| UI-31 | Report A/B và CF/AC | `#/reports/building-profit`, `#/reports/business-summary` | M-5.02–M-5.05 |
| UI-32 | Đối soát & Golden | `#/reports/reconcile`, `#/reports/metrics` | M-5.06 |
| UI-33 | User, quyền, tham số, jobs, audit | `#/settings/*` | R-33–R-37 |

---

## 9. Đặc tả màn hình chi tiết — Truy cập và vận hành thuê

### UI-00 — Đăng nhập

**Người dùng:** tất cả tài khoản nội bộ và cổ đông. Chủ nhà/khách thuê không đăng nhập trong Phase 1.

**Field**

| Field | Loại | Bắt buộc | Quy tắc |
|---|---|:---:|---|
| Tên đăng nhập/Email | Text | Có | Cho phép autocomplete username |
| Mật khẩu | Password | Có | Cho phép paste/password manager; có nút hiện/ẩn |
| Ghi nhớ đăng nhập | Checkbox | Không | Chỉ lưu session token, không lưu mật khẩu |
| Mã OTP | Text | Có điều kiện | Chỉ hiện khi tài khoản bật MFA |

**Action:** `Đăng nhập`, `Quên mật khẩu`, `Gửi lại OTP`. Đăng nhập thành công mở deep link ban đầu hoặc Dashboard theo role; thất bại giữ username và hiển thị lý do an toàn. Mockup có thể dùng tài khoản demo nhưng phải ghi rõ `Dữ liệu mô phỏng`.

### UI-01 — Dashboard & Work Queue

**Mục tiêu:** một màn hình điều hành theo scope và kỳ, không yêu cầu người dùng ghép số thủ công.

**Bộ lọc:** kỳ, ngày tham chiếu, đơn vị tổ chức, trưởng nhóm, quản lý, tòa, nhóm T/S/G, hạng L1/L2/L3. Filter được phản ánh trên URL và áp cho KPI, bảng và export.

**Khối dữ liệu**

| Khối | Thành phần/field | Tương tác |
|---|---|---|
| KPI phòng | Tổng phòng, Đang thuê, Trống ở luôn, Trống hết tháng, Đang chờ, Phòng mới, Phá HĐ, Chờ dọn/bảo trì, Tỷ lệ lấp đầy | Click mở danh sách đã filter |
| KPI HĐ | Hiệu lực, sắp hết 35 ngày, chưa xác nhận, chờ OCR, chờ quyết toán | Drill-down HĐ |
| KPI tài chính | Tổng cần đóng, đã đóng, còn nợ, nợ 6–15, nợ >15, cọc đang giữ, hoàn cọc chờ duyệt | Giá trị VND + thời điểm cập nhật |
| Tiến độ thu | Quản lý/tòa, số phòng, DT niêm yết, phải thu, M1/M2/M3, thu thêm, tổng thu, HS %, còn phải thu | Toggle Theo quản lý/Theo tòa; export |
| Work Queue | Loại việc, đối tượng, người phụ trách, phát sinh, tuổi việc, ưu tiên, trạng thái, action nhanh | Sort ưu tiên → tuổi giảm dần |

**Action:** nhận việc, chuyển người xử lý trong scope, mở đối tượng, hành động nhanh, bỏ qua có lý do, export dashboard. Bỏ qua phải có lý do và ngày tái mở.

**Trạng thái Work Queue:** `Mở → Đang xử lý → Đã xong`; `Mở/Đang xử lý → Bỏ qua`; điều kiện nguồn phát sinh lại tạo item mới. Ngưỡng đỏ mặc định **ASSUMED**: công nợ >5 ngày, nghiêm trọng >15 ngày; HĐ thuê còn <7 ngày; lịch trả chủ nhà ≤7 ngày; OCR chờ review >2 ngày.

**Empty/error:** không có việc hiển thị trạng thái tốt và link xem dữ liệu; lỗi từng widget không làm hỏng toàn trang, có Retry tại widget.

### UI-02 — Chủ nhà

**Danh sách**

- Filter: loại Cá nhân/Tổ chức, trạng thái, khu vực, tòa, HĐ đầu vào sắp hết, từ khóa tên/SĐT/CCCD/MST.
- Cột: Mã, Tên, Loại, SĐT, CCCD/MST (mask theo quyền), số tòa, số HĐ hiệu lực, kỳ trả gần nhất, trạng thái, cập nhật, action.
- Action: `Thêm chủ nhà`, xem, sửa, ngừng hoạt động, export.

**Form/chi tiết**

| Nhóm | Field |
|---|---|
| Nhận diện | Mã tự sinh `LL-0001`, loại, họ tên/tên pháp nhân, CCCD/MST, ngày/nơi cấp, người đại diện |
| Liên hệ | SĐT bắt buộc, email, địa chỉ |
| Thanh toán | Ngân hàng, số tài khoản, chủ tài khoản, từ ngày hiệu lực; lịch sử tài khoản |
| Hồ sơ | CCCD, sổ đỏ, ủy quyền, PCCC, biên bản; loại tài liệu, version, ngày hết hạn |
| Liên kết | Tòa, HĐ đầu vào, lịch đóng tiền |
| Quản trị | Trạng thái, ghi chú, created/updated, audit |

**Validation:** CCCD/MST và SĐT chuẩn hóa; cảnh báo trùng; không được ngừng nếu còn HĐ đầu vào hiệu lực, trừ Admin có kế hoạch thay thế. Tab: Tổng quan, HĐ đầu vào, Tòa nhà, Thanh toán, Tài liệu, Lịch sử.

### UI-03 — Hợp đồng đầu vào

**Bố cục:** danh sách HĐ trong tab chủ nhà và màn tổng hợp theo kỳ đến hạn; chi tiết hai cột có timeline trạng thái và lịch thanh toán.

**Field**

| Nhóm | Field/Quy tắc |
|---|---|
| Nhận diện | Số HĐ, chủ nhà, 1..n tòa, trạng thái, HĐ trước/sau |
| Thời gian | Ngày ký, bắt đầu, kết thúc, thời hạn tháng; cảnh báo sắp hết mặc định 6 tháng |
| Giá | Tiền thuê/tháng, giữ giá, lịch tăng giá (% hoặc tiền, effective date), tháng miễn, giảm giá |
| Cọc | Số cọc, ngày trả, dự kiến hoàn, chứng từ; không ghi chi phí |
| Thanh toán | Kỳ 3/4/6 tháng, khoảng ngày đến hạn, tài khoản nhận, lịch sinh tự động |
| Phân bổ nhiều tòa | Mặc định theo số phòng; override tỷ lệ/số tiền theo phụ lục, tổng 100%, có ngày hiệu lực |
| Phân loại | T/S/G và L1/L2/L3 đề xuất, ngày hiệu lực, người xác nhận |
| Pháp lý | HKD, PCCC + hạn, sổ đỏ, file HĐ/phụ lục/bàn giao |
| Nguồn | Nhân viên nguồn, ngày tìm, ghi chú |

**Bảng lịch đóng tiền:** kỳ số, từ–đến tháng, đến hạn, phải trả, đã trả, còn lại, trạng thái, chứng từ, phần nghĩa vụ từng cổ đông.

**Action theo trạng thái:** Lưu nháp; kích hoạt; tạo lịch; ghi nhận trả; tải chứng từ; điều chỉnh lịch; gia hạn bằng HĐ mới; thanh lý sớm; kết thúc. Nhắc mặc định **ASSUMED** 15/7/1 ngày và cho phép override từng HĐ.

**State:** `Nháp → Hiệu lực → Sắp hết → Kết thúc`; nhánh `Hiệu lực/Sắp hết → Thanh lý sớm → Kết thúc`. Kỳ trả: `Chưa đến hạn → Sắp đến hạn → Đã trả/Trả một phần/Quá hạn`.

### UI-04 — Tòa nhà

**Danh sách:** filter scope, trạng thái khai thác, T/S/G, L1/L2/L3, chủ nhà, quản lý, HKD/PCCC, tỷ lệ lấp đầy. Cột: mã, tên, khu vực, nhóm/hạng, tổng phòng, đang thuê/trống, quản lý tại kỳ, HĐ đầu vào, ngày đến hạn gần nhất, PCCC, trạng thái.

**Field chi tiết**

| Nhóm | Field |
|---|---|
| Cơ bản | Mã bất biến, tên, địa chỉ, khu vực, số tầng, ngày bắt đầu vận hành, trạng thái |
| Phân loại | T/S/G = dòng sản phẩm; L1=cũ, L2=trung bình, L3=mới; effective history |
| Tiện ích | Thang máy, máy giặt chung, sạc xe điện, camera, bảo vệ |
| Thu tiền | Tài khoản nhận mặc định, mẫu in hóa đơn, ngày chốt chỉ số mặc định 22 |
| Điện/nước | Công tơ tổng MAIN, công tơ COMMON, đơn giá gốc/đơn giá chung |
| Liên kết | Chủ nhà, HĐ đầu vào, phòng, assignment, dịch vụ, tài sản, báo cáo |
| KPI đọc | Lấp đầy, công nợ, hiệu suất, lợi nhuận snapshot gần nhất |

**Tabs:** Tổng quan, Phòng, Phân công, Dịch vụ & bảng giá, Công tơ, HĐ đầu vào, Tài sản, Báo cáo, Tài liệu, Lịch sử. Thay đổi quản lý luôn mở flow Phân công tòa; không sửa `manager_id` trực tiếp.

**State:** `Chuẩn bị → Đang khai thác → Ngừng khai thác`. Chỉ hai trạng thái đầu cho phép chuẩn bị/tạo HĐ thuê; tòa ngừng khai thác chỉ đọc dữ liệu lịch sử.

### UI-05 — Phòng

**Chế độ xem:** bảng và sơ đồ theo tầng. Bộ lọc: tòa/tầng, trạng thái, loại phòng, khoảng giá, có công tơ, ngày sẵn sàng, HĐ sắp hết.

**Cột bảng:** mã phòng, tòa/tầng, loại/diện tích, giá niêm yết, giá QL, giá HĐ hiện tại, sức chứa/người hiện tại, trạng thái, khách/HĐ, công nợ, ngày sẵn sàng, quản lý.

**Field chi tiết**

| Nhóm | Field |
|---|---|
| Nhận diện | Mã = số phòng + mã tòa, số phòng, tầng, loại, diện tích, hướng |
| Giá | Giá niêm yết và giá QL có lịch sử/effective date; giá hiện tại đọc từ HĐ |
| Sử dụng | Sức chứa, người hiện tại suy ra, ngày trống từ, sẵn sàng dự kiến |
| Bàn giao | Danh sách nội thất mặc định: tên, SL, tình trạng |
| Công tơ | Điện/nước, loại, mã, chỉ số gần nhất; nước theo người nếu không có đồng hồ |
| Trạng thái | Trạng thái, từ ngày, lý do, người đổi; ảnh/ghi chú |

**Action:** thêm/sửa; cập nhật giá; chuyển trạng thái hợp lệ; tạo HĐ; xem khách; nhập chỉ số; xác nhận dọn xong; chuyển bảo trì; nghiệm thu; export.

**State:** `Sẵn sàng → Giữ chỗ → Đang thuê → Trống hết tháng → Chờ dọn → Bảo trì → Sẵn sàng`; có nhánh hủy giữ, gia hạn, ngừng/mở lại khai thác. UI chỉ hiển thị transition hợp lệ và mô tả tác động trước confirm.

### UI-06 — Khách thuê

**Danh sách:** tìm tên, SĐT, CCCD, mã khách; filter scope, tòa/phòng, status, cờ HĐ hiệu lực, công nợ, chờ hoàn cọc, Zalo, vai trò đứng tên/người ở cùng.

**Cột:** mã khách, tên/SĐT, phòng/tòa hiện tại, vai trò, HĐ/status, số người/xe, công nợ, cọc giữ, Zalo, quản lý, cập nhật.

**Field chi tiết**

| Nhóm | Field |
|---|---|
| Cá nhân | Mã khách, họ tên, SĐT, CCCD, ngày sinh, giới tính, thường trú, liên hệ khẩn cấp |
| Phân loại | Nghề nghiệp, phân khúc, trạng thái khách, lý do đổi |
| Người ở cùng | Họ tên, SĐT, CCCD, quan hệ, từ–đến, hồ sơ đã link/chưa link |
| Xe | Loại, biển số, màu, dịch vụ gửi xe, từ–đến |
| Zalo | ZaloID/follow OA, ngày liên kết, trạng thái, lịch sử gửi/phản hồi |
| Cờ suy ra | HĐ hiệu lực, công nợ, chờ hoàn cọc, giữ chỗ, đã rời |
| Tài liệu | CCCD mặt trước/sau, tạm trú, tài liệu khác |

**Action:** tạo/sửa, đổi status, gắn HĐ, thêm người/xe, merge trùng, liên kết Zalo, bulk update có preview, export selected/all filtered.

**Rule mã khách ASSUMED:** sinh khi HĐ chuyển `Chờ ký`; đổi phòng tạo mã theo phòng đích nhưng giữ số thứ tự và lưu mã cũ trong lịch sử.

### UI-07 — Hợp đồng thuê

**Danh sách:** tabs theo state; filter kỳ, tòa/phòng, khách, quản lý, ngày bắt đầu/kết thúc, giá dưới giá QL, nguồn OCR/tay, công nợ, sắp hết.

**Cột:** số HĐ/lần HĐ, khách, phòng/tòa, từ–đến, giá chốt, kỳ TT, cọc phải thu/đã thu, trạng thái, còn N ngày, công nợ, quản lý, source.

**Wizard tạo/sửa**

1. Chọn tòa/phòng và kiểm tra trạng thái phòng.
2. Chọn/tạo khách đứng tên; hệ thống kiểm tra CCCD/SĐT trùng.
3. Thời hạn: loại HĐ, số HĐ, ngày ký, vào ở, tính tiền, từ–đến, lần HĐ.
4. Giá: snapshot niêm yết, giá QL, giá chốt, lý do/duyệt nếu dưới giá QL, kỳ TT, cọc.
5. Dịch vụ: service, cách tính, đơn giá snapshot, số lượng; cho phép giá riêng HĐ.
6. Người ở, xe, nội thất, chỉ số OPENING và ảnh.
7. Điều khoản thanh toán, gia hạn/báo trước, phạt, tài khoản nhận.
8. Tài liệu và Summary → `Lưu nháp` hoặc `Gửi duyệt/Chờ ký`.

**Tabs chi tiết:** Tổng quan, Phiên bản, Người thuê, Dịch vụ, Cọc, Thanh toán, Công nợ, Chỉ số, Bàn giao, Gia hạn, Tài liệu, Sự kiện/Audit.

**Action:** lưu nháp, gửi duyệt, trả sửa, duyệt, kích hoạt, tạo gia hạn, xác nhận kết thúc, phá HĐ, đổi phòng, tải file, in/export. OCR không tự kích hoạt; gia hạn luôn tạo version/HĐ nối tiếp mới.

**State:** `Nháp → Chờ ký → Hiệu lực → Sắp hết → Chờ quyết toán → Kết thúc`; nhánh `Chờ ký → Hủy`, `Hiệu lực/Sắp hết → Phá HĐ → Chờ quyết toán`. Kích hoạt phải có phòng khả dụng, ngày vào, giá/cọc, dịch vụ và duyệt giá nếu cần.

### UI-08 — OCR/Data Onboarding

**Màn danh sách job:** file, loại tài liệu, hash, engine, người tải, thời gian, số field cần kiểm tra, status, lỗi, HĐ kết quả. Action: upload, mở job, xử lý lại, thử commit lại, mở kết quả.

**Review screen ba vùng**

```text
File/pages + zoom         Entity groups/fields                  Summary
OCR highlight             raw | normalized | confidence         conflicts
page navigation           candidate | decision | final value    validation
```

**13 nhóm review:** Khách hàng, Tòa, Phòng, HĐ, Người ở, Dịch vụ & giá, Cọc, Xe, Điện/Nước đầu kỳ, Tài sản bàn giao, Điều khoản thanh toán, Gia hạn/Báo trước, Tài liệu.

**Field mỗi dòng OCR:** raw, normalized, confidence, trang/bbox, candidate, match score, quyết định `Create/Link/Update/Ignore`, giá trị cuối, reviewer. Tòa/phòng chỉ được Link; giá dịch vụ lệch phải chọn `Giá riêng HĐ / Cập nhật giá tòa từ ngày / Ignore`.

**Flow:** `Upload → Processing → Ready for review → Reviewing → Validate → Xem payload → Confirm commit → Committed`; lỗi `Failed/Commit failed` có Retry. Commit là một transaction; lỗi phải rollback toàn bộ. Upload cùng hash cảnh báo job cũ và không tạo HĐ trùng.

### UI-09 — Dịch vụ & bảng giá

**Danh mục:** mã, tên, đơn vị, cách tính, metric, giá mặc định, trạng thái. Service chuẩn gồm điện, nước, vệ sinh, mạng, thang máy, xe điện/gửi xe, máy giặt, combo khác, điện chung.

**Bảng giá hai lớp**

| Field | Quy tắc |
|---|---|
| Scope | Global hoặc Building |
| Tòa | Bắt buộc khi scope Building |
| Đơn giá | >0, đúng đơn vị/cách tính |
| Hiệu lực từ/đến | Không chồng khoảng trong cùng service/scope |
| Trạng thái | Nháp → Chờ duyệt → Hiệu lực → Hết hiệu lực |
| Người duyệt/lý do | Bắt buộc khi giá khác nguồn HĐ/OCR |

**Action:** tạo service, tạo version giá, duyệt, ngừng hiệu lực, xem tòa đang dùng giá nào, export. Không sửa trực tiếp version đã được snapshot vào HĐ/hóa đơn.

### UI-10 — Điện nước & chỉ số

**Bộ lọc:** kỳ, tòa, tầng, trạng thái nhập/duyệt, loại meter, bất thường, thiếu ảnh. Bảng editable theo tòa/phòng.

**Cột/field:** phòng, khách/HĐ, meter code, loại và scope `ROOM/COMMON/MAIN`, reading type, ngày chốt, chỉ số cũ, mới, sản lượng, đơn giá, thành tiền tham khảo, số người, ảnh, người nhập, status, cảnh báo.

**Action:** nhập dòng, paste/import, copy kỳ trước, tải ảnh, lưu nháp, gửi duyệt, trả sửa, duyệt, mở lại có lý do, export, mở lịch sử meter.

**Validation:** chỉ số mới ≥ cũ; không trùng meter+kỳ+reading type; cảnh báo lệch ±50%; OPENING/CLOSING bắt buộc ảnh, PERIODIC khuyến nghị (**ASSUMED**). Không mở lại nếu hóa đơn đã phát hành, trừ flow điều chỉnh của Kế toán.

**State:** reading `Nháp → Chờ duyệt → Đã duyệt → Đã dùng hóa đơn`; kỳ tòa `Đang nhập → Đã duyệt → Đã lập hóa đơn`.

### UI-11 — Kỳ hóa đơn

**Danh sách:** mã kỳ, từ/đến, ngày chốt, phát hành dự kiến/thực tế, số tòa đã chốt chỉ số, số hóa đơn nháp/phát hành, status, blocker.

**Chi tiết/preflight:** tiến độ chỉ số theo tòa; HĐ thiếu giá/dịch vụ; phòng thiếu số người; reading bất thường; hóa đơn đã tồn tại; tổng số dự kiến. Action: tạo kỳ, chạy preflight, tạo nháp hàng loạt, gửi duyệt, phát hành, khóa/mở lại.

**Rule:** tạo invoice idempotent theo HĐ+kỳ; không sinh trùng. Kỳ hóa đơn và kỳ báo cáo là hai object riêng nhưng liên kết bằng tháng.

### UI-12 — Hóa đơn

**Danh sách:** filter kỳ, scope, status chứng từ, tình trạng thu, hạn TT, Zalo, khoảng tiền. Cột: số hóa đơn, phòng/khách, kỳ, tiền phòng, dịch vụ, thu khác/phạt, cọc, điều chỉnh, tổng cần đóng, đã đóng, còn lại, hạn, trạng thái, Zalo.

**Chi tiết**

| Nhóm | Nội dung |
|---|---|
| Header | Số, kỳ, tòa/phòng, khách, HĐ, tài khoản nhận, nội dung CK |
| Dòng tiền phòng | Từ–đến, số ngày, đơn giá, prorate `/30` **ASSUMED** |
| Dịch vụ | Service, lượng, đơn giá snapshot, thành tiền, source reading |
| Khác | Phạt, điều chỉnh, thu khác, lý do và người duyệt |
| Thanh toán | Allocation theo ngày/mốc, payment link, tổng thu/còn/thừa |
| Gửi | Zalo status, lần gần nhất, retry/fallback |
| Audit | version, điều chỉnh/hủy, actor, reason |

**Action:** tạo nháp, thêm dòng, tính lại, gửi duyệt, phát hành, thu tiền, gửi Zalo, tạo điều chỉnh, hủy có điều kiện, in/PDF, export. Hóa đơn phát hành không sửa trực tiếp; dùng adjustment/version.

**State:** `Nháp → Chờ duyệt → Phát hành → Thu một phần → Đã thu đủ`; nhánh điều chỉnh/hủy. Tình trạng thu: `Chưa TT/Thiếu/Đủ/Thừa`.

### UI-13 — Thu tiền

**Danh sách:** payment code, ngày/giờ, kênh, tài khoản nhận/người thu, khách/phòng, amount, allocated, unallocated, status, proof, người xác nhận.

**Form**

| Field | Quy tắc |
|---|---|
| Kênh | Chuyển khoản/Tiền mặt/Khác |
| Thời điểm thu | Dùng xác định kỳ CF và M1/M2/M3 |
| Khách/phòng/nội dung CK | Có thể chưa xác định khi import sao kê |
| Số tiền | >0; VND |
| Tài khoản nhận/người thu | Tiền mặt bắt buộc người thu |
| Minh chứng | Bắt buộc khi xác nhận thủ công |
| Allocation | Một payment nhiều hóa đơn/dòng; tổng allocation ≤ payment |

**Thứ tự tự động ASSUMED:** nợ cũ → dịch vụ + điện chung → thu khác/phạt → tiền phòng → cọc. Kế toán được override với lý do.

**Action:** ghi nhận thu, ghép payment chưa xác định, auto allocate, phân bổ tay, xác nhận tiền mặt đã nộp, đảo payment, export. Payment tiền mặt NVVH ở `Chờ xác nhận` không tính M5/M10/M15 cho tới khi kế toán xác nhận.

**State:** `Chờ xác nhận → Đã xác nhận → Đã đảo`; chưa allocate hiển thị `Chưa xác định`. Đảo phải sinh bút toán đối ứng, không xóa record.

### UI-14 — Công nợ & phạt

**Views:** Chi tiết hóa đơn, Theo khách, Theo phòng, Theo tòa, Theo quản lý, Nợ phá HĐ. Filter tuổi nợ, hạn, amount, mốc thu, penalty status.

**Cột:** khách/phòng/HĐ/hóa đơn, ngày phát hành, hạn TT, tuổi nợ, gốc, đã thu, còn lại, phạt đề xuất, liên hệ gần nhất, owner, status.

**Action:** mở hóa đơn, thu tiền, ghi nhận liên hệ, đề xuất phạt, xác nhận/miễn, duyệt phạt, đưa vào hóa đơn kỳ sau, xóa nợ có phê duyệt, Zalo nhắc, export.

**Rule ASSUMED:** chuyển công nợ sau 5 ngày từ ngày phát hành; phạt 200.000đ/ngày từ ngày thứ 6; không có trần mặc định nhưng ưu tiên điều khoản HĐ. Phạt qua chuỗi `Đề xuất → Xác nhận/Miễn → Đã duyệt → Đã lên hóa đơn`.

Nợ phá HĐ thu tháng sau giảm kỳ gốc nhưng không tính vào hiệu suất kỳ nào; CF ghi tháng thực thu.

### UI-15 — HĐ sắp hết/Gia hạn/Kết thúc

**Danh sách công việc:** HĐ, khách và người ở, phòng/tòa, quản lý, ngày hết, còn N ngày, công nợ, liên hệ gần nhất, kết quả, deadline, assignee, priority.

**Action:** nhận việc, ghi nhận liên hệ, đặt deadline, `Gia hạn`, `Kết thúc đúng hạn`, `Chấm dứt sớm/Phá HĐ`, `Chưa phản hồi`, export.

**Flow gia hạn:** chọn Gia hạn → tạo version/HĐ mới → sao chép khách/dịch vụ/cọc → cho phép sửa thời hạn/giá/điều khoản → review/duyệt → active tại effective date. Không tạo cọc mới nếu chuyển tiếp cọc.

**Flow kết thúc:** xác nhận loại/ngày/lý do → nhập CLOSING + ảnh → lập hóa đơn cuối → đối chiếu công nợ → khấu trừ được phép → tạo phiếu hoàn cọc nháp → phòng sang Chờ dọn từ ngày ra.

### UI-16 — Cọc & hoàn cọc

**Deposit ledger:** HĐ/khách/phòng, loại bút toán, ngày, amount, reference, running balance, creator. Ledger bất biến; sửa bằng `adjust`.

**Wizard hoàn cọc**

1. Chọn HĐ ở Chờ quyết toán; lấy cọc đang giữ.
2. Xác nhận hóa đơn cuối và công nợ được phép bù trừ.
3. Nhập khấu trừ: phạt, sửa chữa, vệ sinh, sơn, hao mòn, khác; file/ảnh + lý do.
4. Kiểm tra tài sản/chỉ số/bàn giao.
5. Tính `Thực hoàn = Cọc giữ − công nợ được bù − phạt − khấu trừ`.
6. Gửi duyệt → duyệt → ghi đã hoàn/chứng từ.

**Giả định:** mức khởi tạo theo tòa gồm hao mòn 200.000, vệ sinh 100.000, sơn 300.000–500.000; sửa được từng phiếu có lý do. Tiền phòng tháng cuối chỉ trừ cọc khi còn chưa thanh toán.

**State:** `Nháp → Chờ duyệt → Đã duyệt → Đã hoàn`; nếu thực hoàn <0 chuyển `Công nợ khách`; nhánh trả sửa/hủy. Chỉ Admin/Kế toán duyệt.

### UI-17 — Zalo ZNS

**Cấu hình:** OA/template, loại sự kiện, điều kiện, lịch gửi, cooldown, retry, recipient fallback, trạng thái rule. Không lưu secret dạng rõ trong UI.

**Tạo đợt gửi:** sự kiện/kỳ/scope → hệ thống dựng danh sách → re-check công nợ ngay trước xác nhận → preview eligible/skipped/error → gửi.

**Danh sách/chi tiết tin:** batch code, template, người tạo, scheduled/sent; khách/phòng, công nợ tại lúc gửi, status, provider code, số retry, thời gian, phản hồi, assignee.

**Action:** tạo batch, preview, gửi, retry eligible, dừng batch chưa chạy, tải log, mở khách/hóa đơn, gán phản hồi cho TPVH. Gửi thành công không đồng nghĩa đã thanh toán.

**State:** `Scheduled → Sent/Failed → Retrying → Sent/Gave up → Fallback`; `Skipped` khi đã thu đủ. Rule `Nháp → Hiệu lực → Tắt`.

---

## 10. Đặc tả màn hình chi tiết — Nhân sự và lương

### UI-18 — Cơ cấu tổ chức

**Layout:** cây tổ chức bên trái, thông tin đơn vị và timeline lead bên phải; có chọn `Xem tại ngày`.

**Field đơn vị:** mã, tên, loại, đơn vị cha, effective from/to, lead chính, mô tả, trạng thái. Lead là quan hệ có thời hạn; không ghi đè lịch sử.

**Action:** tạo/sửa đơn vị, đổi cha có kiểm tra vòng lặp, gán/thay lead, lập thay đổi tương lai, ngừng đơn vị, xem nhân sự/tòa thuộc đơn vị. Không cho ngừng nếu còn nhân sự hoặc assignment hiệu lực mà chưa có kế hoạch chuyển.

**State:** `Planned → Active → Inactive`; lead hiển thị `Sắp tới/Hiệu lực/Đã kết thúc` theo ngày xem.

### UI-19 — Nhân sự

**Danh sách:** mã NV, họ tên, SĐT/email, chức danh, level, đơn vị, lead, ngày vào, trạng thái, số tòa/phòng phụ trách, tài khoản, bảng lương kỳ gần nhất.

**Field chi tiết**

| Nhóm | Field |
|---|---|
| Hồ sơ | Mã, họ tên, ngày sinh, CCCD, SĐT, email, địa chỉ, tài liệu |
| Việc làm | Ngày vào/thử việc/chính thức/nghỉ, chức danh, level, đơn vị, lead |
| Ngân hàng | Ngân hàng, STK, chủ TK; mask theo quyền |
| Cấu phần lương | Lương cơ bản, ăn trưa, xăng xe, hỗ trợ, mức cố định theo chức danh |
| Tài khoản | User liên kết, role/permission; không lưu mật khẩu tại hồ sơ |
| Liên kết | Assignment, hiệu suất, payroll result, payment |

**Tabs:** Tổng quan, Phân công, Cấu phần lương, Kỳ lương, Hồ sơ, Lịch sử. Action: thêm/sửa, xác nhận hết thử việc, ghi nghỉ/đi làm lại, tạo user, thay đơn vị có effective date.

**State:** `Thử việc → Đang làm → Nghỉ việc`; ngày nghỉ tương lai hiển thị `Sắp nghỉ`. Không tạo assignment mới sau ngày nghỉ.

### UI-20 — Phân công tòa nhà

**Views:** Hiện tại, Sắp tới, Chờ duyệt, Lịch sử, Cảnh báo thiếu phụ trách chính.

**Cột/field:** tòa, nhân sự, role `Phụ trách chính/Phối hợp/Kỹ thuật/Vệ sinh`, đơn vị, effective from/to, nguồn/yêu cầu, lý do, status, người tạo/duyệt.

**Action:** tạo, thay đổi quản lý, điều chuyển hàng loạt, gửi duyệt, trả sửa, duyệt, từ chối, hủy trước hiệu lực, kết thúc assignment. Khi duyệt `Phụ trách chính` mới, hệ thống preview việc kết thúc người cũ tại effective date − 1.

**Validation:** mỗi tòa chỉ một `Phụ trách chính` tại một thời điểm; nhân sự còn làm việc; scope đơn vị phù hợp; ngày không chồng; thay đổi phải có lý do.

**State:** `Draft → Chờ duyệt → Đã duyệt → Đang hiệu lực → Hết hiệu lực`; nhánh `Từ chối/Đã hủy`.

### UI-21 — Hiệu suất thu tiền

**Bộ lọc:** kỳ lương, đơn vị, nhân sự, role assignment, tòa, trạng thái provisional/final.

**Bảng NV × tòa**

| Cột | Mô tả |
|---|---|
| NV/Tòa | Assignment phụ trách tại ngày 15 **ASSUMED** |
| Số phòng | Phòng có hóa đơn kỳ; tách tổng phòng quản lý |
| DT niêm yết/phải thu | D-45/D-46 |
| M1/M2/M3 | Thu xác nhận đến 23:59 ngày 5/10/15 **ASSUMED** |
| DT 3 mốc | Trọng số 100/90/70% |
| Dịch vụ/Thu thêm | Thành phần công thức D-48 |
| Tổng DT thu được | D-49 |
| Hiệu suất % | Tổng DT thu được ÷ DT niêm yết |
| Bậc/đơn giá | Payroll Rule Version tại kỳ |
| Lương hiệu suất | Drill-down công thức và payment |

**Action:** drill-down payment → invoice, export, tạo đề nghị điều chỉnh, duyệt/từ chối điều chỉnh, xem rule version. Không sửa trực tiếp số tổng.

**State:** `Tạm tính` cho tới khóa payroll; `Thực tế` sau khóa. Thu tiền mặt chỉ vào mốc khi Kế toán xác nhận.

### UI-22 — Bảng lương

**Header:** kỳ, status, ngày chốt 16/N, rule version, N phân bổ, số nhân sự, tổng thực nhận, cảnh báo.

**Bảng kết quả:** NV, chức danh/level snapshot, lương cơ bản, ăn trưa, xăng xe, lương lead, hỗ trợ, lương hiệu suất, điều chỉnh, khấu trừ, tổng gross, thực nhận, payment status.

**Drawer chi tiết:** danh sách tòa và snapshot 15 chỉ tiêu hiệu suất; assignment ngày 15; bậc/đơn giá; các cấu phần; adjustment có lý do; audit.

**Rule ASSUMED:** kỳ N theo đợt hóa đơn tiền phòng tháng N; chốt 16/N; đổi quản lý giữa tháng tính cho người phụ trách ngày 15, không prorate. Tòa mới dùng 100.000đ/phòng tối đa 2 tháng và kết thúc sớm khi lấp đầy ≥70%. Dưới 75% không trả lương hiệu suất; dùng % chưa làm tròn để xếp dải.

**Mẫu số ASSUMED:** N chi phí gồm phòng đang quản lý kể cả trống; hiệu suất dùng phòng có hóa đơn. Tháng 8: N=1.382, hiệu suất=1.079; 1.343 là lỗi nguồn.

**Action:** mở kỳ, refresh snapshot, sửa cấu phần được phép, thêm adjustment/khấu trừ, gửi review, trả sửa, khóa, mở lại với lý do, export bảng lương/UNC.

**State:** `Nháp/Open → Reviewing → Locked → Reopened`; khi đã có chi một phần, mở lại phải tạo phiếu bổ sung/thu hồi, không sửa phiếu đã chi.

### UI-23 — Chi lương

**Danh sách theo NV × kỳ:** thực nhận, đã chi, còn lại, status, ngân hàng/STK, đợt gần nhất.

**Phiếu/đợt chi:** kỳ, loại `Tạm ứng/Thanh toán/Bổ sung/Thu hồi`, danh sách NV, amount, ngày dự kiến/thực tế, ngân hàng, nội dung CK, file, người duyệt, đối soát.

**Action:** tạo đợt từ payroll Locked, tạo tạm ứng, gửi duyệt, duyệt, đánh dấu đã chi, import kết quả ngân hàng, ghép giao dịch, hủy phiếu chưa chi, tạo thu hồi âm cho phiếu đã chi.

**Rule ASSUMED:** lương kỳ N chi ngày 20–25 tháng N+1; tạm ứng liên kết và trừ khi khóa; Admin duyệt trước khi ghi Đã chi.

**State NV:** `Chưa chi/Chi một phần/Đã chi`. Phiếu: `Nháp → Đã duyệt → Đã chi`; nhánh Hủy; thu hồi là phiếu mới số âm.

---

## 11. Đặc tả màn hình chi tiết — Chi phí, tài sản và cổ đông

### UI-24 — Chi phí & Import

**Danh sách:** mã, ngày chứng từ, ngày trả, kỳ kế toán, nhà cung cấp, category/metric mapping, mô tả, amount/VAT, tòa/nhóm/system, scope phân bổ, attachment, status, import batch.

**Form:** nguồn tạo tay/import; số/ngày chứng từ; nhà cung cấp; nhóm chi phí; amount; paid date; accounting period; building/group/system scope; allocation rule; tài sản liên quan; file; ghi chú.

**Action:** thêm, import file, tải template, validate preview, sửa dòng lỗi, confirm batch, xác nhận chi phí, hủy/đảo, chạy phân bổ, export. Import phải idempotent theo source key/hash.

**State:** `Nháp → Đã xác nhận → Đã phân bổ → Đã khóa`; nhánh Hủy. Chứng từ kỳ khóa chỉ điều chỉnh ở kỳ hiện tại và tham chiếu kỳ gốc.

### UI-25 — Phân bổ chi phí và lương

**Rule list:** mã/tên, source category, scope, basis, phương pháp, effective date, version, status.

**Phương pháp:** theo số phòng N, doanh thu, số tòa, tỷ lệ nhập tay, nhóm T/S/G; lương cố định theo phòng, lương hiệu suất ghi thẳng tòa.

**Run detail:** nguồn chi phí/lương, tổng tiền, mẫu số N, từng tòa n/tỷ lệ/amount, chênh làm tròn, cảnh báo thiếu tòa, version rule, status.

**Action:** tạo version rule, mô phỏng, chạy, so sánh run, duyệt, khóa theo kỳ, export. Tổng phân bổ phải bằng nguồn; chênh làm tròn dồn theo rule đã công bố.

**State:** Rule `Nháp → Hiệu lực → Hết hiệu lực`; Run `Nháp → Đã duyệt → Đã khóa`; mở kỳ sinh run mới và lưu trữ run cũ.

### UI-26 — Hoa hồng

**Danh sách/import:** deal key, installment, kỳ/tháng trả, tòa/phòng, khách/HĐ, người/team nhận, giá chốt, cơ sở tính, tỷ lệ, amount, điều kiện đủ, paid status/date, mức ngoài tham chiếu, trạng thái.

**Action:** import/tạo tay, ghép HĐ/phòng, validate, confirm, lập nhóm chi, ghi đã chi, hủy chưa chi, export. Mức ngoài tham chiếu cảnh báo và yêu cầu duyệt nhưng không chặn.

**Rule ASSUMED:** cho phép nhiều đợt cùng deal (8% + 42%) và tỷ lệ đối tác riêng (65%). Đã chi không thu hồi khi khách bỏ/phá HĐ sau đó; chưa chi được hủy. Prorate mọi nghiệp vụ theo 30 ngày.

**State:** `Nháp → Đã xác nhận → Đã ghi chi phí → Đã chi → Đã khóa`; nhánh Hủy khi kỳ chưa khóa.

### UI-27 — Tài sản & khấu hao

**Danh sách:** mã, tên, category, tòa/phòng/khu vực, ownership, quantity, nguyên giá đơn vị/tổng, ngày dùng, tháng khấu hao, khấu hao lũy kế, còn lại, condition, status.

**Form:** nguồn chi phí/đầu tư, đơn vị tài sản, hạng mục rời/cải tạo gắn tòa, amount, threshold decision, ngày dùng, useful life, HĐ đầu vào liên quan, is capital contribution, file.

**Rule ASSUMED:** từ 2.000.000đ/đơn vị tạo asset; dưới ngưỡng ghi chi phí cả CF/AC. Thiết bị rời dưới 10 triệu khấu hao 12 tháng, từ 10 triệu khấu hao 36 tháng; cải tạo theo thời gian HĐ còn lại tối đa 60 tháng. G1 đầu tư 38.862.000đ khấu hao tách hạng mục, dự kiến 2.325.167đ/tháng.

**Tabs:** Tổng quan, Lịch khấu hao, Điều chuyển, Bảo trì/kiểm kê, Tài liệu, Audit. Action: tạo, kích hoạt, điều chuyển tòa, ghi condition, thanh lý, xem schedule, export.

**State:** Asset `Nháp → Đang dùng → Đã khấu hao hết/Đã thanh lý/Đã chuyển tòa`; schedule `Dự kiến → Đã ghi → Đã khóa`.

### UI-28 — Tiền thuê nhà và chi phí trả trước

**Mục tiêu:** tách lịch tiền thật trả chủ nhà, chi phí CF theo tháng HĐ và phân bổ AC.

**Bảng theo HĐ/kỳ:** tòa, tháng, monthly rent, miễn/giảm, `HEAD_LEASE_COST` CF, `HEAD_LEASE_COST_AC`, kỳ trả, amount due/paid, due date, status, chứng từ, nghĩa vụ cổ đông.

**Rule ASSUMED:** CF ghi tiền thuê theo tháng hợp đồng; tháng miễn = 0 và giảm giá đợt theo rule chứng từ. AC dàn đều tổng hợp đồng trên toàn thời hạn, kể cả tháng miễn. HĐ nhiều tòa mặc định theo số phòng, cho override phụ lục tổng 100%.

**Action:** xem/generate lịch, điều chỉnh lịch bằng version, ghi trả, upload chứng từ, nhắc cổ đông/chủ trách nhiệm, drill-down Report A, export.

### UI-29 — Cổ đông, cổ phần, góp vốn, phân phối

**Tabs**

| Tab | Field chính | Action |
|---|---|---|
| Cổ đông | Mã, tên, CCCD/MST, SĐT, email, STK, tài liệu | Thêm/sửa/ngừng |
| Cổ phần theo tòa | Tòa, cổ đông, %, effective from/to, version | Tạo version, duyệt; tổng=100% |
| Nghĩa vụ góp | Kỳ/HĐ đầu vào, due date, amount, đã góp/còn, status | Tạo từ lịch trả, ghi nhận góp |
| Tài khoản vốn | Loại nguồn, chứng từ, tăng/giảm, running balance | Điều chỉnh bằng bút toán |
| Phân phối | Quý, basis, LN lũy kế, bù lỗ, distributable, % snapshot, amount, paid | Lập, duyệt, chi, hủy |

**Rule ASSUMED:** chia theo quý trên lợi nhuận AC lũy kế dương sau bù lỗ; không gồm cọc; % tại ngày cuối quý, không prorate. Phase 1 không có cổ đông cấp công ty; cổ đông tòa không xem Report B.

**Vốn G1 ASSUMED:** dùng 230.400.000đ làm số dư mở sổ. Nguồn hiện cộng 232.262.000đ, chênh 1.862.000đ phải hiển thị `Chênh lệch mở sổ chờ đối soát`, không phân cho cổ đông/chi phí cho tới khi có chứng từ. Cọc chủ nhà là tài sản/vốn; phí môi giới là đầu tư ban đầu và phân bổ AC theo HĐ.

**State:** share version `Nháp → Hiệu lực → Hết hiệu lực`; capital obligation `Chưa góp → Góp một phần → Đủ/Quá hạn`; distribution `Nháp → Đã duyệt → Đã chi → Đã khóa`.

---

## 12. Đặc tả màn hình chi tiết — Báo cáo và hệ thống

### UI-30 — Kỳ báo cáo & khóa kỳ

**Danh sách:** kỳ, từ/đến, cutoff, status, version, progress lương/chi phí/chỉ số/hóa đơn, lỗi đối soát, người khóa/thời gian.

**Checklist trước khóa**

- Bảng lương kỳ đã Locked.
- Chỉ số/hóa đơn hoàn tất; không còn batch lỗi nghiêm trọng.
- Chi phí confirmed và allocation approved.
- Hoàn cọc/hoa hồng của kỳ đã xử lý hoặc có ngoại lệ.
- Rule/metric version hợp lệ; các dòng `NEED_BUSINESS_CONFIRMATION` được cảnh báo.
- Golden reconciliation không còn source difference chưa giải quyết.

**Action:** tạo kỳ, tính preview, gửi reviewing, trả về open, khóa, mở lại có lý do, so sánh version, export snapshot.

**State:** `Open → Reviewing → Locked → Reopened → Reviewing`. Khi Reopened, cổ đông vẫn xem version Locked cũ cho tới khi khóa version mới.

**Rule ASSUMED:** chốt lương ngày 16, kiểm chi phí ngày 20, khóa sau ngày 20. Payment đến sau khóa đi vào kỳ hiện tại qua adjustment liên kết kỳ gốc; không tự mở kỳ cũ.

### UI-31 — Report A/B và CF/AC

**Header chung:** kỳ, basis `CF/AC`, version, status, scope, thời điểm snapshot, nút export, compare, mở drill-down.

**Report A — theo tòa:** 12 khối: Doanh thu; Cọc/Hoàn; Đếm phòng; Doanh thu tiền nhà; Doanh thu dịch vụ; Giá vốn; Chi phí bán hàng/vận hành; Tổng chi phí; Lợi nhuận gộp; Lợi nhuận ròng; Tỷ lệ; Cổ đông.

**Report B — tổng T/S/G:** cột `Tổng/T/S/G`; dòng tiền/đếm cộng từ tòa; tỷ lệ bắt buộc tính lại từ tử/mẫu tổng, không lấy trung bình. Filter bổ sung khu vực, lead, quản lý, tòa, L1/L2/L3.

**Hiển thị metric**

| Thành phần | UI |
|---|---|
| Giá trị | VND/count/% theo locale vi-VN, số âm màu + dấu ngoặc/icon |
| Basis | Chip CF hoặc AC; tooltip mô tả nguyên tắc |
| Trust | `Confirmed/Assumed/Need confirmation/Source difference` |
| So sánh | kỳ trước, ngân sách nếu có, chênh tuyệt đối và % |
| Drill-down | Chứng từ nguồn, filter expression, numerator/denominator, N/n |

**Các quyết định ASSUMED ảnh hưởng report:** điện chung cộng `ELECTRIC_REVENUE`; cọc không vào doanh thu AC, cọc giữ vào `OTHER_INCOME`; khách trả trước phân bổ theo tháng; lương theo kỳ trên cả CF/AC; ngưỡng asset/khấu hao; tiền thuê CF theo tháng HĐ và AC dàn đều.

**Action:** đổi CF/AC, đổi kỳ/scope, expand khối, mở metric drill-down, xem chứng từ, compare version, export XLSX đúng layout A/B và CSV dữ liệu.

### UI-32 — Đối soát Golden & Metric definitions

**Reconciliation table:** metric code/label, scope, basis, giá trị nguồn Excel, hệ thống, chênh, tolerance, status, note, evidence, assignee, confirmation.

**Status:** `MATCH`, `ROUNDING_DIFFERENCE`, `RULE_DIFFERENCE`, `SOURCE_DATA_DIFFERENCE`, `NEED_BUSINESS_CONFIRMATION`. Không dùng màu đơn lẻ; có icon và mô tả.

**Action:** import golden, chạy đối soát, drill-down, gắn nguồn, xác nhận rule difference, giao xử lý source difference, rerun, export evidence pack. Chỉ dòng MATCH/rounding/ngoại lệ đã xác nhận mới cho nghiệm thu.

**Metric definition:** code, label, basis, group, unit, formula type/expression, source entity/date field/filter, additive, Excel cell mapping, version/effective date, status, business confirmation. Version Active đã dùng trong kỳ Locked không sửa được.

### UI-33 — Cài đặt, User/Quyền, Import Job và Audit

**User & quyền:** user, employee/shareholder link, roles, permission overrides, org scope, building scope, active/MFA, last login. Có preview `Người này sẽ thấy gì?` trước lưu.

**Danh mục/tham số:** trạng thái khách, lý do kết thúc, chức danh/level, loại tổ chức, role assignment, T/S/G/L, mốc M1/M2/M3, ngày chốt chỉ số, hạn TT, ngưỡng Work Queue, ngưỡng asset, rule Zalo.

**Import jobs:** loại, file/hash, người tải, thời gian, total/valid/error/skipped, status, log. Flow `Upload → Map → Validate → Preview → Commit`; lỗi từng dòng tải xuống được; Retry chỉ dòng đủ điều kiện và idempotent.

**Audit:** actor, action, entity, code, scope, before/after diff, reason, timestamp, IP/device nếu có, correlation/job id. Filter và export theo quyền; audit không sửa/xóa qua UI.

---

## 13. Flow liên màn hình

### F-01 — Tạo hợp đồng bằng OCR

1. NVVH mở UI-08, tải file; hệ thống kiểm hash.
2. OCR xử lý và tạo field/candidate; Work Queue có item review.
3. NVVH review 13 nhóm, giải quyết conflict và chọn giá dịch vụ.
4. Validate hiển thị Error Summary; người dùng sửa tới khi pass.
5. Confirm commit một transaction: Customer → Contract draft → members/services/deposit/meter/assets/terms/documents.
6. Mở UI-07, kiểm tra summary; gửi duyệt/Chờ ký.
7. Khi đủ cọc, chỉ số OPENING, duyệt giá → kích hoạt; phòng sang Đang thuê.

**Failure:** commit lỗi rollback; job `COMMIT_FAILED`, Retry không tạo trùng.

### F-02 — Chốt chỉ số và phát hành hóa đơn

1. UI-10 mở kỳ/tòa, copy chỉ số cũ và nhập mới.
2. Validate thiếu/trùng/âm/bất thường/ảnh; gửi TNVH duyệt.
3. UI-11 preflight HĐ, dịch vụ, số người, meter và hóa đơn trùng.
4. Tạo invoice draft idempotent; NVVH/Kế toán review.
5. Gửi duyệt hoặc phát hành theo quyền.
6. UI-17 tạo đợt Zalo, re-check công nợ rồi gửi.

### F-03 — Thu tiền, công nợ và phạt

1. Tạo/import payment tại UI-13; chuyển khoản được ghép theo mã phòng/tài khoản.
2. Payment tiền mặt ở Chờ xác nhận cho tới khi Kế toán xác nhận đã nộp.
3. Hệ thống auto allocate theo thứ tự ASSUMED; Kế toán có thể override có lý do.
4. Sau 5 ngày từ phát hành, invoice chưa đủ xuất hiện UI-14/Work Queue.
5. Hệ thống đề xuất phạt từ ngày thứ 6; quản lý xác nhận/miễn; Kế toán duyệt.
6. Phạt duyệt được đưa vào Thu khác hóa đơn kỳ sau.

### F-04 — Gia hạn hoặc kết thúc hợp đồng

1. Trước 35 ngày, item vào UI-15.
2. Gia hạn: tạo HĐ/version nối tiếp, sửa giá/thời hạn/điều khoản, chuyển cọc, duyệt và kích hoạt.
3. Kết thúc: ghi ngày/lý do → chỉ số CLOSING + ảnh → hóa đơn cuối.
4. Đối chiếu công nợ; UI-16 lập phiếu hoàn cọc và khấu trừ.
5. Kế toán/Admin duyệt và ghi hoàn; HĐ Kết thúc, phòng Chờ dọn.
6. Vệ sinh/kỹ thuật xác nhận dọn/nghiệm thu; phòng Sẵn sàng.

### F-05 — Hiệu suất, bảng lương và chi lương

1. Payment confirmed tự gắn M1/M2/M3 theo mốc 23:59 ngày 5/10/15.
2. UI-21 cập nhật Provisional theo NV × tòa.
3. Ngày 16, UI-22 mở/chốt payroll, snapshot assignment ngày 15 và rule version.
4. HR/Admin review adjustment; Kế toán/Admin khóa payroll.
5. UI-23 tạo đợt tạm ứng/thanh toán; Admin duyệt.
6. Kế toán ghi đã chi/import kết quả ngân hàng; trạng thái NV cập nhật.

### F-06 — Chi phí, phân bổ và khóa báo cáo

1. UI-24 nhập/import chi phí; validate và confirm.
2. UI-25 chạy phân bổ theo rule version; tổng phải khớp nguồn.
3. Sau ngày 20, Kế toán kiểm checklist UI-30 và gửi Reviewing.
4. UI-32 chạy golden; xử lý source difference/confirm rule difference.
5. Admin khóa kỳ; hệ thống freeze rule, assignment, shares, payroll, allocation và metric.
6. UI-31 xuất Report A/B CF/AC từ snapshot.

### F-07 — Góp vốn và phân phối lợi nhuận

1. Lịch trả chủ nhà UI-03/UI-28 sinh nghĩa vụ theo % cổ phần hiệu lực.
2. UI-29 ghi nhận góp, cập nhật capital ledger.
3. Cuối quý sau khi kỳ cuối quý Locked, hệ thống tính LN AC lũy kế sau bù lỗ.
4. Nếu dương, lập distribution theo % snapshot cuối quý; nếu âm, distributable = 0.
5. Admin duyệt; Kế toán ghi đã chi; cổ đông xem read-only theo tòa.

### F-08 — Thay đổi quản lý tòa

1. UI-20 tạo assignment mới có ngày hiệu lực và lý do.
2. Hệ thống kiểm chồng khoảng, preview assignment bị kết thúc.
3. Người có quyền duyệt; đến ngày hiệu lực job kích hoạt.
4. Dashboard/scope dùng assignment theo ngày; payroll kỳ dùng snapshot ngày 15.
5. Dữ liệu kỳ Locked không đổi khi assignment hiện tại thay đổi.

---

## 14. Ma trận trạng thái và action nhạy cảm

| Đối tượng | Draft/Open | Reviewing/Chờ duyệt | Approved/Active | Locked/Closed |
|---|---|---|---|---|
| HĐ thuê | Sửa, hủy | Trả sửa, duyệt | Gia hạn/kết thúc, không sửa dữ liệu đã snapshot | Chỉ xem/điều chỉnh bằng sự kiện |
| Hóa đơn | Sửa dòng | Trả sửa/phát hành | Thu tiền/điều chỉnh/hủy có điều kiện | Adjustment kỳ hiện tại |
| Payment | Chờ xác nhận | Kế toán xác nhận | Allocate/đảo | Bút toán đối ứng |
| Hoàn cọc | Sửa | Trả sửa/duyệt | Ghi đã hoàn | Chỉ xem |
| Payroll | Refresh/sửa được phép | Trả/Khoá | Tạo chi lương | Mở lại có reason/version |
| Chi phí | Sửa/hủy | Xác nhận | Phân bổ | Điều chỉnh kỳ hiện tại |
| Kỳ báo cáo | Tính lại | Khóa mềm | — | Freeze; mở lại Admin |

Action bắt buộc confirm + lý do: hủy/đảo chứng từ, xóa nợ, miễn phạt, trả sửa, thay giá dưới sàn, mở khóa kỳ, đổi assignment, đổi % cổ phần, điều chỉnh vốn và ghi đè allocation.

## 15. Decision Log — 25 câu trả lời giả định

| # | Quyết định dùng trong UI/spec | Nhãn |
|---:|---|---|
| 1 | Tiền thuê CF theo tháng HĐ; AC dàn đều cả tháng miễn/giảm | ASSUMED |
| 2 | Lương theo kỳ trên CF/AC; chi 20–25 tháng sau; có tạm ứng | ASSUMED |
| 3 | G1 khấu hao tách hạng mục; ngưỡng 10 triệu tính từng đơn vị | ASSUMED |
| 4 | Vốn hóa từ 2 triệu/đơn vị | ASSUMED |
| 5 | Điện chung cộng Doanh thu điện, vẫn drill-down riêng | ASSUMED |
| 6 | Cọc không là doanh thu AC; cọc giữ là Other income; trả trước phân bổ | ASSUMED |
| 7 | Mốc 16/20/sau 20; payment trễ điều chỉnh kỳ hiện tại | ASSUMED |
| 8 | Phân bổ thu thiếu: nợ cũ → DV → thu khác → phòng → cọc | ASSUMED |
| 9 | Công nợ sau 5 ngày phát hành; phạt từ ngày 6, không trần mặc định | ASSUMED |
| 10 | Tiền mặt NV giữ chưa tính mốc cho tới khi Kế toán xác nhận | ASSUMED |
| 11 | Prorate chia 30 cho mọi nghiệp vụ | ASSUMED |
| 12 | Khấu trừ hoàn cọc cấu hình theo tòa, sửa phiếu có lý do | ASSUMED |
| 13 | Chỉ trừ tiền phòng tháng cuối nếu còn chưa thanh toán | ASSUMED |
| 14 | HĐ chung nhiều tòa mặc định theo số phòng; phụ lục được override | ASSUMED |
| 15 | Nhắc trả chủ nhà 15/7/1; cảnh báo HĐ đầu vào trước 6 tháng | ASSUMED |
| 16 | Ma trận lương theo level × dải HS; dưới 75% = 0; cần Admin duyệt | ASSUMED |
| 17 | Phòng dưới quyền gồm phòng trống; TPVH tính toàn hệ thống | ASSUMED |
| 18 | Kỳ lương theo hóa đơn tháng N; assignment ngày 15, không prorate | ASSUMED |
| 19 | Tòa mới 100k/phòng tối đa 2 tháng, kết thúc sớm khi lấp đầy 70% | ASSUMED |
| 20 | N phân bổ khác mẫu số HS; 1.343 là lỗi nguồn, T8 dùng 1.382 | ASSUMED |
| 21 | Hoa hồng nhiều đợt/tỷ lệ riêng; đã chi không thu hồi | ASSUMED |
| 22 | Cọc chủ nhà/phí môi giới là vốn; G1 giữ chênh 1,862 triệu chờ đối soát | ASSUMED |
| 23 | Chia quý theo LN AC lũy kế dương; không cổ đông cấp công ty Phase 1 | ASSUMED |
| 24 | T/S/G là dòng sản phẩm; L1/L2/L3 là tình trạng; không quyết định quyền | ASSUMED |
| 25 | Mã khách tại Chờ ký; ảnh OPENING/CLOSING bắt buộc; HR gộp Admin/Kế toán | ASSUMED |

## 16. Validation, empty/loading/error và audit

### 16.1 Validation chung

- Validate format tại field; validate nghiệp vụ khi blur/submit; không báo lỗi đỏ khi người dùng đang gõ.
- Lỗi phải nêu nguyên nhân và cách sửa, ví dụ: `Chỉ số mới 125 nhỏ hơn chỉ số cũ 140. Kiểm tra lại hoặc chọn Thay công tơ.`
- Form nhiều lỗi có summary ở đầu, từng lỗi là link tới field.
- Server là nguồn validation cuối cùng; response 409 hiển thị conflict và dữ liệu mới nhất.

### 16.2 UI state bắt buộc cho mọi màn

| State | Yêu cầu |
|---|---|
| Loading | Skeleton giữ kích thước, không nhảy layout |
| Empty lần đầu | Giải thích dữ liệu là gì + CTA có quyền |
| Empty do filter | Hiển thị filter đang áp + Reset filter |
| Error | Nguyên nhân thân thiện, correlation ID, Retry |
| Offline/timeout | Giữ draft cục bộ nếu có, cho thử lại |
| Permission denied | Nêu phạm vi/quyền thiếu, link quay lại |
| Locked/read-only | Banner persistent và lý do; vẫn cho copy/export |
| Conflict | So sánh bản người dùng với bản mới, chọn reload hoặc lưu thành bản mới nếu hợp lệ |

### 16.3 Audit minimum

Mỗi log gồm: actor/user/role, scope, timestamp, entity type/id/code, action, before/after, reason, source UI/import/API, correlation/job ID, version kỳ. Dữ liệu nhạy cảm trong diff phải mask theo quyền.

## 17. Tiêu chí nghiệm thu mockup

### 17.1 Chức năng

- Có route và điều hướng được tới UI-00…UI-33; route đề xuất có thể đặt sau feature flag nhưng phải có placeholder rõ scope.
- Mỗi list có search/filter/sort/pagination/column chooser/export và giữ state khi Back.
- Mỗi detail có status, owner/scope, related entities, documents và audit.
- Các flow F-01…F-08 chạy được từ đầu đến cuối bằng dữ liệu demo, không tạo record trùng khi chạy lại.
- Các action bị chặn theo quyền/trạng thái hiển thị lý do cụ thể.
- Tất cả tổng báo cáo có drill-down về chứng từ; Report B tính lại tỷ lệ.

### 17.2 UI/UX và accessibility

- Kiểm thử ở 375, 768, 1024 và 1440px; không có horizontal scroll toàn trang.
- Tab order hợp lý, focus rõ, modal trap focus và trả focus về trigger khi đóng.
- Icon button có tên; chart dùng được bằng bàn phím và có bảng dữ liệu.
- Contrast đạt AA; trạng thái dùng icon/chữ ngoài màu; hỗ trợ reduced motion.
- Long form autosave draft; đóng khi có thay đổi chưa lưu phải hỏi xác nhận.

### 17.3 Dữ liệu và nghiệp vụ

- Scope theo assignment và ngày tham chiếu; kỳ Locked không đổi do master data hiện tại.
- Các quyết định `ASSUMED` hiển thị trong trang cấu hình/rule và có thể truy vết tới Decision Log.
- G1 hiển thị rõ chênh lệch vốn 1.862.000đ, không tự cân bằng âm thầm.
- Payment tiền mặt chưa xác nhận không vào mốc; prorate dùng 30; hoa hồng đã chi không tự thu hồi.
- Kỳ khóa freeze đủ metric, allocation, payroll, shares, type history và assignment.

## 18. Traceability

| Phần spec | Nguồn chính |
|---|---|
| UI-01 | M-1.01; R-33/R-34 |
| UI-02…UI-17 | M-2.01…M-2.14 |
| UI-18…UI-23 | M-3.01…M-3.06 |
| UI-24…UI-29 | M-4.01…M-4.06 |
| UI-30…UI-32 | M-5.01…M-5.06; R-37 |
| Decision Log | Phiếu 25 câu hỏi đã điền giả định; §6.1 và §6.7 |
| Design/UX | Data-dense enterprise dashboard; WCAG-oriented interaction rules |

---

**Kết luận:** Bản spec này đủ để dựng wireframe/mockup high-fidelity, map API/entity và viết test case. Trước khi dùng làm baseline triển khai production, khách hàng cần duyệt 25 quyết định `ASSUMED`, đặc biệt các rule ảnh hưởng tiền: phạt, lương, khấu hao, hoa hồng, vốn góp và lợi nhuận cổ đông.
