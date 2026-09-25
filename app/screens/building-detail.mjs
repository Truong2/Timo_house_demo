// Screen 04.2 — Chi tiết tòa nhà (FR04): case Chuẩn bị (04.2.1) và Đang khai thác (04.2.2) trong một màn.
import { chip, btn, card, table, alert, dl, grid, note, icon, vnd, esc, kpi } from '../ui/shell.mjs';
import { abtn, pend, pendBlock, stChip, muted, notSpecified, emptyState, fieldBox, inp, sel } from '../ui/controls.mjs';
import { openModal, confirmModal } from '../ui/modal.mjs';
import {
  GROUPS, GRADES, AMENITIES, managerOf, classificationAt, roomsOf, leasesOfBuilding, legalChecklist, transitionBlockers,
  saveCode, setBasics, transition, setClassification, setAccount, setAmenity, setReadingDay, assignManager, verifyDocument,
} from '../core/domain/buildings.mjs';
import { displayStatus } from '../core/domain/headLeases.mjs';
import { dateVN, dtVN } from '../core/format.mjs';
import { crumbs, GROUP, qtabs, auditTable, tabPending, spacer } from './common.mjs';
import { docUploadPopup } from './popups/document-upload.mjs';

const find = (ctx) => ctx.state.buildings.find((b) => b.id === ctx.params.id);
const REG = { 'Chưa có': chip('Chưa có', 'warn'), 'Có file': chip('Có file', 'ok'), 'Đã đăng ký (theo tài liệu)': chip('Đã đăng ký (theo tài liệu)', 'info', 'check'), 'Làm sau': chip('Làm sau', 'neutral', 'clock') };
const VER = (v) => (!v ? '—' : v === 'Chờ xác minh' ? chip('Chờ', 'neutral') : stChip(v));

function basics(ctx, b) {
  const edit = ctx.can('building.edit', { buildingId: b.id });
  const prep = b.status === 'Chuẩn bị';
  const fromHD = b.origin === 'extraction';
  const emptyTag = chip(fromHD ? 'Trống trên HĐ' : 'Chưa nhập', 'warn');
  const L = ctx.local;
  let code;
  if (b.codeLocked) code = fieldBox('Mã tòa (bất biến sau khi lưu)', `<span class="mono b">${esc(b.code)}</span>`, { cls: 'ro', extra: chip('Đã khóa', 'lock', 'lock') });
  else {
    const v = L.code ?? b.codeSuggestion ?? '';
    code = fieldBox('Mã tòa (bất biến sau khi lưu)', inp({ name: 'code', value: v, attrs: `class="bare mono b" maxlength="10" data-input="code-input" ${edit.ok ? '' : 'disabled'}` }),
      { extra: `${v && v === b.codeSuggestion ? chip('Ví dụ · người review đặt', 'assumed') : ''}${abtn({ text: 'Lưu mã', kind: 'outline sm', ic: 'lock', act: 'save-code', perm: edit })}`, err: L.codeErr || '', hint: `Chữ không dấu và số, tối đa 10 ký tự ${pend('ký tự cho phép, max length, mã lỗi trùng')}` });
  }
  const num = (label, name, v, attrs) => fieldBox(label, edit.ok ? inp({ name, value: v ?? '', attrs: `${attrs} data-blur="save-basic"` }) : `<span>${v ?? '—'}</span>`,
    { cls: v == null ? 'err' : (edit.ok ? '' : 'ro'), extra: v == null ? emptyTag : '' });
  const addr = fieldBox('Địa chỉ', esc(b.address || '—'), { cls: 'ro', extra: b.addressSource ? `<span data-action="addr-src" role="button" tabindex="0">${chip(b.addressSource, 'info', 'link')}</span>` : '' });
  return card(`${icon('building', 16)} ② Cơ bản`, `
    ${code}${addr}
    ${!prep ? `<div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
      ${fieldBox('Tên tòa', esc(b.name), { cls: 'ro' })}${fieldBox('Khu vực', b.area ? esc(b.area) : muted(`Chưa khai báo ${pend('danh mục khu vực')}`), { cls: 'ro' })}</div>` : ''}
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
      ${num('Số tầng', 'floors', b.floors, 'inputmode="numeric" maxlength="2"')}
      ${num('Diện tích sàn (m²)', 'floorArea', b.floorArea, 'inputmode="decimal" maxlength="16"')}
      ${fieldBox('Kết cấu', esc(b.structure || '—'), { cls: 'ro' })}
      ${fieldBox('Mục đích', esc(b.purpose || '—'), { cls: 'ro' })}
    </div>`);
}

