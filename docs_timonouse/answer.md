# TimoHouse — Trả lời & giả định cho các câu hỏi nghiệp vụ mở

Ký hiệu:
- **[ĐÃ TRẢ LỜI]** — câu trả lời của công ty (giữ nguyên ý gốc).
- **[GIẢ ĐỊNH]** — Claude giả định dựa trên công thức/số liệu trong `Timohouse.xlsx`, `Hoa hồng năm 2025-2026.xlsx`, HĐ mẫu và spec v1.8. Cần công ty xác nhận trước khi chốt.

---

## A. Doanh thu & báo cáo

### A1. Các tỷ lệ % trong 2 báo cáo tính từ đâu? — [ĐÃ TRẢ LỜI]
> Hãy xem 2 file báo cáo và số liệu của nó. Các phần tính toán %, tỷ lệ đều có công thức lấy từ các số liệu trước đó để ra kết quả. Tìm hiểu và phân tích kỹ.

Công thức đã đọc từ ô trong `Báo cáo tháng 6` (G1) và khớp với `Báo cáo kinh doanh Tháng 8`:

```
GV   = Tiền thuê nhà + Mua thiết bị + Giá gốc điện + nước + mạng + rác + môi trường + thang máy
CPBH = Σ lương phân bổ + Thuê & DV VP + Marketing + Hoa hồng + Sửa chữa + Chi phí khác
TCP  = GV + CPBH
LNG  = Tổng DT − GV
LNR  = Tổng DT − TCP

Tỷ lệ LNR/DT  = LNR / Tổng DT
Tỷ lệ LNG/DT  = LNG / Tổng DT
Tỷ lệ LNR/GV  = LNR / GV
Tỷ lệ LNR/LNG = LNR / LNG
CP/LNG        = TCP / LNG
GV/DT         = GV / Tổng DT
CPBH/DT       = CPBH / Tổng DT
TCP/DT        = TCP / Tổng DT
LƯƠNG/CPBH    = Σ(các dòng lương, KHÔNG gồm Thuê & DV VP) / CPBH
HH/CPBH       = (Marketing + Hoa hồng) / CPBH
CPK/CPBH      = Chi phí khác / CPBH
DT DV/GIÁ NHẬP           = DT tổng dịch vụ / Σ giá gốc dịch vụ        (chỉ có ở báo cáo tổng)
DT TIỀN NHÀ/GIÁ THUÊ NHÀ = DT tiền phòng / Tiền thuê nhà 1 tháng      (chỉ có ở báo cáo tổng)
```

Mọi tỷ lệ là metric dẫn xuất → hệ thống chỉ cần lưu số gốc + Metric Definition có version.

### A2. "Tổng doanh thu" gồm những khoản nào? — [GIẢ ĐỊNH]
Công thức thật: `Tổng doanh thu = 'HĐ T6.26'!AX2` = cột **Tổng đã đóng**.

Giả định:
- Tổng doanh thu tháng = **tổng tiền khách thực đóng trong tháng** (cash basis) = tiền phòng + dịch vụ + cọc phòng mới thu trong tháng + cọc khách bỏ không ở − hoàn cọc.
- Hóa đơn phát hành nhưng chưa thu **không** tính vào doanh thu tháng; thu ở tháng nào tính doanh thu tháng đó.
- Công nợ theo dõi ở báo cáo công nợ riêng, không trộn vào báo cáo kinh doanh.

### A3. Cọc phòng mới — [ĐÃ TRẢ LỜI]
> Cọc phòng mới là trong tháng đó có phát sinh phòng thuê mới, kiểu ngày 10, 15 có người thuê phòng thì sẽ lấy cọc phòng đó tính vào làm báo cáo.

Diễn giải để implement: cọc thu được của HĐ có ngày vào ở nằm trong kỳ báo cáo → ghi nhận vào dòng "Cọc phòng mới" của tháng đó (G1 tháng 6: P401 3,8tr + P402 3,8tr).

