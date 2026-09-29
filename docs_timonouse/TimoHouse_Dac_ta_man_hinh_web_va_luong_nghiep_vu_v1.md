# TimoHouse — đặc tả màn hình web và luồng nghiệp vụ liên thông

Ngày lập: 27/09/2026 · Cập nhật: 29/09/2026 · Trạng thái: **Draft v1.10 để rà soát chức năng** · Phạm vi: web quản trị. Bản này kế thừa các quyết định của người dùng: **hóa đơn theo các sheet `HĐ (...)` của SRC-08, sidebar gộp 5 mục và tổ chức team/leader theo ảnh người dùng gửi ngày 28/09/2026**; phạm vi Báo cáo được mở rộng ở v1.5 theo danh mục khách hàng gửi (SRC-13). Đây là đặc tả chức năng/màn hình, chưa phải thiết kế UI pixel, API hoặc mô hình cơ sở dữ liệu.

> **Thay đổi v1.10 (29/09/2026) — hoàn thiện các mục P1 còn lại, thêm [GĐ]:** (1) **Sửa hóa đơn nháp** (UI-12): sửa chỉ số/SL/hệ số/đơn giá/thành tiền/ghi chú từng dòng, đổi hệ số–đơn giá–thành tiền bắt buộc lý do, lưu lịch sử sửa; sau phát hành chỉ điều chỉnh có lý do. (2) **Phân bổ phiếu thu theo dòng hóa đơn** (UI-13): kế toán nhập số cho từng dòng, không vượt số còn phải thu của dòng, phần dư = chưa phân bổ; lương vẫn tính theo phân bổ cấp hóa đơn. (3) **Trả trước nhiều tháng** (E14): phiếu ghi một lần tại ngày thu, kế hoạch từng kỳ theo tiền phòng tháng, tự áp khi phát hành hóa đơn kỳ đó (ưu tiên dòng 1). (4) **[GĐ] Vượt cọc** (UI-18 E18): BD âm → số chi 0, phần vượt lập **hóa đơn thu riêng** `INV-<kỳ>-<mãKH>-VC` (dòng 13 Thu khác) của lượt thuê → Công nợ UI-14, thu bằng phiếu thu thường; khấu trừ ghi sổ cọc loại "deduct" để số dư cọc về 0. (5) **[GĐ] Khách của chủ nhà** (UI-03/UI-05, OQ-14): phòng loại "Khách của chủ nhà"; khách đóng thẳng cho chủ → kế toán ghi "Chủ nhà đã thu" (số, ngày, căn cứ) → hóa đơn Đủ, không là công nợ; số đó **bù trừ vào kỳ trả chủ nhà** chứa tháng hóa đơn (hết thì kỳ chưa chi kế tiếp), báo cáo dòng 3 tính là đã thu. Phòng "Chủ nhà ở" cho lượt thuê giá thuê 0 (chỉ thu DV). (6) **Tham số** (UI-38): mọi tham số có kiểu/khoảng, giá trị sai bị chặn; `milestones` = 3 mốc ngày + hệ số (lương, dashboard), `zaloRemindBeforeDays`, `refundDeductExtraDays` (tự thêm dòng trừ với lý do theo tham số), `allocDenominator` (systemRooms/allRooms), `breachCharge` (điện / điện+nước) có tác dụng. (7) **Dashboard** (UI-01, OQ-06): phòng trống chỉ đếm phòng có giá thuê; trống sẵn sàng tách khỏi phòng cần dọn; mốc thu chặn tại tổng cần đóng (không quá 100%). (8) **Zalo** (UI-39): quá hạn nhắc từ ngày thành công nợ (ngày 6), không lặp trong `repeatDays`; dự phòng = bản ghi SMS (trạng thái, chi phí) + việc gọi; gửi lại chỉ tin lỗi tạm thời, không nhân đôi hộp thư. (9) **Tòa/phòng** (UI-02/03): sửa hồ sơ tòa (khu vực, địa chỉ, tầng, tình trạng, ngày nhận, nhóm, ngừng khai thác thay xóa), sửa phòng (tầng, loại, m², giá niêm yết/quản lý/cho thuê có ngày hiệu lực + lịch sử, ngày sẵn sàng); cột chủ nhà, tầng, tình trạng, ngày nhận, trạng thái HĐ chủ nhà, LN kỳ; mã tòa duy nhất không phân biệt hoa/thường (nguồn s8/S8, t20/T20, s16/S16, s18/S18 gộp). (10) **Phân công** (UI-24): phạm vi tòa hoặc **phòng**, 6 loại trách nhiệm (vận hành, nhắc thu, thu thực tế, kỹ thuật, vệ sinh, sale), xung đột theo cùng loại + cùng phạm vi, bỏ phân công có ngày; phân công theo phòng → chỉ thấy dữ liệu phòng đó; lương và người phụ trách tòa lấy phân công cấp tòa. (11) **Cài đặt** (UI-38): thêm/sửa/khóa tài khoản (không tự khóa, giữ ≥1 admin), khu vực, TK nhận tiền; danh mục loại chi phí (kèm dòng báo cáo), lý do phá HĐ, chức danh thêm được, mục đã dùng chỉ ngừng dùng; dòng báo cáo và 13 loại phí cố định. (12) **Import** (UI-37): tòa có cột khu vực, nhóm, tầng, ngày nhận; kiểm mã trùng (không phân biệt hoa/thường), nhóm khớp tiền tố, quản lý/khu vực tồn tại, không gán mặc định; nhân viên giữ mã nguồn, chức danh theo danh mục, có SĐT/khu vực.

> **Thay đổi v1.9 (29/09/2026) — sửa số nghiệm thu theo đối chiếu web với Excel của khách:** 1A “1.383 dòng tổng in = tổng cần đóng” → **1.471 hóa đơn kỳ 9** (9 hóa đơn lệch Excel nguồn gắn cờ, UI-11); “106 ca tháng lẻ” → danh sách kiểm được (22 hóa đơn PHÒNG MỚI THÁNG 9, 13 dòng Thu khác, ngoại lệ 304T35, 101G18, 404S4 — §3.12b); khấu hao hoàn cọc theo dữ liệu thực 144/3/1/6 dòng thay “khớp 149/154” (UI-18); 1B Báo cáo tổng tháng 8 nghiệm thu trên số web (DT, giá vốn khớp; chênh chi phí 10.642.770 giải thích hết — UI-29, §7.1), LNR KD web 779.688.893 (UI-30, `OQ-10`); thêm [GĐ]: trạng thái Thừa (§3.12c), phiếu cọc giữ phòng (UI-13), phụ phí phân bổ (UI-16), cọc chuyển phòng (UI-07), khóa kỳ (UI-38), chỉ số theo lượt thuê (UI-10).

> **Thay đổi v1.8 (29/09/2026) — Phase 1 làm được báo cáo tòa và báo cáo tổng/kinh doanh gộp các tòa (yêu cầu người dùng):**
> 1. Đưa vào Phase 1: nhân sự và cơ cấu tổ chức đầy đủ (UI-23, UI-24), bảng lương (UI-25), phân bổ chi phí chung (UI-16), báo cáo tòa (UI-28), Báo cáo tổng (UI-29), Báo cáo kinh doanh (UI-30), UI-27 rút gọn còn hai báo cáo này.
> 2. Thêm §7.1b: ánh xạ **từng dòng** của báo cáo (SRC-04 dòng 3–58, G1 C22–C50) sang màn hình nguồn Phase 1 và các phần phải bổ sung để đủ dữ liệu (cọc bỏ không cần module Kinh doanh, hoa hồng nhập theo phòng, số dư thiết bị cho khấu hao, dữ liệu nhập tay của bảng lương, chốt kỳ cơ bản).
> 3. Phase 1 chia hai mốc: **1A go-live hóa đơn – thu tiền**, **1B chốt tháng đầu tiên** (lương, phân bổ, hai báo cáo) chạy song song Excel.

> **Thay đổi v1.7 (29/09/2026) — phân chia 3 phase triển khai:**
> 1. Thêm **§7**: gán 47 màn hình vào 3 phase theo phụ thuộc dữ liệu §6 — Phase 1 thay file hóa đơn–thu tiền (go-live), Phase 2 thay các file chốt tháng (lương, báo cáo, hoa hồng, chia cổ đông, âm dương, sửa chữa), Phase 3 kế hoạch, tài sản, đầu tư. Mỗi phase có benchmark nghiệm thu và danh sách GĐ cần khách xác nhận trước khi làm.
> 2. Chốt `OQ-17` theo §7; ghi rõ các điểm khác `00_SCOPE_3_PHASE.md` và lý do (§7.4).

> **Thay đổi v1.6 (29/09/2026) — giả định làm việc [GĐ] cho toàn bộ câu hỏi mở:**
> 1. §5 viết lại thành bảng **OQ → giả định làm việc → căn cứ số liệu → độ tin cậy** (OQ-01 → OQ-25); web áp dụng GĐ như tham số cấu hình, đổi được khi khách trả lời khác.
> 2. Thay đổi so với mặc định v1.5: **Báo cáo kinh doanh cộng lại hoàn cọc và có khấu hao** (OQ-10, tháng 8: LNR KD 790.331.663 thay vì 685.928.969); **công nợ tính từ ngày 6 tháng N** và “đúng hạn” = đủ tiền trước hết ngày 5 (OQ-12); **khấu hao 1,6%/tháng cộng dồn** (OQ-11); **phòng không có giá thuê không tính vào lương/HS/lấp đầy** (OQ-14); lương sửa chữa tách phần cố định (phân bổ theo phòng) và tiền công + vật tư (ghi thẳng vào tòa) (OQ-22).
> 3. Định nghĩa đã dùng cho báo cáo: ba loại phòng trống, lấp đầy, thời gian trống, chuyển đổi (OQ-06); HS báo cáo = HS lương (OQ-18); LN/vốn, LN/tài sản, biên LN tiền nhà theo dòng 51 và 59 của báo cáo nhà (OQ-24); doanh số sale (OQ-25); chuỗi chia combo/máy giặt cho điện, nước (OQ-21).
> 4. Sửa phụ lục: SRC-03, SRC-04 đã chuyển vào `bao_cao/`.

> **Thay đổi v1.5 (29/09/2026) — theo tài liệu mới khách hàng gửi trong `docs_timonouse/bao_cao/` (SRC-13 → SRC-16):**
> 1. **Bỏ giới hạn “chỉ hai loại báo cáo”** của v1.3–v1.4. Khách gửi danh mục báo cáo có định nghĩa công thức cho từng báo cáo (SRC-13) → menu Báo cáo thành **trung tâm báo cáo 4 nhóm** (UI-27), thêm UI-40 → UI-46.
> 2. **Dự kiến lợi nhuận** (UI-40, SRC-14): hai loại — **dự kiến dòng tiền** (có cọc mới, hoàn cọc, mua sắm thiết bị) và **dự kiến kinh doanh** (không có cọc mới, hoàn cọc; thiết bị theo khấu hao **1,6%/tháng**); marketing dự kiến = cọc mới / 2.
> 3. **Âm dương điện nước** (UI-43, SRC-15): tổng thu điện = thực thu điện + 1/2 máy giặt + thang máy + máy sấy + xe điện; tổng thu nước = thực thu nước + 1/2 máy giặt; chi lấy từ hóa đơn nhà cung cấp theo tòa (SRC-06).
> 4. **Chi phí sửa chữa, vệ sinh** (UI-44) và màn nhập **sổ sửa chữa – ứng chi vật tư** (UI-47, SRC-16): sổ theo thợ, kỳ 26 → 25, tiền công + vật tư, người chịu chi phí, lương thợ theo bảng kê.
> 5. Định nghĩa mới của HS thực tế/tạm tính cho báo cáo hiệu suất nhân viên vận hành; LN/vốn, LN/tài sản, biên LN tiền nhà, 3 báo cáo chi phí, lấp đầy, phân khúc khách, đúng hạn/quá hạn, chuyển đổi, doanh số sale.
> 6. §5: cập nhật OQ-06, OQ-07, OQ-11; thêm OQ-18 → OQ-25.

> **Thay đổi v1.4 (29/09/2026) — đối chiếu lại với công thức thực tế trong SRC-03/04/05/06/07/08/09/10 và đáp án khách hàng SRC-11:**
> 1. Hóa đơn: thêm bảng ánh xạ mẫu in ↔ sheet nhà ↔ tài khoản nhận (bổ sung mẫu `HĐ G1 (TECH)`); thêm dòng in **Thu khác**; quy tắc tháng lẻ theo **số ngày thực của tháng, tính cả ngày vào**, tách ngày tính tiền phòng và ngày tính dịch vụ; ánh xạ trạng thái Excel ↔ web; hạn thanh toán và mốc chuyển công nợ (§3.4, §3.12).
> 2. Phá HĐ/bỏ cọc/khách chủ nhà: thêm quy tắc và luồng F12 (khách phá HĐ mất cọc, phải thu tiền điện); danh sách phá HĐ; điện nước phòng trống/không thu được.
> 3. Báo cáo: sửa nhận định sai “SRC-04 không có cột từng tòa” — các sheet `BC DT THÁNG 8 NHÀ T/S/G` có báo cáo từng tòa; ghi rõ cơ sở doanh thu (thực thu − hoàn cọc ở dòng tổng, phải thu ở dòng chi tiết); quy tắc ánh xạ dòng; khấu hao cho báo cáo kinh doanh theo SRC-11 câu 15.
> 4. Lương: thay PA-01 bằng quy tắc thực tế của SRC-03 (cận gần nhất, khớp 97/98 dòng); bổ sung TH1/TH2 của mốc 1, định nghĩa C, lương trưởng nhóm, tòa lương cố định, phụ cấp và lương các phòng khác.
> 5. Hoa hồng, cổ đông, chủ nhà, dịch vụ đầu vào, bảo trì: bổ sung quy tắc theo SRC-09/07/10/06 và SRC-11; thêm UI-39 Thông báo Zalo ZNS (SRC-11 câu 34–37).
> 6. Truy vết: bỏ mã `Q-xxx` (không tồn tại trong file câu hỏi), thay bằng `CH-nn` = STT câu hỏi trong SRC-11 hoặc mã `OQ-nn` ở §5 (mã G01–G09 của v1.3 đổi thành OQ-01–OQ-09 để không trùng tên tòa G1–G18; thêm OQ-10–OQ-17).

## 1. Cách đọc và ranh giới

- **[N] Nguồn:** yêu cầu hiện trong file `nội dung làm web Timehouse 31.8.2026(2).xlsx` (SRC-02) hoặc file mẫu SRC-01–SRC-10. **[KH] Khách hàng trả lời:** đáp án trong `Cau-hoi-lam-ro-nghiep-vu-Timehouse.xlsx` (SRC-11), ký hiệu `CH-nn` = STT câu hỏi. **[Đ] Đã chọn:** 7 quyết định của người dùng ngày 27/09/2026. **[P] Đề xuất:** phương án thao tác và chuẩn hóa dữ liệu để triển khai, chờ khách hàng duyệt. **[X] Thực tế Excel:** quy tắc suy ra từ công thức/giá trị của file mẫu, có ghi ô làm bằng chứng; dùng làm benchmark nhưng vẫn cần khách xác nhận khi file có ngoại lệ. Mã `OQ-nn` là câu hỏi còn mở ở §5. **[GĐ] Giả định làm việc (v1.6):** câu trả lời tạm suy ra từ số liệu/công thức của file mẫu cho mỗi `OQ-nn`, áp dụng để triển khai cho đến khi khách xác nhận.
- SRC-02 nêu 10 **nhóm nghiệp vụ**: Tổng quan, Tòa nhà, Thông tin KH, Tài chính chung, Kinh doanh, Nhân sự, Tài liệu, Báo cáo, Cổ đông, Bảo trì/Bảo dưỡng. Theo cập nhật của người dùng, chúng được **gộp trong sidebar 5 mục chính**, chi tiết ở §1.2; đây là tổ chức điều hướng, không bỏ dữ liệu hay action của nhóm nguồn.
- Trong từng mục, dùng **danh sách → chi tiết → tab**. Tòa nhà là nơi xem chủ nhà và phòng; khách/hợp đồng và công nợ gắn với **lượt thuê**. Một phòng có thể có khách khác nhau qua các kỳ; mã phòng hiển thị không thay cho ID khách hoặc ID hợp đồng.
- **Cách làm đã xác định (27/09/2026), áp dụng cho các phase ở §7:** ghi nhận thu/chi thủ công; báo cáo và chia cổ đông theo G1; hoa hồng nhập/import như một loại chi phí (có lưu giá chốt × mức HH để kiểm tra, §3.5); chi phí thiết bị và dịch vụ đầu vào nhập/import ở module Chi phí. Không suy ra thanh toán tự động, đối soát ngân hàng, QR thanh toán, ký điện tử, quyết toán checkout tự động, quy trình duyệt nhiều cấp, kho/SLA/BI nâng cao. **[Đ] OCR hợp đồng khách sau upload** là bổ sung đã xác nhận (CH-10 “nhập dữ liệu tự động từ file”), cần tính riêng vào phạm vi.
- **[KH] Khấu hao (CH-06, CH-15):** khoản đầu tư/mua sắm thiết bị **có khấu hao**; báo cáo dòng tiền (Báo cáo tổng) hạch toán một lần, **Báo cáo kinh doanh hạch toán theo khấu hao**. Đây là thay đổi so với v1.3 (“không khấu hao”). **[X] v1.5:** file dự kiến SRC-14 dùng dòng “Mua sắm thiết bị theo khấu hao” = **tiền mua sắm × 1,6%/tháng** (≈ 62,5 tháng, gần thời hạn 60 tháng của HĐ chủ nhà SRC-10) — dùng làm tỷ lệ mặc định; còn phải chốt khấu hao cộng dồn hay chỉ trên khoản mua trong tháng và cách xử lý khi thanh lý → `OQ-11`. Khấu hao **khi hoàn cọc** là khoản khác: cố định 200.000đ/phòng (CH-17).
- **[KH] Thông báo Zalo (CH-34–CH-37):** dùng **Zalo ZNS**, Timehouse chủ động gửi không cần khách follow, cần công cụ tự đặt điều kiện + thời điểm gửi, phương án dự phòng khi khách chưa liên kết, phản hồi của khách do trưởng phòng phụ trách nhận và **đồng bộ hội thoại** về hệ thống. `00_SCOPE_3_PHASE.md` xếp Zalo vào Phase 1; đặc tả màn hình ở UI-39.
- **[P] Phase (v1.8):** phân chia 3 phase ở **§7**. Điểm khác `00_SCOPE_3_PHASE.md` (nhân sự, tổ chức, bảng lương, phân bổ chi phí, báo cáo tòa và Báo cáo tổng/kinh doanh đưa lên Phase 1; chia cổ đông G1 lên Phase 2; bảo dưỡng định kỳ xuống Phase 3) có lý do ở §7.4.
- **[KH] Phạm vi Báo cáo (sửa v1.5):** v1.3–v1.4 giới hạn ở hai loại `Báo cáo tổng` và `Báo cáo kinh doanh`. Ngày 29/09/2026 khách gửi `bao_cao/báo cáo.xlsx` (SRC-13) có **định nghĩa công thức cho từng báo cáo** và các file mẫu dự kiến, âm dương điện nước, sổ sửa chữa → phạm vi Báo cáo gồm **4 nhóm** ở UI-27: (1) kết quả kinh doanh — LN dòng tiền (= Báo cáo tổng), Báo cáo kinh doanh, dự kiến LN dòng tiền, dự kiến LN kinh doanh, LN/vốn, LN/tài sản, biên LN tiền nhà, chi phí giá vốn/cố định/phát sinh; (2) phòng vận hành — hiệu suất NV vận hành (HS thực tế/tạm tính), lấp đầy và thời gian trống, âm dương điện nước, chi phí sửa chữa/vệ sinh, phân khúc khách, tỷ lệ đóng đúng hạn/quá hạn; (3) phòng kinh doanh — khách hàng/tỷ lệ chuyển đổi, doanh số theo sale; (4) drill-down tòa. Báo cáo nào chưa có công thức hoặc dữ liệu vẫn hiển thị trong danh mục với trạng thái “chờ định nghĩa” (§5), không tự đặt công thức.
- **[Đ] Mẫu hóa đơn:** nội dung bản in/xem trước bám bảng và phần thông báo tại các sheet `HĐ (VP)`, `HĐ (VP-HẰNG)`, `HĐ (TECH)` của SRC-08. `HĐ (HOÀN CỌC)` là mẫu phiếu riêng cho luồng hoàn cọc, không trộn vào hóa đơn tháng.
- Quy tắc bậc lương vận hành đã có benchmark [X] từ SRC-03 (98 dòng tháng 8); các điểm còn mở (HS>100, HS<70, lương 4 phòng khác, thu muộn, mẫu số phân bổ, khấu hao dự kiến, tài sản trong nhà cho LN/tài sản, công thức lấp đầy) giữ ở §5. Màn hình có thể xây cấu trúc dữ liệu trước nhưng **không công bố số tự động là chuẩn** cho phần còn mở.

### 1.1. Vai trò và quyền dự kiến [P]

| Vai trò | Quyền chính trên web | Giới hạn |
|---|---|---|
| Admin | Cấu hình danh mục, tài khoản, phân công; xem toàn hệ thống; sửa dữ liệu theo quyền được cấp | Hành động sửa kỳ đã khóa phải có dòng điều chỉnh và lý do |
| Kế toán | Hóa đơn, phiếu thu, công nợ, chi phí, hoàn cọc, đối chiếu báo cáo, sổ cổ đông/chi trả | Không tự duyệt thay công thức lương mâu thuẫn trong nguồn |
| Quản lý/trưởng khu vực/vận hành | Xem tòa/phòng được giao, lưu trú, chỉ số, trạng thái phòng, nhắc thu, bảo trì | Không xem lương toàn công ty, CCCD và cổ đông ngoài phạm vi |
| Leader/trưởng phòng/trưởng nhóm | Xem cơ cấu và danh sách thành viên trong nhánh phụ trách, công việc và phòng/khoản cần nhắc của team; lọc theo người và theo thời gian | Chỉ thấy dữ liệu trong phạm vi được phân quyền; không tự được quyền sửa phiếu thu, xem lương, CCCD hay dữ liệu cổ đông |
| Kinh doanh/sale | Khách tiềm năng, lượt xem, chốt phòng và doanh số theo phạm vi | Không sửa giao dịch thu tiền kế toán đã ghi |
| Nhân sự/người phụ trách lương | Hồ sơ nhân viên, phân công, bảng lương và điều chỉnh được cấp quyền | Tiền lương chỉ hiển thị cho vai trò có quyền riêng; theo CH-01 mặc định chỉ admin/kế toán |
| Cổ đông [KH CH-23] | Xem Báo cáo tổng/Báo cáo kinh doanh, bảng kê chia UI-32 và lịch đóng tiền UI-33 của các tòa mình góp vốn | Chỉ xem; không thấy dữ liệu khách, lương, tòa không góp vốn |

**[KH] Ràng buộc từ khách hàng:** CH-01 trả lời quyền xem/sửa dữ liệu nhạy cảm (**công nợ, lương, hoa hồng**) là **admin và kế toán**. Vì vậy quyền leader xem công nợ/nhắc thu của team (§3.6, quyết định 28/09) là **ngoại lệ cần khách xác nhận** (`OQ-09`); mặc định Phase 1 leader/NV vận hành chỉ thấy trạng thái Đủ/Thiếu/Chưa TT và số còn nợ của phòng được giao, không thấy báo cáo tổng tiền. CH-03: nhân viên, trưởng nhóm, admin, kế toán được tải hợp đồng khách/chủ nhà lên kho tài liệu. CH-23: **cổ đông, admin, kế toán, trưởng phòng** là người xem Báo cáo tổng/Báo cáo kinh doanh → cần vai trò **Cổ đông (chỉ xem)**, giới hạn các tòa có tỷ lệ góp; CH-17, CH-33: admin + kế toán duyệt số hoàn cọc và kiểm kê.

SRC-02 nêu nhân viên vệ sinh/kỹ thuật là **dữ liệu nghiệp vụ**, chưa chứng minh họ có tài khoản web. Zalo Mini App dành cho khách/quản lý là một bề mặt khác; các thay đổi ở web có thể cấp dữ liệu cho Mini App nhưng không mặc nhiên thêm màn hình web cho khách.

### 1.2. Sidebar gộp và bộ lọc chung

Sidebar ở trạng thái mặc định chỉ hiện **5 mục chính**. Mở một mục mới thấy các lựa chọn cấp 2; trong màn chi tiết dùng tab để tránh thêm cấp 3 ở sidebar. `Cài đặt` và `Import dữ liệu` là tiện ích quản trị ở cuối sidebar, chỉ hiện theo quyền, không tính vào 5 mục nghiệp vụ.

| Mục chính | Mục cấp 2 nhìn thấy trong sidebar | Màn hình/nhóm nghiệp vụ chứa bên trong |
|---|---|---|
| **Tổng quan** | Không có submenu | Dashboard UI-01; click chỉ tiêu đi đến màn nghiệp vụ với bộ lọc tương ứng |
| **Vận hành** | **Tòa nhà** · **Khách thuê** · **Tài sản & bảo trì** · **Tài liệu** | Tòa nhà UI-02–UI-05 có tab chủ nhà/HĐ, phòng, nhân sự tòa và lịch trả; khách thuê UI-06–UI-09 có tab lưu trú, HĐ/OCR, biểu phí, tài chính; tài sản/bảo trì UI-34–UI-36 và sổ sửa chữa/ứng chi vật tư UI-47; kho tài liệu UI-26 |
| **Kinh doanh** | **Tổng quan KD** · **Khách tiềm năng** · **Giao dịch chốt** · **Hoa hồng** | UI-19–UI-22; hoa hồng theo khoản nhập/import, không có engine tính tự động Phase 1 |
| **Tài chính** | **Hóa đơn & thu tiền** · **Chi phí** · **Hoàn cọc** · **Báo cáo** · **Cổ đông** | Hóa đơn/thu/chỉ số/công nợ UI-10–UI-14 dưới các tab; chi phí/phân bổ UI-15–UI-16; hoàn UI-17–UI-18; **trung tâm báo cáo** UI-27 (4 nhóm, chọn báo cáo trong trang, không thêm cấp 3 sidebar) gồm UI-28–UI-30 và UI-40–UI-46; cổ đông UI-31–UI-33 |
| **Nhân sự** | **Nhân sự & lương** | UI-23–UI-25: tab Cơ cấu tổ chức, hồ sơ, phân công theo tòa/phòng và bảng lương trong cùng một mục |

**Quy tắc hiển thị:** vai trò không có quyền thì ẩn mục cấp 2 tương ứng; không hiện menu rỗng. Admin thấy tiện ích `Cài đặt`/`Import`/`Thông báo Zalo` (UI-37–UI-39), người dùng khác chỉ thấy nếu được cấp quyền; hộp thư phản hồi Zalo của trưởng phòng mở từ UI-39 và từ tab khách UI-07. Menu đang mở và mục con hiện tại được tô sáng; breadcrumb như `Tài chính / Hóa đơn & thu tiền / Hóa đơn 501S43` giữ bối cảnh. Khi mở chi tiết từ Dashboard, khách hay tòa, nút quay lại giữ bộ lọc và vị trí trước đó; không tạo bản sao một màn hình ở nhiều mục sidebar.

Ở các danh sách: tìm theo mã tòa/phòng và tên hoặc số điện thoại trong phạm vi được phép; lọc theo kỳ/ngày, khu vực, quản lý vận hành, **leader/trưởng nhóm và nhân viên** theo nhánh tổ chức có hiệu lực, loại tòa T/S/G (**[KH] CH-02: T/S/G là tiền tố mã tòa**, ví dụ T2, S1, G1 — suy ra từ mã, không nhập trường riêng; mã phòng hiển thị = số phòng + mã tòa, ví dụ `501S43`. [X] SRC-08 có mã lệch mẫu như `AS4` (nằm trong sheet NHÀ S), `MBG13`, `S48A`, `S9B`, `000S12` (đồng hồ/phòng chủ nhà) → danh mục tòa vẫn lưu loại T/S/G, mặc định lấy theo sheet nguồn khi import và cho admin sửa) và trạng thái thích hợp; phân trang, sắp xếp, xuất dữ liệu đang lọc kèm kỳ và thời điểm xuất. Các màn có liên kết người phụ trách (phòng, tòa, hợp đồng, hóa đơn/công nợ, nhắc thu, việc bảo trì, lead/deal) áp dụng bộ lọc thống nhất theo §3.6; không ép tất cả màn có cùng vai trò nghiệp vụ. Những trường có dữ liệu nhạy cảm chỉ xuất nếu có quyền. Click số tổng/biểu đồ dẫn tới danh sách giao dịch đã tạo ra số đó với bộ lọc được giữ nguyên. `Ngày thực tế`, `ngày nhập` và `kỳ nghiệp vụ` là ba trường khác nhau ở thu/chi.

## 2. Bản đồ màn hình theo nhóm nghiệp vụ nguồn

`UI-xx` là mã màn hình để tham chiếu trong flow; `SRC-xx` là mã tài liệu nguồn. Một tab trong chi tiết không nhất thiết là route mới; số màn hình ở đây là nhóm giao diện nghiệp vụ, không phải số lượng URL FE cố định.

