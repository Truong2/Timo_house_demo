# TimoHouse – Kịch bản kiểm thử Phase 2

Phiên bản 0.4 · 01/10/2026 · Trạng thái: **đã sửa lỗi audit 30/09 (mục 6), rà soát lại (mục 7) và làm Đợt E – lỗi kiểm tra 01/10 + toàn bộ backlog mục 7 (mục 8)**. Tài liệu được cập nhật sau mỗi đợt.

**Nguồn đặc tả:**
- `docs/SRS/TimoHouse_Phan_chia_3_Phase.md` §3;
- `docs_timonouse/TimoHouse_Dac_ta_man_hinh_web_va_luong_nghiep_vu_v1.md`: §3.5 Kinh doanh, §3.9 Cổ đông, §4 Báo cáo, §5 UI-38/39, §7.2;
- ảnh màn hình trong `docs/UI/B02`, `B03`, `B07`, `B08`.

**Dữ liệu đối chiếu:**
- nguồn là các file Excel của khách;
- `scripts/seed/extract_seed_p2.py` trích và ẩn danh thành `mockup/js/data/seed-p2.js`;
- kèm fixture `tests/fixtures/*-p2.json`.

## 1. Cách đọc và chạy

**Cột trong mỗi bảng kịch bản:**

| Cột | Ý nghĩa |
|---|---|
| Mã | `P2-Fxx.y`: F = luồng, y = bước. Mỗi luồng có thêm ca **bị chặn** (đánh dấu ⛔) |
| Vai trò | Tài khoản demo: `admin`, `ketoan`, `vanhanh`, `leader`, `truongphong`, `truongkd` (trưởng nhóm KD), `sale`, `kythuat`. Mật khẩu bất kỳ |
| Kết quả mong đợi | Cái người kiểm thử phải thấy. Số tiền viết theo kiểu Việt Nam (dấu chấm ngăn nghìn) |
| Tự động | Tên test trong `tests/p2-*.test.mjs` và ảnh trong `output/verify-p2/shots/` |
| TT | ☐ chưa chạy · ✅ đạt · ❌ lỗi · ⏸ chờ khách |

**Chạy kiểm thử:**
- `npm run check`: cú pháp, phân quyền, toàn bộ test (Phase 1 + Phase 2);
- `npm run verify:p2`: chụp ảnh minh chứng cho từng kịch bản;
- `npm run smoke`: luồng Phase 1, phải giữ 36/36;
- chạy tay: `npm run dev` → mở `http://localhost:8765`. Mốc mặc định là **Phase 2**; đổi mốc ở Cài đặt → Hệ thống demo.

**Tiền điều kiện chung:**
- dữ liệu demo sạch (Cài đặt → Hệ thống demo → Xóa thao tác);
- ngày hệ thống 29/09/2026;
- kỳ hiện tại 2026-09.

## 2. Số nghiệm thu Phase 2 (từ file Excel của khách)

| Mã | Nguồn | Chỉ tiêu | Số phải khớp |
|---|---|---|---|
| NT-1 | Hoa hồng năm 2025-2026, sheet `HOA HỒNG THÁNG 8.26` (SRC-09) | Σ thành tiền (125 dòng, 122 dòng có thành tiền, I = F × H) | **227.476.935,5** |
| NT-2 | `G1.31.8.26.xlsx`, sheet `BÁO CÁO THÁNG 8` (SRC-07) | Σ Vốn / Σ LN gộp / Σ LN ròng / Σ Tổng nhận; 9 dòng, tỷ lệ 10/20/15/5/15/10/5/10/10 | **48.000.000 / 22.990.932 / 14.664.969,25 / 62.664.969,25** |
| NT-3 | `âm dương điện nước tháng 7.xlsx`, sheet `THÁNG 7.2026 điện` (SRC-15) | Tổng thu K / điện chi L / thu − chi M; tòa T2 chi 8.135.381 | **1.234.987.000 / 913.178.913 / +321.808.087** |
| NT-4 | `âm dương điện nước tháng 6.xlsx`, sheet `THÁNG 6.2026 nước` | Tổng thu / nước chi / thu − chi; tòa T2 chi 977.500 | **292.728.500 / 207.782.352 / +84.946.148** |
| NT-5 | `sổ sửa chữa tháng 8`, thợ 1 (SRC-16) | 98 dòng; công / vật tư / lương / quyết toán ứng chi | **13.300.000 / 8.231.000 / 24.500.000 / thợ trả lại 1.769.000** |
| NT-6 | `sổ sửa chữa tháng 8`, thợ 2 | 135 dòng; công / vật tư / lương / quyết toán ứng chi | **10.050.000 / 13.750.000 / 21.250.000 / công ty trả thêm 3.750.000** |
| NT-0 | Phase 1 (không được đổi) | T8: doanh thu, LNR kinh doanh, lương, mẫu số phân bổ; T9: số hóa đơn | 7.036.256.236 · 779.688.893 · 98/101 · 1.382 · 1.471 |

## 3. Kết quả kiểm tra đặc tả và ảnh UI trước khi làm

| # | Chỗ lệch | Cách xử lý | Cần khách |
|---|---|---|---|
| K-1 | Ảnh `B03/UI-22_commission.png` là bản import Phase 1, tỷ lệ mẫu 10/2/3% không khớp SRC-09 (50/35/65%, chia trùng 25%/16,67%) | Làm theo đặc tả và SRC-09. Ảnh đã cũ | Không |
| K-2 | Ảnh `B07/UI-27` là màn chọn 2 báo cáo, không phải trung tâm 4 nhóm | Làm theo đặc tả dòng 378–405 | Không |
| K-3 | UI-39 hộp thư và UI-42…UI-47 không có ảnh | Thiết kế theo khung các màn báo cáo Phase 1 (UI-28/29) | Duyệt giao diện |
| K-4 | Ảnh UI-31 dùng tỷ lệ demo | Dùng tỷ lệ G1 thật, tên cổ đông ẩn danh | Không |
| K-5 | Đặc tả không có công thức chọn tỷ lệ hoa hồng tự động. Công thức phụ tháng 8 (`IF(RIGHT(L,6)="(LEAD)";50%;35%)`) sai 29/42 dòng | Tỷ lệ tự động chỉ là **gợi ý** theo bảng chính sách có ngày hiệu lực. Kế toán duyệt H; nếu khác gợi ý thì bắt buộc nhập lý do [GĐ] | **Có:** xác nhận bảng chính sách |
| K-6 | Sổ của thợ 2 không theo kỳ 26→25: **53/135 dòng** có ngày ngoài 26/07–25/08 (12 dòng trước 26/07, 40 dòng sau 25/08 trong đó 18 dòng ghi "tháng 9", 1 dòng ngày gõ sai 08/10) nhưng vẫn cộng vào tổng | Chế độ "như Excel" khớp tổng file (công 10.050.000, vật tư 13.750.000). Chế độ web chỉ tính 82 dòng trong kỳ (công 5.550.000, vật tư 7.025.000) và cảnh báo 53 dòng | **Có:** tính kỳ nào |
| K-7 | UI-38 "quản lý kỳ nâng cao" chưa được đặc tả | Làm bản tối thiểu: mở lại kỳ cần admin **và** kế toán duyệt, lưu phiên bản chốt, so sánh 2 phiên bản [GĐ] | **Có** |
| K-8 | Tỷ lệ chuyển đổi: SRC-13 ghi "xem/chốt", đặc tả ghi "chốt/xem" | Hiện cả hai số tuyệt đối; % = chốt / xem (OQ-06) | Xác nhận |
| K-9 | G1 C12–C19, C40, C45–46 liên kết sang workbook khác | Lấy số từ báo cáo tòa trên web (UI-28). Chênh 0,33đ so với SRC-04 hiện ở dòng riêng | Không |
| K-10 | Tiền công thợ vào lương: Phase 1 đang nhập tay | Có sổ đã xác nhận thì lấy tiền công từ sổ; không có thì giữ nhập tay. Kỳ đã khóa không tính lại | Không |

**Giả định (GĐ) cần khách chốt trước nghiệm thu Phase 2:**

