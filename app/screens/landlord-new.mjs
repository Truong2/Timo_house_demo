// Screen 02.3 — Tạo chủ nhà nhập tay (wizard 4 bước). Chưa có capture: bước 1 dựng đủ theo SRS, bước 2–3 chờ capture.
import { chip, card, stepper, alert, dl, grid, note, icon, esc, mask } from '../ui/shell.mjs';
import { abtn, fieldBox, inp, sel, pend, pendBlock, muted } from '../ui/controls.mjs';
import { findDuplicate, validateLandlord, createLandlord } from '../core/domain/landlords.mjs';
import { dateVN, dtVN, digits } from '../core/format.mjs';
import { crumbs, GROUP } from './common.mjs';
import { duplicatePopup } from './popups/landlord.mjs';

const KEY = 'landlord-new';
const STEPS = ['Bên A và người đại diện', 'Nhà đất / tòa · tài sản', 'HĐ đầu vào', 'Đính kèm & xem trước'];
const EMPTY = { type: 'Cá nhân', name: '', idNo: '', idIssued: '', idPlace: '', taxCode: '', legalName: '', representative: '', phone: '', email: '', address: '', contactAddress: '', bank: '', no: '', holder: '', effectiveFrom: '', defaultCycle: '' };

function init(ctx) {
  const L = ctx.local;
  if (L.init) return L;
  const saved = ctx.state.drafts?.[KEY];
  Object.assign(L, { init: true, step: saved?.step || 1, data: { ...EMPTY, ...(saved?.data || {}) }, dup: saved?.dup || null, touched: new Set(), errors: {}, dirty: false, resumedAt: saved?.savedAt || null, checked: {} });
  return L;
}

const payload = (d) => ({
  ...d, bank: d.no ? { bank: d.bank, no: d.no, holder: d.holder || d.name, effectiveFrom: d.effectiveFrom } : null,
});

function step1(ctx, L) {
  const d = L.data; const E = (k) => (L.touched.has(k) ? L.errors[k] : '');
  const org = d.type === 'Tổ chức';
  const f = (label, name, opts = {}) => fieldBox(label, inp({ name, value: d[name], type: opts.type || 'text', placeholder: opts.ph || '', attrs: `data-input="wz" data-blur="wz-blur" ${opts.attrs || ''}` }), { req: opts.req, err: E(name), hint: opts.hint });
  return card(`${icon('user', 16)} Bước 1 · Bên A và người đại diện`, `
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:0 16px">
      ${fieldBox('Loại', sel({ name: 'type', value: d.type, options: [['Cá nhân', 'Cá nhân'], ['Tổ chức', 'Tổ chức']], attrs: 'data-change="wz-type"' }), { req: true, hint: 'Đổi loại → đổi bộ trường bắt buộc' })}
      ${f(org ? 'Tên pháp nhân' : 'Họ tên', 'name', { req: true, attrs: 'maxlength="255"', hint: `Placeholder ${pend('SRS để ##')}` })}
      ${org
    ? `${f('MST', 'taxCode', { req: true, attrs: 'inputmode="numeric" maxlength="13"', hint: 'Rời ô → dò trùng MST' })}${f('Người đại diện', 'representative', { req: true, attrs: 'maxlength="255"' })}`
    : `${f('CCCD', 'idNo', { req: true, attrs: 'inputmode="numeric" maxlength="12"', hint: 'Rời ô → dò trùng CCCD' })}
        ${f('Ngày cấp', 'idIssued', { req: true, type: 'date', attrs: `max="${ctx.today}"` })}
        ${f('Nơi cấp', 'idPlace', { req: true, attrs: 'maxlength="255"' })}
        ${f('Người đại diện / ủy quyền', 'representative', { attrs: 'maxlength="255"' })}`}
      ${f('SĐT', 'phone', { req: true, attrs: 'inputmode="tel" maxlength="15"', hint: 'Chuẩn hóa khi lưu · rời ô → dò trùng SĐT' })}
      ${f('Email', 'email', { type: 'email', attrs: 'maxlength="255"' })}
      ${f(org ? 'Địa chỉ trụ sở' : 'Địa chỉ thường trú', 'address', { attrs: 'maxlength="255"' })}
      ${f('Địa chỉ liên hệ', 'contactAddress', { attrs: 'maxlength="255"', hint: 'Để trống = mặc định địa chỉ thường trú' })}
    </div>
    <h4 style="margin:6px 0 8px;font-size:13px">Tài khoản nhận tiền <span class="muted" style="font-weight:400">· không bắt buộc khi tạo, bắt buộc trước khi kích hoạt HĐ đầu vào (FR03)</span></h4>
    <div class="grid" style="grid-template-columns:1fr 1fr 1fr 160px;gap:0 12px">
      ${f('Ngân hàng', 'bank')}${f('Số TK', 'no', { attrs: 'inputmode="numeric" maxlength="20"' })}${f('Chủ TK', 'holder')}${f('Hiệu lực từ', 'effectiveFrom', { type: 'date' })}
    </div>
    ${fieldBox('Kỳ trả mặc định', sel({ name: 'defaultCycle', value: d.defaultCycle, placeholder: 'Chọn kỳ trả', options: [['3 tháng/lần', '3 tháng/lần'], ['4 tháng/lần', '4 tháng/lần'], ['6 tháng/lần', '6 tháng/lần']], attrs: 'data-change="wz"' }), { hint: `Danh sách kỳ trả ${pend('danh sách cần xác nhận')}` })}
    ${L.dup ? alert(`Đã xử lý trùng ${L.dup.key}: ${L.dup.decision === 'create' ? 'Vẫn tạo' : 'Dùng bản ghi có sẵn'}`, L.dup.reason ? `Lý do: ${esc(L.dup.reason)} — sẽ ghi vào audit.` : '', 'info') : ''}`);
}

