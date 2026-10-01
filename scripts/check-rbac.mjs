/* Kiểm tra tĩnh phân quyền & phạm vi Phase 1 + Phase 2 dựa trên manifest route (core/routes.js) và ma trận quyền (domain/rbac-policy.js).
   node scripts/check-rbac.mjs  → exit 1 nếu có lỗi. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['core/format.js', 'domain/rbac-policy.js', 'core/routes.js', 'data/catalog.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'mockup/js', f), 'utf8'), ctx, { filename: f });
const TH = ctx.TH; const R = TH.calc.rbac; const { ROUTES, NAV, FOOT, PHASE1_UI, PHASE2_UI } = TH.routes;
const MS_ORDER = ['1A', '1B', '2']; const msOn = (cur, ms) => MS_ORDER.indexOf(cur) >= MS_ORDER.indexOf(ms);
const errs = []; let checks = 0;
const expect = (cond, msg) => { checks++; if (!cond) errs.push(msg); };

/* 1. Mọi route có quyền hợp lệ và mốc 1A/1B/2 */
ROUTES.forEach(r => { expect(r.perm && R.POLICY[r.perm], `route ${r.path}: quyền "${r.perm}" không có trong rbac-policy`); expect(MS_ORDER.includes(r.ms), `route ${r.path}: thiếu mốc ms`); expect(/^UI-\d\d$/.test(r.ui), `route ${r.path}: mã UI sai`); });
expect(new Set(ROUTES.map(r => r.path)).size === ROUTES.length, 'trùng path trong manifest');

/* 2. Tập màn hình = đúng phạm vi Phase 1 (22 màn 1A + 6 màn 1B) + Phase 2 (13 màn), không lẫn màn Phase 3; màn Phase 1 không nằm sau mốc 2 */
const uis = new Set(ROUTES.flatMap(r => [r.ui, ...(r.also || [])]));
const scope = [...PHASE1_UI, ...PHASE2_UI];
expect(uis.size === scope.length && scope.every(u => uis.has(u)), `tập UI-ID khác phạm vi Phase 1 + 2: ${[...uis].sort().join(',')}`);
['UI-33', 'UI-34', 'UI-35', 'UI-36', 'UI-40', 'UI-41'].forEach(u => expect(!uis.has(u), `${u} thuộc Phase 3 nhưng có route`));
PHASE2_UI.forEach(u => expect(ROUTES.filter(r => r.ui === u).every(r => r.ms === '2'), `${u} phải thuộc mốc 2`));
PHASE1_UI.forEach(u => expect(ROUTES.filter(r => r.ui === u || (r.also || []).includes(u)).some(r => r.ms !== '2'), `${u} (Phase 1) không được chỉ có route mốc 2`));
const ms1B = new Set(ROUTES.filter(r => r.ms === '1B').map(r => r.ui));
['UI-16', 'UI-25', 'UI-27', 'UI-28', 'UI-29', 'UI-30'].forEach(u => expect(ms1B.has(u), `${u} phải thuộc mốc 1B`));

/* 3. Sidebar trỏ đúng route; không mục rỗng */
const routeOf = (href) => ROUTES.find(r => '#' + r.path === href.split('?')[0]);
const navItems = [...NAV.flatMap(n => n.items || [n]), ...FOOT];
navItems.forEach(n => expect(!!routeOf(n.href), `sidebar "${n.label}" trỏ tới route không tồn tại (${n.href})`));
const visibleNav = (role, ms) => navItems.filter(n => [n.href, ...(n.alts || [])].some(h => { const r = routeOf(h); return R.can(role, r.perm) && msOn(ms, r.ms); })).map(n => n.key);
navItems.forEach(n => (n.alts || []).forEach(h => expect(!!routeOf(h), `sidebar "${n.label}" alt trỏ route không tồn tại (${h})`)));
const P2FULL = ['dashboard', 'owners', 'buildings', 'tenants', 'repairs', 'documents', 'sales', 'leads', 'deals', 'commission', 'billing', 'expenses', 'refunds', 'shares', 'reports', 'hr', 'zalo', 'import', 'settings'];
const expected = {
  admin: { '1A': ['dashboard', 'owners', 'buildings', 'tenants', 'billing', 'expenses', 'refunds', 'hr', 'zalo', 'import', 'settings'], '1B': ['dashboard', 'owners', 'buildings', 'tenants', 'billing', 'expenses', 'refunds', 'reports', 'hr', 'zalo', 'import', 'settings'], '2': P2FULL },
  ketoan: { '1B': ['dashboard', 'owners', 'buildings', 'tenants', 'billing', 'expenses', 'refunds', 'reports', 'hr', 'zalo', 'import', 'settings'], '2': P2FULL },
  vanhanh: { '1A': ['dashboard', 'buildings', 'tenants', 'billing', 'refunds'], '1B': ['dashboard', 'buildings', 'tenants', 'billing', 'refunds'], '2': ['dashboard', 'buildings', 'tenants', 'repairs', 'documents', 'billing', 'refunds'] },
  leader: { '1B': ['dashboard', 'buildings', 'tenants', 'billing', 'hr'], '2': ['dashboard', 'buildings', 'tenants', 'documents', 'billing', 'hr'] },
  truongphong: { '1A': ['dashboard', 'buildings', 'tenants', 'billing', 'hr'], '1B': ['dashboard', 'buildings', 'tenants', 'billing', 'reports', 'hr'], '2': ['dashboard', 'buildings', 'tenants', 'repairs', 'documents', 'sales', 'leads', 'deals', 'billing', 'reports', 'hr', 'zalo'] },
  truongkd: { '2': ['dashboard', 'buildings', 'sales', 'leads', 'deals'] },
  sale: { '2': ['dashboard', 'buildings', 'sales', 'leads', 'deals'] },
  kythuat: { '2': ['dashboard', 'buildings', 'repairs'] },
};
Object.entries(expected).forEach(([role, byMs]) => Object.entries(byMs).forEach(([ms, keys]) => { const got = visibleNav(role, ms); expect(JSON.stringify(got) === JSON.stringify(keys), `sidebar ${role}@${ms}: ${got.join(',')} ≠ ${keys.join(',')}`); }));

