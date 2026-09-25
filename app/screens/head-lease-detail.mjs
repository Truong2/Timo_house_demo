// Screen 03.2 — Chi tiết HĐ đầu vào (FR03).
import { chip, btn, card, table, alert, dl, grid, note, icon, vnd, esc, mask, timeline, sumRow } from '../ui/shell.mjs';
import { abtn, pend, stChip, muted, blank, notSpecified, emptyState, fieldBox, inp } from '../ui/controls.mjs';
import { openModal, confirmModal } from '../ui/modal.mjs';
import { activationBlockers, activate, buildSchedule, displayStatus, periodStatus, setDates, setSigner, setTerms, adjustPeriod, liquidate } from '../core/domain/headLeases.mjs';
import { currentBank } from '../core/domain/landlords.mjs';
import { currentDocs } from '../core/domain/buildings.mjs';
import { RISK_CLAUSES } from '../data/landlord-tungsoi.mjs';
import { dateVN, dtVN, parseMoney } from '../core/format.mjs';
import { crumbs, GROUP, qtabs, auditTable, tabPending, spacer } from './common.mjs';
import { docUploadPopup } from './popups/document-upload.mjs';

const find = (ctx) => ctx.state.headLeases.find((h) => h.id === ctx.params.id);
const cycleText = (h) => `${h.cycleMonths} tháng/lần`;

function scheduleTable(ctx, h, { limit = 0, actions = false } = {}) {
  const all = ctx.state.headLeasePaymentSchedule.filter((p) => p.headLeaseId === h.id);
  const rows = (limit ? all.slice(0, limit) : all).map((p) => {
    const st = periodStatus(p, ctx.today);
    const perm = ctx.can('headLease.adjust');
    const r = [String(p.no), `${dateVN(p.from)} → ${dateVN(p.to)}`, dateVN(p.dueDate),
      `${vnd(p.amount)}${p.freeMonths ? ` <small class="muted">(miễn ${p.freeMonths} th)</small>` : ''}${p.adjustments.length ? ` ${chip('đã điều chỉnh', 'warn', 'edit')}` : ''}`,
      vnd(p.paid), vnd(p.amount - p.paid), stChip(st), muted('Làm sau')];
    if (actions) r.push(abtn({ text: 'Điều chỉnh', kind: 'ghost sm', ic: 'edit', act: 'adjust', data: { p: p.id }, perm, disabled: p.paid > 0, tip: 'Không sửa kỳ đã trả (BR-2.02.3)' }));
    return r;
  });
  const cols = [{ h: 'Kỳ', num: 1 }, { h: 'Từ → đến' }, { h: 'Hạn' }, { h: 'Phải trả', num: 1 }, { h: 'Đã trả', num: 1 }, { h: 'Còn lại', num: 1 }, { h: 'Trạng thái' }, { h: 'Phần cổ đông' }];
  if (actions) cols.push({ h: '' });
  if (!limit) {
    const tot = all.reduce((s, p) => s + p.amount, 0); const paid = all.reduce((s, p) => s + p.paid, 0);
    rows.push(sumRow(['', `${all.length} kỳ`, '', vnd(tot), vnd(paid), vnd(tot - paid), '', '', ...(actions ? [''] : [])]));
  }
  return table(cols, rows, { compact: 1, foot: limit && all.length > limit ? `<span>Hiển thị ${limit}/${all.length} kỳ</span><span class="bcl" data-action="tab" data-tab="schedule" role="link" tabindex="0" style="color:var(--pri)">Xem toàn bộ lịch ${icon('chevronRight', 12)}</span>` : '' });
}

