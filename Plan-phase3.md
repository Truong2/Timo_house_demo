# Plan – Phase 3: Tài sản, bảo dưỡng, kiểm kê, góp vốn, dự kiến LN, hiệu quả vốn (nghiệp vụ ↔ UI khớp nhau)

## Context
Phase 1 và Phase 2 đã xong (commit `fe94bc5`). Phase 3 theo đặc tả gồm:
- 6 màn: UI-33, UI-34, UI-35, UI-36, UI-40, UI-41 (`docs_timonouse/TimoHouse_Dac_ta_man_hinh_web_va_luong_nghiep_vu_v1.md` §7.3, L813-827);
- tab Tài sản ở UI-03;
- vai trò **Cổ đông** (chỉ xem);
- sự kiện Zalo nhắc bảo dưỡng.

Trong code chưa có màn nào của Phase 3. Nhiều chỗ đang khẳng định "chưa có Phase 3":
- `core/milestone.js` DEFERRED;
- `q-report-ops.js:196-197` (`status:'phase3'`);
- `check-rbac.mjs:12-24,56,81-83`;
- 2 test.

**Vấn đề "nghiệp vụ ↔ UI không khớp":**
- Ảnh thiết kế cũ lệch đặc tả:
  - UI-33 trộn lịch góp với chi thực. Số "Được nhận" 66,8tr ≠ M 62.664.969. Không theo kỳ trả chủ nhà, không có dòng CHUNG.
  - UI-34 không có khấu hao/thanh lý. Chủ sở hữu ghi sai "Tòa nhà/Khách thuê". Loại tài sản sai. Mã phòng sai dạng `G1-501`.
  - UI-35 có trạng thái "Đang thực hiện/Sắp đến hạn", trong khi đặc tả cấm quy trình SLA.
  - UI-36 tạo kỳ tay, gộp nhiều tòa, người duyệt tùy ý, trộn "Hỏng" với "Thiếu/Dư".
- UI-40 và UI-41 chưa có ảnh.

**User đã chốt:**
1. **Đặc tả làm chuẩn.** Web làm theo đặc tả. Chỉ giữ bố cục ảnh cũ ở chỗ không mâu thuẫn. Sau đó chụp màn web **thay ảnh trong docs/UI**, thêm ảnh UI-40/41 và E-frame mới, cập nhật Plan_Mockup_UI kèm bảng lệch.
2. **Khấu hao theo số tháng từng tài sản**, mặc định 63 tháng (≈1,6%/tháng, tháng cuối 0,8%). Thanh lý ghi một lần phần còn lại.

**Ràng buộc:**
- NT-0…NT-6 không đổi. Riêng khấu hao T8 phải giữ 566.080.
- smoke 36/36, P0 19/19, sweep 0 lỗi.
- Code theo mẫu sẵn có: `_.need` → `_.needMs('3')` → errs → `fail` → `S.add/update` → `_.audit` → `_.done`; `K.formDrawer`, `K.filters`, `K.pickTab`, `K.xls`.
- File domain phải thuần: không chứa chuỗi `TH.q`, kể cả `TH.qr` / `TH.qo`.
- Mỗi đợt có test `tests/p3-*.test.mjs` và kết thúc bằng NT-0.
- File domain/service mới phải thêm vào `index.html`, `tests/_load.mjs`, `tests/_app.mjs`.

