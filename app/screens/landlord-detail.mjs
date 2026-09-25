// Screen 02.2 — Chi tiết chủ nhà (FR02).
import { chip, btn, card, table, alert, dl, grid, note, icon, vnd, esc, mask } from '../ui/shell.mjs';
import { abtn, pend, stChip, muted, notSpecified, emptyState } from '../ui/controls.mjs';
import { openMenu } from '../ui/menu.mjs';
import { ACTIVE, landlordBuildings, leasesOf, currentBank, hasEffectiveLease, addBankAccount, deactivateLandlord, reopenLandlord } from '../core/domain/landlords.mjs';
import { roomCount, currentDocs } from '../core/domain/buildings.mjs';
import { displayStatus } from '../core/domain/headLeases.mjs';
import { dateVN, dtVN } from '../core/format.mjs';
import { crumbs, GROUP, qtabs, auditTable, tabPending, spacer } from './common.mjs';
import { deactivatePopup, reopenPopup, bankPopup, bankHistoryPopup } from './popups/landlord.mjs';
import { docUploadPopup } from './popups/document-upload.mjs';
import { forbidden } from './placeholder.mjs';

const find = (ctx) => ctx.state.landlords.find((l) => l.id === ctx.params.id);

function buildingsTable(ctx, l) {
  const s = ctx.state;
  const bs = landlordBuildings(s, l);
  const rows = bs.map((b) => {
    const hl = leasesOf(s, l.id).find((h) => h.allocations.some((a) => a.buildingId === b.id));
    const r = [
      b.codeLocked ? `<span class="mono">${esc(b.code)}</span>` : `<span class="mono">${esc(b.codeSuggestion || '—')}</span> ${chip('Mã ví dụ', 'assumed')}`,
      esc(b.address || '—'), esc(b.scope || '—'), hl ? `<span class="mono">${hl.id}</span> · ${displayStatus(hl, ctx.today)}` : '—',
      hl ? `${vnd(hl.rent)} đ/th` : '—', String(roomCount(s, b)), stChip(b.status),
    ];
    r._attrs = `data-href="#/buildings/${b.id}" tabindex="0"`;
    return r;
  });
  const foot = `<span>Quan hệ chủ nhà ↔ tòa suy ra từ HĐ đầu vào (BR-2.01.4) · phòng tạo ở UI-05 vì HĐ không có danh sách phòng ${l.hintBuildings?.length ? pend('tòa gợi ý từ chủ HĐ điện (Seed §12), chưa có HĐ đầu vào') : ''}</span><span>${bs.length} tòa</span>`;
  return rows.length
    ? table([{ h: 'Tòa' }, { h: 'Địa chỉ' }, { h: 'Phạm vi' }, { h: 'HĐ đầu vào' }, { h: 'Tiền thuê', num: 1 }, { h: 'Phòng', num: 1 }, { h: 'Trạng thái' }], rows, { foot })
    : emptyState('Chưa có tòa nào', 'Tòa được tạo khi commit trích xuất HĐ chủ nhà.');
}

/** 4 loại hồ sơ cố định của chủ nhà. */
function docsTable(ctx, l) {
  const docs = currentDocs(ctx.state, { landlordId: l.id });
  const pick = (type, sub) => docs.find((d) => d.type === type && (!sub || d.subtype === sub || (!d.subtype && sub === 'CCCD')));
  const fileCell = (d) => {
    if (!d) return '—';
    const n = d.fileName || '';
    return d.hash ? `<span class="mono">${esc(n.slice(0, 26))}…</span>` : esc(n);
  };
  const auth = docs.find((d) => d.type === 'CCCD/ủy quyền bên cho thuê' && d.subtype === 'Ủy quyền');
  const rows = [
    ['CCCD bên cho thuê', pick('CCCD/ủy quyền bên cho thuê', 'CCCD')],
    ['HĐ thuê nhà đã ký', pick('Hợp đồng thuê nhà đầu vào đã ký')],
    ['Phụ lục bàn giao tài sản', pick('Biên bản bàn giao/kiểm kê tài sản')],
  ].map(([label, d]) => [label, fileCell(d), d ? stChip(d.verifyStatus) : muted('—')]);
  rows.push(['Giấy ủy quyền', auth ? esc(auth.fileName) : '—', auth ? stChip(auth.verifyStatus) : (l.representative ? stChip('Chờ bản chụp') : stChip('Không áp dụng'))]);
  return table([{ h: 'Loại' }, { h: 'File' }, { h: 'Xác minh' }], rows, { compact: 1 });
}

