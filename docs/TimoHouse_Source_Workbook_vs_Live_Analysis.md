# TIMOHOUSE V2 — ĐỐI CHIẾU WEBSITE LIVE VỚI FILE NGUỒN `nội dung làm web Timehouse 31.8.2026(2).xlsx`

**Website kiểm tra:** https://timohousev2.netlify.app/  
**Nguồn đối chiếu:** `nội dung làm web Timehouse 31.8.2026(2).xlsx`  
**Mục tiêu:** Đối chiếu từng sheet trong file nguồn với chức năng và dữ liệu đang có trên TimoHouse V2, xác định phần đã khớp, phần còn thiếu và phần cần nghiệm thu sâu bằng dữ liệu/backend.

---

# 1. Tổng kết nhanh

| Sheet nguồn | Mức khớp hiện tại | Nhận xét |
|---|---:|---|
| Menu chính | **~95%** | Đủ nhóm nghiệp vụ, chỉ tổ chức lại menu |
| Tổng quan | **~95%** | Gần như khớp yêu cầu gốc |
| Khu nhà và tòa nhà | **~80–85%** | Core tốt, còn pháp lý/staff/detail HĐ nguồn |
| Thông tin khách hàng | **~80–85%** | Overview tốt, detail hợp đồng cần khóa thêm |
| Tài chính chung | **~85–90%** | Billing/report/cost mạnh; aging & refund detail còn thiếu |
| Kinh doanh | **~80–85%** | Đủ module, còn field-level cần hoàn thiện |
| Báo cáo | **~90%+** | Live hiện vượt khá xa mô tả Excel |
| Nhân sự | **~85–90%** | Payroll/M5/M10/M15 đã rất tốt |
| TT Cổ đông | **~60–70%** | Có module nhưng nghiệp vụ sâu chưa đủ bằng chứng |
| Bảo trì bảo dưỡng | **~75–80%** | Asset/maintenance tốt, loại lịch cụ thể cần verify |

### Đánh giá tổng thể

- **UI + flow coverage:** khoảng **90%+**
- **Field + business rule đúng nguồn:** khoảng **80–85%**
- **Production acceptance:** vẫn cần QA dữ liệu/formula/audit cho một số phần

---

# 2. Sheet `menu chính`

Nguồn yêu cầu 10 nhóm:

1. Tổng quan
2. Thông tin tòa nhà
3. Thông tin KH
4. Tài chính chung
5. Kinh doanh
6. Nhân sự
7. Tài liệu
8. Báo cáo
9. Cổ đông
10. Bảo trì/Bảo dưỡng

Live hiện tổ chức lại theo domain:

```text
TỔNG QUAN
└─ Dashboard

VẬN HÀNH
├─ Chủ nhà
├─ Tòa nhà
├─ Khách hàng
├─ Hợp đồng thuê
├─ Sổ sửa chữa
├─ Tài sản & bảo trì
└─ Tài liệu

KINH DOANH
├─ Tổng quan hàng
├─ Khách xem
├─ Giao dịch chốt
└─ Hoa hồng

TÀI CHÍNH
├─ Hóa đơn & thu tiền
├─ Chi phí
├─ Hoàn cọc
├─ Cổ đông
└─ Báo cáo

NHÂN SỰ
└─ Nhân sự & lương

THÔNG BÁO
└─ Zalo

HỆ THỐNG
├─ Import
└─ Cài đặt
```

## Đánh giá

**PASS.**

Việc không có menu tên đúng nguyên văn `Tài chính chung` hay `Bảo trì/Bảo dưỡng` không phải lỗi vì chức năng đã được tách domain hợp lý hơn.

### Live vượt nguồn ở

- Zalo
- Import dữ liệu
- Settings
- Phân quyền
- Khóa kỳ
- Audit/trace
- Hợp đồng thuê riêng

---

# 3. Sheet `Tổng quan`

Nguồn chỉ có 4 yêu cầu nhưng rất cụ thể.

## 3.1. Phòng trống chia 3 loại

