// Khởi chạy trình duyệt giống render.mjs (msedge → chrome → chromium đi kèm playwright) và so ảnh trong trình duyệt.
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';

export async function launch() {
  for (const channel of ['msedge', 'chrome', undefined]) {
    try { return await chromium.launch(channel ? { channel } : {}); } catch { /* thử kênh kế tiếp */ }
  }
  throw new Error('Không mở được Edge/Chrome/Chromium cho Playwright');
}

/** Trang mới 1440×900, DSF 1.25 như render.mjs; gom lỗi console/pageerror vào page.__errors. */
export async function newPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.25, acceptDownloads: true });
  page.__errors = [];
  page.on('pageerror', (e) => page.__errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') page.__errors.push(`console: ${m.text()}`); });
  return page;
}

/**
 * So hai PNG bằng canvas trong trình duyệt (không cần thư viện). Trả về tỷ lệ pixel lệch trên vùng chung,
 * chênh chiều cao, ảnh diff (base64) và tỷ lệ lệch trong các vùng khai báo.
 * regions: [{ name, x, y, w, h }] theo pixel ảnh.
 */
export async function diffPng(browser, pathA, pathB, { threshold = 40, regions = [] } = {}) {
  const [a, b] = await Promise.all([readFile(pathA), readFile(pathB)]);
  const page = await browser.newPage();
  const res = await page.evaluate(async ({ a64, b64, threshold, regions }) => {
    const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
    const [ia, ib] = await Promise.all([load(`data:image/png;base64,${a64}`), load(`data:image/png;base64,${b64}`)]);
    const w = Math.min(ia.width, ib.width); const h = Math.min(ia.height, ib.height);
    const px = (img) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, h); };
    const da = px(ia); const db = px(ib);
    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const og = out.getContext('2d'); og.drawImage(ia, 0, 0); og.fillStyle = 'rgba(255,255,255,0.65)'; og.fillRect(0, 0, w, h);
    const diff = og.getImageData(0, 0, w, h);
    const mask = new Uint8Array(w * h);
    let bad = 0;
    for (let i = 0; i < w * h; i++) {
      const k = i * 4;
      if (Math.abs(da.data[k] - db.data[k]) > threshold || Math.abs(da.data[k + 1] - db.data[k + 1]) > threshold || Math.abs(da.data[k + 2] - db.data[k + 2]) > threshold) {
        bad++; mask[i] = 1; diff.data[k] = 220; diff.data[k + 1] = 38; diff.data[k + 2] = 38; diff.data[k + 3] = 255;
      }
    }
    og.putImageData(diff, 0, 0);
    const reg = regions.map((r) => {
      let n = 0; let t = 0;
      for (let y = r.y; y < Math.min(h, r.y + r.h); y++) for (let x = r.x; x < Math.min(w, r.x + r.w); x++) { t++; n += mask[y * w + x]; }
      return { name: r.name, pct: t ? (n / t) * 100 : 0 };
    });
    return { pct: (bad / (w * h)) * 100, wA: ia.width, hA: ia.height, wB: ib.width, hB: ib.height, png: out.toDataURL('image/png').split(',')[1], regions: reg };
  }, { a64: a.toString('base64'), b64: b.toString('base64'), threshold, regions });
  await page.close();
  return res;
}
