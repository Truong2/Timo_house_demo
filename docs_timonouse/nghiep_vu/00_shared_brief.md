# 0. Quy ước, thuật ngữ và quy tắc chuẩn dùng chung (Shared Brief)

> File này là **nguồn sự thật dùng chung** cho mọi chương của bản nghiệp vụ TimoHouse Phase 1. Người viết chương khác **không định nghĩa lại** bất kỳ thuật ngữ, rule, công thức nào ở đây — chỉ tham chiếu bằng mã (D-xx, R-xx, F-xx, P-xx, X-xx). Khi phát hiện mâu thuẫn: thứ tự ưu tiên nguồn là **answer.md §H > answer.md §A–G > clarification-checklist.md > spec v1.8**.

## 0.1. Mẫu mô tả module (bắt buộc cho mọi module)

| Nhóm | Nội dung |
|---|---|
| **Mục tiêu** | Module giải quyết nghiệp vụ gì |
| **Tác nhân** | Vai trò sử dụng / phê duyệt |
| **Dữ liệu** | Trường chính cần lưu/hiển thị (kèm bảng cột sổ Excel tương ứng nếu có) |
| **Search / Filter** | Điều kiện tìm kiếm, phạm vi dữ liệu theo vai trò |
| **Action** | Thao tác người dùng |
| **Business Rule** | Quy tắc bắt buộc — **mỗi rule 1 dòng, có mã BR-x.y.z và nhãn tin cậy** |
| **State / Status** | Trạng thái và điều kiện chuyển |
| **Flow** | Luồng chính + ngoại lệ (mermaid nếu ≥ 4 bước) |
| **Liên kết** | Module khác đọc/ghi gì |
| **Audit / Notification** | Nhật ký, cảnh báo |
| **Nghiệm thu** | Điều kiện tối thiểu để coi là xong |

Nhãn tin cậy (gắn cuối mỗi rule/công thức):
- **[Đã chốt]** — khách hàng đã trả lời bằng văn bản (answer.md, workbook câu hỏi, file "Câu hỏi làm rõ" 06/09).
- **[Có bằng chứng nguồn]** — đọc trực tiếp từ ô công thức / số liệu trong file Excel của công ty.
- **[Cần chốt]** — giả định của bên phát triển theo thông lệ kế toán / vận hành; liệt kê trong bảng P-xx.

## 0.2. Quy ước đánh số

| Loại | Dạng | Ghi chú |
|---|---|---|
| Chương | 0–6 | 0 Quy ước · 1 Tổng quan quy trình · 2 Vận hành thuê · 3 Nội bộ & lương · 4 Chi phí, hoa hồng, cổ đông, khấu hao · 5 Báo cáo · 6 Phụ lục |
| Module | `M-2.07` | chương.thứ tự |
| Business rule của module | `BR-2.07.3` | |
| Rule dùng chung | `R-01`… | định nghĩa duy nhất tại §0.4 |
| Định nghĩa | `D-01`…`D-58` | giữ số của clarification-checklist; mới từ `D-59` |
| Công thức | `F-01`…`F-56` | giữ số checklist; mới từ `F-57` |
| Metric | `UPPER_SNAKE` | theo spec §12.23.3 / §12.23.6 (danh sách §0.5) |
| Tham số chờ chốt | `P-01`…`P-29` | dãy duy nhất; tóm tắt §0.8, đầy đủ §6.1 |
| Ngoài phạm vi | `X-01`…`X-08` | bảng §0.9, chi tiết §6.2 |
| Heading | `## 2.7 Hóa đơn` / `### 2.7.6 Business Rule` | |

Ma trận sở hữu (file nào được định nghĩa gì):

| File | Chương | Sở hữu |
|---|---|---|
| `01_tong_quan_quy_trinh.md` | 1 + khung 6 | Phạm vi, tác nhân, lịch tháng, sơ đồ E2E, ma trận việc, Work Queue, khung phụ lục |
| `02_van_hanh_thue.md` | 2 | Chủ nhà → HĐ đầu vào → Tòa → Phòng → Khách → HĐ thuê/OCR → Dịch vụ & giá → Điện nước → Hóa đơn → Thu tiền → Công nợ → Sắp hết hạn/Gia hạn/Kết thúc/Phá HĐ → Cọc/Hoàn cọc → Zalo |
| `03_noi_bo_nhan_su_luong.md` | 3 | Tổ chức → Nhân sự → Phân công → Hiệu suất thu tiền → Bảng lương → Chi lương |
| `04_chi_phi_hoa_hong_co_dong_khau_hao.md` | 4 | Chi phí & import → Phân bổ → Hoa hồng → Tài sản & Khấu hao → Tiền thuê nhà thẳng hàng → Cổ đông/Góp vốn/Phân phối |
| `05_bao_cao.md` | 5 | Kỳ báo cáo, 2 biến thể, metric mapping, công thức, Report A/B, bảng cổ phần, golden, drill-down |
| `06_phu_luc.md` | 6 | P-xx, X-xx, traceability, nhật ký gộp |

## 0.3. Thuật ngữ (D-xx) — giá trị đã chốt

