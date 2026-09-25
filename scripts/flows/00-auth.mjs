export async function verifyAuth({ page, go, ok, section }) {
  section('11. FR00: phiên demo, deep link và OTP');
  await page.evaluate(() => { window.__TH.store.transaction((d) => { d.meta.session = null; }); });
  await go('#/rooms');
  ok(page.url().endsWith('#/login'), 'chưa có phiên → login');
  await page.fill('main input[name=username]', 'accountant');
  await page.fill('main input[name=password]', 'demo123');
  await page.selectOption('main select[name=role]', 'accountant');
  await page.click('main [data-action=login]');
  ok(await page.$('main input[name=otp]') !== null, 'Kế toán yêu cầu OTP');
  await page.fill('main input[name=password]', 'demo123');
  await page.fill('main input[name=otp]', '000000');
  await page.click('main [data-action=login]');
  await page.waitForURL(/#\/rooms$/);
  ok(page.url().endsWith('#/rooms'), 'đăng nhập xong mở lại deep link');
  const session = await page.evaluate(() => window.__TH.store.get().meta.session);
  ok(session.role === 'accountant' && !JSON.stringify(session).includes('demo123'), 'phiên chỉ lưu token + vai trò');
  await page.reload();
  ok(page.url().endsWith('#/rooms'), 'reload giữ phiên demo');
}
