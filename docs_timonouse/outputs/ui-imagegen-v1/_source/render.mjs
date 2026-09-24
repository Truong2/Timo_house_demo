// Chụp mọi màn trong screens/ ra PNG vào thư mục cụm menu tương ứng trong ui-imagegen-v1/ (xem CLUSTER bên dưới).
// Dùng: node docs_timonouse/outputs/ui-imagegen-v1/_source/render.mjs [bộ lọc tên file]
// Ví dụ: node .../render.mjs UI-12   → chỉ chụp các màn có "UI-12" trong tên file.
import { chromium } from 'playwright-core';
import { readdir, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '..');
const htmlDir = path.join(here, 'html');
const filter = process.argv[2] || '';

// Cụm điều hướng theo spec §6.2 — mỗi UI ID thuộc đúng một thư mục.
const CLUSTER = {
  '00': '09-quan-tri-he-thong', '01': '01-tong-quan',
  '02': '02-nguon-nha-toa-phong', '03': '02-nguon-nha-toa-phong', '04': '02-nguon-nha-toa-phong',
  '05': '02-nguon-nha-toa-phong', '27': '02-nguon-nha-toa-phong',
  '06': '03-khach-thue-hop-dong', '07': '03-khach-thue-hop-dong', '08': '03-khach-thue-hop-dong',
  '15': '03-khach-thue-hop-dong', '16': '03-khach-thue-hop-dong',
  '09': '04-dich-vu-chi-so', '10': '04-dich-vu-chi-so',
  '11': '05-hoa-don-thu-tien', '12': '05-hoa-don-thu-tien', '13': '05-hoa-don-thu-tien',
  '14': '05-hoa-don-thu-tien', '17': '05-hoa-don-thu-tien',
  '24': '06-chi-phi-dau-tu', '25': '06-chi-phi-dau-tu', '26': '06-chi-phi-dau-tu',
  '28': '06-chi-phi-dau-tu', '29': '06-chi-phi-dau-tu',
  '18': '07-nhan-su-luong', '19': '07-nhan-su-luong', '20': '07-nhan-su-luong',
  '21': '07-nhan-su-luong', '22': '07-nhan-su-luong', '23': '07-nhan-su-luong',
  '30': '08-bao-cao-doi-soat', '31': '08-bao-cao-doi-soat', '32': '08-bao-cao-doi-soat',
  '33': '09-quan-tri-he-thong',
};
const clusterDir = (file) => {
  const dir = CLUSTER[file.match(/^UI-(\d\d)/)?.[1]];
  if (!dir) throw new Error(`Chưa gán cụm menu cho ${file}`);
  return path.join(outDir, dir);
};

const files = (await readdir(path.join(here, 'screens'))).filter((f) => f.endsWith('.mjs') && f.includes(filter)).sort();
if (!files.length) { console.error('Không có màn nào khớp bộ lọc'); process.exit(1); }

await mkdir(htmlDir, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' }).catch(() => chromium.launch({ channel: 'chrome' }));
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.25 });

for (const f of files) {
  const mod = await import(pathToFileURL(path.join(here, 'screens', f)).href + `?t=${Date.now()}`);
  const { file, html } = mod.default;
  await writeFile(path.join(htmlDir, file.replace(/\.png$/, '.html')), html, 'utf8');
  await page.setContent(html, { waitUntil: 'networkidle' }).catch(() => page.setContent(html));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(clusterDir(file), file), fullPage: true });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`✓ ${path.relative(outDir, path.join(clusterDir(file), file))}  (${h}px)`);
}
await browser.close();