function overview(ctx, l) {
  const s = ctx.state;
  const bank = currentBank(l);
  const fromHD = l.source?.kind === 'extraction';
  const job = fromHD ? s.extractionJobs.find((j) => j.id === l.source.jobId) : null;
  const editPerm = ctx.can('landlord.edit', { entity: l });
  const org = l.type === 'Tổ chức';
  const banner = !bank && l.status === ACTIVE
    ? alert(fromHD ? 'Hồ sơ tạo từ trích xuất HĐ — còn thiếu thông tin' : 'Hồ sơ còn thiếu thông tin',
      fromHD ? 'Tài khoản nhận tiền không có trên HĐ mẫu (Đ.4.4 chỉ ghi “chuyển khoản hoặc tiền mặt”). Bổ sung trước khi kích hoạt HĐ đầu vào để sinh lệnh trả tiền.' : 'Chưa có tài khoản nhận tiền. Bổ sung trước khi kích hoạt HĐ đầu vào để sinh lệnh trả tiền.',
      'warn', abtn({ text: 'Bổ sung TK', kind: 'outline sm', ic: 'plus', act: 'add-bank', perm: editPerm }))
    : '';
  const idPairs = org ? [
    ['MST', l.taxCode ? `<span class="mono">${mask(l.taxCode)}</span>` : muted('—')],
    ['Tên pháp nhân', esc(l.legalName || l.name)],
    ['Người đại diện', esc(l.representative || '—')],
  ] : [
    ['CCCD', l.idNo ? `<span class="mono">${mask(l.idNo)}</span>` : muted('—')],
    ['Ngày cấp', l.idIssued ? dateVN(l.idIssued) : muted('—')],
    ['Nơi cấp', l.idPlace ? esc(l.idPlace) : muted('—')],
    ['Người đại diện / ủy quyền', l.representative ? esc(l.representative) : muted(fromHD ? 'Không có trên HĐ' : '—')],
  ];
  const sideA = card(`${icon('user', 16)} ② Bên A — thông tin định danh`, dl([
    ['Mã', `<span class="mono">${l.id}</span>`], ['Loại', l.type], ['Họ tên', `<b>${esc(l.name)}</b>`], ...idPairs,
    ['Trạng thái', stChip(l.status === ACTIVE ? 'active' : 'stopped')],
  ], 1) + note(fromHD ? 'Nguồn: phần mở đầu HĐ · CCCD và SĐT che theo quyền.' : 'CCCD và SĐT che theo quyền (Common Rule 2).'));
  const contact = card(`${icon('message', 16)} ③ Liên hệ · ④ Thanh toán`, dl([
    ['Điện thoại', l.phone ? `<span class="mono">${mask(l.phone)}</span>` : muted('—')],
    ['Email', l.email ? esc(l.email) : muted('—')],
    [org ? 'Địa chỉ trụ sở' : 'Hộ khẩu thường trú', l.address ? esc(l.address) : muted('—')],
    ['Địa chỉ liên hệ', l.contactAddress ? esc(l.contactAddress) : muted(l.address ? 'Chưa tách — mặc định HKTT' : '—')],
    ['Ngân hàng · Số TK · Chủ TK', bank ? `${esc(bank.bank)} · <span class="mono">${mask(bank.no)}</span> · ${esc(bank.holder)}` : chip(fromHD ? 'Chưa có trên HĐ' : 'Chưa có', 'warn')],
    ['Kỳ trả mặc định', l.defaultCycle || muted('—')],
    ['Hình thức', l.method || muted('—')],
    ['Lịch sử STK', btn('Xem', 'ghost sm', 'history', 'data-action="bank-history"')],
  ], 1));
  const houses = card(`${icon('building', 16)} ⑤ Nhà cho thuê — suy ra từ HĐ đầu vào`, buildingsTable(ctx, l),
    abtn({ text: 'Thêm tòa từ HĐ', kind: 'outline sm', ic: 'upload', act: 'add-building', perm: ctx.can('extraction.run'), disabled: l.status !== ACTIVE, tip: 'Chủ nhà đang Ngừng hoạt động' }), 'flush');
  const docs = card(`${icon('file', 16)} ⑥ Hồ sơ của chủ nhà`, docsTable(ctx, l) + `<div style="padding:0 14px 12px">${note('Sổ đỏ/GCN, PCCC, HKD là hồ sơ của TÒA — xem UI-04. Phụ lục góp vốn 3 bên thuộc module Cổ đông (làm sau).')}</div>`,
    abtn({ text: 'Tải tài liệu', kind: 'outline sm', ic: 'upload', act: 'upload', perm: editPerm, disabled: l.status !== ACTIVE, tip: 'Chủ nhà đang Ngừng hoạt động' }), 'flush');
  const source = job ? card(`${icon('history', 16)} Nguồn tạo hồ sơ`, dl([
    ['Job trích xuất', `<span class="mono bcl" data-nav="#/landlords/import?job=${job.id}" role="link" tabindex="0">${job.id}</span>`],
    ['File', `${job.file.sizeKb} KB · ${job.file.pages} trang · ${job.file.hash}…`],
    ['Người tải · lúc', `${esc(job.uploadedBy)} · ${dtVN(job.uploadedAt)}`],
    ['Dò trùng', esc(l.dupCheck || 'CCCD → SĐT → tên · không trùng')],
    ['Quyền truy cập', 'Cổ đông không xem được màn này'],
  ], 1)) : card(`${icon('history', 16)} Nguồn tạo hồ sơ`, dl([
    ['Nguồn', esc(l.source?.kind === 'manual' ? 'Tạo tay' : (l.source?.note || '—'))],
    ['Tạo lúc', dtVN(l.createdAt)],
    ['Quyền truy cập', 'Cổ đông không xem được màn này'],
  ], 1) + note('Khối này theo SRS chỉ hiển thị khi hồ sơ tạo từ trích xuất; mockup hiện nguồn khác để tham khảo.'));
  return `${banner}${grid('1fr 1fr', [sideA, contact])}${spacer}${houses}${grid('1fr 1fr', [docs, source])}`;
}