### A4. Cọc khách bỏ không ở ghi nhận khi nào? — [GIẢ ĐỊNH]
- Ghi nhận vào tháng khách **báo bỏ** (ngày ghi trong file hoa hồng: "báo bỏ 2/8" → tháng 8).
- Số ghi nhận = phần cọc bị mất (cọc − tiền nhà theo ngày đã ở nếu khách có ở vài ngày). G1 tháng 6: P601 1.000.000.
- Hoa hồng của deal bỏ cọc tính trên cùng cơ sở này (xem D3).

### A5. Hoàn cọc — [GIẢ ĐỊNH]
- Trừ khỏi Tổng doanh thu của tháng **thực chi hoàn** (không phải tháng kết thúc HĐ).
- Số hoàn = cọc đang giữ − công nợ − phạt − sửa chữa/vệ sinh − khấu trừ khác (Deposit Ledger §4.18).

### A6. Định nghĩa "phòng mới" — [GIẢ ĐỊNH]
- Phòng có **HĐ mới có ngày vào ở trong tháng**, kể cả phòng cũ vừa có khách mới (P401/P402 tháng 6 vừa là phòng phá HĐ vừa là phòng mới).
- Tiền phòng tháng đầu tính **prorate theo ngày ở / số ngày thực của tháng** (sheet PHÒNG MỚI: 1,3tr, 760k). Lưu ý file hoa hồng dùng /31 cho tháng 31 ngày → giả định dùng số ngày thực của tháng, không cố định 30.
- Khách chuyển phòng nội bộ (302 → 303) không tính là phòng mới, không thu cọc mới (cọc chuyển theo).

### A7. Định nghĩa "phòng trống" — [ĐÃ TRẢ LỜI]
> Phòng trống: là phòng chưa có người thuê. Phòng trống cuối tháng là hết tháng phòng đó hết HĐ và sẽ trống.

Diễn giải: "Tổng số phòng trống" trên báo cáo = số phòng **không có HĐ hiệu lực tại ngày cuối kỳ** (bao gồm phòng HĐ kết thúc đúng cuối tháng). Phòng chờ dọn/bảo trì cũng được đếm là trống.

### A8. Định nghĩa "phòng phá HĐ" — [GIẢ ĐỊNH]
- HĐ kết thúc **trước hạn** do phía khách (bỏ trốn, về quê, chuyển chỗ làm, không đủ tài chính, không chấp nhận tăng giá…), tính vào tháng có **ngày ra thực tế**.
- HĐ hết hạn đúng ngày hoặc công ty chủ động chấm dứt → không tính phá HĐ.
- Nợ còn lại của phòng phá HĐ theo dõi ở `DS phòng phá HĐ` (tổng phải thu / đã thu) và trừ vào tỷ lệ thu của quản lý.

### A9. DT tiền phòng trừ phòng đã trả nhưng điện/nước vẫn tính đủ — [GIẢ ĐỊNH]
- Là chủ ý: phòng trả trong tháng vẫn phải **chốt và thanh toán điện nước đến ngày ra** (qua hóa đơn cuối/quyết toán cọc) nên vào doanh thu dịch vụ; tiền phòng tháng đó không thu nên trừ.
- Hệ thống thay công thức trừ tay bằng: DT tiền phòng = Σ dòng "Tiền phòng" trên hóa đơn **đã thu** trong kỳ (tự nhiên loại phòng đã trả, tự nhiên gồm prorate phòng mới).

### A10. Điều chỉnh kỳ sau (thu thừa, hoàn, sửa hóa đơn) — [GIẢ ĐỊNH]
- Kỳ đã **Locked** không sửa; phát sinh điều chỉnh ghi vào kỳ hiện tại dưới dạng dòng điều chỉnh có tham chiếu chứng từ gốc.
- Reopen kỳ chỉ khi được duyệt và phải tạo snapshot mới (giữ snapshot cũ để đối chiếu).

---

## B. Chi phí & phân bổ

