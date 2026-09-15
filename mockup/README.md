# TimoHouse – Mockup tương tác Phase 1 + Phase 2

Mockup click-through dựng từ bộ PNG `Phase_1_Core_Rental_GoLive/` (mặc định) và `Phase_2_Sales_Automation_Operations/` (bật bằng công tắc phase – xem mục *Phase 2* bên dưới), SRS v1.2 và UI Spec v1.5. Mọi nút trong PNG đều bấm được; dữ liệu thay đổi thật (localStorage) theo state machine của SRS §6.

## Chạy
- **Cách 1:** mở `index.html` bằng Chrome/Edge (double-click) – chạy trực tiếp từ file://.
- **Cách 2:** ở thư mục gốc repo chạy `npm run dev` rồi mở `http://localhost:8765` (cần Node ≥ 20, không cần cài dependency).
- **Deploy Netlify:** xem mục *Deploy lên Netlify* trong `README.md` ở gốc repo (`npm run build` → thư mục `dist/`; repo đã có `netlify.toml`).
- Tài khoản demo (mật khẩu bất kỳ): `admin` (Quản trị viên), `ketoan` (Kế toán), `vanhanh` (Vận hành); khi bật Phase 2 thêm `sale` (Sale), `kythuat` (Kỹ thuật). Đổi vai trò nhanh ở menu góc phải.
- Ngày hệ thống demo cố định **28/10/2026**, kỳ **Tháng 10/2026** để khớp số liệu mockup (đổi tại *Công cụ nâng cao*).

## Kịch bản demo 16 điều kiện Go-live
Bật **Hướng dẫn thao tác** (nút trên topbar). Panel dẫn qua 10 luồng / 36 mốc, tự nhận biết hoàn thành từ dữ liệu bạn tạo:

| Luồng | Nội dung | Go-live |
|---|---|---|
| S0 | Đăng nhập, Tổng quan, Danh mục dịch vụ, Phòng sẵn sàng | – |
| F01 | Thêm khách thuê | 1 |
| F02 | Chọn phòng → Tạo hợp đồng → giá/cọc/dịch vụ → Kích hoạt (phòng → Đang thuê) | 2, 3, 4 |
| F03 | Nhập điện nước → Preflight → Tạo nháp → Phát hành hóa đơn | 5, 6 |
| F04 | Gửi hóa đơn qua Zalo (re-check công nợ, tiến độ gửi) | 7 |
| F05 | Xem công nợ → Thu một phần → Chi tiết khoản thu → Theo dõi còn nợ | 8, 9, 10 |
| F06 | Nhắc công nợ qua Zalo, thử lại tin lỗi | 11 |
| F07 | Kết thúc hợp đồng → phòng Chờ dọn, tạo hồ sơ hoàn cọc | 12, 14 |
| F08 | Lập phương án → Gửi duyệt → Kế toán duyệt → Ghi nhận đã hoàn | 13 |
| F09 | Xác nhận dọn xong → phòng Sẵn sàng | 15, 16 |
| F10 | Chi phí, Import khách bằng file mẫu, Tạo tài khoản, Xuất báo cáo | tùy chọn |

Các nút trong panel (Đi tới màn hình, Chuyển vai trò, Xem/Điền dữ liệu mẫu, Tải/Dùng file mẫu) **không tạo record**; record chỉ sinh qua nút Lưu/Xác nhận của màn nghiệp vụ.

## Công cụ nâng cao (cuối sidebar)
Đặt lại dữ liệu demo · Xóa trắng dữ liệu nghiệp vụ · Đổi ngày hệ thống · Xuất/Nhập state JSON · Chạy toàn bộ kịch bản Go-live (kiểm tra kỹ thuật) · Reset tiến độ hướng dẫn. API console: `window.__timehouseDemo`.

