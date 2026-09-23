# Cập nhật UI mockup theo Spec v1.6 + Seed Data v1.0

## Context

Mockup TimoHouse (`mockup/`, static SPA vanilla JS, v3.0.0) được dựng qua 5 đợt w1–w5 bám theo **đặc tả chức năng v1.8**. Trong khi đó hai tài liệu mới đã hoàn tất và trở thành nguồn chuẩn cho tầng giao diện:

- `outputs/TimoHouse_UI_Mockup_Spec_v1.0.md` (nội dung v1.6, 3.481 dòng) — 34 màn UI-00…UI-33, mỗi màn có wireframe + bảng chú giải vùng + bảng truy vết `BR/D/R`, 8 luồng liên màn F-01…F-08, ma trận trạng thái, tiêu chí nghiệm thu, sổ 36 tham số `P-01…P-36`.
- `outputs/TimoHouse_Mockup_Seed_Data_v1.0.md` (547 dòng) — dữ liệu **trích nguyên từ 6 file Excel thật** của công ty, trục chính là tòa **G1 kỳ 09/2026** và kỳ đối soát **08/2026**.

Vấn đề cốt lõi: **dữ liệu mẫu của mockup là bịa hoàn toàn**. `seed.js` sinh chủ nhà "Trần Văn Hải", tòa "Sunrise/Moonlight" ở TP.HCM, mã phòng ngẫu nhiên `A.12.03`, giá thuê random. Ngay cả tòa G1 đang có trong `seed-w5.js` cũng là G1 giả: 12 phòng mã `G1.01.01`, giá đồng loạt 3.980.000, điện 3.500đ/kWh, nước 14.000đ/m³, cọc 96 triệu, golden kỳ 06/2026 — trong khi số thật là 15 phòng mã `201G1`, giá 3,0–4,4 triệu, điện 4.000đ/kWh, nước 120.000đ/người, cọc 48 triệu, golden kỳ 08/2026.

Hệ quả: người review nghiệp vụ mở mockup ra không đối chiếu được với sổ Excel, nên không xác nhận được công thức nào đúng. Mục tiêu của đợt này là **mọi con số trên màn hình đều tra ngược được về một ô Excel cụ thể**, và mọi chỗ công thức chưa chốt đều mang nhãn `P-xx` thay vì im lặng lấy giá trị giả định.

### Bốn quyết định đã chốt

| Quyết định | Lựa chọn |
|---|---|
| Phạm vi dữ liệu | **Thay toàn bộ** — chỉ giữ những gì có trong Excel |
| Trình tự | **Nền tảng → dữ liệu → màn hình** |
| UI-26 Hoa hồng, UI-28 Tiền thuê nhà & trả trước | **Dựng đầy đủ**, không để placeholder |
| Ngày hệ thống demo | **23/09/2026**, kỳ mặc định `2026-09` |

### Điều "thay toàn bộ" thực sự có nghĩa là gì

Excel không có dữ liệu cho: lead/CRM, lịch xem phòng, giữ chỗ, sự cố & bảo trì, chấm công, sao kê ngân hàng, dự án & ROI. Các màn đó sẽ trống.

Đây **không phải mất mát**: danh sách trên trùng khớp với `X-01…X-08` mà spec §18 dòng 3458 đã tuyên ngoài phạm vi Phase 1. Việc để chúng trống với empty-state trung thực làm mockup phản ánh đúng phạm vi, thay vì che bằng số liệu bịa. Ngược lại, vài thứ tưởng là Phase 2/3 lại **có** nguồn thật và sẽ được seed: **tài sản** (8 hạng mục đầu tư ban đầu G1 = 38.862.000đ), **hoa hồng** (13 dòng kỳ 09/2026), **hoàn cọc**, **phá hợp đồng**.

---

## Kiến trúc hiện có — những gì phải tôn trọng

Bộ khung đã tốt và **không cần dựng lại**; việc còn lại là thay dữ liệu và bổ sung chiều sâu.

