# Phân tích nghiệp vụ và dữ liệu quản trị TimoHouse

**Phiên bản:** 1.2  
**Ngày phân tích:** 20/09/2026  
**Cập nhật v1.1:** bổ sung nghiệp vụ, dữ liệu, quy tắc và mô hình chi trả hoa hồng từ sổ tháng 01/2025–09/2026.  
**Cập nhật v1.2:** bổ sung đặc tả vận hành mới, OCR hợp đồng tạo/liên kết dữ liệu, vòng đời khách thuê, cơ cấu tổ chức–nhân sự–bảng lương và chốt lại phạm vi Phase 1 theo hướng hợp đồng làm điểm vào.  
**Mục đích:** làm tài liệu đầu vào cho phân tích hệ thống, thiết kế cơ sở dữ liệu, API, giao diện, báo cáo và nghiệm thu đối soát với Excel.

## 1. Nguồn và nguyên tắc đọc tài liệu

### 1.1. Nguồn chính

1. [`Timohouse.xlsx`](../docs_timonouse/Timohouse.xlsx): dữ liệu vận hành và số liệu báo cáo thực tế.
2. [`nội dung làm web Timehouse 31.8.2026(2).xlsx`](../nội%20dung%20làm%20web%20Timehouse%2031.8.2026(2).xlsx): mô tả các màn hình, trường dữ liệu, bộ lọc và báo cáo mong muốn.
3. [`Hoa hồng năm 2025-2026 (1).xlsx`](../docs_timonouse/Hoa%20hồng%20năm%202025-2026%20(1).xlsx): sổ chi tiết tính và thanh toán hoa hồng từ tháng 01/2025 đến tháng 09/2026.
4. [`Plan-audit.md`](../Plan-audit.md): đặc tả mới về vòng đời vận hành cho thuê, trạng thái khách, cơ cấu tổ chức và phân công nhân sự.
5. [`phase1.md`](../docs_timonouse/phase1.md): định hướng ưu tiên Phase 1 do chủ nghiệp vụ đề xuất.

Ký hiệu tham chiếu trong tài liệu này dùng dạng `Tên file > Tên sheet!Vùng ô`.

### 1.2. Phân biệt ba mức thông tin

| Nhãn | Ý nghĩa |
|---|---|
| **Có bằng chứng** | Có cột, dòng, số liệu hoặc mô tả trực tiếp trong ba workbook và hai tài liệu đặc tả. |
| **Đề xuất thiết kế** | Cần bổ sung để web quản lý đúng bản chất và sinh được báo cáo, nhưng Excel hiện chưa tách thành dữ liệu chuẩn. |
| **Cần chốt** | Nguồn có nội dung mơ hồ, mâu thuẫn hoặc thiếu công thức; không nên tự động hóa trước khi chủ nghiệp vụ xác nhận. |

## 2. Kết luận điều hành

TimoHouse đang vận hành đồng thời bốn chuỗi nghiệp vụ lớn:

1. **Khai thác tài sản cho thuê:** khu vực/loại nhà → tòa nhà → phòng → khách → hợp đồng.
2. **Vận hành định kỳ:** chốt điện nước/dịch vụ → lập hóa đơn → thu tiền → công nợ → xử lý phòng phá hợp đồng/hoàn cọc.
3. **Quản trị hiệu quả:** doanh thu, giá vốn, chi phí vận hành, chi phí bán hàng, lợi nhuận, tiến độ thu và hiệu suất nhân viên.
4. **Quản trị mở rộng:** kinh doanh/hoa hồng, nhân sự/lương, cổ đông/vốn, tài sản và bảo trì.

Điểm quan trọng nhất khi làm web là **không sao chép nguyên cấu trúc sheet `HD theo tòa` thành một bảng 70 cột**. Sheet này đang ghép nhiều nghiệp vụ vào cùng một dòng: phòng, hợp đồng, giá thuê, cọc, chỉ số điện nước, dịch vụ, hóa đơn, thanh toán, công nợ và thông tin kết thúc hợp đồng. Web phải tách chúng thành các chứng từ và sổ chi tiết có liên kết; báo cáo chỉ là kết quả tổng hợp từ dữ liệu gốc.

Hệ thống muốn sinh đúng toàn bộ báo cáo phải quản lý tối thiểu các trục dữ liệu dùng chung sau:

- Kỳ/thời gian và ngày chốt dữ liệu.
- Khu vực, loại nhà `T/S/G`, tòa nhà, phòng.
- Trưởng khu vực/trưởng nhóm, quản lý/vận hành, sale, team sale và lịch sử phân công.
- Khách thuê, hợp đồng, lần gia hạn, giá niêm yết, giá chốt, cọc và dịch vụ theo hợp đồng.
- Chỉ số điện/nước; số lượng, đơn giá, thành tiền của từng dịch vụ.
- Hóa đơn, dòng hóa đơn, lần phát hành, hạn thu, giao dịch thu và phân bổ tiền.
- Sổ cọc, khấu trừ, hoàn cọc và khoản cọc bị giữ do phá hợp đồng.
- Danh mục chi phí hai cấp, chứng từ chi và phân bổ theo tòa.
- Phòng trống/lấp đầy theo từng ngày, không chỉ trạng thái hiện tại.
- Nguồn khách, lượt xem, lượt chốt, doanh số; phiên bản chính sách hoa hồng, phần chia cho người/team, điều chỉnh và từng lần chi.
- Nhân sự, chức vụ, tòa/phòng phụ trách, quy tắc tính lương và kết quả theo kỳ.
- Cổ đông, tỷ lệ sở hữu theo tòa, đợt góp vốn, phân phối lợi nhuận.
- Tài sản, chủ sở hữu tài sản, kiểm kê, lịch và phiếu bảo trì.
- Tài liệu, bằng chứng, người tạo/sửa/duyệt và nhật ký thay đổi.

Quyết định phạm vi mới làm thay đổi ưu tiên triển khai: **OCR hợp đồng, vòng đời khách, cơ cấu tổ chức, phân công nhân sự, bảng lương và hai báo cáo quản trị mẫu được đưa vào Phase 1**. CRM/hoa hồng tự động đầy đủ, bảo trì nâng cao và cổng cổ đông vẫn để giai đoạn sau. Trên UI, hợp đồng/OCR là điểm vào; trong dữ liệu, hệ thống vẫn phải tạo hoặc liên kết đúng tòa → phòng → khách trước khi kích hoạt hợp đồng.

## 3. Ảnh chụp quy mô và số liệu thật

### 3.1. Dữ liệu hóa đơn/phòng tháng 9/2026

Nguồn: `Timohouse.xlsx > HD theo tòa!A1:BR510`.

| Chỉ tiêu đọc từ nguồn | Kết quả |
|---|---:|
| Dòng dữ liệu từ hàng 5 đến 510 | 506 dòng |
| Mã phòng-tòa duy nhất | 506 mã |
| Số mã tòa xuất hiện | 35 tòa |
| Loại nhà trong riêng sheet này | Chỉ nhóm `T` |
| Quản lý xuất hiện | 9 người |
| Trạng thái `Đủ` | 452 |
| Trạng thái `Thiếu` | 25 |
| Trạng thái `Thừa` | 22 |
| Trạng thái `Chưa TT` | 5 |
| Trạng thái `Trống` | 2 |
| Dòng thiếu một mã phòng riêng tại cột C | 1 |
| Dòng thiếu ngày vào ở, thời hạn và ngày hết hạn HĐ | 465/506 |

Hàng tổng hợp của workbook ghi:

- `Tổng DV`: 591.254.867 đồng.
- `Tổng cần đóng`: 2.627.786.318 đồng.
- `Tổng đã đóng`: 2.596.152.829 đồng.
- Chênh lệch hiển thị: 31.633.489 đồng.

Các số trên nằm tại `HD theo tòa!AU4:AY4`. Không nên dùng chúng làm số kiểm thử duy nhất vì các dòng chi tiết chủ yếu là giá trị dán, không có công thức để tái lập tổng.

### 3.2. Tiến độ thu tiền toàn hệ thống ngày 16/09/2026

Nguồn: `Timohouse.xlsx > Cập nhật thu tiền!A1:Y121`.

| Chỉ tiêu | Kết quả nguồn |
|---|---:|
| Doanh thu phải thu | 7.736.857.817 đồng |
| Thực thu | 7.616.495.529 đồng |
| Tỷ lệ thu | 98,4% |
| Doanh thu phòng phá hợp đồng | 100.083.000 đồng |
| Phần phá hợp đồng thu được | 3.662.000 đồng |
| Tỷ lệ doanh thu phá HĐ/doanh thu phải thu | 1,3% |
| Số tòa có dòng chi tiết | 103 tòa |
| Cơ cấu mã tòa | 35 `T`, 53 `S`, 15 `G` |
| Số quản lý ở bảng theo tòa | 12 người |

Sheet có các mốc thu `M5`, `M10`, `M15`, nhưng cột mốc thứ ba đang trống ở cả 103 dòng tòa. Có 30 ô lỗi `#REF!`, tập trung ở vùng theo dõi mốc thu `W:Y`.

### 3.3. Báo cáo kinh doanh tháng 8/2026

Nguồn: `Timohouse.xlsx > Báo cáo kinh doanh Tháng 8!A1:F60`.

| Chỉ tiêu | Toàn hệ thống | Nhà T | Nhà S | Nhà G |
|---|---:|---:|---:|---:|
| Tổng doanh thu | 7.036.256.236 | 2.527.702.129 | 3.551.745.507 | 956.808.600 |
| Cọc phòng mới | 371.850.000 | 152.600.000 | 187.450.000 | 31.800.000 |
| Cọc khách bỏ không ở | 18.400.000 | 9.500.000 | 7.900.000 | 1.000.000 |
| Hoàn cọc | 104.968.774 | 32.671.000 | 67.345.774 | 4.952.000 |
| Phòng phá hợp đồng | 39 | 18 | 15 | 6 |
| Phòng mới | 95 | 41 | 47 | 7 |
| Phòng trống | 11 | 6 | 4 | 1 |
| Doanh thu tiền phòng | 5.021.511.226 | 1.769.319.355 | 2.539.543.161 | 712.648.710 |
| Doanh thu dịch vụ | 1.745.169.586 | 639.965.325 | 895.335.161 | 209.869.100 |
| Giá vốn | 5.316.928.772 | 1.906.621.248 | 2.679.802.869 | 730.504.655 |
| Tổng chi phí bán hàng/vận hành | 696.928.495 | 273.748.427 | 345.020.393 | 78.159.675 |
| Lợi nhuận ròng | 1.022.398.969 | 347.332.454 | 526.922.245 | 148.144.270 |
| Tỷ lệ LNR/doanh thu | 14,53% | 13,74% | 14,84% | 15,48% |

Workbook cũng theo dõi doanh thu và giá gốc riêng cho điện, nước, mạng, rác, môi trường, thang máy; đây là bằng chứng cần xây sổ doanh thu/chi phí dịch vụ riêng, không gộp tất cả vào “dịch vụ khác”.

### 3.4. Báo cáo mẫu một nhà G1 tháng 6/2026

Nguồn: `Timohouse.xlsx > Báo cáo tháng 6!A1:N86`.

- Tổng doanh thu: 79.912.000 đồng.
- Giá vốn: 66.358.594 đồng.
- Lợi nhuận gộp: 13.553.406 đồng.
- Lợi nhuận ròng: 3.077.281 đồng.
- Tỷ lệ lợi nhuận ròng/doanh thu: 3,85%.
- Có 2 phòng mới, 3 phòng phá hợp đồng, 1 phòng trống.
- Có bảng chia cổ phần cho 9 người, tổng tỷ lệ 100%; mỗi người nhận lại `vốn + lợi nhuận ròng phân bổ`.

Sheet có 80 công thức, trong đó 12 công thức tham chiếu workbook ngoài. Giá trị cache còn đọc được nhưng file hiện tại không đủ dữ liệu để tính lại độc lập.

### 3.5. Phòng phá hợp đồng

