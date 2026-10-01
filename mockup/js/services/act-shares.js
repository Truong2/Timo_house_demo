/* Cổ đông, tỷ lệ góp theo tòa và bảng kê chia lãi (UI-31, UI-32; đặc tả §3.9, F09, GĐ OQ-08). Chỉ admin / kế toán.
   Số chia lấy theo MÃ CHỈ TIÊU của Báo cáo tổng tòa (tiền thuê 1 tháng, LN gộp, LN ròng), không theo địa chỉ ô Excel.
   Nguồn "excel" chỉ để đối chiếu kỳ song song với bảng kê SRC-07 (G1 tháng 8). Khóa bảng kê lưu ảnh chụp số; M không phải khoản chi (chi thực ở UI-33, Phase 3). */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, SH = TH.calc.share, D = TH.calc.dates;
  const fail = (fields, msg = 'Dữ liệu chưa hợp lệ') => { const e = new Error(msg); e.fields = fields; throw e; };
  Q.shareholder = (id) => S.get('shareholders', id);
  Q.shareRatios = (bid, date) => { const d = date || F.today(); return S.where('shareRatios', r => r.buildingId === bid && (!r.from || r.from <= d) && (!r.to || d <= r.to)); };
  Q.shareBuildings = () => [...new Set(S.all('shareRatios').map(r => r.buildingId))].map(id => Q.building(id)).filter(Boolean);
  /* Cơ sở chia: web = Báo cáo tổng của tòa trong kỳ; excel = ô C22/C73/C74 của bảng kê SRC-07 (chỉ G1 tháng 8) */
  Q.shareBase = (bid, period, source = 'web') => {
    if (source === 'excel') {
      const E = TH.data.p2 && TH.data.p2.shares; if (!E || 'b_' + E.building !== bid || E.period !== period) return null;
      return { rent: E.excel.C22, lng: E.excel.C73, lnr: E.excel.C74, gv: E.excel.C34, tcp: E.excel.C72, rev: E.excel.C2, src: 'Excel SRC-07 ' + E.sheet + ' (C22, C73, C74)' };
    }
    const v = TH.qr.get(period, 'total').byBuilding[bid]; if (!v) return null;
    return { rent: v.cost_rent || 0, lng: v.lng || 0, lnr: v.lnr || 0, gv: v.gv || 0, tcp: v.tcp || 0, rev: v.rev_total || 0, src: 'Báo cáo tổng tòa – dòng 20 (tiền thuê 1 tháng), 45 (LNG), 46 (LNR)' };
  };
  /* Bảng kê: đã khóa → ảnh chụp; chưa → tính thử theo tỷ lệ hiệu lực cuối kỳ */
  const lastLocked = (bid, period) => S.where('shareRuns', r => r.buildingId === bid && r.period === period && r.status === 'locked').sort((a, b) => (b.version || 1) - (a.version || 1))[0];
  const reopensOf = (period) => ((S.get('periods', period) || {}).history || []).filter(h => h.type === 'reopen').length; // số lần kỳ báo cáo đã mở lại
  /* Tính thử theo tỷ lệ hiệu lực cuối kỳ (chưa khóa) */
  const computeRun = (bid, period, source) => {
    const base = Q.shareBase(bid, period, source); if (!base) return null;
    const ratios = Q.shareRatios(bid, D.periodEnd(period));
    const sp = SH.split(ratios.map(r => ({ id: r.shareholderId, pct: r.pct, common: (Q.shareholder(r.shareholderId) || {}).common })), base);
    return Object.assign({ locked: false, buildingId: bid, period, source, base, valid: SH.valid(ratios) }, sp);
  };
  Q.shareRun = (bid, period, source = 'web') => {
    const locked = lastLocked(bid, period);
    return locked ? Object.assign({ locked: true }, locked) : computeRun(bid, period, source);
  };
  /* D7 [GĐ]: chỉ khóa bảng kê khi số báo cáo của kỳ đã chốt – kỳ báo cáo đã khóa (UI-38) hoặc kỳ chạy song song Excel */
  Q.shareLockable = (period) => { const p = S.get('periods', period) || {}; return p.status === 'closed' || p.source === 'excel_parallel'; };
  /* D6: đã có phiên khóa và kỳ báo cáo mở lại sau lần khóa đó → được khóa phiên mới */
  Q.shareRelockable = (bid, period) => { const prev = lastLocked(bid, period); return !!prev && reopensOf(period) > (prev.reopens || 0); };
  /* Chênh bảng kê web so với Excel (G1 tháng 8) – dòng giải thích (K-9 / OQ-04) */
  Q.shareVariance = (bid, period) => {
    const w = Q.shareBase(bid, period, 'web'), e = Q.shareBase(bid, period, 'excel'); if (!w || !e) return null;
    return { rent: w.rent - e.rent, lng: w.lng - e.lng, lnr: w.lnr - e.lnr, oq04: 25000000 * 15 / 1343 - 25000000 * 15 / 1382 };
  };

  X.addShareholder = (d) => { _.needMs('2', 'Chia cổ đông (UI-31/32)');
    _.need('shares.manage');
    if (!String(d.name || '').trim()) fail({ name: 'Nhập tên nhà đầu tư' });
    const sh = S.add('shareholders', { code: S.nextCode('shareholders', 'CD-', 2), name: d.name.trim(), common: false, phone: d.phone || '', bank: d.bank || '', note: d.note || '' });
    _.audit('create', 'shareholder', sh.id, 'Thêm cổ đông ' + sh.code); _.done(); return sh;
  };
  /* Tỷ lệ mới có hiệu lực từ ngày: đóng bộ tỷ lệ cũ; lưu được khi chưa đủ 100% (cảnh báo) nhưng không khóa bảng kê được */
  X.setShareRatios = (bid, rows, from, reason) => { _.needMs('2', 'Chia cổ đông (UI-31/32)');
    _.need('shares.manage');
    const errs = {};
    if (!Q.building(bid)) errs.buildingId = 'Chọn tòa';
    if (!from) errs.from = 'Nhập ngày hiệu lực';
    if (!String(reason || '').trim()) errs.reason = 'Nhập lý do / căn cứ';
    const clean = (rows || []).filter(r => Number(r.pct) > 0);
    if (!clean.length) errs.rows = 'Nhập ít nhất một tỷ lệ';
    if (clean.some(r => !Q.shareholder(r.shareholderId) || Number(r.pct) < 0 || Number(r.pct) > 100)) errs.rows = 'Tỷ lệ 0–100% cho cổ đông có trong danh sách';
    if (new Set(clean.map(r => r.shareholderId)).size !== clean.length) errs.rows = 'Trùng cổ đông';
    if (Object.keys(errs).length) fail(errs);
    const cur = S.where('shareRatios', r => r.buildingId === bid && !r.to);
    if (cur.some(r => r.from >= from)) fail({ from: 'Ngày hiệu lực phải sau bộ tỷ lệ đang dùng (từ ' + F.date(cur.map(r => r.from).sort().pop()) + ')' }); // B14
    _.guardEffective(from, 'tỷ lệ góp');
    S.where('shareRatios', r => r.buildingId === bid && !r.to).forEach(r => S.update('shareRatios', r.id, { to: D.addDays(from, -1) }));
    clean.forEach(r => S.add('shareRatios', { buildingId: bid, shareholderId: r.shareholderId, pct: Number(r.pct), from, to: null, reason }));
    const v = SH.valid(clean);
    _.audit('update', 'shareRatio', bid, `Tỷ lệ góp ${(Q.building(bid) || {}).code} từ ${F.date(from)}: Σ ${v.sum}%${v.ok ? '' : ' (chưa đủ 100%)'} – ${reason}`); _.done();
    return v;
  };
  X.lockShareRun = (bid, period, source = 'web') => { _.needMs('2', 'Chia cổ đông (UI-31/32)');
    _.need('shares.lock');
    // B13: chỉ khóa số web (nguồn "như Excel" để đối chiếu, mang lỗi ô C43 – OQ-04); kỳ báo cáo mở lại sau khi khóa → khóa phiên mới
    if (source !== 'web') throw new Error('Chỉ khóa bảng kê theo số Báo cáo tổng web – nguồn "như Excel" chỉ để đối chiếu');
    const prev = lastLocked(bid, period);
    const reopens = reopensOf(period);
    if (prev && !(reopens > (prev.reopens || 0))) throw new Error('Bảng kê kỳ ' + F.periodShort(period) + ' đã khóa');
    // D1: tính và kiểm tra trước, chỉ thay phiên cũ khi phiên mới hợp lệ
    const run = computeRun(bid, period, source); if (!run) throw new Error('Chưa có số báo cáo tòa của kỳ');
    if (!run.valid.ok) throw new Error(`Tổng tỷ lệ tòa ${(Q.building(bid) || {}).code} = ${String(run.valid.sum).replace('.', ',')}%, phải đủ 100% mới khóa bảng kê (E24)`);
    if (!Q.shareLockable(period)) throw new Error('Kỳ ' + F.periodShort(period) + ' chưa khóa số báo cáo – khóa kỳ ở UI-38 trước rồi mới khóa bảng kê (số chia lấy từ báo cáo đã chốt)');
    if (prev) S.update('shareRuns', prev.id, { status: 'superseded', supersededAt: F.nowISO() });
    const version = prev ? (prev.version || 1) + 1 : 1;
    const rec = S.add('shareRuns', { id: 'srun_' + bid + '_' + period + (version > 1 ? '_v' + version : ''), version, reopens, buildingId: bid, period, source, status: 'locked', base: run.base, rows: run.rows, totals: run.totals, rounding: run.rounding, K: run.K, L: run.L, lockedBy: _.who(), lockedAt: F.nowISO() });
    _.audit('lock', 'shareRun', rec.id, `Khóa bảng kê chia ${(Q.building(bid) || {}).code} kỳ ${F.periodShort(period)}: Σ tổng nhận ${F.vnd(run.totals.M)}`); _.done(); return rec;
  };
})(window.TH);