### B1. Phương pháp phân bổ chi phí chung — [GIẢ ĐỊNH — đọc từ công thức]
Công thức thật: `=(Tổng chi phí / 1303) × số phòng tòa`.

- Chi phí chung (lương quản lý tổng, TPVH, NV nguồn, NVKD, kế toán, sửa chữa, thuê & DV VP, marketing) phân bổ **theo số phòng**.
- Có phần cố định: TPVH thêm 10.000đ/phòng; kế toán 150.000 + 10.000/tòa; **vệ sinh 550.000/tòa cố định** (không phân bổ).
- Rule phân bổ lưu theo version; mỗi lần chạy báo cáo lưu snapshot (tổng chi phí, mẫu số, số phòng tòa).

### B2. Mẫu số phân bổ (1.303 phòng) là gì? — [GIẢ ĐỊNH]
- = **Tổng số phòng đang quản lý toàn hệ thống tại cuối kỳ** (kể cả phòng trống, không kể tòa đã trả chủ nhà).
- Bảng lương tháng 8 ghi 1.079 phòng là số phòng **có phân công quản lý đang tính hiệu suất**, khác mẫu số phân bổ. Hệ thống tính tự động cả hai từ master phòng + phân công.

### B3. Dòng "Lương quản lý" của tòa lấy từ đâu? — [ĐÃ TRẢ LỜI một phần + GIẢ ĐỊNH]
> Lương là cố định theo bảng lương, còn tiền lương hiệu suất và doanh thu + hoa hồng sẽ khác.

Diễn giải + giả định:
- **Lương cố định** (lương cơ bản, phụ cấp ăn trưa, xăng xe, lương trưởng nhóm, lương hỗ trợ) lấy từ bảng lương → phân bổ về tòa theo số phòng như B1.
- **Lương hiệu suất** của quản lý tòa (số phòng × mức lương/phòng của đúng tòa đó) → gắn **trực tiếp** vào tòa, không phân bổ. Dòng "Lương quản lý 1.385.173" của G1 = lương hiệu suất của quản lý cho G1 trong tháng 6.
- **Hoa hồng** là chi phí bán hàng riêng, không nằm trong lương.

### B4. Nguồn dữ liệu chi phí (marketing, giá gốc điện nước, …) — [ĐÃ TRẢ LỜI]
> Các chi phí như marketing hay chi phí điện nước,... là sẽ import vào mục quản lý chi phí để có data làm báo cáo.

Diễn giải để implement:
- Mọi chi phí **không sinh tự động** từ phân hệ khác (giá gốc điện/nước/mạng/rác/môi trường/thang máy, marketing, mua thiết bị, sửa chữa, thuê & DV văn phòng, chi phí khác, hoa hồng) đi qua **module Chi phí bằng import Excel/CSV** (hoặc nhập tay), theo spec §4.27.
- Lương **không** import vào Chi phí — lấy từ bảng lương đã khóa (tránh double count).
- Mỗi dòng import tối thiểu: `ngày chứng từ | kỳ (tháng) | tòa hoặc phạm vi (toàn hệ thống / nhóm T-S-G) | nhóm chi phí | hạng mục | nội dung | số tiền | nhà cung cấp | phương thức TT | ghi chú`.
- Chi phí gắn 1 tòa → vào thẳng báo cáo tòa. Chi phí phạm vi chung (marketing, VP) → hệ thống **phân bổ theo số phòng** (rule B1) và lưu snapshot phân bổ.
- Import có preview, validate, phát hiện trùng (cùng tòa + kỳ + hạng mục + số tiền), confirm rồi mới ghi; báo cáo drill-down về đúng dòng import.

Giả định kèm theo (cần xác nhận):
- Giá gốc điện/nước import theo **kỳ báo cáo** (tháng), lấy số tiền thực trả nhà cung cấp; nếu hóa đơn EVN lệch kỳ chốt 22 thì ghi theo tháng của hóa đơn EVN.
- Điện nước phòng trống nằm trong giá gốc điện/nước của tòa, không tách dòng riêng trên báo cáo.

