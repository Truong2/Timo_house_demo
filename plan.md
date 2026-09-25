# Kế hoạch dựng UI cho 29 FR còn lại (FR00–01, FR06–33) theo SRS v1.0

## Context

**Đã có:**
- FR02–FR05 (cụm Nguồn nhà) chạy end-to-end trong SPA `app/`: vanilla ES modules, lưu localStorage.
- SRS cho 29 FR còn lại vừa viết xong trong 7 file `docs_timonouse/outputs/TimoHouse_SRS_v1.0_0x-*.md`, khoảng 180 màn/popup.
- Sidebar hiện dẫn mọi màn ngoài cụm 02 tới `#/soon/UI-xx` (placeholder).

**Mục tiêu:** dựng toàn bộ 29 FR trong cùng app. Người dùng đã chốt:
- **Phạm vi:** tất cả, chia **5 đợt theo phụ thuộc dữ liệu**; dừng cho người dùng review sau mỗi đợt.
- **Hai tầng:**
  - Tầng A: nghiệp vụ lõi chạy thật, có test so với số Seed/golden.
  - Tầng B: các màn còn lại là mockup bấm được (lọc, tab, popup, chuyển trạng thái đơn giản có audit).
- **Mâu thuẫn spec:** chọn cách cho ra đúng số Seed, gắn chip `Cần xác nhận`, ghi vào sổ câu hỏi, không chặn tiến độ.

## Nguyên tắc (giữ từ đợt FR02–05)

- **Không sửa** `NAV`/`CSS`/helper mặc định trong `app/ui/shell.mjs` và `ui-imagegen-v1/_source/screens/*`. Gate parity 10/10 trong `scripts/check.mjs` phải luôn pass. Style mới đặt trong `app/app.css`.
- **Chỗ đỏ SRS:**
  - Control vẫn hiển thị; click mở `notSpecified(ref)` (`app/ui/controls.mjs`).
  - Giá trị ASSUMED/P-xx dùng `pend`/`pchip`.
  - Quyền giả định có banner ASSUMED (router tự chèn).
- **Mọi ghi dữ liệu** đi qua `ctx.tx` → `store.transaction` + `logAudit` (Common Rule 5). Lỗi nghiệp vụ ném `DomainError('…', 'E##')`.
- **Domain thuần** trong `app/core/domain/*.mjs`, chữ ký `(draft, env, …)`, test bằng `node --test` theo `tests/domain/helpers.mjs` (`fresh`, `env`, `tx`).

## Đợt 0 — Nền mở rộng (làm trước, một mình)

1. **Tổ chức mã theo cụm**
   - Màn mới đặt ở `app/screens/<cụm>/`: `tenancy/`, `service/`, `billing/`, `hr/`, `finance/`, `reports/`, `admin/`.
   - Mỗi cụm có `index.mjs` export `{ routes: [[pattern, screen, meta]], perms, chips, search }`.
   - `app/main.mjs` duyệt danh sách cụm để `register`, không liệt kê tay.
   - Route theo spec §8 (bảng `ROUTES` đang có trong `app/screens/placeholder.mjs`), chuyển vào `HREF` của `app/ui/shell-dom.mjs`.
   - Khai báo `#/contracts/new|ocr|expiring` trước `#/contracts/:id`.
   - `#/receivables?tab=payments` dùng cho FR13, `#/receivables` cho FR14.
   - Menu chưa làm xong vẫn rơi về placeholder.
2. **Quyền.** `PERMS` trong `app/core/auth.mjs` nhận phần mở rộng từ `perms` của từng cụm, giữ nguồn SRS/ASSUMED/own/scope. Cổ đông mở quyền xem FR29/FR31 theo SRS.
3. **Chip trạng thái.** `stChip` trong `app/ui/controls.mjs` thêm `registerChips(map)`. Mỗi cụm tự đăng ký chip của mình: hóa đơn 2 trục, kỳ Open/Reviewing/Locked, payment, phạt, phân công…
4. **Store.**
   - `SCHEMA` trong `app/core/seed.mjs` tăng lên 2 để state cũ tự reseed.
   - `buildInitialState()` ghép seed của từng cụm từ `app/data/seed-*.mjs`, thêm dần qua các đợt.
   - `meta.seq` thêm các mã mới.
