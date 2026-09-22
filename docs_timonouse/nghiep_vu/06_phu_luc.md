# 6. Phụ lục

> Chương này tổng hợp: tham số chờ chốt (P-xx, **một dãy duy nhất P-01…P-29** sau khi gộp), hạng mục ngoài phạm vi (X-01…X-08), traceability answer.md → module, nhật ký gộp & review chéo, danh mục file nguồn, bảng tổng hợp rule theo nhãn và danh sách câu hỏi còn phải chốt với khách hàng. Định nghĩa gốc của P-xx / X-xx nằm ở `00_shared_brief.md` §0.8 / §0.9; chương này là bản đầy đủ có thêm cột module ảnh hưởng, câu hỏi gửi KH, nguồn phát hiện.

---

## 6.1 Bảng tham số chờ chốt (P-xx) — bản cuối, đã đánh số lại thành 1 dãy

Quy ước: mã P-01…P-10 giữ nguyên số của brief; P-11…P-29 là các tham số phát sinh từ chương 1–5 (đã thay các mã tạm `P-11…P-16` của chương 1 và `P-2.a…P-2.g` của chương 2). Mọi tham chiếu trong 6 file đã được cập nhật theo dãy này.

| Mã | Tham số | Giá trị đề xuất | Module ảnh hưởng | Câu hỏi gửi KH | Nguồn phát hiện |
|---|---|---|---|---|---|
| P-01 | Bảng bậc lương/phòng = **ma trận level × dải HS** (không phải 6 cặp) | Ngưỡng quan sát 100/95/90/85/80/75; ranh giới đề xuất: ≥98 → 130k/100; 95–<98 → 120k/95; 93–<95 → 119k/95; 91–<93 → 110k/90; 88–<91 → 109k/90; 75–<88 → 75k/75; <75 → 0; ma trận đầy đủ theo bảng quan sát §3.5.3 (≥ 16 cặp, gồm 100k/85, 94k/85, 90k/85, 89k/85, 84k/80, 75k/75 cho bậc 1 và 120k/100, 110k/95, 100k/90, 90k/85 … cho bậc 2) | M-3.05, M-3.04, M-4.02, M-5.03 | Gửi bảng bậc chính thức: mỗi level (NVVH bậc 1 / bậc 2 / bậc khác) áp đơn giá và ngưỡng nào cho từng dải hiệu suất? Dưới 75 % có trả lương hiệu suất không? Có làm tròn % trước khi xếp bậc? | Brief §0.8; W3 đọc 122 dòng tòa `bảng lương tháng 8` |
| P-02 | Số tháng khấu hao (chỉ AC) | Thiết bị rời < 10tr → 12 tháng; ≥ 10tr → 36 tháng (xét trên **1 đơn vị**, P-11); hạng mục cải tạo ban đầu (thạch cao, tủ bếp gắn tường, hệ điện nước) → số tháng HĐ đầu vào còn lại ≤ 60; G1 đầu tư ban đầu 38.862.000 → **2.325.167/tháng** (tách hạng mục) thay vì 647.700 (gộp 60 tháng) | M-4.04, M-4.05, M-5.02, M-5.03 | Chọn cách nào cho đầu tư ban đầu: tách từng hạng mục theo ngưỡng 10tr (đề xuất) hay gộp theo thời hạn HĐ đầu vào? Ngưỡng 10tr tính trên 1 thiết bị hay 1 lần mua? Trả tòa sớm ghi hết phần còn lại vào tháng trả? | Brief §0.8; W4 sheet `ĐẦU TƯ BAN ĐẦU`; W5 §5.3.10 |
| P-03 | Prorate tiền phòng & dịch vụ | ÷ 30 cho mọi tháng (sổ hóa đơn: `Ngày ở ÷ 30`, `Ngày DV ÷ 30`); các file hoa hồng, DT thu thêm, sổ HOÀN CỌC `301T41` đang ÷ 31 → giữ ÷ 30, ghi RULE_DIFFERENCE; DT thu thêm (D-48) = prorate tự động ÷ 30 + dòng nhập tay có lý do | M-2.09, M-2.13, M-3.04, M-4.03, M-5.03 | Thống nhất chia 30 cho mọi tháng, hay chia số ngày thực của tháng? Áp dụng chung cho hóa đơn, hoàn cọc, hoa hồng, DT thu thêm? | Brief §0.8; W2 sổ HOÀN CỌC; W3 D-48; W4 F-36 |
| P-04 | Nghĩa nhóm T/S/G và hạng L1/L2/L3 | T/S/G = dòng nhà gắn trong mã tòa; L1/L2/L3 = hạng tình trạng (cũ / trung bình / mới), thuộc tính riêng | M-2.03, M-5.04, M-1.01 | T/S/G phân theo pháp nhân ký HĐ đầu vào, dòng sản phẩm hay khu vực? L1/L2/L3 ai gán, đổi theo thời gian thế nào? | Brief §0.8; sheet `BC DT NHÀ T/S/G` |
| P-05 | **Hai mẫu số phòng** khác nhau | (a) `N` phân bổ chi phí = tổng phòng đang quản lý cuối tháng kể cả trống, không kể tòa đã trả (1.303 T6/2026; 1.382 T8/2026); (b) số phòng tính hiệu suất/lương = phòng có hóa đơn kỳ (1.079 T8/2026); (c) hệ thống dùng **1 N duy nhất/kỳ** — Excel T8 dùng 1.343 cho riêng dòng lương sửa chữa → RULE_DIFFERENCE | M-4.02, M-3.04, M-3.05, M-5.01, M-1.01 | Xác nhận 2 mẫu số và đếm N tại ngày cuối tháng? Có gồm phòng của tòa mới chưa khai thác / tòa sắp trả? Số 1.343 ở dòng lương sửa chữa T8 là chủ ý hay nhầm? | Brief §0.8; W3 (1.079), W4 (1.303), W5 (1.382/1.343) |
| P-06 | Kỳ lương, ngày chốt, cutoff kỳ báo cáo | Kỳ lương N = đợt hóa đơn "tiền phòng tháng N" (phát hành cuối tháng N−1), mốc thu 5/10/15 của tháng N, chốt lương **16/N**; kế toán kiểm chi phí **20**; khóa kỳ sau 20; cutoff CF cho payment ghi trễ = 23:59 ngày cuối tháng (có thể đặt muộn hơn) | M-3.05, M-3.04, M-4.01, M-5.01, §1.3 | Xác nhận 3 mốc 16 / 20 / sau 20 và định nghĩa kỳ lương N; rơi vào cuối tuần thì dời sớm hay muộn? Ai bấm khóa, ai duyệt? Payment về sau cutoff xử lý thế nào? | Brief §0.8; W3 §3.4.3; W5 BR-5.01.8 |
| P-07 | Hoa hồng nhiều đợt và mức ngoài tham chiếu | Cho phép nhiều đợt (cùng `deal_key`, `installment_no`), mặc định 1 lần; mức khác D-55 (ví dụ 65 % tòa S22, 8 % + 42 %) chỉ **cảnh báo**, không chặn | M-4.03, M-5.03 | Có trả hoa hồng 2 đợt không? Có mức riêng theo đối tác (65 %)? Mỗi đợt là 1 dòng import cùng mã deal? | Brief §0.8; W4 sheet `HOA HỒNG THÁNG 8.26` |
| P-08 | Tòa mới áp mức 100.000/phòng đến khi nào | 2 tháng đầu từ ngày nhận tòa **hoặc** lấp đầy ≥ 70 %; hết điều kiện → tự chuyển sang bậc HS từ kỳ kế | M-3.05, M-3.04, M-2.03 | Tòa được coi là "mới" đến khi nào: theo số tháng, theo tỷ lệ lấp đầy, hay do TPVH đánh dấu tay? | Brief §0.8 |
| P-09 | Phạt trễ hạn 200.000/ngày | Hệ thống đề xuất → quản lý xác nhận/miễn → kế toán duyệt → dòng Thu khác hóa đơn kỳ sau | M-2.11, M-2.09, M-2.14 | Phạt tính từ ngày nào (sau hạn TT hay sau 5 ngày công nợ)? Có trần phạt? Lên hóa đơn kỳ sau dạng Thu khác? | Brief §0.8; mẫu HĐ |
| P-10 | Phân phối lợi nhuận cổ đông | Theo **quý**, trên lợi nhuận **lũy kế dương** (bù lỗ trước), **basis AC** (Báo cáo kinh doanh) — CF chỉ tham khảo; % tại ngày cuối kỳ, không prorate; Phase 1 không có cổ đông cấp công ty, cổ đông không xem Report B | M-4.06, M-5.05, M-5.04, M-5.01 | Chia theo quý? Dùng lợi nhuận AC (đã khấu hao, không gồm cọc) hay CF? Có cổ đông cấp công ty? Chi thực có gồm phần "Vốn" không (E2)? | Brief §0.8; W4 BR-4.06.8; W5 §5.7.1 |
| P-11 | Ngưỡng vốn hóa thiết bị (`EXPENSE` → `ASSET`) | **2.000.000 VND/đơn vị**; ≥ ngưỡng → tạo ASSET và khấu hao AC; dưới ngưỡng → ghi `EQUIPMENT_PURCHASE_COST` cả CF lẫn AC (thùng rác 500.000) | M-4.01, M-4.04, M-5.02, M-5.03 | Ngưỡng ghi tài sản là bao nhiêu (đề xuất 2 triệu/đơn vị)? Dưới ngưỡng ghi chi phí ngay cả ở báo cáo kinh doanh, đúng không? | W4 §4.8 mục 1 (BR-4.01.11, BR-4.04.6) |
| P-12 | Định nghĩa "số phòng dưới quyền" (R-22) | Σ **tổng phòng đang quản lý kể cả trống** của các tòa mà NVVH phụ trách chính thuộc đơn vị của Lead (đệ quy), snapshot ngày 15; **TPVH tính toàn hệ thống**; là mẫu số riêng (774 + 408 = 1.182 > 1.079 phòng tính HS) | M-3.01, M-3.05 | 774 và 408 phòng lấy theo phạm vi nào? Có gồm phòng trống? TPVH tính toàn hệ thống hay chỉ nhóm mình? | W3 §3.7.2 (BR-3.01.11) |
| P-13 | Điện chung vào doanh thu điện hay dòng riêng | Hệ thống **luôn cộng** điện chung vào `ELECTRIC_REVENUE` (D-34, theo cách sổ T8); golden G1 T6 lệch +100.000 → RULE_DIFFERENCE; tùy chọn hiển thị dòng riêng "Doanh thu điện chung" | M-2.09, M-5.03, M-5.04 | Điện chung (công tơ khu vực chung 3.800/kWh) cộng vào dòng "Doanh thu điện" hay tách dòng riêng? Vì báo cáo T6 chưa cộng còn T8 đã cộng | W5 BR-5.03.6 |
| P-14 | Thứ tự phân bổ payment vào dòng hóa đơn | **Nợ cũ → 7 dịch vụ + điện chung → thu khác → tiền phòng → cọc**; kế toán đổi được cho từng payment có lý do | M-2.10, M-5.02, M-5.03 | Khi khách đóng thiếu, tiền được trừ vào dòng nào trước? (đề xuất: nợ cũ → dịch vụ → thu khác → tiền phòng → cọc, đúng cách sổ đang trừ tay) | W5 §5.7.1 mục 1 (BR-5.02.9, BR-2.10.4) |
| P-15 | Chia tiền thuê của 1 HĐ đầu vào cho nhiều tòa | Theo **tỷ lệ số phòng** (mặc định) hoặc tỷ lệ nhập tay trên HĐ đầu vào, tổng 100 %, có ngày hiệu lực (S19A/S19B/S19C) | M-2.02, M-4.05, M-5.03 | HĐ ký chung 3 tòa S19A/B/C: chia tiền thuê theo số phòng hay theo số tiền thỏa thuận từng tòa? | W2 (BR-2.02.2, BR-4.05.12) |
| P-16 | Mức khấu trừ hoàn cọc mặc định | Khấu hao 200.000/phòng; dọn vệ sinh 100.000; sơn phòng 300.000–500.000 — **tham số theo tòa**, sửa được từng phiếu có lý do | M-2.13 | 3 mức mặc định trên đúng cho mọi tòa hay khác theo tòa/loại phòng? Sơn 300k hay 500k? | W2 (BR-2.13.4) |
| P-17 | Mốc tính "5 ngày" chuyển công nợ | 5 ngày sau **ngày phát hành** hóa đơn (phương án 2: sau hạn thanh toán cuối tháng) | M-2.11, M-1.01, M-2.14 | "Công nợ sau 5 ngày kể từ khi có hóa đơn" là 5 ngày sau phát hành hay sau hạn thanh toán? | W1 (D-21, R-13, §1.3) |
| P-18 | Ngày chi lương thực tế & basis lương trên báo cáo | Chi ngày 20–25 tháng kế tiếp kỳ lương; **`SALARY_COST` trên báo cáo tòa dùng kỳ lương cho cả CF và AC** (khớp golden), ngày chi chỉ vào sổ quỹ | M-3.06, M-4.02, M-5.02 | Lương kỳ N chi ngày nào tháng N+1? Xác nhận báo cáo tòa ghi lương theo **kỳ lương** (như Excel) chứ không theo tháng chi? Có tạm ứng giữa kỳ? | W1 §1.3; W5 §5.7.1 mục 5 (BR-5.02.7) |
| P-19 | Giờ chụp snapshot mốc M1/M2/M3 | 23:59 ngày 5 / 10 / 15 | M-3.04, M-1.01 | Tiền về sau 23:59 ngày mốc tính cho mốc kế tiếp, đúng không? | W1 (BR-1.01.3) |
| P-20 | Ngưỡng tuổi việc & màu ưu tiên Work Queue | Công nợ > 5 / > 15 ngày; HĐ sắp hết < 7 ngày; lịch đóng tiền chủ nhà ≤ 7 ngày; OCR chờ review > 2 ngày | M-1.01 | Muốn cảnh báo đỏ ở ngưỡng nào cho từng loại việc? | W1 (BR-1.01.17) |
| P-21 | Ngày tham chiếu người phụ trách chính cho kỳ lương | **Ngày 15** của kỳ; không chia hiệu suất theo ngày khi đổi quản lý giữa tháng | M-3.03, M-3.04, M-3.05 | Đổi quản lý giữa tháng: tòa tính lương cho người phụ trách tại ngày 15, hay chia theo số ngày? | W1 (R-23); W3 (BR-3.03.5) |
| P-22 | Vai trò Nhân sự (HR) và Quản lý Tổng | Gộp vào Admin/Kế toán ở Phase 1; tách bằng cấu hình quyền khi cần | M-3.01, M-3.02, cấu hình quyền | Có cần tài khoản HR riêng để sửa hồ sơ/lương cố định? Quản lý Tổng có phải Admin? | W1 §1.2 |
| P-23 | Ngưỡng "HĐ đầu vào sắp hết" & mốc nhắc trả chủ nhà | HĐ đầu vào sắp hết ≤ 6 tháng; nhắc trả chủ nhà trước **15 / 7 / 1 ngày** (thống nhất M-2.02 và M-4.05, thay mốc 10 ngày) | M-2.02, M-4.05, M-1.01 | Muốn nhắc hạn trả chủ nhà trước bao nhiêu ngày? Cảnh báo HĐ đầu vào sắp hết từ mốc nào? | W2 P-2.b; W4 M-4.05 |
| P-24 | Thời điểm sinh mã khách & mã khi đổi phòng | Sinh khi HĐ chuyển `Chờ ký`; đổi phòng nội bộ: mã mới theo phòng đích, **giữ số thứ tự**, mã cũ vào lịch sử | M-2.05, M-2.06, M-2.12 | Mã khách sinh lúc chờ ký hay lúc kích hoạt HĐ? Đổi phòng thì mã khách đổi theo phòng mới hay giữ nguyên? | W2 P-2.d |
| P-25 | Ảnh công tơ bắt buộc | Bắt buộc với reading OPENING và CLOSING; PERIODIC khuyến nghị | M-2.08, M-2.13 | Có bắt buộc chụp ảnh công tơ khi nhận/trả phòng? Kỳ hằng tháng có bắt buộc? | W2 P-2.e |
| P-26 | Tiền mặt NVVH thu, trạng thái Chờ xác nhận | Chỉ payment `Đã xác nhận` (kế toán xác nhận đã nộp) mới vào mốc M5/M10/M15 | M-2.10, M-3.04 | Tiền mặt NVVH giữ chưa nộp về công ty có tính vào mốc thu tiền/hiệu suất không? | W2 P-2.f |
| P-27 | Nợ phá HĐ thu hồi ở tháng sau | Vào `collected` và giảm công nợ của kỳ gốc; **không** vào M5/M10/M15 hay hiệu suất kỳ nào; doanh thu CF ghi tháng thực thu | M-2.10, M-2.11, M-3.04 | Thu được nợ của khách đã phá HĐ ở tháng sau: có cộng vào hiệu suất/lương của ai không? | W3 Q36 (BR-3.04.12, BR-2.10.11) |
| P-28 | Chi lương: tạm ứng, duyệt đợt, đối chiếu ngân hàng | Cho phép đợt `Tạm ứng` trước khi khóa kỳ (liên kết khi khóa); Admin duyệt đợt trước khi ghi Đã chi; khớp ngân hàng theo (số TK, số tiền, ngày) | M-3.06 | Có tạm ứng lương giữa kỳ? Ai duyệt đợt chi? Có import file kết quả ngân hàng để đối chiếu? | W3 Q39 |
| P-29 | Cọc chủ nhà, phí môi giới & thành phần "Đã góp" của cổ đông | Cọc chủ nhà và phí môi giới (G1: 48.000.000 và 14.400.000) là **đầu tư ban đầu / vốn góp**, không phải chi phí tháng; môi giới phân bổ AC theo thời hạn HĐ đầu vào; "Đã góp" G1 = 230.400.000 chưa khớp Σ khoản liệt kê 232.262.000 | M-4.05, M-4.06, M-4.04, M-5.05 | Xác nhận cọc chủ nhà và phí môi giới nằm ở vốn góp, không phải chi phí? Số vốn góp gốc 230.400.000 gồm những khoản nào? | W4 §4.8 mục 4, 5 (BR-4.05.4, BR-4.05.5, BR-4.06.5) |