### Đối tượng & mã
- **D-01 Tòa**: tòa nhà công ty thuê lại từ chủ nhà theo 1 HĐ đầu vào. Mã `T42`, `S9B`, `G1`. [Đã chốt]
- **D-02 Nhóm tòa T/S/G**: ký hiệu dòng nhà gắn trong mã tòa (KH: "T, G, S là ký hiệu của các mã tòa"). Có lịch sử theo ngày hiệu lực; báo cáo tổng cắt theo nhóm. Ý nghĩa phân nhóm → P-04. [Đã chốt một phần]
- **D-59 Hạng tòa L1/L2/L3**: phân loại tình trạng tòa (dòng 3 sheet BC DT NHÀ T/S/G; file web: "tình trạng tòa nhà cũ/trung bình/mới"). Thuộc tính riêng, không trùng nhóm T/S/G → P-04. [Có bằng chứng nguồn]
- **D-03 Mã phòng**: 3 số phòng + mã tòa (`606T42`); ngoại lệ có chữ (`401S4A`, `201S48A`). Dòng `000<tòa>` (`000G1` đơn giá 3.500, `000G6` 2.700, có cột Tổng đã đóng) = **công tơ tổng của tòa** dùng đối chiếu sản lượng với hóa đơn EVN / giá gốc điện (D-37) và thống kê thất thoát — **không phải hóa đơn khách** và **khác** công tơ "điện vệ sinh chung" của D-18. [Có bằng chứng nguồn]
- **D-04 Mã khách**: `mã phòng + "A" + số thứ tự HĐ` (`606T42A001`); mẫu hóa đơn `=CONCATENATE(phòng,"A001")`; tăng khi có HĐ mới của phòng; đổi phòng nội bộ giữ số thứ tự. [Có bằng chứng nguồn]
- **D-05 Quản lý tòa (NVVH)**: nhân viên vận hành có phân công **phụ trách chính** tòa; 1 người 3–12 tòa. [Đã chốt]
- **D-06 TPVH / TNVH / Trưởng khu vực**: trưởng phòng / trưởng nhóm vận hành = Lead của NVVH; file web thêm "trưởng khu vực" (lọc theo khu vực). [Đã chốt]
- **D-07 Team (hoa hồng)**: người/đơn vị **nhận hoa hồng** (cá nhân sale nội bộ, lead `(LEAD)`, đối tác/môi giới, CTV). Hoa hồng chia theo **cá nhân**, không theo team. [Đã chốt]
- **D-08 Cổ đông**: người góp vốn vào **từng tòa** theo %; 1 người có thể vào nhiều tòa; tỷ lệ nhập tay; nhân viên có thể là cổ đông. [Đã chốt]
- **D-09 Kỳ**: tháng dương lịch. Chốt chỉ số ngày **22**; hóa đơn phát hành cuối tháng cho tiền phòng tháng sau + dịch vụ tháng này; hạn TT **25 → cuối tháng**; thu tiền theo mốc **5/10/15** tháng sau; chốt lương **16**; kế toán kiểm chi phí **20**; khóa kỳ sau đó. [Có bằng chứng nguồn / Cần chốt ngày 16, 20]

### Giá & hợp đồng thuê phòng
- **D-10 Giá niêm yết**: giá tiêu chuẩn của Timehouse; **mẫu số tính hiệu suất**. [Đã chốt]
- **D-11 Giá QL**: mức sàn quản lý tòa được tự chốt; thấp hơn phải duyệt. [Cần chốt]
- **D-12 Giá phòng hiện tại (giá cho thuê/giá chốt)**: giá thực khách đang thuê; cơ sở tiền phòng & hoa hồng. [Đã chốt]
- **D-13 Kỳ TT**: số tháng tiền phòng thu 1 lần trên hóa đơn (1, 2, 3); `Tổng cần đóng` có `Giá × Kỳ TT`. [Có bằng chứng nguồn]
- **D-14 Ngày ở / Ngày DV**: số ngày tính tiền phòng / dịch vụ trong tháng, mặc định 30; **Hệ số hóa đơn = Ngày ở ÷ 30** cho tiền phòng; dịch vụ theo người/phòng (nước theo người, vệ sinh, mạng, thang máy, xe, máy giặt, combo) prorate **Ngày DV ÷ 30** (`202T24`: DV 580.000 × 25/30 = 483.333); điện/nước theo đồng hồ hệ số 1. [Có bằng chứng nguồn]
- **D-15 Số người**: số người ở thực tế → cơ sở nước (khi không có đồng hồ), vệ sinh, máy giặt, combo, điện chung. [Đã chốt]
- **D-16 Nợ cũ**: số còn thiếu kỳ trước, 1 dòng trên hóa đơn kỳ này. [Đã chốt]
- **D-17 Thu khác**: phụ thu ghi kèm hóa đơn: thêm người/xe, phạt, đền bù, và **tiền phòng + DV các ngày lẻ tháng trước của khách mới** (`=((giá+DV)/31)×ngày`). [Có bằng chứng nguồn]
- **D-18 Điện chung**: điện của **công tơ khu vực chung** (cột CB–CH "Điện vệ sinh chung", đơn giá 3.800/kWh) chia theo **số người**: đơn giá/người = thành tiền ÷ tổng người sử dụng; dòng phòng = số người × đơn giá/người (dòng 12 hóa đơn). Là công tơ **khác** với công tơ tổng `000<tòa>` của D-03. Vào `ELECTRIC_REVENUE` theo D-34 (→ P-13). [Có bằng chứng nguồn]
- **D-19 DV khác / Combo 120k/người**: = vệ sinh 60k + máy giặt 60k; báo cáo chia đôi; phần mềm tách 2 dịch vụ. [Có bằng chứng nguồn]
- **D-20 Tình trạng hóa đơn**: `Chưa TT` (cần đóng > 0 và đã đóng = 0) / `Thiếu` / `Đủ`. [Có bằng chứng nguồn]
- **D-21 Công nợ**: Tổng đã đóng − Tổng cần đóng (âm = còn nợ); hóa đơn chuyển thành **công nợ sau 5 ngày** kể từ khi có hóa đơn. [Đã chốt]
- **D-22 Cọc khách cũ / Cọc (mới)**: cọc đang giữ của HĐ hiện hành / cọc thu mới trong tháng (HĐ mới hoặc bổ sung). [Có bằng chứng nguồn]

### Trạng thái phòng & sự kiện HĐ
- **D-23 Phòng mới**: HĐ mới có **ngày vào ở trong tháng** (kể cả phòng cũ có khách mới); không tính đổi phòng nội bộ, gia hạn. [Cần chốt]
- **D-24 Phòng trống**: phòng chưa có người thuê, đếm tại cuối tháng; tách 3 loại: **trống ở luôn** (vào ngay) / **trống hết tháng** (HĐ hết cuối tháng) / **đang chờ** (đã cọc chưa vào). [Đã chốt]
- **D-25 Phá HĐ**: khách **không báo trước mà rời đi**, hoặc rời trước ngày hết HĐ; tính vào tháng có ngày ra thực tế; nợ thu ở "khách hàng phá hợp đồng". [Đã chốt]
- **D-26 Đổi phòng nội bộ**: sự kiện trên cùng HĐ; không tính phòng mới/phá HĐ; cọc, hoa hồng giữ nguyên. [Cần chốt]
- **D-27 Khách bỏ cọc**: đã cọc (có thể ở vài ngày) rồi không ký/không ở; cọc bị giữ; **không** đếm phòng mới nếu chưa vào ở. [Cần chốt]
- **D-28 Hết hạn đúng ngày / Gia hạn**: trước 35 ngày lập danh sách → quản lý xác nhận **không thuê nữa** hoặc **tự gia hạn bằng HĐ lần mới** (được đổi thời hạn, giá, điều khoản). [Đã chốt]