function lockedSchedule(ctx, h) {
  const n = Math.ceil(h.months / h.cycleMonths);
  return `<div style="display:flex;gap:12px;align-items:center;border:1px dashed var(--bd);border-radius:8px;padding:14px;background:#F8FAFC">
    ${icon('lock', 22)}
    <div style="flex:1"><b>Chưa sinh được lịch</b><p class="muted" style="font-size:12.5px">${h.startDate
    ? `Lịch sinh khi kích hoạt HĐ. Dự kiến: ${h.months} tháng ÷ ${h.cycleMonths} = ${n} kỳ từ ${dateVN(h.startDate)} · mỗi kỳ = ${vnd(h.rent)} × ${h.cycleMonths} = <b>${vnd(h.rent * h.cycleMonths)} đ</b>${h.freeMonths.length ? ` (trừ ${h.freeMonths.length} tháng miễn)` : ' (không có tháng miễn)'} · hạn ngày ${String(h.dueWindow.from).padStart(2, '0')}–${h.dueWindow.to} tháng đầu kỳ.`
    : `Cần ngày bắt đầu (Đ.2.2). Khi có ngày: ${h.months} tháng ÷ ${h.cycleMonths} = ${n} kỳ · mỗi kỳ = ${vnd(h.rent)} × ${h.cycleMonths} = <b>${vnd(h.rent * h.cycleMonths)} đ</b> (${h.freeMonths.length ? `trừ ${h.freeMonths.length} tháng miễn` : 'không có tháng miễn'}) · hạn ngày ${String(h.dueWindow.from).padStart(2, '0')}–${h.dueWindow.to} tháng đầu kỳ.`}</p></div>
    ${h.status === 'Nháp' ? abtn({ text: h.startDate ? 'Sửa ngày bắt đầu' : 'Nhập ngày bắt đầu', ic: 'calendar', act: 'set-dates', perm: ctx.can('headLease.editDraft', { entity: h }) }) : ''}
  </div>`;
}

