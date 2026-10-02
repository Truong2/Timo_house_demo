# TimoHouse — kế hoạch tạo mockup UI đầy đủ

Ngày lập: 27/09/2026 · Cập nhật: 02/10/2026 · Trạng thái: v1.2 — Phase 3 đã implement và bổ sung ảnh web.

**Tài liệu nền:** `TimoHouse_Dac_ta_man_hinh_web_va_luong_nghiep_vu_v1.md`, nội dung Draft v1.3. Screen ID UI-01…UI-38 giữ nguyên để nối dữ liệu, action và luồng. Yêu cầu cơ cấu team/leader theo ảnh người dùng ngày 28/09/2026 nằm trong UI-23/UI-24 và bộ lọc các màn liên quan. B07/UI-33 và B08/UI-34…36 đã thay ảnh web; B09 bổ sung Phase 3.

## 1. Phạm vi và kết quả cần có

- Web admin desktop với sidebar **Tổng quan, Vận hành, Kinh doanh, Tài chính, Nhân sự**; Cài đặt/Import ở cuối theo quyền.
- Bộ B01…B09 có **40 màn chính**, kế hoạch **43 khung trạng thái E01…E43**. Hiện có **82 ảnh**: 40 màn chính, 40 E-frame (E01…E26, E30…E43), UI-23A và UI-03A. E27…E29 là mở rộng leader/team trong kế hoạch v1.1, chưa có ảnh riêng trong bộ này. Ứng dụng có 47 screen ID; minh chứng Phase 2 bổ sung ở `output/verify-p2/shots`.
- Đủ dữ liệu mẫu, tìm kiếm/bộ lọc, action chính/phụ, trạng thái, quyền và đường chuyển màn. Hai báo cáo bám Excel: **Báo cáo tổng** và **Báo cáo kinh doanh**. Hóa đơn khách nhận bám sheet `HĐ (VP)`, `HĐ (VP-HẰNG)`, `HĐ (TECH)`; phiếu hoàn cọc bám mẫu riêng.
- Mỗi batch xuất ảnh từng màn riêng, bảng action/đích điều hướng, ghi chú các field bắt buộc và bảng kiểm. Không ghép nhiều màn nhỏ vào một ảnh khiến chữ khó đọc. Với báo cáo/hóa đơn dày dữ liệu, dùng khung tiếp nối hoặc bản toàn trang có thể phóng to.
- Toàn bộ tên, CCCD, số điện thoại, ngân hàng và tài khoản nhận tiền trong mockup phải là dữ liệu giả lập/che bớt. Chỉ sử dụng các số đối chiếu đã nêu rõ từ nguồn, không biến dữ liệu demo thành dữ liệu công ty thật.

## 2. Quy chuẩn UI dùng chung — Batch 00

### 2.1. Hướng thiết kế

Giao diện quản trị sáng, thiên về bảng và form, tiếng Việt đầy đủ dấu. Nền #F5F7FB, nội dung trắng; xanh đậm cho điều hướng, xanh dương cho action chính, xanh lá cho hoàn tất, vàng cho cần rà soát, đỏ cho lỗi/quá hạn. Trạng thái luôn có chữ, không chỉ có màu. Font hỗ trợ tiếng Việt, ưu tiên Inter hoặc Noto Sans; số tiền căn phải, ngày và mã phòng có cột riêng.

Desktop chính **1600×1000 px**; sidebar rộng khoảng 240 px, header 64 px, lề nội dung 24 px. Bảng dùng cỡ chữ đọc được 14–16 px, tiêu đề 22–26 px, nút cao 36–40 px. Bảng rộng cho cuộn ngang/cố định cột mã và tổng, không thu nhỏ chữ để nhét mọi cột. Form dài chia nhóm, có thanh Lưu/Hủy cuối form. Dialog nhỏ dùng cho xác nhận; drawer dùng cho nhập nhanh; OCR và bản in mở vùng làm việc rộng.

### 2.2. Điều hướng cố định

| Mục chính | Cấp 2 | Tab bên trong |
|---|---|---|
| Tổng quan | Trực tiếp dashboard | Kỳ và bộ lọc phạm vi |
| Vận hành | Tòa nhà; Khách thuê; Tài sản & bảo trì; Tài liệu | Chủ nhà/HĐ/phòng; lưu trú/HĐ/OCR/giá/tài chính; tài sản/lịch/kiểm kê |
| Kinh doanh | Tổng quan KD; Khách tiềm năng; Giao dịch chốt; Hoa hồng | Danh sách/chi tiết và nhân sự sale |
| Tài chính | Hóa đơn & thu tiền; Chi phí; Hoàn cọc; Báo cáo; Cổ đông | Chỉ số/hóa đơn/phiếu thu/công nợ; phân bổ; hai báo cáo; tỷ lệ/bảng chia/giao dịch |
| Nhân sự | Nhân sự & lương | Cơ cấu tổ chức/team/leader; hồ sơ; phân công; bảng lương |

Sidebar tối đa hai cấp; không thêm menu “Phòng”, “OCR”, “Biểu phí” riêng. Báo cáo chỉ có hai tab loại; drill-down tòa nằm trong ngữ cảnh loại đang xem. Breadcrumb và nút quay lại giữ bộ lọc. Người không có quyền thấy menu thích hợp, không nhìn thấy số tiền nhạy cảm qua tổng, tooltip hoặc export.

