# TimoHouse — Kịch bản kiểm thử Phase 3

Phiên bản 1.0 · 02/10/2026 · Mốc 3. Căn cứ: [Plan Phase 3](../../Plan-phase3.md), đặc tả §3.9/§4/§7.3 và [bảng đối chiếu ảnh](../UI/Phase3_Doi_chieu_dac_ta_vs_anh_cu.md). Nghiệm thu kỹ thuật trên mockup; các GĐ bên dưới vẫn cần khách xác nhận nghiệp vụ.

## 1. Chạy và dữ liệu

`npm run dev` → `http://localhost:8765`. Xóa thao tác demo trước khi chạy một luồng mới; ngày demo 29/09/2026, kỳ 2026-09, mốc mặc định 3. Mật khẩu bất kỳ. `npm run seed:p3` trích SRC-07/SRC-14 thành seed và fixture, giữ nhãn/công thức/source_ref và ẩn danh cổ đông.

| Tài khoản | Vai trò | Phạm vi Phase 3 |
|---|---|---|
| admin | Admin | Tất cả; duyệt kiểm kê phía admin |
| ketoan | Kế toán | Tài chính, ghi vốn/dự kiến; duyệt phía kế toán |
| vanhanh | Vận hành | Tài sản và bảo dưỡng tòa được giao; không giá trị |
| leader | Trưởng nhóm vận hành | Tài sản/bảo dưỡng nhánh; lập lịch; không ghi vốn |
| truongphong | Trưởng phòng vận hành | Giá trị tài sản, kiểm kê đọc, dự kiến/hiệu quả; không ghi vốn/dự kiến |
| truongkd | Trưởng nhóm KD | Không mở màn Phase 3 về tài sản/tài chính |
| sale | Sale | Không mở màn Phase 3 về tài sản/tài chính |
| kythuat | Kỹ thuật | Tài sản trong phạm vi, hoàn thành bảo dưỡng; không nguyên giá/khấu hao, không lập lịch |
| codong | Cổ đông CD-01 | Chỉ G1, chỉ đọc; giao dịch của mình; UI-40 chỉ xem (không tạo/so sánh/xuất); khách/drill/Excel bị chặn |

## 2. Số nghiệm thu

| Mã | Chỉ tiêu | Kỳ vọng |
|---|---|---|
| NT-0 | Hồi quy Phase 1 | DT T8 7.036.256.236; LNR KD web 779.688.893; lương 98/101; mẫu số 1.382; 1.471 hóa đơn T9 |
| NT-1 | Hoa hồng T8 nguồn | 227.476.935,5 |
| NT-2 | Bảng kê G1 Excel (benchmark) | Vốn 48.000.000; LNG 22.990.932; LNR 14.664.969,25; M 62.664.969,25. Run web khóa M 62.672.849; giữ chênh OQ-04, không sửa benchmark |
| NT-3 | Âm dương điện T7 | Thu 1.234.987.000; chi 913.178.913; chênh +321.808.087 |
| NT-4 | Âm dương nước T6 | Thu 292.728.500; chi 207.782.352; chênh +84.946.148 |
| NT-5 | Sổ thợ 1 T8 | Công 13.300.000; vật tư 8.231.000; lương 24.500.000; trả lại 1.769.000 |
| NT-6 | Sổ thợ 2 T8 | Công 10.050.000; vật tư 13.750.000; lương 21.250.000; công ty trả thêm 3.750.000 |
| NT-7 | Dự kiến T9 như Excel | J5 126.912.000; E4 722.700.000; marketing 361.350.000; KH 0; điều chỉnh +30tr; DT 7.106.329.529; TCP 6.468.533.333; LN 637.796.196; LN/DT 8,98%, LN/GV 11,40% |
| NT-8 | Dự kiến T1 và T8 | T1: KH 640.000; TCP 4.827.748.333; LN 705.406.244. T8: DT 6.757.607.525; TCP 6.034.275.000; LN 723.332.525. Cả 9 sheet nguồn phải khớp |
| NT-9 | Đầu tư ban đầu G1 | Chi 269.906.348; thu 104.919.000; chênh −164.987.348; đã đóng 230.400.000; thực nhận 65.412.652; 8 khoản 38.862.000 tính một lần |
| NT-10 | Hiệu quả T8 như Excel | Tổng LN/GV ≈0,19229; KD ≈0,12987; biên tiền nhà ≈1,22881. G1 web ≈0,23977 / Excel ≈0,23964. LN/tài sản chỉ tòa có số dư nền: G1 = LNR KD / còn lại 8 khoản đầu tư ban đầu (38.862.000 × 84% cuối T8); 17 tòa chỉ có thiết bị mua lẻ T8 → Chờ dữ liệu |
| NT-11 | Khấu hao và thanh lý | T8 566.080; cohort T8 tháng 63 là 283.040. S4 nguồn 3.440.000 → thanh lý T10 3.329.920, tháng sau 0. Ví dụ nguyên giá 1.400.000 → 1.355.200, không thay nguyên giá nguồn |

