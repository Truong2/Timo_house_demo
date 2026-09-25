// Menu "Hợp đồng đầu vào" — SRS chưa có màn danh sách riêng (route hiện là tab của chủ nhà). Trang tạm liệt kê mọi HĐ.
import { chip, card, table, vnd, esc } from '../ui/shell.mjs';
import { abtn, pendBlock, stChip, emptyState, muted } from '../ui/controls.mjs';
import { displayStatus } from '../core/domain/headLeases.mjs';
import { dateVN } from '../core/format.mjs';
import { crumbs, GROUP } from './common.mjs';

export default {
  render(ctx) {
    const s = ctx.state;
    const rows = s.headLeases.map((h) => {
      const l = s.landlords.find((x) => x.id === h.landlordId);
      const b = s.buildings.find((x) => x.id === h.allocations[0]?.buildingId);
      const r = [`<span class="mono">${h.id}</span>`, esc(l?.name || '—'), esc(b?.name || '—'), `${h.months} tháng`,
        h.startDate ? `${dateVN(h.startDate)} → ${dateVN(h.endDate)}` : muted('chưa có ngày'), `${vnd(h.rent)} đ/th`, stChip(displayStatus(h, ctx.today))];
      r._attrs = `data-href="#/head-leases/${h.id}" tabindex="0"`;
      return r;
    });
    return {
      active: 'UI-03', ...crumbs(ctx, [[GROUP, null], ['Hợp đồng đầu vào']]),
      title: 'Hợp đồng đầu vào', status: chip(`${s.headLeases.length} HĐ`, 'neutral', 'file'),
      subtitle: 'Route theo spec: #/landlords/:id?tab=head-leases · chi tiết #/head-leases/:id',
      actions: abtn({ text: 'Tạo từ HĐ chủ nhà', kind: 'primary', ic: 'upload', act: 'import', perm: ctx.can('extraction.run') }),
      body: `${pendBlock('SRS chưa có màn danh sách HĐ đầu vào độc lập', 'Menu “Hợp đồng đầu vào” (Common Rule 1) đang để đỏ. Trang này là danh sách tạm để đi tới Screen 03.2.')}
        ${card('Danh sách HĐ đầu vào', rows.length ? table([{ h: 'Mã' }, { h: 'Chủ nhà' }, { h: 'Tòa' }, { h: 'Thời hạn' }, { h: 'Từ → đến' }, { h: 'Tiền thuê', num: 1 }, { h: 'Trạng thái' }], rows) : emptyState('Chưa có HĐ đầu vào', 'Tạo bằng trích xuất HĐ chủ nhà (Screen 03.1).'), '', 'flush')}`,
    };
  },
  actions: { import: (el, e, ctx) => ctx.go('#/landlords/import') },
};
