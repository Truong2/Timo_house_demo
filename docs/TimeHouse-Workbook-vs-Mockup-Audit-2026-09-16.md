# Audit đối chiếu workbook nghiệp vụ và UI mockup TimoHouse

**Ngày đối chiếu:** 16/09/2026  
**Nguồn nghiệp vụ:** `nội dung làm web Timehouse 31.8.2026(2).xlsx` (10 sheet)  
**Baseline UI:** source mockup hiện tại trong `mockup/`, bao gồm các màn hình đã có và các phân hệ theo phase.  
**Mục tiêu:** chỉ ra chênh lệch từ cấp mô hình nghiệp vụ, điều hướng, action, dữ liệu, bộ lọc đến báo cáo; đây là tài liệu để quyết định trước khi implement tiếp.

## 1. Cách đọc kết quả

| Trạng thái | Ý nghĩa |
|---|---|
| Đã có | Mockup đã thể hiện trực tiếp màn hình và luồng tương ứng. |
| Một phần | Có dữ liệu/luồng gần đúng, nhưng thiếu field, action, cách hiển thị, bộ lọc hoặc quy tắc nghiệp vụ của workbook. |
| Chưa có | Chưa thấy màn hình, action hoặc mô hình dữ liệu tương ứng trong mockup. |
| Mở rộng | Mockup có thêm năng lực không được yêu cầu rõ trong workbook; không phải lỗi, nhưng cần xác nhận còn trong phạm vi sản phẩm. |
| Cần làm rõ | Workbook chưa đủ rõ để biến thành yêu cầu có thể nghiệm thu. |

> Phạm vi kiểm tra là UI mockup và source giao diện. Các thao tác upload, OCR, xuất file, gửi Zalo và dữ liệu seed hiện là mô phỏng UI; tài liệu này **không** xác nhận đã có API, lưu trữ file, phân quyền backend hoặc tích hợp thực tế.

## 2. Kết luận điều hành

Mockup đã mạnh hơn workbook ở lõi quản lý cho thuê: phòng, khách thuê, hợp đồng, hóa đơn, thu tiền, hoàn cọc, bảo trì, CRM, phân quyền vai trò và các luồng phê duyệt. Tuy vậy, workbook đang mô tả một hệ thống điều hành theo **khu nhà/tòa nhà, nhân sự phụ trách, loại nhà và cổ đông**; các trục dữ liệu này chưa được chuẩn hóa xuyên suốt trong mockup.

Các khoảng cách quan trọng nhất trước khi triển khai tiếp:

1. **Mô hình tài sản:** workbook yêu cầu `Khu nhà → Tòa nhà → Phòng`; mockup hiện chủ yếu là `Tòa nhà → Phòng`, còn khu vực là nhãn/địa chỉ. Chưa có thực thể “Khu nhà”.
2. **Trục lọc và phân công dùng chung:** khu vực, trưởng nhóm, quản lý/phụ trách, vận hành, loại nhà `T/S/G`, cổ đông chưa được chuẩn hóa thành các dimension có thể lọc trên dashboard, tài chính và báo cáo.
3. **Tài chính:** hóa đơn, công nợ và hoàn cọc có luồng tốt, nhưng lưới dữ liệu không tuân theo bộ cột workbook; taxonomy chi phí chi tiết và quy tắc tính các loại lợi nhuận còn thiếu.
4. **Báo cáo:** mockup có report hub, nhưng chưa có định nghĩa/formula và phân rã đầy đủ cho lợi nhuận thực tế/dự kiến, dòng tiền, vốn, tài sản, điện-nước và chi phí gốc.
5. **Kinh doanh:** CRM có funnel mạnh hơn yêu cầu nguồn, nhưng thiếu các báo cáo/lưới “doanh thu bán hàng”, “thống kê khách” và “hoa hồng” đúng bộ field cần đối soát.
6. **Tài liệu và pháp lý:** đã có đính kèm theo từng đối tượng, nhưng chưa có phân hệ `Tài liệu` độc lập, tra cứu tập trung và trạng thái hồ sơ pháp lý có cấu trúc.
7. **Cổ đông:** mockup đang lấy `Dự án` làm đơn vị đầu tư, trong khi workbook yêu cầu đối soát theo **tòa nhà**. Cần chốt quan hệ `Dự án ↔ Tòa nhà` trước khi làm dashboard cổ đông.

## 3. Bản đồ truy vết nhanh

| Sheet workbook | Màn hình/nhóm mockup gần nhất | Kết quả |
|---|---|---|
| `menu chính` | Sidebar theo vai trò, launcher `Phân hệ & Quản trị` | Một phần |
| `Tổng quan` | `/dashboard` | Một phần |
| `Khu nhà và toàn nhà` | `/buildings`, `/buildings/:id`, `/landlords` | Một phần |
| `Thông tin khách hàng` | `/tenants`, `/contracts`, `/contracts/ocr` | Một phần |
| `Tài chính chung` | `/invoices`, `/receivables`, `/expenses`, `/refunds`, report hub | Một phần |
| `KINH DOANH` | `/crm`, leads, viewings, holds, deals, commissions | Một phần, có mở rộng |
| `BÁO CÁO` | `/reports`, `/reports/hub`, `/reports/cashflow` | Một phần |
| `NHÂN SỰ` | `/hr`, `/hr/timesheet`, `/hr/payroll` | Một phần, P3 |
| `TT CỔ ĐÔNG` | `/investment/projects`, `/investment/shareholders`, `/investment/roi` | Một phần, P3 |
| `BẢO TRÌ BẢO DƯỠNG` | `/maintenance`, `/maintenance/schedules`, `/assets` | Một phần, phần lớn đã có |

## 4. Điều hướng và phạm vi menu

Workbook đề xuất menu phẳng: Tổng quan, Thông tin tòa nhà, Thông tin KH, Tài chính chung, Kinh doanh, Nhân sự, Tài liệu, Báo cáo, Cổ đông, Bảo trì/Bảo dưỡng.

Mockup hiện dùng sidebar theo vai trò, với các nhóm như `Quản lý cho thuê`, `Kinh doanh`, `Tài chính`, `Vận hành`, `Báo cáo`; đây là cách tổ chức enterprise hợp lý hơn menu nguồn vì giảm mục không liên quan theo từng vai trò.

