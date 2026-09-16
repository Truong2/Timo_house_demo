# TimeHouse Workbook Alignment — Decision Pack v1.0

> Trạng thái: **Draft for review** · Ngày cập nhật: 16/09/2026 · Phạm vi: GAP-01..09 và GAP-11

## 1. Mục tiêu và nguyên tắc

Workbook của khách hàng được dùng như tài liệu đối soát nghiệp vụ, không được dùng như một schema màn hình. Giải pháp triển khai theo bốn lớp để một định nghĩa được dùng nhất quán ở mọi nơi:

1. Master data: Khu nhà, loại nhà, team sale, taxonomy chi phí và phân công nhân sự.
2. Dimension và metric: một bộ lọc phạm vi `Q.scope()` và một registry công thức `TH.metrics`.
3. Preset đối soát: giữ bảng mặc định gọn; người dùng chủ động chọn bộ cột workbook.
4. Báo cáo: dùng cùng selector/metric với dashboard và các lưới nguồn.

Thay đổi dữ liệu là additive-only: không xóa hoặc đổi nghĩa field cũ, không tăng `SCHEMA`; migration idempotent được đánh dấu bằng `meta.wbSeeded`.

## 2. Decision log cần xác nhận

| # | Chủ đề | Quyết định đang triển khai | Trạng thái | Owner xác nhận | Hạn |
|---:|---|---|---|---|---|
| 1 | Khu nhà / Khu vực | Tạo `areas`; mỗi quận hiện có sinh một Khu nhà; `buildings.areaId` là khóa chuẩn. UI dùng nhãn “Khu nhà”. | Giả định | PO | Trước UAT |
| 2 | Loại nhà T/S/G | T = thuê lại chủ nhà; S = sở hữu công ty; G = góp vốn cổ đông. | Giả định | Ngọc/PO | Trước UAT |
| 3 | Vai trò quản lý | Quản lý = `building.managerId`; Trưởng khu/nhóm = area lead; vận hành/vệ sinh/kỹ thuật lấy từ assignment có hiệu lực; cho phép kiêm nhiệm. | Giả định | Ops lead | Trước UAT |
| 4 | Cọc và lợi nhuận | Cọc mới là dòng tiền, không phải doanh thu kế toán. LN thực thu gồm cọc/mua thiết bị; LN kinh doanh loại các khoản này. | Giả định | Ngọc/Kế toán | Trước sign-off metric |
| 5 | Ba trạng thái phòng trống | Ở ngay = `ready`; cuối tháng = HĐ kết thúc trong kỳ, chưa gia hạn; chờ xử lý = `held` hoặc `cleaning`. | Giả định | Ops lead | Trước UAT |
| 6 | Ngày thu / số tháng đã TT | Ngày thu là payment gần nhất; số tháng đã thanh toán là số hóa đơn có dòng tiền phòng đã thu đủ. | Giả định | Kế toán | Trước sign-off metric |
| 7 | Trung tâm Tài liệu | `#/documents` là index dùng chung; hồ sơ pháp lý chi tiết vẫn nằm trong hồ sơ tòa. | Đã triển khai | PO | — |
| 8 | Dự án và tòa | Giữ quan hệ một dự án — một tòa qua `projects.buildingId`. | Giả định | PO | Trước UAT |
| 9 | “Khách hoà” | Diễn giải là khách hoàn cọc; dữ liệu đối chiếu theo mã tòa · mã phòng. | Giả định | Khách hàng | Trước UAT |
| 10 | Báo cáo KD của nhà | Gồm tổng thu–chi dịch vụ, danh sách tòa, chi tiết hạng mục từng tòa và tổng thu–chi/tòa. | Giả định | Ngọc | Trước UAT |

Mọi mục “Giả định” phải hiển thị chip cảnh báo trong UI hoặc phần công thức; chưa được dùng để chốt số liệu kế toán chính thức.

## 3. Data dictionary bổ sung

