// Shell tương tác (Common Rule 1): sidebar đóng/mở nhóm + link, topbar có breadcrumb click được,
// Kỳ, tìm kiếm toàn cục (Ctrl K), chuông, menu người dùng (đổi vai trò demo, reset, công tắc chip cần xác nhận).
import { sidebar, topbar, NAV, icon, esc } from './shell.mjs';
import { ROLES, USERS, can } from '../core/auth.mjs';
import * as store from '../core/store.mjs';
import { openMenu, closeMenu } from './menu.mjs';
import { confirmModal } from './modal.mjs';
import { notSpecified } from './controls.mjs';
import { toast } from './toast.mjs';
import { fold, digits, normalizePhone } from '../core/format.mjs';
import { signOut } from '../core/domain/session.mjs';

/** Route chính của từng UI ID (spec §8); ngoài cụm → trang "Chưa có trong đợt này". */
export const HREF = {
  'UI-00': '#/login', 'UI-01': '#/dashboard', 'UI-02': '#/landlords', 'UI-03': '#/head-leases', 'UI-04': '#/buildings', 'UI-05': '#/rooms',
  'UI-06': '#/tenants', 'UI-07': '#/contracts', 'UI-08': '#/contracts/ocr', 'UI-09': '#/settings/catalog?tab=services',
  'UI-10': '#/meters', 'UI-11': '#/finance/periods', 'UI-12': '#/invoices', 'UI-13': '#/receivables?tab=payments', 'UI-14': '#/receivables',
  'UI-15': '#/contracts/expiring', 'UI-16': '#/finance/deposits', 'UI-17': '#/zalo/config', 'UI-18': '#/hr/org', 'UI-19': '#/hr',
  'UI-20': '#/hr/assignments', 'UI-21': '#/hr/collection-performance', 'UI-22': '#/hr/payroll', 'UI-23': '#/hr/salary-payments',
  'UI-24': '#/expenses', 'UI-25': '#/expenses?tab=allocation', 'UI-26': '#/commissions', 'UI-27': '#/assets', 'UI-28': '#/head-lease-costs',
  'UI-29': '#/investment/shareholders', 'UI-30': '#/reports/periods', 'UI-31': '#/reports/building-profit', 'UI-32': '#/reports/reconcile', 'UI-33': '#/settings',
};
export const hrefOf = (id) => HREF[id] || `#/soon/${id}`;

let lastTopKey = '';
let navOverride = {}; // nhóm người dùng tự đóng/mở trong phiên
let getCtx = () => null;

export function mount(app, ctxGetter) {
  getCtx = ctxGetter;
  app.innerHTML = `${sidebar('')}<div class="col"><header class="tb"></header><main></main></div>`;
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); document.getElementById('gsearch')?.focus(); }
  });
  document.addEventListener('input', (e) => { if (e.target.id === 'gsearch') showSearch(e.target); });
  document.addEventListener('keydown', (e) => { if (e.target.id === 'gsearch') searchKeys(e); });
  document.addEventListener('focusin', (e) => { if (e.target.id === 'gsearch' && e.target.value) showSearch(e.target); });
  document.addEventListener('mousedown', (e) => { if (!e.target.closest('.srch')) hideSearch(); });
}

