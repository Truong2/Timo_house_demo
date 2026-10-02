/* Browser evidence and behavioral checks for F31–F37 / E30–E43. --publish copies only inspected screenshots. */
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8990 + Math.floor(Math.random() * 9), dir = path.join(ROOT, 'output/verify-p3/shots');
fs.mkdirSync(dir, { recursive: true });
const server = spawn(process.execPath, [path.join(ROOT, 'scripts/serve.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
const errors = [], checks = [], artifacts = [];
let browser;
const check = (name, ok, detail = '') => { checks.push({ name, ok: !!ok, detail }); assert.ok(ok, name + ': ' + detail); };
try {
  await new Promise(r => setTimeout(r, 800));
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } }), page = await ctx.newPage();
  // Keep local acceptance checks independent of Google Fonts availability.
  await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://localhost:${PORT}/#/login`); await page.waitForFunction(() => window.TH && TH.store.state);
  const login = async user => { await page.evaluate(user => { document.getElementById('overlay-root').innerHTML = ''; TH.ui.openCount = 0; document.body.classList.remove('modal-open'); TH.auth.login(user); TH.layout.reset(); TH.router.render(); }, user); };
  const go = async hash => { await page.evaluate(h => { document.getElementById('overlay-root').innerHTML = ''; TH.ui.openCount = 0; document.body.classList.remove('modal-open'); TH.router.go(h); }, hash); await page.waitForTimeout(350); const text = await page.locator('#content').innerText(); check('render ' + hash, !/Lỗi hiển thị trang|Chưa có màn hình|undefined|NaN|\[object Object\]/.test(text), text.slice(0, 150)); };
  const shot = async name => { await page.evaluate(() => document.querySelectorAll('.toast').forEach(t => t.remove())); await page.waitForTimeout(200); await page.screenshot({ path: path.join(dir, name), fullPage: /^(E(37|40)_|F37_)/.test(name) }); artifacts.push(name); console.log('✓ ' + name); };
  await login('admin');
  const data = await page.evaluate(() => {
    const X = TH.actions, Q = TH.q;
    const run = X.lockShareRun('b_G1', '2026-08'), row = run.rows.find(r => r.id === 'sh_CD-01');
    X.recordPayout({ shareRunId: run.id, shareholderId: row.id, amount: 1000000, date: '2026-09-29' });
    X.recordPayout({ shareRunId: run.id, shareholderId: row.id, amount: 500000, date: '2026-09-29' });
    const a = Q.assets({ building: 'b_G1', ownership: 'owner' })[0];
    X.proposeAssetChange('ivs_2026-09_b_G1', { kind: 'condition', assetId: a.id, to: 'broken', reason: 'Kiểm kê phát hiện hỏng, xác nhận bằng biên bản' });
    X.approveInventory('ivs_2026-09_b_G1');
    const v2 = X.createForecast({ period: '2026-09', draftDate: '2026-09-22', inputs: { J6: 30000000 }, reason: 'Kế toán dự kiến thu công nợ đến cuối tháng', adjustments: [{ amount: 1000000, reason: 'Bổ sung khoản thu đã xác nhận' }] });
    const batch = X.createZaloBatch({ ruleId: 'zr_maint' }); X.sendZaloBatch(batch.id);
    const task = Q.maintTasks({ status: 'overdue' })[0]; const done = X.completeMaintenance(task.id, { doneDate: '2026-09-29', vendor: 'Đơn vị bảo dưỡng demo', result: 'Đã thay linh kiện, chạy thử đạt' });
    return { run: run.id, payout: run.id + '_' + row.id, v2: v2.id, batch: batch.id, task: task.id, next: done.next.id };
  });
  await go('#/assets?ownership=company&period=2026-08'); await shot('UI-34_assets.png');
  await page.click('[data-act=add]'); await shot('E30_add-company-asset.png');
  await go('#/assets?asset=as_08_S4&period=2026-10');
  await page.waitForTimeout(200); await page.locator('.overlay [data-act=dp]').click(); await page.fill('.overlay [name=date]', '2026-10-15'); await page.locator('.overlay [name=date]').dispatchEvent('change'); await page.fill('.overlay [name=reason]', 'Hỏng không sửa được'); check('disposal preview matches selected period', /3.329.920/.test(await page.locator('#disposal-preview').innerText())); await shot('E31_asset-disposal.png');
  check('drawer preserves typed reason', (await page.locator('.overlay [name=reason]').inputValue()) === 'Hỏng không sửa được');
  await page.click('.overlay [data-act=submit-d]');
  try { await page.waitForFunction(() => TH.q.asset('as_08_S4').disposal, null, { timeout: 5000 }); }
  catch (e) { throw new Error(e.message + ' ' + JSON.stringify(await page.evaluate(() => ({ overlays: [...document.querySelectorAll('.overlay')].map(el => ({ text: el.innerText, data: TH.ui.formData(el) })), toasts: document.querySelector('.toasts')?.innerText, asset: TH.q.asset('as_08_S4').status, role: TH.auth.role() })))); }
  check('S4 disposal source amount', await page.evaluate(() => TH.q.asset('as_08_S4').disposal.remaining === 3329920));
  await go('#/assets?asset=as_08_T5&period=2026-10'); await page.waitForTimeout(200); await page.locator('.overlay [data-act=mv]').click(); await page.fill('.overlay [name=position]', 'Tầng 1 – khu giặt chung'); await page.fill('.overlay [name=reason]', 'Chuyển về khu giặt chung'); await page.click('.overlay [data-act=submit-d]'); await page.waitForFunction(() => TH.q.asset('as_08_T5').position.includes('khu giặt')); await go('#/assets?asset=as_08_T5&period=2026-10'); await page.click('.overlay [data-act=dtab][data-key=ls]'); await shot('E32_asset-location-history.png');
  await go('#/assets/maintenance'); await shot('UI-35_maintenance.png');
  await go('#/assets/maintenance?status=done'); await shot('E33_maintenance-next-cycle.png');
  check('maintenance next cycle', await page.evaluate(id => TH.q.maintTask(id).status === 'planned', data.next));
  await go('#/assets/inventory?building=b_G1&period=2026-09'); await shot('UI-36_inventory.png');
  await page.click('[data-act=propose]'); await shot('E34_inventory-proposal.png');
  await login('ketoan'); await go('#/assets/inventory?building=b_G1&period=2026-09'); await page.click('[data-act=approve][data-role=ketoan]'); await page.waitForTimeout(200); await shot('E35_inventory-dual-approval.png');
  check('dual approval applied', await page.evaluate(() => TH.q.inventorySession('2026-09', 'b_G1').status === 'approved'));
  await go('#/shares/capital?building=b_G1&from=2026-09-01&to=2026-10-31'); await shot('UI-33_actual-contribution-payment.png');
  await go('#/shares/capital?building=b_G1&tab=chi-thuc'); await page.click('[data-act=payout]'); await shot('E36_actual-payout-from-locked-M.png');
  await go('#/shares/capital?building=b_G1&tab=dau-tu-ban-dau'); await shot('E37_G1-initial-investment.png');
  await go('#/shares/capital?building=b_G1&tab=tai-san-coc'); await shot('E38_assets-owner-deposit.png');
  await go('#/reports/forecast?period=2026-09&version=fc_2026-09_v1&tab=ket-qua'); await shot('UI-40_profit-forecast.png');
  check('forecast secondary ratios (SRC-14 8/2025)', await page.evaluate(() => /TCP \/ DT/.test(document.getElementById('content').innerText) && !/chờ định nghĩa/i.test(document.getElementById('content').innerText)));
  await go('#/reports/forecast?period=2026-09&version=' + data.v2 + '&mode=web&tab=phien-ban'); await shot('E39_forecast-versions.png');
  await go('#/reports/forecast?period=2026-08&tab=so-sanh'); await shot('E40_forecast-vs-actual.png');
  await go('#/reports/efficiency?period=2026-08'); await shot('UI-41_capital-efficiency.png');
  await go('#/reports/efficiency?period=2026-08&group=G'); await shot('E41_asset-value-pending.png');
  await go('#/buildings/b_G1?tab=tai-san'); await shot('UI-03A_building-assets-tab.png');
  await go('#/zalo/batches/' + data.batch); await shot('E43_zalo-maintenance-reminder.png');
  await go('#/settings?tab=doi-chieu'); await shot('F37_phase3-acceptance.png');
  check('NT-0…NT-11 acceptance', await page.evaluate(() => [...TH.pages.acceptance(), ...TH.pages.acceptance3()].every(r => r.ok)));
  await login('codong');
  for (const route of ['/dashboard', '/shares?building=b_T2&sh=sh_CHUNG', '/shares/b_G1?source=excel', '/shares/capital?building=b_G1&sh=sh_CHUNG&tab=lich-su', '/reports', '/reports/business?period=2026-08&mode=excel', '/reports/total?period=2026-08', '/reports/buildings?cmp=1', '/reports/efficiency?source=excel']) {
    await go('#' + route);
    const forbidden = await page.evaluate(() => ({ cells: document.querySelectorAll('td.cell').length, manager: !!document.querySelector('[data-f=manager]'), text: document.getElementById('content').innerText }));
    check('shareholder read scope ' + route, forbidden.cells === 0 && !forbidden.manager && !/Chênh so với bảng kê Excel|Tham chiếu số Excel tháng 8/.test(forbidden.text));
  }
  await go('#/shares/capital?building=b_T2'); await shot('E42_shareholder-scope-limited.png');
  check('out-of-scope capital denied', /ngoài phạm vi/.test(await page.locator('#content').innerText()));
  await go('#/reports/forecast?period=2026-09&tab=so-sanh');
  check('forecast view-only for shareholder (GĐ-P3-01)', await page.evaluate(() => { const c = document.getElementById('content'); return !/403/.test(c.innerText) && /Dòng tiền/.test(c.innerText) && !c.querySelector('[data-act=create],[data-act=exp]') && !/So sánh thực tế/.test(c.innerText); }));
  await go('#/tenants'); check('tenants denied for shareholder', /403/.test(await page.locator('#content').innerText()));
  await login('admin'); await page.evaluate(() => TH.ms.set('2')); await go('#/assets'); check('phase 2 gate', /thuộc mốc 3/.test(await page.locator('#content').innerText()));
  await page.evaluate(() => TH.ms.set('3'));
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 768 });
    for (const route of ['/assets/inventory?building=b_G1', '/shares/capital?building=b_G1&tab=chi-thuc', '/reports/forecast?period=2026-09', '/reports/efficiency?period=2026-08']) { await go('#' + route); await shot('responsive-' + route.split('?')[0].split('/').pop() + '-' + width + '.png'); }
  }
  check('no page errors', errors.length === 0, errors.join('; '));
  await ctx.close();
  if (process.argv.includes('--publish')) {
    const map = { 'UI-33_actual-contribution-payment.png': 'B07', 'UI-34_assets.png': 'B08', 'UI-35_maintenance.png': 'B08', 'UI-36_inventory.png': 'B08' };
    artifacts.filter(f => /^(UI-|E\d+)/.test(f)).forEach(f => { const target = path.join(ROOT, 'docs/UI', map[f] || 'B09'); fs.mkdirSync(target, { recursive: true }); fs.copyFileSync(path.join(dir, f), path.join(target, f)); });
  }
} catch (e) { errors.push(e.message); console.error(e.stack); process.exitCode = 1; }
finally {
  fs.writeFileSync(path.join(ROOT, 'output/verify-p3/verification.json'), JSON.stringify({ checks, errors, artifacts, passed: checks.filter(c => c.ok).length }, null, 2));
  if (browser) await browser.close(); server.kill();
}
