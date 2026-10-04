# Đối chiếu audit ngày 04/10/2026 với bản live và các lần sửa trước

Nguồn đánh giá: `docs/TimoHouse_Live_Audit_vs_Source_Workbook_2026-10-04.md` và workbook `nội dung làm web Timehouse 31.8.2026(2).xlsx` (đọc trực tiếp 10 sheet).

## Kết luận

Không có bằng chứng cho thấy toàn bộ các lỗi cũ tái xuất hiện. Audit mới trộn bốn trạng thái khác nhau: chức năng đã có nhưng chưa được người audit kiểm chứng; trường đã có nhưng dữ liệu nguồn còn thiếu; logic đã có trong mockup nhưng chưa nghiệm thu toàn bộ nghiệp vụ; yêu cầu vận hành production chưa được frontend mockup đáp ứng.

Các ma trận trước ghi “Đã đóng” ở một số nhóm quá rộng. Regression chạy thành công chỉ chứng minh các kịch bản được kiểm tra, không chứng minh mọi trường của workbook đều đã có dữ liệu hoặc hệ thống đã sẵn sàng production. Ngược lại, “chưa đủ bằng chứng” trong audit mới cũng chưa phải một lỗi FAIL có thể tái hiện.

## Phiên bản và bằng chứng

- Live: https://timohousev2.netlify.app/.
- `/build.json`: SHA `fe7925b`, version `4.0.0`, build lúc `2026-10-04T09:01:41.493Z` (16:01:41 giờ Bangkok).
- 10 file JS trọng yếu lấy trực tiếp từ live khớp workspace sau khi chuẩn hóa CRLF/LF: dashboard, buildings, sales, maintenance, act-documents, act-payroll, q, store, layout, seed. Không dùng SHA để suy luận thay cho đối chiếu nội dung file.
- 18 lượt kiểm tra route/tab bằng Chrome, context mới, tài khoản demo `admin`, Phase 3; ngày dữ liệu demo là **29/09/2026**, khác ngày audit. Không thay đổi bản ghi nghiệp vụ trên live.
- JSON, route thực, tab được chọn, nội dung màn hình và kết quả so sánh file: `output/audit-reconciliation-2026-10-04/live.json`; ảnh nằm cùng thư mục. Đây là bằng chứng quan sát UI, không phải nghiệm thu toàn bộ nghiệp vụ.
- Chạy lại 4 file test: `source-workbook-live`, `workbook-content`, `v5-gaps`, `ui-audit-v4`: **14/14 PASS**. Kết quả này thuộc local/service, không phải test backend production.

## Đối chiếu từng nhóm