### Chỉ tiêu tài chính
- **D-29 Tổng doanh thu**: *Dòng tiền* = Σ tiền thực đóng trong tháng (tiền phòng + DV + cọc mới + thu khác) − hoàn cọc; *Kinh doanh* = Σ hóa đơn phát hành trong tháng + thu nhập khác, không gồm cọc thu/hoàn. [Đã chốt + Có bằng chứng nguồn `C2 = AX2 − C7`]
- **D-30 Cọc phòng mới**: cọc thu của phòng có khách vào ở trong tháng. [Đã chốt]
- **D-31 Cọc khách bỏ**: **không tính lại** vào báo cáo (đã nằm trong cọc phòng mới), hoàn cọc = 0; *Dòng tiền*: dòng memo; *Kinh doanh*: thu nhập khác tại tháng bỏ. [Đã chốt / Cần chốt phần AC]
- **D-32 Hoàn cọc**: = Cọc − (tiền phòng theo ngày + 7 dịch vụ + **khấu hao 200.000/phòng** + sửa chữa + dọn vệ sinh + sơn phòng + DV khác); âm → công nợ KH; admin/kế toán duyệt; trừ doanh thu tháng thực chi. Tiền phòng tháng cuối chỉ trừ vào cọc khi khách **chưa đóng** (sổ HOÀN CỌC 301T41 ghi tiền phòng ÷ 31 nhưng Tổng hoàn không trừ tiền phòng vì đã đóng → RULE_DIFFERENCE, giữ ÷ 30 theo P-03); mức khấu trừ mặc định → P-16. [Đã chốt + Có bằng chứng nguồn]
- **D-33 Doanh thu tiền phòng**: Σ dòng "Tiền phòng" hóa đơn (CF: đã thu; AC: phát hành). [Đã chốt]
- **D-34 Doanh thu dịch vụ**: 7 loại (điện gồm điện chung, nước, vệ sinh, mạng, xe điện, thang máy, máy giặt); **điện nước đã lên hóa đơn từng phòng = doanh thu**, kể cả phòng đã trả. [Đã chốt]
- **D-35 Tiền thuê nhà**: tiền trả chủ nhà theo HĐ đầu vào (kỳ 3/4/6 tháng); báo cáo ghi theo tháng. [Đã chốt]
- **D-36 Mua thêm thiết bị**: CF ghi hết tháng mua; AC khấu hao. [Đã chốt]
- **D-37 Giá gốc dịch vụ**: tiền thực trả NCC điện/nước/mạng/rác/môi trường/thang máy theo tòa/tháng — import Chi phí; điện nước phòng trống/không thu được nằm trong đây. [Đã chốt]
- **D-38 GV**: Tiền thuê nhà + thiết bị + Σ giá gốc DV. [Có bằng chứng nguồn]
- **D-39 Chi phí vận hành (lương)**: lương **cố định theo level** phân bổ theo số phòng + **lương hiệu suất** ghi thẳng tòa; phần "cổ phần" của NV chia qua module Cổ đông. [Đã chốt]
- **D-40 Chi phí bán hàng phát sinh**: marketing, hoa hồng, sửa chữa/thay thế/bảo trì, chi phí khác. [Đã chốt]
- **D-41 CPBH**: toàn bộ chi phí ngoài GV (kể cả lương, VP) — tên gọi của công ty. [Có bằng chứng nguồn]
- **D-42 TCP / LNG / LNR**: GV + CPBH / DT − GV / DT − TCP. [Có bằng chứng nguồn]
- **D-43 Vốn (bảng cổ phần)**: % × tiền thuê nhà 1 tháng (trình bày); vốn góp lũy kế thực theo dõi ở module Cổ đông. [Có bằng chứng nguồn / Cần chốt]
- **D-44 Tổng nhận**: Vốn + LNR × % — tham khảo, không phải số chi. [Cần chốt]

### Hiệu suất & lương
- **D-45 DT niêm yết**: Σ giá niêm yết phòng đang thuê của tòa. [Có bằng chứng nguồn]
- **D-46 DT phải thu**: Σ Tổng cần đóng của tòa trong tháng (`SUMIF(sổ, tòa, AV)`); có điều chỉnh tay (trừ phòng trả, cộng bổ sung). [Có bằng chứng nguồn]
- **D-47 Mốc M1/M2/M3**: thu lũy kế đến ngày 5/10/15; **DT mốc 1 = M5; mốc 2 = (M10 − M5) × 90%; mốc 3 = (M15 − M10) × 70%**. [Đã chốt]
- **D-48 DT thu thêm**: tiền phòng khách mới vào giữa tháng tính theo ngày (ngoài DT phải thu đầu kỳ); không trọng số. Có **2 nguồn**: (a) phần mềm sinh tự động = prorate hóa đơn đầu khách mới theo P-03 (÷ 30; sổ đang ÷ 31) đã thu đến ngày 15; (b) dòng nhập tay có lý do, kế toán duyệt (S9, S37). [Có bằng chứng nguồn / Cần chốt → P-03]
- **D-49 Tổng DT thu được**: = Tổng 3 mốc × (1 − DV/DT phải thu) + DT thu thêm. [Có bằng chứng nguồn]
- **D-50 Hiệu suất (%)**: = Tổng DT thu được ÷ DT niêm yết × 100. *Tạm tính* = đến thời điểm xem; *Thực tế* = sau chốt. [Đã chốt]
- **D-51 Mức lương/phòng**: = HS × Đơn giá bậc ÷ Ngưỡng bậc; bậc cố định theo level; tòa mới 100.000. [Đã chốt / ngưỡng → P-01]
- **D-52 Lương trưởng nhóm**: = 10.000 × số phòng dưới quyền; Lương hỗ trợ nhập tay. [Có bằng chứng nguồn]
- **D-53 DT phá HĐ / Tỷ lệ phá HĐ**: doanh thu mất do phá HĐ / DT phải thu. [Có bằng chứng nguồn]

### Hoa hồng
- **D-54 Giá chốt**: giá phòng ký HĐ; bỏ cọc: cọc − giá ÷ 30 × ngày đã ở. [Có bằng chứng nguồn]
- **D-55 Mức HH**: 50% (đối tác/lead), 35% (NV); HĐ < 6 tháng: mức ÷ 6 × số tháng; trùng n nguồn: ÷ n; theo %, không bậc thang. [Có bằng chứng nguồn / Cần chốt]
- **D-56 Đủ điều kiện trả**: khách đóng đủ cọc + ký xong HĐ; trả ngay sau đó. [Đã chốt]
- **D-57 / D-58**: Đã tt = đã chuyển; Tổng nhận = gộp deal cùng người nhận. [Có bằng chứng nguồn]

## 0.4. Rule chuẩn dùng chung (R-xx)

