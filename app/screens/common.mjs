// Helper dùng chung cho các màn cụm Nguồn nhà.
import { tabs, icon, chip, esc, table } from '../ui/shell.mjs';
import { dtVN } from '../core/format.mjs';
import { scopeBuildingIds } from '../core/auth.mjs';
import { muted } from '../ui/controls.mjs';

export const GROUP = 'Nguồn nhà & tòa/phòng';

/** items: [[label, path|null], …] (không gồm "Trang chủ"). Cấp cha dùng href có bộ lọc đã nhớ. */
export function crumbs(ctx, items) {
  return {
    breadcrumb: items.map((i) => i[0]),
    crumbHrefs: items.slice(0, -1).map((i) => (i[1] ? ctx.hrefWithMemory(i[1]) : null)),
  };
}

/** Tab theo ?tab=. list: [[key, label], …]; tab đầu là mặc định. */
export function qtabs(ctx, list) {
  const cur = list.findIndex(([k]) => k === ctx.query.tab);
  const idx = cur < 0 ? 0 : cur;
  return {
    key: list[idx][0],
    html: tabs(list.map((t) => t[1]), idx, list.map(([k]) => `data-action="tab" data-tab="${k}" role="tab" tabindex="0"`)),
  };
}

/** Tòa người dùng được xem (NVVH chỉ tòa được phân công). */
export function visibleBuildings(ctx) {
  const ids = scopeBuildingIds(ctx.state, ctx.today);
  return ctx.state.buildings.filter((b) => !ids || ids.has(b.id));
}

/** Bảng audit (tab Lịch sử — Common Rule 5). */
export function auditTable(entries) {
  if (!entries.length) return `<p class="muted" style="padding:12px 14px">Chưa có thay đổi nào được ghi nhận.</p>`;
  return table([{ h: 'Thời điểm' }, { h: 'Người thực hiện' }, { h: 'Hành động' }, { h: 'Trước → Sau' }, { h: 'Lý do' }], entries.map((a) => [
    dtVN(a.at), `${esc(a.actor || '—')}<br/><small class="muted">${esc(a.role || '')}</small>`, esc(a.action),
    `<small class="mono">${a.before ? esc(JSON.stringify(a.before)) : '—'}<br/>→ ${a.after ? esc(JSON.stringify(a.after)) : '—'}</small>`,
    a.reason ? esc(a.reason) : muted('—'),
  ]), { compact: 1 });
}

export const tabPending = (text = 'Tab chưa có capture — nội dung dựng từ SRS') => `<span class="pending-mark">${chip(`Cần xác nhận · ${text}`, 'assumed', 'alert')}</span>`;
export const spacer = '<div style="height:14px"></div>';
export const linkNav = (href, text) => `<span class="bcl" data-nav="${href}" role="link" tabindex="0" style="color:var(--pri)">${text} ${icon('chevronRight', 12)}</span>`;
