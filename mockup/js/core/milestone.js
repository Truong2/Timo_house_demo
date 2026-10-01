/* Mốc triển khai: 1A (go-live hóa đơn – thu tiền) → 1B (thêm chốt tháng: lương, phân bổ, báo cáo) → 2 (kinh doanh, hoa hồng, sổ sửa chữa,
   báo cáo vận hành, chia cổ đông) → 3 (tài sản, bảo dưỡng, kiểm kê, góp vốn cổ đông, dự kiến lợi nhuận, hiệu quả vốn). Mốc sau gồm mọi chức năng
   của mốc trước. Admin đổi ở Cài đặt → Hệ thống demo. */
(function (TH) {
  const ORDER = ['1A', '1B', '2', '3'];
  const MS = {
    ORDER,
    INFO: {
      '1A': { label: 'Phase 1 · 1A', name: 'Go-live hóa đơn & thu tiền' },
      '1B': { label: 'Phase 1 · 1B', name: 'Chốt tháng: lương, chi phí, báo cáo' },
      '2': { label: 'Phase 2', name: 'Kinh doanh, hoa hồng, sổ sửa chữa, báo cáo vận hành, chia cổ đông' },
      '3': { label: 'Phase 3', name: 'Tài sản, bảo dưỡng, kiểm kê, góp vốn cổ đông, dự kiến lợi nhuận, hiệu quả vốn' },
    },
    DEFERRED: ['Hoàn vốn / ROI cổ đông – ngoài phạm vi (OQ-07)', 'Thanh toán QR, đối soát ngân hàng, BI, KPI/chấm công – ngoài phạm vi'],
  };
  MS.current = () => (TH.store && TH.store.meta && TH.store.meta.milestone) || '3';
  MS.on = (ms) => !ms || ORDER.indexOf(MS.current()) >= ORDER.indexOf(ms);
  MS.set = (ms) => { TH.store.setMeta({ milestone: ms }); TH.store.emit('milestone'); };
  TH.ms = MS;
})(window.TH);
