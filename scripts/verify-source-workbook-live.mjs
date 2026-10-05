/* Browser acceptance cho gap thực sự của Source Workbook vs Live:
   hồ sơ pháp lý/version HĐ chủ nhà, policy lương 5 phòng ban và Sales field-level/export. */
import { chromium } from './_dataset.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 9400 + Math.floor(Math.random() * 200), CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const out = path.join(ROOT, 'output', 'source-workbook-live', 'latest'); fs.mkdirSync(out, { recursive: true });
fs.rmSync(path.join(out, 'failure.png'), { force: true });
const server = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const errors = []; const checks = [];
page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const ok = (cond, label) => { if (!cond) throw new Error(label); checks.push(label); };
const visit = async hash => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(250); ok(!/Lỗi hiển thị trang|Chưa có màn hình/.test(await page.locator('#content').innerText()), 'route ' + hash); };
const axePath = path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js');
const a11y = async label => {
  const result = await page.evaluate(async () => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] }, resultTypes: ['violations'] }));
  const severe = result.violations.filter(v => ['critical', 'serious'].includes(v.impact));
  ok(severe.length === 0, 'axe ' + label + ': ' + severe.map(v => `${v.id} ${v.nodes.map(n => n.target.join(' ')).join(' | ')}`).join(', '));
};

try {
  await page.goto(`http://127.0.0.1:${PORT}/#/login`); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.click('[data-u=admin]'); await page.waitForTimeout(300); await page.addScriptTag({ path: axePath });
  const ids = await page.evaluate(() => {
    const building = TH.store.all('buildings')[0], contract = TH.store.one('ownerContracts', c => c.buildingId === building.id);
    TH.actions.saveBuildingLegalRecord({ buildingId: building.id, kind: 'pccc', status: 'valid', number: 'PCCC-ACCEPTANCE', issuedAt: '2026-01-01', expiresAt: '2027-01-01', effectiveFrom: TH.f.today(), sourceRef: 'SRC-WORKBOOK-LIVE', note: 'Browser acceptance' });
    TH.actions.updateOwnerContractMeta(contract.id, { effectiveFrom: TH.f.today(), holdPriceTo: '2028-12-31', terms: 'Điều khoản acceptance', operatorName: 'Timehouse', sourceRef: 'SRC-WORKBOOK-LIVE', reason: 'Browser acceptance' });
    return { building: building.id, contract: contract.id };
  });

  const routes = [`#/buildings/${ids.building}?tab=phap-ly`, `#/owners/${ids.contract}`, '#/hr/payroll?period=2026-09&tab=chinh-sach', '#/sales/deals'];
  await visit(routes[0]); ok((await page.locator('#legal-current tbody tr').count()) === 1, 'legal current record'); ok((await page.locator('#content').innerText()).includes('PCCC-ACCEPTANCE'), 'legal structured fields'); await a11y('legal');
  await visit(routes[1]); ok((await page.locator('#cvt tbody tr').count()) >= 2, 'owner contract immutable versions'); await page.locator('[data-act=contract-version]').first().click(); ok(await page.locator('[role=dialog]').count() === 1, 'owner snapshot drawer'); await page.locator('#overlay-root [data-act=close]').click(); await a11y('owner version');
  await visit(routes[2]); ok((await page.locator('#salary-policy-table tbody tr').count()) === 5, 'five salary departments'); const payrollText = await page.locator('#content').innerText(); for (const label of ['Vận hành', 'Kinh doanh', 'Kỹ thuật', 'Thị trường', 'Tài chính – Kế toán']) ok(payrollText.includes(label), 'salary policy ' + label); await a11y('salary policy');
  await visit(routes[3]); const head = await page.locator('#t thead').innerText(); for (const label of ['Ngày giao dịch', 'Quản lý', 'Khách / SĐT', 'Cọc / thanh toán', 'Nguồn / công cụ', 'Sale / cách chia', 'Nhận phòng', 'Ghi chú']) ok(head.includes(label), 'sales column ' + label);
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=exp]')]); const csvPath = path.join(out, 'giao-dich-chot.csv'); await download.saveAs(csvPath); const csv = fs.readFileSync(csvPath, 'utf8');
  for (const label of ['Quản lý tại ngày chốt', 'Cọc phải thu', 'Cọc đã thu', 'Trạng thái thanh toán', 'Hoa hồng', 'Loại nhận phòng', 'Ghi chú']) ok(csv.includes(label), 'sales export ' + label); await a11y('sales deals');

  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [i, route] of routes.entries()) { await visit(route); const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2); ok(!overflow, `responsive ${width} route ${i + 1}`); await page.screenshot({ path: path.join(out, `${width}-route-${i + 1}.png`), fullPage: true }); }
  }
  ok(errors.length === 0, 'no page/console errors: ' + errors.join('; '));
  fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify({ passed: true, checks, errors, routes, viewports: [375, 768, 1024, 1440] }, null, 2));
  console.log(`PASS: Source Workbook vs Live · ${checks.length} checks · evidence ${path.relative(ROOT, out)}`);
} catch (e) {
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }).catch(() => {});
  fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify({ passed: false, checks, errors, error: e.stack }, null, 2));
  throw e;
} finally { await browser.close(); server.kill(); }
