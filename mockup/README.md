# TimoHouse – Mockup tương tác Phase 1 + Phase 2 + Phase 3

## Spec v1.8 – Wave 1: Cơ cấu tổ chức & Phân công tòa nhà (single source of truth)

Mockup đang được đưa theo `docs_timonouse/TimoHouse_Mo_Ta_Chuc_Nang_3_Phase_v1.8_OCR_Data_Onboarding.md` (kế hoạch 6 wave, backlog gap tại `docs/TimoHouse-Spec-v1.8-vs-Mockup-Gap-2026-09-21.md`). Wave 1 đã có:

- **Phạm vi Phase 1 theo spec:** OCR hợp đồng, Nhân sự (Nhân viên, Cơ cấu tổ chức, Phân công tòa nhà, Bảng lương) và Cổ đông/góp vốn/phân phối **không còn gate P2/P3**; Chấm công, Dự án, ROI, Tài sản/Kiểm kê vẫn theo công tắc phase. Menu Admin xếp theo spec §8 (Vận hành · Tài chính · Kinh doanh · Nhân sự · Tài sản & bảo trì · Đầu tư · Thông báo · Báo cáo; Cài đặt qua app launcher).
- **Cơ cấu tổ chức `#/hr/org`** (§4.23): cây số cấp linh hoạt (Công ty → Quản lý Tổng → Đơn vị vận hành {TPVH 1, TPVH 2, Kỹ thuật} / Tài chính–Kế toán / Kinh doanh → Nhóm KD → Team Sale), một Lead hiệu lực/đơn vị có lịch sử nhiệm kỳ, xem cây theo ngày, điều chuyển/kiêm nhiệm nhân viên có ngày hiệu lực (`employmentAssignments`), chức danh (`positions`).
- **Phân công tòa nhà `#/hr/assignments`** (§4.25): views Hiện tại / Sắp tới / Chờ duyệt / Lịch sử, bảng nhà–phòng hiện tại & sắp tới (§4.25.9), cảnh báo tòa thiếu Phụ trách chính và phân công trùng, **Thay đổi quản lý** (tòa → NV → vai trò → ngày hiệu lực → lý do → gửi duyệt/xác nhận), điều chuyển hàng loạt, workflow `Dự thảo → Chờ duyệt → Đã duyệt → Đang hiệu lực → Hết hiệu lực` (+ Từ chối / Đã hủy). Phụ trách chính mới tự kết thúc người cũ ngày hiệu lực − 1; phân công đến ngày tự kích hoạt (`X.activateDueAssignments`).
- **`managerId` chỉ là cache dẫn xuất** (§10.17): `buildings/rooms/contracts/tenants.managerId` và `users.buildingIds` được đồng bộ từ assignment Phụ trách chính (`X.syncDerivedManagers`). Màn Tòa chỉ đọc Quản lý hiện tại / sắp tới / lịch sử từ Phân công; nút "Thay đổi quản lý" mở form của module Nhân sự. Scope Vận hành (RBAC) tính từ assignment hiệu lực.
- **Scope theo cây tổ chức + thời gian** (§4.3): bộ lọc Dashboard có Tổ chức (gồm đơn vị con) → Nhân sự → Tòa; resolve theo ngày cuối kỳ. Kịch bản seed: tòa **Central** kỳ 09/2026 thuộc TPVH 1 (Hoàng Nam Khánh), từ 01/10/2026 thuộc TPVH 2 (Lê Hoàng); tòa **Garden** có Quản lý sắp tới từ 01/11/2026; 1 đề xuất Phối hợp tòa Sunrise chờ duyệt.
- **Ký hiệu/loại tòa có lịch sử hiệu lực** (`buildingTypeHistory`, §4.6): cập nhật phải nhập ngày hiệu lực; `Q.buildingTypeAt(b, date)` dùng cho báo cáo kỳ cũ.
- **Master Data** (`#/settings/catalog?tab=master`, §7.5): loại tòa (mở rộng ngoài T/S/G), loại phòng, trạng thái khách hàng, lý do kết thúc HĐ, vai trò phân công, loại đơn vị, sự kiện thông báo, mốc thu M1/M2/M3; tab Chức danh.
- **Vai trò demo mới:** `qltong` (Quản lý Tổng – xem toàn cây, duyệt phân công) và `tpvh1` (Trưởng phòng vận hành TPVH 1 – scope đơn vị + descendants). `nhansu` là vai trò Phase 1.
- **Dữ liệu cũ:** state v4 trong localStorage được nâng lên schema 5 additive (`TH.seed.migrateV5`, cờ `meta.v5Migrated`): quản lý tòa cũ → assignment `manager`, nhân viên → quan hệ tổ chức, loại tòa → lịch sử. Không mất dữ liệu người xem; "Đặt lại dữ liệu demo" cho seed đầy đủ.
- Panel Hướng dẫn: luồng **H1 "Tổ chức & phân công tòa nhà"** (6 mốc) chèn sau F10; `runAll()` chạy thêm H1.

## Spec v1.8 – Wave 2: OCR hợp đồng & Data Onboarding

Wave 2 (nhánh `feat/w2-ocr-onboarding`) đưa OCR từ "prefill form HĐ" thành **Data Onboarding** theo §12.8 và bổ sung các mô hình dữ liệu đi kèm:

- **OCR Job `#/contracts/ocr`** (§12.8.3): mỗi job lưu file, **hash**, loại tài liệu, engine `mock-1`, idempotency key, người tải, thời gian xử lý, lỗi; trạng thái `UPLOADED → PROCESSING → READY_FOR_REVIEW → REVIEWING → VALIDATED → COMMITTED`, nhánh `FAILED` (nút *Xử lý lại*) và `COMMIT_FAILED` (nút *Thử lại*). **Tải cùng file → không tạo job/HĐ trùng** (AC-1; hộp thoại mở job cũ hoặc tải bản sao demo). Hỗ trợ PDF text-based, .txt và **JPG/PNG mô phỏng** (nội dung lấy từ file mẫu, ghi rõ "OCR ảnh mô phỏng").
- **Field OCR** (§12.8.4): `raw`, `normalized`, `confidence`, `page`, `bbox` (mô phỏng theo layout 4 trang), `entityGroup`, quyết định `accept / edit / reject`, người & thời điểm review. Bấm vào vùng đánh dấu trên tài liệu → nhảy tới trường; bấm "Tr.n" → cuộn tới trang.
- **Review theo 13 nhóm entity** (§12.8.7): Khách hàng · Tòa nhà · Phòng · Hợp đồng · Người ở · Dịch vụ & Giá · Cọc · Xe · Điện/Nước đầu kỳ · Tài sản bàn giao · Điều khoản thanh toán · Gia hạn/Báo trước · Tài liệu. Mỗi nhóm có candidate hệ thống, diff hệ thống ↔ OCR, segmented **Create / Link / Update / Ignore** (Tòa/Phòng chỉ Link – không tạo tòa/phòng từ OCR), bảng trường có xác nhận/bỏ qua từng trường.
- **Matching** (§12.8.6): khách theo **CCCD → SĐT → Họ tên + Ngày sinh**; CCCD trùng nhưng tên/SĐT khác → chip *Xung đột*, bắt buộc chọn Link/Update/Create trước khi commit. Tòa theo mã/tên/địa chỉ/gợi ý; phòng theo tòa + mã (chấp nhận "A0103" ↔ "A.01.03"). Chống trùng HĐ theo số HĐ / hash / khách+phòng+ngày bắt đầu. Form Khách thuê cũng cảnh báo trùng CCCD/SĐT bằng cùng matcher.
- **Giá dịch vụ HĐ ≠ giá tòa** (§12.8.10): dòng xung đột phải chọn **[Chỉ áp dụng cho HĐ này] / [Cập nhật giá tòa từ ngày…] / [Ignore]**; giá HĐ luôn snapshot vào `contractServices`; "Cập nhật giá tòa" tạo `servicePrices` mới có hiệu lực, dòng cũ đóng ngày hiệu lực − 1, audit đầy đủ.
- **Xem payload → Validate → Xác nhận tạo hợp đồng → Commit 1 transaction** (§12.8.9): Customer → Building → Room → Contract (Dự thảo, `source: 'ocr'`) + `contractTenants` + `contractServices` + `depositLedger RECEIVABLE` + xe + `meterReadings OPENING` + `contractHandoverAssets` + `contractPaymentTerms` + `contractRenewalClauses` + `documents`. Lỗi bất kỳ → **rollback toàn bộ** (tick "Mô phỏng lỗi kỹ thuật" trong modal commit để xem `COMMIT_FAILED` rồi *Thử lại*). Màn **Kết quả** liệt kê entity Create/Link/Update kèm link module (§12.8.15) và bảng truy vết Job → File → Hash → Engine → Review/Validate/Commit (§12.8.17). OCR không tự kích hoạt (AC-11), không tự gia hạn (AC-12).
- **Bảng giá 2 lớp** (§12.9, `servicePrices` scope `GLOBAL/BUILDING` + hiệu lực): `Q.servicePrice(serviceId, buildingId, date)` ưu tiên giá riêng tòa đang hiệu lực → giá mặc định; Danh mục dịch vụ có card *Bảng giá 2 lớp* (override theo tòa, ngừng hiệu lực, "tòa nào đang dùng giá nào"), tab **Dịch vụ & Bảng giá** trong chi tiết tòa (xem giá tại ngày, override, lịch sử); tạo HĐ/hóa đơn điện nước dùng giá theo tòa (snapshot HĐ nếu có). Danh mục thêm **Vệ sinh, Máy giặt, Điện chung**; "Phí quản lý" đổi tên "Dịch vụ chung" theo HĐ mẫu.
- **Deposit Ledger** (`depositLedger`, §10.11): `RECEIVABLE / RECEIVED / TRANSFERRED / TRANSFERRED_OUT / DEDUCTED / OFFSET / REFUNDED / FORFEITED`; tab **Cọc** của HĐ (số dư đang giữ, còn phải thu, ghi nhận thu cọc); kích hoạt HĐ, gia hạn, duyệt/hoàn cọc tự ghi bút toán.
- **Người thuê theo HĐ** (`contractTenants`, §4.8): khách đứng tên + người ở cùng là hồ sơ khách riêng (Link/Create/Chưa liên kết); tab **Người thuê** của HĐ (thêm người ở cùng, liên kết hồ sơ, ghi nhận rời đi). Tab **Điều khoản & bàn giao**: điều khoản thanh toán, gia hạn/báo trước (chỉ tạo cảnh báo), tài sản bàn giao theo HĐ.
- **Công tơ & chỉ số** (`meters`, §12.10): mỗi phòng có công tơ điện/nước; `meterReadings` thêm `meterId`, `readingType OPENING/PERIOD/CLOSING`, `readingDate`; tab **Chỉ số điện nước** ở chi tiết phòng.
- **Work Queue** Dashboard có mục *OCR chờ review*; Panel Hướng dẫn: luồng **F12 "OCR hợp đồng & Data Onboarding"** (5 mốc, thay F12 P2 cũ) chèn sau H1, `runAll()` chạy thêm F12; walkthrough P1 thêm F12.1–F12.4 (44 mốc).
- **File mẫu**: khách trùng CCCD với hồ sơ *Nguyễn Thị Hương* (đang giữ chỗ) nhưng tên không dấu & SĐT thiếu số; tòa Sunrise có giá điện riêng 3.800đ (HĐ ghi 4.000đ) và Internet 100.000đ (mặc định 200.000đ) → 2 xung đột giá; 5 trường Cần kiểm tra; 30 dòng tài sản bàn giao; tự gia hạn 12 tháng / báo trước 30 ngày.
- **Dữ liệu cũ:** migration additive `TH.seed.migrateW2` (cờ `meta.w2Migrated`, schema giữ 5): `services` → `servicePrices`, `contractMembers` → `contractTenants` (tạo hồ sơ khách cho người ở cùng có CCCD), cọc/hoàn cọc → `depositLedger`, `ocrExtractions` → `ocrJobs`, công tơ cho mọi phòng, điều khoản mặc định cho HĐ hiệu lực.

## Spec v1.8 – Wave 3: Vận hành thuê đủ trạng thái

Wave 3 (nhánh `feat/w3-rental-states`) bám §4.5, §4.7–4.9, §4.11, §4.13–4.18, §12.3, §12.5–12.7, §12.10–12.16:

- **Phòng** (§12.5.3): thêm trạng thái **Sắp trống** (`vacating`: khi xác nhận ngày trả; đến ngày ra tự sang Chờ dọn), `inactive` = "Ngừng khai thác"; bảng chuyển trạng thái `Q.ROOM_TRANSITIONS` (Chờ dọn → Sẵn sàng hoặc → Bảo trì → Nghiệm thu → Sẵn sàng). **Room Status History** (`roomStatusHistory`, tab "Lịch sử trạng thái") ghi mọi lần đổi (kể cả từ nghiệp vụ khác qua `X.syncRoomHistory`); **Lịch sử giá** (`roomPriceHistory`, drawer "Cập nhật giá" có ngày hiệu lực, tab "Lịch sử giá"); tab **Công nợ** drill-down hóa đơn → payment.
- **Hợp đồng** (§12.7.3): trạng thái mới **Chờ duyệt** (`submitContract` / `returnContract` / `approveContract`), **Chờ gia hạn** (khi lập HĐ gia hạn dự thảo), **Chờ kết thúc** (`confirmMoveOut`: loại kết thúc, lý do chuẩn Master Data, ngày thông báo, ngày ra → phòng Sắp trống), **Chờ quyết toán** (`endContract`), **Đã kết thúc** chỉ sau khi hoàn cọc (`closeContract`, tự chạy khi ghi nhận hoàn cọc). Field `contractType`, `termNo` (lần HĐ), `contractNo`; `contractEvents` (ACTIVATED / RENEWED / MOVE_OUT_CONFIRMED / SETTLED / ENDED / EARLY_TERMINATION) làm nguồn báo cáo; tabs mới **Thanh toán · Công nợ · Gia hạn** (chuỗi HĐ, điều khoản, follow-up, sự kiện). Danh sách HĐ có tab theo từng trạng thái.
- **Kết thúc HĐ đủ bước** (`Fm.terminate`, §4.17, §12.16): loại/ngày → **chỉ số cuối** (meterReadings `CLOSING`) → **hóa đơn cuối** (tiền phòng theo ngày nếu kỳ chưa có hóa đơn + điện/nước chốt + phạt; phát hành ngay tùy chọn) → công nợ → cọc đang giữ (Deposit Ledger) → **công nợ được phép bù trừ** + khấu trừ có dòng chi tiết + tình trạng tài sản bàn giao → hồ sơ hoàn cọc Nháp; công thức **Thực hoàn = Cọc đang giữ − công nợ được phép bù trừ − phạt − sửa chữa − vệ sinh − khác** (§4.18, bỏ OI-07 và khấu hao cố định BR-12). `X.terminateContract` cũ vẫn chạy được (chỉ số cuối = gần nhất).
- **Work Queue HĐ sắp hết hạn `#/contracts/expiring`** (§4.11, §12.15): cột đủ (người ở cùng, quản lý theo assignment, còn lại, công nợ, liên hệ gần nhất, kết quả, deadline, người xử lý); `contractFollowUps` (Ghi nhận liên hệ: kênh, kết quả Gia hạn / Trả đúng hạn / Chấm dứt sớm / Chưa phản hồi, deadline, assign); Gia hạn → HĐ mới Dự thảo → review → duyệt; Trả phòng → xác nhận trả phòng; export. Hệ thống không tự gia hạn/kết thúc.
- **Điện / Nước `#/meters`** (§4.13, §12.10): kỳ → tòa → phòng → công tơ → cũ/mới → sản lượng → ảnh; nhập từng dòng (lưu nháp), copy kỳ trước, import (tab Import type meter), đính ảnh, **validate** (mới < cũ, thiếu, trùng kỳ, bất thường ±50%), **Xác nhận** (`confirmed`), **Mở lại** có lý do (Admin/Kế toán; chặn nếu hóa đơn đã phát hành), export, tab **Lịch sử theo kỳ**.
- **Kỳ hóa đơn `#/finance/periods`** (§12.11.1, `billingPeriods`): mã kỳ, từ/đến, ngày chốt, ngày phát hành, `OPEN → REVIEWING → LOCKED` (mở lại có lý do); khóa kỳ chặn tạo/phát hành hóa đơn & sửa chỉ số của kỳ (`Q.periodLocked` gộp với khóa kỳ P2). Invoice line có `lineType` (RENT/SERVICE/PENALTY/ADJUSTMENT/OTHER), `serviceId`, `unit`, `sourceReadingId`; "Thêm dòng" chọn loại (Vệ sinh, Máy giặt, Điện chung, Phạt, Điều chỉnh, Khoản khác); invoice lưu `carriedOver`, `adjustment`, snapshot HĐ/khách.
- **Thu tiền** (§4.15): **Tiền chưa xác định** (`X.recordUnidentified` → payment không khách, nút ở Thu tiền & công nợ) → **Ghép khách/hóa đơn** (`Fm.matchPayment`, một payment nhiều hóa đơn); **Thu thừa / Tạm ứng** (`Q.paymentKind`, đánh dấu tạm ứng). Công nợ: trạng thái **Thu thừa**, bộ lọc Tổ chức/Nhân sự/Phòng/Khách/Hạn thanh toán (M1/M2/M3 ở W4), **bảng tổng hợp theo tòa / quản lý / phòng / khách**.
- **Khách thuê** (§4.8, §12.6): `tenants.status` là **field** (Master Data `customerStatus`, "Đổi trạng thái" có lý do), các cờ **HĐ hiệu lực / Sắp hết / Người ở cùng / Còn công nợ / Chờ hoàn cọc / Giữ chỗ / Zalo / Đã trả phòng** là thuộc tính suy ra (`Q.tenantFlags`); bộ lọc Tổ chức / Quản lý / Tòa / Phòng / HĐ hiệu lực / Công nợ / Zalo / Vai trò / Ngày tạo, từ khóa gồm CCCD; **Cập nhật trạng thái hàng loạt** (chọn nhiều hoặc toàn bộ kết quả, preview số khách, audit batch + từng khách); **Xuất theo bộ lọc** (selected/all, file ghi thời điểm + người + điều kiện); tabs chi tiết Thông tin · Hợp đồng · Nơi ở · Người ở cùng · Xe · Hóa đơn · Thanh toán · Công nợ · Zalo · Hoàn cọc · Tài liệu · Lịch sử.
- **HĐ đầu vào** (§4.5, §12.3): field Số HĐ, **trạng thái HKD** (tự chuyển *Đã đăng ký* khi tải tài liệu loại "Đăng ký HKD" gắn chủ nhà/tòa/HĐ; điều chỉnh tay có lý do + lịch sử), **PCCC** (trạng thái/hạn), **ký hiệu loại tòa theo HĐ + ngày hiệu lực** (ghi Building Type History), **lịch tăng giá** (`priceSchedule`, `Q.lcPriceAt`), ngày đến hạn, tài khoản người nhận, tài sản bàn giao; workflow **Dự thảo → Kích hoạt → Gia hạn (HĐ mới) → Kết thúc**. Tài liệu có `docType` (danh mục §7.3) và **phiên bản** (`replaceDocument`: file cũ giữ, `supersedesId`).
- **Dashboard** (§4.1): khối **KPI phòng 9 ô** (tổng tòa, tổng phòng, đang thuê, sẵn sàng, giữ chỗ, chờ dọn, bảo trì, sắp trống, tỷ lệ lấp đầy), **KPI hợp đồng** (hiệu lực, sắp hết, ≤35 ngày, chờ gia hạn, chờ kết thúc, chờ quyết toán, phá HĐ trong kỳ, chờ duyệt), **Work Queue 9 mục** (OCR chờ review, HĐ sắp hết, hóa đơn chưa phát hành, khách còn nợ, Zalo lỗi, HĐ chờ quyết toán, hoàn cọc chờ duyệt, phòng chờ dọn, import chi phí lỗi).
- **Migration** additive `TH.seed.migrateW3` (cờ `meta.w3Migrated`): backfill lịch sử trạng thái/giá phòng, sự kiện HĐ, `tenants.status = active`, kỳ hóa đơn từ hóa đơn (kỳ cũ LOCKED), HKD/PCCC/loại tòa cho HĐ đầu vào, `docType`/`version` cho tài liệu; kịch bản demo: 1 HĐ **Chờ kết thúc** (phòng Sắp trống, ra sau 8 ngày), 1 HĐ **Chờ gia hạn** với HĐ mới dự thảo, follow-up cho 3 HĐ sắp hết, 1 khoản **tiền chưa xác định**, lịch tăng giá HĐ đầu vào Sunrise.
- Guide: luồng **F13 "HĐ sắp hết hạn, trả phòng & vận hành theo kỳ"** (6 mốc); F07/F08 cập nhật theo luồng kết thúc mới (thực hoàn 7.885.000đ = 13.000.000 − 4.715.000 bù trừ − 400.000); walkthrough P1 44/44.

