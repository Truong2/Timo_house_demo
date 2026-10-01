# Kiểm tra mức độ hoàn thành Phase 2 — 01/10/2026

> Cập nhật sau triển khai: 6 lỗi P2-AUD-01…06 đã được sửa và có ca hồi quy đạt. Xem [báo cáo nghiệm thu](TimoHouse_Nghiem_Thu_Sua_Loi_Phase2_2026-10-01.md). Phần dưới giữ nguyên bằng chứng trước sửa.

**Commit kiểm tra:** `fe94bc5dd419f875d43a2d00c5b6dffe6adba1d2`  
**Đặc tả:** `docs_timonouse/TimoHouse_Dac_ta_man_hinh_web_va_luong_nghiep_vu_v1.md`, Draft v1.13.  
**Kịch bản:** `docs/uat/Phase2_Kich_ban_kiem_thu.md`, v0.4, gồm đợt E.

## Kết luận

Phase 2 chạy được trong ứng dụng mockup và đã có phần lớn chức năng trong phạm vi đề xuất. **Chưa đạt điều kiện kết luận hoàn thành và đúng toàn bộ nghiệp vụ SRS.** Kiểm tra độc lập tái hiện được 6 vấn đề, trong đó lỗi tích hợp OCR thật, hợp đồng và hoa hồng không được các test mô phỏng hiện có phát hiện. Một số quy tắc vẫn là giả định cần khách xác nhận.

Đây là kết quả kiểm tra mã nguồn và ứng dụng static SPA, không phải chứng nhận triển khai production. Không sửa mã ứng dụng trong đợt kiểm tra này.

## 1. Kiểm tra đã chạy

| Kiểm tra | Kết quả | Giới hạn |
|---|---|---|
| `npm run check` | 89 file JS hợp lệ; 442 kiểm tra RBAC; 266 test đạt, 0 lỗi | Test đạt không chứng minh tất cả điểm vào UI thực tế cùng dùng nghiệp vụ đã test |
| `npm run build` | Thành công, 328 file | Build của ứng dụng mockup |
| `npm run verify:p2` | 88 ảnh, không lỗi JavaScript trang | Script thiên về setup dữ liệu bằng action và chụp ảnh; không xác nhận đầy đủ nội dung/trạng thái của mọi màn |
| `npm run smoke` | 36/36 bước Phase 1 đạt | Luồng hồi quy hiện có |
| `npm run sweep` | 117 route × 8 tài khoản; 0 lỗi hiển thị, 0 lỗi JS | Không thay thế kiểm thử mutation và tính đúng dữ liệu |
| `node scripts/verify-p0.mjs --label=phase2-audit` | 19/19 đạt | Ca P0 có sẵn |
| `node scripts/verify-intake.mjs` | PDF thật, ảnh OCR, XLSX, chủ nhà/tòa/30 phòng, lượt thuê/đề xuất thu, mở lại file gốc đạt | Không kiểm tra áp dụng OCR thật thay đổi điều khoản vào lượt thuê đã tồn tại hoặc điều kiện hoa hồng sau nhập |
| Probe action và UI độc lập | Tái hiện 6 vấn đề bên dưới; probe UI không lỗi JS | Dữ liệu mỗi browser context/vm riêng, không sửa dữ liệu người dùng |

Các ca NT-0…NT-6 trong bộ test hiện tại đều đạt. Đối chiếu hoa hồng, chia cổ đông, âm dương điện/nước, sổ thợ sử dụng seed/fixture từ nguồn khách. Không coi việc khớp chế độ “như Excel” là xác nhận mọi công thức web và giả định đã được khách duyệt.

Log lần chạy được lưu ở `output/phase2-audit-2026-10-01/`.

## 2. Các vấn đề tái hiện được

### P2-AUD-01 — Cao: luồng OCR thật chưa áp dụng được biểu phí/điều khoản khác hồ sơ hiện có