| Yêu cầu nguồn | Hiện trạng mockup | Chênh lệch/đề nghị |
|---|---|---|
| Thông tin tòa nhà | Có `Tòa nhà`, `Phòng`, `Chủ nhà` trong nhóm Quản lý cho thuê | Đổi tên không phải vấn đề; thiếu cấp `Khu nhà` và loại nhà T/S/G. |
| Thông tin khách hàng | Có `Khách thuê`, `Hợp đồng`, OCR | Phù hợp hơn cách gọi nguồn; cần bổ sung các field điều hành còn thiếu. |
| Tài chính chung | Tách Hóa đơn, Công nợ, Hoàn cọc, Chi phí, Đối soát | Tổ chức tốt hơn workbook; cần thống nhất taxonomy, lưới và báo cáo. |
| Tài liệu | File đính kèm nằm trong tòa nhà/chủ nhà/khách/hợp đồng/nhân sự | **Chưa có** điểm vào `Tài liệu` độc lập, danh sách tập trung, tìm kiếm và phân loại pháp lý. |
| Cổ đông | Chỉ thấy ở role Cổ đông, phase 3 | Đúng nguyên tắc role-based, nhưng chưa đáp ứng đầy đủ báo cáo theo tòa nhà. |
| Bảo trì, bảo dưỡng | Đặt trong `Vận hành` | Phù hợp nghiệp vụ; các lịch thiết bị lõi đã có. |

**Quyết định UX cần chốt:** giữ sidebar theo vai trò như hiện tại; không nên đưa nguyên xi 10 menu workbook vào sidebar. Chỉ cần bảo đảm mỗi nhu cầu nguồn có điểm truy cập khi vai trò được cấp quyền, đặc biệt là `Tài liệu`.

## 5. Đối chiếu chi tiết theo sheet

### 5.1. Tổng quan

Workbook yêu cầu tổng quan có: phòng trống theo ba trạng thái, doanh thu tách ba nguồn, thay biểu đồ doanh thu/công nợ bằng tiến độ thu, và lọc theo khu vực, quản lý, trưởng nhóm.

| Hạng mục/field/action nguồn | Hiện trạng mockup | Trạng thái | Chênh lệch cụ thể |
|---|---|---|---|
| Phòng trống, vào trong tháng | KPI phòng sẵn sàng/đang trống và danh sách việc cần xử lý | Một phần | Cần định nghĩa rõ “vào trong tháng” là phòng sẽ nhận trong tháng hay phòng dự kiến trống; chưa thấy KPI mang tên/quy tắc này. |
| Phòng trống cuối tháng | Có trạng thái phòng và biểu đồ theo tòa | Một phần | Chưa có dự báo tồn trống tại ngày cuối kỳ. |
| Phòng chờ | Có trạng thái giữ chỗ/chờ xử lý trong vận hành/CRM | Một phần | Cần thống nhất “phòng chờ” là giữ chỗ, chờ dọn, hay chờ khách vào; hiện các trạng thái đang tách. |
| Doanh thu thuê | Có hóa đơn, thu tiền, KPI thu | Đã có | Có thể tính từ invoice/payment, nhưng chưa thấy KPI tổng quan tách riêng. |
| Doanh thu cọc mới | Có hợp đồng, đặt cọc và hoàn cọc | Một phần | Chưa có KPI nguồn doanh thu cọc mới ở dashboard. Cần xác nhận cọc là doanh thu hay dòng tiền/nợ phải trả. |
| Doanh thu do vỡ hợp đồng | Có kết thúc hợp đồng/hoàn cọc/điều chỉnh | Một phần | Chưa có loại giao dịch và KPI “vỡ hợp đồng” tách biệt. |
| Tiến độ thu | Có tỷ lệ thu, số đã thu/quá hạn và biểu đồ thu theo tòa | Đã có | Đây là điểm mockup khớp đúng yêu cầu thay biểu đồ cũ. |
| Lọc khu vực, quản lý, trưởng nhóm | Dashboard có thời gian và tòa nhà; mô hình có một số nhân sự phụ trách | Một phần | Thiếu bộ lọc UI và dimension chuẩn cho khu vực, trưởng nhóm; lọc quản lý chưa nhất quán. |

**Action cần bổ sung:** click KPI phải dẫn đến danh sách đã được lọc sẵn; hiện action drill-down chưa được xác nhận cho toàn bộ KPI nguồn.

### 5.2. Khu nhà và tòa nhà

Workbook muốn gộp “khu nhà và tòa nhà” thành một khu quản lý lớn, bao gồm chủ nhà, hợp đồng thuê chủ nhà, pháp lý, mô tả tòa, nhân sự phụ trách, tài sản, hiệu quả/lợi nhuận, thời gian vận hành và lịch trả tiền thuê.