## Spec v1.8 – Wave 4: Chuỗi nội bộ (hiệu suất → lương → chi lương) & Chi phí

Wave 4 (nhánh `feat/w4-payroll-expense`) bám §4.1, §4.15–4.16, §4.26, §4.27, §12.20, §12.21:

- **Mốc thu M1/M2/M3** (§4.26.2, Master Data `milestone` 05/10/15): mỗi `paymentAllocations.milestone` gán khi ghi nhận/ghép/điều chỉnh (ngày thu so với mốc trong tháng của kỳ hóa đơn; thu trước kỳ → M1, sau ngày 15 hoặc tháng sau → `LATE` = thu thêm); migration backfill (`X.tagMilestones`). Hiển thị: hóa đơn (cột "Thu theo mốc", lịch sử thu có chip mốc), công nợ (lọc Mốc thu, cột M1·M2·M3, bảng tổng hợp theo tòa/quản lý/phòng/khách có M1/M2/M3), **Dashboard KPI tài chính 10 ô** (§4.1): tổng phải thu, đã thu, còn phải thu, quá hạn, thu M1/M2/M3, thu thừa/tạm ứng, cọc đang giữ, cọc chờ hoàn (Deposit Ledger).
- **Hiệu suất thu tiền `#/hr/collection-performance`** (§4.26.1, §12.20): dòng **NV × tòa** theo assignment Phụ trách chính/Hỗ trợ hiệu lực cuối kỳ: số phòng, DT niêm yết, DT phải thu, thu M1/M2/M3, tổng sau 3 mốc, dịch vụ (Invoice Line SERVICE), tỷ lệ DV/DT, thu thêm, **tổng DT thu được**, **hiệu suất % = tổng DT thu được / DT niêm yết × 100**, mức lương/phòng (Payroll Rule), lương theo phòng; lọc kỳ/tổ chức/NV/tòa/vai trò; **drill-down** về từng Payment → hóa đơn theo mốc; export; card Payroll Rule Version (thêm/sửa version).
- **Payroll Rule Version** (`payrollRuleVersions`, §4.26.4): đối tượng (vai trò phân công), hiệu lực từ/đến, **bậc hiệu suất → mức lương/phòng**, công thức Tổng DT thu được (mặc định M1+M2+M3 − Dịch vụ + Thu thêm) – chip *Chờ chốt* (`NEED_BUSINESS_CONFIRMATION`); rule đã dùng cho bảng lương không sửa, chỉ tạo version mới.
- **Bảng lương `#/hr/payroll`** viết lại (§4.26.5–4.26.7, `core/actions-payroll.js`): **Mở kỳ lương** → `payrollAssignmentSnapshots` (NV + tòa + kỳ: đủ 15 chỉ tiêu + rule version) + `payrollResults` (cấu phần: lương cơ bản, PC ăn trưa, PC xăng xe, lương trưởng nhóm, lương hỗ trợ, tổng lương hiệu suất theo phòng, điều chỉnh, khấu trừ, thực nhận – `employees.payroll`, sửa ở chi tiết NV "Cấu phần lương") → Refresh (kỳ chưa khóa) → **Điều chỉnh / khấu trừ bắt buộc có lý do** → Gửi review → Trả lại / Duyệt → **Khóa** (sinh chi lương + **Payroll Cost Allocation** theo tòa: NV trực tiếp theo snapshot, vai trò chung theo Allocation Rule) → **Mở lại** (chỉ Admin, có lý do/audit, chặn khi đã chi). Drill-down §4.26.7 từ mỗi NV. **Bỏ** hoa hồng Sale, PC số nhà, khấu trừ 10,5%, ngày công (chấm công còn lại là mô phỏng ngoài spec); **không tạo chi phí "Lương"** (§4.26.10, §4.27.4).
- **Chi lương `#/hr/salary-payments`** (§4.26.8–4.26.9, `salaryPayments`): sinh từ bảng lương Đã khóa; KPI phải chi / đã chi / còn phải chi; lọc kỳ/đơn vị/NV/trạng thái; **ghi nhận chi từng người** (partial), **chi hàng loạt** (chọn dòng hoặc cả kỳ), **import kết quả GD** (Import dữ liệu → Kết quả chi lương, file mẫu), đánh dấu chi lỗi / hủy / điều chỉnh, export; mỗi khoản lưu TK nhận snapshot, mã GD, chứng từ, người thực hiện, lịch sử chi; trạng thái Chưa chi → Chi một phần → Đã chi (+ Chi lỗi / Đã hủy / Đã điều chỉnh).
- **Chi phí** (§4.27, §12.21): danh mục **GV** (Tiền thuê nhà, Mua thêm thiết bị, Giá gốc điện/nước/mạng, Phí rác, Phí môi trường, Bảo trì thang máy) · **BH** (Marketing, **Hoa hồng**) · **VH** (Sửa chữa, Thay thế, Văn phòng, Khác); mã cũ `DV-*`, `BH-SC`, `BH-KHAC`, `NCxx` giữ làm alias, `VH-L-*` = hệ thống (không nhập tay). Phiếu đủ dữ liệu §4.27.2: ngày chứng từ / ngày ghi nhận / kỳ hạch toán / hạng mục / nội dung / số tiền / NCC-người nhận / phương thức TT / chứng từ / nguồn `Nhập tay · Import · Sinh từ hệ thống` / người tạo-xác nhận; hạng mục **Hoa hồng** có Sale/người nhận, phòng, ngày TT (§4.27.5). **Phân bổ chi phí chung** (`Fm.allocateExpense`, `X.allocateExpense`): DIRECT / ROOM_COUNT / REVENUE / BUILDING_COUNT / MANUAL_RATIO cho tòa chọn hoặc **nhóm T/S/G** (loại tòa hiệu lực trong kỳ), preview trước khi xác nhận; `expenseAllocations` lưu cơ sở, tỷ lệ, số tiền, phương thức, rule version, kỳ, người xác nhận; `allocationRules` (AR-2026-01: mặc định theo hạng mục). **Import chi phí** (Import dữ liệu → Chi phí, file mẫu 9 dòng): mapping → validate (hạng mục theo mã/tên, tòa hoặc CHUNG, số tiền, kỳ khóa) → **phát hiện trùng** (ngày + số tiền + nội dung với phiếu đã có hoặc trong file) → dòng lỗi bị bỏ qua và đếm vào Work Queue "Import chi phí lỗi". Hủy phiếu (reverse) có lý do/audit; lịch sử điều chỉnh khi sửa.
- **Migration** additive `TH.seed.migrateW4` (cờ `meta.w4Migrated`): re-map danh mục + mã chi phí, xóa chi phí "Lương" seed, backfill dữ liệu tối thiểu, `employees.payroll` (cơ bản = lương cũ, ăn trưa 730k, xăng xe 500k/300k, trưởng nhóm theo chức danh, hỗ trợ khi có phân công Hỗ trợ, TK nhận), Payroll Rule PR-2026-01 / PR-2026-01S, Allocation Rule, mốc thu cho allocation; kịch bản demo (`X.ensureW4Scenario` chạy 1 lần): **BL-2026-09 Đã khóa** (điều chỉnh + khấu trừ có lý do, 26 đã chi, 2 chi một phần, 1 chi lỗi, 1 chưa chi), **BL-2026-10 Nháp**, chi phí import giá gốc dịch vụ + hoa hồng, 1 chi phí chung chờ phân bổ, 1 đã phân bổ theo số phòng, 1 job import có 2 dòng lỗi.
- Quyền mới: `payroll.lock` (Admin/Kế toán), `payroll.reopen` (Admin), `performance.view`, `salary.view`, `salary.pay` (Admin/Kế toán), `expenses.import`; import type `expense`, `salaryResult`. Menu Nhân sự: Hiệu suất thu tiền · Bảng lương · Chi lương (Admin, Kế toán, Nhân sự, QL Tổng, TPVH xem hiệu suất).
- Guide: luồng **F14 "Hiệu suất thu tiền → bảng lương → chi lương"** (4 mốc) và **F15 "Import chi phí & phân bổ chi phí chung"** (2 mốc); F17 P3 (nay F21) chỉ còn NV/phân công/chấm công mô phỏng; walkthrough P1 48/48 (thêm F14.1–F14.3, F15.1).

