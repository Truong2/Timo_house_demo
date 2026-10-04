/* Bộ tiện ích trang: chip trạng thái, bộ lọc đồng bộ URL, form drawer có lỗi theo trường, xuất CSV. */
(function (TH) {
  const F = TH.f, U = TH.ui, I = TH.icon, esc = F.esc, S = TH.store, Q = TH.q;
  const K = {};
  K.payChip = (st) => { const m = TH.calc.payments.STATUS[st] || { label: st, tone: 'gray' }; return U.chip(m.label, m.tone, true); };
  K.debtChip = (d) => ({
    none: U.chip('Không nợ', 'green'), in_term: U.chip('Trong hạn', 'blue'), overdue: U.chip('Quá hạn ' + d.days + ' ngày', 'amber'),
    debt: U.chip('Công nợ · ' + d.days + ' ngày', 'red'), draft: U.chip('Nháp', 'gray'),
  }[d.state] || '');
  K.lifeChip = (l) => ({ draft: U.chip('Nháp', 'gray'), issued: U.chip('Đã phát hành', 'blue'), adjusted: U.chip('Đã điều chỉnh', 'purple') }[l] || '');
  K.roomChip = (s) => { const m = TH.data.catalog.roomStatuses[s] || { label: s, tone: 'gray' }; return U.chip(m.label, m.tone, true); };
  K.stayChip = (s) => {
    if (s.status === 'pending') return U.chip('Chờ nhận (đã cọc)', 'purple', true);
    if (s.status === 'active') { const d = s.endDate ? F.daysBetween(F.today(), s.endDate) : 999; return d <= Q.param('expiryWarnDays') ? U.chip('Sắp hết hạn · ' + d + ' ngày', 'amber', true) : U.chip('Đang ở', 'green', true); }
    return U.chip(Q.endTypeLabel(s.endType) || 'Đã kết thúc', s.endType === 'expired' ? 'gray' : s.endType === 'transfer' ? 'blue' : 'red', true);
  };
  K.depChip = (d) => ({ held: U.chip('Đang giữ', 'blue'), refund_pending: U.chip('Chờ hoàn', 'amber'), refunded: U.chip('Đã hoàn', 'gray'), kept_breach: U.chip('Giữ cọc (phá HĐ)', 'red'),
    forfeited_revenue: U.chip('Cọc bỏ → doanh thu', 'purple'), transferred: U.chip('Chuyển sang phòng mới', 'blue'), partial: U.chip('Cọc còn thiếu', 'amber'), none: U.chip('Chưa nhận', 'gray') }[d] || '');
  K.money = (v, cls = '') => `<span class="num ${cls}">${F.vnd(v)}</span>`;
  K.room = (roomId) => { const r = Q.room(roomId); return r ? `<span class="code">${esc(r.code)}</span>` : '–'; };
  K.buildingOpts = (scoped = true) => (scoped ? Q.scopedBuildings() : S.all('buildings')).map(b => [b.id, b.code]);
  K.groupOpts = () => [['T', 'Nhà T'], ['S', 'Nhà S'], ['G', 'Nhà G']];
  K.areaOpts = () => S.all('areas').map(a => [a.id, a.name]);
  K.managerOpts = (date) => { const ids = new Set(S.all('assignments').filter(a => date ? (!a.from || a.from <= date) && (!a.to || date <= a.to) : !a.to).map(a => a.employeeId)); return S.all('employees').filter(e => ids.has(e.id)).map(e => [e.id, e.name]); }; // E3: theo ngày khi xem kỳ cũ
  K.periodOpts = () => S.all('periods').map(p => [p.id, F.periodLabel(p.id)]);

  /* Bộ lọc đồng bộ query: defs [{name,label,type:'select'|'search'|'date',options,all}] */
  K.filters = (defs, q, extra = '') => U.filterbar(defs.map(d => {
    if (d.type === 'search') return U.field({ name: d.name, label: d.label, input: U.input({ name: d.name, value: q[d.name] || '', placeholder: d.placeholder || 'Tìm…', attrs: { 'data-f': d.name }, icon: 'search' }) });
    if (d.type === 'date') return U.field({ name: d.name, label: d.label, input: U.date({ name: d.name, value: q[d.name] || d.value || '', attrs: { 'data-f': d.name } }) });
    return U.field({ name: d.name, label: d.label, input: U.select({ name: d.name, value: q[d.name] == null ? (d.value || '') : q[d.name], options: d.options, all: d.all === false ? '' : (d.all || 'Tất cả'), attrs: { 'data-f': d.name } }) });
  }), `<div class="field"><label>&nbsp;</label><button type="button" class="btn btn-ghost btn-sm" data-act="clear-f">Xóa bộ lọc</button></div>${extra}`);
  K.bindFilters = (root, keep = []) => {
    let t = null;
    root.addEventListener('change', (e) => { const el = e.target.closest('[data-f]'); if (!el || el.type === 'search' || el.name === 'q') return; TH.router.setQuery({ [el.dataset.f]: el.value, page: '' }); });
    root.addEventListener('input', (e) => { const el = e.target.closest('[data-f]'); if (!el || !(el.name === 'q' || el.type === 'search' || el.type === 'text')) return; clearTimeout(t); t = setTimeout(() => { TH.router.setQuery({ [el.dataset.f]: el.value }); const x = document.querySelector(`[data-f="${el.dataset.f}"]`); if (x) { x.focus(); x.setSelectionRange(x.value.length, x.value.length); } }, 350); });
    root.addEventListener('click', (e) => { if (e.target.closest('[data-act=clear-f]')) { const { query } = TH.router.parse(); const q = {}; keep.forEach(k => { if (query[k]) q[k] = query[k]; }); TH.router.replaceQuery(q); TH.router.refresh(); } });
  };
  K.match = (q, ...fields) => { if (!q) return true; const n = F.norm(q); return fields.some(v => F.norm(v).includes(n)); };

  /* Form drawer: fields [{name,label,type,options,req,value,help,span}] ; onSubmit(data) có thể throw e.fields */
  K.formDrawer = ({ title, sub = '', fields, submit = 'Lưu', onSubmit, wide = false, modal = false, note = '', size = '' }) => {
    const body = (note || '') + `<div class="form-grid">${fields.map(f => {
      if (f.type === 'html') return `<div class="${f.span ? 'span2' : ''}">${f.html}</div>`;
      let input;
      if (f.type === 'select') input = U.select({ name: f.name, value: f.value ?? '', options: f.options || [], placeholder: f.placeholder || 'Chọn…' });
      else if (f.type === 'money') input = U.money({ name: f.name, value: f.value ?? '' });
      else if (f.type === 'date') input = U.date({ name: f.name, value: f.value || '' });
      else if (f.type === 'textarea') input = U.textarea({ name: f.name, value: f.value || '', rows: f.rows || 3 });
      else if (f.type === 'check') input = U.check({ name: f.name, label: f.checkLabel || f.label, checked: !!f.value });
      else input = U.input({ name: f.name, value: f.value ?? '', type: f.type === 'number' ? 'number' : 'text', placeholder: f.placeholder || '', readonly: f.readonly });
      return U.field({ label: f.type === 'check' ? '' : f.label, req: f.req, help: f.help, input, name: f.name, cls: f.span ? 'span2' : '' });
    }).join('')}</div>`;
    const d = U.drawer({ title, sub, body, wide, modal, size, footer: U.btn({ label: 'Hủy', act: 'close-d' }) + U.btn({ label: submit, cls: 'btn-primary', act: 'submit-d' }) });
    U.bind(d.el, {
      'close-d': () => d.close(),
      'submit-d': async () => {
        const data = d.data();
        const submitBtn=d.el.querySelector('[data-act=submit-d]');if(submitBtn.disabled)return;submitBtn.disabled=true;submitBtn.setAttribute('aria-busy','true');const oldHtml=submitBtn.innerHTML;submitBtn.innerHTML=`${I('refresh')}<span>Đang xử lý…</span>`;
        try { const r = await onSubmit(data, d); if (r !== false) d.close(); }
        catch (e) { if (e.fields) U.setErrors(d.el, e.fields); U.toast('err', e.fields ? 'Kiểm tra các trường bắt buộc' : 'Không thực hiện được', e.message); }
        finally { if(submitBtn.isConnected){submitBtn.disabled=false;submitBtn.removeAttribute('aria-busy');submitBtn.innerHTML=oldHtml;} }
      },
    });
    return d;
  };
  K.act = (fn, okMsg) => { try { const r = fn(); if (okMsg) U.toast('ok', okMsg); return r; } catch (e) { U.toast('err', 'Không thực hiện được', e.message); return null; } };
  K.csv = (name, headers, rows, maskCols) => { if (maskCols) rows = K.maskCols(headers, rows, maskCols); F.download(name, F.csv(rows, headers)); U.toast('ok', 'Đã xuất ' + name, rows.length + ' dòng'); };
  /* Tab theo URL (?tab=) chỉ mở khi vai trò có quyền của tab – ẩn nút tab thôi chưa đủ */
  K.pickTab = (tabs, cur, def) => { const t = tabs.find(x => x.key === cur); return t && (!t.perm || TH.auth.can(t.perm)) ? cur : def; };
  K.wrapTables = root => root.querySelectorAll('.card-b>table.tbl').forEach(table => { const wrap = document.createElement('div'); wrap.className = 'tbl-wrap'; table.replaceWith(wrap); wrap.appendChild(table); });
  /* Xuất CSV: các cột số tiền bị che trên màn (không có quyền xem số tiền) cũng bị che trong file */
  K.maskCols = (headers, rows, cols, perm = 'debts.viewAmounts') => {
    if (TH.auth.can(perm)) return rows;
    const idx = cols.map(c => headers.indexOf(c)).filter(i => i >= 0);
    return rows.map(r => r.map((v, i) => idx.includes(i) ? '•••' : v));
  };
  /* Xuất Excel theo mẫu (SpreadsheetML .xls – Excel mở trực tiếp): khối thông tin (tên báo cáo, kỳ, bộ lọc, phiên bản số liệu, người xuất) + bảng dòng × cột */
  K.xlsXml = (sheet, meta, headers, rows) => {
    const x = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const cell = (v, st) => typeof v === 'number' && isFinite(v) ? `<Cell${st ? ` ss:StyleID="${st}"` : ''}><Data ss:Type="Number">${v}</Data></Cell>` : `<Cell${st ? ` ss:StyleID="${st}"` : ''}><Data ss:Type="String">${x(v)}</Data></Cell>`;
    return `<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`
      + `<Styles><Style ss:ID="h"><Font ss:Bold="1"/><Interior ss:Color="#E8EEF7" ss:Pattern="Solid"/></Style><Style ss:ID="t"><Font ss:Bold="1" ss:Size="13"/></Style><Style ss:ID="m"><Font ss:Color="#555555"/></Style></Styles>`
      + `<Worksheet ss:Name="${x(String(sheet).slice(0, 31))}"><Table>`
      + meta.map((m, i) => `<Row>${cell(Array.isArray(m) ? m[0] : m, i === 0 ? 't' : 'm')}${Array.isArray(m) ? cell(m[1], 'm') : ''}</Row>`).join('') + '<Row></Row>'
      + `<Row>${headers.map(h => cell(h, 'h')).join('')}</Row>` + rows.map(r => `<Row>${r.map(v => cell(v)).join('')}</Row>`).join('')
      + '</Table></Worksheet></Workbook>';
  };
  K.xls = (name, sheet, meta, headers, rows) => { F.download(name, K.xlsXml(sheet, meta, headers, rows), 'application/vnd.ms-excel'); U.toast('ok', 'Đã xuất ' + name, rows.length + ' dòng'); };
  K.xlsReportXml = (model) => {
    const x = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const cell = (v, style) => `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="${typeof v === 'number' && isFinite(v) ? 'Number' : 'String'}">${x(v)}</Data></Cell>`;
    const body = model.rows.map(r => `<Row ss:StyleID="${r.group ? 'group' : r.bold ? 'total' : 'normal'}">${cell(r.row,'integer')}${cell(r.label)}${r.values.map(v => cell(v == null ? '' : r.ratio ? Math.round(Number(v) * 1000000) / 1000000 : Math.round(Number(v)), r.ratio ? 'ratio' : 'money')).join('')}</Row>`).join('');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel"><Styles><Style ss:ID="normal"><Alignment ss:Vertical="Center"/></Style><Style ss:ID="head"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style><Style ss:ID="title"><Font ss:Bold="1" ss:Size="14"/></Style><Style ss:ID="meta"><Font ss:Color="#555555"/></Style><Style ss:ID="integer"><NumberFormat ss:Format="0"/></Style><Style ss:ID="money"><NumberFormat ss:Format="#,##0;[Red]-#,##0"/></Style><Style ss:ID="ratio"><NumberFormat ss:Format="0.00%"/></Style><Style ss:ID="group"><Font ss:Bold="1"/><Interior ss:Color="#E8EEF7" ss:Pattern="Solid"/></Style><Style ss:ID="total"><Font ss:Bold="1"/><Borders><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style></Styles><Worksheet ss:Name="${x((model.type === 'business' ? 'BÁO CÁO KINH DOANH' : 'BÁO CÁO TỔNG').slice(0,31))}"><Table ss:ExpandedColumnCount="6" ss:ExpandedRowCount="${model.metadata.length + model.rows.length + 2}"><Column ss:Width="42"/><Column ss:Width="260"/><Column ss:Width="95" ss:Span="3"/>${model.metadata.map((m,i) => `<Row ss:AutoFitHeight="1">${cell(m[0],i===0?'title':'meta')}${cell(m[1],'meta')}</Row>`).join('')}<Row></Row><Row ss:StyleID="head">${model.headers.map(h=>cell(h)).join('')}</Row>${body}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><FrozenNoSplit/><SplitHorizontal>${model.metadata.length + 2}</SplitHorizontal><TopRowBottomPane>${model.metadata.length + 2}</TopRowBottomPane><ActivePane>2</ActivePane></WorksheetOptions></Worksheet></Workbook>`;
  };
  K.xlsReport = (name, model) => { F.download(name, K.xlsReportXml(model), 'application/vnd.ms-excel'); U.toast('ok', 'Đã xuất ' + name, model.rows.length + ' dòng'); };
  K.kpis = (items) => `<div class="kpi-row">${items.map(k => U.kpi(k)).join('')}</div>`;
  K.tableCard = (id, title = '', actions = '', sub = '') => U.card({ title, actions, sub, body: `<div id="${id}"></div>`, bodyCls: 'flush' });
  TH.kit = K;
})(window.TH);
