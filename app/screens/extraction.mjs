// Screen 03.1 — Trích xuất HĐ chủ nhà (FR03): Upload → Trích xuất → Review → Validate → Commit.
import { chip, btn, card, table, stepper, alert, note, grid, icon, rowCls, esc } from '../ui/shell.mjs';
import { abtn, pend, pendBlock, notSpecified, muted } from '../ui/controls.mjs';
import { openModal, confirmModal } from '../ui/modal.mjs';
import { toast } from '../ui/toast.mjs';
import { STEPS, counters, remainingConflicts, uploadFile, runExtraction, choose, validateJob, commitJob, commitDuplicate } from '../core/domain/extraction.mjs';
import { FIELDS, HANDOVER, CONFLICTS, WARNINGS, SRC } from '../data/landlord-tungsoi.mjs';
import { dtVN, dateVN } from '../core/format.mjs';
import { crumbs, GROUP } from './common.mjs';
import { duplicatePopup } from './popups/landlord.mjs';

const MARK = { ok: `<span class="pos">${icon('check', 13)}</span>`, warn: `<span class="wtx">${icon('alert', 13)}</span>`, conflict: `<span class="neg">${icon('x', 13)}</span>` };
const DEC = (d) => (d === 'Làm sau' ? chip(d, 'neutral', 'clock') : `<span class="tag">${d}</span>`);
/** Vùng trên trang 3 của file gốc cho các trường có bằng chứng. */
const REGION = { 'Giá thuê': ['r41', 'tr.3 · Đ.4.1'], 'Kỳ · hạn trả': ['r44', 'tr.3 · Đ.4.4'], 'Số tiền cọc': ['r51', 'tr.3 · Đ.5.1'] };

async function hashFile(file) {
  const buf = await file.arrayBuffer();
  if (crypto?.subtle) {
    const h = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 12);
  }
  let h = 0x811c9dc5; const u = new Uint8Array(buf);
  for (const b of u) { h ^= b; h = Math.imul(h, 16777619) >>> 0; }
  return `fnv${h.toString(16)}`;
}

const jobOf = (ctx) => ctx.state.extractionJobs.find((j) => j.id === ctx.query.job);

// ---------- Bước 0: Upload ----------
function uploadView(ctx) {
  const jobs = [...ctx.state.extractionJobs].reverse();
  const perm = ctx.can('extraction.run');
  return `${stepper(STEPS, 0)}
    ${alert('Chỉ nhận HĐ thuê nguyên tòa từ chủ nhà', 'Hợp đồng thuê phòng của khách đi qua UI-08. Upload file trùng hash sẽ mở lại job cũ.', 'info')}
    ${grid('1.3fr 1fr', [
    card(`${icon('upload', 16)} Upload HĐ chủ nhà`, `
        <label class="drop" id="xdrop" ${perm.ok ? '' : `aria-disabled="true" data-tip="${esc(perm.reason)}"`}>${icon('upload', 24)}
          <div style="margin-top:6px"><b>Kéo thả file HĐ vào đây</b> hoặc bấm để chọn</div>
          <small>.doc, .docx, .pdf hoặc ảnh · lưu hash SHA-256 để phát hiện upload trùng</small>
          <input type="file" id="xfile" accept=".doc,.docx,.pdf,.jpg,.jpeg,.png" ${perm.ok ? '' : 'disabled'}/></label>
        <div style="display:flex;gap:8px;align-items:center;margin-top:10px">${abtn({ text: 'Dùng file mẫu tùng sói', ic: 'file', act: 'use-sample', perm })}<span class="muted" style="font-size:12px">${esc(SRC.file)} · hash ${SRC.hash}…</span></div>
        ${note('Trích xuất trong mockup là MÔ PHỎNG: mọi file đều trả về trường của HĐ mẫu tùng sói.')}`),
    card(`${icon('history', 16)} Job trích xuất`, jobs.length ? table([{ h: 'Job' }, { h: 'File' }, { h: 'Trạng thái' }, { h: 'Tải lúc' }], jobs.map((j) => {
      const r = [`<span class="mono">${j.id}</span>`, `<small>${esc(j.file.name)}</small>`, chip(j.status, j.committed ? 'ok' : 'info', j.committed ? 'check' : 'scan'), `<small>${dtVN(j.uploadedAt)}</small>`];
      r._attrs = `data-href="#/landlords/import?job=${j.id}" tabindex="0"`;
      return r;
    }), { compact: 1 }) : `<p class="muted">Chưa có job.</p>`, '', 'flush'),
  ])}`;
}

