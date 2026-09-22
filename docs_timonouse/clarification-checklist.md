# TimoHouse — Checklist làm rõ nghiệp vụ để sinh đúng 2 báo cáo Excel

Mục tiêu: hệ thống phải tự sinh **Báo cáo tòa** (mẫu `Báo cáo tháng 6` – G1) và **Báo cáo tổng T/S/G** (mẫu `Báo cáo kinh doanh Tháng 8`) từ dữ liệu giao dịch, không nhập số tổng tay.

Trạng thái: ✅ đã có câu trả lời (answer.md) · 🟡 đã giả định, chờ xác nhận · ❌ chưa có thông tin

---

## PHẦN 1 — ĐỊNH NGHĨA CẦN THỐNG NHẤT

### 1.1. Đối tượng & mã hóa

| # | Thuật ngữ | Định nghĩa hiện hiểu | Nguồn | Trạng thái |
|---|---|---|---|---|
| D01 | Tòa (mã `T42`, `S9B`, `G1`) | Một tòa nhà thuê lại từ chủ nhà theo 1 HĐ đầu vào; ký hiệu chữ đầu = nhóm T/S/G | HD theo tòa | ✅ |
| D02 | Nhóm tòa T / S / G | Nhóm theo pháp nhân/nhóm đầu tư ký HĐ đầu vào, không theo địa lý; có ngày hiệu lực | spec §4.6 | 🟡 |
| D03 | Mã phòng `606T42` | 3 số phòng + mã tòa; ngoại lệ có chữ (`401S4A`, `201S48A`) | HD, Hoa hồng | ✅ |
| D04 | Mã khách `606T42A001` | Mã phòng + `A` + số thứ tự khách của phòng | HD | 🟡 — quy tắc tăng số? |
| D05 | Quản lý tòa (NVVH) | Nhân viên vận hành có phân công **phụ trách chính** tòa; 1 người 3–12 tòa | Bảng lương | ✅ |
| D06 | TPVH / TNVH | Trưởng phòng / trưởng nhóm vận hành — Lead của các NVVH | Bảng lương | ✅ |
| D07 | Team (file hoa hồng) | Người/đơn vị **nhận hoa hồng**: môi giới ngoài, CTV, hoặc lead nội bộ `(LEAD)` | Hoa hồng | 🟡 |
| D08 | Cổ đông | Người góp vốn vào **từng tòa** theo %; khác nhau giữa các tòa | Báo cáo T6 | ✅ |
| D09 | Kỳ báo cáo | Tháng dương lịch; kỳ hóa đơn chốt ngày 22 nhưng báo cáo theo tháng thu tiền | HD | 🟡 |

### 1.2. Giá & hợp đồng thuê phòng

| # | Thuật ngữ | Định nghĩa hiện hiểu | Trạng thái |
|---|---|---|---|
| D10 | Giá niêm yết | Giá công bố của phòng; **mẫu số tính hiệu suất** | ✅ |
| D11 | Giá QL | Mức sàn quản lý được tự quyết khi chốt khách | 🟡 |
| D12 | Giá phòng hiện tại (giá chốt) | Giá ký thực trên HĐ; cơ sở tiền phòng & hoa hồng | ✅ |
| D13 | Kỳ TT (1 / 3) | Số tháng đóng 1 lần (1 = hàng tháng, 3 = quý) | 🟡 |
| D14 | Ngày ở / Ngày DV (30) | Số ngày tính tiền phòng / tính dịch vụ trong tháng; <30 = prorate | 🟡 — chia 30 hay số ngày thực? |
| D15 | Số người | Số người ở thực tế → cơ sở tính nước, vệ sinh, máy giặt, combo | ✅ |
| D16 | Nợ cũ | Số còn thiếu kỳ trước, cộng dồn vào hóa đơn kỳ này (1 dòng, không tách hóa đơn) | ✅ |
| D17 | Thu khác | Khoản thu ngoài bảng giá (phạt, đền bù, bán đồ…) | 🟡 |
| D18 | Điện chung | Điện khu vực chung phân bổ cho phòng | 🟡 — phân bổ theo phòng hay người? |
| D19 | DV khác / Combo 120k/người | = 60k vệ sinh + 60k máy giặt (báo cáo chia đôi) | 🟡 |
| D20 | Tình trạng Đủ / Thiếu / Chưa TT | Đã đóng = cần đóng / đóng một phần / chưa đóng | ✅ |
| D21 | Công nợ | Tổng cần đóng − Tổng đã đóng (âm = còn nợ) | ✅ |
| D22 | Cọc khách cũ / Cọc | Cọc đang giữ của khách hiện tại / cọc thu mới trong tháng | 🟡 |