Nguồn:

```text
Trống ở luôn trong tháng
Trống hết tháng
Phòng đang chờ
```

Live hiện có:

```text
Trống ở luôn
Trống cuối tháng
Đang chờ / đã cọc
```

### Đánh giá

**PASS.**

Khác wording nhỏ:

```text
trống hết tháng
→ trống cuối tháng
```

không ảnh hưởng nghiệp vụ.

---

## 3.2. Tổng doanh thu phải breakdown

Nguồn yêu cầu:

```text
Doanh thu tiền nhà
Doanh thu cọc mới
Doanh thu phá hợp đồng
```

Live hiện có riêng các số này trên Dashboard.

### Đánh giá

**PASS.**

Đây là một trong những phần đã khớp rất tốt.

---

## 3.3. Thay biểu đồ doanh thu/công nợ bằng tiến độ thu tiền

Live có:

```text
Tiến độ thu theo mốc
M5
M10
M15
```

và tỷ lệ thu.

### Đánh giá

**PASS.**

Live tốt hơn yêu cầu Excel vì milestone còn được dùng sang payroll/hiệu suất.

---

## 3.4. Filter

Nguồn:

```text
Khu vực
Quản lý
Trưởng nhóm
```

Live có:

```text
Kỳ
Loại nhà
Khu vực
Quản lý
Leader
```

### Đánh giá

**PASS — live rộng hơn nguồn.**

---

# 4. Sheet `Khu nhà và toàn nhà`

Nguồn yêu cầu gộp:

```text
Khu nhà + Tòa nhà
→ Tòa nhà
```

Live đã làm đúng hướng này.

---

## 4.1. Chủ nhà

Nguồn yêu cầu:

```text
Thông tin cá nhân full theo HĐ thuê nhà
Giá thuê
Tiền cọc
Thời gian giữ giá
Thời gian kết thúc HĐ
PCCC có/không
Người nhập nguồn
Ghi chú
Hình ảnh sổ đỏ
```

Live đã có:

- module Chủ nhà
- detail chủ nhà
- hợp đồng nguồn
- tòa liên kết
- lịch trả
- truy vết
- documents

### Đánh giá

**PARTIAL / MATCH CAO.**

### Cần kiểm tra chặt hơn

- thời gian giữ giá
- PCCC
- người nhập nguồn
- ghi chú
- sổ đỏ
- chứng từ thanh toán
- version HĐ

### Đề xuất dữ liệu PCCC

Không nên chỉ lưu:

```text
PCCC = Có/Không
```

Nên có:

```text
status
document
issue_date
expiry_date
note
```

---

## 4.2. Thông tin tòa

Nguồn:

- địa chỉ
- diện tích
- số tầng
- số phòng
- tình trạng cũ/trung bình/mới
- trưởng nhóm
- NV vận hành
- NV vệ sinh
- NV kỹ thuật
- ĐKKD
- tài sản chủ nhà
- tài sản đầu tư
- hiệu suất
- lợi nhuận
- thời gian vận hành
- lịch đóng tiền

Live đã thấy rõ nhiều field như:

- diện tích
- tầng
- số phòng
- condition
- quản lý
- hiệu suất
- doanh thu
- lợi nhuận
- owner
- asset
- payment schedule

### PASS

- diện tích
- số tầng
- số phòng
- tình trạng
- quản lý
- hiệu suất
- lợi nhuận
- owner linkage
- asset module

### PARTIAL

- trưởng nhóm riêng
- NV vệ sinh
- NV kỹ thuật
- ĐKKD
- thời gian vận hành
- lịch trả chủ nhà chi tiết
- legal docs

### Đề xuất block nhân sự tòa

```text
Nhân sự phụ trách
├─ Trưởng khu vực
├─ NV vận hành
├─ NV kỹ thuật
└─ NV vệ sinh
```

---

# 5. Sheet `Thông tin khách hàng`

## 5.1. Overview khách

Nguồn yêu cầu:

