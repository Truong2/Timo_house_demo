// Screen 05.1 — Tạo phòng cho tòa mới (FR05): tab Sinh theo tầng và Import Excel (CSV đọc thật, XLSX mô phỏng).
import { chip, btn, card, table, tabs, alert, grid, note, icon, stepper, rowCls, esc } from '../ui/shell.mjs';
import { abtn, pend, fieldBox, sel, muted, emptyState } from '../ui/controls.mjs';
import { confirmModal } from '../ui/modal.mjs';
import { toast } from '../ui/toast.mjs';
import { genByFloor, checkPreview, parseCSV, mapColumns, validateImport, createRooms, IMPORT_FIELDS, ROOM_TYPES } from '../core/domain/rooms.mjs';
import { roomsOf } from '../core/domain/buildings.mjs';
import { vnd } from '../ui/shell.mjs';
import { parseMoney } from '../core/format.mjs';
import { crumbs, GROUP, visibleBuildings } from './common.mjs';

const TYPE_CAPS = [['Phòng thường|1', 'Phòng thường · 1 người'], ['Phòng thường|2', 'Phòng thường · 2 người'], ['Phòng thường|3', 'Phòng thường · 3 người'], ['Phòng ban công|2', 'Phòng ban công · 2 người'], ['Studio|2', 'Studio · 2 người']];
const IMP_STEPS = ['Upload', 'Map cột', 'Validate', 'Preview', 'Commit'];

const bOf = (ctx) => ctx.state.buildings.find((b) => b.id === ctx.query.building);

function init(ctx, b) {
  const L = ctx.local;
  if (L.init) return L;
  Object.assign(L, {
    init: true, dirty: false,
    p: { floors: b?.floors ? String(b.floors) : '', perFloor: '', pattern: '{tầng}0{stt}', typeCap: 'Phòng thường|2', listPrice: '', mgmtPrice: '' },
    rows: [], warnings: [], genErr: '',
    imp: { step: 0, fileName: '', headers: [], cells: [], mapping: {}, results: [] },
  });
  return L;
}

function regenerate(L, b) {
  const [type, cap] = L.p.typeCap.split('|');
  const floors = Number(L.p.floors); const perFloor = Number(L.p.perFloor);
  L.genErr = ''; L.warnings = [];
  if (!L.p.floors || !L.p.perFloor) { L.rows = []; return; }
  try {
    const lp = parseMoney(L.p.listPrice); const mp = parseMoney(L.p.mgmtPrice);
    const r = genByFloor({ buildingCode: b.code || b.codeSuggestion || '', floors, perFloor, pattern: L.p.pattern, type, capacity: Number(cap), listPrice: Number.isFinite(lp) ? lp : null, mgmtPrice: Number.isFinite(mp) ? mp : null });
    L.rows = r.rows; L.warnings = r.warnings;
  } catch (e) { L.rows = []; L.genErr = e.message; }
}

const existingNumbers = (ctx, b) => new Set(roomsOf(ctx.state, b.id).map((r) => r.number));
const genChecked = (ctx, L, b) => checkPreview(L.rows, existingNumbers(ctx, b));
function importResults(ctx, L, b) {
  return validateImport(L.imp.cells, L.imp.mapping, { buildingCode: b.code || b.codeSuggestion || '', existing: existingNumbers(ctx, b), generated: new Set(L.rows.map((r) => String(r.number))) });
}

