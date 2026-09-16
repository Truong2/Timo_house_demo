# Plan: Workbook Alignment Layer (v2.3) — xử lý audit Workbook vs Mockup

## Context

`docs/TimeHouse-Workbook-vs-Mockup-Audit-2026-09-16.md` đối chiếu workbook khách (`nội dung làm web Timehouse 31.8.2026(2).xlsx`, 10 sheet ghi chú rất ngắn) với mockup. Kết luận audit: mockup mạnh hơn workbook ở lõi cho thuê, nhưng thiếu **4 trục dùng chung** (Khu nhà, dimension nhân sự/loại nhà/cổ đông, taxonomy chi phí, công thức lợi nhuận) và các **lưới/báo cáo đối soát** theo bộ cột workbook. Audit khuyến nghị: không vá từng field, chốt lớp dữ liệu/công thức dùng chung trước (GAP-01..04), rồi làm preset lưới/report.

Phân tích thêm khi lập plan:

1. **Audit đúng với workbook gốc** (đã đọc lại xlsx). Một số điểm audit đánh "cần làm rõ" suy ra được từ ngữ cảnh workbook:
   - 3 loại phòng trống ở sheet `Tổng quan` ("ở luôn trong tháng / hết tháng / đang chờ") **trùng** với "tình trạng phòng chốt (ở luôn, cuối tháng, đang chờ)" ở sheet `KINH DOANH` → 1 enum `vacancy` dùng chung cho dashboard và sổ doanh số.
   - "danh sách khách hoà" nằm trong `MỤC TÀI CHÍNH` của khách → đọc là **"khách hoàn (cọc)"**.
   - "Công cụ phát sinh khách" = nguồn/kênh lead; "ngày bắn khách" = ngày bàn giao lead; "Số phòng phát sinh (hoàn cọc và phá hđ)" = phòng trống phát sinh do hoàn cọc/phá HĐ.
2. **Redesign v2.2 đang implement dở (working copy chưa commit)** và có 2 xung đột với workbook:
   - `pages/dashboard.js` bản mới **đã bỏ** KPI `Cọc mới`, `Tiền phá hợp đồng` (selector `Q.finance().depositNew/penalty` ở `selectors.js:120` vẫn còn) và bộ lọc `Khu vực`/`Quản lý` mà bản cũ có → regress GAP-05.
   - Spec v2.2 §1.2/§11.5/§12.1 **cấm đổi schema/seed nghiệp vụ**, trong khi GAP-01/02/03 bắt buộc thêm master data → cần addendum cho phép **thêm additive**.
3. Mockup đã có nhiều "viên gạch" tái dụng được — không tạo mới:
   - `buildingAssignments` (effective-dated, role `lead|ops|cleaning|tech`, `seed-p3.js:113`, `selectors-p3.js:15,58-60`) → nguồn "trưởng nhóm / vận hành / vệ sinh / kỹ thuật". Seed P3 chạy trong `S.migrate` bất kể phase bật/tắt (`store.js:25-27`) nên dữ liệu luôn có.
   - `expenseGroups` 7 nhóm (`seed.js:372`) + tab `Nhóm chi phí` ở `/settings/catalog` → mở rộng thành taxonomy 2 cấp.
   - `services` đã đủ 7 loại workbook: DIEN, NUOC, INTERNET, THANGMAY, QUANLY (dịch vụ chung), SACXE, GUIXE (`seed.js:360-366`).
   - `refundDeductions.group`, `landlordPayments`, `documents` (entityType/entityId), `projects.buildingId` (1 dự án = 1 tòa), `contracts.renewedFromId`, `tenants.zalo`, `assets.ownership`, `Q.finance/cashflow/operatingResult/occupancy/buildingRoi/crmStats/dealStats`, `meta.savedFilters`, `U.columnMenu` + `meta.columnPrefs`, `F.csv/download`, `reportHub` registry `R(...)` + `LIVE` map.

Quyết định đã chốt với user (16/09/2026): (a) **doc giải pháp + implement mockup**; (b) **xây trên nền v2.2 đang dở**, sửa spec cho phép additive schema; (c) điểm mơ hồ → **giả định mặc định + gắn nhãn "Giả định – chờ xác nhận"**; (d) phạm vi **P0 + P1 (GAP-01..09, GAP-11)**, bỏ GAP-10.

