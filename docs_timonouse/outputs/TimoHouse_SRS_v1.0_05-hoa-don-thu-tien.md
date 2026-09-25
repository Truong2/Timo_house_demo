# TIMOHOUSE — SRS · Cụm Hóa đơn & thu tiền

**Phiên bản:** 1.0 · **Ngày lập:** 25/09/2026 · **Trạng thái:** DRAFT, chờ khách hàng xác nhận
**Phạm vi:** cụm menu **Hóa đơn & thu tiền** (spec §6.2) gồm FR11 Kỳ hóa đơn · FR12 Hóa đơn · FR13 Thu tiền · FR14 Công nợ & phạt · FR17 Zalo ZNS.

**Nguồn:** [`TimoHouse_UI_Mockup_Spec_v1.0.md`](TimoHouse_UI_Mockup_Spec_v1.0.md) bản 1.9: §4, §6, §7, UI-11, UI-12, UI-13, UI-14, UI-17, §13 (F-02, F-03), §14, §15 (#7, #8, #9, #10, #11), §16, §18 (P-03, P-09, P-13, P-14, P-17, P-19, P-20, P-26, P-27, P-30, P-31, P-33, P-35). Dữ liệu mẫu lấy từ [`TimoHouse_Mockup_Seed_Data_v1.0.md`](TimoHouse_Mockup_Seed_Data_v1.0.md) §3, §6, §8. Ảnh nằm ở [`ui-imagegen-v1/05-hoa-don-thu-tien/`](ui-imagegen-v1/05-hoa-don-thu-tien/README.md), kết luận ở [`AUDIT.md`](ui-imagegen-v1/AUDIT.md): **cả 5 ảnh của cụm đều KHÔNG ĐẠT nên không nhúng ảnh nào.** Mọi màn dưới đây dựng từ wireframe của spec.

Quy ước đọc tài liệu và Common Rules 1–14 xem [`TimoHouse_SRS_v1.0.md`](TimoHouse_SRS_v1.0.md#common-rules-dùng-chung-cho-mọi-fr); tài liệu này chỉ dẫn chiếu, không lặp lại.

> Tài liệu viết theo khung SRS Ekotek (skill `srs-generator`). Mỗi FR gồm đúng ba phần theo thứ tự: **Business Rule** → **Screen description** (một hoặc nhiều màn) → **User Steps**. Tiêu chí nghiệm thu và bảng truy vết đầy đủ vẫn nằm ở spec gốc; tài liệu này không lặp lại chúng.

---

## Quy tắc chung của cụm

Các FR trong file này dẫn chiếu `Cluster Rule 05.N` thay vì lặp lại. Mã này chỉ dùng trong cụm Hóa đơn & thu tiền.

| Mã | Nội dung | Nguồn |
|---|---|---|
| Cluster Rule 05.1 | **Ba mốc thời gian của hóa đơn tháng N.** Hóa đơn tháng N = tiền phòng tháng N (trả trước) + dịch vụ kỳ chốt ngày 22 tháng N−1 + nợ cũ + cọc/thu khác. Ví dụ kỳ 09/2026: tiền phòng tháng 09/2026 · kỳ DV 23/07 → 22/08 · chốt số 22/08 · phát hành dự kiến 23–25/08 · hạn TT 25/08 → 31/08. Hạn TT = ngày 25 → ngày cuối tháng phát hành. Mọi màn có hóa đơn phải tách bạch ba mốc: tiền phòng của tháng nào, kỳ dịch vụ từ ngày nào, hạn thanh toán bao giờ. Kỳ hóa đơn và kỳ báo cáo (refer to FR30) là hai đối tượng riêng, chỉ liên kết bằng tháng | UI-11, BR-2.09.4, D-09, BR-2.09.11, R-13 |
| Cluster Rule 05.2 | **Hai trục trạng thái của hóa đơn**, hiển thị bằng 2 chip riêng (Common Rule 4):<br>• Trạng thái chứng từ: `Nháp → Chờ duyệt → Phát hành`, nhánh `Điều chỉnh` / `Hủy`<br>• Tình trạng thu: `Chưa TT` (Σ đã phân bổ = 0), `Thiếu` (0 < Σ < Tổng cần đóng), `Đủ` (Σ = Tổng cần đóng), `Thừa` (Σ > Tổng cần đóng)<br>• <span style="color:#CC0000">Mục State của UI-12 ghi `Nháp → Chờ duyệt → Phát hành → Thu một phần → Đã thu đủ`, tức là trộn tình trạng thu vào trục chứng từ, trái với chú giải "Hai trục" của chính UI-12. Cần xác nhận "Thu một phần/Đã thu đủ" có phải trạng thái chứng từ không</span> | UI-12, BR-2.10.12, D-20 |
| Cluster Rule 05.3 | **Phạm vi hiệu lực của hóa đơn.** Chỉ hóa đơn từ `Phát hành` trở đi mới tính công nợ, DT phải thu và metric AC, mới được phân bổ thu tiền và xếp vào đợt gửi Zalo; `Nháp` và `Chờ duyệt` không tính. Hóa đơn `Phát hành` không sửa tại chỗ: sai thì tạo hóa đơn điều chỉnh âm/dương tham chiếu bản gốc, hoặc `Hủy` khi chưa có payment | BR-2.09.13, BR-2.09.9, R-11, spec §14 |
| Cluster Rule 05.4 | **Ngày thanh toán và mốc thu.**<br>• Ngày thanh toán = ngày tiền vào tài khoản (theo sao kê) hoặc ngày nhận tiền mặt, **không dùng ngày nhập liệu**. Ngày này quyết định mốc thu M1/M2/M3 (23:59 ngày 5 / 10 / 15, P-19) và tháng ghi nhận dòng tiền (CF)<br>• Chỉ payment `Đã xác nhận` mới vào mốc thu. Tiền mặt NVVH ở `Chờ xác nhận` chưa tính cho tới khi Kế toán xác nhận đã nộp (P-26, Decision Log #10, **ASSUMED**)<br>• Payment sau ngày chốt lương (16) vẫn ghi ngày thật; snapshot mốc **không tính lại** (BR-2.10.13, R-23)<br>• Payment có ngày thuộc kỳ đã khóa vẫn lưu nhưng đưa vào **kỳ hiện tại** dạng điều chỉnh (BR-2.10.14, R-08, Decision Log #7)<br>• <span style="color:#CC0000">Spec gọi tên mốc không thống nhất: F-05 và UI-01 dùng M1/M2/M3, mục Action của UI-13 ghi M5/M10/M15, nghiệm thu UI-13 ghi "mốc M10". Cần thống nhất một bộ tên</span> | BR-2.10.5, D-47, BR-2.10.10, F-05 |
| Cluster Rule 05.5 | **Tham số chờ chốt.** Mọi số liệu phụ thuộc một `P-xx` chưa chốt mang chip `Cần xác nhận nghiệp vụ` kèm mã tham số và đọc từ trang cấu hình tham số (refer to FR33), không hard-code. Tham số của cụm và giá trị đang dùng: P-03 prorate chia 30 · P-09 phạt 200.000 đ/ngày từ ngày thứ 6, không trần · P-13 điện chung gộp vào doanh thu điện · P-14 thứ tự phân bổ nợ cũ → dịch vụ → thu khác → tiền phòng → cọc · P-17 chuyển công nợ 5 ngày sau ngày phát hành · P-20 ngưỡng tô màu công nợ > 5 / > 15 ngày · P-26 tiền mặt chưa xác nhận không tính mốc · P-27 nợ phá HĐ thu tháng sau ghi CF tháng thu, không hồi tố hiệu suất · P-30 "dịch vụ chung" của HĐ gồm 4 khoản · P-31 phòng có đồng hồ nước · P-33 phạt theo HĐ khác phạt của hệ thống · P-35 mẫu nội dung CK | Spec §18 |
| Cluster Rule 05.6 | **Kỳ đã khóa và thao tác nhạy cảm.** Không phát hành hay điều chỉnh vào kỳ báo cáo đã khóa; điều chỉnh ghi vào kỳ hiện tại kèm tham chiếu chứng từ gốc. Các thao tác của cụm bắt buộc confirm + lý do theo Common Rule 11 và Common Rule 12: hủy chứng từ, đảo payment, xóa nợ, miễn phạt, trả sửa, ghi đè phân bổ, mở lại kỳ | BR-2.09.18, R-08, spec §14 |

---
---

# FR11 - Kỳ hóa đơn

## 1. Business Rule

| | |
|:-:|---|
| **Authorization** | • Admin, Kế toán: tạo kỳ, chạy preflight, tạo nháp hàng loạt, gửi duyệt, phát hành, khóa kỳ (spec §4: Kế toán phụ trách hóa đơn) <span style="color:#CC0000">(F-02 chỉ ghi "gửi duyệt hoặc phát hành theo quyền" — cần ma trận quyền cho từng action)</span><br>• Mở lại kỳ có lý do: <span style="color:#CC0000">## (Common Rule 12 giao mở khóa kỳ cho Admin nhưng đó là kỳ báo cáo; spec chưa nêu cho kỳ hóa đơn)</span><br>• NVVH: xem tiến độ và kết quả preflight của tòa được phân công; xử lý blocker tại màn nguồn (FR10, FR07); review hóa đơn nháp (F-02 bước 4)<br>• TNVH/Trưởng khu vực: nhận yêu cầu `Nhắc duyệt` và duyệt chỉ số ở FR10<br>• TPVH: <span style="color:#CC0000">## (spec chưa nêu quyền trên kỳ hóa đơn)</span><br>• Cổ đông, Vệ sinh: không truy cập |
| **Issuance Rule** | • Người dùng mở kỳ hóa đơn theo tháng, chạy preflight kiểm tra dữ liệu đầu vào, tạo hóa đơn nháp hàng loạt, gửi duyệt và phát hành hóa đơn theo từng tòa, sau cùng khóa kỳ<br>• Chức năng chỉ thực hiện được khi người dùng đã đăng nhập với vai trò thuộc Authorization <span style="color:#CC0000">##</span><br>• Mốc thời gian của kỳ theo Cluster Rule 05.1. Mã kỳ dạng `YYYY-MM`, ví dụ `2026-09` <span style="color:#CC0000">(cần xác nhận định dạng mã kỳ)</span><br>• Kỳ hóa đơn và kỳ báo cáo là hai đối tượng riêng, chỉ liên kết bằng tháng (refer to FR30)<br>• Phát hành được thực hiện **theo từng tòa**. Tòa còn blocker không chặn phát hành của tòa khác<br>• Preflight kiểm tra (F-02 bước 3):<br>&nbsp;&nbsp;◦ HĐ thiếu giá hoặc thiếu dịch vụ; bảng giá đúng tòa và đúng ngày hiệu lực (refer to FR09)<br>&nbsp;&nbsp;◦ Phòng thiếu số người<br>&nbsp;&nbsp;◦ Reading bất thường<br>&nbsp;&nbsp;◦ Lineage chỉ số: không tìm được chỉ số cũ từ hóa đơn trước hoặc OPENING, đứt kỳ, công tơ thay chưa xử lý (refer to FR10)<br>&nbsp;&nbsp;◦ Chỉ số chưa được TNVH duyệt<br>&nbsp;&nbsp;◦ Hóa đơn đã tồn tại cho HĐ + kỳ<br>&nbsp;&nbsp;◦ Tổng số dự kiến của kỳ<br>• Kết quả preflight có 2 mức:<br>&nbsp;&nbsp;◦ Blocker ✕: chặn phát hành hóa đơn liên quan, phải xử lý trước. Gồm reading điện (và nước nếu có đồng hồ) chưa duyệt, điện chung tòa chưa tính (BR-2.09.8, Cần chốt), không tìm được chỉ số cũ, công tơ thay chưa ghi chỉ số khởi tạo<br>&nbsp;&nbsp;◦ Cảnh báo △: cho đi tiếp. Ví dụ trên wireframe: HĐ thiếu dịch vụ điện, phòng thiếu số người, hóa đơn đã tồn tại (sẽ bỏ qua)<br>&nbsp;&nbsp;◦ <span style="color:#CC0000">Mức blocker/cảnh báo của các loại kiểm tra chưa có trên wireframe (HĐ thiếu giá, bảng giá sai ngày hiệu lực, reading bất thường): ##</span><br>• Tạo hóa đơn **idempotent**: mỗi `Contract + Room + Kỳ` chỉ có 1 hóa đơn hợp lệ, không tính bản điều chỉnh/hủy; chạy lại không sinh bản trùng (BR-2.09.3, Đã chốt)<br>• Phòng thiếu reading: hóa đơn của phòng đó giữ `Nháp`, batch vẫn phát hành phần còn lại<br>• Hóa đơn đầu của khách mới lập ngay khi kích hoạt HĐ, không đợi kỳ (BR-2.09.14). Khách vào sau ngày chốt (ví dụ 28/08) có hóa đơn đầu riêng; hóa đơn tháng 9 của khách đó chỉ có tiền phòng<br>• Phòng trống ghi reading loại `VACANT` ở FR10, không tạo hóa đơn<br>• Khi phát hành, chỉ số mới trên hóa đơn trở thành chỉ số cũ mặc định của hóa đơn kỳ tiếp theo cùng công tơ (F-02 bước 5)<br>• Trạng thái kỳ: wireframe hiển thị "Trạng thái: Mở". <span style="color:#CC0000">Spec chưa định nghĩa danh sách trạng thái kỳ hóa đơn và điều kiện chuyển (Mở → … → Đã khóa, nhánh Mở lại) — cần xác nhận</span><br>• Mở lại kỳ bắt buộc lý do (Cluster Rule 05.6). <span style="color:#CC0000">Tác động của `Khóa kỳ` hóa đơn lên hóa đơn và payment của kỳ chưa được đặc tả</span> |
| **Issuance Impact** | • Xem, lọc và chạy preflight không thay đổi dữ liệu hóa đơn. Kết quả preflight hiển thị theo lần chạy gần nhất <span style="color:#CC0000">(cần xác nhận có lưu lịch sử các lần chạy)</span><br>• Tạo kỳ: tạo bản ghi kỳ hóa đơn với trạng thái `Mở`<br>• Tạo nháp hàng loạt, với mỗi HĐ hiệu lực trong phạm vi quyền:<br>&nbsp;&nbsp;◦ Chưa có hóa đơn hợp lệ của kỳ -> tạo hóa đơn `Nháp` (refer to Management Impact của FR12), snapshot chỉ số cũ/mới, công tơ, nguồn, sản lượng và đơn giá<br>&nbsp;&nbsp;◦ Đã có hóa đơn hợp lệ -> bỏ qua, không tạo bản trùng<br>• Gửi duyệt: hóa đơn `Nháp` -> `Chờ duyệt`<br>• Phát hành theo tòa hoặc toàn kỳ: hóa đơn không vướng blocker -> `Phát hành`; snapshot tài khoản nhận và mẫu in; reading đã dùng -> `Đã dùng hóa đơn` (FR10); hóa đơn vào công nợ và được xếp đợt gửi Zalo theo Cluster Rule 05.3<br>• Mở lại kỳ: lưu lý do<br>• Mọi thao tác ghi audit theo Common Rule 5 |

## 2. Screen 11.1: Danh sách kỳ hóa đơn

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (mục "Danh sách" của UI-11).</span></p>
<p align="center"><b>Screen 11.1: Danh sách kỳ hóa đơn</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Kỳ hóa đơn`<br>• Breadcrumb: `Trang chủ / Hóa đơn & thu tiền / Kỳ hóa đơn` |
| 🟧 Quản lý kỳ hóa đơn | | | |
| Tiêu đề trang | Text | No | • Hiển thị "Kỳ hóa đơn" kèm tổng số kỳ (spec §7.1) |
| Tạo kỳ | Button | No | • Always display<br>• Enabled only when người dùng có quyền tạo kỳ (Common Rule 7)<br>• Click on -> Display Popup tạo kỳ hóa đơn (Screen 11.3) |
| 🟧 Filter section | | | • <span style="color:#CC0000">Spec không liệt kê bộ lọc cho danh sách kỳ — cần xác nhận (dự kiến Năm, Trạng thái kỳ)</span> |
| 🟦 Danh sách kỳ hóa đơn | | | • Display the list of kỳ hóa đơn<br>• If there are no kỳ in the system, display error message <span style="color:#CC0000">E##</span>, kèm giải thích và CTA `Tạo kỳ` theo quyền (Common Rule 13)<br>• Default sorting: <span style="color:#CC0000">## (dự kiến kỳ mới nhất lên đầu)</span><br>• Phân trang theo Common Rule 6<br>• Click on một dòng -> Go to Chi tiết kỳ hóa đơn (Screen 11.2) |
| Mã kỳ | Text | No | • Mã kỳ, ví dụ `2026-09` |
| Từ / đến | Text | No | • Khoảng thời gian của kỳ (Common Rule 10)<br>• <span style="color:#CC0000">Cần xác nhận đây là kỳ dịch vụ (23/07 → 22/08) hay tháng tiền phòng</span> |
| Ngày chốt | Text | No | • Ngày chốt chỉ số của kỳ, mặc định ngày 22 tháng N−1 |
| Phát hành dự kiến / thực tế | Text | No | • Dòng 1: khoảng ngày phát hành dự kiến, ví dụ "23–25/08"<br>• Dòng 2: ngày phát hành thực tế; chưa phát hành hiển thị `—` (Common Rule 3) |
| Tòa đã chốt chỉ số | Text | No | • Format: "{số tòa đã chốt}/{tổng tòa trong phạm vi}" |
| Hóa đơn nháp / phát hành | Text | No | • Format: "{số hóa đơn Nháp} / {số hóa đơn Phát hành}" |
| Trạng thái | Tag | No | • Trạng thái kỳ, gồm icon và chữ (Common Rule 4), ví dụ "Mở" |
| Blocker | Number | No | • Số blocker preflight còn lại của kỳ<br>• Lớn hơn 0: hiển thị kèm ký hiệu ✕ |
| Page number | Text | No | • Click on a page number -> Go to the corresponding page |

## 3. Screen 11.2: Chi tiết kỳ hóa đơn

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — ảnh ImageGen UI-11-billing-period-preflight.png KHÔNG ĐẠT (AUDIT: là màn preflight của một tòa, khác hẳn wireframe; thiếu header 3 mốc thời gian, bảng tiến độ theo tòa, thanh hành động; điện chung 8,816 đ/người là số bịa), không dùng. Nội dung dựng từ spec (wireframe UI-11).</span></p>
<p align="center"><b>Screen 11.2: Chi tiết kỳ hóa đơn</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Kỳ hóa đơn`<br>• Breadcrumb: `Trang chủ / Hóa đơn & thu tiền / Kỳ hóa đơn / {Mã kỳ}` |
| Tiêu đề | Text | No | • Hiển thị "Kỳ hóa đơn / {Mã kỳ}", ví dụ "Kỳ hóa đơn / 2026-09" |
| Ba mốc thời gian | Text | No | • Always display. Ba mốc tách bạch theo Cluster Rule 05.1<br>• Dòng 1: "Tiền phòng cho tháng {MM/YYYY} · Kỳ DV {DD/MM}→{DD/MM} · Chốt số {DD/MM}"<br>• Dòng 2: "Phát hành dự kiến {DD–DD/MM} · Hạn TT {DD/MM} → {DD/MM} · Trạng thái: {Trạng thái kỳ}"<br>• Ví dụ kỳ 2026-09: "Tiền phòng cho tháng 09/2026 · Kỳ DV 23/07→22/08 · Chốt số 22/08" và "Phát hành dự kiến 23–25/08 · Hạn TT 25/08 → 31/08 · Trạng thái: Mở" |
| Chạy preflight | Button | No | • Always display<br>• Enabled only when kỳ chưa khóa và người dùng có quyền (Common Rule 7)<br>• Click on -> Chạy toàn bộ kiểm tra preflight của kỳ trong phạm vi quyền, cập nhật ① và ②<br>• Trong lúc chạy, nút chuyển loading và disabled để chống bấm lặp (spec §5.4) |
| Tạo nháp hàng loạt | Button | No | • Always display<br>• Enabled only when kỳ ở trạng thái Mở và người dùng có quyền<br>• Click on -> Tạo hóa đơn Nháp cho mọi HĐ hiệu lực chưa có hóa đơn hợp lệ của kỳ; HĐ đã có hóa đơn -> bỏ qua (BR-2.09.3)<br>• Xong -> hiển thị toast số hóa đơn tạo mới và số bỏ qua <span style="color:#CC0000">(nội dung toast ##)</span><br>• <span style="color:#CC0000">Cần xác nhận có popup xác nhận trước khi tạo không (Screen ##)</span> |
| 🟧 ① Tiến độ theo tòa | | | • Cho phép phát hành từng tòa; tòa còn blocker không chặn tòa khác |
| 🟦 Bảng tiến độ theo tòa | | | • Mỗi tòa trong phạm vi quyền một dòng<br>• Default sorting: <span style="color:#CC0000">##</span><br>• Phân trang: <span style="color:#CC0000">## (cần xác nhận khi phạm vi có nhiều tòa)</span><br>• Click on một dòng -> <span style="color:#CC0000">## (lọc ② theo tòa?)</span><br>• Action trên dòng không kích hoạt click dòng (Common Rule 6) |
| Tòa | Text | No | • Mã tòa, ví dụ T17 |
| Phòng | Number | No | • Tổng số phòng của tòa |
| Chỉ số duyệt | Text | No | • Format: "{số phòng có chỉ số Đã duyệt}/{tổng phòng}" kèm ký hiệu (Common Rule 4):<br>&nbsp;&nbsp;◦ ✓: đủ, ví dụ "42/42 ✓"<br>&nbsp;&nbsp;◦ △: còn thiếu, ví dụ "35/38 △" |
| HĐ hiệu lực | Number | No | • Số HĐ thuê hiệu lực của tòa trong kỳ |
| Nháp | Number | No | • Số hóa đơn Nháp của tòa trong kỳ<br>• <span style="color:#CC0000">Wireframe dòng G6 ghi Nháp 28 và Phát hành 28 cùng lúc — cần xác nhận cột này đếm hóa đơn đang Nháp hay tổng số đã tạo nháp</span> |
| Phát hành | Number | No | • Số hóa đơn đã phát hành của tòa |
| Blocker | Number | No | • Số blocker preflight còn lại của tòa |
| Hành động | Button | No | • Nhãn đổi theo tình trạng của tòa:<br>&nbsp;&nbsp;◦ Phát hành: Display only when tòa có hóa đơn chờ phát hành và Blocker = 0. Click on -> Display Popup xác nhận thao tác kỳ, case Phát hành theo tòa (Screen 11.4)<br>&nbsp;&nbsp;◦ Xem lỗi: Display only when Blocker > 0. Click on -> Lọc ② chỉ còn dòng của tòa đó <span style="color:#CC0000">(cần xác nhận)</span><br>&nbsp;&nbsp;◦ Đã xong: Display only when mọi hóa đơn của tòa đã phát hành. Luôn disabled<br>• <span style="color:#CC0000">Cần xác nhận hóa đơn Nháp có được phát hành thẳng (bỏ qua Chờ duyệt) theo quyền không — F-02 ghi "gửi duyệt hoặc phát hành theo quyền"</span> |
| 🟧 ② Kết quả preflight | | | • Tiêu đề kèm tổng "{n} blocker · {m} △", ví dụ "3 blocker · 5 △"<br>• Chưa chạy preflight lần nào: <span style="color:#CC0000">## (nội dung trạng thái trống)</span> |
| 🟦 Danh sách kết quả preflight | | | • Mỗi dòng gồm ký hiệu mức, "{Tòa}/{Phòng}: {nội dung lỗi}" và nút xử lý<br>• Thứ tự: blocker ✕ trước, cảnh báo △ sau <span style="color:#CC0000">(cần xác nhận)</span><br>• Không còn lỗi: hiển thị trạng thái tốt <span style="color:#CC0000">(nội dung ##)</span><br>• Mọi blocker phải xử lý xong mới phát hành được hóa đơn liên quan |
| Mức | Tag | No | • Ký hiệu luôn đi cùng màu (Common Rule 4):<br>&nbsp;&nbsp;◦ ✕ Blocker: chặn phát hành hóa đơn liên quan<br>&nbsp;&nbsp;◦ △ Cảnh báo: cho đi tiếp |
| Nội dung | Text | No | • Mô tả lỗi và vị trí. Ví dụ theo wireframe:<br>&nbsp;&nbsp;◦ "✕ T24/103: không tìm được chỉ số cũ — đứt kỳ"<br>&nbsp;&nbsp;◦ "✕ T24/205: công tơ đã thay, chưa ghi chỉ số khởi tạo"<br>&nbsp;&nbsp;◦ "✕ T24/311: chỉ số chờ TNVH duyệt"<br>&nbsp;&nbsp;◦ "△ T17/402: HĐ thiếu dịch vụ điện"<br>&nbsp;&nbsp;◦ "△ G6/101: phòng thiếu số người"<br>&nbsp;&nbsp;◦ "△ Hóa đơn đã tồn tại cho {n} HĐ — sẽ bỏ qua, không tạo trùng" |
| Nút xử lý | Button | No | • Nút đổi theo loại lỗi:<br>&nbsp;&nbsp;◦ Xử lý ▸: Display only when lỗi thuộc chỉ số (đứt kỳ, thay công tơ). Click on -> Go to Điện nước & chỉ số, lọc theo tòa/phòng lỗi (refer to FR10)<br>&nbsp;&nbsp;◦ Nhắc duyệt: Display only when chỉ số chờ TNVH duyệt. Click on -> <span style="color:#CC0000">## (gửi thông báo hay tạo việc Work Queue cho TNVH?)</span><br>&nbsp;&nbsp;◦ Mở HĐ: Display only when lỗi thuộc HĐ (thiếu dịch vụ, thiếu số người). Click on -> Go to Chi tiết hợp đồng thuê (refer to FR07)<br>&nbsp;&nbsp;◦ Dòng "Hóa đơn đã tồn tại": không có nút |
| 🟧 ③ Dự kiến | | | • Số tổng để Kế toán ước lượng trước khi phát hành |
| Tổng hóa đơn | Text | No | • Số hóa đơn dự kiến của kỳ, ví dụ "1.079" |
| Tổng cần đóng | Text | No | • Tổng tiền dự kiến (Common Rule 8), ví dụ "6.482.150.000 đ"<br>• <span style="color:#CC0000">Cần xác nhận cách tính: Σ Tổng cần đóng của hóa đơn đã tạo nháp, hay ước tính cả HĐ chưa có nháp</span> |
| 🟧 ④ Thanh hành động | | | • Tạo hóa đơn idempotent theo HĐ + kỳ: chạy lại không sinh bản trùng |
| Tạo kỳ | Button | No | • Always display<br>• Enabled only when người dùng có quyền tạo kỳ<br>• Click on -> Display Popup tạo kỳ hóa đơn (Screen 11.3)<br>• <span style="color:#CC0000">Wireframe đặt `Tạo kỳ` trên màn của một kỳ đã tồn tại — cần xác nhận có giữ nút ở đây không (Screen 11.1 đã có)</span> |
| Gửi duyệt | Button | No | • Always display<br>• Enabled only when kỳ có ít nhất 1 hóa đơn Nháp và người dùng có quyền<br>• Click on -> Display Popup xác nhận thao tác kỳ, case Gửi duyệt (Screen 11.4) |
| Phát hành | Button | No | • Always display<br>• Enabled only when có ít nhất 1 tòa không còn blocker và còn hóa đơn chờ phát hành<br>• Click on -> Display Popup xác nhận thao tác kỳ, case Phát hành toàn kỳ (Screen 11.4). Chỉ phát hành hóa đơn của các tòa không còn blocker |
| Khóa kỳ | Button | No | • Display only when kỳ chưa khóa<br>• Enabled only when <span style="color:#CC0000">## (điều kiện khóa: mọi tòa đã phát hành?)</span><br>• Click on -> Display Popup xác nhận thao tác kỳ, case Khóa kỳ (Screen 11.4) |
| Mở lại có lý do | Button | No | • Display only when kỳ đã khóa<br>• Enabled only when người dùng có quyền mở lại (Common Rule 7)<br>• Click on -> Display Popup mở lại kỳ (Screen 11.5) |

## 4. Screen 11.3: Popup tạo kỳ hóa đơn

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Spec chỉ có action `Tạo kỳ`; các field dưới đây suy từ cột của danh sách kỳ (Screen 11.1), cần xác nhận.</span></p>
<p align="center"><b>Screen 11.3: Popup tạo kỳ hóa đơn</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận popup có X icon)</span> | | | |
| Tháng tiền phòng | Datepicker | Yes | • Always display<br>• Chọn theo tháng, format MM/YYYY<br>• Default selection: tháng kế tiếp kỳ gần nhất <span style="color:#CC0000">(cần xác nhận)</span><br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• Tháng đã có kỳ -> Show error message <span style="color:#CC0000">E##</span><br>• Select a month -> Tự tính các mốc bên dưới theo Cluster Rule 05.1 |
| Kỳ dịch vụ | Text | No | • Tự tính: 23 tháng N−2 → 22 tháng N−1, ví dụ "23/07 → 22/08"<br>• <span style="color:#CC0000">FR04 cho cấu hình ngày chốt theo tòa (BR-2.03.6); cần xác nhận kỳ dịch vụ khai báo theo kỳ hay theo từng tòa</span> |
| Ngày chốt số | Datepicker | Yes | • Always display<br>• Default selection: ngày 22 tháng N−1<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Phát hành dự kiến | Datepicker | No | • Always display<br>• Một ô chọn khoảng 2 ngày. Default selection: 23–25 tháng N−1<br>• Disable các ngày trước Ngày chốt số |
| Hạn TT | Text | No | • Tự tính: ngày 25 → ngày cuối tháng phát hành (BR-2.09.11), ví dụ "25/08 → 31/08" |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không lưu |
| Tạo kỳ | Button | No | • Always appear<br>• Enabled only when đã chọn Tháng tiền phòng<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> tạo kỳ trạng thái `Mở`, đóng popup và Go to Chi tiết kỳ hóa đơn (Screen 11.2) <span style="color:#CC0000">(màn đích cần xác nhận)</span> |

## 5. Screen 11.4: Popup xác nhận thao tác kỳ

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (§7.4, Common Rule 11).</span></p>
<p align="center"><b>Screen 11.4: Popup xác nhận thao tác kỳ</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Phạm vi | Text | No | • Popup dùng chung cho 3 action, mở từ Screen 11.2 hoặc từ nút `Phát hành` của một hóa đơn (Screen 12.2):<br>&nbsp;&nbsp;◦ Gửi duyệt: toàn kỳ<br>&nbsp;&nbsp;◦ Phát hành: một tòa, toàn kỳ hoặc một hóa đơn<br>&nbsp;&nbsp;◦ Khóa kỳ: toàn kỳ |
| Message | Text | No | • Content format: <span style="color:#CC0000">"##" (cần nội dung chính xác cho từng action)</span> |
| Checklist lỗi còn lại | Text | No | • Display only when action = Gửi duyệt (confirm nhẹ theo Common Rule 11)<br>• Liệt kê cảnh báo △ chưa xử lý của kỳ |
| Tóm tắt tác động | Text | No | • Display only when action = Phát hành (popup duyệt theo Common Rule 11)<br>• Hiển thị: số hóa đơn sẽ phát hành; số hóa đơn giữ Nháp do blocker kèm tòa/phòng; tổng cần đóng của phần phát hành (Common Rule 8)<br>• Ghi chú cố định: "Tài khoản nhận và mẫu in được chụp lại tại thời điểm phát hành. Hóa đơn phát hành không sửa tại chỗ." (BR-2.09.9, BR-2.09.10) |
| Nội dung khóa kỳ | Text | No | • Display only when action = Khóa kỳ<br>• <span style="color:#CC0000">## (cần đặc tả tác động của khóa kỳ hóa đơn)</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Xác nhận | Button | No | • Always appear. Nhãn theo action: "Gửi duyệt", "Phát hành", "Khóa kỳ"<br>• Always enabled<br>• Click on -> Thực hiện action:<br>&nbsp;&nbsp;◦ Gửi duyệt: hóa đơn `Nháp` -> `Chờ duyệt`<br>&nbsp;&nbsp;◦ Phát hành: hóa đơn không vướng blocker -> `Phát hành`<br>&nbsp;&nbsp;◦ Khóa kỳ: <span style="color:#CC0000">##</span><br>• Xong -> đóng popup, cập nhật màn gọi, hiển thị toast thành công (Common Rule 13) |

## 6. Screen 11.5: Popup mở lại kỳ

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (§7.4, Common Rule 11, Common Rule 12).</span></p>
<p align="center"><b>Screen 11.5: Popup mở lại kỳ</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Message | Text | No | • Danger modal (spec §7.4)<br>• Content format: <span style="color:#CC0000">"##" (cần nội dung chính xác)</span> |
| Dữ liệu bị ảnh hưởng | Text | No | • Liệt kê các snapshot và chứng từ bị ảnh hưởng khi mở lại (Common Rule 11) <span style="color:#CC0000">(cần danh sách cụ thể)</span> |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Mở lại | Button | No | • Always appear<br>• Enabled only when đã nhập Lý do<br>• Click on -> Mở lại kỳ, lưu lý do vào audit (Common Rule 5), đóng popup và cập nhật Screen 11.2 |

## 7. User Steps

| | |
|:-:|---|
| **Pre-condition** | Người dùng đã đăng nhập với vai trò Kế toán hoặc Admin; chỉ số của kỳ đã nhập và gửi duyệt ở FR10 (F-02 bước 1–2) |
| **User steps** | **Step 1:** Click menu `Kỳ hóa đơn` -> display Danh sách kỳ hóa đơn (Screen 11.1)<br>**Step 2:** Click `Tạo kỳ` -> display Popup tạo kỳ hóa đơn (Screen 11.3)<br>**Step 3:** Chọn tháng rồi click `Tạo kỳ` -> display Chi tiết kỳ hóa đơn (Screen 11.2) <span style="color:#CC0000">(màn đích cần xác nhận)</span><br>**Step 4:** Click `Chạy preflight`, tại một dòng blocker click `Xử lý ▸` -> display Điện nước & chỉ số (refer to FR10)<br>**Step 5:** Quay lại Screen 11.2, click `Tạo nháp hàng loạt` rồi click `Gửi duyệt` -> display Popup xác nhận thao tác kỳ (Screen 11.4)<br>**Step 6:** Tại dòng tòa không còn blocker ở ①, click `Phát hành` -> display Popup xác nhận thao tác kỳ, case Phát hành theo tòa (Screen 11.4)<br>**Step 7:** Sau khi phát hành, click `+ Tạo đợt gửi` ở menu `Zalo nhắc thanh toán` -> display Tạo đợt gửi (Screen 17.3) (F-02 bước 6) |

| | |
|:-:|---|
| **Pre-condition** | Người dùng có quyền mở lại kỳ; kỳ đã khóa |
| **User steps** | **Step 1:** Tại Danh sách kỳ hóa đơn (Screen 11.1), click dòng kỳ đã khóa -> display Chi tiết kỳ hóa đơn (Screen 11.2)<br>**Step 2:** Click `Mở lại có lý do` -> display Popup mở lại kỳ (Screen 11.5) |

---
---

# FR12 - Hóa đơn

## 1. Business Rule

| | |
|:-:|---|
| **Authorization** | • Admin, Kế toán: toàn quyền trên hóa đơn: tạo nháp, sửa dòng, tính lại, gửi duyệt, phát hành, điều chỉnh, hủy, in, xuất (spec §4)<br>• NVVH: hóa đơn của tòa được phân công: review và sửa dòng hóa đơn nháp, gửi duyệt, in, gửi Zalo <span style="color:#CC0000">(cần xác nhận NVVH có quyền phát hành không)</span><br>• TPVH, TNVH/Trưởng khu vực: xem hóa đơn trong phạm vi đơn vị <span style="color:#CC0000">(cần xác nhận)</span>; TPVH không sửa công nợ<br>• Cổ đông, Vệ sinh: không truy cập |
| **Management Rule** | • Người dùng xem danh sách và chi tiết hóa đơn phòng; lập, review, gửi duyệt và phát hành hóa đơn; tạo hóa đơn điều chỉnh hoặc hủy hóa đơn; in PDF và xuất Excel<br>• Chức năng chỉ thực hiện được khi người dùng đã đăng nhập với vai trò thuộc Authorization <span style="color:#CC0000">##</span><br>• Hóa đơn tháng N gồm tiền phòng tháng N và dịch vụ kỳ chốt ngày 22 tháng N−1 (Cluster Rule 05.1)<br>• Mỗi `Contract + Room + Kỳ` chỉ có 1 hóa đơn hợp lệ, không tính bản điều chỉnh/hủy (BR-2.09.3)<br>• **12 dòng cố định, thứ tự in bắt buộc** (R-09, D-14). Luôn render đủ 12 dòng; dòng không phát sinh để 0, không ẩn, để đối chiếu sổ Excel theo hàng. Mỗi dòng = `Đơn giá × Số lượng × Hệ số`:<br>&nbsp;&nbsp;◦ 1 Tiền phòng: SL = Kỳ TT · đơn giá = giá hiện tại · hệ số = Ngày ở ÷ 30<br>&nbsp;&nbsp;◦ 2 Tiền cọc (khách mới/bổ sung): SL 1 · đơn giá = cọc phải thu − đã thu · hệ số 1<br>&nbsp;&nbsp;◦ 3 Điện: SL = CS mới − CS cũ · 4.000 đ/kWh · hệ số 1<br>&nbsp;&nbsp;◦ 4 Nước: theo m³ (35.000 đ/m³, hệ số 1) khi phòng có đồng hồ, hoặc theo người (120.000 đ/người, hệ số Ngày DV ÷ 30) (P-31)<br>&nbsp;&nbsp;◦ 5 Vệ sinh: số người × 60.000 · hệ số Ngày DV ÷ 30<br>&nbsp;&nbsp;◦ 6 Internet: 1 × 100.000 đ/phòng · hệ số Ngày DV ÷ 30<br>&nbsp;&nbsp;◦ 7 Thang máy: số người × 50.000–60.000 · hệ số Ngày DV ÷ 30<br>&nbsp;&nbsp;◦ 8 Gửi xe/xe điện: số xe × 150.000 (Xanh SM 400.000) · hệ số Ngày DV ÷ 30<br>&nbsp;&nbsp;◦ 9 Máy giặt: số người × 60.000 · hệ số Ngày DV ÷ 30<br>&nbsp;&nbsp;◦ 10 Combo/DV khác: số người × 120.000 (= 60.000 vệ sinh + 60.000 máy giặt) · hệ số Ngày DV ÷ 30<br>&nbsp;&nbsp;◦ 11 Nợ cũ: SL 1 · số dư kỳ trước · hệ số 1<br>&nbsp;&nbsp;◦ 12 Điện chung: số người × đơn giá/người của kỳ (tự tính) · hệ số 1<br>&nbsp;&nbsp;◦ + Thu khác: n dòng, diễn giải bắt buộc (thêm người/xe, phạt, đền bù, ngày lẻ khách mới)<br>• Đơn giá là đơn giá mặc định, snapshot theo tòa/HĐ và ngày hiệu lực (refer to FR09)<br>• Mẫu số 30 cho mọi hệ số prorate (Decision Log #11, P-03, **ASSUMED**)<br>• `Tổng cần đóng` = Tổng DV + Giá hiện tại × Kỳ TT × (Ngày ở ÷ 30) + Nợ cũ + Cọc + Thu khác<br>• Ví dụ kiểm thử `101T17` kỳ 09/2026: tiền phòng 3.600.000 + điện (6.041 − 5.725) = 316 kWh × 4.000 = 1.264.000 + nước 1 người × 120.000 + internet 100.000 + combo 120.000 → Tổng DV 1.604.000 → Tổng cần đóng 5.204.000<br>• Kỳ TT = k > 1: dòng tiền phòng = giá × k; (k−1) kỳ sau không lập dòng tiền phòng, chỉ lập dịch vụ (BR-2.09.5)<br>• Nợ cũ = số dư hóa đơn kỳ trước tại ngày lập; sau khi lập, hóa đơn kỳ trước **đóng lại** để không đếm nợ 2 lần (BR-2.09.6, D-16, Đã chốt)<br>• Ngày lẻ tháng trước của khách mới = (giá + DV tháng) ÷ **31** × số ngày, xung đột với mẫu số 30 của dòng 1 (BR-2.09.7 → P-03, Cần chốt)<br>• **Kế thừa chỉ số:** khi tạo nháp kỳ N+1, `old_reading` = `new_reading` đã chốt trên dòng điện của hóa đơn hợp lệ gần nhất kỳ ≤ N cùng `meter_id`; hóa đơn đầu của công tơ lấy OPENING đã duyệt. Hóa đơn nguồn bị hủy/điều chỉnh -> resolve bản hợp lệ cuối cùng và cảnh báo nháp phụ thuộc; hóa đơn đã phát hành không cập nhật ngầm mà đi qua điều chỉnh. Lineage vẫn xem được sau khi đổi giá dịch vụ, đổi khách hoặc thay công tơ<br>• Số người trên hóa đơn = số người của HĐ tại ngày chốt. Sửa tay trên nháp phải ghi lý do và **không cập nhật ngược** vào HĐ (BR-2.09.17, Cần chốt)<br>• Chặn phát hành khi reading điện (và nước nếu có đồng hồ) chưa duyệt hoặc điện chung tòa chưa tính (BR-2.09.8, Cần chốt)<br>• **Điện chung (dòng 12):** sổ tháng 9 tính ra đơn giá/người nhưng không cộng vào Tổng DV. Màn hình phơi bày chỗ lệch, không tự cộng vào và không bỏ qua (P-13, P-30). <span style="color:#CC0000">Mâu thuẫn: BR-2.09.8 chặn phát hành khi điện chung chưa tính, nhưng wireframe hóa đơn 201G1 đang ở `Đã phát hành` với dòng 12 = 0 và khối ⑦ ✕ — cần chốt dòng 12 có là blocker phát hành không</span><br>• Tài khoản nhận và mẫu in snapshot tại phát hành; nội dung CK in trên hóa đơn = mã phòng (BR-2.09.10, R-12). Mẫu nội dung CK trên HĐ khách khác mã phòng -> phải chuẩn hóa khi sinh mẫu (P-35)<br>• Hạn TT theo Cluster Rule 05.1; chuyển công nợ theo FR14<br>• Phạt trễ 200.000 đ/ngày là **dòng Thu khác đề xuất** trên hóa đơn kỳ sau, qua chuỗi duyệt ở FR14 (BR-2.09.12 → P-09)<br>• Hóa đơn `Phát hành` không sửa; sai thì tạo hóa đơn điều chỉnh âm/dương tham chiếu gốc, hoặc `Hủy` khi chưa có payment (BR-2.09.9, R-11, Đã chốt)<br>• Kỳ báo cáo đã khóa: không phát hành/điều chỉnh vào kỳ đó (Cluster Rule 05.6)<br>• Trạng thái hóa đơn theo Cluster Rule 05.2; phạm vi tính công nợ theo Cluster Rule 05.3<br>• Gửi Zalo thành công **không đồng nghĩa** đã thanh toán (refer to FR17)<br>• Xuất Excel đúng thứ tự cột A–AZ của sổ hóa đơn |
| **Management Impact** | • Xem, lọc, in và xuất không làm thay đổi dữ liệu<br>• Tạo nháp (từ FR11 hoặc khi kích hoạt HĐ khách mới):<br>&nbsp;&nbsp;◦ Tạo `INVOICE` trạng thái `Nháp`, version v1, đủ 12 dòng<br>&nbsp;&nbsp;◦ Dòng điện lưu `meter_id`, kỳ, `old_reading`, `new_reading`, `consumption = new − old`, đơn giá snapshot, thành tiền, `source_reading_id`, `previous_invoice_id/line_id` hoặc OPENING<br>&nbsp;&nbsp;◦ Hóa đơn kỳ trước đóng lại sau khi số dư được chuyển vào dòng 11 Nợ cũ<br>• Sửa dòng, thêm Thu khác, sửa số người trên nháp: lưu giá trị mới, lý do và audit; tính lại tổng<br>• Gửi duyệt: `Nháp` -> `Chờ duyệt`. Trả sửa: `Chờ duyệt` -> `Nháp`, lưu lý do (Common Rule 11)<br>• Phát hành:<br>&nbsp;&nbsp;◦ `Nháp`/`Chờ duyệt` -> `Phát hành`<br>&nbsp;&nbsp;◦ Snapshot tài khoản nhận và mẫu in<br>&nbsp;&nbsp;◦ `new_reading` thành nguồn chỉ số cũ mặc định của kỳ sau; reading -> `Đã dùng hóa đơn` (FR10)<br>&nbsp;&nbsp;◦ Hóa đơn bắt đầu tính công nợ, DT phải thu, metric AC và được xếp đợt Zalo<br>• Điều chỉnh: tạo hóa đơn điều chỉnh âm/dương tham chiếu bản gốc; bản gốc giữ nguyên; kỳ ghi nhận theo Cluster Rule 05.6<br>• Hủy: `Phát hành` -> `Hủy`, lưu lý do; hóa đơn không còn tính là hợp lệ cho HĐ + kỳ<br>• Thu tiền (FR13) cập nhật Đã đóng, Còn lại và tình trạng thu<br>• Mọi thao tác ghi audit theo Common Rule 5 |

## 2. Screen 12.1: Danh sách hóa đơn

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (mục "Danh sách" của UI-12).</span></p>
<p align="center"><b>Screen 12.1: Danh sách hóa đơn</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Hóa đơn phòng`<br>• Breadcrumb: `Trang chủ / Hóa đơn & thu tiền / Hóa đơn phòng` |
| 🟧 Quản lý hóa đơn | | | |
| Tiêu đề trang | Text | No | • Hiển thị "Hóa đơn phòng" kèm tổng số hóa đơn theo bộ lọc (spec §7.1) |
| Xuất Excel | Button | No | • Always display<br>• Always enabled<br>• Click on -> Xuất các hóa đơn đang chọn hoặc toàn bộ kết quả lọc (spec §7.1) ra file Excel đúng thứ tự cột A–AZ của sổ hóa đơn <span style="color:#CC0000">(cần bảng mapping cột A–AZ)</span> |
| 🟧 Filter section | | | • Tiêu chí áp khi chọn và phản ánh lên URL (Common Rule 6)<br>• <span style="color:#CC0000">Cần capture để xác định bộ lọc inline hay popup</span> |
| Kỳ | Dropdown | No | • Default selection: kỳ đang chọn trên Header (Common Rule 1)<br>• Click on -> Display the list of options: danh sách kỳ hóa đơn<br>• Allow single selection only. Selecting an option automatically deselects the previous selection<br>• Select an option -> Search for all records with Kỳ = selected option |
| Phạm vi | Dropdown | No | • Default selection: Tất cả tòa trong phạm vi quyền<br>• Click on -> Display the list of options: Tất cả + các tòa trong phạm vi quyền <span style="color:#CC0000">(cần xác nhận có lọc theo khu vực/quản lý không)</span><br>• Allow single selection only<br>• Select an option -> Search for all records thuộc phạm vi đã chọn |
| Trạng thái chứng từ | Dropdown | No | • Default selection: Tất cả<br>• Click on -> Display the list of options: Tất cả, Nháp, Chờ duyệt, Phát hành, Điều chỉnh, Hủy (Cluster Rule 05.2)<br>• Allow single selection only<br>• Select an option -> Search for all records with Trạng thái chứng từ = selected option |
| Tình trạng thu | Dropdown | No | • Default selection: Tất cả<br>• Click on -> Display the list of options: Tất cả, Chưa TT, Thiếu, Đủ, Thừa (Cluster Rule 05.2)<br>• Allow single selection only<br>• Select an option -> Search for all records with Tình trạng thu = selected option |
| Hạn TT | Datepicker | No | • Một ô chọn khoảng 2 ngày. Date format: DD/MM/YYYY<br>• Click on -> Display a datepicker<br>• Click on -> Search for all records with Hạn TT in the specified date range |
| Zalo | Dropdown | No | • Default selection: Tất cả<br>• Click on -> Display the list of options: Tất cả, Chưa gửi + trạng thái tin của FR17 (Scheduled, Sent, Failed, Retrying, Gave up, Fallback, Skipped) <span style="color:#CC0000">(cần xác nhận danh sách)</span><br>• Allow single selection only<br>• Select an option -> Search for all records with trạng thái Zalo gần nhất = selected option |
| Khoảng tiền | Textbox | No | • Hai ô `Từ` và `Đến`, áp lên Tổng cần đóng <span style="color:#CC0000">(cần xác nhận áp lên Tổng cần đóng hay Còn lại)</span><br>• Allow entering numeric values (VND, Common Rule 8). Max length: 12<br>• Nếu `Từ` > `Đến` -> Show error message <span style="color:#CC0000">E##</span><br>• Nhập giá trị -> Search for all records có số tiền trong khoảng |
| Search box | Textbox | No | • Placeholder: <span style="color:#CC0000">##</span><br>• Max length: 255 characters<br>• Allow entering all types of characters<br>• Cut off the spaces before and after the keyword before performing search<br>• Nhập từ khóa -> sau 300ms (Common Rule 6) Search for all records which satisfy at least one of the following criteria:<br>&nbsp;&nbsp;◦ Số hóa đơn = keyword (Absolute search)<br>&nbsp;&nbsp;◦ Mã phòng = keyword (Absolute search)<br>&nbsp;&nbsp;◦ Tên khách contains keyword (Relative search)<br>• <span style="color:#CC0000">Spec §7.1 yêu cầu ô tìm kiếm cho mọi danh sách nhưng UI-12 chưa nêu tiêu chí — cần xác nhận</span> |
| 🟦 Danh sách hóa đơn | | | • Display the list of hóa đơn trong phạm vi quyền<br>• Giá trị trống hiển thị `—` (Common Rule 3)<br>• If there are no hóa đơn in the system, display error message <span style="color:#CC0000">E##</span><br>• If no record matches the search and filter criteria, display error message <span style="color:#CC0000">E##</span><br>• Default sorting: <span style="color:#CC0000">##</span><br>• Phân trang theo Common Rule 6<br>• Click on một dòng -> Go to Chi tiết hóa đơn (Screen 12.2) |
| Số hóa đơn | Text | No | • Mã hóa đơn, ví dụ `HD-2609-0417`<br>• <span style="color:#CC0000">Cần xác nhận quy tắc sinh số (HD-YYMM-xxxx?)</span> |
| Phòng / khách | Text | No | • Dòng 1: mã phòng. Dòng 2: tên khách đứng tên HĐ |
| Kỳ | Text | No | • Kỳ tiền phòng, format MM/YYYY |
| Tiền phòng | Number | No | • Thành tiền dòng 1 (Common Rule 8) |
| Dịch vụ | Number | No | • Tổng DV của hóa đơn |
| Thu khác / phạt | Number | No | • Tổng các dòng Thu khác, gồm phạt đã lên hóa đơn |
| Cọc | Number | No | • Thành tiền dòng 2 |
| Điều chỉnh | Number | No | • Tổng các hóa đơn điều chỉnh âm/dương tham chiếu hóa đơn này; không có hiển thị `—` |
| Tổng cần đóng | Number | No | • Theo công thức ở Management Rule |
| Đã đóng | Number | No | • Σ allocation vào hóa đơn (refer to FR13) |
| Còn lại | Number | No | • Tổng cần đóng − Đã đóng<br>• <span style="color:#CC0000">Thu thừa: hiển thị số âm hay 0 kèm Tag `Thừa` — cần xác nhận</span> |
| Hạn TT | Text | No | • Khoảng hạn thanh toán, ví dụ "25/08 → 31/08/2026" |
| Trạng thái | Tag | No | • Hai chip theo Cluster Rule 05.2: trạng thái chứng từ và tình trạng thu |
| Zalo | Tag | No | • Trạng thái gửi Zalo gần nhất (refer to FR17); chưa gửi hiển thị "Chưa gửi" |
| Page number | Text | No | • Click on a page number -> Go to the corresponding page |

## 3. Screen 12.2: Chi tiết hóa đơn

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — ảnh ImageGen UI-12-invoices.png KHÔNG ĐẠT (AUDIT: dòng 12 Điện chung ghi 60.533, đúng là 40.533; khối ⑦ dùng màu info thay vì blocker), không dùng. Nội dung dựng từ spec (wireframe UI-12, hóa đơn 201G1 kỳ 09/2026 — Seed §6.2).</span></p>
<p align="center"><b>Screen 12.2: Chi tiết hóa đơn</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Hóa đơn phòng`<br>• Breadcrumb: `Trang chủ / Hóa đơn & thu tiền / Hóa đơn phòng / {Mã phòng}` <span style="color:#CC0000">(wireframe dùng mã phòng "Hóa đơn / 201G1"; cần xác nhận cấp cuối là mã phòng hay số hóa đơn)</span> |
| Tiêu đề | Text | No | • Hiển thị "Hóa đơn / {Mã phòng}" kèm hai chip theo Cluster Rule 05.2<br>• Dòng phụ 1: "Kỳ {MM/YYYY} · {Trạng thái chứng từ} · Tòa {Mã tòa} · QL {Quản lý} · {n} người"<br>• Dòng phụ 2: "Ngày chốt số liệu {DD/MM/YYYY} · Hạn TT {DD/MM} → {DD/MM/YYYY}"<br>• Ví dụ 201G1: "Kỳ 09/2026 · Đã phát hành · Tòa G1 · QL Đỗ Thuỳ Linh · 2 người" và "Ngày chốt số liệu 22/08/2026 · Hạn TT 25/08 → 31/08/2026" |
| Số người | Textbox | No | • Display only when trạng thái = Nháp; các trạng thái khác chỉ đọc trên dòng phụ<br>• Default: số người của HĐ tại ngày chốt (BR-2.09.17)<br>• Allow entering numeric values. Max length: 12<br>• If entering 0, display error message <span style="color:#CC0000">E##</span><br>• Đổi giá trị -> bắt buộc nhập lý do; không cập nhật ngược vào HĐ<br>• <span style="color:#CC0000">Vị trí ô sửa và popup nhập lý do chưa có trên wireframe (Screen ##)</span> |
| Tính lại | Button | No | • Display only when trạng thái = Nháp<br>• Enabled only when người dùng có quyền sửa hóa đơn<br>• Click on -> Tính lại toàn bộ dòng từ dữ liệu nguồn hiện hành (HĐ, bảng giá, chỉ số đã duyệt, số người)<br>• <span style="color:#CC0000">Cần xác nhận giữ hay ghi đè giá trị đã sửa tay</span> |
| Gửi duyệt | Button | No | • Display only when trạng thái = Nháp<br>• Enabled only when người dùng có quyền gửi duyệt<br>• Click on -> <span style="color:#CC0000">Display confirm nhẹ kèm checklist lỗi còn lại theo Common Rule 11 (Screen ##)</span> |
| Trả sửa | Button | No | • Display only when trạng thái = Chờ duyệt<br>• Enabled only when người dùng có quyền duyệt<br>• Click on -> <span style="color:#CC0000">Display popup Trả sửa, bắt buộc lý do và chọn dòng liên quan (Common Rule 11) (Screen ##)</span> |
| Phát hành | Button | No | • Display only when trạng thái = Chờ duyệt, hoặc Nháp nếu người dùng được phát hành thẳng<br>• Enabled only when hóa đơn không còn blocker (BR-2.09.8). Khi disabled, tooltip liệt kê blocker<br>• Click on -> Display Popup xác nhận thao tác kỳ, case Phát hành một hóa đơn (Screen 11.4) |
| Điều chỉnh | Button | No | • Display only when trạng thái = Phát hành. Đây là CTA chính của hóa đơn đã phát hành (spec 1.7)<br>• Enabled only when người dùng có quyền điều chỉnh (Common Rule 7)<br>• Click on -> Display Popup tạo hóa đơn điều chỉnh (Screen 12.4) |
| Gửi Zalo | Button | No | • Display only when trạng thái = Phát hành (Cluster Rule 05.3)<br>• Enabled only when người dùng có quyền gửi Zalo<br>• Click on -> <span style="color:#CC0000">## (gửi ngay 1 tin hay mở Tạo đợt gửi Screen 17.3 với phạm vi là hóa đơn này?)</span> |
| In PDF | Button | No | • Always display<br>• Always enabled<br>• Click on -> Xuất PDF theo mẫu in của tòa. Hóa đơn đã phát hành dùng mẫu in đã snapshot <span style="color:#CC0000">(hóa đơn Nháp dùng mẫu hiện hành? cần xác nhận)</span> |
| ⋯ | Button | No | • Always display<br>• Always enabled<br>• Click on -> Display a dropdown for actions:<br>&nbsp;&nbsp;◦ Xuất Excel: Click on -> Xuất hóa đơn theo cột A–AZ<br>&nbsp;&nbsp;◦ Hủy hóa đơn: Display only when trạng thái = Phát hành và chưa có payment phân bổ. Click on -> Display Popup hủy hóa đơn (Screen 12.5)<br>&nbsp;&nbsp;◦ <span style="color:#CC0000">Các action khác trong menu: ## (cần capture dropdown)</span> |
| 🟧 Thông tin hóa đơn | | | • Theo mẫu hóa đơn T9/2026 (sheet G16/G17/G18)<br>• <span style="color:#CC0000">Wireframe chưa vẽ khối này — cần capture để xác định vị trí</span> |
| Số hóa đơn | Text | No | • Display số hóa đơn |
| Khách · HĐ | Text | No | • Display tên khách và mã HĐ thuê<br>• Click on mã HĐ -> Go to Chi tiết hợp đồng thuê (refer to FR07) |
| Kỳ TT | Text | No | • Display số tháng của kỳ thanh toán, ví dụ "1 tháng" |
| Giá niêm yết · Giá QL · Giá hiện tại | Text | No | • Display ba lớp giá của phòng (Common Rule 8); giá hiện tại là giá chốt HĐ (refer to FR05) |
| Ngày ở · Ngày DV | Text | No | • Display số ngày ở và số ngày dịch vụ dùng cho hệ số, ví dụ "30 · 30"<br>• Dòng tiền phòng hiển thị từ–đến, số ngày và prorate `/30` (**ASSUMED**, P-03) |
| Cọc đang giữ | Text | No | • Display tiền cọc của khách đang giữ |
| 🟧 ① 12 dòng cố định | | | • Luôn render đủ 12 dòng theo đúng thứ tự in; dòng không phát sinh để 0, không ẩn |
| 🟦 Bảng 12 dòng | | | • Không phân trang, không sắp xếp; thứ tự dòng cố định theo Management Rule<br>• Dòng Thu khác (0..n dòng) nằm sau dòng 12, đánh dấu "+"<br>• Mọi số dùng tabular figures, định dạng Common Rule 8 |
| # | Number | No | • Số thứ tự 1–12; dòng Thu khác hiển thị "+" |
| Dòng | Text | No | • Tên dòng: Tiền phòng, Tiền cọc, Điện, Nước, Vệ sinh, Internet, Thang máy, Gửi xe/xe điện, Máy giặt, Combo/DV khác, Nợ cũ, Điện chung, Thu khác |
| SL | Text | No | • Số lượng kèm đơn vị, ví dụ "1kỳ", "183" (kWh), "2ng" (người), "1" (xe)<br>• Không áp dụng: `—` |
| Đơn giá | Number | No | • Đơn giá snapshot (Common Rule 8); không áp dụng: `—` |
| Hệ số | Text | No | • Hiển thị dạng phân số "Ngày ở ÷ 30" hoặc "Ngày DV ÷ 30", ví dụ "30/30"<br>• Điện, nước theo đồng hồ, nợ cũ, điện chung: "1"<br>• Kèm chip P-03 theo Cluster Rule 05.5 |
| Thành tiền | Number | No | • = Đơn giá × SL × Hệ số; dòng không phát sinh hiển thị 0 |
| Nguồn | Text | No | • Ghi chú nguồn của dòng. Ví dụ hóa đơn 201G1: "giá chốt HĐ", "đã thu đủ", "② xem dưới", "theo đầu người", "gộp vào dòng 10", "snapshot HĐ", "1 xe điện", "kỳ 08 đã đủ", "✕ xem ⑦"<br>• <span style="color:#CC0000">Click on ghi chú "② xem dưới" / "✕ xem ⑦" -> ## (cuộn tới khối tương ứng?)</span> |
| Thêm dòng Thu khác | Button | No | • Display only when trạng thái = Nháp<br>• Enabled only when người dùng có quyền sửa hóa đơn<br>• Click on -> Display Popup thêm dòng Thu khác (Screen 12.3) |
| Tổng DV | Text | No | • Display tổng các dòng dịch vụ, ví dụ 201G1 "1.582.000" |
| ③ Tổng cần đóng | Text | No | • Display Tổng cần đóng theo công thức ở Management Rule, ví dụ 201G1 "5.682.000" (= 1.582.000 + 4.100.000 × 1 × 30/30) |
| Đã đóng | Tag | No | • Display tình trạng thu (Cluster Rule 05.2), ví dụ "Đủ" |
| 🟧 ② Dòng điện — chỉ số nối kỳ | | | • Bắt buộc hiển thị cả hai chỉ số và chứng từ nguồn của từng chỉ số |
| Chỉ số cũ | Text | No | • Display `old_reading` kèm nguồn: "nguồn: hóa đơn kỳ {MM/YYYY} cùng công tơ" hoặc "OPENING đã duyệt"<br>• Ví dụ 201G1: "655 ◂ nguồn: hóa đơn kỳ 08/2026 cùng công tơ"<br>• Mở ▸: Click on -> Go to Chi tiết hóa đơn nguồn (Screen 12.2 của hóa đơn đó) hoặc chứng từ OPENING (refer to FR10) |
| Chỉ số mới | Text | No | • Display `new_reading` kèm nguồn: "chỉ số kỳ {MM} đã duyệt {DD/MM}"<br>• Ví dụ 201G1: "838 ◂ chỉ số kỳ 09 đã duyệt 22/08"<br>• Mở chứng từ ▸: Click on -> Go to chỉ số nguồn (refer to FR10) |
| Sản lượng | Text | No | • Content format: "Sản lượng {SL} kWh × {đơn giá} đ = {thành tiền} đ", ví dụ "183 kWh × 4.000 đ = 732.000 đ" |
| Cảnh báo nguồn chỉ số | Text | No | • Display only when hóa đơn nguồn bị hủy/điều chỉnh sau khi hóa đơn này được tạo<br>• Content format: <span style="color:#CC0000">"##"</span>. Hóa đơn Nháp: cảnh báo nháp phụ thuộc; hóa đơn đã phát hành: không tự cập nhật, xử lý qua điều chỉnh |
| Khối chỉ số nước | Text | No | • Display only when phòng có đồng hồ nước (P-31)<br>• <span style="color:#CC0000">Wireframe chưa có khối này — cần xác nhận hiển thị giống khối ②</span> |
| 🟧 ⑦ Điện chung đã tính nhưng chưa vào hóa đơn | | | • Display only when dòng 12 có đơn giá/người nhưng thành tiền không được cộng vào Tổng DV<br>• Hiển thị mức ✕ (blocker), không dùng màu thông tin (AUDIT)<br>• Kèm chip P-13, P-30 theo Cluster Rule 05.5 |
| Diễn giải điện chung | Text | No | • Content format: "Công tơ chung {tên}: {CS cũ} → {CS mới} = {SL} kWh × {đơn giá} = {thành tiền}" + "÷ {n} người sử dụng = {đơn giá/người} đ/người → phần của {phòng} = {số tiền}" + "Sổ tháng 9 tính ra số này nhưng KHÔNG cộng vào Tổng DV." + "→ Cần chốt: dòng 12 có thu hay đã nằm trong combo? (P-13, P-30)"<br>• Ví dụ 201G1: "Công tơ chung tầng 2: 1.935 → 1.967 = 32 kWh × 3.800 = 121.600 ÷ 3 người sử dụng = 40.533,33 đ/người → phần của 201G1 = 81.067" (Seed §6.3) |
| 🟧 ④ Thanh toán | | | |
| Nội dung CK | Text | No | • Display nội dung chuyển khoản = mã phòng (BR-2.09.10), ví dụ "201G1" |
| TK nhận | Text | No | • Display tài khoản nhận đã snapshot tại phát hành, ví dụ "BIDV 2120368058" (Seed §3)<br>• <span style="color:#CC0000">Common Rule 2 che số tài khoản theo quyền; cần xác nhận TK nhận của công ty trên hóa đơn có che không</span> |
| Đã thu | Text | No | • Display "Đã thu đủ {số tiền}" hoặc "Đã thu {Σ} · còn {Còn lại}" theo tình trạng thu, ví dụ "Đã thu đủ 5.682.000" |
| Bảng phân bổ | Text | No | • Display các payment đã phân bổ vào hóa đơn: mã payment, ngày thanh toán, mốc thu, số tiền (refer to FR13); tổng thu, còn, thừa<br>• <span style="color:#CC0000">Wireframe chưa vẽ bảng này — cần capture</span> |
| Xem payment ▸ | Button | No | • Always display<br>• Always enabled<br>• Click on -> Go to Thu tiền, lọc các payment đã phân bổ vào hóa đơn này (Screen 13.1) |
| Xem công nợ ▸ | Button | No | • Always display<br>• Always enabled<br>• Click on -> Go to Công nợ & phạt, lọc theo phòng của hóa đơn (Screen 14.1) |
| 🟧 ⑤ Zalo | | | • Gửi thành công không đồng nghĩa đã thanh toán |
| Trạng thái gửi | Text | No | • Display trạng thái tin gần nhất, template, lần gửi gần nhất, số lần retry và phương án dự phòng (refer to FR17)<br>• Ví dụ: "Chưa gửi · template HOADON_THANG" |
| Xếp vào đợt gửi | Button | No | • Display only when trạng thái = Phát hành và chưa gửi<br>• Enabled only when người dùng có quyền gửi Zalo<br>• Click on -> <span style="color:#CC0000">## (thêm vào đợt đang chờ gửi hay tạo đợt mới ở Screen 17.3?)</span> |
| 🟧 ⑥ Audit | | | |
| Lịch sử phiên bản | Text | No | • Display mỗi version một dòng: "v{n} {hành động} {DD/MM} bởi {người}", ví dụ "v1 tạo 23/08 bởi Đỗ Thuỳ Linh"<br>• Gồm tạo, sửa dòng, gửi duyệt, phát hành, điều chỉnh, hủy; kèm actor và lý do (Common Rule 5)<br>• <span style="color:#CC0000">Click on một version -> ## (xem diff?)</span> |

## 4. Screen 12.3: Popup thêm dòng Thu khác

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (dòng "+ Thu khác" của UI-12).</span></p>
<p align="center"><b>Screen 12.3: Popup thêm dòng Thu khác</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận popup có X icon)</span> | | | |
| Loại khoản | Dropdown | Yes | • Always display<br>• Placeholder: <span style="color:#CC0000">##</span><br>• Default selection: None<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• Click on -> Display the list of following options: Thêm người/xe, Đền bù, Ngày lẻ khách mới, <span style="color:#CC0000">Khác (cần xác nhận danh mục)</span><br>• Allow single selection only<br>• Phạt trễ hạn không nhập tay ở đây mà vào qua chuỗi duyệt phạt (refer to Screen 14.2) <span style="color:#CC0000">(cần xác nhận có chặn nhập phạt thủ công)</span> |
| Diễn giải | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Số tiền | Textbox | Yes | • Always display<br>• Allow entering numeric values (VND, Common Rule 8). Max length: 12<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• If entering 0, display error message <span style="color:#CC0000">E##</span><br>• <span style="color:#CC0000">Cần xác nhận có nhập theo Đơn giá × SL × Hệ số như 12 dòng cố định hay nhập thẳng thành tiền</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không lưu |
| Thêm | Button | No | • Always appear<br>• Enabled only when đã nhập đủ field bắt buộc<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> thêm dòng Thu khác sau dòng 12, tính lại Tổng cần đóng, ghi audit, đóng popup |

## 5. Screen 12.4: Popup tạo hóa đơn điều chỉnh

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (BR-2.09.9, BR-2.09.18).</span></p>
<p align="center"><b>Screen 12.4: Popup tạo hóa đơn điều chỉnh</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận dạng popup hay trang riêng)</span> | | | |
| Hóa đơn gốc | Text | No | • Display số hóa đơn gốc, kỳ, Tổng cần đóng và tình trạng thu |
| Chiều điều chỉnh | Dropdown | Yes | • Always display<br>• Default selection: None<br>• Click on -> Display the list of following options: Âm (giảm số phải thu), Dương (tăng số phải thu)<br>• Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Dòng điều chỉnh | Dropdown | Yes | • Always display<br>• Click on -> Display the list of following options: 12 dòng cố định và các dòng Thu khác của hóa đơn gốc<br>• Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• <span style="color:#CC0000">Điều chỉnh dòng điện có cho nhập lại chỉ số và cập nhật lineage không — cần xác nhận</span> |
| Số tiền | Textbox | Yes | • Always display<br>• Allow entering numeric values (VND). Max length: 12<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• If entering 0, display error message <span style="color:#CC0000">E##</span> |
| Kỳ ghi nhận | Text | No | • Tự xác định: kỳ của hóa đơn gốc; nếu kỳ báo cáo đó đã khóa thì ghi vào kỳ hiện tại kèm tham chiếu chứng từ gốc (Cluster Rule 05.6) |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không lưu |
| Tạo điều chỉnh | Button | No | • Always appear<br>• Enabled only when đã nhập đủ field bắt buộc<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ Điều chỉnh âm vượt số của dòng gốc -> display error message <span style="color:#CC0000">E## (cần xác nhận có chặn không)</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> tạo hóa đơn điều chỉnh tham chiếu bản gốc, bản gốc giữ nguyên, đóng popup<br>• <span style="color:#CC0000">Trạng thái ban đầu và luồng duyệt của hóa đơn điều chỉnh: ##</span> |

## 6. Screen 12.5: Popup hủy hóa đơn

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (BR-2.09.9, §7.4).</span></p>
<p align="center"><b>Screen 12.5: Popup hủy hóa đơn</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Message | Text | No | • Danger modal (spec §7.4)<br>• Content format: <span style="color:#CC0000">"##" (cần nội dung chính xác)</span><br>• Chỉ hủy được khi hóa đơn chưa có payment phân bổ (BR-2.09.9) |
| Cảnh báo phụ thuộc | Text | No | • Display only when hóa đơn này là nguồn chỉ số cũ của một hóa đơn nháp kỳ sau<br>• Liệt kê hóa đơn nháp phụ thuộc; sau khi hủy, nháp đó resolve về bản hợp lệ cuối cùng |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy bỏ | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Hủy hóa đơn | Button | No | • Always appear<br>• Enabled only when đã nhập Lý do<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ Hóa đơn đã có payment phân bổ -> display error message <span style="color:#CC0000">E##</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> chuyển hóa đơn sang `Hủy`, lưu lý do, đóng popup và cập nhật Screen 12.2 |

## 7. User Steps

| | |
|:-:|---|
| **Pre-condition** | Người dùng đã đăng nhập với vai trò thuộc Authorization của FR12; kỳ đã tạo hóa đơn nháp ở FR11 (F-02 bước 4) |
| **User steps** | **Step 1:** Click menu `Hóa đơn phòng` -> display Danh sách hóa đơn (Screen 12.1)<br>**Step 2:** Click một dòng hóa đơn Nháp -> display Chi tiết hóa đơn (Screen 12.2)<br>**Step 3:** Click `Thêm dòng Thu khác` -> display Popup thêm dòng Thu khác (Screen 12.3)<br>**Step 4:** Click `Thêm` -> quay lại Screen 12.2, click `Phát hành` -> display Popup xác nhận thao tác kỳ, case Phát hành một hóa đơn (Screen 11.4) |

| | |
|:-:|---|
| **Pre-condition** | Người dùng có quyền điều chỉnh/hủy; hóa đơn đã phát hành có sai sót |
| **User steps** | **Step 1:** Tại Chi tiết hóa đơn (Screen 12.2), click `Điều chỉnh` -> display Popup tạo hóa đơn điều chỉnh (Screen 12.4)<br>**Step 2:** Nếu hóa đơn chưa có payment, click `⋯` → `Hủy hóa đơn` -> display Popup hủy hóa đơn (Screen 12.5)<br>**Step 3:** Click `Xem payment ▸` -> display Thu tiền đã lọc theo hóa đơn (Screen 13.1) |

---
---

# FR13 - Thu tiền

## 1. Business Rule

| | |
|:-:|---|
| **Authorization** | • Kế toán, Admin: ghi nhận thu, import sao kê, auto match, ghép thủ công, phân bổ tay, đổi thứ tự phân bổ có lý do, tạo credit, xác nhận tiền mặt đã nộp, đảo payment, xuất (spec §4)<br>• NVVH: báo thu tiền mặt cho tòa được phân công; payment ở `Chờ xác nhận` (spec §4, BR-2.10.10)<br>• TPVH: <span style="color:#CC0000">## (spec chỉ nêu TPVH không sửa công nợ)</span><br>• Cổ đông, Vệ sinh: không truy cập |
| **Collection Rule** | • Người dùng ghi nhận các khoản tiền thu (chuyển khoản, tiền mặt, khác), ghép payment với hóa đơn, phân bổ payment vào dòng hóa đơn, xử lý phần dư và xác nhận tiền mặt đã nộp<br>• Chức năng chỉ thực hiện được khi người dùng đã đăng nhập với vai trò thuộc Authorization <span style="color:#CC0000">##</span><br>• Ngày thanh toán và mốc thu theo Cluster Rule 05.4<br>• Chỉ phân bổ vào hóa đơn từ `Phát hành` trở đi (Cluster Rule 05.3)<br>• 1 payment → n hóa đơn và 1 hóa đơn → n payment; thu một phần hợp lệ (BR-2.10.2, R-12, Đã chốt)<br>• Σ allocation của 1 payment ≤ số tiền payment; phần dư = **tạm ứng (credit)** gắn khách/HĐ (BR-2.10.1, Đã chốt)<br>• **Auto-match:** nội dung CK chứa mã phòng **và** đúng tài khoản nhận của tòa → đề xuất allocation vào hóa đơn mở **cũ nhất trước**; không match → `Chưa xác định`, không gán vào hóa đơn nào (BR-2.10.3)<br>&nbsp;&nbsp;◦ Khách chuyển nhầm sang tài khoản tòa khác → vẫn match theo mã phòng nhưng gắn cờ "sai TK"<br>&nbsp;&nbsp;◦ Khách chuyển gộp 2 phòng → 1 payment sinh 2 allocation<br>&nbsp;&nbsp;◦ Mẫu nội dung CK trên HĐ khác mã phòng (ví dụ `P302 - TH01 - TÊN` so với `302TH01`) phải được chuẩn hóa, nếu không auto-match sẽ trượt (P-35)<br>&nbsp;&nbsp;◦ <span style="color:#CC0000">Mâu thuẫn: BR-2.10.3 đòi đủ 2 điều kiện, ngoại lệ lại cho match khi sai TK; wireframe để PM-8822 (sai TK) ở `Chưa xác định` chờ ghép tay, còn nghiệm thu yêu cầu dòng sao kê `204S12` · 6.466.000 vào TK VP-Hằng "tự match đúng". Cần chốt sai TK là tự match kèm cờ hay chỉ ghép tay</span><br>• **Thứ tự phân bổ mặc định** vào dòng hóa đơn: nợ cũ → 7 dịch vụ + điện chung → thu khác/phạt → tiền phòng → cọc (BR-2.10.4 → P-14, Decision Log #8, **ASSUMED**). Kế toán đổi được cho từng payment, bắt buộc lý do. Thứ tự này quyết định doanh thu CF theo dòng: phòng phá HĐ chỉ đóng phần dịch vụ sẽ tự loại khỏi doanh thu tiền phòng<br>• Thu thừa → tình trạng `Thừa`, tạo credit tự khấu trừ vào hóa đơn kỳ sau; **không hoàn tiền mặc định** (BR-2.10.6, Cần chốt)<br>• Allocation loại cọc đồng thời ghi bút toán `collect` vào Deposit Ledger (BR-2.10.7, R-05; refer to FR16)<br>• Payment cho hóa đơn kỳ trước → doanh thu CF tại **tháng nộp**; AC chỉ giảm công nợ (BR-2.10.8, R-03)<br>• Thu nợ của HĐ đã phá phân bổ vào hóa đơn cuối của HĐ đó, ghi doanh thu CF tháng thu, **không hồi tố hiệu suất** tháng cũ (BR-2.10.11 → P-27)<br>• Tình trạng thu của hóa đơn theo Cluster Rule 05.2 (BR-2.10.12)<br>• Đảo (reverse) sinh bản ghi đảo âm cùng ngày đảo, **không xóa** bản gốc; allocation liên quan hủy theo (BR-2.10.9, Đã chốt)<br>• Form payment:<br>&nbsp;&nbsp;◦ Kênh: Chuyển khoản / Tiền mặt / Khác<br>&nbsp;&nbsp;◦ Khách/phòng/nội dung CK có thể chưa xác định khi import sao kê<br>&nbsp;&nbsp;◦ Số tiền > 0, VND<br>&nbsp;&nbsp;◦ Tiền mặt bắt buộc người thu<br>&nbsp;&nbsp;◦ Minh chứng bắt buộc khi xác nhận thủ công<br>• Trạng thái payment: `Chờ xác nhận → Đã xác nhận → Đã đảo`; payment chưa phân bổ hiển thị nhãn `Chưa xác định`. <span style="color:#CC0000">Cần xác nhận payment chuyển khoản từ sao kê vào thẳng `Đã xác nhận` hay qua `Chờ xác nhận`</span> |
| **Collection Impact** | • Xem, lọc, xuất không làm thay đổi dữ liệu<br>• Ghi nhận thu: tạo `PAYMENT` mã `PM-xxxx` <span style="color:#CC0000">(cần xác nhận cách sinh mã)</span>; tiền mặt NVVH ở `Chờ xác nhận`<br>• Import sao kê: mỗi dòng sao kê tạo một payment; mỗi lần import là một job theo Common Rule 14; chạy auto-match cho các dòng mới<br>• Phân bổ (tự động hoặc tay): tạo allocation vào dòng hóa đơn; cập nhật Đã đóng, Còn lại và tình trạng thu của hóa đơn (FR12); allocation cọc ghi Deposit Ledger<br>• Tạo credit: tạo khoản tạm ứng gắn khách/HĐ, tự khấu trừ vào hóa đơn kỳ sau. Ví dụ `101G4` thu thừa 240.000 → hóa đơn kỳ sau giảm 240.000 <span style="color:#CC0000">(khấu trừ ghi vào dòng nào của hóa đơn kỳ sau: ##)</span><br>• Xác nhận tiền mặt đã nộp: `Chờ xác nhận` -> `Đã xác nhận`; từ đó payment được tính vào mốc thu (refer to FR21)<br>• Đổi thứ tự phân bổ: lưu thứ tự mới và lý do; tính lại allocation của payment<br>• Đảo: tạo bản ghi đảo âm cùng ngày đảo; bản gốc -> `Đã đảo`; allocation liên quan hủy; tình trạng thu của hóa đơn tính lại<br>• Mọi thao tác ghi audit theo Common Rule 5 |

## 2. Screen 13.1: Thu tiền — danh sách payment

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — ảnh ImageGen UI-13-payment-allocation.png KHÔNG ĐẠT (AUDIT: là form một phiếu thu tiền mặt; thiếu danh sách payment, ghép thủ công, dư → credit, bộ lọc; thứ tự phân bổ "quá hạn → đến hạn → trả trước" sai BR-2.10.4), không dùng. Nội dung dựng từ spec (wireframe UI-13).</span></p>
<p align="center"><b>Screen 13.1: Thu tiền — danh sách payment</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Thu tiền`<br>• Breadcrumb: `Trang chủ / Hóa đơn & thu tiền / Thu tiền` |
| 🟧 Quản lý thu tiền | | | |
| Tiêu đề trang | Text | No | • Hiển thị "Thu tiền" kèm tổng số payment theo bộ lọc |
| Ghi nhận thu | Button | No | • Always display<br>• Enabled only when người dùng có quyền ghi nhận thu (Common Rule 7)<br>• Click on -> Display Popup ghi nhận thu (Screen 13.3) |
| Import sao kê | Button | No | • Always display<br>• Enabled only when người dùng là Kế toán hoặc Admin<br>• Click on -> Go to luồng import theo Common Rule 14 <span style="color:#CC0000">(Screen ## — spec chưa đặc tả định dạng sao kê và bảng map cột)</span> |
| Auto match | Button | No | • Always display<br>• Enabled only when có ít nhất 1 payment `Chưa xác định` và người dùng là Kế toán hoặc Admin<br>• Click on -> Chạy auto-match cho mọi payment `Chưa xác định` trong phạm vi theo BR-2.10.3<br>• Xong -> hiển thị số payment đã ghép và số còn chưa xác định <span style="color:#CC0000">(dạng hiển thị ##)</span> |
| Xuất | Button | No | • Always display<br>• Always enabled<br>• Click on -> Xuất toàn bộ kết quả đang lọc <span style="color:#CC0000">(định dạng CSV/XLSX ##)</span> |
| 🟧 Filter section | | | • Tiêu chí áp khi chọn và phản ánh lên URL (Common Rule 6) |
| Kỳ | Dropdown | No | • Default selection: kỳ đang chọn trên Header (Common Rule 1)<br>• Click on -> Display the list of options: danh sách kỳ<br>• Allow single selection only<br>• Select an option -> Search for all records có ngày thanh toán thuộc kỳ đã chọn <span style="color:#CC0000">(hay payment phân bổ vào hóa đơn của kỳ — cần xác nhận)</span> |
| Tòa | Dropdown | No | • Default selection: Tất cả<br>• Click on -> Display the list of options: Tất cả + các tòa trong phạm vi quyền<br>• Allow single selection only<br>• Select an option -> Search for all records with Tòa = selected option |
| Quản lý | Dropdown | No | • Default selection: Tất cả<br>• Click on -> Display the list of options: Tất cả + quản lý trong phạm vi quyền<br>• Allow single selection only<br>• Select an option -> Search for all records thuộc tòa do quản lý đã chọn phụ trách |
| TK nhận | Dropdown | No | • Default selection: Tất cả<br>• Click on -> Display the list of options: Tất cả + danh mục tài khoản nhận, ví dụ "VP-Hằng"<br>• Allow single selection only<br>• Select an option -> Search for all records with TK nhận = selected option |
| Phương thức | Dropdown | No | • Default selection: Tất cả<br>• Click on -> Display the list of options: Tất cả, Chuyển khoản, Tiền mặt, Khác<br>• Allow single selection only<br>• Select an option -> Search for all records with Kênh = selected option |
| Ngày | Datepicker | No | • Một ô chọn khoảng 2 ngày. Date format: DD/MM/YYYY<br>• Click on -> Display a datepicker<br>• Disable future dates<br>• Click on -> Search for all records with Ngày thanh toán in the specified date range |
| Chỉ chưa xác định | Checkbox | No | • Always display<br>• Default status: Unchecked<br>• Check the checkbox -> filter records có nhãn `Chưa xác định`<br>• Uncheck -> remove this filter criterion |
| Search box | Textbox | No | • Placeholder: <span style="color:#CC0000">##</span><br>• Max length: 255 characters<br>• Allow entering all types of characters<br>• Cut off the spaces before and after the keyword before performing search<br>• Nhập từ khóa -> sau 300ms (Common Rule 6) Search for all records which satisfy at least one of the following criteria:<br>&nbsp;&nbsp;◦ Mã payment = keyword (Absolute search)<br>&nbsp;&nbsp;◦ Mã phòng = keyword (Absolute search)<br>&nbsp;&nbsp;◦ Nội dung CK contains keyword (Relative search)<br>• <span style="color:#CC0000">Spec UI-13 chưa nêu ô tìm kiếm — cần xác nhận</span> |
| 🟦 ① Danh sách payment | | | • Display the list of payment trong phạm vi quyền<br>• Cột `Đã PB` tách khỏi `Số tiền` để thấy ngay phần chưa gắn hóa đơn<br>• If there are no payment in the system, display error message <span style="color:#CC0000">E##</span><br>• If no record matches the search and filter criteria, display error message <span style="color:#CC0000">E##</span><br>• Default sorting: <span style="color:#CC0000">##</span><br>• Phân trang theo Common Rule 6<br>• Click on một dòng -> Go to Chi tiết payment (Screen 13.2)<br>• <span style="color:#CC0000">Wireframe có payment ngày 07/08 (PM-8821, 401G1 · 4.784.000 = Tổng cần đóng kỳ 09 theo Seed §6.2) và phân bổ vào HD-2609-0417, trong khi hóa đơn kỳ 09 phát hành 23–25/08 — ngày payment đứng trước ngày phát hành, cần sửa dữ liệu minh họa</span> |
| Mã | Text | No | • Mã payment, ví dụ `PM-8821` |
| Ngày | Text | No | • Ngày thanh toán theo Cluster Rule 05.4. Format: DD/MM/YYYY hh:mm |
| Kênh | Text | No | • Viết tắt: CK (chuyển khoản), TM (tiền mặt), Khác |
| TK nhận / người thu | Text | No | • CK: tài khoản nhận, ví dụ "VP-Hằng"<br>• TM: người thu, ví dụ "Huyền" |
| Khách / Phòng | Text | No | • Mã phòng và khách đã xác định<br>• Chưa xác định: hiển thị "(chưa rõ)" |
| Số tiền | Number | No | • Số tiền payment (Common Rule 8) |
| Đã PB | Number | No | • Σ allocation của payment |
| Chưa PB | Number | No | • Số tiền − Đã PB |
| Trạng thái | Tag | No | • Hiển thị một trong các nhãn (Common Rule 4):<br>&nbsp;&nbsp;◦ Chờ xác nhận: tiền mặt chưa được Kế toán xác nhận đã nộp<br>&nbsp;&nbsp;◦ Đã xác nhận<br>&nbsp;&nbsp;◦ Đã đảo<br>&nbsp;&nbsp;◦ △ Chưa xác định: payment chưa phân bổ vào hóa đơn nào<br>• Cờ "sai TK" hiển thị kèm Tag riêng |
| Minh chứng | Icon | No | • Display only when payment có file minh chứng<br>• Click on -> <span style="color:#CC0000">## (mở popup xem file?)</span> |
| Người xác nhận | Text | No | • Người xác nhận payment và thời điểm; chưa xác nhận hiển thị `—` |
| Page number | Text | No | • Click on a page number -> Go to the corresponding page |
| 🟧 ⑤ Tiền mặt chờ xác nhận | | | • Display only when có ít nhất 1 payment tiền mặt `Chờ xác nhận` trong phạm vi<br>• Khối riêng có cảnh báo đậm vì đây là quy tắc dễ làm sai hiệu suất và lương nhân viên |
| Payment chờ | Text | No | • Mỗi payment một dòng: "{Mã} · {Người thu} thu {Số tiền} ngày {DD/MM}", ví dụ "PM-8830 · Huyền thu 4.175.000 ngày 09/08" |
| Cảnh báo mốc thu | Text | No | • Always display trong khối<br>• Content format: "✕ CHƯA tính vào mốc M1/M2/M3 cho tới khi kế toán xác nhận đã nộp" (Cluster Rule 05.4) |
| Kế toán xác nhận đã nộp | Button | No | • Always display trên mỗi dòng payment chờ<br>• Enabled only when người dùng là Kế toán hoặc Admin<br>• Click on -> Display Popup xác nhận đã nộp tiền mặt (Screen 13.6) |

## 3. Screen 13.2: Chi tiết payment

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — ảnh UI-13-payment-allocation.png KHÔNG ĐẠT (xem Screen 13.1), không dùng. Nội dung dựng từ spec (vùng ②③④ wireframe UI-13).</span></p>
<p align="center"><b>Screen 13.2: Chi tiết payment</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Thu tiền`<br>• Breadcrumb: `Trang chủ / Hóa đơn & thu tiền / Thu tiền / {Mã payment}`<br>• <span style="color:#CC0000">Wireframe đặt ②③④ ngay dưới danh sách (panel chi tiết), còn route `#/payments/:id` gợi ý trang riêng — cần xác nhận</span> |
| Tiêu đề | Text | No | • Hiển thị "Chi tiết {Mã payment}" kèm Tag trạng thái; nhãn `Chưa xác định` và cờ "sai TK" nếu có |
| Thông tin payment | Text | No | • Display kênh, ngày thanh toán (Cluster Rule 05.4), TK nhận hoặc người thu, khách/phòng, số tiền, file minh chứng, người xác nhận |
| Kế toán xác nhận đã nộp | Button | No | • Display only when kênh = Tiền mặt và trạng thái = Chờ xác nhận<br>• Enabled only when người dùng là Kế toán hoặc Admin<br>• Click on -> Display Popup xác nhận đã nộp tiền mặt (Screen 13.6) |
| Đảo | Button | No | • Display only when trạng thái = Đã xác nhận (spec §14)<br>• Enabled only when người dùng là Kế toán hoặc Admin<br>• Click on -> Display Popup đảo payment (Screen 13.5) |
| 🟧 ② Ghép thủ công | | | • Display only when payment `Chưa xác định` hoặc có cờ "sai TK"<br>• Tiêu đề: "Chi tiết {Mã} — ghép thủ công" |
| Nội dung CK gốc | Text | No | • Display nguyên văn nội dung chuyển khoản, ví dụ "CK 204S12 THANG 9" |
| Mã phòng nhận diện | Text | No | • Content format: "→ Hệ thống nhận diện mã phòng: {mã phòng}", ví dụ "204S12"<br>• Không nhận diện được: <span style="color:#CC0000">## (nội dung và cách người dùng tự chọn phòng/hóa đơn)</span> |
| Ghép vào hóa đơn ▸ | Button | No | • Display only when đã nhận diện được mã phòng<br>• Enabled only when người dùng là Kế toán hoặc Admin<br>• Click on -> Đề xuất allocation vào hóa đơn mở cũ nhất của phòng theo thứ tự phân bổ mặc định, hiển thị tại ③<br>• <span style="color:#CC0000">Cần xác nhận có popup chọn hóa đơn thay vì tự chọn hóa đơn cũ nhất</span> |
| Cảnh báo sai TK | Text | No | • Display only when TK nhận ≠ tài khoản mặc định của tòa (refer to FR04)<br>• Content format: "△ Tiền vào TK {TK nhận} nhưng tòa {Mã tòa} mặc định TK {TK mặc định}" + "→ cho phép ghép, gắn cờ "sai TK"" |
| 🟧 ③ Phân bổ (allocation) | | | • Tiêu đề kèm "Payment {Số tiền}", ví dụ "Payment 10.000.000" |
| Thứ tự phân bổ | Text | No | • Content format: "Thứ tự mặc định: nợ cũ → dịch vụ + điện chung → thu khác → tiền phòng → cọc" kèm chip P-14 (Cluster Rule 05.5)<br>• Đã đổi thứ tự: hiển thị thứ tự mới, người đổi và lý do |
| Đổi thứ tự có lý do | Button | No | • Display only when trạng thái ≠ Đã đảo<br>• Enabled only when người dùng là Kế toán hoặc Admin<br>• Click on -> Display Popup đổi thứ tự phân bổ (Screen 13.4) |
| 🟦 Bảng phân bổ | | | • Mỗi dòng là một phần payment gắn vào một dòng của một hóa đơn; hóa đơn cũ nhất trước<br>• Σ Số tiền ≤ số tiền payment (BR-2.10.1)<br>• Không phân trang<br>• <span style="color:#CC0000">Wireframe phân bổ 220.000 vào dòng Nợ cũ của hóa đơn kỳ trước HD-2608-0311, trong khi BR-2.09.6 đóng hóa đơn kỳ trước sau khi số dư chuyển vào dòng 11 Nợ cũ của hóa đơn mới — cần chốt nợ cũ phân bổ vào hóa đơn nào</span> |
| Hóa đơn | Text | No | • Số hóa đơn, ví dụ `HD-2609-0417`<br>• Click on -> Go to Chi tiết hóa đơn (Screen 12.2) |
| Dòng | Text | No | • Nhóm dòng hóa đơn nhận phân bổ: Nợ cũ, 7 dịch vụ (+ điện chung), Thu khác, Tiền phòng, Cọc<br>• <span style="color:#CC0000">BR-2.10.4 ghi "7 dịch vụ" nhưng dòng 3–10 có 8 dịch vụ — cần xác nhận nhóm gồm những dòng nào</span> |
| Số tiền | Number | No | • Số tiền phân bổ (Common Rule 8)<br>• Phân bổ tay: Kế toán sửa được số tiền; ghi đè phân bổ bắt buộc lý do (Cluster Rule 05.6)<br>• Σ Số tiền > số tiền payment -> display error message <span style="color:#CC0000">E##</span><br>• <span style="color:#CC0000">Cần xác nhận control sửa tay (ô nhập tại dòng hay popup)</span> |
| Còn lại | Number | No | • Số còn phải thu của dòng hóa đơn sau phân bổ |
| Đã phân bổ | Text | No | • Display Σ phân bổ, ví dụ "Đã phân bổ 5.424.533"<br>• <span style="color:#CC0000">Ví dụ wireframe phân bổ "7 dịch vụ 1.604.533" cho 101T17, trong khi UI-12 tính Tổng DV của 101T17 = 1.604.000; chênh 533 chưa được giải thích (UI-17 cũng ghi nợ 5.204.533)</span> |
| 🟧 ④ Phần dư | | | • Display only when Số tiền payment − Đã phân bổ > 0 |
| Dư | Text | No | • Content format: "Dư {Số tiền − Đã phân bổ}", ví dụ "Dư 4.575.467"<br>• Thu thừa tạo credit tự khấu trừ vào hóa đơn kỳ sau; **không hoàn tiền mặc định** (BR-2.10.6) |
| Tạo credit tạm ứng | Button | No | • Display only when Dư > 0 và payment chưa tạo credit<br>• Enabled only when người dùng là Kế toán hoặc Admin<br>• Click on -> Tạo credit tạm ứng gắn khách/HĐ bằng số dư, cập nhật ④ <span style="color:#CC0000">(cần xác nhận có popup xác nhận và credit tự tạo hay phải bấm tay)</span> |

## 4. Screen 13.3: Popup ghi nhận thu

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (bảng "Form" của UI-13).</span></p>
<p align="center"><b>Screen 13.3: Popup ghi nhận thu</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận dạng modal hay drawer, spec §7.3)</span> | | | |
| Kênh | Dropdown | Yes | • Always display<br>• Default selection: None<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• Click on -> Display the list of following options: Chuyển khoản, Tiền mặt, Khác<br>• Allow single selection only<br>• Select an option -> Hiện/ẩn TK nhận, Nội dung CK và Người thu theo kênh |
| Thời điểm thu | Datepicker | Yes | • Always display. Format: DD/MM/YYYY hh:mm<br>• Là ngày tiền vào tài khoản hoặc ngày nhận tiền mặt, không phải ngày nhập (Cluster Rule 05.4)<br>• Default selection: None<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• Disable future dates <span style="color:#CC0000">(cần xác nhận)</span> |
| Khách / phòng | Dropdown | No | • Always display. Searchable dropdown theo mã phòng, tên khách<br>• Default selection: None; được để trống khi chưa xác định<br>• Allow single selection only<br>• Select an option -> Hiển thị hóa đơn mở của phòng, cũ nhất trước |
| Nội dung CK | Textbox | No | • Display only when Kênh = Chuyển khoản<br>• Allow entering all types of characters. Max length: 255 |
| Số tiền | Textbox | Yes | • Always display<br>• Allow entering numeric values (VND, Common Rule 8). Max length: 12<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• If entering 0, display error message <span style="color:#CC0000">E##</span> |
| TK nhận | Dropdown | Yes | • Display only when Kênh = Chuyển khoản<br>• Click on -> Display danh mục tài khoản nhận. Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Người thu | Dropdown | Yes | • Display only when Kênh = Tiền mặt (tiền mặt bắt buộc người thu)<br>• Default selection: <span style="color:#CC0000">## (người đang đăng nhập nếu là NVVH?)</span><br>• Click on -> Display danh sách nhân sự trong phạm vi. Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Minh chứng | File uploader | No | • Instruction text: <span style="color:#CC0000">##</span><br>• Allow dragging and dropping file, as well as uploading from local device<br>• Click on "Upload" -> Display a popup to select file from local device <span style="color:#CC0000">(Screen capture ##)</span><br>• Bắt buộc khi xác nhận thủ công<br>• Supported file format: <span style="color:#CC0000">##</span>. If the selected file is in an unsupported format, display error message <span style="color:#CC0000">E##</span><br>• Maximum file size: <span style="color:#CC0000">##</span>. If the file size exceeds the limit, show error message <span style="color:#CC0000">E##</span><br>• If the file is of valid format and size, display the selected file in the frame. Click on the x icon -> Delete the file |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Nếu đã nhập dữ liệu -> hiển thị xác nhận rời (Common Rule 9); nếu chưa -> đóng popup |
| Lưu | Button | No | • Always appear<br>• Enabled only when đã nhập đủ field bắt buộc<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> tạo payment: tiền mặt của NVVH ở `Chờ xác nhận`; kênh khác <span style="color:#CC0000">## (trạng thái ban đầu)</span>. Có khách/phòng -> tự phân bổ theo thứ tự mặc định; không có -> `Chưa xác định`<br>• Xong -> đóng popup, Go to Chi tiết payment (Screen 13.2) |

## 5. Screen 13.4: Popup đổi thứ tự phân bổ

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (nút "Đổi thứ tự có lý do" của UI-13).</span></p>
<p align="center"><b>Screen 13.4: Popup đổi thứ tự phân bổ</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Thứ tự phân bổ | Text | No | • Display 5 nhóm dòng theo thứ tự đang áp: Nợ cũ, Dịch vụ + điện chung, Thu khác/phạt, Tiền phòng, Cọc<br>• Người dùng đổi vị trí từng nhóm <span style="color:#CC0000">(control: kéo thả hay mũi tên lên/xuống ##)</span><br>• Chỉ áp cho payment đang mở, không đổi thứ tự mặc định của hệ thống |
| Xem trước | Text | No | • Display bảng phân bổ tính lại theo thứ tự mới <span style="color:#CC0000">(cần xác nhận có preview)</span> |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Áp dụng | Button | No | • Always appear<br>• Enabled only when thứ tự đã thay đổi và đã nhập Lý do<br>• Click on -> Tính lại allocation của payment theo thứ tự mới, lưu lý do vào audit (Common Rule 5), đóng popup và cập nhật ③ của Screen 13.2 |

## 6. Screen 13.5: Popup đảo payment

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (BR-2.10.9, §7.4).</span></p>
<p align="center"><b>Screen 13.5: Popup đảo payment</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Message | Text | No | • Danger modal (spec §7.4)<br>• Content format: <span style="color:#CC0000">"##" (cần nội dung chính xác)</span><br>• Nêu rõ: sinh bản ghi đảo âm cùng ngày đảo, không xóa bản gốc |
| Allocation bị hủy | Text | No | • Liệt kê hóa đơn và dòng sẽ bị hủy phân bổ, cùng tình trạng thu mới của từng hóa đơn |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Đảo payment | Button | No | • Always appear<br>• Enabled only when đã nhập Lý do<br>• Click on -> Tạo bản ghi đảo âm, payment gốc -> `Đã đảo`, hủy allocation liên quan, tính lại tình trạng thu của hóa đơn, đóng popup và cập nhật Screen 13.2 |

## 7. Screen 13.6: Popup xác nhận đã nộp tiền mặt

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (vùng ⑤ UI-13, BR-2.10.10).</span></p>
<p align="center"><b>Screen 13.6: Popup xác nhận đã nộp tiền mặt</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Thông tin payment | Text | No | • Display mã payment, người thu, số tiền, ngày nhận tiền mặt, phòng |
| Mốc thu áp dụng | Text | No | • Display mốc thu M1/M2/M3 mà payment sẽ rơi vào sau khi xác nhận (Cluster Rule 05.4)<br>• <span style="color:#CC0000">Tiền mặt nhận trước mốc nhưng được xác nhận sau mốc thì tính vào mốc nào — cần chốt (BR-2.10.5, BR-2.10.10, BR-2.10.13)</span> |
| Minh chứng nộp | File uploader | Yes | • Minh chứng bắt buộc khi xác nhận thủ công<br>• Allow dragging and dropping file, as well as uploading from local device<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• Supported file format: <span style="color:#CC0000">##</span>. Maximum file size: <span style="color:#CC0000">##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Xác nhận đã nộp | Button | No | • Always appear<br>• Enabled only when đã có minh chứng hợp lệ<br>• Click on -> Payment `Chờ xác nhận` -> `Đã xác nhận`, lưu người xác nhận và thời điểm, đóng popup, cập nhật khối ⑤ và danh sách |

## 8. User Steps

| | |
|:-:|---|
| **Pre-condition** | Người dùng đã đăng nhập với vai trò Kế toán hoặc Admin; hóa đơn của kỳ đã phát hành (F-03) |
| **User steps** | **Step 1:** Click menu `Thu tiền` -> display Thu tiền — danh sách payment (Screen 13.1)<br>**Step 2:** Click `Ghi nhận thu` -> display Popup ghi nhận thu (Screen 13.3)<br>**Step 3:** Nhập thông tin và click `Lưu` -> display Chi tiết payment với phân bổ tự động (Screen 13.2)<br>**Step 4:** Click `Đổi thứ tự có lý do` -> display Popup đổi thứ tự phân bổ (Screen 13.4) |

| | |
|:-:|---|
| **Pre-condition** | Kế toán đã có file sao kê; một số dòng sao kê không tự match |
| **User steps** | **Step 1:** Tại Screen 13.1, click `Import sao kê` -> display luồng import theo Common Rule 14 <span style="color:#CC0000">(Screen ##)</span><br>**Step 2:** Sau khi commit, tick `Chỉ chưa xác định` rồi click một dòng -> display Chi tiết payment (Screen 13.2)<br>**Step 3:** Tại ②, click `Ghép vào hóa đơn ▸` -> display đề xuất phân bổ ở ③ của Screen 13.2 |

| | |
|:-:|---|
| **Pre-condition** | NVVH đã báo thu tiền mặt; payment đang ở `Chờ xác nhận` |
| **User steps** | **Step 1:** Kế toán mở Thu tiền (Screen 13.1), tại khối ⑤ click `Kế toán xác nhận đã nộp` -> display Popup xác nhận đã nộp tiền mặt (Screen 13.6) |

---
---

# FR14 - Công nợ & phạt

## 1. Business Rule

| | |
|:-:|---|
| **Authorization** | • Kế toán, Admin: xem toàn bộ, duyệt phạt, đưa phạt vào hóa đơn kỳ sau, xóa nợ có phê duyệt, nhắc Zalo, xuất (spec §4)<br>• TNVH/Trưởng khu vực: xác nhận hoặc miễn phạt (spec §4). <span style="color:#CC0000">UI-14 và BR-2.09.12 ghi "Quản lý xác nhận/Miễn" — cần xác nhận "quản lý" là TNVH hay quản lý tòa (NVVH)</span><br>• NVVH: xem công nợ của tòa được phân công, ghi nhận liên hệ, nhắc Zalo <span style="color:#CC0000">(cần xác nhận)</span><br>• TPVH: xem, dùng lát `Theo quản lý` để đôn đốc; không sửa công nợ (spec §4)<br>• Cổ đông, Vệ sinh: không truy cập |
| **Debt Management Rule** | • Người dùng theo dõi hóa đơn đã quá hạn chưa thu đủ theo nhiều lát cắt, ghi nhận liên hệ, xử lý chuỗi đề xuất – xác nhận – duyệt phạt, theo dõi riêng nợ phá HĐ và xóa nợ có phê duyệt<br>• Chức năng chỉ thực hiện được khi người dùng đã đăng nhập với vai trò thuộc Authorization <span style="color:#CC0000">##</span><br>• Hóa đơn vào công nợ khi: đã `Phát hành`, tình trạng thu `Chưa TT` hoặc `Thiếu`, và đã quá **5 ngày kể từ ngày phát hành** (BR-2.09.11, R-13, Decision Log #9, P-17, **ASSUMED**). Cùng lúc xuất hiện ở Work Queue (refer to FR01)<br>&nbsp;&nbsp;◦ <span style="color:#CC0000">Mâu thuẫn: hạn TT kéo tới cuối tháng phát hành (25/08 → 31/08) nhưng mốc 5 ngày tính từ ngày phát hành làm hóa đơn phát hành 23/08 thành công nợ ngày 28/08, trước khi hết hạn TT — cần chốt mốc (P-17)</span><br>• Sáu chế độ xem trên cùng một tập dữ liệu: Theo hóa đơn, Theo khách, Theo phòng, Theo tòa, Theo quản lý (đôn đốc), Nợ phá HĐ (danh sách riêng)<br>• Tuổi nợ phân 3 tầng ≤ 5 / 6–15 / > 15 ngày, phân biệt bằng **ký hiệu kèm màu**, không chỉ màu (Common Rule 4, P-20)<br>&nbsp;&nbsp;◦ <span style="color:#CC0000">Wireframe không nhất quán về gốc tính tuổi: 202G10 và 103T21 cùng phát hành 23/08, cùng hạn 31/08 nhưng tuổi 12 và 6. Cần định nghĩa tuổi nợ tính từ ngày phát hành, ngày chuyển công nợ hay hạn TT</span><br>• **Phạt**: 200.000 đ/ngày từ ngày thứ 6 kể từ phát hành; không có trần mặc định nhưng ưu tiên điều khoản HĐ (P-09, Decision Log #9, **ASSUMED**). HĐ khách mẫu lại tính phạt từ ngày mùng 1 tháng sau, trần 03 ngày (P-33)<br>&nbsp;&nbsp;◦ <span style="color:#CC0000">Wireframe: 103T21 tuổi 6 → phạt 1 ngày × 200.000 = 200.000, nhưng 402G5 tuổi 41 → phạt 8.200.000 = 41 ngày; hai dòng không cùng một công thức</span><br>• Hệ thống **chỉ đề xuất**, không tự áp phạt vào hóa đơn. Chuỗi 4 bước rời nhau (BR-2.09.12):<br>&nbsp;&nbsp;◦ Đề xuất: hệ thống tự sinh<br>&nbsp;&nbsp;◦ Xác nhận / Miễn: quản lý quyết định; Miễn bắt buộc lý do (Cluster Rule 05.6)<br>&nbsp;&nbsp;◦ Đã duyệt: Kế toán duyệt<br>&nbsp;&nbsp;◦ Đã lên hóa đơn: phạt vào dòng Thu khác của hóa đơn kỳ sau (refer to Screen 12.2)<br>• Màn hình phải giải thích được cách ra con số phạt: mốc phát hành, mốc chuyển công nợ, số ngày phạt × đơn giá<br>• Xóa nợ phải có phê duyệt, bắt buộc lý do (Cluster Rule 05.6) <span style="color:#CC0000">(người phê duyệt và trạng thái sau xóa nợ: ##)</span><br>• **Nợ phá HĐ**: danh sách riêng, lý do theo danh mục chuẩn: bỏ trốn, về quê/nghỉ học, chuyển chỗ làm, không đủ tài chính, báo tăng giá không ở, thợ xong công trình, khác<br>&nbsp;&nbsp;◦ <span style="color:#CC0000">Seed §8 có thêm lý do "chuyển cơ sở học" và "vỡ nợ" chưa có trong danh mục — cần xác nhận</span><br>&nbsp;&nbsp;◦ Thu hồi ở tháng sau: giảm kỳ gốc, ghi doanh thu CF tháng thực thu, **không hồi tố hiệu suất** kỳ nào (BR-2.10.11 → P-27)<br>• Tham số chờ chốt hiển thị chip theo Cluster Rule 05.5 (P-09, P-17, P-20, P-27, P-33) |
| **Debt Management Impact** | • Xem, lọc, đổi chế độ xem và xuất không làm thay đổi dữ liệu<br>• Hóa đơn đủ điều kiện công nợ: tự xuất hiện ở màn này và ở Work Queue (FR01)<br>• Hệ thống sinh đề xuất phạt ở trạng thái `Đề xuất` <span style="color:#CC0000">(tần suất cập nhật số ngày phạt: ##)</span><br>• Xác nhận: `Đề xuất` -> `Xác nhận`. Miễn: `Đề xuất` -> `Miễn`, lưu lý do<br>• Duyệt: `Xác nhận` -> `Đã duyệt`. Trả lại: <span style="color:#CC0000">## (trạng thái sau khi Kế toán trả lại)</span><br>• Lập hóa đơn kỳ sau: phạt `Đã duyệt` thành một dòng Thu khác; phạt -> `Đã lên hóa đơn`<br>• Ghi nhận liên hệ: tạo bản ghi liên hệ (ngày, kênh, kết quả, ngày hẹn)<br>• Xóa nợ: <span style="color:#CC0000">##</span><br>• Nhắc Zalo: tạo đợt gửi ở FR17; không thay đổi công nợ<br>• Mọi thao tác ghi audit theo Common Rule 5 |

## 2. Screen 14.1: Công nợ & phạt

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — ảnh ImageGen UI-14-receivables-penalties.png KHÔNG ĐẠT (AUDIT: phạt "5 %/tháng" thay vì 200.000 đ/ngày từ ngày thứ 6; thiếu 6 chế độ xem, chuỗi duyệt phạt 4 bước, tab Nợ phá HĐ; cột "Chủ nhà" sai nghiệp vụ), không dùng. Nội dung dựng từ spec (wireframe UI-14).</span></p>
<p align="center"><b>Screen 14.1: Công nợ & phạt</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Công nợ/Phạt`<br>• Breadcrumb: `Trang chủ / Hóa đơn & thu tiền / Công nợ/Phạt` |
| 🟧 Quản lý công nợ | | | |
| Tiêu đề trang | Text | No | • Hiển thị "Công nợ & phạt" |
| Nhắc Zalo hàng loạt | Button | No | • Always display<br>• Enabled only when người dùng có quyền gửi Zalo<br>• Click on -> Go to Tạo đợt gửi (Screen 17.3), sự kiện = Nhắc quá hạn, phạm vi theo bộ lọc hiện tại <span style="color:#CC0000">(cần xác nhận truyền danh sách đang lọc hay chỉ phạm vi tòa)</span> |
| Xuất | Button | No | • Always display<br>• Always enabled<br>• Click on -> Xuất toàn bộ kết quả của chế độ xem đang mở <span style="color:#CC0000">(định dạng ##)</span> |
| Theo hóa đơn | Tab | No | • Default tab<br>• Highlight the tab while being selected<br>• Click on -> Go to Theo hóa đơn |
| Theo khách | Tab | No | • Highlight the tab while being selected<br>• Click on -> Go to Theo khách |
| Theo phòng | Tab | No | • Highlight the tab while being selected<br>• Click on -> Go to Theo phòng |
| Theo tòa | Tab | No | • Highlight the tab while being selected<br>• Click on -> Go to Theo tòa |
| Theo QL | Tab | No | • Highlight the tab while being selected<br>• Click on -> Go to Theo quản lý (lát dùng để đôn đốc) |
| Nợ phá HĐ | Tab | No | • Highlight the tab while being selected<br>• Click on -> Go to Nợ phá HĐ (danh sách riêng) |
| 🟧 Filter section | | | • Bộ lọc dùng chung cho 5 tab đầu; tiêu chí áp khi chọn và phản ánh lên URL (Common Rule 6)<br>• <span style="color:#CC0000">Cần xác nhận bộ lọc có áp cho tab Nợ phá HĐ không</span> |
| Tuổi nợ | Dropdown | No | • Default selection: Tất cả<br>• Click on -> Display the list of options: Tất cả, ≤ 5 ngày, 6–15 ngày, > 15 ngày<br>• Allow single selection only<br>• Select an option -> Search for all records with Tuổi nợ thuộc tầng đã chọn |
| Hạn TT | Datepicker | No | • Một ô chọn khoảng 2 ngày. Date format: DD/MM/YYYY<br>• Click on -> Display a datepicker<br>• Click on -> Search for all records with Hạn TT in the specified date range |
| Khoảng tiền | Textbox | No | • Hai ô `Từ` và `Đến`, áp lên số Còn lại <span style="color:#CC0000">(cần xác nhận)</span><br>• Allow entering numeric values (VND). Max length: 12<br>• Nếu `Từ` > `Đến` -> Show error message <span style="color:#CC0000">E##</span> |
| Mốc thu | Dropdown | No | • Default selection: Tất cả<br>• Click on -> Display the list of options: <span style="color:#CC0000">## (Tất cả, M1, M2, M3? — cần xác nhận ý nghĩa bộ lọc)</span><br>• Allow single selection only |
| Trạng thái phạt | Dropdown | No | • Default selection: Tất cả<br>• Click on -> Display the list of options: Tất cả, Chưa có phạt, Đề xuất, Xác nhận, Miễn, Đã duyệt, Đã lên hóa đơn<br>• Allow single selection only<br>• Select an option -> Search for all records with Trạng thái phạt = selected option |
| 🟧 Tab Theo hóa đơn — ② Bảng công nợ | | | |
| 🟦 Bảng công nợ | | | • Display the list of hóa đơn đủ điều kiện công nợ trong phạm vi quyền<br>• Chú giải dưới bảng: "● > 15 ngày ● 6–15 ngày ● ≤ 5 ngày (kèm ký hiệu, không chỉ màu)"<br>• If there are no công nợ, display error message <span style="color:#CC0000">E##</span><br>• If no record matches the filter criteria, display error message <span style="color:#CC0000">E##</span><br>• Default sorting: <span style="color:#CC0000">## (dự kiến tuổi nợ giảm dần)</span><br>• Phân trang theo Common Rule 6<br>• Click on một dòng -> Display Chi tiết công nợ (Screen 14.2)<br>• <span style="color:#CC0000">Dữ liệu wireframe lệch nguồn: 402G5 ghi gốc 10.048.000 · tuổi 41, trong khi Seed §8 xếp 402G5 vào nợ phá HĐ phải thu 2.188.000 và Work Queue UI-01 ghi 402G5 tuổi 9 ngày</span> |
| Khách / Phòng | Text | No | • Mã phòng và khách đứng tên HĐ<br>• Click on mã HĐ -> Go to Chi tiết hợp đồng thuê (refer to FR07) |
| Hóa đơn | Text | No | • Số hóa đơn, hiển thị rút gọn 4 số cuối, ví dụ "…0402" <span style="color:#CC0000">(quy tắc rút gọn cần xác nhận)</span><br>• Click on -> Go to Chi tiết hóa đơn (Screen 12.2) |
| Phát hành | Text | No | • Ngày phát hành. Format: DD/MM |
| Hạn TT | Text | No | • Ngày cuối của hạn TT. Format: DD/MM |
| Tuổi | Number | No | • Tuổi nợ (ngày) kèm ký hiệu tầng ≤ 5 / 6–15 / > 15 (P-20) |
| Gốc | Number | No | • Tổng cần đóng của hóa đơn (Common Rule 8) |
| Đã thu | Number | No | • Σ allocation của hóa đơn |
| Còn lại | Number | No | • Gốc − Đã thu |
| Phạt ĐX | Number | No | • Số tiền phạt đề xuất; chưa có hiển thị `—`<br>• Kèm chip P-09 (Cluster Rule 05.5) |
| Liên hệ gần nhất | Text | No | • Ngày và kết quả liên hệ gần nhất, ví dụ "29/08 gọi — hẹn 05/09" |
| Owner | Text | No | • Quản lý phụ trách tòa tại ngày xem |
| Trạng thái | Tag | No | • Trạng thái phạt của hóa đơn (Common Rule 4) |
| Action | Icon | No | • Mở hóa đơn: Click on -> Go to Chi tiết hóa đơn (Screen 12.2)<br>• Thu tiền: Click on -> Display Popup ghi nhận thu với phòng đã chọn sẵn (Screen 13.3)<br>• Action trên dòng không kích hoạt click dòng (Common Rule 6) |
| Page number | Text | No | • Click on a page number -> Go to the corresponding page |
| 🟧 Tab Theo khách · Theo phòng · Theo tòa · Theo QL | | | • Cùng tập dữ liệu với tab Theo hóa đơn, gom theo khách / phòng / tòa / quản lý<br>• Click on một dòng -> <span style="color:#CC0000">## (drill-down về tab Theo hóa đơn đã lọc?)</span><br>• <span style="color:#CC0000">Spec chưa mô tả cột tổng hợp của từng lát — cần capture</span> |
| 🟧 Tab Nợ phá HĐ — ⑤ theo dõi riêng | | | |
| Ghi chú hồi tố | Text | No | • Always display trong tab (băng ghi chú cố định)<br>• Content format: "ⓘ Thu hồi ở tháng sau: ghi doanh thu dòng tiền tháng thu, KHÔNG hồi tố hiệu suất của tháng cũ" (P-27) |
| 🟦 Bảng nợ phá HĐ | | | • Display the list of HĐ đã phá còn phải thu trong phạm vi quyền<br>• Không có dữ liệu: display error message <span style="color:#CC0000">E##</span><br>• Default sorting: <span style="color:#CC0000">##</span><br>• Click on một dòng -> <span style="color:#CC0000">## (mở hóa đơn cuối của HĐ?)</span><br>• Thu vượt phải thu (Seed §8: 101T21 thu 1.664.000 trên 940.000; 301T7 thu 50.000 trên 48.000) -> <span style="color:#CC0000">## (cách xử lý thu thừa của nợ phá HĐ)</span><br>• <span style="color:#CC0000">Wireframe lệch Seed §8: 403G5 QL "Khải" (seed Đỗ Thanh Hương); 505G6 QL "Linh", ngày vào 02/05 (seed Đỗ Thị Nụ, không có ngày vào); 304T35 QL "Huyền", ngày vào 11/03 (seed Nguyễn Công Lâm, không có ngày vào). Dựng dữ liệu theo seed</span> |
| Phòng | Text | No | • Mã phòng của HĐ đã phá |
| Quản lý | Text | No | • Quản lý phụ trách phòng tại thời điểm phá HĐ <span style="color:#CC0000">(hay tại ngày xem — cần xác nhận)</span> |
| Ngày vào | Text | No | • Ngày khách vào ở; không có hiển thị `—`. Format: DD/MM |
| Số th ở | Number | No | • Số tháng khách đã ở |
| Lý do | Text | No | • Lý do phá HĐ theo danh mục chuẩn ở Business Rule |
| Phải thu | Number | No | • Số tiền còn phải thu của HĐ đã phá |
| Đã thu | Number | No | • Số tiền đã thu hồi |

## 3. Screen 14.2: Chi tiết công nợ

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (vùng ③④ wireframe UI-14, ví dụ 103T21).</span></p>
<p align="center"><b>Screen 14.2: Chi tiết công nợ</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 ③ Chi tiết {Phòng} | | | • <span style="color:#CC0000">Wireframe đặt khối này ngay dưới bảng công nợ; cần xác nhận là panel, drawer hay trang riêng và cách đóng</span> |
| Tiêu đề | Text | No | • Hiển thị "Chi tiết {Mã phòng}", ví dụ "Chi tiết 103T21" |
| Diễn giải mốc | Text | No | • Content format: "Hóa đơn phát hành {DD/MM} → +5 ngày → chuyển công nợ {DD/MM}", ví dụ "Hóa đơn phát hành 23/08 → +5 ngày → chuyển công nợ 28/08"<br>• Kèm chip P-17 (Cluster Rule 05.5) |
| Diễn giải phạt | Text | No | • Content format: "Phạt đề xuất từ ngày thứ 6: {n} ngày × 200.000 = {số tiền}", ví dụ "1 ngày × 200.000 = 200.000"<br>• Kèm chip P-09, P-33 |
| Mở hóa đơn | Button | No | • Always display<br>• Always enabled<br>• Click on -> Go to Chi tiết hóa đơn (Screen 12.2) |
| Thu tiền | Button | No | • Always display<br>• Enabled only when người dùng có quyền ghi nhận thu<br>• Click on -> Display Popup ghi nhận thu với phòng đã chọn sẵn (Screen 13.3) |
| Xóa nợ | Button | No | • Display only when Còn lại > 0<br>• Enabled only when người dùng là Kế toán hoặc Admin<br>• Click on -> Display Popup xóa nợ (Screen 14.6) |
| 🟧 ④ Chuỗi duyệt phạt | | | • Hệ thống chỉ đề xuất, không tự áp phạt |
| Chuỗi duyệt | Text | No | • Hiển thị 4 bước: [Hệ thống đề xuất] → [Quản lý xác nhận/Miễn] → [Kế toán duyệt] → [Đưa vào dòng Thu khác của hóa đơn kỳ sau]<br>• Bước đã qua có dấu check; bước hiện tại được highlight; Miễn hiển thị kèm lý do |
| Xác nhận / Miễn | Button | No | • Display only when trạng thái phạt = Đề xuất<br>• Enabled only when người dùng có vai trò xác nhận phạt (Common Rule 7)<br>• Click on -> Display Popup xác nhận hoặc miễn phạt (Screen 14.3) |
| Duyệt phạt | Button | No | • Display only when trạng thái phạt = Xác nhận<br>• Enabled only when người dùng là Kế toán hoặc Admin<br>• Click on -> Display Popup duyệt phạt (Screen 14.4) |
| Đưa vào hóa đơn kỳ sau | Text | No | • Display only when trạng thái phạt = Đã duyệt hoặc Đã lên hóa đơn<br>• Hiển thị kỳ và số hóa đơn nhận dòng phạt<br>• <span style="color:#CC0000">Cần xác nhận phạt tự vào hóa đơn khi tạo nháp kỳ sau hay cần thao tác tay</span> |
| 🟧 Lịch sử liên hệ | | | |
| 🟦 Danh sách liên hệ | | | • Mỗi lần liên hệ một dòng, mới nhất trước: "{DD/MM} {kênh} — {kết quả}", ví dụ "29/08 gọi — hẹn 05/09"<br>• Chưa có liên hệ: <span style="color:#CC0000">E##</span> |
| + Ghi nhận liên hệ | Button | No | • Always display<br>• Enabled only when người dùng có quyền ghi nhận liên hệ<br>• Click on -> Display Popup ghi nhận liên hệ (Screen 14.5) |

## 4. Screen 14.3: Popup xác nhận hoặc miễn phạt

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (bước 2 chuỗi duyệt phạt UI-14).</span></p>
<p align="center"><b>Screen 14.3: Popup xác nhận hoặc miễn phạt</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Tóm tắt phạt | Text | No | • Display phòng, hóa đơn, số ngày phạt, đơn giá và số tiền đề xuất (như Diễn giải phạt ở Screen 14.2) |
| Quyết định | Dropdown | Yes | • Always display<br>• Default selection: None<br>• Click on -> Display the list of following options:<br>&nbsp;&nbsp;◦ Xác nhận: đồng ý mức phạt đề xuất. Select this option -> Ẩn ô Lý do<br>&nbsp;&nbsp;◦ Miễn: không áp phạt. Select this option -> Hiện ô Lý do (bắt buộc)<br>• Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• <span style="color:#CC0000">Cần xác nhận quản lý có được giảm một phần số tiền phạt không</span> |
| Lý do | Textbox | Yes | • Display only when Quyết định = Miễn<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Lưu quyết định | Button | No | • Always appear<br>• Enabled only when đã chọn Quyết định (và nhập Lý do khi Miễn)<br>• Click on -> Phạt -> `Xác nhận` hoặc `Miễn`, lưu người quyết định và lý do, đóng popup, cập nhật ④ của Screen 14.2 |

## 5. Screen 14.4: Popup duyệt phạt

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (bước 3 chuỗi duyệt phạt UI-14, Common Rule 11).</span></p>
<p align="center"><b>Screen 14.4: Popup duyệt phạt</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Tóm tắt tác động | Text | No | • Popup duyệt theo Common Rule 11<br>• Display số tiền phạt, người xác nhận, và hóa đơn kỳ sau sẽ nhận dòng Thu khác phạt |
| Lý do trả lại | Textbox | No | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• Bắt buộc khi click `Trả lại` (Common Rule 11) |
| Trả lại | Button | No | • Always appear<br>• Enabled only when đã nhập Lý do trả lại<br>• Click on -> <span style="color:#CC0000">## (phạt quay về Đề xuất?)</span>, lưu lý do, đóng popup |
| Duyệt | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Phạt -> `Đã duyệt`, chờ đưa vào dòng Thu khác của hóa đơn kỳ sau, đóng popup và cập nhật Screen 14.2 |

## 6. Screen 14.5: Popup ghi nhận liên hệ

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (nút "+ Ghi nhận liên hệ" UI-14).</span></p>
<p align="center"><b>Screen 14.5: Popup ghi nhận liên hệ</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Ngày liên hệ | Datepicker | Yes | • Always display. Date format: DD/MM/YYYY<br>• Default selection: ngày hiện tại<br>• Disable future dates<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Kênh | Dropdown | Yes | • Always display<br>• Default selection: None<br>• Click on -> Display the list of following options: <span style="color:#CC0000">## (wireframe chỉ có "gọi"; cần danh mục kênh)</span><br>• Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Kết quả | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Ngày hẹn thanh toán | Datepicker | No | • Always display. Date format: DD/MM/YYYY<br>• Default selection: None<br>• Disable past dates |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không lưu |
| Lưu | Button | No | • Always appear<br>• Enabled only when đã nhập đủ field bắt buộc<br>• Click on -> Lưu bản ghi liên hệ, đóng popup, cập nhật Lịch sử liên hệ (Screen 14.2) và cột Liên hệ gần nhất (Screen 14.1) |

## 7. Screen 14.6: Popup xóa nợ

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (action "xóa nợ có phê duyệt" UI-14, §14).</span></p>
<p align="center"><b>Screen 14.6: Popup xóa nợ</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Message | Text | No | • Danger modal (spec §7.4)<br>• Content format: <span style="color:#CC0000">"##" (cần nội dung chính xác)</span> |
| Số tiền xóa | Text | No | • Display số Còn lại của hóa đơn <span style="color:#CC0000">(cần xác nhận có cho xóa một phần không)</span> |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Gửi phê duyệt | Button | No | • Always appear<br>• Enabled only when đã nhập Lý do<br>• Click on -> <span style="color:#CC0000">## (tạo yêu cầu phê duyệt cho ai; khoản nợ ở trạng thái nào tới khi được duyệt)</span> |

## 8. User Steps

| | |
|:-:|---|
| **Pre-condition** | Người dùng đã đăng nhập với vai trò thuộc Authorization của FR14; có hóa đơn phát hành quá 5 ngày chưa thu đủ (F-03 bước 4) |
| **User steps** | **Step 1:** Click menu `Công nợ/Phạt` -> display Công nợ & phạt, tab Theo hóa đơn (Screen 14.1)<br>**Step 2:** Click một dòng -> display Chi tiết công nợ (Screen 14.2)<br>**Step 3:** Click `+ Ghi nhận liên hệ` -> display Popup ghi nhận liên hệ (Screen 14.5)<br>**Step 4:** Quản lý click `Xác nhận / Miễn` -> display Popup xác nhận hoặc miễn phạt (Screen 14.3) (F-03 bước 5)<br>**Step 5:** Kế toán click `Duyệt phạt` -> display Popup duyệt phạt (Screen 14.4); phạt được duyệt vào dòng Thu khác hóa đơn kỳ sau (F-03 bước 6) |

| | |
|:-:|---|
| **Pre-condition** | Người dùng có quyền gửi Zalo; cần nhắc hàng loạt khách quá hạn |
| **User steps** | **Step 1:** Tại Screen 14.1, click `Nhắc Zalo hàng loạt` -> display Tạo đợt gửi (Screen 17.3)<br>**Step 2:** Tại Screen 14.1, click tab `Nợ phá HĐ` -> display danh sách nợ phá HĐ trong Screen 14.1 |

---
---

# FR17 - Zalo ZNS

## 1. Business Rule

| | |
|:-:|---|
| **Authorization** | • Admin: cấu hình OA, template và rule gửi <span style="color:#CC0000">(cần xác nhận)</span><br>• Kế toán, Admin: tạo đợt gửi, gửi, retry, dừng đợt chưa chạy, tải log <span style="color:#CC0000">(cần xác nhận)</span><br>• NVVH: nhắc Zalo cho tòa được phân công từ Work Queue (FR01) và công nợ (FR14) <span style="color:#CC0000">(cần xác nhận quyền tạo đợt gửi)</span><br>• TPVH: nhận phản hồi khách được định tuyến về, được gán phản hồi<br>• Cổ đông, Vệ sinh: không truy cập |
| **Sending Rule** | • Người dùng cấu hình rule gửi tin Zalo ZNS tự động, tạo đợt gửi thủ công có preview, theo dõi lịch sử tin, gửi lại tin lỗi và xử lý phản hồi của khách<br>• Chức năng chỉ thực hiện được khi người dùng đã đăng nhập với vai trò thuộc Authorization <span style="color:#CC0000">##</span><br>• Kênh ZNS cho phép Timehouse chủ động gửi kể cả khi khách chưa quan tâm OA. Mỗi mẫu tin phải đăng ký và chờ Zalo duyệt trước khi dùng<br>• Rule gửi là **công cụ tự đặt điều kiện + thời điểm linh hoạt** (bảng rule tạo được), không phải danh sách sự kiện cố định bật/tắt (khách đã chốt). Trạng thái rule: `Nháp → Hiệu lực → Tắt`<br>• Cấu hình gồm OA/template, loại sự kiện, điều kiện, lịch gửi, cooldown, retry, recipient fallback, trạng thái rule. **Không lưu secret dạng rõ** trong UI<br>• Tạo đợt gửi: chọn sự kiện/kỳ/phạm vi → hệ thống dựng danh sách → **lấy lại công nợ ngay trước khi xác nhận** → preview 3 nhóm Đủ điều kiện / Bỏ qua / Không gửi được → gửi. Mục đích: không nhắc nhầm khách đã thanh toán<br>&nbsp;&nbsp;◦ <span style="color:#CC0000">Khoảng thời gian tối đa giữa lần lấy lại công nợ và lúc gửi: ## (AUDIT: ảnh kiểm tra 09:15 nhưng gửi 14:00)</span><br>• Chỉ hóa đơn `Phát hành` mới được xếp vào đợt gửi (Cluster Rule 05.3)<br>• Khách đã thu đủ → tin `Skipped`, không gửi<br>• Khách chưa liên kết Zalo (1 khách ↔ 1 ZaloID, BR-2.05.11, R-35) → nhóm Không gửi được, có đường dẫn sang phương án dự phòng gọi/SMS thay vì im lặng bỏ qua<br>• Lịch sử lưu **công nợ tại thời điểm gửi** để đối chiếu khi khách khiếu nại nội dung tin<br>• Retry chỉ gửi lại tin đủ điều kiện, có giới hạn số lần, không gửi lại tin `Skipped` <span style="color:#CC0000">(số lần tối đa và cooldown mặc định: ##)</span><br>• Phản hồi của khách định tuyến về trưởng phòng (TPVH) phụ trách; hội thoại đồng bộ vào hệ thống<br>• Gửi thành công **không đồng nghĩa** đã thanh toán<br>• Trạng thái tin: `Scheduled → Sent / Failed → Retrying → Sent / Gave up → Fallback`; `Skipped` khi đã thu đủ<br>• SĐT khách hiển thị che theo Common Rule 2 (AUDIT: ảnh cũ lộ SĐT khách) |
| **Sending Impact** | • Xem, lọc, tải log không làm thay đổi dữ liệu<br>• Tạo hoặc sửa rule: lưu cấu hình; trạng thái rule `Nháp` -> `Hiệu lực` -> `Tắt`<br>• Gửi đợt: tạo batch mã `B-xxxx` <span style="color:#CC0000">(cách sinh mã ##)</span>; mỗi khách/hóa đơn đủ điều kiện một tin ở `Scheduled`, lưu công nợ lúc gửi; tin bỏ qua lưu `Skipped`<br>• Kết quả gửi từ Zalo: `Sent` hoặc `Failed` kèm mã lỗi nhà cung cấp<br>• Gửi lại: `Failed` -> `Retrying` -> `Sent` hoặc `Gave up`; hết lượt -> `Fallback`<br>• Dừng đợt chưa chạy: <span style="color:#CC0000">## (trạng thái của batch và các tin Scheduled)</span><br>• Gán phản hồi: lưu người phụ trách phản hồi<br>• Không thay đổi hóa đơn và công nợ<br>• Mọi thao tác ghi audit theo Common Rule 5 |

## 2. Screen 17.1: Zalo ZNS — rule gửi tự động

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — ảnh ImageGen UI-17-zalo-zns.png KHÔNG ĐẠT (AUDIT: thiếu bảng rule gửi, phương án dự phòng gọi/SMS, cột "Nợ lúc gửi" và retry, định tuyến phản hồi, CTA "+ Tạo đợt gửi"; số liệu tự mâu thuẫn; lộ SĐT khách), không dùng. Nội dung dựng từ spec (wireframe UI-17).</span></p>
<p align="center"><b>Screen 17.1: Zalo ZNS — rule gửi tự động</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Zalo nhắc thanh toán`<br>• Breadcrumb: `Trang chủ / Hóa đơn & thu tiền / Zalo nhắc thanh toán`<br>• <span style="color:#CC0000">Spec có 3 route `#/zalo/config`, `#/zalo/history`, `#/zalo/batches/:id`; cần xác nhận màn này dùng route nào</span> |
| Tiêu đề trang | Text | No | • Hiển thị "Zalo ZNS" |
| Cấu hình | Button | No | • Always display<br>• Enabled only when người dùng có quyền cấu hình Zalo<br>• Click on -> <span style="color:#CC0000">## (mở cấu hình OA và danh sách template? spec chưa tách khỏi cấu hình rule)</span> |
| Lịch sử | Button | No | • Always display<br>• Always enabled<br>• Click on -> Go to Lịch sử tin (Screen 17.4) |
| + Tạo đợt gửi | Button | No | • Always display. Đây là CTA chính của màn<br>• Enabled only when người dùng có quyền tạo đợt gửi<br>• Click on -> Go to Tạo đợt gửi (Screen 17.3) |
| 🟧 ① Rule gửi tự động | | | • Ghi chú dưới bảng: "ⓘ Công cụ tự đặt điều kiện + thời điểm, không phải danh sách cứng" |
| Tạo rule | Button | No | • Always display<br>• Enabled only when người dùng có quyền cấu hình Zalo<br>• Click on -> Display Popup cấu hình rule gửi, chế độ tạo mới (Screen 17.2)<br>• <span style="color:#CC0000">Wireframe chưa vẽ nút tạo rule dù spec yêu cầu bảng rule tạo được — cần xác nhận vị trí</span> |
| 🟦 Bảng rule | | | • Display the list of rule gửi đã cấu hình<br>• Không có rule: display error message <span style="color:#CC0000">E##</span><br>• Default sorting: <span style="color:#CC0000">##</span><br>• Click on một dòng -> Display Popup cấu hình rule gửi, chế độ sửa (Screen 17.2) |
| Tên rule | Text | No | • Tên do người dùng đặt, ví dụ "Nhắc hóa đơn", "Nhắc trước hạn", "Nhắc quá hạn", "Báo hoàn cọc" |
| Sự kiện | Text | No | • Sự kiện kích hoạt, ví dụ "Hóa đơn phát hành", "Đến hạn TT", "Quá hạn TT", "Hoàn cọc đã chi" (refer to FR16) |
| Điều kiện | Text | No | • Điều kiện lọc người nhận, ví dụ "mọi hóa đơn", "còn dư nợ > 0"; không có hiển thị `—` |
| Thời điểm | Text | No | • Độ lệch so với sự kiện, ví dụ "+0 ngày", "−2 ngày", "+1,+5 ngày"<br>• <span style="color:#CC0000">Hạn TT là một khoảng (25 → cuối tháng); cần xác nhận "Đến hạn TT −2 ngày" tính từ ngày 25 hay ngày cuối tháng</span> |
| Trạng thái | Tag | No | • Trạng thái rule (Common Rule 4): Nháp, Hiệu lực, Tắt |

## 3. Screen 17.2: Popup cấu hình rule gửi

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (mục "Cấu hình" của UI-17).</span></p>
<p align="center"><b>Screen 17.2: Popup cấu hình rule gửi</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận dạng popup, drawer hay trang)</span> | | | |
| Tên rule | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Template | Dropdown | Yes | • Always display<br>• Default selection: None<br>• Click on -> Display danh sách template ZNS **đã được Zalo duyệt**, ví dụ `HOADON_THANG`, `NHACNO_QH`<br>• Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Sự kiện | Dropdown | Yes | • Always display<br>• Click on -> Display the list of following options: Hóa đơn phát hành, Đến hạn TT, Quá hạn TT, Hoàn cọc đã chi <span style="color:#CC0000">(cần xác nhận danh mục đầy đủ)</span><br>• Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Điều kiện | Dropdown | No | • Always display<br>• Default selection: mọi hóa đơn<br>• Click on -> Display the list of following options: mọi hóa đơn, còn dư nợ > 0 <span style="color:#CC0000">(cần xác nhận có trình dựng điều kiện tự do không)</span><br>• Allow single selection only |
| Thời điểm | Textbox | Yes | • Always display<br>• Nhập một hoặc nhiều độ lệch ngày so với sự kiện, phân cách bằng dấu phẩy, ví dụ "−2", "+1,+5"<br>• Allow entering số nguyên có dấu và dấu phẩy. Max length: <span style="color:#CC0000">##</span><br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• Sai định dạng -> Show error message <span style="color:#CC0000">E##</span><br>• <span style="color:#CC0000">Giờ gửi trong ngày: ##</span> |
| Cooldown | Textbox | No | • Always display<br>• Khoảng tối thiểu giữa 2 tin cho cùng khách <span style="color:#CC0000">(đơn vị và mặc định ##)</span><br>• Allow entering numeric values. Max length: 12 |
| Số lần retry | Textbox | No | • Always display<br>• Allow entering numeric values. Max length: 12<br>• Default: <span style="color:#CC0000">##</span> |
| Phương án dự phòng | Dropdown | No | • Always display<br>• Click on -> Display the list of following options: Gọi, SMS <span style="color:#CC0000">(cần xác nhận)</span><br>• Allow single and multiple selection<br>• Áp khi khách chưa liên kết Zalo hoặc tin `Gave up` |
| Trạng thái rule | Dropdown | Yes | • Always display<br>• Default selection: Nháp<br>• Click on -> Display the list of following options: Nháp, Hiệu lực, Tắt<br>• Allow single selection only |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Nếu có thay đổi -> hiển thị xác nhận rời (Common Rule 9); nếu không -> đóng popup |
| Lưu | Button | No | • Always appear<br>• Enabled only when đã nhập đủ field bắt buộc<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ Template chưa được Zalo duyệt -> display error message <span style="color:#CC0000">E##</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> lưu rule, đóng popup, cập nhật bảng rule (Screen 17.1) |

## 4. Screen 17.3: Tạo đợt gửi

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (vùng ② wireframe UI-17).</span></p>
<p align="center"><b>Screen 17.3: Tạo đợt gửi</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Zalo nhắc thanh toán`<br>• Breadcrumb: `Trang chủ / Hóa đơn & thu tiền / Zalo nhắc thanh toán / Tạo đợt gửi`<br>• <span style="color:#CC0000">Wireframe vẽ vùng ② ngay trong màn Zalo ZNS; cần xác nhận là trang riêng hay khối của Screen 17.1</span> |
| Tiêu đề | Text | No | • Hiển thị "Tạo đợt gửi — preview trước khi bấm gửi" |
| 🟧 Tham số đợt gửi | | | |
| Sự kiện | Dropdown | Yes | • Always display<br>• Default selection: None; mở từ FR14 thì mặc định "Nhắc quá hạn"<br>• Click on -> Display the list of following options: các rule/sự kiện ở Screen 17.1, ví dụ "Nhắc quá hạn"<br>• Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• Select an option -> Dựng lại danh sách người nhận và preview |
| Kỳ | Dropdown | Yes | • Always display<br>• Default selection: kỳ đang chọn trên Header, ví dụ "09/2026"<br>• Click on -> Display danh sách kỳ. Allow single selection only<br>• Select an option -> Dựng lại danh sách người nhận và preview |
| Phạm vi | Dropdown | Yes | • Always display<br>• Default selection: <span style="color:#CC0000">##</span><br>• Click on -> Display danh sách tòa trong phạm vi quyền, ví dụ "Tòa T17"<br>• Allow single selection only <span style="color:#CC0000">(cần xác nhận có chọn nhiều tòa)</span><br>• Select an option -> Dựng lại danh sách người nhận và preview |
| 🟧 Preview | | | • Bắt buộc lấy lại công nợ ngay trước khi gửi; ba nhóm hiện trước khi bấm gửi |
| Lần lấy công nợ | Text | No | • Content format: "✓ Đã lấy lại công nợ lúc {hh:mm} (ngay trước khi gửi)", ví dụ "09:14" |
| 🟦 Bảng 3 nhóm | | | • Luôn đủ 3 dòng, không phân trang<br>• <span style="color:#CC0000">Click on một nhóm -> ## (xem danh sách khách của nhóm?)</span> |
| Đủ điều kiện | Number | No | • Số tin sẽ gửi, ví dụ "38 · sẽ gửi" |
| Bỏ qua | Number | No | • Số khách đã thu đủ, không gửi, ví dụ "12 · đã thu đủ → skip" |
| Không gửi được | Number | No | • Số khách không gửi được kèm lý do, ví dụ "4 · △ khách chưa liên kết Zalo" |
| Phương án dự phòng: gọi/SMS | Button | No | • Display only when Không gửi được > 0<br>• Always enabled<br>• Click on -> <span style="color:#CC0000">## (tạo việc gọi/SMS ở Work Queue hay xuất danh sách?)</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Không tạo đợt, Go back to màn trước |
| Gửi {n} tin | Button | No | • Always appear. Nhãn hiển thị số tin Đủ điều kiện, ví dụ "Gửi 38 tin"<br>• Enabled only when Đủ điều kiện > 0<br>• Click on -> Lấy lại công nợ lần nữa ngay trước khi gửi:<br>&nbsp;&nbsp;◦ Số liệu thay đổi -> cập nhật preview và yêu cầu bấm gửi lại <span style="color:#CC0000">(cần xác nhận)</span><br>&nbsp;&nbsp;◦ Không thay đổi -> tạo batch, các tin ở `Scheduled`, Go to Lịch sử tin lọc theo batch vừa tạo (Screen 17.4) |

## 5. Screen 17.4: Lịch sử tin

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — ảnh UI-17-zalo-zns.png KHÔNG ĐẠT (xem Screen 17.1), không dùng. Nội dung dựng từ spec (vùng ③④⑤ wireframe UI-17).</span></p>
<p align="center"><b>Screen 17.4: Lịch sử tin</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Zalo nhắc thanh toán`<br>• Breadcrumb: `Trang chủ / Hóa đơn & thu tiền / Zalo nhắc thanh toán / Lịch sử` |
| 🟧 Filter section | | | • <span style="color:#CC0000">Spec chưa nêu bộ lọc của lịch sử tin — cần xác nhận (dự kiến batch, template, trạng thái, khoảng ngày gửi)</span> |
| 🟧 ③ Lịch sử tin | | | |
| 🟦 Bảng lịch sử tin | | | • Display mỗi tin một dòng, gồm cả tin `Skipped`<br>• SĐT khách che theo Common Rule 2<br>• No data: <span style="color:#CC0000">E##</span><br>• Default sorting: <span style="color:#CC0000">## (dự kiến mới nhất trước)</span><br>• Phân trang theo Common Rule 6<br>• Click on một dòng -> <span style="color:#CC0000">## (chi tiết tin: mã lỗi nhà cung cấp, thời gian, hội thoại?)</span> |
| Batch | Text | No | • Mã đợt gửi, ví dụ `B-0912`; kèm người tạo và thời điểm scheduled/sent |
| Template | Text | No | • Mã template, ví dụ `NHACNO_QH`, `HOADON_THANG` |
| Khách / Phòng | Text | No | • Mã phòng và tên khách<br>• Click on mã phòng -> Go to Chi tiết hóa đơn liên quan (Screen 12.2) hoặc chi tiết khách (refer to FR06) <span style="color:#CC0000">(cần xác nhận đích)</span> |
| Nợ lúc gửi | Number | No | • Công nợ của khách tại thời điểm gửi, ví dụ "10.048.000"; dùng để đối chiếu khi khách khiếu nại |
| Trạng thái | Tag | No | • Trạng thái tin (Common Rule 4): Scheduled, Sent, Failed, Retrying, Gave up, Fallback, Skipped<br>• Failed kèm mã lỗi nhà cung cấp |
| Retry | Number | No | • Số lần đã gửi lại |
| Phản hồi | Text | No | • Nội dung phản hồi gần nhất của khách, ví dụ ""ok em""; chưa có hiển thị `—`<br>• Kèm người được gán xử lý phản hồi<br>• <span style="color:#CC0000">Click on -> ## (mở hội thoại đồng bộ; thao tác gán phản hồi cho TPVH)</span> |
| Page number | Text | No | • Click on a page number -> Go to the corresponding page |
| 🟧 ④ Hành động | | | |
| Gửi lại các tin đủ điều kiện | Button | No | • Always display<br>• Enabled only when có ít nhất 1 tin `Failed` còn lượt retry<br>• Click on -> Gửi lại chỉ các tin đủ điều kiện, không gửi lại tin `Skipped`; tin -> `Retrying` |
| Tải log | Button | No | • Always display<br>• Always enabled<br>• Click on -> Tải file log của các tin đang lọc <span style="color:#CC0000">(định dạng ##)</span> |
| Dừng batch | Button | No | • Display only when đang lọc theo một batch còn tin `Scheduled`<br>• Enabled only when người dùng có quyền tạo đợt gửi<br>• Click on -> <span style="color:#CC0000">Display popup xác nhận dừng batch (Screen ##)</span><br>• <span style="color:#CC0000">Wireframe chưa vẽ nút này; spec chỉ liệt kê action "dừng batch chưa chạy"</span> |
| 🟧 ⑤ Phản hồi khách | | | |
| Định tuyến phản hồi | Text | No | • Always display<br>• Content format: "Phản hồi khách → về TRƯỞNG PHÒNG phụ trách, có đồng bộ hội thoại" |

## 6. User Steps

| | |
|:-:|---|
| **Pre-condition** | Người dùng đã đăng nhập với quyền tạo đợt gửi; hóa đơn kỳ đã phát hành (F-02 bước 6) |
| **User steps** | **Step 1:** Click menu `Zalo nhắc thanh toán` -> display Zalo ZNS — rule gửi tự động (Screen 17.1)<br>**Step 2:** Click `+ Tạo đợt gửi` -> display Tạo đợt gửi (Screen 17.3)<br>**Step 3:** Chọn sự kiện, kỳ, phạm vi; xem preview rồi click `Gửi {n} tin` -> display Lịch sử tin lọc theo batch vừa tạo (Screen 17.4) |

| | |
|:-:|---|
| **Pre-condition** | Người dùng có quyền cấu hình Zalo |
| **User steps** | **Step 1:** Tại Screen 17.1, click `Tạo rule` hoặc click một dòng rule -> display Popup cấu hình rule gửi (Screen 17.2)<br>**Step 2:** Click `Lưu` -> display bảng rule đã cập nhật (Screen 17.1) |

| | |
|:-:|---|
| **Pre-condition** | Có tin `Failed` trong một đợt gửi |
| **User steps** | **Step 1:** Tại Screen 17.1, click `Lịch sử` -> display Lịch sử tin (Screen 17.4)<br>**Step 2:** Click `Gửi lại các tin đủ điều kiện` -> các tin đủ điều kiện chuyển `Retrying`, bảng cập nhật trên Screen 17.4 |
