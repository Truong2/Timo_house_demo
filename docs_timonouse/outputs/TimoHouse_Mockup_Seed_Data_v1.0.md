# TIMOHOUSE — BỘ DỮ LIỆU MẪU CHO MOCKUP

**Phiên bản:** 1.0 · **Ngày lập:** 23/09/2026 · **Trạng thái:** trích từ file Excel gốc của công ty

Mọi số liệu trong tài liệu này **lấy nguyên từ sổ Excel đang dùng**, không bịa. Mục đích: khi bấm vào mockup, người review nghiệp vụ mở sổ Excel ra là đối chiếu được ngay từng con số, thay vì phải đoán xem số minh họa đúng hay sai.

## 1. Nguyên tắc dùng bộ dữ liệu này

| Nguyên tắc | Lý do |
|---|---|
| **Trục chính là tòa G1, kỳ 09/2026** | G1 có đủ chuỗi dữ liệu từ đầu tư ban đầu → cổ đông → hóa đơn từng phòng → báo cáo tháng, lại vừa đủ nhỏ (15 phòng) để dựng mockup |
| **Kỳ đối chiếu là 08/2026** | Đây là kỳ có báo cáo đã chốt của cả Report A (G1) và Report B (tổng T/S/G) → dùng làm golden |
| **Giữ nguyên số lẻ** | Excel có số lẻ thật (ví dụ 57.348.387,096…); mockup hiển thị làm tròn nhưng dữ liệu nền giữ số gốc để đối soát |
| **Che số điện thoại và CCCD của khách thuê** | Tài liệu này lưu hành nội bộ và có thể gửi ra ngoài; tên nhân viên nội bộ, mã tòa/phòng và số tiền thì giữ nguyên |
| **Không sửa số liệu cho "đẹp"** | Các chỗ lệch, thiếu, sai trong sổ gốc được giữ lại **có chủ ý** — đó chính là các ca kiểm thử giá trị nhất |

## 2. Nguồn dữ liệu

| File Excel | Sheet dùng | Cung cấp dữ liệu cho |
|---|---|---|
| `G1.31.8.26.xlsx` | `BÁO CÁO THÁNG 8` | Report A của G1, bảng chia cổ phần |
| | `ĐẦU TƯ BAN ĐẦU` | Tài sản và đầu tư ban đầu của G1 |
| | `THU CHI BAN ĐẦU` | Vốn góp cổ đông, hoa hồng theo phòng |
| `Hoá đơn tiền nhà tháng 9 và dịch vụ tháng 9 năm 2026.xlsx` | `NHÀ G` | 15 hóa đơn phòng G1 kỳ 09/2026 |
| | `cập nhật thu tiền` | Tiến độ thu theo quản lý và theo tòa, chốt 16/09 |
| | `DS phòng phá hđ` | Danh sách phá hợp đồng và công nợ |
| | `HOÀN CỌC` | Phiếu hoàn cọc |
| `bảng lương tháng 8.xlsx` | `THÁNG 8` | Nhân sự, phân công tòa, hiệu suất, bảng lương |
| `Hoa hồng năm 2025-2026 (1).xlsx` | `HOA HỒNG THÁNG 9.26` | Dòng hoa hồng |
| `Danh sách mã HĐ điện nước mạng.xlsx` | `năm 2026` | Hợp đồng nhà cung cấp điện/nước |
| `BÁO CÁO KINH DOANH THÁNG 8.xlsx` | `BÁO CÁO TỔNG THÁNG 8` | Report B tổng theo nhóm T/S/G |

---

## 3. Công ty và tài khoản

| Trường | Giá trị |
|---|---|
| Tên | HT CCMN TIMEHOUSE |
| Địa chỉ | P702B, Chung cư 789 Mỹ Đình, Nam Từ Liêm, Hà Nội |
| Tài khoản nhận | **2120368058 – NGUYEN THI HANG – Ngân hàng BIDV** |

Tài khoản này xuất hiện cả trên bảng lương lẫn trên hợp đồng thuê phòng mẫu → dùng làm tài khoản nhận mặc định trong mockup.

---

## 4. Tòa G1 — hồ sơ tòa

| Trường | Giá trị | Ghi chú |
|---|---|---|
| Mã tòa | `G1` | Nhóm **G** |
| Quản lý phụ trách chính | **Đỗ Thuỳ Linh** | Theo cột `Quản lý` của sổ tháng 9 |
| Số phòng | **15** | Chưa kể dòng công tơ tổng |
| Tiền thuê nhà | **48.000.000 đ/tháng** | |
| Cọc chủ nhà | **48.000.000 đ** | = 1 tháng tiền thuê |
| Phí môi giới | **14.400.000 đ** | Ghi ở `THU CHI BAN ĐẦU`, thuộc vốn góp |
| Mạng trả trước | **3.000.000 đ / 6 tháng** | Ca kiểm thử chi phí trả trước |
| Công tơ tổng `MAIN` | Mã `000G1`, đơn giá **3.500 đ/kWh** | Chỉ đối chiếu, **không lên hóa đơn khách** |
| Công tơ khu vực chung `COMMON` | Đơn giá **3.800 đ/kWh** | Chia theo số người |

### 4.1 Đầu tư ban đầu — tổng 38.862.000 đ

| Hạng mục | Số tiền |
|---|---:|
| Lắp máy bơm áp sân thượng | 1.175.000 |
| Điều hòa và vật tư lắp tầng 6 | 5.355.000 |
| Thạch cao ngăn phòng tầng 6 | 3.200.000 |
| 2 tủ lạnh Aqua | 5.000.000 |
| Rèm G1 | 4.782.000 |
| Tủ bếp trên | 12.600.000 |
| 1 máy giặt Aqua 8kg | 4.150.000 |
| 1 bộ giường tủ P604 | 2.600.000 |
| **Tổng** | **38.862.000** |

