// Modal: đóng bằng X / click ra ngoài / Esc (khi closable), giữ focus trong modal, trả Promise.
// Nút: { label, act, kind, ic, enabledWhen(data, root) }. Click nút → onAction(act, data, api) trả false để giữ modal mở;
// mặc định đóng với { act, data }.
import { icon, esc } from './shell.mjs';
import { formData } from './dom.mjs';

let depth = 0;

export function openModal({ title, sub = '', body = '', buttons = [], width = 520, danger = false, closable = true, onMount, onAction, onInput, left = '' }) {
  return new Promise((resolve) => {
    const prevFocus = document.activeElement;
    const bg = document.createElement('div');
    bg.className = 'mdl-bg';
    bg.style.zIndex = String(100 + depth++);
    const btns = buttons.map((b, i) => `<button type="button" class="btn ${b.kind || 'outline'}" data-m="${b.act}" data-i="${i}">${b.ic ? icon(b.ic, 15) : ''}${b.label}</button>`).join('');
    bg.innerHTML = `<div class="mdl ${danger ? 'danger' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title.replace(/<[^>]+>/g, ''))}" style="width:${width}px">
      <div class="mdl-h"><div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>${closable ? `<button type="button" class="mdl-x" data-m="__close" aria-label="Đóng">${icon('x', 18)}</button>` : ''}</div>
      <div class="mdl-b">${body}</div>
      ${buttons.length || left ? `<div class="mdl-f">${left ? `<div class="lft">${left}</div>` : ''}${btns}</div>` : ''}
    </div>`;
    document.body.appendChild(bg);
    const root = bg.querySelector('.mdl');

    const api = {
      root,
      close(result = null) {
        bg.remove(); depth--;
        document.removeEventListener('keydown', onKey, true);
        prevFocus?.focus?.();
        resolve(result);
      },
      refresh() {
        const data = formData(root);
        buttons.forEach((b, i) => {
          if (!b.enabledWhen) return;
          const el = root.querySelector(`[data-i="${i}"]`);
          const ok = !!b.enabledWhen(data, root);
          el.setAttribute('aria-disabled', ok ? 'false' : 'true');
          el.classList.toggle('dis', !ok);
        });
      },
      setBody(html) { root.querySelector('.mdl-b').innerHTML = html; api.refresh(); },
    };

    const onKey = (e) => {
      if (e.key === 'Escape' && closable) { e.stopPropagation(); api.close(null); }
      if (e.key === 'Tab') {
        const f = [...root.querySelectorAll('button,input,select,textarea,[tabindex="0"]')].filter((x) => !x.disabled && x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0]; const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);

    bg.addEventListener('mousedown', (e) => { if (e.target === bg && closable) api.close(null); });
    root.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      if (b.getAttribute('aria-disabled') === 'true') return;
      const act = b.dataset.m;
      if (act === '__close') return api.close(null);
      const data = formData(root);
      const r = onAction ? await onAction(act, data, api) : undefined;
      if (r !== false && bg.isConnected) api.close({ act, data });
    });
    const changed = () => { onInput?.(formData(root), api); api.refresh(); };
    root.addEventListener('input', changed);
    root.addEventListener('change', changed);

    onMount?.(api);
    api.refresh();
    (root.querySelector('input:not([type=hidden]),select,textarea') || root.querySelector('.mdl-f .btn.primary') || root.querySelector('.mdl-x'))?.focus();
  });
}

/**
 * Xác nhận nhanh. reason = { label, placeholder, required } → trả { reason } hoặc null.
 */
export async function confirmModal({ title, text = '', danger = false, okLabel = 'Xác nhận', okIc = 'check', reason = null, extra = '', width = 480 }) {
  const body = `${text ? `<p style="margin-bottom:10px">${text}</p>` : ''}${extra}${reason ? `
    <div class="field"><label>${reason.label || 'Lý do'}${reason.required ? ' <span class="req">*</span>' : ''}</label>
      <div class="in"><textarea class="bare" name="reason" rows="3" maxlength="255" placeholder="${esc(reason.placeholder || 'Nhập lý do…')}"></textarea></div>
      <div class="hint">Tối đa 255 ký tự · ghi vào audit</div></div>` : ''}`;
  const r = await openModal({
    title, body, danger, width,
    buttons: [
      { label: 'Hủy', act: 'cancel', kind: 'outline' },
      { label: okLabel, act: 'ok', kind: danger ? 'danger' : 'primary', ic: okIc, enabledWhen: (d) => !reason?.required || String(d.reason || '').trim() },
    ],
  });
  if (!r || r.act !== 'ok') return null;
  return { reason: String(r.data.reason || '').trim() };
}