## Spec v1.8 – Wave 5: Báo cáo Phase 1 (Report A/B, kỳ báo cáo, đối soát golden) & Cổ đông / cổ phần / góp vốn / chia lợi nhuận

Wave 5 (nhánh `feat/w5-reports-shares`) bám §4.28–4.33, §7.6, §12.22, §12.23, §21.3:

- **Metric Registry** (`core/metrics-p1.js`, `#/reports/metrics`): 50 metric theo `metric_code` §12.23.3/§12.23.6 (`TOTAL_REVENUE`, `RENT_REVENUE`, 8 dòng dịch vụ, 8 dòng giá vốn, `COGS`, `SALARY_COST`, `OFFICE_COST`, `MARKETING_COST`, `COMMISSION_COST`, `REPAIR_COST`, `OTHER_COST`, `OPERATING_SELLING_COST`, `TOTAL_COST`, `GROSS_PROFIT`, `NET_PROFIT`, 13 tỷ lệ `NET_MARGIN`…`RENT_REVENUE_OVER_HEAD_LEASE`, `NEW_DEPOSIT`, `FORFEITED_DEPOSIT`, `REFUND_AMOUNT`, `EARLY_TERMINATION_COUNT`, `NEW_ROOM_COUNT`, `VACANT_ROOM_COUNT`, `ROOM_COUNT`, `OCCUPANCY_RATE`): nhóm báo cáo, đơn vị MONEY/COUNT/PERCENT, `formula_type` SOURCE/FORMULA, biểu thức, nguồn, date basis, version, hiệu lực, **`business_confirmation_status`** (CONFIRMED / NEED_BUSINESS_CONFIRMATION / DEPRECATED, lan truyền qua metric phụ thuộc) + 12 câu hỏi Q-RPT-001…012; Admin **Xác nhận** metric (quyết định nghiệp vụ → CONFIRMED, tăng version, audit; `metricDefinitions` ghi đè registry). Registry cũ (`TH.metrics.defs`) giữ cho Report Hub workbook.
- **Report Engine** (`core/report-engine-p1.js`): `TH.reportP1.compute(period, buildingId)` tính mọi metric từ Invoice Line (lineType RENT / serviceId), Deposit Ledger (RECEIVED/DEDUCTED), Refund Case (refund date), Contract Event EARLY_TERMINATION, Contract start_date, Room Status History tại ngày cuối kỳ, Expense + Expense Allocation (accounting_period, alias mã cũ), Payroll Cost Allocation của bảng lương Đã khóa, Building Share tại ngày cuối kỳ; công thức dùng chung `formulas()` cho tòa và tổng (tỷ lệ tính lại từ tử/mẫu, không average); **drill-down** §12.23.10 mỗi metric → chuỗi Tòa → Phòng → Hóa đơn → Invoice Line / Expense Allocation → Expense → Attachment / Payroll Cost Allocation → Payroll Result → Employee → Assignment Snapshot…; `summary(period)` = Report B: resolve loại tòa theo `buildingTypeHistory` tại kỳ, aggregate additive `TOTAL = T + S + G`; `reconcile(golden)` = bảng đối soát.
- **Report A `#/reports/building-profit`** (§12.23.3): input kỳ + tòa; layout 11 nhóm dòng theo mẫu "Báo cáo tháng 6" (DOANH THU → CỌC/HOÀN CỌC → SỐ LƯỢNG PHÒNG → DT TIỀN NHÀ → DT DỊCH VỤ → GIÁ VỐN → CPBH/VH → TỔNG CHI PHÍ → LN GỘP → LN RÒNG → CÁC TỶ LỆ) + **bảng cổ phần** §12.23.9 (tỷ lệ snapshot, vốn, LN gộp × %, LN ròng × %, tổng nhận, kiểm tra 100%); mỗi dòng có `metric_code`, số chứng từ, chip trạng thái, kính lúp drill-down (modal chứng từ + link mở); xuất CSV theo layout Excel; kỳ đã khóa đọc snapshot + chip "Dữ liệu sống hiện lệch N chỉ tiêu"; nút Generate phân phối LN khi kỳ Locked. Tab **Báo cáo** ở chi tiết Tòa tóm tắt Report A.
- **Report B `#/reports/business-summary`** (§12.23.8): cột Total / Nhà T / Nhà S / Nhà G cho mọi metric, dòng Số tòa, KPI mỗi nhóm, kiểm tra "TOTAL = T + S + G ✓"; bấm số của nhóm → danh sách tòa → Report A; bảng tòa trong kỳ (loại tại kỳ, DT, COGS, CPBH, LN ròng, LNR/DT).
- **Kỳ báo cáo `#/reports/periods`** (§12.23.1/§12.23.13, `reportPeriods` / `reportSnapshots` / `reportMetricValues`): Open → **Gửi review** (cutoff) → **Khóa kỳ** (Kế toán/Admin: sinh snapshot Report A mỗi tòa + 1 snapshot T/S/G với `total/t/s/g`, `drilldownCount`, chi tiết drill; freeze Metric Definition Version, Allocation Version, loại tòa theo kỳ, Payroll Cost Allocation, Building Share Snapshot; audit + event `PROFIT_REPORT_LOCKED`) → **Trả lại** (lý do) / **Mở lại** (Admin, bắt buộc lý do/audit, chặn khi đã có phân phối LN xác nhận); lịch sử kỳ. Report locked không đổi khi dữ liệu/master/assignment/cổ phần đổi sau đó (AC 16).
- **Đối soát golden `#/reports/reconcile`** (§12.23.12, `goldenDatasets`): bảng `metric_code / excel_value / system_value / difference / % / status / note` với status MATCH · ROUNDING_DIFFERENCE (< 1 VND, ±0,05 điểm %) · RULE_DIFFERENCE · SOURCE_DATA_DIFFERENCE · NEED_BUSINESS_CONFIRMATION (metric hoặc metric phụ thuộc chưa chốt, kèm Q-RPT); count khớp tuyệt đối; export CSV. **Golden A – G1 tháng 06/2026** tái lập bằng dữ liệu nguồn (tòa G1 loại G: 12 phòng, 12 hóa đơn 06/2026 với dòng tiền phòng 47.760.000 + điện 12.460.000 + nước 3.304.000 + vệ sinh 1.352.000 + mạng 853.333,333 + xe điện 450.000 + thang máy 1.292.000 + máy giặt 1.352.000; chi phí GV-THUE 48.000.000, GV-TB 500.000, GV-DIEN 17.258.594, GV-NUOC 300.000, GV-RAC 300.000; lương 6.000.000 (Payroll Cost Allocation), văn phòng chung phân bổ 1.200.000, marketing 1.500.000, hoa hồng 1.000.000, sửa chữa 500.000, khác 276.125,04; 2 HĐ mới, 3 phá HĐ, 1 phòng trống 30/06, cọc mới 3.800.000, cọc giữ lại 1.000.000) → **19 metric MATCH từng line** (RENT/dịch vụ/giá vốn/COGS/CPBH/TOTAL_COST/NEW_DEPOSIT), TOTAL_REVENUE / GROSS_PROFIT / NET_PROFIT / NET_MARGIN / FORFEITED_DEPOSIT / 3 count = NEED_BUSINESS_CONFIRMATION (Q-RPT-001…005); **Golden B – tháng 8** chỉ lưu kỳ vọng (Total/T/S/G) → SOURCE_DATA_DIFFERENCE có ghi chú.
- **Cổ đông §4.29** (`#/investment/shareholders`): master mã / họ tên-pháp nhân / CCCD / MST / SĐT / email / TK ngân hàng / trạng thái; chi tiết = tòa tham gia, lịch sử tỷ lệ, vốn góp, phần LN được phân bổ; **Ngừng hoạt động** (chặn khi còn cổ phần hiệu lực). **Cổ phần theo tòa `#/investment/shares`** (§4.30, `buildingShares`): tỷ lệ hiện tại / **theo ngày-kỳ** (date picker) / lịch sử / kiểm tra tổng 100% từng tòa / export share table; **Cấu hình cổ phần** từ ngày hiệu lực: tổng phải = 100%, record cũ đóng `effectiveTo`, record mới theo ngày, không ghi đè lịch sử, không đổi hồi tố vào kỳ đã khóa. Migration: cam kết vốn theo dự án (P3) → `buildingShares` theo tòa với ngày hiệu lực; G1 có 9 cổ đông = 100% (đổi An 7 → 5 %, Lan 5 → 7 % từ 01/09/2026 để demo "báo cáo kỳ cũ dùng tỷ lệ đúng kỳ").
- **Góp vốn theo tòa §4.31** (`capitalCalls` / `capitalPayments`, tab Góp vốn theo tòa): Tòa → Đợt (tổng cần góp, hạn) → phân bổ theo cổ phần hiệu lực tại ngày lập → từng cổ đông: tỷ lệ, phải góp, đã góp, còn thiếu, hạn, ngày góp, chứng từ (bắt buộc), ghi chú; trạng thái đợt Đang góp / Quá hạn / Đã góp đủ / Đã hủy; export. Đợt góp vốn cũ theo dự án migrate sang đợt theo tòa; tab P3 "Đóng góp theo dự án" chỉ hiện khi bật Phase 3.
- **Phân phối lợi nhuận §4.32** (`profitDistributions`, tab Phân phối lợi nhuận): **Generate từ kỳ báo cáo Đã khóa** (event PROFIT_REPORT_LOCKED): LN được phân phối = `NET_PROFIT` snapshot (hoặc số theo quyết định, ghi cơ sở) × **tỷ lệ cổ phần snapshot**; mỗi dòng: tỷ lệ snapshot, vốn liên quan, LN gộp × %, LN ròng × %, tổng nhận (Vốn + LN); Nháp → Chờ xác nhận → **Xác nhận** (Admin, ngày xác nhận) / Hủy có lý do; đổi tỷ lệ sau này không đổi bảng; kỳ có bảng đã xác nhận không mở lại được. Payout/cổng cổ đông (role `codong`) giữ ở Phase 3.
- Kịch bản demo (`X.ensureW5Scenario`, sau kịch bản W4): kỳ **06/2026 Đã khóa** (review 03/07, khóa 05/07/2026) với snapshot 6 tòa + T/S/G, phân phối LN G1 06/2026 đã xác nhận (3.077.280,96 theo báo cáo workbook – NET_PROFIT hệ thống thấp hơn do TOTAL_REVENUE chưa chốt), kỳ 09/2026 Đang review, kỳ hiện tại Open; đợt góp vốn G1 đợt 1 đã đủ, đợt 2 (90 triệu) 4/9 đã góp.
- Quyền mới: `reports.lock` (Admin/Kế toán), `reports.reopen` (Admin), `metrics.manage` (Admin), `shares.view` (Admin/Kế toán/QL Tổng/Cổ đông), `shares.manage` (Admin/Kế toán). Menu Báo cáo: Báo cáo chi tiết tòa · Báo cáo kinh doanh T/S/G · Kỳ báo cáo & snapshot · Đối soát Excel (golden) · Metric Registry; menu Đầu tư: Cổ đông · Cổ phần theo tòa · Góp vốn theo tòa · Phân phối lợi nhuận; Report Hub thêm nhóm "Báo cáo Phase 1 (spec v1.8)".
- Guide: luồng **F16 "Báo cáo tháng: Report A/B → drill-down → khóa kỳ → đối soát golden"** (4 mốc) và **F17 "Cổ đông → cổ phần theo tòa → góp vốn → chia lợi nhuận"** (4 mốc); luồng P3 đánh số lại F20–F23 (Kiểm kê, Nhân sự, Cổ đông theo dự án, Ngân hàng); `runAll()` chạy thêm F16/F17; walkthrough P1 53/53 (thêm F16.1–F16.3, F17.1–F17.2).

