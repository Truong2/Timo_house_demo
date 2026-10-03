# TIMOHOUSE V2 — BÁO CÁO AUDIT UI/ACTION THEO DỮ LIỆU NGUỒN KHÁCH HÀNG

**Website được audit:** https://timohousev2.netlify.app/  
**Phiên bản báo cáo:** v4.0 — Live Re-audit + Source Traceability + Export/Template Acceptance  
**Ngày cập nhật:** 03/10/2026  
**Mục đích:** Đối chiếu bản web live với **dữ liệu gốc do khách hàng cung cấp**, không chỉ đối chiếu với mockup/spec tổng hợp.

> **Cập nhật v3:** Đã kiểm tra lại trực tiếp bản live bằng browser automation, tập trung vào **2 báo cáo Excel nguồn** và **template hóa đơn**. Kết quả mới cho thấy bản live đã có riêng **Báo cáo tổng (LN dòng tiền)**, **Báo cáo kinh doanh**, nút **Xuất Excel theo mẫu**, invoice detail gần khớp template nguồn, 4 template hóa đơn thường; nhưng **print preview đang lỗi render** và **chưa có template HÓA ĐƠN HOÀN CỌC**. Các kết luận cũ về Reports/Hóa đơn trong v2 được thay thế bởi các mục cập nhật ở cuối tài liệu.

> **Cập nhật v4 — live re-audit:** Đã mở lại toàn bộ website và đối chiếu trực tiếp với audit v3. Live hiện đã tiến xa hơn v3 ở nhiều phần: Import có full wizard, Documents có versioning/linkage/OCR, HR có phân công và bảng lương, Billing sâu hơn, hai báo cáo nguồn đã có riêng, và Hoàn cọc đã có flow/template tương ứng. Tuy nhiên **UI tồn tại chưa đồng nghĩa nghiệp vụ đã nghiệm thu 100%**: Excel export, formula/snapshot kỳ, PDF/template hóa đơn, M5/M10/M15 và một số lifecycle/action vẫn phải chạy fixture acceptance với dữ liệu nguồn. **Các kết luận v4 ở cuối tài liệu supersede các kết luận cũ nếu có mâu thuẫn.**

---

# 1. Kết luận điều hành

Bản v1 trước đó chủ yếu đánh giá **coverage UI/function** dựa trên bản live và tài liệu đặc tả đã tổng hợp.  
Bản v2 này cập nhật thêm việc đối chiếu trực tiếp với các workbook, hợp đồng mẫu và tài liệu nghiệp vụ thực tế của khách hàng.

## 1.1. Kết luận sau khi rà soát lại nguồn gốc

TimoHouse V2 hiện tại:

- **Bao phủ menu/module khá tốt** so với 10 nhóm nghiệp vụ gốc.
- Dashboard, Kinh doanh, Khách hàng, Tòa nhà, Tài sản/Bảo trì đã đi đúng hướng.
- Tuy nhiên, khi đối chiếu trực tiếp dữ liệu vận hành thật, có các module cần chi tiết hơn rất nhiều:
  - Hợp đồng thuê khách.
  - Dịch vụ / bảng giá theo hợp đồng.
  - Kỳ hóa đơn / hóa đơn / công nợ / thu tiền.
  - Hiệu suất và bảng lương.
  - Báo cáo quản trị.
  - Cổ đông / vốn / phân phối.
  - Hợp đồng đầu vào và lịch trả chủ nhà.
  - Mã hợp đồng điện/nước/mạng đầu vào.
- Một số route có mặt trên web nhưng **chưa đủ bằng chứng để xác nhận từng field/action đã khớp dữ liệu nguồn**.

## 1.2. Không dùng con số 82–86% làm điểm nghiệm thu

Con số ở bản báo cáo trước chỉ là đánh giá sơ bộ về coverage UI.

Sau khi đọc thêm dữ liệu nguồn, nên tách thành:

| Chỉ số | Đánh giá hiện tại |
|---|---:|
| Coverage menu/module | **~95%** |
| Coverage màn hình/flow chính | **~90–95%** |
| Field/action đã kiểm chứng trực tiếp | **~85–90%** |
| Logic/report/export acceptance | **~80–85%** |
| Mức sẵn sàng khóa UI final | **Gần đạt — còn fixture/acceptance trước production** |
| Mức sẵn sàng dùng làm baseline code | **Có thể dùng; chưa được coi là production-ready cho formula/export/PDF nếu chưa chạy fixture** |

> Đây không phải điểm nghiệm thu sản phẩm. Nhiều màn đã có route nhưng chưa kiểm tra đầy đủ field-level/state-level/action-level.

---

# 2. Thứ tự ưu tiên nguồn

Bản audit v2 sử dụng nguyên tắc:

1. **File gốc khách hàng cung cấp** — nguồn ưu tiên cao nhất.
2. **Dữ liệu vận hành thực tế** trong Excel.
3. **Hợp đồng thật/mẫu hợp đồng**.
4. **Tài liệu mô tả cách tính nghiệp vụ**.
5. **Spec/SRS/UI Mockup** — dùng để chuẩn hóa và giải thích solution.
6. **Bản live** — dùng để kiểm tra phần đã thể hiện trên UI.

Nếu spec khác với dữ liệu nguồn, báo cáo này ưu tiên đánh dấu theo dữ liệu nguồn và yêu cầu BA xác nhận thay vì tự sửa nghiệp vụ.

---

# 3. Danh sách nguồn đã đưa vào audit

| # | File | Vai trò trong audit |
|---:|---|---|
| 1 | `nội dung làm web Timehouse 31.8.2026(2).xlsx` | Nguồn mô tả menu, màn, field, filter, báo cáo khách hàng mong muốn |
| 2 | `bảng lương tháng 8.xlsx` | Dữ liệu hiệu suất và bảng lương vận hành thực tế |
| 3 | `BÁO CÁO KINH DOANH THÁNG 8.xlsx` | Dữ liệu báo cáo doanh thu, dịch vụ, giá vốn, chi phí và lợi nhuận |
| 4 | `CÁCH TÍNH LƯƠNG PHÒNG VẬN HÀNH.docx` | Công thức tính hiệu suất và lương/phòng |
| 5 | `Danh sách mã HĐ điện nước mạng.xlsx` | Mapping tòa với mã hợp đồng điện/nước/mạng và lịch sử chi phí đầu vào |
| 6 | `G1.31.8.26.xlsx` | Dữ liệu đầu tư, thu chi, báo cáo tòa G1, cổ phần/cổ đông |
| 7 | `Hoá đơn tiền nhà tháng 9 và dịch vụ tháng 9 năm 2026.xlsx` | Mẫu hóa đơn, dịch vụ, công nợ, thu tiền, khách mới, phá HĐ, hoàn cọc |
| 8 | `Hoa hồng năm 2025-2026 (1).xlsx` | Dữ liệu hoa hồng thực tế theo giao dịch |
| 9 | `Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc` | Hợp đồng Timehouse thuê tòa từ chủ nhà + phụ lục bàn giao tài sản |
| 10 | `Hop_dong_thue_phong_demo_day_du.pdf` | Hợp đồng khách thuê phòng + dịch vụ + chỉ số + tài sản + cọc |
| 11 | Tài liệu SRS/UI spec đã xây dựng trước đó | Chuẩn hóa UI/state/action và traceability |
| 12 | `https://timohousev2.netlify.app/` | Bản UI live được kiểm tra |

---

# 4. Nghiệp vụ gốc theo file "nội dung làm web"

Workbook gốc chia hệ thống thành 10 nhóm:

1. Tổng quan.
2. Thông tin tòa nhà.
3. Thông tin khách hàng.
4. Tài chính chung.
5. Kinh doanh.
6. Nhân sự.
7. Tài liệu.
8. Báo cáo.
9. Cổ đông.
10. Bảo trì / bảo dưỡng.

Bản web live hiện đã tổ chức lại theo domain, điều này **không phải lỗi** nếu vẫn giữ đầy đủ dữ liệu và flow nghiệp vụ.

---

# 5. Route map bản live

## 5.1. Tổng quan

| Nhóm | Menu | Route |
|---|---|---|
| Tổng quan | Tổng quan | `#/dashboard` |

## 5.2. Vận hành

