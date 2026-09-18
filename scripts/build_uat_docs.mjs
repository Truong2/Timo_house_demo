/* Dựng lại 3 DOCX evidence từ manifest đã có (không chạy lại UAT) – dùng khi chỉ sửa layout tài liệu. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { RUN_ROOT as DEFAULT_ROOT, ROOT, buildPhaseDoc, phasePaths } from './uat/runtime.mjs';

const root = path.resolve(process.env.TIMEHOUSE_UAT_ROOT || DEFAULT_ROOT);
const env = { ...process.env, TIMEHOUSE_UAT_ROOT: root };
let failed = false;
const p1 = spawnSync(process.execPath, [path.join('scripts', 'capture_phase1_walkthrough.mjs'), '--docs-only'], { cwd: ROOT, env, stdio: 'inherit' });
if (p1.status !== 0) failed = true;
for (const phase of [2, 3]) {
  const paths = phasePaths(phase);
  if (!fs.existsSync(paths.manifest)) { console.error(`Thiếu ${paths.manifest}`); failed = true; continue; }
  await buildPhaseDoc(JSON.parse(fs.readFileSync(paths.manifest, 'utf8')), paths.docx);
  console.log(`Đã dựng lại ${path.basename(paths.docx)}`);
}
if (failed) process.exitCode = 1;