### 2.3. Thành phần cần tạo ở B00

1. Shell desktop, sidebar mở/thu gọn và menu đang chọn; header người dùng và breadcrumb.
2. Bộ input số tiền/ngày/select/multiselect/upload; field bắt buộc, chỉ đọc và lỗi.
3. Bảng có lọc/sắp xếp/phân trang/checkbox/hành động dòng; tab, badge và card chỉ tiêu.
   Bộ lọc có thể chọn `Leader → Team → Nhân viên → Vai trò phụ trách` và chip `Team của tôi`; hiển thị ngày/kỳ áp dụng. Bộ lọc dùng cùng logic phạm vi tại phòng, công nợ, việc và kinh doanh, nhưng cột vai trò thay đổi theo màn.
4. Modal xác nhận, drawer chi tiết/nhập, toast thành công/thất bại, loading/skeleton, empty state, lỗi kết nối và không có quyền.
5. Mẫu form ba nhóm: thông tin chung → dữ liệu nghiệp vụ → chứng từ; mẫu xem trước hóa đơn/báo cáo.

Đầu ra B00: bộ nền và một màn chuẩn UI-02 thử bố cục. UI-02 bản chính vẫn thuộc B01 để đối chiếu dữ liệu và action.

## 3. Bộ dữ liệu xuyên suốt mockup

### 3.1. Dữ liệu gốc và quy tắc dùng lại

| Bộ | Dữ liệu dùng | Quy tắc nhất quán |
|---|---|---|
| DEMO-MASTER | Tòa G1, S43, T17; phòng 501S43, 101T17, 302G3; tên chủ nhà/khách/nhân viên giả lập, ID riêng | Mã tòa/phòng giữ thống nhất; mỗi khách có customer ID và lượt thuê riêng; không lấy mã phòng làm ID người |
| DEMO-INVOICE | Phòng 501S43, mẫu `HĐ (VP)`: phòng 4.000.000; cọc mới 200.000; điện 0; nước 120.000; internet 100.000; combo 120.000; nợ cũ 1.012.000; tổng 5.552.000 đồng | Các dòng khác bằng 0/để trống theo mẫu; nước theo người không tự ghi thành m³; đơn vị hiển thị đúng hợp đồng |
| DEMO-PAY | Hóa đơn trên: thu lần 1 **3.000.000**, còn **2.552.000**; thu lần 2 **2.552.000**, còn 0 | Hai giao dịch giả lập để minh họa action; phải ghi rõ phân bổ từng khoản/cọc, ngày thực nhận và ngày nhập; tổng không đổi |
| DEMO-REFUND | 302G3: cọc **4.500.000**, tổng khấu trừ **760.000**, số tính hoàn **3.740.000** theo mẫu đã đối chiếu | Trạng thái đã chốt số và đã chuyển tiền tách riêng; phần chi thực chỉ có khi có chứng từ demo |
| DEMO-REPORT | Kỳ 08/2026: Tổng DT **7.036.256.236**, chi phí **6.013.857.267,283087**, LNR **1.022.398.968,716913**; KD tương ứng **6.664.406.236**, **5.978.477.267,283087**, **685.928.968,716913** | Đây là bộ số đối chiếu workbook. Hiển thị tiền VND có làm tròn nhất quán; giữ số chi tiết trong dữ liệu/ghi chú đối chiếu. Không cộng hóa đơn demo tháng 9 vào báo cáo tháng 8 |
| DEMO-SALARY | Ví dụ Word: HS 91%, mức tham chiếu 110.000, ví dụ `/90` ≈ 111.222 đồng/phòng; dòng hướng dẫn `/100` ra 100.100 | Dùng trạng thái “Cần xác nhận công thức”, không vẽ giao diện đã chốt lương dựa trên một phép tính chưa duyệt |
| DEMO-SHARE | Tòa G1, 9 cổ đông giả lập; tỷ lệ có thể dùng 20/15/15/10/10/10/8/7/5%, tổng 100% | Đây là tỷ lệ demo, không nhận là tỷ lệ thật trong file. Tính H/I/J/M theo mẫu G1; số thực trả từ giao dịch riêng |
| DEMO-ORG | Quản lý tổng → 3 trưởng phòng vận hành, tài chính–kế toán, kinh doanh; dưới vận hành có nhân viên vận hành/vệ sinh và một kỹ thuật phục vụ chung 3 phòng; dưới kinh doanh có trưởng nhóm sale → sale | Cây theo ảnh người dùng, tên và số liệu giả lập; một kỹ thuật chỉ một hồ sơ dù có nhiều phân công; quan hệ team và phân công đều có từ–đến; không hardcode số phòng ban/người |

Tên giả lập có thể dùng Nguyễn Minh An (khách), Trần Thu Hà (kế toán), Lê Quang Huy (vận hành), Phạm Gia Linh (sale). Địa chỉ và điện thoại giả/che bớt. Bộ dữ liệu thành công, một phần, quá hạn và lỗi được lưu thành trạng thái của cùng hồ sơ; không đổi số tùy ý giữa ảnh.

