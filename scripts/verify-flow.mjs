// E2E: bấm UI thật qua cả chuỗi Chủ nhà → HĐ đầu vào → Tòa → Phòng, kèm RBAC, rollback, lưu trữ.
// Dùng: npm run verify:flow   (exit ≠ 0 nếu có assert sai)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';
import { launch, newPage } from './lib/browser.mjs';
import { verifyAuth } from './flows/00-auth.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOC = path.join(repo, 'docs_timonouse', 'Hợp đồng thuê nhà 2026(Mẫu) tùng sói.doc');
const results = []; let step = '';
const ok = (cond, msg) => { results.push({ step, ok: !!cond, msg }); console.log(`${cond ? '  ✓' : '  ✕'} ${msg}`); };
const section = (name) => { step = name; console.log(`\n▶ ${name}`); };

const { server, url } = await startServer({ port: 0, quiet: true });
const browser = await launch();
const page = await newPage(browser);
await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
page.setDefaultTimeout(8000);
const S = () => page.evaluate(() => window.__TH.store.get());
const go = async (hash, search = '') => {
  if (search || !page.url().startsWith(url)) await page.goto(`${url}${search}${hash}`);
  else await page.evaluate((h) => { location.hash = h; }, hash);
  await page.waitForTimeout(200);
  await page.waitForSelector('main .ph h1:visible, main .login-card:visible');
};
const act = (name, extra = '') => page.click(`main [data-action="${name}"]${extra}`);
const disabled = (sel) => page.$eval(sel, (el) => el.getAttribute('aria-disabled') === 'true');
const modalOk = async (act2 = 'ok') => { await page.click(`.mdl [data-m="${act2}"]`); await page.waitForTimeout(250); };
const rows = (sel = 'main table tbody tr[data-href]') => page.$$eval(sel, (x) => x.length);
const title = () => page.$eval('main .ph h1', (h) => h.textContent);

