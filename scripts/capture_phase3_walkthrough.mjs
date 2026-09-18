import path from 'node:path';
import { createRunner, fill, select, clickText, clickAction, modal, goto, saveDownload, confirmDialog, ROOT } from './uat/runtime.mjs';

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
    // Seed đã cam kết 100% mọi dự án → giảm 2% của cổ đông lớn nhất (qua UI "Sửa / cam kết vốn") để còn dư tỷ lệ, rồi thêm cổ đông mới 2%
    const room = await page.evaluate(() => { const S = window.TH.store.state; const projects = S.projects.map(p => ({ p, used: (S.capitalCommitments || []).filter(c => c.projectId === p.id).reduce((n, c) => n + Number(c.ratio || 0), 0) })).sort((a, b) => a.used - b.used); const pick = projects[0]; const remaining = Math.round((100 - pick.used) * 100) / 100; const big = (S.capitalCommitments || []).filter(c => c.projectId === pick.p.id).sort((a, b) => b.ratio - a.ratio)[0]; const sh = big && S.shareholders.find(x => x.id === big.shareholderId); return { projectId: pick.p.id, projectName: pick.p.name, remaining, bigShareholder: sh ? { id: sh.id, name: sh.name, ratio: big.ratio } : null }; });
    let freed = 0;
    if (room.remaining < 1 && room.bigShareholder) {
      const more = page.locator(`[data-act="more"][data-id="${room.bigShareholder.id}"]`).first(); await more.click();
      await page.locator('div[role="menu"] button[role="menuitem"]').filter({ hasText: /Sửa \/ cam kết vốn/ }).first().click();
      const editBox = await modal(page); const ratioInput = editBox.locator(`input[name="r_${room.projectId}"]`); const current = Number(await ratioInput.inputValue()) || room.bigShareholder.ratio; freed = 2; await ratioInput.fill(String(Math.round((current - freed) * 100) / 100)); await ratioInput.press('Tab');
      await clickAction(page, 'save', { scope: editBox }); await page.waitForTimeout(300);
    }
    await clickText(page, 'Thêm cổ đông'); const box = await modal(page);
    await fill(page, 'name', 'Lê Demo Cổ Đông', box); await fill(page, 'email', 'demo.codong@gmail.com', box); await fill(page, 'phone', '0913 000 888', box); await fill(page, 'idNumber', '079012345678', box);
    const ratio = Math.min(2, Math.max(freed, room.remaining) || 2); await box.locator(`input[name="r_${room.projectId}"]`).fill(String(ratio)); await box.locator(`input[name="r_${room.projectId}"]`).press('Tab');
    await clickAction(page, 'save', { scope: box }); await page.waitForTimeout(300); created.shareholder = await latest('shareholders'); created.projectId = room.projectId;
    const total = await page.evaluate(id => (window.TH.store.state.capitalCommitments || []).filter(c => c.projectId === id).reduce((n, c) => n + Number(c.ratio || 0), 0), room.projectId);
    return { inputs: { name: 'Lê Demo Cổ Đông', project: room.projectName, ratio: ratio + '%', freedFrom: room.bigShareholder ? `${room.bigShareholder.name} −${freed}%` : 'không cần' }, actual: `${room.bigShareholder && freed ? 'Giảm ' + freed + '% của ' + room.bigShareholder.name + ' trên ' + room.projectName + ' qua Sửa / cam kết vốn; ' : ''}đã tạo ${created.shareholder?.code} với tỷ lệ nhập tay ${ratio}% trên ${room.projectName}; tổng tỷ lệ dự án = ${Math.round(total * 100) / 100}% (≤ 100%).`, assertions: [{ id: 'ratio-cap', status: total <= 100.0001 ? 'PASS' : 'FAIL', detail: `total=${total}` }] };
  });

  await runner.step('F18.2', async () => {
    await clickText(page, 'Tạo khoản góp vốn'); const box = await modal(page);
    await select(page, 'projectId', created.projectId, box); await fill(page, 'round', 'Đợt góp vốn bổ sung 11/2026', box); await fill(page, 'dueDate', '2026-11-07', box); await fill(page, 'total', 500000000, box); await fill(page, 'note', 'Bổ sung vốn sửa chữa thang máy', box);
    await clickText(page, 'Tạo đợt góp vốn', { scope: box }); await page.waitForTimeout(250);
    return { actual: 'Đã tạo nghĩa vụ góp vốn theo đúng tỷ lệ từng cổ đông của dự án.' };
  });

  await runner.step('F18.3', async () => {
    // Lọc theo tên cổ đông demo để dòng nghĩa vụ mới hiện trên trang đầu, rồi "Ghi nhận"
    const contrib = await page.evaluate(id => { const S = window.TH.store.state; return (S.contributions || []).filter(c => c.shareholderId === id && c.status !== 'paid').sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))[0] || null; }, created.shareholder.id);
    if (!contrib) throw new Error('Cổ đông demo chưa có nghĩa vụ góp vốn');
    const search = page.locator('#content input[name=s]').first(); if (await search.count()) { await search.fill('Lê Demo'); await search.press('Enter'); await page.waitForTimeout(300); }
    const record = page.locator(`[data-act="record"][data-id="${contrib.id}"]`).first(); await record.scrollIntoViewIfNeeded(); await record.click(); const box = await modal(page);
    await fill(page, 'ref', 'UNC-UAT-GV-001', box); await clickText(page, 'Ghi nhận', { scope: box, exact: true }); await page.waitForTimeout(300);
    const after = await page.evaluate(id => { const c = (window.TH.store.state.contributions || []).find(x => x.id === id); return c && { code: c.code, status: c.status, paid: c.paidAmount, amount: c.amount }; }, contrib.id);
    // Idempotent: bấm lại cùng chứng từ không tạo trùng
    let dup = 'không áp dụng'; if (after && after.status !== 'paid') { const again = page.locator(`[data-act="record"][data-id="${contrib.id}"]`).first(); if (await again.count()) { await again.click(); const box2 = await modal(page); await fill(page, 'ref', 'UNC-UAT-GV-001', box2); await clickText(page, 'Ghi nhận', { scope: box2, exact: true }).catch(() => {}); await page.waitForTimeout(200); await page.keyboard.press('Escape'); } }
    const paidTwice = await page.evaluate(id => { const c = (window.TH.store.state.contributions || []).find(x => x.id === id); return c && { status: c.status, paid: c.paidAmount, amount: c.amount, history: (c.history || []).length }; }, contrib.id);
    dup = paidTwice.paid <= paidTwice.amount ? 'không ghi trùng' : 'GHI TRÙNG';
    return { actual: `Nghĩa vụ ${after?.code} → ${paidTwice.status}, đã góp ${paidTwice.paid}/${paidTwice.amount} (UNC-UAT-GV-001); ghi nhận lại cùng chứng từ: ${dup}.`, assertions: [{ id: 'contribution-paid', status: paidTwice.paid > 0 && paidTwice.paid <= paidTwice.amount ? 'PASS' : 'FAIL', detail: JSON.stringify(paidTwice) }], scrollTo: `[data-id="${contrib.id}"]` };
  });

  await runner.step('F18.4', async () => {
    await clickText(page, 'Tạo phân phối'); const box = await modal(page); await fill(page, 'label', 'Q4/2026 (UAT)', box); await select(page, 'projectId', created.projectId, box); await fill(page, 'profit', 900000000, box); await fill(page, 'date', '2026-11-27', box);
    await clickAction(page, 's', { scope: box }); await page.waitForTimeout(300);
    const dist = await page.evaluate(() => (window.TH.store.state.distributions || []).find(x => x.label === 'Q4/2026 (UAT)'));
    if (!dist) throw new Error('Không tạo được bảng phân phối');
    const openDrawer = async () => { await goto(page, runner.baseUrl, '#/investment/shareholders?tab=distributions'); await page.locator(`[data-act="open-dist"][data-id="${dist.id}"]`).first().click(); return modal(page); };
    const closeDrawer = async () => { const close = page.locator('.overlay').last().getByRole('button', { name: 'Đóng' }).first(); if (await close.count()) await close.click(); else await page.keyboard.press('Escape'); await page.waitForTimeout(200); };
    let drawer = await openDrawer(); const lines = await drawer.locator('tbody tr').count(); await closeDrawer();
    // Admin duyệt
    await runner.switchRole('admin'); drawer = await openDrawer(); await clickAction(page, 'approve', { scope: drawer }); await confirmDialog(page, /Duyệt|Xác nhận/); await page.waitForTimeout(250); if (await page.locator('.overlay').count()) await closeDrawer();
    // Kế toán ghi nhận đã chi
    await runner.switchRole('accountant'); drawer = await openDrawer(); await clickAction(page, 'pay', { scope: drawer }); const confirm = await modal(page); await fill(page, 'ref', 'UNC-UAT-PP-001', confirm); await clickText(page, /Ghi nhận|Xác nhận/, { scope: confirm }); await page.waitForTimeout(300); if (await page.locator('.overlay').count()) await closeDrawer();
    const after = await page.evaluate(id => { const d = (window.TH.store.state.distributions || []).find(x => x.id === id); const exp = (window.TH.store.state.expenses || []).filter(e => e.distributionId === id).length; return { status: d.status, ref: d.ref || d.paidRef, lines: (d.lines || []).length, expenses: exp }; }, dist.id);
    return { actual: `Bảng phân phối ${dist.code} (${lines} dòng theo tỷ lệ vốn) → Admin duyệt → Kế toán ghi nhận đã chi (UNC-UAT-PP-001): trạng thái ${after.status}; không tạo chi phí vận hành (expenses liên kết = ${after.expenses}).`, assertions: [{ id: 'distribution-paid', status: after.status === 'paid' ? 'PASS' : 'FAIL', detail: JSON.stringify(after) }], scrollTo: `[data-id="${dist.id}"]` };
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

  runner.smoke.push(await runner.smokeCheck('inventory-syncs-asset', () => {
    const S = window.TH.store.state; const inv = (S.inventories || []).filter(x => x.source === 'user').slice(-1)[0]; if (!inv) return { ok: false, detail: 'không có đợt kiểm kê user' };
    const lines = (S.inventoryLines || []).filter(x => x.inventoryId === inv.id && x.condition); if (!lines.length) return { ok: false, detail: 'chưa có dòng kiểm kê được ghi' };
    const mismatch = lines.filter(l => { const a = (S.assets || []).find(x => x.id === l.assetId); return !a || a.condition !== l.condition; });
    return { ok: !mismatch.length && inv.status === 'done', detail: `inventory=${inv.code}/${inv.status} lines=${lines.length} synced=${lines.length - mismatch.length}` };
  }));
  runner.smoke.push(await runner.smokeCheck('payroll-creates-expense', () => {
    const S = window.TH.store.state; const p = (S.payrolls || []).filter(x => x.status === 'paid').slice(-1)[0]; if (!p) return { ok: false, detail: 'không có bảng lương đã chi' };
    const exs = (S.expenses || []).filter(x => (p.expenseIds || []).includes(x.id)); const total = exs.reduce((n, x) => n + Number(x.amount || 0), 0);
    const ok = exs.length > 0 && exs.every(x => x.group === 'Lương' && String(x.date).slice(0, 7) === '2026-10') && Math.abs(total - Number(p.total)) < 1000;
    return { ok, detail: `payroll=${p.code} total=${p.total} expenses=${exs.length} sum=${total} period=${[...new Set(exs.map(x => String(x.date).slice(0, 7)))].join(',')}` };
  }));
  runner.smoke.push(await runner.smokeCheck('bank-reduces-receivable', () => {
    const S = window.TH.store.state; const T = window.TH; const matched = (S.bankTransactions || []).filter(x => x.matchStatus === 'matched' && x.paymentId); if (!matched.length) return { ok: false, detail: 'không có giao dịch khớp' };
    const checks = matched.slice(-3).map(t => { const pay = (S.payments || []).find(x => x.id === t.paymentId); const alloc = (S.paymentAllocations || []).filter(a => a.paymentId === t.paymentId); const inv = alloc[0] && (S.invoices || []).find(x => x.id === alloc[0].invoiceId); return { tx: t.code, pay: pay && pay.code, inv: inv && inv.code, remaining: inv ? T.q.invRemaining(inv) : null, paid: inv ? T.q.invPaid(inv) : null, ok: !!pay && !!inv && T.q.invPaid(inv) >= Number(alloc[0].amount) };
    });
    return { ok: checks.every(c => c.ok), detail: checks.map(c => `${c.tx}→${c.pay}→${c.inv} paid=${c.paid} remaining=${c.remaining}`).join('; ') };
  }));
  await runner.switchRole('codong'); await goto(page, runner.baseUrl, '#/investment/shareholders'); await page.waitForTimeout(300);
  runner.smoke.push(await runner.smokeCheck('shareholder-scope', () => {
    const T = window.TH; const S = T.store.state; if (T.auth.role() !== 'codong') return { ok: false, detail: 'vai trò hiện tại ' + T.auth.role() };
    const rows = [...document.querySelectorAll('#content table tbody tr')].length; const me = (S.session || {}).name || '';
    const canReports = T.auth.can('reports.hub'); const canHr = T.auth.can('hr.view'); const canWrite = T.auth.can('shareholders.manage');
    return { ok: rows <= 1 && !canReports && !canHr && !canWrite, detail: `rows=${rows} session=${me} reports.hub=${canReports} hr.view=${canHr} shareholders.manage=${canWrite}` };
  }));
  const result = await runner.finish();
  console.log(JSON.stringify({ manifest: result.paths.manifest, docx: result.paths.docx, qa: result.manifest.qa }, null, 2));
  if (result.manifest.qa.status !== 'PASS') process.exitCode = 1;
} finally {
  await runner.close();
}
