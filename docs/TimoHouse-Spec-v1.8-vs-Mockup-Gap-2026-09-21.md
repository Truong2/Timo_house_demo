# TimoHouse – Đối chiếu Spec v1.8 (OCR Data Onboarding) với Mockup hiện tại

> **Ngày lập:** 21/09/2026 · **Nhánh:** `develop` @ `545d277`
> **Nguồn spec:** `docs_timonouse/TimoHouse_Mo_Ta_Chuc_Nang_3_Phase_v1.8_OCR_Data_Onboarding.md` (Review Draft 1.8, 20/09/2026)
> **Nguồn mockup:** `mockup/` (SPA vanilla JS – `js/ui/layout.js`, `js/core/*`, `js/pages/*`)
> **Mục đích:** Liệt kê chi tiết những gì mockup **cần sửa / bổ sung / bỏ** để bám đúng spec v1.8, dùng làm backlog cho các vòng chỉnh mockup tiếp theo.
> **Tiến độ:** ✅W1 = đã xử lý ở Wave 1 (nhánh `feat/w1-org-scope`, 21/09/2026): scope tổ chức, phân công tòa nhà single source of truth, lịch sử loại tòa, master data, menu §8, bỏ gate phase cho OCR/HR/Cổ đông. GAP-BLD-05 hoàn thành trừ tab Báo cáo (W5); GAP-OCR-01 mới bỏ gate route, luồng v1.8 làm ở W2. ✅W2 = đã xử lý ở Wave 2 (nhánh `feat/w2-ocr-onboarding`, 21/09/2026): OCR Data Onboarding §12.8 (job/hash/13 nhóm entity/Create-Link-Update-Ignore/validate/commit rollback/kết quả), bảng giá 2 lớp §12.9, Deposit Ledger, người thuê theo HĐ, điều khoản & tài sản bàn giao theo HĐ, công tơ; 🔶W2 = một phần. ✅W3 = đã xử lý ở Wave 3 (nhánh `feat/w3-rental-states`, 21/09/2026): state machine phòng/HĐ + lịch sử, kết thúc HĐ đủ bước & công thức hoàn cọc §4.18, Work Queue HĐ sắp hết, Điện/Nước theo kỳ, Kỳ hóa đơn, thu tiền chưa xác định/thu thừa, khách thuê trạng thái & bulk/export, HĐ đầu vào HKD/PCCC/loại tòa/workflow, tài liệu docType/phiên bản, Dashboard KPI & Work Queue; 🔶W3 = một phần (M1/M2/M3 ở W4). ✅W4 = đã xử lý ở Wave 4 (nhánh `feat/w4-payroll-expense`, 21/09/2026): mốc thu M1/M2/M3 trên Payment Allocation + KPI tài chính 10 ô, màn Hiệu suất thu tiền NV × tòa, Payroll Rule Version + snapshot + bảng lương cấu phần §4.26.5 (Mở kỳ → Review → Điều chỉnh có lý do → Duyệt → Khóa → Reopen), Payroll Cost Allocation, màn Chi lương (từng người/hàng loạt/partial/import), danh mục chi phí §4.27.3 + phiếu đủ dữ liệu + hoa hồng P1 + phân bổ (5 phương thức, nhóm T/S/G) + import có phát hiện trùng; 🔶W4 = một phần, phần còn lại sang W5 (drill-down báo cáo, allocation_result). ✅W5 = đã xử lý ở Wave 5 (nhánh `feat/w5-reports-shares`, 21/09/2026): Metric Registry theo `metric_code` + business_confirmation_status + xác nhận Q-RPT, Report Engine (Report A một tòa 11 nhóm dòng + bảng cổ phần, Report B Total/T/S/G theo lịch sử loại tòa, drill-down về chứng từ), kỳ báo cáo Open → Reviewing → Locked → Reopened với snapshot freeze, đối soát golden G1 tháng 6 (19 metric MATCH từng line) & tháng 8, cổ phần theo tòa có hiệu lực (100%, không ghi đè), góp vốn theo tòa → đợt → phân bổ theo cổ phần, phân phối LN generate từ báo cáo khóa với tỷ lệ snapshot; 🔶W5 = một phần.

---

## 0. Cách đọc tài liệu

| Ký hiệu | Ý nghĩa |
|---|---|
| 🔴 **Thiếu** | Spec yêu cầu, mockup chưa có màn/luồng/dữ liệu – phải xây mới |
| 🟠 **Khác spec** | Mockup có nhưng mô hình/luồng khác spec – phải sửa lại |
| 🟡 **Một phần** | Có nền, cần bổ sung field/action/tab |
| 🟢 **Đạt** | Mockup đã đáp ứng, không cần sửa |
| ⚪ **Phase sau** | Spec xếp ở Phase 2/3, chưa cần cho Phase 1 |

**Ưu tiên** (theo mục tiêu Phase 1 = vận hành thuê thực tế + sinh được 2 báo cáo Excel nguồn):

- **P0** – Chặn nghiệm thu Phase 1 / chặn 2 báo cáo Excel (spec §4.33, §12.23, §21).
- **P1** – Spec đã chốt (§10.1 "Đã chốt"), cần có trước khi freeze SRS.
- **P2** – Nên có, có thể để vòng sau.

Mã gap: `GAP-<phân hệ>-<số>` để tham chiếu khi tạo task.

---

## 1. Tóm tắt điều hành

### 1.1. Bốn khác biệt cấu trúc lớn nhất

| # | Vấn đề | Spec v1.8 | Mockup hiện tại | Tác động |
|---|---|---|---|---|
| A | **Phạm vi Phase 1 bị lệch** | OCR hợp đồng, Cơ cấu tổ chức, Nhân viên, Phân công tòa, Bảng lương/Chi lương, Cổ đông/Cổ phần/Góp vốn/Chia LN cơ bản đều thuộc **Phase 1** (§2, §4.10, §4.23–4.32, §9) | OCR gắn `phase: 2` (`pages/ocr.js`); HR (`pages/hr.js`) và Đầu tư (`pages/investment.js`) gắn `phase: 3`, chỉ role `hr`/`codong` thấy menu | Bật P1 mặc định sẽ **không demo được** chuỗi nội bộ và báo cáo cổ đông; phải chuyển gate phase + mở menu cho Admin |
| B | **Quản lý tòa không phải single source of truth** | `Nhân sự → Phân công tòa nhà` là nguồn duy nhất; **không lưu `manager_id` trên Tòa** (§4.6, §4.25, §10.17) | `buildings[].managerId`, `rooms[].managerId`, `contracts[].managerId`, `tenants[].managerId` lưu cứng theo `users`; `buildingAssignments` (P3) tồn tại song song, không được dùng để suy ra scope/dashboard/payroll | Sai lịch sử khi điều chuyển; RBAC `ops` đang scope theo `users.buildingIds`, không theo assignment có hiệu lực theo ngày |
| C | **OCR chỉ prefill form Hợp đồng** | `Contract OCR → Data Onboarding`: review theo **13 nhóm entity**, quyết định `Create/Link/Update/Ignore`, **commit 1 transaction** tạo Customer/Building/Room/Contract/Services/Deposit/Vehicle/Opening Meter/Handover Asset/Payment Terms/Renewal Clause/Document (§12.8) | Upload → extract → review field phẳng (nhóm theo `P.GROUPS`) → `Tạo hợp đồng` = redirect `#/contracts/new?ocr=` prefill; chỉ Khách thuê có Create/Link; tài sản bàn giao "chỉ đọc"; không ghi chỉ số đầu kỳ, điều khoản thanh toán, gia hạn | Đây là thay đổi chính của v1.8 – cần dựng lại màn Review + màn Kết quả commit |
| D | **Báo cáo Phase 1 chưa có Report Engine theo spec** | Report A (chi tiết 1 tòa – mẫu "Báo cáo tháng 6") và Report B (tổng T/S/G – mẫu "Tháng 8") với `metric_code`, `NEED_BUSINESS_CONFIRMATION`, drill-down, snapshot/lock/reopen, Golden dataset, bảng cổ phần (§4.28, §12.23) | `#/reports` = 3 báo cáo vận hành; `#/reports/hub` (P2) có ~40 báo cáo + nhóm "Đối soát workbook" với metric registry `core/metrics.js` (16 metric, nhãn "Giả định") | Không sinh được đúng layout 2 báo cáo Excel nguồn; metric code không khớp spec |

### 1.2. Thống kê nhanh

| Nhóm | Số gap | 🔴 | 🟠 | 🟡 |
|---|---:|---:|---:|---:|
| Nền tảng & menu (§2) | 11 | 3 | 4 | 4 |
| Dashboard & scope tổ chức (§3) | 6 | 3 | 1 | 2 |
| Chủ nhà / HĐ đầu vào / Tòa / Phòng (§4) | 23 | 7 | 2 | 14 |
| Khách thuê / Hợp đồng / OCR / HĐ sắp hết (§5) | 35 | 14 | 7 | 14 |
| Dịch vụ / Điện nước / Hóa đơn / Thu tiền / Công nợ (§6) | 20 | 6 | 1 | 13 |
| Kết thúc / Cọc / Hoàn cọc (§7) | 4 | 2 | 1 | 1 |
| Zalo / Template / Lịch sử (§8) | 8 | 3 | 3 | 2 |
| Tổ chức / Nhân sự / Phân công / Payroll / Chi lương (§9) | 19 | 8 | 6 | 5 |
| Chi phí (§10) | 7 | 1 | 2 | 4 |
| Báo cáo Phase 1 (§11) | 10 | 8 | 0 | 2 |
| Cổ đông / Cổ phần / Góp vốn / Phân phối (§12) | 6 | 2 | 2 | 2 |
| Phase 2 & 3 (§13) | 9 | 3 | 1 | 5 |
| **Tổng** | **158** | **60** | **30** | **68** |

(Không tính các dòng 🟢 Đạt và ⚪ Phase sau.)

---

## 2. Nền tảng, menu và nguyên tắc xuyên suốt

### 2.1. Menu đề xuất (§8) vs sidebar hiện tại (`ui/layout.js` `ROLE_NAV_LAYOUT.admin`)

| Spec §8 | Mockup Admin | Trạng thái | Việc cần làm |
|---|---|---|---|
| Tổng quan | `#/dashboard` | 🟢 | – |
| **Vận hành**: Hợp đồng · Tòa & Phòng · Khách thuê · Kết thúc / Hoàn cọc | Nhóm "Quản lý cho thuê": Phòng, Tòa nhà, Khách thuê, Hợp đồng, Trích xuất HĐ (P2), Chủ nhà | 🟡 | Đổi tên nhóm; thêm mục **Kết thúc / Hoàn cọc** (gộp queue kết thúc + `#/refunds`); bỏ tag P2 khỏi OCR |
| **Tài chính**: Hóa đơn · Thu tiền & Công nợ · Chi phí · **Kỳ tài chính** | Hóa đơn, Thu tiền & công nợ, Hoàn cọc, Quản lý cọc (P2), Chi phí, Ngân hàng (P3) | 🟡 | Thêm **Kỳ tài chính / Billing Period** (mã kỳ, từ–đến, ngày chốt, lock) – hiện chỉ có `periods` P2 ở `#/reports/cashflow` |
| **Kinh doanh**: CRM · Deal · Hoa hồng | CRM overview, Lead, Lịch xem, Giữ chỗ, Giao dịch & hoa hồng (P2) | 🟢 (P2) | – |
| **Nhân sự**: Tổ chức · Nhân viên · Phân công · Bảng lương · Chi lương | Chỉ role `hr` (P3): Nhân viên, Chấm công, Lương thưởng | 🔴 | Đưa nhóm **Nhân sự** vào menu Admin ở P1; thêm **Cơ cấu tổ chức**, **Phân công tòa nhà**, **Hiệu suất thu tiền**, **Chi lương**; Chấm công ngoài spec (giữ hoặc ẩn) |
| **Tài sản**: Tài sản · Kiểm kê · Bảo trì | Tài sản (P3), Kiểm kê (P3), Bảo trì (P2) | 🟡 | Spec: Tài sản & Kiểm kê là **P2** (§5.14–5.15), mockup gắn P3 → đổi gate `phase: 3 → 2` |
| **Đầu tư**: Cổ đông [P1] · Góp vốn [P1] · Phân phối LN [P1 cơ bản] · Investor Analytics [P3] | Chỉ role `codong` (P3): Dự án, Vốn góp & phân phối, Hiệu quả đầu tư | 🔴 | Mở nhóm **Đầu tư** cho Admin/Kế toán ở P1 với 3 mục Cổ đông / Góp vốn / Phân phối LN; giữ ROI/Dự án ở P3 |
| **Thông báo**: Danh sách gửi · Lịch sử gửi · Message Template | Trong nhóm Vận hành: Lịch sử gửi Zalo, Thông báo & nhắc việc | 🟡 | Tách nhóm **Thông báo** riêng; thêm màn **Danh sách cần gửi** (queue) và màn **Message Template** độc lập (hiện template chỉ là drawer trong `#/zalo/config`) |
| Báo cáo | Báo cáo tổng quan, Trung tâm báo cáo (P2), Dòng tiền (P2) | 🟡 | Xem §11 |
| **Cài đặt**: Zalo Integration · Reminder Rules · Dịch vụ & Bảng giá · Master Data · Permission · System | App launcher: Tài khoản & phân quyền, Danh mục, Import dữ liệu, Công cụ hệ thống | 🟡 | Thêm nhóm **Cài đặt** vào sidebar; tách **Zalo Integration** (OA/App ID/credential/webhook/test) khỏi Reminder Rules; **Master Data** đủ danh mục §7.5 |

