/* Đăng nhập demo – chọn nhanh vai trò (vai trò Phase 2 chỉ hiện khi đang ở mốc Phase 2). */
(function (TH) {
  const U = TH.ui, esc = TH.f.esc, I = TH.icon;
  TH.pages.login = (app) => {
    const users = TH.store.all('users').filter(u => u.status === 'active' && (!u.phase || TH.ms.on(u.phase)));
    app.innerHTML = `<div class="login">
      <div class="login-hero"><div class="row gap12"><img src="assets/logo.svg" alt="" style="width:40px"><b style="font-size:20px">TimoHouse</b></div>
        <h2>Vận hành cho thuê, thu tiền và chốt tháng trên một hệ thống</h2>
        <p>Phase 1: tòa – phòng – khách – hợp đồng – chỉ số – hóa đơn – thu tiền – công nợ – Zalo – hoàn cọc; chốt tháng lương, phân bổ chi phí, báo cáo theo tòa và báo cáo tổng/kinh doanh. Phase 2: kinh doanh & hoa hồng, sổ sửa chữa, báo cáo vận hành, chia cổ đông.</p>
        <div class="feat"><div class="ic">${I('receipt')}</div><div><b>Hóa đơn đúng mẫu Excel</b><span>13 dòng, 4 mẫu in, tháng lẻ, Thu khác</span></div></div>
        <div class="feat"><div class="ic">${I('wallet')}</div><div><b>Thu tiền & công nợ</b><span>Chưa TT / Thiếu / Đủ / Thừa, công nợ từ ngày 6</span></div></div>
        <div class="feat"><div class="ic">${I('bar-chart')}</div><div><b>Chốt tháng</b><span>Lương theo mốc 5/10/15, phân bổ, báo cáo theo tòa</span></div></div>
        <div class="foot">Dữ liệu demo sinh từ file Excel khách gửi (đã ẩn danh tên, SĐT, số tài khoản).</div></div>
      <div class="login-side"><div class="login-card">
        <h1>Đăng nhập</h1><div class="sub">Tài khoản demo – mật khẩu bất kỳ</div>
        <form id="lf">${U.field({ label: 'Tên đăng nhập', input: U.input({ name: 'username', value: 'admin', placeholder: 'admin' }) })}
        <div class="mt12">${U.field({ label: 'Mật khẩu', input: U.input({ name: 'password', type: 'password', value: 'demo123' }) })}</div>
        <button class="btn btn-primary btn-block mt16" type="submit">${I('log-in')}<span>Đăng nhập</span></button></form>
        <div class="divider">hoặc chọn vai trò</div>
        <div class="demo-accounts">${users.map(u => `<button type="button" data-u="${esc(u.username)}">${esc(u.display)} · <b>${esc(u.username)}</b></button>`).join('')}</div>
        <div class="login-foot">Mốc hiện tại: <b>${esc(TH.ms.INFO[TH.ms.current()].label)}</b> · ngày hệ thống ${TH.f.date(TH.f.today())}</div>
      </div></div></div>`;
    const go = (u) => { try { TH.auth.login(u); TH.layout.reset(); TH.go(TH.router._after && !TH.router._after.includes('login') ? TH.router._after : '#/dashboard'); TH.router.render(); } catch (e) { U.toast('err', 'Không đăng nhập được', e.message); } };
    app.querySelector('#lf').addEventListener('submit', (e) => { e.preventDefault(); go(app.querySelector('[name=username]').value); });
    app.querySelectorAll('[data-u]').forEach(b => b.onclick = () => go(b.dataset.u));
  };
})(window.TH);