| Collection / field | Kiểu | Ý nghĩa | Seed / migration |
|---|---|---|---|
| `areas` | collection | Khu nhà dùng chung | Một record cho mỗi `district` hiện có |
| `areas.leadEmployeeId` | id/null | Trưởng khu/trưởng nhóm | Assignment `lead` khả dụng đầu tiên |
| `salesTeams` | collection | Team kinh doanh | Hai team demo, nối qua `users.teamId` |
| `buildings.areaId` | id | Khu nhà của tòa | Map theo quận |
| `buildings.buildingType` | `T/S/G` | Loại sở hữu/khai thác | Seed demo: HĐ chủ nhà đã kết thúc → S; có dự án góp vốn → xen kẽ G/T theo thứ tự tòa để đủ dữ liệu lọc; còn lại có chủ nhà → T (`seed-wb.js` `buildingTypeOf`, fixup `meta.wbFixups.buildingTypeV2`) |
| `assets.ownership` | `company/landlord` | Field có sẵn (P3) | Seed demo: tài sản hạ tầng (thang máy, PCCC, máy phát, điện, chiếu sáng, an ninh) ở tòa loại T → `landlord`; hồ sơ tòa tách 2 bảng Tài sản chủ nhà / Tài sản đầu tư; ROI chỉ tính `company` (fixup `assetOwnershipV1`) |
| `buildings.areaM2` | number | Diện tích vận hành mẫu | `floors × perFloor × 35` |
| `buildings.condition` | enum | Mới / trung bình / cũ | Seed mẫu |
| `buildings.operatingSince` | date | Ngày bắt đầu vận hành | HĐ chủ nhà hoặc 01/01/2024 |
| `buildings.licenseExpiry` | date/null | Hạn ĐKKD | Seed mẫu |
| `buildings.pccc` | object | Trạng thái và hạn PCCC | Seed mẫu |
| `expenseGroups.parentCode` | code/null | Taxonomy chi phí hai cấp | Cha GV/DV/VH/BH và các mã con |
| `expenses.categoryCode` | code | Mã chi phí chi tiết | Backfill từ tên nhóm cũ |
| `refundDeductions.groupCode` | enum | KH/SC/VS/KHAC/CN | Backfill, giữ `group` text cũ |
| `services.wbType` | enum | Loại dịch vụ workbook | electric/water/internet/elevator/common/ev_charge/parking |
| `contracts.vehicles` | array | Loại và biển số xe | Seed từ dòng gửi xe |
| `leadSources.kind` | enum | Nội bộ / đối tác | Seed mẫu |
| `leads.handoverDate` | date | Ngày bàn giao lead | Ngày tạo hiện có |
| `documents.expiry` | date/null | Ngày hết hạn tài liệu | Seed một số hồ sơ pháp lý |

Các record cũ ở `expenses.group` và `refundDeductions.group` được giữ nguyên để tương thích.

## 4. Metric dictionary

| Key | Tên | Công thức tóm tắt | Bao gồm / Loại trừ | Trạng thái | Owner |
|---|---|---|---|---|---|
| `revenue.rent` | Doanh thu tiền thuê | Tổng dòng tiền phòng đã phát hành trong kỳ | Tiền phòng / cọc, hoàn cọc | Approved | Kế toán |
| `revenue.newDeposit` | Cọc mới | Tổng cọc HĐ bắt đầu trong kỳ | Dòng tiền vào / doanh thu kế toán | Assumed | Ngọc |
| `revenue.penalty` | Phạt/khấu trừ | Tổng phạt và khoản giữ lại | Phạt phá HĐ / tiền thuê | Assumed | Kế toán |
| `collection.progress` | Tiến độ thu | Đã thu ÷ phải thu đã phát hành | Payment hợp lệ / nháp, hủy | Approved | Kế toán |
| `profit.actual` | LN thực thu | Thu thực tế gồm cọc − chi thực tế gồm mua thiết bị/hoàn cọc | Theo workbook | Assumed | Ngọc |
| `profit.business` | LN kinh doanh | Doanh thu thuê + DV + phạt − chi vận hành | Loại cọc, hoàn cọc, mua thiết bị | Assumed | Ngọc |
| `margin.rent` | Biên tiền thuê | Doanh thu tiền nhà ÷ chi phí thuê nhà | `GV-THUE` | Assumed | Ngọc |
| `cost.base` | Chi phí gốc | Tổng nhóm GV | Thuê nhà, mua thiết bị | Approved | Kế toán |
| `cost.fixed` | Chi phí cố định | Tổng DV + VH | Dịch vụ gốc, vận hành | Assumed | Kế toán |
| `cost.variable` | Chi phí phát sinh | Tổng BH | Marketing, sửa chữa, khác | Assumed | Kế toán |
| `occupancy.rate` | Tỷ lệ lấp đầy | Phòng đang thuê ÷ tổng phòng khả dụng | Phòng active / phòng đóng | Approved | Ops |
| `vacancy.days` | Ngày phòng trống | Số ngày không có HĐ trong kỳ | Khoảng trống HĐ / ngày ngoài kỳ | Assumed | Ops |
| `utility.diff` | Chênh lệch điện nước | Doanh thu điện nước − giá gốc | Invoice lines / khoản khác | Assumed | Ngọc |
| `ontime.rate` | Thanh toán đúng hạn | HĐ thu đủ trước/đúng hạn ÷ HĐ đến hạn | Invoice issued / draft, hủy | Assumed | Kế toán |
| `roi.capital` | ROI vốn góp | Phân phối kỳ ÷ vốn góp | Phân phối / đánh giá tài sản | Approved | Đầu tư |
| `roi.asset` | ROI tài sản | Lợi ích kỳ ÷ nguyên giá tài sản công ty | Tài sản company / landlord | Assumed | Ngọc |

