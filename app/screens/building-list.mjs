// Screen 04.1 — Danh sách tòa nhà (FR04). Chưa có capture: bộ lọc và cột dựng từ SRS.
import { chip, card, table, esc } from '../ui/shell.mjs';
import { fsel, fsearch, pendBlock, emptyState, paginate, pager, stChip, muted } from '../ui/controls.mjs';
import { managerOf, roomsOf, roomCount, leasesOfBuilding, legalChecklist, classificationAt } from '../core/domain/buildings.mjs';
import { periodStatus } from '../core/domain/headLeases.mjs';
import { dateVN, fold } from '../core/format.mjs';
import { crumbs, GROUP, visibleBuildings } from './common.mjs';

function rows(ctx) {
  const s = ctx.state; const q = ctx.query;
  return visibleBuildings(ctx).map((b) => {
    const rs = roomsOf(s, b.id);
    const hl = leasesOfBuilding(s, b.id).slice(-1)[0];
    const l = hl && s.landlords.find((x) => x.id === hl.landlordId);
    const mgr = managerOf(s, b.id, ctx.today).current;
    const next = hl ? s.headLeasePaymentSchedule.filter((p) => p.headLeaseId === hl.id && periodStatus(p, ctx.today) !== 'Đã trả').sort((a, c) => a.dueDate.localeCompare(c.dueDate))[0] : null;
    const legal = legalChecklist(s, b);
    const pccc = legal.find((x) => x.type === 'Hồ sơ PCCC');
    const hkd = legal.find((x) => x.type === 'Giấy đăng ký hộ kinh doanh');
    const occupied = rs.filter((r) => r.status === 'Đang thuê').length;
    return { b, rs, hl, l, mgr, next, pccc, hkd, occupied, group: classificationAt(s, b.id, 'group', ctx.today), grade: classificationAt(s, b.id, 'grade', ctx.today) };
  }).filter((x) => (!q.status || x.b.status === q.status)
    && (!q.group || x.group === q.group) && (!q.grade || x.grade === q.grade)
    && (!q.landlord || x.l?.id === q.landlord) && (!q.manager || x.mgr?.employeeId === q.manager)
    && (!q.pccc || (q.pccc === 'yes' ? x.pccc.doc : !x.pccc.doc))
    && (!q.hkd || (q.hkd === 'yes' ? x.hkd.doc : !x.hkd.doc))
    && (!q.q || fold(x.b.code).includes(fold(q.q)) || fold(x.b.name).includes(fold(q.q)) || fold(x.b.address).includes(fold(q.q))));
}

export default {
  render(ctx) {
    const s = ctx.state; const q = ctx.query;
    const list = rows(ctx);
    const pg = paginate(list, q.page);
    const tr = pg.rows.map(({ b, rs, hl, l, mgr, next, pccc, occupied, group, grade }) => {
      const r = [
        b.codeLocked ? `<span class="mono b">${esc(b.code)}</span>` : `<span class="mono">${esc(b.codeSuggestion || '—')}</span> ${chip('chưa lưu mã', 'assumed')}`,
        `${esc(b.name)}${b.origin === 'extraction' && b.status === 'Chuẩn bị' ? ` ${chip('Chuẩn bị · từ HĐ', 'info', 'scan')}` : ''}${b.stub ? `<br/><small class="muted">Hồ sơ tối thiểu · Seed §12</small>` : ''}`,
        esc(b.area || '—'), group || grade ? `${group || '—'} · ${grade || '—'}` : muted('—'),
        String(roomCount(s, b)), rs.length ? `${occupied} / ${rs.length - occupied}` : muted('—'),
        mgr ? esc(mgr.employee.name) : muted('Chưa phân công'),
        hl ? `<span class="mono">${hl.id}</span>${l ? `<br/><small class="muted">${esc(l.name)}</small>` : ''}` : muted(b.seedRent ? 'Seed §4 không có HĐ' : '—'),
        next ? dateVN(next.dueDate) : muted('—'),
        pccc.doc ? stChip(pccc.verify) : chip('Chưa có', 'warn'),
        stChip(b.status),
      ];
      r._attrs = `data-href="#/buildings/${b.id}" tabindex="0"`;
      return r;
    });
    const landlords = s.landlords.filter((l) => s.headLeases.some((h) => h.landlordId === l.id));
    const filters = `<div class="fbar">
      ${fsel('Trạng thái', 'status', q.status, [['', 'Tất cả'], ['Chuẩn bị', 'Chuẩn bị'], ['Đang khai thác', 'Đang khai thác'], ['Ngừng khai thác', 'Ngừng khai thác']])}
      ${fsel('Nhóm', 'group', q.group, [['', 'Tất cả'], ['T', 'T'], ['S', 'S'], ['G', 'G']])}
      ${fsel('Hạng', 'grade', q.grade, [['', 'Tất cả'], ['L1', 'L1'], ['L2', 'L2'], ['L3', 'L3']])}
      ${fsel('Chủ nhà', 'landlord', q.landlord, [['', 'Tất cả'], ...landlords.map((l) => [l.id, esc(l.name)])])}
      ${fsel('Quản lý', 'manager', q.manager, [['', 'Tất cả'], ...s.employees.map((e) => [e.id, esc(e.name)])])}
      ${fsel('PCCC', 'pccc', q.pccc, [['', 'Tất cả'], ['yes', 'Có hồ sơ'], ['no', 'Chưa có']])}
      ${fsel('HKD', 'hkd', q.hkd, [['', 'Tất cả'], ['yes', 'Có giấy'], ['no', 'Chưa có']])}
      ${fsearch('q', q.q, 'Mã, tên, địa chỉ tòa…')}
    </div>`;
    return {
      active: 'UI-04', ...crumbs(ctx, [[GROUP, null], ['Tòa nhà', '/buildings']]),
      title: 'Tòa nhà', status: chip(`${visibleBuildings(ctx).length} tòa`, 'neutral', 'building'),
      subtitle: 'Tạo tòa: commit trích xuất HĐ chủ nhà (chính) · tạo tay · import',
      body: `${pendBlock('Screen 04.1 chưa có capture', 'Bộ lọc và cột dựng theo SRS; bộ lọc tỷ lệ lấp đầy và khu vực chờ danh mục.')}${filters}
        ${card('Danh sách tòa nhà', tr.length ? table([{ h: 'Mã' }, { h: 'Tên' }, { h: 'Khu vực' }, { h: 'Nhóm · hạng' }, { h: 'Tổng phòng', num: 1 }, { h: 'Thuê / trống', num: 1 }, { h: 'Quản lý tại kỳ' }, { h: 'HĐ đầu vào' }, { h: 'Hạn gần nhất' }, { h: 'PCCC' }, { h: 'Trạng thái' }], tr, { foot: `<span>Quản lý đọc từ phân công phụ trách chính (BR-2.03.1)</span><span class="kv-inline">${pager(pg)}<span>${list.length} tòa</span></span>` }) : emptyState('Không có tòa khớp bộ lọc'), '', 'flush')}`,
    };
  },
};