## Quyết định thiết kế
| # | Quyết định |
|---|---|
| D1 | Collection **`assets` thay `equipment`**. Gồm tài sản chủ nhà và tài sản công ty. Khấu hao lấy qua `Q.depItems()`: tài sản công ty có giá trị, chưa hủy. Tăng `SCHEMA` lên 2 (xóa dữ liệu local cũ, như Phase 2). Mã import vẫn là `equipment`. |
| D2 | Mỗi tài sản có `depMonths` (param `depMonthsDefault` = 63), tỷ lệ = `2/(2n−1)`. Với n = 63 ra đúng 0,016, nên 566.080 giữ nguyên. Param `depRate` 1,6% chỉ còn dùng cho chế độ "như Excel" của UI-40 (J3 × 1,6%). |
| D3 | Số dư đầu kỳ (import UI-37, đầu tư ban đầu G1) có `openingPeriod`. Chỉ khấu hao từ kỳ đó, nên T8/T9 không đổi. Tài sản đầu tư ban đầu G1 dùng `openingPeriod` 2026-10. |
| D4 | Thanh lý: tháng thanh lý ghi khấu hao = toàn bộ giá trị còn lại, các tháng sau = 0. Chỉ vào Báo cáo KD dòng 21 (đổi nhãn "Khấu hao + thanh lý thiết bị"). Báo cáo tổng không đổi. Chặn thanh lý ở kỳ đã khóa. |
| D5 | Phiên kiểm kê UI-36 **ảo**: mỗi tòa có tài sản tự có phiên mở từ ngày 1 hằng tháng (CH-33). Chỉ ghi vào store khi nhập kết quả, không ghi khi render. |
| D6 | Lịch góp UI-33 **suy ra** = mỗi kỳ trả chủ nhà UI-05 × tỷ lệ hiệu lực tại hạn (CH-29). Chỉ lưu giao dịch. "Sắp đến hạn" là cờ (≤ 7 ngày), không phải trạng thái. |
| D7 | Chi thực UI-33 chỉ phát sinh nghĩa vụ từ bảng kê UI-32 **đã khóa** (M). M không phải khoản chi. |
| D8 | Mỗi bản dự kiến là một phiên bản bất biến, luôn ra 2 kết quả (dòng tiền và kinh doanh). Có 2 chế độ: `excel` (tái hiện sheet SRC-14) và `web` (khấu hao cộng dồn theo tài sản; dòng tiền trừ đủ J3 + hoàn cọc). |
| D9 | Tài khoản `codong`: `role:'codong'`, `shKey:'CD-01'`, `phase:'3'`. Session có `shareholderId`. `A.buildingScope(d)` = các tòa cổ đông có tỷ lệ > 0 tại ngày d, nên mọi đường `inScope`/`Q.scoped` sẵn có tự lọc. |
| D10 | Cổ đông xem được: Báo cáo tổng/KD của tòa mình (không có đối chiếu Excel, không drill), UI-31 "Cổ phần của tôi", UI-32 và UI-33 tòa mình, UI-41, dashboard riêng. **Không xem UI-40** (mở sau bằng 1 dòng policy). |

**Ghi thành GĐ-P3 để khách xác nhận:**
- O1: cổ đông có được xem UI-40 không.
- O2: cọc chủ nhà G1 – seed đang 96tr, SRC-07 ghi 48tr → sửa seed thành 48tr.
- O3: tài sản đầu tư ban đầu G1 không khấu hao hồi tố.
- O4: tiền thu thanh lý chỉ ghi nhận, chưa vào doanh thu.
- O5: cổ đông thấy các dòng cổ đông khác trên UI-32, nhưng ẩn SĐT/STK.
- O6: UI-40 không drill theo tòa vì SRC-14 không chia theo tòa.
- Số lượng tài sản chủ nhà trong phụ lục bàn giao SRC-10 để trống → giả định [P].

## Các đợt (mỗi đợt 1 commit; chạy `npm run check` + `npm run sweep` sau mỗi đợt)

### P3-0 – Hạ tầng: mốc 3, route, quyền, vai trò Cổ đông
- **`core/milestone.js`:**
  - `ORDER` thêm `'3'`; `INFO['3']`.
  - DEFERRED chỉ còn "Hoàn vốn/ROI cổ đông – ngoài phạm vi (OQ-07)"; chip ở `layout.js` đổi chữ thành "Ngoài phạm vi".
  - Mặc định `'3'` ở `MS.current` và `store.js:13`.
- **`core/routes.js`:** thêm `PHASE3_UI`, các route mới đều `ms:'3'`:

  | Route | Màn | Quyền xem |
  |---|---|---|
  | `/assets` | UI-34 | `assets.view` |
  | `/assets/maintenance` | UI-35 | `maintenance.view` |
  | `/assets/inventory` | UI-36 | `inventory.view` |
  | `/shares/capital` | UI-33 | `capital.view` |
  | `/reports/forecast` | UI-40 | `forecast.view` |
  | `/reports/efficiency` | UI-41 | `efficiency.view` |

  - Menu "Tài sản & bảo trì" đặt sau Sửa chữa, nhóm Vận hành (vị trí như ảnh cũ).
  - Mục `shares` thêm alt `/shares/capital`.
  - Route tĩnh được ưu tiên hơn `/shares/:id` (`router.js:19-26`).
- **`domain/rbac-policy.js`** – quyền mới:

  | Quyền | Vai trò |
  |---|---|
  | `assets.view` | admin, ketoan, vanhanh, leader, truongphong, kythuat |
  | `assets.value` | admin, ketoan, truongphong |
  | `assets.manage`, `assets.dispose` | FIN |
  | `maintenance.view`, `maintenance.done` | admin, ketoan, vanhanh, leader, truongphong, kythuat |
  | `maintenance.plan` | admin, ketoan, leader, truongphong |
  | `inventory.view` | admin, ketoan, truongphong |
  | `inventory.enter` | FIN |
  | `inventory.approve.admin` | admin |
  | `inventory.approve.ketoan` | ketoan |
  | `capital.view` | FIN + codong |
  | `capital.manage` | FIN |
  | `forecast.view` | admin, ketoan, truongphong |
  | `forecast.manage` | FIN |
  | `efficiency.view` | admin, ketoan, truongphong, codong |
  | `reports.drill` (mới) | admin, ketoan, truongphong |

  - Thêm codong vào: `reports.view`, `shares.view`, `dashboard.view`, `documents.download`. Với `documents.download`, `Q.canDownloadDoc` chỉ cho tải chứng từ góp vốn của chính cổ đông đó.