### Doanh thu & báo cáo
- **R-01** Có 2 biến thể báo cáo: **CF – Lợi nhuận dòng tiền** (thực thu/thực chi, = Excel hiện tại, phải khớp golden) và **AC – Kinh doanh** (theo kỳ phát sinh, khấu hao, không cọc). Cả hai làm **theo tòa rồi gộp theo nhóm T/S/G → tổng, theo tháng**, dùng chung sổ giao dịch và Metric Definition. [Đã chốt]
- **R-02** CF: Tổng DT = Σ Tổng đã đóng trong tháng − Hoàn cọc; gồm cọc phòng mới; **cọc khách bỏ không cộng lại** (memo). [Đã chốt]
- **R-03** AC: Doanh thu = hóa đơn phát hành trong tháng; tiền nộp cho hóa đơn cũ chỉ giảm công nợ; đóng trước nhiều tháng = doanh thu chưa thực hiện, chia đều. [Cần chốt]
- **R-04** Điện nước và mọi dịch vụ đã lên hóa đơn từng phòng là doanh thu (kể cả hóa đơn cuối của phòng đã trả, phần khấu trừ cọc). Điện nước phòng trống/không thu được = chi phí (giá gốc). [Đã chốt]
- **R-05** Cọc: CF ghi cọc mới khi khách vào ở, trừ hoàn cọc tháng thực chi; AC không ghi cọc vào doanh thu; cọc bị giữ (bỏ/phá HĐ) → thu nhập khác AC tại tháng bỏ. [Đã chốt / Cần chốt AC]
- **R-06** Đếm phòng: phòng mới / phá HĐ / trống đếm theo tòa rồi cộng; 1 phòng vừa trả vừa có khách mới đếm cả 2; trống đếm cuối tháng theo 3 loại D-24. [Đã chốt một phần]
- **R-07** Tỷ lệ trên báo cáo tổng tính lại từ tổng, không lấy trung bình tỷ lệ tòa. [Có bằng chứng nguồn]
- **R-08** Kỳ báo cáo: Open → Reviewing → Locked → Reopened; khi khóa đóng băng phiên bản metric, allocation, loại tòa, snapshot lương, % cổ đông. Sửa sau khóa = bút toán điều chỉnh kỳ hiện tại; chỉ admin mở khóa, lưu phiên bản cũ. [Cần chốt]

### Hóa đơn & thu tiền
- **R-09** Tổng cần đóng = Tổng DV + Giá phòng × Kỳ TT + Nợ cũ + Cọc + Thu khác. Hóa đơn 12 dòng cố định: tiền phòng, cọc, điện, nước, vệ sinh, internet, thang máy, gửi xe, máy giặt, combo/DV khác, nợ cũ, điện chung; mỗi dòng = Đơn giá × Số lượng × Hệ số (Ngày ở ÷ 30). [Có bằng chứng nguồn]
- **R-10** Tiền phòng theo ngày = Giá tháng ÷ 30 × số ngày ở (áp cho hóa đơn, hoa hồng, DT thu thêm). [Cần chốt → P-03]
- **R-11** Chốt chỉ số ngày 22 (tham số theo tòa); quản lý tòa nhập chỉ số, TNVH duyệt; hóa đơn phát hành không sửa, chỉ điều chỉnh/hủy có audit. [Cần chốt]
- **R-12** Nội dung CK = mã phòng; mỗi tòa gắn 1 tài khoản nhận mặc định (VP Bank / Techcombank); thanh toán khớp theo mã phòng + tài khoản; 1 payment nhiều hóa đơn, 1 hóa đơn nhiều payment. [Có bằng chứng nguồn]
- **R-13** Công nợ sau 5 ngày kể từ khi có hóa đơn; phạt 200.000/ngày do hệ thống đề xuất, quản lý xác nhận/miễn, kế toán duyệt. [Đã chốt / Cần chốt phạt]
- **R-14** Giá dịch vụ: mặc định toàn hệ thống (điện 4.000/kWh, nước 120.000/người hoặc 35.000/m³ theo đồng hồ, internet 100.000/phòng, vệ sinh 60.000/người, máy giặt 50–60.000/người, xe điện 150.000, thang máy 50–60.000/người) + override theo tòa; **snapshot đơn giá theo HĐ** ("mỗi HĐ 1 loại giá") — giá theo HĐ (snapshot) **có thể khác giá mặc định của tòa** (G6: `101G6` combo 130.000 và `302G6` combo 120.000 cùng tòa). [Có bằng chứng nguồn]

### Vòng đời HĐ thuê
- **R-15** Trước 35 ngày hết HĐ (toàn hệ thống) → Work Queue "HĐ sắp hết" → quản lý xác nhận: *Kết thúc* (khách báo không thuê) hoặc *Gia hạn* (HĐ phiên bản mới, được đổi thời hạn/giá/điều khoản, giữ mã khách và cọc). [Đã chốt]
- **R-16** Không báo mà rời đi, hoặc rời trước ngày hết HĐ = Phá HĐ: mất cọc theo HĐ, không tính tiền phòng các tháng còn lại, nợ điện nước theo dõi ở DS phòng phá HĐ (tổng phải thu / đã thu). [Đã chốt]
- **R-17** Kết thúc đúng hạn: chốt điện nước ngày ra → hóa đơn cuối (tiền phòng theo ngày nếu hết HĐ giữa tháng) → quyết toán → hoàn cọc (D-32) → phòng Chờ dọn → nghiệm thu → Sẵn sàng. [Đã chốt]
- **R-18** Khách đổi phòng nội bộ = 1 sự kiện trên HĐ; cọc chuyển theo; không đếm phòng mới/phá HĐ. [Cần chốt]