function leasesTab(ctx, l) {
  const rows = leasesOf(ctx.state, l.id).map((h) => {
    const b = ctx.state.buildings.find((x) => x.id === h.allocations[0]?.buildingId);
    const r = [`<span class="mono">${h.id}</span>`, esc(b?.name || '—'), `${h.months} tháng`, h.startDate ? `${dateVN(h.startDate)} → ${dateVN(h.endDate)}` : muted('chưa có ngày'), `${vnd(h.rent)} đ/th`, stChip(displayStatus(h, ctx.today))];
    r._attrs = `data-href="#/head-leases/${h.id}" tabindex="0"`;
    return r;
  });
  return card(`HĐ đầu vào của ${esc(l.name)} ${tabPending()}`, rows.length ? table([{ h: 'Mã' }, { h: 'Tòa' }, { h: 'Thời hạn' }, { h: 'Từ → đến' }, { h: 'Tiền thuê', num: 1 }, { h: 'Trạng thái' }], rows) : emptyState('Chưa có HĐ đầu vào', 'Tạo bằng trích xuất HĐ chủ nhà (FR03).'), abtn({ text: 'Tạo từ HĐ chủ nhà', kind: 'outline sm', ic: 'upload', act: 'add-building', perm: ctx.can('extraction.run') }), 'flush');
}