### B5. Combo "DV khác" 120.000đ/người — [GIẢ ĐỊNH — đọc từ công thức]
- = 60.000 vệ sinh + 60.000 máy giặt (báo cáo chia đôi `AQ/2`).
- Hệ thống tách thành 2 dịch vụ riêng ngay trên hóa đơn (mỗi 60k/người), cấu hình giá theo tòa; không cần công thức chia đôi ở báo cáo.

---

## C. Lương & hiệu suất thu tiền

### C1. Công thức "Tổng DT thu được" dùng tính hiệu suất — [GIẢ ĐỊNH — kiểm chứng số học khớp toàn bộ dòng]
```
Tổng DT thu được = (DT mốc 1 + DT mốc 2 + DT mốc 3) × (1 − Dịch vụ / DT phải thu) + DT thu thêm
Hiệu suất (%)    = Tổng DT thu được / DT niêm yết × 100
Lương hiệu suất  = Số phòng × Mức lương/phòng
```
- Phần dịch vụ bị loại theo tỷ lệ → chỉ thưởng trên tiền phòng.
- Mẫu số là **DT niêm yết** → quản lý chốt giá thấp hơn niêm yết sẽ giảm hiệu suất.

### C2. Mốc M1/M2/M3 có trọng số không? — [GIẢ ĐỊNH]
- **Không.** Số thu 3 mốc cộng thẳng; M5/M10/M15 là số thu lũy kế đến ngày 5/10/15 và chỉ dùng theo dõi tiến độ.
- Tiền thu sau ngày 15 (đến cuối tháng) vào "DT thu thêm" hoặc kỳ sau tùy thời điểm chốt bảng lương (giả định: chốt bảng lương ngày 20, sau đó tính kỳ sau).

### C3. Bảng mức lương/phòng — [GIẢ ĐỊNH — suy từ số liệu tháng 8]
| Điều kiện | Mức lương/phòng |
|---|---|
| Nhân viên bậc 1 (Huyền, Linh, Khải, Trường, Lâm, Kiên, Hương) | 130.000 × Hiệu suất |
| Nhân viên bậc 2 (Phương, Thủy, Nụ, Giang, Tú) | 120.000 × Hiệu suất |
| Hiệu suất < 95% | nhân thêm hệ số giảm bậc thang (≈0,96 ở 94%, ≈0,94 ở 92%, đơn giá tụt còn 105k ở ~78%, 100k ở ~75%) |
| Tòa mới chưa có doanh thu (G13, G12A, G14) | 100.000 cố định/phòng |

Cần công ty cung cấp bảng bậc chính thức; hệ thống lưu thành Payroll Rule có version.

### C4. Lương trưởng nhóm TPVH/TNVH (7,74tr / 4,08tr) — [GIẢ ĐỊNH]
- Phase 1: **nhập tay** theo quyết định hàng tháng (có thể là % trên tổng lương hiệu suất của team). Không tự động tính.

### C5. Lương kỳ nào trên báo cáo tháng nào? — [GIẢ ĐỊNH]
- Chi phí lương của báo cáo tháng N = bảng lương kỳ N đã **khóa** (hiệu suất thu tiền tháng N), không phụ thuộc ngày chi thực tế.

---

## D. Hoa hồng

### D1. Điều kiện "đủ" để trả hoa hồng — [ĐÃ TRẢ LỜI]
> Hoa hồng đủ là khách hàng đã đóng đủ cọc và đã làm xong hợp đồng.

Diễn giải: Commission Case chuyển sang trạng thái "đủ điều kiện" khi HĐ ở trạng thái **Đã ký/Hiệu lực** và Deposit Ledger ghi **cọc đã thu = cọc phải thu**. "Chưa đủ" → treo, không tính vào chi phí tháng.