| Mã | Nội dung giả định đang áp dụng |
|---|---|
| OQ-06 | **Phòng trống:** "ở luôn" = trống sẵn sàng và chưa có deal; "hết tháng" = lượt thuê kết thúc trong tháng; "đang chờ" = đã cọc, chưa vào ở.<br>**Lấp đầy** = ngày phòng tính tiền / ngày phòng khai thác, trừ phòng không có giá.<br>**Thời gian trống** = trung bình số ngày từ lúc ngừng tính tiền khách cũ đến lúc bắt đầu tính tiền khách mới.<br>**Chuyển đổi** = khách có deal chốt / khách có lượt xem, tính theo tháng của ngày xem |
| OQ-08 | Làm tròn từng dòng chia cổ đông đến đồng; chênh lệch dồn vào CHUNG |
| OQ-20 | Giữ phần điện phòng trống / không thu được trong tổng thu như Excel, nhưng hiện ở dòng riêng. Thêm chỉ số "thu − chi tiền thực" |
| OQ-21 | Combo → ½ vệ sinh + ½ máy giặt. Máy giặt → ½ điện + ½ nước. Thang máy, máy sấy, xe điện → 100% điện |
| OQ-23 | Không có sổ vệ sinh riêng. Kỳ 26→25 chỉ áp cho sổ sửa chữa. "Khách chi" tạo đề xuất khấu trừ, kế toán phải xác nhận |
| OQ-25 | Doanh số = Σ giá chốt theo ngày chốt. Deal hủy / bỏ cọc để ở cột riêng. Deal có nhiều sale thì chia đều như hoa hồng |
| GĐ-A2 | **Người chịu chi phí sửa chữa** (audit 30/09): thợ luôn nhận đủ tiền công. Chi phí dòng 41 = việc công ty chịu + việc khách chịu (công ty ứng trước; khoản trừ cọc / "Thu khác" là doanh thu thu hồi, nét = 0). Việc chủ nhà chịu không ghi chi phí vì đã bù trừ đủ vào kỳ trả chủ nhà |
| GĐ-A8 | **Chi hoa hồng khi kỳ đủ điều kiện đã khóa:** ghi vào kỳ của ngày chi, có ghi chú; không chi trước ngày đủ điều kiện |
| GĐ-B7 | **Mức 35%** (K-5 bổ sung): cùng một CTV có dòng 50% và dòng 35% trong tháng 8 → không suy ra được luật từ dữ liệu. Web chỉ gợi ý theo chính sách; đối chiếu hiện thêm **Σ theo tỷ lệ gợi ý** (cao hơn Excel) để khách chỉ ra khi nào áp 35% |
| GĐ-B21 | Vai trò **trưởng nhóm kinh doanh** (`truongkd`) tách khỏi leader vận hành: chỉ nhóm Kinh doanh; leader vận hành (TNVH) không thấy khách xem / giao dịch |
| GĐ-D4 | **Trưởng phòng vận hành** xem kinh doanh (khách xem, giao dịch, doanh số) **toàn bộ**, chỉ xem; không tạo lead, không chốt / hủy giao dịch. Chốt / hủy thuộc sale, trưởng nhóm KD, admin (hủy thêm kế toán) |
| GĐ-D7 | **Khóa bảng kê cổ đông** chỉ khi kỳ báo cáo đã khóa (UI-38) hoặc là kỳ chạy song song Excel (08/2026); kỳ đang mở chỉ xem số tính thử. Kỳ mở lại sau khi khóa → "Khóa phiên mới" sau khi kỳ được khóa lại |
| GĐ-D8 | **OCR "Áp dụng"** ghi biểu phí (giá, đơn giá dịch vụ) **và** điều khoản HĐ vào lượt thuê: hết hạn, kỳ / hạn thanh toán, cọc theo HĐ, số người, số xe. Ngày ký / nhận / tính tiền chỉ đổi khi lượt thuê chưa có hóa đơn phát hành. Cọc theo HĐ khác số đã thu chỉ cảnh báo, không sửa sổ cọc |
| GĐ-D18 | **Mở lại kỳ có dòng điều chỉnh sau khóa:** khi đủ 2 duyệt, các dòng điều chỉnh của kỳ **tạm gỡ** khỏi báo cáo (trạng thái "đã gỡ – chờ sửa gốc"); kế toán sửa thẳng chứng từ gốc rồi đánh dấu "đã sửa gốc". Khóa lại còn dòng chưa đánh dấu thì chỉ cảnh báo. Người gửi rút yêu cầu = "hủy"; người khác = "từ chối" |
| GĐ-C | **Rà soát OCR** mở cho vận hành / leader / trưởng phòng trong phạm vi tòa (đặc tả dòng 172); **áp dụng vào biểu phí** vẫn chỉ admin / kế toán. **HS tổng** = Σ T / Σ K (SRC-13), không phải trung bình HS các tòa; HS tạm tính = tiền nhà **đã thu** tại thời điểm xem |
| GĐ-E1 | **Tải tài liệu của sale / kỹ thuật** (đợt E): không mở kho tài liệu. Sale / trưởng nhóm KD chỉ tải HĐ khách của deal mình (ở chi tiết giao dịch); kỹ thuật chỉ tải biên bản bàn giao / ảnh chỉ số của tòa có việc sửa của mình (tab "Biên bản & ảnh" ở UI-47) |
| GĐ-E2 | **Quyết toán ứng chi thợ** là chứng từ quỹ (phiếu chi bổ sung khi công ty trả thêm / phiếu thu khi thợ nộp lại), **không** ghi chi phí mới vì vật tư đã vào chi phí dòng 41 khi chốt kỳ sổ. Mỗi thợ × kỳ sổ quyết toán một lần; sau đó không đổi vật tư / số ứng của kỳ |
| GĐ-E3 | **Loại ca hoa hồng** khi import lịch sử: Thường / Đối tác / Trùng 2 / Trùng 3 / Bỏ cọc / HĐ ngắn (để trống = Thường) |
| GĐ-E4 | **Import hoa hồng I ≠ F × H** (lệch > 0,5đ): chỉ cảnh báo, vẫn nhập theo I của file (file khách có 5/265 dòng lệch công thức) |
| GĐ-E5 | **Tòa trả điện qua chủ nhà** (UI-43 web): chi điện = đơn giá trả chủ nhà × kWh trên hóa đơn đã phát hành; chưa có đơn giá thì gắn cờ, không lấy hóa đơn EVN. Đang áp S32 = 2.500đ/kWh (SRC-14 Sheet1), S39 (hóa đơn ghi "đã tt cho chủ nhà") chờ đơn giá; các tòa còn lại trong 5 tòa Excel ghi "chưa tính tiền chủ nhà" chờ khách chỉ ra |
| GĐ-E6 | **Vai trò phụ trách** ở bộ lọc leader (UI-01): vận hành = phân công quản lý tòa; kỹ thuật = tòa có việc sửa của thợ trong team ở kỳ sổ; sale = tòa có deal chốt của team trong kỳ. Nhắc thu / thu thực tế / vệ sinh chưa có dữ liệu phân công → trống |

## 4. Kịch bản

### F21 – Khách tiềm năng và lượt xem (UI-20)

| Mã | Vai trò | Bước | Kết quả mong đợi | Tự động | TT |
|---|---|---|---|---|---|
| P2-F21.1 | sale | Kinh doanh → Khách xem → Thêm khách: SĐT, nguồn (Facebook / tờ rơi / đăng tin / Zalo / đối tác), nhóm (CTV / Phòng KD / Sale VH / Vận hành), khu vực | Khách mới ở trạng thái "Mới", sale phụ trách là chính mình | p2-sales: lead | ✅ |
| P2-F21.2 | sale | Thêm lượt xem: tòa, phòng, ngày xem | Lượt xem gắn vào khách. Một khách xem được nhiều phòng | p2-sales: viewing | ✅ |
| P2-F21.3 ⛔ | sale | Thêm khách mới trùng SĐT với khách đã có (E08) | Cảnh báo trùng liên hệ, hiện sale đang phụ trách. Chỉ lưu được khi chọn "gắn vào khách cũ" hoặc ghi lý do | p2-sales: dup; ảnh `f21-3` | ✅ |
| P2-F21.4 ⛔ | sale | Mở khách của sale khác bằng đường dẫn trực tiếp | Bị chặn. Danh sách chỉ có khách của mình | p2-sales: scope | ✅ |
| P2-F21.5 | truongkd | Mở Khách xem | Thấy khách của các sale trong team. Chuyển được sale phụ trách | p2-sales: branch | ✅ |
| P2-F21.6 ⛔ | sale | Tạo khách thuê (UI-07) từ lead khi chưa có giao dịch | Không có nút. Khách thuê chỉ được tạo khi chốt deal | p2-sales | ✅ |

