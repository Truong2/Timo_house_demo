// So màn SPA với ảnh -verified của cụm 02 (cùng cấu hình chụp với render.mjs: 1440×900, DSF 1.25, fullPage).
// Trạng thái được tái tạo bằng thao tác UI thật. Kết quả: tmp/verify/report.html + ảnh diff.
// Gate cứng: vùng sidebar (menu) ≤ 0,5 %. Các màn khác chỉ báo cáo — ảnh verified không cùng một thời điểm (xem EXPECTED).
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';
import { launch, newPage, diffPng } from './lib/browser.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REF = path.join(repo, 'docs_timonouse/outputs/ui-imagegen-v1/02-nguon-nha-toa-phong');
const OUT = path.join(repo, 'tmp/verify');
const REGIONS = [{ name: 'sidebar', x: 0, y: 70, w: 300, h: 640 }, { name: 'topbar', x: 300, y: 0, w: 1500, h: 70 }];
const EXPECTED = {
  'UI-03-extract': 'Thêm chip trạng thái bị ẩn; rail cao hơn một chút do nút lựa chọn là <button>.',
  'UI-03-head-lease': 'SRS: nút “Bổ sung & kích hoạt” disable khi còn thiếu điều kiện (capture vẽ enabled); banner có nút sửa nhanh.',
  'UI-02-detail': 'Khối “Nguồn tạo hồ sơ” ghi Dò trùng từ dữ liệu thật.',
  'UI-02-list': 'Sau commit, KPI “Job trích xuất đang mở” = 0 (capture vẽ 1 dù LL-0007 đã có).',
  'UI-04-building': 'Ô Mã tòa là input + nút “Lưu mã”; thêm khối “Chuyển Chuẩn bị → Đang khai thác” (vị trí nút SRS đỏ).',
  'UI-05-rooms': 'Capture xếp chồng 2 tab trong một ảnh; SPA chỉ hiện tab đang mở. Preview là ô sửa được.',
};

const { server, url } = await startServer({ port: 0, quiet: true });
const browser = await launch();
const page = await newPage(browser);
page.setDefaultTimeout(8000);
await mkdir(OUT, { recursive: true });
const base = `${url}?pending=off&today=2026-09-24`;
const go = async (hash) => { await page.evaluate((h) => { location.hash = h; }, hash); await page.waitForTimeout(250); await page.waitForSelector('main .ph h1'); };
const shot = async (id) => {
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(0, 0);
  const file = path.join(OUT, `${id}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
};

await page.goto(`${base}#/landlords`);
await page.waitForSelector('main .ph h1');
await page.evaluate(() => { window.__TH.reset(); window.__TH.setRole('admin'); });
const shots = [];

await go('#/landlords/import?job=LLX-001');
shots.push(['UI-03-extract', await shot('UI-03-extract'), 'UI-03-head-lease-extract-verified.png']);
for (const [c, v] of [['dates', 'draft'], ['deposit', 'once'], ['partyB', 'proxy']]) { await page.click(`aside.rail [data-action=choose][data-c=${c}][data-v=${v}]`); await page.waitForTimeout(120); }
await page.click('main [data-action=commit]'); await page.waitForSelector('.mdl'); await page.click('.mdl [data-m=ok]');
await page.waitForFunction(() => location.hash === '#/head-leases/HL-0031');
await page.waitForTimeout(4500); // chờ toast tự đóng
shots.push(['UI-03-head-lease', await shot('UI-03-head-lease'), 'UI-03-head-lease-verified.png']);
await go('#/landlords/LL-0007');
shots.push(['UI-02-detail', await shot('UI-02-detail'), 'UI-02-landlord-detail-verified.png']);
await go('#/landlords');
shots.push(['UI-02-list', await shot('UI-02-list'), 'UI-02-landlord-list-verified.png']);
const bId = await page.evaluate(() => window.__TH.store.get().extractionJobs[0].committed.buildingId);
await go(`#/buildings/${bId}`);
shots.push(['UI-04-building', await shot('UI-04-building'), 'UI-04-building-verified.png']);
await page.click('main [data-action=save-code]'); await page.waitForSelector('.mdl'); await page.click('.mdl [data-m=ok]');
await page.waitForTimeout(4500);
await go(`#/rooms/new?building=${bId}`);
await page.fill('main input[name=floors]', '2'); await page.fill('main input[name=perFloor]', '3'); await page.mouse.click(5, 890);
await page.waitForTimeout(200);
shots.push(['UI-05-rooms', await shot('UI-05-rooms'), 'UI-05-rooms-create-verified.png']);

const rows = [];
let hardFail = 0;
for (const [id, mine, ref] of shots) {
  const d = await diffPng(browser, mine, path.join(REF, ref), { regions: REGIONS });
  await writeFile(path.join(OUT, `${id}-diff.png`), Buffer.from(d.png, 'base64'));
  const sb = d.regions.find((r) => r.name === 'sidebar').pct;
  const pass = sb <= 0.5;
  if (!pass) hardFail++;
  rows.push({ id, ref, pct: d.pct, sb, tb: d.regions.find((r) => r.name === 'topbar').pct, h: [d.hA, d.hB], pass });
  console.log(`${pass ? '✓' : '✕'} ${id.padEnd(18)} lệch toàn trang ${d.pct.toFixed(2).padStart(6)} % · sidebar ${sb.toFixed(2)} % · topbar ${rows.at(-1).tb.toFixed(2)} % · cao ${d.hA}px vs ${d.hB}px`);
}
if (page.__errors.length) { hardFail++; console.error('Lỗi console:', page.__errors); }

const rel = (p) => path.relative(OUT, p).replaceAll('\\', '/');
await writeFile(path.join(OUT, 'report.html'), `<!doctype html><meta charset="utf-8"><title>Verify screens</title>
<style>body{font:13px system-ui;margin:20px;color:#0F172A}table{border-collapse:collapse;margin-bottom:20px}td,th{border:1px solid #CBD5E1;padding:6px 10px;text-align:left}
.ok{color:#15803D}.bad{color:#DC2626}.row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:10px 0 30px}.row img{width:100%;border:1px solid #CBD5E1}h2{margin-top:24px}</style>
<h1>So màn SPA với ảnh -verified</h1><p>Gate cứng: vùng sidebar ≤ 0,5 %. Ngưỡng lệch kênh màu 40. Chụp ${new Date().toISOString()}.</p>
<table><tr><th>Màn</th><th>Lệch toàn trang</th><th>Sidebar</th><th>Topbar</th><th>Chiều cao SPA / verified</th><th>Khác biệt đã biết</th></tr>
${rows.map((r) => `<tr><td class="${r.pass ? 'ok' : 'bad'}">${r.id}</td><td>${r.pct.toFixed(2)} %</td><td>${r.sb.toFixed(2)} %</td><td>${r.tb.toFixed(2)} %</td><td>${r.h[0]} / ${r.h[1]}</td><td>${EXPECTED[r.id]}</td></tr>`).join('')}</table>
${rows.map((r) => `<h2>${r.id}</h2><div class="row"><div><b>SPA</b><img src="${r.id}.png"></div><div><b>Verified</b><img src="${rel(path.join(REF, r.ref))}"></div><div><b>Diff (đỏ = lệch)</b><img src="${r.id}-diff.png"></div></div>`).join('')}`);
console.log(`\nBáo cáo: ${path.relative(repo, path.join(OUT, 'report.html'))}`);
await browser.close(); server.close();
process.exit(hardFail ? 1 : 0);
