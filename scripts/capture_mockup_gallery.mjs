/* Capture the running mockup, using the workbook-backed seed in a fresh browser profile. */
import path from 'node:path';
import fs from 'node:fs/promises';
import { chromium } from 'playwright-core';

const base = process.env.TIMEHOUSE_BASE_URL || 'http://localhost:8765';
const out = path.resolve('docs_timonouse/outputs/ui-mockups');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(base + '/#/login');
await page.locator('form button[type="submit"]').click();
await page.waitForTimeout(250);
const ids = await page.evaluate(() => {
  const s = window.TH.store.state;
  const g1 = s.buildings.find(x => x.code === 'G1');
  const room = s.rooms.find(x => x.code === '201G1');
  const contract = s.contracts.find(x => x.roomId === room?.id);
  return { building: g1?.id, room: room?.id, contract: contract?.id, tenant: contract?.tenantId,
    invoice: s.invoices.find(x => x.roomId === room?.id && x.period === '2026-09')?.id,
    landlord: s.landlords.find(x => x.id === g1?.landlordId)?.id,
    refund: s.refunds.find(x => x.buildingId === g1?.id)?.id };
});
const screens = [
  ['01-dashboard-work-queue.png', '/dashboard?period=2026-09'],
  ['02-building-documents.png', `/buildings/${ids.building}?tab=documents`],
  ['03-contract-ocr-review.png', '/contracts/ocr'],
  ['04-building-service-prices.png', `/buildings/${ids.building}?tab=services`],
  ['05-invoice-collection.png', `/invoices/${ids.invoice}`],
  ['06-tenant-lifecycle.png', `/tenants/${ids.tenant}`],
  ['07-expenses-import.png', '/expenses?period=2026-09'],
  ['08-landlord-buildings-rooms.png', `/landlords/${ids.landlord}?tab=buildings`],
  ['09-payroll-collection-performance.png', '/hr/payroll?period=2026-09'],
  ['10-business-reports.png', `/reports/building-profit?period=2026-08&buildingId=${ids.building}`],
  ['11-room-meters.png', `/meters?period=2026-09&buildingId=${ids.building}`],
  ['12-contract-end-refund.png', ids.refund ? `/refunds/${ids.refund}` : '/refunds?period=2026-09'],
  ['13-building-assignments.png', '/hr/assignments'],
  ['14-assets-shareholders.png', `/assets?buildingId=${ids.building}`],
  ['15-settings-import-jobs.png', '/settings/jobs'],
  ['16-landlord-head-lease-wizard.png', '/landlords/new'],
  ['17-invoice-electricity-carry-forward.png', `/rooms/${ids.room}?tab=meters`],
  ['18-commissions.png', '/commissions?period=2026-09'],
  ['19-head-lease-costs.png', `/head-lease-costs?buildingId=${ids.building}&year=2026`],
  ['20-business-summary.png', '/reports/business-summary?period=2026-08'],
];
const checks = await page.evaluate(() => {
  const s = window.TH.store.state, b = s.buildings.find(x => x.code === 'G1');
  const room = code => s.rooms.find(x => x.buildingId === b.id && x.code === code);
  const invoice = code => s.invoices.find(x => x.roomId === room(code)?.id && x.period === '2026-09');
  const paid = inv => s.paymentAllocations.filter(x => x.invoiceId === inv?.id).reduce((n, x) => n + Number(x.amount), 0);
  const common = s.meterReadings.find(x => x.type === 'common-electric' && x.usage === 32);
  const main = s.meterReadings.find(x => x.comparisonOnly && x.period === '2026-09');
  const gA = s.goldenDatasets.find(x => x.code === 'GOLDEN-A-G1-202608');
  const gB = s.goldenDatasets.find(x => x.code === 'GOLDEN-B-202608');
  const values = {
    g1Rooms: s.rooms.filter(x => x.buildingId === b.id).length,
    invoice101: invoice('101G1')?.total,
    invoice401: invoice('401G1')?.total,
    electric202: s.meterReadings.find(x => x.roomId === room('202G1')?.id && x.type === 'electric' && x.readingType !== 'CLOSING')?.curr - 2024,
    commonPerPerson: common?.amount / common?.people,
    mainTotal: main?.amount,
    short304: invoice('304G1')?.total - paid(invoice('304G1')),
    sharePct: s.buildingShares.filter(x => x.buildingId === b.id).reduce((n, x) => n + Number(x.percentage), 0),
    capitalDifference: b.capitalReconciliation?.difference,
    goldenNet: gA?.values.NET_PROFIT,
    goldenNewRooms: gB?.values.NEW_ROOM_COUNT.total,
    commissions: s.commissions.filter(x => x.period === '2026-09').length,
    leaseCF: window.TH.reportP1.compute('2026-09', b.id).values.HEAD_LEASE_COST,
    meterIssues: window.TH.q.meterRows('2026-09', { buildingId: b.id }).filter(x => x.electric.issues.includes('duplicate')).length,
  };
  return values;
});
const expected = { g1Rooms: 15, invoice101: 4404000, invoice401: 4784000, electric202: 523, commonPerPerson: 40533.333333, mainTotal: 3087000, short304: 60000, sharePct: 100, capitalDifference: 1862000, goldenNet: 14664969.248777, goldenNewRooms: 95, commissions: 13, leaseCF: 48000000, meterIssues: 0 };
const mismatches = Object.entries(expected).filter(([key, value]) => Math.abs(Number(checks[key]) - value) > (key === 'commonPerPerson' || key === 'goldenNet' ? 0.01 : 0));
await fs.mkdir(out, { recursive: true });
const results = [];
for (const [file, route] of screens) {
  await page.goto(base + '/#' + route);
  await page.waitForTimeout(200);
  await page.evaluate(() => { const toast = document.querySelector('#toast-root'); if (toast) toast.innerHTML = ''; });
  const state = await page.evaluate(() => ({ title: document.title, heading: document.querySelector('h1')?.textContent || '', overflow: document.documentElement.scrollWidth > innerWidth + 1, text: document.body.innerText.slice(0, 200) }));
  await page.screenshot({ path: path.join(out, file), fullPage: true });
  results.push({ file, route, ...state });
}
const responsive = [];
for (const width of [375, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of ['/meters?period=2026-09&buildingId=' + ids.building, '/commissions?period=2026-09', '/head-lease-costs?buildingId=' + ids.building, '/invoices/' + ids.invoice]) {
    await page.goto(base + '/#' + route);
    responsive.push(await page.evaluate(route => ({ width: innerWidth, route, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }), route));
  }
}
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(base + '/#/commissions?period=2026-09');
await page.locator('#commission-table [data-act="detail"]').first().click();
await page.locator('.overlay [data-act="confirm"]').click();
await page.locator('.overlay input[name="reason"]').fill('Đối chiếu thủ công trong phiên kiểm tra giao diện');
await page.locator('.overlay [data-act="yes"]').click();
await page.locator('#commission-table [data-act="detail"]').first().click();
await page.locator('.overlay [data-act="pay"]').click();
await page.locator('.overlay input[name="paidDate"]').fill('2026-09-23');
await page.locator('.overlay input[name="evidence"]').fill('QA-UI26-001');
await page.locator('.overlay [data-act="yes"]').click();
const commissionFlow = await page.evaluate(() => {
  const s = window.TH.store.state, x = s.commissions.find(x => x.evidence === 'QA-UI26-001');
  const expenses = s.expenses.filter(e => e.commissionId === x?.id);
  return { status: x?.status, expenseCount: expenses.length, categoryCode: expenses[0]?.categoryCode, accountingPeriod: expenses[0]?.accountingPeriod };
});
await page.goto(base + '/#/reports/building-profit?period=2026-08&buildingId=' + ids.building);
const reportViews = { sourceA: await page.locator('.kpi .vl').first().innerText(), hangShare: await page.locator('#content').innerText().then(x => x.includes('12.532.993,85')) };
await page.locator('[data-act="source"]').click();
reportViews.liveA = await page.locator('.kpi .vl').first().innerText();
await page.goto(base + '/#/reports/business-summary?period=2026-08');
reportViews.sourceB = await page.locator('.kpi .vl').last().innerText();
await browser.close();
console.log(JSON.stringify({ ids, checks, mismatches, commissionFlow, reportViews, errors, responsive, results }, null, 2));
if (errors.length || mismatches.length || commissionFlow.status !== 'paid' || commissionFlow.expenseCount !== 1 || commissionFlow.categoryCode !== 'BH-HH' || commissionFlow.accountingPeriod !== '2026-09' || !reportViews.sourceA.includes('84,186,000') || !reportViews.hangShare || !reportViews.sourceB.includes('7,036,256,236') || responsive.some(x => x.overflow) || results.some(x => x.overflow || /undefined|không tìm thấy|404/i.test(x.heading))) process.exitCode = 1;
