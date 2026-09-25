// Screen 05.2 — Danh sách phòng và sơ đồ tầng (FR05). Chưa có capture verified: dựng từ SRS + phác họa 5.2.
import { chip, btn, card, table, kpi, icon, vnd, esc } from '../ui/shell.mjs';
import { abtn, fsel, fsearch, pend, pendBlock, emptyState, paginate, pager, stChip, muted, fieldBox, inp, sel } from '../ui/controls.mjs';
import { openModal } from '../ui/modal.mjs';
import { toast } from '../ui/toast.mjs';
import { vacancyType, createRooms, checkPreview, ROOM_TYPES } from '../core/domain/rooms.mjs';
import { managerOf } from '../core/domain/buildings.mjs';
import { dateVN, fold, parseMoney } from '../core/format.mjs';
import { crumbs, GROUP, visibleBuildings } from './common.mjs';

const CELL = { 'Đang thuê': ['st-thue', '▩'], 'Sẵn sàng': ['st-san', '▢'], 'Giữ chỗ': ['st-giu', '▨'], 'Trống hết tháng': ['st-het', '◫'], 'Chờ dọn': ['st-don', '▤'], 'Bảo trì': ['st-bt', '▦'], 'Ngừng khai thác': ['st-ngung', '⊘'] };
const PRICE = [['', 'Tất cả'], ['lt35', '< 3,5 tr'], ['35-40', '3,5 – 4 tr'], ['40-45', '4 – 4,5 tr'], ['gt45', '> 4,5 tr']];
const inPrice = (v, k) => !k || (v != null && ({ lt35: v < 3500000, '35-40': v >= 3500000 && v < 4000000, '40-45': v >= 4000000 && v <= 4500000, gt45: v > 4500000 }[k]));

function data(ctx) {
  const s = ctx.state; const q = ctx.query;
  const bIds = new Set(visibleBuildings(ctx).map((b) => b.id));
  const all = s.rooms.filter((r) => bIds.has(r.buildingId));
  const list = all.filter((r) => (!q.building || r.buildingId === q.building)
    && (!q.floor || String(r.floor) === q.floor) && (!q.status || r.status === q.status)
    && (!q.vtype || vacancyType(r.status) === q.vtype) && (!q.type || r.type === q.type)
    && inPrice(r.listPrice, q.price) && (!q.meter || (q.meter === 'yes' ? r.hasWaterMeter : !r.hasWaterMeter))
    && (!q.q || fold(r.id).includes(fold(q.q))));
  return { all, list };
}

function floorPlan(ctx, list) {
  const s = ctx.state;
  const bId = ctx.query.building || list[0]?.buildingId;
  const rooms = list.filter((r) => r.buildingId === bId);
  if (!rooms.length) return emptyState('Chưa có phòng để vẽ sơ đồ', 'Chọn tòa có phòng ở bộ lọc Tòa.', '—');
  const b = s.buildings.find((x) => x.id === bId);
  const floors = [...new Set(rooms.map((r) => r.floor))].sort((a, c) => c - a);
  return `<p class="muted" style="margin-bottom:8px">Tòa <b>${esc(b.name)}</b>${ctx.query.building ? '' : ' (tòa đầu tiên — chọn tòa ở bộ lọc để xem tòa khác)'}</p>
    <div class="fp">${floors.map((f) => `<div class="fp-row"><b>T${f}</b>${rooms.filter((r) => r.floor === f).sort((a, c) => a.number.localeCompare(c.number, 'vi', { numeric: true })).map((r) => {
    const [cls, sym] = CELL[r.status] || ['', '?'];
    return `<div class="fp-cell ${cls}" data-href="#/rooms/${r.id}" tabindex="0" role="link" data-tip="${esc(`${r.id} · ${r.status}${r.lease ? ` · ${r.lease.occupants} người` : ''}`)}"><b>${esc(r.number)}</b><small>${sym} ${r.status}</small></div>`;
  }).join('')}</div>`).join('')}</div>
    <div class="legend" style="margin-top:12px">${Object.entries(CELL).map(([st, [cls, sym]]) => `<span><i class="${cls}"></i>${sym} ${st}</span>`).join('')}</div>
    <p class="muted" style="font-size:11.5px;margin-top:6px">Màu không phải dấu hiệu duy nhất: mỗi ô có ký hiệu, chữ và tooltip trạng thái.</p>`;
}

