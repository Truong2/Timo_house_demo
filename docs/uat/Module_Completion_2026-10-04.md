# Nghiệm thu bổ sung chức năng theo audit ngày 04/10/2026

Đối chiếu: `docs/TimoHouse_Live_Audit_vs_Source_Workbook_2026-10-04.md` và workbook nguồn. Tài liệu này ghi chức năng đã bổ sung trong source hiện tại. Kết quả trình duyệt bên dưới chạy trên localhost; chưa phải nghiệm thu bản Netlify sau triển khai.

| Mục audit | Chức năng bổ sung / kiểm chứng | Route và bằng chứng |
|---|---|---|
| P0 — Hợp đồng → biểu phí | Sau review/confirm, lưu giá theo ngày hiệu lực, liên kết file hợp đồng, phiên hợp đồng và nguồn trường. OCR áp giá giữ file/session nguồn. Hóa đơn phát hành chụp cả dòng tiền và phiên biểu phí riêng. | `/tenants/intake`, `/stays/:id?tab=dich-vu-gia`, `/ocr/:id`; `tests/intake.test.mjs`, `tests/p2-shares-docs.test.mjs`, `tests/v5-gaps.test.mjs`; `output/module-completion/intake.log` |
| P0 — Billing/report | Kiểm tra số đầu ra, nguồn dữ liệu, snapshot mẫu in/tài khoản/biểu phí, khóa và điều chỉnh. Sửa báo cáo để chỉ lấy phiên lương hiện hành, tránh cộng phiên đã bị thay thế. | `/billing`, `/reports/total`; bộ test hồi quy, `output/module-completion/ui-audit.log` |
| P0 — Phiên lương, duyệt, chốt, chi | Tính lại giữ phiên cũ; số phiên tăng và ID không tái sử dụng. Tab phiên cho xem snapshot. Có duyệt toàn bảng trước chốt kỳ Web; chặn duyệt/chốt khi nguồn đổi. Chặn chốt lặp, giữ nghĩa vụ chi và giao dịch chi hiện có. | `/hr/payroll?period=2026-09&tab=phien`; `tests/module-completion.test.mjs`, `output/module-completion/verification.json` |
| P1 — Chủ nhà | Sửa hồ sơ cá nhân/địa chỉ/ngân hàng với lý do, nguồn và phiên hồ sơ. Bổ sung sửa cọc, ngày hết hợp đồng, thời gian giữ giá, PCCC; hiển thị người nhập/nguồn và đường dẫn pháp lý/sổ đỏ. Sửa một trường không xóa thông tin bên khai thác. | `/owner-profiles/:id`, `/owners/:id`; test và ảnh `output/module-completion/` |
| P1 — Khách hàng | Quản lý danh sách nhiều xe: thêm, sửa, xóa, loại xe, biển số, ghi chú; chặn biển số trùng. Sửa hồ sơ chung giữ danh sách xe. Tạm trú có trạng thái, địa chỉ, ngày và số tham chiếu. Giữ luồng gia hạn và lịch sử phiên hợp đồng. | `/stays/:id?tab=nguoi-thue`; kiểm tra lưu qua reload và xóa xe trên Chrome |
| P1 — Hoàn cọc | Kiểm tra dòng khấu trừ, điện/nước cuối, tiền phòng cuối, số hoàn, dấu vết và khóa; sử dụng luồng chi tiết đã có. | `/refunds/:id`; fixture số tiền và UI readback trong bộ hồi quy/UI audit |
| P1 — Cổ đông | Lưu snapshot toàn bộ tỷ lệ theo phiên, thời điểm hiệu lực, người và căn cứ sửa. Bảng chia khóa giữ snapshot tỷ lệ sở hữu. Hiển thị các phiên sở hữu; kiểm tra đổi tỷ lệ sau không sửa bảng chia cũ. Lịch góp/chi, tài sản/cọc dùng module đã có. | `/shares`, `/shares/:buildingId`, `/shares/capital`; `tests/module-completion.test.mjs`, `tests/p2-shares-docs.test.mjs` |
| P1 — Bảo dưỡng / décor | Điều hướng riêng thang máy, máy bơm, máy giặt/vệ sinh, máy lọc nước; liên kết kiểm kê décor. Bộ lọc loại tài sản áp vào bảng và xuất chênh, giữ bộ lọc khi đổi tòa. | `/assets/maintenance?type=pump`, `/assets/inventory?type=decor`; ảnh 375/768/1440px |
| P1 — Kinh doanh | Thêm STT ở hàng, giao dịch và hoa hồng; STT trong CSV giao dịch. Kiểm tra các trường giao dịch, quản lý, nguồn khách, cọc/thanh toán, kỳ thuê, sale và hoa hồng. | `/sales`, `/sales/deals`, `/sales/commission`; 66 checks của `verify-source-workbook-live.mjs`, CSV và browser mới |
| P1 — Nhân sự tòa nhà | Hiển thị trưởng nhóm, vận hành, vệ sinh, kỹ thuật theo phân công hiệu lực; thao tác phân công ngay từ chi tiết tòa. Hiển thị ngày nhận và thời gian vận hành. | `/buildings/:id?tab=nhan-su`; test ngày hiệu lực và thao tác phân công vệ sinh trên Chrome |
| P2 — Quyền, audit, responsive | Actions kiểm tra quyền/phạm vi; thay đổi có người, nguồn, lý do và lịch sử. Kiểm tra UI 375/768/1440px, lưu lại qua reload; bộ audit cũ kiểm tra accessibility và đầu ra in/xuất. | `output/module-completion/verification.json`, `output/module-completion/ui-audit.log` |
| UI Netlify | Chừa 88px cộng safe-area dưới nội dung, sidebar, drawer, modal, intake, bản in trên màn hình; nâng toast và vùng cuộn để tránh badge đè. | CSS dùng chung; ảnh `output/netlify-spacing/` |

## Chạy lại

Kết quả trên source sau sửa: **340/340 test**, **66 checks** nguồn workbook, **225 checks** UI/in/xuất và các kịch bản module mới đều PASS. Hai PDF hợp đồng, ảnh OCR và Excel gốc đã chạy thật trên Chrome. Build kiểm tra 112 file JavaScript và hoàn thành.

```powershell
npm.cmd run check
npm.cmd run verify:module-completion
node scripts/verify-source-workbook-live.mjs
node scripts/verify-ui-audit.mjs
# verify-intake cần server ở localhost:8765:
node scripts/verify-intake.mjs
npm.cmd run build
```

Nguồn chưa có biển số, chứng từ PCCC/sổ đỏ, ngày giữ giá hoặc giá trị tài sản cần nhập hồ sơ thực tế qua các chức năng trên. Năm bộ phận có chính sách lương theo ngày hiệu lực; không tự đặt công thức lương mới khi workbook chỉ nêu tên bộ phận. Kỳ lịch sử Excel tiếp tục được nhận diện riêng.

Repo hiện lưu trạng thái trình duyệt bằng localStorage và file/nháp bằng IndexedDB. Các kiểm tra trên chứng minh chức năng của SPA; việc chuyển dữ liệu lên backend dùng chung và nghiệm thu nhiều người cập nhật là phạm vi triển khai riêng.