| Nhóm nghiệp vụ trong SRC-02 | Danh sách/chi tiết và tab | Screen ID | Nguồn |
|---|---|---|---|
| Tổng quan | Dashboard và drill-down chỉ tiêu | UI-01 | SRC-02!Tổng quan!A1:A4 |
| Tòa nhà | Danh sách tòa; chi tiết tòa: tổng quan, phòng, chủ nhà/hợp đồng, tài sản, nhân sự, lịch thanh toán | UI-02–UI-05 | SRC-02!Khu nhà và toàn nhà!A1:D17; SRC-10 |
| Thông tin KH | Danh sách khách/lượt thuê; chi tiết khách: lưu trú, hợp đồng, biểu phí, tài chính; upload/OCR | UI-06–UI-09 | SRC-02!Thông tin khách hàng!E1:G11; SRC-01 |
| Tài chính chung | Chỉ số; hóa đơn tháng theo mẫu sheet Excel; phiếu thu; công nợ; chi phí/phân bổ; hoàn cọc; phá HĐ; điện nước phòng trống | UI-10–UI-18 | SRC-02!Tài chính chung!A1:E40; SRC-08 (NHÀ T/S/G, G16–G18, PHÒNG MỚI, cập nhật thu tiền, DS phòng phá hđ, ĐIỆN NƯỚC PHÒNG TRỐNG, HOÀN CỌC), SRC-06, SRC-07 |
| Kinh doanh | Tổng quan hàng hóa; khách đã xem; giao dịch chốt; hoa hồng/nhân sự sale | UI-19–UI-22 | SRC-02!KINH DOANH!A1:C41; SRC-09 |
| Nhân sự | Danh sách, chi tiết/phân công, bảng lương | UI-23–UI-25 | SRC-02!NHÂN SỰ!A1:C9; SRC-03, SRC-05 |
| Tài liệu | Tra cứu hồ sơ gắn đối tượng | UI-26 | SRC-02!menu chính!B8 |
| Báo cáo | Trung tâm báo cáo 4 nhóm; báo cáo tổng (LN dòng tiền); báo cáo kinh doanh; drill-down tòa; dự kiến LN; hiệu quả vốn/tài sản/tiền nhà; báo cáo chi phí; âm dương điện nước; sửa chữa/vệ sinh; báo cáo vận hành; báo cáo khách hàng & doanh số | UI-27–UI-30, UI-40–UI-46 | SRC-13 (danh mục + công thức); SRC-04!BÁO CÁO TỔNG/KINH DOANH THÁNG 8, **BC DT THÁNG 8 NHÀ T/S/G**; SRC-07; SRC-14 dự kiến; SRC-15 âm dương; SRC-16 sổ sửa chữa |
| Cổ đông | Cổ đông/tỷ lệ, bảng chia G1, lịch góp và chi thực | UI-31–UI-33 | SRC-02!TT CỔ ĐÔNG!A2:F5; SRC-07 |
| Bảo trì/Bảo dưỡng | Thiết bị/tài sản, lịch bảo dưỡng, kiểm kê; sổ sửa chữa – ứng chi vật tư | UI-34–UI-36, UI-47 | SRC-02!BẢO TRÌ BẢO DƯỠNG!A1:B5; SRC-16 |
| Tiện ích quản trị | Import dữ liệu, danh mục/cấu hình và quyền; thông báo Zalo ZNS | UI-37–UI-39 | SRC-02 và yêu cầu nhập nguồn; SRC-11 CH-34–CH-37; [P] |

Bảng này truy vết **10 nhóm nguồn**, không phải 10 mục đang hiển thị trong sidebar. Mọi screen ID được ánh xạ sang 5 mục ở §1.2; các tab phòng, hợp đồng, chỉ số, công nợ, phân bổ và lương không chiếm thêm vị trí ở sidebar.

## 3. Đặc tả từng màn hình

### 3.1. Tổng quan

**UI-01 — Dashboard** `[N] SRC-02!Tổng quan!A1:A4`

- **Hiển thị:** kỳ hoặc ngày chốt; tổng phòng trống ở ngay/trống cuối tháng/đang chờ, tổng doanh thu với tách tiền nhà/cọc mới/phá HĐ; tiến độ phải thu, đã thu, nợ và phần trăm thu theo thời điểm; tòa cần xử lý; nhắc hợp đồng sắp hết hạn. Mỗi chỉ tiêu có nguồn/kỳ và nhãn “thực tế/tạm tính” khi dùng số chưa chốt.
- **Bộ lọc:** khu vực, quản lý, trưởng nhóm/leader theo SRC-02; [P] thêm kỳ, loại T/S/G. Chọn leader → tập người và phòng/công việc liên quan theo hiệu lực và loại trách nhiệm ở §3.6; mọi chỉ số dùng cùng phạm vi lọc, không cộng lặp phòng có nhiều người phụ trách, không tính phòng trống từ hóa đơn bằng 0.
- **Action → luồng:** click phòng trống → UI-03 danh sách phòng lọc trạng thái; click doanh thu → UI-27 báo cáo theo cơ sở tương ứng; click công nợ/tiến độ → UI-14/UI-13; click hợp đồng gần hết → UI-06. Dashboard chỉ đọc, không tạo giao dịch.
- **[X] Tiến độ thu theo mẫu `SRC-08!cập nhật thu tiền`:** theo quản lý và theo tòa: DT phải thu, thực thu, tỷ lệ thu; **DT phá HĐ, DT phá HĐ thu được, tỷ lệ thu phá HĐ, tỷ lệ DT phá HĐ/DT phải thu**; **DT phải thu sau phá HĐ = phải thu − thực thu − (DT phá HĐ − DT phá HĐ thu được)**; ảnh chụp lũy kế thực thu tại **mốc ngày 5, 10, 15** (tháng 9: 89,0% / 97,9% / 98,4%). Khoản phá HĐ tách khỏi tỷ lệ thu chính (quy tắc §3.12).
- **[KH] Hiệu suất (CH-22):** `HS thực tế` = hiệu suất tính sau khi đã thu tiền xong kỳ; `HS tạm tính` = hiệu suất tính tại thời điểm xem. **[KH] Công thức SRC-13 (v1.5):** `HS thực tế = (tổng DT tiền nhà thu được trong 3 mốc + khoản bỏ cọc) / giá niêm yết`; `HS tạm tính = (DT tiền nhà + DT bỏ cọc tại thời điểm tính) / giá niêm yết`. Đây là “báo cáo hiệu suất của nhân viên vận hành” (UI-45), cùng gốc với HS lương UI-25 nhưng câu chữ SRC-13 không trừ tỷ lệ dịch vụ B như bảng lương (`OQ-18`). HS **không** phải tỷ lệ lấp đầy.
- **[GĐ OQ-06] Ba nhóm phòng trống:** `trống ở luôn` = phòng trống sẵn sàng, chưa có deal; `trống hết tháng` = phòng có lượt thuê kết thúc trong tháng (hết HĐ, báo trả, phá HĐ), trống từ cuối tháng; `đang chờ` = đã chốt cọc, khách chưa vào ở (ví dụ 26 phòng của `PHÒNG MỚI THÁNG 10`). Phòng không có giá thuê (chủ nhà ở) không đếm.

### 3.2. Tòa nhà, chủ nhà và phòng

**UI-02 — Danh sách tòa nhà** `[N] SRC-02!Khu nhà và toàn nhà!A1:D17`

- **Cột:** mã/tên tòa, địa chỉ/khu vực, nhóm T/S/G, chủ nhà, số tầng/phòng, tình trạng nhà (mới/trung bình/cũ), trưởng khu vực/quản lý, ngày nhận vận hành, trạng thái hợp đồng chủ nhà, số phòng đang thuê/trống, chi phí thuê tháng, hiệu suất/lợi nhuận kỳ.
- **[X] Nguồn hiệu suất/lợi nhuận từng tòa:** SRC-04 đã có báo cáo lãi/lỗ **từng tòa** ở `BC DT THÁNG 8 NHÀ T` (35 tòa, cột D:AL), `NHÀ S` (52 tòa, D:BC), `NHÀ G` (11 tòa, D:N), cùng bố cục dòng với Báo cáo tổng (lệch xuống 1 hàng). Lợi nhuận tòa = LNR của cột tòa đó; hiệu suất tòa = HS theo CH-22/UI-25. Công thức “Thời gian vận hành” và định nghĩa hiệu suất trên danh sách tòa khách hẹn trao đổi trực tiếp (CH-07) → `OQ-06`. Hàng 3 của sheet T/S có mã `L1/L2/L3` (16 tòa S để trống) — [P] hiểu là nhóm phòng vận hành 1/2/3, cần xác nhận trước khi dùng làm bộ lọc.
- **Action:** thêm/sửa hồ sơ tòa, mở chi tiết UI-03, lọc theo người/khu vực/loại, import phòng qua UI-37, xem báo cáo nhà UI-28. Mã tòa là duy nhất theo quy tắc danh mục; không xóa tòa đã có hợp đồng/giao dịch, dùng ngừng khai thác và giữ lịch sử.

**UI-03 — Chi tiết tòa nhà** `[N] SRC-02!Khu nhà và toàn nhà!D7:D16`

- **Tab Tổng quan:** địa chỉ, diện tích, số tầng/phòng, trạng thái kỹ thuật, ngày vận hành, đăng ký kinh doanh, PCCC, ảnh/tài liệu, chủ nhà, số phòng theo trạng thái, giá trị hiệu suất/lợi nhuận theo kỳ.
- **Tab Phòng:** mã phòng/tầng/loại/diện tích, giá niêm yết, giá quản lý nếu có, giá đang cho thuê, trạng thái sử dụng, ngày sẵn sàng, hợp đồng/lượt thuê hiện tại, chỉ số gần nhất. Mở từng phòng để xem lịch sử lượt thuê, ảnh, tài sản và chỉ số; thêm/sửa phòng, đổi trạng thái kèm ngày và lý do, không ghi đè hợp đồng cũ.
- **[X] Loại khai thác phòng** (SRC-08 ghi chú hóa đơn): `Timehouse cho thuê` (mặc định); `Phòng chủ nhà ở` (không thu tiền phòng, chỉ thu dịch vụ, thường thanh toán theo quý — 203T35, 000S12, 000S30…); `Khách của chủ nhà` ở tòa mới nhận (G15, G17): khách có thể đóng cho Timehouse hoặc **đóng thẳng cho chủ nhà** (501–602G17 “đã đóng tiền tháng 9 cho chủ nhà”); `Đồng hồ/khu chung` (mã `000…`). Loại này quyết định dòng hóa đơn, cách tính công nợ (khoản đã đóng cho chủ nhà không phải nợ khách) và có tính vào số phòng lương/báo cáo hay không. **[GĐ OQ-14]** phòng **không có giá thuê** không tính vào số phòng lương, HS, lấp đầy; phòng có giá thuê (kể cả chủ nhà ở, khách của chủ nhà) có tính — khớp bảng lương T8: S36 11 phòng → tính lương 10 (loại 701S36 giá 0), S4 23 → 22 (loại 101AS4), T35 18 → 18 (203/204T35 có giá).
- **[KH] CH-21:** phòng phát sinh do hoàn cọc/phá HĐ phải qua bước **kiểm tra/dọn dẹp** trước khi về trạng thái `trống sẵn sàng` cho sale.
- **Tab Nhân sự:** trưởng khu vực/leader, vận hành, vệ sinh, kỹ thuật; phạm vi tòa/phòng, loại trách nhiệm, ngày bắt đầu/kết thúc phân công; liên kết UI-23 cơ cấu và UI-24 lịch sử để cập nhật. **Tab Tài sản:** liên kết UI-34. **Tab Tài chính:** nghĩa vụ thuê nhà, hóa đơn khách, chi phí/phân bổ và báo cáo UI-28. Không nhập lại cùng một khoản ở tab khác.
- **Tab Dịch vụ đầu vào** `[N] SRC-06!năm 2026`: mỗi tòa có danh sách hợp đồng với nhà cung cấp theo 3 khối **Điện** (mã KH EVN `PD…`, một tòa có thể nhiều mã), **Nước** (mã Viwaco hoặc “Hóa đơn” không mã), **Mạng** (mã HĐ); mỗi mã có **chủ hợp đồng** (điện/nước thường đứng tên chủ nhà, mạng đứng tên nhân sự Timehouse), phương thức trả (`tt tự động`, `đã tt cho chủ nhà`, `ko có`) và số tiền hóa đơn theo tháng. Mã KH là khóa khi import số tiền tháng sang chi phí UI-15. File không có chỉ số kWh/m³ — chỉ số phòng vẫn nhập ở UI-10.
- **Action liên thông:** phòng có trạng thái sẵn sàng → UI-20/UI-21 để sale ghi lượt xem/chốt; phòng đã chốt nhưng chưa nhận giữ trạng thái sử dụng và giao dịch chốt riêng; bàn giao cho khách tạo lượt thuê ở UI-07. Hợp đồng tòa là UI-04, lịch trả UI-05.

**UI-04 — Chủ nhà và hợp đồng thuê đầu vào** `[N] SRC-02!Khu nhà và toàn nhà!D3:D5; SRC-10 Điều 1–7`

- **Dữ liệu chủ nhà:** tên/pháp nhân, giấy tờ định danh, số điện thoại, địa chỉ liên hệ, tài khoản nhận tiền, đồng chủ thể nếu hợp đồng có, hồ sơ sổ đỏ. **Hợp đồng:** mã, tòa, ngày ký/bàn giao/bắt đầu thuê/kết thúc, giá thuê theo giai đoạn, thuế theo thỏa thuận, số cọc, kỳ và hạn trả, thời gian giữ giá, PCCC, người nhập nguồn, điều khoản cần theo dõi, phụ lục/file gốc, trạng thái hiệu lực.
- **Action:** tạo/chỉnh hợp đồng hoặc phụ lục, tải file, ghi nhận giá mới có ngày hiệu lực, ghi nhận cọc đã giao là **dòng tiền cọc chủ nhà riêng** có chứng từ tại UI-15; xem lịch nghĩa vụ UI-05. Không mặc nhiên xếp cọc vào chi phí lợi nhuận. Giá thuê theo tháng cho báo cáo tách khỏi kỳ trả 3 tháng. Không dùng giá/cọc của hợp đồng demo SRC-10 làm mặc định cho các tòa khác.
- **Kiểm tra:** một tòa có thể có nhiều phiên bản hợp đồng theo thời gian; ngày hiệu lực không chồng lấp bất hợp lý; cọc là khoản một lần, không nhân thành tiền thuê mỗi tháng; quyền xem giấy tờ và tài khoản bị hạn chế.
- **Truy vết nguồn (sửa v1.4):** “giá theo giai đoạn” và “thời gian giữ giá” lấy từ SRC-02!D4 và **[KH] CH-05: thời gian giữ giá = thời gian chủ nhà không được tăng giá với Timehouse**; hợp đồng mẫu SRC-10 chỉ có giá cố định (114.000.000/tháng, 60 tháng).
- **[N] Trường bổ sung từ SRC-10:** bên A/bên B (họ tên, CCCD, ngày cấp, SĐT, HKTT — bên B là cá nhân đại diện Timehouse), số giấy chứng nhận, số tầng, diện tích sàn; thời hạn và **mốc báo gia hạn (ưu tiên gia hạn nếu thỏa thuận trước 3 tháng)**; **kỳ trả (SRC-10: 3 tháng; CH-08: đa số 3 tháng, có nhà 4 hoặc 6 tháng) và hạn trả dạng khoảng ngày (SRC-10: ngày 01–10 tháng đầu kỳ)**; bên chịu thuế nhà đất/TNCN (bên A); bên tự trả dịch vụ cho nhà cung cấp (bên B, liên kết tab Dịch vụ đầu vào UI-03); điều khoản phạt/bồi thường (chậm 1 tháng bên A lấy lại nhà; bên B tự chấm dứt mất cọc và bồi 3 lần cọc; bên A hủy: SRC-10 Điều 6.1 bồi 3 tháng tiền thuê nhưng Điều 10.4 ghi hoàn cọc + bồi 3 lần cọc — **mâu thuẫn trong mẫu**, lưu nguyên văn điều khoản, không tự tính); PCCC/ĐKKD do bên A lo. **Phụ lục bàn giao** (13 hạng mục, số lượng, tình trạng) tạo tài sản nguồn `chủ nhà` ở UI-34; **phụ lục 3 bên góp vốn** liên kết cổ đông UI-31.

**UI-05 — Lịch đóng tiền chủ nhà** `[N] SRC-02!Khu nhà và toàn nhà!A17; SRC-10 Điều 4–5`

- **Cột:** hợp đồng/tòa, kỳ từ–đến, số tháng, hạn thanh toán, giá áp dụng, tổng phải trả, đã chi, còn phải trả, trạng thái đúng hạn/quá hạn, chứng từ chi. **Action:** xem lịch phát sinh từ điều khoản, kế toán ghi khoản chi thủ công và gắn kỳ/chứng từ; sửa lịch bằng phụ lục có hiệu lực, xuất danh sách đến hạn.
- **Liên thông:** khoản chi là dữ liệu gốc ở UI-15; báo cáo UI-27/UI-28 lấy chi phí thuê theo cơ sở kỳ của mẫu SRC-04/SRC-07 (**thuê nhà 1 tháng**, ví dụ G1 C22 = 48.000.000, dù trả 3 tháng/lần). Chưa tính tự động kế toán chủ nhà hoặc bank reconciliation như một phân hệ riêng.
- **[KH] Nhắc hạn (CH-08):** có nhắc tự động Timehouse đến lịch/kỳ trả tiền chủ nhà; số ngày nhắc trước [P] cấu hình, mặc định 7 ngày như CH-32. **[KH] CH-29:** lịch đóng tiền nhà được chia cho cổ đông theo tỷ lệ % góp vốn → mỗi kỳ trả chủ nhà sinh các dòng phải góp của từng cổ đông ở UI-33.
- **[X] Khách của chủ nhà đóng thẳng cho chủ:** nếu khách thuê thuộc chủ nhà đã trả tiền tháng cho chủ (SRC-08 G17), khoản này ghi là **bù trừ** với nghĩa vụ trả chủ nhà của kỳ, không để thành công nợ khách (`OQ-14`).

### 3.3. Khách thuê, hợp đồng và OCR

**UI-06 — Danh sách khách/lượt thuê** `[N] SRC-02!Thông tin khách hàng!G1:G6`

- **Cột:** mã tòa/phòng, ID lượt thuê/hợp đồng, khách đại diện, số điện thoại theo quyền, trưởng khu vực/quản lý, ngày bắt đầu/kết thúc, trạng thái hợp đồng (đang thuê, phá HĐ, sắp hết hạn, đã kết thúc), nợ, trạng thái cọc/hoàn cọc, liên kết Zalo. Lọc theo tòa/kỳ/trạng thái và mốc hết hạn 35 ngày.
- **Action:** mở UI-07, tạo khách và lượt thuê từ giao dịch chốt UI-21 hoặc trực tiếp theo quyền, xem nợ UI-14, nhắc xử lý hết hạn. `Sắp hết hạn` là cảnh báo tính từ ngày kết thúc, không biến trạng thái hợp đồng thành đã hết hiệu lực; **[KH] CH-09: mốc 35 ngày cố định toàn hệ thống**. Không gộp khách cũ và khách mới chỉ vì cùng mã phòng — [X] trong SRC-08 tháng 9 có 20 phòng xuất hiện hai lần cùng kỳ: dòng khách cũ “phá hđ” ở sheet NHÀ và dòng khách mới ở `PHÒNG MỚI THÁNG 9`.
- **Chế độ xem `Phá HĐ`** `[X] SRC-08!DS phòng phá hđ`: STT, mã phòng, quản lý, ngày bắt đầu vào ở, số tháng đã ở, **lý do phá HĐ** (tháng 9: bỏ trốn 7, về quê, chuyển chỗ làm/chỗ học, không đủ tài chính…), SĐT theo quyền, tổng phải thu theo quy tắc phá HĐ (§3.12), tổng đã thu; tổng dòng phải thu/đã thu (tháng 9: 16.048.000 / 3.662.000).

**UI-07 — Chi tiết khách và lượt thuê** `[N] SRC-02!Thông tin khách hàng!G7:G11; SRC-01`

- **Tab Lưu trú:** tên, CCCD/thông tin định danh (ẩn theo quyền), liên hệ, nghề nghiệp, người ở cùng, số người, xe/loại/biển số, tòa/phòng, ngày nhận phòng, ngày bắt đầu tính tiền, ngày hết hạn, số lần gia hạn, thông tin tạm trú theo hồ sơ. **Tab Hợp đồng/giá:** file, trạng thái OCR, ngày ký, thời hạn, giá phòng, cọc, kỳ/hạn trả, bảng phí có hiệu lực, lịch sử phụ lục; mở UI-08/UI-09. **Tab Tài chính:** hóa đơn, các lần thu, nợ, cọc, phiếu hoàn UI-18; dữ liệu lấy từ giao dịch nguồn.
- **Action:** chỉnh trường có quyền và ghi lý do, thêm người ở/xe có ngày hiệu lực, gia hạn bằng phiên bản/phụ lục mới, chuyển phòng tạo lượt thuê mới có liên kết lượt cũ, kết thúc thuê đổi trạng thái và mở phiếu hoàn thủ công UI-18. Hợp đồng đã kết thúc vẫn xem được lịch sử.
- **Kết thúc thuê bắt buộc chọn loại** [X] theo ghi chú SRC-08: `Hết hạn HĐ` → hoàn cọc UI-18; `Phá HĐ` (kèm lý do) và `Bỏ trốn` → **không hoàn cọc**, lập khoản phải thu theo §3.12; `Bỏ cọc` (đã cọc nhưng không vào ở) → cọc thành doanh thu “cọc khách bỏ không ở”; `Chuyển phòng` (“chuyển lên P501”) → lượt thuê mới liên kết; `Ở nhờ` tạm phòng khác (“kh P201S29 ở nhờ … từ 8/9”) → lượt thuê tạm có giá riêng. Ngày báo trả, ngày bàn giao và ngày ngừng tính tiền là các trường riêng.
- **[KH] CH-12:** số xe/biển số **không giới hạn** và **tự liên kết** sang dòng phí gửi xe/xe điện của hóa đơn theo biểu phí UI-09. **[KH] CH-25:** phân khúc khách (sinh viên/người đi làm) lấy theo dữ liệu trên hợp đồng (nghề nghiệp). **[KH] CH-11:** khách trả lời nội dung tab Tài chính “chưa có” → giữ phạm vi v1.3 (hóa đơn, các lần thu, nợ/dư, cọc, phiếu hoàn) cho đến khi có yêu cầu thêm.
- **Điều kiện:** ngày ký, bàn giao, ngày tính tiền, tháng hóa đơn và ngày thực thu riêng. Cọc cũ khi chuyển sang phòng mới chỉ hoàn/khấu trừ theo phương án được khách xác nhận (`BR-DEP-013` trong quyết định dự án trước), không tự chuyển số dư bằng đổi mã phòng.
- **[GĐ] Cọc khi chuyển phòng (v1.9):** theo phương án khách xác nhận — (1) chuyển **toàn bộ cọc đang giữ** sang lượt thuê mới (thiếu thì thu ở hóa đơn đầu/phiếu cọc), hoặc (2) chuyển **đúng số cọc phòng mới** và lập phiếu hoàn phần dư (UI-18).

**UI-08 — Upload hợp đồng và bàn rà soát OCR** `[Đ] DEC-07; SRC-01 Điều 1–4`

- **Bước 1:** upload PDF/ảnh hợp đồng khách, gắn UI-07 hoặc giao dịch UI-21, kiểm tra loại file/trang, lưu bản gốc; trạng thái `mới tải` → `đang trích xuất` → `chờ rà soát` hoặc `không đọc được`.
- **Bước 2:** xem file gốc ở bên cạnh các trường OCR; mỗi trường có giá trị, trang/vùng nguồn, mức tin cậy và dấu đã sửa. Nhóm bắt buộc: người thuê/liên hệ, tòa/phòng, các ngày ký/nhận/tính tiền/hết hạn, giá phòng, số cọc, khoản đã trả, kỳ/hạn thanh toán; bảng phí gồm điện, nước, mạng, thang máy, dịch vụ chung, sạc/gửi xe và đơn vị tính; số điện/nước đầu kỳ, người/xe nếu có.
- **Bước 3:** nhân viên sửa và xác nhận từng nhóm; chỉ khi trường bắt buộc đủ và biểu phí được rà soát mới **Áp dụng vào hợp đồng/biểu phí UI-09**. Lưu người xác nhận, thời điểm, bản OCR gốc và bản sửa. Nút “Chạy lại OCR” tạo phiên đọc mới, không ghi đè giá/hóa đơn đã phát hành. Không có `tự cập nhật` trực tiếp vào hóa đơn khi chưa rà soát.
- **Ngoại lệ:** file mờ/thiếu trang hoặc nhiều giá dịch vụ cùng tên cho nhập tay có chứng cứ; hợp đồng tải lên nhưng chưa xác nhận OCR vẫn có thể lưu file ở UI-26, biểu phí chưa có hiệu lực để tính hóa đơn.

**UI-09 — Biểu phí và kỳ áp dụng theo hợp đồng** `[N] SRC-02!Thông tin khách hàng!G8:G10; SRC-01 Điều 4.2; SRC-08`

- **Mỗi dòng:** loại phí, phương pháp tính (`đồng/kWh`, `đồng/m³`, `đồng/người`, `đồng/phòng`, `đồng/xe`, cố định hoặc công thức riêng có kiểm soát), đơn vị, đơn giá, số lượng mặc định, đối tượng sử dụng/nhóm điện chung, ngày hiệu lực/hết hạn, file/trang hợp đồng nguồn, trạng thái xác nhận. Giá phòng/đặt cọc hiển thị trong cùng bảng điều kiện hợp đồng nhưng giữ loại khoản riêng.
- **Action:** xác nhận từ OCR, sửa/tạo phiên biểu phí theo phụ lục, xem trước dòng phí kỳ dự kiến, kiểm tra chồng lấp khoảng hiệu lực. Nước theo người ở hợp đồng SRC-01 và nước theo m³ ở mẫu hoàn cọc SRC-08 là hai lựa chọn hợp lệ tùy hợp đồng. Thay đổi chỉ áp dụng hóa đơn chưa phát hành; UI-12 lưu giá snapshot trên từng dòng.
- **[X] Giá phòng trong SRC-08:** `Giá niêm yết` (G), `Giá QL` (H), `Giá phòng hiện tại` (I). **[KH] CH-13:** giá niêm yết = giá tiêu chuẩn Timehouse; giá cho thuê = giá thực tế khách đang thuê. **Hỗ trợ giá** có thời hạn (26 ghi chú, ví dụ “hỗ trợ giá 4tr đến hết hđ”, “hỗ trợ wifi”) lưu là phiên bản giá/phí có ngày hết hiệu lực và lý do, không sửa đè giá niêm yết.
- **[X] Hai ngày bắt đầu tính tiền:** `Ngày tính tiền phòng` và `Ngày bắt đầu tính dịch vụ` là hai trường riêng (SRC-08 cột K “Ngày ở”, L “Ngày DV”; ghi chú “15/9 mới tính dv”, “k tính dv tháng 7”). Quy tắc chia ngày ở §3.12.
- **[X] Ánh xạ loại phí** — SRC-02 liệt kê “điện, nước, mạng, thang máy, dịch vụ chung, phí sạc xe điện, phí gửi xe”, còn sheet hóa đơn và mẫu in dùng bộ khác:

| Loại phí web | Cột sheet NHÀ T/S/G (SL · đơn giá · thành tiền) | Dòng mẫu in `HĐ (...)` | Ghi chú |
|---|---|---|---|
| Điện riêng | P CS cũ · Q CS mới · R SL · S · T | 3 Điện (số) | kWh = CS mới − CS cũ |
| Nước | U CS cũ · V CS mới · W SL · X · Y | 4 Nước (khối) | theo m³ (35.000đ) hoặc theo người (90.000–120.000đ) |
| Vệ sinh | Z · AA · AB | 5 DV Vệ sinh | |
| Mạng | AC · AD · AE | 6 DV Internet (phòng) | |
| Thang máy | AF · AG · AH | 7 DV Thang máy (người) | |
| **Xe điện / gửi xe** | AI · AJ · AK (tiêu đề sheet “XE ĐIỆN”) | 8 “DV Gửi xe” | SRC-02 tách “sạc xe điện” và “gửi xe” nhưng file chỉ có một cột → web cho 2 loại phí, mẫu in giữ 1 dòng nếu khách không đổi mẫu (`OQ-15`) |
| Máy giặt/sấy | AL · AM · AN | 9 Máy giặt/Máy sấy | |
| Combo/DV khác (“dịch vụ chung”) | AO · AP · AQ | 10 DV Combo/DV khác | Báo cáo chia đôi cột này vào vệ sinh và máy giặt (§3.8) |
| Điện chung | AR · AS · AT | 12 Điện chung | xem điện vệ sinh chung UI-10 |
| Nợ cũ | M | 11 Nợ cũ | không phải doanh thu dịch vụ |
| **Thu khác** | N | **13 Thu khác (bổ sung v1.4)** | tiền ngày lẻ tháng trước, §3.12 |
| Cọc mới | J | 2 Tiền cọc phòng | không chia ngày |

### 3.4. Tài chính chung

**UI-10 — Nhập chỉ số và số lượng kỳ dịch vụ** `[N] SRC-08!NHÀ T/S/G, ĐIỆN NƯỚC PHÒNG TRỐNG; SRC-01 Điều 4` (v1.4: bỏ tham chiếu SRC-06 vì file đó không có chỉ số)

