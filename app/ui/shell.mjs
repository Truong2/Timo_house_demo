// Khung dùng chung cho mọi màn mockup: sidebar, topbar, CSS token, icon và helper định dạng số.
// Mỗi file trong screens/ export default { file, title?, html } với html = page({...}).

// ---------- Định dạng số kiểu Việt Nam ----------
/** 1234567.891 → "1.234.567,89" (dec = số chữ số thập phân TỐI ĐA, mặc định 0; số nguyên không hiện ",00").
 *  fixed = true để luôn hiện đủ dec chữ số (ví dụ bảng cổ phần 1.466.496,92). */
export function vnd(n, dec = 0, fixed = false) {
  if (n === null || n === undefined || n === '') return '—';
  return Number(n).toLocaleString('vi-VN', { minimumFractionDigits: fixed ? dec : 0, maximumFractionDigits: dec });
}
/** Phần trăm: 93.2178 → "93,22 %" */
export function pct(n, dec = 2) {
  return `${vnd(n, dec, true)} %`;
}
/** Che SĐT/CCCD: giữ 3 số cuối. */
export function mask(s) {
  const str = String(s);
  return '•'.repeat(Math.max(0, str.length - 3)) + str.slice(-3);
}
/** Escape HTML */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ---------- Icon (nét outline kiểu Lucide, 24x24) ----------
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="1.5"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  receipt: '<path d="M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15v14H5a2 2 0 0 1-2-2V5"/><path d="M16 14h.01"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
  chart: '<path d="M3 3v18h18"/><path d="M8 17V11M13 17V7M18 17v-4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
  x: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12"/><circle cx="12" cy="12" r="3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  gauge: '<path d="M12 14 16 10"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
  coins: '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18"/><path d="M7 6h1v4"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  printer: '<path d="M6 9V2h12v7"/><rect x="2" y="9" width="20" height="9" rx="2"/><path d="M6 14h12v8H6z"/>',
  droplet: '<path d="M12 2.7s-7 7.3-7 12.3a7 7 0 0 0 14 0c0-5-7-12.3-7-12.3"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  package: '<path d="m7.5 4.3 9 5.2M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
};
/** icon('check', 16) → inline SVG */
export function icon(name, size = 16, cls = '') {
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.info}</svg>`;
}

// ---------- Điều hướng chính — theo §6.2 của spec ----------
export const NAV = [
  { group: 'Tổng quan', icon: 'home', items: [['UI-01', 'Dashboard & Work Queue']] },
  { group: 'Nguồn nhà & tòa/phòng', icon: 'building', items: [['UI-02', 'Chủ nhà'], ['UI-03', 'Hợp đồng đầu vào'], ['UI-04', 'Tòa nhà & hồ sơ'], ['UI-05', 'Phòng'], ['UI-27', 'Tài sản & khấu hao']] },
  { group: 'Khách thuê & hợp đồng', icon: 'users', items: [['UI-06', 'Khách thuê'], ['UI-08', 'OCR hợp đồng khách'], ['UI-07', 'Hợp đồng thuê'], ['UI-15', 'Sắp hết hạn / Gia hạn'], ['UI-16', 'Cọc & hoàn cọc']] },
  { group: 'Dịch vụ & chỉ số', icon: 'zap', items: [['UI-09', 'Bảng giá dịch vụ'], ['UI-10', 'Điện nước & chỉ số']] },
  { group: 'Hóa đơn & thu tiền', icon: 'receipt', items: [['UI-11', 'Kỳ hóa đơn'], ['UI-12', 'Hóa đơn phòng'], ['UI-13', 'Thu tiền'], ['UI-14', 'Công nợ & phạt'], ['UI-17', 'Zalo nhắc thanh toán']] },
  { group: 'Chi phí & đầu tư', icon: 'wallet', items: [['UI-24', 'Chi phí & Import'], ['UI-25', 'Phân bổ chi phí/lương'], ['UI-26', 'Hoa hồng'], ['UI-28', 'Tiền thuê nhà / Trả trước'], ['UI-29', 'Cổ đông & vốn góp']] },
  { group: 'Nhân sự & lương', icon: 'briefcase', items: [['UI-18', 'Cơ cấu tổ chức'], ['UI-19', 'Nhân sự'], ['UI-20', 'Phân công tòa'], ['UI-21', 'Hiệu suất thu tiền'], ['UI-22', 'Bảng lương'], ['UI-23', 'Chi lương']] },
  { group: 'Báo cáo & đối soát', icon: 'chart', items: [['UI-30', 'Kỳ báo cáo & khóa kỳ'], ['UI-31', 'Report A/B · CF/AC'], ['UI-32', 'Đối soát Golden']] },
  { group: 'Quản trị hệ thống', icon: 'settings', items: [['UI-33', 'Cài đặt, quyền & audit']] },
];

/**
 * Sidebar. Không truyền `o` → HTML tĩnh như ảnh mockup.
 * SPA truyền o = { hrefOf(uiId) → '#/…', isOpen(groupIdx, defaultOpen) → bool, footer } để có link và nhóm đóng/mở.
 */
export function sidebar(active, o) {
  const groups = NAV.map((g, gi) => {
    const has = g.items.some(([id]) => id === active);
    const open = o ? o.isOpen(gi, has) : has;
    const li = ([id, label]) => (o
      ? `<li class="${id === active ? 'on' : ''}" data-nav="${o.hrefOf(id)}" role="link" tabindex="0">${label}</li>`
      : `<li class="${id === active ? 'on' : ''}">${label}</li>`);
    const items = open ? `<ul>${g.items.map(li).join('')}</ul>` : '';
    const gh = o ? `<div class="gh" data-action="nav-toggle" data-group="${gi}" role="button" tabindex="0" aria-expanded="${open}">` : '<div class="gh">';
    return `<div class="grp ${open ? 'open' : ''}">${gh}${icon(g.icon, 16)}<span>${g.group}</span>${icon(open ? 'chevronDown' : 'chevronRight', 14, 'chev')}</div>${items}</div>`;
  }).join('');
  const brand = o
    ? `<div class="brand" data-action="brand" role="link" tabindex="0"><div class="logo">${icon('home', 18)}</div><div><b>TimoHouse</b><small>HT CCMN TIMEHOUSE</small></div></div>`
    : `<div class="brand"><div class="logo">${icon('home', 18)}</div><div><b>TimoHouse</b><small>HT CCMN TIMEHOUSE</small></div></div>`;
  return `<aside class="sb">
    ${brand}
    <nav>${groups}</nav>
    <div class="sbf">${o?.footer ?? 'Mockup v1.6 · dữ liệu Seed v1.0<br/>Trục: G1 kỳ 09/2026 · đối soát 08/2026'}</div>
  </aside>`;
}

/**
 * Topbar. o.interactive = true → ô tìm kiếm là <input>, các control có data-action (SPA).
 */
export function topbar({ breadcrumb = [], period = 'Kỳ 09/2026', user = 'Admin demo', role = 'Quản trị viên', bell = 12, interactive = false, crumbHrefs = [] }) {
  const bc = ['Trang chủ', ...breadcrumb].map((b, i, a) => {
    if (i === a.length - 1) return `<b>${b}</b>`;
    const href = interactive ? crumbHrefs[i] : '';
    return href ? `<span class="bcl" data-nav="${href}" role="link" tabindex="0">${b}</span>` : `<span>${b}</span>`;
  }).join(`<i>/</i>`);
  const initials = user.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase();
  if (interactive) {
    return `<header class="tb">
    <div class="bc">${bc}</div>
    <div class="tbr">
      <div class="sel" data-action="period-menu" role="button" tabindex="0">${icon('calendar', 14)} ${period} ${icon('chevronDown', 14)}</div>
      <div class="srch">${icon('search', 14)} <input id="gsearch" type="search" placeholder="Tìm tòa, phòng, khách, HĐ…" autocomplete="off" aria-label="Tìm kiếm toàn cục"/><kbd>Ctrl K</kbd></div>
      <div class="bell" data-action="bell" role="button" tabindex="0" data-tip="Work Queue thuộc FR01 — ngoài đợt này">${icon('bell', 18)}<em>${bell}</em></div>
      <div class="usr" data-action="user-menu" role="button" tabindex="0"><div class="av">${initials}</div><div><b>${user}</b><small>${role}</small></div>${icon('chevronDown', 14)}</div>
    </div>
  </header>`;
  }
  return `<header class="tb">
    <div class="bc">${bc}</div>
    <div class="tbr">
      <div class="sel">${icon('calendar', 14)} ${period} ${icon('chevronDown', 14)}</div>
      <div class="srch">${icon('search', 14)} <span>Tìm tòa, phòng, khách, HĐ…</span><kbd>Ctrl K</kbd></div>
      <div class="bell">${icon('bell', 18)}<em>${bell}</em></div>
      <div class="usr"><div class="av">${initials}</div><div><b>${user}</b><small>${role}</small></div>${icon('chevronDown', 14)}</div>
    </div>
  </header>`;
}

/** Khối tiêu đề trang (.ph) + nội dung. */
export function pageHead(o) {
  return `<div class="ph">
      <div><h1>${o.title} ${o.status || ''}</h1>${o.subtitle ? `<p class="sub">${o.subtitle}</p>` : ''}</div>
      <div class="acts">${o.actions || ''}</div>
    </div>`;
}
/** <main> gồm section.content (+ aside.rail nếu có). */
export function pageMain(o) {
  return `<main class="${o.rail ? 'withrail' : ''}"><section class="content">${pageHead(o)}${o.body}</section>${o.rail ? `<aside class="rail">${o.rail}</aside>` : ''}</main>`;
}

/**
 * Dựng trang hoàn chỉnh.
 * @param {object} o
 * @param {string} o.active  UI ID đang mở, ví dụ 'UI-12'
 * @param {string[]} o.breadcrumb
 * @param {string} o.title   tiêu đề trang
 * @param {string} [o.status] HTML chip trạng thái cạnh tiêu đề
 * @param {string} [o.subtitle]
 * @param {string} [o.actions] HTML nút bên phải header (1 nút primary)
 * @param {string} o.body    nội dung chính
 * @param {string} [o.rail]  panel phải 360px (drawer/right rail)
 * @param {string} [o.period]
 * @param {string} [o.user] [o.role]
 */
export function page(o) {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"/>
<title>${esc(o.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>${CSS}</style></head>
<body><div class="app">${sidebar(o.active)}<div class="col">${topbar(o)}${pageMain(o)}</div></div></body></html>`;
}