- **`core/auth.js` + `data/catalog.js` + `data/seed.js`:**
  - Thêm user codong (không gắn nhân viên).
  - Login gắn `shareholderId` vào session.
  - Scope `'shareholder'` trong `A.buildingScope`.
  - Form tài khoản ở `pages/settings.js` có ô chọn cổ đông.
- **Bỏ các chỗ đang khẳng định "chưa có Phase 3":**
  - `QO.catalog()`: UI-40/41 có href khi `TH.ms.on('3')`.
  - `scripts/check-rbac.mjs`:
    - `MS_ORDER` thêm '3'; phạm vi màn = P1 + P2 + P3; bỏ dòng cấm UI-33…41.
    - Kỳ vọng sidebar mốc 3 cho từng vai trò, gồm codong = dashboard, shares, reports.
    - Các quyền FIN-only mới.
    - codong có `phase '3'` và chỉ được tập quyền chỉ đọc đã liệt kê.
    - SCOPED tăng 6 → 7: `/shares/:id` phải kiểm `inScope`.
    - Mọi `act-{assets,maintenance,inventory,capital,forecast}.js` phải có `_.needMs('3'`.
  - `tests/p2-reports.test.mjs:96-101` và `tests/p2-fixes-c.test.mjs:96`: gọi `TH.ms.set('2')` trước, thêm cặp kiểm ở mốc 3.
- **Test `tests/p3-rbac-codong.test.mjs`:**
  - codong đăng nhập bị chặn ở mốc 2, được ở mốc 3;
  - scope = {b_G1};
  - bị chặn tenants, buildings, `reports.drill`, `reports.ops`.

### P3-1 – Tài sản & khấu hao (UI-34, tab Tài sản UI-03)
- **`domain/depreciation.js`:**
  - `D.rateOf(it)`; `D.forPeriod` hỗ trợ `openingPeriod` và thanh lý (dòng chi tiết có `kind:'dep'|'disposal'`, giữ nguyên chữ ký hàm);
  - `D.schedule(item, toPeriod)`; `D.nbv(item, p)`.
- **`domain/assets.js` (mới):**
  - `TYPES`: thang máy, máy bơm, máy giặt, máy lọc nước, đồ décor, khác.
  - `OWNERSHIP`: chủ nhà, công ty.
  - `CONDITIONS`; mã `TS-<tòa>-<nnn>`.
- **Collection `assets`:** code, name, type, ownership, buildingId, roomId, position, qty, condition, receivedDate, cost, depStart, depMonths, openingPeriod, warrantyTo, source (`expense|opening|handover|initial|manual`), expenseId, ownerContractId, capitalRef, docIds, disposal{date, period, reason, proceeds, by}, status (`active|disposed|void`), history[].
  - Chỉ có giá trị khi có chứng từ.
  - Tài sản chủ nhà không khấu hao.
- **`services/act-assets.js` (mới):**
  - Truy vấn: `Q.assets(filter)` (theo scope), `Q.depItems()`, `Q.assetNbv(bid, period)`.
  - Action: `X.addAsset`, `X.updateAsset`, `X.moveAsset` (bắt buộc lý do, ghi lịch sử), `X.disposeAsset` (chặn kỳ khóa qua `_.guardPeriod`).
  - `services/q-report.js:55` đổi sang `Q.depItems()`.
- **Sửa luồng cũ:**
  - `act-expenses.js:38-40`: tạo asset (công ty) thay vì equipment.
  - **Sửa bug `X.voidExpense` (`:44-55`)** – trước đây không gỡ thiết bị liên kết:
    - asset đã khấu hao ở kỳ khóa → chặn, báo "dùng Thanh lý";
    - còn lại → asset `status:'void'`.
  - `import-validate.js:16` + `act-import.js:79`: ghi vào assets, thêm cột tùy chọn Loại, Sở hữu, Phòng, SL, Số tháng KH, Kỳ bắt đầu.
  - `pages/expenses.js:31`: ô depRate đổi thành "Số tháng khấu hao (63 ≈ 1,6%/tháng)".
  - Nhãn cầu nối `domain/report.js` và text UI-30 trong `catalog.js`.
- **Seed:**
  - `seed.js:227` → `col('assets', [])`.
  - `seed-1b.js:69` → 17 asset `as_08_*` (`depMonths` 63, có expenseId).
  - `data/seed-phase3.js` (mới, nối qua `seedExtras`):
    - 13 tài sản bàn giao SRC-10 (chủ nhà) cho các tòa demo G1, S43, T17, T2, G15, S4;
    - thang máy cho tòa có `cost_elev`;
    - máy giặt / máy bơm / máy lọc nước mẫu.