### Lương & hiệu suất
- **R-19** Lương cố định theo **level** (chức danh/bậc) có hiệu lực theo ngày: lương cơ bản, phụ cấp ăn trưa, xăng xe, lương hỗ trợ; tổng lương chức danh dùng cho phân bổ. [Đã chốt]
- **R-20** Hiệu suất tòa: DT phải thu = SUMIF(Tổng cần đóng); M5/M10/M15 = thu lũy kế; Tổng 3 mốc = M5 + (M10−M5)×90% + (M15−M10)×70%; Tổng DT thu được = Tổng 3 mốc × (1 − DV ÷ DT phải thu) + DT thu thêm; HS = ÷ DT niêm yết. [Đã chốt]
- **R-21** Mức lương/phòng = HS × đơn giá bậc ÷ ngưỡng bậc; bậc đang dùng: 130k/100 · 120k/95 · 119k/95 · 110k/90 · 109k/90 · 75k/75; tòa mới 100k cố định; ranh giới % → P-01 (bảng bậc thực tế là **ma trận level × dải HS** với ngưỡng 100/95/90/85/80/75, quan sát ≥ 16 cặp ở §3.5.3; 6 cặp trên chỉ là ví dụ). **Bậc xếp theo HS của từng tòa**, không theo HS gộp của nhân viên (Huyền HS gộp 95,01 nhưng T3 dùng 119k/95, T24 dùng 130k/100). Lương HS tòa = số phòng × mức; thực nhận = cố định + trưởng nhóm + hỗ trợ + Σ lương HS. [Đã chốt / Có bằng chứng nguồn]
- **R-22** Lương trưởng nhóm = 10.000 × số phòng dưới quyền (TPVH 774, TNVH 408 phòng — 774 + 408 = 1.182 > 1.079 phòng tính HS, nên "phòng dưới quyền" là mẫu số riêng → P-12). [Có bằng chứng nguồn / Cần chốt định nghĩa → P-12]
- **R-23** Chốt lương ngày 16 (sau mốc 3); thu sau ngày chốt vào công nợ, không vào HS tháng; đổi quản lý giữa tháng → tòa tính cho người phụ trách chính tại ngày 15 (P-21); snapshot NV × tòa × kỳ; Payroll Rule có phiên bản. Kỳ lương N = đợt hóa đơn "tiền phòng tháng N" (phát hành cuối tháng N−1), mốc 5/10/15 của tháng N, chốt 16/N (P-06). [Cần chốt]
- **R-24** Phần "cổ phần" trong thu nhập nhân viên = lợi nhuận được chia qua module Cổ đông; không đưa vào chi phí lương. [Đã chốt]

### Chi phí, phân bổ, khấu hao
- **R-25** Mọi chi phí không sinh tự động (giá gốc điện/nước/mạng/rác/môi trường/thang máy, marketing, thiết bị, sửa chữa, VP, chi phí khác, hoa hồng) **import vào module Chi phí**; lương lấy từ bảng lương khóa, không import. Mỗi dòng có **kỳ hạch toán** (AC) và **ngày thanh toán** (CF). [Đã chốt]
- **R-26** Phân bổ chi phí chung theo **số phòng**: (Tổng chi phí ÷ N) × n; N = tổng phòng đang quản lý cuối tháng kể cả trống (tháng 6/2026 = 1.303); phần cố định: TPVH +10.000/phòng, kế toán **10.000 × n phòng + 10.000/tòa** (G1 T6 ghi `150.000 + 10.000` = 10.000 × 15 + 10.000; sheet T1/2026 ghi rõ `10.000×15 + 10.000`), vệ sinh 550.000/tòa; lương hiệu suất ghi thẳng tòa; marketing/VP phạm vi toàn hệ thống; rule có phiên bản, lưu snapshot. [Có bằng chứng nguồn / N → P-05]
- **R-27** Tiền thuê nhà: **CF ghi theo tháng hợp đồng** — mỗi tháng hiệu lực ghi tiền thuê 1 tháng theo HĐ đầu vào (D-35), **không** ghi theo ngày trả thực (golden G1 ghi 48.000.000 mỗi tháng dù trả quý); tháng miễn = 0; chế độ "theo ngày trả thực" chỉ là view sổ quỹ / dòng tiền dự kiến ở M-4.05. AC phân bổ đều = tổng tiền thuê toàn HĐ ÷ tổng tháng hiệu lực (thẳng hàng **cả tháng miễn**); chênh CF − AC lũy kế = chi phí trả trước. [Có bằng chứng nguồn phần CF / Cần chốt AC]
- **R-28** Khấu hao (chỉ AC): thiết bị < 10tr → 12 tháng; ≥ 10tr → 36 tháng; cải tạo/đầu tư ban đầu → theo thời hạn HĐ đầu vào còn lại (≤ 60 tháng); từ tháng đưa vào dùng; trả tòa sớm ghi hết phần còn lại. [Cần chốt → P-02]
- **R-29** Không bù trừ: chi phí sửa chữa ghi đủ; khoản khấu trừ cọc (sửa chữa, vệ sinh, sơn, khấu hao 200k) ghi thu nhập khác. [Cần chốt]
- **R-30** Hoa hồng Phase 1 = import (tòa theo mã phòng, kỳ = tháng trả); trả khi khách đóng đủ cọc + ký HĐ; theo cá nhân; mức D-55; không hoa hồng gia hạn; bỏ cọc tính trên cọc mất. [Đã chốt / Cần chốt]

### Cổ đông
- **R-31** Cổ phần theo tòa, % nhập tay có ngày hiệu lực, tổng 100%; cổ đông **đóng tiền nhà định kỳ cho chủ nhà theo %** (lịch đóng tiền từng người, nhắc hạn); đầu tư ban đầu theo dõi riêng và khấu hao. [Đã chốt]
- **R-32** Tài khoản vốn lũy kế từng cổ đông theo tòa (đã góp − đã chia); phân phối theo quý trên **lợi nhuận lũy kế dương** (bù lỗ trước), admin/kế toán duyệt; **basis phân phối = AC (Báo cáo kinh doanh)** — `NET_PROFIT` biến thể AC của 3 kỳ Locked; số CF chỉ hiển thị tham khảo (P-10); bảng cổ phần tháng vẫn trình bày Vốn = % × tiền thuê 1 tháng, LNG/LNR × %, Tổng nhận = Vốn + LNR × % (tham khảo); % dùng tại ngày cuối kỳ. [Có bằng chứng nguồn / Cần chốt]

### Tổ chức & quyền
- **R-33** Phân công tòa là nguồn duy nhất xác định quản lý tòa; vai trò: phụ trách chính, phối hợp, kỹ thuật, vệ sinh (đều theo tòa); có lịch sử. [Đã chốt]
- **R-34** Quyền: admin & kế toán sửa dữ liệu nhạy cảm (công nợ, lương, hoa hồng); cổ đông/admin/kế toán/trưởng phòng xem báo cáo; NV/trưởng nhóm/admin/kế toán tải tài liệu; mọi màn hình lọc theo khu vực / trưởng nhóm / quản lý / tòa / loại nhà. [Đã chốt]
- **R-35** Zalo: dùng **ZNS** (Timehouse chủ động gửi), công cụ tự đặt điều kiện + thời điểm gửi; lấy lại công nợ ngay trước khi gửi; khách chưa liên kết → phương án dự phòng; phản hồi về trưởng phòng phụ trách, có đồng bộ hội thoại. [Đã chốt]
- **R-36** OCR/upload HĐ: đọc dữ liệu tự động từ file; tự cập nhật bảng giá DV theo HĐ. [Đã chốt]
- **R-37** Mọi số tổng trên báo cáo drill-down được về chứng từ (hóa đơn, payment, phiếu chi phí, dòng lương, deal hoa hồng, bút toán khấu hao). [Đã chốt]

