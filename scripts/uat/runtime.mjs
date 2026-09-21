import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, ImageRun,
  PageBreak, PageNumber, PageOrientation, Packer, Paragraph, ShadingType, Table, TableCell,
  TableOfContents, TableRow, TextRun, WidthType,
} from 'docx';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const WIDTH = 1440;
export const HEIGHT = 1080;
export const TODAY = '2026-10-28';
export const PERIOD = '2026-10';
export const COMMIT = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
export const SHORT_SHA = COMMIT.slice(0, 7);
export const BRANCH = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
export const PYTHON = process.env.PYTHON_PATH || 'python';
export const RUN_ROOT = path.resolve(process.env.TIMEHOUSE_UAT_ROOT || path.join(ROOT, 'docs', 'uat', `develop-${SHORT_SHA}-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}`));
export const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const ROLE = {
  admin: 'Quản trị viên', accountant: 'Kế toán', ops: 'Vận hành', sale: 'Kinh doanh',
  kythuat: 'Kỹ thuật', hr: 'Nhân sự', codong: 'Cổ đông', any: 'Bất kỳ',
};
const ROLE_MENU = {
  admin: /Quay lại Admin|Quản trị viên/, accountant: /Kế toán/, ops: /Vận hành/,
  sale: /Kinh doanh|Sale/, kythuat: /Kỹ thuật/, hr: /Nhân sự/, codong: /Cổ đông/,
};

// Ma trận truy vết flow → yêu cầu SRS (dùng cho DOCX từng phase)
export const FLOW_TRACE = {
  S0: 'Đăng nhập, RBAC (FR-SYS-01), danh mục dịch vụ (FR-CAT-01)', F00: 'Chủ nhà & HĐ đầu vào (FR-BLD-01/06, BR-11), tòa & phòng (FR-BLD-02/03)',
  F01: 'Khách thuê (FR-CUS-01, BR-18)', F02: 'Hợp đồng & kích hoạt (FR-CUS-02, BR-05/06)', F03: 'Chỉ số & hóa đơn (FR-FIN-01/02, BR-21)', F04: 'Gửi Zalo hóa đơn (FR-ZAL-01/02)',
  F05: 'Công nợ & thu tiền (FR-FIN-03)', F06: 'Nhắc nợ Zalo (FR-ZAL-03)', F07: 'Kết thúc HĐ (FR-CUS-04)', F08: 'Hoàn cọc (FR-FIN-05, OI-07)', F09: 'Dọn phòng & vòng đời phòng (FR-BLD-05)', F10: 'Chi phí, import, tài khoản, báo cáo (FR-FIN-05, FR-SYS-02/03, FR-RPT-01)',
  F11: 'CRM lead → giữ chỗ → chốt thuê → hoa hồng (FR-SAL-01..05)', F12: 'OCR hợp đồng (FR-OCR-01..03)', F13: 'Import bảng kê & số dư đầu kỳ (FR-FIN-04/06, Data Job)', F14: 'Bảo trì & bảo dưỡng → chi phí (FR-MNT-01..03)', F15: 'Báo cáo, khóa kỳ, Zalo retry (FR-RPT-02, FR-FIN-08, FR-ZAL-04)', 'F08.5': 'Hoàn cọc – yêu cầu chỉnh sửa (FR-FIN-05 mở rộng)',
  F16: 'Kiểm kê tài sản (FR-BLD-04, FR-MNT-02)', F17: 'Nhân sự → phân công → bảng công mô phỏng (lương P1: F14 §4.26)', F18: 'Cổ đông, vốn góp, phân phối, scope cổ đông (FR-INV-01..04, D-14)', F19: 'Ngân hàng & đối soát (FR-FIN-07)',
};
export const SIMULATION_LABELS = ['Zalo (gửi/retry mô phỏng)', 'OCR (trích xuất mô phỏng)', 'Ngân hàng/VietQR (sao kê mô phỏng)'];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export const norm = value => String(value || '').replace(/\s+/g, ' ').trim();

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