- **UI:**
  - `pages/assets.js` (UI-34) + `TH.pages.buildingAssetsTab`.
  - `pages/buildings.js:112` thêm tab `tai-san` (`assets.view`, chỉ hiện ở mốc 3).
- **Test `tests/p3-assets.test.mjs` (NT-11):**
  - 2026-08 = 566.080; tháng 63 = 283.040; tổng cả vòng đời = 35.380.000;
  - thanh lý `as_08_S4` (1.400.000) kỳ 2026-10 → KD S4 = 1.355.200, kỳ 2026-11 = 0, Báo cáo tổng không đổi, kỳ khóa bị chặn;
  - bug voidExpense; import có `openingPeriod`; chuyển vị trí giữ lịch sử; NT-0.

### P3-2 – Bảo dưỡng (UI-35) + nhắc 7 ngày (CH-32, Zalo, UI-38)
- **Domain** `assets.js`: `MT.nextDue(date, cycleMonths)`; `MT.state(task, today, remindDays)` → `{status: planned|done|overdue, soon}`.
- **Collection `maintenanceTasks`:** code `BD-yyyymm-nnnn`, assetId, buildingId, kind, cycleMonths|null, dueDate, leaderId, assigneeId, performerId, vendor, status (`planned|done|cancelled`), doneDate, result, docIds, note, expenseId, repairLogIds, prevId/nextId, remindedAt.
- **`services/act-maintenance.js`:**
  - `X.planMaintenance`.
  - `X.completeMaintenance`: có chu kỳ thì tự tạo lần kế tiếp; tùy chọn "Ghi chi phí" qua `X.addExpense` (dòng 41, `source:'maintenance'`).
  - `X.cancelMaintenance` (bắt buộc lý do).
  - Leader xem theo nhánh (F11).
  - UI-47 thêm trường liên kết `maintenanceTaskId` (L557).
- **Zalo:**
  - `zalo-rules.js`: thêm sự kiện `maintenance_due`; `recheck` chỉ gửi khi việc còn `planned`, chưa đổi hạn, còn trong cửa sổ nhắc.
  - `act-zalo.js`: người nhận là nhân viên.
  - Catalog thêm `zt_maint`, `zr_maint` (`phase:'3'`).
- **UI-38 params (nhóm "Tài sản"):** `maintRemindDays` 7, `shareRemindDays` 7, `depMonthsDefault` 63, `forecastDraftDay` 22.
- **Dashboard UI-01:** thẻ "Bảo dưỡng: quá hạn n · 7 ngày tới m".
- **Seed:**
  - lịch cho 4 loại SRC-02: thang máy hằng tháng, bơm 6 tháng, máy giặt 3 tháng, lọc nước 3 tháng;
  - đã làm T8/T9; 2 việc quá hạn; 3 việc đến hạn 01–05/10;
  - **không seed chi phí** (giữ số T9).
- **Test:** tạo lần kế tiếp; cờ quá hạn; cửa sổ 7 ngày; Zalo recheck; kythuat được đánh dấu xong nhưng không được lập lịch; NT-0.

### P3-3 – Kiểm kê (UI-36, CH-33)
- **Collection `inventorySessions`** `ivs_<period>_<bid>`:
  - status `open|entered|approved`;
  - lines[{assetId, bookQty, actualQty, condition, note, docIds, checkedBy}];
  - proposals[{kind `qty|condition|location|add|remove`, from, to, reason}];
  - approvals{admin, ketoan}.
  - Chênh lệch số lượng tách riêng khỏi tình trạng.
- **`services/act-inventory.js`:**
  - `Q.inventorySession(period, bid)` (phiên ảo).
  - `X.enterInventory`.
  - `X.proposeAssetChange` (bắt buộc lý do).
  - `X.approveInventory(id, role)`: hai người khác nhau duyệt; đủ 2 duyệt mới áp đề xuất vào assets (có lịch sử).
  - **Không bao giờ tạo chi phí.**
  - Xuất chênh lệch bằng `K.xls`.
- **Seed:**
  - G1 T8: đã duyệt.
  - G1 T9: đã nhập, 1 thiếu + 1 hỏng, chờ 2 duyệt.
  - Các tòa demo khác: phiên ảo T9.
- **Dashboard (FIN):** "Kiểm kê T9: x/y tòa chưa xong".
- **Test:** phiên tồn tại mà không ghi store; số lượng và tình trạng độc lập; một người không duyệt 2 lần; chỉ áp đề xuất sau đủ 2 duyệt; không sinh chi phí; NT-0.

