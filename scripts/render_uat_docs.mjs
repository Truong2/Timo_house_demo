/*
 * Render 4 DOCX UAT thành PNG từng trang để QA layout (tràn chữ/bảng/ảnh).
 * DOCX → PDF bằng LibreOffice (soffice --headless), PDF → PNG bằng PyMuPDF (python -c).
 * Ảnh render chỉ phục vụ QA nội bộ (thư mục _rendered/ không commit).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PYTHON, RUN_ROOT } from './uat/runtime.mjs';

const SOFFICE = process.env.SOFFICE_PATH || 'C:/Program Files/LibreOffice/program/soffice.exe';
const DPI = Number(process.env.RENDER_DPI) || 96;
const root = path.resolve(process.env.TIMEHOUSE_UAT_ROOT || RUN_ROOT);
const names = [
  '00_TimeHouse_UAT_3_Phase_Summary.docx',
  '01_TimeHouse_Phase1_UAT_Evidence.docx',
  '02_TimeHouse_Phase2_UAT_Evidence.docx',
  '03_TimeHouse_Phase3_UAT_Evidence.docx',
];
const only = process.argv.slice(2).filter(x => !x.startsWith('-'));
const targets = only.length ? names.filter(name => only.some(part => name.includes(part))) : names;

const PY_RENDER = `
import sys, fitz, json
pdf, out, dpi = sys.argv[1], sys.argv[2], int(sys.argv[3])
doc = fitz.open(pdf)
for i, page in enumerate(doc):
    page.get_pixmap(dpi=dpi).save(f"{out}/page-{i + 1:03d}.png")
print(json.dumps({"pages": len(doc)}))
`;

if (!fs.existsSync(SOFFICE)) { console.error(`Không tìm thấy LibreOffice tại ${SOFFICE} (đặt SOFFICE_PATH)`); process.exit(1); }
const report = {}; let failed = false;
for (const name of targets) {
  const input = path.join(root, name);
  if (!fs.existsSync(input)) { console.error(`Thiếu ${input}`); failed = true; continue; }
  const output = path.join(root, '_rendered', path.basename(name, '.docx'));
  fs.rmSync(output, { recursive: true, force: true }); fs.mkdirSync(output, { recursive: true });
  const conv = spawnSync(SOFFICE, ['--headless', '--norestore', '--convert-to', 'pdf', '--outdir', output, input], { encoding: 'utf8', windowsHide: true });
  const pdf = path.join(output, path.basename(name, '.docx') + '.pdf');
  if (conv.status !== 0 || !fs.existsSync(pdf)) { console.error(`LibreOffice không chuyển được ${name}: ${conv.stderr || conv.stdout}`); failed = true; continue; }
  const render = spawnSync(PYTHON, ['-c', PY_RENDER, pdf, output, String(DPI)], { encoding: 'utf8', windowsHide: true });
  if (render.status !== 0) { console.error(`PyMuPDF lỗi với ${name}: ${render.stderr}`); failed = true; continue; }
  const pages = fs.readdirSync(output).filter(file => /^page-\d+\.png$/i.test(file)).length;
  if (!pages) { console.error(`Không render được trang nào cho ${name}`); failed = true; continue; }
  report[name] = { pdf: path.relative(root, pdf).replaceAll('\\', '/'), pages, dpi: DPI, dir: path.relative(root, output).replaceAll('\\', '/') };
  console.log(`${name}: ${pages} trang PNG (${DPI} dpi)`);
}
fs.mkdirSync(path.join(root, '_rendered'), { recursive: true });
fs.writeFileSync(path.join(root, '_rendered', 'render.json'), JSON.stringify({ generatedAt: new Date().toISOString(), root, docs: report }, null, 2), 'utf8');
if (failed) process.exitCode = 1;