function overview(ctx, h, blockers) {
  const s = ctx.state;
  const l = s.landlords.find((x) => x.id === h.landlordId);
  const b = s.buildings.find((x) => x.id === h.allocations[0]?.buildingId);
  const bank = l && currentBank(l);
  const editP = ctx.can('headLease.editDraft', { entity: h });
  const draft = h.status === 'Nháp';
  const fix = [];
  if (blockers.some((x) => x.code === 'dates')) fix.push(abtn({ text: 'Nhập ngày', kind: 'outline sm', ic: 'calendar', act: 'set-dates', perm: editP }));
  if (blockers.some((x) => x.code === 'bank')) fix.push(abtn({ text: 'Bổ sung TK', kind: 'outline sm', ic: 'wallet', act: 'goto-landlord' }));
  if (blockers.some((x) => x.code === 'signer')) fix.push(abtn({ text: 'Xác nhận người ký', kind: 'outline sm', ic: 'user', act: 'signer', perm: editP }));
  const banner = draft && blockers.length
    ? alert('Chưa kích hoạt được', `${blockers.map((x, i) => (i ? x.text : x.text.charAt(0).toUpperCase() + x.text.slice(1))).join(' · ')}.`, 'danger', fix.join(''))
    : (draft ? alert('Đủ điều kiện kích hoạt', 'Bấm “Bổ sung & kích hoạt” để chuyển Hiệu lực và sinh lịch đóng tiền.', 'ok') : '');
  const d = (v, empty = blank()) => (v ? v : empty);
  const parties = card(`${icon('users', 16)} ② Các bên`, dl([
    ['Bên A', `<span class="bcl" data-nav="#/landlords/${l.id}" role="link" tabindex="0"><b>${esc(l.name)}</b> · ${l.id} ▸</span>`],
    ['CCCD bên A', l.idNo ? `<span class="mono">${mask(l.idNo)}</span>` : muted('—')],
    ['Bên B (trên HĐ)', `${esc(h.partyB.name)} ${h.partyB.isPerson ? chip('Cá nhân', 'warn') : ''}`],
    ['Ký thay Timehouse', h.signer?.name ? `${esc(h.signer.name)} ${chip(h.signer.mode === 'person' ? 'cá nhân ký' : 'có ủy quyền', 'neutral')}` : blank('Chờ xác nhận ủy quyền')],
  ], 1));
  const object = card(`${icon('building', 16)} ③ Đối tượng thuê · Đ.1, Đ.3`, dl([
    ['Địa chỉ', esc(b?.address || '—')],
    ['GCN số · nơi cấp · ngày', blank()],
    ['Số tầng · DT sàn', b?.floors ? `${b.floors} tầng · ${b.floorArea ?? '—'} m² <small class="muted">(nhập ở tòa)</small>` : blank()],
    ['Kết cấu · phạm vi', `${esc(b?.structure || '—')} · toàn bộ`],
    ['Mục đích', esc(b?.purpose || '—')],
  ], 1));
  const time = card(`${icon('calendar', 16)} ④ Thời gian · Đ.2`, dl([
    ['Ngày ký', d(h.signedDate && dateVN(h.signedDate))],
    ['Ngày giao nhà', d(h.handoverDate && dateVN(h.handoverDate))],
    ['Ngày bắt đầu tính tiền', h.billingStartMerged ? muted('Gộp với ngày bắt đầu (Đ.2.2)') : dateVN(h.billingStart)],
    ['Từ → đến', d(h.startDate && `${dateVN(h.startDate)} → ${dateVN(h.endDate)}`)],
    ['Thời hạn', `${h.months} tháng`],
    ['Gia hạn', esc(h.renewNote || '—')],
  ], 1));
  const price = card(`${icon('coins', 16)} ⑤ Giá · Đ.4`, dl([
    ['Tiền thuê', `<b>${vnd(h.rent)} đ/tháng</b>`],
    ['Giữ giá · lịch tăng giá', h.holdPriceMonths ? `${h.holdPriceMonths} tháng · ${chip('người dùng tự điền', 'neutral')}` : muted('Không có trên HĐ')],
    ['Khi gia hạn', 'Theo thị trường (4.2)'],
    ['Tháng miễn', h.freeMonths.length ? `Tháng ${h.freeMonths.join(', ')} ${chip('người dùng tự điền', 'neutral')}` : muted('Không có')],
    ['Thuế nhà đất, TNCN', 'Bên A chịu'],
  ], 1));
  const dep = card(`${icon('lock', 16)} ⑥ Cọc · Đ.5`, dl([
    ['Số tiền', `<b>${vnd(h.deposit.amount)} đ</b> · ${h.deposit.normalized === 'once' ? 'một lần' : muted('chưa chuẩn hóa')}`],
    ['Nguyên văn', muted(esc(h.deposit.raw))],
    ['Thời điểm trả', 'Tiền mặt, ngay sau khi ký'],
    ['Khấu trừ', 'Bên A không tự khấu trừ (5.3)'],
  ], 1) + note('Theo dõi riêng, KHÔNG ghi chi phí (BR-2.02.10).'));
  const pay = card(`${icon('wallet', 16)} ⑦ Thanh toán · Đ.4.4`, dl([
    ['Kỳ trả', cycleText(h)],
    ['Hạn trả', `Ngày ${String(h.dueWindow.from).padStart(2, '0')}–${h.dueWindow.to} tháng đầu kỳ`],
    ['Hình thức', esc(h.method)],
    ['STK nhận', bank ? `${esc(bank.bank)} · <span class="mono">${mask(bank.no)}</span>` : blank('Hồ sơ chủ nhà chưa có')],
  ], 1));
  const generated = s.headLeasePaymentSchedule.some((p) => p.headLeaseId === h.id);
  const sched = card(`${icon('calendar', 16)} ⑧ Lịch đóng tiền chủ nhà`, generated ? scheduleTable(ctx, h, { limit: 6 }) : lockedSchedule(ctx, h),
    abtn({ text: 'Sinh lại lịch', kind: 'outline sm', ic: 'refresh', act: 'regen', disabled: !generated, tip: 'Chưa có lịch để sinh lại' }), generated ? 'flush' : '');
  const risk = card(`${icon('alert', 16)} Điều khoản rủi ro — lưu nguyên văn, không thành rule chung`, table([{ h: 'Điều' }, { h: 'Nội dung' }, { h: 'Mức' }],
    RISK_CLAUSES.map(([a, t, lv, k]) => [a, t, chip(lv, k === 'info' ? 'neutral' : k, k === 'info' ? 'info' : undefined)]), { compact: 1 }), '', 'flush');
  const stage = h.status === 'Nháp' ? 1 : 2;
  const tl = timeline([
    ['done', 'Trích xuất & commit', h.jobId ? `${h.jobId} · ${dateVN(h.createdAt)}` : `Tạo ${dateVN(h.createdAt)}`],
    [stage === 1 ? 'cur' : 'done', 'Nháp — bổ sung ngày, STK, người ký', ''],
    [stage === 2 ? 'done' : 'todo', `Kích hoạt → sinh lịch ${Math.ceil(h.months / h.cycleMonths)} kỳ`, h.activatedAt ? dtVN(h.activatedAt) : ''],
    ['todo', 'Gắn % cổ đông', 'Làm sau'],
  ]).replace('<ul class="tl">', '<ul class="tl" style="margin-top:12px">');
  const share = card(`${icon('users', 16)} ⑨ Phần cổ đông`, `
    <div style="border:1px dashed var(--bd);border-radius:8px;padding:12px;background:#F8FAFC">
      ${chip('Làm sau', 'neutral', 'clock')}
      <p style="margin-top:6px">Chia nghĩa vụ góp theo % cổ đông của tòa sẽ bật khi có module <b>Cổ đông góp vốn (UI-29)</b>.</p>
      <p class="muted" style="font-size:12px;margin-top:4px">Đ.7.2: khi đổi người góp vốn, hai bên ký bổ sung <b>Phụ lục góp vốn 3 bên</b> — lưu thành loại tài liệu riêng.</p>
    </div>${tl}`);
  return `${banner}${grid('1fr 1fr 1fr', [parties, object, time])}${spacer}${grid('1fr 1fr 1fr', [price, dep, pay])}${spacer}${sched}${grid('1.3fr 1fr', [risk, share])}`;
}

