// Màn ngoài phạm vi đợt này (menu khác cụm Nguồn nhà) và màn 403.
import { alert, card, chip, icon, esc } from '../ui/shell.mjs';
import { NAV } from '../ui/shell.mjs';
import { USERS } from '../core/auth.mjs';

const labelOf = (id) => NAV.flatMap((g) => g.items.map(([i, l]) => [i, l, g.group])).find(([i]) => i === id);

export const placeholder = {
  render(ctx) {
    const id = ctx.path === '/receivables' ? (ctx.query.tab === 'payments' ? 'UI-13' : 'UI-14')
      : ctx.path === '/expenses' ? (ctx.query.tab === 'allocation' ? 'UI-25' : 'UI-24')
      : (ctx.meta.uiId || ctx.params.id || (ctx.path === '/dashboard' ? 'UI-01' : ''));
    const hit = labelOf(id);
    const label = hit?.[1] || 'Không tìm thấy trang';
    return {
      active: id, breadcrumb: hit ? [hit[2], label] : ['Không tìm thấy'],
      title: label, status: chip('Chưa có trong đợt này', 'neutral', 'clock'),
      subtitle: hit ? `${id} · route chuẩn ${ctx.path} (spec §8)` : esc(ctx.path),
      body: `${alert('Màn này nằm ngoài phạm vi mockup đợt này', 'Đợt 0 đã thêm Đăng nhập (FR00) và giữ cụm Nguồn nhà & tòa/phòng (FR02–FR05). Các FR còn lại sẽ được chuyển dần theo kế hoạch.', 'info')}
        ${card(`${icon('arrowRight', 16)} Đi tới màn đã có`, `<div class="kv-inline">
          ${['#/landlords|Chủ nhà', '#/head-leases|Hợp đồng đầu vào', '#/buildings|Tòa nhà & hồ sơ', '#/rooms|Phòng'].map((x) => { const [h, t] = x.split('|'); return `<button class="btn outline" data-nav="${h}">${t}</button>`; }).join('')}
        </div>`)}`,
    };
  },
};

export const forbidden = {
  render(ctx) {
    const isSh = ctx.state.meta.role === 'shareholder';
    const perm = ctx.meta.perm ? ctx.can(ctx.meta.perm) : null;
    return {
      active: ctx.meta.menu, breadcrumb: ['Không có quyền truy cập'],
      title: 'Không có quyền truy cập', status: chip('403', 'danger', 'lock'),
      subtitle: `Vai trò hiện tại: ${USERS[ctx.state.meta.role].title}`,
      body: alert(isSh ? 'Cổ đông không truy cập chuỗi màn Nguồn nhà' : 'Vai trò hiện tại không được xem màn này',
        `${isSh ? 'Theo Authorization của FR02–FR05, cổ đông chỉ xem Report A, bảng cổ phần, vốn và lịch góp (FR29, FR31).' : esc(perm?.reason || '')} Đổi vai trò demo ở menu người dùng góc phải.`, 'danger'),
    };
  },
};