### F22 – Chốt deal → khách vào ở (UI-21 → UI-07/13/11)

| Mã | Vai trò | Bước | Kết quả mong đợi | Tự động | TT |
|---|---|---|---|---|---|
| P2-F22.1 | sale | Từ lượt xem → "Chốt": giá chốt, cọc, ngày chốt, ngày vào ở, ngày tính tiền, thời hạn, nguồn/đối tác | Deal "Đã chốt". Tạo khách + **lượt thuê chờ nhận** (thay đường tạo tay của Phase 1). Phòng rời danh sách "trống ở luôn" | p2-sales: close | ✅ |
| P2-F22.2 ⛔ | sale | Chốt vào phòng đang có khách hoặc đã có deal chờ | Bị chặn, báo trùng phòng | p2-sales | ✅ |
| P2-F22.3 | ketoan | Ghi phiếu thu cọc cho lượt thuê của deal (UI-13) | Deal hiện "Thu cọc: đủ / thiếu" | p2-sales | ✅ |
| P2-F22.4 | admin | Khách vào ở (nhận phòng) | Deal "Đã nhận", có liên kết lượt thuê. Hóa đơn đầu tiên xem được ở UI-11 | p2-sales: receive; ảnh `f22-4` | ✅ |
| P2-F22.5 | admin | Tổng quan hàng (UI-19) | Số còn bán / đã chốt / đã nhận / lên lại (phá HĐ, hoàn cọc) theo khu, leader, sale, kỳ. "Chốt" khác "nhận". Phòng nhiều sale chỉ đếm 1 lần | p2-sales: overview; ảnh `f22-5` | ✅ |

### F23 – Hủy, đổi phòng, bỏ cọc (UI-21, E09)

| Mã | Vai trò | Bước | Kết quả mong đợi | Tự động | TT |
|---|---|---|---|---|---|
| P2-F23.1 | truongkd | Đổi phòng deal đang chờ | Ghi sự kiện "chuyển". Lượt thuê chờ chuyển sang phòng mới. Hoa hồng giữ theo deal (đặc tả: đổi phòng giữ hoa hồng phòng cũ) | p2-sales: transfer | ✅ |
| P2-F23.2 | truongkd | Hủy deal (khách chưa cọc) | Deal "Hủy". Phòng mở bán lại. Không tính doanh số, không tính hoa hồng | p2-sales: cancel | ✅ |
| P2-F23.3 | ketoan | Khách bỏ cọc | Deal "Hủy – bỏ cọc". Cọc thành doanh thu dòng 5 "Cọc khách bỏ không ở". Không phát sinh công nợ, không có phiếu hoàn. Phòng mở bán lại. Hoa hồng tính lại theo cơ sở cọc − tiền ngày đã ở | p2-sales: forfeit; ảnh `f23-3` | ✅ |
| P2-F23.4 ⛔ | sale | Hủy hoặc ghi bỏ cọc | Không có quyền (chỉ leader / kế toán / admin) | p2-sales | ✅ |
| P2-F23.5 | admin | Xem lịch sử deal | Mỗi thao tác là một sự kiện riêng (ai, lúc nào, lý do). Doanh số, cọc, hoa hồng không bị đếm hai lần | p2-sales | ✅ |

### F24 – Hoa hồng: tính, duyệt, chi (UI-22)

| Mã | Vai trò | Bước | Kết quả mong đợi | Tự động | TT |
|---|---|---|---|---|---|
| P2-F24.1 | ketoan | Hoa hồng → tab "Đối chiếu T8 (Excel)" | 125 dòng. Web tính I = F × H cho từng dòng. **Σ = 227.476.935,5 (NT-1)**. Hiện số dòng có tỷ lệ gợi ý khớp tỷ lệ thực tế; dòng khác gợi ý có lý do (đối tác 35%, thỏa thuận riêng…) | p2-commission: NT-1; ảnh `f24-1` | ✅ |
| P2-F24.2 | ketoan | Deal mới đủ điều kiện (đã thu 1 cọc + 1 tháng, có file HĐ) | Hoa hồng "Đủ điều kiện chi". Tỷ lệ gợi ý: 50% cơ bản; MOITHUE 65%; HĐ dưới 6 tháng = 50/6 × số tháng; trùng 2 người 25%, 3 người 16,67%; bỏ cọc tính trên cọc − tiền ngày đã ở | p2-commission: suggest | ✅ |
| P2-F24.3 ⛔ | ketoan | Duyệt với tỷ lệ khác gợi ý mà không ghi lý do | Bị chặn, báo lỗi ở ô "Lý do" | p2-commission | ✅ |
| P2-F24.4 ⛔ | ketoan | Chi hoa hồng khi chưa đủ điều kiện (thiếu cọc / tháng 1 / file HĐ) | Bị chặn, hiện điều kiện còn thiếu | p2-commission | ✅ |
| P2-F24.5 | ketoan | Chi 2 lần (chia đợt) | Mỗi lần tạo chứng từ chi phí "Hoa hồng" → dòng 40 "Phí marketing", ghi vào kỳ đủ điều kiện (OQ-13). Tổng các lần không vượt số đã duyệt | p2-commission: pay | ✅ |
| P2-F24.6 ⛔ | sale | Mở Hoa hồng bằng đường dẫn | 403. Sale không thấy hoa hồng (CH-01) | check-rbac | ✅ |
| P2-F24.7 | ketoan | Tab "Nhân sự sale" | Sale, chức danh, thâm niên, doanh số kỳ, chỉ tiêu | ảnh `f24-7` | ✅ |

### F25 – Sổ sửa chữa → lương, chi phí, hoàn cọc (UI-47)

| Mã | Vai trò | Bước | Kết quả mong đợi | Tự động | TT |
|---|---|---|---|---|---|
| P2-F25.1 | ketoan | Sổ sửa chữa → kỳ 08/2026 (26/07–25/08) → thợ 1 → chế độ "như Excel" | 98 dòng. **Công 13.300.000, vật tư 8.231.000, lương 24.500.000 = 7.500.000 + 3.000.000 + công + 700.000; ứng 10.000.000 → thợ trả lại 1.769.000 (NT-5)** | p2-repairs: NT-5; ảnh `f25-1` | ✅ |
| P2-F25.2 | ketoan | Thợ 2 | **Công 10.050.000, vật tư 13.750.000, lương 21.250.000; công ty trả thêm 3.750.000 (NT-6)**. Chế độ web cảnh báo 53 dòng ngoài kỳ 26→25 (K-6) | p2-repairs: NT-6 | ✅ |
| P2-F25.3 | kythuat | Thêm việc: tòa, phòng, nội dung, loại việc, tiền công, vật tư, điểm lấy sơn, lý do, người chịu | Dòng "Nháp". Kỹ thuật **không** thấy cột tiền thu / công nợ | p2-repairs: add | ✅ |
| P2-F25.4 ⛔ | kythuat | Nhập ngày ngoài kỳ đang mở | Cảnh báo, phải chọn kỳ đúng hoặc ghi lý do | p2-repairs | ✅ |
| P2-F25.5 | ketoan | Xác nhận các dòng của kỳ | Chuyển "Đã xác nhận". Dòng công ty chịu → chi phí "Sửa chữa, thay thế, bảo trì" (dòng 41) theo tòa. Dòng chủ nhà chịu → bù trừ kỳ trả chủ nhà UI-05 | p2-repairs: confirm | ✅ |
| P2-F25.6 | ketoan | Dòng "khách chi" của phòng đang có phiếu hoàn cọc nháp | Hiện **đề xuất** trừ trên phiếu hoàn cọc (UI-18). Chỉ áp khi kế toán bấm xác nhận (OQ-23) | p2-repairs: tenant | ✅ |
| P2-F25.7 | ketoan | Bảng lương kỳ có sổ đã xác nhận | Nhóm sửa chữa lấy tiền công từ sổ; kỳ không có sổ giữ nhập tay. **Lương T8 vẫn 98/101 (NT-0)** | p2-repairs: payroll | ✅ |
| P2-F25.8 | ketoan | Tab "Sơn" | Tồn theo điểm (T20, T42, T33, T28, VP) và phòng đã lấy | ảnh `f25-8` | ✅ |