- Một global `window.TH`. Không bundler — **thứ tự thẻ `<script>` trong [index.html](mockup/index.html) chính là đồ thị phụ thuộc** (97 thẻ).
- Router hash tự đăng ký: mỗi page module gọi `TH.router.register(pattern, handler, meta)` ở cuối file. **83 route đã có; 32/34 màn spec đã có route.**
- Bộ toolkit dùng chung đầy đủ, phải tái sử dụng chứ không viết mới:
  - [components.js](mockup/js/ui/components.js) → `U.pageHead/card/kpi/chip/note/empty/filterbar/statusTabs/tabs/wizard/field/input/money/select/drawer/modal/confirm/menu/toast/bind/onChange/formData`
  - [table.js](mockup/js/ui/table.js) → `U.table(container, {cols, rows, selectable, colPrefsKey, presets, density…})`
  - [forms.js](mockup/js/ui/forms.js) + [forms-w4.js](mockup/js/ui/forms-w4.js) → 45 form dựng sẵn (`Fm.*`)
  - [format.js](mockup/js/core/format.js) → `F.vnd/short/words/date/period/periodLabel/norm/roomRef/csv`
  - [selectors.js](mockup/js/core/selectors.js) và 8 file `selectors-*.js` → `Q.*` (read-model; page **không bao giờ** lọc collection thô)
  - [chart.js](mockup/js/ui/chart.js) → `C.stackedBar/barLine/donut/spark`
- Store: ~95 collection trong [store.js](mockup/js/core/store.js), một blob localStorage, chuỗi migrate cộng dồn idempotent gác bằng cờ `meta.*Seeded`.

### Năm cái bẫy đã xác định

