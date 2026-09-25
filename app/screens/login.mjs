import { ROLES } from '../core/auth.mjs';
import { signIn } from '../core/domain/session.mjs';
import { formData } from '../ui/dom.mjs';
import { esc } from '../ui/shell.mjs';
import { notSpecified, pchip } from '../ui/controls.mjs';

export default {
  render(ctx) {
    const L = ctx.local;
    const roleOptions = ROLES.map(([id, label]) => `<option value="${id}"${id === (L.role || 'admin') ? ' selected' : ''}>${esc(label)}</option>`).join('');
    return {
      title: 'Đăng nhập', active: null,
      body: `<div class="login-layout">
        <div class="login-intro"><div class="login-brand">◆ TimoHouse</div><p>Quản lý vận hành cho thuê</p>
          <h2>Một nơi để theo dõi vận hành, dòng tiền và công việc.</h2>
          <p>Dữ liệu minh họa được đánh dấu rõ nguồn và các điểm cần xác nhận.</p></div>
        <div class="login-card"><h1>Đăng nhập</h1><p>Truy cập hệ thống TimoHouse</p>
          ${L.error ? `<div class="alert danger" role="alert">${esc(L.error)}</div>` : ''}
          <form id="login-form"><label>Tên đăng nhập hoặc email<input name="username" required autocomplete="username" value="${esc(L.username || '')}" placeholder="admin"/></label>
          <label>Mật khẩu<span class="login-password"><input name="password" type="password" required autocomplete="current-password" placeholder="Nhập mật khẩu"/><button type="button" data-action="show-password" aria-label="Hiện hoặc ẩn mật khẩu" title="Hiện hoặc ẩn mật khẩu">Hiện</button></span></label>
          ${L.otpVisible ? `<label>Mã OTP<input name="otp" inputmode="numeric" autocomplete="one-time-code" placeholder="Nhập mã OTP"/></label><button type="button" class="login-link" data-action="resend-otp">Gửi lại OTP</button>` : ''}
          <div class="login-row"><label><input type="checkbox" name="remember"/> Ghi nhớ đăng nhập</label><button type="button" class="login-link" data-action="forgot-password">Quên mật khẩu?</button></div>
          <button type="submit" class="btn primary" data-action="login">Đăng nhập</button></form>
          <div class="login-demo"><b>△ Dữ liệu mô phỏng</b><p>Chọn vai trò demo rồi bấm Đăng nhập ${pchip('Q-05')}</p>
            <select name="role" aria-label="Vai trò demo">${roleOptions}</select>
            <small>Tên đăng nhập: mã vai trò (ví dụ admin) · Mật khẩu: demo123 · OTP Kế toán: 000000</small></div>
        </div></div>`,
    };
  },
  onMount(ctx, main) {
    main.querySelector('#login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      main.querySelector('[data-action="login"]')?.click();
    });
  },
  actions: {
    'show-password': (el) => { const inp = el.closest('.login-password').querySelector('input'); inp.type = inp.type === 'password' ? 'text' : 'password'; el.textContent = inp.type === 'password' ? 'Hiện' : 'Ẩn'; },
    'forgot-password': () => notSpecified('FR00 · Quên mật khẩu'),
    'resend-otp': () => notSpecified('FR00 · Gửi lại OTP', 'Thời gian và kênh gửi chưa được chốt.'),
    login: (el, e, ctx) => {
      const main = el.closest('main');
      const data = formData(main);
      const L = ctx.local;
      L.username = data.username;
      L.role = data.role;
      L.error = '';
      if (!data.username?.trim() || !data.password) { L.error = 'Vui lòng nhập tên đăng nhập và mật khẩu'; ctx.rerender(); return; }
      const result = ctx.tx((d, env) => signIn(d, env, data));
      if (!result.ok) {
        L.error = result.error.message;
        if (result.error.code === 'E##-OTP') L.otpVisible = true;
        ctx.rerender();
        return;
      }
      if (data.remember) sessionStorage.removeItem('th.demo.session');
      else sessionStorage.setItem('th.demo.session', result.r.token);
      const returnTo = sessionStorage.getItem('th.login.returnTo');
      sessionStorage.removeItem('th.login.returnTo');
      ctx.go(returnTo && returnTo !== '#/login' ? returnTo : '#/dashboard');
    },
  },
};