async function ensureServer() {
  const requested = process.env.TIMEHOUSE_BASE_URL;
  if (requested) {
    const response = await fetch(`${requested}/index.html`);
    if (!response.ok) throw new Error(`TIMEHOUSE_BASE_URL trả HTTP ${response.status}`);
    return { url: requested, child: null };
  }
  const port = await freePort();
  const child = spawn(process.execPath, ['scripts/serve.mjs'], {
    cwd: ROOT, env: { ...process.env, PORT: String(port) }, stdio: 'ignore', windowsHide: true,
  });
  const url = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${url}/index.html`);
      if (response.ok) return { url, child };
    } catch { /* retry while local server starts */ }
    await sleep(100);
  }
  child.kill();
  throw new Error(`Không khởi động được server tại ${url}`);
}

export function phasePaths(phase) {
  const out = path.join(RUN_ROOT, `phase-${phase}`);
  return {
    out,
    evidence: path.join(out, 'evidence'),
    downloads: path.join(out, 'downloads'),
    manifest: path.join(out, 'manifest.json'),
    docx: path.join(RUN_ROOT, `0${phase}_TimeHouse_Phase${phase}_UAT_Evidence.docx`),
  };
}

export async function clickText(page, text, options = {}) {
  const root = options.scope || page;
  const locator = root.getByRole(options.role || 'button', { name: text, exact: options.exact !== false }).first();
  await locator.waitFor({ state: 'visible' });
  await locator.click();
  return locator;
}

export async function clickAction(page, action, options = {}) {
  const root = options.scope || page;
  const locator = root.locator(`[data-act="${action}"]`).first();
  await locator.waitFor({ state: 'visible' });
  await locator.click();
  return locator;
}

export async function fill(page, name, value, scope = page) {
  const locator = scope.locator(`[name="${name}"]`).first();
  await locator.waitFor({ state: 'visible' });
  const tag = await locator.evaluate(node => node.tagName.toLowerCase());
  if (tag === 'select') return select(page, name, value, scope);
  await locator.fill(String(value));
  await locator.press('Tab').catch(() => {});
}

export async function select(page, name, value, scope = page) {
  const locator = scope.locator(`select[name="${name}"]`).first();
  await locator.waitFor({ state: 'visible' });
  const choices = await locator.locator('option').evaluateAll(nodes => nodes.map(node => ({ value: node.value, text: node.textContent.trim() })));
  const wanted = choices.find(item => item.value === String(value)) || choices.find(item => item.text.includes(String(value)));
  if (!wanted) throw new Error(`Không có lựa chọn ${name}=${value}; hiện có ${choices.map(item => item.text).join(', ')}`);
  await locator.selectOption(wanted.value);
}

/* Bấm nút xác nhận trong hộp thoại (nếu có) – dùng cho U.confirm() sau thao tác chính */
export async function confirmDialog(page, name = /^(Xác nhận|Đồng ý|Vẫn đặt|OK)$/, wait = 300) {
  await page.waitForTimeout(150);
  const button = page.locator('.overlay').last().getByRole('button', { name }).first();
  if (!(await button.count()) || !(await button.isVisible().catch(() => false))) return false;
  await button.click(); await page.waitForTimeout(wait); return true;
}

export async function modal(page) {
  const locator = page.locator('.overlay').last();
  await locator.waitFor({ state: 'visible' });
  return locator;
}

export async function goto(page, baseUrl, hash) {
  const normalized = String(hash || '#/dashboard').startsWith('#') ? hash : `#${hash}`;
  await page.goto(`${baseUrl}/${normalized}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(120);
  await page.evaluate(() => document.body.classList.remove('guide-open'));
}

async function switchRole(page, role) {
  if (!role || role === 'any') return;
  const current = await page.evaluate(() => window.TH?.auth?.role?.() || '');
  if (current === role) return;
  await page.locator('.tb-user').click();
  const item = page.locator('div[role="menu"] button[role="menuitem"]').filter({ hasText: ROLE_MENU[role] || role }).first();
  await item.waitFor({ state: 'visible' });
  await item.click({ force: true });
  await page.waitForTimeout(120);
  const actual = await page.evaluate(() => window.TH?.auth?.role?.() || '');
  if (actual !== role) throw new Error(`Chuyển vai trò thất bại: cần ${role}, thực tế ${actual}`);
}

async function metadata(page, id) {
  return page.evaluate(milestone => {
    const guide = window.TH?.guide;
    const item = guide?.find?.(milestone);
    if (!item) throw new Error(`Guide không có milestone ${milestone}`);
    return {
      id: item.id, title: item.title, role: item.role, route: guide.routeOf(item),
      action: item.how, expected: item.expect, selector: item.hl ? `[data-guide="${item.hl}"]` : '#content',
      flow: (guide.all().find(x => x.id === item.id) || {}).flow || item.id.split('.')[0],
      flowTitle: (guide.flows().find(f => f.ms.some(m => m.id === item.id)) || {}).title || '',
      inputs: item.sample?.values || item.sample || {},
    };
  }, id);
}

/* Bản ghi user mới nhất của một collection (dùng cho assertion smoke) */
export async function latestUser(page, collection, where = null) {
  return page.evaluate(({ collection, where }) => {
    const rows = (window.TH.store.state[collection] || []).filter(row => row.source === 'user');
    const filtered = where ? rows.filter(row => Object.entries(where).every(([key, value]) => row[key] === value)) : rows;
    return filtered.slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0] || null;
  }, { collection, where });
}
/* Smoke test liên phase: predicate chạy trong trang, trả về { ok, detail } */
export async function smokeCheck(page, id, evaluator, args = {}) {
  let outcome;
  try { outcome = await page.evaluate(evaluator, args); } catch (error) { outcome = { ok: false, detail: error.message }; }
  return { id, status: outcome && outcome.ok ? 'PASS' : 'FAIL', detail: String((outcome && outcome.detail) || '') };
}

async function stateSnapshot(page) {
  return page.evaluate(() => {
    const T = window.TH; const state = T.store.state; const all = key => state[key] || [];
    const latestUser = key => all(key).filter(x => x.source === 'user').slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0] || null;
    const guideDone = { ...(state.guide?.done || {}) };
    return {
      route: location.hash, role: T.auth.role(), today: state.meta.today, period: state.meta.period,
      guideDone,
      counts: Object.fromEntries(['leads', 'viewings', 'holds', 'deals', 'contracts', 'ocrExtractions', 'importJobs', 'incidents', 'maintenanceSchedules', 'reportRuns', 'inventories', 'inventoryLines', 'employees', 'buildingAssignments', 'timesheets', 'payrolls', 'shareholders', 'contributions', 'distributions', 'bankTransactions', 'payments', 'expenses'].map(key => [key, all(key).length])),
      records: Object.fromEntries(['leads', 'viewings', 'holds', 'deals', 'contracts', 'ocrExtractions', 'importJobs', 'incidents', 'maintenanceSchedules', 'reportRuns', 'inventories', 'employees', 'payrolls', 'shareholders', 'contributions', 'distributions', 'bankTransactions', 'payments', 'expenses'].map(key => [key, latestUser(key)])),
    };
  });
}

function recordIds(snapshot) {
  const ids = {};
  for (const [collection, record] of Object.entries(snapshot.records || {})) {
    if (record?.id) ids[collection] = record.code ? `${record.id} (${record.code})` : record.id;
  }
  return ids;
}

async function annotate(page, item) {
  await page.evaluate(({ id, role, selector }) => {
    document.querySelectorAll('[data-uat-callout]').forEach(node => node.remove());
    let target = null; try { target = selector ? document.querySelector(selector) : null; } catch (e) { target = null; }
    const visible = node => { if (!node) return false; const box = node.getBoundingClientRect(); const style = getComputedStyle(node); return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'; };
    if (!visible(target)) target = null;
    // ưu tiên drawer/modal đang mở (thao tác nhập liệu) rồi tới vùng nội dung
    if (!target) target = [...document.querySelectorAll('.overlay .drawer, .overlay .modal')].reverse().find(visible) || null;
    if (!target) target = document.querySelector('#content') || document.body;
    target.scrollIntoView({ block: 'center', inline: 'nearest' });
    target.dataset.uatOldOutline = target.style.outline || '';
    target.style.outline = '3px solid #f59e0b'; target.style.outlineOffset = '4px'; target.dataset.uatTarget = '1';
    const label = document.createElement('div'); label.dataset.uatCallout = '1';
    label.textContent = `${id} · ${role} · ${location.hash} · ${new Date().toISOString()}`;
    Object.assign(label.style, { position: 'fixed', right: '16px', bottom: '16px', zIndex: 2147483647, padding: '8px 12px', borderRadius: '8px', color: '#fff', background: '#0f2a5f', font: '600 14px system-ui', boxShadow: '0 2px 10px rgba(0,0,0,.25)' });
    document.body.appendChild(label);
  }, item);
}

async function screenshot(page, paths, item, kind, selector) {
  await annotate(page, { ...item, selector: selector || item.selector });
  const file = path.join(paths.evidence, `${item.id}-${kind}.png`);
  await page.screenshot({ path: file, fullPage: false });
  await page.evaluate(() => {
    document.querySelectorAll('[data-uat-target]').forEach(node => { node.style.outline = node.dataset.uatOldOutline || ''; node.style.outlineOffset = ''; delete node.dataset.uatOldOutline; delete node.dataset.uatTarget; });
    document.querySelectorAll('[data-uat-callout]').forEach(node => node.remove());
  });
  return path.relative(paths.out, file).replaceAll('\\', '/');
}

function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }

export async function saveDownload(download, paths, checks = {}) {
  const name = download.suggestedFilename();
  const file = path.join(paths.downloads, name);
  await download.saveAs(file);
  const bytes = fs.readFileSync(file);
  if (!bytes.length) throw new Error(`${name} rỗng (0 byte)`);
  const base = { file: path.relative(paths.out, file).replaceAll('\\', '/'), name, bytes: bytes.length, sha256: sha256(file) };
  if (checks.kind === 'pdf' || /\.pdf$/i.test(name)) {
    if (bytes.subarray(0, 5).toString('latin1') !== '%PDF-') throw new Error(`${name} không phải PDF hợp lệ (thiếu header %PDF-)`);
    let pages = null;
    try { pages = Number(execFileSync(PYTHON, ['-c', 'import sys,fitz;print(len(fitz.open(sys.argv[1])))', file], { encoding: 'utf8' }).trim()) || null; } catch { pages = null; }
    if (checks.minPages != null && (pages == null || pages < checks.minPages)) throw new Error(`${name} có ${pages ?? '?'} trang, cần tối thiểu ${checks.minPages}`);
    return { ...base, kind: 'pdf', pages };
  }
  const text = bytes.toString('utf8').replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter(Boolean); const header = lines[0] || '';
  const missing = (checks.headers || []).filter(value => !header.includes(value));
  if (missing.length) throw new Error(`${name} thiếu cột: ${missing.join(', ')}`);
  if (checks.minRows != null && lines.length - 1 < checks.minRows) throw new Error(`${name} chỉ có ${lines.length - 1} dòng, cần tối thiểu ${checks.minRows}`);
  const values = [];
  for (const expect of checks.expectValues || []) {
    const rowText = expect.row === 'any' ? lines.join('\n') : expect.row === 'data' ? lines.slice(1).join('\n') : (lines[expect.row] || '');
    const ok = rowText.includes(String(expect.value));
    values.push({ row: expect.row, value: String(expect.value), ok });
    if (!ok) throw new Error(`${name} không có giá trị "${expect.value}" ở dòng ${expect.row}`);
  }
  return { ...base, kind: 'csv', rows: Math.max(0, lines.length - 1), header, sample: lines[1] || '', values };
}

export async function createRunner({ phase, expectedMilestones, phaseFlags }) {
  const paths = phasePaths(phase);
  fs.mkdirSync(paths.evidence, { recursive: true }); fs.mkdirSync(paths.downloads, { recursive: true });
  const server = await ensureServer();
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1, locale: 'vi-VN', timezoneId: 'Asia/Bangkok', acceptDownloads: true });
  const page = await context.newPage(); page.setDefaultTimeout(18000);
  await page.addInitScript(() => { window.__uatConsoleErrors = []; window.addEventListener('error', e => window.__uatConsoleErrors.push(String(e.message || e))); const orig = console.error; console.error = (...args) => { try { window.__uatConsoleErrors.push(args.map(String).join(' ')); } catch { /* ignore */ } orig.apply(console, args); }; });
  await page.goto(`${server.url}/#/login`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(({ flags, today, period }) => {
    if (window.TH?.phase) { window.TH.phase.set(2, !!flags.p2); window.TH.phase.set(3, !!flags.p3); }
    window.TH.store.state.meta.today = today; window.TH.store.state.meta.period = period; window.TH.store.saveNow();
  }, { flags: phaseFlags, today: TODAY, period: PERIOD });
  await page.locator('input[name=username]').fill('admin'); await page.locator('input[name=password]').fill('demo123');
  await clickText(page, 'Đăng nhập'); await page.waitForURL(/#\/dashboard/);

  const results = []; const regression = []; const smoke = []; let finished = false;
  // counted:false → mốc regression ngoài bộ đếm (vẫn chụp evidence, guide-check, record đầy đủ)
  async function step(id, action, options = {}) {
    const item = await metadata(page, id); const startedAt = new Date().toISOString(); const images = [];
    const bucket = options.counted === false ? regression : results;
    try {
      await switchRole(page, item.role); const target = typeof options.route === 'function' ? options.route() : (options.route || item.route); await goto(page, server.url, target);
      images.push(await screenshot(page, paths, item, 'input'));
      const output = await action({ page, baseUrl: server.url, paths, item, helpers: { clickText, clickAction, fill, select, modal, goto, saveDownload } }) || {};
      await page.waitForTimeout(options.wait || 180);
      await page.evaluate(() => window.TH.guide.evaluate('uat'));
      const snapshot = await stateSnapshot(page); const guidePass = !!snapshot.guideDone[id];
      const assertions = [...(output.assertions || []), { id: 'guide-check', status: guidePass ? 'PASS' : 'FAIL', detail: guidePass ? `${id} satisfied` : `${id} chưa thỏa điều kiện guide` }];
      if (!guidePass && options.requireGuide !== false) throw new Error(`${id} chưa thỏa điều kiện nghiệp vụ của guide`);
      const failedAssertion = assertions.find(x => x.status === 'FAIL');
      if (failedAssertion) throw new Error(`${id} assertion ${failedAssertion.id} FAIL: ${failedAssertion.detail || ''}`);
      images.push(...(output.screenshots || [])); images.push(await screenshot(page, paths, item, 'result', output.scrollTo || options.scrollTo));
      const finishedAt = new Date().toISOString();
      const record = { phase: `P${phase}`, flow: item.flow, flowTitle: item.flowTitle, milestone: id, counted: options.counted !== false, title: item.title, role: item.role, route: snapshot.route, phaseFlags, inputs: output.inputs || item.inputs, action: item.action, expected: item.expected, actual: output.actual || norm((await page.locator('#content').innerText()).slice(0, 700)), assertions, screenshots: images, downloads: output.downloads || [], recordIds: recordIds(snapshot), commit: COMMIT, timestamps: { startedAt, finishedAt }, status: 'PASS', error: '' };
      bucket.push(record); return record;
    } catch (error) {
      const snapshot = await stateSnapshot(page).catch(() => ({ route: '', records: {} }));
      try { images.push(await screenshot(page, paths, item, 'error')); } catch { /* preserve original error */ }
      const finishedAt = new Date().toISOString();
      const consoleErrors = await page.evaluate(() => (window.__uatConsoleErrors || []).slice(-5)).catch(() => []);
      bucket.push({ phase: `P${phase}`, flow: item.flow, milestone: id, counted: options.counted !== false, title: item.title, role: item.role, route: snapshot.route || item.route, phaseFlags, inputs: item.inputs, action: item.action, expected: item.expected, actual: '', assertions: [], screenshots: images, downloads: [], recordIds: recordIds(snapshot), commit: COMMIT, timestamps: { startedAt, finishedAt }, status: 'FAIL', error: (error.stack || error.message) + (consoleErrors.length ? '\n[console] ' + consoleErrors.join('\n[console] ') : '') });
      throw error;
    }
  }

  async function finish(extra = {}) {
    finished = true;
    const final = await stateSnapshot(page).catch(() => ({}));
    const failedRegression = regression.filter(x => x.status !== 'PASS'); const failedSmoke = smoke.filter(x => x.status !== 'PASS');
    const qa = { status: results.length === expectedMilestones && results.every(x => x.status === 'PASS') && !failedSmoke.length && !failedRegression.length ? 'PASS' : 'FAIL', expectedMilestones, actualMilestones: results.length, passMilestones: results.filter(x => x.status === 'PASS').length, regression: regression.map(x => ({ milestone: x.milestone, status: x.status })), smoke };
    const manifest = { generatedAt: new Date().toISOString(), commit: COMMIT, branch: BRANCH, baseUrl: server.url, viewport: { width: WIDTH, height: HEIGHT }, today: TODAY, period: PERIOD, phase: `P${phase}`, phaseFlags, simulationLabels: SIMULATION_LABELS, milestones: results, regression, final, qa, ...extra };
    fs.writeFileSync(paths.manifest, JSON.stringify(manifest, null, 2), 'utf8');
    await buildPhaseDoc(manifest, paths.docx);
    return { manifest, paths };
  }

  // Đóng runner: nếu kịch bản abort giữa chừng thì vẫn ghi manifest (qa FAIL) để giữ evidence lỗi
  async function close(extra = {}) {
    try { if (!finished) await finish(extra); } catch (error) { console.error('Không ghi được manifest khi abort:', error.message); }
    await browser.close(); if (server.child) server.child.kill();
  }
  return { page, paths, baseUrl: server.url, step, finish, close, regression, smoke, switchRole: role => switchRole(page, role), snapshot: () => stateSnapshot(page), latest: (collection, where) => latestUser(page, collection, where), smokeCheck: (id, evaluator, args) => smokeCheck(page, id, evaluator, args) };
}