## Nguyên tắc giải pháp

- **Additive-only schema**: chỉ thêm collection/field; field cũ giữ nguyên. **Không tăng `SCHEMA`** (`store.js:48` vứt state khi schema lệch). Theo pattern P2/P3: `TH.seed.workbook(st)` idempotent, gọi trong `S.migrate` với cờ `meta.wbSeeded` → state cũ tự được bơm master data.
- **Một nguồn sự thật cho dimension**: `Q.scope(f)` resolve mọi filter dùng chung (kỳ, khu nhà, tòa, loại nhà, trưởng nhóm, quản lý, vận hành, cổ đông, sale/team) → `{ period, buildingIds }`; page/report chỉ lọc theo `buildingIds`.
- **Metric registry có công thức**: KPI/report workbook đi qua `TH.metrics` (`formula` text, `includes/excludes`, `status: approved|assumed`); UI hiện ⓘ công thức + chip `Giả định`.
- **Không phá UX v2.2**: giữ ≤7 cột mặc định; bộ cột workbook là **preset "Đối soát"** trong menu Cột, áp cho cả Xuất CSV.
- **Giả định gắn nhãn**: mọi giả định ghi trong Decision Pack và có `assumed: true` trong code → `U.assume()` chip.

## Giả định mặc định cho 10 câu hỏi (mục 9 audit)

| # | Câu hỏi | Giả định implement | Ảnh hưởng |
|---|---|---|---|
| 1 | Khu nhà vs Khu vực | Tạo entity `areas` (Khu nhà) có `leadEmployeeId`; seed 1 khu / 1 `district` hiện có; `buildings.areaId`. "Khu vực" trong UI đổi nhãn thành "Khu nhà" | GAP-01 |
| 2 | T/S/G | `buildingType`: **T** = Thuê lại chủ nhà, **S** = Sở hữu công ty, **G** = Góp vốn cổ đông. Seed: có `landlordId` → T; có `projects` → G; còn lại S | GAP-02 |
| 3 | Quản lý / trưởng khu / trưởng nhóm / vận hành | Quản lý = `buildings.managerId` (user); Trưởng khu = Trưởng nhóm = `areas.leadEmployeeId` (fallback assignment role `lead`); Vận hành/Vệ sinh/Kỹ thuật = `buildingAssignments` role `ops/cleaning/tech` hiệu lực theo ngày; cho phép kiêm nhiệm | GAP-02 |
| 4 | Cọc là gì / LN thực thu | Cọc mới = **dòng tiền vào**, không phải doanh thu kế toán. Dashboard hiển thị khối "Thu trong kỳ" 3 dòng (tiền nhà, cọc mới, phá HĐ). `LN thực thu` = thu (gồm cọc mới) − chi (gồm mua TB) đúng workbook, `status: assumed`; `LN kinh doanh` = doanh thu thuê/DV/phạt − chi vận hành (loại cọc mới, hoàn cọc, mua TB) | GAP-04/05 |
| 5 | 3 trạng thái phòng trống | `immediate` = `status=ready`; `endOfMonth` = `occupied` có HĐ kết thúc ≤ cuối kỳ và không có `renewedToId`; `waiting` = `held` + `cleaning` | GAP-05 |
| 6 | Ngày thanh toán / số tháng đã TT | Ngày thanh toán = ngày payment **gần nhất**; Số tháng đã TT = số hóa đơn có dòng tiền phòng đã thu đủ của HĐ (trả trước tính, trả thiếu không) | GAP-06 |
| 7 | Menu Tài liệu | Route mới `#/documents` (index tập trung, chỉ đọc + upload); vào từ launcher (mọi role có `documents.view`) và item trong nhóm `Vận hành`; hồ sơ pháp lý có cấu trúc nằm ở tab Tài liệu của tòa | GAP-07 |
| 8 | Dự án ↔ Tòa | Giữ **1–1** như hiện tại (`projects.buildingId`); dimension "tòa" của cổ đông = qua project | GAP-09 |
| 9 | "khách hoà" | = khách hoàn cọc → tab Tài chính của khách hiện danh sách hoàn cọc với `Mã tòa · Mã phòng` | 5.3 |
| 10 | Báo cáo KD của nhà (Ngọc) | Implement report `wb-building-business` theo 4 mục sheet Tài chính (tổng thu-chi điện/nước/DV cả HT, danh sách nhà, chi tiết hạng mục từng nhà, thu-chi tổng/tòa), `assumed`, owner Ngọc | 5.4 |

