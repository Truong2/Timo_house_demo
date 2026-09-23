/* DataTable: sort / phân trang / checkbox / row menu. Render vào container. */
(function (TH) {
  const F = TH.f, U = TH.ui, I = TH.icon, esc = F.esc;
  /**
   * opts: { cols:[{key,label,render(row),sortable,num,sortVal(row),cls,hideable}], rows, pageSize, selectable, rowKey, rowClass(row), unit, empty, compact, editable,
   *         onSelect(ids), sortKey, sortDir, footer(html), extraFooter, noPager, colPrefsKey, presets, preset,
   *         rowHref(row), onRowOpen(row), density:'compact'|'comfortable', densityControl, sticky, loading, error }
   */
  U.table = (container, opts) => {
    if (container.classList && container.classList.contains('card')) { if (!container._tblWrap) { container._tblWrap = document.createElement('div'); container.appendChild(container._tblWrap); } container = container._tblWrap; }
    const savedPreset = presetPref(opts.colPrefsKey);
    const st = container._tbl = container._tbl || { page: 1, size: opts.pageSize || 10, sortKey: opts.sortKey || null, sortDir: opts.sortDir || 'asc', selected: new Set(), hidden: new Set(prefs(opts.colPrefsKey)), preset: savedPreset || opts.preset || 'default', density: opts.density || densityPref() };
    st.opts = opts;
    if (!opts.presets || (!opts.presets[st.preset] && st.preset !== 'default')) st.preset = 'default';
    const effectiveHidden = () => {
      if (st.preset === 'default' || !st.opts.presets || !st.opts.presets[st.preset]) return new Set(st.hidden);
      const visible = new Set(st.opts.presets[st.preset].cols || []);
      return new Set(st.opts.cols.filter(c => c.key !== 'actions' && !visible.has(c.key)).map(c => c.key));
    };
    const render = () => {
      const o = st.opts; let rows = o.rows.slice();
      if (st.sortKey) { const col = o.cols.find(c => c.key === st.sortKey); const sv = (r) => col && col.sortVal ? col.sortVal(r) : r[st.sortKey]; rows.sort((a, b) => { const x = sv(a), y = sv(b); const c = (x == null) - (y == null) || (typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), 'vi')); return st.sortDir === 'asc' ? c : -c; }); }
      const total = rows.length, pages = Math.max(1, Math.ceil(total / st.size)); if (st.page > pages) st.page = pages;
      const from = (st.page - 1) * st.size; const pageRows = o.noPager ? rows : rows.slice(from, from + st.size);
      const hidden = effectiveHidden();
      // Cột Thao tác luôn nằm cuối bảng (cột preset/workbook chèn trước nó)
      const cols = o.cols.filter(c => !hidden.has(c.key)).sort((a, b) => (a.key === 'actions') - (b.key === 'actions'));
      const key = (r) => o.rowKey ? o.rowKey(r) : r.id;
      const allSel = pageRows.length && pageRows.every(r => st.selected.has(key(r)));
      const head = `<tr>${o.selectable ? `<th style="width:36px"><input type="checkbox" data-act="tsel-all" ${allSel ? 'checked' : ''}></th>` : ''}${cols.map(c => `<th class="${c.num ? 'num' : ''} ${c.sortable ? 'sortable' : ''} ${st.sortKey === c.key ? 'sorted' : ''} ${c.cls || ''}" ${c.sortable ? `data-act="tsort" data-key="${c.key}" aria-sort="${st.sortKey === c.key ? (st.sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}" tabindex="0"` : ''} ${c.width ? `style="width:${c.width}"` : ''}>${c.label}${c.sortable ? `<span class="sort" aria-hidden="true">${st.sortKey === c.key ? (st.sortDir === 'asc' ? '↑' : '↓') : '⇅'}</span>` : ''}</th>`).join('')}</tr>`;
      const openable = !!(o.rowHref || o.onRowOpen);
      const body = o.loading ? `<tr><td colspan="${cols.length + (o.selectable ? 1 : 0)}"><div class="table-skeleton">${[1, 2, 3, 4, 5].map(() => '<span></span>').join('')}</div></td></tr>` : o.error ? `<tr><td colspan="${cols.length + (o.selectable ? 1 : 0)}">${U.empty({ icon: 'alert-circle', title: 'Không tải được dữ liệu', text: typeof o.error === 'string' ? o.error : 'Vui lòng thử lại sau.' })}</td></tr>` : pageRows.length ? pageRows.map((r, i) => `<tr data-rk="${esc(key(r))}" data-row-index="${i}" ${openable ? 'data-row-open="1" tabindex="0"' : ''} class="${openable ? 'is-openable' : ''} ${o.rowClass ? o.rowClass(r) : ''} ${st.selected.has(key(r)) ? 'selected' : ''}">${o.selectable ? `<td><input type="checkbox" data-act="tsel" data-k="${esc(key(r))}" ${st.selected.has(key(r)) ? 'checked' : ''} ${o.selectableIf && !o.selectableIf(r) ? 'disabled' : ''}></td>` : ''}${cols.map(c => `<td class="${c.num ? 'num' : ''} ${c.cls || ''}">${c.render ? c.render(r, from + i) : esc(r[c.key] ?? '')}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${cols.length + (o.selectable ? 1 : 0)}">${o.empty || U.empty({ title: 'Không có dữ liệu phù hợp', text: 'Thử đổi bộ lọc hoặc tạo mới.' })}</td></tr>`;
      const densityControl = o.densityControl ? `<div class="table-density" aria-label="Mật độ bảng"><button type="button" data-act="tdensity" data-density="compact" class="${st.density === 'compact' ? 'on' : ''}" data-tip="Bảng gọn">${I('list')}</button><button type="button" data-act="tdensity" data-density="comfortable" class="${st.density === 'comfortable' ? 'on' : ''}" data-tip="Bảng thoáng">${I('menu')}</button></div>` : '';
      container.innerHTML = `${densityControl}<div class="tbl-wrap ${o.sticky === false ? '' : 'sticky-head'}"><table class="tbl ${o.compact || st.density === 'compact' ? 'compact' : 'comfortable'} ${o.editable ? 'editable' : ''}"><thead>${head}</thead><tbody>${body}</tbody>${o.footer ? `<tfoot>${o.footer(rows)}</tfoot>` : ''}</table></div>${o.noPager ? (o.extraFooter || '') : U.pager({ page: st.page, pages, total, from: from + 1, to: Math.min(from + st.size, total), unit: o.unit || 'bản ghi', size: st.size })}`;
      if (o.onRender) o.onRender(container, pageRows);
    };
    if (!container._bound) {
      container._bound = true;
      U.bind(container, {
        tsort: (el) => { const k = el.dataset.key; if (st.sortKey === k) st.sortDir = st.sortDir === 'asc' ? 'desc' : 'asc'; else { st.sortKey = k; st.sortDir = 'asc'; } render(); },
        page: (el) => { st.page = Number(el.dataset.p); render(); },
        'tsel-all': (el) => { const o = st.opts; const rows = visibleRows(); rows.forEach(r => { const k = o.rowKey ? o.rowKey(r) : r.id; if (o.selectableIf && !o.selectableIf(r)) return; if (el.checked) st.selected.add(k); else st.selected.delete(k); }); render(); o.onSelect && o.onSelect([...st.selected]); },
        tsel: (el) => { if (el.checked) st.selected.add(el.dataset.k); else st.selected.delete(el.dataset.k); const tr = el.closest('tr'); tr && tr.classList.toggle('selected', el.checked); st.opts.onSelect && st.opts.onSelect([...st.selected]); },
      }, 'change');
      U.bind(container, { page: (el) => { st.page = Number(el.dataset.p); render(); }, tsort: (el) => { const k = el.dataset.key; if (st.sortKey === k) st.sortDir = st.sortDir === 'asc' ? 'desc' : 'asc'; else { st.sortKey = k; st.sortDir = 'asc'; } render(); }, tdensity: (el) => { st.density = el.dataset.density; saveDensity(st.density); render(); } });
      container.addEventListener('change', (e) => { if (e.target.matches('[data-act=psize]')) { st.size = Number(e.target.value); st.page = 1; render(); } });
      const openRow = (tr) => { const o = st.opts, rows = visibleRows(), row = rows[Number(tr.dataset.rowIndex)]; if (!row) return; if (o.onRowOpen) o.onRowOpen(row); else if (o.rowHref) TH.go(typeof o.rowHref === 'function' ? o.rowHref(row) : o.rowHref); };
      container.addEventListener('click', (e) => { const tr = e.target.closest('tr[data-row-open]'); if (!tr || e.target.closest('a,button,input,select,textarea,[data-act]')) return; openRow(tr); });
      container.addEventListener('keydown', (e) => { const tr = e.target.closest('tr[data-row-open]'); if (tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openRow(tr); } });
      container.addEventListener('keydown', (e) => { const th = e.target.closest('th[data-act="tsort"]'); if (th && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (st.sortKey === th.dataset.key) st.sortDir = st.sortDir === 'asc' ? 'desc' : 'asc'; else { st.sortKey = th.dataset.key; st.sortDir = 'asc'; } render(); } });
    }
    const visibleRows = () => { const o = st.opts; const from = (st.page - 1) * st.size; return o.noPager ? o.rows : o.rows.slice(from, from + st.size); };
    render();
    return {
      render, selected: () => [...st.selected], clearSelection: () => { st.selected.clear(); render(); }, setRows: (rows) => { st.opts.rows = rows; st.page = 1; render(); },
      toggleCol: (key) => { if (st.preset !== 'default') { st.preset = 'default'; savePreset(opts.colPrefsKey, st.preset); } if (st.hidden.has(key)) st.hidden.delete(key); else st.hidden.add(key); savePrefs(opts.colPrefsKey, [...st.hidden]); render(); },
      setPreset: (key) => { st.preset = key && opts.presets && opts.presets[key] ? key : 'default'; savePreset(opts.colPrefsKey, st.preset); st.page = 1; render(); },
      hidden: () => [...effectiveHidden()], visibleCols: () => st.opts.cols.filter(c => !effectiveHidden().has(c.key)), presets: () => opts.presets || {}, state: st,
    };
  };
  function prefs(k) { if (!k) return []; try { return (TH.store.state.meta.columnPrefs || {})[k] || []; } catch (e) { return []; } }
  function savePrefs(k, v) { if (!k) return; TH.store.state.meta.columnPrefs = TH.store.state.meta.columnPrefs || {}; TH.store.state.meta.columnPrefs[k] = v; TH.store.save(); }
  function presetPref(k) { if (!k) return ''; try { return (((TH.store.state.meta.uiPrefs || {}).tablePreset || {})[k]) || ''; } catch (e) { return ''; } }
  function savePreset(k, v) { if (!k) return; const m = TH.store.state.meta; m.uiPrefs = m.uiPrefs || {}; m.uiPrefs.tablePreset = m.uiPrefs.tablePreset || {}; m.uiPrefs.tablePreset[k] = v; TH.store.save(); }
  function densityPref() { try { return localStorage.getItem('timohouse.table.density') || 'compact'; } catch (e) { return 'compact'; } }
  function saveDensity(v) { try { localStorage.setItem('timohouse.table.density', v); } catch (e) { } }
  U.columnMenu = (anchor, tbl, cols) => {
    const presets = tbl.presets ? tbl.presets() : {}, entries = Object.entries(presets);
    U.menu(anchor, [...(entries.length ? [{ header: 'Bộ cột' }, { label: (tbl.state.preset === 'default' ? '◉ ' : '○ ') + 'Mặc định', onClick: () => tbl.setPreset('default') }, ...entries.map(([key, p]) => ({ label: (tbl.state.preset === key ? '◉ ' : '○ ') + p.label, onClick: () => tbl.setPreset(key) })), { divider: true }] : []), { header: 'Hiển thị cột' }, ...cols.filter(c => c.hideable !== false && c.key !== 'actions').map(c => ({ label: (tbl.hidden().includes(c.key) ? '☐ ' : '☑ ') + c.label.replace(/<[^>]+>/g, ''), onClick: () => tbl.toggleCol(c.key) }))]);
  };
  U.tableCsv = (tbl, rows) => {
    const cols = tbl.visibleCols().filter(c => c.key !== 'actions' && c.csv !== false);
    return F.csv(rows.map((row, index) => cols.map(c => c.csv ? c.csv(row, index) : F.stripTags(c.render ? c.render(row, index) : row[c.key]))), cols.map(c => F.stripTags(c.label)));
  };
  // cell helpers
  U.cell2 = (a, b, aCls = '') => `<div class="cell2"><span class="${aCls}">${a}</span>${b ? `<small>${b}</small>` : ''}</div>`;
  U.link = (href, text, cls = '') => `<a href="${href}" class="link ${cls}">${text}</a>`;
  U.money = U.money; U.num = (n, cls = '') => `<span class="num ${cls}">${TH.f.vnd(n)}</span>`;
  U.rowActions = (btns) => `<div class="acts">${btns.join('')}</div>`;
  U.moreBtn = (id, extra = '') => `<button type="button" class="btn-icon act" data-act="more" data-id="${esc(id)}" ${extra} data-tip="Thao tác khác" aria-label="Thao tác khác">${I('more')}</button>`;
})(window.TH);
