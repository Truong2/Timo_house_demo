// Dropdown gắn dưới một phần tử neo. items: { label, act, ic, disabled, tip, danger, cur, sub } | { header } | { sep: true }
import { icon, esc } from './shell.mjs';

let open = null;
export function closeMenu() { open?.(); open = null; }

export function openMenu(anchor, items, onPick, { align = 'right', width } = {}) {
  closeMenu();
  const pop = document.createElement('div');
  pop.className = 'menu-pop';
  pop.setAttribute('role', 'menu');
  if (width) pop.style.width = `${width}px`;
  pop.innerHTML = items.map((it, i) => {
    if (it.sep) return '<hr/>';
    if (it.header) return `<div class="mh">${it.header}</div>`;
    const dis = it.disabled ? ' aria-disabled="true"' : '';
    const tip = it.tip ? ` data-tip="${esc(it.tip)}"` : '';
    return `<button type="button" role="menuitem" class="mi ${it.danger ? 'danger' : ''} ${it.cur ? 'cur' : ''}" data-i="${i}"${dis}${tip}>${it.ic ? icon(it.ic, 14) : ''}<span>${it.label}</span>${it.sub ? `<small>${it.sub}</small>` : ''}</button>`;
  }).join('');
  document.body.appendChild(pop);
  const r = anchor.getBoundingClientRect();
  const w = pop.offsetWidth;
  pop.style.top = `${r.bottom + window.scrollY + 6}px`;
  pop.style.left = `${Math.max(8, (align === 'right' ? r.right - w : r.left) + window.scrollX)}px`;

  const onDoc = (e) => { if (!pop.contains(e.target) && !anchor.contains(e.target)) closeMenu(); };
  const onKey = (e) => {
    if (e.key === 'Escape') { closeMenu(); anchor.focus?.(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const list = [...pop.querySelectorAll('.mi:not([aria-disabled=true])')];
      const i = list.indexOf(document.activeElement);
      list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus();
      e.preventDefault();
    }
  };
  pop.addEventListener('click', (e) => {
    const b = e.target.closest('.mi');
    if (!b || b.getAttribute('aria-disabled') === 'true') return;
    const it = items[Number(b.dataset.i)];
    closeMenu();
    onPick?.(it);
  });
  setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
  document.addEventListener('keydown', onKey);
  open = () => { pop.remove(); document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  pop.querySelector('.mi:not([aria-disabled=true])')?.focus();
}