- **Dòng:** kỳ sử dụng, tòa/phòng, khách/lượt thuê, đồng hồ/loại dùng riêng hay chung, chỉ số trước/sau, tiêu thụ, ảnh/chứng cứ tùy có, số người/số xe/đăng ký mạng, người ghi, ngày đo và ngày nhập. Xem giá/method tại UI-09 để kiểm tra chứ không nhập lại giá mới vào chỉ số.
- **Action:** nhập tay theo tòa/kỳ, import có xem trước UI-37, kiểm tra chỉ số giảm/trùng kỳ/thiếu phòng, ghi điều chỉnh có lý do, khóa khi đã đưa vào hóa đơn. Chỉ số đầu kỳ của khách mới từ hợp đồng/bàn giao, không lấy chỉ số cuối của khách cũ làm nợ của khách mới.
- **[GĐ] Chỉ số gắn lượt thuê (v1.9):** chỉ số điện/nước gắn **lượt thuê**; khách mới bắt đầu dịch vụ sau ngày chốt kỳ không có dòng điện/nước theo chỉ số ở kỳ đó (không lấy chỉ số của khách cũ).
- **Đầu ra:** dữ liệu cho dòng phí biến đổi UI-11. Điện chung/nhóm sử dụng cần quy tắc phân bổ cấu hình theo nhóm phòng; chưa tự áp một công thức cho mọi tòa.
- **[X] Điện vệ sinh chung** (SRC-08 khối `Điện vệ sinh chung` CA:CH ở NHÀ T/S, BW:CC ở PHÒNG MỚI): CS cũ, CS mới, SL, đơn giá (3.800–4.000đ), thành tiền, **số người sử dụng**, **số tiền mỗi người phải đóng**. Hai cách chia đang dùng: chia đều theo số phòng dùng chung (`=CE/2`, `=CA/3`) hoặc **theo tổng số người các phòng dùng chung** (`=CE/(O_a+O_b)`). Web cấu hình nhóm dùng chung (danh sách phòng + cách chia) và sinh dòng 12 “Điện chung” cho từng phòng.
- **[X] Điện nước phòng trống / không thu được** (sheet `ĐIỆN NƯỚC PHÒNG TRỐNG`): với phòng trống (`PT`) và phòng khách phá HĐ không thu được, vẫn nhập chỉ số điện/nước, thành tiền theo đơn giá, ghi chú lý do. Khoản này **không tạo hóa đơn khách** mà là số hao hụt đưa vào đối chiếu thu–chi điện nước dịch vụ theo tòa (SRC-02!Tài chính chung!E29), báo cáo âm dương điện nước UI-43 và chi phí dịch vụ đầu vào UI-15. [X] SRC-15 đang cộng khoản này vào “thực thu điện” — xem `OQ-20`. Tháng 9: điện 1.455 số = 5.820.000đ; nước 10 m³ = 350.000đ.
- **[X] Phòng hết HĐ trong kỳ:** khối `ĐIỆN PHÒNG HẾT HĐ` / `NƯỚC PHÒNG HẾT HĐ` của sheet NHÀ lưu chỉ số chốt khi khách trả phòng; [P] chỉ số này là chỉ số cuối của lượt thuê cũ và nguồn dòng điện/nước ở phiếu hoàn cọc UI-18, đồng thời là chỉ số đầu của lượt thuê kế tiếp.

**UI-11 — Danh sách hóa đơn và tạo kỳ** `[Đ] SRC-02!Tài chính chung!E1:E3; SRC-08!NHÀ T/S/G, G16–G18, PHÒNG MỚI THÁNG 9/10, HĐ (VP), HĐ (VP-HẰNG), HĐ (TECH), HĐ G1 (TECH)`

- **Cột:** kỳ hóa đơn, mã tòa/phòng, khách/lượt thuê, quản lý, giá niêm yết/giá đang thuê, cọc giữ, số tháng thanh toán (kỳ TT: 0/1/2/3), tổng phải thu, đã thu, còn nợ/dư, **ngày thu** (SRC-02!E2), hạn thu, trạng thái vòng đời và **trạng thái thu theo mẫu Excel** (bảng §3.12). Lọc quản lý, trưởng khu vực, tòa, T/S/G, trạng thái và hạn.
- **[X] Phạm vi dữ liệu kỳ:** hóa đơn kỳ gồm các lượt thuê của sheet NHÀ T/S/G, các tòa mới nhận có sheet riêng (G16, G17, G18) và các lượt thuê mới của `PHÒNG MỚI THÁNG n`. `PHÒNG MỚI THÁNG n+1` là khách đã đặt cọc/đóng trước cho tháng sau (ví dụ “kh mới 1/10” nằm trong file tháng 9) → hóa đơn thuộc kỳ tháng n+1, còn tiền đã nhận ghi ở UI-13 như khoản trả trước. Lưu ý Excel: tổng `cập nhật thu tiền` chưa gồm G16–G18 và PHÒNG MỚI; web phải cộng đủ.
- **Action:** chọn kỳ và nhóm tòa → xem trước danh sách hợp đồng đang phát sinh → sinh nháp từ UI-09/UI-10 và khoản điều chỉnh đã ghi → mở UI-12 để **xem trước đúng mẫu hóa đơn Excel** → phát hành, in/tải PDF hoặc xuất theo tòa, gửi thông báo nếu kênh được cấu hình/được phép. Kiểm tra giao nhau khách cũ/mới trong cùng tháng, dữ liệu phí thiếu, và trùng hóa đơn `lượt thuê + kỳ + loại hóa đơn`. Sheet hóa đơn VP/TECH là biến thể dữ liệu và thông tin nhận tiền trên cùng bố cục, không phải những loại báo cáo.
- **Tháng lẻ:** [Đ] khách vào giữa tháng đưa vào tập `phòng mới` của kỳ theo SRC-08 `PHÒNG MỚI THÁNG 9`; doanh thu liên kết đúng một lần với báo cáo. **[X] Công thức chia ngày, tiền ngày lẻ tháng trước (Thu khác), các khoản không chia ngày, hạn thanh toán và mốc chuyển công nợ: xem §3.12.** Kỳ tiền nhà và kỳ dịch vụ có thể khác tháng in hóa đơn (tiền nhà trả trước tháng N; chỉ số dịch vụ chốt khoảng ngày 22 tháng N−1).
- **Kiểm tra trước phát hành (bổ sung v1.4):** (1) **tổng in 13 dòng trên hóa đơn = tổng cần đóng** của lượt thuê. Kỳ 9/2026 có **1.471 hóa đơn** (1.409 dòng NHÀ T/S/G + 40 hóa đơn G16–G18 + 22 PHÒNG MỚI THÁNG 9). **9 hóa đơn** Excel ghi “Tổng cần đóng” khác tổng 13 dòng (ô gõ số cứng hoặc công thức bỏ sót khoản): 102T20A002, 103T25A001, 101S8A001, 103S22A001, 201S38A002, 101G4A001, 302G6A001, 301G7A002, 601G16A001 — web thu theo 13 dòng và gắn cờ **“lệch Excel nguồn”** (ví dụ 103T25: Excel 2.120.000, 13 dòng 2.888.000 vì Excel bỏ sót tiền điện 768.000). *Sửa v1.9:* con số 1.383 cũ là số dòng NHÀ T/S/G có mã phòng, AV > 0 và cột K là số (gồm 20 dòng phá HĐ); “18/1.383 lệch” cũ so 12 dòng của mẫu in Excel với AV, không phải 13 dòng web; (2) một mã phòng có hai lượt thuê trong kỳ phải tạo hai hóa đơn tách biệt với **mã KH khác nhau** — mẫu Excel ghép `mã phòng & "A001"` và dùng mã phòng làm nội dung chuyển khoản nên khách cũ/khách mới cùng phòng bị trùng nội dung CK; [P] web sinh mã KH = mã phòng + số thứ tự lượt thuê (A001, A002…) và dùng mã này trong nội dung CK.

**UI-12 — Chi tiết hóa đơn, bản xem trước và phát hành** `[Đ] SRC-08!HĐ (VP)!B2:J26; HĐ (VP-HẰNG)!B2:J26; HĐ (TECH)!B2:J26; HĐ G1 (TECH)!B2:J26`

- **[X] Bốn biến thể mẫu in** — cùng bố cục, khác sheet dữ liệu và tài khoản nhận tiền (B24):

| Mẫu | Đọc dữ liệu từ | Tài khoản nhận in trên hóa đơn | Khác biệt công thức |
|---|---|---|---|
| `HĐ (VP)` | NHÀ S | VP Bank 0969783880 – Nguyễn Thị Ngọc | điện F = SL cột R, G = Ngày DV/30; nợ cũ G = Ngày DV/30 |
| `HĐ (VP-HẰNG)` | NHÀ S | VP Bank 0399792276 – Nguyễn Thị Hằng | điện F = D−E, G = 1; nước và DV G = **Ngày ở**/30 |
| `HĐ (TECH)` | NHÀ T | Techcombank 19037617156018 – Nguyễn Thị Hằng | điện G = 1; nợ cũ và điện chung G = 1; DV trống → 0 |
| `HĐ G1 (TECH)` | NHÀ G | Techcombank 85678999999 – Đặng Đình Mạnh | như VP (điện nhân Ngày DV/30) |

  Web lưu **tài khoản nhận mặc định theo tòa** (có thể khác trong cùng nhóm S), chọn mẫu theo tòa; không có mẫu cho G16–G18 và PHÒNG MỚI trong Excel → web dùng chung bố cục cho mọi lượt thuê. Dữ liệu tài khoản trên đây là thông tin nhạy cảm, chỉ dùng để cấu hình, không hiển thị ngoài quyền admin/kế toán.
- **Bản hiển thị/in theo mẫu:** tiêu đề `HÓA ĐƠN THÁNG …/…` (B2); lời dẫn nêu kỳ tiền phòng và kỳ dịch vụ (B4); **mã KH, phòng số, ngày chốt số liệu** (B5:I5). Bảng B6:J18 có đúng thứ tự cột **STT, Nội dung, Chỉ số mới, Chỉ số cũ, Số lượng, Hệ số, Đơn giá, Thành tiền, Ghi chú**. Tổng dòng `TỔNG CỘNG TIỀN THANH TOÁN` ở B19/I19; tiếp theo là thời gian/hạn thanh toán, thông báo/lưu ý, **nội dung chuyển khoản**, ngân hàng–tài khoản–người nhận và lời kết ở B20:B26. Bản in dùng giá trị động của tòa/hợp đồng/kỳ; không sao chép cố định khách, ngày, tài khoản hoặc câu chữ của một hóa đơn tháng 9. [X] Câu chữ mẫu: hạn “từ ngày 25 đến ngày 31 tháng [N−1]”, ô J7 “đề nghị thanh toán đúng hạn ngày [cuối tháng N−1]… chậm phí phạt 200K/ngày”, B21 cảnh báo cắt dịch vụ, B23 “chuyển khoản không đúng nội dung… tính là chưa thanh toán” — các ngày này sinh từ kỳ (§3.12), mức phạt là tham số (`OQ-12`).
- **Thứ tự dòng nguồn:** (1) tiền phòng, (2) cọc phòng khách mới, (3) điện, (4) nước, (5) vệ sinh, (6) internet, (7) thang máy, (8) gửi xe/xe điện, (9) máy giặt/sấy, (10) combo/dịch vụ khác, (11) nợ cũ, (12) điện chung, **(13) Thu khác — tiền ngày lẻ tháng trước (bổ sung v1.4)**. Dòng 13 bắt buộc vì SRC-08 cộng cột N “Thu khác” vào Tổng cần đóng (`AV = AU + I×E + M + J + N`) và khách thực trả khoản này (403T20: phải đóng 6.069.892, đã đóng 6.069.000), nhưng 12 dòng của mẫu Excel không có nó → tổng in bị thiếu. Mỗi dòng lưu `chỉ số mới/cũ`, `số lượng F`, `hệ số G`, `đơn giá H`, `thành tiền I`, ghi chú và kỳ áp dụng. Dòng không áp dụng có thể hiển thị 0/để trống **theo mẫu được chọn**; không biến nợ cũ hay cọc thành doanh thu dịch vụ.
- **Tính số để đối chiếu:** các dòng tiền có dạng `I=H×F×G`, tổng `I19=SUM(I7:I18)` (web: đến dòng 13). **[X] Hai hệ số ngày khác nhau:** tiền phòng và cọc dùng `Ngày ở/30` (cột K), dịch vụ dùng `Ngày DV/30` (cột L). Thực tế tháng 9, **K = L = 30 ở toàn bộ 1.383 dòng** NHÀ T/S/G có mã phòng, AV > 0 và K là số nên G = 1; phần tháng lẻ đã được tính sẵn vào đơn giá ở sheet PHÒNG MỚI (`H = (giá/30)×số ngày`). Do đó web **chỉ chia ngày một lần** theo §3.12 và in `Hệ số = số ngày/số ngày của tháng` (hoặc 1 nếu đã quy đổi vào đơn giá) — không nhân thêm lần hai. **Sửa v1.4:** các mẫu VP/G1 có nhân điện đo thực tế với Ngày DV/30 và nhân cọc, nợ cũ với hệ số ngày; TECH đặt 1. Web theo nguyên tắc: **cọc, nợ cũ, điện/nước theo chỉ số không chia ngày** (chỉ số đã phản ánh lượng dùng thực), vì mọi dòng tháng 9 đều có hệ số 1 nên nguyên tắc này không làm lệch số liệu mẫu.
- **Thông tin nội bộ ngoài bản in:** `invoice_id`, lượt thuê, kỳ phòng, kỳ dịch vụ, phiên bản biểu phí, nguồn chỉ số, trạng thái nháp/đã phát hành/đã điều chỉnh, các lần thu và nợ/dư. Các trường này nằm ở panel quản trị, **không chen vào bố cục hóa đơn khách nhận**. Nhãn hạn, nội dung chuyển khoản và tài khoản nhận tiền được quản lý theo tòa/bản phát hành và kiểm tra trước phát hành.
- **Action:** sửa nháp, xem trước đúng bản in, đối chiếu từng dòng với nguồn, phát hành và lưu bản PDF/snapshot, in/tải/xuất, xem phiếu thu UI-13; sau phát hành tạo điều chỉnh có lý do thay vì sửa giá snapshot. Công thức dòng thiếu dữ liệu/khác ca đã duyệt thì giữ ở trạng thái cần rà soát.
- **Kiểm soát:** cọc giữ từ trước không tự trở thành doanh thu phòng; cọc mới nằm dòng riêng và được báo cáo mẫu xử lý theo từng cơ sở. Số dư Excel `AX−AV` âm là thiếu, dương là thừa; trên web hiển thị **nợ dương** và **dư dương** thành hai chỉ tiêu, tránh nhập nhằng dấu.

**UI-13 — Ghi nhận thu tiền/phiếu thu** `[N] SRC-08!NHÀ T!AV:AZ; SRC-08!cập nhật thu tiền; [Đ] DEC-03`

- **Header:** mã phiếu, người nộp, tòa/phòng/lượt thuê, ngày tiền thực nhận, ngày nhập, **người thực nhận và người ghi** (có thể khác nhau), phương thức, **tài khoản/quỹ nhận thực tế**, tham chiếu/chứng từ, tổng tiền, ghi chú. [X] SRC-08 ghi nhận một hóa đơn thường được trả **nhiều lần, nhiều kênh** (`AX = 3.800.000 + 1.489.548 + 2.700.000`; ghi chú “tiền mặt” 34 lần, “bên BIDV” 5 lần, chuyển khoản vào tài khoản in trên mẫu) và có khoản “chuyển từ tháng 8” (số dư trả trước kỳ trước) → phiếu thu phải tách từng lần nhận và cho phép phân bổ số dư kỳ trước. **Chi tiết phân bổ:** hóa đơn/kỳ/dòng phải thu, số phân bổ, phần cọc nhận, số chưa phân bổ/trả trước; cho phép nhiều lần thu cho một hóa đơn và một phiếu thu phân bổ có kiểm soát theo kỳ. Team/leader hiển thị theo phân công nhắc thu tại ngày liên quan, không thay người nhận thực tế.
- **Action:** tạo/sửa trước khi khóa, chọn nghĩa vụ, nhập thu một phần, hủy/đảo giao dịch có lý do, xem số dư sau thu, xuất phiếu. Mặc định không tự quyết định thứ tự bù nợ cũ/cọc/phòng/dịch vụ; kế toán chọn rõ. Không tích hợp tự động ngân hàng/QR ở Phase 1.
- **Đầu ra:** cập nhật UI-11/UI-14/UI-01 và mốc lương UI-25 theo **phần tiền phòng của tháng đang tính**. Trả trước nhiều tháng: tiền mặt xuất hiện một lần tại ngày thu, phần tháng tương ứng được đánh dấu đã thu tại mốc 5/10/15 của kỳ lương; không cộng tổng khoản vào nhiều tháng. Khoản thu được nhập sau khi khóa lương chỉ hiện ở dòng điều chỉnh chờ duyệt, không sửa âm thầm phiếu đã chốt (`PA-02`).
- **[X] Ảnh chụp mốc:** hệ thống lưu thực thu lũy kế theo tòa tại hết ngày **5, 10, 15** của tháng kỳ (SRC-08 `cập nhật thu tiền` cột T/U/V “NGÀY M5/M10/15”) dựa trên **ngày tiền thực nhận**, không dựa trên ngày nhập. Các cột W/X/Y “DT mốc 1/2/3” của Excel đang lỗi `#REF!`/lệch dòng → web tính lại theo UI-25, không import các ô này.
- **[GĐ] Phân bổ không vượt (v1.9):** số phân bổ vào một dòng hóa đơn không vượt số còn phải thu; phần dư nằm ở **số chưa phân bổ của phiếu** (trả trước) — trạng thái Thừa xem §3.12c.
- **[GĐ] Phiếu cọc giữ phòng (loại cọc, v1.9):** ghi **sổ cọc**, không phân bổ vào hóa đơn; vào dòng 4 “Cọc phòng mới” và dòng 3 báo cáo theo **ngày nhận**; đảo phiếu ghi bút toán âm; cọc đã có trong sổ **không thu lại** ở dòng 2 hóa đơn đầu; bỏ cọc chỉ ghi doanh thu (dòng 5) **phần cọc thực nhận**.

**UI-14 — Công nợ và tiến độ thu** `[N] SRC-02!Tài chính chung!E4:E5; SRC-08!NHÀ T`

- **[KH] Khi nào thành công nợ (CH-14):** một khoản phải thu chuyển từ trạng thái “hóa đơn” sang **“công nợ” sau 5 ngày kể từ khi có hóa đơn**; **[GĐ OQ-12]** 5 ngày tính **sau hạn thanh toán** (hạn cuối tháng N−1) → khoản chưa đủ thành công nợ **từ ngày 6 tháng N**; trùng mốc thu ngày 5 của lương và thời điểm đã thu 89% (tháng 9). Danh sách này chỉ gồm khoản đã quá mốc; khoản còn trong hạn xem ở UI-11.
- **[N] SRC-02!Tài chính chung!E4:** danh sách công nợ **bỏ tên khách, dùng mã phòng + mã tòa** làm định danh; tên/SĐT chỉ hiện khi mở chi tiết và có quyền.
- **[X] Tách phá HĐ:** khoản của lượt thuê phá HĐ/bỏ trốn hiển thị ở nhóm riêng với số phải thu theo §3.12 (không phải toàn bộ tiền phòng), không cộng vào tỷ lệ thu chính; khoản “khách chủ nhà đã đóng cho chủ” không là công nợ (UI-05).
- **Cột:** mã tòa/phòng, lượt thuê/khách theo quyền, kỳ, hạn, phải thu, đã phân bổ, còn nợ, dư, ngày thu gần nhất, số ngày quá hạn, quản lý/nhân viên được giao nhắc thu, leader/team theo hiệu lực, lần nhắc gần nhất và người thực nhận của phiếu thu gần nhất; tổng theo tòa/khu vực/người và biểu đồ tiến độ thu theo thời điểm.
- **Action:** lọc đến một ngày cụ thể, theo leader/team/người phụ trách nhắc thu và trạng thái quá hạn; xem chi tiết nghĩa vụ/phiếu thu và việc nhắc, chuyển UI-13 ghi thu theo quyền, xuất danh sách nhắc nợ, theo dõi thông báo Zalo nếu có kênh tích hợp. Khách chuyển phòng hoặc cùng phòng thay khách phải giữ nợ theo lượt thuê gốc; không gán cho người đến sau. Thao tác `Giao/nhắc việc` có người nhận và hạn, không làm thay đổi số đã thu.

**UI-15 — Danh sách/chi tiết chi phí** `[N] SRC-02!Tài chính chung!C6:E32; SRC-06, SRC-07`

- **Nhóm danh mục:** giá vốn (tiền thuê chủ nhà, mua thiết bị theo mẫu báo cáo); giá dịch vụ đầu vào (điện, nước, mạng, rác, môi trường, bảo trì thang máy); vận hành (các chức danh lương, thuê/dịch vụ văn phòng); bán hàng và phát sinh (marketing, sửa chữa/thay thế/bảo trì, hoa hồng, khác); dòng tiền cọc chủ nhà **tách khỏi chi phí lợi nhuận**. Dữ liệu dòng: mã chứng từ, nhà cung cấp/người nhận, ngày chi, kỳ hưởng, nhóm/loại, tòa hoặc quỹ chung, số tiền, phương thức, tài liệu gốc, người nhập, trạng thái, liên kết thiết bị/bảo trì/hợp đồng chủ nhà/hoa hồng nếu có.
- **Action:** nhập/sửa/import từ UI-37, phân loại, gắn tòa/kỳ, kiểm tra trùng mã và số tiền, xuất danh sách theo kỳ/tòa/khu vực/người quản lý. Hoa hồng UI-22 và mua thiết bị được ghi ở đây như **giao dịch chi gốc một lần**, các báo cáo chỉ tham chiếu; không tạo engine tính hoa hồng chuyên biệt trong Phase 1.
- **[X] Dòng báo cáo nhận chi phí:** SRC-04 **không có dòng Hoa hồng riêng** — hoa hồng được gộp vào **“Phí marketing”** (SRC-07: marketing = C46 + C47 + C48 gồm hoa hồng), và tỷ lệ `HH/CPBH` của báo cáo thực chất là marketing/CPBH. Web giữ loại chi phí `Hoa hồng` riêng nhưng khi dựng UI-29/UI-30 cộng vào dòng Phí marketing để khớp mẫu. Kỳ ghi nhận hoa hồng: [P] theo **tháng chi** (sheet `HOA HỒNG THÁNG n` là tháng chi) — `OQ-13`.
- **[X] Chi phí dịch vụ đầu vào** import theo **mã KH nhà cung cấp** của tab Dịch vụ đầu vào UI-03 (SRC-06: điện theo mã EVN, nước Viwaco, mạng), ghi kỳ hóa đơn nhà cung cấp và phương thức (tự động/đã trả qua chủ nhà). Tổng dòng 2 của SRC-06 đang trừ hàng 28 không có mã tòa (`SUM(...)-X28`) → khi import phải gắn được tòa, dòng không có mã tòa đưa vào lỗi.
- **[KH] Mua sắm thiết bị/đầu tư (CH-06, CH-15):** mỗi khoản lưu thêm **thời gian khấu hao** và tòa hưởng; Báo cáo tổng lấy nguyên giá một lần trong kỳ chi, Báo cáo kinh doanh lấy **phần khấu hao của kỳ** (`OQ-11`). [X] Cảnh báo trùng: 8 khoản ở `G1!ĐẦU TƯ BAN ĐẦU` lặp lại trong `THU CHI BAN ĐẦU` (E39–E53) — import chỉ nhận một lần.
- **[X] Sửa chữa và lương thợ (v1.5, SRC-16):** chi phí vật tư sửa chữa và tiền công thợ phát sinh từ **sổ sửa chữa UI-47**, được ghi sang chi phí theo tòa và kỳ; lương thợ = lương cứng + thâm niên + **tiền công theo bảng kê** + hỗ trợ ăn trưa. Excel tháng 8 **không khớp**: dòng “Lương sửa chữa” của báo cáo = 24.099.776 (phân bổ quỹ cố định 25tr theo số phòng) trong khi lương 2 thợ theo sổ = 45.750.000; dòng “Sửa chữa, thay thế, bảo trì” = 37.376.000 trong khi vật tư theo sổ = 21.981.000 → **[GĐ OQ-22]** “Lương sửa chữa” của báo cáo = phần lương cố định của thợ (lương cứng + thâm niên + ăn trưa; tháng 8 = 22.400.000, gần 24.099.776 của báo cáo) **phân bổ theo số phòng**; **tiền công + vật tư** theo sổ ghi **thẳng vào tòa** ở dòng “Sửa chữa, thay thế, bảo trì”; màn hình hiện cầu nối với số Excel trong giai đoạn chuyển đổi.

**UI-16 — Phân bổ chi phí chung** `[N] SRC-07!BÁO CÁO THÁNG 8!C35:C70; [P] PA-06`

- **Dòng phân bổ:** giao dịch/quỹ chi gốc từ UI-15, kỳ, các tòa tham gia, phương pháp (theo số phòng/cố định/tỷ lệ đã nhập), số phòng từng tòa, mẫu số, đơn giá bổ sung/phòng, kết quả từng tòa, phần chưa phân bổ/làm tròn. Mẫu G1 có cả `13.000.000/1.382×15` và dòng dùng 1.343; không áp một mẫu số cho toàn bộ chi phí.
- **[X] Quy tắc phân bổ trong SRC-07:** `quỹ chung / tổng số phòng hệ thống × số phòng của tòa (+ phụ phí/phòng nếu có, ví dụ 10.000; 150.000 + 10.000)`. **Mẫu số là tổng số phòng toàn hệ thống của tháng** và thay đổi theo tháng: T1 1.204 → T2 1.205 → T3 1.282 → T4–T5 1.293 → T6 1.303 → T7 1.343 → T8 1.382 (khớp tổng phòng của bảng lương tháng 8 = 1.382). Ô C43 tháng 8 (lương sửa chữa `25.000.000/1.343×15`) nhiều khả năng **sót mẫu số tháng 7** → web lấy mẫu số = số phòng hệ thống của kỳ tại thời điểm chốt, ghi ngoại lệ nếu người dùng nhập khác (`OQ-04`). “Lương quản lý” (C35) và “Lương vệ sinh” (C41) đang nhập cứng theo tòa, không phân bổ.
- **Action:** chọn tập tòa và cơ sở kỳ, xem trước, so sánh tổng phân bổ với quỹ gốc, lưu phiên bản đã chốt, xuất giải thích đến từng nhà UI-28. Nếu thiếu danh sách tòa hoặc tổng không khớp, hiển thị ngoại lệ; mẫu số theo quy tắc [X] ở trên, ngoại lệ ghi lý do (`OQ-04`).
- **[GĐ] Phụ phí và phần cố định (v1.9, `OQ-04`):** phụ phí 10.000đ/phòng và phần cố định/tòa của công thức G1 **chỉ dùng để tái hiện Excel ở kỳ chạy song song**; kỳ web tự chốt, mọi khoản phân bổ phải có **chứng từ quỹ** (lương trưởng phòng/nhóm 10.000đ/phòng ghi vào quỹ khi chốt bảng lương UI-25). Phụ phí kế toán 10.000đ/phòng cần có nguồn trong bảng lương — cần khách xác nhận.

**UI-17 — Danh sách hoàn cọc** `[N] SRC-02!Tài chính chung!B33:D40; SRC-08!HOÀN CỌC`

- **Cột:** ngày báo trả/nhận bàn giao, tòa/phòng, lượt thuê, cọc đang giữ, tổng phí khấu trừ BC, số tính theo mẫu BD, số thực chi, trạng thái chờ tính/chờ chứng từ/đã xác nhận/đã hoàn, ngày chi, người xử lý, quản lý/trưởng khu vực. Lọc theo thời gian/tòa/khu vực/người.
- **Action:** mở UI-18 tạo/kiểm tra phiếu, ghi giao dịch chi thủ công; danh sách không tự tất toán toàn bộ hợp đồng khi thay trạng thái khách.

**UI-18 — Phiếu tính và ghi hoàn cọc** `[Đ] DEC-02; SRC-08!HOÀN CỌC!I:BD`

