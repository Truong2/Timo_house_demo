/* Công cụ hệ thống được tách khỏi sidebar để giữ điều hướng nghiệp vụ gọn. */
(function (TH) {
  const U = TH.ui, I = TH.icon, F = TH.f, esc = F.esc;

  TH.router.register('/settings/tools', (root) => {
    TH.router.crumb([{ label: 'Cấu hình' }, { label: 'Công cụ hệ thống' }]);
    const phaseRows = [1, 2, 3].map(n => {
      const inf = TH.phase.info(n), on = TH.phase.on(n), disabled = n === 1 || !TH.phase.available(n);
      return `<label class="tool-setting ${disabled ? 'disabled' : ''}"><span class="tool-setting-icon">${I(n === 1 ? 'shield-check' : n === 2 ? 'briefcase' : 'layers')}</span><span class="grow"><b>${esc(inf.label)} · ${esc(inf.name)}</b><small>${n === 1 ? 'Nền tảng nghiệp vụ cốt lõi, luôn bật.' : n === 2 ? 'CRM, OCR, bảo trì, báo cáo và Data Jobs.' : 'Tài sản, nhân sự, đầu tư và ngân hàng.'}</small></span><input type="checkbox" data-on="phase-${n}" ${on ? 'checked' : ''} ${disabled ? 'disabled' : ''}></label>`;
    }).join('');
    root.innerHTML = `${U.pageHead({ title: 'Công cụ hệ thống', sub: 'Khu vực dành cho quản trị viên. Các tác vụ kỹ thuật được tách khỏi điều hướng nghiệp vụ hàng ngày.' })}
      <div class="settings-layout">
        <section class="card"><div class="card-h"><div><h3>${I('layers')} Phạm vi tính năng</h3><div class="sub">Bật hoặc tắt các phase trong môi trường demo.</div></div></div><div class="card-b tool-settings">${phaseRows}<label class="tool-setting"><span class="tool-setting-icon">${I('info')}</span><span class="grow"><b>Hiện chú thích demo / BA</b><small>Mã FR/BR/OI, chip "Giả định", "Tự thiết kế", tag phase trên tiêu đề trang. Tắt để xem giao diện như người dùng cuối.</small></span><input type="checkbox" data-on="demo-notes" ${U.demoNotes() ? 'checked' : ''}></label></div></section>
        <section class="card"><div class="card-h"><div><h3>${I('database')} Dữ liệu demo</h3><div class="sub">Sao lưu, phục hồi hoặc đưa dữ liệu về trạng thái kiểm thử.</div></div></div><div class="card-b tool-actions">
          ${U.btn({ label: 'Xuất state JSON', icon: 'download', cls: 'btn-outline', act: 'adv-export' })}
          ${U.btn({ label: 'Nhập state JSON', icon: 'upload', cls: 'btn-outline', act: 'adv-import' })}
          ${U.btn({ label: 'Đổi ngày hệ thống demo', icon: 'calendar', cls: 'btn-outline', act: 'adv-today' })}
          ${U.btn({ label: 'Đặt lại dữ liệu demo', icon: 'refresh', cls: 'btn-outline', act: 'adv-reset' })}
          ${U.btn({ label: 'Xóa trắng dữ liệu nghiệp vụ', icon: 'trash', cls: 'btn-danger', act: 'adv-clear' })}
        </div></section>
        <section class="card"><div class="card-h"><div><h3>${I('play')} Kịch bản kiểm thử</h3><div class="sub">Chạy tự động các luồng go-live để kiểm tra tính toàn vẹn dữ liệu.</div></div></div><div class="card-b tool-actions">
          ${U.btn({ label: 'Chạy kịch bản Phase 1', icon: 'play', cls: 'btn-outline', act: 'adv-runall' })}
          ${TH.phase.on(2) ? U.btn({ label: 'Chạy kịch bản Phase 2', icon: 'play', cls: 'btn-outline', act: 'adv-runall-p2', id: 'adv-runall-p2' }) : ''}
          ${TH.phase.on(3) ? U.btn({ label: 'Chạy kịch bản Phase 3', icon: 'play', cls: 'btn-outline', act: 'adv-runall-p3', id: 'adv-runall-p3' }) : ''}
          ${U.btn({ label: 'Reset tiến độ hướng dẫn', icon: 'rotate-ccw', cls: 'btn-outline', act: 'adv-guide-reset' })}
        </div></section>
      </div>`;
  }, { menu: 'system', permission: 'advancedTools' });
})(window.TH);
