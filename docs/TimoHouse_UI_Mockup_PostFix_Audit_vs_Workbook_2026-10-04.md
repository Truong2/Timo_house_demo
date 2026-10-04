# Audit UI mockup sau sửa — đối chiếu workbook ngày 04/10/2026

> Đây là kết quả trước đợt sửa 8 gap, trên commit `3d5b645`. Xem kết quả đợt sửa tiếp theo tại [Audit Gap Completion](uat/Audit_Gap_Completion_2026-10-04.md).

**Kết luận: chưa khớp hoàn toàn.** Có chức năng tương ứng với đủ 10 nhóm menu nguồn; đã tái hiện **6 gap chức năng/trường UI** và **2 mục còn PARTIAL về cách tính**. Các lỗi nằm trên cả source và Netlify hiện tại, không phải deploy cũ.

## Bản và phạm vi đã kiểm tra

- Nguồn: `nội dung làm web Timehouse 31.8.2026(2).xlsx`, đọc đủ 10 sheet, giữ tọa độ ô trong `output/audit-post-fix-2026-10-04/workbook.json`.
- Source: `3d5b645d5fa67317a21ff48a628b214b89ea4b99`.
- Live: https://timohousev2.netlify.app; `build.json` = `sha: 3d5b645`, `builtAt: 2026-10-04T10:11:13.665Z`. **112/112 file JS được tải khớp source**, sau chuẩn hóa CRLF/LF.
- Audit mới: **54 màn/tab** trên Live và local, tài khoản admin; thêm ca đổi dữ liệu và màn responsive 375/768px. Mỗi môi trường có `routes.json`, `audit.json`, ảnh.
- Chạy lại trực tiếp trên Netlify: **94 checks workbook**, **66 checks field-level**, **225 checks UI/in/xuất** đều PASS. Các luồng module mới cũng PASS. Không lấy kết quả localhost rồi gọi đó là Live.
- PDF chủ nhà/khách thuê, ảnh OCR và Excel gốc đã đọc thật trên Netlify. Luồng OCR cho lượt thuê đã có: đọc PDF → rà **6 nhóm** → so giá đang áp 5.100.000 với giá PDF 4.500.000 → xác nhận → áp từ 01/11/2026 → lưu file/session/phiên hợp đồng và biểu phí, PASS.
- Ngày dữ liệu demo trên UI là **29/09/2026**; kỳ mặc định dữ liệu là **09/2026**. Không dùng ngày build để suy ra ngày số liệu.

`PASS UI` xác nhận trường/luồng đã thấy và được kiểm tra trong phạm vi nêu trên. `FAIL` có expected/actual tái hiện. `PARTIAL` chỉ rõ phần đã có và phần chưa khớp/chưa đủ căn cứ. Số checks tự động không phải tỷ lệ bao phủ tất cả yêu cầu workbook.

## Các gap đã tái hiện

