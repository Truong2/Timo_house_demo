/* Mốc triển khai: 1A (go-live hóa đơn – thu tiền) → 1B (thêm chốt tháng: lương, phân bổ, báo cáo) → 2 (kinh doanh, hoa hồng, sổ sửa chữa,
   báo cáo vận hành, chia cổ đông). Mốc sau gồm mọi chức năng của mốc trước. Admin đổi ở Cài đặt → Hệ thống demo. */
(function (TH) {
  const ORDER = ['1A', '1B', '2'];
  const MS = {
    ORDER,
    INFO: {
      '1A': { label: 'Phase 1 · 1A', name: 'Go-live hóa đơn & thu tiền' },
      '1B': { label: 'Phase 1 · 1B', name: 'Chốt tháng: lương, chi phí, báo cáo' },
      '2': { label: 'Phase 2', name: 'Kinh doanh, hoa hồng, sổ sửa chữa, báo cáo vận hành, chia cổ đông' },
    },
    DEFERRED: ['Tài sản, bảo dưỡng, kiểm kê – Phase 3', 'Dự kiến lợi nhuận, hiệu quả vốn – Phase 3', 'Góp vốn, chi thực cho cổ đông – Phase 3'],
  };
  MS.current = () => (TH.store && TH.store.meta && TH.store.meta.milestone) || '2';
  MS.on = (ms) => !ms || ORDER.indexOf(MS.current()) >= ORDER.indexOf(ms);
  MS.set = (ms) => { TH.store.setMeta({ milestone: ms }); TH.store.emit('milestone'); };
  TH.ms = MS;
})(window.TH);