function classification(ctx, b) {
  const s = ctx.state;
  const prep = b.status === 'Chuẩn bị';
  const edit = ctx.can('building.edit', { buildingId: b.id });
  const m = managerOf(s, b.id, ctx.today);
  const hl = leasesOfBuilding(s, b.id).slice(-1)[0];
  const l = hl && s.landlords.find((x) => x.id === hl.landlordId);
  const acct = sel({ name: 'account', value: b.customerAccountId || '', placeholder: 'Chọn TK mặc định của tòa', options: s.companyAccounts.map((a) => [a.id, a.label]), attrs: `data-change="set-account" style="text-align:right;flex:none" ${edit.ok ? '' : 'disabled'}` });
  const cls = (attr, list) => {
    const v = classificationAt(s, b.id, attr, ctx.today);
    return `${sel({ name: attr, value: v || '', options: list, attrs: `data-change="set-class" style="text-align:right;flex:none;font-weight:500" ${edit.ok ? '' : 'disabled'}` })} ${btn('', 'ghost sm', 'history', `data-action="class-history" data-attr="${attr}" aria-label="Lịch sử" data-tip="Lịch sử ${attr === 'group' ? 'Nhóm' : 'Hạng'}"`)}${attr === 'grade' && b.gradeIllustrative ? pend('L2 minh họa') : ''}`;
  };
  const mgr = m.current ? `${esc(m.current.employee.name)} <small class="muted">từ ${dateVN(m.current.from)}</small>` : muted('Chưa phân công (UI-20)');
  const upcoming = m.upcoming ? ` ${chip(`sắp tới: ${m.upcoming.employee.name} · ${dateVN(m.upcoming.from)}`, 'info', 'clock')}` : '';
  const rent = hl ? `${vnd(hl.rent)} đ/tháng` : (b.seedRent ? `${vnd(b.seedRent)} đ/tháng <small class="muted">(Seed §4)</small>` : muted('—'));
  const day = edit.ok ? `<input class="inline-in" name="readingDay" value="${b.meterReadingDay}" inputmode="numeric" maxlength="2" style="width:56px;text-align:right" data-blur="set-day"/>` : String(b.meterReadingDay);
  return card(`${icon('layers', 16)} ③ Phân loại · ⑤ Thu tiền`, dl([
    ['Nhóm T/S/G', prep ? muted('Chọn khi kích hoạt · lịch sử riêng') : cls('group', GROUPS)],
    ['Hạng L1–L3', prep ? muted('Chọn khi kích hoạt · lịch sử riêng') : cls('grade', GRADES)],
    ['Quản lý phụ trách', mgr + upcoming],
    ['Chủ nhà · HĐ đầu vào', hl ? `<span class="bcl" data-nav="#/head-leases/${hl.id}" role="link" tabindex="0">${esc(l?.name || '')} · ${hl.id} (${displayStatus(hl, ctx.today)})</span>` : `${muted('—')}${b.seedRent ? pend('Seed §4 không có HĐ đầu vào') : ''}`],
    ['Tiền thuê đầu vào', rent],
    ['TK nhận tiền khách', acct],
    ...(prep ? [] : [['Mẫu in hóa đơn', b.invoiceTemplate ? esc(b.invoiceTemplate) : muted('—')]]),
    ['Ngày chốt chỉ số', day],
  ], 1));
}

function amenities(ctx, b) {
  const edit = ctx.can('building.edit', { buildingId: b.id });
  return card(`${icon('settings', 16)} ④ Tiện ích ${b.amenitiesIllustrative ? pend('minh họa theo phác họa 4.2') : ''}`, `<div class="kv-inline">
    ${AMENITIES.map(([k, label]) => `<label class="chk"><input type="checkbox" name="am-${k}" data-change="amenity" data-k="${k}" ${b.amenities?.[k] ? 'checked' : ''} ${edit.ok ? '' : 'disabled'}/> ${label}</label>`).join('')}
    </div>${note('Bỏ tick thang máy → dịch vụ thang máy bị chặn ở HĐ (validate ở UI-09/UI-07, BR-2.03.9).')}`);
}

