# UI Audit v4 – Gap matrix và bằng chứng triển khai

Nguồn chuẩn: `docs/TimoHouse_UI_Audit_Report_v4_Live_Reaudit.md`. Các nhận định v2/v3 lỗi thời không dùng để đóng gap.

| Nhóm gap v4 | Trạng thái triển khai | Cách nghiệm thu |
|---|---|---|
| Shared states, form errors, focus, tab/table ARIA, skip-link, dropzone | Đã bổ sung UI dùng chung | `npm run verify:ui-audit` |
| Responsive 375/768/1024/1440 và bảng cuộn trong container | Đã bổ sung và chạy browser regression | 4 screenshot trong `output/ui-audit/latest` |
| Report preview/export chung dòng 3–61 và metadata chính sách | Đã bổ sung `TH.qr.exportModel` + SpreadsheetML report style | unit test + `verify:p0` |
| Invoice 12/13 dòng, 4 template, PDF A4 | Đã khóa template version; print engine trình duyệt | PDF evidence trong `output/ui-audit/latest` |
| Payroll M5/M10/M15 → M1/M2/M3 → T/K/HS/V/W và nguồn | Đã bổ sung drill-down, link hóa đơn/phiếu thu, trạng thái thiếu HS<70 | `check`, `verify:p0`, browser audit |
| Registry Hợp đồng UI-48 và 7 view | Đã bổ sung route `/contracts`, dùng `stays` | unit + sweep + browser audit |
| 11 tab chi tiết hợp đồng, xe/tạm trú, timeline | Đã bổ sung URL-persisted tabs và fallback dữ liệu lịch sử | browser audit |
| Phiên hợp đồng bất biến | Đã thêm `stayVersions` v1 và snapshot cho create/sign/OCR/rate/renew/transfer/end | unit + action regression |
| Aging 1–30…181+, cùng debtBasis, không lộ tiền | Đã dùng `Q.debtAging`, UI/export cùng tập lọc | boundary unit + RBAC regression |
| Truy vết hoàn cọc | Đã thêm lý do/người nhập/nguồn và drawer từng khoản | refund tests + browser sweep |
| Tòa nhà, chi chủ nhà và dịch vụ đầu vào | Đã bổ sung người thay đổi phân công, lần chi/phương thức/người ghi/chứng từ/audit, hiệu lực mã HĐ và hồ sơ PCCC/sổ đỏ | `verify:p1r`, `sweep` |
| Chi phí, cổ đông và sales/commission | Đã bổ sung drawer taxonomy/phân bổ/liên kết báo cáo, lịch sử cổ đông tổng hợp và drawer nguồn từng trường hoa hồng | `verify:p2`, `verify:p2:fixes`, `verify:p3` |

Không thay golden fixture hoặc snapshot kỳ khóa. File re-audit gốc được giữ nguyên.
