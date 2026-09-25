// Screen 02.1 — Danh sách chủ nhà (FR02).
import { chip, card, table, alert, kpi, grid, note, icon, esc, mask, btn } from '../ui/shell.mjs';
import { abtn, fsel, fsearch, pend, emptyState, paginate, pager, stChip, muted } from '../ui/controls.mjs';
import { openModal } from '../ui/modal.mjs';
import { landlordLabel, landlordBuildings, leasesOf, matchesKeyword } from '../core/domain/landlords.mjs';
import { roomCount } from '../core/domain/buildings.mjs';
import { addMonths } from '../core/format.mjs';
import { scopeBuildingIds } from '../core/auth.mjs';
import { crumbs, GROUP, visibleBuildings } from './common.mjs';

const SRC = { extraction: 'Trích xuất HĐ', manual: 'Tạo tay' };
const sourceText = (l) => (l.source?.kind === 'seed' ? l.source.note : SRC[l.source?.kind] || '—');
const bName = (b) => (b.status === 'Chuẩn bị' ? `${b.name} (ứng viên)` : (b.code || b.name));

function rowsFor(ctx) {
  const s = ctx.state;
  const scope = scopeBuildingIds(s, ctx.today);
  const q = ctx.query;
  const all = s.landlords
    .filter((l) => !scope || landlordBuildings(s, l).some((b) => scope.has(b.id)))
    .map((l) => ({ l, label: landlordLabel(s, l), buildings: landlordBuildings(s, l), leases: leasesOf(s, l.id) }));
  const soon = addMonths(ctx.today, 6);
  const list = all.filter(({ l, label, buildings, leases }) => (!q.type || l.type === q.type)
    && (!q.status || l.status === q.status)
    && (!q.missing || label === 'missing')
    && (!q.building || buildings.some((b) => b.id === q.building))
    && (!q.area || buildings.some((b) => b.area === q.area))
    && (!q.expiring || leases.some((h) => h.status === 'Hiệu lực' && h.endDate && h.endDate <= soon))
    && matchesKeyword(l, q.q));
  const rank = { draft: 0, missing: 1, active: 1, stopped: 2 };
  list.sort((a, b) => (rank[a.label] - rank[b.label]) || a.l.id.localeCompare(b.l.id));
  return { all, list };
}