function meters(ctx, b) {
  const ms = ctx.state.meters.filter((m) => m.buildingId === b.id && m.kind !== 'ROOM');
  if (b.status === 'Chuẩn bị' || ms.some((m) => !m.code)) {
    return card(`${icon('gauge', 16)} ⑥ Công tơ cấp tòa — từ phụ lục bàn giao`, (ms.length ? table([{ h: 'Phụ lục' }, { h: 'Loại' }, { h: 'Mã' }, { h: 'Chỉ số bàn giao' }], ms.map((m) => [
      esc(m.sourceRef || '—'), `${m.kind} · ${m.utility}`, m.code ? `<span class="mono">${esc(m.code)}</span>` : muted('Chờ nhập'), m.handoverReading ?? muted('Chờ nhập'),
    ]), { compact: 1 }) : emptyState('Chưa có công tơ cấp tòa', '', '—')) + `<div style="padding:0 14px 12px">${note('Công tơ tổng chỉ đối chiếu hóa đơn NCC, KHÔNG lên hóa đơn khách. Công tơ khu vực chung (COMMON) khai báo riêng khi có.')} ${pend('cách nhập mã & chỉ số bàn giao (tại dòng hay ở FR10)')}</div>`, '', 'flush');
  }
  const main = ms.find((m) => m.kind === 'MAIN'); const common = ms.find((m) => m.kind === 'COMMON');
  const frame = (title, body, tone) => `<div style="border:1px solid ${tone};border-radius:8px;padding:10px 12px;margin-bottom:10px"><b style="display:flex;gap:6px;align-items:center">${icon('zap', 14)} ${title}</b>${body}</div>`;
  return card(`${icon('gauge', 16)} ⑥ Công tơ cấp tòa — hai loại, KHÔNG gộp`, `
    ${main ? frame(`MAIN · ${esc(main.code)} · ${vnd(main.unitPrice)} đ/kWh`, `<p class="muted" style="margin-top:4px">Kỳ 09: ${vnd(main.readings[0]?.kwh)} kWh × ${vnd(main.unitPrice)} = <b>${vnd((main.readings[0]?.kwh || 0) * main.unitPrice)}</b> · chỉ đối chiếu NCC + thất thoát</p><p style="margin-top:2px"><b class="neg">KHÔNG lên hóa đơn khách, KHÔNG chia cho phòng</b></p>`, '#BFDBFE') : ''}
    ${common ? frame(`COMMON · ${esc(common.code)} · ${vnd(common.unitPrice)} đ/kWh`, `<p class="muted" style="margin-top:4px">Chia theo SỐ NGƯỜI → dòng 12 của hóa đơn phòng</p>${table([{ h: 'Cụm phòng' }, { h: 'CS cũ → mới' }, { h: 'kWh', num: 1 }, { h: 'Người', num: 1 }, { h: 'Đơn giá/người', num: 1 }], common.readings.map((r) => [esc(r.group), r.old != null ? `${vnd(r.old)} → ${vnd(r.new)}` : muted('—'), vnd(r.kwh, 1), r.people ?? '—', r.perPerson ? vnd(r.perPerson, 2, true) : muted(esc(r.note || '—'))]), { compact: 1 })}`, '#FDE68A') : ''}
    ${note('Gộp nhầm MAIN và COMMON là lỗi phổ biến nhất khi dựng hóa đơn (D-03, D-18, BR-2.03.5).')}`);
}

function legal(ctx, b) {
  const rows = legalChecklist(ctx.state, b).map((r) => [r.short, REG[r.reg], VER(r.verify),
    `${esc(r.basis)}${r.doc?.expiryDate ? ` · hết hạn ${dateVN(r.doc.expiryDate)}` : ''}${r.doc?.illustrative ? pend('minh họa') : ''}`]);
  return card(`${icon('shield', 16)} ⑦ Hồ sơ pháp lý`, table([{ h: 'Loại' }, { h: 'Đăng ký' }, { h: 'Xác minh' }, { h: 'Căn cứ' }], rows, { compact: 1 }),
    abtn({ text: 'Tải tài liệu', kind: 'outline sm', ic: 'upload', act: 'upload', perm: ctx.can('building.upload') }), 'flush');
}