### F26 – Âm dương điện nước (UI-43)

| Mã | Vai trò | Bước | Kết quả mong đợi | Tự động | TT |
|---|---|---|---|---|---|
| P2-F26.1 | ketoan | Báo cáo → Âm dương → Điện → kỳ 07/2026 → "Như Excel" | Theo tòa: máy giặt B, C, D; thang máy/sấy/xe điện E, F, G; điện H, I, J; K = H + B/2 + E; L; M = K − L. **Tổng K 1.234.987.000, L 913.178.913, M +321.808.087; T2 L = 8.135.381 (NT-3)** | p2-reports: NT-3; ảnh `f26-1` | ✅ |
| P2-F26.2 | ketoan | Nước → kỳ 06/2026 → "Như Excel" | **Tổng 292.728.500 − 207.782.352 = +84.946.148; T2 chi 977.500 (NT-4)** | p2-reports: NT-4 | ✅ |
| P2-F26.3 | ketoan | Điện → kỳ 09/2026 → "Web tự tính" | Phải thu = dòng điện trên hóa đơn đã phát hành. Thực thu = phiếu thu phân bổ theo dòng. Cộng điện trừ cọc + phòng trống ở dòng riêng (OQ-20). Ghép combo / máy giặt / thang máy theo OQ-21. Chi = hóa đơn nhà cung cấp (nếu chưa nhập → "chờ dữ liệu") | p2-reports: web | ✅ |
| P2-F26.4 | ketoan | Bấm vào số phải thu của một tòa | Ra danh sách hóa đơn / dòng nguồn (UI-12) | ảnh `f26-4` | ✅ |
| P2-F26.5 | ketoan | Xem cờ | Các tòa trả điện qua chủ nhà có cờ riêng | p2-reports | ✅ |

### F27 – Trung tâm báo cáo và báo cáo vận hành / kinh doanh (UI-27, UI-42, UI-44, UI-45, UI-46)

| Mã | Vai trò | Bước | Kết quả mong đợi | Tự động | TT |
|---|---|---|---|---|---|
| P2-F27.1 | truongphong | Báo cáo | 4 nhóm. Mỗi thẻ có công thức của khách, kỳ dữ liệu mới nhất, trạng thái sẵn sàng / chờ định nghĩa / chờ dữ liệu. UI-40, UI-41 ghi "Phase 3" | ảnh `f27-1` | ✅ |
| P2-F27.2 | ketoan | Chi phí giá vốn / cố định / phát sinh (UI-42), kỳ 08 | 3 tab. Cột theo tòa và toàn hệ thống, % doanh thu, so sánh tháng trước. Tổng khớp Báo cáo tổng T8 | p2-reports: costs | ✅ |
| P2-F27.3 | ketoan | Chi phí sửa chữa, vệ sinh (UI-44), kỳ 08 | Gộp sổ theo tòa, thợ, loại việc, lý do, người chịu. Công 23.350.000 + vật tư 21.981.000. Vệ sinh: số việc dọn phòng + lương vệ sinh 43.200.000 | p2-reports: repairs | ✅ |
| P2-F27.4 | truongphong | Báo cáo phòng vận hành (UI-45), kỳ 09 | HS thực tế / tạm tính (cùng công thức lương, OQ-18), lấp đầy và thời gian trống (OQ-06), đóng đúng hạn đến hết ngày 5 / ngày 6–10 / 11–15 / sau 15, % sinh viên / đi làm | p2-reports: rooms; ảnh `f27-4` | ✅ |
| P2-F27.5 | ketoan | Khách hàng và doanh số sale (UI-46) | Số khách xem, số chốt, % chốt/xem; doanh số theo sale / team / nguồn theo ngày chốt; deal hủy / bỏ cọc ở cột riêng (OQ-25) | p2-reports: sales | ✅ |
| P2-F27.6 | ketoan | Đầu trang và xuất Excel | Ghi tên báo cáo, kỳ, bộ lọc, phiên bản dữ liệu, thời điểm khóa | ảnh | ✅ |
| P2-F27.7 | ketoan | Đối chiếu Phase 1 | **Báo cáo tổng T8 vẫn 7.036.256.236; LNR kinh doanh 779.688.893 (NT-0)** | p2-reports: NT-0 | ✅ |

### F28 – Cổ đông và chia lãi G1 (UI-31, UI-32)

| Mã | Vai trò | Bước | Kết quả mong đợi | Tự động | TT |
|---|---|---|---|---|---|
| P2-F28.1 | ketoan | Cổ đông → G1 | 9 dòng (CHUNG + 8 cổ đông ẩn danh), Σ = 100%, có ngày hiệu lực | p2-shares | ✅ |
| P2-F28.2 ⛔ | ketoan | Sửa tỷ lệ còn 99% rồi khóa bảng kê (E24) | Bị chặn: "Tổng tỷ lệ tòa G1 = 99%, phải đủ 100%" | p2-shares: E24; ảnh `f28-2` | ✅ |
| P2-F28.3 | ketoan | Bảng kê chia G1 kỳ 08 → Tính thử | Lấy số theo **mã chỉ tiêu** Báo cáo tổng của tòa G1 (tiền thuê 1 tháng, LNG, LNR). Vốn H = G × tiền thuê/100; I = G × LNG/100; J = G × LNR/100; M = H + J. **Như Excel: Σ H 48.000.000; Σ I 22.990.932; Σ J 14.664.969; Σ M 62.664.969 (NT-2)**; chênh làm tròn dồn CHUNG (OQ-08). Theo Báo cáo tổng web: LNR 14.672.848,66 – lệch 7.879đ đúng bằng ô C43 Excel dùng mẫu số 1.343 (OQ-04), hiện ở dòng giải thích | p2-shares: NT-2; ảnh `f28-3` | ✅ |
| P2-F28.4 | ketoan | Khóa bảng kê | Có ảnh chụp số tại thời điểm khóa. Khóa rồi thì sửa tỷ lệ không làm đổi bảng kê. M chỉ là số phải chia, **không** là khoản chi | p2-shares: lock | ✅ |
| P2-F28.5 ⛔ | vanhanh | Mở Cổ đông | 403 | check-rbac | ✅ |

### F29 – Kho tài liệu và OCR hợp đồng (UI-26, UI-08)

| Mã | Vai trò | Bước | Kết quả mong đợi | Tự động | TT |
|---|---|---|---|---|---|
| P2-F29.1 | vanhanh | Tài liệu → Tải lên: loại (HĐ khách, HĐ chủ nhà, phụ lục, biên bản, chứng từ, ảnh chỉ số, sổ đỏ), gắn đối tượng | Có phiên bản 1. Chỉ thấy tài liệu của tòa được phân công | p2-docs | ✅ |
| P2-F29.2 | vanhanh | Tải lại cùng tài liệu | Tạo phiên bản 2. Xem được bản cũ | p2-docs | ✅ |
| P2-F29.3 ⛔ | vanhanh | Xóa tài liệu đã gắn giao dịch | Bị chặn | p2-docs | ✅ |
| P2-F29.4 | ketoan / vanhanh | Lượt thuê → Hợp đồng → "Đọc OCR" (giả lập) | Trạng thái (sửa audit C): mới tải → đang trích xuất → chờ rà soát / không đọc được → đã áp dụng; phiên cũ "đã thay" khi chạy lại. Màn rà soát đặt file và trường cạnh nhau. Mỗi trường có trang/vùng, độ tin cậy, cờ đã sửa | p2-docs: ocr; ảnh `f29-4` | ✅ |
| P2-F29.5 ⛔ | ketoan | Áp dụng vào biểu phí khi còn trường bắt buộc thiếu hoặc độ tin cậy thấp chưa rà (E05) | Bị chặn, chỉ ra trường thiếu | p2-docs: E05 | ✅ |
| P2-F29.6 | ketoan | Sửa đủ trường → Xác nhận → Áp dụng (E06) | Tạo phiên bản biểu phí mới có ngày hiệu lực. Hóa đơn đã phát hành **không đổi**. Lưu người xác nhận, bản OCR gốc và bản đã sửa | p2-docs: E06 | ✅ |
| P2-F29.7 | ketoan | Chạy lại OCR | Tạo phiên mới, không ghi đè phiên cũ hay biểu phí | p2-docs | ✅ |