**GAP-NAV-01 ✅W1 🟠 P1** – Bỏ gate `phase: 2` cho `ocr`; bỏ gate `phase: 3` cho `hr`, `payroll`, `shareholders`; thêm các NAV_ITEMS mới: `org`, `assignments`, `collection-perf`, `salary-payment`, `capital`, `distribution`, `billing-periods`, `zalo-queue`, `zalo-templates`, `zalo-integration`, `master-data`.
**GAP-NAV-02 ✅W1 🟠 P1** – Cập nhật `ROLE_NAV_LAYOUT` cho `admin`, `accountant`, `ops`, `hr` theo bảng trên; thêm vai trò **Quản lý Tổng / TPVH** (§12.1.2, §16) – hiện `auth.js` chỉ có 7 role, không có cấp quản lý theo cây tổ chức.
**GAP-NAV-03 🟡 P2** – `mockup/README.md` và `00_SCOPE_3_PHASE.md` mô tả phase theo bản cũ; cập nhật lại bảng phase theo §9 spec.

### 2.2. Nguyên tắc bắt buộc (§10) chưa được mockup phản ánh

| § | Nguyên tắc | Mockup | Gap |
|---|---|---|---|
| 10.4 / 10.6 | Quan hệ tổ chức & phân công có ngày hiệu lực; báo cáo lịch sử dùng assignment tại thời điểm báo cáo | Không có `orgUnits`; `buildingAssignments` chỉ dùng hiển thị tab "Nhân sự phụ trách" | **GAP-CORE-01 ✅W1 🔴 P0** – Thêm collection `orgUnits`, `orgMemberships` (employee ↔ unit ↔ position, effective from/to), hàm `Q.assignmentAt(buildingId, date, role)` và `Q.scope()` resolve theo **cây tổ chức + ngày** thay vì `managerId` |
| 10.17 | Không lưu `manager_id` độc lập trên Tòa | `buildings.managerId` là nguồn chính cho RBAC/filter | **GAP-CORE-02 ✅W1 🟠 P0** – `managerId` chuyển thành **giá trị dẫn xuất** (computed từ assignment `Phụ trách chính` tại ngày); form Tòa bỏ ô "Người phụ trách", thay bằng nút "Thay đổi quản lý → Nhân sự" |
| 10.8 | Message Template phải có version | `zaloTemplates` chỉ có code/name/body | GAP-ZAL-05 (xem §8) |
| 10.11 | Cọc phải có ledger | `Q.deposits()` tổng hợp on-the-fly từ payments/holds/refunds; không có bảng `depositLedger` | GAP-DEP-01 (xem §7) |
| 10.12 / 10.14 | Payroll khóa không đổi khi điều chuyển; cổ phần theo tòa có hiệu lực theo thời gian, báo cáo dùng snapshot | Payroll tính lại từ dữ liệu sống; cổ đông tỷ lệ theo **dự án**, không có effective date | GAP-HR-10, GAP-INV-02 |
| 10.18 | Audit log cho mọi dữ liệu quan trọng | `store.audit()` có, hiển thị tab "Lịch sử" từng entity; **không có màn Audit Log toàn hệ thống** với before/after/reason | **GAP-CORE-03 🔴 P1** – Màn `#/settings/audit` (filter user/entity/action/thời gian; cột before/after/reason/batch_id theo §19) |
| §7.3 Document Center | Hợp đồng, phụ lục, pháp lý, PCCC, CCCD, chứng từ, ảnh, file OCR, **phiên bản**, quyền xem | `#/documents` liệt kê theo entity; `documents` không có `version`, `docType` chuẩn, `replaces` | **GAP-CORE-04 ✅W3 🟡 P1** – Thêm `docType` (danh mục: Giấy đăng ký HKD, PCCC, Sổ đỏ, HĐ, Phụ lục, CCCD, Biên bản bàn giao, File OCR…), `version`, `supersedesId`; upload "thay thế" tạo version mới không xóa cũ (§4.5) |
| §7.4 Import Center | File, sheet, mapping, total/valid/warning/error/confirmed, người import, source row | `#/settings/import` + `#/settings/jobs` (P2) có mapping/preview/tổng dòng | **GAP-CORE-05 🟡 P1** – Bỏ gate P2 cho Data Jobs; thêm loại import **Chi phí**, **Bảng giá dịch vụ**, **Nhân viên**, **Cổ đông/Cổ phần**; mỗi dòng có trạng thái `valid/warning/error/approved_override` (§18.2) |
| §7.5 Master Data | Building type, Room type, **Customer status**, Service, Expense category, Contract reason, Termination reason, Payment method, Position, Org type, Asset type, Lead source, Commission recipient type, Notification event | `#/settings/catalog`: Dịch vụ, Khu nhà, Team KD, Nhóm chi phí, PTTT, Nguồn khách (P2), NCC (P2) | **GAP-CORE-06 ✅W1 🔴 P1** – Thêm tab: **Ký hiệu loại tòa** (mở rộng ngoài T/S/G), **Loại phòng**, **Trạng thái khách hàng**, **Lý do kết thúc HĐ**, **Chức danh**, **Loại đơn vị tổ chức**, **Vai trò phân công**, **Sự kiện thông báo** |
| §7.6 Metric Registry | Code, Name, Formula, Data source, Version, Effective date, Owner, Exception; Dashboard & Report dùng chung | `core/metrics.js` có label/formula/includes/excludes/status/owner nhưng **key không theo `metric_code` spec** (`revenue.rent` vs `RENT_REVENUE`), không có version/effective date | **GAP-CORE-07 ✅W5** – Đổi registry sang `metric_code` §12.23.3/§12.23.6 (`TOTAL_REVENUE`, `RENT_REVENUE`, `COGS`, `GROSS_PROFIT`, `NET_MARGIN`…) kèm `business_confirmation_status` |
| §7.1 RBAC | Role + Org Unit + Assignment + Building + Function; tách "được phân công / được xem / được sửa / được duyệt" | `auth.js`: role → permission list; `ops` scope theo `users.buildingIds` | **GAP-CORE-08 🟡 P1** – Màn Tài khoản: thêm cột "Đơn vị tổ chức", "Data scope (tự suy từ assignment)", ma trận quyền theo 4 cấp; scope `ops/TPVH/Lead` resolve qua cây tổ chức |

---

## 3. Dashboard & Work Queue (§4.2, §4.3, §12.1)

**File:** `pages/dashboard.js`

| Gap | Mức | Ưu tiên | Spec | Mockup | Việc cần làm |
|---|---|---|---|---|---|
| GAP-DASH-01 ✅W3 | 🟡 | P1 | **KPI phòng** 9 chỉ số: tổng tòa, tổng phòng, đang thuê, sẵn sàng, giữ chỗ, chờ dọn, bảo trì, **sắp trống**, tỷ lệ lấp đầy | View "Công việc": 4 KPI; view "Điều hành": 3 KPI trống + 3 KPI thu | Dựng khối **KPI phòng** đủ 9 ô (cần trạng thái `Sắp trống` – GAP-ROOM-01) |
| GAP-DASH-02 ✅W3 | 🔴 | P1 | **KPI hợp đồng** 7: hiệu lực, sắp hết hạn, còn ≤35 ngày, chờ gia hạn, chờ kết thúc, chờ quyết toán, phá HĐ trong kỳ | Chỉ "HĐ sắp hết hạn" | Thêm khối KPI HĐ; phụ thuộc trạng thái HĐ mới (GAP-CT-01) |
| GAP-DASH-03 ✅W4 | 🔴 | P0 | **KPI tài chính** 10: tổng phải thu, đã thu, còn phải thu, quá hạn, **thu M1/M2/M3**, thu thừa, cọc đang giữ, cọc chờ hoàn | Có phải thu/đã thu/quá hạn; không có M1/M2/M3, thu thừa, cọc | Thêm khối KPI tài chính; M1/M2/M3 cần `payments` gắn mốc (GAP-PAY-01) và cọc cần ledger (GAP-DEP-01) |
| GAP-DASH-04 ✅W4 (W3 9 mục; import chi phí lỗi đếm từ W4) | 🟡 | P1 | **Work Queue** 9 mục: OCR chờ review, HĐ sắp hết, HĐ chưa phát hành, khách còn nợ, Zalo lỗi, HĐ chờ quyết toán, hoàn cọc chờ duyệt, phòng chờ dọn, **import chi phí lỗi** | Admin: 5 mục (nợ quá hạn, HĐ sắp hết, Zalo lỗi, hoàn cọc đang xử lý, kỳ trả chủ nhà) | Bổ sung 5 mục còn thiếu; `Q.todo()` thêm `ocrReview`, `draftInvoices`, `settlementPending`, `cleaningRooms`, `expenseImportErrors` |
| GAP-DASH-05 ✅W1 |  | P0 | **Bộ lọc chung** §12.1.3: kỳ/ngày tham chiếu, **Tổ chức (node cây)**, Nhân sự (cascading theo tổ chức), Khu vực, Loại tòa (hiệu lực trong kỳ), Tòa (trong scope), Trạng thái phòng, Trạng thái HĐ, Mốc thu M1/M2/M3 | `U.dimFilter` với `period, areaId, buildingId, managerId, leadId` | Thêm dimension `orgUnitId` (tree-select), `employeeId` cascading, `roomStatus`, `contractStatus`, `milestone`; `buildingType` phải resolve theo lịch sử tại kỳ (GAP-BLD-03) |
| GAP-DASH-06 ✅W1 |  | P0 | **Chống đếm trùng** & scope theo `Phụ trách chính` (§4.3, §12.1.6); scope theo **thời gian** (T01 tháng 9 thuộc TPVH1, tháng 10 thuộc TPVH2) | Scope theo `managerId`/`leadId` tĩnh | Viết lại `Q.scope(f)` theo GAP-CORE-01; ví dụ §4.3 phải tái hiện được trong seed (1 tòa đổi quản lý ngày 01/10) |

---

## 4. Chủ nhà · Hợp đồng đầu vào · Tòa nhà · Phòng

### 4.1. Chủ nhà (§4.4, §12.2) – `pages/landlords.js`, `forms.js Fm.landlord`

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-LL-01 | 🟡 | P2 | Danh sách thiếu cột **Mã chủ nhà, CCCD/MST, Email, Địa chỉ, Số hợp đồng** (hiện: Chủ nhà/Đối tác, Liên hệ, Số tòa, HĐ hiệu lực, Lịch trả gần nhất, Trạng thái) |
| GAP-LL-02 | 🟡 | P2 | Hồ sơ thiếu **Người đại diện** (tổ chức), **Ngày cấp/Nơi cấp** (cá nhân); thêm filter CCCD/MST, Tòa, HĐ hiệu lực/sắp hết |
| GAP-LL-03 | 🟡 | P2 | Rule §12.2.4: cảnh báo **trùng CCCD/MST/SĐT** khi tạo; **không xóa cứng** chủ nhà có HĐ/tòa (hiện chỉ "Ngừng hoạt động" – đạt một phần); tài khoản ngân hàng đổi phải giữ lịch sử |
| GAP-LL-04 | 🟢 | – | Tabs chi tiết (Tổng quan / Tòa nhà / HĐ đầu vào / Lịch thanh toán / Tài liệu / Lịch sử) đã khớp §4.4 |