| Hạng mục/field/action nguồn | Hiện trạng mockup | Trạng thái | Chênh lệch cụ thể |
|---|---|---|---|
| Thực thể Khu nhà | Có district/khu vực dạng thuộc tính và tòa nhà | Chưa có | Cần tạo master `Khu nhà` nếu một khu quản lý nhiều tòa, có trưởng nhóm/lead và báo cáo riêng. Không nên dùng địa chỉ tự do thay thế. |
| Tòa nhà, địa chỉ, số tầng, số phòng | Có code, tên, địa chỉ, quận/khu vực, tầng, số phòng, prefix phòng | Đã có | Số phòng đang có thể suy ra từ phòng; cần chốt nguồn dữ liệu chuẩn. |
| Diện tích | Chưa thấy field diện tích tòa nhà chuẩn | Chưa có | Bổ sung diện tích tòa và đơn vị đo. |
| Tình trạng cũ/mới/trung bình | Chưa thấy danh mục tình trạng tòa | Chưa có | Bổ sung enum có kiểm soát, không dùng ghi chú tự do. |
| Trưởng nhóm, vận hành, dọn dẹp, kỹ thuật phụ trách | Có cơ chế gán nhân sự/tòa theo vai trò ở phần HR/P3; overview có người phụ trách | Một phần | Cần hiển thị và hiệu lực theo thời gian ngay trên hồ sơ tòa; thiếu rõ trưởng nhóm và nhân sự dọn dẹp. |
| Tình trạng đăng ký kinh doanh | Có field trạng thái giấy phép kinh doanh | Đã có | Cần bổ sung ngày hết hạn/nhắc việc nếu đây là hồ sơ pháp lý bắt buộc. |
| Thông tin chủ nhà | Có cá nhân/tổ chức, mã số thuế, liên hệ, địa chỉ, ngân hàng, kỳ thanh toán | Đã có | Nên đối chiếu thêm bộ field “như hợp đồng thuê nhà” của nguồn để chốt CCCD/đại diện pháp lý nếu cần. |
| Hợp đồng thuê chủ nhà: giá thuê, cọc, thời gian giữ giá, ngày hết hạn, kỳ trả tiền, ghi chú | Có hồ sơ hợp đồng chủ nhà và lịch thanh toán | Đã có | Cần làm field `nguồn nhập/người nhập` thành audit field hệ thống, không chỉ text tự do. |
| PCCC, ảnh sổ đỏ/chứng từ pháp lý | Có loại tài liệu chung như PCCC, sổ đỏ, hợp đồng | Một phần | Chưa có boolean/trạng thái tuân thủ, ngày hiệu lực/hết hạn, người duyệt và màn hình kiểm soát hồ sơ pháp lý. |
| Danh sách tài sản chủ nhà và tài sản đầu tư | Có tài sản/kiểm kê ở phase 3 | Một phần | Cần trường `quyền sở hữu` (chủ nhà/nhà đầu tư/công ty), liên kết tòa/phòng, và hai danh sách tách rõ trong hồ sơ tòa. |
| Hiệu quả, lợi nhuận tòa | Có thẻ hiệu suất/thu-chi/lợi nhuận vận hành ở P2 report | Một phần | Chưa chốt công thức; không thay thế được báo cáo lợi nhuận workbook. |
| Thời gian vận hành | Chưa thấy field/bộ đếm chuẩn | Chưa có | Cần ngày bắt đầu vận hành và quy tắc tạm dừng/đóng tòa. |
| Lịch trả tiền thuê chủ nhà | Có payment schedule, chứng từ thanh toán | Đã có | Cần đảm bảo lịch này được đưa vào công nợ/chi phí và cảnh báo đến hạn. |

### 5.3. Thông tin khách hàng và hợp đồng

| Hạng mục/field/action nguồn | Hiện trạng mockup | Trạng thái | Chênh lệch cụ thể |
|---|---|---|---|
| Tổng quan: mã phòng + mã tòa | Có liên kết phòng, tòa, hợp đồng | Đã có | Cần chuẩn hóa cách render thành một mã ghép trong list/heading theo đúng quy ước nguồn. |
| Trưởng khu, nhân viên vận hành | Có người phụ trách tòa và phân công nhân sự ở mức khác | Một phần | Chưa hiển thị ổn định ở tổng quan khách; cần lấy theo assignment hiệu lực của tòa/phòng. |
| Công nợ, liên kết Zalo | Có công nợ, nhắc/Zalo và lịch sử gửi | Đã có | Cần xác định trạng thái “đã liên kết Zalo” từ dữ liệu thật, không chỉ lịch sử gửi. |
| Trạng thái thuê/đứt hợp đồng/sắp hết hạn trước 35 ngày/hoàn cọc | Có trạng thái hợp đồng, cảnh báo 35 ngày, kết thúc và hoàn cọc | Đã có | Nên chốt enum chung để không lẫn trạng thái khách, hợp đồng, phòng và hoàn tiền. |
| Tiêu đề chi tiết là mã phòng + mã tòa | Chi tiết hiện thiên về hồ sơ khách/mã khách | Một phần | Nếu nguồn là quy ước vận hành, bổ sung subtitle hoặc heading chuẩn `Mã tòa – Mã phòng`; không nên mất tên khách. |
| Ngày bắt đầu/kết thúc, thời hạn, hợp đồng đầu/gia hạn | Có wizard và chi tiết hợp đồng | Đã có | Cần expose rõ `loại kỳ hợp đồng: đầu tiên/gia hạn` trong list/detail. |
| Nghề nghiệp | Có field nghề nghiệp trong hồ sơ khách | Đã có | Cần đưa vào tiêu chí báo cáo phân khúc nếu cần. |
| Phương tiện và biển số | Có khu vực dịch vụ/phương tiện trong hợp đồng | Một phần | Chưa xác nhận một field biển số có cấu trúc và có thể tìm kiếm; cần chốt `loại xe`, `biển số`, `số lượng`, hiệu lực. |
| Upload hợp đồng và tự cập nhật giá dịch vụ theo hợp đồng | Có upload tài liệu, OCR hợp đồng (P2), dịch vụ mặc định/snapshot trên hợp đồng | Một phần | OCR hiện là luồng trích xuất/review; cần mapping được phê duyệt từ field OCR sang từng giá dịch vụ và audit ai xác nhận. |
| Điện, nước, Internet, thang máy, dịch vụ chung, sạc xe điện, gửi xe | Có cấu hình dịch vụ và dịch vụ hợp đồng | Một phần | Cần đối chiếu danh mục để đủ 7 loại, đơn vị tính/cách tính/thuế/hiệu lực; không dùng tên text tự do. |
| Ghi chú thủ công | Có note | Đã có | Nên phân biệt ghi chú nội bộ với điều khoản hợp đồng nếu có phân quyền. |
| “Danh sách khách hoà gồm mã phòng mã tòa” | Câu nguồn không rõ | Cần làm rõ | Cần xác nhận có phải “khách hỏa”, “khách ở”, hay một loại danh sách/đối soát tài chính. |

### 5.4. Tài chính chung

#### A. Hóa đơn và công nợ