// ---------- Bước 1: Trích xuất ----------
function extractView(ctx, job) {
  return `${stepper(STEPS, 1)}
    ${card(`${icon('scan', 16)} Trích xuất · ${esc(job.file.name)}`, `
      <p>Đọc lớp chữ (hoặc OCR nếu là bản scan) → đề xuất trường theo Điều 1–12 và Phụ lục I–II, giữ trang/vùng làm bằng chứng.</p>
      <p style="margin-top:8px">${chip('Mô phỏng trích xuất — trả về trường của HĐ mẫu tùng sói', 'assumed', 'alert')}</p>
      <div style="margin-top:12px">${abtn({ text: 'Chạy trích xuất', kind: 'primary', ic: 'scan', act: 'extract', perm: ctx.can('extraction.run') })}</div>`)}`;
}

// ---------- Bước 2–3: Review / Validate ----------
function viewer(ctx, job) {
  const L = ctx.local;
  const page = L.page || 3;
  const pages = job.file.pages || SRC.pages;
  const sel = L.region;
  const rg = (id, base, html) => `<div class="rg" data-action="pick-region" data-rg="${id}" style="${base}${sel === id ? ';box-shadow:0 0 0 3px #0F172A33' : ''}">${html}</div>`;
  const content = page === 3 ? `
    <div style="text-align:center;font-weight:700;font-size:11px;margin-bottom:8px">ĐIỀU 4: TIỀN THUÊ NHÀ VÀ<br/>PHƯƠNG THỨC THANH TOÁN</div>
    ${rg('r41', 'background:#DBEAFE;outline:2px solid var(--sec)', '4.1. Tiền thuê nhà mà bên B phải trả cho bên A là: <b>114.000.000 đồng/tháng</b>.')}
    <div>(Bằng chữ: Một trăm mười bốn triệu đồng chẵn)</div>
    <div style="color:#94A3B8">Tiền thuế nhà đất hàng năm và thuế thu nhập cá nhân… do bên A chịu.</div>
    <div style="color:#94A3B8">4.2. … giá thuê được điều chỉnh theo thị trường…</div>
    ${rg('r44', 'background:#FEF3C7;margin-top:4px', '4.4. Thanh toán theo kỳ <b>03 tháng/lần</b> … vào <b>ngày 01 đến ngày 10</b> của tháng đầu tiên trong kỳ thanh toán đó.')}
    <div style="text-align:center;font-weight:700;font-size:11px;margin:10px 0 6px">ĐIỀU 5: TIỀN ĐẶT CỌC</div>
    ${rg('r51', 'background:#FEE2E2;outline:2px solid var(--dan)', '5.1. … tiền đặt cọc là: <b>114.000.000 đồng/tháng</b>')}
    <div style="color:#94A3B8">5.2. Bên A hoàn trả tiền đặt cọc trong các trường hợp…</div>`
    : `<div style="display:grid;place-items:center;min-height:340px;text-align:center;color:#94A3B8">${icon('file', 28)}<div style="margin-top:6px">Trang ${page} · nội dung mô phỏng</div>${pend('mockup chỉ dựng trang 3')}</div>`;
  const loc = L.loc || 'tr.3 · Đ.4.1';
  return card(`${icon('file', 16)} Tệp & trang`, `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span class="btn sm"><span data-action="page-prev" role="button" tabindex="0" aria-label="Trang trước">${icon('arrowLeft', 12)}</span> ${page} / ${pages} <span data-action="page-next" role="button" tabindex="0" aria-label="Trang sau">${icon('arrowRight', 12)}</span></span><span class="tag" data-action="zoom" role="button" tabindex="0">100 %</span>
    </div>
    <div class="pgv" style="border:1px solid var(--bd);border-radius:6px;padding:14px 12px;background:#fff;font-size:10.5px;line-height:1.6;color:#334155;min-height:380px">${content}</div>
    <div class="dl c1" style="margin-top:10px">
      <div><dt>Raw</dt><dd data-action="raw" role="button" tabindex="0">${icon('eye', 12)}</dd></div><div><dt>Chuẩn hóa</dt><dd data-action="norm" role="button" tabindex="0">${icon('check', 12)}</dd></div><div><dt>Trang / vùng</dt><dd>${loc}</dd></div>
    </div>`);
}