Đây là bộ dữ liệu để kiểm thử **ngưỡng vốn hóa** (P-11) và **thời gian khấu hao** (P-02): có hạng mục dưới 2 triệu (giường tủ… thực ra 2,6 triệu), có hạng mục cải tạo gắn tường (thạch cao, tủ bếp) và có thiết bị rời (tủ lạnh, máy giặt, điều hòa).

---

## 5. Cổ đông và vốn góp tòa G1

| Cổ đông | Tỷ lệ % | Đã góp | Vốn (bảng cổ phần T8) |
|---|---:|---:|---:|
| Chung | 10 | 23.040.000 | 4.800.000 |
| Hằng | 20 | 46.080.000 | 9.600.000 |
| Tùng | 15 | 34.560.000 | 7.200.000 |
| Ngọc | 5 | 11.520.000 | 2.400.000 |
| Mạnh | 15 | 34.560.000 | 7.200.000 |
| Hào | 10 | 23.040.000 | 4.800.000 |
| A Điệp | 5 | 11.520.000 | 2.400.000 |
| Lâm | 10 | 23.040.000 | 4.800.000 |
| Huy Anh | 10 | 23.040.000 | 4.800.000 |
| **Tổng** | **100** | **230.400.000** | **48.000.000** |

Hai điểm để kiểm thử:

- **Σ % = 100** đúng → cho phép khóa kỳ. Đổi một dòng thành 99 hoặc 101 phải **chặn khóa kỳ**.
- **Đã góp 230.400.000** nhưng tổng các khoản chi ban đầu liệt kê trong sổ là **232.262.000** → chênh **1.862.000**. Mockup phải hiển thị dòng `Chênh lệch mở sổ chờ đối soát`, **không tự chia cho ai** (P-29).

---

## 6. 15 phòng G1 và hóa đơn kỳ 09/2026

Kỳ tiền phòng: tháng 09/2026 · Kỳ dịch vụ chốt ngày 22/08/2026 · Kỳ TT = 1 tháng · Ngày ở = Ngày DV = 30.

### 6.1 Giá và người ở

| Phòng | Giá niêm yết | Giá QL | Giá hiện tại | Số người | Cọc đang giữ | Ghi chú |
|---|---:|---:|---:|---:|---:|---|
| 101G1 | 3.600.000 | 3.500.000 | 3.500.000 | 2 | 3.500.000 | |
| 201G1 | 4.200.000 | 4.100.000 | 4.100.000 | 2 | 4.100.000 | có xe điện |
| 202G1 | 4.000.000 | 3.800.000 | 3.800.000 | 2 | 3.800.000 | |
| 203G1 | 4.300.000 | 4.100.000 | 4.100.000 | 3 | 4.100.000 | Vào ở 01/08/2026 · 12th · hết 30/08/2027 |
| 301G1 | 4.200.000 | 3.900.000 | 3.900.000 | 1 | 3.900.000 | có xe điện |
| 302G1 | 4.000.000 | 3.800.000 | 3.800.000 | 2 | 3.800.000 | |
| 303G1 | 4.300.000 | 4.400.000 | 4.400.000 | 2 | 4.400.000 | **Khách mới 01/9**, chốt giá 4,4tr |
| 304G1 | 4.400.000 | 4.400.000 | 4.400.000 | 2 | 4.400.000 | **Khách mới 01/9** |
| 401G1 | 4.400.000 | 3.800.000 | 3.800.000 | 1 | 3.800.000 | |
| 402G1 | 4.000.000 | 3.900.000 | 3.900.000 | 2 | 3.900.000 | |
| 403G1 | 4.500.000 | 4.400.000 | 4.400.000 | 2 | 4.400.000 | **Khách mới 01/9**, có tủ lạnh, đổi giá 4,3 → 4,5tr |
| 404G1 | 4.400.000 | 4.200.000 | 4.200.000 | 1 | 4.200.000 | Thu thêm cọc 200.000, "tăng 400k" |
| 601G1 | 4.100.000 | 3.900.000 | 3.900.000 | 2 | 3.900.000 | |
| 603G1 | 3.300.000 | 3.000.000 | 3.000.000 | 2 | 3.000.000 | |
| 604G1 | 3.500.000 | 3.500.000 | 3.500.000 | 1 | 3.500.000 | **Khách mới 01/9** |

**Ca kiểm thử giá:** phòng `303G1` có **giá QL 4.400.000 cao hơn giá niêm yết 4.300.000** — nghịch với thông lệ. Giữ nguyên để kiểm tra màn hình có cảnh báo hay không.

### 6.2 Chỉ số điện và hóa đơn

