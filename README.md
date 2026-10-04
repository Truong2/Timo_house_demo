# TimoHouse – Mockup tương tác Phase 1 + Phase 2 + Phase 3

Web quản trị cho thuê nhà, dựng theo phân chia 3 phase (`docs/SRS/TimoHouse_Phan_chia_3_Phase.md`) và đặc tả màn hình `docs_timonouse/TimoHouse_Dac_ta_man_hinh_web_va_luong_nghiep_vu_v1.md` (Draft v1.13). Excel nguồn là chuẩn mặc định cho dữ liệu/báo cáo lịch sử; công thức OQ chưa được khách xác nhận chỉ là phương án so sánh và không dùng cho số chính thức hoặc kỳ đã khóa.

Phase 1 gồm hai mốc:

| Mốc | Nội dung | Màn hình |
|---|---|---|
| **1A – go-live** | Tòa, phòng, chủ nhà; khách & lượt thuê (chờ nhận có cọc, 5 loại kết thúc); chỉ số; hóa đơn 12 dòng hoặc mẫu web mở rộng 13 dòng khi có “Thu khác”; thu tiền, công nợ sau 5 ngày lịch từ ngày phát hành; hoàn cọc duyệt kép; phá HĐ; Zalo ZNS; import; cài đặt | UI-01 → UI-15, UI-17, UI-18, UI-23, UI-24, UI-37 → UI-39 |
| **1B – chốt tháng** | Cơ cấu tổ chức, bảng lương theo HS và mốc 5/10/15, phân bổ quỹ chung, khóa kỳ, báo cáo theo tòa, Báo cáo tổng, Báo cáo kinh doanh | UI-16, UI-25, UI-27 → UI-30 |

| **2** | Kinh doanh (khách xem, giao dịch chốt thay lượt thuê chờ nhận, hoa hồng tự động có duyệt & chi nhiều đợt); sổ sửa chữa & ứng chi vật tư (kỳ 26→25, vào lương + chi phí + đề xuất trừ cọc); trung tâm báo cáo 4 nhóm + chi phí, âm dương điện nước, sửa chữa/vệ sinh, phòng vận hành (HS, lấp đầy, đúng hạn), khách & doanh số; cổ đông & bảng kê chia lãi G1; kho tài liệu; OCR hợp đồng (mô phỏng); mở rộng Dashboard, quản lý kỳ (mở lại cần duyệt kép), hộp thư Zalo + 2 sự kiện mới | UI-19 → UI-22, UI-26, UI-31, UI-32, UI-42 → UI-47; mở rộng UI-01, UI-08, UI-27, UI-38, UI-39 |
| **3** | Tài sản/khấu hao có trạng thái chính sách và nguồn; bảo dưỡng, kiểm kê; góp vốn và chi thực; dự kiến lợi nhuận có phiên bản nháp/xác nhận; báo cáo hiệu quả đầu tư | UI-33 → UI-36, UI-40, UI-41 |

Mốc mặc định là **Phase 3** (đổi ở Cài đặt → Hệ thống demo). Kịch bản kiểm thử nằm tại `docs/uat/Phase2_Kich_ban_kiem_thu.md` và `docs/uat/Phase3_Kich_ban_kiem_thu.md`; ma trận cần ký duyệt nghiệp vụ nằm tại `docs/SRS/TimoHouse_Ma_tran_Quyet_dinh_Nghiep_vu.md`.

## Chạy