### F30 – Mở rộng Dashboard, quản lý kỳ, Zalo (UI-01, UI-38, UI-39)

| Mã | Vai trò | Bước | Kết quả mong đợi | Tự động | TT |
|---|---|---|---|---|---|
| P2-F30.1 | truongphong | Tổng quan | Thẻ HS thực tế / tạm tính (có nhãn). Lọc leader không đếm trùng phòng có nhiều người phụ trách | p2-ext: dashboard; ảnh `f30-1` | ✅ |
| P2-F30.2 | sale | Tổng quan | Thẻ "Deal của tôi". Không có số tiền thu | ảnh `f30-2` | ✅ |
| P2-F30.3 | ketoan → admin | Kỳ đã khóa → "Yêu cầu mở lại" có lý do → kế toán duyệt → admin duyệt | Chỉ mở khi đủ **cả hai** duyệt. Lịch sử khóa/mở được ghi lại [GĐ K-7] | p2-ext: reopen | ✅ |
| P2-F30.4 ⛔ | ketoan | Tự duyệt đủ hai bước | Bị chặn | p2-ext | ✅ |
| P2-F30.5 | ketoan | Khóa lại → So sánh phiên bản 1 và 2 | Bảng chênh lệch số báo cáo theo tòa × dòng | p2-ext: compare; ảnh `f30-5` | ✅ |
| P2-F30.6 | truongphong | Menu "Thông báo Zalo" → **Phản hồi Zalo** (`/zalo/inbox`, sửa audit B18) | Tin khách trả lời được gán cho trưởng phòng phụ trách tòa (UI-24), có trạng thái xử lý và ghi chú. Mở được từ tab khách UI-07 | p2-ext: inbox + route; ảnh `f30-6b` (tài khoản truongphong) | ✅ |
| P2-F30.7 | ketoan | Quy tắc Zalo | Có thêm sự kiện "Sắp hết HĐ (35 ngày)" và "Đã chi hoàn cọc" | p2-ext: events | ✅ |
| P2-F30.8 ⛔ | ketoan | Coi tin "đã chuyển khoản" của khách là thu tiền | Không có thao tác; phải ghi phiếu thu UI-13 | p2-ext | ✅ |

## 5. Tiến độ theo đợt

| Đợt | Nội dung | Kịch bản | Trạng thái |
|---|---|---|---|
| 0 | Nền: mốc Phase 2, route, 7 vai trò, dữ liệu đối chiếu, tài liệu này | — | ✅ `npm run check` đạt (109 test, RBAC 371) |
| 1 | Kinh doanh và hoa hồng | F21–F24 | ✅ `tests/p2-sales.test.mjs` (24 ca), 12 ảnh `f21…f24`; NT-1: web 227.476.935,49 / Excel 227.476.935,5; tỷ lệ gợi ý khớp 99/122 dòng |
| 2 | Sổ sửa chữa | F25 | ✅ `tests/p2-repairs.test.mjs` (13 ca), 10 ảnh `f25-*`; NT-5, NT-6 khớp ở chế độ "như Excel"; lương T8 giữ 98/101 (kỳ song song không lấy sổ) |
| 3 | Báo cáo vận hành | F26–F27 | ✅ `tests/p2-reports.test.mjs` (9 ca), 13 ảnh `f26-*`, `f27-*`; NT-3, NT-4 khớp tuyệt đối; UI-42 T8 = TCP 6.024.500.037 |
| 4 | Cổ đông, tài liệu, OCR | F28–F29 | ✅ `tests/p2-shares-docs.test.mjs` (17 ca), 12 ảnh `f28-*`, `f29-*`; NT-2 khớp ở nguồn "như Excel"; nguồn web lệch LNR 7.879đ do OQ-04 |
| 5 | Mở rộng Dashboard / kỳ / Zalo | F30 | ✅ `tests/p2-ext.test.mjs` (8 ca), 8 ảnh `f30-*` |
| Audit 30/09 | Sửa 9 lỗi nặng, 22 lỗi trung bình / ẩn danh, bổ sung phần thiếu so với đặc tả (mục 6) | A1–A9, B1–B22, C | ✅ `npm run check` 223 test, RBAC 414 (8 vai trò); smoke 36/36; P0 19/19; P1 còn lại 27 ảnh; quét 104 route × 8 tài khoản 0 lỗi; 65 ảnh Phase 2 (thêm `fx-*`, `f30-6b` bằng truongphong); NT-0…NT-6 không đổi |
| Rà soát lại 30/09 | Sửa 2 lỗi nặng, 17 lỗi trung bình, 2 tên giả trùng tên thật (mục 7) | D1–D19 | ✅ `npm run check` 240 test (thêm 17 ca `p2-fixes-d`), RBAC 419; smoke 36/36; P0 19/19; P1 còn lại 27 ảnh; quét 104 route × 8 tài khoản 0 lỗi; 65 ảnh Phase 2; NT-0…NT-6 không đổi; quét tên thật trong dữ liệu = 0 |
| Đợt E 01/10 | Sửa 4 lỗi kiểm tra 01/10 (seed deal chồng khách cũ, nhận phòng, nhãn UI-19, ảnh dính toast) và làm hết backlog mục 7 (mục 8) | E0–E3 | ✅ `npm run check` 266 test (thêm 20 ca `p2-fixes-e`), RBAC 442; smoke 36/36; P0 19/19; quét 117 route × 8 tài khoản 0 lỗi; 88 ảnh Phase 2 (thêm 23 ảnh `fe-*`); NT-0…NT-6 không đổi |

## 6. Audit 30/09 – lỗi đã sửa

Audit độc lập 4 mảng (đọc code + chạy thử trên app) sau khi làm xong Phase 2. Số nghiệm thu NT-0…NT-6 khớp từ trước; các lỗi dưới đây là lỗi luồng nghiệp vụ mà test cũ (chủ yếu chế độ "như Excel", lối đi thuận) không bắt được. Mỗi lỗi có test tái hiện trong `tests/p2-fixes-{a,b,c}.test.mjs`.

### Đợt A – lỗi nặng

| Mã | Lỗi | Sửa | Test |
|---|---|---|---|
| A1 | UI-25 trả lương thợ thiếu lương cứng + thâm niên (kỳ 09: 14.000.000 thay vì 24.500.000); quỹ "Lương sửa chữa" gần 0 | Bảng lương lấy phần cố định từ hồ sơ thợ (SRC-16) khi kỳ không song song Excel; T8 giữ số Excel | A1 |
| A2 | Tiền công việc khách / chủ nhà chịu vẫn thành chi phí công ty | Theo người chịu (GĐ-A2); thợ vẫn nhận đủ tiền công | A2, sửa `p2-repairs` |
| A3 | Xác nhận / nhập sổ sau khi chốt lương → tiền công mất | Chặn, hướng dẫn ghi kỳ sau / điều chỉnh sau khóa | A3 |
| A4 | Deal lệch lượt thuê khi nhận phòng / bỏ cọc ở UI-07; hủy deal làm hủy khách đang ở | Nhận phòng / bỏ cọc ở đâu deal cũng đồng bộ; hủy chỉ khi lượt thuê còn chờ nhận; phòng "bị giữ" chỉ khi lượt thuê còn chờ nhận | A4 (4 ca) |
| A5 | Mở lại → khóa lại kỳ: dòng điều chỉnh sau khóa cộng hai lần | Ảnh chụp số khi khóa không gồm dòng điều chỉnh | A5 |
| A6 | Zalo gửi lặp khi tạo 2 đợt trước khi gửi (82 khách nhận 2 tin) | Người nhận đang có tin chờ gửi cùng sự kiện không vào đợt mới | A6 |
| A7 | OCR đọc "3.800" thành 3,8đ; "4.200.000" bị bỏ qua im lặng | Đọc số kiểu Việt Nam; giá thuê không hợp lệ báo lỗi | A7 |
| A8 | Không chi được hoa hồng khi kỳ đủ điều kiện đã khóa | GĐ-A8 | A8 |
| A9 | Chia trùng không tạo được từ UI; ≥ 4 sale mỗi người 50% | Form chốt có sale chia trùng (gợi ý từ lead trùng SĐT); tỷ lệ co giãn theo mức cơ bản; ≥ 4 người chia đều | A9 |