function scheduleTab(ctx, h) {
  const generated = ctx.state.headLeasePaymentSchedule.some((p) => p.headLeaseId === h.id);
  const draft = h.status === 'Nháp';
  const editP = ctx.can('headLease.editDraft', { entity: h });
  const params = draft ? card(`${icon('settings', 16)} Tham số sinh lịch (HĐ Nháp)`, `<div class="grid" style="grid-template-columns:1fr 1fr auto;gap:12px;align-items:end">
      ${fieldBox('Tháng miễn (số thứ tự tháng, cách nhau dấu phẩy)', inp({ name: 'freeMonths', value: h.freeMonths.join(', '), placeholder: 'Ví dụ: 1' }), { hint: 'Mẫu không có — người nhập tự điền, ghi audit (Common Rule 3)' })}
      ${fieldBox('Giữ giá (tháng)', inp({ name: 'holdPriceMonths', value: h.holdPriceMonths ?? '', placeholder: 'Không có trên HĐ', attrs: 'inputmode="numeric"' }))}
      <div class="field">${abtn({ text: 'Lưu tham số', ic: 'check', act: 'save-terms', perm: editP })}</div></div>
      ${h.startDate ? `<p class="muted" style="font-size:12px">Xem trước: kỳ 1 = <b>${vnd(buildSchedule(h)[0]?.amount)} đ</b> · ${buildSchedule(h).length} kỳ.</p>` : ''}`) : '';
  return `${params}${card(`${icon('calendar', 16)} Lịch đóng tiền chủ nhà ${tabPending()}`, generated ? scheduleTable(ctx, h, { actions: true }) : lockedSchedule(ctx, h), '', generated ? 'flush' : '')}
    ${note('Đã trả · chứng từ ghi từ phiếu chi ở UI-28 (ngoài đợt này). Kế toán sửa từng kỳ phải có lý do; không sửa kỳ đã trả (BR-2.02.3).')}`;
}

function allocationTab(ctx, h) {
  const rows = h.allocations.map((a) => {
    const b = ctx.state.buildings.find((x) => x.id === a.buildingId);
    const r = [esc(b?.name || a.buildingId), `${a.pct} %`, `${vnd(h.rent * a.pct / 100)} đ/th`, a.from ? dateVN(a.from) : muted('từ ngày hiệu lực HĐ')];
    r._attrs = `data-href="#/buildings/${a.buildingId}" tabindex="0"`;
    return r;
  });
  const sum = h.allocations.reduce((s, a) => s + a.pct, 0);
  return card(`${icon('percent', 16)} Tòa / Phân bổ ${tabPending()}`, table([{ h: 'Tòa' }, { h: 'Tỷ lệ', num: 1 }, { h: 'Tiền thuê phân bổ', num: 1 }, { h: 'Hiệu lực' }], rows, {
    foot: `<span>HĐ gắn nhiều tòa: tổng phân bổ bắt buộc = 100 %; mặc định theo số phòng, override theo phụ lục (BR-2.02.2 → P-15)</span><span>Tổng ${sum} %</span>`,
  }), '', 'flush');
}

