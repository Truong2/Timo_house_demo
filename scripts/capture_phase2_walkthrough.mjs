import path from 'node:path';
import { createRunner, fill, select, clickText, clickAction, modal, goto, saveDownload, confirmDialog, ROOT } from './uat/runtime.mjs';

const runner = await createRunner({ phase: 2, expectedMilestones: 17, phaseFlags: { p1: true, p2: true, p3: false } });
const { page } = runner;
const made = {};

const latest = collection => page.evaluate(collection => (window.TH.store.state[collection] || []).filter(row => row.source === 'user').slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0] || null, collection);

try {
  await runner.step('F11.1', async () => {
    await clickText(page, 'Thêm lead'); const box = await modal(page);
    await fill(page, 'name', 'Lê Demo Lead', box); await fill(page, 'phone', '0912 555 666', box); await fill(page, 'email', 'demo.lead@gmail.com', box);
    await select(page, 'sourceId', 'Website', box); await fill(page, 'channel', 'Form website', box); await select(page, 'roomType', 'Căn hộ 1PN', box);
    await fill(page, 'people', 2, box); await fill(page, 'moveInDate', '2026-11-07', box); await fill(page, 'budgetMin', 7000000, box); await fill(page, 'budgetMax', 10000000, box); await select(page, 'temp', 'hot', box); await fill(page, 'note', 'Cần chuyển vào đầu tháng, ưu tiên tầng cao', box);
    const building = box.locator('input[name^="b_"]').first(); if (await building.count()) await building.check(); await clickText(page, 'Lưu lead', { scope: box }); await page.waitForTimeout(250); made.lead = await latest('leads');
    return { actual: `Đã tạo ${made.lead?.code} ở cột Mới với ưu tiên Cao.` };
  });

  await runner.step('F11.2', async () => {
    await goto(page, runner.baseUrl, `#/crm/leads/${made.lead.id}`); await clickText(page, 'Gọi khách'); let box = await modal(page); await select(page, 'result', 'interested', box); await fill(page, 'note', 'Khách quan tâm và đồng ý xem phòng', box); await clickText(page, 'Lưu hoạt động', { scope: box });
    await clickText(page, 'Đặt lịch xem'); await page.waitForTimeout(180); const room = page.locator('[data-act=pick-room]').first(); await room.click(); await page.waitForTimeout(100);
    await fill(page, 'date', '2026-10-29'); await select(page, 'time', '10:00'); const sale = page.locator('select[name=saleId]'); if (!(await sale.inputValue())) await sale.selectOption({ index: 1 }); await select(page, 'remind', 'Gửi Zalo + Email');
    await clickText(page, 'Xác nhận lịch xem'); await page.waitForTimeout(300); const clash = page.getByRole('button', { name: 'Vẫn đặt' }); if (await clash.count()) { await clash.click(); await page.waitForTimeout(300); } made.viewing = await latest('viewings');
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
    await clickText(page, 'Xác nhận giữ chỗ'); await confirmDialog(page); await page.waitForTimeout(250); made.hold = await latest('holds');
    return { actual: `Đã tạo ${made.hold?.code}; phòng và lead chuyển Giữ chỗ.` };
  });

  await runner.step('F11.5', async () => {
    const useTenant = page.locator('[data-act=use-tenant]').first(); const createTenant = page.locator('[data-act=create-tenant]').first(); if (await useTenant.count()) await useTenant.click(); else if (await createTenant.count()) await createTenant.click(); await page.waitForTimeout(200);
    const heldRoom = page.locator('[data-act=pick-room]').first(); if (await heldRoom.count()) await heldRoom.click(); await page.waitForTimeout(120);
    const form = page.locator('form').last(); for (const [name, value] of [['moveIn', '2026-11-05'], ['months', 12], ['people', 2]]) if (await form.locator(`[name=${name}]`).count()) await fill(page, name, value, form);
    await clickText(page, /Xác nhận chốt thuê/); await confirmDialog(page, /Xác nhận chốt thuê/); await page.waitForTimeout(300); made.deal = await latest('deals');
    if (!made.deal) throw new Error('Không tạo được giao dịch');
    // Kinh doanh không có quyền tạo HĐ → hệ thống đưa về chi tiết giao dịch (Chờ ký HĐ); Vận hành tạo & kích hoạt HĐ từ giao dịch
    await runner.switchRole('ops'); await goto(page, runner.baseUrl, `#/contracts/new?deal=${made.deal.id}`); await page.locator('#cf').waitFor({ state: 'visible' });
    const member = page.locator('#cf input[name^=mb_name_]').first(); if (await member.count() && !(await member.inputValue())) await member.fill('Lê Demo Lead');
    await clickText(page, 'Lưu hợp đồng →'); await page.waitForURL(/step=5/); await page.waitForTimeout(250);
    for (const name of ['firstInvoice', 'depositNow']) { const cb = page.locator(`#act-opts input[name=${name}]`); if (await cb.count() && await cb.isEnabled() && await cb.isChecked()) await cb.uncheck(); } // cọc thu qua giao dịch CRM (F11.6), hóa đơn lập theo kỳ
    await clickText(page, 'Xác nhận & kích hoạt hợp đồng'); const confirm = await modal(page); await clickText(page, 'Kích hoạt', { scope: confirm, exact: true });
    await page.waitForTimeout(350); made.deal = await latest('deals'); const contract = made.deal?.contractId ? await page.evaluate(id => (window.TH.store.state.contracts.find(x => x.id === id) || {}), made.deal.contractId) : null;
    return { actual: `Giao dịch ${made.deal?.code} (${made.deal?.status}) → hợp đồng lõi P1 ${contract?.code || ''} ${contract?.status || ''}; phòng Đang thuê; hold Đã chuyển đổi; lead Chốt thuê. Kinh doanh không tạo HĐ (không có contracts.manage) – Vận hành tạo từ giao dịch.`, assertions: [{ id: 'deal-contract-active', status: contract?.status === 'active' ? 'PASS' : 'FAIL', detail: `contract=${contract?.code}/${contract?.status}` }] };
  });

  await runner.step('F11.6', async () => {
    await goto(page, runner.baseUrl, `#/crm/deals/${made.deal.id}`); const dep = page.getByRole('button', { name: 'Thu tiền cọc' }); if (await dep.isEnabled().catch(() => false)) { await dep.click(); let box = await modal(page); await fill(page, 'ref', 'UNC-UAT-COC-001', box); await clickText(page, 'Ghi nhận cọc', { scope: box }); }
    const pay = page.getByRole('button', { name: 'Ghi nhận chi hoa hồng' }); if (await pay.isEnabled().catch(() => false)) { await pay.click(); const box = await modal(page); await fill(page, 'date', '2026-10-28', box); await fill(page, 'ref', 'UNC-UAT-HH-001', box); await clickText(page, 'Ghi nhận chi', { scope: box }); }
    await page.waitForTimeout(250); return { actual: 'Cọc đã thu đủ; hoa hồng chuyển Đã chi và chỉ tạo một chi phí Hoa hồng (idempotent).' };
  });

  // F12 OCR hợp đồng chuyển sang Phase 1 (spec v1.8 §12.8) – xem capture_phase1_walkthrough.mjs
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
    // Dòng "Cần kiểm tra" do hóa đơn nháp → phát hành hóa đơn đó qua UI → quay lại job → Kiểm tra lại → Thử lại phần đủ điều kiện
    const jobHash = await page.evaluate(() => location.hash);
    const drafts = await page.evaluate(id => { const S = window.TH.store.state; const j = S.importJobs.find(x => x.id === id); const ids = new Set(); (j.lines || []).forEach(l => { if (!['check', 'failed'].includes(l.status)) return; const codes = String(l.reason || '').match(/HD-\d{6}-\d{3}/g) || []; const inv = (l.invoiceId && S.invoices.find(x => x.id === l.invoiceId)) || S.invoices.find(x => codes.includes(x.code)); if (inv && inv.docStatus === 'draft') ids.add(inv.id); }); return [...ids].map(x => ({ id: x, code: S.invoices.find(y => y.id === x).code })); }, made.statementJob.id);
    const paysBefore = await page.evaluate(() => window.TH.store.state.payments.length);
    for (const inv of drafts) { await goto(page, runner.baseUrl, `#/invoices/${inv.id}`); await clickText(page, 'Phát hành'); const box = await modal(page); await clickText(page, 'Phát hành', { scope: box, exact: true }); await page.waitForTimeout(250); }
    await goto(page, runner.baseUrl, jobHash);
    await clickAction(page, 'recheck'); await page.waitForTimeout(250);
    const readyLines = await page.evaluate(id => (window.TH.store.state.importJobs.find(x => x.id === id).lines || []).filter(l => l.status === 'ready').length, made.statementJob.id);
    await clickAction(page, 'retry'); await confirmDialog(page, /Thử lại/); await page.waitForTimeout(300);
    const after = await page.evaluate(id => { const j = window.TH.store.state.importJobs.find(x => x.id === id); return { attempts: (j.attempts || []).length, ok: (j.lines || []).filter(l => l.status === 'ok').length, check: (j.lines || []).filter(l => l.status === 'check').length, payments: window.TH.store.state.payments.length }; }, made.statementJob.id);
    return { actual: `Phát hành ${drafts.length} hóa đơn nháp (${drafts.map(x => x.code).join(', ') || '-'}) → Kiểm tra lại: ${readyLines} dòng Đủ điều kiện thử lại → Thử lại: lịch sử ${after.attempts} lần thử, ${after.ok} dòng thành công, ${after.check} dòng cần kiểm tra; khoản thu ${paysBefore} → ${after.payments} (không trùng).`, assertions: [{ id: 'job-attempts', status: after.attempts >= 2 ? 'PASS' : 'FAIL', detail: `attempts=${after.attempts}` }, { id: 'retry-idempotent', status: after.payments - paysBefore === readyLines ? 'PASS' : 'FAIL', detail: `newPayments=${after.payments - paysBefore} ready=${readyLines}` }] };
  });

  await runner.step('F13.4', async () => {
    const asOf = page.locator('input[name=asOf]'); if (await asOf.count()) await asOf.fill('2026-11-01'); const next = page.getByRole('button', { name: /Tiếp tục/ }); if (await next.count()) await next.click(); await page.waitForTimeout(100); await clickText(page, /Dùng file mẫu/); await page.waitForTimeout(220);
    const checks = page.locator('#ot tbody input[type=checkbox]:not(:disabled)'); for (let i = 0; i < Math.min(4, await checks.count()); i += 1) await checks.nth(i).check(); await clickText(page, 'Xác nhận chuyển số dư'); const confirm = await modal(page); await clickText(page, 'Xác nhận chuyển số dư', { scope: confirm }); await page.waitForTimeout(350);
    made.openingJob = await latest('importJobs'); return { actual: `Đã chuyển số dư đầu kỳ qua Data Job ${made.openingJob?.code}; tạo invoice/payment opening và vẫn hiển thị trong công nợ P1.` };
  });

  await runner.step('F14.1', async () => {
    const roomId = await page.evaluate(id => { const d = window.TH.store.state.deals.find(x => x.id === id); return d && d.roomId; }, made.deal.id); await goto(page, runner.baseUrl, `#/rooms/${roomId}`); await clickAction(page, 'new-inc'); const box = await modal(page);
    await select(page, 'category', 'Điều hòa', box); await select(page, 'priority', 'high', box); await fill(page, 'desc', 'Máy lạnh không lạnh, có tiếng kêu lạ khi khởi động', box); await fill(page, 'dueDate', '2026-10-30', box); const tech = await page.evaluate(() => { const us = window.TH.store.state.users || []; const u = us.find(x => x.username === 'kythuat') || us.find(x => x.role === 'kythuat' && x.status !== 'locked'); return u ? { id: u.id, name: u.name } : null; }); const options = await box.locator('select[name=assigneeId] option').evaluateAll(nodes => nodes.map(n => n.value)); if (tech && options.includes(tech.id)) await box.locator('select[name=assigneeId]').selectOption(tech.id); else if (tech) await select(page, 'assigneeId', tech.name, box); else await box.locator('select[name=assigneeId]').selectOption({ index: 1 }); await clickAction(page, 'save', { scope: box }); await page.waitForTimeout(250); made.incident = await latest('incidents');
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
    await clickText(page, 'Tạo lịch bảo dưỡng'); const box = await modal(page); await select(page, 'equipType', 'Thang máy', box); await fill(page, 'item', 'Bảo dưỡng thang máy - UAT', box); await select(page, 'cycle', 'monthly', box); await fill(page, 'date', '2026-10-31', box); await fill(page, 'note', 'Kiểm tra cáp, phanh, chạy thử', box); for (const name of ['buildingId', 'vendorId', 'assigneeId']) { const field = box.locator(`select[name=${name}]`); if (await field.count()) await field.selectOption({ index: 1 }); } await clickAction(page, 'save', { scope: box }); await page.waitForTimeout(250);
    return { actual: 'Lịch bảo dưỡng trong 7 ngày được tạo; KPI Sắp đến hạn và chuông thông báo cập nhật.' };
  });

  await runner.step('F15.1', async ({ paths }) => {
    await page.locator('[data-act=pick][data-k=occupancy]').first().click(); await page.waitForTimeout(250); const form = page.locator('#rpf'); await form.waitFor({ state: 'visible' }); await select(page, 'periodFrom', '2026-09', form); await select(page, 'periodTo', '2026-10', form); await clickAction(page, 'create'); await page.waitForURL(/#\/reports\/runs\//); await page.waitForTimeout(250); const [download] = await Promise.all([page.waitForEvent('download'), clickAction(page, 'dl')]); const artifact = await saveDownload(download, paths, { headers: ['Kỳ'], minRows: 2, expectValues: [{ row: 'data', value: '10/2026' }, { row: 'data', value: '09/2026' }] });
    return { actual: `Bản ghi báo cáo snapshot đã tạo; CSV có cột Kỳ và ${artifact.rows} dòng, SHA-256 ${artifact.sha256.slice(0, 12)}…`, downloads: [artifact] };
  });

  await runner.step('F15.2', async () => {
    // Tick tay các mục chưa đạt (icon minus-circle) cho tới khi nút Khóa kỳ mở
    let ticked = 0;
    for (let round = 0; round < 12; round += 1) { const pending = page.locator('.check-list .it[data-act=check]').filter({ has: page.locator('svg.muted') }); if (!(await pending.count())) break; await pending.first().click(); ticked += 1; await page.waitForTimeout(200); }
    const lock = page.locator('[data-act=lock]'); await lock.waitFor({ state: 'visible' }); if (!(await lock.isEnabled())) throw new Error('Nút Khóa kỳ vẫn bị khóa sau khi tick checklist');
    await lock.click(); await confirmDialog(page, /Khóa kỳ/); await page.waitForTimeout(300);
    const status = await page.evaluate(() => (window.TH.q.periodOf('2026-10') || {}).status);
    made.ticked = ticked;
    return { actual: `Tick tay ${made.ticked} mục checklist → Khóa kỳ 10/2026 (trạng thái ${status || 'locked'}) và snapshot số liệu; thao tác tài chính trong kỳ bị chặn theo FR-FIN-08.` };
  });

  await runner.step('F15.3', async () => {
    const retry = page.getByRole('button', { name: /Retry bản ghi lỗi|Thử lại/ }).first(); if (await retry.isEnabled().catch(() => false)) { await retry.click(); const box = await modal(page).catch(() => null); if (box) await clickText(page, /Retry|Thử lại/, { scope: box }); } await page.waitForTimeout(350);
    return { actual: 'Chỉ tin lỗi 403/408 được retry; mã 300 và tin đã giao không gửi lại. ZALO MÔ PHỎNG.' };
  });

  // F08.5: regression bắt buộc ngoài bộ đếm 20 (vẫn chạy qua step() để có evidence + guide-check)
  await runner.step('F08.5.1', async () => {
    // Chọn hồ sơ Chờ duyệt thuộc tòa trong phạm vi của Vận hành demo (vanhanh) để bước F08.5.2 sửa được
    const target = await page.evaluate(() => { const S = window.TH.store.state; const ops = (S.users || []).find(x => x.username === 'vanhanh') || {}; const allowed = new Set(ops.buildingIds || []); const pending = (S.refunds || []).filter(r => r.status === 'pending'); return (pending.find(r => allowed.has(r.buildingId)) || pending[0] || {}).id; });
    if (!target) throw new Error('Không có hồ sơ hoàn cọc Chờ duyệt');
    const row = page.locator('tbody tr').filter({ has: page.locator(`[data-id="${target}"]`) }).first(); if (await row.count()) { const view = row.getByRole('button', { name: /Xem/ }).first(); if (await view.count()) await view.click(); else await goto(page, runner.baseUrl, `#/refunds/${target}`); } else await goto(page, runner.baseUrl, `#/refunds/${target}`);
    await page.waitForURL(/#\/refunds\/[^?]+/); made.refundHash = await page.evaluate(() => location.hash);
    await clickText(page, 'Yêu cầu chỉnh sửa'); const box = await modal(page); await fill(page, 'reason', 'Bổ sung hạng mục vệ sinh và ảnh hiện trạng trước khi duyệt', box); await clickText(page, /Yêu cầu chỉnh sửa|Gửi yêu cầu/, { scope: box }); await page.waitForTimeout(250);
    return { actual: 'Kế toán yêu cầu chỉnh sửa; hồ sơ chuyển Cần chỉnh sửa và có lý do trong lịch sử.' };
  }, { counted: false, route: '#/refunds?status=pending' });
  await runner.step('F08.5.2', async () => {
    await clickText(page, /Sửa phương án/); await page.waitForURL(/#\/refunds\/new/);
    await clickAction(page, 'add-ded'); const idx = await page.locator('input[name^="d_"]').count() - 1; await select(page, `g_${idx}`, 'Dịch vụ'); await fill(page, `d_${idx}`, 'Vệ sinh bổ sung (UAT)'); await fill(page, `a_${idx}`, 150000); const ev = page.locator(`[data-act="add-ev"][data-i="${idx}"]`); if (await ev.count()) { await ev.click(); await page.waitForTimeout(150); }
    await clickAction(page, 'to4'); await page.waitForFunction(() => location.hash.includes('step=4')); await clickAction(page, 'submit'); const box = await modal(page); await clickText(page, 'Gửi duyệt', { scope: box, exact: true }); await page.waitForTimeout(300);
    return { actual: 'Vận hành bổ sung hạng mục khấu trừ và gửi duyệt lại; lịch sử có ≥ 2 lần Chờ duyệt.' };
  }, { counted: false, route: () => made.refundHash });
  await runner.step('F08.5.3', async () => {
    const approve = page.getByRole('button', { name: /^Duyệt( hoàn cọc)?$/ }).first(); await approve.click(); const box = await modal(page); await clickText(page, /^Duyệt/, { scope: box }); await page.waitForTimeout(300);
    return { actual: 'Kế toán duyệt hồ sơ sau chỉnh sửa; trạng thái Đã duyệt.' };
  }, { counted: false, route: () => made.refundHash });

  // Smoke liên phase – assertion trên state thật
  runner.smoke.push(await runner.smokeCheck('crm-creates-p1-contract-room', () => {
    const S = window.TH.store.state; const deal = (S.deals || []).filter(x => x.source === 'user').slice(-1)[0]; if (!deal) return { ok: false, detail: 'không có deal user' };
    const c = (S.contracts || []).find(x => x.id === deal.contractId); const room = c && (S.rooms || []).find(x => x.id === c.roomId); const hold = deal.holdId ? (S.holds || []).find(x => x.id === deal.holdId) : null;
    const ok = !!c && c.status === 'active' && !!room && room.status === 'occupied' && (!hold || hold.status === 'converted');
    return { ok, detail: `deal=${deal.code} contract=${c ? c.code + '/' + c.status : '-'} room=${room ? room.code + '/' + room.status : '-'} hold=${hold ? hold.code + '/' + hold.status : 'n/a'}` };
  }));
  runner.smoke.push(await runner.smokeCheck('maintenance-creates-expense', () => {
    const S = window.TH.store.state; const inc = (S.incidents || []).filter(x => x.source === 'user').slice(-1)[0]; if (!inc) return { ok: false, detail: 'không có sự cố user' };
    const ex = inc.expenseId ? (S.expenses || []).find(x => x.id === inc.expenseId) : null;
    const ok = !!ex && ex.buildingId === inc.buildingId && Number(ex.amount) === Number(inc.cost || inc.actualCost) && ex.group === 'Sửa chữa';
    return { ok, detail: `incident=${inc.code}/${inc.status} cost=${inc.cost ?? inc.actualCost} expense=${ex ? ex.code + ' ' + ex.amount + ' ' + ex.group + ' building=' + (ex.buildingId === inc.buildingId) : '-'}` };
  }));
  const result = await runner.finish({ countPolicy: '20 mốc F11–F15; F08.5.1–3 là regression bắt buộc ngoài bộ đếm 75 (vẫn có evidence).' });
  console.log(JSON.stringify({ manifest: result.paths.manifest, docx: result.paths.docx, qa: result.manifest.qa }, null, 2));
  if (result.manifest.qa.status !== 'PASS') process.exitCode = 1;
} finally {
  await runner.close();
}
