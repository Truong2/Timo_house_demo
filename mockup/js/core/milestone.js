/* Mốc Phase 1: 1A (go-live hóa đơn – thu tiền) hoặc 1B (thêm chốt tháng: lương, phân bổ, báo cáo). Admin đổi ở Cài đặt. */
(function (TH) {
  const MS = {
    INFO: {
      '1A': { label: 'Phase 1 · 1A', name: 'Go-live hóa đơn & thu tiền' },
      '1B': { label: 'Phase 1 · 1B', name: 'Chốt tháng: lương, chi phí, báo cáo' },
    },
    DEFERRED: ['Kinh doanh (lead, deal, hoa hồng tự động) – Phase 2', 'OCR hợp đồng – Phase 2', 'Sổ sửa chữa, báo cáo vận hành – Phase 2', 'Chia cổ đông G1 – Phase 2', 'Tài sản, bảo dưỡng, kiểm kê – Phase 3', 'Dự kiến lợi nhuận, hiệu quả vốn – Phase 3'],
  };
  MS.current = () => (TH.store && TH.store.meta && TH.store.meta.milestone) || '1B';
  MS.on = (ms) => !ms || ms === '1A' || MS.current() === '1B';
  MS.set = (ms) => { TH.store.setMeta({ milestone: ms }); TH.store.emit('milestone'); };
  TH.ms = MS;
})(window.TH);
