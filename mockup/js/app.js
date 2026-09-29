/* Bootstrap: dựng state từ seed + overlay, nghe thay đổi để vẽ lại trang hiện tại. */
(function (TH) {
  const boot = () => {
    const t0 = performance.now();
    TH.store.load();
    TH.bootMs = Math.round(performance.now() - t0);
    TH.store.on((what) => {
      if (what === 'change' || what === 'milestone') {
        if (TH.store.quotaError) TH.ui.toast('err', 'Dung lượng lưu demo đầy', 'Vào Cài đặt → Hệ thống → "Xóa dữ liệu thao tác"');
        if (what === 'milestone') TH.layout.reset();
        if (TH.router.current && TH.router.current.path !== '/login') TH.router.refresh();
      }
    });
    if (TH.store.seedChanged) setTimeout(() => TH.ui.toast('info', 'Dữ liệu demo đã cập nhật', 'Các thao tác thử trước đó được xóa để khớp bộ dữ liệu mới'), 400);
    TH.router.start();
    window.__timohouse = { TH, reset: () => { TH.store.reset(); location.reload(); } };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.TH);