| Menu | Route |
|---|---|
| Chủ nhà | `#/owners` |
| Tòa nhà | `#/buildings` |
| Khách hàng | `#/tenants` / customer view |
| Sổ sửa chữa | `#/maintenance-records` |
| Tài sản & bảo trì | `#/assets/maintenance` |
| Tài liệu | `#/documents` |

## 5.3. Kinh doanh

| Menu | Route |
|---|---|
| Tổng quan hàng | `#/listings/overview` |
| Khách xem | `#/visitors` |
| Giao dịch chốt | `#/deals` |
| Hoa hồng | `#/commissions` |

## 5.4. Tài chính

| Menu | Route |
|---|---|
| Hóa đơn & thu tiền | `#/billing` |
| Chi phí | `#/expenses` |
| Hoàn cọc | `#/refunds` |
| Cổ đông | `#/shareholders` |
| Báo cáo | `#/reports` |

## 5.5. Nhân sự / hệ thống

| Menu | Route |
|---|---|
| Nhân sự & lương | `#/hr` |
| Thông báo Zalo | `#/zalo` |
| Import dữ liệu | `#/import` |
| Cài đặt | `#/settings` |

---

# 6. Audit theo module và dữ liệu nguồn

---

## 6.1. Dashboard / Tổng quan

### Nguồn khách hàng yêu cầu

Sheet `Tổng quan` yêu cầu:

- Tổng số phòng trống chia:
  - Trống ở luôn trong tháng.
  - Trống hết tháng.
  - Đang chờ.
- Tổng doanh thu có breakdown:
  - Doanh thu tiền nhà.
  - Doanh thu cọc mới.
  - Doanh thu phá hợp đồng.
- Thay biểu đồ doanh thu/công nợ bằng **cập nhật tiến độ thu tiền**.
- Filter:
  - Khu vực.
  - Quản lý.
  - Trưởng nhóm.

### Bản live đã thấy

- Filter Kỳ.
- Loại nhà.
- Khu vực.
- Quản lý.
- Leader.
- KPI vận hành/tài chính.
- Tiến độ thu.
- Tòa cần chú ý.
- Việc cần xử lý.
- HĐ sắp hết.
- KPI có drill-down.

### Đánh giá

**MATCH CAO**

### Cần xác nhận thêm

- Dashboard đã tách đủ đúng 3 trạng thái phòng chưa.
- Breakdown doanh thu có đúng:
  - tiền nhà;
  - cọc mới;
  - phá HĐ.
- Drill-down có giữ cùng filter không.
- Export có dùng cùng scope/filter không.

### Severity

`MEDIUM`

---

## 6.2. Chủ nhà + Hợp đồng đầu vào

### Nguồn mô tả web

Khách hàng yêu cầu thông tin chủ nhà gồm:

- Full thông tin cá nhân theo hợp đồng thuê nhà.
- Giá thuê.
- Tiền cọc.
- Thời gian giữ giá.
- Ngày kết thúc HĐ.
- PCCC có/không.
- Người nhập nguồn.
- Ghi chú.
- Hình ảnh sổ đỏ.
- Theo dõi lịch đóng tiền.

### Nguồn hợp đồng thuê nhà

Hợp đồng nguồn còn cho thấy cần quản lý:

- Bên cho thuê.
- CCCD.
- Điện thoại.
- Địa chỉ.
- Tài sản cho thuê.
- Thời hạn.
- Giá thuê/tháng.
- Kỳ thanh toán.
- Tiền cọc.
- Gia hạn.
- Chấm dứt/thanh lý.
- PCCC.
- Hồ sơ/giấy tờ.
- Phụ lục bàn giao tài sản.
- Trách nhiệm sửa chữa/hư hỏng.

### Bản live

Đã có:

- Chủ nhà list/detail.
- Tòa liên kết.
- Hợp đồng.
- Thanh toán.
- Trong detail tòa có tab:
  - Chủ nhà & HĐ.
  - Lịch trả chủ nhà.
  - Tài sản.

### Gap cần xác nhận/sửa

- Sổ đỏ có upload/version không.
- PCCC có trạng thái/hạn/file không.
- Thời gian giữ giá.
- Lịch tăng giá nếu có.
- Tiền cọc chủ nhà.
- Kỳ trả theo HĐ.
- Người nhập nguồn.
- Phụ lục tài sản.
- Gia hạn/thanh lý HĐ nguồn.
- Chứng từ các lần trả tiền.
- Audit thay đổi.

### Kết luận

**Route/UI structure: MATCH**  
**Field-level: CHƯA XÁC NHẬN ĐỦ**

### Severity

`MAJOR`

---

## 6.3. Tòa nhà

### Nguồn khách hàng yêu cầu

- Địa chỉ.
- Diện tích.
- Số tầng.
- Số phòng.
- Tình trạng: cũ / trung bình / mới.
- Trưởng nhóm.
- NV vận hành.
- NV vệ sinh.
- NV kỹ thuật.
- Đã đăng ký kinh doanh hay chưa.
- Danh sách tài sản:
  - tài sản chủ nhà;
  - tài sản Timehouse đầu tư.
- Hiệu suất.
- Lợi nhuận.
- Thời gian vận hành.
- Lịch đóng tiền.

### Nguồn thực tế khác

`Danh sách mã HĐ điện nước mạng.xlsx` chứng minh tòa còn cần mapping với:

- Mã hợp đồng điện.
- Chủ hợp đồng điện.
- Mã/hóa đơn nước.
- Chủ hợp đồng nước.
- Mã mạng.
- Chủ hợp đồng mạng.
- Lịch sử số tiền theo tháng.

### Bản live

Tabs đã thấy:

- Tổng quan.
- Phòng.
- Chủ nhà & HĐ.
- Lịch trả chủ nhà.
- Nhân sự.
- Dịch vụ đầu vào.
- Tài sản.

### Gap rõ

Nên kiểm tra/bổ sung trực tiếp trong detail:

- Mã hợp đồng điện.
- Mã hợp đồng nước.
- Mã hợp đồng Internet.
- Chủ hợp đồng.
- Nhà cung cấp.
- Hiệu lực.
- Lịch sử hóa đơn đầu vào.
- PCCC.
- ĐKKD.
- Sổ đỏ.
- Thời gian vận hành.
- Hiệu suất.
- Lợi nhuận.
- Audit.

### Kết luận

**MATCH VỀ CẤU TRÚC, CHƯA ĐỦ FIELD TRACEABILITY**

### Severity

`MAJOR`

---

## 6.4. Phòng

### Dữ liệu thực tế chứng minh cần quản lý

Trong workbook hóa đơn:

- Tòa.
- Phòng.
- Quản lý.
- Giá niêm yết.
- Giá quản lý.
- Giá hiện tại.
- Cọc.
- Ngày ở.
- Ngày dịch vụ.
- Người ở.
- Nội thất.
- Điện/nước.
- Trạng thái hợp đồng.
- Khách mới.
- Khách trả phòng.
- Phòng phá HĐ.

### Cần có ở UI phòng

- Mã phòng = phòng + tòa.
- Giá niêm yết.
- Giá QL.
- Giá theo HĐ hiện tại.
- Trạng thái.
- Khách/HĐ hiện tại.
- Nội thất.
- Chỉ số.
- Tài sản.
- Lịch sử giá.
- Lịch sử khách.
- Sửa chữa/bảo trì liên quan.

### Bản live

Có tab Phòng trong tòa và action thêm phòng.

### Kết luận

**CÓ MODULE, CHƯA KIỂM CHỨNG ĐỦ DETAIL FIELD**

### Severity

`MEDIUM / MAJOR`

---

# 7. Khách hàng và lưu trú

## 7.1. Nguồn mô tả khách hàng

Sheet `Thông tin khách hàng` yêu cầu overview:

- Mã phòng + mã tòa.
- Trưởng khu vực.
- NV vận hành.
- Công nợ.
- Đã liên kết Zalo.
- Trạng thái:
  - đang thuê;
  - phá HĐ;
  - chuẩn bị hết HĐ trước 35 ngày;
  - hoàn cọc.

Detail khách cần:

- Mã phòng + mã tòa.
- Ngày bắt đầu HĐ.
- Ngày kết thúc.
- Thời hạn.
- Lần hợp đồng:
  - lần đầu;
  - gia hạn lần 2...
- Nghề nghiệp.
- Số lượng xe.
- Biển số.

## 7.2. Bản live đã kiểm tra

Live Customer là một trong các màn đầy đủ nhất:

- Filter theo kỳ, quản lý, tòa, vòng đời, phân loại, trạng thái thu.
- KPI tổng khách / đang ở / trả phòng / hết hạn / nợ lâu.
- Nhiều action:
  - ghi tiền;
  - trả phòng;
  - gia hạn;
  - kết thúc;
  - báo trả;
  - chuyển phòng;
  - in hóa đơn;
  - dịch vụ;
  - QR;
  - CCCD;
  - chốt kỳ.

## 7.3. Gap cần kiểm tra

Chưa đủ bằng chứng từ live audit để xác nhận có:

- Nghề nghiệp.
- Danh sách xe.
- Biển số xe.
- Zalo link/follow status.
- Lần/version HĐ.
- Người ở cùng.
- Tạm trú.
- Timeline lịch sử lưu trú.

### Kết luận

**MATCH CAO VỀ ACTION; FIELD DETAIL CẦN BỔ SUNG/VERIFY**

### Severity

`MEDIUM`

---

# 8. Hợp đồng thuê khách — GAP QUAN TRỌNG

## 8.1. Nguồn mô tả web

Khách hàng ghi rõ:

> “mục này sẽ tải hợp đồng lên và tự cập nhật bảng giá DV theo HĐ vì mỗi HĐ 1 loại giá dịch vụ.”

Danh sách dịch vụ:

- Điện.
- Nước.
- Mạng.
- Thang máy.
- Dịch vụ chung.
- Sạc xe điện.
- Gửi xe.

## 8.2. Hợp đồng phòng demo thực tế

Hợp đồng mẫu cho thấy cần dữ liệu:

- Người thuê.
- Phòng.
- Tài sản bàn giao.
- Ngày giao phòng.
- Ngày tính tiền.
- Thời hạn HĐ.
- Cơ chế gia hạn.
- Giá phòng.
- Số tiền trả trước.
- Tiền cọc.
- Chỉ số điện đầu kỳ.
- Chỉ số nước đầu kỳ.
- Giá Internet.
- Giá điện/kWh.
- Giá nước/người.
- Xe điện.
- Dịch vụ chung.
- Phương thức thanh toán.
- Ngày gửi thông báo.
- Hạn thanh toán.
- Chuyển nhượng phòng.
- Phí nhượng phòng.
- Điều kiện mất/hoàn cọc.

## 8.3. Gap trên live

Không có một module **Hợp đồng thuê** độc lập rõ ràng trong sidebar.

Nhiều action HĐ đang nằm trong Customer.

Điều này chưa phù hợp khi cần:

- quản lý hàng nghìn hợp đồng;
- lọc sắp hết;
- version gia hạn;
- giá dịch vụ theo HĐ;
- upload file;
- tra cứu theo tòa/phòng;
- audit.

## 8.4. Đề xuất bắt buộc

Thêm module:

```text
VẬN HÀNH
└─ Hợp đồng thuê
```

Tabs/view:

```text
Tất cả
Chờ ký
Hiệu lực
Sắp hết
Chờ quyết toán
Kết thúc
Phá HĐ
```

Detail:

```text
Tổng quan
Người thuê
Dịch vụ & giá
Cọc
Thanh toán
Công nợ
Điện nước
Bàn giao
Gia hạn
Tài liệu
Lịch sử
```

### Severity

`CRITICAL / MAJOR`

---

# 9. OCR / Upload hợp đồng / Data onboarding

Nguồn khách hàng yêu cầu upload HĐ và tự cập nhật bảng giá dịch vụ.

Đây không chỉ là upload file.

Hệ thống phải có cơ chế:

```text
Upload
→ đọc/nhập dữ liệu
→ rà soát
→ xác nhận giá
→ áp vào hợp đồng
```

Nếu có OCR:

```text
Upload
→ Processing
→ Review
→ Validate
→ Confirm
→ Commit
```

Nếu Phase 1 chưa có OCR:

```text
Upload HĐ
→ nhập tay dữ liệu đã trích
→ confirm
→ lưu snapshot bảng giá HĐ
```

### Bản live

Chưa kiểm chứng được flow hoàn chỉnh này.

### Severity

`MAJOR`

---

# 10. Hóa đơn — phải bám workbook vận hành thật

## 10.1. Workbook hóa đơn thực tế có field

Sheet `NHÀ T` có các field nghiệp vụ trực tiếp:

### Nhận diện

- Mã.
- Tòa.
- Phòng.
- Quản lý.
- Kỳ TT.

### Giá/cọc

- Cọc khách cũ.
- Giá niêm yết.
- Giá QL.
- Giá phòng hiện tại.
- Cọc.

### Thời gian/công nợ

- Ngày ở.
- Ngày DV.
- Nợ cũ.
- Thu khác.
- Số người.

### Điện

- Chỉ số cũ.
- Chỉ số mới.
- Sản lượng.
- Đơn giá.
- Thành tiền.

### Nước

- Chỉ số cũ.
- Chỉ số mới.
- Sản lượng.
- Đơn giá.
- Thành tiền.

### Dịch vụ

- Vệ sinh.
- Mạng.
- Thang máy.
- Xe điện.
- Máy giặt.
- Dịch vụ khác.
- Điện chung.

Mỗi dịch vụ có thể có:

- SL.
- Đơn giá.
- Thành tiền.

### Tổng hợp

- Tổng DV.
- Tổng cần đóng.
- Ghi chú hóa đơn.
- Tổng đã đóng.
- Tình trạng.
- Công nợ.

### Contract context

- Ngày vào ở.
- Thời hạn.
- Ngày hết hạn HĐ.
- Nội thất.

### Trả phòng/hoàn cọc

Workbook còn chứa:

- Closing electricity/water.
- Cọc.
- Nội dung/ngày chuyển khoản.
- Tiền nhà.
- Khấu hao.
- Vệ sinh.
- Sửa chữa.
- Điện vệ sinh chung.

## 10.2. Yêu cầu mô tả web

Hóa đơn phải có:

- mã phòng + tòa;
- quản lý;
- cọc;
- giá niêm yết;
- giá cho thuê;
- số tháng TT;
- tổng phải thu;
- đã thu;
- công nợ;
- ngày thu;
- hạn;
- trạng thái.

Filter:

- quản lý;
- trưởng khu vực;
- tòa;
- loại nhà T/S/G;
- trạng thái;
- hạn.

## 10.3. Bản live — cập nhật sau kiểm tra sâu

Đã kiểm tra trực tiếp invoice detail và print/preview.

Invoice detail đã có gần đủ template nguồn:

- HÓA ĐƠN THÁNG.
- Mã KH.
- Phòng số.
- Ngày chốt số liệu.
- Bảng STT / Nội dung / Chỉ số mới / Chỉ số cũ / Số lượng / Hệ số / Đơn giá / Thành tiền / Ghi chú.
- Tiền phòng, cọc, điện, nước, vệ sinh, Internet, thang máy, gửi xe, máy giặt, combo/DV khác, nợ cũ, điện chung, thu khác.
- Tổng thanh toán, số tiền bằng chữ, hạn thanh toán, nội dung chuyển khoản, tài khoản ngân hàng, lưu ý.

Bản live có 4 template hóa đơn thường:

```text
HĐ (VP)
HĐ (VP-HẰNG)
HĐ (TECH)
HĐ G1 (TECH)
```

### Gap còn lại

1. Trang print/preview có lỗi render: action/header hiển thị nhưng nội dung hóa đơn không render đầy đủ trong vùng in.
2. Chưa nghiệm thu việc đổi template có đổi đúng tài khoản/ngân hàng/chủ tài khoản/layout.
3. Flow/template **HÓA ĐƠN HOÀN CỌC** đã xuất hiện trên live, nhưng cần fixture để xác nhận từng dòng.
4. Chưa nghiệm thu PDF A4 trên cả 4 template hóa đơn thường.

### Kết luận

**Invoice detail: MATCH CAO.**  
**Print/PDF: PARTIAL — có Xem/In nhưng cần nghiệm thu 4 template + PDF A4.**  
**Refund invoice: PASS về flow hiện diện, PARTIAL về source-template acceptance.**

### Severity

`MAJOR` trước production.

---

# 11. Kỳ hóa đơn và điện nước

Dữ liệu nguồn cho thấy hóa đơn phụ thuộc mạnh vào:

- chỉ số điện;
- chỉ số nước;
- số người;
- ngày DV;
- đơn giá theo hợp đồng/tòa;
- điện chung;
- dịch vụ.

Do đó UI cần có bước preflight trước tạo hóa đơn:

- thiếu chỉ số;
- chỉ số bất thường;
- thiếu bảng giá;
- thiếu số người;
- HĐ hết hạn;
- hóa đơn đã tồn tại.

### Live — cập nhật v4

Re-audit cho thấy Billing đã bao phủ meter/input, kỳ hóa đơn, invoice và payment ở mức UI/flow. Còn cần verify period state/lock, preflight thiếu chỉ số/bảng giá và chống tạo trùng hóa đơn.

### Đề xuất

Trong `Hóa đơn & thu tiền`:

```text
Kỳ hóa đơn
Hóa đơn
Thu tiền
Công nợ
```

### Severity

`MAJOR`

---

# 12. Công nợ và thu tiền

## 12.1. Nguồn web

Khách hàng yêu cầu Công nợ:

- bỏ tên khách;
- dùng mã phòng + mã tòa.

Workbook hóa đơn cũng có:

- Tổng cần đóng.
- Tổng đã đóng.
- Công nợ.
- Ngày thu/chuyển khoản.
- Trạng thái.

`DS phòng phá hđ` còn theo dõi:

- mã phòng;
- quản lý;
- ngày vào;
- số tháng ở;
- lý do phá HĐ;
- SĐT;
- tổng phải thu;
- tổng đã thu.

## 12.2. Live

Công nợ đang được thể hiện ở nhiều nơi, nhưng chưa có view finance rõ theo các chiều dữ liệu.

### Nên có view

- Theo phòng.
- Theo tòa.
- Theo quản lý.
- Theo tuổi nợ.
- Phá HĐ.
- Theo kỳ.
- Theo trạng thái thu.

### Severity

`MAJOR`

---

# 13. Hoàn cọc

## 13.1. Nguồn mô tả web

Danh sách hoàn cọc cần:

- Mã phòng + tòa.
- Số tiền hoàn cọc.
- Tiền cọc.
- Khấu hao.
- Sửa chữa.
- Vệ sinh.
- Chi phí khác.

Filter:

- thời gian;
- tòa;
- khu vực;
- NV vận hành;
- trưởng khu vực.

## 13.2. Nguồn hóa đơn thực tế

Workbook còn có:

- Closing meter.
- Tiền nhà.
- Cọc.
- Khấu hao.
- Vệ sinh.
- Sửa chữa.
- Chứng từ/chuyển khoản.

## 13.3. Live

Có module Hoàn cọc:

- Đang xử lý.
- Hoàn thành.
- Từ chối.

### Kết luận

**PASS về coverage UI/flow; PARTIAL về source-template acceptance.**

Nguồn có riêng `HÓA ĐƠN HOÀN CỌC` với các dòng tiền phòng cọc, tiền phòng, điện, nước, dịch vụ, khấu hao, sửa chữa, dọn vệ sinh, sơn phòng và tổng tiền hoàn cọc.

Re-audit cho thấy flow/template hoàn cọc đã xuất hiện trên live. Cần fixture để xác nhận từng dòng và công thức khấu trừ khớp workbook nguồn.

### Severity

`MAJOR`

---

# 14. Chi phí / giá vốn

## 14.1. Nguồn mô tả web

### Giá vốn

- Tiền thuê nhà.
- Mua sắm thiết bị.
- Điện.
- Nước.
- Mạng.
- Rác.
- Môi trường.
- Bảo trì thang máy.

### Chi phí vận hành

- Lương quản lý.
- Lương quản lý tổng.
- Lương trưởng phòng VH.
- Lương phó phòng VH.
- Lương nguồn.
- Lương NVKD.
- Lương vệ sinh.
- Lương kế toán.
- Lương sửa chữa.
- Lương bảo vệ.
- Thuê và DV văn phòng.

### Chi phí bán hàng/phát sinh

- Marketing.
- Sửa chữa/thay thế/bảo trì.
- Chi phí khác.

## 14.2. Báo cáo kinh doanh tháng 8 xác nhận cấu trúc này

Dữ liệu thực tế có:

- Tổng doanh thu.
- Cọc phòng mới.
- Cọc bỏ.
- Hoàn cọc.
- Phòng mới/phá/trống.
- Doanh thu tiền phòng.
- Doanh thu từng dịch vụ.
- Tiền thuê.
- Mua sắm thiết bị.
- Giá gốc dịch vụ.
- Lương vận hành.

### Live

Có module Chi phí.

### Cần verify

- Category có bám đúng taxonomy trên.
- Có filter tòa/thời gian/khu vực/quản lý.
- Có mapping vào báo cáo lợi nhuận.
- Có file chứng từ.
- Có phân bổ.

### Severity

`MAJOR`

---

# 15. Kinh doanh

## 15.1. Tổng quan hàng

Nguồn yêu cầu:

- filter khu vực;
- trưởng nhóm KD;
- NVKD;
- số phòng đã chốt;
- số phòng đã nhận;
- phòng phát sinh hoàn cọc/phát HĐ.

Live có `Tổng quan hàng`.

**MATCH CAO**

---

## 15.2. Giao dịch chốt / doanh số

Nguồn yêu cầu:

- STT.
- Ngày giao dịch.
- Mã phòng+tòa.
- Quản lý.
- SĐT.
- Tiền cọc.
- Giá chốt.
- Ngày tính tiền.
- Thời hạn HĐ.
- Công cụ/nguồn phát sinh khách.
- Tình trạng thu đủ/thiếu.
- Sale.
- Hoa hồng.
- Loại phòng chốt:
  - ở luôn;
  - cuối tháng;
  - đang chờ.
- Ghi chú.

Live có `Giao dịch chốt`.

Cần verify field-by-field.

---

## 15.3. Khách xem

Nguồn yêu cầu:

- Sale.
- Mã tòa/phòng.
- Nguồn:
  - sale nội bộ;
  - đối tác.
- Tình trạng:
  - đã xem;
  - chốt.
- Khu vực.
- SĐT.
- Ngày bắn khách.

Live có `Khách xem`.

Cần verify field-by-field.

---

# 16. Hoa hồng

## 16.1. Nguồn mô tả web

- Mã phòng+tòa.
- Giá chốt.
- Thời hạn HĐ.
- Mức hoa hồng.
- Thành tiền.
- Tổng nhận.
- Team.
- Đã TT/chưa TT.

## 16.2. Workbook hoa hồng thực tế bổ sung

Dữ liệu thực tế có:

- Tình trạng thanh toán.
- Quản lý.
- Phòng.
- Tòa.
- Giá chốt.
- Thời hạn HĐ.
- Mức HH.
- Thành tiền.
- Tổng nhận.
- Chú thích.
- Team.
- Ngày thanh toán.
- STK thanh toán.
- SĐT khách.

Dữ liệu còn cho thấy nhiều case:

- `BỎ CỌC`.
- `TRÙNG`.
- tỷ lệ khác nhau:
  - 25%;
  - 35%;
  - 50%;
  - 65%;
- một nhóm có thể nhận tổng từ nhiều dòng.

## 16.3. Live

Có:

```text
Hoa hồng theo giao dịch
Chính sách tỷ lệ
Nhân sự sale
```

### Kết luận

**MATCH VỀ STRUCTURE**

Cần verify:

- multiple installments;
- ngoại lệ bỏ cọc;
- tổng nhận;
- tình trạng chi;
- ngày chi;
- team;
- ghi chú;
- export.

### Severity

`MEDIUM`

---

# 17. Nhân sự

## 17.1. Nguồn mô tả web

Nhân sự cần:

- Thông tin cá nhân.
- Phòng ban.
- Chức vụ.
- Thâm niên.
- Tình trạng.
- Riêng vận hành:
  - số tòa đang quản lý;
  - số phòng đang quản lý.

Các nhóm cần tính lương:

- Kinh doanh.
- Vận hành.
- Kỹ thuật.
- Thị trường.
- TC-KT.

## 17.2. Live — cập nhật v4

Re-audit live cho thấy HR đã có:

```text
Cơ cấu tổ chức
Nhân viên
Phân công
Bảng lương
Dữ liệu/flow chi lương
```

### Gap còn lại