### 1.3. Trạng thái phòng & sự kiện HĐ (dùng đếm trên báo cáo)

| # | Thuật ngữ | Định nghĩa hiện hiểu | Trạng thái |
|---|---|---|---|
| D23 | Phòng mới | Phòng có HĐ mới với **ngày vào ở trong tháng** (kể cả phòng cũ có khách mới) | 🟡 |
| D24 | Phòng trống | Phòng **không có HĐ hiệu lực tại ngày cuối tháng** (gồm phòng HĐ hết đúng cuối tháng) | ✅ |
| D25 | Phòng phá HĐ | HĐ kết thúc **trước hạn do phía khách**, tính tháng có ngày ra thực tế | 🟡 |
| D26 | Khách chuyển phòng nội bộ | Không tính phòng mới/phá HĐ; cọc chuyển theo | 🟡 |
| D27 | Khách bỏ cọc | Đã đặt cọc/vào ở vài ngày rồi bỏ; không ký HĐ dài hạn | 🟡 |
| D28 | HĐ hết hạn đúng ngày | Không phải phá HĐ; phòng trống nếu không gia hạn | 🟡 |

### 1.4. Chỉ tiêu tài chính trên báo cáo

| # | Thuật ngữ | Định nghĩa hiện hiểu | Trạng thái |
|---|---|---|---|
| D29 | Tổng doanh thu | **Tổng tiền khách thực đóng trong tháng** (= cột Tổng đã đóng), gồm cọc mới, cọc bỏ, trừ hoàn cọc | 🟡 |
| D30 | Cọc phòng mới | Cọc thu của phòng có khách mới trong tháng | ✅ |
| D31 | Cọc khách bỏ không ở | Phần cọc bị mất khi khách bỏ; ghi nhận tháng báo bỏ | 🟡 |
| D32 | Hoàn cọc | Tiền cọc trả lại khách trong tháng (sau khấu trừ) | 🟡 |
| D33 | Doanh thu tiền phòng | Σ tiền phòng đã thu, trừ phòng đã trả, cộng prorate phòng mới | ✅ |
| D34 | Doanh thu dịch vụ (7 loại) | Điện, nước, vệ sinh, mạng, xe điện, thang máy, máy giặt | ✅ |
| D35 | Tiền thuê nhà 1 tháng | Tiền trả chủ nhà theo HĐ đầu vào (114tr/tháng mẫu) | ✅ |
| D36 | Mua thêm thiết bị | Thiết bị mua trong tháng cho tòa (tính thẳng vào giá vốn, không khấu hao) | 🟡 |
| D37 | Giá gốc dịch vụ | Tiền thực trả nhà cung cấp điện/nước/mạng/rác/môi trường/thang máy theo tòa/tháng — **import vào module Chi phí** | ✅ |
| D38 | Giá vốn (GV) | Tiền thuê nhà + thiết bị + giá gốc DV | ✅ |
| D39 | Chi phí vận hành (lương…) | Lương **cố định** phân bổ theo phòng + lương hiệu suất gắn tòa | ✅/🟡 |
| D40 | Chi phí bán hàng phát sinh | Marketing, hoa hồng, sửa chữa/thay thế/bảo trì, chi phí khác | ✅ |
| D41 | CPBH (tổng chi phí bán hàng) | = mọi chi phí ngoài giá vốn (gồm cả lương, VP) — tên gọi khác nghĩa kế toán | ✅ |
| D42 | TCP / LNG / LNR | GV + CPBH / DT − GV / DT − TCP | ✅ |
| D43 | Vốn (bảng cổ phần) | = Tiền thuê nhà 1 tháng × % cổ đông | 🟡 |
| D44 | Tổng nhận (cổ đông) | Vốn + LN ròng — minh họa, không phải số chi | 🟡 |

### 1.5. Hiệu suất & lương