function legalTab(ctx, h) {
  const docs = currentDocs(ctx.state, { headLeaseId: h.id });
  return card(`${icon('shield', 16)} Pháp lý & chứng từ ${tabPending()}`, docs.length ? table([{ h: 'Loại' }, { h: 'File' }, { h: 'Version' }, { h: 'Xác minh' }, { h: 'Tải lúc' }], docs.map((d) => [
    esc(d.type), esc(d.fileName || '—'), `v${d.version}`, stChip(d.verifyStatus), `${esc(d.uploadedBy)} · ${dtVN(d.uploadedAt)}`,
  ]), { compact: 1 }) : emptyState('Chưa có tài liệu'), abtn({ text: 'Tải tài liệu', kind: 'outline sm', ic: 'upload', act: 'upload', perm: ctx.can('building.upload') }), 'flush');
}

function termsTab(ctx, h) {
  return grid('1.3fr 1fr', [
    card(`Điều khoản rủi ro ${tabPending()}`, table([{ h: 'Điều' }, { h: 'Nội dung' }, { h: 'Mức' }], RISK_CLAUSES.map(([a, t, lv, k]) => [a, t, chip(lv, k === 'info' ? 'neutral' : k)]), { compact: 1 }), '', 'flush'),
    card('Mâu thuẫn nội tại của mẫu', `<ul style="margin-left:18px;line-height:1.8">
      <li>Phạt bên A khi chấm dứt: <b>03 tháng tiền thuê</b> (6.1) ≠ <b>03 lần tiền cọc</b> (10.4)</li>
      <li>Trả tài sản: “không tính hao mòn” (PL II) ≠ “trừ hao mòn theo thời gian” (7.1)</li>
      <li>Điều 5.1 ghi cọc “đồng/<b>tháng</b>”</li></ul>${note('Hiển thị cảnh báo, không tự chọn (SRS FR03).')}`),
  ]);
}

function render(ctx) {
  const h = find(ctx);
  if (!h) return { active: 'UI-03', ...crumbs(ctx, [[GROUP, null], ['Hợp đồng đầu vào', '/head-leases'], [ctx.params.id]]), title: 'Không tìm thấy HĐ đầu vào', body: emptyState(`Không có HĐ ${esc(ctx.params.id)}`, '', '—') };
  const s = ctx.state;
  const l = s.landlords.find((x) => x.id === h.landlordId);
  const b = s.buildings.find((x) => x.id === h.allocations[0]?.buildingId);
  const st = displayStatus(h, ctx.today);
  const blockers = h.status === 'Nháp' ? activationBlockers(s, h) : [];
  const t = qtabs(ctx, [['overview', 'Tổng quan'], ['schedule', 'Lịch đóng tiền'], ['allocation', 'Tòa/Phân bổ'], ['legal', 'Pháp lý'], ['terms', 'Điều khoản'], ['history', 'Lịch sử']]);
  const body = {
    overview: () => overview(ctx, h, blockers),
    schedule: () => scheduleTab(ctx, h),
    allocation: () => allocationTab(ctx, h),
    legal: () => legalTab(ctx, h),
    terms: () => termsTab(ctx, h),
    history: () => card(`Lịch sử ${tabPending()}`, auditTable(s.audit.filter((a) => a.entityId === h.id || String(a.entityId).startsWith(`${h.id}-`))), '', 'flush'),
  }[t.key]();
  const effective = ['Hiệu lực', 'Sắp hết'].includes(st);
  const actP = ctx.can('headLease.activate');
  const liqP = ctx.can('headLease.liquidate');
  let actions = abtn({ text: 'Gia hạn', ic: 'refresh', act: 'renew', perm: liqP, disabled: !effective, tip: 'Chỉ gia hạn HĐ Hiệu lực / Sắp hết' });
  if (h.status === 'Nháp') {
    actions += abtn({ text: 'Bổ sung & kích hoạt', kind: 'primary', ic: 'check', act: 'activate', perm: actP, disabled: blockers.length > 0, tip: blockers.length ? `Còn thiếu: ${blockers.map((x) => x.text).join(' · ')}` : '' });
  } else if (effective) {
    actions += `${abtn({ text: 'Ghi nhận trả', ic: 'coins', act: 'record-pay' })}${abtn({ text: 'Thanh lý sớm', kind: 'danger', ic: 'x', act: 'liquidate', perm: liqP })}`;
  }
  return {
    active: 'UI-03', ...crumbs(ctx, [[GROUP, null], ['Hợp đồng đầu vào', '/head-leases'], [h.id]]),
    title: `HĐ đầu vào ${h.id}`, status: stChip(st),
    subtitle: `${esc(l?.name)} → ${esc(b?.name || '—')} · ${h.months} tháng · ${vnd(h.rent)} đ/tháng · kỳ ${cycleText(h)}`,
    actions, body: `${t.html}${body}`,
  };
}