// ---------- Component helper ----------
/** Chip trạng thái: kind = ok | warn | danger | info | neutral | assumed | primary */
export function chip(text, kind = 'neutral', ic) {
  const map = { ok: 'check', warn: 'alert', danger: 'x', info: 'info', neutral: 'clock', assumed: 'alert', primary: 'info', lock: 'lock' };
  return `<span class="chip ${kind}">${icon(ic || map[kind] || 'info', 12)}${text}</span>`;
}
/** Chip chờ chốt tham số: pchip('P-03') */
export function pchip(code, text = 'Cần xác nhận nghiệp vụ') {
  return `<span class="chip assumed">${icon('alert', 12)}${text} · ${code}</span>`;
}
/** attrs: chuỗi thuộc tính HTML thêm vào <button> (SPA dùng cho data-action, aria-disabled, data-tip). */
export function btn(text, kind = 'outline', ic, attrs = '') {
  return `<button class="btn ${kind}"${attrs ? ` ${attrs}` : ''}>${ic ? icon(ic, 15) : ''}${text}</button>`;
}
/** Alert: kind = warn | danger | info | ok */
export function alert(title, text, kind = 'warn', extra = '') {
  const ic = { warn: 'alert', danger: 'x', info: 'info', ok: 'check' }[kind];
  return `<div class="alert ${kind}">${icon(ic, 18)}<div><b>${title}</b>${text ? `<p>${text}</p>` : ''}</div>${extra ? `<div class="alx">${extra}</div>` : ''}</div>`;
}
/** KPI card */
export function kpi(label, value, sub = '', kind = '', ic = '') {
  return `<div class="kpi ${kind}">${ic ? `<div class="ki">${icon(ic, 18)}</div>` : ''}<div><span>${label}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ''}</div></div>`;
}
/** Card có tiêu đề */
export function card(title, body, tools = '', cls = '') {
  return `<div class="card ${cls}">${title ? `<div class="ch"><h3>${title}</h3><div class="tools">${tools}</div></div>` : ''}<div class="cb">${body}</div></div>`;
}
/**
 * Bảng. cols: [{h, k?, num?, w?, cls?}] ; rows: mảng mảng HTML hoặc object.
 * Dòng có thuộc tính _cls sẽ gán class cho <tr> (ví dụ 'sum', 'hl', 'warnrow').
 */
