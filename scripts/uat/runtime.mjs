import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, ImageRun,
  PageBreak, PageNumber, Packer, Paragraph, ShadingType, Table, TableCell,
  TableOfContents, TableRow, TextRun, WidthType,
} from 'docx';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const WIDTH = 1440;
export const HEIGHT = 1080;
export const TODAY = '2026-10-28';
export const PERIOD = '2026-10';
export const COMMIT = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
export const SHORT_SHA = COMMIT.slice(0, 7);
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
      inputs: item.sample?.values || item.sample || {},
    };
  }, id);
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
    let target = selector ? document.querySelector(selector) : null;
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

async function screenshot(page, paths, item, kind) {
  await annotate(page, item);
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
  const bytes = fs.readFileSync(file); const text = bytes.toString('utf8').replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter(Boolean); const header = lines[0] || '';
  const missing = (checks.headers || []).filter(value => !header.includes(value));
  if (missing.length) throw new Error(`${name} thiếu cột: ${missing.join(', ')}`);
  if (checks.minRows != null && lines.length - 1 < checks.minRows) throw new Error(`${name} chỉ có ${lines.length - 1} dòng, cần tối thiểu ${checks.minRows}`);
  return { file: path.relative(paths.out, file).replaceAll('\\', '/'), name, bytes: bytes.length, rows: Math.max(0, lines.length - 1), header, sha256: sha256(file) };
}

