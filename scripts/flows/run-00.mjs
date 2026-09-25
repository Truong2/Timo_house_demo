import { startServer } from '../serve.mjs';
import { launch, newPage } from '../lib/browser.mjs';
import { verifyAuth } from './00-auth.mjs';

const { server, url } = await startServer({ port: 0, quiet: true });
const browser = await launch();
const page = await newPage(browser);
await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
page.setDefaultTimeout(8000);
const results = [];
const ok = (condition, message) => { results.push(!!condition); console.log(`${condition ? '✓' : '✕'} ${message}`); };
const section = (name) => console.log(name);
const go = async (hash) => {
  await page.goto(`${url}${hash}`);
  await page.waitForSelector('main .ph h1:visible, main .login-card:visible');
};
try {
  await go('#/rooms');
  await verifyAuth({ page, go, ok, section });
  ok(page.__errors.length === 0, `không có lỗi console/pageerror: ${page.__errors.join(' | ')}`);
} finally { await browser.close(); server.close(); }
process.exit(results.every(Boolean) ? 0 : 1);