function cell(value, options = {}) {
  return new TableCell({
    width: options.width ? { size: options.width, type: WidthType.DXA } : undefined,
    shading: options.fill ? { fill: options.fill, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: String(value ?? ''), bold: !!options.bold, color: options.color || '334155', size: options.size || 18 })] })],
  });
}
function table(rows, widths) {
  return new Table({
    width: { size: widths.reduce((sum, value) => sum + value, 0), type: WidthType.DXA },
    columnWidths: widths,
    borders: Object.fromEntries(['top', 'bottom', 'left', 'right', 'insideH', 'insideV'].map(key => [key, { style: BorderStyle.SINGLE, size: key.startsWith('inside') ? 2 : 4, color: 'D7DDE3' }])),
    rows: rows.map((row, rowIndex) => new TableRow({ children: row.map((value, index) => cell(value, { width: widths[index], fill: rowIndex === 0 ? '16324F' : undefined, color: rowIndex === 0 ? 'FFFFFF' : undefined, bold: rowIndex === 0 })) })),
  });
}
function paragraph(value = '', options = {}) { return new Paragraph({ alignment: options.align, spacing: { after: options.after ?? 80, line: 260 }, children: [new TextRun({ text: String(value), bold: !!options.bold, color: options.color || '3F4A54', size: options.size || 20 })] }); }
function heading(value, level = HeadingLevel.HEADING_1) { return new Paragraph({ heading: level, children: [new TextRun({ text: value, bold: true })] }); }