## 3. Luồng F31–F37

| Mã / vai trò | Thao tác | Kết quả / ca bị chặn | Test / ảnh |
|---|---|---|---|
| F31 · FIN | UI-34, mở thiết bị T8, thêm tài sản công ty kèm chứng từ UI-15; xem lịch KH; thanh lý S4 ngày 15/10 | Nguyên giá và chi chỉ từ chứng từ; KH tháng cuối đúng; thanh lý vào KD dòng 21, tổng giữ nguyên. Chặn kỳ khóa/thiếu chứng từ/đổi số tháng sau khi chốt; preview theo ngày chọn | p3-assets; UI-34, E30, E31 |
| F31.2 · FIN | Chuyển vị trí T5, xem Lịch sử | Giữ tòa/phòng hợp lệ, bắt buộc lý do, có trước/sau; tài sản chủ nhà không chuyển sang tòa khác | p3-assets; E32 |
| F32 · Kỹ thuật/FIN | UI-35, hoàn thành việc quá hạn, nhập ngày/kết quả/đơn vị; xem lần tiếp | Sinh lần dự kiến kế tiếp, không tự sinh chi phí; việc nhập tay không tự lặp. Chi phí ghi kèm: thang máy → bảo trì thang máy (giá vốn dòng 27), thiết bị khác → sửa chữa dòng 41, kế toán chọn lại được. Kỹ thuật không lập lịch hoặc xem số tiền | p3-maintenance; UI-35, E33 |
| F33 · FIN | UI-36 G1 T9, nhập SL/tình trạng/chứng từ, đề xuất sửa danh mục; admin duyệt, đăng nhập ketoan duyệt | Phiên từng tòa tự có, render không ghi; chênh SL khác tình trạng. Một duyệt chưa sửa asset; đủ hai người mới áp, có lịch sử, không chi phí; xuất chênh giữ tình trạng sổ. Chặn tương lai, thiếu lý do, cùng người, đề xuất stale; tài sản có giá trị loại bỏ qua thanh lý UI-34 | p3-inventory; UI-36, E34, E35 |
| F34 · FIN | UI-33 G1, xem lịch, góp phần thiếu CD-03, rút có lý do; UI-32 khóa T8, quay UI-33 chi hai lần | CHUNG 4,8tr/kỳ; T9 CD-03 thiếu, CD-07 chưa góp; T10 sắp hạn. Chưa khóa không chi; không vượt M; hủy có lý do; không vào báo cáo chi phí; khóa lại vẫn trừ các khoản đã chi phiên cũ | p3-capital; UI-33, E36 |
| F34.2 · FIN | Mở Đầu tư ban đầu và Tài sản/cọc | NT-9 đúng; 8 tài sản mua 11/2025, khấu hao web ghi từ 2026-10 (không hồi tố T8/T9), giá trị còn lại vào mẫu số UI-41; cọc G1 48tr phải thu hồi, không vào DT | p3-capital; E37, E38, UI-03A |
| F35 · FIN | UI-40 chọn T9 v1 như Excel, kiểm NT-7; tạo v2, chọn ngày lập và loại trừ G16–G18, sửa gợi ý có lý do; xem phiên bản, tab Kết quả; chọn T8 so thực tế | 24 dòng, 2 kết quả; phạm vi "Trừ G16, G17, G18" làm giảm thu/chi gợi ý và lưu theo phiên bản; 8 chỉ số phụ SRC-14 (tiền nhà, GV, DV, lương, CPPS, HC, TCP, LN /DT); bản web mở mặc định cách tính web; E4 parts cộng đúng; E3 điều chỉnh tính một lần, thành phần J4 không cộng lần hai. Bản cũ/khấu hao snapshot giữ nguyên. Không lý do/điều chỉnh thiếu lý do/ngày sai bị chặn; T9 chưa chốt không có so sánh; không drill tòa | p3-forecast; UI-40, E39, E40 |
| F36 · FIN/TP/Cổ đông | UI-41, KD/Tổng, Excel/web, lọc T/S/G/khu vực/TP, xuất | NT-10; LN/tài sản = LNR kinh doanh / giá trị còn lại, chỉ tòa có số dư nền (UI-37 / đầu tư ban đầu), kể cả khi chọn Báo cáo tổng; thiếu dữ liệu không thành 0; TP theo phân công cuối kỳ. Cổ đông chỉ G1, không lọc quản lý/Excel/drill | p3-efficiency; UI-41, E41 |
| F37 · Admin/Cổ đông | Cài đặt Đối chiếu; đổi mốc 2/3; đăng nhập cổ đông, thử URL UI-33 ngoài scope, UI-40, khách; tạo đợt Zalo nhắc BD | NT-0…11 đạt; cổ đông xem UI-40 không có Tạo/Xuất/So sánh; mốc 2 khóa Phase 3; cổ đông không ghi/tải tài liệu người khác; chỉ chứng từ vốn của mình; cảnh báo ngoài scope. Đợt nhắc BD gửi mô phỏng, việc xong bị bỏ qua | p3-rbac, p3-shareholder, p3-maintenance; F37, E42, E43 |