function report(ctx, b) {
  const snap = ctx.state.reportSnapshots.find((x) => x.buildingId === b.id && x.locked);
  if (!snap) return card(`${icon('chart', 16)} ⑧ Chỉ số từ báo cáo`, `<p class="muted">Chưa có kỳ đã khóa${b.status === 'Chuẩn bị' ? ' — tòa ở trạng thái Chuẩn bị' : ''}. Chỉ số hiệu suất và lợi nhuận hiện sau kỳ đầu tiên được khóa, không tính realtime.</p>`);
  return card(`${icon('chart', 16)} ⑧ Chỉ số từ báo cáo — kỳ ${snap.period} (đã khóa)`, `<div class="kpis" style="grid-template-columns:repeat(3,1fr);margin-bottom:0">
    ${kpi('Doanh thu', vnd(snap.revenue), 'Report A', '', 'coins')}${kpi('LN ròng', vnd(snap.netProfit), 'Report A', 'ok', 'chart')}${kpi('Phòng trống · mới · phá', `${snap.vacant} · ${snap.newRooms} · ${snap.broken}`, 'tại ngày cuối kỳ', '', 'layers')}
    </div>${note('Đọc REPORT_SNAPSHOT kỳ Locked gần nhất, không tính realtime (BR-2.03.7 → X-07).')}`, chip(`kỳ ${snap.period}`, 'lock', 'lock'));
}

function transitionCard(ctx, b) {
  const { hard, soft } = transitionBlockers(ctx.state, b, ctx.today);
  const perm = ctx.can('building.transition');
  return card(`${icon('arrowRight', 16)} Chuyển Chuẩn bị → Đang khai thác ${pend('vị trí nút & popup · điều kiện ASSUMED 1.9')}`, `
    <ul style="list-style:none;display:grid;gap:4px">
      ${[['HĐ đầu vào Hiệu lực', 'HĐ đầu vào'], ['Có ít nhất 1 phòng', 'chưa có phòng'], ['Có quản lý phụ trách chính', 'chưa có quản lý'], ['Có TK nhận tiền khách mặc định', 'chưa chọn TK']].map(([c, key]) => {
    const bad = hard.some((h) => h.startsWith(key));
    return `<li>${bad ? `<span class="neg">${icon('x', 13)}</span>` : `<span class="pos">${icon('check', 13)}</span>`} ${c}</li>`;
  }).join('')}
      <li><span class="muted">${icon('info', 13)}</span> Nhóm T/S/G và Hạng L1–L3 xác nhận trong popup chuyển trạng thái</li>
      ${soft.map((x) => `<li><span class="wtx">${icon('alert', 13)}</span> ${x} ${pend('có bắt buộc trước khi chuyển không?')}</li>`).join('')}
    </ul>`, abtn({ text: 'Chuyển Đang khai thác', kind: 'primary sm', ic: 'check', act: 'transition', perm, disabled: hard.length > 0, tip: hard.length ? `Còn thiếu: ${hard.join(' · ')}` : '' }));
}

function overview(ctx, b) {
  const prep = b.status === 'Chuẩn bị';
  const top = prep && b.origin === 'extraction'
    ? alert('Tòa ứng viên từ HĐ chủ nhà', 'Chỉ địa chỉ, kết cấu, mục đích và phạm vi có trên HĐ. Số tầng, diện tích sàn và GCN để trống trên mẫu — bổ sung trước khi chuyển Đang khai thác.', 'info')
    : (b.stub ? alert('Hồ sơ tối thiểu', 'Tòa lấy từ Seed §12 (chủ HĐ điện) — chưa có HĐ đầu vào và phòng trong mockup.', 'info') : '');
  const ro = b.status === 'Ngừng khai thác' ? alert('Tòa đã ngừng khai thác', 'Chỉ đọc dữ liệu lịch sử.', 'warn') : '';
  return `${top}${ro}${grid('1fr 1fr', [basics(ctx, b), classification(ctx, b)])}${spacer}
    ${prep ? '' : `${amenities(ctx, b)}`}
    ${grid(prep ? '1fr 1.25fr' : '1.1fr 1fr', [meters(ctx, b), legal(ctx, b)])}
    ${report(ctx, b)}${prep ? transitionCard(ctx, b) : ''}`;
}

