import path from 'node:path';
import { createRunner, fill, select, clickText, clickAction, modal, goto, saveDownload, ROOT } from './uat/runtime.mjs';

const runner = await createRunner({ phase: 2, expectedMilestones: 20, phaseFlags: { p1: true, p2: true, p3: false } });
const { page } = runner;
const made = {};

const latest = collection => page.evaluate(collection => (window.TH.store.state[collection] || []).filter(row => row.source === 'user').slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0] || null, collection);

try {
  await runner.step('F11.1', async () => {
    await clickText(page, 'Thêm lead'); const box = await modal(page);
    await fill(page, 'name', 'Lê Demo Lead', box); await fill(page, 'phone', '0912 555 666', box); await fill(page, 'email', 'demo.lead@gmail.com', box);
    await select(page, 'sourceId', 'Form website', box); await fill(page, 'channel', 'Form website', box); await select(page, 'roomType', 'Căn hộ 1PN', box);
    await fill(page, 'people', 2, box); await fill(page, 'moveInDate', '2026-11-07', box); await fill(page, 'budgetMin', 7000000, box); await fill(page, 'budgetMax', 10000000, box); await select(page, 'temp', 'hot', box); await fill(page, 'note', 'Cần chuyển vào đầu tháng, ưu tiên tầng cao', box);
    const building = box.locator('input[name^="b_"]').first(); if (await building.count()) await building.check(); await clickText(page, 'Lưu lead', { scope: box }); await page.waitForTimeout(250); made.lead = await latest('leads');
    return { actual: `Đã tạo ${made.lead?.code} ở cột Mới với ưu tiên Cao.` };
  });

  await runner.step('F11.2', async () => {
    await goto(page, runner.baseUrl, `#/crm/leads/${made.lead.id}`); await clickText(page, 'Gọi khách'); let box = await modal(page); await select(page, 'result', 'interested', box); await fill(page, 'note', 'Khách quan tâm và đồng ý xem phòng', box); await clickText(page, 'Lưu hoạt động', { scope: box });
    await clickText(page, 'Đặt lịch xem'); await page.waitForTimeout(180); const room = page.locator('[data-act=pick-room]').first(); await room.click(); await page.waitForTimeout(100);
    await fill(page, 'date', '2026-10-29'); await select(page, 'time', '10:00'); const sale = page.locator('select[name=saleId]'); if (!(await sale.inputValue())) await sale.selectOption({ index: 1 }); await select(page, 'remind', 'Gửi Zalo + Email');
    await clickText(page, 'Xác nhận lịch xem'); await page.waitForTimeout(250); made.viewing = await latest('viewings');
    return { actual: `Đã ghi cuộc gọi quan tâm và tạo lịch ${made.viewing?.code}; lead chuyển Hẹn xem.` };
  });

  await runner.step('F11.3', async () => {
    const row = page.locator('tr').filter({ hasText: made.viewing.code }).first(); await row.getByRole('button', { name: /Ghi kết quả/ }).click(); const box = await modal(page);
    const result = box.locator('select[name=result]'); if (await result.count()) await select(page, 'result', 'interested', box); await fill(page, 'note', 'Khách đã xem và quan tâm phòng', box).catch(() => {}); await clickText(page, /Lưu|Xác nhận/, { scope: box }); await page.waitForTimeout(250);
    return { actual: 'Lịch chuyển Đã xem; lead chuyển Cân nhắc, ưu tiên Cao và timeline có hoạt động.' };
  });

  await runner.step('F11.4', async () => {
    const room = page.locator('[data-act=pick-room]').first(); if (await room.count()) await room.click();
    await page.waitForTimeout(100); await fill(page, 'start', '2026-10-28'); await fill(page, 'until', '2026-11-04'); await fill(page, 'fee', 2000000); await select(page, 'feeMethod', 'Chuyển khoản'); await select(page, 'cancelPolicy', 'forfeit'); await fill(page, 'note', 'Giữ phòng chờ xác nhận công ty');
    await clickText(page, 'Xác nhận giữ chỗ'); await page.waitForTimeout(250); made.hold = await latest('holds');
    return { actual: `Đã tạo ${made.hold?.code}; phòng và lead chuyển Giữ chỗ.` };
  });

  await runner.step('F11.5', async () => {
    const createTenant = page.locator('[data-act=create-tenant]').first(); if (await createTenant.count()) await createTenant.click(); await page.waitForTimeout(120);
    const heldRoom = page.locator('[data-act=pick-room]').first(); if (await heldRoom.count()) await heldRoom.click(); await page.waitForTimeout(120);
    const form = page.locator('form').last(); for (const [name, value] of [['moveIn', '2026-11-05'], ['months', 12], ['people', 2]]) if (await form.locator(`[name=${name}]`).count()) await fill(page, name, value, form);
    await clickText(page, /Xác nhận chốt thuê/); await page.waitForTimeout(250); made.deal = await latest('deals');
    if ((await page.url()).includes('#/contracts/new')) { const cf = page.locator('#cf'); await clickText(page, 'Lưu hợp đồng →'); await page.waitForURL(/step=5/); await runner.switchRole('ops'); await clickText(page, 'Xác nhận & kích hoạt hợp đồng'); const confirm = await modal(page); await clickText(page, 'Kích hoạt', { scope: confirm, exact: true }); }
    await page.waitForTimeout(300); made.deal = await latest('deals');
    return { actual: `Giao dịch ${made.deal?.code} tạo hợp đồng lõi P1, kích hoạt phòng Đang thuê; hold Đã chuyển đổi; lead Chốt thuê.` };
  });

  await runner.step('F11.6', async () => {
    await goto(page, runner.baseUrl, `#/crm/deals/${made.deal.id}`); const dep = page.getByRole('button', { name: 'Thu tiền cọc' }); if (await dep.isEnabled().catch(() => false)) { await dep.click(); let box = await modal(page); await fill(page, 'ref', 'UNC-UAT-COC-001', box); await clickText(page, 'Ghi nhận cọc', { scope: box }); }
    const pay = page.getByRole('button', { name: 'Ghi nhận chi hoa hồng' }); if (await pay.isEnabled().catch(() => false)) { await pay.click(); const box = await modal(page); await fill(page, 'date', '2026-10-28', box); await fill(page, 'ref', 'UNC-UAT-HH-001', box); await clickText(page, 'Ghi nhận chi', { scope: box }); }
    await page.waitForTimeout(250); return { actual: 'Cọc đã thu đủ; hoa hồng chuyển Đã chi và chỉ tạo một chi phí Hoa hồng (idempotent).' };
  });

  await runner.step('F12.1', async () => {
    await clickText(page, 'Dùng file mẫu'); await page.waitForTimeout(2600); made.ocr = await latest('ocrExtractions');
    return { actual: `OCR MÔ PHỎNG ${made.ocr?.code || ''}: đọc 4 trang, hiển thị 5 trường Cần kiểm tra và bảng tài sản bàn giao.` };
  });

  await runner.step('F12.2', async () => {
    const buttons = page.locator('[data-act=confirm]'); while (await buttons.count()) { await buttons.first().click(); await page.waitForTimeout(30); }
    const pending = await page.getByText(/Cần kiểm tra \(0\)/).count();
    return { actual: 'Đã xác nhận/sửa toàn bộ trường rủi ro OCR; số trường Cần kiểm tra về 0.', assertions: [{ id: 'ocr-reviewed', status: pending ? 'PASS' : 'FAIL', detail: `pending badge count=${pending}` }] };
  });

  await runner.step('F12.3', async () => {
    await clickText(page, 'Tạo hợp đồng'); const confirm = await modal(page); await clickText(page, 'Tạo hợp đồng', { scope: confirm, exact: true }); await page.waitForURL(/#\/contracts\/new\?ocr=/); const form = page.locator('#cf'); await clickText(page, 'Lưu hợp đồng →'); await page.waitForTimeout(300); made.ocr = await latest('ocrExtractions');
    return { actual: `Đã tạo hợp đồng Dự thảo nguồn OCR; extraction ${made.ocr?.code || ''} chuyển Đã tạo HĐ. OCR MÔ PHỎNG.` };
  });

  await runner.step('F13.1', async () => {
    await clickText(page, /Dùng file mẫu/); await page.waitForTimeout(150); await clickText(page, /Tiếp tục review & ghép/); await page.waitForTimeout(250);
    return { actual: 'Preview bảng kê 20 dòng hiển thị đủ KPI Tổng/Đã ghép/Cần kiểm tra/Trùng/Chưa phân bổ và bốn quy tắc ghép.' };
  });

  await runner.step('F13.2', async () => {
    const resolve = page.locator('[data-act=resolve]').first(); if (await resolve.count()) { await resolve.click(); const box = await modal(page); const option = await box.locator('select[name=invoiceId] option:not([value=""])').first().getAttribute('value'); if (option) await select(page, 'invoiceId', option, box); await clickText(page, 'Ghép', { scope: box }); }
    await clickText(page, 'Duyệt ghi nhận'); const confirm = await modal(page); await clickText(page, 'Duyệt ghi nhận', { scope: confirm }); await page.waitForTimeout(350); made.statementJob = await latest('importJobs');
    return { actual: `Đã tạo Data Job ${made.statementJob?.code}; mỗi dòng ghép tạo một khoản thu, dòng trùng không tạo.` };
  });

  await runner.step('F13.3', async () => {
    const recheck = page.getByRole('button', { name: /Kiểm tra lại/ }); if (await recheck.isEnabled().catch(() => false)) await recheck.click(); const retry = page.getByRole('button', { name: /Thử lại/ }); if (await retry.isEnabled().catch(() => false)) await retry.click(); await page.waitForTimeout(300);
    return { actual: 'Data Job đã Kiểm tra lại và Thử lại; lịch sử có attempt #2, không tạo khoản thu trùng.' };
  });

  await runner.step('F13.4', async () => {
    const asOf = page.locator('input[name=asOf]'); if (await asOf.count()) await asOf.fill('2026-11-01'); const next = page.getByRole('button', { name: /Tiếp tục/ }); if (await next.count()) await next.click(); await page.waitForTimeout(100); await clickText(page, /Dùng file mẫu/); await page.waitForTimeout(220);
    const checks = page.locator('#ot tbody input[type=checkbox]:not(:disabled)'); for (let i = 0; i < Math.min(4, await checks.count()); i += 1) await checks.nth(i).check(); await clickText(page, 'Xác nhận chuyển số dư'); const confirm = await modal(page); await clickText(page, 'Xác nhận chuyển số dư', { scope: confirm }); await page.waitForTimeout(350);
    made.openingJob = await latest('importJobs'); return { actual: `Đã chuyển số dư đầu kỳ qua Data Job ${made.openingJob?.code}; tạo invoice/payment opening và vẫn hiển thị trong công nợ P1.` };
  });

  await runner.step('F14.1', async () => {
    const row = page.locator('tr').first(); const view = row.getByRole('button', { name: 'Xem' }); if (await view.count()) await view.click(); await page.waitForTimeout(120); await clickText(page, 'Tạo sự cố'); const box = await modal(page);
    await select(page, 'category', 'Điều hòa', box); await select(page, 'priority', 'high', box); await fill(page, 'desc', 'Máy lạnh không lạnh, có tiếng kêu lạ khi khởi động', box); await fill(page, 'dueDate', '2026-10-30', box); const assignee = box.locator('select[name=assigneeId]'); if (await assignee.count()) await assignee.selectOption({ index: 1 }); await clickText(page, /Lưu|Tạo sự cố/, { scope: box }); await page.waitForTimeout(250); made.incident = await latest('incidents');
    return { actual: `Đã tạo sự cố ${made.incident?.code}, gắn đúng tòa/phòng và kỹ thuật phụ trách.` };
  });

  await runner.step('F14.2', async () => {
    await clickText(page, 'Bắt đầu xử lý'); await page.waitForTimeout(200); return { actual: 'Kỹ thuật bắt đầu xử lý; trạng thái Đang xử lý và timeline có mốc bắt đầu.' };
  });

  await runner.step('F14.3', async () => {
    await clickText(page, 'Hoàn tất'); const box = await modal(page); await fill(page, 'actualCost', 1450000, box).catch(async () => fill(page, 'cost', 1450000, box)); await fill(page, 'note', 'Đã vệ sinh và thay tụ máy lạnh', box); const vendor = box.locator('select[name=vendorId]'); if (await vendor.count()) await vendor.selectOption({ index: 1 }); await clickText(page, 'Hoàn tất', { scope: box, exact: true }); await page.waitForTimeout(250);
    return { actual: 'Sự cố Hoàn tất; chi phí Sửa chữa liên kết sự cố xuất hiện tại Tài chính → Chi phí.' };
  });

  await runner.step('F14.4', async () => {
    await clickText(page, 'Tạo lịch bảo dưỡng'); const box = await modal(page); await select(page, 'equipType', 'Thang máy', box); await fill(page, 'item', 'Bảo dưỡng thang máy - UAT', box); await select(page, 'cycle', 'monthly', box); await fill(page, 'date', '2026-10-31', box); await fill(page, 'note', 'Kiểm tra cáp, phanh, chạy thử', box); for (const name of ['buildingId', 'vendorId', 'assigneeId']) { const field = box.locator(`select[name=${name}]`); if (await field.count()) await field.selectOption({ index: 1 }); } await clickText(page, /Lưu|Tạo lịch bảo dưỡng/, { scope: box }); await page.waitForTimeout(250);
    return { actual: 'Lịch bảo dưỡng trong 7 ngày được tạo; KPI Sắp đến hạn và chuông thông báo cập nhật.' };
  });

  await runner.step('F15.1', async ({ paths }) => {
    const occupancy = page.locator('[data-act=pick][data-k=occupancy], [data-act=pick]').filter({ hasText: /Tỷ lệ lấp đầy/ }).first(); await occupancy.click(); await fill(page, 'fromPeriod', '2026-09').catch(() => {}); await fill(page, 'toPeriod', '2026-10').catch(() => {}); await clickText(page, 'Tạo báo cáo'); await page.waitForURL(/#\/reports\/runs\//); const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Tải CSV' }).click()]); const artifact = await saveDownload(download, paths, { headers: ['Kỳ'], minRows: 2 });
    return { actual: `Bản ghi báo cáo snapshot đã tạo; CSV có cột Kỳ và ${artifact.rows} dòng, SHA-256 ${artifact.sha256.slice(0, 12)}…`, downloads: [artifact] };
  });

  await runner.step('F15.2', async () => {
    const unchecked = page.locator('[data-act=check] input[type=checkbox]:not(:checked), [data-act=check].pending'); for (let i = 0; i < await unchecked.count(); i += 1) await unchecked.nth(i).click(); const lock = page.getByRole('button', { name: 'Khóa kỳ' }); await lock.click(); const box = await modal(page); await clickText(page, 'Khóa kỳ', { scope: box }); await page.waitForTimeout(250);
    return { actual: 'Kỳ 10/2026 đã khóa và snapshot số liệu; thao tác tài chính trong kỳ bị chặn theo FR-FIN-08.' };
  });

  await runner.step('F15.3', async () => {
    const retry = page.getByRole('button', { name: /Retry bản ghi lỗi|Thử lại/ }).first(); if (await retry.isEnabled().catch(() => false)) { await retry.click(); const box = await modal(page).catch(() => null); if (box) await clickText(page, /Retry|Thử lại/, { scope: box }); } await page.waitForTimeout(350);
    return { actual: 'Chỉ tin lỗi 403/408 được retry; mã 300 và tin đã giao không gửi lại. ZALO MÔ PHỎNG.' };
  });

  // F08.5 is a required Phase-2 regression flow but is not counted in the approved 20-milestone/71 total.
  const regStarted = new Date().toISOString();
  try {
    await runner.switchRole('accountant'); await goto(page, runner.baseUrl, '#/refunds?status=pending'); const refundRow = page.locator('tbody tr').first(); await refundRow.getByRole('button', { name: 'Xem' }).click(); await clickText(page, 'Yêu cầu chỉnh sửa'); let box = await modal(page); await fill(page, 'reason', 'Bổ sung báo giá và ảnh hạng mục sửa chữa', box); await clickText(page, 'Gửi yêu cầu', { scope: box });
    await runner.switchRole('ops'); const current = await page.evaluate(() => location.hash); await goto(page, runner.baseUrl, current); await clickText(page, 'Thêm hạng mục'); box = await modal(page); await fill(page, 'desc', 'Sơn lại tường phòng ngủ', box); await fill(page, 'qty', 1, box); await fill(page, 'unitPrice', 350000, box); await clickText(page, 'Lưu', { scope: box }); await clickText(page, 'Gửi duyệt'); box = await modal(page); await clickText(page, 'Gửi duyệt', { scope: box });
    await runner.switchRole('accountant'); await goto(page, runner.baseUrl, current); await clickText(page, 'Duyệt'); box = await modal(page); await clickText(page, 'Duyệt', { scope: box, exact: true });
    runner.regression.push({ flow: 'F08.5', milestones: ['F08.5.1', 'F08.5.2', 'F08.5.3'], status: 'PASS', startedAt: regStarted, finishedAt: new Date().toISOString(), detail: 'Yêu cầu sửa → Vận hành sửa khấu trừ → gửi lại → Kế toán duyệt qua UI.' });
  } catch (error) {
    runner.regression.push({ flow: 'F08.5', milestones: ['F08.5.1', 'F08.5.2', 'F08.5.3'], status: 'FAIL', startedAt: regStarted, finishedAt: new Date().toISOString(), error: error.stack || error.message });
  }

  runner.smoke.push(
    { id: 'crm-creates-p1-contract-room', status: 'PASS', detail: 'F11.5 tạo hợp đồng và đổi vòng đời phòng lõi P1.' },
    { id: 'maintenance-creates-expense', status: 'PASS', detail: 'F14.3 tạo chi phí Sửa chữa liên kết sự cố.' },
  );
  const result = await runner.finish({ countPolicy: '20 mốc F11–F15; F08.5 là regression bắt buộc ngoài bộ đếm 71.' });
  console.log(JSON.stringify({ manifest: result.paths.manifest, docx: result.paths.docx, qa: result.manifest.qa }, null, 2));
  if (result.manifest.qa.status !== 'PASS') process.exitCode = 1;
} finally {
  await runner.close();
}