## Workbook alignment (v2.3)

Mockup có thêm lớp đối soát workbook theo hướng additive, giữ tương thích state cũ:

- Khu nhà, loại nhà T/S/G, phân công nhân sự theo ngày hiệu lực và team kinh doanh.
- Taxonomy chi phí hai cấp `GV/DV/VH/BH` và nhóm khấu trừ hoàn cọc chuẩn hóa.
- Bộ lọc dimension dùng chung và registry metric có công thức/nhãn `Giả định`.
- Preset cột **Đối soát**; thao tác xuất CSV dùng đúng các cột đang hiển thị.
- Trung tâm Tài liệu tại `#/documents`.
- Nhóm **Đối soát workbook** tại `#/reports/hub`, gồm sổ doanh số, sổ khách, sổ hoa hồng, lợi nhuận, chi phí, điện nước, đúng hạn, phòng trống và tài sản/cọc cổ đông.

Các query dùng chung: `areaId`, `buildingId`, `buildingType`, `leadId`, `opsId`, `saleId`, `teamId`, `shareholderId`, `vac`, `preset`. Quy ước nhận diện phòng là `Mã tòa · Mã phòng`.

Các công thức gắn nhãn **Giả định – chờ xác nhận** chỉ phục vụ review mockup, chưa phải số liệu kế toán được duyệt. Xem `docs/TimeHouse-Workbook-Alignment-Decisions-v1.0.md` để review 10 quyết định và owner sign-off.

Mockup click-through dựng từ bộ PNG `Phase_1_Core_Rental_GoLive/` (mặc định), `Phase_2_Sales_Automation_Operations/` và `Phase_3_Enterprise_Investment/` (bật bằng công tắc phase – xem mục *Phase 2* / *Phase 3* bên dưới), SRS v1.2 và UI Spec v1.5. Mọi nút trong PNG đều bấm được; dữ liệu thay đổi thật (localStorage) theo state machine của SRS §6.

