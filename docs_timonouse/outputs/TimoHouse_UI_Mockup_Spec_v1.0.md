# TIMOHOUSE — UI MOCKUP FUNCTIONAL SPECIFICATION

**Phiên bản:** 1.9

**Ngày lập:** 23/09/2026

> **Thay đổi ở 1.9 (24/09/2026) —** viết lại mô tả chuỗi **Chủ nhà → HĐ đầu vào → Tòa → Phòng** (UI-02…UI-05) cho rõ: thêm mục *Chuỗi Nguồn nhà* đầu §9 với sơ đồ luồng, bảng điều kiện qua từng bước và bảng đối tượng/trạng thái; mỗi màn theo khung Mục đích → Route/Mockup → Phác họa → Chú giải → Field → Action theo trạng thái → Rule → Nghiệm thu; phác họa dùng dữ liệu HĐ mẫu tùng sói (Seed §17) cho đường tạo mới và G1 (Seed §4, §6) cho trạng thái vận hành, thay dữ liệu minh họa T42/S19A/T17 không có nguồn. Điều kiện `Chuẩn bị → Đang khai thác` của tòa ghi **ASSUMED**.
>
> **Thay đổi ở 1.8 (24/09/2026) —** cụm **Nguồn nhà & tòa/phòng** dựng lại từ HĐ chủ nhà mẫu `Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc`: thêm job **Trích xuất HĐ chủ nhà** (upload → trích xuất → review → commit, route đề xuất `#/landlords/import`) thay cho quy định cũ "Phase 1 nhập tay, không OCR"; bổ sung các trường mẫu có nhưng bản đồ UI-03 còn thiếu và ba mâu thuẫn nội tại của mẫu; UI-05 thêm cách **sinh phòng theo tầng**; UI-27 tách **tài sản bàn giao của chủ nhà** khỏi tài sản công ty đầu tư. Phần cổ đông góp vốn của HĐ đầu vào để **làm sau**. Mockup render từ mã ở `ui-imagegen-v1/02-nguon-nha-toa-phong/`; dữ liệu mẫu ở Seed Data §17.
>
> **Thay đổi ở 1.7 (24/09/2026) —** sửa các lỗi phát hiện khi nghiệm thu bộ ảnh [`ui-imagegen-v1/`](ui-imagegen-v1/AUDIT.md): phép tính hoa hồng UI-26, dấu chênh CF − AC ở UI-28, lịch khấu hao G1 ở UI-27 theo `nghiep_vu/04` §4.4, người phụ trách theo Seed Data ở UI-01/UI-04/UI-19, cọc 301T41 ở UI-16, trạng thái kỳ trả ở UI-03/UI-28, trạng thái hóa đơn UI-12, đủ 8 xung đột HĐ–rule ở wireframe UI-08 và link gallery ở §8.1.
>
> **Thay đổi ở 1.6 —** thay toàn bộ số minh họa trong phác họa UI bằng **dữ liệu thật trích từ sổ Excel của công ty**, tập hợp tại tài liệu mới [`TimoHouse_Mockup_Seed_Data_v1.0.md`](TimoHouse_Mockup_Seed_Data_v1.0.md). Trục xuyên suốt là **tòa G1 kỳ 09/2026** và **kỳ đối soát 08/2026**. Các màn UI-01, UI-12, UI-21, UI-22 được cập nhật sang số thật; riêng UI-12 phơi bày một sai lệch có thật trong sổ: **điện chung được tính ra 40.533,33 đ/người nhưng không cộng vào Tổng dịch vụ**.
>
> **Thay đổi ở 1.5 —** đối chiếu spec với **hai hợp đồng mẫu thật**: `Hop_dong_thue_phong_demo_day_du.pdf` (HĐ khách, nguồn OCR) và `Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc` (HĐ chủ nhà, nhập tay). UI-08 thay bảng 7 nhóm chung bằng **bản đồ trích xuất theo từng Điều** kèm **bảng 8 xung đột giữa điều khoản hợp đồng và rule hệ thống** mà UI bắt buộc hiển thị. UI-03 bổ sung bản đồ trường theo Điều 1–12 của hợp đồng chủ nhà và danh sách trường hệ thống có nhưng mẫu không có. Bảy phát hiện mới được ghi thành **P-30…P-36** ở §18 để đăng ký ngược vào `nghiep_vu/`.
>
> **Thay đổi ở 1.4 —** bổ sung **phác họa UI (wireframe) cho đủ 34 màn UI-00…UI-33**, đặt ngay đầu mỗi mục đặc tả. Mỗi phác họa đánh số vùng `①②③…` và đi kèm bảng **"Chú giải vùng và chức năng"** mô tả chi tiết từng vùng làm gì, ràng buộc nào áp lên nó và vì sao. Quy ước ký hiệu dùng chung ở §8.2. Phác họa là wireframe mức bố cục và hành vi — dùng để review nghiệp vụ và chốt luồng trước khi dựng giao diện thật.
>
> **Thay đổi ở 1.3 —** đặc tả sâu 13 luồng vận hành theo yêu cầu: chủ nhà → HĐ đầu vào → tòa → phòng → khách → HĐ thuê → hóa đơn → thu tiền → tổ chức → nhân sự → chi phí (gồm hoa hồng) → cổ đông → báo cáo. Mỗi màn được bổ sung bảng **"Rule màn hình và truy vết"** gắn mã `BR-x.yy.z`, `D-xx`, `R-xx` về `nghiep_vu/`, kèm nhãn tin cậy. Các công thức khách hàng chưa chốt **không chặn việc dựng UI**: chúng được gắn mã `P-xx` và gom vào §18 để khi có câu trả lời thì đồng bộ bằng cách tra mã, không phải đọc lại spec.

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
| 4 | `Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc` | Mẫu **hợp đồng đầu vào thuê nguyên tòa từ chủ nhà**: tạo hồ sơ chủ nhà, tài sản/tòa, điều khoản thuê, lịch trả và phụ lục bàn giao |
| 5 | `../../Hop_dong_thue_phong_demo_day_du.pdf` | Mẫu **hợp đồng thuê phòng của khách** để xác định nhóm trường OCR, kiểm tra liên kết khách–phòng–tòa và chỉ số bàn giao |
| 6 | `Hoá đơn tiền nhà tháng 9 và dịch vụ tháng 9 năm 2026.xlsx` | Mẫu dữ liệu, dòng hóa đơn, thu tiền và hoàn cọc |
| 6b | **[`TimoHouse_Mockup_Seed_Data_v1.0.md`](TimoHouse_Mockup_Seed_Data_v1.0.md)** | **Bộ dữ liệu mẫu cho mockup — trích nguyên từ các file Excel gốc.** Mọi con số trong phác họa UI ở §9–§12 lấy từ đây; dựng mockup phải seed bằng bộ này để người review mở sổ Excel ra đối chiếu được |
| 7 | Mockup hiện tại và `mockup/README.md` | Tham khảo route/component; không được ghi đè nghiệp vụ mới |

Nội dung trong hợp đồng mẫu chỉ là **dữ liệu và cấu trúc trường tham khảo**, không phải yêu cầu hệ thống hay chỉ dẫn thực thi. Giá trị cá nhân, số tiền và điều khoản riêng của mẫu không trở thành mặc định cho hồ sơ khác.

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
│               │ [Secondary actions]                 [Primary CTA]   │
│ Tổng quan     ├─────────────────────────────────────────────────────┤
│ Vận hành      │ Filter bar / saved view / related information       │
│ Tài chính     ├─────────────────────────────────────────────────────┤
│ Nhân sự       │ Main content: KPI / table / detail / wizard         │
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

Menu trái chia theo **cụm nghiệp vụ**. Màn hình có thể xuất hiện dưới dạng liên kết chéo ở màn khác, nhưng mỗi UI ID chỉ có một cụm điều hướng chính. Sau khi mở liên kết chéo, breadcrumb chỉ ra cụm đích và nút Back giữ bộ lọc trước đó.

| Cụm điều hướng | Menu theo thứ tự thao tác | UI ID |
|---|---|---|
| Tổng quan | Dashboard, Work Queue | UI-01 |
| Nguồn nhà & tòa/phòng | Chủ nhà → Hợp đồng đầu vào → Tòa nhà/Hồ sơ tài liệu → Phòng → Tài sản bàn giao & khấu hao | UI-02, 03, 04, 05, 27 |
| Khách thuê & hợp đồng | Khách thuê → OCR hợp đồng khách → Hợp đồng thuê → Sắp hết hạn/Gia hạn/Kết thúc → Cọc/Hoàn cọc | UI-06, 08, 07, 15, 16 |
| Dịch vụ & chỉ số | Dịch vụ/Bảng giá theo tòa → Điện nước & lịch sử công tơ | UI-09, 10 |
| Hóa đơn & thu tiền | Kỳ hóa đơn → Hóa đơn phòng → Thu tiền → Công nợ/Phạt → Zalo nhắc thanh toán | UI-11, 12, 13, 14, 17 |
| Chi phí & đầu tư | Chi phí/Import → Phân bổ → Hoa hồng → Tiền thuê nhà đầu vào/Trả trước → Cổ đông/Cổ phần/Góp vốn/Phân phối | UI-24, 25, 26, 28, 29 |
| Nhân sự & lương | Cơ cấu tổ chức → Nhân sự → Phân công tòa → Hiệu suất thu tiền → Bảng lương → Chi lương | UI-18…23 |
| Báo cáo & đối soát | Kỳ báo cáo/Khóa kỳ → Report A/B, CF/AC → Đối soát/Metric definitions | UI-30…32 |
| Quản trị hệ thống | Danh mục, tham số, user/quyền, import jobs, audit | UI-33; UI-00 là cửa đăng nhập |

Ở chi tiết tòa có shortcut sang bảng giá, công tơ, phòng và hóa đơn; ở chi tiết khách/HĐ có shortcut sang chỉ số, hóa đơn, thu tiền và hoàn cọc. Shortcut không tạo bản sao dữ liệu.

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

**Thứ tự thiết kế và prototype theo cụm:** Nguồn nhà & tòa/phòng → Khách thuê & hợp đồng → Dịch vụ & chỉ số → Hóa đơn & thu tiền → Chi phí & đầu tư → Nhân sự & lương → Báo cáo & đối soát. Mỗi cụm cần có list, detail, form/action, trạng thái và liên kết chéo đã mô tả ở §6.2; các ID dưới đây giữ nguyên để không đứt traceability.

| ID | Màn hình | Route chuẩn | Module nguồn |
|---|---|---|---|
| UI-00 | Đăng nhập | `#/login` | System |
| UI-01 | Dashboard & Work Queue | `#/dashboard` | M-1.01 |
| UI-02 | Chủ nhà | `#/landlords`, `#/landlords/:id` | M-2.01 |
| UI-03 | Hợp đồng đầu vào | `#/landlords/import` (trích xuất), `#/landlords/:id?tab=head-leases`, `#/head-leases/:id` | M-2.02 |
| UI-04 | Tòa nhà | `#/buildings`, `#/buildings/:id` | M-2.03 |
| UI-05 | Phòng | `#/rooms`, `#/rooms/:id`, `#/rooms/new?building=:id` | M-2.04 |
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

## 8.1 Dòng dữ liệu nguồn, vòng đời và phác họa UI

**Mockup ảnh:** [Bộ mockup ImageGen v1](ui-imagegen-v1/README.md) — 34 màn UI-00…UI-33, 8 flow, 4 bảng responsive, 2 bảng state. Kết quả nghiệm thu từng ảnh: [AUDIT.md](ui-imagegen-v1/AUDIT.md).

### Nguồn dữ liệu và nhập liệu

- **Chủ nhà → HĐ đầu vào → tòa → phòng** là chuỗi dữ liệu chuẩn về tài sản Timehouse thuê lại. Chủ nhà liên kết nhiều tòa/HĐ theo thời gian. Cách tạo chính là **job trích xuất HĐ chủ nhà**: một lần commit tạo chủ nhà, HĐ đầu vào Nháp, tòa Chuẩn bị, tài liệu và tài sản bàn giao. Phòng tạo riêng ở UI-05 (sinh theo tầng hoặc import) vì HĐ chủ nhà không có danh sách phòng. Luồng đầy đủ và điều kiện qua bước ở mục *Chuỗi Nguồn nhà* đầu §9.
- **Hợp đồng thuê khách** là đầu vào OCR để đề xuất khách đứng tên, người ở, tòa/phòng, thời hạn, tiền phòng/cọc, dịch vụ/giá theo hợp đồng, phương tiện, tài sản bàn giao, chỉ số đầu kỳ, điều khoản và tài liệu. Người dùng rà soát rồi chọn tạo/liên kết/cập nhật/bỏ qua.
- Mẫu hợp đồng thuê phòng PDF có các nhóm trường OCR cụ thể: đại diện bên cho thuê, khách thuê/CCCD/liên hệ, mã tòa/phòng, số người/xe, bảng tài sản bàn giao và tình trạng, ngày giao phòng/ngày tính tiền/thời hạn, tiền phòng/cọc, giá điện/nước/internet/dịch vụ chung/xe, **chỉ số điện và nước bàn giao**, lịch thanh toán/tài khoản nhận, gia hạn và điều khoản khác. Trường trên mẫu chỉ là candidate; reviewer xác nhận từng nhóm trước khi lưu.
- Tòa/phòng chưa có trong danh mục trở thành ứng viên OCR, chờ liên kết chủ nhà/HĐ đầu vào và xác nhận trước khi vận hành; không ghi đè dữ liệu chuẩn hay giá đã hiệu lực.
- Khách, tòa, phòng hỗ trợ tạo tay/import. Import có ánh xạ cột, preview, dò trùng, lỗi theo dòng, chọn dòng hợp lệ và audit lô/người tạo/nguồn.
- Dịch vụ có giá mặc định toàn hệ thống và giá hiệu lực riêng từng tòa. Hóa đơn lấy giá đúng tòa/kỳ; giá riêng hợp đồng lưu lựa chọn/người duyệt. Hóa đơn phát hành snapshot đơn giá và tài khoản nhận.
- **Chỉ số điện nối kỳ:** dòng điện trên hóa đơn phòng lưu `meter_id`, `old_reading`, `new_reading`, `consumption`, kỳ và chứng từ chỉ số nguồn. Khi tạo kỳ mới, `old_reading` mặc định bằng `new_reading` cuối đã chốt trên hóa đơn hợp lệ trước đó của **cùng công tơ**; hóa đơn đầu dùng chỉ số OPENING đã duyệt. Màn hình phải cho thấy hóa đơn/chỉ số nguồn và cảnh báo khi thiếu hoặc đứt kỳ.
- Tài liệu tòa tải theo loại. Upload Giấy đăng ký HKD cập nhật tòa thành `Đã đăng ký (theo tài liệu)`, đồng thời mở bước xác minh file. PCCC, sổ đỏ và tài liệu khác cập nhật checklist riêng cùng trạng thái xác minh/hạn/version. Lưu người tải/ngày; gỡ hoặc thay tài liệu đã xác nhận cần quyền và lý do.

### Sơ đồ liên kết

    Chủ nhà → HĐ đầu vào / hồ sơ nguồn → Tòa / hồ sơ pháp lý → Phòng / công tơ
                                                  ├→ Bảng giá dịch vụ theo tòa ─┐
    Phòng / công tơ → OCR hợp đồng khách → Khách / người ở / xe / tài sản     │
                                      └→ HĐ thuê / cọc / điều khoản ──────────┤
    OPENING → chỉ số đã duyệt → Hóa đơn kỳ N (cũ/mới) → cũ kỳ N+1 ────────┤
    Chỉ số mới + số người ────────────────────────────────────────────────────┤
    Giá hiệu lực + snapshot hợp đồng ───────────────────────→ Hóa đơn → Thu tiền → Công nợ/hoàn cọc

### Phác họa các màn hình

**Chủ nhà → HĐ đầu vào → Tòa → Phòng:** phác họa, sơ đồ luồng và điều kiện qua từng bước nằm ở mục *Chuỗi Nguồn nhà* (đầu §9) và các mục UI-02…UI-05; mockup render từ mã ở [`ui-imagegen-v1/02-nguon-nha-toa-phong/`](ui-imagegen-v1/02-nguon-nha-toa-phong/README.md).

**OCR hợp đồng khách thuê**

    ┌ OCR / rà soát trước khi tạo ──────────────────────────────┐
    │ Tệp & trang │ Trường / giá trị       │ Tạo-liên-kết       │
    │ highlight   │ Khách đứng tên         │ Tạo / ghép hồ sơ   │
    │ zoom        │ Tòa / phòng            │ T42 / 302          │
    │             │ Tiền phòng / cọc       │ So khớp hợp đồng   │
    │             │ Dịch vụ & đơn giá      │ So bảng giá T42    │
    │             │ Người ở / xe / tài sản / chỉ số / điều khoản│
    ├ Trùng / thiếu nguồn / giá lệch / lỗi bắt buộc ───────────┤
    │ [Lưu nháp] [Xem dữ liệu] [Xác nhận tạo HĐ]               │
    └───────────────────────────────────────────────────────────┘

**Bảng giá → hóa đơn → thu tiền**

    ┌ Giá dịch vụ · T42 · hiệu lực 09/2026 ───────── [Thêm giá] ┐
    │ Dịch vụ | Đơn vị | Cách tính | Đơn giá | Hiệu lực          │
    │ Điện    | kWh    | Chỉ số    | …       | 01/09…            │
    │ Nước    | người  | Theo đầu  | …       | 01/09…            │
    ├ Hóa đơn phòng 302 ─────────────────────────── [Phát hành] ┤
    │ Tiền phòng | điện/nước/dịch vụ | nợ cũ/thu khác | Tổng     │
    │ Điện: cũ 1250 [Hóa đơn T8] → mới 1360 → 110 kWh × giá T42 │
    │ Chỉ số nguồn · giá snapshot · hạn · tài khoản/nội dung CK │
    │ Thu tiền: ngày | số tiền | phương thức | phân bổ | còn lại│
    │ [Ghi nhận thu] [In/PDF] [Gửi nhắc] [Lịch sử]              │
    └───────────────────────────────────────────────────────────┘

### Vòng đời khách thuê

Trạng thái hồ sơ suy ra từ hợp đồng: Ứng viên/chưa có HĐ → Chờ ký → Đang thuê → Sắp hết hạn → Chờ quyết toán → Đã rời. HĐ bị hủy trước hiệu lực ghi sự kiện Không tiếp tục; chấm dứt sớm đi qua Chờ quyết toán. HĐ hiệu lực xác định tòa/phòng hiện tại, cọc và công nợ. Giữ lịch sử khách sau khi rời. Ứng viên và Không tiếp tục là nhãn UI đề xuất, cần xác nhận nếu dùng làm trạng thái lưu trữ.

## 8.2 Quy ước ký hiệu trong phác họa

Mọi phác họa ở §9–§12 dùng chung bộ ký hiệu sau. Đây là **wireframe mức bố cục**, không phải thiết kế chi tiết: kích thước, khoảng cách và typography tuân theo design system ở §5.

| Ký hiệu | Nghĩa |
|---|---|
| `①②③…` | Đánh số vùng, tham chiếu sang bảng "Chú giải vùng và chức năng" ngay dưới mỗi phác họa |
| `[Nút]` | Nút bấm; `[◉ …] [○ …]` là radio/toggle; `☑ ☐` là checkbox |
| `[____]` | Ô nhập liệu; `▾` là dropdown |
| `✓` | Đã đạt / đã xác minh · `△` cảnh báo, không chặn · `✕` blocker, chặn thao tác |
| `ⓘ` | Ghi chú giải thích hiển thị **ngay trên màn**, không phải tooltip ẩn |
| `▸` | Link mở màn khác hoặc bung chi tiết |
| `[khóa]` | Trường hoặc bản ghi chỉ đọc do trạng thái/quyền |
| `●` | Trạng thái đang hiệu lực · `○` sắp tới hoặc chưa chọn |

Số liệu trong phác họa là **dữ liệu thật**, trích từ sổ Excel của công ty và tập hợp tại [`TimoHouse_Mockup_Seed_Data_v1.0.md`](TimoHouse_Mockup_Seed_Data_v1.0.md). Trục xuyên suốt là **tòa G1 kỳ 09/2026** (15 phòng, quản lý Đỗ Thuỳ Linh) và **kỳ đối soát 08/2026** (có báo cáo đã chốt của cả Report A và Report B). Nhờ vậy khi review, người xem mở đúng sheet trong file Excel ra là đối chiếu được từng con số trên màn hình. Khi dựng mockup, hãy seed bằng bộ dữ liệu đó thay vì bịa số mới.

## 9. Đặc tả màn hình chi tiết — Truy cập và vận hành thuê

### UI-00 — Đăng nhập

**Phác họa màn hình**

```text
┌────────────────────────── TIMOHOUSE ──────────────────────────┐
│                  Quản lý vận hành cho thuê                    │
│                                                               │
│  ① Tên đăng nhập / Email  [_________________________]         │
│  ② Mật khẩu               [_____________________] [hiện]      │
│  ③ Mã OTP (chỉ khi bật MFA) [______]      [Gửi lại OTP]       │
│                                                               │
│  ④ ☐ Ghi nhớ đăng nhập                  ⑤ Quên mật khẩu?      │
│                                                               │
│               ⑥ [        Đăng nhập        ]                   │
│                                                               │
│  ⑦ △ Dữ liệu mô phỏng — chọn vai trò demo: Admin ▾            │
└───────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Ô tên đăng nhập | Cho phép autocomplete username của trình duyệt |
| ② | Ô mật khẩu | Cho paste và password manager; nút hiện/ẩn có accessible name |
| ③ | Ô OTP | Chỉ render khi tài khoản bật MFA; `Gửi lại OTP` có đếm ngược chống spam |
| ④ | Ghi nhớ đăng nhập | Chỉ lưu session token, **không** lưu mật khẩu |
| ⑤ | Quên mật khẩu | Mở luồng đặt lại qua email |
| ⑥ | CTA chính | Thành công → mở deep link ban đầu hoặc Dashboard theo vai trò; thất bại → giữ username, báo lý do an toàn (không tiết lộ tài khoản có tồn tại hay không) |
| ⑦ | Băng dữ liệu mô phỏng | Bắt buộc hiển thị trong mockup; đổi vai trò demo để kiểm thử phạm vi dữ liệu |

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

**Phác họa màn hình**

```text
┌ Tổng quan ───────────────────────────────────── [Xuất Excel] [Lưu bộ lọc] ┐
│ ⓪ Kỳ 09/2026 ▾ │ Ngày 23/09 ▾ │ Khu vực ▾ │ Trưởng nhóm ▾ │ Quản lý ▾     │
│    Tòa ▾ │ Nhóm T/S/G ▾ │ Hạng L1–L3 ▾                                     │
├───────────────────────────────────────────────────────────────────────────┤
│ ① KPI PHÒNG                    (số thật, kỳ 08/2026 — xem Seed Data §14)  │
│  Tổng phòng quản lý 1.382 │ Tính hiệu suất 1.079 │ Phòng mới 95           │
│  Phá HĐ 39 │ Trống 11 (T 6 · S 4 · G 1) │ Lấp đầy 78,1 %                  │
├───────────────────────────────────────────────────────────────────────────┤
│ ② KPI HỢP ĐỒNG              │ ③ KPI TÀI CHÍNH (tạm tính, basis CF)        │
│  Hiệu lực 1.079             │  Tổng doanh thu   7.036.256.236             │
│  Sắp hết 35 ngày 74         │  Cọc phòng mới      371.850.000             │
│  ├ chưa xác nhận 31         │  Cọc khách bỏ        18.400.000 (memo)      │
│  Chờ OCR review 6           │  Hoàn cọc           104.968.774             │
│  Chờ quyết toán 12          │  Nợ phá HĐ 16.048.000 · đã thu 3.662.000    │
├───────────────────────────────────────────────────────────────────────────┤
│ ④ CẬP NHẬT TIẾN ĐỘ THU TIỀN — chốt 16/09  [◉ Theo quản lý ○ Theo tòa]     │
│ Quản lý              │ DT phải thu  │  Thực thu   │Tỷ lệ %│DT phá HĐ│Thu  │
│ Nguyễn T.T. Huyền    │  496.854.893 │ 497.458.881 │100,12 │2.894.000│  0  │
│ Đào Hữu Hoàng Giang  │  839.098.839 │ 792.461.800 │ 94,44 │24.057.00│584k │
│ Đỗ Thuỳ Linh         │1.021.393.600 │1.010.613.000│ 98,94 │8.154.000│1.66M│
│ Đỗ Thanh Hương       │  880.447.600 │ 851.348.000 │ 96,69 │33.730.00│760k │
│ Ng. Ngọc Văn Khải    │1.059.013.510 │1.055.884.800│ 99,70 │3.634.000│104k │
│ ⓘ Tỷ lệ > 100 % là hợp lệ (thu được cả nợ cũ) — không chặn, không làm tròn│
│ …                                              ⑤ [Xuất] [Mở chi tiết NV]  │
├───────────────────────────────────────────────────────────────────────────┤
│ ⑥ WORK QUEUE — việc cần xử lý hôm nay              Sắp xếp: Ưu tiên ▾      │
│ ● Loại việc            │ Đối tượng  │ Phụ trách │ Tuổi │ Hành động nhanh   │
│ ● Công nợ > 5 ngày     │ 402G5      │ Hương     │ 9 ng │ [Nhắc Zalo][Phạt] │
│ ● Chỉ số chưa duyệt    │ Tòa T24    │ Huy TNVH  │ 2 ng │ [Duyệt]           │
│ ● OCR chờ review       │ HĐ 302G6   │ Linh      │ 3 ng │ [Mở review]       │
│ ● Hoàn cọc chờ duyệt   │ 301T41     │ Kế toán   │ 1 ng │ [Duyệt][Trả sửa]  │
│ ● Lịch trả chủ nhà     │ HĐ HL-0021 │ Kế toán   │13 ng │ [Ghi nhận đã trả] │
│                                    ⑦ [Nhận việc][Chuyển][Bỏ qua có lý do] │
└───────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ⓪ | Thanh bộ lọc | Cascading theo BR-3.01.7: Khu vực → Trưởng nhóm → Quản lý → Tòa → Loại nhà. Bộ lọc phản ánh lên URL và áp cho **cả KPI, bảng và export** |
| ① | KPI phòng | Phòng trống bắt buộc tách 3 loại theo D-24; click mỗi ô mở danh sách đã filter sẵn |
| ② | KPI hợp đồng | "Sắp hết 35 ngày" tách tiếp thành chưa xác nhận / đã gia hạn / đã kết thúc |
| ③ | KPI tài chính | Công nợ tách theo tuổi nợ; mọi số là **tạm tính đến thời điểm xem**, không thay thế báo cáo chính thức ở UI-31 |
| ④ | Bảng tiến độ thu tiền | Thay cho biểu đồ doanh thu–công nợ (BR-1.01.18). Mốc đã qua lấy từ snapshot, mốc chưa tới hiện lũy kế hiện tại kèm nhãn "đang chạy" |
| ⑤ | Chuyển chế độ xem | Toggle *Theo quản lý* ↔ *Theo tòa*, giữ nguyên bộ lọc |
| ⑥ | Work Queue | Việc do hệ thống **tự sinh và tự đóng** từ trạng thái dữ liệu nguồn; Phase 1 người dùng không tạo việc tự do (BR-1.01.14) |
| ⑦ | Hành động trên việc | Nhận việc, chuyển người trong phạm vi, hành động nhanh ngay trên dòng, bỏ qua **bắt buộc có lý do + ngày tái mở** |

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

### Chuỗi Nguồn nhà — Chủ nhà → HĐ đầu vào → Tòa → Phòng

Timehouse thuê **nguyên tòa** từ chủ nhà, rồi cho thuê lại **từng phòng**. Vì vậy mọi phòng phải truy ngược được về đúng một tòa, một HĐ đầu vào và một chủ nhà. Mục này mô tả chuỗi 4 màn UI-02 → UI-03 → UI-04 → UI-05, cộng thêm UI-27 cho tài sản bàn giao, theo thứ tự người dùng thao tác. Chi tiết từng màn nằm ở các mục ngay bên dưới.

**Mockup:** [`ui-imagegen-v1/02-nguon-nha-toa-phong/`](ui-imagegen-v1/02-nguon-nha-toa-phong/README.md) có 7 ảnh `-verified` render từ mã. **Dữ liệu mẫu:**

- Đường **tạo mới từ hợp đồng**: dùng HĐ chủ nhà mẫu *tùng sói* (Phí Văn Thắng · 25A Ngõ 261 Phú Diễn · 114.000.000 đ/tháng), Seed Data §17.
- Trạng thái **đang vận hành**: dùng tòa G1, Seed Data §4 và §6.

**Sơ đồ luồng**

```text
 ① DANH SÁCH CHỦ NHÀ (UI-02)                           CTA chính [Tạo từ HĐ chủ nhà]
      │                                                CTA phụ   [+ Chủ nhà] (nhập tay)
      ▼
 ② TRÍCH XUẤT HĐ CHỦ NHÀ (UI-03 · #/landlords/import)
      Upload → Trích xuất → Review → Validate → Commit
      │ Commit = 1 transaction, lỗi một entity thì rollback toàn bộ
      ├──► Chủ nhà ............ Hoạt động                 → UI-02 chi tiết
      ├──► HĐ đầu vào ......... Nháp                      → UI-03 chi tiết
      ├──► Tòa ................ Chuẩn bị (ứng viên từ HĐ)  → UI-04
      ├──► Tài liệu ........... Chờ xác minh              → UI-02 ⑥ / UI-04 ⑦
      ├──► Tài sản bàn giao ... thuộc chủ nhà             → UI-27
      ├──► Công tơ cấp tòa .... chờ nhập mã               → UI-04 ⑥
      └──► Phòng .............. 0 (HĐ chủ nhà không có danh sách phòng)
      ▼
 ③ BỔ SUNG & KÍCH HOẠT HĐ ĐẦU VÀO (UI-03)   ngày thuê · STK chủ nhà · người ký Timehouse
      │ Nháp → Hiệu lực  ⇒ sinh lịch đóng tiền chủ nhà
      ▼
 ④ HOÀN THIỆN TÒA (UI-04)   mã tòa · số tầng · T/S/G · L1–L3 · TK nhận · hồ sơ pháp lý · QL (UI-20)
      ▼
 ⑤ TẠO PHÒNG (UI-05)        sinh theo tầng hoặc import Excel ⇒ phòng Sẵn sàng
      ▼
 ⑥ XÁC NHẬN BÀN GIAO (UI-27) · tòa Chuẩn bị → Đang khai thác
      ▼
 Phòng Sẵn sàng nhận HĐ thuê khách (UI-08 → UI-07)
```

**Điều kiện qua từng bước.** UI phải disable nút tương ứng và liệt kê điều kiện còn thiếu ngay trên màn:

| Bước | Điều kiện bắt buộc | Nút bị chặn | Căn cứ |
|---|---|---|---|
| ② Commit trích xuất | Mọi xung đột ✕ đã chọn hướng xử lý. Chủ nhà trùng CCCD/SĐT đã chọn `Dùng bản ghi có sẵn` hoặc `Vẫn tạo` kèm lý do | `Commit` | UI-03 trích xuất, BR-2.01.2 |
| ③ Kích hoạt HĐ đầu vào | Có ngày bắt đầu và kết thúc. Chủ nhà có STK nhận. Có người ký phía Timehouse. Tòa không thuộc HĐ đầu vào hiệu lực khác trùng thời gian. Phân bổ nhiều tòa đủ 100 % | `Bổ sung & kích hoạt` | BR-2.02.1, BR-2.02.2 |
| ⑤ Tạo phòng | Tòa đã có mã; mã **bất biến** sau khi lưu | `Tạo phòng` | BR-2.03.3, BR-2.04.1 |
| ⑥ Tòa → Đang khai thác | HĐ đầu vào `Hiệu lực`. Có ít nhất 1 phòng. Có QL phụ trách chính. Có TK nhận mặc định. T/S/G và L1–L3 đã xác nhận | `Chuyển Đang khai thác` | **ASSUMED 1.9**, chờ xác nhận |
| Phòng nhận HĐ khách | Tòa `Chuẩn bị` hoặc `Đang khai thác`. Phòng `Sẵn sàng`. Có giá niêm yết và giá QL | `Tạo HĐ` ở UI-05 | State UI-04, BR-2.04.3 |

**Đối tượng và trạng thái trong chuỗi**

| Đối tượng | Entity | Trạng thái | Tạo ở | Nguồn dữ liệu |
|---|---|---|---|---|
| Chủ nhà | `LANDLORD` | `Hoạt động → Ngừng hoạt động` | Commit trích xuất hoặc `+ Chủ nhà` | HĐ, phần mở đầu (Bên A) |
| HĐ đầu vào | `HEAD_LEASE`, `HEAD_LEASE_PAYMENT_SCHEDULE` | `Nháp → Hiệu lực → Sắp hết → Kết thúc` | Commit trích xuất | HĐ, Điều 1–12 |
| Tòa | `BUILDING`, `BUILDING_TYPE_HISTORY`, `METER` (MAIN/COMMON) | `Chuẩn bị → Đang khai thác → Ngừng khai thác` | Commit (ứng viên) hoặc tạo tay | Điều 1, 3, Phụ lục I |
| Phòng | `ROOM`, `ROOM_STATUS_HISTORY` | `Sẵn sàng → Giữ chỗ → Đang thuê → …` | UI-05 | Sinh theo tầng, tạo tay, import |
| Tài liệu | `DOCUMENT` | `Chờ xác minh → Đã xác minh` | Commit hoặc upload | File HĐ, phụ lục, giấy tờ |
| Tài sản bàn giao | `ASSET` với `ownership = Chủ nhà` | `Chờ xác nhận → Đã bàn giao → Đã trả lại` | Commit trích xuất | Phụ lục I |

**Nguyên tắc dữ liệu áp cho cả chuỗi**

1. Trường **để trống trên HĐ thì giữ trống**, không suy diễn. Mọi giá trị người dùng tự điền đều ghi audit (người, lúc, nguồn).
2. **Không tạo phòng từ HĐ chủ nhà.** Phòng chỉ sinh ở UI-05.
3. Quan hệ chủ nhà ↔ tòa **suy ra từ HĐ đầu vào** (BR-2.01.4). Màn tòa không có ô chọn chủ nhà.
4. Mã tòa do người review đặt, bất biến sau khi lưu. Mã phòng = số phòng + mã tòa, lưu thành 2 trường riêng.
5. CCCD, SĐT, STK che theo quyền. Cổ đông không truy cập chuỗi màn này.
6. **Cổ đông góp vốn: làm sau.** Các điểm chờ module Cổ đông, trên màn chỉ hiện nhãn `Làm sau`:
   - UI-03 ⑨ phần cổ đông.
   - Phụ lục góp vốn 3 bên (Điều 7.2).
   - Cờ "là vốn góp ban đầu" ở UI-27.
   - Nghĩa vụ góp ở UI-28 và UI-29.

### UI-02 — Chủ nhà

**Mục đích:** quản lý bên cho thuê (Bên A) và là điểm vào của chuỗi Nguồn nhà. **Route:** `#/landlords` (danh sách), `#/landlords/:id` (chi tiết). **Mockup:** [`UI-02-landlord-list-verified.png`](ui-imagegen-v1/02-nguon-nha-toa-phong/UI-02-landlord-list-verified.png), [`UI-02-landlord-detail-verified.png`](ui-imagegen-v1/02-nguon-nha-toa-phong/UI-02-landlord-detail-verified.png).

**Phác họa 2.1 — Danh sách chủ nhà**

```text
┌ Chủ nhà · 7 ─────────────────────────────────── [+ Chủ nhà] [Tạo từ HĐ chủ nhà] ┐
│ ① Chủ nhà 7 │ HĐ đầu vào hiệu lực 0 │ Thiếu HĐ đầu vào 6 │ Job trích xuất 1     │
│ ② Loại ▾ │ Trạng thái ▾ │ Khu vực ▾ │ Tòa ▾ │ HĐ sắp hết ≤ 6 th ▾ │ Tìm… [Xuất] │
│ ③ △ 6 chủ nhà chưa có HĐ đầu vào — upload HĐ để trích xuất đủ thông tin         │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ④ Mã     │Chủ nhà          │SĐT   │CCCD  │Tòa         │Phòng│HĐ đầu vào  │TT    │
│ LL-0007  │Phí Văn Thắng    │…338  │…351  │25A Phú Diễn│  —  │HL-0031 Nháp│ⓘ Nháp│
│ LL-0001  │Tống Văn Định    │  —   │  —   │T2          │  —  │  —         │△     │
│ LL-0002  │Nguyễn Văn Khiết │  —   │  —   │T3          │ 22  │  —         │△     │
│ …        │T5 · T7 · T8 · T10 (Seed §17.5)                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Phác họa 2.2 — Chi tiết chủ nhà**

```text
┌ LL-0007 · Phí Văn Thắng ● Hoạt động ───────────────── [⋯] [Sửa] [Mở HĐ đầu vào] ┐
│ Cá nhân · 1 tòa · HĐ đầu vào HL-0031 đang Nháp · tạo từ trích xuất HĐ           │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ① Tổng quan │ HĐ đầu vào (1) │ Tòa nhà (1) │ Thanh toán │ Tài liệu (3) │ Lịch sử│
│ △ Thiếu TK nhận tiền — HĐ không có (Đ.4.4)              [Bổ sung TK]            │
├───────────────────────────────────┬─────────────────────────────────────────────┤
│ ② BÊN A                           │ ③ LIÊN HỆ · ④ THANH TOÁN                    │
│ Mã LL-0007 · Loại Cá nhân         │ SĐT •••••••338 · Email —                    │
│ CCCD •••••••••351                 │ HKTT Tổ 18 Phú Diễn, Hà Nội                 │
│ Cấp 19/04/2021 · Hà Nội           │ Ngân hàng · STK · Chủ TK △ chưa có          │
│ Đại diện/ủy quyền: không có       │ Kỳ trả 3 tháng/lần [Lịch sử STK ▸]          │
├───────────────────────────────────┴─────────────────────────────────────────────┤
│ ⑤ NHÀ CHO THUÊ — suy ra từ HĐ đầu vào                [Thêm tòa từ HĐ]           │
│  PD25A △ví dụ │ Số 25A Ngõ 261 Phú Diễn │ HL-0031 Nháp │ 114.000.000 │ 0 phòng  │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ⑥ HỒ SƠ CHỦ NHÀ                                        [Tải tài liệu]           │
│  CCCD △ chờ bản chụp │ HĐ đã ký ◐ chờ xác minh │ PL bàn giao ◐ chờ              │
│  ⓘ GCN/PCCC/HKD là hồ sơ của TÒA → UI-04 · PL góp vốn 3 bên: làm sau            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| 2.1 ① | KPI | Đếm theo phạm vi quyền. `Thiếu HĐ đầu vào` là chủ nhà chưa có HĐ nào; click để lọc danh sách |
| 2.1 ② | Bộ lọc | Loại Cá nhân/Tổ chức, trạng thái, khu vực, tòa, nhóm T/S/G (qua tòa), có HĐ hiệu lực, HĐ sắp hết ≤ 6 tháng (P-23), từ khóa tên/SĐT/CCCD/MST. Phản ánh lên URL |
| 2.1 ③ | Băng cảnh báo | Hiện khi có chủ nhà thiếu HĐ đầu vào hoặc job trích xuất chưa commit |
| 2.1 ④ | Bảng | Cột: Mã, Chủ nhà · loại, SĐT, CCCD/MST (che), Tòa, Số phòng, HĐ đầu vào, Kỳ trả gần nhất, Trạng thái, Cập nhật, action. Dòng tạo từ trích xuất có chip `Nháp · từ trích xuất` |
| Header 2.1 | CTA | **Chính:** `Tạo từ HĐ chủ nhà`, mở UI-03 trích xuất. **Phụ:** `+ Chủ nhà`, mở wizard nhập tay |
| 2.2 ① | Tabs | 6 tab cố định. Tab `HĐ đầu vào` và `Tòa nhà` là **dữ liệu suy ra** từ M-2.02, không nhập tay tại đây |
| 2.2 ② | Bên A | Đổi `Loại` Cá nhân/Tổ chức thì đổi bộ trường bắt buộc (CCCD ↔ MST + người đại diện) |
| 2.2 ③④ | Liên hệ, thanh toán | SĐT bắt buộc, chuẩn hóa. Đổi STK sau khi đã có kỳ thanh toán thì tạo bản ghi mới có ngày hiệu lực, **không sửa đè**. Thiếu STK hiện băng cảnh báo vì chặn kích hoạt HĐ |
| 2.2 ⑤ | Nhà cho thuê | Liệt kê tòa qua HĐ đầu vào. `Thêm tòa từ HĐ` mở UI-03 trích xuất, **không gán tòa trực tiếp** |
| 2.2 ⑥ | Hồ sơ | Chỉ giữ giấy tờ **của con người**: CCCD, ủy quyền, HĐ đã ký, phụ lục bàn giao. GCN, PCCC, HKD hiển thị dạng link sang UI-04 |
| `⋯` | Menu phụ | `Ngừng hoạt động` bị **disable kèm tooltip** khi còn HĐ đầu vào hiệu lực (BR-2.01.6) |

**Module nguồn:** M-2.01 · **Entity:** `LANDLORD`, `DOCUMENT` · **Quyền:**

- Admin, Kế toán: toàn quyền.
- TPVH, Trưởng khu vực: xem toàn bộ.
- NVVH: chỉ xem chủ nhà của tòa được phân công (R-33/R-34).
- Cổ đông: không truy cập.

**Field**

| Nhóm | Field | Nguồn khi tạo từ HĐ |
|---|---|---|
| Nhận diện Bên A | Mã tự sinh `LL-xxxx`, loại cá nhân/tổ chức, họ tên/tên pháp nhân, CCCD/MST, ngày/nơi cấp, người đại diện/ủy quyền | Phần mở đầu HĐ |
| Liên hệ | SĐT (bắt buộc), email, địa chỉ thường trú/trụ sở, địa chỉ liên hệ | Mở đầu: SĐT, HKTT |
| Thanh toán | Ngân hàng, số TK, chủ TK, hiệu lực từ; lịch sử STK; kỳ trả mặc định | **Mẫu không có STK** → nhập tay |
| Hồ sơ | CCCD, giấy ủy quyền, HĐ đã ký, phụ lục bàn giao | File HĐ |
| Liên kết (suy ra) | Tòa, HĐ đầu vào, lịch đóng tiền | Commit trích xuất |
| Quản trị | Trạng thái, ghi chú, nguồn tạo (job trích xuất hoặc tay), created/updated, audit | Hệ thống |

**Hai cách tạo chủ nhà**

1. **Tạo từ HĐ chủ nhà (chính).** Đi theo UI-03 trích xuất. Tạo cùng lúc chủ nhà, HĐ Nháp, tòa ứng viên, tài liệu, tài sản bàn giao và công tơ.
2. **Nhập tay (phụ).** Wizard 4 bước:
   1. Bên A và người đại diện.
   2. Nhà đất/tòa, GCN và tài sản bàn giao.
   3. HĐ đầu vào: Bên B, thời hạn, giá, cọc, kỳ trả.
   4. Đính kèm file, rồi xem trước liên kết Chủ nhà → HĐ → Tòa → Phòng.

   Có thể tạo chủ nhà trước, bổ sung HĐ và tòa sau. **Không** dùng OCR hợp đồng khách (UI-08) để tạo chủ nhà.

**Action theo trạng thái**

| Trạng thái | Action |
|---|---|
| `Hoạt động` | Sửa, bổ sung STK, tải tài liệu, thêm tòa từ HĐ, mở HĐ đầu vào, xem lịch thanh toán, xuất |
| `Hoạt động` và còn HĐ hiệu lực | `Ngừng hoạt động` bị disable kèm lý do |
| `Ngừng hoạt động` | Chỉ xem; Admin mở lại có lý do |

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Không xóa cứng chủ nhà đã có HĐ/tòa; chỉ `Ngừng hoạt động` | BR-2.01.1 | Đã chốt |
| Trùng CCCD/MST hoặc SĐT → cảnh báo, cho tiếp tục kèm lý do; modal đề xuất `Dùng bản ghi có sẵn` / `Vẫn tạo` | BR-2.01.2 | Đã chốt |
| Đổi STK sau khi đã có kỳ thanh toán → tạo bản ghi STK mới có ngày hiệu lực, giữ STK cũ trong lịch sử (UI không cho sửa đè) | BR-2.01.3 | Đã chốt |
| Quan hệ chủ nhà ↔ tòa **suy ra từ HĐ đầu vào**, không có field nhập tay ở màn tòa | BR-2.01.4 | Cần chốt |
| Hồ sơ PCCC/sổ đỏ gắn **tòa**, không gắn chủ nhà; UI-02 chỉ hiển thị link sang UI-04 | BR-2.01.5 | Cần chốt |
| Chặn `Ngừng hoạt động` khi còn HĐ đầu vào hiệu lực | BR-2.01.6 | Cần chốt |

**Nghiệm thu màn hình**

1. Danh sách hiện 7 chủ nhà theo Seed §17.5. Dòng Phí Văn Thắng có chip `Nháp · từ trích xuất`. 6 chủ nhà thiếu HĐ hiện `—` ở các trường chưa khai báo, không có số bịa.
2. CCCD và SĐT hiển thị dạng che, giữ 3 số cuối.
3. Chi tiết Phí Văn Thắng có đủ ngày cấp 19/04/2021 và nơi cấp Hà Nội. Băng cảnh báo thiếu STK hiện ở đầu trang.
4. Tạo chủ nhà trùng CCCD thì modal `Dùng bản ghi có sẵn / Vẫn tạo` xuất hiện.
5. Đổi STK thì bản ghi cũ vẫn còn trong lịch sử.
6. `Ngừng hoạt động` bị chặn khi còn HĐ hiệu lực.

### UI-03 — Hợp đồng đầu vào

**Mục đích:** ghi nhận HĐ thuê nguyên tòa. Màn này là căn cứ tạo tòa, sinh lịch đóng tiền cho chủ nhà và phân bổ tiền thuê.

**Route:**

- `#/landlords/import`: trích xuất, route đề xuất.
- `#/landlords/:id?tab=head-leases`: danh sách HĐ trong tab của chủ nhà. Có thêm màn tổng hợp lịch trả theo kỳ đến hạn, xem ở UI-28.
- `#/head-leases/:id`: chi tiết HĐ, route đề xuất.

**Mockup:** [`UI-03-head-lease-extract-verified.png`](ui-imagegen-v1/02-nguon-nha-toa-phong/UI-03-head-lease-extract-verified.png), [`UI-03-head-lease-verified.png`](ui-imagegen-v1/02-nguon-nha-toa-phong/UI-03-head-lease-verified.png).

**Phác họa 3.1 — Trích xuất HĐ chủ nhà** (job riêng, **tách khỏi OCR hợp đồng khách UI-08**)

```text
┌ Trích xuất HĐ chủ nhà ● Đang review ───── [Validate] [🔒 Commit · còn 3 xung đột] ┐
│ ● Upload ━ ● Trích xuất ━ ③ Review ─ ④ Validate ─ ⑤ Commit                       │
├──────────────┬─────────────────────────────────────┬─────────────────────────────┤
│ ① TỆP & TRANG│ ② NHÓM TRƯỜNG THEO ĐIỀU             │ ③ TỔNG HỢP                  │
│ [◂ 3/9 ▸]    │ Trường │ Nguyên văn HĐ │ Chuẩn hóa  │ Đọc được 17 · Cảnh báo 8    │
│ ┌──────────┐ │ ▾ Bên A — chủ nhà · Mở đầu → Create │ Xung đột chặn 3 · PL 13     │
│ │ Đ.4.1    │ │ ✓ Họ tên  PHÍ VĂN THẮNG  Phí Văn…  │ ④ XUNG ĐỘT CHỌN TRƯỚC        │
│ │▓114.000.▓│ │ △ TK nhận  —         Mẫu không có  │ ✕1 Ngày thuê để trống        │
│ │ Đ.5.1    │ │ ▾ Bên B · Mở đầu → Xác nhận         │   [Nhập ngày][Lưu nháp]     │
│ │▓/tháng ▓ │ │ ✕ Họ tên  NGUYỄN ĐÌNH CHUNG  cá nhân│ ✕2 Cọc ghi "/tháng"         │
│ └──────────┘ │ ▾ Nhà đất Đ.1 · Thời hạn Đ.2 · Mục  │   [114.000.000 · một lần]   │
│ Raw ·        │   đích Đ.3 · Tiền Đ.4 · Cọc Đ.5 ·   │ ✕3 Bên B là cá nhân         │
│ Chuẩn hóa ·  │   Nghĩa vụ Đ.6/7/10 · PL bàn giao · │   [Ký thay Timehouse]       │
│ Trang/vùng   │   PL góp vốn 3 bên (Làm sau)        │ ⑤ CẢNH BÁO · KẾT QUẢ COMMIT │
└──────────────┴─────────────────────────────────────┴─────────────────────────────┘
```

**Phác họa 3.2 — Chi tiết HĐ đầu vào** (sau commit, trạng thái Nháp)

```text
┌ HĐ đầu vào HL-0031 ● Nháp ──────────────── [Gia hạn ⨯] [Bổ sung & kích hoạt] ┐
│ Phí Văn Thắng → 25A Phú Diễn · 60 tháng · 114.000.000 đ/tháng · kỳ 3 th/lần  │
│ ① Tổng quan │ Lịch đóng tiền │ Tòa/Phân bổ │ Pháp lý │ Điều khoản │ Lịch sử  │
│ ✕ Chưa kích hoạt được: thiếu ngày (Đ.2) · thiếu STK chủ nhà · Bên B cá nhân  │
├─────────────────────────┬─────────────────────────┬──────────────────────────┤
│ ② CÁC BÊN               │ ③ ĐỐI TƯỢNG · Đ.1, Đ.3  │ ④ THỜI GIAN · Đ.2        │
│ A Phí Văn Thắng ▸       │ Số 25A Ngõ 261 Phú Diễn │ Ngày ký        △ trống   │
│ B Nguyễn Đình Chung     │ GCN          △ trống    │ Giao nhà       △ trống   │
│   △ cá nhân             │ Số tầng/DT   △ trống    │ Tính tiền = ngày bắt đầu │
│ Ký thay △ chờ ủy quyền  │ Gạch–bê tông · toàn bộ  │ Từ → đến       △ trống   │
│                         │ Kinh doanh cho thuê     │ 60 tháng · báo trước 3 th│
├─────────────────────────┼─────────────────────────┼──────────────────────────┤
│ ⑤ GIÁ · Đ.4             │ ⑥ CỌC · Đ.5             │ ⑦ THANH TOÁN · Đ.4.4     │
│ 114.000.000 đ/tháng     │ 114.000.000 · một lần   │ 3 tháng/lần              │
│ Giữ giá/tăng giá: không │ Nguyên văn "đồng/tháng" │ Hạn ngày 01–10 tháng đầu │
│ Gia hạn: theo thị trường│ ⓘ theo dõi riêng, KHÔNG │ CK hoặc tiền mặt         │
│ Thuế nhà đất: bên A     │   ghi chi phí           │ STK △ hồ sơ chủ nhà chưa │
├─────────────────────────┴─────────────────────────┴──────────────────────────┤
│ ⑧ LỊCH ĐÓNG TIỀN  🔒 Chưa sinh được — cần ngày bắt đầu (Đ.2.2)                │
│    Khi có ngày: 60 ÷ 3 = 20 kỳ × 342.000.000 · hạn 01–10    [Nhập ngày BĐ]   │
├──────────────────────────────────────────────┬───────────────────────────────┤
│ ĐIỀU KHOẢN RỦI RO (nguyên văn)               │ ⑨ PHẦN CỔ ĐÔNG  ○ Làm sau     │
│ 6.2·10.2 chậm 1 tháng → A lấy nhà  ✕ cao     │ Bật khi có module UI-29.      │
│ 6.1 phạt A 3 tháng thuê   △ lệch 10.4        │ Đ.7.2 Phụ lục góp vốn 3 bên   │
│ 10.4 phạt A 3 lần cọc     △ lệch 6.1         │ → loại tài liệu riêng         │
│ PL II ≠ 7.1 hao mòn       △ lệch             │ ● Commit ● Nháp ○ Kích hoạt   │
└──────────────────────────────────────────────┴───────────────────────────────┘
 ⑩ Tab Tòa/Phân bổ: HL-0031 → 25A Phú Diễn 100 %. HĐ gắn n tòa thì bắt buộc tổng = 100 %
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| 3.1 ① | Tệp & trang | Giữ file gốc và vị trí trang/vùng làm bằng chứng. Chọn một trường ở ② thì vùng tương ứng trên file được tô sáng: xanh là đọc được, đỏ là xung đột |
| 3.1 ② | Nhóm trường theo Điều | Mỗi dòng có: nguyên văn, chuẩn hóa/đích, dấu ✓ △ ✕. Mỗi nhóm có quyết định `Create / Link / Ignore`. Dò trùng chủ nhà theo CCCD → SĐT → tên |
| 3.1 ③ | Tổng hợp | Bộ đếm: đọc được / cảnh báo / xung đột chặn / số tài sản phụ lục |
| 3.1 ④ | Xung đột chặn | Mỗi xung đột là **lựa chọn bắt buộc** có nút; hệ thống không tự chọn. Nút `Commit` disable kèm tooltip liệt kê xung đột còn lại |
| 3.1 ⑤ | Cảnh báo, kết quả commit | Cảnh báo không chặn: chậm trả → lấy nhà (đỏ), hai mức phạt lệch, hao mòn lệch, trường trống. Liệt kê entity sẽ tạo: 1 chủ nhà, 1 HĐ Nháp, 1 tòa, 3 tài liệu, 11 tài sản, 2 công tơ, **0 phòng** |
| 3.2 header | Alert kích hoạt | Liệt kê **mọi** điều kiện kích hoạt còn thiếu (xem bảng điều kiện của chuỗi) |
| 3.2 ② | Các bên | Bên A đọc từ UI-02. Bên B là đơn vị Timehouse và người ký có ủy quyền. Mẫu ghi Bên B là cá nhân thì phải xác nhận người ký thay |
| 3.2 ③④ | Đối tượng, thời gian | Trường trống trên HĐ hiện `△ trống`, không điền mặc định. `Ngày giao nhà` và `Ngày bắt đầu tính tiền` là 2 trường. Mẫu gộp thì tính tiền = ngày bắt đầu |
| 3.2 ⑤ | Giá | `Giữ giá` = số tháng chủ nhà không được tăng giá. Lịch tăng giá có ngày hiệu lực; kỳ **chưa trả** sau ngày đó tự tính lại (BR-2.02.13). Mẫu không có thì ghi "không có trên HĐ" |
| 3.2 ⑥ | Cọc chủ nhà | Băng ghi chú cố định: khoản theo dõi, **không ghi chi phí**. Đây là cơ sở trình bày Vốn ở bảng cổ phần (làm sau) |
| 3.2 ⑦ | Thanh toán | Kỳ trả 3/4/6 tháng cộng khoảng ngày đến hạn là đầu vào sinh lịch ở ⑧ |
| 3.2 ⑧ | Lịch đóng tiền | Chưa có ngày bắt đầu thì hiện trạng thái khóa kèm công thức dự kiến. Kích hoạt xong thì sinh tự động. Kế toán sửa từng kỳ có lý do, **không sửa kỳ đã trả** |
| 3.2 rủi ro | Điều khoản | Lưu nguyên văn, gắn mức (rủi ro cao / lệch / lưu), **không** biến thành rule chung |
| 3.2 ⑨ | Phần cổ đông | **Làm sau.** Khi có module: số phải góp = % hiệu lực **tại ngày đến hạn** × số tiền kỳ |
| ⑩ | Phân bổ nhiều tòa | Tổng phải bằng 100 %; **chặn kích hoạt** nếu tổng phân bổ ≠ tiền thuê (BR-2.02.2 → P-15) |
| Nhắc hạn | Thông báo | Nhắc trước 15/7/1 ngày cho kế toán và admin; quá hạn cảnh báo đỏ trên UI-01 |

**Các bước trích xuất HĐ chủ nhà**

| Bước | Nội dung |
|---|---|
| Upload | File `.doc/.docx/.pdf`/ảnh; lưu hash — upload trùng hash mở lại job cũ |
| Trích xuất | Đọc lớp chữ (hoặc OCR nếu là scan) → đề xuất trường theo Điều 1–12 và Phụ lục I–II; giữ trang/vùng làm bằng chứng |
| Review | Bố cục 3 vùng như phác họa 3.1; quyết định theo nhóm; dò trùng chủ nhà |
| Validate | Xung đột **chặn commit** phải được chọn hướng xử lý; cảnh báo không chặn được ghi nhận để bổ sung sau |
| Commit | Một transaction: 1 chủ nhà, 1 HĐ đầu vào **Nháp**, 1 tòa **Chuẩn bị**, tài liệu (HĐ đã ký, phụ lục bàn giao, CCCD), tài sản bàn giao của chủ nhà (UI-27) và công tơ cấp tòa (UI-04). **Không tạo phòng** |

**Xung đột chặn commit với mẫu tùng sói:**

1. Ngày giao nhà và "từ … đến …" để trống, nên chưa sinh được lịch trả.
2. Cọc ghi "114.000.000 đồng/tháng", trong khi cọc là khoản một lần.
3. Bên B ký là **cá nhân**, cần xác nhận người ký thay Timehouse hoặc giấy ủy quyền.

**Field**

| Nhóm | Field/Quy tắc |
|---|---|
| Nhận diện | Số HĐ, chủ nhà, 1..n tòa, trạng thái, HĐ trước/sau, job trích xuất nguồn |
| Các bên | Bên A chủ nhà/người đại diện, Bên B đơn vị thuê/người ký, thông tin định danh/liên hệ và giấy ủy quyền nếu có |
| Đối tượng thuê | Địa chỉ nhà đất, quyền sở hữu/quyền cho thuê, số giấy chứng nhận/cơ quan cấp/ngày cấp, số tầng/diện tích sàn/kết cấu, mục đích kinh doanh cho thuê, tài sản theo phụ lục |
| Thời gian | Ngày ký (mốc hiệu lực, Đ.12.1), ngày giao nhà, ngày bắt đầu tính tiền, bắt đầu/kết thúc, thời hạn tháng, thời điểm thông báo/ưu tiên gia hạn; cảnh báo sắp hết mặc định 6 tháng |
| Giá | Tiền thuê/tháng, giữ giá, lịch tăng giá (% hoặc tiền, effective date), tháng miễn, giảm giá |
| Cọc | Số cọc, ngày/hình thức trả, điều kiện hoàn/khấu trừ, dự kiến hoàn, chứng từ; không ghi chi phí |
| Thanh toán | Chu kỳ và khoảng ngày đến hạn theo HĐ (mẫu: 3 tháng/lần, ngày 01–10 tháng đầu kỳ), chuyển khoản/tiền mặt, tài khoản nhận, lịch sinh tự động |
| Nghĩa vụ và điều khoản | Bên chịu thuế/phí, PCCC, đăng ký kinh doanh, sửa chữa/nâng cấp, bàn giao, gia hạn, chấm dứt trước hạn/bồi thường; lưu text/ảnh nguồn và các mốc cần theo dõi, không biến điều khoản mẫu thành rule chung |
| Phân bổ nhiều tòa | Mặc định theo số phòng; override tỷ lệ/số tiền theo phụ lục, tổng 100%, có ngày hiệu lực |
| Phân loại | T/S/G và L1/L2/L3 đề xuất, ngày hiệu lực, người xác nhận |
| Pháp lý & chứng từ | Giấy chứng nhận nhà đất, hồ sơ PCCC + hạn, giấy đăng ký HKD, file HĐ đã ký, phụ lục, biên bản kiểm kê/bàn giao tài sản, ủy quyền, **phụ lục góp vốn 3 bên (làm sau)** và minh chứng khác; gắn loại, tòa, người tải, phiên bản, trạng thái xác minh |
| Nguồn | Nhân viên nguồn, ngày tìm, ghi chú |

**Bản đồ trường theo từng Điều của hợp đồng chủ nhà** — lập từ mẫu thật `Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc`; là đích của job trích xuất. Cột Điều là neo để reviewer mở đúng trang trên file gốc.

| Điều | Trường trên hợp đồng | Đích trong hệ thống |
|---|---|---|
| Mở đầu | Ngày ký · địa chỉ ký · Bên A (họ tên, CCCD, cấp ngày, nơi cấp, ĐT, HKTT) · Bên B (tương tự) | `LANDLORD` (UI-02) + Bên B là đơn vị Timehouse/người ký. **Mẫu thật ghi Bên B là cá nhân** (không có tên pháp nhân, chức vụ) → xung đột chặn commit |
| 1 | Địa chỉ nhà đất · số Giấy chứng nhận · cơ quan cấp · ngày cấp · số tầng · diện tích mặt sàn · kết cấu · **dẫn chiếu biên bản kiểm kê tài sản kèm theo** | Nhóm `Đối tượng thuê` + hồ sơ tòa (UI-04) |
| 2.1 | Thời điểm giao nhà | `Ngày giao nhà` |
| 2.2 | Thời hạn (05 năm = 60 tháng) · từ ngày · đến ngày · **gộp ngày bắt đầu tính tiền** | `Thời hạn`, `Từ–Đến`; là mẫu số khấu hao cải tạo ở UI-27. Mẫu không có trường ngày tính tiền riêng → mặc định = ngày bắt đầu |
| 2.3 | **Báo trước 03 tháng** để thương lượng gia hạn · quyền ưu tiên thuê tiếp · giá sẽ thay đổi | `Điều khoản gia hạn`; đối chiếu với ngưỡng cảnh báo mặc định 6 tháng (P-23) |
| 3 | Mục đích thuê: **kinh doanh cho thuê** | Căn cứ yêu cầu đăng ký hộ kinh doanh |
| 4.1 | Tiền thuê/tháng · **bên A chịu thuế nhà đất và thuế TNCN** · **bên B trả phí dịch vụ cho NCC** | Tiền thuê/tháng; nhóm `Nghĩa vụ và điều khoản` — quyết định khoản nào là chi phí của Timehouse |
| 4.2 | Hết hạn/gia hạn thì giá điều chỉnh theo thị trường | Ghi chú cạnh `Lịch tăng giá` (trống) |
| 4.3 | Bên A bảo đảm bên B không phải trả thêm khoản nào ngoài tiền thuê | Điều khoản chi phí |
| 4.4 | **Kỳ trả 03 tháng/lần** · **khoảng ngày đến hạn 01–10 của tháng đầu kỳ** · hình thức CK hoặc tiền mặt | Sinh lịch đóng tiền chủ nhà |
| 5.1 | Cọc chủ nhà (= 1 tháng tiền thuê, mẫu ghi "đồng/tháng") · trả bằng tiền mặt ngay sau khi ký | `Cọc`, theo dõi riêng, **không ghi chi phí** |
| 5.2 · 5.3 | **04 trường hợp được hoàn cọc** · bên A không được tự ý khấu trừ/tịch thu cọc | Điều khoản hoàn cọc |
| 6.1 | **Bên A trang bị hệ thống PCCC và hồ sơ PCCC** · **bên A thực hiện đăng ký kinh doanh và nộp thuế** · cho phép bên B cải tạo (không đụng kết cấu, cần chấp thuận bằng văn bản) · bồi thường 03 tháng tiền thuê nếu bên A hủy HĐ | Gán **trách nhiệm** cho trạng thái PCCC và HKD ở UI-04; điều khoản cải tạo là căn cứ ghi nhận đầu tư ban đầu ở UI-27 |
| 6.2 · 10.2 | **Chậm thanh toán 01 tháng → bên A có quyền lấy nhà** · bên B đem nhà thế chấp → bên A được chấm dứt, bồi thường ≥ 03 tháng tiền thuê | Rủi ro vận hành cao nhất → cảnh báo đỏ trên lịch đóng tiền và trên UI-01 |
| 7.2 | Bên B được chấm dứt **không bị phạt** khi thiên tai, dịch bệnh, chiến tranh · **đổi nhân sự quản lý hoặc người góp vốn → ký lại HĐ hoặc thêm Phụ lục 3 bên người góp vốn** | Điều khoản chấm dứt · phụ lục góp vốn lưu thành loại tài liệu riêng, liên kết UI-29 (**làm sau**) |
| 10.4 | Bồi thường chấm dứt sớm: **gấp 03 lần tiền cọc** cho cả hai chiều | Điều khoản chấm dứt |
| 12.1 · 12.2 | Hiệu lực từ ngày ký · số trang · số bản | `Ngày ký` là mốc hiệu lực · metadata |
| Phụ lục I–II | **Biên bản bàn giao tài sản**: STT · tên tài sản · số lượng · tình trạng (điều hòa, bình nóng lạnh, thiết bị vệ sinh, cửa, bóng điện, **công tơ điện**, **đồng hồ nước**, hệ thống báo cháy…) · cam kết trả lại tài sản | Tài sản bàn giao của chủ nhà (UI-27); công tơ điện/nước là căn cứ tạo `METER` cấp tòa ở UI-04 |

**Mâu thuẫn nội tại của mẫu — hiển thị cảnh báo, không tự chọn:**

- (a) Phạt bên A khi chấm dứt: **03 tháng tiền thuê** (6.1) ≠ **03 lần tiền cọc** (10.4).
- (b) Trả tài sản: Phụ lục II "**không tính hao mòn**" ≠ Điều 7.1 "**trừ hao mòn theo thời gian**".
- (c) Điều 5.1 ghi cọc "đồng/**tháng**".

Mẫu cũng **không có** tài khoản ngân hàng của chủ nhà, người đại diện/ủy quyền và ngày sinh các bên. Các trường này bổ sung ở UI-02 trước khi kích hoạt.

**Trường hệ thống có nhưng mẫu `.doc` không có.** UI phải để trống và **không suy diễn**:

- `Thời gian giữ giá`, `Lịch tăng giá`, `Tháng miễn tiền nhà`.
- `Phân bổ tiền thuê cho nhiều tòa`.
- `Nhóm T/S/G`, `Hạng L1–L3`.
- `Phí môi giới`.

Đây là tham số vận hành của Timehouse, được thỏa thuận ngoài văn bản mẫu hoặc ghi ở phụ lục riêng. Người nhập tự điền và hệ thống ghi audit.

**Action theo trạng thái**

| Trạng thái | Action |
|---|---|
| `Nháp` | Sửa, bổ sung trường trống, tải chứng từ, `Bổ sung & kích hoạt` (disable khi còn thiếu điều kiện). `Gia hạn` disable |
| `Hiệu lực` | Ghi nhận trả, điều chỉnh lịch có lý do, tải chứng từ, gia hạn bằng HĐ mới, thanh lý sớm |
| `Sắp hết` | Như `Hiệu lực`, kèm cảnh báo mặc định 6 tháng (P-23) |
| `Kết thúc` | Chỉ xem |

Nhắc mặc định **ASSUMED** 15/7/1 ngày, cho phép override từng HĐ.

**State:**

- HĐ: `Nháp → Hiệu lực → Sắp hết → Kết thúc`, có nhánh `Hiệu lực/Sắp hết → Thanh lý sớm → Kết thúc`.
- Kỳ trả: `Chưa đến hạn → Sắp đến hạn (≤15 ngày) → Đã trả/Trả một phần/Quá hạn`.

**Cách UI dựng lịch đóng tiền** (mỗi dòng = 1 kỳ trả, entity `HEAD_LEASE_PAYMENT_SCHEDULE`)

| Cột hiển thị | Cách tính |
|---|---|
| Kỳ số · Từ tháng – Đến tháng | Chia theo kỳ trả 3/4/6 tháng kể từ ngày bắt đầu |
| Ngày đến hạn | Ngày cuối của khoảng đến hạn trong tháng đầu kỳ (mẫu: ngày 10) |
| Số tiền phải trả | Tiền thuê/tháng × số tháng trong kỳ − **tháng miễn nằm trong kỳ** |
| Đã trả · Còn lại · Chứng từ | Ghi từ phiếu chi ở UI-28 |
| Phần từng cổ đông | **Làm sau** — số tiền kỳ × % cổ phần **hiệu lực tại ngày đến hạn**; % đổi sau đó không tính lại kỳ đã đóng |

Ví dụ kiểm thử:

- **Mẫu tùng sói.** 114.000.000 đ/tháng, 60 tháng, trả 3 tháng/lần, không có tháng miễn. Kết quả: 20 kỳ, mỗi kỳ 342.000.000 đ, hạn ngày 10 tháng đầu kỳ. Lịch chỉ sinh sau khi có ngày bắt đầu.
- **Rule tháng miễn (minh họa).** Cùng HĐ nhưng miễn 1 tháng đầu. Kỳ 1 = 228.000.000 đ, kỳ 2 = 342.000.000 đ.

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Một tòa tại một thời điểm chỉ thuộc **một** HĐ đầu vào hiệu lực; HĐ mới phải bắt đầu sau ngày kết thúc HĐ cũ | BR-2.02.1 | Cần chốt |
| HĐ nhiều tòa: bắt buộc phân bổ tiền thuê về từng tòa, tổng = 100%, có ngày hiệu lực; **chặn kích hoạt** khi tổng ≠ tiền thuê | BR-2.02.2 → **P-15** | Cần chốt |
| Lịch đóng tiền sinh tự động; kế toán sửa từng kỳ có lý do; **không sửa kỳ đã trả** | BR-2.02.3 | Cần chốt |
| Tháng miễn: màn này chỉ lưu dữ liệu; CF ghi 0, AC thẳng hàng do UI-28 tính | BR-2.02.4, R-27 | Cần chốt |
| Nhắc hạn trả chủ nhà trước 15/7/1 ngày; quá hạn cảnh báo đỏ trên UI-01 | BR-2.02.5 → **P-23** | Cần chốt |
| Phần đóng cổ đông = tiền kỳ × % tại ngày đến hạn (**hiển thị khi có module Cổ đông**) | BR-2.02.6, R-31 | Đã chốt |
| Nhóm T/S/G do HĐ đề xuất → người dùng xác nhận → ghi `BUILDING_TYPE_HISTORY` có ngày hiệu lực, không ghi đè lịch sử | BR-2.02.7, D-02 | Đã chốt |
| HKD chuyển `Đã đăng ký` chỉ khi có tài liệu đúng loại gắn đúng HĐ/tòa; gỡ file không tự đổi trạng thái | BR-2.02.8 | Đã chốt |
| PCCC = Không → cảnh báo trên hồ sơ tòa, **không chặn** nghiệp vụ | BR-2.02.9 | Cần chốt |
| Cọc chủ nhà theo dõi riêng, không ghi chi phí; là cơ sở trình bày Vốn ở UI-31 bảng cổ phần | BR-2.02.10, D-43 | Có bằng chứng nguồn |
| Kết thúc sớm → tòa `Ngừng khai thác`, mọi phòng phải hết HĐ thuê; khấu hao còn lại xử lý ở UI-27 | BR-2.02.11, R-28 | Cần chốt |
| Gia hạn = HĐ mới liên kết HĐ trước; **không sửa ngày kết thúc HĐ cũ** | BR-2.02.12 | Cần chốt |
| Lịch tăng giá có ngày hiệu lực; kỳ chưa trả sau ngày đó tự tính lại | BR-2.02.13 | Cần chốt |
| Trích xuất HĐ chủ nhà: giá trị trống giữ trống; commit là một transaction; upload trùng hash mở lại job cũ | Spec 1.8 | ASSUMED |

**Nghiệm thu màn hình**

1. Upload mẫu tùng sói thì job hiện 29 trường theo 10 nhóm, 3 xung đột chặn và 8 cảnh báo. Nút `Commit` bị khóa cho tới khi chọn xong 3 xung đột.
2. Sau commit, UI-02 có chủ nhà Phí Văn Thắng. HĐ HL-0031 ở trạng thái Nháp. Tòa 25A Phú Diễn ở trạng thái Chuẩn bị. Có 13 dòng phụ lục ở UI-27 và **0 phòng**.
3. HĐ Nháp không kích hoạt được khi còn thiếu ngày, STK hoặc người ký. Alert liệt kê đủ ba điều kiện.
4. Nhập ngày bắt đầu và kích hoạt thì lịch sinh 20 kỳ × 342.000.000 đ, hạn ngày 10.
5. Các điều khoản 6.1, 6.2, 10.2, 10.4 và PL II hiện nguyên văn kèm mức cảnh báo.
6. ⑨ hiện `Làm sau`.

### UI-04 — Tòa nhà

**Mục đích:** hồ sơ vận hành của một tòa: phân loại, thu tiền, công tơ, hồ sơ pháp lý và chỉ số báo cáo. **Route:** `#/buildings`, `#/buildings/:id`. **Mockup:** [`UI-04-building-verified.png`](ui-imagegen-v1/02-nguon-nha-toa-phong/UI-04-building-verified.png), trạng thái Chuẩn bị.

**Phác họa 4.1 — Tòa mới tạo từ HĐ chủ nhà** (trạng thái Chuẩn bị)

```text
┌ 25A Phú Diễn ○ Chuẩn bị ─────────── [Thêm tài liệu] [Phân công] [Tạo phòng] ┐
│ Thuê toàn bộ căn nhà · chủ nhà Phí Văn Thắng · HĐ HL-0031 · 0 phòng         │
│ ① Tổng quan│Phòng (0)│Phân công│Giá DV│Công tơ (2)│HĐ nguồn│Tài sản (11)│…  │
│ ⓘ Tòa ứng viên từ HĐ: chỉ địa chỉ, kết cấu, mục đích, phạm vi có trên HĐ    │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ ② CƠ BẢN                             │ ③ PHÂN LOẠI · ⑤ THU TIỀN             │
│ Mã tòa [PD25A] △ ví dụ · người đặt   │ Nhóm T/S/G   chọn khi kích hoạt      │
│ Địa chỉ Số 25A Ngõ 261 Phú Diễn [Đ.1]│ Hạng L1–L3   chọn khi kích hoạt      │
│ Số tầng [—] △ trống · DT sàn [—] △   │ QL phụ trách chưa phân công (UI-20)  │
│ Kết cấu Gạch–bê tông · Kinh doanh CT │ TK nhận khách · ngày chốt chỉ số 22  │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ ⑥ CÔNG TƠ TỪ PHỤ LỤC                 │ ⑦ HỒ SƠ PHÁP LÝ      [Tải tài liệu]  │
│ Nhóm 2·STT 6 MAIN điện · mã chờ nhập │ GCN △ chưa có · PCCC △ · HKD △       │
│ Nhóm 2·STT 7 MAIN nước · mã chờ nhập │ HĐ đã ký ✓ có file · ◐ chờ xác minh  │
│ ⓘ MAIN chỉ đối chiếu, KHÔNG lên HĐ   │ PL bàn giao ✓ · PL góp vốn ○ làm sau │
├──────────────────────────────────────┴──────────────────────────────────────┤
│ ⑧ CHỈ SỐ TỪ BÁO CÁO — chưa có kỳ đã khóa                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Phác họa 4.2 — Tòa đang khai thác** (dữ liệu G1, Seed Data §3, §4, §13)

```text
┌ Tòa nhà / G1 ● Đang khai thác ─────────────────── [Sửa] [Thêm tài liệu] [Phân công] ┐
│ Nhóm G · Hạng L2 (minh họa) · 15 phòng · QL: Đỗ Thuỳ Linh                           │
│ ① Tổng quan│Phòng│Phân công│Giá DV│Công tơ│HĐ nguồn│Tài sản│Báo cáo│Tài liệu│Lịch sử│
├─────────────────────────────────────────────────────────────────────────────────────┤
│ ② CƠ BẢN     Mã G1 (bất biến) · Tên ____ · Khu vực ▾ · Số tầng __                   │
│ ③ PHÂN LOẠI  Nhóm [G ▾] ⓘ lịch sử · Hạng [L2 ▾] ⓘ lịch sử                           │
│ ④ TIỆN ÍCH   ☑ Thang máy ☑ Máy giặt chung · tiện ích khác chưa khai báo             │
│              ⓘ Bỏ tick thang máy → dịch vụ thang máy bị chặn ở HĐ                   │
│ ⑤ THU TIỀN   TK nhận mặc định BIDV 2120368058 – NGUYEN THI HANG                     │
│              Mẫu in hóa đơn G1 TECH · Ngày chốt chỉ số [22]                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ ⑥ CÔNG TƠ CẤP TÒA — hai loại, KHÔNG gộp                                             │
│  ┌ MAIN · 000G1 · 3.500 đ/kWh ─────────────────────────────────────────┐            │
│  │ Kỳ 09: 882 kWh × 3.500 = 3.087.000 · chỉ đối chiếu NCC + thất thoát │            │
│  │ KHÔNG lên hóa đơn khách, KHÔNG chia cho phòng                       │            │
│  └─────────────────────────────────────────────────────────────────────┘            │
│  ┌ COMMON · điện khu vực chung · 3.800 đ/kWh ──────────────────────────┐            │
│  │ Tầng 2: 1.935 → 1.967 = 32 kWh ÷ 3 người = 40.533,33 đ/người → dòng 12│          │
│  └─────────────────────────────────────────────────────────────────────┘            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ ⑦ HỒ SƠ PHÁP LÝ (checklist theo loại · trạng thái minh họa)  [Tải tài liệu]         │
│  Giấy CN nhà đất ✓ │ PCCC △ còn hạn … │ HKD ◐ Đã đăng ký (theo tài liệu)            │
│  Biên bản bàn giao ✓ │ Chứng từ thuế ○ chưa có                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ ⑧ CHỈ SỐ TỪ BÁO CÁO — kỳ 08/2026 (đã khóa) ⓘ không tính realtime                    │
│  Doanh thu 84.186.000 │ LN ròng 14.664.969 │ Phòng trống 0 · mới 2 · phá 1          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| Header | Dòng quản lý | **Chỉ đọc**, lấy từ phân công phụ trách chính hiệu lực tại ngày xem. Nút `Phân công` mở UI-20; màn tòa không có ô sửa quản lý |
| Header 4.1 | CTA | Tòa Chuẩn bị: CTA chính `Tạo phòng` (UI-05). Tòa đang khai thác: không có CTA tạo phòng hàng loạt |
| ② | Cơ bản | Mã tòa **bất biến sau khi lưu** (là khóa của mã phòng). Tòa từ HĐ: địa chỉ khóa, gắn nhãn `Đ.1`; số tầng và DT sàn trống thì viền đỏ, gắn nhãn `Trống trên HĐ` |
| ③ | Phân loại | Nhóm T/S/G và hạng L1–L3 là **2 thuộc tính độc lập**, mỗi loại có lịch sử riêng; báo cáo kỳ dùng giá trị hiệu lực ngày cuối kỳ |
| ④ | Tiện ích | Quyết định dịch vụ nào được phép thêm vào HĐ (validate chéo với UI-07/UI-09) |
| ⑤ | Thu tiền | TK nhận có ngày hiệu lực; hóa đơn **snapshot** TK tại ngày phát hành. Đổi ngày chốt chỉ số chỉ áp kỳ chưa chốt |
| ⑥ | Công tơ | Tòa từ HĐ: 2 dòng công tơ lấy từ phụ lục (STT 6, 7), chờ nhập mã và chỉ số bàn giao. Tòa đang khai thác: 2 khung MAIN/COMMON tách biệt kèm câu cảnh báo, vì gộp nhầm là lỗi phổ biến nhất khi dựng hóa đơn |
| ⑦ | Checklist pháp lý | **Trạng thái đăng ký** và **trạng thái xác minh** là 2 cột khác nhau. Mỗi dòng ghi căn cứ trên HĐ (ví dụ: PCCC và HKD là trách nhiệm bên A theo Đ.6.1) |
| ⑧ | Chỉ số từ báo cáo | Đọc `REPORT_SNAPSHOT` kỳ Locked gần nhất, bắt buộc hiện nhãn kỳ. Tòa Chuẩn bị hiện "chưa có kỳ đã khóa" |

**Danh sách:**

- **Filter:** phạm vi, trạng thái khai thác, T/S/G, L1/L2/L3, chủ nhà, quản lý, HKD/PCCC, tỷ lệ lấp đầy.
- **Cột:** mã, tên, khu vực, nhóm/hạng, tổng phòng, đang thuê/trống, quản lý tại kỳ, HĐ đầu vào, ngày đến hạn gần nhất, PCCC, trạng thái.
- Tòa tạo từ trích xuất hiện chip `Chuẩn bị · từ HĐ`.

**Nhập dữ liệu:** có ba cách tạo tòa.

1. Commit trích xuất HĐ chủ nhà (chính).
2. Tạo tay.
3. Import. Map mã, tên, chủ nhà/HĐ nguồn, tầng; có preview, dò trùng và báo lỗi theo dòng trước khi ghi.

**Field chi tiết**

| Nhóm | Field |
|---|---|
| Cơ bản | Mã bất biến, tên, địa chỉ, khu vực, số tầng, diện tích sàn, kết cấu, ngày bắt đầu vận hành, trạng thái |
| Phân loại | T/S/G = dòng sản phẩm; L1=cũ, L2=trung bình, L3=mới; effective history |
| Tiện ích | Thang máy, máy giặt chung, sạc xe điện, camera, bảo vệ |
| Thu tiền | Tài khoản nhận mặc định, mẫu in hóa đơn, ngày chốt chỉ số mặc định 22 |
| Điện/nước | Công tơ tổng MAIN, công tơ COMMON, đơn giá gốc/đơn giá chung |
| Hồ sơ pháp lý | Checklist theo loại: Giấy chứng nhận nhà đất, PCCC, Giấy đăng ký HKD, HĐ đầu vào/phụ lục, bàn giao/kiểm kê, ủy quyền, chứng từ thuế/phí, phụ lục góp vốn 3 bên (làm sau), Khác; trạng thái hồ sơ và xác minh tách riêng, version, người tải, ngày cấp/hết hạn |
| Liên kết | Chủ nhà (nguồn), HĐ đầu vào (căn cứ), phòng, assignment, dịch vụ, tài sản, báo cáo |
| KPI đọc | Lấp đầy, công nợ, hiệu suất, lợi nhuận snapshot gần nhất |

**Tabs:** Tổng quan, Phòng, Phân công, Dịch vụ & bảng giá, Công tơ, HĐ đầu vào, Tài sản, Báo cáo, Tài liệu, Lịch sử. Thay đổi quản lý luôn mở flow Phân công tòa; không sửa `manager_id` trực tiếp.

**Upload tài liệu theo loại**

- **Modal bắt buộc chọn:** loại tài liệu, tòa/HĐ liên quan, file, ngày cấp/hết hạn nếu áp dụng, ghi chú. Preview rồi mới lưu.
- **Loại tài liệu:**
  - `Giấy chứng nhận nhà đất/sổ đỏ`
  - `Hồ sơ PCCC`
  - `Giấy đăng ký hộ kinh doanh`
  - `Hợp đồng thuê nhà đầu vào đã ký`
  - `Phụ lục hợp đồng`
  - `Biên bản bàn giao/kiểm kê tài sản`
  - `CCCD/ủy quyền bên cho thuê`
  - `Phụ lục góp vốn 3 bên` (làm sau)
  - `Chứng từ thuế/phí`
  - `Minh chứng khác`
- **Loại tài liệu quyết định** checklist, mốc hạn và nơi hiển thị.
- **Giấy đăng ký HKD:** upload thì **trạng thái đăng ký của tòa** tự chuyển sang `Đã đăng ký (theo tài liệu)`. **Trạng thái xác minh tài liệu** vẫn là `Chờ xác minh` cho đến khi người có quyền duyệt.
- **Thay thế/gỡ file:** phải có lý do, giữ version, và đánh giá lại trạng thái nếu không còn minh chứng hợp lệ.
- **Không** dùng file chưa phân loại để tự nhận là đã đạt chuẩn.

**Action theo trạng thái**

| Trạng thái | Action |
|---|---|
| `Chuẩn bị` | Đặt mã tòa (một lần), bổ sung số tầng/DT sàn, chọn T/S/G và L, chọn TK nhận, nhập mã công tơ, tải tài liệu, phân công QL, **tạo phòng**, `Chuyển Đang khai thác` (disable khi thiếu điều kiện, xem bảng điều kiện của chuỗi) |
| `Đang khai thác` | Sửa hồ sơ, đổi phân loại có ngày hiệu lực, quản lý công tơ, tài liệu, phân công, xem báo cáo |
| `Ngừng khai thác` | Chỉ đọc dữ liệu lịch sử |

**State:** `Chuẩn bị → Đang khai thác → Ngừng khai thác`. Chỉ hai trạng thái đầu cho phép tạo HĐ thuê khách.

**Hai loại công tơ cấp tòa — UI phải tách bạch, không gộp**

| | Công tơ tổng `MAIN` | Công tơ khu vực chung `COMMON` |
|---|---|---|
| Mã | `000<mã tòa>` (`000G1`, `000G6`) | Công tơ "điện vệ sinh chung" |
| Đơn giá | Giá gốc EVN (G1 3.500, G6 2.700) | 3.800/kWh |
| Mục đích | Đối chiếu sản lượng tòa với hóa đơn NCC, tính **thất thoát** = SL tổng − Σ SL phòng − SL khu vực chung | Chia theo **số người** thành dòng 12 của hóa đơn phòng |
| Lên hóa đơn khách? | **Không** — không tạo dòng, không chia cho phòng | Có |
| Mã nghiệp vụ | D-03, BR-2.03.5, BR-2.08.14 | D-18, BR-2.03.5, BR-2.08.11 |

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Quản lý tòa **đọc** từ phân công `Phụ trách chính` hiệu lực tại ngày xem; màn tòa không có field `manager_id` để sửa | BR-2.03.1, R-33 | Đã chốt |
| T/S/G và L1–L3 là **2 thuộc tính riêng**, mỗi loại có lịch sử; báo cáo kỳ dùng giá trị hiệu lực ngày cuối kỳ | BR-2.03.2 → **P-04** | Đã chốt một phần |
| Mã tòa khớp ký hiệu nhóm khi tạo; đổi nhóm sau đó **không đổi mã** (mã là khóa của mã phòng) | BR-2.03.3, D-03 | Cần chốt |
| Mỗi tòa đúng 1 tài khoản nhận mặc định có ngày hiệu lực; hóa đơn snapshot tài khoản tại ngày phát hành | BR-2.03.4, R-12 | Có bằng chứng nguồn |
| Ngày chốt chỉ số mặc định 22, cấu hình theo tòa; đổi ngày chỉ áp kỳ **chưa chốt** | BR-2.03.6, R-11 | Cần chốt |
| Hiệu suất/lợi nhuận trên màn tòa lấy từ **báo cáo kỳ Locked gần nhất**, có nhãn kỳ; không tính realtime | BR-2.03.7 → **X-07** | Đã chốt |
| `Ngừng khai thác` chỉ khi hết HĐ thuê hiệu lực và HĐ đầu vào đã kết thúc; tòa ngừng không vào mẫu số N phân bổ | BR-2.03.8 → **P-05** | Cần chốt |
| Tòa không có thang máy → dịch vụ thang máy không được chọn vào HĐ (validate ở UI-09/UI-07) | BR-2.03.9 | Cần chốt |
| Không xóa tòa đã có phòng/HĐ | BR-2.03.10 | Đã chốt |
| Điều kiện `Chuẩn bị → Đang khai thác` (HĐ hiệu lực, ≥ 1 phòng, QL, TK nhận, phân loại) | Spec 1.9 | ASSUMED |

**Nghiệm thu màn hình**

1. Tòa 25A Phú Diễn sau commit ở trạng thái `Chuẩn bị`. Có địa chỉ, kết cấu và mục đích. Số tầng, DT sàn và GCN để trống kèm nhãn. Có 2 công tơ chờ mã. Checklist có HĐ đã ký và phụ lục bàn giao. Không chuyển được sang `Đang khai thác` khi HĐ còn Nháp.
2. Mã tòa lưu một lần, sau đó bị khóa.
3. G1 đổi hạng L2 → L3 từ 01/09/2026 thì báo cáo 08/2026 vẫn là L2, 09/2026 là L3.
4. Màn tòa hiển thị đúng quản lý theo phân công hiệu lực. Phân công tương lai có nhãn "sắp tới".
5. G1 in hóa đơn theo mẫu G1 TECH, dùng TK BIDV 2120368058. Tòa dùng tài khoản VP-Hằng (ví dụ T17) in đúng mẫu VP-Hằng.
6. Dòng `000G1` tồn tại nhưng không sinh hóa đơn phòng và không tham gia chia điện chung.

### UI-05 — Phòng

**Mục đích:** tạo và vận hành từng phòng cho thuê; là nguồn duy nhất của trạng thái phòng trống. **Route:** `#/rooms`, `#/rooms/:id`, `#/rooms/new?building=:id` (route đề xuất). **Mockup:** [`UI-05-rooms-create-verified.png`](ui-imagegen-v1/02-nguon-nha-toa-phong/UI-05-rooms-create-verified.png) cho màn tạo phòng; bản danh sách/sơ đồ tầng hiện chỉ có ảnh ImageGen nháp.

**Phác họa 5.1 — Tạo phòng cho tòa mới**

```text
┌ Tạo phòng · 25A Phú Diễn ○ 0 phòng ───────────────────────── [Hủy] [Tạo 6 phòng] ┐
│ ⓘ HĐ chủ nhà không có danh sách phòng → sinh theo tầng hoặc import file          │
│ ① [Sinh theo tầng] · Import Excel                                                │
├──────────────────────────────┬───────────────────────────────────────────────────┤
│ ② THAM SỐ                    │ ③ PREVIEW — sửa từng dòng trước khi tạo           │
│ Tòa 25A Phú Diễn · PD25A △   │ Mã phòng │Số │Tầng│Loại        │Sức chứa          │
│ Số tầng [2] △ HĐ trống       │ 101PD25A │101│ 1  │Phòng thường│   2    │+Mới     │
│ Số phòng/tầng [3] △ minh họa │ 102PD25A │102│ 1  │Phòng thường│   2    │+Mới     │
│ Mẫu số phòng {tầng}0{stt}    │ …        │   │    │            │        │         │
│ Loại · sức chứa mặc định     │ 203PD25A │203│ 2  │Phòng thường│   2    │+Mới     │
│ Giá niêm yết · QL: nhập sau  │ Phòng tạo ở trạng thái Sẵn sàng  6 phòng          │
├──────────────────────────────┴───────────────────────────────────────────────────┤
│ ④ IMPORT EXCEL  ● Upload ━ ● Map cột ━ ● Validate ━ ④ Preview ─ ⑤ Commit         │
│  Dòng│Mã phòng │Tầng│Niêm yết│QL│Sức chứa│Kết quả                                │
│   2  │301PD25A │ 3  │   —    │— │   2    │✓ Hợp lệ                               │
│   4  │101PD25A │ 1  │   —    │— │   2    │✕ Trùng mã với dòng sinh theo tầng     │
│   5  │30APD25A │ 3  │   —    │— │   —    │△ Thiếu sức chứa                       │
│  Hợp lệ 2 · Trùng 1 · Thiếu 1 — dòng lỗi không chặn dòng hợp lệ [Tải dòng lỗi]   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Phác họa 5.2 — Danh sách, sơ đồ tầng và chi tiết phòng** (dữ liệu G1 kỳ 09/2026, Seed Data §6)

```text
┌ Phòng ─────────────────────── [◉ Bảng ○ Sơ đồ tầng] [+ Thêm] [Import] ┐
│ Tòa G1 ▾ │ Tầng ▾ │ Trạng thái ▾ │ Loại trống ▾ │ Giá ▾ │ Có đồng hồ ▾│
├───────────────────────────────────────────────────────────────────────┤
│ ⑤ Mã   │Tầng│Niêm yết │Giá QL   │Giá HĐ   │Người│Trạng thái           │
│ 101G1  │ 1  │3.600.000│3.500.000│3.500.000│  2  │▩ Đang thuê          │
│ 303G1  │ 3  │4.300.000│4.400.000│4.400.000│  2  │▩ Đang thuê △ QL>NY  │
│ 304G1  │ 3  │4.400.000│4.400.000│4.400.000│  2  │▩ Đang thuê          │
├───────────────────────────────────────────────────────────────────────┤
│ ⑥ SƠ ĐỒ TẦNG                                                          │
│  T4 │ ▩401 ▩402 ▩403 ▩404 │  ▩ Đang thuê  ▢ Sẵn sàng  ▤ Chờ dọn       │
│  T3 │ ▩301 ▩302 ▩303 ▩304 │  ▨ Giữ chỗ  ◫ Trống hết tháng ▦ Bảo trì   │
├───────────────────────────────────────────────────────────────────────┤
│ ⑦ CHI TIẾT PHÒNG 304G1                  [Đổi trạng thái ▾] [Xem HĐ]   │
│  Mã = số phòng 304 + mã tòa G1 (lưu 2 trường riêng)                   │
│  ⑧ GIÁ    Niêm yết 4.400.000 [Lịch sử] · QL 4.400.000 [Lịch sử]       │
│           Giá hiện tại 4.400.000 [khóa] đọc từ HĐ hiệu lực            │
│  ⑨ SỬ DỤNG Sức chứa __ · Đang ở 2 · khách mới từ 01/09/2026           │
│  ⑩ CÔNG TƠ Điện 304G1-E · CS 1.159 (0 kWh kỳ 09)                      │
│            Nước CÓ đồng hồ 304G1-W · 18 m³ → tính theo m³ (P-31)      │
│  ⑪ TRẠNG THÁI Đang thuê từ 01/09/2026 · lý do: kích hoạt HĐ [khóa]    │
│               [Xem toàn bộ lịch sử trạng thái ▸]                      │
└───────────────────────────────────────────────────────────────────────┘

 ⑫ Vòng đời trạng thái phòng
 Sẵn sàng ─cọc→ Giữ chỗ ─kích hoạt HĐ→ Đang thuê ─xác nhận kết thúc→
 Trống hết tháng ─ngày ra→ Chờ dọn ─(cần sửa)→ Bảo trì ─nghiệm thu→ Sẵn sàng
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Chọn cách tạo | `Sinh theo tầng` (mặc định cho tòa mới từ HĐ), `Import Excel`, hoặc `+ Thêm` từng phòng ở danh sách |
| ② | Tham số sinh | Số tầng lấy từ hồ sơ tòa; nếu trống thì người dùng nhập. Số phòng mỗi tầng, mẫu số phòng, loại và sức chứa mặc định. Giá niêm yết và giá QL có thể để trống, nhập sau |
| ③ | Preview | Mỗi dòng sửa được. Mã = số phòng + mã tòa. Phòng tạo ở `Sẵn sàng` và chưa có công tơ phòng (khai báo ở UI-10) |
| ④ | Import | Upload → Map cột → Validate → Preview → Commit. Cột bắt buộc: mã, tòa, số phòng, tầng, giá niêm yết, giá QL, sức chứa. Phát hiện trùng mã, **kể cả trùng với dòng vừa sinh theo tầng**. Dòng lỗi không chặn dòng hợp lệ |
| ⑤ | Bảng danh sách | Cột `Giá HĐ` trống khi phòng chưa có HĐ, là dấu hiệu phòng trống. Giá QL > giá niêm yết (303G1) thì cảnh báo △ |
| ⑥ | Sơ đồ tầng | Chế độ xem thứ hai. Màu **không phải dấu hiệu duy nhất**: mỗi ô có ký hiệu và tooltip trạng thái; legend đủ 6 trạng thái |
| ⑧ | Ba lớp giá | Giá niêm yết là **mẫu số tính hiệu suất**; giá QL là sàn; giá hiện tại có biểu tượng khóa vì chỉ đọc từ HĐ |
| ⑨ | Sử dụng | Số người vượt sức chứa chỉ **cảnh báo**, không chặn. Phần vượt thu qua dòng Thu khác của hóa đơn |
| ⑩ | Công tơ | Nói rõ phòng **có** hay **không** có đồng hồ nước. Có thì tính theo m³ (304G1). Không có thì ghi "tính theo đầu người" |
| ⑪ | Lịch sử trạng thái | Nguồn duy nhất cho mọi thống kê lấp đầy và phòng trống. `Đang thuê` **chỉ do kích hoạt HĐ đặt**, hiển thị khóa. Mỗi lần đổi ghi từ–đến, lý do, người thực hiện |
| ⑫ | Vòng đời | UI **chỉ hiển thị nút của transition hợp lệ** và mô tả tác động trước khi xác nhận |

**Cột bảng:** mã phòng, tòa/tầng, loại/diện tích, giá niêm yết, giá QL, giá HĐ hiện tại, sức chứa/người hiện tại, trạng thái, khách/HĐ, công nợ, ngày sẵn sàng, quản lý. **Bộ lọc:** tòa/tầng, trạng thái, loại phòng, khoảng giá, có công tơ, ngày sẵn sàng, HĐ sắp hết.

**Field chi tiết**

| Nhóm | Field |
|---|---|
| Nhận diện | Mã = số phòng + mã tòa, số phòng, tầng, loại, diện tích, nguồn tạo (sinh theo tầng / tay / import lô) |
| Giá | Giá niêm yết và giá QL có lịch sử/effective date; giá hiện tại đọc từ HĐ |
| Sử dụng | Sức chứa, người hiện tại suy ra, ngày trống từ, sẵn sàng dự kiến |
| Bàn giao | Danh sách nội thất mặc định: tên, SL, tình trạng — mẫu copy vào HĐ khách khi tạo HĐ |
| Công tơ | Điện/nước, loại, mã, chỉ số gần nhất; nước theo người nếu không có đồng hồ |
| Trạng thái | Trạng thái, từ ngày, lý do, người đổi; ảnh/ghi chú |

**Action theo trạng thái**

| Trạng thái | Action |
|---|---|
| `Sẵn sàng` | Sửa, cập nhật giá, tạo HĐ khách (UI-07/UI-08), chuyển bảo trì |
| `Giữ chỗ` | Xem HĐ Nháp/Chờ ký, hủy giữ (xử lý cọc) |
| `Đang thuê` | Xem khách/HĐ, nhập chỉ số; **không** có action đặt `Đang thuê` bằng tay |
| `Trống hết tháng` · `Chờ dọn` · `Bảo trì` | Xác nhận ngày ra, xác nhận dọn xong, nghiệm thu → `Sẵn sàng` |

**State:** `Sẵn sàng → Giữ chỗ → Đang thuê → Trống hết tháng → Chờ dọn → Bảo trì → Sẵn sàng`. Có nhánh hủy giữ, gia hạn, ngừng/mở lại khai thác.

**Ánh xạ trạng thái → 3 loại phòng trống (D-24)** — dùng thống nhất ở UI-01, UI-05 và Report A:

| Loại trống | Trạng thái phòng tương ứng | Ý nghĩa |
|---|---|---|
| Trống ở luôn | `Sẵn sàng`, `Chờ dọn`, `Bảo trì` | Có thể cho vào ở ngay hoặc sau khi dọn |
| Trống hết tháng | `Trống hết tháng` | HĐ hết vào cuối tháng và quản lý **đã xác nhận Kết thúc** ở Work Queue |
| Đang chờ | `Giữ chỗ` | Đã cọc, chưa vào ở |

Tổng phòng trống = tổng 3 loại, đếm **tại ngày cuối tháng**, theo tòa rồi cộng lên (R-06). UI không được hiển thị một con số trống gộp mà thiếu 3 loại này.

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Mã phòng = số phòng + mã tòa, lưu **2 trường riêng** (không cắt chuỗi); ngoại lệ có chữ (`401S4A`) nhập tay giữ nguyên | BR-2.04.1, D-03 | Có bằng chứng nguồn |
| Giá hiện tại **chỉ đọc** từ HĐ hiệu lực; phòng không HĐ → để trống, không cho nhập | BR-2.04.2, D-12 | Đã chốt |
| Giá chốt HĐ < Giá QL → bắt buộc duyệt TNVH/TPVH trước khi kích hoạt HĐ | BR-2.04.3, D-11 | Cần chốt |
| Đổi giá niêm yết có ngày hiệu lực, giữ lịch sử; DT niêm yết của kỳ dùng giá hiệu lực **ngày cuối kỳ** | BR-2.04.4, D-45 | Cần chốt |
| Không cho 2 HĐ hiệu lực chồng ngày; `Đang thuê` **chỉ do kích hoạt HĐ đặt**, không có action đặt tay | BR-2.04.5 | Đã chốt |
| Hoàn cọc/kết thúc HĐ **không** tự đưa phòng về `Sẵn sàng`; bắt buộc qua `Chờ dọn` → nghiệm thu | BR-2.04.6, R-17 | Đã chốt |
| `Giữ chỗ` chỉ tạo khi có bút toán cọc của HĐ Nháp/Chờ ký; hủy giữ → xử lý bỏ cọc hoặc hoàn nếu lỗi công ty | BR-2.04.7, D-27 | Cần chốt |
| Số người hiện tại = `occupant_count` của HĐ hiệu lực; vượt sức chứa → **cảnh báo, không chặn** (phụ thu ghi ở dòng Thu khác) | BR-2.04.11, D-17 | Cần chốt |
| Phòng `Ngừng khai thác` không tính vào N phân bổ và không tính trống | BR-2.04.12 → **P-05** | Cần chốt |
| Sinh theo tầng và import cùng kiểm tra trùng mã trong tòa trước khi ghi; HĐ chủ nhà không sinh phòng | Spec 1.8 | ASSUMED |

**Cảnh báo bắt buộc:** phòng trống > 30 ngày; `Chờ dọn` > 3 ngày; `Bảo trì` > 15 ngày báo TPVH; giá chốt < giá QL đang chờ duyệt; giá QL > giá niêm yết (ca 303G1).

**Nghiệm thu màn hình**

1. Tòa 25A Phú Diễn với 2 tầng × 3 phòng sinh ra 6 phòng, mã từ `101PD25A` đến `203PD25A`, trạng thái `Sẵn sàng`.
2. Import có dòng `101PD25A` thì báo trùng mã với dòng sinh theo tầng. 2 dòng hợp lệ vẫn được tạo.
3. Danh sách G1 hiện 15 phòng đúng giá niêm yết, giá QL và giá HĐ theo Seed §6.1. 303G1 có cảnh báo giá QL > niêm yết.
4. 304G1 hiện "có đồng hồ nước", tính theo m³.
5. Sơ đồ tầng không chỉ dùng màu.
6. Không có nút đặt `Đang thuê` bằng tay.

### UI-06 — Khách thuê

**Phác họa màn hình**

```text
┌ Khách thuê / 204S12A001 · Nguyễn Thị Mai ── [Sửa] [Liên kết Zalo] [⋯] ┐
│ Đang thuê · 204S12 · HĐ CT-2026-0442 · Công nợ 0 · Cọc giữ 3.600.000   │
├────────────────────────────────────────────────────────────────────────┤
│ ① Tổng quan │ Hợp đồng │ Người ở cùng │ Xe │ Hóa đơn │ Zalo │ Tài liệu  │
├────────────────────────────────────────────────────────────────────────┤
│ ② CÁ NHÂN   Họ tên ______ · SĐT ______ · CCCD ______                   │
│             Ngày sinh __ · Giới tính ▾ · Thường trú ______             │
│             Liên hệ khẩn cấp ______                                    │
│ ③ PHÂN LOẠI Nghề nghiệp [Đi làm ▾] → Phân khúc [Đi làm ▾] (sửa được)   │
│             Trạng thái [Đang thuê ▾] ⓘ hệ thống đề xuất từ sự kiện HĐ  │
├────────────────────────────────────────────────────────────────────────┤
│ ④ NGƯỜI Ở CÙNG                                   [+ Thêm người]        │
│  Họ tên   │ SĐT      │ CCCD     │ Quan hệ │ Từ–Đến      │ Hồ sơ        │
│  Trần B   │ 09xx     │ 0012…    │ Bạn     │ 01/06/2026– │ △ chưa link  │
│  → Số người của HĐ = 1 (đứng tên) + 1 = 2  → cơ sở tính nước/vệ sinh   │
├────────────────────────────────────────────────────────────────────────┤
│ ⑤ XE (không giới hạn số lượng)                        [+ Thêm xe]      │
│  Loại        │ Biển số   │ Màu  │ Dịch vụ gửi xe gắn │ Từ–Đến          │
│  Xe máy      │ 29A-123   │ Đen  │ Gửi xe máy 150.000 │ 01/06/2026–     │
│  Xe đạp điện │ —         │ Trắng│ Xe điện 150.000    │ 01/06/2026–     │
│  → sinh dòng hóa đơn: Gửi xe SL 1 · Xe điện SL 1                       │
├────────────────────────────────────────────────────────────────────────┤
│ ⑥ ZALO  ZaloID: đã liên kết 12/06/2026 ✓   [Gửi thử] [Hủy liên kết]    │
│ ⑦ VÒNG ĐỜI (suy ra từ HĐ, không nhập tay)                              │
│  Ứng viên → Chờ ký → ●Đang thuê → Sắp hết hạn → Chờ quyết toán → Đã rời│
└────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| Header | Mã khách | `204S12A001` = mã phòng + `A` + số thứ tự. Sinh khi HĐ chuyển `Chờ ký`; gia hạn giữ nguyên mã; đổi phòng cấp mã mới theo phòng đích nhưng **giữ số thứ tự** |
| ② | Cá nhân | Trùng CCCD **chặn** tạo mới và đề xuất dùng bản ghi cũ; trùng SĐT chỉ cảnh báo |
| ③ | Phân loại | Phân khúc suy ra từ nghề nghiệp nhưng cho sửa; trạng thái do hệ thống đề xuất từ sự kiện HĐ, ghi đè phải có lý do |
| ④ | Người ở cùng | Dòng tổng kết số người hiển thị ngay dưới bảng vì đây là **cơ sở tính nước, vệ sinh, máy giặt, điện chung**. Thay đổi giữa kỳ áp dụng **từ kỳ hóa đơn kế tiếp** |
| ⑤ | Xe | Mỗi xe map 1 dịch vụ gửi xe; dòng tổng kết cho thấy trước dịch vụ sẽ lên hóa đơn |
| ⑥ | Zalo | 1 khách ↔ 1 ZaloID. Khách chưa liên kết được gắn cờ để UI-17 chuyển sang phương án dự phòng |
| ⑦ | Vòng đời | Là nhãn suy ra, không phải ô nhập; giữ lịch sử sau khi khách rời |
| `⋯` | Menu phụ | `Merge trùng` giữ ID đích và chuyển toàn bộ HĐ/payment/cọc, bản ghi nguồn **đánh dấu merged chứ không xóa**. `Export` ẩn cột CCCD/ngày sinh nếu vai trò thiếu quyền |

**Danh sách:** tìm tên, SĐT, CCCD, mã khách; tạo/import khách có preview, dò trùng CCCD/SĐT và ghép bản ghi; OCR hợp đồng thuê cũng tạo/liên kết khách sau khi duyệt. Filter scope, tòa/phòng, status, cờ HĐ hiệu lực, công nợ, chờ hoàn cọc, Zalo, vai trò đứng tên/người ở cùng.

**Cột:** mã khách, tên/SĐT, phòng/tòa hiện tại, vai trò, HĐ/status, số người/xe, công nợ, cọc giữ, Zalo, quản lý, cập nhật.

**Field chi tiết**

| Nhóm | Field |
|---|---|
| Cá nhân | Mã khách, họ tên, SĐT, CCCD, ngày sinh, giới tính, thường trú, liên hệ khẩn cấp |
| Phân loại | Nghề nghiệp, phân khúc, trạng thái khách, lý do đổi |
| Người ở cùng | Họ tên, SĐT, CCCD, quan hệ, từ–đến, hồ sơ đã link/chưa link |
| Xe | Loại, biển số, màu, dịch vụ gửi xe, từ–đến |
| Zalo | ZaloID/follow OA, ngày liên kết, trạng thái, lịch sử gửi/phản hồi |
| Vòng đời/cờ suy ra | Ứng viên, chờ ký, đang thuê, sắp hết hạn, chờ quyết toán, đã rời; tính từ HĐ liên kết và giữ lịch sử |
| Tài liệu | CCCD mặt trước/sau, tạm trú, tài liệu khác |

**Action:** tạo/sửa, đổi status, gắn HĐ, thêm người/xe, merge trùng, liên kết Zalo, bulk update có preview, export selected/all filtered.

**Quy tắc mã khách:** `mã phòng + "A" + số thứ tự 3 chữ số` (`606T42A001`). Số thứ tự = số HĐ mới đã từng có của phòng + 1. Sinh khi HĐ chuyển `Chờ ký` (**P-24**). Gia hạn **giữ nguyên** mã; đổi phòng nội bộ cấp mã mới theo phòng đích nhưng **giữ số thứ tự**, mã cũ lưu lịch sử.

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Sinh mã khách tại `Chờ ký`; đổi phòng giữ số thứ tự | BR-2.05.1, BR-2.05.2 → **P-24** | Cần chốt thời điểm sinh |
| Gia hạn giữ nguyên mã khách | BR-2.05.3 | Đã chốt |
| Trùng CCCD → **chặn** tạo mới, đề xuất dùng bản ghi cũ; trùng SĐT → chỉ cảnh báo | BR-2.05.4 | Đã chốt |
| Số người của HĐ = 1 (đứng tên) + số người ở cùng đang hiệu lực; thay đổi giữa kỳ áp dụng **từ kỳ hóa đơn kế tiếp** | BR-2.05.5, D-15 | Cần chốt |
| Xe **không giới hạn** số lượng; mỗi xe gắn 1 dịch vụ gửi xe → dòng hóa đơn có SL = số xe cùng loại | BR-2.05.6 | Đã chốt |
| Trạng thái `Sắp hết HĐ` / `Phá HĐ` / `Hoàn cọc` do hệ thống **đề xuất** từ sự kiện HĐ; người dùng ghi đè có lý do | BR-2.05.7 | Cần chốt |
| Bulk update giới hạn trong phạm vi dữ liệu của người thao tác; có preview số bản ghi → xác nhận → audit batch + từng khách | BR-2.05.8 | Đã chốt |
| Export **không** kèm CCCD/ngày sinh nếu vai trò thiếu quyền; lưu điều kiện lọc, thời điểm, người export | BR-2.05.9 | Đã chốt |
| Merge 2 khách: giữ ID đích, chuyển toàn bộ HĐ/payment/cọc, **không xóa** bản ghi nguồn (đánh dấu merged) | BR-2.05.10 | Cần chốt |
| Liên kết Zalo 1 khách ↔ 1 ZaloID; khách chưa liên kết gắn cờ để UI-17 dùng phương án dự phòng | BR-2.05.11, R-35 | Đã chốt |

**Nghiệm thu màn hình:** phòng 204S12 khách thứ nhất ra `204S12A001`, khách thứ hai ra `204S12A002`, gia hạn giữ mã; thêm 2 xe máy + 1 xe đạp điện sinh dịch vụ gửi xe SL 2 và xe điện SL 1; bulk update 120 khách có preview và audit batch; export của NVVH không có cột CCCD.

### UI-07 — Hợp đồng thuê

**Phác họa màn hình**

```text
┌ HĐ thuê / CT-2026-0442 · 302G6 ─── [Gia hạn] [Kết thúc] [Đổi phòng] [⋯] ┐
│ Hiệu lực · PB 2/2 · 01/09/2026 → 30/08/2027 · Giá chốt 4.000.000 · 3 ng │
├─────────────────────────────────────────────────────────────────────────┤
│ ① Tổng quan│Phiên bản│Người thuê│Dịch vụ│Cọc│Thanh toán│Công nợ│Chỉ số│  │
│   Bàn giao│Gia hạn│Tài liệu│Sự kiện & Audit                             │
├─────────────────────────────────────────────────────────────────────────┤
│ ② ĐẦU HĐ (bất biến)  Số HĐ · Tòa G6 / Phòng 302 · Mã khách 302G6A002    │
│                      Ngày vào ở 01/09/2026 · Nguồn tạo: OCR job #118    │
│                      HĐ trước: CT-2025-0331 ▸                           │
├─────────────────────────────────────────────────────────────────────────┤
│ ③ PHIÊN BẢN ĐANG HIỆU LỰC (PB 2 — gia hạn)                              │
│   Ngày ký 20/08/2026 · Từ 01/09/2026 → 30/08/2027 · 12 tháng            │
│   Niêm yết 4.200.000 │ Giá QL 3.800.000 │ ④ Giá chốt 4.000.000 ✓        │
│   Kỳ TT [1 tháng ▾] · Cọc phải thu 4.000.000 / đã thu 4.000.000 ✓       │
│   [Xem PB 1 (01/09/2025–30/08/2026, giá 3.700.000) ▸]                   │
├─────────────────────────────────────────────────────────────────────────┤
│ ⑤ DỊCH VỤ SNAPSHOT THEO HĐ                                              │
│  Dịch vụ   │Cách tính│ SL │ Đơn giá   │ Nguồn giá                       │
│  Điện      │đồng hồ  │ —  │ 4.000/kWh │ mặc định hệ thống               │
│  Nước      │đồng hồ  │ —  │35.000/m³  │ override tòa G6                 │
│  Combo     │người    │ 3  │120.000    │ giá riêng HĐ △ khác tòa (130k)  │
│  Thang máy │người    │ 3  │ 60.000    │ override tòa G6                 │
├─────────────────────────────────────────────────────────────────────────┤
│ ⑥ SỰ KIỆN VÒNG ĐỜI                                    ảnh hưởng đếm     │
│  01/09/2025 new        → phòng mới +1 tại 09/2025                       │
│  01/09/2026 renew      → không đếm                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ ⑦ CHECKLIST KÍCH HOẠT   ✓khách ✓giá ✓kỳ TT ✓ngày vào ✓cọc ✓dịch vụ điện │
│                         ✓chỉ số đầu kỳ ✓file HĐ ký  → [Kích hoạt]       │
└─────────────────────────────────────────────────────────────────────────┘

 ⑧ Wizard tạo HĐ — 8 bước
 1 Phòng → 2 Khách → 3 Thời hạn → 4 Giá & cọc → 5 Dịch vụ →
 6 Người ở/xe/nội thất/chỉ số đầu → 7 Điều khoản TT & gia hạn → 8 Tài liệu
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ② | Đầu HĐ | Nhóm trường **bất biến qua mọi phiên bản**; đổi phòng nội bộ vẫn giữ nguyên bản ghi này |
| ③ | Phiên bản | Mỗi lần ký/gia hạn là một phiên bản mới nối tiếp, đổi được thời hạn/giá/điều khoản nhưng **giữ mã khách và số dư cọc**; phiên bản cũ vẫn mở xem được |
| ④ | Giá chốt | Nếu thấp hơn giá QL thì HĐ nằm ở `Chờ ký` tới khi TNVH/TPVH duyệt; UI hiện chip cảnh báo ngay cạnh ô giá |
| ⑤ | Dịch vụ snapshot | Cột `Nguồn giá` cho biết giá đến từ đâu theo thứ tự ưu tiên giá HĐ → override tòa → mặc định. Đổi bảng giá sau đó **không** đổi HĐ đang hiệu lực |
| ⑥ | Sự kiện | Hiển thị kèm cột "ảnh hưởng đếm" để người dùng hiểu vì sao báo cáo đếm hoặc không đếm phòng này |
| ⑦ | Checklist kích hoạt | Nút `Kích hoạt` chỉ bật khi đủ 8 điều kiện; mỗi mục thiếu là link nhảy tới chỗ cần bổ sung |
| ⑧ | Wizard | Có stepper, `Lưu nháp` từng bước, summary trước khi xác nhận. OCR **không tự kích hoạt** HĐ |
| `Đổi phòng` | Action | Tạo sự kiện `transfer` trên **cùng HĐ**: phòng cũ sang Chờ dọn, phòng mới sang Đang thuê, cọc chuyển theo, **không thu cọc mới**, hoa hồng giữ nguyên |

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

**Mô hình 3 lớp — UI phải phản ánh đúng, không làm phẳng thành 1 bản ghi**

| Lớp | Entity | Nội dung | Hiển thị ở |
|---|---|---|---|
| Đầu HĐ (bất biến) | `CONTRACT` | Số HĐ, tòa/phòng, mã khách, ngày vào ở, HĐ trước/sau, nguồn tạo Tay/OCR | Header chi tiết |
| Phiên bản (1 dòng = 1 lần ký/gia hạn) | `CONTRACT_VERSION` | Ngày ký, từ–đến, thời hạn, giá niêm yết/QL/**giá chốt** snapshot, kỳ TT, cọc, danh sách dịch vụ + đơn giá snapshot, xe, nội thất, điều khoản TT/gia hạn, file ký | Tab `Phiên bản` |
| Sự kiện vòng đời | `CONTRACT_EVENT` | `new` / `renew` / `transfer` / `end` / `early_termination` / `abandon` | Tab `Sự kiện/Audit` |

Ảnh hưởng đếm của sự kiện — quyết định số liệu Report A, UI phải hiển thị được lý do đếm:

| Sự kiện | Ngày ghi nhận | Ảnh hưởng đếm |
|---|---|---|
| `new` | Ngày vào ở | `NEW_ROOM_COUNT` +1 tại tháng vào ở, kể cả phòng cũ có khách mới (D-23) |
| `renew` | Ngày hiệu lực phiên bản mới | Không đếm |
| `transfer` | Ngày đổi phòng | **Không** đếm phòng mới, **không** đếm phá HĐ (D-26, R-18) |
| `end` | Ngày ra thực tế | Không đếm |
| `early_termination` | Ngày ra thực tế (hoặc ngày phát hiện bỏ trốn) | `EARLY_TERMINATION_COUNT` +1 tại tháng có ngày ra (D-25) |
| `abandon` | Ngày báo bỏ | Không đếm phòng mới nếu chưa vào ở; cọc forfeit (D-27) |

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Chặn kích hoạt nếu phòng không ở `Sẵn sàng`/`Giữ chỗ` hoặc còn HĐ hiệu lực chồng ngày | BR-2.06.1 | Đã chốt |
| Điều kiện kích hoạt: khách đứng tên, giá chốt, kỳ TT, ngày vào ở, cọc phải thu, ≥ 1 dịch vụ điện, chỉ số đầu kỳ điện (và nước nếu có đồng hồ), file HĐ ký | BR-2.06.2 | Cần chốt |
| Đơn giá dịch vụ **snapshot** tại kích hoạt theo thứ tự: giá HĐ/OCR → override tòa → mặc định hệ thống; đổi bảng giá sau đó **không** đổi HĐ đang hiệu lực | BR-2.06.3, R-14 | Có bằng chứng nguồn |
| Gia hạn tạo phiên bản mới nối tiếp (từ ngày = ngày kết thúc cũ + 1), đổi được thời hạn/giá/điều khoản/dịch vụ, giữ mã khách và số dư cọc, **không ghi đè** phiên bản cũ | BR-2.06.4, R-15 | Đã chốt |
| Cọc phải thu mặc định = giá chốt × 1 tháng, sửa được; kích hoạt khi cọc đã thu ≥ cọc phải thu **hoặc** TPVH duyệt "thiếu cọc" có hạn bổ sung | BR-2.06.5 | Cần chốt |
| Tiền phòng tháng đầu khi vào giữa tháng = giá chốt ÷ 30 × số ngày ở | BR-2.06.7, R-10 → **P-03** | Cần chốt mẫu số |
| HĐ `Hiệu lực` **không** sửa trực tiếp giá/kỳ TT/ngày; thay đổi đi qua phụ lục = phiên bản mới có ngày hiệu lực | BR-2.06.15 | Cần chốt |
| Đổi phòng nội bộ = sự kiện `transfer` trên **cùng HĐ**: phòng cũ → Chờ dọn, phòng mới → Đang thuê, cọc chuyển theo, tạo OPENING mới cho phòng đích, **không** thu cọc mới, hoa hồng giữ nguyên | BR-2.06.16, R-18 | Cần chốt |
| Kỳ TT = k > 1: hóa đơn thu `giá × k`; ghi số tháng đã trả trước để (k−1) kỳ sau **không lập lại** dòng tiền phòng | BR-2.06.17, D-13 | Có bằng chứng nguồn |
| Ngày kết thúc phiên bản hiện hành là nguồn Work Queue "HĐ sắp hết"; điều khoản báo trước từ OCR **chỉ để cảnh báo**, không tự gia hạn | BR-2.06.18, R-15 | Đã chốt |

**Nghiệm thu màn hình:** kích hoạt `505G6` vào ở 01/09 sinh sự kiện `new`, phòng chuyển Đang thuê, hóa đơn đầu 7.830.000đ (tiền phòng 3.700.000 + cọc 3.700.000 + DV 430.000); gia hạn tạo phiên bản 2 với giá mới mà mã khách và cọc không đổi, phiên bản 1 vẫn đọc được; giá tháng đầu 2.916.667đ của `202T24` **không** bị coi là dưới giá QL vì so sánh trên giá chốt tháng đủ 3.500.000đ.

### UI-08 — OCR/Data Onboarding

**Phác họa màn hình**

```text
┌ OCR hợp đồng khách / job #118 ── READY_FOR_REVIEW ── [Validate] [Commit] ┐
│ File: DEMO-TH-2026-001.pdf · 4 trang · hash 9f2c… · Linh tải 17/09 09:12 │
├───────────────┬───────────────────────────────────┬──────────────────────┤
│ ① TỆP & TRANG │ ② NHÓM TRƯỜNG (theo Điều của HĐ)  │ ③ TỔNG HỢP           │
│               │                                   │                      │
│ [◂ 1/4 ▸]     │ ▾ Bên B – khách       Điều mở đầu │ Trường đọc được: 58  │
│ [zoom +/−]    │   Họ tên  TRẦN MINH AN     0.98 ✓ │ Cần kiểm tra:     9  │
│ ┌───────────┐ │   CCCD    001098000001     0.95   │ ✕ Xung đột:       3  │
│ │ HỢP ĐỒNG  │ │   → [Link hồ sơ cũ ▾]             │ △ Cảnh báo nhẹ:   6  │
│ │ ▓▓▓ vùng  │ │ ▾ Bên A – đại diện    (chỉ đối    │                      │
│ │ được tô   │ │   ĐỖ THỊ THÙY LINH     chiếu)     │ ④ XUNG ĐỘT PHẢI      │
│ │ khi chọn  │ │   ✕ KHÔNG tạo hồ sơ chủ nhà       │    CHỌN TRƯỚC COMMIT │
│ │ trường    │ │ ▾ Phòng / tòa              Đ.1.1  │                      │
│ │           │ │   P302 · TH01 → [Link ▾]          │ ✕ 1. NƯỚC            │
│ │           │ │ ▾ Người & xe               Đ.1.2  │  Đ.4.2 ghi 120.000/  │
│ │           │ │   Số người 2 · Tối đa 2           │  người, nhưng Đ.2.2  │
│ │           │ │   Xe: 01 xe máy △ thiếu biển số   │  có ĐỒNG HỒ NƯỚC và  │
│ │           │ │ ▾ Tài sản bàn giao         Đ.2.2  │  Đ.4.2 ghi 85 m³     │
│ │           │ │   28 dòng · 2 khối × 3 cột        │  → [Theo người]      │
│ │           │ │   ⓘ có Công tơ điện, Đồng hồ nước │    [Theo đồng hồ]    │
│ │           │ │   ⓘ Chìa khóa 2 bộ → thu hồi      │                      │
│ └───────────┘ │ ▾ Thời hạn                 Đ.3    │ ✕ 2. ĐIỆN CHUNG      │
│               │   Giao 01/10/26 · Tính tiền 01/10 │  "DV chung 120.000/  │
│ Raw           │   12 th → 30/09/27                │  người" gồm 4 khoản: │
│ Chuẩn hóa     │   △ Tự gia hạn 12th, báo trước 30 │  máy giặt + ĐIỆN     │
│ Độ tin cậy    │ ▾ Giá & cọc                Đ.4.1  │  CHUNG + rác + VS    │
│ Trang/bbox    │   Giá 4.500.000 · Cọc 4.500.000   │  → trùng dòng 12 HĐ  │
│ Quyết định    │   Đã thu trước ký 1.000.000       │  → [Đã gồm trong     │
│               │   Đóng thêm khi ký 8.000.000      │     combo]           │
│               │   ⓘ candidate, KHÔNG tự ghi đã thu│    [Tính riêng theo  │
│               │ ▾ Dịch vụ & đơn giá        Đ.4.2  │     công tơ]         │
│               │   Internet 100.000 · Điện 4.000   │                      │
│               │   Nước 120.000/ng · DV chung 120k │ ✕ 3. NỘI DUNG CK     │
│               │   Xe đạp điện 150k · SM 400k      │  HĐ: "P302 - TH01 -  │
│               │ ▾ Chỉ số bàn giao          Đ.4.2  │  TRAN MINH AN"       │
│               │   Điện 1.250 kWh · Nước 85 m³     │  Hệ thống cần mã     │
│               │   → OPENING, duyệt trước HĐ đầu   │  phòng "302TH01"     │
│               │ ▾ Thanh toán & phạt        Đ.4.4  │  → [Chuẩn hóa mẫu]   │
│               │   Hạn 25→30 · BIDV 2120368058     │                      │
│               │   Phạt 200k/ngày từ mùng 1, ≤3 ng │ ⑤ CẢNH BÁO NHẸ       │
│               │ ▾ Khấu trừ & bảo hành   Đ.5.2/6.2 │ △ Thiếu biển số xe   │
│               │   Bảo hành 10 ngày                │ △ 7. TK trên HĐ ≠ TK │
│               │   Bẩn tường 600.000               │   mặc định tòa → KT  │
│               │   Khấu hao thiết bị ≥ 200.000     │ △ 1. Tự gia hạn: HĐ  │
│               │                                   │   30 ng · HT 35 ng   │
│               │                                   │ △ 2. Phạt: HĐ từ mùng│
│               │                                   │   1, ≤3 ng · HT từ   │
│               │                                   │   ngày 6, không trần │
│               │                                   │ △ 3. Hạn TT 25→30 ·  │
│               │                                   │   HT 25→cuối tháng   │
│               │                                   │ △ 8. Chuyển nhượng   │
│               │                                   │   HĐ: chưa có sự kiện│
└───────────────┴───────────────────────────────────┴──────────────────────┘
 ⑥ Luồng: Upload → Processing → Ready for review → Reviewing → Validate →
          Xem payload → Confirm commit → Committed   (lỗi: Failed / Commit failed)
 ⑦ Nút Commit bị KHÓA khi còn xung đột ✕ chưa được chọn hướng xử lý
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Khung tệp | Luôn giữ file gốc và vị trí trang/bbox làm nguồn kiểm tra; chọn một trường ở cột giữa thì vùng tương ứng trên file được tô sáng |
| ② | Nhóm trường | Gom theo **nhóm entity** chứ không theo thứ tự xuất hiện trong file. Mỗi dòng có: raw, giá trị chuẩn hóa, độ tin cậy, ứng viên hệ thống, điểm khớp, và quyết định `Create / Link / Update / Ignore` |
| ③ | Tổng hợp | Bốn bộ đếm điều hướng người review: đọc được / cần kiểm tra / **xung đột** / cảnh báo nhẹ. Xung đột tách riêng vì nó chặn commit |
| ④ | Khối xung đột | Không phải cảnh báo thông thường. Mỗi xung đột là một **lựa chọn nghiệp vụ bắt buộc** có nút hành động; hệ thống tuyệt đối không tự chọn hộ, vì cả ba xung đột trong mẫu này đều làm sai tiền trên mọi hóa đơn về sau |
| ⑤ | Cảnh báo nhẹ | Thiếu chi tiết, hoặc điều khoản HĐ lệch rule hệ thống nhưng không đổi tiền hóa đơn (#1, #2, #3, #7, #8 của bảng xung đột bên dưới) — cho đi tiếp, ghi nhận để bổ sung tay. Đủ 8 xung đột phải hiện trên màn: 3 chặn Commit ở ④, 5 cảnh báo ở ⑤ |
| ⑥ | Luồng trạng thái | Commit là **một transaction**: lỗi entity bắt buộc thì rollback toàn bộ. Upload cùng hash cảnh báo job cũ và không tạo HĐ trùng |
| ⑦ | Khóa nút Commit | Nút bị disable kèm tooltip liệt kê xung đột còn lại, thay vì cho bấm rồi báo lỗi |
| Bên A | Vùng chỉ đối chiếu | Người ký đại diện Bên A trên hợp đồng khách là **người đại diện cho thuê phòng**; UI hiện cảnh báo cố định "không tạo hồ sơ chủ nhà" để reviewer không nhầm sang UI-02 |
| Phạm vi | Loại job | Chỉ nhận **hợp đồng thuê phòng của khách**. HĐ thuê nguyên tòa từ chủ nhà nhập ở UI-02/UI-03, không đi qua job này |

**Màn danh sách job:** file, loại tài liệu, hash, engine, người tải, thời gian, số field cần kiểm tra, status, lỗi, HĐ kết quả. Action: upload, mở job, xử lý lại, thử commit lại, mở kết quả.

**Review screen ba vùng**

```text
File/pages + zoom         Entity groups/fields                  Summary
OCR highlight             raw | normalized | confidence         conflicts
page navigation           candidate | decision | final value    validation
```

**Loại job trong phạm vi hiện tại:** `Hợp đồng thuê phòng của khách`. Nhận PDF có lớp chữ hoặc bản scan/ảnh cần OCR; luôn giữ file và vị trí trang làm nguồn kiểm tra. Chỉ trích xuất để đề xuất dữ liệu khách và giao dịch thuê phòng. Chủ nhà/HĐ đầu vào là **dữ liệu đối chiếu đã có**, không phải nhóm entity được tạo tự động bởi job này. Người ký đại diện Bên A trong hợp đồng khách là người đại diện cho bên cho thuê phòng; không suy ra đó là chủ sở hữu tòa hoặc tạo hồ sơ chủ nhà.

**Bản đồ trích xuất theo từng Điều của hợp đồng khách** — lập từ mẫu thật `Hop_dong_thue_phong_demo_day_du.pdf` (HĐ số `DEMO-TH-2026-001`, phòng P302 – Tòa TH01). Cột "Điều" là neo để reviewer mở đúng trang trên file gốc.

| Điều | Trường trích xuất | Đích trong hệ thống | Quyết định khi review |
|---|---|---|---|
| Đầu HĐ | Số HĐ · Ngày ký · Địa chỉ nơi ký | `CONTRACT.code`, ngày ký của phiên bản | Ghi thẳng; trùng số HĐ → cảnh báo |
| Bên A | Đại diện chủ nhà: họ tên · CMT/CCCD · nơi cấp · HKTT · SĐT | **Chỉ đối chiếu**, không tạo hồ sơ | Là người đại diện cho thuê phòng, **không** suy ra chủ sở hữu tòa và **không** tạo hồ sơ chủ nhà |
| Bên B | Họ tên · ngày sinh · SĐT · CCCD · nơi cấp · HKTT | `CUSTOMER` | `Create/Link/Update` sau dò trùng: CCCD → SĐT → tên + ngày sinh |
| 1.1 | Số phòng · mã tòa | `ROOM` + `BUILDING` | `Link` bản ghi đang có; thiếu thì tạo ứng viên chờ xác nhận, **không kích hoạt** |
| 1.2 | Mục đích sử dụng · **số người** · **số người tối đa** · quy tắc thêm người · quy tắc chuyển nhượng HĐ · **số xe theo loại** | `CONTRACT.occupant_count`; đối chiếu `ROOM.capacity`; `CONTRACT_VEHICLE` | Số người > sức chứa phòng → cảnh báo, không chặn. Quy tắc "ở quá 5 ngày tính thêm người" lưu dạng điều khoản, là căn cứ cho dòng Thu khác sau này |
| 2.1 | Danh sách tài sản chung của tòa | Ghi chú điều khoản | Không tạo tài sản; tài sản tòa quản lý ở UI-27 |
| 2.2 | **Bảng bàn giao 2 khối song song** (nội thất \| thiết bị), mỗi dòng: tên · số lượng · tình trạng | `CONTRACT_HANDOVER_ASSET` | Parser phải hiểu layout 6 cột = 2 nhóm × 3 cột. Dòng **Công tơ điện** và **Đồng hồ nước** là tín hiệu phòng có đồng hồ → đối chiếu với cách tính nước ở 4.2. Dòng **Chìa khóa phòng, cổng** phải thu hồi khi quyết toán |
| 3.1 / 3.2 | Ngày giao nhận phòng · ngày tính tiền phòng | `CONTRACT.move_in`, ngày tính tiền | Hai trường riêng dù mẫu này trùng ngày |
| 3.3 | Thời hạn (tháng) · từ ngày · đến ngày | `CONTRACT_VERSION` | Kiểm tra chéo: từ + thời hạn = đến |
| 3.4 | **Điều khoản tự gia hạn** (12 tháng) · **số ngày báo trước** (30) · ngày báo hạn cuối | `CONTRACT_RENEWAL_CLAUSE` | Lưu nguyên văn. **Chỉ sinh cảnh báo Work Queue, hệ thống không tự gia hạn** — xem bảng xung đột bên dưới |
| 4.1 | Giá thuê/tháng · **tiền đã thanh toán trước khi ký** · **tiền đóng thêm khi ký** | Giá chốt; 2 khoản tiền là **candidate đối soát** | Không tự ghi nhận đã thu. Gợi ý tách: mẫu này 1.000.000 + 8.000.000 = 9.000.000 ứng với cọc 4.500.000 + tiền phòng tháng đầu 4.500.000 — reviewer xác nhận cách tách |
| 4.2 | Bảng đơn giá: internet · điện · nước · dịch vụ chung · xe đạp điện · xe điện dịch vụ | `CONTRACT_SERVICE` (giá snapshot) | So với bảng giá tòa; lệch → `Giá riêng HĐ` / `Cập nhật giá tòa từ ngày…` / `Bỏ qua` |
| 4.2 | **Số điện (kWh) · Số nước (m³) tại bàn giao** | `METER_READING(OPENING)` | Gắn đúng công tơ của phòng; **bắt buộc duyệt trước hóa đơn đầu tiên**. Ghi chú: mẫu đặt hai số này cạnh bảng giá chứ không ở Điều 2, parser phải bắt được cả hai vị trí |
| 4.3 | Số tiền cọc · **SLA hoàn cọc** (10 ngày kể từ bàn giao phòng và chìa khóa) · điều kiện mất cọc · **phí nhượng phòng** | `DEPOSIT_LEDGER`; điều khoản hoàn cọc | SLA hoàn cọc đưa vào deadline của phiếu hoàn cọc ở UI-16 |
| 4.4 | Ngày gửi thông báo tiền phòng (25) · **hạn thanh toán (25 → 30)** · hình thức · **ngân hàng + số tài khoản nhận** | `CONTRACT_PAYMENT_TERM` | Đối chiếu tài khoản trên HĐ với **tài khoản nhận mặc định của tòa**; lệch → cảnh báo |
| 4.4.3 | **Nội dung chuyển khoản** nguyên văn | Mẫu nội dung CK | Chuẩn hóa về mã phòng để auto-match ở UI-13 hoạt động — xem bảng xung đột |
| 4.4.4 | **Phạt chậm trả**: mức/ngày · **mốc bắt đầu tính** · **số ngày tối đa** · hệ quả khi quá hạn | Điều khoản phạt | Lưu cả ba tham số; **không** ghi đè rule phạt của hệ thống |
| 5.2.4 / 6.2.5 | **Thời hạn bảo hành thiết bị** (10 ngày kể từ bàn giao) | Mốc theo dõi | Quyết định ai chịu chi phí sửa chữa → đầu vào khấu trừ hoàn cọc ở UI-16 |
| 6.2.5 | **Mức phạt làm bẩn tường** · **mức bồi thường khấu hao thiết bị tối thiểu** (khi thuê từ 3 tháng) | Tham số khấu trừ theo HĐ | Đây là **nguồn gốc của mức hao mòn mặc định** dùng ở phiếu hoàn cọc (P-16); trích để đối chiếu chứ không tự áp |
| 6.2.11 | **Số ngày báo trước khi chấm dứt** (30) | Điều khoản báo trước | So với mốc Work Queue của hệ thống |
| 6.2.12 | Nghĩa vụ cho khách mới xem phòng trong 30 ngày cuối | Ghi chú điều khoản | Liên quan trạng thái `Trống hết tháng` |
| 7.2 | Số bản hợp đồng · hiệu lực từ ngày ký | Metadata | |
| Cuối | Chữ ký hai bên · họ tên | Bằng chứng | Ảnh chữ ký giữ trong file nguồn |

**Xung đột giữa điều khoản trên hợp đồng và rule hệ thống — UI bắt buộc hiển thị, không tự chọn hộ**

Đây là phần quan trọng nhất của màn review: hợp đồng giấy và rule hệ thống **không trùng nhau**, và trích xuất đúng chữ thôi là chưa đủ.

| # | Hợp đồng mẫu ghi | Rule hệ thống đang dùng | Cách UI xử lý |
|---:|---|---|---|
| 1 | Không báo trước 30 ngày thì **mặc nhiên gia hạn** 12 tháng | Work Queue cảnh báo ở mốc **35 ngày**; gia hạn phải do người xác nhận (R-15, BR-2.06.18) | Hiển thị cả hai mốc; item vẫn vào Work Queue theo mốc hệ thống, **không tự tạo phiên bản gia hạn** |
| 2 | Phạt 200.000đ/ngày tính **từ ngày mùng 1 tháng sau**, tối đa **03 ngày** rồi đơn phương chấm dứt | Chuyển công nợ sau **5 ngày kể từ phát hành**, phạt từ ngày thứ 6, **không có trần** (R-13, P-09, P-17) | Lưu tham số của HĐ vào điều khoản; dòng phạt vẫn do hệ thống đề xuất theo rule chung, reviewer thấy được độ lệch |
| 3 | Hạn thanh toán **25 → 30** | Hạn **25 → ngày cuối tháng** (D-09) | Tháng 31 ngày sẽ lệch 1 ngày; cảnh báo nhẹ |
| 4 | Nước tính **120.000đ/người**, nhưng bảng bàn giao **có Đồng hồ nước** và Điều 4.2 lại ghi **Số nước 85 m³** | Có đồng hồ → tính theo m³; không có → theo người (BR-2.07.5) | **Mâu thuẫn nội tại trong chính hợp đồng.** UI bắt reviewer chọn dứt khoát cách tính nước, vì nó quyết định dòng 4 của mọi hóa đơn về sau |
| 5 | **Dịch vụ chung 120.000đ/người** gồm **4 thành phần**: máy giặt + **điện chung** + thu rác + vệ sinh chung | Combo 120.000đ tách thành vệ sinh 60.000 + máy giặt 60.000; **điện chung là dòng 12 riêng** tính theo công tơ (D-18, D-19, BR-2.07.4) | **Rủi ro thu điện chung hai lần.** UI phải cảnh báo đỏ và bắt reviewer xác định: điện chung đã nằm trong combo hay tính riêng theo công tơ |
| 6 | Nội dung CK `P302 - TH01 - TRAN MINH AN` | Nội dung CK = **mã phòng**, auto-match theo mã phòng + tài khoản nhận (R-12, BR-2.10.3) | Mã phòng hệ thống là `302TH01` còn HĐ ghi `P302` → phải chuẩn hóa khi sinh mẫu nội dung CK, nếu không đối soát sao kê ở UI-13 sẽ trượt |
| 7 | Tài khoản nhận là **BIDV – Nguyễn Thị Hằng** | Mỗi tòa có **một** tài khoản nhận mặc định, hóa đơn snapshot theo tòa (R-12, BR-2.03.4) | Đối chiếu tài khoản trên HĐ với tài khoản mặc định của tòa; lệch → cảnh báo để kế toán quyết định |
| 8 | **Chuyển nhượng hợp đồng cho người khác** kèm phí nhượng phòng | Chỉ có sự kiện `transfer` = **đổi phòng nội bộ của cùng khách** (D-26, R-18) | **Thiếu loại sự kiện**: đổi người thuê trên cùng phòng chưa có trong vòng đời HĐ → ghi nhận là hạng mục cần bổ sung, xem §18 |

**Field mỗi dòng OCR:** raw, normalized, confidence, trang/bbox, candidate, match score, quyết định `Create/Link/Update/Ignore`, giá trị cuối, reviewer. Tòa/phòng đối chiếu chủ nhà/HĐ nguồn; thiếu danh mục thì tạo ứng viên chờ xác nhận. Giá dịch vụ lệch phải chọn `Giá riêng HĐ / Cập nhật giá tòa từ ngày / Ignore`. Chỉ số điện/nước ghi rõ loại công tơ, thời điểm bàn giao và bằng chứng; OPENING phải được duyệt trước hóa đơn đầu tiên. PDF mẫu trang 1–2 minh họa rõ người thuê/phòng/tài sản/chỉ số/dịch vụ, nhưng giá trị trong file không được điền mặc định cho hợp đồng mới.

**Flow:** `Upload → Processing → Ready for review → Reviewing → Validate → Xem payload → Confirm commit → Committed`; lỗi `Failed/Commit failed` có Retry. Commit là một transaction; lỗi phải rollback toàn bộ. Upload cùng hash cảnh báo job cũ và không tạo HĐ trùng.

### UI-09 — Dịch vụ & bảng giá

**Phác họa màn hình**

```text
┌ Dịch vụ & bảng giá ───────── [+ Dịch vụ] [+ Giá] [Import] [Xem tại ngày ▾]┐
│ ① DANH MỤC DỊCH VỤ                                                        │
│ Mã              │Tên        │Đơn vị│Cách tính   │Giá mặc định │Metric      │
│ ELECTRIC        │Điện       │kWh   │chỉ số      │4.000        │ELECTRIC_REV│
│ WATER           │Nước       │ng/m³ │người|đồng hồ│120.000|35.000│WATER_REV  │
│ CLEANING        │Vệ sinh    │người │số người    │60.000       │CLEANING_REV│
│ INTERNET        │Mạng       │phòng │1 × giá     │100.000      │INTERNET_REV│
│ ELEVATOR        │Thang máy  │người │số người    │50–60.000    │ELEVATOR_REV│
│ PARKING_EV      │Gửi xe     │xe    │số xe       │150.000      │EV_REVENUE  │
│ WASHING         │Máy giặt   │người │số người    │60.000       │WASHING_REV │
│ COMBO_OTHER     │DV khác    │người │số người    │120.000      │→ tách đôi  │
│ COMMON_ELECTRIC │Điện chung │người │tự tính/kỳ  │—            │ELECTRIC_REV│
├───────────────────────────────────────────────────────────────────────────┤
│ ② BẢNG GIÁ HAI LỚP — đang xem: Tòa [G6 ▾] tại ngày [23/09/2026]           │
│ Dịch vụ  │Phạm vi │Đơn giá   │Hiệu lực từ–đến │Trạng thái │Người duyệt    │
│ Nước     │Tòa G6  │35.000/m³ │01/01/2026–     │Hiệu lực   │Kế toán        │
│ Nước     │Global  │120.000/ng│01/01/2025–     │Bị override│—              │
│ Thang máy│Tòa G6  │60.000/ng │01/01/2026–     │Hiệu lực   │Kế toán        │
│ Combo    │Tòa G6  │120.000/ng│01/01/2026–     │Hiệu lực   │Kế toán        │
│          └▸ △ HĐ 101G6 đang dùng giá riêng 130.000 — [Xem HĐ]             │
├───────────────────────────────────────────────────────────────────────────┤
│ ③ ĐƯỜNG ĐI CỦA GIÁ                                                        │
│   Giá mặc định hệ thống → Override theo tòa → Giá riêng trên HĐ           │
│   → SNAPSHOT vào hóa đơn khi phát hành (không đổi khi sửa bảng giá)       │
│ ④ [Preview: tòa nào đang dùng giá nào]   ⑤ [Tách combo → vệ sinh+máy giặt]│
└───────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Danh mục | Cột `Metric` cho thấy dịch vụ này lên dòng doanh thu nào ở báo cáo — giúp kiểm tra chéo khi đối soát |
| ② | Bảng giá hai lớp | Dòng bị override hiển thị mờ kèm nhãn để thấy rõ giá nào đang thực sự áp dụng. Mỗi dịch vụ × phạm vi × ngày **chỉ có 1 giá hiệu lực** |
| Cảnh báo | HĐ dùng giá riêng | Tòa G6 có hai mức combo khác nhau trên hai hợp đồng — bằng chứng cho quy tắc "mỗi HĐ một loại giá"; UI phải hiển thị được sự khác biệt này thay vì che đi |
| ③ | Đường đi của giá | Sơ đồ cố định nhắc thứ tự ưu tiên; sửa bảng giá **không** đổi hóa đơn đã phát hành và **không** đổi HĐ đang hiệu lực |
| ④ | Preview | Trả lời câu hỏi vận hành hay gặp nhất: "tòa nào đang dùng giá nào tại ngày nào" |
| ⑤ | Tách combo | Công cụ migration: chuyển dòng `DV khác 120.000` cũ thành vệ sinh 60.000 + máy giặt 60.000 cho HĐ mới |
| Điện chung | Dòng đặc biệt | Không có giá cố định; đơn giá/người mỗi kỳ = thành tiền công tơ chung ÷ tổng số người của tòa |

**Danh mục:** mã, tên, đơn vị, cách tính, metric, giá mặc định, trạng thái. Service chuẩn gồm điện, nước, vệ sinh, mạng, thang máy, xe điện/gửi xe, máy giặt, combo khác, điện chung.

**Bảng giá hai lớp.** Giá điện, nước và dịch vụ khác có thể cấu hình/import theo từng tòa (có giá mặc định toàn hệ thống); hóa đơn tự lấy phiên bản tòa có hiệu lực.

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

**Phác họa màn hình**

```text
┌ Điện nước & chỉ số ── Kỳ 09/2026 · Tòa T17 ─ [Gửi duyệt] [Import] [Ảnh] ┐
│ Kỳ ▾│Tòa ▾│Tầng ▾│Loại công tơ ▾│Trạng thái ▾│☐ Chỉ hiện bất thường      │
│ Ngày chốt của tòa: 22/09/2026 · Tiến độ nhập: 38/42 phòng               │
├─────────────────────────────────────────────────────────────────────────┤
│ ① BẢNG NHẬP THEO TÒA (editable)                                         │
│ Phòng │Công tơ  │Loại│ ② Chỉ số cũ         │Chỉ số mới│Sản lượng│Ảnh│TT  │
│ 101T17│101T17-E │ROOM│5.725 ⓘ HĐ T8 #4412 │[6.041  ] │  316    │[ảnh] │Nháp│
│ 102T17│102T17-E │ROOM│4.110 ⓘ HĐ T8 #4413 │[4.402  ] │  292    │[ảnh] │Nháp│
│ 103T17│103T17-E │ROOM│  —   △ chưa có nguồn│[      ] │   —     │   │✕   │
│ 104T17│104T17-E │ROOM│2.980 ⓘ OPENING 01/09│[3.150  ] │  170    │[ảnh] │Nháp│
├─────────────────────────────────────────────────────────────────────────┤
│ ③ CÔNG TƠ CẤP TÒA                                                       │
│ 000T17 │MAIN  │ 48.200 → 51.900 │ 3.700 kWh × 3.500 = 12.950.000        │
│        │      │ ⓘ chỉ đối chiếu NCC + thất thoát, KHÔNG lên hóa đơn     │
│ VS-CHUNG│COMMON│ 1.935 → 1.967  │ 32 kWh × 3.800 = 121.600              │
│        │      │ ÷ 3 người = 40.533 đ/người → dòng 12 hóa đơn            │
│ ④ Thất thoát = 3.700 − Σ phòng 3.412 − chung 32 = 256 kWh (6,9 %)       │
├─────────────────────────────────────────────────────────────────────────┤
│ ⑤ PHÒNG TRỐNG / KHÔNG THU ĐƯỢC                                          │
│ 401G3 │ 907 → 1.028 │ 121 kWh │ ghi chú "kh phá hđ" │ VACANT → chi phí   │
├─────────────────────────────────────────────────────────────────────────┤
│ ⑥ CHẶN & CẢNH BÁO                                                       │
│ ✕ 103T17: không tìm được chỉ số cũ → [Ghi chỉ số khởi tạo] [Thay công tơ]│
│ △ 205T17: sản lượng 612 kWh lệch +118 % so với TB 3 kỳ → yêu cầu ảnh    │
└─────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ② | Cột chỉ số cũ | **Không phải ô nhập tự do.** Hệ thống lấy chỉ số mới của hóa đơn hợp lệ gần nhất cùng công tơ và hiển thị nguồn (`kỳ – số hóa đơn – ngày chốt`) ngay cạnh, có link mở chứng từ. Hóa đơn đầu lấy chỉ số OPENING đã duyệt |
| ③ | Công tơ cấp tòa | Đặt chung một khối nhưng hai dòng có ghi chú khác nhau để không ai nhầm công tơ tổng thành công tơ tính tiền khách |
| ④ | Dòng thất thoát | Tính ngay trên màn: sản lượng tổng − Σ sản lượng phòng − sản lượng khu vực chung |
| ⑤ | Phòng trống | Ghi loại `VACANT`, **không tạo hóa đơn**, sinh dòng chi phí đề xuất sang UI-24 |
| ⑥ | Chặn & cảnh báo | Blocker (✕) phải xử lý xong mới phát hành được hóa đơn liên quan; cảnh báo (△) chỉ yêu cầu bổ sung ảnh. Không bao giờ tự lấy chỉ số của công tơ hoặc phòng khác |
| Ảnh | Cột đính kèm | Bắt buộc với chỉ số đầu (OPENING) và cuối (CLOSING) vì đây là bằng chứng khi tranh chấp hoàn cọc; chỉ số kỳ chỉ khuyến nghị |
| Trạng thái | Vòng đời | `Nháp → Chờ duyệt → Đã duyệt → Đã dùng hóa đơn`; hóa đơn chỉ lấy chỉ số **Đã duyệt** |

**Bộ lọc:** kỳ, tòa, tầng, trạng thái nhập/duyệt, loại meter, bất thường, thiếu ảnh. Bảng editable theo tòa/phòng.

**Cột/field:** phòng, khách/HĐ, meter code, loại và scope `ROOM/COMMON/MAIN`, reading type, ngày chốt, chỉ số cũ, mới, sản lượng, đơn giá, thành tiền tham khảo, số người, ảnh, người nhập, status, cảnh báo.

**Nguồn chỉ số cũ:** theo từng `meter_id`, ưu tiên `new_reading` của hóa đơn phòng hợp lệ gần nhất trước kỳ hiện tại (kể cả bản điều chỉnh được duyệt); hóa đơn đầu dùng OPENING của HĐ/bàn giao đã duyệt. Hiển thị `kỳ nguồn – số hóa đơn – chỉ số mới – ngày chốt` bên cạnh ô chỉ số cũ và link mở hóa đơn/chứng từ. Nếu chưa có nguồn, thiếu kỳ giữa, thay công tơ hoặc số mới nhỏ hơn số cũ, tạo blocker để người có quyền nhập chỉ số khởi tạo/thay công tơ hoặc xử lý điều chỉnh có lý do; không tự lấy chỉ số của công tơ/phòng khác.

**Action:** nhập dòng, paste/import, lấy chỉ số cũ từ hóa đơn kỳ trước, tải ảnh, lưu nháp, gửi duyệt, trả sửa, duyệt, thay công tơ/ghi nhận chỉ số khởi tạo có lý do, mở lại có lý do, export, mở lịch sử meter.

**Validation:** chỉ số mới ≥ cũ; không trùng meter+kỳ+reading type; cảnh báo lệch ±50%; OPENING/CLOSING bắt buộc ảnh, PERIODIC khuyến nghị (**ASSUMED**). Không mở lại nếu hóa đơn đã phát hành, trừ flow điều chỉnh của Kế toán.

**State:** reading `Nháp → Chờ duyệt → Đã duyệt → Đã dùng hóa đơn`; kỳ tòa `Đang nhập → Đã duyệt → Đã lập hóa đơn`.

### UI-11 — Kỳ hóa đơn

**Phác họa màn hình**

```text
┌ Kỳ hóa đơn / 2026-09 ────────── [Chạy preflight] [Tạo nháp hàng loạt] ┐
│ Tiền phòng cho tháng 09/2026 · Kỳ DV 23/07→22/08 · Chốt số 22/08      │
│ Phát hành dự kiến 23–25/08 · Hạn TT 25/08 → 31/08 · Trạng thái: Mở    │
├───────────────────────────────────────────────────────────────────────┤
│ ① TIẾN ĐỘ THEO TÒA                                                    │
│ Tòa │Phòng│Chỉ số duyệt│HĐ hiệu lực│Nháp│Phát hành│Blocker│Hành động   │
│ T17 │ 42  │ 42/42 ✓    │ 40        │ 40 │   0     │  0    │[Phát hành] │
│ T24 │ 38  │ 35/38 △    │ 36        │  0 │   0     │  3    │[Xem lỗi]   │
│ G6  │ 30  │ 30/30 ✓    │ 28        │ 28 │  28     │  0    │[Đã xong]   │
├───────────────────────────────────────────────────────────────────────┤
│ ② KẾT QUẢ PREFLIGHT                                    3 blocker · 5 △ │
│ ✕ T24/103: không tìm được chỉ số cũ — đứt kỳ           [Xử lý ▸]      │
│ ✕ T24/205: công tơ đã thay, chưa ghi chỉ số khởi tạo   [Xử lý ▸]      │
│ ✕ T24/311: chỉ số chờ TNVH duyệt                       [Nhắc duyệt]   │
│ △ T17/402: HĐ thiếu dịch vụ điện                        [Mở HĐ]        │
│ △ G6/101 : phòng thiếu số người                         [Mở HĐ]        │
│ △ Hóa đơn đã tồn tại cho 3 HĐ — sẽ bỏ qua, không tạo trùng            │
├───────────────────────────────────────────────────────────────────────┤
│ ③ DỰ KIẾN  Tổng hóa đơn 1.079 · Tổng cần đóng 6.482.150.000 đ         │
│ ④ [Tạo kỳ] [Gửi duyệt] [Phát hành] [Khóa kỳ] [Mở lại có lý do]        │
└───────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| Header | Ba mốc thời gian | Màn hình phải tách bạch: **tiền phòng của tháng nào**, **kỳ dịch vụ từ ngày nào**, **hạn thanh toán bao giờ** — vì chúng lệch nhau và là nguồn nhầm lẫn thường xuyên |
| ① | Tiến độ theo tòa | Cho phép phát hành **từng tòa**; tòa còn blocker vẫn không chặn tòa khác |
| ② | Preflight | Phân biệt rõ **blocker** (chặn phát hành) và **cảnh báo** (cho đi tiếp). Mỗi dòng có hành động xử lý trực tiếp |
| ③ | Dự kiến | Số tổng để kế toán ước lượng trước khi phát hành |
| ④ | Thanh hành động | Tạo hóa đơn **idempotent** theo HĐ + kỳ: chạy lại không sinh bản trùng |
| Ghi chú | Quan hệ kỳ | Kỳ hóa đơn và kỳ báo cáo là **hai đối tượng riêng**, chỉ liên kết với nhau bằng tháng |

**Danh sách:** mã kỳ, từ/đến, ngày chốt, phát hành dự kiến/thực tế, số tòa đã chốt chỉ số, số hóa đơn nháp/phát hành, status, blocker.

**Chi tiết/preflight:** tiến độ chỉ số theo tòa; HĐ thiếu giá/dịch vụ; phòng thiếu số người; reading bất thường; không tìm được chỉ số cũ từ hóa đơn trước/OPENING, đứt kỳ hoặc công tơ thay chưa xử lý; hóa đơn đã tồn tại; tổng số dự kiến. Action: tạo kỳ, chạy preflight, tạo nháp hàng loạt, gửi duyệt, phát hành, khóa/mở lại. Blocker chỉ số phải xử lý trước khi phát hành hóa đơn liên quan.

**Rule:** tạo invoice idempotent theo HĐ+kỳ; không sinh trùng. Kỳ hóa đơn và kỳ báo cáo là hai object riêng nhưng liên kết bằng tháng.

### UI-12 — Hóa đơn

**Phác họa màn hình**

```text
┌ Hóa đơn / 201G1 ───────────── [Điều chỉnh] [Gửi Zalo] [In PDF] [⋯] ┐
│ Kỳ 09/2026 · Đã phát hành · Tòa G1 · QL Đỗ Thuỳ Linh · 2 người     │
│ Ngày chốt số liệu 22/08/2026 · Hạn TT 25/08 → 31/08/2026           │
├────────────────────────────────────────────────────────────────────┤
│ ① 12 DÒNG CỐ ĐỊNH                      (số thật — Seed Data §6.2)  │
│ # │Dòng         │ SL  │ Đơn giá  │Hệ số │Thành tiền│Nguồn          │
│ 1 │Tiền phòng   │ 1kỳ │4.100.000 │30/30 │4.100.000 │giá chốt HĐ    │
│ 2 │Tiền cọc     │  —  │    —     │  —   │        0 │đã thu đủ      │
│ 3 │Điện         │ 183 │   4.000  │  1   │  732.000 │② xem dưới     │
│ 4 │Nước         │ 2ng │ 120.000  │30/30 │  240.000 │theo đầu người │
│ 5 │Vệ sinh      │  —  │    —     │  —   │        0 │gộp vào dòng 10│
│ 6 │Internet     │  1  │ 100.000  │30/30 │  100.000 │snapshot HĐ    │
│ 7 │Thang máy    │ 2ng │  60.000  │30/30 │  120.000 │snapshot HĐ    │
│ 8 │Gửi xe/xe điện│ 1  │ 150.000  │30/30 │  150.000 │1 xe điện      │
│ 9 │Máy giặt     │  —  │    —     │  —   │        0 │gộp vào dòng 10│
│10 │Combo/DV khác│ 2ng │ 120.000  │30/30 │  240.000 │snapshot HĐ    │
│11 │Nợ cũ        │  1  │    —     │  1   │        0 │kỳ 08 đã đủ    │
│12 │Điện chung   │ 2ng │  40.533  │  1   │        0 │✕ xem ⑦        │
│ + │Thu khác     │     │(diễn giải bắt buộc)        │        0      │
│─────────────────────────────────────────────────────────────────── │
│   Tổng DV 1.582.000 │ ③ TỔNG CẦN ĐÓNG 5.682.000 │ Đã đóng: Đủ      │
├────────────────────────────────────────────────────────────────────┤
│ ② DÒNG ĐIỆN — CHỈ SỐ NỐI KỲ                                        │
│  Chỉ số cũ  655 ◂── nguồn: hóa đơn kỳ 08/2026 cùng công tơ [Mở ▸]  │
│  Chỉ số mới 838 ◂── chỉ số kỳ 09 đã duyệt 22/08     [Mở chứng từ ▸]│
│  Sản lượng 183 kWh × 4.000 đ = 732.000 đ                           │
├────────────────────────────────────────────────────────────────────┤
│ ⑦ ✕ ĐIỆN CHUNG ĐÃ TÍNH NHƯNG CHƯA VÀO HÓA ĐƠN                      │
│  Công tơ chung tầng 2: 1.935 → 1.967 = 32 kWh × 3.800 = 121.600    │
│  ÷ 3 người sử dụng = 40.533,33 đ/người → phần của 201G1 = 81.067   │
│  Sổ tháng 9 tính ra số này nhưng KHÔNG cộng vào Tổng DV.            │
│  → Cần chốt: dòng 12 có thu hay đã nằm trong combo? (P-13, P-30)   │
├────────────────────────────────────────────────────────────────────┤
│ ④ THANH TOÁN  Nội dung CK: 201G1 · TK nhận: BIDV 2120368058        │
│    Đã thu đủ 5.682.000              [Xem payment ▸] [Xem công nợ ▸]│
│ ⑤ ZALO  Chưa gửi · template HOADON_THANG   [Xếp vào đợt gửi]       │
│ ⑥ AUDIT  v1 tạo 23/08 bởi Đỗ Thuỳ Linh                             │
└────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | 12 dòng cố định | Luôn render **đủ 12 dòng theo đúng thứ tự in**, dòng không phát sinh để 0 thay vì ẩn — để đối chiếu với sổ Excel theo hàng. Cột `Hệ số` hiện rõ `Ngày ở ÷ 30` hoặc `Ngày DV ÷ 30`; điện/nước theo đồng hồ hệ số 1 |
| ② | Khối chỉ số nối kỳ | Bắt buộc cho thấy **cả hai chỉ số và chứng từ nguồn của từng chỉ số**. Khi tạo kỳ sau, chỉ số mới của hóa đơn này thành chỉ số cũ mặc định của cùng công tơ |
| ⑦ | Khối điện chung chưa vào hóa đơn | Tình huống **có thật trong sổ tháng 9**: điện chung được tính ra đơn giá/người nhưng không cộng vào Tổng DV. Mockup phải phơi bày chỗ lệch này chứ không tự cộng vào hay bỏ qua — đây là đầu mối của P-13 và P-30 |
| ③ | Tổng cần đóng | `Tổng DV + Giá × Kỳ TT × (Ngày ở ÷ 30) + Nợ cũ + Cọc + Thu khác` |
| ④ | Thanh toán | Nội dung CK in ra **là mã phòng**; tài khoản nhận và mẫu in được snapshot tại thời điểm phát hành |
| ⑤ | Zalo | Hóa đơn phát hành mới được xếp vào đợt gửi; gửi thành công **không đồng nghĩa đã thanh toán** |
| ⑥ | Audit | Hóa đơn đã phát hành **không sửa tại chỗ**: sai thì tạo hóa đơn điều chỉnh âm/dương tham chiếu bản gốc, hoặc hủy khi chưa có payment |
| Trạng thái | Hai trục | Trạng thái chứng từ (`Nháp → Chờ duyệt → Phát hành → …`) tách khỏi tình trạng thu (`Chưa TT / Thiếu / Đủ / Thừa`) |

**Danh sách:** filter kỳ, scope, status chứng từ, tình trạng thu, hạn TT, Zalo, khoảng tiền. Cột: số hóa đơn, phòng/khách, kỳ, tiền phòng, dịch vụ, thu khác/phạt, cọc, điều chỉnh, tổng cần đóng, đã đóng, còn lại, hạn, trạng thái, Zalo.

**Chi tiết — theo mẫu hóa đơn T9/2026**

Bố cục dựa trên các sheet hóa đơn G16/G17/G18 trong workbook T9/2026. Mỗi phòng thể hiện mã/tòa/phòng/quản lý/kỳ thanh toán, cọc khách cũ, giá niêm yết, giá quản lý, giá phòng hiện tại, cọc, ngày ở/ngày dịch vụ, nợ cũ, thu khác, số người, điện/nước và các dịch vụ theo tòa; kèm tổng phải thu/đã thu/còn lại, hạn và thông tin chuyển khoản. Mỗi dòng khoản thu và tổng cộng rõ ràng; mẫu in có thể chọn theo tòa.

| Nhóm | Nội dung |
|---|---|
| Header | Số, kỳ, tòa/phòng, khách, HĐ, tài khoản nhận, nội dung CK |
| Dòng tiền phòng | Từ–đến, số ngày, đơn giá, prorate `/30` **ASSUMED** |
| Dịch vụ | Service, lượng, đơn giá snapshot theo tòa/HĐ và ngày hiệu lực, thành tiền, source reading |
| Dòng điện phòng | `meter_id`, kỳ, `old_reading`, `new_reading`, `consumption = new − old`, đơn giá snapshot, thành tiền, `source_reading_id`, `previous_invoice_id/line_id` hoặc OPENING; hiển thị rõ “Chỉ số cũ → Chỉ số mới” trên hóa đơn |
| Khác | Phạt, điều chỉnh, thu khác, lý do và người duyệt |
| Thanh toán | Allocation theo ngày/mốc, payment link, tổng thu/còn/thừa |
| Gửi | Zalo status, lần gần nhất, retry/fallback |
| Audit | version, điều chỉnh/hủy, actor, reason |

**12 dòng cố định — thứ tự in bắt buộc.** Mỗi dòng = `Đơn giá × Số lượng × Hệ số`; hệ số tiền phòng = `Ngày ở ÷ 30`, hệ số dịch vụ theo người/phòng = `Ngày DV ÷ 30`, điện/nước theo đồng hồ hệ số = 1 (R-09, D-14, mẫu số 30 còn chờ chốt → **P-03**).

| # | Dòng | Số lượng | Đơn giá mặc định | Hệ số | Cột sổ Excel |
|---:|---|---|---|---|---|
| 1 | Tiền phòng | Kỳ TT | Giá hiện tại | Ngày ở ÷ 30 | I × E × K/30 |
| 2 | Tiền cọc (khách mới/bổ sung) | 1 | Cọc phải thu − đã thu | 1 | J |
| 3 | Điện | CS mới − CS cũ | 4.000/kWh | 1 | P–T |
| 4 | Nước | m³ hoặc số người | 35.000/m³ · 120.000/người | Ngày DV ÷ 30 (khi theo người) | U–Y |
| 5 | Vệ sinh | Số người | 60.000 | Ngày DV ÷ 30 | Z–AB |
| 6 | Internet | 1 | 100.000/phòng | Ngày DV ÷ 30 | AC–AE |
| 7 | Thang máy | Số người | 50.000–60.000 | Ngày DV ÷ 30 | AF–AH |
| 8 | Gửi xe / xe điện | Số xe | 150.000 (Xanh SM 400.000) | Ngày DV ÷ 30 | AI–AK |
| 9 | Máy giặt | Số người | 60.000 | Ngày DV ÷ 30 | AL–AN |
| 10 | Combo / DV khác | Số người | 120.000 = 60.000 vệ sinh + 60.000 máy giặt | Ngày DV ÷ 30 | AO–AQ |
| 11 | Nợ cũ | 1 | Số dư kỳ trước | 1 | M |
| 12 | Điện chung | Số người | Đơn giá/người của kỳ (tự tính) | 1 | AR–AT |
| + | Thu khác (n dòng, có diễn giải) | | Thêm người/xe, phạt, đền bù, ngày lẻ khách mới | | N |

`Tổng cần đóng` = Tổng DV + Giá hiện tại × Kỳ TT × (Ngày ở ÷ 30) + Nợ cũ + Cọc + Thu khác.

Ví dụ kiểm thử `101T17` kỳ 09/2026: tiền phòng 3.600.000 + điện (6.041 − 5.725) = 316 kWh × 4.000 = 1.264.000 + nước 1 người × 120.000 + internet 100.000 + combo 120.000 → Tổng DV 1.604.000 → **Tổng cần đóng 5.204.000**.

**Action:** tạo nháp, thêm dòng, tính lại, gửi duyệt, phát hành, thu tiền, gửi Zalo, tạo điều chỉnh, hủy có điều kiện, in/PDF, export Excel đúng cột A–AZ. Hóa đơn phát hành không sửa trực tiếp; dùng adjustment/version.

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| `Contract + Room + Kỳ` chỉ có **1 hóa đơn hợp lệ** (không tính bản điều chỉnh/hủy); tạo batch phải idempotent | BR-2.09.3 | Đã chốt |
| Hóa đơn tháng N = tiền phòng tháng N (trả trước) + dịch vụ kỳ chốt ngày 22 tháng N−1 + nợ cũ + cọc/thu khác | BR-2.09.4, D-09 | Có bằng chứng nguồn |
| Kỳ TT = k > 1 → dòng tiền phòng = giá × k; (k−1) kỳ sau **không lập dòng tiền phòng**, chỉ dịch vụ | BR-2.09.5 | Có bằng chứng nguồn |
| Nợ cũ = số dư hóa đơn kỳ trước tại ngày lập; sau khi lập, hóa đơn kỳ trước **đóng lại** để không đếm nợ 2 lần | BR-2.09.6, D-16 | Đã chốt |
| Ngày lẻ tháng trước của khách mới = (giá + DV tháng) ÷ **31** × số ngày — xung đột với mẫu số 30 của dòng 1 | BR-2.09.7 → **P-03** | Cần chốt |
| Chặn phát hành khi reading điện (và nước nếu có đồng hồ) chưa duyệt hoặc điện chung tòa chưa tính | BR-2.09.8 | Cần chốt |
| Hóa đơn `Phát hành` **không sửa**; sai → tạo hóa đơn điều chỉnh (âm/dương) tham chiếu gốc, hoặc `Hủy` khi chưa có payment | BR-2.09.9, R-11 | Đã chốt |
| Tài khoản nhận và mẫu in **snapshot tại phát hành**; nội dung CK in = mã phòng | BR-2.09.10, R-12 | Có bằng chứng nguồn |
| Hạn TT = 25 → ngày cuối tháng phát hành; quá 5 ngày kể từ phát hành → công nợ | BR-2.09.11, R-13 | Đã chốt |
| Phạt trễ 200.000đ/ngày là **dòng thu khác đề xuất** trên hóa đơn kỳ sau: quản lý xác nhận/miễn → kế toán duyệt | BR-2.09.12 → **P-09** | Cần chốt |
| Chỉ hóa đơn từ `Phát hành` trở đi mới tính công nợ, DT phải thu và metric AC; `Nháp` không tính | BR-2.09.13 | Đã chốt |
| Hóa đơn đầu của khách mới lập **ngay khi kích hoạt HĐ**, không đợi ngày 22 | BR-2.09.14 | Có bằng chứng nguồn |
| Số người trên hóa đơn = số người HĐ tại ngày chốt; sửa tay trên nháp phải ghi lý do và **không cập nhật ngược** vào HĐ | BR-2.09.17 | Cần chốt |
| Kỳ báo cáo đã khóa: không phát hành/điều chỉnh vào kỳ đó; điều chỉnh ghi kỳ hiện tại kèm tham chiếu chứng từ gốc | BR-2.09.18, R-08 | Cần chốt |

**Ngoại lệ phải xử lý được trong mockup:** phòng thiếu reading thì hóa đơn phòng đó giữ `Nháp` còn batch vẫn phát hành phần còn lại; khách vào 28/08 (sau ngày chốt) sinh hóa đơn đầu riêng, hóa đơn tháng 9 chỉ có tiền phòng.

**Kế thừa chỉ số giữa các hóa đơn:** khi tạo nháp kỳ N+1, hệ thống lấy `new_reading` đã chốt trên dòng điện của hóa đơn hợp lệ gần nhất kỳ ≤N cho đúng `meter_id` làm `old_reading`; dòng điện trên hóa đơn N+1 lưu bản chụp cả hai chỉ số và ID nguồn. Nếu là hóa đơn đầu của công tơ, lấy OPENING đã duyệt. Nếu hóa đơn nguồn bị hủy/điều chỉnh, resolve bản hợp lệ cuối cùng và cảnh báo nháp phụ thuộc; hóa đơn đã phát hành không cập nhật ngầm mà đi qua adjustment. Dữ liệu cũ/mới và lineage phải còn xem được sau khi đổi giá dịch vụ, đổi khách hoặc thay công tơ.

**State:** `Nháp → Chờ duyệt → Phát hành → Thu một phần → Đã thu đủ`; nhánh điều chỉnh/hủy. Tình trạng thu: `Chưa TT/Thiếu/Đủ/Thừa`.

### UI-13 — Thu tiền

**Phác họa màn hình**

```text
┌ Thu tiền ──────────────── [Ghi nhận thu] [Import sao kê] [Auto match] ┐
│ Kỳ ▾│Tòa ▾│Quản lý ▾│TK nhận ▾│Phương thức ▾│Ngày ▾│☐ Chỉ chưa xác định│
├───────────────────────────────────────────────────────────────────────┤
│ ① DANH SÁCH PAYMENT                                                   │
│ Mã     │Ngày  │Kênh│TK nhận │Khách/Phòng│Số tiền  │Đã PB │Trạng thái  │
│ PM-8821│07/08 │CK  │VP-Hằng │401G1      │4.784.000│4.784k│Đã xác nhận │
│ PM-8822│07/08 │CK  │VP-Hằng │(chưa rõ)  │6.466.000│   0  │△ Chưa xác định│
│ PM-8830│09/08 │TM  │Huyền   │202G10     │4.175.000│4.175k│Chờ xác nhận│
├───────────────────────────────────────────────────────────────────────┤
│ ② CHI TIẾT PM-8822 — ghép thủ công                                    │
│  Nội dung CK gốc: "CK 204S12 THANG 9"                                 │
│  → Hệ thống nhận diện mã phòng: 204S12  → [Ghép vào hóa đơn ▸]        │
│  △ Tiền vào TK VP-Hằng nhưng tòa S12 mặc định TK Techcombank          │
│    → cho phép ghép, gắn cờ "sai TK"                                   │
├───────────────────────────────────────────────────────────────────────┤
│ ③ PHÂN BỔ (allocation)                            Payment 10.000.000  │
│  Thứ tự mặc định: nợ cũ → dịch vụ + điện chung → thu khác →           │
│                   tiền phòng → cọc            [Đổi thứ tự có lý do]   │
│  Hóa đơn        │Dòng           │ Số tiền   │ Còn lại                 │
│  HD-2608-0311   │Nợ cũ          │   220.000 │ 0                       │
│  HD-2609-0417   │7 dịch vụ      │ 1.604.533 │ 0                       │
│  HD-2609-0417   │Tiền phòng     │ 3.600.000 │ 0                       │
│  ─────────────────────────────────────────────────────────────────    │
│  Đã phân bổ 5.424.533 │ ④ Dư 4.575.467 → [Tạo credit tạm ứng]         │
├───────────────────────────────────────────────────────────────────────┤
│ ⑤ TIỀN MẶT CHỜ XÁC NHẬN                                               │
│  PM-8830 · Huyền thu 4.175.000 ngày 09/08                             │
│  ✕ CHƯA tính vào mốc M1/M2/M3 cho tới khi kế toán xác nhận đã nộp     │
│                                          [Kế toán xác nhận đã nộp]    │
└───────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Danh sách | Cột `Đã PB` (đã phân bổ) tách khỏi `Số tiền` để thấy ngay phần chưa gắn hóa đơn |
| ② | Ghép thủ công | Auto-match cần **cả hai điều kiện**: nội dung CK chứa mã phòng và đúng tài khoản nhận của tòa. Sai tài khoản vẫn ghép được nhưng phải gắn cờ |
| ③ | Phân bổ | Thứ tự mặc định là quy tắc **ảnh hưởng trực tiếp tới doanh thu CF theo dòng**: phòng phá HĐ chỉ đóng phần dịch vụ sẽ tự loại khỏi doanh thu tiền phòng. Kế toán đổi được nhưng bắt buộc nhập lý do |
| ④ | Phần dư | Thu thừa tạo credit tự khấu trừ vào hóa đơn kỳ sau; **không hoàn tiền mặc định** |
| ⑤ | Tiền mặt | Khối riêng có cảnh báo đậm vì đây là quy tắc dễ làm sai hiệu suất và lương của nhân viên |
| Ngày | Ngày thanh toán | Là ngày tiền vào tài khoản hoặc ngày nhận tiền mặt — **không dùng ngày nhập liệu**; quyết định mốc thu và tháng ghi nhận dòng tiền |
| `Đảo` | Hành động | Sinh bản ghi đảo âm cùng ngày, **không xóa** bản gốc; allocation liên quan hủy theo |

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

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Σ allocation của 1 payment ≤ số tiền payment; phần dư = **tạm ứng (credit)** gắn khách/HĐ | BR-2.10.1 | Đã chốt |
| 1 payment → n hóa đơn và 1 hóa đơn → n payment; thu một phần hợp lệ | BR-2.10.2, R-12 | Đã chốt |
| Auto-match: nội dung CK chứa mã phòng **và** đúng tài khoản nhận của tòa → đề xuất allocation vào hóa đơn mở **cũ nhất trước**; không match → `Chưa xác định`, không gán vào hóa đơn nào | BR-2.10.3 | Có bằng chứng nguồn |
| Thứ tự phân bổ mặc định vào dòng: **nợ cũ → 7 dịch vụ + điện chung → thu khác → tiền phòng → cọc**; kế toán đổi được cho từng payment kèm lý do | BR-2.10.4 → **P-14** | Cần chốt |
| Ngày thanh toán = ngày tiền vào tài khoản (sao kê) hoặc ngày nhận tiền mặt — **không dùng ngày nhập liệu**; là cơ sở mốc M1/M2/M3 và tháng CF | BR-2.10.5, D-47 | Đã chốt |
| Thu thừa → tình trạng `Thừa`, tạo credit tự khấu trừ vào hóa đơn kỳ sau; **không hoàn tiền mặc định** | BR-2.10.6 | Cần chốt |
| Allocation loại `cọc` đồng thời ghi bút toán `collect` vào Deposit Ledger | BR-2.10.7, R-05 | Đã chốt |
| Payment cho hóa đơn kỳ trước → doanh thu CF tại **tháng nộp**; AC chỉ giảm công nợ | BR-2.10.8, R-03 | Đã chốt / AC cần chốt |
| Reverse tạo bản ghi đảo âm cùng ngày đảo, **không xóa**; allocation liên quan hủy theo | BR-2.10.9 | Đã chốt |
| Tiền mặt NVVH ghi ở `Chờ xác nhận`; **chỉ payment `Đã xác nhận` mới vào mốc M1/M2/M3** | BR-2.10.10 → **P-26** | Cần chốt |
| Thu nợ của HĐ đã phá phân bổ vào hóa đơn cuối của HĐ đó, ghi doanh thu CF tháng thu, **không hồi tố hiệu suất** tháng cũ | BR-2.10.11 → **P-27** | Cần chốt |
| Tình trạng hóa đơn: `Chưa TT` (Σ = 0) / `Thiếu` (0 < Σ < cần đóng) / `Đủ` (=) / `Thừa` (>) | BR-2.10.12, D-20 | Có bằng chứng nguồn |
| Sau ngày chốt lương (16) payment vẫn ghi ngày thật; snapshot mốc **không tính lại** | BR-2.10.13, R-23 | Cần chốt |
| Payment có ngày thuộc kỳ đã khóa vẫn lưu nhưng đưa vào **kỳ hiện tại** dạng điều chỉnh | BR-2.10.14, R-08 | Cần chốt |

**Ngoại lệ phải xử lý được:** khách chuyển nhầm sang tài khoản tòa khác → vẫn match theo mã phòng nhưng gắn cờ "sai TK"; khách chuyển gộp 2 phòng → 1 payment sinh 2 allocation.

**Nghiệm thu màn hình:** import sao kê dòng nội dung `204S12` số tiền 6.466.000 vào TK VP-Hằng tự match đúng hóa đơn kỳ 9 và chuyển `Đủ`; 1 payment 10.000.000 phân bổ 2 hóa đơn theo đúng thứ tự nợ cũ trước; `101G4` thu thừa 240.000 sinh credit làm hóa đơn kỳ sau giảm 240.000; ngày thanh toán 07/08 rơi đúng vào mốc M10.

### UI-14 — Công nợ & phạt

**Phác họa màn hình**

```text
┌ Công nợ & phạt ────────────────────────── [Nhắc Zalo hàng loạt] [Xuất] ┐
│ ① [Theo hóa đơn][Theo khách][Theo phòng][Theo tòa][Theo QL][Nợ phá HĐ] │
│ Tuổi nợ ▾│Hạn TT ▾│Khoảng tiền ▾│Mốc thu ▾│Trạng thái phạt ▾           │
├────────────────────────────────────────────────────────────────────────┤
│ ② BẢNG CÔNG NỢ                                                         │
│ Khách/Phòng│Hóa đơn │Phát hành│Hạn TT│Tuổi│ Gốc      │Còn lại │Phạt ĐX │
│ 402G5      │…0402   │23/07    │31/07 │ 41 │10.048.000│10.048k │8.200k  │
│ 202G10     │…0310   │23/08    │31/08 │ 12 │ 4.395.000│  220k  │  —     │
│ 103T21     │…0298   │23/08    │31/08 │  6 │ 3.980.000│  980k  │  200k  │
│  ● >15 ngày   ● 6–15 ngày   ● ≤5 ngày   (kèm ký hiệu, không chỉ màu)   │
├────────────────────────────────────────────────────────────────────────┤
│ ③ CHI TIẾT 103T21                                                      │
│  Hóa đơn phát hành 23/08 → +5 ngày → chuyển công nợ 28/08              │
│  Phạt đề xuất từ ngày thứ 6: 1 ngày × 200.000 = 200.000                │
│  ④ Chuỗi duyệt phạt:                                                   │
│     [Hệ thống đề xuất] → [Quản lý xác nhận/Miễn] → [Kế toán duyệt]     │
│     → [Đưa vào dòng Thu khác của hóa đơn kỳ sau]                       │
│  Lịch sử liên hệ: 29/08 gọi — hẹn 05/09   [+ Ghi nhận liên hệ]         │
├────────────────────────────────────────────────────────────────────────┤
│ ⑤ TAB "NỢ PHÁ HĐ" — theo dõi riêng                                     │
│ Phòng │Quản lý│Ngày vào│Số th ở│Lý do            │Phải thu │Đã thu     │
│ 403G5 │Khải   │16/07   │ 1     │Không đủ tài chính│1.580.000│      0   │
│ 505G6 │Linh   │02/05   │ 3     │Bỏ trốn           │1.068.000│      0   │
│ 304T35│Huyền  │11/03   │ 5     │Nghỉ học về quê   │  536.000│ 500.000  │
│ ⓘ Thu hồi ở tháng sau: ghi doanh thu dòng tiền tháng thu,              │
│   KHÔNG hồi tố hiệu suất của tháng cũ                                  │
└────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | 6 chế độ xem | Cùng một tập dữ liệu, sáu lát cắt; lát `Theo quản lý` dùng để đôn đốc, lát `Nợ phá HĐ` là danh sách riêng |
| ② | Bảng công nợ | Tuổi nợ phân tầng ≤5 / 6–15 / >15 ngày, phân biệt bằng **ký hiệu kèm màu** chứ không chỉ màu |
| ③ | Diễn giải mốc | Màn hình phải **giải thích được cách ra con số phạt**, vì mốc tính 5 ngày và mốc bắt đầu phạt đang chờ khách chốt (P-17, P-09) |
| ④ | Chuỗi duyệt phạt | Bốn bước rời nhau; hệ thống **chỉ đề xuất**, không tự áp phạt vào hóa đơn |
| ⑤ | Nợ phá HĐ | Có lý do chuẩn theo danh mục (bỏ trốn, về quê/nghỉ học, chuyển chỗ làm, không đủ tài chính, báo tăng giá không ở, thợ xong công trình, khác) |
| Ghi chú | Hồi tố | Băng ghi chú cố định ở tab nợ phá HĐ để tránh việc tính lại hiệu suất tháng cũ khi thu hồi được nợ |

**Views:** Chi tiết hóa đơn, Theo khách, Theo phòng, Theo tòa, Theo quản lý, Nợ phá HĐ. Filter tuổi nợ, hạn, amount, mốc thu, penalty status.

**Cột:** khách/phòng/HĐ/hóa đơn, ngày phát hành, hạn TT, tuổi nợ, gốc, đã thu, còn lại, phạt đề xuất, liên hệ gần nhất, owner, status.

**Action:** mở hóa đơn, thu tiền, ghi nhận liên hệ, đề xuất phạt, xác nhận/miễn, duyệt phạt, đưa vào hóa đơn kỳ sau, xóa nợ có phê duyệt, Zalo nhắc, export.

**Rule ASSUMED:** chuyển công nợ sau 5 ngày từ ngày phát hành; phạt 200.000đ/ngày từ ngày thứ 6; không có trần mặc định nhưng ưu tiên điều khoản HĐ. Phạt qua chuỗi `Đề xuất → Xác nhận/Miễn → Đã duyệt → Đã lên hóa đơn`.

Nợ phá HĐ thu tháng sau giảm kỳ gốc nhưng không tính vào hiệu suất kỳ nào; CF ghi tháng thực thu.

### UI-15 — HĐ sắp hết/Gia hạn/Kết thúc

**Phác họa màn hình**

```text
┌ HĐ sắp hết hạn ───────── 74 việc · 31 chưa xác nhận ── [Xuất] [Nhận việc]┐
│ Còn ▾│Tòa ▾│Quản lý ▾│Kết quả ▾│☐ Chỉ việc của tôi                      │
├─────────────────────────────────────────────────────────────────────────┤
│ ① HÀNG ĐỢI 35 NGÀY                                                      │
│ HĐ      │Khách     │Phòng │Hết hạn  │Còn│Công nợ│Liên hệ  │Kết quả      │
│ …0442   │Ng. T. Mai│302G6 │30/08/27 │ 26│   0   │25/07 gọi│Chưa phản hồi│
│ …0398   │Trần V. B │101T17│15/10/26 │ 22│ 980k  │—        │● Chưa xử lý │
│ …0377   │Lê T. C   │204S12│05/10/26 │ 12│   0   │20/09 nt │Sẽ gia hạn   │
├─────────────────────────────────────────────────────────────────────────┤
│ ② HÀNH ĐỘNG TRÊN TỪNG VIỆC                                              │
│  [Ghi nhận liên hệ] [Đặt deadline] [Chưa phản hồi]                      │
│  [→ Gia hạn]  [→ Kết thúc đúng hạn]  [→ Chấm dứt sớm / Phá HĐ]          │
├─────────────────────────────────────────────────────────────────────────┤
│ ③ LUỒNG GIA HẠN                                                         │
│  Chọn Gia hạn → tạo PHIÊN BẢN MỚI nối tiếp (từ = ngày kết thúc cũ + 1)  │
│  → sao chép khách / dịch vụ / cọc                                       │
│  → cho sửa thời hạn, giá, điều khoản                                    │
│  → duyệt giá nếu thấp hơn giá QL → kích hoạt tại ngày hiệu lực          │
│  ⓘ KHÔNG thu cọc mới nếu chuyển tiếp cọc · Mã khách giữ nguyên          │
├─────────────────────────────────────────────────────────────────────────┤
│ ④ LUỒNG KẾT THÚC — 7 bước, UI dẫn tuần tự                               │
│  1 Xác nhận loại/ngày/lý do                                             │
│  2 Nhập chỉ số CLOSING + ảnh (bắt buộc)                                 │
│  3 Lập hóa đơn cuối (tiền phòng theo ngày nếu hết giữa tháng)           │
│  4 Đối chiếu công nợ còn lại                                            │
│  5 Nhập khấu trừ được phép                                              │
│  6 Tạo phiếu hoàn cọc nháp → chuyển UI-16                               │
│  7 Phòng sang "Chờ dọn" từ ngày ra                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ ⑤ PHÂN BIỆT KẾT THÚC vs PHÁ HĐ                                          │
│  Kết thúc đúng hạn / trả sớm CÓ báo → quyết toán bình thường, hoàn cọc  │
│  Rời không báo HOẶC rời trước ngày hết HĐ → PHÁ HĐ: mất cọc theo HĐ,    │
│  không tính tiền phòng các tháng còn lại, nợ theo dõi ở tab nợ phá HĐ   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Hàng đợi | Sinh tự động khi còn ≤ 35 ngày tới ngày kết thúc **của phiên bản đang hiệu lực**; mốc 35 ngày áp dụng toàn hệ thống |
| ② | Hành động | Ba kết quả nghiệp vụ khác nhau được tách thành ba nút riêng, không gộp vào một dropdown, để tránh chọn nhầm |
| ③ | Gia hạn | Tạo phiên bản mới **chứ không sửa phiên bản cũ**; phiên bản cũ vẫn đọc được. Điều khoản tự gia hạn trong HĐ chỉ sinh cảnh báo, hệ thống **không tự gia hạn** |
| ④ | Kết thúc | Bảy bước hiển thị dạng checklist có tiến độ; không cho nhảy bước vì hóa đơn cuối phụ thuộc chỉ số CLOSING |
| ⑤ | Bảng phân biệt | Đặt ngay trên màn vì đây là chỗ hay phân loại sai, dẫn tới sai cả cọc lẫn số đếm trên báo cáo |

**Danh sách công việc:** HĐ, khách và người ở, phòng/tòa, quản lý, ngày hết, còn N ngày, công nợ, liên hệ gần nhất, kết quả, deadline, assignee, priority.

**Action:** nhận việc, ghi nhận liên hệ, đặt deadline, `Gia hạn`, `Kết thúc đúng hạn`, `Chấm dứt sớm/Phá HĐ`, `Chưa phản hồi`, export.

**Flow gia hạn:** chọn Gia hạn → tạo version/HĐ mới → sao chép khách/dịch vụ/cọc → cho phép sửa thời hạn/giá/điều khoản → review/duyệt → active tại effective date. Không tạo cọc mới nếu chuyển tiếp cọc.

**Flow kết thúc:** xác nhận loại/ngày/lý do → nhập CLOSING + ảnh → lập hóa đơn cuối → đối chiếu công nợ → khấu trừ được phép → tạo phiếu hoàn cọc nháp → phòng sang Chờ dọn từ ngày ra.

### UI-16 — Cọc & hoàn cọc

**Phác họa màn hình**

```text
┌ Hoàn cọc / RF-2609-0022 · 301T41 ──────── [Gửi duyệt] [Trả sửa] [Hủy] ┐
│ Nháp · HĐ CT-2025-0188 · Khách Phạm V. D · Ngày ra 18/09/2026         │
├───────────────────────────────────────────────────────────────────────┤
│ ① SỔ CỌC (Deposit Ledger — bất biến, sửa bằng bút toán điều chỉnh)    │
│ Ngày      │Loại bút toán│ Số tiền    │ Chứng từ   │ Số dư             │
│ 01/06/2025│collect      │ +3.800.000 │ PM-4412    │ 3.800.000         │
│ 18/09/2026│refund (dự)  │ −3.800.000 │ RF-…0022   │ 0                 │
├───────────────────────────────────────────────────────────────────────┤
│ ② WIZARD HOÀN CỌC — 6 bước          ●━━●━━●━━○━━○━━○                  │
│ 1 Chọn HĐ ở Chờ quyết toán → cọc đang giữ 3.800.000                   │
│ 2 Xác nhận hóa đơn cuối & công nợ được phép bù trừ                    │
│ 3 Nhập khấu trừ:                                                      │
│   Hạng mục        │ Mặc định  │ Thực tế   │ Chứng từ                  │
│   Hao mòn/phòng   │  200.000  │  200.000  │ —                         │
│   Dọn vệ sinh     │  100.000  │  100.000  │ ảnh                       │
│   Sơn phòng       │300–500.000│  350.000  │ ảnh + báo giá             │
│   Sửa chữa        │  thực tế  │  420.000  │ hóa đơn thợ               │
│   Tiền phòng tháng cuối │ — │ 0 │ ⓘ khách ĐÃ đóng → không trừ         │
│   7 dịch vụ tháng cuối │ — │ 186.000 │ từ hóa đơn cuối                │
│ 4 Kiểm tra tài sản bàn giao / chỉ số CLOSING                          │
│ 5 ③ TÍNH: Thực hoàn = 3.800.000 − 1.256.000 = 2.544.000               │
│ 6 Gửi duyệt → Admin/Kế toán duyệt → ghi đã hoàn + chứng từ            │
├───────────────────────────────────────────────────────────────────────┤
│ ④ TRƯỜNG HỢP ÂM                                                       │
│  Nếu khấu trừ > cọc → Thực hoàn < 0 → chuyển thành CÔNG NỢ KHÁCH,     │
│  KHÔNG ghi doanh thu âm                                               │
│ ⑤ ẢNH HƯỞNG BÁO CÁO                                                   │
│  Dòng tiền: trừ khỏi doanh thu tại THÁNG THỰC CHI (không phải tháng   │
│  kết thúc HĐ) · Kinh doanh: khoản khấu trừ ghi Thu nhập khác,         │
│  chi phí sửa chữa vẫn ghi đủ — KHÔNG bù trừ                           │
└───────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Sổ cọc | Ledger **bất biến**: mọi điều chỉnh là bút toán mới, không sửa dòng cũ |
| ② | Wizard 6 bước | Bước 3 có cột `Mặc định` và `Thực tế` cạnh nhau để người lập thấy mình đang lệch khỏi mức chuẩn bao nhiêu; mức mặc định là tham số theo tòa (P-16) |
| Dòng tiền phòng | Quy tắc riêng | Tiền phòng tháng cuối **chỉ trừ vào cọc khi khách chưa đóng**; UI hiện ghi chú ngay trên dòng để người lập không trừ hai lần |
| ③ | Ô tính | Công thức hiển thị tường minh, không phải con số rơi từ trên trời |
| ④ | Trường hợp âm | Khối cảnh báo riêng vì đây là chỗ dễ làm âm hóa doanh thu |
| ⑤ | Ảnh hưởng báo cáo | Nêu rõ khác biệt giữa hai biến thể báo cáo ngay tại màn tạo chứng từ |
| Duyệt | Quyền | **Chỉ Admin/Kế toán** được duyệt; trạng thái `Nháp → Chờ duyệt → Đã duyệt → Đã hoàn` |

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

**Phác họa màn hình**

```text
┌ Zalo ZNS ─────────────────── [Cấu hình] [Lịch sử] [+ Tạo đợt gửi] ┐
│ ① RULE GỬI TỰ ĐỘNG                                                │
│ Tên rule        │Sự kiện        │Điều kiện      │Thời điểm│Trạng thái│
│ Nhắc hóa đơn    │Hóa đơn phát   │mọi hóa đơn    │+0 ngày  │Hiệu lực │
│ Nhắc trước hạn  │Đến hạn TT     │còn dư nợ > 0  │−2 ngày  │Hiệu lực │
│ Nhắc quá hạn    │Quá hạn TT     │còn dư nợ > 0  │+1,+5 ngày│Hiệu lực│
│ Báo hoàn cọc    │Hoàn cọc đã chi│—              │+0 ngày  │Nháp     │
│  ⓘ Công cụ tự đặt điều kiện + thời điểm, không phải danh sách cứng │
├───────────────────────────────────────────────────────────────────┤
│ ② TẠO ĐỢT GỬI — preview trước khi bấm gửi                         │
│  Sự kiện [Nhắc quá hạn ▾] · Kỳ [09/2026 ▾] · Phạm vi [Tòa T17 ▾]  │
│  ✓ Đã lấy lại công nợ lúc 09:14 (ngay trước khi gửi)              │
│  ┌──────────────┬───────┬────────────────────────────────────┐    │
│  │ Đủ điều kiện │  38   │ sẽ gửi                             │    │
│  │ Bỏ qua       │  12   │ đã thu đủ → skip                   │    │
│  │ Không gửi được│   4  │ △ khách chưa liên kết Zalo         │    │
│  │              │       │ → [Phương án dự phòng: gọi/SMS]    │    │
│  └──────────────┴───────┴────────────────────────────────────┘    │
│                                   [Hủy]  [Gửi 38 tin]             │
├───────────────────────────────────────────────────────────────────┤
│ ③ LỊCH SỬ TIN                                                     │
│ Batch  │Template    │Khách/Phòng│Nợ lúc gửi│Trạng thái│Retry│Phản hồi│
│ B-0912 │NHACNO_QH   │402G5      │10.048.000│Sent      │ 0   │—      │
│ B-0912 │NHACNO_QH   │103T21     │   980.000│Failed    │ 2   │—      │
│ B-0911 │HOADON_THANG│101T17     │ 5.204.533│Sent      │ 0   │"ok em"│
│                        ④ [Gửi lại các tin đủ điều kiện] [Tải log] │
├───────────────────────────────────────────────────────────────────┤
│ ⑤ PHẢN HỒI KHÁCH → về TRƯỞNG PHÒNG phụ trách, có đồng bộ hội thoại│
└───────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Rule gửi | Khách đã chốt dùng **công cụ tự đặt điều kiện + thời điểm linh hoạt**, không phải bật/tắt các loại sự kiện cố định — nên UI là bảng rule tạo được, không phải danh sách checkbox |
| ② | Preview đợt gửi | Bắt buộc **lấy lại công nợ ngay trước khi gửi** để không nhắc nhầm khách đã thanh toán; ba nhóm eligible/skipped/error hiện trước khi bấm gửi |
| Dự phòng | Khách chưa liên kết | Có đường dẫn sang phương án dự phòng thay vì im lặng bỏ qua |
| ③ | Lịch sử | Lưu **công nợ tại thời điểm gửi** để đối chiếu khi khách khiếu nại nội dung tin |
| ④ | Retry | Chỉ gửi lại tin đủ điều kiện, có giới hạn số lần, không gửi lại tin đã `Skipped` |
| ⑤ | Phản hồi | Định tuyến về trưởng phòng phụ trách; hội thoại đồng bộ vào hệ thống |
| Kênh | ZNS | Dùng ZNS để Timehouse chủ động gửi kể cả khi khách chưa quan tâm OA; mỗi mẫu tin phải đăng ký và chờ Zalo duyệt trước |

**Cấu hình:** OA/template, loại sự kiện, điều kiện, lịch gửi, cooldown, retry, recipient fallback, trạng thái rule. Không lưu secret dạng rõ trong UI.

**Tạo đợt gửi:** sự kiện/kỳ/scope → hệ thống dựng danh sách → re-check công nợ ngay trước xác nhận → preview eligible/skipped/error → gửi.

**Danh sách/chi tiết tin:** batch code, template, người tạo, scheduled/sent; khách/phòng, công nợ tại lúc gửi, status, provider code, số retry, thời gian, phản hồi, assignee.

**Action:** tạo batch, preview, gửi, retry eligible, dừng batch chưa chạy, tải log, mở khách/hóa đơn, gán phản hồi cho TPVH. Gửi thành công không đồng nghĩa đã thanh toán.

**State:** `Scheduled → Sent/Failed → Retrying → Sent/Gave up → Fallback`; `Skipped` khi đã thu đủ. Rule `Nháp → Hiệu lực → Tắt`.

---

## 10. Đặc tả màn hình chi tiết — Nhân sự và lương

### UI-18 — Cơ cấu tổ chức

**Phác họa màn hình**

```text
┌ Cơ cấu tổ chức ───────────── ① Xem tại ngày [23/09/2026 ▾] [+ Đơn vị] ┐
│ ② CÂY TỔ CHỨC              │ ③ CHI TIẾT ĐƠN VỊ: OPS-KV1              │
│                            │                                         │
│ ▾ Công ty TIMEHOUSE        │  Mã      OPS-KV1                        │
│   ├ Quản lý tổng (Admin)   │  Tên     Nhóm vận hành / Khu vực 1       │
│   ▾ Phòng Vận hành  [TPVH] │  Loại    [TEAM ▾]                       │
│     ├ ● KV1  [TNVH: Huy]   │  Cha     Phòng Vận hành                 │
│     ├   KV2  [TKV: Nga]    │  Khu vực [Mỹ Đình ▾] ← nguồn bộ lọc     │
│     ├   Tổ Kỹ thuật        │  Hiệu lực 01/01/2025 –                  │
│     └   Tổ Vệ sinh         │  Trạng thái ● ACTIVE                    │
│   ├ Phòng Tài chính–Kế toán│                                         │
│   ├ Phòng Kinh doanh  X-05 │ ④ TIMELINE LEAD (không ghi đè)          │
│   └ Phòng Thị trường  X-05 │  01/2025–08/2026  Lê V. K   Đã kết thúc │
│                            │  09/2026–         Trần Q.Huy ● Hiệu lực │
│                            │  01/2027–         (chưa có)  Sắp tới    │
│                            │            [Bổ nhiệm / Thay Lead]       │
│                            │ ⑤ NHÂN SỰ THUỘC ĐƠN VỊ: 7 NVVH [Xem ▸]  │
│                            │ ⑥ SỐ PHÒNG DƯỚI QUYỀN: 408 (snapshot 15)│
│                            │    → lương trưởng nhóm 408 × 10.000     │
└────────────────────────────┴─────────────────────────────────────────┘
 ⑦ Cascading filter sinh ra từ màn này, dùng lại ở MỌI màn khác:
    Khu vực → Trưởng nhóm → Quản lý → Tòa → Loại nhà (T/S/G, L1–L3)
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Xem tại ngày | Điều khiển quan trọng nhất của màn: cây là dữ liệu **có hiệu lực theo thời gian**, xem ngày khác cho kết quả khác |
| ② | Cây | Các phòng ngoài khối Vận hành vẫn có mặt để phân quyền và lọc, nhưng gắn nhãn `X-05` cho biết lương của họ ngoài phạm vi Phase 1 |
| ③ | Chi tiết | `Khu vực` là thuộc tính gắn ở cấp TEAM/AREA và là **nguồn của bộ lọc "Khu vực"** ở toàn hệ thống |
| ④ | Timeline Lead | Mỗi đơn vị **đúng một Lead hiệu lực**; bổ nhiệm mới tự đóng dòng cũ vào ngày liền trước. Ba trạng thái `Đã kết thúc / Hiệu lực / Sắp tới` hiện theo ngày đang xem |
| ⑤ | Nhân sự | Chỉ đọc, link sang UI-19 |
| ⑥ | Số phòng dưới quyền | Hiển thị kèm cách tính vì đây là **mẫu số riêng**, khác số phòng tính hiệu suất — và đang chờ khách chốt (P-12) |
| ⑦ | Băng cascading | Nhắc rằng bộ lọc chuẩn của cả hệ thống sinh ra từ màn này kết hợp với UI-20 |
| Ràng buộc | Khi ngừng đơn vị | Chặn nếu còn đơn vị con hoặc nhân viên có phân công hiệu lực; cây không được có chu trình |

**Module nguồn:** M-3.01 · **Entity:** `ORG_UNIT`, `ORG_UNIT_LEAD_HISTORY`, `POSITION`.

**Mục tiêu:** cây tổ chức có lịch sử theo ngày hiệu lực, phục vụ 3 việc — xác định Lead của từng đơn vị, làm trục cho cascading filter toàn hệ thống, và phân quyền theo đơn vị. Cây tổ chức **không** quyết định ai quản lý tòa nào; việc đó thuộc UI-20 (R-33).

**Layout:** cây tổ chức bên trái, thông tin đơn vị và timeline Lead bên phải; bắt buộc có control `Xem tại ngày` (mặc định hôm nay, chọn được quá khứ/tương lai) vì cây là dữ liệu có hiệu lực theo thời gian.

**Cây mẫu Phase 1** — mockup phải dựng được đúng hình này:

```text
Công ty (HT CCMN TIMEHOUSE)
├─ Quản lý tổng (Admin)
├─ Phòng Vận hành ── Lead: TPVH
│  ├─ Nhóm vận hành / Khu vực 1 ── Lead: TNVH ── NVVH: …
│  ├─ Nhóm vận hành / Khu vực 2 ── Lead: TNVH/Trưởng khu vực ── NVVH: …
│  ├─ Tổ Kỹ thuật
│  └─ Tổ Vệ sinh
├─ Phòng Tài chính – Kế toán
├─ Phòng Kinh doanh (lương ngoài phạm vi X-05)
└─ Phòng Thị trường (lương ngoài phạm vi X-05)
```

**Field đơn vị:** `code` (`OPS`, `OPS-KV1`, `TECH`, `CLEAN`, `FIN`, `SALES`, `MKT`), tên, `type` (`COMPANY`/`DEPARTMENT`/`TEAM`/`AREA`), đơn vị cha, `area_code` (khu vực địa lý — nguồn của bộ lọc "Khu vực"), Lead đang hiệu lực, effective from/to, trạng thái, mô tả.

**Dòng Lead (lịch sử riêng, không ghi đè):** đơn vị, nhân viên, effective from/to không chồng lấn, số quyết định, lý do, người tạo/người duyệt.

**Chức danh (`POSITION`):** mã (`TPVH`, `TNVH`, `TKV`, `NVVH`, `KT`, `VS`, `KETOAN`, `TNKD`, `NVKD`, `SALE`, `ADMIN`), `management_level` (0 nhân viên · 1 trưởng nhóm/khu vực · 2 trưởng phòng · 3 quản lý tổng), loại đơn vị được gán, cờ `is_ops_payroll` quyết định nhân sự đó có được tính lương ở UI-22 hay thuộc X-05.

**Action:** tạo/sửa đơn vị, di chuyển đơn vị (kiểm tra vòng lặp), bổ nhiệm/thay Lead, lập thay đổi có hiệu lực tương lai, ngừng đơn vị, xem nhân sự/tòa thuộc đơn vị, xem lịch sử, export cây + lịch sử Lead.

**State:** `PLANNED → ACTIVE → INACTIVE` (`PLANNED` tự chuyển `ACTIVE` khi đến ngày hiệu lực; `INACTIVE` không quay lại, cần tạo đơn vị mới). Dòng Lead hiển thị `Sắp tới` / `Hiệu lực` / `Đã kết thúc` theo ngày đang xem.

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Mỗi đơn vị có **đúng một Lead** hiệu lực tại một thời điểm; bổ nhiệm mới tự đóng Lead cũ vào ngày liền trước | BR-3.01.1 | Đã chốt |
| Lịch sử Lead **không ghi đè** — mọi thay đổi tạo dòng mới, giữ nguyên dòng cũ | BR-3.01.2 | Đã chốt |
| Cây không có chu trình; đơn vị cha phải `ACTIVE` tại ngày hiệu lực của đơn vị con | BR-3.01.3 | Đã chốt |
| Thay đổi hiệu lực tương lai **không tác động** trước ngày đó (cây hôm nay, quyền, cascading filter giữ nguyên) | BR-3.01.4 | Đã chốt |
| Chặn ngừng đơn vị còn đơn vị con hoặc nhân viên có phân công hiệu lực | BR-3.01.5 | Cần chốt |
| "Khu vực" là `area_code` gắn ở đơn vị cấp `TEAM`/`AREA` khối Vận hành; trưởng khu vực = Lead đơn vị đó; 1 NVVH thuộc đúng 1 khu vực tại một thời điểm | BR-3.01.6 | Cần chốt |
| **Cascading filter chuẩn** dùng lại ở mọi màn: Khu vực → Trưởng nhóm → Quản lý → Tòa → Loại nhà (T/S/G, L1–L3); chọn cấp trên thu hẹp cấp dưới; cặp Quản lý → Tòa lấy từ UI-20 tại ngày xem | BR-3.01.7, R-34 | Đã chốt |
| Đơn vị Kinh doanh/Kỹ thuật/Thị trường/TC-KT **có mặt trong cây** để phân quyền và lọc, nhưng lương thuộc X-05 | BR-3.01.8 | Đã chốt |
| Chỉ Admin sửa cây và bổ nhiệm Lead; TPVH chỉ tạo đề xuất dạng nháp trong khối Vận hành | BR-3.01.9 | Cần chốt |
| Lead phải là nhân viên `PROBATION`/`ACTIVE` có `management_level ≥ 1` | BR-3.01.10 | Cần chốt |
| **Số phòng "dưới quyền"** của Lead = Σ tổng phòng đang quản lý (kể cả trống) của các tòa do NVVH thuộc đơn vị đó phụ trách chính, đệ quy xuống đơn vị con, lấy tại snapshot ngày 15; TPVH tính toàn hệ thống. Đây là **mẫu số riêng**, khác số phòng tính hiệu suất (774 + 408 = 1.182 > 1.079 của tháng 8) | BR-3.01.11, R-22 → **P-12** | Cần chốt |

**Ngoại lệ:** Lead nghỉ việc trước khi có người thay → đơn vị vào trạng thái "thiếu Lead", Work Queue cảnh báo Admin; phân công tòa và lương hiệu suất của NVVH không bị ảnh hưởng, riêng lương trưởng nhóm kỳ đó = 0 cho vị trí trống.

**Nghiệm thu màn hình:** dựng được cây 6 nhánh ở trên; xem cây tại 01/08/2026 và 01/10/2026 cho kết quả khác nhau khi có bổ nhiệm hiệu lực 01/09; thay Lead một nhóm sinh 2 dòng lịch sử không chồng ngày và bộ lọc "Trưởng nhóm" ở màn tòa trả về đúng danh sách NVVH mới từ ngày hiệu lực; không tạo được chu trình cha–con; không ngừng được đơn vị còn nhân viên.

### UI-19 — Nhân sự

**Phác họa màn hình**

```text
┌ NV-021 · Nguyễn Thị Thương Huyền ────── [Sửa] [Điều chuyển] [⋯] ┐
│ NVVH · Level NVVH-1 · KV1 · Đang làm từ 01/03/2024 · Là cổ đông ✓│
├──────────────────────────────────────────────────────────────────┤
│ ① Tổng quan│Phân công│Cấu phần lương│Kỳ lương│Hồ sơ│Lịch sử       │
├──────────────────────────────────────────────────────────────────┤
│ ② HỒ SƠ     Mã NV-021 (không tái sử dụng) · CCCD · SĐT · Email   │
│ ③ VIỆC LÀM  Vào 01/03/2024 · Chính thức 01/06/2024 · Nghỉ —      │
│             Chức danh [NVVH ▾] · Level [NVVH-1 ▾] · Đơn vị KV1   │
│             Lead: Trần Quang Huy                                 │
│ ④ NGÂN HÀNG Techcombank · 1903****21 · mặc định ✓ [Lịch sử]      │
│ ⑤ CHỈ SỐ    Đang quản lý 9 tòa / 135 phòng  ⓘ tính động          │
│             HS tạm tính kỳ 09: 90,3 %                            │
├──────────────────────────────────────────────────────────────────┤
│ ⑥ CẤU PHẦN LƯƠNG — theo Level NVVH-1, hiệu lực 01/01/2026        │
│  Lương cơ bản        0        ⓘ NVVH thu nhập chính từ hiệu suất │
│  Phụ cấp ăn trưa     500.000                                     │
│  Phụ cấp xăng xe     500.000                                     │
│  Lương trưởng nhóm   0        (chỉ TPVH/TNVH)                    │
│  Lương hỗ trợ        2.000.000  ← nhập tay theo kỳ, BẮT BUỘC lý do│
│  Cột đơn giá/phòng   bậc 1 (130k tại ngưỡng 100)                 │
│  [Tạo phiên bản mới có ngày hiệu lực]  ⓘ không sửa đè phiên bản  │
├──────────────────────────────────────────────────────────────────┤
│ ⑦ CẢNH BÁO KHI NGHỈ VIỆC (preview trước khi lưu)                 │
│  Nhập ngày nghỉ 31/10/2026 sẽ:                                   │
│   • kết thúc 9 phân công tòa vào 31/10                           │
│   • sinh 9 cảnh báo "tòa chưa có phụ trách chính từ 01/11"       │
│   • kỳ lương 10/2026 VẪN tính đủ (còn phụ trách tại ngày 15)     │
│                          [Đề xuất chuyển 9 tòa cho người khác ▸] │
├──────────────────────────────────────────────────────────────────┤
│ ⑧ QUYỀN XEM  NV xem của mình · TNVH xem lương hiệu suất cấp dưới │
│              nhưng KHÔNG xem lương cố định · Admin/Kế toán sửa    │
└──────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| Header | Cờ cổ đông | **Chỉ đọc** từ module Cổ đông; phần chia cổ tức đi qua UI-29, tuyệt đối không xuất hiện trong bảng lương hay chi phí lương |
| ⑤ | Chỉ số | Số tòa/phòng đang quản lý là giá trị **tính động** từ phân công hiệu lực hôm nay, không có ô nhập tay |
| ⑥ | Cấu phần lương | Sửa luôn **tạo phiên bản mới có ngày hiệu lực**; kỳ lương đã khóa giữ snapshot, không tính lại. Lương hỗ trợ là khoản nhập tay theo từng kỳ kèm lý do |
| Ghi chú NVVH | Lương cơ bản 0 | Hiển thị ghi chú giải thích, vì nhìn con số 0 dễ tưởng nhập thiếu |
| ⑦ | Preview nghỉ việc | Hiện **toàn bộ hệ quả dây chuyền trước khi lưu** — đây là thao tác ảnh hưởng nhiều module nhất trong khối nhân sự |
| ⑧ | Băng quyền | Nhắc tại chỗ vì lương là dữ liệu nhạy cảm và phân quyền theo từng cấu phần chứ không theo cả màn |
| Trạng thái | Vòng đời | `Thử việc → Đang làm → Nghỉ việc`; ngày nghỉ tương lai hiện `Sắp nghỉ (dd/mm)`. NV thử việc **vẫn được phân công tòa và tính lương hiệu suất** |

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

**Tabs:** Tổng quan, Phân công, Cấu phần lương, Kỳ lương, Hồ sơ, Lịch sử. Action: thêm/sửa, gán đơn vị/chức danh/level có ngày hiệu lực, điều chuyển tổ chức, bổ nhiệm Lead (mở UI-18), xác nhận hết thử việc, ghi nghỉ/đi làm lại, quản lý phiên bản lương theo level, thêm/đổi tài khoản ngân hàng, tạo user, export.

**State:** `Thử việc (PROBATION) → Đang làm (ACTIVE) → Nghỉ việc (RESIGNED)`; ngày nghỉ tương lai hiển thị `Sắp nghỉ (dd/mm)`. Không tạo assignment mới sau ngày nghỉ; nhân viên quay lại dùng lại hồ sơ cũ với `start_date` mới.

**Bảng lương cố định theo level (`SALARY_LEVEL`, R-19)** — sửa là **tạo phiên bản mới có ngày hiệu lực**, không sửa đè:

| Trường | Ý nghĩa |
|---|---|
| `level_code` · `position_code` | Level = chức danh + bậc (`TPVH`, `TNVH`, `NVVH-1`, `NVVH-2`…) |
| Lương cơ bản · Ăn trưa · Xăng xe | Ba cấu phần cố định của kỳ lương |
| Lương hỗ trợ mặc định | Chỉ là **giá trị gợi ý**; số thật nhập tay theo NV × kỳ kèm lý do |
| Cột đơn giá/phòng | Trỏ tới cột trong bảng bậc của Payroll Rule ở UI-22 (bậc 1 = 130k, bậc 2 = 120k tại ngưỡng 100) |
| Hiệu lực từ/đến · version | Kỳ lương đã khóa giữ snapshot, không tính lại |

Giá trị hiện hành để seed mockup (nguồn: bảng lương tháng 8): TPVH và TNVH cùng LCB 10.000.000 + ăn trưa 500.000 + xăng xe 700.000, khác nhau ở lương trưởng nhóm `số phòng dưới quyền × 10.000`; NVVH có LCB 0 + ăn trưa 500.000 + xăng xe 500.000, thu nhập chính đến từ lương hiệu suất.

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Mã NV duy nhất, **không tái sử dụng** sau khi nghỉ việc | BR-3.02.1 | Cần chốt |
| Mỗi NV có đúng một đơn vị chính tại một thời điểm; kiêm nhiệm qua dòng phân công phụ | BR-3.02.2 | Đã chốt |
| Lương cố định của kỳ = giá trị level **hiệu lực tại ngày chốt kỳ (16)**; Phase 1 **không prorate** theo ngày công | BR-3.02.3 → **P-06** | Cần chốt |
| Sửa level luôn tạo phiên bản mới; kỳ đã khóa giữ snapshot | BR-3.02.4 | Đã chốt |
| Lương hỗ trợ là khoản **nhập tay theo NV × kỳ**, bắt buộc lý do | BR-3.02.5 | Có bằng chứng nguồn |
| Nhập ngày nghỉ → tự kết thúc mọi phân công tòa hiệu lực và sinh cảnh báo "tòa chưa có phụ trách chính từ ngày X" cho TPVH | BR-3.02.6 | Cần chốt |
| NV nghỉ giữa kỳ **vẫn có dòng lương** kỳ đó nếu còn là phụ trách chính của ≥ 1 tòa tại snapshot ngày 15; lương cố định tính đủ, không prorate | BR-3.02.7 | Cần chốt |
| Chỉ một tài khoản ngân hàng mặc định tại một thời điểm; phiếu chi lương **snapshot số tài khoản tại thời điểm chi** | BR-3.02.8 | Cần chốt |
| Cờ "là cổ đông" **chỉ đọc** từ module Cổ đông; phần cổ phần **không** xuất hiện trong bảng lương hay chi phí lương | BR-3.02.9, R-24 | Đã chốt |
| Lương là dữ liệu nhạy cảm: NV chỉ xem của mình; TNVH xem lương hiệu suất của cấp dưới nhưng **không** xem lương cố định; chỉ Admin/Kế toán sửa | BR-3.02.10, R-34 | Cần chốt |
| Level NVVH quyết định **cột đơn giá/phòng**; tiêu chí lên bậc chưa có → Phase 1 Admin nhập tay kèm lý do | BR-3.02.11 → **P-01** | Cần chốt |
| NV thử việc vẫn được phân công tòa và tính lương hiệu suất như NV chính thức | BR-3.02.12 | Cần chốt |
| "Số tòa & phòng đang quản lý" là giá trị **tính động** từ phân công vai trò phụ trách chính hiệu lực hôm nay, không có ô nhập tay | BR-3.02.13 | Đã chốt |

**Nghiệm thu màn hình:** nhập 14 NV khối Vận hành (2 trưởng + 12 NVVH) đúng level; hồ sơ hiển thị dạng "9 tòa / 135 phòng đang quản lý"; tạo phiên bản level có ăn trưa 600.000 hiệu lực 01/10/2026 thì kỳ 9 vẫn 500.000 còn kỳ 10 là 600.000; nhập nghỉ việc cho NVVH có 3 tòa sinh đúng 3 cảnh báo và kết thúc phân công đúng ngày.

### UI-20 — Phân công tòa nhà

**Phác họa màn hình**

```text
┌ Phân công tòa nhà ──────── [+ Phân công] [Điều chuyển hàng loạt] [Xuất] ┐
│ ① [Hiện tại][Sắp tới][Chờ duyệt][Lịch sử][△ Thiếu phụ trách chính (2)]  │
│ Đơn vị ▾│Nhân sự ▾│Tòa ▾│Vai trò ▾│Xem tại ngày [23/09/2026 ▾]          │
├─────────────────────────────────────────────────────────────────────────┤
│ ② BẢNG PHÂN CÔNG                                                        │
│ Tòa │Nhân sự│Vai trò        │Đơn vị│Từ ngày   │Đến ngày│Trạng thái      │
│ T42 │Huyền  │Phụ trách chính│KV1   │01/09/2026│—       │● Đang hiệu lực │
│ T42 │Nam    │Kỹ thuật       │Tổ KT │01/03/2025│—       │● Đang hiệu lực │
│ T42 │Lan    │Vệ sinh        │Tổ VS │01/03/2025│—       │● Đang hiệu lực │
│ T24 │Linh   │Phụ trách chính│KV1   │01/10/2026│—       │○ Sắp tới       │
│ G9  │ —     │Phụ trách chính│ —    │ —        │—       │△ THIẾU         │
├─────────────────────────────────────────────────────────────────────────┤
│ ③ ĐỔI QUẢN LÝ — preview giao dịch nguyên tử                             │
│  Tòa T24 · Ngày hiệu lực [01/10/2026] · Lý do [bắt buộc] ____________   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ SẼ THỰC HIỆN ĐỒNG THỜI 2 THAO TÁC:                                │  │
│  │  ✓ Kết thúc: Khải · Phụ trách chính T24 · đến 30/09/2026          │  │
│  │  ✓ Tạo mới : Linh · Phụ trách chính T24 · từ 01/10/2026           │  │
│  │ Lỗi một bước → rollback cả hai                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ④ △ Ảnh hưởng lương: đổi ngày 01/10 nên NGƯỜI PHỤ TRÁCH TẠI NGÀY 15    │
│     của kỳ 10 là Linh → toàn bộ hiệu suất tòa T24 kỳ 10 tính cho Linh,  │
│     KHÔNG chia theo ngày                        [Hủy] [Gửi duyệt]       │
├─────────────────────────────────────────────────────────────────────────┤
│ ⑤ QUY TẮC HIỂN THỊ NGAY TRÊN MÀN                                        │
│  • Mỗi tòa đúng 1 phụ trách chính, không chồng ngày và KHÔNG HỞ NGÀY    │
│  • Phối hợp/Kỹ thuật/Vệ sinh: nhiều người, không tính lương hiệu suất   │
│  • Không tạo/sửa phân công rơi vào kỳ lương ĐÃ KHÓA                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Tab cảnh báo | Tab "Thiếu phụ trách chính" có badge đếm, vì tòa không có người phụ trách sẽ bị **loại khỏi bảng lương** kỳ đó kèm cảnh báo |
| ② | Bảng | Cột `Đến ngày` để trống nghĩa là còn hiệu lực; xem tại ngày khác sẽ đổi tập dòng hiển thị |
| ③ | Preview giao dịch | Đổi quản lý là **một giao dịch nguyên tử**: kết thúc người cũ và tạo người mới cùng lý do, cùng thời điểm. UI phải cho thấy cả hai vế trước khi xác nhận |
| ④ | Cảnh báo lương | Đây là hệ quả tiền bạc của một thao tác tưởng như hành chính — bắt buộc hiển thị trước khi gửi duyệt |
| ⑤ | Băng quy tắc | Ba quy tắc hay bị vi phạm nhất, đặt cố định trên màn |
| Duyệt | Người tạo ≠ người duyệt | Admin duyệt khi nhân sự là Lead hoặc chuyển giữa hai nhóm |
| Lùi ngày | Backdate | Chỉ cho phép trong kỳ lương chưa khóa và cần Admin duyệt; hiệu suất tạm tính sẽ được tính lại |

**Views:** Hiện tại, Sắp tới, Chờ duyệt, Lịch sử, Cảnh báo thiếu phụ trách chính.

**Cột/field:** tòa, nhân sự, role `Phụ trách chính/Phối hợp/Kỹ thuật/Vệ sinh`, đơn vị, effective from/to, nguồn/yêu cầu, lý do, status, người tạo/duyệt.

**Action:** tạo, thay đổi quản lý, điều chuyển hàng loạt, gửi duyệt, trả sửa, duyệt, từ chối, hủy trước hiệu lực, kết thúc assignment. Khi duyệt `Phụ trách chính` mới, hệ thống preview việc kết thúc người cũ tại effective date − 1.

**Validation:** mỗi tòa chỉ một `Phụ trách chính` tại một thời điểm; nhân sự còn làm việc; scope đơn vị phù hợp; ngày không chồng; thay đổi phải có lý do.

**State:** `Draft → Chờ duyệt → Đã duyệt → Đang hiệu lực → Hết hiệu lực`; nhánh `Từ chối/Đã hủy`.

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Mỗi tòa có **đúng một** phụ trách chính hiệu lực mọi ngày trong thời gian vận hành: không chồng ngày, **không hở ngày**; tạo dòng chồng ngày → tự kết thúc dòng cũ vào `from − 1` và yêu cầu xác nhận | BR-3.03.1 | Đã chốt |
| Vai trò Phối hợp/Kỹ thuật/Vệ sinh cho phép nhiều người trên cùng tòa, không bắt buộc có, **không** tham gia tính lương hiệu suất Phase 1 | BR-3.03.2 | Đã chốt |
| Cột "Quản lý" ở sổ tòa, hóa đơn, thu tiền, công nợ, báo cáo và cascading filter **đọc** từ màn này theo ngày dữ liệu; **không màn nào có ô nhập tay tên quản lý** | BR-3.03.3, R-33 | Đã chốt |
| NV được phân công phải đang làm/thử việc suốt khoảng hiệu lực và thuộc đơn vị phù hợp vai trò | BR-3.03.4 | Cần chốt |
| Ngày hiệu lực mặc định là ngày 1 tháng kế; đổi giữa tháng thì hiệu suất và lương HS **cả tháng** thuộc về người là phụ trách chính tại **ngày 15**, không chia theo ngày | BR-3.03.5, R-23 → **P-21** | Cần chốt |
| Chặn tạo/sửa phân công có ngày hiệu lực rơi vào **kỳ lương đã khóa**; muốn sửa phải mở khóa kỳ lương | BR-3.03.6 | Cần chốt |
| Người tạo ≠ người duyệt; Admin duyệt khi NV là Lead hoặc chuyển giữa 2 nhóm | BR-3.03.7 | Cần chốt |
| Đổi quản lý là **giao dịch nguyên tử**: kết thúc A và tạo B cùng lý do, cùng thời điểm; lỗi một bước → rollback cả hai | BR-3.03.8 | Đã chốt |
| Bulk transfer tạo n cặp kết thúc/tạo mới cùng ngày hiệu lực, **một lần duyệt**; từng dòng vẫn từ chối riêng được | BR-3.03.9 | Đã chốt |
| `Hủy` chỉ cho dòng đã duyệt **chưa đến** ngày hiệu lực; dòng đang hiệu lực chỉ được `Kết thúc` kèm lý do | BR-3.03.10 | Đã chốt |
| Tòa đang vận hành mà không có phụ trách chính → Work Queue cảnh báo TPVH; bảng lương kỳ đó **bỏ tòa khỏi mọi NV** và ghi cảnh báo "tòa không có người hưởng HS" | BR-3.03.12 | Cần chốt |
| Thay đổi hiệu lực tương lai không ảnh hưởng dashboard/quyền/hiệu suất tạm tính trước ngày hiệu lực | BR-3.03.13 | Đã chốt |
| Phân công **lùi ngày** chỉ được phép trong kỳ lương chưa khóa và cần Admin duyệt; hiệu suất tạm tính được tính lại | BR-3.03.14 | Cần chốt |

### UI-21 — Hiệu suất thu tiền

**Phác họa màn hình**

```text
┌ Hiệu suất thu tiền ── Kỳ lương 09/2026 · ① TẠM TÍNH ─────── [Xuất] ┐
│ Đơn vị ▾│Nhân sự ▾│Tòa ▾│Vai trò ▾│[◉ Theo NV ○ Theo tòa]           │
│ ⓘ Số liệu tạm tính tới thời điểm xem; chốt Thực tế sau ngày 16      │
├─────────────────────────────────────────────────────────────────────┤
│ ② BẢNG NV × TÒA — Nguyễn Thị Thương Huyền, kỳ 08/2026 (số thật)     │
│ Tòa │Phòng│ DT niêm yết │ DT phải thu │  Mốc 1  │ Mốc 2 │  HS % │    │
│ T3  │ 22  │ 103.000.000 │ 137.396.000 │132.886.0│4.059.0│ 94,27 │    │
│ T10 │  8  │  32.800.000 │  34.510.000 │ 32.642.0│1.861.2│ 92,14 │    │
│ T20 │ 17  │  42.000.000 │  55.294.667 │ 55.262.3│   0   │ 97,32 │    │
│ T22 │  9  │  31.500.000 │  43.328.000 │ 43.328.0│   0   │100,00 │    │
│ T24 │ 10  │  36.200.000 │  50.261.000 │ 47.261.0│2.700.0│ 98,03 │    │
│ T41 │ 16  │  65.300.000 │  82.144.000 │ 82.092.0│   0   │ 94,89 │    │
│ S26 │ 10  │  47.000.000 │  60.465.000 │ 60.465.0│   0   │ 98,51 │    │
│ G3  │ 17  │  76.700.000 │  98.704.000 │ 92.573.0│   0   │ 94,52 │    │
│ G6  │ 26  │ 104.700.000 │ 129.907.600 │127.707.6│1.980.0│ 92,01 │    │
│ ────┼─────┼─────────────┼─────────────┼─────────┼───────┼───────┤    │
│ TỔNG│ 135 │ 539.200.000 │ 692.010.267 │         │       │ 95,01 │    │
│                                                                     │
│ ③ DIỄN GIẢI CÔNG THỨC — bung tòa T3                                 │
│  Tổng 3 mốc   = 132.886.000 + 4.059.000 + 0 = 136.945.000           │
│  Hệ số dịch vụ = 1 − (40.996.000 ÷ 137.396.000) = 0,7016216         │
│  Tổng DT thu được = 136.945.000 × 0,7016216 + 1.016.129 (thu thêm)  │
│                   = 97.099.698                                      │
│  ④ HIỆU SUẤT = 97.099.698 ÷ 103.000.000 = 94,27 %                   │
│                                        [Xem từng payment ▸]         │
├─────────────────────────────────────────────────────────────────────┤
│ ⑤ DT THU THÊM — 2 nguồn, hiển thị tách                              │
│  (a) Hệ thống sinh: prorate hóa đơn đầu khách mới đã thu đến ngày 15│
│      T3 · 3.150.000 ÷ 31 × 10 = 1.016.129                           │
│      △ sổ chia 31; hệ thống dự kiến chia 30 → 1.050.000 (P-03)      │
│  (b) Nhập tay có lý do, kế toán duyệt                               │
│      S37 · 4.700.000 + 2.000.000 · duyệt bởi Kế toán                │
├─────────────────────────────────────────────────────────────────────┤
│ ⑥ BẬC & LƯƠNG HIỆU SUẤT — bảng bậc suy ra từ số thật kỳ 08/2026     │
│  Bậc theo HS CỦA TỪNG TÒA, không theo HS gộp của nhân viên          │
│  (Huyền HS gộp 95,01 nhưng 9 tòa rơi vào 4 bậc khác nhau)           │
│  ≥98   → 130.000/100 : T22 100,00 → 130.000 × 9  = 1.170.000        │
│                        T24  98,03 → 127.439 × 10 = 1.274.392        │
│  95–98 → 120.000/ 95 : T20  97,32 → 122.936 × 17 = 2.089.905        │
│  93–95 → 119.000/ 95 : T3   94,27 → 118.088 × 22 = 2.597.925        │
│  90–93 → 110.000/ 90 : G6   92,01 → 112.459 × 26 = 2.923.937        │
│  △ Dải dưới 90 chưa có dữ liệu quan sát → vẫn phải hỏi khách (P-01) │
│  ✕ Không sửa trực tiếp số tổng — chỉ [Tạo đề nghị điều chỉnh]       │
└─────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Nhãn trạng thái | `Tạm tính` cho tới khi bảng lương kỳ được khóa, sau đó đổi sang `Thực tế` và khóa lại |
| ② | Bảng NV × tòa | Dòng tổng của mỗi nhân viên nằm ngay dưới các tòa của người đó; số phòng ở đây là **phòng có hóa đơn trong kỳ**, khác mẫu số N của phân bổ chi phí |
| ③ | Diễn giải công thức | Bung được ngay trên màn thay vì giấu trong tài liệu — vì đây là công thức lõi quyết định lương, nhân viên cần tự kiểm tra được |
| ④ | Drill-down | Từ hiệu suất đi ngược về từng payment rồi về hóa đơn |
| ⑤ | DT thu thêm | Hai nguồn hiển thị tách bạch: phần hệ thống tự sinh và phần nhập tay có duyệt — để kiểm soát khoản dễ bị lạm dụng |
| ⑥ | Bậc lương | Nhấn mạnh bậc xếp **theo hiệu suất của từng tòa**, không theo hiệu suất gộp; bảng bậc đầy đủ đang chờ khách chốt (P-01) |
| Mốc | Snapshot | Mốc thu chụp tự động lúc 23:59 ngày 5/10/15, **không chỉnh tay**; tiền mặt chưa được kế toán xác nhận thì chưa vào mốc |

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

**Phác họa màn hình**

```text
┌ Bảng lương / Kỳ 09/2026 ──── Reviewing ─── [Khóa] [Trả sửa] [Xuất UNC] ┐
│ Ngày chốt 16/09 · Rule v3 · N phân bổ 1.382 · 14 nhân sự               │
│ Tổng thực nhận 198.412.000 · △ 2 cảnh báo                              │
├────────────────────────────────────────────────────────────────────────┤
│ ① BẢNG KẾT QUẢ — số thật kỳ 08/2026                                    │
│ Nhân sự         │Chức vụ│ LCB    │Ăn trưa│Xăng xe│Tr.nhóm│Hỗ trợ│Thực nhận│
│ Đặng Đình Mạnh  │TPVH   │10.000k │ 500k  │ 700k  │7.740k │  0   │18.940k  │
│ Trần Quang Huy  │TNVH   │10.000k │ 500k  │ 700k  │4.080k │  0   │15.280k  │
│ Ng.T.T. Huyền   │NVVH   │     0  │ 500k  │ 500k  │   0   │2.000k│19.152k  │
│ Đỗ Thùy Linh    │NVVH   │     0  │ 500k  │ 500k  │   0   │  0   │21.953k  │
│ ────────────────┴───────┴────────┴───────┴───────┴───────┴──────┴─────────│
│ Tổng toàn bảng: LCB 91.434.616 · ăn trưa 17.919.231 · xăng 9.400.000      │
│                 trưởng nhóm 11.820.000 · lương hiệu suất 146.302.950      │
├────────────────────────────────────────────────────────────────────────┤
│ ② DRAWER CHI TIẾT — Nguyễn Thị Thương Huyền                  [Đóng ×] │
│  Phân công tại ngày 15/08: 9 tòa · 135 phòng (snapshot, không đổi)    │
│  Tòa │Phòng│ HS %  │Bậc/đơn giá  │Mức/phòng│ Lương HS tòa             │
│  T3  │ 22  │ 94,27 │119.000 / 95 │ 118.088 │  2.597.925               │
│  T10 │  8  │ 92,14 │110.000 / 90 │ 112.611 │    900.884               │
│  T20 │ 17  │ 97,32 │120.000 / 95 │ 122.936 │  2.089.905               │
│  T22 │  9  │100,00 │130.000 /100 │ 130.000 │  1.170.000               │
│  T24 │ 10  │ 98,03 │130.000 /100 │ 127.439 │  1.274.392               │
│  T41 │ 16  │ 94,89 │119.000 / 95 │ 118.865 │  1.901.842               │
│  S26 │ 10  │ 98,51 │130.000 /100 │ 128.064 │  1.280.638               │
│  G3  │ 17  │ 94,52 │119.000 / 95 │ 118.398 │  2.012.774               │
│  G6  │ 26  │ 92,01 │110.000 / 90 │ 112.459 │  2.923.937               │
│  ────┴─────┴───────┴─────────────┴─────────┴ Σ 16.152.297             │
│  Thực nhận = 16.152.297 + 500.000 + 500.000 + 2.000.000 = 19.152.297  │
│  ⓘ Bậc xếp theo HS CỦA TỪNG TÒA — HS gộp của Huyền là 95,01 nhưng     │
│    9 tòa rơi vào 4 bậc đơn giá khác nhau                              │
│  [+ Thêm điều chỉnh có lý do]   [Xem đề nghị điều chỉnh đang chờ]     │
├────────────────────────────────────────────────────────────────────────┤
│ ③ CẢNH BÁO TRƯỚC KHI KHÓA                                              │
│  △ Tòa G9 không có phụ trách chính tại ngày 15 → bị loại khỏi mọi NV  │
│  △ Tòa G13 là tòa mới → áp 100.000/phòng cố định (đến khi nào? P-08)  │
├────────────────────────────────────────────────────────────────────────┤
│ ④ HAI MẪU SỐ — hiển thị tách, tuyệt đối không dùng lẫn                 │
│  N phân bổ chi phí (kể cả phòng trống)........ 1.382                   │
│  Số phòng tính hiệu suất (có hóa đơn kỳ)...... 1.079                   │
└────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| Header | Rule version | Mỗi kỳ gắn với **một phiên bản Payroll Rule**; phiên bản đã dùng bởi kỳ đã khóa không sửa được |
| ① | Bảng kết quả | Tách đủ các cấu phần để đối chiếu với bảng lương Excel theo từng cột |
| ② | Drawer chi tiết | Hiển thị **snapshot phân công tại ngày 15** — không phải phân công hiện tại — kèm ghi chú giải thích vì sao cùng một nhân viên lại có hai bậc đơn giá khác nhau |
| ③ | Cảnh báo | Hai tình huống làm lệch lương mà không lỗi kỹ thuật: tòa thiếu người phụ trách và tòa mới |
| ④ | Hai mẫu số | Đặt cạnh nhau ở cuối màn để người kiểm tra không lấy nhầm — đây là nguồn sai lệch đã xuất hiện trong file Excel gốc |
| Trạng thái | Vòng đời | `Nháp/Open → Reviewing → Locked → Reopened`. Khi đã chi một phần mà mở lại, phải tạo **phiếu bổ sung hoặc thu hồi**, không sửa phiếu đã chi |
| Quyền | Sửa số | Không sửa trực tiếp số tổng; mọi thay đổi đi qua **đề nghị điều chỉnh có lý do** và được duyệt |

**Header:** kỳ, status, ngày chốt 16/N, rule version, N phân bổ, số nhân sự, tổng thực nhận, cảnh báo.

**Bảng kết quả:** NV, chức danh/level snapshot, lương cơ bản, ăn trưa, xăng xe, lương lead, hỗ trợ, lương hiệu suất, điều chỉnh, khấu trừ, tổng gross, thực nhận, payment status.

**Drawer chi tiết:** danh sách tòa và snapshot 15 chỉ tiêu hiệu suất; assignment ngày 15; bậc/đơn giá; các cấu phần; adjustment có lý do; audit.

**Rule ASSUMED:** kỳ N theo đợt hóa đơn tiền phòng tháng N; chốt 16/N; đổi quản lý giữa tháng tính cho người phụ trách ngày 15, không prorate. Tòa mới dùng 100.000đ/phòng tối đa 2 tháng và kết thúc sớm khi lấp đầy ≥70%. Dưới 75% không trả lương hiệu suất; dùng % chưa làm tròn để xếp dải.

**Mẫu số ASSUMED:** N chi phí gồm phòng đang quản lý kể cả trống; hiệu suất dùng phòng có hóa đơn. Tháng 8: N=1.382, hiệu suất=1.079; 1.343 là lỗi nguồn.

**Action:** mở kỳ, refresh snapshot, sửa cấu phần được phép, thêm adjustment/khấu trừ, gửi review, trả sửa, khóa, mở lại với lý do, export bảng lương/UNC.

**State:** `Nháp/Open → Reviewing → Locked → Reopened`; khi đã có chi một phần, mở lại phải tạo phiếu bổ sung/thu hồi, không sửa phiếu đã chi.

### UI-23 — Chi lương

**Phác họa màn hình**

```text
┌ Chi lương / Kỳ 09/2026 ────────── [+ Tạo đợt chi] [Import kết quả NH] ┐
│ Nguồn: bảng lương kỳ 09 đã KHÓA · Tổng phải chi 198.412.000           │
│ Đã chi 120.000.000 · Còn lại 78.412.000                               │
├───────────────────────────────────────────────────────────────────────┤
│ ① THEO NHÂN VIÊN                                                      │
│ NV    │Thực nhận│Tạm ứng│Đã chi   │Còn lại │Ngân hàng/STK │Trạng thái │
│ Mạnh  │18.940k  │   0   │18.940k  │   0    │TCB 1903…21   │Đã chi     │
│ Huyền │19.284k  │5.000k │ 5.000k  │14.284k │TCB 1903…88   │Chi một phần│
│ Linh  │17.402k  │   0   │     0   │17.402k │VCB 0011…04   │Chưa chi   │
├───────────────────────────────────────────────────────────────────────┤
│ ② ĐỢT CHI SP-2609-02                              Nháp → [Gửi duyệt]  │
│  Loại [Thanh toán ▾]  (Tạm ứng / Thanh toán / Bổ sung / Thu hồi)      │
│  Ngày dự kiến 22/10/2026 · Ngân hàng chi [Techcombank ▾]              │
│  Nội dung CK: LUONG T09 <tên NV>                                      │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ ☑ Huyền  14.284.000  TCB 1903…88  ⓘ đã trừ tạm ứng 5.000.000     │ │
│  │ ☑ Linh   17.402.000  VCB 0011…04                                 │ │
│  │ ☐ Mạnh   (đã chi ở đợt trước)                                    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│  Tổng đợt: 31.686.000 · 2 người         [Hủy] [Gửi duyệt]             │
├───────────────────────────────────────────────────────────────────────┤
│ ③ ĐỐI CHIẾU NGÂN HÀNG                          [Import file kết quả]  │
│  Khớp theo (STK, số tiền, ngày) → tự đánh dấu Đã chi                  │
│  Lệch: 1 dòng — Linh, NH báo 17.400.000 vs phiếu 17.402.000 [Xử lý ▸] │
├───────────────────────────────────────────────────────────────────────┤
│ ④ LƯU Ý ẢNH HƯỞNG BÁO CÁO                                             │
│  Ngày chi CHỈ vào sổ quỹ / dòng tiền quỹ.                             │
│  Chi phí lương trên báo cáo tòa dùng KỲ LƯƠNG cho cả hai biến thể     │
│  → chi tháng 10 vẫn là chi phí lương của kỳ 09                        │
└───────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| Header | Nguồn | Chỉ tạo được đợt chi từ bảng lương đã **Locked**; màn hình nêu rõ nguồn để không chi theo số nháp |
| ① | Theo nhân viên | Ba trạng thái `Chưa chi / Chi một phần / Đã chi`; cột tạm ứng tách riêng để thấy phần đã ứng trước |
| ② | Đợt chi | Bốn loại phiếu; **thu hồi là phiếu mới mang số âm**, không sửa phiếu đã chi. Số tài khoản được snapshot tại thời điểm chi |
| ③ | Đối chiếu ngân hàng | Khớp theo bộ ba (số tài khoản, số tiền, ngày); dòng lệch phải xử lý thủ công, không tự làm tròn |
| ④ | Băng lưu ý | Đặt cố định vì đây là điểm dễ hiểu nhầm nhất: **ngày chi không quyết định kỳ ghi chi phí lương** |
| Duyệt | Quyền | Admin duyệt trước khi đánh dấu `Đã chi`; tạm ứng được phép tạo trước khi khóa kỳ (P-28) |

**Danh sách theo NV × kỳ:** thực nhận, đã chi, còn lại, status, ngân hàng/STK, đợt gần nhất.

**Phiếu/đợt chi:** kỳ, loại `Tạm ứng/Thanh toán/Bổ sung/Thu hồi`, danh sách NV, amount, ngày dự kiến/thực tế, ngân hàng, nội dung CK, file, người duyệt, đối soát.

**Action:** tạo đợt từ payroll Locked, tạo tạm ứng, gửi duyệt, duyệt, đánh dấu đã chi, import kết quả ngân hàng, ghép giao dịch, hủy phiếu chưa chi, tạo thu hồi âm cho phiếu đã chi.

**Rule ASSUMED:** lương kỳ N chi ngày 20–25 tháng N+1; tạm ứng liên kết và trừ khi khóa; Admin duyệt trước khi ghi Đã chi.

**State NV:** `Chưa chi/Chi một phần/Đã chi`. Phiếu: `Nháp → Đã duyệt → Đã chi`; nhánh Hủy; thu hồi là phiếu mới số âm.

---

## 11. Đặc tả màn hình chi tiết — Chi phí, tài sản và cổ đông

### UI-24 — Chi phí & Import

**Phác họa màn hình**

```text
┌ Chi phí ────────────────── [+ Phiếu] [Import file] [Tải template] [Xuất] ┐
│ Kỳ hạch toán ▾│Tháng TT ▾│Phạm vi ▾│Nhóm GV/CPBH ▾│Hạng mục ▾│NCC ▾│Lô ▾ │
├──────────────────────────────────────────────────────────────────────────┤
│ ① SỔ CHI PHÍ                                                             │
│ Mã     │Ngày CT│① Kỳ HT│① Ngày TT│Phạm vi│Hạng mục          │Số tiền     │
│ EX-3301│05/09  │09/2026│ 12/09   │Tòa G1 │ELECTRIC_INPUT_COST│17.258.594 │
│ EX-3302│05/09  │09/2026│   —     │Tòa G1 │WATER_INPUT_COST   │ 3.140.000 │
│ EX-3310│01/09  │09/2026│ 03/09   │Hệ thống│MARKETING_COST    │22.000.000 │
│ EX-3315│20/09  │09/2026│ 20/09   │Tòa T42│REPAIR_COST        │ 4.200.000 │
│ EX-3320│02/09  │09/2026│ 02/09   │Tòa T42│EQUIPMENT_PURCHASE │ 8.500.000 │
│        └▸ △ ≥ ngưỡng vốn hóa 2.000.000 → [Đề xuất tạo tài sản ▸]         │
├──────────────────────────────────────────────────────────────────────────┤
│ ② FORM PHIẾU — hai ô kỳ, KHÔNG gộp                                       │
│  Số/Ngày chứng từ ______  · NCC ____________ · Mã HĐ NCC [PD0500…▾]      │
│  ┌─────────────────────────┬──────────────────────────┐                  │
│  │ Kỳ hạch toán [09/2026]  │ Ngày thanh toán [12/09]  │                  │
│  │ → dùng cho BC KINH DOANH│ → dùng cho BC DÒNG TIỀN  │                  │
│  └─────────────────────────┴──────────────────────────┘                  │
│  Phạm vi [◉ Tòa ○ Nhóm T/S/G ○ Toàn hệ thống] · Tòa [G1 ▾] · Phòng [—]   │
│  Hạng mục [ELECTRIC_INPUT_COST ▾] · Danh mục con [—▾] · Số tiền ______   │
│  Chứng từ [Chọn tệp]                                                     │
├──────────────────────────────────────────────────────────────────────────┤
│ ③ IMPORT — Upload → Map cột → Validate → Preview → Confirm               │
│  Lô IB-0091 · file chiphi_T9.xlsx · template "File điện nước" ▾          │
│  Tổng 142 dòng │ ✓ OK 128 │ △ Trùng 9 │ ✕ Lỗi 5                          │
│  ┌ Dòng trùng (cùng tòa + kỳ + hạng mục + số tiền) ───────────────────┐  │
│  │ 12 │ G1 │ 09/2026 │ ELECTRIC_INPUT_COST │ 17.258.594 │             │  │
│  │    → [Bỏ qua] [Ghi đè] [Giữ cả hai + lý do]                        │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│  ┌ Dòng lỗi ──────────────────────────────────────────────────────────┐  │
│  │ 44 │ Hạng mục "Tiền điện" không có trong danh mục                  │  │
│  │ 57 │ Phòng 101T17 không thuộc tòa G1                               │  │
│  │    → ④ [Tải 5 dòng lỗi ra file để sửa] · lỗi KHÔNG chặn 128 dòng OK│  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                      [Hủy lô] [Confirm 128 dòng hợp lệ]  │
├──────────────────────────────────────────────────────────────────────────┤
│ ⑤ PHIẾU KHÓA SỬA  Nguồn "system" (lương, tiền thuê, khấu hao, hoa hồng)  │
│    hiển thị (khóa) — muốn đổi phải sửa ở module gốc                      │
└──────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Hai cột kỳ | Sổ chi phí hiển thị **cả kỳ hạch toán lẫn ngày thanh toán** vì một chứng từ phục vụ đồng thời hai biến thể báo cáo |
| ② | Form phiếu | Hai ô kỳ đóng khung cạnh nhau kèm chú thích dùng cho báo cáo nào — chống việc điền một ô rồi bỏ trống ô kia |
| Vốn hóa | Gợi ý tự động | Mua thiết bị từ ngưỡng vốn hóa trở lên sẽ đề xuất tạo tài sản sang UI-27; dưới ngưỡng ghi chi phí ở cả hai biến thể |
| ③ | Luồng import | Năm bước cố định; template ánh xạ cột **lưu lại được** để tái dùng cho file cùng cấu trúc |
| Trùng | Ba lựa chọn | Bỏ qua / Ghi đè / Giữ cả hai kèm lý do — không tự quyết thay người dùng |
| ④ | Dòng lỗi | Lỗi **không chặn cả lô**; dòng lỗi xuất ra file để sửa rồi import lại |
| ⑤ | Phiếu hệ thống | Khóa sửa tay để tránh trùng số với module gốc |
| Kỳ khóa | Chứng từ về muộn | Nếu kỳ gốc đã khóa thì kỳ hạch toán để **kỳ hiện tại**, ghi chú "chứng từ kỳ MM/YYYY" |

**Danh sách:** mã, ngày chứng từ, ngày trả, kỳ kế toán, nhà cung cấp, category/metric mapping, mô tả, amount/VAT, tòa/nhóm/system, scope phân bổ, attachment, status, import batch.

**Form:** nguồn tạo tay/import; số/ngày chứng từ; nhà cung cấp; nhóm chi phí; amount; paid date; accounting period; building/group/system scope; allocation rule; tài sản liên quan; file; ghi chú.

**Action:** thêm, import file, tải template, validate preview, sửa dòng lỗi, confirm batch, xác nhận chi phí, hủy/đảo, chạy phân bổ, export. Import phải idempotent theo source key/hash.

**State:** `Nháp → Đã xác nhận → Đã phân bổ → Đã khóa`; nhánh Hủy. Chứng từ kỳ khóa chỉ điều chỉnh ở kỳ hiện tại và tham chiếu kỳ gốc.

**Hai kỳ trên mỗi phiếu — UI phải có cả hai ô, không gộp:** `Kỳ hạch toán` (dùng cho báo cáo AC) và `Ngày thanh toán` (dùng cho báo cáo CF). Hai giá trị được phép khác nhau và đó là cách một chứng từ phục vụ đồng thời hai biến thể báo cáo (BR-4.01.2).

**Schema file import chuẩn** — thứ tự cột tự do, ánh xạ bằng template lưu lại được:

| Cột file | Trường đích | Validate |
|---|---|---|
| Mã phiếu (tùy chọn) | `external_ref` | Dùng để phát hiện trùng |
| Ngày chứng từ | `document_date` | Ngày hợp lệ, không thuộc kỳ đã khóa |
| Kỳ hạch toán | `accounting_period` | `MM/YYYY`, kỳ chưa khóa |
| Ngày thanh toán | `payment_date` | Trống → `Chưa trả` |
| Tòa / Phạm vi | `scope_type` + tòa/nhóm | `TOÀN HỆ THỐNG`, `NHÓM T`, hoặc mã tòa tồn tại |
| Nhóm (GV / CPBH) | Kiểm tra chéo với hạng mục | |
| Hạng mục | `category_code` | Phải là metric code hợp lệ, chấp nhận tên tiếng Việt |
| Danh mục con | `subcategory_code` | Ví dụ `ROOM_CLEANING`, `ROOM_PAINT`, `RESIDENCE_REG`, `SIGNAGE_SECURITY`, `MISC` |
| Nội dung | `description` | |
| Số tiền | `amount` | Số nguyên VND > 0 |
| NCC / Người nhận | `supplier_name` | |
| Mã HĐ NCC | `supplier_contract_code` | Khớp hợp đồng NCC của **đúng tòa**; gợi ý hạng mục mặc định |
| Phương thức | `payment_method` | CK / TM / Tự động |
| Chứng từ | `document_url` | Link hoặc tên file trong zip |
| Phòng | `room_id` | Mã phòng phải thuộc tòa đã chọn |

Lô import lưu: tên file, người tải, thời điểm, template, tổng dòng / OK / lỗi / trùng, trạng thái `Đang mapping → Đã preview → Đã confirm → Hủy`.

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Mọi chi phí không sinh tự động phải qua màn này; **lương không nhập ở đây** mà lấy từ bảng lương đã khóa | BR-4.01.1, R-25 | Đã chốt |
| Bắt buộc `Kỳ hạch toán`; khi đã trả thì bắt buộc `Ngày thanh toán` | BR-4.01.2 | Đã chốt |
| Hạng mục phải nằm trong danh mục metric; **không cho tạo hạng mục tự do** (danh mục con thì mở rộng được) | BR-4.01.3 | Có bằng chứng nguồn |
| Giá gốc điện/nước/mạng/rác/môi trường/thang máy: kỳ AC = **tháng hóa đơn NCC**, CF = ngày thực trả | BR-4.01.4 | Cần chốt |
| Điện nước phòng trống **không tách dòng riêng** — đã nằm trong giá gốc của tòa; chỉ thống kê thất thoát ở UI-10 | BR-4.01.5, R-04 | Đã chốt |
| Phiếu phạm vi `Tòa` vào báo cáo tòa 100%; phạm vi `Nhóm`/`Toàn hệ thống` **bắt buộc qua UI-25** trước khi lên báo cáo | BR-4.01.6 | Đã chốt |
| Marketing và Thuê & DV văn phòng mặc định phạm vi `Toàn hệ thống`; file import có cột phạm vi để ghi đè | BR-4.01.7 | Cần chốt |
| Phát hiện trùng: cùng tòa/phạm vi + kỳ hạch toán + hạng mục + số tiền (thêm `external_ref` nếu có) → cho chọn **bỏ qua / ghi đè / giữ cả hai** kèm lý do | BR-4.01.8 | Đã chốt |
| Dòng lỗi **không chặn cả lô**: chỉ dòng OK được confirm, dòng lỗi xuất lại thành file để sửa | BR-4.01.9 | Cần chốt |
| Phiếu nguồn `system` (hoa hồng, tiền thuê nhà, khấu hao, lương) **không sửa tay**; phải sửa ở module gốc | BR-4.01.10 | Cần chốt |
| Mua thiết bị ≥ ngưỡng vốn hóa → **tự đề xuất tạo tài sản**; dưới ngưỡng ghi chi phí cả CF lẫn AC trong tháng mua | BR-4.01.11 → **P-11** | Cần chốt |
| Phiếu tiền thuê nhà **chỉ sinh từ UI-28**, không import tay để tránh trùng | BR-4.01.12 | Cần chốt |
| Chi phí sửa chữa/dọn/sơn do khách gây ra vẫn ghi **đủ**; khoản khấu trừ cọc ghi thu nhập khác, **không bù trừ** | BR-4.01.13, R-29 | Cần chốt |
| Chứng từ về muộn sau khi kỳ đã khóa → kỳ AC = **kỳ hiện tại**, ghi chú "chứng từ kỳ MM/YYYY" | BR-4.01.14, R-08 | Cần chốt |
| Khoản trả trước nhiều tháng (ví dụ mạng 6 tháng): kỳ hạch toán là **kỳ bắt đầu**; việc dàn đều do UI-28 xử lý | BR-4.01.17 | Cần chốt |
| Số tiền nhập **VND nguyên**, không nhận thập phân; làm tròn xử lý ở bước phân bổ | BR-4.01.18 | Cần chốt |

### UI-25 — Phân bổ chi phí và lương

**Phác họa màn hình**

```text
┌ Phân bổ chi phí & lương ── Kỳ 09/2026 ──── [Mô phỏng] [Chạy] [Duyệt] ┐
│ ① RULE ĐANG ÁP DỤNG: Allocation Rule v4 (hiệu lực 01/01/2026)        │
│  Nguồn                │Phạm vi   │Phương pháp    │Phần cố định        │
│  Lương cố định level  │Hệ thống  │Theo số phòng  │TPVH +10.000×n      │
│  Kế toán              │Hệ thống  │Theo số phòng  │10.000×n + 10.000/tòa│
│  Vệ sinh              │Hệ thống  │Theo tòa       │550.000/tòa         │
│  Marketing            │Hệ thống  │Theo số phòng  │—                   │
│  Thuê & DV văn phòng  │Hệ thống  │Theo số phòng  │—                   │
│  Lương hiệu suất QL   │Tòa       │GHI THẲNG TÒA  │không phân bổ       │
├──────────────────────────────────────────────────────────────────────┤
│ ② CÔNG THỨC HIỂN THỊ TƯỜNG MINH                                      │
│   allocated = (Tổng chi phí ÷ N) × n + phần cố định                  │
│   N = 1.382  (tổng phòng đang quản lý cuối kỳ, KỂ CẢ phòng trống)    │
├──────────────────────────────────────────────────────────────────────┤
│ ③ KẾT QUẢ RUN — nguồn "Marketing" · tổng 22.000.000                  │
│  Tòa │ n  │ n/N     │ Phân bổ    │ Cố định │ Tổng dòng                │
│  T42 │ 42 │ 3,039 % │   668.596  │    0    │   668.596                │
│  T24 │ 38 │ 2,750 % │   605.000  │    0    │   605.000                │
│  G1  │ 15 │ 1,085 % │   238.784  │    0    │   238.784                │
│  …   │    │         │            │         │                          │
│  ─────────────────────────────────────────────────────────────────    │
│  Σ 1.382 │ 100,00 % │ 21.999.994 │    0    │ ④ +6 đ dồn vào T42      │
│                                              (tòa có n lớn nhất)      │
├──────────────────────────────────────────────────────────────────────┤
│ ⑤ HAI BASIS CHẠY RIÊNG                                                │
│  [◉ CF — theo tháng thanh toán]  [○ AC — theo kỳ hạch toán]          │
│  Cùng rule version, khác tập phiếu đầu vào                           │
├──────────────────────────────────────────────────────────────────────┤
│ ⑥ CẢNH BÁO                                                            │
│  △ Tòa G9 đã trả chủ nhà 15/09 → n = 0 → không nhận phân bổ và       │
│    KHÔNG đếm vào N                                                    │
│  △ N kỳ này (1.382) khác số phòng tính hiệu suất lương (1.079)       │
│    — đúng thiết kế, không phải lỗi                                    │
│ ⑦ [So sánh với run trước] [Khóa theo kỳ]   Trạng thái: Nháp          │
└──────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Rule version | Phiên bản áp cho kỳ là phiên bản hiệu lực **ngày cuối kỳ**; phiên bản đã dùng bởi kỳ đã khóa chỉ được tạo bản mới, không sửa |
| ② | Công thức | Hiển thị N ngay cạnh công thức kèm định nghĩa đầy đủ, vì hiểu sai N là nguyên nhân lệch số phổ biến |
| ③ | Kết quả run | Có cột `n/N` dạng phần trăm để kiểm tra nhanh bằng mắt |
| ④ | Chênh làm tròn | Hiển thị công khai phần dư và nơi nó được dồn vào, thay vì âm thầm điều chỉnh |
| ⑤ | Hai basis | Chạy **riêng** cho dòng tiền và kinh doanh; toggle ngay trên màn |
| ⑥ | Cảnh báo | Hai tình huống trông như lỗi nhưng đúng thiết kế — nói rõ để người kiểm tra không đi sửa nhầm |
| ⑦ | So sánh run | Kỳ mở lại **bắt buộc chạy lại** phân bổ trước khi khóa; bảng chênh lệch với run cũ phải được duyệt |
| Lương | Hai nhóm | Lương cố định theo level đi qua phân bổ; lương hiệu suất của quản lý tòa **ghi thẳng tòa**, dòng rule ghi rõ "không phân bổ" |

**Rule list:** mã/tên, source category, scope, basis, phương pháp, effective date, version, status.

**Phương pháp:** theo số phòng N, doanh thu, số tòa, tỷ lệ nhập tay, nhóm T/S/G; lương cố định theo phòng, lương hiệu suất ghi thẳng tòa.

**Run detail:** nguồn chi phí/lương, tổng tiền, mẫu số N, từng tòa n/tỷ lệ/amount, chênh làm tròn, cảnh báo thiếu tòa, version rule, status.

**Action:** tạo version rule, mô phỏng, chạy, so sánh run, duyệt, khóa theo kỳ, export. Tổng phân bổ phải bằng nguồn; chênh làm tròn dồn theo rule đã công bố.

**State:** Rule `Nháp → Hiệu lực → Hết hiệu lực`; Run `Nháp → Đã duyệt → Đã khóa`; mở kỳ sinh run mới và lưu trữ run cũ.

**Công thức hiển thị trên run detail:** `allocated = (Tổng chi phí ÷ N) × n + phần cố định`, với **N** = tổng phòng đang quản lý cuối kỳ *kể cả phòng trống*, **n** = số phòng của tòa cuối kỳ. Màn hình phải hiện rõ cả N, n và phần cố định để người dùng đối chiếu tay được.

**Phần cố định theo rule version** (tham số, không hard-code): TPVH `+10.000 × n`; kế toán `10.000 × n + 10.000/tòa`; vệ sinh `550.000/tòa`. Lương hiệu suất của quản lý tòa **ghi thẳng vào tòa**, không qua phân bổ.

**Cảnh báo hai mẫu số — nguồn sai số hay gặp:** N dùng cho phân bổ (1.303 của T6/2026, 1.382 của T8) **khác** số phòng tính hiệu suất lương (1.079 của T8). UI không được dùng lẫn; con số 1.343 xuất hiện ở dòng lương sửa chữa T8 là chênh lệch nguồn cần đánh dấu (**P-05**).

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| N và n **tính tự động** từ master phòng + phân công tại ngày cuối kỳ; không có ô nhập tay N | BR-4.02.2 → **P-05** | Cần chốt |
| Tổng đem chia lấy từ Σ phiếu `Đã xác nhận` cùng hạng mục và phạm vi toàn hệ thống trong kỳ; **không nhập tay tổng** | BR-4.02.3 | Đã chốt |
| Lương cố định theo chức danh lấy Σ kết quả của **bảng lương đã khóa**; không nhập số cứng | BR-4.02.4, BR-4.02.6 | Đã chốt / số nguồn cần chốt |
| Phiên bản rule áp cho kỳ = phiên bản hiệu lực **ngày cuối kỳ**; phiên bản đã dùng bởi kỳ Locked **không sửa được**, chỉ tạo phiên bản mới | BR-4.02.7 | Cần chốt |
| Kết quả mỗi kỳ là **snapshot** lưu tổng, N, n, phiên bản; báo cáo đọc snapshot chứ không tính lại lúc render | BR-4.02.8 | Đã chốt |
| Σ phân bổ của mọi tòa phải = tổng nguồn, sai số làm tròn ≤ số tòa (VND); **phần dư gán vào tòa có n lớn nhất** | BR-4.02.9 | Cần chốt |
| Tòa đã trả chủ nhà trước cuối tháng (n = 0) **không nhận phân bổ và không đếm vào N**; tòa mới nhận từ tháng có phòng đưa vào quản lý | BR-4.02.10 | Cần chốt |
| Chi phí phạm vi `Nhóm` chia theo số phòng trong phạm vi các tòa của nhóm | BR-4.02.11 | Cần chốt |
| `Tỷ lệ nhập tay` chỉ dùng khi Admin nhập tỷ lệ theo tòa tổng 100% kèm lý do; phương pháp theo doanh thu / số tòa **tắt ở Phase 1** | BR-4.02.12 | Cần chốt |
| Kỳ `Reopened` **bắt buộc chạy lại** phân bổ trước khi khóa lại; chênh lệch với run cũ hiển thị để duyệt | BR-4.02.13, R-08 | Cần chốt |
| Phân bổ chạy **riêng cho 2 basis**: CF theo tháng thanh toán, AC theo kỳ hạch toán; cùng phiên bản rule, khác tập phiếu đầu vào | BR-4.02.14 | Cần chốt |
| Lương phân bổ về tòa dùng **kỳ lương** cho cả CF và AC; tháng chi lương chỉ là sổ quỹ | BR-4.02.15 | Cần chốt |
| Làm tròn VND ở cấp dòng tòa; đối soát golden chấp nhận dung sai ≤ 1 VND/dòng | BR-4.02.16 | Cần chốt |

### UI-26 — Hoa hồng

**Phác họa màn hình**

```text
┌ Hoa hồng ──────────── [Import file] [+ Tạo tay] [Lập nhóm chi] [Xuất] ┐
│ Kỳ trả ▾│Tòa ▾│Người nhận ▾│Điều kiện đủ ▾│Trạng thái chi ▾│△ Cảnh báo ▾│
│ ⓘ Phase 1 CHỈ IMPORT — không có Commission Engine, không tự tính mức  │
├───────────────────────────────────────────────────────────────────────┤
│ ① DANH SÁCH DÒNG HOA HỒNG                                             │
│ Deal      │Đợt│Tòa│Phòng │Người nhận│Giá chốt │Tỷ lệ│ Số tiền │TT chi  │
│ D-202G13  │1/2│G13│202G13│Tú        │3.500.000│ 35% │1.125.000│Đã chi  │
│ D-202G13  │2/2│G13│202G13│Tú        │3.500.000│ 35% │  100.000│Chưa chi│
│           └▸ Σ 2 đợt = 1.225.000 = 3.500.000 × 35%                     │
│ D-404S22  │1/1│S22│404S22│Đối tác M │4.200.000│ 65% │2.730.000│Chưa chi│
│           └▸ △ Mức 65% ngoài tham chiếu (50%/35%) — cần duyệt         │
│ D-203S5   │1/1│S5 │203S5 │Lan       │3.800.000│ 25% │  950.000│Chưa chi│
│           └▸ ⓘ Trùng 2 nguồn → tỷ lệ 50% ÷ 2 = 25%                    │
│ D-P601    │1/1│G1 │601G1 │Khải      │  bỏ cọc │ 50% │  480.000│Đã chi  │
│           └▸ ② Cơ sở = cọc 3.600.000 − (3.600.000÷30×22) = 960.000    │
│              △ File gốc chia 31 → 1.045.161 · HH 522.581. Hiện cả hai │
│                số, chờ chốt mẫu số (P-03)                              │
├───────────────────────────────────────────────────────────────────────┤
│ ③ MỨC THAM CHIẾU (chỉ để cảnh báo, KHÔNG chặn)                        │
│  Đối tác / lead 50%  ·  Nhân viên 35%                                 │
│  HĐ dưới 6 tháng: mức ÷ 6 × số tháng   ·  Trùng n nguồn: mức ÷ n      │
│  Tính theo phần trăm, KHÔNG có bậc thang                              │
├───────────────────────────────────────────────────────────────────────┤
│ ④ KIỂM TRA ĐIỀU KIỆN ĐỦ                                               │
│  D-404S22: file ghi "đủ" nhưng hệ thống chưa thấy HĐ đã ký            │
│            → ✕ chưa ghi chi phí   [Kế toán xác nhận thủ công]         │
│  Điều kiện chuẩn = HĐ đã ký/hiệu lực VÀ cọc đã thu = cọc phải thu     │
├───────────────────────────────────────────────────────────────────────┤
│ ⑤ NHÓM CHI THEO NGƯỜI NHẬN — kỳ trả 09/2026                           │
│  Tú    │ 1 dòng │   100.000 │ ND CK: HH Tú lần 2 (đợt 1 đã chi)       │
│  Lan   │ 1 dòng │   950.000 │ ND CK: HH Lan lần 1                     │
├───────────────────────────────────────────────────────────────────────┤
│ ⑥ QUY TẮC HIỂN THỊ CỐ ĐỊNH                                            │
│  • Hoa hồng theo CÁ NHÂN người nhận, không theo team                  │
│  • Không có hoa hồng cho HĐ gia hạn                                   │
│  • Đã chi thì KHÔNG thu hồi khi khách bỏ/phá HĐ sau đó                │
│  • Là chi phí bán hàng, KHÔNG thuộc chi phí lương dù người nhận là NV │
└───────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Danh sách | Mỗi đợt trả là **một dòng riêng** cùng deal key, đánh số `đợt/tổng`; mỗi đợt sinh một phiếu chi phí ở tháng trả đợt đó |
| ② | Dòng bỏ cọc | Hiển thị **cả số theo file gốc và số chuẩn hóa** cạnh nhau, vì mẫu số prorate chưa chốt — người dùng thấy được độ lệch thay vì bị thay số ngầm |
| ③ | Mức tham chiếu | Đặt ngay trên màn để người import biết vì sao một dòng bị gắn cảnh báo |
| ④ | Điều kiện đủ | Hệ thống đối chiếu ngược về hợp đồng và sổ cọc; file ghi "đủ" **không đủ** để ghi chi phí |
| ⑤ | Nhóm chi | Gộp theo người nhận trong cùng kỳ chi, sinh nội dung chuyển khoản chuẩn |
| ⑥ | Băng quy tắc | Bốn quy tắc hay bị hỏi lại nhất, hiển thị cố định |
| Đối chiếu | Số tiền | Hệ thống tính `giá chốt × tỷ lệ − giảm trừ` để so với số trong file; lệch quá 1.000đ thì cảnh báo và **không tự ghi đè** |

**Module nguồn:** M-4.03 · **Entity:** `COMMISSION_IMPORT_LINE` · **Phạm vi Phase 1:** **chỉ import**, không có Commission Engine (X-02) — hệ thống không tự tính mức và không tự split theo policy.

**Danh sách/import:** deal key, số đợt (`installment_no/total`), kỳ/tháng trả, tòa/phòng, khách/HĐ, người nhận, giá chốt, cơ sở tính, tỷ lệ, số tiền, điều kiện đủ, trạng thái chi và ngày chi, cờ "mức ngoài tham chiếu", cờ "chưa gắn HĐ", trạng thái.

**Mức tham chiếu để cảnh báo** (không chặn): 50% cho đối tác/lead, 35% cho nhân viên; HĐ dưới 6 tháng thì `mức ÷ 6 × số tháng`; trùng n nguồn thì `mức ÷ n`. Tính theo phần trăm, **không có bậc thang**.

**Action:** import/tạo tay, ghép HĐ/phòng, validate, confirm, lập nhóm chi theo người nhận, ghi đã chi, hủy dòng chưa chi, export. Mức ngoài tham chiếu cảnh báo và yêu cầu duyệt nhưng không chặn.

**State:** `Nháp → Đã xác nhận → Đã ghi chi phí → Đã chi → Đã khóa`; nhánh Hủy khi kỳ chưa khóa.

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Phase 1 **chỉ import**; không tự tính mức, không split theo policy | BR-4.03.1 → **X-02** | Đã chốt |
| Chỉ ghi chi phí khi **đủ điều kiện** = HĐ thuê đã ký/hiệu lực **và** cọc đã thu = cọc phải thu; file ghi "đủ" nhưng hệ thống chưa thấy HĐ ký → cảnh báo, kế toán xác nhận thủ công | BR-4.03.2, D-56 | Đã chốt |
| Kỳ ghi nhận chi phí hoa hồng (**cả CF và AC**) = tháng của ngày chi; chưa trả thì treo, **không vào chi phí** | BR-4.03.3, R-30 | Cần chốt |
| Tòa của dòng suy ra từ mã phòng; mã có chữ (`401S4A`) phải tra master phòng | BR-4.03.4 | Có bằng chứng nguồn |
| Số tiền lấy theo file; hệ thống tính `giá chốt × tỷ lệ − giảm trừ` để **đối chiếu**, lệch > 1.000đ thì cảnh báo và **không tự ghi đè** | BR-4.03.5 | Có bằng chứng nguồn |
| Mức ngoài tham chiếu (ví dụ 65%) chỉ **cảnh báo**, không chặn import | BR-4.03.6 → **P-07** | Cần chốt |
| Bỏ cọc: cơ sở tính = cọc − giá ÷ 30 × số ngày đã ở, hoa hồng = cơ sở × 50%; **hiển thị song song** số theo file (đang ÷ 31) và số chuẩn hóa để đối chiếu | BR-4.03.7 → **P-03** | Cần chốt mẫu số |
| **Không thu hồi** hoa hồng đã trả khi khách bỏ/phá HĐ sau đó | BR-4.03.8 | Cần chốt |
| **Không có hoa hồng cho HĐ gia hạn**; dòng import gắn vào HĐ gia hạn → cảnh báo | BR-4.03.9 | Cần chốt |
| Trả nhiều đợt: mỗi đợt 1 dòng cùng deal key, đánh số đợt; **mỗi đợt là 1 phiếu chi phí riêng** ở tháng trả đợt đó | BR-4.03.10 → **P-07** | Cần chốt |
| Hoa hồng tính theo **cá nhân người nhận**, không theo team; quản lý tòa không mặc nhiên nhận | BR-4.03.11, D-07 | Đã chốt |
| Tổng nhận = Σ số tiền các dòng cùng người nhận trong cùng kỳ chi; nội dung CK chuẩn `HH + tên người nhận + lần n` | BR-4.03.12 | Có bằng chứng nguồn |
| Trùng n nguồn: mỗi nguồn 1 dòng với `tỷ lệ = mức ÷ n`; kế toán nhập n, hệ thống chỉ kiểm tra | BR-4.03.13 | Cần chốt |
| Khách đổi phòng sau khi chốt: hoa hồng **giữ theo phòng chốt ban đầu**, ghi chú phòng thực ở | BR-4.03.14 | Cần chốt |
| Mỗi dòng phải gắn được HĐ trước khi khóa kỳ; không gắn được thì giữ `Đã xác nhận` kèm cờ "chưa gắn HĐ" nhưng **vẫn tính chi phí tòa** | BR-4.03.15 | Cần chốt |
| Phát hiện trùng khi import: cùng phòng + người nhận + số tiền + tháng, hoặc cùng deal key + số đợt | BR-4.03.16 | Cần chốt |
| Hoa hồng là **chi phí bán hàng**, không thuộc chi phí lương, kể cả khi người nhận là nhân viên | BR-4.03.17 | Đã chốt |

### UI-27 — Tài sản & khấu hao

**Phác họa màn hình**

```text
┌ Tài sản & khấu hao ───────────── [+ Tài sản] [Chạy khấu hao kỳ] [Xuất] ┐
│ Tòa ▾│Nhóm tài sản ▾│Trạng thái ▾│☐ Là vốn góp ban đầu                 │
│ ⓘ Khấu hao CHỈ ảnh hưởng báo cáo KINH DOANH (AC). Dòng tiền giữ        │
│   nguyên: ghi hết vào tháng mua.                                       │
├────────────────────────────────────────────────────────────────────────┤
│ ① DANH SÁCH TÀI SẢN                                                    │
│ Mã     │Tên           │Tòa│SL│Nguyên giá │Ngày dùng│Số th│Lũy kế│Còn lại│
│ AS-0412│Điều hòa LG   │T42│ 1│ 8.500.000 │02/09/26 │ 12  │     0│8.500k │
│ AS-0301│Tủ bếp trên   │G1 │ 1│12.600.000 │01/10/25 │ 36  │ 4.200│ 8.400k│
│ AS-0288│Máy giặt      │T24│ 2│24.000.000 │15/01/26 │ 36  │ 5.333│18.667k│
├────────────────────────────────────────────────────────────────────────┤
│ ② QUY TẮC KHẤU HAO ĐANG ÁP DỤNG (đề xuất, chờ khách chốt — P-02)       │
│  Thiết bị rời < 10 triệu/đơn vị ........... 12 tháng                   │
│  Thiết bị rời ≥ 10 triệu/đơn vị ........... 36 tháng                   │
│  Cải tạo / đầu tư ban đầu ................. theo HĐ đầu vào còn lại,   │
│                                             tối đa 60 tháng            │
│  Ngưỡng vốn hóa (chi phí → tài sản) ....... 2.000.000 đ/đơn vị (P-11)  │
│  Bắt đầu từ tháng đưa vào sử dụng · Trả tòa sớm → ghi hết phần còn lại │
├────────────────────────────────────────────────────────────────────────┤
│ ③ LỊCH KHẤU HAO — G1 · 8 tài sản đầu tư ban đầu · 38.862.000           │
│  Kỳ     │ Số tiền   │ Lũy kế     │ Còn lại    │ Trạng thái             │
│  10/2025│ 2.325.167 │  2.325.167 │ 36.536.833 │ Đã ghi · kỳ Locked     │
│  …      │           │            │            │                        │
│  09/2026│ 2.325.167 │ 27.902.000 │ 10.960.000 │ Dự kiến · TB rời hết   │
│  10/2026│   403.333 │ 28.305.333 │ 10.556.667 │ Dự kiến · tủ bếp+TC    │
│  ⓘ Tách hạng mục (P-02): 6 TB rời 23.062.000÷12 + tủ bếp 12.600.000÷36 │
│    + thạch cao 3.200.000÷60 = 2.325.167/th. Gộp theo HĐ đầu vào ÷60    │
│    = 647.700/th — chênh lệch lớn, đang chờ khách xác nhận (P-02)       │
├────────────────────────────────────────────────────────────────────────┤
│ ④ TAB: Tổng quan │ Lịch khấu hao │ Điều chuyển │ Tài liệu │ Audit       │
│    ⓘ Không có kiểm kê định kỳ và lịch bảo dưỡng ở Phase 1 (X-03)       │
└────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| Băng đầu | Phạm vi ảnh hưởng | Nói ngay rằng khấu hao chỉ đổi báo cáo kinh doanh — tránh việc người dùng tưởng dòng tiền cũng thay đổi |
| ① | Danh sách | Tách `Nguyên giá`, `Khấu hao lũy kế`, `Giá trị còn lại`; cờ "là vốn góp ban đầu" liên kết sang UI-29 |
| ② | Quy tắc | Hiển thị đầy đủ bảng quy tắc kèm mã tham số đang chờ chốt, thay vì chôn trong code |
| ③ | Lịch khấu hao | Kỳ đã khóa hiện trạng thái `Đã ghi` và không sửa được; ghi chú nêu rõ hai cách tính đang cho kết quả rất khác nhau |
| ④ | Tabs | Tab bảo trì/kiểm kê **không có** ở Phase 1; ghi chú để người review không coi là thiếu sót |
| Trạng thái | Vòng đời | Tài sản `Nháp → Đang dùng → Đã khấu hao hết / Đã thanh lý / Đã chuyển tòa`; tài sản khấu hao hết vẫn giữ để thống kê tài sản của tòa |

**Tài sản bàn giao của chủ nhà (1.8):** tab riêng, sinh từ Phụ lục I của HĐ đầu vào khi commit job trích xuất. `ownership = Chủ nhà`, **không vốn hóa, không khấu hao**, chỉ theo dõi số lượng/tình trạng để bàn giao lại khi chấm dứt HĐ; dòng công tơ điện/đồng hồ nước chuyển thành công tơ cấp tòa ở UI-04. Mẫu để trống cột số lượng → bắt buộc bổ sung trước `Xác nhận bàn giao`. Cờ "là vốn góp ban đầu" chỉ áp cho tài sản công ty đầu tư và bật khi có module Cổ đông.

**Danh sách:** mã, tên, category, tòa/phòng/khu vực, ownership, quantity, nguyên giá đơn vị/tổng, ngày dùng, tháng khấu hao, khấu hao lũy kế, còn lại, condition, status.

**Form:** nguồn chi phí/đầu tư, đơn vị tài sản, hạng mục rời/cải tạo gắn tòa, amount, threshold decision, ngày dùng, useful life, HĐ đầu vào liên quan, is capital contribution, file.

**Rule ASSUMED:** từ 2.000.000đ/đơn vị tạo asset; dưới ngưỡng ghi chi phí cả CF/AC. Thiết bị rời dưới 10 triệu khấu hao 12 tháng, từ 10 triệu khấu hao 36 tháng; cải tạo theo thời gian HĐ còn lại tối đa 60 tháng. G1 đầu tư 38.862.000đ khấu hao tách hạng mục, dự kiến 2.325.167đ/tháng.

**Tabs:** Tổng quan, Lịch khấu hao, Điều chuyển, Bảo trì/kiểm kê, Tài liệu, Audit. Action: tạo, kích hoạt, điều chuyển tòa, ghi condition, thanh lý, xem schedule, export.

**State:** Asset `Nháp → Đang dùng → Đã khấu hao hết/Đã thanh lý/Đã chuyển tòa`; schedule `Dự kiến → Đã ghi → Đã khóa`.

### UI-28 — Tiền thuê nhà và chi phí trả trước

**Phác họa màn hình**

```text
┌ Tiền thuê nhà & chi phí trả trước ──── Tòa [G1 ▾] · Năm [2026 ▾] ┐
│ HĐ đầu vào HL-0021 · 48.000.000 đ/tháng · trả 3 tháng/lần         │
├───────────────────────────────────────────────────────────────────┤
│ ① BA CỘT SỐ KHÁC NHAU — đây là điểm cốt lõi của màn này           │
│ Tháng │ Tiền thuê│ ② CF: ghi  │ ③ AC: thẳng│ ④ Lịch trả thực tế   │
│       │ theo HĐ  │ theo tháng │ hàng       │ (sổ quỹ)             │
│ 01/26 │48.000.000│ 48.000.000 │ 44.000.000 │ —                    │
│ 02/26 │48.000.000│ 48.000.000 │ 44.000.000 │ —                    │
│ 03/26 │48.000.000│ 48.000.000 │ 44.000.000 │ 144.000.000 (kỳ 1)   │
│ 04/26 │ MIỄN     │          0 │ 44.000.000 │ —                    │
│ 05/26 │48.000.000│ 48.000.000 │ 44.000.000 │ —                    │
│ 06/26 │48.000.000│ 48.000.000 │ 44.000.000 │ 96.000.000  (kỳ 2)   │
│ ───────────────────────────────────────────────────────────────── │
│ ⑤ Chênh CF − AC lũy kế 01–06/26 = 240tr − 264tr = −24.000.000     │
│   Âm = chi phí dồn tích (AC ghi trước CF); dương mới là trả trước │
├───────────────────────────────────────────────────────────────────┤
│ ⑥ GIẢI THÍCH HIỂN THỊ CỐ ĐỊNH TRÊN MÀN                            │
│  • Dòng tiền ghi theo THÁNG HỢP ĐỒNG (mỗi tháng hiệu lực ghi tiền │
│    thuê 1 tháng), KHÔNG ghi theo ngày trả thực → khớp Excel        │
│  • Tháng miễn: dòng tiền = 0                                      │
│  • Kinh doanh: dàn đều tổng tiền thuê toàn HĐ trên toàn thời hạn,  │
│    KỂ CẢ tháng miễn                                               │
│  • Cột "lịch trả thực tế" chỉ là view sổ quỹ, không phải chi phí   │
├───────────────────────────────────────────────────────────────────┤
│ ⑦ LỊCH ĐÓNG TIỀN & NGHĨA VỤ CỔ ĐÔNG                               │
│ Kỳ│Đến hạn   │Phải trả    │Đã trả│Trạng thái  │Cổ đông đã góp      │
│ 1 │10/03/2026│144.000.000 │ đủ   │Đã trả      │9/9 cổ đông ✓       │
│ 2 │10/06/2026│ 96.000.000 │ đủ   │Đã trả      │8/9 ✓ · 1 △ góp thiếu│
│ 3 │10/09/2026│144.000.000 │  0   │✕ Quá hạn   │chưa góp            │
│   ⓘ Góp thiếu KHÔNG chặn trả chủ nhà — công ty ứng trước          │
│                      [Ghi nhận đã trả] [Nhắc cổ đông] [Tải chứng từ]│
├───────────────────────────────────────────────────────────────────┤
│ ⑧ HĐ GẮN NHIỀU TÒA  HL-0021 → G1 100 % ✓  (vd HL-0044: S19A/B/C)  │
└───────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Bảng ba cột | Thiết kế trung tâm của màn: cùng một hợp đồng cho **ba con số khác nhau** tùy mục đích. Đặt cạnh nhau để kế toán đối chiếu trực tiếp |
| ② | Cột dòng tiền | Ghi theo tháng hợp đồng — đây là cách Excel hiện tại đang làm và là chuẩn để đối soát golden |
| ③ | Cột kinh doanh | Dàn đều cả tháng miễn. Chênh CF − AC lũy kế **dương** là chi phí trả trước, **âm** là chi phí dồn tích phải trả — dấu phụ thuộc tháng miễn nằm đầu hay cuối HĐ |
| ④ | Lịch trả thực tế | Chỉ là view sổ quỹ, **không** phải dòng chi phí — cột này tồn tại để trả lời câu hỏi "bao giờ phải chuyển tiền" |
| ⑤ | Dòng chênh lũy kế | Hiển thị tường minh chênh CF − AC kèm dấu tại mỗi thời điểm: dương = trả trước, âm = dồn tích |
| ⑥ | Băng giải thích | Bốn gạch đầu dòng cố định vì đây là quy tắc hay bị hiểu ngược nhất trong toàn hệ thống |
| ⑦ | Lịch & cổ đông | Trạng thái góp của từng cổ đông hiện ngay trên dòng kỳ; góp thiếu **không chặn** việc trả chủ nhà, công ty ứng trước |
| ⑧ | Nhiều tòa | Tổng phân bổ phải đúng 100%, hiển thị cố định để dễ phát hiện lệch |

**Mục tiêu:** tách lịch tiền thật trả chủ nhà, chi phí CF theo tháng HĐ và phân bổ AC.

**Bảng theo HĐ/kỳ:** tòa, tháng, monthly rent, miễn/giảm, `HEAD_LEASE_COST` CF, `HEAD_LEASE_COST_AC`, kỳ trả, amount due/paid, due date, status, chứng từ, nghĩa vụ cổ đông.

**Rule ASSUMED:** CF ghi tiền thuê theo tháng hợp đồng; tháng miễn = 0 và giảm giá đợt theo rule chứng từ. AC dàn đều tổng hợp đồng trên toàn thời hạn, kể cả tháng miễn. HĐ nhiều tòa mặc định theo số phòng, cho override phụ lục tổng 100%.

**Action:** xem/generate lịch, điều chỉnh lịch bằng version, ghi trả, upload chứng từ, nhắc cổ đông/chủ trách nhiệm, drill-down Report A, export.

### UI-29 — Cổ đông, cổ phần, góp vốn, phân phối

**Phác họa màn hình**

```text
┌ Cổ đông & góp vốn ───────────────────────────── [+ Cổ đông] [Xuất] ┐
│ ① [Cổ đông][Cổ phần theo tòa][Nghĩa vụ góp][Tài khoản vốn][Phân phối]│
├─────────────────────────────────────────────────────────────────────┤
│ ② CỔ PHẦN THEO TÒA — Tòa [G1 ▾] · Phiên bản hiệu lực từ 01/01/2026  │
│  Cổ đông      │   %   │ Từ ngày   │ Trạng thái │ Ghi chú            │
│  Nguyễn V. A  │ 40,0  │01/01/2026 │ Hiệu lực   │ nhân viên NV-008   │
│  Trần T. B    │ 35,0  │01/01/2026 │ Hiệu lực   │                    │
│  Lê V. C      │ 25,0  │01/01/2026 │ Hiệu lực   │                    │
│  ──────────────────────────────────────────────────────────────     │
│  TỔNG         │100,0 ✓│ ③ Σ ≠ 100 sẽ CHẶN khóa kỳ                   │
│              [Tạo phiên bản mới có ngày hiệu lực] ⓘ không sửa đè    │
├─────────────────────────────────────────────────────────────────────┤
│ ④ TÀI KHOẢN VỐN — Nguyễn V. A tại tòa G1                            │
│  Ngày     │ Loại                  │ Tăng/Giảm  │ Số dư              │
│  01/03/25 │ Cọc chủ nhà           │+19.200.000 │ 19.200.000         │
│  01/03/25 │ Đầu tư ban đầu        │+15.544.800 │ 34.744.800         │
│  01/03/25 │ Phí môi giới          │ +2.400.000 │ 37.144.800         │
│  10/03/26 │ Tiền nhà kỳ 1 (40%)   │+57.600.000 │ 94.744.800         │
│  …        │                       │            │                    │
│  ⑤ Đã góp lũy kế 92.160.000 (= 40% × 230.400.000)                   │
│     △ Σ các khoản liệt kê = 232.262.000 ≠ 230.400.000               │
│       → chênh 1.862.000 hiển thị "Chênh lệch mở sổ chờ đối soát",   │
│         KHÔNG tự phân bổ cho ai (P-29)                              │
├─────────────────────────────────────────────────────────────────────┤
│ ⑥ PHÂN PHỐI LỢI NHUẬN — Quý III/2026                                │
│  Điều kiện: 3 kỳ 07, 08, 09/2026 đều đã Locked   ✓✓✓                │
│  Basis: [◉ AC — Báo cáo kinh doanh] [○ CF (chỉ tham khảo)]          │
│  LN ròng lũy kế (AC) ......... +124.500.000                         │
│  Bù lỗ kỳ trước .............. − 18.200.000                         │
│  Đã chia các quý trước ....... − 60.000.000                         │
│  ⑦ CÓ THỂ PHÂN PHỐI .......... = 46.300.000                         │
│  Cổ đông  │ % cuối quý │ Số được chia │ Trạng thái                  │
│  Ng. V. A │   40,0     │ 18.520.000   │ Nháp                        │
│  Trần T.B │   35,0     │ 16.205.000   │ Nháp                        │
│  Lê V. C  │   25,0     │ 11.575.000   │ Nháp                        │
│                                 [Gửi duyệt] [Admin duyệt] [Ghi chi] │
│  ⓘ Lũy kế âm → có thể phân phối = 0 nhưng VẪN lập bản ghi để lưu vết│
└─────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ② | Cổ phần theo tòa | Cổ phần gắn **từng tòa**, không phải cấp công ty; một người vào nhiều tòa; % nhập tay và có phiên bản theo ngày hiệu lực |
| ③ | Kiểm tra tổng 100% | Hiển thị cố định và là **điều kiện chặn khóa kỳ báo cáo** |
| ④ | Tài khoản vốn | Sổ lũy kế theo từng cổ đông × tòa; mỗi loại khoản góp là một dòng để truy được nguồn gốc |
| ⑤ | Chênh lệch mở sổ | Phần lệch giữa số tổng và tổng các khoản liệt kê được **hiển thị riêng, không tự cân bằng ngầm** — đúng nguyên tắc không giấu sai lệch |
| ⑥ | Phân phối | Chỉ chạy được khi **cả ba kỳ trong quý đã khóa**; basis mặc định là báo cáo kinh doanh, số dòng tiền chỉ để tham khảo |
| ⑦ | Bậc thang tính | Trình bày từng bước trừ dần để cổ đông tự kiểm tra được con số cuối |
| Nhân viên | Là cổ đông | Phần chia đi qua màn này; **không** vào bảng lương và **không** vào chi phí lương |
| Quyền | Cổ đông đăng nhập | Chỉ xem tòa mình có cổ phần, read-only; Phase 1 cổ đông **không xem** báo cáo tổng T/S/G |

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

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Cổ phần theo **từng tòa**; 1 cổ đông vào nhiều tòa; % **nhập tay**; Σ % của mỗi tòa tại mọi ngày = 100% | BR-4.06.1, D-08, R-31 | Đã chốt |
| Đổi cơ cấu = **phiên bản mới có ngày hiệu lực**; không sửa phiên bản đã dùng bởi kỳ khóa; kỳ/quý dùng % hiệu lực **ngày cuối kỳ**, không prorate | BR-4.06.2, R-32 | Cần chốt |
| Nhân viên là cổ đông: phần chia đi qua màn này, **không vào chi phí lương và không vào bảng lương** | BR-4.06.3, R-24 | Đã chốt |
| Mỗi đợt trả chủ nhà sinh **1 nghĩa vụ góp**: số phải góp = % hiệu lực tại ngày đến hạn × số tiền đợt | BR-4.06.4, R-31 | Đã chốt |
| "Đã góp" gồm cọc chủ nhà, tiền nhà các kỳ, phí môi giới, đầu tư ban đầu, góp thêm — theo dõi **lũy kế**, không phải chi phí tháng | BR-4.06.5 → **P-29** | Cần chốt thành phần |
| Phân phối theo **quý**, trên lũy kế lợi nhuận ròng **dương** sau bù lỗ kỳ trước và trừ phần đã chia; lũy kế âm → phân phối = 0 nhưng **vẫn lập bản ghi để lưu vết** | BR-4.06.6, R-32 → **P-10** | Cần chốt |
| Phân phối chỉ sinh từ **3 kỳ báo cáo đã Locked**; kỳ Reopened → phân phối quý đó về `Nháp` và tính lại nếu chưa chi, đã chi thì chênh lệch điều chỉnh vào quý sau | BR-4.06.7 | Cần chốt |
| Basis phân phối = **AC (Báo cáo kinh doanh)**; số CF chỉ hiển thị **cột tham khảo**; không trộn basis trong một quý | BR-4.06.8 → **P-10** | Cần chốt |
| Bảng cổ phần tháng (`Vốn = % × tiền thuê 1 tháng`, `LNR × %`, `Tổng nhận`) là **tham khảo, không sinh lệnh chi** | BR-4.06.9, D-43, D-44 | Cần chốt |
| Số dư tài khoản vốn = đã góp − đã chia − đã rút; số âm → **cảnh báo rút quá vốn** | BR-4.06.10 | Cần chốt |
| Hoàn vốn góp chỉ khi kết thúc HĐ đầu vào hoặc thoái vốn; cọc chủ nhà hoàn về chia theo % tại ngày hoàn | BR-4.06.11 | Cần chốt |
| Cổ đông **chỉ xem tòa có cổ phần** (hiệu lực hoặc lịch sử); không xem tòa khác, không xem lương | BR-4.06.12, R-34 | Đã chốt |
| Phase 1 **không có cổ đông cấp công ty**; cổ đông không xem Report B | BR-4.06.13 → **P-10** | Cần chốt |
| Góp thiếu/quá hạn **không chặn** việc trả chủ nhà (công ty ứng trước); chỉ hiển thị dư nợ và nhắc; **không tính lãi** ở Phase 1 | BR-4.06.14 | Cần chốt |
| Thống kê tài sản & tiền cọc liên kết tòa cho cổ đông (nguyên giá, giá trị còn lại, cọc khách đang giữ, cọc chủ nhà) là **chỉ đọc**, lọc theo nhà và thời gian | BR-4.06.15 | Cần chốt |
| Cột "Thực nhận" kiểu `Đã đóng + (Thu − Chi lũy kế) × %` là số **tham khảo**, không phải số chi | BR-4.06.16 | Có bằng chứng nguồn |

---

## 12. Đặc tả màn hình chi tiết — Báo cáo và hệ thống

### UI-30 — Kỳ báo cáo & khóa kỳ

**Phác họa màn hình**

```text
┌ Kỳ báo cáo / 2026-09 ──────── Reviewing ──── [Khóa kỳ] [Trả về Open] ┐
│ Từ 01/09 → 30/09 · Cutoff 20/10 08:00 · Version hiện tại: —          │
├──────────────────────────────────────────────────────────────────────┤
│ ① TIẾN ĐỘ ĐẦU VÀO                                                    │
│  Bảng lương kỳ .................. ✓ Đã khóa                          │
│  Import chi phí ................. ✓ 14/14 lô Confirmed               │
│  Hóa đơn kỳ ..................... ✓ 0 hóa đơn còn Nháp               │
│  Tiền thuê nhà .................. ✓ đã có lịch đủ 42 tòa             │
│  Phân bổ chi phí ................ ✓ chạy với rule v4                 │
│  Đối soát golden ................ △ 2 chênh lệch chưa xử lý          │
├──────────────────────────────────────────────────────────────────────┤
│ ② CHECKLIST TRƯỚC KHÓA (phải xanh hết mới bật nút Khóa)              │
│  ☑ Bảng lương đã Locked                                              │
│  ☑ Chỉ số & hóa đơn hoàn tất, không còn batch lỗi nghiêm trọng       │
│  ☑ Chi phí confirmed và phân bổ đã duyệt                             │
│  ☑ Hoàn cọc / hoa hồng của kỳ đã xử lý hoặc có ngoại lệ              │
│  ☑ Σ % cổ phần của mọi tòa = 100                                     │
│  ☐ Golden không còn chênh lệch nguồn chưa giải quyết  ← đang vướng   │
│  ☑ Kỳ 08/2026 đã Locked (kỳ trước phải khóa trước)                   │
├──────────────────────────────────────────────────────────────────────┤
│ ③ FREEZE LIST — 8 mục sẽ đóng băng khi khóa                          │
│  1 Phiên bản Metric Definition          5 % cổ đông ngày cuối kỳ     │
│  2 Rule phân bổ + kết quả (N, n, tiền)  6 Giá trị mọi metric CF & AC │
│  3 Loại tòa T/S/G và hạng L             7 Phân công tòa (snapshot 15)│
│  4 Snapshot lương + phân bổ lương       8 Người & thời điểm khóa     │
│  ⓘ Sau khi khóa, báo cáo KHÔNG tự tính lại dù master data đổi        │
├──────────────────────────────────────────────────────────────────────┤
│ ④ VÒNG ĐỜI KỲ                                                        │
│  Open ──gửi duyệt──▸ Reviewing ──admin duyệt──▸ Locked               │
│    ▴                     │                        │                  │
│    └───trả về────────────┘                        ▾                  │
│                                              Reopened (chỉ Admin,    │
│                                              BẮT BUỘC lý do)         │
│  ⑤ Khóa lại → version n+1 + BẢNG CHÊNH LỆCH từng metric giữa 2 bản   │
├──────────────────────────────────────────────────────────────────────┤
│ ⑥ SAU KHI KHÓA  Chứng từ thuộc kỳ bị khóa sửa/xóa. Phát sinh muộn    │
│    ghi BÚT TOÁN ĐIỀU CHỈNH vào KỲ HIỆN TẠI, tham chiếu chứng từ gốc  │
└──────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Tiến độ đầu vào | Sáu nguồn dữ liệu phải sẵn sàng; mỗi dòng link tới module tương ứng để đi xử lý |
| ② | Checklist | Nút `Khóa kỳ` **disable kèm tooltip** khi còn mục chưa đạt, thay vì cho bấm rồi báo lỗi |
| ③ | Freeze list | Liệt kê đủ 8 mục để người khóa biết chính xác cái gì sẽ bị đóng băng — và để QA kiểm tra được |
| ④ | Vòng đời | Không cho nhảy cóc trạng thái; không xóa kỳ đã có snapshot |
| ⑤ | Bảng chênh lệch | Khóa lại sau khi mở khóa **bắt buộc sinh bảng so sánh từng metric** giữa hai phiên bản |
| ⑥ | Băng sau khóa | Quy tắc quan trọng nhất của toàn hệ thống kế toán: không sửa quá khứ, chỉ điều chỉnh ở hiện tại |
| Lịch | Mốc mặc định | 16 chốt lương → 20 kiểm chi phí → khóa sau ngày 20; tất cả là **tham số hệ thống** |

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

**Freeze list khi khóa — 8 mục, đóng băng bằng snapshot chứ không tham chiếu bảng sống.** Màn hình khóa kỳ phải liệt kê đủ 8 mục này và hiển thị trạng thái đã snapshot của từng mục:

| # | Đối tượng đóng băng | Ref |
|---:|---|---|
| 1 | Phiên bản Metric Definition | R-08 |
| 2 | Phiên bản Allocation Rule + kết quả phân bổ (N, n, số tiền từng tòa) | R-26 |
| 3 | Loại tòa T/S/G và hạng L resolve tại ngày cuối kỳ | D-02 |
| 4 | Snapshot lương (bảng lương kỳ đã khóa + phân bổ lương về tòa) | R-23 |
| 5 | % cổ đông tại ngày cuối kỳ | R-32 |
| 6 | Giá trị mọi metric, cả CF và AC | spec §12.23.13 |
| 7 | Phân công tòa (để drill-down lương hiệu suất) — snapshot ngày 15 | R-23 |
| 8 | Người khóa và thời điểm khóa | |

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Kỳ = tháng dương lịch; mỗi tháng **đúng 1 kỳ**, dùng chung cho Report A, Report B, cả CF/AC và phân phối lợi nhuận | BR-5.01.1 | Đã chốt |
| Trạng thái chuyển **đúng thứ tự**, không nhảy cóc; không xóa kỳ đã có snapshot | BR-5.01.2, R-08 | Cần chốt |
| Chỉ cho chuyển `Reviewing` khi: bảng lương kỳ đã khóa, mọi import chi phí đã confirmed, không còn hóa đơn kỳ ở `Nháp`, tiền thuê nhà kỳ đã có lịch | BR-5.01.3 | Cần chốt |
| Khi khóa, đóng băng **đủ 8 mục** freeze list; báo cáo đã khóa **không tự tính lại** khi master data, phân công, % cổ đông hay loại tòa đổi sau đó | BR-5.01.4 | Đã chốt |
| Chứng từ có ngày rơi vào kỳ Locked bị **khóa sửa/xóa**; sửa chỉ qua bút toán điều chỉnh ở kỳ hiện tại có tham chiếu chứng từ gốc | BR-5.01.5 | Đã chốt |
| **Chỉ Admin** được mở khóa, bắt buộc nhập lý do; snapshot cũ giữ nguyên read-only có số version; khóa lại sinh version mới **kèm bảng chênh lệch từng metric giữa 2 version** | BR-5.01.6 | Cần chốt |
| Lịch mặc định 16 chốt lương → 20 kiểm chi phí → khóa sau ngày 20; các ngày là **tham số hệ thống**, không hard-code | BR-5.01.7 → **P-06** | Cần chốt |
| Bản ghi nhập sau `cutoff` nhưng có ngày trong kỳ → cảnh báo "phát sinh sau cutoff", chỉ vào kỳ nếu kỳ **chưa** Locked | BR-5.01.8 | Cần chốt |
| **Không dùng ngày tạo bản ghi** để xác định kỳ; mỗi metric dùng đúng `date_basis` của nó | BR-5.01.9 | Đã chốt |
| N phân bổ chốt tại ngày cuối kỳ, kể cả phòng trống, không kể tòa đã trả chủ nhà; **một N duy nhất** cho mọi dòng phân bổ trong kỳ | BR-5.01.10 → **P-05** | Có bằng chứng nguồn |
| Kỳ tháng N chỉ khóa được khi **kỳ N−1 đã Locked** | BR-5.01.11 | Cần chốt |
| Cổ đông chỉ thấy snapshot Locked của tòa mình có cổ phần; số ở `Open`/`Reviewing` gắn nhãn "tạm tính" và chỉ nội bộ | BR-5.01.12, R-34 | Đã chốt |

### UI-31 — Report A/B và CF/AC

**Phác họa màn hình**

```text
┌ Báo cáo ── Kỳ [09/2026 ▾] ── ① [◉ CF Dòng tiền] [○ AC Kinh doanh] ──┐
│ ② [Report A — theo tòa: G1 ▾] [Report B — tổng T/S/G]                │
│ Trạng thái kỳ: ● Locked v1 · snapshot 21/10/2026 08:12 · [So sánh ▾] │
├──────────────────────────────────────────────────────────────────────┤
│ ③ REPORT A — TÒA G1 · 12 KHỐI                                        │
│ ┌─ 1. DOANH THU ──────────────────────────────────────────────────┐  │
│ │ Tổng doanh thu                      148.320.000  [▸ chứng từ]   │  │
│ │  ⓘ ④ Tổng DT ≠ tiền phòng + dịch vụ là BÌNH THƯỜNG ở basis CF   │  │
│ │     Chênh = cọc mới − hoàn cọc + nợ cũ/thu khác đã thu −        │  │
│ │             hóa đơn kỳ chưa thu     [Xem dòng đối chiếu ▸]      │  │
│ ├─ 2. CỌC / HOÀN ────────────────────────────────────────────────┤   │
│ │ Cọc phòng mới        7.600.000  ⓘ từng phòng một dòng:          │  │
│ │                                    P301 3.800.000 · P402 3.800k │  │
│ │ Cọc khách bỏ không ở  1.200.000  △ MEMO — KHÔNG cộng vào tổng   │  │
│ │ Hoàn cọc            − 2.344.000  ⓘ trừ ở THÁNG THỰC CHI         │  │
│ ├─ 3. ĐẾM PHÒNG ─────────────────────────────────────────────────┤   │
│ │ Phòng mới 4 │ Phá HĐ 2 │ Trống: ở luôn 3 + hết tháng 1 + chờ 0 │   │
│ │ ⓘ P401 vừa phá HĐ vừa có khách mới → đếm CẢ HAI                 │  │
│ ├─ 4–5. DT TIỀN NHÀ / DỊCH VỤ ───────────────────────────────────┤   │
│ │ Tiền phòng 118.400.000                                          │  │
│ │ Điện 17.940.000 ⓘ ĐÃ GỒM điện chung 100.000 (P-13)             │   │
│ │ Nước 3.240.000 · Vệ sinh 1.800.000 · Mạng 1.500.000 · …        │   │
│ ├─ 6–8. GIÁ VỐN / CPBH / TỔNG CHI PHÍ ───────────────────────────┤   │
│ │ Tiền thuê nhà 48.000.000 ⓘ CF theo tháng HĐ                     │  │
│ │ Giá gốc điện 17.258.594 ⓘ đã gồm điện phòng trống              │   │
│ │ Lương (10 dòng con) ▸ · Hoa hồng ▸ · Sửa chữa ▸ · Chi phí khác ▸│  │
│ ├─ 9–11. LN GỘP / LN RÒNG / 11 TỶ LỆ ────────────────────────────┤   │
│ │ LN gộp 62.140.000 · LN ròng 38.412.000 · Biên LN ròng 25,90 %  │   │
│ ├─ 12. BẢNG CỔ PHẦN ─────────────────────────────────────────────┤   │
│ │ Cổ đông │  %  │ Vốn        │ LN gộp × % │ LN ròng × %│Tổng nhận │  │
│ │ Ng.V.A  │40,0 │ 19.200.000 │ 24.856.000 │ 15.364.800 │34.564.800│  │
│ │ ⓘ Vốn = % × tiền thuê 1 tháng · Tổng nhận là THAM KHẢO,         │  │
│ │   không phải lệnh chi (số chi thực ở UI-29)                     │  │
│ └─────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│ ⑤ REPORT B — TỔNG THEO NHÓM                                          │
│  Chỉ tiêu          │  TỔNG   │    T    │    S    │    G              │
│  Tổng doanh thu    │ 6.482tr │ 2.914tr │ 1.988tr │ 1.580tr           │
│  Lợi nhuận ròng    │ 1.204tr │   561tr │   372tr │   271tr           │
│  Biên LN ròng      │ 18,58 % │ 19,25 % │ 18,71 % │ 17,15 %           │
│  ⓘ ⑥ Dòng tiền/đếm CỘNG từ tòa. Tỷ lệ TÍNH LẠI từ tử/mẫu của tổng,   │
│    KHÔNG lấy trung bình tỷ lệ các tòa                                │
│  ⑦ Chỉ ở Report B: DT dịch vụ ÷ giá gốc (mẫu số có + lương vệ sinh)  │
│                    Tiền phòng ÷ tiền thuê nhà                        │
├──────────────────────────────────────────────────────────────────────┤
│ ⑧ NHÃN ĐỘ TIN CẬY trên từng dòng: ✓Confirmed · ~Assumed ·            │
│    △Cần xác nhận nghiệp vụ · ✕Chênh lệch nguồn                       │
│ ⑨ [Xuất XLSX đúng layout] [Xuất CSV dữ liệu] [So sánh kỳ trước]      │
└──────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ① | Toggle basis | Một màn, hai biến thể; công thức tổng hợp **giống hệt nhau**, chỉ khác dữ liệu đầu vào |
| ② | Chọn báo cáo | Report A cho một tòa, Report B gộp theo nhóm; mọi số ở B đều drill-down được về tòa |
| ③ | 12 khối | Giữ đúng thứ tự khối theo mẫu Excel để đối soát theo hàng |
| ④ | Ghi chú đối chiếu | Đặt ngay dưới dòng tổng doanh thu vì đây là câu hỏi số một khi người dùng thấy số "không khớp" |
| Các ⓘ trong khối | Chú thích tại chỗ | Mỗi quy tắc dễ gây tranh cãi được giải thích ngay cạnh con số, không bắt người xem tra tài liệu |
| ⑤ | Report B | Cột `TỔNG / T / S / G`; nhóm của tòa resolve theo lịch sử loại tòa **tại ngày cuối kỳ** |
| ⑥ | Cảnh báo tỷ lệ | Quy tắc cộng khác quy tắc tính tỷ lệ — hiển thị cố định dưới bảng |
| ⑦ | Hai tỷ lệ riêng | Chỉ xuất hiện ở Report B; Report A vẫn tính để phục vụ drill-down |
| ⑧ | Nhãn tin cậy | Mọi dòng thuộc biến thể kinh doanh chưa được khách ký đều mang nhãn cảnh báo, kể cả khi xuất file |
| ⑨ | Xuất file | Số xuất là **số snapshot**, không tính lại lúc export |

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

**Ba điều dễ làm sai nhất — UI phải xử lý đúng ngay từ mockup**

1. **`TOTAL_REVENUE` ≠ `RENT_REVENUE` + `SERVICE_REVENUE` là bình thường** ở biến thể CF, vì tổng doanh thu lấy theo payment còn các dòng lấy theo dòng hóa đơn. Chênh lệch = cọc mới − hoàn cọc + nợ cũ/thu khác đã thu − hóa đơn kỳ chưa thu. Màn hình phải hiện **dòng đối chiếu này trong drill-down**, tuyệt đối không "ép" hai số bằng nhau (BR-5.03.2).
2. **Không cộng/trừ tay phòng** ở dòng tiền phòng. Hóa đơn cuối và hóa đơn đầu prorate là dòng hóa đơn bình thường của kỳ; CF tự loại phần tiền phòng chưa thu qua thứ tự phân bổ payment (BR-5.03.3, BR-5.02.9).
3. **Tỷ lệ ở Report B phải tính lại từ tử số và mẫu số của tổng**, không lấy trung bình tỷ lệ các tòa (BR-5.04.3, R-07).

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| Report A tính cho `(kỳ, tòa, basis)`; **không có ô nhập tay số tổng** | BR-5.03.1 | Đã chốt |
| `ELECTRIC_REVENUE` **luôn gồm** dòng điện chung; nếu KH muốn tách thành dòng riêng dưới doanh thu điện thì đổi theo tham số | BR-5.03.6 → **P-13** | Cần chốt |
| Dòng "Cọc khách bỏ không ở" là **memo**: hiển thị và drill-down được nhưng **không cộng** vào tổng doanh thu, không sinh hoàn cọc; ở AC chuyển thành thu nhập khác | BR-5.03.7, BR-5.02.8 | Đã chốt |
| Hoàn cọc trừ khỏi doanh thu CF ở **tháng thực chi**, không phải tháng kết thúc HĐ; hoàn cọc âm → công nợ, **không âm hóa doanh thu** | BR-5.03.8 | Đã chốt |
| Cọc phòng mới hiển thị **từng phòng một dòng**, metric là tổng các dòng | BR-5.03.5 | Có bằng chứng nguồn |
| Đếm phòng: 1 phòng vừa phá HĐ vừa có khách mới trong tháng đếm **cả 2**; đổi phòng nội bộ và gia hạn **không đếm**; phòng trống đếm tại ngày cuối kỳ theo 3 loại | BR-5.03.9, R-06 | Đã chốt một phần |
| Giá vốn (tiền thuê nhà, thiết bị, 6 giá gốc dịch vụ) gắn **thẳng tòa**, không qua phân bổ | BR-5.03.10 | Đã chốt |
| 10 dòng lương là **dòng con** của chi phí lương; lương hiệu suất quản lý tòa ghi thẳng tòa, lương cố định theo level đi qua phân bổ | BR-5.03.11 | Đã chốt |
| Tỷ lệ hiển thị 2 số lẻ; dạng "lần" cho CP/LNG; **mẫu số = 0 → hiển thị "n/a"**, không chia cho 0 | BR-5.03.14 | Có bằng chứng nguồn |
| Giá trị tiền lưu **số thực không làm tròn**; chỉ làm tròn khi hiển thị/xuất | BR-5.03.15 | Cần chốt |
| Report A biến thể AC: thay dòng tiền thuê bằng bản thẳng hàng, thêm dòng khấu hao, thêm "Thu nhập khác" và dòng memo "Doanh thu chưa thực hiện"; **mọi dòng AC chưa được KH xác nhận mang nhãn cảnh báo** | BR-5.03.16 | Cần chốt |
| Tòa chưa có HĐ đầu vào hiệu lực hoặc chưa có phòng tại ngày cuối kỳ → **không sinh Report A** (tránh chia cho 0) | BR-5.03.17 | Cần chốt |
| Report B = Σ Report A trong scope; **không có số nào chỉ tồn tại ở Report B** | BR-5.04.1 | Đã chốt |
| Nhóm T/S/G resolve theo **lịch sử loại tòa tại ngày cuối kỳ**, không dùng giá trị hiện tại của tòa | BR-5.04.2 | Đã chốt |
| Chi phí chung và lương cố định **phải qua phân bổ trước khi gộp**; Report B không tự phân bổ lại | BR-5.04.5 | Đã chốt |
| Hai tỷ lệ `SERVICE_REVENUE_OVER_INPUT_COST` (mẫu số gồm 6 giá gốc **+ lương vệ sinh**) và `RENT_REVENUE_OVER_HEAD_LEASE` **chỉ hiển thị ở Report B** | BR-5.04.6 | Có bằng chứng nguồn |
| Metric mang trạng thái cần xác nhận nghiệp vụ vẫn tính theo công thức đề xuất nhưng **hiển thị nhãn cảnh báo trên báo cáo, export và API** | BR-5.02.14 | Đã chốt |

**Bảng cổ phần (trong Report A)**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| % dùng tại **ngày cuối kỳ**, không prorate; cổ đông vào/ra giữa kỳ vẫn dùng tỷ lệ cuối kỳ | BR-5.05.1 | Cần chốt |
| Σ % của tòa phải = 100 tại ngày cuối kỳ; khác 100 → **chặn khóa kỳ** với thông báo "Tòa X: tổng cổ phần = y %" | BR-5.05.2 | Đã chốt |
| Vốn = % × tiền thuê nhà 1 tháng (AC vẫn dùng số CF của tiền thuê) — là **số trình bày**, không phải vốn góp lũy kế | BR-5.05.3, D-43 | Cần chốt |
| LN gộp/LN ròng cổ đông = % × giá trị của **snapshot cùng basis**; Σ các dòng phải đúng bằng tổng | BR-5.05.4 | Có bằng chứng nguồn |
| Tổng nhận = Vốn + LN ròng × % là **tham khảo, không phải số chi**; số chi thực nằm ở UI-29 | BR-5.05.5, D-44 | Cần chốt |
| Khi khóa kỳ, % và 5 cột giá trị được snapshot; đổi % sau đó **không đổi bảng đã khóa** | BR-5.05.6 | Đã chốt |
| LN ròng âm → không có dòng phân phối nhưng bảng **vẫn hiển thị số âm** | BR-5.05.7 | Cần chốt |

### UI-32 — Đối soát Golden & Metric definitions

**Phác họa màn hình**

```text
┌ Đối soát Golden ── [Report A · G1 · 06/2026 · CF ▾] ── [Chạy đối soát] ┐
│ Bộ golden bắt buộc: ① Report A G1 06/2026 · ② Report B 08/2026 (CF)    │
│ Kết quả: 118 MATCH · 3 RULE_DIFF · 1 SOURCE_DIFF · 2 NEED_CONFIRM      │
├────────────────────────────────────────────────────────────────────────┤
│ ③ BẢNG ĐỐI SOÁT — kiểm TỪNG DÒNG, không chỉ tổng                       │
│ Metric              │Ô Excel│ Nguồn Excel│ Hệ thống  │Chênh │Trạng thái│
│ TOTAL_REVENUE       │ C2    │ 148.320.000│148.320.000│    0 │✓ MATCH   │
│ RENT_REVENUE        │ C13   │ 118.400.000│118.400.000│    0 │✓ MATCH   │
│ ELECTRIC_REVENUE    │ C14   │  17.840.000│ 17.940.000│+100k │△ RULE_DIFF│
│   └▸ Điện chung 100.000: mẫu T6 chưa cộng, mẫu T8 đã cộng.             │
│      Hệ thống theo T8. [Xác nhận là ngoại lệ đã duyệt]                 │
│ SALARY_COST[REPAIR] │ C35   │   1.385.173│  1.385.174│   +1 │✓ ROUNDING│
│ HEAD_LEASE_COST     │ C22   │  48.000.000│ 48.000.000│    0 │✓ MATCH   │
│ NEW_DEPOSIT         │ C3:C5 │   7.600.000│  7.600.000│    0 │✓ MATCH   │
│ Bảng cổ phần — A    │ H12   │  19.200.000│ 19.200.000│    0 │✓ MATCH   │
│ DEPRECIATION_COST   │  —    │      —     │  2.325.167│  n/a │△ NEED_CONF│
│   └▸ Metric AC chưa có golden → luôn cần khách xác nhận bộ rule AC     │
├────────────────────────────────────────────────────────────────────────┤
│ ④ 5 TRẠNG THÁI (có icon + chữ, không chỉ màu)                          │
│  ✓ MATCH · ✓ ROUNDING_DIFFERENCE · △ RULE_DIFFERENCE                   │
│  ✕ SOURCE_DATA_DIFFERENCE · △ NEED_BUSINESS_CONFIRMATION               │
│  ⓘ KHÔNG được đạt MATCH bằng cách nới dung sai                         │
├────────────────────────────────────────────────────────────────────────┤
│ ⑤ METRIC DEFINITION                                    [+ Phiên bản]   │
│ Code            │Basis│Đơn vị│Công thức / nguồn        │Version│TT     │
│ ELECTRIC_REVENUE│CF/AC│ VND  │Σ dòng 3 + dòng 12 hóa đơn│ v4   │Active │
│ NET_MARGIN      │CF/AC│  %   │NET_PROFIT ÷ TOTAL_REVENUE│ v4   │Active │
│ DEPRECIATION_COST│ AC │ VND  │Σ bút toán khấu hao kỳ    │ v1   │Draft  │
│  (khóa) Version Active đã dùng trong kỳ Locked KHÔNG sửa được          │
├────────────────────────────────────────────────────────────────────────┤
│ ⑥ [Import golden] [Drill-down ô] [Giao xử lý] [Chạy lại] [Xuất evidence]│
│    Chỉ dòng MATCH / rounding / ngoại lệ đã xác nhận mới cho nghiệm thu  │
└────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ①② | Hai bộ golden | Chạy lại mỗi lần deploy hoặc migration và **lưu kết quả theo phiên bản rule** |
| ③ | Bảng đối soát | Kiểm từng dòng gồm cả 10 dòng lương, 7 dịch vụ, 6 giá gốc và bảng cổ phần; cột `Ô Excel` cho biết đang so với ô nào của file gốc |
| Dòng bung | Giải thích chênh | Mỗi chênh lệch phải có diễn giải và hành động, không để trạng thái trống |
| ④ | Năm trạng thái | Dùng icon kèm chữ; câu nhắc "không nới dung sai" đặt cố định để tránh việc làm đẹp số liệu |
| ⑤ | Metric definition | Mỗi metric là **một mã, hai chiều basis** — không tạo hai họ mã riêng cho dòng tiền và kinh doanh |
| Khóa version | Ràng buộc | Phiên bản đã dùng trong kỳ đã khóa chỉ được tạo bản mới |
| ⑥ | Hành động | `Xuất evidence` đóng gói bằng chứng cho nghiệm thu; mọi ô số phải drill-down được về chứng từ, ô nào không drill-down được là **lỗi nghiệm thu** |

**Reconciliation table:** metric code/label, scope, basis, giá trị nguồn Excel, hệ thống, chênh, tolerance, status, note, evidence, assignee, confirmation.

**Status:** `MATCH`, `ROUNDING_DIFFERENCE`, `RULE_DIFFERENCE`, `SOURCE_DATA_DIFFERENCE`, `NEED_BUSINESS_CONFIRMATION`. Không dùng màu đơn lẻ; có icon và mô tả.

**Action:** import golden, chạy đối soát, drill-down, gắn nguồn, xác nhận rule difference, giao xử lý source difference, rerun, export evidence pack. Chỉ dòng MATCH/rounding/ngoại lệ đã xác nhận mới cho nghiệm thu.

**Metric definition:** code, label, basis, group, unit, formula type/expression, source entity/date field/filter, additive, Excel cell mapping, version/effective date, status, business confirmation. Version Active đã dùng trong kỳ Locked không sửa được.

**Rule màn hình và truy vết**

| Rule UI | Mã nghiệp vụ | Nhãn |
|---|---|---|
| **Hai golden dataset bắt buộc**: Report A của G1 kỳ 06/2026 và Report B kỳ 08/2026 (biến thể CF); mỗi lần deploy/migration chạy lại đối soát và lưu kết quả theo phiên bản rule | BR-5.06.1 | Đã chốt |
| Golden kiểm **từng dòng** — kể cả 10 dòng lương, 7 dịch vụ, 6 giá gốc và bảng cổ phần — không chỉ kiểm số tổng | BR-5.06.2 | Đã chốt |
| Đếm phải khớp **tuyệt đối**; mọi chênh lệch phải có status và ghi chú; **không được đạt MATCH nhờ nới dung sai** | BR-5.06.3 | Đã chốt |
| **Mọi ô số** trên 2 báo cáo (kể cả tỷ lệ, bảng cổ phần, cột nhóm) phải drill-down được về chứng từ với tổng kiểm bằng đúng giá trị ô; ô không drill-down được là **lỗi nghiệm thu** | BR-5.06.4, R-37 | Đã chốt |
| Export xlsx dùng đúng vị trí ô và nhãn của 2 mẫu; số xuất là **số snapshot**, không tính lại lúc export; đặt tên `BC_<tòa\|TONG>_<YYYY-MM>_<CF\|AC>_v<n>.xlsx` | BR-5.06.5 | Cần chốt |
| Metric AC **chưa có golden** → luôn ở trạng thái cần xác nhận nghiệp vụ cho tới khi KH ký bộ rule AC; sau đó mới tạo golden AC từ kỳ đầu tiên được duyệt | BR-5.06.6 | Cần chốt |
| Chênh lệch dạng `RULE_DIFFERENCE` đã được KH chấp nhận (ví dụ điện chung kỳ T6, N = 1.343 ở dòng lương sửa chữa T8) lưu thành **"ngoại lệ golden có xác nhận"** để lần đối soát sau tự MATCH kèm note | BR-5.06.7 | Cần chốt |
| Dữ liệu onboarding cho golden **import qua các module nguồn**, không nhập thẳng vào bảng giá trị metric | BR-5.06.8 | Đã chốt |

### UI-33 — Cài đặt, User/Quyền, Import Job và Audit

**Phác họa màn hình**

```text
┌ Cài đặt ──────────────────────────────────────────────────────────────┐
│ ① [Người dùng & quyền][Danh mục][Tham số hệ thống][Import jobs][Audit] │
├────────────────────────────────────────────────────────────────────────┤
│ ② NGƯỜI DÙNG & QUYỀN                                     [+ User]      │
│ User       │Nhân sự/Cổ đông│Vai trò   │Phạm vi tổ chức│Phạm vi tòa│MFA │
│ huyen.ng   │NV-021         │NVVH      │KV1            │9 tòa (PC) │ ✓  │
│ ketoan01   │NV-004         │Kế toán   │Toàn hệ thống  │Toàn bộ    │ ✓  │
│ cd.nguyenA │CĐ-002         │Cổ đông   │—              │G1, T42    │ ✕  │
│                            ③ [Xem trước: "Người này sẽ thấy gì?" ▸]    │
│  ⓘ Phân công tòa quyết định PHẠM VI DỮ LIỆU; quyền hệ thống là lớp     │
│    riêng — được phân công không đồng nghĩa được sửa dữ liệu tài chính  │
├────────────────────────────────────────────────────────────────────────┤
│ ④ THAM SỐ HỆ THỐNG — tất cả có ngày hiệu lực, KHÔNG hard-code          │
│  Ngày chốt chỉ số ......... 22 (cấu hình được theo tòa)                │
│  Hạn thanh toán ........... 25 → cuối tháng                            │
│  Mốc thu tiền ............. 5 / 10 / 15 · trọng số 100 / 90 / 70 %     │
│  Giờ chụp snapshot mốc .... 23:59            △ P-19                    │
│  Ngày chốt lương .......... 16               △ P-06                    │
│  Ngày kiểm chi phí ........ 20               △ P-06                    │
│  Chuyển công nợ sau ....... 5 ngày           △ P-17                    │
│  Phạt trễ hạn ............. 200.000 đ/ngày   △ P-09                    │
│  Ngưỡng vốn hóa tài sản ... 2.000.000 đ      △ P-11                    │
│  Mẫu số prorate ........... 30               △ P-03                    │
│  Ngưỡng Work Queue ........ nợ >5/>15 ng · HĐ <7 ng  △ P-20            │
│  ⓘ Ô có dấu △ là tham số CHỜ KHÁCH CHỐT — xem §18                      │
├────────────────────────────────────────────────────────────────────────┤
│ ⑤ DANH MỤC  Trạng thái khách · Lý do kết thúc/phá HĐ · Chức danh/level │
│   Loại đơn vị · Vai trò phân công · Nhóm T/S/G · Hạng L · Hạng mục     │
│   chi phí · Danh mục con · Loại tài liệu · Rule Zalo                    │
├────────────────────────────────────────────────────────────────────────┤
│ ⑥ IMPORT JOBS                                                          │
│ Lô     │Loại       │File          │Tổng│OK │Lỗi│Bỏ qua│Trạng thái      │
│ IB-0091│Chi phí    │chiphi_T9.xlsx│142 │128│ 5 │  9   │Đã confirm      │
│ IB-0092│Hoa hồng   │hh_T9.xlsx    │ 44 │ 44│ 0 │  0   │Đã confirm      │
│ IB-0093│Sao kê NH  │vpbank_09.csv │311 │298│13 │  0   │Đã preview      │
│        Luồng: Upload → Map → Validate → Preview → Commit               │
│        [Tải dòng lỗi] [Retry dòng đủ điều kiện — idempotent]           │
├────────────────────────────────────────────────────────────────────────┤
│ ⑦ AUDIT LOG                                        [Lọc] [Xuất]        │
│ Thời điểm │Người │Hành động        │Đối tượng │Trước→Sau      │Lý do    │
│ 21/10 08:12│admin│Khóa kỳ          │2026-09   │Reviewing→Locked│—       │
│ 20/10 16:40│ketoan│Đổi thứ tự PB   │PM-8822   │mặc định→tay   │khách yc │
│ 19/10 09:02│admin│Đổi % cổ phần    │G1        │40→42 %        │chuyển nhượng│
│  ⓘ Audit KHÔNG sửa/xóa qua UI · dữ liệu nhạy cảm trong diff bị mask    │
└────────────────────────────────────────────────────────────────────────┘
```

**Chú giải vùng và chức năng**

| Vùng | Thành phần | Chức năng chi tiết |
|---|---|---|
| ② | User & quyền | User liên kết tới hồ sơ nhân sự hoặc cổ đông; phạm vi tổ chức và phạm vi tòa là **hai trục riêng** |
| ③ | Xem trước quyền | Nút "Người này sẽ thấy gì?" mô phỏng phạm vi dữ liệu trước khi lưu — giảm rủi ro cấp nhầm quyền tài chính |
| Băng ⓘ | Hai lớp | Nhắc lại nguyên tắc: phân công tòa quyết định thấy dữ liệu nào, quyền hệ thống quyết định được sửa gì |
| ④ | Tham số | Tập trung mọi con số nghiệp vụ về một chỗ, mỗi tham số có ngày hiệu lực. Tham số chờ chốt gắn dấu và mã `P-xx` trỏ về §18 |
| ⑤ | Danh mục | Các enum dùng chung toàn hệ thống; sửa danh mục không được làm hỏng dữ liệu lịch sử |
| ⑥ | Import jobs | Một màn theo dõi mọi loại import; `Retry` chỉ chạy dòng đủ điều kiện và **idempotent** |
| ⑦ | Audit | Ghi actor, phạm vi, đối tượng, giá trị trước/sau, lý do, nguồn thao tác và mã tương quan; **không sửa/xóa được qua giao diện** |

**User & quyền:** user, employee/shareholder link, roles, permission overrides, org scope, building scope, active/MFA, last login. Có preview `Người này sẽ thấy gì?` trước lưu.

**Danh mục/tham số:** trạng thái khách, lý do kết thúc, chức danh/level, loại tổ chức, role assignment, T/S/G/L, mốc M1/M2/M3, ngày chốt chỉ số, hạn TT, ngưỡng Work Queue, ngưỡng asset, rule Zalo.

**Import jobs:** loại, file/hash, người tải, thời gian, total/valid/error/skipped, status, log. Flow `Upload → Map → Validate → Preview → Commit`; lỗi từng dòng tải xuống được; Retry chỉ dòng đủ điều kiện và idempotent.

**Audit:** actor, action, entity, code, scope, before/after diff, reason, timestamp, IP/device nếu có, correlation/job id. Filter và export theo quyền; audit không sửa/xóa qua UI.

---

## 13. Flow liên màn hình

### F-01 — Tạo hợp đồng bằng OCR

1. NVVH tải **hợp đồng thuê phòng của khách** ở UI-08; OCR nhận diện khách, tòa/phòng, giá/dịch vụ, người ở, xe, tài sản bàn giao, chỉ số OPENING, cọc và điều khoản. File HĐ thuê nguyên tòa từ chủ nhà được nhập ở UI-02/03, không chuyển vào job này.
2. OCR tạo candidate và Work Queue review; reviewer đối chiếu tòa/phòng với chủ nhà/HĐ đầu vào.
3. Reviewer chọn tạo/liên kết/cập nhật/bỏ qua; so giá với bảng giá tòa.
4. Validate báo lỗi, trùng, thiếu nguồn và lệch giá; người dùng sửa tới khi pass.
5. Commit tạo khách + HĐ nháp + người ở/phương tiện/dịch vụ/cọc/chỉ số/tài sản/điều khoản/tài liệu; tòa/phòng mới là ứng viên cần xác nhận nguồn.
6. Mở UI-07, kiểm tra summary; gửi duyệt/Chờ ký.
7. Khi đủ cọc, chỉ số OPENING, duyệt giá và xác nhận phòng → kích hoạt.

**Failure:** commit lỗi rollback; job `COMMIT_FAILED`, Retry không tạo trùng.

### F-02 — Chốt chỉ số và phát hành hóa đơn

1. UI-10 mở kỳ/tòa: với mỗi công tơ phòng, lấy `new_reading` của hóa đơn hợp lệ gần nhất làm chỉ số cũ; hóa đơn đầu lấy OPENING đã duyệt. Hiển thị kỳ/số hóa đơn nguồn, rồi nhập chỉ số mới.
2. Validate thiếu nguồn, đứt kỳ, thay công tơ, trùng/âm/bất thường/ảnh; gửi TNVH duyệt. Sai lệch phải xử lý bằng chỉ số khởi tạo hoặc điều chỉnh có lý do.
3. UI-11 preflight HĐ, bảng giá đúng tòa/ngày hiệu lực, dịch vụ, số người, meter, lineage chỉ số và hóa đơn trùng.
4. Tạo invoice draft idempotent. UI-12 snapshot chỉ số cũ/mới, công tơ, nguồn, sản lượng và đơn giá; NVVH/Kế toán review.
5. Gửi duyệt hoặc phát hành theo quyền. Khi phát hành, chỉ số mới trở thành nguồn chỉ số cũ mặc định cho hóa đơn kỳ tiếp theo của cùng công tơ.
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
- Điều hướng theo cụm ở §6.2; các shortcut từ tòa/khách/HĐ/hóa đơn mở đúng màn đích và giữ bộ lọc/breadcrumb khi quay lại.
- UI-02/03 tạo được chủ nhà, tòa và HĐ đầu vào theo trường của mẫu `.doc`; UI-04 upload đúng loại tài liệu và cập nhật HKD/chứng cứ/xác minh; UI-08 OCR hợp đồng khách PDF, cho reviewer sửa và commit các entity được duyệt.
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
- Hóa đơn phòng kỳ N lưu được chỉ số điện cũ/mới, công tơ, kỳ và chứng từ nguồn; tạo kỳ N+1 tự hiện `chỉ số cũ = chỉ số mới hợp lệ kỳ trước` của cùng công tơ. Hóa đơn đầu lấy OPENING đã duyệt; thiếu nguồn/thay công tơ/điều chỉnh phải có cảnh báo hoặc xử lý có audit, không sửa ngầm hóa đơn đã phát hành.

## 18. Sổ đăng ký tham số chờ chốt (P-xx) — điểm đồng bộ khi có công thức

Các luồng trong §9–§12 đã đặc tả đầy đủ **màn hình, trường, action, trạng thái và luồng liên màn**. Phần còn thiếu là **giá trị của một số công thức** mà khách hàng chưa chốt. Bảng dưới là điểm neo để đồng bộ: khi một tham số được chốt, tra mã `P-xx` trong tài liệu này và trong `nghiep_vu/` sẽ ra đúng các vị trí cần sửa — không phải đọc lại toàn bộ spec.

**Quy ước hiển thị trong mockup:** mọi số liệu phụ thuộc một `P-xx` chưa chốt phải mang chip `Cần xác nhận nghiệp vụ` kèm mã tham số, và phải đọc từ trang cấu hình chứ không hard-code trong component.

| Mã | Tham số chờ chốt | Màn hình bị ảnh hưởng | Giá trị đang dùng trong mockup |
|---|---|---|---|
| P-01 | Bảng bậc lương/phòng (ma trận level × dải hiệu suất) | UI-19, UI-22 | Ma trận đề xuất, dưới 75% = 0 |
| P-02 | Số tháng khấu hao từng nhóm tài sản | UI-27, UI-31 | < 10tr: 12 tháng; ≥ 10tr: 36 tháng; cải tạo theo HĐ còn lại ≤ 60 |
| P-03 | Prorate chia 30 hay số ngày thực | UI-07, UI-12, UI-16, UI-26 | Chia 30 toàn hệ thống; nguồn Excel còn chỗ chia 31 |
| P-04 | Ý nghĩa nhóm T/S/G và hạng L1–L3 | UI-04, UI-31 | T/S/G = dòng sản phẩm; L = tình trạng tòa |
| P-05 | Hai mẫu số phòng (N phân bổ vs số phòng tính hiệu suất) | UI-05, UI-22, UI-25, UI-30 | N kể cả phòng trống; hiệu suất dùng phòng có hóa đơn |
| P-06 | Kỳ lương và các ngày chốt 16 / 20 / sau 20 | UI-19, UI-22, UI-30 | Theo lịch mặc định, khai báo dạng tham số |
| P-07 | Hoa hồng nhiều đợt và mức ngoài tham chiếu | UI-26 | Cho phép nhiều đợt; mức lạ chỉ cảnh báo |
| P-08 | Tòa mới áp đơn giá cố định đến khi nào | UI-22 | 2 tháng đầu hoặc lấp đầy ≥ 70% |
| P-09 | Phạt trễ hạn 200.000đ/ngày, mốc bắt đầu và trần | UI-12, UI-14 | Từ ngày thứ 6, không trần mặc định |
| P-10 | Basis và cách chia lợi nhuận cổ đông | UI-29, UI-31 | Theo quý, lũy kế dương, basis AC |
| P-11 | Ngưỡng vốn hóa thiết bị thành tài sản | UI-24, UI-27 | 2.000.000đ/đơn vị |
| P-12 | Định nghĩa "số phòng dưới quyền" của Lead | UI-18, UI-22 | Σ phòng kể cả trống; TPVH tính toàn hệ thống |
| P-13 | Điện chung gộp vào doanh thu điện hay tách dòng | UI-10, UI-31 | Gộp vào doanh thu điện |
| P-14 | Thứ tự phân bổ payment vào dòng hóa đơn | UI-13, UI-31 | Nợ cũ → dịch vụ → thu khác → tiền phòng → cọc |
| P-15 | Cách chia tiền thuê khi 1 HĐ đầu vào gắn nhiều tòa | UI-03, UI-28 | Theo số phòng, cho override bằng phụ lục |
| P-16 | Mức khấu trừ hoàn cọc mặc định | UI-16 | Hao mòn 200.000, vệ sinh 100.000, sơn 300–500.000 |
| P-17 | Mốc tính "5 ngày" chuyển công nợ | UI-01, UI-14 | 5 ngày sau ngày phát hành |
| P-18 | Ngày chi lương thực tế | UI-23 | 20–25 tháng kế tiếp, chỉ ảnh hưởng sổ quỹ |
| P-19 | Giờ chụp snapshot mốc thu tiền | UI-21 | 23:59 ngày 5 / 10 / 15 |
| P-20 | Ngưỡng tuổi việc để tô màu ưu tiên Work Queue | UI-01 | Công nợ > 5 / > 15 ngày; HĐ sắp hết < 7 ngày |
| P-21 | Ngày tham chiếu xác định phụ trách chính cho kỳ lương | UI-20, UI-22 | Ngày 15 của kỳ |
| P-22 | Có tách vai trò HR và Quản lý Tổng không | UI-33 | Gộp vào Admin/Kế toán |
| P-23 | Ngưỡng cảnh báo HĐ đầu vào sắp hết và mốc nhắc trả chủ nhà | UI-03, UI-28 | 6 tháng; nhắc 15/7/1 ngày |
| P-24 | Thời điểm sinh mã khách và mã khi đổi phòng | UI-06 | Sinh khi `Chờ ký`; đổi phòng giữ số thứ tự |
| P-25 | Ảnh công tơ bắt buộc ở loại chỉ số nào | UI-10 | Bắt buộc với chỉ số đầu và cuối |
| P-26 | Tiền mặt NVVH giữ có tính vào mốc thu không | UI-13, UI-21 | Không tính cho tới khi kế toán xác nhận |
| P-27 | Nợ phá HĐ thu hồi ở tháng sau tính cho kỳ nào | UI-13, UI-14, UI-21 | CF ghi tháng thu, không hồi tố hiệu suất |
| P-28 | Chi lương: tạm ứng, duyệt đợt, đối chiếu ngân hàng | UI-23 | Cho tạm ứng trước khóa, Admin duyệt đợt |
| P-29 | Thành phần "Đã góp", phí môi giới và cọc chủ nhà | UI-28, UI-29 | Là vốn góp, không phải chi phí tháng |

### Hạng mục mới phát hiện khi đối chiếu hai hợp đồng mẫu

Bảy mục dưới đây **chưa có trong dãy P-01…P-29 của `nghiep_vu/`**, phát hiện khi soi bản đồ trích xuất ở UI-03 và UI-08 với hai file hợp đồng thật. Cần đăng ký ngược vào `06_phu_luc.md` §6.1 và hỏi khách cùng đợt với các tham số còn lại.

| Mã đề xuất | Vấn đề | Màn ảnh hưởng | Vì sao phải chốt |
|---|---|---|---|
| P-30 | **"Dịch vụ chung" trên HĐ khách gồm 4 khoản** (máy giặt + điện chung + thu rác + vệ sinh chung) trong khi hệ thống tách combo thành 2 khoản và tính điện chung riêng theo công tơ | UI-07, UI-09, UI-12, UI-31 | Nguy cơ **thu tiền điện chung hai lần**; ảnh hưởng thẳng `ELECTRIC_REVENUE` và đối soát golden |
| P-31 | HĐ ghi **nước theo đầu người** nhưng phòng **có đồng hồ nước** và HĐ cũng ghi chỉ số m³ | UI-07, UI-09, UI-10, UI-12 | Quyết định cách tính dòng nước của mọi hóa đơn phòng đó |
| P-32 | Mốc báo trước khi kết thúc: HĐ ghi **30 ngày và mặc nhiên gia hạn**, hệ thống dùng **35 ngày và không tự gia hạn** | UI-07, UI-15, UI-01 | Lệch mốc Work Queue và cách hiểu "tự gia hạn" |
| P-33 | Phạt chậm trả: HĐ tính **từ ngày mùng 1 tháng sau, trần 03 ngày** rồi chấm dứt HĐ; hệ thống tính **từ ngày thứ 6 sau phát hành, không trần** | UI-12, UI-14 | Số tiền phạt và thời điểm cắt dịch vụ |
| P-34 | **Chuyển nhượng hợp đồng cho người khác** (đổi người thuê trên cùng phòng) kèm phí nhượng phòng — chưa có loại sự kiện tương ứng | UI-06, UI-07, UI-15 | Hiện chỉ có `transfer` = đổi phòng nội bộ; thiếu loại này thì đổi khách phải hủy HĐ và tạo mới, làm sai số đếm phòng mới / phá HĐ |
| P-35 | **Mẫu nội dung chuyển khoản** trên HĐ là `P302 - TH01 - TÊN` trong khi hệ thống match theo mã phòng `302TH01` | UI-07, UI-12, UI-13 | Sai chuẩn hóa thì đối soát sao kê tự động sẽ trượt |
| P-36 | **SLA hoàn cọc 10 ngày** kể từ khi bàn giao phòng và chìa khóa (HĐ khách Điều 4.3) | UI-16, UI-01 | Hiện phiếu hoàn cọc chưa có deadline; cần để đưa vào Work Queue |

**Hạng mục ngoài phạm vi Phase 1 (X-xx) — UI chỉ để chỗ, không dựng chức năng:** X-01 CRM/lead/sổ doanh số (ảnh hưởng UI-26 chỉ giữ người nhận hoa hồng) · X-02 Commission Engine (UI-26 chỉ import) · X-03 Work Order, lịch bảo dưỡng, kiểm kê tài sản (UI-27 chỉ phục vụ khấu hao; việc dọn phòng nằm trong Work Queue UI-01) · X-05 lương các phòng ngoài Vận hành (UI-19, UI-22 chỉ giữ 1 dòng lương cố định nhập tay) · X-06 dự kiến lợi nhuận, ROI/ROA, cổng cổ đông · X-07 công thức hiệu suất/lợi nhuận/thời gian vận hành hiển thị trên màn tòa (UI-04 đọc từ báo cáo kỳ gần nhất) · X-08 các báo cáo bổ sung như âm dương điện nước, phân khúc khách hàng, tỷ lệ đóng tiền đúng hạn.

## 19. Traceability

| Phần spec | Nguồn chính |
|---|---|
| UI-01 | M-1.01; R-33/R-34 |
| UI-02…UI-17 | M-2.01…M-2.14 |
| **13 luồng đặc tả sâu ở v1.3** | Chủ nhà UI-02 ← M-2.01 · HĐ đầu vào UI-03 ← M-2.02 · Tòa UI-04 ← M-2.03 · Phòng UI-05 ← M-2.04 · Khách UI-06 ← M-2.05 · HĐ thuê UI-07 ← M-2.06 · Hóa đơn UI-12 ← M-2.09 · Thu tiền UI-13 ← M-2.10 · Tổ chức UI-18 ← M-3.01 · Nhân sự UI-19 ← M-3.02 (+ Phân công UI-20 ← M-3.03) · Chi phí UI-24 ← M-4.01, Phân bổ UI-25 ← M-4.02, Hoa hồng UI-26 ← M-4.03 · Cổ đông UI-29 ← M-4.06 · Báo cáo UI-30/31/32 ← M-5.01…M-5.06 |
| Tham số chờ chốt | `nghiep_vu/00_shared_brief.md` §0.8 và `06_phu_luc.md` §6.1, §6.7 → tổng hợp tại §18 |
| UI-02/03/04 và loại tài liệu | `Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc` — **bản đồ trường theo Điều 1–12 + phụ lục bàn giao** tại UI-03, kèm danh sách trường hệ thống có mà mẫu không có |
| UI-08 và F-01 | `Hop_dong_thue_phong_demo_day_du.pdf` (`DEMO-TH-2026-001`, P302 – TH01) — **bản đồ trích xuất theo từng Điều** và **bảng 8 xung đột điều khoản vs rule hệ thống** tại UI-08 |
| P-30…P-36 | Phát hiện khi đối chiếu hai hợp đồng mẫu với `nghiep_vu/`; chưa có trong dãy P-01…P-29, cần đăng ký ngược vào `06_phu_luc.md` §6.1 |
| UI-10/11/12 và F-02 | Yêu cầu của người dùng về lưu chỉ số điện cũ/mới trên hóa đơn và kế thừa sang kỳ mới |
| UI-18…UI-23 | M-3.01…M-3.06 |
| UI-24…UI-29 | M-4.01…M-4.06 |
| UI-30…UI-32 | M-5.01…M-5.06; R-37 |
| Decision Log | Phiếu 25 câu hỏi đã điền giả định; §6.1 và §6.7 |
| Design/UX | Data-dense enterprise dashboard; WCAG-oriented interaction rules |

---

**Kết luận:** Bản spec này đủ để dựng wireframe/mockup high-fidelity, map API/entity và viết test case. Trước khi dùng làm baseline triển khai production, khách hàng cần duyệt 25 quyết định `ASSUMED`, đặc biệt các rule ảnh hưởng tiền: phạt, lương, khấu hao, hoa hồng, vốn góp và lợi nhuận cổ đông.