Quy ước hiển thị `Mã tòa · Mã phòng`: `F.roomRef(building, room)` → `TH-HBT-01 · A.12.03`.

---

## W0 — Tài liệu (làm trước, ~1.5 ngày)

1. **Tạo `docs/TimeHouse-Workbook-Alignment-Decisions-v1.0.md`** (tiếng Việt, cho PO/khách/Ngọc):
   - Tóm tắt giải pháp lớp (master data → dimension/metric → preset lưới/report), lý do không vá rời.
   - Bảng 10 giả định ở trên + owner xác nhận + hạn.
   - Data dictionary bổ sung (collection/field mới, seed mapping).
   - Metric dictionary: key, tên, công thức, includes/excludes, trạng thái.
   - Preset cột "Đối soát" từng lưới (hóa đơn, công nợ, hoàn cọc, chi phí, sổ doanh số, sổ khách, sổ hoa hồng).
   - Traceability GAP-01..09/11 → deliverable → route/file.
2. **Sửa `docs/TimoHouse-UI-Redesign-Spec-v2.2.md`**: thêm dòng lịch sử v2.3 (Draft), decision **D-12 "Ngoại lệ schema additive cho Workbook Alignment"** ở §18.1, và **Phụ lục D** liệt kê collection/field được phép thêm + route mới `#/documents`, query `vac`, `areaId`, `buildingType`, `leadId`, `opsId`, `teamId`, `shareholderId`, `preset`.
3. Cuối cùng (W4) **cập nhật audit**: thêm mục "13. Kết quả xử lý" (GAP → trạng thái → route).

## W1 — Lớp nền dùng chung (GAP-01/02/03/04, ~4-5 ngày)

Thứ tự script mới trong `mockup/index.html`: `core/seed-wb.js` sau `seed-p3.js`; `core/selectors-wb.js` sau `selectors-p3.js`; `core/metrics.js` sau `selectors-wb.js`; `ui/components-wb.js` sau `components-p3.js`; `pages/documents.js` trước `guide.js`.

### `core/store.js`
- Thêm `'areas', 'salesTeams'` vào `COLLECTIONS`.
- Trong `S.migrate` sau seed P3: `if (TH.seed.workbook && !st.meta.wbSeeded) TH.seed.workbook(st)`.

### `core/seed-wb.js` (mới) — `TH.seed.workbook(st)` idempotent, set `meta.wbSeeded = true`
- `areas`: 1 record / `district` hiện có (`code: 'KV01'`, `name: 'Khu ' + district`, `districts:[district]`, `leadEmployeeId` = employee có assignment `lead` ở tòa đầu tiên của khu, `status`). `buildings.areaId` backfill theo district; `employees.areaId` backfill theo `employees.area` text (match tên gần nhất, còn lại null).
- `buildings`: `buildingType` (T/S/G theo giả định 2), `areaM2` (= `floors × perFloor × 35` làm mẫu), `condition: 'new'|'medium'|'old'`, `operatingSince` (= start HĐ chủ nhà hoặc `'2024-01-01'`), `licenseExpiry`, `pccc: { status: 'valid'|'missing'|'expired', expiry }`.
- `buildingAssignments`: đảm bảo 5 tòa hero có đủ 4 role active (chỉ thêm khi thiếu).
- `expenseGroups` → taxonomy 2 cấp: thêm field `parentCode` cho record cũ và thêm record mới. Cha: `GV` Giá vốn, `DV` Giá gốc dịch vụ, `VH` Chi phí vận hành, `BH` Chi phí bán hàng phát sinh. Con (code, name): `GV-THUE` Thuê nhà (map "Thuê nhà"), `GV-TB` Mua sắm thiết bị (map "Mua sắm TS"); `DV-DIEN, DV-NUOC, DV-MANG, DV-RAC, DV-MT` (môi trường), `DV-TM` (bảo trì thang máy) — "Điện nước" cũ trở thành cha `DV`; `VH-L-QL, VH-L-QLT, VH-L-TPVH, VH-L-PPVH, VH-L-NGUON, VH-L-NVKD, VH-L-VS, VH-L-KT, VH-L-SC, VH-L-BV, VH-VP` — "Lương" cũ trở thành cha `VH`; `BH-MKT` (map "Marketing"), `BH-SC` (map "Sửa chữa"), `BH-KHAC` (map "Khác"). `expenses.categoryCode` backfill theo `group` name (cha → con mặc định đầu tiên, ví dụ "Điện nước" → `DV-DIEN`, "Lương" → `VH-L-QL`).
- `refundDeductions.group` chuẩn hóa: enum `Q.L.deductionGroup = { KH: 'Khấu hao / hao mòn', SC: 'Sửa chữa', VS: 'Vệ sinh / dọn dẹp', KHAC: 'Chi khác', CN: 'Công nợ' }`; thêm `groupCode` cho record cũ (Khấu hao→KH, Sửa chữa→SC, Dịch vụ→VS, Công nợ→CN, Khác→KHAC), giữ `group` text.
- `services.wbType` gán 7 mã workbook (`electric, water, internet, elevator, common, ev_charge, parking`).
- `contracts.vehicles: [{ type: 'Xe máy'|'Xe điện'|'Ô tô', plate }]` — seed cho HĐ có dòng GUIXE (qty xe = số plate).
- `leadSources.kind: 'internal'|'partner'` + `leads.handoverDate` (= `createdAt` date).
- `salesTeams`: 2 team `{ code, name, leadUserId }`; `users.teamId` cho user role `sale` (và admin không set).
- `documents.expiry` (chỉ seed cho loại Sổ đỏ/PCCC/ĐKKD của 2-3 tòa để demo trạng thái).