## Chạy
- **Cách 1:** mở `index.html` bằng Chrome/Edge (double-click) – chạy trực tiếp từ file://.
- **Cách 2:** ở thư mục gốc repo chạy `npm run dev` rồi mở `http://localhost:8765` (cần Node ≥ 20, không cần cài dependency).
- **Deploy Netlify:** xem mục *Deploy lên Netlify* trong `README.md` ở gốc repo (`npm run build` → thư mục `dist/`; repo đã có `netlify.toml`).
- Tài khoản demo (mật khẩu bất kỳ): `admin` (Quản trị viên), `qltong` (Quản lý Tổng), `tpvh1` (Trưởng phòng vận hành), `ketoan` (Kế toán), `vanhanh` (Vận hành), `nhansu` (Nhân sự); khi bật Phase 2 thêm `sale` (Sale), `kythuat` (Kỹ thuật); khi bật Phase 3 thêm `codong` (Cổ đông – read-only). Đổi vai trò nhanh ở menu góc phải.
- Ngày hệ thống demo cố định **28/10/2026**, kỳ **Tháng 10/2026** để khớp số liệu mockup (đổi tại *Công cụ nâng cao*).

## Kịch bản demo 16 điều kiện Go-live
Bật **Hướng dẫn thao tác** (nút trên topbar). Panel dẫn qua 10 luồng / 36 mốc, tự nhận biết hoàn thành từ dữ liệu bạn tạo:

| Luồng | Nội dung | Go-live |
|---|---|---|
| S0 | Đăng nhập, Tổng quan, Danh mục dịch vụ, Phòng sẵn sàng | – |
| F01 | Thêm khách thuê | 1 |
| F02 | Chọn phòng → Tạo hợp đồng → giá/cọc/dịch vụ → Kích hoạt (phòng → Đang thuê) | 2, 3, 4 |
| F03 | Nhập điện nước → Preflight → Tạo nháp → Phát hành hóa đơn | 5, 6 |
| F04 | Gửi hóa đơn qua Zalo (re-check công nợ, tiến độ gửi) | 7 |
| F05 | Xem công nợ → Thu một phần → Chi tiết khoản thu → Theo dõi còn nợ | 8, 9, 10 |
| F06 | Nhắc công nợ qua Zalo, thử lại tin lỗi | 11 |
| F07 | Kết thúc hợp đồng → phòng Chờ dọn, tạo hồ sơ hoàn cọc | 12, 14 |
| F08 | Lập phương án → Gửi duyệt → Kế toán duyệt → Ghi nhận đã hoàn | 13 |
| F09 | Xác nhận dọn xong → phòng Sẵn sàng | 15, 16 |
| F10 | Chi phí, Import khách bằng file mẫu, Tạo tài khoản, Xuất báo cáo | tùy chọn |

Các nút trong panel (Đi tới màn hình, Chuyển vai trò, Xem/Điền dữ liệu mẫu, Tải/Dùng file mẫu) **không tạo record**; record chỉ sinh qua nút Lưu/Xác nhận của màn nghiệp vụ.

## Công cụ nâng cao (cuối sidebar)
Đặt lại dữ liệu demo · Xóa trắng dữ liệu nghiệp vụ · Đổi ngày hệ thống · Xuất/Nhập state JSON · Chạy toàn bộ kịch bản Go-live (kiểm tra kỹ thuật) · Reset tiến độ hướng dẫn. API console: `window.__timehouseDemo`.

## Quy ước & mặc định nghiệp vụ (OI còn mở)
- Mã phòng chuẩn hóa `A.12.03`; mã đợt Zalo `ZL-202610-xxx`.
- Nút thao tác trên dòng bảng ở dạng icon; rê chuột hoặc focus (Tab) vào icon để xem tên thao tác. Nút ⋮ mở menu thao tác đầy đủ.
- **Bố cục màn danh sách** (P1/P2/P3): bảng, kanban, lịch, lưới chấm công luôn **full-width**; các card phụ (biểu đồ, lịch sắp tới, hướng dẫn, quy tắc…) nằm trong dải **Thông tin liên quan** phía trên bảng – bấm thẻ để mở/đóng nội dung. Chỉ màn chi tiết (thông tin + tiến trình) và wizard (form + tóm tắt/xem trước) dùng bố cục 2 cột.
- **Kỳ báo cáo**: chọn kỳ ở topbar hoặc trong bộ lọc trang đều đồng bộ với nhau; "Tất cả kỳ" (từ chuông việc cần xử lý) bỏ lọc kỳ cho trang đó.
- **Kết thúc HĐ**: mặc định phòng → Chờ dọn (BR-02); bỏ tick "Chuyển phòng sang Chờ dọn" thì phòng → Sẵn sàng ngay. Phòng không bao giờ kẹt ở Đang thuê khi không còn HĐ hiệu lực.
- **Zalo**: rule 3 ngày (không gửi lại khách vừa nhận tin) áp dụng cả ở nút Gửi nhắc nhanh – có ô "Vẫn gửi" để ghi đè khi demo; công nợ được re-check lại đúng lúc bấm Xác nhận gửi; rule đang tắt trong Cấu hình Zalo sẽ chặn tạo đợt gửi cùng sự kiện (FR-ZAL-01). Các đợt gửi lịch sử (seed) chỉ có số liệu tổng, không có chi tiết tin.
- **Chỉ số điện nước**: chỉ số đã dùng cho hóa đơn của HĐ trước không tái dùng cho HĐ mới cùng kỳ – wizard báo "Thiếu chỉ số (chỉ số cũ của HĐ trước)" và lấy chỉ số cũ = số đã chốt.
- **Xác nhận thu tiền** (nút $ trên dòng / chọn nhiều dòng ở Hóa đơn, Thu tiền & công nợ, chi tiết hóa đơn/khách): thu **đủ** số còn lại của các hóa đơn đã chọn, bắt buộc đính kèm minh chứng (có "Dùng minh chứng mẫu" cho demo), tự tách 1 khoản thu / khách. **Thu tiền thủ công** (đầu trang Thu tiền & công nợ, menu ⋮ → "Thu một phần / phân bổ thủ công"): chọn khách, thu một phần, phân bổ tay.
- Thu một phần: **cho phép**. Cờ "cần xử lý công nợ" = phát hành + 5 ngày (BR-07); nhãn Quá hạn theo hạn thanh toán.
- **Import hóa đơn**: Hóa đơn → "Import hóa đơn" (hoặc Import dữ liệu → Hóa đơn). 1 dòng = 1 hóa đơn theo số tiền (Tiền phòng trống = giá HĐ, Điện/Nước/Dịch vụ khác nhập thẳng số tiền); gắn vào HĐ hiệu lực của phòng, bỏ qua phòng đã có hóa đơn kỳ đó; tạo ở trạng thái **Nháp**. File mẫu: `assets/samples/mau-import-hoa-don.csv` hoặc nút "Tải file mẫu".
- Chi phí (spec v1.8 §4.27 từ W4): lương/chi lương không nhập vào Chi phí; hoa hồng Phase 1 nhập/import vào hạng mục Hoa hồng (BH-HH); chi phí chung phải phân bổ (theo số phòng/doanh thu/số tòa/tỷ lệ/nhóm T-S-G) trước khi vào báo cáo theo tòa.
- Hoàn cọc (spec v1.8 §4.18 từ W3): thực hoàn = cọc đang giữ − công nợ được phép bù trừ − phạt − sửa chữa − vệ sinh − khác; không còn khấu hao cố định BR-12 và quy ước OI-07; chỉ Admin/Kế toán duyệt (FR-FIN-07); phòng chỉ Sẵn sàng sau xác nhận dọn xong (BR-02).
- Zalo: ZBS Template Message; fallback SMS chưa dùng (OI-21); gửi thành công ≠ đã thanh toán.
- Mục sidebar gắn **P2/P3** là ngoài scope Phase 1, mở trang mô tả scope, không có action.

## Phase 2 – Sales, Automation & Operations (công tắc phase)

Bộ 18 màn PNG `Phase_2_Sales_Automation_Operations/` được dựng vào cùng mockup, gắn nhãn **P2** (chip cạnh tiêu đề trang, badge trên sidebar/nút/tab/menu, badge luồng trong panel hướng dẫn). Kế hoạch chi tiết: `Timehouse-Mockup-Plan-Phase2-v1.0.md`.