UI phải cho phép mở công thức bằng biểu tượng thông tin và ghi snapshot kỳ/timestamp ở báo cáo.

## 5. Preset “Đối soát”

| Lưới | Bộ cột |
|---|---|
| Hóa đơn | Mã tòa · phòng; quản lý; cọc; giá niêm yết; giá chốt; số tháng đã TT; tổng; đã thu; còn lại; ngày thu; hạn; trạng thái |
| Công nợ | Mã tòa · phòng; quản lý; kỳ; phải thu; đã thu; còn lại; hạn; trạng thái |
| Hoàn cọc | Mã tòa · phòng; cọc; hoàn; KH; SC; VS; KHÁC |
| Chi phí | Ngày; mã tòa; nhóm cha; mã chi phí; hạng mục; số tiền; trạng thái |
| Sổ doanh số | 15 cột theo workbook: ngày GD đến ghi chú, kèm Team và Tổng nhận khi cần |
| Sổ khách | Sale; mã tòa · phòng; nguồn; loại nguồn; trạng thái; khu nhà; SĐT; ngày bàn giao |
| Sổ hoa hồng | Mã tòa · phòng; giá chốt; thời hạn; tỷ lệ; hoa hồng; tổng nhận; sale; team; trạng thái |

Preset chỉ thay cấu hình cột, không đổi dữ liệu gốc. Xuất CSV lấy đúng các cột đang hiển thị.

## 6. Traceability

| GAP | Kết quả | Route chính | Thành phần nguồn |
|---|---|---|---|
| GAP-01 | Master Khu nhà + bộ lọc chung | `#/settings/catalog?tab=areas` | `seed-wb.js`, `selectors-wb.js` |
| GAP-02 | T/S/G và assignment nhân sự | `#/buildings`, `#/buildings/:id?tab=staff` | `buildings.js`, `forms.js` |
| GAP-03 | Taxonomy chi phí hai cấp | `#/settings/catalog?tab=groups`, `#/expenses` | `settings.js`, `expenses.js` |
| GAP-04 | Registry công thức/lợi nhuận | `#/reports/hub` | `metrics.js`, `reportHub.js` |
| GAP-05 | Dashboard phòng trống và thu kỳ | `#/dashboard`, `#/rooms?vac=...` | `dashboard.js`, `rooms.js` |
| GAP-06 | Preset tài chính | `#/invoices`, `#/receivables`, `#/refunds` | `table.js`, các page tài chính |
| GAP-07 | Trung tâm Tài liệu | `#/documents` | `documents.js` |
| GAP-08 | Sổ kinh doanh/hoa hồng | `#/reports/r/wb-sales-ledger` | `selectors-wb.js`, `reportHub.js` |
| GAP-09 | Tài sản và cọc theo tòa/cổ đông | `#/reports/r/wb-shareholder-assets` | `selectors-wb.js`, `reportHub.js` |
| GAP-11 | Query/preset đối soát dùng chung | Các route trên | `components-wb.js`, `table.js` |

## 7. Tiêu chí sign-off

- Cùng một bộ lọc kỳ/khu/tòa phải resolve cùng `buildingIds` trên dashboard, lưới và báo cáo.
- KPI/report giả định luôn có nhãn cảnh báo; không trình bày là số liệu đã duyệt.
- State cũ tự migrate, record legacy không mất và reset demo vẫn chạy.
- Preset mặc định không quá bảy cột nghiệp vụ chính; preset Đối soát được phép cuộn ngang.
- Admin, kế toán, ops, sale, HR và cổ đông chỉ thấy route/dữ liệu đúng quyền.

