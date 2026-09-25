// Toast tự đóng sau 4 giây, không lấy focus (spec §7.5). kind: ok | danger | warn | info
import { icon } from './shell.mjs';

export function toast(kind, title, sub = '') {
  let box = document.querySelector('.toasts');
  if (!box) {
    box = document.createElement('div');
    box.className = 'toasts';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    document.body.appendChild(box);
  }
  const t = document.createElement('div');
  t.className = `toast ${kind}`;
  const ic = { ok: 'check', danger: 'x', warn: 'alert', info: 'info' }[kind] || 'info';
  t.innerHTML = `${icon(ic, 18)}<div><b>${title}</b>${sub ? `<p>${sub}</p>` : ''}</div>`;
  box.appendChild(t);
  setTimeout(() => t.remove(), kind === 'danger' ? 7000 : 4000);
}