```text
Mã phòng + mã tòa
Trưởng khu vực
NV vận hành
Công nợ
Đã liên kết Zalo
Trạng thái:
  đang thuê
  phá HĐ
  chuẩn bị hết HĐ trước 35 ngày
  hoàn cọc
```

Live hiện đã có gần như toàn bộ nhóm này.

### Đánh giá

**PASS.**

Đây là một trong những màn hoàn thiện nhất.

---

## 5.2. Chi tiết lưu trú

Nguồn:

```text
Ngày bắt đầu
Ngày kết thúc HĐ
Thời hạn
Lần HĐ / gia hạn lần thứ...
Nghề nghiệp
Số lượng xe
Biển số
```

Live đã xác nhận:

- ngày HĐ
- thời hạn
- nghề nghiệp
- history/lifecycle

### Chưa đủ bằng chứng cho

- số xe
- biển số
- version `gia hạn lần 2/3`
- tạm trú

### Đánh giá

**PARTIAL.**

### Nên có riêng

```text
Người ở
Phương tiện
Tạm trú
```

---

## 5.3. Hợp đồng khách

Nguồn ghi rõ:

> tải HĐ lên và tự cập nhật bảng giá dịch vụ theo HĐ vì mỗi HĐ một loại giá dịch vụ.

Dịch vụ nguồn:

```text
Điện
Nước
Mạng
Thang máy
Dịch vụ chung
Sạc xe điện
Gửi xe
```

Live đã có:

```text
Hợp đồng thuê
Dịch vụ & giá
Lịch sử
```

### Điểm cần phân biệt

Có tab `Dịch vụ & giá` không đồng nghĩa rule upload HĐ → cập nhật giá đã đạt.

Flow chuẩn nên là:

```text
Upload HĐ
→ OCR/nhập tay
→ phát hiện giá DV
→ review
→ confirm
→ tạo Service Price Snapshot
→ áp cho HĐ
```

### Đánh giá

- **UI: PASS**
- **Business rule: PARTIAL**

---

# 6. Sheet `Tài chính chung`

Đây là sheet lớn nhất.

---

## 6.1. Hóa đơn

Nguồn yêu cầu:

```text
Mã phòng + tòa
Quản lý
Cọc
Giá niêm yết
Giá cho thuê
Số tháng TT
Tổng phải thu
Tổng đã thu
Công nợ
Ngày thu
Hạn
Trạng thái
```

Live Billing hiện đã rất sâu.

Ngoài list còn có invoice detail với:

```text
Mã KH
Phòng
Ngày chốt
Chỉ số cũ
Chỉ số mới
SL
Hệ số
Đơn giá
Thành tiền
Ghi chú
```

và các dịch vụ.

### Đánh giá

**PASS / vượt nguồn.**

---

## 6.2. Filter hóa đơn

Nguồn:

```text
Quản lý
Trưởng khu vực
Tòa
T/S/G
Trạng thái
Hạn
```

Live đã có phần lớn:

- Kỳ
- Tòa
- Quản lý
- T/S/G
- trạng thái thu
- lifecycle

### Đánh giá

**PASS / PARTIAL** ở một số filter hạn/leader tùy màn.

---

## 6.3. Công nợ

Nguồn yêu cầu:

> bỏ tên khách, dùng mã phòng + mã tòa.

Live đang theo hướng finance-by-room khá rõ.

### Gap lớn còn lại

Chưa thấy chắc chắn view:

```text
0–30 ngày
31–60
61–90
91–180
181+
```

### Đánh giá

- **Core công nợ: PASS**
- **Aging: GAP**

Đây là một trong những chức năng nên bổ sung.

---

## 6.4. Chi phí

Nguồn taxonomy rất chi tiết.

### Giá vốn

```text
Tiền thuê nhà
Mua sắm thiết bị
```

### Giá gốc dịch vụ

```text
Điện
Nước
Mạng
Rác
Môi trường
Bảo trì thang máy
```

### Chi phí vận hành