| Field/action nguồn | Hiện trạng mockup | Trạng thái | Chênh lệch cụ thể |
|---|---|---|---|
| Lập/xem/điều chỉnh/hủy hóa đơn | Có danh sách, batch, chi tiết và action hóa đơn | Đã có | Luồng UI có độ sâu tốt hơn workbook. |
| Mã phòng + mã tòa, người quản lý | Có liên kết phòng/tòa/hợp đồng/khách | Một phần | Cần một cột mã ghép cố định và field manager theo assignment tại thời điểm hóa đơn. |
| Cọc, giá niêm yết, giá cho thuê | Có ở hợp đồng và các màn hình liên quan | Một phần | Không phải tất cả là cột trực tiếp trong lưới hóa đơn; nếu workbook yêu cầu đối soát nhanh, phải bổ sung/cấu hình cột. |
| Số tháng đã thanh toán | Có payment/receivable và phân bổ thanh toán | Một phần | Chưa thấy chỉ số tích lũy tháng đã đóng trong invoice grid; cần định nghĩa trả trước/trả thiếu xử lý thế nào. |
| Tổng phải thu, tổng đã thu, công nợ | Có | Đã có | Cần đảm bảo công thức và thời điểm chốt thống nhất. |
| Ngày thanh toán, ngày đến hạn, trạng thái | Có | Đã có | Có thể tồn tại nhiều payment cho một hóa đơn; cần xác định hiển thị “ngày thanh toán” là lần đầu, lần cuối hay ngày hoàn tất. |
| Filter: quản lý, trưởng khu, tòa, loại nhà T/S/G, trạng thái, hạn thanh toán | Có lọc thời gian/tòa/trạng thái ở các màn hình tài chính | Một phần | Thiếu/không nhất quán manager, trưởng khu và loại nhà T/S/G. |
| Công nợ không hiển thị tên khách, dùng mã phòng + mã tòa | Có công nợ và action thu/nhắc | Một phần | Cần áp quy ước hiển thị cho lưới công nợ; không chỉ ẩn tên mà vẫn phải drill-down được tới khách/hợp đồng theo quyền. |
| Thu tiền một phần, phân bổ, đảo/điều chỉnh, nhắc Zalo | Có các action này | Mở rộng | Là năng lực hữu ích nhưng cần audit log backend khi triển khai thật. |

#### B. Chi phí và danh mục chi phí

Workbook yêu cầu taxonomy có kiểm soát rất chi tiết: thuê nhà, mua thiết bị; điện/nước/network/rác/môi trường/bảo trì thang máy; lương theo từng chức danh; marketing; sửa chữa/thay thế/bảo trì; chi khác.

| Hạng mục nguồn | Hiện trạng mockup | Trạng thái | Chênh lệch cụ thể |
|---|---|---|---|
| Nhập, sửa, phân bổ chi phí theo tòa | Có phiếu chi, tòa/phân bổ, chứng từ | Đã có | Cần bảo đảm một phiếu hỗ trợ nhiều tòa/kỳ nếu nghiệp vụ yêu cầu. |
| Danh mục chi phí vốn | Có nhóm chi phí chung | Một phần | Chưa thấy mã/danh mục bắt buộc cho `thuê nhà`, `mua sắm thiết bị`. |
| Chi phí dịch vụ gốc | Có nhóm chi phí nhưng không thấy đầy đủ taxonomy bắt buộc | Một phần | Bổ sung điện, nước, mạng, rác, môi trường, bảo trì thang máy thành mã chi phí chuẩn. |
| Chi phí vận hành/lương theo chức danh | Có HR/payroll và chi phí | Một phần | Cần mapping payroll/expense theo phòng ban/chức danh: quản lý, trưởng vận hành, phó vận hành, nguồn, sales, tạp vụ, kế toán, sửa chữa, bảo vệ, văn phòng. |
| Chi phí sự cố kinh doanh | Có chi phí và bảo trì/sự cố | Một phần | Phân biệt marketing với sửa chữa/thay thế/bảo trì và chi khác bằng taxonomy; hiện không đủ bằng chứng là các nhóm bắt buộc. |
| “Báo cáo kinh doanh của nhà – hỏi Ngọc” | Chưa có yêu cầu hoàn chỉnh | Cần làm rõ | Không thể thiết kế/ước lượng cho tới khi có owner, input, output và công thức. |

#### C. Hoàn cọc và báo cáo tài chính

| Hạng mục/field/action nguồn | Hiện trạng mockup | Trạng thái | Chênh lệch cụ thể |
|---|---|---|---|
| Danh sách hoàn cọc, tạo/duyệt/chi trả | Có luồng draft → duyệt → chi trả, bằng chứng | Đã có | Mockup tốt hơn nguồn về control flow. |
| Mã phòng + mã tòa, tiền hoàn, tiền cọc | Có liên kết đối tượng và tính toán | Một phần | Cần hiển thị theo bộ cột nguồn trong lưới/export. |
| Khấu trừ: hao mòn, sửa chữa, dọn dẹp, chi khác | Có các khoản khấu trừ | Một phần | Cần mã chuẩn 4 nhóm này và cột tổng theo nhóm; tránh dùng description tự do. |
| Filter ngày/tòa/trưởng khu/vận hành/trưởng nhóm | Có filter cơ bản theo thời gian/tòa | Một phần | Thiếu các dimension nhân sự/nhóm chuẩn. |
| Báo cáo thu-chi điện nước tổng và từng tòa | Có report vận hành/finance ở mức tổng hợp | Một phần | Cần sổ utility riêng: sản lượng/chỉ số, doanh thu, chi phí, chênh lệch, kỳ, tòa. |
| Danh sách chi tiết từng hạng mục/tòa | Có report hub | Một phần | Chưa chứng minh lưới drill-down từ report về chứng từ chi tiết. |
| Thu-chi toàn hệ thống và từng tòa | Có cashflow/operating result | Một phần | Thiếu định nghĩa nguồn dữ liệu, công thức và phạm vi loại trừ. |

### 5.5. Kinh doanh

Mockup CRM (lead, lịch xem, giữ chỗ, deal, hoa hồng) là phạm vi rộng hơn workbook. Khoảng trống nằm ở các **sổ đối soát và field báo cáo** mà workbook nêu rõ.