export function update(ctx, { active, breadcrumb, crumbHrefs }) {
  const sb = document.querySelector('aside.sb');
  const html = sidebar(active, {
    hrefOf,
    isOpen: (gi, has) => (gi in navOverride ? navOverride[gi] : has),
    footer: 'Mockup tương tác · SRS v1.0 FR02–FR05<br/>Trục: G1 kỳ 09/2026 · 25A Phú Diễn',
  });
  const tmp = document.createElement('div'); tmp.innerHTML = html;
  const next = tmp.firstElementChild; next.scrollTop = sb.scrollTop;
  sb.replaceWith(next);

  const u = USERS[ctx.state.meta.role];
  const period = ctx.state.meta.period === '2026-08' ? `Kỳ 08/2026 ${icon('lock', 12)}` : 'Kỳ 09/2026';
  const key = `${ctx.state.meta.role}|${ctx.state.meta.period}`;
  const tb = document.querySelector('header.tb');
  if (key !== lastTopKey) {
    const t = document.createElement('div');
    t.innerHTML = topbar({ interactive: true, breadcrumb: [], period, user: u.name, role: u.title, bell: 12 });
    tb.replaceWith(t.firstElementChild);
    lastTopKey = key;
  }
  const hrefs = ['#/landlords', ...crumbHrefs];
  document.querySelector('header.tb .bc').innerHTML = ['Trang chủ', ...breadcrumb].map((b, i, a) => {
    if (i === a.length - 1) return `<b>${b}</b>`;
    return hrefs[i] ? `<span class="bcl" data-nav="${hrefs[i]}" data-restore="1" role="link" tabindex="0">${b}</span>` : `<span>${b}</span>`;
  }).join('<i>/</i>');
  document.body.classList.toggle('show-pending', !!ctx.state.meta.showPending && new URLSearchParams(location.search).get('pending') !== 'off');
}

/** Action toàn cục cho shell. */
export const globalActions = {
  'nav-toggle': (el, e, ctx) => {
    const gi = Number(el.dataset.group);
    const isOpen = el.getAttribute('aria-expanded') === 'true';
    navOverride = { ...navOverride, [gi]: !isOpen };
    ctx.rerender();
  },
  brand: () => notSpecified('Common Rule 1 · Logo', 'Dự kiến về Dashboard (FR01) — ngoài đợt này.'),
  bell: () => notSpecified('FR01 · Chuông việc', 'Work Queue thuộc FR01, ngoài phạm vi FR02–FR05.'),
  'period-menu': (el, e, ctx) => openMenu(el, [
    { header: 'Kỳ báo cáo' },
    { label: 'Kỳ 09/2026', act: '2026-09', cur: ctx.state.meta.period === '2026-09', ic: 'calendar' },
    { label: 'Kỳ 08/2026', act: '2026-08', cur: ctx.state.meta.period === '2026-08', ic: 'lock', sub: 'đã khóa · v1' },
  ], (it) => store.setMeta({ period: it.act }), { align: 'left' }),
  'user-menu': (el, e, ctx) => {
    const m = ctx.state.meta;
    openMenu(el, [
      { header: `Vai trò hiện tại · ${USERS[m.role].title}` },
      ...ROLES.map(([r, label]) => ({ label: `${label} — ${USERS[r].name}`, act: `role:${r}`, cur: r === m.role, ic: r === m.role ? 'check' : 'user' })),
      { sep: true },
      { label: m.showPending ? 'Ẩn chip “Cần xác nhận”' : 'Hiện chip “Cần xác nhận”', act: 'pending', ic: 'alert' },
      { label: 'Đặt lại dữ liệu demo', act: 'reset', ic: 'refresh', danger: true },
      { sep: true },
      { label: 'Đổi mật khẩu', act: 'pwd', ic: 'key' },
      { label: 'Đăng xuất', act: 'logout', ic: 'arrowRight' },
    ], async (it) => {
      if (it.act.startsWith('role:')) {
        const r = it.act.slice(5);
        store.setMeta({ role: r, session: { ...m.session, role: r, userId: USERS[r].id } });
        toast('info', `Đã chuyển vai trò demo: ${USERS[r].title}`, USERS[r].name);
      } else if (it.act === 'pending') store.setMeta({ showPending: !m.showPending });
      else if (it.act === 'reset') {
        const ok = await confirmModal({ title: 'Đặt lại dữ liệu demo?', text: 'Mọi thay đổi (chủ nhà, HĐ, tòa, phòng, audit) sẽ bị xóa và trở về dữ liệu Seed ban đầu.', danger: true, okLabel: 'Đặt lại', okIc: 'refresh' });
        if (ok) { store.reset(); toast('ok', 'Đã đặt lại dữ liệu demo'); ctx.go('#/landlords'); }
      } else if (it.act === 'pwd') notSpecified('Common Rule 1 · Đổi mật khẩu → Screen ##');
      else if (it.act === 'logout') {
        ctx.tx((d, env) => signOut(d, env));
        sessionStorage.removeItem('th.demo.session');
        ctx.go('#/login', { replace: true });
      }
    }, { width: 300 });
  },
};