Nguồn: `Timohouse.xlsx > DS phòng phá hợp đồng!A1:I52`.

- Có 20 trường hợp thực tế ở hàng 4–23.
- Tổng phải thu được ghi 16.048.000 đồng; tổng đã thu 3.662.000 đồng.
- Dữ liệu có mã phòng-tòa, quản lý, ngày vào ở, số tháng ở, lý do, SĐT, phải thu và đã thu.
- Lý do thực tế gồm về quê, nghỉ/chuyển cơ sở học, chuyển chỗ làm, bỏ trốn, không đủ tài chính, vỡ nợ và phản ứng khi tăng giá.

Điều này cho thấy “phá hợp đồng” phải là một sự kiện có cấu trúc và ảnh hưởng đồng thời đến hợp đồng, công nợ, cọc, phòng, doanh thu và báo cáo nguyên nhân rời đi.

### 3.6. Hiệu suất và bảng lương vận hành

Nguồn: `Timohouse.xlsx > Bảng lương!A1:X133`.

Tổng hợp đầu bảng ghi nhận 1.079 phòng, doanh thu niêm yết 4.228.800.000 đồng, doanh thu phải thu 5.338.568.305 đồng, tổng doanh thu thu được 3.941.997.932 đồng và hiệu suất 93,22%.

Dữ liệu lương đang kết hợp:

- Lương cơ bản và các loại phụ cấp.
- Vai trò trưởng/phó/nhân viên vận hành.
- Danh sách tòa phụ trách và số phòng từng tòa.
- Doanh thu niêm yết, phải thu, thu ở ba mốc.
- Doanh thu dịch vụ, tỷ lệ dịch vụ/doanh thu, thu thêm.
- Hiệu suất, mức lương/phòng, tổng lương theo phòng và thực nhận.

Có ít nhất 3 lỗi `#REF!` tại ô tên/tổng nhân sự. Vì vậy không thể coi tên và số thứ tự trong sheet này là danh mục nhân sự chuẩn.

### 3.7. Sổ hoa hồng tháng 01/2025–09/2026

Nguồn: `Hoa hồng năm 2025-2026 (1).xlsx`, gồm 21 sheet tháng liên tục từ tháng 01/2025 đến tháng 09/2026.

| Chỉ tiêu đọc từ nguồn | Kết quả |
|---|---:|
| Tổng dòng có phòng và căn cứ tính hoa hồng | 2.160 dòng |
| Riêng năm 2025 | 1.132 dòng |
| Tháng 01–09/2026 | 1.028 dòng |
| Tổng “giá chốt/căn cứ” trong các dòng | Xấp xỉ 8,008 tỷ đồng |
| Tổng “thành tiền hoa hồng” theo giá trị công thức đã lưu | Xấp xỉ 3,328 tỷ đồng |
| Dòng có mức 50% | 1.226 |
| Dòng có mức 35% | 465 |
| Dòng có mức 25% | 97 |
| Dòng có mức 30% | 61 |
| Dòng có mức 17,5% | 38 |
| Dòng có mức 15% | 29 |
| Dòng có mức 65% | 22 |
| Dòng có công thức riêng tại cột mức hoa hồng | 155 |
| Dòng có công thức điều chỉnh căn cứ/giá chốt | 35 |
| Dòng thiếu kết quả “thành tiền” | 10 |
| Dòng có nội dung liên quan “trùng” | 117 |
| Dòng có nội dung liên quan “bỏ cọc” | 167 |
| Dòng có nội dung hỗ trợ/fix/khấu trừ | 11 |

Các mức 50% và 35% là phổ biến nhất nhưng **không phải hai mức duy nhất**. Nguồn có nhiều mức phát sinh từ chia người nhận, hợp đồng ngắn hạn hoặc ngoại lệ: 17,5% (`35%/2`), 16,67% (`50%/3` hoặc prorate), 11,67%, 8,33%, 7,5%, 5%, 4,375% và các mức khác.

Cơ cấu thời hạn ghi trong sổ gồm 1.021 dòng `12th`, 404 dòng `6th`, 121 dòng `9th`, 112 dòng `8th`, 72 dòng `3th`; ngoài ra trường “Thời hạn HĐ” còn chứa `BỎ CỌC`. Điều này chứng minh thời hạn hợp đồng và loại căn cứ hoa hồng đang bị trộn trong một cột.

Quy mô tăng đáng kể: tháng 09/2025 có 253 dòng, khoảng 413,326 triệu đồng hoa hồng; tháng 09/2026 có 265 dòng, khoảng 481,510 triệu đồng. Đây không còn là sổ phụ có thể quản lý an toàn bằng ghi chú và ô gộp.

Các cột thay đổi qua thời gian nhưng tập trường thực tế gồm: trạng thái tiền khách, quản lý, mã phòng-tòa, giá chốt/căn cứ, thời hạn HĐ, mức hoa hồng, thành tiền, tổng nhận theo người/team, chú thích, team/đối tác, ngày hoặc trạng thái thanh toán, tài khoản nhận và SĐT khách.

## 4. Mô hình nghiệp vụ hiện tại được dựng lại từ dữ liệu

### 4.1. Quản lý tòa nhà đầu vào

Mỗi tòa cần gắn với khu vực, loại nhà `T/S/G`, chủ nhà, hợp đồng thuê đầu vào, người phụ trách và hồ sơ pháp lý. Hợp đồng đầu vào quyết định:

- Giá thuê nhà là thành phần lớn nhất của giá vốn.
- Tiền cọc chủ nhà.
- Kỳ và lịch trả tiền.
- Thời gian giữ giá, thời hạn hợp đồng.
- Tình trạng PCCC và hồ sơ sổ đỏ.
- Tài sản của chủ nhà và tài sản do công ty/nhà đầu tư mua.

Nguồn mô tả: `nội dung làm web... > Khu nhà và toàn nhà!A1:D17`.

### 4.2. Quản lý phòng, khách và hợp đồng đầu ra

Phòng là đơn vị hàng hóa trung tâm. Một phòng tại một thời điểm có tối đa một hợp đồng thuê đang hiệu lực, nhưng một hợp đồng có thể có nhiều người ở và nhiều phương tiện.

Hợp đồng phải giữ đồng thời:

- Giá niêm yết tại thời điểm chốt.
- Giá do quản lý đề xuất và giá thuê thực tế.
- Cọc phải thu, cọc đã thu.
- Ngày bắt đầu, kết thúc, thời hạn.
- Hợp đồng lần đầu hay lần gia hạn thứ mấy.
- Bảng giá dịch vụ riêng của hợp đồng.
- File hợp đồng và kết quả trích xuất/OCR nếu có.

Nguồn thực tế: `HD theo tòa!A2:BC510`; nguồn mô tả: `Thông tin khách hàng!E1:G11`.

#### 4.2.1. OCR hợp đồng là luồng tạo dữ liệu có kiểm soát

Theo định hướng Phase 1 mới, người dùng có thể bắt đầu từ **tệp hợp đồng** thay vì phải tạo thủ công lần lượt mọi hồ sơ. OCR phải tạo một “gói đề xuất” có liên kết, không tạo ngay dữ liệu chính thức.

```text
Tải hợp đồng PDF/JPG
→ nhận dạng loại hợp đồng và từng trang
→ trích xuất field + độ tin cậy + vị trí trên tài liệu
→ dò tìm tòa/phòng/khách đã có
→ hiển thị chênh lệch và cảnh báo trùng/xung đột
→ người dùng chọn Tạo mới | Liên kết bản ghi có sẵn | Cập nhật | Bỏ qua
→ lưu dự thảo toàn bộ gói
→ người có quyền xác nhận
→ ghi dữ liệu chính thức trong một giao dịch nhất quán
```

Một lần xác nhận OCR có thể tạo hoặc liên kết:

| Nhóm dữ liệu | Kết quả cần tạo/liên kết |
|---|---|
| Tòa nhà | Tòa tương ứng theo mã/tên/địa chỉ; nếu chưa có thì đề xuất tạo dự thảo |
| Phòng | Phòng thuộc đúng tòa; khóa dò chính là `tòa + mã phòng` |
| Khách hàng | Người đứng tên và từng người ở cùng; dò trùng bằng SĐT/CCCD/thông tin định danh |
| Hợp đồng | Số HĐ, loại/lần HĐ, ngày ký, bắt đầu, kết thúc, giá, cọc, chu kỳ/mốc thu, trạng thái dự thảo |
| Dịch vụ theo phòng/HĐ | Điện, nước, mạng, thang máy, dịch vụ chung, sạc/gửi xe, máy giặt và dịch vụ khác; lưu đơn giá snapshot |
| Tài sản/bàn giao | Nội thất, thiết bị, số lượng, tình trạng, chủ sở hữu nếu tài liệu thể hiện |
| Xe | Chủ xe/người sử dụng, loại xe, biển số, số lượng và hiệu lực |
| Tài liệu | File gốc, phiên bản, trang/vùng bằng chứng cho từng field và người xác nhận |

Thứ tự ghi chính thức phải bảo đảm khóa ngoại: `tòa → phòng → khách/người ở cùng → xe/tài sản → hợp đồng → dịch vụ hợp đồng → tài liệu liên kết`. Nếu một phần bắt buộc thất bại thì không được tạo một nửa gói dữ liệu khiến hợp đồng mất liên kết.

Trạng thái OCR tối thiểu:

```text
Đã tải → Đang xử lý → Cần rà soát → Đã xác nhận → Đã ghi dữ liệu
                         ↘ Từ chối
Đang xử lý/Cần rà soát → Lỗi → Xử lý lại
```

Mỗi field OCR cần lưu `raw_text`, giá trị chuẩn hóa, confidence, trang/vùng nguồn, trạng thái chấp nhận/sửa/bỏ qua và người xác nhận. Chạy OCR lại hoặc bấm xác nhận lại không được tạo trùng; gói import phải có khóa idempotency và phiên bản.

#### 4.2.2. Từ ngày hết hạn OCR đến danh sách xử lý cuối/đầu tháng

`contract.end_date` sau khi người dùng xác nhận trở thành dữ liệu nguồn cho cảnh báo hết hạn. Hệ thống chạy kiểm tra hằng ngày, đồng thời chụp danh sách làm việc vào cuối tháng và đầu tháng:

```text
Hợp đồng hiệu lực
AND end_date nằm trong ngưỡng cảnh báo (mặc định 35 ngày)
→ đưa vào danh sách HĐ sắp hết
→ giao việc cho người quản lý đang phụ trách tòa/phòng
→ ghi kết quả liên hệ: gia hạn | trả đúng hạn | chấm dứt sớm | chưa phản hồi
→ tạo hồ sơ gia hạn hoặc quy trình kết thúc/quyết toán tương ứng
```

Danh sách phải có: mã tòa-phòng, khách đứng tên/SĐT, người ở cùng, quản lý hiện tại, ngày bắt đầu/kết thúc, số ngày còn lại, giá/cọc, công nợ, tình trạng hồ sơ gia hạn, lần liên hệ gần nhất, hạn xử lý và action. OCR chỉ cung cấp ngày nguồn; hệ thống không tự gia hạn hoặc tự kết thúc khi đến hạn.

#### 4.2.3. Vòng đời khách thuê

Trạng thái tổng hợp của khách phải được suy ra từ hợp đồng, vai trò cư trú, quyết toán và hoàn cọc; không phải một ô cho người dùng sửa tùy ý:

```text
Chưa thuê
→ Đang thuê | Đang ở cùng
→ Sắp hết hạn
→ Chờ gia hạn | Chờ kết thúc
→ Chờ quyết toán
→ Chờ hoàn cọc (nếu còn cọc phải xử lý)
→ Ngừng thuê
→ có thể quay lại Đang thuê/Đang ở cùng bằng hợp đồng mới
```

Các cờ `Sắp hết hạn`, `Còn công nợ`, `Có hồ sơ phá HĐ`, `Chờ xử lý OCR` và `Chưa liên kết Zalo` hiển thị độc lập với trạng thái vòng đời. Khách quay lại phải dùng hồ sơ cũ nếu trùng định danh đã xác minh; mỗi lần thuê tạo hợp đồng mới và không ghi đè lịch sử.

