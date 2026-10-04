# TIMOHOUSE V2 — AUDIT LIVE SO VỚI FILE NGUỒN `nội dung làm web Timehouse 31.8.2026(2).xlsx`

**Website:** https://timohousev2.netlify.app/  
**Nguồn đối chiếu:** `nội dung làm web Timehouse 31.8.2026(2).xlsx`  
**Ngày audit:** 04/10/2026  
**Phạm vi:** Đối chiếu chức năng, dữ liệu hiển thị, flow và business rule giữa website live với nội dung yêu cầu trong 10 sheet nguồn.

> Nguyên tắc đánh giá: Có menu/route không đồng nghĩa đã PASS chức năng. Những rule chỉ backend/data mới chứng minh được sẽ giữ ở mức PARTIAL hoặc cần acceptance test.

---

# 1. Kết luận tổng thể

| Sheet nguồn | Mức khớp hiện tại | Đánh giá |
|---|---:|---|
| Menu chính | **~95%** | Khớp chức năng, chỉ reorganize menu |
| Tổng quan | **~80–90%** | Core đã có, cần confirm lại 3 bucket + breakdown DT ở đúng Dashboard |
| Khu nhà và tòa nhà | **~70–80%** | Building tốt, owner/legal/staff detail còn thiếu bằng chứng |
| Thông tin khách hàng | **~70–80%** | Core có, service snapshot + phương tiện/tạm trú cần kiểm tra |
| Tài chính chung | **~75–85%** | Module đủ, field-level và refund/công nợ aging còn gap |
| Kinh doanh | **~70–80%** | Đủ các page, cần QA từng cột nguồn |
| Báo cáo | **~95%** | Phần mạnh nhất, gần như map hết source |
| Nhân sự | **~70–85%** | Payroll đã tiến xa, còn rule theo từng phòng ban |
| TT Cổ đông | **~60–70%** | Có framework, chưa đủ detail/versioning |
| Bảo trì/Bảo dưỡng | **~60–75%** | Asset tốt, lịch bảo dưỡng cụ thể cần verify |

## Overall

- **Module coverage:** ~95%
- **UI/flow:** ~90%
- **Field-level:** ~80–85%
- **Business-rule/data acceptance:** ~75–80%
- **Overall so với workbook:** ~85%

Kết luận kiến trúc: **Không cần thiết kế lại lớn.** Phần còn lại chủ yếu là field completeness, business rule, data acceptance, versioning, audit và backend consistency.

---

# 2. Sheet `menu chính`

Workbook yêu cầu các nhóm:

- Tổng quan
- Thông tin tòa nhà
- Thông tin KH
- Tài chính chung
- Kinh doanh
- Nhân sự
- Tài liệu
- Báo cáo
- Cổ đông
- Bảo trì/Bảo dưỡng

Live hiện gom lại theo domain:

```text
VẬN HÀNH
KINH DOANH
TÀI CHÍNH
NHÂN SỰ
```

và thêm:

```text
Zalo
Import
Cài đặt
```

## Đánh giá

**PASS về nghiệp vụ.**

Không coi việc không giữ nguyên 10 menu top-level là gap nghiêm trọng, vì chức năng đã được tổ chức lại hợp lý hơn.

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

## 3.1. Phòng trống

Nguồn yêu cầu:

```text
Trống ở luôn trong tháng
Trống hết tháng
Phòng đang chờ
```

Live đã có logic ba nhóm ở các lần audit trước. Lần audit mới không capture đủ toàn bộ vùng card nên cần QA lại dữ liệu hiển thị thực tế.

### Trạng thái

**PASS/PARTIAL — chức năng đã có, cần xác nhận dữ liệu.**

---

## 3.2. Doanh thu

Nguồn yêu cầu breakdown:

```text
Doanh thu tiền nhà
Doanh thu cọc mới
Doanh thu phá hợp đồng
```