**Bảng đối chiếu mã tạm → mã chính thức** (để đọc lại các bản nháp trước khi gộp):

| Mã tạm (bản nháp) | Mã chính thức | Ghi chú |
|---|---|---|
| P-11 (chương 1: mốc 5 ngày công nợ) | **P-17** | |
| P-12 (chương 1: ngày chi lương) | **P-18** | |
| P-13 (chương 1: giờ chụp mốc) | **P-19** | |
| P-14 (chương 1: ngưỡng tuổi việc) | **P-20** | |
| P-15 (chương 1: ngày tham chiếu phụ trách chính) | **P-21** | |
| P-16 (chương 1: vai trò HR / Quản lý Tổng) | **P-22** | |
| P-11 (chương 4/5: ngưỡng vốn hóa; thứ tự phân bổ payment) | **P-11** (ngưỡng vốn hóa) và **P-14** (thứ tự phân bổ) | 2 đề xuất trùng mã tạm, tách thành 2 mã |
| P-2.a … P-2.g (chương 2) | **P-15, P-23, P-16, P-24, P-25, P-26**, và P-2.g đã chốt bằng bằng chứng nguồn (D-03/D-18: 2 công tơ khác nhau) | |

---

## 6.2 Bảng ngoài phạm vi (X-xx)