```bash
npm install        # cài bộ đọc PDF/OCR/XLSX cho luồng hợp đồng
npm run dev        # http://localhost:8765 (Node ≥ 20; tự chuẩn bị thư viện đọc file trong mockup/vendor/intake)
npm test           # node:test – số golden từ Excel (domain) + hồi quy 10 lỗi P0 + các mục P1 chạy trên app dựng từ seed (tests/_app.mjs)
npm run check      # cú pháp + domain thuần + RBAC + unit test
npm run smoke      # luồng 1A + 1B trên Chrome thật (cần npm install và Chrome); --shots để chụp ảnh
npm run verify:p0  # kiểm chứng 10 lỗi P0 của đợt audit (19 kịch bản) + ảnh minh chứng → output/verify-p0/
npm run verify:p1  # ảnh minh chứng các mục P1 (nhập tay lương, điện chung, bấm số ra giao dịch gốc…) → output/verify-p1/
npm run verify:p1r # ảnh minh chứng các mục P1 còn lại (sửa nháp, phân bổ theo dòng, trả trước, vượt cọc, khách chủ nhà, tham số, Zalo, tòa/phòng, phân công theo phòng, cài đặt, import) → output/verify-p1-remaining/
npm run verify:p2  # ảnh minh chứng Phase 2 theo kịch bản F21–F30 → output/verify-p2/shots/
npm run verify:p3  # ảnh minh chứng Phase 3 → output/verify-p3/shots/
npm run sweep      # mọi route × 9 tài khoản demo: không lỗi JS / lỗi hiển thị
npm run verify:module-completion # xe/tạm trú, chủ nhà, phân công, phiên lương, phiên cổ đông, sales và responsive → output/module-completion/
npm run build      # mockup/ → dist/ (Netlify: netlify.toml)
node scripts/verify-intake.mjs        # Chrome: 2 PDF mẫu, ảnh OCR, Excel gốc NHÀ G, lưu lại trình duyệt
node scripts/verify-intake-modes.mjs  # Chrome: nhập tay và XLSX mẫu cho cả chủ nhà/khách hàng
npm run verify:intake:ui # Chrome: UI chủ nhà/hợp đồng, nháp/nguồn/xung đột/quyền + ảnh 4 kích thước → output/verify-intake-ui/
npm run seed       # sinh lại dữ liệu demo Phase 1 từ file Excel (Python 3 + openpyxl)
npm run seed:p2    # sinh lại dữ liệu đối chiếu Phase 2 (hoa hồng T8, cổ đông G1, âm dương T6/T7, sổ sửa chữa T8) – không đụng seed Phase 1
```

Tài khoản demo (mật khẩu bất kỳ): `admin`, `ketoan`, `vanhanh`, `leader`, `truongphong`, `truongkd`, `sale`, `kythuat`, `codong`. Đổi vai trò nhanh ở menu góc phải.

## Giao diện nhập hợp đồng

Danh sách chủ nhà có tìm kiếm, bộ lọc tòa/trạng thái và bảng phân trang. Hồ sơ chủ nhà liên kết nhiều hợp đồng, file gốc và lịch sử xác nhận. Luồng nhập chủ nhà/khách hàng dùng chung 4 bước, hỗ trợ chuyển giữa hợp đồng, nhập tay và Excel/CSV trong cùng bản nháp. PDF/ảnh gốc nằm cạnh form để đối chiếu; danh sách phòng sửa qua bảng/drawer, phí dịch vụ khai báo theo từng dòng. Chỉ xác nhận khi dữ liệu hợp lệ và đã rà soát.

Kiểm tra UI: chạy `npm run dev` ở một terminal, rồi `npm run verify:intake:ui` ở terminal khác. Có thể đặt `CHROME_PATH` nếu Chrome nằm ở vị trí khác. Ảnh nghiệm thu và kết quả được ghi vào `output/verify-intake-ui/`.

## Dữ liệu demo

Luồng hợp đồng mới: **Vận hành → Chủ nhà → Thêm chủ nhà**, sau đó **Vận hành → Khách hàng → Thêm khách hàng**. Mỗi màn có trích xuất PDF/ảnh, nhập tay và XLSX/CSV; có thể bổ sung Excel và sửa tay trong cùng bản nháp. Bản nháp/file gốc lưu bằng IndexedDB ở trình duyệt đang sử dụng. Hai hợp đồng TH01 trong `docs/contracts_demo/` là dữ liệu mẫu chưa ký. Danh mục và ánh xạ nguồn khách hàng: `docs/SRS/TimoHouse_Nguon_du_lieu_Luong_hop_dong.md`.

`scripts/seed/extract_seed.py` đọc file Excel khách gửi trong `docs_timonouse/` (hóa đơn tháng 9, báo cáo kinh doanh tháng 8, bảng lương tháng 8, danh sách mã điện nước mạng) và sinh `mockup/js/data/seed-*.js` + `tests/fixtures/*.json`.

- Tên người, SĐT, CCCD, số tài khoản được thay bằng dữ liệu giả xác định. Mã tòa/phòng, giá, chỉ số, số tiền giữ nguyên để nghiệm thu.
- Timeline demo (ngày hệ thống 29/09/2026): kỳ **08/2026** chạy song song Excel (nghiệm thu 1B), kỳ **09/2026** live (hóa đơn từ Excel), kỳ **10/2026** đang lập hóa đơn (chỉ số chốt 22/09 là dữ liệu sinh).
- State dựng lại từ seed mỗi lần mở; localStorage chỉ lưu các thao tác thử (Cài đặt → Hệ thống demo để xóa).

