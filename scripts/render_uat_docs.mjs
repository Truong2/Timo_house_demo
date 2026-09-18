import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { RUN_ROOT } from './uat/runtime.mjs';

const renderer = process.env.DOCX_RENDERER || 'C:/Users/truon/.codex/plugins/cache/openai-primary-runtime/documents/26.819.11345/skills/documents/render_docx.py';
const names = [
  '00_TimeHouse_UAT_3_Phase_Summary.docx',
  '01_TimeHouse_Phase1_UAT_Evidence.docx',
  '02_TimeHouse_Phase2_UAT_Evidence.docx',
  '03_TimeHouse_Phase3_UAT_Evidence.docx',
];
let failed = false;
for (const name of names) {
  const input = path.join(RUN_ROOT, name); if (!fs.existsSync(input)) { console.error(`Thiếu ${input}`); failed = true; continue; }
  const output = path.join(RUN_ROOT, '_rendered', path.basename(name, '.docx'));
  fs.mkdirSync(output, { recursive: true });
  const result = spawnSync('python', [renderer, input, '--output_dir', output, '--emit_pdf', '--verbose'], { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
  else {
    const pages = fs.readdirSync(output).filter(file => /^page-\d+\.png$/i.test(file));
    if (!pages.length) { console.error(`Không render được trang nào cho ${name}`); failed = true; }
    else console.log(`${name}: ${pages.length} trang PNG`);
  }
}
if (failed) process.exitCode = 1;

