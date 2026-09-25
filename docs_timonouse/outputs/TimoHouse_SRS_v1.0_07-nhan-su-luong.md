# TIMOHOUSE — SRS · Cụm Nhân sự & lương

**Phiên bản:** 1.0 · **Ngày lập:** 25/09/2026 · **Trạng thái:** DRAFT, chờ khách hàng xác nhận
**Phạm vi:** cụm **Nhân sự & lương**, gồm FR18 Cơ cấu tổ chức, FR19 Nhân sự, FR20 Phân công tòa nhà, FR21 Hiệu suất thu tiền, FR22 Bảng lương, FR23 Chi lương.

**Nguồn:** [`TimoHouse_UI_Mockup_Spec_v1.0.md`](TimoHouse_UI_Mockup_Spec_v1.0.md) bản 1.9 (§4, §6, §7, UI-18…UI-23, §13 flow F-05 và F-08, §14, §15 Decision Log #16, #17, #18, #19, #20, #25, §16, §18); dữ liệu mẫu ở [`TimoHouse_Mockup_Seed_Data_v1.0.md`](TimoHouse_Mockup_Seed_Data_v1.0.md) §9, §15, §16; ảnh mockup ở [`ui-imagegen-v1/07-nhan-su-luong/`](ui-imagegen-v1/07-nhan-su-luong/README.md), kết luận từng ảnh theo [`AUDIT.md`](ui-imagegen-v1/AUDIT.md). Chỉ ảnh UI-20 (ĐẠT CÓ LƯU Ý) được nhúng; 5 ảnh còn lại KHÔNG ĐẠT nên không dùng. Ảnh flow F-05 (KHÔNG ĐẠT) và F-08 (ĐẠT CÓ LƯU Ý) chỉ dùng để đối chiếu bước, không nhúng.

Quy ước đọc tài liệu và Common Rules 1–14 xem [`TimoHouse_SRS_v1.0.md`](TimoHouse_SRS_v1.0.md#common-rules-dùng-chung-cho-mọi-fr); tài liệu này chỉ dẫn chiếu, không lặp lại.

---

## Quy tắc chung của cụm

Các FR bên dưới dẫn chiếu `Cluster Rule 07.N` thay vì lặp lại.

| Mã | Nội dung | Nguồn |
|---|---|---|
| Cluster Rule 07.1 | **Dữ liệu có hiệu lực theo thời gian**: đơn vị tổ chức, Lead, đơn vị/chức danh/level của nhân sự, cấu phần lương theo level và phân công tòa đều lưu theo khoảng hiệu lực từ–đến. Mọi thay đổi tạo dòng hoặc phiên bản mới, không ghi đè dòng cũ. Control `Xem tại ngày` mặc định là hôm nay, chọn được ngày quá khứ và tương lai; đổi ngày -> tải lại dữ liệu hiệu lực tại ngày đó. Thay đổi có hiệu lực tương lai không tác động tới cây tổ chức, quyền, cascading filter, dashboard và hiệu suất tạm tính trước ngày hiệu lực | BR-3.01.2, BR-3.01.4, BR-3.02.4, BR-3.03.13 |
| Cluster Rule 07.2 | **Kỳ lương và ngày tham chiếu** (**ASSUMED**): kỳ lương N đi theo đợt hóa đơn tiền phòng tháng N; ngày chốt kỳ là 16/N (P-06). Hiệu suất và lương hiệu suất **cả tháng** của một tòa thuộc về người là phụ trách chính tại **ngày 15** của kỳ (P-21), không chia theo ngày. Lương cố định lấy giá trị level hiệu lực tại ngày chốt, không prorate theo ngày công | Decision Log #18; BR-3.02.3, BR-3.03.5, R-23 |
| Cluster Rule 07.3 | **Quyền xem lương**: lương là dữ liệu nhạy cảm, phân quyền theo từng cấu phần chứ không theo cả màn. NV chỉ xem của mình; TNVH xem lương hiệu suất của cấp dưới nhưng **không** xem lương cố định; chỉ Admin/Kế toán sửa. HR và Quản lý tổng gộp vào Admin/Kế toán (**ASSUMED**, P-22). Cấu phần người dùng không có quyền xem: <span style="color:#CC0000">## (ẩn cột, che giá trị hay hiển thị `•••` — cần xác nhận)</span> | BR-3.02.10, R-34; Decision Log #25 |
| Cluster Rule 07.4 | **Tham số chờ chốt**: mọi số liệu phụ thuộc một `P-xx` chưa chốt hiển thị chip `Cần xác nhận nghiệp vụ` kèm mã tham số; giá trị đọc từ trang cấu hình tham số (refer to FR33), không hard-code | §18 |
| Cluster Rule 07.5 | **Ba mẫu số phòng, không dùng lẫn**:<br>• N phân bổ chi phí = phòng đang quản lý, kể cả phòng trống (tháng 8: 1.382)<br>• Số phòng tính hiệu suất = phòng có hóa đơn trong kỳ (tháng 8: 1.079)<br>• Số phòng dưới quyền của Lead = Σ tổng phòng đang quản lý, kể cả trống, tại snapshot ngày 15 (P-12)<br>• Số 1.343 trong file Excel gốc là lỗi nguồn, không dùng | P-05, P-12; Decision Log #17, #20 |
| Cluster Rule 07.6 | **Không sửa trực tiếp số tổng**: hiệu suất, lương hiệu suất và tổng bảng lương chỉ thay đổi qua đề nghị điều chỉnh có lý do và được duyệt. Kỳ lương đã khóa giữ snapshot, không tính lại | UI-21, UI-22 |

---
---

# FR18 - Cơ cấu tổ chức

## 1. Business Rule

| | |
|:-:|---|
| **Authorization** | • Admin: sửa cây, di chuyển và ngừng đơn vị, bổ nhiệm/thay Lead (BR-3.01.9, Cần chốt)<br>• TPVH: chỉ tạo đề xuất dạng nháp trong khối Vận hành (BR-3.01.9, Cần chốt)<br>• Kế toán: <span style="color:#CC0000">## (HR gộp vào Admin/Kế toán theo Decision Log #25 — cần xác nhận Kế toán có quyền sửa cây không)</span><br>• Các vai trò còn lại: <span style="color:#CC0000">## (spec chưa nêu quyền xem cây tổ chức)</span> |
| **Management Rule** | • Người dùng xem và quản lý cây tổ chức có lịch sử theo ngày hiệu lực. Cây phục vụ 3 việc: xác định Lead của từng đơn vị, làm trục cho cascading filter toàn hệ thống, và phân quyền theo đơn vị<br>• Chức năng chỉ thực hiện được khi người dùng đã đăng nhập với vai trò thuộc Authorization <span style="color:#CC0000">##</span><br>• Cây tổ chức **không** quyết định ai quản lý tòa nào; việc đó thuộc Phân công tòa (refer to FR20, R-33)<br>• Dữ liệu cây có hiệu lực theo thời gian (Cluster Rule 07.1)<br>• Cây mẫu Phase 1:<br>&nbsp;&nbsp;◦ Công ty (HT CCMN TIMEHOUSE)<br>&nbsp;&nbsp;◦ Quản lý tổng (Admin)<br>&nbsp;&nbsp;◦ Phòng Vận hành, Lead TPVH, gồm: Nhóm vận hành / Khu vực 1 (Lead TNVH), Nhóm vận hành / Khu vực 2 (Lead TNVH/Trưởng khu vực), Tổ Kỹ thuật, Tổ Vệ sinh<br>&nbsp;&nbsp;◦ Phòng Tài chính – Kế toán<br>&nbsp;&nbsp;◦ Phòng Kinh doanh, Phòng Thị trường: lương ngoài phạm vi (X-05)<br>• Field đơn vị: `code` (ví dụ `OPS`, `OPS-KV1`, `TECH`, `CLEAN`, `FIN`, `SALES`, `MKT`), tên, `type` (`COMPANY`/`DEPARTMENT`/`TEAM`/`AREA`), đơn vị cha, `area_code`, Lead đang hiệu lực, hiệu lực từ/đến, trạng thái, mô tả<br>• Đơn vị Kinh doanh/Kỹ thuật/Thị trường/TC-KT có mặt trong cây để phân quyền và lọc, nhưng lương thuộc X-05 (BR-3.01.8)<br>• "Khu vực" là `area_code` gắn ở đơn vị cấp `TEAM`/`AREA` khối Vận hành và là nguồn của bộ lọc "Khu vực" toàn hệ thống. Trưởng khu vực = Lead của đơn vị đó. Một NVVH thuộc đúng 1 khu vực tại một thời điểm (BR-3.01.6, Cần chốt)<br>• Cascading filter chuẩn dùng lại ở mọi màn: Khu vực → Trưởng nhóm → Quản lý → Tòa → Loại nhà (T/S/G, L1–L3). Chọn cấp trên thu hẹp cấp dưới. Cặp Quản lý → Tòa lấy từ FR20 tại ngày xem (BR-3.01.7, R-34)<br>• Lead:<br>&nbsp;&nbsp;◦ Mỗi đơn vị có **đúng một Lead** hiệu lực tại một thời điểm; bổ nhiệm mới tự đóng Lead cũ vào ngày liền trước (BR-3.01.1)<br>&nbsp;&nbsp;◦ Lịch sử Lead không ghi đè: mọi thay đổi tạo dòng mới, giữ nguyên dòng cũ (BR-3.01.2)<br>&nbsp;&nbsp;◦ Lead phải là nhân viên `PROBATION`/`ACTIVE` có `management_level ≥ 1` (BR-3.01.10, Cần chốt)<br>&nbsp;&nbsp;◦ Dòng Lead gồm: đơn vị, nhân viên, hiệu lực từ/đến không chồng lấn, số quyết định, lý do, người tạo/người duyệt<br>• Chức danh (`POSITION`): mã `TPVH`, `TNVH`, `TKV`, `NVVH`, `KT`, `VS`, `KETOAN`, `TNKD`, `NVKD`, `SALE`, `ADMIN`; `management_level` 0 nhân viên · 1 trưởng nhóm/khu vực · 2 trưởng phòng · 3 quản lý tổng; loại đơn vị được gán; cờ `is_ops_payroll` quyết định nhân sự được tính lương ở FR22 hay thuộc X-05<br>• Cây không có chu trình; đơn vị cha phải `ACTIVE` tại ngày hiệu lực của đơn vị con (BR-3.01.3)<br>• Chặn ngừng đơn vị còn đơn vị con hoặc nhân viên có phân công hiệu lực (BR-3.01.5, Cần chốt)<br>• Số phòng "dưới quyền" của Lead = Σ tổng phòng đang quản lý (kể cả trống) của các tòa do NVVH thuộc đơn vị phụ trách chính, đệ quy xuống đơn vị con, lấy tại snapshot ngày 15; TPVH tính toàn hệ thống. Đây là mẫu số riêng (Cluster Rule 07.5), dùng tính lương trưởng nhóm = số phòng dưới quyền × 10.000 (BR-3.01.11, R-22 → P-12; Decision Log #17, **ASSUMED**)<br>• <span style="color:#CC0000">Mâu thuẫn spec ↔ seed: Seed §9.1 ghi TPVH 774 phòng và TNVH 408 phòng (tổng 1.182); nếu "TPVH tính toàn hệ thống" thì số của TPVH phải không nhỏ hơn 1.079 (hoặc 1.382) — cần xác nhận định nghĩa</span><br>• Trạng thái đơn vị:<br>&nbsp;&nbsp;◦ PLANNED: đơn vị có hiệu lực tương lai; tự chuyển `ACTIVE` khi đến ngày hiệu lực<br>&nbsp;&nbsp;◦ ACTIVE: đang hoạt động<br>&nbsp;&nbsp;◦ INACTIVE: đã ngừng; không quay lại, muốn dùng lại phải tạo đơn vị mới<br>• Trạng thái dòng Lead theo ngày đang xem: Sắp tới / Hiệu lực / Đã kết thúc<br>• Ngoại lệ: Lead nghỉ việc trước khi có người thay -> đơn vị vào trạng thái "thiếu Lead", Work Queue cảnh báo Admin (refer to FR01). Phân công tòa và lương hiệu suất của NVVH không bị ảnh hưởng; riêng lương trưởng nhóm kỳ đó = 0 cho vị trí trống |
| **Management Impact** | • Xem cây, đổi `Xem tại ngày`, xem nhân sự/tòa thuộc đơn vị, xem lịch sử và export không làm thay đổi dữ liệu<br>• Tạo đơn vị: tạo `ORG_UNIT`; hiệu lực từ ngày tương lai -> trạng thái `PLANNED`, đến ngày hiệu lực tự chuyển `ACTIVE`<br>• Sửa hoặc di chuyển đơn vị: <span style="color:#CC0000">## (spec chưa nêu sửa thuộc tính đơn vị tạo phiên bản mới hay ghi đè; chỉ nêu "lập thay đổi có hiệu lực tương lai")</span><br>• Bổ nhiệm/thay Lead: tạo dòng mới trong `ORG_UNIT_LEAD_HISTORY`; dòng Lead đang hiệu lực tự đóng vào ngày liền trước ngày hiệu lực mới<br>• TPVH tạo đề xuất: lưu dạng nháp <span style="color:#CC0000">(luồng Admin duyệt đề xuất chưa được mô tả — cần bổ sung)</span><br>• Ngừng đơn vị: `ACTIVE` -> `INACTIVE`, lưu lý do<br>• Mọi thao tác ghi audit theo Common Rule 5 |

## 2. Screen 18.1: Cơ cấu tổ chức

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — ảnh ImageGen UI-18-organization-structure.png KHÔNG ĐẠT (AUDIT: cây tổ chức do AI tự đặt, thiếu Kinh doanh/Thị trường X-05; thiếu Xem tại ngày, timeline Lead, 408 phòng dưới quyền, băng lọc liên cấp; sai tên TPVH/TNVH), không dùng. Nội dung dựng từ spec (wireframe UI-18).</span></p>
<p align="center"><b>Screen 18.1: Cơ cấu tổ chức</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Cơ cấu tổ chức`<br>• Breadcrumb: `Trang chủ / Nhân sự & lương / Cơ cấu tổ chức` |
| Tiêu đề trang | Text | No | • Hiển thị "Cơ cấu tổ chức" |
| ① Xem tại ngày | Datepicker | No | • Always display. Đây là điều khiển quan trọng nhất của màn<br>• Default selection: ngày hôm nay, ví dụ `23/09/2026`<br>• Date format: DD/MM/YYYY (Common Rule 10)<br>• Click on -> Display a datepicker; cho phép chọn ngày quá khứ và tương lai<br>• Select a date -> Tải lại cây ②, chi tiết đơn vị ③, timeline Lead ④, nhân sự ⑤ và số phòng ⑥ theo dữ liệu hiệu lực tại ngày đã chọn (Cluster Rule 07.1) |
| + Đơn vị | Button | No | • Always display<br>• Enabled only when người dùng là Admin, hoặc TPVH (chỉ tạo đề xuất nháp trong khối Vận hành); không có quyền -> disabled kèm tooltip (Common Rule 7)<br>• Click on -> Display Popup tạo/sửa đơn vị ở chế độ tạo (Screen 18.2) |
| Xuất | Button | No | • Spec có action "export cây + lịch sử Lead" nhưng wireframe chưa vẽ nút<br>• <span style="color:#CC0000">Vị trí nút, điều kiện hiển thị và định dạng file (CSV/XLSX?): ## — cần xác nhận</span> |
| 🟧 ② Cây tổ chức | | | |
| Cây tổ chức | Text | No | • Display cây đơn vị hiệu lực tại ngày ở ①, theo cây mẫu Phase 1 (Business Rule)<br>• Mỗi nút gồm tên đơn vị và nhãn Lead dạng `[Chức danh: Tên]`, ví dụ "Phòng Vận hành [TPVH]", "KV1 [TNVH: Huy]"<br>• Đơn vị Phòng Kinh doanh, Phòng Thị trường gắn nhãn `X-05` (lương ngoài phạm vi Phase 1)<br>• Nút có đơn vị con hiển thị icon ▾/▸. Click on icon -> Expand / Collapse nhánh con<br>• Default status: <span style="color:#CC0000">## (wireframe mở tới cấp Phòng Vận hành — cần xác nhận mức mở mặc định)</span><br>• Đơn vị đang chọn được đánh dấu ● và highlight<br>• Click on một đơn vị -> Hiển thị thông tin đơn vị đó ở ③, ④, ⑤, ⑥<br>• Đơn vị được chọn mặc định khi mở màn: <span style="color:#CC0000">##</span><br>• Đơn vị ở trạng thái "thiếu Lead": <span style="color:#CC0000">## (cần xác nhận cách hiển thị cảnh báo trên cây)</span><br>• Đơn vị `PLANNED` hoặc `INACTIVE` tại ngày xem: <span style="color:#CC0000">## (ẩn hay hiển thị kèm chip trạng thái?)</span> |
| 🟧 ③ Chi tiết đơn vị | | | • Tiêu đề khối: "Chi tiết đơn vị: {Mã đơn vị}"<br>• <span style="color:#CC0000">Wireframe vẽ Loại và Khu vực dạng Dropdown ngay trên khối nhưng không có nút Lưu — cần xác nhận sửa tại chỗ hay qua Screen 18.2</span> |
| Mã | Text | No | • Display mã đơn vị, ví dụ `OPS-KV1` |
| Tên | Text | No | • Display tên đơn vị, ví dụ "Nhóm vận hành / Khu vực 1" |
| Loại | Dropdown | No | • Display loại đơn vị hiện hành<br>• Enabled only when người dùng là Admin<br>• Click on -> Display the list of options: COMPANY, DEPARTMENT, TEAM, AREA<br>• Allow single selection only<br>• Select an option -> <span style="color:#CC0000">## (lưu ngay kèm ngày hiệu lực hay chờ xác nhận?)</span> |
| Cha | Text | No | • Display tên đơn vị cha, ví dụ "Phòng Vận hành"<br>• Đổi đơn vị cha (di chuyển đơn vị) thực hiện ở Screen 18.2 |
| Khu vực | Dropdown | No | • Display only when Loại = TEAM hoặc AREA (BR-3.01.6)<br>• Kèm ghi chú "← nguồn bộ lọc" vì đây là nguồn của bộ lọc Khu vực toàn hệ thống<br>• Enabled only when người dùng là Admin<br>• Click on -> Display danh mục khu vực, ví dụ "Mỹ Đình" <span style="color:#CC0000">(cần nguồn danh mục khu vực)</span><br>• Allow single selection only<br>• Select an option -> <span style="color:#CC0000">##</span> |
| Hiệu lực | Text | No | • Display khoảng hiệu lực "{từ ngày} – {đến ngày}", ví dụ "01/01/2025 –"<br>• Đến ngày trống = còn hiệu lực |
| Trạng thái | Tag | No | • Display trạng thái đơn vị tại ngày xem (Common Rule 4):<br>&nbsp;&nbsp;◦ PLANNED: có hiệu lực tương lai<br>&nbsp;&nbsp;◦ ACTIVE: đang hoạt động<br>&nbsp;&nbsp;◦ INACTIVE: đã ngừng, không mở lại được |
| Mô tả | Text | No | • Display mô tả đơn vị; trống hiển thị `—` (Common Rule 3)<br>• Có trong danh sách field của spec, chưa có trên wireframe |
| Action đơn vị | Button | No | • Spec liệt kê action sửa, di chuyển, ngừng đơn vị và xem lịch sử nhưng wireframe chưa có vị trí nút <span style="color:#CC0000">(cần xác nhận: nút riêng hay menu ⋯)</span><br>• Sửa / Di chuyển: Display only when trạng thái ≠ INACTIVE. Enabled only when người dùng là Admin. Click on -> Display Popup tạo/sửa đơn vị ở chế độ sửa (Screen 18.2)<br>• Ngừng đơn vị: Display only when trạng thái = ACTIVE. Enabled only when người dùng là Admin. Click on -> Display Popup ngừng đơn vị (Screen 18.4)<br>• Xem lịch sử: Always display. Click on -> <span style="color:#CC0000">Display lịch sử thay đổi đơn vị (Screen ##)</span> |
| 🟧 ④ Timeline Lead (không ghi đè) | | | |
| 🟦 Bảng timeline Lead | | | • Display mọi dòng Lead của đơn vị đang chọn; mỗi dòng giữ nguyên, không ghi đè (BR-3.01.2)<br>• Thứ tự: <span style="color:#CC0000">## (wireframe xếp theo ngày bắt đầu tăng dần — cần xác nhận)</span><br>• Đơn vị chưa từng có Lead: <span style="color:#CC0000">E##</span><br>• <span style="color:#CC0000">Mâu thuẫn trong wireframe: dòng "09/2026– Trần Q.Huy · Hiệu lực" không có ngày kết thúc dù đã có dòng "01/2027– (chưa có) · Sắp tới"; theo BR-3.01.1 dòng 09/2026 phải tự đóng vào 31/12/2026. Cần xác nhận ý nghĩa dòng tương lai "(chưa có)"</span> |
| Khoảng hiệu lực | Text | No | • "{từ} – {đến}"; đến trống = còn hiệu lực<br>• <span style="color:#CC0000">Wireframe hiển thị dạng MM/YYYY (ví dụ "01/2025–08/2026"), Common Rule 10 dùng DD/MM/YYYY — cần xác nhận</span> |
| Nhân viên | Text | No | • Họ tên Lead của khoảng hiệu lực; khoảng chưa có người hiển thị "(chưa có)" |
| Trạng thái | Tag | No | • Tính theo ngày ở ① (Common Rule 4):<br>&nbsp;&nbsp;◦ Đã kết thúc: đến ngày < ngày xem<br>&nbsp;&nbsp;◦ Hiệu lực: ngày xem nằm trong khoảng hiệu lực<br>&nbsp;&nbsp;◦ Sắp tới: từ ngày > ngày xem |
| Số quyết định · Lý do · Người tạo/duyệt | Text | No | • Các field của dòng Lead theo spec; wireframe chưa có cột<br>• <span style="color:#CC0000">Cần xác nhận hiển thị thành cột, tooltip hay màn lịch sử</span> |
| Bổ nhiệm / Thay Lead | Button | No | • Always display<br>• Enabled only when người dùng là Admin, hoặc TPVH (tạo đề xuất nháp) và đơn vị ở trạng thái ACTIVE hoặc PLANNED<br>• Click on -> Display Popup bổ nhiệm / thay Lead (Screen 18.3) |
| 🟧 ⑤ Nhân sự thuộc đơn vị | | | |
| Nhân sự thuộc đơn vị | Text | No | • Chỉ đọc<br>• Hiển thị số nhân sự theo chức danh, ví dụ "7 NVVH"<br>• Số tính tại ngày ở ① <span style="color:#CC0000">(cần xác nhận có tính đệ quy đơn vị con không)</span> |
| Xem ▸ | Button | No | • Always display<br>• Always enabled<br>• Click on -> Go to Danh sách nhân sự, lọc sẵn theo đơn vị đang chọn (Screen 19.1) |
| 🟧 ⑥ Số phòng dưới quyền | | | • Display only when <span style="color:#CC0000">## (đơn vị khối Vận hành có Lead `management_level ≥ 1`? — cần xác nhận)</span> |
| Số phòng dưới quyền | Text | No | • Content format: "Số phòng dưới quyền: {n} (snapshot 15)" + dòng cách tính "→ lương trưởng nhóm {n} × 10.000", ví dụ "408 (snapshot 15) → lương trưởng nhóm 408 × 10.000"<br>• Luôn hiển thị kèm cách tính vì đây là mẫu số riêng, khác số phòng tính hiệu suất (Cluster Rule 07.5)<br>• Hiển thị chip `Cần xác nhận nghiệp vụ · P-12` (Cluster Rule 07.4)<br>• Snapshot ngày 15 của kỳ nào khi ngày xem ≠ hôm nay: <span style="color:#CC0000">##</span> |
| 🟧 ⑦ Băng cascading filter | | | |
| Băng cascading | Text | No | • Always display<br>• Content format: "Cascading filter sinh ra từ màn này, dùng lại ở MỌI màn khác: Khu vực → Trưởng nhóm → Quản lý → Tòa → Loại nhà (T/S/G, L1–L3)"<br>• Nhắc rằng cặp Quản lý → Tòa lấy từ Phân công tòa (Screen 20.1) |

## 3. Screen 18.2: Popup tạo/sửa đơn vị

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (danh sách field đơn vị UI-18).</span></p>
<p align="center"><b>Screen 18.2: Popup tạo/sửa đơn vị</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận popup có X icon, và dạng modal hay drawer theo spec §7.3)</span> | | | |
| Mã | Textbox | Yes | • Always display<br>• Enable only when đang tạo mới <span style="color:#CC0000">(cần xác nhận mã có sửa được sau khi tạo)</span><br>• Placeholder: <span style="color:#CC0000">##</span><br>• Allow entering <span style="color:#CC0000">## (ký tự cho phép; ví dụ mã `OPS-KV1`)</span>. Max length: <span style="color:#CC0000">##</span><br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• Trùng mã đơn vị khác -> Show error message <span style="color:#CC0000">E##</span> |
| Tên | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Loại | Dropdown | Yes | • Always display<br>• Default selection: None<br>• Click on -> Display the list of following options: COMPANY, DEPARTMENT, TEAM, AREA<br>• Allow single selection only<br>• Select an option -> Hiện field Khu vực khi Loại = TEAM hoặc AREA; ẩn khi chọn loại khác<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Đơn vị cha | Dropdown | Yes | • Always display. Không bắt buộc với đơn vị gốc loại COMPANY<br>• Default selection: đơn vị đang chọn trên cây (khi tạo); đơn vị cha hiện hành (khi sửa)<br>• Click on -> Display danh sách đơn vị `ACTIVE` tại ngày Hiệu lực từ (BR-3.01.3)<br>• Allow single selection only<br>• Chọn đơn vị cha là chính nó hoặc một đơn vị con của nó (tạo chu trình) -> Show error message <span style="color:#CC0000">E##</span><br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Khu vực | Dropdown | No | • Display only when Loại = TEAM hoặc AREA<br>• Default selection: None<br>• Click on -> Display danh mục khu vực. Allow single selection only<br>• <span style="color:#CC0000">Cần xác nhận bắt buộc khi đơn vị thuộc khối Vận hành (BR-3.01.6)</span> |
| Hiệu lực từ | Datepicker | Yes | • Always display<br>• Default selection: <span style="color:#CC0000">## (hôm nay hay ngày 1 tháng kế?)</span><br>• Click on -> Display a datepicker; cho phép ngày tương lai. Chọn ngày tương lai = lập thay đổi có hiệu lực tương lai; đơn vị mới ở trạng thái PLANNED (BR-3.01.4)<br>• If an end date is selected, disable all dates after the specified end date<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hiệu lực đến | Datepicker | No | • Always display<br>• Default selection: None (không thời hạn)<br>• If a start date is selected, disable all dates before the specified start date |
| Mô tả | Textbox | No | • Always display<br>• Allow entering all types of characters. Max length: 255 |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không lưu |
| Lưu | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ Đơn vị cha không `ACTIVE` tại ngày Hiệu lực từ -> display error message <span style="color:#CC0000">E##</span><br>&nbsp;&nbsp;◦ Di chuyển tạo chu trình cha–con -> display error message <span style="color:#CC0000">E##</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Người dùng là Admin -> lưu đơn vị, đóng popup, cập nhật cây ở Screen 18.1, toast thành công (Common Rule 13)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Người dùng là TPVH -> lưu thành đề xuất nháp <span style="color:#CC0000">(nơi hiển thị đề xuất nháp: ##)</span> |

## 4. Screen 18.3: Popup bổ nhiệm / thay Lead

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (vùng ④ và field dòng Lead UI-18).</span></p>
<p align="center"><b>Screen 18.3: Popup bổ nhiệm / thay Lead</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận popup có X icon)</span> | | | |
| Đơn vị | Text | No | • Display "{Mã} · {Tên}" của đơn vị đang chọn ở Screen 18.1 |
| Lead hiện tại | Text | No | • Display only when đơn vị có Lead hiệu lực tại ngày xem<br>• Display họ tên và ngày bắt đầu của Lead hiện tại |
| Nhân viên | Dropdown | Yes | • Always display<br>• Placeholder: <span style="color:#CC0000">##</span><br>• Default selection: None<br>• Click on -> Display danh sách nhân viên trạng thái Thử việc/Đang làm có `management_level ≥ 1` (BR-3.01.10)<br>• Allow single selection only<br>• <span style="color:#CC0000">Cần xác nhận dropdown có ô tìm kiếm</span><br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hiệu lực từ | Datepicker | Yes | • Always display<br>• Default selection: <span style="color:#CC0000">##</span><br>• Click on -> Display a datepicker; cho phép ngày tương lai (dòng Lead hiển thị "Sắp tới")<br>• Select a date -> Cập nhật dòng xem trước bên dưới<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Số quyết định | Textbox | No | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• <span style="color:#CC0000">Cần xác nhận có bắt buộc không</span> |
| Lý do | Textbox | No | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• <span style="color:#CC0000">Cần xác nhận có bắt buộc không</span> |
| Xem trước thay đổi | Text | No | • Display only when đơn vị đang có Lead hiệu lực<br>• Content format: "Kết thúc: {Lead cũ} đến {Hiệu lực từ − 1 ngày}" và "Bắt đầu: {Lead mới} từ {Hiệu lực từ}" (BR-3.01.1)<br>• <span style="color:#CC0000">Spec chưa có phác họa khối này — cần xác nhận</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không lưu |
| Lưu | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ Khoảng hiệu lực chồng với dòng Lead tương lai đã có -> display error message <span style="color:#CC0000">E##</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> tạo dòng Lead mới, tự đóng dòng cũ vào ngày liền trước, đóng popup và cập nhật timeline ④ ở Screen 18.1. TPVH: lưu thành đề xuất nháp |

## 5. Screen 18.4: Popup ngừng đơn vị

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (ràng buộc "Khi ngừng đơn vị" UI-18).</span></p>
<p align="center"><b>Screen 18.4: Popup ngừng đơn vị</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Message | Text | No | • Danger popup (Common Rule 11)<br>• Content format: <span style="color:#CC0000">"##" (cần nội dung chính xác)</span><br>• Nêu rõ đơn vị INACTIVE không mở lại được, muốn dùng lại phải tạo đơn vị mới |
| Danh sách chặn | Text | No | • Display only when đơn vị còn đơn vị con hoặc nhân viên có phân công hiệu lực (BR-3.01.5)<br>• Liệt kê đơn vị con và nhân viên còn phân công, kèm hướng xử lý<br>• Khi hiển thị: nút `Ngừng đơn vị` bị disabled |
| Ngày ngừng | Datepicker | Yes | • Always display<br>• Default selection: <span style="color:#CC0000">##</span><br>• <span style="color:#CC0000">Spec chưa nêu field ngày ngừng — cần xác nhận ngừng theo ngày hiệu lực đến hay ngừng ngay</span> |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Ngừng đơn vị | Button | No | • Always appear<br>• Enabled only when đã nhập Lý do và không có Danh sách chặn<br>• Click on -> Chuyển đơn vị sang `INACTIVE`, lưu lý do, đóng popup và cập nhật Screen 18.1 |

## 6. User Steps

| | |
|:-:|---|
| **Pre-condition** | Người dùng đã đăng nhập với vai trò Admin |
| **User steps** | **Step 1:** Click menu `Cơ cấu tổ chức` -> display Cơ cấu tổ chức (Screen 18.1)<br>**Step 2:** Chọn một đơn vị trên cây, click `Bổ nhiệm / Thay Lead` ở ④ -> display Popup bổ nhiệm / thay Lead (Screen 18.3)<br>**Step 3:** Chọn nhân viên, ngày hiệu lực rồi click `Lưu` -> đóng popup, display Cơ cấu tổ chức với timeline Lead đã cập nhật (Screen 18.1)<br>**Step 4:** Click `+ Đơn vị` -> display Popup tạo/sửa đơn vị (Screen 18.2)<br>**Step 5:** Tại ⑤, click `Xem ▸` -> display Danh sách nhân sự lọc theo đơn vị (Screen 19.1) |

| | |
|:-:|---|
| **Pre-condition** | Admin muốn ngừng một đơn vị đang ACTIVE |
| **User steps** | **Step 1:** Tại Screen 18.1, chọn đơn vị rồi click action `Ngừng đơn vị` -> display Popup ngừng đơn vị (Screen 18.4)<br>**Step 2:** Nhập lý do, click `Ngừng đơn vị` -> display Cơ cấu tổ chức, đơn vị ở trạng thái INACTIVE (Screen 18.1) |

---
---

# FR19 - Nhân sự

## 1. Business Rule

| | |
|:-:|---|
| **Authorization** | • Admin, Kế toán: thêm/sửa hồ sơ, điều chuyển, quản lý phiên bản lương theo level, tài khoản ngân hàng, ghi nghỉ/đi làm lại (BR-3.02.10; HR gộp vào Admin/Kế toán theo Decision Log #25)<br>• Admin: nhập tay bậc/level NVVH kèm lý do (BR-3.02.11 → P-01)<br>• NV: chỉ xem hồ sơ và lương của mình<br>• TNVH: xem lương hiệu suất của cấp dưới, **không** xem lương cố định (Cluster Rule 07.3)<br>• TPVH: <span style="color:#CC0000">## (spec chưa nêu quyền xem hồ sơ và lương của TPVH)</span><br>• Cổ đông: <span style="color:#CC0000">## (spec chưa nêu)</span> |
| **Management Rule** | • Người dùng quản lý hồ sơ nhân sự: hồ sơ cá nhân, việc làm (đơn vị, chức danh, level có ngày hiệu lực), ngân hàng, cấu phần lương theo level, tài khoản đăng nhập, và xem liên kết tới phân công, hiệu suất, kết quả lương, chi lương<br>• Chức năng chỉ thực hiện được khi người dùng đã đăng nhập với vai trò thuộc Authorization <span style="color:#CC0000">##</span><br>• Mã NV duy nhất, **không tái sử dụng** sau khi nghỉ việc (BR-3.02.1, Cần chốt). Ví dụ `NV-021` <span style="color:#CC0000">(cần xác nhận cách sinh mã)</span><br>• Mỗi NV có đúng một đơn vị chính tại một thời điểm; kiêm nhiệm qua dòng phân công phụ (BR-3.02.2)<br>• Đơn vị, chức danh, level gán có ngày hiệu lực (Cluster Rule 07.1)<br>• Trạng thái nhân sự:<br>&nbsp;&nbsp;◦ Thử việc (PROBATION): vẫn được phân công tòa và tính lương hiệu suất như NV chính thức (BR-3.02.12, Cần chốt)<br>&nbsp;&nbsp;◦ Đang làm (ACTIVE)<br>&nbsp;&nbsp;◦ Nghỉ việc (RESIGNED): không tạo phân công mới sau ngày nghỉ<br>&nbsp;&nbsp;◦ Ngày nghỉ ở tương lai hiển thị `Sắp nghỉ (dd/mm)`<br>&nbsp;&nbsp;◦ Nhân viên quay lại dùng lại hồ sơ cũ với `start_date` mới<br>• Bảng lương cố định theo level `SALARY_LEVEL` (R-19):<br>&nbsp;&nbsp;◦ `level_code` · `position_code`: Level = chức danh + bậc, ví dụ `TPVH`, `TNVH`, `NVVH-1`, `NVVH-2`<br>&nbsp;&nbsp;◦ Lương cơ bản · Ăn trưa · Xăng xe: ba cấu phần cố định của kỳ lương<br>&nbsp;&nbsp;◦ Lương hỗ trợ mặc định: chỉ là **giá trị gợi ý**; số thật nhập tay theo NV × kỳ kèm lý do (BR-3.02.5)<br>&nbsp;&nbsp;◦ Cột đơn giá/phòng: trỏ tới cột trong bảng bậc của Payroll Rule ở FR22 (bậc 1 = 130k, bậc 2 = 120k tại ngưỡng 100)<br>&nbsp;&nbsp;◦ Hiệu lực từ/đến · version<br>• Sửa level luôn **tạo phiên bản mới có ngày hiệu lực**, không sửa đè; kỳ lương đã khóa giữ snapshot (BR-3.02.4)<br>• Lương cố định của kỳ = giá trị level hiệu lực tại ngày chốt kỳ (16); Phase 1 không prorate theo ngày công (BR-3.02.3 → P-06; Cluster Rule 07.2)<br>• Giá trị hiện hành (bảng lương tháng 8): TPVH và TNVH cùng LCB 10.000.000 + ăn trưa 500.000 + xăng xe 700.000, khác nhau ở lương trưởng nhóm = số phòng dưới quyền × 10.000 (refer to FR18); NVVH có LCB 0 + ăn trưa 500.000 + xăng xe 500.000, thu nhập chính đến từ lương hiệu suất<br>• Level NVVH quyết định cột đơn giá/phòng; chưa có tiêu chí lên bậc nên Phase 1 Admin nhập tay kèm lý do (BR-3.02.11 → P-01)<br>• Nghỉ việc:<br>&nbsp;&nbsp;◦ Nhập ngày nghỉ -> tự kết thúc mọi phân công tòa hiệu lực và sinh cảnh báo "tòa chưa có phụ trách chính từ ngày X" cho TPVH (BR-3.02.6, Cần chốt)<br>&nbsp;&nbsp;◦ NV nghỉ giữa kỳ **vẫn có dòng lương** kỳ đó nếu còn là phụ trách chính của ≥ 1 tòa tại snapshot ngày 15; lương cố định tính đủ, không prorate (BR-3.02.7, Cần chốt)<br>&nbsp;&nbsp;◦ Toàn bộ hệ quả dây chuyền phải hiển thị trước khi lưu<br>• Ngân hàng: chỉ một tài khoản mặc định tại một thời điểm; phiếu chi lương snapshot số tài khoản tại thời điểm chi (BR-3.02.8, Cần chốt). Số TK che theo Common Rule 2<br>• Cờ "là cổ đông" chỉ đọc từ module Cổ đông (refer to FR29); phần cổ phần **không** xuất hiện trong bảng lương hay chi phí lương (BR-3.02.9, R-24)<br>• "Số tòa & phòng đang quản lý" là giá trị tính động từ phân công vai trò phụ trách chính hiệu lực hôm nay, không có ô nhập tay (BR-3.02.13)<br>• Quyền xem lương theo Cluster Rule 07.3<br>• Tài khoản đăng nhập: liên kết user, role/permission; không lưu mật khẩu tại hồ sơ (refer to FR33)<br>• NV ngoài khối Vận hành (X-05) chỉ giữ 1 dòng lương cố định nhập tay ở FR22 |
| **Management Impact** | • Xem danh sách/chi tiết, tìm kiếm, lọc và xuất không làm thay đổi dữ liệu<br>• Thêm NV: tạo hồ sơ với mã NV mới; trạng thái khởi tạo <span style="color:#CC0000">## (Thử việc hay Đang làm theo ngày nhập?)</span><br>• Gán/đổi đơn vị, chức danh, level (điều chuyển): tạo dòng mới có ngày hiệu lực, dòng cũ giữ trong lịch sử<br>• Xác nhận hết thử việc: `Thử việc` -> `Đang làm`<br>• Ghi nghỉ việc:<br>&nbsp;&nbsp;◦ Trạng thái -> `Nghỉ việc` từ ngày nghỉ; ngày tương lai hiển thị `Sắp nghỉ (dd/mm)`<br>&nbsp;&nbsp;◦ Kết thúc mọi phân công tòa hiệu lực vào ngày nghỉ (FR20)<br>&nbsp;&nbsp;◦ Sinh cảnh báo Work Queue cho TPVH, mỗi tòa một cảnh báo (FR01)<br>• Đi làm lại: dùng lại hồ sơ cũ, giữ mã NV, ghi `start_date` mới<br>• Tạo phiên bản cấu phần lương: tạo version mới của `SALARY_LEVEL` có ngày hiệu lực; version cũ <span style="color:#CC0000">## (tự đóng vào ngày liền trước?)</span>; kỳ đã khóa giữ snapshot<br>• Thêm/đổi tài khoản ngân hàng: tạo bản ghi mới; bản ghi cũ giữ trong lịch sử<br>• Tạo user: <span style="color:#CC0000">## (refer to FR33)</span><br>• Mọi thao tác ghi audit theo Common Rule 5 |

## 2. Screen 19.1: Danh sách nhân sự

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (mục "Danh sách" UI-19).</span></p>
<p align="center"><b>Screen 19.1: Danh sách nhân sự</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Nhân sự`<br>• Breadcrumb: `Trang chủ / Nhân sự & lương / Nhân sự` |
| 🟧 Quản lý nhân sự | | | |
| Tiêu đề trang | Text | No | • Hiển thị "Nhân sự" kèm chip `{n} nhân sự` = tổng nhân sự trong phạm vi quyền |
| + Nhân sự | Button | No | • Always display. Đây là CTA chính của màn<br>• Enabled only when người dùng là Admin hoặc Kế toán (Common Rule 7)<br>• Click on -> Go to Thêm / sửa nhân sự ở chế độ thêm (Screen 19.3) |
| Xuất | Button | No | • Always display<br>• Always enabled<br>• Click on -> Xuất toàn bộ kết quả đang lọc <span style="color:#CC0000">## (định dạng CSV/XLSX? Cột lương xuất theo Cluster Rule 07.3?)</span> |
| 🟧 Filter section | | | • <span style="color:#CC0000">Spec chưa liệt kê bộ lọc của danh sách nhân sự. Theo BR-3.01.7 cascading filter chuẩn (Khu vực → Trưởng nhóm → Quản lý → Tòa → Loại nhà) dùng lại ở mọi màn — cần xác nhận áp dụng, cùng các bộ lọc Đơn vị, Chức danh, Trạng thái</span><br>• Tiêu chí được áp ngay khi chọn và phản ánh lên URL (Common Rule 6) |
| Search box | Textbox | No | • Placeholder: <span style="color:#CC0000">##</span><br>• Max length: 255 characters<br>• Allow entering all types of characters<br>• Cut off the spaces before and after the keyword before performing search<br>• Nhập từ khóa -> sau 300ms (Common Rule 6) Search for all records which satisfy at least one of the following criteria: <span style="color:#CC0000">## (cần xác nhận; đề xuất Mã NV = keyword (Absolute search), Họ tên contains keyword (Relative search), SĐT = keyword (Absolute search))</span> |
| 🟦 Danh sách nhân sự | | | • Display the list of nhân sự trong phạm vi quyền<br>• Giá trị trống hiển thị `—` (Common Rule 3)<br>• If there are no nhân sự in the system, display error message <span style="color:#CC0000">E##</span><br>• If no record matches the search and filter criteria, display error message <span style="color:#CC0000">E##</span><br>• Default sorting: <span style="color:#CC0000">##</span><br>• Phân trang theo Common Rule 6<br>• Click on một dòng -> Go to Chi tiết nhân sự (Screen 19.2) |
| Mã NV | Text | No | • Mã nhân viên, ví dụ `NV-021` |
| Họ tên | Text | No | • Họ tên nhân viên |
| SĐT/email | Text | No | • Dòng 1: SĐT, che theo Common Rule 2<br>• Dòng 2: email |
| Chức danh | Text | No | • Chức danh hiệu lực hôm nay, ví dụ `NVVH` |
| Level | Text | No | • Level hiệu lực hôm nay, ví dụ `NVVH-1` |
| Đơn vị | Text | No | • Đơn vị chính hiệu lực hôm nay, ví dụ `KV1` |
| Lead | Text | No | • Lead của đơn vị, lấy từ FR18 tại ngày hôm nay |
| Ngày vào | Text | No | • Ngày vào làm. Format: DD/MM/YYYY |
| Trạng thái | Tag | No | • Hiển thị một trong các nhãn (Common Rule 4):<br>&nbsp;&nbsp;◦ Thử việc<br>&nbsp;&nbsp;◦ Đang làm<br>&nbsp;&nbsp;◦ Sắp nghỉ (dd/mm): đã nhập ngày nghỉ ở tương lai<br>&nbsp;&nbsp;◦ Nghỉ việc |
| Số tòa/phòng phụ trách | Text | No | • Content format: "{n} tòa / {m} phòng", ví dụ "9 tòa / 135 phòng"<br>• Tính động từ phân công Phụ trách chính hiệu lực hôm nay (BR-3.02.13) |
| Tài khoản | Text | No | • <span style="color:#CC0000">## (spec ghi "tài khoản" — cần xác nhận là tài khoản ngân hàng mặc định (che theo Common Rule 2) hay user đăng nhập liên kết)</span> |
| Bảng lương kỳ gần nhất | Text | No | • <span style="color:#CC0000">## (cần xác nhận nội dung: kỳ + trạng thái bảng lương, hay số thực nhận — nếu là số tiền thì áp Cluster Rule 07.3)</span><br>• Click on -> <span style="color:#CC0000">## (mở Drawer chi tiết lương Screen 22.2?)</span> |
| Page number | Text | No | • Click on a page number -> Go to the corresponding page |

## 3. Screen 19.2: Chi tiết nhân sự

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — ảnh ImageGen UI-19-employee-profile.png KHÔNG ĐẠT (AUDIT: 9 tòa ghi G1…G9, Lead và Level sai seed; thiếu cấu phần lương ⑥, cảnh báo nghỉ việc ⑦, băng quyền xem ⑧, cờ cổ đông), không dùng. Nội dung dựng từ spec (wireframe UI-19).</span></p>
<p align="center"><b>Screen 19.2: Chi tiết nhân sự</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Nhân sự`<br>• Breadcrumb: `Trang chủ / Nhân sự & lương / Nhân sự / {Mã NV}` |
| Tiêu đề | Text | No | • Hiển thị "{Mã NV} · {Họ tên}", ví dụ "NV-021 · Nguyễn Thị Thương Huyền"<br>• Dòng phụ: "{Chức danh} · Level {Level} · {Đơn vị} · {Trạng thái} từ {ngày} · Là cổ đông ✓", ví dụ "NVVH · Level NVVH-1 · KV1 · Đang làm từ 01/03/2024" |
| Trạng thái | Tag | No | • Trạng thái nhân sự: Thử việc / Đang làm / Sắp nghỉ (dd/mm) / Nghỉ việc (Common Rule 4) |
| Là cổ đông | Tag | No | • Display only when nhân sự là cổ đông<br>• Chỉ đọc, lấy từ module Cổ đông (refer to FR29)<br>• Phần chia cổ tức đi qua FR29, không xuất hiện trong bảng lương hay chi phí lương (BR-3.02.9) |
| Sửa | Button | No | • Display only when trạng thái ≠ Nghỉ việc <span style="color:#CC0000">(cần xác nhận)</span><br>• Enabled only when người dùng là Admin hoặc Kế toán (Common Rule 7)<br>• Click on -> Go to Thêm / sửa nhân sự ở chế độ sửa (Screen 19.3) |
| Điều chuyển | Button | No | • Display only when trạng thái = Thử việc hoặc Đang làm<br>• Enabled only when người dùng là Admin hoặc Kế toán<br>• Click on -> Display Popup điều chuyển (Screen 19.4) |
| ⋯ | Button | No | • Always display<br>• Always enabled<br>• Click on -> Display a dropdown for actions:<br>&nbsp;&nbsp;◦ Xác nhận hết thử việc: Display only when trạng thái = Thử việc. Click on -> <span style="color:#CC0000">Display popup xác nhận (Screen ##)</span><br>&nbsp;&nbsp;◦ Ghi nghỉ việc: Display only when trạng thái = Thử việc hoặc Đang làm. Click on -> Display Popup ghi nghỉ việc (Screen 19.6)<br>&nbsp;&nbsp;◦ Đi làm lại: Display only when trạng thái = Nghỉ việc. Click on -> <span style="color:#CC0000">Display popup nhập `start_date` mới (Screen ##)</span><br>&nbsp;&nbsp;◦ Bổ nhiệm Lead: Display only when `management_level ≥ 1`. Click on -> Go to Cơ cấu tổ chức (Screen 18.1)<br>&nbsp;&nbsp;◦ Tạo user: <span style="color:#CC0000">Click on -> ## (refer to FR33)</span><br>&nbsp;&nbsp;◦ Xuất: <span style="color:#CC0000">Click on -> ## (định dạng?)</span><br>&nbsp;&nbsp;◦ <span style="color:#CC0000">Các action khác trong menu: ## (cần capture dropdown)</span> |
| Tổng quan | Tab | No | • Default tab<br>• Highlight the tab while being selected<br>• Click on -> Go to Tổng quan |
| Phân công | Tab | No | • Highlight the tab while being selected<br>• Click on -> Go to Phân công: danh sách phân công tòa của NV, dữ liệu từ FR20<br>• <span style="color:#CC0000">Cần capture nội dung tab</span> |
| Cấu phần lương | Tab | No | • Highlight the tab while being selected<br>• Click on -> Go to Cấu phần lương: các phiên bản cấu phần theo level<br>• <span style="color:#CC0000">Cần capture nội dung tab</span> |
| Kỳ lương | Tab | No | • Highlight the tab while being selected<br>• Click on -> Go to Kỳ lương: kết quả lương từng kỳ (FR22) và chi lương (FR23)<br>• <span style="color:#CC0000">Cần capture nội dung tab</span> |
| Hồ sơ | Tab | No | • Highlight the tab while being selected<br>• Click on -> Go to Hồ sơ: tài liệu của nhân viên<br>• <span style="color:#CC0000">Cần capture nội dung tab</span> |
| Lịch sử | Tab | No | • Highlight the tab while being selected<br>• Click on -> Go to Lịch sử (audit theo Common Rule 5)<br>• <span style="color:#CC0000">Cần capture nội dung tab</span> |
| 🟧 Tab Tổng quan | | | |
| 🟧 ② Hồ sơ | | | |
| Mã NV | Text | No | • Display mã NV kèm ghi chú "(không tái sử dụng)" (BR-3.02.1) |
| Họ tên | Text | No | • Display họ tên |
| Ngày sinh | Text | No | • Display ngày sinh. Format: DD/MM/YYYY<br>• Có trong field spec, chưa có trên wireframe |
| CCCD | Text | No | • Display số CCCD, che theo Common Rule 2 |
| SĐT | Text | No | • Display SĐT, che theo Common Rule 2 |
| Email | Text | No | • Display email; trống hiển thị `—` |
| Địa chỉ | Text | No | • Display địa chỉ<br>• Có trong field spec, chưa có trên wireframe |
| 🟧 ③ Việc làm | | | • <span style="color:#CC0000">Wireframe vẽ Chức danh và Level dạng Dropdown ngay trên trang; mọi thay đổi cần ngày hiệu lực (Cluster Rule 07.1) — cần xác nhận đổi tại chỗ hay chỉ qua Điều chuyển (Screen 19.4)</span> |
| Ngày vào · thử việc · chính thức · nghỉ | Text | No | • Display các mốc ngày, ví dụ "Vào 01/03/2024 · Chính thức 01/06/2024 · Nghỉ —"<br>• Chưa có ngày nghỉ hiển thị `—` |
| Chức danh | Dropdown | No | • Display chức danh hiệu lực hôm nay, ví dụ `NVVH`<br>• Enabled only when người dùng là Admin hoặc Kế toán<br>• Click on -> Display danh sách chức danh (`POSITION`). Allow single selection only<br>• Select an option -> <span style="color:#CC0000">## (mở Screen 19.4 để nhập ngày hiệu lực?)</span> |
| Level | Dropdown | No | • Display level hiệu lực hôm nay, ví dụ `NVVH-1`<br>• Enabled only when người dùng là Admin (BR-3.02.11)<br>• Click on -> Display danh sách level của chức danh. Allow single selection only<br>• Select an option -> <span style="color:#CC0000">## (bắt buộc lý do; mở Screen 19.4?)</span> |
| Đơn vị | Text | No | • Display đơn vị chính hiệu lực hôm nay, ví dụ `KV1` |
| Lead | Text | No | • Display Lead của đơn vị theo FR18, ví dụ "Trần Quang Huy"; chỉ đọc |
| 🟧 ④ Ngân hàng | | | |
| Tài khoản mặc định | Text | No | • Display "{Ngân hàng} · {Số TK} · {Chủ TK}" và dấu "mặc định ✓"; Số TK che theo Common Rule 2, ví dụ "Techcombank · 1903****21 · mặc định ✓"<br>• Chưa có: <span style="color:#CC0000">##</span> |
| Lịch sử | Button | No | • Always display<br>• Always enabled<br>• <span style="color:#CC0000">Click on -> Display popup lịch sử tài khoản ngân hàng (Screen ##)</span> |
| Thêm/đổi tài khoản | Button | No | • Có trong danh sách action của spec, chưa có trên wireframe<br>• Enabled only when người dùng là Admin hoặc Kế toán<br>• <span style="color:#CC0000">Click on -> Display popup thêm/đổi tài khoản (Screen ##)</span> |
| 🟧 ⑤ Chỉ số | | | |
| Đang quản lý | Text | No | • Content format: "Đang quản lý {n} tòa / {m} phòng", ví dụ "9 tòa / 135 phòng"<br>• Icon ⓘ: Hover -> Display tooltip <span style="color:#CC0000">"##" (nội dung giải thích "tính động")</span><br>• Tính động từ phân công Phụ trách chính hiệu lực hôm nay; không có ô nhập tay (BR-3.02.13) |
| HS tạm tính | Text | No | • Content format: "HS tạm tính kỳ {MM}: {x} %", lấy từ FR21<br>• Hiển thị theo Cluster Rule 07.3<br>• <span style="color:#CC0000">Click on -> ## (mở Hiệu suất thu tiền Screen 21.1 lọc theo NV?)</span> |
| 🟧 ⑥ Cấu phần lương | | | • Tiêu đề khối: "Cấu phần lương — theo Level {Level}, hiệu lực {ngày}", ví dụ "theo Level NVVH-1, hiệu lực 01/01/2026"<br>• Hiển thị theo Cluster Rule 07.3: TNVH không xem các cấu phần cố định<br>• Tiền theo Common Rule 8 |
| Lương cơ bản | Text | No | • Display lương cơ bản của level<br>• NVVH có giá trị 0: luôn kèm ghi chú ⓘ "NVVH thu nhập chính từ hiệu suất" vì nhìn số 0 dễ tưởng nhập thiếu |
| Phụ cấp ăn trưa | Text | No | • Display phụ cấp ăn trưa, ví dụ 500.000 |
| Phụ cấp xăng xe | Text | No | • Display phụ cấp xăng xe, ví dụ 500.000 |
| Lương trưởng nhóm | Text | No | • Display lương trưởng nhóm; chỉ TPVH/TNVH có giá trị, các chức danh khác hiển thị 0 kèm ghi chú "(chỉ TPVH/TNVH)"<br>• Giá trị = số phòng dưới quyền × 10.000 (refer to FR18, P-12) |
| Lương hỗ trợ | Text | No | • Display lương hỗ trợ, ví dụ 2.000.000, kèm ghi chú "nhập tay theo kỳ, BẮT BUỘC lý do" (BR-3.02.5)<br>• <span style="color:#CC0000">Cần xác nhận số hiển thị là "Lương hỗ trợ mặc định" (gợi ý của level) hay số đã nhập cho kỳ hiện tại, và nơi nhập số theo kỳ (Screen 22.1 hay tab Kỳ lương)</span> |
| Cột đơn giá/phòng | Text | No | • Display cột đơn giá/phòng của level, ví dụ "bậc 1 (130k tại ngưỡng 100)"<br>• Chip `Cần xác nhận nghiệp vụ · P-01` (Cluster Rule 07.4) |
| Tạo phiên bản mới có ngày hiệu lực | Button | No | • Always display, kèm ghi chú ⓘ "không sửa đè phiên bản"<br>• Enabled only when người dùng là Admin hoặc Kế toán<br>• Click on -> Display Popup tạo phiên bản cấu phần lương (Screen 19.5) |
| 🟧 ⑦ Cảnh báo khi nghỉ việc | | | • Wireframe đặt khối preview này ngay trên trang chi tiết; tài liệu này mô tả khối trong Popup ghi nghỉ việc (Screen 19.6)<br>• <span style="color:#CC0000">Cần xác nhận: khối ⑦ nằm trên trang (hiện khi nhập ngày nghỉ ở chế độ sửa) hay nằm trong popup</span> |
| 🟧 ⑧ Quyền xem | | | |
| Băng quyền xem | Text | No | • Always display<br>• Content format: "NV xem của mình · TNVH xem lương hiệu suất cấp dưới nhưng KHÔNG xem lương cố định · Admin/Kế toán sửa" (Cluster Rule 07.3) |

## 4. Screen 19.3: Thêm / sửa nhân sự

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (bảng "Field chi tiết" UI-19). Form có từ 3 nhóm field nên dùng dạng trang theo spec §7.3; cần xác nhận có chia wizard không.</span></p>
<p align="center"><b>Screen 19.3: Thêm / sửa nhân sự</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Nhân sự`<br>• Breadcrumb: `Trang chủ / Nhân sự & lương / Nhân sự / Thêm nhân sự` (chế độ sửa: `/ {Mã NV} / Sửa`) |
| Chế độ sửa | | | • Apart from the following points, all logics and processings are similar to those of the creation mode (Screen 19.3)<br>• The default values of all fields are set to those of the latest version<br>• Mã NV chỉ đọc<br>• Chức danh, Level, Đơn vị: <span style="color:#CC0000">## (sửa tại đây hay chỉ qua Điều chuyển Screen 19.4 vì cần ngày hiệu lực?)</span><br>• Ngày nghỉ: nhập qua Popup ghi nghỉ việc (Screen 19.6) |
| Back | Button | No | • Always appear<br>• Always enabled<br>• Click on -> check if there are any changes made to input<br>&nbsp;&nbsp;◦ If there are not -> go back to the previous screen<br>&nbsp;&nbsp;◦ If there are -> display a confirmation popup (Common Rule 9) <span style="color:#CC0000">(Provide screen capture ##) (Screen ##)</span> |
| 🟧 Hồ sơ | | | • <span style="color:#CC0000">Spec chưa nêu field bắt buộc — cột Required? dưới đây cần BA xác nhận</span> |
| Mã NV | Text | No | • Chế độ thêm: hiển thị "Tự sinh khi lưu" <span style="color:#CC0000">(cần xác nhận mã tự sinh hay nhập tay)</span><br>• Mã không tái sử dụng (BR-3.02.1) |
| Họ tên | Textbox | Yes | • Always display<br>• Placeholder: <span style="color:#CC0000">##</span><br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Ngày sinh | Datepicker | No | • Always display<br>• Default selection: None<br>• Disable future dates |
| CCCD | Textbox | No | • Always display<br>• Allow entering numeric values. Max length: 12<br>• Sai độ dài -> Show error message <span style="color:#CC0000">E##</span><br>• Trùng CCCD với nhân sự khác: <span style="color:#CC0000">## (chặn hay cảnh báo?)</span> |
| SĐT | Textbox | No | • Always display<br>• Allow entering numeric values. Max length: <span style="color:#CC0000">##</span> |
| Email | Textbox | No | • Always display. Max length: 255<br>• Sai định dạng -> Show error message <span style="color:#CC0000">E##</span> |
| Địa chỉ | Textbox | No | • Always display. Max length: 255 |
| Tài liệu | File uploader | No | • Instruction text: <span style="color:#CC0000">##</span><br>• Allow dragging and dropping file, as well as uploading from local device<br>• Click on "Upload" -> Display a popup to select file from local device <span style="color:#CC0000">(Screen capture ##)</span><br>• Supported file format: <span style="color:#CC0000">##</span>. If the selected file is in an unsupported format, display error message <span style="color:#CC0000">E##</span><br>• Maximum file size: <span style="color:#CC0000">##</span>. If the file size exceeds the limit, show error message <span style="color:#CC0000">E##</span> |
| 🟧 Việc làm | | | |
| Ngày vào | Datepicker | Yes | • Always display<br>• Default selection: None<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Ngày thử việc | Datepicker | No | • Always display<br>• If a start date is selected, disable all dates before Ngày vào <span style="color:#CC0000">(cần xác nhận quan hệ giữa ngày vào và ngày thử việc)</span> |
| Ngày chính thức | Datepicker | No | • Always display<br>• Disable all dates before Ngày vào |
| Chức danh | Dropdown | Yes | • Always display<br>• Default selection: None<br>• Click on -> Display danh sách chức danh: TPVH, TNVH, TKV, NVVH, KT, VS, KETOAN, TNKD, NVKD, SALE, ADMIN<br>• Allow single selection only<br>• Select an option -> Lọc danh sách Level và Đơn vị theo chức danh (loại đơn vị được gán của `POSITION`)<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Level | Dropdown | Yes | • Always display<br>• Enable only when đã chọn Chức danh<br>• Click on -> Display danh sách level của chức danh, ví dụ NVVH-1, NVVH-2<br>• Allow single selection only<br>• Select an option -> Hiển thị cấu phần lương hiện hành của level (chỉ đọc)<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Đơn vị | Dropdown | Yes | • Always display<br>• Click on -> Display danh sách đơn vị ACTIVE phù hợp chức danh (FR18). Allow single selection only<br>• Mỗi NV đúng một đơn vị chính (BR-3.02.2)<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Lead | Text | No | • Tự hiển thị Lead của đơn vị đã chọn tại ngày vào (FR18); không nhập tay |
| 🟧 Ngân hàng | | | |
| Ngân hàng | Dropdown | No | • Always display<br>• Click on -> Display danh mục ngân hàng <span style="color:#CC0000">(cần nguồn danh mục)</span>. Allow single selection only |
| Số tài khoản | Textbox | No | • Always display<br>• Allow entering numeric values. Max length: <span style="color:#CC0000">##</span><br>• Hiển thị che theo Common Rule 2 sau khi lưu |
| Chủ tài khoản | Textbox | No | • Always display. Max length: 255 |
| 🟧 Tài khoản đăng nhập | | | |
| User liên kết | Dropdown | No | • Always display<br>• <span style="color:#CC0000">## (chọn user có sẵn hay tạo user mới; role/permission cấu hình ở FR33)</span><br>• Không lưu mật khẩu tại hồ sơ |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Giống nút Back |
| Lưu | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ <span style="color:#CC0000">## (validate nghiệp vụ bổ sung)</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> lưu hồ sơ, toast thành công và Go to Chi tiết nhân sự (Screen 19.2) <span style="color:#CC0000">(cần xác nhận màn đích)</span> |

## 5. Screen 19.4: Popup điều chuyển

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (action "gán đơn vị/chức danh/level có ngày hiệu lực, điều chuyển tổ chức" UI-19).</span></p>
<p align="center"><b>Screen 19.4: Popup điều chuyển</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận popup có X icon)</span> | | | |
| Nhân sự | Text | No | • Display "{Mã NV} · {Họ tên}" |
| Hiện tại | Text | No | • Display "{Đơn vị} · {Chức danh} · {Level}" đang hiệu lực |
| Đơn vị mới | Dropdown | Yes | • Always display<br>• Default selection: đơn vị hiện tại<br>• Click on -> Display danh sách đơn vị ACTIVE tại Ngày hiệu lực (FR18). Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Chức danh | Dropdown | Yes | • Always display<br>• Default selection: chức danh hiện tại<br>• Click on -> Display danh sách chức danh. Allow single selection only<br>• Select an option -> Lọc lại danh sách Level |
| Level | Dropdown | Yes | • Always display<br>• Default selection: level hiện tại<br>• Enable only when người dùng là Admin (BR-3.02.11)<br>• Click on -> Display danh sách level của chức danh. Allow single selection only |
| Ngày hiệu lực | Datepicker | Yes | • Always display<br>• Default selection: <span style="color:#CC0000">## (ngày 1 tháng kế?)</span><br>• Ngày rơi vào kỳ lương đã khóa -> Show error message <span style="color:#CC0000">E## (cần xác nhận có chặn như phân công tòa không)</span><br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Lý do | Textbox | No | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• Bắt buộc khi đổi Level (BR-3.02.11); các trường hợp khác <span style="color:#CC0000">## (cần xác nhận)</span><br>• Đổi Level mà để trống -> Show error message <span style="color:#CC0000">E##</span> |
| Ảnh hưởng phân công | Text | No | • Display only when đổi Đơn vị mà NV còn phân công tòa hiệu lực<br>• <span style="color:#CC0000">## (spec chưa mô tả xử lý phân công khi điều chuyển; BR-3.03.4 yêu cầu NV thuộc đơn vị phù hợp vai trò — cần xác nhận cảnh báo hay tự kết thúc phân công)</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không lưu |
| Lưu | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ Không có thay đổi nào so với hiện tại -> display error message <span style="color:#CC0000">E##</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> tạo dòng đơn vị/chức danh/level mới có ngày hiệu lực, đóng popup và cập nhật Screen 19.2 |

## 6. Screen 19.5: Popup tạo phiên bản cấu phần lương

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (vùng ⑥ và bảng SALARY_LEVEL UI-19).</span></p>
<p align="center"><b>Screen 19.5: Popup tạo phiên bản cấu phần lương</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận popup có X icon)</span> | | | |
| Level | Text | No | • Display `level_code` · `position_code`, ví dụ "NVVH-1 · NVVH"<br>• Ghi chú: "Phiên bản mới áp cho mọi nhân sự cùng Level từ ngày hiệu lực" |
| Phiên bản hiện hành | Text | No | • Display version và ngày hiệu lực của phiên bản đang dùng |
| Lương cơ bản | Textbox | Yes | • Always display<br>• Default: giá trị phiên bản hiện hành<br>• Allow entering numeric values (VND, Common Rule 8). Max length: 12<br>• Cho phép 0 (NVVH)<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Phụ cấp ăn trưa | Textbox | Yes | • Always display<br>• Default: giá trị phiên bản hiện hành<br>• Allow entering numeric values (VND). Max length: 12<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Phụ cấp xăng xe | Textbox | Yes | • Always display<br>• Default: giá trị phiên bản hiện hành<br>• Allow entering numeric values (VND). Max length: 12<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Lương hỗ trợ mặc định | Textbox | No | • Always display, kèm ghi chú "Chỉ là giá trị gợi ý; số thật nhập tay theo NV × kỳ kèm lý do"<br>• Allow entering numeric values (VND). Max length: 12 |
| Cột đơn giá/phòng | Dropdown | Yes | • Display only when chức danh = NVVH (Level NVVH quyết định cột đơn giá/phòng, BR-3.02.11)<br>• Default selection: cột của phiên bản hiện hành<br>• Click on -> Display danh sách cột trong bảng bậc của Payroll Rule (FR22), ví dụ "bậc 1 (130k tại ngưỡng 100)", "bậc 2 (120k tại ngưỡng 100)"<br>• Allow single selection only<br>• Chip `Cần xác nhận nghiệp vụ · P-01` |
| Hiệu lực từ | Datepicker | Yes | • Always display<br>• Default selection: None<br>• Kỳ lương dùng giá trị hiệu lực tại ngày chốt 16 (Cluster Rule 07.2). Ví dụ: ăn trưa 600.000 hiệu lực 01/10/2026 thì kỳ 09 vẫn 500.000, kỳ 10 là 600.000<br>• Ngày hiệu lực rơi vào kỳ lương đã khóa: <span style="color:#CC0000">## (chặn hay cho phép vì kỳ khóa đã giữ snapshot?)</span><br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không lưu |
| Tạo phiên bản | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ Trùng ngày hiệu lực với phiên bản khác -> display error message <span style="color:#CC0000">E##</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> tạo phiên bản mới, không sửa đè phiên bản cũ; đóng popup và cập nhật khối ⑥ ở Screen 19.2 |

## 7. Screen 19.6: Popup ghi nghỉ việc

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (vùng ⑦ "Cảnh báo khi nghỉ việc" UI-19).</span></p>
<p align="center"><b>Screen 19.6: Popup ghi nghỉ việc</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận popup có X icon)</span> | | | |
| Ngày nghỉ | Datepicker | Yes | • Always display<br>• Default selection: None<br>• Click on -> Display a datepicker; cho phép ngày tương lai (trạng thái hiển thị `Sắp nghỉ (dd/mm)`)<br>• Select a date -> Hiển thị khối preview ⑦ bên dưới<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| 🟧 ⑦ Cảnh báo khi nghỉ việc (preview trước khi lưu) | | | • Display only when đã chọn Ngày nghỉ<br>• Hiện **toàn bộ hệ quả dây chuyền trước khi lưu** vì đây là thao tác ảnh hưởng nhiều module nhất trong khối nhân sự |
| Preview hệ quả | Text | No | • Content format: "Nhập ngày nghỉ {DD/MM/YYYY} sẽ:" và các dòng:<br>&nbsp;&nbsp;◦ "kết thúc {n} phân công tòa vào {ngày nghỉ}"<br>&nbsp;&nbsp;◦ "sinh {n} cảnh báo "tòa chưa có phụ trách chính từ {ngày nghỉ + 1}"" (BR-3.02.6)<br>&nbsp;&nbsp;◦ "kỳ lương {MM/YYYY} VẪN tính đủ (còn phụ trách tại ngày 15)" (BR-3.02.7)<br>• Ví dụ spec: ngày nghỉ 31/10/2026, 9 phân công, 9 cảnh báo từ 01/11, kỳ 10/2026 vẫn tính đủ<br>• Ngày nghỉ trước ngày 15 của kỳ: <span style="color:#CC0000">## (nội dung dòng kỳ lương khi NV không còn phụ trách tại ngày 15 — cần xác nhận)</span> |
| Đề xuất chuyển {n} tòa cho người khác ▸ | Button | No | • Display only when NV còn ít nhất 1 phân công Phụ trách chính hiệu lực<br>• Enabled only when người dùng có quyền phân công (FR20)<br>• Click on -> Go to Điều chuyển hàng loạt với các tòa của NV đã điền sẵn (Screen 20.3) <span style="color:#CC0000">(cần xác nhận dữ liệu ngày nghỉ có được giữ khi rời popup)</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không lưu |
| Xác nhận nghỉ việc | Button | No | • Always appear<br>• Enabled only when đã chọn Ngày nghỉ<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ Ngày nghỉ trước Ngày vào -> display error message <span style="color:#CC0000">E##</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> lưu ngày nghỉ, kết thúc phân công, sinh cảnh báo, đóng popup và cập nhật Screen 19.2 |