### 4.3. Chốt chỉ số và lập hóa đơn tháng

Luồng tháng đang thể hiện qua `HD theo tòa` và mẫu `HD`:

```text
Chọn kỳ và ngày chốt
→ lấy phòng/hợp đồng đang hiệu lực
→ nhập chỉ số điện, nước
→ lấy số lượng và đơn giá từng dịch vụ theo hợp đồng
→ tính các dòng tiền phòng, cọc, điện, nước, vệ sinh, mạng,
  thang máy, gửi xe/xe điện, máy giặt, dịch vụ khác, điện chung
→ cộng/đối chiếu nợ cũ và khoản thu khác
→ phát hành hóa đơn
→ gửi thông báo và theo dõi thu
```

Mẫu hóa đơn tại `HD!B2:J26` còn chứa mã khách, mã phòng, ngày chốt, nội dung chuyển khoản, tài khoản nhận, kỳ thanh toán và nội dung nhắc trả đúng hạn.

### 4.4. Thu tiền và công nợ

`HD theo tòa` chỉ có một cột “Tổng đã đóng”, trong khi hệ thống web phải quản lý từng giao dịch thu. Một hóa đơn có thể thu nhiều lần; một giao dịch có thể được phân bổ cho nhiều hóa đơn.

Tiến độ thu cần được chụp theo mốc `M5/M10/M15`, theo quản lý và theo tòa. Báo cáo hiện có cả trường hợp tỷ lệ trên 100%, nên hệ thống phải tách:

- Tiền thu đúng hóa đơn.
- Thu thừa/tạm ứng.
- Thu khoản cũ.
- Khoản chưa xác định được phòng/hóa đơn.
- Giao dịch bị đảo hoặc điều chỉnh.

### 4.5. Phá hợp đồng và hoàn cọc

Luồng đề xuất bám sát dữ liệu:

```text
Ghi nhận yêu cầu/kết luận phá hợp đồng
→ chốt ngày ra và chỉ số cuối
→ lập hóa đơn/quyết toán cuối
→ xác định công nợ
→ xác định cọc đang giữ
→ nhập khấu trừ: công nợ, khấu hao, sửa chữa, vệ sinh, khoản khác
→ duyệt số hoàn hoặc số cọc bị giữ
→ ghi giao dịch hoàn
→ kết thúc hợp đồng
→ chuyển phòng sang Chờ dọn/Bảo trì
→ nghiệm thu dọn xong
→ phòng Sẵn sàng
```

Không được lưu “cọc mới”, “cọc bị giữ” và “hoàn cọc” như cùng một loại doanh thu. Về quản trị cần có hai góc nhìn:

- **Dòng tiền:** cọc thu vào/hoàn ra ảnh hưởng tiền mặt.
- **Kết quả kinh doanh:** cọc còn nghĩa vụ hoàn là khoản phải trả; chỉ phần cọc bị giữ/phạt sau quyết toán mới có thể là thu nhập theo quy tắc kế toán được duyệt.

### 4.6. Chi phí và lợi nhuận

Workbook đang dùng ba tầng chi phí:

1. **Giá vốn:** tiền thuê nhà, mua sắm thiết bị, giá gốc điện/nước/mạng/rác/môi trường/bảo trì thang máy.
2. **Chi phí vận hành:** lương theo vai trò, bảo vệ, vệ sinh, kế toán, sửa chữa, thuê và dịch vụ văn phòng.
3. **Chi phí bán hàng/phát sinh:** marketing, hoa hồng, sửa chữa-thay thế-bảo trì, chi phí khác.

Web phải lưu từng phiếu chi và phân bổ tới một hoặc nhiều tòa; bảng báo cáo không được là nơi nhập tổng chi phí trực tiếp.

### 4.7. Kinh doanh và hoa hồng

Nguồn mô tả yêu cầu bốn sổ:

- Tổng quan hàng hóa/phòng: đã chốt, đã nhận, phát sinh hoàn cọc/phát hóa đơn.
- Sổ doanh số 15 trường: ngày giao dịch, mã phòng-tòa, quản lý, SĐT, cọc, giá chốt, ngày tính tiền, thời hạn, nguồn/công cụ, tình trạng thu, sale, hoa hồng, tình trạng phòng chốt, ghi chú.
- Thống kê khách: sale, phòng-tòa, nguồn nội bộ/đối tác, trạng thái xem/chốt, khu vực, SĐT, ngày chuyển khách.
- Sổ hoa hồng: phòng-tòa, giá chốt, thời hạn, mức hoa hồng, thành tiền, tổng nhận, team, trạng thái chi.

Nguồn yêu cầu: `nội dung làm web... > KINH DOANH!A1:C41`; nguồn vận hành thật: toàn bộ 21 sheet của `Hoa hồng năm 2025-2026 (1).xlsx`.

Sổ hoa hồng thực tế cho thấy một “deal” có thể phát sinh nhiều lớp dữ liệu:

1. **Kết quả bán:** phòng, tòa, quản lý, giá chốt, thời hạn hợp đồng và tình trạng tiền khách.
2. **Căn cứ hoa hồng:** giá thuê tháng, cọc bị bỏ, hoặc số tiền đã điều chỉnh sau khi trừ số ngày ở/hỗ trợ.
3. **Chính sách:** mức chuẩn theo loại nguồn/đối tác và thời hạn; chính sách có thể thay đổi theo tháng.
4. **Chia hoa hồng:** một khách/phòng có thể “trùng”, mức được chia đôi/chia ba hoặc chia theo tỷ lệ riêng.
5. **Điều chỉnh:** hỗ trợ khách/CTV, giảm hoa hồng, khoản trừ cố định hoặc override thủ công.
6. **Người nhận:** sale nội bộ, CTV, partner/team hoặc nhân viên vận hành; mỗi người có tài khoản nhận riêng.
7. **Chi trả:** một tổng nhận có thể gộp nhiều phòng và trả theo `lần 1`, `lần 2`...; trạng thái khách và trạng thái chi hoa hồng là hai việc khác nhau.

Các mẫu công thức có bằng chứng:

```text
Hoa hồng gộp = Căn cứ tính × Mức hoa hồng
Mức sau chia trùng = Mức gốc / số người cùng hưởng
Mức HĐ ngắn = Mức chuẩn / số tháng chuẩn × số tháng thực tế
Hoa hồng ròng = Hoa hồng gộp - hỗ trợ/khấu trừ + điều chỉnh tăng
Tổng nhận người/team = tổng các phần hoa hồng ròng được gom vào một đợt chi
```

Ví dụ nguồn có `35%/2`, `15%/2`, `50%/3`, `50%/6*5`, `50%/6*3`; một số dòng tính căn cứ bỏ cọc bằng `cọc - tiền ở theo ngày`, và một số dòng trừ trực tiếp khoản hỗ trợ 500.000–1.200.000 đồng.

Không thể suy ra một điều kiện chi duy nhất từ file. Có dòng ghi khách `chưa ký HĐ`, `chưa TT đủ`, `bỏ cọc` nhưng cột chi hoa hồng lại ghi `Đã tt`. Hệ thống vì vậy phải hỗ trợ chính sách có phiên bản, luồng duyệt ngoại lệ và lưu lý do; không được viết cứng rằng mọi hoa hồng chỉ được chi khi khách ký hợp đồng và đóng đủ cọc nếu chưa có quyết định nghiệp vụ chính thức.

### 4.8. Nhân sự và lương

Nhân sự phải được gắn với phòng ban, chức vụ, ngày vào/nghỉ, trạng thái và lịch sử phân công tòa. Lương vận hành dựa trên hiệu suất thu của danh sách tòa/phòng phụ trách; vì vậy nếu chỉ lưu “quản lý hiện tại” trên tòa thì báo cáo lương kỳ cũ sẽ bị thay đổi khi điều chuyển nhân sự.

Cơ cấu phải là cây cấu hình được, không viết cứng số cấp:

```text
Công ty / Quản lý Tổng
├─ Các đơn vị vận hành → TPVH/Lead → NV vận hành, kỹ thuật, vệ sinh
├─ Tài chính – Kế toán → Kế toán
└─ Phòng Kinh doanh → TP Kinh doanh
   └─ Nhóm Kinh doanh → Trưởng nhóm
      └─ Team Sale → Lead Team Sale → Sale
```

Mỗi nhân viên có một đơn vị chính tại một thời điểm và có thể có kiêm nhiệm được khai báo riêng. Mỗi đội/nhóm hoạt động có đúng một Lead hiệu lực; thay Lead hoặc điều chuyển phải tạo nhiệm kỳ mới, không ghi đè lịch sử.

Phân công vận hành ưu tiên theo tòa, có vai trò phụ trách chính/phối hợp/kỹ thuật/vệ sinh và khoảng hiệu lực. Hai chỉ tiêu `Nhà/phòng hiện tại` và `Nhà/phòng sắp tới` được tính theo ngày tham chiếu từ phân công đã duyệt. Một tòa không có hai người phụ trách chính chồng thời gian nếu chưa có ngoại lệ được duyệt.

Luồng bảng lương Phase 1:

```text
Mở kỳ lương
→ chụp cơ cấu và tòa/phòng phụ trách trong kỳ
→ lấy doanh thu niêm yết, phải thu, thu M1/M2/M3, dịch vụ và thu thêm
→ tính hiệu suất và mức lương/phòng theo phiên bản quy tắc
→ cộng lương cơ bản, phụ cấp, lương Lead/hỗ trợ
→ nhập/duyệt điều chỉnh và khấu trừ
→ rà soát
→ chốt bảng lương
→ ghi nhận chi lương
```

Bảng lương đã chốt phải giữ snapshot đầu vào; thay đổi cơ cấu hoặc phân công tháng sau không làm đổi kết quả kỳ cũ.

### 4.9. Cổ đông, vốn và tài sản

Cổ đông được quản lý theo tòa và thời gian, gồm tỷ lệ cổ phần, các đợt phải góp/đã góp, lịch đóng tiền, phân phối lợi nhuận, tài sản và tiền cọc. Bảng chia cổ phần G1 cho thấy tiền nhận của mỗi người được tính từ phần vốn và phần lợi nhuận theo tỷ lệ.

### 4.10. Bảo trì và kiểm kê

Nguồn mô tả yêu cầu lịch cho thang máy, máy bơm, máy giặt/vệ sinh, máy lọc nước và kiểm kê đồ décor. Nghiệp vụ cần tách:

- Danh mục tài sản/thiết bị.
- Kế hoạch bảo trì lặp lại.
- Phiếu công việc thực tế.
- Chi phí và chứng từ liên quan.
- Kiểm kê, hỏng/mất/thay thế và lịch sử điều chuyển.

## 5. Mô hình dữ liệu cần quản lý

### 5.1. Nguyên tắc mô hình

- Dùng mã định danh kỹ thuật bất biến; mã tòa/phòng hiển thị có thể sửa nhưng phải duy nhất trong phạm vi.
- Mọi quan hệ thay đổi theo thời gian như quản lý tòa, bảng giá, tỷ lệ cổ đông phải có `effective_from/effective_to`.
- Tiền lưu bằng số nguyên VND hoặc kiểu decimal rõ độ chính xác; không lưu chuỗi có dấu chấm ngăn nghìn.
- Ngày lưu kiểu ngày; không trộn số serial Excel, chuỗi `15/6/2026` và năm `2023` trong cùng cột.
- Chứng từ phát hành phải lưu snapshot giá và tên hạng mục để dữ liệu quá khứ không đổi khi danh mục đổi.
- Mọi số tổng trên dashboard phải truy được về chứng từ chi tiết.

### 5.2. Tổ chức, khu vực, tòa và chủ nhà