5. **Thành phần dùng chung mới** (tái dùng `openModal`, `confirmModal`, `fsel`, `fsearch`, `paginate`, `pager`, `qtabs`, `auditTable`):
   - `app/ui/list.mjs`: khung màn danh sách theo Common Rule 6 (filter → URL, search debounce, bảng, empty state hai loại theo Common Rule 13, phân trang, click dòng).
   - `app/ui/drawer.mjs`: drawer phải, dùng cho drill-down FR31, chi tiết lương FR22, payment tòa FR21.
   - `app/ui/approval.mjs`: bộ action Gửi duyệt / Duyệt / Trả sửa / Từ chối / Mở khóa theo Common Rule 11. Gọi domain `transition(draft, env, {entity, id, to, reason})` trong `app/core/domain/workflow.mjs`, dùng bảng state machine khai báo từng entity.
   - `app/ui/import-wizard.mjs`: tổng quát hóa luồng import CSV của FR05 (`app/screens/rooms-new.mjs` + `parseCSV`/`mapColumns`/`validateImport` ở `app/core/domain/rooms.mjs`). Dùng lại cho FR13 (sao kê), FR23 (kết quả NH), FR24, FR26, FR32, FR33.
   - `app/core/period.mjs`: guard kỳ khóa (Common Rule 12) và banner persistent.
6. **Tham số và sổ câu hỏi**
   - `app/core/params.mjs`: registry P-xx gồm giá trị, ngày hiệu lực, trạng thái chốt. Domain đọc tham số qua `param(state, 'P-17', date)`, không hard-code.
   - `app/core/decisions.mjs`: sổ mâu thuẫn `Q-xx` gồm mô tả, cách app đang làm, nguồn SRS/Seed. Chip `Cần xác nhận` có tooltip dẫn tới Q-xx.
   - `scripts/export-questions.mjs` sinh `docs_timonouse/outputs/TimoHouse_Open_Questions_v1.0.md` để gửi khách.
7. **FR00 Đăng nhập**
   - `#/login` với tài khoản demo theo vai trò; lưu `meta.session`; giữ deep link.
   - Seed mặc định đã đăng nhập Admin nên luồng cũ không vỡ.
   - Đăng xuất về `#/login`. Đổi mật khẩu và Quên mật khẩu: `notSpecified`.

## Đợt 1 — Khách, HĐ, giá, chỉ số (FR06, FR07, FR08, FR09, FR10)

**Dữ liệu:** `app/data/seed-tenancy.mjs`:
- 15 khách/HĐ G1 lấy từ Seed §6.1 (giá, người ở, cọc, 4 khách mới 01/09);
- bảng giá §6.4;
- công tơ và chỉ số §6.2/§6.3, bổ sung CS cũ vào `seed-g1.mjs`;
- 20 dòng phá HĐ §8 để dùng ở Đợt 2.

**Tầng A:**
- `contracts.mjs`:
  - wizard 8 bước → `CONTRACT` / `VERSION` / `EVENT`;
  - checklist kích hoạt 8 điều kiện;
  - kích hoạt thì: phòng Đang thuê (`applyTransition` của FR05), snapshot giá FR09, sinh chỉ số OPENING, bút toán cọc; giá dưới giá QL phải duyệt.
- `services.mjs`: ưu tiên giá HĐ → override tòa → mặc định; mỗi dịch vụ × phạm vi × ngày chỉ một giá; version giá qua workflow.
- `meters.mjs`:
  - sản lượng; CS cũ lấy theo lineage;
  - điện chung/người (32 × 3.800 ÷ 3 = 40.533,33);
  - thất thoát MAIN − ΣROOM − COMMON;
  - cảnh báo ±50 %;
  - blocker thay công tơ / số mới < cũ.
- `tenants.mjs`: mã khách theo P-24; dò trùng CCCD/SĐT (tái dùng pattern `findDuplicate` của `landlords.mjs`); merge đánh dấu `merged`.
- FR08 OCR khách: mô phỏng như FR03 (`extraction.mjs`), 8 xung đột trong đó 3 chặn commit; commit tạo khách + HĐ Nháp + OPENING + cọc.

**Tầng B:** danh sách/chi tiết khách, popup người ở cùng/xe/ghi đè/cập nhật hàng loạt, preview giá theo tòa, lịch sử công tơ, ảnh công tơ.

## Đợt 2 — Hóa đơn, thu tiền, công nợ, kết thúc HĐ, cọc, Zalo (FR11–FR17)

**Tầng A:**
- `billing.mjs`:
  - hóa đơn 12 dòng + Thu khác (công thức SRS FR12); tạo nháp idempotent Contract + Room + Kỳ;
  - preflight Blocker/Cảnh báo; phát hành theo tòa;
  - hai trục trạng thái; nợ cũ vào dòng 11 và đóng hóa đơn kỳ trước.
  - Kỳ 09/2026 của G1 seed đúng số §6.2. Test kiểm công thức tái tạo 10/15 phòng; 5 phòng lệch ghi Q-xx.