function paymentsTab(ctx, l) {
  const accs = [...(l.bankAccounts || [])].reverse();
  const hlIds = leasesOf(ctx.state, l.id).map((h) => h.id);
  const periods = ctx.state.headLeasePaymentSchedule.filter((p) => hlIds.includes(p.headLeaseId) && p.paid < p.amount).slice(0, 4);
  return grid('1fr 1fr', [
    card(`Tài khoản nhận tiền ${tabPending()}`, accs.length ? table([{ h: 'Ngân hàng' }, { h: 'Số TK' }, { h: 'Hiệu lực' }], accs.map((a) => [esc(a.bank), `<span class="mono">${mask(a.no)}</span>`, `${dateVN(a.effectiveFrom)} → ${a.effectiveTo ? dateVN(a.effectiveTo) : 'nay'}`]), { compact: 1 }) : emptyState('Chưa có tài khoản'), abtn({ text: 'Bổ sung TK', kind: 'outline sm', ic: 'plus', act: 'add-bank', perm: ctx.can('landlord.edit', { entity: l }), disabled: l.status !== ACTIVE, tip: 'Chủ nhà đang Ngừng hoạt động' }), 'flush'),
    card('Kỳ trả sắp tới', periods.length ? table([{ h: 'HĐ' }, { h: 'Kỳ' }, { h: 'Hạn' }, { h: 'Số tiền', num: 1 }], periods.map((p) => [p.headLeaseId, String(p.no), dateVN(p.dueDate), vnd(p.amount)]), { compact: 1 }) : emptyState('Chưa có lịch đóng tiền', 'Lịch sinh khi HĐ đầu vào được kích hoạt.'), '', 'flush'),
  ]);
}

function docsTab(ctx, l) {
  const docs = ctx.state.documents.filter((d) => d.links.landlordId === l.id);
  return card(`Tài liệu của chủ nhà ${tabPending()}`, docs.length ? table([{ h: 'Loại' }, { h: 'File' }, { h: 'Version' }, { h: 'Xác minh' }, { h: 'Tải lúc' }], docs.map((d) => [
    esc(d.type), esc(d.fileName || '—'), `v${d.version}${d.superseded ? ` ${chip('đã thay', 'neutral')}` : ''}`, stChip(d.verifyStatus), `${esc(d.uploadedBy)} · ${dtVN(d.uploadedAt)}`,
  ]), { compact: 1 }) : emptyState('Chưa có tài liệu'), abtn({ text: 'Tải tài liệu', kind: 'outline sm', ic: 'upload', act: 'upload', perm: ctx.can('landlord.edit', { entity: l }) }), 'flush');
}

function render(ctx) {
  const l = find(ctx);
  if (!l) return { active: 'UI-02', ...crumbs(ctx, [[GROUP, null], ['Chủ nhà', '/landlords'], ctx.params.id]), title: 'Không tìm thấy chủ nhà', body: emptyState(`Không có chủ nhà ${esc(ctx.params.id)}`, '', '—') };
  const s = ctx.state;
  const leases = leasesOf(s, l.id);
  const bs = landlordBuildings(s, l);
  const docs = s.documents.filter((d) => d.links.landlordId === l.id && !d.superseded);
  const t = qtabs(ctx, [['overview', 'Tổng quan'], ['head-leases', `HĐ đầu vào (${leases.length})`], ['buildings', `Tòa nhà (${bs.length})`], ['payments', 'Thanh toán'], ['documents', `Tài liệu (${docs.length})`], ['history', 'Lịch sử']]);
  const body = {
    overview: () => overview(ctx, l),
    'head-leases': () => leasesTab(ctx, l),
    buildings: () => card(`Tòa nhà ${tabPending()}`, buildingsTable(ctx, l), '', 'flush'),
    payments: () => paymentsTab(ctx, l),
    documents: () => docsTab(ctx, l),
    history: () => card(`Lịch sử thay đổi ${tabPending()}`, auditTable(s.audit.filter((a) => a.entityId === l.id)), '', 'flush'),
  }[t.key]();
  const lease = leases[leases.length - 1];
  const srcText = l.source?.kind === 'extraction' ? 'tạo từ trích xuất HĐ' : l.source?.kind === 'manual' ? 'tạo tay' : esc(l.source?.note || '');
  return {
    active: 'UI-02', ...crumbs(ctx, [[GROUP, null], ['Chủ nhà', '/landlords'], [l.id]]),
    title: `${l.id} · ${esc(l.name)}`, status: stChip(l.status === ACTIVE ? 'active' : 'stopped'),
    subtitle: `${l.type} · ${bs.length} tòa · ${lease ? `HĐ đầu vào ${lease.id} đang ${displayStatus(lease, ctx.today)}` : 'chưa có HĐ đầu vào'} · ${srcText}`,
    actions: `${abtn({ text: '', ic: 'more', act: 'more' })}${l.status === ACTIVE ? abtn({ text: 'Sửa', ic: 'edit', act: 'edit', perm: ctx.can('landlord.edit', { entity: l }) }) : ''}${lease ? abtn({ text: 'Mở HĐ đầu vào', kind: 'primary', ic: 'file', act: 'open-lease' }) : ''}`,
    body: `${t.html}${body}`,
  };
}

