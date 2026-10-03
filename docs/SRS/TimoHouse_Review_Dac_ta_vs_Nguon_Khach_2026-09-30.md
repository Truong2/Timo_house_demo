# Review nghiệp vụ: đặc tả TimoHouse so với tài liệu khách cung cấp

**Ngày rà soát:** 30/09/2026  
**Trạng thái:** Draft review nội bộ; các câu hỏi chưa có trả lời không được coi là quy tắc khách đã duyệt.

**Nội dung cập nhật:** bổ sung 18 câu trả lời bám nguồn; ghi rõ thông tin khách đã nêu, cách tính trong mẫu Excel và nội dung còn thiếu hoặc mâu thuẫn. Các câu trả lời giả định trong trao đổi trước không được dùng thay xác nhận của khách.

## Phạm vi và kết luận

Đối chiếu bản `docs_timonouse/TimoHouse_Dac_ta_man_hinh_web_va_luong_nghiep_vu_v1.md` (Draft v1.11) với workbook yêu cầu, workbook câu hỏi, mẫu hóa đơn, báo cáo tháng 8, dự kiến lợi nhuận, bảng lương, hoa hồng, sổ sửa chữa, âm dương điện nước và file Word công thức lương trong `docs_timonouse/`. Đọc **công thức và giá trị cache** trong Excel; không coi các giả định `[GĐ]`, phương án tạm ở sheet câu hỏi hay mẫu Excel có lỗi là câu trả lời đã được khách xác nhận.

**Kết luận:** Đặc tả đã bao phủ phần lớn nhóm nghiệp vụ và nhiều phép tính mẫu, nhưng **chưa đủ cơ sở để gọi là “đúng chuẩn nghiệp vụ đã chốt”**. Có hai điểm đang đi ngược câu trả lời trực tiếp của khách (mốc công nợ, quyền xem số công nợ), các công thức báo cáo/khấu hao vẫn mâu thuẫn giữa mô tả và Excel, và một số quy tắc tạm đang được viết như công thức áp dụng chính thức. Cần khóa các điểm dưới đây trước khi lấy số liệu web làm chuẩn nghiệm thu hoặc phát hành tài liệu cho khách duyệt.

## Nguyên tắc đọc nguồn

- Câu trả lời tại cột D của sheet `Câu hỏi làm rõ nghiệp vụ` là nội dung khách đã trả lời; ký hiệu CH-nn là STT câu hỏi.
- Sheet `Câu hỏi bổ sung 29.9` có **18 câu**, gồm OQ-01, OQ-01b và OQ-02 đến OQ-17. Cột F `Trả lời của khách hàng` ở F6:F23 đều trống. Cột E chỉ là **phương án tạm do bên triển khai đề xuất**.
- Công thức và giá trị trong Excel chứng minh cách file mẫu đang tính. Một ngoại lệ hoặc một kỳ dữ liệu chưa đủ để kết luận đó là chính sách áp dụng cho mọi kỳ.
- Khi mô tả của khách, file Word và công thức Excel khác nhau, giữ các bằng chứng cùng trạng thái **mâu thuẫn cần xác nhận**. Không tự chọn một công thức rồi ghi là khách đã duyệt.
- Các đề xuất xử lý trong bảng R01–R09 là khuyến nghị của người review, không phải câu trả lời của khách.

Các tham chiếu `:số dòng` trong bảng R01–R09 trỏ đến bản đặc tả v1.11 đã đọc tại thời điểm review; có thể thay đổi khi đặc tả được chỉnh sửa.

## Trạng thái xử lý đến 03/10/2026