### 4.2. Hợp đồng đầu vào (§4.5, §12.3) – `forms.js Fm.landlordContract`

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-HL-01 ✅W3 | 🔴 | P1 | **Trạng thái HKD** (`Chưa đăng ký / Đã đăng ký`) trên HĐ đầu vào; **tự chuyển "Đã đăng ký" khi upload tài liệu loại "Giấy đăng ký hộ kinh doanh"** gắn đúng HĐ/tòa; người có quyền chỉnh lại kèm lý do; audit từng lần đổi. Hiện chỉ có `buildings.license`/`licenseExpiry` (text) – sai vị trí và không có luồng |
| GAP-HL-02 ✅W3 | 🔴 | P1 | **Ký hiệu/loại tòa theo HĐ** với **ngày hiệu lực** → ghi `buildingTypeHistory` (§4.6). Form HĐ đầu vào chưa có field này |
| GAP-HL-03 ✅W3 | 🟡 | P1 | Form thiếu: **Lịch tăng giá** (nhiều dòng: từ ngày – giá mới), **Ngày đến hạn thanh toán**, **Tài khoản người nhận**, **PCCC** (trạng thái/hạn), **Tài sản bàn giao**, **Phụ lục**, file HĐ. Hiện chỉ có ngày ký, loại, bắt đầu/kết thúc, giá, cọc, giữ giá, chu kỳ, ghi chú |
| GAP-HL-04 ✅W3 | 🔴 | P1 | **Workflow HĐ đầu vào**: Tạo dự thảo → Kích hoạt → Gia hạn → Kết thúc (§12.3.5). Hiện `status` suy diễn từ ngày (`Q.lcStatus`), không có action Kích hoạt/Gia hạn/Kết thúc/Thêm phụ lục |
| GAP-HL-05 ✅W3 | 🟡 | P2 | **Lịch sử điều chỉnh giá** và **lịch sử tài liệu (version)** – gắn với GAP-CORE-04 |
| GAP-HL-06 | 🟡 | P2 | Event `HEAD_LEASE_ACTIVATED` (§17) cập nhật tòa/loại tòa/lịch trả – hiện lịch trả sinh ngay khi tạo HĐ |

### 4.3. Khu nhà / Tòa nhà (§4.6, §12.4) – `pages/buildings.js`

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-BLD-01 ✅W1 |  | P0 | **Bỏ `managerId` làm nguồn chuẩn**; cột "Quản lý phụ trách" và ô "Người phụ trách" đọc từ `buildingAssignments` (Phụ trách chính, hiệu lực tại ngày). Thêm cột/ô **Quản lý sắp tới** (assignment đã duyệt, `effective_from` tương lai) |
| GAP-BLD-02 ✅W1 |  | P0 | Action **"Thay đổi quản lý"** ở chi tiết tòa → điều hướng `#/hr/assignments/new?buildingId=` (module Nhân sự), **không** mở form riêng ở Tòa (§4.6 "Quản lý đang phụ trách tòa") |
| GAP-BLD-03 ✅W1 |  | P0 | **Lịch sử ký hiệu loại tòa** (`buildingTypeHistory`: type, effectiveFrom, effectiveTo, source HĐ đầu vào, người sửa). Action "Cập nhật ký hiệu/loại tòa" bắt buộc nhập ngày hiệu lực; báo cáo kỳ cũ resolve type theo kỳ. Hiện `buildingType` tĩnh + nhãn "Giả định" (`U.assume()`) |
| GAP-BLD-04 ✅W1 |  | P1 | Danh mục loại tòa **mở rộng được** ngoài T/S/G (Master Data – GAP-CORE-06); bỏ nhãn "Giả định" sau khi có lịch sử |
| GAP-BLD-05 ✅W5 (W1 tabs; W5 tab Báo cáo = tóm tắt Report A + link) |  | P1 | Tabs chi tiết theo §4.6: thêm **Khách thuê, Hợp đồng, Hóa đơn, Công nợ, Báo cáo**; đổi "Nhân sự phụ trách" → **Nhân sự / Phân công** (đọc từ assignment: hiện tại / sắp tới / vai trò / ngày hiệu lực / lịch sử, nút "Xem lịch sử phân công", "Xem phân công sắp tới"). Hiện có: Tổng quan, Chủ nhà & HĐ đầu vào, Phòng, Nhân sự phụ trách, Dịch vụ, Tài sản (P3), Chi phí, Hiệu suất (P2), Tài liệu, Lịch sử |
| GAP-BLD-06 ✅W2 | 🔴 | P1 | Tab **Dịch vụ & Bảng giá** của tòa: xem giá đang áp dụng (mặc định hay override), **Override giá cho tòa** (ngày hiệu lực), **Lịch sử giá** (§4.12 "Màn hình"). Hiện chỉ liệt kê dịch vụ có scope chứa tòa |
| GAP-BLD-07 | 🟡 | P2 | Danh sách thiếu cột **Số phòng đang thuê / Số phòng trống** tách riêng (hiện "Phòng sẵn sàng"), **HĐ đầu vào đang áp dụng** tách cột; `Trạng thái khai thác`, `Ngày bắt đầu vận hành` (có `operatingSince` – đạt) |
| GAP-BLD-08 | 🟡 | P2 | Action **Export dữ liệu tòa** theo filter (có CSV – đạt); **Import phòng** (có – đạt) |

### 4.4. Phòng (§4.7, §12.5) – `pages/rooms.js`, `selectors.js Q.L.room`

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-ROOM-01 ✅W3 | 🟠 | P1 | **State machine** §12.5.3: thêm trạng thái **`Sắp trống`** (DangThue → SapTrong khi có ngày trả xác nhận; SapTrong → ChoDon), **`Ngừng khai thác`** tách khỏi Bảo trì (hiện `inactive` dùng chung); chuyển `ChoDon → BaoTri → SanSang (nghiệm thu)`. Cập nhật `Q.L.room`, tab trạng thái danh sách, KPI |
| GAP-ROOM-02 ✅W3 | 🔴 | P0 | **Room Status History** (`roomStatusHistory`: roomId, from, to, at, by, reason, refId) – nguồn tính vacancy/occupancy cho báo cáo (§12.5.4, §4.28.3). Hiện chỉ có audit log text |
| GAP-ROOM-03 ✅W3 | 🟡 | P1 | **Lịch sử giá phòng** (`roomPriceHistory`, action "Cập nhật giá" có ngày hiệu lực) – hiện sửa `price` trực tiếp |
| GAP-ROOM-04 | 🟡 | P2 | Field thiếu: **Sức chứa**, **Ngày sẵn sàng dự kiến**; bỏ/giữ `direction`, `furniture` (ngoài spec, không hại) |
| GAP-ROOM-05 | 🟡 | P2 | Action **Bulk update** (chọn nhiều phòng → cập nhật giá/loại/trạng thái được phép), **Export theo filter** (có – đạt) |
| GAP-ROOM-06 ✅W3 | 🟡 | P1 | Chi tiết phòng thêm tab **Chỉ số điện nước** (lịch sử theo kỳ, chỉ số OPENING từ OCR) và **Công nợ** (drill-down hóa đơn/payment); tab "Sự cố" gắn P2 – đạt |
| GAP-ROOM-07 | 🟢 | – | Rule "không 2 HĐ hiệu lực chồng nhau", "không tự Sẵn sàng khi hoàn cọc" (BR-02) đã có trong `actions.js` |

---

## 5. Khách thuê · Hợp đồng thuê · OCR · HĐ sắp hết hạn

### 5.1. Khách thuê (§4.8, §12.6) – `pages/tenants.js`, `forms.js Fm.tenant`

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-CUS-01 ✅W3 | 🟠 | P1 | **Đã chốt §10.1**: chỉ có **một field `Trạng thái`** (danh mục cấu hình, người có quyền sửa trực tiếp), **không dùng "trạng thái vòng đời"**. Mockup: `Q.tenantStatus(t)` **suy diễn** từ HĐ/hoàn cọc (`renting/expiring/moved_out/awaiting_refund/new/held`) và hiển thị như trạng thái khách → phải đổi: `tenants.status` là field lưu (danh mục Master Data), các giá trị suy diễn chuyển thành **cờ riêng** (`Có HĐ hiệu lực`, `Sắp hết hạn`, `Còn công nợ`, `Chờ hoàn cọc`, `Đã liên kết Zalo`) hiển thị dạng chip phụ |
| GAP-CUS-02 ✅W3 | 🔴 | P1 | **Cập nhật trạng thái hàng loạt** (§4.8): chọn nhiều / "Tất cả kết quả tìm kiếm" → chọn trạng thái → preview số bản ghi → xác nhận → audit batch + từng khách. Bảng đã `selectable: true` nhưng chưa có bulk action |
| GAP-CUS-03 ✅W3 | 🔴 | P1 | **Export theo đúng filter hiện tại** (Excel/CSV; selected hoặc all-filtered; file ghi thời điểm + điều kiện lọc; tuân data scope). Danh sách khách hiện **không có nút Xuất** (chỉ "Tùy chỉnh cột") |
| GAP-CUS-04 ✅W3 | 🟡 | P1 | Bộ lọc thiếu: **Tổ chức**, **Quản lý (theo assignment)**, **Phòng**, **Có/không HĐ hiệu lực**, **Khách đứng tên / Người ở cùng**, **Ngày tạo**; từ khóa phải bao gồm **CCCD** (hiện search name/code/phone/email/biển số) |
| GAP-CUS-05 | 🟡 | P2 | Cột thiếu: **CCCD**, **Tổ chức phụ trách**, **Có HĐ hiệu lực (cờ)**, **Zalo (ID/trạng thái liên kết)**, **Ngày tạo/cập nhật**; hồ sơ thiếu **Giới tính**, **Liên hệ khẩn cấp**, **Zalo ID** (hiện `zalo` = SĐT + `verified`) |
| GAP-CUS-06 ✅W2 | 🟠 | P1 | **Người ở cùng phải là hồ sơ khách riêng** liên kết HĐ với vai trò `Người ở cùng` (§4.8, ERD `CONTRACT_TENANT`). Mockup lưu `contractMembers` (name/dob/idNumber/relation) **không liên kết `tenants`** → cần `contractTenants` (contractId, tenantId, role) + khi thêm thành viên: chọn khách có sẵn hoặc tạo hồ sơ mới |
| GAP-CUS-07 ✅W3 | 🟡 | P1 | Tabs chi tiết theo §4.8: Thông tin · Hợp đồng · **Nơi ở** · **Người ở cùng** · **Xe** · Hóa đơn · **Thanh toán** · **Công nợ** · **Zalo** · Tài liệu · Lịch sử. Hiện: Thông tin, Lịch sử thuê, Hợp đồng, Tài chính (gộp), Hoàn cọc, Tài liệu, Lịch sử |
| GAP-CUS-08 | 🟡 | P2 | Action **Liên kết Zalo**, **Merge khách trùng** (tùy chọn); rule cảnh báo trùng CCCD/SĐT khi tạo (có ở OCR, chưa có ở form thường) |

### 5.2. Hợp đồng thuê phòng (§4.9, §12.7) – `pages/contracts.js`, `actions.js`

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-CT-01 ✅W3 | 🟠 | P0 | **State machine §12.7.3**: `Draft → ChoDuyet → HieuLuc → SapHetHan → ChoGiaHan → HieuLuc` và `HieuLuc/SapHetHan → ChoKetThuc → ChoQuyetToan → DaKetThuc`; `ChoDuyet → Draft (trả sửa)`. Mockup: `draft/active/expiring(suy diễn)/ended/cancelled`. Cần thêm **Chờ duyệt**, **Chờ gia hạn**, **Chờ kết thúc**, **Chờ quyết toán** + action Gửi duyệt / Duyệt / Trả sửa / Xác nhận trả phòng / Chấm dứt sớm / Chốt quyết toán |
| GAP-CT-02 | 🔴 | P0 | **Mốc thu M1/M2/M3** trên HĐ (ngày 05/10/15 cấu hình được) và hạn thu – nguồn cho hiệu suất lương & KPI (§4.9, §4.26.2, §12.7.1). Hiện chỉ có `payDay` |
| GAP-CT-03 ✅W2 | 🔴 | P1 | **Tài sản bàn giao** (`contractHandoverAssets`: tên, nhóm, SL, đơn vị, tình trạng, ghi chú, nguồn OCR trang/confidence) – hiện chỉ `roomAssets` của phòng, không theo HĐ |
| GAP-CT-04 ✅W2 | 🔴 | P1 | **Điều khoản thanh toán** (`contractPaymentTerms`: ngày thông báo, khoảng ngày thanh toán, hình thức, ngân hàng/chủ TK/số TK, nội dung CK template, phạt chậm trả, grace) và **Điều khoản gia hạn** (`renewal_type`, `renewal_period_months`, `notice_days`, `raw_clause`) – §12.8.13–14. Work Queue dùng `notice_days` |
| GAP-CT-05 ✅W3 | 🟡 | P1 | Field thiếu: **Loại HĐ**, **Lần hợp đồng/gia hạn** (số thứ tự – hiện chỉ `renewedFromId`), **Người ở cùng** liên kết khách (GAP-CUS-06), **Ngày ký** có (đạt) |
| GAP-CT-06 ✅W3 | 🟡 | P1 | Tabs §4.9: Tổng quan · Người thuê · Dịch vụ · Hóa đơn · **Thanh toán** · **Công nợ** · **Cọc** (ledger) · **Gia hạn** (chuỗi HĐ) · Tài liệu · Lịch sử. Hiện: Tổng quan, Dịch vụ & xe, Thành viên, Hóa đơn, Tài liệu, Lịch sử |
| GAP-CT-07 | 🟡 | P2 | Gia hạn tạo **HĐ/phụ lục mới ở Draft → review giá/cọc/dịch vụ/thời hạn → Approve → hiệu lực kế tiếp** (§12.15.3). `Fm.renew` hiện tạo HĐ mới và kích hoạt ngay trong 1 drawer |
| GAP-CT-08 | 🟢 | – | Snapshot giá/dịch vụ (BR-21), không 2 HĐ chồng, gia hạn không ghi đè HĐ cũ, kiểm tra HĐ đầu vào trước kích hoạt – đã có |

