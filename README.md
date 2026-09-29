# TimoHouse – Mockup tương tác Phase 1

Web quản trị cho thuê nhà, dựng theo phân chia 3 phase mới (`docs/SRS/TimoHouse_Phan_chia_3_Phase.md`) và đặc tả màn hình `docs_timonouse/TimoHouse_Dac_ta_man_hinh_web_va_luong_nghiep_vu_v1.md` (Draft v1.8). Bộ ảnh `docs/UI/B01–B08` dùng làm tham chiếu bố cục; khi ảnh lệch đặc tả thì theo đặc tả.

Phase 1 gồm hai mốc:

| Mốc | Nội dung | Màn hình |
|---|---|---|
| **1A – go-live** | Tòa, phòng, chủ nhà; khách & lượt thuê (chờ nhận có cọc, 5 loại kết thúc); chỉ số; hóa đơn 13 dòng, 4 mẫu in; thu tiền, công nợ từ ngày 6; hoàn cọc duyệt kép; phá HĐ; Zalo ZNS; import; cài đặt | UI-01 → UI-15, UI-17, UI-18, UI-23, UI-24, UI-37 → UI-39 |
| **1B – chốt tháng** | Cơ cấu tổ chức, bảng lương theo HS và mốc 5/10/15, phân bổ quỹ chung, khóa kỳ, báo cáo theo tòa, Báo cáo tổng, Báo cáo kinh doanh | UI-16, UI-25, UI-27 → UI-30 |

Phase 2–3 (kinh doanh/CRM, OCR, sổ sửa chữa, chia cổ đông, tài sản, dự kiến lợi nhuận…) không có trong bản này.

## Chạy

```bash
npm run dev        # http://localhost:8765 (Node ≥ 20, không cần npm install để chạy)
npm test           # node:test – số golden từ Excel (domain) + hồi quy 10 lỗi P0 + các mục P1 chạy trên app dựng từ seed (tests/_app.mjs)
npm run check      # cú pháp + domain thuần + RBAC + unit test
npm run smoke      # luồng 1A + 1B trên Chrome thật (cần npm install và Chrome); --shots để chụp ảnh
npm run verify:p0  # kiểm chứng 10 lỗi P0 của đợt audit (19 kịch bản) + ảnh minh chứng → output/verify-p0/
npm run verify:p1  # ảnh minh chứng các mục P1 (nhập tay lương, điện chung, bấm số ra giao dịch gốc…) → output/verify-p1/
npm run verify:p1r # ảnh minh chứng các mục P1 còn lại (sửa nháp, phân bổ theo dòng, trả trước, vượt cọc, khách chủ nhà, tham số, Zalo, tòa/phòng, phân công theo phòng, cài đặt, import) → output/verify-p1-remaining/
npm run build      # mockup/ → dist/ (Netlify: netlify.toml)
npm run seed       # sinh lại dữ liệu demo từ file Excel (Python 3 + openpyxl)
```

Tài khoản demo (mật khẩu bất kỳ): `admin`, `ketoan`, `vanhanh`, `leader`, `truongphong`. Đổi vai trò nhanh ở menu góc phải.

## Dữ liệu demo

`scripts/seed/extract_seed.py` đọc file Excel khách gửi trong `docs_timonouse/` (hóa đơn tháng 9, báo cáo kinh doanh tháng 8, bảng lương tháng 8, danh sách mã điện nước mạng) và sinh `mockup/js/data/seed-*.js` + `tests/fixtures/*.json`.

- Tên người, SĐT, CCCD, số tài khoản được thay bằng dữ liệu giả xác định. Mã tòa/phòng, giá, chỉ số, số tiền giữ nguyên để nghiệm thu.
- Timeline demo (ngày hệ thống 29/09/2026): kỳ **08/2026** chạy song song Excel (nghiệm thu 1B), kỳ **09/2026** live (hóa đơn từ Excel), kỳ **10/2026** đang lập hóa đơn (chỉ số chốt 22/09 là dữ liệu sinh).
- State dựng lại từ seed mỗi lần mở; localStorage chỉ lưu các thao tác thử (Cài đặt → Hệ thống demo để xóa).

## Nghiệm thu

Cài đặt → **Đối chiếu nghiệm thu** chạy trên dữ liệu thật của app (cũng nằm trong `npm test` và `npm run smoke`):

- 1A: 1.471 hóa đơn tháng 9 có tổng in 13 dòng = tổng cần đóng; 9 hóa đơn Excel ghi "Tổng cần đóng" khác tổng 13 dòng được gắn cờ lệch nguồn (web thu theo 13 dòng); phòng mới T9 thu 126.912.000; Thu khác 403T20 còn thiếu 892đ; 20 phòng phá HĐ phải thu 16.048.000 / đã thu 3.662.000; hoàn cọc 301T41 = 2.530.000; 4 mẫu in có tài khoản nhận; tháng lẻ theo số ngày thực.
- 1B: lương T8 khớp 98/101 dòng tòa (3 lỗi nguồn); phân bổ G1 khớp SRC-07 với mẫu số 1.382; Báo cáo tổng T8 **tính trên số web**: doanh thu 7.036.256.236 và giá vốn 5.316.928.772 khớp; tổng chi phí web lệch Excel 10.642.770, tách hết thành 3 nhóm (3 tòa G12A/G13/G14 không có cột trong báo cáo Excel – cần khách chốt; 3 dòng lỗi nguồn bảng lương; 12 ô phân bổ của sheet tòa khác công thức chung), không còn khoản chưa giải thích; công thức dòng 18–61 chạy trên số Excel tái hiện sheet (LNR 1.022.398.969); Báo cáo kinh doanh: cầu nối tính trên số web = ô LNR (779.688.893), OQ-10 áp trên số Excel = 790.331.663, sheet Excel 685.928.969.

## Cấu trúc

```text
mockup/js/core      format, store (seed + overlay), auth, milestone, routes (manifest), router
mockup/js/domain    tính toán thuần: dates, params, billing, payments, refund, payroll, allocation, depreciation, report, zalo-rules, import-validate, rbac-policy
mockup/js/data      catalog (danh mục, tham số GĐ), seed-*.js (sinh), seed.js, seed-1b.js
mockup/js/services  q (selectors), q-report, act-* (nghiệp vụ: kiểm quyền, khóa kỳ, nhật ký)
mockup/js/ui        components, table, layout, kit, print
mockup/js/pages     1 file / nhóm màn
tests/              node:test + fixtures sinh từ Excel
scripts/            serve, build, check-rbac, smoke, seed/extract_seed.py
```

App cũ (phân phase theo `00_SCOPE_3_PHASE.md`) được giữ ở git tag `legacy/mockup-v3`.