### D2. Mức hoa hồng theo nguồn & thời hạn — [GIẢ ĐỊNH — đọc từ công thức]
| Trường hợp | Mức (× giá chốt) |
|---|---|
| Môi giới/CTV bên ngoài (Team) | 50% |
| Lead nội bộ tự tìm khách (`(LEAD)`) | 50% |
| Nhân viên nội bộ | 35% |
| HĐ < 6 tháng | Mức chuẩn ÷ 6 × số tháng (3 tháng → 25%, 2 tháng → 16,67%) |
| HĐ ≥ 6 tháng | Mức chuẩn theo nguồn (6 tháng lúc 50% lúc 35% là do **nguồn**, không do thời hạn) |
| Trùng n nguồn | 50% ÷ n cho mỗi nguồn |
| CTV hỗ trợ | Trừ số tiền hỗ trợ CTV khỏi hoa hồng người chốt |

### D3. Hoa hồng khi khách bỏ cọc — [GIẢ ĐỊNH — đọc từ công thức]
```
Cơ sở HH = Tiền cọc − (Giá thuê / số ngày trong tháng × số ngày đã ở)
Hoa hồng  = Cơ sở HH × 50%
```
Không hoàn hoa hồng đã trả nếu khách bỏ sau khi đã trả.

### D4. Thời điểm ghi nhận hoa hồng vào chi phí tòa — [GIẢ ĐỊNH]
- Ghi vào **tháng thanh toán hoa hồng** ("Đã tt"), gắn tòa theo mã phòng (RIGHT(mã, −3)). Phòng có chữ (`401S4A`) dùng master phòng thay vì cắt chuỗi.
- Trả theo đợt (8% lúc cọc, 42% lúc ký) → mỗi đợt là 1 dòng chi phí riêng cùng Commission Case.
- Khách đổi phòng sau khi chốt → hoa hồng giữ theo phòng chốt ban đầu, ghi chú phòng thực ở.

### D5. Người nhận & payout — [GIẢ ĐỊNH]
- Gộp tất cả dòng cùng Team/người nhận trong tháng thành 1 lệnh chuyển ("Tổng nhận"); nội dung CK chuẩn `HH + tên người nhận + lần n`.
- QLY (quản lý tòa) trên dòng hoa hồng chỉ là người phụ trách tòa, **không** phải người nhận hoa hồng trừ khi Team trống/ghi tên họ.

---

## E. Cổ đông & chia lợi nhuận

### E1. Vốn góp của tòa = 1 tháng tiền thuê nhà? — [GIẢ ĐỊNH — đọc từ công thức]
- Công thức `Vốn_cđ = % × Tiền thuê nhà 1 tháng` → vốn góp Phase 1 của tòa = **tiền cọc cho chủ nhà (1 tháng)**. Chi phí cải tạo/thiết bị ban đầu (sheet ĐẦU TƯ BAN ĐẦU) là khoản góp vốn riêng, cần import vào module Góp vốn nhưng chưa dùng để chia LN.

### E2. "Tổng nhận = Vốn + LN ròng" là chi thực hay minh họa? — [GIẢ ĐỊNH]
- **Minh họa** giá trị cổ đông đang nắm (vốn còn nằm trong tòa + LN kỳ). Chi thực hàng tháng chỉ = **LNR × %**. Vốn hoàn khi kết thúc HĐ đầu vào hoặc thoái vốn.
- LN gộp × % chỉ để tham khảo, không chi.

### E3. Cổ đông khác nhau giữa các tòa, tỷ lệ có đổi theo thời gian — [GIẢ ĐỊNH]
- Tỷ lệ theo tòa, có ngày hiệu lực; báo cáo kỳ nào dùng tỷ lệ hiệu lực kỳ đó (spec §4.30). Khi thêm cổ đông giữa kỳ → chia LN theo tỷ lệ tại **ngày cuối kỳ** (không prorate theo ngày trong Phase 1).

---

## F. Hóa đơn, thu tiền, vận hành