### `core/selectors-wb.js` (mới) — mở rộng `TH.q`
- Lookup: `Q.area(id)`, `Q.areas()`, `Q.buildingTypeLabel(t)`, `Q.L.buildingType`, `Q.L.vacancy`, `Q.L.deductionGroup`, `Q.expenseTree()` (cha → con), `Q.expenseCategory(code)`, `Q.salesTeam(id)`.
- `Q.staffOf(buildingId, role, atDate = today)`: lọc `buildingAssignments` theo `start ≤ at` và (`!end || end ≥ at`) — **effective-dated thật**, không dùng `status`.
- `Q.areaLead(areaId)`; `Q.buildingLead(buildingId)` (area lead → fallback assignment `lead`).
- **`Q.scope(f)`**: input `{ period, areaId, buildingId, buildingType, managerId, leadId, opsId, shareholderId, saleId, teamId }` → `{ period, buildingIds, saleIds }`; hợp với RBAC bằng cách chỉ duyệt `St.where('buildings')` (đã scope). Mọi selector WB nhận `scope`.
- `Q.vacancy(scope)` → `{ immediate: [rooms], endOfMonth: [...], waiting: [...] }` theo giả định 5; `Q.roomVacancy(room, period)`.
- `Q.revenueSplit(scope)` → `{ rent, newDeposit, penalty }` bọc `Q.finance` với nhiều `buildingIds`.
- `Q.expenseRollup(scope)` → tree theo taxonomy có tổng từng cấp (dùng `expenseAllocations` khi có).
- `Q.utilityLedger(scope)` → per building: `usage` (từ `meterReadings` × giá `services` kỳ đó), `revenue` (invoiceLines DIEN/NUOC), `cost` (expenses `DV-DIEN/DV-NUOC`), `diff`.
- `Q.paidMonths(contract)`, `Q.lastPaymentDate(invoice)`, `Q.onTimeRate(scope)` (numerator = hóa đơn thu đủ ≤ dueDate; denominator = hóa đơn đến hạn trong kỳ).
- `Q.contractTermNo(c)` (đếm chuỗi `renewedFromId`).
- `Q.salesLedger(scope)`, `Q.customerLedger(scope)`, `Q.commissionLedger(scope)` → rows theo đúng cột workbook (dựa `deals`, `leads`, `viewings`, `holds`, `commissions`, payments của HĐ liên kết; "tổng nhận" = Σ payments của contract deal).
- `Q.shareholderAssetSummary(scope)` → per building: nguyên giá `assets.ownership='company'`, tổng cọc đang giữ (HĐ active), phân phối kỳ.
- `Q.staffWorkload(employeeId)` → `{ buildings, rooms }` từ assignments active.