| Phòng | CS cũ | CS mới | SL (kWh) | Tiền điện | Tổng DV | **Tổng cần đóng** | Đã đóng | Tình trạng |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| 101G1 | 728 | 804 | 76 | 304.000 | 904.000 | **4.404.000** | 4.404.000 | Đủ |
| 201G1 | 655 | 838 | 183 | 732.000 | 1.582.000 | **5.682.000** | 5.682.000 | Đủ |
| 202G1 | 2.024 | 2.547 | 523 | 2.092.000 | 2.792.000 | **6.592.000** | 6.592.000 | Đủ |
| 203G1 | 337 | 532 | 195 | 780.000 | 1.780.000 | **5.880.000** | 5.880.000 | Đủ |
| 301G1 | 379 | 382 | **3** | 12.000 | 562.000 | **4.462.000** | 4.462.000 | Đủ |
| 302G1 | 627 | 675 | 48 | 192.000 | 892.000 | **4.692.000** | 4.692.000 | Đủ |
| 303G1 | 1.578 | 1.578 | **0** | 0 | 850.000 | **9.650.000** | 9.650.000 | Đủ |
| 304G1 | 1.159 | 1.159 | **0** | 0 | 460.000 | **9.260.000** | 9.200.000 | **Thiếu −60.000** |
| 401G1 | 1.401 | 1.547 | 146 | 584.000 | 984.000 | **4.784.000** | 4.784.000 | Đủ |
| 402G1 | 1.050 | 1.228 | 178 | 712.000 | 1.412.000 | **5.312.000** | 5.312.000 | Đủ |
| 403G1 | 1.640 | 1.640 | **0** | 0 | 700.000 | **9.500.000** | 9.500.000 | Đủ |
| 404G1 | 788 | 948 | 160 | 640.000 | 940.000 | **5.340.000** | 5.340.000 | Đủ |
| 601G1 | 565 | 690 | 125 | 500.000 | 1.200.000 | **5.100.000** | 5.100.000 | Đủ |
| 603G1 | 425 | 559 | 134 | 536.000 | 1.242.000 | **4.242.000** | 4.242.000 | Đủ |
| 604G1 | 2.029 | 2.029 | **0** | 0 | 406.000 | **7.406.000** | 7.400.000 | **Thiếu −6.000** |

Công tơ tổng `000G1`: sản lượng **882 kWh × 3.500 = 3.087.000 đ**, ghi chú sổ *"trừ 300k tiền nc, 5.9 tt đủ"*.

**Bốn ca kiểm thử quý trong bảng này:**

1. **Sản lượng 0 kWh** (303G1, 304G1, 403G1, 604G1) — phòng khách mới vào 01/9 nên chỉ số đầu bằng chỉ số cuối. Hóa đơn vẫn phải lập, dòng điện = 0 chứ không ẩn dòng.
2. **Sản lượng 3 kWh** (301G1) — thấp bất thường, dùng để kiểm tra cảnh báo lệch so với trung bình 3 kỳ.
3. **Thu thiếu** (304G1 thiếu 60.000, 604G1 thiếu 6.000) — kiểm tra tình trạng `Thiếu` và chuyển công nợ.
4. **Hóa đơn khách mới** (303G1, 304G1, 403G1, 604G1) — `Tổng cần đóng` = tiền phòng + **cọc** + dịch vụ, khác hẳn hóa đơn thường.

### 6.3 Điện chung — chia theo tầng và theo số người

| Cụm phòng | CS cũ | CS mới | SL | Đơn giá | Thành tiền | Số người chia | Đơn giá/người |
|---|---:|---:|---:|---:|---:|---:|---:|
| 201G1, 202G1 | 1.935 | 1.967 | 32 | 3.800 | 121.600 | 3 | **40.533,33** |
| 203G1, 301G1, 302G1 | 144 | 209 | 65 | 3.800 | 247.000 | 3 | **82.333,33** |
| 603G1, 604G1 | — | — | 1,5 | 4.000 | 6.000 | — | ghi thẳng 6.000 |

Ba cách ghi khác nhau trong cùng một tòa — đây là lý do màn hình điện nước phải hiển thị rõ nguồn gốc từng dòng điện chung thay vì gộp một con số.

### 6.4 Bảng giá dịch vụ áp dụng cho G1

| Dịch vụ | Cách tính | Đơn giá |
|---|---|---:|
| Điện | Chỉ số | 4.000 đ/kWh |
| Nước | Theo người | 120.000 đ/người |
| Mạng | Theo phòng | 100.000 đ/phòng |
| Thang máy | Theo người | 60.000 đ/người |
| Xe điện | Theo xe | 150.000 đ/xe |
| DV khác (combo) | Theo người | 120.000 đ/người |
| Điện chung | Theo người | Tính lại mỗi kỳ |

Phòng `304G1` có chỉ số **nước theo đồng hồ** (18 → 18 m³, đơn giá 35.000) trong khi các phòng khác tính nước theo đầu người → ca kiểm thử cho quy tắc "có đồng hồ thì tính theo m³" (P-31).

---

## 7. Hoàn cọc kỳ 09/2026

| Phòng | Quản lý | Cọc giữ | Điện cuối (CS cũ → mới) | Tiền điện | Ghi chú |
|---|---|---:|---|---:|---|
| 302G3 | Nguyễn Thị Thương Huyền | 4.500.000 | 415 → 520 = 105 kWh | 420.000 | Có nước theo đồng hồ: 11 → 15 = 4 m³ |
| 501T17 | Đồng Văn Phương | 3.800.000 | 7.777 → 7.877 = 100 kWh | 400.000 | |
| **301T41** | Nguyễn Thị Thương Huyền | 3.800.000 | 9.070 → 9.275 = 205 kWh | 820.000 | **Tiền phòng 1.103.225,806** |
| 102T28 | Nguyễn Công Lâm | 3.100.000 | 5.853 → 6.000 = 147 kWh | 588.000 | |
| 201S19A | Đỗ Công Trường | 2.925.000 | 4.657 → 4.896 = 239 kWh | 956.000 | |
| 203S30 | Nguyễn Ngọ Văn Khải | 4.000.000 | 2.121 → 2.246 = 125 kWh | 500.000 | |
| 104T28 | Nguyễn Công Lâm | 2.900.000 | 8.449 → 8.532 = 83 kWh | 332.000 | |
| 304G1 | Đỗ Thanh Hương | 4.100.000 | 938 → 1.154 = 216 kWh | 864.000 | |

Tổng cọc trên sheet: **132.416.000 đ**.

**Ca kiểm thử mẫu số prorate (P-03):** phòng `301T41` có tiền phòng **1.103.225,806 đ**. Ngược lại: 1.103.225,806 = 3.800.000 ÷ **31** × 9 ngày. Nếu dùng mẫu số 30 thì con số phải là 1.140.000. Đây chính là chỗ sổ Excel đang chia 31 còn hệ thống dự kiến chia 30 — mockup phải hiển thị được cả hai số để khách chốt.

