# Nguồn dữ liệu cho luồng nhập hợp đồng

Tài liệu này ghi phạm vi từng file trong `docs_timonouse`. Hai PDF ở `docs/contracts_demo` là dữ liệu mẫu đồng bộ TH01 để thử chức năng, không phải hợp đồng khách hàng gửi và không được dùng để thay thông tin thật. File Word hợp đồng trong thư mục gốc dùng đối chiếu; màn trích xuất nhận PDF, JPG, PNG.

| File gốc | Sheet / nội dung | Dùng để tạo hồ sơ | Chỉ đối chiếu |
|---|---|---|---|
| `TimoHouse_Dac_ta_man_hinh_web_va_luong_nghiep_vu_v1.md` | Đặc tả nghiệp vụ | Quy tắc trường, trạng thái và luồng | Không sinh bản ghi |
| `TimoHouse_Plan_Mockup_UI_v1.md` | Kế hoạch UI | Điều hướng và màn hình | Không sinh bản ghi |
| `Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc` | Mẫu hợp đồng chủ nhà | Tên trường/điều khoản khi đối chiếu PDF chuyển đổi | Không tự tạo danh tính/phòng từ mẫu |
| `Hoá đơn tiền nhà tháng 9 và dịch vụ tháng 9 năm 2026.xlsx` | NHÀ T, NHÀ G, NHÀ S, G16–G18 | Mã tòa/phòng, giá niêm yết, giá QL, giá thực tế, cọc cũ, cọc mới, người ở, kỳ trả, phí và chỉ số | Dòng tổng, hóa đơn, trạng thái thu, công nợ và số đã đóng cần đối chiếu chứng từ trước khi ghi sổ |
| Cùng workbook | PHÒNG MỚI THÁNG 7/9/10 | Mã phòng, giá tháng ở cột G, cọc hợp đồng ở cột I, người ở và phí | Cột H là tiền phòng tháng lẻ, không phải giá thuê tháng; chỉ số/ngày chỉ dùng khi đúng loại ô |
| Cùng workbook | HOÀN CỌC, HĐ (HOÀN CỌC), DS phòng phá HĐ, các sheet HĐ, báo cáo/check thu, điện nước phòng trống | Không tạo lượt thuê mới | Đối chiếu kết thúc, hoàn cọc, công nợ và báo cáo |
| `Danh sách mã HĐ điện nước mạng.xlsx` | Sheet1, năm 2026 | Mã hợp đồng nhà cung cấp khi gắn dịch vụ cho tòa đã xác nhận | Tên chủ công tơ không phải chủ sở hữu tòa |
| `G1.31.8.26.xlsx` | ĐẦU TƯ BAN ĐẦU, THU CHI BAN ĐẦU, HĐ T1–T8, BÁO CÁO THÁNG 2–8 | Không tạo hồ sơ mới | Giá thuê chủ nhà theo tháng, nguồn chi và cầu nối báo cáo G1 |
| `Hoa hồng năm 2025-2026 (1).xlsx` | Các tháng 2025–2026 | Không tạo hồ sơ | Đối chiếu hoa hồng/giao dịch kinh doanh |
| `CÁCH TÍNH LƯƠNG PHÒNG VẬN HÀNH.docx` | Cách tính lương | Không tạo hồ sơ | Kiểm tra tác động phân công quản lý |
| `bao_cao/âm dương điện nước tháng 6.xlsx`, `bao_cao/âm dương điện nước tháng 7.xlsx` | Báo cáo điện nước | Không tạo hồ sơ | Kiểm tra đối chiếu điện nước theo tòa |
| `bao_cao/sổ sửa chữa tháng 8(AutoRecovered).xlsx` | Sửa chữa | Không tạo hồ sơ | Kiểm tra tòa/phòng trong sổ sửa chữa |
| `bao_cao/bảng lương tháng 8.xlsx` | Lương | Không tạo hồ sơ | Kiểm tra phân công, báo cáo lương |
| `bao_cao/BẢNG DỰ KIẾN LỢI NHUẬN CÁC THÁNG.xlsx` | Dự kiến | Không tạo hồ sơ | Đối chiếu dòng tiền, không chuyển dự kiến thành thực thu |
| `bao_cao/báo cáo.xlsx`, `bao_cao/BÁO CÁO KINH DOANH THÁNG 8.xlsx` | Báo cáo | Không tạo hồ sơ | Kiểm tra quan hệ tòa, phòng, doanh thu, chi phí |

Hai workbook ở thư mục gốc `nội dung làm web Timehouse 31.8.2026(2).xlsx` và `Cau-hoi-lam-ro-nghiep-vu-Timehouse.xlsx` xác định trường và câu trả lời nghiệp vụ. Chúng không phải bảng dữ liệu hồ sơ để import trực tiếp.

## Ánh xạ nhạy cảm

- `NHÀ G!A11:I11` chứa `302G1`: G = giá niêm yết 4.000.000; H = giá quản lý 3.800.000; I = giá thuê tháng thực tế 3.800.000; F = cọc cũ đang giữ 3.800.000. `AX11` là tổng đã đóng kỳ đó để đề xuất đối chiếu, không là phiếu thu mới.
- `NHÀ G!A5` là `000G1`: phân loại `meter_common`; không tạo lượt thuê phòng.
- Các sheet `NHÀ` có cột F là cọc cũ, G/H/I là ba mức giá, J là cọc mới; các sheet `PHÒNG MỚI` có F/G là giá niêm yết và giá tháng, H là tiền tháng lẻ, I là cọc mới. Các cột `Ngày ở/Ngày DV` là **số ngày**, không phải ngày nhận phòng.
- Ô ngày nhận và hết hạn chỉ lấy khi cột có tiêu đề ngày hợp lệ. Ô công thức phải có giá trị lưu sẵn; thư viện đọc giữ công thức để đối chiếu và không tự tính lại Excel. Ô lỗi hoặc liên kết ngoài phải được người dùng xử lý ở bản nháp.
- Excel hóa đơn thường không có đủ tên, SĐT khách và địa chỉ tòa. Những trường này ở bản nháp cho đến khi có hợp đồng/nguồn bổ sung hoặc nhập tay có xác nhận. Không dùng tên/địa chỉ từ seed để hoàn thiện tự động.
- Cọc cũ cần chọn ngày ghi số dư đầu kỳ; nợ cũ cần chọn kỳ công nợ đầu kỳ. Không lấy ngày bắt đầu hợp đồng làm kỳ nợ và không đoán kỳ từ tên file.

Điểm nhập trong demo: `Chủ nhà → Thêm chủ nhà`, `Khách hàng → Thêm khách hàng`, hoặc `Import dữ liệu → Chủ nhà/Khách hàng`. Cả ba cách nhập đi qua bản nháp, rà soát và cùng bộ kiểm tra trước khi ghi.