### 3.2. Ca mẫu bắt buộc ngoài ca thường

Khách mới giữa tháng; trả trước ba tháng; thu thiếu/dư; cùng phòng đổi khách; hợp đồng còn 35 ngày; OCR sai đơn giá/thiếu trang; chỉ số mới nhỏ hơn cũ; giá dịch vụ thay đổi sau phát hành; BC vượt cọc; chi phí chung thiếu cơ sở phân bổ; import trùng mã/ngày tiền dạng text; sửa sau khóa kỳ; quyền kế toán so với quản lý tòa; kỹ thuật phục vụ chung ba team; người nhắc thu khác người thực nhận; chuyển nhân viên/leader ngày 16 và xem lịch sử ngày 15. Số liệu tự dựng cho các ca này phải ghi `demo`, có phép tính và tổng kiểm tra được.

## 4. Chia batch và thứ tự thực hiện

| Batch | Nội dung | Screen ID chính | Số màn chính | Phụ thuộc |
|---|---|---|---:|---|
| B00 | Bộ thiết kế nền và shell | Dùng lại trên toàn bộ UI | — | Đặc tả v1.3 |
| B01 | Dashboard, tòa nhà/chủ nhà/phòng | UI-01–UI-05 | 5 | B00 |
| B02 | Khách thuê, hợp đồng, OCR, bảng giá | UI-06–UI-09 | 4 | B01 và bộ master |
| B03 | Kinh doanh, lượt xem/chốt, hoa hồng | UI-19–UI-22 | 4 | B01–B02 để nối lượt thuê |
| B04 | Chỉ số, hóa đơn, phiếu thu, công nợ | UI-10–UI-14 | 5 | B02, mẫu hóa đơn Excel |
| B05 | Chi phí, phân bổ, hoàn cọc | UI-15–UI-18 | 4 | B04, mẫu G1/hoàn cọc |
| B06 | Nhân sự, phân công, lương | UI-23–UI-25 | 3 | B04–B05 và Word lương |
| B07 | Hai báo cáo và cổ đông | UI-27–UI-33 | 7 | B04–B06, workbook báo cáo/G1 |
| B08 | Tài liệu, tài sản/bảo trì, import/quyền | UI-26, UI-34–UI-38 | 6 | B00–B07 |
| B09 | Phase 3: dự kiến, hiệu quả và E30…E43 | UI-40, UI-41; UI-03A | 2 | B07/B08, SRC-14 |
| **Tổng màn chính trong bộ ảnh** | | **UI-01…UI-38, UI-40/UI-41** | **40** | |

Batch kết thúc bằng kiểm tra sidebar, dữ liệu và luồng nối vào batch trước. Nếu một quy tắc còn chưa xác nhận, thể hiện trạng thái nháp/cần rà soát ở màn liên quan để vẫn hoàn thành thiết kế.

## 5. Danh sách màn hình, dữ liệu và action phải có

Mỗi dòng dưới đây là một khung nghiệp vụ chính tối thiểu. Với tab không được chọn trong ảnh chính, phần trạng thái bổ sung hoặc ảnh tiếp nối phải thể hiện nội dung tab và các action đặc thù, không chỉ vẽ tên tab.

### B01 — Tổng quan và tòa nhà

| Màn | Dữ liệu/bố cục | Action và chuyển màn |
|---|---|---|
| UI-01 Tổng quan | Bộ lọc khu vực/quản lý/trưởng nhóm/kỳ; phòng ở ngay/cuối tháng/chờ; doanh thu phòng/cọc/phá HĐ; tiến độ thu | Click chỉ tiêu mở UI-03/UI-14 với filter; đổi kỳ cập nhật nhãn/số |
| UI-02 Danh sách tòa | Mã, địa chỉ, T/S/G, chủ nhà, quản lý, số phòng và trạng thái khai thác | Thêm tòa, tìm/lọc, import, mở UI-03; ngừng khai thác có lý do |
| UI-03 Chi tiết tòa | Tabs tổng quan/phòng/chủ nhà–HĐ/tài sản/nhân sự/tài chính; bảng phòng giá/trạng thái/lượt thuê; tab nhân sự có leader/team, vai trò phụ trách và hiệu lực | Thêm/sửa phòng; mở khách UI-07; mở cơ cấu UI-23 hoặc phân công UI-24, UI-04/UI-34/UI-28, quay lại giữ tòa |
| UI-04 Chủ nhà/HĐ | Chủ nhà, giấy tờ, giá/cọc, các ngày, lịch giá/giữ giá, tài liệu | Lưu, thêm phụ lục, upload, xem lịch UI-05; file nhạy cảm ẩn theo quyền |
| UI-05 Lịch trả chủ nhà | Kỳ, hạn, tiền thuê, đã chi/còn phải trả, chứng từ | Lọc đến hạn, ghi chi thủ công UI-15, xem hợp đồng |

### B02 — Khách thuê và OCR