### Bật / tắt phase
- **Công cụ nâng cao** (cuối sidebar, Admin) → khối *Phạm vi demo*: Phase 1 luôn bật; **Phase 2** và **Phase 3** bật/tắt độc lập.
- **Mặc định lần đầu mở: chỉ Phase 1.** Trạng thái phase lưu riêng `localStorage['timehouse-phase-v1']`, không nằm trong state nghiệp vụ → *Đặt lại dữ liệu demo / Xóa trắng / Nhập state JSON* **không** đổi phase; đổi phase không xóa dữ liệu.
- Tắt P2: mọi màn/nút hành xử y hệt bản Phase 1 (mục P2 mờ → trang coming-soon, nút P2 disabled). Đang đứng ở route P2 khi tắt → trang tự thành coming-soon (giữ URL); đang là Sale/Kỹ thuật → tự về Admin.
- Bật P2: mở thêm 2 vai trò **`sale`** (Nguyễn Thị Hương – Sale) và **`kythuat`** (Trần Minh Đức – Kỹ thuật) – đăng nhập hoặc *Chuyển vai trò* ở menu góc phải.
- Console: `__timehouseDemo.setPhase(2, true|false)`, `__timehouseDemo.phases()`, `__timehouseDemo.runAllP2()`.

### 18 màn Phase 2 → route
| Nhóm | PNG | Route |
|---|---|---|
| CRM | 04/01 Tổng quan kinh doanh | `#/crm` |
| CRM | 04/02 Lead & pipeline (Kanban kéo-thả / Bảng) | `#/crm/leads` |
| CRM | 04/03 Chi tiết lead | `#/crm/leads/:id` |
| CRM | 04/04 Đặt lịch xem phòng (wizard 4 bước) | `#/crm/viewings/new?lead=` · danh sách `#/crm/viewings` |
| CRM | 04/05 Giữ chỗ phòng (wizard 4 bước, countdown) | `#/crm/holds/new?lead=` · danh sách `#/crm/holds` |
| CRM | 04/06 Chốt thuê (wizard 5 bước) | `#/crm/deals/new?lead=` → `#/contracts/new?deal=` |
| CRM | 04/07 Giao dịch & hoa hồng | `#/crm/deals` · chi tiết `#/crm/deals/:id` |
| Hợp đồng | 02/05 Review trích xuất hợp đồng (OCR) | `#/contracts/ocr` → `#/contracts/new?ocr=` |
| Tài chính | 03/06 Nhập bảng kê thu tiền | `#/finance/statement-import` |
| Tài chính | 03/09 Duyệt hoàn cọc (yêu cầu chỉnh sửa, hiện trạng, ghi chú) | `#/refunds/:id` (layout P2 khi bật) |
| Tài chính | 03/11 Chuyển số dư ban đầu | `#/finance/opening-balance` |
| Tài chính | – Quản lý cọc (sidebar, không có PNG) | `#/finance/deposits` |
| Zalo | 05/05 Chi tiết lần gửi (provider 200/300/403/408, retry, log, donut) | `#/zalo/batches/:id` · chính sách retry/mẫu ở `#/zalo/config` |
| Bảo trì | 06/01 Bảo trì & sự cố | `#/maintenance` · chi tiết `#/maintenance/incidents/:id` |
| Bảo trì | 06/02 Lịch bảo dưỡng (lịch tháng) | `#/maintenance/schedules` |
| Báo cáo | 08/01 Trung tâm báo cáo (32 báo cáo) | `#/reports/hub` · báo cáo chuẩn `#/reports/r/:key` |
| Báo cáo | 08/02 Báo cáo dòng tiền & quản lý kỳ (khóa kỳ) | `#/reports/cashflow` |
| Data Job | 10/05 Danh sách tác vụ (tên file PNG bị đảo) | `#/settings/jobs` |
| Data Job | 10/04 Chi tiết job (Kiểm tra lại / Thử lại phần đủ điều kiện) | `#/settings/jobs/:id` |

Điểm nối P2 trong màn P1 khi bật: Phòng → *Tạo sự cố* + tab *Sự cố*; Tòa nhà → tab *Hiệu suất*, *Lưu bộ lọc*; Khách thuê → *Lưu bộ lọc*; Hóa đơn → *Bộ lọc nâng cao* (tòa, khách, khoảng tiền, đã nhắc Zalo, quá hạn); Chi phí → *Khấu hao* (số tháng); Chủ nhà → *Nhắc thanh toán Zalo*; Danh mục → tab *Nguồn khách*, *Nhà cung cấp*; Import → tile *Bảng kê*, *Lead*; Báo cáo P1 → *Trung tâm báo cáo*; Tạo HĐ → radio *Tải hợp đồng* → OCR.

### Kịch bản demo Phase 2 (panel Hướng dẫn thao tác, +5 luồng / 20 mốc khi bật P2 – F12 OCR đã chuyển sang Phase 1)
F11 CRM: lead → gọi → lịch xem → giữ chỗ → chốt thuê → HĐ → thu cọc → hoa hồng đã chi · F13 Bảng kê thu tiền → Data Job kiểm tra lại/thử lại → số dư đầu kỳ · F14 Sự cố (Vận hành tạo, Kỹ thuật xử lý, chi phí) → lịch bảo dưỡng (nhắc 7 ngày) · F15 Ghim báo cáo → khóa kỳ 10/2026 → Zalo retry 403/408 · F08.5 Hoàn cọc yêu cầu chỉnh sửa → sửa → duyệt lại. Nút *▶ Chạy kịch bản Phase 2 (kỹ thuật)* trong Công cụ nâng cao chạy toàn bộ bằng actions; chạy lại nhiều lần được (tự mở lại kỳ đã khóa, bỏ qua bước đã có dữ liệu).