## 8. User Steps

| | |
|:-:|---|
| **Pre-condition** | Người dùng đã đăng nhập với vai trò Admin hoặc Kế toán |
| **User steps** | **Step 1:** Click menu `Nhân sự` -> display Danh sách nhân sự (Screen 19.1)<br>**Step 2:** Click một dòng -> display Chi tiết nhân sự (Screen 19.2)<br>**Step 3:** Tại khối ⑥, click `Tạo phiên bản mới có ngày hiệu lực` -> display Popup tạo phiên bản cấu phần lương (Screen 19.5)<br>**Step 4:** Click `Điều chuyển` -> display Popup điều chuyển (Screen 19.4) |

| | |
|:-:|---|
| **Pre-condition** | Người dùng đã đăng nhập với vai trò Admin hoặc Kế toán |
| **User steps** | **Step 1:** Tại Screen 19.1, click `+ Nhân sự` -> display Thêm / sửa nhân sự (Screen 19.3)<br>**Step 2:** Nhập đủ thông tin, click `Lưu` -> display Chi tiết nhân sự vừa tạo (Screen 19.2) <span style="color:#CC0000">(màn đích cần xác nhận)</span> |

| | |
|:-:|---|
| **Pre-condition** | Nhân sự đang là phụ trách chính của ít nhất 1 tòa và sắp nghỉ việc |
| **User steps** | **Step 1:** Tại Screen 19.2, click `⋯` → `Ghi nghỉ việc` -> display Popup ghi nghỉ việc (Screen 19.6)<br>**Step 2:** Chọn ngày nghỉ, xem preview ⑦ rồi click `Đề xuất chuyển {n} tòa cho người khác ▸` -> display Điều chuyển hàng loạt (Screen 20.3)<br>**Step 3:** Quay lại Screen 19.6, click `Xác nhận nghỉ việc` -> display Chi tiết nhân sự với trạng thái `Sắp nghỉ (dd/mm)` hoặc `Nghỉ việc` (Screen 19.2) |