---

## 8. Danh sách phòng phá hợp đồng — kỳ 09/2026

Tổng phải thu **16.048.000 đ**, đã thu **3.662.000 đ**.

| Phòng | Quản lý | Ngày vào ở | Lý do | Phải thu | Đã thu |
|---|---|---|---|---:|---:|
| 304T35 | Nguyễn Công Lâm | — | Nghỉ học về quê | 536.000 | 500.000 |
| 505G6 | Đỗ Thị Nụ | — | Bỏ trốn | 1.068.000 | 0 |
| 502T20 | Nguyễn Thị Thương Huyền | — | Về quê | 144.000 | 0 |
| 302T36 | Đỗ Thanh Hương | 06/07/2026 | Khách thợ xong công trình | 632.000 | 0 |
| 502T11 | Đỗ Thanh Hương | 15/06/2026 | Chuyển chỗ làm | 936.000 | 0 |
| **101T21** | Đỗ Thùy Linh | 31/01/2026 | Chuyển chỗ làm | 940.000 | **1.664.000** |
| 109T42 | Nguyễn Ngọc Văn Khải | 28/05/2026 | Về quê | 104.000 | 104.000 |
| 402G5 | Đỗ Thanh Hương | 03/05/2026 | Bỏ trốn | 2.188.000 | 0 |
| 403G5 | Đỗ Thanh Hương | 16/07/2026 | Không đủ tài chính | 1.580.000 | 0 |
| 502S42 | Trịnh Xuân Hòa Tú | — | Nghỉ học về quê | 1.424.000 | 0 |
| 201T5 | Đặng Văn Thủy | 01/09/2025 | Bỏ trốn | 144.000 | 0 |
| 401S18 | Đào Hữu Hoàng Giang | 01/02/2026 | Bỏ trốn | 1.356.000 | 0 |
| 404AS4 | Trịnh Xuân Hòa Tú | 01/02/2025 | Bỏ trốn | 944.000 | 0 |
| 202S47 | Đào Hữu Hoàng Giang | 01/09/2025 | Chuyển cơ sở học | 584.000 | 584.000 |
| 402S44 | Đào Hữu Hoàng Giang | 05/07/2026 | Vỡ nợ | 560.000 | 0 |
| 203S8 | Đỗ Thùy Linh | 2023 | Báo tăng giá không ở | 404.000 | 0 |
| 403S47 | Đào Hữu Hoàng Giang | 06/07/2026 | Chuyển cơ sở học | 1.116.000 | 0 |
| 401S47 | Đào Hữu Hoàng Giang | — | Bỏ trốn | 236.000 | 0 |
| 301T7 | Đồng Văn Phương | — | Bỏ trốn | 48.000 | 50.000 |
| 201S48A | Đỗ Thanh Hương | — | — | 1.104.000 | 760.000 |

*Số điện thoại khách trong sổ gốc đã được lược bỏ khỏi tài liệu này.*

**Hai ca kiểm thử thu vượt:** `101T21` đã thu 1.664.000 trên khoản phải thu 940.000, và `301T7` đã thu 50.000 trên 48.000 → kiểm tra xử lý thu thừa của khoản nợ phá hợp đồng.

**Danh mục lý do phá hợp đồng quan sát được:** bỏ trốn · về quê / nghỉ học về quê · chuyển chỗ làm · chuyển cơ sở học · không đủ tài chính / vỡ nợ · báo tăng giá không ở · thợ xong công trình.

---

## 9. Tổ chức và nhân sự — theo bảng lương tháng 8/2026

### 9.1 Khối quản lý

| Nhân sự | Chức vụ | Lương cơ bản | Ăn trưa | Xăng xe | Lương trưởng nhóm | Thực nhận |
|---|---|---:|---:|---:|---:|---:|
| Đặng Đình Mạnh | **TPVH** | 10.000.000 | 500.000 | 700.000 | **7.740.000** | **18.940.000** |
| Trần Quang Huy | **TNVH** | 10.000.000 | 500.000 | 700.000 | **4.080.000** | **15.280.000** |

Lương trưởng nhóm = **số phòng dưới quyền × 10.000**: TPVH 774 phòng, TNVH 408 phòng. Tổng 774 + 408 = **1.182 phòng**, lớn hơn 1.079 phòng dùng tính hiệu suất → đúng là **hai mẫu số khác nhau** (P-12).

### 9.2 Nhân viên vận hành

Danh sách xuất hiện trong bảng lương và sổ thu tiền: **Nguyễn Thị Thương Huyền · Đỗ Thùy Linh · Nguyễn Công Lâm · Đỗ Thị Nụ · Đỗ Thanh Hương · Nguyễn Ngọc Văn Khải · Trịnh Xuân Hòa Tú · Đặng Văn Thủy · Đào Hữu Hoàng Giang · Đồng Văn Phương · Đặng Trung Kiên · Đỗ Công Trường**.

Cấu phần lương NVVH: lương cơ bản **0**, ăn trưa **500.000**, xăng xe **500.000**, lương hỗ trợ nhập tay (Huyền 2.000.000, Linh 0).

### 9.3 Phân công tòa — ví dụ Nguyễn Thị Thương Huyền (9 tòa / 135 phòng)