## 0.5. Metric code (spec §12.23.3 / §12.23.6 — dùng nguyên chính tả)

Tiền: `TOTAL_REVENUE`, `NEW_DEPOSIT`, `FORFEITED_DEPOSIT`, `REFUND_AMOUNT`, `RENT_REVENUE`, `ELECTRIC_REVENUE`, `WATER_REVENUE`, `CLEANING_REVENUE`, `INTERNET_REVENUE`, `ELECTRIC_VEHICLE_REVENUE`, `ELEVATOR_REVENUE`, `WASHING_REVENUE`, `SERVICE_REVENUE`, `HEAD_LEASE_COST`, `EQUIPMENT_PURCHASE_COST`, `ELECTRIC_INPUT_COST`, `WATER_INPUT_COST`, `INTERNET_INPUT_COST`, `GARBAGE_COST`, `ENVIRONMENT_COST`, `ELEVATOR_MAINT_COST`, `COGS`, `SALARY_COST`, `OFFICE_COST`, `MARKETING_COST`, `COMMISSION_COST`, `REPAIR_COST`, `OTHER_COST`, `OPERATING_SELLING_COST`, `TOTAL_COST`, `GROSS_PROFIT`, `NET_PROFIT`.
Đếm: `EARLY_TERMINATION_COUNT`, `NEW_ROOM_COUNT`, `VACANT_ROOM_COUNT`.
Tỷ lệ: `NET_MARGIN`, `GROSS_MARGIN`, `NET_PROFIT_OVER_COGS`, `NET_PROFIT_OVER_GROSS_PROFIT`, `TOTAL_COST_OVER_GROSS_PROFIT`, `COGS_OVER_REVENUE`, `OPERATING_SELLING_COST_OVER_REVENUE`, `TOTAL_COST_OVER_REVENUE`, `SALARY_OVER_OPERATING_SELLING_COST`, `HH_OVER_OPERATING_SELLING_COST`, `OTHER_COST_OVER_OPERATING_SELLING_COST`, `SERVICE_REVENUE_OVER_INPUT_COST`, `RENT_REVENUE_OVER_HEAD_LEASE`.
Mới cho biến thể AC (chỉ chương 5 được định nghĩa): `DEPRECIATION_COST`, `HEAD_LEASE_COST_AC`, `DEFERRED_REVENUE`, `OTHER_INCOME`. Mỗi metric có chiều `basis ∈ {CF, AC}`, không tạo 2 họ mã.

Ghi chú mẫu số: `SERVICE_REVENUE_OVER_INPUT_COST` = `SERVICE_REVENUE` ÷ (6 giá gốc dịch vụ **+ lương vệ sinh** `SALARY_COST[CLEANING]`) theo ô công thức `C59 = C18/(SUM(C22:C27)+C35)` của `BÁO CÁO TỔNG THÁNG 8` (khác checklist F-29 chỉ ghi Σ giá gốc) [Có bằng chứng nguồn]; `HH_OVER_OPERATING_SELLING_COST` tử số = `MARKETING_COST + COMMISSION_COST` (`C85 = SUM(C46:C49)/C71`) — CONFIRMED. Các tên phụ trong công thức chương 5 (`SALARY_COST[...]` dòng con, `SALARY_GROUP`, `HH_GROUP`, `OTHER_COST_GROUP`, `*_SHARE`, `*_ADJ`) là **biến trung gian / nhãn hiển thị**, không phải `metric_code`.

## 0.6. Entity (ERD spec §11.3 + bổ sung)

Spec: `LANDLORD, HEAD_LEASE, BUILDING, ROOM, CUSTOMER, CONTRACT, CONTRACT_TENANT, CONTRACT_SERVICE, SERVICE, CONTRACT_VEHICLE, CONTRACT_HANDOVER_ASSET, CONTRACT_PAYMENT_TERM, CONTRACT_RENEWAL_CLAUSE, METER, METER_READING, INVOICE, INVOICE_LINE, PAYMENT, PAYMENT_ALLOCATION, DEPOSIT_LEDGER, REFUND_CASE, ORG_UNIT, EMPLOYMENT_ASSIGNMENT, EMPLOYEE, BUILDING_ASSIGNMENT, PAYROLL_PERIOD, PAYROLL_RESULT, SALARY_PAYMENT, EXPENSE, EXPENSE_ALLOCATION, SHAREHOLDER, BUILDING_SHARE, CAPITAL_PAYMENT, PROFIT_DISTRIBUTION, REPORT_PERIOD, REPORT_SNAPSHOT, REPORT_METRIC_VALUE, METRIC_DEFINITION, ALLOCATION_RULE, ALLOCATION_RESULT`.
Bổ sung Phase 1: `BUILDING_TYPE_HISTORY` (nhóm T/S/G + hạng L1–L3), `CONTRACT_VERSION` (gia hạn), `CONTRACT_EVENT` (new / renew / transfer / end / early_termination / abandon), `ROOM_STATUS_HISTORY`, `HEAD_LEASE_PAYMENT_SCHEDULE` (lịch đóng tiền chủ nhà), `SALARY_LEVEL` (lương cố định theo level), `PAYROLL_RULE_VERSION`, `COLLECTION_MILESTONE_SNAPSHOT` (M5/M10/M15 theo tòa), `ASSET`, `DEPRECIATION_SCHEDULE`, `SHAREHOLDER_CAPITAL_ACCOUNT`, `COMMISSION_IMPORT_LINE`, `ZALO_REMINDER_RULE`, `ZALO_MESSAGE_LOG`.

## 0.7. Bản đồ cột sổ Excel tháng → entity (tham chiếu cho chương 2)

Sổ `NHÀ T / NHÀ S / NHÀ G` và sheet tòa mới `G16/G17/G18` (1 dòng = 1 phòng/tháng):