export default {
  render(ctx) {
    const s = ctx.state; const q = ctx.query;
    const { all, list } = data(ctx);
    const plan = q.view === 'plan';
    const vac = (t) => all.filter((r) => vacancyType(r.status) === t).length;
    const kpis = `<div class="kpis" style="grid-template-columns:repeat(5,1fr)">
      ${kpi('Tổng phòng', String(all.length), 'trong phạm vi quyền', '', 'layers')}
      ${kpi('Đang thuê', String(all.filter((r) => r.status === 'Đang thuê').length), '', 'ok', 'user')}
      ${kpi('Trống ở luôn', String(vac('Trống ở luôn')), 'Sẵn sàng · Chờ dọn · Bảo trì', '', 'check')}
      ${kpi('Trống hết tháng', String(vac('Trống hết tháng')), 'đã xác nhận Kết thúc', 'warn', 'calendar')}
      ${kpi('Đang chờ', String(vac('Đang chờ')), 'Giữ chỗ · đã cọc', '', 'clock')}
    </div>`;
    const bs = visibleBuildings(ctx).filter((b) => s.rooms.some((r) => r.buildingId === b.id));
    const floors = [...new Set(list.concat(all).filter((r) => !q.building || r.buildingId === q.building).map((r) => r.floor))].sort((a, b) => a - b);
    const filters = `<div class="fbar">
      ${fsel('Tòa', 'building', q.building, [['', 'Tất cả'], ...bs.map((b) => [b.id, esc(b.code || b.name)])])}
      ${fsel('Tầng', 'floor', q.floor, [['', 'Tất cả'], ...floors.map((f) => [String(f), `Tầng ${f}`])])}
      ${fsel('Trạng thái', 'status', q.status, [['', 'Tất cả'], ...Object.keys(CELL).map((x) => [x, x])])}
      ${fsel('Loại trống', 'vtype', q.vtype, [['', 'Tất cả'], ['Trống ở luôn', 'Trống ở luôn'], ['Trống hết tháng', 'Trống hết tháng'], ['Đang chờ', 'Đang chờ']])}
      ${fsel('Loại phòng', 'type', q.type, [['', 'Tất cả'], ...ROOM_TYPES.map((t) => [t, t])])}
      ${fsel('Giá niêm yết', 'price', q.price, PRICE)}
      ${fsel('Có đồng hồ nước', 'meter', q.meter, [['', 'Tất cả'], ['yes', 'Có'], ['no', 'Không']])}
      ${fsearch('q', q.q, 'Mã phòng…')}
      <div class="fr">${pend('lọc ngày sẵn sàng, HĐ sắp hết (spec) chưa dựng')}</div>
    </div>`;
    const pg = paginate(list, q.page);
    const tr = pg.rows.map((r) => {
      const b = s.buildings.find((x) => x.id === r.buildingId);
      const m = managerOf(s, r.buildingId, ctx.today).current;
      const over = r.lease && r.capacity && r.lease.occupants > r.capacity;
      const t = [
        `<span class="mono b">${r.id}</span>`, `${esc(b.code || b.name)} / ${r.floor}`, `${esc(r.type)}${r.area ? ` · ${r.area} m²` : ''}`,
        vnd(r.listPrice), `${vnd(r.mgmtPrice)}${r.mgmtPrice && r.listPrice && r.mgmtPrice > r.listPrice ? ` <span data-tip="Giá QL > giá niêm yết">${chip('△ QL>NY', 'warn')}</span>` : ''}`,
        r.lease ? vnd(r.lease.price) : muted('—'),
        `${r.capacity ?? '—'} / ${r.lease?.occupants ?? 0}${over ? ` ${chip('vượt', 'warn')}` : ''}`,
        stChip(r.status), r.lease ? muted(r.lease.contractId || 'HĐ seed') : muted('—'),
        r.debt ? `<span class="neg">${vnd(r.debt)}</span>` : muted('0'),
        r.readyDate ? dateVN(r.readyDate) : muted('—'), m ? esc(m.employee.name) : muted('—'),
      ];
      t._attrs = `data-href="#/rooms/${r.id}" tabindex="0"`;
      return t;
    });
    const tableCard = card('Danh sách phòng', tr.length ? `<div class="scr">${table([
      { h: 'Mã phòng' }, { h: 'Tòa / tầng' }, { h: 'Loại / DT' }, { h: 'Niêm yết', num: 1 }, { h: 'Giá QL', num: 1 }, { h: 'Giá HĐ', num: 1 }, { h: 'Sức chứa / người' }, { h: 'Trạng thái' }, { h: 'Khách / HĐ' }, { h: 'Công nợ', num: 1 }, { h: 'Sẵn sàng' }, { h: 'Quản lý' },
    ], tr, { compact: 1, foot: `<span>Giá HĐ trống = phòng chưa có HĐ (dấu hiệu phòng trống) · Khách/HĐ thuộc FR06/FR07</span><span class="kv-inline">${pager(pg)}<span>${list.length} phòng</span></span>` })}</div>` : emptyState(all.length ? 'Không có phòng khớp bộ lọc' : 'Chưa có phòng nào'), '', 'flush');
    const firstB = q.building || bs[0]?.id || '';
    return {
      active: 'UI-05', ...crumbs(ctx, [[GROUP, null], ['Phòng', '/rooms']]),
      title: 'Phòng', status: chip(`${all.length} phòng`, 'neutral', 'layers'),
      subtitle: 'Nguồn duy nhất của trạng thái phòng trống · 3 loại trống (D-24)',
      actions: `${btn('Bảng', `${plan ? 'outline' : 'sel'}`, 'layers', 'data-action="view" data-v=""')}${btn('Sơ đồ tầng', `${plan ? 'sel' : 'outline'}`, 'building', 'data-action="view" data-v="plan"')}
        ${abtn({ text: 'Thêm', kind: 'primary', ic: 'plus', act: 'add', perm: ctx.can('room.create') })}${abtn({ text: 'Import', ic: 'upload', act: 'import', data: { b: firstB }, perm: ctx.can('room.create') })}`,
      body: `${pendBlock('Screen 05.2 chưa có capture verified', 'Ảnh ImageGen nháp dùng dữ liệu không có nguồn nên không dùng; bố cục dựng theo SRS và phác họa 5.2.')}${kpis}${filters}
        ${plan ? card(`${icon('building', 16)} Sơ đồ tầng`, floorPlan(ctx, list)) : tableCard}`,
    };
  },
  actions: {
    view: (el, e, ctx) => ctx.setQuery({ view: el.dataset.v || undefined }),
    import: (el, e, ctx) => ctx.go(`#/rooms/new?building=${el.dataset.b}&tab=import`),
    add: async (el, e, ctx) => {
      const bs = visibleBuildings(ctx).filter((b) => b.codeLocked && b.status !== 'Ngừng khai thác');
      const r = await openModal({
        title: `${icon('plus', 18)} Thêm một phòng`, sub: `Screen ## · ${pend('popup chưa có capture')}`, width: 500,
        body: `${fieldBox('Tòa', sel({ name: 'building', value: ctx.query.building || '', placeholder: 'Chọn tòa', options: bs.map((b) => [b.id, `${b.code} · ${b.name}`]) }), { req: true })}
          <div class="grid" style="grid-template-columns:1fr 1fr;gap:0 12px">
          ${fieldBox('Số phòng', inp({ name: 'number', attrs: 'maxlength="6"' }), { req: true, hint: 'Mã = số phòng + mã tòa' })}
          ${fieldBox('Tầng', inp({ name: 'floor', attrs: 'inputmode="numeric" maxlength="2"' }), { req: true })}
          ${fieldBox('Loại', sel({ name: 'type', value: 'Phòng thường', options: ROOM_TYPES.map((t) => [t, t]) }))}
          ${fieldBox('Sức chứa', inp({ name: 'capacity', value: '2', attrs: 'inputmode="numeric" maxlength="2"' }), { req: true })}
          ${fieldBox('Giá niêm yết', inp({ name: 'listPrice', placeholder: 'Để trống — nhập sau', attrs: 'inputmode="numeric"' }))}
          ${fieldBox('Giá QL', inp({ name: 'mgmtPrice', placeholder: 'Để trống — nhập sau', attrs: 'inputmode="numeric"' }))}</div>`,
        buttons: [{ label: 'Hủy', act: 'cancel' }, { label: 'Tạo phòng', act: 'ok', kind: 'primary', ic: 'check', enabledWhen: (d) => d.building && d.number.trim() && d.floor && d.capacity }],
      });
      if (r?.act !== 'ok') return;
      const d = r.data;
      const row = { number: d.number.trim(), floor: Number(d.floor), type: d.type, capacity: Number(d.capacity), listPrice: parseMoney(d.listPrice), mgmtPrice: parseMoney(d.mgmtPrice) };
      const existing = new Set(ctx.state.rooms.filter((x) => x.buildingId === d.building).map((x) => x.number));
      const chk = checkPreview([row], existing)[0];
      if (chk.errors.length) { toast('danger', chk.errors.join(' · '), 'Mã lỗi: E## (SRS chưa chốt mã)'); return; }
      const res = ctx.tx((dr, env) => createRooms(dr, env, d.building, [row], 'Tạo tay'), 'Đã tạo phòng');
      if (res.ok) ctx.go(`#/rooms/${res.r[0]}`);
    },
  },
};
