import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = 9600 + Math.floor(Math.random() * 200);
const server = spawn(process.execPath, [path.join(ROOT, 'scripts/serve.mjs')], { cwd: ROOT, env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
const out = path.join(ROOT, 'output/module-completion'); await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const errors = [], checks = []; page.on('pageerror', e => errors.push(e.message));
const go = async hash => { await page.evaluate(h => { TH.go(h); TH.router.render(); }, hash); await page.waitForTimeout(150); assert.ok(!/Lỗi hiển thị trang/.test(await page.locator('#content').innerText()), hash); };
const save = async () => { await page.locator('[data-act=submit-d]').click(); await page.waitForSelector('#overlay-root [role=dialog]', { state: 'hidden' }); };
try {
  for (let n = 0; n < 30; n++) { try { await page.goto(`http://localhost:${port}`, { waitUntil: 'domcontentloaded' }); break; } catch (e) { if (n === 29) throw e; await new Promise(r => setTimeout(r, 100)); } }
  await page.waitForFunction(() => !!window.TH?.store?.state);
  await page.evaluate(() => { TH.auth.login('admin'); TH.layout.reset(); });
  const stay = await page.evaluate(() => TH.store.all('stays').find(s => s.status === 'active').id);
  await go(`#/stays/${stay}?tab=nguoi-thue`);
  await page.click('[data-act=vehicles]');
  await page.click('[data-act=add-vehicle]'); await page.fill('[name=plate_0]', '29A-12345'); await page.fill('[name=type_0]', 'Ô tô');
  await page.click('[data-act=add-vehicle]'); await page.fill('[name=plate_1]', '29B-54321'); await page.fill('[name=type_1]', 'Xe máy');
  await save(); assert.equal(await page.locator('#content').getByText('29A-12345', { exact: true }).count(), 1);
  assert.equal(await page.locator('#content').getByText('29B-54321', { exact: true }).count(), 1);
  await page.click('[data-act=editc]');
  await page.selectOption('[name=residencyStatus]', 'registered'); await page.fill('[name=residencyAddress]', 'Địa chỉ tạm trú theo hồ sơ');
  await page.fill('[name=residencyDate]', '2026-09-20'); await page.fill('[name=residencyReference]', 'TT-2026-01'); await save();
  await page.waitForTimeout(400); await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-act=vehicles]');
  assert.ok((await page.locator('#content').innerText()).includes('TT-2026-01'));
  await page.click('[data-act=vehicles]'); await page.locator('[data-act=remove-vehicle]').last().click(); await save();
  assert.equal(await page.locator('#content').getByText('29B-54321', { exact: true }).count(), 0);
  checks.push('two vehicles, residency, browser reload persistence and removal');

  await go('#/owners/oc_G1'); await page.click('[data-act=edit-owner]');
  await page.fill('[name=address]', 'Địa chỉ chủ nhà theo hợp đồng'); await page.fill('[name=bankAccount]', '000123456');
  await page.fill('[name=sourceRef]', 'Hồ sơ chủ nhà G1'); await page.fill('[name=reason]', 'Bổ sung thông tin cá nhân'); await save();
  await page.click('[data-act=meta]'); await page.selectOption('[name=pcccStatus]', 'yes');
  await page.fill('[name=holdPriceTo]', '2028-01-01'); await page.fill('[name=reason]', 'Đối chiếu hợp đồng'); await save();
  assert.ok((await page.locator('#content').innerText()).includes('PCCC theo hợp đồng'));
  await page.locator('[data-act=contract-version]').first().click(); assert.ok((await page.locator('[role=dialog]').innerText()).includes('Địa chỉ chủ nhà theo hợp đồng'));
  await page.locator('[role=dialog] [data-act=close]').click(); checks.push('editable owner profile, PCCC, hold-price date and immutable contract snapshot UI');

  const cleaner = await page.evaluate(() => TH.actions.addEmployee({ name: 'NV vệ sinh nghiệm thu', title: 'VỆ SINH', hireDate: '2026-09-01' }).id);
  await go('#/buildings/b_G1?tab=nhan-su'); await page.click('[data-act=staff-assign][data-resp=cleaning]');
  await page.selectOption('[name=employeeId]', cleaner); await page.fill('[name=reason]', 'Phân công vệ sinh G1'); await save();
  assert.ok((await page.locator('#content').innerText()).includes('NV vệ sinh nghiệm thu')); checks.push('cleaning assignment from building detail UI');

  await go('#/hr/payroll?period=2026-09'); await page.click('[data-act=compute]'); await page.waitForTimeout(150);
  const first = await page.evaluate(() => TH.q.payrollRun('2026-09').id); await page.click('[data-act=compute]'); await page.waitForTimeout(150);
  assert.notEqual(await page.evaluate(() => TH.q.payrollRun('2026-09').id), first);
  await page.evaluate(() => {
    let run = TH.q.payrollRun('2026-09');
    run.lines.forEach(l => l.buildings.filter(b => b.HS != null && b.HS < 70 && !b.manualApplied).forEach(b => TH.actions.addPayrollManual({ period: '2026-09', kind: 'ops_below70', employeeId: l.employeeId, buildingId: b.buildingId, amount: 6000, note: 'Mức đã rà trong kịch bản nghiệm thu' })));
    run = TH.actions.computePayroll('2026-09'); run.lines.forEach(l => l.flags.forEach(f => TH.actions.approvePayFlag(run.id, l.employeeId + ':' + f.buildingId, 'Ca đã đối chiếu')));
  });
  await go('#/hr/payroll?period=2026-09&tab=phien'); assert.ok(await page.locator('[data-act=close]').isDisabled());
  await page.click('[data-act=approve-run]'); await page.fill('[name=note]', 'Đã rà soát năm phòng ban và dữ liệu nguồn'); await save();
  assert.ok(await page.locator('[data-act=close]').isEnabled()); await page.click('[data-act=close]');
  await page.locator('[role=dialog]').getByRole('button', { name: 'Chốt', exact: true }).click(); await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => TH.q.payrollRun('2026-09').status), 'closed');
  await page.locator('[data-act=view-run]').last().click(); await page.waitForSelector('[role=dialog]');
  await page.locator('[role=dialog] [data-act=close]').click(); checks.push('payroll versions, prior snapshot, approval gate and closing UI');

  await page.evaluate(() => {
    const rows = TH.q.shareRatios('b_G1').map(r => ({ shareholderId: r.shareholderId, pct: r.pct }));
    TH.actions.setShareRatios('b_G1', rows, '2026-10-01', 'Phụ lục sở hữu đã rà');
  });
  await go('#/shares?building=b_G1'); assert.ok((await page.locator('#content').innerText()).includes('Phụ lục sở hữu đã rà')); checks.push('ownership version displayed with source');
  await go('#/sales/deals'); assert.ok(await page.locator('th').getByText('STT', { exact: true }).count());
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=exp]')]);
  await download.saveAs(path.join(out, 'sales.csv')); assert.match(await fs.readFile(path.join(out, 'sales.csv'), 'utf8'), /^\uFEFF?STT,/); checks.push('sales ordinal column and CSV');

  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const hash of [`#/stays/${stay}?tab=nguoi-thue`, '#/owners/oc_G1', '#/buildings/b_G1?tab=nhan-su', '#/hr/payroll?period=2026-09&tab=phien', '#/assets/maintenance?type=pump', '#/assets/inventory?building=b_G1&type=decor']) {
      await go(hash); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal overflow: ' + hash + ' at ' + width);
    }
    await page.screenshot({ path: path.join(out, `responsive-${width}.png`), fullPage: true });
  }
  checks.push('responsive 375/768/1440 across six module screens');
  assert.deepEqual(errors, []); await fs.writeFile(path.join(out, 'verification.json'), JSON.stringify({ passed: true, checks, errors }, null, 2));
  console.log('PASS: ' + checks.join('; '));
} catch (e) {
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }).catch(() => {});
  await fs.writeFile(path.join(out, 'verification.json'), JSON.stringify({ passed: false, checks, errors, failure: e.message }, null, 2)); throw e;
} finally { await browser.close(); server.kill(); }