| # | Thuật ngữ | Định nghĩa hiện hiểu | Trạng thái |
|---|---|---|---|
| D45 | DT niêm yết | Σ giá niêm yết các phòng đang thuê của tòa | ✅ |
| D46 | DT phải thu | Σ tổng cần đóng (tiền phòng + DV + nợ cũ) của tòa trong tháng | ✅ |
| D47 | Mốc M1 / M2 / M3 | Số thu lũy kế đến ngày 5 / 10 / 15; DT mốc = phần tăng thêm | ✅ |
| D48 | DT thu thêm | Tiền thu sau mốc 3 nhưng trước chốt lương (hoặc thu nợ cũ) | 🟡 |
| D49 | Tổng DT thu được | Phần **tiền phòng** đã thu dùng tính hiệu suất (đã loại dịch vụ) | 🟡 |
| D50 | Hiệu suất (%) | Tổng DT thu được / DT niêm yết | ✅ |
| D51 | Mức lương/phòng | Đơn giá theo bậc NV × hiệu suất, có ngưỡng giảm | 🟡 |
| D52 | Lương trưởng nhóm / Lương hỗ trợ | Khoản cố định theo quyết định | 🟡 |
| D53 | DT phá HĐ / Tỷ lệ phá HĐ | Doanh thu mất do phá HĐ / DT phải thu của tòa | ✅ |

### 1.6. Hoa hồng

| # | Thuật ngữ | Định nghĩa hiện hiểu | Trạng thái |
|---|---|---|---|
| D54 | Giá chốt | Giá phòng ký HĐ (cơ sở HH); với bỏ cọc = cọc mất sau trừ ngày ở | ✅ |
| D55 | Mức HH | 50% (ngoài/lead) · 35% (NV) · HĐ<6 tháng: mức ÷6 × tháng · trùng: ÷ số nguồn | 🟡 |
| D56 | Tình trạng TT "đủ" | Khách đã đóng đủ cọc + đã ký xong HĐ | ✅ |
| D57 | Ngày TT "Đã tt" | Đã chuyển hoa hồng cho người nhận | ✅ |
| D58 | Tổng nhận | Gộp các deal cùng người nhận trong tháng → 1 lệnh chuyển | ✅ |

---

## PHẦN 2 — CÔNG THỨC CẦN BIẾT

### 2.1. Đã đọc được từ ô công thức (`Báo cáo tháng 6`)

| # | Chỉ tiêu | Công thức | Ghi chú |
|---|---|---|---|
| F01 | Tổng doanh thu | `= HĐ tòa!AX2` (Σ Tổng đã đóng) | cash basis |
| F02 | DT tiền phòng | `= Σ Giá hiện tại − Σ giá phòng đã trả + Σ tiền phòng prorate phòng mới` | |
| F03 | DT điện | `= Σ Điện thành tiền` (không trừ phòng đã trả) | |
| F04 | DT nước / mạng / thang máy | `= Σ thành tiền − phòng đã trả + phòng mới` | |
| F05 | DT xe điện | `= Σ thành tiền − phòng đã trả` | |
| F06 | DT vệ sinh = DT máy giặt | `= (Σ Combo − phòng đã trả + phòng mới) / 2` | combo 120k chia đôi |
| F07 | DT tổng dịch vụ | `= Σ F03..F06` | |
| F08 | Giá vốn | `= Tiền thuê nhà + Thiết bị + Σ giá gốc DV` | |
| F09 | Lương quản lý tổng | `= (12.000.000 / N_phòng_hệ_thống) × N_phòng_tòa` | N = 1.303 (T6) |
| F10 | Lương TPVH | `= (21.000.000 / N) × n + 10.000 × n` | +10k/phòng |
| F11 | Lương NV nguồn | `= (3.000.000 / N) × n` | |
| F12 | Lương NVKD | `= (Σ lương NVKD tháng / N) × n` | từ bảng lương |
| F13 | Lương vệ sinh | `= 550.000` | cố định/tòa |
| F14 | Lương kế toán | `= 150.000 + 10.000 + (2.000.000 / N) × n` | |
| F15 | Lương sửa chữa | `= (22.000.000 / N) × n` | |
| F16 | Thuê & DV VP | `= (Chi phí VP tháng / N) × n` | |
| F17 | Marketing | `= (Marketing tháng / N) × n` | |
| F18 | CPBH | `= Σ (lương + VP + marketing + hoa hồng + sửa chữa + CP khác)` | |
| F19 | TCP | `= GV + CPBH` | |
| F20 | LNG | `= DT − GV` | |
| F21 | LNR | `= DT − TCP` | |
| F22 | 8 tỷ lệ | LNR/DT, LNG/DT, LNR/GV, LNR/LNG, TCP/LNG, GV/DT, CPBH/DT, TCP/DT | |
| F23 | LƯƠNG/CPBH | `= Σ dòng lương (không gồm VP) / CPBH` | |
| F24 | HH/CPBH | `= (Marketing + Hoa hồng) / CPBH` | |
| F25 | CPK/CPBH | `= Chi phí khác / CPBH` | |
| F26 | Vốn cổ đông | `= % × Tiền thuê nhà 1 tháng` | |
| F27 | LN gộp / LN ròng cổ đông | `= % × LNG` / `= % × LNR` | |
| F28 | Tổng nhận cổ đông | `= Vốn + LN ròng` | |
| F29 | DT DV/Giá nhập (BC tổng) | `= DT tổng DV / Σ giá gốc DV` | |
| F30 | DT tiền nhà/Giá thuê nhà (BC tổng) | `= DT tiền phòng / Tiền thuê nhà` | |