| Màn | Dữ liệu/bố cục | Action và chuyển màn |
|---|---|---|
| UI-06 Khách/lượt thuê | Tòa/phòng, đại diện, hạn hợp đồng, cờ 35 ngày, nợ, cọc, Zalo | Tạo khách/lượt thuê, lọc hết hạn, mở UI-07, xem nợ |
| UI-07 Chi tiết khách | Lưu trú, người ở/xe, ngày nhận/tính tiền, hợp đồng/lần gia hạn, tài chính | Sửa theo quyền, thêm người/xe, gia hạn, chuyển phòng/kết thúc; mở OCR/hoàn cọc |
| UI-08 Rà soát OCR | File gốc bên trái; trường/đơn giá/đơn vị và vị trí chứng cứ bên phải | Upload/chạy lại, sửa, xác nhận; thiếu trường thì chưa cho áp dụng; xác nhận → UI-09 |
| UI-09 Biểu phí | Loại phí, đơn vị/cách tính, giá, số lượng, ngày hiệu lực, nguồn | Thêm phiên giá, xem phí thử, kiểm tra chồng ngày; giá mới không ghi đè hóa đơn cũ |

### B03 — Kinh doanh

| Màn | Dữ liệu/bố cục | Action và chuyển màn |
|---|---|---|
| UI-19 Tổng quan KD | Phòng kinh doanh, chốt/nhận, phát sinh hoàn/phá HĐ; sale/team/kỳ | Lọc và mở danh sách phòng hoặc deal |
| UI-20 Khách tiềm năng | ID lead, nguồn, liên hệ, sale/team, phòng đã xem, ngày/trạng thái | Thêm lượt xem, kiểm tra trùng liên hệ, chốt sang UI-21 |
| UI-21 Giao dịch chốt | Ngày chốt/nhận/tính tiền, phòng, giá, cọc, nguồn, sale, thu đủ/thiếu | Chốt/chuyển/hủy, tạo lượt thuê UI-07, ghi thu UI-13; phân biệt giữ phòng và đang ở |
| UI-22 Hoa hồng | Khoản nhập/import, deal, sale/team, mức/số tiền, đã/chưa chi; tab nhân sự sale | Nhập/import, mở khoản chi UI-15, xem deal; không nút tính/chi tự động |

### B04 — Hóa đơn và thu tiền

| Màn | Dữ liệu/bố cục | Action và chuyển màn |
|---|---|---|
| UI-10 Chỉ số | Tòa/kỳ/lượt thuê, điện nước cũ/mới, tiêu thụ, người/xe, ngày ghi | Nhập hàng loạt, import, đánh dấu thiếu/bất thường, lưu và chuyển lập nháp |
| UI-11 Hóa đơn | Kỳ, phòng/lượt thuê, giá, cọc, phải thu/đã thu/nợ, hạn/trạng thái | Chọn kỳ/tòa, tạo nháp, mở UI-12, xuất theo tòa |
| UI-12 Chi tiết/bản in | Bố cục Excel và panel nội bộ, giá snapshot/chứng từ; preview hóa đơn tháng | Sửa nháp, xem/in/PDF, phát hành, xem phiếu thu, điều chỉnh sau phát hành |
| UI-13 Phiếu thu | Ngày thực nhận/ngày nhập, người thực nhận, người ghi, tiền, phương thức, chứng từ, phân bổ hóa đơn/kỳ/cọc/dư | Lưu thu một phần, xem số dư, phân bổ trả trước, đảo có lý do; link team nhắc thu chỉ để theo dõi, không thay người nhận |
| UI-14 Công nợ | Phòng/lượt thuê, hạn, phải thu, đã phân bổ, nợ/dư, ngày quá hạn, leader/team, người nhắc, lần nhắc gần nhất, người thực nhận | Lọc leader/team và khoản quá hạn; drill-down khoản thu, giao/nhắc việc, ghi thu UI-13 theo quyền, xuất danh sách nhắc; giữ khách cũ đúng lượt thuê |

**Chuẩn riêng hóa đơn:** cột STT/Nội dung/Chỉ số mới/Chỉ số cũ/Số lượng/Hệ số/Đơn giá/Thành tiền/Ghi chú; 12 dòng phí theo Excel; mã KH/phòng/ngày chốt; tổng và hướng dẫn thanh toán/nội dung CK/tài khoản mẫu. Bản in không có sidebar hoặc nút quản trị; ảnh màn quản trị hiển thị preview trong khung riêng. Hệ số phải theo từng dòng, biểu phí và ca nguồn; biến thể VP/TECH cần đối chiếu, không nhân ngày hai lần.

### B05 — Chi phí và hoàn cọc

| Màn | Dữ liệu/bố cục | Action và chuyển màn |
|---|---|---|
| UI-15 Chi phí | Khoản gốc, loại, tòa/quỹ, ngày chi/kỳ hưởng, nhà cung cấp, chứng từ | Nhập/import/sửa theo quyền, xem tài sản/hoa hồng liên quan, phân bổ |
| UI-16 Phân bổ | Quỹ gốc, tập tòa, số phòng, mẫu số, phương pháp, kết quả/chênh lệch | Xem trước, đổi phạm vi, chốt phiên; thiếu cơ sở thì báo chưa đủ dữ liệu |
| UI-17 Hoàn cọc | Lượt thuê, cọc, BC/BD, thực chi, ngày/trạng thái | Mở phiếu UI-18, lọc chờ xử lý, xem biên nhận |
| UI-18 Phiếu hoàn | Cọc và chi tiết phí, BC, BD, nghĩa vụ ngoài BC, số chi và chứng từ | Tính/xác nhận số, ghi chi thủ công, in mẫu hoàn; BD âm hiện phần vượt cọc riêng |