function fieldsCard(ctx, job) {
  const L = ctx.local;
  const all = FIELDS.flatMap((g) => g.rows);
  const rows = FIELDS.flatMap((g, gi) => {
    const rs = g.rows.map((r, ri) => ({ r, ri })).filter(({ r }) => !L.onlyIssues || r[3] !== 'ok');
    if (!rs.length) return [];
    return [
      rowCls([`<b>${g.group}</b> <span class="mono muted">${g.dieu}</span>`, `<span class="muted">→ ${g.target}</span>`, DEC(g.decision)], 'hl'),
      ...rs.map(({ r: [f, raw, norm, st], ri }) => {
        const row = rowCls([`<span style="display:inline-flex;gap:6px;align-items:center">${MARK[st]}${f}</span>`, `<span class="muted">${raw}</span>`, norm],
          `${st === 'conflict' ? 'dangerrow' : st === 'warn' ? 'warnrow' : ''} ${L.fi === `${gi}-${ri}` ? 'fsel-row' : ''}`);
        row._attrs = `data-action="pick-field" data-fi="${gi}-${ri}" tabindex="0" style="cursor:pointer"`;
        return row;
      }),
    ];
  });
  return card(`${icon('layers', 16)} ② Nhóm trường theo Điều`, table([
    { h: 'Trường', w: '165px' }, { h: 'Nguyên văn trong HĐ' }, { h: 'Chuẩn hóa / đích', w: '200px' },
  ], rows, { compact: 1, foot: `<span>${icon('check', 12)} đọc được · ${icon('alert', 12)} cảnh báo · ${icon('x', 12)} chặn commit · quyết định Create / Link / Ignore theo nhóm ${pend('Dropdown hay Tag chỉ đọc?')}</span><span>${all.length} trường · ${FIELDS.length} nhóm</span>` }),
  btn('Chỉ hiện cần xử lý', `outline sm${L.onlyIssues ? ' on' : ''}`, 'filter', 'data-action="only-issues"'), 'flush');
}