Live đã từng hiển thị ba phần này trên Dashboard.

### Trạng thái

**PASS về design/coverage.**

Cần QA formula:

```text
Tổng DT = các component nào
```

để chắc số tổng không bị cộng sai hoặc trùng nguồn.

---

## 3.3. Tiến độ thu tiền

Source yêu cầu thay biểu đồ doanh thu/công nợ bằng tiến độ thu.

Live đã có:

```text
M5
M10
M15
```

và collection performance.

### Trạng thái

**PASS.**

---

## 3.4. Filter

Nguồn:

```text
Khu vực
Quản lý
Trưởng nhóm
```

Live có thêm:

```text
Kỳ
T/S/G
Tòa
Khu vực
Quản lý
Leader
```

### Trạng thái

**PASS / vượt source.**

---

# 4. Sheet `Khu nhà và toàn nhà`

## 4.1. Building

Source yêu cầu:

```text
Khu nhà + Tòa nhà
→ Tòa nhà
```

Live đã làm đúng.

### Trạng thái

**PASS.**

Live hiện có:

- mã tòa
- T/S/G
- địa chỉ
- khu vực
- tầng
- số phòng
- tình trạng
- quản lý
- lợi nhuận
- ngày nhận vận hành
- chủ nhà/HĐ

### Còn thiếu hoặc chưa verify

```text
Trưởng nhóm
NV vận hành
NV vệ sinh
NV kỹ thuật
ĐKKD
thời gian vận hành
```

### Trạng thái chung

**PARTIAL ở field-level nhân sự/pháp lý.**

---

## 4.2. Chủ nhà

Source yêu cầu:

```text
Thông tin cá nhân full theo HĐ
Giá thuê
Cọc
Thời gian giữ giá
Ngày hết HĐ
PCCC
Người nhập nguồn
Ghi chú
Ảnh sổ đỏ
```

Live đã có:

- Chủ nhà
- HĐ chủ nhà
- owner detail
- lịch trả
- truy vết
- tài liệu

### Còn phải xác nhận

- thời gian giữ giá
- PCCC
- người nhập nguồn
- sổ đỏ
- ghi chú
- version HĐ

### Trạng thái

**PARTIAL.**

Đây là gap về dữ liệu/detail, không phải thiếu module.

---

# 5. Sheet `Thông tin khách hàng`

## 5.1. Overview

Source yêu cầu:

```text
Mã phòng + mã tòa
Trưởng khu vực
NV vận hành
Công nợ
Zalo
Trạng thái
```

Live hiện đã có hầu hết các phần này.

### Trạng thái

**PASS cao.**

---

## 5.2. Customer detail

Source yêu cầu:

```text
Ngày bắt đầu
Ngày kết thúc
Thời hạn HĐ
Lần HĐ/gia hạn
Nghề nghiệp
Số xe
Biển số
```

Live đã có:

- HĐ/lưu trú
- start/end
- service & price
- history
- lifecycle

### Chưa xác nhận đầy đủ

- phương tiện
- biển số
- lần gia hạn
- tạm trú

### Trạng thái

**PARTIAL.**

---

## 5.3. Upload HĐ → tự cập nhật giá dịch vụ

Đây là requirement quan trọng nhất của sheet này:

```text
Upload hợp đồng
→ đọc giá dịch vụ của HĐ
→ cập nhật service price table
```

Live có `Dịch vụ & giá`, document/OCR-related flow đã xuất hiện ở một số lần audit.

Tuy nhiên chưa đủ bằng chứng để xác nhận backend đã tự động tạo đúng service-price snapshot.

### Trạng thái

**PARTIAL — P0 business rule.**

Flow production nên là:

```text
Upload
→ OCR
→ Review
→ Confirm
→ Service Price Snapshot
→ Effective Date
→ Contract Version
```

---

# 6. Sheet `Tài chính chung`

## 6.1. Hóa đơn

Source cần:

```text
Mã phòng+tòa
Quản lý
Cọc
Giá niêm yết
Giá thuê
Số tháng TT
Tổng phải thu
Đã thu
Công nợ
Ngày thu
Hạn
Trạng thái
```

Live Billing hiện đã có:

- invoice list
- invoice detail
- period
- service line
- meter
- print preview
- 4 template
- bank/account
- PDF/export

### Trạng thái

**PASS cao / vượt source.**

---

## 6.2. Công nợ

Source yêu cầu bỏ tên khách, ưu tiên mã phòng + mã tòa.

Live đang theo hướng room/building code.

### Gap nên bổ sung

```text
0–30
31–60
61–90
91–180
181+
```

### Trạng thái

- **Core: PASS**
- **Aging: chưa đủ bằng chứng / nên bổ sung**

---

## 6.3. Chi phí

Workbook định nghĩa taxonomy:

```text
Giá vốn
Giá gốc dịch vụ
Chi phí vận hành
Chi phí bán hàng/phát sinh
```

Live hiện đã có:

- cost report
- allocation
- T/S/G
- building level
- report mapping

### Trạng thái

**PASS cao.**

---

## 6.4. Hoàn cọc

Source yêu cầu:

```text
Mã phòng+tòa
Số tiền hoàn
Cọc
Khấu hao
Sửa chữa
Vệ sinh
Chi phí khác
```

Live đã có:

- Hoàn cọc
- tổng refund
- report breakdown

### Cần verify line-level

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

### Trạng thái

**PARTIAL / gần PASS.**

---

# 7. Sheet `KINH DOANH`

Live hiện đã có:

```text
Tổng quan hàng
Khách xem
Giao dịch chốt
Hoa hồng
```

---

## 7.1. Giao dịch chốt

Workbook yêu cầu:

```text
Ngày GD
Room/building
Manager
Phone
Deposit
Close price
Start billing
Term
Lead source
Payment status
Sale
Commission
Room status
Notes
```

Live có đúng module, nhưng chưa QA đủ toàn bộ field.

### Trạng thái

**~80% field coverage — PARTIAL.**

---

## 7.2. Khách xem

Live có module tương ứng.

### Trạng thái

**PASS coverage**, cần field-level QA.

---

## 7.3. Hoa hồng

Live có module Hoa hồng và thêm:

```text
Đối chiếu Excel T8
```

### Trạng thái

**PASS / vượt source.**

---

# 8. Sheet `BÁO CÁO`

Đây là phần khớp tốt nhất.

Live đã map gần hết source:

- Báo cáo Tổng
- Báo cáo Kinh doanh
- theo tòa
- chi phí
- dự kiến LN
- LN/vốn
- LN/tài sản
- hiệu suất
- lấp đầy
- thời gian trống
- âm dương điện nước
- sửa chữa/vệ sinh
- phân khúc KH
- đúng hạn/quá hạn
- conversion
- doanh số

Live còn có:

```text
UI-28 ... UI-46
Sẵn sàng
Nguồn dữ liệu
Kỳ dữ liệu
Web ↔ Excel
Formula
Export Excel
```

### Trạng thái

**~95% PASS.**

### Cần acceptance

1. formula backend đúng nguồn;
2. snapshot kỳ không bị thay đổi khi source data thay đổi;
3. dữ liệu các report có cùng freshness.

---

# 9. Sheet `NHÂN SỰ`

Source muốn:

```text
Thông tin cá nhân
Phòng ban
Chức vụ
Thâm niên
Tình trạng
Số tòa/phòng quản lý
```

và salary cho:

```text
Kinh doanh
Vận hành
Kỹ thuật
Thị trường
TC-KT
```

Live đã có:

- nhân viên
- tổ chức
- phân công
- payroll
- M5/M10/M15
- Excel compare
- tổng hợp người
- pending manual review

### Trạng thái

**PASS cao cho Operations payroll.**