### Đợt B – lỗi trung bình + ẩn danh

| Mã | Lỗi | Sửa | Test |
|---|---|---|---|
| B1 | Đổi phòng có giá mới nhưng hóa đơn tính giá cũ | Giá mới + biểu dịch vụ tòa mới vào phiên biểu phí | B1 |
| B2 | Hủy chứng từ hoa hồng không hoàn đợt chi | Gỡ đợt chi, dòng hoa hồng chi lại được | B2 |
| B3 | Import hoa hồng / tạo "chờ nhận" tay vẫn chạy song song ở Phase 2 | Import chỉ lịch sử ≤ 08/2026; UI-07 ẩn "chờ nhận" ở mốc 2 (tạo từ UI-21) | B3 |
| B4 | Sale ghi chú vào khách của sale khác | Chặn ngoài phạm vi | B4 |
| B5 | Tính lại khi bỏ cọc làm dòng đã chi kẹt chờ duyệt | Giữ "đã chi đủ" + khoản cần thu hồi | B5 |
| B6 | UI-19 "Đã chốt" gồm deal bỏ cọc | Loại hủy / bỏ cọc (OQ-25) | — |
| B7 | Đối chiếu NT-1 tự khớp vòng tròn | Thêm Σ theo tỷ lệ gợi ý (GĐ-B7) | B7 |
| B8 | Xác nhận nhiều dòng áp dở dang khi có dòng lỗi | Kiểm hết rồi mới ghi | B8 |
| B9 | Dòng sổ đã xác nhận không sửa được | "Điều chỉnh" có lý do + lịch sử; bù trừ chủ nhà / đề xuất trừ cọc đi theo | B9 |
| B10 | Dòng ghi kỳ khác ngày tính khác nhau giữa UI-47 / UI-44 / lương | Một quy tắc `periodOverride` cho mọi màn | B10 |
| B11 | Âm dương web: máy giặt/sấy ½ điện ½ nước; trừ cọc lấy cả phiếu chưa chi | Máy giặt/sấy 100% điện (OQ-21); chỉ phiếu hoàn đã chi | B11 |
| B12 | UI-44 không lọc phạm vi tòa | Lọc theo phạm vi | B12 |
| B13 | Khóa được bảng kê theo nguồn "như Excel"; không có phiên bản | Chỉ khóa số web; kỳ mở lại → khóa phiên 2 | B13 |
| B14 | Lùi ngày tỷ lệ góp phá lịch sử | Chặn ngày trước bộ tỷ lệ đang dùng | B14 |
| B15 / B16 | Phiên OCR cũ vẫn áp dụng được; OCR / biểu phí áp vào kỳ đã khóa | Phiên cũ "đã thay"; chặn kỳ đã khóa (cả biểu phí thủ công) | B15/B16 |
| B17 | Tài liệu gắn "Phòng" lưu nhầm mã tòa | Chọn phòng / chứng từ đúng tòa | B17 |
| B18 | Trưởng phòng không mở được hộp thư UI-39 | Trang `/zalo/inbox` quyền `zalo.inbox`; tin chỉ gán TPVH | B18 |
| B19 | Mốc 1A/1B chưa ẩn tài khoản / quy tắc / vai trò Phase 2 | Chặn đăng nhập, ẩn menu / cài đặt, chặn quy tắc Zalo P2 và yêu cầu mở lại | B19 |
| B20 | Sale / kỹ thuật thấy số HĐ còn nợ ở trang tòa | Ẩn theo quyền `debts.viewStatus` | RBAC |
| B21 | `truongkd` dùng vai trò leader (menu rỗng) | Vai trò riêng (GĐ-B21) | B21, RBAC |
| B22 | Mã nhân viên sinh từ tên thật (cả Phase 1); tên thật trong ghi chú / tên sheet | Mã `NV########` băm từ tên; tên giả hiển thị không đổi; che tên trong ghi chú; tên giả cổ đông không trùng chữ với tên thật | quét tên thật = 0 |

### Đợt C – phần còn thiếu so với đặc tả

| Màn | Bổ sung | Test |
|---|---|---|
| UI-20 | Cột Team, "đã chuyển sale", lọc khu vực | — |
| UI-21 | Ghi chú; thu đủ/thiếu gồm tháng đầu; "Sửa ngày nhận" (sự kiện riêng); link mã lead | C-UI21 |
| UI-22 | STK người nhận (chỉ admin / kế toán), SĐT khách, QL phòng, ngày chi + link chứng từ UI-15, tổng theo người nhận, lọc kỳ / sale / team; chỉ tiêu theo sale có hiệu lực | C-UI22 |
| UI-26 | Tải xuống (ghi nhật ký), cột quyền, lọc theo đối tượng, trạng thái OCR; HĐ khách bản cũ "đã thay" | C-UI26 |
| UI-08 | So sánh giá cũ / mới trước khi áp dụng (E06); đủ trường bắt buộc; phí combo, máy giặt; vòng đời trạng thái; vận hành rà soát | C-UI08 |
| UI-31 / UI-32 | Bấm Vốn / LNG / LNR mở UI-28; xem theo cổ đông; file xuất có dòng tổng + chênh làm tròn; nút khóa chỉ ở nguồn web | — |
| UI-44 | Gộp theo phòng; so sánh kỳ trước | C-UI27/44 |
| UI-45 | HS tổng Σ T / Σ K; HS tạm tính theo đã thu; nhãn tạm tính khi chưa qua mốc 15; 3 nhóm phòng trống; phân khúc theo kỳ | C-UI45 |
| UI-46 | Lọc tòa / khu vực / sale / team; xuất Excel; chỉ tiêu theo sale | C-UI22 |
| UI-27 | 4 nhóm đúng tên đặc tả; kỳ và trạng thái theo dữ liệu; giữ bộ lọc khi chuyển báo cáo | C-UI27/44 |
| UI-47 | Khách chịu → "Thu khác" trên hóa đơn nháp (áp khi kế toán xác nhận) | C-UI47 |
| UI-38 | Hủy / từ chối yêu cầu mở lại (có lý do); ma trận quyền có nhóm quyền Phase 2 | C-UI38 |
| UI-01 | Lọc leader theo cơ cấu tại cuối kỳ xem; nhãn HS tạm tính | p2-ext F30.1 |
| Test yếu | F30.1 kiểm số phòng không đếm hai lần trên nhánh thật; F30.3 khóa kỳ đúng điều kiện 1B; F30.6 kiểm route | p2-ext |

**Số được phép đổi do sửa lỗi:** lương thợ và quỹ "Lương sửa chữa" kỳ 09 (A1), âm dương web kỳ 09 (B11), HS tạm tính / HS tổng (C-UI45). Số nghiệm thu NT-0…NT-6 không đổi.

## 7. Rà soát lại 30/09 – Đợt D

Rà soát độc lập lần 2 trên bản đã sửa (4 mảng, chỉ đọc, chạy thử từng luồng). Số nghiệm thu vẫn khớp; còn lỗi luồng / trạng thái ở đường đi ngược và ca biên. Mỗi lỗi có test tái hiện trong `tests/p2-fixes-d.test.mjs`.

### Lỗi nặng

| Mã | Lỗi | Sửa | Test |
|---|---|---|---|
| D1 | Khóa lại bảng kê cổ đông sau mở lại kỳ: phiên cũ bị đánh dấu "đã thay" **trước** khi kiểm tra 100% → lỗi E24 làm kỳ mất bảng kê đã khóa | Tính và kiểm tra phiên mới trước, chỉ thay phiên cũ khi hợp lệ | D1 / D6 |
| D2 | Điều chỉnh dòng sửa chữa chủ nhà chịu: gỡ bù trừ cũ khỏi kỳ trả chủ nhà rồi mới báo lỗi → số đã trả chủ nhà giảm sai | Chọn kỳ trả chủ nhà đích trước (tính cả phần bù trừ cũ); lỗi thì không ghi gì. Kiểm tra người chịu hợp lệ; chặn đổi người chịu dòng có tiền công sau chốt lương | D2 |