- **Yêu cầu:** SRS UI-08, dòng 174–179: rà soát rồi áp dụng vào hợp đồng/biểu phí UI-09; đợt D8 trong UAT yêu cầu ghi cọc, kỳ/hạn trả, người/xe và điều khoản phù hợp, giữ hóa đơn đã phát hành.
- **Điểm vào thực tế:** `mockup/js/pages/documents.js:43` và `mockup/js/pages/stay.js:102` gọi `TH.intakeFiles.startStay` → workspace intake, không gọi đường `X.ocrApply` đã được test.
- **Tái hiện:** tạo draft gắn chính xác vào `st_101T21A002`; validation ban đầu không lỗi. Đổi cọc +100.000 và đơn giá điện +500.
- **Thực tế:** validation báo khác cọc/điều khoản và khác biểu phí, không cho xác nhận. Luồng này chỉ gắn file khi dữ liệu khớp; không có bước tạo phiên biểu phí với ngày hiệu lực cho dữ liệu OCR đã sửa.
- **Mã liên quan:** `mockup/js/services/act-intake.js:83–89`; commit hiện có không tạo rate version cho lượt thuê liên kết.
- **Hướng xử lý:** dùng cùng biên áp dụng OCR đã rà soát cho bản đọc thật; giữ kiểm tra hiệu lực/kỳ khóa và snapshot hóa đơn. Không bỏ validation để sửa trực tiếp số đã phát hành.

### P2-AUD-02 — Cao: file hợp đồng từ intake không được tính vào điều kiện chi hoa hồng

- **Yêu cầu:** CH-19/UI-22, SRS dòng 317: đủ 1 cọc + 1 tháng + hợp đồng đã ký thì đủ điều kiện chi.
- **Tái hiện:** giao dịch `dl_101T21A002` có cọc và tháng đầu đã đủ; thay file HĐ seed bằng file được gắn qua một draft intake hợp lệ và commit.
- **Thực tế:** kho tài liệu có `tenant_contract` với nguồn `intakeAttachment`, nhưng `Q.dealEligibility` vẫn trả `ok:false`, thiếu “Chưa có file HĐ đã ký”.
- **Nguyên nhân:** intake ghi `intakeAttachments` (`act-intake.js:137`); điều kiện hoa hồng chỉ tìm `contractFiles` (`act-sales.js:37–57`). Không có cầu nối giữa hai nguồn hợp đồng.
- **Hướng xử lý:** thống nhất bản ghi hợp đồng hợp lệ giữa intake, UI-07, kho tài liệu và hoa hồng; phân biệt rõ hợp đồng đã ký với file tham khảo/Excel. Bổ sung test đi từ nhập PDF thật đến điều kiện chi.

### P2-AUD-03 — Trung bình: vận hành có quyền rà soát OCR nhưng nút thực tế bị chặn

- **Yêu cầu:** UAT C-UI08/GĐ-C: vận hành, leader, trưởng phòng được rà soát trong phạm vi; áp dụng vẫn admin/kế toán.
- **Tái hiện UI:** đăng nhập `vanhanh`, mở Kho tài liệu và bấm “Rà soát OCR” trên hợp đồng trong phạm vi.
- **Thực tế:** quyền `ocr.review=true`, `tenants.manage=false`, nút hiện nhưng báo “Bạn không có quyền thực hiện thao tác này”.
- **Nguyên nhân:** `intake-files.js:4,21–22` yêu cầu `tenants.manage` ngay khi mở luồng đọc thật. Quyền mới chưa được tách khỏi quyền ghi hồ sơ.
- **Hướng xử lý:** tách quyền đọc/rà soát và quyền áp dụng; kiểm phạm vi ở mọi thao tác và giữ che thông tin nhạy cảm theo quyền.
- **Ảnh:** `output/phase2-audit-2026-10-01/ops-ocr-blocked.png`.

### P2-AUD-04 — Trung bình: upload/phiên bản mới ở kho tài liệu chưa lưu file gốc

