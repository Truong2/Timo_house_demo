/* Store: state gốc dựng từ seed mỗi lần mở app + overlay thao tác người dùng trong localStorage.
   Chỉ bản ghi đã thêm/sửa/xóa được lưu (không lưu toàn bộ ~1.500 hóa đơn) → không vượt quota. */
(function (TH) {
  const KEY = 'timohouse-p1-v1';
  const SCHEMA = 2; // 2: Phase 3 – equipment → assets
  const S = { state: null, meta: null, session: null, version: 0, listeners: [], _dirty: {}, _idx: {}, _t: null, KEY };

  const seedHash = () => {
    const D = TH.data || {};
    const sig = [D.master && D.master.stays.length, D.p202609 && D.p202609.invoices.length, D.p202609 && D.p202609.payments.length, D.bench202608 ? 1 : 0, (D.catalog.params || []).length, SCHEMA].join('|');
    return TH.f.hash(sig);
  };
  const defaultMeta = () => ({ today: TH.f.DEMO_TODAY, period: '2026-09', milestone: '3', prefs: {}, seedHash: seedHash() });

  S.load = () => {
    S.state = TH.seed.build();
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
    if (saved && saved.schema === SCHEMA && saved.meta && saved.meta.seedHash === seedHash()) {
      S.meta = Object.assign(defaultMeta(), saved.meta);
      S.session = saved.session || null;
      S._dirty = saved.ops || {};
      Object.entries(S._dirty).forEach(([c, recs]) => {
        if (!S.state[c]) S.state[c] = [];
        const arr = S.state[c]; const pos = {}; arr.forEach((x, i) => { pos[x.id] = i; });
        Object.entries(recs).forEach(([id, rec]) => {
          if (rec === 0) { if (pos[id] != null) arr[pos[id]] = null; }
          else if (pos[id] != null) arr[pos[id]] = rec;
          else arr.push(rec);
        });
        S.state[c] = arr.filter(Boolean);
      });
      S.restored = !!saved.ops && Object.keys(saved.ops).length > 0;
    } else {
      if (saved && saved.meta && saved.meta.seedHash !== seedHash()) S.seedChanged = true;
      S.meta = defaultMeta(); S.session = saved && saved.session || null; S._dirty = {};
    }
    S.applyCatalog();
    S.version++;
  };
  /* Danh mục mở rộng (UI-38): mục bổ sung / ngừng dùng lưu ở collection catalogItems, phủ lên TH.data.catalog để mọi nơi đọc catalog không phải sửa.
     Dòng báo cáo và 13 loại phí hóa đơn là cấu trúc mẫu – cố định. */
  S.applyCatalog = () => {
    const C = TH.data.catalog; if (!C) return;
    if (!TH.data.catalogBase) TH.data.catalogBase = { expenseCategories: C.expenseCategories.map(x => Object.assign({}, x)), breachReasons: C.breachReasons.slice(), titles: Object.assign({}, C.titles) };
    const B = TH.data.catalogBase, items = S.all('catalogItems');
    const on = (kind, key) => { const it = items.find(x => x.kind === kind && x.key === key); return it ? it.active !== false : true; };
    C.expenseCategories = [...B.expenseCategories.map(x => Object.assign({}, x, { active: on('expenseCategories', x.key) })), ...items.filter(x => x.kind === 'expenseCategories' && !x.base).map(x => ({ key: x.key, label: x.label, reportLine: x.reportLine || null, group: x.group || 'Bổ sung', custom: true, active: x.active !== false }))];
    C.breachReasons = [...B.breachReasons.filter(r => on('breachReasons', r)), ...items.filter(x => x.kind === 'breachReasons' && !x.base && x.active !== false).map(x => x.label)];
    C.titles = Object.assign({}, B.titles); C.titlesAll = Object.assign({}, B.titles);
    items.filter(x => x.kind === 'titles').forEach(x => { if (!x.base) C.titlesAll[x.key] = x.label; if (x.active === false) delete C.titles[x.key]; else if (!x.base) C.titles[x.key] = x.label; });
  };
  const persist = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ schema: SCHEMA, meta: S.meta, session: S.session, ops: S._dirty }));
      S.quotaError = false;
    } catch (e) { S.quotaError = true; console.warn('store save', e); }
  };
  S.save = () => { if (S._batch) return; clearTimeout(S._t); S._t = setTimeout(persist, 80); };
  // Intake commits one complete business aggregate, with no partial writes/events.
  S.atomic = fn => {
    if (S._batch) throw new Error('Giao dịch đang thực hiện');
    clearTimeout(S._t);
    const snapshot = JSON.stringify({ state: S.state, dirty: S._dirty, version: S.version });
    S._batch = true;
    try {
      const result = fn();
      localStorage.setItem(KEY, JSON.stringify({ schema: SCHEMA, meta: S.meta, session: S.session, ops: S._dirty }));
      S.quotaError = false; S._batch = false; S.emit('change'); return result;
    } catch (e) {
      const old = JSON.parse(snapshot); S.state = old.state; S._dirty = old.dirty; S.version = old.version; S._idx = {}; S._batch = false;
      throw e;
    }
  };
  S.saveNow = () => { clearTimeout(S._t); persist(); };
  S.usage = () => { try { return (localStorage.getItem(KEY) || '').length * 2; } catch (e) { return 0; } };
  const mark = (c, obj) => { (S._dirty[c] = S._dirty[c] || {})[obj.id] = obj; S.version++; delete S._idx[c]; S.save(); };

  S.all = (c) => S.state[c] || [];
  S.index = (c) => { if (!S._idx[c]) { const m = new Map(); S.all(c).forEach(x => m.set(x.id, x)); S._idx[c] = m; } return S._idx[c]; };
  S.get = (c, id) => id == null ? null : S.index(c).get(id) || null;
  S.where = (c, f) => S.all(c).filter(f);
  S.one = (c, f) => S.all(c).find(f) || null;
  S.add = (c, obj) => {
    if (!S.state[c]) S.state[c] = [];
    if (!obj.id) obj.id = TH.f.uid(c.slice(0, 3));
    if (!obj.createdAt) obj.createdAt = TH.f.nowISO();
    S.state[c].push(obj); mark(c, obj); return obj;
  };
  S.update = (c, id, patch) => { const o = S.get(c, id); if (!o) return null; Object.assign(o, typeof patch === 'function' ? patch(o) : patch); o.updatedAt = TH.f.nowISO(); mark(c, o); return o; };
  S.touch = (c, obj) => mark(c, obj);
  S.remove = (c, id) => { S.state[c] = S.all(c).filter(x => x.id !== id); (S._dirty[c] = S._dirty[c] || {})[id] = 0; S.version++; delete S._idx[c]; S.save(); };
  S.nextCode = (c, prefix, width = 4) => {
    let max = 0; S.all(c).forEach(x => { if (x.code && x.code.startsWith(prefix)) { const n = parseInt(x.code.slice(prefix.length).replace(/\D/g, ''), 10); if (!isNaN(n) && n > max) max = n; } });
    return prefix + String(max + 1).padStart(width, '0');
  };
  S.audit = (action, entity, entityId, summary, extra = {}) => {
    const u = S.session;
    S.add('auditLog', Object.assign({ at: TH.f.nowISO(), userId: u ? u.userId : null, userName: u ? u.name : 'Hệ thống', role: u ? u.role : null, action, entity, entityId, summary }, extra));
  };
  S.setMeta = (patch) => { Object.assign(S.meta, patch); S.version++; S.save(); };
  S.setSession = (sess) => { S.session = sess; S.saveNow(); };
  S.on = (fn) => S.listeners.push(fn);
  S.emit = (what, detail) => { if (S._batch) return; S.listeners.forEach(fn => { try { fn(what, detail); } catch (e) { console.error(e); } }); };
  /* Xóa mọi thao tác, quay về dữ liệu demo gốc (giữ phiên đăng nhập) */
  S.reset = () => { const sess = S.session; S._dirty = {}; S.meta = defaultMeta(); S.session = sess; persist(); S.load(); };
  S.dirtyCount = () => Object.values(S._dirty).reduce((s, m) => s + Object.keys(m).length, 0);
  S.exportJSON = () => JSON.stringify({ schema: SCHEMA, meta: S.meta, ops: S._dirty }, null, 2);
  S.importJSON = (txt) => { const o = JSON.parse(txt); if (o.schema !== SCHEMA) throw new Error('File không đúng phiên bản dữ liệu'); S._dirty = o.ops || {}; S.meta = Object.assign(defaultMeta(), o.meta || {}); persist(); S.load(); };
  TH.store = S;
})(window.TH);
