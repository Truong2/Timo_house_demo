/* Quét mọi route × mọi tài khoản demo: không lỗi JS, không "Lỗi hiển thị trang" / undefined / NaN trên trang.
   node scripts/sweep.mjs  – tự bật server tĩnh ở cổng ngẫu nhiên; exit 1 nếu có lỗi. */
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8970 + Math.floor(Math.random() * 9);
const server = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const out = []; let failed = 0;
/* Phase 3: tài sản / bảo dưỡng / kiểm kê / góp vốn / dự kiến LN / hiệu quả – thêm dần theo đợt P3-1…P3-7 */
const P3 = ['/assets', '/assets?ownership=company&period=2026-08', '/assets/maintenance?soon=1', '/assets/maintenance?status=done&type=pump', '/assets/maintenance', '/assets/inventory', '/assets/inventory?period=2026-08&building=b_G1',
  ...['lich-dong', 'chi-thuc', 'tai-san-coc', 'dau-tu-ban-dau', 'lich-su'].map(tab => '/shares/capital?building=b_G1&tab=' + tab), '/shares/capital?building=b_T2&sh=sh_CHUNG',
  ...['dau-vao', 'chi-phi', 'ket-qua', 'so-sanh', 'phien-ban'].map(tab => '/reports/forecast?period=2026-09&tab=' + tab), '/reports/forecast?period=2026-08&tab=so-sanh&mode=web', '/reports/forecast?period=2026-01',
  '/reports/efficiency', '/reports/efficiency?basis=total&source=excel', '/reports/efficiency?group=G&source=web', '/reports/efficiency?period=2026-09&source=excel', '/buildings/b_G1?tab=tai-san', '/dashboard?period=2026-09'];