### B06 — Nhân sự và lương

| Màn | Dữ liệu/bố cục | Action và chuyển màn |
|---|---|---|
| UI-23 Nhân sự | Tab `Cơ cấu tổ chức` là cây thu gọn: quản lý tổng → các trưởng phòng → trưởng nhóm/nhân viên; panel bên phải là bảng thành viên/công việc theo node. Tab `Hồ sơ` có phòng ban, chức vụ, leader trực tiếp, ngày vào/thâm niên, trạng thái, số nhà/phòng theo vai trò | Chọn leader/team → mở danh sách được lọc; thêm/sửa đơn vị, gán/chuyển leader có hiệu lực; mở hồ sơ, phân công/lương theo quyền. Một người dùng chung không nhân bản hồ sơ |
| UI-24 Phân công | Nhân viên–leader/team–phạm vi tòa/phòng–loại trách nhiệm (vận hành/nhắc thu/thu thực tế/kỹ thuật/vệ sinh/sale)–từ/đến–người thay thế. Thanh lọc `Team của tôi`, leader, nhân viên, vai trò và ngày | Chuyển phân công, xem xung đột cùng vai trò/phạm vi và lịch sử; drill-down tới phòng, công nợ, việc, deal. Thu thực tế và người nhắc thu là hai cột khác nhau; không ghi đè kỳ trước |
| UI-25 Lương | Kỳ/người/tòa, số phòng, R5/R10/R15, A/B/C, HS, bậc/tham chiếu, điều chỉnh | Tính thử, mở chi tiết nguồn thu, lưu bản, xem vấn đề công thức; chốt chỉ khi đủ quy tắc |

### B07 — Hai báo cáo và cổ đông

| Màn | Dữ liệu/bố cục | Action và chuyển màn |
|---|---|---|
| UI-27 Chọn báo cáo | Hai tab/lựa chọn: Tổng và Kinh doanh; bộ lọc chung và kỳ chốt | Chọn UI-29/UI-30, giữ filter; không thêm dashboard báo cáo thứ ba |
| UI-28 Drill-down tòa | Loại báo cáo đang xem, kỳ, tòa, các dòng nguồn và chênh đối chiếu | Mở chứng từ/phân bổ, quay lại báo cáo, mở căn cứ cổ đông |
| UI-29 Báo cáo tổng | Dòng A/B; cột TỔNG/NHÀ T/NHÀ S/NHÀ G; doanh thu–giá vốn–chi phí–LN–tỷ lệ theo mẫu | Lọc/xuất, mở dòng; chia khung đầu/cuối cho đủ các dòng 3–61 |
| UI-30 Báo cáo KD | Cùng bố cục, số và công thức của sheet KD; cọc/thiết bị hiển thị theo nguồn | Chuyển Tổng↔KD, xem cầu nối, xuất; không giả định “ẩn dòng” là xong phép tính |
| UI-31 Cổ đông/tỷ lệ | Người demo, tòa, tỷ lệ, hiệu lực, tổng 100% | Thêm/sửa tỷ lệ có ngày, xem kỳ; cảnh báo tổng sai |
| UI-32 Bảng chia G1 | Tỷ lệ, C22/C73/C74 và H/I/J/M, tổng, làm tròn | Tính thử/chốt bản kê/xuất; mở căn cứ; không dùng M làm số đã trả |
| UI-33 Góp/chi thực | Lịch từ UI-05 × tỷ lệ tại hạn, gồm CHUNG; góp/rút/chi độc lập; M khóa/đã trả/còn lại; tài sản-cọc/đầu tư/lịch sử | Không chi trước khóa hoặc vượt M; hủy cần lý do; 8 khoản không trùng; cổ đông chỉ giao dịch của mình; subnav UI-31/32/33 |

### B08 — Tài liệu, tài sản và quản trị

| Màn | Dữ liệu/bố cục | Action và chuyển màn |
|---|---|---|
| UI-26 Tài liệu | Loại file, đối tượng, tòa/phòng, người/ngày tải, phiên bản/quyền | Upload, xem/tải, phiên bản cũ, mở hồ sơ liên quan |
| UI-34 Tài sản | 6 loại; Chủ nhà/Công ty; mã phòng nguồn; SL/tình trạng; nguyên giá/NBV/số tháng KH; chứng từ UI-15/UI-04/UI-37 | Thêm từ chứng từ, sửa, chuyển có lịch sử, thanh lý phần còn lại; chặn kỳ khóa; mặc định 63 tháng; mở bảo dưỡng/kiểm kê |
| UI-35 Bảo dưỡng | Dự kiến/Đã thực hiện/Quá hạn; sắp hạn là cờ; thiết bị, chu kỳ, leader/team, người/đơn vị, kết quả, chứng từ chi | Lập lịch, hoàn thành sinh lần tiếp; nhập tay không tự lặp; không SLA; chi qua một chứng từ UI-15 |
| UI-36 Kiểm kê | Phiên từng tòa/tháng tự mở ngày 1; sổ/thực/chênh SL tách tình trạng; người kiểm/ảnh | Render không ghi store; nhập, xuất chênh, đề xuất có lý do; admin + kế toán khác người duyệt mới sửa danh mục; không sinh chi phí |
| UI-37 Import | Loại dữ liệu, file/template, mapping cột, preview hợp lệ/lỗi/trùng | Tải mẫu, upload, map, kiểm tra, nhập hợp lệ/xuất lỗi; giữ nguồn dòng |
| UI-38 Cấu hình | Tabs danh mục/quyền/phạm vi tòa/kỳ/chính sách có hiệu lực | Lưu phiên, phân quyền, khóa kỳ/điều chỉnh; quyền nhạy cảm riêng |