### `core/metrics.js` (mới) — `TH.metrics`
- `defs` với key → `{ label, formula, includes, excludes, status: 'approved'|'assumed', owner, compute(scope) }`. Bộ tối thiểu: `revenue.rent`, `revenue.newDeposit`, `revenue.penalty`, `collection.progress`, `profit.actual`, `profit.business`, `margin.rent` (Σ doanh thu tiền nhà ÷ Σ chi `GV-THUE`), `cost.base|fixed|variable` (theo cha GV / DV+VH / BH), `occupancy.rate`, `vacancy.days`, `utility.diff`, `ontime.rate`, `roi.capital`, `roi.asset`.
- `TH.metrics.value(key, scope)`, `TH.metrics.info(key)` (HTML công thức + chip Giả định), `TH.metrics.snapshotLabel(scope)` → "Kỳ 10/2026 · tính lúc hh:mm dd/mm".

### `ui/components-wb.js` (mới)
- `U.dimFilter(f, { dims: [...], inline: 2, extraFields })` → trả HTML tương thích `U.filterbar` (2 dim đầu inline, còn lại trong `<details class="filter-more">`, dùng `data-on='f'` để hoạt động với `TH.router.applyFilter` sẵn có). Dims hỗ trợ: `period, areaId, buildingId, buildingType, managerId, leadId, opsId, shareholderId, saleId, teamId`. Option lists lấy từ selectors trên.
- `U.assume(label = 'Giả định')` chip amber có tooltip "Chờ khách xác nhận"; `U.metricInfo(key)` (icon ⓘ + popover công thức).
- `U.roomRef(roomId)` → `U.cell2(F.roomRef(...), tên tòa)` link phòng.
- `U.presetSwitch(tbl)` (nếu không nhúng vào `U.columnMenu`).

### `ui/table.js` (working copy v2.2)
- Thêm opts `presets: { key: { label, cols: [keys] } }`, `preset` mặc định `'default'`; state `st.preset` lưu `meta.uiPrefs.tablePreset[colPrefsKey]` (đúng namespace v2.2 §11.3; đọc `meta.columnPrefs` làm fallback như spec). Khi preset ≠ default, `hidden` = cols không thuộc preset.
- `U.columnMenu` thêm header "Bộ cột" với các preset (radio ☉/○) trước danh sách cột.
- Cột hỗ trợ `csv(row)`; helper `U.tableCsv(tbl, rows)` xuất theo cột đang hiển thị (dùng `csv` hoặc `F.stripTags(render())`) → dùng cho nút Xuất ở các lưới W2/W3.

### `core/format.js`
- `F.roomRef(b, r)`, `F.stripTags(html)`, `F.monthsSince(date)`.

### `core/auth.js`
- Permission mới: `'documents.view'` (mọi role), `'documents.manage'` (admin, accountant, ops), `'catalog.manage'` bao phủ `areas`/`salesTeams`; `COLLECTION_TYPE`: `areas`/`salesTeams` không scope. `documents` đã có scope? — kiểm tra `COLLECTION_TYPE` khi implement; nếu chưa, scope theo building của entity.

### `pages/settings.js` (Danh mục)
- Tab mới `areas` "Khu nhà" (code, name, districts, leadEmployeeId, status) và `teams` "Team sale" (name, leadUserId, thành viên = users.teamId) qua `X.saveCatalogItem/removeCatalogItem`.
- Tab `groups` "Nhóm chi phí": hiển thị 2 cấp (cột Nhóm cha), form thêm select `parentCode`.
- Tab `services`: cột "Loại (workbook)" từ `wbType`.

## W2 — Dashboard, hồ sơ tòa/khách, lưới tài chính (GAP-05/06, ~5-6 ngày)