- **Dữ liệu:** cọc I; từng nhóm phí và thành tiền theo các cột S, X, AA, AD, AG, AJ, AM, AP, AS, AV, AY, BB (điện/nước, khấu hao, sửa chữa, vệ sinh, sơn, khác theo nhãn trong sheet); nguồn chỉ số và chứng từ; `BC = SUM(các thành tiền)`, `BD = I − BC`; nghĩa vụ ngoài BC hiển thị riêng chưa tự trừ; số thực chi, lý do giữ cọc, phương thức và ngày chi.
- **Action:** nhập chi tiết phí, xem trước phép tính, ghi nhận chốt số, kế toán ghi **giao dịch hoàn thực tế** sau khi chuyển tiền, lưu biên nhận. Nếu BC>I, [P] số chi 0 và phần vượt cọc riêng; BD âm vẫn được giữ ở cột đối chiếu để giải thích. Trường hợp SRC-08!HOÀN CỌC!H7 có tiền phòng, mẫu BD7 không tham chiếu H7; không âm thầm thêm khoản đó vào BC.
- **[X] Mẫu phiếu in `HĐ (HOÀN CỌC)` khác sheet:** phiếu in có dòng 2 “Tiền phòng” và tổng `I21 = I7 − SUM(I8:I20)` tức **có trừ tiền phòng**, còn sheet `BD = I − BC` **không trừ**. Ca duy nhất tháng 9 là 301T41: tiền 9 ngày ở thêm = 3.800.000/31×9 = 1.103.226; sheet ghi hoàn **2.530.000** và đánh dấu “Đã hoàn”, còn phiếu in sẽ ra 1.426.774. Web hiển thị **tiền phòng còn phải thu** thành dòng riêng trên phiếu, có ô chọn “khấu trừ vào cọc” (mặc định **không** trừ, theo số đã thực hoàn) và bắt buộc lý do khi chọn trừ (`OQ-16`). Phiếu in còn gõ cứng đơn giá điện 4.000 — web lấy đơn giá từ biểu phí.
- **[KH] Đơn giá khấu trừ và người duyệt (CH-17):** **khấu hao cố định 200.000đ/phòng**; sửa chữa, vệ sinh, sơn… theo **chi phí thực tế phát sinh**; **admin và kế toán** duyệt số hoàn cuối cùng. Khấu hao 200k là tham số hệ thống có ngày hiệu lực. **[X] Sửa v1.9:** sheet HOÀN CỌC có 154 dòng: **144 dòng khấu hao 200.000đ, 3 dòng 300.000đ, 1 dòng 600.000đ, 6 dòng không khấu hao**; `BD = I − BC` khớp cả 154 dòng (thay cho “khớp 149/154 dòng”).
- **[X] Chỉ áp dụng cho khách hết HĐ:** không phòng phá HĐ nào xuất hiện trong sheet HOÀN CỌC — khách phá HĐ/bỏ trốn không lập phiếu hoàn (§3.12).
- **Liên thông:** trạng thái khách UI-06/UI-07, cọc trên UI-12, tiền chi ở báo cáo UI-27 và số liên quan cổ đông UI-32 dùng các giao dịch/phiếu riêng theo mẫu. [X] Tiền điện/nước khấu trừ vào cọc được báo cáo tính là **doanh thu điện/nước** của kỳ (G1 C13 cộng `HOÀN CỌC!S9`); hoàn cọc thực chi trừ khỏi dòng Tổng doanh thu (§3.8). Quy trình quyết toán checkout đầy đủ ngoài biểu hoàn mẫu chưa được xác nhận trong Phase 1.

### 3.5. Kinh doanh

**UI-19 — Tổng quan hàng hóa/phòng kinh doanh** `[N] SRC-02!KINH DOANH!A1:B3`

- **Chỉ tiêu:** phòng còn kinh doanh, đã chốt, đã nhận, phát sinh phá hợp đồng/hoàn cọc; phân theo khu vực, trưởng nhóm, sale và kỳ. Click phòng → UI-03; click giao dịch → UI-21. Đã chốt chưa đồng nghĩa đã nhận; không cộng một phòng hai lần vì được sale khác giới thiệu.

**UI-20 — Khách tiềm năng và lượt xem** `[N] SRC-02!KINH DOANH!A20:C27`

- **Dữ liệu:** khách tiềm năng có ID, số điện thoại, nguồn (sale nội bộ/đối tác và kênh cụ thể — **[KH] CH-18 danh mục kênh: Facebook, tờ rơi, đăng tin, Zalo**; [X] SRC-09 còn có nguồn đối tác môi giới như TINCITY, 90 LAND, MOITHUE và nhóm `LEAD - CTV / PHÒNG KD / SALE VH / VẬN HÀNH`), sale/team, ngày gửi khách, tòa/phòng đã xem, ngày xem, trạng thái đã xem/chốt/hủy/chuyển, khu vực, ghi chú. Một người có nhiều lượt xem; giới hạn quyền với số điện thoại.
- **Action:** tạo khách/lượt xem, gán sale, chuyển sang chốt UI-21, tìm trùng số điện thoại và lịch sử; không ghi mới khách thuê UI-07 trước khi có giao dịch thuê. Tỷ lệ chuyển đổi (khách xem/khách chốt, SRC-02!BÁO CÁO!D22) cần định nghĩa tử/mẫu và cửa sổ thời gian trước khi hiển thị ở UI-19 (`OQ-06`).

**UI-21 — Doanh số/giao dịch chốt phòng** `[N] SRC-02!KINH DOANH!A4:C19`

- **Cột:** ngày giao dịch, tòa/phòng, quản lý, liên hệ khách theo quyền, cọc đặt, giá chốt, ngày tính tiền, thời hạn hợp đồng, nguồn khách, tình trạng thu đủ/thiếu, sale, khoản hoa hồng tham chiếu, ở ngay/cuối tháng/chờ nhận, ghi chú; liên kết lượt xem UI-20.
- **Action:** chốt/đổi phòng/hủy, cập nhật ngày nhận, chuyển giao sang UI-07 tạo lượt thuê và UI-08 upload HĐ, kế toán ghi khoản đặt cọc ở UI-13, xem hóa đơn tháng đầu UI-11. Khi hủy hoặc đổi phòng, ghi sự kiện/điều chỉnh riêng để doanh số, cọc, hoa hồng không cộng hai lần. Ngày chốt, ngày nhận, ngày bắt đầu tính tiền là ba trường khác nhau.
- **[X] Khách bỏ cọc:** khách đã chốt và đặt cọc nhưng báo không vào ở (SRC-08: 9 ghi chú “bỏ cọc”, ví dụ “kh mới 1/9 chốt giá 3tr6, bỏ cọc báo bỏ 31/8”; dòng đó có đã đóng = tiền cọc, trạng thái Excel “Thừa”) → deal chuyển `hủy – bỏ cọc`, tiền cọc chuyển thành **doanh thu “Cọc khách bỏ không ở”** (Báo cáo tổng dòng 5; Word lương Bước 3 tính vào C), phòng trở lại kinh doanh, **không** tạo công nợ hay phiếu hoàn. Hoa hồng của deal bỏ cọc tính lại theo UI-22.

**UI-22 — Hoa hồng và nhân sự sale** `[N] SRC-02!KINH DOANH!A28:C41; SRC-09`

- **Danh sách hoa hồng:** phòng/tòa, giao dịch chốt, giá chốt (F — 1 tháng tiền phòng), thời hạn HĐ (G), mức HH (H), thành tiền (I), **người/đơn vị nhận** (cột L “Team” của SRC-09 thực chất là người nhận: đối tác môi giới hoặc sale cá nhân), **loại nguồn** (LEAD-CTV/đối tác, phòng KD, sale vận hành, vận hành), tổng nhận theo người nhận (J), **tình trạng khách đã đóng đủ**, quản lý phòng (QL), ngày thanh toán, **STK người nhận**, SĐT khách theo quyền, ghi chú loại trường hợp, trạng thái đã/chưa thanh toán, chứng từ UI-15. **Tab nhân sự sale:** tên, chức vụ, thâm niên, doanh số và **chỉ tiêu (“doanh số cuta”, SRC-02!C41)** theo thời gian.
- **[X] Quy tắc thực tế của SRC-09** (tháng 4–9/2026, `I = F × H` ở 260/265 dòng tháng 9):
  - Mức gốc theo nguồn: **50%** phổ biến (207/265 dòng tháng 9), **35%**, đối tác MOITHUE **65%**; đầu 2025 gốc 35%, từ 4/2025 chuyển 50%.
  - Hợp đồng **dưới 6 tháng** chia theo tháng: `H = (50/6 × số tháng)%` (ví dụ 5 tháng = 41,67%).
  - **Trùng khách** (nhiều người cùng giới thiệu một phòng) chia đều: 25% cho 2 người, 16,67% cho 3 người.
  - **Khách bỏ cọc:** giá tính HH = cọc − tiền những ngày đã ở (ví dụ `3.500.000 − 7.000.000/31×12`), mức 50% hoặc 30%.
  - Có thể **khấu trừ khoản hỗ trợ khách** (`I = H×F − 1.200.000`); **chi nhiều lần** (lần 1, lần 2); khách đổi phòng giữ HH theo phòng cũ.
  - Công thức gợi ý tháng 8 `IF(RIGHT(L,6)="(LEAD)","50%","35%")` lệch giá trị thực trả ở 29/42 dòng → không dùng làm quy tắc tự động.
- **[KH] Điều kiện và cách chia:** HH tính theo **phần trăm**, **chi ngay sau khi khách đóng đủ 1 cọc 1 và ký HĐ** (CH-19); **chia theo cá nhân**, không theo team (CH-20) — “team sale” chỉ là thuộc tính báo cáo.
- **Action Phase 1:** nhập/import F, G, H, loại trường hợp (thường / dưới 6 tháng / trùng-chia / bỏ cọc / khấu trừ) và người nhận; hệ thống **tính `I = F × H` (− khấu trừ) để kiểm tra**, cảnh báo khi số duyệt khác số tính; chỉ cho đánh dấu “đủ điều kiện chi” khi deal đã đủ 1 cọc 1 + có HĐ; ghi chi thực tại UI-15, xem báo cáo doanh số. Bảng chính sách tỷ lệ tự động để phase sau. Một khoản hoa hồng chỉ có một giao dịch chi gốc (hoặc nhiều lần chi có tổng không vượt số duyệt); tổng theo người nhận không cộng lặp với dòng chi tiết.
- **[X] Lưu ý import SRC-09:** ô tổng dùng `SUBTOTAL` bị ảnh hưởng bởi filter/ẩn dòng và vùng tổng không phủ hết dữ liệu (9.26!I3 bỏ sót I4:I13 = 17.425.000; J3 chỉ tới J155; 4.26/5.26/7.26 bật autofilter) → import từng dòng, không import số tổng.

### 3.6. Nhân sự

**UI-23 — Danh sách và hồ sơ nhân viên** `[N] SRC-02!NHÂN SỰ!A1:C9`

- **Tab Cơ cấu tổ chức:** cây thu gọn `Quản lý tổng → Trưởng phòng Vận hành 1/2/3, Tài chính–Kế toán, Kinh doanh → trưởng nhóm/sale hoặc nhân viên vận hành, vệ sinh, kỹ thuật`. Ảnh người dùng ngày 28/09/2026 là sơ đồ tham chiếu, không cố định số phòng ban hay số người. Mỗi nút hiển thị tên đơn vị, leader, số thành viên đang hiệu lực, số tòa/phòng đang phụ trách; chọn nút mở danh sách thành viên và công việc trong phạm vi, không rải nhiều thẻ tổng quan.
- **Tab Danh sách/hồ sơ:** mã, tên, đơn vị, chức danh, leader trực tiếp, ngày vào, thâm niên tại kỳ, trạng thái làm việc (**[KH] CH-27: đang làm, nghỉ việc, thử việc**), số nhà/phòng theo loại trách nhiệm. Chi tiết có hồ sơ cá nhân, hợp đồng/tài liệu, phụ cấp/lương cơ bản được phép xem và lịch sử thay đổi. Một nhân viên có một hồ sơ; kỹ thuật phục vụ chung ba phòng vận hành được gắn nhiều phân công, không nhân ba hồ sơ.
- **Action:** tạo/sửa đơn vị và vị trí tổ chức; gán/đổi leader hoặc chuyển thành viên có ngày hiệu lực và lý do; thêm/sửa hồ sơ, ngừng hoạt động theo ngày; từ node leader lọc danh sách team, mở phân công UI-24, bảng lương UI-25 theo quyền. Chặn vòng lặp quản lý, người tự quản lý mình và hai leader trực tiếp chồng thời gian nếu không có ngoại lệ được ghi nhận. Không tính thâm niên từ một giá trị nhập cứng mà không giữ ngày gốc.

**UI-24 — Phân công nhà/phòng theo thời gian** `[N] SRC-02!Khu nhà và toàn nhà!D11; SRC-02!NHÂN SỰ!C3`

- **Dòng:** nhân viên, leader/team theo ngày hiệu lực, vai trò tại tòa, phạm vi khu/tòa/phòng, **loại trách nhiệm** (vận hành phòng, nhắc thu, thu thực tế, kỹ thuật, vệ sinh, sale/chốt), ngày hiệu lực từ–đến, số phòng, người thay thế, lý do. Phân công vận hành/nhắc thu là phạm vi chịu trách nhiệm; phiếu thu UI-13 vẫn ghi người thực nhận/người nhập riêng, không suy người thu từ leader hay người quản lý phòng. Việc/ticket ghi người được giao, người thực hiện, hạn và kết quả riêng.
- **Action:** phân công/chuyển/bỏ phân công, xem xung đột theo **cùng loại trách nhiệm và cùng phạm vi**, kiểm tra số nhà/phòng từng kỳ; xem từ leader → team → nhân viên → phòng/tòa hoặc các việc và khoản cần nhắc → chứng từ gốc. Một phòng có thể đồng thời có vận hành, kỹ thuật và sale; đếm phòng duy nhất trong phạm vi đã chọn. Báo cáo lọc quản lý và lương UI-25 dùng lịch sử tại kỳ, không dùng duy nhất người hiện tại.
- **Chưa chốt:** một tháng đổi quản lý thì chia số phòng/lương theo ngày hay một đầu mối (`OQ-02`); không tự phân bổ tiền lương theo số ngày khi chưa có chính sách. [X] Tháng 8 không có tòa nào chia cho hai nhân viên vận hành (101 tòa, 12 NVVH, mỗi tòa một người).

**Quy tắc tổ chức, lọc và giám sát team** `[Đ] yêu cầu người dùng 28/09/2026; [P] chi tiết triển khai`

1. Cơ cấu là quan hệ `đơn vị → vị trí → nhân viên → leader trực tiếp` có hiệu lực từ–đến. Mỗi người chỉ có một tuyến báo cáo chính tại một thời điểm; phân công chéo cho kỹ thuật/thu hộ/phòng khác là quan hệ công việc riêng. Leader cấp trên nhìn thấy các team con trong nhánh của mình, admin nhìn toàn hệ thống. Chuyển team/đổi leader đóng phiên cũ và mở phiên mới, giữ ảnh chụp lịch sử tại ngày phát sinh.
2. Bộ lọc `Leader` chọn một người ở vai trò dẫn dắt và **bao gồm cấp dưới trực tiếp + gián tiếp** có hiệu lực tại ngày/kỳ lọc; có thể chọn `Chỉ team trực tiếp`. Bộ lọc `Nhân viên` thu hẹp thêm trong nhánh đó. Bộ lọc `Vai trò phụ trách` quyết định lấy phòng vận hành, khoản cần nhắc thu, việc kỹ thuật/vệ sinh, hay deal sale; giao của các bộ lọc được áp dụng trước phân trang. Tìm leader theo tên/mã/team; người đã thôi vai trò vẫn tìm được khi xem kỳ quá khứ. Nếu một kỳ vắt qua ngày chuyển team, hiển thị nguồn theo ngày sự kiện và cho xem các dòng trước/sau chuyển; chính sách phân bổ chỉ tiêu kỳ/lương là câu hỏi riêng.
3. Tại `Tòa nhà/Phòng`: leader vận hành xem phòng của team và người phụ trách từng việc. Tại `Hóa đơn/Công nợ`: xem phải thu, đã thu, còn nợ, hạn, lần nhắc, người nhắc và người **thực nhận**; leader thúc giục phần còn nợ nhưng quyền xác nhận thu vẫn ở kế toán/người được cấp. Tại `Bảo trì`: xem ticket, nhân viên nhận, hạn, quá hạn, kết quả. Tại `Kinh doanh`: leader kinh doanh xem lead, lượt xem, deal và sale phụ trách. Mỗi danh sách có cột `team/leader`, `người phụ trách`, `trạng thái`, `hạn hoặc ngày cuối xử lý` phù hợp và drill-down về bản ghi gốc; nếu không có phân công, hiện `Chưa phân công` để admin xử lý.
4. Chế độ `Team của tôi` cho leader giữ bộ lọc nhánh tổ chức khi chuyển màn; admin chọn bất kỳ leader hoặc `Tất cả`. Quyền dữ liệu được kiểm tra tại truy vấn, mở chi tiết, tìm kiếm và xuất file; bộ lọc không cấp thêm quyền. Số tiền nhạy cảm và lương phụ thuộc quyền riêng, không tự mở chỉ vì có quan hệ leader. Một phiếu thu hoặc ticket chỉ tồn tại một bản gốc; có nhiều người tham gia thì hiển thị vai trò của từng người, không cộng lặp tổng tiền/số việc khi gộp các team.

**Ví dụ kiểm tra:** Trưởng phòng Vận hành 2 phụ trách team có NV vận hành A và kỹ thuật K phục vụ chung cả ba phòng vận hành. Chọn leader Vận hành 2 và vai trò `vận hành phòng` chỉ ra phòng A phụ trách; chọn `kỹ thuật` có thể ra các ticket của K được giao thuộc phạm vi team 2. Khoản thu phòng do kế toán B ghi phiếu vẫn thuộc danh sách cần theo dõi của người vận hành A nếu A được giao nhắc thu; cột `người thực nhận` là B. Sau khi A chuyển team ngày 16, bộ lọc ngày 15/16 cho kết quả theo lịch sử và không chuyển ngược các giao dịch cũ.

**UI-25 — Bảng lương và giải thích lương vận hành** `[Đ] DEC-03/04; SRC-05 Bước 1–6; SRC-03`

- **Đầu vào theo tòa/kỳ/người** (cột SRC-03 trong ngoặc): số phòng được giao (J), DT niêm yết (K), DT phải thu điều chỉnh L, thu lũy kế R5/R10/R15 thực tế gắn phiếu UI-13 (ảnh chụp mốc UI-13), **dịch vụ cần phải thu Q** (SRC-05 Bước 2 — không phải “doanh thu dịch vụ”), thu thêm đủ điều kiện C (S), thâm niên và chính sách lương hiệu lực.
- **Bước 1 — mốc 1 theo hai trường hợp (SRC-05 P3–P6):**
  - *TH1 — tòa có cọc mới hoặc có phòng đóng theo kỳ 3 tháng:* `L = DT phải thu trên link − cọc mới − 2 tháng tiền nhà (+1 tháng nếu đã đóng tiền nhà các tháng trước)`; `M1 = R5 − cọc − 2 tháng tiền nhà`. [X] SRC-03 thể hiện bằng số cứng trừ cọc ở 48/98 dòng (ví dụ `L19 = 141.896.000 − 4.500.000`, `M19 = 137.386.000 − 4.500.000`) → web tính từ giao dịch cọc/kỳ 3 tháng thay vì nhập tay.
  - *TH2 — tòa bình thường:* `L` = DT phải thu trên link; `M1 = R5 × 100%`.
  - Chung: `M2 = (R10 − R5) × 90%`, `M3 = (R15 − R10) × 70%`, `A = M1 + M2 + M3`. Tiền thu sau ngày 15 không vào A.
- **Bước 2–4:** `B = Q / L`; **C = tiền nhà của các phòng phát sinh trong tháng đã thu đủ (tính theo ngày) + các khoản khách bỏ cọc** (SRC-05 P14; SRC-03 cột S có dạng “tiền phòng/31 × số ngày + khoản cộng thêm”); `DT tiền phòng thu được T = A − A×B + C`.
- **Bước 5–6:** `HS = T / K × 100`; `lương/phòng V = HS × mức lương tại cận / giá trị cận`; `thành tiền W = V × số phòng`.
- **[X] Quy tắc chọn cận — benchmark SRC-03 (khớp 97/98 dòng tòa tháng 8):** trong bậc [a; a+5], nếu HS < a + 2,5 dùng **cận dưới** (mức lương thấp của bậc / a), ngược lại dùng **cận trên** (mức lương cao của bậc / a+5). Ví dụ: HS 92,14 → `110.000/90` (khớp ví dụ Word 91×110.000/90); HS 94,27 → `119.000/95`; HS 95,10 xếp bậc 95–100. Ngoại lệ duy nhất V51 (HS 97,26 dùng 130.000/100). PA-01 v1.3 (luôn dùng đầu bậc) chỉ khớp 29/98 dòng → **bỏ PA-01**. Cách chia 100 nguyên văn Word Bước 5 không khớp dòng nào (trừ bậc có cận 100).
- **Bảng bậc (ảnh trong SRC-05):**

| HS (%) | Thâm niên dưới 1 năm (đ/phòng) | Thâm niên trên 1 năm (đ/phòng) |
|---|---|---|
| 95 – 100 | 110.000 – 120.000 | 120.000 – 130.000 |
| 90 – 95 | 100.000 – 109.000 | 110.000 – 119.000 |
| 85 – 90 | 90.000 – 99.000 | 100.000 – 109.000 |
| 80 – 85 | 80.000 – 89.000 | 85.000 – 94.000 |
| 75 – 80 | 70.000 – 79.000 | 75.000 – 84.000 |
| 70 – 75 | 60.000 – 69.000 | 65.000 – 74.000 |
| dưới 70 | phụ cấp 10% | phụ cấp 10% |

- **[X] HS > 100 không bị chặn trần** trong SRC-03 (V50: HS 103,21 → 134.171đ/phòng; V131: HS 105,74 → 126.887đ/phòng, vượt mức tối đa 120k của NV dưới 1 năm) → web tính tuyến tính theo cận 100 như Excel, gắn cờ “HS>100” để duyệt (`OQ-01`).
- **[X] Các khoản khác của NV vận hành:** `Thực nhận X = Σ W các tòa + lương cơ bản D + phụ cấp ăn trưa E + phụ cấp xăng xe F + lương trưởng nhóm G + lương hỗ trợ H`. Thâm niên trong SRC-03 không có cột riêng (suy từ bậc dùng: 7 NV trên 1 năm, 5 NV dưới 1 năm) → web lưu ngày vào làm và tính thâm niên tại kỳ.
- **[X] Lương trưởng phòng/trưởng nhóm vận hành:** `10.000đ × số phòng phụ trách` (`G10 = 774×10.000` TPVH, `G11 = 408×10.000` TNVH). Số phòng đang nhập cứng, không truy được ra team → web lấy từ phân công UI-24 theo nhánh leader.
- **[X] Tòa lương cố định:** một số tòa mới (G12A, G13, G14) đặt `V = 100.000đ/phòng`, không tính HS → web cho cấu hình “lương cố định/phòng” theo tòa với ngày hiệu lực; **[GĐ OQ-01]** mặc định áp cho **3 tháng vận hành đầu** của tòa mới nhận (G10, G11 đã tính theo HS; G15 chưa có trong lương tháng 8).
- **[X] Phòng Kinh doanh:** lương cứng + phụ cấp theo **ngày công/26** (ví dụ 2.500.000 × 25/26 = 2.403.846); hoa hồng tính riêng ở UI-22; SRC-03 dồn thực nhận của cả team vào dòng trưởng nhóm (X136) → web tính thực nhận **theo từng cá nhân**. **Quản lý tổng, kế toán:** lương cố định (QL tổng 12.000.000). **Kỹ thuật, thị trường:** SRC-03 chỉ có phụ cấp, chưa có công thức; CH-26 khách hẹn trao đổi trực tiếp → nhập thủ công cho đến khi có công thức. SRC-03 không có BHXH, tạm ứng, thưởng, phạt.
- **Action:** tính thử, mở từng thành phần đến phiếu thu/hóa đơn, xem ngoại lệ mẫu số 0, lưu phiên bản/chốt sau khi người có quyền đối chiếu, ghi điều chỉnh có tháng gốc nếu nhập chứng từ muộn. Bộ phận khác nhập lương cơ bản/phụ cấp/điều chỉnh thủ công nếu chưa có công thức nguồn; chi phí lương chỉ ghi sang UI-15 một lần để lên báo cáo.
- **Benchmark và kiểm tra:** dùng 98 dòng tòa của SRC-03 tháng 8 làm ca kiểm thử (T và U tái hiện 100%, V theo quy tắc cận). [X] Lỗi nguồn không được sao chép: dòng tổng hàng 9 bỏ sót 4 khối (J9 = 1.079 thay vì 1.382 phòng), kế toán X160 bỏ sót E, số phòng/niêm yết sửa tay (J35 `=18+1`, K38), tiêu đề U5 ghi “THÁNG 7”.
- **[GĐ OQ-01] cho các ca còn mở:** HS<70 → lương/phòng = 10% × mức thấp nhất bậc 70–75 theo thâm niên (6.000 hoặc 6.500đ); thâm niên “trên 1 năm” khi đủ 12 tháng tính đến ngày cuối kỳ lương; V51 tính lại theo quy tắc cận (HS 97,26 → 120.000/95 = 122.855đ/phòng, Excel 126.442); phòng không có giá thuê không tính vào số phòng (OQ-14); tiền thu sau ngày 15 không vào lương, đổi quản lý giữa tháng tính cho người phụ trách tại ngày 15 (OQ-02); kỹ thuật, thị trường, kế toán nhập lương cố định + phụ cấp. Ca HS<70 và HS>100 vẫn gắn cờ để admin duyệt trước khi chi.

### 3.7. Tài liệu

**UI-26 — Kho tra cứu tài liệu gắn đối tượng** `[N] SRC-02!menu chính!B8; [P] chi tiết`

- **Cột:** loại hồ sơ (sổ đỏ, HĐ chủ nhà, HĐ khách, phụ lục, bàn giao, chứng từ thu/chi, ảnh chỉ số, tài sản), đối tượng liên kết, mã tòa/phòng, người tải, ngày tải, phiên bản, trạng thái hiệu lực, quyền xem/tải. **Action:** tìm/lọc, upload, tải xuống, xem bản cũ, chuyển đến chi tiết đối tượng. OCR hợp đồng lưu bản gốc và kết quả ở UI-08, không biến kho thành nguồn giá độc lập. Sửa file bằng phiên bản mới; không xóa âm thầm chứng từ đã gắn giao dịch.
- **[KH] CH-03:** loại tài liệu chính là **hợp đồng thuê của khách và của chủ nhà**; người được tải lên: **nhân viên, trưởng nhóm, admin, kế toán**. Quyền xem theo phạm vi tòa được giao; các loại khác (sổ đỏ, PCCC, chứng từ) giữ như trên và mở rộng theo quyền admin.

### 3.8. Báo cáo

**UI-27 — Trung tâm báo cáo và bộ lọc chung** `[KH] SRC-13 bao_cao/báo cáo.xlsx; SRC-04` (sửa v1.5 — thay “chọn một trong hai loại”)

- **Danh mục theo SRC-13**, chia 4 nhóm; mỗi thẻ báo cáo hiện tên, định nghĩa công thức của khách, kỳ dữ liệu gần nhất và trạng thái (`sẵn sàng` / `chờ định nghĩa` / `chờ dữ liệu`):

| Nhóm | Báo cáo | Công thức/định nghĩa khách ghi (SRC-13) | Màn hình | Trạng thái |
|---|---|---|---|---|
| Kết quả kinh doanh | Báo cáo tổng = **LN dòng tiền** | “báo cáo lợi nhuận kinh doanh thực thu (gồm cọc mới và mua sắm tb)” — là sheet Báo cáo tổng | UI-29 | Sẵn sàng |
| | Báo cáo kinh doanh | “k gồm cọc mới, hoàn cọc, mua sắm tb” — là sheet Báo cáo kinh doanh | UI-30 | Sẵn sàng; `OQ-10` |
| | Dự kiến LN dòng tiền | có cọc mới, hoàn cọc, mua sắm thiết bị | UI-40 | Sẵn sàng; `OQ-19` |
| | Dự kiến LN kinh doanh | không tính cọc mới, hoàn cọc, mua sắm thiết bị | UI-40 | Sẵn sàng; `OQ-11` |
| | LN/vốn | LN ròng / giá vốn; từng nhà và tổng; lọc trưởng phòng, khu vực | UI-41 | Sẵn sàng |
| | LN/tài sản | LN ròng / tài sản; tài sản = tiền mua sắm thiết bị + tài sản trong nhà | UI-41 | Sẵn sàng theo GĐ `OQ-24` (tòa chưa có giá trị tài sản hiện “thiếu dữ liệu”) |
| | Biên LN tiền nhà | DT tiền nhà thu được / tiền nhà đóng cho chủ; lọc trưởng phòng, khu vực | UI-41 | Sẵn sàng |
| | Chi phí giá vốn / cố định / phát sinh | các mục giá vốn / chi phí vận hành / chi phí phát sinh trong báo cáo nhà; từng nhà và toàn hệ thống | UI-42 | Sẵn sàng |
| Phòng vận hành | Hiệu suất NV vận hành | HS thực tế / HS tạm tính (UI-01) | UI-45 | Sẵn sàng; `OQ-18` |
| | Tỷ lệ lấp đầy, thời gian trống | từng nhà và hệ thống; lọc trưởng phòng, khu vực | UI-45 | Sẵn sàng theo GĐ `OQ-06` |
| | Âm dương điện nước | theo file mẫu | UI-43 | Sẵn sàng; `OQ-20`, `OQ-21` |
| | Chi phí sửa chữa, vệ sinh | theo file mẫu | UI-44 | Sẵn sàng; `OQ-22` |
| | Phân khúc khách hàng | % sinh viên, % người đi làm | UI-45 | Sẵn sàng (nghề nghiệp trên HĐ, CH-25) |
| | Đóng tiền đúng hạn/quá hạn | % khách đóng đúng hạn, % quá hạn | UI-45 | Sẵn sàng theo GĐ `OQ-12` |
| Phòng kinh doanh | Báo cáo khách hàng | tỷ lệ chuyển đổi = khách xem / khách chốt | UI-46 | Sẵn sàng theo GĐ `OQ-06` |
| | Báo cáo doanh số | tổng giá phòng cho thuê được trong tháng theo từng sale | UI-46 | Sẵn sàng |
| Drill-down | Chi tiết tòa trong báo cáo đang xem | — | UI-28 | Sẵn sàng |