function render(ctx) {
  const s = ctx.state; const q = ctx.query;
  const { all, list } = rowsFor(ctx);
  const drafts = all.filter((x) => x.label === 'draft').length;
  const missing = all.filter((x) => x.label === 'missing').length;
  const effective = s.headLeases.filter((h) => h.status === 'Hiệu lực');
  const draftLeases = s.headLeases.filter((h) => h.status === 'Nháp');
  const openJobs = s.extractionJobs.filter((j) => !j.committed);
  const pg = paginate(list, q.page);

  const kpiBox = (act, html, tip = '') => `<div ${act ? `data-action="${act}" role="button" tabindex="0" style="cursor:pointer"` : ''}${tip ? ` data-tip="${esc(tip)}"` : ''}>${html}</div>`;
  const kpis = `<div class="kpis" style="grid-template-columns:repeat(4,1fr)">
    ${kpiBox('', kpi('Chủ nhà', String(all.length), `${drafts} nháp từ trích xuất HĐ`, '', 'users'))}
    ${kpiBox('', kpi('HĐ đầu vào hiệu lực', String(effective.length), draftLeases.length ? `${draftLeases.map((h) => h.id).join(', ')} đang Nháp` : 'Không có HĐ Nháp', effective.length ? '' : 'warn', 'file'))}
    ${kpiBox('kpi-missing', kpi('Thiếu HĐ đầu vào', String(missing), q.missing ? 'Đang lọc · bấm để bỏ lọc' : 'Bấm để lọc danh sách', missing ? 'warn' : '', 'alert'))}
    ${kpiBox(openJobs.length ? 'kpi-job' : '', kpi('Job trích xuất đang mở', String(openJobs.length), openJobs[0] ? `${openJobs[0].id} · ${openJobs[0].step >= 2 ? 'chờ commit' : 'đang trích xuất'}` : 'Không có job mở', '', 'scan'))}
  </div>`;

  const bOpts = visibleBuildings(ctx).map((b) => [b.id, esc(b.code || b.name)]);
  const areas = [...new Set(s.buildings.map((b) => b.area).filter(Boolean))];
  const filters = `<div class="fbar">
    ${fsel('Loại', 'type', q.type, [['', 'Tất cả'], ['Cá nhân', 'Cá nhân'], ['Tổ chức', 'Tổ chức']])}
    ${fsel('Trạng thái', 'status', q.status, [['', 'Tất cả'], ['Hoạt động', 'Hoạt động'], ['Ngừng hoạt động', 'Ngừng hoạt động']])}
    ${fsel('Khu vực', 'area', q.area, [['', 'Tất cả'], ...areas.map((a) => [a, a])])}
    ${fsel('Tòa', 'building', q.building, [['', 'Tất cả'], ...bOpts])}
    ${fsel('HĐ sắp hết ≤ 6 tháng', 'expiring', q.expiring, [['', 'Không'], ['1', 'Có']])}
    ${fsearch('q', q.q, 'Tên, SĐT, CCCD/MST…')}
    ${q.missing ? chip('Chỉ chủ nhà thiếu HĐ', 'warn', 'filter') : ''}
    <div class="fr">${pend('Khu vực chưa có danh mục · lọc Nhóm T/S/G, Có HĐ hiệu lực chưa có trên capture')}${abtn({ text: 'Xuất', ic: 'download', act: 'export' })}</div>
  </div>`;

  const banner = missing || openJobs.length
    ? alert(missing ? `${missing} chủ nhà chưa có HĐ đầu vào` : `${openJobs.length} job trích xuất chưa commit`,
      'Cần upload HĐ chủ nhà để trích xuất đủ CCCD, SĐT, tòa và lịch trả; hệ thống không tự điền các trường còn trống.', 'warn')
    : '';

  const cols = [{ h: 'Mã' }, { h: 'Chủ nhà · loại' }, { h: 'SĐT' }, { h: 'CCCD/MST' }, { h: 'Tòa' }, { h: 'Số phòng', num: 1 }, { h: 'HĐ đầu vào' }, { h: 'Trạng thái' }, { h: 'Nguồn' }, { h: '' }];
  const rows = pg.rows.map(({ l, label, buildings, leases }) => {
    const rooms = buildings.reduce((n, b) => n + roomCount(s, b), 0);
    const lease = leases[leases.length - 1];
    const idv = l.idNo || l.taxCode;
    const r = [
      `<span class="mono" style="white-space:nowrap">${l.id}</span>`,
      `<b>${esc(l.name)}</b><br/><small class="muted">${l.type}</small>`,
      l.phone ? `<span class="mono">${mask(l.phone)}</span>` : muted('—'),
      idv ? `<span class="mono">${mask(idv)}</span>` : muted('—'),
      buildings.length ? buildings.map(bName).map(esc).join(', ') : muted('—'),
      rooms ? String(rooms) : '—',
      lease ? `${lease.id} · ${lease.status}` : '—',
      stChip(label),
      `<span class="muted">${esc(sourceText(l))}</span>`,
      btn('Mở', 'ghost sm', 'eye', `data-nav="#/landlords/${l.id}"`),
    ];
    if (label === 'draft') r._cls = 'hl';
    r._attrs = `data-href="#/landlords/${l.id}" tabindex="0"`;
    return r;
  });
  const empty = !all.length ? emptyState('Chưa có chủ nhà nào trong hệ thống') : emptyState('Không có chủ nhà khớp tìm kiếm / bộ lọc', 'Bấm biểu tượng đặt lại hoặc đổi tiêu chí.');
  const foot = `<span>CCCD, SĐT che theo quyền · “—” = chưa khai báo ${pend('cột Kỳ trả gần nhất, Cập nhật (spec) chưa có trên capture')}</span><span class="kv-inline">${pager(pg)}<span>${list.length} chủ nhà</span></span>`;
  const listCard = card('Danh sách chủ nhà', rows.length ? table(cols, rows, { foot }) : empty, list.length !== all.length || q.q ? abtn({ text: 'Đặt lại bộ lọc', kind: 'ghost sm', ic: 'refresh', act: 'reset-filters' }) : '', 'flush');

  const guides = grid('1fr 1fr', [
    card('Hai cách tạo chủ nhà', `<div class="dl c1">
      <div><dt>${icon('upload', 14)} Tạo từ HĐ chủ nhà (khuyến nghị)</dt><dd>Upload → trích xuất → review → commit</dd></div>
      <div><dt>${icon('plus', 14)} Tạo tay</dt><dd>Nhập Bên A, bổ sung HĐ sau</dd></div>
    </div>${note('Commit từ HĐ tạo cùng lúc: chủ nhà, HĐ đầu vào nháp, tòa ứng viên, tài liệu và tài sản bàn giao. Phòng tạo ở bước sau vì HĐ chủ nhà không có danh sách phòng.')}`),
    card('Chống trùng khi tạo', `<div class="dl c1">
      <div><dt>Khóa chống trùng</dt><dd>CCCD/MST → SĐT → Tên</dd></div>
      <div><dt>Trùng</dt><dd>Modal “Dùng bản ghi có sẵn / Vẫn tạo” · BR-2.01.2</dd></div>
      <div><dt>Xóa</dt><dd>Không xóa cứng · chỉ Ngừng hoạt động</dd></div>
    </div>`),
  ]);

  return {
    active: 'UI-02', ...crumbs(ctx, [[GROUP, null], ['Chủ nhà', '/landlords']]),
    title: 'Chủ nhà', status: chip(`${all.length} chủ nhà`, 'neutral', 'users'),
    subtitle: 'Danh sách chủ nhà · quan hệ tòa suy ra từ HĐ đầu vào (BR-2.01.4)',
    actions: `${abtn({ text: 'Chủ nhà', ic: 'plus', act: 'new', perm: ctx.can('landlord.create') })}${abtn({ text: 'Tạo từ HĐ chủ nhà', kind: 'primary', ic: 'upload', act: 'import', perm: ctx.can('extraction.run') })}`,
    body: `${kpis}${filters}${banner}${listCard}${guides}`,
  };
}