### 2.2. Đã đọc được từ file `Hoa hồng`

| # | Chỉ tiêu | Công thức |
|---|---|---|
| F31 | Tòa | `= RIGHT(mã phòng, LEN − 3)` |
| F32 | Thành tiền | `= Giá chốt × Mức HH` |
| F33 | Mức theo nguồn | `= IF(Team kết thúc "(LEAD)", 50%, 35%)` |
| F34 | Mức HĐ ngắn | `= 50% / 6 × số tháng` (3 tháng → 25%, 2 tháng → 16,67%) |
| F35 | Trùng nguồn | `= 50% / số nguồn` |
| F36 | Cơ sở HH bỏ cọc | `= Cọc − Giá thuê / 31 × số ngày đã ở` |
| F37 | Khấu trừ CTV | `= Thành tiền − tiền hỗ trợ CTV` |
| F38 | Tổng nhận | `= SUM(Thành tiền các dòng cùng người nhận)` |

### 2.3. Suy ra từ số liệu (sheet đã mất công thức) — cần xác nhận

| # | Chỉ tiêu | Công thức suy ra | Kiểm chứng |
|---|---|---|---|
| F39 | Tổng DT sau 3 mốc | `= M1 + M2 + M3` | khớp |
| F40 | Tỉ lệ DV/DT | `= Dịch vụ / DT phải thu` | khớp |
| F41 | Tổng DT thu được | `= Tổng 3 mốc × (1 − Tỉ lệ DV/DT) + DT thu thêm` | khớp mọi dòng |
| F42 | Hiệu suất | `= Tổng DT thu được / DT niêm yết × 100` | khớp |
| F43 | Lương hiệu suất tòa | `= Số phòng × Mức lương/phòng` | khớp |
| F44 | Thực nhận | `= LCB + ăn trưa + xăng xe + trưởng nhóm + hỗ trợ + Σ lương HS` | khớp |
| F45 | Mức lương/phòng | `= Đơn giá bậc (120k/130k) × Hiệu suất × hệ số ngưỡng`; tòa mới 100k | gần khớp |
| F46 | DT mốc 1/2/3 | `= Thu lũy kế ngày 5 / (ngày 10 − ngày 5) / (ngày 15 − ngày 10)` | khớp |
| F47 | Tỷ lệ thu (%) | `= DT thu được / DT phải thu` | khớp |
| F48 | Tỷ lệ phá HĐ | `= DT phá HĐ / DT phải thu` | khớp |
| F49 | Prorate tiền phòng | `= Giá × ngày ở / 30` (sổ) hoặc `/ số ngày thực` (hoa hồng) | ❓ mâu thuẫn |

### 2.4. Chưa có công thức — phải hỏi

