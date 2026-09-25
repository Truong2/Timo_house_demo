# TimoHouse — mockup tương tác cụm Nguồn nhà & tòa/phòng

SPA vanilla JS (ES modules, không build step) hiện thực [SRS v1.0](../docs_timonouse/outputs/TimoHouse_SRS_v1.0.md) FR02–FR05: 13 màn, dữ liệu lưu localStorage.

## Chạy

```bash
npm run dev            # http://localhost:8765  (không mở được qua file:// vì trình duyệt chặn ES module)
npm run check          # cú pháp + shell parity + test domain
npm run verify:flow    # e2e bấm UI qua cả chuỗi (Playwright, Edge/Chrome)
npm run verify:screens # so với ảnh -verified → tmp/verify/report.html
npm run build          # copy app/ → dist/ cho Netlify
```

Menu người dùng (góc phải): đổi vai trò demo (Admin, Kế toán, TPVH, NVVH, NV nguồn, Cổ đông), **Đặt lại dữ liệu demo**, bật/tắt chip **Cần xác nhận**. Thêm `?pending=off` vào URL để ẩn chip, `?today=YYYY-MM-DD` để đổi ngày demo (mặc định 24/09/2026).

## Luồng demo gợi ý

1. **Chủ nhà** → *Tạo từ HĐ chủ nhà* → *Dùng file mẫu tùng sói* (hoặc upload file `.doc` thật, trùng hash mở lại job LLX-001).
2. Chọn hướng xử lý 3 xung đột → *Commit* → HĐ đầu vào **HL-0031** (Nháp).
3. Bổ sung TK chủ nhà, ngày bắt đầu, người ký → *Bổ sung & kích hoạt* → lịch 20 kỳ × 342.000.000.
4. Tòa 25A Phú Diễn → *Lưu mã* PD25A → *Tạo phòng* (sinh 2×3 hoặc import `samples/phong_25A_PhuDien.csv`).
5. Phân công, chọn TK nhận → *Chuyển Đang khai thác*.

Tòa **G1** (15 phòng Đang thuê, số thật từ Seed Data) có sẵn để xem trạng thái vận hành.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `ui/shell.mjs` | Token, sidebar, topbar và helper giao diện. **Một nguồn** cho cả SPA lẫn ảnh mockup (`ui-imagegen-v1/_source` re-export file này). Chỉ sửa theo kiểu thêm; chạy `npm run check:parity` sau mỗi lần sửa |
| `core/domain/` | Logic nghiệp vụ thuần (không DOM), test bằng `node --test` ở `tests/domain/` |
| `core/` | store (transaction + rollback), router (hash, guard rời trang), auth (bảng quyền SRS/ASSUMED), seed |
| `screens/` | Mỗi file một màn SRS; `popups/` cho 02.4, 02.5, 04.3 và popup phụ |
| `data/` | Dữ liệu HĐ mẫu tùng sói và Seed G1 |

## Quy ước với điểm đỏ của SRS

- Hành vi SRS để đỏ **không bị bịa**: control vẫn hiển thị như capture, bấm vào mở popup *Chưa có đặc tả* kèm tham chiếu FR/Screen.
- Giá trị "dự kiến"/ASSUMED (điều kiện chuyển Đang khai thác, quyền chưa nêu, màn đích sau commit…) được làm nhưng gắn chip **Cần xác nhận**.
- Mã lỗi `E##` chưa có trong SRS → thông báo kèm "Mã lỗi: E## (SRS chưa chốt mã)".

## Ngoài phạm vi

Responsive < 1280px (spec §5.3), đọc XLSX (dùng CSV), lưu nội dung file (chỉ lưu metadata), các FR khác (menu dẫn tới trang "Chưa có trong đợt này").
