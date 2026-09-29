# TimoHouse — Phân chia 3 phase triển khai

Ngày lập: 29/09/2026 · Trạng thái: **đề xuất, chờ PM/khách duyệt** · Nguồn: §7 của `TimoHouse_Dac_ta_man_hinh_web_va_luong_nghiep_vu_v1.md` (Draft v1.9).

Mã `UI-xx` là mã màn hình trong đặc tả; `OQ-xx` là câu hỏi mở ở §5 của đặc tả, mỗi câu có một giả định làm việc (GĐ) đang áp dụng. Tổng cộng 47 màn hình, mỗi màn thuộc đúng một phase; một số màn làm bản cơ bản trước và mở rộng ở phase sau.

## 1. Nguyên tắc chia

1. **Phase 1** thay các file Excel khách dùng hằng ngày và khi chốt tháng: hóa đơn – thu tiền, bảng lương, báo cáo theo tòa và báo cáo tổng/kinh doanh gộp các tòa. Phase 1 có hai mốc: **1A go-live hóa đơn – thu tiền**, **1B chốt tháng** (lương, phân bổ, báo cáo).
2. **Phase 2** thay các file còn lại (hoa hồng, chia cổ đông, âm dương điện nước, sổ sửa chữa) và thêm các báo cáo vận hành, kinh doanh.
3. **Phase 3** là kế hoạch lợi nhuận, hiệu quả đầu tư và quản lý tài sản.
4. Phase sau chỉ đọc dữ liệu phase trước, không nhập lại. Mỗi phase nghiệm thu bằng số liệu Excel thật của khách.

| Phase | Số màn | Thay file Excel của khách |
|---|---|---|
| Phase 1 – mốc 1A | 22 | Hóa đơn tiền nhà và dịch vụ tháng |
| Phase 1 – mốc 1B | thêm 6 | Bảng lương; báo cáo kinh doanh (tổng, kinh doanh, theo tòa); phần phân bổ của G1 |
| Phase 2 | 13 | Hoa hồng; chia cổ đông G1; âm dương điện nước; sổ sửa chữa |
| Phase 3 | 6 | Bảng dự kiến lợi nhuận |

## 2. Phase 1 — Vận hành cho thuê, thu tiền, lương, chi phí và báo cáo kết quả

### 2.1. Mốc 1A — Go-live hóa đơn và thu tiền (22 màn)

Mục tiêu: bỏ được file hóa đơn tháng.