/* 4. Quyền nhạy cảm chỉ admin/kế toán (CH-01, GĐ OQ-09); Phase 2: hoa hồng, chia cổ đông, áp OCR vào biểu phí, xác nhận sổ sửa chữa */
['payments.record', 'payments.reverse', 'debts.viewAmounts', 'customers.pii', 'hr.salary', 'payroll.manage', 'expenses.manage', 'allocation.manage', 'invoices.issue', 'owners.view',
  'commission.view', 'commission.approve', 'commission.pay', 'shares.view', 'shares.lock', 'rates.manage', 'repairs.confirm'].forEach(p => expect(R.POLICY[p].every(r => ['admin', 'ketoan'].includes(r)), `quyền nhạy cảm ${p} lộ cho: ${R.POLICY[p].join(',')}`));
expect(R.POLICY['debts.viewStatus'].includes('leader') && R.POLICY['debts.viewStatus'].includes('vanhanh'), 'leader/vận hành phải xem được trạng thái nợ');
/* 5. Duyệt hoàn cọc kép: mỗi vai trò một quyền riêng */
expect(JSON.stringify(R.POLICY['refunds.approve.admin']) === '["admin"]' && JSON.stringify(R.POLICY['refunds.approve.ketoan']) === '["ketoan"]', 'duyệt hoàn cọc phải tách admin / kế toán');
/* 6. Vai trò cổ đông là Phase 3; vai trò sale/kỹ thuật gắn mốc Phase 2 */
expect(!R.ROLES.codong, 'vai trò cổ đông (Phase 3) không được xuất hiện');
expect(['sale', 'kythuat', 'truongkd'].every(k => R.ROLES[k] && R.ROLES[k].phase === '2'), 'vai trò sale / kỹ thuật / trưởng nhóm KD phải gắn mốc 2');
expect(TH.data.catalog.users.filter(u => R.ROLES[u.role] && R.ROLES[u.role].phase).every(u => u.phase === R.ROLES[u.role].phase), 'tài khoản demo vai trò Phase 2 phải gắn mốc (ẩn ở 1A/1B)');
['sales.view', 'deals.close'].forEach(p => expect(!R.can('leader', p), `leader vận hành (TNVH) không có quyền ${p} – thuộc trưởng nhóm KD`));
expect(R.can('truongphong', 'zalo.inbox') && !R.can('truongphong', 'zalo.view'), 'trưởng phòng: hộp thư phản hồi qua /zalo/inbox, không xem đợt gửi');
// D4 [GĐ]: trưởng phòng vận hành chỉ xem kinh doanh (toàn bộ), không tạo lead / chốt / hủy giao dịch
expect(R.can('truongphong', 'sales.view') && R.ROLES.truongphong.sales === 'all', 'trưởng phòng: xem kinh doanh toàn bộ');
['sales.manage', 'deals.close', 'deals.cancel'].forEach(p => expect(!R.can('truongphong', p), `trưởng phòng vận hành không có quyền ${p}`));
/* 6b. Sale chỉ thấy lead/deal của mình, không thấy hoa hồng, tiền thu, SĐT/CCCD đầy đủ; kỹ thuật không thấy tiền thu, hóa đơn, công nợ */
expect(R.ROLES.sale.sales === 'own', 'sale phải có phạm vi kinh doanh "own"');
['commission.view', 'payments.view', 'debts.viewStatus', 'debts.viewAmounts', 'customers.pii', 'invoices.view', 'reports.view', 'tenants.view'].forEach(p => expect(!R.can('sale', p), `sale không được có quyền ${p}`));
['payments.view', 'invoices.view', 'debts.viewStatus', 'debts.viewAmounts', 'repairs.money', 'repairs.confirm', 'reports.view', 'tenants.view', 'sales.view'].forEach(p => expect(!R.can('kythuat', p), `kỹ thuật không được có quyền ${p}`));
expect(R.can('kythuat', 'repairs.enter') && R.can('sale', 'deals.close'), 'kỹ thuật nhập sổ sửa chữa, sale chốt deal');
// E1 [GĐ-E1]: sale / kỹ thuật tải tài liệu trong phạm vi hẹp (HĐ khách của deal mình / biên bản, ảnh chỉ số tòa có việc) – không mở kho tài liệu
['sale', 'kythuat'].forEach(r => expect(R.can(r, 'documents.download') && !R.can(r, 'documents.view') && !R.can(r, 'documents.upload'), `${r}: chỉ quyền tải tài liệu, không xem / tải lên kho`));
/* 6c. Mở lại kỳ đã khóa (UI-38 nâng cao): cần cả admin và kế toán – hai quyền tách riêng */
expect(JSON.stringify(R.POLICY['periods.reopen.admin']) === '["admin"]' && JSON.stringify(R.POLICY['periods.reopen.ketoan']) === '["ketoan"]', 'mở lại kỳ phải tách duyệt admin / kế toán');
/* 7. Trưởng phòng xem báo cáo (CH-23), không xuất */
expect(R.can('truongphong', 'reports.view') && !R.can('truongphong', 'reports.export'), 'trưởng phòng: xem báo cáo, không xuất');
/* 8. Mọi quyền được dùng ở trang tồn tại trong policy */
const pageDir = path.join(ROOT, 'mockup/js/pages');
fs.readdirSync(pageDir).forEach(f => { const src = fs.readFileSync(path.join(pageDir, f), 'utf8'); for (const m of src.matchAll(/perm: '([a-zA-Z.]+)'/g)) expect(!!R.POLICY[m[1]], `${f}: quyền "${m[1]}" không có trong policy`); });
/* 9. Tab có quyền phải chặn cả khi mở thẳng bằng ?tab= (K.pickTab), không chỉ ẩn nút tab */
fs.readdirSync(pageDir).forEach(f => { const src = fs.readFileSync(path.join(pageDir, f), 'utf8'); if (/\{ key: '[^']+', label: '[^']+', perm: '/.test(src)) expect(src.includes('K.pickTab('), `${f}: có tab gắn quyền nhưng không dùng K.pickTab – mở ?tab= sẽ lộ nội dung`); });
/* 10. Trang theo :id của dữ liệu theo tòa (hóa đơn, phiếu hoàn, lượt thuê, tòa – kể cả bản in) phải kiểm phạm vi tòa */
const SCOPED = /^\/(?:print\/)?(?:invoice|billing\/invoices|refund|refunds|stays|buildings)\/:id$/; let scopedRoutes = 0;
fs.readdirSync(pageDir).forEach(f => { fs.readFileSync(path.join(pageDir, f), 'utf8').split("TH.router.handle('").slice(1).forEach(chunk => { const route = chunk.slice(0, chunk.indexOf("'")); if (!SCOPED.test(route)) return; scopedRoutes++; expect(/inScope\(/.test(chunk.slice(0, 900)), `${f}: route ${route} không kiểm phạm vi tòa (inScope)`); }); });
expect(scopedRoutes === 6, `kỳ vọng 6 route :id theo tòa, tìm thấy ${scopedRoutes}`);

/* 11. Phân công theo phòng (UI-24): phạm vi phòng áp trong Q.scoped – người được giao phòng không thấy phòng khác cùng tòa; các danh sách theo phòng phải đi qua Q.scoped */
const qSrc = fs.readFileSync(path.join(ROOT, 'mockup/js/services/q.js'), 'utf8'), authSrc = fs.readFileSync(path.join(ROOT, 'mockup/js/core/auth.js'), 'utf8');
expect(/Q\.scoped = [\s\S]{0,600}?roomScope\(/.test(qSrc), 'q.js: Q.scoped không áp phạm vi phòng (auth.roomScope)');
expect(/A\.inScopeRoom = /.test(authSrc) && /A\.roomScope = /.test(authSrc), 'auth.js: thiếu roomScope / inScopeRoom');
['billing-invoices.js', 'billing-debts.js', 'tenants.js', 'refunds.js', 'billing-receipts.js'].forEach(f => expect(fs.readFileSync(path.join(pageDir, f), 'utf8').includes('Q.scoped('), `${f}: danh sách theo phòng không dùng Q.scoped – phân công theo phòng bị lộ`));

if (errs.length) { console.error(`✗ RBAC: ${errs.length}/${checks} kiểm tra lỗi\n - ` + errs.join('\n - ')); process.exit(1); }
console.log(`✓ RBAC: ${checks} kiểm tra đạt · ${ROUTES.length} route · ${PHASE1_UI.length} màn Phase 1 + ${PHASE2_UI.length} màn Phase 2 · ${Object.keys(R.ROLES).length} vai trò`);
