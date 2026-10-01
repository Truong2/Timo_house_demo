# Kế hoạch sửa 6 lỗi Phase 2

Ngày: 01/10/2026. Căn cứ: commit audit `fe94bc5`, `docs/SRS/TimoHouse_Audit_Phase2_2026-10-01.md`, SRS Draft v1.13 và UAT v0.4. Trạng thái: đã triển khai và đạt kiểm thử sửa 6 lỗi audit; xem báo cáo nghiệm thu.

> Đã triển khai đủ 4 đợt và hoàn thành kiểm thử sửa 6 lỗi audit ngày 01/10/2026. Bằng chứng: [báo cáo nghiệm thu](TimoHouse_Nghiem_Thu_Sua_Loi_Phase2_2026-10-01.md). Các câu hỏi nghiệp vụ còn mở được giữ nguyên.

## 1. Mục tiêu và phạm vi

Sửa P2-AUD-01…06, hoàn thiện điểm vào UI thật và bổ sung kiểm thử bắt lỗi tích hợp. Giữ vanilla JS, UI kit, route/query hiện có, cách tính nghiệp vụ và các giả định đã được ghi trong SRS/UAT. Không thêm API/backend, không cần migration hàng loạt hoặc chuyển dữ liệu demo thành file thật. Các bản ghi cũ không có blob vẫn đọc được metadata và được ghi rõ cần bổ sung file gốc.

Các câu hỏi K-11…K-19 và GĐ-E1…E6 không chặn việc sửa kỹ thuật này. Không tự đổi chính sách hoa hồng, kỳ sửa chữa, tỷ lệ chuyển đổi hay cách chia cổ đông để làm test khớp. Kết quả nghiệm thu phải ghi rõ những giả định chưa được khách xác nhận.

## 2. Thiết kế dùng chung

### 2.1. Bản ghi hợp đồng và bản gốc

- Dùng `contractFiles` làm bản ghi hợp đồng khách mà UI-07, phiên OCR và điều kiện hoa hồng cùng tham chiếu. Mỗi bản ghi chứa blobId, nguồn nhập, lượt thuê, phiên bản và metadata hiện có.
- Lưu nguồn/phân loại file rõ ràng: PDF/ảnh được xác nhận là hợp đồng đã ký; tài liệu bổ trợ; Excel/CSV. Có file bổ trợ không đồng nghĩa đã có HĐ ký.
- Hợp đồng khách đi qua intake phải đăng ký bản ghi hợp đồng sau khi liên kết đúng lượt thuê. Có thể giữ `intakeAttachments` để truy vết; kho tài liệu hợp nhất hai tham chiếu cùng blob/lượt thuê, không hiển thị trùng.
- Bộ chọn hợp đồng hợp lệ tương thích bản ghi `contractFiles` cũ và `intakeAttachments` đã lưu. Không đoán Excel là hợp đồng. Bản ghi nguồn cũ không đủ thông tin xác nhận HĐ ký cần được người có quyền bổ sung/xác nhận.
- Chống lặp theo lượt thuê + blob/hash và khóa xác nhận UI; dùng cùng helper khi upload ở UI-07 hoặc intake. Không tạo phiên bản mới chỉ vì đọc lại đúng file.
- Tách ngày xác nhận ký khỏi ngày trích xuất nếu cần; không làm lùi ngày đủ điều kiện hoa hồng chỉ bằng chọn một ngày trên form.

### 2.2. Kho blob và quyền đọc

- Tách thao tác IndexedDB/hash/object URL khỏi chính sách `owner/tenant` hiện đang nằm trong `intake-files.js` để kho tài liệu tái sử dụng được.
- Các API đọc/preview/download công khai phải kiểm bản ghi tài liệu/hợp đồng hoặc draft, quyền hiện hành và phạm vi hồ sơ liên kết. Không cấp quyền đọc chỉ dựa vào blobId hoặc nhãn kind.
- Vận hành/leader/trưởng phòng được đọc và rà soát hợp đồng trong phạm vi theo `ocr.review`; áp dụng cần `rates.manage`. Sale/trưởng nhóm KD, kỹ thuật vẫn tải theo phạm vi hẹp GĐ-E1.
- Draft rà soát phải gắn targetStayId, người tạo/rà soát và kiểm phạm vi lại khi mở, sửa, đọc file, lưu và áp dụng. Người rà soát không có quyền ghi không được biến draft thành luồng tạo khách/tòa hoặc mở rộng sang hồ sơ khác.
- Blob không tồn tại: thông báo thiếu bản gốc, cho bổ sung đúng file và giữ dữ liệu/nháp. Thu hồi object URL, hủy đọc khi rời màn và bỏ qua kết quả đã hủy.