- Sheet KD có ô A1 vẫn ghi “BÁO CÁO TỔNG”; web lấy **tên và công thức của sheet** để phân loại, hiển thị nhãn đúng `Báo cáo kinh doanh`. “Báo cáo tổng” hiển thị với tên đầy đủ **“Báo cáo tổng (LN dòng tiền)”** theo SRC-13.
- **Bộ lọc riêng của nhóm kinh doanh (SRC-13 F22):** thời gian, tòa, khu vực, NV vận hành, **tên sale, team sale**, loại T/S/G, cổ đông.
- **Bộ lọc dùng chung:** tháng/năm, phạm vi toàn hệ thống hoặc tòa/nhóm T–S–G/khu vực/quản lý/trưởng khu vực theo dữ liệu có lịch sử; [P] cổ đông là bộ lọc xem các tòa tham gia, **không đổi định nghĩa doanh thu/lợi nhuận**. **[KH] CH-23:** người xem hai báo cáo là cổ đông, admin, kế toán, trưởng phòng; tài khoản cổ đông bị khóa bộ lọc về các tòa mình góp vốn. Tên báo cáo, kỳ, bộ lọc, phiên bản dữ liệu, thời điểm chốt phải hiện trên màn hình và file xuất.
- **Action:** chọn báo cáo → mở màn tương ứng; drill-down cột tổng/nhóm/tòa ở UI-28; click số tiền → giao dịch nguồn UI-12/UI-15/UI-18/UI-47; xuất bảng cùng cấu trúc dòng/cột của mẫu (nếu có mẫu). Bộ lọc giữ được khi chuyển giữa các báo cáo cùng nhóm để so sánh; không gộp Báo cáo tổng và Báo cáo kinh doanh thành một con số LNR. Báo cáo “chờ định nghĩa/chờ dữ liệu” mở được trang mô tả nhưng không hiển thị số.

**UI-28 — Drill-down tòa trong loại báo cáo đang xem** `[Đ] SRC-04 cột T/S/G; SRC-04!BC DT THÁNG 8 NHÀ T/S/G; SRC-07!BÁO CÁO THÁNG 8 (G1)`

- **Màn hình con** dùng chung cho các báo cáo có cột tòa (UI-29, UI-30, UI-40–UI-44), không phải một báo cáo riêng. Header giữ tên báo cáo đang xem, kỳ và bộ lọc. Bản tổng hợp SRC-04 có cột C toàn hệ thống, D nhà T, E nhà S, F nhà G.
- **Sửa v1.4 — SRC-04 CÓ báo cáo từng tòa:** ba sheet `BC DT THÁNG 8 NHÀ T` (35 tòa, D:AL), `BCDT THÁNG 8 NHÀ S` (52 tòa, D:BC), `BC DT THÁNG 8 NHÀ G` (11 tòa G1…G11, D:N) có **mỗi cột là một tòa**, cột C là tổng nhóm, cùng danh mục dòng với Báo cáo tổng nhưng lệch xuống 1 hàng; thứ tự các tỷ lệ 57–61 khác (lương, DV/giá nhập, tiền nhà/giá thuê, HH, CPK) và không có dòng LNR/DT trùng. Cột D/E/F của sheet tổng **dán số** từ cột C của ba sheet này (khớp 100% dòng 3–56). Chuỗi dữ liệu thực tế: báo cáo từng tòa (mẫu G1) → sheet nhà T/S/G → sheet tổng. Web dựng UI-28 đúng theo bố cục cột tòa của các sheet này; tòa G1 đối chiếu thêm SRC-07 để giải thích C22/C73/C74 cho UI-32.
- **Nhãn không thống nhất trong nguồn:** sheet S ghi “Lương phó phòng vận hành”, sheet T/G ghi “trưởng nhóm vận hành” cho cùng dòng → web dùng một mã chỉ tiêu, hiển thị nhãn theo mẫu xuất. Sheet G có `#DIV/0!` ở các cột tòa trống (dòng 49–61) → hiển thị “—”.
- **Action:** trở lại đúng loại và bộ lọc trước đó, so sánh kết quả tòa với cột của SRC-04, xem chi phí phân bổ UI-16 và chứng từ. Nếu SRC-07 G1 và cột tòa trong SRC-04 lệch do làm tròn/nguồn liên kết, hiện sai lệch và chứng cứ, không sửa ngầm. Không biến mẫu G1 thành một báo cáo riêng trong danh mục.

**UI-29 — Báo cáo tổng** `[Đ] SRC-04!BÁO CÁO TỔNG THÁNG 8!A1:F61` (v1.4: loại trừ cột R và Z — số liệu cũ sót từ tháng 1, Z40 liên kết ngoài `S20.31.3.25.xlsx`)

- **[X] Cơ sở doanh thu (bổ sung v1.4):**
  - **Dòng 3 “Tổng doanh thu” = tổng thực thu trên bảng hóa đơn − hoàn cọc** (SRC-07 G1: `C2 = 'HĐ T8.26'!AX2 − C7`, nhãn D2 “DT TRÊN HĐ − HOÀN CỌC”; AX là “Tổng đã đóng”, đã gồm cọc mới, cọc bỏ, thu khác). Từ tháng 2 đến tháng 7 G1 dùng `C2 = AX2` (chưa trừ hoàn cọc) — web áp dụng cách tháng 8 cho kỳ mới, giữ số lịch sử như đã chốt.
  - **Dòng 10–18 (tiền phòng, dịch vụ) = số phải thu trên hóa đơn**, loại phòng phá HĐ và cộng phần tháng lẻ của phòng mới (G1: `C12 = I2 − I17(phòng phá HĐ) + PHÒNG MỚI!H18`). Vì hai cơ sở khác nhau nên **C3 ≠ C10 + C18 + C4** là bình thường; web hiển thị dòng “chênh lệch thực thu − phải thu” khi drill-down, không ép bằng nhau.
  - **Quy tắc ánh xạ cột hóa đơn → dòng báo cáo** (SRC-07 C13–C19): điện = điện riêng + **điện chung** + **tiền điện khấu trừ vào cọc** (`HOÀN CỌC!S`); nước = cột nước; **DV khác/combo (AQ) chia đôi vào “phí vệ sinh” và “máy giặt”**; mạng = AE; thang máy = AH; xe điện = AK. Hoa hồng nằm trong dòng “Phí marketing” (UI-15).
  - Dòng 4 “Cọc phòng mới”, 5 “Cọc khách bỏ không ở”, 6 “Hoàn cọc”, 7–9 số phòng phá HĐ/mới/trống là **dòng giải thích**, không cộng lại vào C3.

- **Bố cục như sheet:** hàng là danh mục ở A/B; cột C `TỔNG`, D `NHÀ T`, E `NHÀ S`, F `NHÀ G`; thứ tự dòng/cột của file xuất theo mẫu. Chi tiết từng tòa là thao tác drill-down UI-28, không thêm cột vào bản xuất mẫu khi chưa có định dạng tương ứng. Nhóm dòng 3–18 gồm tổng doanh thu, cọc phòng mới, cọc bỏ không ở, hoàn cọc, số phòng phá HĐ/mới/trống, doanh thu tiền phòng, điện, nước, vệ sinh, mạng, xe điện, thang máy, máy giặt và tổng dịch vụ. Dòng 20–28 gồm thuê nhà một tháng, mua sắm thiết bị, giá gốc dịch vụ và giá vốn. Dòng 29–44 là lương theo chức danh, thuê/dịch vụ văn phòng, marketing, sửa chữa, chi phí khác, CPBH và tổng chi phí. Dòng 45–61 là LN gộp/ròng và các hệ số, tỷ lệ **đúng nhãn và công thức mẫu**.
- **Action:** lọc/xem/xuất và drill-down UI-28. Bộ số đối chiếu tháng 8 tại cột C (số sheet Excel): doanh thu **7.036.256.236**, chi phí **6.013.857.267,283087**, lợi nhuận ròng **1.022.398.968,716913**. **Trên số web (v1.9):** doanh thu 7.036.256.236 và giá vốn **5.316.928.772** khớp tuyệt đối; tổng chi phí **6.024.500.037**, lệch **10.642.770** = 10.405.700 (3 tòa G12A/G13/G14) + 181.553 (lương quản lý lỗi nguồn S39, S28, S36) + 55.517 (12 ô phân bổ khác công thức chung), không còn khoản chưa giải thích — chi tiết và tiêu chí ở Nghiệm thu 1B §7.1. Hàng cọc/hoàn hiển thị theo mẫu, không cộng lại tùy ý vào C3. Ô lỗi/thiếu liên kết ngoài phải có trạng thái không đủ chứng cứ.

**UI-30 — Báo cáo kinh doanh** `[Đ] SRC-04!BÁO CÁO KINH DOANH THÁNG 8!A1:F61`

- **[X] Khác Báo cáo tổng đúng 3 điểm:** D3/E3/F3 = DT tổng của nhóm − cọc mới (`D3 = 2.527.702.129 − D4`); D21:F21 mua thiết bị để trống (C21 = 0); các dòng 28 và 44–61 thay đổi theo. **Hoàn cọc vẫn bị trừ** (không cộng lại), cọc bỏ vẫn là doanh thu.
- **[KH] Mâu thuẫn cần khách chốt (`OQ-10`):** SRC-02!BÁO CÁO!D6 ghi Báo cáo kinh doanh “**không gồm cọc mới, hoàn cọc, mua sắm thiết bị**” → theo câu chữ phải cộng lại hoàn cọc, nhưng Excel không cộng. **CH-15:** Báo cáo kinh doanh hạch toán thiết bị **theo khấu hao** → theo đáp án phải có chi phí khấu hao kỳ, nhưng Excel để 0. **[GĐ OQ-10]** web **bật cả hai tham số**: `BC kinh doanh = BC tổng − cọc mới + hoàn cọc − mua sắm thiết bị + khấu hao kỳ` (khấu hao theo OQ-11). Tháng 8 theo GĐ: DT **6.769.375.010**, CP **5.979.043.347**, LNR **790.331.663**; màn hình có dòng cầu nối về số của sheet Excel (6.664.406.236 / 5.978.477.267 / 685.928.969). **Sửa v1.9:** 790.331.663 là OQ-10 áp trên **số Excel**; trên số web (chi phí cao hơn 10.642.770, UI-29) CP KD 5.989.686.117, LNR KD **779.688.893** = 790.331.663 − 10.642.770. Cầu nối trong web tính trên số web.

- **Giữ bố cục và nhóm dòng của UI-29** để đối chiếu từng chỉ tiêu, nhưng lấy **công thức/kết quả từ sheet KD**, không chỉ ẩn vài dòng trên UI-29. Cọc mới C4 và hoàn cọc C6 vẫn hiện để giải thích theo workbook, dù cơ sở C3 khác; mua thiết bị C21 tại cột tổng là 0. Cầu nối mẫu tháng 8: DT KD **6.664.406.236 = DT tổng 7.036.256.236 − cọc mới 371.850.000**; chi phí KD **5.978.477.267,283087 = chi phí tổng 6.013.857.267,283087 − mua thiết bị 35.380.000**; LNR KD **685.928.968,716913**. Theo GĐ OQ-10, hoàn cọc được cộng lại ở dòng tổng doanh thu; các dòng chi tiết tiền phòng/dịch vụ giữ nguyên cách tính.
- **Action:** lọc/xem/xuất cùng bộ lọc UI-27, xem cầu nối tổng ↔ KD, drill-down UI-28 đến dữ liệu gốc. Các báo cáo dự kiến, hiệu quả, chi phí, vận hành và kinh doanh là màn riêng UI-40–UI-46 (v1.5), không thêm cột vào màn này.

**UI-40 — Dự kiến lợi nhuận: dòng tiền và kinh doanh** `[KH] SRC-13 C7:E8; [X] SRC-14 BẢNG DỰ KIẾN LỢI NHUẬN CÁC THÁNG`

- **Bản dự kiến** lập giữa kỳ (Excel lập khoảng ngày 22, trùng ngày chốt số liệu hóa đơn) cho tháng đang chạy, có **ngày lập** và **phạm vi tòa** (Excel ghi “Tính đến G15” = chưa gồm G16–G18). Một bản dự kiến sinh **đồng thời hai kết quả**: dự kiến LN dòng tiền và dự kiến LN kinh doanh, từ cùng một bộ số đầu vào.
- **Phần doanh thu (lấy tự động tại ngày lập, cho sửa có lý do):**
  - `DT hóa đơn đã thu` (J4) = thực thu các hóa đơn kỳ của NHÀ T/S/G. [X] Tháng 9/2026: 7.635.417.529, xấp xỉ tổng “đã đóng” AX4 của ba sheet nhà (7.638.504.529; lệch 3.087.000 do thời điểm chụp số).
  - `DT phòng mới đã thu` (J5) = thực thu các lượt thuê mới trong kỳ. [X] Khớp đúng `PHÒNG MỚI THÁNG 9` = 126.912.000.
  - `Công nợ hóa đơn` (J6) và `Công nợ phòng mới` (J7) = số còn phải thu **dự kiến thu được** — người lập nhập; **[GĐ OQ-19]** gợi ý = công nợ hiện tại (UI-14) × tỷ lệ thu được sau ngày lập của kỳ trước (tháng 9 Excel nhập 30.000.000 trong khi công nợ thực của NHÀ T/S/G là 102.869.153).
  - `Cọc mới` (E4) = tổng cột cọc mới của các nhóm nhà + phòng mới (tháng 9: 245.700.000 + 83.150.000 + 317.900.000 + 75.950.000 = 722.700.000).
  - `Hoàn cọc dự kiến` (G4), `Mua sắm thiết bị` (J3) — nhập tay hoặc lấy từ UI-17/UI-15.
  - `Điều chỉnh tay` (Excel gõ thẳng +30.000.000, −40.000.000… vào công thức) → web lưu thành dòng điều chỉnh **bắt buộc có lý do**.
- **Phần chi phí dự kiến (24 dòng, cùng danh mục Báo cáo tổng):** tiền thuê nhà; điện; nước; mạng; phí thu rác; phí môi trường; phí bảo trì thang máy; lương quản lý; lương quản lý tổng; lương TPVH 1, TPVH 2; lương trưởng nhóm VH (thử việc); lương NV nguồn; lương NV PDKD; lương vệ sinh; lương kế toán; lương sửa chữa; lương bảo vệ; thuê và DV văn phòng; **phí marketing mặc định = cọc mới / 2** ([X] mọi sheet từ 7/2025, khớp hoa hồng 50%); sửa chữa; chi phí khác; **mua sắm thiết bị theo khấu hao = mua sắm × 1,6%** ([X] mọi sheet). **[GĐ OQ-19]** Giá trị gợi ý = số thực tế tháng trước (UI-29) + tiền thuê các tòa mới — đúng cách Excel lập tháng 9/2026 (nước 230tr/thực tế T8 233,5tr; vệ sinh 43tr/43,2tr; kế toán 16,3tr/16,33tr; bảo vệ 5,5tr/5,5tr; thuê nhà 4.307tr/4.086tr); người lập sửa.
- **Hai công thức kết quả:**

| | Dự kiến LN dòng tiền | Dự kiến LN kinh doanh |
|---|---|---|
| Doanh thu | J4 + J5 + J6 + J7 **(gồm cọc mới)** ± điều chỉnh | J4 + J5 + J6 + J7 **− cọc mới** ± điều chỉnh |
| Hoàn cọc | **Trừ** (là một khoản chi) | Không tính |
| Mua sắm thiết bị | **Trừ toàn bộ** tiền mua trong kỳ | **Khấu hao 1,6%/tháng** |
| Các chi phí khác | Như nhau | Như nhau |
| Chỉ số | LNR/DT; LNR/GV với GV = tiền thuê nhà + điện, nước, mạng, rác, môi trường, thang máy + khấu hao/mua sắm | như bên trái |

  Chỉ số phụ lấy theo sheet 8/2025: tiền nhà/DT, GV/DT (mốc tham chiếu 0,7), DV/DT (mốc 10–15%), lương/DT, CPPS/DT, TCP/DT, HC/DT (hoàn cọc/DT, chỉ ở dòng tiền).
- **[X] Bằng chứng hai loại trong SRC-14:** các sheet **7/2025 → 2/2026** có doanh thu gồm cọc mới và hoàn cọc tính vào chi (dạng dòng tiền); các sheet **3/2026 → 9/2026** trừ cọc mới, hoàn cọc và mua sắm để trống (dạng kinh doanh). Bộ số benchmark tháng 9/2026 (kinh doanh): DT **7.106.329.529**, tổng chi phí **6.468.533.333**, LN **637.796.196**, LNR/DT 8,98%, LNR/GV 11,40%.
- **[X] Lỗi Excel không sao chép:** (1) sheet “Tháng 8” (8/9/2025) trừ hoàn cọc **hai lần** (vừa trừ ở doanh thu `E3 = … − G4`, vừa cộng G4 vào tổng chi phí); (2) các sheet dòng tiền 2025 vẫn chỉ trừ khấu hao 1,6% thay vì toàn bộ tiền mua (`OQ-19` — GĐ: bản dòng tiền trừ toàn bộ); (3) khấu hao chỉ tính trên khoản mua **trong tháng** `=J3×1,6%`, không cộng dồn thiết bị đã mua các tháng trước (`OQ-11` — GĐ: cộng dồn mọi khoản còn giá trị, đường thẳng 1,6%/tháng); (4) khối A:B mọi sheet là bản cũ 6/2025 — bỏ qua khi import.
- **Action:** tạo bản dự kiến (ngày lập, phạm vi tòa), lưu nhiều phiên bản trong tháng, xuất theo bố cục SRC-14; khi kỳ chốt, [P] so sánh dự kiến ↔ thực tế (UI-29/UI-30) theo từng dòng. Quyền: admin, kế toán, trưởng phòng, cổ đông xem theo CH-23.

**UI-41 — Hiệu quả vốn, tài sản và tiền nhà** `[KH] SRC-13 C9:F11`

- **LN/vốn** = LN ròng / giá vốn, theo từng nhà và tổng hợp, lọc theo **trưởng phòng** và **khu vực**. Giá vốn = nhóm dòng “giá vốn” của báo cáo nhà (thuê nhà 1 tháng, mua sắm thiết bị, giá gốc dịch vụ); [X] tương ứng chỉ số `LNR/GV` đã có trong SRC-04/SRC-07 (G1 `K13 = C78×100`).
- **LN/tài sản** = LN ròng / tài sản; **tài sản = tiền mua sắm thiết bị + tài sản trong nhà** (SRC-13 F10). Lấy mua sắm thiết bị lũy kế của tòa (UI-15, UI-33 đầu tư ban đầu) + giá trị tài sản UI-34; báo cáo ở trạng thái “chờ dữ liệu” cho tòa chưa có giá trị tài sản (`OQ-24`).
- **Biên LN tiền nhà** = DT tiền nhà thu được / tiền nhà đóng cho chủ; lọc trưởng phòng, khu vực. [X] Sheet nhà T/S/G của SRC-04 đã có tỷ lệ “tiền nhà/giá thuê” ở nhóm dòng 57–61.
- **[GĐ OQ-24]** LN/vốn = dòng “Tỷ lệ LNR/GV” của báo cáo nhà (`=D47/D48`, D48 = giá vốn dòng 29), tính theo báo cáo đang chọn, **mặc định Báo cáo kinh doanh**; LN/tài sản dùng LNR kinh doanh / (thiết bị đã mua còn giá trị theo khấu hao + giá trị tài sản công ty ở UI-34); **biên LN tiền nhà = DT tiền phòng / tiền thuê nhà 1 tháng** (`=D11/D21`, dòng 59 “DT TIỀN NHÀ/GIÁ THUÊ NHÀ” của sheet nhà).

**UI-42 — Báo cáo chi phí giá vốn, cố định, phát sinh** `[KH] SRC-13 C12:E14; SRC-04 nhóm dòng`

- Ba tab theo đúng nhóm dòng của báo cáo nhà: **Giá vốn** (tiền thuê nhà, mua sắm thiết bị, giá gốc dịch vụ: điện, nước, mạng, rác, môi trường, thang máy); **Chi phí cố định** = chi phí vận hành (các dòng lương theo chức danh, thuê và DV văn phòng); **Chi phí phát sinh** (marketing gồm hoa hồng, sửa chữa/thay thế/bảo trì, chi phí khác).
- Cột: từng nhà và toàn hệ thống (theo bố cục UI-28); so sánh các tháng; tỷ lệ trên doanh thu. Click số → giao dịch chi UI-15, phân bổ UI-16, sổ sửa chữa UI-47.

**UI-43 — Âm dương điện nước** `[KH] SRC-13 C16; [X] SRC-15 âm dương điện nước tháng 6, 7`

- **Tab Điện** (theo tòa, theo tháng; sheet `THÁNG 7.2026 điện`):

| Cột | Nội dung | Công thức/nguồn Excel |
|---|---|---|
| B | Thực thu máy giặt | Σ “DV khác/combo” (AQ) của tòa / 2 |
| C / D | Phải thu / không thu được máy giặt | nhập tay / C − B |
| E | Thực thu thang máy + máy sấy + xe điện | Σ AH (thang máy) + AN (máy giặt) + AK (xe điện) |
| F / G | Phải thu / không thu được | nhập tay / F − E |
| H | Thực thu điện | Σ T (tiền điện) + điện khấu trừ cọc (HOÀN CỌC!S) + điện phòng trống/không thu được |
| I / J | Phải thu điện / điện không thu được | nhập tay / I − H |
| **K** | **Tổng thu điện** | **H + B/2 + E** |
| **L** | **Điện chi** | hóa đơn EVN của tòa trong tháng — [X] khớp SRC-06 (T2 tháng 7 = 4.785.156 + 3.350.225 = 8.135.381) |
| **M** | **Thu − chi (âm dương)** | **K − L**; dương = lãi, âm = lỗ |

  Benchmark tháng 7/2026: phải thu điện 1.132.068.400, thực thu 1.104.021.000, không thu được 28.047.400; tổng thu K 1.234.987.000; chi L 913.178.913; **âm dương +321.808.087**.
- **Tab Nước** (sheet `THÁNG 6.2026 nước`): thực thu nước = Σ Y (tiền nước) + nước khấu trừ cọc (HOÀN CỌC!X); phải thu, không thu được; **tổng thu nước = thực thu nước + 1/2 máy giặt**; nước chi = hóa đơn nước của tòa (khớp SRC-06, T2 tháng 6 = 977.500); thu − chi. Benchmark tháng 6/2026: tổng thu 292.728.500, chi 207.782.352, **+84.946.148**.
- **Tab Sản lượng / biến động:** sản lượng điện bán ra theo tòa (SL điện hóa đơn + phòng trống + hoàn cọc) tháng này so tháng trước; chi điện tháng này − tháng trước và tỷ lệ % (sheet “Sản lượng điện tháng 5 và 6”, cột T:W “ĐIỆN CHI THÁNG 4 / THÁNG 5 − THÁNG 4 / TỈ LỆ”). Tháng 6 so tháng 5: chi điện tăng 153.912.798.
- **Web tính:** phải thu = dòng điện/nước/dịch vụ trên hóa đơn đã phát hành (không nhập tay); thực thu = phần phiếu thu đã phân bổ cho các dòng đó (UI-13); chi = hóa đơn nhà cung cấp theo mã KH của tòa (tab Dịch vụ đầu vào UI-03, chi phí UI-15). Tòa có điện/nước trả qua chủ nhà (Excel ghi “**chưa tính tiền chủ nhà**” ở 5 tòa; ví dụ S32 tính 2.500đ/kWh) → chi lấy từ khoản trả chủ nhà theo số kWh, gắn cờ khi chưa có.
- **[GĐ OQ-20, OQ-21]** Giữ điện phòng trống/không thu được trong tổng thu điện như Excel (coi là sản lượng đã đo), hiển thị **tách riêng** dòng này và chỉ tiêu “thu − chi tiền thực”. Chuỗi chia thống nhất: **combo → 1/2 vệ sinh + 1/2 máy giặt**; **máy giặt → 1/2 điện + 1/2 nước**; **thang máy, máy sấy (AN), xe điện → 100% điện**. Excel tháng 7 có cột nước lỗi `#VALUE!` do liên kết file hóa đơn đứt — không import cột công thức, chỉ import số.

**UI-44 — Báo cáo chi phí sửa chữa, vệ sinh** `[KH] SRC-13 C17; [X] SRC-16 sổ sửa chữa tháng 8`

- Tổng hợp từ sổ UI-47 theo **kỳ sổ (26 → 25)**, tòa, phòng, thợ, loại việc, lý do và **bên chịu chi phí**: tiền công, vật tư, tổng; số việc; số phòng; chi phí trên mỗi phòng; so sánh tháng.
- Nhóm theo lý do (Excel tháng 8): khách **phá HĐ** (43 dòng), **khách hết HĐ** (14), do **thấm**, **do thiết kế nhà**, **lỗi khách cũ**; bên chịu: **“khách chi”** (8 — khấu trừ cọc/thu khách), “**QL bank về HT**” (quản lý đã chuyển tiền khách về công ty).
- Benchmark tháng 8 (kỳ 26/7–25/8): thợ A Điệp 98 dòng, 34 tòa, tiền công 13.300.000, vật tư 8.231.000; thợ A Ước tiền công 10.050.000, vật tư 13.750.000 (sheet lẫn cả dòng tháng 9–10 — web lọc theo ngày).
- Phần **vệ sinh**: gồm việc dọn phòng/vệ sinh trong sổ (≈ 54 dòng tháng 8) và chi phí “Lương vệ sinh” (43.200.000 tháng 8, UI-15). **[GĐ OQ-23]** không có sổ vệ sinh riêng: chi phí vệ sinh = việc dọn phòng/vệ sinh trong sổ UI-47 + lương vệ sinh theo tòa NV vệ sinh phụ trách; dòng “khách chi” thành đề xuất khấu trừ, kế toán xác nhận.
- Click số → dòng sổ UI-47, phiếu hoàn cọc UI-18 (khoản khấu trừ khách), chi phí UI-15.

**UI-45 — Báo cáo phòng vận hành** `[KH] SRC-13 C1:E2, C15:E19`

- **Hiệu suất NV vận hành:** HS thực tế và HS tạm tính theo công thức SRC-13 (UI-01), theo nhân viên → tòa, theo kỳ; liên kết giải thích lương UI-25.
- **Tỷ lệ lấp đầy và thời gian trống:** từng nhà và hệ thống, lọc trưởng phòng, khu vực. **[GĐ OQ-06]** lấp đầy = phòng-ngày có lượt thuê tính tiền / phòng-ngày khai thác (không tính phòng không có giá thuê); thời gian trống = trung bình số ngày từ ngày ngừng tính tiền lượt cũ đến ngày bắt đầu tính tiền lượt kế tiếp; kèm số phòng theo ba nhóm trống (UI-01).
- **Phân khúc khách hàng:** % sinh viên, % người đi làm, theo nghề nghiệp trên hợp đồng (CH-25) tại kỳ xem.
- **Tỷ lệ đóng tiền đúng hạn/quá hạn:** % lượt thuê đóng đủ **trước hết ngày 5 tháng N** (đúng hạn, GĐ OQ-12) / sau đó (quá hạn), chia thêm nhóm thu ngày 6–10, 11–15, sau 15 theo mốc lương.

**UI-46 — Báo cáo khách hàng và doanh số sale** `[KH] SRC-13 C22:F23`

- **Báo cáo khách hàng:** số khách xem, số khách chốt, **tỷ lệ chuyển đổi** (SRC-13 ghi “khách xem/khách chốt”; web hiển thị % chốt = khách chốt / khách xem và giữ số tuyệt đối hai bên), theo sale, team, nguồn khách, tòa, khu vực. **[GĐ OQ-06]** tính theo tháng của ngày xem: số khách có deal chốt / số khách có lượt xem.
- **Báo cáo doanh số:** **tổng giá phòng cho thuê được trong tháng theo từng sale** (tổng giá chốt các deal UI-21 trong tháng); so với chỉ tiêu (“doanh số cuta”, UI-22). **[GĐ OQ-25]** tính theo ngày chốt; deal hủy/bỏ cọc không tính (hiện ở cột riêng); deal nhiều sale giới thiệu chia đều như hoa hồng.
- Bộ lọc: thời gian, tòa, khu vực, NV vận hành, tên sale, team sale, loại T/S/G, cổ đông (SRC-13 F22).

### 3.9. Cổ đông

**UI-31 — Danh sách cổ đông và tỷ lệ theo tòa** `[N] SRC-02!TT CỔ ĐÔNG!A2:B2; SRC-07`

- **Dữ liệu:** người góp vốn, liên hệ/tài khoản nhận theo quyền, tòa, tỷ lệ, ngày hiệu lực, lịch sử điều chỉnh, chứng từ góp vốn nếu có. **Action:** thêm/sửa tỷ lệ có ngày hiệu lực, kiểm tra tổng tỷ lệ từng tòa/kỳ = 100% khi chốt chia, xem nhà tham gia và chi tiết UI-32. Một người tham gia nhiều tòa, một tòa nhiều người (**[KH] CH-30: được góp nhiều nhà, tỷ lệ nhập tay**).
- **[X] Mẫu SRC-07:** “G1” là **một tòa** (15 phòng + đồng hồ chung `000G1`) có **9 cổ đông**: CHUNG 10%, Hằng 20%, Tùng 15%, Ngọc 5%, Mạnh 15%, Hào 10%, A Điệp 5%, Lâm 10%, Huy Anh 10% (tổng G13 = 100). **[GĐ OQ-08]** “CHUNG” = quỹ chung công ty, nhận cả chênh lệch làm tròn khi chia.

**UI-32 — Bảng kê chia G1 theo kỳ** `[Đ] DEC-06; SRC-07!BÁO CÁO THÁNG 8!G3:M13`

