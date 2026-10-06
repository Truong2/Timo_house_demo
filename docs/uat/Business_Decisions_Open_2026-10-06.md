# TimoHouse — Business Decision Log (06/10/2026)

Sổ này tách quyết định nghiệp vụ khỏi trạng thái code. Các giá trị mặc định trong SRS có thể dùng cho demo/đối chiếu; không coi là phê duyệt production cho tới khi người có thẩm quyền xác nhận.

## Các quyết định cần xác nhận

| Mã SRS | Cần chốt | Căn cứ/hiện trạng | Đầu ra cần ghi nhận |
|---|---|---|---|
| C-15, C-25 | Bảng phase chuẩn cho từng FR; phase hiển thị báo cáo âm/dương. | SRS và `00_SCOPE_3_PHASE.md` xếp CRM/OCR/hoa hồng/bảo trì/cổ đông/tài sản/nhân sự/báo cáo khác nhau. | Bảng phase duy nhất, ngày hiệu lực, người duyệt. |
| C-01 | Điều kiện và chuyển trạng thái cho ba nhóm phòng trống. | Nguồn nêu tên nhóm nhưng chưa mô tả điều kiện vào/ra. | Định nghĩa từng nhóm và tối thiểu một ví dụ biên cho mỗi chuyển trạng thái. |
| C-02 | Hoàn cọc có bị loại khỏi Báo cáo Kinh doanh không? Mode nào là chính thức? | SRS giữ `BUSINESS_V1_WORKBOOK`; code web hiện có mode loại hoàn cọc và audit PASS theo mode đó. | Một công thức được duyệt, Golden fixture kỳ mới, quy tắc giữ nguyên snapshot kỳ đã khóa. |
| C-03…C-06 | Công thức lương các bộ phận; cách tính phụ cấp/niên hạn và ngoại lệ đã nêu trong SRS. | `SALARY-MODE` đã PASS về cơ chế, chưa có đủ căn cứ xác nhận mọi policy. | Bảng công thức theo phòng ban/chức danh, ví dụ số, người duyệt và hiệu lực. |
| C-07, C-26, C-29 | Các khoản cấu thành `TOTAL_REVENUE`; tiền cọc tính theo số đã thu hay số trên hợp đồng. | SRS có default theo workbook nhưng nêu các khoản included/excluded còn mở. | Danh mục khoản thu, cơ sở ngày/kỳ, xử lý khoản thu thiếu/khác kỳ. |
| C-08 | Công thức hiệu suất, lợi nhuận và thời gian vận hành của tòa. | SRC-02 mới nêu tên KPI; SRS đang dùng định nghĩa đề xuất. | Công thức, mẫu số, date basis, ví dụ đối chiếu một tòa/kỳ. |
| C-10 | Quy tắc phí gửi xe/sạc xe và cách thể hiện trên hóa đơn/báo cáo. | Web đã lưu hai fee code riêng và tính số lượng độc lập; xác nhận cách phân loại doanh thu vẫn cần ghi nhận. | Bảng đơn giá, đối tượng tính phí, cách gộp/hiển thị, metric báo cáo. |
| C-11 | Báo cáo dự kiến nhập giả định hay sinh từ dữ liệu, ai được sửa/duyệt. | SRC-14 có số nhập tay; SRS đề xuất baseline + giả định có version. | Phạm vi input, người có quyền, quy trình duyệt/version. |
| C-19, C-22 | Kỳ ghi nhận utility/head-lease; mapping dịch vụ; chi phí sửa chữa chia giữa khách/chủ/công ty. | Nguồn có lệch kỳ và khác biệt mapping giữa G1 và báo cáo tháng 8. | Date basis, mapping version, payer rule và ví dụ số. |
| C-27, C-28 | Dịch vụ khi trả trước nhiều tháng; thời điểm tòa rời `SETUP`; xử lý prepaid khi trả phòng giữa kỳ. | Có default trong SRS nhưng nguồn chưa đủ để xác nhận các ca biên. | Rule, event ngày hiệu lực và cách quyết toán/ghi nhận. |

## Mẫu ghi nhận phê duyệt

Với mỗi dòng cần điền:

```text
Mã quyết định:
Quyết định:
Ví dụ đầu vào → kết quả kỳ vọng:
Ngày hiệu lực:
Người xác nhận / vai trò:
Nguồn hoặc biên bản:
Ảnh hưởng kỳ đã khóa: (không thay đổi / cần phương án migration riêng)
```

Sau khi được xác nhận, cập nhật đồng bộ SRS, `00_SCOPE_3_PHASE.md`, đặc tả màn hình/quy trình trong `docs_timonouse`, formula version và acceptance fixture. Không sửa số kỳ đã khóa chỉ để làm cho nó khớp công thức mới.