## 3. Các đợt triển khai

### Đợt 1 — Nền hợp đồng/blob và liên kết hoa hồng (P2-AUD-02)

**Mã:** `intake-files.js`, `act-stays.js`, `act-intake.js`, `act-documents.js`, `act-sales.js`; helper kho blob nếu cần.

1. Tạo helper đăng ký/chọn hợp đồng dùng chung, lưu blobId và phân biệt HĐ ký với file bổ trợ.
2. Intake commit đăng ký hợp đồng vào lượt thuê trong cùng transaction dữ liệu; không tạo lại lượt thuê, số dư hoặc biểu phí khi chỉ gắn file.
3. `Q.dealEligibility` dùng cùng selector hợp đồng hợp lệ thay vì chỉ đọc một collection. Giữ điều kiện cọc, tháng đầu và quy tắc ngày đủ điều kiện hiện tại.
4. Kho tài liệu hợp nhất nguồn và gắn đúng link; đọc lại cùng file không nhân đôi phiên bản hoặc hợp đồng.
5. Giữ bản ghi cũ và nguồn intake cũ hiển thị được; tránh phải chạy migration thủ công.

**Nghiệm thu:** file PDF/ảnh HĐ đã ký từ intake và UI-07 cho cùng kết quả điều kiện hoa hồng; thiếu cọc/tháng đầu/HĐ vẫn bị chặn; Excel/CSV/ảnh tham khảo không mở điều kiện chi; nhập lại không nhân đôi bản ghi; không tự tạo phiếu thu hoặc chi.

### Đợt 2 — OCR thật, quyền rà soát và áp dụng (P2-AUD-01/03)

**Mã:** `intake-files.js`, `act-documents.js`, `act-intake.js`, `pages/intake.js`, `pages/documents.js`, `pages/stay.js`, `core/routes.js`, `domain/rbac-policy.js` nếu cần điều chỉnh capability.

1. Phân biệt workspace tạo hồ sơ mới với workspace rà soát hợp đồng của lượt thuê hiện có. Không dùng validation chống sửa hồ sơ của luồng tạo mới làm điều kiện áp dụng OCR.
2. Kết quả PDF/OCR thật tạo phiên rà soát theo cùng mô hình dùng cho `ocrSetField/ocrConfirmGroup/ocrApply`; giữ giá trị gốc, giá trị sửa, file/trang/vùng, độ tin cậy và lịch sử người xác nhận. Giữ phiên mô phỏng cũ để tra cứu; không trình bày nó như bản gốc thật.
3. UI hiển thị đủ nhóm bắt buộc, lỗi từng trường, nguồn và so sánh cũ/mới. Sửa trường hoặc lựa chọn nguồn hủy xác nhận nhóm/rà soát tương ứng. Người rà soát không được sửa định danh phòng/lượt thuê đích để chuyển hồ sơ.
4. Vận hành/leader/trưởng phòng trong phạm vi mở được phiên, sửa trường được phép và lưu rà soát; chỉ admin/kế toán áp dụng. Kiểm cả route, service, draft và preview/download.
5. Bước cuối của hồ sơ hiện có dùng CTA “Áp dụng hợp đồng/biểu phí”, chọn ngày hiệu lực và xem thay đổi trước khi ghi. Luồng tạo mới giữ CTA “Xác nhận hồ sơ”.
6. Dùng một biên áp dụng chung cho OCR thật và mô phỏng, tạo `rateVersions` và ghi điều khoản đúng quy tắc D8; kiểm đủ trường/nhóm, file hiện hành, hiệu lực và kỳ khóa. Gói các mutation trong transaction và chống áp dụng lặp.
7. Giá/phí 0 là giá trị rõ ràng; ô không thu và thiếu dữ liệu nguồn cần được phân biệt để không âm thầm giữ phí cũ hay xóa phí chưa được xác nhận.
8. Giữ hóa đơn đã phát hành, tiền thực thu và sổ cọc; chênh cọc chỉ cảnh báo. Không thay ngày ký/nhận/tính tiền khi đã có hóa đơn phát hành theo quy tắc hiện tại.
9. Chạy lại tạo phiên mới và vô hiệu hóa phiên chờ cũ; thay file không áp dụng phiên nguồn cũ. Người dùng ra khỏi phạm vi sau phân công phải bị chặn khi áp dụng.