| Thực thể | Trường tối thiểu cần quản lý | Dùng cho |
|---|---|---|
| `area` – Khu vực/khu nhà | mã, tên, địa bàn, trưởng khu vực, ngày hiệu lực, trạng thái | Bộ lọc toàn hệ thống, phân quyền, báo cáo theo khu |
| `building_type` | mã `T/S/G`, tên đầy đủ, mô tả | Báo cáo và lọc loại nhà; không suy diễn ý nghĩa từ chữ cái |
| `building` | mã, tên, khu vực, loại nhà, địa chỉ, diện tích, số tầng, ngày vận hành, tình trạng cũ/mới/trung bình, trạng thái, đăng ký kinh doanh | Phòng, hóa đơn, hiệu quả, thời gian vận hành |
| `building_staff_assignment` | tòa, nhân sự, vai trò trưởng nhóm/vận hành/vệ sinh/kỹ thuật, từ ngày, đến ngày, chính/phụ | Lọc theo nhân sự và chốt trách nhiệm đúng kỳ |
| `landlord` | cá nhân/tổ chức, họ tên/tên pháp nhân, CCCD/MST, ngày cấp/nơi cấp, địa chỉ, điện thoại, email, tài khoản ngân hàng, đại diện | Hợp đồng thuê đầu vào và thanh toán chủ nhà |
| `head_lease` | tòa, chủ nhà, số HĐ, ngày ký, bắt đầu/kết thúc, giá thuê, cọc, thời gian giữ giá, chu kỳ trả, PCCC, người nhập nguồn, trạng thái, ghi chú | Giá vốn thuê nhà, cảnh báo hết hạn, lịch trả tiền |
| `head_lease_price_period` | hợp đồng đầu vào, từ ngày, đến ngày, giá thuê, lý do điều chỉnh | Giá vốn chính xác theo kỳ |
| `landlord_payment_schedule` | hợp đồng, kỳ, từ/đến, ngày đến hạn, phải trả, đã trả, trạng thái, chứng từ | Theo dõi lịch đóng tiền chủ nhà |
| `legal_record` | tòa/chủ nhà/HĐ, loại PCCC/sổ đỏ/ĐKKD, số, ngày cấp/hết hạn, trạng thái xác minh, file | Quản lý pháp lý và nhắc hết hạn |

### 5.3. Phòng, khách và hợp đồng

| Thực thể | Trường tối thiểu cần quản lý | Dùng cho |
|---|---|---|
| `room` | tòa, mã phòng, tầng, loại phòng, diện tích, giá niêm yết hiện tại, sức chứa, trạng thái, ngày sẵn sàng dự kiến | Hàng hóa, lấp đầy, phòng trống |
| `room_price_history` | phòng, giá niêm yết, từ ngày, đến ngày, người duyệt | So sánh giá niêm yết/giá chốt đúng thời điểm |
| `room_status_history` | phòng, trạng thái cũ/mới, thời điểm, lý do, nguồn sự kiện | Thời gian trống và dự báo tồn phòng |
| `tenant` | mã khách, họ tên, SĐT chuẩn hóa, Zalo ID/trạng thái liên kết, CCCD, ngày sinh, giới tính, nghề nghiệp, phân khúc, liên hệ khẩn cấp | Hồ sơ khách, Zalo, phân khúc |
| `contract` | số HĐ, phòng, khách đại diện, ngày ký, bắt đầu/kết thúc, thời hạn, lần hợp đồng/gia hạn, giá niêm yết snapshot, giá chốt, cọc phải thu, chu kỳ thu, hạn thu, trạng thái, lý do kết thúc | Toàn bộ vận hành thuê và báo cáo |
| `contract_tenant` | hợp đồng, khách, vai trò, từ ngày, đến ngày | Nhiều người cùng ở |
| `vehicle` | khách/hợp đồng, loại xe, biển số, từ ngày, đến ngày, trạng thái | Phí xe và tìm kiếm |
| `contract_event` | hợp đồng, loại gia hạn/chuyển phòng/phá HĐ/kết thúc, ngày hiệu lực, lý do chuẩn, mô tả, người duyệt | Audit và báo cáo biến động |
| `contract_document` | hợp đồng/gói OCR, loại file, hash, phiên bản, ngày tải, người tải, trạng thái | Hợp đồng số và chống xử lý trùng file |
| `ocr_job` | tài liệu, loại hợp đồng, engine/version, thời điểm chạy, trạng thái, lỗi, idempotency key | Theo dõi một lần OCR và xử lý lại an toàn |
| `ocr_field` | job, field path, raw text, normalized value, confidence, trang/bounding box, trạng thái accept/edit/reject, người xác nhận | Truy vết từng dữ liệu về tài liệu nguồn |
| `ocr_entity_resolution` | job, loại entity tòa/phòng/khách/xe/tài sản/dịch vụ/HĐ, bản ghi đề xuất, candidate đã có, độ khớp, quyết định create/link/update/ignore | Chống trùng và xử lý xung đột |
| `ocr_commit_batch` | job, người duyệt, thời điểm, các ID đã tạo/cập nhật, trạng thái commit/rollback | Ghi gói OCR nhất quán và có thể audit |
| `contract_expiry_task` | hợp đồng, kỳ cảnh báo, số ngày còn lại, người phụ trách, kết quả liên hệ, hạn xử lý, trạng thái, action kế tiếp | Danh sách sắp hết cuối/đầu tháng |

### 5.4. Dịch vụ, chỉ số và hóa đơn

| Thực thể | Trường tối thiểu cần quản lý | Dùng cho |
|---|---|---|
| `service_catalog` | mã, tên, nhóm điện/nước/vệ sinh/mạng/thang máy/xe/máy giặt/khác/điện chung, đơn vị, cách tính | Danh mục dịch vụ thống nhất |
| `service_price` | dịch vụ, phạm vi hệ thống/tòa/phòng/HĐ, từ ngày, đến ngày, đơn giá, bậc giá/hệ số, giá vốn, thuế | Giá bán, giá gốc và biên dịch vụ |
| `contract_service` | hợp đồng, dịch vụ, số lượng, đơn giá snapshot/công thức, từ ngày, đến ngày | Mỗi hợp đồng một bảng giá dịch vụ |
| `meter` | phòng/tòa, loại điện/nước, mã công tơ, hệ số, ngày lắp/tháo, trạng thái | Quản lý thiết bị đo |
| `meter_reading` | công tơ, kỳ, chỉ số cũ/mới, sản lượng, ngày chốt, ảnh, người nhập, trạng thái xác nhận | Tính điện nước và kiểm tra bất thường |
| `billing_period` | mã kỳ, từ ngày, đến ngày, ngày chốt, ngày phát hành, hạn thu, trạng thái mở/khóa | Chạy hóa đơn và đóng kỳ |
| `invoice` | số HĐơn, kỳ, phòng, hợp đồng, khách trả, ngày phát hành, hạn thu, tiền kỳ này, nợ chuyển sang, điều chỉnh, tổng phải thu, trạng thái, phiên bản | Sổ hóa đơn và công nợ |
| `invoice_line` | hóa đơn, loại tiền phòng/cọc/dịch vụ/phạt/điều chỉnh, dịch vụ, số lượng, đơn vị, đơn giá, thành tiền, nguồn chỉ số | Drill-down báo cáo và PDF |
| `invoice_adjustment` | hóa đơn gốc, loại tăng/giảm/hủy, lý do, số tiền, người duyệt, thời điểm | Không sửa âm thầm hóa đơn đã phát hành |

### 5.5. Thu tiền, công nợ và cọc

| Thực thể | Trường tối thiểu cần quản lý | Dùng cho |
|---|---|---|
| `payment` | mã giao dịch, ngày giờ, số tiền, phương thức, tài khoản nhận, nội dung CK, tham chiếu ngân hàng, người nộp, bằng chứng, trạng thái | Sổ tiền vào và đối soát |
| `payment_allocation` | giao dịch, hóa đơn, loại gốc/lãi/phạt/cọc, số phân bổ, thời điểm | Thu một phần/nhiều hóa đơn, tránh đếm trùng |
| `unidentified_receipt` | giao dịch, số tiền chưa khớp, lý do, trạng thái xử lý | Tiền vào chưa xác định |
| `receivable_snapshot` | kỳ, thời điểm mốc M5/M10/M15/cuối kỳ, tòa, quản lý hiệu lực, phải thu, đã thu, quá hạn, phá HĐ | Báo cáo tiến độ bất biến theo thời điểm |
| `deposit_ledger` | hợp đồng, loại phải thu/đã thu/điều chuyển/khấu trừ/hoàn/giữ lại, ngày, số tiền, chứng từ nguồn | Số dư cọc và báo cáo dòng tiền |
| `refund_case` | hợp đồng, ngày trả phòng, cọc gốc, công nợ, khấu hao, sửa chữa, vệ sinh, khoản khác, số hoàn, trạng thái duyệt, ngày hoàn | Danh sách hoàn cọc |
| `refund_deduction` | hồ sơ hoàn, loại khấu trừ, số tiền, mô tả, ảnh/chứng từ, người duyệt | Chi tiết và đối soát khấu trừ |

### 5.6. Chi phí và kết quả kinh doanh

| Thực thể | Trường tối thiểu cần quản lý | Dùng cho |
|---|---|---|
| `expense_category` | mã nhóm cha, mã hạng mục, tên, phân loại giá vốn/cố định/phát sinh/vốn hóa, loại dịch vụ liên quan | Chuẩn hóa taxonomy báo cáo |
| `expense` | số phiếu, ngày chứng từ/hạch toán/thanh toán, nhà cung cấp, hạng mục, số tiền trước thuế/thuế/tổng, trạng thái, chứng từ, ghi chú | Sổ chi phí |
| `expense_allocation` | phiếu chi, tòa/phòng/bộ phận, kỳ, tỷ lệ/số tiền, tiêu thức phân bổ | Lợi nhuận từng tòa |
| `expense_import_job` | file/hash, template/mapping, người tải, thời điểm, trạng thái, tổng/hợp lệ/cảnh báo/lỗi, idempotency key | Import chi phí chưa được quản lý và chống chạy trùng |
| `expense_import_row` | job, sheet/dòng nguồn, raw values, tòa/kỳ/hạng mục đề xuất, fingerprint chống trùng, trạng thái review, expense ID sau commit | Truy vết và sửa từng dòng import |
| `budget_forecast` | kỳ, tòa, hạng mục, dự kiến, phiên bản, người duyệt | Lợi nhuận dự kiến so với thực tế |
| `period_close` | kỳ, phạm vi, trạng thái, thời điểm khóa, người khóa, ghi chú điều chỉnh | Báo cáo không thay đổi sau chốt |
| `metric_definition` | mã chỉ số, tên, công thức phiên bản, nguồn dữ liệu, ngoại lệ, chủ sở hữu nghiệp vụ, hiệu lực | Một công thức dùng chung trên mọi màn hình |
| `report_snapshot` | báo cáo, kỳ, bộ lọc, phiên bản công thức, thời điểm chạy, kết quả, người chạy | Tái lập và kiểm toán báo cáo |

### 5.7. Kinh doanh