### P3-4 – UI-33 góp vốn / chi thực / tài sản-cọc / đầu tư ban đầu + extractor
- **`scripts/seed/extract_seed_p3.py`** (`npm run seed:p3`, dùng lại helper của `extract_seed.py`) → `data/seed-p3.js` (`TH.data.p3`) + fixtures:
  - **G1 `THU CHI BAN ĐẦU`:**
    - dòng chi E4–E56 có phân loại; thu F; tỷ lệ L3:T3; "Đã đóng" K5.
    - `ĐẦU TƯ BAN ĐẦU` D4–D11 kèm `dupOf` (trùng THU CHI E39…E53).
  - **SRC-14:**
    - sheet 2026-03…2026-09 (dạng KD) + `Tháng 1.2026`, `Tháng 8 .` (dạng dòng tiền);
    - map dòng **theo nhãn**, không theo số dòng, vì vị trí dòng đổi giữa các sheet;
    - hằng số gõ trong công thức (E3 `+30000000`, J4 T3) → dòng điều chỉnh;
    - giữ từng phần của E4; `scopeNote` "Tính đến Gx";
    - `excelCheck` = các ô kết quả của sheet.
- **`domain/capital.js`:**
  - `CAP.schedule(ownerPayments, ratiosAt, holders)` → dòng phải góp = tiền kỳ × tỷ lệ, hạn = hạn trả chủ nhà.
  - `CAP.lineState`.
  - `CAP.initial(rec)` → chi / thu / chênh / từng cổ đông (phần lỗ, đã đóng, thực nhận), loại trùng.
- **Collections:**
  - `shareTxns`: kind `contribute|withdraw|payout`, ref `ownerPayment|shareRun|initial`, docId, status/voidReason.
  - `capitalInitial` `ci_G1`. 8 khoản đầu tư → asset công ty `source:'initial'`, `openingPeriod` 2026-10.
- **`services/act-capital.js`:**
  - Truy vấn: `Q.capitalSchedule`, `Q.capitalPayouts` (M của run đã khóa − đã trả).
  - Action: `X.recordContribution`, `X.recordWithdrawal`, `X.recordPayout` (chặn khi run chưa khóa hoặc vượt số còn lại), `X.voidShareTxn`.
- **Seed:**
  - góp T2–T8 đủ;
  - T9: CD-03 góp thiếu, CD-07 chưa góp (quá hạn);
  - T10 (hạn 05/10) gắn cờ sắp đến hạn;
  - T1 do vốn ban đầu chi trả;
  - `oc_G1.deposit` = 48.000.000 (O2).
- **UI:**
  - `pages/capital.js` (UI-33).
  - `pages/shares.js`: `/shares/:id` kiểm `inScope`; UI-31 bản cho cổ đông; thanh điều hướng con UI-31 | UI-32 | UI-33.
- **Test `tests/p3-capital.test.mjs`:** NT-9; dòng CHUNG = 4.800.000/tháng; chặn chi thực khi run chưa khóa; chi ≤ M; codong chỉ thấy dòng của mình; NT-2 không đổi; NT-0.

### P3-5 – UI-40 Dự kiến lợi nhuận
- **`domain/forecast.js`:**
  - `FC.LINES`: 24 dòng map sang mã báo cáo (TPVH1+TPVH2 → `sal_head`; mkt = E4/2; dep = J3 × rate → `cost_equip`). Nhãn cũ của từng tháng đều map về đây.
  - `FC.compute(fc, {mode, depRate, depWeb})`:
    - **KD:** DT = J4+J5+J6+J7−E4+Σđc; GV = thuê nhà + 6 dịch vụ + khấu hao.
    - **Dòng tiền:** DT gồm cọc mới; trừ đủ J3 + G4. Chế độ excel với sheet dạng dòng tiền thì tái hiện đúng cách Excel tính.
    - Tỷ lệ phụ theo sheet 8/2025; tỷ lệ nào chưa có định nghĩa thì hiện "chờ định nghĩa".
  - `FC.suggest`; `FC.compare`.
- **Collection `forecasts`** `fc_<period>_v<n>`: draftDate, scopeNote, excludedBuildings, source (`excel_src14|web`), form, inputs{J3..J7, E4, E4parts, G4}, inputMeta{auto, suggested, reason}, lines[{key, value, suggested, formula, reason}], adjustments[{amount, reason}], excelCheck.
- **`services/q-forecast.js`:**
  - `Q.forecastAuto(period, draftDate)`:
    - J4/J5 = thu đến ngày lập (hóa đơn lượt mới → J5);
    - E4 = cọc; G4 = hoàn cọc; J3 = mua thiết bị;
    - gợi ý J6 = nợ hiện tại × tỷ lệ thu sau ngày lập của kỳ trước;
    - gợi ý chi phí = UI-29 kỳ trước + tiền thuê các tòa mới.
  - `X.createForecast`: khác gợi ý hoặc có điều chỉnh thì bắt buộc lý do; tạo phiên bản mới.
  - `Q.forecastVsActual`: chỉ khi kỳ đã chốt hoặc kỳ song song; dòng tiền so UI-29, KD so UI-30.