### `pages/dashboard.js` (working copy)
- View **Điều hành** (admin) và dashboard **Kế toán**: thay `contextualFilter` bằng `U.dimFilter(f, { dims: ['period','areaId','buildingId','managerId','leadId'] })`; `f` đọc thêm `areaId, managerId, leadId` từ query; model nhận `scope = Q.scope(f)`.
- Khối "Phòng trống" 3 KPI (`Q.vacancy`) → href `#/rooms?vac=immediate|eom|waiting` + `U.assume()`.
- Khối "Thu trong kỳ" 3 KPI (`Q.revenueSplit`): tiền nhà → `#/receivables?...`, cọc mới → `#/finance/deposits?tab=deposit`, phá HĐ → `#/refunds?reason=break`; mỗi KPI có `U.metricInfo`.
- Giữ chart "Tiến độ thu theo tòa"; bỏ chart trạng thái phòng ở view Điều hành nếu chật (giữ ở tab). View **Công việc** giữ nguyên.
- Export CSV dùng scope.

### `pages/rooms.js`
- Hỗ trợ query `vac` (lọc bằng `Q.roomVacancy`), cột tùy chọn "Trống (WB)" hiển thị nhãn `Q.L.vacancy`; filter-more thêm `areaId`, `leadId`.

### `pages/buildings.js` + `ui/forms.js` (`Fm.building`)
- Overview thêm: Khu nhà, Loại nhà (T/S/G + `U.assume`), Diện tích, Tình trạng, Vận hành từ (+ "đã vận hành x tháng"), ĐKKD hết hạn, PCCC (trạng thái/hết hạn).
- Tab mới **`staff` "Nhân sự phụ trách"**: bảng `Vai trò | Nhân viên | Từ ngày | Đến ngày | Chính` từ `Q.staffOf(b.id, role, any)` cho 4 role; hiện ở mọi phase (đọc), nút gán chỉ khi P3 + `hr.manage`.
- Tab `docs` → thêm khối **"Hồ sơ pháp lý"**: checklist Sổ đỏ / PCCC / ĐKKD / HĐ chủ nhà với trạng thái `Đủ | Thiếu | Hết hạn | Sắp hết hạn` (từ `documents` + `expiry`, `licenseExpiry`, `pccc`), nút upload mở `Fm.upload` (bổ sung input Ngày hết hạn).
- Tab `assets` (P3): tách 2 bảng "Tài sản chủ nhà" / "Tài sản đầu tư" theo `assets.ownership`.
- Tab `perf`: KPI Hiệu suất/Lợi nhuận đọc từ `TH.metrics` (`occupancy.rate`, `profit.business`) có ⓘ.
- List `/buildings`: filter `district` → `areaId`, thêm `buildingType`; cột "Khu nhà".

### `pages/tenants.js`, `pages/contracts.js`
- Tenant list: cột tùy chọn `Trưởng khu`, `NV vận hành` (`Q.staffOf`), `Zalo` chip (`!!t.zalo`); preset "Đối soát" identity = `F.roomRef`.
- Tenant detail: subtitle `Mã tòa · Mã phòng` dưới tên; tab Tài chính thêm bảng "Hoàn cọc" (refunds của khách với roomRef); overview thêm "Phương tiện" (từ `contract.vehicles`).
- Contract detail/list: nhãn "HĐ lần đầu / Gia hạn lần n" (`Q.contractTermNo`); wizard `/contracts/new` thêm section **Phương tiện** (loại, biển số, thêm/xóa dòng) lưu `vehicles`; khi đổi số xe → gợi ý cập nhật qty dòng GUIXE (`U.assume`).

### Lưới tài chính — preset "Đối soát" + dimFilter
- `pages/invoices.js`: `presets.doisoat` = [`ref` (Mã tòa · phòng), `manager`, `deposit`, `listPrice`, `price`, `paidMonths`, `total`, `paid`, `rem`, `lastPay` (Ngày thu), `due`, `status`] — thêm các cột mới (hidden mặc định) render từ contract + `Q.paidMonths`, `Q.lastPaymentDate`; filter-more thêm `managerId, leadId, buildingType, areaId`; nút Xuất dùng `U.tableCsv`.
- `pages/receivables.js`: preset `doisoat` thay cột `party` bằng `ref` (không tên khách), thêm `manager`; row click vẫn mở hóa đơn; filter-more thêm dims.
- `pages/refunds.js` (+ `finance2.js` detail P2): `GROUPS` → `Q.L.deductionGroup`; list preset `doisoat` = [`ref`, `deposit`, `refund`, `ded_KH`, `ded_SC`, `ded_VS`, `ded_KHAC`] (Σ theo `groupCode`); filter-more `areaId, opsId, leadId`; query `reason=break` lọc HĐ kết thúc sớm.
- `pages/expenses.js` + `Fm.expense`: field `categoryCode` (select 2 cấp, `group` name tự suy), filter `group` → `parentCode`/`categoryCode`; KPI theo 4 nhóm cha; filter-more `areaId, opsId, leadId`.