| Thực thể | Trường tối thiểu cần quản lý | Dùng cho |
|---|---|---|
| `lead` | mã, họ tên/SĐT, nguồn, loại nguồn nội bộ/đối tác, khu vực quan tâm, sale, team, ngày nhận, trạng thái | Thống kê khách và nguồn |
| `lead_activity` | lead, thời điểm, loại gọi/nhắn/chuyển khách, kết quả, ghi chú | Lịch sử chăm sóc |
| `viewing` | lead, phòng, lịch xem, sale, kết quả đã xem/không đến/từ chối | Tỷ lệ xem và chuyển đổi |
| `reservation` | lead, phòng, từ/đến, phí giữ chỗ, trạng thái | Phòng đang chờ/giữ chỗ |
| `deal` | lead, phòng, quản lý tại thời điểm chốt, ngày giao dịch, giá chốt, cọc, ngày tính tiền, thời hạn HĐ, trạng thái tiền khách, trạng thái ký/nhận phòng | Sổ doanh số và căn cứ gốc |
| `sales_party` | loại nhân viên/CTV/đối tác/team, mã, tên, người đại diện, MST/CCCD, trạng thái, thông tin liên hệ | Chuẩn hóa tên team/CTV đang nhập tự do |
| `commission_recipient_account` | người/team nhận, ngân hàng, số tài khoản đã mã hóa, chủ tài khoản, từ ngày, đến ngày, trạng thái xác minh | Chi hoa hồng an toàn, không ghi STK trong note |
| `commission_policy` | mã/phiên bản, loại nguồn, loại người nhận, loại nhà/tòa, khoảng thời hạn HĐ, mức chuẩn, số tháng chuẩn để prorate, điều kiện đủ hưởng, từ ngày, đến ngày, người duyệt | Tái lập chính sách khác nhau theo tháng |
| `commission_case` | deal, loại căn cứ tiền thuê/cọc bỏ/custom, căn cứ gốc, công thức căn cứ, trạng thái tiền khách, trạng thái đủ điều kiện, chính sách áp dụng, ngoại lệ và lý do | Một hồ sơ tính HH cho một deal/phòng |
| `commission_share` | hồ sơ HH, người/team nhận, mức gốc, nhóm trùng, số người chia, tỷ lệ sau chia, hoa hồng gộp, điều chỉnh, hoa hồng ròng | Một deal chia cho nhiều người/đối tác |
| `commission_adjustment` | phần HH, loại hỗ trợ khách/CTV/giảm/tăng/truy thu/thu hồi, số tiền, lý do, chứng từ, người duyệt | Thay các phép trừ và override thủ công trong công thức Excel |
| `commission_approval` | hồ sơ/phần HH, bước duyệt, trạng thái, người duyệt, thời điểm, ghi chú | Kiểm soát ngoại lệ chưa ký/chưa đủ cọc/bỏ cọc |
| `commission_payout` | số phiếu chi/batch, người nhận, tài khoản snapshot, ngày chi, lần chi, tổng tiền, phương thức, tham chiếu ngân hàng, trạng thái | Ghi nhận `lần 1`, `lần 2` và tổng nhận |
| `commission_payout_allocation` | phiếu chi, phần HH, số tiền phân bổ | Một lần chi trả nhiều phòng hoặc một phần HH trả nhiều lần |

### 5.8. Nhân sự, tài sản, bảo trì và cổ đông

| Thực thể | Trường tối thiểu cần quản lý | Dùng cho |
|---|---|---|
| `org_unit` | mã, tên, loại công ty/phòng/đơn vị vận hành/nhóm/team, đơn vị cha, ngày hiệu lực/kết thúc, trạng thái | Cây tổ chức nhiều cấp như Quản lý Tổng → TPVH/TCKT/TPKD → team |
| `position` | mã chức danh, tên, cấp quản lý, loại Lead/thành viên, đơn vị áp dụng, hiệu lực | TPVH, Trưởng nhóm KD, Lead Team Sale, NVVH, sale, kỹ thuật, kế toán... |
| `employee` | mã, thông tin cá nhân, ngày vào/nghỉ, trạng thái, tài khoản ngân hàng | Danh mục nhân sự |
| `employment_assignment` | nhân viên, đơn vị, chức danh, loại chính/kiêm nhiệm, từ ngày, đến ngày, trạng thái | Lịch sử thuộc tổ chức và điều chuyển |
| `org_lead_term` | đơn vị, Lead, từ ngày, đến ngày, quyết định/người duyệt | Bảo đảm một Lead hiệu lực cho mỗi đội/nhóm |
| `staff_transfer_plan` | nhân viên/tòa nguồn-đích, ngày hiệu lực, trạng thái dự thảo/chờ duyệt/đã duyệt/hiệu lực/hủy, người duyệt | Kế hoạch hiện tại và sắp tới |
| `payroll_period` | kỳ, ngày chốt, trạng thái mở/chờ duyệt/đã chốt/đã chi, người chốt | Kiểm soát bảng lương theo kỳ |
| `payroll_rule` | chức vụ/nhóm, lương cơ bản, phụ cấp, bậc hiệu suất, mức lương/phòng, hiệu lực, công thức phiên bản | Tái lập bảng lương |
| `payroll_input_snapshot` | kỳ, nhân sự, tòa/phòng phụ trách, doanh thu niêm yết/phải thu/thu M1-M3/dịch vụ/thu thêm, nguồn dữ liệu | Khóa đầu vào tính lương và không đổi theo điều chuyển sau này |
| `payroll_adjustment` | kỳ, nhân sự, loại tăng/giảm, số tiền, lý do, chứng từ, người duyệt | Điều chỉnh minh bạch |
| `payroll_result` | kỳ, nhân sự, lương cơ bản, phụ cấp, lương Lead/hỗ trợ, hiệu suất, mức/phòng, lương theo phòng, điều chỉnh, khấu trừ, thực nhận, trạng thái | Bảng lương và audit |
| `asset` | mã, tên, nhóm, tòa/phòng, chủ sở hữu chủ nhà/công ty/cổ đông, nguyên giá, ngày mua, tình trạng, bảo hành, khấu hao | Tài sản, ROI, kiểm kê |
| `inventory_check` | đợt kiểm kê, tài sản, số lượng sổ/thực tế, tình trạng, chênh lệch, ảnh | Kiểm kê và mất/hỏng |
| `maintenance_plan` | loại thiết bị, chu kỳ, lần gần nhất, lần kế tiếp, đơn vị thực hiện, checklist | Lịch bảo dưỡng |
| `work_order` | sự cố/kế hoạch, tòa/phòng/tài sản, mức độ, người xử lý, SLA, trạng thái, chi phí, bằng chứng | Bảo trì và chi phí sửa chữa |
| `shareholder` | mã, thông tin định danh/liên hệ/tài khoản, trạng thái | Danh mục cổ đông |
| `building_share` | tòa/dự án, cổ đông, tỷ lệ, từ ngày, đến ngày, căn cứ | Chia lợi nhuận đúng tòa/kỳ |
| `capital_call`/`capital_payment` | đợt góp, hạn, phải góp, đã góp, ngày góp, bằng chứng | Lịch đóng tiền từng người |
| `profit_distribution` | kỳ, tòa, lợi nhuận được chia, tỷ lệ snapshot, số phải trả, đã trả, ngày trả | Bảng kê chia cổ phần |
| `document` | đối tượng liên kết, loại, tên file, phiên bản, ngày hiệu lực/hết hạn, quyền xem, người tải | Trung tâm tài liệu |
| `audit_log` | người dùng, thời điểm, hành động, đối tượng, giá trị trước/sau, lý do | Truy vết mọi thay đổi nhạy cảm |

## 6. Danh mục chi phí chuẩn cần cấu hình

Nguồn: `nội dung làm web... > Tài chính chung!C6:E32` và hai sheet báo cáo kinh doanh.

| Nhóm báo cáo | Mã đề xuất | Hạng mục |
|---|---|---|
| Giá vốn | `GV-THUE` | Tiền thuê nhà |
| Giá vốn/vốn hóa | `GV-THIETBI` | Mua sắm thiết bị; phải chốt khoản nào ghi nhận một lần, khoản nào khấu hao |
| Giá gốc dịch vụ | `DV-DIEN` | Điện |
| Giá gốc dịch vụ | `DV-NUOC` | Nước |
| Giá gốc dịch vụ | `DV-MANG` | Mạng/Internet |
| Giá gốc dịch vụ | `DV-RAC` | Thu rác |
| Giá gốc dịch vụ | `DV-MOITRUONG` | Phí môi trường |
| Giá gốc dịch vụ | `DV-THANGMAY` | Bảo trì thang máy |
| Vận hành | `VH-LUONG-*` | Lương quản lý, quản lý tổng, trưởng/phó vận hành, nguồn, kinh doanh, vệ sinh, kế toán, sửa chữa, bảo vệ |
| Vận hành | `VH-VANPHONG` | Thuê và dịch vụ văn phòng |
| Bán hàng | `BH-MARKETING` | Marketing |
| Bán hàng | `BH-HOAHONG` | Hoa hồng; xuất hiện trong công thức báo cáo tháng 6 |
| Phát sinh | `PS-SUACHUA` | Sửa chữa, thay thế, bảo trì |
| Phát sinh | `PS-KHAC` | Chi phí khác, bắt buộc có diễn giải/chứng từ |

Danh mục phải có mã ổn định, nhóm cha và hiệu lực; người dùng không nhập tùy ý tên hạng mục mới trong từng phiếu chi.

## 7. Trạng thái và quy tắc nghiệp vụ cốt lõi

### 7.1. Phòng

```text
Sẵn sàng
→ Giữ chỗ/Đang chờ
→ Đang thuê
→ Sắp trống
→ Chờ dọn hoặc Bảo trì
→ Sẵn sàng
```

Thêm trạng thái `Ngừng khai thác` cho phòng không nằm trong mẫu số lấp đầy. Mọi chuyển trạng thái phải có thời điểm và nguồn sự kiện.

### 7.2. Hợp đồng

```text
Nháp → Chờ duyệt/Chờ ký → Hiệu lực
Hiệu lực → Sắp hết hạn (trước 35 ngày)
Hiệu lực/Sắp hết hạn → Gia hạn | Kết thúc đúng hạn | Phá hợp đồng
Phá HĐ/Kết thúc → Chờ quyết toán → Đã quyết toán
```

Mốc cảnh báo 35 ngày có bằng chứng tại `Thông tin khách hàng!G6`.

### 7.3. Hóa đơn và công nợ

```text
Nháp → Đã phát hành → Chưa thu | Thu một phần | Thu đủ | Thu thừa | Quá hạn
Đã phát hành → Điều chỉnh/Hủy bằng chứng từ đối ứng
```

Quy tắc số tiền đề xuất:

```text
Tiền kỳ này = tổng invoice_line của kỳ
Tổng cần thanh toán = Tiền kỳ này + Nợ chuyển sang - Có dư được cấn trừ
Đã thu = tổng payment_allocation hợp lệ
Còn phải thu = Tổng cần thanh toán - Đã thu
```

`Nợ cũ` trên PDF nên là thông tin số dư, không tạo lại doanh thu/nợ gốc lần thứ hai.

### 7.4. Cọc

Số dư cọc phải được tính từ sổ `deposit_ledger`, không lấy từ một cột có thể bị ghi đè:

```text
Số dư cọc = Cọc đã thu + Cọc nhận điều chuyển
            - Cọc hoàn - Cọc khấu trừ - Cọc chuyển sang hợp đồng khác
```

### 7.5. Phòng trống trên dashboard

Ba nhóm trong yêu cầu web cần chốt thành điều kiện máy tính được:

| Chỉ số | Định nghĩa đề xuất |
|---|---|
| Trống ở luôn trong tháng | Phòng `Sẵn sàng` tại ngày báo cáo và không bị giữ chỗ |
| Trống hết tháng | Hợp đồng kết thúc trong tháng hoặc phòng có `available_date` không muộn hơn cuối tháng |
| Đang chờ | Phòng đã giữ chỗ/chờ khách vào, hoặc chờ dọn; UI phải tách hai nguyên nhân thay vì gộp mơ hồ |

### 7.6. Hiệu suất thu vận hành

Workbook cho thấy hiệu suất nhân viên được tính theo tòa phụ trách và so với doanh thu niêm yết, đồng thời có các mốc thu. Công thức chính xác và bảng bậc lương/phòng chưa có trong các nguồn, nên cần cấu hình thay vì viết cứng.

Đề xuất tách ba KPI:

- `collection_rate = số phân bổ đã thu / số phải thu`.
- `rent_performance = tiền thuê thực thu / doanh thu thuê niêm yết`.
- `service_ratio = doanh thu dịch vụ / tổng doanh thu sau các mốc`.

### 7.7. Hoa hồng

Bốn trạng thái phải tách riêng:

```text
Trạng thái khách: chưa ký → đã ký; chưa đủ tiền → đủ tiền; bỏ cọc/phá HĐ
Trạng thái đủ hưởng: chưa đủ điều kiện → đủ điều kiện | ngoại lệ chờ duyệt
Trạng thái duyệt: nháp → chờ duyệt → đã duyệt | từ chối | thu hồi
Trạng thái chi: chưa chi → chi một phần → đã chi | chi lỗi | đảo chi
```

Trình tự tính đề xuất:

```text
1. Xác định chính sách có hiệu lực tại ngày chốt deal
2. Xác định loại căn cứ và số tiền căn cứ
3. Tính mức chuẩn theo loại nguồn/người nhận/thời hạn
4. Prorate nếu hợp đồng ngắn theo chính sách
5. Chia phần nếu trùng nhiều người/đối tác
6. Áp dụng điều chỉnh được duyệt
7. Khóa hoa hồng ròng phải trả
8. Phân bổ một hoặc nhiều lần chi
```

Các công thức cần lưu cả **đầu vào, kết quả và phiên bản chính sách**, không chỉ lưu con số cuối:

```text
base_rate              = mức chính sách trước chia/prorate
prorated_rate          = base_rate / standard_months × eligible_months
split_rate             = applicable_rate × recipient_share
gross_commission       = basis_amount × split_rate
net_commission_payable = gross_commission + approved_increase - approved_deduction
outstanding_commission = net_commission_payable - payout_allocated - recovered_amount
effective_rate         = net_commission_payable / basis_amount
```

Đối với `BỎ CỌC`, hệ thống phải bắt buộc chọn `basis_type` và chứng từ nguồn. Không được đặt chữ “bỏ cọc” vào cột thời hạn rồi mặc định lấy giá thuê tháng. Trường hợp “trùng” phải liên kết các phần hưởng bằng `duplicate_group_id` và tổng tỷ lệ chia phải được kiểm tra.

Thông tin tài khoản người nhận là dữ liệu nhạy cảm: mã hóa khi lưu, che bớt khi hiển thị, phân quyền xem và snapshot tại thời điểm chi.

## 8. Danh mục báo cáo, công thức và dữ liệu nguồn

### 8.1. Dashboard điều hành

| Báo cáo/KPI | Công thức hoặc hạt dữ liệu | Dữ liệu bắt buộc | Drill-down |
|---|---|---|---|
| Phòng trống ở luôn | Đếm phòng sẵn sàng tại ngày chốt | room, status_history, reservation | Danh sách phòng |
| Phòng trống cuối tháng | Đếm phòng dự kiến sẵn sàng đến cuối tháng | contract.end_date, room.available_date | HĐ sắp hết/phòng chờ dọn |
| Phòng đang chờ | Đếm giữ chỗ và chờ dọn, hiển thị tách nguyên nhân | reservation, room status | Danh sách chi tiết |
| Doanh thu tiền nhà | Tổng dòng hóa đơn loại tiền phòng theo kỳ/trạng thái đã chốt | invoice_line | Hóa đơn/phòng |
| Cọc mới | Tổng dòng sổ cọc loại đã thu trong kỳ | deposit_ledger | Hợp đồng/giao dịch |
| Thu do phá hợp đồng | Tổng phạt/cọc giữ lại đã duyệt | contract_event, refund deduction, payment | Hồ sơ phá HĐ |
| Tiến độ thu | Đã thu/phải thu tại thời điểm snapshot | receivable_snapshot | Theo quản lý/tòa/phòng |

Mọi KPI lọc được theo kỳ, khu vực, trưởng khu vực/trưởng nhóm, quản lý, tòa và loại nhà `T/S/G`.

### 8.2. Báo cáo tài chính và vận hành

| Báo cáo | Công thức lõi đề xuất | Nguồn dữ liệu |
|---|---|---|
| Sổ hóa đơn | Một dòng/hóa đơn; có preset mở rộng giống các cột Excel | invoice, contract, room, building, payment allocation |
| Công nợ | Phải thu - phân bổ đã thu tại ngày báo cáo | invoice, adjustment, allocation |
| Tiến độ thu M5/M10/M15 | Snapshot lũy kế tại từng mốc / phải thu kỳ | receivable_snapshot |
| Hoàn cọc | Cọc gốc - công nợ - khấu hao - sửa chữa - vệ sinh - khác | deposit ledger, refund case |
| Doanh thu dịch vụ | Tổng invoice_line theo loại dịch vụ | invoice_line, service catalog |
| Âm/dương điện nước | Doanh thu điện/nước - giá gốc điện/nước đã phân bổ | invoice_line, expense allocation |
| Giá vốn | Thuê nhà + giá gốc dịch vụ + khoản thiết bị được ghi nhận vào kỳ | expense category/allocation |
| Chi phí cố định | Tổng nhóm vận hành/cố định | expense allocation, payroll |
| Chi phí phát sinh | Marketing + sửa chữa/thay thế/bảo trì + chi khác | expense allocation |
| Lợi nhuận gộp | Doanh thu được công nhận - giá vốn | metric definition |
| Lợi nhuận ròng | Doanh thu được công nhận - tổng chi phí | metric definition |
| Biên tiền nhà | Doanh thu tiền nhà / chi phí thuê nhà | invoice line, head lease cost |
| Lấp đầy | Số room-day đang thuê / room-day có thể khai thác | contract, room status history |
| Thời gian trống | Tổng ngày không có HĐ và sẵn sàng khai thác | room status history, contract |
| Đúng hạn/quá hạn | Hóa đơn thu đủ đúng hạn / hóa đơn đến hạn | invoice, payment allocation |
| Chi phí sửa chữa/vệ sinh | Tổng hạng mục, tách vận hành thường xuyên và khấu trừ cọc | expense, work order, refund deduction |
| Phân khúc khách | Số khách/HĐ/doanh thu theo sinh viên, người đi làm... | tenant.segment, contract, invoice |

### 8.3. Hai báo cáo lợi nhuận phải tách riêng

Yêu cầu web mô tả cả “lợi nhuận dòng tiền” và “lợi nhuận kinh doanh”. Hai chỉ số không được dùng lẫn:

1. **Lợi nhuận/dòng tiền thực thu:** thu tiền thực tế, có thể bao gồm cọc mới; trừ chi tiền thực tế, gồm hoàn cọc và mua thiết bị theo cách nhìn dòng tiền.
2. **Kết quả kinh doanh:** doanh thu thuê + dịch vụ + khoản phạt được công nhận; trừ giá vốn và chi phí kỳ. Loại cọc còn phải hoàn, hoàn cọc và khoản mua thiết bị được vốn hóa.

Phần “mua thiết bị ghi nhận một lần hay khấu hao”, “cọc mới có tính vào lợi nhuận nào” phải được kế toán phê duyệt trong `metric_definition`.

### 8.4. Báo cáo kinh doanh

| Báo cáo | Hạt dữ liệu | Chỉ tiêu chính |
|---|---|---|
| Tổng quan hàng hóa | phòng/ngày | khả dụng, giữ chỗ, đã chốt, đã nhận, phát sinh trả phòng |
| Sổ doanh số | deal | 15 trường đúng mô tả nguồn |
| Báo cáo khách | lead | nguồn, sale, team, khu vực, xem/chốt |
| Chuyển đổi | funnel theo cohort | khách xem → khách chốt; phải chốt mẫu số theo ngày nhận lead hay ngày xem |
| Sổ hoa hồng chi tiết | commission share | deal/phòng, căn cứ, chính sách, mức gốc, prorate, chia trùng, điều chỉnh, gộp/ròng, người/team nhận |
| Công nợ hoa hồng | commission share − payout allocation | đủ hưởng, đã duyệt, đã chi, còn phải chi, thu hồi |
| Chi hoa hồng | payout/allocation | số phiếu, lần chi, người nhận, tài khoản snapshot, các phòng được gộp, tổng chi |
| Hiệu quả nguồn/đối tác | sales party/kỳ | số lead, số chốt, giá chốt, HH gộp/ròng, effective rate, chi phí HH/phòng |
| Ngoại lệ hoa hồng | commission case | bỏ cọc, chưa ký/chưa đủ tiền nhưng đã chi, trùng, hỗ trợ, override, thiếu kết quả |
| Doanh số nhân viên | sale/kỳ | giá trị deal đủ điều kiện, số phòng chốt, tỷ lệ chuyển đổi |

Báo cáo hoa hồng phải có hai trục thời gian độc lập:

- **Kỳ phát sinh/đủ hưởng:** dùng đánh giá doanh số và chi phí hoa hồng phải ghi nhận.
- **Kỳ thực chi:** dùng báo cáo dòng tiền và đối soát ngân hàng.

Bộ lọc tối thiểu: kỳ, khu vực, loại nhà, tòa, quản lý, sale, loại người nhận, team/đối tác, nguồn lead, trạng thái khách, trạng thái đủ hưởng/duyệt/chi, thời hạn HĐ, mức hoa hồng và loại ngoại lệ.

### 8.5. Báo cáo nhân sự

- Cây tổ chức theo ngày tham chiếu, Lead và tuyến báo cáo.
- Danh sách nhân sự, chức vụ, thâm niên và trạng thái.
- Số tòa/phòng quản lý hiện tại và sắp tới theo phân công đã duyệt; cảnh báo thiếu/trùng phụ trách.
- Doanh thu niêm yết, phải thu, thu tại từng mốc và thu thêm.
- Hiệu suất, phiên bản bậc lương/phòng, lương cơ bản, từng phụ cấp, lương Lead/hỗ trợ, điều chỉnh/khấu trừ, tổng lương và thực nhận.
- So sánh nhân sự/khu vực/tòa theo kỳ.

### 8.6. Báo cáo cổ đông

- Tỷ lệ sở hữu theo tòa và thời gian.
- Phải góp, đã góp, còn thiếu và lịch đóng tiền.
- Lợi nhuận được chia/đã trả.
- Tài sản theo nguồn vốn/chủ sở hữu.
- Số dư cọc liên quan tòa.
- Lợi nhuận/vốn và lợi nhuận/tài sản.

Tất cả phải lọc theo tòa và thời gian như yêu cầu tại `TT CỔ ĐÔNG!A2:F5`.

## 9. Các vấn đề chất lượng dữ liệu phải xử lý trước khi migration

