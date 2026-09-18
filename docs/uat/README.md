# TimeHouse UAT evidence runner (3 phase)

## Phạm vi và baseline

Bộ chạy dùng cho worktree/nhánh UAT tách từ `develop`. Ngày nghiệp vụ cố định `28/10/2026`, kỳ `10/2026`, viewport 1440×1080, mọi thao tác đi qua UI (đăng nhập, chuyển vai trò qua topbar, nhập form, xác nhận modal). `page.evaluate` chỉ dùng để reset dữ liệu, bật phase, đọc state cho assertion/manifest và vẽ callout. Không dùng `runAllP2/runAllP3` để tạo kết quả.

Số mốc được duyệt:

- Phase 1: **40** mốc (`S0` 4 + `F00` 4 + `F01`–`F10` 32). `F00` là luồng thiết lập Chủ nhà → HĐ đầu vào → Tòa → Phòng.
- Phase 2: **20** mốc (`F11`–`F15`).
- Phase 3: **15** mốc (`F16`–`F19`).
- Tổng: **75** mốc.

`F08.5.1`–`F08.5.3` (hoàn cọc – yêu cầu chỉnh sửa) là regression bắt buộc của Phase 2, chạy qua cùng `step()` (có ảnh input/result, guide-check, record đầy đủ) nhưng nằm trong `regression[]` ngoài bộ đếm 75. Phase chỉ PASS khi regression PASS.

Cờ phase theo từng lần chạy: P1 `{p2:false,p3:false}`, P2 `{p2:true,p3:false}`, P3 `{p2:true,p3:true}` (đối soát ngân hàng dùng quy tắc ghép của P2). Mỗi phase dùng browser context riêng và xóa localStorage trước khi chạy.

## Lệnh

```powershell
npm run check                # cú pháp + ma trận RBAC (chạy trước UAT)
npm run walkthrough:p1       # Phase 1 (40 mốc)
npm run walkthrough:p2       # Phase 2 (20 mốc + F08.5 regression)
npm run walkthrough:p3       # Phase 3 (15 mốc)
npm run walkthrough:all      # check → P1 → P2 → P3 → summary → render (dừng ở phase FAIL đầu tiên)
npm run walkthrough:summary  # tổng hợp lại summary.json / issues.md / 00_Summary.docx từ 3 manifest
npm run walkthrough:render   # DOCX → PDF (LibreOffice) → PNG từng trang (PyMuPDF) vào _rendered/ để QA layout
```

Biến môi trường: `TIMEHOUSE_UAT_ROOT` (thư mục đầu ra; mặc định `docs/uat/develop-<sha7>-<YYYYMMDD>/`), `TIMEHOUSE_BASE_URL` (dùng server có sẵn), `CHROME_PATH`, `SOFFICE_PATH` (mặc định `C:/Program Files/LibreOffice/program/soffice.exe`), `PYTHON_PATH` (cần PyMuPDF), `RENDER_DPI`.

Chạy lẻ `walkthrough:p1` không có `TIMEHOUSE_UAT_ROOT` sẽ ghi vào thư mục cũ `docs/phase1-walkthrough/`; `walkthrough:all` luôn dùng thư mục phiên bản.

## Đầu ra

- `00_TimeHouse_UAT_3_Phase_Summary.docx` – trạng thái 3 phase, 75 mốc, smoke liên phase, regression, QA assertions, lỗi đã sửa, OI-07, giới hạn mô phỏng.
- `01/02/03_TimeHouse_PhaseN_UAT_Evidence.docx` – metadata lần chạy, swimlane theo vai trò, ma trận truy vết flow ↔ SRS, từng mốc (vai trò, route, dữ liệu nhập, action, expected/actual, assertions, file tải xuống, record ID, thời gian, trạng thái) kèm ảnh, kết luận và danh sách vấn đề.
- `summary.json`, `issues.md`, `phase-N/manifest.json`, `phase-N/evidence/*.png`, `phase-N/downloads/*`, `phase-N/pN-swimlane.png|svg`.
- `_rendered/` (không commit): PDF + PNG từng trang + `render.json` để QA tràn chữ/bảng/ảnh.

Mỗi record mốc có: `phase, flow, milestone, counted, title, role, route, phaseFlags, inputs, action, expected, actual, assertions, screenshots, downloads, recordIds, commit, timestamps{startedAt,finishedAt}, status, error`.

## Chính sách nghiệm thu

- Phase PASS khi đủ số mốc, mọi mốc PASS, regression PASS và smoke liên phase PASS. Tổng PASS khi 3 phase PASS và tổng mốc = 75.
- Mốc có `assertions` FAIL bị coi là FAIL dù UI không lỗi. Runner dừng ở mốc FAIL đầu tiên của phase nhưng vẫn ghi manifest (kèm ảnh `-error.png` và lỗi console) để sửa và chạy lại phase từ dữ liệu sạch.
- File tải xuống chỉ được chấp nhận khi ghi nhận tên, dung lượng, header/số dòng (CSV) hoặc giá trị chính (bản in mô phỏng `.txt`), SHA-256. Ảnh chỉ có toast mà không thấy bản ghi không đủ làm minh chứng (`scrollTo` cuộn đúng bản ghi).
- Smoke liên phase là assertion trên state: CRM → hợp đồng/phòng/giữ chỗ P1; sự cố → chi phí; kiểm kê → tình trạng tài sản; lương → chi phí đúng kỳ; đối soát ngân hàng → khoản thu & giảm công nợ; cổ đông chỉ thấy dữ liệu của mình.
- Zalo, OCR, ngân hàng/VietQR được gắn nhãn mô phỏng. OI-07 giữ `NEEDS BUSINESS CONFIRMATION`: mockup không tự bù trừ công nợ vào cọc; PASS chỉ là “PASS theo mockup hiện tại”, không kết luận production-ready.