function exportCsv(ctx) {
  const { list } = rowsFor(ctx);
  const head = ['Mã', 'Chủ nhà', 'Loại', 'SĐT', 'CCCD/MST', 'Tòa', 'HĐ đầu vào', 'Trạng thái'];
  const esc2 = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [head, ...list.map(({ l, label, buildings, leases }) => [
    l.id, l.name, l.type, l.phone ? mask(l.phone) : '', (l.idNo || l.taxCode) ? mask(l.idNo || l.taxCode) : '',
    buildings.map(bName).join(', '), leases.map((h) => `${h.id} ${h.status}`).join(', '),
    { draft: 'Nháp · từ trích xuất', missing: 'Thiếu HĐ đầu vào', active: 'Hoạt động', stopped: 'Ngừng hoạt động' }[label],
  ])].map((r) => r.map(esc2).join(','));
  const url = URL.createObjectURL(new Blob([`﻿${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = `chu-nha_${ctx.today}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default {
  render,
  actions: {
    new: (el, e, ctx) => ctx.go('#/landlords/new'),
    import: (el, e, ctx) => ctx.go('#/landlords/import'),
    'kpi-missing': (el, e, ctx) => ctx.setQuery({ missing: ctx.query.missing ? undefined : '1', page: undefined }),
    'kpi-job': (el, e, ctx) => {
      const j = ctx.state.extractionJobs.find((x) => !x.committed);
      if (j) ctx.go(`#/landlords/import?job=${j.id}`);
    },
    'reset-filters': (el, e, ctx) => ctx.go('#/landlords', { replace: true }),
    export: async (el, e, ctx) => {
      const r = await openModal({
        title: `${icon('download', 18)} Xuất danh sách chủ nhà`, width: 460,
        body: `<p>Xuất <b>toàn bộ kết quả đang lọc</b> (${rowsFor(ctx).list.length} dòng). Dữ liệu nhạy cảm vẫn che theo quyền.</p>
          <p style="margin-top:8px">${chip('Cần xác nhận · định dạng xuất (CSV/XLSX?)', 'assumed', 'alert')}</p>`,
        buttons: [{ label: 'Hủy', act: 'cancel' }, { label: 'Tải CSV (tạm)', act: 'csv', kind: 'primary', ic: 'download' }],
      });
      if (r?.act === 'csv') exportCsv(ctx);
    },
  },
};