- **Yêu cầu:** UI-26, SRS dòng 379: upload, tải xuống và xem bản cũ; sửa file bằng phiên bản mới.
- **Tái hiện UI:** admin → Kho tài liệu → Tải lên → loại PCCC → tòa T21 → tên `Audit-new-PCCC.pdf` → xác nhận → tải xuống.
- **Thực tế:** form có **0 input chọn file**, chỉ nhập tên. Thông báo “Đã tải lên”, nhưng bản ghi `blobId=null`; tải xuống báo đây là “bản ghi demo cũ, không có file gốc trong trình duyệt” dù vừa tạo. Form phiên bản mới cũng chỉ đổi tên/metadata.
- **Mã liên quan:** `pages/documents.js:7,32–39`; `services/act-documents.js` chỉ ghi metadata.
- **Hướng xử lý:** dùng kho blob hiện có cho upload và mỗi phiên bản; kiểm quyền, định dạng và kích thước. Bản ghi demo thiếu blob cần nhãn riêng, không báo upload thành công khi chưa có dữ liệu file.
- **Ảnh:** `documents-name-only.png`, `documents-new-download-missing.png` trong thư mục bằng chứng.

### P2-AUD-05 — Trung bình: action chốt nhận sale chia trùng ngoài phạm vi

- **Yêu cầu:** SRS §3.6, dòng 340: bộ lọc không cấp thêm quyền; kiểm phạm vi dữ liệu ở truy vấn và thao tác.
- **Tái hiện:** tài khoản `sale` tạo lead của mình, gọi `X.closeDeal` với `saleIds` chỉ chứa sale khác ngoài `salesScope`.
- **Thực tế:** ghi giao dịch và hoa hồng thành công; người vừa chốt không còn nhìn thấy giao dịch do không thuộc saleIds của nó.
- **Nguyên nhân:** `act-sales.js:143` chỉ khử trùng saleIds, chưa kiểm nhân viên tồn tại/đang hoạt động và quyền gán người nhận.
- **Giới hạn tái hiện:** form bình thường đã lọc danh sách sale. Lỗi nằm tại action khi nhận payload ngoài danh sách UI; chưa quan sát việc chọn sale ngoài phạm vi bằng dropdown thông thường.
- **Hướng xử lý:** kiểm toàn bộ saleIds trước mọi mutation, đặt quy tắc gán/chia trùng theo vai trò, bổ sung ca chặn ở mức service.

### P2-AUD-06 — Trung bình: action đổi phòng nhận phòng đã ngừng khai thác

- **Yêu cầu:** UI-19/21 chỉ chốt/chuyển sang phòng còn kinh doanh; quy tắc `Q.rentable` loại phòng `inactive` (`services/q.js:122`).
- **Tái hiện:** có deal chờ nhận hợp lệ; một phòng trống giá >0 được chuyển sang `inactive`; gọi `X.transferDeal` vào phòng đó.
- **Thực tế:** `Q.rentable=false` trước chuyển nhưng action thành công và cập nhật deal/lượt thuê sang phòng ngừng khai thác.
- **Nguyên nhân:** `act-sales.js:207–218` kiểm giá, pending/deal giữ phòng; thiếu kiểm `Q.rentable` vốn có ở chốt mới.
- **Giới hạn tái hiện:** dropdown thông thường dùng `Q.forSale` và lọc phòng ngừng khai thác; lỗi nằm ở service, cũng ảnh hưởng payload chọn phòng đã cũ nếu trạng thái thay đổi trước khi xác nhận.
- **Hướng xử lý:** dùng cùng kiểm tra khả dụng cho chốt và chuyển, thực hiện trước khi ghi các bản ghi liên quan.

## 3. Đánh giá theo nhóm chức năng

| Nhóm Phase 2 | Đánh giá trong phạm vi đã kiểm tra |
|---|---|
| UI-19/20/21 kinh doanh | Có luồng chính và lịch sử; còn P2-AUD-05/06 ở mức action |
| UI-22 hoa hồng | Test tính, duyệt, chi nhiều đợt và đối chiếu T8 đạt; còn tích hợp hợp đồng intake P2-AUD-02 và chính sách chưa chốt |
| UI-47 sửa chữa | Test xác nhận, điều chỉnh, chủ nhà/khách chịu, lương, vật tư và quyết toán đạt; không phát hiện lỗi mới trong các ca đã chạy |
| UI-27,42…46 báo cáo | Test số liệu, phạm vi, drill-down/filter hiện có đạt; công thức có giả định vẫn cần khách xác nhận |
| UI-31/32 chia cổ đông | Test tỷ lệ, khóa/relock, phiên bản và bảng kê đạt; làm tròn/CHUNG, tỷ lệ giữa kỳ còn cần khách chốt |
| UI-08 OCR | Đường mô phỏng đạt; đường đọc thật chưa tương đương nghiệp vụ áp dụng, có P2-AUD-01/03 |
| UI-26 tài liệu | Metadata/phân quyền/phiên bản có; upload và tải file thật chưa hoàn chỉnh ở đường kho tài liệu, P2-AUD-04 |
| UI-38 kỳ nâng cao | Test duyệt kép, phiên chốt, gỡ điều chỉnh khi mở lại đạt trong ứng dụng demo |
| UI-39 Zalo, UI-01 Dashboard | Test các tình huống hiện có đạt; kiểm tra này không xác nhận tích hợp gửi Zalo ngoài ứng dụng |