function rail(ctx, job) {
  const c = counters(job);
  const perm = ctx.can('extraction.run');
  const locked = !!job.committed;
  const conflict = (cf, i) => {
    const v = job.choices[cf.id];
    const opt = cf.options.find((o) => o.v === v);
    const done = v && !opt?.blocking;
    return `<div class="cfl ${done ? 'done' : ''}">
      <b>${icon(done ? 'check' : 'x', 14)} ${i + 1}. ${cf.title}</b>
      <p>${cf.text}${cf.id === 'dates' && job.enteredDates ? `<br/><b style="color:inherit">Đã nhập: bắt đầu ${dateVN(job.enteredDates.startDate)}</b>` : ''}</p>
      <div class="opts">${cf.options.map((o) => btn(o.label, `sm${v === o.v ? ' sel' : ''}`, '', `data-action="choose" data-c="${cf.id}" data-v="${o.v}"${locked || !perm.ok ? ` aria-disabled="true" data-tip="${esc(locked ? 'Job đã commit' : perm.reason)}"` : ''}`) + (o.pending ? pend(o.pending) : '')).join('')}</div></div>`;
  };
  return `
    <h3>Job ${job.id}</h3>
    <p class="muted" style="font-size:12px">${esc(job.file.name)}<br/>${job.file.sizeKb} KB · ${job.file.pages || '?'} trang · hash ${job.file.hash}… · ${esc(job.uploadedBy)} tải ${dtVN(job.uploadedAt)}</p>
    <h4>③ Tổng hợp</h4><div class="dl c2">
      <div><dt>Đọc được</dt><dd>${c.ok}</dd></div><div><dt>Cảnh báo</dt><dd class="wtx">${c.warn}</dd></div>
      <div><dt>Xung đột chặn</dt><dd class="neg">${c.conflicts}</dd></div><div><dt>Tài sản phụ lục</dt><dd>${c.annex}</dd></div>
    </div>
    <h4>④ Xung đột phải chọn trước commit</h4>
    ${CONFLICTS.map(conflict).join('')}
    <h4>⑤ Cảnh báo không chặn</h4>
    <div style="font-size:12px;line-height:1.7">${WARNINGS.map(([t, k, text]) => `${chip(t, k)} ${text}`).join('<br/>')}</div>
    <h4>Kết quả khi commit</h4>
    <div class="dl c1">
      <div><dt>${icon('user', 13)} Chủ nhà</dt><dd>1 · ${job.dup?.decision === 'use' ? 'Link' : 'Create'}</dd></div>
      <div><dt>${icon('file', 13)} HĐ đầu vào</dt><dd>1 · Nháp</dd></div>
      <div><dt>${icon('building', 13)} Tòa</dt><dd>1 · ứng viên</dd></div>
      <div><dt>${icon('database', 13)} Tài liệu</dt><dd>3 · HĐ, PL bàn giao, CCCD</dd></div>
      <div><dt>${icon('package', 13)} Tài sản chủ nhà</dt><dd>${HANDOVER.filter((h) => h[3] === 'asset').length}</dd></div>
      <div><dt>${icon('gauge', 13)} Công tơ điện · nước</dt><dd>2 · chờ mã</dd></div>
      <div><dt>${icon('layers', 13)} Phòng</dt><dd>0 · tạo ở UI-05</dd></div>
    </div>
    ${note('Commit là một transaction: lỗi một entity thì rollback toàn bộ. Upload trùng hash mở lại job cũ.')}`;
}

function committedView(ctx, job) {
  const c = job.committed;
  const b = ctx.state.buildings.find((x) => x.id === c.buildingId);
  return `${stepper(STEPS, 5)}
    ${alert(`Đã commit lúc ${dtVN(c.at)}`, 'Một transaction đã tạo: 1 chủ nhà, 1 HĐ đầu vào Nháp, 1 tòa Chuẩn bị, 3 tài liệu, 11 tài sản bàn giao của chủ nhà, 2 công tơ cấp tòa, 0 phòng.', 'ok')}
    ${card(`${icon('link', 16)} Bản ghi đã tạo`, `<div class="kv-inline">
      <button class="btn outline" data-nav="#/landlords/${c.landlordId}">${icon('user', 15)}Chủ nhà ${c.landlordId}</button>
      <button class="btn outline" data-nav="#/head-leases/${c.headLeaseId}">${icon('file', 15)}HĐ đầu vào ${c.headLeaseId}</button>
      <button class="btn outline" data-nav="#/buildings/${c.buildingId}">${icon('building', 15)}Tòa ${esc(b?.name || '')}</button></div>`)}`;
}