function roomsTab(ctx, b) {
  const rs = roomsOf(ctx.state, b.id);
  const rows = rs.map((r) => {
    const t = [`<span class="mono">${r.id}</span>`, String(r.floor), esc(r.type), r.capacity ?? '—', vnd(r.listPrice), vnd(r.mgmtPrice), stChip(r.status)];
    t._attrs = `data-href="#/rooms/${r.id}" tabindex="0"`;
    return t;
  });
  return card(`Phòng của tòa ${tabPending()}`, rows.length ? table([{ h: 'Mã phòng' }, { h: 'Tầng', num: 1 }, { h: 'Loại' }, { h: 'Sức chứa', num: 1 }, { h: 'Niêm yết', num: 1 }, { h: 'Giá QL', num: 1 }, { h: 'Trạng thái' }], rows, { compact: 1 }) : emptyState('Chưa có phòng', 'HĐ chủ nhà không có danh sách phòng — tạo ở UI-05.', '—'),
    abtn({ text: 'Tạo phòng', kind: 'outline sm', ic: 'plus', act: 'create-rooms', perm: ctx.can('room.create', { buildingId: b.id }), disabled: !b.codeLocked, tip: 'Lưu mã tòa trước khi tạo phòng' }), 'flush');
}

function assignTab(ctx, b) {
  const s = ctx.state;
  const rows = s.buildingAssignments.filter((a) => a.buildingId === b.id).map((a) => [esc(s.employees.find((e) => e.id === a.employeeId)?.name || a.employeeId), a.role, `${dateVN(a.from)} → ${a.to ? dateVN(a.to) : 'nay'}`, a.simulated ? chip('mô phỏng FR20', 'assumed') : '']);
  return card(`Phân công ${tabPending()}`, rows.length ? table([{ h: 'Nhân sự' }, { h: 'Vai trò' }, { h: 'Hiệu lực' }, { h: '' }], rows, { compact: 1 }) : emptyState('Chưa phân công', '', '—'),
    abtn({ text: 'Phân công', kind: 'outline sm', ic: 'users', act: 'assign', perm: ctx.can('building.assign') }), 'flush');
}

function docsTab(ctx, b) {
  const docs = ctx.state.documents.filter((d) => d.links.buildingId === b.id).sort((x, y) => x.type.localeCompare(y.type) || y.version - x.version);
  const vp = ctx.can('document.verify');
  const up = ctx.can('building.upload');
  const rows = docs.map((d) => [esc(d.type), esc(d.fileName || '—'), `v${d.version}${d.superseded ? ` ${chip('đã thay', 'neutral')}` : ''}`, stChip(d.verifyStatus),
    `${esc(d.uploadedBy)} · ${dtVN(d.uploadedAt)}`,
    d.superseded ? '' : `${d.verifyStatus !== 'Đã xác minh' ? abtn({ text: 'Xác minh', kind: 'ghost sm', ic: 'check', act: 'verify', data: { d: d.id }, perm: vp }) : ''}${abtn({ text: 'Thay thế', kind: 'ghost sm', ic: 'refresh', act: 'replace', data: { d: d.id }, perm: up })}`]);
  return card(`Tài liệu ${tabPending()} ${pend('action Xác minh / Thay thế dự kiến')}`, rows.length ? table([{ h: 'Loại' }, { h: 'File' }, { h: 'Version' }, { h: 'Xác minh' }, { h: 'Tải lúc' }, { h: '' }], rows, { compact: 1 }) : emptyState('Chưa có tài liệu', '', '—'),
    abtn({ text: 'Tải tài liệu', kind: 'outline sm', ic: 'upload', act: 'upload', perm: up }), 'flush');
}