Ảnh chính/E-frame tại `docs/UI/B07`, `B08`, `B09`; F37 và 8 ảnh responsive 390/1024 tại `output/verify-p3/shots`. Minh chứng tự động tại `output/verify-p3/verification.json`. Chạy `npm run check`, `npm run smoke`, `npm run verify:p0`, `npm run verify:p2`, `npm run sweep`, `npm run verify:p3`. `--publish` chỉ dùng sau khi xem lại ảnh.

## 4. Giả định cần khách xác nhận

| GĐ | Áp dụng trên mockup | Câu hỏi còn mở |
|---|---|---|
| GĐ-P3-01 | Chủ nhà/Công ty; 6 loại TS; mã phòng/chứng từ theo nguồn | Xác nhận danh mục thực tế |
| GĐ-P3-02 | KH theo tháng từng TS, mặc định 63; thanh lý một lần phần còn lại; trả nhà trước hạn = "Trả nhà – thanh lý toàn bộ" tài sản công ty của tòa (UI-34/UI-03) | Xác nhận chính sách OQ-11 |
| GĐ-P3-03 | **Đã chốt 02/10:** 8 khoản G1 khấu hao từ tháng mua; SRC-07 chỉ ghi khoảng 1/10–30/11/2025 nên lấy 11/2025; khấu hao web ghi từ 2026-10, phần trước coi như đã khấu hao ngoài web | Xác nhận ngày mua từng khoản nếu có chứng từ |
| GĐ-P3-04 | Cọc G1 48tr phải thu hồi; tab initial giữ cách thu chi lịch sử Excel | O2: xác nhận 48tr thay seed cũ 96tr |
| GĐ-P3-05 | Tiền thu thanh lý lưu trên hồ sơ, chưa vào doanh thu | O4: xác nhận cách hạch toán |
| GĐ-P3-06 | UI-40 không drill theo tòa, giữ ghi chú phạm vi | O6: nguồn không chia theo tòa |
| GĐ-P3-07 | Phiên kiểm kê từng tòa tự mở; admin + kế toán khác người duyệt; loại bỏ qua kiểm kê → "Đã loại khỏi danh mục" | CH-33 ghi "admin và kế toán nhập/duyệt", còn §1 loại trừ duyệt nhiều cấp: xác nhận cần cả hai hay một trong hai |
| GĐ-P3-08 | Lịch góp suy ra theo UI-05 và tỷ lệ tại hạn, nhắc ≤7 ngày; bỏ các kỳ vốn ban đầu đã chi trả (`coveredTo`, G1 = T1); cổ đông chỉ thấy dòng góp của mình | Xác nhận hạn góp, lịch kỳ thực tế; cổ đông có cần xem dòng góp của người khác cùng tòa không |
| GĐ-P3-09 | M khóa là nghĩa vụ; ghi góp/rút/chi và chứng từ độc lập | Xác nhận xử lý trả dư nếu khóa phiên mới M nhỏ hơn đã chi |
| GĐ-P3-10 | Cổ đông chỉ tòa mình, UI-32 thấy dòng chia của người khác, ẩn SĐT/STK | O1 **đã chốt 02/10:** cổ đông xem UI-40 theo đặc tả (số toàn hệ thống, không tạo/so sánh/xuất); O5: xác nhận quyền xem các dòng UI-32 |
| GĐ-P3-11 | SL bàn giao SRC-10 được suy ra; LN/tài sản chỉ tính khi tòa có số dư nền (import UI-37 hoặc đầu tư ban đầu), tòa chỉ có thiết bị mua lẻ → chờ dữ liệu | Xác nhận SL thực tế và lịch import số dư thiết bị các tòa |

