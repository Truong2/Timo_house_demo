/* Ghim bộ dữ liệu demo cho các script trình duyệt.
   Từ khi có bộ luồng tháng 9, app mặc định mở bộ đó (kỳ 9 đã khóa, ngày xem 05/10). Các kịch bản smoke/verify/sweep
   được viết cho bộ đối chiếu lịch sử, nên mặc định ghim 'classic'. Chạy trên bộ khác:
     node scripts/sweep.mjs --dataset=september-flow-v1      (hoặc biến môi trường TH_DATASET)
   Dùng: import { chromium } from './_dataset.mjs';  – mọi context/page tạo từ browser đều được ghim trước khi app nạp. */
import { chromium as playwright } from 'playwright-core';

export const DATASET_KEY = 'timohouse-demo-dataset';
export const dataset = (process.argv.find(a => a.startsWith('--dataset=')) || '').slice('--dataset='.length) || process.env.TH_DATASET || 'classic';

const pin = async (ctx) => {
  await ctx.addInitScript(([key, value]) => { try { localStorage.setItem(key, value); } catch { /* about:blank */ } }, [DATASET_KEY, dataset]);
  return ctx;
};

export const chromium = {
  async launch(options) {
    const browser = await playwright.launch(options);
    const newContext = browser.newContext.bind(browser);
    browser.newContext = async (...args) => pin(await newContext(...args));
    // browser.newPage tạo context riêng cho trang; giữ hành vi đó: đóng trang thì đóng context.
    browser.newPage = async (...args) => {
      const ctx = await browser.newContext(...args), page = await ctx.newPage();
      page.on('close', () => { ctx.close().catch(() => {}); });
      return page;
    };
    return browser;
  },
};