| ID / mức | Ô nguồn | Expected | Actual trên source và Live | Route / bằng chứng |
|---|---|---|---|---|
| **VEHICLE-BILLING — P0** | `Thông tin khách hàng!G7:G9`; liên kết hóa đơn cũng được nêu trong CH-12 | Xe điện khai báo trong hồ sơ phải nối được sang số lượng tính phí của hóa đơn mới. | Lưu **2 xe điện** bằng UI, biểu phí **100.000đ/xe**, rồi tạo hóa đơn nháp 10/2026: `customer.vehicles.length=2`, `stay.vehicles=0`, lượng dòng 8 **0**, thành tiền **0đ**, thay vì 2 xe / 200.000đ. | `/stays/:id?tab=nguoi-thue`, `/billing/invoices/:id`; `live/vehicle-list.png`, `live/vehicle-invoice.png`, finding `VEHICLE-BILLING` |
| **FEE-SPLIT — P1** | `Thông tin khách hàng!G9` | Lưu độc lập phí sạc xe điện và phí gửi xe theo hợp đồng. | Chỉ có key `ev`, nhãn **“Xe điện / gửi xe”**. Chưa thể nhập đồng thời hai đơn giá khác nhau. Gộp dòng in có thể giữ, nhưng dữ liệu phí cần tách. | `/stays/:id?tab=dich-vu-gia`; `live/route-16.png`, finding `FEE-SPLIT` |
| **EXP-FILTER — P1** | `Tài chính chung!I22` | Chi phí lọc theo thời gian, tòa, khu vực, NV vận hành, trưởng khu vực. | `/expenses` có kỳ, tìm kiếm, loại, tòa/quỹ, dòng báo cáo, nguồn; **thiếu khu vực, NV vận hành, trưởng khu vực**. | `/expenses`; `live/routes.json`, finding `EXP-FILTER` |
| **SHARE-ASOF — P1** | `TT CỔ ĐÔNG!E2:F2,C5` | Thống kê tài sản/cọc áp bộ lọc tòa và thời gian đang xem. | Đổi khoảng 09/2026 sang 10/2026 nhưng nội dung tab tài sản/cọc không đổi. Code tab dùng `S.meta.period` và cọc hợp đồng hiện tại, không dùng `from/to`; tài sản mở kỳ 10 vẫn bị hiển thị theo kỳ demo 09. Bộ lọc ngày đã hoạt động ở lịch góp/giao dịch, chưa áp vào tab này. | `/shares/capital?building=b_G1&tab=tai-san-coc`; `live/share-assets-2026-09.png`, `live/share-assets-2026-10.png`, finding `SHARE-ASOF` |
| **SALE-REPORT-LEADER — P1** | `BÁO CÁO!E22` | Báo cáo khách hàng có lọc trưởng khu vực vận hành, cùng sale và team sale. | Có khu vực, tòa, loại nhà, NV vận hành, cổ đông, sale, **team sale**, nhưng **thiếu trưởng khu vực vận hành**. Team sale và trưởng khu vực là hai chiều được liệt kê riêng trong nguồn. | `/reports/sales`; `live/routes.json`, finding `SALE-REPORT-LEADER` |
| **SALE-STT — P2** | `KINH DOANH!C37` | Danh sách nhân sự kinh doanh có STT, nhân viên, chức vụ, thâm niên, doanh số theo thời gian. | Đã có các trường và kỳ doanh số; **chưa có STT** ở tab Nhân sự sale. STT ở Khách xem, Giao dịch, Hoa hồng đã có. | `/sales/commission?tab=nhan-su`; `live/route-30.png`, finding `SALE-STT` |

Ca xe dùng tòa/lượt thuê được tạo riêng trong browser context kiểm tra, không sửa fixture source hay dữ liệu đã phát hành. Các thao tác chỉ ghi kho trình duyệt của context; audit không phát sinh HTTP POST/PUT/DELETE tới site.

## Hai mục PARTIAL về cách tính

| ID | Ô nguồn | Đã có | Chưa thể chốt là khớp |
|---|---|---|---|
| **SALARY-MODE** | `NHÂN SỰ!A5:A9` | Policy 5 bộ phận, ngày hiệu lực, nguồn, trạng thái; nhập tay/phiên/duyệt/chốt/chi. | Trường **“Cách tính”** của policy được lưu vào snapshot; engine chủ yếu chọn nhánh theo chức danh. Ca TC-KT: chuyển `fixed` → `manual` vẫn giữ base 7.000.000 và tổng 7.500.000 khi chưa nhập mức tay. Cần quy định rõ mode điều khiển công thức hay chỉ mô tả, rồi kiểm tra từng mode; không gọi việc có 5 policy là đã nghiệm thu đủ 5 công thức. Workbook chỉ liệt kê bộ phận; câu hỏi bổ sung OQ-01b vẫn thiếu trả lời công thức các phòng khác. |
| **BUSINESS-REFUND** | `BÁO CÁO!D6` | Có báo cáo KD và cầu nối, chế độ Excel/chế độ đề xuất, số kỳ khóa. | Nguồn ghi KD không gồm cọc mới, **hoàn cọc**, mua sắm thiết bị. Mặc định mode `excel` của kỳ Web 09/2026 vẫn giữ hoàn cọc **355.311.170đ**; chỉ trừ cọc mới khỏi DT. Có phương án cộng lại hoàn cọc, nhưng chưa là chế độ chính thức. Đây là khác biệt giữa mô tả workbook và chính sách tái hiện Excel/OQ-10, không tự sửa số lịch sử để đóng gap. |