| Rủi ro | Trạng thái | Căn cứ triển khai / điều kiện đóng |
|---|---|---|
| R01 | **Đã đóng** | `debtBasis=issuedAt`, 5 ngày lịch từ ngày phát hành theo CH-14; có test cả `issuedAt`, `dueDate`, phát hành muộn và dữ liệu lịch sử thiếu ngày phát hành. |
| R02 | **Đã đóng** | Vận hành/leader chỉ xem trạng thái; admin/kế toán mới xem số tiền; RBAC và kiểm thử hồi quy xuất dữ liệu đã có. |
| R03 | **Đã kiểm soát, chưa đóng OQ-10** | Báo cáo chính thức dùng đúng Excel; phương án OQ-10 tách riêng, chỉ admin/kế toán xem. Chỉ đóng OQ sau khi có nguồn khách xác nhận. |
| R04 | **Chưa đóng** | Tài sản legacy 63 tháng chỉ có lịch thử, không vào số chính thức; tài sản mới bắt buộc tháng KH và nguồn. Chờ chính sách khách xác nhận. |
| R05 | **Chưa đóng** | Hệ thống ghi theo kỳ thực chi và chặn kỳ chi đã khóa; `eligibleAt` chỉ là chế độ đề xuất. Chờ xác nhận OQ-13. |
| R06 | **Chưa đóng** | Đã bỏ 6.000/6.500đ tự động; bắt buộc nhập lương/phòng và lý do. Chờ xác nhận OQ-01. |
| R07 | **Chưa đóng** | Mẫu 12 dòng dùng khi không có Thu khác; bản 13 dòng ghi “mẫu mở rộng”. Chờ khách duyệt hình thức mẫu mở rộng. |
| R08 | **Chưa đóng** | Chỉ công bố số khách xem/chốt; tỷ lệ là đề xuất và không phải KPI chính thức. Chờ xác nhận OQ-06. |
| R09 | **Đã đóng phần tài liệu** | README và tài liệu phân phase đã đồng bộ Draft v1.13 và Phase 3. |

Ma trận ký duyệt chi tiết: `TimoHouse_Ma_tran_Quyet_dinh_Nghiep_vu.md`. Không thay đổi cột trả lời khách trong workbook nguồn.

## Các điểm đã đối chiếu và khớp nguồn

| Nghiệp vụ | Bằng chứng nguồn | Đánh giá |
|---|---|---|
| Lương vận hành: 3 mốc 5/10/15, hệ số 100%/90%/70%, trừ tỷ lệ dịch vụ rồi cộng doanh thu thu thêm | `CÁCH TÍNH LƯƠNG PHÒNG VẬN HÀNH.docx`, Bước 1–6; `bảng lương tháng 8.xlsx!THÁNG 8!M19:W19` | Công thức lõi trong đặc tả §3.6/UI-25 khớp. Quy tắc chọn bậc là suy luận từ Excel, đã ghi ngoại lệ V51. |
| Báo cáo tổng và báo cáo kinh doanh tháng 8 **theo Excel** | `BÁO CÁO KINH DOANH THÁNG 8.xlsx!BÁO CÁO TỔNG THÁNG 8!C3/C21/C44/C46`; sheet `BÁO CÁO KINH DOANH THÁNG 8!C3/C21/C44/C46` | Số nguồn lần lượt: tổng DT 7.036.256.236, CP 6.013.857.267,28, LNR 1.022.398.968,72; kinh doanh DT 6.664.406.236, CP 5.978.477.267,28, LNR 685.928.968,72. Đặc tả ghi đúng **số Excel** và có nêu cầu nối số web. |
| Mẫu hóa đơn và hạn hiển thị trên bản in | `Hoá đơn tiền nhà tháng 9 và dịch vụ tháng 9 năm 2026.xlsx!HĐ (VP)!B2/B20/J7/I19` (tương tự TECH) | Mẫu ghi hóa đơn tháng 9, yêu cầu trả 25–31/8, `I19=SUM(I7:I18)`. Đặc tả đã nhận diện thiếu dòng “Thu khác” trong mẫu gốc. |
| Công thức dự kiến marketing và khấu hao trên **file dự kiến** | `BẢNG DỰ KIẾN LỢI NHUẬN CÁC THÁNG.xlsx!Tháng 9.2026!G23/G26` | `G23=E4/2`, `G26=J3*1,6%`; đặc tả nhận đúng công thức hai ô này. |
| Danh mục báo cáo | `bao_cao/báo cáo.xlsx!BÁO CÁO!A1:F23` | Bản v1.11 đã mở rộng thành bốn nhóm và giữ các báo cáo khách nêu. |

