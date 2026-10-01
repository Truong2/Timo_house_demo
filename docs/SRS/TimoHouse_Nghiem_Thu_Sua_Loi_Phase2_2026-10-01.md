# Nghiệm thu sửa 6 lỗi Phase 2 — 01/10/2026

**Phạm vi:** kế hoạch `TimoHouse_Plan_Sua_Loi_Phase2_2026-10-01.md`, các lỗi P2-AUD-01…06 tại commit gốc `fe94bc5`. Đã triển khai trên workspace; bản build ở `dist/`.

## Kết quả thay đổi

| Lỗi | Hành vi sau sửa | Bằng chứng hồi quy |
|---|---|---|
| P2-AUD-01 | OCR tại lượt thuê/kho tài liệu mở phiên đọc bản gốc trên route `/ocr/:id`. Preview PDF/ảnh và trường nguồn đặt cạnh form. Rà đủ nhóm, so sánh, chọn hiệu lực và xác nhận để áp dụng qua cùng biên transaction. Phí 0, không thu và giữ nguyên tách riêng; giữ số lượng phí; hóa đơn, sổ cọc và tiền thực thu không đổi. | Test real apply, khóa kỳ, nguồn sai, lỗi giữa transaction, áp lặp; UI click đọc/rà soát/áp dụng thật. |
| P2-AUD-02 | Intake và UI-07 đăng ký hợp đồng vào cùng registry; selector hoa hồng đọc nguồn cũ và mới. PDF/ảnh phải được xác nhận đã ký; Excel/file bổ trợ không mở điều kiện chi. Khử trùng theo lượt thuê + blob/hash và không tạo thu/chi khi gắn file. | Test intake commit vào deal đã thu đủ; thiếu HĐ vẫn bị chặn; không lùi ngày đủ điều kiện theo ngày ký nguồn; kiểm nguồn cũ và chống trùng. |
| P2-AUD-03 | Vận hành, leader và trưởng phòng rà soát trong phạm vi bằng `ocr.review`; người có `rates.manage` áp dụng. Đọc blob kiểm quyền sau thao tác bất đồng bộ; thay quyền/phạm vi không giữ workspace có quyền cũ. | Service và UI cho 3 vai trò; direct URL, sửa phiên và đọc blob ngoài phạm vi bị chặn. |
| P2-AUD-04 | Kho tài liệu và chứng từ góp vốn chọn file thật, lưu blob rồi ghi metadata trong transaction. V1/v2 có bản gốc riêng, drawer lịch sử tải được từng bản. Nhật ký tải ghi sau khi truy xuất file. Bản demo thiếu file báo đúng trạng thái. | V1/v2 tải khớp từng byte sau reload; sale/kỹ thuật tải đúng tài liệu được phép; lỗi ghi không làm mất phiên bản cũ. |
| P2-AUD-05 | Chốt deal kiểm mọi sale: tồn tại, đúng nhân sự sale, đang hoạt động và trong phạm vi; khử trùng, từ chối tập rỗng/payload sai. Dropdown đồng chốt theo cùng phạm vi. | Payload sale lạ/ngừng làm/ngoài team/tập rỗng bị chặn, toàn bộ dữ liệu giữ nguyên. |
| P2-AUD-06 | Chốt và chuyển dùng cùng kiểm tra khả dụng tại lúc xác nhận; phòng inactive, đã có khách chờ/deal giữ phòng đều bị chặn. | So sánh toàn bộ state trước/sau ca bị chặn; các ca chuyển hợp lệ hiện có vẫn PASS. |

Khôi phục đúng file theo hash giữ nguyên phiên và trường đã sửa; nguồn mới tạo phiên mới. Hủy đọc bỏ qua kết quả trả về muộn. Đổi trường/lựa chọn phí hủy xác nhận nhóm và xác nhận cuối; giá trị sai có lỗi tại trường, link về bước sửa và khóa CTA. Upload và xác nhận được khóa khi đang xử lý.

## Kiểm thử thực hiện

| Lệnh | Kết quả |
|---|---|
| `npm run check` | 90 JS hợp lệ; 442 kiểm tra RBAC; **275/275 test PASS**, gồm 9 ca hồi quy mới. |
| `npm run build` | Thành công, 329 file trong dist. |
| `npm run smoke` | **36/36 PASS**. |
| `node scripts/verify-p0.mjs --label=phase2-fixes` | **19/19 PASS**, không lỗi trang. |
| `npm run sweep` | **117 route × 8 tài khoản**, 0 lỗi hiển thị, 0 lỗi JS. |
| `npm run verify:p2` | 88 ảnh, không lỗi JS trang. |
| `node scripts/verify-intake.mjs` | PDF thật, ảnh OCR, XLSX, chủ nhà/tòa/30 phòng, lượt thuê/đề xuất thu, mở lại file gốc PASS. |
| `node scripts/verify-intake-modes.mjs` | Nhập tay, XLSX/CSV, phòng/lượt thuê và lịch trả 4 tháng PASS. |
| `npm run verify:intake:ui` | Danh sách chủ nhà, bộ lọc, paging, nháp, gộp nguồn, xung đột, thiếu file, hủy đọc, phân quyền PASS; 24 ảnh responsive không tràn ngang. |
| `npm run verify:p2:fixes` | OCR thật sửa cọc/phí, phân quyền, tải đúng byte v1/v2, khôi phục file giữ chỉnh sửa, hủy đọc muộn PASS; 8 ảnh OCR/upload tài liệu, 0 lỗi JS. |

Ảnh đối chiếu ở **1600×1000, 1440×1000, 1024×768, 390×844**. Preview/form xếp dọc dưới 1100 px; bảng cuộn trong vùng nội dung; không tràn trang; footer không che trường. Đã kiểm tra trực quan ảnh desktop/mobile.

Bằng chứng: [check](../../output/phase2-fixes-2026-10-01/check.log), [build](../../output/phase2-fixes-2026-10-01/build.log), [UI assertions](../../output/phase2-fixes-2026-10-01/verification.json), [P0](../../output/verify-p0/phase2-fixes.json), [ảnh](../../output/phase2-fixes-2026-10-01/shots/).

Ba fixture hồi quy cũ được bổ sung saleId của nhân sự sale đang hoạt động thay vì mặc định người admin tạo lead. Các assertion nghiệp vụ, seed và golden đối chiếu NT-0…NT-6 giữ nguyên.

## Giới hạn nghiệm thu

**Đã sửa 6 lỗi kỹ thuật và đạt bộ kiểm thử theo giả định hiện tại.** Chưa chuyển K-11…K-19/GĐ-E1…E6 thành quy tắc khách đã phê duyệt. Tài liệu gốc vẫn ở IndexedDB của trình duyệt theo kiến trúc hiện tại; không bổ sung API hoặc migration.