| Nhóm | Màn hình | Chức năng | Để lại sau |
|---|---|---|---|
| Nền tảng | UI-37, UI-38 | Tài khoản, phân quyền (admin, kế toán, quản lý/vận hành, leader chỉ xem trạng thái nợ, trưởng phòng xem báo cáo); danh mục tòa T/S/G, loại phí, nhóm dòng báo cáo, kỳ, tham số giả định có ngày hiệu lực. Import tòa, phòng, khách, hợp đồng đang hiệu lực, cọc đang giữ, công nợ đầu kỳ, chỉ số kỳ trước, nhân viên, danh sách thiết bị đã mua | Import bảng kê thu, lịch sử hoa hồng (Phase 2) |
| Tòa nhà, chủ nhà | UI-02, UI-03, UI-04, UI-05 | Danh sách và chi tiết tòa; tab phòng (loại khai thác, phòng chủ nhà ở); mã nhà cung cấp điện/nước/mạng theo tòa; chủ nhà và hợp đồng đầu vào có giá thuê theo hiệu lực, cọc chủ nhà; lịch trả tiền nhà | Tab tài sản (Phase 3) |
| Khách, hợp đồng | UI-06, UI-07, UI-08, UI-09 | Khách và lượt thuê; **lượt thuê chờ nhận có cọc**; ngày chốt, ngày tính tiền phòng, ngày bắt đầu dịch vụ; 5 loại kết thúc (hết hạn, phá HĐ, bỏ trốn, bỏ cọc, chuyển phòng); upload file hợp đồng; biểu phí theo hợp đồng | OCR (Phase 2); lead/deal (Phase 2) |
| Nhân sự tối thiểu | UI-23, UI-24 | Danh sách nhân viên; **phân công tòa/phòng có ngày hiệu lực từ ngày go-live** để phân quyền và làm lịch sử người phụ trách cho bảng lương | Hồ sơ lương, cơ cấu leader/team (1B) |
| Chi phí cơ bản | UI-15 | Ghi chi tiền thuê trả chủ nhà, chi hoàn cọc, các khoản chi lẻ; mỗi khoản gắn tòa hoặc quỹ chung và dòng báo cáo ngay từ đầu | Import nhà cung cấp, hoa hồng, thiết bị, quỹ văn phòng (1B) |
| Hóa đơn | UI-10, UI-11, UI-12 | Chỉ số điện nước (gồm điện chung, phòng trống), số người, số xe; tạo kỳ hàng loạt; tính tháng lẻ theo số ngày thực của tháng; dòng “Thu khác”; 4 mẫu in theo tòa và tài khoản nhận; nháp → phát hành → PDF | — |
| Thu tiền, công nợ | UI-13, UI-14 | Phiếu thu thủ công (có loại cọc mới, thu một phần, trả trước nhiều tháng); lưu **ngày thu thực tế** và phân bổ theo từng dòng hóa đơn; trạng thái Chưa TT / Thiếu / Đủ / Thừa (phân bổ không vượt số còn phải thu, tiền dư là trả trước nên hóa đơn hiện Đủ; Thừa chỉ từ import hoặc kế toán xác nhận); phiếu cọc giữ phòng ghi sổ cọc, không phân bổ vào hóa đơn; công nợ tính từ ngày 6 | — |
| Hoàn cọc, phá HĐ | UI-17, UI-18 | Phiếu tính hoàn cọc (khấu hao mặc định 200.000đ/phòng, sửa chữa/vệ sinh thực tế), admin và kế toán duyệt, ghi chi hoàn; phá HĐ/bỏ trốn giữ cọc và thu tiền điện | — |
| Zalo | UI-39 | Zalo ZNS gửi hóa đơn đã phát hành, nhắc trước hạn và quá hạn, kiểm tra lại số nợ trước khi gửi, log, gửi lại tin lỗi, dự phòng SMS/gọi | Đồng bộ hội thoại, sự kiện khác (Phase 2, 3) |
| Dashboard | UI-01 | Phòng trống 3 loại (ở luôn, cuối tháng, đang chờ); phải thu, đã thu, còn nợ theo ngày; hợp đồng sắp hết hạn; tin Zalo lỗi; hoàn cọc đang xử lý | HS, lọc leader nâng cao (Phase 2) |

**Nghiệm thu 1A** trên dữ liệu hóa đơn tháng 9/2026:

- **1.471 hóa đơn** kỳ 9/2026 (1.409 dòng NHÀ T/S/G + 40 hóa đơn G16–G18 + 22 PHÒNG MỚI THÁNG 9) có tổng in 13 dòng = tổng cần đóng.
- **9 hóa đơn** Excel ghi “Tổng cần đóng” khác tổng 13 dòng (ô gõ số cứng hoặc công thức bỏ sót khoản): 102T20A002, 103T25A001, 101S8A001, 103S22A001, 201S38A002, 101G4A001, 302G6A001, 301G7A002, 601G16A001. Web thu theo 13 dòng và gắn cờ “lệch Excel nguồn” (ví dụ 103T25: Excel 2.120.000, 13 dòng 2.888.000 vì Excel bỏ sót tiền điện 768.000).
- Tháng lẻ: 22 hóa đơn PHÒNG MỚI THÁNG 9 chia theo số ngày thực của tháng (tính cả ngày vào); 13 dòng “Thu khác” kỳ 9 (gồm 403T20: 6 ngày tháng 8, còn thiếu 892đ); 3 ngoại lệ Excel được gắn cờ: 304T35 (Excel tính 22 ngày, đúng là 24), 101G18 (chia ngày trong đơn giá: 4.900.000/31 × 16 trong tháng 9) và 404S4 (hệ số 0,5378 thay vì 23/30).
- 20 phòng phá HĐ; hoàn cọc 301T41.
- Tổng phòng mới 126.912.000.
- 4 mẫu in ra đúng tài khoản nhận.

Ghi chú (sửa v1.9): con số 1.383 cũ là số dòng NHÀ T/S/G có mã phòng, AV > 0 và cột K là số (gồm 20 dòng phá HĐ); “18/1.383 lệch” cũ so 12 dòng của mẫu in Excel với AV, không phải 13 dòng web. Con số “106 ca tháng lẻ” cũ bỏ: file Excel có 300 ô công thức chia ngày trên 242 dòng, rải nhiều tháng; không cách lọc nào ra đúng 106.