### 5.3. OCR hợp đồng & Data Onboarding (§4.10, §12.8) – `pages/ocr.js`, `core/ocr-parser.js`, `actions-p2.js`

Đây là **thay đổi trọng tâm của v1.8**; mockup hiện là "OCR → prefill form HĐ" (Phase 2). Cần dựng lại thành **Data Onboarding**.

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-OCR-01 ✅W1 |  | P0 | Chuyển route `/contracts/ocr` và NAV `ocr` từ `phase: 2` → **Phase 1**; radio "Tải hợp đồng" ở `#/contracts/new` không còn nhắc "thuộc Phase 2" |
| GAP-OCR-02 ✅W2 | 🟠 | P0 | **Trạng thái OCR Job** theo §12.8.3: `UPLOADED → PROCESSING → READY_FOR_REVIEW → REVIEWING → VALIDATED → COMMITTED`, nhánh `FAILED`, `COMMIT_FAILED`, action "Xử lý lại". Hiện `uploaded/extracting/review/created` |
| GAP-OCR-03 ✅W2 | 🔴 | P0 | **OCR Job** lưu: file hash, loại tài liệu, engine/version, **idempotency key**, thời gian xử lý, error, người upload; **upload cùng file (hash) không tạo job/HĐ trùng** (AC-1) – hiện không check hash |
| GAP-OCR-04 ✅W2 | 🟠 | P0 | **Màn Review theo nhóm entity** (§12.8.7) thay cho form field phẳng + card "Kết quả trích xuất": 13 section **Khách hàng · Tòa nhà · Phòng · Hợp đồng · Người ở · Dịch vụ & Giá · Cọc · Xe · Điện/Nước đầu kỳ · Tài sản bàn giao · Điều khoản thanh toán · Gia hạn/Báo trước · Tài liệu**; mỗi section hiển thị dữ liệu OCR, confidence, **candidate hệ thống**, **diff hiện tại ↔ OCR**, action **`Create / Link / Update / Ignore`** |
| GAP-OCR-05 ✅W2 | 🟠 | P0 | **OCR Field** lưu đủ §12.8.4: field path, entity_group, raw text, normalized value, confidence, trang, bounding box, candidate, match score, quyết định review, người review, giá trị cuối. `ocrExtractions.fields[]` hiện có key/label/value/confidence/confirmed/editedAt – thiếu raw/normalized tách, page, bbox, candidate, matchScore, decision, reviewer |
| GAP-OCR-06 ✅W2 | 🟡 | P0 | **Entity matching** §12.8.6: Customer ưu tiên **CCCD → SĐT → Họ tên + Ngày sinh**, xung đột (CCCD trùng nhưng tên/SĐT khác) → cảnh báo bắt buộc review; Building match theo mã/tên/địa chỉ; Room theo Building + Room code; Contract chống trùng theo số HĐ / hash / khách+phòng+start / idempotency. Parser hiện match tenant theo SĐT/tên (`P.entities`), phòng theo số – cần bổ sung CCCD-first và conflict warning |
| GAP-OCR-07 ✅W2 | 🔴 | P0 | **Commit Transaction** §12.8.9: nút "Xác nhận tạo hợp đồng" → **Validate toàn bộ → Commit 1 lần** tạo/link Customer, Building, Room, Contract (+ Contract Tenant, Contract Services snapshot, Deposit Ledger, Vehicle, Opening Meter Readings, Handover Asset Lines, Payment Terms, Renewal Clause, Contract Document); lỗi entity bắt buộc → **rollback toàn bộ** (không để "Customer đã tạo nhưng Contract chưa tạo"). Mockup: tạo tenant trước rồi redirect prefill form HĐ (2 bước tách rời) |
| GAP-OCR-08 ✅W2 | 🔴 | P0 | **Giá dịch vụ OCR ≠ giá tòa** → UI bắt chọn **[Chỉ áp dụng HĐ này] / [Cập nhật giá tòa từ ngày …] / [Ignore]**; chọn "Cập nhật giá tòa" tạo Service Price record mới có hiệu lực, không ghi đè lịch sử, audit (§12.8.10, AC-4/5). Hiện chỉ ghi chú "đơn giá theo HĐ" trên dòng dịch vụ |
| GAP-OCR-09 ✅W2 | 🔴 | P0 | **Opening Meter Reading** (`reading_type = OPENING`: contract, room, meter, date, value, unit, source doc/page, confidence) từ "Số điện/Số nước" – hiện chỉ hiển thị trong ghi chú dịch vụ, không ghi `meterReadings` |
| GAP-OCR-10 ✅W2 | 🔴 | P1 | **Tài sản bàn giao → Handover Asset Lines** trên HĐ (§12.8.12) – hiện `o.assets` chỉ đọc, không commit |
| GAP-OCR-11 ✅W2 | 🔴 | P1 | **Payment Terms** và **Renewal Clause** trích xuất & lưu (§12.8.13–14); Work Queue HĐ sắp hết dùng `notice_days` – parser đã đọc `payDay`, `bankAccount`, `transferNote`, `noticeDate` nhưng không thành entity |
| GAP-OCR-12 ✅W2 | 🟡 | P1 | Actions Review §12.8.16: Accept/Edit field (có), **Link/Create/Update/Ignore entity** (chỉ tenant có), **Resolve conflict**, **Preview final payload** (JSON/tóm tắt trước commit) |
| GAP-OCR-13 ✅W2 | 🔴 | P1 | **Màn kết quả sau commit** (§12.8.16 Confirm): danh sách entity đã tạo/liên kết với link tới từng module (§12.8.15) + **Retry nếu lỗi kỹ thuật** |
| GAP-OCR-14 ✅W2 | 🟡 | P1 | **Audit & Traceability** §12.8.17: mỗi field/entity truy ngược Job → File → Trang → BBox → Raw → Normalized → Decision → Reviewer; audit bắt buộc khi Link customer/building/room, Update master data, Update giá tòa, Create deposit/opening meter/handover, Commit |
| GAP-OCR-15 ✅W2 | 🟡 | P1 | Upload: **chọn loại tài liệu**, **kiểm tra duplicate/hash** trước khi chạy; hỗ trợ **PDF/JPG** (spec) – hiện chỉ PDF text-based/.txt (ảnh scan chưa hỗ trợ) → tối thiểu mô phỏng upload JPG với file mẫu |
| GAP-OCR-16 ✅W2 | 🟡 | P1 | Work Queue **"OCR chờ review"** trên Dashboard (GAP-DASH-04); OCR **không tự kích hoạt HĐ** (AC-11 – đạt), **không tự gia hạn** (AC-12 – đạt) |
| GAP-OCR-17 🔶W2 (file mẫu điều chỉnh để chỉ 2 xung đột giá; bộ dữ liệu §12.8.2 để sau) | 🟡 | P2 | Cập nhật file mẫu `assets/samples/mau-hop-dong-ocr.txt` và `O.sampleSpec()` theo bộ dữ liệu ví dụ §12.8.2 (`DEMO-TH-2026-001`, `TRẦN MINH AN`, `TH01/P302`, 6 dòng dịch vụ gồm Xe đạp điện/Xe điện Xanh SM, chỉ số 1.250 kWh / 85 m³, BIDV, tự gia hạn 12 tháng/báo trước 30 ngày) để demo khớp tài liệu |

### 5.4. Hợp đồng sắp hết hạn / Gia hạn (§4.11, §12.15)

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-EXPQ-01 ✅W3 | 🔴 | P1 | **Màn Work Queue riêng** (đề xuất `#/contracts/expiring`) thay vì chỉ tab lọc `?status=expiring`. Cột: Tòa/phòng, Khách, SĐT, **Người ở cùng**, **Quản lý (assignment)**, Ngày bắt đầu/kết thúc, **Số ngày còn lại**, Giá, Cọc, **Công nợ**, **Lần liên hệ gần nhất**, **Kết quả**, **Deadline/SLA** |
| GAP-EXPQ-02 ✅W3 | 🔴 | P1 | Actions: **Ghi nhận liên hệ** (log), chọn kết quả **Gia hạn / Trả phòng đúng hạn / Chấm dứt sớm / Chưa phản hồi**, **Assign người xử lý**, Export. Cần collection `contractFollowUps` (contractId, at, by, channel, result, note, nextDeadline) |
| GAP-EXPQ-03 | 🟡 | P2 | Ngưỡng **35 ngày cấu hình được** (hiện hard-code); hệ thống chỉ tạo queue, không tự gia hạn/kết thúc (đạt) |

---

## 6. Dịch vụ & bảng giá · Điện nước · Hóa đơn · Thu tiền · Công nợ

### 6.1. Dịch vụ & bảng giá theo tòa (§4.12, §12.9) – `pages/settings.js` tab `services`, `seed.js addCatalog`

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-SVC-01 ✅W2 | 🟠 | P0 | **Mô hình giá 2 lớp** (đã chốt §10.1): `services` (catalog) + **`servicePrices`** (service, scope `GLOBAL/BUILDING`, buildingId, giá, effectiveFrom/To, status, người duyệt). Rule ưu tiên: có giá tòa hiệu lực → dùng, ngược lại → mặc định. Mockup: `services.price` + `scope: all/buildings[]` – một dịch vụ chỉ 1 giá → **không thể** "tòa X điện 3.800, mặc định 4.000" |
| GAP-SVC-02 ✅W2 | 🔴 | P1 | Màn Dịch vụ: **Giá mặc định** + **Danh sách giá riêng theo tòa** (bảng: tòa, giá, hiệu lực, trạng thái) + action **Override giá theo tòa**, **Ngừng hiệu lực**, **Preview tòa nào đang dùng giá nào**, **Bulk import bảng giá** (§12.9.4) |
| GAP-SVC-03 ✅W2 | 🟡 | P1 | Danh mục §4.12: Điện · Nước · Internet · **Vệ sinh** · Thang máy · Xe · **Máy giặt** · **Điện chung** · Dịch vụ khác. Seed hiện: DIEN, NUOC, INTERNET, THANGMAY, QUANLY (Phí quản lý), SACXE, GUIXE → thêm `VESINH`, `MAYGIAT`, `DIENCHUNG` (cần cho metric `CLEANING_REVENUE`, `WASHING_REVENUE`); giữ `QUANLY` = "Dịch vụ chung" theo HĐ mẫu |
| GAP-SVC-04 | 🟡 | P2 | Field `Nhóm`, `Cách tính`, `Đơn vị` (có); thêm **Service Price** vào audit "Đổi giá" (§19); rule "hóa đơn đã phát hành không đổi khi sửa giá" (có – BR-21) |
| GAP-SVC-05 | 🟢 | – | "Giá vốn không trộn với bảng giá bán; nhập qua Chi phí" – mockup đã tách (nhóm DV trong Chi phí) |

