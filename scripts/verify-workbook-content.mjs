/* Browser acceptance cho 10 sheet trong workbook nội dung làm web Timehouse. */
import { chromium } from './_dataset.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 9350 + Math.floor(Math.random() * 200), CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const out = path.join(ROOT, 'output', 'workbook-content', 'latest'); fs.mkdirSync(out, { recursive: true });
const server = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
let checks = 0; const ok = (v, msg) => { checks++; if (!v) throw new Error(msg); };
const visit = async hash => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(250); const txt = await page.locator('#content').innerText(); ok(!/Lỗi hiển thị trang|Chưa có màn hình/.test(txt), 'Route lỗi: ' + hash); return txt; };
try {
  await page.goto(`http://127.0.0.1:${PORT}/#/login`); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.click('[data-u=admin]'); await page.waitForTimeout(250);
  const ids = await page.evaluate(() => { const b = TH.store.all('buildings')[0], oc = TH.store.one('ownerContracts', x => x.buildingId === b.id); TH.actions.updateBuildingProfile(b.id, { floorAreaM2: 1234, businessRegistration: 'ĐKKD/PCCC WB', features: 'Tài sản bàn giao WB' }); TH.actions.updateOwnerContractMeta(oc.id, { holdPriceTo: '2028-12-31', terms: 'Thuế / PCCC theo phụ lục', operatorName: 'Timehouse', sourceRef: 'SRC-WORKBOOK', reason: 'Browser acceptance' }); return { b: b.id, oc: oc.id }; });
  let txt = await visit('#/owners/' + ids.oc); ok(txt.includes('Giữ giá đến') && txt.includes('Thuế / PCCC theo phụ lục') && txt.includes('SRC-WORKBOOK'), 'Chi tiết HĐ chủ nhà thiếu trường workbook');
  txt = await visit('#/buildings/' + ids.b + '?tab=tong-quan'); ok(txt.includes('1.234 m²') && txt.includes('ĐKKD/PCCC WB') && txt.includes('Tài sản bàn giao WB'), 'Hồ sơ tòa thiếu trường workbook');
  txt = await visit('#/tenants?view=refund_pending'); ok(txt.includes('Chờ hoàn cọc') && txt.includes('Quản lý / leader'), 'Danh sách khách thiếu trạng thái/leader');
  await visit('#/billing/invoices?period=2026-09'); for (const name of ['leader', 'dueFrom', 'dueTo', 'dueStatus']) ok(await page.locator(`[name=${name}]`).count() === 1, 'Hóa đơn thiếu filter ' + name); ok((await page.locator('#content').innerText()).includes('Giá thuê / niêm yết'), 'Hóa đơn thiếu thông tin hợp đồng');
  await visit('#/refunds'); for (const name of ['dateBasis', 'from', 'to', 'area', 'manager', 'leader']) ok(await page.locator(`[name=${name}]`).count() === 1, 'Hoàn cọc thiếu filter ' + name);
  await visit('#/reports/total?period=2026-08'); for (const name of ['group', 'leader', 'shareholder']) ok(await page.locator(`[name=${name}]`).count() === 1, 'Báo cáo thiếu filter ' + name);
  txt = await visit('#/reports/amduong?tab=dich-vu&period=2026-08'); ok(txt.includes('Chờ khách xác nhận') && txt.includes('Chưa có số Excel dịch vụ'), 'Dịch vụ Excel phải giữ trạng thái thiếu nguồn');
  txt = await visit('#/reports/amduong?tab=dich-vu&mode=web&period=2026-09'); ok(txt.includes('Thu − chi đề xuất') && txt.includes('Phương án đề xuất'), 'Dịch vụ web thiếu nhãn đề xuất');
  txt = await visit('#/hr'); ok(txt.includes('Phòng ban'), 'Nhân sự thiếu phòng ban');
  const routes = ['#/owners/' + ids.oc, '#/buildings/' + ids.b, '#/tenants?view=refund_pending', '#/billing/invoices?period=2026-09', '#/refunds', '#/reports/total?period=2026-08', '#/reports/amduong?tab=dich-vu&mode=web&period=2026-09', '#/hr'];
  for (const width of [375, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 900 }); for (const route of routes) { await visit(route); ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), `Tràn ngang ${width}px tại ${route}`); } await page.screenshot({ path: path.join(out, `workbook-${width}.png`), fullPage: true }); }
  ok(errors.length === 0, 'JS/console errors: ' + errors.join('; '));
  console.log(`✓ Workbook content: ${checks} checks · evidence ${path.relative(ROOT, out)}`);
} finally { await browser.close(); server.kill(); }
