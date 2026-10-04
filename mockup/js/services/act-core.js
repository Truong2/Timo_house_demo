/* Nền cho actions: kiểm quyền, khóa kỳ, ghi nhật ký, phát sự kiện đổi dữ liệu. */
(function (TH) {
  const S = TH.store, A = TH.auth, F = TH.f;
  const X = TH.actions = TH.actions || {};
  X._ = {
    need: (perm) => A.need(perm),
    /* E1: chức năng Phase 2 bị chặn ở mức action (không chỉ ở route) khi mốc demo là 1A/1B */
    needMs: (ms = '2', what = 'Chức năng này') => { if (!TH.ms.on(ms)) throw new Error(`${what} thuộc ${TH.ms.INFO[ms].label} – chưa mở ở mốc ${TH.ms.INFO[TH.ms.current()].label}`); },
    done: (what = 'change', detail) => { S.emit('change', detail); },
    audit: (action, entity, id, summary, extra) => S.audit(action, entity, id, summary, extra),
    who: () => (S.session && S.session.name) || 'Hệ thống',
    /* D12: loại file được nhận (tài liệu, file HĐ khách) */
    checkFile: (name) => { if (!/\.(pdf|jpe?g|png|docx?|xlsx?)$/i.test(String(name || '').trim())) { const e = new Error('Chỉ nhận file PDF, ảnh (JPG/PNG), Word hoặc Excel'); e.fields = { name: e.message }; throw e; } },
    /* Kỳ đã khóa: chỉ được tạo dòng điều chỉnh có lý do (1B) */
    guardPeriod: (period, what = 'thao tác') => {
      const p = S.get('periods', period);
      if (p && p.status === 'closed') throw new Error(`Kỳ ${F.periodShort(period)} đã khóa – không thể ${what}. Dùng "Điều chỉnh sau khóa" có lý do.`);
    },
    /* Thay đổi có ngày hiệu lực (tham số, phân công, leader, giá chủ nhà) không được bắt đầu trong/trước kỳ đã khóa */
    guardEffective: (date, what = 'thay đổi') => {
      const p = S.all('periods').filter(x => x.status === 'closed' && x.id >= F.period(date)).map(x => x.id).sort().pop();
      if (p) throw new Error(`Kỳ ${F.periodShort(p)} đã khóa – ${what} phải có hiệu lực sau ${F.date(TH.calc.dates.periodEnd(p))}. Dùng "Điều chỉnh sau khóa" có lý do.`);
    },
    fail: (msg) => { throw new Error(msg); },
  };
  /* Sổ cọc: tiền vào (số dư đầu kỳ, phiếu cọc – đảo phiếu ghi số âm, cọc chuyển từ phòng cũ) và số dư sau các khoản ra */
  const IN = ['opening', 'receive', 'transfer_in'], OUT = ['transfer_out', 'refund', 'keep_breach', 'forfeit_revenue', 'deduct'];
  X.depositIn = (stayId) => S.where('depositLedger', l => l.stayId === stayId && IN.includes(l.kind)).reduce((t, l) => t + l.amount, 0);
  X.depositBalance = (stayId) => S.where('depositLedger', l => l.stayId === stayId).reduce((t, l) => t + (IN.includes(l.kind) ? l.amount : OUT.includes(l.kind) ? -l.amount : 0), 0);
  /* Trạng thái cọc của lượt thuê còn hiệu lực theo sổ cọc: chưa nhận / còn thiếu / đang giữ */
  X.syncDepositStatus = (stayId) => {
    const s = S.get('stays', stayId); if (!s || !['pending', 'active'].includes(s.status)) return;
    const bal = X.depositBalance(stayId);
    S.update('stays', stayId, { depositStatus: bal <= 0 ? 'none' : bal + 0.5 < (s.depositAmount || 0) ? 'partial' : 'held' });
  };
})(window.TH);