| Mã | Hạng mục | Ghi chú (brief) | Phase dự kiến | Phase 1 làm gì thay thế | Menu KH liên quan |
|---|---|---|---|---|---|
| X-01 | CRM / Lead / Lịch xem / Giữ phòng / Sổ doanh số / thống kê nguồn khách | File web mục KINH DOANH | Phase 2 | Khách được tạo trực tiếp khi có HĐ (M-2.05); người nhận hoa hồng chỉ là trường trên dòng import (M-4.03) | 5 Kinh doanh; BÁO CÁO "báo cáo phòng Kinh doanh" |
| X-02 | Commission Engine (policy, case, split, payout) | Phase 1 chỉ import | Phase 2 | Import dòng hoa hồng đã tính sẵn, kỳ = tháng trả, gắn tòa theo mã phòng (R-30); `COMMISSION_IMPORT_LINE` là dữ liệu lịch sử cho Phase 2 | 5 Kinh doanh |
| X-03 | Work Order / giao việc kỹ thuật, vệ sinh có tiến độ; lịch bảo dưỡng; kiểm kê tài sản | File web mục BẢO TRÌ | Phase 2 | Work Queue "phòng chờ dọn / chờ nghiệm thu" (M-1.01); chi phí sửa chữa import (M-4.01); tài sản chỉ để khấu hao (M-4.04) | 10 Bảo trì, bảo dưỡng |
| X-04 | Budget, Period Close nâng cao, snapshot M5/M10/M15 dạng Phase 2 | — | Phase 2 | Kỳ báo cáo Open → Reviewing → Locked → Reopened (R-08, M-5.01); snapshot mốc dạng đơn giản (M-3.04) | 8 Báo cáo |
| X-05 | Lương phòng Kinh doanh / Kỹ thuật / Thị trường / TC-KT | KH: "gặp trực tiếp" | Chưa xếp phase | Lương cố định theo level cho mọi phòng (R-19); chỉ phòng Vận hành có lương hiệu suất; lương phòng khác 1 dòng nhập tay để phân bổ (R-26) và chi (M-3.06) | 6 Nhân sự "II: tính lương" |
| X-06 | Bảng dự kiến lợi nhuận, ROI/ROA, forecast, cổng cổ đông tự phục vụ, DW/BI | — | Phase 3 | Report A/B với 2 basis; cổ đông xem read-only trong hệ thống nội bộ (M-4.06, M-5.05) | 8 Báo cáo; 9 Cổ đông |
| X-07 | Công thức "Hiệu suất / Lợi nhuận / Thời gian vận hành" hiển thị trên màn Tòa | KH: "gặp trực tiếp" | Chưa xếp phase | Màn Tòa hiển thị 3 chỉ số từ `REPORT_SNAPSHOT` kỳ Locked gần nhất, có nhãn kỳ nguồn (BR-1.01.22, BR-2.03.7) | 2 Thông tin tòa nhà |
| X-08 | Các báo cáo bổ sung ở sheet `BÁO CÁO` file web: báo cáo âm dương điện nước, phân khúc khách hàng, tỷ lệ đóng tiền đúng hạn/quá hạn, tỷ lệ lấp đầy & thời gian trống | Mã mới do agent gộp cấp (brief §0.9) | Phase 2 | Thống kê thất thoát điện nước phòng trống (M-2.08, báo cáo phụ); KPI lấp đầy tạm tính + công nợ theo tuổi nợ trên M-1.01; biên lợi nhuận tiền nhà đã có bằng tỷ lệ `RENT_REVENUE_OVER_HEAD_LEASE` ở Report B | 8 Báo cáo |

---

## 6.3 Bảng traceability answer.md → chương / module

Trạng thái: **ĐTL** = [ĐÃ TRẢ LỜI] · **GĐ** = [GIẢ ĐỊNH] · **ĐTL+GĐ** = trả lời một phần. Thứ tự ưu tiên nguồn: answer.md §H > §A–G > clarification-checklist.md > spec v1.8.