| Vấn đề | Bằng chứng | Rủi ro | Cách xử lý |
|---|---|---|---|
| Số phòng mâu thuẫn | `HD theo tòa!C4` ghi 458 nhưng có 506 dòng mã duy nhất | Sai mẫu số lấp đầy/lương | Chốt định nghĩa 458 là phòng khai thác, phòng tính lương hay số khác; lập danh mục phòng chuẩn |
| Nhiều miền nghiệp vụ trong một dòng | `HD theo tòa` có 70 cột | Cập nhật ghi đè, không có lịch sử | Tách bảng như mục 5 |
| Số là chuỗi, đơn vị lẫn lộn | Đơn giá có dạng `4`/`4.000`, `120`/`120.000`; tiền có dấu chấm trong chuỗi | Tính sai hệ số 1.000 | Quy tắc import theo từng cột, staging và xác nhận tổng |
| Ngày không chuẩn | Có ngày dạng text, serial Excel và giá trị chỉ là năm | Cảnh báo sai hạn | Parse vào staging; dòng không chắc chắn phải review |
| Thiếu dữ liệu hợp đồng | 465/506 dòng thiếu ngày vào, thời hạn, hết hạn | Không dự báo phòng trống/hết hạn | Bổ sung từ file hợp đồng hoặc xác nhận thủ công |
| Lỗi tham chiếu | 30 `#REF!` ở thu tiền; 3 ở bảng lương | Báo cáo/lương sai | Không nhập lỗi; tính lại từ chứng từ gốc |
| Công thức phụ thuộc file ngoài | 12 công thức ở báo cáo tháng 6 | Không tái lập được báo cáo | Chuyển công thức vào metric registry và dữ liệu nội bộ |
| Số tổng không có công thức | Hầu hết sheet tháng 8, hóa đơn, thu tiền là giá trị dán | Không biết lineage | Migration chỉ xem là số kiểm tra, không là nguồn giao dịch |
| Tên người không đồng nhất | Ví dụ “Nguyễn Văn Ngọc Khải” và “Nguyễn Ngọc Văn Khải” | Tách một người thành hai | Master nhân sự có mã; lập bảng alias khi import |
| Mã phòng khác hoa/thường | Ví dụ `402s44`, `301t7` | Trùng mã giả | Chuẩn hóa uppercase, bỏ khoảng trắng nhưng giữ giá trị gốc |
| Không có ID giao dịch | Chỉ có tổng đã đóng | Không kiểm toán/thu một phần | Nhập lịch sử giao dịch ngân hàng/phiếu thu và allocation |
| Trạng thái là kết quả nhập tay | `Đủ/Thiếu/Thừa/Chưa TT` | Trạng thái lệch số dư | Hệ thống tự tính từ số phải thu và phân bổ; chỉ cho override có lý do |
| Cấu trúc sổ HH đổi theo tháng | Cột phòng dịch từ B sang C rồi D; quản lý chỉ xuất hiện rõ từ 08/2026; có tháng hai cột cùng tên `Tình trạng tt` | Import lệch cột, hiểu sai trạng thái | Mapping riêng theo sheet/kỳ, không import theo vị trí cố định |
| Thời hạn và căn cứ HH bị trộn | Cột thời hạn chứa `12th`, `6th` và `BỎ CỌC` | Không thể áp đúng chính sách | Tách `contract_term_months` và `commission_basis_type` |
| Ô gộp dùng để biểu diễn người/team nhận | `TỔNG NHẬN`, `Team`, STK thường chỉ nằm ở dòng đầu của nhiều phòng | Mất quan hệ khi đọc từng dòng | Bung ô gộp vào staging rồi tạo share và payout allocation |
| Trạng thái và ngày chi bị trộn | Cột `Ngày TT` chứa ngày, `Đã tt`, `Xong`, ghi chú chuyển tiền | Không tính được tuổi công nợ HH | Tách status, paid_at, payment_round, bank_reference, note |
| Công thức HH nhiều ngoại lệ | 5.657 công thức; ít nhất 155 công thức mức HH, 35 công thức căn cứ; 10 dòng thiếu thành tiền | Không tái lập được nếu chỉ lưu kết quả | Lưu rule version, inputs, adjustments và kết quả đã duyệt |
| Trùng/đồng hưởng nhập trong ghi chú | 117 dòng liên quan “trùng”, có chia 2/chia 3 | Trả thừa hoặc thiếu | Tạo duplicate group và kiểm tra tổng phần chia |
| Tên team/CTV và tài khoản tự do | Hàng chục nhãn team mỗi tháng, STK/chủ TK nằm chung chuỗi | Trùng đối tác, lộ dữ liệu nhạy cảm | Master sales party, alias, tài khoản mã hóa và xác minh |
| Không có khóa deal/phiếu chi | Mã phòng có thể lặp giữa kỳ hoặc giữa nhiều người hưởng | Đếm trùng doanh số/hoa hồng | Sinh deal ID, commission case ID, share ID và payout ID |

## 10. Phân quyền và phạm vi dữ liệu

| Vai trò | Phạm vi và quyền chính |
|---|---|
| Admin | Danh mục, tài khoản, công thức, toàn hệ thống |
| Ban điều hành | Xem dashboard/báo cáo toàn hệ thống, duyệt ngoại lệ |
| Kế toán | Kỳ, hóa đơn, thu/chi, cọc, hoàn cọc, duyệt/chi/đối soát hoa hồng, khóa kỳ, báo cáo |
| Trưởng khu vực/trưởng nhóm | Xem và duyệt trong khu/tòa được giao |
| Quản lý/vận hành | Khách, HĐ, chỉ số, hóa đơn nháp, công nợ và sự cố tại tòa được giao |
| Kinh doanh | Lead, lịch xem, giữ chỗ, deal và hoa hồng của cá nhân/team; không xem đầy đủ STK người khác |
| Nhân sự | Hồ sơ nhân viên, quy tắc lương, bảng lương |
| Kỹ thuật/vệ sinh | Công việc, checklist và bằng chứng được phân công |
| Cổ đông | Chỉ xem tòa/kỳ/tài liệu thuộc phần sở hữu được cấp |

Các thao tác phát hành/hủy hóa đơn, sửa giá, phân bổ thu, duyệt hoàn cọc, áp chính sách/override/duyệt/chi/thu hồi hoa hồng, sửa tỷ lệ cổ đông, chốt lương và khóa kỳ bắt buộc ghi audit log.

## 11. Kế hoạch chuyển dữ liệu và đối soát

### 11.1. Thứ tự migration

1. Chuẩn hóa mã khu vực, loại nhà, tòa và phòng.
2. Chuẩn hóa nhân sự, alias tên và lịch sử phân công.
3. Nhập chủ nhà, hợp đồng đầu vào và lịch trả tiền.
4. Nhập khách, hợp đồng thuê, người ở, phương tiện và dịch vụ.
5. Nhập số dư đầu kỳ: công nợ, cọc, thu thừa.
6. Nhập kỳ hóa đơn gần nhất, chỉ số, dòng hóa đơn và trạng thái.
7. Nhập giao dịch thu/chi hoặc tạo chứng từ số dư có phê duyệt nếu lịch sử thiếu.
8. Nhập dữ liệu phá hợp đồng/hoàn cọc đang mở.
9. Chuẩn hóa sale/CTV/đối tác/team, alias tên và tài khoản nhận; nhập phiên bản chính sách hoa hồng.
10. Nhập deal, hồ sơ/phần hoa hồng, điều chỉnh và các lần chi từ 21 sheet; các dòng chưa nối được deal đưa vào hàng chờ đối soát.
11. Nhập tài sản, lịch bảo trì, cổ đông và số dư vốn.
12. Chạy báo cáo song song với Excel ít nhất hai kỳ và ký biên bản chênh lệch.

### 11.2. Quy tắc staging

- Giữ nguyên `source_file`, `source_sheet`, `source_row`, `raw_value` cho từng bản ghi nhập.
- Không đưa dòng lỗi trực tiếp vào bảng nghiệp vụ.
- Mỗi dòng có trạng thái `valid`, `warning`, `error`, `approved_override`.
- Với sổ hoa hồng, staging phải ghi cả địa chỉ ô gộp nguồn và giá trị được kế thừa từ dòng đầu nhóm; không tự coi ô trống là không có team/người nhận.
- Báo cáo đối soát phải chỉ ra tổng nguồn, tổng nhập, chênh lệch và danh sách dòng gây chênh.

### 11.3. Bộ số liệu nghiệm thu ban đầu

Hệ thống phải tái lập hoặc giải thích được chênh lệch đối với:

- 103 tòa trong báo cáo thu ngày 16/09/2026, cơ cấu 35 T/53 S/15 G.
- Tổng phải thu 7.736.857.817 đồng, thực thu 7.616.495.529 đồng và tỷ lệ 98,4%.
- 20 phòng phá hợp đồng, phải thu 16.048.000 đồng, đã thu 3.662.000 đồng.
- Báo cáo tháng 8 theo toàn hệ thống và từng loại T/S/G tại mục 3.3.
- Báo cáo G1 tháng 6 và bảng chia 100% cổ phần tại mục 3.4.
- Sheet hóa đơn/phòng tháng 9: 506 mã dòng và cơ cấu trạng thái 452/25/22/5/2; đồng thời phải có biên bản giải thích vì sao nguồn lại ghi 458 tại `C4`.
- Sổ hoa hồng: 2.160 dòng phát sinh; đối soát riêng từng tháng giữa tổng `Thành tiền`, tổng các phần hưởng và tổng phân bổ đã chi.
- Tháng 09/2025: 253 dòng, tổng thành tiền khoảng 413.325.855 đồng; tháng 09/2026: 265 dòng, khoảng 481.510.295 đồng.
- 10 dòng thiếu thành tiền, các dòng bỏ cọc, trùng và hỗ trợ phải được đưa vào danh sách ngoại lệ, không làm biến mất để ép khớp tổng.

## 12. Phạm vi triển khai đề xuất

### Giai đoạn 0 – Khóa định nghĩa và dữ liệu gốc

- Chốt danh mục tòa/phòng/nhân sự/loại nhà.
- Chốt công thức KPI, cách hạch toán cọc/thiết bị/phá hợp đồng và ma trận chính sách hoa hồng theo từng giai đoạn.
- Chốt mapping OCR, khóa dò trùng, quyền xác nhận và danh mục dịch vụ/tài sản/xe.
- Làm staging/import và báo cáo chất lượng dữ liệu.

### Giai đoạn 1 – Phạm vi ưu tiên đã cập nhật

Định hướng của `phase1.md` được chuẩn hóa thành hai chuỗi triển khai chính:

```text
Chuỗi thuê:
Hợp đồng/OCR → Tòa → Phòng → Khách hàng → Hóa đơn
→ Thu tiền/công nợ → Kết thúc/quyết toán/hoàn cọc → Tổng quan

Chuỗi nội bộ:
Tổ chức → Nhân viên/chức danh/phân công → Bảng lương
```

“Hợp đồng/OCR” là điểm bắt đầu trên giao diện nhưng không phá vỡ quan hệ dữ liệu: hệ thống dò hoặc đề xuất tòa/phòng/khách, người dùng xác nhận, sau đó mới ghi theo thứ tự phụ thuộc.

Phạm vi bắt buộc:

1. Upload/OCR hợp đồng, review từng field, dò trùng và tạo/liên kết tòa, phòng, khách, hợp đồng, dịch vụ, tài sản, xe.
2. Quản lý tòa/phòng và trạng thái phòng tối thiểu để hợp đồng có thể vận hành.
3. Hồ sơ khách, người đứng tên/người ở cùng và vòng đời khách thuê.
4. Ngày hết hạn HĐ, cảnh báo 35 ngày và danh sách xử lý cuối tháng/đầu tháng; gia hạn hoặc kết thúc có kiểm soát.
5. Dịch vụ hợp đồng, chỉ số điện/nước, lập/phát hành hóa đơn; gửi thông báo/Zalo nếu kênh tích hợp sẵn sàng.
6. Thu tiền, phân bổ, công nợ và các mốc M1/M2/M3 tương ứng ngày 05/10/15.
7. Trả phòng/phá HĐ, quyết toán, khấu trừ, hoàn cọc và đưa phòng qua `Chờ dọn → Sẵn sàng`.
8. Tổng quan phòng, hợp đồng sắp hết, phải thu/đã thu/còn nợ/quá hạn và việc cần xử lý.
9. Cây tổ chức, đơn vị, chức danh, nhân viên, Lead, phân công tòa hiện tại/sắp tới và lịch sử điều chuyển.
10. Bảng lương vận hành từ snapshot tòa/phòng, doanh thu và hiệu suất theo kỳ.
11. Hai dạng báo cáo đã có bằng chứng trong `Timohouse.xlsx`: báo cáo chi tiết một nhà/kèm chia cổ phần và báo cáo kinh doanh tổng hợp toàn hệ thống theo `T/S/G`; số liệu phải sinh từ chứng từ hệ thống.
12. Import các chi phí chưa được hệ thống quản lý trực tiếp, qua staging/mapping/review; không nhập lại chi phí đã sinh từ hợp đồng đầu vào, điện nước, bảng lương hoặc chứng từ nội bộ.

Ngoài phạm vi lõi Phase 1: CRM pipeline đầy đủ, engine hoa hồng tự động hoàn chỉnh, bảo trì nâng cao, cổng cổ đông và BI tùy biến. Tuy nhiên mô hình dữ liệu Phase 1 không được chặn việc bổ sung các phần này.

### Giai đoạn 2 – Quản trị kinh doanh và vận hành

- Quản lý chi phí/phân bổ đầy đủ, ngân sách và báo cáo dòng tiền nâng cao.
- CRM, sổ doanh số, nguồn khách và engine hoa hồng có phiên bản/chia phần/điều chỉnh/duyệt/chi nhiều lần.
- Vòng đời tài sản đầy đủ, bảo trì/bảo dưỡng, trung tâm tài liệu.
- Chụp snapshot M5/M10/M15 và đóng kỳ.