| # | Chỉ tiêu | Cần biết |
|---|---|---|
| F50 | Lương quản lý tòa (dòng C35) | Lấy từ ô nào của bảng lương; là lương HS của tòa hay phân bổ |
| F51 | Lương trưởng nhóm TPVH/TNVH | Cố định hay % lương HS team |
| F52 | Hệ số ngưỡng hiệu suất | Bảng bậc chính thức (<95%, <93%, <90%…) |
| F53 | Số phòng mẫu số phân bổ (N) | Tổng phòng quản lý hay phòng đang thuê; tại thời điểm nào |
| F54 | Lương vệ sinh 550k | Cố định mọi tòa hay theo diện tích/số phòng |
| F55 | Điện chung | Cách chia cho phòng |
| F56 | Phí phạt trễ hạn 200k/ngày | Có tự sinh dòng hóa đơn không; ai duyệt |

---

## PHẦN 3 — CÂU HỎI CẦN LÀM RÕ (theo từng dòng báo cáo)

### 3.1. Khối doanh thu

| # | Câu hỏi | Vì sao cần | Dữ liệu phải quản lý nếu "có" | Trạng thái |
|---|---|---|---|---|
| Q01 | Tổng doanh thu là **thực thu** (cash) hay **hóa đơn phát hành** (accrual)? | Quyết định Report Engine đọc Payment hay Invoice | Payment.paid_at, allocation → invoice line | 🟡 cash |
| Q02 | Tiền thu của hóa đơn tháng trước nhưng nộp tháng này tính doanh thu tháng nào? | Chống đếm trùng/khớp Golden | Payment.period vs Invoice.period | 🟡 tháng nộp |
| Q03 | Cọc phòng mới: tính khi thu cọc hay khi khách vào ở? Cọc giữ chỗ chưa vào ở tính không? | Dòng "Cọc phòng mới" | Deposit Ledger: paid_at, contract.move_in_date | ✅ theo ngày vào ở |
| Q04 | Cọc khách bỏ: ghi nhận ngày báo bỏ hay ngày quyết toán? Số = toàn bộ cọc hay cọc − ngày đã ở? | Dòng "Cọc khách bỏ" | Contract Event `abandon` + forfeited_amount | 🟡 |
| Q05 | Hoàn cọc trừ khỏi doanh thu tháng nào (tháng ra hay tháng chi)? | Dòng "Hoàn cọc" | Refund Case.paid_at | 🟡 tháng chi |
| Q06 | Phòng trả giữa tháng: tiền phòng tháng đó tính thế nào (trừ hết, prorate, trừ vào cọc)? | F02 trừ nguyên giá | Final invoice + deposit deduction | ❌ |
| Q07 | Điện/nước phòng đã trả có tính doanh thu không (F03 tính, F04 không)? | Mâu thuẫn giữa các dòng | Invoice line của hóa đơn cuối | ❌ |
| Q08 | Prorate theo /30 hay /số ngày thực của tháng? | F49 mâu thuẫn | Rule cấu hình | ❌ |
| Q09 | Khách chuyển phòng nội bộ: phòng cũ có tính "phá HĐ", phòng mới có tính "phòng mới"? | Đếm phòng | Contract Event `transfer` | 🟡 không |
| Q10 | Combo 120k chia đôi vệ sinh/máy giặt áp dụng mọi tòa? Tòa có vệ sinh 30k riêng (T18) thì sao? | F06 | Service catalog theo tòa | 🟡 |
| Q11 | "Thu khác" (cột N sổ tòa) vào dòng nào của báo cáo? | Khớp tổng | Invoice line `other` | ❌ |
| Q12 | Điện chung: tính vào DT điện hay dòng riêng? | F03 | Service `common_electric` | ❌ |
| Q13 | Kỳ TT = 3 (đóng quý): doanh thu ghi 1 lần hay chia 3 tháng? | Cash vs accrual | Invoice.billing_months | ❌ |
| Q14 | Số phòng phá HĐ / mới / trống trên BC tổng đếm theo tòa rồi cộng, hay đếm sự kiện? | Chống trùng | Contract Event + Room Status History | 🟡 |

### 3.2. Khối giá vốn & chi phí