| Hạng mục/field/action nguồn | Hiện trạng mockup | Trạng thái | Chênh lệch cụ thể |
|---|---|---|---|
| Tổng quan sản phẩm lọc khu vực/trưởng sale/sale | Có KPI CRM và hiệu suất sale | Một phần | Cần bổ sung filter khu vực, trưởng sale và quy tắc scope dữ liệu. |
| Số phòng chốt/nhận/tạo do hoàn hoặc đứt hợp đồng | Có trạng thái deal/hold/hợp đồng | Một phần | Chưa có bộ KPI chuẩn với các định nghĩa này; cần phân biệt “nhận phòng” với “chốt deal”. |
| Bảng doanh thu: ngày giao dịch, phòng+tòa, quản lý, điện thoại, cọc, giá chốt, ngày thu, thời hạn HĐ, nguồn, đủ/thiếu tiền, sale, hoa hồng, trạng thái nhận phòng, ghi chú | Có deal/lead/commission rải ở nhiều màn hình | Một phần | Cần một view `Sổ doanh số` hoặc report configurable gộp toàn bộ field nguồn, có export; hiện không phải một bảng đối soát duy nhất. |
| Thống kê khách: sale, tòa/phòng, nguồn nội bộ/đối tác, đã xem/đã chốt, khu vực, điện thoại, ngày bàn giao lead | Có lead/viewing/funnel | Một phần | Thiếu báo cáo danh sách chuẩn, đặc biệt ngày bàn giao lead và phân loại nguồn nội bộ/đối tác. |
| Hoa hồng: phòng+tòa, giá chốt, thời hạn, tỷ lệ, tiền hoa hồng, tổng đã thu, team sale, trả/chưa trả | Có quản lý hoa hồng | Một phần | Cần thêm `sales team`, tổng đã thu và liên kết quy tắc hoa hồng với collection/payment. |
| Danh sách nhân sự sales: chức danh, thâm niên, doanh số cá nhân theo thời gian | HR có hồ sơ/thâm niên; CRM có KPI sale | Một phần | Cần view nối HR + CRM, theo kỳ và theo quyền quản lý sales. |
| Lead funnel, lịch xem, giữ chỗ, lịch sử chăm sóc | Có | Mở rộng | Giữ lại; đây là tiền đề tốt để tạo các báo cáo workbook thay vì bỏ đi. |

### 5.6. Báo cáo

| Nhóm báo cáo nguồn | Hiện trạng mockup | Trạng thái | Chênh lệch cụ thể |
|---|---|---|---|
| Hiệu quả kinh doanh thực tế và dự kiến | Có operating result/cashflow/report hub | Một phần | Cần định nghĩa đồng thời hai loại lợi nhuận và danh mục giao dịch được tính/loại trừ. |
| Tổng doanh thu, lợi nhuận/dòng tiền thực tế | Có KPI và báo cáo tổng hợp | Một phần | Workbook nói lợi nhuận thực tế bao gồm cọc mới và mua thiết bị; đây là quy tắc bất thường cần xác nhận kế toán trước khi đưa vào UI. |
| Lợi nhuận kinh doanh thực tế không gồm cọc mới/hoàn cọc/mua thiết bị | Chưa thấy bộ chỉ số riêng | Chưa có | Cần report và tooltip/formula rõ ràng. |
| Dòng tiền/lợi nhuận kinh doanh dự kiến | Có báo cáo nhưng chưa đủ bằng chứng công thức forecast | Một phần | Cần forecast engine/data input: kỳ hợp đồng, lịch thu, lịch chi, công suất dự kiến. |
| Lợi nhuận/vốn, lợi nhuận/tài sản | Có ROI P3 | Một phần | ROI hiện project-centric; cần chốt denominator, thời điểm và đơn vị tòa/dự án. |
| Biên tiền thuê = doanh thu thuê / chi phí thuê | Chưa thấy chỉ số chuyên biệt | Chưa có | Bổ sung metric và hiển thị tỷ lệ/số tiền theo kỳ. |
| Chi phí gốc, chi phí cố định, chi phí phát sinh | Có expense/report hub | Một phần | Phụ thuộc GAP taxonomy chi phí; không có taxonomy sẽ không lọc/tổng hợp đúng. |
| Vận hành: lấp đầy/thời gian trống | Có occupancy và trạng thái phòng | Một phần | Cần đo thời gian trống bằng mốc thời gian thực, không chỉ số phòng hiện tại. |
| Chênh lệch điện/nước | Chưa có utility ledger/report đầy đủ | Chưa có | Cần dữ liệu chỉ số đầu-cuối, đơn giá, hóa đơn nhà cung cấp và hóa đơn khách. |
| Chi phí sửa chữa/dọn dẹp | Có maintenance và chi phí | Một phần | Cần tag/roll-up riêng và báo cáo drill-down. |
| Tệp khách sinh viên/người đi làm | Có nghề nghiệp/segment và report segment | Một phần | Cần chuẩn hóa enum segment và quy tắc suy ra từ nghề nghiệp. |
| Tỷ lệ đúng hạn/trễ hạn | Có công nợ/quá hạn | Một phần | Chưa có metric rõ numerator/denominator, trường hợp trả một phần/trả trước. |
| Báo cáo sale: chuyển đổi xem/chốt, doanh số | Có funnel/performance | Một phần | Cần bổ sung bảng đối soát doanh số theo mục 5.5. |
| Filter báo cáo: thời gian, tòa, khu vực, vận hành, trưởng nhóm, loại nhà, cổ đông, sales/team sales | Có một phần filter thời gian/tòa | Một phần | Thiếu dimension chuẩn và RLS tương ứng; không nên làm từng report một bộ filter khác nhau. |

### 5.7. Nhân sự

