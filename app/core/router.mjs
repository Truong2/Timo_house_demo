// Router hash '#/path/:id?query'. Mỗi màn: { render(ctx) → view, actions?, isDirty?(ctx), onMount?(ctx, main) }.
// view = { active, breadcrumb[], crumbHrefs[], title, status, subtitle, actions, body, rail }.
import * as store from './store.mjs';
import { can, currentUser } from './auth.mjs';
import { today, now } from './clock.mjs';
import { DomainError } from './audit.mjs';
import { periodBanner } from './period.mjs';
import { pageMain, esc } from '../ui/shell.mjs';
import { captureFocus, restoreFocus, setSwapping } from '../ui/dom.mjs';
import { toast } from '../ui/toast.mjs';
import { confirmModal } from '../ui/modal.mjs';
import { pendBlock } from '../ui/controls.mjs';
import * as shellDom from '../ui/shell-dom.mjs';

const routes = [];
const locals = new Map(); // state giao diện tạm theo path, xóa khi rời path
const memory = new Map(); // path → { qs, scroll } để breadcrumb/Back giữ bộ lọc + vị trí cuộn (Common Rule 1)
let current = null;
let ctx = null;
let rendering = false; let again = false;
let bypass = false; let lastHash = '';
let pendingScroll = null;
let fallback = null; let forbidden = null;
const globals = {};

export function register(pattern, screen, meta = {}) {
  const keys = [];
  const re = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; })}$`);
  routes.push({ pattern, re, keys, screen, meta });
}
export const setFallback = (screen) => { fallback = screen; };
export const setForbidden = (screen) => { forbidden = screen; };
export const registerGlobal = (map) => Object.assign(globals, map);

export function parse(hash = location.hash) {
  const h = decodeURIComponent(hash.replace(/^#/, '')) || '/landlords';
  const [path, qs = ''] = h.split('?');
  return { path, qs, query: Object.fromEntries(new URLSearchParams(qs)) };
}

function match(path) {
  for (const r of routes) {
    const m = r.re.exec(path);
    if (m) return { route: r, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
  }
  return null;
}

/** href có bộ lọc đã nhớ của path (dùng cho breadcrumb). */
export function hrefWithMemory(path) {
  const m = memory.get(path);
  return `#${path}${m?.qs ? `?${m.qs}` : ''}`;
}

async function leaveOk(targetHash) {
  if (!current || !current.route.screen.isDirty?.(ctx)) return true;
  if (parse(targetHash).path === current.path) return true;
  const r = await confirmModal({ title: 'Rời trang khi còn thay đổi chưa lưu?', text: 'Dữ liệu đang nhập ở màn này sẽ không được lưu (Common Rule 9).', okLabel: 'Rời trang', okIc: 'arrowRight', danger: true });
  return !!r;
}

export async function go(href, { replace = false, restore = false } = {}) {
  const target = href.startsWith('#') ? href : `#${href}`;
  if (!(await leaveOk(target))) return;
  if (restore) pendingScroll = memory.get(parse(target).path)?.scroll ?? null;
  if (replace || location.hash === target) {
    history.replaceState(null, '', target);
    render();
  } else {
    bypass = true;
    location.hash = target;
  }
}

/** Cập nhật query của màn hiện tại (bộ lọc/tab) mà không thêm lịch sử. undefined/'' → xóa khóa. */
export function setQuery(patch, { push = false } = {}) {
  const { path, query } = parse();
  const q = { ...query, ...patch };
  for (const k of Object.keys(q)) if (q[k] === undefined || q[k] === '' || q[k] === null) delete q[k];
  const qs = new URLSearchParams(q).toString();
  const target = `#${path}${qs ? `?${qs}` : ''}`;
  if (push) { bypass = true; location.hash = target; return; }
  history.replaceState(null, '', target);
  render();
}

function onHashChange() {
  if (bypass) { bypass = false; render(); return; }
  const target = location.hash;
  if (current?.route.screen.isDirty?.(ctx) && parse(target).path !== current.path) {
    history.replaceState(null, '', lastHash);
    leaveOk(target).then((ok) => { if (ok) { bypass = true; location.hash = target; } });
    return;
  }
  render();
}