```text
Lương quản lý
Lương quản lý tổng
Trưởng phòng VH
Phó phòng VH
NV nguồn
NVKD
Vệ sinh
Kế toán
Sửa chữa
Bảo vệ
Thuê & DV VP
```

### Chi phí bán hàng/phát sinh

```text
Marketing
Sửa chữa/thay thế/bảo trì
Chi phí khác
```

Live hiện Reports đã hiển thị taxonomy này, chia:

```text
TỔNG
NHÀ T
NHÀ S
NHÀ G
```

và có allocation.

### Đánh giá

**PASS CAO.**

---

## 6.5. Báo cáo thu/chi dịch vụ

Nguồn:

```text
Tổng thu-chi điện nước dịch vụ
Danh sách từng nhà
Chi tiết từng hạng mục từng nhà
Tổng / tòa
```

Live hiện có báo cáo:

- theo tòa
- chi phí
- âm/dương
- T/S/G

### Đánh giá

**PASS.**

---

## 6.6. Hoàn cọc

Nguồn:

```text
Mã phòng+tòa
Số tiền hoàn
Tiền cọc
Khấu hao
Sửa chữa
Vệ sinh
Chi phí khác
```

Live:

- có module Hoàn cọc
- report có tổng hoàn
- có breakdown T/S/G

### Còn phải kiểm tra

Invoice/detail hoàn cọc phải có:

```text
Cọc
Tiền phòng cuối
Điện/nước cuối
Khấu hao
Sửa chữa
Vệ sinh
Sơn
Khác
Tổng hoàn
```

### Đánh giá

**PARTIAL / gần PASS.**

---

# 7. Sheet `KINH DOANH`

Live hiện chia đúng thành:

```text
Tổng quan hàng
Khách xem
Giao dịch chốt
Hoa hồng
```

Đây là mapping rất đúng với Excel nguồn.

---

## 7.1. Tổng quan hàng

Nguồn:

```text
Khu vực
Trưởng nhóm KD
NVKD
Phòng đã chốt
Phòng đã nhận
Phòng phát sinh
```

### Đánh giá

**PASS về module, PARTIAL field-level.**

---

## 7.2. Giao dịch chốt

Nguồn yêu cầu:

```text
STT
Ngày giao dịch
Mã phòng+tòa
Quản lý
SĐT
Cọc
Giá chốt
Ngày tính tiền
Thời hạn HĐ
Nguồn/công cụ khách
Đã đủ/thiếu
Sale
Hoa hồng
Ở luôn/cuối tháng/đang chờ
Ghi chú
```

Live có page riêng `Giao dịch chốt`.

### Đánh giá

- **Module: PASS**
- **Field-level: khoảng 80–90%**

Nên chạy một vòng QA riêng cho 15 field này.

---

## 7.3. Khách xem

Nguồn:

```text
Sale
Mã tòa+phòng
Nguồn sale nội bộ/đối tác
Đã xem/chốt
Khu vực
SĐT
Ngày bắn khách
```

Live có `Khách xem`.

### Đánh giá

**PASS về coverage.**

Field detail nên QA lại.

---

## 7.4. Hoa hồng

Nguồn:

```text
Mã phòng+tòa
Giá chốt
Thời hạn HĐ
Mức HH
Thành tiền
Tổng nhận
Team
Đã TT/chưa TT
```

Live có module Hoa hồng và có thêm:

```text
Đối chiếu T8 (Excel)
```

### Đánh giá

**PASS / vượt source.**

---

# 8. Sheet `BÁO CÁO`

Đây là chỗ live hiện **vượt Excel nguồn nhiều nhất**.

Nguồn có khoảng 22 concept.

## Mapping các report chính

