# Nghiệm thu bộ mockup ImageGen v1

**Ngày kiểm:** 24/09/2026 · **Đối chiếu với:** `TimoHouse_UI_Mockup_Spec_v1.0.md` (specification 1.6 lúc sinh ảnh) và `TimoHouse_Mockup_Seed_Data_v1.0.md`. Với các điểm spec và seed lệch nhau, đã đối chiếu thêm `nghiep_vu/`.

**Vị trí ảnh:** chia theo 9 cụm menu của spec §6.2, trong các thư mục `01-tong-quan/` … `09-quan-tri-he-thong/`. Mỗi thư mục có README tóm tắt kết luận của cụm đó. Xem bảng thư mục trong [`README.md`](README.md#cấu-trúc).

**Cách kiểm:** mỗi ảnh được crop và phóng to để đọc từng label, mã và số. Nội dung đọc được đem so với wireframe (vùng ①②③…), bảng "Chú giải vùng và chức năng", bảng rule, action, state (§14) và Seed Data.

**Thang kết luận:**

- **ĐẠT:** khớp spec và seed.
- **ĐẠT CÓ LƯU Ý:** đủ vùng chính, chỉ lệch nhỏ.
- **KHÔNG ĐẠT:** có ít nhất một trong các lỗi sau: sai số liệu, sai nghiệp vụ, hoặc thiếu vùng chính.

**Mức lỗi:**

- **Nghiêm trọng:** sai số liệu, sai nghiệp vụ, thiếu vùng chính.
- **Trung bình:** thiếu field hoặc action phụ, chữ sai.
- **Nhẹ:** thẩm mỹ.

## 1. Tổng hợp

Có đủ file cho 34 màn UI-00…UI-33, 8 flow, 4 bảng responsive, 2 bảng state và 1 Design System. **Chưa ảnh nào đạt trọn vẹn.**

| Nhóm | ĐẠT CÓ LƯU Ý | KHÔNG ĐẠT |
|---|---|---|
| Design System | 00 | — |
| 34 màn UI | UI-00, 01, 02, 03, 04, 05, 06, 09, 10, 16, 20, 24, 33 (13 màn) | UI-07, 08, 11, 12, 13, 14, 15, 17, 18, 19, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32 (21 màn) |
| 8 flow | F-08 | F-01, F-02, F-03, F-04, F-05, F-06, F-07 |
| Responsive | R-01, R-03 | R-02, R-04 |
| State | S-01, S-02 | — |

Riêng hai bản `verified` của UI-26 và UI-31, **số liệu khớp seed 100 %**. Hai màn này vẫn xếp KHÔNG ĐẠT vì thiếu vùng chức năng.

### Nguyên nhân chính

- **Ảnh sinh lúc 08:54** dùng prompt ngắn ở mục "Per-asset primary requests" của `PROMPTS.md`, không đưa wireframe vào prompt. Vì vậy các ảnh này có số, tên người, mã phòng và luồng duyệt do AI tự đặt ra, và thiếu các vùng cảnh báo hay ràng buộc mà spec coi là trọng tâm. Gồm: UI-07, 11, 13, 14, 15, 17, 18, 19, 21, 22, 23, 25, 29, 30, 32 và toàn bộ flow, responsive, state.
- **Ảnh sinh lúc 10:xx** đưa khối wireframe vào prompt nên bám spec tốt hơn hẳn. Phần lớn chỉ lệch nhẹ, hoặc lệch vì chép lại lỗi có sẵn trong wireframe. Các lỗi đó đã sửa ở specification 1.7, xem §3.

### Lỗi lặp lại ở hầu hết ảnh

1. Có 2–3 nút primary trên một màn, vì topbar luôn có "+ Tạo mới" màu xanh đậm. Vi phạm §5.1: mỗi màn chỉ một CTA chính.
2. Chip trạng thái chỉ có chữ, không có icon. Vi phạm §7.5. Chỉ UI-01, UI-31 verified và UI-30 làm đúng.
3. Sidebar không theo §6.2, và danh sách menu con khác nhau giữa các màn. Có mục lạ như "Bảo trì", "Chấm công", "Cọc và đối tác". Chỉ các bản render từ mã (UI-01, 26, 31) dùng đúng 9 cụm.
4. Số tiền viết kiểu en-US (`4,100,000`), trong khi chuẩn vi-VN là `4.100.000`. Gặp ở UI-15, 21, 25, 32, F-02, F-04, F-07, R-04, S-01 và Design System.
5. Tên người lặp lại dù không có trong seed: Nguyễn Văn An, Trần Thị Mai/Bình, Lê Quang Huy, Trần Văn Minh.
6. Mã phòng sai quy tắc số phòng + mã tòa: `G1-101`, `S1 / 204S12A`, "Tòa T2" thay cho T21.
7. Topbar thiếu bộ chọn Kỳ (§6.1). Chỉ UI-01 có.

### Cập nhật cụm 02 (24/09/2026, sau lần kiểm)

Cụm **Nguồn nhà & tòa/phòng** đã dựng lại bằng 7 ảnh `-verified` render từ mã, dữ liệu lấy từ HĐ chủ nhà mẫu (Seed Data §17, spec 1.8). Các ảnh này **chưa qua lần kiểm độc lập** như bảng dưới. Bảng dưới vẫn giữ kết luận cho 5 ảnh ImageGen cũ của cụm 02, nay chỉ còn là bản nháp. Xem [`02-nguon-nha-toa-phong/README.md`](02-nguon-nha-toa-phong/README.md).

## 2. Chi tiết từng ảnh

Cột "Nguồn" cho biết lỗi nằm ở đâu:

- **Ảnh:** ảnh tự sai so với spec.
- **Spec:** ảnh chép đúng một wireframe vốn đã sai. Đánh dấu ✓1.7 nếu spec đã được sửa ở specification 1.7.

### Truy cập và vận hành thuê

| Ảnh | Kết luận | Lỗi chính | Nguồn |
|---|---|---|---|
| **00 Design System** | ĐẠT CÓ LƯU Ý | Thiếu mẫu List page (saved view, bulk action, phân trang), Detail page, nút Wizard, modal Trả sửa/Từ chối/Mở khóa (§7.4). Thiếu token Accent `#D97706`, Surface, Focus ring. Secondary ghi `#3882F6` (đúng là `#3B82F6`). Lỗi chữ "Texteraa", "Số tháng 9". Chip không icon | Ảnh |
| **UI-00 Đăng nhập** | ĐẠT CÓ LƯU Ý | Thiếu băng "△ Dữ liệu mô phỏng" (bắt buộc) và nút `Gửi lại OTP`. Câu "Cập nhật theo thời gian thực" trái BR-2.03.7. CTA `#1761F5` lệch token | Ảnh |
| **UI-01 Dashboard** | ĐẠT CÓ LƯU Ý | Số liệu khớp seed §10, §14 tuyệt đối. **Nghiêm trọng:** 402G5 gán cho Khải, seed §8 là Đỗ Thanh Hương. Thiếu "Lấp đầy 78,1 %", công nợ theo tuổi nợ, nút `Mở chi tiết NV`, cột Ưu tiên/Trạng thái/Phát sinh của Work Queue | Spec ✓1.7 (402G5, LL-0007) · Ảnh (phần thiếu) |
| **UI-02 Chủ nhà** | ĐẠT CÓ LƯU Ý | Thiếu Ngày cấp, Nơi cấp, Người đại diện. Thiếu nút `Thêm tòa`, `Import` (điểm vào wizard BR-2.01.4) và `Tải tài liệu`. Mask CCCD 14 ký tự | Ảnh |
| **UI-03 HĐ đầu vào** | ĐẠT CÓ LƯU Ý | HL-0031 ghi là của T42 nhưng ⑩ lại phân bổ cho S19A/B/C. HĐ đang "Hiệu lực" mà CTA chính là `Kích hoạt`. Kỳ 1 còn 17 ngày mà gắn "Sắp đến hạn" (ngưỡng ≤15). Thiếu cột Còn lại/Chứng từ | Spec ✓1.7 · Ảnh (cột thiếu) |
| **UI-04 Tòa nhà** | ĐẠT CÓ LƯU Ý (sát KHÔNG ĐẠT) | **Nghiêm trọng:** "Chứng từ thuế" có tick xanh, spec là "○ chưa có". QL của T42 ghi Huyền, seed là Khải. Chip HKD gộp hai trạng thái. Thiếu tab Lịch sử, field Địa chỉ/Bảo vệ. Chỉ số ⑧ không có nguồn seed, "19 tháng" đúng là 18 | Ảnh (thuế) · Spec ✓1.7 (QL, 18 tháng, nhãn minh họa) |
| **UI-05 Phòng** | ĐẠT CÓ LƯU Ý | Đủ ①–⑨. Sơ đồ tầng chỉ phân biệt bằng màu. Ô ⑧ trông như nhập tay được (trái BR-2.04.5). Thiếu 4 cảnh báo bắt buộc và các cột loại/diện tích, khách/HĐ, công nợ, QL. Không dùng 15 phòng G1 nên không kiểm được ca 303G1 | Ảnh · Spec (dữ liệu minh họa T17) |
| **UI-06 Khách thuê** | ĐẠT CÓ LƯU Ý | Đủ ①–⑦. CT-2026-0442 ghi khác khách/phòng so với UI-07. Số vùng lệch. Chip không icon | Ảnh |
| **UI-07 HĐ thuê** | **KHÔNG ĐẠT** | Không theo wireframe: HĐ 204S12A / "Tòa S1" / Chờ ký, trong khi spec là 302G6 / Hiệu lực / PB 2/2. Chỉ có 8 trên 12 tab. Thiếu ②–⑧: đầu HĐ bất biến, phiên bản, giá chốt, dịch vụ snapshot, sự kiện, checklist 8 điều kiện, wizard. **"Tổng thanh toán đầu kỳ 4.020.000" bỏ mất tiền phòng.** CCCD hiện đầy đủ. Tên khách do AI tự đặt | Ảnh |
| **UI-08 OCR** | **KHÔNG ĐẠT** (sửa nhanh được) | Bám wireframe rất sát, số khớp. Bảng 8 xung đột bắt buộc mới hiện 4 (#4, #5, #6, #7); thiếu #1 tự gia hạn, #2 phạt, #3 hạn TT, #8 chuyển nhượng. Lỗi dấu: "ĐỔ THỊ THÙY LINH", "chi đối chiếu", "ĐÔNG HÔ NƯỚC" | Spec ✓1.7 (thêm 5 cảnh báo vào ⑤) · Ảnh (chữ) |
| **UI-09 Dịch vụ & giá** | ĐẠT CÓ LƯU Ý | Đủ ①–⑤, số khớp wireframe. Dòng "Bị override" không mờ, và version đã snapshot vẫn có nút sửa. Thiếu cột Trạng thái. Có 2 primary | Ảnh |
| **UI-10 Điện nước** | ĐẠT CÓ LƯU Ý | Đủ ①–⑥, phép tính đúng (thất thoát 256 kWh = 6,9 %). Thiếu link chứng từ chỉ số cũ, filter "thiếu ảnh", các cột khách/HĐ, người nhập, và action lưu nháp/duyệt/trả sửa | Ảnh · Spec (công tơ chung 1.935→1.967 là số của G1 đặt vào T17) |
| **UI-11 Kỳ hóa đơn** | **KHÔNG ĐẠT** | Là màn preflight một tòa, khác hẳn wireframe. Thiếu header 3 mốc thời gian, bảng tiến độ theo tòa, 3 blocker/5 cảnh báo, dự kiến 1.079 HĐ, thanh [Tạo kỳ][Gửi duyệt][Phát hành][Khóa kỳ][Mở lại]. **Điện chung ghi "2.32 kWh × 3.800 = 8,816 đ/người"** (seed: 40.533,33). Câu "phân bổ sau phát hành" trái BR-2.09.8. 304G1 bị báo "không tìm thấy chỉ số". Số người 201G1/304G1 sai | Ảnh |
| **UI-12 Hóa đơn** | **KHÔNG ĐẠT** | Đủ 12 dòng, tổng 1.582.000 / 5.682.000 đúng seed. **Dòng 12 Điện chung ghi 60.533, đúng là 40.533.** Lỗi rơi đúng vào ca spec yêu cầu phơi bày, mâu thuẫn với khối ⑦ ngay bên cạnh. Khối ⑦ dùng màu info thay vì blocker. Trạng thái "Nháp" đi cùng "Đã thu đủ" là mâu thuẫn có sẵn trong wireframe | Ảnh (60.533) · Spec ✓1.7 (trạng thái) |
| **UI-13 Thu tiền** | **KHÔNG ĐẠT** | Là form một phiếu thu tiền mặt. Thiếu 4 trên 5 vùng: danh sách payment, ghép thủ công, dư → credit, bộ lọc. **Thứ tự phân bổ "quá hạn → đến hạn → trả trước" sai BR-2.10.4.** Đỗ Thuỳ Linh (quản lý) bị ghi là "khách thuê nộp tiền". Có nút "Lưu nháp" nằm ngoài state machine | Ảnh |
| **UI-14 Công nợ & phạt** | **KHÔNG ĐẠT** | **Phạt "5 %/tháng"; spec là 200.000 đ/ngày từ ngày thứ 6.** Số phạt 780.000 là số bịa. Thiếu 6 chế độ xem, chuỗi duyệt phạt 4 bước, tab Nợ phá HĐ. Cột "Chủ nhà" sai nghiệp vụ. Thẻ KPI mâu thuẫn với bảng | Ảnh |
| **UI-15 HĐ sắp hết** | **KHÔNG ĐẠT** | Thiếu nhánh Chấm dứt sớm/Phá HĐ, checklist kết thúc 7 bước, bảng Kết thúc vs Phá HĐ, nút Xuất/Nhận việc. **Có ô "Tiền cọc mới" khi gia hạn, trái rule chuyển tiếp cọc.** Năm 2027 lẫn với kỳ 2026. Số ngày còn lại tính sai (có HĐ vượt ngưỡng 35 ngày vẫn nằm trong hàng đợi) | Ảnh |
| **UI-16 Cọc & hoàn cọc** | ĐẠT CÓ LƯU Ý | Bám wireframe gần 1:1, số học đúng. Cọc 301T41 = 3.600.000, seed §7 là 3.800.000. Thiếu ca prorate P-03 (1.103.225,806 so với 1.140.000). Thiếu chuỗi trạng thái | Spec ✓1.7 (cọc) · xem §4 (prorate) |
| **UI-17 Zalo ZNS** | **KHÔNG ĐẠT** | Thiếu bảng rule gửi, phương án dự phòng gọi/SMS, cột "Nợ lúc gửi" và retry, định tuyến phản hồi, CTA "+ Tạo đợt gửi". Kiểm tra công nợ lúc 09:15 nhưng gửi 14:00. Số liệu tự mâu thuẫn (158 so với 186). **Hiện rõ SĐT khách** | Ảnh |

### Nhân sự và lương

| Ảnh | Kết luận | Lỗi chính | Nguồn |
|---|---|---|---|
| **UI-18 Tổ chức** | **KHÔNG ĐẠT** | Cây tổ chức do AI tự đặt (TP.HCM/Đà Nẵng, Phòng nhân sự), thiếu Kinh doanh/Thị trường X-05. Thiếu "Xem tại ngày", timeline Lead, 408 phòng dưới quyền, băng lọc liên cấp. TPVH/TNVH sai vai trò và sai tên (seed: Đặng Đình Mạnh, Trần Quang Huy). Số người cộng không khớp | Ảnh |
| **UI-19 Nhân sự** | **KHÔNG ĐẠT** | 9 tòa ghi "G1…G9", seed là T3, T10, T20, T22, T24, T41, S26, G3, G6. Lead ghi Nguyễn Văn An, đúng là Trần Quang Huy. Level ghi "Nhân viên", đúng là NVVH-1. Thiếu cấu phần lương (⑥), cảnh báo nghỉ việc (⑦), băng quyền xem (⑧), cờ cổ đông | Ảnh · Spec ✓1.7 (tên Nguyễn Thị Thương Huyền) |
| **UI-20 Phân công tòa** | ĐẠT CÓ LƯU Ý | Đủ ①–⑤, label và số khớp. Thiếu cột nguồn/lý do/người duyệt, action Trả sửa/Duyệt/Kết thúc | Ảnh · Spec (T24 là tòa của Huyền theo seed §9.3, spec ghi Khải → Linh) |
| **UI-21 Hiệu suất thu** | **KHÔNG ĐẠT** | Toàn bộ số do AI tự đặt: Huyền 220 phòng (seed 135), HS 93,22 % (seed 95,01), lương HS 11.830.000 (seed 16.152.297). **Mọi tòa đều ghi 130.000/phòng**, trái rule bậc lương theo HS từng tòa. Thiếu ①③④⑤⑥ | Ảnh |
| **UI-22 Bảng lương** | **KHÔNG ĐẠT** | LCB của NVVH 12–13 triệu (seed 0). Thực nhận Mạnh 26.620.000 (seed 18.940.000), Huyền 34.152.297 (seed 19.152.297). Tổng 372.502.949,84 (seed 198.412.000). Drawer liệt kê G1…G9. Thiếu cảnh báo trước khi khóa và hai mẫu số 1.382/1.079. Đang "Đang rà soát" mà vẫn có nút "Gửi rà soát" | Ảnh |
| **UI-23 Chi lương** | **KHÔNG ĐẠT** | Số lặp lỗi của UI-22. Duyệt 3 cấp do AI tự đặt (spec: Admin duyệt). **Lệnh 04 chi trùng toàn bộ lệnh 01.** Lệnh "Chờ duyệt" mà NV đã "Đã chi". Thiếu loại phiếu, ND CK, băng ④ | Ảnh |
| **UI-24 Chi phí & Import** | ĐẠT CÓ LƯU Ý | Đủ ①–⑤. Có 5 dòng EX, IB-0091 142/128/9/5 đúng. Stepper dừng ở bước Upload trong khi đã có Preview. Cảnh báo vốn hóa chưa gắn vào dòng. Thiếu cột Trạng thái/Lô | Ảnh |
| **UI-25 Phân bổ** | **KHÔNG ĐẠT** | Thiếu gần hết ①–⑦: rule v4, công thức, run Marketing, chênh làm tròn, toggle CF/AC, cảnh báo G9. **N = 1.240, đúng là 1.382.** Dùng phương pháp phân bổ không có trong spec (m², thang máy…). G1 "347 căn" (seed: 15 phòng). Kỳ khóa mà vẫn "Chưa chạy" | Ảnh |

### Chi phí, tài sản và cổ đông

| Ảnh | Kết luận | Lỗi chính | Nguồn |
|---|---|---|---|
| **UI-26 verified** (bản chính) | **KHÔNG ĐẠT** (số đúng) | 13 dòng và 3 tổng khớp seed §11. Thiếu nút `+ Tạo tay`, filter Điều kiện đủ/Cảnh báo, cột Deal/Đợt/TT chi, và vùng ②④⑤⑥. Alert nói tổng ở "dòng cuối" trong khi bảng đặt tổng ở dòng đầu. Nhóm tổng gộp theo team mà không gắn nhãn cảnh báo | Ảnh (render từ `_source/`) |
| UI-26 nháp | Không dùng | Lệch phép tính do chép wireframe cũ | Spec ✓1.7 |
| **UI-27 Tài sản** | **KHÔNG ĐẠT** | AS-0301 "thạch cao + tủ bếp" lại mang nguyên giá của cả 8 hạng mục (38.862.000), ghi 48 tháng, lũy kế 7 kỳ cho 19 tháng. Có mục sidebar "Bảo trì" trái X-03. Có 2 primary | Spec ✓1.7 (theo `nghiep_vu/04` §4.4: G1 từ 10/2025, 2.325.167/th) |
| **UI-28 Tiền thuê nhà** | **KHÔNG ĐẠT** | **CF − AC lũy kế ghi "+24.000.000 = trả trước"; thực tế là −24.000.000.** Cổ đông A/B/C trái seed (G1 có 9 cổ đông). Kỳ 3 hạn 10/09 đáng lẽ đã Quá hạn. Panel S19A/B/C nằm trên màn của G1. Thiếu ghi chú "góp thiếu không chặn" | Spec ✓1.7 · Ảnh (IA, nút Lưu) |
| **UI-29 Cổ đông** | **KHÔNG ĐẠT** | Có 9 cổ đông đúng %, có hiển thị chênh 1.862.000. **Nhưng phân phối theo tháng 08/2026, trái BR-4.06.6/7 (phải theo quý và sau 3 kỳ Locked).** Cột Vốn đã góp sai seed (Chung 24tr so với seed 23,04tr; Huy Anh 19,338tr so với seed 23,04tr). Vốn cam kết 480 triệu là số bịa. Thiếu ③④⑦ và 232.262.000 / P-29 | Ảnh |

### Báo cáo và hệ thống

| Ảnh | Kết luận | Lỗi chính | Nguồn |
|---|---|---|---|
| **UI-30 Khóa kỳ** | **KHÔNG ĐẠT** | Thiếu ⑥ quy tắc sau khóa, cutoff/version, lịch 16/20. Checklist thiếu Σ % = 100 và "kỳ N−1 Locked". Freeze mục 5 ghi "cấu trúc hiện hành", spec là "% tại ngày cuối kỳ". Mở lại ghi "về Open", spec là Reopened → Reviewing. Khóa lương 10/09 là giữa kỳ | Ảnh |
| **UI-31 verified** (bản chính) | **KHÔNG ĐẠT** (số đúng) | Report A 9 dòng và Report B 11 × 4 khớp seed §13, §14. Thiếu bảng cổ phần §13.2, 11 tỷ lệ §13.1, cấu trúc 12 khối, vùng ⑦, toggle CF/AC, trạng thái Locked/version, nhãn tin cậy từng dòng, drill-down | Ảnh (render từ `_source/`) |
| UI-31 nháp | Không dùng | Số cũ lấy từ wireframe: 148.320.000, "Ng.V.A 40 %" | Spec |
| **UI-32 Golden** | **KHÔNG ĐẠT** | SALARY_COST 3,34 tỷ (G1 chỉ khoảng 3,97 triệu), DEPRECIATION_COST (metric AC) lại có golden, ELECTRIC_REVENUE chênh ngược dấu. % trên thẻ KPI tính trên mẫu 157 trong khi có 122 chỉ tiêu. Version metric sai. Không hiện đủ hai bộ golden | Ảnh |
| **UI-33 Cài đặt** | ĐẠT CÓ LƯU Ý | Đủ ①–⑦, IB-0091/0093 cộng đúng. Thiếu cột ngày hiệu lực của tham số (bắt buộc). Thiếu cột last login, hash, correlation ID. Có 2 primary | Ảnh |

### Flow

| Ảnh | Kết luận | Lỗi chính |
|---|---|---|
| **F-01 OCR → HĐ** | **KHÔNG ĐẠT** | Thiếu Work Queue, Create/Link/Update/Ignore, Validate. Giá lấy theo bảng giá (3.600.000) thay vì giá HĐ (3.500.000), trái BR-2.06.3. "Cọc 4.020.000". Không nối với job #118 của UI-08. Có trạng thái "Chờ duyệt" nằm ngoài vòng đời HĐ |
| **F-02 Chỉ số → HĐ** | **KHÔNG ĐẠT** | **Đơn giá điện phòng ghi 3.800 (đúng 4.000) → tổng 695.400.** Có "hóa đơn điện" riêng, sai mô hình 12 dòng. Thiếu bước TNVH duyệt, bước duyệt phát hành, và re-check công nợ trước khi gửi Zalo |
| **F-03 Thu → nợ → phạt** | **KHÔNG ĐẠT** | Phạt 5 %/tháng. Auto-match theo tên người chuyển với "% khớp", trái BR-2.10.3. Phân bổ lệch 200.000 mà không có dòng dư |
| **F-04 Gia hạn/Kết thúc** | **KHÔNG ĐẠT** | **Trừ tiền điện hai lần khi hoàn cọc** và bỏ qua khoản khách trả dư 216.000. Thiếu bước duyệt hoàn cọc và nhánh Phá HĐ. Cọc lệch với UI-15 |
| **F-05 Hiệu suất → lương** | **KHÔNG ĐẠT** | Hiểu M1/M2/M3 là "tòa", trong khi đó là mốc thu ngày 5/10/15. **Lệnh chi tạo lúc 14:30, trước khi khóa bảng lương lúc 16:20.** Tên người và số liệu do AI tự đặt |
| **F-06 Chi phí → khóa** | **KHÔNG ĐẠT** (sửa nhỏ) | Ghi "tự động chuyển Reviewing", spec là Kế toán gửi. Ghi "chỉ mở lại bằng bút toán", trong khi mở lại và bút toán điều chỉnh là hai cơ chế khác nhau. Thiếu bước UI-31 và nhánh Reopened |
| **F-07 Góp vốn → phân phối** | **KHÔNG ĐẠT** | Thứ tự bước đúng. Mỗi cổ đông một "HĐ chủ nhà" là sai nghiệp vụ. Vốn góp sai seed. Bước 5 chỉ có 6 cổ đông (75 %) nhưng dòng tổng ghi 100 %. Thiếu bước "trừ phần đã chia các quý trước" |
| **F-08 Đổi quản lý tòa** | ĐẠT CÓ LƯU Ý | Đủ 5 bước, đúng thứ tự. Người "Trần Văn Minh" do AI tự đặt. Đánh số bước sai (1 → 2 → 7) |

### Responsive và state

| Ảnh | Kết luận | Lỗi chính |
|---|---|---|
| **R-01…R-04** | R-01, R-03 ĐẠT CÓ LƯU Ý · R-02, R-04 KHÔNG ĐẠT | Cả 4 bảng đều thu gọn sidebar ở 1024, trong khi §5.3 quy định 1024–1439 dùng sidebar 240px. R-02 đưa hành vi của 768 sang 1024 và lặp lỗi phạt của UI-14. R-04 lặp lỗi số của UI-32 |
| **S-01** | ĐẠT CÓ LƯU Ý | Thiếu Offline/timeout, Conflict, correlation ID, Reset filter (§16.2) |
| **S-02** | ĐẠT CÓ LƯU Ý | Thiếu Gửi duyệt (có checklist), Từ chối/Hủy, Conflict 409, toast Thử lại, alert ASSUMED |

## 3. Đã sửa trong specification 1.7

Các lỗi dưới đây nằm sẵn trong wireframe, nên ảnh sinh lại sẽ lặp lỗi nếu không sửa spec. Đã sửa trực tiếp trong `TimoHouse_UI_Mockup_Spec_v1.0.md`:

| Màn | Trước | Sau | Căn cứ |
|---|---|---|---|
| §8.1 | Link `ui-mockups/README.md` (thư mục đã xóa) | Link `ui-imagegen-v1/README.md` và `AUDIT.md` | — |
| UI-01 | 402G5 · Khải; `HĐ LL-0007` | 402G5 · Hương; `HĐ HL-0021` · 13 ngày | Seed §8; LL là tiền tố của chủ nhà |
| UI-03 | "Hiệu lực" nhưng CTA `Kích hoạt`; kỳ 1 "Sắp đến hạn"; ⑩ phân bổ S19A/B/C | "Nháp"; "Chưa đến hạn"; ⑩ HL-0031 → T42 100 %, S19A/B/C chỉ còn là ví dụ | State UI-03 (≤15 ngày) |
| UI-04 | QL Huyền; 19 tháng | QL Khải; 18 tháng; ⑧ gắn nhãn số minh họa | Seed §8, §9.3 |
| UI-08 | ⑤ chỉ có 2 cảnh báo | ⑤ hiện đủ #1, #2, #3, #7, #8, cộng 3 xung đột chặn ở ④ = 8 | Bảng xung đột UI-08 |
| UI-12 | Trạng thái "Nháp" và "Đã thu đủ" cùng lúc | "Đã phát hành", CTA `[Điều chỉnh]` | Seed §6.2 (đã đóng 5.682.000) |
| UI-16 | Cọc 301T41 = 3.600.000 → hoàn 2.344.000 | 3.800.000 → 2.544.000 | Seed §7 |
| UI-19 | Nguyễn Thu Huyền | Nguyễn Thị Thương Huyền | Seed §9 |
| UI-26 | 3.500.000 × 35 % = 1.325.000; bỏ cọc 1.700.000 → HH 850.000; nhóm Tú 1.425.000 | Đợt 1.125.000 + 100.000 = 1.225.000; cơ sở 960.000 → HH 480.000 (÷31: 1.045.161 → 522.581); nhóm Tú 100.000 (đợt 2) | Số học |
| UI-27 | AS-0301 38.862.000 · 48 tháng · từ 03/2025 · lũy kế 7 kỳ | AS-0301 tủ bếp 12.600.000 · 36 tháng. Lịch G1 từ 10/2025: 2.325.167/tháng trong 12 tháng (lũy kế 27.902.000 tại 09/2026), sau đó 403.333/tháng | `nghiep_vu/04` §4.4 |
| UI-28 | CF − AC = +24.000.000 "trả trước"; cổ đông A/B/C; kỳ 3 "Sắp đến hạn"; ⑧ S19A/B/C | −24.000.000 = dồn tích (âm), trả trước khi dương; "9/9 cổ đông"; "Quá hạn"; ⑧ HL-0021 → G1 100 %; thêm ghi chú góp thiếu không chặn | 240tr − 264tr |

## 4. Cần khách hàng hoặc BA chốt

Chưa sửa các điểm dưới đây, vì mỗi điểm cần một quyết định nghiệp vụ:

1. **Kỳ golden của Report A.**
   - `nghiep_vu/` (BR-1.01.38, đã chốt) và spec UI-32 dùng **G1 06/2026**.
   - Seed Data dùng **08/2026**, vì đó là kỳ có sổ Excel đã chốt.
   - `nghiep_vu/` có ưu tiên cao hơn, nên spec giữ 06/2026. Tuy vậy, bộ ảnh verified đang đối chiếu với 08/2026. Cần chọn một kỳ, hoặc giữ cả hai bộ golden.
2. **Prorate hoàn cọc 301T41 (P-03).**
   - Seed §7 có tiền phòng 9 ngày cuối là 1.103.225,806 (chia 31), so với 1.140.000 nếu chia 30, và tiền điện cuối 820.000.
   - Wireframe UI-16 lại ghi "tiền phòng tháng cuối = 0, khách đã đóng".
   - Cần chốt xem phiếu hoàn cọc có dựng lại theo sổ HOÀN CỌC hay không.
3. **T24 ở UI-20.** Seed §9.3 xếp T24 cho Huyền, còn spec minh họa "Khải → Linh". Nên đổi sang một tòa của Khải.
4. **Công tơ chung ở UI-10.** Số 1.935 → 1.967 là của G1 (seed §6.3) nhưng đang đặt vào tòa T17.
5. **UI-26 D-P601.**
   - `nghiep_vu/04` ghi "P601 bỏ cọc 500.000" (T6).
   - Report A seed ghi hoa hồng P601 = 1.365.000 (T8).
   - Wireframe dùng cọc 3.600.000 để minh họa.
   - Cần một bộ số thống nhất.

## 5. Đề xuất làm lại

1. **Dựng lại bằng mã thay vì ImageGen**, theo cách của `_source/` (UI-01, 26, 31 verified), seed bằng Seed Data. Thứ tự ưu tiên:
   - Cụm tiền: UI-12 (dòng 12), UI-13, UI-14, F-02, F-03.
   - Cụm lương: UI-21, 22, 23, 25, F-05.
   - Cụm cổ đông và báo cáo: UI-29, F-07, UI-30, UI-32.
   - Cụm HĐ: UI-07, UI-11, UI-15, UI-17, UI-18, UI-19, F-01, F-04.
2. **Bổ sung vùng còn thiếu cho UI-26 và UI-31 verified.**
   - UI-26: ②④⑤⑥, cột Deal/Đợt/TT chi.
   - UI-31: bảng cổ phần, 11 tỷ lệ, ⑦, toggle CF/AC.
3. **Sinh lại các ảnh chép lỗi spec** theo specification 1.7: UI-01, 03, 04, 08, 16, 26, 27, 28.
4. **Sửa đồng loạt design baseline:**
   - Bỏ "+ Tạo mới" primary khỏi topbar.
   - Chip trạng thái có icon.
   - Sidebar theo §6.2.
   - Số tiền theo vi-VN.
   - Thêm bộ chọn Kỳ vào topbar.
   - Sidebar 240px ở breakpoint 1024.