---
---

# FR20 - Phân công tòa nhà

## 1. Business Rule

| | |
|:-:|---|
| **Authorization** | • Tạo phân công, đổi quản lý, điều chuyển hàng loạt, gửi duyệt: <span style="color:#CC0000">## (spec chưa nêu vai trò được tạo; §4 ghi Kế toán không thay assignment vận hành nếu không có quyền riêng)</span><br>• Duyệt: người có quyền duyệt, người tạo ≠ người duyệt; Admin duyệt khi nhân sự là Lead hoặc chuyển giữa hai nhóm (BR-3.03.7, Cần chốt)<br>• Phân công lùi ngày: cần Admin duyệt (BR-3.03.14)<br>• Xem: <span style="color:#CC0000">## (spec chưa nêu vai trò được xem màn này)</span> |
| **Assignment Rule** | • Người dùng tạo, thay đổi, duyệt và kết thúc phân công nhân sự theo tòa. `BUILDING_ASSIGNMENT` là nguồn duy nhất xác định phạm vi tòa của người dùng (spec §4)<br>• Chức năng chỉ thực hiện được khi người dùng đã đăng nhập với vai trò thuộc Authorization <span style="color:#CC0000">##</span><br>• Vai trò phân công:<br>&nbsp;&nbsp;◦ Phụ trách chính: người quản lý tòa; là người hưởng hiệu suất và lương hiệu suất của tòa<br>&nbsp;&nbsp;◦ Phối hợp, Kỹ thuật, Vệ sinh: nhiều người trên cùng tòa, không bắt buộc có, **không** tham gia tính lương hiệu suất Phase 1 (BR-3.03.2)<br>• Mỗi tòa có **đúng một** phụ trách chính hiệu lực mọi ngày trong thời gian vận hành: không chồng ngày, **không hở ngày**. Tạo dòng chồng ngày -> tự kết thúc dòng cũ vào `from − 1` và yêu cầu xác nhận (BR-3.03.1)<br>• Cột "Quản lý" ở sổ tòa, hóa đơn, thu tiền, công nợ, báo cáo và cascading filter **đọc** từ màn này theo ngày dữ liệu; không màn nào có ô nhập tay tên quản lý (BR-3.03.3, R-33)<br>• NV được phân công phải Đang làm/Thử việc suốt khoảng hiệu lực và thuộc đơn vị phù hợp vai trò (BR-3.03.4, Cần chốt)<br>• Ngày hiệu lực mặc định là ngày 1 tháng kế. Đổi giữa tháng thì hiệu suất và lương HS cả tháng thuộc về người là phụ trách chính tại ngày 15, không chia theo ngày (BR-3.03.5, R-23 → P-21; Cluster Rule 07.2)<br>• Chặn tạo/sửa phân công có ngày hiệu lực rơi vào **kỳ lương đã khóa**; muốn sửa phải mở khóa kỳ lương (refer to FR22) (BR-3.03.6, Cần chốt)<br>• Đổi quản lý là **giao dịch nguyên tử**: kết thúc người cũ và tạo người mới cùng lý do, cùng thời điểm; lỗi một bước -> rollback cả hai (BR-3.03.8)<br>• Điều chuyển hàng loạt tạo n cặp kết thúc/tạo mới cùng ngày hiệu lực, **một lần duyệt**; từng dòng vẫn từ chối riêng được (BR-3.03.9)<br>• `Hủy` chỉ cho dòng đã duyệt **chưa đến** ngày hiệu lực; dòng đang hiệu lực chỉ được `Kết thúc` kèm lý do (BR-3.03.10)<br>• Tòa đang vận hành mà không có phụ trách chính -> Work Queue cảnh báo TPVH (refer to FR01); bảng lương kỳ đó bỏ tòa khỏi mọi NV và ghi cảnh báo "tòa không có người hưởng HS" (BR-3.03.12, Cần chốt)<br>• Thay đổi hiệu lực tương lai không ảnh hưởng dashboard, quyền, hiệu suất tạm tính trước ngày hiệu lực (BR-3.03.13; Cluster Rule 07.1)<br>• Phân công **lùi ngày** chỉ được phép trong kỳ lương chưa khóa và cần Admin duyệt; hiệu suất tạm tính được tính lại (BR-3.03.14, Cần chốt)<br>• Validation: mỗi tòa chỉ một Phụ trách chính tại một thời điểm; nhân sự còn làm việc; scope đơn vị phù hợp; ngày không chồng; mọi thay đổi phải có lý do (đổi phân công thuộc nhóm action bắt buộc confirm + lý do, Common Rule 12)<br>• Trạng thái phân công:<br>&nbsp;&nbsp;◦ Draft: vừa tạo, chưa gửi duyệt<br>&nbsp;&nbsp;◦ Chờ duyệt: đã gửi, chờ người duyệt<br>&nbsp;&nbsp;◦ Đã duyệt: đã duyệt, chưa đến ngày hiệu lực; được Hủy<br>&nbsp;&nbsp;◦ Đang hiệu lực: job kích hoạt khi đến ngày hiệu lực (F-08); chỉ được Kết thúc<br>&nbsp;&nbsp;◦ Hết hiệu lực: đã qua ngày kết thúc<br>&nbsp;&nbsp;◦ Từ chối / Đã hủy<br>• Dữ liệu kỳ Locked không đổi khi phân công hiện tại thay đổi; payroll dùng snapshot ngày 15 (F-08) |
| **Assignment Impact** | • Xem, lọc, đổi `Xem tại ngày` và xuất không làm thay đổi dữ liệu<br>• Tạo phân công: tạo `BUILDING_ASSIGNMENT` trạng thái `Draft`; gửi duyệt -> `Chờ duyệt`<br>• Đổi quản lý / điều chuyển hàng loạt: tạo đồng thời cặp (kết thúc người cũ tại `from − 1`, tạo người mới từ `from`) cùng lý do, ở trạng thái `Chờ duyệt`<br>• Duyệt: `Chờ duyệt` -> `Đã duyệt`; khi duyệt Phụ trách chính mới, hệ thống kết thúc người cũ tại effective date − 1<br>• Đến ngày hiệu lực: job chuyển `Đã duyệt` -> `Đang hiệu lực`; dashboard và scope dùng phân công theo ngày<br>• Trả sửa: <span style="color:#CC0000">## (trạng thái đích sau Trả sửa — Draft?)</span>; lưu lý do<br>• Từ chối: -> `Từ chối`, lưu lý do<br>• Hủy: `Đã duyệt` (chưa hiệu lực) -> `Đã hủy`, lưu lý do<br>• Kết thúc: `Đang hiệu lực` -> `Hết hiệu lực` tại ngày kết thúc, lưu lý do<br>• Duyệt phân công lùi ngày: hiệu suất tạm tính của kỳ chưa khóa được tính lại (FR21)<br>• Nghỉ việc ở FR19 tự kết thúc mọi phân công hiệu lực của NV<br>• Mọi thao tác ghi audit theo Common Rule 5 |