| Cột | Tên | Entity.field |
|---|---|---|
| A–E | Mã, Tòa, Phòng, Quản lý, Kỳ TT | ROOM.code, BUILDING.code, BUILDING_ASSIGNMENT (đọc), CONTRACT_PAYMENT_TERM.months |
| F–J | Cọc khách cũ, Giá niêm yết, Giá QL, Giá hiện tại, Cọc (mới) | DEPOSIT_LEDGER.balance, ROOM.list_price, ROOM.floor_price, CONTRACT.rent, DEPOSIT_LEDGER(collect) |
| K–N | Ngày ở, Ngày DV, Nợ cũ, Thu khác | INVOICE.rent_days, service_days, INVOICE_LINE(previous_debt), INVOICE_LINE(other) |
| O | Số người | CONTRACT.occupant_count |
| P–T / U–Y | Điện, Nước: CS cũ, CS mới, SL, Đơn giá, Thành tiền | METER_READING + INVOICE_LINE(electric / water) |
| Z–AQ | Vệ sinh, Mạng, Thang máy, Xe điện, Máy giặt, DV khác: SL, Đơn giá, Thành tiền | INVOICE_LINE theo service_code |
| AR–AT | Điện chung: SL(=số người), Đơn giá/người, Thành tiền | INVOICE_LINE(common_electric) |
| AU–AV | Tổng DV, Tổng cần đóng | INVOICE.service_total, INVOICE.total_due |
| AW–AZ | Ghi chú, Tổng đã đóng, Tình trạng, Công nợ | INVOICE.note, PAYMENT_ALLOCATION Σ, INVOICE.status, INVOICE.balance |
| BA–BD | Ngày vào ở, Thời hạn, Ngày hết hạn, Nội thất (BD = NỘI THẤT) | CONTRACT.move_in, term, end_date, CONTRACT_HANDOVER_ASSET |
| BE–BR | Điện / Nước phòng hết HĐ (CS, SL, đơn giá, thành tiền) | INVOICE(final) lines |
| BT–BX | Khách mới: Cọc, ND & ngày CK, Tiền nhà, ND & ngày CK, Ghi chú | DEPOSIT_LEDGER + PAYMENT (đợt đầu, có nội dung CK) |
| BY–CA | Hoàn cọc khách hết HĐ: Khấu hao, Vệ sinh, Sửa chữa | REFUND_CASE.deductions |
| CB–CH | Điện vệ sinh chung: CS, SL, đơn giá, thành tiền, số người sử dụng, tiền/người | METER(common) + rule D-18 |
| (G16+) BA–BC | Điện/Nước phá HĐ thu được, Điện phòng trống | PAYMENT vs EXPENSE (phòng trống) |

Sheet khác: `PHÒNG MỚI THÁNG x` (cùng cột; giá tháng đầu `=(giá/30)×ngày`; cột BO–BV theo dõi cọc/tiền nhà đợt đầu) → CONTRACT_EVENT(new) + hóa đơn đầu; `HOÀN CỌC` (cọc, tiền phòng theo ngày, 7 DV, khấu hao 200k, sửa chữa, dọn VS 100k, sơn phòng 500k, DV khác, Tổng hoàn = Cọc − Σ, Tình trạng, Công nợ KH) → REFUND_CASE; `HĐ (VP-HẰNG)/(VP)/(TECH)/(G1 TECH)` → mẫu in hóa đơn theo tài khoản nhận; `HĐ (HOÀN CỌC)` → mẫu in hoàn cọc; `ĐIỆN NƯỚC PHÒNG TRỐNG/KHÔNG THU ĐƯỢC` → EXPENSE (giá gốc) + thống kê thất thoát; `cập nhật thu tiền` (theo quản lý & theo tòa, SUMIF sổ, M5/M10/M15, mốc trọng số) → COLLECTION_MILESTONE_SNAPSHOT; `BÁO CÁO CHECK THU TIỀN` (phòng, cần đóng, đã đóng, công nợ, tình trạng, **ngày thanh toán**, ghi chú) → PAYMENT log; `DS phòng phá hđ` (mã, quản lý, ngày vào, số tháng ở, lý do, SĐT, tổng phải thu SUMIF, đã thu SUMIF) → CONTRACT_EVENT(early_termination) + công nợ.

## 0.8. Tham số chờ chốt (P-xx) — dãy mã duy nhất, bảng đầy đủ tại §6.1

Mã P-xx là **một dãy duy nhất P-01…P-29** cho toàn bộ tài liệu (đánh số lại khi gộp; mã tạm P-2.a…P-2.g của chương 2 và P-11…P-16 tạm của chương 1 đã được thay). Bảng dưới là tóm tắt; câu hỏi gửi KH, module ảnh hưởng, nguồn phát hiện xem §6.1.