for (const u of ['admin', 'ketoan', 'vanhanh', 'leader', 'truongphong', 'truongkd', 'sale', 'kythuat', 'codong']) {
  const ctx = await b.newContext(); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://localhost:${PORT}/#/login`); await p.waitForTimeout(600);
  await p.evaluate(u => { TH.auth.login(u); TH.layout.reset(); TH.router.render(); }, u);
  const ids = await p.evaluate(() => { const S = TH.store; const sc = TH.auth.buildingScope(); const inS = x => !sc || sc.has(x.buildingId);
    const st = S.all('stays').find(s => s.status === 'active' && inS(s)); const inv = S.all('invoices').find(inS); const rf = S.all('refunds').find(inS); const b = S.all('buildings').find(x => !sc || sc.has(x.id));
    const deal = S.all('deals').find(d => TH.auth.inSales(d.saleIds));
    const cf = S.all('contractFiles').find(f => !sc || sc.has((S.get('stays', f.stayId) || {}).buildingId)); const ocr = cf && TH.auth.can('ocr.review') ? TH.actions.runOcr(cf.id).id : null;
    return { st: st && st.id, inv: inv && inv.id, rf: rf && rf.id, b: b && b.id, pay: (S.all('payments')[0] || {}).id, emp: (S.all('employees')[0] || {}).id, oc: (S.all('ownerContracts')[0] || {}).id, deal: deal && deal.id, ocr, cfStay: cf && cf.stayId }; });
  const routes = ['/dashboard', '/buildings', `/buildings/${ids.b}`, ...['phong', 'chu-nha-hd', 'lich-tra', 'nhan-su', 'dich-vu-dau-vao', 'tai-chinh'].map(t => `/buildings/${ids.b}?tab=${t}`), `/owners/${ids.oc}`, '/owner-payments', '/tenants', '/tenants?view=broken', '/contracts', '/contracts?view=pending_signature', '/contracts?view=expiring', '/tenants/new',
    `/stays/${ids.st}`, ...['hop-dong', 'bieu-phi', 'tai-chinh', 'zalo'].map(t => `/stays/${ids.st}?tab=${t}`), '/billing/readings', '/billing/invoices', `/billing/invoices/${ids.inv}`, `/print/invoice/${ids.inv}`, '/billing/receipts', '/billing/receipts/new', `/billing/receipts/${ids.pay}`, '/billing/debts',
    '/expenses', '/expenses/allocation', '/refunds', ids.rf ? `/refunds/${ids.rf}` : '/refunds', ids.rf ? `/print/refund/${ids.rf}` : '/refunds', '/hr', `/hr/staff/${ids.emp}`, '/hr/assignments', '/hr/payroll', '/hr/payroll?period=2026-09&tab=nhap-tay', '/hr/payroll?period=2026-08&tab=nhap-tay', '/billing/readings?tab=dien-chung&building=b_G1', '/import?type=vendorBills', '/reports', '/reports/total?period=2026-08', '/reports/business?period=2026-08', '/reports/business?period=2026-09', '/reports/buildings?period=2026-08', '/zalo', '/import',
    ...['tai-khoan', 'vai-tro', 'danh-muc', 'tk-nhan', 'tham-so', 'ky', 'nhat-ky', 'doi-chieu', 'he-thong'].map(t => '/settings?tab=' + t),
    /* Phase 2 */
    '/sales', '/sales?period=2026-10', '/sales/leads', '/sales/deals', ids.deal ? `/sales/deals/${ids.deal}` : '/sales/deals', ...['hoa-hong', 'doi-chieu', 'nhan-su', 'chinh-sach'].map(t => '/sales/commission?tab=' + t),
    '/repairs', '/repairs?mode=excel&worker=emp_NV01060895', '/repairs?tab=ung-chi&mode=excel', '/repairs?tab=son', '/repairs?period=2026-10',
    '/reports?period=2026-09', ...['gv', 'fixed', 'var'].map(t => '/reports/costs?period=2026-08&tab=' + t), '/reports/costs?period=2026-09', '/reports/amduong', '/reports/amduong?tab=nuoc', '/reports/amduong?mode=web', '/reports/amduong?tab=nuoc&mode=web', '/reports/amduong?tab=san-luong',
    '/reports/repairs', '/reports/repairs?by=reason&mode=web', ...['hs', 'occ', 'pay', 'seg'].map(v => '/reports/rooms?view=' + v), '/reports/rooms?period=2026-08', '/reports/sales', '/reports/sales?tab=doanh-so', '/reports/sales?by=team',
    '/shares', '/shares?building=b_T2', '/shares?building=b_G1&sh=sh_CHUNG', '/sales/commission?tab=hoa-hong&src=import', '/reports/rooms?view=nv', '/reports/rooms?view=occ&period=2026-08', '/reports/repairs?by=worker', '/reports/repairs?by=bearer', '/reports/sales?group=G', '/reports/amduong?mode=web&period=2026-09', '/dashboard?resp=sale', '/hr/payroll?period=2026-09&tab=van-hanh&emp=x', '/repairs?tab=tai-lieu', '/repairs?tab=son&period=2026-09', '/repairs?tab=ung-chi&period=2026-09', '/shares/b_G1', '/shares/b_G1?source=excel', '/shares/b_G1?period=2026-09', '/documents', '/documents?type=owner_contract&all=1', ids.ocr ? '/ocr/' + ids.ocr : '/documents', ids.cfStay ? `/stays/${ids.cfStay}?tab=hop-dong` : '/documents',
    '/zalo?tab=hop-thu', '/zalo?tab=quy-tac', `/stays/${ids.st}?tab=zalo`, '/settings?tab=ky', '/dashboard?period=2026-08',
    /* Phase 3 */
    P3];
  const bad = [];
  for (const r of routes.flat()) { await p.evaluate(h => { location.hash = h; }, '#' + r); await p.waitForTimeout(250); const t = await p.evaluate(() => (document.getElementById('content') || document.body).innerText); if (/Lỗi hiển thị trang|undefined|NaN|\[object Object\]/.test(t)) bad.push(r + ' → ' + (t.match(/.{0,60}(Lỗi hiển thị trang|undefined|NaN|\[object Object\]).{0,60}/) || [''])[0].replace(/\n/g, ' ')); }
  failed += bad.length + errs.length;
  out.push(`${u}: ${routes.flat().length} route, ${bad.length} trang có lỗi hiển thị, ${errs.length} lỗi JS${bad.length ? '\n  ' + bad.join('\n  ') : ''}${errs.length ? '\n  ' + errs.slice(0, 5).join('\n  ') : ''}`);
  await ctx.close(); console.log(out[out.length - 1]);
}
console.log('Tổng lỗi: ' + failed); await b.close(); server.kill();
if (failed) process.exit(1);