- **Cột:** tòa/kỳ/cổ đông, tỷ lệ G, `H = G×C22/100` (tên “vốn theo mẫu G1”), `I = G×C73/100`, `J = G×C74/100`, `M=H+J` (“tổng nhận theo mẫu”), tổng và sai lệch làm tròn; bấm từng C22/C73/C74 mở UI-28. **Action:** tính thử/chốt bản kê/xuất, so sánh tổng tỷ lệ và tổng phân bổ; liên kết lịch góp/chi UI-33.
- **Giới hạn:** M là kết quả tính trên báo cáo, không chứng minh đã chuyển tiền; thay tỷ lệ trong tháng, giữ lại/bù lỗ và làm tròn chi trả chưa có chính sách nguồn. Chỉ số “vốn” H lấy tiền thuê nhà **một tháng** theo mẫu, không thay bằng tổng vốn đầu tư suy đoán. **[GĐ OQ-08]** H = phần tiền thuê nhà của tháng mà cổ đông đã góp theo tỷ lệ (CH-29), nên **Tổng nhận M = hoàn lại tiền nhà đã góp + LN ròng**; làm tròn từng dòng đến đồng, chênh lệch dồn vào CHUNG.
- **[X] Tiêu đề cột thật của SRC-07:** G “Tỷ lệ %”, H “**Vốn**”, I “LN Gộp”, J “LN ròng”, K “LNR/GV” (`K13 = C78×100`), L “CP/LNG” (`L13 = C80`), M “Tổng nhận”; `N8/N9 = H13 + J13` là ô kiểm tra tổng. C22 = tiền thuê nhà 1 tháng (tháng 8: 48.000.000), C73 = LN gộp = C2 − C34 (22.990.932), C74 = LN ròng = C2 − C72 (14.664.969). Bảng chia luôn dùng **cơ sở Báo cáo tổng** (doanh thu gồm cọc mới).
- **[X] Không cố định địa chỉ ô:** tháng 2–4 cột I/J tham chiếu **C71/C72** (lúc đó C73/C74 là giá vốn và tỷ lệ) → web ánh xạ **theo mã chỉ tiêu** (thuê nhà 1 tháng, LN gộp, LN ròng), không theo ô C22/C73/C74. Chênh lệch làm tròn giữa SRC-07 và cột G1 của SRC-04 (0,33đ do marketing làm tròn) hiển thị ở dòng sai lệch (`OQ-08`).

**UI-33 — Lịch góp vốn, tiền cọc, tài sản và chi thực** `[N] SRC-02!TT CỔ ĐÔNG!D2:F5; [P] tách giao dịch`

- **Tab Lịch đóng tiền:** phải góp/hạn/đã góp/chứng từ; **Tab Chi thực:** nghĩa vụ theo bản kê, số đã trả, ngày/phương thức/chứng từ và còn phải trả; **Tab Tài sản/cọc:** giá trị/tài sản hoặc cọc thuộc tòa với nguồn UI-04/UI-34, không cộng vào doanh thu khi chỉ là danh mục.
- **Action:** ghi giao dịch góp/rút/chi thủ công theo quyền, đối chiếu với UI-32, xem lịch sử. Không tạo lệnh chuyển tiền tự động hoặc tự hiểu “M” là giao dịch chi.
- **[KH] CH-29 — Lịch đóng tiền:** là lịch **cổ đông đóng tiền nhà định kỳ cho chủ nhà theo tỷ lệ % góp vốn** → mỗi kỳ trả chủ nhà UI-05 (thường 3 tháng) sinh dòng phải góp = tiền kỳ × tỷ lệ của từng cổ đông, có hạn theo hạn trả chủ nhà. **CH-31:** thống kê tài sản và tiền cọc **liên kết** dữ liệu tòa (UI-04 cọc chủ nhà, UI-34 tài sản), không nhập độc lập.
- **[X] Vốn góp và khoản đầu tư ban đầu (SRC-07):** `THU CHI BAN ĐẦU` (tháng 1/2026) có chi 269.906.348 (thuê nhà 128tr, **cọc chủ nhà 48tr ghi vào chi**, môi giới, hoa hồng, thiết bị), thu 104.919.000, chênh −164.987.348 chia theo % cho cổ đông; “Đã đóng” (vốn góp) = 230.400.000; “Thực nhận” = đã đóng + phần lỗ = 65.412.652. `ĐẦU TƯ BAN ĐẦU` (1/10–30/11/2025) có 8 khoản thiết bị/cải tạo tổng 38.862.000, **trùng** với THU CHI BAN ĐẦU E39–E53. Web thêm tab **Đầu tư ban đầu** theo tòa: vốn góp từng cổ đông, khoản chi ban đầu (không nhập trùng), cọc chủ nhà tách thành khoản phải thu hồi khi kết thúc HĐ chủ nhà (không phải chi phí lợi nhuận, UI-04). Chỉ số hoàn vốn/ROI vẫn ngoài phạm vi (`OQ-07`).

### 3.10. Bảo trì, bảo dưỡng

**UI-34 — Danh sách tài sản/thiết bị** `[N] SRC-02!Khu nhà và toàn nhà!D13; SRC-02!BẢO TRÌ BẢO DƯỠNG!A5`

- **Dòng:** mã, loại (thang máy, máy bơm, máy giặt, máy lọc nước, đồ décor, khác), nguồn sở hữu chủ nhà/công ty, tòa/phòng/vị trí, số lượng, tình trạng, ngày nhận/bàn giao, giá trị nếu có chứng từ, ảnh/file, bảo hành. **Action:** thêm/sửa/chuyển vị trí theo lịch sử, xem lịch UI-35 và kiểm kê UI-36. Giao dịch mua thiết bị gốc nằm ở UI-15. **Sửa v1.4 ([KH] CH-06, CH-15):** tài sản thuộc “danh sách đầu tư” (Timehouse bỏ vốn) **có khấu hao theo thời gian** → lưu nguyên giá, ngày bắt đầu, số tháng khấu hao, giá trị còn lại; khấu hao kỳ đưa vào Báo cáo kinh doanh UI-30. Tài sản của chủ nhà (phụ lục bàn giao UI-04) không khấu hao. Phương pháp theo GĐ `OQ-11`: đường thẳng 1,6%/tháng trên nguyên giá, cộng dồn đến đủ 100%.

**UI-35 — Lịch bảo dưỡng và kết quả** `[N] SRC-02!BẢO TRÌ BẢO DƯỠNG!A1:A4`

- **Dòng:** thiết bị/tòa, loại bảo dưỡng, chu kỳ hoặc ngày kế tiếp nhập tay, người phụ trách/đơn vị, trạng thái dự kiến/đã thực hiện/quá hạn, ngày thực hiện, kết quả, ảnh, ghi chú, chi phí liên kết UI-15. **Action:** lập lịch, đánh dấu đã thực hiện, tạo kỳ tiếp theo nếu có chu kỳ được khai báo, mở chứng từ; không triển khai workflow SLA/duyệt nhiều cấp từ một dòng yêu cầu. **[KH] CH-32:** **nhắc tự động trước 7 ngày** đến người phụ trách (trong web; qua Zalo nếu UI-39 cấu hình cho nhân viên).

**UI-36 — Kiểm kê tài sản** `[N] SRC-02!BẢO TRÌ BẢO DƯỠNG!A5:B5`

- **Dòng:** kỳ/ngày kiểm kê, tòa/phòng, mã tài sản, số ghi sổ, số thực, tình trạng và chênh lệch, người kiểm, ảnh/ghi chú. **Action:** ghi kết quả, xuất danh sách chênh lệch, tạo đề xuất điều chỉnh hồ sơ tài sản có lý do; không tự tạo chi phí hoặc bút toán khi chưa có chứng từ UI-15. **[KH] CH-33:** kiểm kê **1 tháng/1 lần**, **admin và kế toán** nhập/duyệt → hệ thống tự mở phiên kiểm kê đầu mỗi tháng cho từng tòa.

**UI-47 — Sổ sửa chữa và ứng chi vật tư** `[X] SRC-16 sổ sửa chữa tháng 8 (sheet theo thợ “A Điệp 8.26”, “A Ước 8.26”, “LƯƠNG THÁNG 8”, Sheet4)` (bổ sung v1.5)

- **Dòng sổ (một việc):** ngày, tòa, mã phòng, nội dung, **loại việc** [P] (thay thế, sửa chữa, sơn, dọn phòng/vệ sinh, chống thấm, điện, nước, máy giặt, khác), thợ thực hiện, **tiền công**, **mua vật tư**, **điểm lấy sơn/vật tư** (ví dụ “1/2 thùng sơn lấy ở T25”, “1 thùng chuyển từ VP”), **lý do** (khách hết HĐ, khách phá HĐ, do thấm, do thiết kế nhà, lỗi khách cũ, khác), **bên chịu chi phí** (công ty / khách — “khách chi” / chủ nhà), trạng thái thu (“QL bank về HT” = quản lý đã chuyển tiền khách trả về công ty), ảnh, ghi chú; liên kết lượt thuê, phiếu hoàn cọc UI-18, việc bảo dưỡng UI-35 nếu có.
- **Kỳ sổ:** [X] từ **ngày 26 tháng trước đến ngày 25** (A Điệp tháng 8: 26/7 → 25/8). Dòng có ngày ngoài kỳ bị cảnh báo (sheet A Ước 8.26 đang lẫn dòng tháng 9–10).
- **Liên thông:** khoản “khách chi” → gợi ý thành dòng khấu trừ trên phiếu hoàn cọc UI-18 (sửa chữa/vệ sinh/sơn theo chi phí thực tế, CH-17) hoặc khoản thu thêm của khách (UI-12 dòng Thu khác), không tự trừ khi chưa xác nhận; khoản công ty chịu → chi phí “Sửa chữa, thay thế, bảo trì” theo tòa/kỳ ở UI-15; khoản chủ nhà chịu → ghi đối trừ với chủ nhà (UI-05) [P].
- **Lương thợ (sheet LƯƠNG THÁNG 8):** lương cứng (7.500.000) + lương thâm niên (3.000.000) + **tiền công theo bảng kê** (= tổng tiền công trong kỳ) + hỗ trợ ăn trưa (700.000) → A Điệp 24.500.000, A Ước 21.250.000; chuyển sang bảng lương UI-25 (nhóm lương sửa chữa).
- **Ứng chi vật tư:** mỗi thợ mỗi kỳ có tiền **ứng chi**; **chi thực tế** = tổng vật tư trong sổ; chênh lệch = chi thực tế − ứng chi (dương: công ty hoàn thêm cho thợ; âm: thợ nộp lại). Tháng 8: A Điệp ứng 10.000.000, chi 8.231.000 → nộp lại 1.769.000; A Ước ứng 10.000.000, chi 13.750.000 → công ty hoàn thêm 3.750.000.
- **Theo dõi sơn** (Sheet4 tháng 5): số thùng sơn nhập, tồn theo điểm (T20, T42, T33, T28, VP), số thùng lấy cho phòng nào — [P] danh mục vật tư đơn giản theo điểm, không phải phân hệ kho đầy đủ.
- **Quyền:** thợ/nhân viên kỹ thuật nhập việc; kế toán xác nhận tiền công, vật tư, ứng chi; admin/kế toán duyệt khoản khấu trừ khách.

### 3.11. Trang dùng chung để vận hành

**UI-37 — Import dữ liệu và danh sách lỗi** `[P] hỗ trợ nhập từ Excel nguồn`

- **Loại:** chủ nhà/tòa/phòng, khách/hợp đồng, chỉ số, thu tiền, chi phí, hoa hồng và số dư mở kỳ theo template từng đối tượng. **Action:** tải template CSV/XLSX → upload → preview mapping cột → kiểm tra mã tòa/phòng/lượt thuê, kiểu tiền/ngày, mã trùng, nguồn file/kỳ → nhập hợp lệ hoặc xuất file dòng lỗi. Nhập lại cùng mã nguồn không được tăng đôi doanh thu/chi phí; ô `#REF!` và liên kết ngoài chưa có dữ liệu bị chặn hoặc gắn lỗi rõ.
- **Giới hạn:** không biến ô tổng trong báo cáo thành phiếu thu; ngày giao dịch thiếu không được tự gán bằng tháng trên tên file. Đối chiếu số dư mở kỳ trước khi tính báo cáo/lương.
- **[X] Quy tắc import riêng cho file mẫu:** (1) sheet hóa đơn: dòng 1 là số thứ tự cột, dòng 2–4 là tiêu đề/tổng, dữ liệu từ dòng 5 (NHÀ G từ dòng 6); **không import ô tổng dòng 3–4** (vùng `SUBTOTAL` không phủ hết dữ liệu, ví dụ `AV5:AV512`). (2) Ô “đã đóng” dạng `=a+b+c` được tách thành **nhiều lần thu** chưa có ngày (ngày lấy từ ghi chú nếu có, ví dụ “5/9 tt đủ”, còn lại đánh dấu cần bổ sung). (3) Ô tổng gõ số cứng thay công thức (103T25) hoặc công thức bỏ sót khoản (101S8) → gắn cảnh báo “tổng nguồn ≠ tổng tính lại” (kỳ 9: 9 hóa đơn, danh sách ở UI-11). (4) Ghi chú hóa đơn được phân loại gợi ý (phá HĐ, bỏ cọc, chuyển phòng, chủ nhà, hỗ trợ giá, ở nhờ, tiền mặt/BIDV) để người import xác nhận thành sự kiện nghiệp vụ. (5) SRC-09, SRC-06: import từng dòng, không lấy số tổng; dòng không có mã tòa vào danh sách lỗi.

**UI-38 — Danh mục, kỳ và quyền** `[P] cần để 10 menu dùng cùng dữ liệu`

- **Danh mục:** tòa/phòng/khu vực/T–S–G, trạng thái phòng/hợp đồng/giao dịch, loại phí và đơn vị, loại chi phí/quỹ, nhân sự/chức vụ, chính sách lương có phiên bản, quyền theo vai trò và tòa. **Kỳ:** ngày mở/khóa hóa đơn, thu chi, lương, báo cáo và cổ đông; nguồn mẫu đối chiếu, người chốt, phiên bản.
- **Action:** thêm/sửa giá trị có ngày hiệu lực, phân quyền, khóa kỳ, tạo dòng điều chỉnh có lý do (xem [GĐ] khóa kỳ), xem log thay đổi quan trọng. Quyền xem dữ liệu nhạy cảm kiểm tra ở cả danh sách, chi tiết, tìm kiếm, export và Mini App nếu tích hợp.
- **Tham số hệ thống bổ sung v1.4 (có ngày hiệu lực):** mốc cảnh báo hết hạn HĐ 35 ngày (CH-09); số ngày chuyển công nợ 5 (CH-14); mốc thu lương 5/10/15 và hệ số 100%/90%/70% (SRC-05); ngày chốt số liệu và khoảng hạn thanh toán (mặc định chốt 22, hạn 25–cuối tháng trước); mức phạt trễ hạn 200.000đ/ngày (`OQ-12`); khấu hao hoàn cọc 200.000đ/phòng (CH-17); nhắc bảo dưỡng trước 7 ngày (CH-32); nhắc kỳ trả chủ nhà; tài khoản nhận tiền theo tòa; bảng bậc lương vận hành và quy tắc cận; lương cố định/phòng theo tòa; danh mục kênh nguồn khách (CH-18); danh mục lý do phá HĐ.
- **[GĐ] Khóa kỳ (v1.9):** khi khóa, số báo cáo được chốt (ảnh chụp); sau khóa **chặn mọi thao tác ghi** và thay đổi có hiệu lực trong kỳ; sửa bằng **dòng điều chỉnh** (tòa × dòng báo cáo, bắt buộc lý do) cộng vào báo cáo **kỳ gốc**.

**UI-39 — Thông báo Zalo ZNS** `[KH] SRC-11 CH-34–CH-37; 00_SCOPE_3_PHASE.md (Phase 1)`

- **Cấu hình:** kết nối Zalo OA + ZNS; danh sách **mẫu ZNS** (tên, nội dung có biến như mã phòng, kỳ, số tiền, hạn, nội dung CK; trạng thái đăng ký/Zalo duyệt; chi phí/tin). **Quy tắc gửi do người dùng tự đặt (CH-34):** sự kiện/điều kiện (ví dụ hóa đơn phát hành, còn nợ sau ngày X, sắp hết HĐ 35 ngày, hoàn cọc đã chi, lịch bảo dưỡng), phạm vi tòa/loại phòng, thời điểm gửi (giờ, số ngày trước/sau mốc), mẫu dùng, có/không lặp lại.
- **Người nhận (CH-35, CH-36):** Timehouse chủ động gửi theo SĐT, không cần khách follow OA. Khách chưa liên kết/gửi lỗi → **phương án dự phòng** [P] SMS hoặc giao việc gọi điện cho NV phụ trách phòng; trạng thái liên kết Zalo hiển thị ở UI-06 (SRC-02 “đã liên kết zalo”).
- **Đợt gửi và lịch sử:** tạo đợt gửi thủ công (ví dụ nhắc tiền theo tòa), xem trước danh sách người nhận, gửi, theo dõi trạng thái từng tin (chờ/đã gửi/đã nhận/lỗi + lý do), chi phí; lịch sử theo khách/phòng ở UI-07 và UI-14.
- **Hộp thư phản hồi (CH-37):** tin khách trả lời được **đồng bộ vào hệ thống**, gán cho **trưởng phòng phụ trách** tòa/phòng (theo phân công UI-24), có trạng thái xử lý và ghi chú; không dùng Zalo để xác nhận thanh toán thay phiếu thu UI-13.
- **Ràng buộc:** chỉ gửi số tiền/nội dung đã phát hành; không gửi dữ liệu nhạy cảm ngoài mẫu đã duyệt; mọi lần gửi có log người/quy tắc kích hoạt.

### 3.12. Quy tắc tính tiền dùng chung (bổ sung v1.4, bằng chứng SRC-08)

**a) Kỳ hóa đơn và hạn thanh toán** [X]

- Tiền nhà **trả trước**: hóa đơn tháng N chốt số liệu khoảng **ngày 22 tháng N−1** (`HĐ (VP)!I5` = 22/08/2026 cho hóa đơn tháng 9), hạn thanh toán **từ ngày 25 đến cuối tháng N−1** (B20, J7 “hạn 31/8”), trễ hạn phạt 200.000đ/ngày (J7 — Excel không có cột phạt, `OQ-12`). Dịch vụ trên hóa đơn tháng N là lượng dùng đến ngày chốt.
- Thực tế thu tháng 9: ghi chú ngày thanh toán tập trung **5/9 (62), 7/9 (29), 8/9 (20), 10/9 (10)**; lũy kế **89,0% tại mốc 5, 97,9% tại mốc 10, 98,4% tại mốc 15**.
- **Công nợ:** sau 5 ngày kể từ khi có hóa đơn (CH-14); **[GĐ OQ-12]** tính sau hạn → công nợ từ **ngày 6 tháng N**; **đóng đúng hạn** = đủ tiền trước hết ngày 5 tháng N; phạt 200.000đ/ngày chỉ in, không tự cộng. **Mốc 5/10/15 không phải hạn thanh toán** mà là mốc đo tiến độ và tính lương (UI-25).

**b) Tháng lẻ (khách vào/ra giữa tháng)** [X]

- **Số ngày tính = số ngày của tháng − ngày vào + 1** (đếm cả ngày vào); **mẫu số = số ngày thực của tháng** (tháng 7, 8, 10 chia 31; tháng 9 chia 30). Bằng chứng kiểm được trên kỳ 9 (sửa v1.9): **22 hóa đơn `PHÒNG MỚI THÁNG 9`** chia theo số ngày thực của tháng, tính cả ngày vào (ví dụ vào 6/9 → `(3.500.000/30)×25`); **13 dòng “Thu khác” kỳ 9** (gồm 403T20: 6 ngày tháng 8 → `/31×6`, còn thiếu 892đ); **3 ngoại lệ Excel gắn cờ**: 304T35 (vào 7/9, Excel tính 22 ngày, đúng là 24), 101G18 (chia 31 trong tháng 9, chia ngày ngay trong đơn giá) và 404S4 (hệ số 0,5378 thay vì 23/30); ô `G17!I12` (đã ghi nhận là lỗi nhập ở v1.8) cần đối chiếu thêm khi có danh sách ngoại lệ chi tiết. Con số “106 công thức” cũ bỏ: quét SRC-08 có 300 ô công thức chia ngày trên 242 dòng, rải nhiều tháng (ví dụ vào 10/7 → `/31×22`); không cách lọc nào ra đúng 106.
- **Tiền phòng** chia theo `ngày tính tiền phòng`; **dịch vụ cố định** (mạng, vệ sinh, thang máy, xe, máy giặt, combo) chia theo `ngày bắt đầu tính dịch vụ` riêng (số ngày dịch vụ có thể khác tiền phòng, ví dụ “15/9 mới tính dv”).
- **Không chia ngày:** cọc (thu đủ 1 tháng tiền phòng), nợ cũ, điện/nước theo chỉ số (khách mới có chỉ số cũ = chỉ số lúc nhận phòng).
- **Thu khác = tiền những ngày lẻ của tháng trước** (tiền phòng và có thể cả dịch vụ) chưa thu, cộng vào hóa đơn tháng sau: `N = ((giá + DV)/31) × số ngày` (NHÀ S!N44, N382, G16!N14) hoặc `(giá/31) × số ngày` (NHÀ T!N181). In thành **dòng 13** trên hóa đơn (UI-12).
- Excel không dùng hệ số “Ngày ở/Ngày DV” để chia (luôn 30) mà quy đổi thẳng vào đơn giá; web lưu **số ngày và mẫu số** trên dòng hóa đơn để giải thích, chỉ chia một lần.

**c) Ánh xạ trạng thái thu** [X] — công thức `AY` của SRC-08 (so sánh Tổng cần đóng AV và Tổng đã đóng AX):

| Trạng thái Excel | Điều kiện Excel | Trạng thái thu trên web |
|---|---|---|
| Chưa TT | AV > 0 và AX = 0 | Chưa thu (đã phát hành) |
| Thiếu | AX − AV < 0 | Thu một phần (nợ = AV − AX) |
| Đủ | AX = AV | Đã thu đủ |
| Thừa | AX − AV > 0 | Thu thừa (dư = AX − AV, chuyển kỳ sau hoặc hoàn); trên web chỉ từ import hoặc kế toán xác nhận — xem [GĐ] dưới bảng |
| Đóng cọc | AX > 0 và AV = 0 | Khoản đặt cọc/trả trước chưa có hóa đơn (gắn deal UI-21) |
| Trống | AV = 0 và AX = 0 | **Không tạo hóa đơn** — trạng thái phòng lấy từ UI-03, không suy từ hóa đơn bằng 0 |

Trạng thái vòng đời (nháp/đã phát hành/đã điều chỉnh) và “quá hạn/công nợ” (theo a) là hai trục riêng. Excel tháng 9: NHÀ T 458 Đủ / 24 Thừa / 17 Thiếu / 4 Chưa TT / 1 Trống; NHÀ S có một ô trạng thái lỗi (giá trị 30).

**[GĐ] Trạng thái “Thừa” trên web (v1.9):** phân bổ phiếu thu không vượt số còn phải thu; tiền thừa nằm ở **số dư chưa phân bổ của phiếu** (trả trước) nên hóa đơn web hiện **“Đủ”**. “Thừa” chỉ đến từ dữ liệu import Excel hoặc khi kế toán xác nhận cho phân bổ vượt.

**d) Phá HĐ, bỏ trốn, bỏ cọc** [X]

- Khách **phá HĐ/bỏ trốn không được hoàn cọc** (20/20 phòng phá HĐ tháng 9 không có trong sheet HOÀN CỌC); cọc cũ bằng 1 tháng tiền phòng (502T11: cọc 3.000.000 = giá 3.000.000).
- **Khoản còn phải thu = tiền điện theo chỉ số** (`DS phòng phá hđ` cột “Tổng phải thu” chỉ cộng cột T tiền điện; ghi chú “kh phá hd, thu tiền điện”). Dòng của khách phá HĐ ở sheet NHÀ vẫn ghi đủ tiền phòng + dịch vụ với trạng thái “Chưa TT” — web **không** coi phần đó là công nợ. Có phải thu thêm nước/dịch vụ khác không: `OQ-03`.
- Tiền điện phá HĐ không thu được chuyển sang danh sách “điện nước không thu được” (UI-10). Tiến độ thu tách phá HĐ (UI-01). Báo cáo loại tiền phòng của phòng phá HĐ khỏi doanh thu tiền phòng (G1 `C12 = I2 − I17 + …`) và đếm số phòng phá HĐ (dòng 7).
- **Bỏ cọc:** cọc thành doanh thu “Cọc khách bỏ không ở” (UI-21), không hoàn.

**e) Khách của chủ nhà / phòng chủ nhà ở** [X] — xem UI-03. Phòng chủ nhà ở: hóa đơn chỉ có dịch vụ. Khách của chủ nhà đã đóng tiền cho chủ: ghi bù trừ nghĩa vụ trả chủ nhà (UI-05), không là công nợ. Có tính vào số phòng lương, hiệu suất và doanh thu báo cáo hay không: `OQ-14`.

## 4. Luồng liên thông trọng yếu

Mỗi flow ghi rõ màn hình tạo dữ liệu gốc, màn hình tiêu thụ và điều kiện chuyển. Mũi tên không hàm ý thao tác chạy tự động nếu chưa nêu trong action.

| Flow | Chuỗi màn hình/action | Dữ liệu gốc và kiểm tra không đếm trùng |
|---|---|---|
| F01 Nhận tòa | UI-04 chủ nhà/HĐ → UI-02/UI-03 tòa/phòng → UI-24 phân công → UI-34 tài sản → UI-05 lịch trả | Một HĐ giá theo hiệu lực; cọc chủ nhà riêng với giá thuê; chi thực một lần UI-15 |
| F02 Lead đến ở | UI-20 khách xem → UI-21 chốt → UI-13 thu đặt trước → UI-07 lượt thuê → UI-08 OCR → UI-09 giá → UI-03 bàn giao | ID lead, deal, lượt thuê và phòng khác nhau; chốt chưa có nghĩa đã ở |
| F03 Phòng mới giữa tháng | UI-07 ngày tính tiền phòng + ngày bắt đầu DV → UI-09 biểu phí → UI-11/UI-12 hóa đơn phòng mới (tháng lẻ §3.12b) → hóa đơn tháng sau có dòng 13 Thu khác nếu còn ngày lẻ chưa thu → UI-27/UI-28 | Dòng phòng mới lấy cách tính từ sheet SRC-08, mỗi lượt thuê/phòng/kỳ đưa lên báo cáo một lần; cọc là khoản riêng, không chia ngày; cùng phòng có khách cũ phá HĐ thì hai lượt thuê, hai hóa đơn, hai mã KH |
| F04 Dịch vụ hàng tháng | UI-09 biểu phí hợp đồng + UI-10 chỉ số/người/xe → UI-11 nháp → UI-12 rà soát/phát hành | Giá snapshot và kỳ sử dụng; điện/nước riêng và chung không thu hai lần |
| F05 Thu tiền | UI-12 phải thu → UI-13 từng khoản nhận và phân bổ → UI-14 nợ/dư → UI-01 tiến độ → UI-25 mốc lương → UI-27 báo cáo | Ngày thu và kỳ nghĩa vụ riêng; tiền trả trước nhiều tháng không nhân vào tiền thu nhiều kỳ |
| F06 Kết thúc/hoàn (hết hạn HĐ) | UI-07 kết thúc và bàn giao → UI-18 phí (khấu hao 200k/phòng, sửa chữa/vệ sinh thực tế), BC/BD, admin/kế toán duyệt, ghi chi hoàn → UI-17 theo dõi → UI-27/UI-28 | Giao dịch hoàn cọc ghi riêng tại UI-18, không nhập lại thành chi phí thông thường ở UI-15; chốt BD khác ngày thực chi, BD âm không tạo chi âm theo PA-03; tiền điện khấu trừ vào cọc là doanh thu điện; phá HĐ đi theo F12 |
| F07 Chi phí đến lợi nhuận | UI-04/UI-05 thuê chủ nhà + UI-15 chi phí gốc → UI-16 phân bổ → UI-28 kết quả tòa → UI-27 tổng/KD | Một chi phí nhập một lần, báo cáo dùng cơ sở kỳ riêng; thiết bị/cọc xử lý theo sheet mẫu |
| F08 Lương | UI-24 nhà/phòng phụ trách + UI-12 nghĩa vụ + UI-13 tiền thu các mốc → UI-25 bảng tính/kiểm tra → UI-15 ghi chi lương → UI-27 | Tính theo quy tắc cận gần nhất đã đối chiếu 98 ca SRC-03; các ca còn mở của OQ-01 (HS>100, HS<70, phòng khác) phải duyệt tay trước khi chi; sau khóa chỉ điều chỉnh có vết |
| F09 Cổ đông | UI-31 tỷ lệ/kỳ + UI-28 C22/C73/C74 → UI-32 bảng kê G1 → UI-33 góp/chi thực | Tổng tỷ lệ 100%; M là kết quả tính, giao dịch thực trả riêng |
| F10 Bảo trì | UI-34 thiết bị → UI-35 lịch/kết quả → UI-15 chi phí → UI-16 phân bổ → UI-28 báo cáo | Chứng từ bảo trì gốc một lần, thiết bị không tự tạo khấu hao |
| F11 Leader theo dõi team | UI-23 cơ cấu/chọn leader → UI-24 lịch sử team và phân công → UI-03 phòng / UI-14 nợ và nhắc thu / UI-35 việc bảo trì / UI-20–UI-21 lead/deal → bản ghi nguồn | Quyền theo nhánh và ngày hiệu lực; người phụ trách, người nhắc, người thực nhận tách biệt; thay team không ghi đè lịch sử hoặc cộng lặp số tiền |
| F12 Phá HĐ / bỏ trốn / bỏ cọc | UI-07 kết thúc thuê chọn loại + lý do → (phá HĐ/bỏ trốn) khoản phải thu tiền điện theo chỉ số, cọc giữ lại → UI-14 nhóm phá HĐ → nếu không thu được: UI-10 điện nước không thu được; (bỏ cọc) UI-21 hủy deal, cọc thành doanh thu → UI-03 kiểm tra/dọn phòng (CH-21) → phòng trống sẵn sàng → UI-01/UI-27 | Không lập phiếu hoàn UI-18; không tính toàn bộ tiền phòng kỳ thành công nợ; khách mới vào cùng phòng là lượt thuê riêng |
| F13 Thông báo Zalo | UI-39 quy tắc/đợt gửi ← sự kiện từ UI-12 phát hành, UI-14 quá hạn, UI-06 sắp hết HĐ, UI-18 đã hoàn, UI-35 bảo dưỡng → gửi ZNS → dự phòng SMS/gọi → phản hồi đồng bộ về trưởng phòng | Chỉ gửi số đã phát hành; tin nhắn không thay phiếu thu; mỗi lần gửi có log |
| F14 Dự kiến lợi nhuận | UI-40 tạo bản dự kiến (ngày lập, phạm vi tòa) ← thực thu hóa đơn/phòng mới (UI-13), công nợ dự kiến (UI-14), cọc mới (UI-21/UI-13), hoàn cọc (UI-17), mua sắm (UI-15) + chi phí dự kiến → hai kết quả dòng tiền / kinh doanh → so sánh với UI-29/UI-30 khi chốt kỳ | Một bộ đầu vào cho hai kết quả; điều chỉnh tay có lý do; khấu hao 1,6%/tháng chỉ ở bản kinh doanh |
| F15 Âm dương điện nước | UI-10 chỉ số (gồm phòng trống) + UI-12 dòng điện/nước/dịch vụ + UI-13 thực thu + UI-18 khấu trừ cọc + UI-03/UI-15 hóa đơn nhà cung cấp theo tòa → UI-43 | Phải thu lấy từ hóa đơn đã phát hành, chi lấy từ hóa đơn nhà cung cấp; không nhập tay số phải thu; tòa trả điện qua chủ nhà gắn cờ |
| F16 Sửa chữa, vệ sinh | UI-47 thợ ghi việc (tiền công, vật tư, lý do, bên chịu) → kế toán xác nhận, quyết toán ứng chi → khoản công ty chịu sang UI-15 / khoản khách chịu sang UI-18 hoặc UI-12 / tiền công sang lương UI-25 → UI-44 báo cáo, UI-42 chi phí phát sinh, UI-29 | Mỗi việc là một dòng gốc; không nhập lại chi phí sửa chữa ở UI-15; kỳ sổ 26 → 25 |

