# Kế hoạch chạy lại UAT và lập minh chứng UI cho Phase 1–3 trên `develop`

## 1. Chuẩn bị baseline và bộ chạy

- Cập nhật `origin/develop`, ghi nhận commit SHA, rồi tạo worktree/nhánh UAT biệt lập từ commit đó để không ảnh hưởng 12 file chưa commit trong workspace hiện tại.
- Kiểm tra Node, Chrome/Browser, LibreOffice và công cụ render DOCX; nếu thiếu thì xin phê duyệt cài/bật trước khi chạy chính thức.
- Mở rộng runner hiện có thành bộ chạy theo phase:
  - `walkthrough:p1`: 36 mốc S0–F10.
  - `walkthrough:p2`: 20 mốc F11–F15 và F08.5.
  - `walkthrough:p3`: 15 mốc F16–F19.
  - `walkthrough:all`: chạy tuần tự cả 71 mốc và tổng hợp kết quả.
- Mỗi phase dùng browser context và dữ liệu sạch riêng:
  - P1: chỉ bật Phase 1.
  - P2: bật P2, dùng seed P1 làm dữ liệu nền.
  - P3: bật cả P2 và P3 vì ngân hàng/đối soát phụ thuộc quy tắc P2.
- Cố định ngày nghiệp vụ `28/10/2026`, kỳ `10/2026`; thời gian chụp và commit SHA lấy theo lần chạy thực tế.

## 2. Cách chạy và thu thập bằng chứng

- Mọi mốc phải được thao tác qua UI: đăng nhập/chuyển vai trò, nhập form, xác nhận modal, điều hướng route và quan sát kết quả; không dùng `runAllP2/runAllP3` để tạo kết quả thay cho thao tác UI.
- Với mỗi mốc lưu:
  - Vai trò, route, phase flags và dữ liệu nhập.
  - Hành động thực hiện.
  - Kết quả mong đợi theo guide/SRS.
  - Kết quả thực tế đọc từ UI và state assertion.
  - Record ID động, timestamp, commit SHA và trạng thái PASS/FAIL.
  - Ảnh `input`, `action` khi cần và `result`; ảnh lỗi có console/stack tương ứng.
- Ảnh chụp ở 1440×1080, cuộn đúng bản ghi cần chứng minh và làm nổi vùng thao tác; không chấp nhận ảnh chỉ có toast nhưng không thấy dữ liệu kết quả.
- Kiểm tra thực nội dung file tải xuống cho CSV/PDF: tồn tại, tên file, header, số dòng, giá trị chính và checksum.
- Zalo, OCR và dịch vụ ngoài phải gắn nhãn “mô phỏng”; không diễn giải trạng thái mô phỏng thành tích hợp production.
- Thêm smoke test liên phase:
  - CRM P2 tạo hợp đồng/phòng thuộc dữ liệu lõi P1.
  - Bảo trì P2 tạo chi phí tài chính.
  - Kiểm kê P3 đồng bộ tình trạng tài sản.
  - Lương P3 tạo chi phí đúng kỳ.
  - Đối soát ngân hàng P3 tạo khoản thu và giảm công nợ.
  - Cổ đông chỉ xem dữ liệu thuộc phạm vi của mình.

## 3. Sửa lỗi và tiêu chí nghiệm thu

- Chạy `npm run check` trước UAT; yêu cầu syntax và toàn bộ ma trận RBAC PASS.
- Nếu một mốc FAIL:
  - Lưu evidence lỗi và nguyên nhân.
  - Sửa mã trên nhánh UAT xuất phát từ `origin/develop`.
  - Chạy lại phase bị ảnh hưởng từ dữ liệu sạch.
  - Sau khi sửa hết, chạy lại toàn bộ 71 mốc để loại trừ regression.
- Xử lý rõ các điểm đã phát hiện:
  - Đồng bộ trạng thái dòng khấu trừ với trạng thái hồ sơ hoàn cọc.
  - Chụp đúng dòng công nợ demo và số dư sau thu một phần.
  - Kiểm tra nội dung CSV thay vì chỉ xác nhận nút xuất.
  - Giữ quy tắc “không tự bù trừ công nợ vào cọc” theo OI-07 nhưng đánh dấu `NEEDS BUSINESS CONFIRMATION`, không tự thay đổi quy tắc nghiệp vụ.
- Điều kiện hoàn tất:
  - 71/71 mốc PASS; các smoke test liên phase PASS.
  - Không còn screenshot thiếu, hỏng hoặc không chứng minh được kết quả.
  - Manifest từng phase có `qa.status = PASS`.
  - Phân quyền, phép tính tiền, vòng đời phòng/hợp đồng/hóa đơn và tính idempotent đều đạt.
  - Nếu có vấn đề nghiệp vụ chưa được chốt, tài liệu ghi rõ “PASS theo mockup hiện tại” và không kết luận production-ready.

## 4. Bộ tài liệu và giao diện đầu ra

- Không ghi đè evidence cũ; tạo thư mục phiên bản:
  `docs/uat/develop-<short-sha>-<YYYYMMDD>/`.
- Tạo bốn tài liệu:
  - `00_TimeHouse_UAT_3_Phase_Summary.docx`
  - `01_TimeHouse_Phase1_UAT_Evidence.docx`
  - `02_TimeHouse_Phase2_UAT_Evidence.docx`
  - `03_TimeHouse_Phase3_UAT_Evidence.docx`
- Mỗi DOCX phase gồm: metadata lần chạy, sơ đồ swimlane, ma trận traceability, mô tả từng flow/mốc, dữ liệu nhập, action, expected/actual, ảnh minh chứng, mã record, kết luận và danh sách vấn đề.
- DOCX tổng hợp gồm: trạng thái 3 phase, 71 mốc, liên kết liên phase, lỗi đã sửa, vấn đề cần khách hàng xác nhận và kết luận mức sẵn sàng.
- Kèm artifact máy đọc:
  - `manifest.json` riêng từng phase.
  - `summary.json` toàn bộ đợt chạy.
  - Thư mục `evidence/` và `downloads/`.
  - `issues.md` ghi lỗi, quyết định và giới hạn mô phỏng.
- Render toàn bộ DOCX thành PNG, kiểm tra 100% số trang, sửa mọi lỗi tràn chữ/bảng/ảnh trước khi bàn giao. Chỉ DOCX và manifest/evidence gốc được xem là deliverable; ảnh render trang chỉ phục vụ QA nội bộ.

## 5. Thay đổi interface và giả định

- Thêm các lệnh npm `walkthrough:p2`, `walkthrough:p3`, `walkthrough:all`; giữ tương thích `walkthrough:p1`.
- Chuẩn hóa manifest với các trường: `phase`, `flow`, `milestone`, `role`, `route`, `inputs`, `expected`, `actual`, `assertions`, `screenshots`, `downloads`, `recordIds`, `commit`, `timestamps`, `status`, `error`.
- Không thay đổi API nghiệp vụ công khai; thay đổi chỉ nằm ở runner, assertion, sửa lỗi phát hiện trong UAT và tài liệu.
- Dùng dữ liệu demo, không dùng PII thật.
- Nhánh UAT được tạo từ `origin/develop`; không tự push hoặc merge vào `develop`. Cuối đợt sẽ bàn giao commit/patch để review và tích hợp mà không làm mất các thay đổi chưa commit hiện tại.