| Nhóm trong audit mới | Nguồn / route thực | Quan sát và kết luận |
|---|---|---|
| Dashboard cần xác nhận 3 bucket và breakdown doanh thu | `Tổng quan!A1:A4`; `#/dashboard` | Có Trống ở luôn **6**, Trống cuối tháng **1**, Đang chờ **26**; doanh thu tiền phòng **5.497.990.699**, cọc mới **835.200.000**, phá HĐ **16.048.000**. Có mốc 5/10/15 và filter quản lý/leader/khu vực. UI hiện diện; không suy ra mọi công thức đã nghiệm thu chỉ từ việc nhìn thấy số. |
| Pháp lý và nhân sự tòa nhà | `Khu nhà và toàn nhà!D11:D12`; `#/buildings/b_G1?tab=phap-ly`, `?tab=nhan-su` | Có hồ sơ pháp lý theo phiên và tab nhân sự theo thời gian. **G1 có 0 hồ sơ pháp lý hiện hành**, nhân sự G1 quan sát được là nhân viên vận hành và leader; chưa chứng minh mỗi tòa đều có đủ tên vệ sinh/kỹ thuật. Không đóng yêu cầu đủ dữ liệu bằng việc có bảng chung. |
| Hồ sơ chủ nhà, giữ giá, nguồn, PCCC, sổ đỏ, phiên HĐ | `Khu nhà và toàn nhà!D3:D5`; `#/owners/oc_G1` | Có Giữ giá đến, Điều khoản/nguồn, file PCCC/sổ đỏ và bảng snapshot phiên HĐ. Nhưng G1 thiếu ngày giữ giá, bên khai thác, điều khoản, ĐKKD/PCCC và ghi chú. Danh mục file có HĐ và sổ đỏ; quan sát danh mục chưa chứng minh tải được file thật hoặc hồ sơ pháp lý đầy đủ. |
| Khách: xe, biển số, tạm trú, gia hạn | `Thông tin khách hàng!G7`; `#/stays/:id?tab=nguoi-thue`, `?tab=gia-han` | Có card Xe / biển số, Tạm trú và tab Gia hạn. Với `st_302G3A001`, UI báo nguồn cũ chưa có biển số/loại xe, tạm trú Chưa cập nhật và chưa có lần gia hạn. Đây là thiếu dữ liệu ở hồ sơ mẫu, không phải bằng chứng các phần UI bị mất. Tạm trú là phạm vi bổ sung của các đặc tả trước; G7 không trực tiếp liệt kê trường này. |
| Upload HĐ → biểu phí có phiên | `Thông tin khách hàng!G8:G9`; `#/documents`, `#/ocr/:id`, chi tiết lượt thuê | `X.ocrApply` đã có kiểm tra rà soát, xác nhận, ngày hiệu lực, khóa kỳ và tạo `rateVersions`; `recordStayVersion` giữ snapshot điều khoản/giá. Audit nói chưa đủ bằng chứng backend là đúng ở mức production. Trong lần đối chiếu này chưa chạy lại upload/OCR end-to-end nên không nâng thành PASS toàn luồng. |
| Aging công nợ | `Tài chính chung!E4:E5`; `#/billing/debts` | Live có Tuổi nợ và các bucket. Test đã kiểm tra ranh giới 30/31, 60/61, 90/91, 180/181 và ngày đầu thành nợ. Rule hiện dùng 1–30 sau khi thành nợ; audit đề nghị 0–30. Workbook không quy định trực tiếp các ranh giới này, cần dùng rule đã thống nhất thay vì coi khác nhãn là regression. |
| Hoàn cọc chi tiết | `Tài chính chung!D33:D40`; `#/refunds/rf_HC-202609-0001` | Live có chi tiết khấu trừ, chỉ số, lượng, đơn giá, lý do, thành tiền, truy vết và duyệt/chi. Còn phải kiểm tra số mong đợi/thực tế từng khoản trên ca nghiệm thu; không coi “cần verify line-level” là lỗi thiếu màn. |
| Sales field-level | `KINH DOANH!C5:C19`; `#/sales/deals` | Live có ngày giao dịch, phòng/tòa, quản lý, SĐT, cọc/thanh toán, giá chốt, tính tiền/thời hạn, nguồn/công cụ, sale/cách chia, nhận phòng, ghi chú, hoa hồng. Một số trường gom vào cùng cột. Cần map từng ô nguồn tới nội dung hiển thị/export, không đánh giá chỉ bằng số cột. |
| Lương 5 phòng ban; version/chốt | `NHÂN SỰ!A5:A9`; `#/hr/payroll?period=2026-09&tab=chinh-sach` | Live có chính sách 5 bộ phận. Code có phiên tính bảng lương, snapshot chính sách, duyệt ca ngoại lệ, chốt, nghĩa vụ chi và giao dịch chi. Màn mặc định có thể là “Xem trước – chưa lưu phiên” khi chưa thực hiện tính/lưu. Policy mang `confirmed` trong seed không thay thế xác nhận thực tế của khách; quy trình duyệt production vẫn cần nghiệm thu riêng. |
| Cổ đông | `TT CỔ ĐÔNG!A2:F2`, `C5`; `#/shares`, `#/shares/:buildingId`, `#/shares/capital` | Live có lịch sử tỷ lệ, lịch sử tổng hợp, bảng kê chia, lịch góp từng người, chi thực, tài sản/cọc và filter. Tài sản có giá trị “Chờ dữ liệu”; bảng kê mẫu có thể chưa khóa. UI coverage đã có, chưa thể gọi toàn bộ số liệu/versioning là đã nghiệm thu production. |
| 4 lịch bảo dưỡng và décor | `BẢO TRÌ BẢO DƯỠNG!A1:A5`, `B5`; `#/assets/maintenance`, `#/assets/inventory` | Live có lịch cho **elevator, pump, washer, water_filter**, tổng cộng 27 lần bảo dưỡng. Tài sản và filter có `decor`. Nhận định “chưa verify taxonomy” được giải quyết ở mức hiện diện loại; độ đúng chu kỳ/chi phí cần test từng ca. |