## 2. Screen 20.1: Phân công tòa nhà

<p align="center"><img src="ui-imagegen-v1/07-nhan-su-luong/UI-20-building-assignments.png" width="560"></p>
<p align="center"><b>Screen 20.1: Phân công tòa nhà</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Phân công tòa`<br>• Breadcrumb: `Trang chủ / Nhân sự & lương / Phân công tòa`<br>• <span style="color:#CC0000">Capture lệch spec: sidebar nhóm "VẬN HÀNH" với các mục không có trong §6.2 (Lịch bảo trì, Yêu cầu dịch vụ…), breadcrumb "Quản lý cho thuê / Vận hành / Phân công tòa nhà", topbar có nút primary "+ Tạo mới" và thiếu bộ chọn Kỳ; mô tả theo spec</span> |
| Back | Button | No | • <span style="color:#CC0000">Capture có nút ← cạnh tiêu đề, wireframe không có — cần xác nhận có giữ không</span> |
| 🟧 Quản lý phân công | | | |
| Tiêu đề trang | Text | No | • Hiển thị "Phân công tòa nhà"<br>• Dòng phụ: "Quản lý phân công nhân sự theo tòa nhà" |
| + Phân công | Button | No | • Always display. Đây là CTA chính của màn<br>• Enabled only when người dùng có quyền tạo phân công (Common Rule 7)<br>• Click on -> Display Popup tạo phân công (Screen 20.2) |
| Điều chuyển hàng loạt | Button | No | • Always display<br>• Enabled only when người dùng có quyền tạo phân công<br>• Click on -> Go to Điều chuyển hàng loạt (Screen 20.3) |
| Xuất | Button | No | • Always display<br>• Always enabled<br>• Click on -> Xuất toàn bộ kết quả đang lọc <span style="color:#CC0000">## (định dạng CSV/XLSX?)</span> |
| Hiện tại | Tab | No | • Default tab<br>• Highlight the tab while being selected<br>• Click on -> Hiển thị phân công hiệu lực tại ngày ở `Xem tại ngày`<br>• <span style="color:#CC0000">Wireframe và capture đặt cả dòng "Sắp tới" (T24) và dòng "THIẾU" (G9) trong tab Hiện tại — cần xác nhận tập dòng của tab</span> |
| Sắp tới | Tab | No | • Highlight the tab while being selected<br>• Click on -> Hiển thị phân công đã duyệt có ngày hiệu lực sau ngày xem |
| Chờ duyệt | Tab | No | • Highlight the tab while being selected<br>• Click on -> Hiển thị phân công ở trạng thái Chờ duyệt |
| Lịch sử | Tab | No | • Highlight the tab while being selected<br>• Click on -> Hiển thị phân công Hết hiệu lực, Từ chối, Đã hủy <span style="color:#CC0000">(cần xác nhận)</span> |
| △ Thiếu phụ trách chính (n) | Tab | No | • Hiển thị icon △, chữ đỏ và badge đếm số tòa đang vận hành không có phụ trách chính tại ngày xem, ví dụ "Thiếu phụ trách chính (2)"<br>• Highlight the tab while being selected<br>• Click on -> Hiển thị danh sách tòa thiếu phụ trách chính<br>• Tòa thiếu phụ trách chính sẽ bị loại khỏi bảng lương kỳ đó kèm cảnh báo (BR-3.03.12) |
| 🟧 Filter section | | | • Bộ lọc luôn hiển thị, không có icon đóng/mở<br>• Tiêu chí được áp ngay khi chọn và phản ánh lên URL (Common Rule 6)<br>• Chọn cấp trên thu hẹp danh sách cấp dưới theo cascading filter chuẩn (BR-3.01.7) |
| Đơn vị | Dropdown | No | • Placeholder: "Tất cả đơn vị"<br>• Default selection: None<br>• Click on -> Display the list of options: Tất cả đơn vị + các đơn vị trong cây tổ chức (FR18)<br>• Allow single selection only. Selecting an option automatically deselects the previous selection<br>• Select an option -> Search for all records with Đơn vị = selected option |
| Nhân sự | Dropdown | No | • Placeholder: "Tất cả nhân sự"<br>• Default selection: None<br>• Click on -> Display the list of options: Tất cả nhân sự + nhân sự thuộc đơn vị đã chọn<br>• Allow single selection only<br>• Select an option -> Search for all records with Nhân sự = selected option |
| Tòa | Dropdown | No | • Placeholder: "Tất cả tòa"<br>• Default selection: None<br>• Click on -> Display the list of options: Tất cả tòa + các tòa trong phạm vi quyền<br>• Allow single selection only<br>• Select an option -> Search for all records with Tòa = selected option |
| Vai trò | Dropdown | No | • Placeholder: "Tất cả vai trò"<br>• Default selection: None<br>• Click on -> Display the list of options: Tất cả vai trò, Phụ trách chính, Phối hợp, Kỹ thuật, Vệ sinh<br>• Allow single selection only<br>• Select an option -> Search for all records with Vai trò = selected option |
| Xem tại ngày | Datepicker | No | • Default selection: ngày hôm nay, ví dụ `23/09/2026`<br>• Date format: DD/MM/YYYY<br>• Click on -> Display a datepicker; cho phép ngày quá khứ và tương lai<br>• Select a date -> Hiển thị tập phân công hiệu lực tại ngày đã chọn (Cluster Rule 07.1) |
| 🟦 Bảng phân công | | | • Display the list of phân công theo tab và bộ lọc đang chọn<br>• Giá trị trống hiển thị `—` (Common Rule 3)<br>• If there are no phân công in the system, display error message <span style="color:#CC0000">E##</span><br>• If no record matches the search and filter criteria, display error message <span style="color:#CC0000">E##</span><br>• Default sorting: <span style="color:#CC0000">## (capture nhóm theo tòa — cần xác nhận khóa sắp xếp và cột sortable)</span><br>• Phân trang theo Common Rule 6<br>• Click on một dòng -> <span style="color:#CC0000">## (mở chi tiết phân công hay không có hành động?)</span><br>• <span style="color:#CC0000">Capture thiếu các cột spec yêu cầu: Nguồn/yêu cầu, Lý do, Người tạo/duyệt; mô tả theo spec</span> |
| Tòa | Text | No | • Mã tòa, ví dụ `T42` |
| Nhân sự | Text | No | • Tên nhân sự được phân công; dòng thiếu phụ trách chính hiển thị `—`<br>• <span style="color:#CC0000">Mâu thuẫn spec: wireframe/capture ghi T42 · Huyền là Phụ trách chính, trong khi UI-04 (spec 1.7, theo Seed §8, §9.3) ghi quản lý T42 là Khải — cần thống nhất dữ liệu mẫu</span> |
| Vai trò | Text | No | • Một trong: Phụ trách chính, Phối hợp, Kỹ thuật, Vệ sinh |
| Đơn vị | Text | No | • Đơn vị của nhân sự, ví dụ `KV1`, `Tổ KT`, `Tổ VS` |
| Từ ngày | Text | No | • Ngày bắt đầu hiệu lực. Format: DD/MM/YYYY |
| Đến ngày | Text | No | • Ngày kết thúc; trống hiển thị `—` nghĩa là còn hiệu lực |
| Trạng thái | Tag | No | • Hiển thị icon và chữ (Common Rule 4):<br>&nbsp;&nbsp;◦ ● Đang hiệu lực<br>&nbsp;&nbsp;◦ ○ Sắp tới: đã duyệt, chưa đến ngày hiệu lực<br>&nbsp;&nbsp;◦ △ THIẾU: tòa đang vận hành không có phụ trách chính tại ngày xem; dòng này không phải bản ghi phân công<br>&nbsp;&nbsp;◦ Draft, Chờ duyệt, Hết hiệu lực, Từ chối, Đã hủy theo Business Rule<br>• <span style="color:#CC0000">"Sắp tới" và "THIẾU" là nhãn hiển thị, không nằm trong state machine của spec — cần xác nhận cách map</span> |
| Nguồn/yêu cầu | Text | No | • Nguồn tạo phân công hoặc mã yêu cầu <span style="color:#CC0000">(capture chưa có cột; cần xác nhận nội dung)</span> |
| Lý do | Text | No | • Lý do tạo/thay đổi phân công <span style="color:#CC0000">(capture chưa có cột)</span> |
| Người tạo / duyệt | Text | No | • Người tạo và người duyệt <span style="color:#CC0000">(capture chưa có cột)</span> |
| ⋯ | Icon | No | • Click on -> Display a dropdown for actions theo trạng thái dòng (action nhanh không kích hoạt click dòng, Common Rule 6):<br>&nbsp;&nbsp;◦ Gửi duyệt: Display only when Draft. Click on -> confirm nhẹ kèm checklist lỗi còn lại (Common Rule 11)<br>&nbsp;&nbsp;◦ Duyệt / Trả sửa / Từ chối: Display only when Chờ duyệt và người dùng có quyền duyệt, khác người tạo. Click on -> Display Popup duyệt phân công (Screen 20.4)<br>&nbsp;&nbsp;◦ Đổi quản lý: Display only when dòng Phụ trách chính Đang hiệu lực. Click on -> Hiển thị khối ③ với tòa của dòng đã điền sẵn<br>&nbsp;&nbsp;◦ Hủy: Display only when Đã duyệt và chưa đến ngày hiệu lực. Click on -> Display Popup kết thúc / hủy phân công (Screen 20.5)<br>&nbsp;&nbsp;◦ Kết thúc: Display only when Đang hiệu lực. Click on -> Display Popup kết thúc / hủy phân công (Screen 20.5)<br>&nbsp;&nbsp;◦ Phân công: Display only when dòng THIẾU. Click on -> Display Popup tạo phân công với tòa đã điền sẵn (Screen 20.2)<br>• <span style="color:#CC0000">Capture chỉ có icon ⋯, chưa có nội dung dropdown — cần capture để xác nhận danh sách action</span> |
| Page number | Text | No | • Click on a page number -> Go to the corresponding page |
| 🟧 ③ Đổi quản lý — preview giao dịch nguyên tử | | | • Display only when <span style="color:#CC0000">## (spec và capture chưa nêu cách mở khối: từ ⋯ → Đổi quản lý của dòng Phụ trách chính, hay luôn hiển thị?)</span><br>• Đổi quản lý là một giao dịch nguyên tử; UI phải cho thấy cả hai vế trước khi xác nhận |
| Tòa | Text | No | • Display tòa đang đổi quản lý, chỉ đọc, ví dụ `T24` |
| Nhân sự mới | Dropdown | Yes | • <span style="color:#CC0000">Wireframe và capture không có field chọn người mới dù preview ghi "Tạo mới: Linh" — cần bổ sung</span><br>• Click on -> Display danh sách nhân sự Đang làm/Thử việc thuộc đơn vị phù hợp vai trò (BR-3.03.4). Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Ngày hiệu lực | Datepicker | Yes | • Always display<br>• Default selection: ngày 1 tháng kế, ví dụ `01/10/2026` (BR-3.03.5)<br>• Date format: DD/MM/YYYY<br>• Ngày rơi vào kỳ lương đã khóa -> Show error message <span style="color:#CC0000">E##</span> (BR-3.03.6)<br>• Ngày trong quá khứ (lùi ngày): chỉ cho phép trong kỳ lương chưa khóa; gắn cờ cần Admin duyệt (BR-3.03.14)<br>• Select a date -> Cập nhật preview giao dịch và cảnh báo ④ |
| Lý do | Textbox | Yes | • Always display. Nhãn "Lý do (bắt buộc)"<br>• Placeholder: "Nhập lý do đổi quản lý..."<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Preview giao dịch | Text | No | • Content format: "SẼ THỰC HIỆN ĐỒNG THỜI 2 THAO TÁC:" và hai dòng có dấu ✓:<br>&nbsp;&nbsp;◦ "Kết thúc: {Người cũ} · Phụ trách chính {Tòa} · đến {Ngày hiệu lực − 1}"<br>&nbsp;&nbsp;◦ "Tạo mới: {Người mới} · Phụ trách chính {Tòa} · từ {Ngày hiệu lực}"<br>• Dòng chú thích: "Lỗi một bước → rollback cả hai" (BR-3.03.8)<br>• <span style="color:#CC0000">Mâu thuẫn spec ↔ seed: ví dụ "Khải → Linh" ở T24, nhưng Seed §9.3 xếp T24 cho Huyền (AUDIT §4 mục 3) — cần đổi ví dụ sang một tòa của Khải</span> |
| ④ Ảnh hưởng lương | Text | No | • Always display trong khối ③; bắt buộc hiển thị trước khi gửi duyệt<br>• Hiển thị icon △ trên nền cảnh báo<br>• Content format: "Ảnh hưởng lương: đổi ngày {dd/mm} nên NGƯỜI PHỤ TRÁCH TẠI NGÀY 15 của kỳ {MM} là {Người mới} → toàn bộ hiệu suất tòa {Tòa} kỳ {MM} tính cho {Người mới}, KHÔNG chia theo ngày" (Cluster Rule 07.2)<br>• Ngày hiệu lực sau ngày 15 của tháng: <span style="color:#CC0000">## (nội dung khi người phụ trách tại ngày 15 vẫn là người cũ)</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng khối ③, không lưu <span style="color:#CC0000">(có thay đổi thì hỏi xác nhận theo Common Rule 9?)</span> |
| Gửi duyệt | Button | No | • Always appear<br>• Enabled only when đã chọn Nhân sự mới, Ngày hiệu lực và nhập Lý do<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ Nhân sự mới không Đang làm/Thử việc suốt khoảng hiệu lực hoặc không thuộc đơn vị phù hợp -> display error message <span style="color:#CC0000">E##</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> confirm nhẹ kèm checklist (Common Rule 11), tạo cặp kết thúc/tạo mới ở trạng thái Chờ duyệt, toast thành công |
| 🟧 ⑤ Quy tắc hiển thị ngay trên màn | | | |
| Băng quy tắc | Text | No | • Always display<br>• Content format:<br>&nbsp;&nbsp;◦ "Mỗi tòa đúng 1 phụ trách chính, không chồng ngày và KHÔNG HỞ NGÀY"<br>&nbsp;&nbsp;◦ "Phối hợp/Kỹ thuật/Vệ sinh: nhiều người, không tính lương hiệu suất"<br>&nbsp;&nbsp;◦ "Không tạo/sửa phân công rơi vào kỳ lương ĐÃ KHÓA" |

## 3. Screen 20.2: Popup tạo phân công

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (cột/field và validation UI-20).</span></p>
<p align="center"><b>Screen 20.2: Popup tạo phân công</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận popup có X icon, modal hay drawer)</span> | | | |
| Tòa | Dropdown | Yes | • Always display<br>• Default selection: None; mở từ dòng THIẾU thì điền sẵn tòa đó<br>• Click on -> Display danh sách tòa trong phạm vi quyền. Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Vai trò | Dropdown | Yes | • Always display<br>• Default selection: <span style="color:#CC0000">##</span><br>• Click on -> Display the list of following options:<br>&nbsp;&nbsp;◦ Phụ trách chính: quản lý tòa, hưởng hiệu suất; mỗi tòa đúng một người. Select this option -> kiểm tra chồng ngày và hiển thị cảnh báo lương<br>&nbsp;&nbsp;◦ Phối hợp: nhiều người, không tính lương HS. Select this option -> ẩn cảnh báo lương<br>&nbsp;&nbsp;◦ Kỹ thuật: nhiều người, không tính lương HS. Select this option -> ẩn cảnh báo lương<br>&nbsp;&nbsp;◦ Vệ sinh: nhiều người, không tính lương HS. Select this option -> ẩn cảnh báo lương<br>• Allow single selection only |
| Nhân sự | Dropdown | Yes | • Always display<br>• Click on -> Display danh sách nhân sự Đang làm/Thử việc thuộc đơn vị phù hợp vai trò (BR-3.03.4). Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Đơn vị | Text | No | • Tự hiển thị đơn vị chính của nhân sự tại Từ ngày <span style="color:#CC0000">(cần xác nhận tự điền hay chọn)</span> |
| Từ ngày | Datepicker | Yes | • Always display<br>• Default selection: ngày 1 tháng kế (BR-3.03.5)<br>• Ngày rơi vào kỳ lương đã khóa -> Show error message <span style="color:#CC0000">E##</span><br>• Ngày trong quá khứ: chỉ trong kỳ lương chưa khóa, cần Admin duyệt (BR-3.03.14)<br>• If an end date is selected, disable all dates after the specified end date |
| Đến ngày | Datepicker | No | • Always display<br>• Default selection: None (không thời hạn)<br>• If a start date is selected, disable all dates before the specified start date<br>• Sau ngày nghỉ của nhân sự -> Show error message <span style="color:#CC0000">E##</span> |
| Nguồn/yêu cầu | Textbox | No | • Always display. Max length: 255<br>• <span style="color:#CC0000">Cần xác nhận ý nghĩa field</span> |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Cảnh báo chồng ngày | Text | No | • Display only when Vai trò = Phụ trách chính và tòa đã có phụ trách chính trùng khoảng<br>• Content format: "Sẽ kết thúc {Người cũ} · Phụ trách chính {Tòa} · đến {Từ ngày − 1}" (BR-3.03.1)<br>• Yêu cầu người dùng xác nhận trước khi lưu |
| Cảnh báo lương | Text | No | • Display only when Vai trò = Phụ trách chính<br>• Nội dung như khối ④ ở Screen 20.1 |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không lưu |
| Lưu nháp | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Lưu phân công ở trạng thái Draft <span style="color:#CC0000">(cần xác nhận có nút này hay chỉ Gửi duyệt)</span> |
| Gửi duyệt | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ Chồng ngày với phụ trách chính khác mà chưa xác nhận -> yêu cầu xác nhận kết thúc dòng cũ<br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> confirm nhẹ (Common Rule 11), lưu ở trạng thái Chờ duyệt, đóng popup và cập nhật Screen 20.1 |

## 4. Screen 20.3: Điều chuyển hàng loạt

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (BR-3.03.9). Cần xác nhận dạng trang hay popup.</span></p>
<p align="center"><b>Screen 20.3: Điều chuyển hàng loạt</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Phân công tòa`<br>• Breadcrumb: `Trang chủ / Nhân sự & lương / Phân công tòa / Điều chuyển hàng loạt` |
| Back | Button | No | • Always appear<br>• Always enabled<br>• Click on -> check if there are any changes made to input<br>&nbsp;&nbsp;◦ If there are not -> go back to the previous screen<br>&nbsp;&nbsp;◦ If there are -> display a confirmation popup (Common Rule 9) <span style="color:#CC0000">(Provide screen capture ##) (Screen ##)</span> |
| Ngày hiệu lực | Datepicker | Yes | • Always display<br>• Default selection: ngày 1 tháng kế<br>• Áp chung cho mọi cặp trong đợt (BR-3.03.9)<br>• Ngày rơi vào kỳ lương đã khóa -> Show error message <span style="color:#CC0000">E##</span><br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• Áp chung cho mọi cặp <span style="color:#CC0000">(cần xác nhận có cho lý do riêng từng dòng)</span><br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| 🟦 Bảng cặp điều chuyển | | | • Default: 1 row without data entered; mở từ Screen 19.6 thì điền sẵn các tòa của nhân sự sắp nghỉ<br>• Mỗi dòng là một cặp kết thúc người cũ / tạo người mới cho vai trò Phụ trách chính |
| Tòa | Dropdown | Yes | • Click on -> Display danh sách tòa trong phạm vi quyền. Allow single selection only<br>• Tòa đã có trong dòng khác -> Show error message <span style="color:#CC0000">E##</span> |
| Người hiện tại | Text | No | • Tự hiển thị phụ trách chính của tòa tại ngày liền trước Ngày hiệu lực; không có hiển thị `—` |
| Người mới | Dropdown | Yes | • Click on -> Display danh sách nhân sự Đang làm/Thử việc thuộc đơn vị phù hợp. Allow single selection only<br>• Trùng Người hiện tại -> Show error message <span style="color:#CC0000">E##</span> |
| Ảnh hưởng lương | Text | No | • Nội dung như khối ④ ở Screen 20.1, theo từng tòa |
| Xóa dòng | Icon | No | • Always display<br>• Click on -> Xóa dòng khỏi bảng |
| Thêm dòng | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Add a new row without data entered at the bottom of the table |
| Tổng hợp | Text | No | • Content format: "Sẽ thực hiện {n} cặp kết thúc/tạo mới cùng ngày {Ngày hiệu lực} · một lần duyệt" |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Giống nút Back |
| Gửi duyệt | Button | No | • Always appear<br>• Enabled only when có ít nhất 1 dòng hợp lệ<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ <span style="color:#CC0000">## (validate bổ sung)</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> confirm nhẹ (Common Rule 11), tạo n cặp ở trạng thái Chờ duyệt trong một lần duyệt và Go to Phân công tòa nhà, tab Chờ duyệt (Screen 20.1) |

## 5. Screen 20.4: Popup duyệt phân công

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (action duyệt/trả sửa/từ chối UI-20 và Common Rule 11).</span></p>
<p align="center"><b>Screen 20.4: Popup duyệt phân công</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Tóm tắt thay đổi | Text | No | • Display tòa, nhân sự, vai trò, từ ngày – đến ngày, lý do, người tạo<br>• Khi là Phụ trách chính mới: preview việc kết thúc người cũ tại ngày hiệu lực − 1<br>• Hiển thị cảnh báo lương như khối ④ ở Screen 20.1 |
| Nhãn cần Admin | Tag | No | • Display only when nhân sự là Lead, chuyển giữa hai nhóm, hoặc phân công lùi ngày (BR-3.03.7, BR-3.03.14)<br>• Khi hiển thị: chỉ Admin được Duyệt |
| Danh sách cặp (điều chuyển hàng loạt) | Checkbox | No | • Display only when phân công thuộc một đợt điều chuyển hàng loạt<br>• Mỗi dòng một cặp kèm checkbox "Từ chối dòng này"<br>• Default status: Unchecked<br>• Tick the checkbox -> đánh dấu dòng bị từ chối riêng khi Duyệt (BR-3.03.9)<br>• Untick the checkbox -> bỏ đánh dấu |
| Lý do | Textbox | No | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• Bắt buộc khi Trả sửa, Từ chối hoặc có dòng bị từ chối riêng (Common Rule 11)<br>• Trả sửa/Từ chối khi để trống -> Show error message <span style="color:#CC0000">E##</span> |
| Trả sửa | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Validate Lý do; hợp lệ -> trả phân công về người tạo <span style="color:#CC0000">(trạng thái đích ##)</span>, đóng popup |
| Từ chối | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Danger confirm (Common Rule 11); hợp lệ -> phân công chuyển `Từ chối`, lưu lý do, đóng popup |
| Duyệt | Button | No | • Always appear<br>• Enabled only when người dùng khác người tạo và, nếu có Nhãn cần Admin, người dùng là Admin<br>• Click on -> phân công chuyển `Đã duyệt`; dòng bị từ chối riêng chuyển `Từ chối`; đóng popup và cập nhật Screen 20.1<br>• Ngày hiệu lực đã đến hoặc đã qua tại lúc duyệt: <span style="color:#CC0000">## (chuyển ngay Đang hiệu lực?)</span> |

## 6. Screen 20.5: Popup kết thúc / hủy phân công

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (BR-3.03.10).</span></p>
<p align="center"><b>Screen 20.5: Popup kết thúc / hủy phân công</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Message | Text | No | • Danger popup (Common Rule 11)<br>• Content format: <span style="color:#CC0000">"##" (cần nội dung chính xác cho hai trường hợp Kết thúc và Hủy)</span> |
| Ngày kết thúc | Datepicker | Yes | • Display only when action = Kết thúc<br>• Default selection: <span style="color:#CC0000">##</span><br>• Ngày rơi vào kỳ lương đã khóa -> Show error message <span style="color:#CC0000">E##</span><br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Cảnh báo hở ngày | Text | No | • Display only when kết thúc dòng Phụ trách chính mà chưa có người thay từ ngày kế tiếp<br>• Nêu tòa sẽ thiếu phụ trách chính và bị loại khỏi bảng lương kỳ có ngày 15 bị hở (BR-3.03.1, BR-3.03.12)<br>• <span style="color:#CC0000">Spec chưa nêu chặn hay chỉ cảnh báo — cần xác nhận</span> |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Xác nhận | Button | No | • Always appear<br>• Enabled only when đã nhập Lý do (và Ngày kết thúc với action Kết thúc)<br>• Click on:<br>&nbsp;&nbsp;◦ Kết thúc -> phân công chuyển `Hết hiệu lực` tại ngày kết thúc, lưu lý do<br>&nbsp;&nbsp;◦ Hủy -> phân công `Đã duyệt` chuyển `Đã hủy`, lưu lý do<br>&nbsp;&nbsp;◦ Đóng popup và cập nhật Screen 20.1 |

## 7. User Steps

| | |
|:-:|---|
| **Pre-condition** | Người dùng đã đăng nhập với quyền tạo phân công; tòa có phụ trách chính đang hiệu lực (flow F-08) |
| **User steps** | **Step 1:** Click menu `Phân công tòa` (hoặc nút `Phân công` ở Chi tiết tòa nhà, refer to FR04) -> display Phân công tòa nhà (Screen 20.1)<br>**Step 2:** Tại dòng Phụ trách chính, click `⋯` → `Đổi quản lý`, nhập người mới, ngày hiệu lực, lý do rồi click `Gửi duyệt` -> display Phân công tòa nhà, cặp mới ở tab Chờ duyệt (Screen 20.1)<br>**Step 3:** Người duyệt mở tab `Chờ duyệt`, click `⋯` → `Duyệt` -> display Popup duyệt phân công (Screen 20.4)<br>**Step 4:** Click `Duyệt` -> display Phân công tòa nhà, dòng mới ở trạng thái Sắp tới; đến ngày hiệu lực job chuyển Đang hiệu lực (Screen 20.1) |

| | |
|:-:|---|
| **Pre-condition** | Có tòa đang vận hành không có phụ trách chính |
| **User steps** | **Step 1:** Tại Screen 20.1, click tab `△ Thiếu phụ trách chính (n)` -> display danh sách tòa thiếu (Screen 20.1)<br>**Step 2:** Click `⋯` → `Phân công` trên dòng THIẾU -> display Popup tạo phân công với tòa đã điền sẵn (Screen 20.2) |

| | |
|:-:|---|
| **Pre-condition** | Cần chuyển nhiều tòa cùng ngày hiệu lực |
| **User steps** | **Step 1:** Tại Screen 20.1, click `Điều chuyển hàng loạt` -> display Điều chuyển hàng loạt (Screen 20.3)<br>**Step 2:** Nhập các cặp, click `Gửi duyệt` -> display Phân công tòa nhà, tab Chờ duyệt (Screen 20.1) |

---
---

# FR21 - Hiệu suất thu tiền

## 1. Business Rule

| | |
|:-:|---|
| **Authorization** | • NV (NVVH): xem hiệu suất và lương hiệu suất của mình (Cluster Rule 07.3)<br>• TNVH: xem hiệu suất và lương hiệu suất của cấp dưới<br>• TPVH: xem hiệu suất trong đơn vị và toàn bộ cấp dưới (spec §4)<br>• Admin, Kế toán: xem toàn hệ thống; Kế toán duyệt DT thu thêm nhập tay<br>• Tạo, duyệt/từ chối đề nghị điều chỉnh: <span style="color:#CC0000">## (spec chưa nêu vai trò)</span> |
| **View Rule** | • Người dùng xem hiệu suất thu tiền theo NV × tòa của một kỳ lương, kèm diễn giải công thức, DT thu thêm, bậc và lương hiệu suất; drill-down về payment và hóa đơn; tạo đề nghị điều chỉnh. Không sửa trực tiếp số tổng (Cluster Rule 07.6)<br>• Chức năng chỉ thực hiện được khi người dùng đã đăng nhập với vai trò thuộc Authorization <span style="color:#CC0000">##</span><br>• NV/Tòa: gán theo phân công phụ trách chính tại ngày 15 (**ASSUMED**, Cluster Rule 07.2)<br>• Số phòng = phòng có hóa đơn trong kỳ; tách khỏi tổng phòng quản lý và khác mẫu số N của phân bổ chi phí (Cluster Rule 07.5)<br>• DT niêm yết (D-45) · DT phải thu (D-46)<br>• Mốc thu M1/M2/M3 = tiền thu đã xác nhận đến 23:59 ngày 5/10/15 (**ASSUMED**, P-19). Payment xác nhận tự gắn mốc (F-05). Mốc được chụp tự động, **không chỉnh tay**<br>• Tiền mặt NV giữ chưa được Kế toán xác nhận thì chưa vào mốc (P-26, Decision Log #10)<br>• DT 3 mốc: trọng số 100/90/70 % <span style="color:#CC0000">(Mâu thuẫn: bảng cột spec ghi trọng số 100/90/70 %, nhưng diễn giải ③ và Seed §9.3, §9.5 cộng thẳng M1 + M2 + M3 (ví dụ 132.886.000 + 4.059.000 + 0 = 136.945.000) — cần xác nhận giá trị Mốc hiển thị là số đã nhân trọng số hay số thu gốc)</span><br>• Công thức (D-48, D-49):<br>&nbsp;&nbsp;◦ Hệ số dịch vụ = 1 − (Dịch vụ ÷ DT phải thu)<br>&nbsp;&nbsp;◦ Tổng DT thu được = Tổng 3 mốc × Hệ số dịch vụ + DT thu thêm<br>&nbsp;&nbsp;◦ Hiệu suất % = Tổng DT thu được ÷ DT niêm yết<br>&nbsp;&nbsp;◦ Ví dụ tòa T3 kỳ 08/2026: 1 − (40.996.000 ÷ 137.396.000) = 0,7016216; 136.945.000 × 0,7016216 + 1.016.129 = 97.099.698; 97.099.698 ÷ 103.000.000 = 94,27 %<br>• DT thu thêm gồm 2 nguồn, hiển thị tách:<br>&nbsp;&nbsp;◦ (a) Hệ thống sinh: prorate hóa đơn đầu của khách mới đã thu đến ngày 15. Hệ thống chia 30 (P-03, Decision Log #11); sổ gốc chia 31 thì hiển thị cảnh báo<br>&nbsp;&nbsp;◦ (b) Nhập tay có lý do, Kế toán duyệt<br>• Bậc lương xếp theo **hiệu suất của từng tòa**, không theo hiệu suất gộp của nhân viên; dùng % chưa làm tròn để xếp dải (**ASSUMED**)<br>• Mức/phòng = Hiệu suất × Đơn giá ÷ Ngưỡng; Lương HS tòa = Mức/phòng × Số phòng (Seed §9.4, khớp wireframe ⑥)<br>• Bảng bậc theo Payroll Rule version tại kỳ (P-01, Decision Log #16, **ASSUMED**):<br>&nbsp;&nbsp;◦ ≥ 98 %: đơn giá 130.000, ngưỡng 100<br>&nbsp;&nbsp;◦ 95 – < 98 %: 120.000, ngưỡng 95<br>&nbsp;&nbsp;◦ 93 – < 95 %: 119.000, ngưỡng 95<br>&nbsp;&nbsp;◦ 90 – < 93 %: 110.000, ngưỡng 90<br>&nbsp;&nbsp;◦ Dưới 75 %: không trả lương hiệu suất<br>&nbsp;&nbsp;◦ <span style="color:#CC0000">Dải 75 – < 90 % chưa có dữ liệu quan sát — cần khách hàng cung cấp</span><br>• Trạng thái số liệu:<br>&nbsp;&nbsp;◦ Tạm tính: tới thời điểm xem, cho tới khi bảng lương kỳ được khóa (FR22)<br>&nbsp;&nbsp;◦ Thực tế: sau khi bảng lương kỳ khóa; số liệu khóa lại<br>• Nợ phá HĐ thu hồi ở tháng sau: CF ghi tháng thu, không hồi tố hiệu suất (P-27)<br>• Phân công lùi ngày được duyệt (FR20) -> hiệu suất tạm tính được tính lại (BR-3.03.14) |
| **View Impact** | • Xem, lọc, đổi chế độ xem, bung diễn giải, drill-down và xuất không làm thay đổi dữ liệu; tìm kiếm và lọc chỉ tác động tới hiển thị hiện tại<br>• Tạo đề nghị điều chỉnh: tạo đề nghị có lý do ở trạng thái chờ duyệt <span style="color:#CC0000">(spec chưa định nghĩa state của đề nghị điều chỉnh)</span><br>• Duyệt đề nghị: áp vào số hiệu suất/lương hiệu suất của kỳ chưa khóa (FR22); Từ chối: lưu lý do<br>• DT thu thêm nhập tay (b) được Kế toán duyệt -> cộng vào Tổng DT thu được của tòa<br>• Khóa bảng lương kỳ (FR22): số liệu `Tạm tính` -> `Thực tế`<br>• Mọi thao tác ghi audit theo Common Rule 5 |

## 2. Screen 21.1: Hiệu suất thu tiền

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — ảnh ImageGen UI-21-collection-performance.png KHÔNG ĐẠT (AUDIT: toàn bộ số do AI tự đặt — Huyền 220 phòng, HS 93,22 %, lương HS 11.830.000; mọi tòa đều 130.000/phòng trái rule bậc; thiếu ①③④⑤⑥), không dùng. Nội dung dựng từ spec (wireframe UI-21).</span></p>
<p align="center"><b>Screen 21.1: Hiệu suất thu tiền</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Hiệu suất thu tiền`<br>• Breadcrumb: `Trang chủ / Nhân sự & lương / Hiệu suất thu tiền` |
| Tiêu đề | Text | No | • Hiển thị "Hiệu suất thu tiền · Kỳ lương {MM/YYYY}", ví dụ "Kỳ lương 09/2026"<br>• ① Tag trạng thái số liệu (Common Rule 4):<br>&nbsp;&nbsp;◦ Tạm tính: tới thời điểm xem, cho tới khi bảng lương kỳ được khóa<br>&nbsp;&nbsp;◦ Thực tế: bảng lương kỳ đã khóa; số liệu khóa lại |
| Xuất | Button | No | • Always display<br>• Always enabled<br>• Click on -> Xuất toàn bộ kết quả đang lọc <span style="color:#CC0000">## (định dạng CSV/XLSX?)</span> |
| 🟧 Filter section | | | • Bộ lọc luôn hiển thị<br>• Tiêu chí được áp ngay khi chọn và phản ánh lên URL (Common Rule 6); chọn cấp trên thu hẹp cấp dưới (BR-3.01.7) |
| Kỳ lương | Dropdown | No | • Default selection: <span style="color:#CC0000">## (kỳ hiện tại theo bộ chọn Kỳ ở Header?)</span><br>• Click on -> Display danh sách kỳ lương. Allow single selection only<br>• Select an option -> Search for all records with Kỳ lương = selected option<br>• Có trong danh sách bộ lọc spec, wireframe đặt kỳ ở tiêu đề |
| Đơn vị | Dropdown | No | • Default selection: None ("Tất cả")<br>• Click on -> Display Tất cả + các đơn vị (FR18). Allow single selection only<br>• Select an option -> Search for all records with Đơn vị = selected option |
| Nhân sự | Dropdown | No | • Default selection: None ("Tất cả")<br>• Click on -> Display Tất cả + nhân sự thuộc đơn vị đã chọn. Allow single selection only<br>• Select an option -> Search for all records with Nhân sự = selected option |
| Tòa | Dropdown | No | • Default selection: None ("Tất cả")<br>• Click on -> Display Tất cả + tòa trong phạm vi quyền. Allow single selection only<br>• Select an option -> Search for all records with Tòa = selected option |
| Vai trò | Dropdown | No | • Default selection: None ("Tất cả")<br>• Click on -> Display Tất cả + vai trò phân công. Allow single selection only<br>• Select an option -> Search for all records with Vai trò = selected option<br>• <span style="color:#CC0000">Chỉ Phụ trách chính tính lương HS (BR-3.03.2) — cần xác nhận ý nghĩa bộ lọc này trên màn hiệu suất</span> |
| Trạng thái số liệu | Dropdown | No | • Default selection: None ("Tất cả")<br>• Click on -> Display Tất cả, Tạm tính, Thực tế. Allow single selection only<br>• Select an option -> Search for all records with trạng thái = selected option |
| Chế độ xem | Button | No | • Hai lựa chọn: Theo NV (mặc định), Theo tòa<br>• Click on -> Chuyển chế độ xem, giữ nguyên bộ lọc<br>• <span style="color:#CC0000">Chế độ Theo tòa chưa có phác họa — cần mô tả bộ cột và nhóm dòng</span> |
| Ghi chú tạm tính | Text | No | • Display only when trạng thái số liệu = Tạm tính<br>• Content format: "ⓘ Số liệu tạm tính tới thời điểm xem; chốt Thực tế sau ngày 16" |
| 🟦 ② Bảng NV × tòa | | | • Display the list of tòa của từng nhân sự trong phạm vi quyền; tiêu đề nhóm "{Tên NV}, kỳ {MM/YYYY}"<br>• Dòng TỔNG của mỗi nhân sự nằm ngay dưới các tòa của người đó<br>• Giá trị trống hiển thị `—` (Common Rule 3); tiền theo Common Rule 8<br>• Hiển thị theo Cluster Rule 07.3<br>• If there are no records in the selected period, display error message <span style="color:#CC0000">E##</span><br>• If no record matches the filter criteria, display error message <span style="color:#CC0000">E##</span><br>• Default sorting: <span style="color:#CC0000">##</span><br>• Phân trang theo Common Rule 6<br>• Click on một dòng tòa -> Bung diễn giải công thức của tòa đó ở ③<br>• <span style="color:#CC0000">Wireframe chỉ vẽ cột Tòa, Phòng, DT niêm yết, DT phải thu, Mốc 1, Mốc 2, HS %; spec liệt kê đủ các cột dưới đây — cần xác nhận bộ cột mặc định</span> |
| NV/Tòa | Text | No | • Mã tòa; phụ trách chính tại ngày 15 (**ASSUMED**) |
| Số phòng | Number | No | • Số phòng có hóa đơn trong kỳ, ví dụ T3 = 22 |
| DT niêm yết | Number | No | • Doanh thu niêm yết (D-45) |
| DT phải thu | Number | No | • Doanh thu phải thu (D-46) |
| M1 / M2 / M3 | Number | No | • Tiền thu đã xác nhận đến 23:59 ngày 5 / 10 / 15 (**ASSUMED**, P-19)<br>• Không chỉnh tay |
| DT 3 mốc | Number | No | • Tổng 3 mốc theo trọng số 100/90/70 % <span style="color:#CC0000">(xem mâu thuẫn ở View Rule)</span> |
| Dịch vụ / Thu thêm | Number | No | • Dịch vụ: phần dịch vụ trong DT phải thu, dùng tính hệ số dịch vụ (D-48)<br>• Thu thêm: DT thu thêm (a) + (b) đã duyệt |
| Tổng DT thu được | Number | No | • Theo công thức D-49 |
| Hiệu suất % | Number | No | • Tổng DT thu được ÷ DT niêm yết; hiển thị 2 chữ số thập phân (Common Rule 8), xếp dải dùng giá trị chưa làm tròn |
| Bậc/đơn giá | Text | No | • "{Đơn giá} / {Ngưỡng}" theo Payroll Rule version tại kỳ, ví dụ "119.000 / 95"<br>• Chip `Cần xác nhận nghiệp vụ · P-01` |
| Lương hiệu suất | Number | No | • Mức/phòng × Số phòng của tòa<br>• Click on -> Bung diễn giải ③ |
| Dòng TỔNG | Text | No | • Σ Số phòng, Σ DT niêm yết, Σ DT phải thu, Hiệu suất gộp và Σ Lương hiệu suất của nhân sự; ví dụ Huyền kỳ 08/2026: 135 phòng · 539.200.000 · 692.010.267 · 95,01 %<br>• Cách tính hiệu suất gộp: <span style="color:#CC0000">## (Σ Tổng DT thu được ÷ Σ DT niêm yết? — cần xác nhận)</span><br>• Hiệu suất gộp chỉ để tham khảo, không dùng xếp bậc |
| Page number | Text | No | • Click on a page number -> Go to the corresponding page |
| 🟧 ③ Diễn giải công thức — bung tòa {Tòa} | | | • Display only when đã chọn một dòng tòa ở ②<br>• Bung ngay trên màn để nhân viên tự kiểm tra được công thức lõi quyết định lương |
| Tổng 3 mốc | Text | No | • Content format: "Tổng 3 mốc = {M1} + {M2} + {M3} = {tổng}", ví dụ "132.886.000 + 4.059.000 + 0 = 136.945.000" |
| Hệ số dịch vụ | Text | No | • Content format: "Hệ số dịch vụ = 1 − ({Dịch vụ} ÷ {DT phải thu}) = {hệ số}", ví dụ "1 − (40.996.000 ÷ 137.396.000) = 0,7016216"<br>• Hiển thị 7 chữ số thập phân như wireframe <span style="color:#CC0000">(cần xác nhận)</span> |
| Tổng DT thu được | Text | No | • Content format: "Tổng DT thu được = {Tổng 3 mốc} × {Hệ số} + {DT thu thêm} (thu thêm) = {kết quả}" |
| ④ Hiệu suất | Text | No | • Content format: "HIỆU SUẤT = {Tổng DT thu được} ÷ {DT niêm yết} = {x} %", ví dụ "97.099.698 ÷ 103.000.000 = 94,27 %" |
| Xem từng payment ▸ | Button | No | • Always display<br>• Always enabled<br>• Click on -> Display Danh sách payment của tòa (Screen 21.2) |
| 🟧 ⑤ DT thu thêm — 2 nguồn, hiển thị tách | | | • Hai nguồn hiển thị tách bạch để kiểm soát khoản dễ bị lạm dụng |
| (a) Hệ thống sinh | Text | No | • Content format: "{Tòa} · {tiền phòng} ÷ {số ngày chia} × {số ngày} = {kết quả}"; nguồn: prorate hóa đơn đầu khách mới đã thu đến ngày 15<br>• Khi sổ gốc chia khác 30: dòng cảnh báo △ "sổ chia 31; hệ thống dự kiến chia 30 → {kết quả chia 30}" kèm chip `Cần xác nhận nghiệp vụ · P-03`, ví dụ T3: 3.150.000 ÷ 31 × 10 = 1.016.129, chia 30 → 1.050.000 |
| (b) Nhập tay có lý do | Text | No | • Content format: "{Tòa} · {số tiền} · duyệt bởi {người/vai trò duyệt}"<br>• Chỉ khoản Kế toán đã duyệt mới cộng vào Tổng DT thu được<br>• Khoản chưa duyệt: <span style="color:#CC0000">## (hiển thị kèm Tag Chờ duyệt?)</span><br>• Nơi nhập khoản (b): <span style="color:#CC0000">## (spec chưa mô tả — dùng Screen 21.3?)</span> |
| 🟧 ⑥ Bậc & lương hiệu suất | | | • Tiêu đề khối: "Bậc & lương hiệu suất — bảng bậc theo Payroll Rule v{n}" |
| Ghi chú bậc | Text | No | • Always display<br>• Content format: "Bậc theo HS CỦA TỪNG TÒA, không theo HS gộp của nhân viên" + "({Tên NV} HS gộp {x} nhưng {n} tòa rơi vào {m} bậc khác nhau)" |
| Bảng bậc áp dụng | Text | No | • Mỗi dải một nhóm: "{dải} → {đơn giá}/{ngưỡng} : {Tòa} {HS} → {Mức/phòng} × {Số phòng} = {Lương HS tòa}", ví dụ "93–95 → 119.000/95 : T3 94,27 → 118.088 × 22 = 2.597.925"<br>• Chip `Cần xác nhận nghiệp vụ · P-01` |
| Cảnh báo dải chưa có dữ liệu | Text | No | • Display only when P-01 chưa chốt<br>• Content format: "△ Dải dưới 90 chưa có dữ liệu quan sát → vẫn phải hỏi khách (P-01)" |
| Xem rule version | Button | No | • Có trong danh sách action spec, chưa có trên wireframe<br>• <span style="color:#CC0000">Click on -> ## (mở cấu hình Payroll Rule ở FR33?)</span> |
| Tạo đề nghị điều chỉnh | Button | No | • Always display, kèm dòng "✕ Không sửa trực tiếp số tổng — chỉ [Tạo đề nghị điều chỉnh]"<br>• Enabled only when trạng thái số liệu = Tạm tính và người dùng có quyền <span style="color:#CC0000">(vai trò ##)</span><br>• Click on -> Display Popup tạo đề nghị điều chỉnh (Screen 21.3) |
| Duyệt / từ chối điều chỉnh | Button | No | • Có trong danh sách action spec, chưa có vị trí trên màn<br>• Theo Common Rule 11 (Duyệt: popup tóm tắt; Từ chối: danger popup, bắt buộc lý do)<br>• <span style="color:#CC0000">Cần xác nhận nơi hiển thị danh sách đề nghị chờ duyệt và vai trò duyệt</span> |

## 3. Screen 21.2: Danh sách payment của tòa

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (vùng ④ drill-down UI-21).</span></p>
<p align="center"><b>Screen 21.2: Danh sách payment của tòa</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận dạng popup, drawer hay trang riêng)</span> | | | |
| Tiêu đề | Text | No | • Hiển thị "{Tòa} · kỳ {MM/YYYY} · {Tên NV}" |
| 🟦 Bảng payment | | | • Display the list of payment đã gắn mốc M1/M2/M3 của tòa trong kỳ; đi ngược từ hiệu suất về từng payment rồi về hóa đơn<br>• Cột: <span style="color:#CC0000">## (spec chưa liệt kê; tối thiểu cần mã payment, hóa đơn liên kết, số tiền, ngày xác nhận và mốc được gắn — cần xác nhận)</span><br>• Payment tiền mặt chưa được Kế toán xác nhận: <span style="color:#CC0000">## (hiển thị kèm nhãn "chưa vào mốc" hay ẩn?)</span><br>• No data: <span style="color:#CC0000">E##</span><br>• Click on mã payment -> Go to chi tiết payment (refer to FR13)<br>• Click on mã hóa đơn -> Go to chi tiết hóa đơn (refer to FR12) |

## 4. Screen 21.3: Popup tạo đề nghị điều chỉnh

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Spec chỉ nêu action "tạo đề nghị điều chỉnh", chưa có field; nội dung dưới đây là khung tối thiểu cần BA bổ sung.</span></p>
<p align="center"><b>Screen 21.3: Popup tạo đề nghị điều chỉnh</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận popup có X icon)</span> | | | |
| Nhân sự · Tòa · Kỳ | Text | No | • Tự điền theo tòa đang bung ở Screen 21.1; chỉ đọc |
| Nội dung điều chỉnh | Dropdown | Yes | • <span style="color:#CC0000">## (spec chưa nêu đối tượng điều chỉnh: DT thu thêm (b), số mốc, hiệu suất hay lương hiệu suất — cần danh sách lựa chọn)</span><br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Số tiền | Textbox | Yes | • Always display<br>• Allow entering numeric values (VND, Common Rule 8). Max length: 12<br>• <span style="color:#CC0000">Cho phép số âm không: ##</span><br>• If entering 0, display error message <span style="color:#CC0000">E##</span> |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không lưu |
| Gửi đề nghị | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ Kỳ đã khóa (số liệu Thực tế) -> display error message <span style="color:#CC0000">E##</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> tạo đề nghị điều chỉnh chờ duyệt, đóng popup và toast thành công |

## 5. User Steps

| | |
|:-:|---|
| **Pre-condition** | Người dùng đã đăng nhập với vai trò NVVH, TNVH, TPVH, Kế toán hoặc Admin; kỳ lương có payment đã xác nhận (flow F-05 bước 1–2) |
| **User steps** | **Step 1:** Click menu `Hiệu suất thu tiền` -> display Hiệu suất thu tiền (Screen 21.1)<br>**Step 2:** Click một dòng tòa để bung ③, rồi click `Xem từng payment ▸` -> display Danh sách payment của tòa (Screen 21.2)<br>**Step 3:** Click một mã payment -> display chi tiết payment (refer to FR13) |

| | |
|:-:|---|
| **Pre-condition** | Số liệu kỳ đang ở trạng thái Tạm tính; người dùng có quyền tạo đề nghị điều chỉnh |
| **User steps** | **Step 1:** Tại Screen 21.1, click `Tạo đề nghị điều chỉnh` ở ⑥ -> display Popup tạo đề nghị điều chỉnh (Screen 21.3)<br>**Step 2:** Nhập nội dung, lý do rồi click `Gửi đề nghị` -> display Hiệu suất thu tiền (Screen 21.1) |

---
---

# FR22 - Bảng lương

## 1. Business Rule

| | |
|:-:|---|
| **Authorization** | • Admin, Kế toán: mở kỳ, refresh snapshot, sửa cấu phần được phép, thêm điều chỉnh/khấu trừ, gửi review, trả sửa, khóa, export bảng lương/UNC (flow F-05: HR/Admin review adjustment, Kế toán/Admin khóa payroll; HR gộp vào Admin/Kế toán theo Decision Log #25)<br>• Mở lại bảng lương đã khóa: <span style="color:#CC0000">## (spec chỉ nêu "mở lại với lý do"; Common Rule 12 quy định mở khóa kỳ chỉ Admin — cần xác nhận áp dụng cho bảng lương)</span><br>• Duyệt ma trận lương (Payroll Rule): Admin (Decision Log #16)<br>• TPVH: không sửa lương (spec §4); quyền xem <span style="color:#CC0000">##</span><br>• TNVH: xem lương hiệu suất của cấp dưới, không xem lương cố định; NV xem dòng lương của mình (Cluster Rule 07.3) |
| **Payroll Rule** | • Người dùng lập, rà soát và khóa bảng lương của một kỳ cho khối Vận hành, từ snapshot phân công ngày 15, cấu phần lương theo level (FR19) và hiệu suất từng tòa (FR21)<br>• Chức năng chỉ thực hiện được khi người dùng đã đăng nhập với vai trò thuộc Authorization <span style="color:#CC0000">##</span><br>• Kỳ lương, ngày chốt 16/N, người hưởng HS tại ngày 15, không prorate: Cluster Rule 07.2 (Decision Log #18). Ngày 16 mở/chốt payroll, snapshot phân công ngày 15 và rule version (F-05)<br>• Mỗi kỳ gắn với **một phiên bản Payroll Rule**; phiên bản đã dùng bởi kỳ Locked không sửa được<br>• Phạm vi dòng lương: nhân sự có `is_ops_payroll` (FR18). Nhân sự ngoài khối Vận hành (X-05) chỉ giữ 1 dòng lương cố định nhập tay<br>• Cấu phần một dòng lương: chức danh/level snapshot, lương cơ bản, ăn trưa, xăng xe, lương lead (trưởng nhóm), hỗ trợ, lương hiệu suất, điều chỉnh, khấu trừ, tổng gross, thực nhận, trạng thái chi<br>&nbsp;&nbsp;◦ Lương cơ bản, ăn trưa, xăng xe: giá trị level hiệu lực tại ngày chốt (FR19)<br>&nbsp;&nbsp;◦ Lương trưởng nhóm = số phòng dưới quyền × 10.000 (FR18, P-12)<br>&nbsp;&nbsp;◦ Hỗ trợ: nhập tay theo NV × kỳ, bắt buộc lý do (BR-3.02.5)<br>&nbsp;&nbsp;◦ Lương hiệu suất = Σ lương HS tòa, bậc xếp theo hiệu suất từng tòa (FR21)<br>• Ví dụ kỳ 08/2026 (Seed §9): Mạnh (TPVH) = 10.000.000 + 500.000 + 700.000 + 7.740.000 = 18.940.000; Huyền (NVVH) = 16.152.297 + 500.000 + 500.000 + 2.000.000 = 19.152.297<br>• Công thức Tổng gross và Thực nhận khi có điều chỉnh, khấu trừ, tạm ứng: <span style="color:#CC0000">## (spec chưa nêu)</span><br>• Drawer chi tiết hiển thị **snapshot phân công tại ngày 15**, không phải phân công hiện tại<br>• Tòa không có phụ trách chính tại ngày 15 -> bị loại khỏi mọi NV, ghi cảnh báo (BR-3.03.12)<br>• Tòa mới dùng 100.000 đ/phòng cố định tối đa 2 tháng, kết thúc sớm khi lấp đầy ≥ 70 % (**ASSUMED**, Decision Log #19, P-08)<br>• Dưới 75 % không trả lương hiệu suất; dùng % chưa làm tròn để xếp dải (**ASSUMED**, Decision Log #16, P-01)<br>• Hai mẫu số hiển thị tách, tuyệt đối không dùng lẫn (Cluster Rule 07.5, Decision Log #20): tháng 8 N phân bổ = 1.382, số phòng tính hiệu suất = 1.079; 1.343 là lỗi nguồn<br>• Không sửa trực tiếp số tổng; mọi thay đổi qua đề nghị điều chỉnh có lý do và được duyệt (Cluster Rule 07.6)<br>• Cổ phần/cổ tức không xuất hiện trong bảng lương (BR-3.02.9)<br>• Trạng thái bảng lương:<br>&nbsp;&nbsp;◦ Nháp/Open: refresh snapshot, sửa cấu phần được phép, thêm điều chỉnh/khấu trừ<br>&nbsp;&nbsp;◦ Reviewing: trả sửa, khóa<br>&nbsp;&nbsp;◦ Locked: chỉ đọc (Common Rule 12); được tạo đợt chi lương (FR23)<br>&nbsp;&nbsp;◦ Reopened: mở lại có lý do, tạo version mới. Nếu đã chi một phần, phải tạo **phiếu bổ sung hoặc thu hồi** ở FR23, không sửa phiếu đã chi<br>• Bảng lương khóa -> chặn tạo/sửa phân công có ngày hiệu lực rơi vào kỳ (FR20) |
| **Payroll Impact** | • Mở kỳ: tạo bảng lương kỳ ở trạng thái Nháp/Open; snapshot phân công ngày 15 và rule version<br>• Refresh snapshot: tính lại từ dữ liệu hiện tại; chỉ khi Open <span style="color:#CC0000">(và Reopened?)</span><br>• Thêm điều chỉnh/khấu trừ: tạo dòng điều chỉnh có lý do <span style="color:#CC0000">(chờ duyệt hay áp ngay — cần xác nhận)</span><br>• Gửi review: Open -> Reviewing<br>• Trả sửa: Reviewing -> Open, lưu lý do <span style="color:#CC0000">(cần xác nhận trạng thái đích)</span><br>• Khóa: Reviewing -> Locked; freeze snapshot; hiệu suất FR21 chuyển `Thực tế`; cho phép tạo đợt chi FR23<br>• Mở lại: Locked -> Reopened, lưu lý do, tạo version mới<br>• Export bảng lương/UNC không làm thay đổi dữ liệu<br>• Mọi thao tác ghi audit theo Common Rule 5 |

## 2. Screen 22.1: Bảng lương kỳ

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — ảnh ImageGen UI-22-payroll-review.png KHÔNG ĐẠT (AUDIT: LCB NVVH 12–13 triệu (seed 0), thực nhận và tổng sai seed; drawer liệt kê G1…G9; thiếu cảnh báo trước khi khóa và hai mẫu số 1.382/1.079; trạng thái Đang rà soát vẫn có nút Gửi rà soát), không dùng. Nội dung dựng từ spec (wireframe UI-22).</span></p>
<p align="center"><b>Screen 22.1: Bảng lương kỳ</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Bảng lương`<br>• Breadcrumb: `Trang chủ / Nhân sự & lương / Bảng lương / Kỳ {MM/YYYY}`<br>• Chọn kỳ qua bộ chọn Kỳ ở Header (Common Rule 1) |
| 🟧 Header kỳ | | | |
| Tiêu đề | Text | No | • Hiển thị "Bảng lương / Kỳ {MM/YYYY}" kèm Tag trạng thái Nháp/Open, Reviewing, Locked, Reopened (Common Rule 4) |
| Thông tin kỳ | Text | No | • Content format: "Ngày chốt {16/MM} · Rule v{n} · N phân bổ {N} · {n} nhân sự", ví dụ "Ngày chốt 16/09 · Rule v3 · N phân bổ 1.382 · 14 nhân sự"<br>• Chip `Cần xác nhận nghiệp vụ` cho P-05, P-06 (Cluster Rule 07.4) |
| Tổng thực nhận · cảnh báo | Text | No | • Content format: "Tổng thực nhận {tổng} · △ {n} cảnh báo"<br>• Click on "△ {n} cảnh báo" -> <span style="color:#CC0000">## (cuộn tới khối ③?)</span><br>• <span style="color:#CC0000">Mâu thuẫn: số 198.412.000 trên wireframe không có trong Seed Data và không khớp tổng cấu phần Seed §9.5 (LCB 91.434.616 + ăn trưa 17.919.231 + xăng 9.400.000 + trưởng nhóm 11.820.000 + lương HS 146.302.950 = 276.876.797); "14 nhân sự" cũng không khớp tổng LCB toàn bảng — cần xác nhận phạm vi dòng tổng</span> |
| Banner kỳ đã khóa | Text | No | • Display only when trạng thái = Locked<br>• Hiển thị theo Common Rule 12 (persistent, kèm lý do, vẫn cho copy/xuất) |
| Mở kỳ | Button | No | • Display only when kỳ chưa có bảng lương<br>• Enabled only when người dùng là Admin hoặc Kế toán<br>• Click on -> Tạo bảng lương kỳ ở trạng thái Nháp/Open, snapshot phân công ngày 15 và rule version<br>• <span style="color:#CC0000">Có trong action spec, chưa có vị trí trên wireframe</span> |
| Refresh snapshot | Button | No | • Display only when trạng thái = Nháp/Open<br>• Enabled only when người dùng là Admin hoặc Kế toán<br>• <span style="color:#CC0000">Click on -> ## (confirm trước khi tính lại? vị trí nút chưa có trên wireframe)</span> |
| Gửi review | Button | No | • Display only when trạng thái = Nháp/Open hoặc Reopened<br>• Enabled only when người dùng là Admin hoặc Kế toán<br>• Click on -> confirm nhẹ kèm checklist lỗi còn lại (Common Rule 11); xác nhận -> chuyển Reviewing |
| Khóa | Button | No | • Display only when trạng thái = Reviewing. Đây là CTA chính khi Reviewing<br>• Enabled only when người dùng là Admin hoặc Kế toán<br>• Click on -> Display Popup khóa bảng lương (Screen 22.4) |
| Trả sửa | Button | No | • Display only when trạng thái = Reviewing<br>• Enabled only when người dùng là Admin hoặc Kế toán<br>• Click on -> Display Popup trả sửa bảng lương (Screen 22.5) |
| Mở lại | Button | No | • Display only when trạng thái = Locked<br>• Enabled only when <span style="color:#CC0000">## (vai trò được mở lại)</span><br>• Click on -> Display Popup mở lại bảng lương (Screen 22.6) |
| Xuất UNC | Button | No | • Display only when <span style="color:#CC0000">## (wireframe đặt nút ở trạng thái Reviewing, trong khi FR23 chỉ cho tạo đợt chi từ bảng lương Locked — cần xác nhận)</span><br>• Always enabled<br>• Click on -> Xuất file ủy nhiệm chi <span style="color:#CC0000">(định dạng file ##)</span> |
| Xuất bảng lương | Button | No | • Always display<br>• Always enabled<br>• Click on -> Xuất bảng lương kỳ <span style="color:#CC0000">(định dạng ##; cột theo Cluster Rule 07.3?)</span> |
| 🟦 ① Bảng kết quả | | | • Display the list of dòng lương của kỳ, tách đủ cấu phần để đối chiếu với bảng lương Excel theo từng cột<br>• Hiển thị theo Cluster Rule 07.3; tiền theo Common Rule 8<br>• Giá trị trống hiển thị `—` (Common Rule 3)<br>• If the period has no payroll lines, display error message <span style="color:#CC0000">E##</span><br>• Default sorting: <span style="color:#CC0000">## (wireframe xếp TPVH, TNVH rồi NVVH — cần xác nhận)</span><br>• Phân trang theo Common Rule 6<br>• Click on một dòng -> Display Drawer chi tiết lương nhân viên (Screen 22.2) |
| Nhân sự | Text | No | • Họ tên nhân sự |
| Chức vụ / Level | Text | No | • Chức danh và level snapshot tại kỳ, ví dụ "TPVH", "NVVH · NVVH-1" |
| LCB | Number | No | • Lương cơ bản theo level hiệu lực tại ngày chốt |
| Ăn trưa | Number | No | • Phụ cấp ăn trưa |
| Xăng xe | Number | No | • Phụ cấp xăng xe |
| Tr.nhóm | Number | No | • Lương trưởng nhóm = số phòng dưới quyền × 10.000; chỉ TPVH/TNVH có giá trị |
| Hỗ trợ | Number | No | • Lương hỗ trợ nhập tay theo NV × kỳ, bắt buộc lý do<br>• <span style="color:#CC0000">Cần xác nhận nhập tại ô này (Textbox, chỉ khi Open) hay qua Screen 22.3</span> |
| Lương hiệu suất | Number | No | • Σ lương HS tòa của nhân sự (FR21)<br>• Có trong danh sách cột spec, wireframe chưa vẽ cột |
| Điều chỉnh | Number | No | • Tổng các điều chỉnh đã duyệt |
| Khấu trừ | Number | No | • Tổng các khoản khấu trừ |
| Tổng gross | Number | No | • <span style="color:#CC0000">## (công thức chưa nêu)</span> |
| Thực nhận | Number | No | • Số thực nhận của nhân sự, ví dụ Huyền kỳ 08/2026 = 19.152.297 |
| Trạng thái chi | Tag | No | • Trạng thái chi lương từ FR23: Chưa chi / Chi một phần / Đã chi (Common Rule 4) |
| Tổng toàn bảng | Text | No | • Content format: "Tổng toàn bảng: LCB {…} · ăn trưa {…} · xăng {…} · trưởng nhóm {…} · lương hiệu suất {…}"; ví dụ tháng 8: LCB 91.434.616 · ăn trưa 17.919.231 · xăng 9.400.000 · trưởng nhóm 11.820.000 · lương hiệu suất 146.302.950 |
| Page number | Text | No | • Click on a page number -> Go to the corresponding page |
| 🟧 ③ Cảnh báo trước khi khóa | | | • Display only when có ít nhất 1 cảnh báo<br>• Hai tình huống làm lệch lương mà không lỗi kỹ thuật<br>• <span style="color:#CC0000">Cảnh báo có chặn Khóa không: ##</span> |
| Tòa thiếu phụ trách chính | Text | No | • Content format: "△ Tòa {mã} không có phụ trách chính tại ngày 15 → bị loại khỏi mọi NV" (BR-3.03.12)<br>• <span style="color:#CC0000">Click on -> ## (mở Phân công tòa, tab Thiếu phụ trách chính Screen 20.1?)</span> |
| Tòa mới | Text | No | • Content format: "△ Tòa {mã} là tòa mới → áp 100.000/phòng cố định" kèm chip `Cần xác nhận nghiệp vụ · P-08` |
| 🟧 ④ Hai mẫu số | | | |
| Hai mẫu số | Text | No | • Always display, đặt cạnh nhau ở cuối màn để người kiểm tra không lấy nhầm<br>• Content format: "N phân bổ chi phí (kể cả phòng trống) ........ {N}" và "Số phòng tính hiệu suất (có hóa đơn kỳ) ...... {n}", ví dụ 1.382 và 1.079<br>• Chip `Cần xác nhận nghiệp vụ · P-05` |

## 3. Screen 22.2: Drawer chi tiết lương nhân viên

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — drawer trong ảnh UI-22-payroll-review.png liệt kê tòa G1…G9 trái seed (T3, T10, T20, T22, T24, T41, S26, G3, G6), không dùng. Nội dung dựng từ spec (vùng ② UI-22).</span></p>
<p align="center"><b>Screen 22.2: Drawer chi tiết lương nhân viên</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The drawer can be closed by the `Đóng ×` icon or by clicking out of the drawer <span style="color:#CC0000">(cần xác nhận click ra ngoài)</span>. Closing the drawer redirects the user to Bảng lương kỳ (Screen 22.1) without any changes saved. | | | |
| Tiêu đề | Text | No | • Hiển thị "Drawer chi tiết — {Họ tên}" |
| Phân công tại ngày 15 | Text | No | • Content format: "Phân công tại ngày 15/{MM}: {n} tòa · {m} phòng (snapshot, không đổi)", ví dụ "15/08: 9 tòa · 135 phòng"<br>• Luôn là snapshot ngày 15, không phải phân công hiện tại |
| 🟦 Bảng tòa | | | • Display mọi tòa trong snapshot; không phân trang<br>• Dòng cuối Σ lương HS<br>• Hiển thị theo Cluster Rule 07.3 |
| Tòa | Text | No | • Mã tòa |
| Phòng | Number | No | • Số phòng có hóa đơn kỳ |
| HS % | Number | No | • Hiệu suất của tòa, 2 chữ số thập phân |
| Bậc/đơn giá | Text | No | • "{Đơn giá} / {Ngưỡng}", ví dụ "119.000 / 95" |
| Mức/phòng | Number | No | • HS × Đơn giá ÷ Ngưỡng, ví dụ 118.088 |
| Lương HS tòa | Number | No | • Mức/phòng × Phòng, ví dụ 2.597.925 |
| Công thức thực nhận | Text | No | • Content format: "Thực nhận = {Σ lương HS} + {ăn trưa} + {xăng xe} + {hỗ trợ} = {thực nhận}", ví dụ "16.152.297 + 500.000 + 500.000 + 2.000.000 = 19.152.297"<br>• TPVH/TNVH: "Thực nhận = LCB + ăn trưa + xăng xe + lương trưởng nhóm"<br>• Có điều chỉnh/khấu trừ: <span style="color:#CC0000">## (công thức chưa nêu)</span> |
| Ghi chú bậc | Text | No | • Always display<br>• Content format: "ⓘ Bậc xếp theo HS CỦA TỪNG TÒA — HS gộp của {NV} là {x} nhưng {n} tòa rơi vào {m} bậc đơn giá khác nhau" |
| Điều chỉnh có lý do | Text | No | • Display danh sách điều chỉnh/khấu trừ của NV trong kỳ: số tiền, lý do, người tạo, trạng thái duyệt<br>• Chưa có: `—` |
| Audit | Text | No | • Display lịch sử thay đổi dòng lương (Common Rule 5)<br>• <span style="color:#CC0000">Cần xác nhận cách hiển thị</span> |
| + Thêm điều chỉnh có lý do | Button | No | • Display only when trạng thái bảng lương = Nháp/Open hoặc Reopened<br>• Enabled only when người dùng là Admin hoặc Kế toán<br>• Click on -> Display Popup thêm điều chỉnh / khấu trừ (Screen 22.3) |
| Xem đề nghị điều chỉnh đang chờ | Button | No | • Always display<br>• Always enabled<br>• <span style="color:#CC0000">Click on -> Display danh sách đề nghị điều chỉnh chờ duyệt của NV (Screen ##)</span> |

## 4. Screen 22.3: Popup thêm điều chỉnh / khấu trừ

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (action "thêm adjustment/khấu trừ" UI-22).</span></p>
<p align="center"><b>Screen 22.3: Popup thêm điều chỉnh / khấu trừ</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận popup có X icon)</span> | | | |
| Nhân sự · Kỳ | Text | No | • Tự điền theo drawer đang mở; chỉ đọc |
| Loại | Dropdown | Yes | • Always display<br>• Default selection: None<br>• Click on -> Display the list of following options: Điều chỉnh, Khấu trừ <span style="color:#CC0000">(cần xác nhận có tách loại Hỗ trợ)</span><br>• Allow single selection only<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Số tiền | Textbox | Yes | • Always display<br>• Allow entering numeric values (VND, Common Rule 8). Max length: 12<br>• If entering 0, display error message <span style="color:#CC0000">E##</span><br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không lưu |
| Lưu | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ Bảng lương không ở trạng thái Open/Reopened -> display error message <span style="color:#CC0000">E##</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> tạo đề nghị điều chỉnh có lý do (Cluster Rule 07.6), đóng popup và cập nhật Screen 22.2 |

## 5. Screen 22.4: Popup khóa bảng lương

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (action "khóa" UI-22, Common Rule 11 Duyệt).</span></p>
<p align="center"><b>Screen 22.4: Popup khóa bảng lương</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Tóm tắt | Text | No | • Display kỳ, rule version, số nhân sự, tổng thực nhận và số cảnh báo còn lại ở khối ③ |
| Tác động | Text | No | • Content format: <span style="color:#CC0000">"##" (cần nội dung chính xác)</span><br>• Nêu các tác động: snapshot bảng lương không đổi; hiệu suất kỳ chuyển Thực tế; chặn phân công có ngày hiệu lực rơi vào kỳ; cho phép tạo đợt chi lương (FR23) |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Khóa | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ <span style="color:#CC0000">## (điều kiện chặn khóa, ví dụ còn đề nghị điều chỉnh chờ duyệt?)</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> chuyển bảng lương sang Locked, đóng popup, cập nhật Screen 22.1 và toast thành công |

## 6. Screen 22.5: Popup trả sửa bảng lương

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (action "trả sửa" UI-22, Common Rule 11).</span></p>
<p align="center"><b>Screen 22.5: Popup trả sửa bảng lương</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Dòng liên quan | Dropdown | No | • Always display<br>• Default selection: None<br>• Click on -> Display danh sách nhân sự trong bảng lương<br>• Allow single and multiple selection (Common Rule 11: chọn dòng liên quan nếu có) |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Trả sửa | Button | No | • Always appear<br>• Enabled only when đã nhập Lý do<br>• Click on -> Chuyển bảng lương về Nháp/Open <span style="color:#CC0000">(cần xác nhận trạng thái đích)</span>, lưu lý do, đóng popup và cập nhật Screen 22.1 |

## 7. Screen 22.6: Popup mở lại bảng lương

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (trạng thái Reopened UI-22, Common Rule 11 Mở khóa).</span></p>
<p align="center"><b>Screen 22.6: Popup mở lại bảng lương</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Message | Text | No | • Danger popup (Common Rule 11)<br>• Content format: <span style="color:#CC0000">"##" (cần nội dung chính xác)</span> |
| Snapshot bị ảnh hưởng | Text | No | • Always display<br>• Liệt kê snapshot sẽ mở lại: bảng lương kỳ, hiệu suất kỳ (FR21), khóa phân công kỳ (FR20) |
| Cảnh báo đã chi | Text | No | • Display only when kỳ đã có đợt chi ở trạng thái Đã chi<br>• Content format: <span style="color:#CC0000">"##"</span>; nội dung nêu rõ phải tạo phiếu bổ sung hoặc thu hồi ở Chi lương (Screen 23.1), không sửa phiếu đã chi |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Mở lại | Button | No | • Always appear<br>• Enabled only when đã nhập Lý do<br>• Click on -> Chuyển bảng lương sang Reopened, tạo version mới, lưu lý do, đóng popup và cập nhật Screen 22.1 |

## 8. User Steps

| | |
|:-:|---|
| **Pre-condition** | Người dùng đã đăng nhập với vai trò Kế toán hoặc Admin; đã qua ngày chốt 16 của kỳ (flow F-05 bước 3–4) |
| **User steps** | **Step 1:** Click menu `Bảng lương` -> display Bảng lương kỳ (Screen 22.1)<br>**Step 2:** Click một dòng nhân sự -> display Drawer chi tiết lương nhân viên (Screen 22.2)<br>**Step 3:** Click `+ Thêm điều chỉnh có lý do` -> display Popup thêm điều chỉnh / khấu trừ (Screen 22.3)<br>**Step 4:** Click `Lưu` -> display Drawer chi tiết lương nhân viên đã cập nhật (Screen 22.2)<br>**Step 5:** Đóng drawer, khi bảng lương ở Reviewing click `Khóa` -> display Popup khóa bảng lương (Screen 22.4)<br>**Step 6:** Click `Khóa` -> display Bảng lương kỳ ở trạng thái Locked (Screen 22.1); tiếp tục tạo đợt chi ở Chi lương (Screen 23.1) |

| | |
|:-:|---|
| **Pre-condition** | Bảng lương kỳ ở trạng thái Reviewing hoặc Locked |
| **User steps** | **Step 1:** Tại Screen 22.1 (Reviewing), click `Trả sửa` -> display Popup trả sửa bảng lương (Screen 22.5)<br>**Step 2:** Tại Screen 22.1 (Locked), click `Mở lại` -> display Popup mở lại bảng lương (Screen 22.6) |

---
---

# FR23 - Chi lương

## 1. Business Rule

| | |
|:-:|---|
| **Authorization** | • Kế toán: tạo đợt chi, tạo tạm ứng, gửi duyệt, đánh dấu đã chi, import kết quả ngân hàng, ghép giao dịch, hủy phiếu chưa chi, tạo thu hồi (flow F-05 bước 5–6)<br>• Admin: duyệt đợt chi trước khi đánh dấu `Đã chi` (**ASSUMED**, P-28)<br>• Các vai trò khác: <span style="color:#CC0000">## (spec chưa nêu)</span> |
| **Payment Rule** | • Người dùng lập đợt chi lương theo kỳ, trình Admin duyệt, ghi nhận đã chi và đối chiếu kết quả ngân hàng<br>• Chức năng chỉ thực hiện được khi người dùng đã đăng nhập với vai trò thuộc Authorization <span style="color:#CC0000">##</span><br>• Chỉ tạo được đợt chi từ bảng lương đã **Locked** (refer to FR22); màn nêu rõ nguồn để không chi theo số nháp. Ngoại lệ: tạm ứng được phép tạo trước khi khóa kỳ (P-28)<br>• Lương kỳ N chi ngày 20–25 tháng N+1; tạm ứng được liên kết và trừ khi khóa (**ASSUMED**, P-18, Decision Log #2)<br>• Bốn loại phiếu:<br>&nbsp;&nbsp;◦ Tạm ứng: chi trước một phần lương; được tạo trước khi khóa kỳ<br>&nbsp;&nbsp;◦ Thanh toán: chi phần lương còn lại sau khi bảng lương khóa<br>&nbsp;&nbsp;◦ Bổ sung: chi thêm khi bảng lương mở lại tăng số thực nhận<br>&nbsp;&nbsp;◦ Thu hồi: **phiếu mới mang số âm**; không sửa phiếu đã chi<br>• Số tài khoản được snapshot tại thời điểm chi (BR-3.02.8)<br>• Trạng thái theo NV × kỳ:<br>&nbsp;&nbsp;◦ Chưa chi: chưa có khoản nào đã chi<br>&nbsp;&nbsp;◦ Chi một phần: đã chi nhưng còn lại > 0<br>&nbsp;&nbsp;◦ Đã chi: còn lại = 0<br>• Trạng thái phiếu: Nháp → Đã duyệt → Đã chi; nhánh Hủy (chỉ phiếu chưa chi)<br>• Đối chiếu ngân hàng: khớp theo bộ ba (số tài khoản, số tiền, ngày) -> tự đánh dấu Đã chi; dòng lệch phải xử lý thủ công, **không tự làm tròn**<br>• Import kết quả ngân hàng theo Common Rule 14<br>• Ngày chi **chỉ** vào sổ quỹ / dòng tiền quỹ. Chi phí lương trên báo cáo tòa dùng **kỳ lương** cho cả hai biến thể CF/AC: chi tháng 10 vẫn là chi phí lương của kỳ 09 (refer to FR31)<br>• Bảng lương mở lại sau khi đã chi một phần -> tạo phiếu bổ sung hoặc thu hồi, không sửa phiếu đã chi (FR22) |
| **Payment Impact** | • Xem, lọc và xuất không làm thay đổi dữ liệu<br>• Tạo đợt chi: tạo phiếu ở trạng thái Nháp<br>• Gửi duyệt: <span style="color:#CC0000">## (vòng đời phiếu Nháp → Đã duyệt → Đã chi không có trạng thái "Chờ duyệt"; wireframe có nút Gửi duyệt — cần xác nhận trạng thái trung gian)</span><br>• Admin duyệt: -> Đã duyệt<br>• Đánh dấu đã chi hoặc import khớp: -> Đã chi; snapshot số tài khoản; cập nhật Đã chi, Còn lại và trạng thái NV; ghi sổ quỹ<br>• Hủy phiếu chưa chi: -> Hủy, lưu lý do<br>• Thu hồi: tạo phiếu mới số âm liên kết phiếu đã chi<br>• Mọi thao tác ghi audit theo Common Rule 5 |

## 2. Screen 23.1: Chi lương kỳ

<p align="center"><span style="color:#CC0000">Chưa có capture đạt — ảnh ImageGen UI-23-salary-payments.png KHÔNG ĐẠT (AUDIT: số lặp lỗi của UI-22; duyệt 3 cấp do AI tự đặt trong khi spec là Admin duyệt; lệnh 04 chi trùng lệnh 01; lệnh Chờ duyệt mà NV đã Đã chi; thiếu loại phiếu, nội dung CK, băng ④), không dùng. Nội dung dựng từ spec (wireframe UI-23).</span></p>
<p align="center"><b>Screen 23.1: Chi lương kỳ</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| Left Menu, Header | | | • Display follows Common Rule 1<br>• Highlight menu `Chi lương`<br>• Breadcrumb: `Trang chủ / Nhân sự & lương / Chi lương / Kỳ {MM/YYYY}` |
| Tiêu đề | Text | No | • Hiển thị "Chi lương / Kỳ {MM/YYYY}" |
| Nguồn | Text | No | • Content format: "Nguồn: bảng lương kỳ {MM} đã KHÓA · Tổng phải chi {tổng}" và "Đã chi {…} · Còn lại {…}"<br>• Bảng lương kỳ chưa khóa: <span style="color:#CC0000">## (nội dung hiển thị khi chỉ có tạm ứng)</span><br>• <span style="color:#CC0000">Tổng phải chi 198.412.000 trên wireframe chưa đối chiếu được với Seed Data (xem ghi chú Screen 22.1)</span> |
| + Tạo đợt chi | Button | No | • Always display. Đây là CTA chính của màn<br>• Enabled only when người dùng là Kế toán và (bảng lương kỳ Locked, hoặc tạo loại Tạm ứng)<br>• Click on -> Hiển thị khối ② với một đợt chi mới ở trạng thái Nháp <span style="color:#CC0000">(cần xác nhận hiển thị tại chỗ hay mở popup)</span> |
| Import kết quả NH | Button | No | • Always display<br>• Enabled only when người dùng là Kế toán<br>• Click on -> Display Popup import kết quả ngân hàng (Screen 23.2) |
| 🟦 ① Theo nhân viên | | | • Display the list of nhân sự có dòng lương kỳ<br>• Cột Tạm ứng tách riêng để thấy phần đã ứng trước<br>• Tiền theo Common Rule 8; giá trị trống hiển thị `—`<br>• No data: <span style="color:#CC0000">E##</span><br>• Default sorting: <span style="color:#CC0000">##</span><br>• Phân trang theo Common Rule 6<br>• Click on một dòng -> <span style="color:#CC0000">## (xem các đợt chi của NV?)</span><br>• <span style="color:#CC0000">Mâu thuẫn trong spec: wireframe UI-23 ghi thực nhận Huyền 19.284.000 và Linh 17.402.000, trong khi UI-22 và Seed §9.3 ghi Huyền 19.152.297, UI-22 ghi Linh 21.953.000 — cần thống nhất</span> |
| NV | Text | No | • Họ tên nhân sự |
| Thực nhận | Number | No | • Số thực nhận từ bảng lương kỳ (FR22) |
| Tạm ứng | Number | No | • Tổng tạm ứng đã chi trong kỳ |
| Đã chi | Number | No | • Tổng đã chi, gồm cả tạm ứng |
| Còn lại | Number | No | • Thực nhận − Đã chi, ví dụ 19.284.000 − 5.000.000 = 14.284.000 theo wireframe |
| Ngân hàng/STK | Text | No | • Ngân hàng viết tắt và số tài khoản mặc định, che theo Common Rule 2, ví dụ "TCB 1903…21" |
| Trạng thái | Tag | No | • Chưa chi / Chi một phần / Đã chi (Common Rule 4) |
| Đợt gần nhất | Text | No | • Mã đợt chi gần nhất của NV<br>• Có trong danh sách cột spec, wireframe chưa vẽ |
| Page number | Text | No | • Click on a page number -> Go to the corresponding page |
| 🟧 ② Đợt chi {Mã đợt} | | | • Display only when đang tạo hoặc đang xem một đợt chi<br>• Tiêu đề: "Đợt chi {Mã đợt}" kèm Tag trạng thái phiếu, ví dụ "SP-2609-02 · Nháp"<br>• Cách sinh mã đợt: <span style="color:#CC0000">## (ví dụ `SP-2609-02` — cần xác nhận quy tắc)</span><br>• Chọn đợt khác để xem: <span style="color:#CC0000">## (spec chưa có danh sách đợt chi)</span> |
| Loại | Dropdown | Yes | • Always display<br>• Default selection: Thanh toán<br>• Enable only when phiếu ở trạng thái Nháp<br>• Click on -> Display the list of following options:<br>&nbsp;&nbsp;◦ Tạm ứng: chi trước một phần lương, được tạo trước khi khóa kỳ. Select this option -> số tiền mặc định để trống<br>&nbsp;&nbsp;◦ Thanh toán: chi phần còn lại từ bảng lương Locked. Select this option -> số tiền mặc định = Còn lại của từng NV<br>&nbsp;&nbsp;◦ Bổ sung: chi thêm sau khi bảng lương mở lại. Select this option -> <span style="color:#CC0000">##</span><br>&nbsp;&nbsp;◦ Thu hồi: phiếu mới số âm. Select this option -> <span style="color:#CC0000">## (chọn phiếu đã chi để thu hồi?)</span><br>• Allow single selection only |
| Ngày dự kiến | Datepicker | Yes | • Always display<br>• Default selection: <span style="color:#CC0000">## (trong khoảng 20–25 tháng N+1 theo P-18?)</span>; ví dụ 22/10/2026<br>• Date format: DD/MM/YYYY<br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Ngân hàng chi | Dropdown | Yes | • Always display<br>• Default selection: <span style="color:#CC0000">##</span>; ví dụ Techcombank<br>• Click on -> Display danh sách tài khoản chi của công ty <span style="color:#CC0000">(cần nguồn danh mục)</span>. Allow single selection only |
| Nội dung CK | Textbox | No | • Always display<br>• Default: mẫu "LUONG T{MM} <tên NV>", ví dụ "LUONG T09 <tên NV>"; `<tên NV>` được thay theo từng người<br>• Max length: <span style="color:#CC0000">## (giới hạn ký tự của ngân hàng)</span> |
| 🟦 Danh sách NV trong đợt | Checkbox | No | • Mỗi dòng một NV: checkbox, tên, số tiền, ngân hàng/STK (Common Rule 2)<br>• Default status: Checked với NV còn lại > 0; NV đã chi hết hiển thị Unchecked, disabled, kèm "(đã chi ở đợt trước)"<br>• Tick the checkbox -> đưa NV vào đợt; Untick the checkbox -> bỏ NV khỏi đợt; Tổng đợt cập nhật<br>• NV có tạm ứng: kèm ghi chú ⓘ "đã trừ tạm ứng {số tiền}"<br>• Số tiền từng dòng: <span style="color:#CC0000">## (sửa được hay cố định = Còn lại?)</span><br>• Số tài khoản snapshot tại thời điểm chi (BR-3.02.8) |
| Tổng đợt | Text | No | • Content format: "Tổng đợt: {tổng} · {n} người", ví dụ "31.686.000 · 2 người" |
| File đính kèm | File uploader | No | • Có trong field phiếu của spec, chưa có trên wireframe<br>• <span style="color:#CC0000">Supported file format, maximum file size, thời điểm đính kèm: ##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• <span style="color:#CC0000">Click on -> ## (bỏ thao tác tạo đợt, hay "Hủy phiếu chưa chi" theo action spec — cần xác nhận; nếu là hủy phiếu thì danger popup, bắt buộc lý do theo Common Rule 11)</span> |
| Gửi duyệt | Button | No | • Display only when phiếu ở trạng thái Nháp<br>• Enabled only when có ít nhất 1 NV được tick<br>• Click on -> Validate in the following order:<br>&nbsp;&nbsp;◦ If there are any fields with invalid values, display error messages as mentioned above<br>&nbsp;&nbsp;◦ Loại khác Tạm ứng mà bảng lương kỳ chưa Locked -> display error message <span style="color:#CC0000">E##</span><br>&nbsp;&nbsp;◦ If all conditions above are satisfied -> confirm nhẹ kèm checklist (Common Rule 11), gửi đợt cho Admin duyệt |
| Duyệt | Button | No | • Display only when đợt đã gửi duyệt và người dùng là Admin<br>• Always enabled<br>• Click on -> Display Popup duyệt đợt chi (Screen 23.4) |
| Đánh dấu đã chi | Button | No | • Display only when phiếu ở trạng thái Đã duyệt<br>• Enabled only when người dùng là Kế toán<br>• <span style="color:#CC0000">Click on -> Display popup ghi đã chi (ngày thực tế, chứng từ) (Screen ##)</span> |
| Tạo thu hồi | Button | No | • Display only when phiếu ở trạng thái Đã chi<br>• Enabled only when người dùng là Kế toán<br>• Click on -> Tạo đợt chi mới Loại = Thu hồi, số tiền âm, liên kết phiếu gốc <span style="color:#CC0000">(cần xác nhận)</span> |
| 🟧 ③ Đối chiếu ngân hàng | | | |
| Import file kết quả | Button | No | • Always display<br>• Enabled only when người dùng là Kế toán<br>• Click on -> Display Popup import kết quả ngân hàng (Screen 23.2) |
| Quy tắc khớp | Text | No | • Always display<br>• Content format: "Khớp theo (STK, số tiền, ngày) → tự đánh dấu Đã chi" |
| Dòng lệch | Text | No | • Display only when có dòng lệch sau import<br>• Content format: "Lệch: {n} dòng — {NV}, NH báo {số NH} vs phiếu {số phiếu}", ví dụ "Linh, NH báo 17.400.000 vs phiếu 17.402.000"<br>• Không tự làm tròn |
| Xử lý ▸ | Button | No | • Display only when có dòng lệch<br>• Enabled only when người dùng là Kế toán<br>• Click on -> Display Popup xử lý dòng lệch (Screen 23.3) |
| 🟧 ④ Lưu ý ảnh hưởng báo cáo | | | |
| Băng lưu ý | Text | No | • Always display, đặt cố định vì đây là điểm dễ hiểu nhầm nhất<br>• Content format: "Ngày chi CHỈ vào sổ quỹ / dòng tiền quỹ." + "Chi phí lương trên báo cáo tòa dùng KỲ LƯƠNG cho cả hai biến thể → chi tháng 10 vẫn là chi phí lương của kỳ 09" |

## 3. Screen 23.2: Popup import kết quả ngân hàng

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (vùng ③ UI-23 và Common Rule 14).</span></p>
<p align="center"><b>Screen 23.2: Popup import kết quả ngân hàng</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận popup có X icon)</span> | | | |
| Progress Bar | Image | No | • Display the current progress: Upload → Map cột → Validate → Preview → Commit (Common Rule 14)<br>• All current and completed steps are highlighted |
| File kết quả | File uploader | Yes | • Instruction text: <span style="color:#CC0000">##</span><br>• Allow dragging and dropping file, as well as uploading from local device<br>• Click on "Upload" -> Display a popup to select file from local device <span style="color:#CC0000">(Screen capture ##)</span><br>• If clicking out of field while it is blank -> Show error message <span style="color:#CC0000">E##</span><br>• Supported file format: <span style="color:#CC0000">## (định dạng sao kê/kết quả của từng ngân hàng)</span>. If the selected file is in an unsupported format, display error message <span style="color:#CC0000">E##</span><br>• Maximum file size: <span style="color:#CC0000">##</span>. If the file size exceeds the limit, show error message <span style="color:#CC0000">E##</span> |
| 🟦 Preview kết quả | | | • Mỗi dòng file được ghép với phiếu chi theo bộ ba (STK, số tiền, ngày)<br>• Phân loại dòng theo Common Rule 14; với đối chiếu lương: Khớp (sẽ đánh dấu Đã chi), Lệch (cần xử lý thủ công), Không tìm thấy phiếu <span style="color:#CC0000">(cần xác nhận tên nhóm)</span><br>• Cột: <span style="color:#CC0000">## (tối thiểu STK, số tiền NH, ngày, phiếu khớp, kết quả)</span><br>• Ghi mã job import, nguồn và người thực hiện (Common Rule 14) |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không ghi nhận |
| Commit | Button | No | • Always appear<br>• Enabled only when có ít nhất 1 dòng Khớp<br>• Click on -> Đánh dấu Đã chi các phiếu khớp, snapshot STK; dòng lệch hiển thị ở khối ③ Screen 23.1; đóng popup |

## 4. Screen 23.3: Popup xử lý dòng lệch

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (action "ghép giao dịch" và nút Xử lý ▸ UI-23).</span></p>
<p align="center"><b>Screen 23.3: Popup xử lý dòng lệch</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. <span style="color:#CC0000">(cần xác nhận popup có X icon)</span> | | | |
| So sánh | Text | No | • Display hai cột: giao dịch ngân hàng (STK, số tiền, ngày) và phiếu chi (NV, STK snapshot, số tiền, ngày dự kiến)<br>• Tô nổi trường lệch; không tự làm tròn |
| Hướng xử lý | Dropdown | Yes | • Always display<br>• Default selection: None<br>• Click on -> Display the list of following options: <span style="color:#CC0000">## (spec chỉ nêu "ghép giao dịch" — cần danh sách hướng xử lý, ví dụ ghép thủ công với phiếu, tạo phiếu bổ sung/thu hồi phần chênh)</span><br>• Allow single selection only |
| Lý do | Textbox | Yes | • Always display<br>• Allow entering all types of characters. Max length: 255<br>• If clicking out of the field while it is blank -> Show error message <span style="color:#CC0000">E##</span> |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Xác nhận | Button | No | • Always appear<br>• Enabled only when đã chọn Hướng xử lý và nhập Lý do<br>• Click on -> Áp hướng xử lý, ghi audit, đóng popup và cập nhật khối ③ Screen 23.1 |

## 5. Screen 23.4: Popup duyệt đợt chi

<p align="center"><span style="color:#CC0000">Chưa có capture — cần bổ sung. Nội dung dựng từ spec (Admin duyệt đợt chi, P-28, Common Rule 11).</span></p>
<p align="center"><b>Screen 23.4: Popup duyệt đợt chi</b></p>

| **Fields** | **Format** | **Required?** | **Description** |
|:-:|:-:|:-:|:-:|
| 🟧 The popup can be closed by the X icon or by clicking out of the popup. Closing the popup redirects the user to the underlying screen without any changes saved. | | | |
| Tóm tắt đợt | Text | No | • Display mã đợt, loại phiếu, kỳ, số NV, tổng tiền, ngân hàng chi, ngày dự kiến, người tạo<br>• Nguồn: bảng lương kỳ đã khóa (hoặc nhãn "Tạm ứng trước khóa") |
| Danh sách NV | Text | No | • Display từng NV: số tiền, STK (Common Rule 2), ghi chú trừ tạm ứng |
| Hủy | Button | No | • Always appear<br>• Always enabled<br>• Click on -> Đóng popup, không thay đổi dữ liệu |
| Duyệt | Button | No | • Always appear<br>• Enabled only when người dùng là Admin<br>• Click on -> Phiếu chuyển `Đã duyệt`, đóng popup và cập nhật Screen 23.1 |
| Trả sửa / Từ chối | Button | No | • <span style="color:#CC0000">Spec chưa nêu nhánh trả sửa hoặc từ chối đợt chi — cần xác nhận (nếu có thì theo Common Rule 11, bắt buộc lý do)</span> |

## 6. User Steps

| | |
|:-:|---|
| **Pre-condition** | Bảng lương kỳ đã Locked (refer to FR22); người dùng đăng nhập với vai trò Kế toán (flow F-05 bước 5–6) |
| **User steps** | **Step 1:** Click menu `Chi lương` -> display Chi lương kỳ (Screen 23.1)<br>**Step 2:** Click `+ Tạo đợt chi`, chọn loại, ngày, ngân hàng và danh sách NV rồi click `Gửi duyệt` -> display Chi lương kỳ với đợt chờ Admin duyệt (Screen 23.1)<br>**Step 3:** Admin mở đợt, click `Duyệt` -> display Popup duyệt đợt chi (Screen 23.4)<br>**Step 4:** Sau khi chi, Kế toán click `Import kết quả NH` -> display Popup import kết quả ngân hàng (Screen 23.2)<br>**Step 5:** Click `Commit` rồi, nếu có dòng lệch, click `Xử lý ▸` -> display Popup xử lý dòng lệch (Screen 23.3) |

| | |
|:-:|---|
| **Pre-condition** | Bảng lương kỳ chưa khóa; Kế toán cần chi tạm ứng |
| **User steps** | **Step 1:** Tại Screen 23.1, click `+ Tạo đợt chi`, chọn Loại = Tạm ứng rồi click `Gửi duyệt` -> display Chi lương kỳ với đợt tạm ứng chờ duyệt (Screen 23.1) |