const laterStep = (n, title, items) => card(`${icon('layers', 16)} Bước ${n} · ${title}`, `
  ${pendBlock('Chưa có capture cho bước này', 'SRS 02.3: cần capture và mô tả riêng từng bước (mỗi bước là một screen theo chuẩn input form).')}
  <p>Nội dung dự kiến theo SRS:</p>
  <ul style="margin:6px 0 0 18px;line-height:1.8">${items.map((i) => `<li>${i}</li>`).join('')}</ul>
  ${note('Theo Business Rule FR02: có thể tạo chủ nhà trước, bổ sung HĐ và tòa sau — bấm Tiếp tục để bỏ qua bước này.')}`);

function step4(ctx, L) {
  const d = L.data; const org = d.type === 'Tổ chức';
  return grid('1fr 1fr', [
    card(`${icon('eye', 16)} Xem trước hồ sơ chủ nhà`, dl([
      ['Loại', d.type], [org ? 'Tên pháp nhân' : 'Họ tên', `<b>${esc(d.name) || '—'}</b>`],
      [org ? 'MST' : 'CCCD', (org ? d.taxCode : d.idNo) ? `<span class="mono">${mask(digits(org ? d.taxCode : d.idNo))}</span>` : muted('—')],
      ...(org ? [['Người đại diện', esc(d.representative) || '—']] : [['Ngày cấp · nơi cấp', `${d.idIssued ? dateVN(d.idIssued) : '—'} · ${esc(d.idPlace) || '—'}`]]),
      ['SĐT', d.phone ? `<span class="mono">${mask(digits(d.phone))}</span>` : muted('—')],
      ['Tài khoản nhận', d.no ? `${esc(d.bank)} · <span class="mono">${mask(digits(d.no))}</span>` : chip('Chưa có — bổ sung trước khi kích hoạt HĐ', 'warn')],
      ['Nguồn tạo', 'Tạo tay'],
    ], 1)),
    card(`${icon('link', 16)} Liên kết Chủ nhà → HĐ → Tòa → Phòng`, `<ul class="tl">
      <li class="cur"><em></em><div><b>Chủ nhà</b><small>Sẽ tạo mã LL-xxxx · Hoạt động ${pend('cách sinh mã')}</small></div></li>
      <li><em></em><div><b>HĐ đầu vào</b><small>Chưa có — tạo bằng trích xuất HĐ chủ nhà (FR03)</small></div></li>
      <li><em></em><div><b>Tòa</b><small>Chưa có — suy ra từ HĐ đầu vào (BR-2.01.4)</small></div></li>
      <li><em></em><div><b>Phòng</b><small>Tạo ở UI-05 sau khi có tòa</small></div></li></ul>
      ${note('Không dùng OCR hợp đồng khách (UI-08) để tạo chủ nhà.')}`),
  ]);
}

function render(ctx) {
  const L = init(ctx);
  L.errors = validateLandlord(L.data);
  const body = [step1, (c) => laterStep(2, STEPS[1], ['Nhà đất / tòa và Giấy chứng nhận', 'Tài sản bàn giao']), (c) => laterStep(3, STEPS[2], ['Bên B', 'Thời hạn, giá, cọc, kỳ trả']), step4][L.step - 1](ctx, L);
  const last = L.step === 4;
  const nav = `<div class="card"><div class="cb" style="display:flex;gap:8px;align-items:center">
      ${abtn({ text: 'Hủy', act: 'cancel' })}${abtn({ text: 'Lưu nháp', ic: 'download', act: 'save-draft' })}
      <span style="flex:1"></span>
      ${L.step > 1 ? abtn({ text: 'Quay lại', ic: 'arrowLeft', act: 'prev' }) : ''}
      ${last ? abtn({ text: 'Tạo chủ nhà', kind: 'primary', ic: 'check', act: 'create', perm: ctx.can('landlord.create') }) : abtn({ text: 'Tiếp tục', kind: 'primary', ic: 'arrowRight', act: 'next' })}
    </div></div>`;
  return {
    active: 'UI-02', ...crumbs(ctx, [[GROUP, null], ['Chủ nhà', '/landlords'], ['Tạo chủ nhà nhập tay']]),
    title: 'Tạo chủ nhà nhập tay', status: chip(`Bước ${L.step}/4`, 'info', 'edit'),
    subtitle: `Cách phụ · cách chính là tạo từ HĐ chủ nhà (FR03) · route #/landlords/new ${pend('route đề xuất')}`,
    actions: abtn({ text: 'Quay lại danh sách', ic: 'arrowLeft', act: 'cancel' }),
    body: `${pendBlock('Screen 02.3 chưa có capture', 'Giao diện dựng từ SRS; bước 1 đủ field theo SRS, bước 2–4 chờ capture.')}
      ${L.resumedAt ? alert(`Đang tiếp tục bản nháp lưu lúc ${dtVN(L.resumedAt)}`, '', 'info', abtn({ text: 'Bỏ nháp', kind: 'outline sm', ic: 'x', act: 'discard' })) : ''}
      ${stepper(STEPS, L.step - 1)}${body}${nav}`,
  };
}