export function table(cols, rows, opts = {}) {
  const th = cols.map((c) => `<th class="${c.num ? 'n' : ''} ${c.cls || ''}" ${c.w ? `style="width:${c.w}"` : ''}>${c.h}</th>`).join('');
  const tr = rows.map((r) => {
    const cells = Array.isArray(r) ? r : cols.map((c) => r[c.k]);
    const cls = (!Array.isArray(r) && r._cls) || (Array.isArray(r) && r._cls) || '';
    return `<tr class="${cls}"${r._attrs ? ` ${r._attrs}` : ''}>${cells.map((v, i) => `<td class="${cols[i]?.num ? 'n' : ''} ${cols[i]?.cls || ''}">${v ?? ''}</td>`).join('')}</tr>`;
  }).join('');
  return `<div class="tw"><table class="tbl ${opts.compact ? 'compact' : ''}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>${opts.foot ? `<div class="tfoot">${opts.foot}</div>` : ''}`;
}
/** Hàng tổng cho table (mảng) */
export function sumRow(cells) { const r = [...cells]; r._cls = 'sum'; return r; }
export function rowCls(cells, cls) { const r = [...cells]; r._cls = cls; return r; }
/** Tabs */
export function tabs(list, activeIdx = 0, attrs = []) {
  return `<div class="tabs">${list.map((t, i) => `<span class="${i === activeIdx ? 'on' : ''}"${attrs[i] ? ` ${attrs[i]}` : ''}>${t}</span>`).join('')}</div>`;
}
/** Stepper: steps = [label], current = index đang ở (0-based); done < current */
export function stepper(steps, current = 0) {
  return `<ol class="stp">${steps.map((s, i) => `<li class="${i < current ? 'done' : i === current ? 'cur' : ''}"><em>${i < current ? icon('check', 14) : i + 1}</em><span>${s}</span></li>`).join('')}</ol>`;
}
/** Filter bar: list HTML hoặc [label, value] */
export function filters(list, right = '') {
  return `<div class="fbar">${list.map((f) => (Array.isArray(f) ? `<div class="fsel"><small>${f[0]}</small><span>${f[1]}</span>${icon('chevronDown', 14)}</div>` : f)).join('')}<div class="fr">${right}</div></div>`;
}
/** Dòng field/giá trị cho detail: [[label, value], ...] */
export function dl(pairs, cols = 2) {
  return `<dl class="dl c${cols}">${pairs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
}
/** Timeline dọc: [[state:'done'|'cur'|'todo'|'err', title, sub]] */
export function timeline(items) {
  return `<ul class="tl">${items.map(([st, t, s]) => `<li class="${st}"><em>${st === 'done' ? icon('check', 12) : st === 'err' ? icon('x', 12) : ''}</em><div><b>${t}</b>${s ? `<small>${s}</small>` : ''}</div></li>`).join('')}</ul>`;
}
export function note(text) {
  return `<div class="note">${icon('info', 14)}<span>${text}</span></div>`;
}
/** Grid bố cục: grid('2fr 1fr', [a, b]) */
export function grid(tpl, parts, gap = 16) {
  return `<div class="grid" style="grid-template-columns:${tpl};gap:${gap}px">${parts.join('')}</div>`;
}

export const CSS = `
:root{--pri:#1E40AF;--sec:#3B82F6;--acc:#D97706;--bg:#F8FAFC;--sf:#FFFFFF;--tx:#0F172A;--tx2:#475569;--ok:#15803D;--warn:#B45309;--dan:#DC2626;--bd:#CBD5E1;--bd2:#E2E8F0;--nav:#122F5B;--pri50:#EFF6FF;}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Fira Sans','Segoe UI',system-ui,sans-serif;font-size:13px;line-height:1.45;color:var(--tx);background:var(--bg);width:1440px}
.ic{flex:none;vertical-align:middle}
.app{display:flex;min-height:900px}
.sb{width:240px;flex:none;background:var(--nav);color:#CBD5E1;display:flex;flex-direction:column}
.brand{display:flex;gap:10px;align-items:center;padding:16px 16px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
.brand .logo{width:34px;height:34px;border-radius:8px;background:var(--pri);color:#fff;display:grid;place-items:center}
.brand b{color:#fff;font-size:16px;display:block}.brand small{font-size:10.5px;color:#94A3B8;letter-spacing:.02em}
.sb nav{flex:1;padding:8px 8px}
.grp .gh{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:6px;font-weight:500;font-size:12.5px;color:#E2E8F0}
.grp .gh span{flex:1}.grp .gh .chev{opacity:.6}
.grp.open .gh{color:#fff}
.grp ul{list-style:none;margin:2px 0 6px 18px;border-left:1px solid rgba(255,255,255,.12)}
.grp li{padding:6px 10px 6px 16px;font-size:12.5px;color:#CBD5E1;border-radius:0 6px 6px 0}
.grp li.on{background:var(--pri);color:#fff;font-weight:600}
.sbf{padding:12px 16px;font-size:10.5px;color:#94A3B8;border-top:1px solid rgba(255,255,255,.08)}
.col{flex:1;min-width:0;display:flex;flex-direction:column}
.tb{height:56px;background:#fff;border-bottom:1px solid var(--bd2);display:flex;align-items:center;justify-content:space-between;padding:0 20px;gap:16px}
.bc{display:flex;gap:6px;align-items:center;color:var(--tx2);font-size:12.5px;white-space:nowrap}.bc i{font-style:normal;color:#94A3B8}.bc b{color:var(--tx)}
.tbr{display:flex;align-items:center;gap:12px}
.sel{display:flex;gap:6px;align-items:center;border:1px solid var(--bd);border-radius:6px;padding:6px 10px;font-weight:500;background:#fff}
.srch{display:flex;gap:8px;align-items:center;border:1px solid var(--bd);border-radius:6px;padding:6px 10px;width:300px;color:#64748B}.srch span{flex:1;font-size:12px;white-space:nowrap;overflow:hidden}
kbd{font-family:inherit;font-size:10.5px;border:1px solid var(--bd);border-radius:4px;padding:0 5px;color:var(--tx2)}
.bell{position:relative;color:var(--tx2)}.bell em{position:absolute;top:-6px;right:-9px;background:var(--dan);color:#fff;font-style:normal;font-size:10px;border-radius:9px;padding:0 5px;font-weight:600}
.usr{display:flex;gap:8px;align-items:center}.av{width:30px;height:30px;border-radius:50%;background:var(--pri50);color:var(--pri);display:grid;place-items:center;font-weight:600;font-size:12px}.usr b{display:block;font-size:12.5px}.usr small{color:var(--tx2);font-size:11px}
main{flex:1;display:flex;align-items:flex-start}
.content{flex:1;min-width:0;padding:18px 20px 24px}
.rail{width:360px;flex:none;background:#fff;border-left:1px solid var(--bd2);align-self:stretch;padding:16px}
.ph{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:14px}
.ph h1{font-size:21px;font-weight:600;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.sub{color:var(--tx2);margin-top:3px;font-size:12.5px}
.acts{display:flex;gap:8px;flex:none}
.btn{display:inline-flex;align-items:center;gap:6px;font:inherit;font-weight:500;font-size:12.5px;border-radius:6px;padding:7px 12px;border:1px solid var(--bd);background:#fff;color:var(--tx);white-space:nowrap}
.btn.primary{background:var(--pri);border-color:var(--pri);color:#fff}
.btn.danger{background:#fff;border-color:#FCA5A5;color:var(--dan)}
.btn.ghost{border-color:transparent;color:var(--pri);padding:4px 6px}
.btn.sm{padding:3px 8px;font-size:11.5px}
.btn.dis{opacity:.5}
.chip{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:500;border-radius:999px;padding:2px 8px;white-space:nowrap;border:1px solid transparent;vertical-align:middle}
.chip.ok{background:#F0FDF4;color:var(--ok);border-color:#BBF7D0}
.chip.warn{background:#FFFBEB;color:var(--warn);border-color:#FDE68A}
.chip.danger{background:#FEF2F2;color:var(--dan);border-color:#FECACA}
.chip.info,.chip.primary{background:var(--pri50);color:var(--pri);border-color:#BFDBFE}
.chip.neutral{background:#F1F5F9;color:var(--tx2);border-color:var(--bd2)}
.chip.assumed{background:#FFF7ED;color:#9A3412;border-color:#FED7AA}
.chip.lock{background:#F1F5F9;color:#334155;border-color:var(--bd)}
.alert{display:flex;gap:10px;align-items:flex-start;border-radius:8px;padding:10px 14px;margin-bottom:12px;border:1px solid}
.alert p{color:var(--tx2);margin-top:2px;font-size:12.5px}.alert b{font-size:13px}.alert>div:nth-child(2){flex:1}
.alert.warn{background:#FFFBEB;border-color:#FDE68A;color:var(--warn)}.alert.warn b{color:#92400E}
.alert.danger{background:#FEF2F2;border-color:#FECACA;color:var(--dan)}.alert.danger b{color:#991B1B}
.alert.info{background:var(--pri50);border-color:#BFDBFE;color:var(--pri)}.alert.info b{color:#1E3A8A}
.alert.ok{background:#F0FDF4;border-color:#BBF7D0;color:var(--ok)}.alert.ok b{color:#14532D}
.alx{flex:none;display:flex;gap:6px}
.kpis{display:grid;gap:12px;margin-bottom:14px}
.kpi{background:#fff;border:1px solid var(--bd2);border-radius:8px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start}
.kpi .ki{width:34px;height:34px;border-radius:8px;background:var(--pri50);color:var(--pri);display:grid;place-items:center;flex:none}
.kpi span{color:var(--tx2);font-size:12px;display:block}.kpi b{font-size:19px;font-weight:600;display:block;font-variant-numeric:tabular-nums;margin-top:2px;white-space:nowrap}.kpi small{color:var(--tx2);font-size:11.5px;display:block;margin-top:2px}
.kpi.ok .ki{background:#F0FDF4;color:var(--ok)}.kpi.warn .ki{background:#FFFBEB;color:var(--warn)}.kpi.danger .ki{background:#FEF2F2;color:var(--dan)}.kpi.danger b{color:var(--dan)}.kpi.warn b{color:var(--warn)}
.card{background:#fff;border:1px solid var(--bd2);border-radius:8px;margin-bottom:14px;overflow:hidden}
.ch{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-bottom:1px solid var(--bd2);gap:10px}
.ch h3{font-size:14px;font-weight:600;display:flex;gap:8px;align-items:center}
.tools{display:flex;gap:8px;align-items:center}
.cb{padding:12px 14px}
.card.flush .cb{padding:0}
.tw{overflow:hidden}
.tbl{width:100%;border-collapse:collapse;font-size:12.5px}
.tbl th{background:#F8FAFC;color:var(--tx2);font-weight:600;text-align:left;padding:7px 10px;border-bottom:1px solid var(--bd2);font-size:11.5px;white-space:nowrap}
.tbl td{padding:7px 10px;border-bottom:1px solid #EEF2F7;vertical-align:middle}
.tbl.compact td{padding:5px 10px}.tbl.compact th{padding:6px 10px}
.tbl .n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.tbl tr.sum td{background:#F1F5F9;font-weight:600;border-top:1px solid var(--bd)}
.tbl tr.hl td{background:#EFF6FF}
.tbl tr.warnrow td{background:#FFFBEB}
.tbl tr.dangerrow td{background:#FEF2F2}
.tbl tr.muted td{color:#64748B;font-style:italic}
.tfoot{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;color:var(--tx2);font-size:12px;border-top:1px solid var(--bd2)}
.tabs{display:flex;gap:4px;border-bottom:1px solid var(--bd2);margin-bottom:14px}
.tabs span{padding:8px 12px;color:var(--tx2);font-weight:500;border-bottom:2px solid transparent;margin-bottom:-1px}
.tabs span.on{color:var(--pri);border-color:var(--pri);font-weight:600}
.stp{display:flex;list-style:none;gap:0;background:#fff;border:1px solid var(--bd2);border-radius:8px;padding:12px 14px;margin-bottom:14px}
.stp li{flex:1;display:flex;align-items:center;gap:8px;color:var(--tx2);position:relative;font-weight:500}
.stp li:not(:last-child)::after{content:'';flex:1;height:2px;background:var(--bd2);margin:0 10px}
.stp li.done:not(:last-child)::after{background:var(--pri)}
.stp em{font-style:normal;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;border:2px solid var(--bd);font-size:12px;flex:none;background:#fff}
.stp li.done em{background:var(--pri);border-color:var(--pri);color:#fff}
.stp li.cur em{border-color:var(--pri);color:var(--pri)}.stp li.cur{color:var(--pri);font-weight:600}
.stp span{white-space:nowrap}
.fbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:#fff;border:1px solid var(--bd2);border-radius:8px;padding:8px 10px;margin-bottom:14px}
.fsel{display:flex;gap:6px;align-items:center;border:1px solid var(--bd);border-radius:6px;padding:4px 8px;font-size:12.5px}
.fsel small{color:var(--tx2)}.fsel span{font-weight:500}
.fr{margin-left:auto;display:flex;gap:8px}
.dl{display:grid;gap:8px 20px}.dl.c1{grid-template-columns:1fr}.dl.c2{grid-template-columns:1fr 1fr}.dl.c3{grid-template-columns:1fr 1fr 1fr}.dl.c4{grid-template-columns:repeat(4,1fr)}
.dl div{display:flex;justify-content:space-between;gap:10px;border-bottom:1px dashed #E2E8F0;padding-bottom:5px}
.dl dt{color:var(--tx2)}.dl dd{font-weight:500;text-align:right;font-variant-numeric:tabular-nums}
.tl{list-style:none}
.tl li{display:flex;gap:10px;padding-bottom:12px;position:relative}
.tl li:not(:last-child)::before{content:'';position:absolute;left:9px;top:20px;bottom:0;width:2px;background:var(--bd2)}
.tl em{width:20px;height:20px;border-radius:50%;border:2px solid var(--bd);display:grid;place-items:center;flex:none;background:#fff;font-style:normal}
.tl li.done em{background:var(--ok);border-color:var(--ok);color:#fff}
.tl li.cur em{border-color:var(--pri);box-shadow:inset 0 0 0 4px #fff;background:var(--pri)}
.tl li.err em{background:var(--dan);border-color:var(--dan);color:#fff}
.tl b{display:block;font-size:12.5px}.tl small{color:var(--tx2);font-size:11.5px}
.note{display:flex;gap:6px;align-items:flex-start;color:var(--tx2);font-size:12px;margin-top:8px}.note .ic{margin-top:2px;color:var(--pri)}
.grid{display:grid;align-items:start}
.grid>.card{margin-bottom:0}
.mb{margin-bottom:14px}
.muted{color:var(--tx2)}.pos{color:var(--ok)}.neg{color:var(--dan)}.wtx{color:var(--warn)}.b{font-weight:600}
.mono{font-family:Consolas,'Cascadia Mono',monospace;font-size:12px}
.field{display:flex;flex-direction:column;gap:4px;margin-bottom:10px}.field label{font-size:12px;color:var(--tx2);font-weight:500}.field .in{border:1px solid var(--bd);border-radius:6px;padding:7px 10px;background:#fff;min-height:34px;display:flex;align-items:center;justify-content:space-between;gap:6px}.field .in.ro{background:#F1F5F9;color:#334155}.field .in.err{border-color:var(--dan)}.field .hint{font-size:11.5px;color:var(--tx2)}.field .errt{font-size:11.5px;color:var(--dan)}
.rail h3{font-size:15px;font-weight:600;margin-bottom:4px}.rail h4{font-size:13px;font-weight:600;margin:14px 0 8px}
.bar{height:8px;border-radius:4px;background:#E2E8F0;overflow:hidden}.bar>i{display:block;height:100%;background:var(--sec)}
.tag{display:inline-block;font-size:11px;border:1px solid var(--bd);border-radius:4px;padding:0 5px;color:var(--tx2);background:#fff}
`;