**Nghiệm thu:** PDF có phí/cọc khác hồ sơ hiện có được rà soát và áp đúng kỳ hiệu lực; người vận hành rà được nhưng không áp được; ngoài phạm vi/direct URL/service bị chặn; thiếu trường chưa áp được; hóa đơn phát hành không đổi; phí trống/0 phân biệt; hủy đọc, file thiếu, chạy lại và bấm xác nhận hai lần an toàn.

### Đợt 3 — Upload/tải và phiên bản tài liệu thật (P2-AUD-04)

**Mã:** `pages/documents.js`, `act-documents.js`, helper kho blob; các điểm tải ở deal, sửa chữa và cổ đông.

1. Thay ô chỉ nhập tên bằng chọn file/dropzone UI kit; lấy tên/kích thước từ file thật. Có thể nhập tên hiển thị riêng.
2. Dùng danh sách định dạng tài liệu hiện có trong SRS/action (PDF, ảnh, Word, Excel), giới hạn thống nhất 30 MB; không mở rộng parser hợp đồng sang Word nếu chưa có bộ đọc.
3. Lưu blob thành công trước khi tạo metadata báo thành công; metadata lưu blobId/hash/kích thước thực tế. Nếu ghi metadata lỗi, dọn blob vừa tạo khi chưa có tham chiếu khác; không xóa blob dùng chung.
4. Phiên bản mới chọn file mới, lưu blob riêng và nối prevId/version; không làm mất bản cũ nếu upload lỗi. Bản cũ tải được theo quyền và có link trong drawer lịch sử.
5. Tải xuống qua biên kiểm quyền và phạm vi hồ sơ. Nhật ký thành công ghi sau khi truy xuất được bản gốc và bắt đầu tải; phân biệt thiếu blob với không có quyền.
6. Bản ghi demo thiếu blob có nhãn/thông báo riêng; chỉ báo “Đã tải lên” cho file được lưu thật.
7. Tài liệu gắn giao dịch vẫn không xóa; link đối tượng phải đúng tòa và đúng bản ghi.

**Nghiệm thu:** upload PDF PCCC mới rồi tải xuống khớp byte/hash; bản v1/v2 tải đúng nội dung sau reload; file quá lớn/sai loại/ghi lỗi không để metadata thành công giả; quyền vận hành, sale, kỹ thuật và ngoài phạm vi đúng; không báo tài liệu mới là bản demo cũ.

### Đợt 4 — Chặn ca biên ở action kinh doanh (P2-AUD-05/06)

**Mã:** `act-sales.js`; helper khả dụng phòng/quyền gán sale; test `p2-sales` hoặc file hồi quy mới.

1. Trước `closeDeal`, kiểm tất cả saleIds: tồn tại, là nhân sự sale hợp lệ/đang hoạt động và trong phạm vi được gán. Khử trùng, không nhận tập rỗng hay tự gán người ngoài phạm vi. Admin/kế toán chỉ thực hiện theo quyền hiện có; không mở ngoại lệ chia trùng xuyên team nếu chưa có quy tắc.
2. Từ chối toàn bộ payload trước khi tạo khách, lượt thuê, deal hoặc hoa hồng; không ghi dở dang khi một sale không hợp lệ.
3. Dùng helper khả dụng phòng chung cho chốt và chuyển. `transferDeal` kiểm `Q.rentable`, trạng thái ngừng khai thác, giá hợp lệ, lượt chờ/deal giữ phòng, thời gian ở của khách cũ, hóa đơn đã phát hành và các kiểm tra hiện có.
4. Kiểm lại tại thời điểm xác nhận, không tin danh sách dropdown đã mở trước đó. Lỗi chuyển phòng giữ nguyên phòng cũ, biểu phí, sổ cọc, hoa hồng và lịch sử.
5. Giữ hoa hồng theo phòng cũ và tòa ghi chi theo giả định hiện tại; không tự giải quyết K-11 bằng cách đổi nghiệp vụ.