- xác nhận collection performance có đúng M5/M10/M15;
- compare với workbook lương tháng 8;
- trace DT phải thu → M1/M2/M3 → hiệu suất → lương/phòng → thực nhận;
- kiểm tra lock/audit của salary payment.

### Severity

`MEDIUM / MAJOR`

---

# 18. Hiệu suất và bảng lương — PHẢI BÁM FILE THỰC TẾ

## 18.1. Workbook bảng lương tháng 8

Các cột thực tế:

- Họ tên.
- Chức vụ.
- Lương cơ bản.
- Phụ cấp ăn trưa.
- Phụ cấp xăng xe.
- Lương trưởng nhóm.
- Lương hỗ trợ.
- Mã tòa.
- Số phòng.
- DT niêm yết.
- DT phải thu.
- DT mốc 1.
- DT mốc 2.
- DT mốc 3.
- Tổng DT sau 3 mốc.
- Dịch vụ.
- Tỷ lệ DV/DT.
- DT thu thêm.
- Tổng DT thu được.
- Hiệu suất %.
- Mức lương/phòng.
- Tổng.
- Thực nhận.

## 18.2. Công thức từ tài liệu cách tính lương

### Mốc thu

- Mốc 1: đến ngày 5 — 100%.
- Mốc 2: phần tăng từ m5 đến m10 — 90%.
- Mốc 3: phần tăng từ m10 đến ngày 15 — 70%.

### Tổng sau 3 mốc

```text
A = M1 + M2 + M3
```

### Tỷ lệ dịch vụ

```text
B = Dịch vụ phải thu / DT phải thu
```

### Doanh thu thu thêm

Bao gồm:

- tiền nhà phòng phát sinh trong tháng nếu đã thu đủ;
- khoản khách bỏ cọc.

### Tổng doanh thu tiền phòng thu được

```text
C = A - A×B + doanh thu thu thêm
```

### Hiệu suất

```text
Hiệu suất = C / Giá niêm yết × 100
```

### Lương tòa

```text
Mức lương/phòng = HS × mức tham chiếu / ngưỡng tham chiếu
Lương tòa = mức lương/phòng × số phòng
```

## 18.3. UI bắt buộc

`Hiệu suất` phải drill-down được đến:

```text
NV
→ Tòa
→ Số phòng
→ DT niêm yết
→ DT phải thu
→ M1
→ M2
→ M3
→ Dịch vụ
→ Thu thêm
→ Tổng thu
→ HS
→ Bậc lương/phòng
→ Tổng lương
```

### Live — cập nhật v4

Đã có payroll và assignment trên live. Riêng phần **collection performance M5/M10/M15** vẫn cần fixture/formula acceptance.

### Severity

`MAJOR`

---

# 19. Báo cáo kinh doanh

## 19.1. Workbook thực tế

`BÁO CÁO KINH DOANH THÁNG 8.xlsx` có cấu trúc theo:

- Tổng.
- Nhà T.
- Nhà S.
- Nhà G.

Metric thực tế gồm:

### Doanh thu

- Tổng doanh thu.
- Cọc phòng mới.
- Cọc khách bỏ.
- Hoàn cọc.
- Tổng phòng phá HĐ.
- Tổng phòng mới.
- Tổng phòng trống.
- Doanh thu tiền phòng.

### Dịch vụ

- Điện.
- Nước.
- Vệ sinh.
- Mạng.
- Xe điện.
- Thang máy.
- Máy giặt.
- Tổng dịch vụ.

### Giá vốn

- Tiền thuê nhà.
- Mua thêm thiết bị.
- Điện đầu vào.
- Nước đầu vào.
- Mạng.
- Rác.
- Môi trường.
- Bảo trì thang máy.

### Chi phí vận hành

- Lương và nhiều nhóm vận hành khác.

Đây là bằng chứng rõ rằng Report UI không thể chỉ có 3 dashboard cơ bản.

---

# 20. Danh mục báo cáo yêu cầu

Sheet `BÁO CÁO` yêu cầu ít nhất:

1. Hiệu suất thực tế.
2. Hiệu suất tạm tính.
3. Doanh thu tổng.
4. Lợi nhuận dòng tiền.
5. Lợi nhuận kinh doanh thực thu.
6. Báo cáo kinh doanh không gồm một số khoản.
7. Dự kiến lợi nhuận dòng tiền.
8. Dự kiến lợi nhuận kinh doanh.
9. Lợi nhuận/vốn.
10. Lợi nhuận/tài sản.
11. Biên lợi nhuận tiền nhà.
12. Chi phí giá vốn.
13. Chi phí cố định.
14. Chi phí phát sinh.
15. Tỷ lệ lấp đầy.
16. Thời gian trống.
17. Âm/dương điện nước.
18. Chi phí sửa chữa/vệ sinh.
19. Phân khúc khách.
20. Tỷ lệ đóng tiền đúng hạn/quá hạn.
21. Báo cáo khách hàng.
22. Tỷ lệ chuyển đổi khách xem/khách chốt.
23. Doanh số.

Filter báo cáo gồm nhiều chiều:

- thời gian;
- tòa;
- khu vực;
- NV vận hành;
- trưởng khu vực;
- T/S/G;
- cổ đông;
- sale;
- team sale.

## Live — cập nhật sau kiểm tra lại

Bản live hiện đã có riêng:

```text
Báo cáo tổng (LN dòng tiền)
Báo cáo kinh doanh
```

Cả hai đã có filter Kỳ, Cách tính, Khu vực, Quản lý, Tòa; cột `TỔNG / NHÀ T / NHÀ S / NHÀ G`; các nhóm doanh thu, dịch vụ, giá vốn, chi phí, lợi nhuận, tỷ lệ và nút **Xuất Excel theo mẫu**.

Báo cáo Tổng còn có bridge đối chiếu sang LNR Báo cáo Kinh doanh.

### Kết luận cập nhật

**Hai báo cáo Excel trọng yếu đã có cấu trúc UI đủ để triển khai.**

Chưa được phép coi là “giống nguồn 100%” cho đến khi hoàn thành:

1. Report Definition Matrix.
2. Mapping từng metric.
3. Formula/version lock.
4. Export template acceptance test.
5. So sánh file export với workbook nguồn theo row/cell/value/style.

Các báo cáo quản trị khác vẫn có thể mở rộng theo Report Center sau.

### Severity

`MAJOR` cho formula/export acceptance; không còn `CRITICAL` về coverage hai báo cáo nguồn chính.

---

# 21. Cổ đông / vốn / lợi nhuận

## 21.1. Nguồn mô tả web

- Danh sách cổ đông.
- Tỷ lệ cổ phần từng nhà.
- Bảng chia cổ phần.
- Lịch đóng tiền từng người.
- Thống kê tài sản.
- Thống kê tiền cọc.
- Filter nhà + thời gian.

## 21.2. Dữ liệu G1 thực tế

Sheet `BÁO CÁO THÁNG 8` có:

- Cổ đông.
- Tỷ lệ %.
- Vốn.
- Lợi nhuận gộp.
- Lợi nhuận ròng.
- LN ròng / giá vốn.
- Chi phí / LN gộp.
- Tổng nhận.

`ĐẦU TƯ BAN ĐẦU` có chi tiết đầu tư:

- máy bơm;
- điều hòa;
- thạch cao;
- tủ lạnh;
- rèm;
- tủ bếp;
- máy giặt;
- giường/tủ;
- các khoản đầu tư khác.

## 21.3. Live

Có module Cổ đông.

### Chưa đủ bằng chứng để xác nhận

- Version tỷ lệ cổ phần.
- Tổng % = 100.
- Nghĩa vụ góp.
- Ghi nhận đã góp.
- Asset contribution.
- Capital ledger.
- Lợi nhuận theo tòa.
- Phân phối.
- Lịch sử.

### Severity

`MAJOR`

---

# 22. Tài sản / đầu tư

Nguồn từ:

- Hợp đồng thuê nhà.
- G1.
- Hóa đơn.
- Bảo trì.

Cho thấy cần phân biệt:

```text
Tài sản chủ nhà
Tài sản Timehouse đầu tư
Tài sản phòng
Tài sản chung
```

Field nên có:

- tên;
- loại;
- tòa/phòng;
- số lượng;
- tình trạng;
- nguyên giá;
- ngày đưa vào dùng;
- nguồn chi phí;
- ownership;
- bảo trì;
- file/ảnh;
- lịch sử.

Live có `Tài sản & bảo trì`.