- **Seed:** các bản Excel 2026-03…09 từ `TH.data.p3`.
- **Test `tests/p3-forecast.test.mjs`:** NT-7, NT-8; phiên bản bất biến; sửa không lý do bị chặn; so sánh T8 có dòng; NT-0.

### P3-6 – UI-41 Hiệu quả
- **`domain/efficiency.js`:** `EF.row(v, nbv)`:
  - LN/vốn = `r_lnr_gv` (dòng 51 sheet tòa);
  - Biên tiền nhà = `r_nha_thue` (dòng 59);
  - LN/tài sản = LNR / NBV, hoặc `null` → "chờ dữ liệu".
- **`services/q-efficiency.js`:**
  - `QE.build(period, {basis: business mặc định|total, source: web|excel, group, area, manager})` trên `TH.qr.build`, lọc theo scope.
  - Mẫu số tài sản = `Q.assetNbv`, chỉ tài sản công ty. Mỗi khoản mua UI-15 hoặc khoản đầu tư ban đầu UI-33 ứng với đúng 1 asset → không đếm trùng.
- **Test `tests/p3-efficiency.test.mjs`:** NT-10; G1 T8 LN/tài sản "chờ dữ liệu"; 17 tòa có thiết bị T8 thì có giá trị; NT-0.

### P3-7 – Cổ đông xuyên suốt
- `pages/dashboard.js`: nhánh codong "Tổng quan cổ đông" gồm tòa góp, phải góp kỳ tới, M của run khóa gần nhất, LNR KD của các tòa mình. Không có phòng trống / khách / công nợ.
- `pages/reports.js`:
  - khi có scope: ẩn đối chiếu Excel và cầu nối số Excel;
  - codong ẩn lọc quản lý;
  - `reportCellDrawer` cần quyền `reports.drill`.
- `ui/layout.js`: ẩn tìm nhanh / thông báo với codong.
- `scripts/sweep.mjs`: thêm tài khoản thứ 9 (codong) và mọi route/tab mới.
- `TH.pages.acceptance3` (Cài đặt → Đối chiếu): NT-7…NT-11.

### P3-8 – Minh chứng, ảnh docs/UI, tài liệu
- **`scripts/verify-p3.mjs`** (`npm run verify:p3`, theo mẫu group của verify-p2) → `output/verify-p3/shots/`.
  - Setup: khóa run G1 T8, ghi 2 lần chi, thanh lý 1 tài sản ở kỳ 10, tạo bản dự kiến v2 kỳ 9, đợt Zalo nhắc bảo dưỡng.
  - `--publish`: copy ảnh sang docs/UI.
- **Thay ảnh** (giữ tên file): `docs/UI/B07/UI-33_actual-contribution-payment.png`, `docs/UI/B08/UI-34_assets.png`, `UI-35_maintenance.png`, `UI-36_inventory.png`.
- **Ảnh mới** trong `docs/UI/B09/`:
  - `UI-40_profit-forecast.png`, `UI-41_capital-efficiency.png`, `UI-03A_building-assets-tab.png`;
  - E30–E43:
    - E30 thêm tài sản công ty
    - E31 thanh lý
    - E32 chuyển vị trí
    - E33 hoàn thành bảo dưỡng → lần kế tiếp
    - E34 đề xuất chênh kiểm kê
    - E35 duyệt kép kiểm kê
    - E36 chi thực theo M
    - E37 đầu tư ban đầu G1
    - E38 tab tài sản/cọc
    - E39 phiên bản dự kiến
    - E40 so thực tế
    - E41 chờ dữ liệu tài sản
    - E42 cổ đông bị giới hạn phạm vi
    - E43 Zalo nhắc bảo dưỡng
- **Tài liệu:**
  - **`docs/UI/Phase3_Doi_chieu_dac_ta_vs_anh_cu.md`:** cột Màn | Ảnh cũ | Đặc tả (dòng) | Web làm | Ghi chú – gồm mọi điểm "sửa so với ảnh cũ" ở mục dưới, cộng O6.
  - **`TimoHouse_Plan_Mockup_UI_v1.md`** (cả bản docs_timonouse và docs/UI):
    - sửa dòng UI-33…36 theo đặc tả, thêm UI-40/41 và lô B09;
    - khung E lên 43;
    - cập nhật luồng L07/L08;
    - link bảng lệch.
  - `docs/UI/README.md`: cập nhật số lượng, thêm B09.
  - **`docs/uat/Phase3_Kich_ban_kiem_thu.md`** (định dạng như Phase 2):
    - 9 tài khoản;
    - NT-7…NT-11 + NT-0…NT-6;
    - kịch bản F31–F37 kèm tên ảnh;
    - GĐ-P3-01…11; O1–O6.
  - **Đặc tả §7.3:** chỉ thêm dòng trạng thái, không đổi quy tắc.