| Tòa | Số phòng | DT niêm yết | DT phải thu | Mốc 1 | Mốc 2 | Hiệu suất % | Mức lương/phòng | Lương HS tòa |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| T3 | 22 | 103.000.000 | 137.396.000 | 132.886.000 | 4.059.000 | 94,27 | 118.087,52 | 2.597.925,48 |
| T10 | 8 | 32.800.000 | 34.510.000 | 32.642.000 | 1.861.200 | 92,14 | 112.610,51 | 900.884,05 |
| T20 | 17 | 42.000.000 | 55.294.666,67 | 55.262.334 | 0 | 97,32 | 122.935,59 | 2.089.905,07 |
| T22 | 9 | 31.500.000 | 43.328.000 | 43.328.000 | 0 | **100,00** | **130.000,00** | 1.170.000 |
| T24 | 10 | 36.200.000 | 50.261.000 | 47.261.000 | 2.700.000 | 98,03 | 127.439,19 | 1.274.391,88 |
| T41 | 16 | 65.300.000 | 82.144.000 | 82.092.000 | 0 | 94,89 | 118.865,10 | 1.901.841,53 |
| S26 | 10 | 47.000.000 | 60.465.000 | 60.465.000 | 0 | 98,51 | 128.063,83 | 1.280.638,30 |
| G3 | 17 | 76.700.000 | 98.704.000 | 92.573.000 | 0 | 94,52 | 118.398,44 | 2.012.773,56 |
| G6 | 26 | 104.700.000 | 129.907.600 | 127.707.600 | 1.980.000 | 92,01 | 112.459,13 | 2.923.937,26 |
| **Tổng** | **135** | **539.200.000** | **692.010.266,67** | | | **95,01** | | **16.152.297,12** |

Thực nhận = 16.152.297,12 + 500.000 + 500.000 + 2.000.000 = **19.152.297,12 đ**.

### 9.4 Bảng bậc lương suy ra từ dữ liệu thật

Đối chiếu ngược 9 tòa của Huyền ra được công thức `Mức/phòng = Hiệu suất × Đơn giá ÷ Ngưỡng`:

| Dải hiệu suất | Đơn giá | Ngưỡng | Kiểm chứng |
|---|---:|---:|---|
| ≥ 98 | 130.000 | 100 | T22 100,00 → 130.000 · T24 98,03 → 127.439 · S26 98,51 → 128.064 |
| 95 – < 98 | 120.000 | 95 | T20 97,32 → 122.936 |
| 93 – < 95 | 119.000 | 95 | T3 94,27 → 118.088 · T41 94,89 → 118.865 · G3 94,52 → 118.398 |
| 90 – < 93 | 110.000 | 90 | T10 92,14 → 112.611 · G6 92,01 → 112.459 |

Bảng này **khớp với giả định P-01** trong `nghiep_vu/`. Bốn dải còn lại (dưới 90) chưa có dữ liệu quan sát nên vẫn phải hỏi khách.

### 9.5 Tổng bảng lương tháng 8/2026

| Chỉ tiêu | Giá trị |
|---|---:|
| Tổng số phòng tính hiệu suất | **1.079** |
| DT niêm yết | 4.228.800.000 |
| DT phải thu | 5.338.568.305,05 |
| Thu mốc 1 | 4.868.007.768 |
| Thu mốc 2 | 267.750.450 |
| Thu mốc 3 | 15.659.700 |
| Tổng DT sau 3 mốc | 5.151.417.918 |
| Dịch vụ | 1.369.649.466,67 |
| Tỷ lệ DV/DT | 25,66 % |
| DT thu thêm | 112.074.193,55 |
| Tổng DT thu được | 3.941.997.931,78 |
| **Hiệu suất chung** | **93,2178852577877 %** |
| Mức lương/phòng bình quân | 112.897,22 |
| Tổng lương hiệu suất | **146.302.949,84** |
| Tổng lương cơ bản toàn bảng | 91.434.616 |
| Tổng phụ cấp ăn trưa | 17.919.231 |
| Tổng phụ cấp xăng xe | 9.400.000 |
| Tổng lương trưởng nhóm | 11.820.000 |

---

## 10. Tiến độ thu tiền — chốt ngày 16/09/2026

### 10.1 Theo quản lý

| Quản lý | DT phải thu | Thực thu | Tỷ lệ % | DT phá HĐ | Phá HĐ thu được |
|---|---:|---:|---:|---:|---:|
| Nguyễn Thị Thương Huyền | 496.854.892,5 | 497.458.881 | **100,12** | 2.894.000 | 0 |
| Đào Hữu Hoàng Giang | 839.098.838,7 | 792.461.800 | 94,44 | 24.057.000 | 584.000 |
| Trịnh Xuân Hòa Tú | 410.381.166,7 | 407.047.833 | 99,19 | 10.588.000 | 0 |
| Đỗ Công Trường | 327.479.000 | 327.609.000 | 100,04 | 0 | 0 |
| Đỗ Thuỳ Linh | 1.021.393.600 | 1.010.613.000 | 98,94 | 8.154.000 | 1.664.000 |
| Đỗ Thị Nụ | 455.910.248,4 | 450.779.600 | 98,87 | 5.138.000 | 0 |
| Nguyễn Công Lâm | 444.273.000 | 440.337.667 | 99,11 | 4.456.000 | 500.000 |
| Đặng Văn Thủy | 507.704.058 | 503.614.000 | 99,19 | 4.184.000 | 0 |
| Đồng Văn Phương | 427.613.968 | 426.835.948 | 99,82 | 3.248.000 | 50.000 |
| Đặng Trung Kiên | 871.204.000 | 871.427.000 | 100,03 | 0 | 0 |
| Đỗ Thanh Hương | 880.447.600 | 851.348.000 | 96,69 | 33.730.000 | 760.000 |
| Nguyễn Ngọc Văn Khải | 1.059.013.510 | 1.055.884.800 | 99,70 | 3.634.000 | 104.000 |

**Ca kiểm thử tỷ lệ vượt 100 %:** bốn quản lý có tỷ lệ > 100 % do thu được cả nợ cũ. Mockup không được chặn hay làm tròn xuống 100 %.

### 10.2 Theo tòa (trích)