### Kết luận

**MATCH VỀ MODULE**

Cần verify ownership + financial attributes.

### Severity

`MEDIUM`

---

# 23. Bảo trì / bảo dưỡng

Nguồn khách hàng ghi rõ:

- Bảo dưỡng thang máy.
- Máy bơm.
- Máy vệ sinh/giặt.
- Máy lọc nước.
- Kiểm kê tài sản.
- Đồ décor.

Live có:

- Sổ sửa chữa.
- Tài sản & bảo trì.
- Bảo dưỡng.
- Kiểm kê.

### Kết luận

**MATCH CAO**

### Cần đảm bảo

- lịch định kỳ;
- ngày gần nhất;
- ngày kế tiếp;
- trạng thái;
- người xử lý;
- chi phí;
- tài sản;
- ảnh/file;
- lịch sử.

### Severity

`LOW / MEDIUM`

---

# 24. Tài liệu

Nguồn gốc có nhiều loại tài liệu:

- Hợp đồng khách.
- Hợp đồng chủ nhà.
- CCCD.
- Sổ đỏ.
- PCCC.
- Phụ lục.
- Bàn giao.
- Chứng từ thanh toán.
- Ảnh tài sản.

Live có module Tài liệu.

### Yêu cầu quan trọng

Không nên là file repository độc lập.

Mỗi file cần liên kết entity:

```text
Owner
Building
Room
Tenant
Contract
Invoice
Expense
Asset
Maintenance
Refund
```

### Severity

`MEDIUM`

---

# 25. Zalo

Nguồn web yêu cầu biết khách đã liên kết Zalo hay chưa.

Live có `Thông báo Zalo`.

Đây là phần solution mở rộng hợp lý.

### Cần liên kết nghiệp vụ

```text
Khách
Hóa đơn
Công nợ
Lịch sử gửi
Retry
Provider status
```

Không dùng trạng thái “gửi thành công” để suy ra “đã thanh toán”.

---

# 26. Import

Live có Import data.

Đây là solution cần thiết vì dữ liệu nguồn đang nằm trong nhiều workbook.

Flow nên là:

```text
Upload
→ Map
→ Validate
→ Preview
→ Commit
```

Bắt buộc:

- lỗi theo dòng;
- dò trùng;
- audit batch;
- file lỗi;
- idempotent;
- retry không tạo trùng.

---

# 27. Settings / phân quyền / audit

Live có các tab:

- Tài khoản.
- Vai trò & quyền.
- Danh mục.
- TK nhận tiền & mẫu in.
- Tham số giả định.
- Kỳ & khóa kỳ.
- Nhật ký.
- Đối chiếu nghiệm thu.
- Hệ thống demo.

Đây là phần **solution**, không phải tất cả đều được Excel gốc yêu cầu trực tiếp.

Tuy nhiên chúng cần thiết để hệ thống production vận hành an toàn.

---

# 28. Ma trận traceability tổng hợp

| Module | Nguồn gốc | Live | Kết luận |
|---|---|---|---|
| Dashboard | Workbook mô tả + invoice | Có | 🟢 Khá khớp |
| Chủ nhà | Mô tả web + HĐ nguồn | Có | 🟠 Cần bổ sung field/document |
| HĐ nguồn | HĐ thuê nhà + mô tả web | Nằm trong Owner/Building | 🟠 Cần flow/version rõ |
| Tòa nhà | Mô tả + utility workbook | Có | 🟠 Thiếu traceability điện/nước/mạng |
| Phòng | Invoice + contract | Có trong Building | 🟠 Cần verify detail |
| Khách | Mô tả + tenant contract | Có | 🟢 Action tốt |
| HĐ thuê khách | Tenant contract + mô tả | Có flow/detail lưu trú-hợp đồng | 🟢/🟠 — verify lifecycle + snapshot |
| OCR/Upload HĐ | Mô tả web | Có Rà soát OCR | 🟢/🟠 — verify apply/commit dữ liệu |
| Điện nước | Invoice + utility code | Có trong Billing/contract/building flow | 🟢/🟠 — verify preflight/lock |
| Kỳ hóa đơn | Invoice workflow | Có trong Billing flow | 🟢/🟠 — verify state/lock |
| Hóa đơn | Invoice workbook | Có, detail đã audit sâu | 🟢/🟠 — data/layout tốt, print còn lỗi |
| Thu tiền | Invoice/payment data | Có chung Billing | 🟠 |
| Công nợ | Invoice + phá HĐ | Có rải rác | 🔴/🟠 |
| Hoàn cọc | Mô tả + invoice | Có flow/template tương ứng | 🟢/🟠 — cần fixture acceptance |
| Chi phí | Mô tả + BC kinh doanh | Có | 🟠 |
| Kinh doanh | Mô tả + BC | Có | 🟢 |
| Khách xem | Mô tả | Có | 🟢/🟠 |
| Giao dịch chốt | Mô tả | Có | 🟢/🟠 |
| Hoa hồng | Workbook hoa hồng | Có | 🟢/🟠 |
| Nhân sự | Mô tả | Có org/employees/assignments/payroll | 🟢 |
| Hiệu suất | Payroll + công thức | Có payroll; performance chưa nghiệm thu | 🟠 — M5/M10/M15 |
| Bảng lương | Payroll | Có | 🟢/🟠 — compare workbook tháng 8 |
| Chi lương | Payroll | Có dữ liệu/payment flow | 🟢/🟠 — verify lock/audit |
| Cổ đông | Mô tả + G1 | Có | 🟠 |
| Tài sản | G1 + contract | Có | 🟢/🟠 |
| Bảo trì | Mô tả | Có | 🟢 |
| Báo cáo | Mô tả + BC thực tế | Có Báo cáo Tổng + Báo cáo Kinh doanh + export | 🟢/🟠 — còn formula/export acceptance |
| Tài liệu | HĐ/file nguồn | Có versioning + entity linkage + OCR | 🟢 PASS |
| Zalo | Mô tả KH + solution | Có | 🟢/🟠 |
| Import | Nhu cầu chuyển Excel | Có full Upload→Map→Validate→Preview→Commit | 🟢 PASS |
| Settings/Audit | Solution | Có | 🟢 |

---

# 29. Priority sau live re-audit v4

## P0 — Bắt buộc trước production acceptance

1. **Report fixture + Excel export acceptance**: Báo cáo Tổng và Báo cáo Kinh doanh tháng 8/2026, compare row/cell/value/style, khóa formula/version/snapshot.
2. **Invoice print/PDF acceptance**: test đủ 4 template, bank/account/layout, A4, PDF.
3. **Payroll M5/M10/M15 acceptance**: compare bảng lương tháng 8 và trace DT phải thu → M1/M2/M3 → hiệu suất → lương/phòng → thực nhận.

## P1 — Major

1. Hợp đồng lifecycle + service snapshot/version.
2. Công nợ aging 31+/61+/91+/181+ và HĐ kết thúc/phá HĐ.
3. Building staff assignment + lịch trả chủ nhà/chứng từ.
4. Hoàn cọc fixture acceptance.
5. Shareholder capital/version/distribution/audit.

## P2 — Polish

- audit timeline;
- action grouping;
- empty/loading/error consistency;
- field-level Sales/Commission;
- accessibility/responsive regression.

---

# 30. Đề xuất sidebar sau khi hoàn thiện

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
│  ├─ Điện nước
│  ├─ Kỳ hóa đơn
│  ├─ Hóa đơn
│  ├─ Thu tiền
│  └─ Công nợ
├─ Chi phí
├─ Hoàn cọc
├─ Cổ đông
└─ Báo cáo

NHÂN SỰ
└─ Nhân sự & lương
   ├─ Cơ cấu
   ├─ Nhân viên
   ├─ Phân công tòa
   ├─ Hiệu suất
   ├─ Bảng lương
   └─ Chi lương

THÔNG BÁO
└─ Zalo

