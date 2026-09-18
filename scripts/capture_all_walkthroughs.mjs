/*
 * Chạy trọn bộ UAT 3 phase vào một thư mục phiên bản docs/uat/develop-<sha7>-<YYYYMMDD>/:
 * npm run check → P1 → P2 → P3 (mỗi phase browser context + dữ liệu sạch riêng) → tổng hợp → render PNG QA.
 * Dừng ở phase đầu tiên FAIL (manifest của phase đó vẫn được ghi để xem evidence lỗi).
 */
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { RUN_ROOT, ROOT } from './uat/runtime.mjs';

const env = { ...process.env, TIMEHOUSE_UAT_ROOT: process.env.TIMEHOUSE_UAT_ROOT || RUN_ROOT };
const node = (args) => spawnSync(process.execPath, args, { cwd: ROOT, env, stdio: 'inherit' }).status === 0;
const skipCheck = process.argv.includes('--no-check');
const skipRender = process.argv.includes('--no-render');

console.log(`UAT root: ${env.TIMEHOUSE_UAT_ROOT}`);
let ok = true;
if (!skipCheck) ok = node([path.join('scripts', 'build.mjs'), '--check-only']) && node([path.join('scripts', 'check-rbac.mjs')]);
for (const script of ['capture_phase1_walkthrough.mjs', 'capture_phase2_walkthrough.mjs', 'capture_phase3_walkthrough.mjs']) {
  if (!ok) break;
  ok = node([path.join('scripts', script)]);
}
if (ok) ok = node([path.join('scripts', 'build_uat_summary.mjs')]);
if (ok && !skipRender) ok = node([path.join('scripts', 'render_uat_docs.mjs')]);
if (!ok) process.exitCode = 1;
