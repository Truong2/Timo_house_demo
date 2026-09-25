import { esc } from './shell.mjs';

let active = null;
let cleanup = null;
export function closeDrawer() { cleanup?.(); active?.remove(); active = null; cleanup = null; }
export function openDrawer({ title, body, width = 480 }) {
  closeDrawer();
  const bg = document.createElement('div');
  bg.className = 'th-drawer-bg';
  bg.innerHTML = `<aside class="th-drawer" role="dialog" aria-modal="true" aria-label="${esc(title)}" style="max-width:${Number(width)}px">
    <header><h2>${esc(title)}</h2><button type="button" data-close aria-label="Đóng">×</button></header><div class="th-drawer-body">${body}</div></aside>`;
  document.body.appendChild(bg);
  active = bg;
  const previous = document.activeElement;
  cleanup = () => document.removeEventListener('keydown', key);
  const close = () => { if (active === bg) closeDrawer(); previous?.focus?.(); };
  const key = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', key);
  bg.addEventListener('click', (e) => { if (e.target === bg || e.target.closest('[data-close]')) close(); });
  bg.querySelector('[data-close]').focus();
  return close;
}