- `payments.mjs`: phân bổ theo P-14; phần dư thành credit; auto-match mã phòng + đúng TK; mốc M1/M2/M3 theo P-19; tiền mặt chờ xác nhận (P-26); đảo = bản ghi âm.
- `receivables.mjs`: vào công nợ theo P-17; tuổi nợ 3 tầng (P-20); phạt 200k/ngày từ ngày 6 (P-09); luồng Đề xuất → Xác nhận/Miễn → Duyệt → lên hóa đơn; xóa nợ có lý do; tab nợ phá HĐ (§8: Σ 16.048.000 / 3.662.000, thu vượt 101T21).
- `deposits.mjs`: sổ cọc bất biến; phiếu hoàn = cọc − nợ − phạt − khấu trừ (P-16, DL #13); 301T41 = 1.103.225,806 theo Seed (÷31) kèm chip P-03.
- FR15:
  - hàng đợi ≤ 35 ngày (P-32);
  - gia hạn tạo version mới;
  - kết thúc 7 bước tuần tự: CLOSING → hóa đơn cuối → phiếu hoàn Nháp → phòng Chờ dọn → HĐ Kết thúc khi hoàn xong.

**Tầng B:** FR17 Zalo gồm rule, đợt gửi có preview và snapshot công nợ, lịch sử gửi mô phỏng Sent/Failed/Retry; các popup ghi nhận liên hệ, deadline.

## Đợt 3 — Nhân sự & lương (FR18–FR23)

**Dữ liệu:** `app/data/seed-hr.mjs` lấy từ Seed §9–§10: khối quản lý, 12 NVVH, 9 tòa của Huyền, bậc lương §9.4, tiến độ thu §10. Mở rộng `EMPLOYEES` và `buildingAssignments`.

**Tầng A:**
- `assignments.mjs`: mỗi tòa đúng 1 phụ trách chính, không chồng, không hở ngày; người hưởng xác định ngày 15; bị chặn khi kỳ lương đã khóa. Đây là nguồn scope cho `scopeBuildingIds`.
- `performance.mjs`: HS% và Mức/phòng = HS × Đơn giá ÷ Ngưỡng (P-01). Trọng số M1/M2/M3 cộng thẳng theo Seed, ghi Q-xx.
- `payroll.mjs`: lương = cố định + trưởng nhóm (phòng × 10k, P-12) + hỗ trợ + Σ HS tòa ± điều chỉnh; Open → Reviewing → Locked → Reopened; khóa thì HS chuyển Thực tế và mở chi lương.
  - Golden: Huyền 19.152.297,12; Mạnh 18.940.000; Huy 15.280.000.
- `salaryPayments.mjs`: 4 loại phiếu; còn lại = thực nhận − Σ đã chi; khớp NH theo (TK, tiền, ngày).

**Tầng B:** cây tổ chức, bổ nhiệm Lead, hồ sơ nhân sự, điều chuyển hàng loạt, đề nghị điều chỉnh HS.

## Đợt 4 — Chi phí, tài sản, cổ đông (FR24–FR29)

**Dữ liệu:** `app/data/seed-finance.mjs` lấy từ Seed §4.1 (đầu tư 38.862.000), §5 (9 cổ đông, 230.400.000, chênh 1.862.000), §11 (hoa hồng), §12 (HĐ nhà cung cấp).

**Tầng A:**
- `expenses.mjs`: hai kỳ AC/CF; khóa trùng; vốn hóa ≥ 2 triệu (P-11); phiếu nguồn system bị khóa.
- `allocation.mjs`: (Tổng ÷ N) × n + phần cố định; phần dư làm tròn gán vào tòa có n lớn nhất; tách CF/AC; run Nháp → Duyệt → Khóa.
- `commissions.mjs`: đối chiếu giá × tỷ lệ; cảnh báo lệch > 1.000; bỏ cọc; đã chi thì sinh phiếu FR24.
- `assets.mjs`: khấu hao theo P-02; nối 11 tài sản bàn giao từ commit FR03.
- `headLeaseCosts.mjs`: CF/AC/chênh lũy kế trên HĐ đầu vào FR03 đã có; nhắc 15/7/1.
- `shareholders.mjs`: version %, Σ% = 100, số dư vốn, phân phối quý theo LN AC lũy kế dương.

## Đợt 5 — Báo cáo, quản trị, dashboard (FR30–FR33, FR01)

**Tầng A:**
- `periods.mjs`: checklist khóa 8 mục; freeze snapshot; version v1…vN; mở khóa chỉ Admin; so sánh version.
- `reports.mjs`: Report A từ các khối; LNG = DT − GV; LNR = LNG − CPBH; 11 tỷ lệ; mẫu số 0 hiện `n/a`; Report B = Σ A (tỷ lệ tính lại); bảng chia cổ phần.
  - Golden G1 08/2026: DT 84.186.000, LNG 22.990.932, LNR 14.664.969,25, 11 tỷ lệ; §14 TỔNG = T + S + G.
  - HH/CPBH 44,10 % khớp Seed chỉ khi cộng thêm MKT, ghi Q-xx.
- `reconcile.mjs`: chênh hệ thống − Excel, dung sai 1 VND, 5 nhãn; SOURCE_DIFF chặn khóa kỳ.
- FR01 dashboard: `workQueue.mjs` sinh việc từ dữ liệu các cụm; KPI tính từ state; popup chuyển/bỏ qua việc.

**Tầng B:** FR33 gồm user/quyền với preview "Người này sẽ thấy gì?" (dùng `can` + scope), danh mục, tham số (sửa `params`), import jobs (gom mọi job), audit log có lọc.

Màn verified có sẵn nguồn trong `_source/screens` (UI-01, UI-26, UI-27, UI-31): **chép** phần body sang màn SPA, thay dữ liệu hard-code bằng `ctx.state`. Không import các file đó.

## Cách thực thi mỗi đợt

1. **Tự làm phần dùng chung của đợt:** seed, domain, test golden, `perms`/`chips`/`routes` của cụm. Chạy `npm run check`.
2. **Giao màn cho agent song song**, mỗi agent sở hữu riêng file màn của một FR. Brief gồm: SRS file, screen contract, thành phần dùng chung, quy ước chỗ đỏ. Agent không sửa file dùng chung.
3. **Tích hợp:** chạy verify, sửa lỗi, rồi báo cáo đợt và **dừng chờ người dùng review** trước khi sang đợt sau.

## Verification (mỗi đợt)

1. **`npm run check`:**
   - cú pháp;
   - shell parity 10/10;
   - `node --test`: thêm `tests/domain/{tenancy,billing,hr,finance,reports}.test.mjs`, trong đó bảng đối soát Seed §15 (18 dòng) chuyển thành assert, cộng các golden nêu ở từng đợt;
   - `scripts/check.mjs` import thêm các domain mới.
2. **`npm run verify:flow`:** tách thành `scripts/flows/0x-*.mjs`, dùng lại helper `ok/section/S/go/act/modalOk`. Mỗi đợt thêm các section luồng thật:
   - Đợt 1: tạo khách → HĐ 8 bước → kích hoạt → phòng Đang thuê.
   - Đợt 2: chỉ số → kỳ → phát hành → thu thiếu → công nợ → phạt → kết thúc → hoàn cọc.
   - Đợt 3: phân công → HS → khóa lương → chi lương.
   - Đợt 4: chi phí → phân bổ → hoa hồng → khấu hao → góp vốn.
   - Đợt 5: khóa kỳ → Report A khớp golden → đối soát; dashboard có việc.

   Luồng nào cũng phải có: phân quyền theo 6 vai trò, không lỗi console, reload giữ dữ liệu.
3. **`npm run verify:screens`:** thêm UI-01, UI-26, UI-27, UI-31 vào danh sách so ảnh verified, gate sidebar ≤ 0,5 %. Các ảnh ImageGen ĐẠT CÓ LƯU Ý chỉ dùng để đối chiếu mắt, không diff.
4. **Điều hướng:** mọi mục sidebar của cụm trong đợt mở được màn thật, không còn `#/soon/` của cụm đó.
5. **Kiểm tay:** `npm run dev` → http://localhost:8765, bật chip Cần xác nhận, đối chiếu từng màn với SRS.
6. **Sổ câu hỏi:** `node scripts/export-questions.mjs` cập nhật file câu hỏi gửi khách.

## Rủi ro

- Khối lượng lớn (~180 màn). Khoanh bằng cách chia hai tầng và dừng review mỗi đợt.
- Seed thiếu dữ liệu cho nhiều tòa ngoài G1. Chỉ G1 và 9 tòa của Huyền có số thật; các tòa khác dùng stub có nhãn "minh họa".
- Tăng SCHEMA làm mất dữ liệu demo đang lưu trên trình duyệt (chấp nhận được; nút Reset đã có).
- `structuredClone` toàn state mỗi transaction: vẫn ổn ở quy mô vài nghìn bản ghi. Nếu chậm thì tách collection lớn ra.