export default {
  render: (ctx) => (find(ctx) || ctx.can('landlord.view').ok ? render(ctx) : forbidden.render(ctx)),
  actions: {
    more: (el, e, ctx) => {
      const l = find(ctx);
      const active = l.status === ACTIVE;
      const pDe = ctx.can('landlord.deactivate');
      const pRe = ctx.can('landlord.reopen');
      const eff = hasEffectiveLease(ctx.state, l.id);
      const items = active
        ? [{ label: 'Ngừng hoạt động', act: 'deactivate', ic: 'lock', danger: true, disabled: !pDe.ok || eff, tip: !pDe.ok ? pDe.reason : (eff ? 'Còn HĐ đầu vào hiệu lực — không được ngừng hoạt động (BR-2.01.6)' : '') }]
        : [{ label: 'Mở lại', act: 'reopen', ic: 'refresh', disabled: !pRe.ok, tip: pRe.ok ? '' : pRe.reason }];
      items.push({ sep: true }, { label: 'Xem lịch sử', act: 'history', ic: 'history' }, { label: 'Hành động khác', act: 'other', ic: 'more', sub: 'cần capture' });
      openMenu(el, items, async (it) => {
        if (it.act === 'deactivate') {
          const r = await deactivatePopup(l);
          if (r) ctx.tx((d, env) => deactivateLandlord(d, env, l.id, r.reason), `Đã ngừng hoạt động ${l.id}`);
        } else if (it.act === 'reopen') {
          const r = await reopenPopup(l);
          if (r) ctx.tx((d, env) => reopenLandlord(d, env, l.id, r.reason), `Đã mở lại ${l.id}`);
        } else if (it.act === 'history') ctx.setQuery({ tab: 'history' });
        else notSpecified('FR02 · 02.2 · các action khác trong menu ⋯');
      });
    },
    edit: () => notSpecified('FR02 · 02.2 · Sửa → Screen ##', 'SRS chưa có màn Sửa chủ nhà.'),
    'open-lease': (el, e, ctx) => {
      const ls = leasesOf(ctx.state, ctx.params.id);
      ctx.go(`#/head-leases/${ls[ls.length - 1].id}`);
    },
    'add-bank': async (el, e, ctx) => {
      const l = find(ctx);
      const data = await bankPopup(l, ctx.today);
      if (data) ctx.tx((d, env) => addBankAccount(d, env, l.id, data), 'Đã lưu tài khoản nhận tiền');
    },
    'bank-history': (el, e, ctx) => bankHistoryPopup(find(ctx)),
    'add-building': (el, e, ctx) => ctx.go('#/landlords/import'),
    upload: (el, e, ctx) => docUploadPopup(ctx, { landlordId: ctx.params.id, scope: 'landlord' }),
  },
};