| Tòa | Quản lý | DT phải thu | Thực thu | Tỷ lệ % |
|---|---|---:|---:|---:|
| T2 | Đào Hữu Hoàng Giang | 54.330.000 | 54.430.000 | 100,18 |
| T3 | Nguyễn Thị Thương Huyền | 142.967.000 | 142.946.000 | 99,99 |
| T5 | Đặng Văn Thủy | 63.398.000 | 59.214.000 | 93,40 |
| T7 | Đồng Văn Phương | 35.488.000 | 32.290.000 | 90,99 |
| T8 | Đồng Văn Phương | 49.516.600 | 48.936.000 | 98,83 |
| T10 | Đỗ Thuỳ Linh | 43.850.000 | 43.852.000 | 100,00 |
| T11 | Đỗ Thanh Hương | 39.128.000 | 34.322.000 | 87,72 |
| T17 | Đồng Văn Phương | 43.632.000 | 46.132.000 | **105,73** |

---

## 11. Hoa hồng — kỳ 09/2026

Nội dung chuyển khoản chuẩn ghi trong sổ: **`HH + tên người nhận + lần 1 (lần 2…)`**

| Phòng | Tòa | Người nhận | Giá chốt | Thời hạn | Mức HH | Thành tiền | Tổng nhận | Team |
|---|---|---|---:|---|---:|---:|---:|---|
| 103G5 | G5 | Hương | 5.000.000 | 12th | 35 % | 1.750.000 | 1.750.000 | Ánh Sao |
| 501S45 | S45 | Kiên | 4.300.000 | 12th | **50 %** | 2.150.000 | 3.830.000 | Bách |
| 502S49 | S49 | Hương | 4.800.000 | 12th | 35 % | 1.680.000 | | |
| 101G3 | G3 | Huyền | 4.300.000 | 12th | 35 % | 1.505.000 | 10.345.000 | Dương |
| 801S21 | S21 | Hương | 4.200.000 | 12th | 35 % | 1.470.000 | | |
| 402T17 | T17 | Phương | 4.200.000 | 12th | 35 % | 1.470.000 | | |
| 302S27 | S27 | Khải | 4.000.000 | 12th | **50 %** | 2.000.000 | | |
| 401S25A | S25A | Khải | 4.300.000 | 12th | **50 %** | 2.150.000 | | |
| 302T13 | T13 | Thủy | 3.500.000 | 12th | **50 %** | 1.750.000 | | |
| 201G9 | G9 | Trường | 3.000.000 | 12th | **50 %** | 1.500.000 | 7.875.000 | Đỗ Chiến |
| 301T43 | T43 | Hương | 3.300.000 | 12th | 35 % | 1.155.000 | | |
| 101S31 | S31 | Giang | 3.500.000 | 12th | **50 %** | 1.750.000 | | |
| 502S36 | S36 | Trường | 4.200.000 | 12th | 35 % | 1.470.000 | | |

Tổng sheet: giá chốt **900.416.666,7** · thành tiền **464.085.294,6** · tổng nhận **293.195.133,3**.

Hai mức 35 % và 50 % cùng tồn tại đúng như mức tham chiếu D-55. `Tổng nhận` chỉ điền ở dòng cuối của mỗi nhóm người nhận → chính là quy tắc gộp theo người nhận trong cùng kỳ chi.

### 11.1 Hoa hồng theo phòng của G1 (kỳ đầu)

101G1 1.800.000 · 202G1 1.900.000 · 203G1 1.900.000 · 301G1 1.950.000 · 302G1 1.900.000 · 303G1 2.000.000 · 304G1 2.050.000 · 401G1 1.950.000 · 402G1 1.950.000 · 403G1 1.950.000 · 404G1 1.950.000 · 601G1 1.900.000 · 603G1 1.500.000 · 604G1 1.750.000 — riêng **201G1 = 0**.

---

## 12. Hợp đồng nhà cung cấp điện nước

| Tòa | Mã hợp đồng điện | Chủ hợp đồng | Mã nước |
|---|---|---|---|
| T2 | `PD05000162909`, `PD05000125565` | Tống Văn Định, Nguyễn Lan Anh | Hóa đơn |
| T3 | `PD0500T038589` | Nguyễn Văn Khiết | Hóa đơn |
| T5 | `PD05000105868` | Dương Văn Thành | `000057172` Viwaco |
| T7 | `Pd05000086962` | Hồ Bích Diệp | Hóa đơn |
| T8 | `PD1200T021726` | Vũ Thị An Thái | `511135799` Viwaco |
| T10 | `PD30000244539` | Nguyen Thi Anh Dao | `512556957` |

Ba ca kiểm thử: **một tòa có hai mã điện** (T2), **chủ hợp đồng không phải Timehouse** (là cá nhân chủ nhà), và **mã viết hoa/thường không đồng nhất** (`Pd05000086962`).

---

## 13. Report A — G1 kỳ 08/2026 (golden)

