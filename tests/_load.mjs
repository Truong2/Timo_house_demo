/* Nạp các file script trình duyệt (window.TH) vào vm để test bằng node:test – không cần bundler. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JS = (f) => path.join(ROOT, 'mockup', 'js', f);
export const DOMAIN = ['core/format.js', 'domain/dates.js', 'domain/params.js', 'domain/rbac-policy.js', 'domain/billing.js', 'domain/payments.js', 'domain/refund.js', 'domain/zalo-rules.js',
  'domain/import-validate.js', 'domain/depreciation.js', 'domain/payroll.js', 'domain/allocation.js', 'domain/report.js'];
export const DATA = ['data/catalog.js', 'data/seed-master.js', 'data/seed-2026-09.js', 'data/seed-2026-08-bench.js'];

export function load(files = DOMAIN) {
  const ctx = { console, Math, Date, JSON };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(JS(f), 'utf8'), ctx, { filename: f });
  return ctx.TH;
}
export const fixture = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', name), 'utf8'));