### Giai đoạn 3 – Quản trị doanh nghiệp

- Cổ đông, vốn góp, chia lợi nhuận, cổng xem cho cổ đông.
- Khấu hao tài sản, dự báo, data warehouse và BI nâng cao.

## 13. Các câu hỏi bắt buộc phải chốt

1. `T/S/G` là loại nhà, nhóm đầu tư, khu vực hay mô hình vận hành? Một tòa có được đổi loại theo thời gian không?
2. Con số 458 tại `HD theo tòa!C4` đại diện cho gì khi có 506 mã dòng?
3. “Phòng trống ở luôn trong tháng”, “trống hết tháng” và “đang chờ” có bao gồm giữ chỗ/chờ dọn/bảo trì không?
4. Tiền cọc mới chỉ nằm trong báo cáo dòng tiền hay được tính vào “tổng doanh thu” quản trị? Khi nào cọc bị giữ trở thành thu nhập?
5. Mua sắm thiết bị ghi nhận toàn bộ vào kỳ hay khấu hao; quy tắc theo giá trị/loại tài sản là gì?
6. “Lợi nhuận thực thu”, “lợi nhuận dòng tiền”, “lợi nhuận kinh doanh” và “lợi nhuận dự kiến” có công thức chính thức nào?
7. `Thu khác` trong hóa đơn gồm những loại nào; có khoản nào là thu thừa hoặc cọc không?
8. Đặc tả mới xác định M1/M2/M3 tương ứng ngày 05/10/15; nếu hạn rơi vào ngày nghỉ thì giữ nguyên hay chuyển sang ngày làm việc kế tiếp?
9. Tỷ lệ thu trên 100% được tính là hiệu suất vượt mức hay phải tách thu thừa/thu nợ cũ?
10. Bảng lương dùng mẫu số 1.079 hay 1.303 phòng; công thức bậc `hiệu suất → mức lương/phòng` là gì?
11. Điều kiện deal/hoa hồng đủ ghi nhận và đủ chi là đặt cọc, ký HĐ, vào ở hay thu đủ? Ai được duyệt ngoại lệ khi file có dòng `chưa ký HĐ/chưa TT đủ/bỏ cọc` nhưng đã chi?
12. “Danh sách khách hoà” tại `Thông tin khách hàng!G11` thực chất là danh sách gì?
13. Cổ đông sở hữu trực tiếp từng tòa hay thông qua dự án/pháp nhân? Tỷ lệ có thay đổi theo kỳ không?
14. Các giá `4`, `120`, `100` trong sheet hóa đơn là đơn vị nghìn đồng hay dữ liệu đã rút gọn theo định dạng?
15. Cần giữ bao nhiêu năm dữ liệu và chứng từ; kỳ đã khóa có được mở lại, ai có quyền?
16. Ma trận mức 15%/25%/30%/35%/50%/65% theo loại nguồn, sale/CTV/đối tác và thời hạn có thay đổi ở những mốc ngày nào?
17. Công thức prorate HĐ ngắn dùng mẫu số 6 tháng hay mẫu số khác theo từng chính sách; làm tròn tỷ lệ/số tiền ở bước nào?
18. “Trùng” được xác định theo SĐT khách, lead, phòng, giao dịch hay quyết định thủ công; thứ tự ưu tiên và tỷ lệ chia 2/chia 3 thế nào?
19. Hoa hồng cho khách bỏ cọc tính trên toàn bộ cọc giữ lại hay cọc sau khi trừ tiền ở/dịch vụ; trường hợp nào không được hưởng?
20. `Team` trong file là nguồn lead, đối tác nhận tiền, nhóm sale hay cả ba; có trường hợp team và người nhận tiền khác nhau không?
21. Khoản hỗ trợ/fix là giảm doanh thu, giảm hoa hồng người nhận hay chi phí riêng của công ty; ai phê duyệt?
22. Khi khách phá HĐ sớm, hoàn cọc hoặc giao dịch bị hủy sau khi đã chi hoa hồng thì có thu hồi/clawback không, thu hồi từ ai và vào kỳ nào?
23. Chi phí hoa hồng được ghi nhận khi deal đủ điều kiện, khi duyệt hay khi thực chi; báo cáo lợi nhuận hiện tại đang dùng mốc nào?
24. Phase 1 OCR áp dụng loại hợp đồng thuê phòng nào; có xử lý cả hợp đồng đầu vào với chủ nhà trong cùng luồng không?
25. Nếu OCR đọc được tòa/phòng chưa tồn tại, ai được quyền duyệt tạo mới; cần bắt buộc bổ sung những field nào trước khi kích hoạt hợp đồng?
26. Bộ mẫu hợp đồng hiện có bao nhiêu biến thể; ảnh chụp/scan viết tay và phụ lục được hỗ trợ đến mức nào?
27. Khi OCR và master hiện tại khác giá, ngày, dịch vụ, xe hoặc tài sản, vai trò nào được quyền chọn cập nhật dữ liệu master?
28. Danh sách HĐ sắp hết được chụp vào ngày nào cuối/đầu tháng, có cần giữ lịch sử từng lần chụp và SLA liên hệ không?
29. Tài sản OCR từ hợp đồng chỉ là danh sách bàn giao hay tạo luôn tài sản kế toán; cách xác định tài sản của chủ nhà/công ty/cổ đông?
30. Phase 1 dùng chính xác công thức, bậc hiệu suất và mức lương/phòng nào; ai duyệt và khóa bảng lương?
31. Hai báo cáo Phase 1 cần khớp nguyên mẫu tháng 6/tháng 8 đến mức cột nào, hay chỉ cần cùng công thức và bộ lọc?
32. Danh sách “chi phí chưa quản lý” gồm những nhóm nào và khóa nào dùng để chống import trùng với thuê nhà, điện nước, bảng lương hoặc phiếu chi nội bộ?

## 14. Tiêu chí hoàn thành để web sinh báo cáo đáng tin cậy

- Một mã phòng chỉ thuộc một tòa và không trùng sau khi chuẩn hóa.
- Một gói OCR phải cho review, create/link/update/ignore từng entity; xác nhận lặp lại không tạo trùng và lỗi bắt buộc không để lại nửa gói dữ liệu.
- Mọi field tạo từ OCR truy được về file, trang/vùng nguồn, confidence, giá trị ban đầu và người xác nhận.
- Mỗi hợp đồng có đủ ngày hiệu lực, giá/cọc, trạng thái và bảng giá dịch vụ snapshot.
- Hợp đồng vào ngưỡng 35 ngày xuất hiện đúng trong danh sách cuối/đầu tháng, có người phụ trách và kết quả xử lý; hệ thống không tự gia hạn/kết thúc.
- Trạng thái vòng đời khách được suy ra đúng từ hợp đồng/quan hệ cư trú/quyết toán/hoàn cọc; khách quay lại dùng lại hồ sơ cũ.
- Mỗi hóa đơn có dòng chi tiết; tổng hóa đơn bằng tổng dòng sau điều chỉnh.
- Mỗi đồng “đã thu” truy được tới giao dịch và phân bổ; không nhập trực tiếp tổng đã thu.
- Mỗi số công nợ tái lập được tại một ngày quá khứ.
- Mỗi chi phí có hạng mục chuẩn, kỳ và tòa/phương pháp phân bổ.
- Mỗi đồng hoa hồng truy được từ deal → chính sách → căn cứ → phần chia/điều chỉnh → phê duyệt → lần chi; tổng phân bổ không vượt số ròng được duyệt trừ khi có override có audit.
- Cây tổ chức, một Lead hiệu lực/đội và phân công tòa hiện tại/sắp tới được tính theo ngày; điều chuyển tương lai không làm đổi hiện trạng trước ngày hiệu lực.
- Bảng lương đã chốt truy được về snapshot nhân sự, tòa/phòng và số liệu thu trong kỳ; điều chuyển sau kỳ không làm đổi lương cũ.
- Chi phí import qua staging chỉ được ghi nhận sau review và không trùng chi phí hệ thống đã quản lý.
- Mỗi KPI công khai công thức, phiên bản và thời điểm chụp dữ liệu.
- Báo cáo cùng bộ lọc kỳ/khu/tòa/nhân sự cho cùng kết quả ở dashboard, màn danh sách và file xuất.
- Kỳ đã khóa không thay đổi nếu không có quy trình mở lại và audit.
- Vai trò chỉ xem/sửa đúng tòa, khu vực, phòng ban hoặc phần sở hữu được cấp.
- Đối soát song song với Excel đạt ngưỡng chênh lệch đã thống nhất và mọi chênh lệch đều có danh sách chứng từ giải thích.

## 15. Phụ lục – ánh xạ sheet sang phân hệ web

| Sheet nguồn | Bản chất dữ liệu | Phân hệ đích |
|---|---|---|
| `HD theo tòa` | Dòng tổng hợp phòng + HĐ + chỉ số + hóa đơn + thu + công nợ | Phòng, HĐ, Meter, Billing, Payment, Receivable |
| `HD` | Mẫu PDF/thông báo hóa đơn | Invoice template/Document/Notification |
| `Cập nhật thu tiền` | Snapshot thu theo quản lý và tòa | Collection dashboard/Receivable snapshot |
| `DS phòng phá hợp đồng` | Sự kiện kết thúc bất thường và khoản phải thu | Contract event/Final settlement/Refund |
| `Báo cáo tháng 6` | P&L một tòa + chia cổ phần | Report engine/Investment distribution |
| `Báo cáo kinh doanh Tháng 8` | P&L toàn hệ thống và T/S/G | Management P&L |
| `Bảng lương` | Hiệu suất thu theo tòa và lương vận hành | HR/Assignment/Payroll |
| `Tổng quan` | KPI dashboard mong muốn | Executive dashboard |
| `Khu nhà và toàn nhà` | Chủ nhà, hợp đồng đầu vào, tòa, tài sản | Property/Head lease/Asset/Legal |
| `Thông tin khách hàng` | Khách, lưu trú, HĐ, dịch vụ, Zalo | Tenant/Contract/Service |
| `Tài chính chung` | Hóa đơn, công nợ, chi phí, hoàn cọc | Finance |
| `KINH DOANH` | Hàng hóa, doanh số, khách, hoa hồng | CRM/Sales |
| 21 sheet `HOA HỒNG THÁNG ...` | Deal, căn cứ/mức HH, chia trùng, team/người nhận, tổng nhận, trạng thái/lần chi và STK | Commission engine/Approval/Payout/Reconciliation |
| `Plan-audit.md` | Chuỗi vận hành, OCR có duyệt, vòng đời khách, trạng thái, cơ cấu tổ chức và phân công theo thời gian | Core rental/OCR/Customer lifecycle/Organization |
| `phase1.md` | Thứ tự ưu tiên hợp đồng → tổng quan; tổ chức → lương; hai báo cáo; OCR và import chi phí | Phase 1 backlog/Release scope |
| `BÁO CÁO` | Danh mục chỉ số và bộ lọc | Report hub/Metric registry |
| `NHÂN SỰ` | Hồ sơ và tính lương theo phòng ban | HR/Payroll |
| `TT CỔ ĐÔNG` | Cổ phần, góp vốn, tài sản, cọc | Investment |
| `BẢO TRÌ BẢO DƯỠNG` | Lịch thiết bị và kiểm kê | Maintenance/Asset |

---

**Kết luận:** Cơ sở dữ liệu web phải lấy **chứng từ và lịch sử biến động** làm nguồn chuẩn; dashboard và báo cáo chỉ đọc từ nguồn đó. Nếu tiếp tục duy trì cách nhập “một dòng phòng chứa mọi thứ” hoặc dùng ô gộp/ghi chú làm quan hệ người nhận như Excel, hệ thống có thể hiển thị giao diện đẹp nhưng không thể bảo đảm công nợ, lợi nhuận, hoa hồng, lương và chia cổ phần tái lập được theo thời gian.