## Quy ước & mặc định nghiệp vụ (OI còn mở)
- Mã phòng chuẩn hóa `A.12.03`; mã đợt Zalo `ZL-202610-xxx`.
- Nút thao tác trên dòng bảng ở dạng icon; rê chuột hoặc focus (Tab) vào icon để xem tên thao tác. Nút ⋮ mở menu thao tác đầy đủ.
- **Kỳ báo cáo**: chọn kỳ ở topbar hoặc trong bộ lọc trang đều đồng bộ với nhau; "Tất cả kỳ" (từ chuông việc cần xử lý) bỏ lọc kỳ cho trang đó.
- **Kết thúc HĐ**: mặc định phòng → Chờ dọn (BR-02); bỏ tick "Chuyển phòng sang Chờ dọn" thì phòng → Sẵn sàng ngay. Phòng không bao giờ kẹt ở Đang thuê khi không còn HĐ hiệu lực.
- **Zalo**: rule 3 ngày (không gửi lại khách vừa nhận tin) áp dụng cả ở nút Gửi nhắc nhanh – có ô "Vẫn gửi" để ghi đè khi demo; công nợ được re-check lại đúng lúc bấm Xác nhận gửi; rule đang tắt trong Cấu hình Zalo sẽ chặn tạo đợt gửi cùng sự kiện (FR-ZAL-01). Các đợt gửi lịch sử (seed) chỉ có số liệu tổng, không có chi tiết tin.
- **Chỉ số điện nước**: chỉ số đã dùng cho hóa đơn của HĐ trước không tái dùng cho HĐ mới cùng kỳ – wizard báo "Thiếu chỉ số (chỉ số cũ của HĐ trước)" và lấy chỉ số cũ = số đã chốt.
- **Xác nhận thu tiền** (nút $ trên dòng / chọn nhiều dòng ở Hóa đơn, Thu tiền & công nợ, chi tiết hóa đơn/khách): thu **đủ** số còn lại của các hóa đơn đã chọn, bắt buộc đính kèm minh chứng (có "Dùng minh chứng mẫu" cho demo), tự tách 1 khoản thu / khách. **Thu tiền thủ công** (đầu trang Thu tiền & công nợ, menu ⋮ → "Thu một phần / phân bổ thủ công"): chọn khách, thu một phần, phân bổ tay.
- Thu một phần: **cho phép**. Cờ "cần xử lý công nợ" = phát hành + 5 ngày (BR-07); nhãn Quá hạn theo hạn thanh toán.
- **Import hóa đơn**: Hóa đơn → "Import hóa đơn" (hoặc Import dữ liệu → Hóa đơn). 1 dòng = 1 hóa đơn theo số tiền (Tiền phòng trống = giá HĐ, Điện/Nước/Dịch vụ khác nhập thẳng số tiền); gắn vào HĐ hiệu lực của phòng, bỏ qua phòng đã có hóa đơn kỳ đó; tạo ở trạng thái **Nháp**. File mẫu: `assets/samples/mau-import-hoa-don.csv` hoặc nút "Tải file mẫu".
- Hoàn cọc: khấu hao cố định 200.000đ/phòng (BR-12); **không** tự bù trừ công nợ (OI-07); chỉ Admin/Kế toán duyệt (FR-FIN-07); phòng chỉ Sẵn sàng sau xác nhận dọn xong (BR-02).
- Zalo: ZBS Template Message; fallback SMS chưa dùng (OI-21); gửi thành công ≠ đã thanh toán.
- Mục sidebar gắn **P2/P3** là ngoài scope Phase 1, mở trang mô tả scope, không có action.

## Phase 2 – Sales, Automation & Operations (công tắc phase)

Bộ 18 màn PNG `Phase_2_Sales_Automation_Operations/` được dựng vào cùng mockup, gắn nhãn **P2** (chip cạnh tiêu đề trang, badge trên sidebar/nút/tab/menu, badge luồng trong panel hướng dẫn). Kế hoạch chi tiết: `Timehouse-Mockup-Plan-Phase2-v1.0.md`.

### Bật / tắt phase
- **Công cụ nâng cao** (cuối sidebar, Admin) → khối *Phạm vi demo*: Phase 1 luôn bật; **Phase 2** bật/tắt; Phase 3 có công tắc nhưng khóa (chưa có mockup).
- **Mặc định lần đầu mở: chỉ Phase 1.** Trạng thái phase lưu riêng `localStorage['timehouse-phase-v1']`, không nằm trong state nghiệp vụ → *Đặt lại dữ liệu demo / Xóa trắng / Nhập state JSON* **không** đổi phase; đổi phase không xóa dữ liệu.
- Tắt P2: mọi màn/nút hành xử y hệt bản Phase 1 (mục P2 mờ → trang coming-soon, nút P2 disabled). Đang đứng ở route P2 khi tắt → trang tự thành coming-soon (giữ URL); đang là Sale/Kỹ thuật → tự về Admin.
- Bật P2: mở thêm 2 vai trò **`sale`** (Nguyễn Thị Hương – Sale) và **`kythuat`** (Trần Minh Đức – Kỹ thuật) – đăng nhập hoặc *Chuyển vai trò* ở menu góc phải.
- Console: `__timehouseDemo.setPhase(2, true|false)`, `__timehouseDemo.phases()`, `__timehouseDemo.runAllP2()`.