### 4.1. Quy tắc trạng thái liên đối tượng

| Đối tượng | Trạng thái khuyến nghị [P] | Sự kiện làm đổi trạng thái | Không được suy ra |
|---|---|---|---|
| Phòng | đang ở, trống sẵn sàng, trống cần xử lý, dừng khai thác | bàn giao, khách trả, vệ sinh/sửa xong, khóa khai thác | hóa đơn bằng 0 ⇒ phòng trống |
| Deal kinh doanh | đã xem, đã chốt, chờ nhận, đã nhận, hủy/chuyển | sale ghi giao dịch, bàn giao thực tế | đã chốt ⇒ hợp đồng đã bắt đầu |
| Hợp đồng/lượt thuê | nháp, chờ nhận, hiệu lực, sắp hết hạn (cờ cảnh báo), kết thúc — **loại kết thúc:** hết hạn, phá HĐ, bỏ trốn, bỏ cọc, chuyển phòng | xác nhận HĐ, ngày bắt đầu, gia hạn, kết thúc | đến mốc cảnh báo 35 ngày ⇒ tự gia hạn; phá HĐ ⇒ nợ toàn bộ tiền phòng kỳ |
| Hóa đơn | vòng đời: nháp, đã phát hành, đã điều chỉnh; thu: chưa thu, thu một phần, thu đủ, thu thừa (§3.12c); hạn: trong hạn, **công nợ** (sau 5 ngày, CH-14) | phát hành, phân bổ phiếu thu, qua mốc | đã phát hành ⇒ đã thu; hóa đơn bằng 0 ⇒ phòng trống |
| Cọc/hoàn | chưa nhận, đang giữ, chờ tính hoàn, đã xác nhận, đã chi hoàn, **giữ cọc do phá HĐ/bỏ trốn**, **cọc bỏ (thành doanh thu)** | nhận cọc, chốt phiếu, ghi chi, kết thúc loại phá HĐ/bỏ cọc | BD dương ⇒ đã chuyển tiền |
| OCR | mới tải, đang xử lý, chờ rà soát, đã xác nhận, lỗi/thiếu trang | upload, chạy OCR, nhân viên xác nhận | OCR tự đọc ra giá ⇒ áp dụng được ngay |

### 4.2. Bộ dữ liệu chung và khóa liên kết

| Dữ liệu | Khóa/quan hệ tối thiểu | Lý do |
|---|---|---|
| Tòa/phòng | `building_id`, `room_id`, mã hiển thị, khu vực/T–S–G | đổi tên mã hiển thị không phá chứng từ cũ |
| Người và lượt thuê | `customer_id`, `stay_id`, `contract_id`, phòng, hiệu lực từ–đến | cùng phòng qua nhiều khách; cùng khách chuyển phòng |
| Deal | `lead_id`, `view_id`, `deal_id`, liên kết stay khi nhận | sale và vận hành dùng cùng giao dịch mà không trùng doanh số |
| Bảng giá và hóa đơn | `rate_version_id`, `invoice_id`, `invoice_line_id`, kỳ tiền phòng/kỳ dịch vụ | giữ đúng giá và kỳ đã áp dụng |
| Thu/chi | `payment_id`, các `allocation_id`, `expense_id`, ngày thực tế/ngày nhập/kỳ | truy ngược nợ, lương, báo cáo và điều chỉnh |
| Tổ chức và trách nhiệm | `org_unit_id`, `position_id`, `employee_id`, quan hệ leader–thành viên có hiệu lực; `assignment_id`, loại trách nhiệm, phạm vi, từ–đến; người giao/nhận/thực hiện trên việc; `received_by`, `recorded_by` trên phiếu thu | truy vết team tại thời điểm và lọc công việc, phòng, khoản nhắc thu mà không suy người thu từ sơ đồ tổ chức |
| Phân bổ/lương/cổ đông | `allocation_run_id`, `payroll_run_id`, `share_run_id`, kỳ, phiên bản, trạng thái chốt | tái hiện kết quả theo đúng chính sách/bộ lọc của kỳ |

## 5. Câu hỏi mở và giả định làm việc [GĐ]

Mỗi câu hỏi còn mở có một **giả định làm việc [GĐ]** suy ra từ số liệu và công thức trong file mẫu, để dựng được nghiệp vụ và báo cáo ngay. Web áp dụng GĐ như **tham số cấu hình có ngày hiệu lực** (UI-38): khi khách trả lời khác, đổi tham số, không đổi cấu trúc dữ liệu. Độ tin cậy: **Cao** = có công thức/số liệu khớp trực tiếp; **TB** = suy ra từ nhiều nguồn cùng chiều; **Thấp** = không có ca trong dữ liệu, chọn phương án an toàn. Trong thân tài liệu, chỗ nào ghi `OQ-nn` thì áp dụng GĐ tương ứng dưới đây.

| Mã | Câu hỏi | Giả định làm việc [GĐ] | Căn cứ số liệu | Tin cậy | Màn hình |
|---|---|---|---|---|---|
| OQ-01 | Lương vận hành: quy tắc bậc, HS>100, HS<70, thâm niên, V51, tòa lương cố định, lương trưởng nhóm, lương phòng khác | (a) Bậc theo **cận gần nhất**: trong bậc [a; a+5], HS < a+2,5 dùng mức thấp/a, còn lại mức cao/(a+5). (b) **HS>100 không chặn trần**, tính theo cận 100. (c) **HS<70:** lương/phòng = 10% × mức thấp nhất của bậc 70–75 theo thâm niên (6.000 hoặc 6.500đ). (d) Thâm niên “trên 1 năm” khi đủ 12 tháng tính đến **ngày cuối kỳ lương**. (e) V51 là **lỗi nhập**, tính lại theo (a): HS 97,26 → 120.000/95 = 122.855đ/phòng (Excel 126.442). (f) **Tòa mới nhận** hưởng cố định 100.000đ/phòng, mặc định **3 tháng vận hành đầu**, admin chuyển sang HS sớm hơn được. (g) Lương TPVH/TNVH = 10.000đ × tổng phòng các tòa của NV vận hành trong nhánh. (h) Sale: lương cứng × ngày công/26 + phụ cấp + hoa hồng UI-22; kỹ thuật, thị trường, kế toán, QL tổng: lương cố định + phụ cấp nhập tay | Bảng lương T8: (a) khớp 97/98 dòng; (b) V50 HS 103,21 → 134.171, V131 HS 105,74 → 126.887; (c) không có ca HS<70; (f) G12A, G13, G14 (tòa mới nhất T8) = 100.000, G10, G11 đã theo HS, G15 chưa có; (g) G10 `=774*10000`, G11 `=408*10000`; (h) D140+E140 = 2.500.000×25/26 | a, b, d, h: Cao · e, f, g: TB · c: Thấp | UI-25 |
| OQ-02 | Thu sau ngày 15; đổi quản lý giữa tháng; cọc mới thu sau ngày 5 | Tiền thu sau ngày 15 **không vào lương** kỳ đó (không chuyển kỳ sau). Tòa đổi NV quản lý trong tháng: lương tòa tính cho **người phụ trách tại ngày 15** (ngày chốt mốc cuối). Cọc mới thu sau ngày 5: trừ ở mốc chứa ngày thu (M2 hoặc M3), trước khi nhân 90%/70% | SRC-05 chỉ có 3 mốc 5/10/15; bảng lương T8 không có tòa chia hai người; 48/98 dòng trừ cọc bằng số cứng ở L và M | TB | UI-13, UI-24, UI-25 |
| OQ-03 | Phá HĐ phải trả gì; phí khấu trừ vượt cọc | Phá HĐ/bỏ trốn: **giữ cọc**, chỉ thu **tiền điện theo chỉ số**, không thu tiền phòng, nước, dịch vụ còn lại. Hết HĐ mà phí khấu trừ > cọc: phần vượt thành **công nợ của lượt thuê** | `DS phòng phá hđ` cột “Tổng phải thu” = Σ cột T (tiền điện), 16.048.000; 20/20 phòng phá HĐ không có phiếu hoàn; ghi chú “kh phá hd, thu tiền điện”; không có ca BD<0 trong HOÀN CỌC | Phá HĐ: Cao · vượt cọc: Thấp | UI-07, UI-14, UI-18 |
| OQ-04 | Mẫu số phân bổ chi phí chung | Mẫu số = **tổng số phòng hệ thống của kỳ** tại ngày chốt; ô 1.343 ở G1 C43 tháng 8 là sót từ tháng 7, không tái hiện | 1.382 = tổng phòng bảng lương T8; mẫu số tăng dần 1.204 → 1.382 theo tháng; tháng 7 dùng 1.343 cho mọi dòng | Cao | UI-16 |
| OQ-05 | File liên kết thiếu | Không chặn: số của “cập nhật thu tiền tháng 8” và “chi phí văn phòng tháng 8” do web tự sinh từ UI-13/UI-14 và UI-15; số lịch sử lấy theo giá trị hiển thị trong G1 | G1 dùng file ngoài `[17]`, `[19]`; các giá trị cache còn đọc được | Cao | UI-37 |
| OQ-06 | Ba loại phòng trống; lấp đầy, thời gian trống; chuyển đổi; hiệu suất/lợi nhuận/thời gian vận hành tòa | **Trống ở luôn** = phòng trống sẵn sàng, chưa có deal. **Trống hết tháng** = phòng có lượt thuê kết thúc trong tháng (hết HĐ, báo trả, phá HĐ), trống từ cuối tháng. **Đang chờ** = đã chốt cọc, khách chưa vào ở. **Lấp đầy** = phòng-ngày có lượt thuê tính tiền / phòng-ngày khai thác (loại phòng không có giá thuê). **Thời gian trống** = trung bình số ngày từ ngày ngừng tính tiền lượt cũ đến ngày bắt đầu tính tiền lượt kế tiếp. **Chuyển đổi** = số khách có deal chốt / số khách có lượt xem, theo tháng của ngày xem. **Thời gian vận hành tòa** = số tháng từ ngày nhận nhà (HĐ chủ nhà). HS tòa = HS UI-25; lợi nhuận tòa = LNR cột tòa | SRC-02 KINH DOANH C18 “ở luôn, cuối tháng, đang chờ”; `PHÒNG MỚI THÁNG 10` = 26 phòng đã cọc chờ vào 1/10; SRC-13 E22 “khách xem/khách chốt”; SRC-04 có LNR theo cột tòa | TB | UI-01, UI-02, UI-45, UI-46 |
| OQ-07 | Dự kiến, LN/vốn, LN/tài sản, hoàn vốn cổ đông | Dự kiến và LN/vốn, LN/tài sản đã có định nghĩa (UI-40, UI-41). **Hoàn vốn cổ đông ngoài phạm vi** (không có trong SRC-13); dữ liệu vốn góp vẫn lưu ở UI-33 | SRC-13, SRC-14 | Cao | UI-33, UI-40, UI-41 |
| OQ-08 | Làm tròn chia cổ đông; “CHUNG”; ý nghĩa cột “Vốn” | Làm tròn từng dòng đến đồng, **chênh lệch làm tròn dồn vào dòng CHUNG**. “CHUNG” = **quỹ chung công ty**. Cột **Vốn** = phần tiền thuê nhà của tháng mà cổ đông đã góp theo tỷ lệ; **Tổng nhận = hoàn lại tiền nhà đã góp + LN ròng** | CH-29: cổ đông đóng tiền nhà cho chủ theo % góp; G1: `H = G×C22/100` với C22 = tiền thuê 1 tháng, `M = H + J`; lệch 0,33đ giữa G1 và SRC-04 | TB | UI-32, UI-33 |
| OQ-09 | Leader/NV vận hành xem công nợ; ai xác nhận thu | Leader, NV vận hành thấy **trạng thái Đủ/Thiếu/Chưa TT và số còn nợ** của phòng được giao, không thấy báo cáo tổng tiền. **Chỉ kế toán/admin** tạo và xác nhận phiếu thu | CH-01 “admin và kế toán” | Cao | §1.1, UI-13, UI-14 |
| OQ-10 | Báo cáo kinh doanh có cộng lại hoàn cọc, có khấu hao không | **BC kinh doanh = BC tổng − cọc mới + hoàn cọc − mua sắm thiết bị + khấu hao kỳ** (hoàn cọc không bị trừ, thiết bị theo khấu hao OQ-11). Sheet KD tháng 8 (chỉ trừ cọc mới, thiết bị = 0) coi là **chưa cập nhật**; web hiển thị cầu nối về số Excel. Tháng 8 theo GĐ: DT KD **6.769.375.010** (= 6.664.406.236 + hoàn cọc 104.968.774); CP KD **5.979.043.347** (= 5.978.477.267 + khấu hao 35.380.000 × 1,6% = 566.080, khi chưa có số dư thiết bị trước tháng 8); LNR KD **790.331.663** trên số Excel (sheet Excel ghi 685.928.969); trên số web **779.688.893** (= 790.331.663 − chênh chi phí 10.642.770, UI-29) | SRC-13 D6 và SRC-02!BÁO CÁO!D6: “k gồm cọc mới, hoàn cọc, mua sắm tb”; dự kiến KD 3–9/2026 không có hoàn cọc; CH-15 khấu hao; sheet KD tháng 8 `D3 = 2.527.702.129 − D4` | TB | UI-30 |
| OQ-11 | Phương pháp khấu hao | **Đường thẳng 1,6%/tháng trên nguyên giá từng khoản mua, cộng dồn** mọi khoản còn giá trị, từ tháng mua đến khi đủ 100% (62 tháng × 1,6% + tháng cuối 0,8%). Thanh lý hoặc trả nhà trước hạn: giá trị còn lại ghi một lần vào chi phí KD tháng đó. Số dư thiết bị trước khi dùng web nhập ở UI-37 | Mọi sheet dự kiến `=J3*1,6%`; 1/1,6% ≈ 62,5 tháng ≈ thời hạn 60 tháng HĐ chủ nhà SRC-10; công thức Excel chỉ tính trên khoản mua trong tháng (thiếu cộng dồn) | Tỷ lệ: Cao · cộng dồn: TB | UI-15, UI-30, UI-34, UI-40 |
| OQ-12 | Mốc chuyển công nợ; “đúng hạn”; phạt trễ | Hạn in trên hóa đơn: **25 → cuối tháng N−1**. **Công nợ từ ngày 6 tháng N** (= 5 ngày sau hạn). **Đóng đúng hạn** = đủ tiền trước hết ngày 5 tháng N; sau đó là quá hạn. Phạt 200.000đ/ngày **chỉ in trên hóa đơn, không tự cộng** | Ngày thanh toán thực tế tháng 9 tập trung 5/9 (62), 7/9 (29), 8/9 (20), 10/9 (10); lũy kế 89,0% tại mốc 5; lương tính 100% cho tiền thu đến ngày 5; không sheet nào có cột phạt | TB | §3.12, UI-14, UI-45 |
| OQ-13 | Kỳ ghi nhận hoa hồng; dòng báo cáo | Ghi nhận vào **tháng đủ điều kiện chi** (khách đóng đủ 1 cọc 1 và ký HĐ, CH-19) — thường trùng tháng chốt deal; báo cáo cộng vào **Phí marketing**; dự kiến marketing = cọc mới / 2 | SRC-09 chia sheet theo tháng; dự kiến dùng cọc mới **cùng tháng** × 50%; SRC-04 không có dòng HH riêng | TB | UI-15, UI-22, UI-29, UI-40 |
| OQ-14 | Phòng/khách của chủ nhà; G16–G18 | (a) Phòng **không có giá thuê** (chủ nhà ở, chỉ thu dịch vụ) **không tính** vào số phòng lương, HS, lấp đầy; phòng **có giá thuê** (kể cả chủ nhà ở, khách của chủ nhà) **có tính**. (b) Khách của chủ nhà đã đóng thẳng cho chủ: khoản này **trừ vào tiền trả chủ nhà** của kỳ, không là công nợ. (c) G16–G18 vào nhóm Nhà G từ tháng có hóa đơn đầu tiên; bản dự kiến lấy phạm vi tòa tại ngày lập | Bảng lương T8 so hóa đơn: S36 11 phòng → lương 10 (loại 701S36 giá 0); S4 23 → 22 (loại 101AS4 giá 0); T35 18 → 18 (203/204T35 có giá 3,0/3,2tr); dự kiến T9 “tính đến G15” | a: TB · b: Thấp · c: TB | UI-03, UI-05, UI-25, UI-45 |
| OQ-15 | Sạc xe điện và gửi xe | Dùng một loại phí **“xe điện”** như SRC-08 (cột XE ĐIỆN, in dòng “DV Gửi xe”); cho khai báo thêm loại “gửi xe thường” nhưng chưa có dữ liệu. Báo cáo: “Doanh thu xe điện”; âm dương: tính vào điện | Toàn bộ SRC-08 chỉ có cột XE ĐIỆN | Cao | UI-09, UI-12, UI-29, UI-43 |
| OQ-16 | Trừ tiền ngày ở thêm vào cọc | **Không trừ** trên phiếu hoàn; tiền ngày ở thêm (nếu còn) thu ở hóa đơn cuối của lượt thuê | 301T41: sheet ghi hoàn 2.530.000 và “Đã hoàn” (không trừ 1.103.226) | TB | UI-18 |
| OQ-17 | Bảng phase | Theo **§7** (v1.8): Phase 1 hóa đơn–thu tiền–hoàn cọc–Zalo (1A go-live) + nhân sự–lương–chi phí–báo cáo tòa–Báo cáo tổng/kinh doanh (1B chốt tháng), Phase 2 kinh doanh–báo cáo vận hành–chia cổ đông G1, Phase 3 dự kiến–hiệu quả vốn/tài sản–tài sản/bảo dưỡng/kiểm kê–góp vốn | Phụ thuộc dữ liệu §6; file Excel khách dùng hằng ngày (SRC-08) và chốt tháng (SRC-03/04/07/09/15/16); `00_SCOPE_3_PHASE.md` | Đề xuất, cần PM/khách duyệt | Toàn bộ |
| OQ-18 | HS báo cáo có trừ tỷ lệ dịch vụ như lương không | **HS báo cáo = HS lương = T / K × 100**, với T = A − A×B + C (A đã gồm hệ số 100/90/70% theo mốc; C gồm bỏ cọc và phòng phát sinh) | SRC-05 Bước 4 “DT tiền phòng thu được = A − (A×B) + C”, Bước 3 C gồm “khoản khách bỏ cọc” — cùng thành phần với SRC-13 E1 | Cao | UI-01, UI-25, UI-45 |
| OQ-19 | Dự kiến dòng tiền: thiết bị; ai nhập công nợ dự kiến và chi phí | Dự kiến dòng tiền **trừ toàn bộ** tiền mua thiết bị. Công nợ dự kiến thu (J6, J7) do kế toán nhập, **gợi ý = công nợ hiện tại × tỷ lệ thu được sau ngày lập của kỳ trước**. Chi phí dự kiến **gợi ý = thực tế tháng trước**, cộng tiền thuê của tòa mới | CH-15 “dòng tiền hạch toán một lần”; BC tổng T8 dòng 21 = 35.380.000 nguyên giá. Dự kiến T9 ≈ thực tế T8: nước 230tr/233,5tr; vệ sinh 43tr/43,2tr; kế toán 16,3tr/16,33tr; bảo vệ 5,5tr/5,5tr; thuê nhà 4.307tr/4.086tr (tăng tòa mới). J6 dự kiến 30tr so với công nợ thực 102,9tr | TB | UI-40 |
| OQ-20 | Điện phòng trống cộng vào thực thu | **Giữ như Excel**: tổng thu điện gồm tiền điện phòng trống/không thu được (coi là sản lượng đã đo qua công tơ phòng), đồng thời hiển thị **tách riêng** dòng này và chỉ tiêu “thu − chi tiền thực” không gồm nó | Cột H cộng `ĐIỆN NƯỚC PHÒNG TRỐNG`; sheet sản lượng cũng cộng kWh phòng trống → mục đích so sản lượng đo được với hóa đơn EVN | TB | UI-10, UI-43 |
| OQ-21 | Chia doanh thu combo/máy giặt; thực thu trong âm dương | Một chuỗi chia thống nhất: **combo (AQ) → 1/2 vệ sinh + 1/2 máy giặt** (BC); **phần máy giặt → 1/2 điện + 1/2 nước** (âm dương); **thang máy (AH), máy giặt riêng/máy sấy (AN), xe điện (AK) → 100% điện**. Thực thu = phiếu thu đã phân bổ cho dòng; chế độ “tương thích Excel” dùng thành tiền trên hóa đơn để đối chiếu số cũ | Âm dương `B = ΣAQ/2` trùng dòng máy giặt của BC KD; `K = H + B/2 + E`; `Q = N + B/2` | Cao | UI-29, UI-43 |
| OQ-22 | Lương sửa chữa, chi phí sửa chữa trong báo cáo | **Lương sửa chữa (báo cáo)** = phần cố định của thợ (lương cứng + thâm niên + ăn trưa), **phân bổ theo số phòng** như quỹ G1. **Tiền công + vật tư theo sổ** → dòng “Sửa chữa, thay thế, bảo trì”, **ghi thẳng vào tòa** của dòng sổ. Cầu nối với số Excel hiển thị trong giai đoạn chuyển đổi | G1 C43 `25.000.000/1.343×15` (phân bổ theo phòng); phần cố định 2 thợ = 2 × (7,5 + 3 + 0,7) = 22.400.000 ≈ “Lương sửa chữa” BC T8 24.099.776; tiền công/vật tư của sổ gắn với tòa từng dòng | Thấp–TB | UI-15, UI-16, UI-44, UI-47 |
| OQ-23 | Sổ vệ sinh; kỳ 26 → 25; “khách chi” | Không có sổ vệ sinh riêng: chi phí vệ sinh = việc “dọn phòng/vệ sinh” trong sổ UI-47 + lương vệ sinh (UI-15, theo tòa NV vệ sinh phụ trách). Kỳ 26 → 25 **chỉ cho sổ sửa chữa**. Dòng “khách chi” tạo **đề xuất khấu trừ** trên phiếu hoàn/hóa đơn, kế toán xác nhận mới trừ | Sổ T8: ≈ 54 lượt việc “dọn/vệ sinh”; BC T8 “Lương vệ sinh” 43.200.000; ghi chú “khách chi” 8 dòng | TB | UI-18, UI-44, UI-47 |
| OQ-24 | LN/vốn, LN/tài sản, biên LN tiền nhà | **LN/vốn** = LNR / Giá vốn (dòng “Tỷ lệ LNR/GV” của báo cáo nhà), tính theo báo cáo đang chọn, **mặc định Báo cáo kinh doanh**. **LN/tài sản** = LNR (kinh doanh) / (thiết bị đã mua còn giá trị theo khấu hao + giá trị tài sản công ty ở UI-34). **Biên LN tiền nhà** = DT tiền phòng / tiền thuê nhà 1 tháng | SRC-04 sheet nhà: dòng 51 `=D47/D48` (LNR/GV), dòng 59 `=D11/D21` (DT tiền nhà / giá thuê nhà); dự kiến KD dùng LNR/GV | Biên, LN/vốn: Cao · LN/tài sản: TB | UI-41 |
| OQ-25 | Cách tính doanh số sale | Doanh số = Σ **giá chốt** các deal có **ngày chốt** trong tháng; deal **hủy/bỏ cọc không tính** (hiện ở cột riêng); deal nhiều sale giới thiệu **chia đều** như hoa hồng | SRC-02 KINH DOANH C6 “ngày phát sinh giao dịch”, C11 “giá chốt”; SRC-09 chia trùng 25%/16,67% | TB | UI-46 |

## 6. Thứ tự làm chức năng theo phụ thuộc dữ liệu

1. **Nền dữ liệu:** UI-38 danh mục/quyền, UI-02–UI-04 tòa/phòng/chủ nhà, UI-23–UI-24 cơ cấu/leader/phân công theo hiệu lực, UI-37 import/số dư; kiểm chứng ID tòa–phòng–lượt thuê và đường từ leader đến phòng/việc/khoản cần nhắc.
2. **Khách và giá:** UI-19–UI-21 lead/deal, UI-06–UI-09 khách/hợp đồng/OCR/biểu phí; thử ca phòng mới và khách đổi phòng.
3. **Thu và chi:** UI-10–UI-18 chỉ số, hóa đơn, thu, nợ, chi phí, phân bổ, hoàn cọc theo quy tắc §3.12; thử trả trước nhiều tháng, thu một phần, BC>I, phí đầu vào, và **bộ ca kiểm thử SRC-08 tháng 9**: tháng lẻ (22 hóa đơn PHÒNG MỚI THÁNG 9, 13 dòng Thu khác, ngoại lệ 304T35, 101G18 và 404S4 — §3.12b), Thu khác (403T20), hai lượt thuê cùng phòng (20 phòng phá HĐ + phòng mới), bỏ cọc, phòng chủ nhà ở, hoàn cọc 301T41, tổng in 13 dòng = tổng cần đóng ở 1.471 hóa đơn kỳ 9 (9 hóa đơn lệch Excel nguồn gắn cờ, UI-11). UI-39 Zalo làm cùng giai đoạn này vì dùng sự kiện hóa đơn/công nợ.
4. **Kết quả và lương:** UI-25 bảng lương thử, UI-27 trung tâm báo cáo, UI-29/UI-30 tái hiện hai sheet báo cáo (UI-28 drill-down), UI-40 dự kiến (benchmark tháng 9/2026), UI-41–UI-42 hiệu quả/chi phí, UI-43 âm dương (benchmark tháng 6 nước, tháng 7 điện), UI-44 sửa chữa/vệ sinh (benchmark tháng 8), UI-45–UI-46 báo cáo vận hành/kinh doanh, UI-31–UI-33 chia cổ đông; dùng SRC-03/SRC-04/SRC-07/SRC-08/SRC-14/SRC-15/SRC-16 làm bộ benchmark. Lương tính theo GĐ OQ-01; các ca gắn cờ (HS<70, HS>100) duyệt tay trước khi chi.
5. **Tài sản/tài liệu/bảo dưỡng:** UI-26, UI-34–UI-36, UI-47 sổ sửa chữa/ứng chi vật tư (cần trước UI-44) và liên kết chứng từ, sau đó UI-01 dashboard lấy chỉ tiêu đã đối chiếu.

Thứ tự trên là **phụ thuộc thiết kế**, không tự xác nhận toàn bộ 47 màn hình là cam kết nằm trong một gói giá/Phase 1. Phân phase cụ thể ở §7; một screen ID có thể làm phần cơ bản ở phase trước và mở rộng ở phase sau, bảng §7 ghi rõ phần nào.

## 7. Phân chia 3 phase triển khai [P] (v1.8)

**Nguyên tắc chia:**