async function checkDup(ctx, L, keys) {
  const d = L.data;
  const hit = findDuplicate(ctx.state, { idNo: d.type === 'Tổ chức' ? '' : d.idNo, taxCode: d.type === 'Tổ chức' ? d.taxCode : '', phone: d.phone, name: d.name }, { keys });
  if (!hit) return true;
  const sig = `${hit.key}:${hit.match.id}`;
  if (L.dup && L.checked[sig]) return true;
  if (L.dupOpen) return false;
  L.dupOpen = true;
  const r = await duplicatePopup(hit).finally(() => { L.dupOpen = false; });
  if (!r) return false;
  if (r.decision === 'use') {
    L.dirty = false;
    ctx.tx((dr) => { delete dr.drafts[KEY]; });
    ctx.go(`#/landlords/${r.existingId}`);
    return false;
  }
  L.dup = r; L.checked[sig] = true;
  ctx.rerender();
  return true;
}

function saveDraft(ctx, L, msg) {
  ctx.tx((d) => { d.drafts[KEY] = { step: L.step, data: L.data, dup: L.dup, savedAt: ctx.env().now }; }, msg);
  L.dirty = false;
}

export default {
  render,
  isDirty: (ctx) => !!ctx.local.dirty,
  actions: {
    wz: (el, e, ctx) => { ctx.local.data[el.name] = el.value; ctx.local.dirty = true; },
    'wz-type': (el, e, ctx) => { ctx.local.data.type = el.value; ctx.local.dirty = true; ctx.local.touched.clear(); ctx.rerender(); },
    'wz-blur': (el, e, ctx) => {
      const L = ctx.local;
      L.touched.add(el.name);
      setTimeout(async () => {
        if (el.name === 'idNo' || el.name === 'taxCode') { if (digits(el.value).length >= 10) await checkDup(ctx, L, ['id']); }
        else if (el.name === 'phone') { if (digits(el.value).length >= 9) await checkDup(ctx, L, ['phone']); }
        ctx.rerender();
      }, 0);
    },
    next: async (el, e, ctx) => {
      const L = ctx.local;
      if (L.step === 1) {
        L.errors = validateLandlord(L.data);
        Object.keys(EMPTY).forEach((k) => L.touched.add(k));
        if (Object.keys(L.errors).length) { ctx.rerender(); document.querySelector('.field .in.err .bare')?.focus(); return; }
        if (!(await checkDup(ctx, L, ['id', 'phone', 'name']))) return;
      }
      L.step = Math.min(4, L.step + 1);
      saveDraft(ctx, L); // autosave theo từng bước (spec §7.3)
    },
    prev: (el, e, ctx) => { ctx.local.step = Math.max(1, ctx.local.step - 1); ctx.rerender(); },
    'save-draft': (el, e, ctx) => saveDraft(ctx, ctx.local, 'Đã lưu nháp'),
    discard: (el, e, ctx) => {
      ctx.tx((d) => { delete d.drafts[KEY]; }, 'Đã bỏ bản nháp');
      Object.assign(ctx.local, { init: false });
      ctx.rerender();
    },
    cancel: (el, e, ctx) => ctx.go(ctx.hrefWithMemory('/landlords')),
    create: async (el, e, ctx) => {
      const L = ctx.local;
      const errs = validateLandlord(L.data);
      if (Object.keys(errs).length) { L.step = 1; Object.keys(EMPTY).forEach((k) => L.touched.add(k)); ctx.rerender(); return; }
      const res = ctx.tx((d, env) => {
        const l = createLandlord(d, env, payload(L.data), { source: { kind: 'manual' }, dupReason: L.dup?.reason || '' });
        delete d.drafts[KEY];
        return l.id;
      }, 'Đã tạo chủ nhà');
      if (res.ok) { L.dirty = false; ctx.go(`#/landlords/${res.r}`); }
    },
  },
};