## Vì sao audit vẫn lặp lại các mục đã sửa

1. **Cách đóng gap chưa đủ chặt.** `docs/uat/Source_Workbook_Live_Gap_Matrix.md` và `UI_Audit_v4_Gap_Matrix.md` đóng theo nhóm tính năng/test. Chưa có một bảng chung nối từng ô workbook, role, route, trạng thái dữ liệu, số mong đợi và bằng chứng trên đúng deploy. Có trường/form là một mốc khác với dữ liệu đã đủ và nghiệp vụ đã nghiệm thu.
2. **Tên kiểm tra dễ gây hiểu nhầm.** `scripts/verify-source-workbook-live.mjs` khởi chạy `scripts/serve.mjs` trên localhost. `verify-ui-audit.mjs` cũng dùng server local. Chữ “Live” trong tên không chứng minh Netlify đã được kiểm tra; lần đối chiếu này bổ sung bằng chứng truy cập Netlify trực tiếp.
3. **Ma trận cũ có route không đúng manifest.** Ví dụ `/debts` → `/billing/debts`, `/payroll` → `/hr/payroll`, `/shareholders` → `/shares`, `/customers` → `/tenants`, `/maintenance` → `/assets/maintenance`. Báo cáo cũng dùng `/reports/summary` trong khi route thật là `/reports/total`. Điều này làm bằng chứng khó truy lại. Đây là sai lệch tài liệu; chưa có bằng chứng người audit thực tế đã truy cập các URL sai đó.
4. **Dữ liệu mẫu không đầy đủ và được giữ nguyên.** Những sửa UI không tự tạo số PCCC, ngày giữ giá, biển số, tạm trú hoặc giá trị tài sản khi không có hồ sơ nguồn. Hồ sơ G1 minh họa rõ khác biệt giữa trường đã có và dữ liệu chưa nhập.
5. **Hai mức phạm vi đang bị trộn.** Repo là static SPA mockup, seed + localStorage; file hợp đồng/bản nháp dùng IndexedDB. Các yêu cầu API/DB/backend consistency, nhiều người cùng cập nhật và lưu trữ production chưa được chứng minh bằng các test frontend. Hóa đơn/report lịch sử chạy song song Excel được README quy định, không tự nó là lỗi mới hay pipeline production bị chậm.
6. **Audit mới thiếu dữ kiện tái hiện.** Nhiều mục dùng “chưa xác nhận”, “chưa capture đủ”, “cần QA”. Các tỷ lệ ~60–95% không đi kèm mẫu số requirement và kết quả từng ca, nên chưa thể dùng như tỷ lệ kiểm thử đã xác minh. Nhận định freshness điện/nước cũng cần timestamp nguồn và kỳ dữ liệu; hiện chưa chứng minh có một pipeline backend bị lag.

## Trạng thái cần dùng cho lần nghiệm thu tiếp theo

- **PASS UI:** đã thấy đúng field/flow trên đúng deploy, role và route.
- **PASS nghiệp vụ:** ca có đầu vào, số mong đợi, kết quả thực tế và bằng chứng; kiểm tra cả lưu lại/phiên/khóa nếu liên quan.
- **Thiếu dữ liệu:** field và rule có, nhưng hồ sơ nguồn chưa đủ. Không giả dữ liệu để đóng gap.
- **Chưa kiểm chứng:** chưa chạy ca; không chuyển thành FAIL hoặc PASS theo suy đoán.
- **FAIL:** có thao tác tái hiện, expected/actual khác nhau, kèm role/kỳ/phiên deploy.
- **Ngoài phạm vi mockup / cần production:** yêu cầu hạ tầng hoặc nghiệp vụ production chưa được mockup chứng minh.

Không chỉnh báo cáo audit gốc, số fixture hoặc dữ liệu live để làm kết quả khớp. Tài liệu này giải thích bằng chứng hiện có và giới hạn của chúng; không tuyên bố đã đóng tất cả gap.