| Nguồn | Live |
|---|---|
| Hiệu suất thực tế | Dashboard / Payroll / Reports |
| Hiệu suất tạm tính | Dashboard / Reports |
| Doanh thu tổng | Báo cáo Tổng |
| LN dòng tiền | Báo cáo Tổng |
| LN kinh doanh | Báo cáo Kinh doanh |
| BCKD loại cọc/hoàn cọc/thiết bị | Báo cáo Kinh doanh |
| Dự kiến LN | `Dự kiến LN` |
| LN/vốn | `Hiệu quả vốn` |
| LN/tài sản | `Hiệu quả tài sản` |
| Biên LN tiền nhà | nhóm hiệu quả tiền nhà |
| Giá vốn | `Chi phí` |
| Chi phí cố định | `Chi phí` |
| Chi phí phát sinh | `Chi phí` |
| Tỷ lệ lấp đầy | `Phòng vận hành` |
| Thời gian trống | `Phòng vận hành` |
| Âm/dương điện nước | `Âm dương` |
| Sửa chữa/vệ sinh | `Sửa chữa` |
| Báo cáo KH | `Khách & doanh số` |
| Conversion khách xem/chốt | `Khách & doanh số` |
| Doanh số | `Khách & doanh số` |

### Điểm rất tốt

Live hiện có:

```text
Web ↔ Excel reconciliation
Excel value dưới từng cell
ok / bad indicator
diff explanation
formula label
snapshot period
Xuất Excel theo mẫu
```

Kỳ 08/2026 còn cho thấy chênh lệch được giải thích theo từng nhóm.

### Đánh giá

**~90–95% — vượt requirement gốc.**

### Còn cần QA

- phân khúc khách `sinh viên / người đi làm`
- tỷ lệ khách đóng tiền đúng hạn / quá hạn

---

# 9. Sheet `NHÂN SỰ`

Nguồn yêu cầu:

### Overview/detail

```text
Thông tin cá nhân
Phòng ban
Chức vụ
Thâm niên
Tình trạng
```

Riêng vận hành:

```text
Số nhà quản lý
Số phòng quản lý
```

Tính lương cho:

```text
Kinh doanh
Vận hành
Kỹ thuật
Thị trường
TC-KT
```

Live hiện có:

- cơ cấu tổ chức
- nhân viên
- phân công
- payroll
- M5/M10/M15
- tổng hợp theo người
- Excel reconciliation
- cần duyệt tay

Payroll live còn có đối chiếu với source Excel.

### Đánh giá

**PASS cao cho vận hành/payroll.**

### Gap

Chưa đủ bằng chứng rằng tất cả 5 phòng ban đều có calculator/payroll rule riêng.

Có thể dùng chung payroll engine nhưng nên mapping:

```text
department
salary_policy
effective_date
formula_version
```

---

# 10. Sheet `TT CỔ ĐÔNG`

Nguồn:

```text
Danh sách cổ đông
Tỷ lệ cổ phần các nhà
Bảng chia cổ phần
Lịch đóng tiền từng người
Thống kê tài sản
Thống kê tiền cọc
Filter nhà + thời gian
```

Live có module Cổ đông riêng.

### Đánh giá

**PARTIAL ~60–70%.**

Chưa nên PASS nếu chưa thấy rõ:

```text
Shareholder
→ Building
→ Ownership %
→ Effective period
→ Capital committed
→ Capital paid
→ Profit allocation
→ Paid distribution
→ History
```

### Điểm quan trọng

Tỷ lệ `%` phải có version theo thời gian.

Ví dụ:

```text
01/01–30/06: A = 40%
01/07 trở đi: A = 35%
```

Nếu chỉ lưu một `% hiện tại` thì report lịch sử có thể sai.

---

# 11. Sheet `BẢO TRÌ BẢO DƯỠNG`

Nguồn yêu cầu:

```text
Lịch bảo dưỡng thang máy
Lịch bảo dưỡng máy bơm
Lịch bảo dưỡng máy vệ sinh/giặt
Lịch bảo dưỡng máy lọc nước
Kiểm kê tài sản
Đồ décor
```

Live đã có:

```text
Sổ sửa chữa
Tài sản & bảo trì
Lịch bảo dưỡng
Kiểm kê
```

Assets live còn khá mạnh:

- ownership chủ nhà/công ty
- nguyên giá
- giá trị còn lại
- khấu hao
- vị trí
- tình trạng
- bảo hành
- maintenance

### Đánh giá

**PASS về architecture.**

### Cần kiểm tra taxonomy

Asset/maintenance type nên có ít nhất:

```text
Elevator
Pump
Washing/Cleaning machine
Water purifier
Decoration
Other
```

Maintenance record nên có:

```text
Last date
Next date
Cycle
Vendor
Cost
Status
Assignee
Evidence
```

---

# 12. Những gap thực sự còn đáng ưu tiên

Sau khi bỏ các phần đã làm tốt, không còn quá nhiều chức năng lớn phải thiết kế lại.

## P0 — cần trước production

### 1. Công nợ aging

```text
0–30
31–60
61–90
91–180
181+
```

### 2. Hợp đồng → service price snapshot

- upload/OCR
- review
- confirm
- version giá

### 3. Refund detail acceptance

- khấu hao
- sửa chữa
- vệ sinh
- sơn
- closing utilities

### 4. Cổ đông versioning

- ownership %
- capital
- profit distribution

---

## P1

1. Building staff roles đầy đủ
2. Hồ sơ pháp lý chủ nhà/tòa
3. Xe + tạm trú + Zalo detail khách
4. Sales field-level QA
5. Maintenance taxonomy/calendar
6. Payroll rule cho toàn bộ department

---

## P2

- wording/menu consistency
- audit timeline
- empty/loading/error state
- responsive/mobile
- permission negative testing

---

# 13. Những phần live đang tốt hơn tài liệu nguồn

Workbook 31/8 chủ yếu mô tả **“cần hiển thị gì”**.

Live hiện đã bổ sung nhiều solution production mà file Excel không ghi rõ:

- Contract lifecycle
- Version/history
- Web ↔ Excel reconciliation
- Formula display
- Report snapshot
- Payroll reconciliation
- Asset depreciation
- Zalo
- Import idempotency
- Settings
- RBAC
- Kỳ & khóa kỳ
- Document management
- Bank account/template invoice config
- Audit/trace
- Export
- Preflight invoice

Đây đều là bổ sung hợp lý và không nên bỏ chỉ vì file nguồn không có.

---

# 14. Những phần không thể chứng minh chỉ bằng UI

Các hạng mục sau vẫn cần backend/data acceptance test:

1. Độ chính xác Dashboard
2. Formula doanh thu/lợi nhuận
3. Contract auto-update service price
4. Snapshot/version giá theo HĐ
5. Filter logic thực tế
6. Report calculation
7. Salary formula theo từng department
8. Shareholder ownership/version
9. Refund calculation
10. Commission calculation
11. Contract state transition
12. Permission/role enforcement
13. Zalo integration thực sự
14. Import idempotency thật
15. Period lock backend
16. Duplicate invoice protection

---

# 15. Kết luận

Nếu câu hỏi là:

> Website hiện tại đã bám đúng nội dung khách hàng ghi trong file `nội dung làm web Timehouse 31.8.2026(2).xlsx` chưa?

Thì kết luận là:

**Đã bám khá sát và không cần làm lại kiến trúc.**

### Đánh giá cuối

- **Module/menu coverage:** ~95%
- **UI/flow theo Excel nguồn:** ~90%
- **Field-level:** ~80–85%
- **Business-rule acceptance:** ~75–85%
- **Reports/financial reporting:** ~90%+
- **Cổ đông + aging + contract service snapshot:** 3 vùng cần hoàn thiện kỹ nhất

Từ giai đoạn này không nên tiếp tục thêm màn hình hàng loạt.

Nên chuyển sang **field-by-field acceptance matrix**:

```text
Sheet nguồn
→ Requirement
→ Route
→ Screen/Tab
→ UI field
→ API
→ DB field
→ Formula/Rule
→ Test case
→ Expected result
→ PASS/FAIL
```

Cách này sẽ giúp chốt nghiệp vụ chính xác hơn nhiều so với tiếp tục review bằng mắt.
