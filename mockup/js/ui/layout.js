/* Shell: sidebar Phase 1 (5 nhóm, 2 cấp), topbar (breadcrumb, kỳ, vai trò), vùng nội dung #content. */
(function (TH) {
  const F = TH.f, U = TH.ui, I = TH.icon, esc = F.esc;
  const L = {};
  const okHref = (href) => { const r = TH.routes.ROUTES.find(x => ('#' + x.path) === href.split('?')[0]); return !r || (TH.auth.canRoute(r) && TH.ms.on(r.ms)); };
  /* Mục sidebar trỏ tới màn con đầu tiên vai trò được xem (vd leader: Hóa đơn & thu tiền → Công nợ) */
  const visible = (it) => { const h = [it.href, ...(it.alts || [])].find(okHref); if (h) it._href = h; return !!h; };
  L.reset = () => { L._mounted = false; };
  L.ensure = (app) => {
    if (L._mounted && document.getElementById('content')) return;
    const u = TH.auth.user() || {};
    const navHtml = TH.routes.NAV.map(n => {
      if (!n.group) return visible(n) ? `<a class="nav-it" data-nav="${n.key}" href="${n._href || n.href}">${I(n.icon)}<span>${esc(n.label)}</span></a>` : '';
      const items = n.items.filter(visible);
      if (!items.length) return '';
      return `<div class="nav-group"><div class="nav-gh">${I(n.icon)}<span>${esc(n.group)}</span></div>${items.map(it => `<a class="nav-it sub" data-nav="${it.key}" href="${it._href || it.href}"><span>${esc(it.label)}</span></a>`).join('')}</div>`;
    }).join('');
    const footHtml = TH.routes.FOOT.filter(visible).map(n => `<a class="nav-it" data-nav="${n.key}" href="${n._href || n.href}">${I(n.icon)}<span>${esc(n.label)}</span></a>`).join('');
    const ms = TH.ms.INFO[TH.ms.current()];
    app.className = 'shell';
    app.innerHTML = `
      <a class="skip-link" href="#content">Bỏ qua điều hướng, tới nội dung chính</a>
      <aside class="sidebar" id="sidebar">
        <a class="brand" href="#/dashboard"><img src="assets/logo.svg" alt=""><div><b>TimoHouse</b><small>Quản lý nhà cho thuê</small></div></a>
        <nav class="nav">${navHtml}</nav>
        <div class="nav-foot">${footHtml}
          <div class="ms-chip" data-tip="${esc('Đang dùng: ' + ms.name + '. Ngoài phạm vi: ' + TH.ms.DEFERRED.join(' · '))}">${I('flag')}<span>${esc(ms.label)}</span></div>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button type="button" class="btn-icon sb-toggle" data-act="sb" aria-label="Mở menu">${I('menu')}</button>
          <div class="crumbs" id="crumbs"></div>
          <div class="tb-right">
            <span class="tb-date" data-tip="Ngày hệ thống demo (đổi ở Cài đặt)">${I('calendar')} ${F.date(F.today())}</span>
            <button type="button" class="user-btn" data-act="user">${U.avatar(u.name || '?')}<div><b>${esc(u.name || '')}</b><small>${esc(TH.auth.roleLabel())}</small></div>${I('chevron-down')}</button>
          </div>
        </header>
        ${TH.store.dataset === TH.data.septemberFlow?.id ? `<div class="demo-dataset-banner">Dữ liệu mẫu tháng 9/2026 · Excel + ca mẫu liên thông${TH.auth.can('settings.manage') ? ' · <a href="#/settings?tab=du-lieu-thang-9">Xem luồng & nguồn dữ liệu</a>' : ''}</div>` : ''}
        <main id="content" class="content" tabindex="-1"></main>
      </div>`;
    U.bind(app.querySelector('.topbar'), {
      sb: () => document.body.classList.toggle('sb-open'),
      user: (el) => U.menu(el, [
        { header: 'Chuyển vai trò (demo)' },
        ...TH.store.all('users').filter(x => !x.phase || TH.ms.on(x.phase)).map(x => ({ label: (x.id === u.id ? '● ' : '') + x.display + ' – ' + x.username, onClick: () => { TH.auth.switchRole(x.username); L.reset(); TH.router.render(); TH.ui.toast('ok', 'Đã chuyển vai trò', x.display); } })),
        '-',
        { label: 'Đăng xuất', icon: 'log-out', onClick: () => { TH.auth.logout(); L.reset(); TH.go('#/login'); } },
      ]),
    });
    L._mounted = true;
  };
  L.setActive = (key) => { document.querySelectorAll('.nav-it').forEach(a => a.classList.toggle('on', a.dataset.nav === key)); document.body.classList.remove('sb-open'); };
  L.setTitle = (meta) => { document.title = meta.title + ' · TimoHouse'; L.crumb([{ label: meta.title }]); };
  L.crumb = (items) => {
    const el = document.getElementById('crumbs'); if (!el) return;
    el.innerHTML = items.map((it, i) => (i ? `<span class="sep">/</span>` : '') + (it.href && i < items.length - 1 ? `<a href="${it.href}">${esc(it.label)}</a>` : `<span class="${i === items.length - 1 ? 'cur' : ''}">${esc(it.label)}</span>`)).join('');
  };
  TH.layout = L;
})(window.TH);