| Mã | Tham số | Giá trị đề xuất | Ảnh hưởng |
|---|---|---|---|
| P-01 | Bảng bậc lương/phòng = **ma trận level × dải HS** (ngưỡng 100/95/90/85/80/75); 6 cặp brief chỉ là ví dụ | ≥98 → 130k/100; 95–<98 → 120k/95; 93–<95 → 119k/95; 91–<93 → 110k/90; 88–<91 → 109k/90; 75–<88 → 75k/75; <75 → 0; bảng quan sát đầy đủ §3.5.3 | Payroll Rule |
| P-02 | Tháng khấu hao | Thiết bị rời (điều hòa, tủ lạnh, máy giặt, rèm…) < 10tr: 12; ≥ 10tr: 36 (xét trên 1 đơn vị); hạng mục cải tạo ban đầu (thạch cao, tủ bếp gắn tường, điện nước): HĐ đầu vào còn lại ≤ 60; G1 = 2.325.167/tháng theo cách tách hạng mục | AC report |
| P-03 | Prorate tiền phòng & DV | ÷ 30 (sổ hóa đơn) — file HH/lương/sổ HOÀN CỌC 301T41 đang ÷ 31 → RULE_DIFFERENCE; DT thu thêm tự động theo ÷ 30 + dòng nhập tay | Hóa đơn, HH, lương, hoàn cọc |
| P-04 | Nghĩa T/S/G và L1/L2/L3 | T/S/G = dòng nhà; L = hạng tình trạng | Nhãn phân loại |
| P-05 | Định nghĩa **2 mẫu số phòng** | N phân bổ = tổng phòng quản lý cuối tháng kể cả trống (1.303 T6; 1.382 T8); số phòng tính HS = phòng có hóa đơn kỳ (1.079 T8); 1 N duy nhất/kỳ — Excel dùng 1.343 ở lương sửa chữa T8 → RULE_DIFFERENCE | Allocation, Payroll |
| P-06 | Kỳ lương & ngày chốt | Kỳ lương N = đợt hóa đơn "tiền phòng tháng N"; mốc 5/10/15 của tháng N; chốt lương 16/N; kiểm chi phí 20; khóa sau 20; cutoff CF cho payment ghi trễ | Payroll, Period close |
| P-07 | Hoa hồng nhiều đợt (8% + 42%) & mức ngoài tham chiếu (65%) | Tùy chọn, mặc định 1 lần; mức lạ chỉ cảnh báo | Commission import |
| P-08 | Tòa mới áp 100k đến khi nào | 2 tháng đầu hoặc lấp đầy ≥ 70% | Payroll |
| P-09 | Phạt trễ hạn 200k/ngày | Đề xuất – xác nhận – duyệt | Invoice |
| P-10 | Phân phối lợi nhuận cổ đông | Theo quý, lũy kế dương, **basis AC**; cổ đông không xem Report B (chưa có cổ đông cấp công ty) | Distribution |
| P-11 | Ngưỡng vốn hóa thiết bị (EXPENSE → ASSET) | 2.000.000 VND/đơn vị; dưới ngưỡng ghi `EQUIPMENT_PURCHASE_COST` cả CF lẫn AC | M-4.01, M-4.04 |
| P-12 | Định nghĩa "phòng dưới quyền" (R-22) | Σ phòng quản lý (kể cả trống) của các tòa thuộc nhóm; TPVH tính toàn hệ thống | M-3.01, M-3.05 |
| P-13 | Điện chung vào `ELECTRIC_REVENUE` hay dòng riêng | Luôn cộng vào `ELECTRIC_REVENUE` (theo T8); golden T6 ghi RULE_DIFFERENCE +100.000 | M-2.09, M-5.03 |
| P-14 | Thứ tự phân bổ payment vào dòng hóa đơn | Nợ cũ → 7 DV + điện chung → thu khác → tiền phòng → cọc | M-2.10, M-5.02 |
| P-15 | Phân bổ tiền thuê 1 HĐ đầu vào nhiều tòa (S19A/B/C) | Theo tỷ lệ số phòng, hoặc tỷ lệ nhập tay trên HĐ đầu vào; tổng = 100% | M-2.02, M-4.05 |
| P-16 | Mức khấu trừ hoàn cọc mặc định | Khấu hao 200.000/phòng; dọn VS 100.000; sơn 300.000–500.000 — tham số theo tòa | M-2.13 |
| P-17 | Mốc tính "5 ngày" chuyển công nợ | 5 ngày sau ngày phát hành hóa đơn (hay sau hạn TT?) | M-2.11, M-1.01 |
| P-18 | Ngày chi lương thực tế | 20–25 tháng kế tiếp; chỉ ảnh hưởng sổ quỹ, không đổi `SALARY_COST` | M-3.06 |
| P-19 | Giờ chụp snapshot mốc M1/M2/M3 | 23:59 ngày 5 / 10 / 15 | M-3.04 |
| P-20 | Ngưỡng tuổi việc & màu ưu tiên Work Queue | Công nợ > 5 / > 15 ngày; HĐ sắp hết < 7 ngày; chủ nhà ≤ 7 ngày; OCR > 2 ngày | M-1.01 |
| P-21 | Ngày tham chiếu người phụ trách chính cho kỳ lương | Ngày 15 của kỳ | M-3.03, M-3.05 |
| P-22 | Vai trò HR và Quản lý Tổng | Gộp vào Admin/Kế toán ở Phase 1 | Cấu hình quyền |
| P-23 | Ngưỡng "HĐ đầu vào sắp hết" & mốc nhắc trả chủ nhà | 6 tháng; nhắc 15/7/1 ngày (M-2.02) / 10 ngày (M-4.05) → thống nhất 15/7/1 | M-2.02, M-4.05 |
| P-24 | Thời điểm sinh mã khách & mã khi đổi phòng | Sinh khi HĐ `Chờ ký`; đổi phòng: mã theo phòng đích, giữ số thứ tự | M-2.05 |
| P-25 | Ảnh công tơ bắt buộc | Bắt buộc với OPENING/CLOSING; PERIODIC khuyến nghị | M-2.08 |
| P-26 | Tiền mặt NVVH thu ở trạng thái Chờ xác nhận | Không tính mốc M5/M10/M15 cho tới khi kế toán xác nhận | M-2.10, M-3.04 |
| P-27 | Nợ phá HĐ thu hồi ở tháng sau | Vào `collected`/công nợ kỳ gốc, không vào M5/M10/M15 hay HS kỳ nào; CF ghi tháng thu | M-2.10, M-3.04 |
| P-28 | Chi lương: tạm ứng, duyệt đợt, đối chiếu ngân hàng | Cho phép tạm ứng trước khóa; Admin duyệt đợt; khớp (STK, số tiền, ngày) | M-3.06 |
| P-29 | Phí môi giới chủ nhà, cọc chủ nhà & thành phần "Đã góp" | Đều là đầu tư ban đầu (vốn góp), không phải chi phí tháng; môi giới phân bổ AC theo HĐ đầu vào; "Đã góp" G1 230.400.000 ≠ Σ khoản liệt kê 232.262.000 | M-4.05, M-4.06 |

## 0.9. Ngoài phạm vi Phase 1 (X-xx)

| Mã | Hạng mục | Ghi chú |
|---|---|---|
| X-01 | CRM / Lead / Lịch xem / Giữ phòng / Sổ doanh số / thống kê nguồn khách | Phase 2 (file web mục KINH DOANH) |
| X-02 | Commission Engine (policy, case, split, payout) | Phase 2; Phase 1 chỉ import |
| X-03 | Work Order / giao việc kỹ thuật, vệ sinh có tiến độ; lịch bảo dưỡng; kiểm kê tài sản | Phase 2 (file web mục BẢO TRÌ) |
| X-04 | Budget, Period Close nâng cao, snapshot M5/M10/M15 dạng Phase 2 | Phase 2 |
| X-05 | Lương phòng Kinh doanh / Kỹ thuật / Thị trường / TC-KT | KH: "gặp trực tiếp" |
| X-06 | Bảng dự kiến lợi nhuận, ROI/ROA, forecast, cổng cổ đông, DW/BI | Phase 3 |
| X-07 | Công thức "Hiệu suất / Lợi nhuận / Thời gian vận hành" hiển thị trên màn Tòa | KH: "gặp trực tiếp" — Phase 1 hiển thị từ báo cáo tháng gần nhất |
| X-08 | Các báo cáo bổ sung ở sheet `BÁO CÁO` file web: âm dương điện nước, phân khúc khách hàng, tỷ lệ đóng tiền đúng hạn/quá hạn, tỷ lệ lấp đầy & thời gian trống | Phase 2; Phase 1 chỉ có thống kê thất thoát điện phòng trống (M-2.08), KPI tạm tính trên M-1.01 và `RENT_REVENUE_OVER_HEAD_LEASE` ở Report B |