Forecast, LN/vốn, LN/tài sản và conversion có UI; nhiều công thức vẫn được gắn nhãn đề xuất/chờ xác nhận. Việc này được ghi nhận là đã có giao diện, không đồng nghĩa toàn bộ chỉ tiêu đã được xác nhận nghiệp vụ.

## Đối chiếu từng sheet và trường

| Sheet / ô | Yêu cầu nguồn | Màn/field tìm thấy | Kết quả |
|---|---|---|---|
| `menu chính!B2:B11` | 10 nhóm chức năng | Sidebar và màn con tương ứng; tên nhóm được gom theo vận hành/kinh doanh/tài chính trong UI | **PASS UI coverage**, không khẳng định bố cục/tên menu giống từng chữ |
| `Tổng quan!A1` | 3 nhóm trống: ở luôn, cuối tháng, đang chờ | `/dashboard`: 3 KPI và liên kết danh sách | **PASS UI** |
| `Tổng quan!A2` | DT tiền nhà, cọc mới, phá HĐ | `/dashboard`: 3 KPI riêng | **PASS UI** |
| `Tổng quan!A3` | Tiến độ thu tiền | `/dashboard`: tiến độ 5/10/15 và tiền thực nhận | **PASS UI** |
| `Tổng quan!A4` | Lọc khu vực, quản lý, trưởng nhóm | `/dashboard`: `area`, `manager`, `leader` | **PASS UI** |
| `Khu nhà và toàn nhà!A1:A2` | Tòa nhà gồm thông tin tòa và chủ nhà | `/buildings/:id`, tab Chủ nhà & HĐ, liên kết hồ sơ chủ nhà | **PASS UI** |
| `Khu nhà và toàn nhà!D3` | Hồ sơ cá nhân theo hợp đồng | `/owner-profiles/:id`, form sửa: tên, CCCD/ngày/nơi cấp, ngày sinh, địa chỉ, liên hệ, ngân hàng, người liên quan, ghi chú | **PASS UI**; dữ liệu chưa có không được tự điền |
| `Khu nhà và toàn nhà!D4` | Giá thuê, cọc, giữ giá, hết HĐ, PCCC, người nhập, ghi chú | `/owners/:id`: giá/phiên giá, cọc, ngày giữ giá, hết hạn, Có/Không/Chưa xác định PCCC, người tạo, nguồn, ghi chú | **PASS UI** và luồng sửa/lưu phiên |
| `Khu nhà và toàn nhà!D5,D12` | Sổ đỏ và ĐKKD | `/buildings/:id?tab=phap-ly`, kho tài liệu liên kết | **PASS UI**; hồ sơ mẫu nhiều tòa chưa có file/số chứng từ |
| `Khu nhà và toàn nhà!D7:D10` | Địa chỉ, diện tích, tầng/phòng, cũ/mới/trung bình | `/buildings`, chi tiết tòa, form hồ sơ | **PASS UI** |
| `Khu nhà và toàn nhà!D11` | Trưởng nhóm, vận hành, vệ sinh, kỹ thuật | Tab Nhân sự: nhóm riêng, phân công hiệu lực | **PASS UI**, ca phân công vệ sinh đã chạy |
| `Khu nhà và toàn nhà!D13` | Tài sản chủ nhà và đầu tư | Tab Tài sản → `/assets`, phân loại sở hữu | **PASS UI** |
| `Khu nhà và toàn nhà!D14:D16` | HS, LN, thời gian vận hành | KPI/màn báo cáo, ngày nhận và số ngày vận hành | **PASS UI**; trạng thái công thức được giữ rõ |
| `Khu nhà và toàn nhà!A17` | Lịch đóng tiền | `/owner-payments`, tab Lịch trả, chứng từ/audit | **PASS UI** |
| `Thông tin khách hàng!G1:G6` | Mã phòng/tòa, trưởng khu vực, vận hành, nợ, Zalo, trạng thái | `/tenants`: mã phòng, quản lý/leader, còn nợ, liên kết Zalo; tabs đang ở/phá HĐ/sắp hết/chờ hoàn | **PASS UI** |
| `Thông tin khách hàng!G6` | Cảnh báo trước 35 ngày | `/tenants?view=expiring`; rule `expiryWarnDays=35` | **PASS UI** |
| `Thông tin khách hàng!F7,G7` | Tiêu đề mã phòng/tòa; bắt đầu/kết thúc/thời hạn, gia hạn, nghề nghiệp | `/stays/:id`: tiêu đề mã, dải ngày/thời hạn, số lần gia hạn, tab Gia hạn, hồ sơ nghề nghiệp | **PASS UI** |
| `Thông tin khách hàng!G7` | Số xe, biển số | Danh sách nhiều xe đã lưu/sửa/xóa qua reload | **PASS hồ sơ**, **FAIL nối lượng tính phí** |
| `Thông tin khách hàng!G8` | Upload HĐ → đọc/áp bảng giá riêng theo HĐ | Intake và OCR thật cho lượt thuê đang có, review/confirm/date/file/session/version | **PASS luồng đã chạy** |
| `Thông tin khách hàng!G9` | Điện, nước, mạng, thang máy, DV chung, sạc xe, gửi xe | Các phí khác có phương thức/đơn giá riêng; phí xe chỉ một key | **PARTIAL — FEE-SPLIT** |
| `Thông tin khách hàng!G10` | Ghi chú nhập tay | Hồ sơ và biểu phí có ghi chú | **PASS UI** |
| `Thông tin khách hàng!G11` | Câu nguồn bị dở “thêm danh sách khách hoà…” | Danh sách chờ hoàn cọc và `/refunds` có mã phòng/tòa | **Có màn liên quan**; không suy diễn phần nội dung chưa viết |
| `Tài chính chung!E1` | Mẫu hóa đơn Timehouse | 4 template, 12/13 dòng, preview và PDF | **PASS mẫu/đầu ra kiểm tra**, 8 PDF mẫu đã xuất |
| `Tài chính chung!E2` | Mã phòng/tòa, quản lý, cọc, niêm yết/thuê, tháng TT, tổng/thu/nợ, ngày thu, hạn, trạng thái | Danh sách/chi tiết hóa đơn và phiếu thu liên kết | **PASS field-level** |
| `Tài chính chung!E3` | Lọc quản lý, trưởng khu vực, tòa, T/S/G, trạng thái, hạn | `/billing/invoices`: bộ lọc tương ứng | **PASS UI** |
| `Tài chính chung!E4:E5` | Công nợ dùng mã phòng/tòa | `/billing/debts`, tuổi nợ, tiến độ | **PASS UI**; aging đã có, không còn gap thiếu màn |
| `Tài chính chung!D6:E27` | Nhóm và dòng chi phí | Catalog/report mapping và báo cáo chi phí | **PASS taxonomy UI** |
| `Tài chính chung!I22` | Bộ lọc chi phí | Kỳ/tòa có; 3 chiều nhân sự/khu vực chưa có trên danh sách | **FAIL — EXP-FILTER** |
| `Tài chính chung!D28:E32` | Tổng/tòa/chi tiết thu-chi điện nước dịch vụ | `/reports/amduong`, mode Web và nguồn; dịch vụ có nhãn đề xuất | **PASS UI**, cách tính dịch vụ còn cần xác nhận |
| `Tài chính chung!D33:D40` | Hoàn cọc và các khoản khấu trừ/bộ lọc | `/refunds`, chi tiết/phiếu in; cọc, khấu hao, sửa, vệ sinh, khác; ngày/tòa/khu vực/manager/leader | **PASS UI/fixture readback** |
| `KINH DOANH!A1:B3` | Hàng hóa, chốt/nhận/phát sinh, lọc khu vực/trưởng nhóm/sale | `/sales` | **PASS UI** |
| `KINH DOANH!C5:C19` | 15 trường giao dịch | `/sales/deals`: STT, ngày, phòng, quản lý, SĐT, cọc, giá, ngày/thời hạn, kênh, thu tiền, sale, HH, loại chốt, ghi chú; CSV | **PASS field-level** |
| `KINH DOANH!C20:C27` | Khách xem: STT, sale, phòng, nguồn, trạng thái, khu vực, SĐT, ngày gửi | `/sales/leads`, khu vực và lượt xem trong drawer | **PASS UI** |
| `KINH DOANH!C28:C36` | HH theo phòng, giá, thời hạn, mức, thành tiền, nhận, team, trạng thái | `/sales/commission`: STT/dòng HH, tổng người nhận, bộ lọc Team, chi thực | **PASS chức năng**; Team được lọc riêng thay vì thêm cột Team trong mỗi dòng |
| `KINH DOANH!C37:C41` | Nhân sự kinh doanh và doanh số theo thời gian | Tab Nhân sự sale có kỳ/chức danh/thâm niên/doanh số | **PARTIAL — thiếu STT** |
| `BÁO CÁO!C1:D2` | HS thực tế/tạm tính | `/reports/rooms?view=hs`, Dashboard | **PASS UI** |
| `BÁO CÁO!C3:E4` | DT tổng, LN dòng tiền và bộ lọc | `/reports/total`, theo tòa; period/building/area/manager/leader/group/shareholder | **PASS UI** |
| `BÁO CÁO!C6:D6` | KD bỏ cọc mới, hoàn cọc, mua thiết bị | Có KD/cầu nối, nhưng mode mặc định giữ hoàn cọc | **PARTIAL — BUSINESS-REFUND** |
| `BÁO CÁO!C7:C8` | Dự kiến LN dòng tiền/KD | `/reports/forecast`, đầu vào/2 kết quả/phiên/so sánh | **PASS UI**; dự kiến chưa được công bố là số chuẩn |
| `BÁO CÁO!C9:C11` | LN/vốn, LN/tài sản, thu/chi tiền nhà | `/reports/efficiency` | **PASS UI**; LN/tài sản cần số dư/chính sách, công thức OQ-24 còn đề xuất |
| `BÁO CÁO!C12:C14` | Giá vốn, cố định, phát sinh | `/reports/costs`, chi tiết và drill-down | **PASS UI** |
| `BÁO CÁO!C15:C19` | Lấp đầy/trống, âm dương, sửa/vệ sinh, phân khúc, đúng/quá hạn | `/reports/rooms?view=occ|seg|pay`, `/reports/amduong`, `/reports/repairs` | **PASS UI**; kỳ thiếu dữ liệu được ghi rõ |
| `BÁO CÁO!C22:E22,C23` | Conversion/doanh số và bộ lọc | `/reports/sales`, hai tab | **PARTIAL — thiếu trưởng khu vực**; conversion/doanh số có nhãn chờ xác nhận |
| `NHÂN SỰ!B1:B3` | Cá nhân, phòng ban, chức vụ, thâm niên, trạng thái, tòa/phòng | `/hr`, `/hr/staff/:id`, `/hr/assignments` | **PASS UI** |
| `NHÂN SỰ!A5:A9` | Lương 5 phòng | `/hr/payroll`: policy 5 bộ phận và khoản lương | **PARTIAL — SALARY-MODE**, chưa nghiệm thu đủ 5 công thức |
| `TT CỔ ĐÔNG!A2:C2` | Cổ đông, tỷ lệ, bảng chia | `/shares`, `/shares/:id`; phiên sở hữu, bảng khóa, audit | **PASS UI/luồng phiên** |
| `TT CỔ ĐÔNG!D2` | Lịch đóng tiền từng người | `/shares/capital?tab=lich-dong`: theo lịch trả chủ nhà × tỷ lệ | **PASS UI** |
| `TT CỔ ĐÔNG!E2:F2,C5` | Tài sản/cọc, lọc tòa/thời gian | Tab Tài sản/cọc có số liệu tòa, nhưng ngày không chi phối | **PARTIAL — SHARE-ASOF** |
| `BẢO TRÌ BẢO DƯỠNG!A1:A4` | 4 loại lịch | `elevator`, `pump`, `washer`, `water_filter`, trạng thái hạn/nhắc | **PASS UI** |
| `BẢO TRÌ BẢO DƯỠNG!A5:B5` | Kiểm kê tài sản/décor | `/assets/inventory?type=decor`, nhập/duyệt/ảnh/xuất chênh | **PASS UI** |