### F1. Kỳ hóa đơn & hạn thanh toán — [GIẢ ĐỊNH — đọc từ mẫu hóa đơn]
- Chốt số điện nước ngày **22** hàng tháng (cấu hình theo tòa). Hóa đơn tháng N+1 = tiền phòng N+1 (trả trước) + điện nước kỳ 22/N−1 → 22/N (trả sau) + nợ cũ.
- Hạn thanh toán **25 → cuối tháng**; quá hạn phạt **200.000đ/ngày** — Phase 1 hệ thống đề xuất dòng phạt, quản lý duyệt mới phát hành (không tự cộng).
- Nội dung CK = **mã phòng**; kế toán match payment theo mã phòng + tài khoản nhận (VP-Hằng / Techcombank).

### F2. Đơn giá dịch vụ theo tòa — [GIẢ ĐỊNH]
- Mặc định: điện 4.000đ/kWh, nước 120.000đ/người, internet 100.000đ/phòng, thang máy/xe/máy giặt theo bảng giá tòa. Tòa T18 có nước 100k + vệ sinh 30k → cấu hình override theo tòa (spec §4.12).

### F3. Ba lớp giá phòng — [GIẢ ĐỊNH]
- **Giá niêm yết**: giá công bố, mẫu số hiệu suất. **Giá QL**: mức sàn quản lý được tự quyết. **Giá hiện tại**: giá ký thực; chốt dưới Giá QL phải có duyệt của TNVH/TPVH.

### F4. Lead theo dõi tiến độ việc của kỹ thuật/vệ sinh — [GIẢ ĐỊNH]
- Phase 1: dùng **Work Queue** theo phân công (OCR chờ review, HĐ sắp hết, hóa đơn chưa phát hành, công nợ, hoàn cọc chờ duyệt, phòng chờ dọn) + lọc theo cây tổ chức; Lead thấy queue của cấp dưới.
- Giao việc/Work Order có trạng thái, tiến độ cho kỹ thuật, vệ sinh → **Phase 2 §5.16**.

### F5. Nhóm tòa T/S/G — [GIẢ ĐỊNH]
- Phân theo **pháp nhân/nhóm đầu tư ký HĐ đầu vào** (không theo địa lý). Loại tòa có ngày hiệu lực, báo cáo tổng aggregate theo loại hiệu lực trong kỳ.

---

## G. Dữ liệu cần công ty cung cấp thêm
1. `bảng lương tháng 6.xlsx` (có công thức) — để lấy công thức gốc hiệu suất, mức lương/phòng, lương trưởng nhóm thay vì suy luận ở C1–C4.
2. `cập nhật thu tiền tháng 6 chuẩn.xlsx` — sheet NHÀ T/S/G, PHÒNG MỚI, HOÀN CỌC, ĐIỆN NƯỚC PHÒNG TRỐNG để xác nhận A2, A6, A9, B4.
3. `G1.31.8.26.xlsx` — sheet ĐẦU TƯ BAN ĐẦU / THU CHI BAN ĐẦU để xác nhận E1.
4. Bảng bậc lương/phòng chính thức và quyết định lương trưởng nhóm (C3, C4).
5. Chính sách hoa hồng bằng văn bản nếu có (D2–D5).

---

## H. Trả lời của công ty ngày 22/09/2026 (lần 2) và giả định chuẩn hóa theo kế toán

### H1. Báo cáo — [ĐÃ TRẢ LỜI]
> Cần 2 loại báo cáo. Báo cáo từng tòa rồi gộp vào báo cáo tổng, theo tháng.

| | Báo cáo lợi nhuận dòng tiền | Báo cáo kinh doanh |
|---|---|---|
| Nguyên tắc | Tiền thực thu / thực chi trong tháng (= Excel hiện tại) | Ghi nhận theo kỳ phát sinh (accrual) |
| Doanh thu | Σ tiền khách đóng trong tháng (gồm cọc mới) − hoàn cọc | Σ hóa đơn phát hành trong tháng; không gồm cọc thu/hoàn; thu nhập khác = cọc giữ lại, khấu trừ cọc |
| Tiền thuê nhà | Theo tháng thực trả (0 ở tháng miễn) | Phân bổ đều theo tháng (chi phí trả trước khi trả quý) |
| Thiết bị / đầu tư ban đầu | Ghi hết tháng mua | Khấu hao: < 10tr → 12 tháng; ≥ 10tr → 36 tháng; cải tạo ban đầu → theo HĐ đầu vào còn lại (≤ 60 tháng) [GIẢ ĐỊNH] |
| Lương | Tháng chi lương | Kỳ lương |
| Cấu trúc | Tòa → nhóm T/S/G → tổng, cùng Metric Definition | như bên |

