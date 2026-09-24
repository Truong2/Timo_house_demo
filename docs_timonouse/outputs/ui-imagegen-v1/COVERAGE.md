# Coverage matrix

Đủ file cho mọi UI ID; kết quả đối chiếu nội dung từng ảnh xem [`AUDIT.md`](AUDIT.md).

| UI | Màn hình | Ảnh chính |
|---|---|---|
| UI-00 | Đăng nhập | `09-quan-tri-he-thong/UI-00-login.png` |
| UI-01 | Dashboard & Work Queue | `01-tong-quan/UI-01-dashboard-work-queue.png` |
| UI-02 | Chủ nhà | `02-nguon-nha-toa-phong/UI-02-landlord-list-verified.png`, `02-nguon-nha-toa-phong/UI-02-landlord-detail-verified.png` |
| UI-03 | Hợp đồng đầu vào | `02-nguon-nha-toa-phong/UI-03-head-lease-extract-verified.png`, `02-nguon-nha-toa-phong/UI-03-head-lease-verified.png` |
| UI-04 | Tòa nhà | `02-nguon-nha-toa-phong/UI-04-building-verified.png` |
| UI-05 | Phòng | `02-nguon-nha-toa-phong/UI-05-rooms-create-verified.png` · danh sách/sơ đồ tầng: `02-nguon-nha-toa-phong/UI-05-rooms.png` (nháp) |
| UI-06 | Khách thuê | `03-khach-thue-hop-dong/UI-06-tenants.png` |
| UI-07 | Hợp đồng thuê | `03-khach-thue-hop-dong/UI-07-contract-detail.png` |
| UI-08 | OCR/Data Onboarding | `03-khach-thue-hop-dong/UI-08-ocr-onboarding.png` |
| UI-09 | Dịch vụ & bảng giá | `04-dich-vu-chi-so/UI-09-service-prices.png` |
| UI-10 | Điện nước & chỉ số | `04-dich-vu-chi-so/UI-10-meters-readings.png` |
| UI-11 | Kỳ hóa đơn | `05-hoa-don-thu-tien/UI-11-billing-period-preflight.png` |
| UI-12 | Hóa đơn | `05-hoa-don-thu-tien/UI-12-invoices.png` |
| UI-13 | Thu tiền | `05-hoa-don-thu-tien/UI-13-payment-allocation.png` |
| UI-14 | Công nợ & phạt | `05-hoa-don-thu-tien/UI-14-receivables-penalties.png` |
| UI-15 | HĐ sắp hết/Gia hạn/Kết thúc | `03-khach-thue-hop-dong/UI-15-expiring-contracts.png` |
| UI-16 | Cọc & hoàn cọc | `03-khach-thue-hop-dong/UI-16-deposits-refunds.png` |
| UI-17 | Zalo ZNS | `05-hoa-don-thu-tien/UI-17-zalo-zns.png` |
| UI-18 | Cơ cấu tổ chức | `07-nhan-su-luong/UI-18-organization-structure.png` |
| UI-19 | Nhân sự | `07-nhan-su-luong/UI-19-employee-profile.png` |
| UI-20 | Phân công tòa | `07-nhan-su-luong/UI-20-building-assignments.png` |
| UI-21 | Hiệu suất thu tiền | `07-nhan-su-luong/UI-21-collection-performance.png` |
| UI-22 | Bảng lương | `07-nhan-su-luong/UI-22-payroll-review.png` |
| UI-23 | Chi lương | `07-nhan-su-luong/UI-23-salary-payments.png` |
| UI-24 | Chi phí & Import | `06-chi-phi-dau-tu/UI-24-expenses-import.png` |
| UI-25 | Phân bổ chi phí/lương | `06-chi-phi-dau-tu/UI-25-expense-salary-allocation.png` |
| UI-26 | Hoa hồng | `06-chi-phi-dau-tu/UI-26-commissions-verified.png` |
| UI-27 | Tài sản & khấu hao | `02-nguon-nha-toa-phong/UI-27-handover-assets-verified.png` · tài sản công ty & khấu hao: `02-nguon-nha-toa-phong/UI-27-assets-depreciation.png` (nháp, không đạt) |
| UI-28 | Tiền thuê nhà/Trả trước | `06-chi-phi-dau-tu/UI-28-head-lease-prepayments.png` |
| UI-29 | Cổ đông/Cổ phần/Góp vốn | `06-chi-phi-dau-tu/UI-29-shareholders-capital.png` |
| UI-30 | Kỳ báo cáo & khóa kỳ | `08-bao-cao-doi-soat/UI-30-reporting-period-lock.png` |
| UI-31 | Report A/B và CF/AC | `08-bao-cao-doi-soat/UI-31-financial-reports-verified.png` |
| UI-32 | Đối soát & Golden | `08-bao-cao-doi-soat/UI-32-golden-reconciliation.png` |
| UI-33 | User, quyền, tham số, jobs, audit | `09-quan-tri-he-thong/UI-33-settings-permissions-audit.png` |

## Functional flows

| Flow | Ảnh |
|---|---|
| F-01 OCR → hợp đồng | `flows/F-01-ocr-contract-flow.png` |
| F-02 Chỉ số → hóa đơn | `flows/F-02-meter-invoice-flow.png` |
| F-03 Thu tiền → công nợ/phạt | `flows/F-03-payment-debt-penalty-flow.png` |
| F-04 Gia hạn/kết thúc | `flows/F-04-renewal-termination-flow.png` |
| F-05 Hiệu suất → lương → chi | `flows/F-05-performance-payroll-flow.png` |
| F-06 Chi phí → khóa báo cáo | `flows/F-06-expense-report-lock-flow.png` |
| F-07 Góp vốn → phân phối | `flows/F-07-capital-distribution-flow.png` |
| F-08 Thay đổi quản lý tòa | `flows/F-08-assignment-scope-flow.png` |

## Shared references

- `responsive/R-01-dashboard-breakpoints.png`
- `responsive/R-02-list-table-breakpoints.png`
- `responsive/R-03-detail-wizard-breakpoints.png`
- `responsive/R-04-report-breakpoints.png`
- `states/S-01-data-permission-lock.png`
- `states/S-02-forms-approval.png`