| Mục answer.md | Nội dung tóm tắt | Trạng thái | Mã brief | Chương / module |
|---|---|---|---|---|
| A1 | Công thức GV / CPBH / TCP / LNG / LNR và 14 tỷ lệ | ĐTL | D-38, D-41, D-42, R-07 | M-5.02, M-5.03, M-5.04 (metric §0.5) |
| A2 | Tổng doanh thu = Tổng đã đóng (cash) | GĐ → chốt ở H1 | D-29, R-02 | M-5.02, M-5.03 (F-57) |
| A3 | Cọc phòng mới tính vào tháng có khách vào ở | ĐTL | D-30, R-05 | M-2.13, M-5.03 |
| A4 | Cọc khách bỏ ghi tháng báo bỏ | GĐ → sửa bởi H5 | D-27, D-31 | M-2.12, M-2.13, M-5.02 |
| A5 | Hoàn cọc trừ doanh thu tháng thực chi | GĐ | D-32, R-02 | M-2.13, M-5.03 (BR-5.03.8) |
| A6 | Định nghĩa phòng mới, prorate tháng đầu, đổi phòng nội bộ | GĐ | D-23, D-26, R-10, R-18, P-03 | M-2.04, M-2.09, M-2.12 |
| A7 | Định nghĩa phòng trống (cuối tháng, 3 loại) | ĐTL | D-24, R-06 | M-2.04, M-5.03, M-1.01 |
| A8 | Phòng phá HĐ = rời trước hạn, tháng có ngày ra | GĐ → chốt ở H2 | D-25, D-53, R-16 | M-2.12, M-2.11, M-5.03 |
| A9 | DT tiền phòng trừ phòng trả, điện nước tính đủ | GĐ → chốt ở H3 | D-33, D-34, R-04 | M-2.09, M-2.10 (P-14), M-5.03 |
| A10 | Điều chỉnh kỳ sau, kỳ Locked không sửa, reopen có snapshot | GĐ | R-08 | M-5.01, §1.3, §1.7 |
| B1 | Phân bổ chi phí chung theo số phòng + phần cố định | GĐ (đọc công thức) | R-26 | M-4.02 (F-09 … F-17) |
| B2 | Mẫu số 1.303 phòng | GĐ | P-05 | M-4.02, M-5.01, M-1.01 |
| B3 | Lương cố định phân bổ, lương hiệu suất ghi thẳng tòa, hoa hồng riêng | ĐTL+GĐ | D-39, R-19, R-26 | M-3.05, M-4.02, M-4.03 |
| B4 | Nguồn chi phí = import module Chi phí, cấu trúc dòng import | ĐTL | D-37, R-25 | M-4.01 |
| B5 | Combo 120k = vệ sinh 60k + máy giặt 60k, tách 2 dịch vụ | GĐ (đọc công thức) | D-19 | M-2.07, M-2.09, F-06 |
| C1 | Công thức Tổng DT thu được, HS, lương hiệu suất | GĐ (kiểm chứng số học) | D-49, D-50, R-20 | M-3.04, M-3.05 |
| C2 | Mốc M1/M2/M3 không trọng số | GĐ → **bị thay bởi H4** (100/90/70 %) | D-47, R-20 | M-3.04, M-1.01 |
| C3 | Bảng mức lương/phòng theo bậc | GĐ → chốt bậc ở H4, ma trận → P-01 | D-51, R-21, P-01, P-08 | M-3.05 |
| C4 | Lương trưởng nhóm nhập tay | GĐ → **bị thay bởi H4** (10.000 × số phòng) | D-52, R-22, P-12 | M-3.05, M-3.01 |
| C5 | Lương kỳ N vào báo cáo tháng N | GĐ → **chốt hướng: kỳ lương cho cả CF và AC** | R-25, P-18 | M-3.06, M-4.02, M-5.02 (BR-5.02.7) |
| D1 | Điều kiện đủ trả hoa hồng | ĐTL | D-56, R-30 | M-4.03 |
| D2 | Mức hoa hồng theo nguồn & thời hạn | GĐ (đọc công thức) | D-55, P-07 | M-4.03 |
| D3 | Hoa hồng khi khách bỏ cọc | GĐ (đọc công thức) | D-54, R-30, P-03 | M-4.03 |
| D4 | Thời điểm ghi hoa hồng vào chi phí tòa, trả nhiều đợt | GĐ | R-30, P-07 | M-4.03, M-5.03 |
| D5 | Người nhận & payout gộp | GĐ | D-57, D-58 | M-4.03 |
| E1 | Vốn góp = 1 tháng tiền thuê nhà; đầu tư ban đầu riêng | GĐ (đọc công thức) | D-43, R-31, P-29 | M-4.06, M-5.05, M-4.04 |
| E2 | Tổng nhận là minh họa, chi thực = LNR × % | GĐ | D-44, R-32, P-10 | M-5.05, M-4.06 |
| E3 | Cổ đông theo tòa, % có ngày hiệu lực, dùng % cuối kỳ | GĐ | R-31, R-32, P-10 | M-4.06, M-5.05 |
| F1 | Kỳ hóa đơn, chốt 22, hạn 25–cuối tháng, phạt 200k, CK = mã phòng | GĐ (đọc mẫu) | D-09, R-11 → R-13, P-09, P-17 | M-2.08 → M-2.11, §1.3 |
| F2 | Đơn giá dịch vụ mặc định + override theo tòa | GĐ | R-14 | M-2.07 |
| F3 | Ba lớp giá phòng | GĐ | D-10, D-11, D-12 | M-2.04, M-2.06 |
| F4 | Lead theo dõi việc qua Work Queue; Work Order Phase 2 | GĐ | X-03 | M-1.01 |
| F5 | Nhóm tòa T/S/G theo pháp nhân, có ngày hiệu lực | GĐ | D-02, P-04 | M-2.03, M-5.04 |
| G | Dữ liệu cần công ty cung cấp thêm (5 mục) | — | — | §6.5, M-5.06 (golden) |
| H1 | 2 loại báo cáo CF / AC, cấu trúc tòa → nhóm → tổng, tiền thuê nhà, lương, khấu hao | ĐTL | R-01, R-02, R-03, R-27, R-28 | M-5.01 → M-5.06, M-4.04, M-4.05 |
| H2 | Trước 35 ngày lập danh sách; gia hạn bằng HĐ mới; không báo = phá HĐ | ĐTL | D-28, R-15, R-16, R-17 | M-2.12, M-1.01 |
| H3 | Điện nước đã lên hóa đơn từng phòng = doanh thu | ĐTL | D-34, R-04, P-13 | M-2.08, M-2.09, M-5.03 |
| H4 | Lương cố định theo level; mốc trọng số 100/90/70; bậc đơn giá; lương trưởng nhóm 10k/phòng | ĐTL | R-19 → R-22, R-24 | M-3.02, M-3.04, M-3.05 |
| H5 | Cọc khách bỏ không tính lại, hoàn cọc = 0 | ĐTL | D-31, R-05 | M-2.13, M-5.02, M-5.03 |
| H6 | Giả định chuẩn hóa: doanh thu đóng quý, giá gốc điện nước, không bù trừ, tài khoản vốn, khóa kỳ 16/20/sau 20 | GĐ (bên PT) | R-03, R-25, R-29, R-32, R-08, P-06 | M-5.02, M-4.01, M-4.06, M-5.01, §1.3 |

---

## 6.4 Nhật ký gộp & review chéo

Ngày gộp: **22/09/2026**. Người gộp: agent GỘP & REVIEW. Phạm vi: 7 file `nghiep_vu\00…06` → 1 file `TimoHouse_Nghiep_Vu_Phase1.md`.

### 6.4.1 Kết quả 9 mục checklist review chéo

| # | Nội dung kiểm | Kết quả |
|---|---|---|
| 1 | Mã module thống nhất (M-2.01…M-2.14, M-3.01…M-3.06, M-4.01…M-4.06, M-5.01…M-5.06) | Khớp 100 % giữa §1.5, §5.0.2 và tên module thực tế của chương 2–5. Sửa 1 tham chiếu phạm vi ở §1.1.1 (dòng yêu cầu 5 ghi "Chương 4 (M-4.01 → M-4.03)" → nêu rõ M-4.01 → M-4.06, phần import là M-4.01 + M-4.03) |
| 2 | Mọi Business Rule có mã `BR-c.mm.n` + 1 trong 3 nhãn | 471 rule (41 + 180 + 86 + 93 + 71), **không rule nào thiếu nhãn** (kiểm bằng grep loại trừ 3 nhãn) |
| 3 | ID không trùng / không định nghĩa lại | D-xx, R-xx định nghĩa duy nhất ở brief; F-01…F-56 giữ số checklist, F-57…F-72 mới ở chương 5 (đúng quy ước "mới từ F-57"); F-39…F-48 diễn giải ở chương 3 hợp lệ. Sửa: chương 4 viết `F08`…`F38` (thiếu gạch) → chuẩn hóa thành `F-08`…`F-38` (30 chỗ) |
| 4 | Metric code thuộc §0.5 | Không có metric lạ. Các tên `SALARY_COST[...]`, `SALARY_GROUP`, `HH_GROUP`, `OTHER_COST_GROUP`, `*_SHARE`, `*_ADJ`, `TOTAL_REVENUE_ADJ`… là dòng con / biến trung gian / nhãn hiển thị → đã ghi rõ trong brief §0.5 để không bị hiểu là metric_code mới |
| 5 | CF/AC không mâu thuẫn giữa chương 2/4 và §5.2 | Đã đồng bộ 4 điểm: cọc không vào doanh thu AC (R-05, BR-5.02.3); cọc bỏ = memo CF + `OTHER_INCOME` AC (D-31, BR-2.13.10, BR-5.02.8); lương HS ghi thẳng tòa không phân bổ (D-39, BR-4.02.4, BR-5.03.11); điện nước lên hóa đơn = doanh thu kể cả phòng đã trả (R-04, BR-2.08.10, BR-5.02.4) |
| 6 | Golden không bị sửa | Giữ nguyên: G1 T6 `TOTAL_REVENUE` 79.912.000 · `RENT_REVENUE` 47.760.000 · `COGS` 66.358.594 · `OPERATING_SELLING_COST` 10.476.125,04 · `NET_PROFIT` 3.077.280,96 · `SERVICE_REVENUE` 21.063.333,33 · `HEAD_LEASE_COST` 48.000.000; tháng 8 `TOTAL_REVENUE` 7.036.256.236 · `NET_PROFIT` 1.022.398.968,72 và toàn bộ cột T/S/G §5.4.7. Các số **AC minh họa** được tính lại cho khớp P-02/P-11 (không phải golden) |
| 7 | Grep chuỗi bắt buộc | Có đủ và ở đúng chỗ: `× 90%`/`× 70%` (§0.4 R-20, §1.3, §3.4) · `100/90/70` (§6.1 P-01, §6.7) · `÷ 30` (29 chỗ) · `12 tháng`/`36 tháng`/`60 tháng` (R-28, P-02, M-4.04) · `ngày 16`/`ngày 20` (lịch tháng, P-06) · `35 ngày` (R-15, M-2.12, Work Queue) · `10.000` (R-22, R-26, P-12) · `lũy kế dương` (R-32, P-10, M-4.06) · `Tổng đã đóng` (D-29, F-01/F-57, M-2.10) |
| 8 | Xử lý 22 mâu thuẫn/thiếu do 5 agent báo cáo | Xem §6.4.2 (22 dòng) |
| 9 | Không có tính năng ngoài phạm vi X-01…X-08 mô tả như tính năng Phase 1 | Đạt: hoa hồng chỉ import (X-02), không có Work Order (X-03), không có CRM (X-01), không có forecast/ROI (X-06), màn Tòa chỉ đọc snapshot (X-07); thêm X-08 cho 4 báo cáo còn thiếu để không ai hiểu là Phase 1 |