### 18 màn Phase 2 → route
| Nhóm | PNG | Route |
|---|---|---|
| CRM | 04/01 Tổng quan kinh doanh | `#/crm` |
| CRM | 04/02 Lead & pipeline (Kanban kéo-thả / Bảng) | `#/crm/leads` |
| CRM | 04/03 Chi tiết lead | `#/crm/leads/:id` |
| CRM | 04/04 Đặt lịch xem phòng (wizard 4 bước) | `#/crm/viewings/new?lead=` · danh sách `#/crm/viewings` |
| CRM | 04/05 Giữ chỗ phòng (wizard 4 bước, countdown) | `#/crm/holds/new?lead=` · danh sách `#/crm/holds` |
| CRM | 04/06 Chốt thuê (wizard 5 bước) | `#/crm/deals/new?lead=` → `#/contracts/new?deal=` |
| CRM | 04/07 Giao dịch & hoa hồng | `#/crm/deals` · chi tiết `#/crm/deals/:id` |
| Hợp đồng | 02/05 Review trích xuất hợp đồng (OCR) | `#/contracts/ocr` → `#/contracts/new?ocr=` |
| Tài chính | 03/06 Nhập bảng kê thu tiền | `#/finance/statement-import` |
| Tài chính | 03/09 Duyệt hoàn cọc (yêu cầu chỉnh sửa, hiện trạng, ghi chú) | `#/refunds/:id` (layout P2 khi bật) |
| Tài chính | 03/11 Chuyển số dư ban đầu | `#/finance/opening-balance` |
| Tài chính | – Quản lý cọc (sidebar, không có PNG) | `#/finance/deposits` |
| Zalo | 05/05 Chi tiết lần gửi (provider 200/300/403/408, retry, log, donut) | `#/zalo/batches/:id` · chính sách retry/mẫu ở `#/zalo/config` |
| Bảo trì | 06/01 Bảo trì & sự cố | `#/maintenance` · chi tiết `#/maintenance/incidents/:id` |
| Bảo trì | 06/02 Lịch bảo dưỡng (lịch tháng) | `#/maintenance/schedules` |
| Báo cáo | 08/01 Trung tâm báo cáo (32 báo cáo) | `#/reports/hub` · báo cáo chuẩn `#/reports/r/:key` |
| Báo cáo | 08/02 Báo cáo dòng tiền & quản lý kỳ (khóa kỳ) | `#/reports/cashflow` |
| Data Job | 10/05 Danh sách tác vụ (tên file PNG bị đảo) | `#/settings/jobs` |
| Data Job | 10/04 Chi tiết job (Kiểm tra lại / Thử lại phần đủ điều kiện) | `#/settings/jobs/:id` |

Điểm nối P2 trong màn P1 khi bật: Phòng → *Tạo sự cố* + tab *Sự cố*; Tòa nhà → tab *Hiệu suất*, *Lưu bộ lọc*; Khách thuê → *Lưu bộ lọc*; Hóa đơn → *Bộ lọc nâng cao* (tòa, khách, khoảng tiền, đã nhắc Zalo, quá hạn); Chi phí → *Khấu hao* (số tháng); Chủ nhà → *Nhắc thanh toán Zalo*; Danh mục → tab *Nguồn khách*, *Nhà cung cấp*; Import → tile *Bảng kê*, *Lead*; Báo cáo P1 → *Trung tâm báo cáo*; Tạo HĐ → radio *Tải hợp đồng* → OCR.

### Kịch bản demo Phase 2 (panel Hướng dẫn thao tác, +6 luồng / 23 mốc khi bật P2)
F11 CRM: lead → gọi → lịch xem → giữ chỗ → chốt thuê → HĐ → thu cọc → hoa hồng đã chi · F12 OCR hợp đồng (file mẫu 5 trường sai) · F13 Bảng kê thu tiền → Data Job kiểm tra lại/thử lại → số dư đầu kỳ · F14 Sự cố (Vận hành tạo, Kỹ thuật xử lý, chi phí) → lịch bảo dưỡng (nhắc 7 ngày) · F15 Ghim báo cáo → khóa kỳ 10/2026 → Zalo retry 403/408 · F08.5 Hoàn cọc yêu cầu chỉnh sửa → sửa → duyệt lại. Nút *▶ Chạy kịch bản Phase 2 (kỹ thuật)* trong Công cụ nâng cao chạy toàn bộ bằng actions; chạy lại nhiều lần được (tự mở lại kỳ đã khóa, bỏ qua bước đã có dữ liệu).