## Phát hiện cần xử lý

| ID / mức | Phát hiện và bằng chứng | Tác động / việc cần làm |
|---|---|---|
| **R01 / Cao** | **Mốc công nợ bị đổi cơ sở tính.** Khách trả lời “sau 5 ngày kể từ khi có hóa đơn” tại `Cau-hoi-lam-ro-nghiep-vu-Timehouse.xlsx!Câu hỏi làm rõ nghiệp vụ!D19` (CH-14). Đặc tả UI-14, §3.12 và OQ-12 (`:250`, `:590`, `:687`) lại tính 5 ngày **sau hạn**, cố định thành ngày 6 tháng hóa đơn. Mẫu `HĐ (VP)!B20/J7` yêu cầu trả 31/8; ba mốc 5/10/15 là mốc lương, chưa có bằng chứng đó là hạn công nợ. | Không ghi ngày 6 là quy tắc khách đã chốt. Tách rõ `ngày phát hành/gửi`, `hạn thanh toán`, `ngày chuyển công nợ`; xin khách chọn mốc bắt đầu 5 ngày và quy tắc đếm ngày. Trước khi chốt, không dùng chỉ tiêu “đúng hạn” này làm chuẩn nghiệm thu. |
| **R02 / Cao** | **Quyền xem số nợ đang vượt câu trả lời khách.** CH-01, ô `...!Câu hỏi làm rõ nghiệp vụ!D7`, trả lời admin và kế toán cho dữ liệu nhạy cảm gồm công nợ. Đặc tả `:67`, `:253`, `:335`, OQ-09 `:684` cho leader/NV vận hành thấy **số còn nợ**, thậm chí phần phải thu/đã thu trong danh sách team. Đây là ngoại lệ chưa được khách trả lời tại sheet `Câu hỏi bổ sung 29.9!F15` (để trống). | Giữ quyền số tiền cho admin/kế toán theo CH-01; nếu nhân viên cần nhắc nợ, chỉ hiện trạng thái hoặc đầu việc cho đến khi khách duyệt chính xác trường tiền được xem, phạm vi và vai trò. |
| **R03 / Cao** | **Báo cáo kinh doanh có hai cách tính khác nhau.** Khách ghi “không gồm cọc mới, hoàn cọc, mua sắm TB” tại `bao_cao/báo cáo.xlsx!BÁO CÁO!D6`. Workbook thực tế `BÁO CÁO KINH DOANH THÁNG 8!C3/C6/C21/C46` bỏ cọc mới, vẫn chịu hoàn cọc và để thiết bị bằng 0. Đặc tả OQ-10 `:430`, `:685` tự bật cộng lại hoàn cọc và khấu hao, ra LNR **790.331.663 trên số Excel / 779.688.893 trên số web**, thay vì LNR Excel **685.928.969**. Sheet `Câu hỏi bổ sung 29.9!F16` chưa có trả lời. | Giữ **“theo Excel”** làm chuẩn so khớp lịch sử và **“theo mô tả khách”** là phương án cần duyệt. Không công bố 779.688.893 là số nghiệp vụ chuẩn trước khi khách xác nhận hoàn cọc và thiết bị. Ghi rõ công thức từng chế độ, đầu vào và kết quả nghiệm thu. |
| **R04 / Cao** | **Khấu hao cộng dồn 1,6%/tháng chưa có nguồn.** File dự kiến `Tháng 9.2026!G26` chỉ có `=J3*1.6%`, tính trên số mua sắm ở chính bản dự kiến. Đặc tả OQ-11 `:686` suy ra khấu hao cho **toàn bộ tài sản tích lũy**, từ tháng mua, 62 tháng rồi 0,8% tháng cuối; CH-06/CH-15 chỉ xác nhận “có khấu hao”, chưa có bảng thời gian/giá trị còn lại. `Câu hỏi bổ sung 29.9!F17` trống. | Gắn quy tắc này là **phương án đề xuất độ tin cậy thấp**, không gọi là công thức Excel hoặc mặc định nghiệp vụ. Cần khách chốt nguyên giá, ngày bắt đầu, tuổi thọ theo loại tài sản, tài sản cũ và thanh lý. |
| **R05 / Trung bình** | **Kỳ ghi nhận hoa hồng không nhất quán trong đặc tả.** UI-15 `:260` nói ghi theo **tháng chi**, OQ-13 `:688` và v1.11 `:5` nói theo **tháng đủ điều kiện chi**. File `Hoa hồng năm 2025-2026 (1).xlsx!HOA HỒNG THÁNG 8.26!A2:M14` có trạng thái thanh toán và ô “Đã tt”; không chứng minh mọi khoản được hạch toán khi vừa đủ điều kiện. `Câu hỏi bổ sung 29.9!F19` chưa trả lời. | Tách `ngày chốt`, `ngày đủ điều kiện`, `ngày duyệt`, `ngày chi`, `kỳ ghi chi phí`; chọn một kỳ cho dòng marketing báo cáo sau khi khách xác nhận. Nếu làm hai chế độ thì tên và số của mỗi chế độ phải rõ. |
| **R06 / Trung bình** | **Chưa có căn cứ cho mức 6.000/6.500đ khi HS < 70%.** Sheet câu hỏi `Câu hỏi bổ sung 29.9!C6` đang hỏi “phụ cấp 10%” là 10% của khoản nào; E6 đề xuất **nhập tay**, F6 trống. Đặc tả OQ-01 `:676` lại áp `10% × mức thấp nhất bậc 70–75` = 6.000/6.500đ, không có ca kiểm chứng trong review. | Ghi “chưa xác định cơ sở tính 10%”; chờ chính sách hoặc xử lý từng trường hợp có duyệt. Nhập tay là phương án vận hành tạm, không ghi thành công thức khách đã chốt. |
| **R07 / Trung bình** | **Hóa đơn web 13 dòng khác hình thức mẫu gốc 12 dòng.** Cả `HĐ (VP)!I19` và `HĐ (TECH)!I19` cộng `I7:I18` (12 dòng), trong khi đặc tả UI-12 `:232` vẫn gọi bảng `B6:J18` nhưng `:233–234` yêu cầu dòng 13 “Thu khác” và tổng 13 dòng. Về nghiệp vụ, bổ sung Thu khác là hợp lý vì nó có trong bảng nguồn; về mẫu in, chưa có ô/dòng trong mẫu khách. | Sửa đặc tả thành **mẫu web mở rộng**: chèn dòng Thu khác, dời hàng tổng và phần thông báo, định nghĩa mẫu PDF mới để khách duyệt. Không gọi bản 13 dòng là “đúng nguyên mẫu Excel”. |
| **R08 / Trung bình** | **Tỷ lệ chuyển đổi có tử/mẫu ngược nhau.** File `bao_cao/báo cáo.xlsx!BÁO CÁO!E22` ghi “khách xem/khách chốt”; đặc tả tại `:400` giữ công thức này, nhưng OQ-06 `:681` và v1.11 `:5` dùng **chốt/xem**. `Câu hỏi bổ sung 29.9!F12` trống. | Giữ nguyên câu chữ nguồn khi ghi nhận yêu cầu; hỏi lại tử/mẫu, đơn vị đếm khách hay lượt xem và kỳ quy chiếu trước khi tính. Không tự đảo công thức theo thông lệ. |
| **R09 / Trung bình** | **Tài liệu phụ trợ chưa theo kịp bản đặc tả.** `docs/SRS/TimoHouse_Phan_chia_3_Phase.md:3` nói lấy Draft **v1.9**, còn `docs_timonouse/TimoHouse_Plan_Mockup_UI_v1.md:5` nói Draft **v1.3** và UI-01…UI-38; bản đặc tả hiện là v1.11, có UI-39…UI-47 và cập nhật Phase 2. | Đồng bộ mốc phiên bản, danh sách màn và tiêu chí nghiệm thu sau khi R01–R08 được xử lý; ghi một tài liệu nào là bản điều khiển phạm vi chính thức. |