function render(ctx) {
  const b = find(ctx);
  if (!b) return { active: 'UI-04', ...crumbs(ctx, [[GROUP, null], ['Tòa nhà', '/buildings'], [ctx.params.id]]), title: 'Không tìm thấy tòa', body: emptyState(`Không có tòa ${esc(ctx.params.id)}`, '', '—') };
  const s = ctx.state;
  const rs = roomsOf(s, b.id);
  const ms = s.meters.filter((m) => m.buildingId === b.id && m.kind !== 'ROOM');
  const assets = s.assets.filter((a) => a.buildingId === b.id);
  const hl = leasesOfBuilding(s, b.id).slice(-1)[0];
  const l = hl && s.landlords.find((x) => x.id === hl.landlordId);
  const m = managerOf(s, b.id, ctx.today).current;
  const t = qtabs(ctx, [['overview', 'Tổng quan'], ['rooms', `Phòng (${rs.length})`], ['assign', 'Phân công'], ['prices', 'Giá DV'], ['meters', `Công tơ (${ms.length})`], ['source', 'HĐ nguồn'], ['assets', `Tài sản (${assets.length})`], ['report', 'Báo cáo'], ['docs', 'Tài liệu'], ['history', 'Lịch sử']]);
  const body = {
    overview: () => overview(ctx, b),
    rooms: () => roomsTab(ctx, b),
    assign: () => assignTab(ctx, b),
    prices: () => card(`Dịch vụ & bảng giá ${tabPending()}`, `<p>Bảng giá dịch vụ theo tòa thuộc <b>FR09</b> — ngoài đợt này.</p><p style="margin-top:8px"><button class="btn outline" data-nav="#/soon/UI-09">Mở màn Bảng giá dịch vụ</button></p>`),
    meters: () => meters(ctx, b),
    source: () => card(`HĐ nguồn ${tabPending()}`, hl ? table([{ h: 'HĐ' }, { h: 'Chủ nhà' }, { h: 'Tiền thuê', num: 1 }, { h: 'Trạng thái' }], leasesOfBuilding(s, b.id).map((h) => { const r = [`<span class="mono">${h.id}</span>`, esc(s.landlords.find((x) => x.id === h.landlordId)?.name || ''), vnd(h.rent), stChip(displayStatus(h, ctx.today))]; r._attrs = `data-href="#/head-leases/${h.id}" tabindex="0"`; return r; })) : emptyState('Chưa có HĐ đầu vào', b.seedRent ? 'Seed §4 chỉ có tiền thuê 48.000.000 đ/tháng.' : '', '—'), '', 'flush'),
    assets: () => card(`Tài sản bàn giao của chủ nhà ${tabPending()}`, assets.length ? table([{ h: 'Nhóm' }, { h: 'STT', num: 1 }, { h: 'Tên tài sản' }, { h: 'Số lượng', num: 1 }, { h: 'Sở hữu' }, { h: 'Trạng thái' }], assets.map((a) => [a.group, a.stt, esc(a.name), a.qty ?? muted('trống'), a.ownership, chip(a.status, 'neutral', 'clock')]), { compact: 1, foot: '<span>Phụ lục I · không khấu hao · số lượng trống trên mẫu (bắt buộc bổ sung) · quản lý ở UI-27</span><span></span>' }) : emptyState('Chưa có tài sản', '', '—'), '', 'flush'),
    report: () => report(ctx, b),
    docs: () => docsTab(ctx, b),
    history: () => card(`Lịch sử ${tabPending()}`, auditTable(s.audit.filter((a) => a.entityId === b.id)), '', 'flush'),
  }[t.key]();

  const prep = b.status === 'Chuẩn bị';
  const stopped = b.status === 'Ngừng khai thác';
  const up = abtn({ text: 'Thêm tài liệu', ic: 'upload', act: 'upload', perm: ctx.can('building.upload') });
  const as = abtn({ text: 'Phân công', kind: prep ? 'outline' : 'primary', ic: 'users', act: 'assign', perm: ctx.can('building.assign') });
  const actions = stopped ? '' : prep
    ? `${up}${as}${abtn({ text: 'Tạo phòng', kind: 'primary', ic: 'plus', act: 'create-rooms', perm: ctx.can('room.create', { buildingId: b.id }), disabled: !b.codeLocked, tip: 'Lưu mã tòa trước khi tạo phòng (BR-2.03.3)' })}`
    : `${abtn({ text: 'Sửa', ic: 'edit', act: 'edit', perm: ctx.can('building.edit', { buildingId: b.id }) })}${up}${as}`;
  const grp = classificationAt(s, b.id, 'group', ctx.today); const grd = classificationAt(s, b.id, 'grade', ctx.today);
  const subtitle = prep
    ? `${esc(b.scope || '—')} · chủ nhà ${esc(l?.name || '—')} · HĐ ${hl?.id || '—'} · ${rs.length} phòng`
    : `Nhóm ${grp || '—'} · Hạng ${grd || '—'}${b.gradeIllustrative ? ' (minh họa)' : ''} · ${rs.length || b.seedRoomCount || 0} phòng · QL: ${m ? esc(m.employee.name) : 'chưa phân công'}`;
  return {
    active: 'UI-04', ...crumbs(ctx, [[GROUP, null], ['Tòa nhà', '/buildings'], [esc(b.name)]]),
    title: esc(b.name), status: stChip(b.status), subtitle, actions,
    body: `${t.html}${body}`,
  };
}