export default {
  render,
  actions: {
    'set-dates': async (el, e, ctx) => {
      const h = find(ctx);
      const r = await openModal({
        title: `${icon('calendar', 18)} Nhập ngày HĐ đầu vào (Đ.2)`, sub: `Screen ## · ${pend('popup chưa có capture')}`, width: 460,
        body: `${fieldBox('Ngày ký', inp({ name: 'signedDate', type: 'date', value: h.signedDate || '' }), { hint: 'Mốc hiệu lực (Đ.12.1) · để trống nếu HĐ không ghi' })}
          ${fieldBox('Ngày giao nhà', inp({ name: 'handoverDate', type: 'date', value: h.handoverDate || '' }), { hint: 'Để trống = trùng ngày bắt đầu' })}
          ${fieldBox('Ngày bắt đầu', inp({ name: 'startDate', type: 'date', value: h.startDate || '' }), { req: true, hint: `Ngày kết thúc = ngày bắt đầu + ${h.months} tháng − 1 ngày (dự kiến) · ngày tính tiền gộp với ngày bắt đầu` })}`,
        buttons: [{ label: 'Hủy', act: 'cancel' }, { label: 'Lưu ngày', act: 'ok', kind: 'primary', ic: 'check', enabledWhen: (d) => d.startDate }],
      });
      if (r?.act === 'ok') ctx.tx((d, env) => setDates(d, env, h.id, r.data), 'Đã lưu ngày HĐ');
    },
    signer: async (el, e, ctx) => {
      const h = find(ctx);
      const r = await openModal({
        title: `${icon('user', 18)} Xác nhận người ký phía Timehouse`, sub: `Screen ## · ${pend('popup chưa có capture')}`, width: 480,
        body: `<p class="muted" style="margin-bottom:10px">Bên B trên HĐ là cá nhân (${esc(h.partyB.name)}). Xác nhận người ký thay Timehouse; giấy ủy quyền tải ở tab Pháp lý.</p>
          ${fieldBox('Người ký', inp({ name: 'name', value: h.signer?.name || `${h.partyB.name} (ủy quyền)` }), { req: true })}
          <div class="field"><label>Hình thức</label><div style="display:flex;gap:14px">
            <label class="chk"><input type="radio" name="mode" value="proxy" checked/> Ký thay Timehouse · có ủy quyền</label>
            <label class="chk"><input type="radio" name="mode" value="entity"/> Pháp nhân Timehouse ký</label></div></div>`,
        buttons: [{ label: 'Hủy', act: 'cancel' }, { label: 'Xác nhận', act: 'ok', kind: 'primary', ic: 'check', enabledWhen: (d) => String(d.name || '').trim() }],
      });
      if (r?.act === 'ok') ctx.tx((d, env) => setSigner(d, env, h.id, r.data), 'Đã xác nhận người ký');
    },
    'goto-landlord': (el, e, ctx) => ctx.go(`#/landlords/${find(ctx).landlordId}`),
    'save-terms': (el, e, ctx) => {
      const main = document.querySelector('main');
      const fm = main.querySelector('[name=freeMonths]').value.split(',').map((x) => Number(x.trim())).filter((n) => Number.isInteger(n) && n > 0);
      const hp = parseMoney(main.querySelector('[name=holdPriceMonths]').value);
      ctx.tx((d, env) => setTerms(d, env, ctx.params.id, { freeMonths: fm, holdPriceMonths: hp === null || Number.isNaN(hp) ? null : hp }), 'Đã lưu tham số sinh lịch');
    },
    activate: async (el, e, ctx) => {
      const h = find(ctx);
      const rows = buildSchedule(h);
      const ok = await confirmModal({
        title: `Kích hoạt ${h.id}?`, okLabel: 'Kích hoạt', okIc: 'check', width: 520,
        text: `HĐ chuyển <b>Hiệu lực</b> và sinh lịch đóng tiền: <b>${rows.length} kỳ</b>, kỳ 1 = ${vnd(rows[0]?.amount)} đ, hạn ngày ${h.dueWindow.to} tháng đầu kỳ, tổng ${vnd(rows.reduce((s, p) => s + p.amount, 0))} đ. ${pend('Screen ## · popup kích hoạt chưa có capture')}`,
      });
      if (ok) ctx.tx((d, env) => activate(d, env, h.id), `Đã kích hoạt ${h.id} · sinh ${rows.length} kỳ`);
    },
    adjust: async (el, e, ctx) => {
      const p = ctx.state.headLeasePaymentSchedule.find((x) => x.id === el.dataset.p);
      const r = await openModal({
        title: `${icon('edit', 18)} Điều chỉnh kỳ ${p.no}`, sub: `${dateVN(p.from)} → ${dateVN(p.to)} · hạn ${dateVN(p.dueDate)}`, width: 440,
        body: `${fieldBox('Số tiền mới (đ)', inp({ name: 'amount', value: vnd(p.amount), attrs: 'inputmode="numeric"' }), { req: true, hint: `Hiện tại ${vnd(p.amount)} đ` })}
          ${fieldBox('Lý do', '<textarea class="bare" name="reason" rows="3" maxlength="255"></textarea>', { req: true, hint: 'Bắt buộc · ghi audit (BR-2.02.3)' })}`,
        buttons: [{ label: 'Hủy', act: 'cancel' }, { label: 'Lưu điều chỉnh', act: 'ok', kind: 'primary', ic: 'check', enabledWhen: (d) => String(d.reason || '').trim() && Number.isFinite(parseMoney(d.amount)) }],
      });
      if (r?.act === 'ok') ctx.tx((d, env) => adjustPeriod(d, env, p.id, parseMoney(r.data.amount), r.data.reason.trim()), `Đã điều chỉnh kỳ ${p.no}`);
    },
    liquidate: async (el, e, ctx) => {
      const h = find(ctx);
      const r = await confirmModal({
        title: `Thanh lý sớm ${h.id}?`, danger: true, okLabel: 'Thanh lý', okIc: 'x',
        text: 'HĐ chuyển <b>Kết thúc</b>, tòa chuyển <b>Ngừng khai thác</b>. Mọi phòng phải hết HĐ thuê; khấu hao còn lại xử lý ở UI-27 (BR-2.02.11).',
        reason: { label: 'Lý do thanh lý', required: true },
      });
      if (r) ctx.tx((d, env) => liquidate(d, env, h.id, r.reason), `Đã thanh lý ${h.id}`);
    },
    renew: () => notSpecified('FR03 · 03.2 · Gia hạn → Screen ##', 'Gia hạn = tạo HĐ mới liên kết HĐ trước; không sửa ngày kết thúc HĐ cũ (BR-2.02.12).'),
    'record-pay': () => notSpecified('FR03 · 03.2 · Ghi nhận trả', 'Phiếu chi tiền thuê nhà thuộc UI-28 (ngoài đợt này).'),
    regen: () => notSpecified('FR03 · 03.2 · Sinh lại lịch', 'Cần xác nhận: sinh lại toàn bộ hay chỉ kỳ chưa trả?'),
    upload: (el, e, ctx) => docUploadPopup(ctx, { headLeaseId: ctx.params.id, buildingId: find(ctx).allocations[0]?.buildingId, scope: 'building' }),
  },
};