function render(ctx) {
  const job = ctx.query.job ? jobOf(ctx) : null;
  const base = { active: 'UI-03', ...crumbs(ctx, [[GROUP, null], ['Chủ nhà', '/landlords'], ['Tạo từ HĐ chủ nhà']]), title: 'Trích xuất HĐ chủ nhà' };
  const sub = (f) => `Route đề xuất #/landlords/import · nguồn: ${f === SRC.file ? 'HĐ thuê nhà 2026 (mẫu) — Phí Văn Thắng · 25A Phú Diễn' : esc(f)}`;
  if (!job) {
    return { ...base, status: chip('Chờ upload', 'neutral', 'upload'), subtitle: 'Route đề xuất #/landlords/import · job riêng, tách khỏi OCR hợp đồng khách (UI-08)', body: uploadView(ctx) };
  }
  const statusChip = `${chip(job.status, job.committed ? 'ok' : 'info', job.committed ? 'check' : 'scan')}${pend('tên trạng thái job')}`;
  if (job.committed) {
    return { ...base, status: statusChip, subtitle: sub(job.file.name), actions: abtn({ text: 'Mở HĐ đầu vào', kind: 'primary', ic: 'file', act: 'open-hl' }), body: committedView(ctx, job) };
  }
  if (job.step === 1) return { ...base, status: statusChip, subtitle: sub(job.file.name), body: extractView(ctx, job) };
  const left = remainingConflicts(job);
  const perm = ctx.can('extraction.run');
  const commitBtn = left.length
    ? abtn({ text: `Commit · còn ${left.length} xung đột`, kind: 'primary', ic: 'lock', act: 'commit', disabled: true, tip: `Chọn hướng xử lý: ${left.map((c) => c.title).join(' · ')}` })
    : abtn({ text: 'Commit', kind: 'primary', ic: 'check', act: 'commit', perm });
  const validated = job.step === 3 ? alert('Đã validate', `0 xung đột chặn · ${counters(job).warn} cảnh báo được ghi nhận để bổ sung sau.`, 'ok') : '';
  return {
    ...base, status: statusChip, subtitle: sub(job.file.name),
    actions: `${abtn({ text: 'Validate', ic: 'check', act: 'validate', perm })}${commitBtn}`,
    body: `${stepper(STEPS, job.step)}
      ${alert('Chỉ nhận HĐ thuê nguyên tòa từ chủ nhà', 'Hợp đồng thuê phòng của khách đi qua UI-08. Giá trị trong file chỉ là đề xuất: người review xác nhận từng nhóm; trường trống giữ trống, hệ thống không suy diễn.', 'info')}
      ${validated}${pendBlock('Trích xuất đang là mô phỏng', 'Mọi file trả về trường của HĐ mẫu tùng sói; job khác LLX-001 dùng cùng dữ liệu.')}
      ${grid('230px 1fr', [viewer(ctx, job), fieldsCard(ctx, job)])}`,
    rail: rail(ctx, job),
  };
}

async function startUpload(ctx, file) {
  const hash = await hashFile(file);
  const res = ctx.tx((d, env) => uploadFile(d, env, { name: file.name, sizeKb: Math.max(1, Math.round(file.size / 1024)), hash }));
  if (!res.ok) return;
  toast(res.r.reopened ? 'info' : 'ok', res.r.reopened ? `File trùng hash — mở lại job ${res.r.job.id}` : `Đã tạo job ${res.r.job.id}`, `hash ${hash}…`);
  ctx.go(`#/landlords/import?job=${res.r.job.id}`);
}