| Dòng | Giá trị |
|---|---:|
| **Tổng doanh thu tháng 8** | **84.186.000** |
| Cọc phòng mới — P203 | 4.100.000 |
| Cọc phòng mới — P601 | 3.900.000 |
| Hoàn cọc — P203 | 2.940.000 |
| Tổng số phòng phá HĐ | 1 |
| Tổng số phòng mới | 2 |
| Tổng số phòng trống | 0 |
| Doanh thu tiền phòng | 57.348.387,096774 |
| Doanh thu điện | 12.099.500 |
| Doanh thu nước | 3.344.516,129032 |
| Doanh thu phí vệ sinh | 1.792.258,064516 |
| Doanh thu mạng | 1.093.548,387097 |
| Doanh thu xe điện | 300.000 |
| Doanh thu phí thang máy | 1.792.258,064516 |
| Doanh thu máy giặt | 1.792.258,064516 |
| **Doanh thu tổng dịch vụ** | **22.214.338,709677** |
| Tiền thuê nhà | 48.000.000 |
| Giá gốc điện | 12.595.068 |
| Giá gốc nước | 300.000 |
| Giá gốc mạng | 0 |
| Phí thu rác | 300.000 |
| **Giá vốn (GV)** | **61.195.068** |
| Lương quản lý | 1.752.429,264279 |
| Lương quản lý tổng | 141.099,855282 |
| Lương trưởng phòng vận hành | 367.076,700434 |
| Lương phó phòng vận hành | 43.415,340087 |
| Lương nhân viên nguồn | 32.561,505065 |
| Lương NVKD part-time | 621.924,757598 |
| Lương vệ sinh | 550.000 |
| Lương kế toán | 181.707,670043 |
| Lương sửa chữa | 279.225,614296 |
| Thuê và DV văn phòng | 584.492,376990 |
| Phí marketing | 257.029,667149 |
| Hoa hồng — P203 | 2.050.000 |
| Hoa hồng — P601 | 1.365.000 |
| Sửa chữa — sửa tủ P304 | 100.000 |
| **Tổng chi phí bán hàng (CPBH)** | **8.325.962,751223** |
| **Tổng chi phí (TCP)** | **69.521.030,751223** |
| **Lợi nhuận gộp (LNG)** | **22.990.932** |
| **Lợi nhuận ròng (LNR)** | **14.664.969,248777** |

### 13.1 Mười một tỷ lệ

| Tỷ lệ | Giá trị |
|---|---:|
| LNR / DT | 17,42 % |
| LNG / DT | 27,31 % |
| LNR / GV | 23,96 % |
| LNR / LNG | 63,79 % |
| CP / LNG | 3,02 lần |
| GV / DT | 72,69 % |
| CPBH / DT | 9,89 % |
| TCP / DT | 82,58 % |
| Lương / CPBH | 47,68 % |
| HH / CPBH | 44,10 % |
| CPK / CPBH | 0 % |

### 13.2 Bảng chia cổ phần G1 tháng 8

| Cổ đông | % | Vốn | LN gộp | LN ròng | Tổng nhận |
|---|---:|---:|---:|---:|---:|
| Chung | 10 | 4.800.000 | 2.299.093,20 | 1.466.496,92 | 6.266.496,92 |
| Hằng | 20 | 9.600.000 | 4.598.186,40 | 2.932.993,85 | 12.532.993,85 |
| Tùng | 15 | 7.200.000 | 3.448.639,80 | 2.199.745,39 | 9.399.745,39 |
| Ngọc | 5 | 2.400.000 | 1.149.546,60 | 733.248,46 | 3.133.248,46 |
| Mạnh | 15 | 7.200.000 | 3.448.639,80 | 2.199.745,39 | 9.399.745,39 |
| Hào | 10 | 4.800.000 | 2.299.093,20 | 1.466.496,92 | 6.266.496,92 |
| A Điệp | 5 | 2.400.000 | 1.149.546,60 | 733.248,46 | 3.133.248,46 |
| Lâm | 10 | 4.800.000 | 2.299.093,20 | 1.466.496,92 | 6.266.496,92 |
| Huy Anh | 10 | 4.800.000 | 2.299.093,20 | 1.466.496,92 | 6.266.496,92 |
| **Tổng** | **100** | **48.000.000** | **22.990.932** | **14.664.969,25** | **62.664.969,25** |

---

## 14. Report B — tổng toàn hệ thống kỳ 08/2026 (golden)

| Chỉ tiêu | TỔNG | NHÀ T | NHÀ S | NHÀ G |
|---|---:|---:|---:|---:|
| Tổng doanh thu | 7.036.256.236 | 2.527.702.129 | 3.551.745.507 | 956.808.600 |
| Cọc phòng mới | 371.850.000 | 152.600.000 | 187.450.000 | 31.800.000 |
| Cọc khách bỏ không ở | 18.400.000 | 9.500.000 | 7.900.000 | 1.000.000 |
| Hoàn cọc | 104.968.774 | 32.671.000 | 67.345.774 | 4.952.000 |
| **Số phòng phá HĐ** | **39** | 18 | 15 | 6 |
| **Số phòng mới** | **95** | 41 | 47 | 7 |
| **Số phòng trống** | **11** | 6 | 4 | 1 |
| Doanh thu tiền phòng | 5.021.511.225,81 | 1.769.319.354,84 | 2.539.543.161,29 | 712.648.709,68 |
| Doanh thu điện | 1.097.824.306,45 | 410.023.400 | 566.431.806,45 | 121.369.100 |
| Doanh thu nước | 233.501.129,03 | 83.974.354,84 | 122.013.225,81 | 27.513.548,39 |
| Doanh thu vệ sinh | 117.643.376,34 | 40.420.258,06 | 59.399.569,89 | 17.823.548,39 |
| Doanh thu mạng | 104.264.193,55 | 38.452.258,06 | 54.599.032,26 | 11.212.903,23 |
| Doanh thu xe điện | 10.516.129,03 | 6.758.064,52 | 2.458.064,52 | 1.300.000 |
| Doanh thu thang máy | 55.920.301,08 | 15.558.989,25 | 29.633.892,47 | 10.727.419,35 |
| Doanh thu máy giặt | 125.500.150,54 | 44.778.000 | 60.799.569,89 | 19.922.580,65 |
| **Doanh thu tổng dịch vụ** | **1.745.169.586,02** | 639.965.324,73 | 895.335.161,29 | 209.869.100 |
| Tiền thuê nhà | 4.086.483.333,33 | 1.459.650.000 | 2.045.333.333,33 | 581.500.000 |
| Mua sắm thêm thiết bị | 35.380.000 | 17.370.000 | 12.570.000 | 5.440.000 |
| Giá gốc điện | 935.197.739 | 329.077.851 | 482.783.854 | 123.336.034 |
| Giá gốc nước | 202.388.331,67 | 77.626.060 | 109.083.951,67 | 15.678.320 |
| Giá gốc mạng | 33.982.034,58 | 14.310.004 | 17.521.729,58 | 2.150.301 |
| Phí thu rác | 20.593.333,33 | 6.683.333,33 | 11.510.000 | 2.400.000 |
| Phí môi trường | 1.904.000 | 1.904.000 | 0 | 0 |
| Phí bảo trì thang máy | 1.000.000 | 0 | 1.000.000 | 0 |
| **Giá vốn (GV)** | **5.316.928.771,92** | 1.906.621.248,33 | 2.679.802.868,58 | 730.504.655 |
| Lương vệ sinh | 43.200.000 | 15.750.000 | 22.450.000 | 5.000.000 |
| Lương bảo vệ | 5.500.000 | **5.500.000** | 0 | 0 |
| Phí marketing | 212.504.545,19 | 86.804.284,54 | 105.255.715,36 | 20.444.545,29 |
| Sửa chữa, thay thế, bảo trì | 37.376.000 | 12.923.000 | 16.835.000 | 7.618.000 |