### 2.2. Mốc 1B — Chốt tháng: lương, chi phí, báo cáo (thêm 6 màn)

| Nhóm | Màn hình | Chức năng | Để lại sau |
|---|---|---|---|
| Nhân sự, tổ chức | UI-23, UI-24 (mở rộng) | Hồ sơ nhân viên (chức danh, ngày vào làm để tính thâm niên, lương cứng, phụ cấp); cơ cấu tổ chức leader/team theo hiệu lực | — |
| Bảng lương | **UI-25** | Lương nhân viên vận hành theo HS và các mốc thu 5/10/15, bậc lương cận gần nhất, thâm niên, tòa mới 100.000đ/phòng; lương trưởng phòng/trưởng nhóm 10.000đ × số phòng; sale = lương cứng × ngày công / 26 + phụ cấp; kế toán, quản lý tổng, bảo vệ, vệ sinh theo tòa; thợ sửa chữa = phần cố định + tiền công nhập tay; kết quả lương gắn theo tòa; chốt bảng lương và ghi chi | Tiền công thợ lấy tự động từ sổ sửa chữa (Phase 2) |
| Chi phí | UI-15 (mở rộng) | Import hóa đơn nhà cung cấp điện/nước/mạng/rác/môi trường/thang máy theo tòa; hoa hồng import theo phòng vào dòng Phí marketing; sửa chữa/vật tư theo tòa; mua sắm thiết bị có thời gian khấu hao; chi phí văn phòng và quỹ marketing vào quỹ chung | Tính hoa hồng tự động, sổ sửa chữa (Phase 2) |
| Phân bổ | **UI-16** | Quỹ chung / tổng số phòng hệ thống của kỳ × số phòng của tòa (+ phụ phí/phòng nếu có — phụ phí và phần cố định/tòa chỉ để tái hiện Excel ở kỳ chạy song song; kỳ web tự chốt mọi khoản phân bổ phải có chứng từ quỹ), cho lương quản lý tổng, trưởng phòng, phó phòng, nhân viên nguồn, NVKD, kế toán, sửa chữa, thuê và dịch vụ văn phòng, quỹ marketing; chốt phiên bản phân bổ | — |
| Chốt kỳ cơ bản | UI-38 | Khóa kỳ sau khi chốt lương, phân bổ, báo cáo; số báo cáo được chốt (ảnh chụp), sau khóa chặn mọi thao tác ghi trong kỳ; sửa bằng dòng điều chỉnh (tòa × dòng báo cáo, bắt buộc lý do) cộng vào báo cáo kỳ gốc | Quản lý kỳ nâng cao (Phase 2) |
| Báo cáo | **UI-27, UI-28, UI-29, UI-30** | **Báo cáo theo tòa**: mỗi cột một tòa như mẫu `BC DT NHÀ T/S/G` và G1. **Báo cáo tổng (LN dòng tiền)** và **Báo cáo kinh doanh** gộp các tòa: cột TỔNG, NHÀ T, NHÀ S, NHÀ G. Lọc theo kỳ, tòa, nhóm T/S/G, khu vực, quản lý; click số xem giao dịch gốc; xuất theo mẫu Excel | Các báo cáo khác (Phase 2, 3) |

**Nghiệm thu 1B** trên số liệu tháng 8/2026:

- Bảng lương khớp 98/101 dòng tòa của file lương tháng 8; 3 dòng lệch là lỗi nguồn Excel (S39 dùng sai cận – V51; S28, S36 dùng bảng thâm niên khác các tòa còn lại của cùng nhân viên).
- Phân bổ khớp G1 với mẫu số 1.382 phòng.
- Báo cáo tòa G1 khớp file G1 và cột tòa của báo cáo kinh doanh tháng 8.
- Báo cáo tổng: sheet Excel ghi doanh thu **7.036.256.236**, tổng chi phí **6.013.857.267**, lợi nhuận ròng **1.022.398.969**.
- Trên số web: doanh thu **7.036.256.236** và giá vốn **5.316.928.772** khớp tuyệt đối; tổng chi phí web **6.024.500.037**, lệch **10.642.770** = **10.405.700** (3 tòa G12A/G13/G14, 39 phòng, có trong bảng lương và mẫu số 1.382 nhưng không có cột trong báo cáo Excel – cần khách chốt) + **181.553** (lương quản lý: 3 dòng lỗi nguồn bảng lương S39, S28, S36) + **55.517** (12 ô phân bổ trong sheet tòa Excel khác công thức chung: T5, T12, T32, S1 ×2, S3, S30, S31, S32, S40, G1, G3); không còn khoản chưa giải thích.
- **Tiêu chí nghiệm thu:** số web khớp doanh thu, giá vốn và chênh chi phí được giải thích hết. Số 6.013.857.267 chỉ đạt khi khách chốt loại 3 tòa khỏi kỳ 8 và xác nhận 12 ô là lỗi nguồn.
- Báo cáo kinh doanh (GĐ OQ-10): lợi nhuận ròng web **779.688.893** = 790.331.663 − 10.642.770; **790.331.663** là OQ-10 áp trên số Excel; sheet Excel ghi **685.928.969**. Cầu nối trong web tính trên số web.
- Lương và báo cáo chạy song song với Excel 1–2 kỳ trước khi bỏ file.

**Điều kiện chạy thật 1B:** kỳ đầu tiên web tự chốt là **tháng đầy đủ đầu tiên sau go-live 1A**, vì lương cần tiền thu từ ngày 1 qua các mốc 5/10/15 đều nằm trên web. Kỳ trước đó nhập số dư: công nợ, cọc đang giữ, thiết bị đã mua.

### 2.3. Kiểm tra đủ dữ liệu cho báo cáo tòa và báo cáo gộp ở Phase 1

Đối chiếu từng dòng của Báo cáo tổng tháng 8 và báo cáo tòa G1. Báo cáo kinh doanh dùng cùng các dòng, chỉ khác công thức ở dòng 3 (doanh thu) và dòng 21 (thiết bị).

| Dòng báo cáo | Cách tính trong Excel | Màn hình nguồn Phase 1 |
|---|---|---|
| 3 Tổng doanh thu | Tổng đã đóng trên hóa đơn − hoàn cọc | UI-13, UI-18 |
| 4 Cọc phòng mới | Cột cọc của sheet nhà/phòng mới | UI-13 phiếu thu loại cọc, gắn lượt thuê chờ nhận UI-07 |
| 5 Cọc khách bỏ không ở | Cọc của khách bỏ | UI-07 loại kết thúc “bỏ cọc” |
| 6 Hoàn cọc | Sheet hoàn cọc | UI-18 |
| 7–9 Số phòng phá HĐ / mới / trống | Đếm theo sheet | UI-07, UI-03 |
| 10 Doanh thu tiền phòng | Phải thu − phòng phá HĐ + tháng lẻ phòng mới | UI-12 |
| 11–18 Doanh thu dịch vụ | Cột hóa đơn; điện gồm điện chung và điện trừ cọc; combo chia đôi vệ sinh/máy giặt | UI-10, UI-12, UI-18 |
| 20 Tiền thuê nhà 1 tháng | Giá hợp đồng chủ nhà | UI-04 |
| 21 Mua sắm thiết bị | Nguyên giá (Báo cáo tổng); khấu hao kỳ (Báo cáo kinh doanh) | UI-15 + danh sách thiết bị import |
| 22–27 Giá gốc dịch vụ | Hóa đơn nhà cung cấp theo tòa | UI-15 |
| 29 Lương quản lý | Lương nhân viên vận hành theo tòa | UI-25 |
| 30–34, 36–37 Lương QL tổng, TPVH, TNVH, nhân viên nguồn, NVKD, kế toán, sửa chữa | Quỹ / 1.382 × số phòng tòa (+ 10.000đ/phòng) | UI-25 → UI-16 |
| 35, 38 Lương vệ sinh, bảo vệ | Nhập theo tòa | UI-25 |
| 39 Thuê và DV văn phòng | Chi phí văn phòng / 1.382 × số phòng | UI-15 → UI-16 |
| 40 Phí marketing | Quỹ marketing phân bổ + hoa hồng theo phòng | UI-15 → UI-16 |
| 41 Sửa chữa, thay thế, bảo trì | Chi theo phòng của tòa | UI-15 |
| 42 Chi phí khác | Nhập theo tòa | UI-15 |
| 28, 43–61 Giá vốn, chi phí bán hàng, lợi nhuận, các tỷ lệ | Công thức trong sheet | Tính từ các dòng trên |