## Nội dung trả lời bám tài liệu khách cho 18 câu bổ sung

Bảng này là kết quả đối chiếu của bên triển khai, **không phải câu trả lời thay khách** và không làm thay đổi trạng thái chưa trả lời của cột F. “Chưa chốt” nghĩa là tài liệu hiện có chưa đủ để quyết định quy tắc áp dụng.

Tên nguồn viết gọn trong bảng:

- **QA:** `Cau-hoi-lam-ro-nghiep-vu-Timehouse.xlsx` ở thư mục gốc; **QA chính** = sheet `Câu hỏi làm rõ nghiệp vụ`, **QA bổ sung** = sheet `Câu hỏi bổ sung 29.9`.
- **YC:** `nội dung làm web Timehouse 31.8.2026(2).xlsx` ở thư mục gốc.
- **Lương Word:** `docs_timonouse/CÁCH TÍNH LƯƠNG PHÒNG VẬN HÀNH.docx`.
- **Lương T8:** `docs_timonouse/bao_cao/bảng lương tháng 8.xlsx`.
- **BC T8:** `docs_timonouse/bao_cao/BÁO CÁO KINH DOANH THÁNG 8.xlsx`.
- **Danh mục BC:** `docs_timonouse/bao_cao/báo cáo.xlsx`.
- **Dự kiến:** `docs_timonouse/bao_cao/BẢNG DỰ KIẾN LỢI NHUẬN CÁC THÁNG.xlsx`.
- **Hóa đơn T9:** `docs_timonouse/Hoá đơn tiền nhà tháng 9 và dịch vụ tháng 9 năm 2026.xlsx`.
- **G1:** `docs_timonouse/G1.31.8.26.xlsx`.
- **Hoa hồng:** `docs_timonouse/Hoa hồng năm 2025-2026 (1).xlsx`.

