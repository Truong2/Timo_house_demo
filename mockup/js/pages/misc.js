(function (TH) {
  const U = TH.ui, I = TH.icon, esc = TH.f.esc;
  TH.router.register('/coming-soon/:key', (root, p) => {
    const info = TH.layout.P2_INFO[p.key] || ['Chức năng mở rộng', 2, 'Chức năng này nằm ngoài scope Phase 1 – Core Rental / Go-live.', ''];
    const [name, phase, desc, fr] = info;
    TH.router.crumb([{ label: 'Phase ' + phase }, { label: name }]);
    root.innerHTML = `<div class="coming card" style="padding:40px 32px"><div class="big">${I(phase === 3 ? 'trending-up' : 'compass')}</div><h1>${esc(name)}</h1><div class="mt8"><span class="chip purple lg">Thuộc Phase ${phase}${phase === 2 ? ' – Sales & Automation & Operations' : ' – Enterprise & Investment'}</span></div><p class="mt16 muted">${esc(desc)}</p>${fr ? `<p class="small muted mt8">Yêu cầu liên quan: <b>${esc(fr)}</b></p>` : ''}<ul><li>Không có action nghiệp vụ nào được kích hoạt trong bản demo Phase 1.</li><li>Nguyên tắc khóa scope: không đưa thêm chức năng Phase 2/3 nếu không ảnh hưởng trực tiếp đến khả năng vận hành cho thuê.</li><li>Tham chiếu: <code>00_SCOPE_3_PHASE.md</code> §${phase === 2 ? 3 : 4}.</li></ul><div class="row" style="justify-content:center;gap:10px">${U.btn({ label: 'Quay lại', icon: 'arrow-left', cls: 'btn-outline', act: 'back' })}${U.btn({ label: 'Về Tổng quan', icon: 'home', cls: 'btn-primary', act: 'home' })}</div></div>`;
    U.bind(root, { back: () => history.back(), home: () => TH.go('#/dashboard') });
  }, { menu: '', permission: 'dashboard.view' });
})(window.TH);