| Hạng mục/field/action nguồn | Hiện trạng mockup | Trạng thái | Chênh lệch cụ thể |
|---|---|---|---|
| Thông tin cá nhân, phòng ban, chức danh, thâm niên, trạng thái | Có hồ sơ nhân viên | Đã có | Thâm niên có thể suy ra từ ngày bắt đầu; cần thống nhất hiển thị. |
| Nhân sự vận hành quản lý bao nhiêu tòa/phòng | Có phân công nhân sự vào tòa | Một phần | Cần KPI/count hiển thị trực tiếp ở hồ sơ và đảm bảo phân công có hiệu lực theo ngày. |
| Chấm công | Có | Đã có | Cần quy định nguồn dữ liệu/chốt kỳ khi triển khai backend. |
| Tính lương business, vận hành, kỹ thuật, thị trường, tài chính-kế toán | Có payroll P3 và một số thành phần lương | Một phần | Cần master phòng ban/chức danh đúng taxonomy nguồn, công thức lương/hoa hồng/khấu trừ và phê duyệt kỳ lương. |
| Ghi nhận chi phí lương trong tài chính | Có liên hệ payroll/expense ở mức mockup | Một phần | Cần mapping mã chi phí để báo cáo tài chính không nhập trùng. |

### 5.8. Thông tin cổ đông

| Hạng mục/field/action nguồn | Hiện trạng mockup | Trạng thái | Chênh lệch cụ thể |
|---|---|---|---|
| Danh sách cổ đông, thông tin định danh/liên hệ | Có | Đã có | Cần kiểm tra quy định bảo mật CCCD theo role. |
| Tỷ lệ vốn góp theo tòa | Có tỷ lệ cam kết theo dự án | Một phần | Cần mapping chính thức `Dự án` có phải một tòa hay chứa nhiều tòa; nếu nhiều tòa, cần bảng allocation theo tòa. |
| Sổ phân phối theo tòa | Có phân phối lợi nhuận theo dự án | Một phần | Thiếu ledger theo tòa và drill-down nguồn lợi nhuận/kỳ. |
| Lịch thanh toán theo từng người | Có contribution/distribution schedule và payment | Đã có | Nên hỗ trợ lọc người + tòa/kỳ theo nguồn. |
| Tổng tài sản và tổng tiền cọc | Có ROI/tổng quan đầu tư | Một phần | Chưa có danh sách/metric asset và deposit summary theo cổ đông/tòa. |
| Filter tòa nhà/thời gian | Có filter theo dự án/kỳ ở một số màn hình | Một phần | Thiếu dimension tòa nhà nếu project không đồng nghĩa building. |

### 5.9. Bảo trì, bảo dưỡng và kiểm kê

| Hạng mục/field/action nguồn | Hiện trạng mockup | Trạng thái | Chênh lệch cụ thể |
|---|---|---|---|
| Lịch thang máy | Có equipment template và lịch bảo trì | Đã có | Cần chốt checklist/chu kỳ/nhà cung cấp. |
| Lịch máy bơm | Có | Đã có | Tương tự. |
| Lịch máy giặt chung | Có | Đã có | Tương tự. |
| Lịch máy lọc nước | Có | Đã có | Tương tự. |
| Sự cố, phân công, bắt đầu/hoàn thành, ảnh và chi phí | Có | Mở rộng | Nên giữ; tốt hơn yêu cầu nguồn. |
| Kiểm kê tài sản trang trí/decor | Có tài sản, QR, kiểm kê, danh mục nội thất gần nhất | Một phần | Cần bổ sung category `Trang trí/Decor` hoặc mapping rõ, cùng người sở hữu và vị trí tòa/phòng. |

## 6. Field và dimension dùng chung cần chuẩn hóa

Đây là phần quan trọng nhất để tránh mỗi màn hình đặt một tên hoặc một filter khác nhau.

| Dimension/master data | Workbook yêu cầu | Mockup hiện tại | Quyết định cần có |
|---|---|---|---|
| Khu nhà | Có trong lọc và vận hành | Chưa là thực thể | Có/không tạo entity `Khu nhà`; nếu không, đổi thuật ngữ nguồn thành `Khu vực` và xác định source master. |
| Tòa nhà | Cấp chính của nghiệp vụ | Có | Thêm diện tích, tình trạng, ngày vận hành, loại nhà, các assignment hiệu lực. |
| Loại nhà T/S/G | Có ở tài chính/báo cáo | Chưa thấy chuẩn hóa | Định nghĩa chữ viết tắt, enum và quyền sửa. |
| Trưởng khu/trưởng nhóm/quản lý | Dùng nhiều nơi | Có các vai trò/assignment phân tán | Chốt taxonomy: ai là area lead, team lead, manager; một người có thể kiêm nhiệm không; effective date. |
| Vận hành, kỹ thuật, dọn dẹp | Liên quan tòa và báo cáo | Có assignment một phần | Chuẩn hóa role-to-building assignment, tránh copy tên text vào chứng từ. |
| Cổ đông | Dùng ở report filter | Có theo dự án | Quy tắc map tới tòa và kỳ phân phối. |
| Trạng thái phòng | Trống, nhận trong tháng, trống cuối tháng, chờ | Có nhiều trạng thái room/hold/cleaning | Lập state machine; không dùng một label cho nhiều nghĩa. |
| Trạng thái khách/hợp đồng | Thuê, đứt, sắp hết hạn, hoàn cọc | Có | Chọn nguồn sự thật: hợp đồng/hoàn cọc, sau đó suy diễn status khách. |
| Loại chi phí | Rất chi tiết | Có nhóm chi phí tổng quát | Tạo `expense_category` có mã, nhóm cha, báo cáo map, hiệu lực. |
| Dịch vụ | 7 loại cụ thể | Có catalog/hợp đồng dịch vụ | Chốt enum, đơn vị tính, phương thức tính, VAT, giá và effective date. |

## 7. Đối chiếu action/luồng nghiệp vụ