try {
  // 1 ────────────────────────────────────────────────
  section('1. Danh sách chủ nhà: lọc, tìm');
  await go('#/landlords');
  await page.evaluate(() => { window.__TH.reset(); window.__TH.setRole('admin'); });
  await go('#/landlords');
  ok(await rows() === 6, 'seed có 6 chủ nhà');
  await page.selectOption('main select[name=type]', 'Tổ chức');
  await page.waitForTimeout(150);
  ok(page.url().includes('type='), 'bộ lọc Loại phản ánh lên URL');
  ok(await page.$('main .empty') !== null, 'không có kết quả → empty state');
  await go('#/landlords?');
  await page.evaluate(() => { location.hash = '#/landlords'; });
  await page.waitForTimeout(150);
  await page.fill('main input[name=q]', '  Khiết ');
  await page.waitForTimeout(500);
  ok(await rows() === 1, 'tìm "Khiết" (cắt khoảng trắng, debounce 300ms) → 1 dòng');

  // 2 ────────────────────────────────────────────────
  section('2. Trích xuất HĐ chủ nhà + commit');
  await go('#/landlords/import');
  await page.setInputFiles('#xfile', DOC);
  await page.waitForFunction(() => location.hash.includes('job='));
  await page.waitForTimeout(200);
  ok(page.url().includes('job=LLX-001'), 'upload file .doc thật → trùng hash → mở lại LLX-001');
  ok(await disabled('main [data-action=commit]') && (await page.textContent('main [data-action=commit]')).includes('còn 3 xung đột'), 'Commit bị khóa "còn 3 xung đột"');
  await act('choose', '[data-c=deposit][data-v=ask]');
  await page.waitForTimeout(150);
  ok((await page.textContent('main [data-action=commit]')).includes('còn 3'), '"Hỏi lại chủ nhà" vẫn chặn commit');
  for (const [c, v] of [['dates', 'draft'], ['deposit', 'once'], ['partyB', 'proxy']]) { await page.click(`aside.rail [data-action=choose][data-c=${c}][data-v=${v}]`); await page.waitForTimeout(120); }
  ok(!(await disabled('main [data-action=commit]')), 'đủ 3 lựa chọn → Commit mở');
  await go('#/landlords/import?job=LLX-001', '?failAt=asset');
  await act('commit'); await page.waitForSelector('.mdl'); await modalOk();
  let s = await S();
  ok(s.landlords.length === 6 && s.headLeases.length === 0 && !s.extractionJobs[0].committed, 'lỗi giữa commit (failAt=asset) → rollback toàn bộ');
  await go('#/landlords/import?job=LLX-001', '?x=1');
  await act('commit'); await page.waitForSelector('.mdl'); await modalOk();
  await page.waitForFunction(() => location.hash.startsWith('#/head-leases/'));
  s = await S();
  const bId = s.extractionJobs[0].committed.buildingId;
  ok(page.url().endsWith('#/head-leases/HL-0031'), 'commit xong → HĐ đầu vào HL-0031');
  ok(s.landlords.length === 7 && s.headLeases[0].status === 'Nháp' && s.documents.filter((d) => d.links.headLeaseId === 'HL-0031').length === 3
    && s.assets.length === 11 && s.meters.filter((m) => m.buildingId === bId).length === 2 && s.rooms.filter((r) => r.buildingId === bId).length === 0,
  'tạo 1 chủ nhà · HĐ Nháp · 3 tài liệu · 11 tài sản · 2 công tơ · 0 phòng');

  // 3 ────────────────────────────────────────────────
  section('3. Điều kiện kích hoạt → lịch 20 kỳ');
  await go('#/head-leases/HL-0031');
  ok(await disabled('main [data-action=activate]'), 'Bổ sung & kích hoạt bị khóa');
  const tip = await page.getAttribute('main [data-action=activate]', 'data-tip');
  ok(['ngày', 'tài khoản', 'người ký'].every((k) => tip.includes(k)), 'tooltip liệt kê đủ 3 điều kiện thiếu');
  await act('goto-landlord'); await page.waitForTimeout(200);
  await act('add-bank'); await page.waitForSelector('.mdl');
  await page.fill('.mdl [name=bank]', 'Vietcombank'); await page.fill('.mdl [name=no]', '0123456789');
  await modalOk();
  await go('#/head-leases/HL-0031');
  await act('set-dates'); await page.waitForSelector('.mdl'); await page.fill('.mdl [name=startDate]', '2026-10-01'); await modalOk();
  await act('signer'); await page.waitForSelector('.mdl'); await modalOk();
  ok(!(await disabled('main [data-action=activate]')), 'đủ điều kiện → nút kích hoạt mở');
  await act('activate'); await page.waitForSelector('.mdl'); await modalOk();
  s = await S();
  const sched = s.headLeasePaymentSchedule;
  ok(s.headLeases[0].status === 'Hiệu lực' && sched.length === 20 && sched.every((p) => p.amount === 342000000 && p.dueDate.endsWith('-10'))
    && sched.reduce((a, p) => a + p.amount, 0) === 6840000000, 'Hiệu lực · 20 kỳ × 342.000.000 · hạn ngày 10 · Σ 6.840.000.000');

  // 4 ────────────────────────────────────────────────
  section('4. Tòa: lưu mã bất biến');
  await go(`#/buildings/${bId}`);
  ok(await disabled('main [data-action=create-rooms]'), 'Tạo phòng khóa khi chưa lưu mã');
  await act('save-code'); await page.waitForSelector('.mdl'); await modalOk();
  s = await S();
  ok(s.buildings.find((b) => b.id === bId).code === 'PD25A' && await page.$('main input[name=code]') === null, 'mã PD25A lưu xong → ô mã chỉ đọc');
  ok(!(await disabled('main .acts [data-action=create-rooms]')) && await disabled('main [data-action=transition]'), 'Tạo phòng mở · Chuyển Đang khai thác còn khóa');

  // 5 ────────────────────────────────────────────────
  section('5. Tạo phòng: sinh theo tầng + import CSV');
  await page.click('main .acts [data-action=create-rooms]'); await page.waitForSelector('main input[name=perFloor]');
  await page.fill('main input[name=floors]', '2'); await page.fill('main input[name=perFloor]', '3');
  await page.waitForTimeout(150);
  const codes = await page.$$eval('main table tbody tr td:first-child .mono', (x) => x.map((e) => e.textContent));
  ok(codes.join(',') === '101PD25A,102PD25A,103PD25A,201PD25A,202PD25A,203PD25A', 'preview 2×3 → 101PD25A…203PD25A');
  await page.click('main .tabs [data-tab=import]'); await page.waitForTimeout(150);
  await act('sample'); await page.waitForSelector('main [data-action=validate-import]'); await act('validate-import'); await page.waitForTimeout(150);
  const labels = await page.$$eval('main table tbody tr td:last-child .chip', (x) => x.map((e) => e.textContent.trim()));
  ok(labels.join('|') === 'Hợp lệ|Hợp lệ|Trùng mã với dòng sinh theo tầng|Thiếu sức chứa', 'CSV mẫu → 2 hợp lệ · 1 trùng dòng sinh · 1 thiếu sức chứa');
  const [dl] = await Promise.all([page.waitForEvent('download'), act('download-errors')]);
  ok(/dong-loi/.test(dl.suggestedFilename()), 'Tải dòng lỗi → file CSV');
  await page.click('main .tabs [data-tab=gen]'); await page.waitForTimeout(150);
  await page.click('main .acts [data-action=create]'); await page.waitForSelector('.mdl'); await modalOk();
  await page.waitForFunction(() => location.hash.startsWith('#/rooms?building='));
  await go(`#/rooms/new?building=${bId}&tab=import`);
  await act('sample'); await page.waitForSelector('main [data-action=validate-import]'); await act('validate-import'); await page.waitForTimeout(150);
  const l2 = await page.$$eval('main table tbody tr td:last-child .chip', (x) => x.map((e) => e.textContent.trim()));
  ok(l2[2] === 'Trùng mã với phòng đã có', 'import lại sau khi tạo → 101 trùng phòng đã có');
  await page.click('main .acts [data-action=create]'); await page.waitForSelector('.mdl'); await modalOk();
  await page.waitForTimeout(250);
  s = await S();
  const mine = s.rooms.filter((r) => r.buildingId === bId);
  ok(mine.length === 8 && mine.every((r) => r.status === 'Sẵn sàng'), '8 phòng Sẵn sàng (6 sinh + 2 import)');

  // 6 ────────────────────────────────────────────────
  section('6. Vòng đời phòng');
  await go('#/rooms/101PD25A');
  await act('status-menu'); await page.waitForSelector('.menu-pop');
  const items = await page.$$eval('.menu-pop .mi', (x) => x.map((e) => e.textContent));
  ok(items.some((t) => t.includes('Bảo trì')) && !items.some((t) => t.includes('Đang thuê')), 'menu có → Bảo trì, không có → Đang thuê');
  await page.click('.menu-pop .mi:has-text("Bảo trì")'); await page.waitForSelector('.mdl');
  await page.fill('.mdl textarea[name=reason]', 'hỏng vòi nước'); await modalOk();
  await act('status-menu'); await page.waitForSelector('.menu-pop'); await page.click('.menu-pop .mi:has-text("Sẵn sàng")'); await page.waitForSelector('.mdl');
  await page.fill('.mdl textarea[name=reason]', 'nghiệm thu'); await modalOk();
  s = await S();
  ok(s.roomStatusHistory.filter((h) => h.roomId === '101PD25A').length === 3 && s.rooms.find((r) => r.id === '101PD25A').status === 'Sẵn sàng', 'Bảo trì → nghiệm thu → Sẵn sàng · 3 dòng lịch sử');
  await go('#/rooms/304G1');
  ok(await disabled('main [data-action=status-menu]') && (await page.textContent('main')).includes('CÓ đồng hồ'), '304G1 Đang thuê: Đổi trạng thái khóa · có đồng hồ nước');

  // 7 ────────────────────────────────────────────────
  section('7. Tòa → Đang khai thác');
  await go(`#/buildings/${bId}`);
  await page.click('main .acts [data-action=assign]'); await page.waitForSelector('.mdl');
  await page.selectOption('.mdl select[name=employeeId]', 'emp-huyen'); await modalOk();
  await page.selectOption('main select[name=account]', 'acc-bidv'); await page.waitForTimeout(200);
  ok(!(await disabled('main [data-action=transition]')), 'đủ điều kiện ASSUMED → nút chuyển mở');
  await act('transition'); await page.waitForSelector('.mdl');
  await page.selectOption('.mdl select[name=group]', 'G'); await page.selectOption('.mdl select[name=grade]', 'L2'); await modalOk();
  s = await S();
  ok(s.buildings.find((b) => b.id === bId).status === 'Đang khai thác' && s.buildingTypeHistory.filter((h) => h.buildingId === bId).length === 2, 'Đang khai thác · 2 dòng lịch sử phân loại');
  await go('#/landlords');
  const row7 = await page.textContent('main tr[data-href="#/landlords/LL-0007"]');
  ok(!row7.includes('ứng viên') && row7.includes('Hoạt động'), 'LL-0007: tòa hết "(ứng viên)", nhãn Hoạt động');

  // 8 ────────────────────────────────────────────────
  section('8. Vòng đời chủ nhà + tạo tay trùng');
  await go('#/landlords/LL-0007');
  await act('more'); await page.waitForSelector('.menu-pop');
  ok(await page.$eval('.menu-pop .mi.danger', (e) => e.getAttribute('aria-disabled') === 'true'), 'LL-0007 còn HĐ hiệu lực → Ngừng hoạt động khóa');
  await page.keyboard.press('Escape');
  await go('#/landlords/LL-0001');
  await act('more'); await page.waitForSelector('.menu-pop'); await page.click('.menu-pop .mi.danger'); await page.waitForSelector('.mdl');
  ok(await page.$eval('.mdl [data-m=ok]', (e) => e.getAttribute('aria-disabled') === 'true'), 'popup 02.5: chưa nhập lý do → nút khóa');
  await page.fill('.mdl textarea[name=reason]', 'không còn hợp tác'); await modalOk();
  ok((await S()).landlords.find((l) => l.id === 'LL-0001').status === 'Ngừng hoạt động', 'LL-0001 → Ngừng hoạt động');
  await act('more'); await page.waitForSelector('.menu-pop'); await page.click('.menu-pop .mi:has-text("Mở lại")'); await page.waitForSelector('.mdl');
  await page.fill('.mdl textarea[name=reason]', 'hợp tác lại'); await modalOk();
  ok((await S()).landlords.find((l) => l.id === 'LL-0001').status === 'Hoạt động', 'Admin mở lại LL-0001');
  await go('#/landlords/new');
  await page.fill('main input[name=name]', 'Nguyễn Test');
  await page.fill('main input[name=idNo]', '001070018351');
  await page.click('main input[name=idIssued]');
  await page.waitForSelector('.mdl');
  ok((await page.textContent('.mdl')).includes('bị trùng theo CCCD'), 'CCCD trùng → popup 02.4');
  await page.click('.mdl [data-m=create]'); await page.waitForSelector('.mdl textarea[name=reason]');
  ok(await page.$eval('.mdl [data-m=create]', (e) => e.getAttribute('aria-disabled') === 'true'), '"Vẫn tạo" khóa tới khi nhập lý do');
  await page.fill('.mdl textarea[name=reason]', 'khác người, trùng do nhập nhầm'); await page.click('.mdl [data-m=create]');
  await page.waitForTimeout(250);
  await page.fill('main input[name=idIssued]', '2020-01-01');
  await page.fill('main input[name=idPlace]', 'Hà Nội');
  await page.fill('main input[name=phone]', '0987654321');
  await page.click('main input[name=email]'); await page.waitForTimeout(200);
  for (let i = 0; i < 3; i++) { await act('next'); await page.waitForTimeout(200); }
  await act('create'); await page.waitForFunction(() => location.hash.startsWith('#/landlords/LL-'));
  s = await S();
  ok(page.url().endsWith('#/landlords/LL-0008') && s.audit.some((a) => a.entityId === 'LL-0008' && a.reason.includes('nhập nhầm')), 'tạo LL-0008 · lý do vẫn tạo ghi audit');

  // 9 ────────────────────────────────────────────────
  section('9. Phân quyền');
  await page.evaluate(() => window.__TH.setRole('shareholder'));
  for (const h of ['#/landlords', '#/buildings', '#/rooms', `#/head-leases/HL-0031`]) { await go(h); ok((await title()).includes('Không có quyền'), `Cổ đông → 403 ở ${h}`); }
  await page.evaluate(() => window.__TH.setRole('nvvh'));
  await go('#/buildings'); ok(await rows() === 1, 'NVVH chỉ thấy 1 tòa (G1)');
  await go('#/rooms'); ok(await rows() === 15, 'NVVH chỉ thấy 15 phòng G1');
  await go('#/landlords'); ok(await disabled('main .acts [data-action=new]'), 'NVVH: "+ Chủ nhà" khóa kèm tooltip');
  await page.evaluate(() => window.__TH.setRole('source'));
  await go('#/landlords'); ok(!(await disabled('main .acts [data-action=new]')), 'NV nguồn tạo được chủ nhà');
  await go('#/head-leases/HL-0031'); ok(await disabled('main [data-action=liquidate]'), 'NV nguồn: Thanh lý sớm khóa (chỉ Admin, Kế toán)');
  await page.evaluate(() => window.__TH.setRole('accountant'));
  await go('#/head-leases/HL-0031'); ok(!(await disabled('main [data-action=liquidate]')), 'Kế toán: Thanh lý sớm mở');

  // 10 ───────────────────────────────────────────────
  section('10. Lưu trữ & đặt lại');
  await page.reload(); await page.waitForSelector('main .ph h1');
  s = await S();
  ok(s.rooms.length === 23 && s.landlords.length === 8, 'reload giữ nguyên dữ liệu (localStorage)');
  await page.evaluate(() => window.__TH.reset());
  s = await S();
  ok(s.rooms.length === 15 && s.landlords.length === 6 && s.headLeases.length === 0, 'Đặt lại → về seed');
  await verifyAuth({ page, go, ok, section });
} catch (e) {
  ok(false, `lỗi kịch bản: ${e.message.split('\n')[0]}`);
  await page.screenshot({ path: path.join(repo, 'tmp', 'verify-flow-fail.png'), fullPage: true }).catch(() => {});
}

ok(page.__errors.length === 0, `không có lỗi console/pageerror${page.__errors.length ? `: ${page.__errors.slice(0, 3).join(' | ')}` : ''}`);
await browser.close(); server.close();
const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length}/${results.length} assert đạt${bad.length ? ` · ${bad.length} lỗi` : ''}`);
process.exit(bad.length ? 1 : 0);