## UI từng màn – đúng đặc tả, ghi rõ chỗ sửa so với ảnh cũ

**UI-34 `/assets`** – giữ bố cục KPI + lọc + bảng + drawer phải.
- **KPI:** số dòng / Σ SL; nguyên giá và còn lại của tài sản công ty (`assets.value`); khấu hao kỳ (link UI-30); bảo dưỡng quá hạn / sắp đến; kiểm kê chưa xong. *Sửa:* bỏ số cứng 532 và % tăng giảm.
- **Lọc:** loại (6 loại theo đặc tả); sở hữu Chủ nhà / Công ty (*sửa* "Tòa nhà / Khách thuê"); tòa; phòng; tình trạng; ngày nhận.
- **Cột:**
  - Mã; tên; loại; sở hữu; tòa / phòng / vị trí (`501S43`, *sửa* `G1-501`); SL; tình trạng; ngày nhận/bàn giao;
  - nguyên giá / còn lại;
  - số tháng KH / đã KH;
  - chứng từ: link UI-15 `CP-…` / phụ lục UI-04 / UI-37 (*sửa* `HD-xxxx`);
  - bảo hành; bảo dưỡng tiếp theo.
- **Drawer:** Thông tin | Khấu hao (lịch, dòng thanh lý) | Lịch sử vị trí | Bảo dưỡng | Kiểm kê | Tệp.
- **Nút:** Sửa, Chuyển vị trí, Thanh lý, Mở lịch BD, Mở kiểm kê. Nút "Nhập từ file" dẫn sang UI-37.

**UI-03 tab Tài sản:** tài sản công ty (số lượng, giá trị còn lại); 13 món bàn giao của chủ nhà; cọc chủ nhà (UI-04); bảo dưỡng kế tiếp; phiên kiểm kê gần nhất; link UI-34/35/36 đã lọc sẵn tòa.

**UI-35 `/assets/maintenance`:**
- **Lọc:** tòa; loại thiết bị (4 loại SRC-02 + khác); trạng thái Dự kiến / Đã thực hiện / Quá hạn; công tắc "Sắp đến hạn"; leader / team; người được giao; người thực hiện; khoảng ngày.
- **Cột:** tài sản; loại BD; chu kỳ hoặc "nhập tay"; ngày dự kiến; leader; người giao; người làm / đơn vị; trạng thái + chip "sắp đến hạn"; ngày làm; kết quả; chi phí UI-15; ảnh; UI-47.
- *Sửa:* bỏ trạng thái "Đang thực hiện" (đặc tả không có SLA); "Sắp đến hạn" chuyển thành cờ.

**UI-36 `/assets/inventory`:**
- **Bố cục:** trái là danh sách phiên tháng theo từng tòa ("Tự mở 01/mm"); phải là dòng kiểm.
- **Cột:** mã; tên; phòng / vị trí; số sổ; số thực; chênh (Thiếu / Dư); **tình trạng cột riêng**; người kiểm; ảnh.
- **Nút:** Nhập kết quả, Xuất chênh, Đề xuất sửa danh mục (bắt buộc lý do), Duyệt (admin) + Duyệt (kế toán).
- *Sửa:* bỏ "Tạo kỳ" tay; mỗi tòa một phiên; chỉ admin + kế toán duyệt; tách "Hỏng"; đề xuất là sửa danh mục, không phải "Bổ sung / Sửa chữa".

**UI-33 `/shares/capital`** – giữ breadcrumb và kiểu thẻ KPI.
- **Lọc:** tòa; cổ đông; khoảng ngày (*sửa* lọc theo tháng). Cổ đông bị khóa sẵn bộ lọc.
- **KPI:** Phải góp đến nay | Đã góp | Còn phải góp (quá hạn / 7 ngày) | Nghĩa vụ chi theo bảng kê đã khóa ΣM | Đã trả | Còn phải trả. *Sửa:* nhãn mâu thuẫn ở ảnh cũ.
- **Tab `lich-dong`:**
  - nhóm theo kỳ trả chủ nhà (link UI-05);
  - cột hạn; cổ đông **gồm CHUNG**; tỷ lệ; tiền kỳ; phải góp = tiền kỳ × tỷ lệ; đã góp; còn lại; chứng từ; trạng thái.
- **Tab `chi-thuc`:**
  - M của run UI-32 đã khóa (62.664.969, *sửa* 66,8tr); đã trả; ngày / phương thức / chứng từ; còn phải trả;
  - ghi chú "M không phải giao dịch chi".
- **Tab `tai-san-coc`:** cọc chủ nhà "phải thu hồi khi kết thúc HĐ" + tài sản UI-34. Chỉ đọc, không vào doanh thu.
- **Tab `dau-tu-ban-dau`:** bảng THU CHI G1 như Excel; bảng theo cổ đông; 8 khoản đầu tư ghi "trùng E39–E53 – tính 1 lần".
- **Tab `lich-su`.**