### B09 — Dự kiến lợi nhuận, hiệu quả và minh chứng Phase 3

| Màn | Dữ liệu/bố cục | Action và chuyển màn |
|---|---|---|
| UI-40 Dự kiến | Đầu vào J3…J7/E4/G4, 24 dòng, hai panel dòng tiền/KD; 8 chỉ số phụ SRC-14 (tiền nhà, GV, DV, lương, CPPS, HC, TCP, LN /DT); kỳ/phiên bản/Excel-web; phạm vi tòa | Tạo phiên bản bất biến; chọn ngày lập và tòa loại trừ lấy gợi ý; sửa cần lý do; xuất; so UI-29/UI-30 khi chốt; không drill tòa; cổ đông chỉ xem |
| UI-41 Hiệu quả | LN/vốn=LNR/GV; LN/tài sản=LNR KD/NBV, chỉ tòa có số dư tài sản nền; DT phòng/tiền thuê; nhóm/khu vực/TP; Chờ dữ liệu khi thiếu số dư nền | Lọc cơ sở/nguồn, xuất; drill khi có quyền; cổ đông chỉ tòa mình, không Excel/TP/drill |
| UI-03A Tab Tài sản | Tài sản chủ nhà/công ty, cọc chủ nhà, bảo dưỡng và kiểm kê | Mở UI-34/35/36 giữ tòa |
## 6. 43 khung trạng thái bổ sung — E01…E43

Modal hoặc tab dưới đây là **ảnh riêng** nếu chứa form/bảng khác biệt; mỗi ảnh thể hiện đủ dữ liệu và action. Component lỗi/empty/loading dùng bộ B00 để áp dụng cho các màn còn lại.