## 4. Quy tắc chưa được khách xác nhận

Tài liệu UAT mục 3 và 7 vẫn ghi cần chốt:

- OQ-06: nhóm phòng trống, lấp đầy, thời gian trống, tử/mẫu chuyển đổi.
- OQ-08: làm tròn chia cổ đông và dồn chênh vào CHUNG.
- OQ-20/21: thu/chi âm dương điện nước và phân bổ phí combo/dịch vụ.
- OQ-23/25: thu hồi chi phí khách chịu; cơ sở/khung thời gian tính doanh số.
- K-5/6/7: chính sách tỷ lệ hoa hồng, 53 dòng sổ thợ ngoài kỳ, quy trình mở lại kỳ.
- K-11…K-19: tòa ghi marketing khi đổi phòng; bỏ cọc có tính chuyển đổi; tỷ lệ bỏ cọc với đối tác/chia trùng; kỳ lọc hoa hồng; tháng đầu lẻ/tròn; thu hồi hoa hồng; đúng hạn với phòng phá HĐ/phòng mới; dòng sửa chữa chưa xác nhận; tỷ lệ góp thay giữa kỳ.
- GĐ-E1…E6: quyền tải file sale/kỹ thuật, quyết toán ứng chi, phân loại/import hoa hồng, chấp nhận I khác F×H, điện trả qua chủ nhà, vai trò phụ trách Dashboard.

Không suy ra “đúng nghiệp vụ khách đã chốt” từ việc chạy đúng những giả định này.

## 5. Thứ tự hoàn thiện để nghiệm thu

1. Nối đường đọc hợp đồng thật với quyền rà soát và cơ chế áp dụng OCR theo hiệu lực; giữ nguyên số hóa đơn đã phát hành.
2. Nối file hợp đồng intake với điều kiện hoa hồng; test PDF → deal/lượt thuê → cọc + tháng đầu → đủ điều kiện chi.
3. Hoàn thiện lưu/tải blob cho kho tài liệu và phiên bản mới.
4. Bổ sung chặn saleIds ngoài phạm vi, phòng không khai thác và ca không ghi dở dang ở service.
5. Chốt các câu hỏi/giả định với khách; cập nhật SRS/UAT để phân biệt yêu cầu đã chốt và giả định vận hành.
6. Chạy lại test, kịch bản UI và các ca probe mới sau khi sửa. Không dùng 88 ảnh không lỗi JS làm bằng chứng thay thế cho các điều kiện nghiệp vụ nêu trên.

## 6. Bằng chứng và cách chạy lại

- `output/phase2-audit-2026-10-01/action-probes.json`: kết quả action, gồm draft hợp lệ trước sửa, thiếu điều kiện HĐ hoa hồng, chặn thay phí/cọc, gán sale ngoài phạm vi, chuyển vào phòng inactive.
- `output/phase2-audit-2026-10-01/browser-probes.json`: kết quả UI và toast thực tế.
- 3 ảnh UI trong cùng thư mục; log check/verify:p2/smoke/sweep/P0 và verification.json ghi kết quả build/intake.
- Chạy từ thư mục gốc dự án: `node output/phase2-audit-2026-10-01/action-probes.mjs` và `node output/phase2-audit-2026-10-01/browser-probes.mjs`.
- Probe action chạy trong vm seed sạch; probe browser tự mở server cục bộ cổng 9061, context riêng và đóng khi xong. Không gửi tin nhắn ra bên ngoài.