| Luồng | Mockup | Chênh lệch để nghiệm thu |
|---|---|---|
| Tạo và gia hạn hợp đồng | Có wizard, chi tiết, service snapshot | Cần tự động/được duyệt update giá dịch vụ từ PDF OCR; cần rule chuyển trạng thái phòng. |
| Upload tài liệu pháp lý | Có upload giả lập theo đối tượng | Cần kho file thật, loại tài liệu, version, hết hạn, review/approval, tra cứu toàn hệ thống. |
| Lập hóa đơn hàng loạt | Có | Cần đảm bảo cột/export/filter đúng bộ đối soát workbook. |
| Thu tiền, thu thiếu, phân bổ | Có | Cần chốt cách tính ngày trả, số tháng đã trả, đúng hạn/trễ hạn. |
| Hoàn cọc | Có luồng duyệt/chi | Cần taxonomy khấu trừ và lưới/export đúng 4 nhóm chi phí nguồn. |
| Nhập chi phí | Có | Cần taxonomy chi phí, approval, kỳ hạch toán, allocation và báo cáo map. |
| Xử lý sự cố/bảo trì | Có workflow khá đầy đủ | Cần mapping chi phí sự cố vào taxonomy tài chính. |
| CRM/chốt sale/hoa hồng | Có CRM đầy đủ | Cần sổ doanh số, sổ khách và sổ hoa hồng chuẩn đối soát; rule commission khi khách trả thiếu/hoàn cọc/hủy. |
| Chấm công/tính lương | Có P3 | Cần công thức, kỳ khóa sổ và mapping payroll → chi phí. |
| Góp vốn/phân phối | Có P3 | Cần quy về tòa nhà nếu workbook là đơn vị quản trị. |

## 8. Backlog chênh lệch đề nghị xử lý

| ID | Ưu tiên | Chênh lệch | Kết quả cần có trước/sau implement |
|---|---|---|---|
| GAP-01 | P0 | Chưa có Khu nhà và mô hình quan hệ khu–tòa–phòng | Quyết định data model, migration/mock data, navigation và quyền theo khu/tòa. |
| GAP-02 | P0 | Không có dimension/filter chuẩn cho khu vực, trưởng nhóm, quản lý, loại nhà, cổ đông | Shared filter schema + assignment effective-dated + RLS policy. |
| GAP-03 | P0 | Taxonomy chi phí chưa đáp ứng danh sách chi tiết nguồn | Danh mục mã chi phí, nhóm cha, mapping payroll/maintenance, report mapping. |
| GAP-04 | P0 | Công thức báo cáo lợi nhuận/dòng tiền nguồn chưa xác định | Data dictionary và công thức được Finance ký duyệt, kèm test cases. |
| GAP-05 | P1 | Dashboard chưa đủ 3 KPI phòng trống và 3 nguồn doanh thu | Định nghĩa metric, kỳ tính, drill-down và trạng thái ngoại lệ. |
| GAP-06 | P1 | Lưới hóa đơn/công nợ/hoàn cọc thiếu bộ cột và filter đối soát | Column preset “Đối soát vận hành”, export đúng field, quy tắc hiển thị mã phòng–tòa. |
| GAP-07 | P1 | Chưa có phân hệ Tài liệu tập trung và compliance pháp lý | Document center, metadata/version/expiry, cross-search, permission matrix. |
| GAP-08 | P1 | CRM thiếu 3 sổ chuẩn: doanh số, khách, hoa hồng | Report/list với field nguồn, filter, export và linked records. |
| GAP-09 | P1 | Đầu tư/cổ đông theo dự án nhưng nguồn yêu cầu theo tòa | Mapping project-building, equity allocation, distribution/asset/deposit ledger. |
| GAP-10 | P2 | Asset inventory chưa phân loại decor rõ | Master asset category + ownership/location/status. |
| GAP-11 | P0 | Một số yêu cầu nguồn mơ hồ | Làm rõ “khách hoà”, “báo cáo kinh doanh của nhà”, ý nghĩa T/S/G, quy tắc cọc. |

## 9. Các câu hỏi phải được trả lời trước khi chốt scope

1. `Khu nhà` khác gì `Khu vực`? Một khu nhà có thể có bao nhiêu tòa, và ai là owner của dữ liệu khu nhà?
2. `T/S/G` là viết tắt của những loại nhà nào? Có một tòa mang nhiều loại không?
3. “Quản lý”, “trưởng khu”, “trưởng nhóm”, “vận hành” khác nhau thế nào; role nào xem/sửa dữ liệu tòa, hóa đơn, hoàn cọc?
4. Cọc mới được coi là doanh thu, dòng tiền, hay khoản phải trả? Tại sao lợi nhuận thực tế được nêu là bao gồm cọc mới và mua thiết bị? Finance cần phê duyệt công thức này.
5. Ba trạng thái “phòng trống vào trong tháng”, “phòng trống cuối tháng”, “phòng chờ” được tính từ các mốc nào?
6. “Ngày thanh toán” ở hóa đơn là ngày nào nếu có nhiều lần trả; “số tháng đã thanh toán” tính cho trả trước/trả thiếu ra sao?
7. Có cần độc lập một menu `Tài liệu`, hay chỉ cần tìm kiếm tài liệu tập trung từ launcher? Ai được xem sổ đỏ, CCCD, hợp đồng?
8. `Dự án` và `Tòa nhà` có quan hệ một-một hay một-nhiều? Cổ đông có thể góp vốn trực tiếp vào tòa không?
9. Cụm “danh sách khách hoà gồm mã phòng mã tòa” có nghĩa chính xác là gì?
10. “Báo cáo kinh doanh của nhà – hỏi Ngọc” cần người chịu trách nhiệm cung cấp input, output mẫu và công thức nào?

## 10. Tiêu chí nghiệm thu tối thiểu sau khi xử lý các gap P0/P1

1. Người dùng có thể lọc cùng một bộ dữ liệu theo kỳ, khu vực/khu nhà, tòa, loại nhà, nhân sự phụ trách và cổ đông ở các dashboard/report được cấp quyền.
2. Bất kỳ record tài chính nào cũng truy ra được tòa, phòng (nếu có), hợp đồng/khách liên quan, category chi phí/doanh thu, kỳ hạch toán và audit trail.
3. Hóa đơn, công nợ, hoàn cọc và ba sổ Kinh doanh có preset cột/export đúng workbook, đồng thời vẫn giữ được UI gọn với chế độ xem mặc định.
4. Report hiển thị công thức, phạm vi tính, ngày chốt số liệu và drill-down về chứng từ; không dùng số liệu tổng hợp không giải thích được.
5. Hồ sơ tòa có legal documents có cấu trúc, assignment nhân sự hiệu lực theo ngày, tài sản theo quyền sở hữu và lịch thanh toán thuê chủ nhà.
6. Những yêu cầu `Cần làm rõ` ở mục 9 được chuyển thành quyết định có owner trước khi implement logic/report liên quan.