### 6.4.2 Bảng xử lý mâu thuẫn / thiếu sót

| # | Vấn đề | File / mục sửa | Cách xử lý |
|---|---|---|---|
| 1 | (W4) Golden CF ghi tiền thuê nhà 48.000.000 **mỗi tháng** dù trả quý → R-27 cũ nói "CF theo tháng thực trả" sai golden | §0.4 R-27; §1.1.2, §1.3.2, §1.4.3, §1.5 (việc 31); §2.2.9; §4.0.1, §4.1.3.b, bảng basis §4.1.9, §4.5.1, §4.5.3, §4.5.6 (BR-4.05.1/2/7), §4.5.8, §4.5.11, §4.7; §5.0.2, §5.2.3-B, §5.2.3-C, BR-5.02.5, mapping `HEAD_LEASE_COST`, §5.3.9, §5.6.2 #17 | Chốt **CF ghi theo tháng hợp đồng** (tiền thuê 1 tháng mỗi tháng hiệu lực, tháng miễn = 0); thêm entity `HEAD_LEASE_MONTHLY`; số thực trả theo đợt chỉ là sổ quỹ / lịch góp vốn; AC thẳng hàng gồm cả tháng miễn. Nhãn CF chuyển [Có bằng chứng nguồn] |
| 2 | (W4) Kế toán `150.000 + 10.000`: công thức T1/2026 là `10.000×n + 10.000` | §0.4 R-26; §3.5.10; §4.2.3 (`fixed_*`, bảng rule), BR-4.02.5, ví dụ §4.2.8; §5.3.4 `SALARY_COST[ACCOUNTING]`, F-14, §5.3.9, §5.6.2 #22 | Sửa thành **10.000 × n phòng + 10.000/tòa**, nhãn [Có bằng chứng nguồn]; `fixed_base` = 0; golden G1 (n = 15) không đổi |
| 3 | (W4) Thiếu ngưỡng vốn hóa thiết bị EXPENSE → ASSET | §0.8 (P-11); §4.1.6 BR-4.01.11; §4.4.6 BR-4.04.6; §5.2.6 BR-5.02.6; §5.3.4, §5.3.10, §5.6.6-ter G-15; §6.1 | Thêm **P-11 = 2.000.000/đơn vị**; dưới ngưỡng ghi `EQUIPMENT_PURCHASE_COST` cả CF lẫn AC |
| 4 | (W4) Phí môi giới chủ nhà 14.400.000 & cọc chủ nhà: chi phí hay đầu tư ban đầu | §4.5.1, §4.5.3 (bảng đầu tư ban đầu), BR-4.05.4, BR-4.05.5; §4.6.6 BR-4.06.5; §6.1 P-29 | Ghi rule: **đầu tư ban đầu / vốn góp**, không phải chi phí tháng; cọc là tài sản; môi giới phân bổ AC theo HĐ đầu vào. Nhãn [Cần chốt] → P-29 |
| 5 | (W4) R-32 chưa nêu basis phân phối lợi nhuận | §0.4 R-32; §4.6.3 (`PROFIT_DISTRIBUTION.basis`), BR-4.06.8, BR-4.06.13, flow & ví dụ §4.6.8; §5.5.9; §6.1 P-10 | Chốt **basis AC (Báo cáo kinh doanh)**, theo quý trên lũy kế dương; CF chỉ tham khảo. Nhãn [Cần chốt] |
| 6 | (W3) Bảng bậc lương thực tế ≥ 16 cặp (ma trận level × dải HS) | §0.4 R-21; §0.8 P-01; §3.5.3, BR-3.05.5; §6.1 P-01 | P-01 đổi thành "ma trận bậc chính thức", bảng quan sát giữ ở §3.5.3; 6 cặp của brief là ví dụ |
| 7 | (W3) "Phòng dưới quyền" 774 + 408 = 1.182 > 1.079 | §0.4 R-22; §3.1.6 BR-3.01.11; §3.5.7 BR-3.05.8; §3.7.2; §6.1 P-12 | Thêm **P-12**: tổng phòng quản lý (kể cả trống) của các tòa thuộc nhóm; TPVH tính toàn hệ thống |
| 8 | (W3) D-48 DT thu thêm có 2 nguồn (prorate ÷31 và nhập tay) | §0.3 D-48; §3.4.6 BR-3.04.8; §6.1 P-03 | Rule: phần mềm sinh tự động prorate theo P-03 (÷ 30) + cho phép dòng nhập tay có lý do, kế toán duyệt. [Cần chốt] |
| 9 | (W3) Định nghĩa kỳ lương N và mốc chốt chưa nằm trong P-06 | §0.4 R-23; §3.5.7 BR-3.05.1; §0.8 P-06; §6.1 P-06 | P-06 mở rộng: kỳ lương N = đợt hóa đơn tiền phòng tháng N, mốc 5/10/15 tháng N, chốt 16/N |
| 10 | (W3) Bậc xếp theo HS **từng tòa**, không theo HS gộp NV | §0.4 R-21 (thêm 1 câu); §3.5.7 BR-3.05.4 (đã đúng) | Bổ sung câu vào R-21 của brief kèm ví dụ Huyền (HS gộp 95,01 nhưng T3 dùng 119k/95, T24 dùng 130k/100) |
| 11 | (W3/W4) Hai khái niệm số phòng: 1.079 vs 1.303/1.382 (và 1.343) | §0.8 P-05; §4.2.6 BR-4.02.2; §3.5.7 BR-3.05.17; §5.1.6 BR-5.01.10; §5.6.3 #17; §6.1 P-05 | P-05 mô tả rõ 2 mẫu số; hệ thống dùng **1 N/kỳ**; lệch với Excel (1.343 ở lương sửa chữa T8) ghi `RULE_DIFFERENCE` có xác nhận |
| 12 | (W5) Điện chung: T6 không cộng, T8 cộng vào `ELECTRIC_REVENUE` | §0.3 D-18; §5.3.8 BR-5.03.6; §5.6.2 #9, #16; §5.7.1 mục 2; §6.1 P-13 | Rule: phần mềm **luôn cộng** (D-34); golden T6 ghi `RULE_DIFFERENCE +100.000`; thêm **P-13** (cộng vào DT điện hay dòng riêng) |
| 13 | (W5) `DT DV/GIÁ NHẬP` mẫu số gồm + lương vệ sinh (`C59 = C18/(SUM(C22:C27)+C35)`) | §0.5 (ghi chú mẫu số); §5.3.5 F-29/F-67; §5.4.8 BR-5.04.6; §5.7.1 mục 7 | Giữ F-29/F-67 theo ô công thức, nhãn [Có bằng chứng nguồn]; sửa ghi chú brief §0.5 (khác checklist F-29 cũ) |
| 14 | (W5) `HH/CPBH` = marketing + hoa hồng | §0.5; §5.3.5 F-24, F-71; §5.4.8 BR-5.04.7 | **CONFIRMED** theo ô `C85 = SUM(C46:C49)/C71`; bỏ trạng thái NEED_BUSINESS_CONFIRMATION của spec |
| 15 | (W5) Lương CF: "tháng chi lương" (§H1) hay "kỳ lương" (§C5) | §1.3.2, §1.4.2; §3.6.1, §3.6.4, BR-3.06.4, BR-3.06.6, BR-3.06.10, §3.6.8, §3.6.9, §3.6.11, §3.5.10; §4.1.9 bảng basis, BR-4.02.15, §4.7; §5.0.2, §5.2.3-B, BR-5.02.7; §6.1 P-18 | Chốt **kỳ lương cho cả CF và AC** (khớp golden); ngày chi = sổ quỹ / đối chiếu. Nhãn [Cần chốt] → P-18 |
| 16 | (W5) Thứ tự phân bổ payment vào dòng hóa đơn | §2.10.6 BR-2.10.4; §5.2.6 BR-5.02.9; §5.6.2 #8; §6.1 P-14 | Thêm **P-14** và đồng bộ rule ở M-2.10: nợ cũ → DV + điện chung → thu khác → tiền phòng → cọc |
| 17 | (W5) Khấu hao đầu tư ban đầu G1: theo HĐ đầu vào còn lại hay tách hạng mục | §0.8 P-02; §5.3.4, §5.3.10 (tính lại: `DEPRECIATION_COST` 2.325.167, `NET_PROFIT` AC −9.336.552,71), §5.5.9, §5.6.5, G-15; §6.1 P-02 | Mở rộng **P-02**: hạng mục cải tạo theo HĐ đầu vào còn lại ≤ 60 tháng; thiết bị rời theo ngưỡng 10tr; bản AC minh họa tính theo cách tách hạng mục |
| 18 | (W5) `TOTAL_REVENUE(CF)` ≠ RENT + SERVICE + cọc − hoàn (chênh 3.488.666,67 ở G1 T6) | §5.3.8 BR-5.03.2 (giữ); thêm **§5.6.3-bis**; §5.7.1 mục 11 | Giữ BR-5.03.2, thêm mục §5.6.3-bis bắt buộc hiển thị dòng đối chiếu payment ↔ hóa đơn với 5 thành phần chênh lệch; status `RULE_DIFFERENCE` đã xác nhận |
| 19 | (W2) 1 HĐ đầu vào nhiều tòa (S19A/B/C) | §2.2.6 BR-2.02.2, §2.2.9; §4.5.3 (`building_split[]`), BR-4.05.12; §5.3.4; §6.1 P-15 | Thêm **P-15**: chia `HEAD_LEASE_COST` theo tỷ lệ số phòng hoặc tỷ lệ nhập tay, tổng 100 %, có ngày hiệu lực |
| 20 | (W2) Dòng `000<tòa>` vs cột "Điện vệ sinh chung" là 2 công tơ khác nhau | §0.3 D-03, D-18; §2.3.1, §2.3.3, BR-2.03.5, §2.3.5, §2.3.11; §2.8.3, BR-2.08.14, §2.8.8; §1.3.2 (ngày 22) | Sửa D-03: `000<tòa>` = **công tơ tổng của tòa** (đơn giá gốc 3.500/2.700, đối chiếu hóa đơn NCC, không phải hóa đơn khách); D-18: "điện chung" = **công tơ khu vực chung** (3.800/kWh) chia theo người; thêm BR-2.08.14 |
| 21 | (W2) Sổ HOÀN CỌC `301T41`: tiền phòng ÷ 31 và Tổng hoàn không trừ tiền phòng | §0.3 D-32; §2.13.6 BR-2.13.17 (mới); §6.1 P-03, P-16 | Ghi `RULE_DIFFERENCE`, giữ D-32 & ÷ 30 (P-03); thêm rule "tiền phòng tháng cuối chỉ trừ vào cọc khi khách chưa đóng" |
| 22 | (W2) Combo 130k/120k cùng tòa G6; brief §0.7 cột BD chồng; mức khấu trừ hoàn cọc mặc định | §0.4 R-14 (bổ sung "giá theo HĐ có thể khác giá mặc định tòa"); §0.7 (BD = NỘI THẤT, điện hết HĐ từ **BE**); §0.3 D-14 (prorate dịch vụ ÷ 30, ví dụ 202T24); §2.13.6 BR-2.13.4 → P-16 | Sửa brief 4 điểm; mức khấu trừ mặc định thành tham số theo tòa (**P-16**); bổ sung D-14 rule prorate dịch vụ theo Ngày DV ÷ 30 [Có bằng chứng nguồn] |
| 23 | (W1) P-11…P-16 tạm của chương 1 và P-2.a…P-2.g của chương 2 trùng dãy với chương 4/5 | §0.2, §0.8; §2.15.3; §3.7.2; §4.8; §5.7.1; §6.1 (bảng đối chiếu mã tạm) | Đánh số lại thành **1 dãy P-01…P-29**, cập nhật mọi tham chiếu trong 6 file; X-xx giữ nguyên, thêm X-08 |

