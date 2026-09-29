/* Hash router theo manifest core/routes.js. Handler đăng ký bằng TH.router.handle(path, fn); không có dòng manifest → lỗi. */
(function (TH) {
  const R = { current: null, handlers: {}, compiled: [] };
  TH.routes.ROUTES.forEach(meta => {
    const keys = [];
    const re = new RegExp('^' + meta.path.replace(/\/:(\w+)/g, (m, k) => { keys.push(k); return '/([^/]+)'; }) + '$');
    R.compiled.push({ meta, re, keys });
  });
  R.handle = (path, fn) => {
    if (!TH.routes.ROUTES.some(r => r.path === path)) throw new Error('Route chưa khai báo trong core/routes.js: ' + path);
    R.handlers[path] = fn;
  };
  R.parse = () => {
    let h = (location.hash || '#/dashboard').replace(/^#/, '');
    const [path, qs] = h.split('?'); const query = {};
    (qs || '').split('&').filter(Boolean).forEach(p => { const [k, v] = p.split('='); query[decodeURIComponent(k)] = decodeURIComponent((v || '').replace(/\+/g, ' ')); });
    return { path: path || '/dashboard', query };
  };
  R.match = (path) => {
    // route tĩnh ưu tiên hơn route có tham số (vd /tenants/new trước /tenants/:id)
    const hits = R.compiled.map(c => ({ c, m: path.match(c.re) })).filter(x => x.m).sort((a, b) => a.c.keys.length - b.c.keys.length);
    if (!hits.length) return null;
    const { c, m } = hits[0]; const params = {};
    c.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
    return { meta: c.meta, params };
  };
  R.go = (hash) => { if (!hash.startsWith('#')) hash = '#' + hash; if (location.hash === hash) R.render(); else location.hash = hash; };
  R.href = (path, q = {}) => '#' + path + R.qs(q);
  R.qs = (q) => { const s = Object.entries(q).filter(([k, v]) => v !== '' && v != null && v !== false).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&'); return s ? '?' + s : ''; };
  R.replaceQuery = (q) => { const { path } = R.parse(); history.replaceState(null, '', '#' + path + R.qs(q)); };
  R.setQuery = (patch) => { const { query } = R.parse(); const q = Object.assign({}, query, patch); Object.keys(q).forEach(k => { if (q[k] === '' || q[k] == null) delete q[k]; }); R.replaceQuery(q); R.refresh(); };
  R.render = () => {
    const { path, query } = R.parse();
    const app = document.getElementById('app');
    if (!TH.store.session) {
      if (path !== '/login') R._after = location.hash;
      app.className = ''; TH.layout.reset(); TH.pages.login(app); R.current = { path: '/login' }; return;
    }
    if (path === '/login') { R.go(R._after && !R._after.includes('/login') ? R._after : '#/dashboard'); R._after = null; return; }
    const m = R.match(path);
    if (!m) { R.go('#/dashboard'); return; }
    if (R._rendering) { R._again = true; return; }
    R._rendering = true;
    try {
      const printMode = !!m.meta.print;
      document.body.classList.toggle('print-mode', printMode);
      let root;
      if (printMode) { app.className = 'print-app'; app.innerHTML = '<div id="content" class="print-root"></div>'; root = app.firstElementChild; TH.layout.reset(); }
      else {
        TH.layout.ensure(app);
        const prev = document.getElementById('content'); root = prev.cloneNode(false); prev.replaceWith(root);
        TH.layout.setActive(m.meta.menu); TH.layout.setTitle(m.meta);
      }
      R.current = { path, query, params: m.params, meta: m.meta };
      if (!TH.auth.canRoute(m.meta)) {
        TH.layout.crumb([{ label: 'Không có quyền truy cập' }]);
        root.innerHTML = TH.ui.card({ body: TH.ui.empty({ icon: 'lock', title: '403 – Không có quyền truy cập', text: 'Vai trò ' + TH.esc(TH.auth.roleLabel()) + ' không được xem chức năng này.', action: '<a class="btn btn-primary btn-sm" href="#/dashboard">Về Tổng quan</a>' }) });
      } else if (!TH.ms.on(m.meta.ms)) {
        TH.layout.crumb([{ label: m.meta.title }]);
        root.innerHTML = TH.ui.card({ body: TH.ui.empty({ icon: 'flag', title: m.meta.title + ' thuộc mốc ' + m.meta.ms, text: 'Hệ thống đang ở mốc ' + TH.ms.current() + ' (go-live hóa đơn & thu tiền). Chức năng chốt tháng mở khi chuyển sang mốc 1B ở Cài đặt.', action: TH.auth.can('settings.manage') ? '<a class="btn btn-primary btn-sm" href="#/settings?tab=he-thong">Mở Cài đặt</a>' : '' }) });
      } else {
        const h = R.handlers[m.meta.path];
        if (!h) root.innerHTML = TH.ui.card({ body: TH.ui.empty({ icon: 'alert-circle', title: 'Chưa có màn hình', text: m.meta.ui + ' – ' + m.meta.title }) });
        else h(root, m.params, query);
        TH.auth.enforceUI(root);
      }
    } catch (e) {
      console.error(e);
      const root = document.getElementById('content');
      if (root) root.innerHTML = `<div class="card"><div class="card-b">${TH.ui.note('danger', 'Lỗi hiển thị trang', TH.esc(e.message))}</div></div>`;
    }
    if (R._lastPath !== path) window.scrollTo(0, 0);
    R._lastPath = path;
    R._rendering = false;
    if (R._again) { R._again = false; R.render(); }
  };
  R.refresh = () => { const y = window.scrollY; R.render(); window.scrollTo(0, y); };
  R.start = () => { window.addEventListener('hashchange', R.render); R.render(); };
  TH.router = R; TH.pages = TH.pages || {}; TH.go = R.go;
})(window.TH);
