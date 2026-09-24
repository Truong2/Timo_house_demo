# ImageGen prompt set

## Base prompt applied to every asset

```text
Use case: ui-mockup
Asset type: TimoHouse Vietnamese enterprise property-rental operations UI
Style: clean Swiss/minimal enterprise SaaS, data-dense but readable, straight-on screenshot
Palette: #1E40AF primary, #3B82F6 secondary, #122F5B sidebar,
#F8FAFC background, #0F172A text, #CBD5E1 border,
#15803D success, #B45309 warning, #DC2626 danger
Typography: Fira Sans-like Vietnamese-safe sans serif; tabular financial figures
Icons: Lucide-style outline, consistent size and stroke
Constraints: match the reference screenshots; one primary CTA; status uses icon + text;
no gradients, photos, emoji, glassmorphism or watermark; preserve Vietnamese diacritics
```

## Per-asset primary requests

| Asset | Primary request |
|---|---|
| `00-design-system/00-timohouse-design-system.png` | Foundations, navigation, data display, forms, status, approval and accessibility board. |
| `09-quan-tri-he-thong/UI-00-login.png` | Login with email/password, optional OTP, remember, forgot password and demo role. |
| `03-khach-thue-hop-dong/UI-07-contract-detail.png` | Contract detail with tenant, services, deposit, OPENING reading and approval checklist. |
| `05-hoa-don-thu-tien/UI-11-billing-period-preflight.png` | Billing-period lifecycle and preflight table for G1 09/2026. |
| `05-hoa-don-thu-tien/UI-13-payment-allocation.png` | Pending cash receipt, evidence and invoice allocation. |
| `05-hoa-don-thu-tien/UI-14-receivables-penalties.png` | Debt worklist with penalty/waiver drawer and accounting approval. |
| `03-khach-thue-hop-dong/UI-15-expiring-contracts.png` | Expiring-contract work queue with renewal/termination decision. |
| `05-hoa-don-thu-tien/UI-17-zalo-zns.png` | ZNS batch, recipient re-check, template preview, history and retry. |
| `07-nhan-su-luong/UI-18-organization-structure.png` | Organization tree and selected-unit member detail. |
| `07-nhan-su-luong/UI-19-employee-profile.png` | Employee detail with assignments, permissions and masked sensitive data. |
| `07-nhan-su-luong/UI-21-collection-performance.png` | Employee × building collection performance; allow ratios above 100%. |
| `07-nhan-su-luong/UI-22-payroll-review.png` | Payroll lifecycle, components, evidence and locking. |
| `07-nhan-su-luong/UI-23-salary-payments.png` | Salary payment batch, approval, bank export/import and failed rows. |
| `06-chi-phi-dau-tu/UI-25-expense-salary-allocation.png` | Allocation source/result reconciliation and manual override reason. |
| `06-chi-phi-dau-tu/UI-29-shareholders-capital.png` | Ownership, capital ledger, distribution and visible 1.862.000 đ difference. |
| `08-bao-cao-doi-soat/UI-30-reporting-period-lock.png` | Pre-lock checklist, freeze list, lifecycle and blocking golden differences. |
| `08-bao-cao-doi-soat/UI-32-golden-reconciliation.png` | Per-metric reconciliation, evidence drawer and versioned metric definitions. |
| `flows/F-01-ocr-contract-flow.png` | OCR upload → candidate → review → conflict → commit → approve → activate; idempotent retry. |
| `flows/F-02-meter-invoice-flow.png` | Old/new meter lineage → validate → preflight → draft → publish → ZNS. |
| `flows/F-03-payment-debt-penalty-flow.png` | Payment → matching → cash confirmation → allocation → debt → penalty. |
| `flows/F-04-renewal-termination-flow.png` | Renewal branch and termination/refund/room-ready branch. |
| `flows/F-05-performance-payroll-flow.png` | Milestones → provisional performance → snapshot → review → lock → pay. |
| `flows/F-06-expense-report-lock-flow.png` | Expense import → confirm → allocate → review → reconcile → lock/report. |
| `flows/F-07-capital-distribution-flow.png` | Head-lease obligation → capital ledger → AC profit → distribution → approval/payment. |
| `flows/F-08-assignment-scope-flow.png` | Assignment → overlap check → approval → dated activation → scope/payroll snapshot. |
| `responsive/R-01-dashboard-breakpoints.png` | Dashboard at 1440/1024/768/375. |
| `responsive/R-02-list-table-breakpoints.png` | Table → simplified table → card-list conversion. |
| `responsive/R-03-detail-wizard-breakpoints.png` | Two-column wizard → one-column → mobile sticky actions. |
| `responsive/R-04-report-breakpoints.png` | Financial report → stacked accordions → metric cards. |
| `states/S-01-data-permission-lock.png` | Populated, empty, loading, error, permission, disabled, read-only and locked states. |
| `states/S-02-forms-approval.png` | Normal/error forms, Error Summary, autosave, loading, approve, return and reopen modals. |

