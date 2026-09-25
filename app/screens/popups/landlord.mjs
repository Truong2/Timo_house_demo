// Screen 02.4 (chủ nhà có thể bị trùng), 02.5 (ngừng hoạt động / mở lại), popup Bổ sung TK và Lịch sử STK.
import { openModal, confirmModal } from '../../ui/modal.mjs';
import { icon, chip, dl, table, esc, mask } from '../../ui/shell.mjs';
import { pend, fieldBox, inp, stChip, muted } from '../../ui/controls.mjs';
import { dateVN, digits } from '../../core/format.mjs';

/**
 * 02.4 — trả { decision: 'use'|'create', existingId, reason, key } hoặc null (đóng popup).
 * "Vẫn tạo" lần đầu chỉ mở ô Lý do; bấm lại khi đã nhập lý do mới chấp nhận (BR-2.01.2).
 */
export function duplicatePopup(hit) {
  const l = hit.match;
  let askReason = false;
  const body = () => `
    <div class="alert warn" style="margin-bottom:10px">${icon('alert', 18)}<div><b>Chủ nhà có thể bị trùng theo ${hit.key}</b>
      <p>Đã có hồ sơ trùng ${hit.key}. Chọn dùng bản ghi có sẵn, hoặc vẫn tạo mới kèm lý do. ${pend('nội dung thông báo chính xác')}</p></div></div>
    ${dl([
      ['Mã', `<span class="mono">${l.id}</span>`], ['Họ tên', `<b>${esc(l.name)}</b>`],
      ['SĐT', l.phone ? `<span class="mono">${mask(l.phone)}</span>` : muted('—')],
      ['CCCD/MST', l.idNo || l.taxCode ? `<span class="mono">${mask(l.idNo || l.taxCode)}</span>` : muted('—')],
      ['Trạng thái', stChip(l.status === 'Hoạt động' ? 'active' : 'stopped')],
    ], 1)}
    ${askReason ? `<div style="margin-top:12px">${fieldBox('Lý do vẫn tạo', '<textarea class="bare" name="reason" rows="3" maxlength="255" placeholder="Ví dụ: cùng tên nhưng khác người"></textarea>', { req: true, hint: 'Bắt buộc · ghi vào audit' })}</div>` : ''}`;
  return openModal({
    title: `${icon('users', 18)} Chủ nhà có thể bị trùng`, sub: 'Screen 02.4 · BR-2.01.2', width: 520, body: body(),
    buttons: [
      { label: 'Dùng bản ghi có sẵn', act: 'use', kind: 'outline', ic: 'link' },
      { label: 'Vẫn tạo', act: 'create', kind: 'primary', ic: 'plus', enabledWhen: (d) => !askReason || String(d.reason || '').trim() },
    ],
    onAction: (act, d, api) => {
      if (act === 'create' && !askReason) {
        askReason = true;
        api.setBody(body());
        api.root.querySelector('[data-m="create"]').lastChild.textContent = 'Xác nhận vẫn tạo';
        api.root.querySelector('textarea')?.focus();
        return false;
      }
      return undefined;
    },
  }).then((r) => (r ? { decision: r.act, existingId: l.id, reason: String(r.data.reason || '').trim(), key: hit.key } : null));
}

/** 02.5 — Ngừng hoạt động (danger, bắt buộc lý do). */
export const deactivatePopup = (l) => confirmModal({
  title: `Ngừng hoạt động chủ nhà ${l.id}?`, danger: true, okLabel: 'Ngừng hoạt động', okIc: 'lock',
  text: `${esc(l.name)} sẽ chuyển sang <b>Ngừng hoạt động</b>: chỉ xem, không sửa. Admin có thể mở lại. ${pend('nội dung thông báo chính xác')}`,
  reason: { label: 'Lý do', required: true },
});

export const reopenPopup = (l) => confirmModal({
  title: `Mở lại chủ nhà ${l.id}?`, okLabel: 'Mở lại', okIc: 'refresh',
  text: `Chủ nhà trở về trạng thái <b>Hoạt động</b>. ${pend('Screen ## · popup mở lại chưa có capture')}`,
  reason: { label: 'Lý do mở lại', required: true },
});

/** Bổ sung / đổi tài khoản nhận tiền (BR-2.01.3). Trả dữ liệu hoặc null. */
export function bankPopup(l, today) {
  return openModal({
    title: `${icon('wallet', 18)} ${l.bankAccounts?.length ? 'Đổi' : 'Bổ sung'} tài khoản nhận tiền`,
    sub: `${l.id} · ${esc(l.name)} · ${pend('Screen ## · popup chưa có capture')}`, width: 480,
    body: `${fieldBox('Ngân hàng', inp({ name: 'bank', placeholder: 'Ví dụ: Vietcombank' }), { req: true })}
      ${fieldBox('Số tài khoản', inp({ name: 'no', placeholder: 'Chỉ nhập số', attrs: 'inputmode="numeric" maxlength="20"' }), { req: true })}
      ${fieldBox('Chủ tài khoản', inp({ name: 'holder', value: l.name, attrs: 'maxlength="255"' }), { req: true })}
      ${fieldBox('Hiệu lực từ', inp({ name: 'effectiveFrom', type: 'date', value: today }), { req: true, hint: l.bankAccounts?.length ? 'Tài khoản hiện tại được đóng hiệu lực tới ngày trước đó và giữ trong lịch sử (không sửa đè).' : '' })}`,
    buttons: [
      { label: 'Hủy', act: 'cancel' },
      { label: 'Lưu tài khoản', act: 'ok', kind: 'primary', ic: 'check', enabledWhen: (d) => d.bank.trim() && digits(d.no) && d.holder.trim() && d.effectiveFrom },
    ],
  }).then((r) => (r?.act === 'ok' ? r.data : null));
}

export function bankHistoryPopup(l) {
  const rows = [...(l.bankAccounts || [])].reverse();
  return openModal({
    title: `${icon('history', 18)} Lịch sử tài khoản nhận tiền`, sub: `${l.id} · ${esc(l.name)} · BR-2.01.3 · ${pend('Screen ## · chưa có capture')}`, width: 620,
    body: rows.length ? table([{ h: 'Ngân hàng' }, { h: 'Số TK' }, { h: 'Chủ TK' }, { h: 'Hiệu lực' }, { h: '' }], rows.map((a) => [
      esc(a.bank), `<span class="mono">${mask(a.no)}</span>`, esc(a.holder), `${dateVN(a.effectiveFrom)} → ${a.effectiveTo ? dateVN(a.effectiveTo) : 'nay'}`,
      a.effectiveTo ? chip('Đã thay', 'neutral', 'history') : chip('Đang dùng', 'ok'),
    ]), { compact: 1 }) : '<p class="muted">Chưa có tài khoản nào.</p>',
    buttons: [{ label: 'Đóng', act: 'ok', kind: 'primary' }],
  });
}