/* Swimlane theo vai trò cho một phase: mỗi flow là một node trên lane của vai trò thực hiện mốc đầu tiên */
const xmlEsc = value => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function swimlaneSvg(title, flows) {
  const colors = { admin: '#2563EB', ops: '#0F766E', accountant: '#C2410C', sale: '#7C3AED', kythuat: '#0891B2', hr: '#DB2777', codong: '#65A30D' };
  const roles = [...new Set(flows.map(f => f.role))];
  const laneH = 104; const top = 78; const width = Math.max(900, 250 + flows.length * 132);
  const lanes = roles.map((role, index) => [role, ROLE[role] || role, top + index * (laneH + 10)]);
  const centers = Object.fromEntries(lanes.map(([role, , y]) => [role, y + laneH / 2]));
  const laneMarkup = lanes.map(([role, label, y]) => `<rect x="20" y="${y}" width="${width - 40}" height="${laneH}" rx="10" fill="#fff" stroke="#D7E0EA"/><rect x="20" y="${y}" width="190" height="${laneH}" rx="10" fill="${colors[role] || '#64748B'}" opacity=".12"/><text x="36" y="${y + 44}" font-family="Arial" font-size="15" font-weight="700" fill="${colors[role] || '#64748B'}">${xmlEsc(label)}</text><text x="36" y="${y + 66}" font-family="Arial" font-size="11" fill="#64748B">Thao tác qua UI</text>`).join('');
  const nodes = flows.map((f, i) => { const x = 236 + i * 132; const cy = centers[f.role]; const y = cy - 34; const next = flows[i + 1]; const arrow = next ? `<path d="M${x + 104} ${cy} C${x + 118} ${cy}, ${x + 132 - 14} ${centers[next.role]}, ${x + 132 - 6} ${centers[next.role]}" fill="none" stroke="#94A3B8" stroke-width="2.5" marker-end="url(#a)"/>` : ''; return `<g><rect x="${x}" y="${y}" width="104" height="68" rx="10" fill="#fff" stroke="${colors[f.role] || '#64748B'}" stroke-width="2"/><rect x="${x}" y="${y}" width="104" height="7" rx="4" fill="${colors[f.role] || '#64748B'}"/><text x="${x + 52}" y="${y + 30}" text-anchor="middle" font-family="Arial" font-size="13" font-weight="700" fill="#16324F">${f.key}</text><text x="${x + 52}" y="${y + 50}" text-anchor="middle" font-family="Arial" font-size="10.5" fill="#334155">${xmlEsc(String(f.title).length > 17 ? String(f.title).slice(0, 16) + '…' : String(f.title))}</text>${arrow}</g>`; }).join('');
  const height = top + lanes.length * (laneH + 10) + 20;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#94A3B8"/></marker></defs><rect width="${width}" height="${height}" fill="#F8FAFC"/><text x="28" y="34" font-family="Arial" font-size="20" font-weight="700" fill="#16324F">${xmlEsc(title)}</text><text x="28" y="58" font-family="Arial" font-size="12" fill="#64748B">Mũi tên theo thứ tự chạy; màu viền là vai trò thực hiện mốc đầu tiên của flow.</text>${laneMarkup}${nodes}</svg>`;
}
export async function writeSwimlane(target, title, flows) {
  const markup = swimlaneSvg(title, flows); const svg = target.replace(/\.png$/i, '.svg'); fs.writeFileSync(svg, markup, 'utf8');
  const size = markup.match(/width="(\d+)" height="(\d+)"/);
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: Number(size[1]), height: Number(size[2]) } });
  await page.goto(`file:///${svg.replaceAll('\\', '/')}`); await page.screenshot({ path: target }); await browser.close();
  return { png: target, width: Number(size[1]), height: Number(size[2]) };
}