### Gap

Chưa đủ bằng chứng cả 5 department đều có rule lương đầy đủ.

### Trạng thái chung

**PARTIAL overall ~80–85%.**

---

# 10. Sheet `TT CỔ ĐÔNG`

Workbook yêu cầu:

```text
Danh sách CĐ
% cổ phần từng nhà
Bảng chia cổ phần
Lịch đóng tiền
Thống kê tài sản
Thống kê cọc
Filter tòa + thời gian
```

Live có module Cổ đông và filter shareholder ở reports.

### Chưa đủ bằng chứng cho

- ownership version
- contribution schedule
- distribution
- asset/deposit stats
- audit

### Trạng thái

**PARTIAL ~60–70%.**

Đây vẫn là một trong ba vùng yếu nhất.

---

# 11. Sheet `BẢO TRÌ BẢO DƯỠNG`

Source:

```text
Thang máy
Máy bơm
Máy vệ sinh/giặt
Máy lọc nước
Kiểm kê
Décor
```

Live đã có:

- Tài sản & bảo trì
- Sổ sửa chữa
- inventory
- depreciation
- maintenance

### Gap

Chưa verify taxonomy có đúng đủ bốn loại lịch bảo dưỡng và décor.

### Trạng thái

**PARTIAL ~65–75%.**

---

# 12. Những điểm đáng chú ý từ audit mới

## 12.1. Báo cáo tháng 8

Live có trạng thái:

```text
Tháng 08/2026 chạy song song Excel
```

Điều này tốt cho migration/acceptance, nhưng cho thấy một số kỳ lịch sử chưa phải web-native 100%.

---

## 12.2. Payroll

Payroll vẫn có tính chất preview/song song Excel ở một số flow.

Production nên có:

```text
Payroll Run
→ version
→ lock
→ approval
→ payment
```

không chỉ preview.

---

## 12.3. Âm dương điện nước

Một số report data freshness chậm hơn report tài chính khác.

Cần đảm bảo pipeline điện/nước không lag kỳ.

---

# 13. Gap ưu tiên sau audit mới

## P0

1. **Contract upload → Service Price Snapshot**
2. **Invoice/report data phải web-native sau giai đoạn Excel parallel**
3. **Payroll version + lock + approval**

## P1

4. Owner full contract/legal fields
5. Customer vehicle / tạm trú / renewal fields
6. Refund line-level acceptance
7. Shareholder ownership/version/distribution
8. Maintenance schedule taxonomy
9. Sales field-level QA
10. Building staff assignment chi tiết

## P2

- audit timeline
- UI consistency
- permission negative test
- empty/error/loading
- responsive/mobile

---

# 14. So với audit trước

Audit mới không làm thay đổi kết luận kiến trúc.

Website vẫn ở trạng thái:

```text
Không cần thiết kế lại lớn
```

Phần còn lại chủ yếu là:

```text
field completeness
business rule
data acceptance
versioning
audit
backend consistency
```

chứ không còn là thiếu module lớn.

---

# 15. Kết luận cuối

TimoHouse V2 hiện đã bám khá sát workbook nguồn `nội dung làm web Timehouse 31.8.2026(2).xlsx`.

### Đánh giá cuối

- **Module coverage:** ~95%
- **UI/flow:** ~90%
- **Field-level:** ~80–85%
- **Business-rule/data acceptance:** ~75–80%
- **Overall so với workbook:** ~85%

Ba vùng cần ưu tiên nhất:

1. **Contract Service Price Snapshot**
2. **Shareholder**
3. **Data acceptance/lock của Billing + Payroll**

Từ giai đoạn này nên chuyển sang field-by-field acceptance:

```text
Sheet nguồn
→ Requirement
→ Route
→ UI field
→ API
→ DB field
→ Rule/Formula
→ Test case
→ Expected
→ Actual
→ PASS/FAIL
```

để chốt chính xác trước production.