## 11. Phạm vi mockup hiện đang mở rộng hơn workbook

Các mục này không phải chênh lệch cần loại bỏ; chúng nên được giữ nếu được xác nhận trong roadmap: RBAC theo vai trò; phân công/todo; OCR review hợp đồng; import sao kê, số dư đầu kỳ và jobs; phân bổ/đảo giao dịch thu; gửi Zalo hàng loạt và lịch sử; lead funnel, lịch xem/giữ chỗ; workflow sự cố; QR/kiểm kê tài sản; chấm công, payroll; contribution và distribution cho đầu tư.

## 12. Nguồn kiểm tra trong mockup

- Điều hướng và menu theo role: `mockup/js/ui/layout.js`, `mockup/js/core/auth.js`.
- Tổng quan: `mockup/js/pages/dashboard.js`.
- Tòa nhà/chủ nhà/phòng: `mockup/js/pages/buildings.js`, `mockup/js/pages/landlords.js`, `mockup/js/pages/rooms.js`.
- Khách thuê/hợp đồng/OCR: `mockup/js/pages/tenants.js`, `mockup/js/pages/contracts.js`, `mockup/js/pages/ocr.js`.
- Tài chính: `mockup/js/pages/invoices.js`, `receivables.js`, `expenses.js`, `refunds.js`, `finance2.js`, `bank.js`.
- Kinh doanh: `mockup/js/pages/crm.js`.
- Báo cáo: `mockup/js/pages/reports.js`, `mockup/js/pages/reportHub.js`.
- Nhân sự/đầu tư/tài sản/bảo trì: `mockup/js/pages/hr.js`, `investment.js`, `assets.js`, `maintenance.js`.

**Kết luận cuối:** không nên implement từng field workbook rời rạc vào UI hiện tại. Hãy chốt trước GAP-01 đến GAP-04 như lớp dữ liệu và công thức dùng chung; sau đó làm preset lưới/report theo workbook. Cách này giữ được mockup gọn theo chuẩn enterprise, đồng thời bảo đảm số liệu đối soát đúng nghiệp vụ.

## 13. Kết quả xử lý ngày 16/09/2026

Plan Workbook Alignment v2.3 đã được triển khai ở mức mockup tương tác. Trạng thái “Đã xử lý” dưới đây có nghĩa là đã có data model/selector/UI demo và qua kiểm tra cú pháp; các công thức mang nhãn `Giả định` vẫn cần owner nghiệp vụ ký trước khi dùng ở production.

| GAP | Trạng thái mockup | Kết quả / route kiểm tra | Điểm còn chờ |
|---|---|---|---|
| GAP-01 | Đã xử lý | `areas`, `buildings.areaId`; `#/settings/catalog?tab=areas`; filter Khu nhà | PO xác nhận cách nhóm quận vào khu |
| GAP-02 | Đã xử lý | `Q.scope`, T/S/G, assignment effective-dated; `#/buildings`, tab Nhân sự phụ trách; tab Tài sản tách Tài sản chủ nhà / Tài sản đầu tư theo `ownership` (mục 5.2) | Xác nhận nghĩa T/S/G và rule kiêm nhiệm |
| GAP-03 | Đã xử lý | Taxonomy GV/DV/VH/BH hai cấp; `#/settings/catalog?tab=groups`, `#/expenses` | Finance duyệt mã chi phí chính thức |
| GAP-04 | Đã xử lý có điều kiện | `TH.metrics`; nhóm báo cáo Workbook tại `#/reports/hub` | Ngọc/Kế toán duyệt các metric `assumed` |
| GAP-05 | Đã xử lý | Dashboard có ba trạng thái trống và ba khoản thu; drill-down `#/rooms?vac=...` | Ops xác nhận state mapping |
| GAP-06 | Đã xử lý | Preset Đối soát + export cột hiện hành tại hóa đơn, công nợ, hoàn cọc, chi phí; bộ lọc Khu nhà / Loại nhà / Quản lý / Trưởng nhóm / Vận hành trong "Bộ lọc khác" của 4 lưới (`U.dimMore`) | UAT file CSV với mẫu thật |
| GAP-07 | Đã xử lý ở mockup | Trung tâm `#/documents`, expiry/status và checklist pháp lý tại hồ sơ tòa | Kho file/version/approval thật thuộc backend |
| GAP-08 | Đã xử lý ở report | `wb-sales-ledger`, `wb-customer-ledger`, `wb-commission-ledger`, `wb-sales-staff` | UAT đối chiếu dữ liệu CRM thực |
| GAP-09 | Đã xử lý ở report | `#/reports/r/wb-shareholder-assets`, mapping project → building | Xác nhận quan hệ 1–1 và công thức phân phối |
| GAP-10 | Ngoài phạm vi | Không thay đổi theo quyết định plan | Backlog P2 |
| GAP-11 | Đã lập quyết định | `TimeHouse-Workbook-Alignment-Decisions-v1.0.md`; chip Giả định trong UI | 10 owner sign-off còn mở |

### 13.1. Thành phần đã thêm

- Lớp seed/migration additive: `seed-wb.js`.
- Dimension và ledger dùng chung: `selectors-wb.js`.
- Metric registry và công thức truy vết: `metrics.js`.
- Bộ lọc chiều, nhãn giả định, metric info và room reference: `components-wb.js`.
- Trung tâm Tài liệu: `pages/documents.js`.
- Preset bảng và export theo cột hiển thị: mở rộng `ui/table.js`.

### 13.2. Điều kiện trước production

1. Ký 10 quyết định trong Decision Pack, đặc biệt công thức lợi nhuận/cọc và nghĩa T/S/G.
2. Thay mock seed bằng migration có backup, dry-run và rollback.
3. Thiết kế RLS backend cho tài liệu nhạy cảm, nhân sự và cổ đông.
4. Đối chiếu ít nhất một kỳ dữ liệu thật cho từng sổ/báo cáo; dung sai tổng tiền phải bằng 0.
5. Chạy UAT theo vai trò và lưu evidence trước khi đánh dấu các metric `assumed` thành `approved`.