### Lỗi trung bình (kèm lỗi nhỏ cùng chỗ)

| Mã | Lỗi | Sửa | Test |
|---|---|---|---|
| D3 | Hủy deal: lead vẫn "Đã chốt", lượt xem vẫn "chốt" → không chốt lại / đánh "không thuê" được | Lead về trạng thái trước khi chốt; lượt xem về "đã xem". Kèm: chặn ngày chốt tương lai, nhận / bỏ cọc trước ngày chốt (cả ở UI-07); bỏ sale trùng; đổi phòng lưu giá cũ trong sự kiện; UI-19 cột hủy / bỏ cọc đếm cả bỏ cọc; UI-22 hiện ghi chú dòng | D3, D3+ |
| D4 | Trưởng phòng vận hành có quyền chốt / hủy nhưng phạm vi rỗng (0 lead), vẫn tự tạo lead cho mình | GĐ-D4 | D4, RBAC |
| D5 | UI-46: số tổng không lọc phạm vi; lọc theo sale vẫn hiện người chia trùng | Tổng theo phạm vi như các dòng; lọc sale / team chỉ hiện người được lọc | D5 |
| D6 | Sau mở lại kỳ, UI-32 không còn nút khóa phiên mới | Nút "Khóa phiên mới" + ghi chú khi kỳ đã mở lại sau lần khóa | D1 / D6 |
| D7 | Khóa được bảng kê khi kỳ báo cáo còn mở → số khóa bị cũ | GĐ-D7 | D7 |
| D8 | OCR "Áp dụng" chỉ ghi giá và đơn giá phí; cọc, ngày, kỳ trả… bị bỏ qua | GĐ-D8; bảng so sánh E06 có thêm điều khoản HĐ | D8 |
| D9 | Phiên OCR của file HĐ cũ vẫn áp dụng được sau khi tải file mới | File mới → phiên chờ rà soát của file cũ "đã thay"; áp dụng chỉ trên file mới nhất | D9 / D10 |
| D10 | Sửa trường / xác nhận nhóm OCR ngoài phạm vi tòa không bị chặn | Kiểm phạm vi ở mọi thao tác trên phiên OCR | D9 / D10 |
| D11 | OCR: "3,800" → 3,8; "4,2 triệu" → 4,2; cọc "abc" coi như đã điền; ngày / kỳ trả nhận chữ bất kỳ | Đọc số tiền kiểu Việt Nam (có "triệu", "tr", "k"); ngày dd/mm/yyyy; kỳ trả 1–12, hạn trả 1–31; sai → lỗi trường, nhóm chưa rà xong | D11 |
| D12 | Kho tài liệu không gắn được khách / lượt thuê, phiếu thu; thay bản đã bị thay; tải tài liệu đã xóa; nhận file bất kỳ | Gắn khách (mã KH / mã phòng đang ở) và phiếu thu; chỉ thay bản hiện hành; chặn tải bản đã xóa; chỉ nhận PDF / ảnh / Word / Excel (cả file HĐ khách) | D12, D9 / D10 |
| D13 | Đổi người chịu sau khi "Tính" lương rồi chốt → tiền công tính hai lần hoặc mất | Chữ ký bảng lương gồm người chịu → bắt tính lại | D13 |
| D14 | Form thêm việc: ô "Kỳ sổ" không có kỳ 09 → không lưu được việc ngày 20/09; ghi được vào kỳ song song Excel; thợ là nhân viên sale | Mặc định "Theo ngày"; danh sách 3 kỳ gần nhất; chặn kỳ song song; chỉ nhân viên kỹ thuật; hủy dòng nháp chặn kỳ đã khóa | D14 |
| D15 | Tab lương thợ và UI-44 cộng cả dòng nháp, bảng lương thì không | Chỉ tính dòng đã xác nhận; dòng nháp hiện riêng "chưa tính" | D15 |
| D16 | Xem trước người nhận Zalo lỗi JS với sự kiện "sắp hết HĐ" / "đã chi hoàn cọc"; nhật ký không hiện phòng | Hiện theo lượt thuê khi không có hóa đơn | D16, quét route |
| D17 | Tài khoản Phase 2 tạo mới trong Cài đặt vẫn đăng nhập ở mốc 1A/1B; đổi vai trò sang Phase 2 ở 1A được | Chặn theo vai trò; từ chối tạo / đổi sang vai trò chưa mở; bảng tài khoản lọc theo mốc | D17 |
| D18 | Mở lại kỳ vẫn cộng dòng điều chỉnh sau khóa → sửa số gốc bị cộng hai lần | GĐ-D18 | A5 / D18, C-UI38 |
| D19 | 2 tên giả của khách trùng đúng tên chủ tài khoản thật trong file mã HĐ điện nước | Bút danh loại mọi cụm 3 từ có trong các file Excel nguồn; sinh lại dữ liệu (7 tên giả đổi, số liệu không đổi) | quét tên = 0 |

### Chưa làm – chờ khách chọn (✅ đã làm ở Đợt E – mục 8)

Phát hiện ở lần rà soát lại nhưng ngoài phạm vi đợt D (chức năng đặc tả có ghi mà chưa làm, hoặc lỗi nhỏ). **Toàn bộ đã làm ở Đợt E theo giả định GĐ-E1…E6** – bảng dưới giữ lại để tra cứu:

| Nhóm | Nội dung |
|---|---|
| UI-46 | Lọc NV vận hành, loại T/S/G, cổ đông (đặc tả dòng 516) |
| UI-47 | Ảnh việc sửa; trạng thái thu ("QL bank về HT") nhập từ form; link lượt thuê; nhập tồn sơn; ghi nhận quyết toán ứng (trả thêm / thu lại thợ) |
| UI-43 | Tòa trả điện qua chủ nhà: tính chi phí = tiền trả chủ nhà × số kWh (vd S32 2.500đ/kWh) |
| UI-42 / UI-44 / UI-45 | Cột theo tòa trên màn UI-42; drill-down tới dòng sổ UI-47 / UI-18; HS theo nhân viên → tòa, link giải thích UI-25; lọc trưởng phòng; T8 song song hiện "không có dữ liệu" thay cho 0 |
| UI-01 | Lọc "chỉ team trực tiếp", "vai trò phụ trách"; leader cũ khi xem kỳ cũ; thẻ HS mở UI-45 |
| Import hoa hồng | Đủ cột F/G/H, loại ca, kiểm I = F × H; dòng import hiện ở UI-22; file mẫu kỳ ≤ 08/2026 |
| UI-31 / UI-32 | Sửa thông tin cổ đông, chứng từ góp vốn; cột K / L trong bảng và file xuất |
| UI-22 | Nhập tỷ lệ theo đối tác trong form chính sách; STK đối tác |
| UI-39 | Kiểm tra lại nội dung trước khi gửi cho sự kiện lượt thuê; gán hộp thư khi TPVH phụ trách trực tiếp; ẩn tab hộp thư ở 1A/1B |
| Khác | Chặn theo mốc ở mọi action Phase 2 (hiện chặn ở route); loại PCCC trong danh mục tài liệu; quyền tải tài liệu cho sale / kỹ thuật |

### Câu hỏi mới cho khách

