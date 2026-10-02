/* Dựng toàn bộ app (domain + seed + store + auth + services, không DOM) trong một vm context để test ở mức action/service.
   Thứ tự nạp giống mockup/index.html, bỏ các file UI/trang thuần DOM. localStorage = Map trong bộ nhớ (mỗi context một kho riêng → seed sạch). */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, DOMAIN } from './_load.mjs';

const JS = (f) => path.join(ROOT, 'mockup', 'js', f);
export const DATA_ALL = ['data/catalog.js', 'data/seed-master.js', 'data/seed-2026-09.js', 'data/seed-2026-08-bench.js', 'data/seed.js', 'data/seed-1b.js', 'data/seed-p2.js', 'data/seed-phase2.js', 'data/seed-phase3.js', 'data/seed-p3.js', 'data/seed-phase3-rest.js'];
export const CORE = ['core/store.js', 'core/milestone.js', 'core/auth.js', 'core/routes.js'];
export const SERVICES = ['services/q.js', 'services/act-core.js', 'services/act-master.js', 'services/act-stays.js', 'services/act-billing.js', 'services/act-receipts.js',
  'services/act-refunds.js', 'services/act-expenses.js', 'services/act-zalo.js', 'services/act-hr.js', 'services/act-import.js', 'services/act-periods.js',
  'services/act-payroll.js', 'services/act-allocation.js', 'services/q-report.js',
  'services/act-sales.js', 'services/act-commission.js', 'services/act-repairs.js', 'services/q-report-ops.js', 'services/act-shares.js', 'services/act-documents.js', 'services/act-intake.js', 'services/act-assets.js', 'services/act-maintenance.js', 'services/act-inventory.js', 'services/act-capital.js', 'services/q-forecast.js', 'services/act-forecast.js', 'services/q-efficiency.js'];
/* Trang chỉ nạp để lấy TH.pages.acceptance / acceptance1B (đăng ký route bằng router giả) */
export const ACCEPTANCE_PAGES = ['pages/settings.js', 'pages/reports.js', 'pages/acceptance3.js'];

// Đọc file một lần cho mọi context trong cùng tiến trình test
const src = new Map();
const read = (f) => { if (!src.has(f)) src.set(f, fs.readFileSync(JS(f), 'utf8')); return src.get(f); };

const memStorage = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); },
    clear: () => m.clear(), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; },
  };
};
/* Stub UI tối thiểu: kit.js đọc TH.ui/TH.icon lúc nạp; trang gọi TH.router.handle lúc nạp */
const noop = () => '';
const uiStub = () => new Proxy({}, { get: (t, k) => (k in t ? t[k] : noop) });

/**
 * Boot app sạch từ seed. opts.user: đăng nhập sẵn (admin|ketoan|vanhanh|leader); opts.kit: nạp ui/kit.js; opts.pages: nạp trang nghiệm thu.
 * Trả về TH của context mới.
 */
export function boot({ user = 'admin', kit = false, pages = false } = {}) {
  const ctx = {
    console,
    // store.save() hẹn giờ ghi localStorage – không cần trong test, tránh giữ tiến trình
    setTimeout: () => 0, clearTimeout: () => {}, performance: { now: () => Date.now() },
    localStorage: memStorage(),
    location: { hash: '', reload: () => {} }, history: { replaceState: () => {} },
    document: { readyState: 'complete', addEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, createElement: () => ({ style: {} }), body: { appendChild: () => {} } },
    addEventListener: () => {},
  };
  ctx.window = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  const run = (f) => vm.runInContext(read(f), ctx, { filename: f });
  [...DOMAIN, ...DATA_ALL, ...CORE].forEach(run);
  const TH = ctx.TH;
  // router thật cần DOM/location khi render → chỉ cần handle() để trang đăng ký route
  TH.router = { handle: () => {}, current: null, refresh: () => {}, render: () => {}, parse: () => ({ path: '/', query: {} }), setQuery: () => {}, replaceQuery: () => {}, href: () => '#', go: () => {} };
  TH.pages = TH.pages || {};
  TH.ui = uiStub(); TH.icon = uiStub(); TH.layout = { reset: () => {} };
  SERVICES.forEach(run);
  if (kit || pages) run('ui/kit.js');
  if (pages) ACCEPTANCE_PAGES.forEach(run);
  TH.store.load();
  if (user) TH.auth.login(user);
  return TH;
}

/* Chạy fn, trả 'ok' hoặc thông báo lỗi – tiện so với verify-p0 ("cho phép"/"chặn") */
export const attempt = (fn) => { try { const value = fn(); return { ok: true, value }; } catch (e) { return { ok: false, msg: e.message, fields: e.fields }; } };
