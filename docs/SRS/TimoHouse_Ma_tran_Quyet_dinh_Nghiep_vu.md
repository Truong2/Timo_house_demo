# Ma trận quyết định nghiệp vụ OQ-01…OQ-25

Cập nhật: 03/10/2026 · Đặc tả điều khiển: Draft v1.13.

Tài liệu này là danh sách ký duyệt, không phải câu trả lời thay khách. Cột “Lựa chọn đang dùng” mô tả cấu hình hoặc phương án so sánh hiện tại. Chỉ dòng `confirmed` được dùng cho báo cáo chính thức; dòng `proposed` giữ để rà soát. Không sửa hồi tố kỳ đã khóa.

| Câu hỏi | Lựa chọn đang dùng | Số/kết quả bị ảnh hưởng | Màn hình | Trạng thái | Người xác nhận |
|---|---|---|---|---|---|
| OQ-01 | HS <70 nhập lương/phòng và lý do | W, tổng lương, chi phí quản lý | UI-25, UI-29/30 | proposed | PM/Khách hàng |
| OQ-02 | Mốc SRC-05; ca biên chờ xác nhận | HS, W, tổng lương | UI-24, UI-25 | proposed | PM/Khách hàng |
| OQ-03 | Phá HĐ chỉ thu điện | Phải thu phá HĐ | UI-07, UI-18 | proposed | PM/Khách hàng |
| OQ-04 | Lịch sử theo Excel; web theo phòng có giá | Phân bổ quỹ, LNG/LNR từng tòa | UI-16, UI-29 | proposed | PM/Khách hàng |
| OQ-05 | Giữ số cache Excel khi thiếu giao dịch | Giao dịch nguồn, đối chiếu | UI-28, UI-29 | proposed | PM/Khách hàng |
| OQ-06 | Chỉ công bố khách xem/khách chốt | Tỷ lệ chuyển đổi | UI-01, UI-45, UI-46 | proposed | PM/Khách hàng |
| OQ-07 | Forecast web là bản nháp | DT/TCP/LN dự kiến | UI-40, UI-41 | proposed | PM/Khách hàng |
| OQ-08 | Chênh làm tròn thành dòng riêng | H/I/J/M bảng kê | UI-32, UI-33 | proposed | PM/Khách hàng |
| OQ-09 | Admin/kế toán thấy tiền; vận hành chỉ trạng thái | Số công nợ hiển thị/xuất | UI-13, UI-14 | confirmed | Khách hàng |
| OQ-10 | Chính thức theo sheet Excel; công thức mới để so sánh | LNR T8: 685.928.969 chính thức; 790.331.663/779.688.893 đề xuất | UI-30 | proposed | PM/Khách hàng |
| OQ-11 | Từng tài sản có tháng KH và nguồn; 63 tháng là legacy | Khấu hao, giá trị còn lại, thanh lý | UI-15, UI-30, UI-34, UI-40 | proposed | PM/Khách hàng |
| OQ-12 | Sau 5 ngày lịch từ ngày phát hành | Ngày chuyển công nợ, đúng hạn | UI-14, UI-45 | confirmed | Khách hàng (CH-14) |
| OQ-13 | Ghi chi phí theo kỳ thực chi từng đợt | Marketing/hoa hồng theo tháng | UI-15, UI-22, UI-29 | proposed | PM/Khách hàng |
| OQ-14 | Giữ cách xử lý khách/chủ nhà hiện tại | Doanh thu, bù trừ chủ nhà | UI-03, UI-05, UI-25 | proposed | PM/Khách hàng |
| OQ-15 | Giữ hai danh mục xe theo Excel | Doanh thu dịch vụ | UI-09, UI-12, UI-43 | proposed | PM/Khách hàng |
| OQ-16 | Không trừ ngày ở thêm mặc định | Tiền hoàn cọc | UI-18 | proposed | PM/Khách hàng |
| OQ-17 | Phân phase theo Draft v1.13 | Phạm vi và rollout | Toàn hệ thống | proposed | PM/Khách hàng |
| OQ-18 | HS báo cáo theo công thức lương SRC-05 | Dashboard, báo cáo phòng | UI-01, UI-25, UI-45 | proposed | PM/Khách hàng |
| OQ-19 | Excel benchmark đặt cạnh forecast web | DT/TCP/LN dự kiến | UI-40 | proposed | PM/Khách hàng |
| OQ-20 | Phòng trống tách khỏi tiền thực thu | Âm/dương điện nước web | UI-10, UI-43 | proposed | PM/Khách hàng |
| OQ-21 | Combo/máy giặt theo chuỗi Excel | Thu điện, âm/dương | UI-29, UI-43 | proposed | PM/Khách hàng |
| OQ-22 | Lịch sử theo Excel; web theo sổ xác nhận | Lương thợ, chi sửa chữa | UI-15, UI-25, UI-44, UI-47 | proposed | PM/Khách hàng |
| OQ-23 | Kỳ sổ 26→25; dòng ngoài kỳ tách riêng | Số việc, công, vật tư | UI-44, UI-47 | proposed | PM/Khách hàng |
| OQ-24 | LN/tài sản chờ đủ chính sách tài sản | LN/vốn, LN/tài sản | UI-41 | proposed | PM/Khách hàng |
| OQ-25 | Hiển thị deal, giá chốt, hủy và cách chia | Doanh số/KPI sale | UI-46 | proposed | PM/Khách hàng |

## Quy tắc ký duyệt

- Khi xác nhận, tạo phiên tham số mới với `effectiveFrom`, `sourceRef`, `approvedBy`, `approvedAt`; không sửa dòng nguồn hoặc câu trả lời trong workbook.
- Snapshot kỳ khóa lưu nguyên `policySnapshot`; thay đổi sau đó chỉ áp dụng cho kỳ mở phù hợp ngày hiệu lực.
- R01/R03–R08 chỉ được đóng khi quyết định tương ứng có nguồn xác nhận và kiểm thử hồi quy đạt.