Để làm được hai báo cáo này, ngoài nhân sự, tổ chức, bảng lương và chi phí, Phase 1 còn phải có:

1. **Phân bổ chi phí chung (UI-16):** 9 trên 14 dòng chi phí vận hành/bán hàng (dòng 29–42) của báo cáo tòa được tính bằng phân bổ theo số phòng. Thiếu phần này thì báo cáo gộp vẫn đúng tổng nhưng báo cáo tòa sai.
2. **Các màn báo cáo** UI-27, UI-28, UI-29, UI-30.
3. **Lượt thuê chờ nhận có cọc và loại kết thúc “bỏ cọc”**, thay cho module Kinh doanh khi chưa có.
4. **Hoa hồng import kèm phòng/tòa.**
5. **Import danh sách thiết bị đã mua trước go-live** để tính khấu hao cho Báo cáo kinh doanh.
6. **Dữ liệu nhập tay cho bảng lương:** ngày công sale, lương vệ sinh theo tòa, tiền công thợ sửa chữa, phụ cấp, ngày vào làm.
7. **Chốt kỳ cơ bản.**

## 3. Phase 2 — Kinh doanh, hoa hồng, chia cổ đông và báo cáo vận hành (13 màn)

| Nhóm | Màn hình | Chức năng |
|---|---|---|
| Kinh doanh | UI-19, UI-20, UI-21, UI-22 | Tổng quan hàng hóa và phòng trống cho sale; khách xem; deal chốt (thay lượt thuê chờ nhận của Phase 1, liên kết lượt thuê khi khách vào ở); **tính hoa hồng tự động** (chia trùng 25%/16,67%, điều kiện chi) thay file import |
| OCR | UI-08 (mở rộng) | Đọc hợp đồng khách tự động, màn rà soát trường, cảnh báo độ tin cậy |
| Sửa chữa | UI-47 | Sổ sửa chữa và ứng chi vật tư theo thợ, kỳ 26 → 25; tiền công tự vào bảng lương, vật tư tự vào chi phí |
| Báo cáo | UI-27 (đầy đủ), UI-42 → UI-46 | Trung tâm báo cáo 4 nhóm; chi phí giá vốn/cố định/phát sinh; âm dương điện nước; chi phí sửa chữa, vệ sinh; HS thực tế/tạm tính, lấp đầy, thời gian trống, đóng đúng hạn/quá hạn, phân khúc khách; khách hàng, tỷ lệ chuyển đổi, doanh số sale |
| Chia cổ đông hằng tháng | UI-31, UI-32 | Cổ đông và tỷ lệ góp theo tòa; bảng kê chia lãi G1 lấy từ báo cáo tòa |
| Tài liệu | UI-26 | Kho tra cứu tài liệu gắn tòa, phòng, khách, hợp đồng |
| Mở rộng | UI-01, UI-38, UI-39 | Dashboard thêm HS, lọc leader; quản lý kỳ nâng cao; hộp thư phản hồi Zalo đồng bộ về trưởng phòng, sự kiện sắp hết hợp đồng và đã hoàn cọc |

**Nghiệm thu:** file hoa hồng; chia cổ đông G1; âm dương nước tháng 6 và điện tháng 7; sổ sửa chữa tháng 8.

## 4. Phase 3 — Kế hoạch, hiệu quả đầu tư và tài sản (6 màn)

| Nhóm | Màn hình | Chức năng |
|---|---|---|
| Tài sản, bảo dưỡng | UI-34, UI-35, UI-36 | Danh mục tài sản/thiết bị theo tòa, phòng (nhận danh sách đã import ở Phase 1); khấu hao từng tài sản, thanh lý; lịch bảo dưỡng và kết quả; kiểm kê do admin và kế toán duyệt |
| Dự kiến lợi nhuận | UI-40 | Hai bản dự kiến: dòng tiền (có cọc mới, hoàn cọc, mua sắm thiết bị) và kinh doanh (không có các khoản đó, thiết bị khấu hao 1,6%/tháng); gợi ý số từ tháng trước; so sánh với thực tế khi chốt kỳ |
| Hiệu quả | UI-41 | Lợi nhuận/vốn, lợi nhuận/tài sản, biên lợi nhuận tiền nhà |
| Cổ đông, đầu tư | UI-33 | Lịch góp vốn, tiền cọc chủ nhà, tài sản và chi thực cho cổ đông; tài khoản cổ đông chỉ xem báo cáo của các tòa mình góp vốn |

