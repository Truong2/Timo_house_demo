// Screen 05.3 — Chi tiết phòng (FR05). Chưa có capture verified: dựng từ SRS + phác họa 5.2 (phòng 304G1).
import { chip, btn, card, table, alert, dl, grid, note, icon, vnd, esc } from '../ui/shell.mjs';
import { abtn, pend, pendBlock, stChip, muted, notSpecified, emptyState, fieldBox, inp } from '../ui/controls.mjs';
import { openModal, confirmModal } from '../ui/modal.mjs';
import { openMenu } from '../ui/menu.mjs';
import { transitionsFrom, applyTransition, setPrice, setCapacity, vacancyType } from '../core/domain/rooms.mjs';
import { dateVN, daysBetween, parseMoney } from '../core/format.mjs';
import { crumbs, GROUP } from './common.mjs';

const find = (ctx) => ctx.state.rooms.find((r) => r.id === ctx.params.id);

function warnings(r, today) {
  const out = [];
  const days = r.statusFrom ? daysBetween(r.statusFrom, today) : 0;
  if (vacancyType(r.status) && r.vacantFrom && daysBetween(r.vacantFrom, today) > 30) out.push(`Phòng trống ${daysBetween(r.vacantFrom, today)} ngày (> 30 ngày)`);
  if (r.status === 'Chờ dọn' && days > 3) out.push(`Chờ dọn ${days} ngày (> 3 ngày)`);
  if (r.status === 'Bảo trì' && days > 15) out.push(`Bảo trì ${days} ngày (> 15 ngày) — báo TPVH`);
  if (r.mgmtPrice && r.listPrice && r.mgmtPrice > r.listPrice) out.push('Giá QL cao hơn giá niêm yết');
  if (r.lease && r.capacity && r.lease.occupants > r.capacity) out.push(`Số người (${r.lease.occupants}) vượt sức chứa (${r.capacity}) — cảnh báo, không chặn; phụ thu ở dòng Thu khác`);
  return out;
}

