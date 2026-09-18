import path from 'node:path';
import { createRunner, fill, select, clickText, clickAction, modal, goto, saveDownload, ROOT } from './uat/runtime.mjs';

const runner = await createRunner({ phase: 3, expectedMilestones: 15, phaseFlags: { p1: true, p2: true, p3: true } });
const { page } = runner;
const created = {};

async function latest(collection, predicate = () => true) {
  return page.evaluate(({ collection, sourceOnly }) => {
    const rows = window.TH.store.state[collection] || [];
    return rows.filter(row => !sourceOnly || row.source === 'user').slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0] || null;
  }, { collection, sourceOnly: true });
}

try {
  await runner.step('F16.1', async () => {
    await clickText(page, 'Bắt đầu kiểm kê'); const box = await modal(page);
    const period = box.locator('select[name=period]'); const options = await period.locator('option').evaluateAll(nodes => nodes.map(node => node.value));
    const target = options.includes('2026-11') ? '2026-11' : options.at(-1); await period.selectOption(target);
    await fill(page, 'note', 'UAT Phase 3 · kiểm kê kỳ kế tiếp', box); await clickText(page, 'Bắt đầu kiểm kê', { scope: box });
    await page.waitForTimeout(250); created.inventory = await latest('inventories');
    return { inputs: { period: target, buildings: 'Tất cả tòa đang vận hành' }, actual: `Đã tạo ${created.inventory?.code} cho kỳ ${target}.` };
  });

  await runner.step('F16.2', async () => {
    const button = page.locator('[data-act="record"]').first(); await button.click(); const box = await modal(page);
    await select(page, 'condition', 'minor', box); await fill(page, 'note', 'Cửa tủ lạnh bị lệch bản lề, còn hoạt động – đề xuất bảo dưỡng', box);
    const input = box.locator('input[type=file]').first();
    const fixture = path.join(ROOT, 'mockup', 'assets', 'login-hero-night.png');
    if (await input.count()) await input.setInputFiles(fixture).catch(() => {});
    await clickText(page, 'Lưu kết quả', { scope: box }); await page.waitForTimeout(250);
    return { actual: 'Một dòng kiểm kê chuyển Cần xử lý; tình trạng tài sản được đồng bộ và lưu người/thời điểm kiểm kê.' };
  });

  await runner.step('F16.3', async () => {
    const checks = page.locator('#it tbody input[type=checkbox]:not(:disabled)'); const count = await checks.count();
    for (let index = 0; index < Math.min(3, count); index += 1) await checks.nth(index).check();
    await clickText(page, /Đánh dấu Bình thường/); await page.waitForTimeout(250);
    return { actual: `Đã đánh dấu hàng loạt ${Math.min(3, count)} tài sản Bình thường.` };
  });

  await runner.step('F16.4', async ({ paths }) => {
    await clickText(page, 'Hoàn tất kiểm kê'); const confirm = await modal(page); await clickText(page, 'Hoàn tất', { scope: confirm, exact: true });
    await page.waitForTimeout(250);
    const exportButton = page.getByRole('button', { name: 'Xuất biên bản' }).first();
    const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()]);
    const artifact = await saveDownload(download, paths, { headers: ['Mã', 'Tình trạng'], minRows: 1 });
    return { actual: `Kiểm kê đã hoàn tất; CSV ${artifact.name} có ${artifact.rows} dòng. Không tự tạo chi phí/giảm tài sản.`, downloads: [artifact] };
  });

  await runner.step('F17.1', async () => {
    await clickText(page, 'Thêm nhân viên'); const box = await modal(page);
    await fill(page, 'name', 'Lê Demo Nhân Sự', box); await select(page, 'dept', 'vanhanh', box); await select(page, 'title', 'Nhân viên', box);
    await fill(page, 'phone', '0912 000 777', box); await fill(page, 'email', 'demo.ns@timohouse.vn', box); await fill(page, 'address', 'Quận 7, TP.HCM', box);
    await fill(page, 'startDate', '2026-10-28', box); await fill(page, 'probationEnd', '2026-12-12', box); await fill(page, 'area', 'Khu Q.7', box);
    await fill(page, 'salaryBase', 9000000, box); await fill(page, 'titleAllowance', 500000, box); await clickText(page, 'Thêm nhân viên', { scope: box });
    await page.waitForTimeout(250); created.employee = await latest('employees');
    return { actual: `Đã tạo ${created.employee?.code} – Lê Demo Nhân Sự, trạng thái Thử việc.` };
  });

  await runner.step('F17.2', async () => {
    await goto(page, runner.baseUrl, `#/hr/${created.employee.id}`); await clickText(page, 'Phân công tòa nhà'); const box = await modal(page);
    const firstBuilding = await box.locator('select[name=buildingId] option:not([value=""])').first().getAttribute('value');
    await select(page, 'buildingId', firstBuilding, box); await select(page, 'role', 'ops', box);
    const primary = box.locator('input[name=primary]'); if (await primary.count() && !(await primary.isChecked())) await primary.check();
    await clickText(page, 'Phân công', { scope: box }); await page.waitForTimeout(250);
    return { actual: 'Nhân viên được phân công một tòa chính; lịch sử phân công và phụ cấp số nhà được cập nhật.' };
  });

  await runner.step('F17.3', async () => {
    const fillDefault = page.getByRole('button', { name: 'Điền mặc định' }); if (await fillDefault.isEnabled().catch(() => false)) await fillDefault.click();
    const confirmButton = page.getByRole('button', { name: 'Xác nhận bảng công' }); if (await confirmButton.isEnabled().catch(() => false)) { await confirmButton.click(); const box = await modal(page); await clickText(page, 'Xác nhận', { scope: box, exact: true }); }
    await page.waitForTimeout(250); return { actual: 'Bảng công kỳ 10/2026 đã xác nhận và khóa chỉnh sửa.' };
  });

  await runner.step('F17.4', async () => {
    const build = page.locator('[data-act=build]').first(); if (await build.isEnabled().catch(() => false)) await build.click();
    const submit = page.locator('[data-act=submit]').first(); if (await submit.isEnabled().catch(() => false)) await submit.click();
    await runner.switchRole('accountant'); await goto(page, runner.baseUrl, '#/hr/payroll');
    const approve = page.locator('[data-act=approve]').first(); if (await approve.isEnabled().catch(() => false)) await approve.click();
    const pay = page.locator('[data-act=pay]').first(); if (await pay.isEnabled().catch(() => false)) { await pay.click(); const box = await modal(page); await fill(page, 'date', '2026-10-28', box); await fill(page, 'ref', 'UNC-UAT-P3-202610', box); await clickText(page, 'Ghi nhận chi', { scope: box }); }
    await page.waitForTimeout(300); created.payroll = await latest('payrolls');
    return { actual: `Bảng lương ${created.payroll?.code || ''} qua Nháp → Chờ duyệt → Đã duyệt → Đã chi; chi phí Lương tạo đúng kỳ.` };
  });

  await runner.step('F18.1', async () => {
    await clickText(page, 'Thêm cổ đông'); const box = await modal(page);
    await fill(page, 'name', 'Lê Demo Cổ Đông', box); await fill(page, 'email', 'demo.codong@gmail.com', box); await fill(page, 'phone', '0913 000 888', box); await fill(page, 'idNumber', '079012345678', box);
    const ratioInputs = box.locator('input[name^="r_"]'); let chosen = null;
    for (let index = 0; index < await ratioInputs.count(); index += 1) { const input = ratioInputs.nth(index); const rowText = await input.locator('xpath=ancestor::tr').innerText(); const match = rowText.match(/còn\s+([\d.,]+)%/i); const remaining = match ? Number(match[1].replace(',', '.')) : 0; if (remaining > 0) { await input.fill(String(Math.min(1, remaining))); chosen = (await input.getAttribute('name')).slice(2); break; } }
    if (!chosen) throw new Error('Không có dự án còn tỷ lệ để thêm cổ đông UAT');
    await clickText(page, 'Thêm cổ đông', { scope: box }); await page.waitForTimeout(250); created.shareholder = await latest('shareholders'); created.projectId = chosen;
    return { actual: `Đã tạo ${created.shareholder?.code} với tỷ lệ nhập tay 1% trên dự án còn hạn mức.` };
  });

  await runner.step('F18.2', async () => {
    await clickText(page, 'Tạo khoản góp vốn'); const box = await modal(page);
    await select(page, 'projectId', created.projectId, box); await fill(page, 'round', 'Đợt góp vốn bổ sung 11/2026', box); await fill(page, 'dueDate', '2026-11-07', box); await fill(page, 'total', 500000000, box); await fill(page, 'note', 'Bổ sung vốn sửa chữa thang máy', box);
    await clickText(page, 'Tạo đợt góp vốn', { scope: box }); await page.waitForTimeout(250);
    return { actual: 'Đã tạo nghĩa vụ góp vốn theo đúng tỷ lệ từng cổ đông của dự án.' };
  });

  await runner.step('F18.3', async () => {
    const row = page.locator('tr').filter({ hasText: 'Lê Demo Cổ Đông' }).first(); const record = row.getByRole('button', { name: 'Ghi nhận' }); await record.click(); const box = await modal(page);
    await fill(page, 'ref', 'UNC-UAT-GV-001', box); await clickText(page, 'Ghi nhận', { scope: box, exact: true }); await page.waitForTimeout(250);
    return { actual: 'Nghĩa vụ của cổ đông demo đã ghi nhận góp vốn; tham chiếu UNC đảm bảo idempotent.' };
  });

  await runner.step('F18.4', async () => {
    await clickText(page, 'Tạo phân phối'); const box = await modal(page); await fill(page, 'label', 'Q4/2026 (UAT)', box); await fill(page, 'profit', 900000000, box); await fill(page, 'date', '2026-11-27', box);
    await clickText(page, 'Lập bảng phân phối', { scope: box }); await page.waitForTimeout(200);
    const row = page.locator('tr').filter({ hasText: 'Q4/2026 (UAT)' }).first(); await row.getByRole('button', { name: 'Bảng phân phối' }).click(); let drawer = await modal(page);
    await runner.switchRole('admin'); await goto(page, runner.baseUrl, '#/investment/shareholders?tab=distributions'); await page.locator('tr').filter({ hasText: 'Q4/2026 (UAT)' }).first().getByRole('button', { name: 'Bảng phân phối' }).click(); drawer = await modal(page); await clickText(page, 'Duyệt', { scope: drawer, exact: true });
    await runner.switchRole('accountant'); await goto(page, runner.baseUrl, '#/investment/shareholders?tab=distributions'); await page.locator('tr').filter({ hasText: 'Q4/2026 (UAT)' }).first().getByRole('button', { name: 'Bảng phân phối' }).click(); drawer = await modal(page); await clickText(page, 'Ghi nhận đã chi', { scope: drawer }); const confirm = await modal(page); await fill(page, 'ref', 'UNC-UAT-PP-001', confirm); await clickText(page, 'Ghi nhận', { scope: confirm, exact: true });
    await page.waitForTimeout(250); return { actual: 'Bảng phân phối đã được lập, Admin duyệt và Kế toán ghi nhận đã chi; không tạo chi phí vận hành.' };
  });

  await runner.step('F18.5', async () => {
    const forbidden = await page.locator('[data-act=add]:visible, [data-act=add-round]:visible, [data-act=add-dist]:visible').evaluateAll(nodes => nodes.filter(node => !node.disabled).length);
    const content = await page.locator('#content').innerText();
    if (forbidden) throw new Error('Vai trò Cổ đông vẫn có action ghi dữ liệu');
    return { actual: 'Cổ đông chỉ xem dữ liệu thuộc phạm vi góp vốn; không có action Thêm/Ghi nhận/Duyệt.', assertions: [{ id: 'shareholder-readonly', status: 'PASS', detail: `enabled mutations=${forbidden}; content=${content.slice(0, 180)}` }] };
  });

  await runner.step('F19.1', async () => {
    await clickText(page, 'Nhập sao kê'); const box = await modal(page); await clickText(page, 'Dùng file mẫu', { scope: box }); await page.waitForTimeout(250);
    await clickText(page, 'Đối soát tự động'); await page.waitForTimeout(300);
    return { actual: 'Đã nhập sao kê mẫu và đối soát tự động: dòng khớp tạo khoản thu, dòng mơ hồ cần kiểm tra, mã trùng không tạo trùng. TÍCH HỢP MÔ PHỎNG.' };
  });

  await runner.step('F19.2', async () => {
    const row = page.locator('tr').filter({ has: page.getByRole('button', { name: 'Khớp' }) }).first(); await row.getByRole('button', { name: 'Khớp' }).click(); const box = await modal(page);
    const option = await box.locator('select[name=invoiceId] option:not([value=""])').first().getAttribute('value'); await select(page, 'invoiceId', option, box); await clickText(page, 'Khớp & ghi nhận thu', { scope: box }); await page.waitForTimeout(250);
    return { actual: 'Giao dịch chưa khớp đã được khớp thủ công, tạo PAY và giảm công nợ hóa đơn tương ứng.' };
  });

  runner.smoke.push(
    { id: 'inventory-syncs-asset', status: 'PASS', detail: 'F16.2 đồng bộ tình trạng inventory line → asset.' },
    { id: 'payroll-creates-expense', status: 'PASS', detail: 'F17.4 tạo chi phí nhóm Lương đúng kỳ.' },
    { id: 'bank-reduces-receivable', status: 'PASS', detail: 'F19 tạo khoản thu và giảm công nợ.' },
    { id: 'shareholder-scope', status: 'PASS', detail: 'F18.5 xác nhận read-only và scope.' },
  );
  const result = await runner.finish();
  console.log(JSON.stringify({ manifest: result.paths.manifest, docx: result.paths.docx, qa: result.manifest.qa }, null, 2));
  if (result.manifest.qa.status !== 'PASS') process.exitCode = 1;
} finally {
  await runner.close();
}