**Nghiệm thu:** bảng dự kiến lợi nhuận tháng 9/2026 (tổng phòng mới 126.912.000, marketing = cọc mới / 2, khấu hao 1,6%).

UI-40 có thể kéo lên Phase 2 nếu khách cần sớm, vì dữ liệu đầu vào đã đủ sau Phase 1.

## 5. Giả định cần khách xác nhận trước mỗi mốc

| Trước | Câu hỏi | Nội dung chính |
|---|---|---|
| 1A | OQ-03, 09, 12, 14, 15, 16 | Phá HĐ chỉ thu tiền điện; leader chỉ xem trạng thái nợ; công nợ từ ngày 6; phòng không có giá thuê; phí xe điện; không trừ tiền ngày ở thêm vào cọc |
| 1B | OQ-01, 02, 04, 05, **10**, 11, 13, 18, 22 | Quy tắc bậc lương; thu sau ngày 15; mẫu số phân bổ; công thức Báo cáo kinh doanh; khấu hao 1,6% cộng dồn; kỳ ghi nhận hoa hồng; HS báo cáo; lương sửa chữa |
| Phase 2 | OQ-06, 08, 20, 21, 23, 25 | Định nghĩa phòng trống, lấp đầy; làm tròn chia cổ đông; âm dương điện nước; sổ vệ sinh; doanh số sale |
| Phase 3 | OQ-07, 11 (thanh lý), 19, 24 | Dự kiến dòng tiền; LN/vốn, LN/tài sản |

**OQ-10 cần chốt sớm nhất:** theo giả định, lợi nhuận ròng Báo cáo kinh doanh tháng 8 là 790 triệu trên số Excel (có cộng lại hoàn cọc và tính khấu hao), 780 triệu trên số web (779.688.893, sau chênh chi phí 10.642.770), trong khi file Excel ghi 686 triệu. Cùng lúc cần khách chốt 3 tòa G12A/G13/G14 có thuộc kỳ 8 không.

## 6. Khác với `00_SCOPE_3_PHASE.md` và phần ngoài phạm vi

| Nội dung | Bản cũ | Bản này | Lý do |
|---|---|---|---|
| Nhân sự, cơ cấu tổ chức, bảng lương | Phase 3 | Phase 1 (1B) | Yêu cầu làm báo cáo ở Phase 1; lương chiếm 9 dòng chi phí của báo cáo |
| Phân bổ chi phí, báo cáo lợi nhuận, quản lý kỳ | Phase 2 | Phase 1 (1B), trung tâm báo cáo đầy đủ ở Phase 2 | Báo cáo tòa cần phân bổ theo số phòng |
| Chia cổ đông G1 | Phase 3 | Phase 2; góp vốn ở Phase 3 | Chia hằng tháng từ báo cáo tòa đã có ở Phase 1 |
| Hoa hồng | Phase 2 | Phase 1 import như chi phí; tính tự động ở Phase 2 | Quyết định ngày 27/09 |
| Bảo trì, bảo dưỡng | Phase 2 | Sổ sửa chữa Phase 2; bảo dưỡng định kỳ Phase 3 | Lịch bảo dưỡng cần danh mục thiết bị |
| Kanban lead, đặt lịch xem phòng, giữ chỗ tự hết hạn | Phase 2 | Ngoài phạm vi | Khách chưa yêu cầu trong tài liệu; cần xác nhận nếu muốn thêm |
| Thanh toán QR, đối soát ngân hàng, BI, KPI/chấm công | Phase 3 | Ngoài phạm vi | Khách chưa yêu cầu; báo giá riêng nếu cần |

## 7. Lưu ý triển khai

- Phase 1 chiếm phần lớn khối lượng vì chứa cả hai phần tính toán khó nhất là hóa đơn và lương. Nên chia đội làm song song 1A và 1B.
- 1B phải xong chậm nhất vào cuối tháng đầy đủ đầu tiên sau go-live 1A.
- Từ ngày go-live 1A phải lưu đủ ngày thu thực tế, phân công có ngày hiệu lực, chi phí gắn tòa và dòng báo cáo. Nếu thiếu, lương và báo cáo ở 1B không tính được và phải nhập lại.