| # | Câu hỏi | Vì sao cần | Dữ liệu phải quản lý | Trạng thái |
|---|---|---|---|---|
| Q15 | Tiền thuê nhà: ghi theo tháng dù trả quý; có tháng miễn/giảm (setup) không? | Dòng GV lớn nhất | HĐ đầu vào: rent, payment_cycle, free_months | ❌ |
| Q16 | Mua thiết bị: tính hết vào tháng mua hay có ngưỡng chuyển tài sản? | GV | Expense vs Asset (Phase 2) | 🟡 tính hết |
| Q17 | Giá gốc điện/nước: theo hóa đơn nhà cung cấp (kỳ của EVN) hay theo kỳ chốt 22? | Lệch kỳ | Expense.period mapping (import) | 🟡 theo tháng hóa đơn NCC |
| Q18 | Điện nước phòng trống nằm ở giá gốc hay chi phí khác? | Phân loại | Expense category | 🟡 giá gốc |
| Q19 | Danh sách chi phí chung được phân bổ và tổng tiền mỗi khoản lấy từ đâu mỗi tháng? | F09–F17 | Expense (import) + Payroll (lương) | ✅ import vào Chi phí; lương từ bảng lương |
| Q20 | Mẫu số phân bổ N = phòng gì, chốt thời điểm nào? | F53 | Room master + snapshot | 🟡 |
| Q21 | Lương cố định (LCB, phụ cấp) của NVVH phân bổ vào các tòa họ quản lý hay toàn hệ thống? | Dòng "Lương quản lý" | Payroll snapshot NV×tòa | ❌ |
| Q22 | Lương hiệu suất của NVVH gắn thẳng tòa (không phân bổ)? | B3 answer.md | Payroll line theo tòa | 🟡 có |
| Q23 | Lương TPVH/TNVH/kế toán/sửa chữa/nguồn: số 12tr, 21tr, 3tr, 2tr, 22tr là cố định hay lấy từ bảng lương? | F09–F15 hard-code | Payroll by position | ❌ |
| Q24 | Vệ sinh 550k/tòa: cố định hay theo bảng lương vệ sinh chia số tòa? | F13 | Rule | ❌ |
| Q25 | Hoa hồng ghi vào tháng khách "đủ", tháng ký HĐ hay tháng trả tiền? | Dòng hoa hồng | Commission.recognized_period | 🟡 tháng trả |
| Q26 | Sửa chữa/thay thế/bảo trì: sửa cho phòng khách gây hỏng (khấu trừ cọc) có ghi chi phí không? | Tránh đếm 2 lần | Expense ↔ Deposit deduction link | ❌ |
| Q27 | "Chi phí khác" gồm gì (công an tạm trú, biển xe, dọn phòng…)? Có danh mục con không? | Category | Expense subcategory | ❌ |
| Q28 | Chi phí VP & marketing: nguồn từ file chi phí VP — có tách theo nhóm T/S/G không? | BC tổng | Expense.scope (import: tòa / nhóm / toàn hệ thống) | 🟡 import với cột phạm vi; mặc định toàn hệ thống rồi phân bổ theo phòng |

### 3.3. Khối lương & hiệu suất

| # | Câu hỏi | Vì sao cần | Dữ liệu phải quản lý | Trạng thái |
|---|---|---|---|---|
| Q29 | Xác nhận F41 (loại dịch vụ theo tỷ lệ) là đúng công thức gốc? | Lõi payroll | Payroll Rule | 🟡 |
| Q30 | Bảng bậc mức lương/phòng theo bậc NV & ngưỡng hiệu suất | F45/F52 | Payroll Rule version | ❌ |
| Q31 | Tiêu chí xếp bậc 120k vs 130k (thâm niên? số phòng?) | F45 | Employee.grade | ❌ |
| Q32 | Tòa mới: bao lâu thì hết áp 100k cố định? | F45 | Building.operation_start | ❌ |
| Q33 | Mốc M1/M2/M3 có trọng số/thưởng thu sớm không? | C2 | Rule | 🟡 không |
| Q34 | DT thu thêm là gì, chốt đến ngày nào? | D48 | Payment.paid_at cutoff | ❌ |
| Q35 | Ngày chốt bảng lương (thu sau ngày đó tính kỳ sau?) | Snapshot | Payroll period cutoff | ❌ |
| Q36 | Nợ phá HĐ thu hồi được ở tháng sau tính cho ai, kỳ nào? | Hiệu suất | Payment → old contract | ❌ |
| Q37 | Đổi quản lý tòa giữa tháng: hiệu suất tháng đó chia thế nào? | Snapshot | Assignment effective dates | ❌ |
| Q38 | Lương trưởng nhóm/hỗ trợ: cố định hay công thức? | F51 | Payroll component | 🟡 nhập tay |
| Q39 | Chi lương thực tế (ngày chi, tài khoản) có cần lưu để báo cáo dòng tiền? | §4.26.8 | Salary Payment | ❌ |