**Nghiệm thu:** payload sale ngoài phạm vi/nhân viên không tồn tại/ngừng làm bị chặn và không mutation; phòng inactive hoặc đã được giữ sau khi mở form bị chặn; chuyển hợp lệ vẫn đồng bộ lượt thuê/giá/phí và giữ hoa hồng đúng quy tắc hiện có.

## 4. Kiểm thử bắt buộc

### Hồi quy mới

- Service test cho hợp đồng intake → điều kiện hoa hồng, loại file, phiên bản và chống trùng.
- Service test cho áp dụng OCR thật, quyền từng bước, hiệu lực/kỳ khóa, lỗi giữa transaction và chống áp dụng lặp.
- Service test cho saleIds ngoài phạm vi và phòng không khả dụng; so sánh dữ liệu trước/sau ca bị chặn.
- UI test click nút thật, không chỉ gọi `X.runOcr` bằng evaluate: upload PDF → rà soát → so sánh → áp dụng → kiểm rate version, điều khoản và hóa đơn cũ.
- UI test vận hành, leader, trưởng phòng, admin/kế toán; URL trực tiếp và blob/draft của hồ sơ ngoài phạm vi.
- UI test file download so byte/hash, v1/v2, reload, thiếu file và thông báo thành công/thất bại.
- Chuyển các ca audit thành kiểm thử kỳ vọng đúng sau sửa, thay vì coi việc còn tái hiện lỗi là PASS.

### Các lệnh và số liệu bảo toàn

1. `npm run check`, `npm run build`.
2. `npm run smoke`, P0 19 ca và `npm run sweep`.
3. `npm run verify:p2`; thêm assertion nội dung/trạng thái vào các điểm sửa và cập nhật ảnh UI.
4. `node scripts/verify-intake.mjs`, `node scripts/verify-intake-modes.mjs`, `npm run verify:intake:ui`.
5. Chạy suite UI hồi quy Phase 2 mới; kiểm upload/download bằng file thật và các payload bị chặn.
6. NT-0…NT-6 giữ đúng bộ đối chiếu hiện có; không đổi seed/golden để che lỗi.
7. Chụp các màn thay đổi tại 1600×1000, 1440×1000, 1024×768, 390×844; form/preview không tràn, CTA không che trường, thao tác bàn phím được.

## 5. Điều kiện hoàn thành

- Cả 6 lỗi audit không còn tái hiện; mỗi lỗi có ca hồi quy chứng minh hành vi đúng.
- Điểm vào OCR thật, upload UI-07, intake và kho tài liệu dùng cùng hợp đồng/nguồn và quy tắc quyền.
- Upload/download lưu và trả đúng file thật; bản cũ/bản demo thiếu blob xử lý minh bạch.
- Không thay hóa đơn đã phát hành, không nhân đôi hồ sơ/tiền thu/tiền chi/hoa hồng, không lộ file ngoài phạm vi.
- Tất cả kiểm thử bắt buộc đạt; cập nhật UAT mục sửa lỗi và báo cáo audit bằng dẫn chứng sau sửa.
- Kết luận tách rõ “đã sửa lỗi kỹ thuật và đạt kiểm thử theo giả định hiện tại” với “nghiệp vụ đã được khách chốt”; không gọi các câu hỏi còn mở là đã nghiệm thu.

## 6. Thứ tự và phụ thuộc

Thực hiện Đợt 1 → Đợt 2 → Đợt 3 → Đợt 4 → kiểm thử/nghiệm thu tổng. Đợt 1 tạo nền bản ghi hợp đồng/blob và quyền; Đợt 2 dùng nền đó cho OCR thật; Đợt 3 hoàn thiện kho tài liệu; Đợt 4 chốt kiểm tra action kinh doanh. Mỗi đợt chỉ hoàn tất khi ca hồi quy tương ứng đạt, sau đó mới chạy kiểm thử toàn hệ thống.