| Mã | Nội dung có thể trả lời theo nguồn | Nội dung chưa đủ căn cứ để chốt | Căn cứ |
|---|---|---|---|
| OQ-01 | Lương vận hành có ba mốc 5/10/15, hệ số 100%/90%/70%; doanh thu tiền phòng = A − A×B + C; HS = doanh thu tiền phòng / giá niêm yết × 100. Word ghi chia 100 nhưng ví dụ lại chia 90; Excel có công thức chọn cận và các dòng HS trên 100%. | Chính sách chọn cận cho mọi trường hợp; cơ sở tính 10% khi HS dưới 70%; ngày xác định thâm niên; V51 là lỗi hay ngoại lệ. Không tự chốt mức 6.000/6.500đ. | Lương Word Bước 1–6, đặc biệt Bước 5; Lương T8 `THÁNG 8!T19:W19`, `V50:V51`, `V131`; QA bổ sung `C6:F6`. |
| OQ-01b | Bảng lương có khoản trưởng phòng/nhóm `774×10.000` và `408×10.000`; tài liệu đối chiếu nêu G12A/G13/G14 hưởng 100.000đ/phòng. Đây là số và cách tính trong mẫu kỳ tháng 8. | Công thức chính thức các phòng ban khác; danh sách tòa áp mức cố định; thời điểm chuyển sang HS; căn cứ xác định 774/408 phòng. Không tự đặt thời hạn ba tháng cho mức cố định. | Lương T8 `THÁNG 8!G10:G11`; QA bổ sung `C7:D7`, `F7` trống; QA chính CH-26, `D31`: hẹn trao đổi trực tiếp. |
| OQ-02 | Word có ba mốc thu 5/10/15; TH1 điều chỉnh cọc và tiền thuê trả theo kỳ ba tháng; TH2 tính các khoản thu tăng thêm ở mốc 10/15 với hệ số 90%/70%. | Thu sau ngày 15 có tính vào lương không, tính kỳ nào; lương khi đổi quản lý giữa tháng; xử lý cọc thu sau mốc 5. Không tự chọn người phụ trách ngày 15 hoặc tự chuyển khoản thu sang kỳ sau. | Lương Word Bước 1, TH1/TH2; QA bổ sung `C8:F8`. |
| OQ-03 | Mẫu “DS phòng phá hđ” theo dõi phải thu tiền điện; các phòng phá HĐ được đối chiếu không nằm trong danh sách hoàn cọc. | Phạm vi áp dụng giữ cọc/chỉ thu điện cho mọi trường hợp; tiền nước và dịch vụ khác có được miễn không; xử lý phí vượt cọc. Các ô E9 là đề xuất, chưa phải trả lời khách. | Hóa đơn T9 `DS phòng phá hđ`, `HOÀN CỌC`; QA bổ sung `C9:F9`. |
| OQ-04 | G1 tháng 8 C43 thực tế dùng `(25.000.000/1.343)×15`, trong khi C46 dùng mẫu số 1.382. Giữ các giá trị này để đối chiếu lịch sử. | Mẫu số chính thức; C43 có phải sót từ tháng trước không; có sửa lại kỳ cũ không. Không tự kết luận đây là lỗi đã được khách xác nhận. | G1 `BÁO CÁO THÁNG 8!C43/C46`; QA bổ sung `C10:F10`. |
| OQ-05 | G1 có liên kết ngoài tới các file chưa có trong bộ tài liệu đã đọc. Giá trị cache có thể dùng đối chiếu tổng. | Chưa tái lập được toàn bộ giao dịch nguồn của kỳ lịch sử; cần file liên kết hoặc chứng từ tương đương. Không tự dựng giao dịch chi tiết từ số tổng. | G1 `BÁO CÁO THÁNG 8!C46` có liên kết `[19]`; QA bổ sung `C11:D11` liệt kê file/vùng còn thiếu. |
| OQ-06 | Báo cáo tháng 8 có LNR theo tòa. File yêu cầu nêu các loại phòng trống và trạng thái phòng chốt; danh mục báo cáo ghi “khách xem/khách chốt”. | Định nghĩa ba loại phòng trống; công thức lấp đầy/thời gian trống/thời gian vận hành; tử/mẫu, kỳ quy chiếu và cách đếm khách chuyển đổi. Không tự đảo thành chốt/xem hoặc chốt công thức phòng-ngày. | YC `Tổng quan!A1`, `KINH DOANH!C18`; Danh mục BC `BÁO CÁO!E22`; BC T8 các sheet tòa; QA chính CH-07, `D12`; QA bổ sung `C12:F12`. |
| OQ-07 | Đã có file dự kiến. Danh mục BC ghi LN/vốn = LNR/giá vốn; LN/tài sản = LNR/tài sản; biên tiền nhà = tiền nhà thu được/tiền nhà đóng cho chủ. | Cách định giá tài sản, cách lập từng đầu vào dự kiến và các quy tắc chưa được file mô tả. Chưa có chính sách hoàn vốn cổ đông. | Danh mục BC `BÁO CÁO!E9:F11`; Dự kiến `Tháng 9.2026 !E3/G23/G26`; QA chính CH-24, `D29`; QA bổ sung `C13:F13`. |
| OQ-08 | Khách trả lời cổ đông đóng tiền nhà định kỳ cho chủ theo tỷ lệ góp vốn; tỷ lệ nhập tay, một cổ đông có thể góp nhiều tòa. Mẫu G1 có bảng chia theo tỷ lệ và cột Vốn. | “CHUNG” là quỹ hay người nhận cụ thể; nguyên tắc làm tròn và nơi nhận chênh lệch; ý nghĩa quyết toán cột Vốn. Không tự dồn chênh lệch vào CHUNG. | QA chính CH-29/CH-30, `D34:D35`; G1 `BÁO CÁO THÁNG 8`; QA bổ sung `C14:F14`. |
| OQ-09 | CH-01 trả lời quyền xem/sửa dữ liệu nhạy cảm gồm công nợ, lương, hoa hồng thuộc admin và kế toán. | Ngoại lệ cho leader/NV vận hành xem số nợ, quyền xuất file và quyền xác nhận thu chưa được trả lời. Không dùng phương án E15 để mở quyền số tiền. | QA chính `C7:D7`; QA bổ sung `C15:F15`. |
| OQ-10 | Mô tả khách ghi BC kinh doanh không gồm cọc mới, hoàn cọc, mua sắm thiết bị. CH-15 yêu cầu thiết bị hạch toán theo khấu hao. Excel tháng 8 thực tế bỏ cọc mới, vẫn chịu hoàn cọc, thiết bị bằng 0; LNR nguồn là 685.928.968,72đ. | **Mâu thuẫn nguồn:** chưa có quyết định chọn/cập nhật công thức nào. Số 790.331.663 hoặc 779.688.893 trong đặc tả là kết quả giả định, không phải số khách đã xác nhận. | Danh mục BC `BÁO CÁO!D6`; QA chính `D20`; BC T8 `BÁO CÁO KINH DOANH THÁNG 8!C3/C6/C21/C46`; QA bổ sung `C16:F16`. |
| OQ-11 | CH-06/CH-15 xác nhận có khấu hao. Bản dự kiến tháng 9 có `G26=J3*1,6%`. | Chưa có chính sách cho toàn bộ tài sản: thời gian, tháng bắt đầu, số dư đầu kỳ, thanh lý, cộng dồn hay chỉ khoản mua của kỳ. Không suy ra khấu hao 62,5 tháng hoặc áp cộng dồn 1,6% từ công thức một ô dự kiến. | QA chính `D11/D20`; Dự kiến `Tháng 9.2026 !I3:J3/G26`; QA bổ sung `C17:F17`. |
| OQ-12 | CH-14 ghi “sau 5 ngày kể từ khi có hóa đơn”. Mẫu tháng 9 yêu cầu trả 25–31/8 và ghi phí phạt chậm 200K/ngày. | “Có hóa đơn” là phát hành hay gửi; quan hệ với hạn thanh toán; có thu phạt thực tế và ghi vào kỳ nào không. Không tự chốt công nợ từ ngày 6, đúng hạn đến ngày 5, hoặc khẳng định không thu phạt. | QA chính `D19`; Hóa đơn T9 `HĐ (VP)!B20/J7` và mẫu TECH; QA bổ sung `C18:F18`. |
| OQ-13 | CH-19 ghi HH theo phần trăm, chi ngay khi khách đóng đủ “1 cọc 1” và ký HĐ; CH-20 ghi chia theo cá nhân. Mẫu hoa hồng có trạng thái đã/chưa thanh toán; G1 có các khoản hoa hồng trong marketing. | Kỳ ghi chi phí là tháng đủ điều kiện, duyệt hay thực chi; trường hợp trả nhiều lần. Không biến điều kiện được chi thành quy tắc kỳ hạch toán. | QA chính `D24:D25`; Hoa hồng `HOA HỒNG THÁNG 8.26!A2:M14`; G1 `BÁO CÁO THÁNG 8!C46:C48`; QA bổ sung `C19:F19`. |
| OQ-14 | Hóa đơn có phòng chủ nhà ở chỉ thu dịch vụ và khách đã đóng tiền cho chủ nhà. File có sheet riêng G16/G17/G18. | Tính các phòng này vào số phòng lương/HS/lấp đầy thế nào; xử lý bù trừ chủ nhà; kỳ đưa các tòa mới vào báo cáo chung. Không tự loại phòng giá 0 hoặc tạo bù trừ khi chưa có chính sách. | Hóa đơn T9 các sheet nhà và G16/G17/G18; các ca 203T35, 000S12, 000S30, 501–602G17 được nêu tại QA bổ sung `D20`; `F20` trống. |
| OQ-15 | Nội dung yêu cầu và nhãn trong mẫu hóa đơn chưa thống nhất: file hóa đơn có cột XE ĐIỆN, in thành DV Gửi xe; câu hỏi bổ sung đang hỏi quan hệ với phí sạc và gửi xe. | Hai phí riêng hay một phí; cách in và cộng báo cáo. Không tự gộp hoặc tách thành quy tắc đã chốt. | Hóa đơn T9 cột XE ĐIỆN và các mẫu HĐ; QA bổ sung `C21:F21`. |
| OQ-16 | Ca 301T41: sheet HOÀN CỌC ghi hoàn 2.530.000đ, mẫu HĐ (HOÀN CỌC) có trừ tiền ở thêm 1.103.226đ nên ra khoảng 1.426.774đ. | **Mâu thuẫn nguồn:** tiền ở thêm có trừ cọc không và chứng từ nào là chuẩn. Không tự chọn mặc định không trừ hoặc lập hóa đơn riêng như quy tắc của khách. | Hóa đơn T9 `HOÀN CỌC`, `HĐ (HOÀN CỌC)`; QA bổ sung `C22:F22`. |
| OQ-17 | Có tài liệu phân ba phase của bên triển khai và câu hỏi đề nghị khách xác nhận thứ tự ưu tiên. | QA chưa có xác nhận scope/phase. Kế hoạch v1.11 vẫn là đề xuất nội bộ, không được ghi khách đã duyệt. | QA bổ sung `C23:F23`; `docs/SRS/TimoHouse_Phan_chia_3_Phase.md:3` ghi trạng thái đề xuất. |