function genTab(ctx, L, b) {
  const code = b.code || b.codeSuggestion || '';
  const rows = genChecked(ctx, L, b);
  const f = (label, name, extra = '', attrs = '') => fieldBox(label, `<input class="bare" name="${name}" value="${esc(L.p[name])}" data-input="gen-param" ${attrs}/>`, { extra, req: ['floors', 'perFloor', 'pattern'].includes(name) });
  const cell = (i, k, v, attrs = '', err = false) => `<input class="cell-in${err ? ' err' : ''}" name="r${i}-${k}" value="${esc(v ?? '')}" data-input="row-edit" data-blur="row-blur" data-i="${i}" data-k="${k}" ${attrs}/>`;
  const tr = rows.map((r, i) => {
    const bad = r.errors.length > 0;
    const row = rowCls([
      `<span class="mono b">${esc(String(r.number || '').trim())}${esc(code)}</span>`,
      cell(i, 'number', r.number, 'maxlength="6" style="width:60px"', r.errors.some((x) => /số phòng|Trùng/.test(x))),
      `Tầng ${r.floor}`,
      `<select class="cell-in" name="r${i}-type" data-change="row-edit" data-i="${i}" data-k="type" style="width:130px">${ROOM_TYPES.map((t) => `<option${t === r.type ? ' selected' : ''}>${t}</option>`).join('')}</select>`,
      cell(i, 'capacity', r.capacity, 'inputmode="numeric" maxlength="2" style="width:44px;text-align:right"', r.errors.some((x) => /Sức chứa/.test(x))),
      cell(i, 'listPrice', r.listPrice != null ? vnd(r.listPrice) : '', 'inputmode="numeric" placeholder="—" style="width:96px;text-align:right"'),
      cell(i, 'mgmtPrice', r.mgmtPrice != null ? vnd(r.mgmtPrice) : '', `inputmode="numeric" placeholder="—" style="width:96px;text-align:right"${r.warn ? ` data-tip="${r.warn}"` : ''}`),
      bad ? `<span data-tip="${esc(r.errors.join(' · '))}">${chip('Lỗi', 'danger')}</span>` : `${chip('Mới', 'info', 'plus')}${r.warn ? chip('QL > NY', 'warn') : ''}`,
    ], bad ? 'dangerrow' : '');
    return row;
  });
  const params = card(`${icon('layers', 16)} Tham số sinh phòng`, `
    ${fieldBox('Tòa', `<b>${esc(b.name)}</b> · mã <span class="mono">${esc(code)}</span>`, { extra: b.codeLocked ? chip('Đã khóa', 'lock', 'lock') : chip('Ví dụ', 'assumed') })}
    ${f('Số tầng', 'floors', b.floors ? '' : chip(b.origin === 'extraction' ? 'HĐ trống' : 'Nhập tay', 'assumed'), 'inputmode="numeric" maxlength="2" placeholder="Ví dụ: 2"')}
    ${f('Số phòng mỗi tầng', 'perFloor', '', 'inputmode="numeric" maxlength="2" placeholder="Ví dụ: 3"')}
    ${f('Mẫu số phòng', 'pattern', '', 'class="bare mono" maxlength="30"')}
    ${fieldBox('Loại phòng · sức chứa mặc định', sel({ name: 'typeCap', value: L.p.typeCap, options: TYPE_CAPS, attrs: 'data-change="gen-param"' }), { hint: `${pend('một Dropdown gộp hay Loại + Sức chứa riêng? · danh mục loại phòng')}` })}
    ${fieldBox('Giá niêm yết · giá QL', `<input class="bare" name="listPrice" value="${esc(L.p.listPrice)}" placeholder="Để trống — nhập sau" data-input="gen-param" inputmode="numeric"/><span class="muted">·</span><input class="bare" name="mgmtPrice" value="${esc(L.p.mgmtPrice)}" placeholder="Giá QL" data-input="gen-param" inputmode="numeric"/>`)}
    ${L.genErr ? `<div class="errt" style="margin-bottom:8px">${esc(L.genErr)} ${pend('mã lỗi E##')}</div>` : ''}
    ${L.warnings.map((w) => `<div class="alert warn" style="margin-bottom:8px">${icon('alert', 16)}<div><p style="margin:0">${esc(w)}</p></div></div>`).join('')}
    ${note('Giá hiện tại của phòng chỉ đọc từ HĐ thuê khách, không nhập ở đây.')}
    <div class="pending-mark" style="margin:6px 0 0">${chip('Cần xác nhận · đổi tham số sinh lại preview ngay (ghi đè chỉnh sửa tay)', 'assumed', 'alert')}</div>`);
  const preview = card(`${icon('eye', 16)} Preview — sửa được từng dòng trước khi tạo`, rows.length ? table([
    { h: 'Mã phòng' }, { h: 'Số phòng' }, { h: 'Tầng' }, { h: 'Loại' }, { h: 'Sức chứa', num: 1 }, { h: 'Giá niêm yết', num: 1 }, { h: 'Giá QL', num: 1 }, { h: '' },
  ], tr, { compact: 1, foot: `<span>Phòng tạo ở trạng thái Sẵn sàng · chưa có công tơ phòng — khai báo ở UI-10 ${pend('capture ghi “Trống”, SRS ghi “Sẵn sàng”')}</span><span>${rows.filter((r) => !r.errors.length).length} phòng</span>` })
    : emptyState('Chưa có dòng preview', 'Nhập số tầng và số phòng mỗi tầng để sinh preview.', '—'),
  abtn({ text: 'Thêm dòng', kind: 'outline sm', ic: 'plus', act: 'add-row' }), 'flush');
  return grid('320px 1fr', [params, preview]);
}