| # | Câu hỏi |
|---|---|
| K-11 | Đổi phòng trước khi nhận: hoa hồng giữ giá phòng cũ (đặc tả dòng 311) nhưng **chi phí marketing ghi vào tòa nào** – tòa cũ hay tòa mới? (đang ghi tòa mới) |
| K-12 | Deal **bỏ cọc** có tính là "chốt" trong tỷ lệ chuyển đổi không? (đang tính chốt, nhưng không tính doanh số) |
| K-13 | Bỏ cọc khi có **chia trùng** hoặc **đối tác** (vd MOITHUE 65%): áp tỷ lệ bỏ cọc 50% hay tỷ lệ đối tác / chia trùng? |
| K-14 | Lọc kỳ ở UI-22 theo **tháng chốt** hay **tháng đủ điều kiện chi** (OQ-13)? |
| K-15 | Điều kiện chi "đủ 1 tháng" tính theo hóa đơn đầu tiên (có thể là tháng lẻ) hay đủ một tháng tròn? |
| K-16 | Hoa hồng đã chi vượt số tính lại khi khách bỏ cọc: **thu hồi** bằng chứng từ âm hay trừ vào lần chi sau? (đang chỉ cảnh báo "cần thu hồi") |
| K-17 | Tỷ lệ **đóng đúng hạn** (UI-45) có tính hóa đơn phòng phá HĐ và phòng mới vào ở không? |
| K-18 | Dòng sổ sửa chữa **chưa xác nhận** có hiện trong báo cáo chi phí sửa chữa (UI-44) không? (đang không tính, hiện riêng) |
| K-19 | Đổi tỷ lệ góp **giữa kỳ**: bảng kê dùng tỷ lệ hiệu lực cuối kỳ hay chia theo ngày? |

## 8. Đợt E – kiểm tra 01/10 và làm backlog mục 7

Kiểm tra lại toàn bộ Phase 2 ngày 01/10 (chạy lại check, verify:p2, smoke, sweep, P0) rồi làm hết danh sách "Chưa làm – chờ khách chọn" ở mục 7 theo giả định GĐ-E1…E6 (mục 3). Mỗi mục có test trong `tests/p2-fixes-e.test.mjs` và ảnh `fe-*` trong `output/verify-p2/shots/`.

### Lỗi tìm thấy khi kiểm tra 01/10

| Mã | Lỗi | Sửa | Test / ảnh |
|---|---|---|---|
| E0.1 | Seed: 26/26 deal "đã chốt – chờ nhận" nằm trên phòng mà khách cũ vẫn "đang ở" tới 2026-10…2027, không có ngày báo trả → trái quy tắc P2-F22.2, không nhận phòng được khi demo | Khách cũ được ghi báo trả (trước 30 ngày) và dự kiến bàn giao ngày trước khi khách mới tính tiền. Chỉ ghi báo trả, không kết thúc lượt → hóa đơn T9, lương, báo cáo không đổi | E0.1 (3 ca) |
| E0.2 | UI-21 bấm "Nhận phòng" khi còn khách cũ chỉ báo lỗi | Cảnh báo "Phòng còn khách cũ" kèm ngày báo trả / bàn giao và link mở lượt thuê cũ để kết thúc | `fe-e0-2` |
| E0.3 | UI-19 "Đã chốt 39" (đếm phòng) cạnh "Giao dịch chốt trong kỳ (40)" (đếm deal); "deal đang chờ nhận" không lọc kỳ mà không ghi rõ | Nhãn ghi "(phòng)" + số giao dịch; "đang chờ nhận (mọi kỳ)". Số không đổi | `fe-e0-3` |
| E0.4 | Ảnh `f22-5` dính toast E08 của bước trước | `verify-p2` xóa toast trước khi chụp | `f22-5` |

### Backlog mục 7 đã làm

| Mã | Màn | Bổ sung | Test / ảnh |
|---|---|---|---|
| E1.1 | Chung | Chặn theo mốc ở **mức action** cho mọi chức năng Phase 2 (kinh doanh, hoa hồng, sổ sửa chữa, cổ đông, kho tài liệu, OCR, hộp thư, duyệt mở lại kỳ). Hoa hồng tự động bỏ qua êm ở 1A để bỏ cọc ở UI-07 vẫn chạy | E1.1 (2 ca) |
| E1.2 | UI-39 | Kiểm tra lại trước khi gửi cho sự kiện lượt thuê: sắp hết HĐ (còn ở, chưa gia hạn, trong cửa sổ cảnh báo), đã chi hoàn cọc (phiếu vẫn "đã chi") → "Bỏ qua – sự kiện không còn đúng". Hộp thư gán chính TPVH khi trưởng phòng trực tiếp quản lý tòa. Ẩn tab / KPI hộp thư ở 1A/1B | E1.2 (3 ca); `fe-e1-2`, `fe-e1-1` |
| E1.3 | UI-26 | Loại tài liệu PCCC (nhóm quyền như sổ đỏ). Quyền `documents.download` cho sale / kỹ thuật theo phạm vi hẹp [GĐ-E1] | E1.3; `fe-e1-3`, `fe-e1-3b`; RBAC |
| E2.1 | UI-47 | Ảnh việc sửa; trạng thái thu ("QL bank về HT"…) nhập từ form và điều chỉnh; gắn lượt thuê (đang ở / vừa trả phòng); tồn sơn = tồn đầu SRC-16 + nhập − xuất; quyết toán ứng chi theo thợ × kỳ [GĐ-E2] | E2.1 (3 ca); `fe-e2-1*` |
| E2.2 | Import | Hoa hồng lịch sử ≤ 08/2026 đủ cột F, G, H, loại ca [GĐ-E3], I; kiểm I = F × H (lệch chỉ cảnh báo [GĐ-E4]); dòng import xem ở UI-22 (Nguồn: import lịch sử); file mẫu kỳ 08/2026 | E2.2; `fe-e2-2` |
| E2.3 | UI-22 | Tỷ lệ riêng theo đối tác nhập trong form chính sách; tài khoản nhận của đối tác (chỉ admin / kế toán), cột STK lấy theo đối tác | E2.3; `fe-e2-3*` |
| E2.4 | UI-31 / UI-32 | Sửa thông tin cổ đông (lưu lịch sử); chứng từ góp vốn gắn cổ đông × tòa góp (chỉ người có quyền cổ đông thấy, không xóa); cột K (LNR/GV) và L (CP/LNG) ở dòng tổng bảng kê và file xuất – G1 T8 như Excel: K 23,96 · L 3,0238 | E2.4; `fe-e2-4*` |
| E3.1 | UI-46 | Lọc loại T/S/G, NV vận hành, cổ đông (chỉ giới hạn tòa, không đổi định nghĩa doanh số – đặc tả dòng 410) | E3.1; `fe-e3-1` |
| E3.2 | UI-43 | Tòa trả điện qua chủ nhà: chi = đơn giá trả chủ nhà × kWh trên hóa đơn đã phát hành; chưa có đơn giá → cờ [GĐ-E5]. Seed S32 2.500đ/kWh, S39 chờ đơn giá; khai báo ở UI-03 tab Dịch vụ đầu vào. "Như Excel" không đổi (NT-3, NT-4) | E3.2; `fe-e3-2*` |
| E3.3 | UI-42 | Bảng dòng × tòa trên màn (bố cục UI-28), bấm ô mở chứng từ gốc của tòa | `fe-e3-3` |
| E3.4 | UI-44 | Mọi cách gộp mở đúng phần sổ UI-47 (thợ, người chịu, loại việc, lý do, phòng); cột chứng từ liên quan: phiếu hoàn UI-18, hóa đơn, chứng từ chi UI-15 | E3.4; `fe-e3-4` |
| E3.5 | UI-45 | Lọc trưởng phòng / leader (cả nhánh hoặc chỉ team trực tiếp); xem HS theo nhân viên → tòa (Σ T / Σ K) có link giải thích lương UI-25; kỳ song song Excel hiện "Không có dữ liệu" thay cho 0 | E3.5; `fe-e3-5*` |
| E3.6 | UI-01 | Lọc "Chỉ team trực tiếp", "Vai trò phụ trách" [GĐ-E6]; danh sách leader / quản lý theo kỳ xem (leader cũ vẫn tìm được); bảng tòa theo phân công cuối kỳ; thẻ HS mở UI-45 | E3.6; `fe-e3-6` |

**Số được phép đổi:** âm dương điện **web** kỳ 09 của tòa S32, S39 (E3.2). Số nghiệm thu NT-0…NT-6 không đổi.

**Kết quả đợt E:** `npm run check` 266 test (thêm 20 ca `p2-fixes-e`), RBAC 442; smoke 36/36; P0 19/19; quét 117 route × 8 tài khoản 0 lỗi; 88 ảnh Phase 2 (thêm 23 ảnh `fe-*`), không lỗi trang.

**Còn chờ khách:** các câu hỏi K-11…K-19 (mục 7) và giả định GĐ-E1…E6 (mục 3).