export function actionFor(name) {
  const scr = current?.route.screen;
  if (scr?.actions?.[name]) return (el, e) => scr.actions[name](el, e, ctx);
  if (globals[name]) return (el, e) => globals[name](el, e, ctx);
  return null;
}

/** Chạy thay đổi dữ liệu trong transaction; lỗi nghiệp vụ → toast (mã E## gắn nhãn cần xác nhận). */
export function tx(fn, okMsg) {
  try {
    const r = store.transaction((d) => fn(d, ctx.env()));
    if (okMsg) toast('ok', okMsg);
    return { ok: true, r };
  } catch (e) {
    if (e instanceof DomainError) toast('danger', e.message, e.code === 'E##' ? 'Mã lỗi: E## (SRS chưa chốt mã)' : '');
    else { console.error(e); toast('danger', 'Lỗi không mong đợi', e.message); }
    return { ok: false, error: e };
  }
}

function buildCtx(path, qs, query, params, meta) {
  const state = store.get();
  const user = currentUser(state);
  const td = today();
  if (!locals.has(path)) locals.set(path, {});
  return {
    path, qs, query, params, meta, state, user, today: td, local: locals.get(path),
    env: () => ({ today: td, now: now(), actor: { id: user.id, name: user.name, role: user.role } }),
    can: (perm, c = {}) => can(state, perm, { today: td, ...c }),
    go, setQuery, rerender: render, tx, hrefWithMemory,
  };
}

export function render() {
  if (rendering) { again = true; return; }
  rendering = true;
  try { do { again = false; renderOnce(); } while (again); } finally { rendering = false; }
}

function renderOnce() {
  if (!location.hash) history.replaceState(null, '', '#/landlords');
  const { path, qs, query } = parse();
  const m = match(path);
  if (current && current.path !== path) {
    memory.set(current.path, { qs: current.qs, scroll: window.scrollY });
    locals.delete(current.path);
  }
  const route = m?.route || { screen: fallback, meta: {} };
  ctx = buildCtx(path, qs, query, m?.params || {}, route.meta);
  let screen = route.screen;
  let banner = '';
  if (route.meta.perm) {
    const p = ctx.can(route.meta.perm);
    if (!p.ok) screen = forbidden;
    else if (p.assumed) banner = pendBlock('Quyền truy cập đang là giả định (ASSUMED)', `${p.reason}. Vai trò hiện tại: ${esc(ctx.user.title)}.`);
  }
  const sameRoute = current && current.path === path;
  if (path !== '/login' && !ctx.state.meta.session) {
    const target = location.hash;
    sessionStorage.setItem('th.login.returnTo', target);
    history.replaceState(null, '', '#/login');
    return renderOnce();
  }
  document.body.classList.toggle('login-mode', path === '/login');
  current = { path, qs, route: { ...route, screen } };

  let view;
  try { view = screen.render(ctx); } catch (e) {
    console.error(e);
    view = { title: 'Lỗi hiển thị', body: `<div class="alert danger"><div><b>${esc(e.message)}</b></div></div>` };
  }
  view.body = (path === '/login' ? '' : periodBanner(ctx.state, ctx.state.meta.period)) + banner + (view.body || '');
  const main = document.querySelector('main');
  const focus = captureFocus(main);
  const tmp = document.createElement('div');
  tmp.innerHTML = pageMain(view);
  const next = tmp.firstElementChild;
  setSwapping(true);
  try { main.replaceWith(next); } finally { setSwapping(false); }
  shellDom.update(ctx, {
    active: view.active ?? route.meta.menu,
    breadcrumb: view.breadcrumb || [],
    crumbHrefs: view.crumbHrefs || [],
  });
  document.title = `${String(view.title).replace(/<[^>]+>/g, '')} · TimoHouse`;
  restoreFocus(next, focus);
  if (!sameRoute) window.scrollTo(0, pendingScroll ?? 0);
  pendingScroll = null;
  lastHash = location.hash;
  screen.onMount?.(ctx, next);
}

export function start() {
  window.addEventListener('hashchange', onHashChange);
  window.addEventListener('beforeunload', (e) => { if (current?.route.screen.isDirty?.(ctx)) { e.preventDefault(); e.returnValue = ''; } });
  store.subscribe(() => render());
  render();
}

export const currentCtx = () => ctx;