Các quyết định O1–O6 được implement theo giả định của plan; không coi là khách đã xác nhận. ROI/hoàn vốn cổ đông OQ-07 vẫn ngoài phạm vi.

## 5. Kết quả kiểm tra — 02/10/2026

| Kiểm tra | Kết quả | Minh chứng |
|---|---|---|
| `npm run check` | 320/320 test đạt (sau sửa review 02/10); 519 kiểm tra RBAC; cú pháp 111 file JS đạt | output/verify-p3/check.log |
| `npm run smoke` | 36/36 bước đạt | output/verify-p3/smoke.log |
| `npm run verify:p0` | 19/19 đạt, không lỗi trang | output/verify-p3/p0.log |
| `npm run verify:p2` | 88 ảnh, không lỗi trang | output/verify-p3/p2.log |
| `npm run sweep` | 143 route × 9 vai trò = 1.287 lượt; 0 lỗi hiển thị/JS | output/verify-p3/sweep.log |
| `npm run verify:p3` | 62/62 kiểm tra đạt (thêm chỉ số phụ UI-40; cổ đông xem UI-40 chỉ đọc); 0 lỗi trang; 30 ảnh | output/verify-p3/verification.json |
| `npm run build` | Thành công; 350 file | output/verify-p3/build.log |
| Rà soát ảnh | Đã xem 21 ảnh chính/E-frame, ảnh F37 và 8 ảnh responsive 390/1024 | docs/UI/B07…B09; output/verify-p3/shots |

21 ảnh chính/E-frame đã cập nhật vào bộ UI: 4 ảnh UI-33…36 thay ảnh cũ, 17 ảnh mới ở B09. F37 hiển thị đủ 17/17 tiêu chí PASS, gồm NT-7…11. Script browser dùng font dự phòng để nghiệm thu local không phụ thuộc Google Fonts. Log P0/P2 được giữ tại verify-p3; ảnh sinh lại của các phase cũ không đưa vào thay đổi này.

Các kết quả trên thuộc lượt kiểm tra cuối sau khi sửa các điểm lệch của review nghiệp vụ 02/10/2026 (smoke 36/36, P0 19/19, P2 không lỗi trang, sweep 1.287 lượt 0 lỗi); ảnh UI-40, UI-41, E41 đã chụp lại. Chưa tạo commit riêng theo từng đợt P3.