**Kiểm tra cộng dồn:** mọi dòng tiền và dòng đếm phải thỏa `TỔNG = T + S + G` tuyệt đối. Ví dụ phòng mới 95 = 41 + 47 + 7 ✓ · giá gốc điện 935.197.739 = 329.077.851 + 482.783.854 + 123.336.034 ✓.

**Kiểm tra tỷ lệ:** các dòng tỷ lệ **không được cộng**, phải tính lại từ tử số và mẫu số của từng cột.

**Ca kiểm thử dòng lệch nhóm:** lương bảo vệ chỉ phát sinh ở nhóm T (5.500.000), hai nhóm còn lại bằng 0 — kiểm tra hiển thị 0 thay vì ẩn dòng.

---

## 15. Bảng đối soát nhanh cho QA

| # | Nội dung kiểm | Giá trị kỳ vọng | Nguồn |
|---:|---|---|---|
| 1 | Hóa đơn `101G1` kỳ 09/2026 | Tổng cần đóng **4.404.000** | Sổ T9, NHÀ G |
| 2 | Hóa đơn `401G1` kỳ 09/2026 | Tổng cần đóng **4.784.000** | Sổ T9 |
| 3 | Điện `202G1` | 2.547 − 2.024 = **523 kWh** → 2.092.000 đ | Sổ T9 |
| 4 | Điện chung tầng 2 G1 | 32 kWh × 3.800 ÷ 3 người = **40.533,33 đ/người** | Sổ T9 |
| 5 | Công tơ tổng `000G1` | 882 kWh × 3.500 = **3.087.000**, không lên hóa đơn khách | Sổ T9 |
| 6 | Tình trạng `304G1` | **Thiếu −60.000** | Sổ T9 |
| 7 | Σ % cổ phần G1 | **100 %** → cho khóa kỳ | Báo cáo T8 |
| 8 | Chênh vốn góp G1 | **1.862.000** hiển thị riêng, không tự phân bổ | THU CHI BAN ĐẦU |
| 9 | Lợi nhuận ròng G1 T8 | **14.664.969,25** | Báo cáo T8 |
| 10 | Tổng nhận cổ đông Hằng 20 % | **12.532.993,85** | Bảng chia cổ phần |
| 11 | Hiệu suất Huyền T22 | **100 %** → mức 130.000/phòng | Bảng lương T8 |
| 12 | Thực nhận Huyền T8 | **19.152.297,12** | Bảng lương T8 |
| 13 | Lương trưởng nhóm TPVH | 774 × 10.000 = **7.740.000** | Bảng lương T8 |
| 14 | Hiệu suất chung toàn hệ thống | **93,2178852577877 %** | Bảng lương T8 |
| 15 | Report B phòng mới | 95 = 41 + 47 + 7 | Báo cáo tổng T8 |
| 16 | Prorate `301T41` | 1.103.225,806 = 3.800.000 ÷ **31** × 9 → so với ÷30 = 1.140.000 | Sổ HOÀN CỌC |
| 17 | Nợ phá HĐ `101T21` | Phải thu 940.000, đã thu **1.664.000** → thu vượt | DS phá HĐ |
| 18 | Tỷ lệ thu T17 | **105,73 %** → không chặn, không làm tròn | Cập nhật thu tiền |

---

## 16. Những chỗ dữ liệu gốc đang lệch — giữ nguyên trong mockup

| Vấn đề | Chi tiết | Mã liên quan |
|---|---|---|
| Mẫu số prorate | Sổ hóa đơn chia **30**, sổ hoàn cọc và file hoa hồng chia **31** | P-03 |
| Vốn góp G1 | Đã góp 230.400.000 vs Σ khoản liệt kê 232.262.000, chênh **1.862.000** | P-29 |
| Hai mẫu số phòng | N phân bổ **1.382** vs số phòng tính hiệu suất **1.079** (tháng 8) | P-05 |
| Giá QL > giá niêm yết | Phòng `303G1`: QL 4.400.000 > niêm yết 4.300.000 | — |
| Điện chung ba cách ghi | Theo tầng, theo cụm phòng, và ghi thẳng 6.000 cho 603/604G1 | P-13 |
| Mã hợp đồng NCC | Một tòa hai mã điện; viết hoa/thường không đồng nhất | — |
| Lỗi công thức trong sổ | Sheet `cập nhật thu tiền` còn ô `#REF!` và `#DIV/0!` | — |

Nguyên tắc: mockup **hiển thị đúng số gốc và gắn nhãn cảnh báo**, tuyệt đối không tự sửa cho khớp.