// ---------- Tìm kiếm toàn cục ----------
let hits = []; let act = -1;
function results(state, kw) {
  const k = fold(kw); const d = digits(kw);
  if (!k) return [];
  const out = [];
  const view = (perm, extra) => can(state, perm, { today: '9999-12-31', ...extra }).ok;
  if (view('landlord.view')) {
    state.landlords.filter((l) => fold(l.name).includes(k) || fold(l.id).includes(k) || (d.length >= 6 && (normalizePhone(l.phone) === normalizePhone(kw) || digits(l.idNo) === d)))
      .slice(0, 5).forEach((l) => out.push(['Chủ nhà', l.id, l.name, `#/landlords/${l.id}`]));
  }
  if (view('headLease.view')) {
    state.headLeases.filter((h) => fold(h.id).includes(k)).slice(0, 5).forEach((h) => out.push(['HĐ đầu vào', h.id, h.status, `#/head-leases/${h.id}`]));
  }
  if (view('building.view')) {
    state.buildings.filter((b) => fold(b.code).includes(k) || fold(b.name).includes(k) || fold(b.address).includes(k))
      .slice(0, 5).forEach((b) => out.push(['Tòa nhà', b.code || b.codeSuggestion || '—', b.name, `#/buildings/${b.id}`]));
  }
  if (view('room.view')) {
    state.rooms.filter((r) => fold(r.id).includes(k)).slice(0, 6).forEach((r) => out.push(['Phòng', r.id, r.status, `#/rooms/${r.id}`]));
  }
  return out;
}
function showSearch(input) {
  const ctx = getCtx();
  hits = results(ctx.state, input.value.trim());
  act = -1;
  let pop = document.querySelector('.gs-pop');
  if (!input.value.trim()) { hideSearch(); return; }
  if (!pop) { pop = document.createElement('div'); pop.className = 'gs-pop'; input.closest('.srch').appendChild(pop); }
  const groups = [...new Set(hits.map((h) => h[0]))];
  pop.innerHTML = hits.length
    ? groups.map((g) => `<div class="mh">${g}</div>${hits.map((h, i) => (h[0] === g ? `<div class="gi" data-gi="${i}"><span><span class="mono">${esc(h[1])}</span> · ${esc(h[2] || '')}</span><small>${icon('arrowRight', 12)}</small></div>` : '')).join('')}`).join('')
    : '<div class="gi"><span class="muted">Không có kết quả trong phạm vi quyền</span></div>';
  pop.querySelectorAll('.gi[data-gi]').forEach((el) => el.addEventListener('mousedown', (e) => { e.preventDefault(); pick(Number(el.dataset.gi)); }));
}
function pick(i) {
  const h = hits[i]; if (!h) return;
  hideSearch();
  const inp = document.getElementById('gsearch'); if (inp) { inp.value = ''; inp.blur(); }
  getCtx().go(h[3]);
}
function hideSearch() { document.querySelector('.gs-pop')?.remove(); }
function searchKeys(e) {
  if (e.key === 'Escape') { hideSearch(); e.target.blur(); return; }
  if (!hits.length) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    act = (act + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
    document.querySelectorAll('.gs-pop .gi').forEach((el) => el.classList.toggle('act', Number(el.dataset.gi) === act));
  }
  if (e.key === 'Enter') { e.preventDefault(); pick(act < 0 ? 0 : act); }
}

export { closeMenu, NAV };
