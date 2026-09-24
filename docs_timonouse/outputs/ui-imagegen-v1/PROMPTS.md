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
| `00-timohouse-design-system.png` | Foundations, navigation, data display, forms, status, approval and accessibility board. |
| `UI-00-login.png` | Login with email/password, optional OTP, remember, forgot password and demo role. |
| `UI-07-contract-detail.png` | Contract detail with tenant, services, deposit, OPENING reading and approval checklist. |
| `UI-11-billing-period-preflight.png` | Billing-period lifecycle and preflight table for G1 09/2026. |
| `UI-13-payment-allocation.png` | Pending cash receipt, evidence and invoice allocation. |
| `UI-14-receivables-penalties.png` | Debt worklist with penalty/waiver drawer and accounting approval. |
| `UI-15-expiring-contracts.png` | Expiring-contract work queue with renewal/termination decision. |
| `UI-17-zalo-zns.png` | ZNS batch, recipient re-check, template preview, history and retry. |
| `UI-18-organization-structure.png` | Organization tree and selected-unit member detail. |
| `UI-19-employee-profile.png` | Employee detail with assignments, permissions and masked sensitive data. |
| `UI-21-collection-performance.png` | Employee × building collection performance; allow ratios above 100%. |
| `UI-22-payroll-review.png` | Payroll lifecycle, components, evidence and locking. |
| `UI-23-salary-payments.png` | Salary payment batch, approval, bank export/import and failed rows. |
| `UI-25-expense-salary-allocation.png` | Allocation source/result reconciliation and manual override reason. |
| `UI-29-shareholders-capital.png` | Ownership, capital ledger, distribution and visible 1.862.000 đ difference. |
| `UI-30-reporting-period-lock.png` | Pre-lock checklist, freeze list, lifecycle and blocking golden differences. |
| `UI-32-golden-reconciliation.png` | Per-metric reconciliation, evidence drawer and versioned metric definitions. |
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