export async function buildPhaseDoc(manifest, target) {
  const phase = manifest.phase;
  const header = new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `TIMEHOUSE | ${phase} UAT Evidence`, bold: true, color: '1769AA', size: 16 })] })] });
  const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Evidence runtime · Trang ', size: 16 }), PageNumber.CURRENT] })] });
  const portrait = { page: { margin: { top: 850, bottom: 800, left: 900, right: 900 } } };
  const landscape = { page: { size: { orientation: PageOrientation.LANDSCAPE, width: 12240, height: 15840 }, margin: { top: 650, bottom: 650, left: 650, right: 650 } } };
  const cover = [
    new Paragraph({ spacing: { before: 900, after: 140 }, children: [new TextRun({ text: 'TIMEHOUSE', bold: true, size: 28, color: '1769AA' })] }),
    new Paragraph({ spacing: { before: 600, after: 140 }, children: [new TextRun({ text: `${phase} · UAT EVIDENCE`, bold: true, size: 34, color: '16324F' })] }),
    paragraph('Minh chứng chạy nghiệp vụ qua giao diện người dùng trên baseline develop.', { size: 23, after: 260 }),
    table([['Thông tin', 'Giá trị'], ['Commit', manifest.commit], ['Ngày/kỳ nghiệp vụ', `${manifest.today} · ${manifest.period}`], ['Viewport', `${manifest.viewport.width}×${manifest.viewport.height}`], ['Phase flags', JSON.stringify(manifest.phaseFlags)], ['Kết quả', `${manifest.qa.status} · ${manifest.milestones.filter(x => x.status === 'PASS').length}/${manifest.qa.expectedMilestones}`]], [2400, 6600]),
    heading('Giới hạn mô phỏng'), paragraph('Zalo, OCR và dịch vụ ngân hàng/VietQR trong mockup được ghi nhận là mô phỏng; kết quả PASS không đồng nghĩa tích hợp production-ready.'),
  ];
  const allItems = [...manifest.milestones, ...(manifest.regression || []).filter(x => x.milestone)];
  const flows = [...new Set(allItems.map(item => item.flow))];
  const phaseDir = phasePaths(Number(phase.slice(1))).out;
  try {
    const flowDefs = flows.map(key => { const first = allItems.find(item => item.flow === key); return { key, title: first.flowTitle || first.title, role: first.role }; });
    const diagram = await writeSwimlane(path.join(phaseDir, `${phase.toLowerCase()}-swimlane.png`), `${phase} · Swimlane theo vai trò`, flowDefs);
    cover.push(heading('Sơ đồ swimlane'), new Paragraph({ children: [new ImageRun({ data: fs.readFileSync(diagram.png), transformation: { width: 620, height: Math.round(620 * diagram.height / diagram.width) }, type: 'png' })] }));
  } catch (error) { cover.push(paragraph(`(Không dựng được sơ đồ swimlane: ${error.message})`, { color: 'B91C1C' })); }
  cover.push(heading('Ma trận truy vết'), table([['Flow', 'Yêu cầu / phạm vi SRS', 'Mốc', 'Kết quả'], ...flows.map(key => { const items = allItems.filter(item => item.flow === key); return [key, FLOW_TRACE[key] || '-', items.map(item => item.milestone).join(', '), `${items.filter(item => item.status === 'PASS').length}/${items.length} PASS`]; })], [1000, 4200, 2400, 1400]));
  cover.push(heading('Mục lục'), paragraph('Mục lục tự cập nhật khi mở bằng Microsoft Word (chọn Cập nhật trường / F9).', { size: 17, color: '64748B' }), new TableOfContents('Mục lục', { hyperlink: true, headingStyleRange: '1-3' }));
  const sections = [{ properties: portrait, headers: header, footers: footer, children: cover }];
  for (const flow of flows) {
    const children = [heading(`${flow} · Flow nghiệp vụ`, HeadingLevel.HEADING_1)];
    for (const item of allItems.filter(row => row.flow === flow)) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, pageBreakBefore: children.length > 1, children: [new TextRun({ text: `${item.milestone} · ${item.title}`, bold: true })] }));
      children.push(table([
        ['Trường', 'Chi tiết'], ['Vai trò', ROLE[item.role] || item.role], ['Route', item.route], ['Dữ liệu nhập', typeof item.inputs === 'string' ? item.inputs : JSON.stringify(item.inputs)], ['Action', item.action], ['Expected', item.expected], ['Actual', item.actual || '-'], ['Assertions', (item.assertions || []).map(a => `${a.id}: ${a.status}${a.detail ? ' – ' + a.detail : ''}`).join('\n') || '-'], ['File tải xuống', (item.downloads || []).map(d => `${d.name} · ${d.bytes} B · ${d.kind === 'pdf' ? (d.pages ?? '?') + ' trang' : (d.rows ?? '?') + ' dòng'} · sha256 ${String(d.sha256).slice(0, 16)}…`).join('\n') || '-'], ['Record IDs', Object.entries(item.recordIds || {}).map(([key, value]) => `${key}: ${value}`).join('\n') || '-'], ['Thời gian', `${item.timestamps?.startedAt || ''} → ${item.timestamps?.finishedAt || ''}`], ['Kết quả', item.status + (item.counted === false ? ' (regression – ngoài bộ đếm)' : '') + (item.error ? '\n' + String(item.error).split('\n')[0] : '')],
      ], [2400, 11800]));
      const shots = (item.screenshots || []).map(relative => path.join(phaseDir, relative)).filter(file => fs.existsSync(file));
      for (let i = 0; i < shots.length; i += 2) {
        const pair = shots.slice(i, i + 2);
        const cells = pair.map(file => new TableCell({ width: { size: 7100, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } }, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 20 }, children: [new ImageRun({ data: fs.readFileSync(file), transformation: { width: 460, height: 345 }, type: 'png' })] }), paragraph(path.basename(file), { align: AlignmentType.CENTER, size: 15, color: '64748B' })] }));
        if (cells.length === 1) cells.push(new TableCell({ width: { size: 7100, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } }, children: [new Paragraph('')] }));
        children.push(new Table({ width: { size: 14200, type: WidthType.DXA }, columnWidths: [7100, 7100], borders: { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, insideH: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, insideV: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } }, rows: [new TableRow({ cantSplit: true, children: cells })] }));
      }
    }
    sections.push({ properties: landscape, headers: header, footers: footer, children });
  }
  const qaRows = [['Kiểm tra', 'Kết quả', 'Chi tiết'], ['Milestones', manifest.milestones.every(x => x.status === 'PASS') && manifest.milestones.length === manifest.qa.expectedMilestones ? 'PASS' : 'FAIL', `${manifest.milestones.filter(x => x.status === 'PASS').length}/${manifest.qa.expectedMilestones}`], ...(manifest.regression || []).filter(x => x.milestone).map(item => [`Regression ${item.milestone}`, item.status, item.title || '']), ...(manifest.qa.smoke || []).map(item => [`Smoke ${item.id}`, item.status, item.detail || '']), ...(manifest.qa.checks || []).map(item => [`QA ${item.id}`, item.status, item.detail || ''])];
  const issues = [
    ...allItems.filter(item => item.status !== 'PASS').map(item => `${item.milestone} FAIL – ${String(item.error || '').split('\n')[0]}`),
    ...(manifest.qa.smoke || []).filter(item => item.status !== 'PASS').map(item => `Smoke ${item.id} FAIL – ${item.detail || ''}`),
    'OI-07 – NEEDS BUSINESS CONFIRMATION: mockup không tự bù trừ công nợ vào tiền cọc; kết quả là “PASS theo mockup hiện tại”.',
    ...SIMULATION_LABELS.map(label => `Giới hạn mô phỏng: ${label} – PASS không chứng nhận tích hợp production.`),
  ];
  sections.push({ properties: portrait, headers: header, footers: footer, children: [heading('Kết luận'), table(qaRows, [3000, 1400, 4700]), paragraph(`Trạng thái phase: ${manifest.qa.status}. Ảnh, mã record và thời gian lấy từ cùng một lần chạy sạch (manifest.json, commit ${String(manifest.commit).slice(0, 7)}).`), heading('Danh sách vấn đề & giới hạn'), ...issues.map(text => new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text, size: 19, color: '3F4A54' })] }))] });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, await Packer.toBuffer(new Document({ sections })));
}