function render(ctx) {
  const r = find(ctx);
  if (!r) return { active: 'UI-05', ...crumbs(ctx, [[GROUP, null], ['Phòng', '/rooms'], [ctx.params.id]]), title: 'Không tìm thấy phòng', body: emptyState(`Không có phòng ${esc(ctx.params.id)}`, '', '—') };
  const s = ctx.state;
  const b = s.buildings.find((x) => x.id === r.buildingId);
  const scopeCtx = { buildingId: r.buildingId };
  const edit = ctx.can('room.edit', scopeCtx);
  const meters = s.meters.filter((m) => m.roomId === r.id);
  const elec = meters.find((m) => m.utility === 'điện'); const water = meters.find((m) => m.utility === 'nước');
  const hist = s.roomStatusHistory.filter((h) => h.roomId === r.id);
  const open = hist.find((h) => !h.to) || hist[hist.length - 1];
  const trans = transitionsFrom(r.status);
  const ws = warnings(r, ctx.today);
  const canCreate = r.status === 'Sẵn sàng' && ['Chuẩn bị', 'Đang khai thác'].includes(b.status) && r.listPrice && r.mgmtPrice;
  const priceRow = (kind, label) => `${r[kind] != null ? `<b>${vnd(r[kind])}</b>` : muted('Chưa nhập')} ${abtn({ text: 'Đổi', kind: 'ghost sm', ic: 'edit', act: 'price', data: { k: kind }, perm: edit })}${btn('Lịch sử', 'ghost sm', 'history', `data-action="price-history" data-k="${kind}"`)}`;
  const body = `
    ${pendBlock('Screen 05.3 chưa có capture verified', 'Bố cục dựng theo SRS và phác họa 5.2 của spec.')}
    ${ws.length ? alert('Cảnh báo', ws.join(' · '), 'warn') : ''}
    ${grid('1fr 1fr', [
    card(`${icon('coins', 16)} Giá — ba lớp`, dl([
      ['Giá niêm yết', priceRow('listPrice')],
      ['Giá QL (sàn)', priceRow('mgmtPrice')],
      ['Giá hiện tại', r.lease ? `<b>${vnd(r.lease.price)}</b> ${chip('khóa', 'lock', 'lock')}` : `${muted('Trống — phòng chưa có HĐ')} ${chip('khóa', 'lock', 'lock')}`],
    ], 1) + note('Giá niêm yết là mẫu số tính hiệu suất; giá QL là sàn; giá hiện tại chỉ đọc từ HĐ hiệu lực (BR-2.04.2). Đổi giá có ngày hiệu lực, giữ lịch sử (BR-2.04.4).')),
    card(`${icon('users', 16)} Sử dụng`, dl([
      ['Sức chứa', edit.ok ? `<input class="inline-in" name="capacity" value="${r.capacity ?? ''}" inputmode="numeric" maxlength="2" style="width:60px;text-align:right" data-blur="capacity" placeholder="—"/>` : (r.capacity ?? '—')],
      ['Đang ở', r.lease ? `${r.lease.occupants} người${r.lease.since ? ` · khách mới từ ${dateVN(r.lease.since)}` : ''}` : muted('0')],
      ['Trống từ', r.vacantFrom && vacancyType(r.status) ? dateVN(r.vacantFrom) : muted('—')],
      ['Sẵn sàng dự kiến', r.readyDate && r.status !== 'Đang thuê' ? dateVN(r.readyDate) : muted('—')],
      ['Loại trống (D-24)', vacancyType(r.status) || muted('Không tính trống')],
    ], 1)),
  ])}
    <div style="height:14px"></div>
    ${grid('1fr 1fr', [
    card(`${icon('package', 16)} Bàn giao`, `<p class="muted">Danh sách nội thất mặc định (tên, số lượng, tình trạng) — mẫu copy vào HĐ khách khi tạo HĐ.</p>${r.furniture?.length ? '' : `<p style="margin-top:8px">${muted('Chưa khai báo')} ${pend('cần capture để đặc tả thêm/sửa dòng')}</p>`}`),
    card(`${icon('gauge', 16)} Công tơ`, dl([
      ['Điện', elec ? `<span class="mono">${esc(elec.code)}</span> · CS ${vnd(elec.readings.slice(-1)[0]?.new)} (${vnd(elec.readings.slice(-1)[0]?.kwh)} kWh kỳ 09)` : `${r.lastReading != null ? `CS ${vnd(r.lastReading)} · ` : ''}${muted('chưa khai báo mã (FR10)')}`],
      ['Nước', r.hasWaterMeter ? `<b>CÓ đồng hồ</b> ${water ? `<span class="mono">${esc(water.code)}</span> · ${water.readings.slice(-1)[0]?.new} m³` : ''} → tính theo m³ (P-31)` : 'KHÔNG có đồng hồ → tính theo đầu người'],
    ], 1) + note('Công tơ phòng khai báo và chốt chỉ số ở UI-10.')),
  ])}
    ${card(`${icon('history', 16)} Trạng thái`, `<div class="kv-inline">${stChip(r.status)}${r.status === 'Đang thuê' ? chip('khóa · chỉ do kích hoạt HĐ đặt', 'lock', 'lock') : ''}
        <span>từ <b>${dateVN(open?.from || r.statusFrom)}</b></span><span class="muted">lý do: ${esc(open?.reason || '—')}</span></div>
      ${note('Lịch sử trạng thái là nguồn duy nhất cho thống kê lấp đầy và phòng trống. Mỗi lần đổi ghi từ – đến, lý do, người thực hiện.')}`,
    btn('Xem toàn bộ lịch sử trạng thái', 'ghost sm', 'arrowRight', 'data-action="status-history"'))}`;
  const transTip = !trans.length ? (r.status === 'Đang thuê' ? 'Phòng Đang thuê: kết thúc qua xác nhận HĐ sắp hết ở Work Queue (FR15) — không đổi tay' : 'Không có chuyển trạng thái hợp lệ') : '';
  return {
    active: 'UI-05', ...crumbs(ctx, [[GROUP, null], ['Phòng', '/rooms'], [r.id]]),
    title: `Chi tiết phòng ${r.id}`, status: stChip(r.status),
    subtitle: `Mã = số phòng ${esc(r.number)} + mã tòa ${esc(b.code)} (lưu 2 trường riêng) · <span class="bcl" data-nav="#/buildings/${b.id}" role="link" tabindex="0">Tòa ${esc(b.name)}</span> · tầng ${r.floor} · nguồn: ${esc(r.source === 'seed' ? 'Seed §6.1' : r.source)}`,
    actions: `${abtn({ text: 'Đổi trạng thái', ic: 'refresh', act: 'status-menu', perm: edit, disabled: !trans.length, tip: transTip })}${r.lease ? abtn({ text: 'Xem HĐ', ic: 'file', act: 'view-contract' }) : ''}${abtn({ text: 'Tạo HĐ', kind: 'primary', ic: 'plus', act: 'create-contract', disabled: !canCreate, tip: r.status !== 'Sẵn sàng' ? 'Chỉ tạo HĐ khi phòng Sẵn sàng' : 'Cần có giá niêm yết và giá QL' })}`,
    body,
  };
}