Các phần từng bị đánh giá “chưa verify” như aging, các loại lịch bảo dưỡng, trường chủ nhà, xe/tạm trú, phiên lương và phiên sở hữu nay đã có bằng chứng phù hợp. Không ghi lại chúng thành lỗi thiếu toàn bộ module. Riêng xe còn lỗi **nối hồ sơ → hóa đơn**, cổ đông còn lỗi **thời gian thống kê**, và policy lương còn điểm cần kiểm chứng **điều khiển cách tính**.

## Vì sao test đã qua nhưng vẫn có gap

Ca module cũ kiểm tra xe lưu/sửa/xóa qua reload, chưa tạo hóa đơn sau thao tác đó. Ca policy kiểm tra 5 bộ phận và snapshot, chưa chứng minh chuyển mode làm đổi công thức. Ca cổ đông kiểm tra lịch/phiên/tỷ lệ, chưa đổi thời gian ở tab thống kê tài sản. Các bộ này PASS đúng phần đã kiểm tra; **không đủ để đóng toàn bộ yêu cầu nguồn**.

Ưu tiên sửa: VEHICLE-BILLING → FEE-SPLIT → EXP-FILTER/SHARE-ASOF/SALE-REPORT-LEADER → SALE-STT. Với lương và báo cáo KD, cần chốt ý nghĩa mode/chính sách rồi thêm ca expected/actual; giữ số các kỳ khóa.

## Bằng chứng và chạy lại

- Kết quả chi tiết: `output/audit-post-fix-2026-10-04/live/audit.json`, `local/audit.json`; mỗi finding có ô nguồn, expected, actual, trạng thái và ảnh.
- Màn/tab, bộ lọc, cột bảng, nội dung và overflow: `live/routes.json`, `local/routes.json`.
- Logs Live: `live-workbook.log`, `live-source.log`, `live-ui.log`, `live-modules.log`, `live-intake.log`.
- Script audit mới: `node scripts/audit-workbook-ui.mjs` mặc định kiểm tra Netlify; thêm `--local` để tự chạy server mockup. Có thể đặt `AUDIT_BASE_URL` cho deploy khác. Script xuất finding FAIL nhưng không sửa application source.

Lần này chỉ thêm script/bằng chứng/báo cáo audit, chưa sửa hoặc push các gap mới. Phạm vi kiểm tra trực quan tất cả màn nêu trên dùng admin; không tuyên bố đã audit UI của mọi vai trò hay mọi biến thể hợp đồng thực tế.