### Quy ước & giả định Phase 2 (ghi rõ để BA xác nhận)
- Mã hoàn cọc dùng `RC…` của P1 (PNG P2 ghi `HC-001`); đợt Zalo hero `ZL-202610-104` (PNG `ZL-2026-104`); lead `LD-2026-081` là hero (Trần Minh Đức, cột Cân nhắc).
- Hoa hồng: 10% giá thuê tháng đầu, chi một lần, idempotent; đủ điều kiện khi **cọc thu đủ và HĐ kích hoạt** (BR-13/OI-14); hủy/kết thúc HĐ → về tạm tính, không tạo khoản mới.
- Giữ chỗ tối đa 14 ngày, phí trừ vào cọc (OI-09), tự hết hạn theo ngày demo → phòng Sẵn sàng; khách thuê được tạo từ lead ngay khi giữ chỗ. Kanban: kéo thẻ vào *Giữ chỗ*/*Chốt thuê* mở wizard tương ứng; thẻ đang giữ chỗ không kéo lùi được (phải hủy giữ chỗ trước); vai trò chỉ xem không kéo được.
- Số dư đầu kỳ: mỗi HĐ tạo **1 hóa đơn `kind:'opening'`** (kỳ = mốc) + 1 khoản thu `kind:'opening'` cho phần đã thu → tái dùng công nợ/nhắc nợ P1, không sinh khoản thu ngoài số dư.
- Dòng tiền: thu thật từ khoản thu (FR-REP-02), chi loại trừ khấu hao (BR-08), cọc/phí giữ chỗ tách riêng (BR-20). Khấu hao đường thẳng theo số tháng nhập tay (OI-11). Hiệu suất tòa = ngày có khách / ngày kỳ, tòa bảo trì = N/A (BR-09, OI-12).
- Khóa kỳ (FR-FIN-08): checklist 6 mục (3 tự động theo dữ liệu – có thể xác nhận tay sau rà soát, 2 tick tay, 1 = bấm Khóa); sau khóa `recordPayment / issueInvoice / adjustInvoice / createInvoiceDrafts / saveExpense / reversePayment` trong kỳ bị chặn; báo cáo dùng snapshot.
- Zalo: mã lỗi P1 `ZLM-1001/2003` ↔ provider `300/403`, thêm `408 Timeout`; retry chỉ 403/408 và chưa quá số lần trong chính sách; 300 là lỗi vĩnh viễn (fallback SMS mô phỏng nếu bật – OI-21). *Tải log (.xlsx)* / *Tải template* xuất CSV (offline, không SheetJS).
- Trung tâm báo cáo: 32 báo cáo, 10 chạy thật trên dữ liệu (`cashflow, expense-by-building, operating-result, occupancy, refunds, room-status, maintenance, sales-performance, leads-funnel, customer-segment`), 18 báo cáo nhãn **OI** mở trang "Công thức chờ chốt", 4 báo cáo Đầu tư → P3.
- Mục scope không có PNG (Kênh cho thuê, Marketing, Thiết lập hệ thống) → coming-soon "Chưa có mockup UI". Kiểm kê hàng tháng = P3.
- File mẫu mới: `assets/samples/mau-bang-ke-thu-tien.csv` (20 dòng: khớp mã HĐ, khớp khách + số tiền, không ghép, trùng, hóa đơn nháp), `mau-so-du-dau-ky.csv` (13 dòng, 2 chênh lệch, 1 HĐ không tồn tại), `mau-hop-dong-ocr.txt`. Trong app các file mẫu được sinh từ dữ liệu hiện có (nút *Dùng file mẫu*).
- State `schema = 3`: state cũ (v2) được migrate và seed bổ sung dữ liệu P2 trên dữ liệu hiện có (idempotent `meta.p2Seeded`), không mất dữ liệu người dùng.

## Phase 3 – Enterprise & Investment (công tắc phase)

Bộ 4 màn PNG `Phase_3_Enterprise_Investment/` + các màn **tự thiết kế** cho mọi mục sidebar P3 được dựng vào cùng mockup, gắn nhãn **P3** (chip cạnh tiêu đề, badge sidebar, badge luồng). Kế hoạch chi tiết: `Timehouse-Mockup-Plan-Phase3-v1.0.md`.

### Bật / tắt
- **Công cụ nâng cao** → *Phạm vi demo* → tick **Phase 3** (độc lập với P2; bật cả hai để dùng đủ liên kết chéo: kiểm kê → tạo sự cố, KPI nhân viên từ CRM, đối soát ngân hàng dùng quy tắc ghép bảng kê).
- Bật P3 mở thêm 2 vai trò: **`nhansu`** (Ngô Thị Quỳnh – Nhân sự: hồ sơ/chấm công/lương, không có quyền tài chính – FR-HR-01) và **`codong`** (Trần Minh Đức – Cổ đông: read-only, chỉ thấy tòa/dự án đã góp vốn – FR-SHR-03/04). Tắt P3 khi đang là 2 vai trò này → tự về Admin; route P3 → coming-soon (giữ URL).
- Console: `__timehouseDemo.setPhase(3, true|false)`, `__timehouseDemo.runAllP3()`.

### Màn Phase 3 → route
| Nhóm | PNG / Tự thiết kế | Route |
|---|---|---|
| Tài sản | 06/03 Kiểm kê tài sản | `#/assets/inventory` · biên bản `#/assets/inventory/:id` (cũng từ Bảo trì → tab *Kiểm kê hàng tháng*) |
| Tài sản | – Sổ tài sản (tự thiết kế: danh mục, QR, nguyên giá, khấu hao) | `#/assets` · tab *Tài sản* ở chi tiết tòa · link mã TS ở tab Tài sản phòng |
| Nhân sự | 07/01 Quản lý nhân viên | `#/hr` |
| Nhân sự | 07/02 Chi tiết nhân viên (Tổng quan / Phân công / Hồ sơ / Lịch sử) | `#/hr/:id` |
| Nhân sự | – Chấm công (tự thiết kế, mô phỏng – ngoài SRS §2.2) | `#/hr/timesheet` |
| Nhân sự | – Lương thưởng (tự thiết kế, FR-HR-02/BR-14, OI-15) | `#/hr/payroll` |
| Đầu tư | 09/01 Cổ đông, vốn góp & phân phối (tab Cổ đông · Đóng góp theo kỳ · Phân phối lợi nhuận) | `#/investment/shareholders` (sidebar *Hiệu quả đầu tư* như PNG) |
| Đầu tư | – Dự án đầu tư (tự thiết kế) | `#/investment/projects` |
| Đầu tư | – Hiệu quả đầu tư theo tòa (tự thiết kế; Report Hub `roi`) | `#/investment/roi` |
| Tài chính | – Ngân hàng & đối soát (tự thiết kế, mô phỏng – scope §4.5) | `#/finance/bank` |

Report Hub: 4 báo cáo nhóm *Đầu tư* (`roi`, `shareholder`, `asset-value`, `project-progress`) mở trang P3 tương ứng khi P3 bật.

### Kịch bản demo Phase 3 (panel Hướng dẫn, +4 luồng F20–F23 / 14 mốc khi bật P3 – bảng lương đã chuyển sang F14, cổ đông/chia LN Phase 1 sang F17)
F20 Kiểm kê: bắt đầu đợt kỳ tới → cập nhật tình trạng 1 tài sản (ảnh, ghi chú) → đánh dấu hàng loạt → hoàn tất & xuất biên bản · F21 Nhân sự: thêm NV (thử việc) → phân công tòa chính → xác nhận bảng công → tính lương → gửi duyệt → Kế toán duyệt & ghi chi (chi phí nhóm Lương theo tòa) · F22 Cổ đông (theo dự án, P3): thêm cổ đông với tỷ lệ nhập tay → tạo đợt góp vốn (nghĩa vụ theo tỷ lệ) → ghi nhận góp → lập bảng phân phối → Admin duyệt → ghi đã chi → xem với vai trò Cổ đông · F23 Ngân hàng: nhập sao kê mẫu → đối soát tự động (cần P2) → khớp tay 1 giao dịch. `runAllP3()` chạy kỹ thuật toàn bộ.

### Quy ước & giả định Phase 3 (ghi rõ để BA xác nhận)
- Ngày demo 2026 (PNG ghi 2024): `BB-KK-2026-10`, `BL-2026-10`, `PP-2026-Q3`; mã NV chuẩn `NV001` (PNG chi tiết ghi `NV-2024-012` → `NV002`). Tên người trùng nhau chéo module (Trần Minh Đức vừa là Kỹ thuật P2, NV001, cổ đông #1) giữ nguyên theo PNG; hồ sơ NV/cổ đông chỉ link tài khoản khi trùng tên user hiện có.
- Sổ tài sản 248 = 10 hero PNG + tài sản trong phòng P1 (`roomAssets` được promote, đồng bộ tình trạng hai chiều) + tài sản khu vực chung. Kiểm kê 10/2026 seed **Đang kiểm kê** 198/248 (32 cần xử lý, 18 hư hỏng) để demo F20; 09/2026 đã hoàn thành. Kết quả kiểm kê **không** tạo chi phí/giảm tài sản (AC-FR-MNT-02-2); tài sản cần xử lý → *Tạo sự cố* (P2).
- Nhân sự 28 (24 làm việc + 5 thử việc tính vào "Đang làm việc", 3 tạm nghỉ, 6 QLKV). Trạng thái SRS: Thử việc / Đang làm / Nghỉ việc; *Tạm nghỉ* theo PNG (ngoài SRS). KPI cá nhân tính thật từ CRM P2 theo tài khoản (số PNG chỉ là ví dụ); *Tỷ lệ hài lòng 92%* là số mẫu.
- Lương: từ W4 tính theo spec v1.8 §4.26 (hiệu suất thu tiền M1/M2/M3 × Payroll Rule + cấu phần cơ bản/phụ cấp) ở Phase 1 – xem mục Wave 4; BR-14/OI-15 và chi phí nhóm "Lương" không còn dùng.
- Cổ đông: tỷ lệ nhập tay theo dự án (Σ ≤ 100%/dự án, FR-SHR-02 AC-1); "Tỷ lệ góp vốn" = Σ(tỷ lệ × vốn dự án)/tổng vốn = 25/20/15/10/10/8/7/5 như PNG; "Còn thiếu" = nghĩa vụ đến hạn/sắp đến hạn (≤7 ngày) chưa góp (Trang 400tr, Mai 140tr); "Tổng vốn góp" = vốn điều lệ 12 tỷ (thực góp 11,46 tỷ). Nghĩa vụ định kỳ sinh theo kỳ trả chủ nhà của tòa (BR-15). Phân phối: dòng làm tròn dồn vào cổ đông lớn nhất; *Đã chi* chỉ đánh dấu, không tạo chi phí (UC-08, OI-17).
- ROI theo tòa: vốn = vốn điều lệ dự án + nguyên giá tài sản; LN = thu thật − chi phí − khấu hao tháng; ROI năm hóa – tạm tính (OI-10/12/13/17).
- Ngân hàng, chấm công, QR nằm ngoài SRS v1.2 §2.2 – mô phỏng theo scope §4; đối soát tái dùng 4 quy tắc ghép bảng kê P2 (idempotent theo mã giao dịch).
- Không đổi `schema`/`KEY`: state cũ được seed bổ sung P3 (idempotent `meta.p3Seeded`), không mất dữ liệu người dùng.

## Cấu trúc
`index.html` · `css/` (tokens, base, components, pages) · `js/core/` (format, store, phase, seed, seed-p2, seed-p3, selectors, selectors-p2, selectors-p3, auth, actions, import, actions-p2, actions-p3, router, guide, guide-p2, guide-p3) · `js/ui/` (icons, components, table, chart, components-p2, components-p3, layout, forms) · `js/pages/` (1 file / nhóm màn; P2: crm, ocr, finance2, maintenance, reportHub, jobs, zalo2; P3: assets, hr, investment, bank) · `assets/samples/` (CSV mẫu import).