## Nghiệm thu

Cài đặt → **Đối chiếu nghiệm thu** chạy trên dữ liệu thật của app (cũng nằm trong `npm test` và `npm run smoke`):

Hồ sơ bàn giao: `docs/uat/Bao_cao_nghiem_thu_3_Phase_Draft_v1.13.md`; ma trận ký duyệt OQ-01…OQ-25: `docs/SRS/TimoHouse_Ma_tran_Quyet_dinh_Nghiep_vu.md`.

- 1A: 1.471 hóa đơn tháng 9 có tổng in 13 dòng = tổng cần đóng; 9 hóa đơn Excel ghi "Tổng cần đóng" khác tổng 13 dòng được gắn cờ lệch nguồn (web thu theo 13 dòng); phòng mới T9 thu 126.912.000; Thu khác 403T20 còn thiếu 892đ; 20 phòng phá HĐ phải thu 16.048.000 / đã thu 3.662.000; hoàn cọc 301T41 = 2.530.000; 4 mẫu in có tài khoản nhận; tháng lẻ theo số ngày thực.
- 1B: lương T8 khớp 98/101 dòng tòa (3 lỗi nguồn); HS < 70 không tự gán 6.000/6.500đ mà bắt buộc nhập lương/phòng và lý do; phân bổ G1 khớp SRC-07 với mẫu số 1.382. Báo cáo kinh doanh chính thức T8 tái hiện Excel với LNR **685.928.969**; phương án OQ-10 vẫn tính để admin/kế toán so sánh nhưng mang trạng thái chờ xác nhận và không hiển thị cho cổ đông.

- Phase 2 (dữ liệu Excel khách, `seed-p2.js`): hoa hồng T8 Σ thành tiền **227.476.935,5** và giữ kỳ thực chi nguồn; bảng kê chia G1 T8 dùng đúng Excel: vốn **48.000.000**, LNG **22.990.932**, LNR **14.664.969**, tổng nhận **62.664.969**; chênh làm tròn kỳ web hiển thị riêng và chặn khóa khi OQ-08 chưa xác nhận; âm dương điện T7 **+321.808.087**, nước T6 **+84.946.148**; chế độ web tách sản lượng phòng trống khỏi tiền thực thu; sổ sửa chữa T8 vẫn giữ chế độ Excel và hiển thị riêng dòng ngoài kỳ.
- Phase 3: tài sản mới bắt buộc số tháng và nguồn chính sách khấu hao; tài sản cũ 63 tháng mang `legacy_assumption`, chỉ có lịch thử và không đi vào báo cáo chính thức. Forecast web là bản nháp, đặt cạnh kết quả Excel và chỉ mở cho cổ đông sau khi xác nhận. LN/tài sản trả “Chờ chính sách tài sản” nếu mẫu số còn quy tắc chưa xác nhận.

## Cấu trúc

```text
mockup/js/core      format, store (seed + overlay), auth, milestone, routes (manifest), router
mockup/js/domain    tính toán thuần: dates, params, billing, payments, refund, payroll, allocation, depreciation, report, zalo-rules, import-validate, rbac-policy
mockup/js/data      catalog (danh mục, tham số GĐ), seed-*.js (sinh), seed.js, seed-1b.js, seed-phase2.js (dựng dữ liệu demo Phase 2)
mockup/js/services  q (selectors), q-report, act-* (nghiệp vụ: kiểm quyền, khóa kỳ, nhật ký)
mockup/js/ui        components, table, layout, kit, print
mockup/js/pages     1 file / nhóm màn
tests/              node:test + fixtures sinh từ Excel
scripts/            serve, build, check-rbac, smoke, seed/extract_seed.py
```

App cũ (phân phase theo `00_SCOPE_3_PHASE.md`) được giữ ở git tag `legacy/mockup-v3`.

Kiểm tra 8 gap audit ngày 04/10/2026: `npm run verify:audit-gaps` cho source/local; `npm run audit:live` cho Netlify. Quy tắc đã chốt và bằng chứng tại [Audit Gap Completion](docs/uat/Audit_Gap_Completion_2026-10-04.md).
