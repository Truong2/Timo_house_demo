/* Dữ liệu demo "Thu tiền theo tòa" (bộ đối chiếu lịch sử) – dựng trong TH.seed.build qua hook seedExtras, không lưu localStorage.
   Tài khoản vanhanh (quản lý tòa) đã cập nhật số đã thu cộng dồn kỳ 09/2026 theo sheet "cập nhật thu tiền" (SRC-08 cột T/U/V):
   mốc ngày 5 và 10 đã được admin duyệt; mốc ngày 15 đang chờ duyệt (một tòa nhập lệch so với sheet để demo từ chối). */
(function (TH) {
  const prev = TH.data.seedExtras;
  TH.data.seedExtras = (st) => {
    if (prev) prev(st);
    const src = TH.data.collection202609; st.collectionMilestones = st.collectionMilestones || [];
    if (!src) return;
    const P = src.period, d15 = P + '-15', user = st.users.find(u => u.username === 'vanhanh'), admin = st.users.find(u => u.username === 'admin');
    if (!user || !admin) return;
    const mine = new Set(st.assignments.filter(a => a.employeeId === user.employeeId && a.responsibility === 'operate' && !a.roomId && (!a.from || a.from <= d15) && (!a.to || a.to >= d15)).map(a => a.buildingId));
    const rows = src.buildings.filter(b => mine.has('b_' + b.building)).sort((a, b) => a.building.localeCompare(b.building, 'vi', { numeric: true }));
    rows.forEach((r, i) => [[1, 5, r.T], [2, 10, r.U], [3, 15, r.V]].forEach(([k, day, amount]) => {
      const pending = k === 3, off = pending && i === 0 ? 1000000 : 0; // tòa đầu: nhập lệch 1 triệu so với sheet → admin đối chiếu phiếu thu rồi từ chối
      st.collectionMilestones.push({ id: `msr_${P}_b_${r.building}_${k}_v1`, period: P, buildingId: 'b_' + r.building, milestone: k, day, amount: amount + off, systemAmount: null,
        note: off ? 'Đã thu thêm tiền mặt chưa nộp về' : '', evidence: `SRC-08 · cập nhật thu tiền!${'TUV'[k - 1]}${r.row}`, reportedBy: user.id, reportedByName: user.name, reportedByEmployeeId: user.employeeId,
        reportedAt: `${P}-${String(day).padStart(2, '0')}T18:00:00`, version: 1, status: pending ? 'pending' : 'approved',
        approvedBy: pending ? null : admin.name, approvedByUser: pending ? null : admin.id, approvedAt: pending ? null : `${P}-${String(day + 1).padStart(2, '0')}T09:00:00`, source: 'demo' });
    }));
  };
})(window.TH);