export default {
  render,
  actions: {
    'status-menu': (el, e, ctx) => {
      const r = find(ctx);
      openMenu(el, [{ header: `Từ ${r.status} — chỉ chuyển hợp lệ` }, ...transitionsFrom(r.status).map((t) => ({ label: `→ ${t.to}`, sub: t.label, act: t.to, disabled: !!t.blocked, tip: t.blocked || '' }))], async (it) => {
        const t = transitionsFrom(r.status).find((x) => x.to === it.act);
        const ok = await confirmModal({
          title: `${esc(r.id)}: ${r.status} → ${t.to}`, okLabel: t.label, okIc: 'check', width: 500,
          text: `<b>Tác động:</b> ${t.impact || ''} ${t.pending ? pend(t.pending) : ''} ${pend('Screen ## · popup chưa có capture')}`,
          reason: { label: 'Lý do', required: true, placeholder: 'Ví dụ: nghiệm thu sửa vòi nước' },
        });
        if (ok) ctx.tx((d, env) => applyTransition(d, env, r.id, t.to, ok.reason), `Đã chuyển ${r.id} → ${t.to}`);
      }, { width: 320 });
    },
    price: async (el, e, ctx) => {
      const r = find(ctx); const k = el.dataset.k;
      const res = await openModal({
        title: `${icon('coins', 18)} Đổi ${k === 'listPrice' ? 'giá niêm yết' : 'giá QL'} · ${r.id}`, width: 420,
        body: `${fieldBox('Giá mới (đ)', inp({ name: 'value', value: r[k] ? vnd(r[k]) : '', attrs: 'inputmode="numeric"' }), { req: true })}
          ${fieldBox('Hiệu lực từ', inp({ name: 'from', type: 'date', value: ctx.today }), { req: true, hint: 'Doanh thu niêm yết của kỳ dùng giá hiệu lực ngày cuối kỳ (BR-2.04.4)' })}`,
        buttons: [{ label: 'Hủy', act: 'cancel' }, { label: 'Lưu giá', act: 'ok', kind: 'primary', ic: 'check', enabledWhen: (d) => parseMoney(d.value) > 0 && d.from }],
      });
      if (res?.act === 'ok') ctx.tx((d, env) => setPrice(d, env, r.id, k, parseMoney(res.data.value), res.data.from), 'Đã lưu giá · giữ lịch sử');
    },
    'price-history': (el, e, ctx) => {
      const k = el.dataset.k;
      const rows = ctx.state.roomPriceHistory.filter((h) => h.roomId === ctx.params.id && h.kind === k).sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
      openModal({
        title: `${icon('history', 18)} Lịch sử ${k === 'listPrice' ? 'giá niêm yết' : 'giá QL'}`, sub: `${ctx.params.id} · ${pend('Screen ## · chưa có capture')}`, width: 460,
        body: rows.length ? table([{ h: 'Giá', num: 1 }, { h: 'Hiệu lực từ' }, { h: 'Người ghi' }], rows.map((h) => [vnd(h.value), dateVN(h.effectiveFrom), esc(h.by)]), { compact: 1 }) : '<p class="muted">Chưa có lịch sử.</p>',
        buttons: [{ label: 'Đóng', act: 'ok', kind: 'primary' }],
      });
    },
    capacity: (el, e, ctx) => {
      const r = find(ctx); const v = el.value.trim() === '' ? null : Number(el.value);
      if (v === r.capacity) return;
      setTimeout(() => { if (!ctx.tx((d, env) => setCapacity(d, env, r.id, v), 'Đã lưu sức chứa').ok) ctx.rerender(); }, 0);
    },
    'status-history': (el, e, ctx) => {
      const rows = ctx.state.roomStatusHistory.filter((h) => h.roomId === ctx.params.id);
      openModal({
        title: `${icon('history', 18)} Lịch sử trạng thái ${ctx.params.id}`, sub: `ROOM_STATUS_HISTORY · ${pend('Screen ## · chưa có capture')}`, width: 620,
        body: table([{ h: 'Trạng thái' }, { h: 'Từ' }, { h: 'Đến' }, { h: 'Lý do' }, { h: 'Người thực hiện' }], rows.map((h) => [stChip(h.status), dateVN(h.from), h.to ? dateVN(h.to) : muted('nay'), esc(h.reason), esc(h.by)]), { compact: 1 }),
        buttons: [{ label: 'Đóng', act: 'ok', kind: 'primary' }],
      });
    },
    'view-contract': () => notSpecified('FR05 · 05.3 · Xem HĐ', 'Chi tiết hợp đồng thuê thuộc FR07 — ngoài đợt này.'),
    'create-contract': () => notSpecified('FR05 · 05.3 · Tạo HĐ', 'Tạo HĐ thuê khách thuộc FR07/FR08 — ngoài đợt này.'),
  },
};