### 3.4. Khối hoa hồng

| # | Câu hỏi | Vì sao cần | Dữ liệu phải quản lý | Trạng thái |
|---|---|---|---|---|
| Q40 | Bảng mức HH chính thức theo nguồn (ngoài/lead/NV) và thời hạn | F33–F34 | Commission Policy | 🟡 |
| Q41 | HĐ 6 tháng: 50% hay 35% — theo nguồn hay theo thời hạn? | Dữ liệu lẫn | Policy | 🟡 theo nguồn |
| Q42 | Trùng nguồn: chia đều hay theo thỏa thuận? Ai xác nhận "trùng"? | F35 | Case.split | 🟡 chia đều |
| Q43 | Bỏ cọc: HH tính trên cọc mất; đã trả HH rồi khách bỏ có thu hồi? | F36 | Case.clawback | 🟡 không |
| Q44 | Trả nhiều đợt (8% + 42%): rule đợt là gì? | Payout | Payout schedule | ❌ |
| Q45 | "Đủ" xác định bởi ai, dựa vào dữ liệu nào trong hệ thống? | D56 | Contract.status + Deposit paid | ✅ |
| Q46 | Hoa hồng cho khách gia hạn/tái ký có không? | Policy | Contract Event `renew` | ❌ |
| Q47 | QLY trên dòng HH có được nhận % nào không (ngoài Team)? | D07 | Case.beneficiaries | ❌ |
| Q48 | Khách đổi phòng sau chốt: HH theo giá phòng nào? | D04 answer | Case.room_original | 🟡 phòng chốt |

### 3.5. Khối cổ đông

| # | Câu hỏi | Vì sao cần | Dữ liệu phải quản lý | Trạng thái |
|---|---|---|---|---|
| Q49 | Vốn của tòa = 1 tháng tiền thuê nhà hay tổng đầu tư ban đầu (cải tạo, thiết bị)? | F26 | Capital Call theo tòa | 🟡 |
| Q50 | Tổng nhận = Vốn + LNR có chi thực không? Chu kỳ chia LN (tháng/quý)? | Payout | Distribution.status | 🟡 minh họa |
| Q51 | Chia theo LN ròng của tháng hay lũy kế (bù lỗ tháng trước)? | Rule | Distribution basis | ❌ |
| Q52 | Cổ đông vào/ra giữa kỳ: prorate ngày hay lấy tỷ lệ cuối kỳ? | §4.30 | Share effective dates | 🟡 cuối kỳ |
| Q53 | Cổ đông có góp thêm khi tòa lỗ/mua thiết bị lớn? | Capital call | Capital Call | ❌ |
| Q54 | Có cổ đông cấp công ty (chia trên BC tổng) hay chỉ theo tòa? | BC tổng | Shareholder scope | ❌ |

### 3.6. Vận hành, tổ chức, kỳ

| # | Câu hỏi | Vì sao cần | Dữ liệu phải quản lý | Trạng thái |
|---|---|---|---|---|
| Q55 | Ngày chốt số điện nước (22) giống mọi tòa? Ai nhập chỉ số? | Kỳ hóa đơn | Building.meter_cutoff_day | 🟡 |
| Q56 | Hạn thanh toán 25–cuối tháng: phạt 200k/ngày có thu thật? | F56 | Penalty line | ❌ |
| Q57 | Đơn giá dịch vụ theo tòa: danh sách tòa khác mặc định | §4.12 | Service price override | ❌ |
| Q58 | Tài khoản nhận tiền (VP-Hằng / Techcombank): có ý nghĩa báo cáo (theo pháp nhân)? | Sổ HĐ (VP)/(TECH) | Payment.receiving_account | ❌ |
| Q59 | Quy tắc tăng số mã khách `A001` khi khách mới vào phòng | D04 | Customer code generator | ❌ |
| Q60 | Vai trò kỹ thuật/vệ sinh có phân công theo tòa không, hay theo khu vực? | §4.25 | Assignment.role | ❌ |
| Q61 | Lead cần thấy gì của cấp dưới ở Phase 1 (queue, công nợ, hiệu suất) — có cần giao việc/tiến độ? | Work Queue vs Work Order | Task (Phase 2) | 🟡 Work Queue |
| Q62 | Khi nào khóa kỳ báo cáo; ai duyệt; sửa sau khóa xử lý thế nào? | Snapshot | Report Period state | 🟡 |
| Q63 | Nhóm T/S/G: ý nghĩa thật (pháp nhân? khu vực? giai đoạn?) và có tòa đổi nhóm không? | BC tổng | Building type history | 🟡 |
| Q64 | HĐ đầu vào: có tòa thuê nhiều chủ/nhiều HĐ, hoặc 1 HĐ nhiều tòa? | Master | Landlord Contract ↔ Building n-n? | ❌ |