## W3 — Kinh doanh, báo cáo, tài liệu, cổ đông, nhân sự (GAP-07/08/09 + báo cáo GAP-04, ~6-7 ngày)

### `pages/reportHub.js`
- Registry `R(...)` thêm field tùy chọn `{ metric, dims, assumed, cols, compute }`; nhóm mới `CAT.workbook` "Đối soát workbook". Report mới (impl `live`):
  - `wb-sales-ledger` Sổ doanh số (15 cột sheet KINH DOANH §2), `wb-customer-ledger` Sổ khách (8 cột §3), `wb-commission-ledger` Sổ hoa hồng (9 cột §4), `wb-sales-staff` Nhân sự sales (chức danh, thâm niên, doanh số theo kỳ — nối HR + deals).
  - `wb-profit-actual`, `wb-profit-business`, `wb-rent-margin`, `wb-cost-base`, `wb-cost-fixed`, `wb-cost-variable`, `wb-utility-diff`, `wb-ontime-rate`, `wb-vacancy-time` (ngày trống theo mốc HĐ), `wb-building-business` (4 mục), `wb-shareholder-assets`.
  - `wb-forecast-cashflow`, `wb-forecast-profit`: impl `todo` với định nghĩa đầu vào (kỳ HĐ, lịch thu/chi, công suất dự kiến) và owner Ngọc — không có forecast engine trong mockup, nói rõ.
- Màn `/reports/r/:key`: filter bar = `U.dimFilter(f, { dims: r.dims })` (mặc định `period, buildingId, areaId, leadId, opsId, buildingType, shareholderId`, sales thêm `saleId, teamId`); panel "Công thức" đọc `TH.metrics.info(r.metric)` thay chuỗi `desc + oi`; dòng "Số liệu chốt" `TH.metrics.snapshotLabel`; cột đầu có link drill-down về lưới nguồn (`#/invoices?...`, `#/expenses?...`).
- Các report live cũ (`operating-result`, `expense-by-building`, `occupancy`, `debt-by-building`) gắn `metric` tương ứng để có ⓘ.

### `pages/crm.js`
- `/crm`: filter thêm `areaId`, `teamId`; KPI thêm "Phòng đã chốt / Đã nhận / Phát sinh (hoàn cọc + phá HĐ)" (`Q.dealStats` + `Q.vacancy`), có ⓘ.
- `/crm/deals`: preset `doisoat` với cột workbook (ngày GD, roomRef, quản lý, SĐT, cọc, giá chốt, ngày tính tiền, thời hạn, nguồn, đủ/thiếu, sale, hoa hồng, trạng thái phòng chốt = `Q.L.vacancy`, ghi chú); cột "Team" và "Tổng nhận"; link "Mở sổ doanh số" → report.
- Lead form/detail: `handoverDate`, chip nguồn `Nội bộ/Đối tác` (`leadSources.kind`).

### `pages/documents.js` (mới) — `#/documents`
- Bảng: `Tài liệu | Loại | Đối tượng (link) | Tòa | Ngày | Hết hạn | Trạng thái`; nguồn `documents` + `employees[].documents` (chỉ khi P3 & quyền hr); filters `type, entityType, buildingId, areaId, status (valid|expiring|expired)`, search; upload chung (chọn entity) qua `Fm.upload`; KPI 3 dòng: Sắp hết hạn 30 ngày / Hết hạn / Tòa thiếu hồ sơ pháp lý.
- `ui/layout.js`: item `documents` "Tài liệu" trong nhóm `operations` cho admin/ops/accountant (permission `documents.view`), tile launcher cho role còn lại; `Fm.upload` thêm input `expiry`.
- `core/actions.js` `X.addDocument` nhận `expiry`.

### `pages/investment.js`
- `shareholders`/`projects`/`roi`: filter `buildingId` (qua `project.buildingId`) + `period`; tab mới `summary` "Tài sản & cọc theo tòa" (`Q.shareholderAssetSummary`), distributions cột "Tòa".