### H2. Kết thúc / gia hạn / phá HĐ — [ĐÃ TRẢ LỜI]
> Trước 35 ngày lập danh sách; quản lý xác nhận phòng nào khách không thuê nữa, phòng nào tự gia hạn bằng HĐ lần mới (được đổi thời hạn, giá, điều khoản). Không báo mà rời đi = phá hợp đồng, thu ở phần khách hàng phá hợp đồng.

Giả định kèm theo: kết thúc đúng hạn → tiền phòng tính đến ngày hết HĐ (giữa tháng: giá ÷ 30 × ngày), chốt điện nước, quyết toán, hoàn cọc. Rời trước ngày hết HĐ = phá HĐ → mất cọc, không tính tiền phòng các tháng còn lại, nợ điện nước theo dõi ở DS phá HĐ. Gia hạn = HĐ phiên bản mới nối tiếp, giữ mã khách và cọc.

### H3. Điện nước — [ĐÃ TRẢ LỜI]
> Điện nước đã báo hóa đơn từng phòng thì là doanh thu.

→ Doanh thu dịch vụ = Σ dòng dịch vụ trên hóa đơn, kể cả hóa đơn cuối của phòng đã trả. Điện nước phòng trống (không hóa đơn) = chi phí trong giá gốc. Prorate tiền phòng theo ngày = giá ÷ 30 [GIẢ ĐỊNH, theo quy ước sổ].

### H4. Lương — [ĐÃ TRẢ LỜI]
> Lương cố định các mức theo từng level; lương khác tính theo hiệu suất, cổ phần và các phần đã mô tả trong bảng lương. Mốc 1/2/3 trọng số 100/90/70% — đúng.

→ Bảng lương cố định theo level (có hiệu lực theo ngày); đơn giá/phòng cố định theo bậc hiệu suất (130k/100, 120k/95, 119k/95, 110k/90, 109k/90, 75k/75; tòa mới 100k) — ranh giới % giữa bậc cần KH chốt; lương trưởng nhóm = 10.000đ × số phòng dưới quyền; phần "cổ phần" của nhân viên chia qua module Cổ đông, không vào chi phí lương.

### H5. Cọc khách bỏ — [ĐÃ TRẢ LỜI]
> Coi như phòng đó không có hoàn cọc, không tính vào báo cáo (đã tính vào cọc phòng mới khi thu).

→ BC dòng tiền: dòng memo, không cộng vào tổng; hoàn cọc = 0. BC kinh doanh: thu nhập khác tại tháng khách bỏ [GIẢ ĐỊNH theo chuẩn kế toán].

### H6. Các giả định chuẩn hóa còn lại (bên PT)
- Doanh thu đóng quý: dòng tiền ghi cả kỳ vào tháng thu; kinh doanh chia đều (doanh thu chưa thực hiện).
- Giá gốc điện nước: kinh doanh theo kỳ tiêu thụ trên hóa đơn NCC; dòng tiền theo ngày trả.
- Sửa chữa & khấu trừ cọc: không bù trừ; ghi chi phí đủ và thu nhập khác riêng.
- Cổ đông: tài khoản vốn lũy kế theo tòa; chia lợi nhuận theo quý trên phần lũy kế dương (bù lỗ trước); bảng cổ phần tháng vẫn trình bày Vốn = % × tiền thuê 1 tháng.
- Khóa kỳ: 16 chốt thu tiền & lương → 20 kế toán kiểm chi phí → khóa (kế toán), admin duyệt; sửa sau khóa = bút toán điều chỉnh kỳ hiện tại.