| ID khung | Batch / màn gốc | Nội dung phải thấy |
|---|---|---|
| E01 | B01 / UI-02 | Drawer thêm tòa, lỗi mã trùng và trường bắt buộc |
| E02 | B01 / UI-03 | Tab phòng, mở chi tiết phòng, các trạng thái ở/trống/chờ và lịch sử lượt thuê |
| E03 | B01 / UI-04 | Phụ lục thay giá có ngày hiệu lực, cọc khác tiền thuê |
| E04 | B02 / UI-07 | Gia hạn hoặc chuyển phòng: lượt thuê cũ/mới, ngày hiệu lực, cọc/nợ cần xử lý |
| E05 | B02 / UI-08 | OCR thiếu/sai giá, field đánh dấu và chứng cứ; chưa cho áp dụng |
| E06 | B02 / UI-08 | OCR đã sửa đủ, đối chiếu giá cũ/mới, xác nhận đưa sang biểu phí |
| E07 | B02 / UI-09 | Phiên giá mới, chồng ngày hiệu lực, cảnh báo hóa đơn đã phát hành |
| E08 | B03 / UI-20 | Tạo lượt xem và cảnh báo khách trùng liên hệ |
| E09 | B03 / UI-21 | Chốt/chuyển/hủy giao dịch; tác động đến giữ phòng, cọc và doanh số |
| E10 | B04 / UI-10 | Nhập chỉ số có chỉ số giảm/thiếu dữ liệu và cách sửa |
| E11 | B04 / UI-11 | Wizard tạo kỳ, phòng mới giữa tháng, hàng không đủ dữ liệu |
| E12 | B04 / UI-12 | Hóa đơn khách nhận toàn trang theo Excel, tổng 5.552.000 đồng; không có shell |
| E13 | B04 / UI-13 | Thu 3.000.000, còn 2.552.000; preview phân bổ và xác nhận |
| E14 | B04 / UI-13 | Trả trước ba tháng và phần chưa phân bổ/dư, mỗi tháng một phần tiền |
| E15 | B04 / UI-14 | Đã thu đủ sau lần 2; lịch sử hai phiếu và số nợ bằng 0 |
| E16 | B05 / UI-15 | Form chi phí và chứng từ; chi một tòa/quỹ chung, kỳ hưởng khác ngày chi |
| E17 | B05 / UI-16 | Thiếu cơ sở 1.382/1.343, tổng phân bổ lệch; hiển thị phần chưa phân bổ |
| E18 | B05 / UI-18 | Ca BC>I; BD âm, số chi 0 theo đề xuất và khoản cần xử lý riêng |
| E19 | B05 / UI-18 | Phiếu hoàn theo mẫu `HĐ (HOÀN CỌC)`, số đã xác nhận và biên nhận chi |
| E20 | B06 / UI-24 | Phân công đổi giữa tháng, xem lịch sử/xung đột |
| E21 | B06 / UI-25 | Drawer giải thích A/B/C và 91%, trạng thái công thức chưa xác nhận/điều chỉnh sau khóa |
| E22 | B07 / UI-29 | Phần cuối báo cáo tổng: đủ dòng chi phí, lợi nhuận và tỷ lệ tới dòng 61 |
| E23 | B07 / UI-30 | Phần cuối báo cáo KD và cầu nối với Tổng, giữ bộ lọc |
| E24 | B07 / UI-31 | Sửa tỷ lệ khiến tổng ≠100%; cảnh báo và chặn chốt phân chia |
| E25 | B08 / UI-37 | Preview import lỗi/trùng, nguồn dòng, lựa chọn xử lý và file lỗi |
| E26 | B08 / UI-38 | Vai trò quản lý chỉ thấy tòa được giao; lương/cổ đông/CCCD bị hạn chế; không lộ qua export |
| E27 | B06 / UI-23 | Cây tổ chức chọn trưởng phòng Vận hành 2 → bảng thành viên, phòng/việc theo team; kỹ thuật dùng chung 3 phòng vận hành chỉ có một hồ sơ và nhiều dòng phân công |
| E28 | B04 / UI-14 + B01 / UI-03 | Chọn `Team của tôi`/leader → lọc phòng và công nợ cần nhắc; hiện người vận hành A, người thực nhận B, hạn, lần nhắc và số còn nợ; drill-down phiếu thu không thay số |
| E29 | B06 / UI-23–UI-24 | Chuyển thành viên/leader hiệu lực ngày 16; xem ngày 15 và 16 cho hai kết quả khác nhau, xung đột hoặc vòng lặp quản lý được chặn, lý do và người sửa lưu lịch sử |
| E30 | B09 / UI-34 | Thêm tài sản công ty từ chứng từ |
| E31 | B09 / UI-34 | Thanh lý vào KD dòng 21; preview theo ngày chọn |
| E32 | B09 / UI-34 | Chuyển vị trí và lịch sử trước/sau |
| E33 | B09 / UI-35 | Hoàn thành bảo dưỡng và lần kế tiếp |
| E34 | B09 / UI-36 | Đề xuất danh mục bắt buộc lý do |
| E35 | B09 / UI-36 | Admin và kế toán khác người duyệt |
| E36 | B09 / UI-33 | Chi thực không vượt M của run web đã khóa |
| E37 | B09 / UI-33 | Đầu tư ban đầu G1; 8 khoản tính một lần |
| E38 | B09 / UI-33 | Tài sản và cọc chủ nhà phải thu hồi |
| E39 | B09 / UI-40 | Các phiên bản dự kiến bất biến |
| E40 | B09 / UI-40 | Dự kiến so với UI-29/UI-30 khi chốt |
| E41 | B09 / UI-41 | Chờ dữ liệu khi tòa chưa có số dư tài sản nền |
| E42 | B09 / Cổ đông | URL tòa ngoài scope bị chặn |
| E43 | B09 / UI-39 | Đợt Zalo nhắc bảo dưỡng mô phỏng |

**Phủ toàn bộ tab:** khi dựng batch, đối chiếu đặc tả UI-xx với ảnh chính và E tương ứng. Tab chứa dữ liệu khác mà chưa xuất hiện (ví dụ giao dịch góp vốn, tài sản/cọc, hồ sơ nhân sự) phải thêm ảnh tiếp nối mang hậu tố `-tab-*`. Tên tab trong ảnh chính không được tính là đã hoàn tất nội dung tab.

## 7. Luồng review bằng ảnh/prototype

| Luồng | Thứ tự bấm cần thể hiện | Kết quả phải nhất quán |
|---|---|---|
| L01 Nhận nguồn nhà | UI-02 → UI-04 → UI-03 → UI-05 | Tòa/phòng, hợp đồng đầu vào, ngày giá và lịch trả cùng dữ liệu |
| L02 Chốt đến nhận phòng | UI-20 → UI-21 → UI-07 → UI-08 → UI-09 | ID lead/deal/lượt thuê liên kết, giá từ bản OCR đã kiểm tra |
| L03 Thu tiền phòng | UI-10 → UI-11 → UI-12 → UI-13 → UI-14 | Tổng 5.552.000; lần 1 còn 2.552.000, lần 2 còn 0 |
| L04 Kết thúc thuê | UI-07 → UI-17 → UI-18 | Cọc/khấu trừ/số tính hoàn và thực chi tách rõ; không nhập lại thành chi phí thường |
| L05 Chi đến lợi nhuận | UI-15 → UI-16 → UI-28 → UI-29/UI-30 | Một khoản chi nguồn; hai cách tổng hợp theo hai sheet |
| L06 Lương vận hành | UI-24 + UI-13 → UI-25 | Thu theo đúng kỳ/mốc, minh bạch công thức đang chờ xác nhận |
| L07 Cổ đông | UI-31 → UI-32 khóa → UI-33 lịch góp/chi thực/đầu tư → UI-41 | M khác tiền đã trả; chỉ chi phần còn lại; khóa lại giữ tiền đã chi; codong chỉ tòa mình, không drill/Excel/ghi |
| L08 Bảo trì | UI-34 → UI-35 → UI-15 → UI-30; UI-36 → hai duyệt → UI-34; nhắc UI-39 | Một chứng từ chi; hoàn thành sinh lần sau; kiểm kê không sinh chi; thanh lý vào KD dòng 21 |
| L09 Import | UI-37 → preview lỗi → sửa → màn danh sách đích | Import lại không tạo trùng số thu/chi |
| L10 Leader theo dõi team | UI-23 chọn leader → UI-24 phân công → UI-03 phòng / UI-14 nợ và nhắc thu / UI-35 việc / UI-20–UI-21 deal | Giữ `Team của tôi`, kỳ và vai trò phụ trách; phòng/tiền/việc đếm một lần; người được giao khác người thực nhận; admin xem được nhiều leader, leader chỉ xem nhánh được quyền |