HỆ THỐNG
├─ Import
└─ Cài đặt
```

---

# 31. Checklist nghiệm thu UI trước khi khóa design

Mỗi list phải kiểm tra:

- Search.
- Filter.
- Sort.
- Pagination.
- Export.
- Selected/bulk action nếu cần.
- Empty.
- Loading.
- Error.
- Permission.
- Preserve state khi Back.

Mỗi detail:

- Status.
- Scope/owner.
- Related entities.
- Documents.
- Audit.
- Timeline.
- Action đúng state.

Mỗi action tiền:

- Confirm.
- Lý do khi nhạy cảm.
- Không double submit.
- Audit before/after.
- Không sửa trực tiếp chứng từ đã khóa/phát hành.

---

# 32. Những gì chưa được phép kết luận

Sau re-audit v4, **không nên đánh dấu DONE/100%** cho các phần sau nếu chưa chạy fixture/acceptance:

- Excel export Báo cáo Tổng;
- Excel export Báo cáo Kinh doanh;
- formula/snapshot backend;
- PDF/invoice của cả 4 template;
- hoàn cọc theo case thực tế;
- payroll M5/M10/M15;
- công nợ aging;
- lifecycle chuyển phòng/gia hạn/kết thúc;
- shareholder distribution;
- building payment schedule.

Có màn hình hoặc nút thao tác **không đồng nghĩa** logic/số liệu/output đã đúng.

---

# 33. Kết luận cuối

Sau live re-audit v4:

- UI/flow coverage ở mức **~90–95%**.
- Không cần redesign lớn sidebar/architecture.
- Import, Documents, OCR, HR assignment/payroll và Billing đã tiến bộ hơn audit v3.
- Hai báo cáo nguồn chính đã có màn riêng.
- Invoice detail đã khớp cao với template nguồn.

Phần còn lại chủ yếu là **acceptance logic/output**, không phải thiếu màn hình lớn:

1. Excel export A/B.
2. Formula + snapshot report.
3. PDF/invoice template.
4. Refund fixture.
5. M5/M10/M15 payroll.
6. Receivables aging.
7. Lifecycle/audit.
8. Shareholder/building financial traceability.

Chỉ sau khi các fixture trên pass mới nên gọi là **production-ready / source-matched**.

---

# 34. CẬP NHẬT LIVE V3 — KẾT LUẬN THAY THẾ CHO REPORTS/HÓA ĐƠN V2

Phần này **supersede** các kết luận cũ của v2 nếu có mâu thuẫn.

## 34.1. Hai báo cáo nguồn đã có trên live

- **Báo cáo tổng (LN dòng tiền)**.
- **Báo cáo kinh doanh**.

Đã thấy trực tiếp:

- Kỳ.
- Cách tính.
- Khu vực.
- Quản lý.
- Tòa.
- Xóa bộ lọc.
- Cột `TỔNG / NHÀ T / NHÀ S / NHÀ G`.
- Revenue / service / cost / profit.
- Các tỷ lệ.
- Nút `Xuất Excel theo mẫu`.

Do đó gap hiện nay không còn là “thiếu 2 report”, mà là **khóa công thức và nghiệm thu export**.

---

# 35. REPORT A/B DEFINITION MATRIX — BẮT BUỘC

Hai report phải là hai definition độc lập:

```text
REPORT_TOTAL_CASHFLOW
REPORT_BUSINESS
```

Không được implement bằng một query rồi đổi title.

## 35.1. Matrix tối thiểu cần khóa

| Metric | Báo cáo Tổng | Báo cáo Kinh doanh | Nguồn | Acceptance |
|---|---|---|---|---|
| Tổng doanh thu | Include | Include theo rule KD | Invoice/receipt | Trace được nguồn |
| Cọc phòng mới | Include | Exclude khỏi DT KD nếu bám workbook | Deposit | Không hard-code |
| Cọc khách bỏ | Theo source | Theo rule BA khóa | Deposit/contract | Fixture kiểm chứng |
| Hoàn cọc | Theo dòng tiền | Theo rule BA khóa | Refund | Fixture kiểm chứng |
| Tổng phòng phá HĐ | Count | Count | Contract | Snapshot kỳ |
| Tổng phòng mới | Count | Count | Contract | Snapshot kỳ |
| Tổng phòng trống | Count | Count | Room state | Snapshot kỳ |
| Doanh thu tiền phòng | Include | Include | Invoice | Drill-down |
| Điện/Nước/Vệ sinh/Mạng/Xe điện/Thang máy/Máy giặt | Include | Include | Invoice service | Service code mapping |
| Tiền thuê nhà | Include | Include | Head lease cost | Snapshot kỳ |
| Mua sắm thiết bị | Include dòng tiền | Exclude khỏi BCKD nếu bám workbook | Expense/Asset | Explicit rule |
| Giá gốc DV | Include | Include | Utility expense | Category mapping |
| Lương | Include | Include | Payroll | Không nhập tay vào report |
| Marketing/Sửa chữa/Chi phí khác | Include | Include | Expense | Category mapping |
| Giá vốn | Formula | Formula | Derived | Versioned |
| CPBH | Formula | Formula | Derived | Versioned |
| Tổng chi phí | Formula | Formula | Derived | Versioned |
| Lợi nhuận gộp | Formula | Formula | Derived | Versioned |
| Lợi nhuận ròng | Formula | Formula | Derived | Versioned |
| Ratios | Formula | Formula | Derived | Tính từ raw value |

> Các rule chưa được file nguồn mô tả rõ phải BA xác nhận bằng workbook fixture; BE không tự suy diễn.

## 35.2. Reconciliation bắt buộc

Hệ thống phải giải thích được bridge:

```text
LNR Báo cáo Tổng
± Cọc mới
± Hoàn cọc
± Mua sắm thiết bị
± Các adjustment đã được BA khóa
= LNR Báo cáo Kinh doanh
```

Mỗi adjustment phải drill-down về record nguồn.

---

# 36. EXCEL EXPORT ACCEPTANCE CRITERIA — BẮT BUỘC

Nút `Xuất Excel theo mẫu` chỉ được đánh dấu DONE khi qua các tiêu chí sau.

## 36.1. Data acceptance

Với cùng kỳ và scope:

```text
Web value = Exported Excel value = Expected source value
```

Sai số:

- VND: `0`.
- Count: `0`.
- Percentage: theo rule làm tròn được BA khóa.

## 36.2. Template acceptance

Kiểm tra:

- tên sheet;
- title tháng/năm;
- thứ tự dòng;
- nhóm dòng;
- cột `TỔNG / NHÀ T / NHÀ S / NHÀ G`;
- merge cell;
- number format;
- percentage format;
- border;
- font weight;
- alignment;
- row height/column width quan trọng;
- không có `#REF!`, `#DIV/0!`, `#VALUE!`;
- mã không bị scientific notation;
- mã text không mất leading zero.

## 36.3. Formula policy

Chọn và khóa một trong hai:

### A. Export value snapshot

Excel chứa value đã tính.

### B. Export formula

Nếu giữ formula:

- tương thích Excel;
- có recalc policy;
- test Excel/LibreOffice;
- không trộn tùy tiện formula/value.

## 36.4. Snapshot kỳ

Khi kỳ đã khóa:

- export lại phải ra cùng số;
- master data đổi sau này không làm report lịch sử thay đổi;
- adjustment phải version/audit.

## 36.5. Fixture bắt buộc

Ít nhất dùng **tháng 8/2026** để đối chiếu trực tiếp với workbook nguồn trước nghiệm thu.

---

# 37. INVOICE TEMPLATE MATRIX — BẮT BUỘC

## 37.1. Template hóa đơn thường đã có trên live

| Template | Live |
|---|---|
| HĐ (VP) | Có |
| HĐ (VP-HẰNG) | Có |
| HĐ (TECH) | Có |
| HĐ G1 (TECH) | Có |

Mỗi template nên là cấu hình:

```text
template_code
bank_name
bank_account
account_holder
transfer_content_rule
footer_note
late_payment_note
effective_from
effective_to
building_scope
```

Không hard-code account/bank trực tiếp trong UI component.

## 37.2. Body hóa đơn tháng

```text
HÓA ĐƠN THÁNG {MM/YYYY}

Mã KH
Phòng số
Ngày chốt số liệu

STT
Nội dung
Chỉ số mới
Chỉ số cũ
Số lượng
Hệ số
Đơn giá
Thành tiền
Ghi chú
```

Các dòng cần support:

```text
1  Tiền phòng
2  Tiền cọc
3  Điện
4  Nước
5  Vệ sinh
6  Internet
7  Thang máy
8  Gửi xe
9  Máy giặt
10 Combo/DV khác
11 Nợ cũ
12 Điện chung
13 Thu khác (nếu có)
```

Footer:

- Tổng cộng.
- Bằng chữ.
- Hạn thanh toán.
- Nội dung chuyển khoản.
- Tài khoản.
- Lưu ý.
- Trân trọng thông báo.

## 37.3. Print/PDF

Trạng thái live hiện tại:

**PARTIAL — có Xem/In nhưng cần nghiệm thu trực tiếp cả 4 template và PDF A4.**

DONE khi:

- render đủ invoice;
- đúng template đã chọn;
- A4 không cắt bảng;
- page break hợp lý;
- font không vỡ;
- PDF giống preview;
- bank/account đúng effective period.

---

# 38. HÓA ĐƠN HOÀN CỌC — ĐÃ CÓ FLOW, CẦN SOURCE-TEMPLATE ACCEPTANCE

Nguồn có template riêng `HÓA ĐƠN HOÀN CỌC`.

## 38.1. Header

```text
HÓA ĐƠN HOÀN CỌC
Ngày chốt
Mã KH
Phòng số
```

## 38.2. Body

Cần support:

```text
Tiền phòng cọc
Tiền phòng
Điện
Nước
Vệ sinh
Internet
Thang máy
Gửi xe
Máy giặt
Khấu hao
Sửa chữa
Dọn vệ sinh
Sơn phòng
Dịch vụ khác
```

## 38.3. Tổng

```text
TỔNG TIỀN HOÀN CỌC
```

Rule khung:

```text
Số hoàn = Cọc đang giữ
          - Công nợ
          - Điện/nước chốt cuối
          - Khấu hao
          - Sửa chữa
          - Vệ sinh
          - Sơn
          - Các khoản hợp lệ khác
```

Mỗi khoản khấu trừ cần:

- amount;
- reason;
- người nhập;
- chứng từ/ảnh nếu có;
- audit.

---

# 39. ACCEPTANCE TEST CHO 2 REPORT VÀ HÓA ĐƠN

## 39.1. Báo cáo Tổng

- chọn 08/2026;
- không filter;
- compare toàn bộ dòng với workbook source;
- compare Tổng/T/S/G;
- export;
- mở file;
- compare value + layout.

## 39.2. Báo cáo Kinh doanh

Lặp lại, đặc biệt kiểm tra:

- cọc mới;
- mua thiết bị;
- adjustment;
- LNR/LNG/GV;
- ratios.

## 39.3. Hóa đơn thường

Chọn tối thiểu:

- phòng điện/nước theo chỉ số;
- nước theo đầu người;
- khách mới có cọc;
- khách có nợ cũ;
- phòng có combo/DV khác;
- từng bank template.

## 39.4. Hoàn cọc

Case có:

- điện cuối kỳ;
- khấu hao;
- sửa chữa;
- vệ sinh;
- sơn;
- hoàn > 0.

---

# 40. DEFINITION OF DONE CẬP NHẬT

## Reports

- [ ] Hai report definition độc lập.
- [ ] Formula được BA khóa.
- [ ] Trace về source transaction.
- [ ] Snapshot kỳ.
- [ ] Export Excel pass fixture.
- [ ] Không mismatch tháng 8/2026.

## Invoice

- [ ] Invoice detail đúng.
- [ ] 4 template hóa đơn thường hoạt động.
- [ ] Template selector đổi đúng bank/account/layout.
- [ ] Print view render đúng.
- [ ] PDF A4 đúng.
- [~] Flow/template HÓA ĐƠN HOÀN CỌC đã có trên live; cần fixture acceptance.
- [ ] Không hard-code bank/account trong component.

---

# 41. KẾT LUẬN V3

Nếu team làm đúng toàn bộ audit v3, đặc biệt các mục 35–40, thì tài liệu đủ để làm implementation baseline cho mục tiêu:

1. Sinh **Báo cáo Tổng (LN dòng tiền)** theo workbook nguồn.
2. Sinh **Báo cáo Kinh doanh** theo workbook nguồn.
3. Export hai báo cáo ra Excel theo template được nghiệm thu.
4. Sinh hóa đơn tháng theo 4 template đang dùng.
5. In/Lưu PDF A4.
6. Sinh riêng **HÓA ĐƠN HOÀN CỌC**.
7. Trace từ số trên report/hóa đơn về dữ liệu nguồn.

Điểm còn cần BA khóa là các formula/rule mà workbook nguồn chưa mô tả đủ bằng văn bản. Các điểm đó phải chốt bằng fixture và test expected value, **không tự suy diễn**.

---

# 42. LIVE RE-AUDIT V4 — GAP MATRIX MỚI NHẤT

| Khu vực | Status | Evidence live | Việc còn lại |
|---|---|---|---|
| Dashboard | PASS | KPI/filter/collection/work queue đầy đủ | Verify exact 3 vacancy + revenue breakdown |
| Owners / Head Lease | PASS | Detail, contract, payment schedule route | Verify full payment grid + docs/audit |
| Buildings | PARTIAL | Utility/docs/assets/staff có | Staff assignment + lịch trả cần sâu hơn |
| Customers | PASS | filter/action/customer lifecycle phong phú | Verify vehicles/Zalo/tạm trú detail |
| Tenant Contract | PASS/PARTIAL | contract/stay detail, service/meter/docs/audit | Verify transfer/renew/terminate + version snapshot |
| OCR/Documents | PASS/PARTIAL | OCR review + version + entity linkage | Verify OCR apply/commit |
| Billing | PASS | meter/invoice/period/payment coverage | Verify period lock/preflight |
| Invoice detail | PASS | field/rows/template structure đầy đủ | Test 4 print templates |
| Print/PDF | PARTIAL | có Xem/In | A4/render/template acceptance |
| Refund | PASS/PARTIAL | flow/template tương ứng tồn tại | Compare source fixture |
| Receivables | PARTIAL | kỳ/tòa/QL/status filters | aging + terminated views |
| Expenses | PASS/PARTIAL | module đầy đủ | taxonomy/allocation/report mapping |
| Sales | PARTIAL | overview/visitors/deals/commissions có | field-level source audit |
| HR | PASS/PARTIAL | org/employees/assignments/payroll có | M5/M10/M15 acceptance |
| Shareholders | PASS/PARTIAL | module tồn tại | capital/version/distribution/audit |
| Assets/Maintenance | PASS | module & inventory/maintenance có | financial ownership fields |
| Import | PASS | full 5-step wizard | idempotency/error-file QA |
| Settings | PASS | RBAC/categories/period/audit | permission negative tests |
| Reports A/B | PASS UI | 2 report riêng + filter + T/S/G + export | formula/snapshot/export fixture |
| Lists | PASS | search/filter/sort/pagination/export | regression consistency |
| Detail pages | PASS/PARTIAL | status/related/docs/actions | timeline/audit completeness |

## 42.1. Những điểm v3 đã outdated

- Import full workflow đã có.
- Document versioning đã có.
- OCR review đã có.
- HR assignments/payroll đã có.
- Billing depth đã tăng.
- Refund flow/template đã xuất hiện.
- Hai report chính đã có đầy đủ ở mức UI.

## 42.2. Những điểm browser-only audit không thể chứng minh 100%

- formula locking;
- snapshot kỳ;
- Excel export exact-match;
- PDF exact-match;
- M5/M10/M15;
- source traceability;
- shareholder distribution;
- period lock;
- import idempotency;
- permission negative cases.

---

# 43. Nguồn dữ liệu đã sử dụng

- `nội dung làm web Timehouse 31.8.2026(2).xlsx`
- `bảng lương tháng 8.xlsx`
- `BÁO CÁO KINH DOANH THÁNG 8.xlsx`
- `CÁCH TÍNH LƯƠNG PHÒNG VẬN HÀNH.docx`
- `Danh sách mã HĐ điện nước mạng.xlsx`
- `G1.31.8.26.xlsx`
- `Hoá đơn tiền nhà tháng 9 và dịch vụ tháng 9 năm 2026.xlsx`
- `Hoa hồng năm 2025-2026 (1).xlsx`
- `Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc`
- `Hop_dong_thue_phong_demo_day_du.pdf`
- Bộ SRS / functional spec / UI spec của dự án
- Bản live `https://timohousev2.netlify.app/`

---

**Trạng thái báo cáo v4:** Live re-audited + source-traceable. UI/flow gần hoàn thiện; bắt buộc chạy fixture acceptance cho Report Export, formula/snapshot, Invoice/PDF, Refund và Payroll trước khi gọi là production-ready.
