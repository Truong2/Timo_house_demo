// Screen 04.3 — Popup tải tài liệu (dùng chung cho tòa, chủ nhà, HĐ đầu vào).
// Loại tài liệu quyết định hiện/ẩn Ngày cấp, Ngày hết hạn. Thay thế tài liệu đã xác minh bắt buộc lý do, giữ version.
import { openModal } from '../../ui/modal.mjs';
import { icon, esc } from '../../ui/shell.mjs';
import { fieldBox, inp, sel, pend } from '../../ui/controls.mjs';
import { DOC_TYPES, docType, addDocument } from '../../core/domain/buildings.mjs';
import { leasesOf } from '../../core/domain/landlords.mjs';
import { leasesOfBuilding } from '../../core/domain/buildings.mjs';

const ACCEPT = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
const MAX_MB = 20; // giả định — SRS để đỏ

export function docUploadPopup(ctx, { buildingId = null, landlordId = null, headLeaseId = null, scope = 'building', replaceDoc = null } = {}) {
  const s = ctx.state;
  const types = DOC_TYPES.filter((t) => (scope === 'landlord' ? t.scope !== 'building' : t.scope !== 'landlord'));
  const links = [];
  if (scope === 'landlord') {
    const l = s.landlords.find((x) => x.id === landlordId);
    links.push([`l:${landlordId}`, `Chủ nhà ${landlordId} · ${esc(l?.name || '')}`]);
    leasesOf(s, landlordId).forEach((h) => links.push([`h:${h.id}`, `HĐ đầu vào ${h.id}`]));
  } else {
    const b = s.buildings.find((x) => x.id === buildingId);
    if (b) links.push([`b:${b.id}`, `Tòa ${esc(b.code || b.codeSuggestion || b.name)}`]);
    (b ? leasesOfBuilding(s, b.id) : s.headLeases.filter((h) => h.id === headLeaseId)).forEach((h) => links.push([`h:${h.id}`, `HĐ đầu vào ${h.id} (tòa)`]));
  }
  const defLink = headLeaseId && links.find((l) => l[0] === `h:${headLeaseId}`) ? `h:${headLeaseId}` : links[0]?.[0];
  const needReason = replaceDoc?.verifyStatus === 'Đã xác minh';
  let file = null; let fileErr = '';

  const body = `
    ${replaceDoc ? `<div class="alert info">${icon('history', 18)}<div><b>Thay thế ${esc(replaceDoc.type)} · v${replaceDoc.version}</b><p>Bản mới thành v${replaceDoc.version + 1}; bản cũ giữ trong lịch sử.</p></div></div>` : ''}
    ${fieldBox('Loại tài liệu', sel({ name: 'type', value: replaceDoc?.type || '', placeholder: 'Chọn loại tài liệu', options: types.map((t) => [t.v, t.later ? `${t.v} (làm sau)` : t.v]), attrs: replaceDoc ? 'disabled' : '' }), { req: true, hint: 'Loại tài liệu quyết định checklist, mốc hạn và nơi hiển thị.' })}
    ${fieldBox('Tòa / HĐ liên quan', sel({ name: 'link', value: defLink, options: links }), { req: true })}
    <div class="field"><label>File <span class="req">*</span></label>
      <label class="drop" id="drop">${icon('upload', 20)}<div style="margin-top:6px"><b>Kéo thả file vào đây</b> hoặc bấm để chọn từ máy</div>
        <small>${ACCEPT.map((x) => `.${x}`).join(', ')} · tối đa ${MAX_MB} MB ${pend('định dạng & dung lượng tối đa')}</small>
        <input type="file" name="file" accept="${ACCEPT.map((x) => `.${x}`).join(',')}"/></label>
      <div id="frame"></div></div>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
      <div id="f-issued" style="display:none">${fieldBox('Ngày cấp', inp({ name: 'issuedDate', type: 'date', attrs: `max="${ctx.today}"` }))}</div>
      <div id="f-expiry" style="display:none">${fieldBox('Ngày hết hạn', inp({ name: 'expiryDate', type: 'date' }))}</div>
    </div>
    ${fieldBox('Ghi chú', '<textarea class="bare" name="note" rows="2" maxlength="255"></textarea>')}
    ${needReason ? fieldBox('Lý do thay thế', '<textarea class="bare" name="replaceReason" rows="2" maxlength="255"></textarea>', { req: true, hint: 'Tài liệu đã xác minh — thay thế phải có lý do (audit)' }) : ''}
    <p class="muted" style="font-size:11.5px">Lưu xong tài liệu ở trạng thái <b>Chờ xác minh</b>. Mockup chỉ lưu thông tin file, không lưu nội dung.</p>`;

  const showDates = (root, type) => {
    const t = docType(type || replaceDoc?.type);
    root.querySelector('#f-issued').style.display = t?.issued ? '' : 'none';
    root.querySelector('#f-expiry').style.display = t?.expiry ? '' : 'none';
  };
  const setFile = (api, f) => {
    const ext = String(f?.name || '').split('.').pop().toLowerCase();
    file = null; fileErr = '';
    if (f && !ACCEPT.includes(ext)) fileErr = `Định dạng .${ext} không được hỗ trợ (E## — cần xác nhận mã lỗi)`;
    else if (f && f.size > MAX_MB * 1048576) fileErr = `File vượt ${MAX_MB} MB (E## — cần xác nhận mã lỗi)`;
    else file = f;
    const url = file && /^(pdf|jpg|jpeg|png)$/.test(ext) ? URL.createObjectURL(file) : '';
    api.root.querySelector('#frame').innerHTML = file
      ? `<div class="frame">${icon('file', 16)}<span>${esc(file.name)} · ${Math.max(1, Math.round(file.size / 1024))} KB</span>${url ? `<a class="btn ghost sm" href="${url}" target="_blank" rel="noopener">${icon('eye', 13)}Preview</a>` : ''}<button type="button" class="btn ghost sm" id="rmf">${icon('x', 13)}Bỏ file</button></div>`
      : (fileErr ? `<div class="errt" style="margin-top:6px">${fileErr}</div>` : '');
    api.root.querySelector('#rmf')?.addEventListener('click', () => setFile(api, null));
    api.refresh();
  };

  return openModal({
    title: `${icon('upload', 18)} ${replaceDoc ? 'Thay thế tài liệu' : 'Tải tài liệu'}`, sub: `Screen 04.3 · ${pend('popup chưa có capture')}`, width: 560, body,
    buttons: [
      { label: 'Hủy', act: 'cancel' },
      { label: 'Lưu', act: 'ok', kind: 'primary', ic: 'check', enabledWhen: (d) => (d.type || replaceDoc) && d.link && file && (!needReason || String(d.replaceReason || '').trim()) },
    ],
    onMount: (api) => {
      const drop = api.root.querySelector('#drop');
      const input = drop.querySelector('input');
      input.addEventListener('change', () => setFile(api, input.files[0]));
      drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('over'));
      drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); setFile(api, e.dataTransfer.files[0]); });
      showDates(api.root, replaceDoc?.type);
    },
    onInput: (d, api) => showDates(api.root, d.type),
  }).then((r) => {
    if (r?.act !== 'ok') return null;
    const [kind, id] = r.data.link.split(':');
    const hl = kind === 'h' ? s.headLeases.find((h) => h.id === id) : null;
    const payload = {
      type: replaceDoc?.type || r.data.type, fileName: file.name, sizeKb: Math.max(1, Math.round(file.size / 1024)),
      buildingId: kind === 'b' ? id : (hl?.allocations[0]?.buildingId || (scope === 'building' ? buildingId : null)),
      landlordId: kind === 'l' ? id : (hl?.landlordId || landlordId),
      headLeaseId: kind === 'h' ? id : null,
      issuedDate: r.data.issuedDate || null, expiryDate: r.data.expiryDate || null, note: r.data.note,
      replaceId: replaceDoc?.id || null, replaceReason: r.data.replaceReason || '',
    };
    return ctx.tx((d, env) => addDocument(d, env, payload), payload.type === 'Giấy đăng ký hộ kinh doanh' ? 'Đã lưu Giấy ĐK HKD · tòa chuyển “Đã đăng ký (theo tài liệu)”' : 'Đã lưu tài liệu · Chờ xác minh');
  });
}