**Mẫu hóa đơn:** Excel cộng 12 dòng `I7:I18`. Thêm dòng “Thu khác” là đề xuất mở rộng bản in trên web để thể hiện khoản tiền có trong dữ liệu nguồn; cần ghi đúng trạng thái này và trình mẫu cập nhật cho khách, chưa được coi là mẫu khách đã duyệt.

## Các câu hỏi ưu tiên cần khách giải quyết

1. “Sau 5 ngày kể từ khi có hóa đơn” tính từ ngày **phát hành**, ngày **gửi**, hay ngày **hết hạn**? Tiền trả 1–5/9 cho hóa đơn hạn 31/8 là đúng hạn hay quá hạn?
2. Nhân viên/leader nhắc nợ được thấy **trạng thái**, **số còn nợ**, hay cả phải thu/đã thu? Có được xuất file không?
3. Báo cáo kinh doanh chọn công thức của **sheet thực tế**, hay điều chỉnh theo mô tả `báo cáo.xlsx!D6` và CH-15? Cách đối chiếu với số lịch sử sau điều chỉnh là gì?
4. Khấu hao có áp 1,6% cho mọi tài sản không? Cơ sở tính, tháng bắt đầu, thời gian khấu hao, số dư đầu kỳ và xử lý thanh lý thế nào?
5. Hoa hồng vào chi phí marketing ở tháng **đủ điều kiện**, **duyệt**, hay **thực chi**?
6. HS vận hành dưới 70% tính lương thế nào? Quy tắc 10% là 10% của khoản nào?
7. Tỷ lệ chuyển đổi là **chốt/xem** hay **xem/chốt**? Tính theo khách hay lượt xem, trong kỳ nào?
8. Khách có duyệt mẫu hóa đơn web thêm dòng **Thu khác** và phần tổng dời xuống không?

Đây là các câu ưu tiên cho những phát hiện R01–R09, không thay thế toàn bộ nội dung chưa chốt của 18 câu trong bảng trên.

## Giới hạn của review

Các workbook mẫu có liên kết ngoài, ô nhập tay, công thức lỗi và sheet ẩn. Review này xác nhận **công thức và ô bằng chứng được nêu**, chưa chứng minh mọi dòng của toàn bộ workbook hoặc mọi con số benchmark v1.11. Những chi tiết chỉ được dẫn qua phần căn cứ của QA bổ sung đã ghi rõ nguồn đó, không được xem là một lần kiểm tra lại độc lập trên toàn bộ dữ liệu gốc. Trạng thái của 18 câu OQ-01, OQ-01b, OQ-02…OQ-17 vẫn là **chưa có trả lời của khách**; cột E và các giả định trong đặc tả chưa có hiệu lực như chính sách khách đã duyệt.