### 6.2. Điện / Nước / Meter Reading (§4.13, §12.10) – hiện nằm trong `#/invoices/batch` bước 2

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-MTR-01 ✅W3 | 🔴 | P1 | **Màn Điện/Nước độc lập** (đề xuất `#/meters`): chọn kỳ → tòa → phòng → **công tơ** → chỉ số cũ/mới → sản lượng → **ảnh**; action Nhập từng dòng, Import Excel, Upload ảnh, **Copy chỉ số kỳ trước**, Validate, **Xác nhận**, **Reopen** (có quyền), Export, **Lịch sử theo kỳ**. Hiện chỉ có bảng nhập trong wizard hóa đơn, không có ảnh/xác nhận/lịch sử |
| GAP-MTR-02 🔶W3 (màn #/meters, meterId/readingType; rollover qua duyệt = chặn mới<cũ) | 🔴 | P1 | **Meter master** (`meters`: roomId, type điện/nước, mã công tơ, ngày lắp, thay công tơ/rollover) – ERD `ROOM ||--o{ METER`; `meterReadings` thêm `meterId`, `readingDate`, `photo`, `confirmedBy`, `status draft/confirmed/used`, **`readingType OPENING/PERIOD/CLOSING`** |
| GAP-MTR-03 ✅W3 | 🟡 | P1 | Validation §4.13: mới < cũ (có), **thiếu chỉ số** (có), **trùng kỳ** (1 công tơ/kỳ 1 reading hợp lệ), **tiêu thụ bất thường** (ngưỡng % so kỳ trước) – thêm 2 rule sau; rollover phải qua duyệt |
| GAP-MTR-04 | 🟡 | P2 | Rule "dữ liệu đã dùng phát hành HĐ không sửa âm thầm" – có (`status: 'used'`), cần hiển thị khóa + lý do khi reopen |

### 6.3. Kỳ hóa đơn & Hóa đơn (§4.14, §12.11) – `pages/invoices.js`, `actions.js`

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-BILL-01 ✅W3 | 🔴 | P0 | **Billing Period** master (§12.11.1): mã kỳ, từ/đến ngày, ngày chốt, ngày phát hành, trạng thái, **lock status** → màn "Kỳ tài chính" (menu Tài chính). Hiện `meta.period` + `periods` (P2 khóa kỳ ở Dòng tiền) |
| GAP-BILL-02 ✅W4 (W3 carriedOver/adjustment/snapshot; M1-M3 từ Payment Allocation gắn mốc) | 🔴 | P0 | Invoice thêm **M1/M2/M3** (số đã thu tại từng mốc – snapshot theo ngày mốc), **Nợ chuyển sang** (nếu hiển thị), **Điều chỉnh** tách khỏi total, `contract/customer snapshot` (§12.11.2) |
| GAP-BILL-03 ✅W3 | 🟡 | P1 | **Invoice Line** có `lineType` (RENT/SERVICE/PENALTY/ADJUSTMENT), `serviceId`, `unit`, **`sourceReadingId`** (drill-down → Meter Reading §12.23.10). Hiện `invoiceLines` chỉ item/desc/qty/unitPrice/amount |
| GAP-BILL-04 ✅W3 | 🟡 | P1 | Dòng hóa đơn §4.14: thêm loại **Vệ sinh, Máy giặt, Điện chung, Phạt, Điều chỉnh, Khoản khác** (theo GAP-SVC-03; "Thêm dòng" hiện free-text) |
| GAP-BILL-05 | 🟡 | P2 | Actions §12.11.4: **Cancel** hóa đơn đã phát hành có audit (hiện chỉ hủy nháp + điều chỉnh), **Export PDF/Excel** thật thay `U.fakePdf` (mockup chấp nhận mô phỏng) |
| GAP-BILL-06 | 🟢 | – | Luồng kỳ → tòa → HĐ hiệu lực → chỉ số → dịch vụ → preview → nháp → phát hành; 1 HĐ/phòng/kỳ 1 hóa đơn; phát hành không sửa trực tiếp; idempotent – **đạt** |

### 6.4. Thu tiền & Payment Allocation (§4.15, §12.12) – `pages/receivables.js`, `forms.js Fm.payment/confirmPayments`

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-PAY-01 ✅W4 | 🔴 | P0 | **Gắn mốc M1/M2/M3** cho mỗi allocation (theo ngày thu so với mốc HĐ/kỳ) → nguồn cho hiệu suất lương & KPI; snapshot M5/M10/M15 để P2 (§5.13) |
| GAP-PAY-02 ✅W3 | 🟡 | P1 | Trạng thái/loại: **Thu thừa**, **Tạm ứng**, **Tiền chưa xác định (Unidentified Receipt)** + action **Mark unidentified**, **Match khách/phòng/invoice** sau. Hiện `unallocated` số dư nhưng không có trạng thái/luồng riêng |
| GAP-PAY-03 | 🟡 | P2 | Payment data §12.12.1: **Tài khoản nhận**, **Người nộp** (khác khách), **Bank reference** (có `ref`), chứng từ (có) |
| GAP-PAY-04 | 🟡 | P2 | **Import payment** (nguồn bảng kê) – hiện P2 `#/finance/statement-import`; spec §15 Payment Import ✓ ở P1 → bỏ gate P2 hoặc ghi rõ |
| GAP-PAY-05 | 🟢 | – | 1 payment → nhiều invoice, 1 invoice → nhiều payment, thu một phần, reverse/reallocate có audit – **đạt** |

### 6.5. Công nợ (§4.16, §12.13)

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-AR-01 ✅W4 (W3 Tổ chức/Nhân sự/Phòng/Khách/Hạn; W4 lọc mốc M1/M2/M3) | 🟡 | P0 | Bộ lọc §4.16: **Kỳ, Tổ chức, Nhân sự, Khu vực, Tòa, Phòng, Khách, M1/M2/M3, Trạng thái, Hạn thanh toán** – thiếu Tổ chức/Nhân sự (theo assignment), Phòng, Khách, **M1/M2/M3** |
| GAP-AR-02 ✅W4 (W3 Thu thừa + bảng tổng hợp theo chiều; W4 cột M1/M2/M3) | 🟡 | P1 | Trạng thái §4.16 thêm **Thu thừa**; chỉ tiêu §12.13.1 thêm **Thu thừa/tạm ứng**, **Thu theo M1/M2/M3**, **Nợ theo khách/phòng/tòa/quản lý** (bảng tổng hợp theo chiều) |
| GAP-AR-03 | 🟡 | P2 | **Drill-down** §4.16: Tổ chức → Tòa → Phòng → Khách → Hóa đơn → Payment (hiện phẳng theo hóa đơn) và **Snapshot theo mốc/kỳ** (P2) |
| GAP-AR-04 | 🟢 | – | Công thức còn phải thu = phải thu − allocation − credit/adjustment; gửi nhắc Zalo; export – **đạt** |

---

## 7. Kết thúc / Phá HĐ · Cọc / Hoàn cọc (§4.17, §4.18, §12.16)

**File:** `forms.js Fm.terminate`, `pages/refunds.js`, `pages/finance2.js /finance/deposits`

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-END-01 ✅W3 | 🔴 | P1 | **Luồng kết thúc đầy đủ** §4.17: Khách báo trả → xác nhận ngày ra → **chốt điện nước (chỉ số cuối)** → **lập hóa đơn cuối/quyết toán** → chốt công nợ → cọc → khấu trừ → duyệt → hoàn → kết thúc HĐ → chờ dọn → nghiệm thu. `Fm.terminate` hiện: lý do + ngày kết thúc thực tế + tick chờ dọn + tick tạo hồ sơ hoàn cọc → cần wizard **Kết thúc HĐ** với bước chỉ số cuối & hóa đơn cuối; trạng thái HĐ `Chờ kết thúc → Chờ quyết toán` |
| GAP-END-02 ✅W3 | 🟡 | P1 | Dữ liệu kết thúc §12.16.1: **Loại kết thúc** (đúng hạn/sớm/phá HĐ), **Ngày thông báo**, **Lý do chuẩn** (Master Data), mô tả, **chỉ số cuối**, **tình trạng tài sản** (đối chiếu handover), công nợ, phạt, khấu trừ, bằng chứng |
| GAP-DEP-01 ✅W2 | 🔴 | P0 | **Deposit Ledger** thật (`depositLedger`: contractId, type `RECEIVABLE/RECEIVED/TRANSFERRED/DEDUCTED/REFUNDED/FORFEITED`, amount, date, refId) – nguồn cho `NEW_DEPOSIT`, `FORFEITED_DEPOSIT`, `REFUND_AMOUNT` (§4.28.3, §12.23.3). Mockup `Q.deposits()` tổng hợp on-the-fly, không có "Cọc điều chuyển", "Giữ lại/forfeited" |
| GAP-DEP-02 ✅W3 | 🟠 | P1 | Công thức thực hoàn §4.18: `Cọc − công nợ được phép bù trừ − phạt − sửa chữa − vệ sinh − khác`. Mockup theo OI-07 **không bù trừ công nợ** và khấu hao cố định 200k (BR-12) → cần tùy chọn "Công nợ được phép bù trừ" (nhập số/duyệt) để bám spec; nhóm khấu trừ `KH/SC/VS/CN/KHAC` đã có |
| GAP-DEP-03 | 🟢 | – | Workflow Nháp → Chờ duyệt → Đã duyệt → Đã hoàn / Từ chối; hoàn cọc không tự Ready phòng – **đạt** (`needs_edit` là mở rộng P2) |

---

## 8. Zalo Integration · Nhắc thanh toán · Message Template · Danh sách gửi & Lịch sử (§4.19–4.22, §12.14)

**File:** `pages/zalo.js`, `pages/zalo2.js`, `forms.js Fm.template/zaloQuick`, `seed.js addZaloConfig`

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-ZAL-01 | 🔴 | P1 | **Màn Zalo Integration** (`Cài đặt → Integrations → Zalo`): Channel, OA/ZNS, **OA ID, App ID, Credential/token (chỉ Admin)**, Environment, **Connection status**, **Webhook status**, **Test connection**, **Send test**. Hiện không có (chỉ `channel` dropdown trong cấu hình sự kiện) |
| GAP-ZAL-02 | 🟠 | P1 | **Reminder Rules nhiều mốc** §4.20: gửi sau phát hành, **trước hạn X ngày**, **đúng ngày hạn**, **sau hạn +1/+3/+5…**, giờ gửi, **retry / số lần / khoảng cách**, **xác nhận thủ công hay tự động**, template cho **từng event**. Mockup: mỗi event 1 `offsetDays/offsetDir` → cần bảng rule nhiều dòng cho sự kiện thanh toán |
| GAP-ZAL-03 | 🟠 | P1 | **Template mặc định** §4.21: `PAYMENT_NEW`, `PAYMENT_BEFORE_DUE`, `PAYMENT_DUE`, `PAYMENT_OVERDUE`, `PAYMENT_PARTIAL`, `PAYMENT_SUCCESS`. Seed hiện: `TM_NHAC_TIEN_001`, `TM_CONG_NO_001`, HĐ hết hạn, hoàn cọc, chung, trả chủ nhà → bổ sung 6 template + event tương ứng (giữ các event khác) |
| GAP-ZAL-04 | 🟠 | P1 | **Biến template** theo spec `{{customer_name}}, {{building_name}}, {{room_code}}, {{invoice_code}}, {{billing_period}}, {{rent_amount}}, {{service_amount}}, {{electric_amount}}, {{water_amount}}, {{total_amount}}, {{paid_amount}}, {{remaining_amount}}, {{due_date}}, {{bank_name}}, {{bank_account}}, {{transfer_content}}, {{support_phone}}`. Mockup dùng `{ten_khach}, {toa_nha}, {so_phong}, {so_tien}, {ngay_den_han}, {con_lai}, {ky}…` (11 biến) → đổi cú pháp `{{ }}` + đủ 17 biến trong `Q.renderTemplate/templateCtx` |
| GAP-ZAL-05 | 🔴 | P1 | **Template versioning** §4.21 (đã chốt §10.8): **Version**, **Effective date**, trạng thái **Draft / Active / Inactive**, template editor + live preview + preview với hóa đơn thật + test send. Cần màn **Message Template** riêng (danh sách, lịch sử version) thay drawer `Fm.template` |
| GAP-ZAL-06 | 🔴 | P1 | **Danh sách cần gửi (queue)** §4.22: cột Khách, Tòa/phòng, Hóa đơn, Loại thông báo, Hạn, Phải thu, Đã thu, **Còn nợ (re-check)**, Template, Thời gian gửi, Trạng thái; action **Preview / Send / Skip / Retry**. Mockup có wizard "Tạo đợt gửi" (batch) – thiếu queue được sinh tự động từ Reminder Rule (`Scheduled`) |
| GAP-ZAL-07 | 🟡 | P1 | **Lịch sử gửi** lưu thêm: **Template version**, **Nội dung đã render** (có `content`), **Số tiền tại thời điểm gửi**, **Provider message ID**, error code/message (có), retry count (có qua `retryOfId`). Trạng thái `Scheduled → Sending → Success / Failed → Retry` (hiện `delivered/accepted/failed/unknown/skipped`) – map lại nhãn |
| GAP-ZAL-08 | 🟢 | – | Re-check công nợ trước gửi, skip khi = 0, dùng số còn nợ hiện tại, không retry tin thành công, không gửi draft/cancelled – **đạt** (FR-ZAL-02) |
| GAP-ZAL-09 | 🟡 | P2 | Sự kiện `PAYMENT_PARTIAL` (khách trả một phần → nhắc số còn lại) và `PAYMENT_SUCCESS` (xác nhận đã thu) chưa có trong `zaloEvents` |

---

## 9. Cơ cấu tổ chức · Nhân sự · Phân công tòa nhà · Hiệu suất & Bảng lương · Chi lương (§4.23–4.26, §12.17–12.20)

**File:** `pages/hr.js` (P3), `core/seed-p3.js`, `core/actions-p3.js`. Spec xếp toàn bộ ở **Phase 1**.

### 9.1. Cơ cấu tổ chức (§4.23, §12.17)

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-ORG-01 ✅W1 |  | P0 | **Màn Cơ cấu tổ chức** (`#/hr/org`): cây **số cấp linh hoạt** (Công ty → Quản lý Tổng → Đơn vị vận hành → TPVH/NV vận hành/Kỹ thuật; Tài chính–Kế toán; Kinh doanh → Nhóm KD → Team Sale). Collection `orgUnits` (code, name, type, parentId, leadEmployeeId, effectiveFrom/To, status) + `positions` (code, name, management level, unit types allowed, effective date). Mockup chỉ có `employees.dept` (enum) và `salesTeams` |
| GAP-ORG-02 ✅W1 |  | P1 | Actions §12.17.3: Tạo/sửa unit, **Move unit**, **Bổ nhiệm/thay Lead** (đúng 1 Lead hiệu lực, lưu lịch sử nhiệm kỳ), Ngừng hoạt động, **Xem cây theo ngày**, Lịch sử, Export |

### 9.2. Nhân viên (§4.24, §12.18)

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-EMP-01 ✅W1 |  | P0 | Bỏ gate `phase: 3`; mở `#/hr` cho Admin/HR ở Phase 1 |
| GAP-EMP-02 ✅W1 |  | P1 | Quan hệ tổ chức §4.24: **Đơn vị chính (orgUnit)**, **Chức danh (position)**, **Kiêm nhiệm**, **Lead**, **Ngày hiệu lực**, **Lịch sử điều chuyển** → collection `employmentAssignments` (employeeId, orgUnitId, positionId, isPrimary, effectiveFrom/To). Hiện `dept/title/managerId` tĩnh |
| GAP-EMP-03 | 🟡 | P2 | Field: **Tài khoản ngân hàng** (có `bank`?) – kiểm tra; **Payroll settings** (lương cơ bản có; phụ cấp ăn trưa/xăng xe/lương trưởng nhóm/hỗ trợ theo §4.26.5 chưa có); actions **Điều chuyển tổ chức**, **Bổ nhiệm Lead** |
| GAP-EMP-04 | ⚪ | – | **Chấm công** (`#/hr/timesheet`) ngoài spec – giữ dưới nhãn "Mở rộng" hoặc ẩn khi demo P1 |

### 9.3. Phân công tòa nhà – Single Source of Truth (§4.25, §12.19)

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-ASN-01 ✅W1 |  | P0 | **Màn Phân công tòa nhà** độc lập (`#/hr/assignments`) với 2 view **Hiện tại / Sắp tới** + **Lịch sử phân công** (theo nhân viên, theo tòa); bảng ví dụ §4.25.9 (NV, Nhà hiện tại, Phòng hiện tại, Nhà sắp tới, Phòng sắp tới – tính từ assignment + danh mục phòng). Hiện assignment chỉ là tab trong chi tiết NV và tab "Nhân sự phụ trách" ở tòa |
| GAP-ASN-02 ✅W1 |  | P0 | Data §4.25.1: thêm **Đơn vị tổ chức snapshot**, **Phạm vi phòng (ngoại lệ)**, **Người tạo/Người duyệt**, **Lý do**, **Ghi chú**; vai trò theo danh mục **Phụ trách chính / Phối hợp / Kỹ thuật / Vệ sinh / khác** (hiện `lead/ops/cleaning/tech` + `primary` boolean → map `primary && ops` = Phụ trách chính) |
| GAP-ASN-03 ✅W1 |  | P0 | **Workflow** §4.25.6: `Dự thảo → Chờ duyệt → Đã duyệt → Đang hiệu lực → Hết hiệu lực`; `Chờ duyệt → Từ chối`; `Đã duyệt → Đã hủy (trước hiệu lực)`. Hiện `status: active/ended` |
| GAP-ASN-04 ✅W1 |  | P0 | Luồng **Thay đổi quản lý tòa** §4.25.4: chọn tòa → NV mới → vai trò → ngày hiệu lực → lý do → gửi duyệt/xác nhận → **tự kết thúc assignment cũ ngày hiệu lực − 1** → tạo assignment mới; trước ngày hiệu lực Tòa hiển thị "Quản lý sắp tới" |
| GAP-ASN-05 ✅W1 |  | P1 | Chức năng §4.25.3 còn thiếu: **Điều chuyển 1 tòa giữa 2 NV**, **Điều chuyển hàng loạt**, Thay đổi vai trò, **Lập kế hoạch tương lai**, Duyệt/Hủy kế hoạch, **Cảnh báo tòa thiếu người phụ trách**, **Cảnh báo trùng thời gian**, Tìm theo quản lý hiện tại/sắp tới, Tổng hợp theo node cha, Export |
| GAP-ASN-06 ✅W1 |  | P0 | Rule §4.25.5: không 2 `Phụ trách chính` cùng hiệu lực 1 tòa; phân công tương lai không đổi hiện tại; không xóa cứng; **không đổi snapshot payroll đã khóa**; scope đơn vị đổi đúng từ ngày hiệu lực |
| GAP-ASN-07 ✅W1 |  | P0 | **Các module khác chỉ đọc từ assignment** (§4.25.7): Tòa, Dashboard, Khách/HĐ/Hóa đơn/Công nợ (scope suy ra), Bảng lương (snapshot) – liên quan GAP-CORE-01/02, GAP-BLD-01 |

### 9.4. Hiệu suất thu tiền & Bảng lương (§4.26.1–4.26.7, §12.20)

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-HR-08 ✅W4 | 🔴 | P0 | **Màn Hiệu suất thu tiền** (`#/hr/collection-performance`): lọc kỳ/tổ chức/NV/tòa; bảng theo **NV × tòa**: Số phòng, DT niêm yết, DT phải thu, **Thu M1/M2/M3**, Tổng sau 3 mốc, DT dịch vụ, Tỷ lệ DV/DT, Thu thêm, Tổng DT thu được, **Hiệu suất (%) = Tổng DT thu được / DT niêm yết**, Mức lương/phòng, Tổng lương theo phòng; **drill-down về giao dịch thu** |
| GAP-HR-09 ✅W4 | 🟠 | P0 | **Công thức lương** §4.26.5: Thực nhận = Lương cơ bản + PC ăn trưa + PC xăng xe + Lương trưởng nhóm + Lương hỗ trợ + **Tổng lương hiệu suất theo phòng** + Điều chỉnh tăng − Khấu trừ. Mockup (BR-14 cũ): lương cứng × công/công chuẩn + PC chức danh + PC số nhà 500k/tòa + hoa hồng Sale − 10,5% → **thay** bằng cấu phần spec; hoa hồng Sale không nằm trong payroll P1 (đi qua Chi phí §4.27.5) |
| GAP-HR-10 ✅W4 | 🔴 | P0 | **Payroll Rule Version** §4.26.4: đối tượng áp dụng, hiệu lực, **bậc hiệu suất → mức lương/phòng**; khi tính lương lưu **snapshot version**. **Payroll Assignment Snapshot** theo NV + tòa + kỳ (§4.26.1) để đổi phân công sau không đổi bảng lương đã chốt |
| GAP-HR-11 ✅W4 | 🟡 | P1 | Luồng §4.26.6: Mở kỳ → đọc tổ chức/assignment hiệu lực → snapshot → lấy DT → thu M1/M2/M3 → hiệu suất → rule → lương theo phòng → cộng cơ bản/phụ cấp → Review → **Điều chỉnh có lý do** → Duyệt → **Khóa**; action **Reopen có quyền/audit**, Refresh khi chưa khóa. Hiện: Nháp → Chờ duyệt → Đã duyệt → Đã chi (thiếu Khóa/Reopen/Điều chỉnh có lý do) |
| GAP-HR-12 ✅W4 | 🟡 | P1 | **Drill-down bảng lương** §4.26.7: NV → tòa phụ trách → số phòng → DT → M1/M2/M3 → DV → thu thêm → hiệu suất → mức lương/phòng → lương từng tòa (đối soát với sheet `Bảng lương`). Modal "Diễn giải lương" hiện chỉ theo cấu phần cũ |

### 9.5. Chi lương (§4.26.8–4.26.11, §12.20.5)

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-HR-13 ✅W4 | 🔴 | P1 | **Màn Chi lương** (`#/hr/salary-payments`): lọc kỳ/đơn vị/NV/trạng thái chi; tổng phải chi / đã chi / còn phải chi; **ghi nhận chi từng người**, **chi hàng loạt**, **import kết quả giao dịch**, **partial payment**, đính chứng từ, export, lịch sử chi. Mỗi khoản: kỳ, NV, tổng thực nhận, đã chi, còn chi, ngày, phương thức, **TK nhận snapshot**, mã GD, chứng từ, người thực hiện, trạng thái `Chưa chi → Chi một phần → Đã chi` (+ Chi lỗi/Đã hủy/Đã điều chỉnh). Hiện 1 nút "Ghi nhận chi lương" cả kỳ (`X.payPayroll`) |
| GAP-HR-14 ✅W4 | 🟠 | P0 | **Không nhập lại lương vào Chi phí** (§4.26.10, §4.27.4): `X.payPayroll` hiện **tạo expense nhóm Lương (VH-L-*) theo tòa** → bỏ; báo cáo lấy `SALARY_COST` từ **Payroll Cost Allocation** (§12.23.7). Xóa 10 mã `VH-L-*` khỏi nhóm chi phí nhập tay (hoặc khóa chỉ hệ thống ghi) |

---

## 10. Chi phí Phase 1 (§4.27, §12.21)

**File:** `pages/expenses.js`, `forms.js Fm.expense`, `seed-wb.js` (taxonomy), `settings.js` (import)

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-EXP-01 ✅W4 | 🟠 | P0 | **Danh mục chi phí** §4.27.3: `GIÁ VỐN` (Tiền thuê nhà, Mua thêm thiết bị, Giá gốc điện/nước/mạng, Phí rác, Phí môi trường, Bảo trì thang máy) · `CHI PHÍ BÁN HÀNG` (Marketing, **Hoa hồng**) · `CHI PHÍ VẬN HÀNH` (Sửa chữa, Thay thế, Văn phòng, Khác). Mockup `GV/DV/VH/BH`: DV tách riêng khỏi GV; **thiếu Hoa hồng**; Sửa chữa nằm ở BH; VH chứa 10 mã Lương (sai theo GAP-HR-14). Cần re-map `expenseGroups` + migration `categoryCode` (giữ mã cũ làm alias để không vỡ state) |
| GAP-EXP-02 ✅W4 | 🔴 | P0 | **Import chi phí** (§4.27.1, `phase1.md`: "Chi phí sẽ import các chi phí mà mình chưa quản lý"): Import Excel/CSV → mapping cột → validation → preview → **phát hiện dòng trùng** → review/correct dòng lỗi → confirm; file mẫu `mau-import-chi-phi.csv`. Thêm type `expense` vào `settings.js TYPES`; Work Queue "Import chi phí lỗi" |
| GAP-EXP-03 ✅W4 | 🟡 | P1 | Dữ liệu tối thiểu §4.27.2 thiếu: **Ngày ghi nhận** tách **Ngày chứng từ**, **Kỳ hạch toán** (hiện suy từ `date`), **Hạng mục** (có `categoryCode`), **Nhà cung cấp/người nhận**, **Phương thức thanh toán**, **Nguồn dữ liệu `Nhập tay / Import / Sinh từ hệ thống`** (có `source` seed/user – chưa đúng nghĩa), **Người xác nhận** |
| GAP-EXP-04 ✅W4 | 🟠 | P0 | **Phân bổ chi phí chung** §4.27.7 / §12.21.4: phương thức **Theo số phòng / Theo doanh thu / Theo số tòa / Tỷ lệ nhập tay / Trực tiếp**, phân bổ cho **nhóm T/S/G**; lưu phiếu nguồn, tòa nhận, số tiền/tỷ lệ, phương thức, kỳ, người xác nhận. `Fm.expense` hiện chỉ nhập % tay theo tòa |
| GAP-EXP-05 ✅W4 | 🟡 | P1 | **Hoa hồng Phase 1** §4.27.5: nhập/import vào Chi phí (nhóm CPBH / Hoa hồng) với tham chiếu **Sale/người nhận, Phòng, Tòa, Ngày thanh toán, Chứng từ** – form cần field phụ khi chọn hạng mục Hoa hồng |
| GAP-EXP-06 ✅W5 (W4 reverse/audit/lịch sử; W5 drill-down từ Report A → Expense Allocation → Expense → chứng từ) | 🟡 | P2 | Actions §12.21.3: **Reverse/adjust** có audit (hiện Sửa/Xóa), **Xem lịch sử điều chỉnh**, **Drill-down từ báo cáo về phiếu** (link `#/expenses?s=code` có – một phần) |
| GAP-EXP-07 | 🟡 | P2 | Khấu hao (`method: depreciation`, P2) & `recordType asset` – giữ nhưng gắn nhãn "Phase 2/3 – Q-RPT-008 chưa chốt" |
| GAP-EXP-08 | 🟢 | – | Nhập tay, đính chứng từ, phân bổ 1/nhiều tòa, filter kỳ/tòa/nhóm – có |

---

## 11. Báo cáo Phase 1 (§4.28, §4.33, §12.23)

**File:** `pages/reports.js`, `pages/reportHub.js`, `pages/reportRuns.js`, `core/metrics.js`, `core/selectors-wb.js`

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-RPT-01 ✅W5 | 🔴 | P0 | **Report A – Báo cáo chi tiết một tòa** (mẫu "Báo cáo tháng 6", §12.23.3): input kỳ + tòa; layout nhóm **DOANH THU / CỌC–HOÀN CỌC / SỐ LƯỢNG PHÒNG / DT TIỀN NHÀ / DT DỊCH VỤ / GIÁ VỐN / CPBH–VH / TỔNG CHI PHÍ / LN GỘP / LN RÒNG / CÁC TỶ LỆ / CỔ ĐÔNG–VỐN–CHIA LN**; **36 dòng metric** theo bảng mapping (`TOTAL_REVENUE`, `NEW_DEPOSIT`, `FORFEITED_DEPOSIT`, `REFUND_AMOUNT`, `EARLY_TERMINATION_COUNT`, `NEW_ROOM_COUNT`, `VACANT_ROOM_COUNT`, `RENT_REVENUE`, `ELECTRIC/WATER/CLEANING/INTERNET/ELECTRIC_VEHICLE/ELEVATOR/WASHING_REVENUE`, `SERVICE_REVENUE`, `HEAD_LEASE_COST`, `EQUIPMENT_PURCHASE_COST`, `ELECTRIC/WATER/INTERNET_INPUT_COST`, `GARBAGE_COST`, `ENVIRONMENT_COST`, `ELEVATOR_MAINT_COST`, `COGS`, `SALARY_COST`, `OFFICE_COST`, `MARKETING_COST`, `COMMISSION_COST`, `REPAIR_COST`, `OTHER_COST`, `OPERATING_SELLING_COST`, `TOTAL_COST`, `GROSS_PROFIT`, `NET_PROFIT`). Report Hub hiện có `wb-building-business`, `operating-result` nhưng không theo layout/mã này |
| GAP-RPT-02 ✅W5 | 🔴 | P0 | **Report B – Báo cáo kinh doanh tổng T/S/G** (mẫu "Tháng 8", §12.23.8): cột **Total / T / S / G** cho mọi metric; **loại tòa resolve theo lịch sử tại kỳ** (GAP-BLD-03); chi phí chung & payroll **allocation trước** khi aggregate; `TOTAL = T + S + G` (additive); **tỷ lệ tính lại từ tử/mẫu, không average** |
| GAP-RPT-03 ✅W5 | 🔴 | P0 | **Metric Definition** (§12.23.1 `metric_definition`) với `metric_code`, `unit`, `formula_type`, `formula_expression`, `source_entity`, `date_field`, `version`, **`business_confirmation_status`** (`CONFIRMED / NEED_BUSINESS_CONFIRMATION / DEPRECATED`); UI hiển thị **tag NEED_BUSINESS_CONFIRMATION** cho `TOTAL_REVENUE`, `FORFEITED_DEPOSIT`, `NEW_ROOM_COUNT`, `VACANT_ROOM_COUNT`, `EARLY_TERMINATION_COUNT`, `HH_OVER_OPERATING_SELLING_COST`, `SERVICE_REVENUE_OVER_INPUT_COST`, `OTHER_COST` mapping. Thay nhãn "Giả định" hiện tại |
| GAP-RPT-04 ✅W5 | 🔴 | P0 | **14 tỷ lệ** §12.23.6 (`NET_MARGIN` LNR/DT, `GROSS_MARGIN` LNG/DT, `NET_PROFIT_OVER_COGS`, `NET_PROFIT_OVER_GROSS_PROFIT`, `TOTAL_COST_OVER_GROSS_PROFIT`, `COGS_OVER_REVENUE`, `OPERATING_SELLING_COST_OVER_REVENUE`, `TOTAL_COST_OVER_REVENUE`, `SALARY_OVER_OPERATING_SELLING_COST`, `HH_OVER_OPERATING_SELLING_COST`, `OTHER_COST_OVER_OPERATING_SELLING_COST`, `SERVICE_REVENUE_OVER_INPUT_COST`, `RENT_REVENUE_OVER_HEAD_LEASE`) – dùng label Excel để hiển thị, `metric_code` để tính |
| GAP-RPT-05 ✅W5 | 🔴 | P0 | **Bảng cổ phần trong báo cáo một tòa** §12.23.9: Cổ đông, Tỷ lệ % (snapshot), Vốn, LN Gộp × %, LN ròng × %, LNR/GV, CP/LNG, Tổng nhận = Vốn + LN ròng share; **share snapshot khi lock** – phụ thuộc GAP-INV-02 |
| GAP-RPT-06 ✅W5 | 🔴 | P0 | **Report Period / Snapshot / Lock / Reopen** §12.23.1, §12.23.13: `report_period` (`OPEN / REVIEWING / LOCKED / REOPENED`, cutoff, metric version, allocation version), `report_snapshot`, `report_metric_value` (total/T/S/G, `calculation_detail_json`, `drilldown_count`); khi lock freeze metric version, allocation, building type, payroll allocation, share snapshot; **reopen bắt buộc audit/lý do**. `reportRuns` P2 hiện snapshot theo loại báo cáo nhưng không có period state machine |
| GAP-RPT-07 ✅W5 | 🔴 | P0 | **Drill-down** §12.23.10: Report → Metric → T/S/G → Tòa → Source entity → Chứng từ (Revenue → Invoice Line; Service → Meter Reading; Expense → Allocation → Expense → Attachment; Payroll → Payroll Cost Allocation → Payroll Result → Employee → Assignment Snapshot → M1/M2/M3; Contract event; Shareholder → Share snapshot). Report Hub hiện chỉ có bảng tổng + CSV |
| GAP-RPT-08 ✅W5 (W4 allocationRules/expenseAllocations/payrollCostAllocations; W5 Report Engine đọc allocation trước aggregate, snapshot freeze allocation version) | 🔴 | P0 | **Allocation Rule / Result** §12.23.7: `allocation_rule` (DIRECT / ROOM_COUNT / REVENUE / BUILDING_COUNT / MANUAL_RATIO, version, effective) + `allocation_result`; **Payroll Cost Allocation** (NV trực tiếp → assignment snapshot; vai trò dùng chung → rule version) – gắn GAP-EXP-04, GAP-HR-14 |
| GAP-RPT-09 ✅W5 | 🟡 | P1 | **Golden Dataset & Reconciliation** §12.23.12: màn "Đối soát Excel" hiển thị bảng `metric_code / excel_value / system_value / difference / % / status (MATCH, ROUNDING_DIFFERENCE, RULE_DIFFERENCE, SOURCE_DATA_DIFFERENCE, NEED_BUSINESS_CONFIRMATION) / note`; seed 2 bộ golden (G1 tháng 6: TOTAL_REVENUE 79.912.000, COGS 66.358.594, NET_PROFIT 3.077.280,96, 9 cổ đông = 100%; Tháng 8: TOTAL 7.036.256.236 = T 2.527.702.129 + S 3.551.745.507 + G 956.808.600…). Mockup có `docs/TimeHouse-Workbook-vs-Mockup-Audit` nhưng không có màn đối soát trong app |
| GAP-RPT-10 🔶W5 (Report Hub thêm nhóm "Báo cáo Phase 1"; Report A/B xuất CSV đúng layout cột Excel – chưa xlsx; báo cáo wb-* giữ nhãn Workbook, Report Hub vẫn gate P2) | 🟡 | P1 | **`#/reports` (3 báo cáo cơ bản)** giữ; **Report Hub** bỏ gate P2 cho nhóm Tài chính/Công nợ/Vận hành; các báo cáo `wb-*` map lại sang `metric_code` hoặc gắn nhãn "ngoài spec v1.8"; **Export xlsx đúng layout** 2 báo cáo (§12.23.11 `/export?format=xlsx`) – mockup xuất CSV (chấp nhận) nhưng cột phải theo layout Excel |

**Tiêu chí §4.33 (12 điều kiện đủ dữ liệu)** – trạng thái mockup (cập nhật W5: tất cả ✅ trừ (12) đối soát tháng 8 chỉ có giá trị kỳ vọng): (1) Invoice Line ✅ · (2) Contract Event + Room Status History ❌ (GAP-ROOM-02, cần `contractEvents`) · (3) Deposit Ledger + Refund Case ❌/✅ (GAP-DEP-01) · (4) Hoa hồng từ Expense ❌ (GAP-EXP-01) · (5) Mua thiết bị từ Expense ✅ (`GV-TB`) · (6) Giá gốc điện/nước/mạng/rác/MT/thang máy ✅ (`DV-*`, cần re-map vào GV) · (7) Lương từ Payroll đã khóa ❌ (GAP-HR-14) · (8) Allocation T/S/G ❌ (GAP-EXP-04) · (9) Cổ phần từ module Cổ đông P1 ❌ (GAP-INV-*) · (10) Drill-down ❌ (GAP-RPT-07) · (11) Metric Definition chung ❌ (GAP-RPT-03) · (12) Đối soát workbook ❌ (GAP-RPT-09).

---

## 12. Cổ đông · Cổ phần theo tòa · Góp vốn · Phân phối lợi nhuận (§4.29–4.32, §12.22)

**File:** `pages/investment.js` (P3), `seed-p3.js` (`shareholders`, `projects`, `capitalCommitments`, `contributions`, `distributions`)

| Gap | Mức | Ưu tiên | Việc cần làm |
|---|---|---|---|
| GAP-INV-01 ✅W1 |  | P0 | Bỏ gate `phase: 3` cho Cổ đông / Góp vốn / Phân phối cơ bản; mở cho Admin/Kế toán (giữ role `codong` read-only cho Phase 3 portal) |
| GAP-INV-02 ✅W5 | 🔴 | P0 | **Building Share** §4.30: `buildingShares` (buildingId, shareholderId, percentage, **effectiveFrom/To**, basis/document); tổng tỷ lệ hiệu lực tại một thời điểm = 100% (kiểm tra), **không ghi đè lịch sử** (đổi tỷ lệ = record mới), báo cáo kỳ cũ dùng tỷ lệ đúng kỳ. Mockup: tỷ lệ theo **dự án** (`projects`, Σ ≤ 100%/dự án) không có ngày hiệu lực → cần chuyển sang theo **tòa** (dự án có thể giữ như nhóm tòa) |
| GAP-INV-03 ✅W5 | 🔴 | P1 | Màn **Cổ phần theo tòa**: danh sách cổ đông theo tòa, tỷ lệ hiện tại, **tỷ lệ theo ngày/kỳ** (date picker), **lịch sử thay đổi**, **kiểm tra tổng 100%**, Export share table |
| GAP-INV-04 ✅W5 | 🟡 | P1 | Master cổ đông §4.29: mã, họ tên/pháp nhân, **CCCD/MST**, SĐT, email, **TK ngân hàng**, trạng thái; action **Ngừng hoạt động**, xem tòa/dự án tham gia, **lịch sử tỷ lệ**, vốn góp, phần LN được phân bổ (tab chi tiết cổ đông – hiện chỉ có bảng) |
| GAP-INV-05 ✅W5 | 🟡 | P1 | Góp vốn §4.31: **theo Tòa/Dự án → Đợt góp vốn → Tổng cần góp → Phân bổ theo cổ đông** (tỷ lệ, phải góp, đã góp, còn thiếu, hạn, ngày góp, chứng từ, ghi chú) – mockup có `capitalCommitments/contributions` theo dự án/kỳ trả chủ nhà (BR-15) → đổi nguồn tỷ lệ sang Building Share |
| GAP-INV-06 ✅W5 | 🟠 | P0 | Phân phối lợi nhuận §4.32: **`LN được phân phối × tỷ lệ cổ phần snapshot`**; dữ liệu Kỳ, Tòa, Cổ đông, Tỷ lệ snapshot, Vốn liên quan, LN được chia, **Tổng nhận (Vốn + LN)**, Trạng thái, Ngày xác nhận; **Generate từ Locked Report** (§12.22.5, event `PROFIT_REPORT_LOCKED`) – mockup lập bảng từ `distributions` theo dự án, không từ report lock, không snapshot % |
| GAP-INV-07 | ⚪ | P3 | Payout, cổng cổ đông, ROI/ROA, Investor Statement giữ ở P3 (`#/investment/roi`, `#/investment/projects`) – đạt |

---

## 13. Phase 2 & Phase 3 – điểm lệch với spec §5, §6, §13, §14

| Gap | Mức | Ưu tiên | Spec | Mockup | Việc cần làm |
|---|---|---|---|---|---|
| GAP-P2-01 | 🟠 | P2 | **Tài sản, Kiểm kê** là Phase 2 (§5.14–5.15) | `#/assets`, `#/assets/inventory` gate `phase: 3` | Đổi gate → 2; giữ Khấu hao (P3) |
| GAP-P2-02 | 🟡 | P2 | Pipeline lead §5.2: Lead mới → Đã liên hệ → Có nhu cầu → Hẹn xem → Đã xem → Giữ phòng → Chốt; nhánh Không phù hợp / Mất lead | Kanban CRM có cột tương tự (`new/contacted/…/won/lost`) | Kiểm tra đủ 7 cột + 2 nhánh; kết quả xem phòng §5.4 (Đã xem/Không đến/Không phù hợp/Muốn phòng khác/Chốt) |
| GAP-P2-03 | 🔴 | P2 | **Commission Engine** §5.7–5.9: Policy có version (nguồn, người nhận, building type, term, base rate, standard months, proration, điều kiện, hiệu lực); Commission Case (basis → policy → prorate → duplicate split → adjustment → approval → net); Payout nhiều-nhiều; theo dõi Gross/Adj/Net/Paid/Remaining/Recovered | `commissions` 10% giá thuê tháng đầu, chi 1 lần (BR-13) | Xây Policy + Case + Payout (P2) |
| GAP-P2-04 | 🔴 | P2 | **Budget** §5.11 (tháng/tòa/department/category; Budget/Actual/Variance/%Used) | Chỉ có báo cáo `budget-vs-actual` (OI) | Màn Budget |
| GAP-P2-05 | 🟡 | P2 | **Period Close** §5.12: Open → Reviewing → Closed; khóa invoice/payment/expense/payroll; snapshot | `#/reports/cashflow` khóa kỳ với checklist 6 mục | Thêm trạng thái Reviewing; gắn với Billing Period (GAP-BILL-01) |
| GAP-P2-06 | 🔴 | P2 | **Snapshot M5/M10/M15/EOM** §5.13 | Không có | Bảng `collectionSnapshots` + báo cáo tiến độ thu theo mốc |
| GAP-P2-07 | 🟡 | P2 | Chi phí nâng cao §5.10: approval, recurring, supplier, cost center, accrual, payment status | Có NCC (P2), khấu hao | Bổ sung approval/recurring/cost center |
| GAP-P2-08 | 🟡 | P2 | Maintenance Plan §5.16 (asset, chu kỳ, ngày gần nhất/tiếp theo, đơn vị, checklist) & Work Order `Issue → Assign → Processing → Completed → Verified` | `maintenanceSchedules`, `incidents` | Thêm bước **Verified**; gắn Plan với Asset |
| GAP-P3-01 | 🟡 | P3 | Investor Statement, Khấu hao (useful life/method/accumulated/book value), Forecast, DW/BI, Cổng cổ đông | ROI, dự án, `depreciationLines`, portal role `codong` | Giữ; bổ sung Investor Statement §6.3 và Forecast §6.6 khi làm P3 |

---

## 14. Thay đổi mô hình dữ liệu cần thêm vào `store.js COLLECTIONS`

| Collection mới | Phục vụ gap | Ghi chú |
|---|---|---|
| `orgUnits`, `positions`, `employmentAssignments` | GAP-CORE-01, GAP-ORG-*, GAP-EMP-02 | Cây tổ chức có hiệu lực theo ngày |
| `buildingTypeHistory` | GAP-BLD-03, GAP-RPT-02 | Resolve loại tòa theo kỳ |
| `roomStatusHistory`, `roomPriceHistory` | GAP-ROOM-02/03 | Vacancy/occupancy |
| `contractTenants` (thay `contractMembers`) | GAP-CUS-06 | Khách đứng tên / người ở cùng liên kết `tenants` |
| `contractHandoverAssets`, `contractPaymentTerms`, `contractRenewalClauses`, `contractEvents`, `contractFollowUps` | GAP-CT-03/04, GAP-EXPQ-02, §4.28.3 | Sự kiện HĐ cho `NEW_ROOM_COUNT`, `EARLY_TERMINATION_COUNT` |
| `ocrJobs` (mở rộng `ocrExtractions`), `ocrFields`, `ocrEntityDecisions` | GAP-OCR-03/05 | Hash, idempotency, decision |
| `servicePrices` | GAP-SVC-01 | GLOBAL/BUILDING + hiệu lực |
| `meters`; mở rộng `meterReadings` | GAP-MTR-02, GAP-OCR-09 | `readingType OPENING` |
| `billingPeriods` | GAP-BILL-01 | Lock status |
| `depositLedger` | GAP-DEP-01 | Cọc phải thu/đã thu/điều chuyển/khấu trừ/hoàn/giữ lại |
| `zaloIntegration`, `reminderRules`, `zaloTemplateVersions`, `notificationQueue` | GAP-ZAL-01/02/05/06 | |
| `payrollRuleVersions`, `payrollAssignmentSnapshots`, `payrollResults`, `salaryPayments`, `payrollCostAllocations` | GAP-HR-08..14 | |
| `allocationRules`, `allocationResults` | GAP-EXP-04, GAP-RPT-08 | |
| `buildingShares`, `capitalCalls`, `capitalPayments`, `profitDistributions` (snapshot %) | GAP-INV-02..06 | |
| `reportPeriods`, `metricDefinitions`, `reportSnapshots`, `reportMetricValues`, `goldenDatasets` | GAP-RPT-03/06/09 | |
| `auditLog` mở rộng `before/after/reason/batchId` | GAP-CORE-03 | |

Field cần **bỏ/chuyển thành dẫn xuất**: `buildings.managerId`, `rooms.managerId`, `contracts.managerId`, `tenants.managerId`, `users.buildingIds` (RBAC scope) → tính từ assignment. `tenants.status` chuyển từ dẫn xuất sang **field lưu**.

---

## 15. Đề xuất thứ tự triển khai (wave)

| Wave | Mục tiêu | Gap chính |
|---|---|---|
| **W1 – Nền tảng scope & phase** | Bật đúng phạm vi P1; scope theo cây tổ chức | GAP-NAV-01/02, GAP-CORE-01/02/06/07, GAP-ORG-01, GAP-EMP-01, GAP-ASN-01..07, GAP-BLD-01/02/03, GAP-DASH-05/06 |
| **W2 – OCR Data Onboarding v1.8** | Chuỗi thuê bắt đầu từ file HĐ | GAP-OCR-01..17, GAP-CT-02/03/04, GAP-CUS-06, GAP-SVC-01/02, GAP-MTR-02, GAP-DEP-01 |
| **W3 – Vận hành thuê đủ trạng thái** | State machine phòng/HĐ, HKD, loại tòa, khách | GAP-ROOM-01/02, GAP-CT-01/06, GAP-HL-01..04, GAP-CUS-01..05/07, GAP-EXPQ-01/02, GAP-END-01/02, GAP-MTR-01/03, GAP-BILL-01/02/03 |
| **W4 – Chuỗi nội bộ & chi phí** | Hiệu suất → lương → chi lương; chi phí import/allocation | GAP-PAY-01, GAP-HR-08..14, GAP-EXP-01..05, GAP-AR-01/02 |
| **W5 – Báo cáo & cổ đông** ✅ (21/09/2026) | 2 báo cáo Excel + đối soát | GAP-RPT-01..10, GAP-INV-01..06, GAP-BLD-06 |
| **W6 – Zalo & nền** | Integration, rules, template version, queue, audit, document version | GAP-ZAL-01..07/09, GAP-CORE-03/04/05/08 |
| **W7 – Phase 2/3 realign** | Đổi gate, Commission Engine, Budget, Snapshot | GAP-P2-*, GAP-P3-* |

---

## 16. Điểm phụ thuộc quyết định nghiệp vụ (§22, §12.23.15) – mockup nên gắn nhãn "Chờ chốt"

Các phần sau **không nên viết cứng** trong mockup; hiển thị tag `NEED_BUSINESS_CONFIRMATION` / OI và cho phép cấu hình:

1. Công thức `TOTAL_REVENUE` (Q-RPT-001) – có gồm cọc bị giữ/phạt/khoản khác?
2. Thời điểm cọc bị giữ thành doanh thu (Q-RPT-002) – đề xuất: sau settlement approve.
3. Định nghĩa `phòng mới` / `phòng trống` / `phòng phá HĐ` + date basis (Q-RPT-003..005).
4. `HH/CPBH` gồm category nào; `DT DV/GIÁ NHẬP` tử/mẫu (Q-RPT-006/007).
5. Bảng bậc **Hiệu suất → Mức lương/phòng** (Payroll Rule) và công thức `Tổng DT thu được` (§22.4–5).
6. Ngày nghỉ ảnh hưởng M1/M2/M3 (§22.6).
7. Rule phân bổ chi phí chung & lương quản lý tổng/kế toán/văn phòng cho T/S/G (Q-RPT-009/010).
8. Tiền thuê nhà chu kỳ 3 tháng: cash hay phân bổ tháng (Q-RPT-011); làm tròn (Q-RPT-012).
9. SLA xử lý HĐ sắp hết; OA/ZNS; danh mục trạng thái khách chính thức; ký hiệu loại tòa ngoài T/S/G; quyền duyệt hoàn cọc/assignment/payroll/phân phối.

Các OI/BR hiện đang gắn trong mockup (OI-07 không bù trừ công nợ, BR-12 khấu hao 200k, BR-13 hoa hồng 10%, BR-14 lương cứng×công, OI-15…) cần **rà lại theo spec v1.8** và đổi nhãn tham chiếu sang mã Q-RPT/§ tương ứng.

---

## Phụ lục A – Bản đồ route mockup ↔ mục spec

| Route hiện có | Spec § | Ghi chú |
|---|---|---|
| `#/dashboard` | 4.2, 12.1 | Sửa theo §3 |
| `#/landlords`, `/:id`, `/new` | 4.4, 12.2, 4.5, 12.3 | HĐ đầu vào là drawer trong chi tiết chủ nhà |
| `#/buildings`, `/:id` | 4.6, 12.4 | |
| `#/rooms`, `/:id` | 4.7, 12.5 | |
| `#/tenants`, `/:id` | 4.8, 12.6 | |
| `#/contracts`, `/new`, `/:id` | 4.9, 12.7, 4.11, 12.15 | Thiếu màn queue sắp hết hạn |
| `#/contracts/ocr` | 4.10, 12.8 | Dựng lại theo v1.8 |
| `#/settings/catalog?tab=services` | 4.12, 12.9 | Thiếu Service Price |
| `#/invoices/batch` (bước 2) | 4.13, 12.10 | Tách màn Điện/Nước |
| `#/invoices`, `/:id` | 4.14, 12.11 | |
| `#/receivables`, `#/payments/:id` | 4.15, 4.16, 12.12, 12.13 | |
| `#/refunds`, `/new`, `/:id`; `#/finance/deposits` (P2) | 4.17, 4.18, 12.16 | Deposit ledger |
| `#/zalo/config`, `#/zalo/history`, `#/zalo/batches/*` | 4.19–4.22, 12.14 | Thiếu Integration, Template, Queue |
| `#/hr`, `/:id`, `/payroll`, `/timesheet` (P3) | 4.23–4.26, 12.17–12.20 | Thiếu Org, Assignment, Hiệu suất, Chi lương |
| `#/expenses` | 4.27, 12.21 | |
| `#/reports`, `#/reports/hub`, `/new`, `/runs/:id`, `/r/:key` | 4.28, 4.33, 12.23 | Thiếu Report A/B engine |
| `#/investment/shareholders`, `/projects`, `/roi` (P3) | 4.29–4.32, 12.22, 6.x | Chuyển phần cơ bản về P1 |
| `#/documents` | 7.3 | Thiếu version |
| `#/settings/import`, `#/settings/jobs` (P2) | 7.4, 18.2 | Thiếu import chi phí |
| `#/settings/users` | 7.1, 16 | Thiếu scope theo tổ chức |
| *(chưa có)* | 7.2 Audit Log, 7.5 Master Data đầy đủ, 7.6 Metric Registry UI, 7.7 Report Snapshot | Xây mới |
