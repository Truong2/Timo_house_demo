// Event delegation cài MỘT lần trên document (tránh handler chồng khi render lại).
// Ưu tiên: data-action > data-nav > data-href. Phần tử aria-disabled bị bỏ qua (giữ tooltip).
// Sự kiện nhập liệu: data-change / data-input / data-blur = tên action.

let resolveAction = () => null;
let navigate = () => {};
let swapping = false;
/** Router bật cờ này khi thay <main>: gỡ phần tử đang focus làm trình duyệt bắn focusout giả → bỏ qua. */
export const setSwapping = (v) => { swapping = v; };

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Đọc mọi [name] trong root → object. Checkbox → boolean, file → FileList. */
export function formData(root) {
  const out = {};
  for (const el of root.querySelectorAll('[name]')) {
    if (el.type === 'checkbox') out[el.name] = el.checked;
    else if (el.type === 'radio') { if (el.checked) out[el.name] = el.value; }
    else if (el.type === 'file') out[el.name] = el.files;
    else out[el.name] = el.value;
  }
  return out;
}

const inOverlay = (el) => el.closest('.mdl-bg, .menu-pop, .gs-pop');

export function install({ getAction, go }) {
  resolveAction = getAction;
  navigate = go;

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action],[data-nav],[data-href]');
    if (!el || inOverlay(el)) return;
    if (el.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    if (el.dataset.action) {
      const fn = resolveAction(el.dataset.action);
      if (fn) { e.preventDefault(); fn(el, e); }
      else console.warn('Chưa có handler cho', el.dataset.action);
      return;
    }
    const href = el.dataset.nav || el.dataset.href;
    if (href) { e.preventDefault(); navigate(href, { restore: el.dataset.restore === '1' }); }
  });

  const onField = (attr) => (e) => {
    if (swapping && attr === 'data-blur') return;
    const el = e.target.closest?.(`[${attr}]`);
    if (!el || inOverlay(el)) return;
    const fn = resolveAction(el.getAttribute(attr));
    if (fn) fn(el, e);
  };
  document.addEventListener('change', onField('data-change'));
  document.addEventListener('input', onField('data-input'));
  document.addEventListener('focusout', onField('data-blur'));

  document.addEventListener('keydown', (e) => {
    const el = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && el.matches?.('[role=button],[role=link],[data-href],.tabs span[data-action]') && !el.matches('button,input,select,textarea')) {
      e.preventDefault();
      el.click();
    }
  });
}

/** Giữ focus + caret của ô đang nhập qua lần render lại (ô tìm kiếm debounce). */
export function captureFocus(root) {
  const a = document.activeElement;
  if (!a || !root.contains(a) || !a.name) return null;
  return { name: a.name, start: a.selectionStart, end: a.selectionEnd };
}
export function restoreFocus(root, f) {
  if (!f) return;
  const el = root.querySelector(`[name="${CSS.escape(f.name)}"]`);
  if (!el) return;
  el.focus();
  try { if (f.start != null) el.setSelectionRange(f.start, f.end); } catch { /* select/date không có caret */ }
}
