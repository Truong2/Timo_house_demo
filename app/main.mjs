// Khởi động SPA: CSS shell → store → shell DOM → route → delegation → router.
import { CSS } from './ui/shell.mjs';
import * as store from './core/store.mjs';
import * as router from './core/router.mjs';
import * as dom from './ui/dom.mjs';
import * as shellDom from './ui/shell-dom.mjs';
import { toast } from './ui/toast.mjs';
import { can, registerPerms } from './core/auth.mjs';
import { registerChips } from './ui/controls.mjs';
import { handleApproval } from './ui/approval.mjs';
import { placeholder, forbidden } from './screens/placeholder.mjs';
import * as source from './screens/source/index.mjs';
import * as tenancy from './screens/tenancy/index.mjs';
import * as service from './screens/service/index.mjs';
import * as billing from './screens/billing/index.mjs';
import * as hr from './screens/hr/index.mjs';
import * as finance from './screens/finance/index.mjs';
import * as reports from './screens/reports/index.mjs';
import * as admin from './screens/admin/index.mjs';

document.getElementById('shell-css').textContent = CSS;

const { reseeded } = store.load();
shellDom.mount(document.getElementById('app'), router.currentCtx);

const R = router.register;
for (const cluster of [source, tenancy, service, billing, hr, finance, reports, admin]) {
  registerPerms(cluster.perms);
  registerChips(cluster.chips);
  for (const [pattern, screen, meta] of cluster.routes) R(pattern, screen, meta);
}
for (const [uiId, href] of Object.entries(shellDom.HREF)) {
  const path = href.slice(1).split('?')[0];
  if (!['UI-01', 'UI-02', 'UI-03', 'UI-04', 'UI-05'].includes(uiId) && !path.includes('*')) {
    R(path, placeholder, { menu: uiId, uiId });
  }
}
R('/contracts/:id', placeholder, { menu: 'UI-07', uiId: 'UI-07' });
R('/settings/:section', placeholder, { menu: 'UI-33', uiId: 'UI-33' });
R('/settings/:section/:id', placeholder, { menu: 'UI-33', uiId: 'UI-33' });
R('/soon/:id', placeholder, {});
R('/dashboard', placeholder, { menu: 'UI-01', uiId: 'UI-01' });
router.setFallback(placeholder);
router.setForbidden(forbidden);

// Action chung: bộ lọc, tìm kiếm (debounce 300ms — Common Rule 6), tab, phân trang.
let debounce = null;
router.registerGlobal({
  ...shellDom.globalActions,
  'approval-transition': (el, e, ctx) => handleApproval(el, ctx),
  filter: (el, e, ctx) => ctx.setQuery({ [el.name]: el.value || undefined, page: undefined }),
  search: (el, e, ctx) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => ctx.setQuery({ [el.name]: el.value.trim() || undefined, page: undefined }), 300);
  },
  tab: (el, e, ctx) => ctx.setQuery({ tab: el.dataset.tab }),
  page: (el, e, ctx) => ctx.setQuery({ page: el.dataset.page }),
});

dom.install({ getAction: router.actionFor, go: router.go });
router.start();
if (reseeded) toast('info', 'Đã nạp dữ liệu demo', 'Seed v1.0 · G1 kỳ 09/2026 và HĐ mẫu tùng sói');

// Hook kiểm thử (chỉ localhost): verify-flow dùng để đọc/đặt lại store.
if (['localhost', '127.0.0.1'].includes(location.hostname)) {
  window.__TH = { store, go: router.go, reset: () => store.reset(), can: (p, c) => can(store.get(), p, c), setRole: (r) => store.setMeta({ role: r }) };
}