---

## PHẦN 4 — DỮ LIỆU PHẢI QUẢN LÝ ĐỂ SINH TỪNG DÒNG BÁO CÁO

| Dòng báo cáo | Nguồn hệ thống | Field tối thiểu | Cách nhập |
|---|---|---|---|
| Tổng doanh thu | Payment + Allocation | paid_at, amount, receiving_account, invoice_line_id | Thu tiền (nhập/import sao kê) |
| Cọc phòng mới | Deposit Ledger | contract_id, type=`collect`, paid_at, move_in_date | Từ HĐ mới |
| Cọc khách bỏ | Deposit Ledger + Contract Event | type=`forfeit`, event_date, days_stayed | Sự kiện bỏ cọc |
| Hoàn cọc | Refund Case | approved_at, paid_at, amount, deductions[] | Workflow hoàn cọc |
| Số phòng phá HĐ | Contract Event | type=`early_termination`, actual_end_date, reason | Kết thúc HĐ |
| Số phòng mới | Contract | move_in_date trong kỳ | HĐ/OCR |
| Số phòng trống | Room Status History | status tại ngày cuối kỳ | Tự động |
| DT tiền phòng | Invoice Line (`rent`) đã thu | amount, prorate_days | Hóa đơn |
| DT 7 dịch vụ | Invoice Line theo service_code | service_code, qty, unit_price, amount | Hóa đơn + chỉ số |
| Tiền thuê nhà | Landlord Contract | monthly_rent, effective dates | HĐ đầu vào |
| Mua thiết bị | Expense (GV/thiết bị) | building_id, period, amount | Import chi phí |
| Giá gốc 6 loại DV | Expense (GV/giá gốc) | building_id, period, service_code, amount | Import chi phí |
| 10 dòng lương | Payroll snapshot + Allocation | employee, position, fixed_components, perf_by_building | Bảng lương khóa |
| Thuê & DV VP, Marketing | Expense (chung) + Allocation | amount, method=`by_room`, N, n | Import + rule |
| Hoa hồng | Expense (CPBH/HH) ← Commission | building_id, room, recipient, rate, base, amount, paid_at | Import file HH |
| Sửa chữa, CP khác | Expense | category, building_id, amount, note | Nhập tay |
| GV, CPBH, TCP, LNG, LNR, tỷ lệ | Metric Engine | metric_code, version, formula | Tự động |
| Bảng cổ phần | Building Share + Distribution | shareholder, pct, effective, capital_base | Module cổ đông |
| Cột T/S/G (BC tổng) | Building Type History | type, effective_from | Tòa |

---

## PHẦN 5 — DỮ LIỆU CẦN XIN THÊM

1. `bảng lương tháng 6.xlsx` (bản có công thức) → F41–F45, F50–F52.
2. `cập nhật thu tiền tháng 6 chuẩn.xlsx` → sheet NHÀ T/S/G, PHÒNG MỚI, HOÀN CỌC, ĐIỆN NƯỚC PHÒNG TRỐNG, HĐ (VP)/(TECH) → Q01–Q14, Q58.
3. `G1.31.8.26.xlsx` → ĐẦU TƯ BAN ĐẦU, THU CHI BAN ĐẦU → Q49–Q53.
4. `chi phí văn phòng tháng 6.xlsx` → Q19, Q28.
5. File nguồn của `Báo cáo kinh doanh Tháng 8` (bản còn công thức) để đối chiếu cách cộng T/S/G.
6. Bảng bậc lương, chính sách hoa hồng, danh sách tòa & nhóm T/S/G, danh sách đơn giá dịch vụ theo tòa.