function importTab(ctx, L, b) {
  const I = L.imp;
  const head = stepper(IMP_STEPS, I.step);
  if (I.step === 0) {
    return `${head}${card(`${icon('upload', 16)} Upload file phòng`, `
      <label class="drop" id="rdrop">${icon('upload', 22)}<div style="margin-top:6px"><b>Kéo thả file vào đây</b> hoặc bấm để chọn</div>
        <small>.csv (UTF-8) đọc thật · .xlsx ${pend('mockup chưa đọc XLSX — dùng CSV')}</small>
        <input type="file" id="rfile" accept=".csv,.xlsx"/></label>
      <div style="display:flex;gap:8px;align-items:center;margin-top:10px">${abtn({ text: 'Dùng file mẫu', ic: 'file', act: 'sample' })}<span class="muted" style="font-size:12px">phong_25A_PhuDien.csv · 4 dòng (2 hợp lệ · 1 trùng · 1 thiếu)</span></div>
      ${note('Cột bắt buộc: mã, tòa, số phòng, tầng, giá niêm yết, giá QL, sức chứa. Dòng lỗi không chặn dòng hợp lệ.')}`)}`;
  }
  if (I.step === 1) {
    const opts = [['-1', '— Không có —'], ...I.headers.map((h, i) => [String(i), esc(h)])];
    return `${head}${card(`${icon('link', 16)} Map cột · <span class="mono">${esc(I.fileName)}</span>`, table([{ h: 'Trường hệ thống' }, { h: 'Cột trong file' }, { h: '' }], IMPORT_FIELDS.map(([k, label]) => [
      label, `<select class="inline-in" name="map-${k}" data-change="map" data-k="${k}" style="max-width:260px">${opts.map(([v, l]) => `<option value="${v}"${String(I.mapping[k]) === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`,
      I.mapping[k] >= 0 ? chip('Đã map', 'ok') : chip('Chưa map', 'warn'),
    ]), { compact: 1, foot: `<span>Tự map theo tên cột · ${I.cells.length} dòng dữ liệu</span><span>${abtn({ text: 'Validate', kind: 'primary sm', ic: 'check', act: 'validate-import' })}</span>` }), abtn({ text: 'Chọn file khác', kind: 'ghost sm', ic: 'refresh', act: 'import-reset' }), 'flush')}`;
  }
  const res = I.results;
  const n = { ok: res.filter((r) => r.status === 'ok').length, dup: res.filter((r) => r.status === 'dup').length, miss: res.filter((r) => r.status === 'missing' || r.status === 'error').length };
  const tr = res.map((r) => rowCls([String(r.line), `<span class="mono">${esc(r.code)}</span>`, r.floor ?? '—', r.listPrice != null ? vnd(r.listPrice) : '—', r.mgmtPrice != null ? vnd(r.mgmtPrice) : '—', r.capacity ?? '—',
    chip(r.label, r.status === 'ok' ? 'ok' : r.status === 'dup' ? 'danger' : 'warn')], r.status === 'dup' ? 'dangerrow' : r.status === 'ok' ? '' : 'warnrow'));
  return `${head}${grid('1fr 300px', [
    card(`${icon('upload', 16)} Preview import · <span class="mono">${esc(I.fileName)}</span>`, table([
      { h: 'Dòng', num: 1 }, { h: 'Mã phòng' }, { h: 'Tầng', num: 1 }, { h: 'Giá niêm yết', num: 1 }, { h: 'Giá QL', num: 1 }, { h: 'Sức chứa', num: 1 }, { h: 'Kết quả' },
    ], tr, { compact: 1, foot: `<span>Cột bắt buộc: mã, tòa, số phòng, tầng, giá niêm yết, giá QL, sức chứa ${pend('ô giá được để trống?')}</span><span>${res.length} dòng · ${n.ok} hợp lệ</span>` }), abtn({ text: 'Import file khác', kind: 'ghost sm', ic: 'refresh', act: 'import-reset' }), 'flush'),
    card('Kết quả validate', `<div class="dl c1">
      <div><dt>Hợp lệ</dt><dd class="pos">${n.ok}</dd></div>
      <div><dt>Trùng mã</dt><dd class="neg">${n.dup}</dd></div>
      <div><dt>Thiếu dữ liệu</dt><dd class="wtx">${n.miss}</dd></div>
    </div>${note('Dòng lỗi không chặn các dòng hợp lệ. Tải file dòng lỗi để sửa và import lại.')}
    <div style="display:flex;gap:6px;margin-top:10px">${abtn({ text: 'Tải dòng lỗi', kind: 'outline sm', ic: 'download', act: 'download-errors', disabled: !(n.dup + n.miss), tip: 'Không có dòng lỗi' })}${pend('định dạng file dòng lỗi')}</div>`),
  ])}`;
}

function render(ctx) {
  const b = bOf(ctx);
  const base = { active: 'UI-05', ...crumbs(ctx, [[GROUP, null], ['Phòng', '/rooms'], ['Tạo phòng cho tòa mới']]) };
  if (!b) {
    const bs = visibleBuildings(ctx).filter((x) => x.status !== 'Ngừng khai thác');
    return {
      ...base, title: 'Tạo phòng', subtitle: 'Chọn tòa cần tạo phòng',
      body: card('Chọn tòa', `<div class="kv-inline">${bs.map((x) => `<button class="btn outline" data-nav="#/rooms/new?building=${x.id}">${icon('building', 15)}${esc(x.name)} ${x.codeLocked ? '' : chip('chưa lưu mã', 'assumed')}</button>`).join('')}</div>`),
    };
  }
  const L = init(ctx, b);
  const tab = ctx.query.tab === 'import' ? 'import' : 'gen';
  const perm = ctx.can('room.create', { buildingId: b.id });
  const count = tab === 'gen' ? genChecked(ctx, L, b).filter((r) => !r.errors.length).length : (L.imp.step === 3 ? L.imp.results.filter((r) => r.status === 'ok').length : 0);
  const hasErr = tab === 'gen' && genChecked(ctx, L, b).some((r) => r.errors.length);
  const locked = !b.codeLocked;
  return {
    ...base,
    title: `Tạo phòng · ${esc(b.name)}`, status: chip(`${roomsOf(ctx.state, b.id).length} phòng`, 'neutral', 'layers'),
    subtitle: 'Hai cách: sinh theo tầng × số phòng/tầng hoặc import Excel · có preview và phát hiện trùng mã',
    actions: `${abtn({ text: 'Hủy', act: 'cancel' })}${abtn({ text: `Tạo ${count} phòng`, kind: 'primary', ic: 'check', act: 'create', perm, disabled: locked || !count || hasErr, tip: locked ? 'Lưu mã tòa trước khi tạo phòng (BR-2.03.3)' : hasErr ? 'Sửa các dòng lỗi trong preview' : 'Chưa có dòng hợp lệ' })}${pend('nút áp cho tab đang mở')}`,
    body: `${alert('HĐ chủ nhà không có danh sách phòng', 'Mẫu tùng sói chỉ có địa chỉ, “Nhà có … tầng” (để trống) và phụ lục “Cửa sổ các phòng”. Phòng tạo tay theo tầng hoặc import file. Mã phòng = số phòng + mã tòa (lưu 2 trường riêng).', 'info')}
      ${locked ? alert('Tòa chưa lưu mã', 'Mã tòa là khóa của mã phòng và bất biến sau khi lưu. Lưu mã ở màn tòa trước khi tạo phòng.', 'warn', btn('Mở tòa', 'outline sm', 'building', `data-nav="#/buildings/${b.id}"`)) : ''}
      ${tabs(['Sinh theo tầng', 'Import Excel'], tab === 'gen' ? 0 : 1, ['data-action="tab" data-tab="gen" role="tab" tabindex="0"', 'data-action="tab" data-tab="import" role="tab" tabindex="0"'])}
      ${tab === 'gen' ? genTab(ctx, L, b) : importTab(ctx, L, b)}`,
  };
}

function loadCsv(ctx, name, text) {
  const L = ctx.local;
  const cells = parseCSV(text);
  if (cells.length < 2) { toast('danger', 'File không có dòng dữ liệu'); return; }
  const bad = text.includes('�');
  L.imp = { step: 1, fileName: name, headers: cells[0], cells: cells.slice(1), mapping: mapColumns(cells[0]), results: [] };
  L.dirty = true;
  if (bad) toast('warn', 'File có ký tự lỗi mã hóa', 'Lưu lại CSV dạng UTF-8 rồi import lại');
  ctx.rerender();
}

function downloadErrors(ctx) {
  const L = ctx.local;
  const bad = L.imp.results.filter((r) => r.status !== 'ok');
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [['Dòng', ...L.imp.headers, 'Lỗi'].map(q).join(','), ...bad.map((r) => [r.line, ...L.imp.cells[r.line - 2], r.label].map(q).join(','))];
  const url = URL.createObjectURL(new Blob([`﻿${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = `dong-loi_${L.imp.fileName.replace(/\.\w+$/, '')}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default {
  render,
  isDirty: (ctx) => !!ctx.local.dirty,
  onMount(ctx, main) {
    const input = main.querySelector('#rfile'); const drop = main.querySelector('#rdrop');
    if (!input) return;
    const read = async (f) => {
      if (!f) return;
      if (/\.xlsx$/i.test(f.name)) { toast('warn', 'Mockup chưa đọc được XLSX', 'Lưu file dạng CSV (UTF-8) hoặc bấm “Dùng file mẫu”'); return; }
      loadCsv(ctx, f.name, await f.text());
    };
    input.addEventListener('change', () => read(input.files[0]));
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); read(e.dataTransfer.files[0]); });
  },
  actions: {
    'gen-param': (el, e, ctx) => {
      const L = ctx.local; L.p[el.name] = el.value; L.dirty = true;
      regenerate(L, bOf(ctx)); ctx.rerender();
    },
    'row-edit': (el, e, ctx) => {
      const r = ctx.local.rows[Number(el.dataset.i)]; const k = el.dataset.k;
      if (k === 'listPrice' || k === 'mgmtPrice') { const v = parseMoney(el.value); r[k] = Number.isFinite(v) ? v : null; }
      else if (k === 'capacity') r[k] = el.value.trim() === '' ? null : Number(el.value);
      else r[k] = el.value;
      ctx.local.dirty = true;
      if (e.type === 'change') ctx.rerender();
    },
    'row-blur': (el, e, ctx) => setTimeout(() => ctx.rerender(), 0),
    'add-row': (el, e, ctx) => {
      const L = ctx.local; const last = L.rows[L.rows.length - 1];
      const [type, cap] = L.p.typeCap.split('|');
      L.rows.push({ number: '', floor: last?.floor || 1, type, capacity: Number(cap), listPrice: null, mgmtPrice: null, isNew: true });
      L.dirty = true; ctx.rerender();
      setTimeout(() => document.querySelector(`[name="r${L.rows.length - 1}-number"]`)?.focus(), 0);
    },
    sample: async (el, e, ctx) => {
      const res = await fetch('samples/phong_25A_PhuDien.csv');
      loadCsv(ctx, 'phong_25A_PhuDien.csv', await res.text());
    },
    map: (el, e, ctx) => { ctx.local.imp.mapping[el.dataset.k] = Number(el.value); ctx.rerender(); },
    'validate-import': (el, e, ctx) => {
      const L = ctx.local; const b = bOf(ctx);
      L.imp.results = importResults(ctx, L, b); L.imp.step = 3; ctx.rerender();
    },
    'import-reset': (el, e, ctx) => { ctx.local.imp = { step: 0, fileName: '', headers: [], cells: [], mapping: {}, results: [] }; ctx.rerender(); },
    'download-errors': (el, e, ctx) => downloadErrors(ctx),
    cancel: (el, e, ctx) => ctx.go(ctx.hrefWithMemory('/rooms')),
    create: async (el, e, ctx) => {
      const L = ctx.local; const b = bOf(ctx);
      const tab = ctx.query.tab === 'import' ? 'import' : 'gen';
      const rows = tab === 'gen'
        ? genChecked(ctx, L, b).filter((r) => !r.errors.length)
        : L.imp.results.filter((r) => r.status === 'ok').map((r) => ({ ...r, type: 'Phòng thường' }));
      const source = tab === 'gen' ? 'Sinh theo tầng' : `Import ${L.imp.fileName}`;
      const ok = await confirmModal({
        title: `Tạo ${rows.length} phòng cho ${esc(b.name)}?`, okLabel: `Tạo ${rows.length} phòng`, okIc: 'check', width: 520,
        text: `Mã: <span class="mono">${rows.slice(0, 8).map((r) => `${r.number}${b.code}`).join(', ')}${rows.length > 8 ? '…' : ''}</span>. Phòng ở trạng thái <b>Sẵn sàng</b>, chưa có công tơ phòng. ${pend('Screen ## · popup xác nhận chưa có capture')}`,
      });
      if (!ok) return;
      const res = ctx.tx((d, env) => createRooms(d, env, b.id, rows, source), `Đã tạo ${rows.length} phòng`);
      if (!res.ok) return;
      if (tab === 'gen') { L.rows = []; L.p.perFloor = ''; } else L.imp = { step: 0, fileName: '', headers: [], cells: [], mapping: {}, results: [] };
      L.dirty = false;
      toast('info', 'Chuyển tới danh sách phòng của tòa', 'Màn đích sau khi tạo là dự kiến (SRS FR05 User steps)');
      ctx.go(`#/rooms?building=${b.id}`);
    },
  },
};