Ảnh mockup tĩnh cần ghi action đích trong tài liệu đi kèm. Nếu làm prototype có tương tác sau đó, hotspot bám cùng ID/action và dùng đúng bộ dữ liệu này.

## 8. Cách tạo từng batch và tiêu chí kiểm tra

### 8.1. Quy trình

1. Lấy screen ID và phần đặc tả của batch; giữ cùng shell, sidebar, style B00 và dữ liệu đã thống nhất.
2. Dựng ảnh chính → các tab tiếp nối → modal/drawer/trạng thái E. Tên file: `B04_UI-12_invoice-detail.png`, `B04_E12_invoice-print.png`; trạng thái bổ sung tự phát sinh có ID nối tiếp và ghi lý do trong bảng kiểm.
3. Soát chữ tiếng Việt, tiền/ngày/mã phòng, số dòng/cột với tài liệu nguồn, vị trí nút và trạng thái quyền. Hóa đơn/báo cáo phải có dữ liệu chính xác; ảnh tạo bằng AI nếu sai chữ/số phải sửa, không coi là bản chuẩn tính toán.
4. Lưu ảnh từng màn và bảng mapping `screen → dữ liệu → action → màn đích → ảnh`. Chỉ đánh dấu batch hoàn thành sau khi bảng kiểm không thiếu field/action/tab bắt buộc.
5. Dùng ảnh đầu đã đạt làm tham chiếu cho batch kế tiếp; cập nhật thống nhất nếu đổi shell/component dùng chung.

### 8.2. Bảng kiểm nghiệm thu

- **Độ phủ:** B01…B09 có 40 màn chính và 40 E-frame đã chụp, cộng UI-23A/UI-03A. Kế hoạch đánh số đến E43; E27…E29 chưa có ảnh riêng. Tab và action Phase 3 được đối chiếu trong UAT; app có 47 screen ID.
- **Điều hướng:** 5 mục chính; menu con đúng nhóm; breadcrumb/back/filter; role không được phép không thấy dữ liệu nhạy cảm.
- **Dữ liệu:** cùng phòng/khách/kỳ không đổi số giữa ảnh; tổng/số dư khớp; tiền cọc/chi phí/công nợ riêng; báo cáo tháng 8 không trộn giao dịch demo tháng 9.
- **Báo cáo:** đúng hai loại, đúng cột C–F và nhóm dòng; hệ số/tỷ lệ đúng nguồn; chi tiết tòa không thành báo cáo thứ ba.
- **Hóa đơn:** đúng bảng chín cột, thứ tự 12 dòng, ngày chốt/kỳ, tổng, hạn/nội dung CK/tài khoản demo; bản in bỏ phần quản trị; mẫu hoàn riêng.
- **Tác nghiệp:** có form bắt buộc/lỗi, confirm thao tác có ảnh hưởng, xem trước import/OCR; giao dịch đã chốt không thể âm thầm sửa số.
- **Hình thức:** chữ Việt rõ dấu, không bị cắt/đè, tương phản đủ đọc, nút đúng ưu tiên, bảng dài có cuộn/ảnh tiếp nối và header dễ theo dõi.

## 9. Thứ tự bắt đầu

**Bắt đầu B00 → B01 → B02 → B03 → B04 → B05 → B06 → B07 → B08 → B09.** B00 xác lập phong cách; B04 và B07 là hai batch cần đối chiếu số và mẫu Excel kỹ nhất. Kế hoạch này bao phủ chức năng web đã mô tả; Mini App là bộ màn riêng khi được yêu cầu. Các chính sách còn mở được thiết kế bằng trạng thái cần rà soát, không tự chuyển thành quy tắc nghiệp vụ đã duyệt.

**Đối chiếu Phase 3:** [Đặc tả và ảnh cũ](../docs/UI/Phase3_Doi_chieu_dac_ta_vs_anh_cu.md); [UAT](../docs/uat/Phase3_Kich_ban_kiem_thu.md). M web G1 62.672.849 khác benchmark nguồn 62.664.969,25 (OQ-04/làm tròn); S4 nguồn 3.440.000 → thanh lý T10 3.329.920. O1…O6 vẫn chờ khách xác nhận.