### Quy ước & giả định Phase 2 (ghi rõ để BA xác nhận)
- Mã hoàn cọc dùng `RC…` của P1 (PNG P2 ghi `HC-001`); đợt Zalo hero `ZL-202610-104` (PNG `ZL-2026-104`); lead `LD-2026-081` là hero (Trần Minh Đức, cột Cân nhắc).
- Hoa hồng: 10% giá thuê tháng đầu, chi một lần, idempotent; đủ điều kiện khi **cọc thu đủ và HĐ kích hoạt** (BR-13/OI-14); hủy/kết thúc HĐ → về tạm tính, không tạo khoản mới.
- Giữ chỗ tối đa 14 ngày, phí trừ vào cọc (OI-09), tự hết hạn theo ngày demo → phòng Sẵn sàng; khách thuê được tạo từ lead ngay khi giữ chỗ. Kanban: kéo thẻ vào *Giữ chỗ*/*Chốt thuê* mở wizard tương ứng; thẻ đang giữ chỗ không kéo lùi được (phải hủy giữ chỗ trước); vai trò chỉ xem không kéo được.
- Số dư đầu kỳ: mỗi HĐ tạo **1 hóa đơn `kind:'opening'`** (kỳ = mốc) + 1 khoản thu `kind:'opening'` cho phần đã thu → tái dùng công nợ/nhắc nợ P1, không sinh khoản thu ngoài số dư.
- Dòng tiền: thu thật từ khoản thu (FR-REP-02), chi loại trừ khấu hao (BR-08), cọc/phí giữ chỗ tách riêng (BR-20). Khấu hao đường thẳng theo số tháng nhập tay (OI-11). Hiệu suất tòa = ngày có khách / ngày kỳ, tòa bảo trì = N/A (BR-09, OI-12).
- Khóa kỳ (FR-FIN-08): checklist 6 mục (3 tự động theo dữ liệu – có thể xác nhận tay sau rà soát, 2 tick tay, 1 = bấm Khóa); sau khóa `recordPayment / issueInvoice / adjustInvoice / createInvoiceDrafts / saveExpense / reversePayment` trong kỳ bị chặn; báo cáo dùng snapshot.
- Zalo: mã lỗi P1 `ZLM-1001/2003` ↔ provider `300/403`, thêm `408 Timeout`; retry chỉ 403/408 và chưa quá số lần trong chính sách; 300 là lỗi vĩnh viễn (fallback SMS mô phỏng nếu bật – OI-21). *Tải log (.xlsx)* / *Tải template* xuất CSV (offline, không SheetJS).
- Trung tâm báo cáo: 32 báo cáo, 10 chạy thật trên dữ liệu (`cashflow, expense-by-building, operating-result, occupancy, refunds, room-status, maintenance, sales-performance, leads-funnel, customer-segment`), 18 báo cáo nhãn **OI** mở trang "Công thức chờ chốt", 4 báo cáo Đầu tư → P3.
- Mục scope không có PNG (Kênh cho thuê, Marketing, Thiết lập hệ thống) → coming-soon "Chưa có mockup UI". Kiểm kê hàng tháng = P3.
- File mẫu mới: `assets/samples/mau-bang-ke-thu-tien.csv` (20 dòng: khớp mã HĐ, khớp khách + số tiền, không ghép, trùng, hóa đơn nháp), `mau-so-du-dau-ky.csv` (13 dòng, 2 chênh lệch, 1 HĐ không tồn tại), `mau-hop-dong-ocr.txt`. Trong app các file mẫu được sinh từ dữ liệu hiện có (nút *Dùng file mẫu*).
- State `schema = 3`: state cũ (v2) được migrate và seed bổ sung dữ liệu P2 trên dữ liệu hiện có (idempotent `meta.p2Seeded`), không mất dữ liệu người dùng.

## Cấu trúc
`index.html` · `css/` (tokens, base, components, pages) · `js/core/` (format, store, phase, seed, seed-p2, selectors, selectors-p2, auth, actions, import, actions-p2, router, guide, guide-p2) · `js/ui/` (icons, components, table, chart, components-p2, layout, forms) · `js/pages/` (1 file / nhóm màn; P2: crm, ocr, finance2, maintenance, reportHub, jobs, zalo2) · `assets/samples/` (CSV mẫu import).