## Màn bổ sung từ wireframe specification 1.6 (24/09/2026)

**Chế độ:** built-in `image_gen`, một lần gọi riêng cho mỗi màn. **Ảnh tham chiếu phong cách:** `03-khach-thue-hop-dong/UI-07-contract-detail.png`; nội dung UI-07 không được giữ lại. Mỗi prompt ghép các phần sau:

```text
Use case: ui-mockup.
Asset: NEW 1440px desktop TimoHouse screenshot <UI ID và tiêu đề>.
Attached image is STYLE REFERENCE ONLY: reproduce its navy sidebar, topbar,
spacing, white card, tab, table, button, field and badge design.
Replace its content with this new page.
Color tokens #1E40AF #3B82F6 #122F5B #F8FAFC #0F172A #CBD5E1.
Fira Sans-like Vietnamese typography, Lucide outline icons, compact clean enterprise UI.
No gradients, photos, emoji, watermark.
Source wireframe dictates layout, hierarchy, exact visible labels, codes and any numbers.
Render clean empty form fields where blank; do not invent financial amounts or personal data.
One primary CTA. Ensure correct Vietnamese diacritics.
<Khối wireframe đầu tiên trong mục ### UI-xx của TimoHouse_UI_Mockup_Spec_v1.0.md>
```

| UI ID | Ảnh đầu ra | Nội dung wireframe nguồn |
|---|---|---|
| UI-02 | `02-nguon-nha-toa-phong/UI-02-landlord.png` | Chủ nhà, Bên A, hai tòa, thanh toán, hồ sơ |
| UI-03 | `02-nguon-nha-toa-phong/UI-03-head-lease.png` | HĐ đầu vào, điều khoản, lịch đóng tiền, phân bổ |
| UI-04 | `02-nguon-nha-toa-phong/UI-04-building.png` | Hồ sơ tòa, phân loại, công tơ, tài liệu pháp lý |
| UI-05 | `02-nguon-nha-toa-phong/UI-05-rooms.png` | Danh sách phòng, sơ đồ tầng, chi tiết phòng |
| UI-06 | `03-khach-thue-hop-dong/UI-06-tenants.png` | Hồ sơ khách, người ở cùng, xe, vòng đời |
| UI-08 | `03-khach-thue-hop-dong/UI-08-ocr-onboarding.png` | OCR hợp đồng, review, xung đột, commit |
| UI-09 | `04-dich-vu-chi-so/UI-09-service-prices.png` | Dịch vụ và bảng giá theo tòa |
| UI-10 | `04-dich-vu-chi-so/UI-10-meters-readings.png` | Công tơ, chỉ số, lineage |
| UI-12 | `05-hoa-don-thu-tien/UI-12-invoices.png` | Hóa đơn kỳ 09/2026 và điện chung |
| UI-16 | `03-khach-thue-hop-dong/UI-16-deposits-refunds.png` | Cọc, quyết toán, hoàn cọc |
| UI-20 | `07-nhan-su-luong/UI-20-building-assignments.png` | Phân công tòa theo hiệu lực |
| UI-24 | `06-chi-phi-dau-tu/UI-24-expenses-import.png` | Chi phí và import chứng từ |
| UI-26 | `06-chi-phi-dau-tu/UI-26-commissions.png` | Hoa hồng theo phòng/kỳ; **bản nháp ImageGen có phép tính lệch, không dùng nghiệm thu** |
| UI-27 | `02-nguon-nha-toa-phong/UI-27-assets-depreciation.png` | Tài sản và khấu hao |
| UI-28 | `06-chi-phi-dau-tu/UI-28-head-lease-prepayments.png` | Tiền thuê nhà đầu vào và trả trước |
| UI-31 | `08-bao-cao-doi-soat/UI-31-financial-reports.png` | Report A/B; **bản nháp ImageGen có số cũ, không dùng nghiệm thu** |
| UI-33 | `09-quan-tri-he-thong/UI-33-settings-permissions-audit.png` | User/quyền, tham số, import job, audit |

UI-01 và bản chính UI-26, UI-31 `verified` được dựng từ `_source/screens/` bằng `render.mjs`, với số từ `TimoHouse_Mockup_Seed_Data_v1.0.md` §10, §11, §13–14.