export async function createRunner({ phase, expectedMilestones, phaseFlags }) {
  const paths = phasePaths(phase);
  fs.mkdirSync(paths.evidence, { recursive: true }); fs.mkdirSync(paths.downloads, { recursive: true });
  const server = await ensureServer();
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1, locale: 'vi-VN', timezoneId: 'Asia/Bangkok', acceptDownloads: true });
  const page = await context.newPage(); page.setDefaultTimeout(18000);
  await page.goto(`${server.url}/#/login`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(({ flags, today, period }) => {
    if (window.TH?.phase) { window.TH.phase.set(2, !!flags.p2); window.TH.phase.set(3, !!flags.p3); }
    window.TH.store.state.meta.today = today; window.TH.store.state.meta.period = period; window.TH.store.saveNow();
  }, { flags: phaseFlags, today: TODAY, period: PERIOD });
  await page.locator('input[name=username]').fill('admin'); await page.locator('input[name=password]').fill('demo123');
  await clickText(page, 'Đăng nhập'); await page.waitForURL(/#\/dashboard/);

  const results = []; const regression = []; const smoke = [];
  async function step(id, action, options = {}) {
    const item = await metadata(page, id); const startedAt = new Date().toISOString(); const images = [];
    try {
      await switchRole(page, item.role); await goto(page, server.url, options.route || item.route);
      images.push(await screenshot(page, paths, item, 'input'));
      const output = await action({ page, baseUrl: server.url, paths, item, helpers: { clickText, clickAction, fill, select, modal, goto, saveDownload } }) || {};
      await page.waitForTimeout(options.wait || 180);
      await page.evaluate(() => window.TH.guide.evaluate('uat'));
      const snapshot = await stateSnapshot(page); const guidePass = !!snapshot.guideDone[id];
      const assertions = [...(output.assertions || []), { id: 'guide-check', status: guidePass ? 'PASS' : 'FAIL', detail: guidePass ? `${id} satisfied` : `${id} chưa thỏa điều kiện guide` }];
      if (!guidePass && options.requireGuide !== false) throw new Error(`${id} chưa thỏa điều kiện nghiệp vụ của guide`);
      images.push(...(output.screenshots || [])); images.push(await screenshot(page, paths, item, 'result'));
      const finishedAt = new Date().toISOString();
      const record = { phase: `P${phase}`, flow: item.flow, milestone: id, title: item.title, role: item.role, route: snapshot.route, phaseFlags, inputs: output.inputs || item.inputs, action: item.action, expected: item.expected, actual: output.actual || norm((await page.locator('#content').innerText()).slice(0, 700)), assertions, screenshots: images, downloads: output.downloads || [], recordIds: recordIds(snapshot), commit: COMMIT, timestamps: { startedAt, finishedAt }, status: 'PASS', error: '' };
      results.push(record); return record;
    } catch (error) {
      const snapshot = await stateSnapshot(page).catch(() => ({ route: '', records: {} }));
      try { images.push(await screenshot(page, paths, item, 'error')); } catch { /* preserve original error */ }
      const finishedAt = new Date().toISOString();
      results.push({ phase: `P${phase}`, flow: item.flow, milestone: id, title: item.title, role: item.role, route: snapshot.route || item.route, phaseFlags, inputs: item.inputs, action: item.action, expected: item.expected, actual: '', assertions: [], screenshots: images, downloads: [], recordIds: recordIds(snapshot), commit: COMMIT, timestamps: { startedAt, finishedAt }, status: 'FAIL', error: error.stack || error.message });
      throw error;
    }
  }

  async function finish(extra = {}) {
    const final = await stateSnapshot(page);
    const qa = { status: results.length === expectedMilestones && results.every(x => x.status === 'PASS') && smoke.every(x => x.status === 'PASS') && regression.every(x => x.status === 'PASS') ? 'PASS' : 'FAIL', expectedMilestones, actualMilestones: results.length, smoke };
    const manifest = { generatedAt: new Date().toISOString(), commit: COMMIT, branch: 'uat/develop-3phase-20260918', baseUrl: server.url, viewport: { width: WIDTH, height: HEIGHT }, today: TODAY, period: PERIOD, phase: `P${phase}`, phaseFlags, simulationLabels: ['Zalo', 'OCR', 'Ngân hàng/VietQR'], milestones: results, regression, final, qa, ...extra };
    fs.writeFileSync(paths.manifest, JSON.stringify(manifest, null, 2), 'utf8');
    await buildPhaseDoc(manifest, paths.docx);
    return { manifest, paths };
  }

  async function close() { await browser.close(); if (server.child) server.child.kill(); }
  return { page, paths, baseUrl: server.url, step, finish, close, regression, smoke, switchRole: role => switchRole(page, role), snapshot: () => stateSnapshot(page) };
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

export async function buildPhaseDoc(manifest, target) {
  const phase = manifest.phase;
  const header = new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `TIMEHOUSE | ${phase} UAT Evidence`, bold: true, color: '1769AA', size: 16 })] })] });
  const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Evidence runtime · Trang ', size: 16 }), PageNumber.CURRENT] })] });
  const portrait = { page: { margin: { top: 850, bottom: 800, left: 900, right: 900 } } };
  const landscape = { page: { orientation: 'landscape', width: 15840, height: 12240, margin: { top: 650, bottom: 650, left: 650, right: 650 } } };
  const cover = [
    new Paragraph({ spacing: { before: 900, after: 140 }, children: [new TextRun({ text: 'TIMEHOUSE', bold: true, size: 28, color: '1769AA' })] }),
    new Paragraph({ spacing: { before: 600, after: 140 }, children: [new TextRun({ text: `${phase} · UAT EVIDENCE`, bold: true, size: 34, color: '16324F' })] }),
    paragraph('Minh chứng chạy nghiệp vụ qua giao diện người dùng trên baseline develop.', { size: 23, after: 260 }),
    table([['Thông tin', 'Giá trị'], ['Commit', manifest.commit], ['Ngày/kỳ nghiệp vụ', `${manifest.today} · ${manifest.period}`], ['Viewport', `${manifest.viewport.width}×${manifest.viewport.height}`], ['Phase flags', JSON.stringify(manifest.phaseFlags)], ['Kết quả', `${manifest.qa.status} · ${manifest.milestones.filter(x => x.status === 'PASS').length}/${manifest.qa.expectedMilestones}`]], [2400, 6600]),
    heading('Giới hạn mô phỏng'), paragraph('Zalo, OCR và dịch vụ ngân hàng/VietQR trong mockup được ghi nhận là mô phỏng; kết quả PASS không đồng nghĩa tích hợp production-ready.'),
    heading('Mục lục'), new TableOfContents('Mục lục', { hyperlink: true, headingStyleRange: '1-3' }),
  ];
  const sections = [{ properties: portrait, headers: header, footers: footer, children: cover }];
  const flows = [...new Set(manifest.milestones.map(item => item.flow))];
  for (const flow of flows) {
    const children = [heading(`${flow} · Flow nghiệp vụ`, HeadingLevel.HEADING_1)];
    for (const item of manifest.milestones.filter(row => row.flow === flow)) {
      children.push(heading(`${item.milestone} · ${item.title}`, HeadingLevel.HEADING_2));
      children.push(table([
        ['Trường', 'Chi tiết'], ['Vai trò', ROLE[item.role] || item.role], ['Route', item.route], ['Dữ liệu nhập', typeof item.inputs === 'string' ? item.inputs : JSON.stringify(item.inputs)], ['Action', item.action], ['Expected', item.expected], ['Actual', item.actual || '-'], ['Record IDs', Object.entries(item.recordIds || {}).map(([key, value]) => `${key}: ${value}`).join('\n') || '-'], ['Kết quả', item.status],
      ], [2100, 10700]));
      for (const relative of item.screenshots || []) {
        const file = path.join(phasePaths(Number(phase.slice(1))).out, relative);
        if (!fs.existsSync(file)) continue;
        children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 40 }, children: [new ImageRun({ data: fs.readFileSync(file), transformation: { width: 690, height: 518 }, type: 'png' })] }));
        children.push(paragraph(path.basename(file), { align: AlignmentType.CENTER, size: 15, color: '64748B' }));
      }
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
    sections.push({ properties: landscape, headers: header, footers: footer, children });
  }
  const qaRows = [['Kiểm tra', 'Kết quả', 'Chi tiết'], ['Milestones', manifest.qa.status, `${manifest.milestones.filter(x => x.status === 'PASS').length}/${manifest.qa.expectedMilestones}`], ...(manifest.qa.smoke || []).map(item => [item.id, item.status, item.detail || ''])];
  sections.push({ properties: portrait, headers: header, footers: footer, children: [heading('Kết luận'), table(qaRows, [2800, 1800, 4500]), heading('Vấn đề cần xác nhận'), paragraph('OI-07: Không tự bù trừ công nợ vào tiền cọc. Kết quả được ghi “PASS theo mockup hiện tại” và NEEDS BUSINESS CONFIRMATION.')] });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, await Packer.toBuffer(new Document({ sections })));
}
