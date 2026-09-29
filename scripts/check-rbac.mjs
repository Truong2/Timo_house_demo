/* Kiểm tra tĩnh phân quyền & phạm vi Phase 1 dựa trên manifest route (core/routes.js) và ma trận quyền (domain/rbac-policy.js).
   node scripts/check-rbac.mjs  → exit 1 nếu có lỗi. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['core/format.js', 'domain/rbac-policy.js', 'core/routes.js', 'data/catalog.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'mockup/js', f), 'utf8'), ctx, { filename: f });
const TH = ctx.TH; const R = TH.calc.rbac; const { ROUTES, NAV, FOOT, PHASE1_UI } = TH.routes;
const errs = []; let checks = 0;
const expect = (cond, msg) => { checks++; if (!cond) errs.push(msg); };

/* 1. Mọi route có quyền hợp lệ và mốc 1A/1B */
ROUTES.forEach(r => { expect(r.perm && R.POLICY[r.perm], `route ${r.path}: quyền "${r.perm}" không có trong rbac-policy`); expect(['1A', '1B'].includes(r.ms), `route ${r.path}: thiếu mốc ms`); expect(/^UI-\d\d$/.test(r.ui), `route ${r.path}: mã UI sai`); });
expect(new Set(ROUTES.map(r => r.path)).size === ROUTES.length, 'trùng path trong manifest');

/* 2. Tập màn hình = đúng phạm vi Phase 1 (22 màn 1A + 6 màn 1B), không lẫn màn Phase 2/3 */
const uis = new Set(ROUTES.flatMap(r => [r.ui, ...(r.also || [])]));
expect(uis.size === PHASE1_UI.length && PHASE1_UI.every(u => uis.has(u)), `tập UI-ID khác phạm vi Phase 1: ${[...uis].sort().join(',')}`);
['UI-19', 'UI-20', 'UI-21', 'UI-22', 'UI-26', 'UI-31', 'UI-32', 'UI-33', 'UI-34', 'UI-35', 'UI-36', 'UI-40', 'UI-41', 'UI-42', 'UI-43', 'UI-44', 'UI-45', 'UI-46', 'UI-47'].forEach(u => expect(!uis.has(u), `${u} thuộc Phase 2/3 nhưng có route`));
const ms1B = new Set(ROUTES.filter(r => r.ms === '1B').map(r => r.ui));
['UI-16', 'UI-25', 'UI-27', 'UI-28', 'UI-29', 'UI-30'].forEach(u => expect(ms1B.has(u), `${u} phải thuộc mốc 1B`));

/* 3. Sidebar trỏ đúng route; không mục rỗng */
const routeOf = (href) => ROUTES.find(r => '#' + r.path === href.split('?')[0]);
const navItems = [...NAV.flatMap(n => n.items || [n]), ...FOOT];
navItems.forEach(n => expect(!!routeOf(n.href), `sidebar "${n.label}" trỏ tới route không tồn tại (${n.href})`));
const visibleNav = (role, ms) => navItems.filter(n => [n.href, ...(n.alts || [])].some(h => { const r = routeOf(h); return R.can(role, r.perm) && (r.ms === '1A' || ms === '1B'); })).map(n => n.key);
navItems.forEach(n => (n.alts || []).forEach(h => expect(!!routeOf(h), `sidebar "${n.label}" alt trỏ route không tồn tại (${h})`)));
const expected = {
  admin: { '1A': ['dashboard', 'buildings', 'tenants', 'billing', 'expenses', 'refunds', 'hr', 'zalo', 'import', 'settings'], '1B': ['dashboard', 'buildings', 'tenants', 'billing', 'expenses', 'refunds', 'reports', 'hr', 'zalo', 'import', 'settings'] },
  ketoan: { '1B': ['dashboard', 'buildings', 'tenants', 'billing', 'expenses', 'refunds', 'reports', 'hr', 'zalo', 'import', 'settings'] },
  vanhanh: { '1A': ['dashboard', 'buildings', 'tenants', 'billing', 'refunds'], '1B': ['dashboard', 'buildings', 'tenants', 'billing', 'refunds'] },
  leader: { '1B': ['dashboard', 'buildings', 'tenants', 'billing', 'hr'] },
  truongphong: { '1A': ['dashboard', 'buildings', 'tenants', 'billing', 'hr'], '1B': ['dashboard', 'buildings', 'tenants', 'billing', 'reports', 'hr'] },
};
Object.entries(expected).forEach(([role, byMs]) => Object.entries(byMs).forEach(([ms, keys]) => { const got = visibleNav(role, ms); expect(JSON.stringify(got) === JSON.stringify(keys), `sidebar ${role}@${ms}: ${got.join(',')} ≠ ${keys.join(',')}`); }));

/* 4. Quyền nhạy cảm chỉ admin/kế toán (CH-01, GĐ OQ-09) */
['payments.record', 'payments.reverse', 'debts.viewAmounts', 'customers.pii', 'hr.salary', 'payroll.manage', 'expenses.manage', 'allocation.manage', 'invoices.issue', 'owners.view'].forEach(p => expect(R.POLICY[p].every(r => ['admin', 'ketoan'].includes(r)), `quyền nhạy cảm ${p} lộ cho: ${R.POLICY[p].join(',')}`));
expect(R.POLICY['debts.viewStatus'].includes('leader') && R.POLICY['debts.viewStatus'].includes('vanhanh'), 'leader/vận hành phải xem được trạng thái nợ');
/* 5. Duyệt hoàn cọc kép: mỗi vai trò một quyền riêng */
expect(JSON.stringify(R.POLICY['refunds.approve.admin']) === '["admin"]' && JSON.stringify(R.POLICY['refunds.approve.ketoan']) === '["ketoan"]', 'duyệt hoàn cọc phải tách admin / kế toán');
/* 6. Cổ đông/nhân sự Phase 3 không có vai trò ở Phase 1 */
expect(!R.ROLES.codong && !R.ROLES.sale, 'vai trò Phase 2/3 không được xuất hiện ở Phase 1');
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
console.log(`✓ RBAC: ${checks} kiểm tra đạt · ${ROUTES.length} route · ${PHASE1_UI.length} màn Phase 1 · ${Object.keys(R.ROLES).length} vai trò`);