export default {
  render,
  onMount(ctx, main) {
    const input = main.querySelector('#xfile');
    const drop = main.querySelector('#xdrop');
    if (!input || input.disabled) return;
    input.addEventListener('change', () => input.files[0] && startUpload(ctx, input.files[0]));
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer.files[0]) startUpload(ctx, e.dataTransfer.files[0]); });
  },
  actions: {
    'use-sample': (el, e, ctx) => {
      const res = ctx.tx((d, env) => uploadFile(d, env, { name: SRC.file, sizeKb: SRC.sizeKb, pages: SRC.pages, hash: SRC.hash }));
      if (res.ok) { toast('info', `File trùng hash — mở lại job ${res.r.job.id}`); ctx.go(`#/landlords/import?job=${res.r.job.id}`); }
    },
    extract: (el, e, ctx) => ctx.tx((d, env) => runExtraction(d, env, ctx.query.job), 'Đã trích xuất (mô phỏng) · 29 trường theo 10 nhóm'),
    'page-prev': (el, e, ctx) => { ctx.local.page = Math.max(1, (ctx.local.page || 3) - 1); ctx.rerender(); },
    'page-next': (el, e, ctx) => { const j = jobOf(ctx); ctx.local.page = Math.min(j.file.pages || SRC.pages, (ctx.local.page || 3) + 1); ctx.rerender(); },
    zoom: () => notSpecified('FR03 · 03.1 · Tỷ lệ phóng'),
    raw: () => notSpecified('FR03 · 03.1 · Raw', 'Dự kiến hiển thị lớp chữ thô.'),
    norm: () => notSpecified('FR03 · 03.1 · Chuẩn hóa'),
    'only-issues': (el, e, ctx) => { ctx.local.onlyIssues = !ctx.local.onlyIssues; ctx.rerender(); },
    'pick-field': (el, e, ctx) => {
      const [gi, ri] = el.dataset.fi.split('-').map(Number);
      const g = FIELDS[gi]; const f = g.rows[ri][0];
      const reg = REGION[f];
      Object.assign(ctx.local, { fi: el.dataset.fi, region: reg?.[0] || null, loc: reg ? reg[1] : `${g.dieu} · trang mô phỏng`, page: reg ? 3 : ctx.local.page });
      ctx.rerender();
    },
    'pick-region': (el, e, ctx) => {
      const id = el.dataset.rg;
      const entry = Object.entries(REGION).find(([, v]) => v[0] === id);
      const gi = FIELDS.findIndex((g) => g.rows.some((r) => r[0] === entry[0]));
      const ri = FIELDS[gi].rows.findIndex((r) => r[0] === entry[0]);
      Object.assign(ctx.local, { fi: `${gi}-${ri}`, region: id, loc: entry[1][1] });
      ctx.rerender();
    },
    choose: async (el, e, ctx) => {
      const { c, v } = el.dataset;
      let extra = {};
      if (c === 'dates' && v === 'enter') {
        const r = await openModal({
          title: `${icon('calendar', 18)} Nhập ngày thuê (Đ.2)`, sub: `Screen ## · ${pend('popup chưa có capture')}`, width: 440,
          body: `<div class="field"><label>Ngày giao nhà</label><div class="in"><input class="bare" type="date" name="handoverDate"/></div><div class="hint">Để trống = trùng ngày bắt đầu</div></div>
            <div class="field"><label>Ngày bắt đầu <span class="req">*</span></label><div class="in"><input class="bare" type="date" name="startDate"/></div><div class="hint">Ngày kết thúc = ngày bắt đầu + 60 tháng − 1 ngày (dự kiến)</div></div>`,
          buttons: [{ label: 'Hủy', act: 'cancel' }, { label: 'Lưu ngày', act: 'ok', kind: 'primary', ic: 'check', enabledWhen: (d) => d.startDate }],
        });
        if (r?.act !== 'ok') return;
        extra = { dates: { startDate: r.data.startDate, handoverDate: r.data.handoverDate || r.data.startDate } };
      }
      ctx.tx((d, env) => choose(d, env, ctx.query.job, c, v, extra));
      const opt = CONFLICTS.find((x) => x.id === c).options.find((o) => o.v === v);
      if (opt.blocking) toast('warn', 'Xung đột vẫn chặn commit', opt.pending || '');
    },
    validate: (el, e, ctx) => ctx.tx((d, env) => validateJob(d, env, ctx.query.job), 'Validate xong · không còn xung đột chặn'),
    commit: async (el, e, ctx) => {
      const jobId = ctx.query.job;
      let dup = null;
      const hit = commitDuplicate(ctx.state);
      if (hit) { dup = await duplicatePopup(hit); if (!dup) return; }
      const ok = await confirmModal({
        title: `Commit job ${jobId}?`, okLabel: 'Commit', okIc: 'check', width: 520,
        text: `Một transaction sẽ tạo chủ nhà${dup?.decision === 'use' ? ` (liên kết ${dup.existingId})` : ''}, HĐ đầu vào Nháp, tòa Chuẩn bị, 3 tài liệu, 11 tài sản bàn giao, 2 công tơ cấp tòa và <b>0 phòng</b>. Lỗi một entity thì rollback toàn bộ. ${pend('Screen ## · popup xác nhận chưa có capture')}`,
      });
      if (!ok) return;
      const failAt = new URLSearchParams(location.search).get('failAt');
      const res = ctx.tx((d, env) => commitJob(d, env, jobId, { dup, failAt }), 'Đã commit trích xuất');
      if (res.ok) {
        toast('info', 'Chuyển tới HĐ đầu vào vừa tạo', 'Màn đích sau commit là dự kiến (SRS FR03 User steps · Step 4)');
        ctx.go(`#/head-leases/${res.r.headLeaseId}`);
      }
    },
    'open-hl': (el, e, ctx) => ctx.go(`#/head-leases/${jobOf(ctx).committed.headLeaseId}`),
  },
};