1. **Phase 1 thay file hóa đơn – thu tiền (SRC-08), bảng lương (SRC-03) và báo cáo kết quả (SRC-04, báo cáo tòa mẫu G1 SRC-07)**. Phase 1 có hai mốc: **1A go-live hóa đơn – thu tiền**, **1B chốt tháng đầu tiên** (lương, phân bổ, báo cáo). **Phase 2** thay các file còn lại của khách (hoa hồng SRC-09, chia cổ đông SRC-07, âm dương SRC-15, sổ sửa chữa SRC-16) và thêm báo cáo vận hành/kinh doanh. **Phase 3** là kế hoạch, đầu tư và tài sản.
2. Phase sau **chỉ đọc** dữ liệu phase trước, không nhập lại.
3. Mỗi phase nghiệm thu bằng **số liệu Excel thật của khách**; GĐ ở §5 liên quan phải được khách xác nhận trước khi làm phase đó.
4. Một screen ID có thể làm **phần cơ bản** ở phase trước và **mở rộng** ở phase sau; cột “Để lại” ghi rõ.

### 7.1. Phase 1 — Vận hành cho thuê, thu tiền, lương, chi phí và báo cáo kết quả

**Mốc 1A — go-live hóa đơn và thu tiền:** bỏ được file hóa đơn tháng (SRC-08).

| Nhóm | Màn hình | Làm trong Phase 1 | Để lại phase sau |
|---|---|---|---|
| Nền tảng | UI-38, UI-37 | Tài khoản, vai trò (admin, kế toán, quản lý/vận hành, leader chỉ xem trạng thái nợ theo `OQ-09`, trưởng phòng xem báo cáo theo CH-23), danh mục tòa T/S/G, loại phí, nhóm dòng báo cáo, kỳ, tham số GĐ có hiệu lực; import tòa, phòng, khách, HĐ đang hiệu lực, cọc đang giữ, công nợ đầu kỳ, chỉ số kỳ trước, **nhân viên, danh sách thiết bị đã mua (số dư khấu hao)** | Import bảng kê thu, lịch sử hoa hồng (P2) |
| Tòa nhà, chủ nhà | UI-02, UI-03, UI-04, UI-05 | Danh sách/chi tiết tòa, tab phòng (loại khai thác, phòng chủ nhà ở), mã nhà cung cấp điện/nước/mạng theo tòa (SRC-06); chủ nhà, HĐ đầu vào có **giá thuê theo hiệu lực** (dòng “Tiền thuê nhà 1 tháng”) và cọc chủ nhà; lịch trả tiền nhà và ghi chi | Tab tài sản (P3) |
| Khách, hợp đồng | UI-06, UI-07, UI-08, UI-09 | Khách và lượt thuê; lượt thuê **chờ nhận có cọc** (thay cho deal khi chưa có module Kinh doanh); ngày chốt, ngày tính tiền phòng, ngày bắt đầu dịch vụ; 5 loại kết thúc (hết hạn, phá HĐ, bỏ trốn, **bỏ cọc**, chuyển phòng); upload file HĐ (chưa OCR); biểu phí | OCR (P2); deal/lead UI-20, UI-21 (P2) |
| Nhân sự tối thiểu | UI-23, UI-24 | Danh sách nhân viên (chưa có lương); **phân công tòa/phòng có ngày hiệu lực từ ngày go-live** để phân quyền, lọc theo quản lý và làm lịch sử người phụ trách cho bảng lương 1B (`OQ-02`) | Hồ sơ lương, cơ cấu leader/team (1B) |
| Chi phí cơ bản | UI-15 | Ghi chi tiền thuê trả chủ nhà (từ UI-05), chi hoàn cọc, các khoản chi lẻ; mỗi khoản gắn **tòa hoặc quỹ chung** + **nhóm dòng SRC-04** ngay từ đầu | Import nhà cung cấp, hoa hồng, thiết bị, quỹ văn phòng (1B) |
| Hóa đơn | UI-10, UI-11, UI-12 | Chỉ số điện nước (gồm điện chung, phòng trống), số người/xe; tạo kỳ hàng loạt từ sheet nhà và phòng mới; tháng lẻ (§3.12); dòng 13 Thu khác; 4 mẫu in; nháp → phát hành → PDF | — |
| Thu tiền, công nợ | UI-13, UI-14 | Phiếu thu thủ công gồm **loại cọc mới**, thu một phần, trả trước nhiều tháng; lưu **ngày thu thực tế** và phân bổ **theo dòng hóa đơn**; trạng thái Chưa TT/Thiếu/Đủ/Thừa (Thừa chỉ từ import/kế toán xác nhận, §3.12c); phiếu cọc giữ phòng ghi sổ cọc; công nợ từ ngày 6 (`OQ-12`) | — |
| Hoàn cọc, phá HĐ | UI-17, UI-18 | Phiếu tính hoàn (khấu hao mặc định 200.000đ/phòng, tiền điện trừ cọc = doanh thu điện), admin + kế toán duyệt, ghi chi hoàn; luồng F12 (`OQ-03`, `OQ-16`) | — |
| Zalo | UI-39 | ZNS gửi hóa đơn, nhắc trước hạn/quá hạn, kiểm tra lại số nợ, log, gửi lại tin lỗi, dự phòng SMS/gọi | Đồng bộ hội thoại, sự kiện khác (P2, P3) |
| Dashboard | UI-01 | 3 loại phòng trống, phải thu/đã thu/còn nợ theo ngày, HĐ sắp hết hạn, Zalo lỗi, hoàn cọc đang xử lý; sau 1B thêm doanh thu tách tiền nhà/cọc mới/phá HĐ và LNR kỳ đã chốt | HS, lọc leader nâng cao (P2) |

**Mốc 1B — chốt tháng: nhân sự, lương, chi phí, báo cáo tòa và báo cáo gộp các tòa.**

| Nhóm | Màn hình | Làm trong Phase 1 | Để lại phase sau |
|---|---|---|---|
| Nhân sự, tổ chức | UI-23, UI-24 (mở rộng) | Hồ sơ nhân viên (chức danh, ngày vào làm để tính thâm niên, lương cứng, phụ cấp), **cơ cấu tổ chức leader/team theo hiệu lực** (F11), phân công tòa/phòng có ngày hiệu lực | — |
| Bảng lương | UI-25 | Lương NV vận hành theo HS và mốc 5/10/15, bậc cận gần nhất, thâm niên, tòa mới 100.000đ/phòng (`OQ-01`, `OQ-02`, `OQ-14`, `OQ-18`); lương trưởng phòng/trưởng nhóm 10.000đ × phòng; sale = lương cứng × **ngày công nhập tay**/26 + phụ cấp; kế toán, QL tổng, bảo vệ, vệ sinh (theo tòa); thợ sửa chữa = phần cố định + **tiền công nhập tổng** (chưa có sổ UI-47); kết quả lương **gắn tòa** để vào dòng “Lương quản lý” của từng tòa; chốt bảng lương và ghi chi sang UI-15 (F08) | Tiền công thợ lấy tự động từ sổ UI-47; hoa hồng tính tự động UI-22 (P2) |
| Chi phí | UI-15 (mở rộng) | Nhập/import chi phí gắn **tòa hoặc quỹ chung** + **nhóm dòng SRC-04**; tiền thuê chủ nhà; hóa đơn nhà cung cấp điện/nước/mạng/rác/môi trường/thang máy theo tòa (SRC-06); **hoa hồng import theo phòng** (G1 C47–C48: P203, P601) vào dòng Phí marketing; sửa chữa/vật tư theo tòa (nhập từ sổ Excel); mua sắm thiết bị có thời gian khấu hao (`OQ-11`); chi phí văn phòng (thuê VP, quỹ marketing) vào quỹ chung | Sổ sửa chữa UI-47 (P2) |
| Phân bổ | UI-16 | Phân bổ **quỹ chung / tổng phòng hệ thống của kỳ × số phòng tòa** (+ phụ phí/phòng chỉ để tái hiện Excel kỳ song song; kỳ web tự chốt phải có chứng từ quỹ) cho các dòng: lương QL tổng, trưởng phòng, phó phòng, nhân viên nguồn, NVKD, kế toán, sửa chữa, thuê và DV VP, quỹ marketing (`OQ-04`); chốt phiên bản phân bổ | — |
| Chốt kỳ cơ bản | UI-38 | Khóa kỳ sau khi chốt lương, phân bổ và báo cáo; chốt ảnh chụp số báo cáo, chặn ghi trong kỳ; sửa sau khóa bằng dòng điều chỉnh (tòa × dòng báo cáo, có lý do) cộng vào kỳ gốc | Quản lý kỳ nâng cao (P2) |
| Báo cáo | UI-27 (rút gọn), UI-28, UI-29, UI-30 | UI-27 chỉ gồm **Báo cáo tổng (LN dòng tiền)** và **Báo cáo kinh doanh**, bộ lọc kỳ, tòa, nhóm T/S/G, khu vực, quản lý. **Báo cáo tòa** (UI-28): mỗi cột một tòa như `BC DT THÁNG 8 NHÀ T/S/G` và mẫu G1. **Báo cáo gộp các tòa**: cột TỔNG, NHÀ T, NHÀ S, NHÀ G (UI-29, UI-30); click số → giao dịch nguồn; xuất theo mẫu | 4 nhóm báo cáo đầy đủ UI-40–UI-46 (P2, P3) |

**Nghiệm thu 1A:** chạy F03, F04, F05, F06, F12, F13 trên dữ liệu **tháng 9/2026 của SRC-08**: **1.471 hóa đơn** kỳ 9 (1.409 dòng NHÀ T/S/G + 40 hóa đơn G16–G18 + 22 PHÒNG MỚI THÁNG 9) có tổng in 13 dòng = tổng cần đóng; **9 hóa đơn** Excel ghi tổng cần đóng khác tổng 13 dòng được gắn cờ “lệch Excel nguồn” đúng danh sách UI-11 (102T20A002, 103T25A001, 101S8A001, 103S22A001, 201S38A002, 101G4A001, 302G6A001, 301G7A002, 601G16A001); tháng lẻ: 22 hóa đơn PHÒNG MỚI THÁNG 9 chia theo số ngày thực của tháng (tính cả ngày vào), 13 dòng Thu khác kỳ 9 (gồm 403T20: 6 ngày tháng 8, còn thiếu 892đ), 3 ngoại lệ Excel gắn cờ 304T35 (Excel 22 ngày, đúng 24), 101G18 và 404S4; 20 phòng phá HĐ; hoàn cọc 301T41; tổng PHÒNG MỚI 126.912.000; 4 mẫu in đúng tài khoản. *Sửa v1.9:* bỏ tiêu chí “1.383 dòng” và “106 ca tháng lẻ” (giải thích ở UI-11, §3.12b).

**Nghiệm thu 1B (benchmark tháng 8/2026):** bảng lương SRC-03 (98/101 dòng tòa khớp; ngoại lệ nguồn S39 – V51, S28, S36); phân bổ khớp G1 C36–C46 với mẫu số 1.382; báo cáo tòa G1 khớp SRC-07 và cột tòa SRC-04; Báo cáo tổng: sheet Excel ghi C3 **7.036.256.236**, tổng chi phí **6.013.857.267**, LNR **1.022.398.969**; trên số web, doanh thu **7.036.256.236** và giá vốn **5.316.928.772** khớp tuyệt đối, tổng chi phí web **6.024.500.037**, lệch **10.642.770** = **10.405.700** (3 tòa G12A/G13/G14, 39 phòng, có trong bảng lương và mẫu số 1.382 nhưng không có cột trong báo cáo Excel — cần khách chốt) + **181.553** (lương quản lý: 3 dòng lỗi nguồn bảng lương S39, S28, S36) + **55.517** (12 ô phân bổ trong sheet tòa Excel khác công thức chung: T5, T12, T32, S1 ×2, S3, S30, S31, S32, S40, G1, G3); không còn khoản chưa giải thích. **Tiêu chí** = số web khớp doanh thu, giá vốn và chênh chi phí được giải thích hết; số 6.013.857.267 chỉ đạt khi khách chốt loại 3 tòa khỏi kỳ 8 và xác nhận 12 ô là lỗi nguồn. Báo cáo kinh doanh (GĐ `OQ-10`): LNR web **779.688.893** = 790.331.663 − 10.642.770 (790.331.663 là OQ-10 áp trên số Excel; sheet Excel ghi **685.928.969**); cầu nối trong web tính trên số web. Lương và báo cáo chạy **song song Excel 1–2 kỳ** trước khi bỏ file.

**Điều kiện chạy thật 1B:** kỳ đầu tiên web tự chốt là **tháng đầy đủ đầu tiên sau go-live 1A** (tiền thu từ ngày 1 và các mốc 5/10/15 đều nằm trên web). Kỳ trước đó nhập số dư: công nợ, cọc đang giữ, thiết bị đã mua.

**GĐ cần khách xác nhận:** trước 1A: `OQ-03`, `OQ-09`, `OQ-12`, `OQ-14`, `OQ-15`, `OQ-16`. Trước 1B: `OQ-01`, `OQ-02`, `OQ-04`, `OQ-05`, `OQ-10`, `OQ-11`, `OQ-13`, `OQ-18`, `OQ-22`.

### 7.1b. Kiểm tra đủ dữ liệu cho hai báo cáo ở Phase 1

Đối chiếu từng dòng của `BÁO CÁO TỔNG THÁNG n` (SRC-04) và báo cáo tòa G1 (SRC-07!BÁO CÁO THÁNG 8). Báo cáo kinh doanh dùng cùng các dòng, chỉ khác công thức ở dòng 3 và 21 (`OQ-10`).

| Dòng báo cáo | Công thức/nguồn Excel | Màn hình nguồn Phase 1 | Đủ? |
|---|---|---|---|
| 3 Tổng doanh thu | Tổng đã đóng trên hóa đơn − hoàn cọc (G1 C2) | UI-13 phiếu thu, UI-18 chi hoàn | Đủ |
| 4 Cọc phòng mới | Cột CỌC của sheet nhà/phòng mới | UI-13 phiếu thu loại cọc, gắn lượt thuê chờ nhận UI-07 | Đủ khi có **lượt thuê chờ nhận** (bổ sung ở UI-07) |
| 5 Cọc khách bỏ không ở | Cọc của deal bỏ | UI-07 kết thúc loại **bỏ cọc** (thay UI-21 của F12) | Đủ khi có bổ sung trên |
| 6 Hoàn cọc | Sheet HOÀN CỌC | UI-18 | Đủ |
| 7–9 Số phòng phá HĐ / mới / trống | Đếm theo sheet | UI-07, UI-03 | Đủ |
| 10 Doanh thu tiền phòng | Phải thu − phòng phá HĐ + tháng lẻ phòng mới (G1 C12) | UI-12 | Đủ |
| 11–18 Doanh thu dịch vụ | Cột hóa đơn; điện gồm điện chung + điện trừ cọc; combo chia đôi vệ sinh/máy giặt | UI-10, UI-12, UI-18 | Đủ |
| 20 Tiền thuê nhà 1 tháng | Giá HĐ chủ nhà (G1 C22) | UI-04 giá theo hiệu lực | Đủ |
| 21 Mua sắm thiết bị | Nguyên giá trong kỳ (Báo cáo tổng); khấu hao kỳ (Báo cáo kinh doanh) | UI-15 dòng mua sắm + **số dư thiết bị import** | Đủ khi import số dư; không cần UI-34 |
| 22–27 Giá gốc dịch vụ | Hóa đơn điện, nước, mạng, rác, môi trường, thang máy theo tòa | UI-15 import theo mã KH nhà cung cấp (SRC-06) | Đủ |
| 29 Lương quản lý | Lương NV vận hành theo tòa (bảng lương) | **UI-25** kết quả gắn tòa | Đủ khi có bảng lương |
| 30–34, 36–37 Lương QL tổng, TPVH, phó phòng/TNVH, nhân viên nguồn, NVKD, kế toán, sửa chữa | Quỹ / 1.382 × số phòng tòa (+ 10.000/phòng) | UI-25 tổng quỹ → **UI-16** phân bổ | Đủ khi có bảng lương **và phân bổ**; phụ phí 10.000/phòng ở kỳ web tự chốt cần chứng từ quỹ (UI-16 [GĐ]) |
| 35 Lương vệ sinh | Nhập cứng theo tòa (G1 C41 = 550.000) | UI-25 lương vệ sinh gắn tòa | Đủ |
| 38 Lương bảo vệ | Nhập theo tòa có bảo vệ | UI-25 gắn tòa | Đủ |
| 39 Thuê và DV VP | Chi phí văn phòng / 1.382 × phòng | UI-15 quỹ chung → UI-16 | Đủ |
| 40 Phí marketing | Quỹ marketing phân bổ + **hoa hồng theo phòng** (G1 C46–C48) | UI-15 (hoa hồng import có phòng/tòa) + UI-16 | Đủ; tính hoa hồng vẫn ở Excel đến Phase 2 |
| 41 Sửa chữa, thay thế, bảo trì | Chi theo phòng của tòa (G1 C50 “Sửa tủ P304”) | UI-15 nhập theo tòa/phòng | Đủ; lấy tự động từ sổ UI-47 ở Phase 2 |
| 42 Chi phí khác | Nhập theo tòa | UI-15 | Đủ |
| 28, 43–61 Giá vốn, CPBH, tổng chi phí, LNG, LNR, các tỷ lệ | Công thức trong sheet | Tính từ các dòng trên | Đủ |

**Kết luận:** thêm nhân sự, tổ chức, bảng lương và chi phí **chưa đủ**. Phase 1 phải có thêm:

1. **UI-16 phân bổ chi phí chung.** 9 trên 14 dòng chi phí vận hành/bán hàng (dòng 29–42, theo sheet tháng 8 có thêm dòng 33 "Lương nhân viên nguồn") của báo cáo tòa được tính bằng phân bổ theo số phòng. Thiếu màn này thì báo cáo gộp vẫn đúng tổng, nhưng **báo cáo tòa sai**.
2. **Màn báo cáo UI-27 (rút gọn), UI-28, UI-29, UI-30.**
3. **Lượt thuê chờ nhận có cọc và loại kết thúc “bỏ cọc” ở UI-07.** Hai dòng này thay cho module Kinh doanh (UI-21) trong dòng 4–5 và 8.
4. **Hoa hồng import có phòng/tòa** vào UI-15. Dòng marketing của tòa gồm hoa hồng từng phòng.
5. **Import danh sách thiết bị đã mua trước go-live.** Nếu thiếu, Báo cáo kinh doanh chỉ khấu hao khoản mua mới.
6. **Dữ liệu nhập tay cho bảng lương:** ngày công sale, lương vệ sinh theo tòa, tiền công thợ sửa chữa, phụ cấp, ngày vào làm.
7. **Chốt kỳ cơ bản**, để số của lương, phân bổ và báo cáo không đổi sau khi đã gửi.

### 7.2. Phase 2 — Kinh doanh, hoa hồng, chia cổ đông và báo cáo vận hành

| Nhóm | Màn hình | Làm trong Phase 2 |
|---|---|---|
| Kinh doanh | UI-19, UI-20, UI-21, UI-22 | Tổng quan hàng hóa/phòng trống cho sale, khách xem, deal chốt (thay lượt thuê chờ nhận của Phase 1, liên kết lượt thuê khi khách vào ở), **tính hoa hồng** theo SRC-09 (chia trùng 25%/16,67%, điều kiện chi CH-19) thay file import; F02 |
| OCR | UI-08 (mở rộng) | OCR hợp đồng khách, bàn rà soát trường, cảnh báo độ tin cậy |
| Sửa chữa | UI-47 | Sổ sửa chữa và ứng chi vật tư theo thợ, kỳ 26 → 25; tiền công vào UI-25, vật tư vào UI-15 tự động (F16, `OQ-22`, `OQ-23`) |
| Báo cáo | UI-27 (đầy đủ), UI-42, UI-43, UI-44, UI-45, UI-46 | Trung tâm báo cáo 4 nhóm; chi phí giá vốn/cố định/phát sinh; âm dương điện nước (F15); sửa chữa/vệ sinh; HS thực tế/tạm tính, lấp đầy, thời gian trống, đóng đúng hạn/quá hạn, phân khúc khách; khách hàng, chuyển đổi, doanh số sale |
| Chia cổ đông hằng tháng | UI-31, UI-32 | Cổ đông và tỷ lệ theo tòa; bảng kê chia G1 từ báo cáo tòa UI-28 (F09) |
| Tài liệu | UI-26 | Kho tra cứu tài liệu gắn tòa, phòng, khách, hợp đồng |
| Zalo, Dashboard, kỳ | UI-39, UI-01, UI-38 (mở rộng) | Hộp thư phản hồi đồng bộ về trưởng phòng; sự kiện sắp hết HĐ, đã hoàn cọc. Dashboard thêm HS, lọc leader. Quản lý kỳ nâng cao |

**Nghiệm thu:** hoa hồng SRC-09; chia cổ đông SRC-07 G1; âm dương nước tháng 6 và điện tháng 7 (SRC-15); sổ sửa chữa tháng 8 (SRC-16).

**GĐ cần khách xác nhận:** `OQ-06`, `OQ-08`, `OQ-20`, `OQ-21`, `OQ-23`, `OQ-25`.

### 7.3. Phase 3 — Kế hoạch, hiệu quả đầu tư và tài sản

| Nhóm | Màn hình | Làm trong Phase 3 |
|---|---|---|
| Tài sản, bảo dưỡng | UI-34, UI-35, UI-36 | Danh mục tài sản/thiết bị theo tòa/phòng (nhận danh sách thiết bị đã import ở Phase 1), khấu hao từng tài sản và thanh lý (`OQ-11`); lịch bảo dưỡng và kết quả (F10); kiểm kê do admin + kế toán duyệt (CH-33); tab tài sản ở UI-03 |
| Dự kiến lợi nhuận | UI-40 | Hai bản dự kiến dòng tiền / kinh doanh từ một bộ đầu vào, gợi ý số từ tháng trước, so sánh với thực tế khi chốt kỳ (F14) |
| Hiệu quả | UI-41 | LN/vốn, LN/tài sản (cần giá trị tài sản UI-34), biên LN tiền nhà |
| Cổ đông, đầu tư | UI-33, vai trò Cổ đông | Lịch góp vốn, tiền cọc chủ nhà, tài sản và chi thực cho cổ đông; tài khoản **Cổ đông chỉ xem** báo cáo và bảng kê của các tòa mình góp vốn (CH-23) |
| Zalo | UI-39 (mở rộng) | Sự kiện nhắc bảo dưỡng |

**Nghiệm thu:** bảng dự kiến tháng 9/2026 của SRC-14 (J5 = 126.912.000, marketing = cọc mới / 2, khấu hao 1,6%); dòng 51 (LNR/GV) và 59 (DT tiền nhà / giá thuê) của báo cáo nhà SRC-04.

**GĐ cần khách xác nhận:** `OQ-07`, `OQ-11` (thanh lý), `OQ-19`, `OQ-24`.

UI-40 có thể kéo lên Phase 2 nếu khách cần sớm: đầu vào đã đủ sau Phase 1.

### 7.4. Điểm khác `00_SCOPE_3_PHASE.md` và phần ngoài đặc tả

| Nội dung | `00_SCOPE_3_PHASE.md` | §7 | Lý do |
|---|---|---|---|
| Nhân sự, cơ cấu tổ chức, bảng lương | Phase 3 | **Phase 1 (1B)** | Người dùng yêu cầu 29/09; dòng lương chiếm 9 dòng chi phí của báo cáo |
| Phân bổ chi phí, Report Hub, Cashflow/Profit, quản lý kỳ | Phase 2 | **Phase 1 (1B)** cho phân bổ, hai báo cáo và chốt kỳ cơ bản; trung tâm báo cáo đầy đủ Phase 2 | Báo cáo tòa cần phân bổ theo số phòng |
| Chia cổ đông G1 | Phase 3 | **Phase 2** (UI-31, UI-32); góp vốn UI-33 Phase 3 | Chia hằng tháng từ báo cáo tòa đã có ở Phase 1 |
| Hoa hồng | Phase 2 | Phase 1 import theo phòng như chi phí; tính tự động UI-22 Phase 2 | Quyết định 27/09 |
| Bảo trì, bảo dưỡng | Phase 2 | Sổ sửa chữa UI-47 **Phase 2**; bảo dưỡng định kỳ UI-35 **Phase 3** | Phase 1 nhập chi sửa chữa theo tòa ở UI-15; lịch bảo dưỡng cần danh mục thiết bị UI-34 |
| CRM nâng cao: Kanban, đặt lịch xem, giữ chỗ tự hết hạn | Phase 2 | **Ngoài đặc tả** | SRC-02 chỉ yêu cầu ghi khách xem và deal chốt (UI-20, UI-21); cần khách xác nhận nếu muốn thêm |
| Thanh toán QR, cổng thanh toán, đối soát ngân hàng, BI, KPI/chấm công | Phase 3 | **Ngoài đặc tả** | SRC-02 và SRC-11 không yêu cầu; báo giá riêng nếu khách cần |

**Số màn hình:** Phase 1 làm **28 screen ID** (1A: 22; 1B thêm 6: UI-16, UI-25, UI-27 rút gọn, UI-28, UI-29, UI-30 và mở rộng UI-15, UI-23, UI-24; UI-08 chỉ upload); Phase 2 thêm **13 screen ID** và mở rộng 5 màn (UI-01, UI-08, UI-27, UI-38, UI-39); Phase 3 thêm **6 screen ID**. Tổng 47. Phase 1 chiếm phần lớn khối lượng vì chứa cả hai engine khó nhất (hóa đơn và lương); nên tách đội làm song song 1A và 1B, 1B xong chậm nhất cuối tháng đầy đủ đầu tiên sau go-live.

## Phụ lục — nguồn đối chiếu nhanh

- **SRC-01:** `Hop_dong_thue_phong_demo_day_du.pdf`, Điều 1–4, tài sản bàn giao, giá và hạn.
- **SRC-02:** `nội dung làm web Timehouse 31.8.2026(2).xlsx`, 10 menu và từng sheet nghiệp vụ.
- **SRC-03/SRC-05:** `bao_cao/bảng lương tháng 8.xlsx`; `CÁCH TÍNH LƯƠNG PHÒNG VẬN HÀNH.docx`, các mốc 5/10/15 và bảng thâm niên.
- **SRC-04/SRC-07:** `bao_cao/BÁO CÁO KINH DOANH THÁNG 8.xlsx`; `G1.31.8.26.xlsx`, báo cáo hệ thống, nhà và cổ đông.
- **SRC-06:** `Danh sách mã HĐ điện nước mạng.xlsx` — mã KH nhà cung cấp điện/nước/mạng theo tòa, chủ hợp đồng, phương thức trả, số tiền hóa đơn tháng 1–8/2026 (không có chỉ số).
- **SRC-08:** `Hoá đơn tiền nhà tháng 9 và dịch vụ tháng 9 năm 2026.xlsx` — sheet dữ liệu NHÀ T/S/G, G16/G17/G18, PHÒNG MỚI THÁNG 9/10 (tháng 7 ẩn); theo dõi `cập nhật thu tiền`, `BÁO CÁO CHECK THU TIỀN` (ngày thanh toán, dữ liệu tháng 8), `DS phòng phá hđ`, `ĐIỆN NƯỚC PHÒNG TRỐNG`, `HOÀN CỌC`; mẫu in `HĐ (VP)`, `HĐ (VP-HẰNG)`, `HĐ (TECH)`, `HĐ G1 (TECH)`, `HĐ (HOÀN CỌC)`.
- **SRC-09:** `Hoa hồng năm 2025-2026 (1).xlsx` — sheet theo tháng chi 1/2025–9/2026 (4–9/2026 hiển thị).
- **SRC-10:** `Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc`, giá, cọc, kỳ trả, phạt, phụ lục bàn giao và phụ lục góp vốn.
- **SRC-11:** `Cau-hoi-lam-ro-nghiep-vu-Timehouse.xlsx` (thư mục gốc dự án) — 36 câu hỏi (STT 1–37, không có số 4) đã có trả lời của khách; tham chiếu `CH-nn`. Các câu hẹn “gặp trực tiếp trao đổi”: CH-07, CH-16, CH-24, CH-26, CH-28.
- **SRC-12:** `00_SCOPE_3_PHASE.md` (thư mục gốc dự án) — phân phase dự kiến, dùng cho `OQ-17`.
- **SRC-13:** `bao_cao/báo cáo.xlsx` — danh mục báo cáo khách gửi 29/09/2026, bản cập nhật của SRC-02!BÁO CÁO, có công thức ở cột E và bộ lọc ở cột F.
- **SRC-14:** `bao_cao/BẢNG DỰ KIẾN LỢI NHUẬN CÁC THÁNG.xlsx` — 20 sheet dự kiến 3/2025 → 9/2026 (dòng tiền 7/2025 → 2/2026, kinh doanh 3/2026 → 9/2026; Sheet1 ẩn: điện thanh toán chủ nhà S32).
- **SRC-15:** `bao_cao/âm dương điện nước tháng 6.xlsx`, `… tháng 7.xlsx` — sheet hiển thị `THÁNG 6.2026 nước`, `THÁNG 7.2026 điện`; sheet ẩn các tháng trước, bản công thức và sản lượng điện.
- **SRC-16:** `bao_cao/sổ sửa chữa tháng 8(AutoRecovered).xlsx` — sổ theo thợ (A Điệp, A Ước; Trường ở các tháng trước), `LƯƠNG THÁNG n` của thợ, Sheet4 theo dõi sơn. SRC-03 và SRC-04 cũng nằm trong `bao_cao/`.