### 6.4.3 Thay đổi hình thức khi gộp

| # | Nội dung | Chi tiết |
|---|---|---|
| 1 | Chuẩn hóa mã công thức | `F08`…`F38` ở chương 4 → `F-08`…`F-38` (30 chỗ); `F54` ở chương 5 → `F-54 checklist` |
| 2 | Bảng đếm nhãn | Cập nhật §1.7.8 (23/4/14), §3.7.1 (29/14/43), §5.7.2 (32/14/25) theo quy ước "đếm nhãn đứng trước"; thêm §6.6 tổng hợp toàn tài liệu |
| 3 | Số BR tăng | Thêm BR-2.08.14, BR-2.13.17, BR-4.05.12, BR-4.05.13 (chương 2: 178 → 180; chương 4: 91 → 93) |
| 4 | Heading | Không có heading trùng tên cùng cấp sau khi gộp; mục lục dựng từ heading cấp 1–2 |
| 5 | Mermaid | 84 fence (42 block) mở/đóng cân; các node có nhãn CF/AC được sửa lời cho khớp rule mới |

---

## 6.5 Danh mục file nguồn

Thư mục: `docs_timonouse\`. Cột "Dùng cho" ghi chương/module đọc file làm bằng chứng nguồn.

| # | File | Loại | Vai trò / nội dung chính | Dùng cho |
|---|---|---|---|---|
| 1 | `TimoHouse_Mo_Ta_Chuc_Nang_3_Phase_v1.8_OCR_Data_Onboarding.md` | Spec kỹ thuật v1.8 | Mô tả chức năng 3 phase, ERD §11.3, Dashboard & Work Queue §12.1, OCR & Data Onboarding §12.8, tổ chức/nhân sự §12.17–12.20, chi phí/cổ đông §12.21–12.22, Metric & Report §12.23, permission §16 | Mọi chương (ưu tiên thấp nhất khi mâu thuẫn) |
| 2 | `answer.md` | Trả lời KH + giả định | Câu trả lời lần 1 (§A–G) và lần 2 ngày 22/09/2026 (§H) của công ty; giả định chuẩn hóa của bên phát triển. **§H thắng mọi mục khác** | Mọi chương; §6.3 |
| 3 | `clarification-checklist.md` | Checklist làm rõ | Định nghĩa D-01…D-58, công thức F-01…F-56, câu hỏi Q-xx theo từng dòng báo cáo, dữ liệu phải quản lý | Brief §0.3; chương 2–5 |
| 4 | `phase1.md` | Yêu cầu phạm vi | 5 dòng phạm vi Phase 1 của KH | §1.1 |
| 5 | `nghiep_vu\00_shared_brief.md` | Brief dùng chung | Quy ước, D/R/F/P/X, metric, entity, bản đồ cột sổ Excel | Mọi chương |
| 6 | `nội dung làm web Timehouse 31.8.2026(2).xlsx` | Yêu cầu KH (web) | 10 sheet: menu chính, Tổng quan, Khu nhà và tòa nhà, Thông tin khách hàng, Tài chính chung, KINH DOANH, BÁO CÁO, NHÂN SỰ, TT CỔ ĐÔNG, BẢO TRÌ BẢO DƯỠNG; lọc theo khu vực / quản lý / trưởng nhóm; thay biểu đồ bằng tiến độ thu tiền; phòng trống 3 loại | §1.1.3, §1.6, X-01/X-03/X-06/X-08 |
| 7 | `G1.31.8.26.xlsx` | Sổ vận hành tòa G1 (**golden A**) | Sổ tháng 6 & 8/2026 tòa G1: hóa đơn từng phòng, PHÒNG MỚI, HOÀN CỌC, mẫu in HĐ theo tài khoản nhận, ĐIỆN NƯỚC PHÒNG TRỐNG, `BÁO CÁO THÁNG 6` có công thức GV/CPBH/LNR, bảng cổ phần, ĐẦU TƯ BAN ĐẦU, THU CHI BAN ĐẦU | M-2.09, M-2.13, M-4.02, M-4.04, M-4.06, M-5.03, M-5.05, M-5.06 |
| 8 | `BÁO CÁO KINH DOANH THÁNG 8.xlsx` | Báo cáo tổng tháng 8 (**golden B**) | Sheet `BÁO CÁO TỔNG THÁNG 8` và `BÁO CÁO KINH DOANH THÁNG 8` (biến thể KH): báo cáo theo nhóm T/S/G → tổng, dòng hạng L1/L2/L3, 13 tỷ lệ | M-5.04, M-5.06, D-59, R-07 |
| 9 | `Hoá đơn tiền nhà tháng 9 và dịch vụ tháng 9 năm 2026.xlsx` | Sổ hóa đơn tháng | Sổ NHÀ T / NHÀ S / NHÀ G, G16/G17/G18, `cập nhật thu tiền` (M5/M10/M15 theo quản lý & tòa), `BÁO CÁO CHECK THU TIỀN`, `DS phòng phá hđ`, `HOÀN CỌC` | M-2.03 → M-2.13, M-3.03, M-3.04, §1.6 |
| 10 | `bảng lương tháng 8.xlsx` | Bảng lương | Lương cố định theo level, lương trưởng nhóm (774/408 × 10.000), mức lương/phòng theo hiệu suất (ma trận bậc), tòa mới 100k, tổng 1.079 phòng & HS 93,22 % | M-3.02 → M-3.05, P-01, P-05, P-08, P-12 |
| 11 | `Hoa hồng năm 2025-2026 (1).xlsx` | Sổ hoa hồng | Deal theo phòng, Team/người nhận, giá chốt, mức %, HĐ < 6 tháng, bỏ cọc, Đã tt, Tổng nhận | M-4.03, D-54 → D-58, P-07 |
| 12 | `Danh sách mã HĐ điện nước mạng.xlsx` | Danh mục hợp đồng NCC | Mã HĐ điện / nước / mạng theo tòa, chủ HĐ, "tt tự động" → import giá gốc dịch vụ | M-4.01, D-37 |
| 13 | `Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc` | Mẫu HĐ thuê phòng | Cấu trúc điều khoản, người thuê, cọc, giá DV, nội dung CK, phạt chậm → trường OCR cần trích | M-2.06 (OCR), M-2.07 |
| 14 | `Cau-hoi-lam-ro-nghiep-vu-Timehouse.xlsx` | Workbook câu hỏi (lần 1) | Câu hỏi gửi KH kèm trả lời bằng văn bản | Nhãn [Đã chốt]; §6.3 |
| 15 | `TimoHouse_Cau_hoi_lam_ro_nghiep_vu.xlsx` | Workbook câu hỏi (lần 2, 06/09) | Bộ câu hỏi làm rõ có cột trả lời của KH | Nhãn [Đã chốt]; §6.1, §6.7 |
| 16 | `Timohouse.xlsx` | **Đã xóa khỏi thư mục** (git status `D`) — còn trong git HEAD, lấy lại bằng `git show HEAD:docs_timonouse/Timohouse.xlsx > <đường dẫn tạm>` | Bản gốc phân tích 2 loại báo cáo mà `phase1.md` nhắc đến; nội dung đã được thay bằng file #7 và #8 | Tham chiếu lịch sử; không dùng làm golden |

File còn thiếu, cần KH cung cấp (answer §G): `bảng lương tháng 6.xlsx` **có công thức** (để đối soát lương G1 T6 1.385.173,38); `cập nhật thu tiền tháng 6 chuẩn.xlsx`; bảng bậc lương/phòng chính thức (P-01); chính sách hoa hồng bằng văn bản (D-55, P-07); danh sách tòa ↔ nhóm T/S/G tháng 8/2026 (đối soát golden B, Q63).

---

## 6.6 Bảng tổng hợp rule theo nhãn

Quy ước đếm: mỗi dòng `- **BR-c.mm.n**` là 1 rule; rule có nhãn kép (ví dụ "[Đã chốt / Cần chốt AC]") tính theo **nhãn đứng trước**.

| Chương | Module | [Đã chốt] | [Có bằng chứng nguồn] | [Cần chốt] | Tổng |
|---|---|---|---|---|---|
| 1 | M-1.01 (gồm §1.3.3 và §1.7 nguyên tắc chung) | 23 | 4 | 14 | **41** |
| 2 | M-2.01 Chủ nhà | 3 | 0 | 3 | 6 |
| 2 | M-2.02 HĐ đầu vào | 3 | 1 | 9 | 13 |
| 2 | M-2.03 Tòa nhà | 4 | 2 | 4 | 10 |
| 2 | M-2.04 Phòng | 6 | 1 | 6 | 13 |
| 2 | M-2.05 Khách thuê | 6 | 1 | 4 | 11 |
| 2 | M-2.06 HĐ thuê & OCR | 9 | 3 | 6 | 18 |
| 2 | M-2.07 Dịch vụ & bảng giá | 4 | 4 | 3 | 11 |
| 2 | M-2.08 Điện nước & chỉ số | 7 | 4 | 3 | 14 |
| 2 | M-2.09 Kỳ hóa đơn & Hóa đơn | 6 | 8 | 4 | 18 |
| 2 | M-2.10 Thu tiền | 6 | 2 | 6 | 14 |
| 2 | M-2.11 Công nợ | 6 | 1 | 3 | 10 |
| 2 | M-2.12 Sắp hết hạn / Gia hạn / Kết thúc / Phá HĐ | 9 | 1 | 5 | 15 |
| 2 | M-2.13 Cọc & Hoàn cọc | 11 | 2 | 4 | 17 |
| 2 | M-2.14 Zalo nhắc thanh toán | 9 | 0 | 1 | 10 |
| **2** | **Tổng chương 2** | **89** | **30** | **61** | **180** |
| 3 | M-3.01 Cơ cấu tổ chức | 6 | 0 | 5 | 11 |
| 3 | M-3.02 Nhân sự | 4 | 1 | 8 | 13 |
| 3 | M-3.03 Phân công tòa nhà | 7 | 0 | 7 | 14 |
| 3 | M-3.04 Hiệu suất thu tiền | 3 | 9 | 5 | 17 |
| 3 | M-3.05 Bảng lương | 6 | 4 | 9 | 19 |
| 3 | M-3.06 Chi lương | 3 | 0 | 9 | 12 |
| **3** | **Tổng chương 3** | **29** | **14** | **43** | **86** |
| 4 | M-4.01 Chi phí & Import | 5 | 3 | 10 | 18 |
| 4 | M-4.02 Phân bổ chi phí & lương | 3 | 2 | 11 | 16 |
| 4 | M-4.03 Hoa hồng (import) | 4 | 4 | 9 | 17 |
| 4 | M-4.04 Tài sản & Khấu hao | 2 | 1 | 10 | 13 |
| 4 | M-4.05 Tiền thuê nhà & chi phí trả trước | 1 | 3 | 9 | 13 |
| 4 | M-4.06 Cổ đông / Góp vốn / Phân phối | 4 | 3 | 9 | 16 |
| **4** | **Tổng chương 4** | **19** | **16** | **58** | **93** |
| 5 | M-5.01 Kỳ báo cáo & khóa kỳ | 5 | 1 | 6 | 12 |
| 5 | M-5.02 Hai biến thể CF / AC | 7 | 1 | 7 | 15 |
| 5 | M-5.03 Report A – Báo cáo tòa | 8 | 5 | 4 | 17 |
| 5 | M-5.04 Report B – Báo cáo tổng T/S/G | 4 | 5 | 2 | 11 |
| 5 | M-5.05 Bảng cổ phần | 3 | 2 | 3 | 8 |
| 5 | M-5.06 Golden & đối soát | 5 | 0 | 3 | 8 |
| **5** | **Tổng chương 5** | **32** | **14** | **25** | **71** |
| **Toàn tài liệu** | 33 module (M-1.01 + 14 + 6 + 6 + 6) | **192** | **78** | **201** | **471** |

Nhận xét: tỷ lệ [Cần chốt] cao nhất ở chương 4 (58/93 = 62 %) — đúng bản chất khối kế toán/vốn chưa có văn bản của KH; chương 2 và 5 phần lớn đã có bằng chứng nguồn từ sổ Excel nên rủi ro làm sai thấp hơn. Mọi rule [Cần chốt] có ảnh hưởng số liệu đều đã được gắn 1 mã P-xx ở §6.1 và gom thành câu hỏi ở §6.7.

---

## 6.7 Danh sách câu hỏi còn phải chốt với khách hàng

Gom theo chủ đề, mỗi dòng 1 câu hỏi cần trả lời để chuyển rule [Cần chốt] → [Đã chốt]. Cột "Ảnh hưởng nếu sai" giúp KH biết mức ưu tiên.

| # | Chủ đề | Câu hỏi | Mã P / rule | Ảnh hưởng nếu sai |
|---|---|---|---|---|
| 1 | Báo cáo – tiền thuê nhà | Báo cáo dòng tiền ghi tiền thuê nhà theo **tháng hợp đồng** (48.000.000/tháng như Excel) — xác nhận? Báo cáo kinh doanh (AC) thẳng hàng cả tháng miễn, giảm giá đợt chia đều? | P-02, R-27 | Lệch GV và lợi nhuận từng tháng của mọi tòa |
| 2 | Báo cáo – lương | Lương trên báo cáo tòa lấy theo **kỳ lương** (như Excel) cho cả 2 biến thể, ngày chi chỉ vào sổ quỹ — xác nhận? Lương kỳ N chi ngày nào tháng N+1, có tạm ứng? | P-18, P-28 | Lệch CPBH, sai lợi nhuận tháng; sai đối chiếu quỹ |
| 3 | Báo cáo – khấu hao | Đầu tư ban đầu 38.862.000 của G1 khấu hao **tách từng hạng mục** (2.325.167/tháng) hay gộp theo HĐ đầu vào (647.700/tháng)? Ngưỡng 10 triệu tính trên 1 thiết bị? | P-02 | Lợi nhuận AC và số chia cổ đông |
| 4 | Báo cáo – ngưỡng tài sản | Thiết bị từ bao nhiêu tiền mới ghi thành tài sản và khấu hao (đề xuất 2.000.000/đơn vị)? | P-11 | Ranh giới chi phí ↔ tài sản |
| 5 | Báo cáo – điện chung | Điện công tơ khu vực chung cộng vào dòng "Doanh thu điện" (như báo cáo T8) hay tách dòng riêng (như T6)? | P-13 | Doanh thu điện, `SERVICE_REVENUE`, golden T6 lệch 100.000 |
| 6 | Báo cáo – doanh thu AC | Doanh thu biến thể AC: cọc không vào doanh thu, cọc bị giữ → thu nhập khác, khách đóng trước nhiều tháng chia đều theo tháng — xác nhận? | R-03, R-05, BR-5.02.3 | Toàn bộ dòng doanh thu AC |
| 7 | Báo cáo – kỳ & cutoff | Xác nhận mốc 16 (chốt lương) / 20 (kiểm chi phí) / sau 20 (khóa kỳ); payment về sau cutoff xử lý bằng điều chỉnh kỳ hiện tại? | P-06, R-08 | Thời điểm khóa và tính lại số liệu |
| 8 | Thu tiền | Khi khách đóng thiếu, tiền trừ vào dòng nào trước (đề xuất nợ cũ → dịch vụ → thu khác → tiền phòng → cọc)? | P-14 | `RENT_REVENUE` dòng-level, khớp golden |
| 9 | Thu tiền | "Công nợ sau 5 ngày" tính từ ngày phát hành hóa đơn hay sau hạn thanh toán? Phạt 200.000/ngày tính từ đâu, có trần? | P-17, P-09 | Work Queue công nợ, dòng phạt |
| 10 | Thu tiền | Tiền mặt NVVH thu nhưng chưa nộp về công ty có tính vào mốc M5/M10/M15 không? | P-26 | Hiệu suất & lương của NVVH |
| 11 | Prorate | Chia 30 cho mọi tháng (hóa đơn, hoàn cọc, hoa hồng, DT thu thêm) hay chia số ngày thực? | P-03 | Tiền phòng tháng đầu/cuối, hoa hồng bỏ cọc |
| 12 | Hoàn cọc | 3 mức khấu trừ mặc định (khấu hao 200.000, dọn VS 100.000, sơn 300–500.000) áp chung hay theo tòa? | P-16 | Số hoàn cọc, `OTHER_INCOME` |
| 13 | Hoàn cọc | Tiền phòng tháng cuối chỉ trừ vào cọc khi khách chưa đóng — xác nhận (sổ 301T41 ghi cả khi đã đóng)? | D-32, BR-2.13.17 | Số hoàn cọc từng khách |
| 14 | HĐ đầu vào | HĐ ký chung nhiều tòa (S19A/B/C): chia tiền thuê theo số phòng hay số tiền từng tòa? | P-15 | GV và lợi nhuận từng tòa |
| 15 | HĐ đầu vào | Nhắc hạn trả chủ nhà trước 15/7/1 ngày? Cảnh báo HĐ đầu vào sắp hết từ mốc 6 tháng? | P-23 | Work Queue, nhắc cổ đông |
| 16 | Lương – bậc | Gửi bảng bậc chính thức (ma trận level × dải HS, ngưỡng 100/95/90/85/80/75) và ranh giới %; dưới 75 % có trả lương HS? | P-01 | Toàn bộ lương hiệu suất |
| 17 | Lương – trưởng nhóm | 774 và 408 phòng "dưới quyền" tính theo phạm vi nào, có gồm phòng trống? TPVH tính toàn hệ thống? | P-12 | Lương TPVH/TNVH |
| 18 | Lương – kỳ & phân công | Kỳ lương N = đợt hóa đơn tiền phòng tháng N, chốt 16/N; đổi quản lý giữa tháng tính cho người phụ trách tại ngày 15 — xác nhận? | P-06, P-21 | Ai hưởng hiệu suất của tòa |
| 19 | Lương – tòa mới | Tòa mới áp 100.000/phòng đến khi nào (2 tháng, lấp đầy 70 %, hay đánh dấu tay)? | P-08 | Lương HS tòa mới |
| 20 | Phân bổ chi phí | Xác nhận 2 mẫu số phòng: N phân bổ (1.303 T6 / 1.382 T8, kể cả trống) và số phòng tính HS (1.079); số 1.343 ở dòng lương sửa chữa T8 là chủ ý hay nhầm? | P-05 | Mọi dòng chi phí phân bổ |
| 21 | Hoa hồng | Có trả nhiều đợt (8 % + 42 %)? Có mức riêng theo đối tác (65 %)? Không thu hồi khi khách bỏ sau đó? | P-07 | `COMMISSION_COST` từng tòa |
| 22 | Cổ đông – vốn | Cọc chủ nhà và phí môi giới nằm ở vốn góp (không phải chi phí) — xác nhận? Vốn góp gốc G1 230.400.000 gồm những khoản nào? | P-29 | Tài khoản vốn, bảng cổ phần |
| 23 | Cổ đông – chia lợi nhuận | Chia theo quý trên lũy kế dương, dùng lợi nhuận **AC** (đã khấu hao, không gồm cọc) hay CF? Có cổ đông cấp công ty / cho xem báo cáo tổng? | P-10 | Số tiền chia thực tế cho cổ đông |
| 24 | Phân loại tòa | T/S/G phân theo pháp nhân, dòng sản phẩm hay khu vực? L1/L2/L3 ai gán và đổi khi nào? | P-04 | Cột nhóm của Report B |
| 25 | Vận hành khác | Mã khách sinh lúc "Chờ ký" hay lúc kích hoạt, đổi phòng có đổi mã? Ảnh công tơ bắt buộc khi nhận/trả phòng? Ngưỡng cảnh báo Work Queue? Có cần tài khoản HR riêng? | P-24, P-25, P-20, P-22, P-19 | Quy trình nhập liệu, cảnh báo, quyền |
