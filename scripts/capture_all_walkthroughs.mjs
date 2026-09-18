import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { RUN_ROOT, ROOT } from './uat/runtime.mjs';

const env = { ...process.env, TIMEHOUSE_UAT_ROOT: RUN_ROOT };
const scripts = ['capture_phase1_walkthrough.mjs', 'capture_phase2_walkthrough.mjs', 'capture_phase3_walkthrough.mjs'];
let failed = false;
for (const script of scripts) {
  const result = spawnSync(process.execPath, [path.join('scripts', script)], { cwd: ROOT, env, stdio: 'inherit' });
  if (result.status !== 0) { failed = true; break; }
}
if (!failed) {
  const result = spawnSync(process.execPath, [path.join('scripts', 'build_uat_summary.mjs')], { cwd: ROOT, env, stdio: 'inherit' });
  failed = result.status !== 0;
}
if (failed) process.exitCode = 1;