export default {
  render,
  actions: {
    'code-input': (el, e, ctx) => { ctx.local.code = el.value.toUpperCase(); ctx.local.codeErr = ''; },
    'save-code': async (el, e, ctx) => {
      const b = find(ctx);
      const v = String(ctx.local.code ?? b.codeSuggestion ?? '').trim().toUpperCase();
      const ok = await confirmModal({ title: `Lưu mã tòa ${esc(v)}?`, text: `Mã tòa <b>bất biến sau khi lưu</b> vì là khóa của mã phòng (BR-2.03.3). Phòng sẽ có mã dạng <span class="mono">101${esc(v)}</span>.`, okLabel: 'Lưu mã', okIc: 'lock' });
      if (!ok) return;
      const r = ctx.tx((d, env) => saveCode(d, env, b.id, v), `Đã lưu mã ${v}`);
      if (!r.ok) { ctx.local.codeErr = r.error.message; ctx.rerender(); } else delete ctx.local.code;
    },
    'save-basic': (el, e, ctx) => {
      const b = find(ctx);
      const raw = el.value.trim();
      const val = raw === '' ? null : Number(raw.replace(',', '.'));
      if (b[el.name] === val) return;
      // setTimeout: để focus kịp sang ô kế tiếp trước khi render lại (giữ focus theo name)
      setTimeout(() => { if (!ctx.tx((d, env) => setBasics(d, env, b.id, { [el.name]: val }), 'Đã lưu hồ sơ tòa').ok) ctx.rerender(); }, 0);
    },
    'addr-src': () => notSpecified('FR04 · 04.2 · nhãn Đ.1', 'Dự kiến mở vùng Điều 1 trên file HĐ gốc.'),
    'set-account': (el, e, ctx) => { if (el.value) ctx.tx((d, env) => setAccount(d, env, ctx.params.id, el.value, env.today), 'Đã đặt TK nhận tiền khách mặc định'); },
    'set-day': (el, e, ctx) => {
      const b = find(ctx); const v = Number(el.value);
      if (v === b.meterReadingDay) return;
      setTimeout(() => ctx.tx((d, env) => setReadingDay(d, env, b.id, v), 'Đã đổi ngày chốt · chỉ áp kỳ chưa chốt'), 0);
    },
    'set-class': async (el, e, ctx) => {
      const attr = el.name; const value = el.value;
      const r = await openModal({
        title: `${icon('layers', 18)} Đổi ${attr === 'group' ? 'Nhóm T/S/G' : 'Hạng L1–L3'} → ${esc(value)}`, width: 420,
        body: `${fieldBox('Hiệu lực từ', inp({ name: 'from', type: 'date', value: ctx.today }), { req: true, hint: 'Ghi lịch sử, không ghi đè; báo cáo kỳ dùng giá trị hiệu lực ngày cuối kỳ (BR-2.03.2)' })}`,
        buttons: [{ label: 'Hủy', act: 'cancel' }, { label: 'Lưu', act: 'ok', kind: 'primary', ic: 'check', enabledWhen: (d) => d.from }],
      });
      if (r?.act === 'ok') ctx.tx((d, env) => setClassification(d, env, ctx.params.id, attr, value, r.data.from), 'Đã ghi lịch sử phân loại');
      else ctx.rerender();
    },
    'class-history': (el, e, ctx) => {
      const attr = el.dataset.attr;
      const rows = ctx.state.buildingTypeHistory.filter((h) => h.buildingId === ctx.params.id && h.attr === attr).sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
      openModal({
        title: `${icon('history', 18)} Lịch sử ${attr === 'group' ? 'Nhóm T/S/G' : 'Hạng L1–L3'}`, sub: `BUILDING_TYPE_HISTORY · ${pend('Screen ## · chưa có capture')}`, width: 460,
        body: rows.length ? table([{ h: 'Giá trị' }, { h: 'Hiệu lực từ' }, { h: 'Người ghi' }], rows.map((h) => [`<b>${h.value}</b>`, dateVN(h.effectiveFrom), esc(h.by)]), { compact: 1 }) : '<p class="muted">Chưa có lịch sử.</p>',
        buttons: [{ label: 'Đóng', act: 'ok', kind: 'primary' }],
      });
    },
    amenity: (el, e, ctx) => ctx.tx((d, env) => setAmenity(d, env, ctx.params.id, el.dataset.k, el.checked), 'Đã cập nhật tiện ích'),
    upload: (el, e, ctx) => docUploadPopup(ctx, { buildingId: ctx.params.id, scope: 'building' }),
    replace: (el, e, ctx) => docUploadPopup(ctx, { buildingId: ctx.params.id, scope: 'building', replaceDoc: ctx.state.documents.find((d) => d.id === el.dataset.d) }),
    verify: (el, e, ctx) => ctx.tx((d, env) => verifyDocument(d, env, el.dataset.d), 'Đã xác minh tài liệu'),
    'create-rooms': (el, e, ctx) => ctx.go(`#/rooms/new?building=${ctx.params.id}`),
    edit: () => notSpecified('FR04 · 04.2 · Sửa', 'Cần xác nhận: bật sửa tại chỗ hay mở màn sửa.'),
    assign: async (el, e, ctx) => {
      const s = ctx.state;
      const r = await openModal({
        title: `${icon('users', 18)} Phân công phụ trách chính`, sub: `Mô phỏng FR20 · ngoài đợt này ${pend('luồng thật ở UI-20')}`, width: 460,
        body: `${fieldBox('Nhân sự', sel({ name: 'employeeId', placeholder: 'Chọn nhân sự', options: s.employees.map((x) => [x.id, `${x.name} · ${x.title}`]) }), { req: true })}
          ${fieldBox('Hiệu lực từ', inp({ name: 'from', type: 'date', value: ctx.today }), { req: true, hint: 'Phân công sau ngày hôm nay hiển thị nhãn “sắp tới”' })}`,
        buttons: [{ label: 'Hủy', act: 'cancel' }, { label: 'Phân công', act: 'ok', kind: 'primary', ic: 'check', enabledWhen: (d) => d.employeeId && d.from }],
      });
      if (r?.act === 'ok') ctx.tx((d, env) => assignManager(d, env, ctx.params.id, r.data.employeeId, r.data.from), 'Đã phân công (mô phỏng FR20)');
    },
    transition: async (el, e, ctx) => {
      const r = await openModal({
        title: `${icon('arrowRight', 18)} Chuyển Đang khai thác`, sub: `Điều kiện ASSUMED 1.9 ${pend('Screen ## · popup chưa có capture')}`, width: 460,
        body: `<p class="muted" style="margin-bottom:10px">Xác nhận phân loại tòa. Mỗi thuộc tính có lịch sử riêng (BR-2.02.7, BR-2.03.2).</p>
          ${fieldBox('Nhóm T/S/G', sel({ name: 'group', placeholder: 'Chọn nhóm', options: GROUPS }), { req: true })}
          ${fieldBox('Hạng L1–L3', sel({ name: 'grade', placeholder: 'Chọn hạng', options: GRADES }), { req: true })}
          ${fieldBox('Hiệu lực từ', inp({ name: 'from', type: 'date', value: ctx.today }), { req: true })}`,
        buttons: [{ label: 'Hủy', act: 'cancel' }, { label: 'Chuyển Đang khai thác', act: 'ok', kind: 'primary', ic: 'check', enabledWhen: (d) => d.group && d.grade && d.from }],
      });
      if (r?.act === 'ok') ctx.tx((d, env) => transition(d, env, ctx.params.id, r.data), 'Tòa đã chuyển Đang khai thác');
    },
  },
};