1. `#content` **bị clone-và-thay mỗi lần render** ([router.js:27-30](mockup/js/core/router.js#L27-L30)) — cố ý, để listener delegate của render cũ chết. Không "tối ưu" chỗ này.
2. [check-rbac.mjs](scripts/check-rbac.mjs) hardcode `expectedTopLevel` (admin 9, qltong 6, tpvh 5, ops 7, accountant 7, sale 4, kythuat 3, hr 3, codong 2) và **parse `router.register(...)` bằng regex**. Thêm route mới phải kèm permission có thật trong `auth.js`, nếu không `npm run check` đỏ. *(Thêm item vào trong một section thì không đổi số top-level — an toàn.)*
3. **Không bump `SCHEMA`** trong store.js (`MIN_SCHEMA = 4`); ra ngoài dải sẽ ném `'Schema không khớp'` và reset im lặng dữ liệu của mọi người đang test. Cách đúng: đổi hằng `KEY`.
4. `window.__timehouseDemo` là hợp đồng với cả 3 script Playwright và trình sinh PDF — giữ nguyên.
5. Guide engine ([guide.js](mockup/js/core/guide.js), 16 mốc go-live) **tự tiến theo sự kiện `store.emit`**. Đổi dữ liệu nền làm kịch bản đứng im **mà không báo lỗi** — phải test lại bằng tay.

---

## Phase 0 — Nền tảng

Ba việc phải xong trước khi chạm dữ liệu, vì mọi màn sau đều dựa vào.

### 0.1 Sổ tham số P-xx — bắt buộc theo spec §18 dòng 3410

> *"mọi số liệu phụ thuộc một `P-xx` chưa chốt phải mang chip `Cần xác nhận nghiệp vụ` kèm mã tham số, và phải đọc từ trang cấu hình chứ không hard-code trong component."*

Tạo `mockup/js/core/params.js` → `TH.params`, nạp **sau** `store.js` và **trước** mọi `selectors-*`:

```
TH.params.get('P-03')        → { code, label, value, unit, status, screens[], source }
TH.params.value('P-03')      → giá trị đang dùng (30)
TH.params.chip('P-03')       → '<span class="chip amber">Cần xác nhận nghiệp vụ · P-03</span>'
```

Nạp đủ 36 mã từ spec §18 (bảng dòng 3412–3442 cho P-01…P-29, bảng dòng 3448–3456 cho P-30…P-36) kèm cột `screens[]` để tra ngược. Tái dùng pattern chip sẵn có: `status:'assumed'` → `chip amber` trong [metrics.js:31](mockup/js/core/metrics.js#L31), và helper `U.assume()` trong [components-wb.js](mockup/js/ui/components-wb.js).

Thêm tab `#/settings/catalog?tab=params` vào [settings.js](mockup/js/pages/settings.js) — bảng 36 dòng, sửa được giá trị, mỗi dòng link tới các màn bị ảnh hưởng. Đây là "trang cấu hình" spec yêu cầu.

**Lưu ý thay đổi ngược:** P-03 prorate — spec §17.3 chốt hệ thống chia **30**, nhưng sổ hoàn cọc thật chia **31** (`301T41` tiền phòng 1.103.225,806 = 3.800.000 ÷ 31 × 9). Màn phải hiện **cả hai số** để khách chốt, không tự chọn.

### 0.2 Đồng bộ design token theo spec §5.2

Sửa [tokens.css](mockup/css/tokens.css). Khác biệt hiện tại:

| Token | Đang là | Spec §5.2 |
|---|---|---|
| `--primary` | `#2563EB` | `#1E40AF` |
| `--bg` | `#F6F8FC` | `#F8FAFC` |
| `--text` | `#172033` | `#0F172A` |
| `--text-2` | `#344054` | `#475569` |
| `--accent` | *(chưa có)* | `#D97706` — dùng cho cảnh báo nghiệp vụ / ASSUMED |

`--primary` đang kiêm luôn `--sidebar-active`; tách ra trước khi đổi để sidebar không bị tối đi. Các màu trạng thái (`--green #15803D`, `--amber #B45309`, `--red-500 #DC2626`) đã khớp spec — giữ nguyên.

### 0.3 Vá khoảng trống nghiệm thu §17.2

- **`aria-sort` chưa có** trong [table.js](mockup/js/ui/table.js) — thêm vào `<th>` sortable (`ascending`/`descending`/`none`).
- Rà 4 breakpoint 375 / 768 / 1024 / 1440, không được có horizontal scroll cấp trang.
- `font-variant-numeric: tabular-nums` và `prefers-reduced-motion` **đã có sẵn** — chỉ cần kiểm lại độ phủ.

### 0.4 Chuyển đồng hồ demo

- [format.js:5](mockup/js/core/format.js#L5): `F.DEMO_TODAY = '2026-10-28'` → `'2026-09-23'`.
- [store.js:21](mockup/js/core/store.js#L21): `meta.period` `'2026-10'` → `'2026-09'`.
- [store.js:3](mockup/js/core/store.js#L3): đổi `KEY` → `'timohouse-demo-real-v1'` để mọi người test được nạp lại sạch. **Không đụng `SCHEMA`.**
- Rà các mốc quá hạn / sắp hết hạn đang canh theo 28/10 (`Q.todo()`, `Q.invOverdue`, `expiring.js`).

---

## Phase 1 — Thay toàn bộ dữ liệu bằng số thật

Khối việc lớn nhất. Viết mới `mockup/js/core/seed-real.js` thay cho phần sinh dữ liệu bịa trong [seed.js](mockup/js/core/seed.js), giữ nguyên `seed.catalogOnly` và các helper.

### 1.1 Nền tổ chức

| Nội dung | Nguồn |
|---|---|
| Công ty HT CCMN TIMEHOUSE, TK nhận `2120368058 – NGUYEN THI HANG – BIDV` | Seed §3 |
| 14 nhân sự thật: TPVH Đặng Đình Mạnh, TNVH Trần Quang Huy, 12 NVVH | Seed §9.1–9.2 |
| Cơ cấu tổ chức + chức danh, ánh xạ sang 9 role sẵn có trong [auth.js](mockup/js/core/auth.js) | Seed §9 |

### 1.2 Danh mục tòa

~30 tòa có mã thật trong Seed §9.3/§10.2/§12 (`T2 T3 T5 T7 T8 T10 T11 T17 T20 T21 T22 T24 T41 S3 S6 S7 S8 S9 S9B S10 S26 S34 S37 G1 G3 G4 G6 …`), mỗi tòa có số phòng thật, nhóm T/S/G, quản lý phụ trách thật. Chỉ **G1 có chi tiết tới từng phòng**; các tòa khác ở mức tổng hợp — đủ để Report B và bảng hiệu suất đúng số.

### 1.3 Tòa G1 — chi tiết đầy đủ (trục của toàn bộ mockup)

- Hồ sơ tòa: thuê 48.000.000/tháng, cọc chủ nhà 48.000.000, phí môi giới 14.400.000, mạng trả trước 3.000.000/6 tháng, quản lý **Đỗ Thuỳ Linh**.
- Công tơ: `MAIN` mã `000G1` @3.500 (**chỉ đối chiếu, không lên hóa đơn khách**), `COMMON` @3.800.
- Bảng giá: điện 4.000/kWh · nước 120.000/người · mạng 100.000/phòng · thang máy 60.000/người · xe điện 150.000/xe · combo 120.000/người.
- **15 phòng** mã thật `101G1 … 604G1` với giá niêm yết / giá QL / số người / cọc đúng Seed §6.1.
- **15 hóa đơn kỳ 09/2026** đủ dòng theo Seed §6.2.
- Tài sản: 8 hạng mục đầu tư ban đầu = 38.862.000 (Seed §4.1).
- Cổ đông: 9 người Σ = 100%, đã góp 230.400.000.

**Năm ca kiểm thử phải giữ nguyên, không được "làm đẹp":**

| Ca | Chi tiết | Màn kiểm |
|---|---|---|
| Sản lượng 0 kWh | 4 phòng khách mới vào 01/9 → dòng điện = 0, **không ẩn dòng** | UI-10, UI-12 |
| Sản lượng 3 kWh | `301G1` bất thường → cảnh báo lệch trung bình 3 kỳ | UI-10 |
| Thu thiếu | `304G1` −60.000, `604G1` −6.000 → trạng thái `Thiếu`, chuyển công nợ | UI-12, UI-14 |
| Giá QL > niêm yết | `303G1` QL 4.400.000 > niêm yết 4.300.000 | UI-05 |
| Chênh vốn góp | Đã góp 230.400.000 vs Σ liệt kê 232.262.000 → dòng `Chênh lệch mở sổ chờ đối soát` **1.862.000**, không tự phân bổ (spec §17.3 dòng 3401) | UI-29 |

**Khuyết tật có thật phải phơi ra, không được tự vá:** điện chung tầng 2 G1 = 32 kWh × 3.800 ÷ 3 người = **40.533,33 đ/người**, sổ tháng 9 tính ra số này nhưng **không cộng vào Tổng dịch vụ** của `201G1`. Dựng thành khối cảnh báo `✕` trên UI-12 gắn `P-13`/`P-30`, tuyệt đối không tự cộng vào.

### 1.4 Các sổ vận hành khác

Hoàn cọc 8 dòng (gồm ca prorate `301T41` ÷31) · phá hợp đồng 20 dòng **đã lược số điện thoại**, gồm 2 ca thu vượt `101T21` và `301T7` · hoa hồng 13 dòng hai mức 35%/50% · NCC điện nước 6 tòa gồm T2 có **hai mã điện** và mã viết hoa/thường không đồng nhất.

### 1.5 Lương và hiệu suất kỳ 08/2026

- `payrollRuleVersions`: 4 bậc **suy ngược được từ 9 tòa thật** (≥98 → 130.000/100 · 95–98 → 120.000/95 · 93–95 → 119.000/95 · 90–93 → 110.000/90). Các dải dưới 90 chưa có dữ liệu quan sát → gắn chip `P-01`.
- Huyền 9 tòa / 135 phòng, thực nhận 19.152.297,12 · Mạnh 18.940.000 (774 × 10.000) · Huy 15.280.000 (408 × 10.000).
- Hiệu suất chung **93,2178852577877 %**; hai mẫu số 1.382 (phân bổ) vs 1.079 (hiệu suất) giữ tách bạch, gắn `P-05`.
- Tiến độ thu 12 quản lý chốt 16/09, gồm **4 người vượt 100 %** — không được chặn, không làm tròn xuống (`T17` = 105,73 %).

### 1.6 Golden dataset

- Nạp `goldenDatasets` = **Report A G1 kỳ 08/2026** (toàn bộ dòng P&L + 11 tỷ lệ, LNR 14.664.969,248777) và **Report B kỳ 08/2026** (TỔNG 7.036.256.236 = T 2.527.702.129 + S 3.551.745.507 + G 956.808.600).
- **Gỡ G1 giả và golden 06/2026** trong [seed-w5.js](mockup/js/core/seed-w5.js) (hàm `seedG1`, dòng 25–68) — thay bằng G1 thật, chuyển kỳ golden sang 08/2026.

### 1.7 Dọn định danh giả

17 file hardcode `TH-HBT-01` / `Sunrise` / `Moonlight` / `Riverside`, gồm: `seed.js`, `seed-org.js`, `seed-p2.js`, `seed-p3.js`, `seed-w3.js`, `seed-w4.js`, `seed-ocr.js`, `seed-wb.js`, `guide-ocr.js`, `guide-org.js`, `guide-p3.js`, `import.js`, `selectors-p3.js`, [landlords.js](mockup/js/pages/landlords.js), [ocr.js](mockup/js/pages/ocr.js), [settings.js](mockup/js/pages/settings.js), [forms-w4.js](mockup/js/ui/forms-w4.js). Thêm một chỗ trong [capture_phase1_walkthrough.mjs:151](scripts/capture_phase1_walkthrough.mjs#L151) (chỉ là chuỗi mô tả).

Cũng phải sửa gợi ý tìm kiếm trong command palette ([layout.js:238](mockup/js/ui/layout.js#L238)) đang ghi `A.12.03` → `201G1`.

### 1.8 Empty state trung thực

Các collection không có nguồn Excel (`leads`, `viewings`, `holds`, `deals`, `incidents`, `maintenanceSchedules`, `timesheets`, `bankTransactions`, `projects`) để rỗng, và dùng `U.empty()` với thông điệp **nêu đúng mã X-xx** — ví dụ *"Chưa có dữ liệu lead. Sổ Excel hiện tại không theo dõi CRM (X-01, ngoài phạm vi Phase 1)."* Không được để màn trông như đang lỗi.

---

## Phase 2–8 — Từng cụm nghiệp vụ

Từ đây đi theo thứ tự cụm của spec §8 dòng 246. Mỗi cụm làm cùng một việc, nên mô tả một lần:

1. Đối chiếu wireframe + **bảng "Chú giải vùng và chức năng"** của từng màn (spec ghi rõ số dòng bắt đầu wireframe) với màn hiện có → liệt kê vùng còn thiếu.
2. Bổ sung vùng thiếu, tái dùng `U.*` / `Fm.*`, **không viết widget mới** nếu toolkit đã có.
3. Gắn chip `TH.params.chip('P-xx')` vào mọi con số phụ thuộc tham số chưa chốt, theo cột "Màn hình bị ảnh hưởng" của §18.
4. Đủ 8 UI state bắt buộc của §16.2 (loading · empty lần đầu · empty do lọc · error · offline · thiếu quyền · khóa/chỉ đọc · xung đột).
5. Action nhạy cảm (§14 dòng 3318) phải **confirm + bắt buộc nhập lý do**: hủy/đảo chứng từ, xóa nợ, miễn phạt, trả sửa, giá dưới sàn, mở khóa kỳ, đổi phân công, đổi % cổ phần, điều chỉnh vốn, ghi đè phân bổ.
6. Chạy luồng F-0x đầu-đến-cuối, **chạy lại lần hai không được sinh bản ghi trùng** (§17.1).

| Phase | Cụm | Màn | Việc nổi bật |
|---|---|---|---|
| **2** | Nguồn nhà & tòa/phòng | UI-02 · UI-03 · UI-04 · UI-05 · UI-27 · **UI-28 (mới)** | UI-03 lấy bản đồ trường theo từng Điều của HĐ chủ nhà mẫu `.doc`; bổ sung các trường mẫu không có (giữ giá, lịch tăng giá, tháng miễn, phân bổ nhiều tòa `P-15`, nhóm T/S/G, phí môi giới). **UI-28 dựng mới**: tiền thuê nhà theo kỳ + chi phí trả trước (mạng G1 3tr/6 tháng) |
| **3** | Khách thuê & hợp đồng | UI-06 · UI-07 · UI-08 · UI-15 · UI-16 | UI-08 thay bảng 7 nhóm chung bằng **bản đồ trích xuất theo Điều + bảng 8 xung đột** (spec dòng 1218). Ba xung đột tiền bạc: điện chung thu 2 lần `P-30`, nước vừa theo người vừa có đồng hồ `P-31`, mẫu nội dung CK `P302 - TH01` vs mã phòng `302TH01` `P-35` |
| **4** | Dịch vụ & chỉ số | UI-09 · UI-10 | Điện chung **ba cách ghi khác nhau trong cùng tòa G1** (theo tầng / theo cụm phòng / ghi thẳng 6.000) — phải hiện rõ nguồn gốc từng dòng, không gộp một số |
| **5** | Hóa đơn & thu tiền | UI-11 · UI-12 · UI-13 · UI-14 · UI-17 | Chỉ số điện **nối kỳ**: kỳ N+1 tự điền `chỉ số cũ = chỉ số mới hợp lệ kỳ trước cùng công tơ`, hóa đơn đầu lấy OPENING đã duyệt; thiếu nguồn/thay công tơ phải cảnh báo có audit, **không sửa ngầm hóa đơn đã phát hành** (§17.3) |
| **6** | Chi phí & đầu tư | UI-24 · UI-25 · **UI-26 (mới)** · UI-29 | **UI-26 dựng mới**: 13 dòng hoa hồng, hai mức 35%/50% `P-07`, `Tổng nhận` gộp theo người nhận trong cùng kỳ chi, mẫu nội dung CK `HH + tên + lần n`. UI-29 hiện chênh 1.862.000 |
| **7** | Nhân sự & lương | UI-18 … UI-23 | Ma trận bậc lương đọc từ `payrollRuleVersions`; 4 dải quan sát được hiện `✓`, dải dưới 90 hiện chip `P-01`. Hai mẫu số phòng tách bạch `P-05`/`P-12` |
| **8** | Báo cáo, đối soát & hệ thống | UI-00 · UI-01 · UI-30 · UI-31 · UI-32 · UI-33 | Đối soát golden G1 08/2026 và Report B 08/2026; Report B **tính lại tỷ lệ từ tử/mẫu từng cột, không cộng dồn tỷ lệ**; mọi tổng có drill-down về chứng từ. UI-33 thêm tab sổ P-xx |

### Hai màn dựng mới — chi tiết kỹ thuật

| | UI-26 Hoa hồng | UI-28 Tiền thuê nhà & trả trước |
|---|---|---|
| Route | `#/commissions` | `#/head-lease-costs` |
| File | `mockup/js/pages/commissions.js` | `mockup/js/pages/headLeaseCosts.js` |
| NAV | thêm vào `NAV_ITEMS` + section `finance` trong [layout.js](mockup/js/ui/layout.js) | như trên |
| Permission | thêm `commissions.view` vào `auth.js` | thêm `headLeaseCosts.view` |
| Spec | dòng 2544–2630, wireframe 2549, rule 2609 | dòng 2690–2749, wireframe 2695 |

Cả hai chỉ thêm **item trong section**, không thêm section → `expectedTopLevel` của `check-rbac.mjs` giữ nguyên. Nhưng route mới **phải** có permission tồn tại và menu key nằm trong role layout, nếu không `npm run check` đỏ.

---

## Phase 9 — Đồng bộ tài liệu và ảnh

- 17 PNG trong [outputs/ui-mockups/](docs_timonouse/outputs/ui-mockups/) là **ảnh sinh bằng imagegen với số minh họa**, không phải ảnh chụp SPA — nên cũng lệch dữ liệu thật. Thay bằng ảnh chụp thật từ mockup qua Playwright (đã có sẵn `scripts/capture_*.mjs` làm mẫu), cập nhật [README.md](docs_timonouse/outputs/ui-mockups/README.md).
- Cập nhật `nghiep_vu/06_phu_luc.md` §6.1 đăng ký `P-30…P-36` *(đã đề xuất trước đó, chưa được duyệt — chỉ làm nếu anh đồng ý)*.

---

## Kiểm chứng

### Tự động

```bash
npm run check          # node --check mọi file JS + check-rbac.mjs
npm run dev            # http://localhost:8765
npm run walkthrough:p1 # Playwright chạy kịch bản Phase 1
```

`check-rbac.mjs` là bộ hồi quy thật: nó `vm.runInContext` `auth.js` + `layout.js` + toàn bộ `pages/*.js` và assert phạm vi dữ liệu theo vai trò, số mục menu, mọi route có permission tới được, và role chỉ-đọc không ghi state. Nó dùng fixture tổng hợp riêng nên **không vỡ vì thay seed**.

### Thủ công — 18 mục đối soát

Seed Data §15 có sẵn bảng 18 dòng, mỗi dòng là một con số kỳ vọng kèm sheet nguồn. Dùng nguyên làm checklist nghiệm thu. Bảy mục xương sống:

| Kiểm | Kỳ vọng |
|---|---|
| Hóa đơn `101G1` kỳ 09/2026 | Tổng cần đóng **4.404.000** |
| Điện `202G1` | 2.547 − 2.024 = **523 kWh** → 2.092.000 |
| Công tơ tổng `000G1` | 882 kWh × 3.500 = 3.087.000, **không lên hóa đơn khách** |
| Lợi nhuận ròng G1 T8 | **14.664.969,25** |
| Cổ đông Hằng 20 % | Tổng nhận **12.532.993,85** |
| Thực nhận Huyền T8 | **19.152.297,12** |
| Report B phòng mới | 95 = 41 + 47 + 7 |

### Rủi ro phải kiểm bằng tay

**Guide engine tự tiến theo `store.emit` và hỏng im lặng.** Thay toàn bộ seed gần như chắc chắn làm đứt vài mốc trong 16 mốc go-live. Sau Phase 1, mở `#/settings/tools` chạy "Chạy toàn bộ kịch bản Go-live" và đối chiếu từng mốc; sửa `guide.js` + `guide-*.js` theo dữ liệu mới. Không có test nào bắt được lỗi này.

Tương tự, `demo-data-p1.js` (221 dòng, điền form demo) tham chiếu dữ liệu cũ — phải rà lại.