**UI-40 `/reports/forecast`:**
- **Đầu trang:**
  - kỳ, phiên bản ("v1 · SRC-14 · 22/09/2026 · Tính đến G15");
  - nút Tạo phiên bản / Xuất theo bố cục SRC-14 / So sánh thực tế;
  - banner "1 bộ đầu vào → 2 kết quả, không công bố là số chuẩn" (L57) và "không drill theo tòa" (O6).
- **2 panel kết quả:** Dòng tiền | Kinh doanh, mỗi panel có DT, TCP, LN, LNR/DT, LNR/GV. Chip "khớp Excel" / "không có benchmark Excel".
- **Tab:**
  - `dau-vao`: ô, giá trị, nguồn, gợi ý web, lý do; các phần của E4; điều chỉnh.
  - `chi-phi`: 24 dòng, mã báo cáo, gợi ý, chênh, lý do.
  - `ket-qua`: kèm tỷ lệ phụ.
  - `so-sanh`: dự kiến vs UI-29 / UI-30.
  - `phien-ban`.

**UI-41 `/reports/efficiency`:**
- **Lọc:** kỳ; báo cáo cơ sở (KD mặc định / Tổng); nguồn (web / như Excel); T/S/G; khu vực; trưởng phòng.
- **KPI:** LN/vốn, LN/tài sản ("n/N tòa có dữ liệu"), biên tiền nhà.
- **Cột:** tòa; nhóm; khu vực; TP; DT tiền phòng; tiền thuê 1 tháng; biên (dòng 59); LNR; GV; LN/vốn (dòng 51); giá trị TS còn lại; LN/tài sản hoặc "chờ dữ liệu".
- Tổng T/S/G/TỔNG; drill sang UI-28 / UI-34.

## Nghiệm thu mới (NT-7…NT-11)

**NT-7** – dự kiến 9/2026, chế độ như Excel, dạng KD:

| Chỉ tiêu | Kỳ vọng |
|---|---|
| J5 | 126.912.000 |
| E4 | 722.700.000 |
| Marketing (E4/2) | 361.350.000 |
| Khấu hao | 0 (J3 trống) |
| Điều chỉnh | +30.000.000, có lý do |
| DT | 7.106.329.529 |
| TCP | 6.468.533.333 |
| LN | 637.796.196 |
| LNR/DT | 8,98% |
| LNR/GV | 11,40% (GV 5.595.883.333) |

**NT-8:**
- `Tháng 1.2026`: J3 40.000.000 → khấu hao 640.000; TCP 4.827.748.333; LN 705.406.244.
- 8/2026: DT 6.757.607.525; TCP 6.034.275.000; LN 723.332.525.

**NT-9** – đầu tư ban đầu G1:
- chi 269.906.348; thu 104.919.000; chênh −164.987.348;
- đã đóng 230.400.000 (từng cổ đông 23.040.000 / 46.080.000 / …); thực nhận 65.412.652;
- 8 khoản 38.862.000 chỉ tính 1 lần.

**NT-10** – UI-41, T8 như Excel:

| Chỉ tiêu | Kỳ vọng |
|---|---|
| LNR/GV Báo cáo tổng | 0,19229 |
| LNR/GV Báo cáo KD | 0,12987 |
| Biên tiền nhà | 1,22881 |
| G1 LNR/GV | 0,23977 vs SRC-07 0,23964 – lệch đã giải thích (OQ-04, 7.879đ) |

**NT-11** – khấu hao:
- 566.080 cho T8;
- tháng 63 = 283.040;
- thanh lý S4 kỳ 10 = 1.355.200.

**NT-0…NT-6** giữ nguyên.

## Kiểm tra (sau mỗi đợt; đủ bộ ở P3-8)
1. `npm run check`: toàn bộ test (cũ + p3-*) đạt; RBAC đạt với kỳ vọng mốc 3 và codong.
2. `npm run smoke` 36/36; `npm run verify:p0` 19/19; `npm run verify:p2` không lỗi trang. Ảnh output bị ghi đè → `git checkout` nếu không đổi.
3. `npm run sweep`: mọi route × 9 tài khoản, 0 lỗi.
4. `npm run verify:p3`: không lỗi trang. Xem lại từng ảnh trước khi `--publish` sang docs/UI.
5. Chạy tay `npm run dev`:
   - mốc 2 không thấy menu Tài sản; mốc 3 thấy;
   - codong chỉ thấy G1, không mở được `/tenants`, `/reports/forecast`;
   - thanh lý ở kỳ khóa bị chặn;
   - tạo bản dự kiến v2 mà không ghi lý do bị chặn.
6. Đối chiếu bảng lệch `Phase3_Doi_chieu_dac_ta_vs_anh_cu.md`: mọi dòng có ảnh mới tương ứng.