### `pages/hr.js`
- List cột "Tòa / phòng quản lý" (`Q.staffWorkload`); filter `area` → `areaId`; detail overview hiện số tòa/phòng; payroll: cột "Mã chi phí" map title → `VH-L-*` (hiển thị, `U.assume`).

## W4 — QA, tài liệu, bàn giao (~2 ngày)

- Cập nhật `docs/TimeHouse-Workbook-vs-Mockup-Audit-2026-09-16.md` mục 13 "Kết quả xử lý"; `mockup/README.md` thêm mục "Workbook alignment (v2.3)" (giả định, route mới, preset).
- Không thêm flow guide mới (ngoài scope).

## Files chính

| Loại | File |
|---|---|
| Mới | `mockup/js/core/seed-wb.js`, `core/selectors-wb.js`, `core/metrics.js`, `ui/components-wb.js`, `pages/documents.js`, `docs/TimeHouse-Workbook-Alignment-Decisions-v1.0.md` |
| Sửa lõi | `core/store.js`, `core/format.js`, `core/auth.js`, `core/actions.js` (addDocument, saveExpense categoryCode, saveContract vehicles), `ui/table.js`, `ui/forms.js` (building, expense, upload, contract vehicles), `ui/layout.js`, `mockup/index.html`, `css/components.css` (chip assume, preset menu, legal checklist) |
| Sửa page | `dashboard.js`, `rooms.js`, `buildings.js`, `tenants.js`, `contracts.js`, `invoices.js`, `receivables.js`, `refunds.js`, `finance2.js`, `expenses.js`, `reportHub.js`, `crm.js`, `investment.js`, `hr.js`, `settings.js` |
| Docs | `docs/TimoHouse-UI-Redesign-Spec-v2.2.md` (D-12, Phụ lục D), audit doc mục 13, `mockup/README.md` |

Ước lượng planning range: **~19-22 người-ngày** (W0 1.5 · W1 4-5 · W2 5-6 · W3 6-7 · W4 2). Thứ tự bắt buộc W0 → W1 → W2 → W3; trong W2/W3 các page độc lập có thể song song.

## Verification

1. `npm run check` (build check) sau mỗi workstream; `npm run dev` → mở `http://localhost:8765`.
2. **Tương thích state cũ**: trước khi sửa, `__timehouseDemo` export JSON (Công cụ hệ thống); sau W1 import lại → app load không lỗi, `meta.wbSeeded=true`, `areas`/`expenseGroups` cha-con xuất hiện, record cũ (`expenses.group`, `refundDeductions.group`) không đổi. Kiểm tra cả "Đặt lại dữ liệu demo" và "Xóa trắng".
3. **Kịch bản tự động**: `__timehouseDemo.runAll()`, `runAllP2()`, `runAllP3()` pass; walkthrough F01–F10 không regress (đặc biệt hoàn cọc với deductions group mới, tạo chi phí với categoryCode).
4. **Playwright MCP** duyệt từng role: admin (Điều hành: lọc Khu nhà/Trưởng nhóm → KPI đổi, click KPI → danh sách đã lọc đúng số), kế toán (preset Đối soát ở hóa đơn/công nợ + Xuất CSV đúng cột), ops (tab Nhân sự phụ trách, Hồ sơ pháp lý), sale (`/crm` filter team, `/reports/r/wb-sales-ledger`), codong (filter tòa, tab Tài sản & cọc), hr (cột tòa/phòng).
5. **Dimension nhất quán**: cùng bộ lọc (kỳ + khu + tòa) cho ra cùng `buildingIds` ở dashboard, `/invoices`, `/reports/r/*` (kiểm tra bằng console `TH.q.scope(f)`).
6. **Metric**: mỗi KPI/report workbook có ⓘ công thức; metric `assumed` hiển thị chip Giả định; `wb-profit-actual` − `wb-profit-business` = cọc mới − hoàn cọc − mua TB (đối chiếu bằng số seed).
7. Viewport 1366: lưới preset mặc định không cuộn ngang; preset Đối soát được phép cuộn ngang có sticky identity (theo v2.2 §6.2).
8. Doc: Decision Pack đủ 10 giả định có owner; spec v2.2 có D-12 + Phụ lục D; audit mục 13 map đủ GAP-01..09/11.
